import { normalizeDelta } from '../../config/constants.js';
import { BackgroundEffect } from './backgroundEffect.js';

export class StarField extends BackgroundEffect {
    constructor(game, options = {}) {
        super(game, 0);
        this.game = game;
        this.stars = [];

        this.layers = [
            { speed: 0.012, scale: 0.2, count: 320 },
            { speed: 0.024, scale: 0.5, count: 50 },
            { speed: 0.04, scale: 0.75, count: 30 },
        ];

        this.starBaseRadius = 2;
        this.starsAngleDeg = 145;
        this.starsAngleRad = this.degreesToRads(this.starsAngleDeg);

        const {
            top = 0,
            height = game.height,
            density = 1,
            color = "rgb(255, 221, 157)",
            sizeScale = 1
        } = options;

        this.top = top;
        this.height = height;
        this.density = density;
        this.color = color;
        this.sizeScale = sizeScale;

        this.initStars();
    }

    degreesToRads(deg) {
        return (deg * Math.PI) / 180;
    }

    initStars() {
        const width = this.game.width;
        const top = this.top;
        const height = this.height;

        for (let j = 0; j < this.layers.length; j++) {
            const layer = this.layers[j];

            const count = Math.floor(layer.count * this.density);

            for (let i = 0; i < count; i++) {
                const x = Math.random() * width;
                const y = top + Math.random() * height;

                const speed = layer.speed;
                const vx = Math.cos(this.starsAngleRad) * speed;
                const vy = Math.sin(this.starsAngleRad) * speed;

                this.stars.push({
                    x,
                    y,
                    vx,
                    vy,
                    radius: this.starBaseRadius * layer.scale * this.sizeScale
                });
            }
        }
    }

    update(deltaTime) {
        const width = this.game.width;
        const dt = normalizeDelta(deltaTime);

        const top = this.top;
        const bottom = this.top + this.height;

        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];

            s.x += s.vx * dt;
            s.y += s.vy * dt;

            s.x = ((s.x % width) + width) % width;

            if (s.y < top) s.y += this.height;
            if (s.y > bottom) s.y -= this.height;
        }
    }

    draw(context) {
        context.save();
        context.fillStyle = this.color;

        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            context.beginPath();
            context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            context.fill();
        }

        context.restore();
    }
}

export class ShootingStar extends BackgroundEffect {
    constructor(game, maxBackgroundEntities = 4) {
        super(game, maxBackgroundEntities);

        this.game = game;
        this.shootingStars = [];

        this.starsAngleDeg = 145;
        this.starsAngleRad = this.degreesToRads(this.starsAngleDeg);
        this.starsAngleRadFlipped = this.degreesToRads(180 - this.starsAngleDeg);

        this.shootingStarSpeed = {
            min: 12,
            max: 16,
        };

        this.shootingStarOpacityDelta = 0.008;
        this.trailLengthDelta = 0.008;

        this.shootingStarEmittingInterval = 5000;
        this.shootingStarLifeTime = 500;
        this.maxTrailLength = 300;
        this.shootingStarRadius = 3;

        this.spawnTimer = 0;

        this.createShootingStar();
    }

