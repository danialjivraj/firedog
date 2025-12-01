import { BossManager } from '../../../game/entities/enemies/bossManager.js';

jest.mock('../../../game/entities/enemies/elyvorg.js', () => ({
    Elyvorg: jest.fn().mockImplementation((game) => ({ game, name: 'mockElyvorg' })),
}));

jest.mock('../../../game/entities/enemies/glacikal.js', () => ({
    Glacikal: jest.fn().mockImplementation((game) => ({ game, name: 'mockGlacikal' })),
}));

describe('BossManager', () => {
    let game;
    let manager;

    beforeEach(() => {
        game = {
            coins: 0,
            currentMap: null,
            background: {
                constructor: { name: 'Map6' },
                totalDistanceTraveled: 0,
            },
            enemies: [],
        };
        manager = new BossManager(game);
    });

    describe('basic getters & resetState', () => {
        it('has initial state with no active boss', () => {
            expect(manager.hasActiveBoss).toBe(false);
            expect(manager.isBossVisible).toBe(false);
            expect(manager.bossInFight).toBe(false);
            expect(manager.state.current).toBeNull();
            expect(manager.state.spawned).toBe(false);
        });

        it('exposes hasActiveBoss / isBossVisible / bossInFight correctly', () => {
            manager.state.current = { foo: 'boss' };
            manager.state.isVisible = true;
            manager.state.inFight = true;

            expect(manager.hasActiveBoss).toBe(true);
            expect(manager.isBossVisible).toBe(true);
            expect(manager.bossInFight).toBe(true);
        });

        it('resetState clears all flags and current boss', () => {
            manager.state.current = { dummy: true };
            manager.state.id = 'elyvorg';
            manager.state.map = 'Map6';
            manager.state.spawned = true;
            manager.state.isVisible = true;
            manager.state.talkToBoss = true;
            manager.state.preFight = true;
            manager.state.inFight = true;
            manager.state.postFight = true;
            manager.state.runAway = true;

            manager.state.screenEffect.active = true;
            manager.state.screenEffect.rgb = [1, 2, 3];
            manager.state.screenEffect.opacity = 0.9;
            manager.state.screenEffect.fadeInSpeed = 0.123;

            manager.state.dialogueBeforeOnce = false;
            manager.state.dialogueAfterOnce = true;
            manager.state.dialogueAfterLeaving = true;
            manager.state.startAfterDialogueWhenAnimEnds = true;

            manager.resetState();

            expect(manager.state).toEqual({
                current: null,
                id: null,
                map: null,
                spawned: false,
                isVisible: false,
                talkToBoss: false,
                preFight: false,
                inFight: false,
                postFight: false,
                runAway: false,

                screenEffect: {
                    active: false,
                    rgb: [0, 50, 0],
                    opacity: 0,
                    fadeInSpeed: 0.00298,
                    currentId: null,
                    stack: [],
                    fromRgb: null,
                    targetRgb: null,
                    colorLerpT: 1,
                    colorLerpSpeed: 0.04,
                },

                dialogueBeforeOnce: true,
                dialogueAfterOnce: false,
                dialogueAfterLeaving: false,
                startAfterDialogueWhenAnimEnds: false,
                progressComplete: false,
            });
        });
    });

    describe('getConfigForCurrentMap / getGateForCurrentMap / hasBossConfiguredForCurrentMap', () => {
        it('returns config when currentMap is Map6', () => {
            game.currentMap = 'Map6';
            const cfg = manager.getConfigForCurrentMap();

            expect(cfg).not.toBeNull();
            expect(cfg.id).toBe('elyvorg');
            expect(typeof cfg.type).toBe('function');
            expect(cfg.gate).toEqual({
                mode: 'coinsAndDistance',
                minCoins: 100,
                minDistance: 100,
            });
        });

        it('returns config when map is derived from background.constructor.name', () => {
            game.currentMap = null;
            game.background.constructor.name = 'BonusMap1';

            const cfg = manager.getConfigForCurrentMap();
            expect(cfg).not.toBeNull();
            expect(cfg.id).toBe('glacikal');
            expect(cfg.gate).toEqual({
                mode: 'coinsAndDistance',
                minCoins: 100,
                minDistance: 100,
            });
        });

        it('returns null when no matching map configuration', () => {
            game.currentMap = 'Map1';
            const cfg = manager.getConfigForCurrentMap();
            expect(cfg).toBeNull();
            expect(manager.getGateForCurrentMap()).toBeNull();
            expect(manager.hasBossConfiguredForCurrentMap()).toBe(false);
        });

        it('getGateForCurrentMap returns just the gate object when present', () => {
            game.currentMap = 'Map6';
            const gate = manager.getGateForCurrentMap();
            expect(gate).toEqual({
                mode: 'coinsAndDistance',
                minCoins: 100,
                minDistance: 100,
            });
        });

        it('hasBossConfiguredForCurrentMap reflects existence of config', () => {
            game.currentMap = 'Map6';
            expect(manager.hasBossConfiguredForCurrentMap()).toBe(true);

            game.currentMap = 'NonExistingMap';
            expect(manager.hasBossConfiguredForCurrentMap()).toBe(false);
        });
    });

    describe('bossIsEngaged', () => {
        it('returns false when no boss id is set', () => {
            expect(manager.bossIsEngaged()).toBe(false);
        });

        it('returns false when config is missing or map mismatch', () => {
            manager.state.id = 'elyvorg';
            manager.state.map = 'Map6';
            game.currentMap = 'Map1';
            expect(manager.bossIsEngaged()).toBe(false);
        });

        it('returns true when any engagement flag is true and map/config match', () => {
            game.currentMap = 'Map6';
            manager.state.id = 'elyvorg';
            manager.state.map = 'Map6';

            const flags = ['talkToBoss', 'preFight', 'inFight', 'postFight', 'runAway'];
            for (const flag of flags) {
                manager.state.talkToBoss = false;
                manager.state.preFight = false;
                manager.state.inFight = false;
                manager.state.postFight = false;
                manager.state.runAway = false;

                manager.state[flag] = true;
                expect(manager.bossIsEngaged()).toBe(true);
            }
        });
    });

    describe('bossGateReached', () => {
        it('returns true for Map6 (coins mode) when coins >= minCoins', () => {
            game.currentMap = 'Map6';

            jest.spyOn(manager, 'getGateForCurrentMap').mockReturnValue({
                mode: 'coins',
                minCoins: 0,
            });

            game.coins = 0;
            expect(manager.bossGateReached()).toBe(true);

            game.coins = 5;
            expect(manager.bossGateReached()).toBe(true);
        });

        it('returns false for coins mode when coins < minCoins (via mocked gate)', () => {
            jest.spyOn(manager, 'getGateForCurrentMap').mockReturnValue({
                mode: 'coins',
                minCoins: 100,
            });
            game.coins = 50;
            expect(manager.bossGateReached()).toBe(false);
        });

        it('uses distance for BonusMap1 (distance mode)', () => {
            game.currentMap = 'BonusMap1';

            jest.spyOn(manager, 'getGateForCurrentMap').mockReturnValue({
                mode: 'distance',
                minDistance: 0,
            });

            game.background.totalDistanceTraveled = 5;
            expect(manager.bossGateReached()).toBe(true);

            game.background.totalDistanceTraveled = 15;
            expect(manager.bossGateReached()).toBe(true);
        });

        it('supports coinsAndDistance mode (both must pass)', () => {
            jest.spyOn(manager, 'getGateForCurrentMap').mockReturnValue({
                mode: 'coinsAndDistance',
                minCoins: 10,
                minDistance: 50,
            });

            game.coins = 10;
            game.background.totalDistanceTraveled = 40;
            expect(manager.bossGateReached()).toBe(false);

            game.coins = 5;
            game.background.totalDistanceTraveled = 60;
            expect(manager.bossGateReached()).toBe(false);

            game.coins = 10;
            game.background.totalDistanceTraveled = 60;
            expect(manager.bossGateReached()).toBe(true);
        });

        it('falls back to coins check for unknown gate mode', () => {
            jest.spyOn(manager, 'getGateForCurrentMap').mockReturnValue({
                mode: 'unknown',
                minCoins: 7,
            });
            game.coins = 6;
            expect(manager.bossGateReached()).toBe(false);

            game.coins = 7;
            expect(manager.bossGateReached()).toBe(true);
        });

        it('returns false when there is no gate for the current map', () => {
            jest.spyOn(manager, 'getGateForCurrentMap').mockReturnValue(null);
            expect(manager.bossGateReached()).toBe(false);
        });
    });

    describe('spawnBossIfNeeded', () => {
        it('does nothing when no config exists for current map', () => {
            game.currentMap = 'Map1';
            const result = manager.spawnBossIfNeeded();
            expect(result).toBe(false);
            expect(manager.state.current).toBeNull();
            expect(game.enemies).toHaveLength(0);
        });

        it('does nothing when boss already spawned', () => {
            game.currentMap = 'Map6';
            manager.state.spawned = true;
            const result = manager.spawnBossIfNeeded();
            expect(result).toBe(false);
        });

        it('does nothing when there is already an active boss', () => {
            game.currentMap = 'Map6';
            manager.state.current = { foo: 'boss' };
            const result = manager.spawnBossIfNeeded();
            expect(result).toBe(false);
        });

        it('does nothing when boss gate has not been reached', () => {
            game.currentMap = 'Map6';
            jest.spyOn(manager, 'bossGateReached').mockReturnValue(false);

            const result = manager.spawnBossIfNeeded();
            expect(result).toBe(false);
            expect(manager.state.current).toBeNull();
        });

        it('does nothing when there are still normal enemies on screen', () => {
            game.currentMap = 'Map6';
            jest.spyOn(manager, 'bossGateReached').mockReturnValue(true);
            game.enemies.push({ id: 'regularEnemy' });

            const result = manager.spawnBossIfNeeded();
            expect(result).toBe(false);
        });

        it('spawns Elyvorg for Map6 when gate reached and no enemies present', () => {
            const { Elyvorg } = require('../../../game/entities/enemies/elyvorg.js');

            game.currentMap = 'Map6';
            game.enemies = [];

            jest.spyOn(manager, 'bossGateReached').mockReturnValue(true);

            const result = manager.spawnBossIfNeeded();

            expect(result).toBe(true);
            expect(Elyvorg).toHaveBeenCalledWith(game);
            expect(manager.state.current).toBe(game.enemies[0]);
            expect(manager.state.id).toBe('elyvorg');
            expect(manager.state.map).toBe('Map6');
            expect(manager.state.spawned).toBe(true);
            expect(manager.state.talkToBoss).toBe(true);
            expect(manager.hasActiveBoss).toBe(true);
        });

        it('spawns Glacikal for BonusMap1 when distance gate is reached', () => {
            const { Glacikal } = require('../../../game/entities/enemies/glacikal.js');

            game.currentMap = 'BonusMap1';
            game.enemies = [];

            jest.spyOn(manager, 'bossGateReached').mockReturnValue(true);

            const result = manager.spawnBossIfNeeded();

            expect(result).toBe(true);
            expect(Glacikal).toHaveBeenCalledWith(game);
            expect(manager.state.id).toBe('glacikal');
            expect(manager.state.map).toBe('BonusMap1');
            expect(game.enemies[0]).toBe(manager.state.current);
        });
    });

    describe('screenEffect stack (requestScreenEffect / releaseScreenEffect)', () => {
        it('initial requestScreenEffect creates first layer and initializes effect state', () => {
            const effect = manager.state.screenEffect;
            expect(effect.stack).toEqual([]);
            expect(effect.active).toBe(false);

            manager.requestScreenEffect('intro', {
                rgb: [10, 20, 30],
                fadeInSpeed: 0.01,
                colorLerpSpeed: 0.1,
            });

            expect(effect.stack).toHaveLength(1);
            expect(effect.stack[0]).toEqual({
                id: 'intro',
                rgb: [10, 20, 30],
                fadeInSpeed: 0.01,
                colorLerpSpeed: 0.1,
            });

            expect(effect.active).toBe(true);
            expect(effect.currentId).toBe('intro');
            expect(effect.rgb).toEqual([10, 20, 30]);
            expect(effect.fromRgb).toEqual([10, 20, 30]);
            expect(effect.targetRgb).toEqual([10, 20, 30]);
            expect(effect.colorLerpT).toBe(1);
            expect(effect.opacity).toBe(0);
        });

        it('pushing a second layer updates currentId and starts color lerp from previous rgb', () => {
            const effect = manager.state.screenEffect;

            manager.requestScreenEffect('base', { rgb: [0, 50, 0] });
            manager.requestScreenEffect('overlay', {
                rgb: [100, 0, 0],
                fadeInSpeed: 0.02,
                colorLerpSpeed: 0.2,
            });

            expect(effect.stack.map(l => l.id)).toEqual(['base', 'overlay']);
            expect(effect.currentId).toBe('overlay');
            expect(effect.fadeInSpeed).toBe(0.02);
            expect(effect.colorLerpSpeed).toBe(0.2);

            expect(effect.fromRgb).toEqual([0, 50, 0]);
            expect(effect.targetRgb).toEqual([100, 0, 0]);
            expect(effect.colorLerpT).toBe(0);
        });

        it('updating an existing top layer snaps color to new rgb without starting a lerp', () => {
            const effect = manager.state.screenEffect;

            manager.requestScreenEffect('layer', { rgb: [10, 20, 30] });
            manager.requestScreenEffect('layer', { rgb: [40, 50, 60] });

            expect(effect.stack).toHaveLength(1);
            expect(effect.stack[0].id).toBe('layer');
            expect(effect.stack[0].rgb).toEqual([40, 50, 60]);

            expect(effect.currentId).toBe('layer');
            expect(effect.rgb).toEqual([40, 50, 60]);
            expect(effect.fromRgb).toEqual([40, 50, 60]);
            expect(effect.targetRgb).toEqual([40, 50, 60]);
            expect(effect.colorLerpT).toBe(1);
        });

        it('releaseScreenEffect drops the top layer and transitions back to previous layer', () => {
            const effect = manager.state.screenEffect;

            manager.requestScreenEffect('base', { rgb: [0, 50, 0] });
            manager.requestScreenEffect('overlay', { rgb: [100, 0, 0] });

            expect(effect.stack.map(l => l.id)).toEqual(['base', 'overlay']);
            expect(effect.currentId).toBe('overlay');

            manager.releaseScreenEffect('overlay');

            expect(effect.stack.map(l => l.id)).toEqual(['base']);
            expect(effect.currentId).toBe('base');
            expect(effect.active).toBe(true);
            expect(effect.targetRgb).toEqual([0, 50, 0]);
            expect(effect.colorLerpT).toBe(0);
        });

        it('releaseScreenEffect clears effect when last layer is removed', () => {
            const effect = manager.state.screenEffect;

            manager.requestScreenEffect('solo', { rgb: [1, 2, 3] });
            expect(effect.stack).toHaveLength(1);

            manager.releaseScreenEffect('solo');

            expect(effect.stack).toHaveLength(0);
            expect(effect.currentId).toBeNull();
            expect(effect.active).toBe(false);
        });
    });

    describe('canSpawnNormalEnemies', () => {
        it('returns true when no boss is configured for the current map', () => {
            game.currentMap = 'Map1';
            expect(manager.canSpawnNormalEnemies()).toBe(true);
        });

        it('returns false when boss is engaged', () => {
            game.currentMap = 'Map6';
            manager.state.id = 'elyvorg';
            manager.state.map = 'Map6';
            manager.state.inFight = true;

            expect(manager.canSpawnNormalEnemies()).toBe(false);
        });

        it('returns false when boss gate is already reached', () => {
            game.currentMap = 'Map6';
            jest.spyOn(manager, 'bossGateReached').mockReturnValue(true);
            manager.state.id = null;
            manager.state.map = null;

            expect(manager.canSpawnNormalEnemies()).toBe(false);
        });

        it('returns true when boss exists for map but not engaged and gate not reached', () => {
            game.currentMap = 'Map6';
            jest.spyOn(manager, 'bossGateReached').mockReturnValue(false);
            jest.spyOn(manager, 'bossIsEngaged').mockReturnValue(false);

            expect(manager.canSpawnNormalEnemies()).toBe(true);
        });
    });
});
