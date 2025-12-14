// Game Types for Munchkin Tracker

// Expansion identifiers
export type Expansion =
    | 'base'           // Munchkin 1
    | 'unnatural'      // Munchkin 2 - Hacha Descomunal
    | 'clerical'       // Munchkin 3 - Pifias Clericales
    | 'need_steed'     // Munchkin 4 - ¡Amos del Calabozo!
    | 'de_ranged'      // Munchkin 5 - Exploradores Explotadores
    | 'demented'       // Munchkin 6 - Mazmorras Majaretas
    | 'cheat_hands'    // Munchkin 7 - Trampas a Dos Manos
    | 'half_horse'     // Munchkin 8 - Centrauros de la Mazmorra
    | 'jurassic'       // Munchkin 9 - Jurásico Sarcástico
    | 'custom';        // User-added monsters

// Race definitions
export interface Race {
    id: string;
    name: string;
    nameEs: string;
    expansion: Expansion;
    ability: string;
    abilityEs: string;
}

// Class definitions
export interface GameClass {
    id: string;
    name: string;
    nameEs: string;
    expansion: Expansion;
    ability: string;
    abilityEs: string;
}

// Monster bonus/malus targets
export type BonusTarget =
    | 'elf' | 'dwarf' | 'halfling' | 'human' | 'orc' | 'gnome'
    | 'warrior' | 'wizard' | 'cleric' | 'thief' | 'bard' | 'ranger'
    | 'male' | 'female' | 'level1' | 'level5+' | 'noClass' | 'noRace';

// Monster bonus structure
export interface MonsterBonus {
    target: BonusTarget;
    value: number;
    description?: string;
}

// Monster definition
export interface Monster {
    id: string;
    name: string;
    level: number;
    expansion: Expansion;
    bonuses: MonsterBonus[];
    badStuff: string;
    treasures: number;
    levelsGranted: number;
    isUndead?: boolean;
    imageUri?: string; // For scanned cards
    userAdded?: boolean; // True if added by user
}

// Combat monster (with modifiers)
export interface CombatMonster {
    monster: Monster;
    enhancers: number; // Additional level from enhancer cards
}

// Player in the game
export interface Player {
    id: string;
    name: string;
    level: number;
    gearBonus: number;
    race: Race | null;
    secondRace: Race | null; // For "Mestizo" card
    gameClass: GameClass | null;
    secondClass: GameClass | null; // For "Super Munchkin" card
    sex: 'male' | 'female';
    isHost: boolean;
    isConnected: boolean;
    avatar?: string; // Avatar image ID
    // Death system
    isDead: boolean;
    deathTurn?: number; // Turn when player died (to track respawn)
    isFleeingCombat?: boolean; // Currently rolling to flee
}

// Combat status
export type CombatStatus = 'preparing' | 'in_progress' | 'victory' | 'defeat' | 'fled';

// Active combat
export interface Combat {
    id: string;
    mainPlayerId: string;
    helperIds: string[];
    monsters: CombatMonster[];
    playerBonus: number; // Additional bonuses from cards
    monstersBonus: number; // Additional monster bonuses from player cards
    status: CombatStatus;
    startedAt: number;
}

// Game session status
export type SessionStatus = 'lobby' | 'in_progress' | 'finished';

// Full game session
export interface GameSession {
    id: string;
    hostId: string;
    createdAt: number;
    players: Player[];
    currentCombat: Combat | null;
    status: SessionStatus;
    winnerId: string | null;
    // Turn system
    currentTurnPlayerId: string | null;
    turnNumber: number;
    // Timer configuration
    timerEnabled: boolean;
    timerDuration: number; // seconds (30, 60, 120, 300)
    turnStartedAt: number | null; // timestamp when current turn started
    // Dice rolls tracking (for luck stats)
    diceRolls: DiceRoll[];
}

// Dice roll record
export interface DiceRoll {
    playerId: string;
    value: number; // 1-6
    timestamp: number;
    reason?: string; // 'combat', 'flee', 'curse', etc.
}

// WebSocket message types
export type WSMessageType =
    | 'player_join'
    | 'player_leave'
    | 'player_update'
    | 'combat_start'
    | 'combat_update'
    | 'combat_end'
    | 'game_start'
    | 'game_end'
    | 'sync_state'
    | 'sync_monsters'
    | 'monster_added'
    // New v1.4 sync messages
    | 'turn_change'
    | 'timer_sync'
    | 'dice_roll'
    | 'level_change'
    | 'victory';

// WebSocket message structure
export interface WSMessage {
    type: WSMessageType;
    payload: unknown;
    senderId: string;
    timestamp: number;
}

// Update check info
export interface UpdateInfo {
    version: string;
    downloadUrl: string;
    changelog: string;
    releaseDate: string;
}

// App config
export const APP_CONFIG = {
    GITHUB_OWNER: 'adm-adi',
    GITHUB_REPO: 'munchkin-tracker',
    WS_PORT: 8765,
    SERVICE_TYPE: '_munchkin._tcp.',
    MAX_PLAYERS: 6,
    WIN_LEVEL: 10,
};
