import { getContentBox } from '../../game/utils/spriteCache';

function makeFrame(w, h, isOpaque) {
    const data = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            data[(y * w + x) * 4 + 3] = isOpaque(x, y) ? 255 : 0;
        }
    }
    return data;
}

function stubCanvas(data) {
    const ctx = {
        drawImage: jest.fn(),
        getImageData: jest.fn(() => ({ data })),
    };

    const real = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag) => (
        String(tag).toLowerCase() === 'canvas'
            ? { width: 0, height: 0, getContext: jest.fn(() => ctx) }
            : real(tag)
    ));

    return ctx;
}

describe('getContentBox', () => {
    afterEach(() => jest.restoreAllMocks());

    it('returns null for an image it cannot measure', () => {
        expect(getContentBox(null)).toBeNull();
        expect(getContentBox({})).toBeNull();
    });

    it('measures the opaque art as a fraction of the frame', () => {
        stubCanvas(makeFrame(4, 4, (x, y) => x >= 1 && x <= 2 && y >= 1 && y <= 2));

        expect(getContentBox({ id: 'middle-square', naturalWidth: 4, naturalHeight: 4 }))
            .toEqual({ x0: 0.25, y0: 0.25, x1: 0.75, y1: 0.75 });
    });

    it('reports no box for a fully transparent frame', () => {
        stubCanvas(makeFrame(4, 4, () => false));

        expect(getContentBox({ id: 'all-empty', naturalWidth: 4, naturalHeight: 4 })).toBeNull();
    });

    it('reads the pixels once per image', () => {
        const ctx = stubCanvas(makeFrame(4, 4, () => true));
        const img = { id: 'measure-once', naturalWidth: 4, naturalHeight: 4 };

        expect(getContentBox(img)).toEqual(getContentBox(img));
        expect(ctx.getImageData).toHaveBeenCalledTimes(1);
    });

    it('measures again later rather than caching an image that is still decoding', () => {
        const ctx = stubCanvas(makeFrame(4, 4, () => true));
        const img = { id: 'slow-decode', naturalWidth: 0, naturalHeight: 0 };

        expect(getContentBox(img)).toBeNull();
        expect(ctx.getImageData).not.toHaveBeenCalled();

        img.naturalWidth = 4;
        img.naturalHeight = 4;

        expect(getContentBox(img)).toEqual({ x0: 0, y0: 0, x1: 1, y1: 1 });
    });

    it('measures again after a read that threw, rather than caching the failure', () => {
        const ctx = stubCanvas(makeFrame(4, 4, () => true));
        const img = { id: 'throws-once', naturalWidth: 4, naturalHeight: 4 };

        ctx.drawImage.mockImplementationOnce(() => {
            throw new Error('image not decoded');
        });

        expect(getContentBox(img)).toBeNull();
        expect(getContentBox(img)).toEqual({ x0: 0, y0: 0, x1: 1, y1: 1 });
    });

    it('caches a genuinely empty frame instead of rescanning it every draw', () => {
        const ctx = stubCanvas(makeFrame(4, 4, () => false));
        const img = { id: 'empty-cached', naturalWidth: 4, naturalHeight: 4 };

        expect(getContentBox(img)).toBeNull();
        expect(getContentBox(img)).toBeNull();
        expect(ctx.getImageData).toHaveBeenCalledTimes(1);
    });
});
