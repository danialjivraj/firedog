import {
    Dust,
    IceCrystal,
    Bubble,
    Splash,
    Fire,
    Fireball,
    CoinLoss,
    PoisonBubbles,
    IceCrystalBubbles,
    SpinningChicks,
    DashGhost,
    DashFireArc,
} from '../../game/animations/particles';

const fakeImages = {
    bubble: { name: 'bubble' },
    dust_black: { name: 'dust_black' },
    ice_crystal: { name: 'ice_crystal' },
    singleCoin: { name: 'singleCoin' },
    test_img: { name: 'test_img' },
    fireball_img: { name: 'fireball_img' },
    fire: { name: 'fire' },
    bluefire: { name: 'bluefire' },
    bluebubble: { name: 'bluebubble' },
};

beforeAll(() => {
    jest
        .spyOn(document, 'getElementById')
        .mockImplementation((id) => fakeImages[id] || null);
});

afterAll(() => {
    document.getElementById.mockRestore();
});

describe('Base Particle behavior', () => {
    it('marks particle for deletion when size falls below 0.5', () => {
        const game = {
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 0,
            player: {},
            menu: { pause: { isPaused: false } },
        };
        const p = new IceCrystal(game, 0, 0);
        p.size = 0.4;
        p.speedX = 0;
        p.speedY = 0;

        p.update();

        expect(p.markedForDeletion).toBe(true);
    });

    it('uses only speedX when cabin is fully visible', () => {
        const game = {
            cabin: { isFullyVisible: true },
            isBossVisible: false,
            speed: 5,
            player: {},
            menu: { pause: { isPaused: false } },
        };
        const p = new IceCrystal(game, 0, 0);
        p.size = 1;
        p.x = 10;
        p.y = 10;
        p.speedX = 2;
        p.speedY = 1;

        p.update();

        expect(p.x).toBeCloseTo(8);
        expect(p.y).toBeCloseTo(9);
    });

    it('uses only speedX when boss is fully visible', () => {
        const game = {
            cabin: { isFullyVisible: false },
            isBossVisible: true,
            speed: 5,
            player: {},
            menu: { pause: { isPaused: false } },
        };
        const p = new IceCrystal(game, 0, 0);
        p.size = 1;
        p.x = 20;
        p.y = 20;
        p.speedX = 3;
        p.speedY = 1;

        p.update();

        expect(p.x).toBeCloseTo(17);
        expect(p.y).toBeCloseTo(19);
    });
});

describe('Dust', () => {
    let game, dust, ctx;

    beforeEach(() => {
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)  // size
            .mockReturnValueOnce(0.2)  // speedX
            .mockReturnValueOnce(0.3)  // speedY
            .mockReturnValueOnce(0.95) // createBubble
            .mockReturnValueOnce(0.8); // createDust

        game = {
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 2,
            player: { isUnderwater: true },
            menu: { pause: { isPaused: false } },
        };
        ctx = { drawImage: jest.fn() };
        dust = new Dust(game, 100, 200);
    });

    afterEach(() => {
        Math.random.mockRestore();
    });

    it('update() moves and shrinks dust without marking for deletion when size >= 0.5', () => {
        const { x: ix, y: iy, size: isz, speedX, speedY } = dust;

        dust.update();

        expect(dust.x).toBeCloseTo(ix - (speedX + game.speed));
        expect(dust.y).toBeCloseTo(iy - speedY);
        expect(dust.size).toBeCloseTo(isz * 0.97);
        expect(dust.markedForDeletion).toBe(false);
    });

    it('draw() renders bubble and dust underwater and moves bubble up when not paused', () => {
        dust.update();
        const afterY = dust.y;

        dust.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalledTimes(2);
        expect(dust.y).toBeCloseTo(afterY - 2);
    });

    it('draw() does not move bubble up when game is paused', () => {
        game.menu.pause.isPaused = true;
        dust.update();
        const y0 = dust.y;

        dust.draw(ctx);

        expect(dust.y).toBe(y0);
    });

    it('draw() renders only dust when createBubble=false and createDust=true', () => {
        Math.random.mockRestore();
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0)    // createBubble false
            .mockReturnValueOnce(0.8); // createDust true

        dust = new Dust(game, 0, 0);
        dust.update();
        ctx.drawImage.mockClear();

        dust.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalledTimes(1);
        expect(dust.y).toBeCloseTo(0 - dust.speedY);
    });

    it('draw() renders only bubble when createBubble=true and createDust=false', () => {
        Math.random.mockRestore();
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.95) // createBubble true
            .mockReturnValueOnce(0);   // createDust false

        dust = new Dust(game, 0, 0);
        dust.update();

        const { x: px, y: py, size } = dust;
        const expectedX = px - size;
        const expectedY = py - size / 1.3;

        ctx.drawImage.mockClear();

        dust.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalledTimes(1);
        expect(ctx.drawImage).toHaveBeenCalledWith(
            fakeImages.bubble,
            expectedX,
            expectedY,
            size,
            size
        );
        expect(dust.y).toBeCloseTo(py - 2);
    });
});

