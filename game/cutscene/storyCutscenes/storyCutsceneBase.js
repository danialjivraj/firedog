import { Cutscene } from '../cutscene.js';

export class StoryCutscene extends Cutscene {
    constructor(game) {
        super(game);
        this.characterLimit = 75;
        this.textBoxWidth = 1050;
    }

    getGlowColorForImage(img) {
        return img?.opts?.border?.talking ? this.panelBorderColors.talking : null;
    }

    enterOrLeftClick() {
        this.runCurrentDialogueAdvanceActionIfAny();

        this.playSound2OnDotPause = false;
        this.isEnterPressed = true;

        if (this.continueDialogue) {
            this.pause = false;
            this.textIndex++;
            this.continueDialogue = false;

        } else if (this.textIndex < this.dialogue[this.dialogueIndex].dialogue.length) {
            const dlg = this.dialogue[this.dialogueIndex].dialogue;
            const dotIndices = this.getDotIndices(dlg);
            const nextDotIndex = dotIndices.find(index => index > this.textIndex);

            if (nextDotIndex !== undefined) {
                if (this.ellipsisFollowedOnlyByTerminalPunct(dlg, nextDotIndex)) {
                    this.textIndex = dlg.length;
                } else {
                    this.textIndex = nextDotIndex;
                }
            } else {
                this.textIndex = dlg.length;
            }

        } else if (this.dialogueIndex < this.dialogue.length - 1) {
            this.dialogueIndex++;
            this.textIndex = 0;
            this.lastSound2Played = false;

            const currentDialogue = this.dialogue[this.dialogueIndex];
            this.fullWordsColor = this.splitDialogueIntoWords(currentDialogue.dialogue);

            this.runCurrentDialogueEnterActionIfAny();

        } else {
            this.removeEventListeners();
            this.cutsceneBackgroundChange(400, 600, 400);
            this.fadeOutAndStopAllAudio();
            setTimeout(() => {
                this.game.endCutscene();
                if (this.game.isEndCutscene) {
                    this.game.isPlayerInGame = false;
                } else {
                    this.game.isPlayerInGame = true;
                }
                this.game.input.keys = [];
            }, 500);
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
            if (event.key === 'Tab' && this.game.fadingIn === false && this.game.enterDuringBackgroundTransition && this.game.waitForFadeInOpacity === false) {
                this.removeEventListeners();
                this.cutsceneBackgroundChange(400, 600, 400);
                this.fadeOutAndStopAllAudio();
                setTimeout(() => {
                    this.dialogueIndex = this.dialogue.length - 1;
                    this.game.endCutscene();
                    this.game.stopShake();
                    if (this.game.isEndCutscene) {
                        this.game.isPlayerInGame = false;
                    } else {
                        this.game.isPlayerInGame = true;
                    }
                }, 500);
            }
            if (event.key === 'Enter' && !this.isEnterPressed && !this.game.fadingIn &&
                this.game.enterDuringBackgroundTransition && this.game.waitForFadeInOpacity === false) {
                this.enterOrLeftClick();
            }
        };
        this.handleLeftClick = (event) => {
            if (!this.isEnterPressed && !this.game.fadingIn && this.game.enterDuringBackgroundTransition && this.game.waitForFadeInOpacity === false) {
                this.enterOrLeftClick();
            }
        };
        super.displayDialogue();
    }
}
