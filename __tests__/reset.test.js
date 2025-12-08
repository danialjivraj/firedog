import { Reset } from '../game/reset.js';
import { Player } from '../game/entities/player.js';
import * as Maps from '../game/background/background.js';

jest.mock('../game/background/background.js', () => ({
    Map1: class { },
    Map2: class { },
    Map3: class { },
    Map4: class { },
    Map5: class { },
    Map6: class { },
    BonusMap1: class { },
    BonusMap2: class { },
    BonusMap3: class { },
}));

jest.mock('../game/entities/player.js', () => ({
    Player: jest.fn().mockImplementation(game => ({
        game,
        states: [{ enter: jest.fn() }],
        currentState: null,
        isDarkWhiteBorder: false,
        isUnderwater: false,
        isIce: false,
        isSpace: false,
    })),
}));

describe('Reset', () => {
    let game;
    let reset;

    beforeEach(() => {
        game = {
            coins: 100,
            notEnoughCoins: false,

            // cutscenes
            currentCutscene: { removeEventListeners: jest.fn() },
            cutscenes: [],
            isEndCutscene: true,
            endCutscene: jest.fn(),

            // tutorial
            tutorial: { elapsedTime: 10, currentStepIndex: 2, tutorialPause: false },

            // shake
            shakeActive: true,
            shakeTimer: 5,
            shakeDuration: 10,

            // core game flags
            speed: 5,
            time: 10,
            invisibleColourOpacity: 1,
            gameOver: true,

            // audio
            audioHandler: {
                mapSoundtrack: { stopAllSounds: jest.fn() },
                firedogSFX: { stopAllSounds: jest.fn() },
                enemySFX: { stopAllSounds: jest.fn() },
                collisionSFX: { stopAllSounds: jest.fn() },
                powerUpAndDownSFX: { stopAllSounds: jest.fn() },
                cutsceneMusic: { stopAllSounds: jest.fn() },
            },

            // collections
            enemies: [1],
            behindPlayerParticles: [1],
            particles: [1],
            collisions: [1],
            floatingMessages: [1],
            powerUps: [1],
            powerDowns: [1],
            cabins: [1],
            penguins: [1],

            // input
            input: { keys: ['A'] },

            // cabin
            cabinAppeared: true,
            cabin: { isFullyVisible: true, x: 0 },

            // penguin
            penguinAppeared: true,
            talkToPenguin: true,
            enterToTalkToPenguin: true,
            talkToPenguinOneTimeOnly: false,

            // boss
            bossManager: { resetState: jest.fn() },

            // menu / difficulty / maps
            menu: {
                levelDifficulty: { setDifficulty: jest.fn() },
                forestMap: { setMap: jest.fn() },
            },

            selectedDifficulty: 'hard',
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
                reset.reset();
                expect(game.currentCutscene.removeEventListeners).toHaveBeenCalled();
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

            expect(game.shakeActive).toBe(false);
            expect(game.shakeTimer).toBe(0);
            expect(game.shakeDuration).toBe(0);
        });

        it('resets tutorial state', () => {
            game.tutorial = { elapsedTime: 999, currentStepIndex: 99, tutorialPause: true };
            reset.reset();
            expect(game.tutorial).toEqual({
                elapsedTime: 0,
                currentStepIndex: 0,
                tutorialPause: true,
            });
        });

        it('resets core game flags', () => {
            reset.reset();
            expect(game.speed).toBe(0);
            expect(game.time).toBe(0);
            expect(game.invisibleColourOpacity).toBe(0);
            expect(game.gameOver).toBe(false);
        });

        it('resets coins and clears notEnoughCoins flag', () => {
            game.coins = 80;
            game.notEnoughCoins = true;
            reset.reset();
            expect(game.coins).toBe(8);
            expect(game.notEnoughCoins).toBe(false);
        });

        it('ends any active end cutscene and clears isEndCutscene flag', () => {
            game.isEndCutscene = true;
            reset.reset();
            expect(game.endCutscene).toHaveBeenCalledTimes(1);
            expect(game.isEndCutscene).toBe(false);
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
            Object.values(game.audioHandler).forEach(h =>
                expect(h.stopAllSounds).toHaveBeenCalled()
            );
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
                'cabins',
                'penguins',
                'cutscenes',
            ].forEach(key => expect(game[key]).toEqual([]));
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
            expect(game.talkToPenguin).toBe(false);
            expect(game.enterToTalkToPenguin).toBe(false);
            expect(game.talkToPenguinOneTimeOnly).toBe(true);
        });

        it('delegates boss reset to bossManager.resetState()', () => {
            reset.reset();
            expect(game.bossManager.resetState).toHaveBeenCalledTimes(1);
        });

        it('sets difficulty according to selectedDifficulty', () => {
            reset.reset();
            expect(game.menu.levelDifficulty.setDifficulty).toHaveBeenCalledWith('hard');
        });

        describe('map selection', () => {
            it('loads Map1 and updates forest map', () => {
                game.background = { constructor: Maps.Map1 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(
                    expect.any(Maps.Map1)
                );
            });

            it('loads Map2 and enables darkWhiteBorder', () => {
                game.background = { constructor: Maps.Map2 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(
                    expect.any(Maps.Map2)
                );
                expect(game.player.isDarkWhiteBorder).toBe(true);
            });

            it('loads Map3 and enables underwater mode', () => {
                game.background = { constructor: Maps.Map3 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(
                    expect.any(Maps.Map3)
                );
                expect(game.player.isUnderwater).toBe(true);
            });

            it('loads Map4 and updates forest map', () => {
                game.background = { constructor: Maps.Map4 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(
                    expect.any(Maps.Map4)
                );
            });

            it('loads Map5 and updates forest map', () => {
                game.background = { constructor: Maps.Map5 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(
                    expect.any(Maps.Map5)
                );
            });

            it('loads Map6, updates forest map, and sets maxDistance', () => {
                game.background = { constructor: Maps.Map6 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(
                    expect.any(Maps.Map6)
                );
                expect(game.maxDistance).toBe(9999999);
            });

            it('loads BonusMap1, updates forest map, sets maxDistance, and enables ice mode', () => {
                game.background = { constructor: Maps.BonusMap1 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(
                    expect.any(Maps.BonusMap1)
                );
                expect(game.maxDistance).toBe(9999999);
                expect(game.player.isIce).toBe(true);
            });

            it('loads BonusMap2 and updates forest map', () => {
                game.background = { constructor: Maps.BonusMap2 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(
                    expect.any(Maps.BonusMap2)
                );
            });

            it('loads BonusMap3, updates forest map, and enables space mode', () => {
                game.background = { constructor: Maps.BonusMap3 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(
                    expect.any(Maps.BonusMap3)
                );
                expect(game.player.isSpace).toBe(true);
            });

            it('handles unrecognized map constructors without throwing and passes undefined to setMap', () => {
                game.background = { constructor: class Foo { } };
                expect(() => reset.reset()).not.toThrow();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(undefined);
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
