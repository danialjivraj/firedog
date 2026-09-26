import { getGlowedSprite, getTintedFrame, tintKey } from '../utils/spriteCache.js';

export const RAINBOW_FX = 'rainbow';

export const RAINBOW_FROZEN_MS = 3000;

export const RAINBOW_CFG = Object.freeze({
    refH: 92,

    maxStepMs: 120,
    bodyQuantMs: 16,

    holoStops: 64,
    holoScrollMs: 6000,
    holoAxisDeg: -90,
    holoHueCycles: 0.85,
    holoHueSpin: 0.35,
    holoPhase: [0, 0.18, 0.42],
    holoBase: [0.50, 0.48, 0.50],
    holoAmp: [0.40, 0.38, 0.40],
    holoLightSwing: 0.08,
    hueLutSize: 256,
    holoBands: 1.25,
    holoAlpha: 0.64,

    interStops: 44,
    interScrollRatio: 0.62,

    interHueCycles: 0.75,
    interBands: 1.6,
    interBase: [0.50, 0.50, 0.50],
    interAmp: [0.26, 0.24, 0.26],
    interLightSwing: 0.07,
    interAlpha: 0.45,

    sweepCycleMs: 4100,
    sweepTravelMs: 1500,
    sweepWidth: 0.22,
    sweepAlpha: 0.65,
    prismOffset: 0.055,
    prismAlpha: 0.45,

    volumeFloor: 0.72,
    volumeAlpha: 0.85,

    formFilter: 'brightness(3.6) contrast(1.15)',
    formAlpha: 0.38,

    fringePx: 1.3,
    fringeAlpha: 0.38,
    fringeCycleMs: 5600,

    hotFilter: 'brightness(0.72) contrast(9)',
    hotBlurPx: 2.5,
    hotAlpha: 0.85,
    hotPulseMs: 1900,
    hotPulseDepth: 0.35,

    portraitFloor: 0.28,

    rimBlur: 7,
    rimAlpha: 0.62,
    rimSteps: 12,

    tintSteps: 12,
});

const C = RAINBOW_CFG;

const PORTRAIT_TONE = `contrast(${((1 - C.portraitFloor) / (1 + C.portraitFloor)).toFixed(4)})`
    + ` brightness(${(1 + C.portraitFloor).toFixed(4)})`;

const FULL_BOX = Object.freeze({ x0: 0, y0: 0, x1: 1, y1: 1 });

const ART_KINDS = new Set(['sprite', 'portrait']);
const isSprite = (art) => art === 'sprite';

const DEFAULT_CHANNEL = 'default';

const channels = new Map();

const BODY_POOL_MAX = 6;
const bodyPool = new Map();
let spareSurface = null;
let offscreenBlocked = false;

function nowMs() {
    const p = globalThis.performance;
    return (p && typeof p.now === 'function') ? p.now() : Date.now();
}

function createChannelState() {
    return {
        lastNow: null,
        timeMs: 0,
    };
}

export function getRainbowState(channel = DEFAULT_CHANNEL) {
    let state = channels.get(channel);
    if (!state) {
        state = createChannelState();
        channels.set(channel, state);
    }
    return state;
}

function steppedHoloColor(timeMs, steps) {
    const turn = (timeMs / C.holoScrollMs) * C.holoHueCycles;
    const phase = Math.round((((turn % 1) + 1) % 1) * steps) / steps;
    return palette(phase, C.holoBase, C.holoAmp, 1);
}

export function getRainbowTintColor(channel = DEFAULT_CHANNEL) {
    return steppedHoloColor(getRainbowState(channel).timeMs, C.tintSteps);
}

export function resetRainbowFx(channel = null) {
    if (channel !== null) {
        channels.delete(channel);
        return;
    }

    channels.clear();
    bodyPool.clear();
    spareSurface = null;
    offscreenBlocked = false;
}

function hold(state) {
    state.lastNow = nowMs();
    return state;
}

