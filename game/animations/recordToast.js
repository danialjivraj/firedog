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
        this.text = text;

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

        this.richLines = this._normalizeToRichLines(text);

        this._cache = null;
        this._cacheW = 0;
        this._cacheH = 0;

        this._buildCache();
    }

    _normalizeToRichLines(text) {
        if (Array.isArray(text)) {
            return text.map((line) => {
                if (!Array.isArray(line)) {
                    return [{ text: String(line?.text ?? line ?? ""), fill: line?.fill }];
                }
                return line.map((seg) => ({
                    text: String(seg?.text ?? ""),
                    fill: seg?.fill,
                }));
            });
        }

        const safe = String(text ?? "");
        const lines = safe.split("\n");
        return lines.map((line) => [{ text: line, fill: this.fill }]);
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

    _measureRichLine(ctx, segments) {
        let total = 0;
        for (const seg of segments) {
            total += ctx.measureText(seg.text).width;
        }
        return total;
    }

    _buildCache() {
        const scale = this.cacheScale;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // measure
        ctx.save();
        ctx.font = this.font;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        const fontSize = this._getFontSizePx();
        const lineH = fontSize * this.lineSpacing;
        const totalH = (this.richLines.length - 1) * lineH;

        let maxW = 0;
        for (const richLine of this.richLines) {
            const w = this._measureRichLine(ctx, richLine);
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
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        const cx = canvas.width / (2 * scale);
        const cy = canvas.height / (2 * scale);

        ctx.shadowColor = this.shadow;
        ctx.shadowBlur = this.shadowBlur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        for (let i = 0; i < this.richLines.length; i++) {
            const segments = this.richLines[i];
            const yy = cy - totalH / 2 + i * lineH;

            const lineWidth = this._measureRichLine(ctx, segments);
            let xCursor = cx - lineWidth / 2;

            for (const seg of segments) {
                const segText = seg.text;
                const segFill = seg.fill || this.fill;

                ctx.lineWidth = this.strokeWidth;
                ctx.strokeStyle = this.stroke;
                ctx.strokeText(segText, xCursor, yy);

                ctx.fillStyle = segFill;
                ctx.fillText(segText, xCursor, yy);

                xCursor += ctx.measureText(segText).width;
            }
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