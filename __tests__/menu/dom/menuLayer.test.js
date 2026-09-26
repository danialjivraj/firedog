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
});
