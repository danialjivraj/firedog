import {
    RAINBOW_FX,
    RAINBOW_FROZEN_MS,
    RAINBOW_CFG,
    getRainbowState,
    getRainbowTintColor,
    resetRainbowFx,
    drawRainbowSkin,
} from '../../game/animations/rainbowFx';
import { SKINS, SKIN_MENU_ORDER, getSkinFxId } from '../../game/config/skinsAndCosmetics';

const makeCtx = () => {
    const ctx = {
        save: jest.fn(),
        restore: jest.fn(),
        drawImage: jest.fn(),
        fillRect: jest.fn(),
        createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
        globalCompositeOperation: 'source-over',
        filter: 'none',
    };
    ctx.globalAlpha = 1;
    return ctx;
};

let surfaces = [];

function makeSurfaceCtx() {
    const log = { ops: [], filters: [], fills: [], paints: [] };

    const snap = (kind, style) => {
        log.paints.push({ kind, style, filter, op, alpha: ctx.globalAlpha });
    };

    const ctx = {
        __log: log,
        save: jest.fn(),
        restore: jest.fn(),
        setTransform: jest.fn(),
        clearRect: jest.fn(),
        drawImage: jest.fn(() => snap('draw', null)),
        fillRect: jest.fn(() => snap('fill', fillStyle)),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        clip: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
        createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
        createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
        globalAlpha: 1,
        shadowColor: 'transparent',
        shadowBlur: 0,
    };

    let op = 'source-over';
    Object.defineProperty(ctx, 'globalCompositeOperation', {
        get: () => op,
        set: (v) => { op = v; log.ops.push(v); },
    });

    let filter = 'none';
    Object.defineProperty(ctx, 'filter', {
        get: () => filter,
        set: (v) => { filter = v; log.filters.push(v); },
    });

    let fillStyle = '';
    Object.defineProperty(ctx, 'fillStyle', {
        get: () => fillStyle,
        set: (v) => { fillStyle = v; log.fills.push(v); },
    });

    return ctx;
}

function stubCanvases({ working = true } = {}) {
    const real = document.createElement.bind(document);

    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (String(tag).toLowerCase() !== 'canvas') return real(tag);

        const ctx = working ? makeSurfaceCtx() : null;
        if (ctx) surfaces.push(ctx);

        return { width: 0, height: 0, getContext: jest.fn(() => ctx) };
    });
}

const bodySurfaces = () => surfaces.filter((s) => s.__log.ops.includes('destination-in'));
const lastBody = () => bodySurfaces()[bodySurfaces().length - 1];

const img = { id: 'rainbowSkin', tagName: 'IMG' };

const baseOpts = (overrides = {}) => ({
    img,
    sx: 0,
    sy: 0,
    sw: 100,
    sh: 92,
    dx: 0,
    dy: 0,
    dw: 100,
    dh: 92,
    channel: 'test',
    ...overrides,
});

