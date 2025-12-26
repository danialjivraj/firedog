import { TunnelVision } from '../../game/animations/tunnelVision';

describe('TunnelVision', () => {
    let game;
    let tv;

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

    describe('constructor', () => {
        it('initializes default state and timeline', () => {
            expect(tv.game).toBe(game);

            expect(tv.x).toBe(0);
            expect(tv.y).toBe(0);

            expect(tv.radius).toBe(400);

            expect(tv.alpha).toBe(1.0);
            expect(tv.circleAlpha).toBe(0);
            expect(tv.elapsedTime).toBe(0);
            expect(tv.restartRadius).toBeNull();

            expect(tv.fadeOutStartTime).toBe(15000);
            expect(tv.fadeOutDuration).toBe(9000);
            expect(tv.endTime).toBe(24000);
        });

        it('merges options into cfg and recomputes timeline', () => {
            const custom = new TunnelVision(game, {
                fadeInMs: 0,
                holdMs: 0,
                expandMs: 0,
                fadeOutMs: 100,
            });

            expect(custom.cfg.fadeInMs).toBe(0);
            expect(custom.cfg.fadeOutMs).toBe(100);

            expect(custom.fadeOutStartTime).toBe(0);
            expect(custom.fadeOutDuration).toBe(100);
            expect(custom.endTime).toBe(100);
        });
    });

    describe('update(deltaTime)', () => {
        it('does nothing when isPlayerInGame is false', () => {
            game.isPlayerInGame = false;

            tv.update(5000);

            expect(tv.elapsedTime).toBe(0);
            expect(tv.x).toBe(0);
            expect(tv.y).toBe(0);
        });

        it('always centers x/y on the player before applying phase behavior', () => {
            tv.update(1);

            expect(tv.x).toBe(10 + 100 / 2);
            expect(tv.y).toBe(20 + 200 / 2);
        });

        describe('fade-in phase (t < fadeInEnd)', () => {
            it('advances time, shrinks radius toward minRadius, and increases circleAlpha up to 1', () => {
                tv.update(1000);

                expect(tv.elapsedTime).toBe(1000);

                const p = 0.5;
                const startRadius = 3000;
                const minRadius = 400;
                const expectedRadius = startRadius - p * (startRadius - minRadius);

                expect(tv.radius).toBeCloseTo(expectedRadius);
                expect(tv.circleAlpha).toBeCloseTo(p);
                expect(tv.alpha).toBe(1.0);
            });

            it('caps fade-in at minRadius and circleAlpha=1 at fadeInEnd boundary', () => {
                tv.update(2000);

                expect(tv.elapsedTime).toBe(2000);
                expect(tv.radius).toBeCloseTo(400);
                expect(tv.circleAlpha).toBe(1);
            });

            it('uses restartRadius when restarting from current state', () => {
                tv.radius = 1234;
                tv.restartFromCurrent();

                tv.update(1000);

                const p = 0.5;
                const minRadius = 400;
                const expectedRadius = 1234 - p * (1234 - minRadius);

                expect(tv.radius).toBeCloseTo(expectedRadius);
            });
        });

        describe('hold phase (fadeInEnd ≤ t < holdEnd)', () => {
            it('holds radius at minRadius and keeps alpha at 1', () => {
                tv.update(2000);
                tv.update(1);

                expect(tv.radius).toBe(400);
                expect(tv.alpha).toBe(1.0);
            });

            it('keeps circle fully dark during hold when keepDarkDuringExpand=true', () => {
                tv.update(2000);
                tv.update(1);

                expect(tv.circleAlpha).toBe(1.0);
            });
        });

        describe('expand phase (holdEnd ≤ t < fadeOutStartTime)', () => {
            it('increases radius linearly from minRadius by expandAmount over expandMs', () => {
                tv.update(12000);

                const expandElapsed = 12000 - 9000;
                const p = expandElapsed / 6000;
                const expectedRadius = 400 + p * 1500;

                expect(tv.radius).toBeCloseTo(expectedRadius);
                expect(tv.alpha).toBe(1.0);
            });

            it('keeps circle fully dark during expand when keepDarkDuringExpand=true', () => {
                tv.update(12000);
                expect(tv.circleAlpha).toBe(1.0);
            });
        });

        describe('fade-out phase (fadeOutStartTime ≤ t < endTime)', () => {
            it('reduces alpha from 1 down to 0 over fadeOutDuration', () => {
                tv.update(15000);
                expect(tv.alpha).toBeCloseTo(1.0);

                tv.update(4500);
                const p = (19500 - 15000) / 9000;
                expect(tv.alpha).toBeCloseTo(1.0 - p);
            });

            it('does not fade circleAlpha by default (fadeCircleAlphaWithFadeOut=false)', () => {
                tv.update(2000);
                tv.update(7000);
                tv.update(6000);

                expect(tv.elapsedTime).toBe(15000);
                expect(tv.circleAlpha).toBe(1);

                tv.update(1000);
                expect(tv.circleAlpha).toBe(1);
            });

            it('can fade circleAlpha when fadeCircleAlphaWithFadeOut=true', () => {
                tv.restartFromCurrentWithOptions({ fadeCircleAlphaWithFadeOut: true });

                tv.update(2000);
                tv.update(7000);
                tv.update(6000);

                expect(tv.elapsedTime).toBe(tv.fadeOutStartTime);
                expect(tv.circleAlpha).toBe(1);

                tv.update(4500);
                const p = 4500 / 9000;
                expect(tv.circleAlpha).toBeCloseTo(1.0 - p);
            });

            it('when fadeOutMs=0, completes immediately at fadeOutStartTime', () => {
                tv.restartFromCurrentWithOptions({ fadeOutMs: 0 });

                tv.update(2000);
                tv.update(7000);
                tv.update(6000);

                expect(game.collisions).not.toContain(tv);
                expect(game.player.isBlackHoleActive).toBe(false);

                expect(tv.alpha).toBe(1.0);
            });

        });

        describe('completion (t ≥ endTime)', () => {
            it('removes itself from collisions and deactivates black hole', () => {
                tv.update(15000 + 9000 + 1);

                expect(game.collisions).not.toContain(tv);
                expect(game.player.isBlackHoleActive).toBe(false);
            });
        });
    });

    describe('draw(context)', () => {
        let ctx;
        let gradient;
        let alphaCalls;

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
                set(val) {
                    alphaCalls.push(val);
                },
                get() {
                    return alphaCalls[alphaCalls.length - 1];
                },
            });
        });

        it('sets globalAlpha, draws radial gradient overlay, then restores globalAlpha to 1', () => {
            tv.alpha = 0.75;

            tv.draw(ctx);

            expect(alphaCalls).toEqual([0.75, 1.0]);

            expect(ctx.createRadialGradient).toHaveBeenCalledWith(
                123,
                456,
                0,
                123,
                456,
                500
            );

            expect(gradient.addColorStop).toHaveBeenNthCalledWith(
                1,
                0,
                'rgba(0, 0, 0, 0)'
            );
            expect(gradient.addColorStop).toHaveBeenNthCalledWith(
                2,
                1,
                `rgba(0, 0, 0, ${tv.circleAlpha})`
            );

            expect(ctx.fillStyle).toBe(gradient);
            expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, game.width, game.height);
        });
    });

    describe('reset()', () => {
        it('resets elapsedTime, alpha, radius, restartRadius, and circleAlpha to defaults', () => {
            tv.elapsedTime = 12345;
            tv.alpha = 0.2;
            tv.radius = 999;
            tv.restartRadius = 111;
            tv.circleAlpha = 0.8;

            tv.reset();

            expect(tv.elapsedTime).toBe(0);
            expect(tv.alpha).toBe(1.0);
            expect(tv.radius).toBe(300);
            expect(tv.restartRadius).toBeNull();
            expect(tv.circleAlpha).toBe(0);
        });
    });

    describe('restartFromCurrent()', () => {
        it('resets elapsedTime/alpha and stores current radius as restartRadius', () => {
            tv.radius = 777;
            tv.elapsedTime = 123;
            tv.alpha = 0.4;

            tv.restartFromCurrent();

            expect(tv.elapsedTime).toBe(0);
            expect(tv.alpha).toBe(1.0);
            expect(tv.restartRadius).toBe(777);
        });
    });

    describe('restartFromCurrentWithOptions()', () => {
        it('merges options, recomputes timeline, then restarts from current radius', () => {
            tv.radius = 888;

            tv.restartFromCurrentWithOptions({
                fadeInMs: 100,
                holdMs: 0,
                expandMs: 0,
                fadeOutMs: 200,
            });

            expect(tv.cfg.fadeInMs).toBe(100);
            expect(tv.fadeOutStartTime).toBe(100);
            expect(tv.endTime).toBe(300);

            expect(tv.elapsedTime).toBe(0);
            expect(tv.alpha).toBe(1.0);
            expect(tv.restartRadius).toBe(888);
        });
    });
});
