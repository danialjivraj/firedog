import { FloatingMessage } from "../animations/floatingMessages.js";
import { Cutscene } from "./cutscene.js";

export class PenguiniCutscene extends Cutscene {
    constructor(game) {
        super(game);
        this.game.talkToPenguinOneTimeOnly = false;
        this.textBoxBackgroundOpacity = 0.55;
    }

    enterOrLeftClick() {
        this.runCurrentDialogueAdvanceActionIfAny();

        this.isEnterPressed = true;
        this.playSound2OnDotPause = false;

        const cashOutDialogue = this.dialogue[this.dialogueIndex];
        if (cashOutDialogue.dialogue.includes("That's good enough, give me that!") && this.lastSound2Played) {
            this.game.audioHandler.cutsceneSFX.playSound("cashOut", false, true);
            this.game.coins -= this.game.winningCoins;
            this.game.floatingMessages.push(
                new FloatingMessage("-" + this.game.winningCoins, 150, 50, { fontSize: 40, textColor: 'green', targetX: this.game.penguini.x, targetY: this.game.penguini.y + 40, easing: 'easeOut' })
            );
        }

        if (cashOutDialogue.dialogue.includes("I'll be taking those extra coins too.") && this.lastSound2Played) {
            this.game.audioHandler.cutsceneSFX.playSound("cashOut", false, true);
            this.game.coins -= this.game.surplusCoins;
            this.game.floatingMessages.push(
                new FloatingMessage("-" + this.game.surplusCoins, 150, 50, { fontSize: 40, textColor: 'green', targetX: this.game.penguini.x, targetY: this.game.penguini.y + 40, easing: 'easeOut' })
            );
        }

        const dlg = this.dialogue[this.dialogueIndex].dialogue;

        if (this.continueDialogue) {
            this.pause = false;
            this.textIndex++;
            this.continueDialogue = false;

        } else if (this.textIndex < dlg.length) {
            const dotIndices = this.getDotIndices(dlg);
            const nextDotIndex = dotIndices.find(index => index > this.textIndex);

            if (nextDotIndex !== undefined) {
                this.textIndex = this.ellipsisFollowedOnlyByTerminalPunct(dlg, nextDotIndex)
                    ? dlg.length
                    : nextDotIndex;
            } else {
                this.textIndex = dlg.length;
            }

        } else if (this.dialogueIndex < this.dialogue.length - 1) {
            this.jumpToDialogue(this.dialogueIndex + 1);

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
            if (!this.game.menu.pause.isPaused && this.game.currentMenu !== this.game.menu.audioSettings) {
                this.coinCheckIndex = this.dialogue.findIndex(d => d.dialogue.includes("It seems you have"));

                if (
                    event.key === "Tab" &&
                    this.game.enterDuringBackgroundTransition &&
                    !this.isEnterPressed &&
                    this.dialogueIndex < this.coinCheckIndex
                ) {
                    this.transitionWithBg({
                        fadeIn: 200, blackDuration: 300, fadeOut: 200,
                        beforeFade: () => {
                            this.stopAllAudio();
                            this.game.audioHandler.cutsceneDialogue.stopSound("bit1");
                        },
                        onBlack: () => {
                            this.jumpToDialogue(this.coinCheckIndex);
                        },
                    });
                }

                if (event.key === "Enter" && !this.isEnterPressed && this.game.enterDuringBackgroundTransition) {
                    this.enterOrLeftClick();
                }
            }
        };

        this.handleLeftClick = () => {
            if (
                !this.isEnterPressed &&
                this.game.enterDuringBackgroundTransition &&
                !this.game.menu.pause.isPaused &&
                this.game.currentMenu !== this.game.menu.audioSettings
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

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const PENGUIN = { x: 1400, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.threeDots}`,
            `Stop right there! You shall not pass beyond this point or I will not hesitate but to use my most ferocious attacks on you.`,
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );

        this.addDialogue( //1
            `${this.firedog}`,
            `Wha!? Who are you!? An enemy!? Why do you have a bat!?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatUpBorder', PENGUIN),
        );

        this.addDialogue( //2
            `${this.threeDots}`,
            `Enemy? I am ${this.penguini}, gatekeeper of the cabins.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
        );

        this.addDialogue( //3
            `${this.penguini}`,
            `And don't worry about the bat... ya' fool.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
        );

        this.addDialogue( //4
            `${this.firedog}`,
            `Gatekeeper of the cabins? That's amazing, so I'll be safe as I rest in that warm cabin... Sounds good to me!`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN),
        );

        this.addDialogue( //5
            `${this.firedog}`,
            `... ... Why are you not letting me through?`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN),
        );

