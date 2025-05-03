import {
    BaseIndicator,
    DamageIndicator,
    PurpleWarningIndicator
} from '../../game/animations/damageIndicator.js';

beforeAll(() => {
    document.body.innerHTML = `
      <img id="testImage">
      <img id="damageIndicator">
      <img id="purpleWarningIndicator">
    `;
});

describe('BaseIndicator', () => {
    let game, indicator, ctx;

    beforeEach(() => {
        game = {
            width: 1920,
            height: 689,
            isPlayerInGame: false,
            collisions: [],
            player: { loopDamageIndicator: false }
        };
        indicator = new BaseIndicator(game, 'testImage', 0.8);
        ctx = { globalAlpha: 0, drawImage: jest.fn() };
    });

    test('constructor sets position, image, opacity and timers', () => {
        expect(indicator.x).toBe(0);
        expect(indicator.y).toBe(0);
        expect(indicator.image).toBe(document.getElementById('testImage'));
        expect(indicator.initialOpacity).toBe(0.8);
        expect(indicator.alpha).toBe(0.8);
        expect(indicator.fadeSpeed).toBeCloseTo(1 / 1500);
        expect(indicator.elapsedTime).toBe(0);
    });

    test('update does nothing when isPlayerInGame is false', () => {
        indicator.update(1000);
        expect(indicator.elapsedTime).toBe(0);
        expect(indicator.alpha).toBe(0.8);
    });

    test('update before fade start does not change alpha', () => {
        game.isPlayerInGame = true;
        indicator.update(400);
        expect(indicator.elapsedTime).toBe(400);
        expect(indicator.alpha).toBe(0.8);
    });

    test('update during fade reduces alpha proportionally', () => {
        game.isPlayerInGame = true;
        indicator.update(600); // elapsedTime = 600
        // fadeProgress = (600-500)/1500 = 100/1500 = 0.066666
        const expectedAlpha = 0.8 - 0.8 * (100 / 1500);
        expect(indicator.elapsedTime).toBe(600);
        expect(indicator.alpha).toBeCloseTo(expectedAlpha);
    });

    test('update after fade end removes from collisions and flags loopDamageIndicator', () => {
        game.isPlayerInGame = true;
        game.collisions = [indicator];
        indicator.elapsedTime = 2000;
        indicator.update(0);
        expect(game.collisions).not.toContain(indicator);
        expect(game.player.loopDamageIndicator).toBe(true);
    });

    test('draw sets globalAlpha, calls drawImage, and resets globalAlpha to 1.0', () => {
        indicator.alpha = 0.42;
        indicator.draw(ctx);
        expect(ctx.globalAlpha).toBe(1.0);
        expect(ctx.drawImage).toHaveBeenCalledWith(indicator.image, 0, 0);
    });

    test('reset zeroes elapsedTime and restores alpha', () => {
        indicator.elapsedTime = 1234;
        indicator.alpha = 0.1;
        indicator.reset();
        expect(indicator.elapsedTime).toBe(0);
        expect(indicator.alpha).toBe(0.8);
    });
});

describe('DamageIndicator', () => {
    const cases = [
        [1, 0.36],
        [2, 0.26],
        [3, 0.75],
        [4, 0.47],
        [5, 0.66],
        [6, 0.62]
    ];

    test.each(cases)(
        'when mapSelected[%i] is true, initialOpacity is %f',
        (idx, expectedOpacity) => {
            const game = {
                width: 100, height: 50,
                mapSelected: [false, false, false, false, false, false, false],
            };
            game.mapSelected[idx] = true;
            const di = new DamageIndicator(game);
            expect(di.initialOpacity).toBeCloseTo(expectedOpacity);
            expect(di.alpha).toBeCloseTo(expectedOpacity);
            expect(di.image).toBe(document.getElementById('damageIndicator'));
        }
    );
});

describe('PurpleWarningIndicator', () => {
    test('always uses 0.62 initialOpacity', () => {
        const game = { width: 1, height: 1, mapSelected: [] };
        const pi = new PurpleWarningIndicator(game);
        expect(pi.initialOpacity).toBe(0.62);
        expect(pi.alpha).toBe(0.62);
        expect(pi.image).toBe(document.getElementById('purpleWarningIndicator'));
    });
});
