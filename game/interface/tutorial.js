import { Dotter, MeatSoldier, Piper, Skulnap, SpearFish } from "../entities/enemies/enemies.js";
import { getDefaultKeyBindings } from "../config/keyBindings.js";

export class Tutorial {
    constructor(game) {
        this.game = game;
        this.fontSize = "50px ";
        this.fontFamily = "Arial";
        this.currentStepIndex = 0;
        this.elapsedTime = 0;
        this.tutorialPause = true;
        this.cooldownTime = 0;

        this._lastStepIndex = -1;

        this.phraseColors = {
            // words
            Tutorial: { fill: "green", stroke: "black" },
            Energy: { fill: "black", stroke: "DodgerBlue" },
            "Red Enemy": { fill: "red", stroke: "black" },
            "Yellow Enemy": { fill: "yellow", stroke: "black" },
            "1 Life": { fill: "black", stroke: "MediumSeaGreen" },
            Settings: { fill: "LightSeaGreen", stroke: "black" },

            // keys
            Q: { fill: "orange", stroke: "black" },
            E: { fill: "orange", stroke: "black" },
            W: { fill: "orange", stroke: "black" },
            A: { fill: "orange", stroke: "black" },
            S: { fill: "orange", stroke: "black" },
            D: { fill: "orange", stroke: "black" },
            Enter: { fill: "orange", stroke: "black" },
            Shift: { fill: "orange", stroke: "black" },

            // enemies
            "Meat Soldier": { fill: "FireBrick", stroke: "black" },
            Dotter: { fill: "FireBrick", stroke: "black" },
            Skulnap: { fill: "FireBrick", stroke: "black" },
            "Spear Fish": { fill: "FireBrick", stroke: "black" },

            // abilities
            "Dive Attack": { fill: "DodgerBlue", stroke: "black" },
            "Roll Attack": { fill: "DodgerBlue", stroke: "black" },
            "Fireball Attack": { fill: "DodgerBlue", stroke: "black" },
            Invisible: { fill: "DodgerBlue", stroke: "black" },
            "Dash Attack": { fill: "DodgerBlue", stroke: "black" },
        };

        this.steps = [
            {
                message: "Welcome to the Tutorial!\nPress Enter to continue.",
                action: "rollAttack",
                condition: () => true,
                timerDuration: 0,
            },
            {
                message: "To move right \nhold D!",
                action: "moveForward",
                condition: () => true,
                timerDuration: 1000,
            },
            {
                message: "To move left \nhold A!",
                action: "moveBackward",
                condition: () => true,
                timerDuration: 1000,
            },
            {
                message: "To jump \npress W!",
                action: "jump",
                condition: () => this.game.player.onGround(),
                timerDuration: 1000,
            },
            {
                message: "To sit down \npress S!",
                action: "sit",
                condition: () => this.game.player.onGround(),
                timerDuration: 500,
            },
            {
                message:
                    "That's a Meat Soldier up ahead!\nLet's use Roll Attack!\nHold Enter to kill him!\nKeep in mind your Energy will keep \ndraining while you hold the key!",
                action: "rollAttack",
                condition: () => {
                    const meatSoldier = this.game.enemies.find((enemy) => enemy instanceof MeatSoldier);
                    return (
                        this.isPlayerNearEnemy(meatSoldier, 1200) &&
                        this.game.player.isEnergyExhausted === false
                    );
                },
                timerDuration: 2000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(MeatSoldier, deltaTime);
                },
            },
            {
                message:
                    "That's a Dotter up ahead!\nLet's use Roll Attack while jumping this time!\nPress W to jump and once you're near the enemy, hold Enter!",
                action: "jump",
                condition: () => {
                    const dotter = this.game.enemies.find((enemy) => enemy instanceof Dotter);
                    return (
                        this.isPlayerNearEnemy(dotter, 1200) &&
                        this.game.player.isEnergyExhausted === false
                    );
                },
                timerDuration: 2000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(Dotter, deltaTime, this.game.height - 400);
                },
            },
            {
                message:
                    "Let's use Dive Attack this time!\nDo not jump and press D until\nyou're close enough to the Meat Soldier!",
                action: "moveForward",
                condition: () => {
                    const meatSoldier = this.game.enemies.find((enemy) => enemy instanceof MeatSoldier);
                    return this.isPlayerNearEnemy(meatSoldier, 1500);
                },
                timerDuration: 3000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(MeatSoldier, deltaTime);
                },
            },
            {
                message: "To use Dive Attack, first, \npress W to jump!",
                action: "jump",
                condition: () => {
                    const playerOnGround = this.game.player.onGround();
                    const meatSoldier = this.game.enemies.find((enemy) => enemy instanceof MeatSoldier);
                    const playerNearMeatSoldier = meatSoldier && this.isPlayerNearEnemy(meatSoldier, 200);
                    return playerOnGround && playerNearMeatSoldier;
                },
                timerDuration: 0,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(MeatSoldier, deltaTime);
                },
            },
            {
                message: "And now press S\nto Dive Attack while in the air!",
                action: "diveAttack",
                condition: () => this.game.player.vy === -1,
                timerDuration: 0,
            },
            {
                message:
                    "Good job!\nNow you will try a more advanced way of using Dive Attack.\nPress A to go all the way to the left!",
                action: "moveBackward",
                condition: () => true,
                timerDuration: 2000,
            },
            {
                message:
                    "You can use Dive Attack while running forward\nwhich allows you to dive at a slight angle!\nHold D!",
                action: "moveForward",
                condition: () => {
                    const meatSoldier = this.game.enemies.find((enemy) => enemy instanceof MeatSoldier);
                    return this.isPlayerAtApproximateDistanceFromEnemy(meatSoldier, 1250);
                },
                timerDuration: 3000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(MeatSoldier, deltaTime);
                },
            },
            {
                message: "Press W to jump while holding D!",
                action: "jump",
                condition: () => {
                    const playerOnGround = this.game.player.onGround();
                    const meatSoldier = this.game.enemies.find((enemy) => enemy instanceof MeatSoldier);
                    const playerNearMeatSoldier =
                        meatSoldier && this.isPlayerAtApproximateDistanceFromEnemy(meatSoldier, 800, 10);
                    return playerOnGround && playerNearMeatSoldier;
                },
                timerDuration: 0,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(MeatSoldier, deltaTime);
                },
            },
            {
                message: "Now Press S while holding D!",
                action: "diveAttack",
                condition: () => this.game.player.vy === -1,
                timerDuration: 0,
            },
            {
                message:
                    "Good job!\nKeep in mind Dive Attack does not require Energy\nso feel free to spam it when you need to!\nPress Enter to continue!",
                action: "rollAttack",
                condition: () => true,
                timerDuration: 3000,
            },
            {
                message:
                    "You can jump or Dive Attack while using Roll Attack.\nHold Enter and press W, and once you're in the air press S!",
                action: "rollAttack",
                condition: () => this.game.player.isEnergyExhausted === false,
                timerDuration: 4000,
            },
            {
                message: "Press Q to release your Fireball Attack!\nIt uses 8.0 of your Energy!",
                action: "fireballAttack",
                condition: () =>
                    this.game.player.fireballTimer >= this.game.player.fireballCooldown &&
                    this.game.player.isEnergyExhausted === false,
                timerDuration: 3000,
            },
            {
                message:
                    "Up ahead is a Skulnap (a Yellow Enemy)!\nIf you make contact with any enemy that glows yellow,\nyou will get stunned for a split second and take damage.\nUse Q instead!",
                action: "fireballAttack",
                condition: () => {
                    const skulnap = this.game.enemies.find((enemy) => enemy instanceof Skulnap);
                    return (
                        this.isPlayerNearEnemy(skulnap, 1200) &&
                        this.game.player.fireballTimer >= this.game.player.fireballCooldown &&
                        this.game.player.isEnergyExhausted === false &&
                        this.game.player.onGround()
                    );
                },
                timerDuration: 2000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(Skulnap, deltaTime);
                },
            },
            {
                message:
                    "Now let's try to use Enter against the Skulnap\nso that you can see the stunning animation!",
                action: "rollAttack",
                condition: () => {
                    const skulnap = this.game.enemies.find((enemy) => enemy instanceof Skulnap);
                    return (
                        this.isPlayerNearEnemy(skulnap, this.game.width) &&
                        this.game.player.isEnergyExhausted === false
                    );
                },
                timerDuration: 2000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(Skulnap, deltaTime);
                },
            },
            {
                message:
                    "Up ahead is a Spear Fish (a Red Enemy)!\nRed Enemies will always damage you through your Roll Attack.\nHowever any other attacks are safe to use!\nTry using Dive Attack!\nPress A to continue!",
                action: "moveBackward",
                condition: () => {
                    const spearFish = this.game.enemies.find((enemy) => enemy instanceof SpearFish);
                    return this.isPlayerNearEnemy(spearFish, 1200);
                },
                timerDuration: 2000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(SpearFish, deltaTime, null, { lives: 1 });
                },
            },
            {
                message:
                    "Now try using your Roll Attack against the Spear Fish!\nNotice how you take damage!\nHold Enter!",
                action: "rollAttack",
                condition: () => {
                    const spearFish = this.game.enemies.find((enemy) => enemy instanceof SpearFish);
                    return (
                        this.isPlayerNearEnemy(spearFish, 1200) &&
                        this.game.player.fireballTimer >= this.game.player.fireballCooldown &&
                        this.game.player.isEnergyExhausted === false
                    );
                },
                timerDuration: 4000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(SpearFish, deltaTime, null, { lives: 1 });
                },
            },
            {
                message:
                    "Some enemies will have more than 1 Life!\n To quickly kill the enemy you can use Q followed by Enter!",
                action: "fireballAttack",
                condition: () => {
                    const piper = this.game.enemies.find((enemy) => enemy instanceof Piper);
                    return (
                        this.isPlayerNearEnemy(piper, 1200) &&
                        this.game.player.fireballTimer >= this.game.player.fireballCooldown &&
                        this.game.player.isEnergyExhausted === false
                    );
                },
                timerDuration: 4000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(Piper, deltaTime);
                },
            },
            {
                message:
                    "Press E to go Invisible for 5 seconds!\nDuring this time, you can pass through any type of enemy\nas well as kill them without taking any damage!",
                action: "invisibleDefense",
                condition: () => {
                    const skulnap = this.game.enemies.find((enemy) => enemy instanceof Skulnap);
                    this.game.player.invisibleTimer = this.game.player.invisibleCooldown;
                    this.game.player.isInvisible = false;
                    return this.isPlayerNearEnemy(skulnap, 1200);
                },
                timerDuration: 3000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(Skulnap, deltaTime);
                },
            },
            {
                message: "For Dash Attack you have 2 charges.\nPress Shift to use the first charge!",
                action: "dashAttack",
                condition: () => {
                    const playerOnGround = this.game.player.onGround();
                    const meatSoldier = this.game.enemies.find((enemy) => enemy instanceof MeatSoldier);
                    const playerNearMeatSoldier = meatSoldier && this.isPlayerNearEnemy(meatSoldier, 600);
                    return playerOnGround && playerNearMeatSoldier;
                },
                timerDuration: 0,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(MeatSoldier, deltaTime);
                },
            },
            {
                message:
                    "Now use your second dash charge.\nDuring Dash you cannot be damaged,\nalthough status conditions like poison or slow will still affect you.\nPress Shift again on Skulnap!",
                action: "dashAttack",
                condition: () => {
                    const playerOnGround = this.game.player.onGround();
                    const skulnap = this.game.enemies.find((enemy) => enemy instanceof Skulnap);
                    const playerNearSkulnap = skulnap && this.isPlayerNearEnemy(skulnap, 1000);
                    return playerOnGround && playerNearSkulnap;
                },
                timerDuration: 0,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(Skulnap, deltaTime);
                },
            },
            {
                message:
                    "That's the end of the Tutorial!\nTo activate the Tutorial again, go to the Settings Menu.\nPress Enter to continue.\nGood luck!",
                action: "rollAttack",
                condition: () => true,
                timerDuration: 6000,
                resetGameValues: () => {
                    this.game.player.clearAllStatusEffects();
                    this.game.player.energy = 100;
                    this.game.menu.levelDifficulty.setDifficulty(this.game.selectedDifficulty);
                    this.game.coins = 0;
                    this.game.time = 0;
                },
            },
        ];

        this._dashStepIndices = this.steps
            .map((s, i) => (s && s.action === "dashAttack" ? i : -1))
            .filter((i) => i !== -1);

        this._firstDashStepIndex = this._dashStepIndices[0] ?? -1;
        this._secondDashStepIndex = this._dashStepIndices[1] ?? -1;
    }

    getKeyForAction(action) {
        const bindings = getDefaultKeyBindings();
        return bindings[action];
    }

    getStepKey(step) {
        if (!step) return null;
        if (step.action) return this.getKeyForAction(step.action);
        return step.key || null;
    }

    isStepKeyHeld(step) {
        const requiredKey = this.getStepKey(step);
        if (!requiredKey) return false;
        return this.game.input.keys.includes(requiredKey);
    }

    createSpawnEnemy(enemyClass, deltaTime, initialY = null, additionalConfig = {}) {
        if (this.game.enemies.length < 1) {
            if (this.spawnTimer === undefined) {
                this.spawnTimer = 0;
            }

            this.spawnTimer += deltaTime;

            if (this.spawnTimer >= 2000) {
                const newEnemy = new enemyClass(this.game);
                if (initialY !== null) {
                    newEnemy.y = initialY;
                }
                if (additionalConfig) {
                    Object.assign(newEnemy, additionalConfig);
                }
                this.game.enemies.push(newEnemy);
                this.spawnTimer = undefined;
            }
        }
    }

    _prepareDashForTutorialStep(stepIndex) {
        const p = this.game.player;
        if (!p) return;

        p.isDashing = false;
        p.dashTimeLeft = 0;
        p.dashVelocity = 0;
        p.dashGhostTimer = 0;

        p.dashTimer = p.dashCooldown;
        p.dashBetweenTimer = p.dashBetweenCooldown;

        p.dashAwaitingSecond = false;
        p.dashSecondWindowTimer = 0;

        if (stepIndex === this._firstDashStepIndex) {
            p.dashCharges = p.dashMaxCharges;
        } else if (stepIndex === this._secondDashStepIndex) {
            p.dashCharges = 1;
        } else {
            p.dashCharges = Math.max(1, p.dashCharges ?? 0);
        }

        p.postDashGraceTimer = 0;
    }

    update(deltaTime) {
        if (this.game.menu.pause.isPaused) return;

        const currentStep = this.steps[this.currentStepIndex];

        if (this.currentStepIndex !== this._lastStepIndex) {
            this._lastStepIndex = this.currentStepIndex;

            if (currentStep && currentStep.action === "dashAttack") {
                this._prepareDashForTutorialStep(this.currentStepIndex);
            }
        }

        if (this.tutorialPause && currentStep) {
            this.game.audioHandler.firedogSFX.pauseAllSounds();
            this.game.audioHandler.enemySFX.pauseAllSounds();
            this.game.audioHandler.collisionSFX.pauseAllSounds();

            if (currentStep.action === "dashAttack") {
                const p = this.game.player;
                if (p) {
                    p.dashTimer = p.dashCooldown;
                    p.dashBetweenTimer = p.dashBetweenCooldown;
                }
            }

            if (this.currentStepIndex < this.steps.length) {
                this.cooldownTime += deltaTime;

                if (this.cooldownTime >= 300 && this.isStepKeyHeld(currentStep)) {
                    this.tutorialPause = false;
                    this.elapsedTime = 0;
                    this.cooldownTime = 0;
                }
            }
            return;
        }

        if (!this.tutorialPause && this.currentStepIndex < this.steps.length) {
            this.game.audioHandler.firedogSFX.resumeAllSounds();
            this.game.audioHandler.enemySFX.resumeAllSounds();
            this.game.audioHandler.collisionSFX.resumeAllSounds();

            this.elapsedTime += deltaTime;

            const nextStepIndex = this.currentStepIndex + 1;

            if (nextStepIndex < this.steps.length) {
                const nextStep = this.steps[nextStepIndex];
                if (nextStep.spawnEnemy) nextStep.spawnEnemy(deltaTime);
            }

            if (nextStepIndex < this.steps.length) {
                const nextStep = this.steps[nextStepIndex];

                if (this.elapsedTime >= nextStep.timerDuration && nextStep.condition()) {
                    this.currentStepIndex++;
                    this.tutorialPause = true;

                    if (this.currentStepIndex === this.steps.length - 1) {
                        nextStep.resetGameValues && nextStep.resetGameValues();
                    }
                }
            } else {
                this.game.isTutorialActive = false;
                this.tutorialPause = true;
                this.game.saveGameState();
            }
        }
    }

    isPlayerNearEnemy(enemy, distance) {
        if (!enemy) return false;
        const dx = this.game.player.x - enemy.x;
        return Math.abs(dx) <= distance && enemy.x + enemy.width < this.game.width;
    }

    isPlayerAtApproximateDistanceFromEnemy(enemy, distance, gap = 30) {
        if (!enemy) return false;
        const dx = Math.abs(this.game.player.x - enemy.x);
        return (
            dx >= distance - gap &&
            dx <= distance + gap &&
            enemy.x + enemy.width < this.game.width
        );
    }

    draw(context) {
        if (!this.tutorialPause) return;

        context.save();
        context.font = this.fontSize + this.fontFamily;
        context.textAlign = "left";
        context.textBaseline = "middle";

        context.lineWidth = 7;

        const currentStep = this.steps[this.currentStepIndex];
        const message = currentStep.message;
        const lines = message.split("\n");
        const lineHeight = parseInt(this.fontSize, 10);

        const phraseColorKeysPattern = `\\b(?:${Object.keys(this.phraseColors).join("|")})\\b|[^\\w\\s]`;

        lines.forEach((line, index) => {
            const y = this.game.height / 2 - ((lines.length - 1) * lineHeight) / 2 + index * lineHeight;

            const tokens = line.split(new RegExp(`(${phraseColorKeysPattern})`)).filter(Boolean);

            let x = this.game.width / 2 - context.measureText(line).width / 2;

            tokens.forEach((token) => {
                let fillStyle = "white";
                let strokeStyle = "black";

                if (token in this.phraseColors) {
                    fillStyle = this.phraseColors[token].fill;
                    strokeStyle = this.phraseColors[token].stroke;
                }

                context.fillStyle = fillStyle;
                context.strokeStyle = strokeStyle;
                context.strokeText(token, x, y);
                context.fillText(token, x, y);

                x += context.measureText(token).width;
            });
        });

        context.restore();
    }
}
