import { BASE_FRAME_MS, normalizeDelta } from '../config/constants.js';

export class Layer {
    constructor(game, bgSpeed, imageOrImages, meta = {}) {
        this.game = game;
        this.bgSpeed = bgSpeed;

        this.images = Array.isArray(imageOrImages) ? imageOrImages : [imageOrImages];
        this.sequenceIndex = 0;

        this.x = 0;
        this.y = 0;
        this.groundSpeed = 0;
        this.isRaining = false;

        this.imageIds = Array.isArray(meta.imageIds)
            ? meta.imageIds
            : (meta.imageIds ? [meta.imageIds] : []);

        this.defaultX = this.x;
        this.defaultY = this.y;
        this.defaultSequenceIndex = this.sequenceIndex;

        this._oneShotImages = [];
        this._oneShotImage = null;

        this._oneShotState = "idle";
        this._afterOneShotIndex = 0;
    }

    setOneShotImages(images) {
        this._oneShotImages = Array.isArray(images) ? images.filter(Boolean) : [];
        this._oneShotImage = null;

        this._oneShotState = "idle";
        this._afterOneShotIndex = 0;
    }

    getOneShotKeys() {
        return Array.isArray(this._oneShotImages)
            ? this._oneShotImages.map((img) => img?.id).filter(Boolean)
            : [];
    }

    forceOneShotKey(key) {
        if (!key) return false;
        const match = this._oneShotImages?.find((img) => img?.id === key);
        if (!match) return false;
        this._oneShotImage = match;
        return true;
    }

    _pickOneShotImageIfNeeded() {
        if (this._oneShotImage) return this._oneShotImage;
        if (!this._oneShotImages?.length) return null;

        this._oneShotImage =
            this._oneShotImages[Math.floor(Math.random() * this._oneShotImages.length)];

        return this._oneShotImage;
    }

    hasOneShotCandidate() {
        return !!this._oneShotImages?.length && this._oneShotState !== "done";
    }

    scheduleOneShotInsert() {
        if (!this._pickOneShotImageIfNeeded()) return false;
        if (this._oneShotState !== "idle") return false;

        this._oneShotState = "pending";
        return true;
    }

    captureDefaults() {
        this.defaultX = this.x;
        this.defaultY = this.y;
        this.defaultSequenceIndex = this.sequenceIndex;
    }

    resetToDefaults() {
        this.x = this.defaultX ?? 0;
        this.y = this.defaultY ?? 0;
        this.sequenceIndex = this.defaultSequenceIndex ?? 0;
        this.groundSpeed = 0;

        this._oneShotState = "idle";
        this._afterOneShotIndex = 0;
        this._oneShotImage = null;
    }

    _advanceSegment() {
        const len = this.images.length || 1;

        if (this._oneShotState === "active") {
            this._oneShotState = "done";
            this.sequenceIndex = this._afterOneShotIndex % len;
            return;
        }

        if (this._oneShotState === "queued" && this._oneShotImage) {
            this._oneShotState = "active";
            return;
        }

        if (len > 1) this.sequenceIndex = (this.sequenceIndex + 1) % len;

        if (this._oneShotState === "pending" && this._oneShotImage) {
            this._oneShotState = "queued";
            this._afterOneShotIndex = len > 1 ? (this.sequenceIndex + 1) % len : 0;
        }
    }

    _getCurrentAndNextImages() {
        const len = this.images.length || 1;

        const baseCurrent = this.images[this.sequenceIndex % len];
        const baseNext = len > 1 ? this.images[(this.sequenceIndex + 1) % len] : baseCurrent;

        if (this._oneShotState === "active" && this._oneShotImage) {
            return {
                currentImg: this._oneShotImage,
                nextImg: this.images[this._afterOneShotIndex % len],
            };
        }

        if (this._oneShotState === "queued" && this._oneShotImage) {
            return {
                currentImg: baseCurrent,
                nextImg: this._oneShotImage,
            };
        }

        return { currentImg: baseCurrent, nextImg: baseNext };
    }

    update(deltaTime = BASE_FRAME_MS) {
        const dt = normalizeDelta(deltaTime);
        this.groundSpeed = this.game.speed * this.bgSpeed;
        this.x -= this.groundSpeed * dt;

        while (this.x <= -this.game.width) {
            this.x += this.game.width;
            this._advanceSegment();
        }
    }

    draw(context) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);

        const { currentImg, nextImg } = this._getCurrentAndNextImages();

        context.drawImage(currentImg, x, y, this.game.width, this.game.height);
        context.drawImage(nextImg, x + this.game.width, y, this.game.width, this.game.height);
    }
}

export class MovingLayer extends Layer {
    constructor(
        game,
        bgSpeed,
        imageIdOrIds,
        baseScrollSpeed = 0.3,
        direction = 'left',
        axis = 'x'
    ) {
        const ids = Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds];
        const images = ids.map((id) => document.getElementById(id)).filter(Boolean);

        if (images.length === 0) {
            throw new Error(
                `MovingLayer: no valid images found for imageId(s): ${JSON.stringify(imageIdOrIds)}`
            );
        }

        super(game, bgSpeed, images);
        this.baseScrollSpeed = baseScrollSpeed;
        this.direction = direction;
        this.axis = axis;
    }

    update(deltaTime) {
        const dt = normalizeDelta(deltaTime);
        this.groundSpeed = this.game.speed * this.bgSpeed;

        const axisSpeed = this.axis === 'x'
            ? this.baseScrollSpeed + this.groundSpeed
            : this.baseScrollSpeed;

        if (this.direction === 'left') this.x -= axisSpeed * dt;
        else if (this.direction === 'right') this.x += axisSpeed * dt;
        else if (this.direction === 'up') this.y -= axisSpeed * dt;
        else if (this.direction === 'down') this.y += axisSpeed * dt;

        if (this.axis === 'x') {
            while (this.x <= -this.game.width) {
                this.x += this.game.width;
                this._advanceSegment();
            }
            while (this.x >= this.game.width) {
                this.x -= this.game.width;
                this._advanceSegment();
            }
        } else {
            while (this.y <= -this.game.height) {
                this.y += this.game.height;
                this._advanceSegment();
            }
            while (this.y >= this.game.height) {
                this.y -= this.game.height;
                this._advanceSegment();
            }
        }
    }

    draw(context) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);

        const { currentImg, nextImg } = this._getCurrentAndNextImages();

        if (this.axis === 'x') {
            context.drawImage(currentImg, x, this.y, this.game.width, this.game.height);
            context.drawImage(nextImg, x + this.game.width, this.y, this.game.width, this.game.height);
        } else {
            context.drawImage(currentImg, this.x, y, this.game.width, this.game.height);
            context.drawImage(nextImg, this.x, y + this.game.height, this.game.width, this.game.height);
        }
    }
}
