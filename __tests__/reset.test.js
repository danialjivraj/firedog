import { Reset } from '../game/reset.js';
import { Player } from '../game/entities/player.js';
import * as Maps from '../game/background/maps.js';

jest.mock('../game/background/maps.js', () => ({
    Map1: class { },
    Map2: class { },
    Map3: class { },
    Map4: class { },
    Map5: class { },
    Map6: class { },
    Map7: class { },
    BonusMap1: class { },
    BonusMap2: class { },
    BonusMap3: class { },
}));

jest.mock('../game/entities/player.js', () => ({
    Player: jest.fn().mockImplementation((game) => ({
        game,
        states: [{ enter: jest.fn() }],
        currentState: null,
        isUnderwater: false,
        isIce: false,
        isSpace: false,
    })),
}));

describe('Reset', () => {
    let game;
    let reset;

    beforeEach(() => {
        const knownMapClasses = new Set(Object.values(Maps));

        game = {
            coins: 100,
            notEnoughCoins: false,

            // cutscenes
            currentCutscene: { removeEventListeners: jest.fn() },
            cutscenes: [1],
            cutsceneActive: true,
            isEndCutscene: true,
            endCutscene: jest.fn(),

            clearCutsceneState: jest.fn(function () {
                this.cutsceneActive = false;
                this.currentCutscene = null;
                this.isEndCutscene = false;
                this.pauseContext = 'gameplay';
                this.currentMenu = null;
                this.cutscenes = [];

                if (this.input) {
                    this.input.keys = [];
                }
            }),

            // tutorial
            tutorial: { elapsedTime: 10, currentStepIndex: 2, tutorialPause: false },

            // shake
            shakeActive: true,
            shakeTimer: 5,
            shakeDuration: 10,
            stopShake: jest.fn(function () {
                this.shakeActive = false;
                this.shakeTimer = 0;
                this.shakeDuration = 0;
            }),

            // distortion
            distortionActive: true,
            distortionEffect: { reset: jest.fn() },

            // core game flags
            speed: 5,
            time: 10,
            invisibleColourOpacity: 1,
            gameOver: true,

            // records
            _fullClearRecorded: true,

            // audio
            audioHandler: {
                mapSoundtrack: { stopAllSounds: jest.fn() },
                firedogSFX: { stopAllSounds: jest.fn() },
                enemySFX: { stopAllSounds: jest.fn() },
                collisionSFX: { stopAllSounds: jest.fn() },
                powerUpAndDownSFX: { stopAllSounds: jest.fn() },
                cutsceneMusic: { stopAllSounds: jest.fn() },
                cutsceneSFX: { stopAllSounds: jest.fn() },
                cutsceneDialogue: { stopAllSounds: jest.fn() },
            },

            // collections
            enemies: [1],
            behindPlayerParticles: [1],
            particles: [1],
            collisions: [1],
            floatingMessages: [1],
            powerUps: [1],
            powerDowns: [1],

            // input
            input: { keys: ['A'] },

            // cabin
            cabinAppeared: true,
            cabin: { isFullyVisible: true, x: 0 },

            // penguin
            penguinAppeared: true,
            penguini: { x: 999, showEnterToTalkToPenguini: true },
            talkToPenguin: true,
            enterToTalkToPenguin: true,
            talkToPenguinOneTimeOnly: false,

            // boss
            bossManager: { resetState: jest.fn() },

            // menu / difficulty / maps
            menu: {
                difficulty: { applyCurrentSettings: jest.fn() },
                forestMap: {
                    setMap: jest.fn(),
                    getMapOptionByClass: jest.fn((MapClass) =>
                        knownMapClasses.has(MapClass) ? { Map: MapClass } : null
                    ),
                    applyMapOption: jest.fn(),
                },
            },

            width: 800,
            height: 600,
            maxDistance: 500,

            // default background / player
            background: { constructor: Maps.Map3 },
            player: null,
        };

        reset = new Reset(game);
    });

    describe('coinReset()', () => {
        it('zeros out coins when notEnoughCoins is false', () => {
            game.coins = 50;
            game.notEnoughCoins = false;
            reset.coinReset();
            expect(game.coins).toBe(0);
        });

        it('reduces coins to 10% when notEnoughCoins is true', () => {
            game.coins = 50;
            game.notEnoughCoins = true;
            reset.coinReset();
            expect(game.coins).toBe(5);
        });

        it('handles zero coins', () => {
            game.coins = 0;
            game.notEnoughCoins = true;
            reset.coinReset();
            expect(game.coins).toBe(0);
        });

        it('handles negative coin amounts', () => {
            game.coins = -10;
            game.notEnoughCoins = true;
            reset.coinReset();
            expect(game.coins).toBe(-1);
        });
    });

    describe('reset()', () => {
        describe('cutscene handling', () => {
            it('does not throw when currentCutscene is null', () => {
                game.currentCutscene = null;
                expect(() => reset.reset()).not.toThrow();
            });

            it('removes cutscene listeners when a cutscene is active', () => {
                const cs = game.currentCutscene;
                reset.reset();
                expect(cs.removeEventListeners).toHaveBeenCalled();
            });

            it('does not remove listeners on a previous cutscene when currentCutscene is null', () => {
                const dummy = { removeEventListeners: jest.fn() };
                game.currentCutscene = dummy;
                game.currentCutscene = null;
                reset.reset();
                expect(dummy.removeEventListeners).not.toHaveBeenCalled();
            });
        });

        it('resets screen shake state', () => {
            game.shakeActive = true;
            game.shakeTimer = 20;
            game.shakeDuration = 40;

            reset.reset();

            expect(game.stopShake).toHaveBeenCalledTimes(1);
            expect(game.shakeActive).toBe(false);
            expect(game.shakeTimer).toBe(0);
            expect(game.shakeDuration).toBe(0);
        });

        it('disables distortion and resets the distortion effect when available', () => {
            reset.reset();

            expect(game.distortionActive).toBe(false);
            expect(game.distortionEffect.reset).toHaveBeenCalledTimes(1);
        });

        it('does not throw if distortionEffect is missing or has no reset()', () => {
            game.distortionEffect = null;
            expect(() => reset.reset()).not.toThrow();

            game.distortionEffect = {};
            expect(() => reset.reset()).not.toThrow();
        });

        it('resets tutorial state', () => {
            game.tutorial = { elapsedTime: 999, currentStepIndex: 99, tutorialPause: false };

            reset.reset();

            expect(game.tutorial).toEqual({
                elapsedTime: 0,
                currentStepIndex: 0,
                tutorialPause: true,
            });
        });

        it('resets core game flags (including time by default)', () => {
            reset.reset();

            expect(game.speed).toBe(0);
            expect(game.time).toBe(0);
            expect(game.invisibleColourOpacity).toBe(0);
            expect(game.gameOver).toBe(false);
        });

        it('preserves time when called with preserveTime: true', () => {
            game.time = 777;

            reset.reset({ preserveTime: true });

            expect(game.time).toBe(777);
            expect(game.speed).toBe(0);
        });

        it('resets coins via coinReset() and clears notEnoughCoins flag', () => {
            game.coins = 80;
            game.notEnoughCoins = true;

            reset.reset();

            expect(game.coins).toBe(8);
            expect(game.notEnoughCoins).toBe(false);
        });

        it('clears record-related flags (e.g. _fullClearRecorded)', () => {
            game._fullClearRecorded = true;

            reset.reset();

            expect(game._fullClearRecorded).toBe(false);
        });

        it('clears any cutscene state and clears isEndCutscene flag without calling endCutscene()', () => {
            game.isEndCutscene = true;

            reset.reset();

            expect(game.endCutscene).not.toHaveBeenCalled();
            expect(game.isEndCutscene).toBe(false);
            expect(game.cutsceneActive).toBe(false);
            expect(game.currentCutscene).toBe(null);
            expect(game.cutscenes).toEqual([]);
        });

        it('creates a new player instance on each reset', () => {
            Player.mockClear();

            reset.reset();
            const first = game.player;

            reset.reset();

            expect(game.player).not.toBe(first);
            expect(Player).toHaveBeenCalledTimes(2);
        });

        it('enters the initial player state', () => {
            reset.reset();

            expect(game.player.states[0].enter).toHaveBeenCalled();
            expect(game.player.currentState).toBe(game.player.states[0]);
        });

        it('stops all audio handlers', () => {
            reset.reset();

            Object.values(game.audioHandler).forEach((h) => {
                expect(h.stopAllSounds).toHaveBeenCalled();
            });
        });

        it('clears all game object arrays', () => {
            reset.reset();

            [
                'enemies',
                'behindPlayerParticles',
                'particles',
                'collisions',
                'floatingMessages',
                'powerUps',
                'powerDowns',
                'cutscenes',
            ].forEach((key) => expect(game[key]).toEqual([]));
        });

        it('clears input keys', () => {
            reset.reset();
            expect(game.input.keys).toEqual([]);
        });

        it('resets cabin and penguin flags', () => {
            reset.reset();

            expect(game.cabinAppeared).toBe(false);
            expect(game.cabin.isFullyVisible).toBe(false);
            expect(game.cabin.x).toBe(game.width);

            expect(game.penguinAppeared).toBe(false);
            expect(game.penguini.x).toBe(game.width);
            expect(game.penguini.showEnterToTalkToPenguini).toBe(false);
            expect(game.talkToPenguin).toBe(false);
            expect(game.enterToTalkToPenguin).toBe(false);
            expect(game.talkToPenguinOneTimeOnly).toBe(true);
        });

        it('delegates boss reset to bossManager.resetState()', () => {
            reset.reset();

            expect(game.bossManager.resetState).toHaveBeenCalledTimes(1);
        });

        it('reapplies the current difficulty settings', () => {
            reset.reset();
            expect(game.menu.difficulty.applyCurrentSettings).toHaveBeenCalledTimes(1);
        });

        describe('map selection', () => {
            it.each([
                ['Map1', Maps.Map1],
                ['Map2', Maps.Map2],
                ['Map3', Maps.Map3],
                ['Map4', Maps.Map4],
                ['Map5', Maps.Map5],
                ['Map6', Maps.Map6],
                ['Map7', Maps.Map7],
                ['BonusMap1', Maps.BonusMap1],
                ['BonusMap2', Maps.BonusMap2],
                ['BonusMap3', Maps.BonusMap3],
            ])('loads %s, applies its forest map option, and updates forest map', (_name, MapClass) => {
                game.background = { constructor: MapClass };

                reset.reset();

                const option = game.menu.forestMap.getMapOptionByClass.mock.results[0].value;
                expect(game.menu.forestMap.getMapOptionByClass).toHaveBeenCalledWith(MapClass);
                expect(game.menu.forestMap.applyMapOption).toHaveBeenCalledWith(option);
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(expect.any(MapClass));
            });

            it('handles unrecognized map constructors without throwing', () => {
                game.background = { constructor: class Foo { } };

                expect(() => reset.reset()).not.toThrow();
                expect(game.menu.forestMap.getMapOptionByClass).toHaveBeenCalledWith(game.background.constructor);
                expect(game.menu.forestMap.applyMapOption).toHaveBeenCalledWith(null);
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(expect.any(game.background.constructor));
            });
        });

        it('is idempotent', () => {
            expect(() => {
                reset.reset();
                reset.reset();
            }).not.toThrow();
        });
    });
});
