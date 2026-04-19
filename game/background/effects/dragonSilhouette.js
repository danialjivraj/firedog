import { normalizeDelta } from '../../config/constants.js';
import { BackgroundEffect } from './backgroundEffect.js';

export class DragonSilhouette extends BackgroundEffect {
    constructor(game, scale = 1, opacity = 1) {
        super(game, 1);
        this.game = game;

        this.frameWidth = 52.91666666666667;
        this.frameHeight = 50;

        this.scale = scale;
        this.width = this.frameWidth * this.scale;
        this.height = this.frameHeight * this.scale;

        this.opacity = opacity;

        this.maxFrame = 11;
        this.frameX = Math.floor(Math.random() * (this.maxFrame + 1));
        this.frameY = 0;

        this.fps = 14;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        this.defaultImageId = 'dragonSilhouette';
        this.imageId = this.defaultImageId;
        this.image = document.getElementById(this.imageId);

        this.direction = -1;
        this.flipped = false;

        this.speedX = 0;
        this.speedY = 0;

        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;

        this._oneShotActive = false;
        this._oneShotDragon = null;

        this.spawnInitialInScreen();
    }

    _pickOneShotIdIfNeeded() {
        if (this._oneShotPickedId) return this._oneShotPickedId;
        if (!Array.isArray(this._oneShotIds) || this._oneShotIds.length === 0) return null;

        const idx = Math.floor(Math.random() * this._oneShotIds.length);
        this._oneShotPickedId = this._oneShotIds[idx];
        return this._oneShotPickedId;
    }

    _makeDragon(spawnInScreen = false, imageId = this.defaultImageId, image = null) {
        const width = this.frameWidth * this.scale;
        const height = this.frameHeight * this.scale;

        const randomBase = Math.random() * 0.5 + 0.5;
        const speedX = randomBase * this.scale;

        const minY = 0;
        const maxY = this.game.height / 2;
        const y = minY + Math.random() * (maxY - minY);

        const angle = 0;
        const va = Math.random() * 0.1 + 0.1;

        let x;
        let direction;
        let flipped;

        if (spawnInScreen) {
            x = Math.random() * (this.game.width - width);

            if (Math.random() < 0.5) {
                direction = 1;
                flipped = true;
            } else {
                direction = -1;
                flipped = false;
            }
        } else {
            const spawnFromLeft = Math.random() < 0.5;
            if (spawnFromLeft) {
                direction = 1;
                flipped = true;
                x = -width - Math.random() * this.game.width * 0.5;
            } else {
                direction = -1;
                flipped = false;
                x = this.game.width + Math.random() * this.game.width * 0.5;
            }
        }

        return {
            x,
            y,
            width,
            height,
            speedX,
            speedY: 0,
            angle,
            va,
            direction,
            flipped,
            frameX: Math.floor(Math.random() * (this.maxFrame + 1)),
            frameTimer: 0,
            imageId,
            image: image || document.getElementById(imageId),
            __oneShot: imageId !== this.defaultImageId,
        };
    }

    _makeOneShotDragonFromSide(imageId, imageEl) {
        const dragon = this._makeDragon(false, imageId, imageEl);

        const spawnFromLeft = Math.random() < 0.5;
        const minY = 0;
        const maxY = this.game.height / 2;
        dragon.y = minY + Math.random() * (maxY - minY);

        const randomBase = Math.random() * 0.5 + 0.5;
        dragon.speedX = randomBase * this.scale;

        dragon.angle = 0;
        dragon.va = Math.random() * 0.1 + 0.1;

        if (spawnFromLeft) {
            dragon.direction = 1;
            dragon.flipped = true;
            dragon.x = -dragon.width + 2;
        } else {
            dragon.direction = -1;
            dragon.flipped = false;
            dragon.x = this.game.width - 2;
        }

        dragon.__oneShot = true;
        return dragon;
    }

    triggerOneShot() {
        if (this._oneShotShown || this._oneShotActive) return false;

        const picked = this._pickOneShotIdIfNeeded();
        if (!picked) return false;

        const image = document.getElementById(picked);
        if (!image) return false;

        this._oneShotDragon = this._makeOneShotDragonFromSide(picked, image);
        this._oneShotActive = true;
        return true;
    }

