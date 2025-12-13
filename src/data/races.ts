import { Expansion, Race } from '../types/game';

export const RACES: Race[] = [
    {
        id: 'human',
        name: 'Human',
        nameEs: 'Humano',
        expansion: 'base',
        ability: 'No special ability',
        abilityEs: 'Sin habilidad especial',
    },
    {
        id: 'elf',
        name: 'Elf',
        nameEs: 'Elfo',
        expansion: 'base',
        ability: '+1 to Run Away. Gain 1 level when you help someone in combat',
        abilityEs: '+1 para Huir. Ganas 1 nivel cuando ayudas a alguien en combate',
    },
    {
        id: 'dwarf',
        name: 'Dwarf',
        nameEs: 'Enano',
        expansion: 'base',
        ability: 'Can carry 6 Big items. Can have 6 cards in hand',
        abilityEs: 'Puede llevar 6 objetos Grandes. Puede tener 6 cartas en mano',
    },
    {
        id: 'halfling',
        name: 'Halfling',
        nameEs: 'Mediano',
        expansion: 'base',
        ability: 'Sell items at double value (minimum 200 gold)',
        abilityEs: 'Vende objetos al doble de su valor (mínimo 200 monedas)',
    },
    {
        id: 'orc',
        name: 'Orc',
        nameEs: 'Orco',
        expansion: 'unnatural',
        ability: '+1 for each monster you kill. Draw extra Treasure when winning alone',
        abilityEs: '+1 por cada monstruo que mates. Roba Tesoro extra al ganar solo',
    },
    {
        id: 'gnome',
        name: 'Gnome',
        nameEs: 'Gnomo',
        expansion: 'clerical',
        ability: 'Can use items of any class. +2 when using items without class requirement',
        abilityEs: 'Puede usar objetos de cualquier clase. +2 al usar objetos sin requisito de clase',
    },
];

export function getRaceById(id: string): Race | undefined {
    return RACES.find(r => r.id === id);
}

export function getRacesByExpansion(expansion: Expansion): Race[] {
    return RACES.filter(r => r.expansion === expansion);
}
