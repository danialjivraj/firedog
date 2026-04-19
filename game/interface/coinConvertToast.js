const PALETTES = {
    gold: {
        fill: '#F2AF2F',
        glow: '#ffd04a',
        stroke: 'rgba(136, 85, 0, 0.7)',
        innerStroke: 'rgba(136, 85, 0, 0.5)',
        text: '#ffe066',
    },
    silver: {
        fill: '#cfd3db',
        glow: '#b0b8cc',
        stroke: 'rgba(70, 76, 88, 0.9)',
        innerStroke: 'rgba(80, 86, 98, 0.62)',
        text: '#e0e6f0',
    },
};

export class CoinConvertToast {
    constructor(game, amount) {
        this.game = game;
        this.amount = amount;

        this.x = game.width - 108;
        this.y = 50;

        this.age = 0;
        this.markedForDeletion = false;

        // Timing (ms)
        this.T_INTRO_END = 480;
        this.T_HOLD_GOLD = 1900;
        this.T_FLIP_MID = 2200;
        this.T_FLIP_END = 2500;
        this.T_FADE_START = 3600;
        this.T_TOTAL = 4400;

        this.COIN_RADIUS = 21;

        this._SPIN_R0 = 0.006;
        this._SPIN_R1 = 0.042;
    }

    update(deltaTime) {
        this.age += Math.max(0, deltaTime);
        if (this.age >= this.T_TOTAL) this.markedForDeletion = true;
    }

    draw(ctx) {
        if (this.markedForDeletion) return;

        const t = this.age;

        // global alpha
        let alpha = 1;
        if (t < 80) {
            alpha = t / 80;
        } else if (t > this.T_FADE_START) {
            alpha = 1 - (t - this.T_FADE_START) / (this.T_TOTAL - this.T_FADE_START);
        }
        alpha = Math.max(0, Math.min(1, alpha));

        // pop-in scale
        let popScale = 1;
        if (t < this.T_INTRO_END) {
            popScale = this._easeOutBack(t / this.T_INTRO_END);
        }

        // coin x-scale: flip then spin-out
        let coinScaleX = 1;
        let isSilver = t >= this.T_FLIP_MID;

        if (t >= this.T_HOLD_GOLD && t < this.T_FLIP_END) {
            // y-axis flip: gold -> silver
            const flipT = (t - this.T_HOLD_GOLD) / (this.T_FLIP_END - this.T_HOLD_GOLD);
            coinScaleX = flipT < 0.5
                ? 1 - flipT * 2
                : (flipT - 0.5) * 2;
            coinScaleX = Math.max(0.01, coinScaleX);
        } else if (t >= this.T_FADE_START) {
            // accelerating spin-out: integrate linearly increasing angular velocity
            const spinDur = this.T_TOTAL - this.T_FADE_START;
            const elapsed = t - this.T_FADE_START;
            const r0 = this._SPIN_R0;
            const r1 = this._SPIN_R1;
            const spinAngle = r0 * elapsed + (r1 - r0) / (2 * spinDur) * elapsed * elapsed;
            coinScaleX = Math.max(0.01, Math.abs(Math.cos(spinAngle)));
            isSilver = true;
        }

        // gentle hover bob (fades out as spin-out begins)
        const bobFade = t >= this.T_FADE_START
            ? 1 - (t - this.T_FADE_START) / (this.T_TOTAL - this.T_FADE_START)
            : 1;
        const bob = Math.sin(t * 0.0028) * 3.5 * bobFade;

        const pal = isSilver ? PALETTES.silver : PALETTES.gold;
        const r = this.COIN_RADIUS;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y + bob);
        ctx.scale(popScale, popScale);

        // coin
        ctx.save();
        ctx.scale(coinScaleX, 1);
        this._drawCoin(ctx, 0, 0, r, pal);
        ctx.restore();

        // sparkle ring when silver first appears
        if (isSilver && t >= this.T_FLIP_MID && t < this.T_FLIP_END + 400) {
            const sparkT = Math.min(1, (t - this.T_FLIP_MID) / 400);
            this._drawSparkles(ctx, 0, 0, r, sparkT);
        }

        // text to the right of the coin
        const label = `+${this.amount}`;
        ctx.save();
        ctx.font = 'bold 25px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.lineWidth = 4;
        ctx.strokeText(label, r + 10, 0);
        ctx.fillStyle = pal.text;
        ctx.fillText(label, r + 10, 0);
        ctx.restore();

        ctx.restore();
    }

    _drawCoin(ctx, x, y, radius, pal) {
        ctx.save();
        ctx.shadowColor = pal.glow;
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = pal.fill;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = pal.stroke;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, radius * 0.42, 0, Math.PI * 2);
        ctx.strokeStyle = pal.innerStroke;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
    }

    _drawSparkles(ctx, x, y, radius, t) {
        // t goes 0 → 1; sparkles radiate outward and fade
        const count = 6;
        const maxDist = radius * 2.2;
        const dist = maxDist * t;
        const fadeAlpha = 1 - t;

        ctx.save();
        ctx.globalAlpha *= fadeAlpha;
        ctx.fillStyle = '#e0e8ff';
        ctx.shadowColor = '#a0b8ff';
        ctx.shadowBlur = 6;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
            const sx = x + Math.cos(angle) * dist;
            const sy = y + Math.sin(angle) * dist;
            const sr = 3.5 * (1 - t * 0.6);
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    _easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
}
