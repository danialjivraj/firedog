import { DistortionEffect } from '../../game/animations/distortion';

describe('DistortionEffect', () => {
    let game;
    let effect;

    let createdCanvases;
    let srcCtx;
    let dstCtx;
    let mainCtx;

    const makeImageData = (w, h, fill = 0) => {
        const data = new Uint8ClampedArray(w * h * 4);
        if (fill !== 0) data.fill(fill);
        return { width: w, height: h, data };
    };

    beforeEach(() => {
        createdCanvases = [];

        srcCtx = {
            clearRect: jest.fn(),
            drawImage: jest.fn(),
            getImageData: jest.fn(),
            createImageData: jest.fn(),
        };

        dstCtx = {
            putImageData: jest.fn(),
            clearRect: jest.fn(),
        };

        jest.spyOn(document, 'createElement').mockImplementation((tag) => {
            if (tag !== 'canvas') {
                return { tagName: tag.toUpperCase() };
            }

            const index = createdCanvases.length;
            const canvas = {
                width: 0,
                height: 0,
                getContext: jest.fn((type) => {
                    if (type !== '2d') return null;
                    return index === 0 ? srcCtx : dstCtx;
                }),
            };

            createdCanvases.push(canvas);
            return canvas;
        });

        game = {
            width: 1000,
            height: 500,
            player: { x: 100, y: 0, width: 50, height: 50 },
            boss: { id: 'none', current: null },
            distortionActive: false,
        };

        effect = new DistortionEffect(game, {
            quality: 1,
            vortexCount: 2,
            minRadius: 2,
            maxRadius: 2,
            bandMargin: 0,
            applyIntervalMs: 33,
            bandSpeed: 100,
        });

        mainCtx = {
            canvas: { width: 4, height: 4 },
            save: jest.fn(),
            restore: jest.fn(),
            clearRect: jest.fn(),
            drawImage: jest.fn(),
            imageSmoothingEnabled: false,
            imageSmoothingQuality: '',
        };

        const src = makeImageData(4, 4);
        for (let i = 0; i < src.data.length; i++) src.data[i] = i % 256;

        srcCtx.getImageData.mockReturnValue(src);
        srcCtx.createImageData.mockImplementation((w, h) => makeImageData(w, h));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('constructor', () => {
        it('creates src/dst canvases and 2d contexts', () => {
            expect(document.createElement).toHaveBeenCalledWith('canvas');
            expect(createdCanvases).toHaveLength(2);

            expect(effect.srcCanvas).toBe(createdCanvases[0]);
            expect(effect.dstCanvas).toBe(createdCanvases[1]);

            expect(effect.srcCtx).toBe(srcCtx);
            expect(effect.dstCtx).toBe(dstCtx);
        });

        it('initializes defaults and state', () => {
            expect(effect.amount).toBe(0);
            expect(effect._timeSinceApply).toBe(0);
            expect(effect.vortices).toEqual([]);
            expect(effect.bandX).toBe(0);
            expect(effect.bandDir).toBe(1);
        });
    });

    describe('isVisible', () => {
        it('is false when amount <= 0.04 and true when amount > 0.04', () => {
            effect.amount = 0.04;
            expect(effect.isVisible).toBe(false);

            effect.amount = 0.041;
            expect(effect.isVisible).toBe(true);
        });
    });

    describe('update(deltaTime)', () => {
        it('eases amount toward 1 when distortionActive is true', () => {
            game.distortionActive = true;

            const a0 = effect.amount;
            effect.update(1000);
            const a1 = effect.amount;
            effect.update(1000);
            const a2 = effect.amount;

            expect(a1).toBeGreaterThan(a0);
            expect(a2).toBeGreaterThan(a1);
            expect(a2).toBeLessThanOrEqual(1);
        });

        it('eases amount toward 0 when distortionActive is false', () => {
            effect.amount = 0.8;

            game.distortionActive = false;
            effect.update(1000);

            expect(effect.amount).toBeLessThan(0.8);
            expect(effect.amount).toBeGreaterThanOrEqual(0);
        });

        it('when becoming active, starts band at player and initializes vortices', () => {
            const startSpy = jest.spyOn(effect, '_startBandAtPlayer');
            const initSpy = jest.spyOn(effect, '_initVortices');

            game.distortionActive = true;

            effect.update(0);

            expect(startSpy).toHaveBeenCalled();
            expect(initSpy).toHaveBeenCalled();
            expect(effect.vortices.length).toBe(2);

            expect(effect.bandX).toBe(100 + 25);
        });

        it('re-initializes vortices if active and vortices array is empty', () => {
            game.distortionActive = true;
            effect.vortices.length = 0;
            effect._wasActive = true;

            const initSpy = jest.spyOn(effect, '_initVortices');
            effect.update(0);

            expect(initSpy).toHaveBeenCalled();
            expect(effect.vortices.length).toBe(2);
        });

        it('moves the band and clamps/reflects direction at edges when amount > 0.001', () => {
            game.distortionActive = true;

            effect.amount = 0.5;
            effect.vortices = [{ x: 0, y: 10, r: 2, spin: 1 }];
            effect._wasActive = true;

            effect.bandX = 1;
            effect.bandDir = -1;

            effect.update(1000);

            expect(effect.bandX).toBe(0);
            expect(effect.bandDir).toBe(1);
            expect(effect.vortices[0].x).toBe(0);

            effect.bandX = game.width - 1;
            effect.bandDir = 1;

            effect.update(1000);

            expect(effect.bandX).toBe(game.width);
            expect(effect.bandDir).toBe(-1);
            expect(effect.vortices[0].x).toBe(game.width);
        });

        it('doubles band speed in ntharax mode2', () => {
            game.distortionActive = true;

            effect.amount = 0.5;
            effect.vortices = [{ x: 0, y: 10, r: 2, spin: 1 }];
            effect._wasActive = true;

            game.boss = { id: 'ntharax', current: { mode2Active: true } };

            effect.bandX = 500;
            effect.bandDir = 1;

            effect.update(1000);
            expect(effect.bandX).toBeCloseTo(700, 5);
        });

        it('increments _timeSinceApply by deltaTime', () => {
            effect._timeSinceApply = 10;
            effect.update(25);
            expect(effect._timeSinceApply).toBe(35);
        });
    });

    describe('apply(ctx)', () => {
        it('does nothing when not visible', () => {
            effect.amount = 0.01;
            effect.vortices = [{ x: 10, y: 10, r: 2, spin: 1 }];

            effect.apply(mainCtx);

            expect(mainCtx.drawImage).not.toHaveBeenCalled();
            expect(srcCtx.getImageData).not.toHaveBeenCalled();
            expect(dstCtx.putImageData).not.toHaveBeenCalled();
        });

        it('does nothing when visible but vortices are empty', () => {
            effect.amount = 1;
            effect.vortices.length = 0;

            effect.apply(mainCtx);

            expect(mainCtx.drawImage).not.toHaveBeenCalled();
            expect(srcCtx.getImageData).not.toHaveBeenCalled();
            expect(dstCtx.putImageData).not.toHaveBeenCalled();
        });

        it('when called before applyIntervalMs, draws cached dstCanvas without recomputing', () => {
            effect.amount = 1;
            effect.vortices = [{ x: 10, y: 10, r: 2, spin: 1 }];

            effect._w = 4;
            effect._h = 4;
            effect._timeSinceApply = 10;

            effect.apply(mainCtx);

            expect(mainCtx.save).toHaveBeenCalled();
            expect(mainCtx.drawImage).toHaveBeenCalledWith(
                effect.dstCanvas,
                0,
                0,
                4,
                4,
                0,
                0,
                4,
                4
            );
            expect(mainCtx.restore).toHaveBeenCalled();

            expect(srcCtx.getImageData).not.toHaveBeenCalled();
            expect(dstCtx.putImageData).not.toHaveBeenCalled();
        });

        it('recomputes distortion when applyIntervalMs has elapsed and draws to the main canvas', () => {
            effect.amount = 1;
            effect._timeSinceApply = 999;

            effect.bandX = 2;
            effect.vortices = [{ x: 2, y: 2, r: 2, spin: 1 }];

            effect.apply(mainCtx);

            expect(effect._w).toBe(4);
            expect(effect._h).toBe(4);
            expect(srcCtx.createImageData).toHaveBeenCalledWith(4, 4);

            expect(srcCtx.getImageData).toHaveBeenCalledWith(0, 0, 4, 4);
            expect(dstCtx.putImageData).toHaveBeenCalled();

            expect(mainCtx.clearRect).toHaveBeenCalledWith(0, 0, 4, 4);
            expect(mainCtx.drawImage).toHaveBeenCalledWith(
                effect.dstCanvas,
                0,
                0,
                4,
                4,
                0,
                0,
                4,
                4
            );

            expect(effect._timeSinceApply).toBe(0);
        });
    });

    describe('reset()', () => {
        it('clears effect state, empties vortices, and clears backing contexts', () => {
            effect.amount = 0.9;
            effect._timeSinceApply = 123;
            effect.vortices = [{ x: 1, y: 2, r: 3, spin: 1 }];
            effect._wasActive = true;

            effect._w = 10;
            effect._h = 20;

            effect.reset();

            expect(effect.amount).toBe(0);
            expect(effect._timeSinceApply).toBe(0);
            expect(effect.vortices).toHaveLength(0);
            expect(effect._wasActive).toBe(false);

            expect(dstCtx.clearRect).toHaveBeenCalledWith(0, 0, 10, 20);
            expect(srcCtx.clearRect).toHaveBeenCalledWith(0, 0, 10, 20);
        });
    });
});
