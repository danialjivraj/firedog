import { normalizeDelta } from '../../config/constants.js';
import { BackgroundEffect } from './backgroundEffect.js';

export class ZabbyFlyBy extends BackgroundEffect {
    constructor(game, options = {}) {
        super(game, 1);

        this.game = game;

        this.imageId = null;
        this.image = null;

        this.x = 0;
        this.y = 0;

        this.directionX = 1;
        this.directionY = 0;
        this.speed = 0;

        this._active = false;

        this._minSpeed = options.minSpeed ?? 1.28;
        this._maxSpeed = options.maxSpeed ?? 2.08;
        this._maxAngleRad = options.maxAngleRad ?? Math.PI / 24;
        this._offscreenPad = options.offscreenPad ?? 40;

        this._spriteFacesRight = options.spriteFacesRight ?? true;

        this._spawnYBand = {
            min: options.spawnYMin ?? 0.40,
            max: options.spawnYMax ?? 0.60,
        };

        this._spawnedFromLeft = null;
    }

    _rand(min, max) {
        return min + Math.random() * (max - min);
    }

    _spawn() {
        if (!this.image) return false;

        const w = this.image.width || 0;
        const h = this.image.height || 0;

        const fromLeft = Math.random() < 0.5;
        this._spawnedFromLeft = fromLeft;

        const yMin = this.game.height * this._spawnYBand.min;
        const yMax = this.game.height * this._spawnYBand.max;
        this.y = this._rand(yMin, yMax);

        this.x = fromLeft
            ? -w / 2 - this._offscreenPad
            : this.game.width + w / 2 + this._offscreenPad;

        const angle = this._rand(-this._maxAngleRad, this._maxAngleRad);

        const baseDirX = Math.cos(angle);
        const baseDirY = Math.sin(angle);

        this.directionX = fromLeft ? baseDirX : -baseDirX;
        this.directionY = Math.random() < 0.5 ? baseDirY : -baseDirY;

        this.speed = this._rand(this._minSpeed, this._maxSpeed);

        return true;
    }

    triggerOneShot() {
        if (this._oneShotShown || this._active) return false;

        const pickedId =
            this._oneShotPickedId ||
            (Array.isArray(this._oneShotIds) ? this._oneShotIds[0] : null);

        if (!pickedId) return false;

        const img = document.getElementById(pickedId);
        if (!img) return false;

        this.imageId = pickedId;
        this.image = img;

        if (!this._spawn()) return false;

        this._active = true;
        return true;
    }

    update(deltaTime) {
        if (!this._active || !this.image) return;

        const dt = normalizeDelta(deltaTime);

        this.x += this.speed * this.directionX * dt;
        this.y += this.speed * this.directionY * dt;

        const w = this.image.width || 0;
        const h = this.image.height || 0;

        const offLeft = this.x < -w / 2 - this._offscreenPad;
        const offRight = this.x > this.game.width + w / 2 + this._offscreenPad;
        const offTop = this.y < -h / 2 - this._offscreenPad;
        const offBottom = this.y > this.game.height + h / 2 + this._offscreenPad;

        if (offLeft || offRight || offTop || offBottom) {
            this._active = false;
            this._oneShotShown = true;
        }
    }

    draw(context) {
        if (!this._active || !this.image) return;

        context.save();

        const rotationAngle = Math.atan2(this.directionY, this.directionX);

        context.translate(this.x, this.y);
        context.rotate(rotationAngle);

        const movingLeft = this.directionX < 0;
        const shouldFlip = this._spriteFacesRight ? movingLeft : !movingLeft;

        if (shouldFlip) {
            context.scale(1, -1);
        }

        context.drawImage(
            this.image,
            -this.image.width / 2,
            -this.image.height / 2
        );

        context.restore();
    }
}

export class Map3Zabby1FlyBy extends ZabbyFlyBy {
    constructor(game, options = {}) {
        super(game, options);
    }
}

export class BonusMap3Zabby6FlyBy extends ZabbyFlyBy {
    constructor(game, options = {}) {
        super(game, options);
    }
}
