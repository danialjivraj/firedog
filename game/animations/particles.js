class Particle {
    constructor(game) {
        this.game = game;
        this.markedForDeletion = false;
    }
    update() {
        if (this.game.cabin.isFullyVisible || this.game.isElyvorgFullyVisible) {
            this.x -= this.speedX;
        } else {
            this.x -= this.speedX + this.game.speed;
        }
        this.y -= this.speedY;
        this.size *= 0.97;
        if (this.size < 0.5) this.markedForDeletion = true;
    }
}

export class Dust extends Particle {
    constructor(game, x, y) {
        super(game);
        this.size = (Math.random() * 20 + 10) * 3;
        this.x = x;
        this.y = y;
        this.speedX = Math.random();
        this.speedY = Math.random();
        this.isUnderwater = this.game.player.isUnderwater;
        this.image = document.getElementById(this.isUnderwater ? 'bubble' : 'dust_black');
        this.createBubble = Math.random() > 0.9;
        this.createDust = Math.random() > 0.6;
    }

    draw(context) {
        if (this.isUnderwater === true) {
            if (this.createBubble) {
                context.drawImage(document.getElementById('bubble'), this.x - this.size, this.y - this.size / 1.3, this.size, this.size);
            }
            if (this.createDust) {
                context.drawImage(document.getElementById('dust_black'), this.x - this.size, this.y - this.size / 1.3, this.size, this.size);
            }
        } else {
            context.drawImage(this.image, this.x - this.size, this.y - this.size / 1.3, this.size, this.size);
        }

        if (!this.game.menu.pause.isPaused && this.createBubble) {
            if (this.isUnderwater === true) {
                this.y -= 2;
            }
        }
    }
}

export class IceCrystal extends Particle {
    constructor(game, x, y) {
        super(game);
        this.size = Math.random() * 20 + 20;
        this.x = x;
        this.y = y;
        this.speedX = Math.random();
        this.speedY = Math.random();
        this.image = document.getElementById('ice_crystal');
        this.createIce = Math.random() > 0.5;
    }

    draw(context) {
        if (this.createIce) {
            context.drawImage(document.getElementById('ice_crystal'), this.x - this.size, this.y - this.size / 1.3, this.size, this.size);
        }
    }
}

export class Bubble extends Particle {
    constructor(game, x, y) {
        super(game);
        this.size = (Math.random() * 20 + 10) * 3;
        this.x = x;
        this.y = y;
        this.speedX = Math.random();
        this.speedY = Math.random();
        this.isUnderwater = this.game.player.isUnderwater;
        this.image = document.getElementById('bubble');
        this.createBubble = Math.random() > 0.9;
    }

    draw(context) {
        if (this.isUnderwater === true) {
            if (this.createBubble) {
                context.drawImage(document.getElementById('bubble'), this.x - this.size, this.y - this.size / 1.3, this.size, this.size);
            }
        } else {
            context.drawImage(this.image, this.x - this.size, this.y - this.size / 1.3, this.size, this.size);
        }

        if (!this.game.menu.pause.isPaused && this.createBubble) {
            if (this.isUnderwater === true) {
                this.y -= 2;
            }
        }
    }
}

export class Splash extends Particle {
    constructor(game, x, y) {
        super(game);
        this.size = Math.random() * 40 + 60;
        this.x = x + this.size * 0.4;
        this.y = y + this.size * 0.5;
        this.speedX = Math.random() * 6 - 4;
        this.speedY = Math.random() * 2 + 2;
        this.gravity = 0;
        this.image = document.getElementById(this.game.player.particleImage);
    }
    update() {
        super.update();
        if (this.game.player.isUnderwater) {
            this.y -= this.gravity * 0.6;
        } else {
            this.y += this.gravity;
        }
        this.gravity += 0.1;
    }
    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
}

export class Fire extends Particle {
    constructor(game, x, y) {
        super(game);
        this.image = document.getElementById(this.game.player.particleImage);
        this.size = Math.random() * 100 + 50;
        this.x = x;
        this.y = y;
        this.speedX = 1;
        this.speedY = 1;
        this.angle = 0;
        this.va = Math.random() * 0.2 - 0.1;
    }
    update() {
        super.update();
        if (this.game.player.isUnderwater) {
            this.y = this.y - 4;
        }
        this.angle += this.va;
        this.x += Math.sin(this.angle * 5);
    }
    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(this.image, -this.size * 0.5, -this.size * 0.5, this.size, this.size);
        context.restore();
    }
}

export class Fireball extends Particle {
    constructor(game, x, y, image, initialDirection, verticalMovement = 0) {
        super(game);
        this.image = document.getElementById(image);
        this.redPotionModeOrNot();
        this.initialSize = 10;
        this.size = this.initialSize;
        this.updateSize();
        this.updateGrowthRate();
        this.x = x;
        this.y = y;
        this.speedX = 15;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.2;
        this.verticalMovement = verticalMovement;
        this.initialDirection = initialDirection;
    }
    redPotionModeOrNot() {
        if (this.game.player.isRedPotionActive === true) {
            this.type = "redMode";
        } else {
            this.type = "normalMode";
        }
    }
    updateSize() {
        this.maxSize = this.game.player.isUnderwater ? 70 : 40;
        if (this.game.player.isRedPotionActive === true && this.game.player.isUnderwater) {
            this.maxSize = 55;
        }
    }
    updateGrowthRate() {
        this.growthRate = this.game.player.isUnderwater ? 3 : 1;
    }
    update() {
        if (this.initialDirection === 'right') {
            this.x += this.speedX;
        } else if (this.initialDirection === 'left') {
            this.x -= this.speedX;
        }
        this.y += this.verticalMovement;

        if (this.x > this.game.width || this.x - this.width < 0) {
            this.markedForDeletion = true;
        }

        const sizeChange = this.size + this.growthRate > this.maxSize
            ? this.maxSize - this.size
            : this.growthRate;

        this.size += sizeChange;
        this.y -= sizeChange / 2;

        this.rotationAngle += this.rotationSpeed;
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.size / 2, this.y + this.size / 2);
        context.rotate(this.rotationAngle);

        if (this.game.debug) context.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
        context.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);

        context.restore();
    }
}

export class CoinLoss extends Particle {
    constructor(game, x, y) {
        super(game);
        this.size = Math.random() * 40 + 60;
        this.x = x + this.size * 0.4;
        this.y = y + this.size * 0.5;
        this.speedX = Math.random() * 6 - 4;
        this.speedY = Math.random() * 2 + 2;
        this.gravity = 0;
        this.image = document.getElementById('singleCoin');
    }
    update() {
        super.update();
        this.gravity += 0.14;
        this.y += this.gravity;
    }
    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
}
