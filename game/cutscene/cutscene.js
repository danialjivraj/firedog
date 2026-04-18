import { preShake, postShake } from '../animations/shake.js';
import { BASE_FRAME_MS } from '../config/constants.js';
import { fadeInAndOut } from '../animations/fading.js';
import {
    COSMETIC_LAYER_ORDER,
    getCutsceneSkinPrefixBySkinId,
    getCutsceneCosmeticOverlayId,
    getCosmeticChromaDegFromState,
    drawWithOptionalHue,
} from '../config/skinsAndCosmetics.js';
import { drawCoinIcon } from '../interface/hudIcons.js';

export class Cutscene {
    constructor(game) {
        this.game = game;

        // core state
        this.dialogue = [];
        this.backgroundImage = null;
        this.dialogueIndex = 0;
        this.textIndex = 0;
        this.textBoxBackgroundOpacity = 0.65;

        // typing advance timer
        this._textAdvanceAccum = 0;

        // sfx typing/pause
        this.lastSoundPlayed = false;
        this.lastSound2Played = false;
        this.playSound2OnDotPause = false;
        this.pause = false;
        this.continueDialogue = false;

        // UI / input
        this.dialogueText = '';
        this.isEnterPressed = false;
        this.isTabPressed = true;

        // effects
        this.isCharacterBlackAndWhite = false;
        this.isBackgroundBlackAndWhite = false;
        this.isCharacterSepia = false;
        this.isBackgroundSepia = false;

        // text rendering cache
        this.fullWords = [];
        this.fullWordsColor = [];
        this.currentColorSpans = [];
        this.currentSpansForIndex = -1;

        // timing / layout
        this.playerCoins = this.game.coins;
        this.textBoxWidth = 870;

        // coins
        this.coinIcon = '\uE001';
        this.creditCoinIcon = '\uE002';
        this.coinsLabel = 'Coins';
        this.creditCoinsLabel = 'Credit Coins';
        this.inlineCoinIcon = {
            radius: 9,
            leadingGap: 1,
            trailingGap: 4,
            baselineOffsetY: -8,
        };

        // characters
        this.firedog = 'Firedog';
        this.elyvorg = 'Elyvorg';
        this.galadon = 'Galadon';
        this.nysera = 'Nysera';
        this.duskmaw = 'Duskmaw';
        this.aurellia = 'Aurellia';
        this.craggle = 'Craggle';
        this.orialis = 'Orialis';
        this.orelian = 'Orelian';
        this.everyone = 'Everyone';
        this.threeDots = '... ';
        this.questionMark = '???';
        this.penguini = 'Penguini';
        this.valdorin = 'Valdorin';
        this.valdonotski = 'Valdonotski';
        this.zephyrion = 'Zephyrion';
        this.glacikal = 'Glacikal';
        this.ntharax = "N'Tharax";

        // maps
        this.lunarGlade = 'Lunar Glade';
        this.nightfallPhantomGraves = 'Nightfall Phantom Graves';
        this.coralAbyss = 'Coral Abyss';
        this.verdantVine = 'Verdant Vine';
        this.springlyLemony = 'Springly Lemony';
        this.venomveilLake = 'Venomveil Lake';
        this.infernalCraterPeak = 'Infernal Crater Peak';
        this.iceboundCave = 'Icebound Cave';
        this.crimsonFissure = 'Crimson Fissure';
        this.cosmicRift = 'Cosmic Rift';

        // phrases
        this.crypticToken = 'Cryptic Token';
        this.temporalTimber = 'Temporal Timber';
        this.projectCryptoterraGenesis = 'Project Cryptoterra Genesis';

        // text highlight colors
        this.characterColors = {
            // coins
            [this.game.winningCoins]: 'orange',
            [this.playerCoins]: 'orange',
            [this.coinsLabel]: 'orange',
            [this.creditCoinsLabel]: '#aeaeaf',

            // characters
            [this.firedog]: 'yellow',
            [this.galadon]: 'tomato',
            [this.valdorin]: 'RoyalBlue',
            [this.valdonotski]: 'RoyalBlue',
            [this.nysera]: 'Teal',
            [this.duskmaw]: 'DarkOliveGreen',
            [this.aurellia]: 'Plum',
            [this.craggle]: 'SaddleBrown',
            [this.orialis]: 'MediumPurple',
            [this.orelian]: 'MediumPurple',
            [this.penguini]: 'cyan',
            [this.zephyrion]: 'DodgerBlue',
            [this.elyvorg]: 'red',
            [this.everyone]: 'SkyBlue',
            [this.questionMark]: 'red',
            [this.glacikal]: 'cyan',
            [this.ntharax]: 'DeepPink',

            // story maps
            [this.lunarGlade]: '#57e2d0ff',
            [this.nightfallPhantomGraves]: '#a84ffcff',
            [this.coralAbyss]: 'dodgerblue',
            [this.verdantVine]: '#61c050ff',
            [this.springlyLemony]: 'yellow',
            [this.venomveilLake]: '#39ff14',
            [this.infernalCraterPeak]: '#ff2100ff',

            // bonus maps
            [this.iceboundCave]: '#8fd7ff',
            [this.crimsonFissure]: '#dc143c',
            [this.cosmicRift]: '#ff41ffff',

            // project phrases
            [this.crypticToken]: 'DarkViolet',
            [this.temporalTimber]: 'GoldenRod',
            [this.projectCryptoterraGenesis]: 'OrangeRed',
        };

        // reminder image
        this.reminderImage = document.getElementById('reminderToSkipWithTab');
        this.reminderImageStartTime = null;

        // firedog FX layers
        this.firedogFXMap = {
            firedogAngry: ['angryIcon'],
            firedogDiscomfort: ['sweatDrop'],
            firedogHeadache: ['sweatDrop'],
            firedogSigh: ['sighSweatDrop'],
            firedogPhew: ['phewAir'],
            firedogLaugh: ['yellowLines'],
            firedogSurprised: ['exclamationMark'],
            firedogCurious: ['questionMark'],
            firedogNormalQuestionAndExclamationMark: ['exclamationAndQuestionMark'],
        };

        this.borderFxShrinkIds = new Set(['exclamationMark', 'questionMark', 'exclamationAndQuestionMark']);
        this.borderFxShrinkScale = 0.70;

        this.borderAssetIds = {
            normal: 'blueBackground',
            darkBlue: 'darkBlueBackground',
            green: 'greenBackground',
            red: 'redBackground',
            yellow: 'yellowBackground',
        };

        // panel border styling
        this.panelBorderStrokeRatio = 0.038;
        this.panelBorderCornerRatio = 0.12;
        this.panelBorderShadowBlurRatio = 0.07;
        this.panelBorderShadowOffsetRatio = 0.028;
        this.panelBorderShadowAlpha = 0.28;
        this.panelBorderInnerInsetRatio = 0.012;

        this.panelBorderColors = Object.freeze({
            default: '#000000',
            talking: '#FFD000',
        });

        // firedog composite tuning
        this.borderInsetRatio = 0;
        this.borderCornerRadiusRatio = 0.14;
        this.borderInnerScale = 1.30;
        this.borderOffsetX = -35;
        this.borderOffsetY = -20;

        this._stoppedAtDialogueEnd = false;
    }

