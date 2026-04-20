export const OUTLINE_OFFSETS = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
];

function imgKey(img) {
    return (img && (img.id || img.src)) || '';
}

function createOffscreen(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w));
    canvas.height = Math.max(1, Math.round(h));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return { canvas, ctx };
}

function cached(cache, max, key, build) {
    const hit = cache.get(key);
    if (hit !== undefined) {
        cache.delete(key);
        cache.set(key, hit);
        return hit;
    }
    const built = build();
    if (!built) return null;
    cache.set(key, built);
    if (cache.size > max) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) cache.delete(firstKey);
    }
    return built;
}

const HUED_CACHE = new Map();
const HUED_CACHE_MAX = 128;

const TINT_CACHE = new Map();
const TINT_CACHE_MAX = 256;

const GLOW_CACHE = new Map();
const GLOW_CACHE_MAX = 128;

const OUTLINE_CACHE = new Map();
const OUTLINE_CACHE_MAX = 32;

const BUBBLE_CACHE = new Map();
const BUBBLE_CACHE_MAX = 128;

const ORB_CACHE = new Map();
const ORB_CACHE_MAX = 16;

const SWIRL_CACHE = new Map();
const SWIRL_CACHE_MAX = 16;

const CHICK_GLOW_CACHE = new Map();
const CHICK_GLOW_CACHE_MAX = 8;

export function tintKey(tint) {
    if (typeof tint === 'string') return tint;
    if (!tint) return 'null';
    const stops = Array.isArray(tint.stops)
        ? tint.stops.map(s => `${s.offset}:${s.color}`).join('|')
        : '';
    return `${tint.dir || ''}#${stops}`;
}

export function getHuedSprite(img, sx, sy, sw, sh, dw, dh, hueDeg) {
    if (!img) return null;
    const key0 = imgKey(img);
    if (!key0) return null;
    const deg = Number.isFinite(hueDeg) ? hueDeg : 0;
    if (Math.abs(deg) < 0.001) return null;
    const OW = Math.max(1, Math.round(dw));
    const OH = Math.max(1, Math.round(dh));
    const key = `${key0}|${sx}|${sy}|${sw}|${sh}|${OW}|${OH}|${deg}`;

    return cached(HUED_CACHE, HUED_CACHE_MAX, key, () => {
        const off = createOffscreen(OW, OH);
        if (!off) return null;
        off.ctx.filter = `hue-rotate(${deg}deg)`;
        try {
            off.ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OW, OH);
        } catch (e) {
            return null;
        }
        return off.canvas;
    });
}

export function getTintedFrame(img, sx, sy, sw, sh, dw, dh, tint, hueDeg = null) {
    if (!img) return null;
    const key0 = imgKey(img);
    const OW = Math.max(1, Math.round(dw));
    const OH = Math.max(1, Math.round(dh));
    const hueK = Number.isFinite(hueDeg) ? hueDeg : 'null';
    const key = key0
        ? `${key0}|${sx}|${sy}|${sw}|${sh}|${OW}|${OH}|${tintKey(tint)}|${hueK}`
        : null;

    const build = () => {
        const off = createOffscreen(OW, OH);
        if (!off) return null;
        const { canvas, ctx } = off;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, OW, OH);
        ctx.globalCompositeOperation = 'source-over';
        const deg = Number.isFinite(hueDeg) ? hueDeg : 0;
        if (Math.abs(deg) >= 0.01) ctx.filter = `hue-rotate(${deg}deg)`;
        try {
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OW, OH);
        } catch (e) {
            return null;
        }
        ctx.filter = 'none';

        ctx.globalCompositeOperation = 'source-atop';
        if (typeof tint === 'string') {
            ctx.fillStyle = tint;
        } else {
            const grad = tint.dir === 'horizontal'
                ? ctx.createLinearGradient(0, 0, OW, 0)
                : ctx.createLinearGradient(0, 0, 0, OH);
            for (const stop of tint.stops) grad.addColorStop(stop.offset, stop.color);
            ctx.fillStyle = grad;
        }
        ctx.fillRect(0, 0, OW, OH);
        ctx.globalCompositeOperation = 'source-over';

        return canvas;
    };

    if (!key) return build();
    return cached(TINT_CACHE, TINT_CACHE_MAX, key, build);
}

export function getGlowedSprite(img, sx, sy, sw, sh, dw, dh, color, blur, hueDeg = 0) {
    if (!img) return null;
    const key0 = imgKey(img);
    if (!key0) return null;
    const OW = Math.max(1, Math.round(dw));
    const OH = Math.max(1, Math.round(dh));
    const key = `${key0}|${sx}|${sy}|${sw}|${sh}|${OW}|${OH}|${color}|${blur}|${hueDeg ?? 0}`;

    return cached(GLOW_CACHE, GLOW_CACHE_MAX, key, () => {
        const PAD = Math.ceil((blur || 0) * 2 + 2);
        const off = createOffscreen(OW + PAD * 2, OH + PAD * 2);
        if (!off) return null;
        const { canvas, ctx } = off;

        ctx.save();
        const deg = Number.isFinite(hueDeg) ? hueDeg : 0;
        if (Math.abs(deg) >= 0.01) ctx.filter = `hue-rotate(${deg}deg)`;
        ctx.shadowColor = color;
        ctx.shadowBlur = blur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        try {
            ctx.drawImage(img, sx, sy, sw, sh, PAD, PAD, OW, OH);
        } catch (e) {
            return null;
        }
        ctx.restore();

        canvas._padX = PAD;
        canvas._padY = PAD;
        return canvas;
    });
}

