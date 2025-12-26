import { Cutscene } from "./cutscene.js";
import { fadeInAndOut } from "../animations/fading.js";

export class NTharaxCutscene extends Cutscene {
    constructor(game) {
        super(game);

        this.dreamFlash = () => {
            this.removeEventListeners();
            this.game.audioHandler.firedogSFX.playSound("dreamSoundInGame");
            this.cutsceneBackgroundChange(500, 500, 500);
            setTimeout(() => this.addEventListeners(), 1000);
        };

        this.actions = {
            pre: {
                1: () => this.game.audioHandler.mapSoundtrack.playSound(
                    "crypticTokenDarkAmbienceSoundInGame",
                    true
                ),
                5: () => this.game.audioHandler.mapSoundtrack.fadeOutAndStop(
                    "crypticTokenDarkAmbienceSoundInGame"
                ),
                12: () => this.dreamFlash(),
                15: () => this.dreamFlash(),
                17: () => this.dreamFlash(),
            },
            post: {
                2: () => this.game.audioHandler.cutsceneMusic.playSound(
                    "unboundPurpose",
                    true
                ),
                25: () => this.game.audioHandler.mapSoundtrack.playSound(
                    "crypticTokenDarkAmbienceSoundInGame",
                    true
                ),
                29: () => this.game.audioHandler.mapSoundtrack.fadeOutAndStop(
                    "crypticTokenDarkAmbienceSoundInGame"
                ),
                37: () => this.game.audioHandler.cutsceneMusic.fadeOutAndStop(
                    "unboundPurpose"
                ),
            },
        };
    }

    enterOrLeftClick() {
        const boss = this.game.boss;

        this.cutsceneController();

        if (this.game.player.currentState !== this.game.player.states[8]) {
            this.game.player.setState(8, 0);
        }

        this.isEnterPressed = true;
        this.playSound2OnDotPause = false;

        const dlg = this.dialogue[this.dialogueIndex].dialogue;

        if (this.continueDialogue) {
            this.pause = false;
            this.textIndex++;
            this.continueDialogue = false;

        } else if (this.textIndex < dlg.length) {
            const dotIndices = this.getDotIndices(dlg);
            const nextDotIndex = dotIndices.find(idx => idx > this.textIndex);

            if (nextDotIndex !== undefined) {
                this.textIndex = this.ellipsisFollowedOnlyByTerminalPunct(dlg, nextDotIndex)
                    ? dlg.length
                    : nextDotIndex;
            } else {
                this.textIndex = dlg.length;
            }

        } else if (this.dialogueIndex < this.dialogue.length - 1) {
            this.dialogueIndex++;
            this.textIndex = 0;
            this.lastSound2Played = false;

            const currentDialogue = this.dialogue[this.dialogueIndex];
            const words = this.splitDialogueIntoWords(currentDialogue.dialogue);
            this.fullWordsColor = [];
            this.fullWordsColor = words;

        } else {
            if (boss && boss.current && boss.id === "ntharax") {
                if (boss.preFight) {
                    this.startBossFight(boss);
                } else if (boss.postFight) {
                    this.finishPostFight(boss);
                }
            }
        }

        const checkAnimationStatus = setInterval(() => {
            if (this.textIndex >= this.dialogue[this.dialogueIndex].dialogue.length) {
                this.isEnterPressed = false;
                clearInterval(checkAnimationStatus);
            }
        }, 100);
    }

    startBossFight(boss) {
        this.removeEventListeners();
        this.cutsceneBackgroundChange(500, 2500, 200);
        this.game.audioHandler.cutsceneSFX.playSound("battleStarting");

        setTimeout(() => {
            this.game.endCutscene();
            boss.talkToBoss = false;
            boss.preFight = false;
            boss.inFight = true;
            boss.progressComplete = true;
            this.game.cutscenes = [];
            this.game.audioHandler.mapSoundtrack.playSound("ntharaxBattleTheme", true);
        }, 3000);
    }