describe('IceCrystal', () => {
    let game, ice, ctx;

    beforeEach(() => {
        game = { player: {} };
        ctx = { drawImage: jest.fn() };
    });

    it('draws the crystal when createIce=true', () => {
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.6);
        ice = new IceCrystal(game, 5, 15);
        Math.random.mockRestore();

        ice.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalled();
    });

    it('skips drawing when createIce=false', () => {
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.4);
        ice = new IceCrystal(game, 0, 0);
        Math.random.mockRestore();

        ice.draw(ctx);

        expect(ctx.drawImage).not.toHaveBeenCalled();
    });
});

describe('Bubble', () => {
    let game, bubble, ctx;

    beforeEach(() => {
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.95);

        game = {
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 1,
            player: { isUnderwater: true },
            menu: { pause: { isPaused: false } },
        };
        ctx = { drawImage: jest.fn() };
        bubble = new Bubble(game, 20, 30);
    });

    afterEach(() => Math.random.mockRestore());

    it('update() + draw() underwater moves bubble up by 2px when not paused', () => {
        bubble.update();
        const yAfter = bubble.y;

        bubble.draw(ctx);

        expect(bubble.y).toBeCloseTo(yAfter - 2);
    });

    it('draw() does nothing when createBubble=false underwater', () => {
        Math.random.mockRestore();
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0); // createBubble false

        bubble = new Bubble(game, 0, 0);
        bubble.update();

        ctx.drawImage.mockClear();

        bubble.draw(ctx);

        expect(ctx.drawImage).not.toHaveBeenCalled();
    });
});

describe('Splash', () => {
    let game, splash, ctx;

    beforeEach(() => {
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.3);

        game = {
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 1,
            player: { isUnderwater: false, isBluePotionActive: false },
            menu: { pause: { isPaused: false } },
        };
        ctx = { drawImage: jest.fn() };
        splash = new Splash(game, 10, 10);
        Math.random.mockRestore();
    });

    it('non-underwater update() on first call only subtracts speedY (gravity starts at 0)', () => {
        const { y: iy, speedY } = splash;

        splash.update();

        expect(splash.y).toBeCloseTo(iy - speedY);
    });

    it('underwater update() moves up by speedY and gravity * 0.6', () => {
        game.player.isUnderwater = true;
        splash = new Splash(game, 0, 0);
        splash.gravity = 1;
        splash.y = 50;
        splash.speedY = 2;

        splash.update();

        expect(splash.y).toBeCloseTo(47.4);
    });

    it('draw() renders a splash image', () => {
        splash.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalled();
    });
});

