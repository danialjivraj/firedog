import { BackgroundEffect } from './backgroundEffect.js';

export class SmallFish extends BackgroundEffect {
    constructor(game, maxBackgroundEntities) {
        super(game, maxBackgroundEntities);
        this.backgroundEntities = [];
        this.fishImages = [
            document.getElementById('fish'),
            document.getElementById('fish2'),
            document.getElementById('fish3'),
            document.getElementById('fish4'),
            document.getElementById('fish5'),
            document.getElementById('fish6'),
            document.getElementById('fish7'),
            document.getElementById('fish8'),
            document.getElementById('fish9'),
            document.getElementById('fish10'),
            document.getElementById('fish11'),
            document.getElementById('jellyfish'),
        ];
        this.createEntityAnimation();
    }

    createEntityAnimation() {
        for (let i = 0; i < this.maxBackgroundEntities; i++) {
            const angle = Math.random() * (Math.PI / 6);
            const directionX = Math.cos(angle);
            const directionY = Math.sin(angle);

            const randomFishIndex = Math.floor(Math.random() * this.fishImages.length);
            const fishImage = this.fishImages[randomFishIndex];

            const initialDirY = Math.random() > 0.5 ? directionY : -directionY;
            const fish = {
                fishImage: fishImage,
                x: Math.random() * this.game.width,
                y: Math.random() * this.game.height,
                speed: Math.random() * 0.15 + 0.01,
                opacity: 1,
                directionX: Math.random() > 0.5 ? directionX : -directionX,
                directionY: initialDirY,
                targetDirY: initialDirY,
                directionChangeTimer: 0,
                directionChangeInterval: Math.random() * 1200 + 800,
            };
            this.backgroundEntities.push(fish);
        }
    }

    update(deltaTime) {
        for (let i = 0; i < this.backgroundEntities.length; i++) {
            const entity = this.backgroundEntities[i];

            entity.y += entity.speed * entity.directionY * deltaTime;

            entity.directionChangeTimer += deltaTime;
            if (entity.directionChangeTimer >= entity.directionChangeInterval) {
                entity.directionChangeTimer = 0;
                entity.directionChangeInterval = Math.random() * 1200 + 800;
                const adjustment = (Math.random() - 0.5) * 0.5;
                entity.targetDirY = Math.max(-0.38, Math.min(0.38, entity.directionY + adjustment));
            }

            const diff = entity.targetDirY - entity.directionY;
            entity.directionY += diff * 0.0025 * deltaTime;
            const sign = entity.directionX >= 0 ? 1 : -1;
            entity.directionX = sign * Math.sqrt(Math.max(0, 1 - entity.directionY * entity.directionY));

            if ((!this.game.cabin.isFullyVisible)) {
                if (entity.directionX > 0 && this.game.player.isUnderwater) {
                    entity.x += entity.speed * entity.directionX * deltaTime;
                } else {
                    const baseSpeed = entity.speed * entity.directionX * deltaTime;
                    const playerSpeed = this.game.speed / 50 * deltaTime;
                    entity.x += baseSpeed - playerSpeed;
                }
            } else {
                entity.x += entity.speed * entity.directionX * deltaTime;
            }

            if (entity.x < 0 || entity.x > this.game.width || entity.y < 0 || entity.y > this.game.height - 119) {
                this.backgroundEntities.splice(i, 1);
                this.spawnNewFish();
                i--;
            } else {
                entity.opacity = 1 - Math.abs((entity.y - 570 / 2) / (570 / 2));
                entity.opacity = Math.max(0, Math.min(1, entity.opacity));

                const edgeFadeDistance = 20;
                const distanceToLeftEdge = entity.x;
                const distanceToRightEdge = this.game.width - entity.x;
                const edgeOpacity = Math.min(1, Math.min(distanceToLeftEdge, distanceToRightEdge) / edgeFadeDistance);
                entity.opacity *= edgeOpacity;
            }
        }
    }

    spawnNewFish() {
        const angle = Math.random() * (Math.PI / 6);
        const directionX = Math.random() > 0.5 ? -Math.cos(angle) : Math.cos(angle);
        const directionY = Math.sin(angle);

        const randomFishIndex = Math.floor(Math.random() * this.fishImages.length);
        const fishImage = this.fishImages[randomFishIndex];

        const spawnX = directionX > 0 ? -Math.random() * this.game.width * 0.5 : this.game.width + Math.random() * this.game.width * 0.5;
        const newFish = {
            fishImage: fishImage,
            x: spawnX,
            y: Math.random() * (this.game.height - 119),
            speed: Math.random() * 0.15 + 0.01,
            opacity: 1,
            directionX: directionX,
            directionY: Math.random() > 0.5 ? directionY : -directionY,
            targetDirY: Math.random() > 0.5 ? directionY : -directionY,
            directionChangeTimer: 0,
            directionChangeInterval: Math.random() * 1200 + 800,
        };
        this.backgroundEntities.push(newFish);
    }

