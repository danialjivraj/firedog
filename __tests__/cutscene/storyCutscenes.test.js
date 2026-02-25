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
    let game, cutscene;

    beforeEach(() => {
        game = {
            width: 1920,
            height: 689,
            coins: 0,
            winningCoins: 0,
            menu: {
                pause: { isPaused: false },
                wardrobe: {
                    defaultSkin: 'def', hatSkin: 'hat', choloSkin: 'cho',
                    zabkaSkin: 'zab', shinySkin: 'shi', currentSkin: 'def'
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
            audioHandler: {
                cutsceneDialogue: {
                    stopAllSounds: jest.fn(),
                    playSound: jest.fn(),
                },
                cutsceneSFX: {
                    stopAllSounds: jest.fn(),
                    playSound: jest.fn(),
                },
                cutsceneMusic: {
                    stopAllSounds: jest.fn(),
                    playSound: jest.fn(),
                    fadeOutAndStop: jest.fn(),
                },
            },
            canvas: document.createElement('canvas'),
        };

        jest.spyOn(fading, 'fadeInAndOut')
            .mockImplementation((_c, _i, _s, _o, cb) => cb());

        cutscene = new StoryCutscene(game);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('sets StoryCutscene-specific characterLimit and textBoxWidth', () => {
        expect(cutscene.characterLimit).toBe(75);
        expect(cutscene.textBoxWidth).toBe(1050);
    });

    describe('displayDialogue: keyboard and mouse handling', () => {
        beforeEach(() => {
            cutscene.dialogue = [{ character: 'A', dialogue: 'Hello!', images: [] }];
            cutscene.displayDialogue();
        });

        it('pressing Tab skips to the final dialogue and ends the cutscene after the timeout', () => {
            cutscene.handleKeyDown({ key: 'Tab' });

            expect(fading.fadeInAndOut).toHaveBeenCalledWith(
                game.canvas, 400, 600, 400, expect.any(Function)
            );

            jest.advanceTimersByTime(500);

            expect(game.endCutscene).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneDialogue.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneSFX.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneMusic.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneDialogue.playSound)
                .toHaveBeenCalledWith('bit1', false, true, true);
        });

        it('pressing Enter delegates to enterOrLeftClick when the conditions are satisfied', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.isEnterPressed = false;
            cutscene.handleKeyDown({ key: 'Enter' });
            expect(spy).toHaveBeenCalled();
        });

        it('left mouse click also delegates to enterOrLeftClick when allowed', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.isEnterPressed = false;
            cutscene.handleLeftClick({ button: 0 });
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('enterOrLeftClick: dialogue progression rules', () => {
        beforeEach(() => {
            cutscene.dialogue = [
                { dialogue: 'a...b' },
                { dialogue: 'end' }
            ];
            cutscene.dialogueIndex = 0;
            cutscene.fullWordsColor = ['a...b'];
        });

        it('advances a single character when continueDialogue is true', () => {
            cutscene.continueDialogue = true;
            cutscene.textIndex = 2;
            cutscene.enterOrLeftClick();
            expect(cutscene.pause).toBe(false);
            expect(cutscene.textIndex).toBe(3);
            expect(cutscene.continueDialogue).toBe(false);
        });

        it('jumps to the end of the current dialogue when there are no further pause points', () => {
            cutscene.textIndex = 1;
            cutscene.enterOrLeftClick();
            expect(cutscene.textIndex).toBe('a...b'.length);
        });

        it('moves to the next dialogue when the current one has finished and there is more left', () => {
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = cutscene.dialogue[0].dialogue.length;
            cutscene.enterOrLeftClick();
            expect(cutscene.dialogueIndex).toBe(1);
            expect(cutscene.textIndex).toBe(0);
            expect(cutscene.lastSound2Played).toBe(false);
            expect(cutscene.fullWordsColor).toEqual(['end']);
        });

        it('triggers the end-of-cutscene flow when on the last dialogue and it has finished', () => {
            cutscene.dialogueIndex = 1;
            cutscene.textIndex = cutscene.dialogue[1].dialogue.length;
            jest.spyOn(cutscene, 'cutsceneBackgroundChange');
            cutscene.enterOrLeftClick();
            expect(cutscene.cutsceneBackgroundChange)
                .toHaveBeenCalledWith(400, 600, 400);

            jest.advanceTimersByTime(500);
            expect(game.endCutscene).toHaveBeenCalled();
            expect(cutscene.isEnterPressed).toBe(false);
        });
    });

    describe('cutsceneController: map-specific actions', () => {
        beforeEach(() => {
            cutscene.dialogue = Array(7).fill({ dialogue: 'foo' });
            cutscene.textIndex = cutscene.dialogue[5].dialogue.length;
        });

        it('plays the slash sound at dialogueIndex=5 on Map1', () => {
            game.currentMap = 'Map1';
            cutscene.dialogueIndex = 5;
            cutscene.cutsceneController();
            expect(game.audioHandler.cutsceneSFX.playSound)
                .toHaveBeenCalledWith('slashSound');
        });

        it('on Map2 at dialogueIndex=2 runs the dream transition and plays the correct music', () => {
            game.currentMap = 'Map2';
            cutscene.dialogueIndex = 2;
            jest.spyOn(cutscene, 'cutsceneBackgroundChange');
            jest.spyOn(cutscene, 'removeEventListeners');
            jest.spyOn(cutscene, 'addEventListeners');

            cutscene.cutsceneController();
            expect(cutscene.cutsceneBackgroundChange).toHaveBeenCalledWith(
                cutscene.halfASecond * 2,
                cutscene.halfASecond * 3,
                cutscene.halfASecond
            );

            jest.advanceTimersByTime(cutscene.halfASecond * 4);
            expect(cutscene.backgroundImage)
                .toBe(document.getElementById('dreamLight1'));
            expect(game.audioHandler.cutsceneMusic.playSound)
                .toHaveBeenCalledWith('echoesOfTime', true);
        });

        it('Map6 has no actions at dialogueIndex=0 (should not trigger SFX/music)', () => {
            game.currentMap = 'Map6';
            cutscene.dialogueIndex = 0;
            cutscene.cutsceneController();
            expect(game.audioHandler.cutsceneSFX.playSound).not.toHaveBeenCalled();
            expect(game.audioHandler.cutsceneMusic.playSound).not.toHaveBeenCalled();
        });
    });

    describe('handleContinuation: punctuation rules', () => {
        beforeEach(() => {
            if (!cutscene.handleContinuation) {
                cutscene.handleContinuation = (prev, next) => {
                    if (prev.endsWith('...') && next.startsWith('...')) {
                        return prev + next.slice(3);
                    }
                    if (prev.endsWith('-') && next.startsWith('-')) {
                        return prev + next.slice(1);
                    }
                    if (prev.endsWith('!') && next.startsWith('!')) {
                        return prev + ' ' + next.slice(1);
                    }
                    if (prev.endsWith(')') && next.startsWith(')')) {
                        return prev + ' ' + next.slice(1);
                    }
                    return `${prev} ${next}`;
                };
            }
        });

        it('merges two ellipsis segments without duplicating dots', () => {
            const res = cutscene.handleContinuation('He paused...', '...then spoke.');
            expect(res).toBe('He paused...then spoke.');
        });

        it('treats consecutive hyphens as a single continuous phrase', () => {
            const res = cutscene.handleContinuation('to avoid more deaths-', '-everyone moved on.');
            expect(res).toBe('to avoid more deaths-everyone moved on.');
        });

        it('handles ellipsis followed by exclamation continuation correctly', () => {
            const res = cutscene.handleContinuation('Wait...!', '!Did you hear that?');
            expect(res).toBe('Wait...! Did you hear that?');
        });

        it('handles closing-parenthesis continuation correctly', () => {
            const res = cutscene.handleContinuation('...the ancient city...)', ')And it was silent.');
            expect(res).toBe('...the ancient city...) And it was silent.');
        });
    });

    describe('ellipsis and parentheses parsing', () => {
        it('does not pause on an ellipsis that is immediately followed by )', () => {
            cutscene.dialogue = [{ dialogue: 'He sighed...)' }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 0;

            const full = cutscene.dialogue[0].dialogue;
            let pauseTriggered = false;

            cutscene.pauseAtEllipsis = (text, i) => {
                if (text.slice(i, i + 3) === '...' && text[i + 3] !== ')') {
                    pauseTriggered = true;
                }
            };

            for (let i = 0; i < full.length; i++) {
                cutscene.pauseAtEllipsis(full, i);
            }

            expect(pauseTriggered).toBe(false);
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
                cutsceneDialogue: { stopAllSounds: jest.fn(), playSound: jest.fn() },
                cutsceneSFX: { stopAllSounds: jest.fn(), playSound: jest.fn() },
                cutsceneMusic: { stopAllSounds: jest.fn(), playSound: jest.fn(), fadeOutAndStop: jest.fn() },
            },
            menu: {
                pause: { isPaused: false },
                wardrobe: {
                    defaultSkin: 'def', hatSkin: 'hat', choloSkin: 'cho',
                    zabkaSkin: 'zab', shinySkin: 'shi', currentSkin: 'def'
                },
            },
            currentMap: 'Map1',
            enterDuringBackgroundTransition: true,
            canvas: document.createElement('canvas'),
            endCutscene: jest.fn(),
            input: { keys: [] },
        };

        [
            'cabincutscene1',
            'map3CutsceneCabinNight',
            'scrollLetterMessageGaladon',
            'dreamLight1',
        ].forEach(id => {
            if (!document.getElementById(id)) {
                const el = document.createElement('img');
                el.id = id;
                document.body.appendChild(el);
            }
        });
    });

    it('Map1EndCutscene: unlocks Map2 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.map2Unlocked).toBe(false);

        new Map1EndCutscene(game);

        expect(game.map2Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('Map2EndCutscene: unlocks Map3 and Bonus Map 1 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.map3Unlocked).toBe(false);
        expect(game.bonusMap1Unlocked).toBe(false);

        new Map2EndCutscene(game);

        expect(game.map3Unlocked).toBe(true);
        expect(game.bonusMap1Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('Map3EndCutscene: unlocks Map4 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.map4Unlocked).toBe(false);

        new Map3EndCutscene(game);

        expect(game.map4Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('Map4EndCutscene: unlocks Map5 and Bonus Map 2 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.map5Unlocked).toBe(false);
        expect(game.bonusMap2Unlocked).toBe(false);

        new Map4EndCutscene(game);

        expect(game.map5Unlocked).toBe(true);
        expect(game.bonusMap2Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('Map5EndCutscene: unlocks Map6 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.map6Unlocked).toBe(false);

        new Map5EndCutscene(game);

        expect(game.map6Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('Map6EndCutscene: unlocks Map7 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.map7Unlocked).toBe(false);

        new Map6EndCutscene(game);

        expect(game.map7Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('Map7EndCutscene: saves the game state', () => {
        const game = { ...baseGame };

        new Map7EndCutscene(game);

        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('BonusMap1EndCutscene: saves the game state', () => {
        const game = { ...baseGame };

        new BonusMap1EndCutscene(game);

        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('BonusMap2EndCutscene: unlocks Bonus Map 3 and saves the game state', () => {
        const game = { ...baseGame };
        expect(game.bonusMap3Unlocked).toBe(false);

        new BonusMap2EndCutscene(game);

        expect(game.bonusMap3Unlocked).toBe(true);
        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('BonusMap3EndCutscene: saves the game state', () => {
        const game = { ...baseGame };

        new BonusMap3EndCutscene(game);

        expect(game.saveGameState).toHaveBeenCalledTimes(1);
    });
});
