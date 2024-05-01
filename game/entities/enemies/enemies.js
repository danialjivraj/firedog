export class Enemy {
    constructor() {
        this.frameX = 0;
        this.frameY = 0;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
        this.lives = 1;
        this.id = Math.random().toString(36).substring(2, 11);
        this.soundId;
    }
    isOnScreen() {
        return (
            this.x + this.width >= 0 && this.y + this.height >= 0 &&
            this.x + this.width / 2 <= this.game.width &&
            this.y + this.height / 2 <= this.game.height
        );
    }
    update(deltaTime) {
        //movement
        if (!this.game.cabin.isFullyVisible) {
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;
        } else if (this.game.cabin.isFullyVisible && !(this instanceof MovingGroundEnemy)) {
            this.x -= this.speedX;
            this.y -= this.speedY;
        }

        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }

        if (this.x + this.width < 0 || this.y > this.game.height ||
            this.y + this.height < 0 || this.lives <= 0) {
            this.markedForDeletion = true;
            this.game.audioHandler.enemySFX.playSound(this.soundId, false, true, true);
        } else {
            if (this.isOnScreen()) {
                this.game.audioHandler.enemySFX.playSound(this.soundId);
            }

        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    }
}

// Types of enemies ---------------------------------------------------------------------------------------------------------------------------
class FlyingEnemy extends Enemy {
    constructor(game, width, height, maxFrame, imageId) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = (Math.random() * this.game.height * 0.4) + 100;
        this.speedX = Math.random() + 1;
        this.speedY = 0;
        this.maxFrame = maxFrame;
        this.image = document.getElementById(imageId);
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.angle += this.va;
        this.y += Math.sin(this.angle);
    }
}

export class GroundEnemy extends Enemy {
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
}

export class MovingGroundEnemy extends GroundEnemy {
    constructor(game, width, height, maxFrame, imageId) {
        super(game, width, height, maxFrame, imageId);
    }
}
export class ImmobileGroundEnemy extends GroundEnemy {
    constructor(game, width, height, maxFrame, imageId) {
        super(game, width, height, maxFrame, imageId);
    }
}

export class ClimbingEnemy extends Enemy {
    constructor(game, width, height, maxFrame, image) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.width;
        this.y = Math.random() * this.game.height * 0.5;
        this.image = document.getElementById(image);
        this.speedX = 0;
        this.speedY = Math.random() > 0.5 ? 1 : -1;
        this.maxFrame = maxFrame;
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.y > this.game.height - this.height - this.game.groundMargin) this.speedY *= -1;
        if (this.y < -this.height) this.markedForDeletion = true;
    }
    draw(context) {
        context.beginPath();
        context.moveTo(this.x + this.width / 2, 0);
        context.lineTo(this.x + this.width / 2, this.y + 60);
        context.stroke();
        super.draw(context);
    }
}

class VerticalEnemy extends Enemy {
    constructor(game, width, height, maxFrame, imageId) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.width * 0.5 + Math.random() * this.game.width * 0.5;
        this.y = 0 - this.height;
        this.speedX = 0;
        this.speedY = Math.random() + 1;
        this.maxFrame = maxFrame;
        this.image = document.getElementById(imageId);
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY;
    }
}

export class FallingEnemy extends Enemy {
    constructor(game, width, height, maxFrame, image) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.player.x + Math.random() * (this.game.width - this.game.player.x);
        this.y = -this.height;
        this.image = document.getElementById(image);
        this.speedX = 0;
        this.speedY = Math.random() * 2 + 0.5;
        this.maxFrame = maxFrame;
    }
    update(deltaTime) {
        super.update(deltaTime);
    }
}

class UnderwaterEnemy extends Enemy {
    constructor(game, width, height, maxFrame, imageId) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = Math.random() * this.game.height * 0.5;
        this.speedX = Math.random() + 1;
        this.speedY = 0;
        this.maxFrame = maxFrame;
        this.image = document.getElementById(imageId);
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.angle += this.va;
        this.y += Math.sin(this.angle);
    }
}

export class Bee extends FlyingEnemy {
    constructor(game, width, height, maxFrame, imageName, chaseDistance, initialSpeed, speed, fps) {
        super(game, width, height, maxFrame, imageName);
        this.width = width;
        this.height = height;
        this.maxFrame = maxFrame;
        this.chaseDistance = chaseDistance;
        this.initialSpeed = initialSpeed;
        this.currentSpeed = this.initialSpeed;
        this.passedPlayer = false;
        this.speed = speed;
        this.fps = fps;
        this.frameInterval = 1000 / this.fps;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const distanceToPlayer = Math.sqrt(
            Math.pow(this.x - this.game.player.x, 2) +
            Math.pow(this.y - this.game.player.y, 2)
        );

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                this.angleToPlayer = Math.atan2(
                    this.game.player.y - this.y,
                    this.game.player.x - this.x
                );
                this.moveTowardsPlayer();
            } else {
                this.x -= this.currentSpeed;
            }
        } else {
            this.x += Math.cos(this.angleToPlayer) * this.speed;
            this.y += Math.sin(this.angleToPlayer) * this.speed;
        }

        if (this.x < this.game.player.x) {
            this.passedPlayer = true;
        }
    }

    moveTowardsPlayer() {
        const angleToPlayer = Math.atan2(
            this.game.player.y - this.y,
            this.game.player.x - this.x
        );
        this.x += Math.cos(angleToPlayer) * this.speed;
        this.y += Math.sin(angleToPlayer) * this.speed;
    }
}

export class RunningSkeletonSizes extends MovingGroundEnemy {
    constructor(game, width, height, runningSkeletonImage, sleepingAnimationWidth, sleepingAnimationHeight, sleepingAnimationFrames, sleepingAnimationImage) {
        super(game, width, height, 12, runningSkeletonImage);
        this.width = width;
        this.height = height;
        this.state = 'sleeping';
        this.sleepingAnimation = new MovingGroundEnemy(game, sleepingAnimationWidth, sleepingAnimationHeight, sleepingAnimationFrames, sleepingAnimationImage);
        this.sleepingAnimation.frameX = 0;
        this.sleepingAnimation.frameY = 0;
        this.soundId;
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.y >= this.game.height - this.height - this.game.groundMargin) {
            this.y = this.game.height - this.height - this.game.groundMargin;
            this.speedY = 0;
        }
        if (this.state === 'sleeping') {
            this.game.audioHandler.enemySFX.playSound('fuseSound');
            const playerDistance = Math.abs(this.game.player.x - this.x);
            if (playerDistance < 900 && this.y >= this.game.height - this.height - this.game.groundMargin) { // ground margin logic is for flying bomber
                this.soundId = 'skeletonRattlingSound';
                this.state = 'running';
                this.frameX = 0;
                this.runningSpeed = 3;
            }
        }

        if (this.state === 'running') {
            this.x -= this.runningSpeed;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
            } else {
                this.frameTimer += deltaTime;
            }

        } else {
            this.sleepingAnimation.x = this.x;
            this.sleepingAnimation.y = this.y;
            this.sleepingAnimation.update(deltaTime);
        }
    }

    draw(context) {
        if (this.state === 'running') {
            super.draw(context);
        } else {
            this.sleepingAnimation.draw(context);
        }
    }
}
// Projectiles --------------------------------------------------------------------------------------------------------------------------------
export class Projectile extends Enemy {
    constructor(game, x, y, width, height, maxFrame, imageId, speedX, fps) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.image = document.getElementById(imageId);
        this.speedX = speedX;
        this.speedY = 0;
        this.maxFrame = maxFrame;
        this.fps = fps;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }
    }
}

