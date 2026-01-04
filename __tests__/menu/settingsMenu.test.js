import { SettingsMenu } from '../../game/menu/settingsMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('SettingsMenu', () => {
  let menu;
  let mockGame;
  let ctx;

  const createMockGame = () => ({
    width: 1920,
    height: 689,
    canSelect: true,
    canSelectForestMap: true,
    isPlayerInGame: true,
    audioHandler: { menu: { playSound: jest.fn() } },
    saveGameState: jest.fn(),
    menu: {
      main: { activateMenu: jest.fn() },
      audioSettings: { activateMenu: jest.fn() },
      controlsSettings: { activateMenu: jest.fn() },
      levelDifficulty: { activateMenu: jest.fn(), selectedDifficultyIndex: 1 },
      deleteProgress: { activateMenu: jest.fn() },
      pause: { isPaused: false },
    },
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
  });

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
        'Level Difficulty',
        'Delete Progress',
        'Go Back',
      ]);
    });

    test('draw() does not throw when menu is active', () => {
      expect(() => menu.draw(ctx)).not.toThrow();
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });
  });

  describe('handleMenuSelection()', () => {
    test('"Audio" plays select sound and opens Audio Settings at index 0', () => {
      selectAndRun(0);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );
      expect(mockGame.menu.audioSettings.activateMenu).toHaveBeenCalledWith(0);
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('"Controls" plays select sound and opens Controls Settings at index 0', () => {
      selectAndRun(1);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );
      expect(mockGame.menu.controlsSettings.activateMenu).toHaveBeenCalledWith(0);
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('"Level Difficulty" plays select sound and opens Level Difficulty using selectedDifficultyIndex', () => {
      selectAndRun(2);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );
      expect(mockGame.menu.levelDifficulty.activateMenu).toHaveBeenCalledWith(
        mockGame.menu.levelDifficulty.selectedDifficultyIndex
      );
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('"Delete Progress" plays select sound and opens Delete Progress at index 1', () => {
      selectAndRun(3);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );
      expect(mockGame.menu.deleteProgress.activateMenu).toHaveBeenCalledWith(1);
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('"Go Back" plays select sound and returns to Main Menu at index 4', () => {
      selectAndRun(4);

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );
      expect(mockGame.menu.main.activateMenu).toHaveBeenCalledWith(4);
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });
  });

  describe('input handling', () => {
    test('Enter triggers handleMenuSelection when menu is active', () => {
      const spy = jest.spyOn(menu, 'handleMenuSelection');

      menu.handleKeyDown({ key: 'Enter' });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    test('mouse click triggers selection flow and does not save', () => {
      menu.selectedOption = 0;
      mockGame.saveGameState.mockClear();

      menu.handleMouseClick({ clientX: 0, clientY: 0 });

      expect(mockGame.menu.audioSettings.activateMenu).toHaveBeenCalledWith(0);
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });
  });
});