    draw(context) {
        for (let i = 0; i < this.backgroundEntities.length; i++) {
            const fish = this.backgroundEntities[i];

            context.globalAlpha = fish.opacity;
            context.save();

            const rotationAngle = Math.atan2(fish.directionY, fish.directionX);

            context.translate(fish.x, fish.y);
            context.rotate(rotationAngle);

            if (fish.directionX < 0) {
                context.scale(1, -1);
            }

            context.drawImage(fish.fishImage, -fish.fishImage.width / 2, -fish.fishImage.height / 2);

            context.restore();
        }
        context.globalAlpha = 1;
    }
}

export class BigFish extends BackgroundEffect {
    constructor(game, maxBackgroundEntities) {
        super(game, maxBackgroundEntities);
        this.backgroundEntities = [];
        this.fishImages = [
            document.getElementById('shark'),
            document.getElementById('whale'),
        ];
        this.spawnTimer = 0;
        this.spawnInterval = 120000;
    }

    update(deltaTime) {
        const edgeFadeDistance = 100;

        if (this.backgroundEntities.length === 0) {
            this.spawnTimer += deltaTime;
        }

        if (this.spawnTimer >= this.spawnInterval && this.backgroundEntities.length === 0) {
            this.spawnTimer = 0;

            if (Math.random() < 0.2) {
                this.spawnNewFish();
            }
        }

        for (let i = this.backgroundEntities.length - 1; i >= 0; i--) {
            const entity = this.backgroundEntities[i];

            entity.y += entity.speed * entity.directionY * deltaTime;
            entity.x += entity.speed * entity.directionX * deltaTime;

            const distanceToLeftEdge = entity.x + entity.width / 2;
            const distanceToRightEdge = this.game.width - (entity.x - entity.width / 2);
            const distanceToTopEdge = entity.y + entity.height / 2;
            const distanceToBottomEdge = this.game.height - (entity.y - entity.height / 2);

            const edgeOpacityX = Math.min(1, Math.min(distanceToLeftEdge, distanceToRightEdge) / edgeFadeDistance);
            const edgeOpacityY = Math.min(1, Math.min(distanceToTopEdge, distanceToBottomEdge) / edgeFadeDistance);

            entity.opacity = 0.6 * Math.min(edgeOpacityX, edgeOpacityY);

            if (entity.x < -entity.width / 2 || entity.x > this.game.width + entity.width / 2 || entity.y < -entity.height / 2 || entity.y > this.game.height + entity.height / 2) {
                this.backgroundEntities.splice(i, 1);
                this.spawnTimer = 0;
            }
        }
    }

    spawnNewFish() {
        const angle = Math.random() * (Math.PI / 6);
        const directionX = Math.random() > 0.5 ? -Math.cos(angle) : Math.cos(angle);
        const directionY = Math.sin(angle);

        const randomFishIndex = Math.floor(Math.random() * this.fishImages.length);
        const fishImage = this.fishImages[randomFishIndex];

        const spawnX = directionX > 0 ? -fishImage.width / 2 : this.game.width + fishImage.width / 2;
        const spawnY = Math.random() * (this.game.height - fishImage.height) + fishImage.height / 2;

        const newFish = {
            fishImage: fishImage,
            width: fishImage.width,
            height: fishImage.height,
            x: spawnX,
            y: spawnY,
            speed: Math.random() * 0.15 + 0.02,
            opacity: 0.6,
            directionX: directionX,
            directionY: Math.random() > 0.5 ? directionY : -directionY,
        };
        this.backgroundEntities.push(newFish);
    }

    draw(context) {
        for (let i = 0; i < this.backgroundEntities.length; i++) {
            const fish = this.backgroundEntities[i];

            context.globalAlpha = fish.opacity;
            context.save();

            const rotationAngle = Math.atan2(fish.directionY, fish.directionX);

            context.translate(fish.x, fish.y);
            context.rotate(rotationAngle);

            if (fish.directionX < 0) {
                context.scale(1, -1);
            }

            context.drawImage(fish.fishImage, -fish.fishImage.width / 2, -fish.fishImage.height / 2);

            context.restore();
        }
        context.globalAlpha = 1;
    }
}