    finishPostFight(boss) {
        this.removeEventListeners();

        this.game.enterDuringBackgroundTransition = false;
        this.game.input.keys = [];

        boss.talkToBoss = false;
        boss.postFight = false;
        boss.runAway = false;

        const fadeIn = 500;
        const stayBlack = 250;
        const fadeOut = 500;

        fadeInAndOut(this.game.canvas, fadeIn, stayBlack, fadeOut, () => {
            this.game.enterDuringBackgroundTransition = true;
        });

        this.game.endCutscene();
        this.game.cutscenes = [];

        setTimeout(() => {
            if (boss.current && boss.id === "ntharax") {
                boss.current.markedForDeletion = true;
            }
            boss.isVisible = false;
            boss.current = null;

            const bg = this.game.background;
            const dist = (bg && bg.totalDistanceTraveled) || 0;

            this.game.maxDistance = dist + 5;
        }, fadeIn - 30);
    }

    displayDialogue() {
        this.handleKeyDown = (event) => {
            const boss = this.game.boss;

            if (
                this.game.menu.pause.isPaused ||
                this.game.currentMenu === this.game.menu.ingameAudioSettings
            ) {
                return;
            }

            if (event.key === "Tab" && this.game.enterDuringBackgroundTransition) {
                if (boss && boss.current && boss.id === "ntharax" && boss.preFight) {
                    this.skipPreFightAndStartBattle(boss);
                }
            }

            if (
                event.key === "Enter" &&
                !this.isEnterPressed &&
                this.game.enterDuringBackgroundTransition
            ) {
                this.enterOrLeftClick();
            }
        };

        this.handleLeftClick = () => {
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

    skipPreFightAndStartBattle(boss) {
        this.removeEventListeners();
        this.cutsceneBackgroundChange(500, 2500, 200);

        this.stopAllAudio();
        this.game.audioHandler.cutsceneDialogue.playSound("bit1", false, true, true);

        this.game.audioHandler.cutsceneSFX.playSound("battleStarting");

        setTimeout(() => {
            this.dialogueIndex = this.dialogue.length - 1;
            this.game.endCutscene();
            boss.talkToBoss = false;
            boss.preFight = false;
            boss.inFight = true;
            boss.progressComplete = true;
            this.game.cutscenes = [];
            this.game.audioHandler.mapSoundtrack.playSound("ntharaxBattleTheme", true);
        }, 3000);
    }

    resolveCutsceneAction() {
        const boss = this.game.boss;
        const isGlacikal = boss && boss.current && boss.id === "ntharax";

        const mode = isGlacikal && boss.preFight
            ? "pre"
            : (isGlacikal && boss.postFight ? "post" : null);

        if (!mode) return undefined;

        const table = this.actions[mode];
        if (!table) return undefined;

        return table[this.dialogueIndex];
    }
}

export class Map6NTharaxIngameCutsceneBeforeFight extends NTharaxCutscene {
    constructor(game) {
        super(game);

        this.addDialogue(
            `${this.firedog}`,
            `A hooded individual- So it's you...`,
            this.addImage(this.setfiredogNormalBorder(), 1, 100, 400, 200, 200),
        );

        this.addDialogue(
            `${this.firedog}`,
            `You are the one who stole the ${this.crypticToken}, weren't you?`,
            this.addImage(this.setfiredogAngry2Border(), 1, 100, 400, 200, 200),
        );

        this.addDialogue(
            `${this.ntharax}`,
            `Why have you come to this place? This is my territory!`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('ntharaxBorder', 1, 1560, 400, 200, 200),
        );
    }
}

export class Map6NTharaxIngameCutsceneAfterFight extends NTharaxCutscene {
    constructor(game) {
        super(game);

        this.addDialogue(
            `${this.ntharax}`,
            `You're strong.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage("ntharaxBorder", 1, 1100, 400, 200, 200),
        );

        this.addDialogue(
            `${this.firedog}`,
            `How do you know my fireball ability? How is this possible?`,
            this.addImage(this.setfiredogNormalBorder(), 1, 100, 400, 200, 200),
            this.addImage("ntharaxBorder", 0.7, 1100, 400, 200, 200),
        );
    }
}
