import { preShake, postShake } from '../animations/shake.js';
import { fadeInAndOut } from '../animations/fading.js';

export class Cutscene {
    constructor(game) {
        this.game = game;
        this.dialogue = [];
        this.characterLimit = 65;
        this.backgroundImage = null;
        this.dialogueIndex = 0;
        this.textIndex = 0;
        this.lastSoundPlayed = false;
        this.lastSound2Played = false;
        this.playSound2OnDotPause = false;
        this.dontShowTextBoxAndSound = false;
        this.dialogueText = '';
        this.isEnterPressed = false;
        this.isTabPressed = true;
        this.pause = false;
        this.continueDialogue = false;
        this.isCharacterBlackAndWhite = false;
        this.isBackgroundBlackAndWhite = false;
        this.fullWords = [];
        this.fullWordsColor = [];
        this.halfASecond = 500;
        this.playerCoins = this.game.coins;
        this.textBoxWidth = 870;
        // coins
        this.coinText = "coin";
        this.coinsText = "coins";
        // characters
        this.firedog = "Firedog";
        this.elyvorg = "Elyvorg";
        this.galadon = "Galadon";
        this.quilzorin = "Quilzorin";
        this.duskmaw = "Duskmaw";
        this.everyone = "Everyone";
        this.threeDots = "... ";
        this.questionMark = "???";
        this.penguini = "Penguini";
        this.valdorin = "Valdorin";
        this.valdonotski = "Valdonotski";
        this.zephyrion = "Zephyrion";
        this.glacikal = "Glacikal";
        this.ntharax = "N'Tharax";
        // maps
        this.lunarMoonlitGlade = "Lunar Moonlit Glade";
        this.nightfallCityPhantom = "Nightfall City Phantom";
        this.coralAbyss = "Coral Abyss";
        this.verdantVine = "Verdant Vine";
        this.springlyLemony = "Springly Lemony";
        this.infernalCraterPeak = "Infernal Crater Peak";
        // phrases
        this.crypticToken = "Cryptic Token";
        this.temporalTimber = "Temporal Timber";
        this.projectCryptoterraGenesis = "Project Cryptoterra Genesis";
        this.characterColors = {
            // coins
            [this.game.winningCoins]: 'orange',
            [this.playerCoins]: 'orange',
            [this.coinText]: 'orange',
            [this.coinsText]: 'orange',
            // characters
            [this.firedog]: 'yellow',
            [this.galadon]: 'tomato',
            [this.valdorin]: 'RoyalBlue',
            [this.valdonotski]: 'RoyalBlue',
            [this.quilzorin]: 'Teal',
            [this.duskmaw]: 'DarkOliveGreen',
            [this.penguini]: 'cyan',
            [this.zephyrion]: 'DodgerBlue',
            [this.elyvorg]: 'red',
            [this.everyone]: 'SkyBlue',
            [this.questionMark]: 'red',
            [this.glacikal]: 'cyan',
            [this.ntharax]: 'DeepPink',
            // map phrases
            [this.lunarMoonlitGlade]: 'green',
            [this.nightfallCityPhantom]: 'green',
            [this.coralAbyss]: 'green',
            [this.verdantVine]: 'green',
            [this.springlyLemony]: 'green',
            [this.infernalCraterPeak]: 'Crimson',
            // project phrases
            [this.crypticToken]: 'DarkViolet',
            [this.temporalTimber]: 'GoldenRod',
            [this.projectCryptoterraGenesis]: 'OrangeRed',
        };

        this.currentColorSpans = [];
        this.currentSpansForIndex = -1;

        this.reminderImage = document.getElementById("reminderToSkipWithTab");
        this.reminderImageStartTime = null;
    }

