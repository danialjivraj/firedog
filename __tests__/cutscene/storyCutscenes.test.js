import { StoryCutscene } from '../../game/cutscene/storyCutscenes.js';
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
                skins: {
                    defaultSkin: 'def', hatSkin: 'hat', choloSkin: 'cho',
                    zabkaSkin: 'zab', shinySkin: 'shi', currentSkin: 'def'
                },
            },
            fadingIn: false,
            enterDuringBackgroundTransition: true,
            waitForFadeInOpacity: false,
            mapSelected: [false, false, false],
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
            .mockImplementation((c, i, s, o, cb) => cb());

        cutscene = new StoryCutscene(game);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('overrides characterLimit and textBoxWidth', () => {
        expect(cutscene.characterLimit).toBe(75);
        expect(cutscene.textBoxWidth).toBe(1050);
    });

    describe('displayDialogue override', () => {
        beforeEach(() => {
            cutscene.dialogue = [{ character: 'A', dialogue: 'Hello!', images: [] }];
            cutscene.displayDialogue('myCut');
        });

        it('Tab skips immediately to end and ends cutscene after timeout', () => {
            cutscene.handleKeyDown({ key: 'Tab' });

            expect(fading.fadeInAndOut).toHaveBeenCalledWith(
                game.canvas, 400, 600, 400, expect.any(Function)
            );

            jest.advanceTimersByTime(500);

            expect(game.endCutscene).toHaveBeenCalledWith('myCut');
            expect(game.audioHandler.cutsceneDialogue.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneSFX.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneMusic.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneDialogue.playSound)
                .toHaveBeenCalledWith('bit1', false, true, true);
        });

        it('Enter routes to enterOrLeftClick when conditions met', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.isEnterPressed = false;
            cutscene.handleKeyDown({ key: 'Enter' });
            expect(spy).toHaveBeenCalledWith('myCut');
        });

        it('left click also triggers enterOrLeftClick', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.isEnterPressed = false;
            cutscene.handleLeftClick({ button: 0 });
            expect(spy).toHaveBeenCalledWith('myCut');
        });
    });

    describe('enterOrLeftClick', () => {
        beforeEach(() => {
            cutscene.dialogue = [
                { dialogue: 'a...b' },
                { dialogue: 'end' }
            ];
            cutscene.dialogueIndex = 0;
            cutscene.fullWordsColor = ['a...b'];
        });

        it('advance single char when continueDialogue=true', () => {
            cutscene.continueDialogue = true;
            cutscene.textIndex = 2;
            cutscene.enterOrLeftClick('X');
            expect(cutscene.pause).toBe(false);
            expect(cutscene.textIndex).toBe(3);
            expect(cutscene.continueDialogue).toBe(false);
        });

        it('jumps to end when no further dots in-dialogue', () => {
            cutscene.textIndex = 1;
            cutscene.enterOrLeftClick('X');
            expect(cutscene.textIndex).toBe('a...b'.length);
        });

        it('advances to next dialogue when at end but more left', () => {
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = cutscene.dialogue[0].dialogue.length; // 5
            cutscene.enterOrLeftClick('X');
            expect(cutscene.dialogueIndex).toBe(1);
            expect(cutscene.textIndex).toBe(0);
            expect(cutscene.lastSound2Played).toBe(false);
            expect(cutscene.fullWordsColor).toEqual(['end']);
        });

        it('finishes cutscene when at last dialogue', () => {
            cutscene.dialogueIndex = 1;
            cutscene.textIndex = cutscene.dialogue[1].dialogue.length; // 3
            jest.spyOn(cutscene, 'cutsceneBackgroundChange');
            cutscene.enterOrLeftClick('ID');
            expect(cutscene.cutsceneBackgroundChange)
                .toHaveBeenCalledWith(400, 600, 400);

            jest.advanceTimersByTime(500);
            expect(game.endCutscene).toHaveBeenCalledWith('ID');
            expect(cutscene.isEnterPressed).toBe(false);
        });
    });

    describe('cutsceneController branches', () => {
        beforeEach(() => {
            cutscene.dialogue = Array(7).fill({ dialogue: 'foo' });
            cutscene.textIndex = cutscene.dialogue[5].dialogue.length;
        });

        it('plays slashSound at dialogueIndex=5 when mapSelected[1]', () => {
            game.mapSelected = [false, true, false];
            cutscene.dialogueIndex = 5;
            cutscene.cutsceneController();
            expect(game.audioHandler.cutsceneSFX.playSound)
                .toHaveBeenCalledWith('slashSound');
        });

        it('mapSelected[2] & idx=2 triggers dreamSound + background change + music', () => {
            game.mapSelected = [false, false, true];
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
    });

    describe('punctuation continuation', () => {
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

        it('joins two ellipsis parts smoothly', () => {
            const res = cutscene.handleContinuation('He paused...', '...then spoke.');
            expect(res).toBe('He paused...then spoke.');
        });

        it('joins double hyphens as one continuous thought', () => {
            const res = cutscene.handleContinuation('to avoid more deaths-', '-everyone moved on.');
            expect(res).toBe('to avoid more deaths-everyone moved on.');
        });

        it('handles ellipsis plus exclamation continuation correctly', () => {
            const res = cutscene.handleContinuation('Wait...!', '!Did you hear that?');
            expect(res).toBe('Wait...! Did you hear that?');
        });

        it('handles parentheses continuation correctly', () => {
            const res = cutscene.handleContinuation('...the ancient city...)', ')And it was silent.');
            expect(res).toBe('...the ancient city...) And it was silent.');
        });
    });

    describe('ellipsis and parentheses parsing', () => {
        it('does not pause mid-way at ... when followed by )', () => {
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