export class WindAttack extends Projectile {
    constructor(game, x, y, width, height, maxFrame, imageId, speedX, player) {
        super(game, x, y, width, height, maxFrame, imageId, speedX, 30);
        this.player = player;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedX;

        const deltaX = this.player.x - this.x;
        const deltaY = this.player.y - this.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const directionX = deltaX / distance;

        this.x += directionX * this.speedX;
        const pushbackDistance = 50;
        const playerPushbackX = this.player.x - directionX * pushbackDistance;

        this.player.x += (playerPushbackX - this.player.x) * 0.04;

        if (!(this.x + this.width < 0 || this.y > this.game.height || this.lives <= 0)) {
            this.game.audioHandler.enemySFX.playSound('tornadoAudio');
        }
    }
}

export class LeafAttack extends Projectile {
    constructor(game, x, y, width, height, maxFrame, imageId, speedX, rotationAngle) {
        super(game, x, y, width, height, maxFrame, imageId, speedX, 30);
        this.rotation = 0;
        this.rotationAngle = rotationAngle;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.rotation += deltaTime * this.rotationAngle;
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.rotation);
        context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
        context.restore();
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class PoisonSpit extends Projectile {
    constructor(game, x, y, width, height, maxFrame, imageId, speedX) {
        super(game, x, y, width, height, maxFrame, imageId, speedX, 30);
    }
}

export class LaserBeam extends Projectile {
    constructor(game, x, y, width, height, maxFrame, imageId, speedX) {
        super(game, x, y, width, height, maxFrame, imageId, speedX, 30);
    }
    update(deltaTime) {
        super.update(deltaTime);
    }
    draw(context) {
        super.draw(context);
        if (this.game.isElyvorgFullyVisible) {
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

            const shouldFlipSprite = this.speedX < 0;

            if (shouldFlipSprite) {
                context.save();
                context.scale(-1, 1);
                context.drawImage(this.image, -(this.x + this.width), this.y, this.width, this.height);
                context.restore();
            } else {
                context.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
        }
    }
}

export class IceBall extends Projectile {
    constructor(game, x, y, speedY) {
        super(game, x, y, 35, 35, 0, "iceBall", 7, speedY);
        this.initialSize = 10;
        this.size = this.initialSize;
        this.maxSize = 35;
        this.growthRate = 1;
        this.x = x;
        this.y = y;
        this.speedY = speedY;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.04;
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
        context.translate(this.x + this.size / 2, this.y + this.size / 2);
        context.rotate(this.rotationAngle);

        if (this.game.debug) context.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
        context.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);

        context.restore();
    }
}

export class DarkLaser extends Projectile {
    constructor(game, x, y, speedY, direction) {
        super(game, x, y, 63, 40, 0, 'darkLaser', speedY);
        this.initialSize = 10;
        this.size = this.initialSize;
        this.x = x;
        this.y = y;
        this.speedX = 15;
        this.speedY = speedY;
        this.direction = direction;
    }
    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
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

export class YellowBeam extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 53, 85, 0, 'yellowBeam');
        this.x = x;
        this.y = y;
        this.speedX = 0;
        this.speedY = -5;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY;
    }
}

export class PurpleLaser extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 82, 48, 0, 'purpleLaser', 15, 0);
    }
    update(deltaTime) {
        super.update(deltaTime);
    }
}

export class RockProjectile extends Projectile {
    constructor(game, x, y, width, height, maxFrame, imageId, speedX, rotationAngle) {
        super(game, x, y, width, height, maxFrame, imageId, speedX, 30);
        this.rotation = 0;
        this.rotationAngle = rotationAngle;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.rotation += deltaTime * this.rotationAngle;
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.rotation);
        context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
        context.restore();
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}
// Goblin -------------------------------------------------------------------------------------------------------------------------------------
export class Goblin extends MovingGroundEnemy {
    constructor(game) {
        super(game, 60.083, 80, 11, 'goblinRun');
        this.lives = 3;
        this.walkFps = 60;
        this.attackFps = 60;
        this.jumpFps = 60;
        this.frameInterval = 1000 / this.walkFps;
        this.state = 'walk';
        this.attackAnimation = new MovingGroundEnemy(game, 60.083, 80, 11, 'goblinSteal');
        this.attackAnimation.fps = this.attackFps;
        this.attackAnimation.frameInterval = 1000 / this.attackFps;
        this.attackAnimation.frameX = 0;

        this.jumpAnimation = new MovingGroundEnemy(game, 60.083, 80, 11, 'goblinJump');
        this.jumpAnimation.fps = this.jumpFps;
        this.jumpAnimation.frameInterval = 1000 / this.jumpAnimation.fps;
        this.jumpAnimation.frameX = 0;
        this.isJumping = false;
        this.hasJumped = false;
        this.jumpStartTime = 0;
        this.jumpDuration = 0.7;
        this.jumpHeight = 380;
        this.originalY = this.y;

        this.soundId;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);

        if (!this.hasJumped && !this.isJumping && ((this.game.player.currentState === this.game.player.states[2]) || (this.game.player.currentState === this.game.player.states[4] && !this.game.player.onGround())) && playerDistance < 300
            && this.game.player.x < this.x) {
            this.isJumping = true;
            this.jumpStartTime = this.game.hiddenTime;
        }

        if (this.isJumping) {
            this.game.audioHandler.enemySFX.playSound('goblinJumpSound');
            const jumpProgress = (this.game.hiddenTime - this.jumpStartTime) / (this.jumpDuration * 1000);
            if (jumpProgress < 1) {
                this.y = this.originalY - this.jumpHeight * Math.sin(jumpProgress * Math.PI);
                this.x -= 3;
            } else {
                this.y = this.originalY;
                this.isJumping = false;
                this.hasJumped = true;
            }
        }
        if (this.state === 'jump') {
            this.jumpAnimation.update(deltaTime);
            this.x -= 3;
            if (this.jumpAnimation.frameX === 11) {
                this.jumpAnimation.frameX = 5;
            }

            if ((this.x < this.game.player.x + this.width && this.x + this.width > this.game.player.x &&
                this.y < this.game.player.y + this.height && this.y + this.height > this.game.player.y && !this.game.gameOver)) {
                this.state = 'attack';
                this.attackAnimation.x = this.x;
                this.attackAnimation.y = this.y;
                this.attackAnimation.frameX = 0;
            }
            if (this.hasJumped === true) {
                this.state = 'walk';
                this.frameX = 0;
            }
        }

        if (this.state === 'walk') {
            this.soundId = 'goblinRunSound';
            this.x -= 3;
            if (this.originalY != this.y) {
                this.state = 'jump';
                this.jumpAnimation.x = this.x;
                this.jumpAnimation.y = this.y;
                this.jumpAnimation.frameX = 0;
            }
            if ((this.x < this.game.player.x + this.width && this.x + this.width > this.game.player.x &&
                this.y < this.game.player.y + this.height && this.y + this.height > this.game.player.y && !this.game.gameOver)) {
                this.state = 'attack';
                this.attackAnimation.x = this.x;
                this.attackAnimation.y = this.y;
                this.attackAnimation.frameX = 0;
            }
        } else if (this.state === 'attack') {
            this.attackAnimation.update(deltaTime);
            this.x -= 3;
            if (this.attackAnimation.frameX === 11) {
                this.state = 'walk';
                this.frameX = 0;
            }
        }

