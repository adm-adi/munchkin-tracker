// Statistics and rankings types

export interface PlayerStats {
    playerId: string;
    playerName: string;
    gamesPlayed: number;
    wins: number;
    losses: number;
    monstersDefeated: number;
    totalLevelsGained: number;
    highestLevelReached: number;
    totalGearBonus: number;
    combatsWon: number;
    combatsLost: number;
    timesHelped: number;
    lastPlayed: number; // timestamp
    // Dice luck stats
    totalDiceRolls: number;
    diceRollSum: number; // Sum of all rolls (for average calculation)
    diceRollDistribution: number[]; // [0, count1, count2, count3, count4, count5, count6]
    avatar?: string;
}

export interface GameRecord {
    id: string;
    date: number; // timestamp
    duration: number; // seconds
    players: GameRecordPlayer[];
    winnerId: string;
    winnerName: string;
    log: GameLogEntry[];
}

export interface GameRecordPlayer {
    id: string;
    name: string;
    finalLevel: number;
    finalGear: number;
    monstersDefeated: number;
    avatar?: string;
}

export interface GameLogEntry {
    id: string;
    timestamp: number;
    type: GameLogType;
    playerId?: string;
    playerName?: string;
    message: string;
    details?: Record<string, unknown>;
}

export type GameLogType =
    | 'game_start'
    | 'game_end'
    | 'turn_start'
    | 'turn_end'
    | 'level_up'
    | 'level_down'
    | 'gear_change'
    | 'combat_start'
    | 'combat_win'
    | 'combat_lose'
    | 'combat_flee'
    | 'race_change'
    | 'class_change'
    | 'player_join'
    | 'player_leave';

// Leaderboard types
export interface LeaderboardEntry {
    playerId: string;
    playerName: string;
    value: number;
    avatar?: string;
}

export type LeaderboardCategory =
    | 'wins'
    | 'losses'
    | 'monstersDefeated'
    | 'highestLevel'
    | 'gamesPlayed';
