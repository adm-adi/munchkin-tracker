/**
 * Auto-calculated race and class abilities for combat/flee modifiers
 */

import { CombatMonster, Player } from '../types/game';

export interface AbilityModifiers {
    combatBonus: number;
    fleeBonus: number;
    notes: string[];
}

/**
 * Calculate race-based bonuses for a player
 */
export function calculateRaceAbilities(
    player: Player,
    context: {
        isHelping?: boolean;
        monstersKilled?: number;
        usingNoClassItems?: boolean;
    } = {}
): AbilityModifiers {
    const result: AbilityModifiers = {
        combatBonus: 0,
        fleeBonus: 0,
        notes: [],
    };

    if (!player.race) return result;

    switch (player.race) {
        case 'elf':
            // +1 to Run Away
            result.fleeBonus = 1;
            result.notes.push('Elfo: +1 para huir');
            break;

        case 'orc':
            // +1 for each monster killed (tracked in session)
            if (context.monstersKilled && context.monstersKilled > 0) {
                result.combatBonus = context.monstersKilled;
                result.notes.push(`Orco: +${context.monstersKilled} (monstruos derrotados)`);
            }
            break;

        case 'gnome':
            // +2 when using items without class requirement
            if (context.usingNoClassItems) {
                result.combatBonus = 2;
                result.notes.push('Gnomo: +2 (items sin clase)');
            }
            break;

        case 'dwarf':
            // Can carry 6 Big items - tracked elsewhere
            break;

        case 'halfling':
            // Sell at double value - tracked in shop
            break;

        case 'human':
            // No special ability
            break;
    }

    return result;
}

/**
 * Calculate class-based bonuses for a player
 */
export function calculateClassAbilities(
    player: Player,
    context: {
        monsters?: CombatMonster[];
        discardedCards?: number;
    } = {}
): AbilityModifiers {
    const result: AbilityModifiers = {
        combatBonus: 0,
        fleeBonus: 0,
        notes: [],
    };

    if (!player.gameClass) return result;

    switch (player.gameClass) {
        case 'warrior':
            // Ties win - handled in combat resolution
            // Can discard for +1 each
            if (context.discardedCards && context.discardedCards > 0) {
                result.combatBonus = context.discardedCards;
                result.notes.push(`Guerrero: +${context.discardedCards} (cartas descartadas)`);
            }
            result.notes.push('Guerrero: Empates ganan');
            break;

        case 'cleric':
            // +3 vs Undead
            if (context.monsters?.some(m => m.monster.type === 'undead')) {
                result.combatBonus = 3;
                result.notes.push('Clérigo: +3 vs No Muertos');
            }
            break;

        case 'wizard':
            // Can flee automatically by discarding - handled in flee UI
            result.notes.push('Mago: Puede huir descartando');
            break;

        case 'thief':
            // Backstab handled separately
            result.notes.push('Ladrón: Puede apuñalar');
            break;

        case 'bard':
            // Charm monsters handled separately
            result.notes.push('Bardo: Puede encantar');
            break;

        case 'ranger':
            // +1 kicking doors - handled in door phase
            break;
    }

    return result;
}

/**
 * Get all ability modifiers for a player in combat
 */
export function getPlayerCombatModifiers(
    player: Player,
    context: {
        isHelping?: boolean;
        monsters?: CombatMonster[];
        monstersKilled?: number;
        discardedCards?: number;
        usingNoClassItems?: boolean;
    } = {}
): AbilityModifiers {
    const raceAbilities = calculateRaceAbilities(player, context);
    const classAbilities = calculateClassAbilities(player, context);

    return {
        combatBonus: raceAbilities.combatBonus + classAbilities.combatBonus,
        fleeBonus: raceAbilities.fleeBonus + classAbilities.fleeBonus,
        notes: [...raceAbilities.notes, ...classAbilities.notes],
    };
}

/**
 * Check if player is a Warrior (for tie-breaking)
 */
export function isWarrior(player: Player): boolean {
    return player.gameClass === 'warrior';
}

/**
 * Check if player is an Elf (for helper level bonus)
 */
export function isElf(player: Player): boolean {
    return player.race === 'elf';
}
