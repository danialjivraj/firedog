import {
    RedPotion, BluePotion, Hourglass, HealthLive, Coin, OxygenTank,
    IceDrink, IceCube, Cauldron, BlackHole, Confuse, DeadSkull, CarbonDioxideTank
} from '../../game/entities/powerUpAndDown';

describe('PowerUp & PowerDown subclasses', () => {
    let game, ctx;

    const fakeImages = {
        redpotion: {},
        bluepotion: {},
        hourglass: {},
        healthlive: {},
        coin: {},
        oxygenTank: {},
        iceDrink: {},
        iceCube: {},
        cauldron: {},
        blackhole: {},
        confuse: {},
        deadskull: {},
        carbonDioxideTank: {},
    };

    beforeAll(() => {
        document.getElementById = jest.fn(id => fakeImages[id] || {});
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    beforeEach(() => {
        const gradientMock = {
            addColorStop: jest.fn(),
        };

        ctx = {
            strokeRect: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            drawImage: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            beginPath: jest.fn(),
            ellipse: jest.fn(),
            fill: jest.fn(),
            createRadialGradient: jest.fn(() => gradientMock),
            shadowColor: '',
            shadowBlur: 0,
            globalCompositeOperation: '',
            globalAlpha: 1,
            fillStyle: null,
        };

        game = {
            width: 1920,
            height: 689,
            speed: 7,
            groundMargin: 20,
            cabin: { isFullyVisible: false },
            player: { x: 200, y: 100, isSlowed: false },
            debug: false,
        };
    });

    // -----------------------------------------------------------------------
    // Shared behavior tests — all 13 subclasses share movement, animation,
    // off-screen deletion, draw, and debug rect logic from the base class.
    // Testing one representative from each category (PowerUp vs PowerDown)
    // covers this inherited behavior without repeating it 13 times.
    // -----------------------------------------------------------------------

    describe('shared PowerUp behavior (via RedPotion)', () => {
        let item;
        beforeEach(() => { item = new RedPotion(game); });

        test('moves left by game.speed when cabin not visible', () => {
            const start = item.x;
            item.update(13.333);
            expect(item.x).toBe(start - game.speed);
        });

        test('does not move when cabin is fully visible', () => {
            game.cabin.isFullyVisible = true;
            const start = item.x;
            item.update(16);
            expect(item.x).toBe(start);
        });

        test('animation wraps frameX at maxFrame and advances below it', () => {
            item.frameTimer = item.frameInterval + 1;
            item.frameX = item.maxFrame;
            item.update(0);
            expect(item.frameX).toBe(0);
            expect(item.frameTimer).toBe(0);

            item.frameTimer = item.frameInterval + 1;
            item.frameX = 0;
            item.update(0);
            expect(item.frameX).toBe(1);
        });

        test('increments frameTimer when below interval', () => {
            item.frameInterval = 1000;
            item.frameTimer = 0;
            item.update(200);
            expect(item.frameTimer).toBe(200);
        });

        test('markedForDeletion when off-screen horizontally or vertically', () => {
            item.x = -item.width - 1;
            item.y = 10;
            item.update(0);
            expect(item.markedForDeletion).toBe(true);

            item.markedForDeletion = false;
            item.x = 10;
            item.y = game.height + 1;
            item.update(0);
            expect(item.markedForDeletion).toBe(true);
        });

        test('draw calls save/restore and drawImage with shadow glow', () => {
            item.draw(ctx);
            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.shadowBlur).toBeGreaterThan(0);
            expect(ctx.drawImage).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
        });

        test('draw shows debug rect when game.debug=true', () => {
            game.debug = true;
            item.draw(ctx);
            expect(ctx.strokeRect).toHaveBeenCalled();
        });
    });

    describe('shared PowerDown behavior (via IceDrink)', () => {
        let item;
        beforeEach(() => { item = new IceDrink(game); });

        test('moves left by game.speed when cabin not visible', () => {
            const start = item.x;
            item.update(13.333);
            expect(item.x).toBe(start - game.speed);
        });

        test('does not move when cabin is fully visible', () => {
            game.cabin.isFullyVisible = true;
            const start = item.x;
            item.update(16);
            expect(item.x).toBe(start);
        });

        test('animation wraps frameX at maxFrame and advances below it', () => {
            item.frameTimer = item.frameInterval + 1;
            item.frameX = item.maxFrame;
            item.update(0);
            expect(item.frameX).toBe(0);

            item.frameTimer = item.frameInterval + 1;
            item.frameX = 0;
            item.update(0);
            expect(item.frameX).toBe(1);
        });

        test('markedForDeletion when off-screen', () => {
            item.x = -item.width - 1;
            item.update(0);
            expect(item.markedForDeletion).toBe(true);

            item.markedForDeletion = false;
            item.x = 100;
            item.y = game.height + 1;
            item.update(0);
            expect(item.markedForDeletion).toBe(true);
        });

        test('draw uses red shadow glow', () => {
            item.draw(ctx);
            expect(ctx.shadowColor).toBe('red');
            expect(ctx.shadowBlur).toBe(10);
            expect(ctx.drawImage).toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // Per-class tests — only test what's UNIQUE to each subclass
    // -----------------------------------------------------------------------

    describe('PowerUp shadow colors', () => {
        test('RedPotion uses yellow glow', () => {
            const item = new RedPotion(game);
            item.draw(ctx);
            expect(ctx.shadowColor).toBe('yellow');
        });

        test('HealthLive uses yellow glow with shadowBlur=25', () => {
            const item = new HealthLive(game);
            item.draw(ctx);
            expect(ctx.shadowColor).toBe('yellow');
            expect(ctx.shadowBlur).toBe(25);
        });
    });

    describe('all subclasses instantiate without errors', () => {
        test.each([
            ['RedPotion', RedPotion],
            ['BluePotion', BluePotion],
            ['Hourglass', Hourglass],
            ['HealthLive', HealthLive],
            ['Coin', Coin],
            ['OxygenTank', OxygenTank],
            ['IceDrink', IceDrink],
            ['IceCube', IceCube],
            ['Cauldron', Cauldron],
            ['BlackHole', BlackHole],
            ['Confuse', Confuse],
            ['DeadSkull', DeadSkull],
            ['CarbonDioxideTank', CarbonDioxideTank],
        ])('%s constructs with valid dimensions and animation state', (_, Cls) => {
            const item = new Cls(game);
            expect(item.game).toBe(game);
            expect(item.width).toBeGreaterThan(0);
            expect(item.height).toBeGreaterThan(0);
            expect(item.frameX).toBe(0);
            expect(item.frameTimer).toBe(0);
            expect(item.markedForDeletion).toBe(false);
        });
    });

    // -----------------------------------------------------------------------
    // BlackHole — unique pull mechanic
    // -----------------------------------------------------------------------
    describe('BlackHole', () => {
        let hole;
        beforeEach(() => {
            hole = new BlackHole(game);
            game.player.y = hole.y;
        });

        test('adjusts pullStrength based on player.isSlowed', () => {
            hole.x = 0;
            game.cabin.isFullyVisible = true;
            game.player.isSlowed = false;
            hole.update(100);
            expect(hole.pullStrength).toBe(0.3);

            game.player.isSlowed = true;
            hole.update(100);
            expect(hole.pullStrength).toBe(0.1);
        });

        test('pulls player horizontally when in range', () => {
            hole.x = game.width - hole.width / 2 - 1;
            game.cabin.isFullyVisible = true;
            game.player.x = 200;
            const beforeX = game.player.x;
            hole.update(1000);
            expect(game.player.x).toBeGreaterThan(beforeX);
        });
    });

    // -----------------------------------------------------------------------
    // Cauldron — fixed ground-level y position
    // -----------------------------------------------------------------------
    describe('Cauldron', () => {
        test('spawns at ground level (not random y)', () => {
            const cauldron = new Cauldron(game);
            expect(cauldron.y).toBe(game.height - cauldron.height - game.groundMargin);
        });
    });
});
