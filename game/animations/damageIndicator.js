export class BaseIndicator {
    constructor(game, imageId, initialOpacity) {
        this.game = game;
        this.x = this.game.width - this.game.width;
        this.y = this.game.height - this.game.height;
        this.image = document.getElementById(imageId);
        this.initialOpacity = initialOpacity;
        this.alpha = this.initialOpacity;
        this.fadeSpeed = 1 / 1500;
        this.elapsedTime = 0;
    }

    update(deltaTime) {
        if (this.game.isPlayerInGame) {
            this.elapsedTime += deltaTime;
            if (this.elapsedTime > 500 && this.elapsedTime < 2000) {
                const fadeStartTime = 500;
                const fadeDuration = 1500;
                const fadeProgress = Math.min(1, (this.elapsedTime - fadeStartTime) / fadeDuration);
                this.alpha = this.initialOpacity - this.initialOpacity * fadeProgress;
            } else if (this.elapsedTime >= 2000) {
                this.game.collisions = this.game.collisions.filter(collision => collision !== this);
                this.game.player.loopDamageIndicator = true;
            }
        }
    }

    draw(context) {
        context.globalAlpha = this.alpha;
        context.drawImage(this.image, this.x, this.y);
        context.globalAlpha = 1.0;
    }

    reset() {
        this.elapsedTime = 0;
        this.alpha = this.initialOpacity;
    }
}

export class DamageIndicator extends BaseIndicator {
    constructor(game) {
        let initialOpacity;
        if (game.mapSelected[1]) {
            initialOpacity = 0.36;
        } else if (game.mapSelected[2]) {
            initialOpacity = 0.26;
        } else if (game.mapSelected[3]) {
            initialOpacity = 0.75;
        } else if (game.mapSelected[4]) {
            initialOpacity = 0.47;
        } else if (game.mapSelected[5]) {
            initialOpacity = 0.66;
        } else if (game.mapSelected[6]) {
            initialOpacity = 0.62;
        }
        super(game, 'damageIndicator', initialOpacity);
    }
}

export class PurpleWarningIndicator extends BaseIndicator {
    constructor(game) {
        super(game, 'purpleWarningIndicator', 0.62);
    }
}