describe('Fire', () => {
    let game, fire, ctx;

    beforeEach(() => {
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.5);

        game = {
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 2,
            player: { isUnderwater: false, isBluePotionActive: false },
            menu: { pause: { isPaused: false } },
        };
        ctx = {
            save: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            drawImage: jest.fn(),
            restore: jest.fn(),
        };
        fire = new Fire(game, 10, 15);
        Math.random.mockRestore();
    });

    it('update() on land does not apply extra underwater -4 offset', () => {
        const { y: iy, speedY } = fire;

        fire.update();

        expect(fire.y).toBeCloseTo(iy - speedY);
    });

    it('update() underwater subtracts an extra 4 from y', () => {
        game.player.isUnderwater = true;
        fire = new Fire(game, 0, 10);

        fire.update();

        expect(fire.y).toBeCloseTo(10 - fire.speedY - 4);
    });

    it('draw() rotates and draws fire sprite with save/translate/rotate/restore', () => {
        fire.size = 50;
        fire.angle = Math.PI / 4;
        fire.x = 5;
        fire.y = 6;

        fire.draw(ctx);

        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.drawImage).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });
});

describe('resolveFireSplashImageId usage (Splash & Fire)', () => {
    let ctx;

    beforeEach(() => {
        ctx = { drawImage: jest.fn(), save: jest.fn(), translate: jest.fn(), rotate: jest.fn(), restore: jest.fn() };
    });

    it('Splash uses "fire" on land without blue potion', () => {
        const game = {
            player: { isUnderwater: false, isBluePotionActive: false },
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 0,
            menu: { pause: { isPaused: false } },
        };
        const s = new Splash(game, 0, 0);

        s.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalledWith(
            fakeImages.fire,
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number)
        );
    });

    it('Splash uses "bluefire" on land with blue potion active', () => {
        const game = {
            player: { isUnderwater: false, isBluePotionActive: true },
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 0,
            menu: { pause: { isPaused: false } },
        };
        const s = new Splash(game, 0, 0);

        s.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalledWith(
            fakeImages.bluefire,
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number)
        );
    });

    it('Splash uses "bubble" underwater without blue potion', () => {
        const game = {
            player: { isUnderwater: true, isBluePotionActive: false },
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 0,
            menu: { pause: { isPaused: false } },
        };
        const s = new Splash(game, 0, 0);

        s.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalledWith(
            fakeImages.bubble,
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number)
        );
    });

    it('Splash uses "bluebubble" underwater with blue potion active', () => {
        const game = {
            player: { isUnderwater: true, isBluePotionActive: true },
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 0,
            menu: { pause: { isPaused: false } },
        };
        const s = new Splash(game, 0, 0);

        s.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalledWith(
            fakeImages.bluebubble,
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number)
        );
    });

    it('Fire uses "bluefire" on land with blue potion active', () => {
        const game = {
            player: { isUnderwater: false, isBluePotionActive: true },
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 0,
            menu: { pause: { isPaused: false } },
        };
        const f = new Fire(game, 5, 6);
        f.size = 50;
        f.angle = Math.PI / 4;

        f.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalledWith(
            fakeImages.bluefire,
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number)
        );
    });

    it('Fire uses "bluebubble" underwater with blue potion active', () => {
        const game = {
            player: { isUnderwater: true, isBluePotionActive: true },
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 0,
            menu: { pause: { isPaused: false } },
        };
        const f = new Fire(game, 5, 6);
        f.size = 50;
        f.angle = Math.PI / 4;

        f.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalledWith(
            fakeImages.bluebubble,
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number)
        );
    });
});

