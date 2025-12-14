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
}

export interface UseGameClientResult {
    state: GameClientState;
    searchForGames: () => Promise<void>;
    connectToGame: (gameId: string) => Promise<void>;
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
    });

    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const connectedGameIdRef = useRef<string | null>(null);

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

            // Start polling for session updates
            pollIntervalRef.current = setInterval(() => {
                const currentSession = getServerSession();
                if (currentSession) {
                    updateSession(currentSession);
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

    const disconnect = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }

        if (localPlayer) {
            removeServerClient(localPlayer.id);
        }

        connectedGameIdRef.current = null;

        setState(prev => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
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
        disconnect,
        sendMessage,
    };
}
