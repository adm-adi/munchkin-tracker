import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { APP_CONFIG, WSMessageType } from '../types/game';
import { addServerClient, getServerAddress, getServerSession, removeServerClient } from './useGameServer';

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
    reconnectAttempts: number;
    isReconnecting: boolean;
}

export interface UseGameClientResult {
    state: GameClientState;
    searchForGames: () => Promise<void>;
    connectToGame: (gameId: string) => Promise<void>;
    connectToDirectAddress: (ip: string, port: number) => Promise<void>;
    disconnect: () => void;
    sendMessage: (type: WSMessageType, payload: unknown) => void;
}

// Scan common local network ranges for active games
async function scanLocalNetwork(): Promise<DiscoveredGame[]> {
    const games: DiscoveredGame[] = [];

    try {
        // Check if there's a local server running (same device or shared state)
        const serverSession = getServerSession();
        const serverAddress = getServerAddress();

        if (serverSession && serverAddress) {
            const hostPlayer = serverSession.players.find(p => p.isHost);
            games.push({
                id: serverSession.id,
                hostName: hostPlayer?.name || 'Partida',
                address: serverAddress,
                port: APP_CONFIG.WS_PORT,
                playerCount: serverSession.players.length,
            });
        }
    } catch (error) {
        console.error('Error scanning network:', error);
    }

    return games;
}

// WebSocket client hook for players joining a game
export function useGameClient(): UseGameClientResult {
    const [state, setState] = useState<GameClientState>({
        isConnected: false,
        isConnecting: false,
        discoveredGames: [],
        isSearching: false,
        error: null,
        reconnectAttempts: 0,
        isReconnecting: false,
    });

    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const connectedGameIdRef = useRef<string | null>(null);
    const maxReconnectAttempts = 5;

    const {
        localPlayer,
        updateSession,
        syncMonsters,
        setConnected,
        joinSession,
    } = useGameStore();

    const sendMessage = useCallback((type: WSMessageType, payload: unknown) => {
        // In this simplified version, we update the shared session directly
        const serverSession = getServerSession();
        if (serverSession && localPlayer) {
            // The server will pick up changes through polling
            console.log('Client sending:', type, payload);
        }
    }, [localPlayer]);

    const connectToGame = useCallback(async (gameId: string) => {
        if (!localPlayer) {
            setState(prev => ({ ...prev, error: 'No player created' }));
            return;
        }

        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            const serverSession = getServerSession();

            if (!serverSession || serverSession.id !== gameId) {
                throw new Error('Game not found');
            }

            // Add ourselves to the server's session
            addServerClient(localPlayer.id);

            // Join the session
            joinSession(serverSession, localPlayer);
            connectedGameIdRef.current = gameId;

            setState(prev => ({
                ...prev,
                isConnected: true,
                isConnecting: false,
                error: null,
            }));
            setConnected(true);

            // Start polling for session updates with connection health check
            pollIntervalRef.current = setInterval(() => {
                const currentSession = getServerSession();
                if (currentSession) {
                    updateSession(currentSession);
                    // Reset reconnect attempts on successful poll
                    setState(prev => ({ ...prev, reconnectAttempts: 0, isReconnecting: false }));
                } else if (connectedGameIdRef.current) {
                    // Session lost - trigger reconnection
                    handleConnectionLost();
                }
            }, 500);

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to connect',
                isConnecting: false,
            }));
        }
    }, [localPlayer, joinSession, setConnected, updateSession]);

    const connectToDirectAddress = useCallback(async (ip: string, port: number) => {
        if (!localPlayer) return;

        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            // Check if there's a server running that we can connect to
            // In actual network mode, we'd use WebSocket to connect to ip:port
            // For shared-state simulation, we check if ANY server is running
            const serverSession = getServerSession();

            // If a server is running, allow connection (simulated same-device or LAN)
            if (serverSession) {
                addServerClient(localPlayer.id);
                joinSession(serverSession, localPlayer);
                connectedGameIdRef.current = serverSession.id;

                setState(prev => ({
                    ...prev,
                    isConnected: true,
                    isConnecting: false,
                    error: null,
                }));
                setConnected(true);

                // Start polling
                pollIntervalRef.current = setInterval(() => {
                    const currentSession = getServerSession();
                    if (currentSession) {
                        updateSession(currentSession);
                        setState(prev => ({ ...prev, reconnectAttempts: 0, isReconnecting: false }));
                    } else if (connectedGameIdRef.current) {
                        handleConnectionLost();
                    }
                }, 500);
            } else {
                throw new Error('No active game found');
            }

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: 'No se encontró partida activa. ¿El host ha creado la partida?',
                isConnecting: false,
            }));
        }
    }, [localPlayer, joinSession, setConnected, updateSession]);

    // Handle connection lost - attempt to reconnect
    const handleConnectionLost = useCallback(() => {
        const gameId = connectedGameIdRef.current;
        if (!gameId) return;

        setState(prev => {
            if (prev.reconnectAttempts >= maxReconnectAttempts) {
                // Max attempts reached - disconnect fully
                return {
                    ...prev,
                    isConnected: false,
                    isReconnecting: false,
                    error: 'Conexión perdida. No se pudo reconectar.',
                };
            }
            return {
                ...prev,
                isReconnecting: true,
                reconnectAttempts: prev.reconnectAttempts + 1,
            };
        });

        // Try to reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, state.reconnectAttempts), 10000);
        reconnectTimeoutRef.current = setTimeout(() => {
            const serverSession = getServerSession();
            if (serverSession && serverSession.id === gameId) {
                // Session recovered
                updateSession(serverSession);
                setState(prev => ({
                    ...prev,
                    isConnected: true,
                    isReconnecting: false,
                    reconnectAttempts: 0,
                    error: null,
                }));
            }
        }, delay);
    }, [state.reconnectAttempts, updateSession]);

    const disconnect = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (localPlayer) {
            removeServerClient(localPlayer.id);
        }

        connectedGameIdRef.current = null;

        setState(prev => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            isReconnecting: false,
            reconnectAttempts: 0,
        }));
        setConnected(false);
        useGameStore.getState().leaveSession();
    }, [localPlayer, setConnected]);

    const searchForGames = useCallback(async () => {
        setState(prev => ({ ...prev, isSearching: true, discoveredGames: [] }));

        try {
            // Small delay to show searching state
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Scan for local games
            const games = await scanLocalNetwork();

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

    // Periodic re-scan while on join screen
    useEffect(() => {
        if (!state.isConnected && !state.isConnecting) {
            const searchInterval = setInterval(() => {
                scanLocalNetwork().then(games => {
                    setState(prev => ({
                        ...prev,
                        discoveredGames: games,
                    }));
                });
            }, 2000);

            return () => clearInterval(searchInterval);
        }
    }, [state.isConnected, state.isConnecting]);

    return {
        state,
        searchForGames,
        connectToGame,
        connectToDirectAddress,
        disconnect,
        sendMessage,
    };
}
