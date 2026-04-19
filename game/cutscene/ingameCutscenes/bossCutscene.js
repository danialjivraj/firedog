import { Cutscene } from '../cutscene.js';
import { fadeInAndOut } from '../../animations/fading.js';
import { NuclearDisintegrationCollision } from '../../animations/collisionAnimation/proceduralCollisions.js';

export class BossCutscene extends Cutscene {
    constructor(game) {
        super(game);
        this.textBoxBackgroundOpacity = 0.55;
    }

    getBossId() {
        throw new Error('getBossId() must be implemented by subclass');
    }

    getBattleTheme() {
        throw new Error('getBattleTheme() must be implemented by subclass');
    }

    getResetLayerImageIds() {
        return [];
    }

    shouldRemoveBossAfterPostFight() {
        return false;
    }

    onPostFightFinished() {}

    startCurrentBossDisintegration(options = {}) {
        const boss = this.game.boss;
        if (!boss || !boss.current) return;
        if (boss.id !== this.getBossId()) return;

        const enemy = boss.current;
        if (enemy.cutsceneDisintegrating) return;

        enemy.cutsceneDisintegrating = true;

        this.game.collisions.push(
            new NuclearDisintegrationCollision(this.game, enemy, {
                ...options,
            })
        );
    }

    completeCurrentBossDisintegrationState() {
        const boss = this.game.boss;
        if (!boss || boss.id !== this.getBossId()) return;
        if (!boss.current) return;

        boss.current.cutsceneDisintegrating = true;
    }

    _beginBossBattle(boss) {
        this.game.background.resetLayersByImageIds(this.getResetLayerImageIds());

        this.game.endCutscene();
        boss.talkToBoss = false;
        boss.preFight = false;
        boss.inFight = true;
        boss.progressComplete = true;
        this.game.cutscenes = [];
        this.game.audioHandler.mapSoundtrack.playSound(this.getBattleTheme(), true);
    }

    enterOrLeftClick() {
        const boss = this.game.boss;

        this.runCurrentDialogueAdvanceActionIfAny();

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
            this.jumpToDialogue(this.dialogueIndex + 1);

        } else if (boss && boss.id === this.getBossId()) {
            if (boss.preFight) {
                this.startBossFight(boss);
            } else if (boss.postFight) {
                this.finishPostFight(boss);
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
        this.game.audioHandler.cutsceneSFX.playSound('battleStarting');

        setTimeout(() => {
            this._beginBossBattle(boss);
        }, 3000);
    }

    finishPostFight(boss) {
        if (this.shouldRemoveBossAfterPostFight()) {
            this.finishPostFightWithBossRemoval(boss);
            return;
        }

        this.game.endCutscene();
        boss.talkToBoss = false;
        boss.postFight = false;
        boss.runAway = true;
        this.game.cutscenes = [];
        this.removeEventListeners();

        const bg = this.game.background;
        const dist = (bg && bg.totalDistanceTraveled) || 0;
        this.game.maxDistance = dist + 5;

        this.onPostFightFinished();
    }

    finishPostFightWithBossRemoval(boss) {
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
            if (boss.current && boss.id === this.getBossId()) {
                boss.current.markedForDeletion = true;
            }
            boss.isVisible = false;
            boss.current = null;

            const bg = this.game.background;
            const dist = (bg && bg.totalDistanceTraveled) || 0;
            this.game.maxDistance = dist + 5;

            this.onPostFightFinished();
        }, fadeIn - 30);
    }

    displayDialogue() {
        this.handleKeyDown = (event) => {
            const boss = this.game.boss;

            if (
                this.game.menu.pause.isPaused ||
                this.game.currentMenu === this.game.menu.audioSettings
            ) {
                return;
            }

            if (
                event.key === 'Tab' &&
                this.game.enterDuringBackgroundTransition &&
                !this.isEnterPressed &&
                boss &&
                boss.current &&
                boss.id === this.getBossId()
            ) {
                event.preventDefault?.();

                if (boss.preFight) {
                    this.skipPreFightAndStartBattle(boss);
                    return;
                }

                if (boss.postFight && this.dialogueIndex < this.dialogue.length - 1) {
                    this.skipPostFightToLastDialogue();
                    return;
                }
            }

            if (
                event.key === 'Enter' &&
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
                this.game.currentMenu !== this.game.menu.audioSettings
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
        this.game.audioHandler.cutsceneDialogue.stopSound('bit1');
        this.game.audioHandler.cutsceneSFX.playSound('battleStarting');

        setTimeout(() => {
            this.dialogueIndex = this.dialogue.length - 1;
            this._beginBossBattle(boss);
        }, 3000);
    }

    skipPostFightToLastDialogue() {
        this.transitionWithBg({
            fadeIn: 200,
            blackDuration: 300,
            fadeOut: 200,
            beforeFade: () => {
                this.stopAllAudio();
                this.game.audioHandler.cutsceneDialogue.stopSound('bit1');
            },
            onBlack: () => {
                if (this.shouldRemoveBossAfterPostFight()) {
                    this.completeCurrentBossDisintegrationState();
                }

                this.jumpToDialogue(this.dialogue.length - 1);
            },
        });
    }
}