    degreesToRads(deg) {
        return (deg / 180) * Math.PI;
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    lineToAngle(x1, y1, length, radians) {
        const x2 = x1 + length * Math.cos(radians);
        const y2 = y1 + length * Math.sin(radians);
        return { x: x2, y: y2 };
    }

    createShootingStar() {
        if (this.shootingStars.length >= this.maxBackgroundEntities) return;

        const width = this.game.width;
        const height = this.game.height;

        const variant = Math.floor(Math.random() * 4);

        let x, y, heading;

        switch (variant) {
            case 0:
                x = this.randomRange(width / 2, width);
                y = this.randomRange(0, height / 2);
                heading = this.starsAngleRad;
                break;

            case 1:
                x = this.randomRange(0, width / 2);
                y = this.randomRange(0, height / 2);
                heading = this.starsAngleRadFlipped;
                break;

            case 2:
                x = this.randomRange(width / 2, width);
                y = this.randomRange(height / 2, height);
                heading = -this.starsAngleRad;
                break;

            case 3:
            default:
                x = this.randomRange(0, width / 2);
                y = this.randomRange(height / 2, height);
                heading = -this.starsAngleRadFlipped;
                break;
        }

        const speed = this.randomRange(
            this.shootingStarSpeed.min,
            this.shootingStarSpeed.max
        );

        const vx = Math.cos(heading) * speed;
        const vy = Math.sin(heading) * speed;

        const shootingStar = {
            x,
            y,
            vx,
            vy,
            radius: this.shootingStarRadius,
            opacity: 0,
            trailLengthDelta: 0,
            isSpawning: true,
            isDying: false,
            isDead: false,
            heading,
            lifeTimer: 0,
        };

        this.shootingStars.push(shootingStar);
    }

    update(deltaTime) {
        const dt = normalizeDelta(deltaTime);

        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.shootingStarEmittingInterval) {
            this.spawnTimer = 0;

            const burstCount = Math.random() < 0.1 ? 2 : 1;
            for (let i = 0; i < burstCount; i++) {
                this.createShootingStar();
            }
        }

        const width = this.game.width;
        const height = this.game.height;

        for (let i = 0; i < this.shootingStars.length; i++) {
            const p = this.shootingStars[i];

            if (p.isSpawning) {
                p.opacity += this.shootingStarOpacityDelta * dt;
                if (p.opacity >= 1.0) {
                    p.opacity = 1.0;
                    p.isSpawning = false;
                    p.lifeTimer = 0;
                }
            } else if (p.isDying) {
                p.opacity -= this.shootingStarOpacityDelta * dt;
                if (p.opacity <= 0.0) {
                    p.opacity = 0.0;
                    p.isDying = false;
                    p.isDead = true;
                }
            } else {
                p.lifeTimer += deltaTime;
                if (p.lifeTimer >= this.shootingStarLifeTime) {
                    p.isDying = true;
                }
            }

            p.trailLengthDelta += this.trailLengthDelta * dt;

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (
                p.x < -this.maxTrailLength ||
                p.x > width + this.maxTrailLength ||
                p.y < -this.maxTrailLength ||
                p.y > height + this.maxTrailLength
            ) {
                p.isDead = true;
            }
        }

        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            if (this.shootingStars[i].isDead) {
                this.shootingStars.splice(i, 1);
            }
        }
    }

    drawShootingStar(context, p) {
        const x = p.x;
        const y = p.y;
        const currentTrailLength = this.maxTrailLength * p.trailLengthDelta;
        const pos = this.lineToAngle(x, y, -currentTrailLength, p.heading);

        context.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;

        const starLength = 5;
        context.beginPath();
        context.moveTo(x - 1, y + 1);

        context.lineTo(x, y + starLength);
        context.lineTo(x + 1, y + 1);

        context.lineTo(x + starLength, y);
        context.lineTo(x + 1, y - 1);
        context.lineTo(x, y + 1);
        context.lineTo(x, y - starLength);

        context.lineTo(x - 1, y - 1);
        context.lineTo(x - starLength, y);

        context.lineTo(x - 1, y + 1);
        context.lineTo(x - starLength, y);

        context.closePath();
        context.fill();

        context.fillStyle = `rgba(255, 221, 157, ${p.opacity})`;
        context.beginPath();
        context.moveTo(x - 1, y - 1);
        context.lineTo(pos.x, pos.y);
        context.lineTo(x + 1, y + 1);
        context.closePath();
        context.fill();
    }

    draw(context) {
        context.save();
        for (let i = 0; i < this.shootingStars.length; i++) {
            const p = this.shootingStars[i];
            if (p.opacity > 0.0) {
                this.drawShootingStar(context, p);
            }
        }
        context.restore();
    }
}
