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
        skins: makeMenu(),
        records: makeMenu(),
        howToPlay: makeMenu(),
        settings: makeMenu(),
        deleteProgress2: { showSavingSprite: false },
        pause: { isPaused: false },
      },
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
    menu.activateMenu();

    jest.clearAllMocks();
  });

  describe('constructor and initial state', () => {
    it('initializes with the correct title, options and offsets', () => {
      expect(menu.title).toBe('Main Menu');
      expect(menu.menuOptions).toEqual(['Play', 'Skins', 'Records', 'How to Play', 'Settings', 'Exit']);
      expect(menu.positionOffset).toBe(220);
      expect(menu.menuOptionsPositionOffset).toBe(50);
      expect(menu.showSavingSprite).toBe(false);
    });
  });

  describe('handleMenuSelection()', () => {
    const selectOptionAndHandle = (index) => {
      menu.selectedOption = index;
      menu.handleMenuSelection();
    };

    it('always plays optionSelectedSound first when canSelect=true', () => {
      mockGame.audioHandler.menu.playSound.mockClear();
      selectOptionAndHandle(0);
      expect(mockGame.audioHandler.menu.playSound.mock.calls[0])
        .toEqual(['optionSelectedSound', false, true]);
    });

    it('navigates to ForestMap when "Play" is selected', () => {
      selectOptionAndHandle(0);
      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('mapOpening');
      expect(mockGame.currentMenu).toBe(mockGame.menu.forestMap);
      expect(mockGame.menu.forestMap.activateMenu).toHaveBeenCalled();
    });

    it('activates Skins submenu when "Skins" is selected', () => {
      selectOptionAndHandle(1);
      expect(mockGame.currentMenu).toBe(mockGame.menu.skins);
      expect(mockGame.menu.skins.activateMenu).toHaveBeenCalledWith();
    });

    it('activates Records submenu when "Records" is selected', () => {
      selectOptionAndHandle(2);
      expect(mockGame.currentMenu).toBe(mockGame.menu.records);
      expect(mockGame.menu.records.activateMenu).toHaveBeenCalledWith();
    });

    it('activates How to Play submenu when "How to Play" is selected', () => {
      selectOptionAndHandle(3);
      expect(mockGame.currentMenu).toBe(mockGame.menu.howToPlay);
      expect(mockGame.menu.howToPlay.activateMenu).toHaveBeenCalledWith();
    });

    it('activates Settings submenu when "Settings" is selected', () => {
      selectOptionAndHandle(4);
      expect(mockGame.currentMenu).toBe(mockGame.menu.settings);
      expect(mockGame.menu.settings.activateMenu).toHaveBeenCalledWith();
    });

    it('calls quitApp when "Exit" is selected', () => {
      selectOptionAndHandle(5);
      expect(window.electronAPI.quitApp).toHaveBeenCalled();
    });

    it('does nothing when canSelect is false', () => {
      mockGame.canSelect = false;
      mockGame.audioHandler.menu.playSound.mockClear();
      mockGame.menu.forestMap.activateMenu.mockClear();

      const beforeMenu = mockGame.currentMenu;

      menu.selectedOption = 0;
      menu.handleMenuSelection();

      expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
      expect(mockGame.currentMenu).toBe(beforeMenu);
      expect(mockGame.menu.forestMap.activateMenu).not.toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    it('prefers deleteProgress animations when both flags are true', () => {
      mockGame.menu.deleteProgress2.showSavingSprite = true;
      menu.showSavingSprite = true;
      menu.update(42);

      expect(menu.deleteProgressAnimation.update).toHaveBeenCalledWith(42);
      expect(menu.deleteProgressBookAnimation.update).toHaveBeenCalledWith(42);
      expect(menu.savingAnimation.update).not.toHaveBeenCalled();
      expect(menu.savingBookAnimation.update).not.toHaveBeenCalled();
    });

    it('runs deleteProgress animations when only deleteProgress2.showSavingSprite is true', () => {
      mockGame.menu.deleteProgress2.showSavingSprite = true;
      menu.showSavingSprite = false;
      menu.update(123);

      expect(menu.deleteProgressAnimation.update).toHaveBeenCalledWith(123);
      expect(menu.deleteProgressBookAnimation.update).toHaveBeenCalledWith(123);
      expect(menu.savingAnimation.update).not.toHaveBeenCalled();
    });

    it('runs saving animations when only showSavingSprite is true', () => {
      menu.showSavingSprite = true;
      mockGame.menu.deleteProgress2.showSavingSprite = false;
      menu.update(456);

      expect(menu.savingAnimation.update).toHaveBeenCalledWith(456);
      expect(menu.savingBookAnimation.update).toHaveBeenCalledWith(456);
      expect(menu.deleteProgressAnimation.update).not.toHaveBeenCalled();
    });

    it('runs neither set of animations when both flags are false', () => {
      menu.showSavingSprite = false;
      mockGame.menu.deleteProgress2.showSavingSprite = false;
      menu.update(789);

      expect(menu.savingAnimation.update).not.toHaveBeenCalled();
      expect(menu.deleteProgressAnimation.update).not.toHaveBeenCalled();
    });
  });

  describe('draw()', () => {
    it('draws both deleteProgress and saving animations when both flags are true', () => {
      mockGame.menu.deleteProgress2.showSavingSprite = true;
      menu.showSavingSprite = true;
      menu.draw(ctx);

      expect(menu.deleteProgressAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.deleteProgressBookAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.savingAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.savingBookAnimation.draw).toHaveBeenCalledWith(ctx);
    });

    it('draws deleteProgress animations when only deleteProgress2.showSavingSprite is true', () => {
      mockGame.menu.deleteProgress2.showSavingSprite = true;
      menu.showSavingSprite = false;
      menu.draw(ctx);

      expect(menu.deleteProgressAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.deleteProgressBookAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.savingAnimation.draw).not.toHaveBeenCalled();
    });

    it('draws saving animations when only showSavingSprite is true', () => {
      menu.showSavingSprite = true;
      mockGame.menu.deleteProgress2.showSavingSprite = false;
      menu.draw(ctx);

      expect(menu.savingAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.savingBookAnimation.draw).toHaveBeenCalledWith(ctx);
      expect(menu.deleteProgressAnimation.draw).not.toHaveBeenCalled();
    });

    it('draws neither set of animations when both flags are false', () => {
      menu.showSavingSprite = false;
      mockGame.menu.deleteProgress2.showSavingSprite = false;
      menu.draw(ctx);

      expect(menu.savingAnimation.draw).not.toHaveBeenCalled();
      expect(menu.deleteProgressAnimation.draw).not.toHaveBeenCalled();
    });
  });
});
