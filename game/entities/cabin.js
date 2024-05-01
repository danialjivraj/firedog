export class Cabin {
    constructor(game, cabinImageId, width, height, y) {
        this.frameX = 0;
        this.frameY = 0;
        this.fps = 4;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
        this.game = game;
        this.width = width;
        this.height = height;
        this.image = document.getElementById(cabinImageId);
        this.maxFrame = 0;
        this.frameWidth = width;
        this.frameHeight = height;
        this.x = this.game.width;
        this.y = y;
        this.isFullyVisible = false;
    }
    update(deltaTime) {
        if (!this.isFullyVisible) {
            this.x -= this.game.speed;

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
        context.drawImage(this.image, this.frameX * this.frameWidth, this.frameY * this.frameHeight, this.frameWidth, this.frameHeight, this.x, this.y, this.width, this.height);
    }
}
