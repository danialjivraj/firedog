jest.mock('../../game/menu/baseMenu.js', () => {
  class BaseMenu {
    constructor(game, menuOptions, title) {
      this.game = game;
      this.menuOptions = menuOptions;
      this.title = title;

      this.selectedOption = 0;
      this.menuActive = false;
      this.menuInGame = false;
      this.showStarsSticker = true;

      this.backgroundImage = null;

      this.canPressNow = true;
    }

    activateMenu(selectedOption = 0) {
      this.menuActive = true;
      this.selectedOption = selectedOption;
      this.game.currentMenu = this;
    }

    handleMenuSelection() {
      this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
    }

    drawStarsSticker() { }
  }

  return { BaseMenu };
});

import { AudioSettingsMenu } from '../../game/menu/audioSettingsMenu.js';

describe('AudioSettingsMenu', () => {
  let menu;
  let game;

  const addAudioEl = (id) => {
    const el = document.createElement('audio');
    el.id = id;
    el.volume = 1;
    document.body.appendChild(el);
    return el;
  };

  const clearAudios = () => {
    document.querySelectorAll('audio').forEach((n) => n.remove());
  };

  const makeGame = () => {
    const menuSoundsMapping = {
      soundtrack: 'menu_track',
      mapOpening: 'map_open',
      enemyLoreOpenBookSound: 'lore_open',
      enemyLoreCloseBookSound: 'lore_close',
      bookFlipBackwardSound: 'flip_back',
      bookFlipForwardSound: 'flip_fwd',
      enemyLoreSwitchTabSound: 'lore_tab',
      optionSelectedSound: 'opt_sel',
      optionHoveredSound: 'opt_hov',
    };

    const cutsceneMusicMapping = { cm1: 'cut_music_1' };
    const cutsceneSFXMapping = { cs1: 'cut_sfx_1' };
    const cutsceneDialogueMapping = { cd1: 'cut_dia_1' };

    const mapSoundtrackMapping = { igm1: 'ingame_music_1' };
    const enemySFXMapping = { es1: 'enemy_sfx_1' };
    const firedogSFXMapping = { fs1: 'firedog_sfx_1' };
    const collisionSFXMapping = { col1: 'collision_sfx_1' };
    const powerUpDownMapping = { pu1: 'power_sfx_1' };

    const g = {
      width: 1920,
      height: 689,
      canvas: {
        width: 1920,
        height: 689,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 480 }),
      },

      canSelect: true,
      canSelectForestMap: true,

      isPlayerInGame: true,
      cutsceneActive: false,
      currentCutscene: null,

      currentMenu: null,

      menu: {
        pause: {
          isPaused: false,
          activateMenu: jest.fn(),
        },
        settings: {
          activateMenu: jest.fn(),
        },
      },

      saveGameState: jest.fn(),

      audioHandler: {
        menu: {
          soundsMapping: menuSoundsMapping,
          getSoundsMapping: jest.fn(() => ({ ...menuSoundsMapping })),
          playSound: jest.fn(),
        },
        cutsceneMusic: { getSoundsMapping: jest.fn(() => ({ ...cutsceneMusicMapping })) },
        cutsceneSFX: { getSoundsMapping: jest.fn(() => ({ ...cutsceneSFXMapping })) },
        cutsceneDialogue: { getSoundsMapping: jest.fn(() => ({ ...cutsceneDialogueMapping })) },

        mapSoundtrack: { getSoundsMapping: jest.fn(() => ({ ...mapSoundtrackMapping })) },
        enemySFX: { getSoundsMapping: jest.fn(() => ({ ...enemySFXMapping })) },
        firedogSFX: { getSoundsMapping: jest.fn(() => ({ ...firedogSFXMapping })) },
        collisionSFX: { getSoundsMapping: jest.fn(() => ({ ...collisionSFXMapping })) },
        powerUpAndDownSFX: { getSoundsMapping: jest.fn(() => ({ ...powerUpDownMapping })) },
      },
    };

    return g;
  };

  const addAllAudioEls = () => {
    [
      // menu
      'menu_track',
      'map_open',
      'lore_open',
      'lore_close',
      'flip_back',
      'flip_fwd',
      'lore_tab',
      'opt_sel',
      'opt_hov',
      // cutscene
      'cut_music_1',
      'cut_sfx_1',
      'cut_dia_1',
      // ingame
      'ingame_music_1',
      'enemy_sfx_1',
      'firedog_sfx_1',
      'collision_sfx_1',
      'power_sfx_1',
    ].forEach(addAudioEl);
  };

  const clientFromCanvas = (x, y) => {
    const rect = game.canvas.getBoundingClientRect();
    return {
      clientX: rect.left + (x / game.canvas.width) * rect.width,
      clientY: rect.top + (y / game.canvas.height) * rect.height,
    };
  };

  const setInteractable = (enabled) => {
    menu.menuActive = enabled;
    game.canSelect = enabled;
    game.canSelectForestMap = enabled;
  };

  beforeAll(() => {
    document.body.innerHTML = `<img id="mainmenubackground" />`;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    clearAudios();
    addAllAudioEls();

    game = makeGame();
    menu = new AudioSettingsMenu(game);
    menu.activateMenu();
  });

  describe('construction & defaults', () => {
    test('initializes tabs, defaults to MENU tab, and header row is selected on activateMenu()', () => {
      expect(menu.title).toBe('Audio Settings');

      expect(menu.tabs).toEqual(['MENU', 'CUTSCENE', 'INGAME']);
      expect(menu.activeTab).toBe('MENU');

      expect(menu.menuOptions).toEqual([
        'Menu Master Volume',
        'Menu Music',
        'Map SFX',
        'Wardrobe SFX',
        'Menu Navigation SFX',
        'Go Back',
      ]);
      expect(menu.volumeLevels).toEqual([50, 50, 50, 50, 50, null]);

      expect(menu.muted).toEqual([false, false, false, false, false, null]);

      expect(menu.headerSelectionIndex).toBe(-1);
      expect(menu.selectedOption).toBe(-1);
      expect(menu.isHeaderSelected()).toBe(true);
    });

    test('setTab falls back to MENU for unknown tab keys', () => {
      menu.setTab('NOT_A_REAL_TAB');
      expect(menu.activeTab).toBe('MENU');
    });

    test('_displayTabLabel formats INGAME as IN-GAME and leaves others unchanged', () => {
      expect(menu._displayTabLabel('MENU')).toBe('MENU');
      expect(menu._displayTabLabel('CUTSCENE')).toBe('CUTSCENE');
      expect(menu._displayTabLabel('INGAME')).toBe('IN-GAME');
    });
  });

  describe('activateMenu() in-game detection and options', () => {
    test('when game is paused in-game gameplay, activateMenu() chooses INGAME tab and hides stars sticker', () => {
      game.menu.pause.isPaused = true;
      game.isPlayerInGame = true;
      game.cutsceneActive = false;
      game.currentCutscene = null;

      menu.activateMenu();

      expect(menu.menuInGame).toBe(true);
      expect(menu.showStarsSticker).toBe(false);
      expect(menu.activeTab).toBe('INGAME');
      expect(menu.selectedOption).toBe(menu.headerSelectionIndex);
    });

    test('when paused + cutsceneActive + currentCutscene, activateMenu() chooses CUTSCENE tab and hides stars sticker', () => {
      game.menu.pause.isPaused = true;
      game.isPlayerInGame = false;
      game.cutsceneActive = true;
      game.currentCutscene = {};

      menu.activateMenu();

      expect(menu.menuInGame).toBe(true);
      expect(menu.showStarsSticker).toBe(false);
      expect(menu.activeTab).toBe('CUTSCENE');
      expect(menu.selectedOption).toBe(menu.headerSelectionIndex);
    });

    test('paused cutsceneActive but missing currentCutscene does NOT infer cutscene overlay', () => {
      game.menu.pause.isPaused = true;
      game.isPlayerInGame = false;
      game.cutsceneActive = true;
      game.currentCutscene = null;

      menu.activateMenu();

      expect(menu.menuInGame).toBe(false);
      expect(menu.showStarsSticker).toBe(true);
      expect(menu.activeTab).toBe('MENU');
    });

    test('opts.inGame overrides inferred overlay (gameplay pause case)', () => {
      game.menu.pause.isPaused = true;
      game.isPlayerInGame = true;

      menu.activateMenu({ inGame: false });

      expect(menu.menuInGame).toBe(false);
      expect(menu.activeTab).toBe('MENU');
    });

    test('opts.inGame=false does NOT override CUTSCENE defaultTab when shouldBeCutscene is true', () => {
      game.menu.pause.isPaused = true;
      game.isPlayerInGame = false;
      game.cutsceneActive = true;
      game.currentCutscene = {};

      menu.activateMenu({ inGame: false });

      expect(menu.menuInGame).toBe(false);
      expect(menu.activeTab).toBe('CUTSCENE');
      expect(menu.showStarsSticker).toBe(true);
    });

    test('opts.selectedOption is accepted but selection is clamped into header range', () => {
      menu.activateMenu({ selectedOption: 2 });
      expect(menu.selectedOption).toBe(menu.headerSelectionIndex);
    });
  });

  describe('tab swapping & selection rules', () => {
    test('setTab swaps menuOptions, volumeLevels, and muted for CUTSCENE and INGAME', () => {
      menu.setTab('CUTSCENE');
      expect(menu.activeTab).toBe('CUTSCENE');
      expect(menu.menuOptions).toEqual([
        'Cutscene Master Volume',
        'Cutscene Music',
        'Cutscene Dialogue SFX',
        'Cutscene Action SFX',
        'Go Back',
      ]);
      expect(menu.volumeLevels).toEqual([50, 50, 50, 50, null]);
      expect(menu.muted).toEqual([false, false, false, false, null]);

      menu.setTab('INGAME');
      expect(menu.activeTab).toBe('INGAME');
      expect(menu.menuOptions).toEqual([
        'In-Game Master Volume',
        'Map Music',
        'Firedog SFX',
        'Enemy SFX',
        'Collision SFX',
        'Power Up/Down SFX',
        'Go Back',
      ]);
      expect(menu.volumeLevels).toEqual([50, 50, 50, 50, 50, 50, null]);
      expect(menu.muted).toEqual([false, false, false, false, false, false, null]);
    });

    test('clampSelection clamps selectedOption into [headerSelectionIndex, lastIndex]', () => {
      menu.setTab('MENU');
      menu.selectedOption = 999;
      menu.clampSelection();
      expect(menu.selectedOption).toBe(menu.menuOptions.length - 1);

      menu.selectedOption = -999;
      menu.clampSelection();
      expect(menu.selectedOption).toBe(menu.headerSelectionIndex);
    });

    test('navigateVertical moves between header and items with wrap rules', () => {
      menu.setTab('MENU');

      menu.selectedOption = -1;
      menu.navigateVertical(1);
      expect(menu.selectedOption).toBe(0);

      menu.navigateVertical(-1);
      expect(menu.selectedOption).toBe(-1);

      menu.navigateVertical(-1);
      expect(menu.selectedOption).toBe(menu.menuOptions.length - 1);

      menu.navigateVertical(1);
      expect(menu.selectedOption).toBe(-1);
    });
  });

  describe('audio map building and volume updates', () => {
    test('_buildAudioMaps creates expected MENU mappings', () => {
      const map = menu.tabData.MENU.audioMap;

      expect(map['Menu Master Volume']).toEqual({ ...game.audioHandler.menu.getSoundsMapping() });
      expect(map['Menu Music']).toBe(game.audioHandler.menu.soundsMapping.soundtrack);

      expect(map['Map SFX']).toEqual([
        game.audioHandler.menu.soundsMapping.mapOpening,
        game.audioHandler.menu.soundsMapping.enemyLoreOpenBookSound,
        game.audioHandler.menu.soundsMapping.enemyLoreCloseBookSound,
        game.audioHandler.menu.soundsMapping.bookFlipBackwardSound,
        game.audioHandler.menu.soundsMapping.bookFlipForwardSound,
        game.audioHandler.menu.soundsMapping.enemyLoreSwitchTabSound,
      ]);

      expect(map['Menu Navigation SFX']).toEqual([
        game.audioHandler.menu.soundsMapping.optionSelectedSound,
        game.audioHandler.menu.soundsMapping.optionHoveredSound,
      ]);
    });

    test('updateAudioVolume supports string id, array of ids, and object-map ids', () => {
      menu.setTab('MENU');

      menu.volumeLevels[0] = 50;
      menu.volumeLevels[1] = 50;

      menu.updateAudioVolume(menu.audioMap['Menu Music'], 1);
      expect(document.getElementById('menu_track').volume).toBeCloseTo(0.25, 5);

      menu.volumeLevels[2] = 80;
      menu.updateAudioVolume(menu.audioMap['Map SFX'], 2);
      expect(document.getElementById('map_open').volume).toBeCloseTo(0.4, 5);
      expect(document.getElementById('lore_open').volume).toBeCloseTo(0.4, 5);

      menu.volumeLevels[0] = 30;
      menu.updateAudioVolume(menu.audioMap['Menu Master Volume'], 0);

      expect(document.getElementById('menu_track').volume).toBeCloseTo(0.15, 5);
    });

    test('muted index forces volume to 0 (per-channel mute)', () => {
      menu.setTab('MENU');

      menu.volumeLevels[0] = 100;
      menu.volumeLevels[1] = 100;

      menu.updateAudioVolume(menu.audioMap['Menu Music'], 1);
      expect(document.getElementById('menu_track').volume).toBeCloseTo(1, 5);

      menu.muted[1] = true;
      menu.updateAudioVolume(menu.audioMap['Menu Music'], 1);
      expect(document.getElementById('menu_track').volume).toBeCloseTo(0, 5);
    });

    test('master muted forces all mapped audio volumes to 0, regardless of channel volumes', () => {
      menu.setTab('MENU');

      menu.volumeLevels[0] = 60;
      menu.volumeLevels[1] = 80;
      menu.volumeLevels[2] = 80;

      menu.updateAudioVolume(menu.audioMap['Menu Music'], 1);
      expect(document.getElementById('menu_track').volume).toBeGreaterThan(0);

      menu.muted[0] = true;
      menu.updateAudioVolume(menu.audioMap['Menu Master Volume'], 0);

      expect(document.getElementById('menu_track').volume).toBe(0);
      expect(document.getElementById('map_open').volume).toBe(0);
      expect(document.getElementById('lore_open').volume).toBe(0);
    });

    test('updateSingleAudioVolume logs an error if element is missing (no throw)', () => {
      menu.setTab('MENU');
      const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
      expect(() => menu.updateSingleAudioVolume('missing_audio_id', 1)).not.toThrow();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('geometry and hit-testing', () => {
    test('getSliderRect nudges Go Back row down (because volumeLevels[i] is null)', () => {
      menu.setTab('MENU');
      const goBackIdx = menu.menuOptions.indexOf('Go Back');

      const prevIdx = goBackIdx - 1;

      const a = menu.getSliderRect(prevIdx);
      const b = menu.getSliderRect(goBackIdx);

      expect(b.y).toBeGreaterThan(a.y);
    });

    test('hitTestOptionIndex returns the correct row index or null', () => {
      menu.setTab('MENU');
      setInteractable(true);

      const r1 = menu.getOptionRowRect(1);
      const hit = menu.hitTestOptionIndex(r1.x + r1.w / 2, r1.y + r1.h / 2);
      expect(hit).toBe(1);

      expect(menu.hitTestOptionIndex(-999, -999)).toBeNull();
    });

    test('getMuteIconRect and getLabelRect return rectangles (sanity)', () => {
      menu.setTab('MENU');
      const rMute = menu.getMuteIconRect(1);
      const rLbl = menu.getLabelRect(1);

      expect(rMute.w).toBeGreaterThan(0);
      expect(rMute.h).toBeGreaterThan(0);
      expect(rLbl.w).toBeGreaterThan(0);
      expect(rLbl.h).toBeGreaterThan(0);
    });
  });

  describe('input gating via _canInteract()', () => {
    test.each([
      ['menu inactive', () => { menu.menuActive = false; }],
      ['canSelect false', () => { game.canSelect = false; }],
      ['canSelectForestMap false', () => { game.canSelectForestMap = false; }],
    ])('ignores key/mouse actions when %s', (_label, tweak) => {
      tweak();

      const prevTab = menu.activeTab;
      const prevSel = menu.selectedOption;

      menu.handleKeyDown({ key: 'ArrowDown' });
      menu.handleMouseMove({ clientX: 10, clientY: 10 });
      menu.handleMouseClick({ clientX: 10, clientY: 10 });

      expect(menu.activeTab).toBe(prevTab);
      expect(menu.selectedOption).toBe(prevSel);
      expect(game.audioHandler.menu.playSound).not.toHaveBeenCalled();
    });
  });

  describe('keyboard input (handleKeyDown)', () => {
    test('keys 1/2/3 switch tabs', () => {
      menu.handleKeyDown({ key: '2' });
      expect(menu.activeTab).toBe('CUTSCENE');

      menu.handleKeyDown({ key: '3' });
      expect(menu.activeTab).toBe('INGAME');

      menu.handleKeyDown({ key: '1' });
      expect(menu.activeTab).toBe('MENU');
    });

    test('ArrowLeft/ArrowRight on header cycles tabs and plays hover sound', () => {
      expect(menu.isHeaderSelected()).toBe(true);

      menu.handleKeyDown({ key: 'ArrowRight' });
      expect(menu.activeTab).toBe('CUTSCENE');

      menu.handleKeyDown({ key: 'ArrowRight' });
      expect(menu.activeTab).toBe('INGAME');

      menu.handleKeyDown({ key: 'ArrowLeft' });
      expect(menu.activeTab).toBe('CUTSCENE');

      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    test('ArrowDown/ArrowUp moves selection using navigateVertical and plays hover sound', () => {
      menu.setTab('MENU');

      menu.selectedOption = -1;
      menu.handleKeyDown({ key: 'ArrowDown' });
      expect(menu.selectedOption).toBe(0);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);

      game.audioHandler.menu.playSound.mockClear();

      menu.handleKeyDown({ key: 'ArrowUp' });
      expect(menu.selectedOption).toBe(-1);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    test('ArrowLeft/ArrowRight on a slider adjusts volume, updates audio, and saves (does NOT unmute)', () => {
      menu.setTab('MENU');
      menu.selectedOption = 1;
      menu.volumeLevels[0] = 50;
      menu.volumeLevels[1] = 50;

      menu.muted[1] = true;

      game.saveGameState.mockClear();

      menu.handleKeyDown({ key: 'ArrowRight', repeat: false });
      expect(menu.volumeLevels[1]).toBe(51);
      expect(menu.muted[1]).toBe(true);
      expect(document.getElementById('menu_track').volume).toBe(0);
      expect(game.saveGameState).toHaveBeenCalled();

      menu.handleKeyDown({ key: 'ArrowRight', repeat: true });
      expect(menu.volumeLevels[1]).toBe(53);
      expect(menu.muted[1]).toBe(true);
      expect(document.getElementById('menu_track').volume).toBe(0);
    });

    test('Enter on header plays select sound but does not toggle mute', () => {
      menu.selectedOption = menu.headerSelectionIndex;
      game.audioHandler.menu.playSound.mockClear();

      menu.setTab('MENU');
      menu.muted[1] = false;

      menu.handleKeyDown({ key: 'Enter' });

      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
      expect(menu.muted[1]).toBe(false);
    });

    test('Enter on a slider row toggles mute/unmute and saves', () => {
      menu.setTab('MENU');
      menu.selectedOption = 1;

      menu.volumeLevels[0] = 100;
      menu.volumeLevels[1] = 100;

      menu.muted[1] = false;
      menu.updateAudioVolume(menu.audioMap['Menu Music'], 1);
      expect(document.getElementById('menu_track').volume).toBeCloseTo(1, 5);

      game.saveGameState.mockClear();
      game.audioHandler.menu.playSound.mockClear();

      menu.handleKeyDown({ key: 'Enter' });

      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
      expect(menu.muted[1]).toBe(true);
      expect(document.getElementById('menu_track').volume).toBe(0);
      expect(game.saveGameState).toHaveBeenCalled();

      game.saveGameState.mockClear();
      menu.handleKeyDown({ key: 'Enter' });

      expect(menu.muted[1]).toBe(false);
      expect(document.getElementById('menu_track').volume).toBeCloseTo(1, 5);
      expect(game.saveGameState).toHaveBeenCalled();
    });
  });

  describe('mouse input', () => {
    test('mousemove selects hovered option row and plays hover sound (ignores tabs)', () => {
      menu.setTab('MENU');
      setInteractable(true);

      const r = menu.getOptionRowRect(2);
      const evt = clientFromCanvas(r.x + r.w / 2, r.y + r.h / 2);

      menu.selectedOption = 0;
      game.audioHandler.menu.playSound.mockClear();

      menu.handleMouseMove(evt);

      expect(menu.selectedOption).toBe(2);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    test('mousemove over a tab does not change selectedOption', () => {
      setInteractable(true);
      menu.selectedOption = 2;

      const centerY = game.height / 2;
      const titleY = centerY - menu.positionOffset;
      const tabY = titleY + menu.tabOffsetY;
      const tabSpacing = 260;
      const startX = game.width / 2 - tabSpacing;
      const cutsceneX = startX + tabSpacing;

      const evt = clientFromCanvas(cutsceneX, tabY - 10);
      menu.handleMouseMove(evt);

      expect(menu.selectedOption).toBe(2);
    });

    test('mouse click on a tab switches tab, selects header, and plays select sound', () => {
      setInteractable(true);

      const centerY = game.height / 2;
      const titleY = centerY - menu.positionOffset;
      const tabY = titleY + menu.tabOffsetY;
      const tabSpacing = 260;
      const startX = game.width / 2 - tabSpacing;
      const cutsceneX = startX + tabSpacing;

      const evt = clientFromCanvas(cutsceneX, tabY - 10);

      menu.handleMouseClick(evt);

      expect(menu.activeTab).toBe('CUTSCENE');
      expect(menu.selectedOption).toBe(menu.headerSelectionIndex);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
    });

    test('mouse click on a slider track sets volume based on mouseX, updates audio, and saves (does NOT unmute)', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.selectedOption = 1;
      menu.volumeLevels[0] = 100;
      menu.volumeLevels[1] = 0;

      menu.muted[1] = true;

      const { x, y, w, h } = menu.getSliderRect(1);

      const clickX = x + w * 0.75;
      const clickY = y + h / 2;

      const evt = clientFromCanvas(clickX, clickY);

      game.saveGameState.mockClear();

      menu.handleMouseClick(evt);

      expect(menu.volumeLevels[1]).toBe(75);
      expect(menu.muted[1]).toBe(true);
      expect(document.getElementById('menu_track').volume).toBe(0);
      expect(game.saveGameState).toHaveBeenCalled();
    });

    test('clicking a mute icon toggles mute even if row is not selected', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.selectedOption = 0;
      menu.muted[2] = false;

      const r = menu.getMuteIconRect(2);
      const evt = clientFromCanvas(r.x + r.w / 2, r.y + r.h / 2);

      game.saveGameState.mockClear();

      menu.handleMouseClick(evt);

      expect(menu.selectedOption).toBe(2);
      expect(menu.muted[2]).toBe(true);
      expect(game.saveGameState).toHaveBeenCalled();
    });

    test('clicking the label text toggles mute', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.muted[1] = false;
      menu.volumeLevels[0] = 100;
      menu.volumeLevels[1] = 100;

      menu.updateAudioVolume(menu.audioMap['Menu Music'], 1);
      expect(document.getElementById('menu_track').volume).toBeCloseTo(1, 5);

      const r = menu.getLabelRect(1);
      const evt = clientFromCanvas(r.x + r.w * 0.75, r.y + r.h / 2);

      game.saveGameState.mockClear();
      menu.handleMouseClick(evt);

      expect(menu.selectedOption).toBe(1);
      expect(menu.muted[1]).toBe(true);
      expect(document.getElementById('menu_track').volume).toBe(0);
      expect(game.saveGameState).toHaveBeenCalled();
    });

    test('mouse click is ignored while draggingSliderActive is true', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.draggingSliderActive = true;

      const spy = jest.spyOn(menu, 'handleMenuSelection');
      menu.handleMouseClick({ clientX: 10, clientY: 10 });

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    test('mouse wheel on header cycles tabs; mouse wheel on slider adjusts volume and saves (does NOT unmute)', () => {
      setInteractable(true);

      menu.selectedOption = menu.headerSelectionIndex;
      menu.handleMouseWheel({ deltaY: 100 });
      expect(menu.activeTab).toBe('CUTSCENE');

      menu.setTab('MENU');
      menu.selectedOption = 1;
      menu.volumeLevels[1] = 50;

      menu.muted[1] = true;

      game.saveGameState.mockClear();
      menu.handleMouseWheel({ deltaY: 100, repeat: false });

      expect(menu.volumeLevels[1]).toBe(49);
      expect(menu.muted[1]).toBe(true);
      expect(game.saveGameState).toHaveBeenCalled();

      menu.selectedOption = menu.menuOptions.length - 1;
      const prev = [...menu.volumeLevels];
      menu.handleMouseWheel({ deltaY: 100 });
      expect(menu.volumeLevels).toEqual(prev);
    });
  });

  describe('slider drag flow', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('mousedown on slider handle begins dragging; mousemove updates value; mouseup ends drag', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.selectedOption = 1;
      menu.volumeLevels[0] = 100;
      menu.volumeLevels[1] = 50;

      const { x: sx, y: sy, w: sw, h: sh } = menu.getSliderRect(1);
      const handleR = sh / 2;
      const handleX = sx + (sw - 2 * handleR) * (menu.volumeLevels[1] / 100);

      const downEvt = clientFromCanvas(handleX + handleR, sy + sh / 2);
      menu.handleMouseDown(downEvt);

      expect(menu.draggingSlider).toBe(true);
      expect(menu.draggingSliderIndex).toBe(1);

      const dragX = sx + sw * 0.9;
      const dragEvt = clientFromCanvas(dragX, sy + sh / 2);

      game.saveGameState.mockClear();
      menu.handleMouseDrag(dragEvt);

      expect(menu.draggingSliderActive).toBe(true);
      expect(menu.volumeLevels[1]).toBeGreaterThanOrEqual(85);
      expect(game.saveGameState).toHaveBeenCalled();

      menu.handleMouseUp();
      expect(menu.draggingSlider).toBe(false);
      expect(menu.draggingSliderIndex).toBe(-1);

      expect(menu.draggingSliderActive).toBe(true);
      jest.advanceTimersByTime(11);
      expect(menu.draggingSliderActive).toBe(false);
    });

    test('mousedown does nothing when header is selected', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.selectedOption = menu.headerSelectionIndex;

      const spy = jest.spyOn(menu, 'getSliderRect');
      menu.handleMouseDown({ clientX: 10, clientY: 10 });

      expect(menu.draggingSlider).toBe(false);
      expect(spy).not.toHaveBeenCalled();

      spy.mockRestore();
    });

    test('mousedown on mute icon does not begin dragging', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.volumeLevels[1] = 50;

      const r = menu.getMuteIconRect(1);
      const evt = clientFromCanvas(r.x + r.w / 2, r.y + r.h / 2);

      menu.handleMouseDown(evt);

      expect(menu.draggingSlider).toBe(false);
      expect(menu.draggingSliderIndex).toBe(-1);
    });

    test('mousedown on label does not begin dragging', () => {
      menu.setTab('MENU');
      setInteractable(true);

      const r = menu.getLabelRect(1);
      const evt = clientFromCanvas(r.x + r.w / 2, r.y + r.h / 2);

      menu.handleMouseDown(evt);

      expect(menu.draggingSlider).toBe(false);
      expect(menu.draggingSliderIndex).toBe(-1);
    });

    test('dragging a muted slider updates percentage but stays muted and volume remains 0', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.selectedOption = 1;
      menu.volumeLevels[0] = 100;
      menu.volumeLevels[1] = 50;
      menu.muted[1] = true;

      const { x: sx, y: sy, w: sw, h: sh } = menu.getSliderRect(1);
      const handleR = sh / 2;
      const handleX = sx + (sw - 2 * handleR) * (menu.volumeLevels[1] / 100);
      menu.handleMouseDown(clientFromCanvas(handleX + handleR, sy + sh / 2));

      const dragX = sx + sw * 0.95;
      menu.handleMouseDrag(clientFromCanvas(dragX, sy + sh / 2));

      expect(menu.volumeLevels[1]).toBeGreaterThanOrEqual(90);
      expect(menu.muted[1]).toBe(true);
      expect(document.getElementById('menu_track').volume).toBe(0);
    });
  });

  describe('handleMenuSelection: Go Back routing', () => {
    test('out-of-game Go Back: activates settings(0)', () => {
      menu.menuInGame = false;
      menu.setTab('MENU');

      const idx = menu.menuOptions.indexOf('Go Back');
      menu.selectedOption = idx;

      menu.handleMenuSelection();

      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
      expect(game.menu.settings.activateMenu).toHaveBeenCalledWith(0);
      expect(game.menu.pause.activateMenu).not.toHaveBeenCalled();
    });

    test('in-game Go Back: activates settings({inGame:true, selectedOption:0})', () => {
      menu.menuInGame = true;
      menu.setTab('INGAME');

      const idx = menu.menuOptions.indexOf('Go Back');
      menu.selectedOption = idx;

      menu.handleMenuSelection();

      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
      expect(game.menu.settings.activateMenu).toHaveBeenCalledWith({ inGame: true, selectedOption: 0 });
      expect(game.menu.pause.activateMenu).not.toHaveBeenCalled();
    });

    test('non-Go Back selection still calls super.handleMenuSelection (plays select sound) and does not navigate', () => {
      menu.setTab('MENU');
      menu.selectedOption = 1;

      game.menu.settings.activateMenu.mockClear();
      game.menu.pause.activateMenu.mockClear();

      menu.handleMenuSelection();

      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
      expect(game.menu.settings.activateMenu).not.toHaveBeenCalled();
      expect(game.menu.pause.activateMenu).not.toHaveBeenCalled();
    });
  });

  describe('persistence (getState/setState)', () => {
    test('getState returns per-tab volume + muted arrays; setState applies them and reapplies audio volumes', () => {
      menu.setTab('MENU');
      menu.volumeLevels[0] = 20;
      menu.volumeLevels[1] = 80;
      menu.muted[0] = false;
      menu.muted[1] = true;

      menu.setTab('CUTSCENE');
      menu.volumeLevels[0] = 40;
      menu.volumeLevels[1] = 10;
      menu.muted[1] = true;

      menu.setTab('INGAME');
      menu.volumeLevels[0] = 60;
      menu.volumeLevels[1] = 50;
      menu.muted[0] = true;

      const state = menu.getState();

      const menu2 = new AudioSettingsMenu(game);
      menu2.activateMenu();
      menu2.setState(state);

      expect(menu2.tabData.MENU.volumeLevels[0]).toBe(20);
      expect(menu2.tabData.MENU.volumeLevels[1]).toBe(80);
      expect(menu2.tabData.MENU.muted[1]).toBe(true);

      expect(menu2.tabData.CUTSCENE.volumeLevels[0]).toBe(40);
      expect(menu2.tabData.CUTSCENE.volumeLevels[1]).toBe(10);
      expect(menu2.tabData.CUTSCENE.muted[1]).toBe(true);

      expect(menu2.tabData.INGAME.volumeLevels[0]).toBe(60);
      expect(menu2.tabData.INGAME.volumeLevels[1]).toBe(50);
      expect(menu2.tabData.INGAME.muted[0]).toBe(true);

      expect(menu2.activeTab).toBe('MENU');

      expect(document.getElementById('menu_track').volume).toBe(0);
    });
  });

  describe('master mute behavior across tab (logic)', () => {
    test('toggling master mute forces channel audio to 0; changing channel volume while master muted keeps audio 0', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.volumeLevels[0] = 100;
      menu.volumeLevels[1] = 100;
      menu.muted[0] = false;
      menu.muted[1] = false;

      menu.updateAudioVolume(menu.audioMap['Menu Music'], 1);
      expect(document.getElementById('menu_track').volume).toBeCloseTo(1, 5);

      menu.selectedOption = 0;
      menu.handleKeyDown({ key: 'Enter' });

      expect(menu.muted[0]).toBe(true);
      expect(document.getElementById('menu_track').volume).toBe(0);

      menu.selectedOption = 1;
      menu.handleKeyDown({ key: 'ArrowLeft', repeat: false });

      expect(menu.muted[0]).toBe(true);
      expect(document.getElementById('menu_track').volume).toBe(0);
    });
  });

  describe('master mute blocks per-channel mute toggles (new behavior)', () => {
    test('when master muted: Enter on non-master row does not toggle, does not save, and does not play select sound', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.volumeLevels[0] = 100;
      menu.volumeLevels[1] = 100;
      menu.muted[0] = true;
      menu.muted[1] = false;

      menu.updateAudioVolume(menu.audioMap['Menu Music'], 1);
      expect(document.getElementById('menu_track').volume).toBe(0);

      menu.selectedOption = 1;

      game.saveGameState.mockClear();
      game.audioHandler.menu.playSound.mockClear();

      menu.handleKeyDown({ key: 'Enter' });

      expect(menu.muted[1]).toBe(false);
      expect(game.saveGameState).not.toHaveBeenCalled();
      expect(game.audioHandler.menu.playSound).not.toHaveBeenCalled();
    });

    test('when master muted: clicking mute icon on non-master row does not toggle, does not save, and does not play select sound', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.muted[0] = true;
      menu.muted[2] = false;

      const r = menu.getMuteIconRect(2);
      const evt = clientFromCanvas(r.x + r.w / 2, r.y + r.h / 2);

      game.saveGameState.mockClear();
      game.audioHandler.menu.playSound.mockClear();

      menu.handleMouseClick(evt);

      expect(menu.selectedOption).toBe(2);
      expect(menu.muted[2]).toBe(false);
      expect(game.saveGameState).not.toHaveBeenCalled();
      expect(game.audioHandler.menu.playSound).not.toHaveBeenCalled();
    });

    test('when master muted: clicking label on non-master row does not toggle, does not save, and does not play select sound', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.muted[0] = true;
      menu.muted[1] = false;

      const r = menu.getLabelRect(1);
      const evt = clientFromCanvas(r.x + r.w * 0.75, r.y + r.h / 2);

      game.saveGameState.mockClear();
      game.audioHandler.menu.playSound.mockClear();

      menu.handleMouseClick(evt);

      expect(menu.selectedOption).toBe(1);
      expect(menu.muted[1]).toBe(false);
      expect(game.saveGameState).not.toHaveBeenCalled();
      expect(game.audioHandler.menu.playSound).not.toHaveBeenCalled();
    });

    test('master row is still toggleable while muted/unmuted (Enter toggles and plays select sound)', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.muted[0] = false;

      menu.selectedOption = 0;
      game.saveGameState.mockClear();
      game.audioHandler.menu.playSound.mockClear();

      menu.handleKeyDown({ key: 'Enter' });

      expect(menu.muted[0]).toBe(true);
      expect(game.saveGameState).toHaveBeenCalled();
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
    });
  });
});
