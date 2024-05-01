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
        this.firedog = "Firedog";
        this.elyvorg = "Elyvorg";
        this.galadon = "Galadon";
        this.quilzorin = "Quilzorin";
        this.questionMark = "???";
        this.valdorin = "Valdorin";
        this.cryptic = "Cryptic";
        this.token = "Token";
        this.temporal = "Temporal";
        this.timber = "Timber";
        this.verdant = "Verdant";
        this.vine = "Vine";
        this.project = "Project";
        this.cryptoterra = "Cryptoterra";
        this.genesis = "Genesis";
        this.characterColors = {
            //characters
            [this.firedog]: 'yellow',
            [this.galadon]: 'tomato',
            [this.valdorin]: 'RoyalBlue',
            [this.quilzorin]: 'Teal',
            [this.elyvorg]: 'red',
            //unknown
            [this.questionMark]: 'red',
            //map4
            [this.verdant]: 'green',
            [this.vine]: 'green',
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

    bcChange() {
        if (this.textIndex === this.dialogue[this.dialogueIndex].dialogue.length) {
            if (this.game.elyvorgPreFight === true) {
                if (this.dialogueIndex === 1) {
                    this.game.audioHandler.mapSoundtrack.playSound('crypticTokenDarkAmbienceSoundInGame', true);
                } else if (this.dialogueIndex === 5) {
                    this.game.audioHandler.mapSoundtrack.fadeOutAndStop('crypticTokenDarkAmbienceSoundInGame');
                } else if (this.dialogueIndex === 12) {
                    this.removeEventListeners();
                    this.game.audioHandler.firedogSFX.playSound('dreamSoundInGame');
                    this.game.cutsceneBackgroundChange(500, 500, 500);
                    setTimeout(() => {
                        this.addEventListeners();
                    }, 1000);
                }
            } else if (this.game.elyvorgPostFight === true) {
                if (this.dialogueIndex === 2) {
                    this.game.audioHandler.cutsceneMusic.playSound('unboundPurpose', true);
                } else if (this.dialogueIndex === 25) {
                    this.game.audioHandler.mapSoundtrack.playSound('crypticTokenDarkAmbienceSoundInGame', true);
                } else if (this.dialogueIndex === 29) {
                    this.game.audioHandler.mapSoundtrack.fadeOutAndStop('crypticTokenDarkAmbienceSoundInGame');
                } else if (this.dialogueIndex === 35) {
                    this.game.audioHandler.cutsceneMusic.fadeOutAndStop('unboundPurpose');
                }
            }
        }
    }

    removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
    addEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
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
                if (event.key === 'Tab' && this.game.enterDuringBackgroundTransition) {
                    if (this.game.elyvorgPreFight) {
                        this.removeEventListeners();
                        this.game.cutsceneBackgroundChange(500, 2500, 200);

                        this.game.audioHandler.cutsceneDialogue.stopAllSounds();
                        this.game.audioHandler.cutsceneSFX.stopAllSounds();
                        this.game.audioHandler.cutsceneMusic.stopAllSounds();
                        this.game.audioHandler.cutsceneDialogue.playSound('bit1', false, true, true);

                        this.game.audioHandler.cutsceneSFX.playSound('battleStarting');
                        setTimeout(() => {
                            this.dialogueIndex = this.dialogue.length - 1;
                            this.game.endCutscene(cutscene);
                            this.game.talkToElyvorg = false;
                            this.game.cutscenes = [];
                            this.game.elyvorgInFight = true;
                            this.game.audioHandler.mapSoundtrack.playSound('elyvorgBattleTheme', true);
                        }, 3000);
                    }
                }

                if (event.key === 'Enter' && !this.isEnterPressed && this.game.enterDuringBackgroundTransition) {
                    this.bcChange();
                    if (this.game.player.currentState !== this.game.player.states[8]) {
                        this.game.player.setState(8, 0);
                    }
                    this.isEnterPressed = true;
                    this.playSound2OnDotPause = false;

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
                        if (this.game.elyvorgPreFight) {
                            this.removeEventListeners();
                            this.game.cutsceneBackgroundChange(500, 2500, 200);
                            this.game.audioHandler.cutsceneSFX.playSound('battleStarting');
                            setTimeout(() => {
                                this.game.endCutscene(cutscene);
                                this.game.talkToElyvorg = false;
                                this.game.cutscenes = [];
                                this.game.elyvorgInFight = true;
                                this.game.audioHandler.mapSoundtrack.playSound('elyvorgBattleTheme', true);
                            }, 3000);
                        } else if (this.game.elyvorgPostFight) {
                            this.game.endCutscene(cutscene);
                            this.game.talkToElyvorg = false;
                            this.game.cutscenes = [];
                            this.removeEventListeners();
                        }
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
        this.addEventListeners();

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

            if (this.game.enterDuringBackgroundTransition) {
                if (images && Array.isArray(images)) {
                    images.forEach((imageObject) => {
                        const { id, opacity, x, y, width, height } = imageObject;

                        context.globalAlpha = opacity !== undefined ? opacity : 1;
                        context.drawImage(document.getElementById(id), x, y, width, height);

                        context.globalAlpha = 1;
                    });
                }
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
                this.game.audioHandler.cutsceneDialogue.playSound('bit1', false, true, true);
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

                            if (this.isCharacterName(completedWord)) {
                                context.fillStyle = this.characterColors[completedWord];
                            } else {
                                context.fillStyle = 'white';
                            }

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

// Map 6 Elyvorg Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map6ElyvorgIngameCutsceneBeforeFight extends FilterCleanDialogue {
    constructor(game) {
        super(game);
        this.addDialogue( //0
            `${this.firedog}`,
            `A hooded individual- So it's you...`,
            this.addImage(this.setfiredogNormal(), 1, 100, 400, 200, 200),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `You are the one who stole the ${this.cryptic} ${this.token} weren't you?`,
            this.addImage(this.setfiredogAngry2(), 1, 100, 400, 200, 200),
        );
        this.addDialogue( //2
            `${this.questionMark}`,
            `Oh, you mean this?`,
            this.addImage(this.setfiredogAngry2(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1560, 250, 200, 200),
            this.addImage('crypticTokenShining', 1, 1620, 400, 260, 260),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `That's the... The ${this.cryptic} ${this.token}! You need to give that back!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 0.7, 1560, 250, 200, 200),
            this.addImage('crypticTokenShining', 1, 1620, 400, 260, 260),
        );
        this.addDialogue( //4
            `${this.questionMark}`,
            `Hm, no.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1560, 250, 200, 200),
            this.addImage('crypticTokenShining', 1, 1620, 400, 260, 260),
        );
        this.addDialogue( //5
            `${this.questionMark}`,
            `I'll keep this with me. Let me put it back in my pocket.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1560, 250, 200, 200),
            this.addImage('crypticTokenShining', 1, 1620, 400, 260, 260),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `You-`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `You atacked ${this.valdorin}, and also ${this.galadon} back in ${this.verdant} ${this.vine}.`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.questionMark}`,
            `Indeed, I did.`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1560, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `You're going to pay for what you did! Who are you!?`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.questionMark}`,
            `I'm ${this.elyvorg}.`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1560, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.elyvorg}`,
            `Nothing you do is going to stop what's coming. All your efforts in trying to stop me will be in vain.`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1560, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I'll stop y-`,
            this.addImage(this.setfiredogAngry2(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogHeadache(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `(Ugh... it's happening again... it feels unbelievably strong this time..)`,
            this.addImage(this.setfiredogHeadache(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `(Relax..)`,
            this.addImage(this.setfiredogHeadache(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `(Okay.. I think it went away..)`,
            this.addImage(this.setfiredogTired(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `I can't let you leave with what you stole. It all ends here.`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.elyvorg}`,
            `You're confident, but that only takes you so far.`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1560, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.elyvorg}`,
            `Show me what you've got.`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1560, 400, 200, 200),
        );
    }
}

export class Map6ElyvorgIngameCutsceneAfterFight extends FilterCleanDialogue {
    constructor(game) {
        super(game);
        this.game.elyvorgRunAway = true;
        this.addDialogue( //0
            `${this.elyvorg}`,
            `You're strong.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `How do you know my fireball ability? How is this possible?`,
            this.addImage(this.setfiredogNormal(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //2
            `${this.elyvorg}`,
            `You're the other survivor, interesting.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `What are you talking about?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.elyvorg}`,
            `Why don't you join me ${this.firedog}?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `What... how do you know my name!? And why would I join you!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.elyvorg}`,
            `We're not different from each other. You get those voices too don't you?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `What!? How do you know about that?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.elyvorg}`,
            `It's because of ${this.valdorin}. He used you, and he used me.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.elyvorg}`,
            `You see, ${this.valdorin} inserted the ${this.cryptic} ${this.token} inside of our hearts.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `What!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.elyvorg}`,
            `Yes. His secret. The ${this.project} ${this.cryptoterra} ${this.genesis}.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `The ${this.project} ${this.cryptoterra} ${this.genesis}? What is that?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.elyvorg}`,
            `It's a project dedicated to use children as experiments. Experiments in order to create the ultimate weapon of mass destruction.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.elyvorg}`,
            `You and I are nothing but lucky numbers that ended up surviving.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.elyvorg}`,
            `And this is the reason why we both share the same fireball ability.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.elyvorg}`,
            `Because we are both connected to the ${this.cryptic} ${this.token}. The token that gave me and you these powers.`,
            this.addImage(this.setfiredogNormal(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `What... I can't believe this...`,
            this.addImage(this.setfiredogSad(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Why do I get these voices?`,
            this.addImage(this.setfiredogSad(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.elyvorg}`,
            `You get them because... there are still fragments of the ${this.cryptic} ${this.token} inside of you.`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `What!? How can this be possible...`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //21
            `${this.elyvorg}`,
            `The surgeons that removed the token from our hearts thought they had removed it all completely.`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //22
            `${this.elyvorg}`,
            `But they failed to account for some small fragments that got stuck in our hearts.`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //23
            `${this.elyvorg}`,
            `The ${this.cryptic} ${this.token} itself doesn't look like it has any cracks because it molds itself into it's perfect shape.`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //24
            `${this.elyvorg}`,
            `This is why they have never noticed a small part of it was gone.`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //25
            `${this.elyvorg}`,
            `Not even ${this.valdorin} has a clue about this. He doesn't know anything about the ${this.cryptic} ${this.token}.`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //26
            `${this.elyvorg}`,
            `You see, this token isn't just an inanimate object.`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1100, 400, 200, 200),
            this.addImage('crypticTokenShining', 1, 800, 400, 260, 260),
        );
        this.addDialogue( //27
            `${this.elyvorg}`,
            `No... inside here holds the spirits and souls of all that came before the world and what will come after it.`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1100, 400, 200, 200),
            this.addImage('crypticTokenShining', 1, 800, 400, 260, 260),
        );
        this.addDialogue( //28
            `${this.elyvorg}`,
            `And as long as it's separated from the stone, it will soundlessly scream for it.`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1100, 400, 200, 200),
            this.addImage('crypticTokenShining', 1, 800, 400, 260, 260),
        );
        this.addDialogue( //29
            `${this.elyvorg}`,
            `Because a part of the ${this.cryptic} ${this.token} is inside of you... you are able to hear those voices.`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1100, 400, 200, 200),
            this.addImage('crypticTokenShining', 1, 800, 400, 260, 260),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `I can't believe this... So it's true... ${this.valdorin}, why...`,
            this.addImage(this.setfiredogCry(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `${this.quilzorin}... does she know...`,
            this.addImage(this.setfiredogCry(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //32
            `${this.elyvorg}`,
            `${this.quilzorin} is his right arm, of course she knows.`,
            this.addImage(this.setfiredogCry(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `How could they do this to me...`,
            this.addImage(this.setfiredogSad(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //34
            `${this.elyvorg}`,
            `So, ${this.firedog}. Will you join me, for world without corruption and suffering. For a world of true peace?`,
            this.addImage(this.setfiredogSad(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `... ... ...`,
            this.addImage(this.setfiredogSad(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `No... What they did to us is wrong, but what you're doing is worse...`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `Innocent lives will die... that's just not right. You need to stop.`,
            this.addImage(this.setfiredogAngry(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //38
            `${this.elyvorg}`,
            `Very well then. I see you've made up your mind.`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //39
            `${this.elyvorg}`,
            `Once I find the ${this.temporal} ${this.timber}, the world shall come to an end, and you ${this.firedog}, will die a sacrifice.`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //40
            `${this.elyvorg}`,
            `There is no point in meaningless fights. I'm just delaying the inevitable.`,
            this.addImage(this.setfiredogAngry(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `Uh? I'm not letting you run away, no!`,
            this.addImage(this.setfiredogAngry2(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
    }
}