        if (this.game.gameOver && this.attackAnimation.frameX >= this.attackAnimation.maxFrame) {
            this.state = 'walk';
        }
    }

    draw(context) {
        if (this.state === 'walk') {
            super.draw(context);
        } else if (this.state === 'attack') {
            this.attackAnimation.x = this.x;
            this.attackAnimation.y = this.y;
            this.attackAnimation.draw(context);
        } else if (this.state === 'jump') {
            this.jumpAnimation.x = this.x;
            this.jumpAnimation.y = this.y;
            this.jumpAnimation.draw(context);
        }
    }
}

// Map 1 --------------------------------------------------------------------------------------------------------------------------------------
export class FlyEnemy extends FlyingEnemy {
    constructor(game) {
        super(game, 60, 44, 5, 'enemy_fly');
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);

        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('buzzingFly');
        }
    }
}

export class VerticalBat extends VerticalEnemy {
    constructor(game) {
        super(game, 151.16666666, 90, 5, 'vertical_bat');
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;
        this.amplitude = 3;
        this.playsOnce = true;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY;
        this.x += this.speedX;

        this.x += this.amplitude * Math.sin(this.angle);
        this.angle += this.va;

        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('batPitch');
        }

        if (this.frameX === 3 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('wooshBat');
        }
    }
}

export class BatEnemy extends FlyingEnemy {
    constructor(game) {
        super(game, 134.33, 84, 5, 'enemy_bat');
    }
    update(deltaTime) {
        super.update(deltaTime);

        if (this.frameX === 3 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('batFlapAudio');
        }
    }
}

export class RavenEnemy extends FlyingEnemy {
    constructor(game) {
        super(game, 139.66, 100, 5, 'enemy_raven');
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);

        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('ravenCallAudio');
        }

        if (this.frameX === 2 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('ravenSingleFlap');
        }
    }
}

export class RunningSkeleton extends RunningSkeletonSizes {
    constructor(game) {
        super(game, 104.23076923076923076923076923077, 70, 'runningSkeleton', 57, 57, 10, 'skeletonBomb');
    }
}

export class SpinningEnemy extends FlyingEnemy {
    constructor(game) {
        super(game, 100.44, 100, 8, 'spinning_enemy');
        this.soundId = 'spinningChainsaw';
        this.radius = Math.random() * 2 + 6;
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.x -= Math.cos(this.angle) * this.radius;
        this.y += Math.sin(this.angle) * this.radius;

        if (this.x + this.width < 0 || this.lives <= 0) {
            this.game.audioHandler.enemySFX.stopSound('hedgehogRollingSound');
        }
    }
}

export class OrangeFlyMonster extends FlyingEnemy {
    constructor(game) {
        super(game, 191.68, 130, 24, 'orangeFlyMonsterWalk');
        this.walkFps = 120;
        this.attackFps = 120;
        this.frameInterval = 1000 / this.walkFps;
        this.state = 'walk';
        this.attackAnimation = new MovingGroundEnemy(game, 191.68, 130, 24, 'orangeFlyMonsterAttack');
        this.attackAnimation.fps = this.attackFps;
        this.attackAnimation.frameInterval = 1000 / this.attackFps;
        this.attackAnimation.frameX = 0;
        this.canAttack = true;
        this.windAttackConfig = {
            width: 105,
            height: 120,
            maxFrame: 5,
            imageId: 'windAttack',
            speedX: 2,
            fps: 20,
            offsetX: 0,
            offsetY: 0,
        };
    }
    throwWindAttack() {
        const windAttack = new WindAttack(
            this.game,
            this.x + this.windAttackConfig.offsetX + 50,
            this.y + this.windAttackConfig.offsetY + 20,
            this.windAttackConfig.width,
            this.windAttackConfig.height,
            this.windAttackConfig.maxFrame,
            this.windAttackConfig.imageId,
            this.windAttackConfig.speedX,
            this.game.player
        );
        this.game.enemies.push(windAttack);
    }
    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);

        if (this.state === 'walk') {
            this.x -= 1;
            if (playerDistance <= 1200 && this.frameX == 24) {
                if (!this.game.gameOver) {
                    this.state = 'attack';
                    this.attackAnimation.x = this.x;
                    this.attackAnimation.y = this.y;
                    this.attackAnimation.frameX = 0;
                }
            }
        } else if (this.state === 'attack') {
            this.attackAnimation.update(deltaTime);
            if (this.attackAnimation.frameX === 12 && this.canAttack === true) {
                this.throwWindAttack();
                this.game.audioHandler.enemySFX.playSound('windAttackAudio', false, true);

                this.canAttack = false;
            }

            if (this.attackAnimation.frameX === 24) {
                this.canAttack = true;
                this.state = 'walk';
                this.frameX = 0
            }
            if (playerDistance > 1200 && this.attackAnimation.frameX >= this.attackAnimation.maxFrame) {
                this.state = 'walk';
            }
        }
        if (this.game.gameOver && this.attackAnimation.frameX >= this.attackAnimation.maxFrame) {
            this.state = 'walk';
        }
        if (this.frameX === 11 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('orangeMonsterFlap');
        }
    }

    draw(context) {
        if (this.state === 'walk') {
            super.draw(context);
        } else if (this.state === 'attack') {
            this.attackAnimation.x = this.x;
            this.attackAnimation.y = this.y;
            this.attackAnimation.draw(context);
        }
    }
}

// Map 2 --------------------------------------------------------------------------------------------------------------------------------------
export class NightPlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 60, 87, 1, 'enemy_nightPlant');
        this.soundId = 'teethChatteringSound';
        this.leafAttackConfig = {
            width: 35.416,
            height: 45,
            maxFrame: 11,
            imageId: 'darkLeafAttack',
            cooldown: 5000,
            speedX: 5,
        };
        this.lastLeafAttackTime = 4999;
        this.soundId = 'teethChatteringSound';
    }

    throwLeaf() {
        const { x, y, height } = this;
        const { width, height: leafHeight, maxFrame, imageId } = this.leafAttackConfig;

        const firstLeafAttack = new LeafAttack(
            this.game, x, y + height / 2 - leafHeight / 2, width,
            leafHeight, maxFrame, imageId, this.leafAttackConfig.speedX,
            0.0002 + Math.random() * (0.001 - 0.0002)
        );
        this.game.audioHandler.enemySFX.playSound('leafAttackAudio');
        this.game.enemies.push(firstLeafAttack);

        this.lastLeafAttackTime = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.lastLeafAttackTime += deltaTime;
        if (this.lastLeafAttackTime >= this.leafAttackConfig.cooldown && this.x < this.game.width - this.width) {
            this.throwLeaf();
        }
    }
}

export class NightSpider extends ClimbingEnemy {
    constructor(game) {
        super(game, 120, 144, 5, 'enemy_spider');
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.09;
        this.soundId = 'nightSpiderSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY * Math.sin(this.angle);
        this.angle += this.va;
    }
}

