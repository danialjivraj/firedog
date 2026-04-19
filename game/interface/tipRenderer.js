import { TIP_PHRASE_COLORS, MAP_TIPS } from './tips.js';
import { drawCoinIcon } from './coinIcon.js';

export class TipRenderer {
    constructor(ui) {
        this.ui = ui;
        this.game = ui.game;
    }

    _measureTipText(context, text) {
        const coinIconWidth = 1 + 6 * 2 + 3; // leadingGap + diameter + trailingGap
        const stripped = text.replace(/[\uE001\uE002]/g, '');
        const iconCount = text.length - stripped.length;
        if (iconCount === 0) return context.measureText(text).width;
        return context.measureText(stripped).width + iconCount * coinIconWidth;
    }

    _buildTipColorSpans(text) {
        const spans = [];
        const keys = Object.keys(TIP_PHRASE_COLORS).sort((a, b) => b.length - a.length);

        for (const key of keys) {
            const color = TIP_PHRASE_COLORS[key];
            const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const rx = new RegExp(`\\b${escaped}(?:['']s)?\\b`, 'gi');
            let m;
            while ((m = rx.exec(text)) !== null) {
                const start = m.index;
                const end = m.index + m[0].length;
                if (!spans.some(([s, e]) => start < e && end > s)) {
                    spans.push([start, end, color]);
                }
            }
        }
        return spans;
    }

    _renderColoredTipLine(context, lineText, centerX, textY, spans) {
        if (!spans) spans = this._buildTipColorSpans(lineText);

        const COIN = '\uE001';
        const CREDIT_COIN = '\uE002';
        const hasIcon = lineText.includes(COIN) || lineText.includes(CREDIT_COIN);

        if (!hasIcon && spans.length === 0) {
            context.fillStyle = 'white';
            context.fillText(lineText, centerX, textY);
            return;
        }

        const coinR = 6;
        const coinLeadingGap = 1;
        const coinTrailingGap = 3;
        const coinIconWidth = coinLeadingGap + coinR * 2 + coinTrailingGap;

        const segments = [];
        let i = 0;
        while (i < lineText.length) {
            const ch = lineText[i];
            if (ch === COIN || ch === CREDIT_COIN) {
                segments.push({ type: 'coin', palette: ch === CREDIT_COIN ? 'silver' : 'gold' });
                i++;
                continue;
            }
            let color = null;
            for (const [s, e, c] of spans) {
                if (i >= s && i < e) { color = c; break; }
            }
            let j = i + 1;
            while (j < lineText.length && lineText[j] !== COIN && lineText[j] !== CREDIT_COIN) {
                let nextColor = null;
                for (const [s, e, c] of spans) {
                    if (j >= s && j < e) { nextColor = c; break; }
                }
                if (nextColor !== color) break;
                j++;
            }
            segments.push({ type: 'text', text: lineText.slice(i, j), color });
            i = j;
        }

        let totalWidth = 0;
        for (const seg of segments) {
            totalWidth += seg.type === 'coin' ? coinIconWidth : context.measureText(seg.text).width;
        }

        let x = centerX - totalWidth / 2;
        const savedAlign = context.textAlign;
        context.textAlign = 'left';

        for (const seg of segments) {
            if (seg.type === 'coin') {
                drawCoinIcon(context, x + coinLeadingGap + coinR, textY + 6, coinR, { palette: seg.palette });
                x += coinIconWidth;
            } else {
                context.fillStyle = seg.color ?? 'white';
                context.fillText(seg.text, x, textY);
                x += context.measureText(seg.text).width;
            }
        }

        context.textAlign = savedAlign;
    }

    _getTipContext() {
        const boss = this.game.boss;
        if (boss && boss.inFight && boss.id) return boss.id;
        return this.game.currentMap;
    }

    _getTips() {
        const key = this._getTipContext();
        return (key && MAP_TIPS[key]) || [];
    }

    dismissTip() {
        const ts = this.ui.tipState;
        if (ts.phase === 'fadeIn' || ts.phase === 'hold') {
            ts.phase = 'fadeOut';
            ts.timer = 0;
        }
    }

