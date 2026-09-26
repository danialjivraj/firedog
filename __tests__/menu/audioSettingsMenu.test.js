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

    playHover() {
      this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
    }

    playSelect() {
      this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
    }

    handleMenuSelection() {
      this.playSelect();
    }

    _canInteract() {
      return this.menuActive && this.game.canSelect && this.game.canSelectForestMap;
    }

    handleMouseMove() { }
    draw() { }
    drawStars() { }
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

      criminalitySoundtrack: 'criminalitySoundtrack',

      mapOpening: 'map_open',
      enemyLoreOpenBookSound: 'lore_open',
      enemyLoreCloseBookSound: 'lore_close',
      bookFlipBackwardSound: 'flip_back',
      bookFlipForwardSound: 'flip_fwd',
      enemyLoreSwitchTabSound: 'lore_tab',
      optionSelectedSound: 'opt_sel',
      optionHoveredSound: 'opt_hov',

      purchaseCompletedSound: 'purchase_done',
      shinySkinRizzSound: 'shiny_rizz',
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

      goBackMenu: jest.fn(),

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
      'criminalitySoundtrack',
      'map_open',
      'lore_open',
      'lore_close',
      'flip_back',
      'flip_fwd',
      'lore_tab',
      'opt_sel',
      'opt_hov',
      'purchase_done',
      'shiny_rizz',

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

  const setInteractable = (enabled) => {
    menu.menuActive = enabled;
    game.canSelect = enabled;
    game.canSelectForestMap = enabled;
  };

  const TRACK_LEFT = 100;
  const TRACK_WIDTH = 300;

  const rowAt = (i) => {
    menu.ensurePanel();
    menu.syncContent();
    return menu.dom.rows[i];
  };

  const tabAt = (i) => {
    menu.ensurePanel();
    return menu.dom.tabs[i];
  };

  const stubTrack = (i) => {
    const { track } = rowAt(i);
    track.getBoundingClientRect = () => ({ left: TRACK_LEFT, width: TRACK_WIDTH, top: 0, height: 25 });
    return track;
  };

  const handleCentre = (i) => TRACK_LEFT + TRACK_WIDTH * (menu.volumeLevels[i] / 100);

  const clickOn = (element, clientX = 0) =>
    menu.handleMouseClick({ target: element, clientX, clientY: 0 });

  const hover = (element) => element.dispatchEvent(new Event('pointerenter'));

  const pointerDown = (element, clientX = 0) =>
    element.dispatchEvent(Object.assign(new Event('pointerdown'), { clientX, clientY: 0 }));

  const grabHandle = (i) => {
    stubTrack(i);
    const { handle } = rowAt(i);
    const centre = handleCentre(i);
    handle.getBoundingClientRect = () => ({ left: centre - 9.5, width: 19, top: 0, height: 19 });
    pointerDown(handle, centre);
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
    test('defaults to MENU tab with header not selected', () => {
      expect(menu.activeTab).toBe('MENU');
      expect(menu.isHeaderSelected()).toBe(false);
      expect(menu.selectedOption).toBe(0);
    });

    test('setTab falls back to MENU for unknown tab keys', () => {
      menu.setTab('NOT_A_REAL_TAB');
      expect(menu.activeTab).toBe('MENU');
    });

    test('_displayTabLabel formats INGAME as IN-GAME and leaves others unchanged', () => {
      expect(menu._displayTabLabel('INGAME')).toBe('IN-GAME');
      expect(menu._displayTabLabel('MENU')).toBe('MENU');
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
      expect(menu.activeTab).toBe('INGAME');

      expect(menu.selectedOption).toBe(0);
      expect(menu.isHeaderSelected()).toBe(false);
    });

    test('when paused + cutsceneActive + currentCutscene, activateMenu() chooses CUTSCENE tab and hides stars sticker', () => {
      game.menu.pause.isPaused = true;
      game.isPlayerInGame = false;
      game.cutsceneActive = true;
      game.currentCutscene = {};

      menu.activateMenu();

      expect(menu.menuInGame).toBe(true);
      expect(menu.activeTab).toBe('CUTSCENE');

      expect(menu.selectedOption).toBe(0);
      expect(menu.isHeaderSelected()).toBe(false);
    });

    test('paused cutsceneActive but missing currentCutscene does NOT infer cutscene overlay', () => {
      game.menu.pause.isPaused = true;
      game.isPlayerInGame = false;
      game.cutsceneActive = true;
      game.currentCutscene = null;

      menu.activateMenu();

      expect(menu.menuInGame).toBe(false);
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
    });

    test('opts.selectedOption is accepted and then clamped only if out of range', () => {
      menu.activateMenu({ selectedOption: 2 });
      expect(menu.selectedOption).toBe(2);
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

      expect(map['Menu Music']).toBe(game.audioHandler.menu.soundsMapping.criminalitySoundtrack);

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
      expect(document.getElementById('criminalitySoundtrack').volume).toBeCloseTo(0.25, 5);

      menu.volumeLevels[2] = 80;
      menu.updateAudioVolume(menu.audioMap['Map SFX'], 2);
      expect(document.getElementById('map_open').volume).toBeCloseTo(0.4, 5);
      expect(document.getElementById('lore_open').volume).toBeCloseTo(0.4, 5);

      menu.volumeLevels[0] = 30;
      menu.updateAudioVolume(menu.audioMap['Menu Master Volume'], 0);

      expect(document.getElementById('criminalitySoundtrack').volume).toBeCloseTo(0.15, 5);
    });

    test('muted index forces volume to 0 (per-channel mute)', () => {
      menu.setTab('MENU');

      menu.volumeLevels[0] = 100;
      menu.volumeLevels[1] = 100;

      menu.updateAudioVolume(menu.audioMap['Menu Music'], 1);
      expect(document.getElementById('criminalitySoundtrack').volume).toBeCloseTo(1, 5);

      menu.muted[1] = true;
      menu.updateAudioVolume(menu.audioMap['Menu Music'], 1);
      expect(document.getElementById('criminalitySoundtrack').volume).toBeCloseTo(0, 5);
    });

    test('master muted forces all mapped audio volumes to 0, regardless of channel volumes', () => {
      menu.setTab('MENU');

      menu.volumeLevels[0] = 60;
      menu.volumeLevels[1] = 80;
      menu.volumeLevels[2] = 80;

      menu.updateAudioVolume(menu.audioMap['Menu Music'], 1);
      expect(document.getElementById('criminalitySoundtrack').volume).toBeGreaterThan(0);

      menu.muted[0] = true;
      menu.updateAudioVolume(menu.audioMap['Menu Master Volume'], 0);

      expect(document.getElementById('criminalitySoundtrack').volume).toBe(0);
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

  describe('row rendering', () => {
    test('slider rows render a track, mute button and percentage', () => {
      menu.setTab('MENU');
      const row = rowAt(1);

      expect(row.track).toBeTruthy();
      expect(row.mute).toBeTruthy();
      expect(row.percent.textContent).toBe(`${menu.volumeLevels[1]}%`);
    });

    test('the Go Back row is a plain action row with no slider controls', () => {
      menu.setTab('MENU');
      const goBackIdx = menu.menuOptions.indexOf('Go Back');

      expect(rowAt(goBackIdx).track).toBeUndefined();
      expect(rowAt(goBackIdx).label.classList.contains('audio-label--action')).toBe(true);
      expect(rowAt(goBackIdx - 1).track).toBeTruthy();
    });

    test('rows are rebuilt when the tab changes', () => {
      menu.setTab('MENU');
      const menuRowCount = menu.menuOptions.length;
      expect(rowAt(0)).toBeTruthy();
      expect(menu.dom.rows).toHaveLength(menuRowCount);

      menu.setTab('CUTSCENE');
      rowAt(0);
      expect(menu.dom.rows).toHaveLength(menu.menuOptions.length);
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
      menu.selectedOption = menu.headerSelectionIndex;
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
      expect(document.getElementById('criminalitySoundtrack').volume).toBe(0);
      expect(game.saveGameState).toHaveBeenCalled();

      menu.handleKeyDown({ key: 'ArrowRight', repeat: true });
      expect(menu.volumeLevels[1]).toBe(53);
      expect(menu.muted[1]).toBe(true);
      expect(document.getElementById('criminalitySoundtrack').volume).toBe(0);
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
      expect(document.getElementById('criminalitySoundtrack').volume).toBeCloseTo(1, 5);

      game.saveGameState.mockClear();
      game.audioHandler.menu.playSound.mockClear();

      menu.handleKeyDown({ key: 'Enter' });

      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
      expect(menu.muted[1]).toBe(true);
      expect(document.getElementById('criminalitySoundtrack').volume).toBe(0);
      expect(game.saveGameState).toHaveBeenCalled();

      game.saveGameState.mockClear();
      menu.handleKeyDown({ key: 'Enter' });

      expect(menu.muted[1]).toBe(false);
      expect(document.getElementById('criminalitySoundtrack').volume).toBeCloseTo(1, 5);
      expect(game.saveGameState).toHaveBeenCalled();
    });
  });

  describe('mouse input', () => {
    test('hovering an option row selects it and plays the hover sound', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.selectedOption = 0;
      game.audioHandler.menu.playSound.mockClear();

      hover(rowAt(2).row);

      expect(menu.selectedOption).toBe(2);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    test('hovering a tab does not change selectedOption', () => {
      setInteractable(true);
      menu.selectedOption = 2;

      hover(tabAt(1));

      expect(menu.selectedOption).toBe(2);
    });

    test('mouse click on a tab switches tab, selects header, and plays select sound', () => {
      setInteractable(true);

      clickOn(tabAt(1));

      expect(menu.activeTab).toBe('CUTSCENE');
      expect(menu.selectedOption).toBe(menu.headerSelectionIndex);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
    });

    test('mouse click on the reset button restores the tab to its defaults', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.volumeLevels[1] = 12;
      menu.muted[1] = true;
      menu.ensurePanel();

      clickOn(menu.dom.reset);

      expect(menu.volumeLevels[1]).toBe(50);
      expect(menu.muted[1]).toBe(false);
      expect(game.saveGameState).toHaveBeenCalled();
    });

    test('mouse click on a slider track sets volume from the click position, updates audio, and saves (does NOT unmute)', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.selectedOption = 1;
      menu.volumeLevels[0] = 100;
      menu.volumeLevels[1] = 0;
      menu.muted[1] = true;

      const track = stubTrack(1);
      game.saveGameState.mockClear();

      clickOn(track, TRACK_LEFT + TRACK_WIDTH * 0.75);

      expect(menu.volumeLevels[1]).toBe(75);
      expect(menu.muted[1]).toBe(true);
      expect(document.getElementById('criminalitySoundtrack').volume).toBe(0);
      expect(game.saveGameState).toHaveBeenCalled();
    });

    test('clicking a mute icon toggles mute even if row is not selected', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.selectedOption = 0;
      menu.muted[2] = false;
      game.saveGameState.mockClear();

      clickOn(rowAt(2).mute);

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
      expect(document.getElementById('criminalitySoundtrack').volume).toBeCloseTo(1, 5);

      game.saveGameState.mockClear();
      clickOn(rowAt(1).label);

      expect(menu.selectedOption).toBe(1);
      expect(menu.muted[1]).toBe(true);
      expect(document.getElementById('criminalitySoundtrack').volume).toBe(0);
      expect(game.saveGameState).toHaveBeenCalled();
    });

    test('clicking the Go Back row runs the selection instead of muting', () => {
      menu.setTab('MENU');
      setInteractable(true);

      const goBackIdx = menu.menuOptions.indexOf('Go Back');
      menu.selectedOption = goBackIdx;

      clickOn(rowAt(goBackIdx).label);

      expect(game.goBackMenu).toHaveBeenCalled();
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

    test('pointerdown on the handle begins dragging; pointermove updates value; pointerup ends drag', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.volumeLevels[0] = 100;
      menu.volumeLevels[1] = 50;

      grabHandle(1);

      expect(menu.draggingSlider).toBe(true);
      expect(menu.draggingSliderIndex).toBe(1);
      expect(menu.selectedOption).toBe(1);

      game.saveGameState.mockClear();
      menu.handleMouseDrag({ clientX: TRACK_LEFT + TRACK_WIDTH * 0.9 });

      expect(menu.draggingSliderActive).toBe(true);
      expect(menu.volumeLevels[1]).toBe(90);
      expect(game.saveGameState).toHaveBeenCalled();

      menu.handleMouseUp();
      expect(menu.draggingSlider).toBe(false);
      expect(menu.draggingSliderIndex).toBe(-1);

      expect(menu.draggingSliderActive).toBe(true);
      jest.advanceTimersByTime(11);
      expect(menu.draggingSliderActive).toBe(false);
    });

    test('only the handle starts a drag', () => {
      menu.setTab('MENU');
      setInteractable(true);

      pointerDown(rowAt(1).mute);
      pointerDown(rowAt(1).label);
      pointerDown(rowAt(1).track);

      expect(menu.draggingSlider).toBe(false);
      expect(menu.draggingSliderIndex).toBe(-1);
    });

    test('pointerdown on the handle does nothing while the menu is not interactable', () => {
      menu.setTab('MENU');
      setInteractable(false);

      grabHandle(1);

      expect(menu.draggingSlider).toBe(false);
    });

    test('dragging a muted slider updates percentage but stays muted and volume remains 0', () => {
      menu.setTab('MENU');
      setInteractable(true);

      menu.volumeLevels[0] = 100;
      menu.volumeLevels[1] = 50;
      menu.muted[1] = true;

      grabHandle(1);
      menu.handleMouseDrag({ clientX: TRACK_LEFT + TRACK_WIDTH * 0.95 });

      expect(menu.volumeLevels[1]).toBe(95);
      expect(menu.muted[1]).toBe(true);
      expect(document.getElementById('criminalitySoundtrack').volume).toBe(0);
    });
  });

  describe('handleMenuSelection: Go Back routing', () => {
    test('out-of-game Go Back: delegates to game.goBackMenu()', () => {
      menu.menuInGame = false;
      menu.setTab('MENU');

      const idx = menu.menuOptions.indexOf('Go Back');
      menu.selectedOption = idx;

      menu.handleMenuSelection();

      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
      expect(game.goBackMenu).toHaveBeenCalled();
      expect(game.menu.settings.activateMenu).not.toHaveBeenCalled();
      expect(game.menu.pause.activateMenu).not.toHaveBeenCalled();
    });

    test('in-game Go Back: delegates to game.goBackMenu()', () => {
      menu.menuInGame = true;
      menu.setTab('INGAME');

      const idx = menu.menuOptions.indexOf('Go Back');
      menu.selectedOption = idx;

      menu.handleMenuSelection();

      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
      expect(game.goBackMenu).toHaveBeenCalled();
      expect(game.menu.settings.activateMenu).not.toHaveBeenCalled();
      expect(game.menu.pause.activateMenu).not.toHaveBeenCalled();
    });

    test('non-Go Back selection still calls super.handleMenuSelection (plays select sound) and does not navigate', () => {
      menu.setTab('MENU');
      menu.selectedOption = 1;

      game.goBackMenu.mockClear();

      menu.handleMenuSelection();

      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
      expect(game.goBackMenu).not.toHaveBeenCalled();
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

      expect(document.getElementById('criminalitySoundtrack').volume).toBe(0);
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
      expect(document.getElementById('criminalitySoundtrack').volume).toBeCloseTo(1, 5);

      menu.selectedOption = 0;
      menu.handleKeyDown({ key: 'Enter' });

      expect(menu.muted[0]).toBe(true);
      expect(document.getElementById('criminalitySoundtrack').volume).toBe(0);

      menu.selectedOption = 1;
      menu.handleKeyDown({ key: 'ArrowLeft', repeat: false });

      expect(menu.muted[0]).toBe(true);
      expect(document.getElementById('criminalitySoundtrack').volume).toBe(0);
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
      expect(document.getElementById('criminalitySoundtrack').volume).toBe(0);

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

      const mute = rowAt(2).mute;

      game.saveGameState.mockClear();
      game.audioHandler.menu.playSound.mockClear();

      clickOn(mute);

      expect(menu.selectedOption).toBe(2);
      expect(menu.muted[2]).toBe(false);
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