import { SettingsMenu } from '../../game/menu/settingsMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('SettingsMenu', () => {
  let menu;
  let mockGame;
  let ctx;

  const createMockGame = () => {
    const g = {
      width: 1920,
      height: 689,
      canSelect: true,
      canSelectForestMap: true,
      isPlayerInGame: true,
      cutsceneActive: false,

      isTutorialActive: false,
      tutorial: { tutorialPause: true },

      audioHandler: { menu: { playSound: jest.fn(), stopSound: jest.fn() } },
      saveGameState: jest.fn(),

      menu: {
        main: { activateMenu: jest.fn() },
        audioSettings: { activateMenu: jest.fn() },
        controlsSettings: { activateMenu: jest.fn() },
        interfaceSettings: { activateMenu: jest.fn() },
        difficulty: { activateMenu: jest.fn() },
        deleteProgress: { activateMenu: jest.fn() },
        pause: { isPaused: false, activateMenu: jest.fn() },
      },

      openMenu: jest.fn(),
      goBackMenu: jest.fn(),
      uiLayoutStyle: 'compact',

      currentMenu: null,
      input: { handleEscapeKey: jest.fn() },
      canvas: {
        width: 1920,
        height: 689,
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 1920,
          height: 689,
        }),
      },
    };

    g.openMenu.mockImplementation((targetMenu, arg) => {
      if (targetMenu && typeof targetMenu.activateMenu === 'function') {
        targetMenu.activateMenu(arg);
      }
    });

    return g;
  };

  const createMockContext = () => ({
    save: jest.fn(),
    restore: jest.fn(),
    drawImage: jest.fn(),
    fillText: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    closePath: jest.fn(),
  });

  const selectAndRun = (index) => {
    menu.selectedOption = index;
    mockGame.saveGameState.mockClear();
    mockGame.audioHandler.menu.playSound.mockClear();
    mockGame.openMenu.mockClear();
    mockGame.goBackMenu.mockClear();

    mockGame.menu.audioSettings.activateMenu.mockClear();
    mockGame.menu.controlsSettings.activateMenu.mockClear();
    mockGame.menu.interfaceSettings.activateMenu.mockClear();
    mockGame.menu.difficulty.activateMenu.mockClear();
    mockGame.menu.deleteProgress.activateMenu.mockClear();
    mockGame.menu.main.activateMenu.mockClear();
    mockGame.menu.pause.activateMenu.mockClear();

    menu.handleMenuSelection();
  };

  beforeAll(() => {
    document.body.innerHTML = `<img id="mainmenubackground" />`;
  });

  beforeEach(() => {
    mockGame = createMockGame();
    ctx = createMockContext();
    menu = new SettingsMenu(mockGame);

    menu.menuActive = true;

    jest.clearAllMocks();
  });

  describe('construction & rendering', () => {
    test('extends BaseMenu and initializes title + options', () => {
      expect(menu).toBeInstanceOf(BaseMenu);
      expect(menu.title).toBe('Settings');

      expect(menu.menuOptions).toEqual([
        'Audio',
        'Controls',
        'Difficulty',
        'Interface',
        'Tutorial',
        'Delete Progress',
        'Go Back',
      ]);

      expect(menu.menuInGame).toBe(false);
    });

    test('draw() does not throw when menu is active', () => {
      expect(() => menu.draw(ctx)).not.toThrow();
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });
  });

  describe('activateMenu() arg parsing, menuOptions switching, and clamping', () => {
    test('activateMenu(number): uses full options (out-of-game) and clamps selectedOption into range', () => {
      menu.activateMenu(999);

      expect(menu.menuInGame).toBe(false);

      expect(menu.menuOptions).toEqual([
        'Audio',
        'Controls',
        'Difficulty',
        'Interface',
        'Tutorial: OFF',
        'Delete Progress',
        'Go Back',
      ]);

      expect(menu.selectedOption).toBe(menu.menuOptions.length - 1);
      expect(mockGame.currentMenu).toBe(menu);
    });

    test('activateMenu({inGame:true}): uses inGameOptions and clamps selectedOption into range', () => {
      menu.activateMenu({ inGame: true, selectedOption: 999 });

      expect(menu.menuInGame).toBe(true);
      expect(menu.menuOptions).toEqual(['Audio', 'Controls', 'Interface', 'Go Back']);
      expect(menu.selectedOption).toBe(menu.menuOptions.length - 1);
      expect(mockGame.currentMenu).toBe(menu);
    });

    test('activateMenu({selectedOption}) preserves explicit selectedOption when in range', () => {
      menu.activateMenu({ inGame: false, selectedOption: 2 });

      expect(menu.menuInGame).toBe(false);
      expect(menu.menuOptions).toEqual([
        'Audio',
        'Controls',
        'Difficulty',
        'Interface',
        'Tutorial: OFF',
        'Delete Progress',
        'Go Back',
      ]);
      expect(menu.selectedOption).toBe(2);
      expect(mockGame.currentMenu).toBe(menu);
    });
  });

  describe('_applyMenuLayout() layout rules', () => {
    test('out-of-game: _applyMenuLayout restores the adjusted full-menu position', () => {
      const basePos = menu.positionOffset;
      const baseMenuPos = menu.menuOptionsPositionOffset;

      menu.positionOffset = 999;
      menu.menuOptionsPositionOffset = 888;

      menu.menuInGame = false;
      menu._applyMenuLayout();

      expect(menu.positionOffset).toBe(basePos + 20);
      expect(menu.menuOptionsPositionOffset).toBe(baseMenuPos);
    });

    test('in-game: _applyMenuLayout increases positionOffset based on number of options', () => {
      const basePos = menu.positionOffset;
      const baseMenuPos = menu.menuOptionsPositionOffset;

      menu.menuInGame = true;
      menu.menuOptions = menu.inGameOptions;
      menu._applyMenuLayout();

      const optionHeight = 60;
      const expected = baseMenuPos + (menu.menuOptions.length * optionHeight) / 2;

      expect(menu.positionOffset).toBe(expected);
      expect(menu.positionOffset).not.toBe(basePos);
    });

    test('activateMenu({inGame:true}) applies in-game layout; activateMenu({inGame:false}) restores base layout', () => {
      const basePos = menu.positionOffset;
      const baseMenuPos = menu.menuOptionsPositionOffset;

      menu.activateMenu({ inGame: true, selectedOption: 0 });
      expect(menu.menuInGame).toBe(true);

      const optionHeight = 60;
      const expectedInGame = baseMenuPos + (menu.inGameOptions.length * optionHeight) / 2;
      expect(menu.positionOffset).toBe(expectedInGame);

      menu.activateMenu({ inGame: false, selectedOption: 0 });
      expect(menu.menuInGame).toBe(false);
      expect(menu.positionOffset).toBe(basePos + 20);
      expect(menu.menuOptionsPositionOffset).toBe(baseMenuPos);
    });
  });

  describe('handleMenuSelection() out-of-game routing', () => {
    beforeEach(() => {
      menu.activateMenu({ inGame: false, selectedOption: 0 });
      mockGame.audioHandler.menu.playSound.mockClear();
      mockGame.saveGameState.mockClear();
      mockGame.openMenu.mockClear();
      mockGame.goBackMenu.mockClear();
    });

    test('"Tutorial" toggles isTutorialActive, updates label, and saves', () => {
      expect(mockGame.isTutorialActive).toBe(false);
      expect(menu.menuOptions[4]).toBe('Tutorial: OFF');

      selectAndRun(4);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );
      expect(mockGame.isTutorialActive).toBe(true);
      expect(mockGame.tutorial.tutorialPause).toBe(true);
      expect(mockGame.saveGameState).toHaveBeenCalled();
      expect(menu.menuOptions[4]).toBe('Tutorial: ON');

      selectAndRun(4);
      expect(mockGame.isTutorialActive).toBe(false);
      expect(mockGame.saveGameState).toHaveBeenCalled();
      expect(menu.menuOptions[4]).toBe('Tutorial: OFF');
    });

    test('"Audio" plays select sound and opens Audio Settings at index 0', () => {
      selectAndRun(0);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );

      expect(mockGame.openMenu).toHaveBeenCalledWith(
        mockGame.menu.audioSettings,
        { inGame: false, selectedOption: 0 }
      );

      expect(mockGame.menu.audioSettings.activateMenu).toHaveBeenCalledWith({
        inGame: false,
        selectedOption: 0,
      });

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
      expect(mockGame.goBackMenu).not.toHaveBeenCalled();
    });

    test('"Controls" plays select sound and opens Controls Settings at index 0', () => {
      selectAndRun(1);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );

      expect(mockGame.openMenu).toHaveBeenCalledWith(
        mockGame.menu.controlsSettings,
        { inGame: false, selectedOption: 0 }
      );

      expect(mockGame.menu.controlsSettings.activateMenu).toHaveBeenCalledWith({
        inGame: false,
        selectedOption: 0,
      });

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
      expect(mockGame.goBackMenu).not.toHaveBeenCalled();
    });

    test('"Difficulty" plays select sound and opens Difficulty at row 0', () => {
      selectAndRun(2);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );

      expect(mockGame.openMenu).toHaveBeenCalledWith(
        mockGame.menu.difficulty,
        0
      );

      expect(mockGame.menu.difficulty.activateMenu).toHaveBeenCalledWith(0);

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
      expect(mockGame.goBackMenu).not.toHaveBeenCalled();
    });

    test('"Interface" plays select sound and opens Interface Settings with the current layout selected', () => {
      selectAndRun(3);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );

      expect(mockGame.openMenu).toHaveBeenCalledWith(
        mockGame.menu.interfaceSettings,
        { inGame: false, selectedOption: 0 }
      );

      expect(mockGame.menu.interfaceSettings.activateMenu).toHaveBeenCalledWith({
        inGame: false,
        selectedOption: 0,
      });

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
      expect(mockGame.goBackMenu).not.toHaveBeenCalled();
    });

    test('"Delete Progress" plays select sound and opens Delete Progress at index 1', () => {
      selectAndRun(5);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );

      expect(mockGame.openMenu).toHaveBeenCalledWith(
        mockGame.menu.deleteProgress,
        1
      );

      expect(mockGame.menu.deleteProgress.activateMenu).toHaveBeenCalledWith(1);

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
      expect(mockGame.goBackMenu).not.toHaveBeenCalled();
    });

    test('"Go Back" plays select sound and delegates to goBackMenu()', () => {
      selectAndRun(6);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );

      expect(mockGame.goBackMenu).toHaveBeenCalled();

      expect(mockGame.menu.main.activateMenu).not.toHaveBeenCalled();
      expect(mockGame.menu.pause.activateMenu).not.toHaveBeenCalled();

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });
  });

  describe('handleMenuSelection() in-game routing', () => {
    beforeEach(() => {
      menu.activateMenu({ inGame: true, selectedOption: 0 });

      mockGame.audioHandler.menu.playSound.mockClear();
      mockGame.openMenu.mockClear();
      mockGame.goBackMenu.mockClear();

      mockGame.menu.audioSettings.activateMenu.mockClear();
      mockGame.menu.controlsSettings.activateMenu.mockClear();
      mockGame.menu.pause.activateMenu.mockClear();
      mockGame.menu.main.activateMenu.mockClear();
      mockGame.menu.difficulty.activateMenu.mockClear();
      mockGame.menu.deleteProgress.activateMenu.mockClear();
      mockGame.saveGameState.mockClear();
    });

    test('in-game "Audio" opens AudioSettings with inGame:true', () => {
      menu.selectedOption = 0;
      menu.handleMenuSelection();

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );

      expect(mockGame.openMenu).toHaveBeenCalledWith(
        mockGame.menu.audioSettings,
        { inGame: true, selectedOption: 0 }
      );

      expect(mockGame.menu.audioSettings.activateMenu).toHaveBeenCalledWith({
        inGame: true,
        selectedOption: 0,
      });

      expect(mockGame.goBackMenu).not.toHaveBeenCalled();
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('in-game "Controls" opens ControlsSettings with inGame:true', () => {
      menu.selectedOption = 1;
      menu.handleMenuSelection();

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );

      expect(mockGame.openMenu).toHaveBeenCalledWith(
        mockGame.menu.controlsSettings,
        { inGame: true, selectedOption: 0 }
      );

      expect(mockGame.menu.controlsSettings.activateMenu).toHaveBeenCalledWith({
        inGame: true,
        selectedOption: 0,
      });

      expect(mockGame.goBackMenu).not.toHaveBeenCalled();
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('in-game "Go Back" delegates to goBackMenu() (stack decides where to go)', () => {
      menu.selectedOption = 3;
      menu.handleMenuSelection();

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );

      expect(mockGame.goBackMenu).toHaveBeenCalled();

      expect(mockGame.menu.pause.activateMenu).not.toHaveBeenCalled();
      expect(mockGame.menu.main.activateMenu).not.toHaveBeenCalled();

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });
  });

  describe('input handling', () => {
    test('Enter triggers handleMenuSelection when menu is active', () => {
      const spy = jest.spyOn(menu, 'handleMenuSelection');

      menu.handleKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
        stopImmediatePropagation: jest.fn(),
      });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    test('mouse click triggers selection flow and does not save', () => {
      menu.activateMenu({ inGame: false, selectedOption: 0 });

      menu.selectedOption = 0;
      mockGame.saveGameState.mockClear();

      menu.handleMouseClick({
        clientX: 0,
        clientY: 0,
        preventDefault: jest.fn(),
        stopImmediatePropagation: jest.fn(),
      });

      expect(mockGame.openMenu).toHaveBeenCalledWith(
        mockGame.menu.audioSettings,
        { inGame: false, selectedOption: 0 }
      );

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });
  });
});