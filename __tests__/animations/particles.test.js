import {
    Dust,
    IceCrystal,
    Bubble,
    Splash,
    Fire,
    Fireball,
    CoinLoss,
} from '../../game/animations/particles';

const fakeImages = {
    bubble: { name: 'bubble' },
    dust_black: { name: 'dust_black' },
    ice_crystal: { name: 'ice_crystal' },
    singleCoin: { name: 'singleCoin' },
    test_img: { name: 'test_img' },
    fireball_img: { name: 'fireball_img' },
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
    it('marks for deletion when size falls below 0.5', () => {
        const game = {
            cabin: { isFullyVisible: false },
            isElyvorgFullyVisible: false,
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

    it('uses only speedX when cabin.isFullyVisible=true', () => {
        const game = {
            cabin: { isFullyVisible: true },
            isElyvorgFullyVisible: false,
            speed: 5,
            player: {},
            menu: { pause: { isPaused: false } },
        };
        const p = new IceCrystal(game, 0, 0);
        p.size = 1; p.x = 10; p.y = 10; p.speedX = 2; p.speedY = 1;
        p.update();
        expect(p.x).toBeCloseTo(8);
        expect(p.y).toBeCloseTo(9);
    });

    it('uses only speedX when isElyvorgFullyVisible=true', () => {
        const game = {
            cabin: { isFullyVisible: false },
            isElyvorgFullyVisible: true,
            speed: 5,
            player: {},
            menu: { pause: { isPaused: false } },
        };
        const p = new IceCrystal(game, 0, 0);
        p.size = 1; p.x = 20; p.y = 20; p.speedX = 3; p.speedY = 1;
        p.update();
        expect(p.x).toBeCloseTo(17);
        expect(p.y).toBeCloseTo(19);
    });
});

describe('Dust', () => {
    let game, dust, ctx;
    beforeEach(() => {
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5) // size
            .mockReturnValueOnce(0.2) // speedX
            .mockReturnValueOnce(0.3) // speedY
            .mockReturnValueOnce(0.95) // createBubble
            .mockReturnValueOnce(0.8); // createDust
        game = {
            cabin: { isFullyVisible: false },
            isElyvorgFullyVisible: false,
            speed: 2,
            player: { isUnderwater: true },
            menu: { pause: { isPaused: false } },
        };
        ctx = { drawImage: jest.fn() };
        dust = new Dust(game, 100, 200);
    });
    afterEach(() => { Math.random.mockRestore(); });

    it('update() moves, shrinks, but does not delete', () => {
        const { x: ix, y: iy, size: isz, speedX, speedY } = dust;
        dust.update();
        expect(dust.x).toBeCloseTo(ix - (speedX + game.speed));
        expect(dust.y).toBeCloseTo(iy - speedY);
        expect(dust.size).toBeCloseTo(isz * 0.97);
        expect(dust.markedForDeletion).toBe(false);
    });

    it('draw() shows both and moves up when not paused', () => {
        dust.update();
        const afterY = dust.y;
        dust.draw(ctx);
        expect(ctx.drawImage).toHaveBeenCalledTimes(2);
        expect(dust.y).toBeCloseTo(afterY - 2);
    });

    it('draw() does not move up when paused', () => {
        game.menu.pause.isPaused = true;
        dust.update();
        const y0 = dust.y;
        dust.draw(ctx);
        expect(dust.y).toBe(y0);
    });

    it('draw() only dust when createBubble=false, createDust=true', () => {
        Math.random.mockRestore();
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0) // createBubble false
            .mockReturnValueOnce(0.8); // createDust true
        dust = new Dust(game, 0, 0);
        dust.update();
        ctx.drawImage.mockClear();
        dust.draw(ctx);
        expect(ctx.drawImage).toHaveBeenCalledTimes(1);
        expect(dust.y).toBeCloseTo(0 - dust.speedY);
    });

    it('draw() only bubble when createBubble=true, createDust=false', () => {
        Math.random.mockRestore();
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.95) // createBubble true
            .mockReturnValueOnce(0); // createDust false
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
    beforeEach(() => { game = { player: {} }; ctx = { drawImage: jest.fn() }; });
    it('draws when createIce=true', () => {
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
    it('skips when createIce=false', () => {
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
            isElyvorgFullyVisible: false,
            speed: 1,
            player: { isUnderwater: true },
            menu: { pause: { isPaused: false } },
        };
        ctx = { drawImage: jest.fn() };
        bubble = new Bubble(game, 20, 30);
    });
    afterEach(() => Math.random.mockRestore());

    it('update()+draw() underwater moves up 2px', () => {
        bubble.update();
        const yAfter = bubble.y;
        bubble.draw(ctx);
        expect(bubble.y).toBeCloseTo(yAfter - 2);
    });

    it('draw() does nothing when createBubble=false', () => {
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
            isElyvorgFullyVisible: false,
            speed: 1,
            player: { isUnderwater: false, particleImage: 'test_img' },
        };
        ctx = { drawImage: jest.fn() };
        splash = new Splash(game, 10, 10);
        Math.random.mockRestore();
    });

    it('non-underwater update() ignores gravity on first call', () => {
        const { y: iy, speedY } = splash;
        splash.update();
        expect(splash.y).toBeCloseTo(iy - speedY);
    });

    it('underwater update() subtracts gravity*0.6', () => {
        game.player.isUnderwater = true;
        splash = new Splash(game, 0, 0);
        splash.gravity = 1;
        splash.y = 50;
        splash.speedY = 2;
        splash.update();
        expect(splash.y).toBeCloseTo(47.4);
    });

    it('draw() renders image', () => {
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
            isElyvorgFullyVisible: false,
            speed: 2,
            player: { isUnderwater: false, particleImage: 'test_img' },
        };
        ctx = {
            save: jest.fn(), translate: jest.fn(),
            rotate: jest.fn(), drawImage: jest.fn(), restore: jest.fn(),
        };
        fire = new Fire(game, 10, 15);
        Math.random.mockRestore();
    });

    it('not underwater update() does not subtract extra 4', () => {
        const { y: iy, speedY } = fire;
        fire.update();
        expect(fire.y).toBeCloseTo(iy - speedY);
    });

    it('underwater branch subtracts 4 from y', () => {
        game.player.isUnderwater = true;
        fire = new Fire(game, 0, 10);
        fire.update();
        expect(fire.y).toBeCloseTo(5);
    });

    it('draw() applies transform', () => {
        fire.size = 50; fire.angle = Math.PI / 4; fire.x = 5; fire.y = 6;
        fire.draw(ctx);
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.drawImage).toHaveBeenCalled();
    });
});

