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

            shakeActive: false,

            menu: {
                pause: { isPaused: false },
                skins: {
                    getCurrentSkinId: jest.fn(() => 'defaultSkin'),
                    getCurrentCosmeticKey: jest.fn(() => 'none'),
                },
            },

            audioHandler: {
                cutsceneDialogue: {
                    sounds: { bit1: {}, bit2: {} },
                    playSound: jest.fn(),
                    pauseSound: jest.fn(),
                    stopAllSounds: jest.fn(),
                },
                cutsceneSFX: {
                    playSound: jest.fn(),
                    stopAllSounds: jest.fn(),
                },
                cutsceneMusic: {
                    playSound: jest.fn(),
                    stopSound: jest.fn(),
                    fadeOutAndStop: jest.fn(),
                    stopAllSounds: jest.fn(),
                },
            },

            enterDuringBackgroundTransition: true,
            cutsceneActive: true,
            talkToPenguin: false,
            boss: { talkToBoss: false },

            canvas: document.createElement('canvas'),
            ignoreCutsceneInputUntil: 0,
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
        it('splits dialogue on spaces, including consecutive spaces', () => {
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

    describe('getLinesWithinLimit', () => {
        it('wraps into at most two lines when limit is exceeded once', () => {
            const words = ['aaa', 'bbbbbb', 'ccc', 'dddd'];
            const fullWords = ['aaa', 'bbbbbb', 'ccc', 'dddd'];
            cutscene.characterLimit = 8;
            const lines = cutscene.getLinesWithinLimit(words, fullWords, 8);
            expect(lines).toEqual(['aaa', 'bbbbbb ccc dddd']);
        });

        it('keeps text on a single line when under limit', () => {
            cutscene.characterLimit = 50;
            expect(
                cutscene.getLinesWithinLimit(['short', 'text'], ['short', 'text'], 50)
            ).toEqual(['short text']);
        });
    });

    describe('getDotIndices', () => {
        it('finds all start indices of "..."', () => {
            expect(cutscene.getDotIndices('Wait... What...?!')).toEqual([4, 12]);
        });

        it('returns empty array when no ellipsis is present', () => {
            expect(cutscene.getDotIndices('No dots here')).toEqual([]);
        });
    });

    describe('characterColors membership (replaces removed isCharacterName)', () => {
        it('has known character and token keys', () => {
            expect(cutscene.characterColors[cutscene.firedog]).toBeDefined();
            expect(cutscene.characterColors[cutscene.coinText]).toBeDefined();
        });

        it('does not include unknown strings', () => {
            expect(cutscene.characterColors['Random']).toBeUndefined();
        });
    });

    describe('addImage', () => {
        it('returns image object with given properties (rect + render opts)', () => {
            expect(
                cutscene.addImage(
                    'foo',
                    { x: 10, y: 20, width: 100, height: 200 },
                    { opacity: 0.5 }
                )
            ).toEqual({
                id: 'foo',
                opacity: 0.5,
                x: 10,
                y: 20,
                width: 100,
                height: 200,
            });
        });

        it('supports talking shortcut -> opts.border.talking', () => {
            const img = cutscene.addImage(
                'bar',
                { x: 1, y: 2, width: 3, height: 4 },
                { talking: true }
            );
            expect(img.opts).toEqual({ border: { talking: true } });
        });
    });

    describe('addDialogue', () => {
        it('adds a dialogue entry with images array', () => {
            cutscene.addDialogue(
                'Alice',
                'Hi',
                { id: 'img', opacity: 1, x: 0, y: 0, width: 10, height: 10 }
            );
            expect(cutscene.dialogue).toHaveLength(1);
            expect(cutscene.dialogue[0]).toMatchObject({ character: 'Alice', dialogue: 'Hi' });
            expect(Array.isArray(cutscene.dialogue[0].images)).toBe(true);
        });

        it('supports options object (whisper) as first param after dialogue', () => {
            cutscene.addDialogue('A', 'Hi', { whisper: true }, { id: 'x', x: 0, y: 0, width: 1, height: 1 });
            expect(cutscene.dialogue[0].whisper).toBe(true);
            expect(cutscene.dialogue[0].images).toHaveLength(1);
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

    it('renders each character of each word exactly once in characterColorLogic', () => {
        const ctx = {
            fillText: jest.fn(),
            measureText: jest.fn().mockReturnValue({ width: 5 }),
        };

        cutscene.dialogue = [{
            character: 'Firedog',
            dialogue: 'Test',
            images: [],
            whisper: false,
        }];
        cutscene.dialogueIndex = 0;

        const fullDialogue = 'Test';
        const spans = cutscene.buildColorSpans(fullDialogue);

        cutscene.characterColorLogic(
            ctx,
            ['Test'],
            ['Test'],
            'Firedog: ',
            fullDialogue,
            spans
        );
        expect(ctx.fillText).toHaveBeenCalledTimes(4);
    });

    describe('skin-based helpers (updated to new skin system)', () => {
        it('getmap6insideCaveLavaEarthquake only special-cases shinySkin', () => {
            game.menu.skins.getCurrentSkinId.mockReturnValue('defaultSkin');
            expect(cutscene.getmap6insideCaveLavaEarthquake()).toBe('map6insideCaveLavaEarthquake');

            game.menu.skins.getCurrentSkinId.mockReturnValue('midnightSteelSkin');
            expect(cutscene.getmap6insideCaveLavaEarthquake()).toBe('map6insideCaveLavaEarthquake');

            game.menu.skins.getCurrentSkinId.mockReturnValue('shinySkin');
            expect(cutscene.getmap6insideCaveLavaEarthquake()).toBe('map6insideCaveLavaEarthquakeShiny');
        });

        it('getSkinPrefix returns "" for most skins and "shiny" for shinySkin (per config)', () => {
            game.menu.skins.getCurrentSkinId.mockReturnValue('defaultSkin');
            expect(cutscene.getSkinPrefix()).toBe('');

            game.menu.skins.getCurrentSkinId.mockReturnValue('midnightSteelSkin');
            expect(cutscene.getSkinPrefix()).toBe('midnightSteel');

            game.menu.skins.getCurrentSkinId.mockReturnValue('shinySkin');
            expect(cutscene.getSkinPrefix()).toBe('shiny');
        });

        it('setfiredog* helpers prepend prefix', () => {
            game.menu.skins.getCurrentSkinId.mockReturnValue('defaultSkin');
            expect(cutscene.setfiredogHappy()).toBe('firedogHappy');
            expect(cutscene.setfiredogSadBorder()).toBe('firedogSadBorder');

            game.menu.skins.getCurrentSkinId.mockReturnValue('shinySkin');
            expect(cutscene.setfiredogHappy()).toBe('shinyfiredogHappy');
            expect(cutscene.setfiredogSadBorder()).toBe('shinyfiredogSadBorder');
        });
    });

    describe('map helper getters', () => {
        it('getCurrentMapId prefers game.currentMap when present', () => {
            game.currentMap = 'Map5';
            game.background = { constructor: { name: 'Map3' } };
            const c = new Cutscene(game);
            expect(c.getCurrentMapId()).toBe('Map5');
        });

        it('getCurrentMapId falls back to game.background.constructor.name', () => {
            delete game.currentMap;
            game.background = { constructor: { name: 'Map2' } };
            const c = new Cutscene(game);
            expect(c.getCurrentMapId()).toBe('Map2');
        });

        it('getCurrentMapId returns null when neither source is available', () => {
            delete game.currentMap;
            game.background = null;
            const c = new Cutscene(game);
            expect(c.getCurrentMapId()).toBeNull();
        });

        it('getSelectedMapIndex parses Map7 into a number', () => {
            const c = new Cutscene(game);

            game.currentMap = 'Map1';
            expect(c.getSelectedMapIndex()).toBe(1);

            delete game.currentMap;
            game.background = { constructor: { name: 'Map7' } };
            expect(c.getSelectedMapIndex()).toBe(7);
        });

        it('getSelectedMapIndex returns null for non-standard ids', () => {
            const c = new Cutscene(game);

            game.currentMap = 'Map0';
            expect(c.getSelectedMapIndex()).toBeNull();

            game.currentMap = 'Map8';
            expect(c.getSelectedMapIndex()).toBeNull();

            game.currentMap = 'BonusMap1';
            expect(c.getSelectedMapIndex()).toBeNull();

            game.currentMap = 'map3';
            expect(c.getSelectedMapIndex()).toBeNull();

            delete game.currentMap;
            game.background = { constructor: { name: 'NotAMap' } };
            expect(c.getSelectedMapIndex()).toBeNull();

            game.background = null;
            expect(c.getSelectedMapIndex()).toBeNull();
        });
    });

    describe('cutsceneBackgroundChange', () => {
        it('toggles enterDuringBackgroundTransition via fadeInAndOut callback', () => {
            game.enterDuringBackgroundTransition = false;
            cutscene.cutsceneBackgroundChange(1, 2, 3);
            expect(fading.fadeInAndOut).toHaveBeenCalledWith(
                game.canvas,
                1,
                2,
                3,
                expect.any(Function)
            );
            expect(game.enterDuringBackgroundTransition).toBe(true);
        });
    });

    describe('playEightBitSound', () => {
        beforeEach(() => {
            cutscene.dialogueText = '';
            cutscene.pause = false;
        });

        it('does nothing when whisper flag is true', () => {
            cutscene.dialogue = [{
                character: 'A',
                dialogue: '(hi)',
                images: [],
                whisper: true,
            }];
            cutscene.dialogueIndex = 0;
            cutscene.dialogueText = '(hi)';
            cutscene.playEightBitSound('bit1');

            expect(game.audioHandler.cutsceneDialogue.playSound).not.toHaveBeenCalled();
            expect(game.audioHandler.cutsceneDialogue.pauseSound).not.toHaveBeenCalled();
        });

        it('plays sound when not paused', () => {
            cutscene.dialogueText = 'hi';
            cutscene.pause = false;
            cutscene.playEightBitSound('bit1');
            expect(game.audioHandler.cutsceneDialogue.playSound).toHaveBeenCalledWith('bit1');
        });

        it('pauses sound when paused', () => {
            cutscene.dialogueText = 'hi';
            cutscene.pause = true;
            cutscene.playEightBitSound('bit1');
            expect(game.audioHandler.cutsceneDialogue.pauseSound).toHaveBeenCalledWith('bit1');
        });
    });

    describe('addEventListeners and removeEventListeners (wrapped gating)', () => {
        it('registers and deregisters the four expected listeners and clears wrapped refs to null', () => {
            cutscene.handleKeyDown = jest.fn();
            cutscene.handleKeyUp = jest.fn();
            cutscene.handleLeftClick = jest.fn();
            cutscene.handleLeftClickUp = jest.fn();

            const addSpy = jest.spyOn(document, 'addEventListener');
            const remSpy = jest.spyOn(document, 'removeEventListener');

            cutscene.addEventListeners();

            expect(addSpy).toHaveBeenCalledTimes(4);

            expect(typeof cutscene._wrappedKeyDown).toBe('function');
            expect(cutscene._wrappedKeyUp).toBeTruthy();
            expect(typeof cutscene._wrappedLeftClick).toBe('function');
            expect(cutscene._wrappedLeftClickUp).toBeTruthy();

            cutscene.removeEventListeners();

            expect(remSpy).toHaveBeenCalledTimes(4);

            expect(cutscene._wrappedKeyDown).toBeNull();
            expect(cutscene._wrappedKeyUp).toBeNull();
            expect(cutscene._wrappedLeftClick).toBeNull();
            expect(cutscene._wrappedLeftClickUp).toBeNull();

            addSpy.mockRestore();
            remSpy.mockRestore();
        });

        it('gates keydown + left click when performance.now() is before ignoreCutsceneInputUntil', () => {
            const kd = jest.fn();
            const lc = jest.fn();

            cutscene.handleKeyDown = kd;
            cutscene.handleLeftClick = lc;

            const nowSpy = jest.spyOn(performance, 'now');

            nowSpy.mockReturnValue(1000);
            game.ignoreCutsceneInputUntil = 2000;

            cutscene.addEventListeners();

            cutscene._wrappedKeyDown({ key: 'Enter' });
            cutscene._wrappedLeftClick({ type: 'click' });

            expect(kd).not.toHaveBeenCalled();
            expect(lc).not.toHaveBeenCalled();

            cutscene.removeEventListeners();
            nowSpy.mockRestore();
        });

        it('allows keydown + left click once performance.now() passes ignoreCutsceneInputUntil', () => {
            const kd = jest.fn();
            const lc = jest.fn();

            cutscene.handleKeyDown = kd;
            cutscene.handleLeftClick = lc;

            const nowSpy = jest.spyOn(performance, 'now');

            nowSpy.mockReturnValue(1000);
            game.ignoreCutsceneInputUntil = 2000;

            cutscene.addEventListeners();

            cutscene._wrappedKeyDown({ key: 'Enter' });
            cutscene._wrappedLeftClick({ type: 'click' });
            expect(kd).not.toHaveBeenCalled();
            expect(lc).not.toHaveBeenCalled();

            nowSpy.mockReturnValue(2500);

            cutscene._wrappedKeyDown({ key: 'Enter' });
            cutscene._wrappedLeftClick({ type: 'click' });

            expect(kd).toHaveBeenCalledTimes(1);
            expect(lc).toHaveBeenCalledTimes(1);

            cutscene.removeEventListeners();
            nowSpy.mockRestore();
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

    describe('draw', () => {
        let context, bgImg, charImg, reminderImg, textBoxImg;

        beforeEach(() => {
            bgImg = { src: 'bg' };
            charImg = { src: 'char' };
            reminderImg = { src: 'rem' };
            textBoxImg = { src: 'box' };

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
                save: jest.fn(),
                restore: jest.fn(),
                drawImage: jest.fn(),
                fillText: jest.fn(),
                measureText: jest.fn().mockReturnValue({ width: 5 }),
                translate: jest.fn(),

                _filter: '',
                set filter(v) { this._filter = v; },
                get filter() { return this._filter; },

                _alpha: 1,
                set globalAlpha(v) { this._alpha = v; },
                get globalAlpha() { return this._alpha; },

                font: '',
                textAlign: '',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowColor: '',
                shadowBlur: 0,
                fillStyle: '',
            };

            cutscene.dialogue = [{
                character: 'Firedog',
                dialogue: 'Hi',
                images: [{ id: 'charSprite', opacity: 0.7, x: 10, y: 20, width: 30, height: 40 }],
            }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 2;
            cutscene.fullWords = ['Hi'];
            cutscene.fullWordsColor = ['Hi'];
            cutscene.reminderImageStartTime = performance.now() - 1000;

            game.shakeActive = false;
            game.menu.pause.isPaused = false;
        });

        it('passes wrapped lines into characterColorLogic based on characterLimit', () => {
            const longText = 'aaa bbbbbb ccc dddd';
            cutscene.characterLimit = 8;

            cutscene.dialogue = [{
                character: 'Firedog',
                dialogue: longText,
                images: [],
            }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = longText.length;
            cutscene.fullWords = longText.split(' ');

            cutscene.lastSoundPlayed = true;

            const ctx = {
                ...context,
                set filter(v) { },
                get filter() { return 'none'; },
                set globalAlpha(v) { },
                get globalAlpha() { return 1; },
            };

            const colorSpy = jest.spyOn(cutscene, 'characterColorLogic');

            cutscene.draw(ctx);

            expect(colorSpy).toHaveBeenCalledWith(
                ctx,
                ['aaa bbbbbb', 'ccc dddd'],
                expect.any(Array),
                'Firedog: ',
                longText,
                expect.any(Array),
            );
        });

        it('draws background, shakes when game.shakeActive and not paused, then restores filter', () => {
            cutscene.backgroundImage = bgImg;
            game.shakeActive = true;
            cutscene.isBackgroundBlackAndWhite = true;

            const pre = jest.spyOn(shake, 'preShake');
            const post = jest.spyOn(shake, 'postShake');

            jest.spyOn(performance, 'now').mockReturnValue(cutscene.reminderImageStartTime + 500);

            cutscene.draw(context);

            expect(pre).toHaveBeenCalledWith(context);
            expect(context.drawImage).toHaveBeenCalledWith(
                bgImg,
                0,
                0,
                game.width,
                game.height
            );
            expect(post).toHaveBeenCalledWith(context);
            expect(context._filter).toBe('none');
        });

        it('does not shake background when paused even if game.shakeActive is true', () => {
            cutscene.backgroundImage = bgImg;
            game.shakeActive = true;
            game.menu.pause.isPaused = true;

            const pre = jest.spyOn(shake, 'preShake');
            const post = jest.spyOn(shake, 'postShake');

            cutscene.draw(context);

            expect(pre).not.toHaveBeenCalled();
            expect(post).not.toHaveBeenCalled();
        });

        it('renders character image, textBox, reminder image, and final sounds', () => {
            cutscene.backgroundImage = null;
            cutscene.dontShowTextBoxAndSound = false;

            jest.spyOn(performance, 'now').mockReturnValue(
                cutscene.reminderImageStartTime + 2000
            );

            cutscene.lastSoundPlayed = false;
            cutscene.lastSound2Played = false;

            cutscene.textIndex = 999;

            const play = game.audioHandler.cutsceneDialogue.playSound;

            cutscene.draw(context);

            expect(context.drawImage).toHaveBeenCalledWith(charImg, 10, 20, 30, 40);
            expect(context.drawImage).toHaveBeenCalledWith(
                textBoxImg,
                15,
                game.height - 70,
                cutscene.textBoxWidth,
                96
            );
            expect(context.drawImage).toHaveBeenCalledWith(
                reminderImg,
                game.width - 500,
                game.height - 100
            );

            expect(play).toHaveBeenCalledWith('bit1', false, true, true);
            expect(play).toHaveBeenCalledWith('bit2');
        });

        it('skips textBox when dontShowTextBoxAndSound is true', () => {
            cutscene.dontShowTextBoxAndSound = true;
            jest.spyOn(performance, 'now').mockReturnValue(
                cutscene.reminderImageStartTime + 2000
            );

            cutscene.textIndex = 999;
            cutscene.draw(context);

            const calledWithTextBox = context.drawImage.mock.calls.some(
                args => args[0] === textBoxImg
            );
            expect(calledWithTextBox).toBe(false);
        });

        it('does not draw reminder image after timeout', () => {
            jest.spyOn(performance, 'now').mockReturnValue(
                cutscene.reminderImageStartTime + 8000
            );

            cutscene.textIndex = 999;
            cutscene.draw(context);

            const calledWithReminder = context.drawImage.mock.calls.some(
                args => args[0] === reminderImg
            );
            expect(calledWithReminder).toBe(false);
        });

        it('handles paused-menu audio branch when menu is paused', () => {
            game.menu.pause.isPaused = true;
            cutscene.textIndex = 1;

            jest.spyOn(performance, 'now').mockReturnValue(
                cutscene.reminderImageStartTime + 1000
            );

            cutscene.draw(context);

            expect(game.audioHandler.cutsceneDialogue.playSound)
                .toHaveBeenCalledWith('bit1', false, true, true);
        });

        it('applies grayscale filter to character images when isCharacterBlackAndWhite is true', () => {
            const filters = [];
            const ctx = {
                ...context,
                set filter(v) { filters.push(v); this._filter = v; },
                get filter() { return this._filter; },
            };

            cutscene.isCharacterBlackAndWhite = true;

            jest.spyOn(performance, 'now').mockReturnValue(
                cutscene.reminderImageStartTime + 1000
            );

            cutscene.draw(ctx);
            expect(filters).toContain('grayscale(100%)');
        });

        it('when enterDuringBackgroundTransition is false, it forces pause and rewinds textIndex', () => {
            cutscene.dialogue = [{
                character: 'Firedog',
                dialogue: 'Hello',
                images: [],
            }];
            cutscene.dialogueIndex = 0;
            cutscene.fullWords = ['Hello'];
            cutscene.fullWordsColor = ['Hello'];
            cutscene.textIndex = 2;

            game.enterDuringBackgroundTransition = false;

            cutscene.draw(context);

            expect(cutscene.pause).toBe(true);
            expect(cutscene.textIndex).toBe(1);
        });

        it('plays bit1 via playEightBitSound when typing and not paused menu', () => {
            cutscene.dialogue = [{
                character: 'Firedog',
                dialogue: 'Hello',
                images: [],
            }];
            cutscene.dialogueIndex = 0;
            cutscene.fullWords = ['Hello'];
            cutscene.fullWordsColor = ['Hello'];
            cutscene.textIndex = 0;

            game.enterDuringBackgroundTransition = true;
            game.menu.pause.isPaused = false;

            const spy = jest.spyOn(cutscene, 'playEightBitSound');

            cutscene.draw(context);

            expect(spy).toHaveBeenCalledWith('bit1');
        });

        it('ellipsis followed by only terminal punctuation triggers dot-pause behavior', () => {
            const dialogue = 'Why...? Next';

            cutscene.dialogue = [{
                character: 'Firedog',
                dialogue,
                images: [],
            }];
            cutscene.dialogueIndex = 0;
            cutscene.fullWords = dialogue.split(' ');
            cutscene.fullWordsColor = dialogue.split(' ');

            cutscene.textIndex = dialogue.indexOf('?');

            game.enterDuringBackgroundTransition = true;
            game.menu.pause.isPaused = false;

            cutscene.lastSoundPlayed = false;
            cutscene.playSound2OnDotPause = false;

            const spy = jest.spyOn(cutscene, 'playEightBitSound');

            cutscene.draw(context);

            expect(spy).toHaveBeenCalledWith('bit2');
            expect(cutscene.playSound2OnDotPause).toBe(true);
            expect(cutscene.pause).toBe(true);
            expect(cutscene.continueDialogue).toBe(true);
            expect(cutscene.isEnterPressed).toBe(false);
        });
    });
});
