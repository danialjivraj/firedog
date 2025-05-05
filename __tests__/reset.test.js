import { Reset } from '../game/reset.js';
import { Player } from '../game/entities/player.js';
import * as Maps from '../game/background/background.js';

jest.mock('../game/background/background.js', () => ({
    Map1: class { },
    Map2: class { },
    Map3: class { },
    Map4: class { },
    Map5: class { },
    Map6: class { }
}));

jest.mock('../game/entities/player.js', () => ({
    Player: jest.fn().mockImplementation(game => ({
        game,
        states: [{ enter: jest.fn() }],
        currentState: null,
        isDarkWhiteBorder: false,
        isUnderwater: false,
        underwaterOrNot: jest.fn()
    }))
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
                explosionSFX: { stopAllSounds: jest.fn() },
                powerUpAndDownSFX: { stopAllSounds: jest.fn() },
                cutsceneMusic: { stopAllSounds: jest.fn() }
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
            elyvorgSpawned: true,
            elyvorgDialogueBeforeDialoguePlayOnce: false,
            elyvorgDialogueAfterDialoguePlayOnce: true,
            elyvorgStartAfterDialogueOnlyWhenAnimationEnds: true,
            elyvorgDialogueAfterDialogueLeaving: true,
            elyvorgRunAway: true,
            talkToElyvorg: true,
            elyvorgDialoguePlayOnce: false,
            isElyvorgFullyVisible: true,
            elyvorgInFight: true,
            elyvorgPreFight: true,
            elyvorgPostFight: true,
            poisonScreen: true,
            poisonColourOpacity: 1,
            menu: {
                levelDifficulty: { setDifficulty: jest.fn() },
                forestMap: { setMap: jest.fn() }
            },
            selectedDifficulty: 'hard',
            width: 800,
            height: 600,
            maxDistance: 500,
            background: { constructor: Maps.Map3 },
            player: null
        };
        reset = new Reset(game);
    });

    describe('coinReset()', () => {
        it('zeros out coins when notEnoughCoins is false', () => {
            game.coins = 50;
            game.notEnoughCoins = false;
            expect(reset.coinReset()).toBeUndefined();
            expect(game.coins).toBe(0);
        });

        it('reduces coins to 10% when notEnoughCoins is true', () => {
            game.coins = 50;
            game.notEnoughCoins = true;
            expect(reset.coinReset()).toBeUndefined();
            expect(game.coins).toBe(Math.floor(0.1 * 50));
        });

        it('handles zero coins edge case', () => {
            game.coins = 0;
            game.notEnoughCoins = true;
            expect(reset.coinReset()).toBeUndefined();
            expect(game.coins).toBe(0);
        });

        it('handles negative coins edge case', () => {
            game.coins = -10;
            game.notEnoughCoins = true;
            expect(reset.coinReset()).toBeUndefined();
            expect(game.coins).toBe(Math.floor(0.1 * -10));
        });
    });

    describe('reset()', () => {
        it('does not throw when currentCutscene is null', () => {
            game.currentCutscene = null;
            expect(() => reset.reset()).not.toThrow();
            expect(reset.reset()).toBeUndefined();
        });

        it('does not remove cutscene listeners when currentCutscene is null', () => {
            const dummy = { removeEventListeners: jest.fn() };
            game.currentCutscene = dummy;
            game.currentCutscene = null;
            reset.reset();
            expect(dummy.removeEventListeners).not.toHaveBeenCalled();
        });

        it('removes cutscene listeners when present', () => {
            reset.reset();
            expect(game.currentCutscene.removeEventListeners).toHaveBeenCalled();
        });

        it('resets tutorial state even if already paused or out-of-range', () => {
            game.tutorial = { elapsedTime: 999, currentStepIndex: 99, tutorialPause: true };
            reset.reset();
            expect(game.tutorial).toEqual({ elapsedTime: 0, currentStepIndex: 0, tutorialPause: true });
        });

        it('resets main game flags', () => {
            reset.reset();
            expect(game.speed).toBe(0);
            expect(game.time).toBe(0);
            expect(game.invisibleColourOpacity).toBe(0);
            expect(game.gameOver).toBe(false);
        });

        it('resets coins and notEnoughCoins flag', () => {
            game.coins = 80;
            game.notEnoughCoins = true;
            reset.reset();
            expect(game.coins).toBe(Math.floor(0.1 * 80));
            expect(game.notEnoughCoins).toBe(false);
        });

        it('initializes a new player on each reset', () => {
            Player.mockClear();
            reset.reset();
            const firstPlayer = game.player;
            reset.reset();
            expect(game.player).not.toBe(firstPlayer);
            expect(Player).toHaveBeenCalledTimes(2);
        });

        it('enters the initial player state on reset and sets it as currentState', () => {
            reset.reset();
            expect(game.player.states[0].enter).toHaveBeenCalled();
            expect(game.player.currentState).toBe(game.player.states[0]);
        });

        it('invokes player.underwaterOrNot() after map is set', () => {
            reset.reset();
            expect(game.player.underwaterOrNot).toHaveBeenCalled();
        });

        it('stops all audio', () => {
            reset.reset();
            Object.values(game.audioHandler).forEach(handler => {
                expect(handler.stopAllSounds).toHaveBeenCalled();
            });
        });

        it('clears entities and resets arrays', () => {
            reset.reset();
            [
                'enemies', 'behindPlayerParticles', 'particles', 'collisions',
                'floatingMessages', 'powerUps', 'powerDowns', 'cabins', 'penguins', 'cutscenes'
            ].forEach(key => {
                expect(game[key]).toEqual([]);
            });
            expect(game.isEndCutscene).toBe(false);
            expect(game.endCutscene).toHaveBeenCalled();
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

        it('resets elyvorg and poison flags', () => {
            reset.reset();
            expect(game.elyvorgSpawned).toBe(false);
            expect(game.elyvorgDialogueBeforeDialoguePlayOnce).toBe(true);
            expect(game.elyvorgDialogueAfterDialoguePlayOnce).toBe(false);
            expect(game.elyvorgRunAway).toBe(false);
            expect(game.talkToElyvorg).toBe(false);
            expect(game.elyvorgDialoguePlayOnce).toBe(true);
            expect(game.isElyvorgFullyVisible).toBe(false);
            expect(game.elyvorgInFight).toBe(false);
            expect(game.poisonScreen).toBe(false);
            expect(game.poisonColourOpacity).toBe(0);
        });

        it('resets all elyvorg-related flags', () => {
            reset.reset();
            expect(game.elyvorgStartAfterDialogueOnlyWhenAnimationEnds).toBe(false);
            expect(game.elyvorgDialogueAfterDialogueLeaving).toBe(false);
            expect(game.elyvorgPreFight).toBe(false);
            expect(game.elyvorgPostFight).toBe(false);
        });

        describe('map selection branches', () => {
            it('defaults to Map1 with no flags', () => {
                game.background = { constructor: Maps.Map1 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(expect.any(Maps.Map1));
                expect(game.player.isDarkWhiteBorder).toBe(false);
                expect(game.player.isUnderwater).toBe(false);
            });

            it('applies Map2 and dark-white border flag', () => {
                game.background = { constructor: Maps.Map2 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(expect.any(Maps.Map2));
                expect(game.player.isDarkWhiteBorder).toBe(true);
            });

            it('applies Map3 and underwater flag', () => {
                game.background = { constructor: Maps.Map3 };
                reset.reset();
                expect(game.player.isUnderwater).toBe(true);
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(expect.any(Maps.Map3));
            });

            it('applies Map4 with no extra flags', () => {
                game.background = { constructor: Maps.Map4 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(expect.any(Maps.Map4));
                expect(game.player.isDarkWhiteBorder).toBe(false);
                expect(game.player.isUnderwater).toBe(false);
            });

            it('applies Map5 with no extra flags', () => {
                game.background = { constructor: Maps.Map5 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(expect.any(Maps.Map5));
                expect(game.player.isDarkWhiteBorder).toBe(false);
                expect(game.player.isUnderwater).toBe(false);
            });

            it('applies Map6 and sets maxDistance, without flipping other flags', () => {
                game.background = { constructor: Maps.Map6 };
                reset.reset();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(expect.any(Maps.Map6));
                expect(game.maxDistance).toBe(9999999);
                expect(game.player.isDarkWhiteBorder).toBe(false);
                expect(game.player.isUnderwater).toBe(false);
            });

            it('handles an unrecognized map constructor gracefully', () => {
                game.background = { constructor: class Foo { } };
                expect(() => reset.reset()).not.toThrow();
                expect(game.menu.forestMap.setMap).toHaveBeenCalledWith(undefined);
            });
        });

        it('sets difficulty correctly', () => {
            reset.reset();
            expect(game.menu.levelDifficulty.setDifficulty)
                .toHaveBeenCalledWith(game.selectedDifficulty);
        });

        it('is idempotent when called twice', () => {
            expect(() => { reset.reset(); reset.reset(); }).not.toThrow();
            expect(game.speed).toBe(0);
            expect(game.coins).toBe(0);
            expect(reset.reset()).toBeUndefined();
        });
    });
});
