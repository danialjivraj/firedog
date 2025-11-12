import { IceDrink, Cauldron, BlackHole, Confuse } from '../../game/entities/powerDown';

describe('PowerDown subclasses', () => {
  let game, ctx, fakeIceDrinkImg, fakeCauldronImg, fakeBlackholeImg, fakeConfuseImg;

  beforeAll(() => {
    fakeIceDrinkImg = {};
    fakeCauldronImg = {};
    fakeBlackholeImg = {};
    fakeConfuseImg = {};
    document.getElementById = jest.fn(id => {
      if (id === 'drink') return fakeIceDrinkImg;
      if (id === 'cauldron') return fakeCauldronImg;
      if (id === 'blackhole') return fakeBlackholeImg;
      if (id === 'confuse') return fakeConfuseImg;
      return {};
    });
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

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
  // IceDrink
  // -----------------------------------------------------------------------------
  describe('IceDrink', () => {
    let drink;
    beforeEach(() => {
      drink = new IceDrink(game);
    });

    test('constructor sets correct props and random x/y', () => {
      expect(drink.game).toBe(game);
      expect(drink.width).toBe(65);
      expect(drink.height).toBe(65);
      expect(drink.image).toBe(fakeIceDrinkImg);
      expect(drink.maxFrame).toBe(4);
      const expectedX = game.width + game.width * 0.5 * 0.5;
      expect(drink.x).toBeCloseTo(expectedX);
      const minY = game.height - drink.height - game.groundMargin;
      const maxY = 130;
      expect(drink.y).toBeCloseTo(minY + 0.5 * (maxY - minY));
      expect(drink.frameX).toBe(0);
      expect(drink.frameTimer).toBe(0);
      expect(drink.markedForDeletion).toBe(false);
    });

    test('update moves left when cabin not visible', () => {
      const startX = drink.x;
      drink.update(16);
      expect(drink.x).toBe(startX - game.speed);
    });

    test('update does not move when cabin visible', () => {
      const startX = drink.x;
      game.cabin.isFullyVisible = true;
      drink.update(16);
      expect(drink.x).toBe(startX);
    });

    test('animation wraps frameX and resets timer', () => {
      drink.frameTimer = drink.frameInterval + 1;
      drink.frameX = drink.maxFrame;
      drink.update(0);
      expect(drink.frameX).toBe(0);
      expect(drink.frameTimer).toBe(0);
      drink.frameInterval = 1000;
      drink.frameTimer = 0;
      drink.update(100);
      expect(drink.frameTimer).toBe(100);
    });

    test('animation advances frameX when below maxFrame', () => {
      drink.frameTimer = drink.frameInterval + 1;
      drink.frameX = 0;
      drink.update(0);
      expect(drink.frameX).toBe(1);
    });

    test('markedForDeletion when off-screen horizontally or vertically', () => {
      drink.x = -drink.width - 1;
      drink.update(0);
      expect(drink.markedForDeletion).toBe(true);
      drink.markedForDeletion = false;
      drink.x = 100;
      drink.y = game.height + 1;
      drink.update(0);
      expect(drink.markedForDeletion).toBe(true);
    });

    test('draw uses red shadowBlur=10 and skips debug rect by default', () => {
      drink.draw(ctx);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.shadowColor).toBe('red');
      expect(ctx.shadowBlur).toBe(10);
      expect(ctx.drawImage).toHaveBeenCalledWith(
        fakeIceDrinkImg,
        drink.frameX * drink.frameWidth,
        drink.frameY * drink.frameHeight,
        drink.frameWidth,
        drink.frameHeight,
        drink.x,
        drink.y,
        drink.width,
        drink.height
      );
      expect(ctx.restore).toHaveBeenCalled();
    });

    test('draw draws debug rect when game.debug=true', () => {
      game.debug = true;
      drink.draw(ctx);
      expect(ctx.strokeRect).toHaveBeenCalledWith(drink.x, drink.y, drink.width, drink.height);
    });
  });

  // -----------------------------------------------------------------------------
  // Cauldron
  // -----------------------------------------------------------------------------
  describe('Cauldron', () => {
    let cauldron;
    beforeEach(() => {
      cauldron = new Cauldron(game);
    });

    test('constructor sets fixed y at ground and random x', () => {
      expect(cauldron.width).toBeCloseTo(55.33333333333333);
      expect(cauldron.height).toBe(100);
      expect(cauldron.image).toBe(fakeCauldronImg);
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
        fakeCauldronImg,
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

  // -----------------------------------------------------------------------------
  // BlackHole
  // -----------------------------------------------------------------------------
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
      expect(hole.image).toBe(fakeBlackholeImg);
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

    test('draw uses shadowBlur=25, red shadowColor, calls save/restore and correct drawImage', () => {
      hole.draw(ctx);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.shadowColor).toBe('red');
      expect(ctx.shadowBlur).toBe(25);
      expect(ctx.drawImage).toHaveBeenCalledWith(
        fakeBlackholeImg,
        hole.frameX * hole.frameWidth,
        hole.frameY * hole.frameHeight,
        hole.frameWidth,
        hole.frameHeight,
        hole.x,
        hole.y,
        hole.width,
        hole.height
      );
      expect(ctx.restore).toHaveBeenCalled();
    });

    test('draw shows debug rect when game.debug=true', () => {
      game.debug = true;
      hole.draw(ctx);
      expect(ctx.strokeRect).toHaveBeenCalledWith(hole.x, hole.y, hole.width, hole.height);
    });
  });

  // -----------------------------------------------------------------------------
  // Confuse
  // -----------------------------------------------------------------------------
  describe('Confuse', () => {
    let confuse;
    beforeEach(() => {
      confuse = new Confuse(game);
    });

    test('constructor sets correct props and random x/y', () => {
      expect(confuse.game).toBe(game);
      expect(confuse.width).toBeCloseTo(49.25);
      expect(confuse.height).toBe(80);
      expect(confuse.image).toBe(fakeConfuseImg);
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
        fakeConfuseImg,
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
});
