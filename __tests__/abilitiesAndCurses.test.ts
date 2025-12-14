import {
    calculateCombatModifier,
    calculateFleeModifier,
    CURSES,
    getCurseById,
    getCursesByEffect,
} from '../src/data/curses';

import {
    calculateClassAbilities,
    calculateRaceAbilities,
    getPlayerCombatModifiers,
    isElf,
    isWarrior,
} from '../src/data/abilities';

import { Player } from '../src/types/game';

// Mock player factory
const createMockPlayer = (overrides: Partial<Player> = {}): Player => ({
    id: 'player-1',
    name: 'Test Player',
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
    monstersKilled: 0,
    activeCurseIds: [],
    ...overrides,
});

describe('Curses Module', () => {
    describe('getCurseById', () => {
        it('should return curse by id', () => {
            const curse = getCurseById('duck_doom');
            expect(curse).toBeDefined();
            expect(curse?.name).toBe('Duck of Doom');
        });

        it('should return undefined for invalid id', () => {
            const curse = getCurseById('invalid_id');
            expect(curse).toBeUndefined();
        });
    });

    describe('getCursesByEffect', () => {
        it('should filter curses by flee_penalty effect', () => {
            const curses = getCursesByEffect('flee_penalty');
            expect(curses.length).toBeGreaterThan(0);
            curses.forEach(c => {
                expect(c.effect).toBe('flee_penalty');
            });
        });

        it('should filter curses by combat_penalty effect', () => {
            const curses = getCursesByEffect('combat_penalty');
            expect(curses.length).toBeGreaterThan(0);
            curses.forEach(c => {
                expect(c.effect).toBe('combat_penalty');
            });
        });
    });

    describe('calculateFleeModifier', () => {
        it('should return 0 for empty array', () => {
            const modifier = calculateFleeModifier([]);
            expect(modifier).toBe(0);
        });

        it('should calculate negative modifier from flee curses', () => {
            const fleeCurses = CURSES.filter(c => c.effect === 'flee_penalty');
            const modifier = calculateFleeModifier(fleeCurses);
            expect(modifier).toBeLessThan(0);
        });

        it('should ignore non-flee curses', () => {
            const combatCurses = CURSES.filter(c => c.effect === 'combat_penalty');
            const modifier = calculateFleeModifier(combatCurses);
            expect(modifier).toBe(0);
        });
    });

    describe('calculateCombatModifier', () => {
        it('should return 0 for empty array', () => {
            const modifier = calculateCombatModifier([]);
            expect(modifier).toBe(0);
        });

        it('should calculate negative modifier from combat curses', () => {
            const combatCurses = CURSES.filter(c => c.effect === 'combat_penalty');
            const modifier = calculateCombatModifier(combatCurses);
            expect(modifier).toBeLessThan(0);
        });
    });
});

describe('Abilities Module', () => {
    describe('calculateRaceAbilities', () => {
        it('should return +1 flee for Elf', () => {
            const player = createMockPlayer({ race: 'elf' as any });
            const abilities = calculateRaceAbilities(player);
            expect(abilities.fleeBonus).toBe(1);
            expect(abilities.notes).toContain('Elfo: +1 para huir');
        });

        it('should return combat bonus for Orc based on kills', () => {
            const player = createMockPlayer({ race: 'orc' as any });
            const abilities = calculateRaceAbilities(player, { monstersKilled: 3 });
            expect(abilities.combatBonus).toBe(3);
        });

        it('should return 0 bonuses for Human', () => {
            const player = createMockPlayer({ race: 'human' as any });
            const abilities = calculateRaceAbilities(player);
            expect(abilities.combatBonus).toBe(0);
            expect(abilities.fleeBonus).toBe(0);
        });

        it('should return 0 bonuses for null race', () => {
            const player = createMockPlayer({ race: null });
            const abilities = calculateRaceAbilities(player);
            expect(abilities.combatBonus).toBe(0);
            expect(abilities.fleeBonus).toBe(0);
        });
    });

    describe('calculateClassAbilities', () => {
        it('should include tie-win note for Warrior', () => {
            const player = createMockPlayer({ gameClass: 'warrior' as any });
            const abilities = calculateClassAbilities(player);
            expect(abilities.notes).toContain('Guerrero: Empates ganan');
        });

        it('should return 0 bonuses for null class', () => {
            const player = createMockPlayer({ gameClass: null });
            const abilities = calculateClassAbilities(player);
            expect(abilities.combatBonus).toBe(0);
            expect(abilities.fleeBonus).toBe(0);
        });
    });

    describe('getPlayerCombatModifiers', () => {
        it('should combine race and class abilities', () => {
            const player = createMockPlayer({
                race: 'elf' as any,
                gameClass: 'warrior' as any
            });
            const modifiers = getPlayerCombatModifiers(player);
            expect(modifiers.fleeBonus).toBe(1); // Elf
            expect(modifiers.notes.length).toBeGreaterThan(0);
        });
    });

    describe('helper functions', () => {
        it('isWarrior should return true for warrior class', () => {
            const warrior = createMockPlayer({ gameClass: 'warrior' as any });
            expect(isWarrior(warrior)).toBe(true);
        });

        it('isWarrior should return false for other classes', () => {
            const wizard = createMockPlayer({ gameClass: 'wizard' as any });
            expect(isWarrior(wizard)).toBe(false);
        });

        it('isElf should return true for elf race', () => {
            const elf = createMockPlayer({ race: 'elf' as any });
            expect(isElf(elf)).toBe(true);
        });

        it('isElf should return false for other races', () => {
            const dwarf = createMockPlayer({ race: 'dwarf' as any });
            expect(isElf(dwarf)).toBe(false);
        });
    });
});
