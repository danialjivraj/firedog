import { Dotter, MeatSoldier, Piper, Skulnap, SpearFish } from "../entities/enemies/enemies.js";

export class Tutorial {
    constructor(game) {
        this.game = game;
        this.fontSize = '50px ';
        this.fontFamily = 'Arial';
        this.currentStepIndex = 0;
        this.elapsedTime = 0;
        this.tutorialPause = true;
        this.cooldownTime = 0;
        this.steps = [
            {
                message: "Welcome to the Tutorial!\nPress Enter to continue.",
                key: 'Enter',
                condition: () => true,
                timerDuration: 0
            },
            {
                message: "To move right \nhold D!",
                key: 'd',
                condition: () => true,
                timerDuration: 1000
            },
            {
                message: "To move left \nhold A!",
                key: 'a',
                condition: () => true,
                timerDuration: 1000
            },
            {
                message: "To jump \npress W!",
                key: 'w',
                condition: () => this.game.player.onGround(),
                timerDuration: 1000
            },
            {
                message: "To sit down \npress S!",
                key: 's',
                condition: () => this.game.player.onGround(),
                timerDuration: 500
            },
            {
                message: "That's a Meat Soldier up ahead!\nLet's use Roll Attack!\nHold Enter to kill him!\nKeep in mind your Energy will keep \ndraining while you hold the key!",
                key: 'Enter',
                condition: () => {
                    const meatSoldier = this.game.enemies.find(enemy => enemy instanceof MeatSoldier);
                    return this.isPlayerNearEnemy(meatSoldier, 1200) && this.game.player.energyReachedZero === false;
                },
                timerDuration: 2000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(MeatSoldier, deltaTime);
                }
            },
            {
                message: "That's a Dotter up ahead!\nLet's use Roll Attack while jumping this time!\nPress W to jump and once you're near the enemy, hold Enter!",
                key: 'w',
                condition: () => {
                    const dotter = this.game.enemies.find(enemy => enemy instanceof Dotter);
                    return this.isPlayerNearEnemy(dotter, 1200) && this.game.player.energyReachedZero === false;
                },
                timerDuration: 2000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(Dotter, deltaTime, this.game.height - 400);
                }
            },
            {
                message: "Let's use Dive Attack this time!\nDo not jump and press D until\nyou're close enough to the Meat Soldier!",
                key: 'd',
                condition: () => {
                    const meatSoldier = this.game.enemies.find(enemy => enemy instanceof MeatSoldier);
                    return this.isPlayerNearEnemy(meatSoldier, 1500);
                },
                timerDuration: 3000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(MeatSoldier, deltaTime);
                }
            },
            {
                message: "To use Dive Attack, first, \npress W to jump!",
                key: 'w',
                condition: () => {
                    const playerOnGround = this.game.player.onGround();
                    const meatSoldier = this.game.enemies.find(enemy => enemy instanceof MeatSoldier);
                    const playerNearMeatSoldier = meatSoldier && this.isPlayerNearEnemy(meatSoldier, 200);
                    return playerOnGround && playerNearMeatSoldier;
                },
                timerDuration: 0,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(MeatSoldier, deltaTime);
                }
            },
            {
                message: "And now press S\nto Dive Attack while in the air!",
                key: 's',
                condition: () => this.game.player.vy === -1,
                timerDuration: 0
            },
            {
                message: "Good job!\nNow you will try a more advanced way of using Dive Attack.\nPress A to go all the way to the left!",
                key: 'a',
                condition: () => true,
                timerDuration: 2000
            },
            {
                message: "You can use Dive Attack while running forward\nwhich allows you to dive at a slight angle!\nHold D!",
                key: 'd',
                condition: () => {
                    const meatSoldier = this.game.enemies.find(enemy => enemy instanceof MeatSoldier);
                    return this.isPlayerAtApproximateDistanceFromEnemy(meatSoldier, 1250);
                },
                timerDuration: 3000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(MeatSoldier, deltaTime);
                }
            },
            {
                message: "Press W to jump while holding D!",
                key: 'w',
                condition: () => {
                    const playerOnGround = this.game.player.onGround();
                    const meatSoldier = this.game.enemies.find(enemy => enemy instanceof MeatSoldier);
                    const playerNearMeatSoldier = meatSoldier && this.isPlayerAtApproximateDistanceFromEnemy(meatSoldier, 800, 10);
                    return playerOnGround && playerNearMeatSoldier;
                },
                timerDuration: 0,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(MeatSoldier, deltaTime);
                }
            },
            {
                message: "Now Press S while holding D!",
                key: 's',
                condition: () => this.game.player.vy === -1,
                timerDuration: 0
            },
            {
                message: "Good job!\nKeep in mind Dive Attack does not require Energy\nso feel free to spam it when you need to!\nPress Enter to continue!",
                key: 'Enter',
                condition: () => true,
                timerDuration: 3000
            },
            {
                message: "You can jump or Dive Attack while using Roll Attack.\nHold Enter and press W, and once you're in the air press S!",
                key: 'Enter',
                condition: () => this.game.player.energyReachedZero === false,
                timerDuration: 4000,
            },
            {
                message: "Press Q to release your Fireball Attack!\nIt uses 8.0 of your Energy!",
                key: 'q',
                condition: () => this.game.player.fireballTimer >= this.game.player.fireballCooldown && this.game.player.energyReachedZero === false,
                timerDuration: 3000
            },
            {
                message: "Up ahead is a Skeleton Bomb (a Stun Enemy)!\nIf you make contact with any enemy that glows yellow,\nyou will get stunned for a split second and take damage.\nUse Q instead!",
                key: 'q',
                condition: () => {
                    const skulnap = this.game.enemies.find(enemy => enemy instanceof Skulnap);
                    return this.isPlayerNearEnemy(skulnap, 1200) && this.game.player.fireballTimer >= this.game.player.fireballCooldown && this.game.player.energyReachedZero === false && this.game.player.onGround();
                },
                timerDuration: 2000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(Skulnap, deltaTime);
                }
            },
            {
                message: "Now let's try to use Enter against the Skeleton Bomb\nso that you can see the stunning animation!",
                key: 'Enter',
                condition: () => {
                    const skulnap = this.game.enemies.find(enemy => enemy instanceof Skulnap);
                    return this.isPlayerNearEnemy(skulnap, this.game.width) && this.game.player.energyReachedZero === false;
                },
                timerDuration: 2000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(Skulnap, deltaTime);
                }
            },
            {
                message: "Up ahead is a Spear Fish (a Red Enemy)!\nRed Enemies will always damage you through your Roll Attack.\nHowever you can use Dive Attack or Fireball Attack safely!\nTry using Dive Attack!\nPress A to continue!",
                key: 'a',
                condition: () => {
                    const spearFish = this.game.enemies.find(enemy => enemy instanceof SpearFish);
                    return this.isPlayerNearEnemy(spearFish, 1200);
                },
                timerDuration: 2000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(SpearFish, deltaTime, null, { lives: 1 });
                }
            },
            {
                message: "Now try using your Roll Attack against the Spear Fish!\nNotice how you take damage!\nHold Enter!",
                key: 'Enter',
                condition: () => {
                    const spearFish = this.game.enemies.find(enemy => enemy instanceof SpearFish);
                    return this.isPlayerNearEnemy(spearFish, 1200) && this.game.player.fireballTimer >= this.game.player.fireballCooldown && this.game.player.energyReachedZero === false;
                },
                timerDuration: 4000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(SpearFish, deltaTime, null, { lives: 1 });
                }
            },
            {
                message: "Some enemies will have more than 1 Life!\n To quickly kill the enemy you can use Q followed by Enter!",
                key: 'q',
                condition: () => {
                    const piper = this.game.enemies.find(enemy => enemy instanceof Piper);
                    return this.isPlayerNearEnemy(piper, 1200) && this.game.player.fireballTimer >= this.game.player.fireballCooldown && this.game.player.energyReachedZero === false;
                },
                timerDuration: 4000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(Piper, deltaTime);
                }
            },
            {
                message: "Press E to go Invisible for 5 seconds!\nDuring this time, you can pass through any type of enemy\nas well as kill them without taking any damage!",
                key: 'e',
                condition: () => {
                    const skulnap = this.game.enemies.find(enemy => enemy instanceof Skulnap);
                    this.game.player.invisibleTimer = this.game.player.invisibleCooldown;
                    this.game.player.isInvisible = false;
                    return this.isPlayerNearEnemy(skulnap, 1200);
                },
                timerDuration: 3000,
                spawnEnemy: (deltaTime) => {
                    this.createSpawnEnemy(Skulnap, deltaTime);
                }
            },
            {
                message: "That's the end of the Tutorial!\nTo activate the Tutorial again, go to the How to Play Menu.\nPress Enter to continue.\nGood luck!",
                key: 'Enter',
                condition: () => true,
                timerDuration: 6000,
                resetGameValues: () => {
                    this.game.player.invisibleTimer = this.game.player.invisibleCooldown;
                    this.game.menu.levelDifficulty.setDifficulty(this.game.selectedDifficulty);
                    this.game.coins = 0;
                    this.game.player.energy = 100;
                }
            },
        ];
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

    update(deltaTime) {
        if (this.game.menu.pause.isPaused) {
            return;
        }

        const currentStep = this.steps[this.currentStepIndex];

        if (this.tutorialPause && currentStep) {
            this.game.audioHandler.firedogSFX.pauseAllSounds();
            this.game.audioHandler.enemySFX.pauseAllSounds();
            this.game.audioHandler.explosionSFX.pauseAllSounds();

            if (this.currentStepIndex < this.steps.length) {
                this.cooldownTime += deltaTime;

                if (this.cooldownTime >= 300 && this.game.input.keys.includes(currentStep.key)) {
                    this.tutorialPause = false;
                    this.elapsedTime = 0;
                    this.cooldownTime = 0;
                }
            }
        } else if (!this.tutorialPause && this.currentStepIndex < this.steps.length) {
            this.game.audioHandler.firedogSFX.resumeAllSounds();
            this.game.audioHandler.enemySFX.resumeAllSounds();
            this.game.audioHandler.explosionSFX.resumeAllSounds();

            this.elapsedTime += deltaTime;

            const nextStepIndex = this.currentStepIndex + 1;

            if (nextStepIndex < this.steps.length) {
                const nextStep = this.steps[nextStepIndex];
                if (nextStep.spawnEnemy) {
                    nextStep.spawnEnemy(deltaTime);
                }
            }

            if (nextStepIndex < this.steps.length) {
                const nextStep = this.steps[nextStepIndex];
                if (this.elapsedTime >= nextStep.timerDuration && nextStep.condition()) {
                    this.currentStepIndex++;
                    this.tutorialPause = true;
                    // Check if it's the last step and reset values
                    if (this.currentStepIndex === this.steps.length - 1) {
                        nextStep.resetGameValues();
                    }
                }
            } else {
                this.game.isTutorialActive = false;
            }
        }
    }

    isPlayerNearEnemy(enemy, distance) {
        if (!enemy) return false;
        const dx = this.game.player.x - enemy.x;
        return Math.abs(dx) <= distance && (enemy.x + enemy.width < this.game.width);
    }

    isPlayerAtApproximateDistanceFromEnemy(enemy, distance, gap = 30) {
        if (!enemy) return false;
        const dx = Math.abs(this.game.player.x - enemy.x);
        return dx >= (distance - gap) && dx <= (distance + gap) && (enemy.x + enemy.width < this.game.width);
    }

    draw(context) {
        if (this.tutorialPause) {
            context.save();
            context.font = this.fontSize + this.fontFamily;
            context.textAlign = 'left';
            context.textBaseline = 'middle';

            context.lineWidth = 7;

            const currentStep = this.steps[this.currentStepIndex];
            const message = currentStep.message;
            const lines = message.split('\n');
            const lineHeight = parseInt(this.fontSize);

            const phraseColors = {
                //words
                'Tutorial': { fill: 'green', stroke: 'black' },
                'Energy': { fill: 'black', stroke: 'DodgerBlue' },
                'Red Enemy': { fill: 'red', stroke: 'black' },
                'Stun Enemy': { fill: 'yellow', stroke: 'black' },
                '1 Life': { fill: 'black', stroke: 'MediumSeaGreen' },
                'How to Play': { fill: 'LightSeaGreen', stroke: 'black' },
                //keys
                'Q': { fill: 'orange', stroke: 'black' },
                'E': { fill: 'orange', stroke: 'black' },
                'W': { fill: 'orange', stroke: 'black' },
                'A': { fill: 'orange', stroke: 'black' },
                'S': { fill: 'orange', stroke: 'black' },
                'D': { fill: 'orange', stroke: 'black' },
                'Enter': { fill: 'orange', stroke: 'black' },
                //enemies
                'Meat Soldier': { fill: 'FireBrick', stroke: 'black' },
                'Dotter': { fill: 'FireBrick', stroke: 'black' },
                'Skeleton Bomb': { fill: 'FireBrick', stroke: 'black' },
                'Spear Fish': { fill: 'FireBrick', stroke: 'black' },
                //abilities
                'Dive Attack': { fill: 'DodgerBlue', stroke: 'black' },
                'Roll Attack': { fill: 'DodgerBlue', stroke: 'black' },
                'Fireball Attack': { fill: 'DodgerBlue', stroke: 'black' },
                'Invisible': { fill: 'DodgerBlue', stroke: 'black' },
            };

            lines.forEach((line, index) => {
                const y = this.game.height / 2 - (lines.length - 1) * lineHeight / 2 + index * lineHeight;

                const tokens = line.split(/(\b(?:Tutorial|Energy|Red Enemy|Stun Enemy|1 Life|How to Play|Q|E|W|A|S|D|Enter|Meat Soldier|Dotter|Skeleton Bomb|Dive Attack|Roll Attack|Fireball Attack|Invisible)\b|[^\w\s])/).filter(Boolean);

                let x = this.game.width / 2 - context.measureText(line).width / 2;

                tokens.forEach((token) => {
                    let fillStyle = 'white';
                    let strokeStyle = 'black';

                    if (token in phraseColors) {
                        fillStyle = phraseColors[token].fill;
                        strokeStyle = phraseColors[token].stroke;
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
}
