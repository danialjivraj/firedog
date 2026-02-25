import { Cutscene } from '../../game/cutscene/cutscene.js';
import * as shake from '../../game/animations/shake.js';
import * as fading from '../../game/animations/fading.js';
import * as skinsAndCosmetics from '../../game/config/skinsAndCosmetics.js';

jest.mock('../../game/config/skinsAndCosmetics.js', () => {
    return {
        COSMETIC_LAYER_ORDER: ['neck', 'eyes', 'face', 'head'],
        getCutsceneSkinPrefixBySkinId: jest.fn((skinId) => {
            switch (skinId) {
                case 'shinySkin': return 'shiny';
                case 'midnightSteelSkin': return 'midnightSteel';
                default: return '';
            }
        }),
        getCutsceneCosmeticOverlayId: jest.fn((slot, key) => {
            if (!slot || !key || key === 'none') return null;
            return `${slot}_${key}_overlay`;
        }),
        getCosmeticChromaDegFromState: jest.fn((slot, key, chromaState) => {
            const slotState = chromaState && typeof chromaState === 'object' ? chromaState[slot] : null;
            const v = slotState && typeof slotState === 'object' ? slotState[key] : null;
            return typeof v === 'number' ? v : 0;
        }),
        drawWithOptionalHue: jest.fn((ctx, cfg, fn) => fn()),
    };
});

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
                wardrobe: {
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

    describe('ellipsis helpers', () => {
        it('ellipsisFollowedOnlyByTerminalPunct: true when only terminal punctuation follows', () => {
            expect(cutscene.ellipsisFollowedOnlyByTerminalPunct('Hi...?!', 2)).toBe(true);
        });

        it('ellipsisFollowedOnlyByTerminalPunct: false when next non-terminal text exists', () => {
            expect(cutscene.ellipsisFollowedOnlyByTerminalPunct('Hi... Next', 2)).toBe(false);
        });

        it('endsWithEllipsisPlusTerminal matches "...?" style', () => {
            expect(cutscene.endsWithEllipsisPlusTerminal('Why...?')).toBe(true);
            expect(cutscene.endsWithEllipsisPlusTerminal('Why... Next')).toBe(false);
        });

        it('isTerminalChar matches terminal characters', () => {
            expect(cutscene.isTerminalChar(')')).toBe(true);
            expect(cutscene.isTerminalChar('!')).toBe(true);
            expect(cutscene.isTerminalChar('a')).toBe(false);
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

    describe('buildColorSpans / colorAtGlobal', () => {
        it('buildColorSpans prefers longer keys (no overlap issues) and returns spans', () => {
            cutscene.characterColors = {
                Firedog: 'yellow',
                'Project Cryptoterra Genesis': 'OrangeRed',
            };

            const spans = cutscene.buildColorSpans('Firedog said Project Cryptoterra Genesis now');
            expect(spans.length).toBeGreaterThan(0);

            const idx = 'Firedog said'.indexOf('Firedog');
            expect(cutscene.colorAtGlobal(idx, spans, 'white')).toBe('yellow');
        });

        it('colorAtGlobal falls back when no span matches', () => {
            expect(cutscene.colorAtGlobal(10, [], 'white')).toBe('white');
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

        it('throws when rect is missing', () => {
            expect(() => cutscene.addImage('x')).toThrow(/requires a rect/);
        });

        it('throws when rect has non-numeric values', () => {
            expect(() =>
                cutscene.addImage('x', { x: '1', y: 0, width: 10, height: 10 })
            ).toThrow(/requires numeric/);
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
            cutscene.addDialogue(
                'A',
                'Hi',
                { whisper: true },
                { id: 'x', x: 0, y: 0, width: 1, height: 1 }
            );
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

        it('builds and caches spans for current dialogueIndex', () => {
            cutscene.dialogue = [{ character: 'Firedog', dialogue: 'Hello Firedog', images: [] }];
            cutscene.displayDialogue();
            expect(cutscene.currentSpansForIndex).toBe(0);
            expect(Array.isArray(cutscene.currentColorSpans)).toBe(true);
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

    describe('safe wardrobe getters', () => {
        it('getCurrentSkinIdSafe uses wardrobe getter when present', () => {
            game.menu.wardrobe.getCurrentSkinId.mockReturnValue('midnightSteelSkin');
            expect(cutscene.getCurrentSkinIdSafe()).toBe('midnightSteelSkin');
        });

        it('getCurrentSkinIdSafe falls back to game.selectedSkinId or defaultSkin', () => {
            delete game.menu.wardrobe.getCurrentSkinId;
            game.selectedSkinId = 'shinySkin';
            expect(cutscene.getCurrentSkinIdSafe()).toBe('shinySkin');

            delete game.selectedSkinId;
            expect(cutscene.getCurrentSkinIdSafe()).toBe('defaultSkin');
        });

        it('getCurrentCosmeticKeySafe uses wardrobe getter when present and normalizes falsy to none', () => {
            game.menu.wardrobe.getCurrentCosmeticKey.mockReturnValue('');
            expect(cutscene.getCurrentCosmeticKeySafe('head')).toBe('none');

            game.menu.wardrobe.getCurrentCosmeticKey.mockReturnValue('hatOutfit');
            expect(cutscene.getCurrentCosmeticKeySafe('head')).toBe('hatOutfit');
        });

        it('getCurrentCosmeticKeySafe falls back to selectedCosmetics/currentCosmetics by slot', () => {
            delete game.menu.wardrobe.getCurrentCosmeticKey;
            game.selectedCosmetics = { head: 'hatOutfit', eyes: '' };

            expect(cutscene.getCurrentCosmeticKeySafe('head')).toBe('hatOutfit');
            expect(cutscene.getCurrentCosmeticKeySafe('eyes')).toBe('none');
            expect(cutscene.getCurrentCosmeticKeySafe('neck')).toBe('none');
        });

        it('getCurrentCosmeticsChromaStateSafe returns wardrobe state when valid, else {}', () => {
            game.menu.wardrobe.getCurrentCosmeticsChromaState = jest.fn(() => ({ head: { hatOutfit: 120 } }));
            expect(cutscene.getCurrentCosmeticsChromaStateSafe()).toEqual({ head: { hatOutfit: 120 } });

            game.menu.wardrobe.getCurrentCosmeticsChromaState = jest.fn(() => null);
            expect(cutscene.getCurrentCosmeticsChromaStateSafe()).toEqual({});

            game.menu.wardrobe.getCurrentCosmeticsChromaState = jest.fn(() => 'nope');
            expect(cutscene.getCurrentCosmeticsChromaStateSafe()).toEqual({});
        });

        it('getCurrentCosmeticChromaDegSafe returns 0 for none, else computed via getCosmeticChromaDegFromState', () => {
            game.menu.wardrobe.getCurrentCosmeticKey = jest.fn(() => 'none');
            expect(cutscene.getCurrentCosmeticChromaDegSafe('head')).toBe(0);

            game.menu.wardrobe.getCurrentCosmeticKey = jest.fn(() => 'hatOutfit');
            game.menu.wardrobe.getCurrentCosmeticsChromaState = jest.fn(() => ({ head: { hatOutfit: 240 } }));

            const deg = cutscene.getCurrentCosmeticChromaDegSafe('head');
            expect(deg).toBe(240);
            expect(skinsAndCosmetics.getCosmeticChromaDegFromState).toHaveBeenCalledWith(
                'head',
                'hatOutfit',
                { head: { hatOutfit: 240 } }
            );
        });
    });

    describe('skin-based helpers (updated to new skin system)', () => {
        it('getmap6insideCaveLavaEarthquake only special-cases shinySkin', () => {
            game.menu.wardrobe.getCurrentSkinId.mockReturnValue('defaultSkin');
            expect(cutscene.getmap6insideCaveLavaEarthquake()).toBe('map6insideCaveLavaEarthquake');

            game.menu.wardrobe.getCurrentSkinId.mockReturnValue('midnightSteelSkin');
            expect(cutscene.getmap6insideCaveLavaEarthquake()).toBe('map6insideCaveLavaEarthquake');

            game.menu.wardrobe.getCurrentSkinId.mockReturnValue('shinySkin');
            expect(cutscene.getmap6insideCaveLavaEarthquake()).toBe('map6insideCaveLavaEarthquakeShiny');
        });

        it('getSkinPrefix uses getCutsceneSkinPrefixBySkinId', () => {
            game.menu.wardrobe.getCurrentSkinId.mockReturnValue('defaultSkin');
            expect(cutscene.getSkinPrefix()).toBe('');

            game.menu.wardrobe.getCurrentSkinId.mockReturnValue('midnightSteelSkin');
            expect(cutscene.getSkinPrefix()).toBe('midnightSteel');

            game.menu.wardrobe.getCurrentSkinId.mockReturnValue('shinySkin');
            expect(cutscene.getSkinPrefix()).toBe('shiny');
        });

        it('setfiredog* helpers prepend prefix', () => {
            game.menu.wardrobe.getCurrentSkinId.mockReturnValue('defaultSkin');
            expect(cutscene.setfiredogHappy()).toBe('firedogHappy');
            expect(cutscene.setfiredogSadBorder()).toBe('firedogSadBorder');

            game.menu.wardrobe.getCurrentSkinId.mockReturnValue('shinySkin');
            expect(cutscene.setfiredogHappy()).toBe('shinyfiredogHappy');
            expect(cutscene.setfiredogSadBorder()).toBe('shinyfiredogSadBorder');
        });
    });

    describe('firedog id helpers / aliasing', () => {
        it('getFiredogCoreId extracts from first "firedog"', () => {
            expect(cutscene.getFiredogCoreId('shinyfiredogHappy')).toBe('firedogHappy');
            expect(cutscene.getFiredogCoreId('firedogSad')).toBe('firedogSad');
            expect(cutscene.getFiredogCoreId('nope')).toBe('nope');
        });

        it('aliases firedogLaugh -> firedogHappy and NormalQuestionAndExlamationMark -> firedogNormal', () => {
            expect(cutscene.getAliasedFiredogDomId('shinyfiredogLaugh')).toBe('shinyfiredogHappy');
            expect(cutscene.getAliasedFiredogDomId('firedogNormalQuestionAndExlamationMark')).toBe('firedogNormal');
        });

        it('isFiredogEmotionImageId matches allowed emotion ids (with optional prefix)', () => {
            expect(cutscene.isFiredogEmotionImageId('firedogHappy')).toBe(true);
            expect(cutscene.isFiredogEmotionImageId('shinyfiredogHappy')).toBe(true);
            expect(cutscene.isFiredogEmotionImageId('firedogHappyBorder')).toBe(true);
            expect(cutscene.isFiredogEmotionImageId('catHappy')).toBe(false);
        });

        it('shouldDrawPanelBorderForImageId returns false for firedogBorderRequestId and true for other *Border', () => {
            expect(cutscene.shouldDrawPanelBorderForImageId('firedogHappyBorder')).toBe(false);
            expect(cutscene.shouldDrawPanelBorderForImageId('someCardBorder')).toBe(true);
            expect(cutscene.shouldDrawPanelBorderForImageId('plain')).toBe(false);
        });
    });

    describe('cosmetic overlays ordering', () => {
        it('getFiredogCosmeticOverlaysInLayerOrder returns only valid overlays in COSMETIC_LAYER_ORDER', () => {
            game.menu.wardrobe.getCurrentCosmeticKey = jest.fn((slot) => {
                if (slot === 'head') return 'hatOutfit';
                if (slot === 'neck') return 'none';
                if (slot === 'eyes') return 'thugSunglassesOutfit';
                return 'none';
            });

            const overlays = cutscene.getFiredogCosmeticOverlaysInLayerOrder();
            expect(overlays.map(o => o.slot)).toEqual(['eyes', 'head']);
            expect(overlays[0].overlayId).toBe('eyes_thugSunglassesOutfit_overlay');
            expect(overlays[1].overlayId).toBe('head_hatOutfit_overlay');
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

    describe('transitionWithBg', () => {
        it('removes listeners, runs before, triggers background change, then re-adds listeners and sets bg after delay', () => {
            jest.useFakeTimers();

            const before = jest.fn();
            const after = jest.fn();

            const remSpy = jest.spyOn(cutscene, 'removeEventListeners').mockImplementation(() => { });
            const addSpy = jest.spyOn(cutscene, 'addEventListeners').mockImplementation(() => { });
            const bgSpy = jest.spyOn(cutscene, 'cutsceneBackgroundChange');

            const bgEl = { id: 'myBg' };
            jest.spyOn(document, 'getElementById').mockImplementation((id) => {
                if (id === 'myBg') return bgEl;
                return null;
            });

            cutscene.transitionWithBg(1, 2, 3, 'myBg', 600, before, after);

            expect(remSpy).toHaveBeenCalled();
            expect(before).toHaveBeenCalled();
            expect(bgSpy).toHaveBeenCalledWith(1, 2, 3);

            expect(addSpy).not.toHaveBeenCalled();
            expect(cutscene.backgroundImage).not.toBe(bgEl);

            jest.advanceTimersByTime(600);

            expect(addSpy).toHaveBeenCalled();
            expect(cutscene.backgroundImage).toBe(bgEl);
            expect(after).toHaveBeenCalled();

            jest.useRealTimers();
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

        it('gates all wrapped handlers when pause menu is paused', () => {
            const kd = jest.fn();
            const ku = jest.fn();
            const lc = jest.fn();
            const lcu = jest.fn();

            cutscene.handleKeyDown = kd;
            cutscene.handleKeyUp = ku;
            cutscene.handleLeftClick = lc;
            cutscene.handleLeftClickUp = lcu;

            const nowSpy = jest.spyOn(performance, 'now').mockReturnValue(9999);

            game.menu.pause.isPaused = true;
            game.ignoreCutsceneInputUntil = 0;

            cutscene.addEventListeners();

            cutscene._wrappedKeyDown({ key: 'Enter' });
            cutscene._wrappedKeyUp({ key: 'Enter' });
            cutscene._wrappedLeftClick({ type: 'click' });
            cutscene._wrappedLeftClickUp({ button: 0 });

            expect(kd).not.toHaveBeenCalled();
            expect(ku).not.toHaveBeenCalled();
            expect(lc).not.toHaveBeenCalled();
            expect(lcu).not.toHaveBeenCalled();

            cutscene.removeEventListeners();
            nowSpy.mockRestore();
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

    describe('drawSingleImage', () => {
        let ctx;

        beforeEach(() => {
            ctx = {
                save: jest.fn(),
                restore: jest.fn(),
                drawImage: jest.fn(),
                clip: jest.fn(),
                beginPath: jest.fn(),
                closePath: jest.fn(),
                moveTo: jest.fn(),
                arcTo: jest.fn(),
                fillText: jest.fn(),
                measureText: jest.fn().mockReturnValue({ width: 5 }),
                stroke: jest.fn(),
                translate: jest.fn(),
                lineWidth: 1,
                strokeStyle: '',
                shadowColor: '',
                shadowBlur: 0,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                filter: 'none',
                globalAlpha: 1,
            };

            jest.spyOn(document, 'getElementById').mockImplementation((id) => {
                // base firedog
                if (id === 'firedogHappy') return { id, naturalWidth: 100, naturalHeight: 100 };
                // overlays
                if (id === 'head_hatOutfit_overlay') return { id };
                if (id === 'eyes_thugSunglassesOutfit_overlay') return { id };
                // border assets
                if (id === 'blueBackground') return { id };
                if (id === 'darkBlueBackground') return { id };
                if (id === 'greenBackground') return { id };
                if (id === 'redBackground') return { id };
                if (id === 'yellowBackground') return { id };
                // generic
                return { id, naturalWidth: 100, naturalHeight: 100 };
            });

            game.menu.wardrobe.getCurrentCosmeticKey = jest.fn((slot) => {
                if (slot === 'head') return 'hatOutfit';
                if (slot === 'eyes') return 'thugSunglassesOutfit';
                return 'none';
            });
            game.menu.wardrobe.getCurrentCosmeticsChromaState = jest.fn(() => ({
                head: { hatOutfit: 120 },
                eyes: { thugSunglassesOutfit: 240 },
            }));
        });

        it('for a firedog border request id, delegates to drawFiredogBorderComposite and returns', () => {
            const spy = jest.spyOn(cutscene, 'drawFiredogBorderComposite').mockImplementation(() => { });

            cutscene.drawSingleImage(ctx, {
                id: 'firedogHappyBorder',
                x: 10,
                y: 20,
                width: 30,
                height: 40,
                opacity: 0.7,
                effectKey: 'firedogHappy',
            });

            expect(spy).toHaveBeenCalledWith(
                ctx,
                'firedogHappyBorder',
                { x: 10, y: 20, width: 30, height: 40 },
                0.7,
                'firedogHappy',
                {}
            );

            expect(ctx.drawImage).not.toHaveBeenCalledWith(expect.objectContaining({ id: 'firedogHappyBorder' }), 10, 20, 30, 40);
        });

        it('overlays cosmetics and applies per-slot chroma hue via drawWithOptionalHue when drawing emotion image', () => {
            cutscene.isCharacterBlackAndWhite = false;

            cutscene.drawSingleImage(ctx, {
                id: 'firedogHappy',
                x: 10,
                y: 20,
                width: 30,
                height: 40,
            });

            expect(ctx.drawImage).toHaveBeenCalledWith(expect.objectContaining({ id: 'firedogHappy' }), 10, 20, 30, 40);
            expect(skinsAndCosmetics.drawWithOptionalHue).toHaveBeenCalledTimes(2);

            const calls = skinsAndCosmetics.drawWithOptionalHue.mock.calls;
            const hues = calls.map(c => c[1]?.hueDeg).sort((a, b) => a - b);
            expect(hues).toEqual([120, 240]);
        });

        it('when isCharacterBlackAndWhite is true, drawWithOptionalHue receives baseFilter grayscale', () => {
            cutscene.isCharacterBlackAndWhite = true;

            cutscene.drawSingleImage(ctx, {
                id: 'firedogHappy',
                x: 0,
                y: 0,
                width: 10,
                height: 10,
            });

            const cfgs = skinsAndCosmetics.drawWithOptionalHue.mock.calls.map(c => c[1]);
            expect(cfgs.some(cfg => cfg.baseFilter === 'grayscale(100%)')).toBe(true);
        });

        it('drawImages safely handles non-array and draws each image in array', () => {
            const spy = jest.spyOn(cutscene, 'drawSingleImage').mockImplementation(() => { });

            cutscene.drawImages(ctx, null);
            cutscene.drawImages(ctx, 'nope');

            cutscene.drawImages(ctx, [
                { id: 'a', x: 0, y: 0, width: 1, height: 1 },
                { id: 'b', x: 0, y: 0, width: 1, height: 1 },
            ]);

            expect(spy).toHaveBeenCalledTimes(2);
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
                    default: return { src: id, naturalWidth: 100, naturalHeight: 100 };
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
                beginPath: jest.fn(),
                closePath: jest.fn(),
                moveTo: jest.fn(),
                arcTo: jest.fn(),
                clip: jest.fn(),
                stroke: jest.fn(),

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
                lineWidth: 1,
                strokeStyle: '',
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

            game.cutsceneActive = true;
            game.talkToPenguin = false;
            game.boss.talkToBoss = false;
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
                game.gameHeight || game.height
            );
            expect(post).toHaveBeenCalledWith(context);
            expect(context._filter).toBe('none');
        });

        it('uses game.gameHeight if present when drawing background', () => {
            cutscene.backgroundImage = bgImg;
            game.gameHeight = 777;

            cutscene.draw(context);

            expect(context.drawImage).toHaveBeenCalledWith(bgImg, 0, 0, game.width, 777);
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

        it('does not draw reminder image after timeout (>= 7000ms)', () => {
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

        it('does not draw reminder when talkToPenguin is true or boss is talking', () => {
            const nowSpy = jest.spyOn(performance, 'now').mockReturnValue(
                cutscene.reminderImageStartTime + 2000
            );

            game.talkToPenguin = true;
            cutscene.textIndex = 999;
            cutscene.draw(context);
            expect(context.drawImage.mock.calls.some(args => args[0] === reminderImg)).toBe(false);

            context.drawImage.mockClear();
            game.talkToPenguin = false;
            game.boss.talkToBoss = true;
            cutscene.draw(context);
            expect(context.drawImage.mock.calls.some(args => args[0] === reminderImg)).toBe(false);

            nowSpy.mockRestore();
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

        it('partial ends with "..." and next char is non-terminal can trigger dot-pause behavior', () => {
            const dialogue = 'Wait... next';
            cutscene.dialogue = [{ character: 'Firedog', dialogue, images: [] }];
            cutscene.dialogueIndex = 0;
            cutscene.fullWords = dialogue.split(' ');
            cutscene.fullWordsColor = dialogue.split(' ');

            cutscene.textIndex = dialogue.indexOf('...') + 2;

            cutscene.lastSoundPlayed = false;
            cutscene.playSound2OnDotPause = false;
            game.enterDuringBackgroundTransition = true;
            game.menu.pause.isPaused = false;

            const spy = jest.spyOn(cutscene, 'playEightBitSound');

            cutscene.draw(context);

            expect(spy).toHaveBeenCalledWith('bit2');
            expect(cutscene.pause).toBe(true);
            expect(cutscene.continueDialogue).toBe(true);
        });
    });
});