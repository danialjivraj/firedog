import { normalizeDelta } from '../config/constants.js';

export class Cabin {
    constructor(game, cabinImageId, width, height, y) {
        this.frameX = 0;
        this.fps = 4;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.game = game;
        this.width = width;
        this.height = height;
        this.image = document.getElementById(cabinImageId);
        this.maxFrame = 0;
        this.x = this.game.width;
        this.y = y;
        this.isFullyVisible = false;
    }
    update(deltaTime) {
        if (!this.isFullyVisible) {
            const dt = normalizeDelta(deltaTime);
            this.x -= this.game.speed * dt;

            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            if (this.x <= this.game.fixedCabinX) {
                this.isFullyVisible = true;
                this.x = this.game.fixedCabinX;
            }
        }
    }
    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    }
}
