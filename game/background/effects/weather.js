import { normalizeDelta } from '../../config/constants.js';

export class RaindropAnimation {
    constructor(game, maxRaindrops, depth = 'mid') {
        this.game = game;
        this.maxRaindrops = maxRaindrops;
        this.depth = depth;
        this.raindrops = [];
        this.isRaining = false;
        this.splashes = [];

        this.createRaindrops();
    }

    makeRaindrop(randomY = true) {
        const d = this.depth;
        const length =
            d === 'back' ? Math.random() * 8 + 4 :
                d === 'front' ? Math.random() * 35 + 30 :
                    Math.random() * 18 + 12;
        const speed =
            d === 'back' ? Math.random() * 0.15 + 0.2 :
                d === 'front' ? Math.random() * 0.45 + 0.65 :
                    Math.random() * 0.3 + 0.38;
        const width =
            d === 'back' ? Math.random() * 0.3 + 0.4 :
                d === 'front' ? Math.random() * 0.8 + 1.2 :
                    Math.random() * 0.5 + 0.7;
        const opacity =
            d === 'back' ? Math.random() * 0.15 + 0.58 :
                d === 'front' ? Math.random() * 0.3 + 0.55 :
                    Math.random() * 0.15 + 0.25;

        return {
            x: Math.random() * (this.game.width + 80) - 40,
            y: randomY ? Math.random() * this.game.height : -Math.random() * this.game.height * 0.6,
            length, speed, width, opacity,
            active: true,
        };
    }

    createRaindrops() {
        const count = this.maxRaindrops * 3;
        for (let i = 0; i < count; i++) {
            const drop = this.makeRaindrop(false);
            drop.active = false;
            this.raindrops.push(drop);
        }
    }

    update(deltaTime) {
        const hasActiveDrops = this.raindrops.some(d => d.active);
        if (!this.isRaining && !hasActiveDrops && this.splashes.length === 0) return;

        for (let i = 0; i < this.raindrops.length; i++) {
            const drop = this.raindrops[i];
            if (!drop.active) continue;

            drop.y += drop.speed * deltaTime;
            drop.x -= drop.speed * deltaTime * 0.12;

            if (drop.y - drop.length > this.game.height) {
                if (this.isRaining) {
                    if (Math.random() <= 0.1) {
                        this.splashes.push(new RaindropSplashAnimation(this.game, drop.x));
                    }
                    Object.assign(drop, this.makeRaindrop(false));
                } else {
                    drop.active = false;
                }
            }
        }

        this.splashes.forEach(splash => splash.update(deltaTime));
        this.splashes = this.splashes.filter(splash => !splash.markedForDeletion);

        if (this.isRaining) {
            this.raindrops.forEach(d => { if (!d.active) { Object.assign(d, this.makeRaindrop(false)); d.active = true; } });
        }
    }

    draw(context) {
        const hasActiveDrops = this.raindrops.some(d => d.active);
        if (!this.isRaining && !hasActiveDrops && this.splashes.length === 0) return;

        context.save();
        for (let i = 0; i < this.raindrops.length; i++) {
            const drop = this.raindrops[i];
            if (!drop.active) continue;
            const dx = drop.length * 0.12;

            context.beginPath();
            context.moveTo(drop.x, drop.y);
            context.lineTo(drop.x - dx, drop.y + drop.length);
            context.strokeStyle = `rgba(210, 230, 255, ${drop.opacity})`;
            context.lineWidth = drop.width;
            context.stroke();
        }
        this.splashes.forEach(splash => splash.draw(context));
        context.restore();
    }
}

export class RaindropSplashAnimation {
    constructor(game, x) {
        this.game = game;
        this.x = x;
        this.y = this.calculateRandomY();
        this.width = 20;
        this.height = 20;
        this.maxFrames = 6;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.fps = Math.random() * 20 + 10;
        this.frameInterval = 1000 / this.fps;
        this.markedForDeletion = false;
        this.groundSpeed = 0;
        this.bgSpeed = 1;
    }
    calculateRandomY() {
        return this.game.height - Math.random() * 25 - 55;
    }
    update(deltaTime) {
        if (this.currentFrame < this.maxFrames) {

            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.currentFrame++;
                this.frameTimer = 0;
            }
        } else {
            this.markedForDeletion = true;
        }
        const dt = normalizeDelta(deltaTime);
        this.groundSpeed = this.game.speed * this.bgSpeed;
        this.x -= this.groundSpeed * dt;
    }

    draw(context) {
        if (this.currentFrame < this.maxFrames) {
            context.drawImage(
                document.getElementById('raindropSplash'),
                this.currentFrame * this.width,
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
}

export class SnowflakeAnimation {
    constructor(game, maxFlakes = 180) {
        this.game = game;
        this.maxFlakes = maxFlakes;
        this.flakes = [];
        this.spawnAll();
    }

    spawnAll() {
        for (let i = 0; i < this.maxFlakes; i++) {
            this.flakes.push(this.makeFlake(true));
        }
    }

    makeFlake(randomY = false) {
        const r = Math.random() * 2.2 + 0.8;
        const speed = Math.random() * 0.06 + 0.02;
        const drift = (Math.random() * 0.06) - 0.03;
        const stopAbove = Math.random() < 0.8;
        return {
            x: Math.random() * this.game.width,
            y: randomY ? Math.random() * this.game.height : -10,
            r,
            speed,
            drift,
            opacity: Math.random() * 0.35 + 0.35,
            stopAbove,
        };
    }

    update(deltaTime) {
        const dt = normalizeDelta(deltaTime);
        const playerParallax = this.game.cabin.isFullyVisible ? 0 : (this.game.speed / 500) * dt;

        for (let i = 0; i < this.flakes.length; i++) {
            const f = this.flakes[i];

            f.y += f.speed * 96 * dt;
            f.x += f.drift * 40 * dt - playerParallax;

            const stopThreshold = f.stopAbove
                ? this.game.height - 40
                : this.game.height + 10;

            if (f.y > stopThreshold || f.x < -20 || f.x > this.game.width + 20) {
                this.flakes[i] = this.makeFlake(false);
            }
        }
    }

    draw(context) {
        context.save();
        context.fillStyle = 'white';
        for (let i = 0; i < this.flakes.length; i++) {
            const f = this.flakes[i];
            context.globalAlpha = f.opacity;
            context.beginPath();
            context.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;
        context.restore();
    }
}