function advance(state) {
    const t = nowMs();
    if (state.lastNow === null) state.lastNow = t;

    let dt = t - state.lastNow;
    state.lastNow = t;
    if (!Number.isFinite(dt) || dt < 0) dt = 0;
    if (dt > C.maxStepMs) dt = C.maxStepMs;

    state.timeMs += dt;
    return state;
}

function to255(v) {
    return Math.round(255 * (v < 0 ? 0 : (v > 1 ? 1 : v)));
}

let hueLut = null;

function rawChannels(phase) {
    const TAU = Math.PI * 2;
    const ph = C.holoPhase;
    return [
        C.holoBase[0] + C.holoAmp[0] * Math.cos(TAU * (phase + ph[0])),
        C.holoBase[1] + C.holoAmp[1] * Math.cos(TAU * (phase + ph[1])),
        C.holoBase[2] + C.holoAmp[2] * Math.cos(TAU * (phase + ph[2])),
    ];
}

function hueOf(phase) {
    const [r, g, b] = rawChannels(phase);
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    const d = mx - mn;
    if (d <= 0) return 0;
    let h;
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    return h < 0 ? h + 360 : h;
}

function buildHueLut() {
    const SAMPLES = 2048;
    const N = C.hueLutSize;

    const travel = new Float64Array(SAMPLES + 1);
    let prev = hueOf(0);
    let acc = 0;
    for (let i = 1; i <= SAMPLES; i++) {
        const h = hueOf(i / SAMPLES);
        let step = h - prev;
        if (step > 180) step -= 360;
        else if (step < -180) step += 360;
        acc += step;
        travel[i] = acc;
        prev = h;
    }

    const total = travel[SAMPLES];
    const lut = new Float64Array(N + 1);
    let cursor = 0;
    for (let k = 0; k <= N; k++) {
        const want = (total * k) / N;
        while (cursor < SAMPLES && Math.abs(travel[cursor + 1]) < Math.abs(want)) cursor++;
        const lo = travel[cursor];
        const hi = travel[Math.min(SAMPLES, cursor + 1)];
        const span = hi - lo;
        const f = Math.abs(span) > 1e-12 ? (want - lo) / span : 0;
        lut[k] = (cursor + f) / SAMPLES;
    }
    lut[N] = 1;
    return lut;
}

function evenedPhase(phase) {
    if (!hueLut) hueLut = buildHueLut();

    const turns = Math.floor(phase);
    const frac = phase - turns;

    const N = C.hueLutSize;
    const x = frac * N;
    const i = Math.min(N - 1, Math.floor(x));
    const even = hueLut[i] + (hueLut[i + 1] - hueLut[i]) * (x - i);

    return turns + even;
}

function palette(phase, base, amp, alpha, lift = 0) {
    const TAU = Math.PI * 2;
    const ph = C.holoPhase;
    phase = evenedPhase(phase);
    return 'rgba('
        + to255(base[0] + lift + amp[0] * Math.cos(TAU * (phase + ph[0]))) + ','
        + to255(base[1] + lift + amp[1] * Math.cos(TAU * (phase + ph[1]))) + ','
        + to255(base[2] + lift + amp[2] * Math.cos(TAU * (phase + ph[2]))) + ','
        + alpha + ')';
}

function neutral(ctx) {
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
}

function axisGradient(ctx, W, H, deg, c) {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const cx = W * (c.x0 + c.x1) / 2;
    const cy = H * (c.y0 + c.y1) / 2;
    const spanW = W * (c.x1 - c.x0);
    const spanH = H * (c.y1 - c.y0);
    const reach = (Math.abs(spanW * cos) + Math.abs(spanH * sin)) / 2;

    return ctx.createLinearGradient?.(
        cx - cos * reach, cy - sin * reach,
        cx + cos * reach, cy + sin * reach
    );
}

function paintFoil(ctx, W, H, timeMs, content, opaque) {
    const deg = C.holoAxisDeg;
    const foil = axisGradient(ctx, W, H, deg, content);
    if (!foil) return;

    const drift = timeMs / C.holoScrollMs;
    const stops = C.holoStops;
    const alpha = opaque ? 1 : C.holoAlpha;

    for (let i = 0; i < stops; i++) {
        const t = i / (stops - 1);
        const u = t + drift;
        const phase = u * C.holoHueCycles + drift * C.holoHueSpin;
        const lift = C.holoLightSwing * Math.sin(u * Math.PI * 2 * C.holoBands);
        foil.addColorStop(t, palette(phase, C.holoBase, C.holoAmp, alpha, lift));
    }

    ctx.globalCompositeOperation = opaque ? 'source-over' : 'source-atop';
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, W, H);
    neutral(ctx);
}

