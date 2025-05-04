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
        this.isStunEnemy = false;
        this.isRedEnemy = false;
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
        if (this.isStunEnemy) {
            context.shadowColor = 'yellow';
            context.shadowBlur = 10;
        } else if (this.isRedEnemy) {
            context.shadowColor = 'red';
            context.shadowBlur = 10;
        }
        context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);

        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
    }

}
// Types of enemies ---------------------------------------------------------------------------------------------------------------------------
export class FlyingEnemy extends Enemy {
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

export class VerticalEnemy extends Enemy {
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
}

export class UnderwaterEnemy extends Enemy {
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

export class BeeInstances extends FlyingEnemy {
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
        this.isStunEnemy = true;
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

        context.shadowColor = 'blue';
        context.shadowBlur = 10;

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
        context.shadowColor = 'yellow';
        context.shadowBlur = 10;
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
export class Dotter extends FlyingEnemy {
    constructor(game) {
        super(game, 60, 44, 5, 'dotter');
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

export class Vertibat extends VerticalEnemy {
    constructor(game) {
        super(game, 151.16666666, 90, 5, 'vertibat');
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

export class Ghobat extends FlyingEnemy {
    constructor(game) {
        super(game, 134.33, 84, 5, 'ghobat');
    }
    update(deltaTime) {
        super.update(deltaTime);

        if (this.frameX === 3 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('batFlapAudio');
        }
    }
}

export class Ravengloom extends FlyingEnemy {
    constructor(game) {
        super(game, 139.66, 100, 5, 'ravengloom');
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

export class MeatSoldier extends MovingGroundEnemy {
    constructor(game) {
        super(game, 67.625, 80, 15, 'meatSoldier');
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        this.xSpeed = Math.floor(Math.random() * 2) + 1;
        this.playSoundOnce = true;

    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.playSoundOnce) {
            this.playSoundOnce = false;
            this.game.audioHandler.enemySFX.playSound('meatSoldierSound');
        }
        this.x -= this.xSpeed;
    }
}

export class Skulnap extends MovingGroundEnemy {
    constructor(game, scale = 1) {
        super(game, 104.23076923076923076923076923077 * scale, 70 * scale, 12, 'skulnapAwake');
        this.isStunEnemy = true;
        this.y = this.game.height - this.height - this.game.groundMargin + 15;
        this.state = 'sleeping';
        this.scale = scale;
        this.sleepingAnimation = new GroundEnemy(game, 57 * scale, 57 * scale, 10, 'skulnapSleep');
        this.sleepingAnimation.frameX = 0;
        this.sleepingAnimation.frameY = 0;
        this.soundId;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.y >= this.game.height - this.height - this.game.groundMargin + 15) {
            this.y = this.game.height - this.height - this.game.groundMargin + 15;
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
            this.y = this.game.height - this.height - this.game.groundMargin + 5;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
            } else {
                this.frameTimer += deltaTime;
            }
        } else {
            this.sleepingAnimation.x = this.x + 13;
            this.sleepingAnimation.y = this.y;
            this.sleepingAnimation.update(deltaTime);
        }
    }

    draw(context) {
        const drawImageWithScale = (image, frameX, x, y, width, height, scale) => {
            context.save();
            context.translate(x, y);
            context.scale(scale, scale);
            context.translate(-x, -y);
            context.shadowColor = 'yellow';
            context.shadowBlur = 10;
            context.drawImage(image, frameX * (width / scale), 0, width / scale, height / scale, x, y, width, height);
            context.restore();
        };

        if (this.state === 'running') {
            drawImageWithScale(this.image, this.frameX, this.x, this.y, this.width, this.height, this.scale);
        } else {
            drawImageWithScale(this.sleepingAnimation.image, this.sleepingAnimation.frameX, this.sleepingAnimation.x, this.sleepingAnimation.y, this.sleepingAnimation.width, this.sleepingAnimation.height, this.scale);
        }
    }
}

export class Abyssaw extends FlyingEnemy {
    constructor(game) {
        super(game, 100.44, 100, 8, 'abyssaw');
        this.soundId = 'spinningChainsaw';
        this.radius = Math.random() * 2 + 6;
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.x -= Math.cos(this.angle) * this.radius;
        this.y += Math.sin(this.angle) * this.radius;

        if (this.x + this.width < 0 || this.lives <= 0) {
            this.game.audioHandler.enemySFX.stopSound('spinningChainsaw');
        }
    }
}

export class GlidoSpike extends FlyingEnemy {
    constructor(game) {
        super(game, 191.68, 130, 24, 'glidoSpikeFly');
        this.walkFps = 120;
        this.attackFps = 120;
        this.frameInterval = 1000 / this.walkFps;
        this.state = 'walk';
        this.attackAnimation = new FlyingEnemy(game, 191.68, 130, 24, 'glidoSpikeAttack');
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
            this.game.audioHandler.enemySFX.playSound('flyMonsterFlap');
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
export class DuskPlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 60, 87, 1, 'duskPlant');
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

export class Silknoir extends ClimbingEnemy {
    constructor(game) {
        super(game, 120, 144, 5, 'silknoir');
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

export class WalterTheGhost extends FlyingEnemy {
    constructor(game) {
        super(game, 104.83, 84, 5, 'walterTheGhost');
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

export class Ben extends VerticalEnemy {
    constructor(game) {
        super(game, 61.5, 50, 5, 'ben');
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
        this.isStunEnemy = true;
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
export class Dolly extends FlyingEnemy {
    constructor(game) {
        super(game, 88.2, 120, 29, 'dolly');
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
        this.isRedEnemy = true;
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

export class Voltzeel extends FallingEnemy {
    constructor(game) {
        super(game, 107, 87, 4, 'voltzeel');
        this.isStunEnemy = true;
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

export class Garry extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 165, 122, 3, 'garry');
    }
}

// Map 4 --------------------------------------------------------------------------------------------------------------------------------------
export class BigGreener extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 113, 150, 1, 'bigGreener');
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

export class Chiquita extends FlyingEnemy {
    constructor(game) {
        super(game, 118.82352941176470588235294117647, 85, 16, 'chiquita');
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

export class Sluggie extends MovingGroundEnemy {
    constructor(game) {
        super(game, 147.33, 110, 5, 'sluggie');
        this.xSpeed = Math.floor(Math.random() * 5) + 1;
        this.soundId = 'slimyWalkSound';
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class LilHornet extends FlyingEnemy {
    constructor(game) {
        super(game, 56, 47, 1, 'lilHornet');
        this.isStunEnemy = true;
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
        super(game, 152.75, 110, 3, 'karateCrocoIdle');
        this.isRedEnemy = true;
        this.state = "idle";
        this.lives = 2;
        this.flyKickAnimation = new MovingGroundEnemy(game, 153, 110, 2, 'karateCrocoFlyKick');
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
            context.save();
            context.shadowColor = 'red';
            context.shadowBlur = 10;
            this.flyKickAnimation.x = this.x;
            this.flyKickAnimation.y = this.y;
            this.flyKickAnimation.draw(context);
            context.restore();
        }
    }
}

export class Zabkous extends MovingGroundEnemy {
    constructor(game) {
        super(game, 316, 202, 16, 'zabkousJump');
        this.image = document.getElementById('zabkousJump');
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
                this.image = document.getElementById('zabkousJump');
                this.width = 316;
                this.height = 202;
                this.frameX = 0;
                this.y = this.game.height - this.height - this.game.groundMargin;
                this.jumpedBeforeDistanceLogic = false;
            } else if (playerDistance <= 1500) {
                this.state = 'attack';
                this.image = document.getElementById('zabkousAttack');
                this.width = 177;
                this.height = 132;
                this.frameX = 0;
                this.x = this.x + 45;
                this.y = this.game.height - this.height - this.game.groundMargin;
                this.poisonSpitThrown = false;
            } else {
                this.state = 'run';
                this.image = document.getElementById('zabkousJump');
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
            this.image = document.getElementById('zabkousJump');
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

export class SpidoLazer extends MovingGroundEnemy {
    constructor(game) {
        super(game, 161.33, 144, 18, 'spidoLazerWalk');
        this.lives = 2;
        this.walkFps = 60;
        this.attackFps = 120;
        this.frameInterval = 1000 / this.walkFps;
        this.state = 'walk';
        this.attackAnimation = new MovingGroundEnemy(game, 161.33, 144, 59, 'spidoLazerAttack');
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
            this.game.audioHandler.enemySFX.playSound('spidoLazerWalking');
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

export class Jerry extends FlyingEnemy {
    constructor(game) {
        super(game, 185, 103, 4, 'jerry');
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
                let skulnap = new Skulnap(this.game, 0.89);
                skulnap.x = this.x + 60;
                skulnap.y = this.y + 60;
                skulnap.speedY = 10;
                if (this.x < this.game.width - 50) {
                    this.game.enemies.push(skulnap);
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
export class Snailey extends MovingGroundEnemy {
    constructor(game) {
        super(game, 103, 74, 9, 'snailey');
        this.xSpeed = Math.floor(Math.random() * 5) + 1;
        this.soundId = 'slimyWalkSound';
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class RedFlyer extends FlyingEnemy {
    constructor(game) {
        super(game, 79.333333333333333333333333333333, 65, 14, 'redFlyer');
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

export class PurpleFlyer extends FlyingEnemy {
    constructor(game) {
        super(game, 83.333333333333333333333333333333, 65, 14, 'purpleFlyer');
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

export class Sunflora extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 132, 137, 3, 'sunflora');
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

export class Cyclorange extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 57, 71, 2, 'cyclorange');
        this.fps = 10;
        this.frameInterval = 1000 / this.fps;
    }
}

export class Tauro extends MovingGroundEnemy {
    constructor(game) {
        super(game, 151, 132, 2, 'tauro');
        this.isRedEnemy = true;
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

export class Bee extends BeeInstances {
    constructor(game) {
        super(game, 55.23, 57, 12, 'bee', 800, 3, 10, 20);
        this.soundId = 'beeBuzzing';
    }
}

export class AngryBee extends BeeInstances {
    constructor(game) {
        super(game, 55.23, 57, 12, 'angryBee', 1100, 3, 12, 140);
        this.soundId = 'angryBeeBuzzing';
    }
}

export class HangingSpidoLazer extends ClimbingEnemy {
    constructor(game) {
        super(game, 161.33, 144, 59, 'hangingSpidoLazer');
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
        super(game, 71, 90, 0, 'cactus');
        this.isStunEnemy = true;
    }
}

export class PetroPlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 91.555555555555555555555555555556, 100, 1, 'petroPlant');
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

export class Plazer extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 75, 89, 2, 'plazer');
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

export class Veynoculus extends FlyingEnemy {
    constructor(game) {
        super(game, 57, 37, 4, 'veynoculus');
    }
}

export class Volcanurtle extends MovingGroundEnemy {
    constructor(game) {
        super(game, 177, 107, 5, 'volcanurtle');
        this.isRedEnemy = true;
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
        this.isRedEnemy = true;
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

export class VolcanoWasp extends BeeInstances {
    constructor(game) {
        super(game, 113, 125, 1, 'volcanoWasp', 1100, 3, 12, 140);
        this.soundId = 'angryBeeBuzzing';
    }
}

export class Rollhog extends MovingGroundEnemy {
    constructor(game) {
        super(game, 125, 85, 2, 'rollhogWalk');
        this.lives = 2;
        this.state = "idle";
        this.fps = 3;
        this.frameInterval = 1000 / this.fps;
        this.image = document.getElementById('rollhogWalk');
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
            this.image = document.getElementById('rollhogRoll');
            this.width = 97;
            this.height = 92;
            this.y = this.game.height - this.height - this.game.groundMargin;
        }

        if (this.state === "roll") {
            this.fps = 15;
            this.frameInterval = 1000 / this.fps;
            if (this.playOnce) {
                this.playOnce = false;
                this.game.audioHandler.enemySFX.playSound('rollhogRollSound', false, true);
            }
            if (this.frameX === 10) {
                this.frameX = 9;
            }
        }

        if (this.x + this.width < 0 || this.lives <= 0) {
            this.game.audioHandler.enemySFX.stopSound('rollhogRollSound');
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
            this.game.audioHandler.enemySFX.playSound('flyMonsterFlap');
        }
    }
}
