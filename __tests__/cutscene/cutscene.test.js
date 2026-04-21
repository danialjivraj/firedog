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
    let game;
    let cutscene;

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
                    stopSound: jest.fn(),
                    pauseSound: jest.fn(),
                    stopAllSounds: jest.fn(),
                },
                cutsceneSFX: {
                    playSound: jest.fn(),
                    fadeOutAndStop: jest.fn(),
                    stopAllSounds: jest.fn(),
                },
                cutsceneMusic: {
                    playSound: jest.fn(),
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
            .mockImplementation((canvas, fadeIn, stay, fadeOut, cb, onBlack) => {
                if (onBlack) onBlack();
                cb();
            });

        cutscene = new Cutscene(game);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
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

    describe('getDotIndices', () => {
        it('finds all start indices of "..."', () => {
            expect(cutscene.getDotIndices('Wait... What...?!')).toEqual([4, 12]);
        });

        it('returns empty array when no ellipsis is present', () => {
            expect(cutscene.getDotIndices('No dots here')).toEqual([]);
        });
    });

    describe('ellipsis helpers', () => {
        it('ellipsisFollowedOnlyByTerminalPunct returns true when only terminal punctuation follows', () => {
            expect(cutscene.ellipsisFollowedOnlyByTerminalPunct('Hi...?!', 2)).toBe(true);
        });

        it('ellipsisFollowedOnlyByTerminalPunct returns false when next non-terminal text exists', () => {
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

    describe('characterColors membership', () => {
        it('has known character and token keys', () => {
            expect(cutscene.characterColors[cutscene.firedog]).toBeDefined();
            expect(cutscene.characterColors[cutscene.coinsLabel]).toBe('orange');
            expect(cutscene.characterColors[cutscene.creditCoinsLabel]).toBe('#aeaeaf');
        });

        it('does not include unknown strings', () => {
            expect(cutscene.characterColors.Random).toBeUndefined();
        });
    });

    describe('buildColorSpans / colorAtGlobal', () => {
        it('buildColorSpans returns spans for known terms', () => {
            cutscene.characterColors = {
                Firedog: 'yellow',
                'Project Cryptoterra Genesis': 'OrangeRed',
            };

            const text = 'Firedog said Project Cryptoterra Genesis now';
            const spans = cutscene.buildColorSpans(text);

            expect(spans.length).toBeGreaterThan(0);

            const firedogIdx = text.indexOf('Firedog');
            const projectIdx = text.indexOf('Project Cryptoterra Genesis');

            expect(cutscene.colorAtGlobal(firedogIdx, spans, 'white')).toBe('yellow');
            expect(cutscene.colorAtGlobal(projectIdx, spans, 'white')).toBe('OrangeRed');
        });

        it('buildColorSpans includes possessive matches', () => {
            cutscene.characterColors = {
                Firedog: 'yellow',
            };

            const text = `Firedog's journey`;
            const spans = cutscene.buildColorSpans(text);

            expect(cutscene.colorAtGlobal(0, spans, 'white')).toBe('yellow');
            expect(cutscene.colorAtGlobal(7, spans, 'white')).toBe('yellow');
        });

        it('colorAtGlobal falls back when no span matches', () => {
            expect(cutscene.colorAtGlobal(10, [], 'white')).toBe('white');
        });
    });

    describe('filters', () => {
        it('getCharacterBaseFilter returns sepia over grayscale when sepia is enabled', () => {
            cutscene.isCharacterBlackAndWhite = true;
            cutscene.isCharacterSepia = true;
            expect(cutscene.getCharacterBaseFilter()).toBe('sepia(100%) saturate(140%) contrast(115%) brightness(80%)');
        });

        it('getCharacterBaseFilter returns grayscale when black and white is enabled', () => {
            cutscene.isCharacterBlackAndWhite = true;
            cutscene.isCharacterSepia = false;
            expect(cutscene.getCharacterBaseFilter()).toBe('grayscale(100%)');
        });

        it('getBackgroundBaseFilter returns sepia over grayscale when sepia is enabled', () => {
            cutscene.isBackgroundBlackAndWhite = true;
            cutscene.isBackgroundSepia = true;
            expect(cutscene.getBackgroundBaseFilter()).toBe('sepia(100%) saturate(140%) contrast(115%) brightness(50%)');
        });

        it('getBackgroundBaseFilter returns grayscale when black and white is enabled', () => {
            cutscene.isBackgroundBlackAndWhite = true;
            cutscene.isBackgroundSepia = false;
            expect(cutscene.getBackgroundBaseFilter()).toBe('grayscale(100%)');
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

        it('supports border object and effectKey', () => {
            const img = cutscene.addImage(
                'bar',
                { x: 1, y: 2, width: 3, height: 4 },
                { border: { color: 'red' }, effectKey: 'firedogHappy' }
            );

            expect(img).toEqual({
                id: 'bar',
                x: 1,
                y: 2,
                width: 3,
                height: 4,
                effectKey: 'firedogHappy',
                opts: { border: { color: 'red' } },
            });
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
            expect(cutscene.dialogue[0]).toMatchObject({
                character: 'Alice',
                dialogue: 'Hi',
                whisper: false,
                onAdvance: null,
                onEnter: null,
            });
            expect(Array.isArray(cutscene.dialogue[0].images)).toBe(true);
        });

        it('supports options object as first param after dialogue', () => {
            const onAdvance = jest.fn();
            const onEnter = jest.fn();

            cutscene.addDialogue(
                'A',
                'Hi',
                { whisper: true, onAdvance, onEnter },
                { id: 'x', x: 0, y: 0, width: 1, height: 1 }
            );
            expect(cutscene.dialogue[0].whisper).toBe(true);
            expect(cutscene.dialogue[0].onAdvance).toBe(onAdvance);
            expect(cutscene.dialogue[0].onEnter).toBe(onEnter);
            expect(cutscene.dialogue[0].images).toHaveLength(1);
        });
    });

    describe('displayDialogue', () => {
        it('initializes internal state and sets reminderImageStartTime', () => {
            const now = jest.spyOn(performance, 'now').mockReturnValue(123);
            cutscene.dialogue = [{ character: 'A', dialogue: 'X', images: [] }];
            const addListenersSpy = jest.spyOn(cutscene, 'addEventListeners').mockImplementation(() => { });

            cutscene.displayDialogue();

            expect(cutscene.fullWords).toEqual(['X']);
            expect(cutscene.dialogueIndex).toBe(0);
            expect(cutscene.reminderImageStartTime).toBe(123);
            expect(addListenersSpy).toHaveBeenCalled();

            now.mockRestore();
        });

        it('builds and caches spans for current dialogueIndex', () => {
            cutscene.dialogue = [{ character: 'Firedog', dialogue: 'Hello Firedog', images: [] }];
            jest.spyOn(cutscene, 'addEventListeners').mockImplementation(() => { });

            cutscene.displayDialogue();

            expect(cutscene.currentSpansForIndex).toBe(0);
            expect(Array.isArray(cutscene.currentColorSpans)).toBe(true);
        });

        it('runs onEnter for first dialogue', () => {
            const onEnter = jest.fn();
            cutscene.addDialogue('A', 'Hi', { onEnter });
            jest.spyOn(cutscene, 'addEventListeners').mockImplementation(() => { });

            cutscene.displayDialogue();

            expect(onEnter).toHaveBeenCalledTimes(1);
        });
    });

    describe('dialogue hooks', () => {
        it('getCurrentDialogueEntry returns current entry or null', () => {
            expect(cutscene.getCurrentDialogueEntry()).toBeNull();

            cutscene.dialogue = [{ character: 'A', dialogue: 'Hi', images: [] }];
            cutscene.dialogueIndex = 0;

            expect(cutscene.getCurrentDialogueEntry()).toEqual(cutscene.dialogue[0]);
        });

        it('isCurrentDialogueFullyTyped reflects textIndex against dialogue length', () => {
            cutscene.dialogue = [{ character: 'A', dialogue: 'Hello', images: [] }];
            cutscene.dialogueIndex = 0;

            cutscene.textIndex = 5;
            expect(cutscene.isCurrentDialogueFullyTyped()).toBe(true);

            cutscene.textIndex = 4;
            expect(cutscene.isCurrentDialogueFullyTyped()).toBe(false);
        });

        it('runCurrentDialogueAdvanceActionIfAny runs only when fully typed', () => {
            const onAdvance = jest.fn();
            cutscene.addDialogue('A', 'Hello', { onAdvance });
            cutscene.dialogueIndex = 0;

            cutscene.textIndex = 4;
            cutscene.runCurrentDialogueAdvanceActionIfAny();
            expect(onAdvance).not.toHaveBeenCalled();

            cutscene.textIndex = 5;
            cutscene.runCurrentDialogueAdvanceActionIfAny();
            expect(onAdvance).toHaveBeenCalledTimes(1);
        });

        it('runCurrentDialogueEnterActionIfAny runs onEnter when present', () => {
            const onEnter = jest.fn();
            cutscene.addDialogue('A', 'Hello', { onEnter });
            cutscene.dialogueIndex = 0;

            cutscene.runCurrentDialogueEnterActionIfAny();

            expect(onEnter).toHaveBeenCalledTimes(1);
        });

        it('jumpToDialogue resets typing state, caches spans, and runs onEnter', () => {
            const onEnter = jest.fn();

            cutscene.addDialogue('A', 'First');
            cutscene.addDialogue('B', 'Second Firedog', { onEnter });

            cutscene.textIndex = 999;
            cutscene.lastSound2Played = true;
            cutscene.playSound2OnDotPause = true;
            cutscene.pause = true;
            cutscene.continueDialogue = true;
            cutscene.isEnterPressed = true;

            cutscene.jumpToDialogue(1);

            expect(cutscene.dialogueIndex).toBe(1);
            expect(cutscene.textIndex).toBe(0);
            expect(cutscene.lastSound2Played).toBe(false);
            expect(cutscene.playSound2OnDotPause).toBe(false);
            expect(cutscene.pause).toBe(false);
            expect(cutscene.continueDialogue).toBe(false);
            expect(cutscene.isEnterPressed).toBe(false);
            expect(cutscene.currentSpansForIndex).toBe(1);
            expect(Array.isArray(cutscene.currentColorSpans)).toBe(true);
            expect(cutscene.fullWordsColor).toEqual(['Second', 'Firedog']);
            expect(onEnter).toHaveBeenCalledTimes(1);
        });

        it('jumpToDialogue ignores out of range indices', () => {
            cutscene.addDialogue('A', 'Hello');
            cutscene.dialogueIndex = 0;

            cutscene.jumpToDialogue(-1);
            expect(cutscene.dialogueIndex).toBe(0);

            cutscene.jumpToDialogue(10);
            expect(cutscene.dialogueIndex).toBe(0);
        });
    });

    describe('audio wrappers', () => {
        it('playSFX proxies to cutsceneSFX.playSound', () => {
            cutscene.playSFX('boom', true);
            expect(game.audioHandler.cutsceneSFX.playSound).toHaveBeenCalledWith('boom', true);
        });

        it('fadeOutSFX proxies to cutsceneSFX.fadeOutAndStop', () => {
            cutscene.fadeOutSFX('boom', 300);
            expect(game.audioHandler.cutsceneSFX.fadeOutAndStop).toHaveBeenCalledWith('boom', 300);
        });

        it('playMusic proxies to cutsceneMusic.playSound', () => {
            cutscene.playMusic('song', true);
            expect(game.audioHandler.cutsceneMusic.playSound).toHaveBeenCalledWith('song', true);
        });

        it('fadeOutMusic proxies to cutsceneMusic.fadeOutAndStop', () => {
            cutscene.fadeOutMusic('song', 500);
            expect(game.audioHandler.cutsceneMusic.fadeOutAndStop).toHaveBeenCalledWith('song', 500);
        });

        it('stopAllAudio stops dialogue, sfx, and music', () => {
            cutscene.stopAllAudio();

            expect(game.audioHandler.cutsceneDialogue.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneSFX.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneMusic.stopAllSounds).toHaveBeenCalled();
        });

        it('stopTypingAudio stops dialogue and resets typing flags', () => {
            cutscene.lastSoundPlayed = true;
            cutscene.lastSound2Played = true;
            cutscene.playSound2OnDotPause = true;
            cutscene.pause = true;
            cutscene.continueDialogue = true;

            cutscene.stopTypingAudio();

            expect(game.audioHandler.cutsceneDialogue.stopAllSounds).toHaveBeenCalled();
            expect(cutscene.lastSoundPlayed).toBe(false);
            expect(cutscene.lastSound2Played).toBe(false);
            expect(cutscene.playSound2OnDotPause).toBe(false);
            expect(cutscene.pause).toBe(false);
            expect(cutscene.continueDialogue).toBe(false);
        });
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

        it('getCurrentCosmeticKeySafe uses wardrobe getter and normalizes falsy to none', () => {
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

    describe('drawImageWithOptionalHue', () => {
        it('does nothing when element is missing', () => {
            const ctx = { drawImage: jest.fn() };

            cutscene.drawImageWithOptionalHue(ctx, null, 0, 0, 1, 1, 120);

            expect(skinsAndCosmetics.drawWithOptionalHue).not.toHaveBeenCalled();
            expect(ctx.drawImage).not.toHaveBeenCalled();
        });

        it('passes hue and current character baseFilter into drawWithOptionalHue', () => {
            const ctx = { drawImage: jest.fn() };
            const el = { id: 'overlay' };
            cutscene.isCharacterSepia = true;

            cutscene.drawImageWithOptionalHue(ctx, el, 1, 2, 3, 4, 180);

            expect(skinsAndCosmetics.drawWithOptionalHue).toHaveBeenCalledWith(
                ctx,
                {
                    hueDeg: 180,
                    baseFilter: 'sepia(100%) saturate(140%) contrast(115%) brightness(80%)',
                },
                expect.any(Function)
            );
            expect(ctx.drawImage).toHaveBeenCalledWith(el, 1, 2, 3, 4);
        });
    });

    describe('skin-based helpers', () => {
        it('getSkinPrefix uses getCutsceneSkinPrefixBySkinId', () => {
            game.menu.wardrobe.getCurrentSkinId.mockReturnValue('defaultSkin');
            expect(cutscene.getSkinPrefix()).toBe('');

            game.menu.wardrobe.getCurrentSkinId.mockReturnValue('midnightSteelSkin');
            expect(cutscene.getSkinPrefix()).toBe('midnightSteel');

            game.menu.wardrobe.getCurrentSkinId.mockReturnValue('shinySkin');
            expect(cutscene.getSkinPrefix()).toBe('shiny');
        });

        it('setfiredog helpers prepend prefix', () => {
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

        it('aliases firedogLaugh -> firedogHappy and NormalQuestionAndExclamationMark -> firedogNormal', () => {
            expect(cutscene.getAliasedFiredogDomId('shinyfiredogLaugh')).toBe('shinyfiredogHappy');
            expect(cutscene.getAliasedFiredogDomId('firedogNormalQuestionAndExclamationMark')).toBe('firedogNormal');
        });

        it('isFiredogEmotionImageId matches allowed emotion ids', () => {
            expect(cutscene.isFiredogEmotionImageId('firedogHappy')).toBe(true);
            expect(cutscene.isFiredogEmotionImageId('shinyfiredogHappy')).toBe(true);
            expect(cutscene.isFiredogEmotionImageId('firedogHappyBorder')).toBe(true);
            expect(cutscene.isFiredogEmotionImageId('catHappy')).toBe(false);
        });

        it('isFiredogBorderRequestId matches only firedog border request ids', () => {
            expect(cutscene.isFiredogBorderRequestId('firedogHappyBorder')).toBe(true);
            expect(cutscene.isFiredogBorderRequestId('shinyfiredogHappyBorder')).toBe(true);
            expect(cutscene.isFiredogBorderRequestId('someCardBorder')).toBe(false);
        });

        it('shouldDrawPanelBorderForImageId returns false for firedog border request ids and true for other *Border ids', () => {
            expect(cutscene.shouldDrawPanelBorderForImageId('firedogHappyBorder')).toBe(false);
            expect(cutscene.shouldDrawPanelBorderForImageId('someCardBorder')).toBe(true);
            expect(cutscene.shouldDrawPanelBorderForImageId('plain')).toBe(false);
        });

        it('getBaseIdFromBorderRequestId strips Border suffix', () => {
            expect(cutscene.getBaseIdFromBorderRequestId('firedogHappyBorder')).toBe('firedogHappy');
        });

        it('getBorderAssetIdForBaseFiredogId returns themed border asset ids', () => {
            expect(cutscene.getBorderAssetIdForBaseFiredogId('firedogAngry')).toBe('redBackground');
            expect(cutscene.getBorderAssetIdForBaseFiredogId('firedogHappy')).toBe('greenBackground');
            expect(cutscene.getBorderAssetIdForBaseFiredogId('firedogPhew')).toBe('darkBlueBackground');
            expect(cutscene.getBorderAssetIdForBaseFiredogId('firedogLaugh')).toBe('yellowBackground');
            expect(cutscene.getBorderAssetIdForBaseFiredogId('firedogNormal')).toBe('blueBackground');
        });

        it('shouldOverlayCosmeticsForImageId follows firedog emotion image detection', () => {
            expect(cutscene.shouldOverlayCosmeticsForImageId('firedogHappy')).toBe(true);
            expect(cutscene.shouldOverlayCosmeticsForImageId('someCardBorder')).toBe(false);
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
                expect.any(Function),
                undefined
            );
            expect(game.enterDuringBackgroundTransition).toBe(true);
        });
    });

    describe('transitionWithBg', () => {
        it('removes listeners, stops typing audio, runs beforeFade, triggers background change, then re-adds listeners and sets bg after delay', () => {
            jest.useFakeTimers();

            const beforeFade = jest.fn();
            const onBlack = jest.fn();

            const remSpy = jest.spyOn(cutscene, 'removeEventListeners').mockImplementation(() => { });
            const addSpy = jest.spyOn(cutscene, 'addEventListeners').mockImplementation(() => { });
            const stopTypingSpy = jest.spyOn(cutscene, 'stopTypingAudio').mockImplementation(() => { });
            const bgSpy = jest.spyOn(cutscene, 'cutsceneBackgroundChange').mockImplementation(() => { });

            const bgEl = { id: 'myBg' };
            jest.spyOn(document, 'getElementById').mockImplementation((id) => {
                if (id === 'myBg') return bgEl;
                return null;
            });

            cutscene.transitionWithBg({
                fadeIn: 1,
                blackDuration: 2,
                fadeOut: 3,
                imageId: 'myBg',
                onBlackDelayMs: 600,
                beforeFade,
                onBlack,
            });

            expect(remSpy).toHaveBeenCalled();
            expect(stopTypingSpy).toHaveBeenCalled();
            expect(beforeFade).toHaveBeenCalled();
            expect(bgSpy).toHaveBeenCalledWith(1, 2, 3);

            expect(addSpy).not.toHaveBeenCalled();
            expect(cutscene.backgroundImage).not.toBe(bgEl);

            jest.advanceTimersByTime(600);

            expect(addSpy).toHaveBeenCalled();
            expect(cutscene.backgroundImage).toBe(bgEl);
            expect(onBlack).toHaveBeenCalled();
        });

        it('by default swaps on fade-out completion (onBlack callback), not a wall-clock delay', () => {
            const addSpy = jest.spyOn(cutscene, 'addEventListeners').mockImplementation(() => { });
            const onBlack = jest.fn();

            cutscene.transitionWithBg({
                fadeIn: 500,
                blackDuration: 1000,
                fadeOut: 500,
                onBlack,
            });

            expect(addSpy).toHaveBeenCalled();
            expect(onBlack).toHaveBeenCalled();
        });
    });

    describe('playEightBitSound', () => {
        beforeEach(() => {
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

            cutscene.playEightBitSound('bit1');

            expect(game.audioHandler.cutsceneDialogue.playSound).not.toHaveBeenCalled();
            expect(game.audioHandler.cutsceneDialogue.pauseSound).not.toHaveBeenCalled();
        });

        it('plays sound when not paused', () => {
            cutscene.dialogue = [{
                character: 'A',
                dialogue: 'hi',
                images: [],
                whisper: false,
            }];
            cutscene.dialogueIndex = 0;
            cutscene.pause = false;

            cutscene.playEightBitSound('bit1');

            expect(game.audioHandler.cutsceneDialogue.playSound).toHaveBeenCalledWith('bit1');
        });

        it('pauses sound when paused', () => {
            cutscene.dialogue = [{
                character: 'A',
                dialogue: 'hi',
                images: [],
                whisper: false,
            }];
            cutscene.dialogueIndex = 0;
            cutscene.pause = true;

            cutscene.playEightBitSound('bit1');

            expect(game.audioHandler.cutsceneDialogue.pauseSound).toHaveBeenCalledWith('bit1');
        });
    });

    describe('addEventListeners and removeEventListeners', () => {
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
            expect(typeof cutscene._wrappedKeyUp).toBe('function');
            expect(typeof cutscene._wrappedLeftClick).toBe('function');
            expect(typeof cutscene._wrappedLeftClickUp).toBe('function');

            cutscene.removeEventListeners();

            expect(remSpy).toHaveBeenCalledTimes(4);
            expect(cutscene._wrappedKeyDown).toBeNull();
            expect(cutscene._wrappedKeyUp).toBeNull();
            expect(cutscene._wrappedLeftClick).toBeNull();
            expect(cutscene._wrappedLeftClickUp).toBeNull();
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

            jest.spyOn(performance, 'now').mockReturnValue(9999);

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
        });

        it('gates handlers when performance.now() is before ignoreCutsceneInputUntil', () => {
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
        });

        it('allows handlers once performance.now() passes ignoreCutsceneInputUntil', () => {
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
        });
    });

    describe('keyboard / click callbacks', () => {
        beforeEach(() => {
            cutscene.dialogue = [{ character: 'A', dialogue: 'hello', images: [] }];
            jest.spyOn(cutscene, 'addEventListeners').mockImplementation(() => { });
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

    describe('panel helpers', () => {
        let ctx;

        beforeEach(() => {
            ctx = {
                save: jest.fn(),
                restore: jest.fn(),
                beginPath: jest.fn(),
                closePath: jest.fn(),
                moveTo: jest.fn(),
                arcTo: jest.fn(),
                fill: jest.fn(),
                stroke: jest.fn(),
                lineWidth: 0,
                strokeStyle: '',
                shadowColor: '',
                shadowBlur: 0,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                fillStyle: '',
            };
        });

        it('getPanelBorderStrokeColorFromOpts returns border color when provided', () => {
            expect(cutscene.getPanelBorderStrokeColorFromOpts({ border: { color: '#f00' } })).toBe('#f00');
        });

        it('getPanelBorderStrokeColorFromOpts returns talking color when talking is true', () => {
            expect(cutscene.getPanelBorderStrokeColorFromOpts({ border: { talking: true } })).toBe('#FFD000');
        });

        it('getPanelBorderStrokeColorFromOpts returns default otherwise', () => {
            expect(cutscene.getPanelBorderStrokeColorFromOpts({})).toBe('#000000');
        });

        it('drawRoundedPanelBorder draws a rounded border', () => {
            const roundRectSpy = jest.spyOn(cutscene, 'roundRectPath');

            cutscene.drawRoundedPanelBorder(ctx, 10, 20, 100, 80, { border: { talking: true } });

            expect(ctx.save).toHaveBeenCalled();
            expect(roundRectSpy).toHaveBeenCalled();
            expect(ctx.stroke).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
            expect(ctx.strokeStyle).toBe('#FFD000');
        });

        it('drawTextBoxPanel draws rounded textbox panel', () => {
            const roundRectSpy = jest.spyOn(cutscene, 'roundRectPath');

            cutscene.drawTextBoxPanel(ctx, 15, 20, 200, 96);

            expect(ctx.save).toHaveBeenCalled();
            expect(roundRectSpy).toHaveBeenCalledWith(ctx, 15, 20, 200, 96, 16);
            expect(ctx.fill).toHaveBeenCalled();
            expect(ctx.stroke).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
        });

        it('drawTextBox returns early when current dialogue is visually empty', () => {
            const panelSpy = jest.spyOn(cutscene, 'drawTextBoxPanel');

            cutscene.dialogue = [{ character: '', dialogue: '', images: [] }];
            cutscene.dialogueIndex = 0;

            cutscene.drawTextBox(ctx);

            expect(panelSpy).not.toHaveBeenCalled();
        });

        it('drawTextBox draws panel at expected coordinates for non-empty dialogue', () => {
            const panelSpy = jest.spyOn(cutscene, 'drawTextBoxPanel');

            cutscene.dialogue = [{ character: 'Firedog', dialogue: 'Hello', images: [] }];
            cutscene.dialogueIndex = 0;

            cutscene.drawTextBox(ctx);

            expect(panelSpy).toHaveBeenCalledWith(
                ctx,
                15,
                game.height - 65,
                cutscene.textBoxWidth,
                96
            );
        });
    });

    describe('visual empty dialogue helpers', () => {
        it('isDialogueEntryVisuallyEmpty returns true only when both character and dialogue are empty', () => {
            expect(cutscene.isDialogueEntryVisuallyEmpty({ character: '', dialogue: '' })).toBe(true);
            expect(cutscene.isDialogueEntryVisuallyEmpty({ character: 'A', dialogue: '' })).toBe(false);
            expect(cutscene.isDialogueEntryVisuallyEmpty({ character: '', dialogue: 'Hi' })).toBe(false);
            expect(cutscene.isDialogueEntryVisuallyEmpty({ character: 'A', dialogue: 'Hi' })).toBe(false);
        });

        it('isCurrentDialogueVisuallyEmpty checks the current dialogue entry', () => {
            cutscene.dialogue = [{ character: '', dialogue: '', images: [] }];
            cutscene.dialogueIndex = 0;
            expect(cutscene.isCurrentDialogueVisuallyEmpty()).toBe(true);

            cutscene.dialogue = [{ character: 'A', dialogue: '', images: [] }];
            cutscene.dialogueIndex = 0;
            expect(cutscene.isCurrentDialogueVisuallyEmpty()).toBe(false);
        });
    });

    describe('drawReminder', () => {
        let ctx;

        beforeEach(() => {
            ctx = {
                drawImage: jest.fn(),
            };
            cutscene.reminderImage = { id: 'rem' };
        });

        it('draws reminder while within time window and cutscene is active', () => {
            cutscene.reminderImageStartTime = 1000;
            jest.spyOn(performance, 'now').mockReturnValue(2000);

            cutscene.drawReminder(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(
                cutscene.reminderImage,
                game.width - 500,
                game.height - 100
            );
        });

        it('does not draw reminder outside time window', () => {
            cutscene.reminderImageStartTime = 1000;
            jest.spyOn(performance, 'now').mockReturnValue(9000);

            cutscene.drawReminder(ctx);

            expect(ctx.drawImage).not.toHaveBeenCalled();
        });

        it('does not draw reminder when talkToPenguin or boss talk is active', () => {
            cutscene.reminderImageStartTime = 1000;
            jest.spyOn(performance, 'now').mockReturnValue(2000);

            game.talkToPenguin = true;
            cutscene.drawReminder(ctx);
            expect(ctx.drawImage).not.toHaveBeenCalled();

            game.talkToPenguin = false;
            game.boss.talkToBoss = true;
            cutscene.drawReminder(ctx);
            expect(ctx.drawImage).not.toHaveBeenCalled();
        });
    });

    describe('drawDialogueTextWrapped', () => {
        let ctx;

        beforeEach(() => {
            const fillStyles = [];

            ctx = {
                save: jest.fn(),
                restore: jest.fn(),
                translate: jest.fn(),
                scale: jest.fn(),
                beginPath: jest.fn(),
                arc: jest.fn(),
                fill: jest.fn(),
                stroke: jest.fn(),

                strokeStyle: '',
                lineWidth: 1,
                shadowColor: '',
                shadowBlur: 0,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                fillText: jest.fn(),
                measureText: jest.fn((text) => ({ width: String(text).length * 10 })),
            };

            Object.defineProperty(ctx, 'fillStyle', {
                configurable: true,
                get: () => fillStyles[fillStyles.length - 1] || '',
                set: (value) => fillStyles.push(value),
            });
            ctx.__fillStyles = fillStyles;
        });

        it('renders each typed character', () => {
            cutscene.dialogue = [{
                character: 'Firedog',
                dialogue: 'Test',
                images: [],
            }];
            cutscene.dialogueIndex = 0;

            const fullDialogue = 'Test';
            const partialText = 'Test';
            const spans = cutscene.buildColorSpans(fullDialogue);

            cutscene.drawDialogueTextWrapped(
                ctx,
                'Firedog: ',
                fullDialogue,
                partialText,
                spans
            );

            expect(ctx.fillText).toHaveBeenCalledTimes(4);
        });

        it('wraps onto next line when remaining width is insufficient', () => {
            cutscene.textBoxWidth = 120;
            cutscene.dialogue = [{
                character: 'Firedog',
                dialogue: 'hello world',
                images: [],
            }];
            cutscene.dialogueIndex = 0;

            cutscene.drawDialogueTextWrapped(
                ctx,
                'Firedog: ',
                'hello world',
                'hello world',
                []
            );

            const yValues = ctx.fillText.mock.calls.map(call => call[2]);
            expect(new Set(yValues).size).toBeGreaterThan(1);
        });

        it('does not color punctuation characters', () => {
            cutscene.characterColors = { Firedog: 'yellow' };
            cutscene.dialogue = [{
                character: 'Narrator',
                dialogue: 'Firedog!',
                images: [],
            }];
            cutscene.dialogueIndex = 0;

            const spans = cutscene.buildColorSpans('Firedog!');

            cutscene.drawDialogueTextWrapped(
                ctx,
                'Narrator: ',
                'Firedog!',
                'Firedog!',
                spans
            );

            const punctuationCallIndex = ctx.fillText.mock.calls.findIndex(call => call[0] === '!');
            expect(punctuationCallIndex).toBeGreaterThan(-1);
        });

        it('renders the coin icon placeholder as an inline HUD coin icon', () => {
            const fullDialogue = `You earned ${cutscene.coinIcon}.`;
            cutscene.dialogue = [{
                character: 'Narrator',
                dialogue: fullDialogue,
                images: [],
            }];
            cutscene.dialogueIndex = 0;

            cutscene.drawDialogueTextWrapped(
                ctx,
                'Narrator: ',
                fullDialogue,
                fullDialogue,
                cutscene.buildColorSpans(fullDialogue)
            );

            const drawnText = ctx.fillText.mock.calls.map(call => call[0]).join('');

            expect(drawnText).toBe('Youearned.');
            expect(ctx.arc).toHaveBeenCalled();
        });

        it('renders the shared coin icon before a coin amount', () => {
            const fullDialogue = `You have ${cutscene.coinIcon}50.`;

            cutscene.dialogue = [{
                character: 'Narrator',
                dialogue: fullDialogue,
                images: [],
            }];
            cutscene.dialogueIndex = 0;

            cutscene.drawDialogueTextWrapped(
                ctx,
                'Narrator: ',
                fullDialogue,
                fullDialogue,
                cutscene.buildColorSpans(fullDialogue)
            );

            const drawnText = ctx.fillText.mock.calls.map(call => call[0]).join('');
            const firstDigitCall = ctx.fillText.mock.calls.find(call => call[0] === '5');
            const iconTranslateCall = ctx.translate.mock.calls[0];

            expect(drawnText).toBe('Youhave50.');
            expect(iconTranslateCall[0]).toBeLessThan(firstDigitCall[1]);
            expect(ctx.arc).toHaveBeenCalled();
        });

        it('reveals a coin amount one visual token at a time', () => {
            const fullDialogue = `You have ${cutscene.coinIcon}50.`;
            const iconStart = fullDialogue.indexOf(cutscene.coinIcon);

            cutscene.dialogue = [{
                character: 'Narrator',
                dialogue: fullDialogue,
                images: [],
            }];
            cutscene.dialogueIndex = 0;

            // partial stops right after the icon char: icon visible, digits not yet
            cutscene.drawDialogueTextWrapped(
                ctx,
                'Narrator: ',
                fullDialogue,
                fullDialogue.slice(0, iconStart + 1),
                cutscene.buildColorSpans(fullDialogue)
            );

            expect(ctx.arc).toHaveBeenCalled();
            expect(ctx.fillText.mock.calls.some(call => call[0] === '5')).toBe(false);

            ctx.fillText.mockClear();
            ctx.arc.mockClear();
            ctx.translate.mockClear();

            // partial includes icon + first digit: icon + '5' visible, '0' not yet
            cutscene.drawDialogueTextWrapped(
                ctx,
                'Narrator: ',
                fullDialogue,
                fullDialogue.slice(0, iconStart + 2),
                cutscene.buildColorSpans(fullDialogue)
            );

            expect(ctx.arc).toHaveBeenCalled();
            expect(ctx.fillText.mock.calls.some(call => call[0] === '5')).toBe(true);
            expect(ctx.fillText.mock.calls.some(call => call[0] === '0')).toBe(false);
        });

        it('renders credit coins as a silver inline HUD coin icon', () => {
            const fullDialogue = `Any leftover will then be converted into ${cutscene.creditCoinIcon}${cutscene.creditCoinsLabel}.`;

            cutscene.dialogue = [{
                character: 'Narrator',
                dialogue: fullDialogue,
                images: [],
            }];
            cutscene.dialogueIndex = 0;

            cutscene.drawDialogueTextWrapped(
                ctx,
                'Narrator: ',
                fullDialogue,
                fullDialogue,
                cutscene.buildColorSpans(fullDialogue)
            );

            const drawnText = ctx.fillText.mock.calls.map(call => call[0]).join('');

            expect(drawnText).toBe('AnyleftoverwillthenbeconvertedintoCreditCoins.');
            expect(ctx.__fillStyles).toContain('#cfd3db');
            expect(ctx.arc).toHaveBeenCalled();
        });

        it('renders coin label text directly adjacent to its icon via placeholder characters', () => {
            const fullDialogue = `Any leftover ${cutscene.coinIcon}${cutscene.coinsLabel} will then be converted into ${cutscene.creditCoinIcon}${cutscene.creditCoinsLabel}.`;

            cutscene.dialogue = [{
                character: 'Narrator',
                dialogue: fullDialogue,
                images: [],
            }];
            cutscene.dialogueIndex = 0;

            cutscene.drawDialogueTextWrapped(
                ctx,
                'Narrator: ',
                fullDialogue,
                fullDialogue,
                cutscene.buildColorSpans(fullDialogue)
            );

            const drawnText = ctx.fillText.mock.calls.map(call => call[0]).join('');

            // label text is flush against its icon
            expect(drawnText).toContain('leftoverCoins');
            expect(drawnText).toContain('intoCreditCoins.');
            // both gold and silver coin icons drawn
            expect(ctx.__fillStyles).toContain('#F2AF2F');
            expect(ctx.__fillStyles).toContain('#cfd3db');
            expect(ctx.arc).toHaveBeenCalledTimes(4); // 2 arcs per icon (outer + inner circle)
        });

        it('does not turn coin-like text inside another word into an icon', () => {
            cutscene.dialogue = [{
                character: 'Narrator',
                dialogue: "This can't be a coincidence.",
                images: [],
            }];
            cutscene.dialogueIndex = 0;

            cutscene.drawDialogueTextWrapped(
                ctx,
                'Narrator: ',
                "This can't be a coincidence.",
                "This can't be a coincidence.",
                cutscene.buildColorSpans("This can't be a coincidence.")
            );

            const drawnText = ctx.fillText.mock.calls.map(call => call[0]).join('');

            expect(drawnText).toContain('coincidence');
            expect(ctx.arc).not.toHaveBeenCalled();
        });
    });

    describe('drawSingleImage / drawImages', () => {
        let ctx;

        beforeEach(() => {
            skinsAndCosmetics.drawWithOptionalHue.mockClear();

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
                fill: jest.fn(),
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
                if (id === 'firedogHappy') return { id, naturalWidth: 100, naturalHeight: 100 };
                if (id === 'head_hatOutfit_overlay') return { id };
                if (id === 'eyes_thugSunglassesOutfit_overlay') return { id };
                if (id === 'blueBackground') return { id };
                if (id === 'darkBlueBackground') return { id };
                if (id === 'greenBackground') return { id };
                if (id === 'redBackground') return { id };
                if (id === 'yellowBackground') return { id };
                if (id === 'angryIcon') return { id };
                if (id === 'sweatDrop') return { id };
                if (id === 'questionMark') return { id };
                if (id === 'exclamationMark') return { id };
                if (id === 'exclamationAndQuestionMark') return { id };
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
        });

        it('draws standard image, optional panel border, cosmetic overlays, and effect layers', () => {
            const borderSpy = jest.spyOn(cutscene, 'drawRoundedPanelBorder').mockImplementation(() => { });
            const effectSpy = jest.spyOn(cutscene, 'drawFiredogEffectLayers').mockImplementation(() => { });

            cutscene.drawSingleImage(ctx, {
                id: 'firedogHappy',
                x: 10,
                y: 20,
                width: 30,
                height: 40,
                effectKey: 'firedogHeadache',
            });

            expect(ctx.drawImage).toHaveBeenCalledWith(expect.objectContaining({ id: 'firedogHappy' }), 10, 20, 30, 40);
            expect(skinsAndCosmetics.drawWithOptionalHue).toHaveBeenCalledTimes(2);
            expect(effectSpy).toHaveBeenCalled();
            expect(borderSpy).not.toHaveBeenCalled();
        });

        it('draws panel border for non-firedog Border ids', () => {
            const borderSpy = jest.spyOn(cutscene, 'drawRoundedPanelBorder').mockImplementation(() => { });

            cutscene.drawSingleImage(ctx, {
                id: 'someCardBorder',
                x: 1,
                y: 2,
                width: 3,
                height: 4,
                opts: { border: { talking: true } },
            });

            expect(borderSpy).toHaveBeenCalledWith(ctx, 1, 2, 3, 4, { border: { talking: true } });
        });

        it('when isCharacterBlackAndWhite is true, drawWithOptionalHue receives grayscale baseFilter', () => {
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

    describe('drawFiredogEffectLayers', () => {
        let ctx;

        beforeEach(() => {
            ctx = {
                save: jest.fn(),
                restore: jest.fn(),
                drawImage: jest.fn(),
                globalAlpha: 1,
            };

            jest.spyOn(document, 'getElementById').mockImplementation((id) => ({ id }));
        });

        it('draws each effect layer with original size when scale is 1', () => {
            cutscene.drawFiredogEffectLayers(
                ctx,
                'firedogAngry',
                { x: 10, y: 20, width: 30, height: 40, opacity: 0.5 }
            );

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.drawImage).toHaveBeenCalledWith(expect.objectContaining({ id: 'angryIcon' }), 10, 20, 30, 40);
            expect(ctx.restore).toHaveBeenCalled();
        });

        it('applies scaled drawing when layerScaleFn returns non-1', () => {
            cutscene.drawFiredogEffectLayers(
                ctx,
                'firedogSurprised',
                { x: 10, y: 20, width: 100, height: 80, opacity: 1 },
                () => 0.5
            );

            expect(ctx.drawImage).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'exclamationMark' }),
                35,
                40,
                50,
                40
            );
        });
    });

    describe('drawFiredogBorderComposite', () => {
        let ctx;

        beforeEach(() => {
            skinsAndCosmetics.drawWithOptionalHue.mockClear();

            ctx = {
                save: jest.fn(),
                restore: jest.fn(),
                drawImage: jest.fn(),
                clip: jest.fn(),
                beginPath: jest.fn(),
                closePath: jest.fn(),
                moveTo: jest.fn(),
                arcTo: jest.fn(),
                stroke: jest.fn(),
                fill: jest.fn(),
                filter: 'none',
                globalAlpha: 1,
                lineWidth: 0,
                strokeStyle: '',
                shadowColor: '',
                shadowBlur: 0,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
            };

            jest.spyOn(document, 'getElementById').mockImplementation((id) => {
                if (id === 'greenBackground') return { id };
                if (id === 'firedogHappy') return { id, naturalWidth: 100, naturalHeight: 100, width: 100, height: 100 };
                if (id === 'head_hatOutfit_overlay') return { id };
                if (id === 'eyes_thugSunglassesOutfit_overlay') return { id };
                if (id === 'questionMark') return { id };
                if (id === 'yellowLines') return { id };
                return null;
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

        it('returns early when base element is missing', () => {
            document.getElementById.mockImplementation((id) => {
                if (id === 'greenBackground') return { id };
                return null;
            });

            cutscene.drawFiredogBorderComposite(
                ctx,
                'firedogHappyBorder',
                { x: 0, y: 0, width: 100, height: 100 },
                1
            );

            expect(ctx.drawImage).not.toHaveBeenCalled();
        });

        it('draws border asset, panel border, base image, cosmetic overlays, and effect layers', () => {
            const borderSpy = jest.spyOn(cutscene, 'drawRoundedPanelBorder').mockImplementation(() => { });
            const effectSpy = jest.spyOn(cutscene, 'drawFiredogEffectLayers').mockImplementation(() => { });

            cutscene.drawFiredogBorderComposite(
                ctx,
                'firedogHappyBorder',
                { x: 10, y: 20, width: 100, height: 100 },
                0.8,
                'firedogCurious',
                { border: { talking: true } }
            );

            expect(ctx.drawImage).toHaveBeenCalledWith(expect.objectContaining({ id: 'greenBackground' }), 10, 20, 100, 100);
            expect(borderSpy).toHaveBeenCalledWith(ctx, 10, 20, 100, 100, { border: { talking: true } });
            expect(skinsAndCosmetics.drawWithOptionalHue).toHaveBeenCalledTimes(2);
            expect(effectSpy).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
        });
    });

    describe('draw', () => {
        let context;
        let bgImg;
        let charImg;
        let reminderImg;

        beforeEach(() => {
            bgImg = { src: 'bg' };
            charImg = { src: 'char' };
            reminderImg = { src: 'rem' };

            jest.spyOn(document, 'getElementById').mockImplementation(id => {
                switch (id) {
                    case 'bg': return bgImg;
                    case 'charSprite': return charImg;
                    case 'reminderToSkipWithTab': return reminderImg;
                    default: return { id, src: id, naturalWidth: 100, naturalHeight: 100 };
                }
            });

            cutscene.reminderImage = reminderImg;

            context = {
                save: jest.fn(),
                restore: jest.fn(),
                translate: jest.fn(),
                drawImage: jest.fn(),
                fillText: jest.fn(),
                measureText: jest.fn((text) => ({ width: String(text).length * 5 })),
                beginPath: jest.fn(),
                closePath: jest.fn(),
                moveTo: jest.fn(),
                arcTo: jest.fn(),
                clip: jest.fn(),
                stroke: jest.fn(),
                fill: jest.fn(),

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

        it('draws images, textbox panel, reminder image, and final sounds', () => {
            cutscene.backgroundImage = null;

            jest.spyOn(performance, 'now').mockReturnValue(
                cutscene.reminderImageStartTime + 2000
            );

            cutscene.lastSoundPlayed = false;
            cutscene.lastSound2Played = false;
            cutscene.textIndex = 999;

            const textBoxSpy = jest.spyOn(cutscene, 'drawTextBox');
            const reminderSpy = jest.spyOn(cutscene, 'drawReminder');

            cutscene.draw(context);

            expect(context.drawImage).toHaveBeenCalledWith(charImg, 10, 20, 30, 40);
            expect(textBoxSpy).toHaveBeenCalledWith(context);
            expect(reminderSpy).toHaveBeenCalledWith(context);
            expect(game.audioHandler.cutsceneDialogue.stopSound).toHaveBeenCalledWith('bit1');
            expect(game.audioHandler.cutsceneDialogue.playSound).toHaveBeenCalledWith('bit2');
        });

        it('stops typing audio once when dialogueIndex is past the dialogue length', () => {
            cutscene.dialogueIndex = 10;
            const stopSpy = jest.spyOn(cutscene, 'stopTypingAudio').mockImplementation(() => { });

            cutscene.draw(context);
            cutscene.draw(context);

            expect(stopSpy).toHaveBeenCalledTimes(1);
            expect(cutscene._stoppedAtDialogueEnd).toBe(true);
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
            cutscene.textIndex = 2;

            game.enterDuringBackgroundTransition = false;

            cutscene.draw(context);

            expect(cutscene.pause).toBe(true);
            expect(cutscene.textIndex).toBe(0);
        });

        it('plays bit1 via playEightBitSound when typing and menu is not paused', () => {
            cutscene.dialogue = [{
                character: 'Firedog',
                dialogue: 'Hello',
                images: [],
            }];
            cutscene.dialogueIndex = 0;
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

            expect(game.audioHandler.cutsceneDialogue.stopSound)
                .toHaveBeenCalledWith('bit1');
        });

        it('ellipsis followed by terminal punctuation triggers dot-pause behavior', () => {
            const dialogue = 'Why...? Next';

            cutscene.dialogue = [{
                character: 'Firedog',
                dialogue,
                images: [],
            }];
            cutscene.dialogueIndex = 0;
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

        it('partial ending with "..." and followed by non-terminal text triggers dot-pause behavior', () => {
            const dialogue = 'Wait... next';
            cutscene.dialogue = [{ character: 'Firedog', dialogue, images: [] }];
            cutscene.dialogueIndex = 0;
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

        it('rebuilds cached spans when dialogueIndex changes', () => {
            cutscene.dialogue = [
                { character: 'Firedog', dialogue: 'Hello Firedog', images: [] },
                { character: 'A', dialogue: 'Bye', images: [] },
            ];
            cutscene.dialogueIndex = 1;
            cutscene.currentSpansForIndex = 0;
            cutscene.textIndex = 1;

            cutscene.draw(context);

            expect(cutscene.currentSpansForIndex).toBe(1);
            expect(Array.isArray(cutscene.currentColorSpans)).toBe(true);
        });
    });
});
