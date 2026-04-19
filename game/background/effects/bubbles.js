import { BackgroundEffect } from './backgroundEffect.js';

export class BubbleAnimation extends BackgroundEffect {
    constructor(
        game,
        maxBackgroundEntities = 70,
        sizeScale = 1,
        band = { min: 0, max: 1, spawnBelowGround: false },
        colors = {}
    ) {
        super(game, maxBackgroundEntities);

        this.colors = {
            base: colors.base || '#d12932ff',
            highlight: colors.highlight || '#ffb6c4',
            shadow: colors.shadow || '#ff3c5a',
        };

        this.bubbles = [];

        this.waterDepth = Math.min(300, this.game.height * 0.45);
        this.waterTopY = this.game.height - this.waterDepth;

        this.lifeTime = 6000;
        this.fadeFraction = 0.25;
        this.minRadius = 2;
        this.maxRadius = 10;
        this.minRise = 0.02;
        this.maxRise = 0.07;
        this.minOpacity = 0.2;
        this.maxOpacity = 0.8;

        this.sizeScale = sizeScale;
        this.bandMin = Math.max(0, Math.min(1, band.min ?? 0));
        this.bandMax = Math.max(this.bandMin, Math.min(1, band.max ?? 1));
        this.spawnBelowGround = !!band.spawnBelowGround;

        this.spawnAll();
    }

    spawnAll() {
        for (let i = 0; i < this.maxBackgroundEntities; i++) {
            this.bubbles.push(this.makeBubble(true));
        }
    }

    makeBubble(randomAge = false) {
        const x = Math.random() * this.game.width;

        const depthNorm = this.spawnBelowGround
            ? 1
            : this.bandMin + Math.random() * (this.bandMax - this.bandMin);

        const baseRadius =
            this.minRadius + depthNorm * (this.maxRadius - this.minRadius);

        const radius = baseRadius * this.sizeScale * (0.85 + Math.random() * 0.3);

        let y;
        if (this.spawnBelowGround) {
            const groundTop = this.game.height - (this.game.groundMargin || 0);
            y = groundTop + radius + Math.random() * radius * 2;
        } else {
            const bandHeight = this.waterDepth * (this.bandMax - this.bandMin);
            y =
                this.waterTopY +
                this.waterDepth * this.bandMin +
                Math.random() * bandHeight;
        }

        const riseSpeed =
            this.minRise + Math.pow(depthNorm, 2.2) * (this.maxRise - this.minRise);

        const baseOpacity =
            this.minOpacity + depthNorm * (this.maxOpacity - this.minOpacity);

        return {
            x,
            y,
            radius,
            riseSpeed,
            drift: (Math.random() * 0.04 - 0.02) * (0.5 + depthNorm),
            baseOpacity,
            opacity: 0,
            age: randomAge
                ? Math.random() * this.lifeTime * (1 - this.fadeFraction)
                : 0,
        };
    }

    update(deltaTime) {
        for (let i = 0; i < this.bubbles.length; i++) {
            const b = this.bubbles[i];
            b.age += deltaTime;

            if (
                b.age >= this.lifeTime ||
                b.y < -50 ||
                b.x < -40 ||
                b.x > this.game.width + 40
            ) {
                this.bubbles[i] = this.makeBubble(false);
                continue;
            }

            b.y -= b.riseSpeed * deltaTime;
            b.x += b.drift * deltaTime;

            const fadeIn = this.lifeTime * this.fadeFraction;
            const fadeOut = this.lifeTime * (1 - this.fadeFraction);

            let alpha = 1;
            if (b.age < fadeIn) alpha = b.age / fadeIn;
            else if (b.age > fadeOut)
                alpha = 1 - (b.age - fadeOut) / (this.lifeTime - fadeOut);

            b.opacity = b.baseOpacity * Math.max(0, Math.min(1, alpha));
        }
    }

    draw(context) {
        context.save();
        context.globalCompositeOperation = 'lighter';

        for (const b of this.bubbles) {
            if (b.opacity <= 0) continue;

            context.globalAlpha = b.opacity;
            context.shadowBlur = b.radius * 2;
            context.shadowColor = this.colors.shadow;

            context.fillStyle = this.colors.base;
            context.beginPath();
            context.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            context.fill();

            context.shadowBlur = 0;
            context.globalAlpha = b.opacity * 0.8;
            context.fillStyle = this.colors.highlight;
            context.beginPath();
            context.arc(
                b.x - b.radius * 0.35,
                b.y - b.radius * 0.35,
                b.radius * 0.45,
                0,
                Math.PI * 2
            );
            context.fill();
        }

        context.restore();
    }
}
