export class Penguini {
    constructor(game, width, height, image, maxFrame) {
        this.frameX = 0;
        this.frameY = 0;
        this.fps = 40;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
        this.game = game;
        this.width = width;
        this.height = height;
        this.image = document.getElementById(image);
        this.maxFrame = maxFrame;
        this.frameWidth = width;
        this.frameHeight = height;
        this.x = this.game.width;
        this.y = this.game.height - this.height - this.game.groundMargin - 10;
        this.isFullyVisible = false;
        this.showPressEnterImage = document.getElementById('enterToTalkToPenguini')
        this.showEnterToTalkToPenguini = false;
    }
    update(deltaTime) {
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }
        if (!this.game.cabin.isFullyVisible) {
            this.x -= this.game.speed;

            if (this.x <= this.game.fixedPenguinX) {
                this.isFullyVisible = true;
                this.x = this.game.fixedPenguinX;
            }
        }

        if ((this.game.talkToPenguin || this.game.notEnoughCoins) && this.game.penguini && this.game.player.x + this.game.player.width >= this.game.penguini.x + 10) {
            this.game.player.x = this.game.penguini.x + 10 - this.game.player.width;
            this.showEnterToTalkToPenguini = true;
        } else {
            this.game.enterToTalkToPenguin = false;
            this.showEnterToTalkToPenguini = false;
        }
    }
    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.frameX * this.frameWidth, this.frameY * this.frameHeight, this.frameWidth, this.frameHeight, this.x, this.y, this.width, this.height);

        let yPosition = this.y - 140;
        if (this.game.mapSelected[6]) {
            yPosition = this.y - 235;
        } else {
            yPosition = this.y - 170;
        }
        if (this.showEnterToTalkToPenguini && this.game.talkToPenguinOneTimeOnly) {
            context.drawImage(this.showPressEnterImage, this.x - 320, yPosition);
        }
    }
}
