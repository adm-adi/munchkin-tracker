/**
 * Curses / Maldiciones system for Munchkin
 */

import { Expansion } from '../types/game';

export type CurseEffect =
    | 'flee_penalty'      // -X to flee roll
    | 'combat_penalty'    // -X to combat strength
    | 'level_loss'        // Lose X levels immediately
    | 'no_equipment'      // Can't use equipment this combat
    | 'no_abilities'      // Race/class abilities disabled
    | 'extra_bad_stuff';  // Bad stuff is worse

export type CurseDuration = 'instant' | 'combat' | 'turn' | 'permanent';

export interface Curse {
    id: string;
    name: string;
    nameEs: string;
    description: string;
    descriptionEs: string;
    effect: CurseEffect;
    modifier: number;
    duration: CurseDuration;
    expansion: Expansion;
}

export const CURSES: Curse[] = [
    // Base game curses
    {
        id: 'duck_doom',
        name: 'Duck of Doom',
        nameEs: 'Pato de la Perdición',
        description: 'Lose 2 levels',
        descriptionEs: 'Pierdes 2 niveles',
        effect: 'level_loss',
        modifier: 2,
        duration: 'instant',
        expansion: 'base',
    },
    {
        id: 'curse_change_sex',
        name: 'Change Sex',
        nameEs: 'Cambio de Sexo',
        description: 'Change your sex. Lose items that require your old sex',
        descriptionEs: 'Cambia tu sexo. Pierdes objetos que requerían tu sexo anterior',
        effect: 'no_equipment',
        modifier: 0,
        duration: 'permanent',
        expansion: 'base',
    },
    {
        id: 'curse_chicken',
        name: 'Chicken on Your Head',
        nameEs: 'Pollo en la Cabeza',
        description: '-1 to all combat rolls until removed',
        descriptionEs: '-1 a todas las tiradas de combate hasta que te lo quites',
        effect: 'combat_penalty',
        modifier: 1,
        duration: 'permanent',
        expansion: 'base',
    },
    {
        id: 'curse_malign_mirror',
        name: 'Malign Mirror',
        nameEs: 'Espejo Maligno',
        description: 'Cannot use class abilities until you defeat a monster',
        descriptionEs: 'No puedes usar habilidades de clase hasta derrotar un monstruo',
        effect: 'no_abilities',
        modifier: 0,
        duration: 'permanent',
        expansion: 'base',
    },
    {
        id: 'truly_obnoxious',
        name: 'Truly Obnoxious Curse',
        nameEs: 'Maldición Verdaderamente Odiosa',
        description: 'Lose a level',
        descriptionEs: 'Pierdes un nivel',
        effect: 'level_loss',
        modifier: 1,
        duration: 'instant',
        expansion: 'base',
    },
    {
        id: 'lose_helmet',
        name: 'Lose the Headgear',
        nameEs: 'Pierde el Casco',
        description: 'Lose your headgear',
        descriptionEs: 'Pierdes tu casco',
        effect: 'no_equipment',
        modifier: 0,
        duration: 'instant',
        expansion: 'base',
    },
    {
        id: 'income_tax',
        name: 'Income Tax',
        nameEs: 'Impuesto sobre la Renta',
        description: 'Lose all your gold or lose a level',
        descriptionEs: 'Pierde todo tu oro o pierde un nivel',
        effect: 'level_loss',
        modifier: 1,
        duration: 'instant',
        expansion: 'base',
    },
    // Combat-affecting curses
    {
        id: 'curse_cowardice',
        name: 'Curse of Cowardice',
        nameEs: 'Maldición de Cobardía',
        description: '-2 to flee rolls',
        descriptionEs: '-2 a las tiradas de huir',
        effect: 'flee_penalty',
        modifier: 2,
        duration: 'combat',
        expansion: 'base',
    },
    {
        id: 'curse_weakness',
        name: 'Curse of Weakness',
        nameEs: 'Maldición de Debilidad',
        description: '-3 to combat strength this combat',
        descriptionEs: '-3 a fuerza de combate en este combate',
        effect: 'combat_penalty',
        modifier: 3,
        duration: 'combat',
        expansion: 'base',
    },
];

export function getCurseById(id: string): Curse | undefined {
    return CURSES.find(c => c.id === id);
}

export function getCursesByEffect(effect: CurseEffect): Curse[] {
    return CURSES.filter(c => c.effect === effect);
}

export function getCursesByExpansion(expansion: Expansion): Curse[] {
    return CURSES.filter(c => c.expansion === expansion);
}

/**
 * Calculate total flee modifier from active curses
 */
export function calculateFleeModifier(curses: Curse[]): number {
    return curses
        .filter(c => c.effect === 'flee_penalty')
        .reduce((sum, c) => sum - c.modifier, 0);
}

/**
 * Calculate total combat modifier from active curses
 */
export function calculateCombatModifier(curses: Curse[]): number {
    return curses
        .filter(c => c.effect === 'combat_penalty')
        .reduce((sum, c) => sum - c.modifier, 0);
}
