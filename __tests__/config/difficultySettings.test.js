import {
    LIVES_OPTIONS,
    SPAWN_OPTIONS,
    SPAWN_MULTIPLIERS,
    DEFAULT_LIVES_INDEX,
    DEFAULT_SPAWN_INDEX,
    getConfiguredLivesFromIndex,
} from '../../game/config/difficultySettings.js';

describe('difficultySettings', () => {
    test('default indices point to valid entries', () => {
        expect(LIVES_OPTIONS[DEFAULT_LIVES_INDEX]).toBeDefined();
        expect(SPAWN_OPTIONS[DEFAULT_SPAWN_INDEX]).toBeDefined();
    });

    test('SPAWN_MULTIPLIERS has an entry for every SPAWN_OPTIONS value', () => {
        for (const option of SPAWN_OPTIONS) {
            expect(SPAWN_MULTIPLIERS).toHaveProperty(option);
            expect(typeof SPAWN_MULTIPLIERS[option]).toBe('number');
        }
    });
});

describe('getConfiguredLivesFromIndex', () => {
    test('returns correct lives for each valid index', () => {
        LIVES_OPTIONS.forEach((val, i) => {
            expect(getConfiguredLivesFromIndex(i)).toBe(parseInt(val, 10));
        });
    });

    test('falls back to default lives for out-of-range index', () => {
        const defaultLives = parseInt(LIVES_OPTIONS[DEFAULT_LIVES_INDEX], 10);
        expect(getConfiguredLivesFromIndex(999)).toBe(defaultLives);
        expect(getConfiguredLivesFromIndex(-1)).toBe(defaultLives);
    });

    test('uses default index when called with no argument', () => {
        const defaultLives = parseInt(LIVES_OPTIONS[DEFAULT_LIVES_INDEX], 10);
        expect(getConfiguredLivesFromIndex()).toBe(defaultLives);
    });
});