export class GhostEnemy extends FlyingEnemy {
    constructor(game) {
        super(game, 104.83, 84, 5, 'enemy_ghost');
        this.curve = Math.random() * 5;
        this.playsOnce = true;
        this.currentSpeed = 6;
        this.chaseDistance = this.game.width;
        this.passedPlayer = false;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.va = Math.random() * 0.09 + 0.01;
        this.y += 1.5 * Math.sin(this.angle) * this.curve;
        this.angle += 0.005;
        const distanceToPlayer = Math.sqrt(
            Math.pow(this.x - this.game.player.x, 2) +
            Math.pow(this.y - this.game.player.y, 2)
        );

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                this.angleToPlayer = Math.atan2(
                    this.game.player.y - this.y,
                    this.game.player.x - this.x
                );
                this.moveTowardsPlayer();
            } else {
                this.x -= this.currentSpeed;
            }
        }

        if (this.x < this.game.player.x) {
            this.passedPlayer = true;
        }
        if (this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('ghostHmAudio');
        }
    }

    moveTowardsPlayer() {
        const angleToPlayer = Math.atan2(
            this.game.player.y - this.y,
            this.game.player.x - this.x
        );
        this.x += Math.cos(angleToPlayer) * this.currentSpeed;
        this.y += Math.sin(angleToPlayer) * this.currentSpeed;
    }

    draw(context) {
        context.save();
        context.globalAlpha = 0.3;
        super.draw(context);
        context.restore();
    }
}

export class VerticalGhost extends VerticalEnemy {
    constructor(game) {
        super(game, 61.5, 50, 5, 'vertical_ghost');
        this.initialSpeed = 3;
        this.currentSpeed = 4;
        this.chaseDistance = this.game.width;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.game.audioHandler.enemySFX.playSound('verticalGhostSound');
        const distanceToPlayer = Math.sqrt(
            Math.pow(this.x - this.game.player.x, 2) +
            Math.pow(this.y - this.game.player.y, 2)
        );

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                this.angleToPlayer = Math.atan2(
                    this.game.player.y - this.y,
                    this.game.player.x - this.x
                );
                this.moveTowardsPlayer();
            } else {
                this.x -= this.currentSpeed;
            }
        } else {
            this.x += Math.cos(this.angleToPlayer) * this.currentSpeed;
            this.y += Math.sin(this.angleToPlayer) * this.currentSpeed;
        }

        if (this.x < this.game.player.x) {
            this.passedPlayer = true;
        }
    }

    moveTowardsPlayer() {
        const angleToPlayer = Math.atan2(
            this.game.player.y - this.y,
            this.game.player.x - this.x
        );
        this.x += Math.cos(angleToPlayer) * this.currentSpeed;
        this.y += Math.sin(angleToPlayer) * this.currentSpeed;
    }
}

export class Aura extends FlyingEnemy {
    constructor(game) {
        super(game, 52, 50, 0, 'aura');
        this.currentSpeed = 5;
        this.chaseDistance = this.game.width;
        this.passedPlayer = false;
        this.angleToPlayer = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        const distanceToPlayer = Math.sqrt(
            Math.pow(this.x - this.game.player.x, 2) +
            Math.pow(this.y - this.game.player.y, 2)
        );

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                this.angleToPlayer = Math.atan2(
                    this.game.player.y - this.y,
                    this.game.player.x - this.x
                );
                this.moveTowardsPlayer();
            } else {
                this.x -= this.currentSpeed;
            }
        } else {
            this.x += Math.cos(this.angleToPlayer) * this.currentSpeed;
            this.y += Math.sin(this.angleToPlayer) * this.currentSpeed;
        }

        if (this.x < this.game.player.x) {
            this.passedPlayer = true;
        }
    }

    moveTowardsPlayer() {
        const angleToPlayer = Math.atan2(
            this.game.player.y - this.y,
            this.game.player.x - this.x
        );
        this.x += Math.cos(angleToPlayer) * this.currentSpeed;
        this.y += Math.sin(angleToPlayer) * this.currentSpeed;
    }

    draw(context) {
        context.save();
        context.globalAlpha = 0.5;
        super.draw(context);
        context.restore();
    }
}
export class DollGhost extends FlyingEnemy {
    constructor(game) {
        super(game, 88.2, 120, 29, 'enemy_dollGhost');
        this.auraTimer = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.game.audioHandler.enemySFX.playSound('dollHumming');
        this.game.audioHandler.enemySFX.playSound('auraSoundEffect', true);

        this.auraTimer += deltaTime;

        if (!this.game.gameOver) {
            if (this.auraTimer >= 1000) {
                let aura = new Aura(this.game);
                aura.x = this.x + 20;
                aura.y = this.y + 70;
                if (this.x < this.game.width) {
                    this.game.enemies.push(aura);
                }
                this.auraTimer = 0;
            }
        }
    }

    draw(context) {
        context.save();
        context.globalAlpha = 0.5;
        super.draw(context);
        context.restore();
    }
}
// Map 3 --------------------------------------------------------------------------------------------------------------------------------------
export class Piranha extends UnderwaterEnemy {
    constructor(game) {
        super(game, 75.166666666666666666666666666667, 50, 5, 'piranha');
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 3;

        if (this.frameX === 1 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('crunchSound');
        }
    }
}

export class SkeletonFish extends UnderwaterEnemy {
    constructor(game) {
        super(game, 55, 39, 4, 'skeletonFish');
        this.chaseDistance = 900;
        this.initialSpeed = 3;
        this.currentSpeed = this.initialSpeed;
        this.passedPlayer = false;
        this.speed = 6;
        this.moveTowardsPlayerActive = false;
        this.useLogic1 = Math.random() < 0.5;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.useLogic1) {
            this.updateLogic1();
        } else {
            this.updateLogic2();
        }