describe('rainbow fx', () => {
    let now;

    beforeEach(() => {
        resetRainbowFx();
        surfaces = [];
        now = 1000;
        jest.spyOn(performance, 'now').mockImplementation(() => now);
        stubCanvases();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        resetRainbowFx();
    });

    const advanceBy = (ms, opts = {}) => {
        now += ms;
        drawRainbowSkin(makeCtx(), baseOpts(opts));
    };

    describe('skin wiring', () => {
        it('reuses the default sprite sheet through its own element id', () => {
            expect(SKINS.rainbowSkin.spriteId).toBe('rainbowSkin');
            expect(SKINS.rainbowSkin.spriteId).not.toBe(SKINS.defaultSkin.spriteId);
        });

        it('is listed in the wardrobe, last', () => {
            expect(SKIN_MENU_ORDER).toContain('rainbowSkin');
            expect(SKIN_MENU_ORDER[SKIN_MENU_ORDER.length - 1]).toBe('rainbowSkin');
        });

        it('only reports an fx id for skins that have one', () => {
            expect(getSkinFxId('rainbowSkin')).toBe(RAINBOW_FX);
            expect(getSkinFxId('defaultSkin')).toBeNull();
            expect(getSkinFxId('nopeSkin')).toBeNull();
        });
    });

    describe('channels', () => {
        it('keeps one state per channel', () => {
            const a = getRainbowState('player');
            const b = getRainbowState('menu');

            expect(getRainbowState('player')).toBe(a);
            expect(b).not.toBe(a);
        });

        it('resets a single channel without touching the others', () => {
            const player = getRainbowState('player');
            const menu = getRainbowState('menu');

            resetRainbowFx('player');

            expect(getRainbowState('player')).not.toBe(player);
            expect(getRainbowState('menu')).toBe(menu);
        });
    });

    describe('clock', () => {
        it('advances with wall-clock time, so every draw site animates', () => {
            const state = getRainbowState('test');

            advanceBy(0);
            expect(state.timeMs).toBe(0);

            advanceBy(50);
            expect(state.timeMs).toBe(50);

            advanceBy(30);
            expect(state.timeMs).toBe(80);
        });

        it('clamps a long stall to one step so the colours do not jump', () => {
            const state = getRainbowState('test');

            advanceBy(0);
            const before = state.timeMs;

            advanceBy(60000);

            expect(state.timeMs - before).toBe(RAINBOW_CFG.maxStepMs);
        });

        it('ignores a clock that goes backwards', () => {
            const state = getRainbowState('test');

            advanceBy(100);
            const before = state.timeMs;

            advanceBy(-500);

            expect(state.timeMs).toBe(before);
        });
    });

    describe('frozen draws', () => {
        it('holds a fixed instant without touching the channel clock', () => {
            const state = getRainbowState('test');

            advanceBy(0);
            now += 500;
            drawRainbowSkin(makeCtx(), baseOpts({ freezeMs: RAINBOW_FROZEN_MS }));

            expect(state.timeMs).toBe(0);
        });

        it('leaves the live animation on the same channel running', () => {
            const state = getRainbowState('test');

            advanceBy(0);
            drawRainbowSkin(makeCtx(), baseOpts({ freezeMs: RAINBOW_FROZEN_MS }));
            now += 80;
            drawRainbowSkin(makeCtx(), baseOpts());

            expect(state.timeMs).toBe(80);
        });

        it('parks the held instant outside the sweep, so no preview is caught mid-shine', () => {
            drawRainbowSkin(makeCtx(), baseOpts({ freezeMs: RAINBOW_FROZEN_MS }));
            const held = lastBody().createLinearGradient.mock.calls.length;

            surfaces = [];
            const midSweep = Math.round(RAINBOW_CFG.sweepTravelMs / 2);
            drawRainbowSkin(makeCtx(), baseOpts({ freezeMs: midSweep }));

            expect(lastBody().createLinearGradient.mock.calls.length).toBe(held + 3);
        });

        it('still draws when frozen', () => {
            const ctx = makeCtx();
            expect(drawRainbowSkin(ctx, baseOpts({ freezeMs: RAINBOW_FROZEN_MS }))).toBe(true);
            expect(ctx.drawImage).toHaveBeenCalled();
        });
    });

    describe('pausing', () => {
        it('holds the clock while paused', () => {
            const state = getRainbowState('test');

            advanceBy(0);
            advanceBy(50);
            expect(state.timeMs).toBe(50);

            now += 500;
            drawRainbowSkin(makeCtx(), baseOpts({ paused: true }));

            expect(state.timeMs).toBe(50);
        });

        it('resumes without a jump, however long the pause was', () => {
            const state = getRainbowState('test');

            advanceBy(0);
            for (let i = 0; i < 10; i++) {
                now += 1000;
                drawRainbowSkin(makeCtx(), baseOpts({ paused: true }));
            }
            expect(state.timeMs).toBe(0);

            now += 16;
            advanceBy(0);

            expect(state.timeMs).toBe(16);
        });

        it('keeps running when not paused', () => {
            const state = getRainbowState('test');

            advanceBy(0);
            now += 40;
            drawRainbowSkin(makeCtx(), baseOpts({ paused: false }));

            expect(state.timeMs).toBe(40);
        });
    });

    describe('paint passes', () => {
        it('lays the foil down and clips it back to the sprite', () => {
            drawRainbowSkin(makeCtx(), baseOpts());
            const body = lastBody();

            expect(body.clearRect).toHaveBeenCalled();
            expect(body.__log.ops).toEqual(expect.arrayContaining([
                'source-atop',     // foil, inside the silhouette
                'soft-light',      // interference
                'multiply',        // volume shading
                'lighter',         // form and hot core
                'destination-in',  // mask
            ]));
            expect(body.__log.ops[body.__log.ops.length - 1]).toBe('source-over');
        });

        it('stamps the portrait luminance back, and skips the sprite-only passes', () => {
            drawRainbowSkin(makeCtx(), baseOpts({ art: 'portrait' }));
            const portrait = lastBody().__log;

            expect(portrait.ops).toContain('luminosity');
            expect(portrait.filters).not.toContain(RAINBOW_CFG.formFilter);

            surfaces = [];
            drawRainbowSkin(makeCtx(), baseOpts());
            const sprite = lastBody().__log;

            expect(sprite.ops).not.toContain('luminosity');
            expect(sprite.filters).toContain(RAINBOW_CFG.formFilter);
        });

        it('shades volume across the art, not the empty frame around it', () => {
            const content = { x0: 0, y0: 0.25, x1: 1, y1: 1 };
            drawRainbowSkin(makeCtx(), baseOpts({ art: 'portrait', content }));

            expect(lastBody().createLinearGradient)
                .toHaveBeenCalledWith(0, 92 * content.y0, 0, 92 * content.y1);
        });

        it('paints a flat tint over the body when one is given', () => {
            drawRainbowSkin(makeCtx(), baseOpts({ tint: 'rgba(0,100,0,0.40)' }));
            expect(lastBody().__log.fills).toContain('rgba(0,100,0,0.40)');
        });

        it('paints the tint in its own colour, not through the hot core filter', () => {
            const tint = 'rgba(0,100,0,0.40)';
            drawRainbowSkin(makeCtx(), baseOpts({ tint }));

            const laid = lastBody().__log.paints.find((p) => p.style === tint);

            expect(laid).toBeDefined();
            expect(laid.op).toBe('source-atop');
            expect(laid.filter).toBe('none');
            expect(laid.alpha).toBe(1);
        });

        it('hands every pass a neutral surface, whatever the pass before it set', () => {
            for (const extra of [{}, { art: 'portrait' }, { tint: 'rgba(0,120,255,0.35)' }]) {
                surfaces = [];
                resetRainbowFx();
                drawRainbowSkin(makeCtx(), baseOpts(extra));

                const paints = lastBody().__log.paints;
                const mask = paints[paints.length - 1];

                expect(mask.op).toBe('destination-in');
                expect(mask.filter).toBe('none');
                expect(mask.alpha).toBe(1);
            }
        });

        it('drops the chromatic fringe when the caller asks for none', () => {
            const withFringe = makeCtx();
            drawRainbowSkin(withFringe, baseOpts());

            const without = makeCtx();
            drawRainbowSkin(without, baseOpts({ fringe: false, freezeMs: RAINBOW_FROZEN_MS }));

            expect(without.drawImage.mock.calls.length)
                .toBeLessThan(withFringe.drawImage.mock.calls.length);
        });
    });

    describe('body pool', () => {
        it('repaints nothing when the same body is asked for twice', () => {
            drawRainbowSkin(makeCtx(), baseOpts({ freezeMs: RAINBOW_FROZEN_MS }));
            const body = lastBody();
            expect(body.clearRect).toHaveBeenCalledTimes(1);

            drawRainbowSkin(makeCtx(), baseOpts({ freezeMs: RAINBOW_FROZEN_MS }));

            expect(body.clearRect).toHaveBeenCalledTimes(1);
            expect(bodySurfaces()).toHaveLength(1);
        });

        it('keeps a frozen preview painted while an animated one churns beside it', () => {
            const icon = baseOpts({ freezeMs: RAINBOW_FROZEN_MS, dw: 50, dh: 46 });

            drawRainbowSkin(makeCtx(), icon);
            const frozen = lastBody();

            for (let i = 0; i < 3; i++) {
                now += 100;
                drawRainbowSkin(makeCtx(), baseOpts());
            }

            drawRainbowSkin(makeCtx(), icon);

            expect(frozen.clearRect).toHaveBeenCalledTimes(1);
        });

        it('recycles surfaces instead of allocating one per animated frame', () => {
            for (let i = 0; i < 30; i++) {
                now += 100;
                drawRainbowSkin(makeCtx(), baseOpts());
            }

            expect(bodySurfaces().length).toBeLessThanOrEqual(6);
        });
    });

    describe('refresh rate', () => {
        const runFor = (channel, hz, seconds) => {
            const step = 1000 / hz;
            drawRainbowSkin(makeCtx(), baseOpts({ channel }));

            for (let i = 0; i < hz * seconds; i++) {
                now += step;
                drawRainbowSkin(makeCtx(), baseOpts({ channel }));
            }
        };

        const paintCount = () => bodySurfaces()
            .reduce((n, s) => n + s.clearRect.mock.calls.length, 0);

        it('animates on wall-clock time, so 60Hz and 144Hz reach the same colour', () => {
            runFor('sixty', 60, 1);
            runFor('one-forty-four', 144, 1);

            expect(getRainbowState('sixty').timeMs).toBeCloseTo(1000, 6);
            expect(getRainbowState('one-forty-four').timeMs).toBeCloseTo(1000, 6);
            expect(getRainbowTintColor('sixty')).toBe(getRainbowTintColor('one-forty-four'));
        });

        it('repaints on its own cadence, so a faster monitor costs no more', () => {
            surfaces = [];
            runFor('slow', 60, 1);
            const slow = paintCount();

            surfaces = [];
            runFor('fast', 240, 1);

            expect(paintCount()).toBeLessThanOrEqual(slow + 2);
        });
    });

    describe('drawing', () => {
        it('refuses to draw without a context, image or size', () => {
            const ctx = makeCtx();

            expect(drawRainbowSkin(null, baseOpts())).toBe(false);
            expect(drawRainbowSkin(ctx, baseOpts({ img: null }))).toBe(false);
            expect(drawRainbowSkin(ctx, baseOpts({ dw: 0 }))).toBe(false);
            expect(ctx.drawImage).not.toHaveBeenCalled();
        });

        it('falls back to a plain drawImage when no offscreen canvas exists', () => {
            jest.restoreAllMocks();
            jest.spyOn(performance, 'now').mockImplementation(() => now);
            stubCanvases({ working: false });
            resetRainbowFx();

            const ctx = makeCtx();

            expect(drawRainbowSkin(ctx, baseOpts())).toBe(true);
            expect(ctx.drawImage.mock.calls[ctx.drawImage.mock.calls.length - 1])
                .toEqual([img, 0, 0, 100, 92, 0, 0, 100, 92]);
            expect(bodySurfaces()).toHaveLength(0);
        });

        it('draws the body at the destination it was given', () => {
            const ctx = makeCtx();
            drawRainbowSkin(ctx, baseOpts({ dx: 40, dy: -25 }));

            const body = ctx.drawImage.mock.calls[ctx.drawImage.mock.calls.length - 1];
            expect(body[5]).toBe(40);
            expect(body[6]).toBe(-25);
        });

        it('honours the alpha it was given', () => {
            const ctx = makeCtx();
            drawRainbowSkin(ctx, baseOpts({ alpha: 0.5 }));
            expect(ctx.globalAlpha).toBe(0.5);
        });

        it('fades inside the alpha the caller had already set, rather than replacing it', () => {
            const ctx = makeCtx();
            ctx.globalAlpha = 0.5;

            drawRainbowSkin(ctx, baseOpts({ alpha: 0.5 }));

            expect(ctx.globalAlpha).toBeCloseTo(0.25);
        });
    });
});
