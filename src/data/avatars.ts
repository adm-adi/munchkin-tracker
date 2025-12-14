// Avatar definitions for player selection

export interface Avatar {
    id: string;
    name: string;
    nameEs: string;
    image: any; // require() image
}

export const AVATARS: Avatar[] = [
    {
        id: 'warrior',
        name: 'Warrior',
        nameEs: 'Guerrero Torpe',
        image: require('@/assets/avatars/avatar_warrior.png'),
    },
    {
        id: 'wizard',
        name: 'Wizard',
        nameEs: 'Mago Barbudo',
        image: require('@/assets/avatars/avatar_wizard.png'),
    },
    {
        id: 'thief',
        name: 'Thief',
        nameEs: 'Ladrón Pillado',
        image: require('@/assets/avatars/avatar_thief.png'),
    },
    {
        id: 'cleric',
        name: 'Cleric',
        nameEs: 'Clérigo Confuso',
        image: require('@/assets/avatars/avatar_cleric.png'),
    },
    {
        id: 'elf',
        name: 'Elf',
        nameEs: 'Elfo Presumido',
        image: require('@/assets/avatars/avatar_elf.png'),
    },
    {
        id: 'dwarf',
        name: 'Dwarf',
        nameEs: 'Enano Gruñón',
        image: require('@/assets/avatars/avatar_dwarf.png'),
    },
    {
        id: 'halfling',
        name: 'Halfling',
        nameEs: 'Mediano Glotón',
        image: require('@/assets/avatars/avatar_halfling.png'),
    },
    {
        id: 'orc',
        name: 'Orc',
        nameEs: 'Orco Bonachón',
        image: require('@/assets/avatars/avatar_orc.png'),
    },
    {
        id: 'bard',
        name: 'Bard',
        nameEs: 'Bardo Dramático',
        image: require('@/assets/avatars/avatar_bard.png'),
    },
    {
        id: 'ranger',
        name: 'Ranger',
        nameEs: 'Explorador Perdido',
        image: require('@/assets/avatars/avatar_ranger.png'),
    },
    {
        id: 'monster',
        name: 'Monster',
        nameEs: 'Monstruo Tierno',
        image: require('@/assets/avatars/avatar_monster.png'),
    },
    {
        id: 'skeleton',
        name: 'Skeleton',
        nameEs: 'Esqueleto Simpático',
        image: require('@/assets/avatars/avatar_skeleton.png'),
    },
    {
        id: 'dragon',
        name: 'Dragon',
        nameEs: 'Dragón Novato',
        image: require('@/assets/avatars/avatar_dragon.png'),
    },
];

export function getAvatarById(id: string): Avatar | undefined {
    return AVATARS.find(a => a.id === id);
}

export function getRandomAvatar(): Avatar {
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}
