import { drawCoinIcon } from '../interface/coinIcon.js';
import { getFilteredOutline, OUTLINE_OFFSETS } from '../utils/spriteCache.js';

export class FloatingMessage {
    constructor(value, x, y, options = {}) {
        this.value = value;
        this.x = x;
        this.y = y;

        this.targetX = options.targetX ?? null;
        this.targetY = options.targetY ?? null;
        this.fontSize = options.fontSize ?? 28;
        this.textColor = options.textColor ?? 'white';
        this.strokeColor = options.strokeColor ?? 'rgba(0, 0, 0, 0.9)';
        this.smallSuffix = options.smallSuffix ?? false;
        this.iconType = options.iconType ?? null;
        this.iconImage = options.iconImage ?? null;
        this.iconWidth = options.iconWidth ?? this.fontSize;
        this.iconHeight = options.iconHeight ?? this.fontSize;
        this.iconGap = options.iconGap ?? 8;
        this.iconPosition = options.iconPosition ?? 'left';
        this.iconOffsetY = options.iconOffsetY ?? 0;
        this.iconShadowColor = options.iconShadowColor ?? 'white';
        this.iconStrokeFilter = options.iconStrokeFilter ?? null;
        this.coinIconLoss = options.coinIconLoss ?? null;
        this.duration = options.duration ?? 1400;
        this.easing = options.easing ?? 'easeIn';

        this._startX = x;
        this._startY = y;

        this.elapsed = 0;
        this.markedForDeletion = false;

        this._wFs = -1;
        this._wTextWidth = 0;
        this._wNumWidth = 0;
        this._wLetWidth = 0;
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

        const hasIcon = this.iconType === 'coin' || !!this.iconImage;

        const drawIcon = (iconX, scaledFs) => {
            if (!hasIcon) return 0;
            const iconW = this.iconWidth * (scaledFs / this.fontSize);
            const iconH = this.iconHeight * (scaledFs / this.fontSize);
            const iconY = this.y - iconH / 2 + this.iconOffsetY;

            context.save();
            context.shadowColor = 'transparent';
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;

            if (this.iconType === 'coin') {
                drawCoinIcon(
                    context,
                    iconX + iconW / 2,
                    iconY + iconH / 2,
                    Math.min(iconW, iconH) / 2,
                    { isLoss: this.coinIconLoss ?? String(this.value).startsWith('-') }
                );
            } else if (this.iconStrokeFilter) {
                const cached = getFilteredOutline(this.iconImage, iconW, iconH, this.iconStrokeFilter);
                if (cached) {
                    context.drawImage(cached, iconX - 1, iconY - 1, cached.width, cached.height);
                } else {
                    context.save();
                    context.filter = this.iconStrokeFilter;
                    for (const [ox, oy] of OUTLINE_OFFSETS) {
                        context.drawImage(this.iconImage, iconX + ox, iconY + oy, iconW, iconH);
                    }
                    context.restore();
                }
            } else {
                context.shadowColor = this.iconShadowColor;
                context.shadowBlur = 0;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
            }

            if (this.iconImage) context.drawImage(this.iconImage, iconX, iconY, iconW, iconH);
            context.restore();
            return iconW;
        };

        if (this.smallSuffix && this.value.length > 1) {
            const numberPart = this.value.slice(0, -1);
            const letterPart = this.value.slice(-1);

            const scaledFs = Math.round(this.fontSize * scale);
            const smallerFs = Math.round(scaledFs * 0.7);

            let numWidth, letWidth;
            if (this._wFs === scaledFs) {
                numWidth = this._wNumWidth;
                letWidth = this._wLetWidth;
                context.font = `bold ${scaledFs}px Love Ya Like A Sister`;
            } else {
                context.font = `bold ${scaledFs}px Love Ya Like A Sister`;
                numWidth = context.measureText(numberPart).width;
                context.font = `bold ${smallerFs}px Love Ya Like A Sister`;
                letWidth = context.measureText(letterPart).width;
                this._wFs = scaledFs;
                this._wNumWidth = numWidth;
                this._wLetWidth = letWidth;
            }

            const startX = this.x - (numWidth + letWidth) / 2;

            context.textAlign = 'left';
            context.lineWidth = 3;
            context.strokeStyle = this.strokeColor;

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
            context.lineWidth = 3;
            context.strokeStyle = this.strokeColor;
            let textWidth;
            if (this._wFs === scaledFs) {
                textWidth = this._wTextWidth;
            } else {
                textWidth = context.measureText(this.value).width;
                this._wFs = scaledFs;
                this._wTextWidth = textWidth;
            }
            const iconW = hasIcon ? this.iconWidth * (scaledFs / this.fontSize) : 0;
            const totalWidth = textWidth + (hasIcon ? iconW + this.iconGap : 0);
            const startX = this.x - totalWidth / 2;
            let textX = startX;

            context.textAlign = 'left';
            if (hasIcon) {
                if (this.iconPosition === 'right') {
                    textX = startX;
                    drawIcon(startX + textWidth + this.iconGap, scaledFs);
                } else {
                    drawIcon(startX, scaledFs);
                    textX = startX + iconW + this.iconGap;
                }
            }

            context.strokeText(this.value, textX, this.y);
            context.fillStyle = this.textColor;
            context.fillText(this.value, textX, this.y);
        }

        context.restore();
    }
}