        this.addDialogue( //6
            `${this.penguini}`,
            `Do you think this is charity work ya' fool? Pay up or leave.`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );

        this.addDialogue( //7
            `${this.firedog}`,
            `What!? Can you just let me through this time ${this.penguini}, it's my first time here...`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatUpBorder', PENGUIN),
        );

        this.addDialogue( //8
            `${this.penguini}`,
            `I don't do no discounts fool.`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );

        this.addDialogue( //9
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText}.`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
        );

        this.addDialogue( //10
            `${this.firedog}`,
            `Wha! No discounts at all please?`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN),
        );

        this.addDialogue( //11
            `${this.penguini}`,
            `No! Let me see your pockets!`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );

        this.addDialogue( //12
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(d => {
            this.addDialogue(d.character, d.dialogue, ...d.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        this.addDialogue( //13
            `${this.firedog}`,
            `Wha- you... you just took my money like that ${this.penguini}!? I was trying to negotiate.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatLaughBorder', PENGUIN),
        );

        this.addDialogue( //14
            `${this.penguini}`,
            `I don't do negotiations with dogs ya' fool.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('penguiniBatLaughBorder', PENGUIN, { talking: true }),
        );

        this.addDialogue( //15
            `${this.firedog}`,
            `I don't do negotiations with fat penguins...  ... ya' fool...`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatLaughBorder', PENGUIN),
        );

        this.addDialogue( //16
            `${this.penguini}`,
            `Do you want to sleep outside tonight?`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );

        this.addDialogue( //17
            `${this.firedog}`,
            `Sorry... I'll just... go inside... I guess...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatUpBorder', PENGUIN),
        );

        this.addDialogue( //18
            `${this.penguini}`,
            `Get in ya' fool!`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
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

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const PENGUIN = { x: 1400, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Wow!?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `It's you again ${this.penguini}!? Weren't you just in ${this.lunarGlade}?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `You met my brother ${this.penguini} ya' fool.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Your brother? Who are you then?`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `I'm ${this.penguini} ya' fool! Me and my brothers are the gatekeepers of all cabins around every land ya' fool!`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `Are you gonna pay up or stand there, ${this.firedog}, ya' fool!`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `What!? How do you know my name?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatUpBorder', PENGUIN),
        );
        this.addDialogue( //7
            `${this.penguini}`,
            `Me and my brothers communicate telepathically ya' fool!`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Well... I'm not even going to ask how that's possible...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatUpBorder', PENGUIN),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `Anyways, you already know the drill, pay up, or leave, ya' fool!`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //10
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for you to stay in this haunted cabin!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `What!? That's more expensive than my last trip!`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //12
            `${this.penguini}`,
            `You're in a more dangerous area, if you don't like it you can leave ya' fool!`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Well... it doesn't seem like I have much of a choice anyways. This is how much I have.`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatUpBorder', PENGUIN),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(d => {
            this.addDialogue(d.character, d.dialogue, ...d.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        // rest of the dialogue
        this.addDialogue( //15
            `${this.firedog}`,
            `Ugh... all of that just to be broke again...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //16
            `${this.penguini}`,
            `You're lucky I didn't charge you more ya' fool!`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniBatLaughBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `You...`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Now get in before I hit you with this bat!`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
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

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const PENGUIN = { x: 1265, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Wow! Is that a submarine!?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `${this.penguini}, I thought you were the gatekeeper of cabins, not... freaking submarines!?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `How is this possible?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //3
            `${this.penguini}`,
            `... Don't question our business model.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `Anyways, you're breathing underwater... I see... so you managed to find ${this.zephyrion} ya' fool!`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `I don't usually see dogs in here. That's a first for me ya' fool! Haha!`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('penguiniBatLaughBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Well, thanks for that...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatLaughBorder', PENGUIN),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Wait... so your brother told me that you guys and ${this.zephyrion} used to do business together!?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `I see... so he was casting the spell for random explorers to breathe underwater and once they reached you, you just collect their money!`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `And then you split the profits with ${this.zephyrion}, am I right ${this.penguini}!?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //10
            `${this.penguini}`,
            `Wha- How did you...`,
            this.addImage(this.setfiredogHappyBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `Enough of this conversation!`,
            this.addImage(this.setfiredogHappyBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //12
            `${this.penguini}`,
            `Let's get to business, aquatic dog!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniBatUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for a trip inside this beast of a sub!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(d => {
            this.addDialogue(d.character, d.dialogue, ...d.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        // rest of the dialogue
        this.addDialogue( //15
            `${this.penguini}`,
            `You can go inside now.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Thank you ${this.penguini}. I just have one question... Where are you going to take me exactly?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `You will find out soon enough ya' fool! Now go before you choke on this water!`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('penguiniBatLaughBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `You're right, I can feel that the spell is about to end!`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatLaughBorder', PENGUIN),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Okay, let's get inside that submarine quickly!`,
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniBatTalkNormalBorder', PENGUIN),
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

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const PENGUIN = { x: 1430, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Hey there ${this.penguini}!`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Wait... WOW! When did you get that rifle ${this.penguini}!? I thought you had a bat!`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `Haha, oh this? Don't worry about how I get my things around these streets! Let's just say I got this through.. legal ways.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Whatever that means... well I'm glad to see you here I guess...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `Good to see you too ${this.firedog}! Good to see you're still alive ya' fool!`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniGunLaughBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Wow. That's the nicest you've ever been to me ${this.penguini}!`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunLaughBorder', PENGUIN),
        );
        this.addDialogue( //6
            `${this.penguini}`,
            `Nice? That was sarcasm ya' fool!`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //7
            `${this.penguini}`,
            `Now let's get to business!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for you to stay in this verdant cabin!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(d => {
            this.addDialogue(d.character, d.dialogue, ...d.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        // rest of the dialogue
        this.addDialogue( //10
            `${this.penguini}`,
            `You can go ahead.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `Thank you ${this.penguini}!`,
            this.addImage(this.setfiredogHappyBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //12
            `${this.penguini}`,
            `Oh and by the way, your friend is inside. I'm surprised that fool managed to get here from how bad he looked!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `Good thing he had some spare money.. because I would not let that one slide otherwise ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunLaughBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `My friend? Wait... Do you mean ${this.galadon}!?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunLaughBorder', PENGUIN),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `That's right ya' fool! He asked for you, I told him you were in the submarine not long ago!`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wait how did you know I was in the sub-`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `(Oh right, nevermind... I forgot ${this.penguini} and his brothers somehow magically can communicate telepathically.)`,
            { whisper: true },
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Stop yapping and go inside before your friend dies ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Going now, thanks for letting me know...`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Alright, let's go.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
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

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const PENGUIN = { x: 1430, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Of course it stops raining when I'm near the cabin..`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Hello ${this.penguini}!`,
            this.addImage(this.setfiredogHappyBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `Oh hello ${this.firedog}! You look completely drenched from the rain!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //3
            `${this.penguini}`,
            `Hahahaha!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunLaughBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Yeah... thanks for mocking me ${this.penguini}! Not funny!`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunLaughBorder', PENGUIN),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `You seem to be in a wild rush to go somewhere.. From ${this.lunarGlade} to here in just some days!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //6
            `${this.penguini}`,
            `What's the rush for ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Wha-`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `(I shouldn't tell ${this.penguini} why I'm in a rush...)`,
            { whisper: true },
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `Haha, not that I mind! This is good for business ya' fool!`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniGunLaughBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Is the business all you care about ${this.penguini}?`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunLaughBorder', PENGUIN),
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `I stay tight in business with my brothers. If you got a problem you can leave ya' fool!`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I never said I had a problem! Why are you always so abrasive!`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunUpBorder', PENGUIN),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `Don't hate the player hate the game ya' fool! Now let's talk real business.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for you to stay in this summery cabin!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `You're lucky it isn't raining right now, or you would've been charged twice as much ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wait... why would you charge twice the usual price just because it's raining...?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `...`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Anyways, let me see your pockets ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(d => {
            this.addDialogue(d.character, d.dialogue, ...d.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        // rest of the dialogue
        this.addDialogue( //20
            `${this.firedog}`,
            `Alright! I'll get inside before it starts raining on me again!`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //21
            `${this.penguini}`,
            `Before you get in ${this.firedog}, can I ask which way you're going when you leave?`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Huh? Well I'm going towards ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //23
            `${this.penguini}`,
            `You know, from all my years of being in this tight business with my brothers, I've seen many go towards ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //24
            `${this.penguini}`,
            `And most never came back. There are constant eruptions in there.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //25
            `${this.penguini}`,
            `Although my brothers and I also have businesses guarding the many hundreds of caves there, you should think twice.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //26
            `${this.penguini}`,
            `But also, you first have to get through the dangerous poisonous lake, ${this.venomveilLake}.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //27
            `${this.penguini}`,
            `Many don't manage to get through the lake due to how poisonous it is.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //28
            `${this.penguini}`,
            `I mean... it's not that I care if you die ya' fool! But since we've been profiting off of you for the last couple of days...`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunLaughBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //29
            `${this.penguini}`,
            `It wouldn't be good for business if you... died!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Haha, ${this.penguini}, you do care about me don't you!`,
            this.addImage(this.setfiredogLaughBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //31
            `${this.penguini}`,
            `No, I don't ya' fool. I shouldn't have said anything. Ugh! Shut up and get inside!`,
            this.addImage(this.setfiredogLaughBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `Thanks for the warning, I appreciate it!`,
            this.addImage(this.setfiredogHappyBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //33
            `${this.penguini}`,
            `No worries ya' fool!`,
            this.addImage(this.setfiredogHappyBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
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

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const PENGUIN = { x: 1430, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Ugh... this place smells toxic.`,
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `And that cabin looks even worse up close... it's covered in poison. Is that supposed to keep me safe, ${this.penguini}?`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `Watch your mouth ya' fool! This is one of the finest poisonous cabins in ${this.venomveilLake}. Of course you'll be safe inside!`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Finest? It looks like it could kill me in my sleep.`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `Maybe it will.`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //6
            `${this.penguini}`,
            `...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //7
            `${this.penguini}`,
            `Now then, let's get to business.`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(d => {
            this.addDialogue(d.character, d.dialogue, ...d.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        // rest of the dialogue
        this.addDialogue( //9
            `${this.firedog}`,
            `There goes my money... just so I can rest in a poison box...`,
            this.addImage(this.setfiredogPhewBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //10
            `${this.penguini}`,
            `Look at it this way. You're paying for survival.`,
            this.addImage(this.setfiredogPhewBorder(), FIREDOG),
            this.addImage('penguiniGunLaughBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `Out there? You choke.`,
            this.addImage(this.setfiredogPhewBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //12
            `${this.penguini}`,
            `Inside this cabin behind me? You might live.`,
            this.addImage(this.setfiredogPhewBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `That is not reassuring...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `Just get inside ya' fool.`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
    }
}

// Map 7 Penguini Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map7PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);

        this.game.notEnoughCoins = false;

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const PENGUIN_FLOOR = { x: 1200, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.firedog}`,
            `${this.penguini}!? Oh no.. What happened!?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `You look badly hurt! Are you okay?`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `A dark hooded figure knocked me out ya' fool...`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG),
            this.addImage('penguiniOnFloorBorder', PENGUIN_FLOOR, { talking: true }),
        );
        this.addDialogue( //3
            `${this.penguini}`,
            `He went through this cave without paying...`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG),
            this.addImage('penguiniOnFloorBorder', PENGUIN_FLOOR, { talking: true }),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `I couldn't even stop him... he attacked me before I could pull the trigger...`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG),
            this.addImage('penguiniOnFloorBorder', PENGUIN_FLOOR, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Damn it ${this.elyvorg}...`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniOnFloorBorder', PENGUIN_FLOOR),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `I need to stop ${this.elyvorg}. He is the one who attacked you.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniOnFloorBorder', PENGUIN_FLOOR),
        );
        this.addDialogue( //7
            `${this.penguini}`,
            `Please go ahead ya' fool, I'll be fine...`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('penguiniOnFloorBorder', PENGUIN_FLOOR, { talking: true }),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `I've already warned my brothers telepathically about the situation, they'll come to my rescue shortly.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('penguiniOnFloorBorder', PENGUIN_FLOOR, { talking: true }),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `Stop him, make that fool pay for what he did to me.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('penguiniOnFloorBorder', PENGUIN_FLOOR, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `I promise I will ${this.penguini}.`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniOnFloorBorder', PENGUIN_FLOOR),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `(${this.elyvorg}, I'm going to make you regret this.)`,
            { whisper: true },
            this.addImage(this.setfiredogAngryBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniOnFloorBorder', PENGUIN_FLOOR),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I'm going inside now.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniOnFloorBorder', PENGUIN_FLOOR),
        );
    }
}

// Bonus Map 1 Penguini Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class BonusMap1PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);

        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const PENGUIN = { x: 1430, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Finally... a cabin.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `This place is freezing...`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `And of course, standing between you and warmth... is me, ya' fool!`,
            this.addImage(this.setfiredogPhewBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `I should've known you'd be here too...`,
            this.addImage(this.setfiredogPhewBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `My brothers and I keep business running in every land. Even this frozen one.`,
            this.addImage(this.setfiredogPhewBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `And let me tell you, business around ${this.iceboundCave} has been rough lately.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //6
            `${this.penguini}`,
            `The winds have gotten worse, the cold bites harder, and fewer travelers come through here now.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Yeah... apparently it was because of ${this.glacikal}.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `${this.glacikal}?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `I heard ${this.glacikal} was nothing but an old legend, ya' fool!`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `That's what I thought at first too, but he was the reason ${this.iceboundCave} has been so chaotic recently.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunUpBorder', PENGUIN),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `${this.glacikal} had been in a deep slumber for centuries.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunUpBorder', PENGUIN),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Apparently someone attacked him while he was asleep.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunUpBorder', PENGUIN),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `And all the chaos that has been happening was because of ${this.glacikal}'s rage.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunUpBorder', PENGUIN),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `Interesting! I'm definitely gonna let my brothers know about this!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `I can't believe the legends are actually true! Haha!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunLaughBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //16
            `${this.penguini}`,
            `Now then, let's talk real business.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for you to stay in this igloo cabin.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Even in weather like this, you still care more about coins than anything else...`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `Of course I do. Cold weather luxury doesn't come free, ya' fool!`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //20
            `${this.penguini}`,
            `Now let me see your pockets.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //21
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(d => {
            this.addDialogue(d.character, d.dialogue, ...d.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        this.addDialogue( //22
            `${this.firedog}`,
            `There goes my money... again...`,
            this.addImage(this.setfiredogPhewBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunLaughBorder', PENGUIN),
        );
        this.addDialogue( //23
            `${this.penguini}`,
            `Look on the bright side, ya' fool. At least you won't turn into a dog-shaped icicle tonight! Hahahaha!`,
            this.addImage(this.setfiredogPhewBorder(), FIREDOG),
            this.addImage('penguiniGunLaughBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `That is somehow the nicest thing you've ever said to me.`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunLaughBorder', PENGUIN),
        );
        this.addDialogue( //25
            `${this.penguini}`,
            `Don't get emotional about it. Just get inside and don't die out here.`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Fine. I'm going in before my paws freeze off.`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
    }
}

// Bonus Map 2 Penguini Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class BonusMap2PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);

        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const PENGUIN = { x: 1430, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Oh... finally a place to rest.`,
            this.addImage(this.setfiredogTiredBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.penguini}`,
            `Hello, ${this.firedog}. Didn't expect to see you here, ya' fool!`,
            this.addImage(this.setfiredogTiredBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `In fact, I didn't expect to see anyone at all. The tremors are affecting my business.`,
            this.addImage(this.setfiredogTiredBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //3
            `${this.penguini}`,
            `Which means... the price will be higher than usual.`,
            this.addImage(this.setfiredogTiredBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Why do I have to pay extra? Please, can't you just give me a little discount, ${this.penguini}? We're friends, no?`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //5
            `${this.penguini}`,
            `Business comes first.`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `It's impossible to haggle with you, isn't it...?`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //7
            `${this.penguini}`,
            `Enough talking. Time to pay up.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `I will need ${this.game.winningCoins} ${this.coinsText} for you to stay in this runic cabin.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `But my hard-earned money...`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //10
            `${this.penguini}`,
            `Quit complaining!`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `Now let me see your pockets.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //12
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(d => {
            this.addDialogue(d.character, d.dialogue, ...d.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        this.addDialogue( //13
            `${this.penguini}`,
            `Pleasure doing business with you, ya' fool!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `Wish I could say the same...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `I guess it's time to go insid-`,
            {
                onAdvance: () => {
                    this.playSFX('tremorSound', true);
                    this.game.startShake();
                },
            },
            this.addImage(this.setfiredogPhewBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wah!`,
            {
                onAdvance: () => {
                    this.fadeOutSFX('tremorSound');
                    this.game.stopShake();
                },
            },
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `The tremors are even worse here...`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Don't let a little tremor scare you. I'm used to this life, ya' fool!`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `I'm not used to this life, ya' fool! It's dangerous out here!`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //20
            `${this.penguini}`,
            `Exactly. I'm sure you understand why I had to charge you extra! That cabin behind me ain't gonna budge against any tremor!`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Ugh... I hope so...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Alright. I'm going inside.`,
            this.addImage(this.setfiredogPhewBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
    }
}

// Bonus Map 3 Penguini Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class BonusMap3PenguinIngameCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);

        this.coinDialogueConditionCutscene = new CoinDialogueConditionCutscene(game);
        const coinConditionDialogues = this.coinDialogueConditionCutscene.checkPlayerCoins();
        this.coinText = this.playerCoins === 1 ? this.coinText : this.coinsText;

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const PENGUIN = { x: 1430, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.firedog}`,
            `No way...`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `How is it possible that you're also here ${this.penguini}?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //2
            `${this.penguini}`,
            `My brothers and I don't just operate across lands. We operate across realities, ya' fool!`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `That sounds completely made up.`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunUpBorder', PENGUIN),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `Does this cabin look made up to you?`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Fair point...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //6
            `${this.penguini}`,
            `This is luxury cosmic shelter. Stardust finish. Interstellar glow. Elite privacy.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `You're just saying random expensive-sounding words now.`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `And they're working.`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniGunLaughBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //9
            `${this.penguini}`,
            `Anyways, if you want to rest inside this galactic cabin, I will need ${this.game.winningCoins} ${this.coinsText}.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Of course the space cabin is expensive...`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `You think cosmic operations run on kindness, ya' fool?`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //12
            `${this.penguini}`,
            `Let me see your pockets.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `It seems you have ${this.playerCoins} ${this.coinText}.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );

        // coin condition dialogues
        coinConditionDialogues.forEach(d => {
            this.addDialogue(d.character, d.dialogue, ...d.images);
        });

        if (this.game.notEnoughCoins === true) {
            return;
        }

        // rest of the dialogue
        this.addDialogue( //14
            `${this.penguini}`,
            `Transaction complete.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `So this is what I get for saving the world?`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //16
            `${this.penguini}`,
            `Business always comes first, ya' fool!`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `Get inside before I add galactic hidden fees to the price.`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG),
            this.addImage('penguiniGunUpBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Ugh... galactic hidden fees... that's a phrase I never expected to hear in my life...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `Get in or get out!`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN, { talking: true }),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Yeah, going...`,
            this.addImage(this.setfiredogSighBorder(), FIREDOG, { talking: true }),
            this.addImage('penguiniGunTalkNormalBorder', PENGUIN),
        );
    }
}

// coin condition penguini dialogues
export class CoinDialogueConditionCutscene extends PenguiniCutscene {
    constructor(game) {
        super(game);
    }

    makeSurplusDialogue(mapId, penguinX) {
        const penguinNormalBorderByMap = {
            Map1: 'penguiniBatTalkNormalBorder',
            Map2: 'penguiniBatTalkNormalBorder',
            Map3: 'penguiniBatTalkNormalBorder',
            Map4: 'penguiniGunTalkNormalBorder',
            Map5: 'penguiniGunTalkNormalBorder',
            Map6: 'penguiniGunTalkNormalBorder',
            BonusMap1: 'penguiniGunTalkNormalBorder',
            BonusMap2: 'penguiniGunTalkNormalBorder',
            BonusMap3: 'penguiniGunTalkNormalBorder',
        };

        const penguinLaughBorderByMap = {
            Map1: 'penguiniBatLaughBorder',
            Map2: 'penguiniBatLaughBorder',
            Map3: 'penguiniBatLaughBorder',
            Map4: 'penguiniGunLaughBorder',
            Map5: 'penguiniGunLaughBorder',
            Map6: 'penguiniGunLaughBorder',
            BonusMap1: 'penguiniGunLaughBorder',
            BonusMap2: 'penguiniGunLaughBorder',
            BonusMap3: 'penguiniGunLaughBorder',
        };

        const penguinNormalBorder = penguinNormalBorderByMap[mapId] || 'penguiniBatTalkNormalBorder';
        const penguinLaughBorder = penguinLaughBorderByMap[mapId] || 'penguiniBatLaughBorder';
        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const PENGUIN = { x: penguinX, y: 400, width: 200, height: 200 };

        return [
            {
                character: this.penguini,
                dialogue: `Hmm... you still have quite a few coins on you.`,
                images: [
                    this.addImage(this.setfiredogNormalBorder(), FIREDOG),
                    this.addImage(penguinNormalBorder, PENGUIN, { talking: true }),
                ],
            },
            {
                character: this.penguini,
                dialogue: `I'll be taking those extra coins too.`,
                images: [
                    this.addImage(this.setfiredogNormalBorder(), FIREDOG),
                    this.addImage(penguinLaughBorder, PENGUIN, { talking: true }),
                ],
            },
            {
                character: this.firedog,
                dialogue: `Are you serious right now?!`,
                images: [
                    this.addImage(this.setfiredogAngryBorder(), FIREDOG, { talking: true }),
                    this.addImage(penguinLaughBorder, PENGUIN),
                ],
            },
            {
                character: this.penguini,
                dialogue: `Those are the rules!`,
                images: [
                    this.addImage(this.setfiredogAngryBorder(), FIREDOG),
                    this.addImage(penguinLaughBorder, PENGUIN, { talking: true }),
                ],
            },
        ];
    }

    makeEnoughCoinsDialogue(mapId, firedogX = 100, penguinX = 1400) {
        const penguinLaughByMap = {
            Map1: 'penguiniBatLaughBorder',
            Map2: 'penguiniBatLaughBorder',
            Map3: 'penguiniBatLaughBorder',
            Map4: 'penguiniGunLaughBorder',
            Map5: 'penguiniGunLaughBorder',
            Map6: 'penguiniGunLaughBorder',
            BonusMap1: 'penguiniGunLaughBorder',
            BonusMap2: 'penguiniGunLaughBorder',
            BonusMap3: 'penguiniGunLaughBorder',
        };

        const FIREDOG = { x: firedogX, y: 400, width: 200, height: 200 };
        const PENGUIN = { x: penguinX, y: 400, width: 200, height: 200 };

        return {
            character: this.penguini,
            dialogue: `That's good enough, give me that!`,
            images: [
                this.addImage(this.setfiredogNormalBorder(), FIREDOG),
                this.addImage(penguinLaughByMap[mapId] || 'penguiniBatLaughBorder', PENGUIN, { talking: true }),
            ],
        };
    }

    checkPlayerCoins() {
        const mapId = this.getCurrentMapId();
        const notEnough = this.game.coins < this.game.winningCoins;
        const newDialogues = [];

        const FIREDOG_100 = { x: 100, y: 400, width: 200, height: 200 };
        const PENGUIN_1400 = { x: 1400, y: 400, width: 200, height: 200 };
        const PENGUIN_1265 = { x: 1265, y: 400, width: 200, height: 200 };
        const PENGUIN_1430 = { x: 1430, y: 400, width: 200, height: 200 };

        switch (mapId) {
            case 'Map1':
                if (notEnough) {
                    this.game.notEnoughCoins = true;
                    newDialogues.push(
                        {
                            character: this.penguini,
                            dialogue: `That doesn't even cover my rent!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniBatUpBorder', PENGUIN_1400, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniBatUpBorder', PENGUIN_1400, { talking: true }),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again...`,
                            images: [
                                this.addImage(this.setfiredogSighBorder(), FIREDOG_100, { talking: true }),
                                this.addImage('penguiniBatUpBorder', PENGUIN_1400),
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
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniBatUpBorder', PENGUIN_1400, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `You're sleeping outside tonight with the ghosts ya' fool!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniBatUpBorder', PENGUIN_1400, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniBatUpBorder', PENGUIN_1400, { talking: true }),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again...`,
                            images: [
                                this.addImage(this.setfiredogSighBorder(), FIREDOG_100, { talking: true }),
                                this.addImage('penguiniBatUpBorder', PENGUIN_1400),
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
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniBatUpBorder', PENGUIN_1265, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `You're not going inside of this submarine.`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniBatUpBorder', PENGUIN_1265, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniBatUpBorder', PENGUIN_1265, { talking: true }),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again...`,
                            images: [
                                this.addImage(this.setfiredogSighBorder(), FIREDOG_100, { talking: true }),
                                this.addImage('penguiniBatUpBorder', PENGUIN_1265),
                            ],
                        }
                    );
                } else {
                    newDialogues.push(this.makeEnoughCoinsDialogue(mapId, 100, 1265));
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
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `If you want to get inside you're gonna need to try harder than that ya' fool!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again...`,
                            images: [
                                this.addImage(this.setfiredogSighBorder(), FIREDOG_100, { talking: true }),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430),
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
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `You're going to stay outside. I don't care if it rains on you!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you have enough, get out of here now!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again...`,
                            images: [
                                this.addImage(this.setfiredogSighBorder(), FIREDOG_100, { talking: true }),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430),
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
                            dialogue: `That doesn't even cover the hazard costs of guarding a poisonous cabin ya' fool!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `You're staying outside with the toxic fumes until you bring me enough.`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again...`,
                            images: [
                                this.addImage(this.setfiredogSighBorder(), FIREDOG_100, { talking: true }),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430),
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
                            dialogue: `That doesn't even cover the heating costs for this frozen cabin ya' fool!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `You're staying out in the cold until you bring me enough.`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. I'm gonna freeze out here..`,
                            images: [
                                this.addImage(this.setfiredogSighBorder(), FIREDOG_100, { talking: true }),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430),
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
                            dialogue: `That doesn't even cover the maintenance needed to keep this cabin standing during the tremors, ya' fool!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `No money, no entry. Go wander around with the cursed rocks instead.`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. Gotta try again...`,
                            images: [
                                this.addImage(this.setfiredogSighBorder(), FIREDOG_100, { talking: true }),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430),
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
                            dialogue: `That doesn't even cover the cosmic maintenance fees for this galactic cabin ya' fool!`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.penguini,
                            dialogue: `Come back when you can afford interstellar shelter.`,
                            images: [
                                this.addImage(this.setfiredogNormalBorder(), FIREDOG_100),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430, { talking: true }),
                            ],
                        },
                        {
                            character: this.firedog,
                            dialogue: `Damn.. even space has rent..`,
                            images: [
                                this.addImage(this.setfiredogSighBorder(), FIREDOG_100, { talking: true }),
                                this.addImage('penguiniGunUpBorder', PENGUIN_1430),
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

        if (!notEnough) {
            const penguinXByMap = {
                Map1: 1400, Map2: 1400, Map3: 1265,
                Map4: 1430, Map5: 1430, Map6: 1430,
                BonusMap1: 1430, BonusMap2: 1430, BonusMap3: 1430,
            };
            const penguinX = penguinXByMap[mapId] ?? 1400;
            const leftover = this.game.coins - this.game.winningCoins;
            const maxLeftover = 300;
            if (leftover > maxLeftover) {
                this.game.surplusCoins = leftover - maxLeftover;
                newDialogues.push(...this.makeSurplusDialogue(mapId, penguinX));
            }
        }

        return newDialogues;
    }
}