export function getFilteredOutline(img, dw, dh, filter) {
    if (!img || !filter) return null;
    const key0 = imgKey(img);
    if (!key0) return null;
    const W = Math.max(1, Math.round(dw));
    const H = Math.max(1, Math.round(dh));
    const key = `${key0}|${W}|${H}|${filter}`;

    return cached(OUTLINE_CACHE, OUTLINE_CACHE_MAX, key, () => {
        const CW = W + 2;
        const CH = H + 2;
        const off = createOffscreen(CW, CH);
        if (!off) return null;
        off.ctx.filter = filter;
        try {
            for (const [ox, oy] of OUTLINE_OFFSETS) {
                off.ctx.drawImage(img, 1 + ox, 1 + oy, W, H);
            }
        } catch (e) {
            return null;
        }
        return off.canvas;
    });
}

export function getStatusBubbleSprite(size, fill, stroke, shadowColor, shadowBlur) {
    const S = Math.max(2, Math.round(size / 2) * 2);
    const key = `${S}|${fill}|${stroke}|${shadowColor}|${shadowBlur}`;

    return cached(BUBBLE_CACHE, BUBBLE_CACHE_MAX, key, () => {
        const pad = Math.ceil(shadowBlur + S * 0.6 + 2);
        const off = createOffscreen(pad * 2, pad * 2);
        if (!off) return null;
        const { canvas, ctx } = off;
        const cx = pad;
        const cy = pad;

        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;

        ctx.beginPath();
        ctx.arc(cx, cy, S * 0.6, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = stroke;
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(cx - S * 0.2, cy - S * 0.2, S * 0.18, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fill();

        canvas._pad = pad;
        return canvas;
    });
}

export function getGlowOrbSprite(size, outerColor, innerColor) {
    const S = Math.max(2, Math.round(size));
    const key = `${S}|${outerColor}|${innerColor}`;

    return cached(ORB_CACHE, ORB_CACHE_MAX, key, () => {
        const r = S / 2;
        const outerBlur = 18;
        const pad = Math.ceil(r * 1.3 + outerBlur + 4);
        const off = createOffscreen(pad * 2, pad * 2);
        if (!off) return null;
        const { canvas, ctx } = off;
        const cx = pad;
        const cy = pad;

        ctx.shadowColor = outerColor;
        ctx.shadowBlur = outerBlur;
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = outerColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 10;
        ctx.fillStyle = innerColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
        ctx.fill();

        canvas._pad = pad;
        return canvas;
    });
}

export function getBlackHoleSwirlSprite(size) {
    const S = Math.max(2, Math.round(size * 2) / 2);
    const key = `${S}`;

    return cached(SWIRL_CACHE, SWIRL_CACHE_MAX, key, () => {
        const outer = S * 2.2;
        const pad = Math.ceil(outer) + 1;
        const off = createOffscreen(pad * 2, pad * 2);
        if (!off) return null;
        const { canvas, ctx } = off;
        const cx = pad;
        const cy = pad;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outer);
        grad.addColorStop(0, 'rgba(120, 200, 255, 1)');
        grad.addColorStop(1, 'rgba(0, 0, 40, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, S, S * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        canvas._pad = pad;
        return canvas;
    });
}

export function getChickGlowSprite(radius) {
    const R = Math.max(2, Math.round(radius));
    const key = `${R}`;

    return cached(CHICK_GLOW_CACHE, CHICK_GLOW_CACHE_MAX, key, () => {
        const pad = R + 2;
        const off = createOffscreen(pad * 2, pad * 2);
        if (!off) return null;
        const { canvas, ctx } = off;
        const cx = pad;
        const cy = pad;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        grad.addColorStop(0, 'rgba(255, 80, 80, 0.13)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();

        canvas._pad = pad;
        return canvas;
    });
}

export function getBubbleBallSprite(radius, variant = 'normal') {
    const R = Math.max(1, Math.round(radius / 2) * 2);
    const key = `${R}|${variant}`;

    return cached(BUBBLE_CACHE, BUBBLE_CACHE_MAX, key, () => {
        const pad = Math.ceil(R * 1.6) + 1;
        const off = createOffscreen(pad * 2, pad * 2);
        if (!off) return null;
        const { canvas, ctx } = off;
        const cx = pad;
        const cy = pad;
        const r = R;

        ctx.globalCompositeOperation = 'lighter';
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.6);
        if (variant === 'red') {
            glow.addColorStop(0.0, 'rgba(255,80,80,0.55)');
            glow.addColorStop(0.6, 'rgba(255,0,0,0.35)');
            glow.addColorStop(1.0, 'rgba(0,0,0,0)');
        } else {
            glow.addColorStop(0.0, 'rgba(160,220,255,0.35)');
            glow.addColorStop(1.0, 'rgba(0,0,0,0)');
        }
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2); ctx.fill();

        ctx.globalCompositeOperation = 'source-over';
        const shell = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        if (variant === 'red') {
            shell.addColorStop(0.0, 'rgba(255,230,230,0.45)');
            shell.addColorStop(0.4, 'rgba(255,100,100,0.35)');
            shell.addColorStop(0.75, 'rgba(200,40,40,0.32)');
            shell.addColorStop(1.0, 'rgba(120,0,0,0.30)');
        } else {
            shell.addColorStop(0.0, 'rgba(220,245,255,0.35)');
            shell.addColorStop(0.7, 'rgba(150,210,255,0.25)');
            shell.addColorStop(1.0, 'rgba(80,140,200,0.35)');
        }
        ctx.fillStyle = shell;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.18, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = (variant === 'red') ? 'rgba(255,120,120,0.35)' : 'rgba(255,255,255,0.22)';
        ctx.beginPath(); ctx.arc(cx + r * 0.25, cy + r * 0.15, r * 0.28, 0, Math.PI * 2); ctx.fill();

        canvas._pad = pad;
        return canvas;
    });
}
