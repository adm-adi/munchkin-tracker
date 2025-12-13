import { create } from 'zustand';

export interface Player {
    id: string;
    name: string;
    level: number;
    gear: number;
    gender: 'Male' | 'Female';
    avatarUrl?: string; // For later
}

interface GameState {
    myId: string | null;
    isHost: boolean;
    hostIp: string | null;
    players: Player[];
    logs: string[];
    gameState: 'LOBBY' | 'GAME';

    setMyId: (id: string) => void;
    setIsHost: (isHost: boolean) => void;
    setHostIp: (ip: string) => void;
    setPlayers: (players: Player[]) => void;
    setGameState: (state: 'LOBBY' | 'GAME') => void;
    updatePlayer: (id: string, updates: Partial<Player>) => void;
    addLog: (msg: string) => void;

    // Actions that triggered locally
    incrementLevel: () => void;
    decrementLevel: () => void;
    incrementGear: () => void;
    decrementGear: () => void;
}

export const useGameStore = create<GameState>((set) => ({
    myId: null,
    isHost: false,
    hostIp: null,
    players: [],
    logs: [],
    gameState: 'LOBBY',

    setMyId: (id) => set({ myId: id }),
    setIsHost: (isHost) => set({ isHost }),
    setHostIp: (ip) => set({ hostIp: ip }),
    setPlayers: (players) => set({ players }),
    setGameState: (gs) => set({ gameState: gs }),

    updatePlayer: (id, updates) => set((state) => ({
        players: state.players.map(p => p.id === id ? { ...p, ...updates } : p)
    })),

    addLog: (msg) => set(state => ({ logs: [...state.logs, msg] })),

    incrementLevel: () => set(state => {
        const p = state.players.find(pl => pl.id === state.myId);
        if (!p) return {};
        // Actual logic will be handled by NetworkManager middleware/listener usually,
        // but for optimistic UI we can update here.
        // However, the "Source of Truth" should be the Host.
        // We will update locally and let NetworkManager broadcast.
        return {
            players: state.players.map(pl => pl.id === state.myId ? { ...pl, level: pl.level + 1 } : pl)
        };
    }),

    decrementLevel: () => set(state => {
        const p = state.players.find(pl => pl.id === state.myId);
        if (!p) return {};
        return {
            players: state.players.map(pl => pl.id === state.myId ? { ...pl, level: Math.max(1, pl.level - 1) } : pl)
        };
    }),

    incrementGear: () => set(state => {
        return {
            players: state.players.map(pl => pl.id === state.myId ? { ...pl, gear: pl.gear + 1 } : pl)
        };
    }),

    decrementGear: () => set(state => {
        return {
            players: state.players.map(pl => pl.id === state.myId ? { ...pl, gear: pl.gear - 1 } : pl)
        };
    }),
}));
