import { TunnelVision } from '../../game/animations/tunnelVision';

describe('TunnelVision', () => {
    let game, tv;

    beforeEach(() => {
        game = {
            isPlayerInGame: true,
            player: {
                x: 10,
                y: 20,
                width: 100,
                height: 200,
                isBlackHoleActive: true,
            },
            width: 1920,
            height: 689,
            collisions: [],
        };
        tv = new TunnelVision(game);
        game.collisions.push(tv);
    });

    it('constructor sets initial properties', () => {
        expect(tv.game).toBe(game);
        expect(tv.x).toBe(0);
        expect(tv.y).toBe(0);
        expect(tv.radius).toBe(400);
        expect(tv.alpha).toBe(1.0);
        expect(tv.circleAlpha).toBe(0);
        expect(tv.elapsedTime).toBe(0);
        expect(tv.fadeOutStartTime).toBe(15000);
        expect(tv.fadeOutDuration).toBe(9000);
        expect(tv.restartRadius).toBeNull();
    });

    it('update() does nothing when isPlayerInGame=false', () => {
        game.isPlayerInGame = false;
        tv.update(5000);
        expect(tv.elapsedTime).toBe(0);
        expect(tv.x).toBe(0);
        expect(tv.y).toBe(0);
    });

    describe('fade‑in phase (elapsedTime < 9000)', () => {
        it('updates elapsedTime, centers on player, and fades in radius & circleAlpha', () => {
            tv.update(1000);
            expect(tv.elapsedTime).toBe(1000);
            expect(tv.x).toBe(10 + 100 / 2);
            expect(tv.y).toBe(20 + 200 / 2);
            const fadeInProgress = 1000 / 2000;
            const initialRadius = 3000;
            const expectedRadius = initialRadius - fadeInProgress * (initialRadius - 400);
            expect(tv.radius).toBeCloseTo(expectedRadius);
            expect(tv.circleAlpha).toBeCloseTo(fadeInProgress);
            expect(tv.alpha).toBe(1.0);
        });

        it('caps fade-in at full radius and circleAlpha=1 when elapsedTime ≥2000', () => {
            tv.update(2000);
            expect(tv.elapsedTime).toBe(2000);
            expect(tv.radius).toBeCloseTo(400);
            expect(tv.circleAlpha).toBe(1);
        });
    });

    describe('radius fade‑out phase (9000 < elapsedTime < fadeOutStartTime)', () => {
        it('increases radius linearly from 400 to 1900 between 9000 and 15000', () => {
            tv.update(12000);
            const fadeProgress = (12000 - 9000) / (15000 - 9000);
            const expectedRadius = 400 + fadeProgress * 1500;
            expect(tv.radius).toBeCloseTo(expectedRadius);
        });
    });

    describe('alpha fade‑out phase (fadeOutStartTime ≤ elapsedTime < fadeOutStartTime+fadeOutDuration)', () => {
        it('reduces alpha from 1 to 0 over the duration', () => {
            tv.update(15000);
            expect(tv.alpha).toBeCloseTo(1.0);
            tv.update(4500);
            const fadeOutProgress = (19500 - 15000) / 9000;
            expect(tv.alpha).toBeCloseTo(1.0 - fadeOutProgress);
        });
    });

    describe('completion phase (elapsedTime ≥ fadeOutStartTime+fadeOutDuration)', () => {
        it('removes itself from collisions and deactivates black hole', () => {
            tv.update(15000 + 9000 + 1);
            expect(game.collisions).not.toContain(tv);
            expect(game.player.isBlackHoleActive).toBe(false);
        });
    });

    describe('draw()', () => {
        let ctx, gradient, alphaCalls;

        beforeEach(() => {
            tv.circleAlpha = 0.25;
            tv.radius = 500;
            tv.x = 123;
            tv.y = 456;

            gradient = { addColorStop: jest.fn() };
            alphaCalls = [];
            ctx = {
                createRadialGradient: jest.fn(() => gradient),
                fillRect: jest.fn(),
                fillStyle: null,
            };
            Object.defineProperty(ctx, 'globalAlpha', {
                set(val) { alphaCalls.push(val); },
                get() { return alphaCalls[alphaCalls.length - 1]; },
            });
        });

        it('sets globalAlpha to alpha then back to 1.0, and draws gradient correctly', () => {
            tv.alpha = 0.75;
            tv.draw(ctx);

            expect(alphaCalls).toEqual([0.75, 1.0]);

            expect(ctx.createRadialGradient)
                .toHaveBeenCalledWith(123, 456, 0, 123, 456, 500);

            expect(gradient.addColorStop).toHaveBeenNthCalledWith(1, 0, 'rgba(0, 0, 0, 0)');
            expect(gradient.addColorStop)
                .toHaveBeenNthCalledWith(2, 1, `rgba(0, 0, 0, ${tv.circleAlpha})`);

            expect(ctx.fillStyle).toBe(gradient);
            expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, game.width, game.height);
        });
    });

    describe('reset()', () => {
        it('resets elapsedTime, alpha, and radius to their defaults', () => {
            tv.elapsedTime = 12345;
            tv.alpha = 0.2;
            tv.radius = 999;
            tv.reset();
            expect(tv.elapsedTime).toBe(0);
            expect(tv.alpha).toBe(1.0);
            expect(tv.radius).toBe(300);
        });
    });
});
