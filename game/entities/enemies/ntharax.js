import { EnemyBoss } from "./enemies.js";

// ------------------------------------------------------------------- Final Boss ------------------------------------------------------------------------
export class NTharax extends EnemyBoss {
    constructor(game) {
        super(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgIdle');
        this.state = "idle";
        this.previousState = null;
        this.chooseStateOnce = true;
        this.shouldInvert = false;
        this.reachedRightEdge = false;
        this.reachedLeftEdge = false;
        this.isInTheMiddle = false;
        this.originalY = this.y;
        this.setFps(30);
        this.maxLives = 100;
        this.lives = this.maxLives;
        this._defeatTriggered = false;
        this.stateRandomiserTimer = 5000;
        this.stateRandomiserCooldown = 5000;
        // run
        this.runAnimation = new EnemyBoss(game, 153.23076923076923076923076923077, 180, 12, 'elyvorgRun');
        this.runAnimation.setFps(120);
        this.runAnimation.frameX = 0;
        this.runningDirection = 0; // switches between 10 and -10
        this.runStateCounter = 0;
        this.runStateCounterLimit = 5;
        this.runStopAtTheMiddle = false;
        // jump
        this.jumpAnimation = new EnemyBoss(game, 153.25, 180, 11, 'elyvorgJump');
        this.jumpAnimation.frameX = 0;
        this.jumpHeight = 300;
        this.jumpDuration = 0.7;
        this.jumpStartTime = 0;
        this.canJumpAttack = true;
        // recharge
        this.rechargeAnimation = new EnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgRechargeIdle');
        this.rechargeAnimation.frameX = 0;
    }

    fireJumpArrow() {
        if (!this.canJumpAttack) return;

        this.canJumpAttack = false;
        this.game.audioHandler.enemySFX.playSound(
            'elyvorg_arrow_attack_sound',
            false,
            true
        );
    }

    jumpLogic() {
        if (this.jumpAnimation.frameX === 0 && !this.jumpedBeforeDistanceLogic) {
            this.jumpStartTime = this.game.hiddenTime;
            this.jumpedBeforeDistanceLogic = true;
        }

        const jumpProgress = (this.game.hiddenTime - this.jumpStartTime) / (this.jumpDuration * 1000);

        if (jumpProgress < 1) {
            this.y = this.originalY - this.jumpHeight * Math.sin(jumpProgress * Math.PI);

            if (Math.abs(jumpProgress - 0.5) < 0.05) {
                this.fireJumpArrow();
            }
        } else {
            this.backToIdleSetUp();
            this.canJumpAttack = true;
            this.y = this.originalY;
            this.jumpedBeforeDistanceLogic = false;
        }
    }


    checkIfDefeated() {
        if (this._defeatTriggered) return;
        if (this.lives <= 0) {
            this._defeatTriggered = true;

            this.defeatCommon({
                bossId: "ntharax",
                bossClass: NTharax,
                battleThemeId: "ntharaxBattleTheme",
                onBeforeClear: () => {
                    this.game.shakeActive = false;
                    this.game.shakeTimer = 0;
                    this.game.shakeDuration = 0;
                    this.game.bossManager.releaseScreenEffect("elyvorg_thunder");
                    this.game.bossManager.releaseScreenEffect("elyvorg_poison");
                }
            });
        }
    }

    runLogic() {
        this.x += this.runningDirection;
        if (this.runStopAtTheMiddle && this.isInTheMiddle) {
            this.backToIdleSetUp();
            this.runStopAtTheMiddle = false;
        }

        const distanceToPlayer = this.getDistanceToPlayer();

        if (distanceToPlayer <= 300 && this.slashAttackOnce) {
            this.shouldInvert = this.runningDirection > 0;
            this.game.audioHandler.enemySFX.playSound('elyvorg_slash_attack_sound');
        }

    }

    rechargeLogic(deltaTime) {
        this.stateRandomiserTimer += deltaTime;
        if (this.stateRandomiserTimer >= this.stateRandomiserCooldown && this.rechargeAnimation.frameX === this.rechargeAnimation.maxFrame) {
            this.stateRandomiser();
            this.stateRandomiserTimer = 0;
        }
    }

    stateRandomiser() {
        const allStates = ['run', 'jump', 'run'];

        if (this.game.gameOver) {
            if (this.isInTheMiddle) {
                this.runningDirection = 10;
                this.state = 'run';
            } else {
                this.state = 'idle';
            }
            return;
        }

        this.runStateCounter++;
        this.electricWheelStateCounter++;
        this.slashAttackStateCounter++;
        this.thunderStateCounter++;
        if (this.electricWheelActivateStateCounterDeltaTime) {
            this.electricWheelStateCounterDeltaTime++;
        }
        if (this.slashAttackStateCounter >= this.slashAttackStateCounterLimit) {
            this.slashAttackOnce = true;
        }

        this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;
        // prioritised states for the following scenarios
        if ((this.runStateCounter >= this.runStateCounterLimit && this.isInTheMiddle === false) ||
            (this.runStateCounter >= this.runStateCounterLimit && this.isInTheMiddle && this.previousState !== 'run') ||
            (this.isElectricWheelActive && this.electricWheelThrown === false && this.isInTheMiddle && this.previousState !== 'run')) {
            this.runStopAtTheMiddle = false;
            this.runStateCounter = 0;
            this.runStateCounterLimit = Math.floor(4 + Math.random() * 3); // 4 to 6
            this.runningDirection = this.shouldInvert ? 10 : -10;
            this.state = 'run';
            this.runAnimation.x = this.x;
            this.runAnimation.y = this.y;
            this.runAnimation.frameX = 0;
            return;
        } else if (this.electricWheelStateCounterDeltaTime >= this.electricWheelStateCounterLimitDeltaTime && this.isInTheMiddle === false) {
            this.electricWheelActivateStateCounterDeltaTime = false;
            this.electricWheelStateCounterDeltaTime = 0;
            this.electricWheelStateCounterLimitDeltaTime = Math.floor(Math.random() * 4) + 1; // 1 to 4
            this.playElectricWarningSoundOnce = true;
            this.electricWheelTimer = 0;
            this.electricWheelStateCounter = 0;
            this.state = "pistol";
            this.pistolAnimation.x = this.x;
            this.pistolAnimation.y = this.y;
            this.pistolAnimation.frameX = 0;
            return;
        } else if (this.thunderStateCounter >= this.thunderStateCounterLimit) {
            this.thunderStateCounter = 0;
            this.thunderStateCounterLimit = Math.floor(Math.random() * 6) + 15; // 15 to 20
            this.state = 'thunder';
            this.thunderAnimation.x = this.x;
            this.thunderAnimation.y = this.y;
            this.thunderAnimation.frameX = 0;
            return;
        }

        let selectedState;

        if (Math.random() < 0.1 &&
            this.previousState &&
            this.previousState !== 'thunder' &&
            !this.isGravitySpinnerActive &&
            !this.isPoisonActive) {
            selectedState = this.previousState;
        } else {
            do {
                selectedState = allStates[Math.floor(Math.random() * allStates.length)];
            } while (
                selectedState === this.previousState ||
                (this.isGravitySpinnerActive && selectedState === 'gravity') ||
                (this.isPoisonActive && selectedState === 'poison')
            );
        }

        this.state = selectedState;

        const stateAnimations = {
            'run': this.runAnimation,
            'laser': this.laserAnimation,
            'meteor': this.meteorAnimation,
            'ghost': this.ghostAnimation,
            'gravity': this.gravityAnimation,
            'ink': this.inkAnimation,
            'fireball': this.fireballAnimation,
            'poison': this.poisonAnimation,
            'jump': this.jumpAnimation,
            'thunder': this.thunderAnimation,
        };

        const animation = stateAnimations[this.state];
        if (animation) {
            if (this.state === 'run') {
                this.runningDirection = this.shouldInvert ? 10 : -10;
            }
            animation.x = this.x;
            animation.y = this.y;
            animation.frameX = 0;
        }

    }

    update(deltaTime) {
        super.update(deltaTime);
        this.checksBossIsFullyVisible("ntharax");

        const boss = this.game.boss;
        const isTalkingToBoss = boss && boss.talkToBoss;

        if (!isTalkingToBoss) {
            this.checkIfDefeated();

            if (boss && boss.runAway && boss.current === this && boss.id === 'ntharax') {
                this.runningAway(deltaTime, "ntharax");
            } else {
                if (this.game.bossInFight && boss && boss.current === this && boss.id === 'ntharax') {
                    if (this.state === "idle") {
                        this.edgeConstraintLogic("ntharax");
                        this.stateRandomiser();
                    } else if (this.state === "run") {
                        this.runAnimation.update(deltaTime);
                        this.edgeConstraintLogic("ntharax");
                        this.runLogic();
                    } else if (this.state === "jump") {
                        this.jumpAnimation.update(deltaTime);
                        this.jumpLogic();
                    }

                    if (this.x + this.width < 0 || this.x >= this.game.width) {
                        if (boss.current === this && boss.id === 'ntharax') {
                            boss.isVisible = false;
                        }
                    }
                }
            }
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;

        const stateAnimations = {
            'recharge': 'rechargeAnimation',
            'run': 'runAnimation',
            'jump': 'jumpAnimation',
        };

        if (this.state === 'idle') {
            super.draw(context, this.shouldInvert);
        } {
            const animationName = stateAnimations[this.state];
            if (animationName) {
                const animation = this[animationName];
                if (animation) {
                    animation.x = this.x;
                    animation.y = this.y;
                    if (this.state === 'run') {
                        this.shouldInvert = this.runningDirection > 0;
                    }
                    animation.draw(context, this.shouldInvert);
                }
            }
        }
    }
}
