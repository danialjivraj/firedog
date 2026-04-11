import { FloatingMessage } from '../../game/animations/floatingMessages';

describe('FloatingMessage', () => {
    describe('constructor', () => {
        it('stores value, x, y and applies default options', () => {
            const msg = new FloatingMessage('X', 10, 20);
            expect(msg.value).toBe('X');
            expect(msg.x).toBe(10);
            expect(msg.y).toBe(20);
            expect(msg.fontSize).toBe(28);
            expect(msg.textColor).toBe('white');
            expect(msg.smallSuffix).toBe(false);
            expect(msg.duration).toBe(1400);
            expect(msg.elapsed).toBe(0);
            expect(msg.markedForDeletion).toBe(false);
        });

        it('merges supplied options over defaults', () => {
            const msg = new FloatingMessage('!', 0, 0, { fontSize: 50, textColor: 'red', smallSuffix: true, duration: 2000 });
            expect(msg.fontSize).toBe(50);
            expect(msg.textColor).toBe('red');
            expect(msg.smallSuffix).toBe(true);
            expect(msg.duration).toBe(2000);
        });
    });

    describe('update(deltaTime)', () => {
        it('accumulates elapsed time', () => {
            const msg = new FloatingMessage('A', 100, 200);
            msg.update(500);
            expect(msg.elapsed).toBe(500);
            expect(msg.markedForDeletion).toBe(false);
        });

        it('marks for deletion once elapsed >= duration', () => {
            const msg = new FloatingMessage('A', 0, 0, { duration: 1000 });
            msg.update(1000);
            expect(msg.markedForDeletion).toBe(true);
        });

        it('does not mark for deletion before duration is reached', () => {
            const msg = new FloatingMessage('A', 0, 0, { duration: 1000 });
            msg.update(999);
            expect(msg.markedForDeletion).toBe(false);
        });

        describe('no target (float upward)', () => {
            it('y decreases proportionally to elapsed time', () => {
                const msg = new FloatingMessage('A', 0, 100);
                msg.update(200);
                expect(msg.y).toBeCloseTo(100 - 0.05 * 200);
            });

            it('x stays unchanged', () => {
                const msg = new FloatingMessage('A', 50, 100);
                msg.update(200);
                expect(msg.x).toBe(50);
            });
        });

        describe('with target (exact interpolation to targetX/targetY)', () => {
            it('arrives exactly at targetX/targetY when elapsed === duration', () => {
                const msg = new FloatingMessage('A', 0, 0, { targetX: 300, targetY: 150, duration: 1000 });
                msg.update(1000);
                expect(msg.x).toBeCloseTo(300);
                expect(msg.y).toBeCloseTo(150);
            });

            it('two messages starting at different positions both arrive at the same target', () => {
                const near = new FloatingMessage('A', 280, 140, { targetX: 300, targetY: 150, duration: 1000 });
                const far  = new FloatingMessage('A', 0,   0,   { targetX: 300, targetY: 150, duration: 1000 });
                near.update(1000);
                far.update(1000);
                expect(near.x).toBeCloseTo(far.x);
                expect(near.y).toBeCloseTo(far.y);
            });

            it('advances toward target mid-flight (t > 0)', () => {
                const msg = new FloatingMessage('A', 0, 0, { targetX: 1000, targetY: 500, duration: 1000 });
                msg.update(500);
                expect(msg.x).toBeGreaterThan(0);
                expect(msg.x).toBeLessThan(1000);
            });

            it('does not overshoot the target', () => {
                const msg = new FloatingMessage('A', 0, 0, { targetX: 100, targetY: 50, duration: 1000 });
                for (let i = 0; i < 100; i++) msg.update(20);
                expect(msg.x).toBeCloseTo(100);
                expect(msg.y).toBeCloseTo(50);
            });
        });
    });

    describe('draw(context)', () => {
        let ctx;

        beforeEach(() => {
            ctx = {
                save: jest.fn(),
                restore: jest.fn(),
                fillText: jest.fn(),
                strokeText: jest.fn(),
                measureText: jest.fn().mockReturnValue({ width: 20 }),
                font: '',
                fillStyle: '',
                strokeStyle: '',
                globalAlpha: 1,
                textAlign: '',
                textBaseline: '',
                lineWidth: 1,
            };
        });

        it('calls save/restore', () => {
            const msg = new FloatingMessage('Hi', 50, 50);
            msg.draw(ctx);
            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
        });

        it('renders text with a stroke outline then fill', () => {
            const msg = new FloatingMessage('Hi', 50, 50, { textColor: 'yellow' });
            msg.draw(ctx);
            expect(ctx.strokeText).toHaveBeenCalledWith('Hi', 50, 50);
            expect(ctx.fillText).toHaveBeenCalledWith('Hi', 50, 50);
            expect(ctx.fillStyle).toBe('yellow');
        });

        it('sets globalAlpha=1 before fade starts (t < 0.85)', () => {
            const msg = new FloatingMessage('X', 0, 0, { duration: 1000 });
            msg.elapsed = 800; // t = 0.8
            msg.draw(ctx);
            expect(ctx.globalAlpha).toBe(1);
        });

        it('sets globalAlpha between 0 and 1 during fade-out phase (t > 0.85)', () => {
            const msg = new FloatingMessage('X', 0, 0, { duration: 1000 });
            msg.elapsed = 920; // t = 0.92
            msg.draw(ctx);
            expect(ctx.globalAlpha).toBeGreaterThan(0);
            expect(ctx.globalAlpha).toBeLessThan(1);
        });

        it('uses a larger font near t=0 (scale pop effect)', () => {
            const msg = new FloatingMessage('X', 0, 0, { fontSize: 28, duration: 1400 });

            // at t=0 (scale ~1.3)
            msg.elapsed = 0;
            msg.draw(ctx);
            const fontAtStart = ctx.font;

            // at t=0.5 (scale = 1.0)
            msg.elapsed = 700;
            msg.draw(ctx);
            const fontAtMid = ctx.font;

            // extract numeric size from 'bold Xpx ...'
            const sizeAt = (f) => parseInt(f.match(/bold (\d+)px/)[1]);
            expect(sizeAt(fontAtStart)).toBeGreaterThan(sizeAt(fontAtMid));
        });

        describe('smallSuffix', () => {
            it('draws the number part and the letter part separately', () => {
                const msg = new FloatingMessage('+10s', 60, 80, { fontSize: 30, smallSuffix: true });
                msg.draw(ctx);

                const allStrokeArgs = ctx.strokeText.mock.calls.map(c => c[0]);
                const allFillArgs = ctx.fillText.mock.calls.map(c => c[0]);

                expect(allStrokeArgs).toContain('+10');
                expect(allStrokeArgs).toContain('s');
                expect(allFillArgs).toContain('+10');
                expect(allFillArgs).toContain('s');
            });

            it('uses a smaller font for the letter part than the number part', () => {
                const msg = new FloatingMessage('+10s', 60, 80, { fontSize: 30, smallSuffix: true });
                msg.elapsed = 700; // past scale-pop; scale=1 so sizes are deterministic

                const fontsSeen = [];
                Object.defineProperty(ctx, 'font', {
                    set(v) { fontsSeen.push(v); },
                    get() { return fontsSeen[fontsSeen.length - 1] ?? ''; },
                });

                msg.draw(ctx);

                const sizes = fontsSeen.map(f => parseInt(f.match(/bold (\d+)px/)?.[1])).filter(Boolean);
                const maxSize = Math.max(...sizes);
                const minSize = Math.min(...sizes);
                expect(minSize).toBeLessThan(maxSize);
            });

            it('falls back to plain draw when value is a single character', () => {
                const msg = new FloatingMessage('s', 0, 0, { smallSuffix: true });
                msg.draw(ctx);
                expect(ctx.fillText).toHaveBeenCalledWith('s', 0, 0);
                expect(ctx.fillText).toHaveBeenCalledTimes(1);
            });
        });
    });
});