describe('Fireball', () => {
    let game, fb, ctx;
    beforeEach(() => {
        game = { width: 200, debug: false, player: { isUnderwater: false, isRedPotionActive: false } };
        ctx = {
            save: jest.fn(), translate: jest.fn(), rotate: jest.fn(),
            strokeRect: jest.fn(), drawImage: jest.fn(), restore: jest.fn(),
        };
        fb = new Fireball(game, 10, 20, 'fireball_img', 'right', 5);
    });

    it('update() moves right and applies verticalMovement minus half growth', () => {
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

    it('growth caps at maxSize', () => {
        fb.size = fb.maxSize - 1;
        fb.update();
        expect(fb.size).toBeLessThanOrEqual(fb.maxSize);
    });

    it('deletes when x > width', () => {
        fb.x = 500; fb.update();
        expect(fb.markedForDeletion).toBe(true);
    });

    it('draw() without debug skips strokeRect', () => {
        fb.size = 10; fb.rotationAngle = 0; fb.x = 0; fb.y = 0;
        fb.draw(ctx);
        expect(ctx.strokeRect).not.toHaveBeenCalled();
        expect(ctx.drawImage).toHaveBeenCalled();
    });

    it('draw() with debug draws bounding box', () => {
        game.debug = true;
        fb = new Fireball(game, 50, 60, 'fireball_img', 'right', 0);
        fb.size = 20; fb.rotationAngle = Math.PI / 2; fb.x = 50; fb.y = 60;
        fb.draw(ctx);
        expect(ctx.strokeRect).toHaveBeenCalledWith(-10, -10, 20, 20);
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
            isElyvorgFullyVisible: false,
            speed: 1,
            player: { particleImage: 'singleCoin', isUnderwater: false },
        };
        ctx = { drawImage: jest.fn() };
        cl = new CoinLoss(game, 20, 30);
        Math.random.mockRestore();
    });

    it('update() moves, grows gravity, and shifts y', () => {
        const { x: ix, y: iy, speedX, speedY } = cl;
        cl.update();
        expect(cl.x).toBeCloseTo(ix - (speedX + game.speed));
        expect(cl.gravity).toBeCloseTo(0.14, 5);
        expect(cl.y).toBeCloseTo((iy - speedY) + 0.14, 5);
    });

    it('draw() renders coin', () => {
        cl.draw(ctx);
        expect(ctx.drawImage).toHaveBeenCalled();
    });
});