describe('Fireball', () => {
    let game, fb, ctx;

    beforeEach(() => {
        game = {
            width: 200,
            debug: false,
            player: { isUnderwater: false, isRedPotionActive: false },
        };
        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            strokeRect: jest.fn(),
            drawImage: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            set globalCompositeOperation(val) { this._gco = val; },
            get globalCompositeOperation() { return this._gco; },
            createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
        };
        fb = new Fireball(game, 10, 20, 'fireball_img', 'right', 5);
    });

    it('update() moves right and applies verticalMovement minus half of growth-based offset', () => {
        const iy = fb.y;

        fb.update();

        const halfGrowth = fb.growthRate / 2;
        expect(fb.y).toBeCloseTo(iy + 5 - halfGrowth);
    });

    it('update() moves left when initialDirection="left"', () => {
        fb = new Fireball(game, 50, 0, 'fireball_img', 'left', 0);
        const ix = fb.x;

        fb.update();

        expect(fb.x).toBeCloseTo(ix - fb.speedX);
    });

    it('update() caps growth at maxSize', () => {
        fb.size = fb.maxSize - 1;
        fb.update();
        expect(fb.size).toBeLessThanOrEqual(fb.maxSize);
    });

    it('marks fireball for deletion when x > game.width', () => {
        fb.x = 500;
        fb.update();
        expect(fb.markedForDeletion).toBe(true);
    });

    it('marks fireball for deletion when fully off the left side', () => {
        fb = new Fireball(game, 0, 0, 'fireball_img', 'left', 0);
        fb.x = -fb.size - 1;
        fb.update();
        expect(fb.markedForDeletion).toBe(true);
    });

    it('draw() in non-debug mode skips strokeRect and draws sprite + sparkles', () => {
        fb.size = 10;
        fb.rotationAngle = 0;
        fb.x = 0;
        fb.y = 0;

        fb.draw(ctx);

        expect(ctx.strokeRect).not.toHaveBeenCalled();
        expect(ctx.drawImage).toHaveBeenCalled();
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
    });

    it('draw() in debug mode draws bounding box around sprite', () => {
        game.debug = true;
        fb = new Fireball(game, 50, 60, 'fireball_img', 'right', 0);
        fb.size = 20;
        fb.rotationAngle = Math.PI / 2;
        fb.x = 50;
        fb.y = 60;

        fb.draw(ctx);

        expect(ctx.strokeRect).toHaveBeenCalledWith(-10, -10, 20, 20);
    });

    it('draw() underwater uses bubble shader (gradients/arcs) and skips sprite', () => {
        game.player.isUnderwater = true;
        fb = new Fireball(game, 30, 40, 'fireball_img', 'right', 0);
        ctx.drawImage.mockClear();
        ctx.createRadialGradient.mockClear();

        fb.size = 24;
        fb.draw(ctx);

        expect(ctx.drawImage).not.toHaveBeenCalled();
        expect(ctx.createRadialGradient).toHaveBeenCalled();
    });

    it('draw() underwater in red mode still uses bubble shader and no sprite', () => {
        game.player.isUnderwater = true;
        game.player.isRedPotionActive = true;
        fb = new Fireball(game, 70, 80, 'fireball_img', 'right', 0);
        ctx.drawImage.mockClear();
        ctx.createRadialGradient.mockClear();

        fb.draw(ctx);

        expect(ctx.drawImage).not.toHaveBeenCalled();
        expect(ctx.createRadialGradient).toHaveBeenCalled();
    });
});

describe('CoinLoss', () => {
    let game, cl, ctx;

    beforeEach(() => {
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.3);

        game = {
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 1,
            player: { isUnderwater: false },
        };
        ctx = { drawImage: jest.fn() };
        cl = new CoinLoss(game, 20, 30);
        Math.random.mockRestore();
    });

    it('update() applies Particle movement, increases gravity, and shifts y by gravity', () => {
        const { x: ix, y: iy, speedX, speedY } = cl;

        cl.update();

        expect(cl.x).toBeCloseTo(ix - (speedX + game.speed));
        expect(cl.gravity).toBeCloseTo(0.14, 5);
        expect(cl.y).toBeCloseTo((iy - speedY) + 0.14, 5);
    });

    it('draw() renders coin sprite', () => {
        cl.draw(ctx);
        expect(ctx.drawImage).toHaveBeenCalled();
    });
});

