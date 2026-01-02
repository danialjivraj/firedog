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
      pause: { isPaused: false }
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
        height: 689
      })
    }
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
    closePath: jest.fn()
  });

  beforeAll(() => {
    document.body.innerHTML = `
      <img id="mainmenubackground" />
    `;
  });

  beforeEach(() => {
    mockGame = createMockGame();
    ctx = createMockContext();

    menu = new SettingsMenu(mockGame);
    menu.activateMenu();
  });

  describe('initialization and rendering', () => {
    test('extends BaseMenu and sets title and options correctly', () => {
      expect(menu).toBeInstanceOf(BaseMenu);
      expect(menu.title).toBe('Settings');
      expect(menu.menuOptions).toEqual([
        'Audio',
        'Controls',
        'Level Difficulty',
        'Delete Progress',
        'Go Back'
      ]);
    });

    test('draw() renders without error when menu is active', () => {
      expect(() => menu.draw(ctx)).not.toThrow();
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });
  });

  describe('handleMenuSelection', () => {
    test('selecting "Audio" activates audio settings menu and does not save', () => {
      menu.selectedOption = 0;
      mockGame.saveGameState.mockClear();

      menu.handleMenuSelection();

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );
      expect(mockGame.menu.audioSettings.activateMenu).toHaveBeenCalledWith(0);
      expect(mockGame.currentMenu).toBe(mockGame.menu.audioSettings);
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('selecting "Controls" activates controls settings menu and does not save', () => {
      menu.selectedOption = 1;
      mockGame.saveGameState.mockClear();

      menu.handleMenuSelection();

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );
      expect(mockGame.menu.controlsSettings.activateMenu).toHaveBeenCalledWith(0);
      expect(mockGame.currentMenu).toBe(mockGame.menu.controlsSettings);
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('selecting "Level Difficulty" activates level difficulty menu with its selectedDifficultyIndex and does not save', () => {
      menu.selectedOption = 2;
      mockGame.saveGameState.mockClear();

      menu.handleMenuSelection();

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );
      expect(mockGame.menu.levelDifficulty.activateMenu).toHaveBeenCalledWith(
        mockGame.menu.levelDifficulty.selectedDifficultyIndex
      );
      expect(mockGame.currentMenu).toBe(mockGame.menu.levelDifficulty);
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('selecting "Delete Progress" activates delete progress menu at index 1 and does not save', () => {
      menu.selectedOption = 3;
      mockGame.saveGameState.mockClear();

      menu.handleMenuSelection();

      expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'optionSelectedSound',
        false,
        true
      );
      expect(mockGame.menu.deleteProgress.activateMenu).toHaveBeenCalledWith(1);
      expect(mockGame.currentMenu).toBe(mockGame.menu.deleteProgress);
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('selecting "Go Back" activates main menu at index 4 and does not save', () => {
      menu.selectedOption = 4;
      mockGame.saveGameState.mockClear();

      menu.handleMenuSelection();

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
    test('pressing Enter while menu is active calls handleMenuSelection', () => {
      const spy = jest.spyOn(menu, 'handleMenuSelection');
      menu.menuActive = true;

      menu.handleKeyDown({ key: 'Enter' });

      expect(spy).toHaveBeenCalled();
    });

    test('mouse click triggers selection flow via BaseMenu and does not save', () => {
      menu.selectedOption = 0;
      mockGame.saveGameState.mockClear();

      menu.handleMouseClick({ clientX: 0, clientY: 0 });

      expect(mockGame.menu.audioSettings.activateMenu).toHaveBeenCalledWith(0);
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });
  });
});
