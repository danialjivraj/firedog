import { SelectMenu, BaseMenu } from '../../game/menu/baseMenu.js';

describe('SelectMenu', () => {
  let menu, mockGame, ctx;

  beforeAll(() => {
    document.body.innerHTML = `
      <img id="mainmenubackground" />
    `;
  });

  beforeEach(() => {
    mockGame = {
      width: 1920,
      height: 689,
      canSelect: true,
      canSelectForestMap: true,
      isPlayerInGame: false,
      audioHandler: { menu: { playSound: jest.fn() } },
      menu: { pause: { isPaused: false } },
      input: { handleEscapeKey: jest.fn() },
      currentMenu: null,
      saveGameState: jest.fn(),
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

    ctx = {
      save: jest.fn(),
      restore: jest.fn(),
      drawImage: jest.fn(),
      fillText: jest.fn(),
      fillRect: jest.fn(),
    };

    const options = ['Opt A', 'Opt B', 'Back'];
    menu = new SelectMenu(mockGame, options, 'Select Title', {
      initialIndex: 1,
      goBackLabel: 'Back',
    });
    menu.onSelect = jest.fn();
    menu.onGoBack = jest.fn();

    menu.activateMenu();
  });

  describe('initialization', () => {
    test('extends BaseMenu and applies suffix to initial selected index', () => {
      expect(menu).toBeInstanceOf(BaseMenu);
      expect(menu.getSelectedIndex()).toBe(1);
      expect(menu.menuOptions).toEqual(['Opt A', 'Opt B - Selected', 'Back']);
      expect(menu.selectedOption).toBe(1);
    });
  });

  describe('selection index and suffix management', () => {
    test('setSelectedIndex updates suffix exclusively and avoids duplicate suffix', () => {
      menu.setSelectedIndex(0);
      expect(menu.getSelectedIndex()).toBe(0);
      expect(menu.menuOptions).toEqual(['Opt A - Selected', 'Opt B', 'Back']);

      menu.setSelectedIndex(0);
      expect(menu.menuOptions[0]).toBe('Opt A - Selected');
    });

    test('stripSelectedSuffix and _clearAllSuffixes remove all " - Selected" suffixes', () => {
      menu.menuOptions = ['Opt A - Selected', 'Opt B - Selected', 'Back'];
      menu._clearAllSuffixes();
      expect(menu.menuOptions).toEqual(['Opt A', 'Opt B', 'Back']);
      expect(menu.stripSelectedSuffix('X - Selected - Selected')).toBe('X');
    });
  });

  describe('handleMenuSelection behavior', () => {
    test('same selected option: plays sound, does not save, does not call onSelect', () => {
      mockGame.saveGameState.mockClear();
      menu.selectedOption = menu.getSelectedIndex();
      const soundSpy = mockGame.audioHandler.menu.playSound;

      menu.handleMenuSelection();

      expect(soundSpy).toHaveBeenCalledWith('optionSelectedSound', false, true);
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
      expect(menu.onSelect).not.toHaveBeenCalled();

      expect(menu.menuOptions[1]).toBe('Opt B - Selected');
    });

    test('different option: updates selected index, applies suffix, calls onSelect, saves once', () => {
      mockGame.saveGameState.mockClear();
      menu.selectedOption = 0;

      menu.handleMenuSelection();

      expect(menu.getSelectedIndex()).toBe(0);
      expect(menu.menuOptions).toEqual(['Opt A - Selected', 'Opt B', 'Back']);
      expect(menu.onSelect).toHaveBeenCalledWith(0, 'Opt A');
      expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
    });

    test('"Go Back" option: calls onGoBack and does not save', () => {
      mockGame.saveGameState.mockClear();
      menu.selectedOption = 2;

      menu.handleMenuSelection();

      expect(menu.onGoBack).toHaveBeenCalled();
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
      expect(menu.menuOptions[2]).toBe('Back');
    });
  });

  describe('integration with BaseMenu input', () => {
    test('mouse click delegates to selection logic without duplicate saves', () => {
      mockGame.saveGameState.mockClear();
      menu.selectedOption = 0;

      menu.handleMouseClick({ clientX: 0, clientY: 0 });

      expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
      expect(menu.onSelect).toHaveBeenCalledWith(0, 'Opt A');

      mockGame.saveGameState.mockClear();
      menu.selectedOption = 0;
      menu.handleMouseClick({ clientX: 0, clientY: 0 });

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });
  });

  describe('drawing', () => {
    test('draw() renders without throwing and preserves suffix state', () => {
      menu.setSelectedIndex(0);

      expect(() => menu.draw(ctx)).not.toThrow();
      expect(menu.menuOptions).toEqual(['Opt A - Selected', 'Opt B', 'Back']);
    });
  });
});
