import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ALL_EXPANSION_MONSTERS, BASE_MONSTERS } from '../data/monsters';
import {
    Combat,
    CombatMonster,
    GameClass,
    GameSession,
    Monster,
    Player,
    Race
} from '../types/game';

// Generate unique ID
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface GameState {
    // Local player
    localPlayer: Player | null;

    // Current session
    session: GameSession | null;

    // Custom monsters database
    customMonsters: Monster[];

    // Connection state
    isHost: boolean;
    isConnected: boolean;
    serverAddress: string | null;

    // Actions
    createPlayer: (name: string) => Player;
    updateLocalPlayer: (updates: Partial<Player>) => void;

    // Session actions
    createSession: () => GameSession;
    joinSession: (session: GameSession, player: Player) => void;
    leaveSession: () => void;
    updateSession: (session: GameSession) => void;

    // Player in session actions
    setPlayerLevel: (level: number) => void;
    setPlayerGear: (gear: number) => void;
    setPlayerRace: (race: Race | null) => void;
    setPlayerClass: (gameClass: GameClass | null) => void;

    // Combat actions
    startCombat: () => void;
    addMonsterToCombat: (monster: Monster, enhancers?: number) => void;
    removeMonsterFromCombat: (index: number) => void;
    addHelperToCombat: (playerId: string) => void;
    removeHelperFromCombat: (playerId: string) => void;
    resolveCombat: (victory: boolean) => void;
    cancelCombat: () => void;

    // Monster database
    addCustomMonster: (monster: Monster) => void;
    removeCustomMonster: (monsterId: string) => void;
    getAllMonsters: () => Monster[];
    syncMonsters: (monsters: Monster[]) => void;

    // Turn system
    startGame: () => void;
    nextTurn: () => void;
    setTimerConfig: (enabled: boolean, duration: number) => void;

    // Dice
    rollDice: (reason?: string) => number;

    // Death system
    killPlayer: (playerId: string) => void;
    respawnPlayer: (playerId: string) => void;
    setPlayerFleeingStatus: (playerId: string, isFleeing: boolean) => void;

    // Connection
    setHostMode: (isHost: boolean, address?: string) => void;
    setConnected: (connected: boolean) => void;

    // Reset
    reset: () => void;
}

