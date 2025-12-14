import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { GameSession } from '../types/game';
import { GameLogEntry, GameRecord, LeaderboardCategory, LeaderboardEntry, PlayerStats } from '../types/stats';

interface StatsState {
    // Player statistics (keyed by playerId)
    playerStats: Record<string, PlayerStats>;
    // Game records history
    gameRecords: GameRecord[];
    // Current game log (cleared when game ends)
    currentGameLog: GameLogEntry[];

    // Actions
    getPlayerStats: (playerId: string) => PlayerStats | undefined;
    updatePlayerStats: (playerId: string, updates: Partial<PlayerStats>) => void;
    initializePlayer: (playerId: string, playerName: string, avatar?: string) => void;

    // Dice roll tracking
    recordDiceRoll: (playerId: string, value: number) => void;
    getAverageDiceRoll: (playerId: string) => number;
    getLuckiestPlayer: () => LeaderboardEntry | null;

    // Game log
    addLogEntry: (entry: Omit<GameLogEntry, 'id' | 'timestamp'>) => void;
    clearCurrentLog: () => void;

    // Game records
    saveGameRecord: (session: GameSession, log: GameLogEntry[]) => void;
    getRecentGames: (count: number) => GameRecord[];

    // Leaderboards
    getLeaderboard: (category: LeaderboardCategory, limit?: number) => LeaderboardEntry[];

    // When game ends
    processGameEnd: (session: GameSession, winnerId: string) => void;

    // Reset
    resetStats: () => void;
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

function createEmptyStats(playerId: string, playerName: string, avatar?: string): PlayerStats {
    return {
        playerId,
        playerName,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        monstersDefeated: 0,
        totalLevelsGained: 0,
        highestLevelReached: 1,
        totalGearBonus: 0,
        combatsWon: 0,
        combatsLost: 0,
        timesHelped: 0,
        lastPlayed: Date.now(),
        totalDiceRolls: 0,
        diceRollSum: 0,
        diceRollDistribution: [0, 0, 0, 0, 0, 0, 0], // index 0 unused, 1-6 for each face
        avatar,
    };
}

export const useStatsStore = create<StatsState>()(
    persist(
        (set, get) => ({
            playerStats: {},
            gameRecords: [],
            currentGameLog: [],

            getPlayerStats: (playerId) => get().playerStats[playerId],

            updatePlayerStats: (playerId, updates) => {
                set((state) => ({
                    playerStats: {
                        ...state.playerStats,
                        [playerId]: {
                            ...state.playerStats[playerId],
                            ...updates,
                            lastPlayed: Date.now(),
                        },
                    },
                }));
            },

            initializePlayer: (playerId, playerName, avatar) => {
                const existing = get().playerStats[playerId];
                if (!existing) {
                    set((state) => ({
                        playerStats: {
                            ...state.playerStats,
                            [playerId]: createEmptyStats(playerId, playerName, avatar),
                        },
                    }));
                } else {
                    // Update name/avatar if changed
                    get().updatePlayerStats(playerId, { playerName, avatar });
                }
            },

            recordDiceRoll: (playerId, value) => {
                const stats = get().playerStats[playerId];
                if (!stats) return;

                const newDistribution = [...stats.diceRollDistribution];
                newDistribution[value] = (newDistribution[value] || 0) + 1;

                get().updatePlayerStats(playerId, {
                    totalDiceRolls: stats.totalDiceRolls + 1,
                    diceRollSum: stats.diceRollSum + value,
                    diceRollDistribution: newDistribution,
                });
            },

            getAverageDiceRoll: (playerId) => {
                const stats = get().playerStats[playerId];
                if (!stats || stats.totalDiceRolls === 0) return 0;
                return stats.diceRollSum / stats.totalDiceRolls;
            },

            getLuckiestPlayer: () => {
                const allStats = Object.values(get().playerStats);
                if (allStats.length === 0) return null;

                let luckiest: LeaderboardEntry | null = null;
                let highestAvg = 0;

                allStats.forEach(stats => {
                    if (stats.totalDiceRolls >= 5) { // Minimum 5 rolls to count
                        const avg = stats.diceRollSum / stats.totalDiceRolls;
                        if (avg > highestAvg) {
                            highestAvg = avg;
                            luckiest = {
                                playerId: stats.playerId,
                                playerName: stats.playerName,
                                value: parseFloat(avg.toFixed(2)),
                                avatar: stats.avatar,
                            };
                        }
                    }
                });

                return luckiest;
            },

            addLogEntry: (entry) => {
                set((state) => ({
                    currentGameLog: [
                        ...state.currentGameLog,
                        {
                            ...entry,
                            id: generateId(),
                            timestamp: Date.now(),
                        },
                    ],
                }));
            },

            clearCurrentLog: () => {
                set({ currentGameLog: [] });
            },

            saveGameRecord: (session, log) => {
                const record: GameRecord = {
                    id: generateId(),
                    date: Date.now(),
                    duration: Math.floor((Date.now() - session.createdAt) / 1000),
                    players: session.players.map(p => ({
                        id: p.id,
                        name: p.name,
                        finalLevel: p.level,
                        finalGear: p.gearBonus,
                        monstersDefeated: 0, // Would need to track this
                        avatar: p.avatar,
                    })),
                    winnerId: session.winnerId || '',
                    winnerName: session.players.find(p => p.id === session.winnerId)?.name || '',
                    log,
                };

                set((state) => ({
                    gameRecords: [record, ...state.gameRecords].slice(0, 50), // Keep last 50
                }));
            },

            getRecentGames: (count) => {
                return get().gameRecords.slice(0, count);
            },

            getLeaderboard: (category, limit = 10) => {
                const allStats = Object.values(get().playerStats);

                const sorted = allStats
                    .map(stats => {
                        let value = 0;
                        switch (category) {
                            case 'wins': value = stats.wins; break;
                            case 'losses': value = stats.losses; break;
                            case 'monstersDefeated': value = stats.monstersDefeated; break;
                            case 'highestLevel': value = stats.highestLevelReached; break;
                            case 'gamesPlayed': value = stats.gamesPlayed; break;
                        }
                        return {
                            playerId: stats.playerId,
                            playerName: stats.playerName,
                            value,
                            avatar: stats.avatar,
                        };
                    })
                    .sort((a, b) => b.value - a.value)
                    .slice(0, limit);

                return sorted;
            },

            processGameEnd: (session, winnerId) => {
                // Update stats for all players
                session.players.forEach(player => {
                    const isWinner = player.id === winnerId;
                    const stats = get().playerStats[player.id];

                    if (stats) {
                        get().updatePlayerStats(player.id, {
                            gamesPlayed: stats.gamesPlayed + 1,
                            wins: stats.wins + (isWinner ? 1 : 0),
                            losses: stats.losses + (isWinner ? 0 : 1),
                            highestLevelReached: Math.max(stats.highestLevelReached, player.level),
                            totalGearBonus: stats.totalGearBonus + player.gearBonus,
                        });
                    }
                });

                // Save game record
                get().saveGameRecord(session, get().currentGameLog);
                get().clearCurrentLog();
            },

            resetStats: () => {
                set({
                    playerStats: {},
                    gameRecords: [],
                    currentGameLog: [],
                });
            },
        }),
        {
            name: 'munchkin-stats',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