function paintInterference(ctx, W, H, timeMs, content) {
    const deg = C.holoAxisDeg;
    const inter = axisGradient(ctx, W, H, deg, content);
    if (!inter) return;

    const drift = timeMs / C.holoScrollMs;
    const stops = C.interStops;

    for (let i = 0; i < stops; i++) {
        const t = i / (stops - 1);
        const u = t - drift * C.interScrollRatio;
        const phase = u * C.interHueCycles + 0.5;
        const lift = C.interLightSwing * Math.sin(u * Math.PI * 2 * C.interBands);
        inter.addColorStop(t, palette(phase, C.interBase, C.interAmp, C.interAlpha, lift));
    }

    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = inter;
    ctx.fillRect(0, 0, W, H);
    neutral(ctx);
}

function sweepPosition(timeMs) {
    const t = timeMs % C.sweepCycleMs;
    if (t > C.sweepTravelMs) return -1;

    const u = t / C.sweepTravelMs;
    return u * u * (3 - 2 * u);
}

function paintSweep(ctx, W, H, timeMs, content) {
    const pos = sweepPosition(timeMs);
    if (pos < 0) return;

    const deg = C.holoAxisDeg;
    const span = 1 + C.sweepWidth * 2;

    const band = (offset, colorAt) => {
        const grad = axisGradient(ctx, W, H, deg, content);
        if (!grad) return;

        const half = C.sweepWidth / 2;
        const centre = (pos + offset) * span - C.sweepWidth;

        grad.addColorStop(0, colorAt(0));

        const SIDES = 7;
        for (let i = -SIDES; i <= SIDES; i++) {
            const at = centre + (i / SIDES) * half;
            if (at <= 0 || at >= 1) continue;
            const d = Math.abs(i) / SIDES;
            grad.addColorStop(at, colorAt(Math.cos(d * Math.PI / 2) ** 2));
        }

        grad.addColorStop(1, colorAt(0));

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    };

    ctx.globalCompositeOperation = 'lighter';
    band(C.prismOffset, (v) => `rgba(120, 90, 255, ${v * C.prismAlpha})`);
    band(-C.prismOffset, (v) => `rgba(255, 90, 170, ${v * C.prismAlpha})`);
    band(0, (v) => `rgba(255, 255, 255, ${v * C.sweepAlpha})`);
    neutral(ctx);
}

function quantiseTime(timeMs) {
    return Math.round(timeMs / C.bodyQuantMs) * C.bodyQuantMs;
}

function bodyKey(o, W, H, tq, pulse) {
    const id = (o.img && (o.img.id || o.img.src)) || 'img';
    const c = o.content;
    return `${id}|${o.sx}|${o.sy}|${o.sw}|${o.sh}|${W}|${H}|${o.channel}`
        + `|${tq}|${Math.round(pulse * 16)}`
        + `|${c.x0}|${c.y0}|${c.x1}|${c.y1}|${o.art}|${o.tint ? tintKey(o.tint) : ''}`;
}

function createSurface() {
    if (offscreenBlocked) return null;

    const canvas = globalThis.document?.createElement?.('canvas');

    let ctx = null;
    try {
        ctx = canvas?.getContext?.('2d') || null;
    } catch (e) {
        ctx = null;
    }

    if (!ctx) {
        offscreenBlocked = true;
        return null;
    }

    return { canvas, ctx, w: 0, h: 0 };
}