describe('PoisonBubbles', () => {
    let game, ctx;

    beforeEach(() => {
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0.5);
        jest.spyOn(Math, 'sin').mockReturnValue(0);

        game = {
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 5,
            player: {},
            menu: { pause: { isPaused: false } },
        };

        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            beginPath: jest.fn(),
            closePath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            set globalAlpha(val) { this.ga = val; },
            get globalAlpha() { return this.ga; },
            set shadowColor(val) { this.sc = val; },
            get shadowColor() { return this.sc; },
            set shadowBlur(val) { this.sb = val; },
            get shadowBlur() { return this.sb; },
            set fillStyle(val) { this.fs = val; },
            get fillStyle() { return this.fs; },
            set strokeStyle(val) { this.ss = val; },
            get strokeStyle() { return this.ss; },
            set lineWidth(val) { this.lw = val; },
            get lineWidth() { return this.lw; },
        };
    });

    afterEach(() => {
        Math.random.mockRestore();
        Math.sin.mockRestore();
    });

    it('update() applies parallax, vertical rise, shrink, and fade while still alive', () => {
        const p = new PoisonBubbles(game, 100, 200, 'poison');
        const { size: isz } = p;

        p.update();

        expect(p.x).toBeCloseTo(100 - 5 * 0.2, 5);
        expect(p.y).toBeCloseTo(200 - 1.4, 5);
        expect(p.size).toBeCloseTo(isz * 0.992, 5);
        expect(p.life).toBeCloseTo(1 - 0.012, 5);
        expect(p.markedForDeletion).toBe(false);
    });

    it('update() uses zero parallax when cabin or boss is fully visible', () => {
        game.cabin.isFullyVisible = true;

        const p = new PoisonBubbles(game, 50, 50);
        p.update();

        expect(p.x).toBeCloseTo(50, 5);
    });

    it('marks bubble for deletion when size is too small or life is depleted', () => {
        const p1 = new PoisonBubbles(game, 0, 0);
        p1.size = 1.9;
        p1.update();
        expect(p1.markedForDeletion).toBe(true);

        const p2 = new PoisonBubbles(game, 0, 0);
        p2.life = 0.001;
        p2.update();
        expect(p2.markedForDeletion).toBe(true);
    });

    it('draw() renders bubble body, stroke, and highlight with proper styles', () => {
        const p = new PoisonBubbles(game, 10, 20, 'poison');

        p.draw(ctx);

        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });
});

describe('IceCrystalBubbles', () => {
    let game, ctx;

    beforeEach(() => {
        fakeImages.ice_crystal.complete = true;
        fakeImages.ice_crystal.naturalWidth = 10;

        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.4)
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0);
        jest.spyOn(Math, 'sin').mockReturnValue(0);

        game = {
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 3,
            player: {},
            menu: { pause: { isPaused: false } },
        };

        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            drawImage: jest.fn(),
            set globalAlpha(val) { this.ga = val; },
            get globalAlpha() { return this.ga; },
        };
    });

    afterEach(() => {
        Math.random.mockRestore();
        Math.sin.mockRestore();
    });

    it('update() ties alpha to life and applies motion, shrink, and fade', () => {
        const icb = new IceCrystalBubbles(game, 100, 100);
        const { size: isz } = icb;

        icb.update();

        expect(icb.x).toBeCloseTo(100 - 3 * 0.2, 5);
        expect(icb.y).toBeCloseTo(100 - 1.4, 5);
        expect(icb.size).toBeCloseTo(isz * 0.992, 5);
        expect(icb.alpha).toBeCloseTo(icb.life, 5);
    });

    it('draw() renders the ice crystal sprite using current alpha', () => {
        const icb = new IceCrystalBubbles(game, 10, 20);
        icb.size = 20;

        icb.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalledWith(
            fakeImages.ice_crystal,
            icb.x - icb.size / 2,
            icb.y - icb.size / 2,
            icb.size,
            icb.size
        );
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('marks bubble for deletion when life <= 0', () => {
        const icb = new IceCrystalBubbles(game, 0, 0);
        icb.life = 0.001;

        icb.update();

        expect(icb.markedForDeletion).toBe(true);
    });
});

