import { RecordToast } from '../../game/animations/recordToast.js';

describe('RecordToast', () => {
    let ctx2d;
    let lastCreatedCanvas;

    const makeMock2dCtx = () => {
        const ctx = {
            save: jest.fn(),
            restore: jest.fn(),

            font: '',
            textAlign: '',
            textBaseline: '',
            measureText: jest.fn((text) => ({ width: String(text).length * 10 })),
            strokeText: jest.fn(),
            fillText: jest.fn(),

            setTransform: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),

            drawImage: jest.fn(),

            shadowColor: '',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            lineWidth: 0,
            strokeStyle: '',
            fillStyle: '',

            _alpha: 1,
        };

        Object.defineProperty(ctx, 'globalAlpha', {
            get() {
                return ctx._alpha;
            },
            set(v) {
                ctx._alpha = v;
            },
        });

        return ctx;
    };

    const clearCtxCalls = () => {
        ctx2d.save.mockClear();
        ctx2d.restore.mockClear();
        ctx2d.measureText.mockClear();
        ctx2d.strokeText.mockClear();
        ctx2d.fillText.mockClear();
        ctx2d.setTransform.mockClear();
        ctx2d.translate.mockClear();
        ctx2d.scale.mockClear();
        ctx2d.drawImage.mockClear();
        ctx2d._alpha = 1;
    };

    const makeGame = (overrides = {}) => ({
        width: 800,
        height: 600,
        ...overrides,
    });

    const makeToast = (game, text, opts) => {
        const toast = new RecordToast(game, text, opts);
        clearCtxCalls();
        return toast;
    };

    beforeAll(() => {
        ctx2d = makeMock2dCtx();

        const originalCreateElement = document.createElement.bind(document);

        jest.spyOn(document, 'createElement').mockImplementation((tag) => {
            if (tag !== 'canvas') return originalCreateElement(tag);

            const canvas = {
                width: 0,
                height: 0,
                getContext: jest.fn(() => ctx2d),
            };

            lastCreatedCanvas = canvas;
            return canvas;
        });
    });

    afterAll(() => {
        if (document.createElement.mockRestore) document.createElement.mockRestore();
    });

    beforeEach(() => {
        lastCreatedCanvas = null;
        clearCtxCalls();
    });

    it('constructor sets defaults and keeps original text value; richLines use string text + default fill', () => {
        const game = makeGame({ width: 1000, height: 500 });
        const toast = makeToast(game, 123);

        expect(toast.game).toBe(game);

        expect(toast.text).toBe(123);

        expect(toast.richLines).toEqual([[{ text: '123', fill: 'yellow' }]]);

        expect(toast.x).toBe(game.width / 2);
        expect(toast.y).toBe(100);

        expect(toast.durationMs).toBe(7000);
        expect(toast.inMs).toBeGreaterThanOrEqual(1);
        expect(toast.outMs).toBeGreaterThanOrEqual(1);

        expect(toast.padding).toBeGreaterThanOrEqual(0);
        expect(toast.cacheScale).toBeGreaterThanOrEqual(1);

        expect(toast.age).toBe(0);
        expect(toast.markedForDeletion).toBe(false);
    });

    it('constructor clamps inMs/outMs to at least 1, padding >= 0, cacheScale >= 1', () => {
        const game = makeGame();

        const toast = makeToast(game, 'X', {
            inMs: 0,
            outMs: -50,
            padding: -999,
            cacheScale: 0,
        });

        expect(toast.inMs).toBe(1);
        expect(toast.outMs).toBe(1);
        expect(toast.padding).toBe(0);
        expect(toast.cacheScale).toBe(1);
    });

    it('_normalizeToRichLines: null/undefined becomes one empty line using default fill', () => {
        const game = makeGame();

        const toastA = makeToast(game, null);
        expect(toastA.richLines).toEqual([[{ text: '', fill: 'yellow' }]]);

        const toastB = makeToast(game, undefined);
        expect(toastB.richLines).toEqual([[{ text: '', fill: 'yellow' }]]);
    });

    it('_normalizeToRichLines: array mode supports non-array lines and array-of-segments lines', () => {
        const game = makeGame();

        const rich = [
            { text: 999, fill: 'cyan' },
            'plain',
            [
                { text: 'A', fill: 'red' },
                { text: 123 },
            ],
        ];

        const toast = makeToast(game, rich);

        expect(toast.richLines).toEqual([
            [{ text: '999', fill: 'cyan' }],
            [{ text: 'plain', fill: undefined }],
            [
                { text: 'A', fill: 'red' },
                { text: '123', fill: undefined },
            ],
        ]);
    });

    it('_getFontSizePx returns parsed px size or default 48', () => {
        const game = makeGame();

        const toastA = makeToast(game, 'X', { font: 'bold 60px Something' });
        expect(toastA._getFontSizePx()).toBe(60);

        const toastB = makeToast(game, 'X', { font: 'no px here' });
        expect(toastB._getFontSizePx()).toBe(48);
    });

    it('clamp01 clamps below 0 and above 1', () => {
        const toast = makeToast(makeGame(), 'X');

        expect(toast.clamp01(-1)).toBe(0);
        expect(toast.clamp01(0)).toBe(0);
        expect(toast.clamp01(0.5)).toBe(0.5);
        expect(toast.clamp01(1)).toBe(1);
        expect(toast.clamp01(2)).toBe(1);
    });

    it('bell returns 0 at 0/1 and ~1 at 0.5', () => {
        const toast = makeToast(makeGame(), 'X');

        expect(toast.bell(0)).toBeCloseTo(0, 6);
        expect(toast.bell(1)).toBeCloseTo(0, 6);
        expect(toast.bell(0.5)).toBeCloseTo(1, 6);
    });

    it('easeOutBack is 0 at t=0 and 1 at t=1 (approximately)', () => {
        const toast = makeToast(makeGame(), 'X');

        expect(toast.easeOutBack(0)).toBeCloseTo(0, 6);
        expect(toast.easeOutBack(1)).toBeCloseTo(1, 6);
    });

    it('_buildCache creates a canvas cache and sets cache sizes', () => {
        const game = makeGame();

        const toast = new RecordToast(game, 'HELLO\nWORLD', {
            font: 'bold 50px Test',
            lineSpacing: 1.2,
            padding: 10,
            cacheScale: 2,
            shadowBlur: 5,
            strokeWidth: 3,
        });

        expect(toast._cache).toBeTruthy();
        expect(lastCreatedCanvas).toBeTruthy();
        expect(lastCreatedCanvas.width).toBeGreaterThan(0);
        expect(lastCreatedCanvas.height).toBeGreaterThan(0);
        expect(toast._cacheW).toBeGreaterThan(0);
        expect(toast._cacheH).toBeGreaterThan(0);

        expect(ctx2d.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    });

    it('_buildCache renders rich segments: strokeText/fillText per segment and advances xCursor by segment width', () => {
        const game = makeGame();

        const rich = [
            [
                { text: 'A', fill: 'red' },
                { text: 'BB', fill: 'blue' },
            ],
        ];

        const toast = new RecordToast(game, rich, {
            font: '10px Test',
            lineSpacing: 1,
            padding: 0,
            cacheScale: 1,
            shadowBlur: 0,
            strokeWidth: 0,
        });

        expect(toast._cache).toBeTruthy();
        expect(toast._cacheW).toBeGreaterThan(0);
        expect(toast._cacheH).toBeGreaterThan(0);

        expect(ctx2d.measureText).toHaveBeenCalledWith('A');
        expect(ctx2d.measureText).toHaveBeenCalledWith('BB');

        expect(ctx2d.strokeText).toHaveBeenCalledTimes(2);
        expect(ctx2d.fillText).toHaveBeenCalledTimes(2);

        const s0 = ctx2d.strokeText.mock.calls[0]; // ['A', x, y]
        const s1 = ctx2d.strokeText.mock.calls[1]; // ['BB', x, y]
        expect(s0[0]).toBe('A');
        expect(s1[0]).toBe('BB');

        expect(s0[1]).toBeCloseTo(0, 6);
        expect(s1[1]).toBeCloseTo(10, 6);

        const f0 = ctx2d.fillText.mock.calls[0];
        const f1 = ctx2d.fillText.mock.calls[1];
        expect(f0[0]).toBe('A');
        expect(f1[0]).toBe('BB');
        expect(f0[1]).toBeCloseTo(0, 6);
        expect(f1[1]).toBeCloseTo(10, 6);
    });

    it('update increments age with non-negative deltaTime and marks for deletion at durationMs', () => {
        const toast = makeToast(makeGame(), 'X', { durationMs: 100 });

        toast.update(-50);
        expect(toast.age).toBe(0);
        expect(toast.markedForDeletion).toBe(false);

        toast.update(40);
        expect(toast.age).toBe(40);
        expect(toast.markedForDeletion).toBe(false);

        toast.update(60);
        expect(toast.age).toBe(100);
        expect(toast.markedForDeletion).toBe(true);
    });

    it('draw() does nothing if markedForDeletion or cache missing', () => {
        const game = makeGame();

        const toast = makeToast(game, 'X');
        toast.markedForDeletion = true;

        toast.draw(ctx2d);

        expect(ctx2d.save).not.toHaveBeenCalled();
        expect(ctx2d.drawImage).not.toHaveBeenCalled();

        const toast2 = makeToast(game, 'Y');
        toast2._cache = null;
        toast2.markedForDeletion = false;

        toast2.draw(ctx2d);

        expect(ctx2d.save).not.toHaveBeenCalled();
        expect(ctx2d.drawImage).not.toHaveBeenCalled();
    });

    it('draw() sets globalAlpha for fade-in region (age < inMs)', () => {
        const game = makeGame();
        const toast = makeToast(game, 'X', { inMs: 200, durationMs: 1000 });

        toast.age = 50; // alpha = 0.25
        toast.draw(ctx2d);

        expect(ctx2d.save).toHaveBeenCalledTimes(1);
        expect(ctx2d.restore).toHaveBeenCalledTimes(1);
        expect(ctx2d._alpha).toBeCloseTo(0.25, 5);

        expect(ctx2d.translate).toHaveBeenCalledWith(toast.x, toast.y);
        expect(ctx2d.drawImage).toHaveBeenCalledTimes(1);
    });

    it('draw() sets globalAlpha for steady region (between fade-in and fade-out)', () => {
        const game = makeGame();
        const toast = makeToast(game, 'X', { inMs: 200, outMs: 200, durationMs: 2000 });

        toast.age = 500; // fully visible
        toast.draw(ctx2d);

        expect(ctx2d._alpha).toBeCloseTo(1, 6);
        expect(ctx2d.drawImage).toHaveBeenCalledTimes(1);
    });

    it('draw() sets globalAlpha for fade-out region (age > durationMs - outMs)', () => {
        const game = makeGame();
        const toast = makeToast(game, 'X', { inMs: 200, outMs: 400, durationMs: 2000 });

        // 2000 - 400 = 1600, pick 1800 => alpha = (2000-1800)/400 = 0.5
        toast.age = 1800;
        toast.draw(ctx2d);

        expect(ctx2d._alpha).toBeCloseTo(0.5, 5);
        expect(ctx2d.drawImage).toHaveBeenCalledTimes(1);
    });

    it('draw() applies translate + scale (non-zero) and draws cached bitmap centered', () => {
        const game = makeGame();
        const toast = makeToast(game, 'X', { inMs: 200, durationMs: 2000 });

        toast.age = 100; // in fade-in, pop scaling > 0
        toast.draw(ctx2d);

        expect(ctx2d.translate).toHaveBeenCalledWith(toast.x, toast.y);
        expect(ctx2d.scale).toHaveBeenCalledTimes(1);

        const [sx, sy] = ctx2d.scale.mock.calls[0];
        expect(sx).toBeGreaterThan(0);
        expect(sy).toBeGreaterThan(0);

        expect(ctx2d.drawImage).toHaveBeenCalledTimes(1);

        const call = ctx2d.drawImage.mock.calls[0];
        expect(call[0]).toBe(toast._cache);
        expect(call[1]).toBeCloseTo(-toast._cacheW / 2, 6);
        expect(call[2]).toBeCloseTo(-toast._cacheH / 2, 6);
        expect(call[3]).toBeCloseTo(toast._cacheW, 6);
        expect(call[4]).toBeCloseTo(toast._cacheH, 6);
    });
});