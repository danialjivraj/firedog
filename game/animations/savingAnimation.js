export class SavingOrDeletingAnimation {
    constructor(game, width, height, imageId, maxFrame, x, y, fps) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.image = document.getElementById(imageId);
        this.maxFrame = maxFrame;
        this.frameWidth = this.width;
        this.frameHeight = this.height;
        this.x = x;
        this.y = y;
        this.frameX = 0;
        this.frameY = 0;
        this.fps = fps;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
    }

    update(deltaTime) {
        this.frameTimer += deltaTime;

        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;

            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
        if (this.game.map2Unlocked && this.game.map3Unlocked === false) {
            context.shadowColor = 'orange';
        } else {
            context.shadowColor = 'white';
        }
        context.shadowBlur = 10;

        context.drawImage(
            this.image,
            this.frameX * this.frameWidth,
            this.frameY * this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );

        context.restore();
    }
}

export class SavingAnimation extends SavingOrDeletingAnimation {
    constructor(game) {
        super(game, 177.66666666666666666666666666667, 60, 'savingAnimation', 2, game.width - 177.66666666666666666666666666667 - 30, game.height - 60, 3);
    }
}

export class SavingBookAnimation extends SavingOrDeletingAnimation {
    constructor(game) {
        super(game, 192, 152, 'savingBookAnimation', 8, game.width - 192 - 45, game.height - 152 - 35, 8);
    }
}

export class DeleteProgressAnimation extends SavingOrDeletingAnimation {
    constructor(game) {
        super(game, 179.33333333333333333333333333333, 100, 'deleteProgressAnimation', 2, game.width - 179.33333333333333333333333333333 - 45, game.height - 100, 2);
    }
}

export class DeleteProgressBookAnimation extends SavingOrDeletingAnimation {
    constructor(game) {
        super(game, 194, 154, 'deleteProgressBookAnimation', 5, game.width - 194 - 45, game.height - 154 - 85, 5);
    }
}