    // text colouring
    splitDialogueIntoWords(text) { return text.split(' '); }

    escapeRegExp(str) {
        return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    buildColorSpans(fullText) {
        const spans = [];

        const keys = Object.keys(this.characterColors)
            .filter(k => typeof k === 'string' && k.trim().length > 0)
            .sort((a, b) => b.length - a.length);

        for (const key of keys) {
            const color = this.characterColors[key];

            const rxExact = new RegExp(`\\b${this.escapeRegExp(key)}\\b`, 'gu');
            let m;
            while ((m = rxExact.exec(fullText)) !== null) {
                spans.push([m.index, m.index + m[0].length, color]);
            }

            if (/\p{L}$/u.test(key)) {
                const rxPossessive = new RegExp(`\\b${this.escapeRegExp(key)}['’]s\\b`, 'gu');
                while ((m = rxPossessive.exec(fullText)) !== null) {
                    spans.push([m.index, m.index + m[0].length, color]);
                }
            }
        }

        return spans;
    }

    colorAtGlobal(globalIndex, spans, fallback = 'white') {
        for (const [s, e, c] of spans) {
            if (globalIndex >= s && globalIndex < e) return c;
        }
        return fallback;
    }

    createDialogueTextTokens(text, startIndex, revealStart = startIndex) {
        return Array.from(String(text || '')).map((ch, offset) => ({
            type: 'char',
            text: ch,
            start: startIndex + offset,
            end: startIndex + offset + 1,
            revealStart: revealStart + offset,
        }));
    }

    createInjectedDialogueTextTokens(text, startIndex, revealStart) {
        return Array.from(String(text || '')).map((ch, offset) => ({
            type: 'char',
            text: ch,
            start: startIndex + offset,
            end: startIndex + offset + 1,
            revealStart,
        }));
    }

    tokenizeDialogueWord(word, wordStart) {
        return this.createDialogueTextTokens(word, wordStart);
    }

    buildDialogueRenderWords(fullDialogue, getTokenWidth) {
        const words = [];
        const rx = /\S+/g;
        const rawWords = [];
        let match;

        while ((match = rx.exec(fullDialogue)) !== null) {
            rawWords.push({
                text: match[0],
                start: match.index,
                end: match.index + match[0].length,
            });
        }

        for (let i = 0; i < rawWords.length; i++) {
            const word = rawWords[i];

            if (word.text.startsWith(this.coinIcon) || word.text.startsWith(this.creditCoinIcon)) {
                const palette = word.text.startsWith(this.creditCoinIcon) ? 'silver' : 'gold';
                const iconToken = {
                    type: 'coinIcon',
                    text: 'coin',
                    start: word.start,
                    end: word.start + 1,
                    revealStart: word.start,
                    palette,
                };
                const trailing = word.text.slice(1);
                const trailingTokens = trailing.length > 0
                    ? this.createDialogueTextTokens(trailing, word.start + 1, word.start + 1)
                    : [];
                const tokens = [iconToken, ...trailingTokens];
                const width = tokens.reduce((sum, t) => sum + getTokenWidth(t), 0);
                words.push({
                    text: word.text,
                    start: word.start,
                    end: word.end,
                    tokens,
                    width,
                });
                continue;
            }

            const tokens = this.tokenizeDialogueWord(word.text, word.start);
            const width = tokens.reduce((sum, token) => sum + getTokenWidth(token), 0);
            words.push({
                text: word.text,
                start: word.start,
                end: word.end,
                tokens,
                width,
            });
        }

        return words;
    }

    getDotIndices(dialogue) {
        const out = [];
        let i = dialogue.indexOf('...');
        while (i !== -1) {
            out.push(i);
            i = dialogue.indexOf('...', i + 3);
        }
        return out;
    }

    ellipsisFollowedOnlyByTerminalPunct(dialogue, startIdx) {
        const tail = dialogue.slice(startIdx + 3);
        if (tail.length === 0) return false;
        const TERMINAL_RX = /^[\)\]\}»"'’”!?]+$/u;
        return TERMINAL_RX.test(tail);
    }

    endsWithEllipsisPlusTerminal(partial) {
        return /\.\.\.[\)\]\}»"'’”!?]$/u.test(partial);
    }

    isTerminalChar(ch) {
        return /[\)\]\}»"'’”!?]/u.test(ch);
    }

    isDialogueEntryVisuallyEmpty(entry) {
        if (!entry) return false;
        return String(entry.character ?? '') === '' && String(entry.dialogue ?? '') === '';
    }

    isCurrentDialogueVisuallyEmpty() {
        return this.isDialogueEntryVisuallyEmpty(this.getCurrentDialogueEntry());
    }

    // filters
    getCharacterBaseFilter() {
        if (this.isCharacterSepia) return 'sepia(100%) saturate(140%) contrast(115%) brightness(80%)';
        if (this.isCharacterBlackAndWhite) return 'grayscale(100%)';
        return '';
    }

    getBackgroundBaseFilter() {
        if (this.isBackgroundSepia) return 'sepia(100%) saturate(140%) contrast(115%) brightness(50%)';
        if (this.isBackgroundBlackAndWhite) return 'grayscale(100%)';
        return '';
    }

    // input
    addEventListeners() {
        const gate = (fn) => (event) => {
            if (this.game.menu.pause.isPaused) return;

            const until = this.game.ignoreCutsceneInputUntil || 0;
            if (performance.now() < until) return;

            return fn && fn(event);
        };

        this._wrappedKeyDown = gate(this.handleKeyDown);
        this._wrappedKeyUp = gate(this.handleKeyUp);
        this._wrappedLeftClick = gate(this.handleLeftClick);
        this._wrappedLeftClickUp = gate(this.handleLeftClickUp);

        document.addEventListener('keydown', this._wrappedKeyDown);
        document.addEventListener('keyup', this._wrappedKeyUp);
        document.addEventListener('click', this._wrappedLeftClick);
        document.addEventListener('click', this._wrappedLeftClickUp);
    }

    removeEventListeners() {
        document.removeEventListener('keydown', this._wrappedKeyDown);
        document.removeEventListener('keyup', this._wrappedKeyUp);
        document.removeEventListener('click', this._wrappedLeftClick);
        document.removeEventListener('click', this._wrappedLeftClickUp);

        this._wrappedKeyDown = null;
        this._wrappedKeyUp = null;
        this._wrappedLeftClick = null;
        this._wrappedLeftClickUp = null;
    }

    transitionWithBg({
        fadeIn, blackDuration, fadeOut,
        imageId = null,
        onBlackDelayMs = null,
        beforeFade = null,
        onBlack = null,
    } = {}) {
        this.removeEventListeners();

        this.stopTypingAudio();

        if (beforeFade) beforeFade();

        this.cutsceneBackgroundChange(fadeIn, blackDuration, fadeOut);

        const delay = Number.isFinite(onBlackDelayMs) ? onBlackDelayMs : (fadeIn + 100);

        setTimeout(() => {
            this.addEventListeners();

            if (imageId) {
                this.backgroundImage = document.getElementById(imageId);
            }

            if (onBlack) onBlack();
        }, delay);
    }

    jumpToDialogue(index) {
        if (index < 0 || index >= this.dialogue.length) return;

        this.dialogueIndex = index;
        this.textIndex = 0;
        this.lastSound2Played = false;
        this.playSound2OnDotPause = false;
        this.pause = false;
        this.continueDialogue = false;
        this.isEnterPressed = false;

        const currentDialogue = this.dialogue[this.dialogueIndex];
        const words = this.splitDialogueIntoWords(currentDialogue.dialogue);
        this.fullWordsColor = words;
        this.currentColorSpans = this.buildColorSpans(currentDialogue.dialogue);
        this.currentSpansForIndex = this.dialogueIndex;

        this.runCurrentDialogueEnterActionIfAny();
    }

    // audio
    playSFX(...args) { this.game.audioHandler.cutsceneSFX.playSound(...args); }
    fadeOutSFX(...args) { this.game.audioHandler.cutsceneSFX.fadeOutAndStop(...args); }
    playMusic(...args) { this.game.audioHandler.cutsceneMusic.playSound(...args); }
    fadeOutMusic(...args) { this.game.audioHandler.cutsceneMusic.fadeOutAndStop(...args); }

    stopAllAudio() {
        this.game.audioHandler.cutsceneDialogue.stopAllSounds();
        this.game.audioHandler.cutsceneSFX.stopAllSounds();
        this.game.audioHandler.cutsceneMusic.stopAllSounds();
    }

    fadeOutAndStopAllAudio(duration = 500) {
        this.game.audioHandler.cutsceneDialogue.stopAllSounds();
        this.game.audioHandler.cutsceneSFX.fadeOutAndStopAllSounds(duration);
        this.game.audioHandler.cutsceneMusic.fadeOutAndStopAllSounds(duration);
    }

    stopTypingAudio() {
        this.game.audioHandler.cutsceneDialogue.stopAllSounds();
        this.lastSoundPlayed = false;
        this.lastSound2Played = false;
        this.playSound2OnDotPause = false;
        this.pause = false;
        this.continueDialogue = false;
    }

    // map helpers
    getCurrentMapId() {
        const id = this.game.currentMap
            || (this.game.background && this.game.background.constructor.name)
            || null;
        return id || null;
    }

    getSelectedMapIndex() {
        const id = this.getCurrentMapId();
        const m = /^Map([1-7])$/.exec(id || '');
        return m ? Number(m[1]) : null;
    }

    // dialogue hooks
    getCurrentDialogueEntry() {
        if (this.dialogueIndex < 0 || this.dialogueIndex >= this.dialogue.length) return null;
        return this.dialogue[this.dialogueIndex] || null;
    }

    isCurrentDialogueFullyTyped() {
        const d = this.getCurrentDialogueEntry();
        if (!d) return false;
        return this.textIndex === d.dialogue.length;
    }

    runCurrentDialogueAdvanceActionIfAny() {
        if (!this.isCurrentDialogueFullyTyped()) return;
        const d = this.getCurrentDialogueEntry();
        if (d && typeof d.onAdvance === 'function') d.onAdvance();
    }

    runCurrentDialogueEnterActionIfAny() {
        const d = this.getCurrentDialogueEntry();
        if (d && typeof d.onEnter === 'function') d.onEnter();
    }

    addDialogue(character, dialogue, ...maybeImages) {
        let options = null;
        let images = maybeImages;

        const first = maybeImages[0];
        const isOptions =
            first &&
            typeof first === 'object' &&
            !Array.isArray(first) &&
            !Object.prototype.hasOwnProperty.call(first, 'id') &&
            (
                Object.prototype.hasOwnProperty.call(first, 'whisper') ||
                Object.prototype.hasOwnProperty.call(first, 'onAdvance') ||
                Object.prototype.hasOwnProperty.call(first, 'onEnter')
            );

        if (isOptions) {
            options = first;
            images = maybeImages.slice(1);
        }

        this.dialogue.push({
            character,
            dialogue,
            images,
            whisper: !!options?.whisper,
            onAdvance: typeof options?.onAdvance === 'function' ? options.onAdvance : null,
            onEnter: typeof options?.onEnter === 'function' ? options.onEnter : null,
        });
    }

    addImage(id, rect, render = {}) {
        if (!rect) throw new Error(`addImage("${id}") requires a rect`);

        const { x, y, width, height } = rect;
        if ([x, y, width, height].some(v => typeof v !== 'number')) {
            throw new Error(`addImage("${id}") requires numeric x, y, width, height. Got: ${JSON.stringify(rect)}`);
        }

        const image = { id, x, y, width, height };

        if (render.opacity !== undefined) image.opacity = render.opacity;
        if (render.effectKey) image.effectKey = render.effectKey;

        const opts = {};
        if (render.border && typeof render.border === 'object') {
            opts.border = { ...render.border };
        }
        if (render.talking) {
            opts.border = { ...(opts.border || {}), talking: true };
        }
        if (Object.keys(opts).length) image.opts = opts;

        return image;
    }

    displayDialogue() {
        const currentDialogue = this.dialogue[this.dialogueIndex];
        const prefullWords = this.splitDialogueIntoWords(currentDialogue.dialogue);

        this.fullWords = prefullWords;
        this.fullWordsColor = prefullWords;
        this.dialogueIndex = -1;
        this.textIndex = 0;
        this.lastSound2Played = false;
        this.isEnterPressed = false;
        this._stoppedAtDialogueEnd = false;

        this.handleKeyUp = (event) => {
            if (event.key === 'Enter') this.isEnterPressed = false;
        };
        this.handleLeftClickUp = (event) => {
            if (event.button === 0) this.isEnterPressed = false;
        };

        this.dialogueIndex++;
        this.currentColorSpans = this.buildColorSpans(this.dialogue[this.dialogueIndex].dialogue);
        this.currentSpansForIndex = this.dialogueIndex;

        this.runCurrentDialogueEnterActionIfAny();

        this.addEventListeners();
        this.reminderImageStartTime = performance.now();
    }

    // wardrobe/cosmetics helpers
    getCurrentSkinIdSafe() {
        if (this.game.menu.wardrobe.getCurrentSkinId) return this.game.menu.wardrobe.getCurrentSkinId();
        return this.game.selectedSkinId || 'defaultSkin';
    }

    getCurrentCosmeticKeySafe(slot) {
        if (this.game.menu.wardrobe.getCurrentCosmeticKey) {
            return this.game.menu.wardrobe.getCurrentCosmeticKey(slot) || 'none';
        }
        const saved = this.game.selectedCosmetics || this.game.currentCosmetics || null;
        if (saved && slot && Object.prototype.hasOwnProperty.call(saved, slot)) {
            return saved[slot] || 'none';
        }
        return 'none';
    }

    getCurrentCosmeticsChromaStateSafe() {
        const w = this.game.menu.wardrobe;
        if (w && typeof w.getCurrentCosmeticsChromaState === 'function') {
            const st = w.getCurrentCosmeticsChromaState();
            return (st && typeof st === 'object') ? st : {};
        }
        return {};
    }

    getCurrentCosmeticChromaDegSafe(slot) {
        const key = this.getCurrentCosmeticKeySafe(slot) || 'none';
        if (key === 'none') return 0;

        const chromaState = this.getCurrentCosmeticsChromaStateSafe();
        return getCosmeticChromaDegFromState(slot, key, chromaState);
    }

    drawImageWithOptionalHue(ctx, el, x, y, w, h, hueDeg) {
        if (!el) return;

        const baseFilter = this.getCharacterBaseFilter();
        drawWithOptionalHue(ctx, { hueDeg, baseFilter }, () => {
            ctx.drawImage(el, x, y, w, h);
        });
    }

    // firedog DOM id mapping / overlays
    getSkinPrefix() {
        const skinId = this.getCurrentSkinIdSafe();
        return getCutsceneSkinPrefixBySkinId(skinId) || '';
    }

    setFiredogImage(imageName) {
        const prefix = this.getSkinPrefix();
        return `${prefix}firedog${imageName}`;
    }

    getFiredogCoreId(id) {
        const s = String(id || '');
        const i = s.indexOf('firedog');
        return i >= 0 ? s.slice(i) : s;
    }

    getFiredogAliasedCoreBaseId(coreBaseId) {
        switch (coreBaseId) {
            case 'firedogLaugh':
                return 'firedogHappy';
            case 'firedogNormalQuestionAndExclamationMark':
                return 'firedogNormal';
            default:
                return coreBaseId;
        }
    }

    getAliasedFiredogDomId(id) {
        const raw = String(id || '');
        const idx = raw.indexOf('firedog');
        if (idx < 0) return raw;

        const prefix = raw.slice(0, idx);
        const core = raw.slice(idx);
        const aliasedCore = this.getFiredogAliasedCoreBaseId(core);

        return `${prefix}${aliasedCore}`;
    }

    isFiredogEmotionImageId(id) {
        const core = this.getFiredogCoreId(id);
        const RX = /^firedog(?:Upset|Angry|Cry|Cry2|Happy|Headache|Laugh|Normal|Phew|Sad|Tired|Curious|Discomfort|Sigh|Smile|Surprised|NormalQuestionAndExclamationMark)(?:Border)?$/;
        return RX.test(core);
    }

    shouldOverlayCosmeticsForImageId(id) {
        return this.isFiredogEmotionImageId(id);
    }

    getFiredogCosmeticOverlaysInLayerOrder() {
        const out = [];
        for (const slot of COSMETIC_LAYER_ORDER) {
            const key = this.getCurrentCosmeticKeySafe(slot);
            const overlayId = getCutsceneCosmeticOverlayId(slot, key);
            if (overlayId) out.push({ slot, key, overlayId });
        }
        return out;
    }

    hasFiredogEffectLayersForKey(imageOrEffectKey) {
        const id = this.getFiredogCoreId(imageOrEffectKey);
        return Object.prototype.hasOwnProperty.call(this.firedogFXMap, id);
    }

    getFiredogEffectLayersForKey(imageOrEffectKey) {
        const id = this.getFiredogCoreId(imageOrEffectKey);
        return this.firedogFXMap[id] || [];
    }

    drawFiredogEffectLayers(context, imageOrEffectKey, baseRect, layerScaleFn = null) {
        const layers = this.getFiredogEffectLayersForKey(imageOrEffectKey);
        if (!layers || layers.length === 0) return;

        const { x, y, width, height, opacity } = baseRect;

        context.save();
        context.globalAlpha = opacity !== undefined ? opacity : 1;

        for (const layerId of layers) {
            const el = document.getElementById(layerId);
            if (!el) continue;

            const scale = (typeof layerScaleFn === 'function') ? (layerScaleFn(layerId) || 1) : 1;

            if (scale === 1) {
                context.drawImage(el, x, y, width, height);
                continue;
            }

            const dw = width * scale;
            const dh = height * scale;
            const dx = x + (width - dw) / 2;
            const dy = y + (height - dh) / 2;

            context.drawImage(el, dx, dy, dw, dh);
        }

        context.restore();
    }

    // border helpers
    isFiredogBorderRequestId(id) {
        const core = this.getFiredogCoreId(id);
        const RX = /^firedog(?:Upset|Angry|Cry|Cry2|Happy|Headache|Laugh|Normal|Phew|Sad|Tired|Curious|Discomfort|Sigh|Smile|Surprised|NormalQuestionAndExclamationMark)Border$/;
        return RX.test(core);
    }

    shouldDrawPanelBorderForImageId(id) {
        const s = String(id || '');
        if (this.isFiredogBorderRequestId(s)) return false;
        return /Border$/.test(s);
    }

    getBaseIdFromBorderRequestId(borderId) {
        return String(borderId || '').replace(/Border$/, '');
    }

    getBorderAssetIdForBaseFiredogId(baseId) {
        const core = this.getFiredogCoreId(baseId);

        if (/^firedog(?:Angry|Upset)$/.test(core)) return this.borderAssetIds.red;
        if (/^firedogHappy$/.test(core)) return this.borderAssetIds.green;
        if (/^firedog(?:Headache|Cry|Cry2|Sad|Phew)$/.test(core)) return this.borderAssetIds.darkBlue;
        if (/^firedogLaugh$/.test(core)) return this.borderAssetIds.yellow;

        return this.borderAssetIds.normal;
    }

    roundRectPath(ctx, x, y, w, h, r) {
        const rr = Math.max(0, Math.min(r, w / 2, h / 2));
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr);
        ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
    }

    getPanelBorderStrokeColorFromOpts(opts) {
        const border = opts?.border || null;
        if (border?.color) return border.color;
        return border?.talking ? this.panelBorderColors.talking : this.panelBorderColors.default;
    }

    drawRoundedPanelBorder(ctx, x, y, w, h, opts = {}) {
        const s = Math.min(w, h);

        let lineW = Math.max(2, Math.floor(s * this.panelBorderStrokeRatio));
        lineW = Math.min(lineW, 8);

        const rBase = Math.max(2, Math.floor(s * this.panelBorderCornerRatio));
        const shadowBlur = Math.max(2, Math.floor(s * this.panelBorderShadowBlurRatio));
        const shadowOff = Math.max(1, Math.floor(s * this.panelBorderShadowOffsetRatio));

        const inset = Math.max(1, Math.floor(s * (this.panelBorderInnerInsetRatio || 0) + lineW * 0.25));
        const r = Math.max(2, rBase - inset);

        ctx.save();

        ctx.lineWidth = lineW;
        ctx.strokeStyle = this.getPanelBorderStrokeColorFromOpts(opts);

        ctx.shadowColor = `rgba(0,0,0,${this.panelBorderShadowAlpha})`;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOff;
        ctx.shadowOffsetY = shadowOff;

        const half = lineW / 2;
        this.roundRectPath(
            ctx,
            x + inset + half,
            y + inset + half,
            w - (inset * 2) - lineW,
            h - (inset * 2) - lineW,
            r
        );

        ctx.stroke();
        ctx.restore();
    }

    drawFiredogBorderComposite(context, borderRequestId, rect, opacity, effectKeyOverride = null, opts = {}) {
        const { x, y, width, height } = rect;

        const baseId = this.getBaseIdFromBorderRequestId(borderRequestId);
        const borderAssetId = this.getBorderAssetIdForBaseFiredogId(baseId);

        const borderEl = document.getElementById(borderAssetId);
        const baseDomId = this.getAliasedFiredogDomId(baseId);
        const baseEl = document.getElementById(baseDomId);

        if (!baseEl) return;

        const alpha = (opacity !== undefined) ? opacity : 1;

        context.save();

        const f = this.getCharacterBaseFilter();
        if (f) context.filter = f;
        context.globalAlpha = alpha;

        if (borderEl) context.drawImage(borderEl, x, y, width, height);

        this.drawRoundedPanelBorder(context, x, y, width, height, opts);

        const clipInset = Math.floor(Math.min(width, height) * 0.05);
        const r = Math.max(2, Math.floor(Math.min(width, height) * this.borderCornerRadiusRatio));

        this.roundRectPath(
            context,
            x + clipInset,
            y + clipInset,
            width - clipInset * 2,
            height - clipInset * 2,
            Math.max(2, r - clipInset * 0.6)
        );
        context.clip();

        const inset2 = Math.floor(Math.min(width, height) * this.borderInsetRatio);
        const innerX = x + inset2;
        const innerY = y + inset2;
        const innerW = width - inset2 * 2;
        const innerH = height - inset2 * 2;

        const iw = baseEl.naturalWidth || baseEl.width || 1;
        const ih = baseEl.naturalHeight || baseEl.height || 1;

        const contain = Math.min(innerW / iw, innerH / ih) * this.borderInnerScale;
        const drawW = iw * contain;
        const drawH = ih * contain;

        const dx = innerX + (innerW - drawW) / 2 + (this.borderOffsetX || 0);
        const dy = innerY + (innerH - drawH) / 2 + (this.borderOffsetY || 0);

        context.drawImage(baseEl, dx, dy, drawW, drawH);

        if (this.shouldOverlayCosmeticsForImageId(baseId)) {
            const overlays = this.getFiredogCosmeticOverlaysInLayerOrder();
            for (const o of overlays) {
                const overlayEl = o.overlayId ? document.getElementById(o.overlayId) : null;
                if (!overlayEl) continue;

                const hueDeg = this.getCurrentCosmeticChromaDegSafe(o.slot);
                this.drawImageWithOptionalHue(context, overlayEl, dx, dy, drawW, drawH, hueDeg);
            }
        }

        const key = effectKeyOverride || baseId;
        if (this.hasFiredogEffectLayersForKey(key)) {
            const scaleFn = (layerId) => (this.borderFxShrinkIds.has(layerId) ? this.borderFxShrinkScale : 1);
            this.drawFiredogEffectLayers(
                context,
                key,
                { x: dx, y: dy, width: drawW, height: drawH, opacity: alpha },
                scaleFn
            );
        }

        context.filter = 'none';
        context.globalAlpha = 1;
        context.restore();
    }

    // draw helpers
    drawBackground(context) {
        if (!this.backgroundImage) return;

        const f = this.getBackgroundBaseFilter();
        if (f) context.filter = f;

        const canShake = this.game.shakeActive && !this.game.menu.pause.isPaused;

        if (canShake) preShake(context);
        context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.gameHeight || this.game.height);
        if (canShake) postShake(context);

        context.filter = 'none';
    }

    drawTextBoxPanel(ctx, x, y, w, h) {
        const radius = 16;

        ctx.save();

        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = `rgba(0,0,0,${this.textBoxBackgroundOpacity})`;
        this.roundRectPath(ctx, x, y, w, h, radius);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.stroke();

        ctx.restore();
    }

    drawTextBox(context) {
        if (this.isCurrentDialogueVisuallyEmpty()) return;

        const x = 15;
        const y = this.game.height - 65;
        const w = this.textBoxWidth;
        const h = 96;

        this.drawTextBoxPanel(context, x, y, w, h);
    }

    drawReminder(context) {
        const currentTime = performance.now();
        const show =
            this.reminderImageStartTime !== null &&
            (currentTime - this.reminderImageStartTime) < 7000 &&
            (this.game.cutsceneActive && !this.game.talkToPenguin && !this.game.boss.talkToBoss);

        if (show) {
            context.drawImage(this.reminderImage, this.game.width - 500, this.game.height - 100);
        }
    }

    getGlowColorForImage(_img) {
        return null;
    }

    drawSingleImage(context, img) {
        const { id, opacity, x, y, width, height, effectKey, opts } = img;

        if (this.isFiredogBorderRequestId(id)) {
            this.drawFiredogBorderComposite(
                context,
                id,
                { x, y, width, height },
                opacity,
                effectKey || null,
                opts || {}
            );
            return;
        }

        context.save();

        const f = this.getCharacterBaseFilter();
        if (f) context.filter = f;
        context.globalAlpha = opacity !== undefined ? opacity : 1;

        const glowColor = this.getGlowColorForImage(img);
        if (glowColor) {
            context.shadowColor = 'rgba(255, 208, 0, 0.5)';
            context.shadowBlur = 30;
        }

        const baseDomId = this.isFiredogEmotionImageId(id) ? this.getAliasedFiredogDomId(id) : id;
        const baseEl = document.getElementById(baseDomId);
        if (baseEl) context.drawImage(baseEl, x, y, width, height);

        if (glowColor) {
            context.shadowColor = 'transparent';
            context.shadowBlur = 0;
        }

        if (this.shouldDrawPanelBorderForImageId(id)) {
            this.drawRoundedPanelBorder(context, x, y, width, height, opts || {});
        }

        if (this.shouldOverlayCosmeticsForImageId(id)) {
            const overlays = this.getFiredogCosmeticOverlaysInLayerOrder();
            for (const o of overlays) {
                const overlayEl = o.overlayId ? document.getElementById(o.overlayId) : null;
                if (!overlayEl) continue;

                const hueDeg = this.getCurrentCosmeticChromaDegSafe(o.slot);
                this.drawImageWithOptionalHue(context, overlayEl, x, y, width, height, hueDeg);
            }
        }

        const key = effectKey || id;
        if (this.hasFiredogEffectLayersForKey(key)) {
            this.drawFiredogEffectLayers(context, key, { x, y, width, height, opacity });
        }

        context.restore();
    }

    drawImages(context, images) {
        if (!images || !Array.isArray(images)) return;
        for (const img of images) this.drawSingleImage(context, img);
    }

    drawDialogueTextWrapped(context, characterName, fullDialogue, partialText, spans) {
        const lineHeight = 25;
        const y0 = this.game.height - 33;

        const boxX = 15;
        const boxW = this.textBoxWidth;

        const baseX = 50;
        const rightPad = 30;

        const charNameW = context.measureText(characterName).width;

        const textStartX = baseX + charNameW;

        const maxW = Math.max(10, (boxX + boxW - rightPad) - textStartX);
        const maxLines = 2;

        const punctuationChars = ',!?.:;()"';
        const dlgObj = this.dialogue[this.dialogueIndex];
        const specificPhrases = ['It seems you have', 'I will need'];
        const allowNumericColor = specificPhrases.some(p => String(dlgObj?.dialogue || '').includes(p));

        const numericRanges = [];
        if (!allowNumericColor) {
            const rxNum = /\b\d+(?:\.\d+)?\b/g;
            let m;
            while ((m = rxNum.exec(fullDialogue)) !== null) {
                numericRanges.push([m.index, m.index + m[0].length]);
            }
        }

        const isIndexInNumeric = (idx) => {
            for (const [s, e] of numericRanges) {
                if (idx >= s && idx < e) return true;
            }
            return false;
        };

        const coinIcon = this.inlineCoinIcon;
        const coinIconWidth = coinIcon.leadingGap + (coinIcon.radius * 2) + coinIcon.trailingGap;
        const visibleCharCount = Math.max(0, Math.min(String(partialText || '').length, fullDialogue.length));

        const getTokenWidth = (token) => {
            if (token.type === 'coinIcon') return coinIconWidth;
            return context.measureText(token.text).width;
        };

        const drawChar = (ch, globalIndex, x, y) => {
            let color = this.colorAtGlobal(globalIndex, spans, 'white');

            if (!allowNumericColor && isIndexInNumeric(globalIndex)) color = 'white';
            if (punctuationChars.includes(ch)) color = 'white';

            context.fillStyle = color;
            context.fillText(ch, x, y);
            return context.measureText(ch).width;
        };

        const drawToken = (token, x, y) => {
            const revealStart = Number.isFinite(token.revealStart) ? token.revealStart : token.start;
            if (revealStart >= visibleCharCount) return getTokenWidth(token);

            if (token.type === 'coinIcon') {
                drawCoinIcon(
                    context,
                    x + coinIcon.leadingGap + coinIcon.radius,
                    y + coinIcon.baselineOffsetY,
                    coinIcon.radius,
                    { palette: token.palette || 'gold' }
                );
                return coinIconWidth;
            }

            return drawChar(token.text, token.start, x, y);
        };

        const words = this.buildDialogueRenderWords(fullDialogue, getTokenWidth);

        const spaceW = context.measureText(' ').width;

        let line = 0;
        let x = textStartX;
        let y = y0;

        const usedW = () => x - textStartX;
        const remainingW = () => maxW - usedW();

        const gotoNextLine = () => {
            line += 1;
            if (line >= maxLines) return false;
            x = textStartX;
            y = y0 + (line * lineHeight);
            return true;
        };

        for (let wi = 0; wi < words.length; wi++) {
            const word = words[wi];
            const fullWordW = word.width;

            const hasAnyOnLine = usedW() > 0;
            const neededW = (hasAnyOnLine ? spaceW : 0) + fullWordW;

            if (neededW > remainingW() && fullWordW <= maxW) {
                if (hasAnyOnLine) {
                    if (!gotoNextLine()) return;
                }
            }

            const hasAnyNow = usedW() > 0;
            const neededNow = (hasAnyNow ? spaceW : 0) + fullWordW;

            if (neededNow <= remainingW()) {
                if (hasAnyNow) x += spaceW;

                for (const token of word.tokens) {
                    x += drawToken(token, x, y);
                }
                continue;
            }

            if (hasAnyNow) {
                if (!gotoNextLine()) return;
            }

            for (const token of word.tokens) {
                const tokenW = getTokenWidth(token);

                if (tokenW > remainingW()) {
                    if (!gotoNextLine()) return;
                }

                x += drawToken(token, x, y);
            }
        }
    }

    // draw
    draw(context) {
        this.drawBackground(context);

        if (this.dialogueIndex >= this.dialogue.length) {
            if (!this._stoppedAtDialogueEnd) {
                this.stopTypingAudio();
                this._stoppedAtDialogueEnd = true;
            }
            return;
        }

        const currentDialogue = this.dialogue[this.dialogueIndex];
        const { character, dialogue, images } = currentDialogue;
        const isVisuallyEmptyDialogue = this.isDialogueEntryVisuallyEmpty(currentDialogue);

        if (this.currentSpansForIndex !== this.dialogueIndex) {
            this.currentColorSpans = this.buildColorSpans(dialogue);
            this.currentSpansForIndex = this.dialogueIndex;
        }

        const partialText = dialogue.substring(0, this.textIndex + 1);
        this.dialogueText = partialText;

        context.save();

        if (this.game.enterDuringBackgroundTransition) {
            this.drawImages(context, images);
            this.drawTextBox(context);
        }

        this.drawReminder(context);

        // character name
        const characterColor = this.characterColors[character] || 'white';
        context.fillStyle = characterColor;
        context.font = '23px Arial';
        context.textAlign = 'left';
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'black';
        context.shadowBlur = 0;

        const characterName = `${character}: `;
        let xPosition = 50;

        if (this.game.enterDuringBackgroundTransition) {
            for (let i = 0; i < characterName.length; i++) {
                const ch = characterName[i];
                context.fillStyle = (ch === ':') ? 'white' : characterColor;
                context.fillText(ch, xPosition, this.game.height - 33);
                xPosition += context.measureText(ch).width;
            }
        }

        // typing / ellipsis pause logic
        if (this.textIndex < dialogue.length) {
            if (!this.game.enterDuringBackgroundTransition) {
                this.textIndex -= 2;
                if (this.textIndex < 0) this.textIndex = -2;
                this.pause = true;
            } else {
                this.pause = false;
            }

            if (!this.lastSoundPlayed && partialText !== dialogue && this.game.menu.pause.isPaused === false) {
                if (this.endsWithEllipsisPlusTerminal(partialText)) {
                    if (!this.playSound2OnDotPause) {
                        this.playEightBitSound('bit2');
                        this.playSound2OnDotPause = true;
                    }
                    this.textIndex--;
                    this._textAdvanceAccum = BASE_FRAME_MS;
                    this.pause = true;
                    this.continueDialogue = true;
                    this.isEnterPressed = false;
                } else if (partialText.endsWith('...')) {
                    const nextChar = dialogue[this.textIndex + 1];
                    if (!(nextChar && this.isTerminalChar(nextChar))) {
                        const ellipsisStart = this.textIndex - 2;
                        if (!this.ellipsisFollowedOnlyByTerminalPunct(dialogue, ellipsisStart)) {
                            if (!this.playSound2OnDotPause) {
                                this.playEightBitSound('bit2');
                                this.playSound2OnDotPause = true;
                            }
                            this.textIndex--;
                            this._textAdvanceAccum = BASE_FRAME_MS;
                            this.pause = true;
                            this.continueDialogue = true;
                            this.isEnterPressed = false;
                        }
                    }
                }
            }
        }

        if (this.game.enterDuringBackgroundTransition && !isVisuallyEmptyDialogue) {
            this.drawDialogueTextWrapped(
                context,
                characterName,
                dialogue,
                partialText,
                this.currentColorSpans
            );
        }

        // sound + advance typing
        if (this.textIndex < dialogue.length) {
            if (!this.game.menu.pause.isPaused) {
                this.playEightBitSound('bit1');
                this._textAdvanceAccum += (this.game.deltaTime ?? BASE_FRAME_MS);
                if (this._textAdvanceAccum >= BASE_FRAME_MS) {
                    this._textAdvanceAccum -= BASE_FRAME_MS;
                    this.textIndex++;
                }
            } else {
                this.game.audioHandler.cutsceneDialogue.stopSound('bit1');
            }
        } else {
            if (!this.lastSoundPlayed) {
                this.game.audioHandler.cutsceneDialogue.stopSound('bit1');
                if (!this.lastSound2Played && !isVisuallyEmptyDialogue) {
                    this.playEightBitSound('bit2');
                    this.lastSound2Played = true;
                }
            }
        }

        context.restore();
    }

    playEightBitSound(soundName) {
        const current = this.dialogue[this.dialogueIndex];
        if (current && current.whisper) return;

        if (!this.pause) {
            this.game.audioHandler.cutsceneDialogue.playSound(soundName);
        } else {
            this.game.audioHandler.cutsceneDialogue.pauseSound(soundName);
        }
    }

    cutsceneBackgroundChange(fadein, stay, fadeout) {
        this.game.enterDuringBackgroundTransition = false;
        fadeInAndOut(this.game.canvas, fadein, stay, fadeout, () => {
            this.game.enterDuringBackgroundTransition = true;
        });
    }

    // image setters
    setfiredogUpset() { return this.setFiredogImage('Upset'); }
    setfiredogAngry() { return this.setFiredogImage('Angry'); }
    setfiredogCry() { return this.setFiredogImage('Cry'); }
    setfiredogCry2() { return this.setFiredogImage('Cry2'); }
    setfiredogHappy() { return this.setFiredogImage('Happy'); }
    setfiredogHeadache() { return this.setFiredogImage('Headache'); }
    setfiredogLaugh() { return this.setFiredogImage('Laugh'); }
    setfiredogNormal() { return this.setFiredogImage('Normal'); }
    setfiredogPhew() { return this.setFiredogImage('Phew'); }
    setfiredogSad() { return this.setFiredogImage('Sad'); }
    setfiredogTired() { return this.setFiredogImage('Tired'); }
    setfiredogCurious() { return this.setFiredogImage('Curious'); }
    setfiredogSurprised() { return this.setFiredogImage('Surprised'); }
    setfiredogDiscomfort() { return this.setFiredogImage('Discomfort'); }
    setfiredogSigh() { return this.setFiredogImage('Sigh'); }
    setfiredogSmile() { return this.setFiredogImage('Smile'); }
    setfiredogNormalQuestionAndExclamationMark() { return this.setFiredogImage('NormalQuestionAndExclamationMark'); }

    // border
    setfiredogUpsetBorder() { return this.setFiredogImage('UpsetBorder'); }
    setfiredogAngryBorder() { return this.setFiredogImage('AngryBorder'); }
    setfiredogCryBorder() { return this.setFiredogImage('CryBorder'); }
    setfiredogCry2Border() { return this.setFiredogImage('Cry2Border'); }
    setfiredogHappyBorder() { return this.setFiredogImage('HappyBorder'); }
    setfiredogHeadacheBorder() { return this.setFiredogImage('HeadacheBorder'); }
    setfiredogLaughBorder() { return this.setFiredogImage('LaughBorder'); }
    setfiredogNormalBorder() { return this.setFiredogImage('NormalBorder'); }
    setfiredogPhewBorder() { return this.setFiredogImage('PhewBorder'); }
    setfiredogSadBorder() { return this.setFiredogImage('SadBorder'); }
    setfiredogTiredBorder() { return this.setFiredogImage('TiredBorder'); }
    setfiredogCuriousBorder() { return this.setFiredogImage('CuriousBorder'); }
    setfiredogNormalQuestionAndExclamationMarkBorder() { return this.setFiredogImage('NormalQuestionAndExclamationMarkBorder'); }
    setfiredogSurprisedBorder() { return this.setFiredogImage('SurprisedBorder'); }
    setfiredogDiscomfortBorder() { return this.setFiredogImage('DiscomfortBorder'); }
    setfiredogSighBorder() { return this.setFiredogImage('SighBorder'); }
    setfiredogSmileBorder() { return this.setFiredogImage('SmileBorder'); }
}