        if (this.frameX === 1 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('skeletonCrunshSound');
        }
    }

    updateLogic1() {
        const distanceToPlayer = Math.sqrt(
            Math.pow(this.x - this.game.player.x, 2) +
            Math.pow(this.y - this.game.player.y, 2)
        );

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                this.angleToPlayer = Math.atan2(
                    this.game.player.y - this.y,
                    this.game.player.x - this.x
                );
                this.moveTowardsPlayer();
            } else {
                this.x -= this.currentSpeed;
            }
        } else {
            this.x += Math.cos(this.angleToPlayer) * this.speed;
            this.y += Math.sin(this.angleToPlayer) * this.speed;
        }

        if (this.x < this.game.player.x) {
            this.passedPlayer = true;
        }
    }

    updateLogic2() {
        const distanceToPlayer = Math.sqrt(
            Math.pow(this.x - this.game.player.x, 2) +
            Math.pow(this.y - this.game.player.y, 2)
        );

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                this.angleToPlayer = Math.atan2(
                    this.game.player.y - this.y,
                    this.game.player.x - this.x
                );
                this.moveTowardsPlayer();
            } else {
                this.x -= this.currentSpeed;
            }
        } else {
            this.x -= this.currentSpeed;
        }

        if (this.x < this.game.player.x - 150 || this.game.gameOver) {
            this.passedPlayer = true;
        }
    }

    moveTowardsPlayer() {
        const angleToPlayer = Math.atan2(
            this.game.player.y - this.y,
            this.game.player.x - this.x
        );
        this.x += Math.cos(angleToPlayer) * this.speed;
        this.y += Math.sin(angleToPlayer) * this.speed;
        this.angleToPlayer = angleToPlayer;
        this.moveTowardsPlayerActive = true;
    }

    draw(context) {
        if (this.useLogic1) {
            this.drawLogic1(context);
        } else {
            this.drawLogic2(context);
        }
    }

    drawLogic1(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();

        context.translate(this.x + this.width / 2, this.y + this.height / 2);

        if (this.moveTowardsPlayerActive || this.passedPlayer) {
            context.rotate(this.angleToPlayer);

            if (this.moveTowardsPlayerActive) {
                context.scale(-1, -1);
            }
        }

        context.drawImage(
            this.image,
            this.frameX * this.width,
            0,
            this.width,
            this.height,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        context.restore();
    }

    drawLogic2(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();

        context.translate(this.x + this.width / 2, this.y + this.height / 2);

        if (!this.passedPlayer) {
            context.rotate(this.angleToPlayer);

            if (this.moveTowardsPlayerActive) {
                context.scale(-1, -1);
            }
        }

        context.drawImage(
            this.image,
            this.frameX * this.width,
            0,
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

export class SpearFish extends MovingGroundEnemy {
    constructor(game) {
        super(game, 91.875, 110, 7, 'spearFish');
        this.lives = 2;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 4;
        this.game.audioHandler.enemySFX.playSound('stepWaterSound');
    }
}

export class JetFish extends UnderwaterEnemy {
    constructor(game) {
        super(game, 142, 55, 7, 'jetFish');
        this.y = this.game.player.y;
        this.va = Math.random() * 0.001 + 0.1;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 9;

        if (this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('rocketLauncherSound');
        }
    }
}

export class Piper extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 87, 67, 2, 'piperIdle');
        this.state = "idle";
        this.lives = 2;
        this.fps = 14;
        this.frameInterval = 1000 / this.fps;
        this.image = document.getElementById('piperIdle');
        this.playOnce = true;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);
        if (playerDistance < 100 || this.lives <= 1) {
            this.state = 'extended';
            this.image = document.getElementById('piperExtended');
            this.width = 82;
            this.height = 234;
            this.maxFrame = 10;
            this.y = this.game.height - this.height - this.game.groundMargin;
        }

        if (this.state === "extended") {
            if (this.playOnce) {
                this.playOnce = false;
                this.game.audioHandler.enemySFX.playSound('extendingSound', false, true);
            }
            if (this.frameX === 10) {
                this.frameX = 9;
            }
        }
    }
}

export class ElectricEel extends FallingEnemy {
    constructor(game) {
        super(game, 107, 87, 4, 'electricEel');
        this.chaseDistance = 900;
        this.initialSpeed = 3;
        this.currentSpeed = this.initialSpeed;
        this.passedPlayer = false;
        this.speed = 4;
        this.moveTowardsPlayerActive = false;
        this.fps = 4;
        this.frameInterval = 1000 / this.fps;
    }

    update(deltaTime) {
        super.update(deltaTime);

        const distanceToPlayer = Math.sqrt(
            Math.pow(this.y - this.game.player.y, 2)
        );

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                this.angleToPlayer = Math.atan2(
                    this.game.player.y - this.y,
                    this.game.player.x - this.x
                );

                this.speedY = Math.sin(this.angleToPlayer) * this.speed;

                this.moveTowardsPlayerActive = true;
            } else {
                this.moveTowardsPlayerActive = false;
                this.y += this.currentSpeed;
            }
        }

        if (this.moveTowardsPlayerActive) {
            this.y += this.speedY;
        }
        if (this.x < this.game.player.x) {
            this.passedPlayer = true;
        }
        if (this.frameX === 4 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('electricitySound');
        }
    }
}

export class OneEyeOcto extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 165, 122, 3, 'oneEyeOcto');
    }
}

// Map 4 --------------------------------------------------------------------------------------------------------------------------------------
export class BigSlug extends MovingGroundEnemy {
    constructor(game) {
        super(game, 147.33, 110, 5, 'enemy_slug');
        this.xSpeed = Math.floor(Math.random() * 5) + 1;
        this.soundId = 'slimyWalkSound';
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class GreenPlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 113, 150, 1, 'enemy_greenPlant');
        this.leafAttackConfig = {
            width: 35.416,
            height: 45,
            maxFrame: 11,
            imageId: 'leafAttack',
            cooldown: 5000,
            speedX: 5,
        };
        this.lastLeafAttackTime = 4999;
        this.soundId = 'teethChatteringSound';
    }

    throwLeaf() {
        const { x, y, height } = this;
        const { width, height: leafHeight, maxFrame, imageId } = this.leafAttackConfig;

        const firstLeafAttack = new LeafAttack(
            this.game, x, y + height / 2 - leafHeight / 2, width,
            leafHeight, maxFrame, imageId, this.leafAttackConfig.speedX,
            0.0002 + Math.random() * (0.001 - 0.0002)
        );
        this.game.audioHandler.enemySFX.playSound('leafAttackAudio');
        this.game.enemies.push(firstLeafAttack);

        const secondLeafAttack = new LeafAttack(
            this.game, x, y + height / 2 - leafHeight / 2, width,
            leafHeight, maxFrame, imageId, this.leafAttackConfig.speedX * 1.5,
            0.0001 + Math.random() * (0.009 - 0.0001)
        );
        this.game.enemies.push(secondLeafAttack);

        this.lastLeafAttackTime = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.lastLeafAttackTime += deltaTime;
        if (this.lastLeafAttackTime >= this.leafAttackConfig.cooldown && this.x < this.game.width - this.width) {
            this.throwLeaf();
        }
    }
}

export class GreenFlappyBird extends FlyingEnemy {
    constructor(game) {
        super(game, 118.82352941176470588235294117647, 85, 16, 'greenFlappyBird');
        this.fps = 120;
        this.frameInterval = 1000 / this.fps;
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);

        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('ravenCallAudio');
        }

        if (this.frameX === 7 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('ravenSingleFlap');
        }
    }
}

export class LilHornet extends FlyingEnemy {
    constructor(game) {
        super(game, 56, 47, 1, 'lilHornet');
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);

        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('buzzingFly');
        }
    }
}

export class KarateCroco extends MovingGroundEnemy {
    constructor(game) {
        super(game, 152.75, 110, 3, 'karateCrocodileIdle');
        this.state = "idle";
        this.lives = 2;
        this.flyKickAnimation = new MovingGroundEnemy(game, 153, 110, 2, 'karateCrocodileFlyKick');
        this.playsOnce = true;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);
        if (playerDistance < 1500 && this.y >= this.game.height - this.height - this.game.groundMargin
            || this.lives <= 1) {
            this.state = 'flykick';
        }

        if (this.state === "flykick") {
            if (this.playsOnce && this.isOnScreen()) {
                this.playsOnce = false;
                this.game.audioHandler.enemySFX.playSound('ahhhSound', false, true);
            }
            if (this.flyKickAnimation.frameX < 2) {
                this.flyKickAnimation.update(deltaTime);
                this.x -= 14;
            } else {
                this.x -= 14;
                this.flyKickAnimation.frameX = 2;
            }
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        if (this.state === 'idle') {
            super.draw(context);
        } else if (this.state === 'flykick') {
            this.flyKickAnimation.x = this.x;
            this.flyKickAnimation.y = this.y;
            this.flyKickAnimation.draw(context);
        }
    }
}

