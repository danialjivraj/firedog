import {
    RedPotion, BluePotion, HealthLive, Coin, OxygenTank,
    IceDrink, Cauldron, BlackHole, Confuse, DeadSkull
} from '../../game/entities/powerUpAndDown';

describe('PowerUp & PowerDown subclasses (merged)', () => {
    let game, ctx;

    const fakeImages = {
        // power ups
        redpotion: {},
        bluepotion: {},
        healthlive: {},
        coin: {},
        oxygenTank: {},
        // power downs
        iceDrink: {},
        cauldron: {},
        blackhole: {},
        confuse: {},
        deadskull: {},
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
    });

    // PowerUp tests
    describe('PowerUp subclasses', () => {
        beforeEach(() => {
            game = {
                width: 1920,
                height: 689,
                speed: 7,
                groundMargin: 20,
                cabin: { isFullyVisible: false },
                debug: false,
            };
            game.player = { x: 100, y: 100 };
        });

        // ---------------------------------------------------------------------------
        // RedPotion
        // ---------------------------------------------------------------------------
        describe('RedPotion', () => {
            let red;
            beforeEach(() => {
                red = new RedPotion(game);
            });

            test('constructor sets up fields and random positions', () => {
                expect(red.game).toBe(game);
                expect(red.width).toBe(77.4);
                expect(red.height).toBe(65);
                expect(red.image).toBe(fakeImages.redpotion);
                expect(red.maxFrame).toBe(4);
                expect(red.frameWidth).toBe(77.4);
                expect(red.frameHeight).toBe(65);
                expect(red.x).toBeCloseTo(game.width + game.width * 0.5 * 0.5);
                const yMin = game.height - red.height - game.groundMargin;
                const yMax = 130;
                expect(red.y).toBeCloseTo(yMin + 0.5 * (yMax - yMin));
                expect(red.frameX).toBe(0);
                expect(red.frameTimer).toBe(0);
                expect(red.markedForDeletion).toBe(false);
            });

            test('update moves left when cabin not visible and animation wraps when needed', () => {
                const start = red.x;
                red.update(16);
                expect(red.x).toBe(start - game.speed);
                red.frameTimer = red.frameInterval + 1;
                red.frameX = red.maxFrame;
                red.update(0);
                expect(red.frameX).toBe(0);
                expect(red.frameTimer).toBe(0);
            });

            test('animation advances frameX when below maxFrame', () => {
                red.frameTimer = red.frameInterval + 1;
                red.frameX = 0;
                red.update(0);
                expect(red.frameX).toBe(1);
            });

            test('update does not move when cabin visible', () => {
                game.cabin.isFullyVisible = true;
                const startX = red.x;
                red.update(16);
                expect(red.x).toBe(startX);
            });

            test('markedForDeletion when off-screen horizontally or vertically', () => {
                red.x = -red.width - 1;
                red.y = 10;
                red.update(0);
                expect(red.markedForDeletion).toBe(true);
                red.markedForDeletion = false;
                red.x = 10;
                red.y = game.height + 1;
                red.update(0);
                expect(red.markedForDeletion).toBe(true);
            });

            test('draw uses yellow shadowBlur=10, calls save/restore and correct drawImage', () => {
                red.draw(ctx);
                expect(ctx.save).toHaveBeenCalled();
                expect(ctx.shadowColor).toBe('yellow');
                expect(ctx.shadowBlur).toBe(10);
                expect(ctx.drawImage).toHaveBeenCalledWith(
                    fakeImages.redpotion,
                    red.frameX * red.frameWidth,
                    red.frameY * red.frameHeight,
                    red.frameWidth,
                    red.frameHeight,
                    red.x,
                    red.y,
                    red.width,
                    red.height
                );
                expect(ctx.restore).toHaveBeenCalled();
            });

            test('draw shows debug rect when game.debug=true', () => {
                game.debug = true;
                red.draw(ctx);
                expect(ctx.strokeRect).toHaveBeenCalledWith(red.x, red.y, red.width, red.height);
            });
        });

        // ---------------------------------------------------------------------------
        // BluePotion
        // ---------------------------------------------------------------------------
        describe('BluePotion', () => {
            let blue;
            beforeEach(() => {
                blue = new BluePotion(game);
            });

            test('constructor fields and position', () => {
                expect(blue.image).toBe(fakeImages.bluepotion);
                expect(blue.width).toBe(77.4);
                expect(blue.height).toBe(65);
                expect(blue.frameX).toBe(0);
                expect(blue.frameTimer).toBe(0);
            });

            test('update moves left when cabin not visible', () => {
                const start = blue.x;
                blue.update(16);
                expect(blue.x).toBe(start - game.speed);
            });

            test('update does not move when cabin visible', () => {
                blue.x = 500;
                game.cabin.isFullyVisible = true;
                blue.update(16);
                expect(blue.x).toBe(500);
            });

            test('animation increments frameTimer when below interval', () => {
                blue.frameInterval = 1000;
                blue.frameTimer = 0;
                blue.update(200);
                expect(blue.frameTimer).toBe(200);
            });

            test('animation wraps frameX when at maxFrame', () => {
                blue.frameTimer = blue.frameInterval + 1;
                blue.frameX = blue.maxFrame;
                blue.update(0);
                expect(blue.frameX).toBe(0);
                expect(blue.frameTimer).toBe(0);
            });

            test('animation advances frameX when below maxFrame', () => {
                blue.frameTimer = blue.frameInterval + 1;
                blue.frameX = 0;
                blue.update(0);
                expect(blue.frameX).toBe(1);
            });

            test('markedForDeletion when off-screen horizontally or vertically', () => {
                blue.x = -blue.width - 1;
                blue.y = 100;
                blue.update(0);
                expect(blue.markedForDeletion).toBe(true);
                blue.markedForDeletion = false;
                blue.x = 100;
                blue.y = game.height + 1;
                blue.update(0);
                expect(blue.markedForDeletion).toBe(true);
            });

            test('draw uses yellow shadowBlur=10, calls save/restore and correct drawImage', () => {
                blue.draw(ctx);
                expect(ctx.save).toHaveBeenCalled();
                expect(ctx.shadowColor).toBe('yellow');
                expect(ctx.shadowBlur).toBe(10);
                expect(ctx.drawImage).toHaveBeenCalledWith(
                    fakeImages.bluepotion,
                    blue.frameX * blue.frameWidth,
                    blue.frameY * blue.frameHeight,
                    blue.frameWidth,
                    blue.frameHeight,
                    blue.x,
                    blue.y,
                    blue.width,
                    blue.height
                );
                expect(ctx.restore).toHaveBeenCalled();
            });

            test('draw shows debug rect when game.debug=true', () => {
                game.debug = true;
                blue.draw(ctx);
                expect(ctx.strokeRect).toHaveBeenCalledWith(blue.x, blue.y, blue.width, blue.height);
            });
        });

        // ---------------------------------------------------------------------------
        // HealthLive
        // ---------------------------------------------------------------------------
        describe('HealthLive', () => {
            let hl;
            beforeEach(() => {
                hl = new HealthLive(game);
            });

            test('constructor fields and position', () => {
                expect(hl.image).toBe(fakeImages.healthlive);
                expect(hl.width).toBe(50);
                expect(hl.height).toBe(50);
                expect(hl.frameX).toBe(0);
                expect(hl.frameTimer).toBe(0);
            });

            test('update moves left when cabin not visible', () => {
                const start = hl.x;
                hl.update(16);
                expect(hl.x).toBe(start - game.speed);
            });

            test('update does not move when cabin visible', () => {
                hl.x = 400;
                game.cabin.isFullyVisible = true;
                hl.update(16);
                expect(hl.x).toBe(400);
            });

            test('animation increments frameTimer when below interval', () => {
                hl.frameInterval = 1000;
                hl.frameTimer = 0;
                hl.update(300);
                expect(hl.frameTimer).toBe(300);
            });

            test('animation wraps frameX when at maxFrame', () => {
                hl.frameTimer = hl.frameInterval + 1;
                hl.frameX = hl.maxFrame;
                hl.update(0);
                expect(hl.frameX).toBe(0);
                expect(hl.frameTimer).toBe(0);
            });

            test('animation advances frameX when below maxFrame', () => {
                hl.frameTimer = hl.frameInterval + 1;
                hl.frameX = 0;
                hl.update(0);
                expect(hl.frameX).toBe(1);
            });

            test('markedForDeletion when off-screen horizontally or vertically', () => {
                hl.x = -hl.width - 1;
                hl.y = 100;
                hl.update(0);
                expect(hl.markedForDeletion).toBe(true);
                hl.markedForDeletion = false;
                hl.x = 100;
                hl.y = game.height + 1;
                hl.update(0);
                expect(hl.markedForDeletion).toBe(true);
            });

            test('draw uses yellow shadowBlur=25, calls save/restore and correct drawImage', () => {
                hl.draw(ctx);
                expect(ctx.save).toHaveBeenCalled();
                expect(ctx.shadowColor).toBe('yellow');
                expect(ctx.shadowBlur).toBe(25);
                expect(ctx.drawImage).toHaveBeenCalledWith(
                    fakeImages.healthlive,
                    hl.frameX * hl.frameWidth,
                    hl.frameY * hl.frameHeight,
                    hl.frameWidth,
                    hl.frameHeight,
                    hl.x,
                    hl.y,
                    hl.width,
                    hl.height
                );
                expect(ctx.restore).toHaveBeenCalled();
            });

            test('draw shows debug rect when game.debug=true', () => {
                game.debug = true;
                hl.draw(ctx);
                expect(ctx.strokeRect).toHaveBeenCalledWith(hl.x, hl.y, hl.width, hl.height);
            });
        });

        // ---------------------------------------------------------------------------
        // Coin
        // ---------------------------------------------------------------------------
        describe('Coin', () => {
            let coin;
            beforeEach(() => {
                coin = new Coin(game);
            });

            test('constructor sets fps=30 and frameInterval accordingly', () => {
                expect(coin.fps).toBe(30);
                expect(coin.frameInterval).toBeCloseTo(1000 / 30);
                expect(coin.image).toBe(fakeImages.coin);
                expect(coin.maxFrame).toBe(17);
                expect(coin.frameX).toBe(0);
                expect(coin.frameTimer).toBe(0);
            });

            test('update moves left when cabin not visible', () => {
                const start = coin.x;
                coin.update(16);
                expect(coin.x).toBe(start - game.speed);
            });

            test('update does not move when cabin visible', () => {
                coin.x = 300;
                game.cabin.isFullyVisible = true;
                coin.update(16);
                expect(coin.x).toBe(300);
            });

            test('animation wraps frameX when timer exceeds interval and increments when below', () => {
                coin.frameTimer = coin.frameInterval + 1;
                coin.frameX = coin.maxFrame;
                coin.update(0);
                expect(coin.frameX).toBe(0);
                expect(coin.frameTimer).toBe(0);
                coin.frameInterval = 100;
                coin.frameTimer = 0;
                coin.update(50);
                expect(coin.frameTimer).toBe(50);
            });

            test('animation advances frameX when below maxFrame', () => {
                coin.frameTimer = coin.frameInterval + 1;
                coin.frameX = 0;
                coin.update(0);
                expect(coin.frameX).toBe(1);
            });

            test('markedForDeletion when off-screen horizontally or vertically', () => {
                coin.x = -coin.width - 1;
                coin.y = 100;
                coin.update(0);
                expect(coin.markedForDeletion).toBe(true);
                coin.markedForDeletion = false;
                coin.x = 100;
                coin.y = game.height + 1;
                coin.update(0);
                expect(coin.markedForDeletion).toBe(true);
            });

            test('draw uses yellow shadowBlur=10, calls save/restore and correct drawImage', () => {
                coin.draw(ctx);
                expect(ctx.save).toHaveBeenCalled();
                expect(ctx.shadowColor).toBe('yellow');
                expect(ctx.shadowBlur).toBe(10);
                expect(ctx.drawImage).toHaveBeenCalledWith(
                    fakeImages.coin,
                    coin.frameX * coin.frameWidth,
                    coin.frameY * coin.frameHeight,
                    coin.frameWidth,
                    coin.frameHeight,
                    coin.x,
                    coin.y,
                    coin.width,
                    coin.height
                );
                expect(ctx.restore).toHaveBeenCalled();
            });

            test('draw shows debug rect when game.debug=true', () => {
                game.debug = true;
                coin.draw(ctx);
                expect(ctx.strokeRect).toHaveBeenCalledWith(coin.x, coin.y, coin.width, coin.height);
            });
        });

        // ---------------------------------------------------------------------------
        // OxygenTank
        // ---------------------------------------------------------------------------
        describe('OxygenTank', () => {
            let tank;
            beforeEach(() => {
                tank = new OxygenTank(game);
            });

            test('constructor sets fps=0 and infinite interval', () => {
                expect(tank.fps).toBe(5);
                expect(tank.frameInterval).toBe(200);
                expect(tank.image).toBe(fakeImages.oxygenTank);
                expect(tank.frameX).toBe(0);
                expect(tank.frameTimer).toBe(0);
            });

            test('update moves left when cabin not visible', () => {
                const start = tank.x;
                tank.update(16);
                expect(tank.x).toBe(start - game.speed);
            });

            test('update does not move when cabin visible', () => {
                tank.x = 250;
                game.cabin.isFullyVisible = true;
                tank.update(16);
                expect(tank.x).toBe(250);
            });

            test('animation increments frameTimer for infinite interval', () => {
                tank.frameTimer = 0;
                tank.update(200);
                expect(tank.frameTimer).toBe(200);
            });

            test('markedForDeletion when off-screen horizontally or vertically', () => {
                tank.x = -tank.width - 1;
                tank.y = 0;
                tank.update(0);
                expect(tank.markedForDeletion).toBe(true);
                tank.markedForDeletion = false;
                tank.x = 100;
                tank.y = game.height + 1;
                tank.update(0);
                expect(tank.markedForDeletion).toBe(true);
            });

            test('draw uses yellow shadowBlur=10, calls save/restore and correct drawImage', () => {
                tank.draw(ctx);
                expect(ctx.save).toHaveBeenCalled();
                expect(ctx.shadowColor).toBe('yellow');
                expect(ctx.shadowBlur).toBe(10);
                expect(ctx.drawImage).toHaveBeenCalledWith(
                    fakeImages.oxygenTank,
                    tank.frameX * tank.frameWidth,
                    tank.frameY * tank.frameHeight,
                    tank.frameWidth,
                    tank.frameHeight,
                    tank.x,
                    tank.y,
                    tank.width,
                    tank.height
                );
                expect(ctx.restore).toHaveBeenCalled();
            });

            test('draw shows debug rect when game.debug=true', () => {
                game.debug = true;
                tank.draw(ctx);
                expect(ctx.strokeRect).toHaveBeenCalledWith(tank.x, tank.y, tank.width, tank.height);
            });
        });
    });

    // PowerDown tests
    describe('PowerDown subclasses', () => {
        beforeEach(() => {
            game = {
                width: 1920,
                height: 689,
                speed: 5,
                groundMargin: 20,
                cabin: { isFullyVisible: false },
                player: { x: 200, y: 100, isSlowed: false },
                debug: false,
            };
        });

        // ---------------------------------------------------------------------------
        // IceDrink
        // ---------------------------------------------------------------------------
        describe('IceDrink', () => {
            let iceDrink;
            beforeEach(() => {
                iceDrink = new IceDrink(game);
            });

            test('constructor sets correct props and random x/y', () => {
                expect(iceDrink.game).toBe(game);
                expect(iceDrink.width).toBe(65);
                expect(iceDrink.height).toBe(65);
                expect(iceDrink.image).toBe(fakeImages.iceDrink);
                expect(iceDrink.maxFrame).toBe(4);
                const expectedX = game.width + game.width * 0.5 * 0.5;
                expect(iceDrink.x).toBeCloseTo(expectedX);
                const minY = game.height - iceDrink.height - game.groundMargin;
                const maxY = 130;
                expect(iceDrink.y).toBeCloseTo(minY + 0.5 * (maxY - minY));
                expect(iceDrink.frameX).toBe(0);
                expect(iceDrink.frameTimer).toBe(0);
                expect(iceDrink.markedForDeletion).toBe(false);
            });

            test('update moves left when cabin not visible', () => {
                const startX = iceDrink.x;
                iceDrink.update(16);
                expect(iceDrink.x).toBe(startX - game.speed);
            });

            test('update does not move when cabin visible', () => {
                const startX = iceDrink.x;
                game.cabin.isFullyVisible = true;
                iceDrink.update(16);
                expect(iceDrink.x).toBe(startX);
            });

            test('animation wraps frameX and resets timer', () => {
                iceDrink.frameTimer = iceDrink.frameInterval + 1;
                iceDrink.frameX = iceDrink.maxFrame;
                iceDrink.update(0);
                expect(iceDrink.frameX).toBe(0);
                expect(iceDrink.frameTimer).toBe(0);
                iceDrink.frameInterval = 1000;
                iceDrink.frameTimer = 0;
                iceDrink.update(100);
                expect(iceDrink.frameTimer).toBe(100);
            });

            test('animation advances frameX when below maxFrame', () => {
                iceDrink.frameTimer = iceDrink.frameInterval + 1;
                iceDrink.frameX = 0;
                iceDrink.update(0);
                expect(iceDrink.frameX).toBe(1);
            });

            test('markedForDeletion when off-screen horizontally or vertically', () => {
                iceDrink.x = -iceDrink.width - 1;
                iceDrink.update(0);
                expect(iceDrink.markedForDeletion).toBe(true);
                iceDrink.markedForDeletion = false;
                iceDrink.x = 100;
                iceDrink.y = game.height + 1;
                iceDrink.update(0);
                expect(iceDrink.markedForDeletion).toBe(true);
            });

            test('draw uses red shadowBlur=10 and skips debug rect by default', () => {
                iceDrink.draw(ctx);
                expect(ctx.save).toHaveBeenCalled();
                expect(ctx.shadowColor).toBe('red');
                expect(ctx.shadowBlur).toBe(10);
                expect(ctx.drawImage).toHaveBeenCalledWith(
                    fakeImages.iceDrink,
                    iceDrink.frameX * iceDrink.frameWidth,
                    iceDrink.frameY * iceDrink.frameHeight,
                    iceDrink.frameWidth,
                    iceDrink.frameHeight,
                    iceDrink.x,
                    iceDrink.y,
                    iceDrink.width,
                    iceDrink.height
                );
                expect(ctx.restore).toHaveBeenCalled();
            });

            test('draw draws debug rect when game.debug=true', () => {
                game.debug = true;
                iceDrink.draw(ctx);
                expect(ctx.strokeRect).toHaveBeenCalledWith(iceDrink.x, iceDrink.y, iceDrink.width, iceDrink.height);
            });
        });

        // ---------------------------------------------------------------------------
        // Cauldron
        // ---------------------------------------------------------------------------
        describe('Cauldron', () => {
            let cauldron;
            beforeEach(() => {
                cauldron = new Cauldron(game);
            });

            test('constructor sets fixed y at ground and random x', () => {
                expect(cauldron.width).toBeCloseTo(55.33333333333333);
                expect(cauldron.height).toBe(100);
                expect(cauldron.image).toBe(fakeImages.cauldron);
                const expectedX = game.width + game.width * 0.5 * 0.5;
                expect(cauldron.x).toBeCloseTo(expectedX);
                expect(cauldron.y).toBe(game.height - cauldron.height - game.groundMargin);
            });

            test('initial frameX and frameTimer defaults', () => {
                expect(cauldron.frameX).toBe(0);
                expect(cauldron.frameTimer).toBe(0);
            });

            test('update moves left and animation increments frameTimer when below interval', () => {
                const startX = cauldron.x;
                cauldron.update(20);
                expect(cauldron.x).toBe(startX - game.speed);
                cauldron.frameInterval = 1000;
                cauldron.frameTimer = 0;
                cauldron.update(100);
                expect(cauldron.frameTimer).toBe(100);
            });

            test('update does not move when cabin visible', () => {
                game.cabin.isFullyVisible = true;
                const startX = cauldron.x;
                cauldron.update(16);
                expect(cauldron.x).toBe(startX);
            });

            test('animation wraps frameX when at maxFrame', () => {
                cauldron.frameTimer = cauldron.frameInterval + 1;
                cauldron.frameX = cauldron.maxFrame;
                cauldron.update(0);
                expect(cauldron.frameX).toBe(0);
                expect(cauldron.frameTimer).toBe(0);
            });

            test('animation advances frameX when below maxFrame', () => {
                cauldron.frameTimer = cauldron.frameInterval + 1;
                cauldron.frameX = 0;
                cauldron.update(0);
                expect(cauldron.frameX).toBe(1);
            });

            test('markedForDeletion when off-screen horizontally or vertically', () => {
                cauldron.x = -cauldron.width - 1;
                cauldron.update(0);
                expect(cauldron.markedForDeletion).toBe(true);
                cauldron.markedForDeletion = false;
                cauldron.x = 100;
                cauldron.y = game.height + 1;
                cauldron.update(0);
                expect(cauldron.markedForDeletion).toBe(true);
            });

            test('draw uses shadowBlur=10, red shadowColor, calls save/restore and correct drawImage', () => {
                cauldron.draw(ctx);
                expect(ctx.save).toHaveBeenCalled();
                expect(ctx.shadowColor).toBe('red');
                expect(ctx.shadowBlur).toBe(10);
                expect(ctx.drawImage).toHaveBeenCalledWith(
                    fakeImages.cauldron,
                    cauldron.frameX * cauldron.frameWidth,
                    cauldron.frameY * cauldron.frameHeight,
                    cauldron.frameWidth,
                    cauldron.frameHeight,
                    cauldron.x,
                    cauldron.y,
                    cauldron.width,
                    cauldron.height
                );
                expect(ctx.restore).toHaveBeenCalled();
            });

            test('draw shows debug rect when game.debug=true', () => {
                game.debug = true;
                cauldron.draw(ctx);
                expect(ctx.strokeRect).toHaveBeenCalledWith(cauldron.x, cauldron.y, cauldron.width, cauldron.height);
            });
        });

        // ---------------------------------------------------------------------------
        // BlackHole
        // ---------------------------------------------------------------------------
        describe('BlackHole', () => {
            let hole;
            beforeEach(() => {
                hole = new BlackHole(game);
                game.player.y = hole.y;
            });

            test('update moves left when cabin not visible', () => {
                hole.x = 500;
                game.cabin.isFullyVisible = false;
                hole.update(16);
                expect(hole.x).toBe(500 - game.speed);
            });

            test('update does not move when cabin visible', () => {
                hole.x = 500;
                game.cabin.isFullyVisible = true;
                hole.update(16);
                expect(hole.x).toBe(500);
            });

            test('constructor sets pullStrength=0.3 and random x/y', () => {
                expect(hole.pullStrength).toBe(0.3);
                expect(hole.image).toBe(fakeImages.blackhole);
                const minY = 400;
                const maxY = game.height - hole.height - game.groundMargin;
                expect(hole.y).toBeCloseTo(minY + 0.5 * (maxY - minY));
            });

            test('initial frameX and frameTimer defaults', () => {
                expect(hole.frameX).toBe(0);
                expect(hole.frameTimer).toBe(0);
            });

            test('animation wraps frameX and resets timer', () => {
                hole.frameTimer = hole.frameInterval + 1;
                hole.frameX = hole.maxFrame;
                hole.update(0);
                expect(hole.frameX).toBe(0);
                expect(hole.frameTimer).toBe(0);
            });

            test('animation increments frameTimer when below interval', () => {
                hole.frameInterval = 1000;
                hole.frameTimer = 0;
                hole.update(100);
                expect(hole.frameTimer).toBe(100);
            });

            test('animation advances frameX when below maxFrame', () => {
                hole.frameTimer = hole.frameInterval + 1;
                hole.frameX = 0;
                hole.update(0);
                expect(hole.frameX).toBe(1);
            });

            test('update adjusts pullStrength based on player.isSlowed', () => {
                hole.x = 0;
                game.cabin.isFullyVisible = true;
                game.player.isSlowed = false;
                hole.update(100);
                expect(hole.pullStrength).toBe(0.3);
                game.player.isSlowed = true;
                hole.update(100);
                expect(hole.pullStrength).toBe(0.1);
            });

            test('update pulls player horizontally when in range', () => {
                hole.x = game.width - hole.width / 2 - 1;
                game.cabin.isFullyVisible = true;
                game.player.x = 200;
                const beforeX = game.player.x;
                hole.update(1000);
                expect(game.player.x).toBeGreaterThan(beforeX);
            });

            test('markedForDeletion when off-screen horizontally', () => {
                hole.x = -hole.width - 10;
                hole.y = 0;
                hole.update(0);
                expect(hole.markedForDeletion).toBe(true);
            });

            test('markedForDeletion when off-screen vertically', () => {
                hole.x = 0;
                hole.y = game.height + 1;
                hole.update(0);
                expect(hole.markedForDeletion).toBe(true);
            });

            test('draw uses shadowBlur=10, red shadowColor, calls save/restore and correct drawImage', () => {
                hole.draw(ctx);

                expect(ctx.save).toHaveBeenCalled();
                expect(ctx.shadowColor).toBe('red');
                expect(ctx.shadowBlur).toBe(10);

                expect(ctx.drawImage).toHaveBeenCalledWith(
                    fakeImages.blackhole,
                    hole.frameX * hole.frameWidth,
                    hole.frameY * hole.frameHeight,
                    hole.frameWidth,
                    hole.frameHeight,
                    -hole.width / 2,
                    -hole.height / 2,
                    hole.width,
                    hole.height
                );

                expect(ctx.restore).toHaveBeenCalled();
            });

            test('draw shows debug rect when game.debug=true', () => {
                game.debug = true;
                hole.draw(ctx);
                expect(ctx.strokeRect).toHaveBeenCalledWith(
                    -hole.width / 2,
                    -hole.height / 2,
                    hole.width,
                    hole.height
                );
            });
        });

        // ---------------------------------------------------------------------------
        // Confuse
        // ---------------------------------------------------------------------------
        describe('Confuse', () => {
            let confuse;
            beforeEach(() => {
                confuse = new Confuse(game);
            });

            test('constructor sets correct props and random x/y', () => {
                expect(confuse.game).toBe(game);
                expect(confuse.width).toBeCloseTo(49.25);
                expect(confuse.height).toBe(80);
                expect(confuse.image).toBe(fakeImages.confuse);
                expect(confuse.maxFrame).toBe(3);
                expect(confuse.frameWidth).toBeCloseTo(49.25);
                expect(confuse.frameHeight).toBe(80);

                const expectedX = game.width + game.width * 0.5 * 0.5;
                expect(confuse.x).toBeCloseTo(expectedX);

                const minY = game.height - confuse.height - game.groundMargin;
                const maxY = 130;
                expect(confuse.y).toBeCloseTo(minY + 0.5 * (maxY - minY));

                expect(confuse.frameX).toBe(0);
                expect(confuse.frameY).toBe(0);
                expect(confuse.frameTimer).toBe(0);
                expect(confuse.markedForDeletion).toBe(false);
            });

            test('update moves left when cabin not visible', () => {
                const startX = confuse.x;
                game.cabin.isFullyVisible = false;
                confuse.update(16);
                expect(confuse.x).toBe(startX - game.speed);
            });

            test('update does not move when cabin visible', () => {
                const startX = confuse.x;
                game.cabin.isFullyVisible = true;
                confuse.update(16);
                expect(confuse.x).toBe(startX);
            });

            test('animation wraps frameX and resets timer', () => {
                confuse.frameTimer = confuse.frameInterval + 1;
                confuse.frameX = confuse.maxFrame;
                confuse.update(0);
                expect(confuse.frameX).toBe(0);
                expect(confuse.frameTimer).toBe(0);

                confuse.frameInterval = 1000;
                confuse.frameTimer = 0;
                confuse.update(100);
                expect(confuse.frameTimer).toBe(100);
            });

            test('animation advances frameX when below maxFrame', () => {
                confuse.frameTimer = confuse.frameInterval + 1;
                confuse.frameX = 0;
                confuse.update(0);
                expect(confuse.frameX).toBe(1);
            });

            test('markedForDeletion when off-screen horizontally or vertically', () => {
                confuse.x = -confuse.width - 1;
                confuse.y = 0;
                confuse.update(0);
                expect(confuse.markedForDeletion).toBe(true);

                confuse.markedForDeletion = false;
                confuse.x = 100;
                confuse.y = game.height + 1;
                confuse.update(0);
                expect(confuse.markedForDeletion).toBe(true);
            });

            test('draw uses red shadowBlur=10 and calls save/restore + drawImage', () => {
                confuse.draw(ctx);
                expect(ctx.save).toHaveBeenCalled();
                expect(ctx.shadowColor).toBe('red');
                expect(ctx.shadowBlur).toBe(10);
                expect(ctx.drawImage).toHaveBeenCalledWith(
                    fakeImages.confuse,
                    confuse.frameX * confuse.frameWidth,
                    confuse.frameY * confuse.frameHeight,
                    confuse.frameWidth,
                    confuse.frameHeight,
                    confuse.x,
                    confuse.y,
                    confuse.width,
                    confuse.height
                );
                expect(ctx.restore).toHaveBeenCalled();
            });

            test('draw draws debug rect when game.debug=true', () => {
                game.debug = true;
                confuse.draw(ctx);
                expect(ctx.strokeRect).toHaveBeenCalledWith(confuse.x, confuse.y, confuse.width, confuse.height);
            });
        });

        // ---------------------------------------------------------------------------
        // DeadSkull
        // ---------------------------------------------------------------------------
        describe('DeadSkull', () => {
            let skull;
            beforeEach(() => {
                skull = new DeadSkull(game);
            });

            test('constructor sets correct props and random x/y', () => {
                expect(skull.game).toBe(game);
                expect(skull.width).toBeCloseTo(62);
                expect(skull.height).toBe(100);

                expect(skull.image).toBeDefined();

                expect(skull.fps).toBe(5);
                expect(skull.frameInterval).toBeCloseTo(1000 / 5);
                expect(skull.maxFrame).toBe(5);
                expect(skull.frameWidth).toBeCloseTo(62);
                expect(skull.frameHeight).toBe(100);

                const expectedX = game.width + game.width * 0.5 * 0.5;
                expect(skull.x).toBeCloseTo(expectedX);

                const minY = game.height - skull.height - game.groundMargin;
                const maxY = 130;
                expect(skull.y).toBeCloseTo(minY + 0.5 * (maxY - minY));

                expect(skull.frameX).toBe(0);
                expect(skull.frameY).toBe(0);
                expect(skull.frameTimer).toBe(0);
                expect(skull.markedForDeletion).toBe(false);
            });

            test('update moves left when cabin not visible', () => {
                const startX = skull.x;
                game.cabin.isFullyVisible = false;
                skull.update(16);
                expect(skull.x).toBe(startX - game.speed);
            });

            test('update does not move when cabin visible', () => {
                const startX = skull.x;
                game.cabin.isFullyVisible = true;
                skull.update(16);
                expect(skull.x).toBe(startX);
            });

            test('animation wraps frameX and resets timer', () => {
                skull.frameTimer = skull.frameInterval + 1;
                skull.frameX = skull.maxFrame;
                skull.update(0);
                expect(skull.frameX).toBe(0);
                expect(skull.frameTimer).toBe(0);

                skull.frameInterval = 1000;
                skull.frameTimer = 0;
                skull.update(100);
                expect(skull.frameTimer).toBe(100);
            });

            test('animation advances frameX when below maxFrame', () => {
                skull.frameTimer = skull.frameInterval + 1;
                skull.frameX = 0;
                skull.update(0);
                expect(skull.frameX).toBe(1);
            });

            test('markedForDeletion when off-screen horizontally or vertically', () => {
                skull.x = -skull.width - 1;
                skull.y = 0;
                skull.update(0);
                expect(skull.markedForDeletion).toBe(true);

                skull.markedForDeletion = false;
                skull.x = 100;
                skull.y = game.height + 1;
                skull.update(0);
                expect(skull.markedForDeletion).toBe(true);
            });

            test('draw uses red shadowBlur=10 and calls save/restore + drawImage', () => {
                skull.draw(ctx);
                expect(ctx.save).toHaveBeenCalled();
                expect(ctx.shadowColor).toBe('red');
                expect(ctx.shadowBlur).toBe(10);
                expect(ctx.drawImage).toHaveBeenCalledWith(
                    skull.image,
                    skull.frameX * skull.frameWidth,
                    skull.frameY * skull.frameHeight,
                    skull.frameWidth,
                    skull.frameHeight,
                    skull.x,
                    skull.y,
                    skull.width,
                    skull.height
                );
                expect(ctx.restore).toHaveBeenCalled();
            });

            test('draw draws debug rect when game.debug=true', () => {
                game.debug = true;
                skull.draw(ctx);
                expect(ctx.strokeRect).toHaveBeenCalledWith(skull.x, skull.y, skull.width, skull.height);
            });
        });
    });
});
