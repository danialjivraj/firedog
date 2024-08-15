import { Sitting, Running, Jumping, Falling, Rolling, Diving, Stunned, Hit, Standing, Dying } from '../animations/playerStates.js';
import {
    CollisionAnimation, ExplosionCollisionAnimation, PoisonSpitSplash, InkSplashCollision, Blood,
    ElectricityCollision, InkBombCollision, RedFireballExplosion, PurpleFireballExplosion, PoisonDropCollision,
    MeteorExplosionCollision
} from '../animations/collisionAnimation.js';
import { HealthLive, RedPotion, BluePotion, Coin, OxygenTank } from './powerUp.js';
import { BlackHole, Cauldron, Drink } from './powerDown.js';
import { FloatingMessage } from '../animations/floatingMessages.js';
import { Fireball, CoinLoss } from '../animations/particles.js';
import {
    AngryBee, Bee, Skulnap, PoisonSpit, Goblin, Sluggie, Voltzeel, Tauro,
    Aura, KarateCroco, SpearFish, TheRock, LilHornet, Cactus, IceBall, Garry, RockProjectile, VolcanoWasp, Volcanurtle
} from './enemies/enemies.js';
import { InkSplash } from '../animations/ink.js';
import { DamageIndicator } from '../animations/damageIndicator.js';
import { TunnelVision } from '../animations/tunnelVision.js';
import { Elyvorg, Arrow, Barrier, ElectricWheel, GravitationalAura, InkBomb, PurpleFireball, PoisonDrop, MeteorAttack, PurpleSlash } from './enemies/elyvorg.js';

export class Player {
    constructor(game) {
        this.game = game;
        //images
        this.image = document.getElementById('player')
        this.hatImage = document.getElementById('player2')
        this.choloImage = document.getElementById('player3')
        this.zabkaImage = document.getElementById('player4')
        this.shinyImage = document.getElementById('player5')
        this.particleImage = 'fire';
        this.splashImage = 'fire';
        //firedog vars
        this.width = 100;
        this.height = 91.3;
        this.x = 0;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.frameX = 0;
        this.frameY = 0;
        this.vy = 0;
        this.weight = 1;
        this.maxFrame;
        this.fps = 31;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.speed = 0;
        this.maxSpeed = 10;
        this.previousLives = this.game.lives;
        this.facingRight = true;
        this.facingLeft = false;
        this.isRolling = false; // for sound
        this.firstLoopDamageIndicator = true;
        //collision
        this.collisionCooldowns = {};
        this.collisionLogic = new CollisionLogic(this.game, this);
        //underwater vars
        this.isUnderwater = false;
        this.loopDamageIndicator = true;
        this.buoyancy = 4;
        //states
        this.states = [new Sitting(this.game), new Running(this.game), new Jumping(this.game),
        new Falling(this.game), new Rolling(this.game), new Diving(this.game), new Stunned(this.game),
        new Hit(this.game), new Standing(this.game), new Dying(this.game)];
        this.previousState = null;
        this.currentState = null;
        //energy
        this.energy = 100;
        this.energyTimer = 0;
        this.energyInterval = 100;
        this.energyReachedZero = false;
        this.noEnergyLeftSound = false;
        //blue potion
        this.blueFireTimer = 0;
        this.isBluePotionActive = false
        this.bluePotionSpeed = 22;
        this.isRedPotionActive = false;
        this.redPotionTimer = 0;
        //poison
        this.isPoisonedActive = false;
        this.poisonTimer = 0;
        //blackHole
        this.isBlackHoleActive = false;
        //slow down
        this.isSlowed = false;
        this.slowedTimer = 0;
        //fireball cooldowns
        this.fireballTimer = 1000;
        this.fireballCooldown = 1000;
        //diving cooldowns
        this.divingTimer = 500;
        this.divingCooldown = 500;
        //invisible cooldowns
        this.isInvisible = false;
        this.invisibleTimer = 40000;
        this.invisibleCooldown = 40000;
        this.invisibleActiveCooldownTimer = 0;
        //firedog vars when interacting with elyvorg
        this.setToRunOnce = true;
        this.setToStandingOnce = true;
        //elyvorg vars
        this.elyvorgCollisionTimer = 1000;
        this.elyvorgCollisionCooldown = 1000;
        this.resetElectricWheelCounters = false;
    }
    underwaterOrNot() {
        if (this.isUnderwater) {
            this.particleImage = 'bubble';
            this.splashImage = 'bubble';
        } else {
            this.particleImage = 'fire';
            this.splashImage = 'fire';
        }
    }
    elyvorgCollisionTimers(deltaTime) { // this is needed for collision relating to elyvorg, barrier, slash and electricWheel
        if (this.game.elyvorgInFight) {
            this.elyvorgCollisionTimer += deltaTime;
            this.elyvorgCollisionTimer = Math.min(this.elyvorgCollisionTimer, this.elyvorgCollisionCooldown);
        }
    }
    update(input, deltaTime) {
        this.checkIfFiredogIsDead();

        this.firedogLivesLimit();
        this.energyLogic(deltaTime);

        this.divingAbility(deltaTime)
        this.fireballAbility(input, deltaTime);
        this.invisibleAbility(input, deltaTime);
        this.elyvorgCollisionTimers(deltaTime);

        if (!this.currentState.deathAnimation) {
            this.playerSFXAudios();
            this.currentState.handleInput(input);
            this.underwaterGravityAndIndicator();

            this.spriteAnimation(deltaTime);
            this.playerHorizontalMovement(input);
            this.playerVerticalMovement(input);
            this.checkIfFiredogIsSlowed(deltaTime);

            this.collisionWithEnemies(deltaTime);
            this.collisionWithPowers(deltaTime);

            this.firedogMeetsElyvorg(input);
        }
    }
    draw(context) {
        if (this.game.gameOver) {
            context.save();
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            if (this.facingRight) {
                context.scale(1, 1);
            } else {
                context.scale(-1, 1);
            }
            this.drawPlayerWithCurrentSkin(context);
            context.restore();
        } else {
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.save();
            context.translate(this.x + this.width / 2, this.y + this.height / 2);

            if (this.game.isElyvorgFullyVisible) {
                const elyvorgInstance = this.game.enemies.find(enemy => enemy instanceof Elyvorg);
                const elyvorgOnRight = elyvorgInstance ? elyvorgInstance.x + elyvorgInstance.width / 2 > this.x + this.width / 2 : false;
                if (elyvorgOnRight) {
                    this.facingRight = true;
                    this.facingLeft = false;
                    context.scale(1, 1);
                } else {
                    this.facingRight = false;
                    this.facingLeft = true;
                    context.scale(-1, 1);
                }
            } else {
                context.scale(1, 1);
                this.facingRight = true;
                this.facingLeft = false;
            }

            this.drawPlayerWithCurrentSkin(context);

            context.restore();
        }
    }