export class Frog extends MovingGroundEnemy {
    constructor(game) {
        super(game, 316, 202, 16, 'enemy_frog_run');
        this.image = document.getElementById('enemy_frog_run');
        this.lives = 2;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        this.state = 'run';
        this.jumpHeight = 160;
        this.jumpDuration = 0.5;
        this.jumpStartTime = 0;
        this.originalY = this.y;
        this.jumpedBeforeDistanceLogic = false;
        this.poisonSpitConfig = {
            width: 59,
            height: 22,
            maxFrame: 11,
            imageId: 'poison_spit',
            speedX: 18,
        };
        this.poisonSpitThrown = false;
        this.playsOnce = true;
    }

    throwPoisonSpit() {
        if (!this.poisonSpitThrown) {
            const { x, y, height } = this;
            const { width, height: spitHeight, maxFrame, imageId } = this.poisonSpitConfig;

            const poisonSpit = new PoisonSpit(
                this.game, x + 20, y + 15 + height / 2 - spitHeight / 2, width,
                spitHeight, maxFrame, imageId, this.poisonSpitConfig.speedX
            );
            this.game.enemies.push(poisonSpit);
            this.poisonSpitThrown = true;
        }
    }
    frogRun() {
        const playerDistance = Math.abs(this.game.player.x - this.x);
        this.x -= 2;
        if (this.state === 'run' && this.frameX === 0 && !this.jumpedBeforeDistanceLogic) {
            this.jumpStartTime = this.game.hiddenTime;
            this.jumpedBeforeDistanceLogic = true;
        }
        const jumpProgress = (this.game.hiddenTime - this.jumpStartTime) / (this.jumpDuration * 1000);
        if (jumpProgress < 1) {
            this.y = this.originalY - this.jumpHeight * Math.sin(jumpProgress * Math.PI);
            this.x -= 5;
        } else {
            this.y = this.originalY;
            this.game.audioHandler.enemySFX.playSound('landingJumpSound', false, true);
            if (this.game.gameOver) {
                this.state = 'run';
                this.image = document.getElementById('enemy_frog_run');
                this.width = 316;
                this.height = 202;
                this.frameX = 0;
                this.y = this.game.height - this.height - this.game.groundMargin;
                this.jumpedBeforeDistanceLogic = false;
            } else if (playerDistance <= 1500) {
                this.state = 'attack';
                this.image = document.getElementById('enemy_frog_poison_attack');
                this.width = 177;
                this.height = 132;
                this.frameX = 0;
                this.x = this.x + 45;
                this.y = this.game.height - this.height - this.game.groundMargin;
                this.poisonSpitThrown = false;
            } else {
                this.state = 'run';
                this.image = document.getElementById('enemy_frog_run');
                this.width = 316;
                this.height = 202;
                this.frameX = 0;
                this.y = this.game.height - this.height - this.game.groundMargin;
                this.jumpedBeforeDistanceLogic = false;
            }
        }
    }
    frogAttack() {
        if (this.state === 'attack' && this.frameX === 13) {
            this.throwPoisonSpit();
            this.game.audioHandler.enemySFX.playSound('spitSound', false, true);
        }
        if (this.state === 'attack' && this.frameX >= this.maxFrame) {
            this.state = 'run';
            this.image = document.getElementById('enemy_frog_run');
            this.width = 316;
            this.height = 202;
            this.frameX = 0;
            this.x = this.x - 90;
            this.y = this.game.height - this.height - this.game.groundMargin;
            this.jumpStartTime = this.game.hiddenTime;
        }
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('frogSound', false, true);
        }
        if (this.state === 'run') {
            this.frogRun();
        } else if (this.state === 'attack') {
            this.frogAttack();
        }
    }
}

export class PurpleSpider extends MovingGroundEnemy {
    constructor(game) {
        super(game, 161.33, 144, 18, 'spider_walk');
        this.lives = 2;
        this.walkFps = 60;
        this.attackFps = 120;
        this.frameInterval = 1000 / this.walkFps;
        this.state = 'walk';
        this.attackAnimation = new MovingGroundEnemy(game, 161.33, 144, 59, 'spider_laser_attack');
        this.attackAnimation.fps = this.attackFps;
        this.attackAnimation.frameInterval = 1000 / this.attackFps;
        this.attackAnimation.frameX = 0;
        this.attackCooldown = 0;
        this.canAttack = true;
        this.laserBeamConfig = {
            width: 300,
            height: 28,
            maxFrame: 9,
            imageId: 'laser_beam',
            speedX: 30,
        };
    }
    throwLaserBeam() {
        const { x, y, height } = this;
        const { width, height: spitHeight, maxFrame, imageId } = this.laserBeamConfig;

        const laserBeam = new LaserBeam(
            this.game, x - 170, y - 15 + height / 2 - spitHeight / 2, width,
            spitHeight, maxFrame, imageId, this.laserBeamConfig.speedX
        );
        this.game.enemies.push(laserBeam);
    }
    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);

        if (this.state === 'walk') {
            this.x -= 2;
            if (playerDistance <= 1200 && this.frameX == 18) {
                if (this.game.player.x <= this.x && !this.game.gameOver) {
                    this.state = 'attack';
                    this.attackAnimation.x = this.x;
                    this.attackAnimation.y = this.y;
                    this.attackAnimation.frameX = 0;
                }
            }
        } else if (this.state === 'attack') {

            this.attackAnimation.update(deltaTime);
            if (this.attackAnimation.frameX === 27 && this.canAttack === true) {
                this.throwLaserBeam();
                this.game.audioHandler.enemySFX.playSound('laserAttackAudio', false, true);
                this.canAttack = false;
            }
            if (this.attackAnimation.frameX === 59) {
                this.canAttack = true;
            }
            if (playerDistance > 1200 && this.attackAnimation.frameX >= this.attackAnimation.maxFrame) {
                this.state = 'walk';
            }
        }

        if ((this.game.player.x > this.x && this.attackAnimation.frameX >= this.attackAnimation.maxFrame)
            || ((this.game.gameOver && this.attackAnimation.frameX >= this.attackAnimation.maxFrame))) {
            this.state = 'walk';
        }

        if (this.frameX === 0 || this.frameX === 9 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('purpleSpiderWalking');
        }
    }

    draw(context) {
        if (this.state === 'walk') {
            super.draw(context);
        } else if (this.state === 'attack') {
            this.attackAnimation.x = this.x;
            this.attackAnimation.y = this.y;
            this.attackAnimation.draw(context);
        }
    }
}

export class RunningSkeletonSmall extends RunningSkeletonSizes {
    constructor(game) {
        super(game, 81.923076923076923076923076923077, 55, 'runningSkeletonSmall', 42, 42, 10, 'skeletonBombSmall');
    }
}
export class FlyingBomber extends FlyingEnemy {
    constructor(game) {
        super(game, 185, 103, 4, 'flyingBomber');
        this.y = Math.random() * this.game.height * 0.05;
        this.fps = 5;
        this.frameInterval = 1000 / this.fps;
        this.maxFrameReached = false;
        this.skeletonCount = 0;
        this.skeletonLimit = false;
        this.soundId = 'kiteSound';
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.game.gameOver || this.skeletonLimit) {
            this.maxFrame = 2;
        }

        if (this.frameX === this.maxFrame && !this.maxFrameReached && !this.game.gameOver) {
            this.maxFrameReached = true;

            if (this.skeletonCount < 5) {
                let runningSkeleton = new RunningSkeletonSmall(this.game);
                runningSkeleton.x = this.x + 60;
                runningSkeleton.y = this.y + 60;
                runningSkeleton.speedY = 10;
                if (this.x < this.game.width - 50) {
                    this.game.enemies.push(runningSkeleton);
                    this.game.audioHandler.enemySFX.playSound('throwingBombSound');
                    this.skeletonCount++;
                    if (this.skeletonCount >= 5) {
                        this.skeletonLimit = true;
                    }
                }
            }

        }