describe('SpinningChicks', () => {
    let game, player, ctx;

    beforeEach(() => {
        player = {
            x: 100,
            y: 200,
            width: 50,
            height: 80,
            isConfused: true,
            states: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
            currentState: {},
        };

        game = {
            player,
            gameOver: false,
            menu: { pause: { isPaused: false } },
        };

        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            set globalCompositeOperation(val) { this._gco = val; },
            get globalCompositeOperation() { return this._gco; },
            createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
        };
    });

    test('positions 4 chicks in an ellipse around the player head at t=0', () => {
        const sc = new SpinningChicks(game);
        sc.drawChick = jest.fn();

        sc.draw(ctx);

        const px = player.x + player.width * 0.5 + sc.headOffsetX;
        const py = player.y + player.height * (0.5 - sc._headOffsetYRatio);

        const expected = [
            [px + 36, py + 0],
            [px + 0, py + 10],
            [px - 36, py + 0],
            [px + 0, py - 10],
        ];

        expect(sc.drawChick).toHaveBeenCalledTimes(4);
        for (let i = 0; i < 4; i++) {
            const call = sc.drawChick.mock.calls[i];
            const [, cx, cy] = call;
            expect(cx).toBeCloseTo(expected[i][0], 5);
            expect(cy).toBeCloseTo(expected[i][1], 5);
        }
    });

    test('marks for deletion when no longer confused', () => {
        const sc = new SpinningChicks(game);
        player.isConfused = false;

        sc.update();

        expect(sc.markedForDeletion).toBe(true);
    });

    test('marks for deletion when gameOver is true', () => {
        const sc = new SpinningChicks(game);
        game.gameOver = true;

        sc.update();

        expect(sc.markedForDeletion).toBe(true);
    });

    test('baseAngle/rockPhase advance only when not paused', () => {
        const sc = new SpinningChicks(game);
        const a0 = sc.baseAngle;
        const r0 = sc.rockPhase;

        sc.update();
        expect(sc.baseAngle).toBeCloseTo(a0 + sc.angularSpeed, 5);
        expect(sc.rockPhase).toBeCloseTo(r0 + sc.rockSpeed, 5);

        game.menu.pause.isPaused = true;
        const a1 = sc.baseAngle;
        const r1 = sc.rockPhase;

        sc.update();
        expect(sc.baseAngle).toBeCloseTo(a1, 5);
        expect(sc.rockPhase).toBeCloseTo(r1, 5);
    });

    test('head offset lerps toward sitting ratio when currentState === states[0]', () => {
        const sc = new SpinningChicks(game);
        expect(sc._headOffsetYRatio).toBeCloseTo(sc.headOffsetYRatioStand, 5);

        player.currentState = player.states[0];
        sc.update();

        const start = sc.headOffsetYRatioStand;
        const target = sc.headOffsetYRatioSit;
        const expected = start + (target - start) * sc.headOffsetYLerp;

        expect(sc._headOffsetYRatio).toBeCloseTo(expected, 5);
    });
});

describe('DashGhost', () => {
    let game, ctx;

    beforeEach(() => {
        game = {
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 3,
            menu: { pause: { isPaused: false } },
            player: {},
        };

        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            drawImage: jest.fn(),
            set globalAlpha(v) { this._ga = v; },
            get globalAlpha() { return this._ga; },
        };
    });

    test('update() moves by -(speedX + game.speed), fades life, shrinks scale, and eventually deletes', () => {
        const snapshot = {
            img: fakeImages.test_img,
            sx: 0, sy: 0, sw: 10, sh: 10,
            x: 100, y: 50,
            dw: 20, dh: 30,
            facingRight: true,
        };

        const g = new DashGhost(game, snapshot);

        g.speedX = 2;
        g.speedY = 1;

        const x0 = g.x;
        const y0 = g.y;

        g.update();

        expect(g.x).toBeCloseTo(x0 - (2 + game.speed));
        expect(g.y).toBeCloseTo(y0 - 1);
        expect(g.life).toBeCloseTo(1.0 - g.fadeSpeed, 5);
        expect(g.scale).toBeCloseTo(1.0 * g.shrink, 5);
        expect(g.markedForDeletion).toBe(false);

        g.life = 0.02;
        g.update();
        expect(g.markedForDeletion).toBe(true);
    });

    test('update() uses only speedX when cabin is fully visible', () => {
        game.cabin.isFullyVisible = true;

        const snapshot = {
            img: fakeImages.test_img,
            sx: 0, sy: 0, sw: 10, sh: 10,
            x: 100, y: 50,
            dw: 20, dh: 30,
            facingRight: true,
        };

        const g = new DashGhost(game, snapshot);
        g.speedX = 5;
        g.speedY = 0;

        g.update();
        expect(g.x).toBeCloseTo(95);
    });

    test('draw() flips when facingRight=false and draws using snapshot crop', () => {
        const snapshot = {
            img: fakeImages.test_img,
            sx: 1, sy: 2, sw: 3, sh: 4,
            x: 10, y: 20,
            dw: 30, dh: 40,
            facingRight: false,
        };

        const g = new DashGhost(game, snapshot);
        g.life = 1;

        g.draw(ctx);

        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.translate).toHaveBeenCalled();
        expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
        expect(ctx.drawImage).toHaveBeenCalledWith(
            fakeImages.test_img,
            1, 2, 3, 4,
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number)
        );
        expect(ctx.restore).toHaveBeenCalled();
    });
});

