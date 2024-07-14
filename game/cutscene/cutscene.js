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
        this.shouldDrawWord = false;
        this.isCharacterBlackAndWhite = false;
        this.isBackgroundBlackAndWhite = false;
        this.fullWords = [];
        this.fullWordsColor = [];
        this.halfASecond = 500;
        this.groundShaking = false;
        this.playerCoins = this.game.coins;
        this.textBoxWidth = 870;
        this.coinText = "coin";
        this.coinsText = "coins";
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
        this.valdonotski = "Valdonotski"
        this.zephyrion = "Zephyrion";
        this.cryptic = "Cryptic";
        this.token = "Token";
        this.temporal = "Temporal";
        this.timber = "Timber";
        this.lunar = "Lunar";
        this.moonlit = "Moonlit";
        this.glade = "Glade";
        this.nightfall = "Nightfall";
        this.city = "City";
        this.phantom = "Phantom";
        this.coral = "Coral";
        this.abyss = "Abyss";
        this.verdant = "Verdant";
        this.vine = "Vine";
        this.springly = "Springly";
        this.lemony = "Lemony";
        this.infernal = "Infernal";
        this.crater = "Crater";
        this.peak = "Peak";
        this.project = "Project";
        this.cryptoterra = "Cryptoterra";
        this.genesis = "Genesis";
        this.characterColors = {
            // coin colours
            [this.game.winningCoins]: 'orange',
            [this.playerCoins]: 'orange',
            [this.coinText]: 'orange',
            [this.coinsText]: 'orange',
            //characters
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
            //unknown
            [this.questionMark]: 'red',
            [this.threeDots]: 'white',
            //map1
            [this.lunar]: 'green',
            [this.moonlit]: 'green',
            [this.glade]: 'green',
            //map2
            [this.nightfall]: 'green',
            [this.city]: 'green',
            [this.phantom]: 'green',
            //map3
            [this.coral]: 'green',
            [this.abyss]: 'green',
            //map4
            [this.verdant]: 'green',
            [this.vine]: 'green',
            //map5
            [this.springly]: 'green',
            [this.lemony]: 'green',
            //map6
            [this.infernal]: 'Crimson',
            [this.crater]: 'Crimson',
            [this.peak]: 'Crimson',
            // project
            [this.project]: 'OrangeRed',
            [this.cryptoterra]: 'OrangeRed',
            [this.genesis]: 'OrangeRed',
            //other
            [this.cryptic]: 'DarkViolet',
            [this.token]: 'DarkViolet',
            [this.temporal]: 'GoldenRod',
            [this.timber]: 'GoldenRod',
        };
        this.reminderImage = document.getElementById("reminderToSkipWithTab");
        this.reminderImageStartTime = null;
    }

    splitDialogueIntoWords(dialogueText) {
        const words = dialogueText.split(" ");
        return words;
    }

    addEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        document.addEventListener('click', this.handleLeftClick);
        document.addEventListener('click', this.handleLeftClickUp);
    }
    removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('click', this.handleLeftClick);
        document.removeEventListener('click', this.handleLeftClickUp);
    }

    displayDialogue(cutscene) {
        const currentDialogue = this.dialogue[this.dialogueIndex];
        const prefullWords = this.splitDialogueIntoWords(currentDialogue.dialogue);
        this.fullWords = prefullWords;
        this.fullWordsColor = prefullWords;
        this.dialogueIndex = -1;
        this.textIndex = 0;
        this.lastSound2Played = false;
        this.isEnterPressed = false;

        this.handleKeyUp = (event) => {
            if (event.key === 'Enter') {
                this.isEnterPressed = false;
            }
        };
        this.handleLeftClickUp = (event) => {
            if (event.button === 0) {
                this.isEnterPressed = false;
            }
        };

        this.dialogueIndex++;
        this.addEventListeners();

        this.reminderImageStartTime = performance.now();
    }

    draw(context) {
        if (this.backgroundImage) {
            if (this.isBackgroundBlackAndWhite) {
                context.filter = "grayscale(100%)";
            }

            if (this.groundShaking) {
                preShake(context);
            }
            context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
            if (this.groundShaking) {
                postShake(context);
            }

            context.filter = "none";
        }
        if (this.dialogueIndex < this.dialogue.length) {
            const currentDialogue = this.dialogue[this.dialogueIndex];
            const { character, dialogue, images } = currentDialogue;
            const partialText = dialogue.substring(0, this.textIndex + 1);
            this.dialogueText = partialText;
            const words = this.splitDialogueIntoWords(partialText);
            const lines = this.getLinesWithinLimit(words, this.dialogueText, this.characterLimit);

            context.save();

            if (this.game.enterDuringBackgroundTransition) {
                if (images && Array.isArray(images)) {
                    images.forEach((imageObject) => {
                        const { id, opacity, x, y, width, height } = imageObject;

                        if (this.isCharacterBlackAndWhite) {
                            context.filter = "grayscale(100%)";
                        }

                        context.globalAlpha = opacity !== undefined ? opacity : 1;
                        context.drawImage(document.getElementById(id), x, y, width, height);

                        context.filter = "none";
                        context.globalAlpha = 1;
                    });
                }
                if (this.dontShowTextBoxAndSound === false) {
                    context.drawImage(document.getElementById("textBox"), 0 + 15, this.game.height - 70, this.textBoxWidth, 96);
                }
            }

            const currentTime = performance.now();
            if (this.reminderImageStartTime !== null && (currentTime - this.reminderImageStartTime) < 7000 &&
                (this.game.cutsceneActive && !this.game.talkToPenguin && !this.game.talkToElyvorg)) {
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
                for (let charIndex = 0; charIndex < characterName.length; charIndex++) {
                    const punctuationChars = ':';
                    const char = characterName[charIndex];

                    if (punctuationChars.includes(char)) {
                        context.fillStyle = 'white';
                    } else {
                        context.fillStyle = characterColor;
                    }

                    context.fillText(char, xPosition, this.game.height - 33);
                    xPosition += context.measureText(char).width;
                }
            }

            if (this.textIndex < dialogue.length) {
                if (!this.game.enterDuringBackgroundTransition) {
                    this.textIndex -= 2;
                    if (this.textIndex < 0) {
                        this.textIndex = -2;
                    }
                    this.pause = true;
                } else {
                    this.pause = false;
                }
                if (partialText.endsWith('...') && !this.lastSoundPlayed && partialText !== dialogue && this.game.menu.pause.isPaused === false) {
                    if (!this.playSound2OnDotPause) {
                        this.playEightBitSound('bit2');
                        this.playSound2OnDotPause = true;
                    }
                    this.textIndex--;
                    this.pause = true;
                    this.continueDialogue = true;
                    this.isEnterPressed = false;
                }

                this.characterColorLogic(context, lines, words, characterName)

                if (!this.game.menu.pause.isPaused) {
                    this.playEightBitSound('bit1', 'bit1');
                    this.textIndex++;
                } else {
                    this.game.audioHandler.cutsceneDialogue.playSound('bit1', false, true, true);
                }
            } else {
                this.characterColorLogic(context, lines, words, characterName)
            }

            if (this.textIndex >= dialogue.length && !this.lastSoundPlayed) {
                this.game.audioHandler.cutsceneDialogue.playSound('bit1', false, true, true);
                if (!this.lastSound2Played && this.dontShowTextBoxAndSound === false) {
                    this.playEightBitSound('bit2');
                    this.lastSound2Played = true;
                }
            }
        }
        context.restore();
    }

    playEightBitSound(soundId, soundIDpaused) {
        const audioElement = this.game.audioHandler.cutsceneDialogue.sounds[soundIDpaused];
        if (this.dialogueText.trim().startsWith("(")) {
            // if dialogue starts with "(" don't play the sound
            return;
        }
        if (!this.pause) {
            this.game.audioHandler.cutsceneDialogue.playSound(soundId);
        } else {
            this.game.audioHandler.cutsceneDialogue.pauseSound(audioElement);
        }
    }

    getDotIndices(dialogue) {
        const dotIndices = [];
        let dotIndex = dialogue.indexOf('...');

        while (dotIndex !== -1) {
            dotIndices.push(dotIndex);
            dotIndex = dialogue.indexOf('...', dotIndex + 3);
        }
        return dotIndices;
    }

    isCharacterName(word) {
        return this.characterColors.hasOwnProperty(word);
    }

    characterColorLogic(context, lines, words, characterName) {
        const punctuationChars = ',!?.:;()"';
        const intColor = this.dialogue[this.dialogueIndex];
        const specificPhrases = ["It seems you have", "I will need"];

        for (let index = 0; index < lines.length; index++) {
            const line = lines[index];
            const lineWords = this.splitDialogueIntoWords(line);
            let xPosition = 50 + context.measureText(characterName).width;

            for (let wordIndex = 0; wordIndex < lineWords.length; wordIndex++) {
                const word = lineWords[wordIndex];

                for (let i = 0; i < words.length; i++) {
                    const wordsIndex = words[i];
                    const completedWord = this.fullWordsColor[i].replace(/[,!?.:;()"]/g, '');

                    if (word === wordsIndex) {
                        for (let charIndex = 0; charIndex < word.length; charIndex++) {
                            const char = word[charIndex];
                            let color = '';

                            if (this.isCharacterName(completedWord)) {
                                color = this.characterColors[completedWord];
                            } else {
                                color = 'white';
                            }
                            if (!isNaN(word) && !specificPhrases.some(phrase => intColor.dialogue.includes(phrase))) {
                                // if the word is a number and the dialogue doesn't include the specific phrase
                                color = 'white';
                            }
                            context.fillStyle = color;

                            if (punctuationChars.includes(char)) {
                                context.fillStyle = 'white';
                            }

                            context.fillText(char, xPosition, this.game.height - 33 + (index * 25));
                            xPosition += context.measureText(char).width;
                        }

                        xPosition += context.measureText(' ').width; // adds space between words
                        break;
                    }
                }
            }
        }
    }

    getLinesWithinLimit(words, fullWords, limit) {
        const lines = [];
        this.limit = limit;
        let currentLine = '';
        let lineCounter = 1;
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const currentLineLength = currentLine.length;
            if (fullWords[i] && (currentLineLength + fullWords[i].length) > this.limit && lineCounter < 2) {
                lines.push(currentLine);
                currentLine = word;
                lineCounter++;
            } else {
                currentLine += (currentLine === '' ? '' : ' ') + word;
            }
        }
        if (currentLine !== '') {
            lines.push(currentLine);
        }
        return lines;
    }

    cutsceneBackgroundChange(fadein, stay, fadeout) {
        this.game.enterDuringBackgroundTransition = false;
        fadeInAndOut(this.game.canvas, fadein, stay, fadeout, () => {
            this.game.enterDuringBackgroundTransition = true;
        });
    }

    addDialogue(character, dialogue, ...images) {
        this.dialogue.push({
            character: character,
            dialogue: dialogue,
            images: images
        });
    }

    addImage(id, opacity, x, y, width, height) {
        return { id, opacity, x, y, width, height };
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
