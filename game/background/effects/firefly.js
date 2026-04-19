import { BackgroundEffect } from './backgroundEffect.js';

export class Firefly extends BackgroundEffect {
    constructor(game, maxBackgroundEntities) {
        super(game, maxBackgroundEntities);
        this.backgroundEntities = [];
        this.createEntityAnimation();
    }

    createEntityAnimation() {
        for (let i = 0; i < this.maxBackgroundEntities; i++) {
            const angle = Math.random() * (Math.PI / 6);
            const directionX = Math.cos(angle);
            const directionY = Math.sin(angle);

            const firefly = {
                x: Math.random() * this.game.width,
                y: Math.random() * this.game.height,
                radius: 2,
                speed: Math.random() * 0.15 + 0.01,
                opacity: 1,
                directionX: Math.random() > 0.5 ? directionX : -directionX,
                directionY: Math.random() > 0.5 ? directionY : -directionY,
            };
            this.backgroundEntities.push(firefly);
        }
    }

    update(deltaTime) {
        for (let i = 0; i < this.backgroundEntities.length; i++) {
            const entity = this.backgroundEntities[i];

            entity.y += entity.speed * entity.directionY * deltaTime;

            if ((!this.game.cabin.isFullyVisible)) {
                const baseSpeed = entity.speed * entity.directionX * deltaTime;
                const playerSpeed = this.game.speed / 20 * deltaTime;
                entity.x += baseSpeed - playerSpeed;
            } else {
                entity.x += entity.speed * entity.directionX * deltaTime;
            }

            if (entity.x < 0 || entity.x > this.game.width || entity.y < 0 || entity.y > this.game.height - 119) {
                this.backgroundEntities.splice(i, 1);
                this.spawnNewFirefly();
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

    spawnNewFirefly() {
        const angle = Math.random() * (Math.PI / 6);
        const directionX = Math.cos(angle);
        const directionY = Math.sin(angle);

        const spawnX = Math.random() > 0.5 ? -Math.random() * this.game.width * 0.5 : this.game.width + Math.random() * this.game.width * 0.5;
        const firefly = {
            x: spawnX,
            y: Math.random() * (this.game.height - 119),
            radius: 2,
            speed: Math.random() * 0.15 + 0.01,
            opacity: 1,
            directionX: Math.random() > 0.5 ? directionX : -directionX,
            directionY: Math.random() > 0.5 ? directionY : -directionY,
        };
        this.backgroundEntities.push(firefly);
    }

    draw(context) {
        context.fillStyle = '#ecc45e';
        for (let i = 0; i < this.backgroundEntities.length; i++) {
            const firefly = this.backgroundEntities[i];
            context.globalAlpha = firefly.opacity;
            context.beginPath();
            context.arc(firefly.x, firefly.y, firefly.radius, 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;
    }
}
