class Power {
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

    drawWithGlow(context, glowColor, shadowBlur) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
        context.shadowColor = glowColor;
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

class PowerUp extends Power {
    draw(context, shadowBlur) {
        this.drawWithGlow(context, 'yellow', shadowBlur);
    }
}

class PowerDown extends Power {
    draw(context, shadowBlur) {
        this.drawWithGlow(context, 'red', shadowBlur);
    }
}

export class RandomPower extends Power {
    constructor(game) {
        super(game);
        this.width = 72;
        this.height = 82;
        this.image = document.getElementById('randomPower');
        this.fps = 3;
        this.frameInterval = 1000 / this.fps;
        this.maxFrame = 3;
        this.frameWidth = 72;
        this.frameHeight = 82;

        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        const minY = this.game.height - this.height - this.game.groundMargin;
        const maxY = 130;
        this.y = minY + Math.random() * (maxY - minY);

        this.fadeCycleDuration = 2000;
        this.fadeTimer = Math.random() * this.fadeCycleDuration;
        this.glowColor = 'hsl(0, 100%, 50%)';
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.fadeTimer = (this.fadeTimer + deltaTime) % this.fadeCycleDuration;

        const phase = this.fadeTimer / this.fadeCycleDuration;

        let t;
        if (phase < 0.5) {
            t = phase / 0.5;
        } else {
            t = 1 - ((phase - 0.5) / 0.5);
        }

        const hue = 0 + t * 60;

        this.glowColor = `hsl(${hue}, 100%, 50%)`;
    }

    draw(context) {
        this.drawWithGlow(context, this.glowColor, 12);
    }
}

// PowerUps
export class RedPotion extends PowerUp {
    constructor(game) {
        super(game);
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
    draw(context) { super.draw(context, 10); }
}

export class BluePotion extends PowerUp {
    constructor(game) {
        super(game);
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
    draw(context) { super.draw(context, 10); }
}

export class HealthLive extends PowerUp {
    constructor(game) {
        super(game);
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
    draw(context) { super.draw(context, 25); }
}

export class Coin extends PowerUp {
    constructor(game) {
        super(game);
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
    draw(context) { super.draw(context, 10); }
}

export class OxygenTank extends PowerUp {
    constructor(game) {
        super(game);
        this.fps = 5;
        this.frameInterval = 1000 / this.fps;
        this.width = 40.2;
        this.height = 100;
        this.image = document.getElementById('oxygenTank');
        this.maxFrame = 4;
        this.frameWidth = 40.2;
        this.frameHeight = 100;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = Math.random() * (this.game.height - this.height - this.game.groundMargin);
    }
    draw(context) { super.draw(context, 10); }
}

// PowerDowns
export class IceDrink extends PowerDown {
    constructor(game) {
        super(game);
        this.width = 65;
        this.height = 65;
        this.image = document.getElementById('iceDrink');
        this.maxFrame = 4;
        this.frameWidth = 65;
        this.frameHeight = 65;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        const minY = this.game.height - this.height - this.game.groundMargin;
        const maxY = 130;
        this.y = minY + Math.random() * (maxY - minY);
    }
    draw(context) { super.draw(context, 10); }
}

export class IceCube extends PowerDown {
    constructor(game) {
        super(game);
        this.width = 82.5;
        this.height = 90;
        this.image = document.getElementById('iceCube');
        this.maxFrame = 3;
        this.frameWidth = 82.5;
        this.frameHeight = 90;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        const minY = this.game.height - this.height - this.game.groundMargin;
        const maxY = 130;
        this.y = minY + Math.random() * (maxY - minY);
    }
    draw(context) { super.draw(context, 10); }
}

export class Cauldron extends PowerDown {
    constructor(game) {
        super(game);
        this.width = 55.333333333333333333333333333333;
        this.height = 100;
        this.image = document.getElementById('cauldron');
        this.maxFrame = 4;
        this.frameWidth = 55.333333333333333333333333333333;
        this.frameHeight = 100;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = this.game.height - this.height - this.game.groundMargin;
    }
    draw(context) { super.draw(context, 10); }
}

export class BlackHole extends PowerDown {
    constructor(game) {
        super(game);
        this.game = game;
        this.width = 98.5;
        this.height = 100;
        this.image = document.getElementById('blackhole');
        this.fps = 2;
        this.frameInterval = 1000 / this.fps;
        this.maxFrame = 1;
        this.frameWidth = 98.5;
        this.frameHeight = 100;
        this.x = game.width + Math.random() * game.width * 0.5;
        this.y = Math.random() * (game.height - this.height - game.groundMargin - 400) + 400;

        this.pullStrength = 0.3;

        this.rotation = 0;
        this.rotationSpeed = 0.0006;

        const base = Math.max(this.width, this.height);
        this.maxRadius = base;
        this.minRadius = 6;

        this.swirlCount = 9;
        this.swirlParticles = Array.from({ length: this.swirlCount }, () => this.createSwirlParticle());
    }

