export class RecordToast {
    constructor(game, text, {
        x = null,
        y = 100,
        durationMs = 7000,
        inMs = 220,
        outMs = 260,
        font = "bold 48px Love Ya Like A Sister",
        fill = "yellow",
        stroke = "black",
        shadow = "black",
        shadowBlur = 10,
        strokeWidth = 6,
        lineSpacing = 1.15,
        padding = 24,
        cacheScale = 2,
    } = {}) {
        this.game = game;
        this.text = String(text);

        this.x = x != null ? x : game.width / 2;
        this.y = y;

        this.durationMs = durationMs;
        this.inMs = Math.max(1, inMs);
        this.outMs = Math.max(1, outMs);

        this.font = font;
        this.fill = fill;
        this.stroke = stroke;
        this.shadow = shadow;
        this.shadowBlur = shadowBlur;
        this.strokeWidth = strokeWidth;

        this.lineSpacing = lineSpacing;
        this.padding = Math.max(0, padding);
        this.cacheScale = Math.max(1, cacheScale);

        this.age = 0;
        this.markedForDeletion = false;

        this.lines = this.text.split("\n");

        this._cache = null;
        this._cacheW = 0;
        this._cacheH = 0;

        this._buildCache();
    }

    clamp01(t) {
        return Math.max(0, Math.min(1, t));
    }

    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    bell(t) {
        t = this.clamp01(t);
        return Math.sin(t * Math.PI);
    }

    _getFontSizePx() {
        const m = String(this.font).match(/(\d+(?:\.\d+)?)px/);
        return m ? Number(m[1]) : 48;
    }

    _buildCache() {
        const scale = this.cacheScale;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // measure
        ctx.save();
        ctx.font = this.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const fontSize = this._getFontSizePx();
        const lineH = fontSize * this.lineSpacing;
        const totalH = (this.lines.length - 1) * lineH;

        let maxW = 0;
        for (const line of this.lines) {
            const w = ctx.measureText(line).width;
            if (w > maxW) maxW = w;
        }

        const extra = this.padding + this.shadowBlur + this.strokeWidth * 2;
        const w = Math.ceil((maxW + extra * 2) * scale);
        const h = Math.ceil((totalH + lineH + extra * 2) * scale);

        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);

        // render
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.font = this.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const cx = canvas.width / (2 * scale);
        const cy = canvas.height / (2 * scale);

        ctx.shadowColor = this.shadow;
        ctx.shadowBlur = this.shadowBlur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        for (let i = 0; i < this.lines.length; i++) {
            const yy = cy - totalH / 2 + i * lineH;

            ctx.lineWidth = this.strokeWidth;
            ctx.strokeStyle = this.stroke;
            ctx.strokeText(this.lines[i], cx, yy);

            ctx.fillStyle = this.fill;
            ctx.fillText(this.lines[i], cx, yy);
        }

        ctx.restore();

        this._cache = canvas;
        this._cacheW = canvas.width / scale;
        this._cacheH = canvas.height / scale;
    }

    update(deltaTime) {
        this.age += Math.max(0, deltaTime);
        if (this.age >= this.durationMs) this.markedForDeletion = true;
    }

    draw(ctx) {
        if (this.markedForDeletion || !this._cache) return;

        // fade in/out
        let alpha = 1;
        if (this.age < this.inMs) alpha = this.clamp01(this.age / this.inMs);
        else if (this.age > this.durationMs - this.outMs) {
            alpha = this.clamp01((this.durationMs - this.age) / this.outMs);
        }

        // pop in with back-ease
        const popT = this.clamp01(this.age / this.inMs);
        const pop = this.easeOutBack(popT);

        // stretch effect early
        const stretchT = this.clamp01(this.age / (this.durationMs * 0.35));
        const stretch = this.bell(stretchT);
        const sx = 1 + 0.18 * stretch;
        const sy = 1 - 0.10 * stretch;

        // tiny settle wobble
        const wobble = Math.sin(this.age * 0.018) * 0.02;

        const scaleX = pop * sx * (1 + wobble);
        const scaleY = pop * sy * (1 - wobble);

        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.translate(this.x, this.y);
        ctx.scale(scaleX, scaleY);

        // draw cached bitmap centered
        ctx.drawImage(
            this._cache,
            -this._cacheW / 2,
            -this._cacheH / 2,
            this._cacheW,
            this._cacheH
        );

        ctx.restore();
    }
}
