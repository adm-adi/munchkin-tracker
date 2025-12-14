/**
 * Real WebSocket client for connecting to host device over network.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import TcpSocket from 'react-native-tcp-socket';
import { useGameStore } from '../stores/gameStore';
import { GameSession, WSMessage, WSMessageType } from '../types/game';

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

    const socketRef = useRef<TcpSocket.Socket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const connectedAddressRef = useRef<{ ip: string; port: number } | null>(null);
    const messageBuffer = useRef<string>('');
    const maxReconnectAttempts = 5;

    const {
        localPlayer,
        updateSession,
        setConnected,
    } = useGameStore();

    // Send message to server
    const sendMessage = useCallback((type: WSMessageType, payload: unknown) => {
        if (!socketRef.current || !localPlayer) return;

        const message: WSMessage = {
            type,
            payload,
            senderId: localPlayer.id,
            timestamp: Date.now(),
        };

        try {
            socketRef.current.write(JSON.stringify(message) + '\n');
        } catch (e) {
            console.warn('Failed to send message:', e);
        }
    }, [localPlayer]);

    // Handle incoming message from server
    const handleServerMessage = useCallback((message: WSMessage) => {
        switch (message.type) {
            case 'sync_state': {
                const session = message.payload as GameSession;
                updateSession(session);
                break;
            }
            // Other message types can be handled here if needed
        }
    }, [updateSession]);

    // Connect to server at IP:port
    const connectToDirectAddress = useCallback(async (ip: string, port: number) => {
        if (!localPlayer) {
            setState(prev => ({ ...prev, error: 'No hay jugador creado' }));
            return;
        }

        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            // Create TCP socket connection
            const socket = TcpSocket.createConnection(
                { host: ip, port },
                () => {
                    console.log('Connected to server:', ip, port);

                    // Send join message
                    const joinMessage: WSMessage = {
                        type: 'player_join',
                        payload: localPlayer,
                        senderId: localPlayer.id,
                        timestamp: Date.now(),
                    };
                    socket.write(JSON.stringify(joinMessage) + '\n');

                    setState(prev => ({
                        ...prev,
                        isConnected: true,
                        isConnecting: false,
                        error: null,
                        reconnectAttempts: 0,
                    }));
                    setConnected(true);
                    connectedAddressRef.current = { ip, port };
                }
            );

            socketRef.current = socket;

            // Handle incoming data
            socket.on('data', (data) => {
                try {
                    // Handle potential message fragmentation
                    messageBuffer.current += data.toString();
                    const messages = messageBuffer.current.split('\n');

                    // Keep incomplete message in buffer
                    messageBuffer.current = messages.pop() || '';

                    messages.filter(Boolean).forEach(msgStr => {
                        try {
                            const msg = JSON.parse(msgStr) as WSMessage;
                            handleServerMessage(msg);
                        } catch (e) {
                            console.warn('Failed to parse message:', msgStr);
                        }
                    });
                } catch (e) {
                    console.warn('Error processing data:', e);
                }
            });

            // Handle connection close
            socket.on('close', () => {
                console.log('Disconnected from server');
                handleConnectionLost();
            });

            // Handle errors
            socket.on('error', (error) => {
                console.error('Socket error:', error);
                setState(prev => ({
                    ...prev,
                    error: 'Error de conexión: ' + (error.message || 'Desconocido'),
                    isConnecting: false,
                    isConnected: false,
                }));
            });

        } catch (error) {
            console.error('Connection failed:', error);
            setState(prev => ({
                ...prev,
                error: 'No se pudo conectar al host. ¿Está la partida activa?',
                isConnecting: false,
            }));
        }
    }, [localPlayer, setConnected, handleServerMessage]);

    // Handle connection lost - attempt reconnection
    const handleConnectionLost = useCallback(() => {
        const address = connectedAddressRef.current;

        setState(prev => {
            if (prev.reconnectAttempts >= maxReconnectAttempts) {
                return {
                    ...prev,
                    isConnected: false,
                    isReconnecting: false,
                    error: 'Conexión perdida. No se pudo reconectar.',
                };
            }
            return {
                ...prev,
                isConnected: false,
                isReconnecting: true,
                reconnectAttempts: prev.reconnectAttempts + 1,
            };
        });

        if (address && state.reconnectAttempts < maxReconnectAttempts) {
            // Exponential backoff
            const delay = Math.min(1000 * Math.pow(2, state.reconnectAttempts), 10000);
            reconnectTimeoutRef.current = setTimeout(() => {
                connectToDirectAddress(address.ip, address.port);
            }, delay);
        }
    }, [state.reconnectAttempts, connectToDirectAddress]);

    // Connect to discovered game
    const connectToGame = useCallback(async (gameId: string) => {
        const game = state.discoveredGames.find(g => g.id === gameId);
        if (game) {
            await connectToDirectAddress(game.address, game.port);
        } else {
            setState(prev => ({ ...prev, error: 'Partida no encontrada' }));
        }
    }, [state.discoveredGames, connectToDirectAddress]);

    // Disconnect from server
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (socketRef.current) {
            // Send leave message
            if (localPlayer) {
                try {
                    sendMessage('player_leave', { playerId: localPlayer.id });
                } catch (e) {
                    // Ignore
                }
            }

            try {
                socketRef.current.destroy();
            } catch (e) {
                // Ignore
            }
            socketRef.current = null;
        }

        connectedAddressRef.current = null;
        messageBuffer.current = '';

        setState({
            isConnected: false,
            isConnecting: false,
            discoveredGames: [],
            isSearching: false,
            error: null,
            reconnectAttempts: 0,
            isReconnecting: false,
        });
        setConnected(false);
        useGameStore.getState().leaveSession();
    }, [localPlayer, setConnected, sendMessage]);

    // Search for games (placeholder - could use UDP broadcast)
    const searchForGames = useCallback(async () => {
        setState(prev => ({ ...prev, isSearching: true, discoveredGames: [] }));

        // Note: Actual game discovery would require UDP broadcast
        // For now, games are joined via QR code scanning
        await new Promise(resolve => setTimeout(resolve, 1000));

        setState(prev => ({
            ...prev,
            isSearching: false,
        }));
    }, []);

    // Send player updates when local player changes
    useEffect(() => {
        if (state.isConnected && localPlayer) {
            sendMessage('player_update', {
                playerId: localPlayer.id,
                level: localPlayer.level,
                gearBonus: localPlayer.gearBonus,
                race: localPlayer.race,
                gameClass: localPlayer.gameClass,
                isDead: localPlayer.isDead,
            });
        }
    }, [
        state.isConnected,
        localPlayer?.level,
        localPlayer?.gearBonus,
        localPlayer?.race,
        localPlayer?.gameClass,
        localPlayer?.isDead,
        sendMessage,
    ]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        state,
        searchForGames,
        connectToGame,
        connectToDirectAddress,
        disconnect,
        sendMessage,
    };
}
