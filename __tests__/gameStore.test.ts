import { calculateMonsterStrength, calculatePlayerStrength } from '../src/stores/gameStore';
import { Combat, CombatMonster, Player } from '../src/types/game';

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
    ...overrides,
});

// Mock combat factory
const createMockCombat = (overrides: Partial<Combat> = {}): Combat => ({
    id: 'combat-1',
    mainPlayerId: 'player-1',
    helperIds: [],
    monsters: [],
    status: 'in_progress',
    playerBonus: 0,
    monstersBonus: 0,
    result: null,
    ...overrides,
});

describe('Game Store Combat Calculations', () => {
    describe('calculatePlayerStrength', () => {
        it('should calculate basic player strength', () => {
            const player = createMockPlayer({ level: 5, gearBonus: 3 });
            const combat = createMockCombat({ playerBonus: 0 });

            const strength = calculatePlayerStrength(player, [], combat);
            expect(strength).toBe(8); // 5 + 3
        });

        it('should add combat bonus', () => {
            const player = createMockPlayer({ level: 3, gearBonus: 2 });
            const combat = createMockCombat({ playerBonus: 5 });

            const strength = calculatePlayerStrength(player, [], combat);
            expect(strength).toBe(10); // 3 + 2 + 5
        });

        it('should add helper strength', () => {
            const mainPlayer = createMockPlayer({ level: 4, gearBonus: 2 });
            const helper = createMockPlayer({ id: 'helper-1', level: 3, gearBonus: 1 });
            const combat = createMockCombat({ playerBonus: 0 });

            const strength = calculatePlayerStrength(mainPlayer, [helper], combat);
            expect(strength).toBe(10); // (4+2) + (3+1)
        });
    });

    describe('calculateMonsterStrength', () => {
        it('should calculate basic monster strength', () => {
            const monster: CombatMonster = {
                monster: {
                    id: 'monster-1',
                    name: 'Goblin',
                    level: 5,
                    treasures: 1,
                    levelsGranted: 1,
                    badStuff: 'Lose 1 level',
                    bonuses: [],
                    userAdded: false,
                },
                enhancers: 0,
            };
            const combat = createMockCombat({ monsters: [monster], monstersBonus: 0 });

            const strength = calculateMonsterStrength([monster], [], combat);
            expect(strength).toBe(5);
        });

        it('should add enhancers to monster level', () => {
            const monster: CombatMonster = {
                monster: {
                    id: 'monster-1',
                    name: 'Goblin',
                    level: 5,
                    treasures: 1,
                    levelsGranted: 1,
                    badStuff: 'Lose 1 level',
                    bonuses: [],
                    userAdded: false,
                },
                enhancers: 3,
            };
            const combat = createMockCombat({ monsters: [monster], monstersBonus: 0 });

            const strength = calculateMonsterStrength([monster], [], combat);
            expect(strength).toBe(8); // 5 + 3
        });

        it('should add multiple monsters', () => {
            const monsters: CombatMonster[] = [
                {
                    monster: {
                        id: 'monster-1',
                        name: 'Goblin',
                        level: 5,
                        treasures: 1,
                        levelsGranted: 1,
                        badStuff: 'Test',
                        bonuses: [],
                        userAdded: false,
                    },
                    enhancers: 0,
                },
                {
                    monster: {
                        id: 'monster-2',
                        name: 'Orc',
                        level: 8,
                        treasures: 2,
                        levelsGranted: 1,
                        badStuff: 'Test',
                        bonuses: [],
                        userAdded: false,
                    },
                    enhancers: 0,
                },
            ];
            const combat = createMockCombat({ monsters, monstersBonus: 0 });

            const strength = calculateMonsterStrength(monsters, [], combat);
            expect(strength).toBe(13); // 5 + 8
        });
    });
});
