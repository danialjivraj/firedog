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
    })),
}));

describe('Reset', () => {
    let game;
    let reset;

    beforeEach(() => {
        game = {
            coins: 100,
            notEnoughCoins: false,
            tutorial: { elapsedTime: 10, currentStepIndex: 2, tutorialPause: false },
            currentCutscene: { removeEventListeners: jest.fn() },
            cutscenes: [],
            isEndCutscene: true,
            endCutscene: jest.fn(),
            speed: 5,
            time: 10,
            invisibleColourOpacity: 1,
            gameOver: true,
            audioHandler: {
                mapSoundtrack: { stopAllSounds: jest.fn() },
                firedogSFX: { stopAllSounds: jest.fn() },
                enemySFX: { stopAllSounds: jest.fn() },
                collisionSFX: { stopAllSounds: jest.fn() },
                powerUpAndDownSFX: { stopAllSounds: jest.fn() },
                cutsceneMusic: { stopAllSounds: jest.fn() },
            },
            enemies: [1],
            behindPlayerParticles: [1],
            particles: [1],
            collisions: [1],
            floatingMessages: [1],
            powerUps: [1],
            powerDowns: [1],
            cabins: [1],
            penguins: [1],
            input: { keys: ['A'] },

            cabinAppeared: true,
            cabin: { isFullyVisible: true, x: 0 },

            penguinAppeared: true,
            talkToPenguin: true,
            enterToTalkToPenguin: true,
            talkToPenguinOneTimeOnly: false,

            bossManager: { resetState: jest.fn() },

            menu: {
                levelDifficulty: { setDifficulty: jest.fn() },
                forestMap: { setMap: jest.fn() },
            },

            selectedDifficulty: 'hard',
            width: 800,
            height: 600,
            maxDistance: 500,

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

        it('handles negative coins', () => {
            game.coins = -10;
            game.notEnoughCoins = true;
            reset.coinReset();
            expect(game.coins).toBe(-1);
        });
    });

    describe('reset()', () => {

        it('does not throw when currentCutscene is null', () => {
            game.currentCutscene = null;
            expect(() => reset.reset()).not.toThrow();
        });

        it('removes cutscene listeners when present', () => {
            reset.reset();
            expect(game.currentCutscene.removeEventListeners).toHaveBeenCalled();
        });

        it('does not remove listeners when cutscene is null', () => {
            const dummy = { removeEventListeners: jest.fn() };
            game.currentCutscene = dummy;
            game.currentCutscene = null;
            reset.reset();
            expect(dummy.removeEventListeners).not.toHaveBeenCalled();
        });

        it('resets tutorial state', () => {
            game.tutorial = { elapsedTime: 999, currentStepIndex: 99, tutorialPause: true };
            reset.reset();
            expect(game.tutorial).toEqual({
                elapsedTime: 0,
                currentStepIndex: 0,
                tutorialPause: true
            });
        });

        it('resets main game flags', () => {
            reset.reset();
            expect(game.speed).toBe(0);
            expect(game.time).toBe(0);
            expect(game.invisibleColourOpacity).toBe(0);
            expect(game.gameOver).toBe(false);
        });

        it('resets coins and notEnoughCoins', () => {
            game.coins = 80;
            game.notEnoughCoins = true;
            reset.reset();
            expect(game.coins).toBe(8);
            expect(game.notEnoughCoins).toBe(false);
        });

        it('creates a new player', () => {
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

        it('clears all arrays', () => {
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

        it('Map1 loads correctly', () => {
            game.background = { constructor: Maps.Map1 };
            reset.reset();
            expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(expect.any(Maps.Map1));
        });

        it('Map2 enables darkWhiteBorder', () => {
            game.background = { constructor: Maps.Map2 };
            reset.reset();
            expect(game.player.isDarkWhiteBorder).toBe(true);
        });

        it('Map3 enables underwater', () => {
            game.background = { constructor: Maps.Map3 };
            reset.reset();
            expect(game.player.isUnderwater).toBe(true);
        });

        it('Map6 sets maxDistance', () => {
            game.background = { constructor: Maps.Map6 };
            reset.reset();
            expect(game.maxDistance).toBe(9999999);
        });

        it('BonusMap1 enables ice', () => {
            game.background = { constructor: Maps.BonusMap1 };
            reset.reset();
            expect(game.player.isIce).toBe(true);
        });

        it('unrecognized map constructor does not throw', () => {
            game.background = { constructor: class Foo { } };
            expect(() => reset.reset()).not.toThrow();
            expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(undefined);
        });

        it('sets difficulty correctly', () => {
            reset.reset();
            expect(game.menu.levelDifficulty.setDifficulty)
                .toHaveBeenCalledWith('hard');
        });

        it('is idempotent', () => {
            expect(() => {
                reset.reset();
                reset.reset();
            }).not.toThrow();
        });
    });
});
