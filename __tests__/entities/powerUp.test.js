import { RedPotion, BluePotion, HealthLive, Coin, OxygenTank } from '../../game/entities/powerUp';

describe('PowerUp subclasses', () => {
  let game, ctx;
  const fakeImages = {
    redpotion: {},
    bluepotion: {},
    healthlive: {},
    coin: {},
    oxygenTank: {},
  };

  beforeAll(() => {
    document.getElementById = jest.fn(id => fakeImages[id] || {});
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

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
    ctx = {
      strokeRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      drawImage: jest.fn(),
      shadowColor: '',
      shadowBlur: 0,
    };
  });

  // -----------------------------------------------------------------------------
  // RedPotion
  // -----------------------------------------------------------------------------
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

  // -----------------------------------------------------------------------------
  // BluePotion
  // -----------------------------------------------------------------------------
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

  // -----------------------------------------------------------------------------
  // HealthLive
  // -----------------------------------------------------------------------------
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

  // -----------------------------------------------------------------------------
  // Coin
  // -----------------------------------------------------------------------------
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

  // -----------------------------------------------------------------------------
  // OxygenTank
  // -----------------------------------------------------------------------------
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
