import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { APP_CONFIG, GameSession, Monster, Player, WSMessage, WSMessageType } from '../types/game';

// Simple WebSocket-like server using React Native's networking
// Note: For production, consider using a proper WebSocket library

export interface GameServerState {
    isRunning: boolean;
    address: string | null;
    port: number;
    error: string | null;
}

export interface UseGameServerResult {
    state: GameServerState;
    startServer: () => Promise<void>;
    stopServer: () => void;
    broadcastMessage: (type: WSMessageType, payload: unknown) => void;
}

// WebSocket server hook for the host
export function useGameServer(): UseGameServerResult {
    const [state, setState] = useState<GameServerState>({
        isRunning: false,
        address: null,
        port: APP_CONFIG.WS_PORT,
        error: null,
    });

    const clientsRef = useRef<Set<WebSocket>>(new Set());
    const serverRef = useRef<any>(null);

    const {
        session,
        updateSession,
        localPlayer,
        customMonsters,
    } = useGameStore();

    const broadcastMessage = useCallback((type: WSMessageType, payload: unknown) => {
        if (!localPlayer) return;

        const message: WSMessage = {
            type,
            payload,
            senderId: localPlayer.id,
            timestamp: Date.now(),
        };

        const messageStr = JSON.stringify(message);
        clientsRef.current.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageStr);
            }
        });
    }, [localPlayer]);

    const handleClientMessage = useCallback((data: string, client: WebSocket) => {
        try {
            const message: WSMessage = JSON.parse(data);

            switch (message.type) {
                case 'player_join': {
                    const player = message.payload as Player;
                    if (session && session.players.length < APP_CONFIG.MAX_PLAYERS) {
                        const updatedSession: GameSession = {
                            ...session,
                            players: [...session.players, { ...player, isConnected: true }],
                        };
                        updateSession(updatedSession);
                        broadcastMessage('sync_state', updatedSession);
                    }
                    break;
                }

                case 'player_update': {
                    const updatedPlayer = message.payload as Player;
                    if (session) {
                        const updatedPlayers = session.players.map(p =>
                            p.id === updatedPlayer.id ? updatedPlayer : p
                        );
                        const updatedSession = { ...session, players: updatedPlayers };
                        updateSession(updatedSession);
                        broadcastMessage('sync_state', updatedSession);
                    }
                    break;
                }

                case 'player_leave': {
                    const playerId = message.payload as string;
                    if (session) {
                        const updatedPlayers = session.players.filter(p => p.id !== playerId);
                        const updatedSession = { ...session, players: updatedPlayers };
                        updateSession(updatedSession);
                        broadcastMessage('sync_state', updatedSession);
                    }
                    break;
                }

                case 'combat_start':
                case 'combat_update':
                case 'combat_end': {
                    if (session) {
                        const updatedSession = { ...session, currentCombat: message.payload as any };
                        updateSession(updatedSession);
                        broadcastMessage('sync_state', updatedSession);
                    }
                    break;
                }

                case 'monster_added': {
                    const monster = message.payload as Monster;
                    // Sync new monster to all clients
                    broadcastMessage('sync_monsters', [...customMonsters, monster]);
                    break;
                }

                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }, [session, updateSession, broadcastMessage, customMonsters]);

    const startServer = useCallback(async () => {
        try {
            // In React Native, we'll use a different approach
            // For now, we'll simulate the server with local state
            // The actual WebSocket implementation will be done with expo-server-sdk
            // or a custom native module

            setState(prev => ({
                ...prev,
                isRunning: true,
                address: 'localhost', // Will be replaced with actual IP
                error: null,
            }));

            // Create session automatically when server starts
            useGameStore.getState().createSession();

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to start server',
            }));
        }
    }, []);

    const stopServer = useCallback(() => {
        clientsRef.current.forEach(client => client.close());
        clientsRef.current.clear();

        if (serverRef.current) {
            serverRef.current.close();
            serverRef.current = null;
        }

        setState({
            isRunning: false,
            address: null,
            port: APP_CONFIG.WS_PORT,
            error: null,
        });

        useGameStore.getState().leaveSession();
    }, []);

    // Sync session changes to clients
    useEffect(() => {
        if (state.isRunning && session) {
            broadcastMessage('sync_state', session);
        }
    }, [session, state.isRunning, broadcastMessage]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopServer();
        };
    }, [stopServer]);

    return {
        state,
        startServer,
        stopServer,
        broadcastMessage,
    };
}