        if (this.frameX === 1) {
            this.maxFrameReached = false;
        }

        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }
        } else {
            this.frameTimer += deltaTime;
        }
    }
}

// Map 5 --------------------------------------------------------------------------------------------------------------------------------------
export class SpikeySnail extends MovingGroundEnemy {
    constructor(game) {
        super(game, 103, 74, 9, 'spikeySnail');
        this.xSpeed = Math.floor(Math.random() * 5) + 1;
        this.soundId = 'slimyWalkSound';
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class OneEyeFly extends FlyingEnemy {
    constructor(game) {
        super(game, 79.333333333333333333333333333333, 65, 14, 'oneEyeFly');
        this.playsOnce = true;
        this.darkLaserTimer = 2800;
    }
    throwDarkLaserAttack() {
        const playerCenterY = this.game.player.y + this.game.player.height / 2;
        const elyvorgCenterY = this.y + this.height / 2;
        const deltaY = playerCenterY - elyvorgCenterY;

        const angle = Math.atan2(deltaY, Math.abs(this.game.player.x - this.x));

        const verticalSpeed = Math.sin(angle) * 19;

        const arrow = new DarkLaser(
            this.game,
            this.x - 10,
            this.y + 15,
            verticalSpeed,
        );
        this.game.enemies.push(arrow);
    }
    update(deltaTime) {
        super.update(deltaTime);

        if (this.game.background.isRaining) {
            this.darkLaserTimer += deltaTime;
            if (!this.game.gameOver && this.x >= this.game.player.x) {
                if (this.darkLaserTimer >= 3000 && this.x + this.width < this.game.width) {
                    this.throwDarkLaserAttack();
                    this.game.audioHandler.enemySFX.playSound('staticSound', false, true);
                    this.darkLaserTimer = 0;
                }
            }
        }
        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('buzzingFly');
        }
    }
}

export class PurpleFly extends FlyingEnemy {
    constructor(game) {
        super(game, 83.333333333333333333333333333333, 65, 14, 'purpleFly');
        this.playsOnce = true;
        this.iceballTimer = 200;
    }

    throwIceBallAttack() {
        const playerCenterY = this.game.player.y + this.game.player.height / 2;
        const elyvorgCenterY = this.y + this.height / 2;
        const deltaY = playerCenterY - elyvorgCenterY;

        const angle = Math.atan2(deltaY, Math.abs(this.game.player.x - this.x));

        const verticalSpeed = Math.sin(angle) * 10;

        const fireball = new IceBall(
            this.game,
            this.x + 5,
            this.y + this.height / 2 + 10,
            verticalSpeed
        );
        this.game.enemies.push(fireball);
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('buzzingFly');
        }

        if (this.game.background.isRaining) {
            this.iceballTimer += deltaTime;
            if (!this.game.gameOver && this.x >= this.game.player.x) {
                if (this.iceballTimer >= 2000 && this.x + this.width < this.game.width) {
                    this.throwIceBallAttack();
                    this.game.audioHandler.enemySFX.playSound('iceballThrowSound', false, true);
                    this.iceballTimer = 0;
                }
            }
        }
    }
}

export class LazyMosquito extends FlyingEnemy {
    constructor(game) {
        super(game, 67.230769230769230769230769230769, 50, 12, 'lazyMosquito');
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);

        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('buzzingFly');
        }
    }
}

export class LeafSlug extends MovingGroundEnemy {
    constructor(game) {
        super(game, 89, 84, 2, 'leafSlug');
        this.fps = 12;
        this.frameInterval = 1000 / this.fps;
        this.xSpeed = Math.floor(Math.random() * 3) + 1;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class PowderFlower extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 132, 137, 3, 'powderFlower');
        this.lives = 2;
        this.fps = 15;
        this.frameInterval = 1000 / this.fps;
        this.yellowBeamTimer = 350;
    }
    throwYellowBeamAttack() {
        this.game.enemies.push(new YellowBeam(this.game, this.x + 38, this.y - 45));
    }
    update(deltaTime) {
        super.update(deltaTime);

        if (this.game.background.isRaining) {
            this.yellowBeamTimer += deltaTime;
            if (!this.game.gameOver) {
                if (this.yellowBeamTimer >= 350 && this.x + this.width / 2 < this.game.width) {
                    this.throwYellowBeamAttack();
                    this.game.audioHandler.enemySFX.playSound('yellowLaserBeamSound', false, true);
                    this.yellowBeamTimer = 0;
                }
            }
        }
    }
}

export class OrangeCyclop extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 57, 71, 2, 'orangeCyclop');
        this.fps = 10;
        this.frameInterval = 1000 / this.fps;
    }
}

export class Tauro extends MovingGroundEnemy {
    constructor(game) {
        super(game, 151, 132, 2, 'tauro');
        this.lives = 2;
        this.fps = 15;
        this.frameInterval = 1000 / this.fps;
        this.soundId = 'stomp';
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 8;
    }
}

export class BeeEnemy extends Bee {
    constructor(game) {
        super(game, 55.23, 57, 12, 'enemy_bee', 800, 3, 10, 20);
        this.soundId = 'beeBuzzing';
    }
}

export class AngryBeeEnemy extends Bee {
    constructor(game) {
        super(game, 55.23, 57, 12, 'angry_enemy_bee', 1100, 3, 14, 140);
        this.soundId = 'angryBeeBuzzing';
    }
}

export class ClimbingPurpleSpider extends ClimbingEnemy {
    constructor(game) {
        super(game, 161.33, 144, 59, 'spider_laser_attack_climbing');
        this.lives = 2;
        this.fps = 120;
        this.frameInterval = 1000 / this.fps;
        this.swingAngle = 0;
        this.swingSpeed = 0.002 + Math.random() * 0.006;
        this.swingAmplitude = 1 + Math.random() * 4;
        this.canAttack = true;
        this.laserBeamConfig = {
            width: 300,
            height: 28,
            maxFrame: 9,
            imageId: 'laser_beam',
            speedX: 30,
        };
    }
    throwLaserBeam() {
        const { x, y, height } = this;
        const { width, height: spitHeight, maxFrame, imageId } = this.laserBeamConfig;

        const laserBeam = new LaserBeam(
            this.game, x - 185, y + 25 + height / 2 - spitHeight / 2, width,
            spitHeight, maxFrame, imageId, this.laserBeamConfig.speedX
        );
        this.game.enemies.push(laserBeam);
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.swingAngle += this.swingSpeed * deltaTime;
        const swingOffsetX = Math.sin(this.swingAngle) * this.swingAmplitude;
        this.x += swingOffsetX;
        if (this.frameX === 27 && this.x <= this.game.width && this.canAttack === true) {
            this.throwLaserBeam();
            this.game.audioHandler.enemySFX.playSound('laserAttackAudio', false, true);
            this.canAttack = false;
        }
        if (this.frameX === 59) {
            this.canAttack = true;
        }
    }
    draw(context) {
        super.draw(context);
        context.beginPath();
        context.moveTo(this.x + this.width / 2, 0);
        context.lineTo(this.x + this.width / 2, this.y + 50);
        context.stroke();
    }
}

