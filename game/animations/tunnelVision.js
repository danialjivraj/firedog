export class TunnelVision {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.radius = 400;
        this.fadeSpeed = 1 / 15000;
        this.alpha = 1.0;
        this.elapsedTime = 0;
        this.fadeOutStartTime = 15000;
        this.fadeOutDuration = 9000;
    }

    update(deltaTime) {
        if (this.game.isPlayerInGame) {
            this.elapsedTime += deltaTime;

            this.x = this.game.player.x + this.game.player.width / 2;
            this.y = this.game.player.y + this.game.player.height / 2;

            if (this.elapsedTime > 9000 && this.elapsedTime < this.fadeOutStartTime) {
                // fade-out effect
                const fadeStartTime = 9000;
                const fadeDuration = this.fadeOutStartTime - fadeStartTime;
                const fadeProgress = (this.elapsedTime - fadeStartTime) / fadeDuration;
                this.radius = 400 + fadeProgress * 1500;
            } else if (this.elapsedTime < 9000) {
                // fade-in effect for the radius
                const fadeInDuration = 2000;
                const fadeInProgress = Math.min(1, this.elapsedTime / fadeInDuration);

                const initialRadius = 3000;
                this.radius = initialRadius - fadeInProgress * (initialRadius - 400);

                this.circleAlpha = fadeInProgress;
            } else if (this.elapsedTime >= this.fadeOutStartTime && this.elapsedTime < this.fadeOutStartTime + this.fadeOutDuration) {
                const fadeOutProgress = (this.elapsedTime - this.fadeOutStartTime) / this.fadeOutDuration;
                this.alpha = 1.0 - fadeOutProgress;
            } else if (this.elapsedTime >= this.fadeOutStartTime + this.fadeOutDuration) {
                this.game.collisions = this.game.collisions.filter(collision => collision !== this);
                this.game.player.isBlackHoleActive = false;
            }
        }
    }

    draw(context) {
        context.globalAlpha = this.alpha;

        const gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${this.circleAlpha})`);

        context.fillStyle = gradient;
        context.fillRect(0, 0, this.game.width, this.game.height);

        context.globalAlpha = 1.0;
    }

    reset() {
        this.elapsedTime = 0;
        this.alpha = 1.0;
        this.radius = 300;
    }
}