    resetPosition() {
        this.width = this.frameWidth * this.scale;
        this.height = this.frameHeight * this.scale;

        const randomBase = Math.random() * 0.5 + 0.5;
        this.speedX = randomBase * this.scale;

        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;

        const minY = 0;
        const maxY = this.game.height / 2;
        this.y = minY + Math.random() * (maxY - minY);

        const spawnFromLeft = Math.random() < 0.5;

        if (spawnFromLeft) {
            this.direction = 1;
            this.flipped = true;
            this.x = -this.width - Math.random() * this.game.width * 0.5;
        } else {
            this.direction = -1;
            this.flipped = false;
            this.x = this.game.width + Math.random() * this.game.width * 0.5;
        }
    }

    advanceFrame(deltaTime) {
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = this.frameX < this.maxFrame ? this.frameX + 1 : 0;
        }
    }

    _advanceDragonFrame(dragon, deltaTime) {
        dragon.frameTimer += deltaTime;
        if (dragon.frameTimer > this.frameInterval) {
            dragon.frameTimer = 0;
            dragon.frameX = dragon.frameX < this.maxFrame ? dragon.frameX + 1 : 0;
        }
    }

    _updateDragon(dragon, deltaTime) {
        const dt = normalizeDelta(deltaTime);

        dragon.x += dragon.speedX * dragon.direction * dt;
        dragon.y += dragon.speedY * dt;

        dragon.va = (Math.random() * 0.1 + 0.1) * dragon.speedX;
        dragon.angle += dragon.va * dt;
        dragon.y += Math.sin(dragon.angle) * dragon.speedX * this.scale * dt;

        this._advanceDragonFrame(dragon, deltaTime);

        const offLeft = dragon.x + dragon.width < 0;
        const offRight = dragon.x > this.game.width;
        const offBottom = dragon.y > this.game.height;
        const offTop = dragon.y + dragon.height < 0;

        return offLeft || offRight || offBottom || offTop;
    }

    update(deltaTime) {
        const dt = normalizeDelta(deltaTime);

        this.x += this.speedX * this.direction * dt;
        this.y += this.speedY * dt;

        this.va = (Math.random() * 0.1 + 0.1) * this.speedX;
        this.angle += this.va * dt;
        this.y += Math.sin(this.angle) * this.speedX * this.scale * dt;

        this.advanceFrame(deltaTime);

        const offLeft = this.x + this.width < 0;
        const offRight = this.x > this.game.width;
        const offBottom = this.y > this.game.height;
        const offTop = this.y + this.height < 0;

        if (offLeft || offRight || offBottom || offTop) {
            this.resetPosition();
        }

        if (this._oneShotDragon) {
            const oneShotOffscreen = this._updateDragon(this._oneShotDragon, deltaTime);

            if (oneShotOffscreen) {
                this._oneShotDragon = null;
                this._oneShotActive = false;
                this._oneShotShown = true;
            }
        }
    }

    _drawDragon(context, dragon) {
        if (!dragon.image) dragon.image = document.getElementById(dragon.imageId);
        if (!dragon.image) return;

        const sx = dragon.frameX * this.frameWidth;
        const sy = 0;
        const sw = this.frameWidth;
        const sh = this.frameHeight;

        const dw = dragon.width;
        const dh = dragon.height;

        context.save();
        context.globalAlpha = this.opacity;

        if (dragon.flipped) {
            context.translate(dragon.x + dw, dragon.y);
            context.scale(-1, 1);
            context.drawImage(dragon.image, sx, sy, sw, sh, 0, 0, dw, dh);
        } else {
            context.translate(dragon.x, dragon.y);
            context.drawImage(dragon.image, sx, sy, sw, sh, 0, 0, dw, dh);
        }

        context.restore();
    }

    draw(context) {
        this._drawDragon(context, this);

        if (this._oneShotDragon) {
            this._drawDragon(context, this._oneShotDragon);
        }
    }

    spawnInitialInScreen() {
        this.width = this.frameWidth * this.scale;
        this.height = this.frameHeight * this.scale;

        const randomBase = Math.random() * 0.5 + 0.5;
        this.speedX = randomBase * this.scale;

        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;

        const minY = 0;
        const maxY = this.game.height / 2;
        this.y = minY + Math.random() * (maxY - minY);

        this.x = Math.random() * (this.game.width - this.width);

        if (Math.random() < 0.5) {
            this.direction = 1;
            this.flipped = true;
        } else {
            this.direction = -1;
            this.flipped = false;
        }
    }
}
