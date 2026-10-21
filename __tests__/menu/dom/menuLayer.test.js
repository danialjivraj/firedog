import { getMenuLayer, resetMenuLayer } from '../../../game/menu/dom/menuLayer.js';

describe('MenuLayer', () => {
    let layer;

    const canvasAt = (opacity) => ({ style: { opacity } });

    beforeEach(() => {
        document.body.innerHTML = '';
        resetMenuLayer();

        layer = getMenuLayer();
        layer.register({}, document.createElement('div'));
    });

    afterEach(() => {
        resetMenuLayer();
    });

    describe('fade mirroring', () => {
        it('mirrors the canvas opacity onto the overlay, so menus fade with the screen', () => {
            layer.sync({ currentMenu: null, canvas: canvasAt('0.35') });

            expect(layer.root.style.opacity).toBe('0.35');
        });

        it('follows the fade as it ramps', () => {
            const canvas = canvasAt('0');
            const seen = [];

            for (const step of ['0', '0.25', '0.5', '0.75', '1']) {
                canvas.style.opacity = step;
                layer.sync({ currentMenu: null, canvas });
                seen.push(layer.root.style.opacity);
            }

            expect(seen).toEqual(['0', '0.25', '0.5', '0.75', '1']);
        });

        it('clears the inline opacity once the canvas has none', () => {
            layer.sync({ currentMenu: null, canvas: canvasAt('0.35') });
            layer.sync({ currentMenu: null, canvas: canvasAt('') });

            expect(layer.root.style.opacity).toBe('');
        });

        it('does not throw when the game has no canvas', () => {
            expect(() => layer.sync({ currentMenu: null })).not.toThrow();
        });
    });

    describe('toast canvas', () => {
        let ctx;

        beforeEach(() => {
            ctx = { clearRect: jest.fn() };
            jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        const toast = () => ({ draw: jest.fn() });
        const toastCanvas = () => layer.stage.querySelector('canvas.menu-toasts');

        it('is not created while there are no toasts', () => {
            layer.drawToasts([], []);

            expect(toastCanvas()).toBeNull();
        });

        it('is created inside the menu stage on the first toast, so toasts draw above menus', () => {
            layer.drawToasts([toast()]);

            expect(toastCanvas()).not.toBeNull();
            expect(toastCanvas().width).toBe(1920);
            expect(toastCanvas().height).toBe(689);
        });

        it('clears the canvas and draws every toast from every list', () => {
            const a = toast();
            const b = toast();
            const c = toast();

            layer.drawToasts([a, b], [c]);

            expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 1920, 689);
            for (const t of [a, b, c]) expect(t.draw).toHaveBeenCalledWith(ctx);
        });

        it('reuses the same canvas across frames', () => {
            layer.drawToasts([toast()]);
            layer.drawToasts([toast()]);

            expect(layer.stage.querySelectorAll('canvas.menu-toasts')).toHaveLength(1);
        });

        it('clears once after the last toast ends, then stops touching the canvas', () => {
            layer.drawToasts([toast()]);
            ctx.clearRect.mockClear();

            layer.drawToasts([]);
            expect(ctx.clearRect).toHaveBeenCalledTimes(1);

            layer.drawToasts([]);
            layer.drawToasts();
            expect(ctx.clearRect).toHaveBeenCalledTimes(1);
        });

        it('does not throw when the canvas has no 2d context', () => {
            HTMLCanvasElement.prototype.getContext.mockReturnValue(null);

            expect(() => layer.drawToasts([toast()])).not.toThrow();
        });
    });
});
