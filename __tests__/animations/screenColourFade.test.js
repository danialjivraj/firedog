import {
    screenColourFadeIn,
    screenColourFadeOut,
} from '../../game/animations/screenColourFade';

describe('screenColourFadeIn()', () => {
    it('increases variable by fadeSpeed when result is below the maximum (0.3)', () => {
        expect(screenColourFadeIn(0, 0.1)).toBeCloseTo(0.1);
        expect(screenColourFadeIn(0.1, 0.05)).toBeCloseTo(0.15);
    });

    it('caps the variable at 0.3 when the sum exceeds the maximum', () => {
        expect(screenColourFadeIn(0.25, 0.1)).toBeCloseTo(0.3);
        expect(screenColourFadeIn(0.295, 0.01)).toBeCloseTo(0.3);
    });

    it('leaves the variable at 0.3 when already at or above the maximum', () => {
        expect(screenColourFadeIn(0.3, 0.05)).toBeCloseTo(0.3);
        expect(screenColourFadeIn(0.4, 0.1)).toBeCloseTo(0.3);
    });
});

describe('screenColourFadeOut()', () => {
    it('decreases variable by 0.01 when result remains above zero', () => {
        expect(screenColourFadeOut(0.2)).toBeCloseTo(0.19);
        expect(screenColourFadeOut(1)).toBeCloseTo(0.99);
    });

    it('caps the variable at 0 when subtraction would go below zero', () => {
        expect(screenColourFadeOut(0.005)).toBeCloseTo(0);
        expect(screenColourFadeOut(0.009)).toBeCloseTo(0);
    });

    it('leaves the variable at zero when already at zero or below', () => {
        expect(screenColourFadeOut(0)).toBeCloseTo(0);
        expect(screenColourFadeOut(-0.1)).toBeCloseTo(0);
    });
});