    splitDialogueIntoWords(text) { return text.split(" "); }
    escapeRegExp(str) { return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    buildColorSpans(fullText) {
        const spans = [];
        const keys = Object.keys(this.characterColors)
            .filter(k => typeof k === 'string' && k.trim().length > 0)
            .sort((a, b) => b.length - a.length);

        for (const key of keys) {
            const color = this.characterColors[key];
            const rx = new RegExp(`\\b${this.escapeRegExp(key)}\\b`, 'g');
            let m;
            while ((m = rx.exec(fullText)) !== null) {
                spans.push([m.index, m.index + m[0].length, color]);
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

    isCharacterName(word) {
        return Object.prototype.hasOwnProperty.call(this.characterColors, word);
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

    addEventListeners() {
        const gate = (fn) => {
            return (event) => {
                if (this.game.menu.pause.isPaused) return;

                const until = this.game.ignoreCutsceneInputUntil || 0;
                if (performance.now() < until) return;
                return fn && fn(event);
            };
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

    transitionWithBg(d1, d2, d3, bgId, afterDelay = this.halfASecond + 100, before = null, after = null) {
        this.removeEventListeners();
        if (typeof before === 'function') before();
        this.cutsceneBackgroundChange(d1, d2, d3);
        setTimeout(() => {
            this.addEventListeners();
            if (bgId) this.backgroundImage = document.getElementById(bgId);
            if (typeof after === 'function') after();
        }, afterDelay);
    }

    playSFX(...args) {
        this.game.audioHandler.cutsceneSFX.playSound(...args);
    }

    playMusic(...args) {
        this.game.audioHandler.cutsceneMusic.playSound(...args);
    }

    fadeOutMusic(...args) {
        this.game.audioHandler.cutsceneMusic.fadeOutAndStop(...args);
    }

    stopAllAudio() {
        this.game.audioHandler.cutsceneDialogue.stopAllSounds();
        this.game.audioHandler.cutsceneSFX.stopAllSounds();
        this.game.audioHandler.cutsceneMusic.stopAllSounds();
    }

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

    cutsceneController() {
        if (this.textIndex !== this.dialogue[this.dialogueIndex].dialogue.length) return;
        const resolver = typeof this.resolveCutsceneAction === 'function' ? this.resolveCutsceneAction() : undefined;
        if (typeof resolver === 'function') resolver();
    }

    addDialogue(character, dialogue, ...maybeImages) {
        let options = {};
        let images = maybeImages;

        if (
            maybeImages.length > 0 &&
            typeof maybeImages[0] === 'object' &&
            !maybeImages[0].hasOwnProperty('id') &&
            (maybeImages[0].hasOwnProperty('whisper') || maybeImages[0].hasOwnProperty('options'))
        ) {
            options = maybeImages[0];
            images = maybeImages.slice(1);
        }

        const entry = {
            character,
            dialogue,
            images,
            whisper: !!options.whisper
        };
        this.dialogue.push(entry);
    }

    addImage(id, opacity, x, y, width, height) {
        return { id, opacity, x, y, width, height };
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

        this.handleKeyUp = (event) => {
            if (event.key === 'Enter') this.isEnterPressed = false;
        };
        this.handleLeftClickUp = (event) => {
            if (event.button === 0) this.isEnterPressed = false;
        };

        this.dialogueIndex++;
        this.currentColorSpans = this.buildColorSpans(this.dialogue[this.dialogueIndex].dialogue);
        this.currentSpansForIndex = this.dialogueIndex;

        this.addEventListeners();
        this.reminderImageStartTime = performance.now();
    }

    draw(context) {
        if (this.backgroundImage) {
            if (this.isBackgroundBlackAndWhite) context.filter = 'grayscale(100%)';

            const canShake =
            this.game.shakeActive &&
            !this.game.menu.pause.isPaused;

            if (canShake) preShake(context);
            context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
            if (canShake) postShake(context);

            context.filter = 'none';
        }

        if (this.dialogueIndex >= this.dialogue.length) return;

        const currentDialogue = this.dialogue[this.dialogueIndex];
        const { character, dialogue, images } = currentDialogue;

        if (this.currentSpansForIndex !== this.dialogueIndex) {
            this.currentColorSpans = this.buildColorSpans(dialogue);
            this.currentSpansForIndex = this.dialogueIndex;
        }

        const partialText = dialogue.substring(0, this.textIndex + 1);
        this.dialogueText = partialText;
        const words = this.splitDialogueIntoWords(partialText);

        const lines = this.getLinesWithinLimit(words, this.dialogueText, this.characterLimit);

        context.save();

        if (this.game.enterDuringBackgroundTransition) {
            if (images && Array.isArray(images)) {
                images.forEach(({ id, opacity, x, y, width, height }) => {
                    if (this.isCharacterBlackAndWhite) context.filter = 'grayscale(100%)';
                    context.globalAlpha = opacity !== undefined ? opacity : 1;
                    context.drawImage(document.getElementById(id), x, y, width, height);
                    context.filter = 'none';
                    context.globalAlpha = 1;
                });
            }
            if (this.dontShowTextBoxAndSound === false) {
                context.drawImage(
                    document.getElementById('textBox'),
                    15,
                    this.game.height - 70,
                    this.textBoxWidth,
                    96
                );
            }
        }

        const currentTime = performance.now();
        if (
            this.reminderImageStartTime !== null &&
            (currentTime - this.reminderImageStartTime) < 7000 &&
            (this.game.cutsceneActive && !this.game.talkToPenguin && !this.game.boss.talkToBoss)
        ) {
            context.drawImage(this.reminderImage, this.game.width - 500, this.game.height - 100);
        }

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

        if (this.textIndex < dialogue.length) {
            if (!this.game.enterDuringBackgroundTransition) {
                this.textIndex -= 2;
                if (this.textIndex < 0) this.textIndex = -2;
                this.pause = true;
            } else {
                this.pause = false;
            }

            if (
                !this.lastSoundPlayed &&
                partialText !== dialogue &&
                this.game.menu.pause.isPaused === false
            ) {
                if (this.endsWithEllipsisPlusTerminal(partialText)) {
                    if (!this.playSound2OnDotPause) {
                        this.playEightBitSound('bit2');
                        this.playSound2OnDotPause = true;
                    }
                    this.textIndex--;
                    this.pause = true;
                    this.continueDialogue = true;
                    this.isEnterPressed = false;
                }
                else if (partialText.endsWith('...')) {
                    const nextChar = dialogue[this.textIndex + 1];
                    if (nextChar && this.isTerminalChar(nextChar)) {
                        // let terminal char arrive before pausing
                    } else {
                        const ellipsisStart = this.textIndex - 2;
                        if (!this.ellipsisFollowedOnlyByTerminalPunct(dialogue, ellipsisStart)) {
                            if (!this.playSound2OnDotPause) {
                                this.playEightBitSound('bit2');
                                this.playSound2OnDotPause = true;
                            }
                            this.textIndex--;
                            this.pause = true;
                            this.continueDialogue = true;
                            this.isEnterPressed = false;
                        }
                    }
                }
            }
        }

        this.characterColorLogic(
            context,
            lines,
            words,
            characterName,
            dialogue,
            this.currentColorSpans
        );

        if (this.textIndex < dialogue.length) {
            if (!this.game.menu.pause.isPaused) {
                this.playEightBitSound('bit1', 'bit1');
                this.textIndex++;
            } else {
                this.game.audioHandler.cutsceneDialogue.playSound('bit1', false, true, true);
            }
        } else {
            if (!this.lastSoundPlayed) {
                this.game.audioHandler.cutsceneDialogue.playSound('bit1', false, true, true);
                if (!this.lastSound2Played && this.dontShowTextBoxAndSound === false) {
                    this.playEightBitSound('bit2');
                    this.lastSound2Played = true;
                }
            }
        }

        context.restore();
    }

    characterColorLogic(context, lines, words, characterName, fullDialogue, spans) {
        const punctuationChars = ',!?.:;()"';
        const dlgObj = this.dialogue[this.dialogueIndex];
        const specificPhrases = ["It seems you have", "I will need"];

        let searchCursor = 0;
        const wordStartsGlobal = words.map(w => {
            const idx = fullDialogue.indexOf(w, searchCursor);
            if (idx >= 0) {
                searchCursor = idx + w.length + 1;
                return idx;
            }
            searchCursor += (w.length + 1);
            return Math.max(0, searchCursor - (w.length + 1));
        });

        let consumedWords = 0;
        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
            const line = lines[lineIdx];
            const lineWords = this.splitDialogueIntoWords(line);
            let x = 50 + context.measureText(characterName).width;

            for (let lw = 0; lw < lineWords.length; lw++) {
                const word = lineWords[lw];

                const posInRemaining = words.slice(consumedWords).indexOf(word);
                const wordsIdx = posInRemaining === -1 ? -1 : (consumedWords + posInRemaining);
                if (wordsIdx === -1) continue;

                const globalStart = wordStartsGlobal[wordsIdx];
                consumedWords = wordsIdx + 1;

                for (let i = 0; i < word.length; i++) {
                    const ch = word[i];

                    // default color for this letter is determined by the full-dialogue spans
                    let color = this.colorAtGlobal(globalStart + i, spans, 'white');

                    // numeric words are white unless in specific phrases
                    if (!isNaN(word) && !specificPhrases.some(p => dlgObj.dialogue.includes(p))) {
                        color = 'white';
                    }
                    // punctuation is always white
                    if (punctuationChars.includes(ch)) color = 'white';

                    context.fillStyle = color;
                    context.fillText(ch, x, this.game.height - 33 + (lineIdx * 25));
                    x += context.measureText(ch).width;
                }

                x += context.measureText(' ').width;
            }
        }
    }

    playEightBitSound(soundName) {
        const current = this.dialogue[this.dialogueIndex];
        if (current && current.whisper) {
            return;
        }

        if (!this.pause) {
            this.game.audioHandler.cutsceneDialogue.playSound(soundName);
        } else {
            this.game.audioHandler.cutsceneDialogue.pauseSound(soundName);
        }
    }

    getLinesWithinLimit(words, fullWords, limit) {
        const lines = [];
        let currentLine = '';
        let lineCounter = 1;
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const currentLineLength = currentLine.length;
            if (fullWords[i] && (currentLineLength + fullWords[i].length) > limit && lineCounter < 2) {
                lines.push(currentLine);
                currentLine = word;
                lineCounter++;
            } else {
                currentLine += (currentLine === '' ? '' : ' ') + word;
            }
        }
        if (currentLine !== '') lines.push(currentLine);
        return lines;
    }

    cutsceneBackgroundChange(fadein, stay, fadeout) {
        this.game.enterDuringBackgroundTransition = false;
        fadeInAndOut(this.game.canvas, fadein, stay, fadeout, () => {
            this.game.enterDuringBackgroundTransition = true;
        });
    }

    getmap6insideCaveLavaEarthquake() {
        const currentSkin = this.game.menu.skins.currentSkin;
        if (currentSkin === this.game.menu.skins.defaultSkin) {
            return 'map6insideCaveLavaEarthquake';
        } else if (currentSkin === this.game.menu.skins.hatSkin) {
            return 'map6insideCaveLavaEarthquakeHat';
        } else if (currentSkin === this.game.menu.skins.choloSkin) {
            return 'map6insideCaveLavaEarthquakeCholo';
        } else if (currentSkin === this.game.menu.skins.zabkaSkin) {
            return 'map6insideCaveLavaEarthquakeZabka';
        } else if (currentSkin === this.game.menu.skins.shinySkin) {
            return 'map6insideCaveLavaEarthquakeShiny';
        }
    }

    getSkinPrefix() {
        const currentSkin = this.game.menu.skins.currentSkin;
        if (currentSkin === this.game.menu.skins.defaultSkin) {
            return '';
        } else if (currentSkin === this.game.menu.skins.hatSkin) {
            return 'hat';
        } else if (currentSkin === this.game.menu.skins.choloSkin) {
            return 'cholo';
        } else if (currentSkin === this.game.menu.skins.zabkaSkin) {
            return 'zabka';
        } else if (currentSkin === this.game.menu.skins.shinySkin) {
            return 'shiny';
        }
    }

    setFiredogImage(imageName) {
        const prefix = this.getSkinPrefix();
        return `${prefix}firedog${imageName}`;
    }

    setfiredogAngry() {
        return this.setFiredogImage('Angry');
    }
    setfiredogAngry2() {
        return this.setFiredogImage('Angry2');
    }
    setfiredogCry() {
        return this.setFiredogImage('Cry');
    }
    setfiredogHappy() {
        return this.setFiredogImage('Happy');
    }
    setfiredogHeadache() {
        return this.setFiredogImage('Headache');
    }
    setfiredogLaugh() {
        return this.setFiredogImage('Laugh');
    }
    setfiredogNormal() {
        return this.setFiredogImage('Normal');
    }
    setfiredogNormalExclamationMark() {
        return this.setFiredogImage('NormalExclamationMark');
    }
    setfiredogNormalQuestionAndExlamationMark() {
        return this.setFiredogImage('NormalQuestionAndExlamationMark');
    }
    setfiredogNormalQuestionMark() {
        return this.setFiredogImage('NormalQuestionMark');
    }
    setfiredogPhew() {
        return this.setFiredogImage('Phew');
    }
    setfiredogSad() {
        return this.setFiredogImage('Sad');
    }
    setfiredogTired() {
        return this.setFiredogImage('Tired');
    }

    setfiredogAngryBorder() {
        return this.setFiredogImage('AngryBorder');
    }
    setfiredogAngry2Border() {
        return this.setFiredogImage('Angry2Border');
    }
    setfiredogCryBorder() {
        return this.setFiredogImage('CryBorder');
    }
    setfiredogHappyBorder() {
        return this.setFiredogImage('HappyBorder');
    }
    setfiredogHeadacheBorder() {
        return this.setFiredogImage('HeadacheBorder');
    }
    setfiredogLaughBorder() {
        return this.setFiredogImage('LaughBorder');
    }
    setfiredogNormalBorder() {
        return this.setFiredogImage('NormalBorder');
    }
    setfiredogNormalExclamationMarkBorder() {
        return this.setFiredogImage('NormalExclamationMarkBorder');
    }
    setfiredogNormalQuestionAndExlamationMarkBorder() {
        return this.setFiredogImage('NormalQuestionAndExlamationMarkBorder');
    }
    setfiredogNormalQuestionMarkBorder() {
        return this.setFiredogImage('NormalQuestionMarkBorder');
    }
    setfiredogPhewBorder() {
        return this.setFiredogImage('PhewBorder');
    }
    setfiredogSadBorder() {
        return this.setFiredogImage('SadBorder');
    }
    setfiredogTiredBorder() {
        return this.setFiredogImage('TiredBorder');
    }
}
