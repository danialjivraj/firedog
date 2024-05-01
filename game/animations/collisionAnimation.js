import { RunningSkeleton, RunningSkeletonSmall } from "../entities/enemies/enemies.js";
import { FloatingMessage } from "./floatingMessages.js";

export class Collision {
    constructor(game, x, y, imageId, spriteWidth, spriteHeight, maxFrame, fps) {
        this.game = game;
        this.image = document.getElementById(imageId);
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.width = this.spriteWidth;
        this.height = this.spriteHeight;
        this.x = x - this.width * 0.5;
        this.y = y - this.height * 0.5;
        this.frameX = 0;
        this.maxFrame = maxFrame;
        this.markedForDeletion = false;
        this.fps = fps;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.frameX * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }

    update(deltaTime) {
        this.x -= this.game.speed;
        if (this.frameTimer > this.frameInterval) {
            this.frameX++;
            this.frameTimer = 0;
        } else {
            this.frameTimer += deltaTime;
        }
        if (this.frameX > this.maxFrame) {
            this.markedForDeletion = true;
        }
    }
}

export class CollisionAnimation extends Collision {
    constructor(game, x, y, isBluePotionActive) {
        const animationType = isBluePotionActive ? 'blueCollisionAnimation' : 'collisionAnimation';
        const { width, height, maxFrame, fps } = animationType === 'blueCollisionAnimation'
            ? { width: 113.857, height: 110, maxFrame: 6, fps: 25 }
            : { width: 100, height: 90, maxFrame: 4, fps: Math.random() * 10 + 5 };

        super(game, x, y, animationType, width, height, maxFrame, fps);
    }
}

export class ExplosionCollisionAnimation extends Collision {
    constructor(game, x, y, enemyId) {
        const adjustedY = y - 50;
        let fps = Math.random() * (40 - 25) + 25;
        super(game, x, adjustedY, 'explosionCollisionAnimation', 300.09523809523809523809523809524, 260, 20, fps);
        this.enemyId = enemyId;
        this.processed = false;
    }

    update(deltaTime) {
        // checks collision with enemies
        this.game.enemies.forEach(enemy => {
            if (
                enemy.x < this.x + this.width &&
                enemy.x + enemy.width > this.x &&
                enemy.y < this.y + this.height &&
                enemy.y + enemy.height > this.y && !this.game.gameOver
            ) {
                enemy.markedForDeletion = true;
                if (!(enemy instanceof RunningSkeleton || enemy instanceof RunningSkeletonSmall)) {
                    this.game.audioHandler.explosionSFX.playSound('poofSound', false, true);
                    this.game.collisions.push(new CollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                    this.game.floatingMessages.push(new FloatingMessage('+1', enemy.x, enemy.y, 150, 50, 20));
                    this.game.coins++;
                } else if (enemy instanceof RunningSkeleton && enemy.id !== this.enemyId) {
                    this.game.collisions.push(new ExplosionCollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, this.enemyId));
                    this.game.audioHandler.enemySFX.stopSound('skeletonRattlingSound');
                    this.game.audioHandler.explosionSFX.playSound('explosionCollision', false, true);
                } else if (enemy instanceof RunningSkeletonSmall && enemy.id !== this.enemyId) {
                    this.game.collisions.push(new ExplosionCollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, this.enemyId));
                    this.game.audioHandler.enemySFX.stopSound('skeletonRattlingSound');
                    this.game.audioHandler.explosionSFX.playSound('explosionCollision', false, true);
                }
            }
        });

        // checks collision with power-ups
        this.game.powerUps.forEach(powerUp => {
            if (
                powerUp.x < this.x + this.width &&
                powerUp.x + powerUp.width > this.x &&
                powerUp.y < this.y + this.height &&
                powerUp.y + powerUp.height > this.y && !this.game.gameOver
            ) {
                powerUp.markedForDeletion = true;
                this.game.audioHandler.explosionSFX.playSound('poofSound', false, true);
                this.game.collisions.push(new CollisionAnimation(
                    this.game, powerUp.x + powerUp.width * 0.5, powerUp.y + powerUp.height * 0.5));
            }
        });
        // checks collision with power-down
        this.game.powerDowns.forEach(powerDown => {
            if (
                powerDown.x < this.x + this.width &&
                powerDown.x + powerDown.width > this.x &&
                powerDown.y < this.y + this.height &&
                powerDown.y + powerDown.height > this.y && !this.game.gameOver
            ) {
                powerDown.markedForDeletion = true;
                this.game.audioHandler.explosionSFX.playSound('poofSound', false, true);
                this.game.collisions.push(new CollisionAnimation(this.game, powerDown.x + powerDown.width * 0.5, powerDown.y + powerDown.height * 0.5));
            }
        });
        super.update(deltaTime);
    }
}

export class MeteorExplosionCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'meteorExplosion', 382, 332, 5, 23);
    }
}

export class ElectricityCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'electricityCollision', 215.25, 200, 7, 20);
    }

    updatePosition(enemy) {
        this.x = enemy.x + enemy.width * 0.5 - this.width * 0.5;
        this.y = enemy.y + enemy.height * 0.5 - this.height * 0.5;
    }
    updatePositionWhereCollisionHappened(x, y) {
        this.x = x;
        this.y = y;
    }
}

export class DarkExplosion extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'darkExplosion', 300.09523809523809523809523809524, 279, 20, 50);
    }
}

export class RedFireballExplosion extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'redFireballCollision', 300.09523809523809523809523809524, 280, 20, 50);
    }
}

export class PurpleFireballExplosion extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'purpleFireballCollision', 300.09523809523809523809523809524, 280, 20, 50);
    }
}

export class PoisonSpitSplash extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'poisonSpitSplash', 43, 73, 10, 80);
    }
}

export class PoisonDropCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'poisonDropCollision', 112, 102, 5, 30);
    }
}

export class PoisonDropGroundCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'poisonDropGroundCollision', 50, 50, 6, 30);
    }
}

export class InkSplashCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'blackInk', 278, 394, 6, 20);
    }
}

export class InkBombCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'inkBombCollision', 212, 212, 7, 20);
    }
}

export class Blood extends Collision {
    constructor(game, x, y, enemy) {
        super(game, x, y, 'blood', 70.571428571428571428571428571429, 100, 6, 20);
        this.enemy = enemy;
    }

    updatePosition(enemy) {
        this.x = enemy.x + enemy.width * 0.5 - this.width * 0.5;
        this.y = enemy.y + enemy.height * 0.5 - this.height * 0.5;
    }
}
