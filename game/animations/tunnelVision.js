export class TunnelVision {
    constructor(game, options = {}) {
        this.game = game;

        const defaults = {
            fadeInMs: 2000,
            holdMs: 7000,
            expandMs: 6000,
            fadeOutMs: 9000,

            startRadius: 3000,
            minRadius: 400,
            expandAmount: 1500,

            keepDarkDuringExpand: true,
            fadeCircleAlphaWithFadeOut: false,
        };

        this.cfg = { ...defaults, ...options };

        this.x = 0;
        this.y = 0;
        this.radius = this.cfg.minRadius;
        this.alpha = 1.0;
        this.circleAlpha = 0;
        this.elapsedTime = 0;
        this.restartRadius = null;

        this._recomputeTimeline();
    }

    _recomputeTimeline() {
        const c = this.cfg;

        const fadeIn = Math.max(0, c.fadeInMs);
        const hold = Math.max(0, c.holdMs);
        const expand = Math.max(0, c.expandMs);
        const fadeOut = Math.max(0, c.fadeOutMs);

        this.tFadeInEnd = fadeIn;
        this.tHoldEnd = this.tFadeInEnd + hold;
        this.tExpandEnd = this.tHoldEnd + expand;

        this.fadeOutStartTime = this.tExpandEnd;
        this.fadeOutDuration = fadeOut;
        this.endTime = this.fadeOutStartTime + this.fadeOutDuration;
    }

    restartFromCurrent() {
        this.elapsedTime = 0;
        this.alpha = 1.0;
        this.restartRadius = this.radius;
    }

    restartFromCurrentWithOptions(options = {}) {
        this.cfg = { ...this.cfg, ...options };
        this._recomputeTimeline();
        this.restartFromCurrent();
    }

    update(deltaTime) {
        if (!this.game.isPlayerInGame) return;

        this.elapsedTime += deltaTime;

        this.x = this.game.player.x + this.game.player.width / 2;
        this.y = this.game.player.y + this.game.player.height / 2;

        const c = this.cfg;
        const t = this.elapsedTime;

        // fade in
        if (t < this.tFadeInEnd) {
            const p = c.fadeInMs <= 0 ? 1 : Math.min(1, t / c.fadeInMs);
            const initialRadius = this.restartRadius ?? c.startRadius;

            this.radius = initialRadius - p * (initialRadius - c.minRadius);
            this.circleAlpha = Math.max(this.circleAlpha, p);
            this.alpha = 1.0;
            return;
        }

        // hold
        if (t < this.tHoldEnd) {
            this.radius = c.minRadius;
            if (c.keepDarkDuringExpand) this.circleAlpha = Math.max(this.circleAlpha, 1.0);
            this.alpha = 1.0;
            return;
        }

        // expand
        if (t < this.fadeOutStartTime) {
            const expandElapsed = t - this.tHoldEnd;
            const p = c.expandMs <= 0 ? 1 : Math.min(1, expandElapsed / c.expandMs);

            this.radius = c.minRadius + p * c.expandAmount;
            if (c.keepDarkDuringExpand) this.circleAlpha = Math.max(this.circleAlpha, 1.0);
            this.alpha = 1.0;
            return;
        }

        // fade out
        if (t < this.endTime) {
            const fadeElapsed = t - this.fadeOutStartTime;
            const p = c.fadeOutMs <= 0 ? 1 : Math.min(1, fadeElapsed / c.fadeOutMs);

            this.alpha = 1.0 - p;
            if (c.fadeCircleAlphaWithFadeOut) {
                this.circleAlpha = 1.0 - p;
            }
            return;
        }

        this.game.collisions = this.game.collisions.filter(col => col !== this);
        this.game.player.isBlackHoleActive = false;
    }

    draw(context) {
        context.globalAlpha = this.alpha;

        const gradient = context.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
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
        this.restartRadius = null;
        this.circleAlpha = 0;
    }
}
