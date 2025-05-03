import { fadeIn, fadeOut, fadeInAndOut } from '../../game/animations/fading';

describe('fading animations', () => {
    let element;
    let callback;
    let currentTime;

    // Fake rAF so each call bumps time by ~16ms
    beforeEach(() => {
        jest.useFakeTimers();
        currentTime = 0;

        global.requestAnimationFrame = (cb) => {
            return setTimeout(() => {
                currentTime += 16;
                cb(currentTime);
            }, 0);
        };
        global.cancelAnimationFrame = clearTimeout;

        element = { style: { opacity: '' } };
        callback = jest.fn();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllTimers();
        jest.resetAllMocks();
    });

    describe('fadeIn()', () => {
        it('ramps opacity from 0→1 over the duration and calls callback', () => {
            fadeIn(element, 100, callback);

            jest.advanceTimersByTime(100 + 16);
            expect(parseFloat(element.style.opacity)).toBeCloseTo(1, 1);
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('fadeOut()', () => {
        it('ramps opacity from 1→0 over the duration and calls callback', () => {
            element.style.opacity = 1;
            fadeOut(element, 120, callback);

            jest.advanceTimersByTime(120 + 16);
            expect(parseFloat(element.style.opacity)).toBeLessThanOrEqual(0.1);
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('fadeInAndOut()', () => {
        it('does fade‑out, black‑screen, then fade‑in and finally calls callback', () => {
            element.style.opacity = 1;
            const fadeOutDuration = 100;
            const blackScreenDuration = 50;
            const fadeInDuration = 100;

            fadeInAndOut(
                element,
                fadeOutDuration,
                blackScreenDuration,
                fadeInDuration,
                callback
            );

            const total = fadeOutDuration
                + blackScreenDuration
                + fadeInDuration
                + 16;
            jest.advanceTimersByTime(total);

            jest.runAllTimers();

            expect(parseFloat(element.style.opacity)).toBeCloseTo(1, 1);
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });
});

describe('fading animations – edge cases', () => {
    let element;
    let currentTime;

    beforeEach(() => {
        jest.useFakeTimers();
        currentTime = 0;

        global.requestAnimationFrame = (cb) =>
            setTimeout(() => { currentTime += 16; cb(currentTime); }, 0);
        global.cancelAnimationFrame = clearTimeout;

        element = { style: { opacity: '' } };
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllTimers();
    });

    it('does not throw when no callback is provided', () => {
        expect(() => fadeIn(element, 50)).not.toThrow();
        expect(() => fadeOut(element, 50)).not.toThrow();
        expect(() => fadeInAndOut(element, 50, 20, 50)).not.toThrow();

        jest.runAllTimers();
        expect(parseFloat(element.style.opacity)).not.toBeNaN();
    });

    it('handles zero duration by immediately setting final opacity and (if provided) calling callback', () => {
        const cbIn = jest.fn();
        const cbOut = jest.fn();

        fadeIn(element, 0, cbIn);
        fadeOut(element, 0, cbOut);

        jest.runAllTimers();

        expect(parseFloat(element.style.opacity)).toBeCloseTo(1, 1);
        expect(cbIn).toHaveBeenCalledTimes(1);

        expect(cbOut).toHaveBeenCalledTimes(1);
    });

    it('queues two fadeIns back‑to‑back (second still runs)', () => {
        const cb1 = jest.fn();
        const cb2 = jest.fn();

        fadeIn(element, 100, cb1);
        fadeIn(element, 100, cb2);

        jest.advanceTimersByTime((100 + 16) * 2);
        jest.runAllTimers();

        expect(cb1).toHaveBeenCalled();
        expect(cb2).toHaveBeenCalled();
        expect(parseFloat(element.style.opacity)).toBeCloseTo(1, 1);
    });
});