function takeSurface(key, W, H) {
    const hit = bodyPool.get(key);
    if (hit) {
        bodyPool.delete(key);
        bodyPool.set(key, hit);
        return { surface: hit, painted: true };
    }

    let surface = null;

    if (spareSurface) {
        surface = spareSurface;
        spareSurface = null;
    } else if (bodyPool.size >= BODY_POOL_MAX) {
        const oldest = bodyPool.keys().next().value;
        surface = bodyPool.get(oldest);
        bodyPool.delete(oldest);
    }

    surface = surface || createSurface();
    if (!surface) return null;

    if (surface.w < W || surface.h < H) {
        surface.canvas.width = Math.max(W, surface.w);
        surface.canvas.height = Math.max(H, surface.h);
        surface.w = surface.canvas.width;
        surface.h = surface.canvas.height;
    }

    bodyPool.set(key, surface);
    return { surface, painted: false };
}

function stampImage(ctx, o, W, H) {
    try {
        ctx.drawImage(o.img, o.sx, o.sy, o.sw, o.sh, 0, 0, W, H);
        return true;
    } catch (e) {
        return false;
    }
}

function paintVolume(ctx, W, H, c) {
    const shade = ctx.createLinearGradient?.(0, H * c.y0, 0, H * c.y1);
    if (!shade) return;

    const floor = to255(C.volumeFloor);
    shade.addColorStop(0, 'rgb(255,255,255)');
    shade.addColorStop(0.45, 'rgb(255,255,255)');
    shade.addColorStop(1, `rgb(${floor},${floor},${floor})`);

    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = C.volumeAlpha;
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, W, H);
    neutral(ctx);
}

function paintForm(ctx, o, W, H) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = C.formAlpha;
    ctx.filter = C.formFilter;
    stampImage(ctx, o, W, H);
    neutral(ctx);
}

function paintLuminance(ctx, o, W, H) {
    ctx.globalCompositeOperation = 'luminosity';
    ctx.filter = PORTRAIT_TONE;
    stampImage(ctx, o, W, H);
    neutral(ctx);
}

function paintHotCore(ctx, o, W, H, pulse) {
    ctx.globalCompositeOperation = 'lighter';

    const blur = C.hotBlurPx * (H / C.refH);
    ctx.globalAlpha = C.hotAlpha * pulse;
    ctx.filter = `${C.hotFilter} blur(${blur.toFixed(2)}px)`;
    stampImage(ctx, o, W, H);

    ctx.filter = C.hotFilter;
    ctx.globalAlpha = C.hotAlpha * 0.5 * pulse;
    stampImage(ctx, o, W, H);
    neutral(ctx);
}

function paintTint(ctx, tint, W, H) {
    ctx.globalCompositeOperation = 'source-atop';

    if (typeof tint === 'string') {
        ctx.fillStyle = tint;
    } else {
        const grad = tint.dir === 'horizontal'
            ? ctx.createLinearGradient(0, 0, W, 0)
            : ctx.createLinearGradient(0, 0, 0, H);
        for (const stop of tint.stops) grad.addColorStop(stop.offset, stop.color);
        ctx.fillStyle = grad;
    }

    ctx.fillRect(0, 0, W, H);
    neutral(ctx);
}

function buildBody(o, tq, pulse) {
    const W = Math.max(1, Math.ceil(Math.max(o.sw, o.dw)));
    const H = Math.max(1, Math.ceil(Math.max(o.sh, o.dh)));

    const key = bodyKey(o, W, H, tq, pulse);
    const taken = takeSurface(key, W, H);
    if (!taken) return null;

    const { surface, painted } = taken;
    if (painted) return { canvas: surface.canvas, W, H };

    const { ctx } = surface;

    if (typeof ctx.setTransform === 'function') ctx.setTransform(1, 0, 0, 1, 0, 0);
    neutral(ctx);
    ctx.clearRect(0, 0, W, H);

    if (!stampImage(ctx, o, W, H)) {
        bodyPool.delete(key);
        spareSurface = surface;
        return null;
    }

    const sprite = isSprite(o.art);

    paintFoil(ctx, W, H, tq, o.content, !sprite);
    paintInterference(ctx, W, H, tq, o.content);
    if (!sprite) paintLuminance(ctx, o, W, H);
    paintVolume(ctx, W, H, o.content);
    paintSweep(ctx, W, H, tq, o.content);

    if (sprite) {
        paintForm(ctx, o, W, H);
        paintHotCore(ctx, o, W, H, pulse);
    }

    if (o.tint) paintTint(ctx, o.tint, W, H);

    ctx.globalCompositeOperation = 'destination-in';
    stampImage(ctx, o, W, H);

    ctx.globalCompositeOperation = 'source-over';
    return { canvas: surface.canvas, W, H };
}

