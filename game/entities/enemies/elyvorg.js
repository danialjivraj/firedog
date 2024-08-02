import { Enemy, FallingEnemy, Projectile, LaserBeam } from "./enemies.js";
import { MeteorExplosionCollision, DarkExplosion, PoisonDropGroundCollision } from "../../animations/collisionAnimation.js";
import { PurpleWarningIndicator } from "../../animations/damageIndicator.js";
import { fadeInAndOut } from "../../animations/fading.js";

export class GroundEnemyBoss extends Enemy {
    constructor(game, width, height, maxFrame, imageId) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.width;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.image = document.getElementById(imageId);
        this.speedX = 0;
        this.speedY = 0;
        this.maxFrame = maxFrame;
    }

    draw(context, shouldInvert) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);

        if (shouldInvert) {
            context.scale(-1, 1); // faces left
        } else {
            context.scale(1, 1); // faces right
        }

        context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);

        context.restore();
    }
}

export class Barrier extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 170, 210, 0, 'barrier', 0, 30);
        this.lives = 3;
        this.images = ['barrier2', 'barrier1', 'barrier'];
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        const imageIndex = Math.max(0, Math.min(this.lives - 1, this.images.length - 1));
        const imageName = this.images[imageIndex];

        context.drawImage(
            document.getElementById(imageName),
            this.frameX * this.width,
            0,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}

export class MeteorAttack extends FallingEnemy {
    constructor(game) {
        super(game, 98.5, 197, 1, 'meteorAttack');
        this.speedY = Math.random() * 5 + 2;
        this.x = Math.random() * (this.game.width - this.width);
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.y >= this.game.height - this.game.groundMargin - 190) {
            this.markedForDeletion = true;
            this.game.collisions.push(new MeteorExplosionCollision(this.game, this.x + this.width * 0.5, this.y + this.height * 0.5 - 30));
            this.game.audioHandler.explosionSFX.playSound('elyvorg_meteor_in_contact_with_ground_sound');
        }
    }
}

export class PoisonDrop extends FallingEnemy {
    constructor(game) {
        super(game, 26, 60, 3, 'poisonDrop');
        this.speedY = Math.random() * 2 + 7;
        this.x = Math.random() * (this.game.width - this.width);
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.y >= this.game.height - this.game.groundMargin - 53) {
            this.markedForDeletion = true;
            this.game.collisions.push(new PoisonDropGroundCollision(this.game, this.x + this.width * 0.5, this.y + this.height * 0.5 - 12));
        }
    }
}

export class GhostElyvorg extends GroundEnemyBoss {
    constructor(game) {
        super(game, 153.23076923076923076923076923077, 180, 12, 'elyvorgGhostRun');
        this.fps = 120;
        this.frameInterval = 1000 / this.fps;
        this.incrementMovement = 0;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x += this.incrementMovement;
    }
    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);

        const shouldInvert = this.incrementMovement > 0;
        if (shouldInvert) {
            context.scale(-1, 1);
        } else {
            context.scale(1, 1);
        }

        context.drawImage(
            this.image,
            this.frameX * this.width,
            this.frameY * this.height,
            this.width,
            this.height,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        context.restore();
    }
}

export class GravitationalAura extends Projectile {
    constructor(game, x, y, player, elyvorg) {
        super(game, x, y, 75, 71, 0, 'gravitationalAura', 2, 30);
        this.player = player;
        this.elyvorg = elyvorg;
        this.rotationSpeed = 0.06;
        this.rotationAngle = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.rotationAngle += this.rotationSpeed;

        this.y -= this.speedX;
        this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;

        if (this.elyvorg) {
            let targetX;
            if (this.elyvorg.reachedLeftEdge || this.elyvorg.x <= 10) {
                targetX = this.elyvorg.x + this.elyvorg.width / 2 + 20;
            } else {
                targetX = this.elyvorg.x + this.elyvorg.width / 2 - this.width / 2;
            }
            const deltaX = targetX - this.x;
            const followSpeed = 0.1;
            this.x += deltaX * followSpeed;
        }

        if (this.y <= 100) {
            this.y = 100;
        }

        //pushes player
        const deltaXPlayer = this.player.x - this.x;
        const deltaYPlayer = this.player.y - this.y;
        const distancePlayer = Math.sqrt(deltaXPlayer * deltaXPlayer + deltaYPlayer * deltaYPlayer);
        const directionXPlayer = deltaXPlayer / distancePlayer;
        const pushbackDistancePlayer = 50;
        const playerPushbackX = this.player.x - directionXPlayer * pushbackDistancePlayer;
        if (this.player.isSlowed) {
            this.player.x += (playerPushbackX - this.player.x) * 0.08;
        } else {
            this.player.x += (playerPushbackX - this.player.x) * 0.12;
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.rotationAngle);

        if (this.game.debug) context.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);

        context.restore();
    }
}

