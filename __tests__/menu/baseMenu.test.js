import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('BaseMenu logic', () => {
  let menu, mockGame, ctx, preventEvent;

  beforeAll(() => {
    document.body.innerHTML = `
      <img id="mainmenubackground" />
      <img id="greenCompleted" />
    `;
  });

  beforeEach(() => {
    preventEvent = { preventDefault: jest.fn() };
    mockGame = {
      width: 1920,
      height: 689,
      canSelect: true,
      canSelectForestMap: true,
      isPlayerInGame: false,
      gameCompleted: false,
      audioHandler: { menu: { playSound: jest.fn() } },
      menu: {
        someOtherMenu: { menuActive: false },
        pause: { isPaused: false },
      },
      input: { handleEscapeKey: jest.fn() },
      currentMenu: null,
      saveGameState: jest.fn(),
      canvas: {
        width: 1920,
        height: 689,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 689 })
      }
    };

    ctx = {
      save: jest.fn(), restore: jest.fn(),
      drawImage: jest.fn(), fillText: jest.fn(),
      fillRect: jest.fn(), beginPath: jest.fn(), arc: jest.fn(),
      fill: jest.fn(), closePath: jest.fn()
    };

    menu = new BaseMenu(mockGame, ['A', 'B', 'C'], 'TITLE');
    menu.activateMenu();
  });

  test('starts with option 0 selected', () => {
    expect(menu.selectedOption).toBe(0);
  });

  test('ArrowDown increments selection and plays hover sound', () => {
    menu.handleKeyDown({ key: 'ArrowDown' });
    expect(menu.selectedOption).toBe(1);
    expect(mockGame.audioHandler.menu.playSound)
      .toHaveBeenCalledWith('optionHoveredSound', false, true);
  });

  test('draw() calls canvas methods without error', () => {
    expect(() => menu.draw(ctx)).not.toThrow();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  test('clicking calls saveGameState', () => {
    menu.handleMouseClick({ clientX: 0, clientY: 0 });
    expect(mockGame.saveGameState).toHaveBeenCalled();
  });

  test('activateMenu() disables every other menu', () => {
    mockGame.menu.someOtherMenu.menuActive = true;
    menu.activateMenu(2);
    expect(menu.menuActive).toBe(true);
    expect(menu.selectedOption).toBe(2);
    Object.values(mockGame.menu).forEach(m => {
      expect(m.menuActive).toBe(false);
    });
    expect(mockGame.currentMenu).toBe(menu);
  });

  test('closeMenu() and closeAllMenus()', () => {
    menu.closeMenu();
    expect(menu.menuActive).toBe(false);
    expect(mockGame.currentMenu).toBeNull();

    mockGame.menu.X = { menuActive: true };
    mockGame.menu.Y = { menuActive: true };
    menu.closeAllMenus();
    Object.values(mockGame.menu).forEach(m => {
      expect(m.menuActive).toBe(false);
    });
  });

  test('handleNavigation wrap‑around', () => {
    menu.menuOptions = ['A', 'B', 'C'];
    menu.selectedOption = 0;
    menu.handleNavigation(-1);
    expect(menu.selectedOption).toBe(2);
    menu.handleNavigation(1);
    expect(menu.selectedOption).toBe(0);
  });

  test('ArrowUp moves selection up and plays sound', () => {
    menu.selectedOption = 1;
    menu.handleKeyDown({ key: 'ArrowUp' });
    expect(menu.selectedOption).toBe(0);
    expect(mockGame.audioHandler.menu.playSound)
      .toHaveBeenCalledWith('optionHoveredSound', false, true);
  });

  test('Enter calls handleMenuSelection only when active', () => {
    const spy = jest.spyOn(menu, 'handleMenuSelection');
    menu.menuActive = false;
    menu.handleKeyDown({ key: 'Enter' });
    expect(spy).not.toHaveBeenCalled();

    menu.menuActive = true;
    menu.handleKeyDown({ key: 'Enter' });
    expect(spy).toHaveBeenCalled();
  });

  test('handleMouseWheel adjusts selection correctly', () => {
    menu.selectedOption = 0;
    menu.handleMouseWheel({ deltaY: -100 });
    expect(menu.selectedOption).toBe(2);
    expect(mockGame.audioHandler.menu.playSound)
      .toHaveBeenCalledWith('optionHoveredSound', false, true);

    mockGame.audioHandler.menu.playSound.mockClear();
    menu.handleMouseWheel({ deltaY: 100 });
    expect(menu.selectedOption).toBe(0);
    expect(mockGame.audioHandler.menu.playSound)
      .toHaveBeenCalledWith('optionHoveredSound', false, true);
  });

  test('handleMouseMove changes selection when pointer is over option', () => {
    const optionHeight = 60;
    const topY = mockGame.height / 2 - menu.positionOffset + menu.menuOptionsPositionOffset;
    const y2 = topY + optionHeight * 1 + optionHeight / 2;
    menu.handleMouseMove({ clientX: mockGame.width / 2, clientY: y2 });
    expect(menu.selectedOption).toBe(1);
    expect(mockGame.audioHandler.menu.playSound)
      .toHaveBeenCalledWith('optionHoveredSound', false, true);
  });

  test('handleRightClick prevents default and delegates escape', () => {
    menu.handleRightClick(preventEvent);
    expect(preventEvent.preventDefault).toHaveBeenCalled();
    expect(mockGame.input.handleEscapeKey).toHaveBeenCalled();
  });

  test('draw() does nothing when menuActive is false', () => {
    menu.menuActive = false;
    ctx.save.mockClear();
    menu.draw(ctx);
    expect(ctx.save).not.toHaveBeenCalled();
  });

  test('draw() fills overlay when in‑game paused', () => {
    menu.menuActive = true;
    menu.menuInGame = true;
    mockGame.menu.pause.isPaused = true;
    menu.draw(ctx);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, mockGame.width, mockGame.height);
  });

  test('draw() draws greenCompletedImage when gameCompleted', () => {
    menu.menuActive = true;
    menu.menuInGame = false;
    mockGame.gameCompleted = true;
    ctx.drawImage.mockClear();
    menu.draw(ctx);
    const calls = ctx.drawImage.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toBe(menu.greenCompletedImage);
    expect(lastCall[1]).toBe(10);
    expect(lastCall[2]).toBe(10);
  });

  test('update() plays soundtrack when not in game', () => {
    mockGame.isPlayerInGame = false;
    menu.update(16);
    expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('soundtrack');
  });

  test('update() does not play soundtrack when in game', () => {
    mockGame.audioHandler.menu.playSound.mockClear();
    mockGame.isPlayerInGame = true;
    menu.update(16);
    expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalledWith('soundtrack');
  });

  test('handleMenuSelection plays the selected‑option sound', () => {
    mockGame.audioHandler.menu.playSound.mockClear();
    menu.handleMenuSelection();
    expect(mockGame.audioHandler.menu.playSound)
      .toHaveBeenCalledWith('optionSelectedSound', false, true);
  });

  test('handleKeyDown does nothing when menuActive=false', () => {
    const spyNav = jest.spyOn(menu, 'handleNavigation');
    menu.menuActive = false;
    menu.handleKeyDown({ key: 'ArrowDown' });
    expect(spyNav).not.toHaveBeenCalled();
    expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
  });

  test('handleKeyDown does nothing when canSelect=false', () => {
    menu.menuActive = true;
    mockGame.canSelect = false;
    mockGame.audioHandler.menu.playSound.mockClear();
    menu.handleKeyDown({ key: 'ArrowDown' });
    expect(menu.selectedOption).toBe(0);
    expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
  });

  test('handleMouseWheel does nothing when menuActive=false', () => {
    menu.menuActive = false;
    mockGame.audioHandler.menu.playSound.mockClear();
    menu.handleMouseWheel({ deltaY: 100 });
    expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
  });

  test('handleMouseMove does nothing when canSelectForestMap=false', () => {
    menu.menuActive = true;
    mockGame.canSelectForestMap = false;
    mockGame.audioHandler.menu.playSound.mockClear();
    menu.handleMouseMove({ clientX: 100, clientY: 100 });
    expect(menu.selectedOption).toBe(0);
    expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
  });

  test('handleMouseClick does nothing when menuActive=false', () => {
    menu.menuActive = false;
    mockGame.saveGameState.mockClear();
    menu.handleMouseClick({ clientX: 0, clientY: 0 });
    expect(mockGame.saveGameState).not.toHaveBeenCalled();
  });
  test('handleKeyDown does nothing when canSelectForestMap=false', () => {
    menu.menuActive = true;
    mockGame.canSelectForestMap = false;
    mockGame.audioHandler.menu.playSound.mockClear();
    menu.handleKeyDown({ key: 'ArrowUp' });
    expect(menu.selectedOption).toBe(0);
    expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
  });

  test('handleMouseWheel does nothing when canSelect=false', () => {
    menu.menuActive = true;
    mockGame.canSelect = false;
    mockGame.audioHandler.menu.playSound.mockClear();
    menu.handleMouseWheel({ deltaY: -100 });
    expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
  });

  test('handleRightClick does nothing when canSelectForestMap=false', () => {
    menu.menuActive = true;
    mockGame.canSelectForestMap = false;
    const evt = { preventDefault: jest.fn() };
    menu.handleRightClick(evt);
    expect(evt.preventDefault).not.toHaveBeenCalled();
    expect(mockGame.input.handleEscapeKey).not.toHaveBeenCalled();
  });

  test('handleMouseClick does nothing when canSelectForestMap=false', () => {
    menu.menuActive = true;
    mockGame.canSelectForestMap = false;
    mockGame.saveGameState.mockClear();
    menu.handleMouseClick({ clientX: 0, clientY: 0 });
    expect(mockGame.saveGameState).not.toHaveBeenCalled();
  });

  test('handleKeyDown ignores non‑navigation keys', () => {
    menu.menuActive = true;
    mockGame.audioHandler.menu.playSound.mockClear();
    menu.handleKeyDown({ key: 'a' });
    expect(menu.selectedOption).toBe(0);
    expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
  });
});