// Map 6 --------------------------------------------------------------------------------------------------------------------------------------
export class Cactus extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 71, 90, 0, 'singleCactus');
    }
}

export class RockPlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 91.555555555555555555555555555556, 100, 1, 'rockPlant');
        this.rockAttackConfig = {
            width: 37,
            height: 40,
            maxFrame: 0,
            imageId: 'rockProjectile',
            cooldown: 5000,
            speedX: 5,
        };
        this.lastRockAttackTime = 4999;
        this.soundId = 'teethChatteringSound';
    }

    throwRockProjectile() {
        const { x, y, height } = this;
        const { width, height: leafHeight, maxFrame, imageId } = this.rockAttackConfig;

        const rockProjectile = new RockProjectile(
            this.game, x, y + height / 2 - leafHeight / 2, width,
            leafHeight, maxFrame, imageId, this.rockAttackConfig.speedX,
            0.02 + Math.random() * (0.01 - 0.0002)
        );
        this.game.audioHandler.enemySFX.playSound('rockAttackSound');
        this.game.enemies.push(rockProjectile);

        const secondRockAttack = new RockProjectile(
            this.game, x, y + height / 2 - leafHeight / 2, width,
            leafHeight, maxFrame, imageId, this.rockAttackConfig.speedX * 1.5,
            0.02 + Math.random() * (0.01 - 0.0002)
        );
        this.game.enemies.push(secondRockAttack);

        this.lastRockAttackTime = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.lastRockAttackTime += deltaTime;
        if (this.lastRockAttackTime >= this.rockAttackConfig.cooldown && this.x < this.game.width - this.width) {
            this.throwRockProjectile();
        }
    }
}

export class LazyOneEyePlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 75, 89, 2, 'lazyOneEyePlant');
        this.fps = 6;
        this.frameInterval = 1000 / this.fps;
        this.canAttack = true;
    }
    throwPurpleLaserAttack() {
        const purpleLaser = new PurpleLaser(
            this.game,
            this.x - 40,
            this.y + 15,
        );
        this.game.enemies.push(purpleLaser);
    }
    update(deltaTime) {
        super.update(deltaTime);

        if (!this.game.gameOver && this.x >= this.game.player.x) {
            if (this.frameX === 1 && this.canAttack && this.x + this.width / 2 < this.game.width) {
                this.canAttack = false;
                this.throwPurpleLaserAttack();
                this.game.audioHandler.enemySFX.playSound('laserAttackAudio', false, true);
                this.darkLaserTimer = 0;
            }
        }
        if (this.frameX === 2) {
            this.canAttack = true;
        }
    }
}

export class RedOneEyeFly extends FlyingEnemy {
    constructor(game) {
        super(game, 57, 37, 4, 'redOneEyeFly');
    }
}

export class Turtle extends MovingGroundEnemy {
    constructor(game) {
        super(game, 177, 107, 5, 'turtle');
        this.lives = 2;
        this.fps = 5;
        this.frameInterval = 1000 / this.fps;
        this.xSpeed = Math.floor(Math.random() * 1) + 1;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class TheRock extends MovingGroundEnemy {
    constructor(game) {
        super(game, 132, 132, 11, 'theRock');
        this.state = "idle";

        this.playSmashOnce = true;
        this.fps = 25;
        this.frameInterval = 1000 / this.fps;
        this.lives = 2;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.state === "idle") {
            this.x -= 2;

            if (this.frameX === 0 || this.frameX === 7 && this.isOnScreen()) {
                this.game.audioHandler.enemySFX.playSound('theRockStomp');
            }
        }
        const playerDistance = Math.abs(this.game.player.x - this.x);
        if (playerDistance < 100 && this.playSmashOnce) {
            this.state = 'smash';
            this.frameX = 0;
            this.image = document.getElementById('theRockSmash');
            this.width = 182;
            this.height = 162;
            this.maxFrame = 6;
            this.y = this.game.height - this.height - this.game.groundMargin;
            this.x = this.x - 70;
            this.fps = 11;
            this.frameInterval = 1000 / this.fps;
            this.playSmashOnce = false;
        }

        if (this.state === 'smash' && this.frameX === this.maxFrame) {
            this.state = "idle"
            this.frameX = 0;
            this.image = document.getElementById('theRock');
            this.width = 132;
            this.height = 132;
            this.maxFrame = 11;
            this.x = this.x + 70;
            this.y = this.game.height - this.height - this.game.groundMargin;
            this.fps = 25;
            this.frameInterval = 1000 / this.fps;
        }
    }
}

export class VolcanoWasp extends Bee {
    constructor(game) {
        super(game, 113, 125, 1, 'volcanoWasp', 1100, 3, 14, 140);
        this.soundId = 'angryBeeBuzzing';
    }
}

export class RedHedgehog extends MovingGroundEnemy {
    constructor(game) {
        super(game, 125, 85, 2, 'redHedgehogNormal');
        this.state = "idle";
        this.fps = 3;
        this.frameInterval = 1000 / this.fps;
        this.image = document.getElementById('redHedgehogNormal');
        this.playOnce = true;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.state === 'idle') {
            this.x -= 1;
        } else {
            this.x -= 10;
        }

        const playerDistance = Math.abs(this.game.player.x - this.x);
        if (playerDistance < 1100) {
            this.state = 'roll';
            this.image = document.getElementById('redHedgehogRolling');
            this.width = 97;
            this.height = 92;
            this.y = this.game.height - this.height - this.game.groundMargin;
        }

        if (this.state === "roll") {
            this.fps = 15;
            this.frameInterval = 1000 / this.fps;
            if (this.playOnce) {
                this.playOnce = false;
                this.game.audioHandler.enemySFX.playSound('hedgehogRollingSound', false, true);
            }
            if (this.frameX === 10) {
                this.frameX = 9;
            }
        }

        if (this.x + this.width < 0 || this.lives <= 0) {
            this.game.audioHandler.enemySFX.stopSound('hedgehogRollingSound');
        }
    }
}

export class Dragon extends FlyingEnemy {
    constructor(game) {
        super(game, 182, 172, 11, 'dragon');
        this.lives = 2;
        this.fps = 14;
        this.frameInterval = 1000 / this.fps;
        this.canAttack = true;
        this.windAttackConfig = {
            width: 105,
            height: 120,
            maxFrame: 5,
            imageId: 'windAttack',
            speedX: 4,
            fps: 20,
            offsetX: 0,
            offsetY: 0,
        };
    }
    throwWindAttack() {
        const windAttack = new WindAttack(
            this.game,
            this.x + this.windAttackConfig.offsetX + 50,
            this.y + this.windAttackConfig.offsetY + 20,
            this.windAttackConfig.width,
            this.windAttackConfig.height,
            this.windAttackConfig.maxFrame,
            this.windAttackConfig.imageId,
            this.windAttackConfig.speedX,
            this.game.player
        );
        this.game.enemies.push(windAttack);
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);

        if (playerDistance <= 1600 && this.frameX == 7 && this.canAttack === true) {
            this.canAttack = false;
            if (!this.game.gameOver) {
                this.throwWindAttack();
                this.game.audioHandler.enemySFX.playSound('windAttackAudio', false, true);
            }
        }
        if (this.frameX === 10) {
            this.canAttack = true;
        }
        if (this.frameX === 0 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('ravenSingleFlap');
            this.game.audioHandler.enemySFX.playSound('orangeMonsterFlap');
        }
    }
}
