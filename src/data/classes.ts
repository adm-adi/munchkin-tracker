import { Expansion, GameClass } from '../types/game';

export const CLASSES: GameClass[] = [
    {
        id: 'warrior',
        name: 'Warrior',
        nameEs: 'Guerrero',
        expansion: 'base',
        ability: 'Discard cards for +1 bonus each in combat',
        abilityEs: 'Descarta cartas para obtener +1 cada una en combate',
    },
    {
        id: 'wizard',
        name: 'Wizard',
        nameEs: 'Mago',
        expansion: 'base',
        ability: 'Discard cards to run away automatically',
        abilityEs: 'Descarta cartas para huir automáticamente',
    },
    {
        id: 'cleric',
        name: 'Cleric',
        nameEs: 'Clérigo',
        expansion: 'base',
        ability: 'Discard cards to resurrect dead players. +3 vs Undead',
        abilityEs: 'Descarta cartas para resucitar jugadores muertos. +3 vs No Muertos',
    },
    {
        id: 'thief',
        name: 'Thief',
        nameEs: 'Ladrón',
        expansion: 'base',
        ability: 'Can backstab during combat. Can steal items from other players',
        abilityEs: 'Puede apuñalar por la espalda en combate. Puede robar objetos a otros jugadores',
    },
    {
        id: 'bard',
        name: 'Bard',
        nameEs: 'Bardo',
        expansion: 'clerical',
        ability: 'Can charm monsters. +2 when negotiating with monsters',
        abilityEs: 'Puede encantar monstruos. +2 al negociar con monstruos',
    },
    {
        id: 'ranger',
        name: 'Ranger',
        nameEs: 'Explorador',
        expansion: 'de_ranged',
        ability: '+1 when kicking doors. Can tame monsters as mounts',
        abilityEs: '+1 al patear puertas. Puede domar monstruos como monturas',
    },
];

export function getClassById(id: string): GameClass | undefined {
    return CLASSES.find(c => c.id === id);
}

export function getClassesByExpansion(expansion: Expansion): GameClass[] {
    return CLASSES.filter(c => c.expansion === expansion);
}
