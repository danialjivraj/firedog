import {
    StoryCutscene,
    Map1EndCutscene,
    Map2EndCutscene,
    Map3EndCutscene,
    Map4EndCutscene,
    Map5EndCutscene,
    Map6EndCutscene,
    Map7EndCutscene,
    BonusMap1EndCutscene,
    BonusMap2EndCutscene,
    BonusMap3EndCutscene,
} from '../../game/cutscene/storyCutscenes.js';
import * as fading from '../../game/animations/fading.js';

jest.useFakeTimers();

describe('StoryCutscene', () => {
    let game;
    let cutscene;

    beforeEach(() => {
        game = {
            width: 1920,
            height: 689,
            coins: 0,
            winningCoins: 0,

            menu: {
                pause: { isPaused: false },
                wardrobe: {
                    getCurrentSkinId: jest.fn(() => 'defaultSkin'),
                    getCurrentCosmeticKey: jest.fn(() => 'none'),
                    getCurrentCosmeticsChromaState: jest.fn(() => ({})),
                },
            },

            fadingIn: false,
            enterDuringBackgroundTransition: true,
            waitForFadeInOpacity: false,

            currentMap: 'Map1',
            isEndCutscene: false,
            isPlayerInGame: true,

            input: { keys: [] },

            endCutscene: jest.fn(),
            stopShake: jest.fn(),

            audioHandler: {
                cutsceneDialogue: {
                    stopAllSounds: jest.fn(),
                    playSound: jest.fn(),
                    pauseSound: jest.fn(),
                },
                cutsceneSFX: {
                    stopAllSounds: jest.fn(),
                    playSound: jest.fn(),
                    fadeOutAndStop: jest.fn(),
                    fadeOutAndStopAllSounds: jest.fn(),
                },
                cutsceneMusic: {
                    stopAllSounds: jest.fn(),
                    playSound: jest.fn(),
                    fadeOutAndStop: jest.fn(),
                    fadeOutAndStopAllSounds: jest.fn(),
                },
            },

            shakeActive: false,
            cutsceneActive: true,
            talkToPenguin: false,
            boss: { talkToBoss: false },

            canvas: document.createElement('canvas'),
            ignoreCutsceneInputUntil: 0,
        };

        jest.spyOn(fading, 'fadeInAndOut')
            .mockImplementation((_canvas, _fadeIn, _stay, _fadeOut, cb) => cb());

        cutscene = new StoryCutscene(game);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.restoreAllMocks();
    });

    it('sets StoryCutscene-specific characterLimit and textBoxWidth', () => {
        expect(cutscene.characterLimit).toBe(75);
        expect(cutscene.textBoxWidth).toBe(1050);
    });

    describe('displayDialogue: keyboard and mouse handling', () => {
        beforeEach(() => {
            cutscene.dialogue = [
                { character: 'A', dialogue: 'Hello!', images: [] },
                { character: 'B', dialogue: 'Bye!', images: [] },
            ];
            cutscene.displayDialogue();
        });

        it('pressing Tab skips to the final dialogue and ends the cutscene after the timeout', () => {
            const removeSpy = jest.spyOn(cutscene, 'removeEventListeners');
            const bgSpy = jest.spyOn(cutscene, 'cutsceneBackgroundChange');
            const fadeSpy = jest.spyOn(cutscene, 'fadeOutAndStopAllAudio');

            cutscene.handleKeyDown({ key: 'Tab' });

            expect(removeSpy).toHaveBeenCalled();
            expect(bgSpy).toHaveBeenCalledWith(400, 600, 400);

            jest.advanceTimersByTime(500);

            expect(cutscene.dialogueIndex).toBe(cutscene.dialogue.length - 1);
            expect(game.endCutscene).toHaveBeenCalled();
            expect(game.stopShake).toHaveBeenCalled();
            expect(game.isPlayerInGame).toBe(true);
            expect(fadeSpy).toHaveBeenCalled();
        });

        it('pressing Tab sets isPlayerInGame to false when game.isEndCutscene is true', () => {
            game.isEndCutscene = true;

            cutscene.handleKeyDown({ key: 'Tab' });
            jest.advanceTimersByTime(500);

            expect(game.isPlayerInGame).toBe(false);
        });

        it('pressing Enter delegates to enterOrLeftClick when conditions are satisfied', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.isEnterPressed = false;

            cutscene.handleKeyDown({ key: 'Enter' });

            expect(spy).toHaveBeenCalled();
        });

        it('left mouse click delegates to enterOrLeftClick when allowed', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.isEnterPressed = false;

            cutscene.handleLeftClick({ button: 0 });

            expect(spy).toHaveBeenCalled();
        });

        it('does not delegate Enter when isEnterPressed is already true', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.isEnterPressed = true;

            cutscene.handleKeyDown({ key: 'Enter' });

            expect(spy).not.toHaveBeenCalled();
        });

        it('does not delegate Enter or click when fadingIn is true', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            game.fadingIn = true;
            cutscene.isEnterPressed = false;

            cutscene.handleKeyDown({ key: 'Enter' });
            cutscene.handleLeftClick({ button: 0 });

            expect(spy).not.toHaveBeenCalled();
        });

        it('does not delegate Enter or click when enterDuringBackgroundTransition is false', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            game.enterDuringBackgroundTransition = false;
            cutscene.isEnterPressed = false;

            cutscene.handleKeyDown({ key: 'Enter' });
            cutscene.handleLeftClick({ button: 0 });

            expect(spy).not.toHaveBeenCalled();
        });

        it('does not delegate Enter or click when waitForFadeInOpacity is true', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            game.waitForFadeInOpacity = true;
            cutscene.isEnterPressed = false;

            cutscene.handleKeyDown({ key: 'Enter' });
            cutscene.handleLeftClick({ button: 0 });

            expect(spy).not.toHaveBeenCalled();
        });

        it('does not skip on Tab when fadingIn is true', () => {
            const removeSpy = jest.spyOn(cutscene, 'removeEventListeners');
            game.fadingIn = true;

            cutscene.handleKeyDown({ key: 'Tab' });

            expect(removeSpy).not.toHaveBeenCalled();
        });
    });

    describe('enterOrLeftClick: dialogue progression rules', () => {
        beforeEach(() => {
            cutscene.dialogue = [
                { character: 'A', dialogue: 'a...b', images: [] },
                { character: 'B', dialogue: 'end', images: [] },
            ];
            cutscene.dialogueIndex = 0;
            cutscene.fullWordsColor = ['a...b'];
        });

        it('calls runCurrentDialogueAdvanceActionIfAny first', () => {
            const advanceSpy = jest.spyOn(cutscene, 'runCurrentDialogueAdvanceActionIfAny');

            cutscene.textIndex = 0;
            cutscene.enterOrLeftClick();

            expect(advanceSpy).toHaveBeenCalled();
        });

        it('resets playSound2OnDotPause and marks isEnterPressed true immediately', () => {
            cutscene.playSound2OnDotPause = true;
            cutscene.isEnterPressed = false;
            cutscene.textIndex = 0;

            cutscene.enterOrLeftClick();

            expect(cutscene.playSound2OnDotPause).toBe(false);
            expect(cutscene.isEnterPressed).toBe(true);
        });

        it('advances a single character when continueDialogue is true', () => {
            cutscene.continueDialogue = true;
            cutscene.textIndex = 2;

            cutscene.enterOrLeftClick();

            expect(cutscene.pause).toBe(false);
            expect(cutscene.textIndex).toBe(3);
            expect(cutscene.continueDialogue).toBe(false);
        });

        it('jumps to the next ellipsis when one exists after the current text index', () => {
            cutscene.dialogue = [{ character: 'A', dialogue: 'A...B', images: [] }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 0;

            cutscene.enterOrLeftClick();

            expect(cutscene.textIndex).toBe(1);
        });

        it('jumps to the end when the next ellipsis is followed only by terminal punctuation', () => {
            cutscene.dialogue = [{ character: 'A', dialogue: 'Wait...?!', images: [] }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 0;

            cutscene.enterOrLeftClick();

            expect(cutscene.textIndex).toBe('Wait...?!'.length);
        });

        it('jumps to the end when there are no further pause points', () => {
            cutscene.dialogue = [{ character: 'A', dialogue: 'Hello', images: [] }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 1;

            cutscene.enterOrLeftClick();

            expect(cutscene.textIndex).toBe('Hello'.length);
        });

        it('moves to the next dialogue when the current one has finished and there is more left', () => {
            const enterSpy = jest.spyOn(cutscene, 'runCurrentDialogueEnterActionIfAny');

            cutscene.dialogueIndex = 0;
            cutscene.textIndex = cutscene.dialogue[0].dialogue.length;
            cutscene.lastSound2Played = true;

            cutscene.enterOrLeftClick();

            expect(cutscene.dialogueIndex).toBe(1);
            expect(cutscene.textIndex).toBe(0);
            expect(cutscene.lastSound2Played).toBe(false);
            expect(cutscene.fullWordsColor).toEqual(['end']);
            expect(enterSpy).toHaveBeenCalled();
        });

        it('triggers the end-of-cutscene flow when on the last dialogue and it has finished', () => {
            const removeSpy = jest.spyOn(cutscene, 'removeEventListeners');
            const bgSpy = jest.spyOn(cutscene, 'cutsceneBackgroundChange');
            const fadeSpy = jest.spyOn(cutscene, 'fadeOutAndStopAllAudio');

            cutscene.dialogueIndex = 1;
            cutscene.textIndex = cutscene.dialogue[1].dialogue.length;
            game.input.keys = ['x', 'y'];

            cutscene.enterOrLeftClick();

            expect(removeSpy).toHaveBeenCalled();
            expect(bgSpy).toHaveBeenCalledWith(400, 600, 400);

            jest.advanceTimersByTime(500);

            expect(game.endCutscene).toHaveBeenCalled();
            expect(game.isPlayerInGame).toBe(true);
            expect(game.input.keys).toEqual([]);
            expect(fadeSpy).toHaveBeenCalled();
        });

        it('sets isPlayerInGame to false in the final branch when game.isEndCutscene is true', () => {
            cutscene.dialogueIndex = 1;
            cutscene.textIndex = cutscene.dialogue[1].dialogue.length;
            game.isEndCutscene = true;

            cutscene.enterOrLeftClick();
            jest.advanceTimersByTime(500);

            expect(game.isPlayerInGame).toBe(false);
        });

        it('resets isEnterPressed via interval when the text is fully revealed', () => {
            cutscene.dialogue = [{ character: 'A', dialogue: 'X', images: [] }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 1;
            cutscene.isEnterPressed = true;

            cutscene.enterOrLeftClick();
            jest.advanceTimersByTime(100);

            expect(cutscene.isEnterPressed).toBe(false);
        });
    });
});

/* -----------------------------------------------
   Unlock flags + persistence for End Cutscenes
   ----------------------------------------------- */
describe('EndCutscene classes: unlock flags and save behavior', () => {
    let baseGame;

    beforeEach(() => {
        baseGame = {
            width: 1920,
            height: 689,
            coins: 0,
            winningCoins: 0,

            map2Unlocked: false,
            map3Unlocked: false,
            map4Unlocked: false,
            map5Unlocked: false,
            map6Unlocked: false,
            map7Unlocked: false,
            bonusMap1Unlocked: false,
            bonusMap2Unlocked: false,
            bonusMap3Unlocked: false,

            saveGameState: jest.fn(),

            audioHandler: {
                cutsceneDialogue: {
                    stopAllSounds: jest.fn(),
                    playSound: jest.fn(),
                    pauseSound: jest.fn(),
                },
                cutsceneSFX: {
                    stopAllSounds: jest.fn(),
                    playSound: jest.fn(),
                    fadeOutAndStop: jest.fn(),
                    fadeOutAndStopAllSounds: jest.fn(),
                },
                cutsceneMusic: {
                    stopAllSounds: jest.fn(),
                    playSound: jest.fn(),
                    fadeOutAndStop: jest.fn(),
                    fadeOutAndStopAllSounds: jest.fn(),
                },
            },

            menu: {
                pause: { isPaused: false },
                wardrobe: {
                    getCurrentSkinId: jest.fn(() => 'defaultSkin'),
                    getCurrentCosmeticKey: jest.fn(() => 'none'),
                    getCurrentCosmeticsChromaState: jest.fn(() => ({})),
                },
            },

            currentMap: 'Map1',
            enterDuringBackgroundTransition: true,
            canvas: document.createElement('canvas'),
            endCutscene: jest.fn(),
            input: { keys: [] },

            fadingIn: false,
            waitForFadeInOpacity: false,
            isEndCutscene: false,
            isPlayerInGame: true,
            stopShake: jest.fn(),
            shakeActive: false,
            cutsceneActive: true,
            talkToPenguin: false,
            boss: { talkToBoss: false },
            ignoreCutsceneInputUntil: 0,
        };

        [
            'map1InsideCabin',
            'map2InsideCabinNight',
            'scrollLetterMessageGaladon',
            'dreamLight1',
            'blackBackground',
            'reminderToSkipWithTab',
        ].forEach(id => {
            if (!document.getElementById(id)) {
                const el = document.createElement('img');
                el.id = id;
                document.body.appendChild(el);
            }
        });
    });

    it('Map1EndCutscene unlocks Map2 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.map2Unlocked).toBe(false);

        new Map1EndCutscene(game);

        expect(game.map2Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('Map2EndCutscene unlocks Map3 and Bonus Map 1 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.map3Unlocked).toBe(false);
        expect(game.bonusMap1Unlocked).toBe(false);

        new Map2EndCutscene(game);

        expect(game.map3Unlocked).toBe(true);
        expect(game.bonusMap1Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('Map3EndCutscene unlocks Map4 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.map4Unlocked).toBe(false);

        new Map3EndCutscene(game);

        expect(game.map4Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('Map4EndCutscene unlocks Map5 and Bonus Map 2 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.map5Unlocked).toBe(false);
        expect(game.bonusMap2Unlocked).toBe(false);

        new Map4EndCutscene(game);

        expect(game.map5Unlocked).toBe(true);
        expect(game.bonusMap2Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('Map5EndCutscene unlocks Map6 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.map6Unlocked).toBe(false);

        new Map5EndCutscene(game);

        expect(game.map6Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('Map6EndCutscene unlocks Map7 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.map7Unlocked).toBe(false);

        new Map6EndCutscene(game);

        expect(game.map7Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('Map7EndCutscene saves the game state', () => {
        const game = { ...baseGame };

        new Map7EndCutscene(game);

        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('BonusMap1EndCutscene saves the game state', () => {
        const game = { ...baseGame };

        new BonusMap1EndCutscene(game);

        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('BonusMap2EndCutscene unlocks Bonus Map 3 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.bonusMap3Unlocked).toBe(false);

        new BonusMap2EndCutscene(game);

        expect(game.bonusMap3Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('BonusMap3EndCutscene saves the game state', () => {
        const game = { ...baseGame };

        new BonusMap3EndCutscene(game);

        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });
});