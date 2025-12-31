import { BaseMenu } from '../../game/menu/baseMenu.js';

const getOptionCenterY = (game, menu, index) => {
  const optionHeight = 60;
  const topY = game.height / 2 - menu.positionOffset + menu.menuOptionsPositionOffset;
  return topY + optionHeight * index + optionHeight / 2;
};

describe('BaseMenu', () => {
  let menu, mockGame, ctx, preventEvent;

  beforeAll(() => {
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
    preventEvent = { preventDefault: jest.fn() };
    mockGame = {
      width: 1920,
      height: 689,
      canSelect: true,
      canSelectForestMap: true,
      isPlayerInGame: false,
      glacikalDefeated: false,
      elyvorgDefeated: false,
      ntharaxDefeated: false,
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
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 1920,
          height: 689
        })
      }
    };

    ctx = {
      save: jest.fn(),
      restore: jest.fn(),
      drawImage: jest.fn(),
      fillText: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      closePath: jest.fn()
    };

    menu = new BaseMenu(mockGame, ['A', 'B', 'C'], 'TITLE');
    menu.activateMenu();
  });

  describe('activation and basic state', () => {
    test('starts with option 0 selected', () => {
      expect(menu.selectedOption).toBe(0);
    });

    test('activateMenu() enables this menu, disables others, and sets currentMenu', () => {
      mockGame.menu.someOtherMenu.menuActive = true;

      menu.activateMenu(2);

      expect(menu.menuActive).toBe(true);
      expect(menu.selectedOption).toBe(2);

      Object.values(mockGame.menu).forEach(m => {
        expect(m.menuActive).toBe(false);
      });

      expect(mockGame.currentMenu).toBe(menu);
    });

    test('closeMenu() disables menu and clears currentMenu', () => {
      menu.closeMenu();
      expect(menu.menuActive).toBe(false);
      expect(mockGame.currentMenu).toBeNull();
    });

    test('closeAllMenus() disables all menus and clears currentMenu', () => {
      mockGame.menu.X = { menuActive: true };
      mockGame.menu.Y = { menuActive: true };

      menu.closeAllMenus();

      Object.values(mockGame.menu).forEach(m => {
        expect(m.menuActive).toBe(false);
      });
      expect(mockGame.currentMenu).toBeNull();
    });
  });

  describe('drawing behavior', () => {
    test('draw() renders menu frame when active', () => {
      expect(() => menu.draw(ctx)).not.toThrow();
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    test('draw() does nothing when menuActive is false', () => {
      menu.menuActive = false;
      ctx.save.mockClear();

      menu.draw(ctx);

      expect(ctx.save).not.toHaveBeenCalled();
    });

    test('draw() fills in-game overlay when paused', () => {
      menu.menuActive = true;
      menu.menuInGame = true;
      mockGame.menu.pause.isPaused = true;

      menu.draw(ctx);

      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, mockGame.width, mockGame.height);
    });

    test('draw() does NOT draw stars sticker when there is no progress', () => {
      menu.menuActive = true;
      menu.menuInGame = false;
      menu.showStarsSticker = true;

      mockGame.glacikalDefeated = false;
      mockGame.elyvorgDefeated = false;
      mockGame.ntharaxDefeated = false;

      ctx.drawImage.mockClear();

      menu.draw(ctx);

      const drawnImages = ctx.drawImage.mock.calls.map(call => call[0]);

      expect(drawnImages).toContain(menu.backgroundImage);

      expect(drawnImages).not.toContain(menu.greenBandImage);
    });

    test('draw() draws stars sticker when there is any boss progress', () => {
      menu.menuActive = true;
      menu.menuInGame = false;
      menu.showStarsSticker = true;

      mockGame.glacikalDefeated = true;

      ctx.drawImage.mockClear();

      menu.draw(ctx);

      const drawnImages = ctx.drawImage.mock.calls.map(call => call[0]);

      expect(drawnImages).toContain(menu.greenBandImage);

      expect(
        drawnImages.includes(menu.filledStarLeftImage) ||
        drawnImages.includes(menu.blankStarLeftImage) ||
        drawnImages.includes(menu.filledStarMiddleImage) ||
        drawnImages.includes(menu.blankStarMiddleImage) ||
        drawnImages.includes(menu.filledStarRightImage) ||
        drawnImages.includes(menu.blankStarRightImage)
      ).toBe(true);
    });

    test('drawStarsSticker draws storyCompleteText only when elyvorgDefeated is true', () => {
      mockGame.glacikalDefeated = false;
      mockGame.elyvorgDefeated = false;
      mockGame.ntharaxDefeated = false;

      ctx.drawImage.mockClear();

      menu.drawStarsSticker(ctx, { requireAnyProgress: false });

      let drawnImages = ctx.drawImage.mock.calls.map(call => call[0]);
      expect(drawnImages).not.toContain(menu.storyCompleteTextImage);

      ctx.drawImage.mockClear();
      mockGame.elyvorgDefeated = true;

      menu.drawStarsSticker(ctx, { requireAnyProgress: false });

      drawnImages = ctx.drawImage.mock.calls.map(call => call[0]);
      expect(drawnImages).toContain(menu.storyCompleteTextImage);
    });
  });

  describe('navigation helpers', () => {
    test('handleNavigation wraps selection index correctly', () => {
      menu.menuOptions = ['A', 'B', 'C'];
      menu.selectedOption = 0;

      menu.handleNavigation(-1);
      expect(menu.selectedOption).toBe(2);

      menu.handleNavigation(1);
      expect(menu.selectedOption).toBe(0);
    });
  });

  describe('keyboard input', () => {
    test('ArrowDown moves selection down and plays hover sound', () => {
      menu.handleKeyDown({ key: 'ArrowDown' });

      expect(menu.selectedOption).toBe(1);
      expect(mockGame.audioHandler.menu.playSound)
        .toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    test('ArrowUp moves selection up and plays hover sound', () => {
      menu.selectedOption = 1;

      menu.handleKeyDown({ key: 'ArrowUp' });

      expect(menu.selectedOption).toBe(0);
      expect(mockGame.audioHandler.menu.playSound)
        .toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    test('Enter calls handleMenuSelection only when menu is active', () => {
      const spy = jest.spyOn(menu, 'handleMenuSelection');

      menu.menuActive = false;
      menu.handleKeyDown({ key: 'Enter' });
      expect(spy).not.toHaveBeenCalled();

      menu.menuActive = true;
      menu.handleKeyDown({ key: 'Enter' });
      expect(spy).toHaveBeenCalled();
    });

    test('handleKeyDown ignores non-navigation keys', () => {
      menu.menuActive = true;
      mockGame.audioHandler.menu.playSound.mockClear();

      menu.handleKeyDown({ key: 'a' });

      expect(menu.selectedOption).toBe(0);
      expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
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

    test('handleKeyDown does nothing when canSelectForestMap=false', () => {
      menu.menuActive = true;
      mockGame.canSelectForestMap = false;
      mockGame.audioHandler.menu.playSound.mockClear();

      menu.handleKeyDown({ key: 'ArrowUp' });

      expect(menu.selectedOption).toBe(0);
      expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
    });
  });

  describe('mouse wheel input', () => {
    test('handleMouseWheel adjusts selection and plays hover sound', () => {
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

    test('handleMouseWheel does nothing when menuActive=false', () => {
      menu.menuActive = false;
      mockGame.audioHandler.menu.playSound.mockClear();

      menu.handleMouseWheel({ deltaY: 100 });

      expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
    });

    test('handleMouseWheel does nothing when canSelect=false', () => {
      menu.menuActive = true;
      mockGame.canSelect = false;
      mockGame.audioHandler.menu.playSound.mockClear();

      menu.handleMouseWheel({ deltaY: -100 });

      expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
    });
  });

  describe('mouse move / hover input', () => {
    test('handleMouseMove changes selection when pointer is over an option and plays sound', () => {
      const y2 = getOptionCenterY(mockGame, menu, 1);

      menu.handleMouseMove({ clientX: mockGame.width / 2, clientY: y2 });

      expect(menu.selectedOption).toBe(1);
      expect(mockGame.audioHandler.menu.playSound)
        .toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    test('handleMouseMove does nothing when canSelectForestMap=false', () => {
      menu.menuActive = true;
      mockGame.canSelectForestMap = false;
      mockGame.audioHandler.menu.playSound.mockClear();

      menu.handleMouseMove({ clientX: 100, clientY: 100 });

      expect(menu.selectedOption).toBe(0);
      expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
    });
  });

  describe('mouse click input', () => {
    test('mouse click calls BaseMenu selection but never saveGameState', () => {
      menu.handleMouseClick({ clientX: 0, clientY: 0 });

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('handleMouseClick does nothing when menuActive=false', () => {
      menu.menuActive = false;
      mockGame.saveGameState.mockClear();

      menu.handleMouseClick({ clientX: 0, clientY: 0 });

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('handleMouseClick does nothing when canSelectForestMap=false', () => {
      menu.menuActive = true;
      mockGame.canSelectForestMap = false;
      mockGame.saveGameState.mockClear();

      menu.handleMouseClick({ clientX: 0, clientY: 0 });

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });
  });

  describe('right-click input', () => {
    test('handleRightClick prevents default and delegates escape', () => {
      menu.handleRightClick(preventEvent);

      expect(preventEvent.preventDefault).toHaveBeenCalled();
      expect(mockGame.input.handleEscapeKey).toHaveBeenCalled();
    });

    test('handleRightClick does nothing when canSelectForestMap=false', () => {
      menu.menuActive = true;
      mockGame.canSelectForestMap = false;
      const evt = { preventDefault: jest.fn() };

      menu.handleRightClick(evt);

      expect(evt.preventDefault).not.toHaveBeenCalled();
      expect(mockGame.input.handleEscapeKey).not.toHaveBeenCalled();
    });
  });

  describe('update() soundtrack behavior', () => {
    test('update() plays soundtrack when player is not in game', () => {
      mockGame.isPlayerInGame = false;

      menu.update(16);

      expect(mockGame.audioHandler.menu.playSound)
        .toHaveBeenCalledWith('soundtrack');
    });

    test('update() does not play soundtrack when player is in game', () => {
      mockGame.audioHandler.menu.playSound.mockClear();
      mockGame.isPlayerInGame = true;

      menu.update(16);

      expect(mockGame.audioHandler.menu.playSound)
        .not.toHaveBeenCalledWith('soundtrack');
    });
  });

  describe('selection sound', () => {
    test('handleMenuSelection plays the selected-option sound', () => {
      mockGame.audioHandler.menu.playSound.mockClear();

      menu.handleMenuSelection();

      expect(mockGame.audioHandler.menu.playSound)
        .toHaveBeenCalledWith('optionSelectedSound', false, true);
    });
  });

  describe('BaseMenu never saves state on its own', () => {
    beforeEach(() => {
      mockGame.saveGameState.mockClear();
      menu.menuActive = true;
    });

    test('Enter triggers selection sound but does NOT save', () => {
      mockGame.saveGameState.mockClear();

      menu.handleKeyDown({ key: 'Enter' });

      expect(mockGame.audioHandler.menu.playSound)
        .toHaveBeenCalledWith('optionSelectedSound', false, true);
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('ArrowUp/ArrowDown navigate but do NOT save', () => {
      mockGame.saveGameState.mockClear();

      menu.handleKeyDown({ key: 'ArrowDown' });
      menu.handleKeyDown({ key: 'ArrowUp' });

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('mouse wheel navigates but does NOT save', () => {
      mockGame.saveGameState.mockClear();

      menu.handleMouseWheel({ deltaY: -100 });
      menu.handleMouseWheel({ deltaY: 100 });

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('mouse move hovers but does NOT save', () => {
      mockGame.saveGameState.mockClear();
      const y1 = getOptionCenterY(mockGame, menu, 0);

      menu.handleMouseMove({ clientX: mockGame.width / 2, clientY: y1 });

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('right-click delegates escape but does NOT save', () => {
      mockGame.saveGameState.mockClear();
      const evt = { preventDefault: jest.fn() };

      menu.handleRightClick(evt);

      expect(evt.preventDefault).toHaveBeenCalled();
      expect(mockGame.input.handleEscapeKey).toHaveBeenCalled();
      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });

    test('activateMenu/closeMenu/closeAllMenus do NOT save', () => {
      mockGame.saveGameState.mockClear();

      menu.activateMenu(1);
      menu.closeMenu();
      menu.closeAllMenus();

      expect(mockGame.saveGameState).not.toHaveBeenCalled();
    });
  });
});
