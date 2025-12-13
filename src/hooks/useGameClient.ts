import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { GameSession, Monster, WSMessage, WSMessageType } from '../types/game';

export interface DiscoveredGame {
    id: string;
    hostName: string;
    address: string;
    port: number;
    playerCount: number;
}

export interface GameClientState {
    isConnected: boolean;
    isConnecting: boolean;
    discoveredGames: DiscoveredGame[];
    isSearching: boolean;
    error: string | null;
}

export interface UseGameClientResult {
    state: GameClientState;
    searchForGames: () => Promise<void>;
    connectToGame: (address: string, port: number) => Promise<void>;
    disconnect: () => void;
    sendMessage: (type: WSMessageType, payload: unknown) => void;
}

// WebSocket client hook for players joining a game
export function useGameClient(): UseGameClientResult {
    const [state, setState] = useState<GameClientState>({
        isConnected: false,
        isConnecting: false,
        discoveredGames: [],
        isSearching: false,
        error: null,
    });

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        localPlayer,
        updateSession,
        syncMonsters,
        setConnected,
    } = useGameStore();

    const handleMessage = useCallback((event: MessageEvent) => {
        try {
            const message: WSMessage = JSON.parse(event.data);

            switch (message.type) {
                case 'sync_state': {
                    const session = message.payload as GameSession;
                    updateSession(session);
                    break;
                }

                case 'sync_monsters': {
                    const monsters = message.payload as Monster[];
                    syncMonsters(monsters);
                    break;
                }

                case 'game_start': {
                    const session = message.payload as GameSession;
                    updateSession({ ...session, status: 'in_progress' });
                    break;
                }

                case 'game_end': {
                    const session = message.payload as GameSession;
                    updateSession({ ...session, status: 'finished' });
                    break;
                }

                default:
                    console.log('Client received:', message.type);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }, [updateSession, syncMonsters]);

    const sendMessage = useCallback((type: WSMessageType, payload: unknown) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not connected');
            return;
        }

        if (!localPlayer) return;

        const message: WSMessage = {
            type,
            payload,
            senderId: localPlayer.id,
            timestamp: Date.now(),
        };

        wsRef.current.send(JSON.stringify(message));
    }, [localPlayer]);

    const connectToGame = useCallback(async (address: string, port: number) => {
        if (!localPlayer) {
            setState(prev => ({ ...prev, error: 'No player created' }));
            return;
        }

        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            const ws = new WebSocket(`ws://${address}:${port}`);

            ws.onopen = () => {
                setState(prev => ({
                    ...prev,
                    isConnected: true,
                    isConnecting: false,
                    error: null,
                }));
                setConnected(true);

                // Send join message
                const joinMessage: WSMessage = {
                    type: 'player_join',
                    payload: localPlayer,
                    senderId: localPlayer.id,
                    timestamp: Date.now(),
                };
                ws.send(JSON.stringify(joinMessage));
            };

            ws.onmessage = handleMessage;

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setState(prev => ({
                    ...prev,
                    error: 'Connection error',
                    isConnecting: false,
                }));
            };

            ws.onclose = () => {
                setState(prev => ({
                    ...prev,
                    isConnected: false,
                    isConnecting: false,
                }));
                setConnected(false);

                // Attempt reconnect
                if (wsRef.current === ws) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (!state.isConnected) {
                            connectToGame(address, port);
                        }
                    }, 3000);
                }
            };

            wsRef.current = ws;
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to connect',
                isConnecting: false,
            }));
        }
    }, [localPlayer, handleMessage, setConnected, state.isConnected]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (wsRef.current) {
            // Send leave message before disconnecting
            if (localPlayer) {
                sendMessage('player_leave', localPlayer.id);
            }
            wsRef.current.close();
            wsRef.current = null;
        }

        setState(prev => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
        }));
        setConnected(false);
        useGameStore.getState().leaveSession();
    }, [localPlayer, sendMessage, setConnected]);

    const searchForGames = useCallback(async () => {
        setState(prev => ({ ...prev, isSearching: true, discoveredGames: [] }));

        try {
            // In a real implementation, this would use mDNS/Zeroconf
            // For now, we'll simulate with a timeout
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulated discovered games (in production, this comes from mDNS)
            const games: DiscoveredGame[] = [];

            setState(prev => ({
                ...prev,
                isSearching: false,
                discoveredGames: games,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                isSearching: false,
                error: 'Failed to search for games',
            }));
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    // Send player updates to server
    useEffect(() => {
        if (state.isConnected && localPlayer) {
            sendMessage('player_update', localPlayer);
        }
    }, [localPlayer, state.isConnected, sendMessage]);

    return {
        state,
        searchForGames,
        connectToGame,
        disconnect,
        sendMessage,
    };
}