export class ElectricWheel extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 215, 200, 1, 'electricWheel', 0, 30);
        this.lives = 50;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.06;
        this.incrementMovement = 0;
        this.shouldElectricWheelInvert();
    }
    shouldElectricWheelInvert() {
        this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;
        if (this.shouldInvert) {
            return this.incrementMovement = 12;
        } else {
            return this.incrementMovement = -12;
        }
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.rotationAngle += this.rotationSpeed;
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.rotationAngle);

        context.shadowColor = 'yellow';
        context.shadowBlur = 10;

        if (this.game.debug) context.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);

        context.restore();
    }
}
export class InkBomb extends Projectile {
    constructor(game, x, y, verticalSpeed, stopY, incrementMovement, direction) {
        super(game, x, y, 49.5, 48, 1, 'inkBomb', 0, 4);
        this.incrementMovement = incrementMovement;
        this.scale = 0.1;
        this.targetScale = 1;
        this.scaleSpeed = 0.01;
        this.originalY = y;
        this.stopY = stopY;
        this.stopMoving = false;
        this.verticalSpeed = verticalSpeed;
        this.direction = direction;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (!this.soundPlayed) {
            this.game.audioHandler.enemySFX.playSound('elyvorg_ink_bomb_sound', false, true);
            this.soundPlayed = true;
        }

        if (this.scale < this.targetScale) {
            this.scale += this.scaleSpeed;
        } else {
            this.scale = this.targetScale;
        }

        if (!this.stopMoving && this.y > this.stopY) {
            this.y -= this.verticalSpeed;
        } else {
            if (!this.throwSoundPlayed) {
                this.throwSoundPlayed = true;
                this.game.audioHandler.enemySFX.playSound('elyvorg_ink_bomb_throw_sound', false, true);
            }
            this.stopMoving = true;
            this.speedX = this.incrementMovement;
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x - this.width * this.scale / 2, this.y - this.height * this.scale / 2, this.width * this.scale, this.height * this.scale);

        if (this.direction) {
            context.save();
            context.scale(-1, 1);
            context.drawImage(
                this.image,
                this.frameX * this.width, 0, this.width, this.height,
                -(this.x + this.width * this.scale / 2), this.y - this.height * this.scale / 2, this.width * this.scale, this.height * this.scale
            );
            context.restore();
        } else {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x - this.width * this.scale / 2, this.y - this.height * this.scale / 2, this.width * this.scale, this.height * this.scale);
        }
    }
}

export class PurpleFireball extends Projectile {
    constructor(game, x, y, speedX, speedY) {
        super(game, x, y, 40, 40, 0, "purpleFireball", speedX, speedY);
        this.initialSize = 10;
        this.size = this.initialSize;
        this.maxSize = 40;
        this.growthRate = 1;
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.2;
    }

    update(deltaTime) {
        super.update(deltaTime);

        const sizeChange = this.size + this.growthRate > this.maxSize
            ? this.maxSize - this.size
            : this.growthRate;

        this.size += sizeChange;
        this.y -= sizeChange / 2;

        this.rotationAngle += this.rotationSpeed;
    }

    draw(context) {
        context.save();

        context.shadowColor = 'purple';
        context.shadowBlur = 20;

        context.translate(this.x + this.size / 2, this.y + this.size / 2);
        context.rotate(this.rotationAngle);

        if (this.game.debug) context.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
        context.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);

        context.restore();
    }
}

export class Arrow extends Projectile {
    constructor(game, x, y, speedX, speedY, direction, imageId) {
        super(game, x, y, 96, 30, 0, imageId, speedX, speedY);
        this.initialSize = 10;
        this.size = this.initialSize;
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.direction = direction;
    }
    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();

        if (this.image.id === 'yellowArrow') {
            context.shadowColor = 'yellow';
            context.shadowBlur = 10;
        } else if (this.image.id === 'blueArrow') {
            context.shadowColor = 'blue';
            context.shadowBlur = 10;
        }

        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        let angle = Math.atan2(this.speedY, this.speedX);

        if (this.direction) {
            angle = Math.PI - angle;
            context.scale(1, 1);
        } else {
            context.scale(-1, 1);
        }

        context.rotate(angle);
        context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
        context.restore();
    }
}

export class PurpleSlash extends Projectile {
    constructor(game, x, y, direction) {
        super(game, x, y, 222, 267, 9, "purpleSlash", 0, 11);
        this.lives = 3;
        this.direction = direction;
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.frameX >= this.maxFrame) {
            this.lives = 0;
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);

        context.shadowColor = 'purple';
        context.shadowBlur = 20;

        const shouldInvert = this.direction > 0;
        if (shouldInvert) {
            context.scale(-1, 1);
        } else {
            context.scale(1, 1);
        }

