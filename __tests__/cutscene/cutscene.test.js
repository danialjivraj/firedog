import { Cutscene } from '../../game/cutscene/cutscene.js';
import * as shake from '../../game/animations/shake.js';
import * as fading from '../../game/animations/fading.js';

describe('Cutscene', () => {
    let game, cutscene;

    beforeEach(() => {
        game = {
            width: 1920,
            height: 689,
            coins: 42,
            winningCoins: 100,
            menu: {
                pause: { isPaused: false },
                skins: {
                    defaultSkin: 'default',
                    hatSkin: 'hat',
                    choloSkin: 'cholo',
                    zabkaSkin: 'zabka',
                    shinySkin: 'shiny',
                    currentSkin: 'default',
                },
            },
            audioHandler: {
                cutsceneDialogue: {
                    sounds: { bit1: {}, bit2: {} },
                    playSound: jest.fn(),
                    pauseSound: jest.fn(),
                },
            },
            enterDuringBackgroundTransition: true,
            cutsceneActive: true,
            talkToPenguin: false,
            talkToElyvorg: false,
            canvas: document.createElement('canvas'),
        };

        jest
            .spyOn(fading, 'fadeInAndOut')
            .mockImplementation((canvas, f1, stay, f2, cb) => cb());

        cutscene = new Cutscene(game);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('splitDialogueIntoWords', () => {
        it('splits on spaces', () => {
            expect(cutscene.splitDialogueIntoWords('Hello world! This is   jest.')).toEqual([
                'Hello',
                'world!',
                'This',
                'is',
                '',
                '',
                'jest.',
            ]);
        });
    });

    describe('getDotIndices', () => {
        it('finds all start indices of "..."', () => {
            expect(cutscene.getDotIndices('Wait... What...?!')).toEqual([4, 12]);
        });
        it('returns empty array if none', () => {
            expect(cutscene.getDotIndices('No dots here')).toEqual([]);
        });
    });

    describe('isCharacterName', () => {
        it('returns true for known character keys', () => {
            expect(cutscene.isCharacterName(cutscene.firedog)).toBe(true);
            expect(cutscene.isCharacterName(cutscene.coinText)).toBe(true);
        });
        it('returns false for unknown strings', () => {
            expect(cutscene.isCharacterName('Random')).toBe(false);
        });
    });

    describe('getLinesWithinLimit', () => {
        it('breaks into two lines if limit exceeded once, max 2 lines', () => {
            const words = ['aaa', 'bbbbbb', 'ccc', 'dddd'];
            const fullWords = ['aaa', 'bbbbbb', 'ccc', 'dddd'];
            cutscene.characterLimit = 8;
            const lines = cutscene.getLinesWithinLimit(words, fullWords, 8);
            expect(lines).toEqual(['aaa', 'bbbbbb ccc dddd']);
        });
        it('does not break if under limit', () => {
            cutscene.characterLimit = 50;
            expect(cutscene.getLinesWithinLimit(['short', 'text'], ['short', 'text'], 50))
                .toEqual(['short text']);
        });
    });

    describe('addImage', () => {
        it('returns image object with given properties', () => {
            expect(cutscene.addImage('foo', 0.5, 10, 20, 100, 200)).toEqual({
                id: 'foo', opacity: 0.5, x: 10, y: 20, width: 100, height: 200
            });
        });
    });

    describe('addDialogue', () => {
        it('pushes a dialogue entry', () => {
            cutscene.addDialogue('Alice', 'Hi', { id: 'img', opacity: 1, x: 0, y: 0, width: 10, height: 10 });
            expect(cutscene.dialogue).toHaveLength(1);
            expect(cutscene.dialogue[0]).toMatchObject({ character: 'Alice', dialogue: 'Hi' });
            expect(Array.isArray(cutscene.dialogue[0].images)).toBe(true);
        });
    });

    describe('skin-based helpers', () => {
        it('getmap6insideCaveLavaEarthquake respects currentSkin', () => {
            const s = game.menu.skins;
            const cases = [
                ['defaultSkin', 'map6insideCaveLavaEarthquake'],
                ['hatSkin', 'map6insideCaveLavaEarthquakeHat'],
                ['choloSkin', 'map6insideCaveLavaEarthquakeCholo'],
                ['zabkaSkin', 'map6insideCaveLavaEarthquakeZabka'],
                ['shinySkin', 'map6insideCaveLavaEarthquakeShiny'],
            ];
            for (const [key, expected] of cases) {
                s.currentSkin = s[key];
                expect(cutscene.getmap6insideCaveLavaEarthquake()).toBe(expected);
            }
        });
        it('getSkinPrefix returns correct prefix', () => {
            const s = game.menu.skins;
            s.currentSkin = s.defaultSkin; expect(cutscene.getSkinPrefix()).toBe('');
            s.currentSkin = s.hatSkin; expect(cutscene.getSkinPrefix()).toBe('hat');
            s.currentSkin = s.choloSkin; expect(cutscene.getSkinPrefix()).toBe('cholo');
            s.currentSkin = s.zabkaSkin; expect(cutscene.getSkinPrefix()).toBe('zabka');
            s.currentSkin = s.shinySkin; expect(cutscene.getSkinPrefix()).toBe('shiny');
        });
        it('setfiredog... methods incorporate prefix', () => {
            game.menu.skins.currentSkin = game.menu.skins.hatSkin;
            expect(cutscene.setfiredogHappy()).toBe('hatfiredogHappy');
            expect(cutscene.setfiredogSadBorder()).toBe('hatfiredogSadBorder');
        });
    });

    describe('cutsceneBackgroundChange', () => {
        it('toggles enterDuringBackgroundTransition via fadeInAndOut callback', () => {
            game.enterDuringBackgroundTransition = false;
            cutscene.cutsceneBackgroundChange(1, 2, 3);
            expect(fading.fadeInAndOut).toHaveBeenCalledWith(game.canvas, 1, 2, 3, expect.any(Function));
            expect(game.enterDuringBackgroundTransition).toBe(true);
        });
    });

    describe('playEightBitSound', () => {
        beforeEach(() => {
            cutscene.dialogueText = ''; cutscene.pause = false;
        });
        it('does nothing if dialogue starts with "("', () => {
            cutscene.dialogueText = '(hi)'; cutscene.playEightBitSound('x', 'y');
            expect(game.audioHandler.cutsceneDialogue.playSound).not.toHaveBeenCalled();
            expect(game.audioHandler.cutsceneDialogue.pauseSound).not.toHaveBeenCalled();
        });
        it('plays sound when not paused', () => {
            cutscene.dialogueText = 'hi'; cutscene.pause = false;
            cutscene.playEightBitSound('bit1', 'bit1');
            expect(game.audioHandler.cutsceneDialogue.playSound).toHaveBeenCalledWith('bit1');
        });
        it('pauses sound when paused', () => {
            cutscene.dialogueText = 'hi'; cutscene.pause = true;
            const el = game.audioHandler.cutsceneDialogue.sounds.bit1;
            cutscene.playEightBitSound('bit1', 'bit1');
            expect(game.audioHandler.cutsceneDialogue.pauseSound).toHaveBeenCalledWith(el);
        });
    });

    describe('addEventListeners and removeEventListeners', () => {
        it('registers and deregisters the four expected listeners', () => {
            cutscene.handleKeyDown = jest.fn();
            cutscene.handleKeyUp = jest.fn();
            cutscene.handleLeftClick = jest.fn();
            cutscene.handleLeftClickUp = jest.fn();
            const a = jest.spyOn(document, 'addEventListener');
            const r = jest.spyOn(document, 'removeEventListener');
            cutscene.addEventListeners();
            expect(a).toHaveBeenCalledTimes(4);
            cutscene.removeEventListeners();
            expect(r).toHaveBeenCalledTimes(4);
            a.mockRestore(); r.mockRestore();
        });
    });

    describe('displayDialogue', () => {
        it('initializes internal state and sets reminderImageStartTime', () => {
            const now = jest.spyOn(performance, 'now').mockReturnValue(123);
            cutscene.dialogue = [{ character: 'A', dialogue: 'X', images: [] }];
            cutscene.displayDialogue();
            expect(cutscene.fullWords).toEqual(['X']);
            expect(cutscene.dialogueIndex).toBe(0);
            expect(cutscene.reminderImageStartTime).toBe(123);
            now.mockRestore();
        });
    });

    describe('characterColorLogic', () => {
        it('renders each character of each word exactly once', () => {
            const ctx = { fillText: jest.fn(), measureText: jest.fn().mockReturnValue({ width: 5 }) };
            cutscene.dialogue = [{ character: 'Firedog', dialogue: 'Test', images: [] }];
            cutscene.dialogueIndex = 0;
            cutscene.fullWords = ['Test']; cutscene.fullWordsColor = ['Test'];
            cutscene.characterColorLogic(ctx, ['Test'], ['Test'], 'Firedog: ');
            expect(ctx.fillText).toHaveBeenCalledTimes(4);
        });
    });

    describe('draw', () => {
        let context, bgImg, charImg, reminderImg, textBoxImg;

        beforeEach(() => {
            bgImg = { src: 'bg' }; charImg = { src: 'char' };
            reminderImg = { src: 'rem' }; textBoxImg = { src: 'box' };
            jest.spyOn(document, 'getElementById').mockImplementation(id => {
                switch (id) {
                    case 'bg': return bgImg;
                    case 'charSprite': return charImg;
                    case 'reminderToSkipWithTab': return reminderImg;
                    case 'textBox': return textBoxImg;
                    default: return { src: id };
                }
            });
            cutscene.reminderImage = reminderImg;
            context = {
                save: jest.fn(), restore: jest.fn(),
                drawImage: jest.fn(), fillText: jest.fn(),
                measureText: jest.fn().mockReturnValue({ width: 5 }),
                translate: jest.fn(),
                _filter: '', set filter(v) { this._filter = v; }, get filter() { return this._filter; },
                _alpha: 1, set globalAlpha(v) { this._alpha = v; }, get globalAlpha() { return this._alpha; },
                font: '', textAlign: '', shadowOffsetX: 0, shadowOffsetY: 0, shadowColor: '', shadowBlur: 0, fillStyle: '',
            };
            cutscene.dialogue = [{
                character: 'Firedog', dialogue: 'Hi',
                images: [{ id: 'charSprite', opacity: 0.7, x: 10, y: 20, width: 30, height: 40 }]
            }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 2;
            cutscene.fullWords = ['Hi']; cutscene.fullWordsColor = ['Hi'];
            cutscene.reminderImageStartTime = performance.now() - 1000;
        });

        it('draws background, shakes when groundShaking, then restores filter', () => {
            cutscene.backgroundImage = bgImg;
            cutscene.groundShaking = true;
            cutscene.isBackgroundBlackAndWhite = true;
            const pre = jest.spyOn(shake, 'preShake');
            const post = jest.spyOn(shake, 'postShake');
            jest.spyOn(performance, 'now').mockReturnValue(cutscene.reminderImageStartTime + 500);

            cutscene.draw(context);

            expect(pre).toHaveBeenCalledWith(context);
            expect(context.drawImage).toHaveBeenCalledWith(bgImg, 0, 0, game.width, game.height);
            expect(post).toHaveBeenCalledWith(context);
            expect(context._filter).toBe('none');
        });

        it('renders character image, textBox, reminder image, and final sound', () => {
            cutscene.backgroundImage = null;
            cutscene.dontShowTextBoxAndSound = false;
            cutscene.groundShaking = false;
            jest.spyOn(performance, 'now').mockReturnValue(cutscene.reminderImageStartTime + 2000);

            cutscene.lastSoundPlayed = false;
            cutscene.lastSound2Played = false;
            const play = game.audioHandler.cutsceneDialogue.playSound;

            cutscene.draw(context);

            // char sprite
            expect(context.drawImage).toHaveBeenCalledWith(charImg, 10, 20, 30, 40);
            // text box
            expect(context.drawImage).toHaveBeenCalledWith(textBoxImg, 15, game.height - 70, cutscene.textBoxWidth, 96);
            // reminder
            expect(context.drawImage).toHaveBeenCalledWith(reminderImg, game.width - 500, game.height - 100);
            // final sounds
            expect(play).toHaveBeenCalledWith('bit1', false, true, true);
            expect(play).toHaveBeenCalledWith('bit2');
        });

        it('skips textBox when dontShowTextBoxAndSound is true', () => {
            cutscene.dontShowTextBoxAndSound = true;
            jest.spyOn(performance, 'now').mockReturnValue(cutscene.reminderImageStartTime + 2000);

            cutscene.draw(context);
            // no textBox call
            const calledWithTextBox = context.drawImage.mock.calls.some(args => args[0] === textBoxImg);
            expect(calledWithTextBox).toBe(false);
        });

        it('does not draw reminder image after timeout', () => {
            jest.spyOn(performance, 'now').mockReturnValue(cutscene.reminderImageStartTime + 8000);
            cutscene.draw(context);
            const calledWithReminder = context.drawImage.mock.calls.some(args => args[0] === reminderImg);
            expect(calledWithReminder).toBe(false);
        });

        it('handles paused-menu audio branch when menu paused', () => {
            game.menu.pause.isPaused = true;
            // mid-typing
            cutscene.textIndex = 1;
            jest.spyOn(performance, 'now').mockReturnValue(cutscene.reminderImageStartTime + 1000);

            cutscene.draw(context);
            expect(game.audioHandler.cutsceneDialogue.playSound)
                .toHaveBeenCalledWith('bit1', false, true, true);
        });

        it('applies grayscale filter to character images when isCharacterBlackAndWhite is true', () => {
            const filters = [];
            const ctx = {
                ...context,
                set filter(v) { filters.push(v); this._filter = v; },
                get filter() { return this._filter; }
            };
            cutscene.isCharacterBlackAndWhite = true;
            jest.spyOn(performance, 'now').mockReturnValue(cutscene.reminderImageStartTime + 1000);

            cutscene.draw(ctx);
            expect(filters).toContain('grayscale(100%)');
        });

        it('correctly handles pause while typing when enterDuringBackgroundTransition is false', () => {
            cutscene.dialogue = [{ character: 'Firedog', dialogue: 'Hello', images: [] }];
            cutscene.dialogueIndex = 0;
            cutscene.fullWords = ['Hello']; cutscene.fullWordsColor = ['Hello'];
            cutscene.textIndex = 2;
            game.enterDuringBackgroundTransition = false;
            const spy = jest.spyOn(cutscene, 'playEightBitSound');

            cutscene.draw(context);
            expect(cutscene.pause).toBe(true);
            expect(cutscene.textIndex).toBe(1);
            expect(spy).toHaveBeenCalledWith('bit1', 'bit1');
        });

        it('handles dot pause branch and sets flags accordingly', () => {
            cutscene.dialogue = [{ character: 'Firedog', dialogue: 'Hi... there', images: [] }];
            cutscene.dialogueIndex = 0;
            cutscene.fullWords = ['Hi...', 'there']; cutscene.fullWordsColor = ['Hi...', 'there'];
            cutscene.textIndex = 4;
            game.enterDuringBackgroundTransition = true;
            cutscene.lastSoundPlayed = false;
            cutscene.playSound2OnDotPause = false;
            cutscene.dontShowTextBoxAndSound = false;
            game.menu.pause.isPaused = false;
            const spy = jest.spyOn(cutscene, 'playEightBitSound');

            cutscene.draw(context);
            expect(spy).toHaveBeenCalledWith('bit2');
            expect(cutscene.playSound2OnDotPause).toBe(true);
            expect(cutscene.pause).toBe(true);
            expect(cutscene.continueDialogue).toBe(true);
            expect(cutscene.isEnterPressed).toBe(false);
            expect(spy).toHaveBeenCalledWith('bit1', 'bit1');
        });
    });

    describe('keyboard / click callbacks', () => {
        beforeEach(() => {
            cutscene.dialogue = [{ character: 'A', dialogue: 'hello', images: [] }];
            cutscene.displayDialogue();
            cutscene.isEnterPressed = true;
        });
        it('handleKeyUp resets isEnterPressed on Enter', () => {
            cutscene.handleKeyUp({ key: 'Enter' });
            expect(cutscene.isEnterPressed).toBe(false);
        });
        it('handleLeftClickUp resets isEnterPressed on left click', () => {
            cutscene.handleLeftClickUp({ button: 0 });
            expect(cutscene.isEnterPressed).toBe(false);
        });
    });
});
