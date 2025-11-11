import { MainMenu } from '../../game/menu/mainMenu.js';

describe('MainMenu', () => {
  let menu, mockGame, ctx;

  beforeAll(() => {
    window.electronAPI = { quitApp: jest.fn() };
    document.body.innerHTML = `
      <img id="mainmenubackground" />
      <img id="greenCompleted" />
    `;
  });

  beforeEach(() => {
    const makeMenu = () => ({ activateMenu: jest.fn() });
    mockGame = {
      width: 1920,
      height: 689,
      canSelect: true,
      audioHandler: { menu: { playSound: jest.fn() } },
      menu: {
        forestMap: makeMenu(),
        skins: { ...makeMenu() },
        levelDifficulty: { ...makeMenu(), selectedDifficultyIndex: 1 },
        howToPlay: makeMenu(),
        settings: makeMenu(),
        deleteProgress: makeMenu(),
        deleteProgress2: { showSavingSprite: false },
        pause: { isPaused: false },
      },
      currentMenu: null,
      saveGameState: jest.fn(),
    };

    ctx = {
      save: jest.fn(),
      restore: jest.fn(),
      drawImage: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
    };

    menu = new MainMenu(mockGame);
    menu.activateMenu();

    menu.savingAnimation.update = jest.fn();
    menu.savingBookAnimation.update = jest.fn();
    menu.deleteProgressAnimation.update = jest.fn();
    menu.deleteProgressBookAnimation.update = jest.fn();
    menu.savingAnimation.draw = jest.fn();
    menu.savingBookAnimation.draw = jest.fn();
    menu.deleteProgressAnimation.draw = jest.fn();
    menu.deleteProgressBookAnimation.draw = jest.fn();
  });

  describe('constructor and initial state', () => {
    it('initializes with the correct title, options and offsets', () => {
      expect(menu.title).toBe('Main Menu');
      expect(menu.menuOptions).toEqual([
        'Play', 'Skins', 'Level Difficulty',
        'How to Play', 'Settings',
        'Delete Progress', 'Exit'
      ]);
      expect(menu.positionOffset).toBe(240);
      expect(menu.menuOptionsPositionOffset).toBe(50);
      expect(menu.showSavingSprite).toBe(false);
    });
  });

  describe('handleMenuSelection()', () => {
    const selectOptionAndHandle = (index) => {
      menu.selectedOption = index;
      menu.handleMenuSelection();
    };

    it('always plays optionSelectedSound first', () => {
      mockGame.audioHandler.menu.playSound.mockClear();
      selectOptionAndHandle(0);
      expect(mockGame.audioHandler.menu.playSound.mock.calls[0])
        .toEqual(['optionSelectedSound', false, true]);
    });

    it('does not play any extra sound when Skins is selected', () => {
      mockGame.audioHandler.menu.playSound.mockClear();
      selectOptionAndHandle(1);
      expect(mockGame.audioHandler.menu.playSound.mock.calls[0])
        .toEqual(['optionSelectedSound', false, true]);
      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledTimes(1);
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

    it('activates Level Difficulty submenu when "Level Difficulty" is selected', () => {
      selectOptionAndHandle(2);
      expect(mockGame.currentMenu).toBe(mockGame.menu.levelDifficulty);
      expect(mockGame.menu.levelDifficulty.activateMenu)
        .toHaveBeenCalledWith(mockGame.menu.levelDifficulty.selectedDifficultyIndex);
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

    it('activates Delete Progress submenu when "Delete Progress" is selected', () => {
      selectOptionAndHandle(5);
      expect(mockGame.currentMenu).toBe(mockGame.menu.deleteProgress);
      expect(mockGame.menu.deleteProgress.activateMenu).toHaveBeenCalledWith(1);
    });

    it('calls quitApp when "Exit" is selected', () => {
      selectOptionAndHandle(6);
      expect(window.electronAPI.quitApp).toHaveBeenCalled();
    });

    it('does nothing when canSelect is false', () => {
      mockGame.canSelect = false;
      selectOptionAndHandle(0);
      expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
      expect(mockGame.currentMenu).not.toBe(mockGame.menu.forestMap);
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
      expect(menu.savingAnimation.update).not.toHaveBeenCalled();
    });

    it('runs saving animations when only showSavingSprite is true', () => {
      menu.showSavingSprite = true;
      mockGame.menu.deleteProgress2.showSavingSprite = false;
      menu.update(456);
      expect(menu.savingAnimation.update).toHaveBeenCalledWith(456);
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
      expect(menu.savingAnimation.draw).not.toHaveBeenCalled();
    });

    it('draws saving animations when only showSavingSprite is true', () => {
      menu.showSavingSprite = true;
      mockGame.menu.deleteProgress2.showSavingSprite = false;
      menu.draw(ctx);
      expect(menu.savingAnimation.draw).toHaveBeenCalledWith(ctx);
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