    resetTip() {
        const ts = this.ui.tipState;
        ts.index = -1;
        ts.opacity = 0;
        ts.phase = null;
        ts.timer = 0;
        ts._lastTime = null;
        ts._lastTipContext = null;
    }

    cycleTip() {
        const tips = this._getTips();
        if (!tips.length) return;

        const newContext = this._getTipContext();
        const ts = this.ui.tipState;

        // if context changed (e.g. boss fight started), reset to tip 0 of new context
        if (newContext !== ts._lastTipContext) {
            ts._lastTipContext = newContext;
            ts.index = 0;
        } else if (ts.phase === 'fadeOut') {
            // during fadeOut, re-show the same tip (don't advance)
        } else if (ts.index < 0 || ts.phase === null) {
            ts.index = 0;
        } else {
            ts.index = (ts.index + 1) % tips.length;
        }

        ts.opacity = 0;
        ts.phase = 'fadeIn';
        ts.timer = 0;
        ts._lastTime = null;
    }

    updateTip() {
        const ts = this.ui.tipState;
        if (ts.phase === null) return;

        const now = Date.now();
        if (ts._lastTime === null) {
            ts._lastTime = now;
            return;
        }

        if (this.game.menu.pause.isPaused) {
            ts._lastTime = now;
            return;
        }

        const dt = now - ts._lastTime;
        ts._lastTime = now;
        ts.timer += dt;

        if (ts.phase === 'fadeIn') {
            ts.opacity = Math.min(1, ts.timer / ts.fadeInMs);
            if (ts.timer >= ts.fadeInMs) {
                ts.opacity = 1;
                ts.phase = 'hold';
                ts.timer = 0;
            }
        } else if (ts.phase === 'hold') {
            if (ts.timer >= ts.holdMs) {
                ts.phase = 'fadeOut';
                ts.timer = 0;
            }
        } else if (ts.phase === 'fadeOut') {
            ts.opacity = Math.max(0, 1 - ts.timer / ts.fadeOutMs);
            if (ts.timer >= ts.fadeOutMs) {
                ts.opacity = 0;
                ts.phase = null;
            }
        }
    }

