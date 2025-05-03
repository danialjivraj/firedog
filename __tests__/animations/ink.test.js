import { InkSplash } from '../../game/animations/ink';

for (let i = 1; i <= 18; i++) {
    global[`paint_splatter_${i}`] = {};
}

describe('InkSplash', () => {
    let game;
    let splash;

    beforeEach(() => {
        jest.useFakeTimers();
        game = { collisions: [] };
        splash = new InkSplash(game);
        game.collisions.push(splash);

        splash.splatterImages = [
            { id: 'a', width: 10 },
            { id: 'b', width: 20 },
            { id: 'c', width: 30 },
        ];
        splash.image = splash.splatterImages[0];
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('initializes default properties correctly', () => {
        expect(splash.x).toBe(0);
        expect(splash.y).toBe(0);
        expect(splash.alpha).toBe(1.0);
        expect(splash.fadeSpeed).toBeCloseTo(1 / 7000);
        expect(splash.elapsedTime).toBe(0);
        expect(Array.isArray(splash.splatterImages)).toBe(true);
        expect(game.collisions).toContain(splash);
    });

    describe('getRandomSplatterImage()', () => {
        it('picks an image based on Math.random', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.5);
            const img = splash.getRandomSplatterImage();
            expect(img).toBe(splash.splatterImages[1]);
            Math.random.mockRestore();
        });
    });

    describe('getWidth()', () => {
        it('returns image.width', () => {
            splash.image = { width: 42 };
            expect(splash.getWidth()).toBe(42);
        });
    });

    describe('update()', () => {
        it('increments elapsedTime and does not fade before 4000ms', () => {
            splash.update(1000);
            expect(splash.elapsedTime).toBe(1000);
            expect(splash.alpha).toBe(1.0);
            expect(game.collisions).toContain(splash);
        });

        it('begins fading between 4000ms and 7000ms', () => {
            splash.update(4001);
            // (4001 - 4000) / 3000 ≈ 0.000333...
            expect(splash.alpha).toBeCloseTo(1 - (1 / 3000));
            expect(game.collisions).toContain(splash);
        });

        it('does not fade exactly at 4000ms', () => {
            splash.update(4000);
            expect(splash.alpha).toBe(1.0);
            expect(game.collisions).toContain(splash);
        });

        it('mid‑fades correctly at 5500ms', () => {
            splash.update(5500);
            // fade progress = (5500 - 4000) / 3000 = 1500/3000 = 0.5
            expect(splash.alpha).toBeCloseTo(0.5);
            expect(game.collisions).toContain(splash);
          });

        it('removes itself at or after 7000ms elapsed', () => {
            // exactly 7000ms
            splash.update(7000);
            expect(game.collisions).not.toContain(splash);

            game.collisions = [splash];
            splash.elapsedTime = 0;
            splash.update(8000);
            expect(game.collisions).not.toContain(splash);
        });
    });

    describe('draw()', () => {
        it('sets context.globalAlpha, draws the image, then restores alpha to 1.0', () => {
            const calls = [];
            const context = {
                globalAlpha: 0,
                drawImage: (img, x, y) => {
                    calls.push({ alphaDuringDraw: context.globalAlpha, img, x, y });
                },
            };

            splash.alpha = 0.3;
            splash.x = 7;
            splash.y = 14;
            splash.image = 'MY_IMG';

            splash.draw(context);

            expect(calls).toEqual([
                { alphaDuringDraw: 0.3, img: 'MY_IMG', x: 7, y: 14 },
            ]);
            expect(context.globalAlpha).toBe(1.0);
        });
    });
});
