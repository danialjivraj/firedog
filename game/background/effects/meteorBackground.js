import { BackgroundEffect } from './backgroundEffect.js';

export class MeteorBackground extends BackgroundEffect {
    constructor(
        game,
        maxBackgroundEntities = 5,
        {
            minSpeed = 0.03,
            maxSpeed = 0.07,
            minAngularSpeed = 0.0007,
            maxAngularSpeed = 0.0025,
            verticalBand = { min: 0.2, max: 0.8 },
        } = {}
    ) {
        super(game, maxBackgroundEntities);

        this.game = game;
        this.meteors = [];

        this.defaultImageId = 'meteorBackground';
        this.defaultImage = document.getElementById(this.defaultImageId);

        this.spriteWidth = 47;
        this.spriteHeight = 47;

        this.minSpeed = minSpeed;
        this.maxSpeed = maxSpeed;
        this.minAngularSpeed = minAngularSpeed;
        this.maxAngularSpeed = maxAngularSpeed;
        this.verticalBand = verticalBand;

        this.minScale = 0.6;
        this.maxScale = 1.0;

        this.offscreenMargin = 100;

        this._oneShotActive = false;

        this._oneShotSpreadDeg = 18;
        this._oneShotCenterPortion = 0.25;

        this.spawnAll();
    }

    ensureImagesLoaded() {
        if (!this.defaultImage) {
            this.defaultImage = document.getElementById(this.defaultImageId);
        }
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    spawnAll() {
        for (let i = 0; i < this.maxBackgroundEntities; i++) {
            this.meteors.push(this.makeMeteor(true));
        }
    }

    makeMeteor(spawnInScreen = false) {
        const width = this.game.width;
        const height = this.game.height;

        const fromLeft = Math.random() < 0.5;

        const bandMin = Math.max(0, Math.min(1, this.verticalBand.min ?? 0));
        const bandMax = Math.max(bandMin, Math.min(1, this.verticalBand.max ?? 1));
        const yMin = height * bandMin;
        const yMax = height * bandMax;
        const y = yMin + Math.random() * (yMax - yMin);

        let x;
        if (spawnInScreen) {
            x = Math.random() * width;
        } else {
            x = fromLeft ? -this.offscreenMargin : width + this.offscreenMargin;
        }

        const spreadDeg = 40;
        const spread = (spreadDeg * Math.PI) / 180;
        const baseAngle = fromLeft ? 0 : Math.PI;
        const heading = baseAngle + this.randomRange(-spread, spread);

        const speed = this.randomRange(this.minSpeed, this.maxSpeed);
        const vx = Math.cos(heading) * speed;
        const vy = Math.sin(heading) * speed;

        const angularSpeed = this.randomRange(this.minAngularSpeed, this.maxAngularSpeed);
        const rotationDir = Math.random() < 0.5 ? -1 : 1;

        const scale = this.randomRange(this.minScale, this.maxScale);

        return {
            x,
            y,
            vx,
            vy,
            angle: Math.random() * Math.PI * 2,
            angularSpeed,
            rotationDir,
            scale,
            imageId: this.defaultImageId,
            image: this.defaultImage,
            __oneShot: false,
        };
    }

    _pickOneShotIdIfNeeded() {
        if (this._oneShotPickedId) return this._oneShotPickedId;
        if (!Array.isArray(this._oneShotIds) || this._oneShotIds.length === 0) return null;

        const idx = Math.floor(Math.random() * this._oneShotIds.length);
        this._oneShotPickedId = this._oneShotIds[idx];
        return this._oneShotPickedId;
    }

    _makeOneShotMeteorFromSide(imageId, imageEl) {
        const width = this.game.width;
        const height = this.game.height;

        const fromLeft = Math.random() < 0.5;

        const bandMin = Math.max(0, Math.min(1, this.verticalBand.min ?? 0));
        const bandMax = Math.max(bandMin, Math.min(1, this.verticalBand.max ?? 1));
        const bandMid = (bandMin + bandMax) / 2;

        const centerPortion = this._oneShotCenterPortion;
        const halfSpan = ((bandMax - bandMin) * centerPortion) / 2;

        const yNormMin = Math.max(bandMin, bandMid - halfSpan);
        const yNormMax = Math.min(bandMax, bandMid + halfSpan);

        const y = (height * yNormMin) + Math.random() * (height * (yNormMax - yNormMin));

        const x = fromLeft ? -this.offscreenMargin : width + this.offscreenMargin;

        const spread = (this._oneShotSpreadDeg * Math.PI) / 180;
        const baseAngle = fromLeft ? 0 : Math.PI;
        const heading = baseAngle + this.randomRange(-spread, spread);

        const speed = this.randomRange(this.minSpeed, this.maxSpeed);
        const vx = Math.cos(heading) * speed;
        const vy = Math.sin(heading) * speed;

        const angularSpeed = this.randomRange(this.minAngularSpeed, this.maxAngularSpeed);
        const rotationDir = Math.random() < 0.5 ? -1 : 1;

        return {
            x,
            y,
            vx,
            vy,
            angle: Math.random() * Math.PI * 2,
            angularSpeed,
            rotationDir,
            scale: 1,
            imageId,
            image: imageEl,
            __oneShot: true,
        };
    }

    triggerOneShot() {
        if (this._oneShotShown || this._oneShotActive) return false;

        const pickedId = this._pickOneShotIdIfNeeded();
        if (!pickedId) return false;

        const img = document.getElementById(pickedId);
        if (!img) return false;

        const oneShotMeteor = this._makeOneShotMeteorFromSide(pickedId, img);
        this.meteors.push(oneShotMeteor);

        this._oneShotActive = true;
        return true;
    }

    update(deltaTime) {
        this.ensureImagesLoaded();
        if (!this.defaultImage) return;

        const width = this.game.width;
        const height = this.game.height;

        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const m = this.meteors[i];

            m.x += m.vx * deltaTime;
            m.y += m.vy * deltaTime;

            m.angle += m.angularSpeed * m.rotationDir * deltaTime;

            const off =
                m.x < -this.offscreenMargin ||
                m.x > width + this.offscreenMargin ||
                m.y < -this.offscreenMargin ||
                m.y > height + this.offscreenMargin;

            if (off) {
                const wasOneShot = !!m.__oneShot;

                if (wasOneShot) {
                    this.meteors.splice(i, 1);
                    this._oneShotActive = false;
                    this._oneShotShown = true;
                } else {
                    this.meteors[i] = this.makeMeteor(false);
                }
            }
        }
    }

    draw(context) {
        this.ensureImagesLoaded();
        if (!this.defaultImage) return;

        for (let i = 0; i < this.meteors.length; i++) {
            const m = this.meteors[i];
            const img = m.image || this.defaultImage;
            if (!img) continue;

            const scale = m.scale ?? 1;
            const drawW = this.spriteWidth * scale;
            const drawH = this.spriteHeight * scale;

            context.save();
            context.translate(m.x, m.y);
            context.rotate(m.angle);
            context.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
            context.restore();
        }
    }
}
