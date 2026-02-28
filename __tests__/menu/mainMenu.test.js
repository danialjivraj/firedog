import { MainMenu } from '../../game/menu/mainMenu.js';

jest.mock('../../game/animations/savingAnimation.js', () => {
  const makeAnim = (label) =>
    jest.fn().mockImplementation(() => ({
      label,
      update: jest.fn(),
      draw: jest.fn(),
    }));

  return {
    SavingAnimation: makeAnim('SavingAnimation'),
    SavingBookAnimation: makeAnim('SavingBookAnimation'),
    DeleteProgressAnimation: makeAnim('DeleteProgressAnimation'),
    DeleteProgressBookAnimation: makeAnim('DeleteProgressBookAnimation'),
  };
});

describe('MainMenu', () => {
  let menu, mockGame, ctx;

  beforeAll(() => {
    window.electronAPI = { quitApp: jest.fn() };
    document.body.innerHTML = `
      <img id="mainmenubackground" />
      <img id="greenBand" />
      <img id="blankStarLeft" />
      <img id="blankStarMiddle" />
      <img id="blankStarRight" />
      <img id="filledStarLeft" />
      <img id="filledStarMiddle" />
      <img id="filledStarRight" />
      <img id="storyCompleteText" />
    `;
  });

  beforeEach(() => {
    const makeMenu = () => ({ activateMenu: jest.fn(), menuActive: false });

    mockGame = {
      width: 1920,
      height: 689,
      canSelect: true,
      canSelectForestMap: true,
      isPlayerInGame: false,

      glacikalDefeated: false,
      elyvorgDefeated: false,
      ntharaxDefeated: false,

      audioHandler: { menu: { playSound: jest.fn(), stopSound: jest.fn() } },

      menu: {
        forestMap: makeMenu(),
        wardrobe: makeMenu(),
        records: makeMenu(),
        howToPlay: makeMenu(),
        settings: makeMenu(),
        deleteProgress2: { showSavingSprite: false },
        pause: { isPaused: false },
      },

      openMenu: jest.fn((targetMenu, arg = 0) => {
        if (targetMenu && typeof targetMenu.activateMenu === 'function') {
          targetMenu.activateMenu(arg);
        }
      }),

      currentMenu: null,

      saveGameState: jest.fn(),
      canvas: {
        width: 1920,
        height: 689,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 689 }),
      },
      input: { handleEscapeKey: jest.fn() },
    };

    ctx = {
      save: jest.fn(),
      restore: jest.fn(),
      drawImage: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      closePath: jest.fn(),
    };

    menu = new MainMenu(mockGame);

    jest.clearAllMocks();
  });

  describe('constructor and initial state', () => {
    test('initializes title, options, offsets, and saving flags', () => {
      expect(menu.title).toBe('Main Menu');
      expect(menu.menuOptions).toEqual(['Play', 'Wardrobe', 'Records', 'How to Play', 'Settings', 'Exit']);
      expect(menu.positionOffset).toBe(220);
      expect(menu.menuOptionsPositionOffset).toBe(65);
      expect(menu.showSavingSprite).toBe(false);
    });
  });

  describe('handleMenuSelection()', () => {
    const selectAndRun = (index) => {
      menu.selectedOption = index;
      menu.handleMenuSelection();
    };

    test('when canSelect=true, plays optionSelectedSound first', () => {
      selectAndRun(0);

      expect(mockGame.audioHandler.menu.playSound.mock.calls[0])
        .toEqual(['optionSelectedSound', false, true]);
    });

    test('"Play" plays mapOpening and activates forestMap', () => {
      selectAndRun(0);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('mapOpening');
      expect(mockGame.openMenu).toHaveBeenCalledWith(mockGame.menu.forestMap, 0);
      expect(mockGame.menu.forestMap.activateMenu).toHaveBeenCalledWith(0);
    });

    test('"Wardrobe" activates wardrobe menu', () => {
      selectAndRun(1);

      expect(mockGame.openMenu).toHaveBeenCalledWith(mockGame.menu.wardrobe, 0);
      expect(mockGame.menu.wardrobe.activateMenu).toHaveBeenCalledWith(0);
    });

    test('"Records" activates records menu', () => {
      selectAndRun(2);

      expect(mockGame.openMenu).toHaveBeenCalledWith(mockGame.menu.records, 0);
      expect(mockGame.menu.records.activateMenu).toHaveBeenCalledWith(0);
    });

    test('"How to Play" activates howToPlay menu', () => {
      selectAndRun(3);

      expect(mockGame.openMenu).toHaveBeenCalledWith(mockGame.menu.howToPlay, 0);
      expect(mockGame.menu.howToPlay.activateMenu).toHaveBeenCalledWith(0);
    });

    test('"Settings" activates settings menu', () => {
      selectAndRun(4);

      expect(mockGame.openMenu).toHaveBeenCalledWith(mockGame.menu.settings, 0);
      expect(mockGame.menu.settings.activateMenu).toHaveBeenCalledWith(0);
    });

    test('"Exit" calls electron quitApp', () => {
      selectAndRun(5);
      expect(window.electronAPI.quitApp).toHaveBeenCalled();
    });

    test('when canSelect=false, does nothing (no sounds, no navigation, no quit)', () => {
      mockGame.canSelect = false;

      selectAndRun(0);

      expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
      expect(mockGame.openMenu).not.toHaveBeenCalled();
      expect(mockGame.menu.forestMap.activateMenu).not.toHaveBeenCalled();
      expect(window.electronAPI.quitApp).not.toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    test('prefers deleteProgress animations when both flags are true', () => {
      mockGame.menu.deleteProgress2.showSavingSprite = true;
      menu.showSavingSprite = true;

      menu.update(42);

      expect(menu.deleteProgressAnimation.update).toHaveBeenCalledWith(42);
      expect(menu.deleteProgressBookAnimation.update).toHaveBeenCalledWith(42);
      expect(menu.savingAnimation.update).not.toHaveBeenCalled();
      expect(menu.savingBookAnimation.update).not.toHaveBeenCalled();
    });

    test('runs deleteProgress animations when only deleteProgress2.showSavingSprite is true', () => {
      mockGame.menu.deleteProgress2.showSavingSprite = true;
      menu.showSavingSprite = false;

      menu.update(123);

      expect(menu.deleteProgressAnimation.update).toHaveBeenCalledWith(123);
      expect(menu.deleteProgressBookAnimation.update).toHaveBeenCalledWith(123);
      expect(menu.savingAnimation.update).not.toHaveBeenCalled();
      expect(menu.savingBookAnimation.update).not.toHaveBeenCalled();
    });

    test('runs saving animations when only showSavingSprite is true', () => {
      mockGame.menu.deleteProgress2.showSavingSprite = false;
      menu.showSavingSprite = true;

      menu.update(456);

      expect(menu.savingAnimation.update).toHaveBeenCalledWith(456);
      expect(menu.savingBookAnimation.update).toHaveBeenCalledWith(456);
      expect(menu.deleteProgressAnimation.update).not.toHaveBeenCalled();
      expect(menu.deleteProgressBookAnimation.update).not.toHaveBeenCalled();
    });

    test('runs no animations when both flags are false', () => {
      mockGame.menu.deleteProgress2.showSavingSprite = false;
      menu.showSavingSprite = false;

      menu.update(789);

      expect(menu.savingAnimation.update).not.toHaveBeenCalled();
      expect(menu.savingBookAnimation.update).not.toHaveBeenCalled();
      expect(menu.deleteProgressAnimation.update).not.toHaveBeenCalled();
      expect(menu.deleteProgressBookAnimation.update).not.toHaveBeenCalled();
    });
  });

  describe('draw()', () => {
    test('draws both deleteProgress and saving animations when both flags are true', () => {
      mockGame.menu.deleteProgress2.showSavingSprite = true;
      menu.showSavingSprite = true;

      menu.draw(ctx);

      expect(menu.deleteProgressAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.deleteProgressBookAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.savingAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.savingBookAnimation.draw).toHaveBeenCalledWith(ctx);
    });

    test('draws deleteProgress animations when only deleteProgress2.showSavingSprite is true', () => {
      mockGame.menu.deleteProgress2.showSavingSprite = true;
      menu.showSavingSprite = false;

      menu.draw(ctx);

      expect(menu.deleteProgressAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.deleteProgressBookAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.savingAnimation.draw).not.toHaveBeenCalled();
      expect(menu.savingBookAnimation.draw).not.toHaveBeenCalled();
    });

    test('draws saving animations when only showSavingSprite is true', () => {
      mockGame.menu.deleteProgress2.showSavingSprite = false;
      menu.showSavingSprite = true;

      menu.draw(ctx);

      expect(menu.savingAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.savingBookAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.deleteProgressAnimation.draw).not.toHaveBeenCalled();
      expect(menu.deleteProgressBookAnimation.draw).not.toHaveBeenCalled();
    });

    test('draws no animations when both flags are false', () => {
      mockGame.menu.deleteProgress2.showSavingSprite = false;
      menu.showSavingSprite = false;

      menu.draw(ctx);

      expect(menu.savingAnimation.draw).not.toHaveBeenCalled();
      expect(menu.savingBookAnimation.draw).not.toHaveBeenCalled();
      expect(menu.deleteProgressAnimation.draw).not.toHaveBeenCalled();
      expect(menu.deleteProgressBookAnimation.draw).not.toHaveBeenCalled();
    });
  });
});