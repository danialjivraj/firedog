class PowerDown {
    constructor(game) {
        this.game = game;
        this.frameX = 0;
        this.frameY = 0;
        this.fps = 4;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        if (!this.game.cabin.isFullyVisible) {
            this.x -= this.game.speed;
        }
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }
        if (this.x + this.width < 0 || this.y > this.game.height) {
            this.markedForDeletion = true;
        }
    }

    draw(context, shadowBlur) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();

        context.shadowColor = 'red';
        context.shadowBlur = shadowBlur;

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

export class IceDrink extends PowerDown {
    constructor(game) {
        super();
        this.game = game;
        this.width = 65;
        this.height = 65;
        this.image = document.getElementById('drink');
        this.maxFrame = 4;
        this.frameWidth = 65;
        this.frameHeight = 65;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        const minY = this.game.height - this.height - this.game.groundMargin;
        const maxY = 130;
        this.y = minY + Math.random() * (maxY - minY);
    }
    draw(context) {
        super.draw(context, 10);
    }
}

export class Cauldron extends PowerDown {
    constructor(game) {
        super();
        this.game = game;
        this.width = 55.333333333333333333333333333333;
        this.height = 100;
        this.image = document.getElementById('cauldron');
        this.maxFrame = 4;
        this.frameWidth = 55.333333333333333333333333333333;
        this.frameHeight = 100;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = this.game.height - this.height - this.game.groundMargin;
    }
    draw(context) {
        super.draw(context, 10);
    }
}

export class BlackHole extends PowerDown {
    constructor(game) {
        super();
        this.game = game;
        this.width = 111.4;
        this.height = 100;
        this.image = document.getElementById('blackhole');
        this.maxFrame = 4;
        this.frameWidth = 111.4;
        this.frameHeight = 100;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = Math.random() * (this.game.height - this.height - this.game.groundMargin - 400) + 400;
        this.pullStrength = 0.3;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.game.player.isSlowed) {
            this.pullStrength = 0.1;
        } else {
            this.pullStrength = 0.3;
        }
        if (this.x <= this.game.width - this.width / 2) {
            const deltaX = this.game.player.x - this.x;
            const deltaY = this.game.player.y - this.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            const directionX = deltaX / distance;

            this.game.player.x -= directionX * this.pullStrength * deltaTime;
        }
    }

    draw(context) {
        super.draw(context, 25);
    }
}