    createSwirlParticle() {
        return {
            angle: Math.random() * Math.PI * 2,
            radius: this.minRadius + Math.random() * (this.maxRadius - this.minRadius),
            radiusSpeed: 0.01 + Math.random() * 0.015,
            angleSpeed: (0.0009 + Math.random() * 0.0007) * (Math.random() < 0.5 ? 1 : -1),
            baseSize: 2 + Math.random() * 2,
            baseAlpha: 0.55 + Math.random() * 0.35
        };
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.rotation += this.rotationSpeed * deltaTime;

        this.pullStrength = this.game.player.isSlowed ? 0.1 : 0.3;

        if (this.x <= this.game.width - this.width / 2) {
            const dx = this.game.player.x - this.x;
            const dy = this.game.player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            this.game.player.x -= (dx / dist) * this.pullStrength * deltaTime;
        }

        this.swirlParticles.forEach(p => {
            const t = 1 - (p.radius - this.minRadius) / (this.maxRadius - this.minRadius);
            const angularFactor = 0.7 + 0.3 * (1 - t);
            const radialBase = 1 + this.pullStrength * 4;
            const radialFactor = radialBase * (1 + t * 2);

            p.angle += p.angleSpeed * deltaTime * angularFactor;
            p.radius -= p.radiusSpeed * deltaTime * radialFactor;

            if (p.radius < this.minRadius) {
                Object.assign(p, this.createSwirlParticle(), { radius: this.maxRadius });
            }
        });
    }

    _drawSwirl(context) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        context.save();
        context.translate(cx, cy);

        for (const p of this.swirlParticles) {
            const t = 1 - (p.radius - this.minRadius) / (this.maxRadius - this.minRadius);

            let alphaFactor;
            if (t < 0.15) alphaFactor = t / 0.15;
            else if (t > 0.85) alphaFactor = (1 - t) / 0.15;
            else alphaFactor = 1;

            const sizeFactor = 1 - 0.5 * Math.max(0, (t - 0.75) / 0.25);

            const size = p.baseSize * sizeFactor;
            const alpha = p.baseAlpha * alphaFactor;

            context.save();
            context.rotate(p.angle);
            context.globalAlpha = alpha;

            const x = p.radius;
            const y = 0;

            const grad = context.createRadialGradient(x, y, 0, x, y, size * 2.2);
            grad.addColorStop(0, 'rgba(120, 200, 255, 1)');
            grad.addColorStop(1, 'rgba(0, 0, 40, 0)');

            context.fillStyle = grad;
            context.beginPath();
            context.ellipse(x, y, size, size * 0.9, 0, 0, Math.PI * 2);
            context.fill();

            context.restore();
        }

        context.restore();
        context.globalAlpha = 1;
    }

    draw(context) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        context.save();
        context.translate(cx, cy);
        context.rotate(this.rotation);

        if (this.game.debug) {
            context.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        context.shadowColor = 'red';
        context.shadowBlur = 10;

        context.drawImage(
            this.image,
            this.frameX * this.frameWidth,
            this.frameY * this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        context.restore();

        context.save();
        context.globalCompositeOperation = 'lighter';
        this._drawSwirl(context);
        context.restore();
    }

}

export class Confuse extends PowerDown {
    constructor(game) {
        super(game);
        this.width = 49.25;
        this.height = 80;
        this.image = document.getElementById('confuse');
        this.maxFrame = 3;
        this.frameWidth = 49.25;
        this.frameHeight = 80;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        const minY = this.game.height - this.height - this.game.groundMargin;
        const maxY = 130;
        this.y = minY + Math.random() * (maxY - minY);
    }
    draw(context) { super.draw(context, 10); }
}

export class DeadSkull extends PowerDown {
    constructor(game) {
        super(game);
        this.width = 62;
        this.height = 100;
        this.image = document.getElementById('deadSkull');
        this.fps = 5;
        this.frameInterval = 1000 / this.fps;
        this.maxFrame = 5;
        this.frameWidth = 62;
        this.frameHeight = 100;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        const minY = this.game.height - this.height - this.game.groundMargin;
        const maxY = 130;
        this.y = minY + Math.random() * (maxY - minY);
    }
    draw(context) { super.draw(context, 10); }
}

export class CarbonDioxideTank extends PowerDown {
    constructor(game) {
        super(game);
        this.fps = 5;
        this.frameInterval = 1000 / this.fps;
        this.width = 40.2;
        this.height = 100;
        this.image = document.getElementById('carbonDioxideTank');
        this.maxFrame = 4;
        this.frameWidth = 40.2;
        this.frameHeight = 100;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = Math.random() * (this.game.height - this.height - this.game.groundMargin);
    }
    draw(context) { super.draw(context, 10); }
}