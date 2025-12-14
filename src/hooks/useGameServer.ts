/**
 * Real WebSocket-like server using TCP sockets for multi-device networking.
 * The HOST device runs this server, clients connect via IP:port.
 */

import * as Network from 'expo-network';
import { useCallback, useEffect, useRef, useState } from 'react';
import TcpSocket from 'react-native-tcp-socket';
import { useGameStore } from '../stores/gameStore';
import { APP_CONFIG, GameSession, Player, WSMessage, WSMessageType } from '../types/game';

export interface GameServerState {
    isRunning: boolean;
    address: string | null;
    port: number;
    error: string | null;
    connectedClients: number;
}

export interface UseGameServerResult {
    state: GameServerState;
    startServer: () => Promise<void>;
    stopServer: () => void;
    broadcastMessage: (type: WSMessageType, payload: unknown) => void;
}

// Track connected clients
interface ConnectedClient {
    id: string;
    socket: TcpSocket.Socket;
    playerId?: string;
}

export function useGameServer(): UseGameServerResult {
    const [state, setState] = useState<GameServerState>({
        isRunning: false,
        address: null,
        port: APP_CONFIG.WS_PORT,
        error: null,
        connectedClients: 0,
    });

    const serverRef = useRef<TcpSocket.Server | null>(null);
    const clientsRef = useRef<Map<string, ConnectedClient>>(new Map());
    const messageBuffer = useRef<string>('');

    const {
        session,
        localPlayer,
        createSession,
        updateSession,
        joinSession,
    } = useGameStore();

    // Broadcast message to all connected clients
    const broadcastMessage = useCallback((type: WSMessageType, payload: unknown) => {
        if (!localPlayer) return;

        const message: WSMessage = {
            type,
            payload,
            senderId: localPlayer.id,
            timestamp: Date.now(),
        };

        const data = JSON.stringify(message) + '\n';

        clientsRef.current.forEach((client) => {
            try {
                client.socket.write(data);
            } catch (e) {
                console.warn('Failed to send to client:', client.id);
            }
        });
    }, [localPlayer]);

    // Broadcast current session state to all clients
    const broadcastSession = useCallback(() => {
        const currentSession = useGameStore.getState().session;
        if (currentSession) {
            broadcastMessage('sync_state', currentSession);
        }
    }, [broadcastMessage]);

    // Handle incoming message from a client
    const handleClientMessage = useCallback((clientId: string, message: WSMessage) => {
        const client = clientsRef.current.get(clientId);
        if (!client) return;

        const { session: currentSession } = useGameStore.getState();
        if (!currentSession) return;

        switch (message.type) {
            case 'player_join': {
                const player = message.payload as Player;
                // Validate and add player to session
                if (!currentSession.players.find(p => p.id === player.id)) {
                    const updatedSession = {
                        ...currentSession,
                        players: [...currentSession.players, { ...player, isConnected: true }],
                    };
                    updateSession(updatedSession);
                    client.playerId = player.id;
                    // Broadcast updated session to all
                    setTimeout(broadcastSession, 100);
                }
                break;
            }

            case 'player_update': {
                const update = message.payload as Partial<Player> & { playerId: string };
                // SECURITY: Only allow updating own player
                if (update.playerId === client.playerId || update.playerId === message.senderId) {
                    const updatedPlayers = currentSession.players.map(p => {
                        if (p.id === update.playerId) {
                            return { ...p, ...update, id: p.id, isHost: p.isHost }; // Preserve id and host status
                        }
                        return p;
                    });
                    updateSession({ ...currentSession, players: updatedPlayers });
                    setTimeout(broadcastSession, 50);
                }
                break;
            }

            case 'combat_start':
            case 'combat_update':
            case 'combat_end':
            case 'turn_change':
            case 'dice_roll':
                // These are forwarded as-is, server syncs state after
                updateSession(message.payload as GameSession);
                setTimeout(broadcastSession, 50);
                break;

            case 'player_leave': {
                const playerId = message.senderId;
                const updatedPlayers = currentSession.players.filter(p => p.id !== playerId);
                updateSession({ ...currentSession, players: updatedPlayers });
                clientsRef.current.delete(clientId);
                setState(prev => ({ ...prev, connectedClients: clientsRef.current.size }));
                setTimeout(broadcastSession, 100);
                break;
            }
        }
    }, [updateSession, broadcastSession]);

    // Start the TCP server
    const startServer = useCallback(async () => {
        try {
            // Get local IP
            const ip = await Network.getIpAddressAsync();

            // Create the session first
            createSession();

            // Create TCP server
            const server = TcpSocket.createServer((socket) => {
                const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
                console.log('Client connected:', clientId);

                // Store client
                clientsRef.current.set(clientId, {
                    id: clientId,
                    socket,
                });

                setState(prev => ({
                    ...prev,
                    connectedClients: clientsRef.current.size,
                }));

                // Send current session to new client
                const currentSession = useGameStore.getState().session;
                if (currentSession) {
                    const welcome: WSMessage = {
                        type: 'sync_state',
                        payload: currentSession,
                        senderId: 'server',
                        timestamp: Date.now(),
                    };
                    socket.write(JSON.stringify(welcome) + '\n');
                }

                // Handle data from client
                socket.on('data', (data) => {
                    try {
                        const messages = data.toString().split('\n').filter(Boolean);
                        messages.forEach(msgStr => {
                            const msg = JSON.parse(msgStr) as WSMessage;
                            handleClientMessage(clientId, msg);
                        });
                    } catch (e) {
                        console.warn('Invalid message from client:', e);
                    }
                });

                // Handle client disconnect
                socket.on('close', () => {
                    console.log('Client disconnected:', clientId);
                    const client = clientsRef.current.get(clientId);
                    if (client?.playerId) {
                        // Remove player from session
                        const currentSession = useGameStore.getState().session;
                        if (currentSession) {
                            const updatedPlayers = currentSession.players.filter(
                                p => p.id !== client.playerId
                            );
                            updateSession({ ...currentSession, players: updatedPlayers });
                            setTimeout(broadcastSession, 100);
                        }
                    }
                    clientsRef.current.delete(clientId);
                    setState(prev => ({
                        ...prev,
                        connectedClients: clientsRef.current.size,
                    }));
                });

                socket.on('error', (error) => {
                    console.warn('Client socket error:', error);
                });
            });

            server.listen({ port: APP_CONFIG.WS_PORT, host: '0.0.0.0' }, () => {
                console.log(`Server listening on ${ip}:${APP_CONFIG.WS_PORT}`);
            });

            serverRef.current = server;

            setState({
                isRunning: true,
                address: ip,
                port: APP_CONFIG.WS_PORT,
                error: null,
                connectedClients: 0,
            });

        } catch (error) {
            console.error('Failed to start server:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to start server',
            }));
        }
    }, [createSession, handleClientMessage, updateSession, broadcastSession]);

    // Stop the server
    const stopServer = useCallback(() => {
        // Close all client connections
        clientsRef.current.forEach((client) => {
            try {
                client.socket.destroy();
            } catch (e) {
                // Ignore
            }
        });
        clientsRef.current.clear();

        // Close server
        if (serverRef.current) {
            serverRef.current.close();
            serverRef.current = null;
        }

        setState({
            isRunning: false,
            address: null,
            port: APP_CONFIG.WS_PORT,
            error: null,
            connectedClients: 0,
        });

        useGameStore.getState().leaveSession();
    }, []);

    // Broadcast session changes automatically
    useEffect(() => {
        if (state.isRunning && session) {
            broadcastSession();
        }
    }, [session, state.isRunning, broadcastSession]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (serverRef.current) {
                stopServer();
            }
        };
    }, [stopServer]);

    return {
        state,
        startServer,
        stopServer,
        broadcastMessage,
    };
}

// Legacy exports for compatibility (no longer used internally)
export function getServerSession(): GameSession | null {
    return useGameStore.getState().session;
}

export function setServerSession(session: GameSession | null): void {
    if (session) {
        useGameStore.getState().updateSession(session);
    }
}

export function getServerAddress(): string | null {
    return null; // No longer a global
}

export function addServerClient(clientId: string): void {
    // No-op for compatibility
}

export function removeServerClient(clientId: string): void {
    // No-op for compatibility
}

export function getServerClients(): string[] {
    return [];
}
