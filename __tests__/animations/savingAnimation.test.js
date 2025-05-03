import {
    SavingOrDeletingAnimation,
    SavingAnimation,
    SavingBookAnimation,
    DeleteProgressAnimation,
    DeleteProgressBookAnimation,
} from '../../game/animations/savingAnimation';

const fakeImages = {
    foobar: {},
    savingAnimation: {},
    savingBookAnimation: {},
    deleteProgressAnimation: {},
    deleteProgressBookAnimation: {},
};

beforeAll(() => {
    jest.spyOn(document, 'getElementById')
        .mockImplementation((id) => fakeImages[id] || null);
});
afterAll(() => {
    document.getElementById.mockRestore();
});

describe('SavingOrDeletingAnimation (base class)', () => {
    let game, anim, ctx;
    const WIDTH = 100, HEIGHT = 50, MAX_FRAME = 2, X = 10, Y = 20, FPS = 5;
    const IMAGE_ID = 'foobar';

    beforeEach(() => {
        game = { debug: false, map2Unlocked: false, map3Unlocked: false };
        anim = new SavingOrDeletingAnimation(
            game, WIDTH, HEIGHT, IMAGE_ID, MAX_FRAME, X, Y, FPS
        );
        ctx = {
            strokeRect: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            drawImage: jest.fn(),
            shadowColor: '',
            shadowBlur: null,
        };
    });

    it('constructor sets properties correctly', () => {
        expect(anim.game).toBe(game);
        expect(anim.width).toBe(WIDTH);
        expect(anim.height).toBe(HEIGHT);
        expect(anim.image).toBe(fakeImages.foobar);
        expect(anim.maxFrame).toBe(MAX_FRAME);
        expect(anim.frameWidth).toBe(WIDTH);
        expect(anim.frameHeight).toBe(HEIGHT);
        expect(anim.x).toBe(X);
        expect(anim.y).toBe(Y);
        expect(anim.frameX).toBe(0);
        expect(anim.frameY).toBe(0);
        expect(anim.fps).toBe(FPS);
        expect(anim.frameInterval).toBeCloseTo(1000 / FPS);
        expect(anim.frameTimer).toBe(0);
    });

    it('update(delta = interval) does not advance or wrap', () => {
        anim.update(anim.frameInterval);
        expect(anim.frameX).toBe(0);
        expect(anim.frameTimer).toBe(anim.frameInterval);
    });

    it('update(delta > interval) advances by exactly one frame and resets timer', () => {
        anim.update(anim.frameInterval + 1);
        expect(anim.frameX).toBe(1);
        expect(anim.frameTimer).toBe(0);
    });

    it('update() accumulates across two small calls then advances once', () => {
        const half = anim.frameInterval / 2;
        anim.update(half);
        expect(anim.frameX).toBe(0);
        expect(anim.frameTimer).toBe(half);
        anim.update(half + 1);
        expect(anim.frameX).toBe(1);
        expect(anim.frameTimer).toBe(0);
    });

    it('update() increments through frames then wraps sequentially', () => {
        const iv = anim.frameInterval + 1;
        anim.update(iv); // frameX - 1
        expect(anim.frameX).toBe(1);
        anim.update(iv); // frameX - 2
        expect(anim.frameX).toBe(2);
        anim.update(iv); // frameX was at maxFrame - wraps to 0
        expect(anim.frameX).toBe(0);
    });

    it('frameY remains at zero always', () => {
        anim.frameY = 0;
        anim.update(anim.frameInterval + 10);
        expect(anim.frameY).toBe(0);
    });

    it('draw() without debug uses white shadow and calls drawImage', () => {
        anim.draw(ctx);
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.shadowColor).toBe('white');
        expect(ctx.shadowBlur).toBe(10);
        expect(ctx.drawImage).toHaveBeenCalledWith(
            anim.image,
            0, 0, WIDTH, HEIGHT,
            X, Y, WIDTH, HEIGHT
        );
        expect(ctx.restore).toHaveBeenCalled();
        expect(ctx.strokeRect).not.toHaveBeenCalled();
    });

    it('draw() with debug calls strokeRect', () => {
        game.debug = true;
        anim.draw(ctx);
        expect(ctx.strokeRect).toHaveBeenCalledWith(X, Y, WIDTH, HEIGHT);
    });

    it('draw() uses orange shadow when map2Unlocked && !map3Unlocked', () => {
        game.map2Unlocked = true;
        game.map3Unlocked = false;
        anim.draw(ctx);
        expect(ctx.shadowColor).toBe('orange');
    });

    it('draw() uses white shadow when map3Unlocked=true regardless of map2', () => {
        game.map2Unlocked = true;
        game.map3Unlocked = true;
        anim.draw(ctx);
        expect(ctx.shadowColor).toBe('white');
    });
});

describe('Subclass constructors', () => {
    const GW = 500, GH = 300;
    let game;

    beforeEach(() => {
        game = { width: GW, height: GH };
    });

    it('SavingAnimation parameters', () => {
        const sa = new SavingAnimation({ ...game, debug: false, map2Unlocked: false, map3Unlocked: false });
        expect(sa.width).toBeCloseTo(177.66666666666666);
        expect(sa.height).toBe(60);
        expect(sa.image).toBe(fakeImages.savingAnimation);
        expect(sa.maxFrame).toBe(2);
        expect(sa.fps).toBe(3);
        expect(sa.x).toBeCloseTo(GW - sa.width - 30);
        expect(sa.y).toBeCloseTo(GH - 60);
    });

    it('SavingBookAnimation parameters', () => {
        const sb = new SavingBookAnimation(game);
        expect(sb.width).toBe(192);
        expect(sb.height).toBe(152);
        expect(sb.image).toBe(fakeImages.savingBookAnimation);
        expect(sb.maxFrame).toBe(8);
        expect(sb.fps).toBe(8);
        expect(sb.x).toBe(GW - 192 - 45);
        expect(sb.y).toBe(GH - 152 - 35);
    });

    it('DeleteProgressAnimation parameters', () => {
        const dp = new DeleteProgressAnimation(game);
        expect(dp.width).toBeCloseTo(179.33333333333334);
        expect(dp.height).toBe(100);
        expect(dp.image).toBe(fakeImages.deleteProgressAnimation);
        expect(dp.maxFrame).toBe(2);
        expect(dp.fps).toBe(2);
        expect(dp.x).toBeCloseTo(GW - dp.width - 45);
        expect(dp.y).toBe(GH - 100);
    });

    it('DeleteProgressBookAnimation parameters', () => {
        const db = new DeleteProgressBookAnimation(game);
        expect(db.width).toBe(194);
        expect(db.height).toBe(154);
        expect(db.image).toBe(fakeImages.deleteProgressBookAnimation);
        expect(db.maxFrame).toBe(5);
        expect(db.fps).toBe(5);
        expect(db.x).toBe(GW - 194 - 45);
        expect(db.y).toBe(GH - 154 - 85);
    });
});
