import { InputHandler } from '../../game/interface/input';
import { getDefaultKeyBindings } from '../../game/config/keyBindings';

jest.mock('../../game/config/keyBindings', () => ({
  getDefaultKeyBindings: () => ({
    jump: 'w',
    moveBackward: 'a',
    sit: 's',
    moveForward: 'd',
    rollAttack: 'Enter',
    diveAttack: 's',
    fireballAttack: 'q',
    invisibleDefense: 'e',
    dashAttack: 'Shift',
  }),
}));

const keyDown = (key, extra = {}) =>
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ...extra }));
const keyUp = (key, extra = {}) =>
  window.dispatchEvent(new KeyboardEvent('keyup', { key, ...extra }));
const mouseDown = (button) =>
  document.dispatchEvent(new MouseEvent('mousedown', { button }));
const mouseUp = (button) =>
  document.dispatchEvent(new MouseEvent('mouseup', { button }));

const makeGame = () => {
  const game = {
    enterToTalkToPenguin: false,
    talkToPenguin: false,

    boss: { talkToBoss: false },
    isBossVisible: false,

    enterDuringBackgroundTransition: true,

    fadingIn: false,
    waitForFadeInOpacity: false,
    pauseContext: 'gameplay',

    isPlayerInGame: false,
    cutsceneActive: false,
    notEnoughCoins: false,
    gameOver: false,
    canSelectForestMap: false,
    currentMenu: null,

    player: { isUnderwater: false },
    tutorial: { tutorialPause: false },
    isTutorialActive: false,

    menu: {
      pause: {
        isPaused: false,
        canEscape: false,
        togglePause: jest.fn(),
      },
      forestMap: {
        activateMenu: jest.fn(),
        showSavingSprite: false,
      },
      enemyLore: {
        activateMenu: jest.fn(),
        menuActive: false,
      },
      howToPlay: {
        menuInGame: false,
        currentImageIndex: 5,
      },
      main: {
        activateMenu: jest.fn(),
        selectedOption: 0,
      },
    },

    audioHandler: {
      firedogSFX: { playSound: jest.fn() },
      menu: { playSound: jest.fn() },
      cutsceneSFX: { isPlaying: jest.fn(() => false) },
    },

    saveGameState: jest.fn(),
    debug: false,
  };

  game.nav = {
    openTransient: jest.fn((menu, arg = 0) => {
      if (menu && typeof menu.activateMenu === 'function') menu.activateMenu(arg);
      game.currentMenu = menu;
    }),
    closeTransient: jest.fn(() => {
      if (game.menu.forestMap && typeof game.menu.forestMap.activateMenu === 'function') {
        game.menu.forestMap.activateMenu(0);
      }
      game.currentMenu = game.menu.forestMap;
    }),
  };

  game.goBackMenu = jest.fn(() => {
    if (game.menu.main && typeof game.menu.main.activateMenu === 'function') {
      game.menu.main.activateMenu(0);
    }
    game.currentMenu = game.menu.main;
  });

  return game;
};