function drawChromaticEdge(ctx, o, timeMs, alpha) {
    const a = (timeMs / C.fringeCycleMs) * Math.PI * 2;
    const spread = C.fringePx * (o.dh / C.refH);
    const ox = Math.cos(a) * spread;
    const oy = Math.sin(a * 0.7) * spread * 0.6;

    const pairs = [
        ['rgb(255, 40, 90)', ox, oy],
        ['rgb(40, 150, 255)', -ox, -oy],
    ];

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha * C.fringeAlpha;

    for (const [color, dx, dy] of pairs) {
        const tinted = getTintedFrame(o.img, o.sx, o.sy, o.sw, o.sh, o.dw, o.dh, color);
        if (!tinted) continue;
        ctx.drawImage(tinted, o.dx + dx, o.dy + dy, o.dw, o.dh);
    }

    ctx.restore();
}

function readOpts(opts) {
    return {
        img: opts?.img || null,
        sx: Number(opts?.sx) || 0,
        sy: Number(opts?.sy) || 0,
        sw: Number(opts?.sw) || 0,
        sh: Number(opts?.sh) || 0,
        dx: Number(opts?.dx) || 0,
        dy: Number(opts?.dy) || 0,
        dw: Number(opts?.dw) || 0,
        dh: Number(opts?.dh) || 0,
        channel: opts?.channel || DEFAULT_CHANNEL,
        alpha: Number.isFinite(opts?.alpha) ? opts.alpha : 1,
        freezeMs: Number.isFinite(opts?.freezeMs) ? opts.freezeMs : null,
        paused: !!opts?.paused,
        tint: opts?.tint || null,
        content: opts?.content || FULL_BOX,
        art: ART_KINDS.has(opts?.art) ? opts.art : 'sprite',

        fringe: opts?.fringe !== false,
    };
}

export function drawRainbowSkin(ctx, opts) {
    const o = readOpts(opts);
    if (!ctx || !o.img || !o.dw || !o.dh) return false;

    const state = getRainbowState(o.channel);
    const timeMs = (o.freezeMs !== null)
        ? o.freezeMs
        : (o.paused ? hold(state) : advance(state)).timeMs;

    ctx.save();

    const ambient = Number.isFinite(ctx.globalAlpha) ? ctx.globalAlpha : 1;
    const alpha = ambient * o.alpha;

    const rimColor = steppedHoloColor(timeMs, C.rimSteps);

    const glow = isSprite(o.art)
        ? getGlowedSprite(o.img, o.sx, o.sy, o.sw, o.sh, o.dw, o.dh, rimColor, C.rimBlur)
        : null;
    if (glow) {
        ctx.globalAlpha = alpha * C.rimAlpha;
        ctx.drawImage(
            glow,
            o.dx - (glow._padX || 0),
            o.dy - (glow._padY || 0),
            glow.width,
            glow.height
        );
    }

    ctx.globalAlpha = alpha;

    if (o.fringe && isSprite(o.art)) {
        drawChromaticEdge(ctx, o, timeMs, alpha);
        ctx.globalAlpha = alpha;
    }

    const tq = quantiseTime(timeMs);
    const pulse = 1 - C.hotPulseDepth * (0.5 + 0.5 * Math.cos(
        (tq / C.hotPulseMs) * Math.PI * 2
    ));

    const body = buildBody(o, tq, pulse);

    if (body) {
        ctx.drawImage(body.canvas, 0, 0, body.W, body.H, o.dx, o.dy, o.dw, o.dh);
    } else {
        ctx.drawImage(o.img, o.sx, o.sy, o.sw, o.sh, o.dx, o.dy, o.dw, o.dh);
    }

    ctx.restore();
    return true;
}