    drawTip(context) {
        const ts = this.ui.tipState;
        if (ts.phase === null || ts.opacity <= 0) return;

        const tips = this._getTips();
        if (!tips.length || ts.index < 0 || ts.index >= tips.length) return;

        const text = tips[ts.index];
        const tipCount = tips.length;

        const padX = 18;
        const padY = 10;
        const barBottom = 22;
        const boxY = barBottom + 20;
        const maxBoxW = this.ui.barWidth + 400;
        const fontSize = 16;
        const lineHeight = 22;

        context.save();
        context.globalAlpha = ts.opacity;
        context.font = `bold ${fontSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'top';

        const counterText = tipCount > 1 ? `${ts.index + 1}/${tipCount}` : null;
        const counterReserve = counterText ? 48 : 0;

        const maxLineW = maxBoxW - padX * 2 - counterReserve * 2;
        const lines = [];
        for (const paragraph of text.split('\n')) {
            const words = paragraph.split(' ');
            let current = '';
            for (const word of words) {
                const test = current ? current + ' ' + word : word;
                if (this._measureTipText(context, test) > maxLineW && current) {
                    lines.push(current);
                    current = word;
                } else {
                    current = test;
                }
            }
            if (current) lines.push(current);
        }

        const widestLine = Math.max(...lines.map(l => this._measureTipText(context, l)));
        const boxW = Math.min(maxBoxW, widestLine + padX * 2 + counterReserve * 2 + 20);
        const boxX = (this.game.width - boxW) / 2;

        const boxH = padY * 2 + (lines.length - 1) * lineHeight + fontSize;

        // background rectangle
        context.fillStyle = 'rgba(0, 0, 0, 0.65)';
        context.beginPath();
        context.roundRect(boxX, boxY, boxW, boxH, 5);
        context.fill();

        // tip text
        const centerX = boxX + boxW / 2;
        context.shadowColor = 'black';
        context.shadowBlur = 6;
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;

        const joinedText = lines.join(' ');
        const allSpans = this._buildTipColorSpans(joinedText);

        let textY = boxY + padY;
        let lineStart = 0;
        for (const line of lines) {
            const lineEnd = lineStart + line.length;
            const lineSpans = allSpans
                .filter(([s, e]) => s < lineEnd && e > lineStart)
                .map(([s, e, c]) => [Math.max(s, lineStart) - lineStart, Math.min(e, lineEnd) - lineStart, c]);
            this._renderColoredTipLine(context, line, centerX, textY, lineSpans);
            lineStart += line.length + 1;
            textY += lineHeight;
        }

        if (counterText) {
            context.font = `bold 14px Arial`;
            context.fillStyle = 'rgba(220, 220, 220, 0.9)';
            context.shadowBlur = 0;
            context.textAlign = 'right';
            context.textBaseline = 'bottom';
            context.fillText(counterText, boxX + boxW - padX, boxY + boxH - padY);
        }

        context.restore();
    }

    drawTutorialProgressBar(context, percentage = 75, colour = '#2ecc71') {
        const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
        const barX = (this.game.width / 2) - (this.ui.barWidth / 2);
        const barY = 10;
        const barHeight = 10;

        const filledWidth = (pct / 100) * this.ui.barWidth;
        const barOrFilledWidth = this.ui.barWidth;

        context.save();

        context.font = this.ui._font18;
        context.fillStyle = this.game.fontColor;
        context.textAlign = 'left';

        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'white';
        context.shadowBlur = 0;

        context.fillText(Math.floor(pct) + '%', barX + this.ui.barWidth + 5, barY + barHeight);

        context.shadowColor = 'rgba(0, 0, 0, 0)';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;

        context.fillStyle = 'rgba(255, 255, 255, 0.25)';
        context.beginPath();
        context.moveTo(barX + 5, barY);
        context.lineTo(barX + this.ui.barWidth - 5, barY);
        context.arcTo(barX + this.ui.barWidth, barY, barX + this.ui.barWidth, barY + 5, 5);
        context.lineTo(barX + this.ui.barWidth, barY + barHeight - 5);
        context.arcTo(barX + this.ui.barWidth, barY + barHeight, barX + this.ui.barWidth - 5, barY + barHeight, 5);
        context.lineTo(barX + 5, barY + barHeight);
        context.arcTo(barX, barY + barHeight, barX, barY + barHeight - 5, 5);
        context.lineTo(barX, barY + 5);
        context.arcTo(barX, barY, barX + 5, barY, 5);
        context.closePath();
        context.fill();

        context.beginPath();
        context.moveTo(barX + 5, barY);
        context.lineTo(barX + barOrFilledWidth - 5, barY);
        context.arcTo(barX + barOrFilledWidth, barY, barX + barOrFilledWidth, barY + 5, 5);
        context.lineTo(barX + barOrFilledWidth, barY + barHeight - 5);
        context.arcTo(barX + barOrFilledWidth, barY + barHeight, barX + barOrFilledWidth - 5, barY + barHeight, 5);
        context.lineTo(barX + 5, barY + barHeight);
        context.arcTo(barX, barY + barHeight, barX, barY + barHeight - 5, 5);
        context.lineTo(barX, barY + 5);
        context.arcTo(barX, barY, barX + 5, barY, 5);
        context.closePath();
        context.clip();

        context.fillStyle = colour;
        context.beginPath();
        context.moveTo(barX + 10, barY);
        context.lineTo(barX + filledWidth - 5, barY);
        context.arcTo(barX + filledWidth, barY, barX + filledWidth, barY + 5, 5);
        context.lineTo(barX + filledWidth, barY + barHeight - 5);
        context.arcTo(barX + filledWidth, barY + barHeight, barX + filledWidth - 5, barY + barHeight, 5);
        context.lineTo(barX + 5, barY + barHeight);
        context.arcTo(barX, barY + barHeight, barX, barY + barHeight - 5, 5);
        context.lineTo(barX, barY + 5);
        context.arcTo(barX, barY, barX + 10, barY, 5);
        context.closePath();
        context.fill();

        context.restore();
    }
}
