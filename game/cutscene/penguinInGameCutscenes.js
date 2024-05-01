import { FloatingMessage } from "../animations/floatingMessages.js";

export class IngameCutscene {
    constructor(game) {
        this.game = game;
        this.dialogue = [];
        this.backgroundImage = null;
        this.dialogueIndex = 0;
        this.textIndex = 0;
        this.lastSoundPlayed = false;
        this.lastSound2Played = false;
        this.playSound2OnDotPause = false;
        this.dialogueText = '';
        this.isEnterPressed = false;
        this.pause = false;
        this.continueDialogue = false;
        this.fullWords = [];
        this.playerCoins = this.game.coins;
        this.playerWinningCoins = this.game.winningCoins;
        this.coinText = "coin";
        this.coinsText = "coins";
        this.firedog = "Firedog";
        this.elyvorg = "Elyvorg";
        this.galadon = "Galadon";
        this.zephyrion = "Zephyrion";
        this.threeDots = "... ";
        this.questionMark = "???";
        this.penguini = "Penguini";
        this.lunar = "Lunar";
        this.moonlit = "Moonlit";
        this.glade = "Glade";
        this.infernal = "Infernal";
        this.crater = "Crater";
        this.peak = "Peak";
        this.characterColors = {
            // coin colours
            [this.playerWinningCoins]: 'orange',
            [this.playerCoins]: 'orange',
            [this.coinText]: 'orange',
            [this.coinsText]: 'orange',
            //characters
            [this.firedog]: 'yellow',
            [this.galadon]: 'tomato',
            [this.penguini]: 'cyan',
            [this.zephyrion]: 'DodgerBlue',
            [this.elyvorg]: 'red',
            //unknown
            [this.questionMark]: 'red',
            [this.threeDots]: 'white',
            //map1
            [this.lunar]: 'green',
            [this.moonlit]: 'green',
            [this.glade]: 'green',
            //map6
            [this.infernal]: 'Crimson',
            [this.crater]: 'Crimson',
            [this.peak]: 'Crimson',
        };
    }
    splitDialogueIntoWords(dialogueText) {
        const words = dialogueText.split(" ");
        return words;
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

    removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
    displayDialogue(cutscene) {
        const currentDialogue = this.dialogue[this.dialogueIndex];
        const prefullWords = this.splitDialogueIntoWords(currentDialogue.dialogue);
        this.fullWords = prefullWords;
        this.fullWordsColor = prefullWords;

        this.dialogueIndex = -1;
        this.textIndex = 0;
        this.lastSound2Played = false;

        this.handleKeyDown = (event) => {
            if (!this.game.ingamePauseMenu.isPaused) {
                if (event.key === 'Enter' && !this.isEnterPressed) {
                    this.isEnterPressed = true;
                    this.playSound2OnDotPause = false;
                    this.game.talkToPenguinOneTimeOnly = false;

                    const cashOutDialogue = this.dialogue[this.dialogueIndex];
                    if (cashOutDialogue.dialogue.includes("That's good enough, give me that!") && this.lastSound2Played) {
                        this.game.audioHandler.cutsceneSFX.playSound('cashOut');
                        this.game.coins -= this.game.winningCoins;
                        this.game.floatingMessages.push(new FloatingMessage('-' + this.game.winningCoins, 150, 50, this.game.penguin.x + 75, this.game.penguin.y + 40, 40, 'green'));
                    }
                    if (this.continueDialogue) {
                        this.pause = false;
                        this.textIndex++;
                        this.continueDialogue = false;
                    } else if (this.textIndex < this.dialogue[this.dialogueIndex].dialogue.length) {
                        const dotIndices = this.getDotIndices(this.dialogue[this.dialogueIndex].dialogue);
                        const nextDotIndex = dotIndices.find(index => index > this.textIndex);
                        this.textIndex = nextDotIndex !== undefined ? nextDotIndex : this.dialogue[this.dialogueIndex].dialogue.length;
                    } else if (this.dialogueIndex < this.dialogue.length - 1) {
                        this.dialogueIndex++;
                        this.textIndex = 0;
                        this.lastSound2Played = false;
                        const currentDialogue = this.dialogue[this.dialogueIndex];
                        const prefullWords = this.splitDialogueIntoWords(currentDialogue.dialogue);
                        this.fullWordsColor = [];
                        this.fullWordsColor = prefullWords;
                    } else {
                        this.game.ingamePauseMenu.canPauseInPenguinCutscene = false;
                        this.game.endCutscene(cutscene);
                        this.game.talkToPenguin = false;
                        this.game.cutscenes = [];
                        if (this.game.notEnoughCoins) {
                            setTimeout(() => {
                                this.game.ingamePauseMenu.gameOverNotEnoughCoins();
                            }, 20); // delay to avoid Enter from dialogue activating Enter from pause menu
                        }
                        this.removeEventListeners();
                    }

                    const checkAnimationStatus = setInterval(() => {
                        if (this.textIndex >= this.dialogue[this.dialogueIndex].dialogue.length) {
                            this.isEnterPressed = false;
                            clearInterval(checkAnimationStatus);
                        }
                    }, 100);
                }
            }
        };

        this.handleKeyUp = (event) => {
            if (event.key === 'Enter') {
                this.isEnterPressed = false;
            }
        };

        this.dialogueIndex++;
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);

        const checkAnimationStatus = setInterval(() => {
            if (this.textIndex >= this.dialogue[this.dialogueIndex].dialogue.length) {
                clearInterval(checkAnimationStatus);
            }
        }, 100);
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
    draw(context) {
        if (this.backgroundImage) {
            context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
        }

        if (this.dialogueIndex < this.dialogue.length) {
            const currentDialogue = this.dialogue[this.dialogueIndex];
            const { character, dialogue, images } = currentDialogue;
            const partialText = dialogue.substring(0, this.textIndex + 1);
            this.dialogueText = partialText;
            const words = this.splitDialogueIntoWords(partialText);
            const lines = this.getLinesWithinLimit(words, this.dialogueText);

            context.save();

            if (images && Array.isArray(images)) {
                images.forEach((imageObject) => {
                    const { id, opacity, x, y, width, height } = imageObject;

                    context.globalAlpha = opacity !== undefined ? opacity : 1;
                    context.drawImage(document.getElementById(id), x, y, width, height);

                    context.globalAlpha = 1;
                });
                context.drawImage(document.getElementById("textBox"), 0 + 15, this.game.height - 70, 870, 96);
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

            if (this.textIndex < dialogue.length) {

                if (partialText.endsWith('...') && !this.lastSoundPlayed && partialText !== dialogue) {
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

                if (!this.game.ingamePauseMenu.isPaused) {
                    this.playEightBitSound('bit1', 'bit1');
                    this.textIndex++;
                } else {
                    this.game.audioHandler.cutsceneDialogue.playSound('bit1', false, true, true);
                }
            } else {
                this.characterColorLogic(context, lines, words, characterName)
            }

            if (this.textIndex >= dialogue.length && !this.lastSoundPlayed) {
                this.game.audioHandler.cutsceneDialogue.playSound('bit1', false, true, true)
                if (!this.lastSound2Played) {
                    this.playEightBitSound('bit2');
                    this.lastSound2Played = true;
                }
            }
        }
        context.restore();
    }
    characterColorLogic(context, lines, words, characterName) {
        const punctuationChars = ',!?.:;()"';
        const intColor = this.dialogue[this.dialogueIndex];
        const specificPhrase1 = "It seems you have";
        const specificPhrase2 = "I will need";

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
                            if ((!isNaN(word) && !intColor.dialogue.includes(specificPhrase1)) &&
                                (!isNaN(word) && !intColor.dialogue.includes(specificPhrase2))) {
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

    getLinesWithinLimit(words, fullWords) {
        const lines = [];
        const limit = 65;
        let currentLine = '';
        let lineCounter = 1;
        for (let i = 0; i < words.length; i++) {
            const completedWords = fullWords[i];
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
        if (currentLine !== '') {
            lines.push(currentLine);
        }
        return lines;
    }
}

export class FilterCleanDialogue extends IngameCutscene {
    constructor(game) {
        super(game);
        this.dialogue = [];
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

    getSkinPrefix() {
        const currentSkin = this.game.menuInstances.skins.currentSkin;
        if (currentSkin === this.game.menuInstances.skins.defaultSkin) {
            return '';
        } else if (currentSkin === this.game.menuInstances.skins.hatSkin) {
            return 'hat';
        } else if (currentSkin === this.game.menuInstances.skins.choloSkin) {
            return 'cholo';
        } else if (currentSkin === this.game.menuInstances.skins.zabkaSkin) {
            return 'zabka';
        } else if (currentSkin === this.game.menuInstances.skins.shinySkin) {
            return 'shiny';
        }
    }

    setFiredogImage(imageName) {
        const prefix = this.getSkinPrefix();
        return `${prefix}firedog${imageName}`;
    }

    setfiredogAngry() {
        return this.setFiredogImage('AngryBorder');
    }
    setfiredogAngry2() {
        return this.setFiredogImage('Angry2Border');
    }
    setfiredogCry() {
        return this.setFiredogImage('CryBorder');
    }
    setfiredogHappy() {
        return this.setFiredogImage('HappyBorder');
    }
    setfiredogHeadache() {
        return this.setFiredogImage('HeadacheBorder');
    }
    setfiredogLaugh() {
        return this.setFiredogImage('LaughBorder');
    }
    setfiredogNormal() {
        return this.setFiredogImage('NormalBorder');
    }
    setfiredogNormalExclamationMark() {
        return this.setFiredogImage('NormalExclamationMarkBorder');
    }
    setfiredogNormalQuestionAndExlamationMark() {
        return this.setFiredogImage('NormalQuestionAndExlamationMarkBorder');
    }
    setfiredogNormalQuestionMark() {
        return this.setFiredogImage('NormalQuestionMarkBorder');
    }
    setfiredogPhew() {
        return this.setFiredogImage('PhewBorder');
    }
    setfiredogSad() {
        return this.setFiredogImage('SadBorder');
    }
    setfiredogTired() {
        return this.setFiredogImage('TiredBorder');
    }
}

// Map 1 Penguin Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map1PenguinIngameCutscene extends FilterCleanDialogue {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.threeDots}`,
            `Stop right there! You shall not pass beyond this point or I will not hesitate but to use my most ferocious attacks on you.`,
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Wha!? Who are you!? An enemy!? Why do you have a bat!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //2
            `${this.threeDots}`,
            `Enemy? I am ${this.penguini}, gatekeeper of the cabins.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //3
            `${this.penguini}`,
            `And don't worry about the bat... ya' fool.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Gatekeeper of the cabins? That's amazing, so I'll be safe as I rest in that warm cabin... Sounds good to me!`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `... ... Why are you not letting me through?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.penguini}`,
            `Do you think this is charity work ya' fool? Pay up or leave.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `WHA? Can you just let me through this time ${this.penguini}, it's my first time here...`,
            this.addImage(this.setfiredogSad(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `I don't do no discounts fool.`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `I will need ${this.playerWinningCoins} ${this.coinsText}.`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Wha! No discounts at all please?`,
            this.addImage(this.setfiredogCry(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `No! Let me see your pockets!`,
            this.addImage(this.setfiredogCry(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(dialogue => {
            this.addDialogue(dialogue.character, dialogue.dialogue, ...dialogue.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        // rest of the dialogue
        this.addDialogue( //14
            `${this.firedog}`,
            `Wha- you... you just took my money like that ${this.penguini}!? I was trying to negotiate.`,
            this.addImage(this.setfiredogAngry2(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `I don't do negotiations with dogs ya' fool.`,
            this.addImage(this.setfiredogAngry2(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `I don't do negotiations with fat penguins...  ... ya' fool...`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `Do you want to sleep outside tonight?`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Sorry... I'll just... go inside... I guess...`,
            this.addImage(this.setfiredogHeadache(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `Get in ya' fool!`,
            this.addImage(this.setfiredogTired(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
    }
}

// Map 2 Penguin Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map2PenguinIngameCutscene extends FilterCleanDialogue {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.firedog}`,
            `Wow!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 100, 400, 200, 200),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `It's you again ${this.penguini}!? Weren't you just in ${this.lunar} ${this.moonlit} ${this.glade}?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 100, 400, 200, 200),
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `You met my brother ${this.penguini} ya' fool.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Your brother? Who are you then?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `I'm ${this.penguini} ya' fool! Me and my brothers are the gatekeepers of all cabins around every land ya' fool!`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `Are you gonna pay up or stand there, ${this.firedog}, ya' fool!`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `What!? How do you know my name?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.penguini}`,
            `Me and my brothers communicate telepathically ya' fool!`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Well... I'm not even going to ask how that's possible...`,
            this.addImage(this.setfiredogPhew(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `Anyways, you already know the drill, pay up, or leave, ya' fool!`,
            this.addImage(this.setfiredogPhew(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.penguini}`,
            `I will need ${this.playerWinningCoins} ${this.coinsText} in my pocket this time fool!`,
            this.addImage(this.setfiredogPhew(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `What!? That's more expensive than my last trip!`,
            this.addImage(this.setfiredogCry(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.penguini}`,
            `You're in a more dangerous area, if you don't like it you can leave ya' fool!`,
            this.addImage(this.setfiredogCry(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Well... it doesn't seem like I have much of a choice anyways. This is how much I have.`,
            this.addImage(this.setfiredogCry(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(dialogue => {
            this.addDialogue(dialogue.character, dialogue.dialogue, ...dialogue.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        // rest of the dialogue
        this.addDialogue( //16
            `${this.firedog}`,
            `Ugh... all of that just to be broke again...`,
            this.addImage(this.setfiredogCry(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `You're lucky I didn't charge you more ya' fool!`,
            this.addImage(this.setfiredogCry(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `You...`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `Now get in before I hit you with this bat!`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
    }
}
// Map 3 Penguin Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map3PenguinIngameCutscene extends FilterCleanDialogue {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.firedog}`,
            `Wow! Is that a submarine!?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `${this.penguini}, I thought you were the gatekeeper of cabins, not... freaking submarines!?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `How is this possible?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //3
            `${this.penguini}`,
            `... Don't question our business model.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `Anyways, you're breathing underwater... I see... so you managed to find ${this.zephyrion} ya' fool!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `I don't usually see dogs in here. That's a first time ya' fool! Haha!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Well, thanks for that...`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Wait... so your brother told me that you guys and ${this.zephyrion} used to do business together!?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `I see... so he was casting the spell for random explorers to breathe underwater and once they reached you, you just collect their money!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `And then you split the profits with ${this.zephyrion}, am I right ${this.penguini}!?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.penguini}`,
            `Wha- How did you...`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `Enough of this conversation!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.penguini}`,
            `Let's get to business, aquatic dog!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `I will need ${this.playerWinningCoins} ${this.coinsText} for you to get a trip inside this beast of a sub!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1200, 400, 200, 200),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(dialogue => {
            this.addDialogue(dialogue.character, dialogue.dialogue, ...dialogue.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        // rest of the dialogue
        this.addDialogue( //16
            `${this.penguini}`,
            `You can go inside now.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `Thank you ${this.penguini}. I just have one question... Where are you going to take me exactly?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `You will find out soon enough ya' fool! Now go before you choke on this water!`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `You're right, I can feel that the spell is about to end!`,
            this.addImage(this.setfiredogHeadache(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Okay, let's get inside that submarine quickly!`,
            this.addImage(this.setfiredogTired(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1200, 400, 200, 200),
        );
    }
}
// Map 4 Penguin Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map4PenguinIngameCutscene extends FilterCleanDialogue {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.firedog}`,
            `Hey there ${this.penguini}!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Wait... WOW! When did you get that rifle ${this.penguini}!? I thought you had a bat!`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `Haha, oh this? Don't worry about how I get my things around these streets! Let's just say I got this through.. legal ways.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Whatever that means... well I'm glad to see you here I guess...`,
            this.addImage(this.setfiredogPhew(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `Good to see you too ${this.firedog}! Good to see you're still alive ya' fool!`,
            this.addImage(this.setfiredogPhew(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Wow. That's the nicest you've ever been to me ${this.penguini}!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.penguini}`,
            `Nice? That was sarcasm ya' fool!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.penguini}`,
            `Now let's get to business!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `I will need ${this.playerWinningCoins} ${this.coinsText} for you to stay in this verdant cabin!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(dialogue => {
            this.addDialogue(dialogue.character, dialogue.dialogue, ...dialogue.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        // rest of the dialogue
        this.addDialogue( //11
            `${this.penguini}`,
            `You can go ahead.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Thank you ${this.penguini}!`,
            this.addImage(this.setfiredogHappy(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `Oh and by the way, your friend is inside. I'm surprised that fool managed to get here from how bad he looked!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `Good thing he had some spare money.. because I would not let that one slide otherwise ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `My friend? Wait... Do you mean ${this.galadon}!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.penguini}`,
            `That's right ya' fool! He asked for you, I told him you were in the submarine not long ago!`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `Wait how did you know I was in the sub-`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `(Oh right, nevermind... I forgot ${this.penguini} and his brothers somehow magically can communicate telepathically.)`,
            this.addImage(this.setfiredogPhew(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `Stop yapping and go inside before your friend dies ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Going now, thanks for letting me know..`,
            this.addImage(this.setfiredogNormal(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Alright, let's go.`,
            this.addImage(this.setfiredogNormal(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
    }
}
// Map 5 Penguin Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map5PenguinIngameCutscene extends FilterCleanDialogue {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.firedog}`,
            `Of course it stops raining when I'm near the cabin..`,
            this.addImage(this.setfiredogPhew(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Hello ${this.penguini}!`,
            this.addImage(this.setfiredogHappy(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `Oh hello ${this.firedog}! You look completely drenched from the rain!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //3
            `${this.penguini}`,
            `Hahahaha!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Yeah... thanks for mocking me ${this.penguini}! Not funny!`,
            this.addImage(this.setfiredogAngry2(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `You seem to be in a wild rush to go somewhere.. From ${this.lunar} ${this.moonlit} ${this.glade} to here in just some days!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.penguini}`,
            `What's the rush for ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Wha-`,
            this.addImage(this.setfiredogPhew(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `(I shouldn't tell ${this.penguini} why I'm in a rush..)`,
            this.addImage(this.setfiredogPhew(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `Haha, not that I mind! This is good for business ya' fool!`,
            this.addImage(this.setfiredogPhew(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Is the business all you care about ${this.penguini}?`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `I stay tight in business with my brothers. If you got a problem you can leave ya' fool!`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I never said I had a problem! Why are you always so abrasive!`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `Don't hate the player hate the game ya' fool! Now let's talk real business.`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `I will need ${this.playerWinningCoins} ${this.coinsText} for you to stay in this summery cabin!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `You're lucky it isn't raining right now, or you would've been charged twice as much ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wait... why would you charge twice the usual price just because it's raining...`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `...`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Anyways, let me see your pockets ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(dialogue => {
            this.addDialogue(dialogue.character, dialogue.dialogue, ...dialogue.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        // rest of the dialogue
        this.addDialogue( //21
            `${this.firedog}`,
            `Alright! I'll get inside before it starts raining on me again!`,
            this.addImage(this.setfiredogNormal(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //22
            `${this.penguini}`,
            `Before you get in ${this.firedog}, can I ask which way you're going when you leave?`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Huh? Well I'm going towards ${this.infernal} ${this.crater} ${this.peak}.`,
            this.addImage(this.setfiredogNormal(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //24
            `${this.penguini}`,
            `You know, from all my years of being in this tight business with my brothers, I've seen people go towards ${this.infernal} ${this.crater} ${this.peak}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //25
            `${this.penguini}`,
            `And they never came back. There are constant erruptions in there.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //26
            `${this.penguini}`,
            `Although my brothers and I also have businesses guarding the many hundreds of caves there, you should think twice.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //27
            `${this.penguini}`,
            `I mean... it's not that I care if you die ya' fool! But since we've been profiting off of you for the last couple of days...`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //28
            `${this.penguini}`,
            `It wouldn't be good for business if you... died!`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `Haha, ${this.penguini}, you do care about me don't you!`,
            this.addImage(this.setfiredogLaugh(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //30
            `${this.penguini}`,
            `No I don't ya' fool. I shouldn't have said anything. Ugh! Shut up and get inside!`,
            this.addImage(this.setfiredogLaugh(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Thanks for the warning, I appreciate it!`,
            this.addImage(this.setfiredogHappy(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //32
            `${this.penguini}`,
            `No worries ya' fool!`,
            this.addImage(this.setfiredogHappy(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
    }
}
// Map 6 Penguin Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map6PenguinIngameCutscene extends FilterCleanDialogue {
    constructor(game) {
        super(game);
        this.game.notEnoughCoins = false;
        this.addDialogue( //1
            `${this.firedog}`,
            `${this.penguini}!? WHAT HAPPENED...`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `You look badly hurt! Are you okay?`,
            this.addImage(this.setfiredogCry(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //3
            `${this.penguini}`,
            `A dark hooded figure knocked me out ya' fool...`,
            this.addImage(this.setfiredogCry(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `He went through this cave without paying...`,
            this.addImage(this.setfiredogCry(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `I couldn't even stop him... he attacked me before I could pull the trigger...`,
            this.addImage(this.setfiredogCry(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Damn it ${this.elyvorg}...`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `I need to stop ${this.elyvorg}. He is the one who attacked you.`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `Please go ahead ya' fool, I'll be fine.. I've already warned telepathically my brothers about the situation, they'll come to my rescue shortly.`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `Stop him, make that fool pay for what he did to me.`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `I promise I will ${this.penguini}.`,
            this.addImage(this.setfiredogAngry2(), 1, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `(${this.elyvorg}, I'm going to make you regret this.)`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I'm going inside now.`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 0.7, 1200, 400, 200, 200),
        );
    }
}
// coin condition penguin dialogues
export class CoinDialogueConditionCutscene extends FilterCleanDialogue {
    constructor(game) {
        super(game);
    }
    checkPlayerCoins() {
        let newDialogues = [];
        if (this.game.mapSelected[1]) {
            if (this.game.coins < this.game.winningCoins) {
                this.game.notEnoughCoins = true;
                newDialogues.push(
                    { //13
                        character: this.penguini,
                        dialogue: `That doesn't even cover my rent!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
                        ]
                    },
                    { //14
                        character: this.penguini,
                        dialogue: `Come back when you have enough, get out of here now!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
                        ]
                    },
                    { //15
                        character: this.firedog,
                        dialogue: `Damn.. Gotta try again..`,
                        images: [
                            this.addImage(this.setfiredogPhew(), 1, 100, 400, 200, 200),
                            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
                        ]
                    },
                );
            } else {
                newDialogues.push(
                    { //13
                        character: this.penguini,
                        dialogue: `That's good enough, give me that!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinBatLaughBorder', 1, 1400, 400, 200, 200),
                        ]
                    },
                );
            }
        } else if (this.game.mapSelected[2]) {
            if (this.game.coins < this.game.winningCoins) {
                this.game.notEnoughCoins = true;
                newDialogues.push(
                    { //15
                        character: this.penguini,
                        dialogue: `That doesn't even cover half my rent!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
                        ]
                    },
                    { //16
                        character: this.penguini,
                        dialogue: `You're sleeping outside tonight with the ghosts ya' fool!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
                        ]
                    },
                    { //17
                        character: this.penguini,
                        dialogue: `Come back when you have enough, get out of here now!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
                        ]
                    },
                    { //18
                        character: this.firedog,
                        dialogue: `Damn.. Gotta try again..`,
                        images: [
                            this.addImage(this.setfiredogPhew(), 1, 100, 400, 200, 200),
                            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
                        ]
                    },
                );
            } else {
                newDialogues.push(
                    { //15
                        character: this.penguini,
                        dialogue: `That's good enough, give me that!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinBatLaughBorder', 1, 1400, 400, 200, 200),
                        ]
                    }
                );
            }
        } else if (this.game.mapSelected[3]) {
            if (this.game.coins < this.game.winningCoins) {
                this.game.notEnoughCoins = true;
                newDialogues.push(
                    { //15
                        character: this.penguini,
                        dialogue: `That doesn't even cover half of my uranium submarine fuel!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
                        ]
                    },
                    { //16
                        character: this.penguini,
                        dialogue: `You're not going inside of this submarine.`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
                        ]
                    },
                    { //17
                        character: this.penguini,
                        dialogue: `Come back when you have enough, get out of here now!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
                        ]
                    },
                    { //18
                        character: this.firedog,
                        dialogue: `Damn.. Gotta try again..`,
                        images: [
                            this.addImage(this.setfiredogPhew(), 1, 100, 400, 200, 200),
                            this.addImage('penguinBatUpBorder', 0.7, 1200, 400, 200, 200),
                        ]
                    },
                );
            } else {
                newDialogues.push(
                    { //15
                        character: this.penguini,
                        dialogue: `That's good enough, give me that!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinBatLaughBorder', 1, 1200, 400, 200, 200),
                        ]
                    }
                );
            }
        } else if (this.game.mapSelected[4]) {
            if (this.game.coins < this.game.winningCoins) {
                this.game.notEnoughCoins = true;
                newDialogues.push(
                    { //10
                        character: this.penguini,
                        dialogue: `That doesn't even cover enough to water the verdant plants of this land!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                        ]
                    },
                    { //11
                        character: this.penguini,
                        dialogue: `If you want to get inside you're gonna need to try harder than that ya' fool!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                        ]
                    },
                    { //12
                        character: this.penguini,
                        dialogue: `Come back when you have enough, get out of here now!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                        ]
                    },
                    { //13
                        character: this.firedog,
                        dialogue: `Damn.. Gotta try again..`,
                        images: [
                            this.addImage(this.setfiredogPhew(), 1, 100, 400, 200, 200),
                            this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
                        ]
                    },
                );
            } else {
                newDialogues.push(
                    { //10
                        character: this.penguini,
                        dialogue: `That's good enough, give me that!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinGunLaughBorder', 1, 1430, 400, 200, 200),
                        ]
                    }
                );
            }
        } else if (this.game.mapSelected[5]) {
            if (this.game.coins < this.game.winningCoins) {
                this.game.notEnoughCoins = true;
                newDialogues.push(
                    { //20
                        character: this.penguini,
                        dialogue: `That doesn't even cover half my rent! If I accepted those pennies my business would go bankrupt!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                        ]
                    },
                    { //21
                        character: this.penguini,
                        dialogue: `You're going to stay outside. I don't care if it rains on you!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                        ]
                    },
                    { //22
                        character: this.penguini,
                        dialogue: `Come back when you have enough, get out of here now!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                        ]
                    },
                    { //23
                        character: this.firedog,
                        dialogue: `Damn.. Gotta try again..`,
                        images: [
                            this.addImage(this.setfiredogPhew(), 1, 100, 400, 200, 200),
                            this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
                        ]
                    },
                );
            } else {
                newDialogues.push(
                    { //20
                        character: this.penguini,
                        dialogue: `That's good enough, give me that!`,
                        images: [
                            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
                            this.addImage('penguinGunLaughBorder', 1, 1430, 400, 200, 200),
                        ]
                    }
                );
            }
        }
        return newDialogues;
    }
}