import * as Network from 'expo-network';
import { useCallback, useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { APP_CONFIG, GameSession, WSMessageType } from '../types/game';

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

// Simple polling-based multiplayer for Expo compatibility
// Since React Native can't run a real WebSocket server without native modules,
// we use a shared state approach with periodic sync

// Global state for the "server" - shared between all hooks
let serverSession: GameSession | null = null;
let serverAddress: string | null = null;
let serverClients: Set<string> = new Set();

export function getServerSession(): GameSession | null {
    return serverSession;
}

export function setServerSession(session: GameSession | null): void {
    serverSession = session;
}

export function getServerAddress(): string | null {
    return serverAddress;
}

export function addServerClient(clientId: string): void {
    serverClients.add(clientId);
}

export function removeServerClient(clientId: string): void {
    serverClients.delete(clientId);
}

export function getServerClients(): string[] {
    return Array.from(serverClients);
}

// WebSocket server hook for the host
export function useGameServer(): UseGameServerResult {
    const [state, setState] = useState<GameServerState>({
        isRunning: false,
        address: null,
        port: APP_CONFIG.WS_PORT,
        error: null,
        connectedClients: 0,
    });

    const {
        session,
        updateSession,
        localPlayer,
        customMonsters,
        createSession,
    } = useGameStore();

    const broadcastMessage = useCallback((type: WSMessageType, payload: unknown) => {
        // In this simplified version, we store the session globally
        // Connected clients will poll for updates
        if (session) {
            setServerSession(session);
        }
    }, [session]);

    const startServer = useCallback(async () => {
        try {
            // Get the device's local IP address
            const ip = await Network.getIpAddressAsync();
            serverAddress = ip;
            serverClients.clear();

            // Create session
            createSession();

            setState(prev => ({
                ...prev,
                isRunning: true,
                address: ip,
                error: null,
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to start server',
            }));
        }
    }, [createSession]);

    const stopServer = useCallback(() => {
        serverSession = null;
        serverAddress = null;
        serverClients.clear();

        setState({
            isRunning: false,
            address: null,
            port: APP_CONFIG.WS_PORT,
            error: null,
            connectedClients: 0,
        });

        useGameStore.getState().leaveSession();
    }, []);

    // Keep server session in sync with local session
    useEffect(() => {
        if (state.isRunning && session) {
            setServerSession(session);
        }
    }, [session, state.isRunning]);

    // Update connected clients count
    useEffect(() => {
        if (state.isRunning) {
            const interval = setInterval(() => {
                setState(prev => ({
                    ...prev,
                    connectedClients: serverClients.size,
                }));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [state.isRunning]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (state.isRunning) {
                stopServer();
            }
        };
    }, [state.isRunning, stopServer]);

    return {
        state,
        startServer,
        stopServer,
        broadcastMessage,
    };
}
