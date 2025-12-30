import { FloatingMessage } from "../animations/floatingMessages.js";
import { Cutscene } from "./cutscene.js";

export class PenguiniCutscene extends Cutscene {
    constructor(game) {
        super(game);
        this.game.talkToPenguinOneTimeOnly = false;
    }

    enterOrLeftClick() {
        this.isEnterPressed = true;
        this.playSound2OnDotPause = false;

        const cashOutDialogue = this.dialogue[this.dialogueIndex];
        if (cashOutDialogue.dialogue.includes("That's good enough, give me that!") && this.lastSound2Played) {
            this.game.audioHandler.cutsceneSFX.playSound('cashOut');
            this.game.coins -= this.game.winningCoins;
            this.game.floatingMessages.push(
                new FloatingMessage(
                    '-' + this.game.winningCoins,
                    150,
                    50,
                    this.game.penguini.x + 75,
                    this.game.penguini.y + 40,
                    40,
                    'green'
                )
            );
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
            this.game.endCutscene();
            this.game.talkToPenguin = false;
            this.game.cutscenes = [];
            if (this.game.notEnoughCoins) {
                setTimeout(() => {
                    this.game.currentMenu = this.game.menu.gameOver;
                }, 20);
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

    displayDialogue() {
        this.handleKeyDown = (event) => {
            if (!this.game.menu.pause.isPaused && this.game.currentMenu !== this.game.menu.ingameAudioSettings) {
                this.coinCheckIndex = this.dialogue.findIndex(dialogue => dialogue.dialogue.includes("It seems you have"));

                if (
                    event.key === 'Tab' &&
                    this.game.enterDuringBackgroundTransition &&
                    !this.isEnterPressed &&
                    this.dialogueIndex < this.coinCheckIndex
                ) {
                    this.transitionWithBg(
                        200,
                        300,
                        200,
                        null,
                        400,
                        () => {
                            this.stopAllAudio();
                            this.game.audioHandler.cutsceneDialogue.playSound('bit1', false, true, true);
                        },
                        () => {
                            this.dialogueIndex = this.coinCheckIndex;
                            this.textIndex = 0;
                            this.lastSound2Played = false;
                            const currentDialogue = this.dialogue[this.dialogueIndex];
                            const prefullWords = this.splitDialogueIntoWords(currentDialogue.dialogue);
                            this.fullWordsColor = [];
                            this.fullWordsColor = prefullWords;
                        }
                    );
                }

                if (event.key === 'Enter' && !this.isEnterPressed && this.game.enterDuringBackgroundTransition) {
                    this.enterOrLeftClick();
                }
            }
        };

        this.handleLeftClick = (event) => {
            if (
                !this.isEnterPressed &&
                this.game.enterDuringBackgroundTransition &&
                !this.game.menu.pause.isPaused &&
                this.game.currentMenu !== this.game.menu.ingameAudioSettings
            ) {
                this.enterOrLeftClick();
            }
        };

        super.displayDialogue();
    }
}

// Map 1 Penguini Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map1PenguinIngameCutscene extends PenguiniCutscene {
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
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //2
            `${this.threeDots}`,
            `Enemy? I am ${this.penguini}, gatekeeper of the cabins.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //3
            `${this.penguini}`,
            `And don't worry about the bat... ya' fool.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Gatekeeper of the cabins? That's amazing, so I'll be safe as I rest in that warm cabin... Sounds good to me!`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `... ... Why are you not letting me through?`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.penguini}`,
            `Do you think this is charity work ya' fool? Pay up or leave.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `WHA? Can you just let me through this time ${this.penguini}, it's my first time here...`,
            this.addImage(this.setfiredogSadBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `I don't do no discounts fool.`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText}.`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Wha! No discounts at all please?`,
            this.addImage(this.setfiredogCryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `No! Let me see your pockets!`,
            this.addImage(this.setfiredogCryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
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
            this.addImage(this.setfiredogAngry2Border(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `I don't do negotiations with dogs ya' fool.`,
            this.addImage(this.setfiredogAngry2Border(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `I don't do negotiations with fat penguins...  ... ya' fool...`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `Do you want to sleep outside tonight?`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Sorry... I'll just... go inside... I guess...`,
            this.addImage(this.setfiredogHeadacheBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `Get in ya' fool!`,
            this.addImage(this.setfiredogTiredBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
    }
}
// Map 2 Penguini Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map2PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.firedog}`,
            `Wow!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 1, 100, 400, 200, 200),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `It's you again ${this.penguini}!? Weren't you just in ${this.lunarMoonlitGlade}?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 1, 100, 400, 200, 200),
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `You met my brother ${this.penguini} ya' fool.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Your brother? Who are you then?`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `I'm ${this.penguini} ya' fool! Me and my brothers are the gatekeepers of all cabins around every land ya' fool!`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `Are you gonna pay up or stand there, ${this.firedog}, ya' fool!`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `What!? How do you know my name?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.penguini}`,
            `Me and my brothers communicate telepathically ya' fool!`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Well... I'm not even going to ask how that's possible...`,
            this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `Anyways, you already know the drill, pay up, or leave, ya' fool!`,
            this.addImage(this.setfiredogPhewBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} in my pocket this time fool!`,
            this.addImage(this.setfiredogPhewBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `What!? That's more expensive than my last trip!`,
            this.addImage(this.setfiredogCryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.penguini}`,
            `You're in a more dangerous area, if you don't like it you can leave ya' fool!`,
            this.addImage(this.setfiredogCryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Well... it doesn't seem like I have much of a choice anyways. This is how much I have.`,
            this.addImage(this.setfiredogCryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
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
            this.addImage(this.setfiredogCryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `You're lucky I didn't charge you more ya' fool!`,
            this.addImage(this.setfiredogCryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 1, 1400, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `You...`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1400, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `Now get in before I hit you with this bat!`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
        );
    }
}
// Map 3 Penguini Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map3PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.firedog}`,
            `Wow! Is that a submarine!?`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `${this.penguini}, I thought you were the gatekeeper of cabins, not... freaking submarines!?`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `How is this possible?`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //3
            `${this.penguini}`,
            `... Don't question our business model.`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `Anyways, you're breathing underwater... I see... so you managed to find ${this.zephyrion} ya' fool!`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `I don't usually see dogs in here. That's a first time ya' fool! Haha!`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Well, thanks for that...`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Wait... so your brother told me that you guys and ${this.zephyrion} used to do business together!?`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `I see... so he was casting the spell for random explorers to breathe underwater and once they reached you, you just collect their money!`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `And then you split the profits with ${this.zephyrion}, am I right ${this.penguini}!?`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.penguini}`,
            `Wha- How did you...`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `Enough of this conversation!`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.penguini}`,
            `Let's get to business, aquatic dog!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for you to get a trip inside this beast of a sub!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
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
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `Thank you ${this.penguini}. I just have one question... Where are you going to take me exactly?`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `You will find out soon enough ya' fool! Now go before you choke on this water!`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `You're right, I can feel that the spell is about to end!`,
            this.addImage(this.setfiredogHeadacheBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatLaughBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Okay, let's get inside that submarine quickly!`,
            this.addImage(this.setfiredogTiredBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinBatTalkNormalBorder', 0.7, 1200, 400, 200, 200),
        );
    }
}
// Map 4 Penguini Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map4PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.firedog}`,
            `Hey there ${this.penguini}!`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Wait... WOW! When did you get that rifle ${this.penguini}!? I thought you had a bat!`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `Haha, oh this? Don't worry about how I get my things around these streets! Let's just say I got this through.. legal ways.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Whatever that means... well I'm glad to see you here I guess...`,
            this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `Good to see you too ${this.firedog}! Good to see you're still alive ya' fool!`,
            this.addImage(this.setfiredogPhewBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Wow. That's the nicest you've ever been to me ${this.penguini}!`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.penguini}`,
            `Nice? That was sarcasm ya' fool!`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.penguini}`,
            `Now let's get to business!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for you to stay in this verdant cabin!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
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
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Thank you ${this.penguini}!`,
            this.addImage(this.setfiredogHappyBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `Oh and by the way, your friend is inside. I'm surprised that fool managed to get here from how bad he looked!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `Good thing he had some spare money.. because I would not let that one slide otherwise ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `My friend? Wait... Do you mean ${this.galadon}!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.penguini}`,
            `That's right ya' fool! He asked for you, I told him you were in the submarine not long ago!`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `Wait how did you know I was in the sub-`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `(Oh right, nevermind... I forgot ${this.penguini} and his brothers somehow magically can communicate telepathically.)`,
            { whisper: true },
            this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `Stop yapping and go inside before your friend dies ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Going now, thanks for letting me know..`,
            this.addImage(this.setfiredogNormalBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Alright, let's go.`,
            this.addImage(this.setfiredogNormalBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
    }
}
// Map 5 Penguini Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map5PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.firedog}`,
            `Of course it stops raining when I'm near the cabin..`,
            this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Hello ${this.penguini}!`,
            this.addImage(this.setfiredogHappyBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `Oh hello ${this.firedog}! You look completely drenched from the rain!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //3
            `${this.penguini}`,
            `Hahahaha!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Yeah... thanks for mocking me ${this.penguini}! Not funny!`,
            this.addImage(this.setfiredogAngry2Border(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `You seem to be in a wild rush to go somewhere.. From ${this.lunarMoonlitGlade} to here in just some days!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.penguini}`,
            `What's the rush for ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Wha-`,
            this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `(I shouldn't tell ${this.penguini} why I'm in a rush...)`,
            { whisper: true },
            this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `Haha, not that I mind! This is good for business ya' fool!`,
            this.addImage(this.setfiredogPhewBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Is the business all you care about ${this.penguini}?`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `I stay tight in business with my brothers. If you got a problem you can leave ya' fool!`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I never said I had a problem! Why are you always so abrasive!`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `Don't hate the player hate the game ya' fool! Now let's talk real business.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for you to stay in this summery cabin!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `You're lucky it isn't raining right now, or you would've been charged twice as much ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wait... why would you charge twice the usual price just because it's raining...?`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `...`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Anyways, let me see your pockets ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
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
            this.addImage(this.setfiredogNormalBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //22
            `${this.penguini}`,
            `Before you get in ${this.firedog}, can I ask which way you're going when you leave?`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Huh? Well I'm going towards ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormalBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //24
            `${this.penguini}`,
            `You know, from all my years of being in this tight business with my brothers, I've seen people go towards ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //25
            `${this.penguini}`,
            `And they never came back. There are constant erruptions in there.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //26
            `${this.penguini}`,
            `Although my brothers and I also have businesses guarding the many hundreds of caves there, you should think twice.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //27
            `${this.penguini}`,
            `I mean... it's not that I care if you die ya' fool! But since we've been profiting off of you for the last couple of days...`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunLaughBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //28
            `${this.penguini}`,
            `It wouldn't be good for business if you... died!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `Haha, ${this.penguini}, you do care about me don't you!`,
            this.addImage(this.setfiredogLaughBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //30
            `${this.penguini}`,
            `No I don't ya' fool. I shouldn't have said anything. Ugh! Shut up and get inside!`,
            this.addImage(this.setfiredogLaughBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Thanks for the warning, I appreciate it!`,
            this.addImage(this.setfiredogHappyBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //32
            `${this.penguini}`,
            `No worries ya' fool!`,
            this.addImage(this.setfiredogHappyBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
    }
}

// Map 6 Penguini Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map6PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.firedog}`,
            `Of course it stops raining when I'm near the cabin..`,
            this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Hello ${this.penguini}!`,
            this.addImage(this.setfiredogHappyBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `I stay tight in business with my brothers. If you got a problem you can leave ya' fool!`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I never said I had a problem! Why are you always so abrasive!`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `Don't hate the player hate the game ya' fool! Now let's talk real business.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for you to stay in this summery cabin!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `You're lucky it isn't raining right now, or you would've been charged twice as much ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wait... why would you charge twice the usual price just because it's raining...?`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `...`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Anyways, let me see your pockets ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
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
            this.addImage(this.setfiredogNormalBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //22
            `${this.penguini}`,
            `Before you get in ${this.firedog}, can I ask which way you're going when you leave?`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //32
            `${this.penguini}`,
            `No worries ya' fool!`,
            this.addImage(this.setfiredogHappyBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
    }
}

// Map 6 Penguini Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map7PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);
        this.game.notEnoughCoins = false;
        this.addDialogue( //1
            `${this.firedog}`,
            `${this.penguini}!? Oh no.. What happened!?`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `You look badly hurt! Are you okay?`,
            this.addImage(this.setfiredogCryBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //3
            `${this.penguini}`,
            `A dark hooded figure knocked me out ya' fool...`,
            this.addImage(this.setfiredogCryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `He went through this cave without paying...`,
            this.addImage(this.setfiredogCryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `I couldn't even stop him... he attacked me before I could pull the trigger...`,
            this.addImage(this.setfiredogCryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Damn it ${this.elyvorg}...`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `I need to stop ${this.elyvorg}. He is the one who attacked you.`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `Please go ahead ya' fool, I'll be fine.. I've already warned telepathically my brothers about the situation, they'll come to my rescue shortly.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `Stop him, make that fool pay for what he did to me.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 1, 1200, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `I promise I will ${this.penguini}.`,
            this.addImage(this.setfiredogAngry2Border(), 1, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `(${this.elyvorg}, I'm going to make you regret this.)`,
            { whisper: true },
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 0.7, 1200, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I'm going inside now.`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinOnFloorBorder', 0.7, 1200, 400, 200, 200),
        );
    }
}

export class BonusMap1PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.firedog}`,
            `Of course it stops raining when I'm near the cabin..`,
            this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Hello ${this.penguini}!`,
            this.addImage(this.setfiredogHappyBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `I stay tight in business with my brothers. If you got a problem you can leave ya' fool!`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I never said I had a problem! Why are you always so abrasive!`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `Don't hate the player hate the game ya' fool! Now let's talk real business.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for you to stay in this summery cabin!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `You're lucky it isn't raining right now, or you would've been charged twice as much ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wait... why would you charge twice the usual price just because it's raining...?`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `...`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Anyways, let me see your pockets ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
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
            this.addImage(this.setfiredogNormalBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //22
            `${this.penguini}`,
            `Before you get in ${this.firedog}, can I ask which way you're going when you leave?`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //32
            `${this.penguini}`,
            `No worries ya' fool!`,
            this.addImage(this.setfiredogHappyBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
    }
}

export class BonusMap2PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.firedog}`,
            `Of course it stops raining when I'm near the cabin..`,
            this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Hello ${this.penguini}!`,
            this.addImage(this.setfiredogHappyBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `I stay tight in business with my brothers. If you got a problem you can leave ya' fool!`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I never said I had a problem! Why are you always so abrasive!`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `Don't hate the player hate the game ya' fool! Now let's talk real business.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for you to stay in this summery cabin!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `You're lucky it isn't raining right now, or you would've been charged twice as much ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wait... why would you charge twice the usual price just because it's raining...?`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `...`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Anyways, let me see your pockets ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
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
            this.addImage(this.setfiredogNormalBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //22
            `${this.penguini}`,
            `Before you get in ${this.firedog}, can I ask which way you're going when you leave?`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
    }
}

export class BonusMap3PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);
        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        this.addDialogue( //0
            `${this.firedog}`,
            `Of course it stops raining when I'm near the cabin..`,
            this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Hello ${this.penguini}!`,
            this.addImage(this.setfiredogHappyBorder(), 1, 100, 400, 200, 200)
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `I stay tight in business with my brothers. If you got a problem you can leave ya' fool!`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I never said I had a problem! Why are you always so abrasive!`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `Don't hate the player hate the game ya' fool! Now let's talk real business.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for you to stay in this summery cabin!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `You're lucky it isn't raining right now, or you would've been charged twice as much ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wait... why would you charge twice the usual price just because it's raining...?`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `...`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Anyways, let me see your pockets ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
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
            this.addImage(this.setfiredogNormalBorder(), 1, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 0.7, 1430, 400, 200, 200),
        );
        this.addDialogue( //22
            `${this.penguini}`,
            `Before you get in ${this.firedog}, can I ask which way you're going when you leave?`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('penguinGunTalkNormalBorder', 1, 1430, 400, 200, 200),
        );
    }
}

// coin condition penguini dialogues
export class CoinDialogueConditionCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);
    }

    makeEnoughCoinsDialogue(mapId, firedogX = 100, penguinX = 1400) {
        const penguinLaughByMap = {
            Map1: 'penguinBatLaughBorder',
            Map2: 'penguinBatLaughBorder',
            Map3: 'penguinBatLaughBorder',
            Map4: 'penguinGunLaughBorder',
            Map5: 'penguinGunLaughBorder',
            Map6: 'penguinGunLaughBorder',
            BonusMap1: 'penguinGunLaughBorder',
            BonusMap2: 'penguinGunLaughBorder',
            BonusMap3: 'penguinGunLaughBorder',
        };

        return {
            character: this.penguini,
            dialogue: `That's good enough, give me that!`,
            images: [
                this.addImage(this.setfiredogNormalBorder(), 0.7, firedogX, 400, 200, 200),
                this.addImage(penguinLaughByMap[mapId] || 'penguinBatLaughBorder', 1, penguinX, 400, 200, 200),
            ],
        };
    }

    checkPlayerCoins() {
        const mapId = this.getCurrentMapId();
        const notEnough = this.game.coins < this.game.winningCoins;
        const newDialogues = [];

        switch (mapId) {
            case 'Map1':
                if (notEnough) {
                    this.game.notEnoughCoins = true;
                    newDialogues.push(
                        {
                            character: this.penguini,
                            dialogue: `That doesn't even cover my rent!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again..`,
                            images: [
                                this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
                                this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
                            ],
                        }
                    );
                } else {
                    newDialogues.push(this.makeEnoughCoinsDialogue(mapId, 100, 1400));
                }
                break;

            case 'Map2':
                if (notEnough) {
                    this.game.notEnoughCoins = true;
                    newDialogues.push(
                        {
                            character: this.penguini,
                            dialogue: `That doesn't even cover half my rent!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `You're sleeping outside tonight with the ghosts ya' fool!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinBatUpBorder', 1, 1400, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again..`,
                            images: [
                                this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
                                this.addImage('penguinBatUpBorder', 0.7, 1400, 400, 200, 200),
                            ],
                        }
                    );
                } else {
                    newDialogues.push(this.makeEnoughCoinsDialogue(mapId, 100, 1400));
                }
                break;

            case 'Map3':
                if (notEnough) {
                    this.game.notEnoughCoins = true;
                    newDialogues.push(
                        {
                            character: this.penguini,
                            dialogue: `That doesn't even cover half of my uranium submarine fuel!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `You're not going inside of this submarine.`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinBatUpBorder', 1, 1200, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again..`,
                            images: [
                                this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
                                this.addImage('penguinBatUpBorder', 0.7, 1200, 400, 200, 200),
                            ],
                        }
                    );
                } else {
                    newDialogues.push(this.makeEnoughCoinsDialogue(mapId, 100, 1200));
                }
                break;

            case 'Map4':
                if (notEnough) {
                    this.game.notEnoughCoins = true;
                    newDialogues.push(
                        {
                            character: this.penguini,
                            dialogue: `That doesn't even cover enough to water the verdant plants of this land!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `If you want to get inside you're gonna need to try harder than that ya' fool!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again..`,
                            images: [
                                this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
                            ],
                        }
                    );
                } else {
                    newDialogues.push(this.makeEnoughCoinsDialogue(mapId, 100, 1430));
                }
                break;

            case 'Map5':
                if (notEnough) {
                    this.game.notEnoughCoins = true;
                    newDialogues.push(
                        {
                            character: this.penguini,
                            dialogue: `That doesn't even cover half my rent! If I accepted those pennies my business would go bankrupt!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `You're going to stay outside. I don't care if it rains on you!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again..`,
                            images: [
                                this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
                            ],
                        }
                    );
                } else {
                    newDialogues.push(this.makeEnoughCoinsDialogue(mapId, 100, 1430));
                }
                break;

            case 'Map6':
                if (notEnough) {
                    this.game.notEnoughCoins = true;
                    newDialogues.push(
                        {
                            character: this.penguini,
                            dialogue: `That doesn't even cover half my rent! If I accepted those pennies my business would go bankrupt!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `You're going to stay outside. I don't care if it rains on you!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again..`,
                            images: [
                                this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
                            ],
                        }
                    );
                } else {
                    newDialogues.push(this.makeEnoughCoinsDialogue(mapId, 100, 1430));
                }
                break;

            case 'BonusMap1':
                if (notEnough) {
                    this.game.notEnoughCoins = true;
                    newDialogues.push(
                        {
                            character: this.penguini,
                            dialogue: `That doesn't even cover half my rent! If I accepted those pennies my business would go bankrupt!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `You're going to stay outside. I don't care if it rains on you!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again..`,
                            images: [
                                this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
                            ],
                        }
                    );
                } else {
                    newDialogues.push(this.makeEnoughCoinsDialogue(mapId, 100, 1430));
                }
                break;

            case 'BonusMap2':
                if (notEnough) {
                    this.game.notEnoughCoins = true;
                    newDialogues.push(
                        {
                            character: this.penguini,
                            dialogue: `That doesn't even cover half my rent! If I accepted those pennies my business would go bankrupt!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `You're going to stay outside. I don't care if it rains on you!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again..`,
                            images: [
                                this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
                            ],
                        }
                    );
                } else {
                    newDialogues.push(this.makeEnoughCoinsDialogue(mapId, 100, 1430));
                }
                break;

            case 'BonusMap3':
                if (notEnough) {
                    this.game.notEnoughCoins = true;
                    newDialogues.push(
                        {
                            character: this.penguini,
                            dialogue: `That doesn't even cover half my rent! If I accepted those pennies my business would go bankrupt!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `You're going to stay outside. I don't care if it rains on you!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 1, 1430, 400, 200, 200),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again..`,
                            images: [
                                this.addImage(this.setfiredogPhewBorder(), 1, 100, 400, 200, 200),
                                this.addImage('penguinGunUpBorder', 0.7, 1430, 400, 200, 200),
                            ],
                        }
                    );
                } else {
                    newDialogues.push(this.makeEnoughCoinsDialogue(mapId, 100, 1430));
                }
                break;

            default:
                break;
        }
        return newDialogues;
    }
}