    drawPlayerWithCurrentSkin(context) {
        if (this.isInvisible) {
            context.globalAlpha = 0.5;
        }

        // draws the player based on the current skin
        switch (this.game.menu.skins.currentSkin) {
            case this.game.menu.skins.defaultSkin:
                context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
                break;
            case this.game.menu.skins.hatSkin:
                context.drawImage(this.hatImage, this.frameX * this.width, this.frameY * this.height, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
                break;
            case this.game.menu.skins.choloSkin:
                context.drawImage(this.choloImage, this.frameX * this.width, this.frameY * this.height, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
                break;
            case this.game.menu.skins.zabkaSkin:
                context.drawImage(this.zabkaImage, this.frameX * this.width, this.frameY * this.height, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
                break;
            case this.game.menu.skins.shinySkin:
                context.drawImage(this.shinyImage, this.frameX * this.width, this.frameY * this.height, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
                break;
        }
        context.globalAlpha = 1;
    }

    //lives
    firedogLivesLimit() {
        this.game.lives = Math.min(this.game.lives, this.game.maxLives);
    }

    //energy
    energyLogic(deltaTime) {
        this.energyTimer += deltaTime;
        this.energy = Math.max(0, Math.min(100, this.energy));
        if (this.energyTimer >= this.energyInterval) {
            this.energyTimer = 0;
            this.energy = Math.min(100, this.energy + 0.4);
        }
        //blue potion
        if (this.isBluePotionActive && this.currentState === this.states[4]) {
            this.game.enemyInterval = 100;
            this.noEnergyLeftSound = false;
            this.isPoisonedActive = false;
            this.energy = Math.min(100, this.energy + 0.1);
        } else {
            this.game.enemyInterval = 1000;
            this.energyInterval = 70;
        }
        if (this.energyReachedZero === true && this.energy >= 20) {
            this.energyReachedZero = false;
            this.noEnergyLeftSound = false;
        }
        //poison
        if (this.isPoisonedActive) {
            if (this.poisonTimer > 0) {
                this.poisonTimer -= deltaTime;
            } else {
                this.poisonTimer = 0;
                this.isPoisonedActive = false;
            }

            if (!this.energyReachedZero) {
                this.energy = Math.max(0, this.energy - 0.1);
                if (this.poisonTimer <= 0) {
                    this.isPoisonedActive = false;
                    this.energyInterval = 100; // reset to normal regeneration interval
                } else {
                    this.energyInterval = 1000; // slow regeneration interval during poison
                }
                if (this.energy <= 0) {
                    this.isPoisonedActive = false;
                    this.energyReachedZero = true;
                    this.energyInterval = 100; // reset to normal regeneration interval
                }
            }
        }
        if (this.energyReachedZero && this.poisonTimer > 0) {
            this.isPoisonedActive = false;
            this.poisonTimer -= deltaTime;
        } else if (this.poisonTimer <= 0) {
            this.isPoisonedActive = false;
        }
    }
    isPoisonActiveChecker() {
        if (this.energyReachedZero || this.isBluePotionActive) {
            return this.isPoisonedActive = false;
        } else {
            return this.isPoisonedActive = true;
        }
    }
    isPoisonTimerChecker(x) {
        if (this.energyReachedZero || this.isBluePotionActive) {
            return this.poisonTimer = 0;
        } else {
            return this.poisonTimer = x;
        }
    }
    drainEnergy() {
        if (!this.isBluePotionActive) {
            const energyDrainAmount = 0.4;
            this.energy = Math.max(0, this.energy - energyDrainAmount);
            if (this.energy <= 0) {
                this.energyReachedZero = true;
            }
        }
    }

    // abilities
    divingAbility(deltaTime) {
        this.divingTimer += deltaTime;
        this.divingTimer = Math.min(this.divingTimer, this.divingCooldown);
    }
    fireballAbility(input, deltaTime) {
        this.fireballTimer += deltaTime;
        this.fireballTimer = Math.min(this.fireballTimer, this.fireballCooldown);

        if (this.currentState === this.states[0] || this.currentState === this.states[1] || this.currentState === this.states[2] ||
            this.currentState === this.states[3] || this.currentState === this.states[8]) {
            if (this.game.player.energyReachedZero === false && this.fireballTimer >= this.fireballCooldown) {
                if ((this.game.input.qOrLeftClick(input)) && !this.game.cabin.isFullyVisible) {
                    if (!this.isUnderwater) {
                        if (this.isRedPotionActive) {
                            this.game.audioHandler.firedogSFX.playSound('fireballRedPotionActiveSFX', false, true);
                        } else {
                            this.game.audioHandler.firedogSFX.playSound('fireballSFX', false, true);
                        }
                    } else {
                        if (this.isRedPotionActive) {
                            this.game.audioHandler.firedogSFX.playSound('fireballUnderwaterRedPotionSFX', false, true);
                        } else {
                            this.game.audioHandler.firedogSFX.playSound('fireballUnderwaterSFX', false, true);
                        }
                    }

                    const yOffset = this.currentState === this.states[0] ? 15 : 0;

                    const fireballDirection = this.facingRight ? 'right' : 'left';
                    if (this.isRedPotionActive) {
                        for (let i = -6; i <= 0; i++) {
                            const xPos = this.x + 10 + this.width * 0.5;
                            const yPos = this.y + this.height * 0.5 + yOffset;
                            if (this.isUnderwater === true) {
                                this.game.behindPlayerParticles.unshift(new Fireball(this.game, xPos, yPos, 'bubble_redPotion', fireballDirection, i));
                            } else {
                                this.game.behindPlayerParticles.unshift(new Fireball(this.game, xPos, yPos, 'redPotionFireball', fireballDirection, i));
                            }
                        }
                    } else {
                        const xPos = this.x + 10 + this.width * 0.5;
                        const yPos = this.y + this.height * 0.5 + yOffset;
                        if (this.isUnderwater === true) {
                            this.game.behindPlayerParticles.unshift(new Fireball(this.game, xPos, yPos, 'bubble_projectile', fireballDirection));
                        } else {
                            this.game.behindPlayerParticles.unshift(new Fireball(this.game, xPos, yPos, 'fireball', fireballDirection));
                        }
                    }

                    this.energy = this.energy - 8;
                    if (this.energy <= 0) {
                        this.energyReachedZero = true;
                    }

                    this.fireballTimer = 0;
                }
            }
        }
        if (this.isRedPotionActive) {
            this.redPotionTimer -= deltaTime;
            if (this.redPotionTimer <= 0) {
                this.isRedPotionActive = false;
            }
        }
    }
    invisibleAbility(input, deltaTime) {
        this.invisibleTimer += deltaTime;
        this.invisibleTimer = Math.min(this.invisibleTimer, this.invisibleCooldown);

        if ((this.game.input.eOrScrollClick(input)) && this.isInvisible === false && !this.game.gameOver) {
            if (this.invisibleTimer === this.invisibleCooldown) {
                this.isInvisible = true;
                this.game.audioHandler.firedogSFX.playSound('invisibleInSFX');
            }
        }
        if (this.invisibleTimer >= this.invisibleCooldown && this.isInvisible) {
            this.invisibleTimer = 0;
            this.invisibleActiveCooldownTimer = 5000;
        }
        if (this.isInvisible) {
            this.invisibleActiveCooldownTimer -= deltaTime;
            if (this.invisibleActiveCooldownTimer <= 0) {
                this.game.audioHandler.firedogSFX.playSound('invisibleOutSFX');
                this.isInvisible = false;
            }
        }
    }

    // audios
    playerSFXAudios() {
        //rolling
        if (this.rollingOrDiving()) {
            const rollingSoundName = this.isUnderwater ? 'rollingUnderwaterSFX' : 'rollingSFX';
            if (!this.isRolling) {
                this.isRolling = true;
                this.rollingSound = this.game.audioHandler.firedogSFX.playSound(rollingSoundName, true, true);
            }
            if (this.currentState === this.states[5] && this.onGround()) {
                this.rollingSound = this.game.audioHandler.firedogSFX.playSound(rollingSoundName, true, true);
            }
        } else {
            if (this.isRolling) {
                this.isRolling = false;
                const rollingSoundName = this.isUnderwater ? 'rollingUnderwaterSFX' : 'rollingSFX';
                this.game.audioHandler.firedogSFX.stopSound(rollingSoundName);
            }
        }
        //running
        if (this.currentState === this.states[1]) {
            if (this.frameX === 3) {
                this.game.audioHandler.firedogSFX.playSound('runningSFX1');
            }
            if (this.frameX === 6) {
                this.game.audioHandler.firedogSFX.playSound('runningSFX2');
            }
        }
        //getting hit
        if (this.game.lives < this.previousLives) {
            this.game.audioHandler.firedogSFX.playSound('gettingHit', false, true);
            if (this.game.time >= 1000) {
                this.triggerDamageIndicator();
            } else {
                this.game.audioHandler.firedogSFX.stopSound('gettingHit');
            }
        }
        this.previousLives = this.game.lives;
        //no energy
        if (this.energyReachedZero) {
            if (!this.noEnergyLeftSound) {
                this.game.audioHandler.firedogSFX.playSound('energyReachedZeroSound');
                this.noEnergyLeftSound = true;
            }
        }
    }

    // states
    setState(state, speed) {
        this.previousState = this.currentState;
        this.currentState = this.states[state];
        if (!this.game.isElyvorgFullyVisible) {
            if (this.isBluePotionActive && this.currentState === this.states[4]) {
                this.game.speed = this.bluePotionSpeed;
            } else {
                this.game.speed = this.game.normalSpeed * speed;
            }
        } else {
            this.game.speed = 0;
        }
        this.currentState.enter();
    }
    rollingOrDiving() {
        if (this.currentState === this.states[4] || this.currentState === this.states[5]) {
            return true;
        } else {
            return false;
        }
    }

    // taking damage
    hit(enemy) {
        if (this.isInvisible === false) {
            if (this.currentState === this.states[0]) {
                this.setState(7, 0);
            } else {
                this.setState(7, 1);
            }
            if (!(enemy instanceof Goblin) && !(enemy instanceof PoisonDrop)) {
                this.game.coins -= 1;
                this.game.lives -= 1;
            }
        }
    }
    stunned(enemy) {
        if (this.isInvisible === false) {
            this.game.audioHandler.firedogSFX.playSound('stunnedSound', false, true);
            this.setState(6, 0);
            if (!(enemy instanceof Skulnap) && !(enemy instanceof ElectricWheel)) {
                this.bloodOrPoof(enemy);
            }
            this.game.coins -= 1;
            this.game.lives -= 1;
        }
    }
    bloodOrPoof(enemy) {
        if (!(enemy instanceof GravitationalAura)) {
            if (enemy.lives >= 1 && (!(enemy instanceof Barrier))) {
                this.game.collisions.push(new Blood(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, enemy));
                this.game.audioHandler.explosionSFX.playSound('bloodSound', false, true);
            } else {
                if (!(enemy instanceof Barrier)) {
                    this.game.audioHandler.explosionSFX.playSound('poofSound', false, true);
                    this.game.collisions.push(new CollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, this.isBluePotionActive));
                    if (enemy instanceof Goblin) {
                        this.game.audioHandler.enemySFX.playSound('goblinDie', false, true);
                    }
                }
            }
        }
    }

    // screen indicators
    triggerDamageIndicator() {
        const oneMinute = 60000;
        if (this.game.mapSelected[3] && this.game.time < this.game.maxTime - oneMinute) {
            this.firstLoopDamageIndicator = true;
        }
        const existingDamageIndicator = this.game.collisions.find(collision => collision instanceof DamageIndicator);
        if (existingDamageIndicator) {
            if (this.game.mapSelected[3] && this.game.time >= this.game.maxTime - oneMinute) {
                // do nothing
            } else {
                existingDamageIndicator.reset();
            }
        } else {
            const damageIndicator = new DamageIndicator(this.game);
            this.game.collisions.push(damageIndicator);
        }
    }
    underwaterGravityAndIndicator() {
        if (this.isUnderwater) {
            if (this.game.player.onGround()) {
                this.vy = 0;
            } else {
                const vyDecreaseFactor = 0.01;
                this.vy = Math.max(-3, this.vy - vyDecreaseFactor * this.y / this.buoyancy);
            }
            if (this.game.UI.secondsLeftActivated && this.loopDamageIndicator && !this.game.cabin.isFullyVisible) {
                if (this.game.time >= 1000) {
                    if (this.firstLoopDamageIndicator) {
                        this.firstLoopDamageIndicator = false;
                        const existingDamageIndicator = this.game.collisions.find(collision => collision instanceof DamageIndicator);
                        if (existingDamageIndicator) {
                            existingDamageIndicator.reset();
                        }
                    }
                    this.triggerDamageIndicator();
                    this.loopDamageIndicator = false;
                }
            }
        }
    }
    triggerInkSplash() {
        if (this.isInvisible === false) {
            const inkSplash = new InkSplash(this.game);
            inkSplash.x = this.x - inkSplash.getWidth() / 2;
            this.game.collisions.push(inkSplash);
        }
    }
    triggerTunnelVision() {
        const existingTunnelVision = this.game.collisions.find(collision => collision instanceof TunnelVision);
        if (existingTunnelVision) {
            return;
        }
        this.game.collisions = this.game.collisions.filter(collision => !(collision instanceof TunnelVision));

        const tunnelVision = new TunnelVision(this.game);
        this.game.collisions.push(tunnelVision);
    }

    // movement logic
    spriteAnimation(deltaTime) {
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime
        }
    }
    onGround() {
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }
    playerHorizontalMovement(input) {
        // horizontal movement
        this.x += this.speed;
        if (input.includes('d') && this.currentState !== this.states[6]) {
            this.speed = this.maxSpeed;
        } else if (input.includes('a') && this.currentState !== this.states[6]) {
            if (this.game.isElyvorgFullyVisible || this.game.cabin.isFullyVisible) {
                this.speed = -this.maxSpeed;
            } else if (this.currentState === this.states[4]) {
                this.speed = -this.maxSpeed * 1.7;
            } else {
                this.speed = -this.maxSpeed * 1.3;
            }
        } else {
            this.speed = 0;
        }
        //horizontal bondaries
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > this.game.width - this.width) {
            this.x = this.game.width - this.width;
        }
    }
    playerVerticalMovement(input) {
        //vertical movement
        this.y += this.vy;
        if (!this.onGround()) {
            this.vy += this.weight;
        } else {
            this.vy = 0;
        }
        if (this.isUnderwater) {
            if (this.game.input.enterOrRightClick(input) && input.includes('w') && this.currentState === this.states[4]) {
                this.buoyancy -= 1;
                this.y -= 4
            }
            if (this.buoyancy < 1) {
                this.buoyancy = 1;
            } else if (this.buoyancy > 4) {
                this.buoyancy = 4;
            }
        }
        //vertical boundaries
        if (this.y > this.game.height - this.height - this.game.groundMargin) {
            this.y = this.game.height - this.height - this.game.groundMargin;
        }
    }
    firedogMeetsElyvorg(input) {
        if (this.game.isElyvorgFullyVisible && this.currentState === this.states[4]) {
            if (this.facingRight) {
                if (this.game.input.enterOrRightClick(input) && !input.includes('a') && !input.includes('d')) {
                    this.x = this.x;
                } else if (input.includes('a')) {
                    this.x -= 6;
                } else {
                    this.x += 6;
                }
            } else if (this.facingLeft) {
                if (this.game.input.enterOrRightClick(input) && !input.includes('a') && !input.includes('d')) {
                    this.x = this.x;
                } else if (input.includes('d')) {
                    this.x += 6;
                } else {
                    this.x -= 6;
                }
            }
        }
        if (this.game.talkToElyvorg && this.game.isElyvorgFullyVisible) {
            if (this.x > 0) {
                if (this.setToRunOnce) {
                    this.game.input.keys = [];
                    this.setToRunOnce = false;
                    this.setState(1, 1);
                }
                this.x -= 6;
            } else {
                if (this.setToStandingOnce) {
                    setTimeout(() => {
                        this.game.input.keys = [];
                        this.setToStandingOnce = false;
                        this.setState(8, 0);
                    }, 10);
                }
            }
        }
    }
    checkIfFiredogIsDead() {
        if (this.game.lives <= 0) {
            if (this.game.noDamageDuringTutorial) {
                this.game.menu.levelDifficulty.setDifficulty(this.game.selectedDifficulty);
            } else {
                this.game.gameOver = true;
            }
        }
        if (this.currentState.deathAnimation && this.isUnderwater) {
            if (this.game.player.onGround()) {
                this.y = this.y;
            } else {
                this.y += 2;
            }
        }
    }
    checkIfFiredogIsSlowed(deltaTime) {
        if (this.isSlowed) {
            if (this.slowedTimer > 0) {
                this.slowedTimer -= deltaTime;
                this.normalSpeed = 4;
                this.maxSpeed = 6;
            } else {
                this.slowedTimer = 0;
                this.isSlowed = false;
                this.normalSpeed = 6;
                this.maxSpeed = 10;
            }
        }
    }

    // types of collision
    collisionWithEnemies(deltaTime) {
        const enemiesHit = new Set(); // keeps track of enemies already hit by isRedPotionActive fireballs

        this.game.enemies.forEach(enemy => {
            this.handleFiredogCollisionWithEnemy(enemy);
            this.handleFireballCollisionWithEnemy(enemy, enemiesHit);
            this.collisionAnimationFollowsEnemy(enemy);
        });

        this.updateCollisionCooldowns(deltaTime);
    }

    handleFiredogCollisionWithEnemy(enemy) {
        if (this.game.gameOver || this.collisionCooldowns[enemy.id] > 0) {
            return;
        }

        if (enemy.x < this.x + this.width && enemy.x + enemy.width > this.x &&
            enemy.y < this.y + this.height && enemy.y + enemy.height > this.y && !this.game.gameOver) {
            if (!this.isInvisible || (this.isInvisible && this.rollingOrDiving())) {
                this.collisionCooldowns[enemy.id] = 500;
                if (!(enemy instanceof Elyvorg)) { // elyvorg is dealt separately in handleRollingOrDivingCollision(enemy)
                    enemy.lives -= 1;
                }
            }

            if (this.rollingOrDiving()) {
                if (this.isBluePotionActive) { // enemies get one shot if in blue potion state
                    enemy.lives -= 3;
                    this.handleFloatingMessages(enemy);
                    this.bloodOrPoof(enemy);
                    return;
                }

                this.collisionLogic.handleRollingOrDivingCollision(enemy);
                this.handleFloatingMessages(enemy);
            } else {
                this.collisionLogic.handleNormalCollision(enemy);
            }
        }
    }
    handleFireballCollisionWithEnemy(enemy, enemiesHit) {
        this.game.behindPlayerParticles.forEach(behindPlayerParticle => {
            if (behindPlayerParticle instanceof Fireball &&
                behindPlayerParticle.x < enemy.x + enemy.width &&
                behindPlayerParticle.x + behindPlayerParticle.size > enemy.x &&
                behindPlayerParticle.y < enemy.y + enemy.height &&
                behindPlayerParticle.y + behindPlayerParticle.size > enemy.y
            ) {
                this.handleSpecificFireballCollisions(behindPlayerParticle, enemy, enemiesHit);
            }
        });
    }
    handleSpecificFireballCollisions(fireball, enemy, enemiesHit) {
        if (enemiesHit.has(enemy)) {
            return;
        }
        enemiesHit.add(enemy);
        if (!(enemy instanceof Elyvorg)) {
            enemy.lives--;
        }

        if (fireball.type === "normalMode") {
            fireball.markedForDeletion = true;
        }

        const enemyFireballCollisions = {
            PurpleFireball: () => {
                this.game.collisions.push(new RedFireballExplosion(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                this.game.audioHandler.explosionSFX.playSound('fireballExplosionSound', false, true);
                this.game.floatingMessages.push(new FloatingMessage('+20', enemy.x, enemy.y, 160, 120, 30, 'orange'));
                this.energy += 20;
                const message = Math.random() < 0.5 ? "NICE!" : "EPIC!";
                this.game.floatingMessages.push(new FloatingMessage(message, enemy.x, enemy.y, this.game.width / 2, 80, 50));
            },
            MeteorAttack: () => {
                this.game.collisions.push(new MeteorExplosionCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                this.game.audioHandler.enemySFX.playSound('elyvorg_meteor_in_contact_sound', false, true);
            },
            PoisonDrop: () => {
                this.game.collisions.push(new PoisonDropCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                this.game.audioHandler.explosionSFX.playSound('poisonDropCollisionSound', false, true);
            },
            ElectricWheel: () => {
                this.game.collisions.push(new ElectricityCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                this.game.audioHandler.explosionSFX.playSound('elyvorg_electricity_wheel_collision_sound', false, true);
            },
            Goblin: () => {
                this.game.collisions.push(new CollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                this.game.audioHandler.enemySFX.playSound('goblinDie', false, true);
                this.game.audioHandler.explosionSFX.playSound('poofSound', false, true);
                enemy.lives = 0;
            },
            Skulnap: () => {
                this.game.collisions.push(new ExplosionCollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, enemy.id));
                this.game.audioHandler.explosionSFX.playSound('explosionCollision', false, true);
            },
            Sluggie: () => {
                this.game.collisions.push(new InkSplashCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                this.game.audioHandler.explosionSFX.playSound('slugExplosion', false, true);
            },
            InkBomb: () => {
                this.game.collisions.push(new InkBombCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                this.game.audioHandler.explosionSFX.playSound('slugExplosion', false, true);
            },
            Garry: () => {
                this.game.collisions.push(new InkSplashCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                this.game.audioHandler.explosionSFX.playSound('slugExplosion', false, true);
            },
            PoisonSpit: () => {
                this.game.collisions.push(new PoisonSpitSplash(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                this.game.audioHandler.explosionSFX.playSound('poofSound', false, true);
            },
            Elyvorg: () => {
                if (enemy.isBarrierActive === false) {
                    enemy.lives--;
                    this.bloodOrPoof(enemy)
                }
            },
            default: () => {
                this.bloodOrPoof(enemy);
            }
        };

        const enemyType = enemy.constructor.name;
        const action = enemyFireballCollisions[enemyType] || enemyFireballCollisions['default'];
        action();

        this.handleFloatingMessages(enemy);
    }
    collisionAnimationFollowsEnemy(enemy) {
        this.game.collisions.forEach(collision => {
            if (collision instanceof ElectricityCollision && enemy instanceof ElectricWheel) {
                if (collision.x < this.x + this.width &&
                    collision.x + collision.width > this.x &&
                    collision.y < this.y + this.height &&
                    collision.y + collision.height > this.y) {
                    collision.updatePositionWhereCollisionHappened(collision.x, collision.y);
                } else {
                    collision.updatePosition(enemy);
                }
            } else if (collision instanceof Blood && collision.enemy === enemy) {
                collision.updatePosition(enemy);
            }
        });
    }
    updateCollisionCooldowns(deltaTime) {
        Object.keys(this.collisionCooldowns).forEach(enemyId => {
            this.collisionCooldowns[enemyId] = Math.max(0, this.collisionCooldowns[enemyId] - deltaTime);
        });
    }

    collisionWithPowers(deltaTime) {
        const checkPowerCollision = (items, callback, isPowerDown) => {
            items.forEach(item => {
                if (
                    item.x < this.x + this.width &&
                    item.x + item.width > this.x &&
                    item.y < this.y + this.height &&
                    item.y + item.height > this.y &&
                    !this.game.gameOver && (!isPowerDown || !this.isInvisible) // power downs can't be collided if invisible ability is on
                ) {
                    item.markedForDeletion = true;
                    callback(item);
                }
            });
        };

        if (!this.game.gameOver) {
            // power down collisions
            checkPowerCollision(
                this.game.powerDowns.filter(pd => pd instanceof Drink), drink => {
                    this.isSlowed = true;
                    this.slowedTimer = 7000;
                    this.game.audioHandler.powerUpAndDownSFX.playSound('drinkSoundEffect', false, true);
                },
                true
            );
            checkPowerCollision(this.game.powerDowns.filter(pd => pd instanceof Cauldron), cauldron => {
                this.game.audioHandler.powerUpAndDownSFX.playSound('cauldronSoundEffect', false, true);
                this.isPoisonActiveChecker();
                this.isPoisonTimerChecker(2500);
            }, true
            );
            checkPowerCollision(this.game.powerDowns.filter(pd => pd instanceof BlackHole), blackhole => {
                this.isBlackHoleActive = true;
                this.game.player.triggerTunnelVision();
                this.game.audioHandler.powerUpAndDownSFX.playSound('darkHoleLaughSound');
            }, true
            );

            // power up collisions
            checkPowerCollision(this.game.powerUps.filter(pu => pu instanceof OxygenTank), oxygenTank => {
                this.game.time -= 10000;
                this.game.audioHandler.powerUpAndDownSFX.playSound('oxygenTankSound', false, true);
                this.game.floatingMessages.push(new FloatingMessage('+10s', oxygenTank.x, oxygenTank.y, 115, 90, 30, 'white', 'black', true));
            }, false
            );
            checkPowerCollision(this.game.powerUps.filter(pu => pu instanceof HealthLive), healthLive => {
                this.game.lives++;
                this.game.audioHandler.powerUpAndDownSFX.playSound('healthLiveSound', false, true);
            }, false
            );
            checkPowerCollision(this.game.powerUps.filter(pu => pu instanceof Coin), coin => {
                this.game.coins += 10;
                this.game.floatingMessages.push(new FloatingMessage('+10', coin.x, coin.y, 150, 50, 30, 'yellow'));
                this.game.audioHandler.powerUpAndDownSFX.playSound('coinSound', false, true);
            }, false
            );
            checkPowerCollision(this.game.powerUps.filter(pu => pu instanceof RedPotion), redPotion => {
                this.game.audioHandler.powerUpAndDownSFX.playSound('redPotionSound', false, true);
                this.isRedPotionActive = true;
                this.redPotionTimer = 15000;
            }, false
            );
            checkPowerCollision(this.game.powerUps.filter(pu => pu instanceof BluePotion), bluePotion => {
                if (this.currentState === this.states[4] || this.currentState === this.states[5]) {
                    this.game.audioHandler.powerUpAndDownSFX.playSound('bluePotionSound', false, true);
                } else {
                    this.game.audioHandler.powerUpAndDownSFX.playSound('bluePotionSound2', false, true);
                }

                this.game.audioHandler.firedogSFX.playSound('bluePotionEnergyGoingUp');

                this.energyReachedZero = false;

                if (this.isUnderwater) {
                    this.particleImage = 'bluebubble';
                    this.splashImage = 'bluebubble';
                } else {
                    this.particleImage = 'bluefire';
                    this.splashImage = 'bluefire';
                }
                if (this.currentState === this.states[4]) {
                    this.game.speed = this.bluePotionSpeed;
                }
                this.blueFireTimer = 5000;
                this.isBluePotionActive = true;
            }, false
            );
        }

        if (this.blueFireTimer > 0) {
            this.blueFireTimer -= deltaTime;

            if (this.blueFireTimer <= 0) {
                if (this.isUnderwater) {
                    this.particleImage = 'bubble';
                    this.splashImage = 'bubble';
                } else {
                    this.particleImage = 'fire';
                    this.splashImage = 'fire';
                }

                this.isBluePotionActive = false;
                this.game.audioHandler.firedogSFX.stopSound('bluePotionEnergyGoingUp');

                if (this.isBluePotionActive === false && this.currentState === this.states[4]) {
                    this.game.speed = 12;
                } else {
                    this.game.speed = 6;
                }
            }
        }
    }

    collisionAnimationBasedOnEnemy(enemy) {
        switch (true) {
            case enemy instanceof Sluggie || enemy instanceof InkBomb || enemy instanceof Garry:
                this.game.audioHandler.explosionSFX.playSound('slugExplosion', false, true);
                if (enemy instanceof Sluggie || enemy instanceof Garry) {
                    this.game.collisions.push(new InkSplashCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                } else {
                    this.game.collisions.push(new InkBombCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                }
                break;
            case enemy instanceof Skulnap:
                this.game.audioHandler.explosionSFX.playSound('explosionCollision', false, true);
                this.game.collisions.push(new ExplosionCollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, enemy.id));
                break;
            case enemy instanceof ElectricWheel:
                this.game.audioHandler.explosionSFX.playSound('elyvorg_electricity_wheel_collision_sound', false, true);
                this.game.collisions.push(new ElectricityCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                break;
            case enemy instanceof PoisonSpit:
                this.game.audioHandler.enemySFX.playSound('acidSoundEffect', false, true);
                this.game.collisions.push(new PoisonSpitSplash(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                break;
            case enemy instanceof PoisonDrop:
                this.game.collisions.push(new PoisonDropCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                this.game.audioHandler.explosionSFX.playSound('poisonDropCollisionSound', false, true);
                if (this.isInvisible === false) {
                    this.game.audioHandler.enemySFX.playSound('acidSoundEffect', false, true);
                }
                break;
            case enemy instanceof PurpleFireball:
                this.game.audioHandler.explosionSFX.playSound('fireballExplosionSound', false, true);
                this.game.collisions.push(new PurpleFireballExplosion(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                break;
            case enemy instanceof MeteorAttack:
                this.game.collisions.push(new MeteorExplosionCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                this.game.audioHandler.explosionSFX.playSound('elyvorg_meteor_in_contact_sound', false, true);
                break;
        }
    }

    handleFloatingMessages(enemy) {
        if (enemy.lives <= 0 && this.game.lives === this.previousLives) {
            this.game.coins += 1;
            this.game.player.energy += 2;
            this.game.floatingMessages.push(new FloatingMessage('+1', enemy.x, enemy.y, 150, 50, 30));
        }
    }
}

export class CollisionLogic {
    constructor(game, player) {
        this.game = game;
        this.player = player;
    }

    handleNormalCollision(enemy) { // handles collisions when not in rolling/diving state
        switch (true) {
            // default behavior if the enemy does not match any of the cases below
            default:
                if (this.player.isInvisible === false) {
                    this.player.hit(enemy);
                    this.player.bloodOrPoof(enemy);
                }
                break;
            case enemy instanceof Goblin:
                if (this.player.isInvisible === false) {
                    enemy.lives += 1;
                    this.player.hit(enemy);
                    let maxCoinsToSteal = Math.min(20, this.game.coins);
                    let minCoinsToSteal = Math.min(10, maxCoinsToSteal);
                    let coinsToSteal = Math.floor(Math.random() * (maxCoinsToSteal - minCoinsToSteal + 1)) + minCoinsToSteal;
                    let numberOfParticles = coinsToSteal;
                    for (let i = 0; i < numberOfParticles; i++) {
                        this.game.particles.unshift(new CoinLoss(this.game, this.game.player.x + this.game.player.width * -0.1, this.game.player.y));
                    }
                    if (coinsToSteal > 0) {
                        this.game.audioHandler.enemySFX.playSound('goblinStealing', false, true);
                        this.game.coins -= coinsToSteal;
                        this.game.floatingMessages.push(new FloatingMessage('-' + coinsToSteal, this.player.x, this.player.y, 150, 50, 30, 'red'));
                    }
                }
                break;
            // ink enemies
            case enemy instanceof Sluggie:
            case enemy instanceof InkBomb:
            case enemy instanceof Garry:
                this.player.hit(enemy);
                this.player.triggerInkSplash();
                if (this.player.isInvisible === false) {
                    this.player.collisionAnimationBasedOnEnemy(enemy);
                }
                break;
            case enemy instanceof Skulnap:
                this.player.stunned(enemy);
                if (this.player.isInvisible === false) {
                    this.player.collisionAnimationBasedOnEnemy(enemy);
                }
                break;
            // stun enemies
            case enemy instanceof Bee:
            case enemy instanceof AngryBee:
            case enemy instanceof VolcanoWasp:
            case enemy instanceof LilHornet:
            case enemy instanceof Voltzeel:
            case enemy instanceof Aura:
            case enemy instanceof Cactus:
            case enemy instanceof RockProjectile:
                this.player.stunned(enemy);
                break;
            case enemy instanceof ElectricWheel:
                this.player.stunned(enemy);
                if (this.player.isInvisible === false) {
                    enemy.lives = 0;
                    this.player.elyvorgCollisionTimer = 0;
                    this.player.collisionAnimationBasedOnEnemy(enemy);
                    this.player.resetElectricWheelCounters = true;
                }
                break;
            // poison enemies
            case enemy instanceof PoisonSpit:
            case enemy instanceof PoisonDrop:
                if (this.player.isInvisible === false) {
                    this.player.isPoisonActiveChecker();
                    this.player.hit(enemy);
                    this.player.collisionAnimationBasedOnEnemy(enemy);
                    if (enemy instanceof PoisonSpit) {
                        this.player.isPoisonTimerChecker(1500);
                    } else {
                        this.player.isPoisonTimerChecker(2500);
                    }
                }
                break;
            // red enemies
            case enemy instanceof KarateCroco:
            case enemy instanceof Tauro:
            case enemy instanceof SpearFish:
            case enemy instanceof TheRock:
            case enemy instanceof Volcanurtle:
                this.player.hit(enemy);
                if (this.player.isInvisible === false) {
                    this.player.bloodOrPoof(enemy);
                }
                break;
            // slow
            case enemy instanceof IceBall:
                if (this.player.isInvisible === false) {
                    this.player.hit(enemy);
                    this.player.bloodOrPoof(enemy);
                    this.game.audioHandler.enemySFX.playSound('frozenSound', false, true);
                    this.player.isSlowed = true;
                    this.player.slowedTimer = 5000;
                }
                break;
            // final boss related
            case enemy instanceof Elyvorg:
                if (this.player.elyvorgCollisionTimer >= this.player.elyvorgCollisionCooldown && enemy.isBarrierActive === false) {
                    this.player.hit(enemy);
                    if (this.player.isInvisible === false) {
                        this.player.bloodOrPoof(enemy);
                    }
                }
                break;
            case enemy instanceof Barrier:
                this.player.elyvorgCollisionTimer = 0;
                if (this.player.isInvisible === false && (this.player.currentState === this.player.states[0] ||
                    this.player.currentState === this.player.states[1] || this.player.currentState === this.player.states[2] ||
                    this.player.currentState === this.player.states[3] || this.player.currentState === this.player.states[8])) {
                    this.player.hit(enemy);
                }
                break;
            case enemy instanceof PurpleSlash:
                this.player.elyvorgCollisionTimer = 0;
                if (this.player.isInvisible === false) {
                    this.player.hit(enemy);
                }
                break;
            case enemy instanceof PurpleFireball:
            case enemy instanceof MeteorAttack:
                if (this.player.isInvisible === false) {
                    this.player.hit(enemy);
                    this.player.collisionAnimationBasedOnEnemy(enemy);
                }
                break;
            case enemy instanceof Arrow:
                if (this.player.isInvisible === false) {
                    let imageId = enemy.image.id;
                    if (imageId === 'blueArrow') {
                        this.player.hit(enemy);
                        this.player.bloodOrPoof(enemy);
                        this.game.audioHandler.enemySFX.playSound('frozenSound', false, true);
                        this.player.isSlowed = true;
                        this.player.slowedTimer = 10000;
                    } else if (imageId === 'yellowArrow') {
                        this.player.stunned(enemy);
                    } else if (imageId === 'greenArrow') {
                        this.player.hit(enemy);
                        this.player.bloodOrPoof(enemy);
                        this.player.isPoisonActiveChecker();
                        this.player.isPoisonTimerChecker(1500);
                        this.game.audioHandler.enemySFX.playSound('acidSoundEffect', false, true);
                    }
                }
                break;
        }
    }

    handleRollingOrDivingCollision(enemy) { // handles collisions when in rolling/diving state
        switch (true) {
            // default behavior if the enemy does not match any of the cases below
            default:
                this.player.bloodOrPoof(enemy);
                break;
            case enemy instanceof Goblin:
                enemy.lives = 0;
                this.player.bloodOrPoof(enemy);
                break;
            // ink enemies
            case enemy instanceof Sluggie:
            case enemy instanceof InkBomb:
            case enemy instanceof Garry:
                this.player.triggerInkSplash();
                this.player.collisionAnimationBasedOnEnemy(enemy);
                break;
            case enemy instanceof Skulnap:
                this.player.stunned(enemy);
                this.player.collisionAnimationBasedOnEnemy(enemy);
                break;
            // stun enemies
            case enemy instanceof Bee:
            case enemy instanceof AngryBee:
            case enemy instanceof VolcanoWasp:
            case enemy instanceof Voltzeel:
            case enemy instanceof Aura:
            case enemy instanceof LilHornet:
            case enemy instanceof Cactus:
            case enemy instanceof RockProjectile:
                this.player.stunned(enemy);
                if (this.player.isInvisible === true) {
                    this.player.bloodOrPoof(enemy);
                }
                break;
            case enemy instanceof ElectricWheel:
                enemy.lives = 0;
                this.player.stunned(enemy);
                this.player.collisionAnimationBasedOnEnemy(enemy);
                this.player.resetElectricWheelCounters = true;
                this.player.elyvorgCollisionTimer = 0;
                break;
            // poison enemies
            case enemy instanceof PoisonSpit:
            case enemy instanceof PoisonDrop:
                if (this.player.isInvisible === false) {
                    this.player.isPoisonActiveChecker();
                    this.player.hit(enemy);
                    if (enemy instanceof PoisonSpit) {
                        this.player.isPoisonTimerChecker(1500);
                    } else {
                        this.player.isPoisonTimerChecker(2500);
                    }
                }
                this.player.collisionAnimationBasedOnEnemy(enemy);
                break;
            // red enemies
            case enemy instanceof Tauro:
            case enemy instanceof KarateCroco:
            case enemy instanceof SpearFish:
            case enemy instanceof TheRock:
            case enemy instanceof Volcanurtle:
                if (this.player.currentState === this.player.states[4]) {
                    this.player.hit(enemy);
                }
                this.player.bloodOrPoof(enemy);
                break;
            // slow
            case enemy instanceof IceBall:
                if (this.player.isInvisible === false) {
                    this.game.audioHandler.enemySFX.playSound('frozenSound', false, true);
                    this.player.isSlowed = true;
                    this.player.slowedTimer = 5000;
                }
                this.player.bloodOrPoof(enemy);
                break;
            // final boss related
            case enemy instanceof Elyvorg:
                if (this.player.elyvorgCollisionTimer >= this.player.elyvorgCollisionCooldown && enemy.isBarrierActive === false) {
                    enemy.lives -= 1;
                    this.player.bloodOrPoof(enemy);
                }
                break;
            case enemy instanceof Barrier:
                this.player.elyvorgCollisionTimer = 0;
                break;
            case enemy instanceof PurpleSlash:
                if (this.player.isInvisible === false) {
                    this.player.elyvorgCollisionTimer = 0;
                    this.player.hit(enemy);
                }
                break;
            case enemy instanceof PurpleFireball:
                this.player.hit(enemy);
                this.player.collisionAnimationBasedOnEnemy(enemy);
                break;
            case enemy instanceof MeteorAttack:
                this.player.collisionAnimationBasedOnEnemy(enemy);
                break;
            case enemy instanceof Arrow:
                let imageId = enemy.image.id;
                if (imageId === "blueArrow") {
                    if (this.player.isInvisible === false) {
                        this.game.audioHandler.enemySFX.playSound('frozenSound', false, true);
                        this.player.isSlowed = true;
                        this.player.slowedTimer = 10000;
                    }
                    this.player.bloodOrPoof(enemy);
                } else if (imageId === "yellowArrow") {
                    if (this.player.isInvisible) {
                        enemy.lives -= 1;
                        this.player.bloodOrPoof(enemy);
                    } else {
                        this.player.stunned(enemy);
                    }
                } else if (imageId === "greenArrow") {
                    if (this.player.isInvisible === false) {
                        this.player.isPoisonActiveChecker();
                        this.player.isPoisonTimerChecker(1500);
                        this.game.audioHandler.enemySFX.playSound('acidSoundEffect', false, true);
                    }
                    this.player.bloodOrPoof(enemy);
                }
                break;
        }
    }
}