const initialState = {
    localPlayer: null,
    session: null,
    customMonsters: [],
    isHost: false,
    isConnected: false,
    serverAddress: null,
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            ...initialState,

            createPlayer: (name: string) => {
                const player: Player = {
                    id: generateId(),
                    name,
                    level: 1,
                    gearBonus: 0,
                    race: null,
                    secondRace: null,
                    gameClass: null,
                    secondClass: null,
                    sex: 'male',
                    isHost: false,
                    isConnected: true,
                    isDead: false,
                };
                set({ localPlayer: player });
                return player;
            },

            updateLocalPlayer: (updates: Partial<Player>) => {
                const { localPlayer, session } = get();
                if (!localPlayer) return;

                const updatedPlayer = { ...localPlayer, ...updates };
                set({ localPlayer: updatedPlayer });

                // Also update in session if exists
                if (session) {
                    const updatedPlayers = session.players.map(p =>
                        p.id === localPlayer.id ? updatedPlayer : p
                    );
                    set({ session: { ...session, players: updatedPlayers } });
                }
            },

            createSession: () => {
                const { localPlayer } = get();
                if (!localPlayer) throw new Error('No local player');


                const hostPlayer = { ...localPlayer, isHost: true };
                const session: GameSession = {
                    id: generateId(),
                    hostId: hostPlayer.id,
                    createdAt: Date.now(),
                    players: [hostPlayer],
                    currentCombat: null,
                    status: 'lobby',
                    winnerId: null,
                    // Turn system
                    currentTurnPlayerId: null,
                    turnNumber: 0,
                    // Timer configuration
                    timerEnabled: false,
                    timerDuration: 60,
                    turnStartedAt: null,
                    // Dice rolls
                    diceRolls: [],
                };

                set({
                    localPlayer: hostPlayer,
                    session,
                    isHost: true
                });
                return session;
            },

            joinSession: (session: GameSession, player: Player) => {
                const connectedPlayer = { ...player, isConnected: true };
                const updatedSession = {
                    ...session,
                    players: [...session.players, connectedPlayer],
                };
                set({
                    session: updatedSession,
                    localPlayer: connectedPlayer,
                    isHost: false,
                    isConnected: true,
                });
            },

            leaveSession: () => {
                set({
                    session: null,
                    isHost: false,
                    isConnected: false,
                    serverAddress: null,
                });
            },

            updateSession: (session: GameSession) => {
                const { localPlayer } = get();
                // Update local player reference if in session
                if (localPlayer) {
                    const updatedLocalPlayer = session.players.find(p => p.id === localPlayer.id);
                    if (updatedLocalPlayer) {
                        set({ session, localPlayer: updatedLocalPlayer });
                        return;
                    }
                }
                set({ session });
            },

            setPlayerLevel: (level: number) => {
                const clampedLevel = Math.max(1, Math.min(10, level));
                get().updateLocalPlayer({ level: clampedLevel });
            },

            setPlayerGear: (gear: number) => {
                const clampedGear = Math.max(0, gear);
                get().updateLocalPlayer({ gearBonus: clampedGear });
            },

            setPlayerRace: (race: Race | null) => {
                get().updateLocalPlayer({ race });
            },

            setPlayerClass: (gameClass: GameClass | null) => {
                get().updateLocalPlayer({ gameClass });
            },

            startCombat: () => {
                const { localPlayer, session } = get();
                if (!localPlayer || !session) return;

                const combat: Combat = {
                    id: generateId(),
                    mainPlayerId: localPlayer.id,
                    helperIds: [],
                    monsters: [],
                    playerBonus: 0,
                    monstersBonus: 0,
                    status: 'preparing',
                    startedAt: Date.now(),
                };

                set({ session: { ...session, currentCombat: combat } });
            },

            addMonsterToCombat: (monster: Monster, enhancers = 0) => {
                const { session } = get();
                if (!session?.currentCombat) return;

                const combatMonster: CombatMonster = { monster, enhancers };
                const updatedCombat: Combat = {
                    ...session.currentCombat,
                    monsters: [...session.currentCombat.monsters, combatMonster],
                    status: 'in_progress',
                };

                set({ session: { ...session, currentCombat: updatedCombat } });
            },

            removeMonsterFromCombat: (index: number) => {
                const { session } = get();
                if (!session?.currentCombat) return;

                const monsters = [...session.currentCombat.monsters];
                monsters.splice(index, 1);

                set({
                    session: {
                        ...session,
                        currentCombat: { ...session.currentCombat, monsters }
                    }
                });
            },

            addHelperToCombat: (playerId: string) => {
                const { session } = get();
                if (!session?.currentCombat) return;
                if (session.currentCombat.helperIds.includes(playerId)) return;

                const updatedCombat: Combat = {
                    ...session.currentCombat,
                    helperIds: [...session.currentCombat.helperIds, playerId],
                };

                set({ session: { ...session, currentCombat: updatedCombat } });
            },

            removeHelperFromCombat: (playerId: string) => {
                const { session } = get();
                if (!session?.currentCombat) return;

                const helperIds = session.currentCombat.helperIds.filter(id => id !== playerId);
                set({
                    session: {
                        ...session,
                        currentCombat: { ...session.currentCombat, helperIds }
                    }
                });
            },

            resolveCombat: (victory: boolean) => {
                const { session, localPlayer } = get();
                if (!session?.currentCombat || !localPlayer) return;

                if (victory) {
                    // Calculate levels gained
                    const levelsGained = session.currentCombat.monsters.reduce(
                        (sum, cm) => sum + cm.monster.levelsGranted, 0
                    );

                    // Update player level
                    const newLevel = Math.min(10, localPlayer.level + levelsGained);
                    get().updateLocalPlayer({ level: newLevel });

                    // Check for winner
                    if (newLevel >= 10) {
                        set({
                            session: {
                                ...session,
                                currentCombat: null,
                                status: 'finished',
                                winnerId: localPlayer.id,
                            }
                        });
                        return;
                    }
                }

                set({
                    session: {
                        ...session,
                        currentCombat: {
                            ...session.currentCombat,
                            status: victory ? 'victory' : 'defeat'
                        }
                    }
                });

                // Clear combat after a delay
                setTimeout(() => {
                    const currentSession = get().session;
                    if (currentSession) {
                        set({ session: { ...currentSession, currentCombat: null } });
                    }
                }, 2000);
            },

            cancelCombat: () => {
                const { session } = get();
                if (!session) return;
                set({ session: { ...session, currentCombat: null } });
            },

            addCustomMonster: (monster: Monster) => {
                const { customMonsters } = get();
                const newMonster = { ...monster, id: generateId(), userAdded: true };
                set({ customMonsters: [...customMonsters, newMonster] });
            },

            removeCustomMonster: (monsterId: string) => {
                const { customMonsters } = get();
                set({ customMonsters: customMonsters.filter(m => m.id !== monsterId) });
            },

            getAllMonsters: () => {
                const { customMonsters } = get();
                return [...BASE_MONSTERS, ...ALL_EXPANSION_MONSTERS, ...customMonsters];
            },

            syncMonsters: (monsters: Monster[]) => {
                // Only sync user-added monsters
                const userMonsters = monsters.filter(m => m.userAdded);
                const { customMonsters } = get();

                // Merge: keep existing + add new
                const existingIds = new Set(customMonsters.map(m => m.id));
                const newMonsters = userMonsters.filter(m => !existingIds.has(m.id));

                set({ customMonsters: [...customMonsters, ...newMonsters] });
            },

            setHostMode: (isHost: boolean, address?: string) => {
                set({ isHost, serverAddress: address || null });
            },

            setConnected: (connected: boolean) => {
                set({ isConnected: connected });
                const { localPlayer } = get();
                if (localPlayer) {
                    get().updateLocalPlayer({ isConnected: connected });
                }
            },

            // Turn system
            startGame: () => {
                const { session } = get();
                if (!session || session.players.length === 0) return;

                const firstPlayer = session.players[0];
                set({
                    session: {
                        ...session,
                        status: 'in_progress',
                        currentTurnPlayerId: firstPlayer.id,
                        turnNumber: 1,
                        turnStartedAt: session.timerEnabled ? Date.now() : null,
                    }
                });
            },

            nextTurn: () => {
                const { session } = get();
                if (!session) return;

                const currentIndex = session.players.findIndex(
                    p => p.id === session.currentTurnPlayerId
                );
                const nextIndex = (currentIndex + 1) % session.players.length;
                const nextPlayer = session.players[nextIndex];

                set({
                    session: {
                        ...session,
                        currentTurnPlayerId: nextPlayer.id,
                        turnNumber: session.turnNumber + 1,
                        turnStartedAt: session.timerEnabled ? Date.now() : null,
                    }
                });
            },

            setTimerConfig: (enabled: boolean, duration: number) => {
                const { session } = get();
                if (!session) return;

                set({
                    session: {
                        ...session,
                        timerEnabled: enabled,
                        timerDuration: duration,
                    }
                });
            },

            rollDice: (reason?: string) => {
                const { session, localPlayer } = get();
                const value = Math.floor(Math.random() * 6) + 1;

                if (session && localPlayer) {
                    const newRoll = {
                        playerId: localPlayer.id,
                        value,
                        timestamp: Date.now(),
                        reason,
                    };
                    set({
                        session: {
                            ...session,
                            diceRolls: [...session.diceRolls, newRoll],
                        }
                    });
                }

                return value;
            },

            // Death system actions
            killPlayer: (playerId: string) => {
                const { session, localPlayer } = get();
                if (!session) return;

                const updatedPlayers = session.players.map(p => {
                    if (p.id === playerId) {
                        // Player dies: loses all gear, keeps level/race/class
                        return {
                            ...p,
                            isDead: true,
                            deathTurn: session.turnNumber,
                            gearBonus: 0, // Lose all equipment
                            isFleeingCombat: false,
                        };
                    }
                    return p;
                });

                set({
                    session: { ...session, players: updatedPlayers }
                });

                // Update local player if they died
                if (localPlayer?.id === playerId) {
                    set({
                        localPlayer: {
                            ...localPlayer,
                            isDead: true,
                            deathTurn: session.turnNumber,
                            gearBonus: 0,
                            isFleeingCombat: false,
                        }
                    });
                }
            },

            respawnPlayer: (playerId: string) => {
                const { session, localPlayer } = get();
                if (!session) return;

                const updatedPlayers = session.players.map(p => {
                    if (p.id === playerId) {
                        return {
                            ...p,
                            isDead: false,
                            deathTurn: undefined,
                        };
                    }
                    return p;
                });

                set({
                    session: { ...session, players: updatedPlayers }
                });

                // Update local player if they respawned
                if (localPlayer?.id === playerId) {
                    set({
                        localPlayer: {
                            ...localPlayer,
                            isDead: false,
                            deathTurn: undefined,
                        }
                    });
                }
            },

            setPlayerFleeingStatus: (playerId: string, isFleeing: boolean) => {
                const { session, localPlayer } = get();
                if (!session) return;

                const updatedPlayers = session.players.map(p => {
                    if (p.id === playerId) {
                        return { ...p, isFleeingCombat: isFleeing };
                    }
                    return p;
                });

                set({
                    session: { ...session, players: updatedPlayers }
                });

                if (localPlayer?.id === playerId) {
                    set({
                        localPlayer: { ...localPlayer, isFleeingCombat: isFleeing }
                    });
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'munchkin-game-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                localPlayer: state.localPlayer,
                customMonsters: state.customMonsters,
            }),
        }
    )
);

// Combat calculation helpers
export function calculatePlayerStrength(
    player: Player,
    helpers: Player[],
    combat: Combat
): number {
    let strength = player.level + player.gearBonus + combat.playerBonus;

    // Add helpers' strength
    helpers.forEach(helper => {
        strength += helper.level + helper.gearBonus;
    });

    return strength;
}

export function calculateMonsterStrength(
    monsters: CombatMonster[],
    players: Player[],
    combat: Combat
): number {
    let strength = combat.monstersBonus;

    monsters.forEach(({ monster, enhancers }) => {
        let monsterLevel = monster.level + enhancers;

        // Apply bonuses against races/classes
        monster.bonuses.forEach(bonus => {
            players.forEach(player => {
                if (
                    (bonus.target === player.race?.id) ||
                    (bonus.target === player.gameClass?.id) ||
                    (bonus.target === player.sex) ||
                    (bonus.target === 'noClass' && !player.gameClass) ||
                    (bonus.target === 'noRace' && !player.race)
                ) {
                    monsterLevel += bonus.value;
                }
            });
        });

        strength += monsterLevel;
    });

    return strength;
}
