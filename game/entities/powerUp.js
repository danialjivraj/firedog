class PowerUp {
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

        context.shadowColor = 'yellow';
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

export class RedPotion extends PowerUp {
    constructor(game) {
        super();
        this.game = game;
        this.width = 77.4;
        this.height = 65;
        this.image = document.getElementById('redpotion');
        this.maxFrame = 4;
        this.frameWidth = 77.4;
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

export class BluePotion extends PowerUp {
    constructor(game) {
        super();
        this.game = game;
        this.width = 77.4;
        this.height = 65;
        this.image = document.getElementById('bluepotion');
        this.maxFrame = 4;
        this.frameWidth = 77.4;
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

export class HealthLive extends PowerUp {
    constructor(game) {
        super();
        this.game = game;
        this.width = 50;
        this.height = 50;
        this.image = document.getElementById('healthlive');
        this.maxFrame = 4;
        this.frameWidth = 50;
        this.frameHeight = 50;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        const minY = this.game.height - this.height - this.game.groundMargin;
        const maxY = 130;
        this.y = minY + Math.random() * (maxY - minY);
    }
    draw(context) {
        super.draw(context, 25);
    }
}

export class Coin extends PowerUp {
    constructor(game) {
        super();
        this.game = game;
        this.fps = 30;
        this.frameInterval = 1000 / this.fps;
        this.width = 51.722;
        this.height = 50;
        this.image = document.getElementById('coin');
        this.maxFrame = 17;
        this.frameWidth = 51.722;
        this.frameHeight = 50;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        const minY = this.game.height - this.height - this.game.groundMargin;
        const maxY = 130;
        this.y = minY + Math.random() * (maxY - minY);
    }
    draw(context) {
        super.draw(context, 10);
    }
}

export class OxygenTank extends PowerUp {
    constructor(game) {
        super();
        this.game = game;
        this.fps = 0;
        this.frameInterval = 1000 / this.fps;
        this.width = 35;
        this.height = 64;
        this.image = document.getElementById('oxygenTank');
        this.frameWidth = 35;
        this.frameHeight = 64;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = Math.random() * (this.game.height - this.height - this.game.groundMargin);
    }
    draw(context) {
        super.draw(context, 10);
    }
}
