export class FloatingMessage {
    constructor(value, x, y, options = {}) {
        this.value = value;
        this.x = x;
        this.y = y;

        this.targetX = options.targetX ?? null;
        this.targetY = options.targetY ?? null;
        this.fontSize = options.fontSize ?? 28;
        this.textColor = options.textColor ?? 'white';
        this.smallSuffix = options.smallSuffix ?? false;
        this.duration = options.duration ?? 1400;
        this.easing = options.easing ?? 'easeIn';

        this._startX = x;
        this._startY = y;

        this.elapsed = 0;
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        this.elapsed += deltaTime;

        const t = Math.min(1, this.elapsed / this.duration);

        if (this.targetX !== null && this.targetY !== null) {
            const eased = this.easing === 'easeOut'
                ? 1 - (1 - t) * (1 - t)
                : t * t;
            this.x = this._startX + eased * (this.targetX - this._startX);
            this.y = this._startY + eased * (this.targetY - this._startY);
        } else {
            this.y = this._startY - 0.05 * this.elapsed;
        }

        if (this.elapsed >= this.duration) this.markedForDeletion = true;
    }

    draw(context) {
        const t = Math.min(1, this.elapsed / this.duration);

        const scale = t < 0.25 ? 1 + 0.3 * (1 - t / 0.25) : 1;

        const alpha = t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15;

        context.save();
        context.globalAlpha = alpha;
        context.textBaseline = 'middle';

        if (this.smallSuffix && this.value.length > 1) {
            const numberPart = this.value.slice(0, -1);
            const letterPart = this.value.slice(-1);

            const scaledFs = Math.round(this.fontSize * scale);
            const smallerFs = Math.round(scaledFs * 0.7);

            context.font = `bold ${scaledFs}px Love Ya Like A Sister`;
            const numWidth = context.measureText(numberPart).width;
            context.font = `bold ${smallerFs}px Love Ya Like A Sister`;
            const letWidth = context.measureText(letterPart).width;

            const startX = this.x - (numWidth + letWidth) / 2;

            context.textAlign = 'left';
            context.lineWidth = 3;
            context.strokeStyle = 'rgba(0, 0, 0, 0.9)';

            context.font = `bold ${scaledFs}px Love Ya Like A Sister`;
            context.strokeText(numberPart, startX, this.y);
            context.fillStyle = this.textColor;
            context.fillText(numberPart, startX, this.y);

            context.font = `bold ${smallerFs}px Love Ya Like A Sister`;
            context.strokeText(letterPart, startX + numWidth, this.y);
            context.fillStyle = this.textColor;
            context.fillText(letterPart, startX + numWidth, this.y);
        } else {
            const scaledFs = Math.round(this.fontSize * scale);
            context.font = `bold ${scaledFs}px Love Ya Like A Sister`;
            context.textAlign = 'center';
            context.lineWidth = 3;
            context.strokeStyle = 'rgba(0, 0, 0, 0.9)';
            context.strokeText(this.value, this.x, this.y);
            context.fillStyle = this.textColor;
            context.fillText(this.value, this.x, this.y);
        }

        context.restore();
    }
}