        context.drawImage(
            this.image,
            this.frameX * this.width,
            this.frameY * this.height,
            this.width,
            this.height,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        context.restore();
    }
}
// ------------------------------------------------------------------- Final Boss ------------------------------------------------------------------------
export class Elyvorg extends GroundEnemyBoss {
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
        this.fps = 30;
        this.frameInterval = 1000 / this.fps;
        this.livesDefeatedAt = 5;
        this.lives = 150;
        this.maxLives = this.lives - this.livesDefeatedAt;
        this.stateRandomiserTimer = 5000;
        this.stateRandomiserCooldown = 5000;
        // run
        this.runAnimation = new GroundEnemyBoss(game, 153.23076923076923076923076923077, 180, 12, 'elyvorgRun');
        this.runAnimation.fps = 120;
        this.runAnimation.frameInterval = 1000 / this.runAnimation.fps;
        this.runAnimation.frameX = 0;
        this.runningDirection = 0; // switches between 10 and -10
        this.runStateCounter = 0;
        this.runStateCounterLimit = 5;
        this.runStopAtTheMiddle = false;
        this.isSlashActive = false;
        this.slashAttackOnce = false;
        this.slashAttackStateCounter = 15;
        this.slashAttackStateCounterLimit = 20;
        // jump
        this.jumpAnimation = new GroundEnemyBoss(game, 153.25, 180, 11, 'elyvorgJump');
        this.jumpAnimation.frameX = 0;
        this.jumpHeight = 300;
        this.jumpDuration = 0.7;
        this.jumpStartTime = 0;
        this.canJumpAttack = true;
        // barrier
        this.barrier = new Barrier(this.game, this.x - 20, this.y - 20);
        this.oneBarrier = true;
        this.barrierBreakingSetElyvorgTimer = true;
        this.barrierCooldown = Math.floor(Math.random() * (60000 - 35000 + 1)) + 35000; // 35 to 60 seconds
        this.barrierCooldownTimer = 0;
        this.isBarrierActive = true;
        // electricWheel
        this.electricWheel = new ElectricWheel(this.game, this.x - 45, this.y - 20);
        this.oneElectricWheel = false;
        this.electricWheelThrown = false;
        this.isElectricWheelActive = false;
        this.playElectricWarningSoundOnce = true;
        this.electricWheelStateCounter = 9;
        this.electricWheelStateCounterLimit = 15;
        this.electricWheelActivateStateCounterDeltaTime = false;
        this.electricWheelStateCounterDeltaTime = 0;
        this.electricWheelStateCounterLimitDeltaTime = 2;
        this.electricWheelTimer = 0;
        this.electricWheelCooldown = Math.floor(Math.random() * 5001) + 5000; // 5 to 10 seconds
        // recharge
        this.rechargeAnimation = new GroundEnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgRechargeIdle');
        this.rechargeAnimation.frameX = 0;
        // pistol
        this.pistolAnimation = new GroundEnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgPistolIdle');
        this.pistolAnimation.frameX = 0;
        // laser
        this.laserAnimation = new GroundEnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgLaserIdle');
        this.laserAnimation.frameX = 0;
        this.laserThrowCount = 0;
        this.canLaserAttack = true;
        // meteor
        this.meteorAnimation = new GroundEnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgMeteorIdle');
        this.meteorAnimation.frameX = 0;
        this.meteorThrowCount = 0;
        this.canMeteorAttack = true;
        // poison
        this.poisonAnimation = new GroundEnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgPoisonIdle');
        this.poisonAnimation.frameX = 0;
        this.canPoisonAttack = true;
        this.isPoisonActive = false;
        this.poisonCooldown = 25000;
        this.poisonCooldownTimer = 0;
        this.passivePoisonCooldown = 0;
        // ghost
        this.ghostAnimation = new GroundEnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgGhostIdle');
        this.ghostAnimation.frameX = 0;
        this.canGhostAttack = true;
        // gravity
        this.gravityAnimation = new GroundEnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgGravityIdle');
        this.gravityAnimation.frameX = 0;
        this.isGravitySpinnerActive = false;
        this.canGravityAttack = true;
        this.gravityCooldown = 14000;
        this.gravityCooldownTimer = 0;
        this.gravityOffset = 0;
        // ink
        this.inkAnimation = new GroundEnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgInkIdle');
        this.inkAnimation.frameX = 0;
        this.canInkAttack = true;
        // fireball
        this.fireballAnimation = new GroundEnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgIdleFireball');
        this.fireballAnimation.frameX = 0;
        this.canFireballAttack = true;
    }
    cutsceneBackgroundChange(fadein, stay, fadeout) {
        this.game.enterDuringBackgroundTransition = false;
        fadeInAndOut(this.game.canvas, fadein, stay, fadeout, () => {
            this.game.enterDuringBackgroundTransition = true;
        });
    }
    backToIdleSetUp() {
        this.previousState = this.state;
        this.state = "idle";
        this.chooseStateOnce = true;
        this.frameX = 0;
    }
    throwLaserBeam() {
        const playerIsOnLeft = this.game.player.x + this.game.player.width / 2 < this.x + this.width / 2;
        const initialSpeedX = playerIsOnLeft ? 20 : -20;

        const laserBeamX = playerIsOnLeft ? this.x - 70 : this.x + 110;

        const laserBeam = new LaserBeam(
            this.game, laserBeamX, this.y - 50 + this.height / 2 - 57 / 2, 100,
            57, 0, 'elyvorg_laser_beam', initialSpeedX
        );
        const laserBeam1X = playerIsOnLeft ? this.x - 70 : this.x + 110;

        const laserBeam1 = new LaserBeam(
            this.game, laserBeam1X, this.y + 50 + this.height / 2 - 57 / 2, 100,
            57, 0, 'elyvorg_laser_beam', initialSpeedX
        );

        this.game.enemies.push(laserBeam);
        this.game.enemies.push(laserBeam1);
    }
    throwFireballAttack() {
        const playerIsOnLeft = this.game.player.x + this.game.player.width / 2 < this.x + this.width / 2;
        const horizontalSpeed = playerIsOnLeft ? 15 : -15;

        const playerCenterY = this.game.player.y + this.game.player.height / 2;
        const elyvorgCenterY = this.y + this.height / 2;
        const deltaY = playerCenterY - elyvorgCenterY;

        const angle = Math.atan2(deltaY, Math.abs(this.game.player.x - this.x));

        const verticalSpeed = Math.sin(angle) * 15;

        const fireballX = playerIsOnLeft ? this.x + 10 : this.x + 110;
        const fireball = new PurpleFireball(
            this.game,
            fireballX,
            this.y - 35 + this.height / 2 - 57 / 2,
            horizontalSpeed,
            verticalSpeed
        );
        this.game.enemies.push(fireball);
    }
    throwArrowAttack() {
        const playerIsOnLeft = this.game.player.x + this.game.player.width / 2 < this.x + this.width / 2;
        const horizontalSpeed = playerIsOnLeft ? 18 : -18;

        const playerCenterY = this.game.player.y + this.game.player.height / 2;
        const elyvorgCenterY = this.y + this.height / 2;
        const deltaY = playerCenterY - elyvorgCenterY;

        const angle = Math.atan2(deltaY, Math.abs(this.game.player.x - this.x));

        const verticalSpeed = Math.sin(angle) * 21;

        let image;
        if (Math.random() < 1 / 3) {
            image = "blueArrow";
        } else if (Math.random() < 2 / 3) {
            image = "yellowArrow";
        } else {
            image = "greenArrow";
        }

        const arrowX = playerIsOnLeft ? this.x + 10 : this.x + 110;
        const arrow = new Arrow(
            this.game,
            arrowX,
            this.y - 35 + this.height / 2 - 57 / 2,
            horizontalSpeed,
            verticalSpeed,
            playerIsOnLeft,
            image,
        );
        this.game.enemies.push(arrow);
    }
    throwGravityAttack() {
        const offsetX = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2 ? 70 : 10;
        this.gravityOffset = offsetX;
        this.gravitationalAura = new GravitationalAura(this.game, this.x + this.gravityOffset, this.y + 10, this.game.player, this);
        this.game.enemies.push(this.gravitationalAura);
        this.isGravitySpinnerActive = true;
    }
    fireballThrownWhileInIdle() {
        let isFireballInRange = false;
        for (const fireball of this.game.behindPlayerParticles) {
            const fireballDistance = Math.sqrt(
                Math.pow(fireball.x - this.x, 2) +
                Math.pow(fireball.y - this.y, 2)
            );
            if (fireballDistance <= 400 && fireball.y + fireball.maxSize > this.y) {
                isFireballInRange = true;
                break;
            }
        }
        if (isFireballInRange) {
            this.state = "jump";
            this.jumpAnimation.x = this.x;
            this.jumpAnimation.y = this.y;
            this.jumpAnimation.frameX = 0;
            this.jumpedBeforeDistanceLogic = false;
        }
    }
    edgeConstraintLogic() {
        if (this.game.isElyvorgFullyVisible) {
            if (this.x <= 0) {
                this.x = 1;
                if (Math.random() < 0.7) {
                    this.runStopAtTheMiddle = false;
                } else {
                    this.runStopAtTheMiddle = true;
                }
                this.reachedLeftEdge = true;
                this.chooseStateOnce = true;
                if (this.state === "run") {
                    this.previousState = this.state;
                }
                this.state = "idle";
            } else if (this.x + this.width >= this.game.width) {
                this.x = this.game.width - this.width - 1;
                if (Math.random() < 0.7) {
                    this.runStopAtTheMiddle = false;
                } else {
                    this.runStopAtTheMiddle = true;
                }
                this.reachedRightEdge = true;
                this.chooseStateOnce = true;
                if (this.state === "run") {
                    this.previousState = this.state;
                }
                this.state = "idle";
            } else {
                this.reachedRightEdge = false;
                this.reachedLeftEdge = false;
            }
            if (this.runAnimation.x >= this.game.width / 2 - 11 && this.runAnimation.x <= this.game.width / 2 + 11) {
                this.isInTheMiddle = true;
            } else {
                this.isInTheMiddle = false;
            }
        }
    }
    jumpLogic() {
        if (this.jumpAnimation.frameX === 0 && !this.jumpedBeforeDistanceLogic) {
            this.jumpStartTime = this.game.hiddenTime;
            this.jumpedBeforeDistanceLogic = true;
        }
        const jumpProgress = (this.game.hiddenTime - this.jumpStartTime) / (this.jumpDuration * 1000);
        if (jumpProgress < 1) {
            this.y = this.originalY - this.jumpHeight * Math.sin(jumpProgress * Math.PI);
            if (Math.abs(jumpProgress - 0.5) < 0.05 && this.canJumpAttack) {
                this.canJumpAttack = false;
                this.throwArrowAttack();
                this.game.audioHandler.enemySFX.playSound('elyvorg_arrow_attack_sound', false, true);
            }
        } else {
            this.backToIdleSetUp();
            this.canJumpAttack = true;
            this.y = this.originalY;
            this.jumpedBeforeDistanceLogic = false;
        }
    }

    laserLogic() {
        if (this.laserAnimation.frameX === 9 && this.canLaserAttack === true) {
            this.throwLaserBeam();
            this.game.audioHandler.enemySFX.playSound('elyvorg_laser_attack_sound');
            this.canLaserAttack = false;
            this.laserThrowCount++;
        }
        if (this.laserThrowCount >= 3 && this.laserAnimation.frameX === 23) {
            this.backToIdleSetUp();
            this.canLaserAttack = true;
            this.laserThrowCount = 0;
        }
        if (this.laserAnimation.frameX === 20) {
            this.canLaserAttack = true;
        }
    }
    gravityLogic() {
        if (this.gravityAnimation.frameX === 9 && this.canGravityAttack === true) {
            this.throwGravityAttack();
            this.game.audioHandler.enemySFX.playSound('elyvorg_gravitational_aura_release_sound_effect');
            this.game.audioHandler.enemySFX.playSound('elyvorg_gravitational_aura_sound_effect', true);
            this.canGravityAttack = false;
        }
        if (this.gravityAnimation.frameX === 23) {
            this.backToIdleSetUp();
            this.canGravityAttack = true;
        }
    }
    gravityLogicTimer(deltaTime) {
        if (this.isGravitySpinnerActive) {
            this.gravityCooldownTimer += deltaTime;
            if (this.gravityCooldownTimer >= this.gravityCooldown || this.gravitationalAura.lives <= 0) {
                this.isGravitySpinnerActive = false;
                this.gravitationalAura.lives = 0;
                this.gravityCooldownTimer = 0;
                this.game.collisions.push(new DarkExplosion(this.game, this.gravitationalAura.x + this.gravitationalAura.width * 0.5, this.gravitationalAura.y + this.gravitationalAura.height * 0.5 - 30));
                this.game.audioHandler.explosionSFX.playSound('darkExplosionCollisionSound', false, true);
                this.game.audioHandler.enemySFX.stopSound('elyvorg_shield_up_sound');
                this.game.audioHandler.enemySFX.stopSound('elyvorg_gravitational_aura_sound_effect');
            }
        }
    }
    meteorLogic() {
        if (this.meteorAnimation.frameX === 9) {
            this.game.audioHandler.enemySFX.playSound('elyvorg_meteor_attack_sound');
        }

        if (this.meteorAnimation.frameX === 23 && this.canMeteorAttack === true) {
            this.canMeteorAttack = false;
            this.meteorThrowCount++;
            for (let i = 0; i < 7; i++) {
                this.game.enemies.push(new MeteorAttack(this.game));
            }
            this.game.audioHandler.enemySFX.playSound('elyvorg_meteor_falling_sound', true);
        }
        if (this.meteorThrowCount >= 5 && this.meteorAnimation.frameX === 23) {
            this.backToIdleSetUp();
            this.meteorThrowCount = 0;
        }
        if (this.meteorAnimation.frameX === 20) {
            this.canMeteorAttack = true;
        }
    }
    poisonLogic() {
        if (this.poisonAnimation.frameX === 0) {
            this.game.poisonScreen = true;
            this.game.audioHandler.enemySFX.playSound('elyvorg_poison_drop_indicator_sound', false, true)
        }
        if (this.poisonAnimation.frameX === 17) {
            this.game.audioHandler.enemySFX.playSound('elyvorg_poison_drop_rain_sound', false, true)
        }
        if (this.poisonAnimation.frameX === 23 && this.canPoisonAttack === true) {
            this.isPoisonActive = true;
            this.canPoisonAttack = false;
            for (let i = 0; i < 7; i++) {
                this.game.enemies.push(new PoisonDrop(this.game));
            }

        }
        if (this.poisonAnimation.frameX === 23) {
            this.backToIdleSetUp();
        }
        if (this.poisonAnimation.frameX === 20) {
            this.canPoisonAttack = true;
        }
    }
    poisonLogicTimer(deltaTime) {
        if (this.isPoisonActive) {
            this.poisonCooldownTimer += deltaTime;
            this.passivePoisonCooldown += deltaTime;
            if (this.poisonCooldownTimer <= this.poisonCooldown) {
                if (this.state !== 'meteor') {
                    if (this.passivePoisonCooldown >= 1000) {
                        this.passivePoisonCooldown -= 1000;
                        const numDrops = Math.floor(Math.random() * 3) + 1; // 1 to 3
                        for (let i = 0; i < numDrops; i++) {
                            this.game.enemies.push(new PoisonDrop(this.game));
                        }
                    }
                } else {
                    this.passivePoisonCooldown = 0;
                }
            } else {
                this.game.poisonScreen = false;
                this.isPoisonActive = false;
                this.poisonCooldownTimer = 0;
                this.passivePoisonCooldown = 0;
            }
        }
    }
    pistolLogic() {
        if (this.pistolAnimation.frameX === 5) {
            this.electricWheel.shouldElectricWheelInvert();
        }
        if (this.pistolAnimation.frameX === 17) {
            this.electricWheelThrown = true;
        }
        if (this.pistolAnimation.frameX === 23 || this.isElectricWheelActive === false) {
            this.state = "recharge";
            this.chooseStateOnce = true;
            this.frameX = 0;
            this.stateRandomiserTimer = 0;
        }
    }
    ghostLogic() {
        if (this.ghostAnimation.frameX === 0) {
            this.game.audioHandler.enemySFX.playSound('elyvorg_ghost_attack_sound', false, true);
        }

        if (this.ghostAnimation.frameX === 17 && this.canGhostAttack === true) {
            this.canGhostAttack = false;
            this.ghostElyvorg = new GhostElyvorg(this.game);
            const playerIsOnLeft = this.game.player.x + this.game.player.width / 2 < this.x + this.width / 2;
            if (playerIsOnLeft) {
                this.ghostElyvorg.x = 0 - this.ghostElyvorg.width;
                this.ghostElyvorg.incrementMovement = 12;
            } else {
                this.ghostElyvorg.x = this.game.width;
                this.ghostElyvorg.incrementMovement = -12;
            }
            this.game.enemies.push(this.ghostElyvorg);

            if (Math.random() < 0.5) {
                this.ghostElyvorgOppositeSide = new GhostElyvorg(this.game);
                this.ghostElyvorgOppositeSide.x = this.ghostElyvorg.x === 0 - this.ghostElyvorg.width ? this.game.width : 0 - this.ghostElyvorgOppositeSide.width;
                this.ghostElyvorgOppositeSide.incrementMovement = -this.ghostElyvorg.incrementMovement;
                this.game.enemies.push(this.ghostElyvorgOppositeSide);
            }
        }
        if (this.ghostAnimation.frameX === 23) {
            this.backToIdleSetUp();
            this.canGhostAttack = true;
        }
    }
    inkLogic() {
        if (this.inkAnimation.frameX === 1 && this.canInkAttack === true) {
            this.canInkAttack = false;
            const playerIsOnLeft = this.game.player.x + this.game.player.width / 2 < this.x + this.width / 2;
            const laserBeamX = playerIsOnLeft ? this.x - 50 : this.x + 200;

            this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;
            let speedOffsetValues = [0.239, 0.603, 0.97, 1.333, 1.697];
            let inkBombSpeeds = [];
            let inkBombSpeedX1, inkBombSpeedX2;
            if (this.shouldInvert) {
                inkBombSpeedX1 = -16;
                inkBombSpeedX2 = -8;
            } else {
                inkBombSpeedX1 = 16;
                inkBombSpeedX2 = 8;
            }
            for (let i = 0; i < 5; i++) {
                inkBombSpeeds.push(i % 2 === 0 ? inkBombSpeedX2 : inkBombSpeedX1);
            }
            for (let i = 0; i < 5; i++) {
                const speedOffset = speedOffsetValues[i];
                const inkBombSpeedX = inkBombSpeeds[i];
                const inkBomb = new InkBomb(this.game, laserBeamX, this.game.height - this.game.groundMargin, speedOffset,
                    (this.game.height - this.game.groundMargin - this.game.player.height / 2) - (i * 70), inkBombSpeedX, this.shouldInvert
                );
                this.game.enemies.push(inkBomb);
            }
        }
        if (this.inkAnimation.frameX === 23) {
            this.backToIdleSetUp();
            this.canInkAttack = true;
        }
    }
    fireballLogic() {
        if (this.fireballAnimation.frameX === 10 && this.canFireballAttack === true) {
            this.throwFireballAttack();
            this.game.audioHandler.enemySFX.playSound('elyvorg_purple_fireball_sound_effect', false, true);
            this.canFireballAttack = false;
        }

        if (this.fireballAnimation.frameX === 20) {
            this.canFireballAttack = true;
        }

        if (this.fireballAnimation.frameX === 23) {
            this.backToIdleSetUp();
            this.canFireballAttack = true;
        }
    }
    barrierLogic(deltaTime) {
        if (this.oneBarrier) {
            this.game.enemies.push(this.barrier);
            this.game.audioHandler.enemySFX.playSound('elyvorg_shield_up_sound');
            this.oneBarrier = false;
        }

        if (!this.isBarrierActive) {
            this.barrierCooldownTimer += deltaTime;

            if (this.barrierCooldownTimer >= this.barrierCooldown) {
                this.barrierCooldownTimer = 0;
                this.barrierCooldown = Math.floor(Math.random() * (60000 - 35000 + 1)) + 35000; // 35 to 60 seconds
                this.barrier = new Barrier(this.game, this.x - 20, this.y - 20);
                this.game.enemies.push(this.barrier);
                this.barrierBreakingSetElyvorgTimer = true;
                this.isBarrierActive = true;
                this.shieldCrackLives2SoundPlayed = false;
                this.shieldCrackLives1SoundPlayed = false;
                this.shieldCrackLives0SoundPlayed = false;
                this.game.audioHandler.enemySFX.playSound('elyvorg_shield_up_sound');
            }
        }
        if (this.barrier.lives <= 0 && this.barrierBreakingSetElyvorgTimer) {
            this.barrierBreakingSetElyvorgTimer = false;
            this.isBarrierActive = false;
            this.game.player.elyvorgCollisionTimer = 1000;
        }

        if (!this.shieldCrackLives2SoundPlayed && this.barrier.lives === 2) {
            this.game.audioHandler.enemySFX.playSound('elyvorg_shield_crack_1_sound');
            this.shieldCrackLives2SoundPlayed = true;
        }
        if (!this.shieldCrackLives1SoundPlayed && this.barrier.lives === 1) {
            this.game.audioHandler.enemySFX.playSound('elyvorg_shield_crack_2_sound');
            this.shieldCrackLives1SoundPlayed = true;
        }
        if (!this.shieldCrackLives0SoundPlayed && this.barrier.lives <= 0) {
            this.game.audioHandler.enemySFX.playSound('elyvorg_shield_crack_3_sound');
            this.shieldCrackLives0SoundPlayed = true;
        }

        if (this.runningDirection > 0) {
            if (this.state === 'run') {
                this.barrier.x = this.runAnimation.x + (this.runAnimation.width / 2) - (this.barrier.width / 2) + 10;
            } else {
                this.barrier.x = this.x + (this.width / 2) - (this.barrier.width / 2);
            }
            this.barrier.y = this.y - 20;
        } else {
            if (this.state === 'run') {
                this.barrier.x = this.runAnimation.x + (this.runAnimation.width / 2) - (this.barrier.width / 2) - 10;
            } else {
                this.barrier.x = this.x + (this.width / 2) - (this.barrier.width / 2);
            } this.barrier.y = this.y - 20;
        }
    }
    electricWheelLogic(deltaTime) {
        if (this.oneElectricWheel) {
            this.electricWheel = new ElectricWheel(this.game, this.x - 45, this.y - 20);
            this.game.enemies.push(this.electricWheel);
            this.game.audioHandler.enemySFX.playSound('elyvorg_electricity_wheel_sound', true);
            this.isElectricWheelActive = true;
            this.oneElectricWheel = false;
        }

        if (this.electricWheelStateCounter >= this.electricWheelStateCounterLimit &&
            this.oneElectricWheel === false && this.isElectricWheelActive === false) {
            this.electricWheelTimer += deltaTime;
            if (this.electricWheelTimer >= this.electricWheelCooldown) {
                this.oneElectricWheel = true;
                this.electricWheelActivateStateCounterDeltaTime = true;
                this.electricWheelTimer = 0;
                this.electricWheelCooldown = Math.floor(Math.random() * 5001) + 5000; // 5 to 10 seconds
            }
            if (this.playElectricWarningSoundOnce) {
                this.game.audioHandler.enemySFX.playSound('elyvorg_electricity_wheel_warning_sound');
                this.game.collisions.push(new PurpleWarningIndicator(this.game));
                this.playElectricWarningSoundOnce = false;
            }
        }

        if (this.electricWheel.lives <= 0 || this.electricWheel.x + this.electricWheel.width <= 0 || this.electricWheel.x >= this.game.width) {
            this.game.audioHandler.enemySFX.stopSound('elyvorg_electricity_wheel_sound');
            this.electricWheel.markedForDeletion = true;
            this.isElectricWheelActive = false;
            this.electricWheelThrown = false;
            if (this.game.player.resetElectricWheelCounters) {
                this.game.player.resetElectricWheelCounters = false;
                this.playElectricWarningSoundOnce = true;
                this.electricWheelStateCounter = 0;
                this.electricWheelStateCounterDeltaTime = 0;
                this.electricWheelActivateStateCounterDeltaTime = false;
            }
        }
        if (!this.electricWheelThrown && this.isElectricWheelActive) {
            this.shouldInvert = this.runningDirection > 0;
            if (this.shouldInvert) {
                if (this.state === 'run') {
                    this.electricWheel.x = this.runAnimation.x + (this.runAnimation.width / 2) - (this.electricWheel.width / 2) + 10;
                } else {
                    this.electricWheel.x = this.x + (this.width / 2) - (this.electricWheel.width / 2);
                }
                this.electricWheel.y = this.y - 20;
            } else {
                if (this.state === 'run') {
                    this.electricWheel.x = this.runAnimation.x + (this.runAnimation.width / 2) - (this.electricWheel.width / 2) - 10;
                } else {
                    this.electricWheel.x = this.x + (this.width / 2) - (this.electricWheel.width / 2);
                }
                this.electricWheel.y = this.y - 20;
            }
        } else if (this.electricWheelThrown && this.isElectricWheelActive) {
            this.electricWheel.x += this.electricWheel.incrementMovement;
        }
    }
    checksElyvorgIsFullyVisible() {
        if (!this.game.isElyvorgFullyVisible) {
            if (this.x <= this.game.width - this.width) {
                this.game.isElyvorgFullyVisible = true;
                this.x = this.game.width - this.width;
            }
        }
    }
    checkIfDefeated() {
        if (this.lives <= this.livesDefeatedAt) {
            this.game.elyvorgInFight = false;
            this.lives = 110;
            this.cutsceneBackgroundChange(200, 600, 300);
            this.game.audioHandler.mapSoundtrack.fadeOutAndStop('elyvorgBattleTheme');
            this.game.input.keys = [];
            this.game.audioHandler.enemySFX.stopAllSounds();
            for (const enemy of this.game.enemies) {
                if (!(enemy instanceof Elyvorg)) {
                    enemy.markedForDeletion = true;
                }
            }
            setTimeout(() => {
                this.game.talkToElyvorg = true;
                this.game.player.setToStandingOnce = true;
                this.game.elyvorgDialogueAfterDialoguePlayOnce = true;
                this.game.elyvorgDialogueAfterDialogueLeaving = false;
                this.game.input.keys = [];
                this.game.collisions = [];
                this.game.behindPlayerParticles = [];
                this.x = this.game.width / 2;
                this.state = "idle";
                this.game.player.setState(8, 0);
                this.game.player.x = 1;
                this.game.player.y = this.game.height - this.game.player.height - this.game.groundMargin;
                this.game.player.isInvisible = false;
                this.game.player.invisibleTimer = this.game.player.invisibleCooldown;
                this.game.player.invisibleActiveCooldownTimer = 5000;
            }, 300);
            setTimeout(() => {
                this.game.elyvorgStartAfterDialogueOnlyWhenAnimationEnds = true;
                this.game.audioHandler.enemySFX.stopAllSounds();
                for (const enemy of this.game.enemies) {
                    if (!(enemy instanceof Elyvorg)) {
                        enemy.markedForDeletion = true;
                    }
                }
            }, 1200);
        }
    }
    runningAway(deltaTime) {
        this.runningDirection = 10;
        this.state = 'run';
        this.runAnimation.x = this.x;
        this.runAnimation.y = this.y;
        this.runAnimation.update(deltaTime);
        this.x += this.runningDirection;
        this.game.background.totalDistanceTraveled = this.game.maxDistance - 6;
        if (this.x > this.game.width) {
            this.game.isElyvorgFullyVisible = false;
            this.game.talkToElyvorg = false;
            this.markedForDeletion = true;
        }
    }
    runLogic() {
        this.x += this.runningDirection;
        if (this.runStopAtTheMiddle && this.isInTheMiddle) {
            this.backToIdleSetUp();
            this.runStopAtTheMiddle = false;
        }
        const distanceToPlayer = Math.sqrt(
            Math.pow(this.x - this.game.player.x, 2) +
            Math.pow(this.y - this.game.player.y, 2)
        );
        if (distanceToPlayer <= 300 && this.slashAttackOnce) {
            this.shouldInvert = this.runningDirection > 0;
            this.game.audioHandler.enemySFX.playSound('elyvorg_slash_attack_sound');
            this.slashAttack = new PurpleSlash(this.game, this.x, this.y, this.shouldInvert);
            this.game.enemies.push(this.slashAttack);
            this.isSlashActive = true;
            this.slashAttackOnce = false;
            this.slashAttackStateCounter = 0;
            this.slashAttackStateCounterLimit = Math.floor(Math.random() * 6) + 20; // 20 to 25
        }
        if (this.isSlashActive) {
            if (this.shouldInvert) {
                this.slashAttack.x = this.runAnimation.x + (this.runAnimation.width / 2) - (this.slashAttack.width / 2) + 70;
            } else {
                this.slashAttack.x = this.runAnimation.x + (this.runAnimation.width / 2) - (this.slashAttack.width / 2) - 70;
            }
            this.slashAttack.y = this.runAnimation.y + (this.runAnimation.height / 2) - (this.slashAttack.height / 2) - 30;
        }
        if (this.isSlashActive && this.slashAttack.markedForDeletion === true) {
            this.isSlashActive = false;
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
        const allStates = ['run', 'jump', 'laser', 'meteor', 'ghost', 'gravity', 'ink', 'fireball', 'poison'];

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
        }

        let selectedState;

        if (Math.random() < 0.1 && this.previousState && !this.isGravitySpinnerActive && !this.isPoisonActive) {
            selectedState = this.previousState;
        } else {
            do {
                selectedState = allStates[Math.floor(Math.random() * allStates.length)];
            } while (selectedState === this.previousState || (this.isGravitySpinnerActive && selectedState === 'gravity')
                || (this.isPoisonActive && selectedState === 'poison'));
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
            'jump': this.jumpAnimation
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
        this.checksElyvorgIsFullyVisible();
        if (!this.game.talkToElyvorg) {
            this.checkIfDefeated();
            if (this.game.elyvorgRunAway) {
                this.runningAway(deltaTime);
            } else {
                if (this.game.elyvorgInFight) {
                    this.barrierLogic(deltaTime);
                    this.electricWheelLogic(deltaTime);
                    this.gravityLogicTimer(deltaTime);
                    this.poisonLogicTimer(deltaTime);
                    if (this.state === "idle") {
                        this.fireballThrownWhileInIdle();
                        this.edgeConstraintLogic();
                        this.stateRandomiser();
                    } else if (this.state === "recharge") {
                        this.rechargeAnimation.update(deltaTime);
                        this.rechargeLogic(deltaTime);
                    } else if (this.state === "run") {
                        this.runAnimation.update(deltaTime);
                        this.edgeConstraintLogic();
                        this.runLogic();
                    } else if (this.state === "jump") {
                        this.jumpAnimation.update(deltaTime);
                        this.jumpLogic();
                    } else if (this.state === "laser") {
                        this.laserAnimation.update(deltaTime);
                        this.laserLogic();
                    } else if (this.state === "meteor") {
                        this.meteorAnimation.update(deltaTime);
                        this.meteorLogic();
                    } else if (this.state === "pistol") {
                        this.pistolAnimation.update(deltaTime);
                        this.edgeConstraintLogic();
                        this.pistolLogic();
                    } else if (this.state === "ghost") {
                        this.ghostAnimation.update(deltaTime);
                        this.ghostLogic();
                    } else if (this.state === "gravity") {
                        this.gravityAnimation.update(deltaTime);
                        this.gravityLogic();
                    } else if (this.state === "ink") {
                        this.inkAnimation.update(deltaTime);
                        this.inkLogic();
                    } else if (this.state === "fireball") {
                        this.fireballAnimation.update(deltaTime);
                        this.fireballLogic();
                    } else if (this.state === "poison") {
                        this.poisonAnimation.update(deltaTime);
                        this.poisonLogic();
                    }

                    if (this.x + this.width < 0 || this.x >= this.game.width) {
                        this.game.isElyvorgFullyVisible = false;
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
            'laser': 'laserAnimation',
            'meteor': 'meteorAnimation',
            'pistol': 'pistolAnimation',
            'ghost': 'ghostAnimation',
            'gravity': 'gravityAnimation',
            'ink': 'inkAnimation',
            'fireball': 'fireballAnimation',
            'poison': 'poisonAnimation'
        };

        if (this.state === 'idle') {
            super.draw(context, this.shouldInvert);
        } else {
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
