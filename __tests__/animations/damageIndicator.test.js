import {
    BaseIndicator,
    DamageIndicator,
} from '../../game/animations/damageIndicator.js';

describe('BaseIndicator', () => {
    let game, indicator, ctx;

    const makeCtx = () => {
        const gradient = { addColorStop: jest.fn() };
        return {
            globalAlpha: 0,
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            fillRect: jest.fn(),
            createRadialGradient: jest.fn(() => gradient),
        };
    };

    beforeEach(() => {
        game = {
            width: 1920,
            height: 689,
            isPlayerInGame: false,
            collisions: [],
            player: { loopDamageIndicator: false },
        };
        indicator = new BaseIndicator(game, '255,0,0', 0.8);
        ctx = makeCtx();
    });

    describe('constructor', () => {
        test('initializes opacity and elapsedTime', () => {
            expect(indicator.initialOpacity).toBe(0.8);
            expect(indicator.alpha).toBe(0.8);
            expect(indicator.elapsedTime).toBe(0);
        });
    });

    describe('update', () => {
        test('does nothing when player is not in game', () => {
            indicator.update(1000);
            expect(indicator.elapsedTime).toBe(0);
            expect(indicator.alpha).toBe(0.8);
        });

        test('keeps alpha constant before fade start', () => {
            game.isPlayerInGame = true;
            indicator.update(400);
            expect(indicator.elapsedTime).toBe(400);
            expect(indicator.alpha).toBe(0.8);
        });

        test('reduces alpha proportionally during fade window', () => {
            game.isPlayerInGame = true;
            indicator.update(600); // elapsedTime = 600

            // fadeProgress = (600 - 500) / 1500 = 100 / 1500
            const expectedAlpha = 0.8 - 0.8 * (100 / 1500);

            expect(indicator.elapsedTime).toBe(600);
            expect(indicator.alpha).toBeCloseTo(expectedAlpha);
        });

        test('marks indicator for deletion after fade end', () => {
            game.isPlayerInGame = true;
            game.collisions = [indicator];

            indicator.elapsedTime = 2000;
            indicator.update(0);

            expect(indicator.markedForDeletion).toBe(true);
        });
    });

    describe('draw', () => {
        test('renders radial gradient and sets globalAlpha when alpha > 0', () => {
            indicator.alpha = 0.42;
            indicator.draw(ctx);

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();

            expect(ctx.createRadialGradient).toHaveBeenCalledTimes(1);
            expect(ctx.fillRect).toHaveBeenCalled();

            expect(ctx.globalAlpha).toBeCloseTo(0.42);
        });
    });

    describe('reset', () => {
        test('restores initial alpha and clears elapsedTime', () => {
            indicator.elapsedTime = 1234;
            indicator.alpha = 0.1;

            indicator.reset();

            expect(indicator.elapsedTime).toBe(0);
            expect(indicator.alpha).toBe(0.8);
        });
    });
});

describe('DamageIndicator', () => {
    test('sets a non-zero initial opacity based on currentMap', () => {
        const game = { width: 100, height: 50, currentMap: 'Map1' };
        const di = new DamageIndicator(game);

        expect(di.initialOpacity).toBeGreaterThan(0);
        expect(di.initialOpacity).toBeLessThanOrEqual(1);
        expect(di.alpha).toBe(di.initialOpacity);
    });
});
