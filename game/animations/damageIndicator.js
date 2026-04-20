import { DAMAGE_INDICATOR_OPACITY_BY_MAP } from '../config/constants.js';

export class BaseIndicator {
    constructor(game, rgbStr, initialOpacity) {
        this.game = game;
        this.rgbString = rgbStr;

        this.ringThicknessFactor = 0.40;
        this.outerRadiusFactor = 1.05;

        this.centerAlpha = 0.15;
        this.midAlpha = 0.55;
        this.edgeAlpha = 1.00;

        this.initialOpacity = initialOpacity;
        this.alpha = this.initialOpacity;
        this.elapsedTime = 0;

        this._cachedGradient = null;
        this._cachedGradientW = 0;
        this._cachedGradientH = 0;
    }

    update(deltaTime) {
        if (!this.game.isPlayerInGame) return;

        this.elapsedTime += deltaTime;

        if (this.elapsedTime > 500 && this.elapsedTime < 2000) {
            const fadeStartTime = 500;
            const fadeDuration = 1500;
            const fadeProgress = Math.min(1, (this.elapsedTime - fadeStartTime) / fadeDuration);
            this.alpha = this.initialOpacity * (1 - fadeProgress);
        } else if (this.elapsedTime >= 2000) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        if (this.alpha <= 0) return;

        const W = this.game.width;
        const H = this.game.height;
        const wider = W >= H;
        const baseDim = wider ? W : H;

        const R = 0.5 * baseDim * this.outerRadiusFactor;
        const tInner = Math.max(0, 1 - this.ringThicknessFactor);

        if (!this._cachedGradient || this._cachedGradientW !== W || this._cachedGradientH !== H) {
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
            g.addColorStop(0.00, `rgba(${this.rgbString}, ${this.centerAlpha})`);
            g.addColorStop(Math.min(0.55, tInner * 0.8), `rgba(${this.rgbString}, ${this.midAlpha})`);
            g.addColorStop(1.00, `rgba(${this.rgbString}, ${this.edgeAlpha})`);
            this._cachedGradient = g;
            this._cachedGradientW = W;
            this._cachedGradientH = H;
        }
        const g = this._cachedGradient;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(W / 2, H / 2);

        if (wider) {
            ctx.scale(1, H / W);
        } else {
            ctx.scale(W / H, 1);
        }

        const s = R * 2;
        ctx.fillStyle = g;
        ctx.fillRect(-R, -R, s, s);
        ctx.restore();
    }

    reset() {
        this.elapsedTime = 0;
        this.alpha = this.initialOpacity;
    }
}

export class DamageIndicator extends BaseIndicator {
    constructor(game) {
        const mapName =
            game.currentMap ||
            (game.background && game.background.constructor.name) ||
            null;

        const initialOpacity = DAMAGE_INDICATOR_OPACITY_BY_MAP[mapName] ?? 0.4;
        super(game, '255,0,0', initialOpacity);
    }
}

export class PurpleWarningIndicator extends BaseIndicator {
    constructor(game) {
        super(game, '160,0,255', 0.25);
    }
}
