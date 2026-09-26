export const MENU_COLORS = Object.freeze({
    ember: '#ffda41',
    emberBright: '#ffe780',
    emberDim: 'rgba(255, 218, 65, 0.35)',
    emberGlow: 'rgba(255, 218, 65, 0.55)',
    emberSoft: 'rgba(255, 218, 65, 0.12)',

    ink900: 'rgba(8, 10, 14, 0.92)',

    text: '#f2f4f8',
    textDim: '#9aa3b2',

    cardBorder: 'rgba(255, 231, 128, 0.22)',
});

const MENU_FONTS = {
    title: "'Love Ya Like A Sister', cursive",
    body: 'Pangolin, cursive',
    value: "'Trebuchet MS', 'Segoe UI', sans-serif",
};

export const MENU_RADIUS = 18;

export const SCROLLBAR_MIN_THUMB = 34;

export const bodyFont = (px) => `${px}px ${MENU_FONTS.body}`;
export const valueFont = (px, { bold = false } = {}) =>
    `${bold ? 'bold ' : ''}${px}px ${MENU_FONTS.value}`;

function roundRectPath(ctx, x, y, w, h, r = MENU_RADIUS) {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

function linearGradient(ctx, x0, y0, x1, y1, stops) {
    if (typeof ctx.createLinearGradient !== 'function') return null;
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const [offset, colour] of stops) gradient.addColorStop(offset, colour);
    return gradient;
}

function clearShadow(ctx) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

export function drawGlassPanel(ctx, x, y, w, h, { radius = MENU_RADIUS } = {}) {
    ctx.save();

    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 20;
    roundRectPath(ctx, x, y, w, h, radius);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fill();

    clearShadow(ctx);

    roundRectPath(ctx, x, y, w, h, radius);
    ctx.fillStyle = linearGradient(ctx, x, y, x, y + h, [
        [0, 'rgba(38, 46, 60, 0.55)'],
        [1, 'rgba(12, 15, 20, 0.72)'],
    ]) || 'rgba(20, 25, 33, 0.68)';
    ctx.fill();

    if (typeof ctx.createRadialGradient === 'function' && typeof ctx.clip === 'function') {
        const rx = w * 0.6;
        const ry = h * 0.8;

        ctx.save();
        roundRectPath(ctx, x, y, w, h, radius);
        ctx.clip();
        ctx.translate(x + w / 2, y);
        ctx.scale(1, ry / rx);

        const bloom = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        bloom.addColorStop(0, 'rgba(255, 218, 65, 0.12)');
        bloom.addColorStop(0.6, 'rgba(255, 218, 65, 0)');
        ctx.fillStyle = bloom;
        ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
        ctx.restore();
    }

    ctx.restore();
}

export function drawCornerBrackets(ctx, x, y, w, h, { size = 22, radius = MENU_RADIUS } = {}) {
    const r = Math.max(0, Math.min(radius, size, w / 2, h / 2));
    const arm = Math.max(r, Math.min(size, w / 2, h / 2));

    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = MENU_COLORS.ember;
    ctx.lineWidth = 2;
    ctx.lineCap = 'butt';
    clearShadow(ctx);

    const bracket = (fromX, fromY, cornerX, cornerY, toX, toY) => {
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.arcTo(cornerX, cornerY, toX, toY, r);
        ctx.lineTo(toX, toY);
        ctx.stroke();
    };

    bracket(x, y + arm, x, y, x + arm, y);
    bracket(x + w - arm, y, x + w, y, x + w, y + arm);
    bracket(x + w, y + h - arm, x + w, y + h, x + w - arm, y + h);
    bracket(x + arm, y + h, x, y + h, x, y + h - arm);

    ctx.restore();
}

export function drawMenuTitle(ctx, text, centerX, baselineY, { size = 46 } = {}) {
    ctx.save();
    ctx.font = `${size}px ${MENU_FONTS.title}`;
    ctx.fillStyle = MENU_COLORS.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    const textWidth = ctx.measureText(text ?? '').width;

    ctx.fillText(text, centerX, baselineY);
    ctx.restore();

    const ruleWidth = Math.max(40, textWidth + size * 1.2);
    const ruleY = Math.round(baselineY + 14);

    ctx.save();
    ctx.globalAlpha = 0.8;
    clearShadow(ctx);
    ctx.fillStyle = linearGradient(ctx, centerX - ruleWidth / 2, ruleY, centerX + ruleWidth / 2, ruleY, [
        [0, 'rgba(255, 218, 65, 0)'],
        [0.22, MENU_COLORS.ember],
        [0.78, MENU_COLORS.ember],
        [1, 'rgba(255, 218, 65, 0)'],
    ]) || MENU_COLORS.ember;
    ctx.fillRect(centerX - ruleWidth / 2, ruleY, ruleWidth, 2);
    ctx.restore();

    return ruleY;
}

export function drawFocusMarker(ctx, x, y, w, h, { radius = 12, opacity = 1 } = {}) {
    ctx.save();
    if (opacity !== 1) ctx.globalAlpha *= Math.max(0, Math.min(1, opacity));
    clearShadow(ctx);

    roundRectPath(ctx, x, y, w, h, radius);
    ctx.fillStyle = linearGradient(ctx, x, y, x + w, y, [
        [0, 'rgba(255, 218, 65, 0.26)'],
        [0.7, 'rgba(255, 218, 65, 0.06)'],
        [1, 'rgba(255, 218, 65, 0)'],
    ]) || MENU_COLORS.emberSoft;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 231, 128, 0.35)';
    ctx.lineWidth = 1;
    roundRectPath(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius);
    ctx.stroke();

    ctx.fillStyle = MENU_COLORS.ember;
    ctx.shadowColor = MENU_COLORS.emberGlow;
    ctx.shadowBlur = 12;
    roundRectPath(ctx, x, y + h * 0.14, 3, h * 0.72, 2);
    ctx.fill();

    ctx.restore();
}