describe('DashFireArc', () => {
    let game, ctx;

    beforeEach(() => {
        game = {
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            speed: 2,
            deltaTime: 16,
            normalSpeed: 6,
            menu: { pause: { isPaused: false } },
            player: {
                x: 100,

                isUnderwater: false,
                isBluePotionActive: false,

                isDashing: false,
                dashInstanceId: 1,

                dashVelocity: 10,
            },
        };

        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            drawImage: jest.fn(),
        };
    });

    test('constructor picks correct imageId based on underwater/blue potion', () => {
        game.player.isUnderwater = false;
        game.player.isBluePotionActive = false;
        const p1 = new DashFireArc(game, 0, 0, true);
        expect(p1.imageId).toBe('fire');

        game.player.isUnderwater = false;
        game.player.isBluePotionActive = true;
        const p2 = new DashFireArc(game, 0, 0, true);
        expect(p2.imageId).toBe('bluefire');

        game.player.isUnderwater = true;
        game.player.isBluePotionActive = false;
        const p3 = new DashFireArc(game, 0, 0, true);
        expect(p3.imageId).toBe('bubble');

        game.player.isUnderwater = true;
        game.player.isBluePotionActive = true;
        const p4 = new DashFireArc(game, 0, 0, true);
        expect(p4.imageId).toBe('bluebubble');
    });

    test('update() early-returns when paused (age still increments due to super.update, but custom logic stops)', () => {
        const p = new DashFireArc(game, 100, 100, true);
        const x0 = p.x;
        const y0 = p.y;

        game.menu.pause.isPaused = true;

        p.update();

        expect(p.x).not.toBe(x0);
        expect(p.y).not.toBe(y0);

        expect(p.age).toBe(0);
    });

    test('follow logic: while age < followMs and same dash, x is additionally pushed by player.x delta * followFactor', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0);

        game.player.isDashing = true;
        game.player.dashInstanceId = 7;

        const p = new DashFireArc(game, 100, 100, true);

        game.player.x += 20;
        p.update();

        game.player.isDashing = true;
        game.player.dashInstanceId = 999;

        const p2 = new DashFireArc(game, 100, 100, true);

        game.player.dashInstanceId = 1000;

        game.player.x += 20;
        p2.update();

        expect(p.x).toBeGreaterThan(p2.x);

        Math.random.mockRestore();
    });

    test('underwater tweak: when underwater, update subtracts extra 0.35 from y (in addition to base)', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0);

        const pLand = new DashFireArc(game, 100, 100, true);
        const yLand0 = pLand.y;
        pLand.update();

        game.player.isUnderwater = true;
        const pWater = new DashFireArc(game, 100, 100, true);
        const yWater0 = pWater.y;
        pWater.update();

        expect(pWater.y - yWater0).toBeLessThan(pLand.y - yLand0);

        Math.random.mockRestore();
    });

    test('draw() draws the resolved image id and does not throw when image exists', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0);

        const p = new DashFireArc(game, 100, 100, true);
        p.size = 50;
        p.angle = Math.PI / 6;

        expect(() => p.draw(ctx)).not.toThrow();
        expect(ctx.drawImage).toHaveBeenCalledWith(
            fakeImages.fire,
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number)
        );

        Math.random.mockRestore();
    });
});