describe('InputHandler', () => {
  let game;
  let ih;

  beforeAll(() => {
    ih = new InputHandler(makeGame());
  });

  beforeEach(() => {
    game = makeGame();

    ih.game = game;

    ih.keys = [];
    ih.arrowUpPressed = false;
    ih.arrowDownPressed = false;
    ih.isJumpKeyPressed = false;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('keydown handling', () => {
    describe('Enter key & Elyvorg / Penguin gating', () => {
      test('when talkToPenguin & transition, pushes "Enter" and sets enterToTalkToPenguin', () => {
        game.talkToPenguin = true;

        keyDown('Enter');

        expect(ih.keys).toContain('Enter');
        expect(game.enterToTalkToPenguin).toBe(true);
      });

      test('when not talkToPenguin but transition, pushes "Enter" only', () => {
        game.talkToPenguin = false;

        keyDown('Enter');

        expect(ih.keys).toContain('Enter');
        expect(game.enterToTalkToPenguin).toBe(false);
      });

      test('when talking to boss & fully visible, Enter is ignored as gameplay input', () => {
        game.boss.talkToBoss = true;
        game.isBossVisible = true;
        ih.keys = [];

        keyDown('Enter');

        expect(ih.keys.filter((k) => k === 'Enter')).toHaveLength(0);
      });
    });

    describe('movement and ability keys (default bindings)', () => {
      test('pushes lowercase movement/ability keys when allowed (w/a/s/d/q/e)', () => {
        ['s', 'A', 'd', 'Q', 'e'].forEach((k) => keyDown(k));

        expect(ih.keys).toEqual(expect.arrayContaining(['s', 'a', 'd', 'q', 'e']));
      });

      test('pushes dash key "Shift" (default dashAttack binding)', () => {
        keyDown('Shift');
        expect(ih.keys).toContain('Shift');
      });

      test('does not push any gameplay keys when background transition is disabled', () => {
        game.enterDuringBackgroundTransition = false;
        ih.keys = [];

        keyDown('s');
        keyDown('w');
        keyDown('Shift');

        expect(ih.keys).toEqual([]);
      });

      test('prevents duplicate non-underwater gameplay keys (single-char)', () => {
        ih.keys = [];

        keyDown('s');
        keyDown('S');

        expect(ih.keys.filter((k) => k === 's')).toHaveLength(1);
      });

      test('does not duplicate Shift either', () => {
        ih.keys = [];
        keyDown('Shift');
        keyDown('Shift');

        expect(ih.keys.filter((k) => k === 'Shift')).toHaveLength(1);
      });

      test('pushes jump key "w" when player is not underwater', () => {
        game.player.isUnderwater = false;

        keyDown('w');

        expect(ih.keys).toContain('w');
      });

      test('when underwater, jump key "w" is added once until release', () => {
        game.player.isUnderwater = true;

        keyDown('w');
        expect(ih.keys).toContain('w');
        expect(ih.isJumpKeyPressed).toBe(true);

        keyDown('W');
        expect(ih.keys.filter((k) => k === 'w')).toHaveLength(1);

        keyUp('w');
        expect(ih.isJumpKeyPressed).toBe(false);
        expect(ih.keys).not.toContain('w');
      });

      test('when talking to boss & not fully visible, any gameplay key maps to "d"', () => {
        game.boss.talkToBoss = true;
        game.isBossVisible = false;
        ih.keys = [];

        keyDown('s');
        keyDown('a');
        keyDown('Shift');

        expect(ih.keys).toEqual(['d', 'd', 'd']);
      });

      test('when talking to boss & fully visible, movement keys are ignored', () => {
        game.boss.talkToBoss = true;
        game.isBossVisible = true;
        ih.keys = [];

        keyDown('s');
        keyDown('Enter');

        expect(ih.keys).not.toContain('s');
      });
    });

    describe('"b" bark key', () => {
      test('plays barkSound when in-game and not paused/tutorial/over', () => {
        game.isPlayerInGame = true;

        keyDown('b', { ctrlKey: true });

        expect(game.audioHandler.firedogSFX.playSound).toHaveBeenCalledWith('barkSound');
      });

      test('does not play barkSound when tutorial is paused', () => {
        game.isPlayerInGame = true;
        game.tutorial.tutorialPause = true;

        keyDown('b');

        expect(game.audioHandler.firedogSFX.playSound).not.toHaveBeenCalled();
      });
    });

    describe('Tab key (forest map / enemy lore toggle)', () => {
      test('toggles from forestMap to enemyLore and plays enemyLoreOpenBookSound when allowed', () => {
        game.canSelectForestMap = true;
        game.currentMenu = game.menu.forestMap;

        keyDown('Tab');

        expect(game.nav.openTransient).toHaveBeenCalledWith(game.menu.enemyLore, 0);
        expect(game.menu.enemyLore.activateMenu).toHaveBeenCalledWith(0);

        expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith(
          'enemyLoreOpenBookSound',
          false,
          true
        );

        expect(game.currentMenu).toBe(game.menu.enemyLore);
      });

      test('toggles from enemyLore back to forestMap and plays enemyLoreCloseBookSound when allowed', () => {
        game.canSelectForestMap = true;
        game.currentMenu = game.menu.enemyLore;

        keyDown('Tab');

        expect(game.nav.closeTransient).toHaveBeenCalledTimes(1);

        expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith(
          'enemyLoreCloseBookSound',
          false,
          true
        );

        expect(game.menu.forestMap.activateMenu).toHaveBeenCalledWith(0);
        expect(game.currentMenu).toBe(game.menu.forestMap);
      });

      test('does nothing when forestMap selection is disabled', () => {
        game.canSelectForestMap = false;
        game.currentMenu = game.menu.forestMap;

        keyDown('Tab');

        expect(game.nav.openTransient).not.toHaveBeenCalled();
        expect(game.nav.closeTransient).not.toHaveBeenCalled();
        expect(game.menu.enemyLore.activateMenu).not.toHaveBeenCalled();
        expect(game.menu.forestMap.activateMenu).not.toHaveBeenCalled();
      });
    });

    describe('Escape key (pause / menu / cutscene handling)', () => {
      test('when in story cutscene (not in-game, not penguin, not boss), Escape toggles pause', () => {
        game.cutsceneActive = true;
        game.isPlayerInGame = false;
        game.talkToPenguin = false;
        game.boss.talkToBoss = false;

        game.enterDuringBackgroundTransition = true;
        game.fadingIn = false;
        game.waitForFadeInOpacity = false;

        keyDown('Escape');

        expect(game.menu.pause.togglePause).toHaveBeenCalledTimes(1);
      });

      test('when in story cutscene but transition is disabled, Escape does nothing', () => {
        game.cutsceneActive = true;
        game.isPlayerInGame = false;
        game.talkToPenguin = false;
        game.boss.talkToBoss = false;

        game.enterDuringBackgroundTransition = false;

        keyDown('Escape');

        expect(game.menu.pause.togglePause).not.toHaveBeenCalled();
      });

      test('when in story cutscene but fadingIn is true, Escape does nothing', () => {
        game.cutsceneActive = true;
        game.isPlayerInGame = false;
        game.talkToPenguin = false;
        game.boss.talkToBoss = false;

        game.enterDuringBackgroundTransition = true;
        game.fadingIn = true;
        game.waitForFadeInOpacity = false;

        keyDown('Escape');

        expect(game.menu.pause.togglePause).not.toHaveBeenCalled();
      });

      test('when in story cutscene but waitForFadeInOpacity is true, Escape does nothing', () => {
        game.cutsceneActive = true;
        game.isPlayerInGame = false;
        game.talkToPenguin = false;
        game.boss.talkToBoss = false;

        game.enterDuringBackgroundTransition = true;
        game.fadingIn = false;
        game.waitForFadeInOpacity = true;

        keyDown('Escape');

        expect(game.menu.pause.togglePause).not.toHaveBeenCalled();
      });

      test('when in-game with no menu and no blockers, toggles pause menu', () => {
        game.isPlayerInGame = true;
        game.currentMenu = null;
        game.cutsceneActive = false;
        game.notEnoughCoins = false;
        game.gameOver = false;
        game.enterDuringBackgroundTransition = true;

        keyDown('Escape');

        expect(game.menu.pause.togglePause).toHaveBeenCalled();
      });

      test('when in cutscene & talking to Penguin, Escape toggles pause', () => {
        game.isPlayerInGame = true;
        game.cutsceneActive = true;
        game.talkToPenguin = true;
        game.currentMenu = null;
        game.enterDuringBackgroundTransition = true;

        keyDown('Escape');

        expect(game.menu.pause.togglePause).toHaveBeenCalled();
      });

      test('when saving sprite is visible, does not enter handleEscapeKey path', () => {
        game.currentMenu = {};
        game.menu.forestMap.showSavingSprite = true;
        const spy = jest.spyOn(ih, 'handleEscapeKey');

        keyDown('Escape');

        expect(spy).not.toHaveBeenCalled();
      });

      test('when in submenu and saving sprite hidden, delegates to handleEscapeKey', () => {
        game.currentMenu = {};
        game.menu.forestMap.showSavingSprite = false;
        const spy = jest.spyOn(ih, 'handleEscapeKey');

        keyDown('Escape');

        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('keyup handling', () => {
    test('removes gameplay keys (including Enter) on keyup', () => {
      game.enterDuringBackgroundTransition = true;
      ih.keys = ['s', 'w', 'Enter', 'Shift'];

      ['s', 'w', 'Enter', 'Shift'].forEach((k) => keyUp(k));

      expect(ih.keys).toEqual([]);
    });

    test('uppercase keyup removes matching lowercase key', () => {
      game.enterDuringBackgroundTransition = true;
      ih.keys = ['s'];

      keyUp('S');

      expect(ih.keys).toEqual([]);
    });

    test('arrowup and arrowdown keyup reset flags', () => {
      ih.arrowUpPressed = true;
      ih.arrowDownPressed = true;

      keyUp('arrowup');
      keyUp('arrowdown');

      expect(ih.arrowUpPressed).toBe(false);
      expect(ih.arrowDownPressed).toBe(false);
    });
  });

  describe('mouse handling', () => {
    describe('mousedown', () => {
      test('pushes left/right/scroll click tokens when allowed', () => {
        game.boss.talkToBoss = false;
        ih.keys = [];

        mouseDown(0);
        mouseDown(2);
        mouseDown(1);

        expect(ih.keys).toEqual(
          expect.arrayContaining(['leftClick', 'rightClick', 'scrollClick'])
        );
      });

      test('pushes sideClick1 for mouse button 4 (dash mouse binding)', () => {
        ih.keys = [];
        const prevent = jest
          .spyOn(MouseEvent.prototype, 'preventDefault')
          .mockImplementation(() => { });

        mouseDown(4);

        expect(ih.keys).toContain('sideClick1');
        expect(prevent).toHaveBeenCalled();

        prevent.mockRestore();
      });

      test('when talking to boss & not fully visible, mousedown maps to moveForward ("d")', () => {
        game.boss.talkToBoss = true;
        game.isBossVisible = false;
        ih.keys = [];

        mouseDown(0);

        expect(ih.keys).toEqual(['d']);
      });

      test('when talking to boss & fully visible, mousedown does nothing', () => {
        game.boss.talkToBoss = true;
        game.isBossVisible = true;
        ih.keys = [];

        mouseDown(0);

        expect(ih.keys).toEqual([]);
      });

      test('does nothing on mousedown when background transition is disabled', () => {
        game.enterDuringBackgroundTransition = false;
        ih.keys = [];

        mouseDown(0);
        mouseDown(4);

        expect(ih.keys).toEqual([]);
      });
    });

    describe('mouseup', () => {
      test('leftClick is removed and may trigger Penguin dialogue when talkToPenguin', () => {
        game.enterDuringBackgroundTransition = true;
        game.talkToPenguin = true;
        ih.keys = ['leftClick'];

        mouseUp(0);

        expect(ih.keys).toEqual([]);
        expect(game.enterToTalkToPenguin).toBe(true);
      });

      test('rightClick is removed and does not trigger Penguin when not talking to Penguin', () => {
        game.enterDuringBackgroundTransition = true;
        game.talkToPenguin = false;
        ih.keys = ['rightClick'];

        mouseUp(2);

        expect(ih.keys).toEqual([]);
        expect(game.enterToTalkToPenguin).toBe(false);
      });

      test('scrollClick is removed on middle mouse button up', () => {
        game.enterDuringBackgroundTransition = true;
        ih.keys = ['scrollClick'];

        mouseUp(1);

        expect(ih.keys).toEqual([]);
      });

      test('sideClick1 is removed on button 4 mouseup', () => {
        game.enterDuringBackgroundTransition = true;
        ih.keys = ['sideClick1'];

        mouseUp(4);

        expect(ih.keys).toEqual([]);
      });
    });
  });

  describe('ability helper methods', () => {
    test('isRollAttack accepts keyboard (Enter) and right-click, but not unrelated keys', () => {
      expect(ih.isRollAttack(['Enter'])).toBe(true);
      expect(ih.isRollAttack(['rightClick'])).toBe(true);
      expect(ih.isRollAttack(['q'])).toBeUndefined();
    });

    test('isInvisibleDefense accepts keyboard (e) and scroll-click, but not unrelated keys', () => {
      expect(ih.isInvisibleDefense(['e'])).toBe(true);
      expect(ih.isInvisibleDefense(['scrollClick'])).toBe(true);
      expect(ih.isInvisibleDefense(['a'])).toBeUndefined();
    });

    test('isFireballAttack accepts keyboard (q) and left-click, but not unrelated keys', () => {
      expect(ih.isFireballAttack(['q'])).toBe(true);
      expect(ih.isFireballAttack(['leftClick'])).toBe(true);
      expect(ih.isFireballAttack(['e'])).toBeUndefined();
    });

    test('isDashAttack accepts keyboard (Shift) and sideClick1, but not unrelated keys', () => {
      expect(ih.isDashAttack(['Shift'])).toBe(true);
      expect(ih.isDashAttack(['sideClick1'])).toBe(true);
      expect(ih.isDashAttack(['q'])).toBeUndefined();
    });
  });

  describe('handleEscapeKey direct logic', () => {
    test('when in non-enemyLore submenu, goes back to main via goBackMenu', () => {
      game.currentMenu = { menuInGame: false };

      ih.handleEscapeKey();

      expect(game.goBackMenu).toHaveBeenCalledTimes(1);
      expect(game.currentMenu).toBe(game.menu.main);
    });

    test('when current menu is enemyLore, flips back to forestMap with enemyLoreCloseBookSound sound', () => {
      game.currentMenu = game.menu.enemyLore;
      game.menu.enemyLore.menuInGame = false;
      game.menu.enemyLore.menuActive = true;

      ih.handleEscapeKey();

      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith(
        'enemyLoreCloseBookSound',
        false,
        true
      );
      expect(game.nav.closeTransient).toHaveBeenCalledTimes(1);
      expect(game.menu.forestMap.activateMenu).toHaveBeenCalledWith(0);
      expect(game.currentMenu).toBe(game.menu.forestMap);
    });

    test('when in in-game menu and canEscape is true, toggles pause and clears canEscape', () => {
      game.menu.pause.canEscape = true;
      game.currentMenu = game.menu.pause;
      game.menu.pause.menuInGame = true;
      game.gameOver = false;

      ih.handleEscapeKey();

      expect(game.menu.pause.togglePause).toHaveBeenCalled();
      expect(game.menu.pause.canEscape).toBe(false);
    });
  });

  describe('bindings-aware jump (underwater one-shot)', () => {
    test('uses custom jump binding (ArrowUp) and enforces one-shot until keyup', () => {
      game.keyBindings = { ...getDefaultKeyBindings(), jump: 'ArrowUp' };
      game.player.isUnderwater = true;
      ih.keys = [];
      ih.isJumpKeyPressed = false;

      keyDown('ArrowUp');
      expect(ih.keys).toContain('ArrowUp');
      expect(ih.isJumpKeyPressed).toBe(true);

      keyDown('ArrowUp');
      expect(ih.keys.filter((k) => k === 'ArrowUp')).toHaveLength(1);

      keyUp('ArrowUp');
      expect(ih.isJumpKeyPressed).toBe(false);
      expect(ih.keys).not.toContain('ArrowUp');
    });
  });

  describe('unbound keyboard gameplay actions', () => {
    test('unbound moveForward: pressing default "d" is ignored', () => {
      game.keyBindings = { ...getDefaultKeyBindings(), moveForward: null };
      ih.keys = [];

      keyDown('d');

      expect(ih.keys).not.toContain('d');
    });

    test('unbound moveBackward: pressing default "a" is ignored', () => {
      game.keyBindings = { ...getDefaultKeyBindings(), moveBackward: null };
      ih.keys = [];

      keyDown('a');

      expect(ih.keys).not.toContain('a');
    });

    test('unbound sit: pressing default "s" is ignored', () => {
      game.keyBindings = {
        ...getDefaultKeyBindings(),
        sit: null,
        diveAttack: 'k',
      };
      ih.keys = [];

      keyDown('s');

      expect(ih.keys).not.toContain('s');
    });

    test('unbound diveAttack: pressing default "s" is ignored', () => {
      game.keyBindings = {
        ...getDefaultKeyBindings(),
        sit: 'k',
        diveAttack: null,
      };
      ih.keys = [];

      keyDown('s');

      expect(ih.keys).not.toContain('s');
    });

    test('unbound jump: pressing default "w" is ignored, even underwater', () => {
      game.keyBindings = { ...getDefaultKeyBindings(), jump: null };
      game.player.isUnderwater = true;
      ih.keys = [];
      ih.isJumpKeyPressed = false;

      keyDown('w');

      expect(ih.keys).not.toContain('w');
      expect(ih.isJumpKeyPressed).toBe(false);
    });

    test('unbound dashAttack: pressing default "Shift" is ignored by keydown', () => {
      game.keyBindings = { ...getDefaultKeyBindings(), dashAttack: null };
      ih.keys = [];

      keyDown('Shift');

      expect(ih.keys).not.toContain('Shift');
    });
  });

  describe('unbound ability keys (helper methods still honor mouse clicks)', () => {
    test('unbound rollAttack: Enter no longer triggers, but rightClick still works', () => {
      game.keyBindings = { ...getDefaultKeyBindings(), rollAttack: null };

      expect(ih.isRollAttack(['Enter'])).toBeUndefined();
      expect(ih.isRollAttack(['rightClick'])).toBe(true);
    });

    test('unbound fireballAttack: q no longer triggers, but leftClick still works', () => {
      game.keyBindings = { ...getDefaultKeyBindings(), fireballAttack: null };

      expect(ih.isFireballAttack(['q'])).toBeUndefined();
      expect(ih.isFireballAttack(['leftClick'])).toBe(true);
    });

    test('unbound invisibleDefense: e no longer triggers, but scrollClick still works', () => {
      game.keyBindings = { ...getDefaultKeyBindings(), invisibleDefense: null };

      expect(ih.isInvisibleDefense(['e'])).toBeUndefined();
      expect(ih.isInvisibleDefense(['scrollClick'])).toBe(true);
    });

    test('unbound dashAttack: Shift no longer triggers, but sideClick1 still works', () => {
      game.keyBindings = { ...getDefaultKeyBindings(), dashAttack: null };

      expect(ih.isDashAttack(['Shift'])).toBeUndefined();
      expect(ih.isDashAttack(['sideClick1'])).toBe(true);
    });
  });

  describe('unbound ability keydown (keyboard gameplay keys ignored)', () => {
    test('unbound invisibleDefense: pressing default "e" is ignored by keydown', () => {
      game.keyBindings = { ...getDefaultKeyBindings(), invisibleDefense: null };
      ih.keys = [];

      keyDown('e');

      expect(ih.keys).not.toContain('e');
    });

    test('unbound fireballAttack: pressing default "q" is ignored by keydown', () => {
      game.keyBindings = { ...getDefaultKeyBindings(), fireballAttack: null };
      ih.keys = [];

      keyDown('q');

      expect(ih.keys).not.toContain('q');
    });

    test('unbound rollAttack: pressing default "Enter" is not treated as gameplay key', () => {
      game.keyBindings = { ...getDefaultKeyBindings(), rollAttack: null };
      ih.keys = [];

      keyDown('Enter');

      expect(ih.keys).not.toContain('Enter');
    });
  });
});