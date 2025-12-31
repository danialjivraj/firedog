import { Game } from '../game/game-main.js';
import { getDefaultKeyBindings } from '../game/config/keyBindings.js';
import { Map7, Map3, BonusMap1 } from '../game/background/background.js';
import {
  RedPotion,
  BluePotion,
  HealthLive,
  Coin,
  OxygenTank,
  IceDrink,
  IceCube,
  Cauldron,
  BlackHole,
  Confuse,
  DeadSkull,
  CarbonDioxideTank
} from '../game/entities/powerUpAndDown.js';
import { Goblin, ImmobileGroundEnemy } from '../game/entities/enemies/enemies.js';
import {
  Map1EndCutscene, Map2EndCutscene, Map3EndCutscene,
  Map4EndCutscene, Map5EndCutscene, Map6EndCutscene, Map7EndCutscene
} from '../game/cutscene/storyCutscenes.js';
import {
  Map1PenguinIngameCutscene, Map2PenguinIngameCutscene,
  Map3PenguinIngameCutscene, Map4PenguinIngameCutscene,
  Map5PenguinIngameCutscene, Map7PenguinIngameCutscene
} from '../game/cutscene/penguiniCutscenes.js';
import {
  Map7ElyvorgIngameCutsceneBeforeFight,
  Map7ElyvorgIngameCutsceneAfterFight
} from '../game/cutscene/elyvorgCutscenes.js';
import {
  BonusMap1GlacikalIngameCutsceneBeforeFight,
  BonusMap1GlacikalIngameCutsceneAfterFight
} from '../game/cutscene/glacikalCutscenes.js';
import { DistortionEffect } from '../game/animations/distortion.js';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => { });
});

describe('Game class (game-main.js)', () => {
  let canvas, ctx;

  beforeAll(() => {
    document.body.innerHTML = `
      <canvas id="canvas1"></canvas>

      <!-- skins -->
      <img id="defaultSkin"><img id="hatSkin"><img id="choloSkin">
      <img id="zabkaSkin"><img id="shinySkin">
      <img id="skinStage">

      <!-- Map1 -->
      <img id="map1Background">
      <img id="map1Trees7">
      <img id="map1Trees1">
      <img id="map1Trees2">
      <img id="map1Trees5">
      <img id="map1Trees3">
      <img id="map1Trees4">
      <img id="map1Rocks">
      <img id="map1Bush">
      <img id="map1Trees6">
      <img id="map1Ground">

      <!-- Map2 -->
      <img id="map2Background">
      <img id="map2CityLights2">
      <img id="map2CityLights1">
      <img id="map2Trees1">
      <img id="map2Ground">

      <!-- Map3 -->
      <img id="map3Background">
      <img id="map3BackgroundRocks">
      <img id="map3seaPlants3">
      <img id="map3seaPlants1">
      <img id="map3seaPlants2">
      <img id="map3seaPlants4">
      <img id="map3seaPlants6">
      <img id="map3seaPlants5">
      <img id="map3seaPlants7">
      <img id="map3Ground">

      <!-- Map4 -->
      <img id="map4Background">
      <img id="map4BottomVines">
      <img id="map4Trees3">
      <img id="map4Trees4">
      <img id="map4Trees2">
      <img id="map4Trees1">
      <img id="map4TopVines">
      <img id="map4Ground">

      <!-- Map5 -->
      <img id="map5Background">
      <img id="map5Trees5">
      <img id="map5Trees2">
      <img id="map5Trees4">
      <img id="map5Trees3">
      <img id="map5Trees1">
      <img id="map5Bush2">
      <img id="map5Bush1">
      <img id="map5Flowers2">
      <img id="map5Flowers1">
      <img id="map5Ground">

      <!-- Map6 -->
      <img id="map6Background">
      <img id="map6Trees1"><img id="map6Trees2"><img id="map6Trees3"><img id="map6Trees4">
      <img id="map6BigMushrooms">
      <img id="map6Rocks1"><img id="map6Rocks2">
      <img id="map6DeadBranches1"><img id="map6DeadBranches2">
      <img id="map6SmallMushrooms1"><img id="map6SmallMushrooms2">
      <img id="map6GreenMist">
      <img id="map6Ground">

      <!-- Map7 -->
      <img id="map7Background">
      <img id="map7rocks2">
      <img id="map7rocks1">
      <img id="map7cactus">
      <img id="map7spikeStones">
      <img id="map7Ground">

      <!-- BonusMap1 -->
      <img id="bonusMap1Background">
      <img id="bonusMap1IceRings">
      <img id="bonusMap2BigIceCrystal">
      <img id="bonusMap1IceRocks1">
      <img id="bonusMap1IceRocks2">
      <img id="bonusMap2TopIcicles">
      <img id="bonusMap2IceSpikes">
      <img id="bonusMap1Ground">

      <!-- BonusMap2 -->
      <img id="bonusMap2Background">
      <img id="bonusMap2RockLayer1">
      <img id="bonusMap2RockLayer2">
      <img id="bonusMap2RockLayer3">
      <img id="bonusMap2RockLayer4">
      <img id="bonusMap2RockLayer5">
      <img id="bonusMap2RedMist">
      <img id="bonusMap2CrypticRocks1">
      <img id="bonusMap2CrypticRocks2">
      <img id="bonusMap2DeadTrees">
      <img id="bonusMap2SpikeRocks">
      <img id="bonusMap2Ground">

      <!-- BonusMap3 -->
      <img id="bonusMap3Background">
      <img id="bonusMap3Stars">
      <img id="bonusMap3Planets">
      <img id="bonusMap3Nebula">
      <img id="bonusMap3PurpleSpiral">
      <img id="bonusMap3Ground">
    `;

    canvas = document.getElementById('canvas1');
    canvas.width = 1920;
    canvas.height = 689;

    ctx = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillStyle: '',
      getContext: () => ctx,
    };

    jest.spyOn(canvas, 'getContext').mockReturnValue(ctx);
  });

  it('constructor sets up initial state', () => {
    const game = new Game(canvas, canvas.width, canvas.height);
    expect(game.width).toBe(1920);
    expect(game.height).toBe(689);
    expect(game.coins).toBe(0);
    expect(game.lives).toBe(5);
    expect(game.maxLives).toBe(10);
    expect(game.selectedDifficulty).toBe('Normal');
    expect(game.menu.main).toBeDefined();
  });

  it('constructor initializes shake and distortion state', () => {
    const game = new Game(canvas, canvas.width, canvas.height);

    expect(game.shakeActive).toBe(false);
    expect(game.shakeTimer).toBe(0);
    expect(game.shakeDuration).toBe(0);

    expect(game.distortionActive).toBe(false);
    expect(game.distortionEffect).toBeInstanceOf(DistortionEffect);
  });

  describe('shake lifecycle', () => {
    it('startShake() enables shake and clamps negative durations to 0', () => {
      const game = new Game(canvas, canvas.width, canvas.height);

      game.startShake(-100);
      expect(game.shakeActive).toBe(true);
      expect(game.shakeTimer).toBe(0);
      expect(game.shakeDuration).toBe(0);
    });

    it('startShake() sets duration and update() stops shake after duration elapses', () => {
      const game = new Game(canvas, canvas.width, canvas.height);

      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.player = { update: jest.fn(), isUnderwater: false, x: 0, width: 0 };
      game.background = { update: jest.fn(), totalDistanceTraveled: 0 };

      game.startShake(100);
      expect(game.shakeActive).toBe(true);

      game.update(60);
      expect(game.shakeActive).toBe(true);
      expect(game.shakeTimer).toBe(60);

      game.update(50);
      expect(game.shakeActive).toBe(false);
      expect(game.shakeTimer).toBe(0);
      expect(game.shakeDuration).toBe(0);
    });

    it('stopShake() resets shake flags and timers', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.shakeActive = true;
      game.shakeTimer = 123;
      game.shakeDuration = 456;

      game.stopShake();
      expect(game.shakeActive).toBe(false);
      expect(game.shakeTimer).toBe(0);
      expect(game.shakeDuration).toBe(0);
    });

    it('startShake({ ifNotActive: true }) does not restart an active shake', () => {
      const game = new Game(canvas, canvas.width, canvas.height);

      game.startShake(500);
      game.shakeTimer = 123;

      game.startShake(1000, { ifNotActive: true });

      expect(game.shakeActive).toBe(true);
      expect(game.shakeDuration).toBe(500);
      expect(game.shakeTimer).toBe(123);
    });

    it('does not restart shake when already active with zero duration', () => {
      const game = new Game(canvas, canvas.width, canvas.height);

      game.shakeActive = true;
      game.shakeDuration = 0;
      game.shakeTimer = 999;

      game.startShake(300);

      expect(game.shakeActive).toBe(true);
      expect(game.shakeDuration).toBe(0);
      expect(game.shakeTimer).toBe(999);
    });

    it('restarts shake when already active but duration > 0', () => {
      const game = new Game(canvas, canvas.width, canvas.height);

      game.startShake(500);
      game.shakeTimer = 200;

      game.startShake(1000);

      expect(game.shakeActive).toBe(true);
      expect(game.shakeTimer).toBe(0);
      expect(game.shakeDuration).toBe(1000);
    });
  });

  // ------------------------------------------------------------
  // Save/Load State
  // ------------------------------------------------------------
  describe('saveGameState() / loadGameState()', () => {
    let game;

    beforeEach(() => {
      localStorage.clear();
      game = new Game(canvas, canvas.width, canvas.height);
      game.coins = 42;
      game.map3Unlocked = true;
      game.glacikalDefeated = true;
      game.elyvorgDefeated = true;
      game.ntharaxDefeated = false;
      game.selectedDifficulty = 'Hard';
      game.menu.skins.currentSkin = { id: 'zabka' };
      game.menu.audioSettings.getState = () => ({ foo: 'bar' });
      game.menu.ingameAudioSettings.getState = () => ({ baz: 'qux' });
    });

    it('saveGameState() writes the expected shape into localStorage', () => {
      game.saveGameState();
      const item = localStorage.getItem('gameState');
      expect(item).not.toBeNull();
      const snapshot = JSON.parse(item);
      expect(snapshot.map3Unlocked).toBe(true);
      expect(snapshot.currentSkin).toBe('zabka');
      expect(snapshot.selectedDifficulty).toBe('Hard');
      expect(snapshot.audioSettingsState).toEqual({ foo: 'bar' });
      expect(snapshot.ingameAudioSettingsState).toEqual({ baz: 'qux' });
      expect(snapshot.glacikalDefeated).toBe(true);
      expect(snapshot.elyvorgDefeated).toBe(true);
      expect(snapshot.ntharaxDefeated).toBe(false);
      expect(snapshot.keyBindings).toBeDefined();
    });

    it('loadGameState() restores persisted state from localStorage', () => {
      const seed = {
        isTutorialActive: false,
        map2Unlocked: true,
        selectedDifficulty: 'Easy',
        currentMap: 'Map2',
        glacikalDefeated: false,
        elyvorgDefeated: true,
        ntharaxDefeated: false,
      };
      localStorage.setItem('gameState', JSON.stringify(seed));

      const g2 = new Game(canvas, canvas.width, canvas.height);
      expect(g2.coins).toBe(0);
      expect(g2.isTutorialActive).toBe(false);
      expect(g2.map2Unlocked).toBe(true);
      expect(g2.selectedDifficulty).toBe('Easy');
      expect(g2.glacikalDefeated).toBe(false);
      expect(g2.elyvorgDefeated).toBe(true);
      expect(g2.ntharaxDefeated).toBe(false);
    });

    it('loadGameState() calls menu.setState / skins.setCurrentSkinById / levelDifficulty.setDifficulty', () => {
      const fake = {
        audioSettingsState: { a: 1 },
        ingameAudioSettingsState: { b: 2 },
        currentSkin: 'zabka',
        selectedDifficulty: 'Hard'
      };
      localStorage.setItem('gameState', JSON.stringify(fake));
      const g3 = new Game(canvas, canvas.width, canvas.height);
      g3.menu.audioSettings.setState = jest.fn();
      g3.menu.ingameAudioSettings.setState = jest.fn();
      g3.menu.skins.setCurrentSkinById = jest.fn();
      g3.menu.levelDifficulty.setDifficulty = jest.fn();
      g3.loadGameState();
      expect(g3.menu.audioSettings.setState).toHaveBeenCalledWith({ a: 1 });
      expect(g3.menu.ingameAudioSettings.setState).toHaveBeenCalledWith({ b: 2 });
      expect(g3.menu.skins.setCurrentSkinById).toHaveBeenCalledWith('zabka');
      expect(g3.menu.levelDifficulty.setDifficulty).toHaveBeenCalledWith('Hard');
    });

    it('constructor + loadGameState() applies partial state and keeps default flags for omitted ones', () => {
      const partial = { map5Unlocked: true };
      localStorage.setItem('gameState', JSON.stringify(partial));
      const g4 = new Game(canvas, canvas.width, canvas.height);
      expect(g4.map5Unlocked).toBe(true);
      expect(g4.map4Unlocked).toBe(false);
    });
  });

  // ------------------------------------------------------------
  // Keybindings persistence & override
  // ------------------------------------------------------------
  describe('keyBindings persistence', () => {
    beforeEach(() => localStorage.clear());

    it('saveGameState() includes keyBindings; loadGameState() merges them over defaults', () => {
      const g1 = new Game(canvas, canvas.width, canvas.height);

      g1.menu.skins.currentSkin = { id: 'defaultSkin' };
      g1.menu.audioSettings.getState = () => ({});
      g1.menu.ingameAudioSettings.getState = () => ({});

      const defaults = getDefaultKeyBindings();
      g1.keyBindings = { ...defaults, Dash: 'ShiftRight', Jump: 'KeyZ' };
      g1.saveGameState();

      const g2 = new Game(canvas, canvas.width, canvas.height);
      expect(g2.keyBindings).toMatchObject({ ...defaults, Dash: 'ShiftRight', Jump: 'KeyZ' });
    });

    it('clearSavedData() resets keyBindings back to defaults', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      const defaults = getDefaultKeyBindings();

      game.keyBindings = { ...defaults, Attack: 'KeyX' };
      game.clearSavedData();
      expect(game.keyBindings).toEqual(defaults);
    });
  });

  describe('currentMap tracking & keybinding override', () => {
    it('update() sets currentMap based on background.constructor.name', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.background = { constructor: { name: 'Map4' }, update: () => { }, totalDistanceTraveled: 0 };
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.player = { update: () => { }, isUnderwater: false, x: 0, width: 0 };
      game.cabin = { isFullyVisible: false };

      game.update(0);
      expect(game.currentMap).toBe('Map4');
    });

    it('getEffectiveKeyBindings() uses defaults on Map1 tutorial and custom otherwise', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      const defaults = getDefaultKeyBindings();

      game.keyBindings = { ...defaults, Jump: 'KeyJ' };

      game.isTutorialActive = true;
      game.currentMap = 'Map1';
      expect(game.getEffectiveKeyBindings()).toEqual(defaults);

      game.isTutorialActive = false;
      game.currentMap = 'Map1';
      expect(game.getEffectiveKeyBindings()).toEqual({ ...defaults, Jump: 'KeyJ' });

      game.isTutorialActive = true;
      game.currentMap = 'Map2';
      expect(game.getEffectiveKeyBindings()).toEqual({ ...defaults, Jump: 'KeyJ' });
    });

    it('getEffectiveKeyBindings() returns confused keybindings when player is confused', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      const defaults = getDefaultKeyBindings();
      const confusedBindings = { ...defaults, MoveLeft: 'KeyJ' };

      game.keyBindings = { ...defaults, MoveLeft: 'KeyA' };
      game.isTutorialActive = false;
      game.currentMap = 'Map2';

      game.player.isConfused = true;
      game.player.confusedKeyBindings = confusedBindings;

      expect(game.getEffectiveKeyBindings()).toBe(confusedBindings);
    });
  });

  // ------------------------------------------------------------
  // Clear Saved Data
  // ------------------------------------------------------------
  describe('clearSavedData()', () => {
    it('resets saved data, unlock flags, skins, audio settings, and keybindings to defaults', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.menu.forestMap.resetSelectedCircleIndex = jest.fn();
      game.menu.levelDifficulty.setDifficulty = jest.fn();
      game.menu.skins.setCurrentSkinById = jest.fn();
      game.menu.audioSettings.setState = jest.fn();
      game.menu.ingameAudioSettings.setState = jest.fn();

      localStorage.setItem('gameState', '{"foo":123}');
      game.clearSavedData();

      const raw = localStorage.getItem('gameState');
      expect(raw).not.toBeNull();

      const saved = JSON.parse(raw);

      expect(saved).toMatchObject({
        currentMap: null,
        isTutorialActive: true,
        map1Unlocked: true,
        map2Unlocked: false,
        map3Unlocked: false,
        map4Unlocked: false,
        map5Unlocked: false,
        map6Unlocked: false,
        map7Unlocked: false,
        bonusMap1Unlocked: false,
        bonusMap2Unlocked: false,
        bonusMap3Unlocked: false,
        glacikalDefeated: false,
        elyvorgDefeated: false,
        ntharaxDefeated: false,
        audioSettingsState: { volumeLevels: [75, 10, 90, 90, 70, 60, null] },
        ingameAudioSettingsState: { volumeLevels: [30, 80, 60, 40, 80, 65, null] },
        currentSkin: 'defaultSkin',
        selectedDifficulty: 'Normal',
      });

      expect(game.isTutorialActive).toBe(true);
      expect(game.map1Unlocked).toBe(true);
      expect(game.map2Unlocked).toBe(false);
      expect(game.map3Unlocked).toBe(false);
      expect(game.map4Unlocked).toBe(false);
      expect(game.map5Unlocked).toBe(false);
      expect(game.map6Unlocked).toBe(false);
      expect(game.map7Unlocked).toBe(false);
      expect(game.glacikalDefeated).toBe(false);
      expect(game.elyvorgDefeated).toBe(false);
      expect(game.ntharaxDefeated).toBe(false);

      expect(game.menu.forestMap.resetSelectedCircleIndex).toHaveBeenCalled();
      expect(game.menu.enemyLore.currentPage).toBe(0);
      expect(game.menu.levelDifficulty.setDifficulty).toHaveBeenCalledWith('Normal');
      expect(game.menu.skins.currentSkin).toBe(game.menu.skins.defaultSkin);
      expect(game.menu.skins.setCurrentSkinById).toHaveBeenCalledWith('defaultSkin');
      expect(game.menu.audioSettings.setState)
        .toHaveBeenCalledWith({ volumeLevels: [75, 10, 90, 90, 70, 60, null] });
      expect(game.menu.ingameAudioSettings.setState)
        .toHaveBeenCalledWith({ volumeLevels: [30, 80, 60, 40, 80, 65, null] });

      expect(game.keyBindings).toEqual(getDefaultKeyBindings());
    });
  });

  // ------------------------------------------------------------
  // Cutscene start/end
  // ------------------------------------------------------------
  describe('startCutscene()', () => {
    it('marks cutscene as active, sets fadingIn, and stores currentCutscene', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      const fakeCutscene = {};
      game.fadingIn = false;
      game.cutsceneActive = false;
      game.currentCutscene = null;

      game.startCutscene(fakeCutscene);

      expect(game.fadingIn).toBe(true);
      expect(game.cutsceneActive).toBe(true);
      expect(game.currentCutscene).toBe(fakeCutscene);
    });
  });

  describe('endCutscene()', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('clears cutscene state and does not change menu when player not in cabin', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.player.x = 0;
      game.player.width = 10;
      game.cabin = { x: 100, width: 50 };
      game.currentMenu = { foo: 'bar' };
      game.cutsceneActive = true;
      game.currentCutscene = {};

      game.endCutscene();

      expect(game.cutsceneActive).toBe(false);
      expect(game.currentCutscene).toBeNull();
      expect(game.currentMenu).toBeNull();
    });

    it('when player in cabin & not Map7, resets and shows forestMap, then re-enables after 4s', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.player.x = 300;
      game.player.width = 50;
      game.cabin = { x: 100, width: 200 };
      game.background = { constructor: { name: 'NotMap7' }, totalDistanceTraveled: game.maxDistance };
      game.resetInstance = { reset: jest.fn() };
      game.menu.forestMap.showSavingSprite = false;
      game.canSelectForestMap = true;
      game.menu.forestMap.selectedCircleIndex = 0;

      game.endCutscene();

      expect(game.resetInstance.reset).toHaveBeenCalled();
      expect(game.isPlayerInGame).toBe(false);
      expect(game.canSelectForestMap).toBe(false);
      expect(game.menu.forestMap.showSavingSprite).toBe(true);
      expect(game.currentMenu).toBe(game.menu.forestMap);

      jest.advanceTimersByTime(4000);
      expect(game.canSelectForestMap).toBe(true);
      expect(game.menu.forestMap.showSavingSprite).toBe(false);
      expect(game.menu.forestMap.selectedCircleIndex).toBe(0);
    });

    it('when player in cabin & background is Map7, resets and shows main menu, then re-enables', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.player.x = 300;
      game.player.width = 50;
      game.cabin = { x: 100, width: 200 };
      game.background = new Map7(game);
      game.resetInstance = { reset: jest.fn() };
      game.menu.main.showSavingSprite = false;
      game.canSelect = true;

      game.endCutscene();

      expect(game.resetInstance.reset).toHaveBeenCalled();
      expect(game.menu.main.showSavingSprite).toBe(true);
      expect(game.canSelect).toBe(false);
      expect(game.currentMenu).toBe(game.menu.main);

      jest.advanceTimersByTime(4000);
      expect(game.menu.main.showSavingSprite).toBe(false);
      expect(game.canSelect).toBe(true);
    });
  });

  describe('endCutscene() behavior with map selection', () => {
    let game, forestMapMenu;

    beforeEach(() => {
      jest.useFakeTimers();

      game = new Game(canvas, canvas.width, canvas.height);
      forestMapMenu = game.menu.forestMap;

      game.cabin = { x: 100, width: 200 };

      game.player.x = 300;
      game.player.width = 50;

      game.resetInstance = { reset: jest.fn() };

      jest.spyOn(game.audioHandler.menu, 'playSound');

      forestMapMenu.selectedCircleIndex = 0;
      game.isPlayerInGame = true;
      game.cabinAppeared = true;

      game.map1Unlocked = true;
      game.map2Unlocked = true;
      game.map3Unlocked = true;
      game.map4Unlocked = true;
      game.map5Unlocked = true;
      game.map6Unlocked = true;
      game.map7Unlocked = true;
      game.bonusMap1Unlocked = true;
      game.bonusMap2Unlocked = true;
      game.bonusMap3Unlocked = true;
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('moves to the correct map selection after Map1 end cutscene', () => {
      game.background = {
        constructor: { name: 'Map1' },
        totalDistanceTraveled: game.maxDistance
      };
      game.currentMap = 'Map1';
      forestMapMenu.selectedCircleIndex = 0;

      game.endCutscene();
      jest.advanceTimersByTime(4000);

      expect(forestMapMenu.selectedCircleIndex).toBe(1);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    it('moves to the correct map selection after Map2 end cutscene', () => {
      game.background = {
        constructor: { name: 'Map2' },
        totalDistanceTraveled: game.maxDistance
      };
      game.currentMap = 'Map2';
      forestMapMenu.selectedCircleIndex = 1;

      game.endCutscene();
      jest.advanceTimersByTime(4000);

      expect(forestMapMenu.selectedCircleIndex).toBe(2);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    it('moves to the correct map selection after Map3 end cutscene', () => {
      game.background = {
        constructor: { name: 'Map3' },
        totalDistanceTraveled: game.maxDistance
      };
      game.currentMap = 'Map3';
      forestMapMenu.selectedCircleIndex = 2;

      game.endCutscene();
      jest.advanceTimersByTime(4000);

      expect(forestMapMenu.selectedCircleIndex).toBe(3);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    it('moves to the correct map selection after Map4 end cutscene', () => {
      game.background = {
        constructor: { name: 'Map4' },
        totalDistanceTraveled: game.maxDistance
      };
      game.currentMap = 'Map4';
      forestMapMenu.selectedCircleIndex = 3;

      game.endCutscene();
      jest.advanceTimersByTime(4000);

      expect(forestMapMenu.selectedCircleIndex).toBe(4);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    it('moves to the correct map selection after Map5 end cutscene', () => {
      game.background = {
        constructor: { name: 'Map5' },
        totalDistanceTraveled: game.maxDistance
      };
      game.currentMap = 'Map5';
      forestMapMenu.selectedCircleIndex = 4;

      game.endCutscene();
      jest.advanceTimersByTime(4000);

      expect(forestMapMenu.selectedCircleIndex).toBe(5);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    it('moves to the correct map selection after Map6 end cutscene', () => {
      game.background = {
        constructor: { name: 'Map6' },
        totalDistanceTraveled: game.maxDistance
      };
      game.currentMap = 'Map6';
      forestMapMenu.selectedCircleIndex = 5;

      game.endCutscene();
      jest.advanceTimersByTime(4000);

      expect(forestMapMenu.selectedCircleIndex).toBe(6);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    it('moves to the correct map selection after BonusMap1 end cutscene', () => {
      game.background = {
        constructor: { name: 'BonusMap1' },
        totalDistanceTraveled: game.maxDistance
      };
      game.currentMap = 'BonusMap1';
      forestMapMenu.selectedCircleIndex = 6;

      game.endCutscene();
      jest.advanceTimersByTime(4000);

      expect(forestMapMenu.selectedCircleIndex).toBe(1);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    it('moves to the correct map selection after BonusMap2 end cutscene', () => {
      game.background = {
        constructor: { name: 'BonusMap2' },
        totalDistanceTraveled: game.maxDistance
      };
      game.currentMap = 'BonusMap2';
      forestMapMenu.selectedCircleIndex = 7;

      game.endCutscene();
      jest.advanceTimersByTime(4000);

      expect(forestMapMenu.selectedCircleIndex).toBe(9);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });

    it('moves to the correct map selection after BonusMap3 end cutscene', () => {
      game.background = {
        constructor: { name: 'BonusMap3' },
        totalDistanceTraveled: game.maxDistance
      };
      game.currentMap = 'BonusMap3';
      forestMapMenu.selectedCircleIndex = 4;

      game.endCutscene();
      jest.advanceTimersByTime(4000);

      expect(forestMapMenu.selectedCircleIndex).toBe(3);
      expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    });
  });

  // ------------------------------------------------------------
  // Reset delegator
  // ------------------------------------------------------------
  describe('reset()', () => {
    it('delegates to resetInstance.reset()', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.resetInstance = { reset: jest.fn() };
      game.reset();
      expect(game.resetInstance.reset).toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------
  // Cabin & Penguin spawning
  // ------------------------------------------------------------
  describe('addCabin() / addPenguin()', () => {
    let game;

    beforeEach(() => {
      game = new Game(canvas, canvas.width, canvas.height);
      game.cabin = { width: 50 };
      game.penguini = { width: 40 };
      game.background = { totalDistanceTraveled: game.maxDistance };
      game.cabinAppeared = false;
      game.penguinAppeared = false;
      game.cabins = [];
      game.penguins = [];
    });

    it('addCabin() pushes cabin and sets flags only once', () => {
      game.addCabin();
      game.addCabin();
      expect(game.cabins).toHaveLength(1);
      expect(game.cabinAppeared).toBe(true);
      expect(game.fixedCabinX).toBe(game.width - game.cabin.width);
    });

    it('addPenguin() pushes penguin and sets flags only once', () => {
      game.addPenguin();
      game.addPenguin();
      expect(game.penguins).toHaveLength(1);
      expect(game.penguinAppeared).toBe(true);
      expect(game.fixedPenguinX).toBe(game.width - game.cabin.width - 100);
      expect(game.talkToPenguin).toBe(true);
    });
  });

  // ------------------------------------------------------------
  // PowerUps
  // ------------------------------------------------------------
  describe('addPowerUp()', () => {
    let game;

    beforeEach(() => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      game = new Game(canvas, canvas.width, canvas.height);
      game.background = { constructor: { name: 'NotMap7' }, totalDistanceTraveled: 0 };
      game.player.isBluePotionActive = false;
      game.player.isUnderwater = true;
      game.powerUps = [];
    });

    afterEach(() => {
      Math.random.mockRestore();
    });

    it('spawns all power-up types when random < thresholds and not Map7', () => {
      game.speed = 10;
      game.addPowerUp();
      expect(game.powerUps.some(p => p instanceof RedPotion)).toBe(true);
      expect(game.powerUps.some(p => p instanceof BluePotion)).toBe(true);
      expect(game.powerUps.some(p => p instanceof HealthLive)).toBe(true);
      expect(game.powerUps.some(p => p instanceof Coin)).toBe(true);
      expect(game.powerUps.some(p => p instanceof OxygenTank)).toBe(true);
    });

    it('spawns no power-ups on Map7', () => {
      game.background = new Map7(game);
      game.powerUps = [];
      game.addPowerUp();
      expect(game.powerUps).toHaveLength(0);
    });

    it('spawns no power-ups when speed is zero', () => {
      game.speed = 0;
      game.addPowerUp();
      expect(game.powerUps).toHaveLength(0);
    });

    it('spawns no power-ups when too close to maxDistance', () => {
      game.speed = 10;
      game.background.totalDistanceTraveled = game.maxDistance - 2;
      game.addPowerUp();
      expect(game.powerUps).toHaveLength(0);
    });
  });

  describe('addPowerUp() edge-cases', () => {
    let game;

    beforeEach(() => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      game = new Game(canvas, canvas.width, canvas.height);
      game.background = { constructor: { name: 'NotMap7' }, totalDistanceTraveled: 0 };
      game.speed = 10;
    });

    afterEach(() => Math.random.mockRestore());

    it('does not spawn OxygenTank when player.isUnderwater is false', () => {
      game.player.isBluePotionActive = false;
      game.player.isUnderwater = false;
      game.powerUps = [];
      game.addPowerUp();
      expect(game.powerUps.some(p => p instanceof OxygenTank)).toBe(false);
    });
  });

  // ------------------------------------------------------------
  // PowerDowns
  // ------------------------------------------------------------
  describe('addPowerDown()', () => {
    let game;

    beforeEach(() => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      game = new Game(canvas, canvas.width, canvas.height);
      game.background = { constructor: { name: 'NotMap7' }, totalDistanceTraveled: 0 };
      game.speed = 10;
      game.player.isBlackHoleActive = false;
      game.player.isUnderwater = true;
      game.powerDowns = [];
    });

    afterEach(() => {
      Math.random.mockRestore();
    });

    it('spawns all power-down types when random < thresholds and not Map7', () => {
      game.addPowerDown();
      expect(game.powerDowns.some(p => p instanceof IceDrink)).toBe(true);
      expect(game.powerDowns.some(p => p instanceof IceCube)).toBe(true);
      expect(game.powerDowns.some(p => p instanceof Cauldron)).toBe(true);
      expect(game.powerDowns.some(p => p instanceof BlackHole)).toBe(true);
      expect(game.powerDowns.some(p => p instanceof Confuse)).toBe(true);
      expect(game.powerDowns.some(p => p instanceof DeadSkull)).toBe(true);
      expect(game.powerDowns.some(p => p instanceof CarbonDioxideTank)).toBe(true);
    });

    it('spawns no power-downs on Map7', () => {
      game.background = new Map7(game);
      game.powerDowns = [];
      game.addPowerDown();
      expect(game.powerDowns).toHaveLength(0);
    });

    it('spawns no power-downs when speed is zero', () => {
      game.speed = 0;
      game.addPowerDown();
      expect(game.powerDowns).toHaveLength(0);
    });

    it('spawns no power-downs when too close to maxDistance', () => {
      game.speed = 10;
      game.background.totalDistanceTraveled = game.maxDistance - 2;
      game.addPowerDown();
      expect(game.powerDowns).toHaveLength(0);
    });
  });

  describe('addPowerDown() edge-cases', () => {
    let game;

    beforeEach(() => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      game = new Game(canvas, canvas.width, canvas.height);
      game.background = { constructor: { name: 'NotMap7' }, totalDistanceTraveled: 0 };
      game.speed = 10;
    });

    afterEach(() => Math.random.mockRestore());

    it('does not spawn CarbonDioxideTank when player.isUnderwater is false', () => {
      game.player.isBlackHoleActive = false;
      game.player.isUnderwater = false;
      game.powerDowns = [];
      game.addPowerDown();
      expect(game.powerDowns.some(p => p instanceof CarbonDioxideTank)).toBe(false);
    });
  });

  // ------------------------------------------------------------
  // Enemies
  // ------------------------------------------------------------
  describe('addEnemy()', () => {
    let game;

    beforeEach(() => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      game = new Game(canvas, canvas.width, canvas.height);
      game.enemies = [];
      game.maxEnemies = 5;
    });

    afterEach(() => {
      Math.random.mockRestore();
    });

    it('spawns no enemies when gameOver is true', () => {
      game.gameOver = true;
      game.background = { totalDistanceTraveled: 0, constructor: { name: 'Map1' } };
      game.currentMap = 'Map1';
      game.addEnemy();
      expect(game.enemies).toHaveLength(0);
    });

    it('spawns no enemies when background distance >= maxDistance', () => {
      game.gameOver = false;
      game.background = { totalDistanceTraveled: game.maxDistance, constructor: { name: 'Map1' } };
      game.currentMap = 'Map1';
      game.addEnemy();
      expect(game.enemies).toHaveLength(0);
    });

    it('delegates boss spawning to bossManager and skips normal enemies when a boss is spawned', () => {
      game.gameOver = false;
      game.background = { totalDistanceTraveled: 0, constructor: { name: 'Map7' } };
      game.currentMap = 'Map7';

      const boss = { isBoss: true };
      const spawnBossSpy = jest.spyOn(game.bossManager, 'spawnBossIfNeeded')
        .mockImplementation(() => {
          game.enemies.push(boss);
          return true;
        });
      const canSpawnNormalEnemiesSpy = jest.spyOn(game.bossManager, 'canSpawnNormalEnemies');

      game.addEnemy();

      expect(spawnBossSpy).toHaveBeenCalled();
      expect(canSpawnNormalEnemiesSpy).not.toHaveBeenCalled();
      expect(game.enemies).toHaveLength(1);
      expect(game.enemies[0]).toBe(boss);
    });

    it('spawns a Goblin when random < probability on Map1 (when bossManager allows normal enemies)', () => {
      game.gameOver = false;
      game.background = { totalDistanceTraveled: 0, constructor: { name: 'Map1' } };
      game.currentMap = 'Map1';

      jest.spyOn(game.bossManager, 'spawnBossIfNeeded').mockReturnValue(false);
      jest.spyOn(game.bossManager, 'canSpawnNormalEnemies').mockReturnValue(true);

      game.addEnemy();
      expect(game.enemies.length).toBeGreaterThan(0);
      expect(game.enemies[0]).toBeInstanceOf(Goblin);
    });

    it('does not spawn normal enemies when bossManager.canSpawnNormalEnemies() returns false', () => {
      game.gameOver = false;
      game.background = { totalDistanceTraveled: 0, constructor: { name: 'Map1' } };
      game.currentMap = 'Map1';

      jest.spyOn(game.bossManager, 'spawnBossIfNeeded').mockReturnValue(false);
      jest.spyOn(game.bossManager, 'canSpawnNormalEnemies').mockReturnValue(false);

      game.addEnemy();
      expect(game.enemies).toHaveLength(0);
    });

    it('can spawn normal enemies on Map7 via enemy table when bossManager allows it', () => {
      game.gameOver = false;
      game.background = new Map7(game);
      game.currentMap = 'Map7';
      game.enemies = [];

      jest.spyOn(game.bossManager, 'spawnBossIfNeeded').mockReturnValue(false);
      jest.spyOn(game.bossManager, 'canSpawnNormalEnemies').mockReturnValue(true);

      game.addEnemy();

      expect(game.enemies.some(e => e instanceof Goblin)).toBe(true);
    });

    it('does not add a second ImmobileGroundEnemy instance too close to an existing one', () => {
      const fake = new ImmobileGroundEnemy(game);
      fake.x = 100; fake.y = 100; fake.width = 50; fake.height = 50;
      game.enemies = [fake];
      jest.spyOn(Math, 'random').mockReturnValue(0);
      game.background = { totalDistanceTraveled: 0, constructor: { name: 'Map1' } };
      game.currentMap = 'Map1';
      game.maxEnemies = 2;
      game.addEnemy();
      const igCount = game.enemies.filter(e => e instanceof ImmobileGroundEnemy).length;
      expect(igCount).toBe(1);
    });

    it('spawns no enemies when maxEnemies is zero', () => {
      game.maxEnemies = 0;
      game.background = { totalDistanceTraveled: 0, constructor: { name: 'Map1' } };
      game.currentMap = 'Map1';
      game.addEnemy();
      expect(game.enemies).toHaveLength(0);
    });
  });

  // ------------------------------------------------------------
  // Update loop: tutorial, timing, filtering
  // ------------------------------------------------------------
  describe('update() tutorial & timeout behavior', () => {
    it('calls tutorial.update when tutorial is active on Map1 and sets noDamageDuringTutorial', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.isTutorialActive = true;
      game.currentMap = 'Map1';
      game.tutorial.update = jest.fn();
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.background = {
        update: () => { }, totalDistanceTraveled: 0, constructor: { name: 'Map1' },
      };
      game.cabin = { isFullyVisible: false };
      game.player = { update: () => { }, isUnderwater: false };
      game.update(16);
      expect(game.tutorial.update).toHaveBeenCalledWith(16);
      expect(game.noDamageDuringTutorial).toBe(true);
    });

    it('does not call tutorial.update when tutorial is inactive and clears noDamageDuringTutorial', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.isTutorialActive = false;
      game.currentMap = 'Map1';
      game.tutorial.update = jest.fn();
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.background = { update: () => { }, totalDistanceTraveled: 0 };
      game.cabin = { isFullyVisible: false };
      game.player = { update: () => { }, isUnderwater: false };
      game.noDamageDuringTutorial = true;
      game.update(16);
      expect(game.tutorial.update).not.toHaveBeenCalled();
      expect(game.noDamageDuringTutorial).toBe(false);
    });

    it('sets gameOver when time > maxTime while underwater', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.player = { update: () => { }, isUnderwater: true, x: 0, width: 0 };
      game.background = { update: () => { }, totalDistanceTraveled: 0 };
      game.time = game.maxTime + 1;
      game.update(10);
      expect(game.gameOver).toBe(true);
    });

    it('filters out entities markedForDeletion after update', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.player = { update: () => { }, isUnderwater: false, x: 0, width: 0 };
      game.background = { update: () => { }, totalDistanceTraveled: 0 };
      game.enemies = [
        { markedForDeletion: true, update: () => { } },
        { markedForDeletion: false, update: () => { } }
      ];
      game.powerUps = [{ markedForDeletion: true, update: () => { } }];
      game.powerDowns = [
        { markedForDeletion: false, update: () => { } },
        { markedForDeletion: true, update: () => { } }
      ];
      game.behindPlayerParticles = [{ markedForDeletion: true, update: () => { } }];
      game.particles = [{ markedForDeletion: true, update: () => { } }];
      game.collisions = [
        { markedForDeletion: true, update: () => { } },
        { markedForDeletion: false, update: () => { } }
      ];
      game.floatingMessages = [{ markedForDeletion: true, update: () => { } }];

      game.update(0);

      expect(game.enemies).toHaveLength(1);
      expect(game.powerUps).toHaveLength(0);
      expect(game.powerDowns).toHaveLength(1);
      expect(game.behindPlayerParticles).toHaveLength(0);
      expect(game.particles).toHaveLength(0);
      expect(game.collisions).toHaveLength(1);
      expect(game.floatingMessages).toHaveLength(0);
    });
  });

  describe('tutorial gating of spawns on Map1', () => {
    it('does not add enemies/powerups/powerdowns when tutorial is active on Map1; still adds cabin/penguin', () => {
      const game = new Game(canvas, canvas.width, canvas.height);

      game.enemyTimer = game.enemyInterval + 1;
      game.nonEnemyTimer = game.nonEnemyInterval + 1;

      game.isTutorialActive = true;
      game.currentMap = 'Map1';

      const addEnemy = jest.spyOn(game, 'addEnemy').mockImplementation(() => { });
      const addPowerUp = jest.spyOn(game, 'addPowerUp').mockImplementation(() => { });
      const addPowerDown = jest.spyOn(game, 'addPowerDown').mockImplementation(() => { });
      const addCabin = jest.spyOn(game, 'addCabin').mockImplementation(() => { });
      const addPenguin = jest.spyOn(game, 'addPenguin').mockImplementation(() => { });

      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.background = { update: () => { }, totalDistanceTraveled: 0, constructor: { name: 'Map1' } };
      game.player = { update: () => { }, isUnderwater: false, x: 0, width: 0 };
      game.cabin = { isFullyVisible: false };

      game.update(16);

      expect(addEnemy).not.toHaveBeenCalled();
      expect(addPowerUp).not.toHaveBeenCalled();
      expect(addPowerDown).not.toHaveBeenCalled();
      expect(addCabin).toHaveBeenCalled();
      expect(addPenguin).toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------
  // Cutscene triggering during update()
  // ------------------------------------------------------------
  describe('update() cutscene triggering', () => {
    it('triggers in-game penguin cutscene on Map1 when flags are set', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      jest.spyOn(game, 'startCutscene');
      game.talkToPenguin = true;
      game.talkToPenguinOneTimeOnly = true;
      game.enterToTalkToPenguin = true;
      game.background = { constructor: { name: 'Map1' }, update: () => { } };
      game.currentMap = 'Map1';
      game.player = { update: () => { } };
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.update(0);
      expect(game.startCutscene).toHaveBeenCalled();
      expect(game.cutscenes.some(c => c instanceof Map1PenguinIngameCutscene)).toBe(true);
      expect(game.enterToTalkToPenguin).toBe(false);
    });

    it('triggers in-game penguin cutscene on Map2 when flags are set', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      jest.spyOn(game, 'startCutscene');
      game.talkToPenguin = true;
      game.talkToPenguinOneTimeOnly = true;
      game.enterToTalkToPenguin = true;
      game.background = { constructor: { name: 'Map2' }, update: () => { } };
      game.currentMap = 'Map2';
      game.player = { update: () => { } };
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.update(0);
      expect(game.cutscenes.some(c => c instanceof Map2PenguinIngameCutscene)).toBe(true);
    });

    it('triggers in-game penguin cutscene on Map3 when flags are set', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      jest.spyOn(game, 'startCutscene');
      game.talkToPenguin = true;
      game.talkToPenguinOneTimeOnly = true;
      game.enterToTalkToPenguin = true;
      game.background = { constructor: { name: 'Map3' }, update: () => { } };
      game.currentMap = 'Map3';
      game.player = { update: () => { } };
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.update(0);
      expect(game.cutscenes.some(c => c instanceof Map3PenguinIngameCutscene)).toBe(true);
    });

    it('triggers in-game penguin cutscene on Map4 when flags are set', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      jest.spyOn(game, 'startCutscene');
      game.talkToPenguin = true;
      game.talkToPenguinOneTimeOnly = true;
      game.enterToTalkToPenguin = true;
      game.background = { constructor: { name: 'Map4' }, update: () => { } };
      game.currentMap = 'Map4';
      game.player = { update: () => { } };
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.update(0);
      expect(game.cutscenes.some(c => c instanceof Map4PenguinIngameCutscene)).toBe(true);
    });

    it('triggers in-game penguin cutscene on Map5 when flags are set', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      jest.spyOn(game, 'startCutscene');
      game.talkToPenguin = true;
      game.talkToPenguinOneTimeOnly = true;
      game.enterToTalkToPenguin = true;
      game.background = { constructor: { name: 'Map5' }, update: () => { } };
      game.currentMap = 'Map5';
      game.player = { update: () => { } };
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.update(0);
      expect(game.cutscenes.some(c => c instanceof Map5PenguinIngameCutscene)).toBe(true);
    });

    it('triggers in-game penguin cutscene on Map7 when flags are set', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      jest.spyOn(game, 'startCutscene');
      game.talkToPenguin = true;
      game.talkToPenguinOneTimeOnly = true;
      game.enterToTalkToPenguin = true;
      game.background = { constructor: { name: 'Map7' }, update: () => { } };
      game.currentMap = 'Map7';
      game.player = { update: () => { } };
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.update(0);
      expect(game.cutscenes.some(c => c instanceof Map7PenguinIngameCutscene)).toBe(true);
    });

    it('triggers Elyvorg pre-fight cutscene on Map7 via bossManager state', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      jest.spyOn(game, 'startCutscene');

      game.background = new Map7(game);
      game.currentMap = 'Map7';

      game.player = {
        update: () => { },
        x: 0,
        width: 0,
        energy: 0,
        isInvisible: true,
        invisibleTimer: 0,
        invisibleCooldown: 1000,
        invisibleActiveCooldownTimer: 0,
      };

      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.background.update = () => { };

      const bossState = game.bossManager.state;
      Object.assign(bossState, {
        current: {},
        id: 'elyvorg',
        map: 'Map7',
        isVisible: true,
        talkToBoss: false,
        preFight: false,
        inFight: false,
        postFight: false,
        runAway: false,
        dialogueBeforeOnce: true,
        dialogueAfterOnce: false,
        dialogueAfterLeaving: false,
        startAfterDialogueWhenAnimEnds: false,
        poisonScreen: false,
        poisonColourOpacity: 0,
      });
      game.menu.levelDifficulty.setDifficulty = jest.fn();

      game.update(0);

      expect(game.startCutscene).toHaveBeenCalled();
      expect(game.cutscenes.some(c => c instanceof Map7ElyvorgIngameCutsceneBeforeFight)).toBe(true);
      expect(game.boss.dialogueBeforeOnce).toBe(false);
      expect(game.boss.preFight).toBe(true);
      expect(game.boss.postFight).toBe(false);
    });

    it('triggers Elyvorg post-fight cutscene on Map7 via bossManager state', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      jest.spyOn(game, 'startCutscene');

      game.background = new Map7(game);
      game.currentMap = 'Map7';

      game.player = {
        update: () => { },
        x: 0,
        width: 0,
        energy: 100,
        isInvisible: false,
        invisibleTimer: 0,
        invisibleCooldown: 1000,
        invisibleActiveCooldownTimer: 0,
      };

      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.background.update = () => { };

      const bossState = game.bossManager.state;
      Object.assign(bossState, {
        current: {},
        id: 'elyvorg',
        map: 'Map7',
        isVisible: true,
        talkToBoss: false,
        preFight: true,
        inFight: false,
        postFight: false,
        runAway: false,
        dialogueBeforeOnce: false,
        dialogueAfterOnce: true,
        dialogueAfterLeaving: false,
        startAfterDialogueWhenAnimEnds: true,
        poisonScreen: false,
        poisonColourOpacity: 0,
      });

      game.update(0);

      expect(game.startCutscene).toHaveBeenCalled();
      expect(game.cutscenes.some(c => c instanceof Map7ElyvorgIngameCutsceneAfterFight)).toBe(true);
      expect(game.boss.dialogueAfterOnce).toBe(false);
      expect(game.boss.dialogueAfterLeaving).toBe(true);
      expect(game.boss.postFight).toBe(true);
      expect(game.boss.postFight).toBe(true);
    });

    it('triggers Glacikal pre-fight cutscene on BonusMap1 via bossManager state', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      jest.spyOn(game, 'startCutscene');

      game.background = new BonusMap1(game);
      game.currentMap = 'BonusMap1';

      game.player = {
        update: () => { },
        x: 0,
        width: 0,
        energy: 0,
        isInvisible: true,
        invisibleTimer: 0,
        invisibleCooldown: 1000,
        invisibleActiveCooldownTimer: 0,
      };

      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.background.update = () => { };

      const bossState = game.bossManager.state;
      Object.assign(bossState, {
        current: {},
        id: 'glacikal',
        map: 'BonusMap1',
        isVisible: true,
        talkToBoss: false,
        preFight: false,
        inFight: false,
        postFight: false,
        runAway: false,
        dialogueBeforeOnce: true,
        dialogueAfterOnce: false,
        dialogueAfterLeaving: false,
        startAfterDialogueWhenAnimEnds: false,
        poisonScreen: false,
        poisonColourOpacity: 0,
      });
      game.menu.levelDifficulty.setDifficulty = jest.fn();

      game.update(0);

      expect(game.startCutscene).toHaveBeenCalled();
      expect(game.cutscenes.some(c => c instanceof BonusMap1GlacikalIngameCutsceneBeforeFight)).toBe(true);
      expect(game.boss.dialogueBeforeOnce).toBe(false);
      expect(game.boss.preFight).toBe(true);
      expect(game.boss.postFight).toBe(false);
    });

    it('triggers Glacikal post-fight cutscene on BonusMap1 via bossManager state', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      jest.spyOn(game, 'startCutscene');

      game.background = new BonusMap1(game);
      game.currentMap = 'BonusMap1';

      game.player = {
        update: () => { },
        x: 0,
        width: 0,
        energy: 100,
        isInvisible: false,
        invisibleTimer: 0,
        invisibleCooldown: 1000,
        invisibleActiveCooldownTimer: 0,
      };

      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.cabin = { isFullyVisible: false };
      game.background.update = () => { };

      const bossState = game.bossManager.state;
      Object.assign(bossState, {
        current: {},
        id: 'glacikal',
        map: 'BonusMap1',
        isVisible: true,
        talkToBoss: false,
        preFight: true,
        inFight: false,
        postFight: false,
        runAway: false,
        dialogueBeforeOnce: false,
        dialogueAfterOnce: true,
        dialogueAfterLeaving: false,
        startAfterDialogueWhenAnimEnds: true,
        poisonScreen: false,
        poisonColourOpacity: 0,
      });

      game.update(0);

      expect(game.startCutscene).toHaveBeenCalled();
      expect(game.cutscenes.some(c => c instanceof BonusMap1GlacikalIngameCutsceneAfterFight)).toBe(true);
      expect(game.boss.dialogueAfterOnce).toBe(false);
      expect(game.boss.dialogueAfterLeaving).toBe(true);
      expect(game.boss.postFight).toBe(true);
    });

    it('sets enterCabin=500 and openDoor="submarineDoorOpening" for Map3 and plays sound', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.saveGameState = jest.fn();
      game.menu.skins.currentSkin = { id: 'defaultSkin' };
      game.menu.audioSettings.getState = () => ({});
      game.menu.ingameAudioSettings.getState = () => ({});

      jest.spyOn(game.audioHandler.cutsceneSFX, 'playSound');
      game.background = new Map3(game);
      game.currentMap = 'Map3';
      game.cabin = { isFullyVisible: true, x: 100, width: 1000 };
      game.player = { update: () => { }, x: 100 + 500, width: 10 };
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.background.update = () => { };

      game.update(0);

      expect(game.enterCabin).toBe(500);
      expect(game.openDoor).toBe('submarineDoorOpening');
      expect(game.audioHandler.cutsceneSFX.playSound)
        .toHaveBeenCalledWith('submarineDoorOpening');
    });

    [
      { name: 'Map1', cls: Map1EndCutscene },
      { name: 'Map2', cls: Map2EndCutscene },
      { name: 'Map3', cls: Map3EndCutscene },
      { name: 'Map4', cls: Map4EndCutscene },
      { name: 'Map5', cls: Map5EndCutscene },
      { name: 'Map6', cls: Map6EndCutscene },
      { name: 'Map7', cls: Map7EndCutscene },
    ].forEach(({ name, cls }) => {
      it(`triggers end-of-map cutscene for ${name} when player enters cabin`, () => {
        const game = new Game(canvas, canvas.width, canvas.height);

        game.saveGameState = jest.fn();
        game.menu.skins.currentSkin = { id: 'defaultSkin' };
        game.menu.audioSettings.getState = () => ({});
        game.menu.ingameAudioSettings.getState = () => ({});
        jest.spyOn(game, 'startCutscene');
        game.background = { constructor: { name }, update: () => { } };
        game.currentMap = name;
        game.cabin = { isFullyVisible: true, x: 100, width: 1000 };
        game.player = { update: () => { }, x: 500, width: 10 };
        game.menu.pause.isPaused = false;
        game.tutorial.tutorialPause = false;
        game.update(0);
        expect(game.startCutscene).toHaveBeenCalled();
        expect(game.currentCutscene).toBeInstanceOf(cls);
        expect(game.isEndCutscene).toBe(true);
        expect(game.isPlayerInGame).toBe(false);
      });
    });
  });

  // ------------------------------------------------------------
  // Draw
  // ------------------------------------------------------------
  describe('draw()', () => {
    let game;

    beforeEach(() => {
      game = new Game(canvas, canvas.width, canvas.height);
      game.background = { draw: jest.fn() };
      game.cabins = [{ draw: jest.fn() }];
      game.penguins = [{ draw: jest.fn() }];
      game.powerUps = [{ draw: jest.fn() }];
      game.powerDowns = [{ draw: jest.fn() }];
      game.behindPlayerParticles = [{ draw: jest.fn() }];
      game.player = { draw: jest.fn(), isUnderwater: false, isInvisible: false };
      game.enemies = [{ draw: jest.fn() }];
      game.particles = [{ draw: jest.fn() }];
      game.collisions = [{ draw: jest.fn() }];
      game.floatingMessages = [{ draw: jest.fn() }];
      game.cutscenes = [{ draw: jest.fn() }];
      game.tutorial = { draw: jest.fn() };
      game.UI = { draw: jest.fn() };
      ctx.clearRect.mockClear();
      ctx.fillRect.mockClear();
    });

    it('clears canvas and calls draw on all visible entities and UI', () => {
      game.draw(ctx);
      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, game.width, game.height);
      expect(game.background.draw).toHaveBeenCalledWith(ctx);
      [
        game.cabins[0], game.penguins[0], game.powerUps[0], game.powerDowns[0],
        game.behindPlayerParticles[0], game.player, game.enemies[0],
        game.particles[0], game.collisions[0], game.floatingMessages[0],
        game.cutscenes[0]
      ].forEach(entity => {
        expect(entity.draw).toHaveBeenCalledWith(ctx);
      });
      expect(game.UI.draw).not.toHaveBeenCalled();
    });

    it('draws underwater overlay when player.isUnderwater is true', () => {
      game.player.isUnderwater = true;
      game.player.isInvisible = false;
      game.draw(ctx);
      expect(ctx.fillRect).toHaveBeenCalledTimes(2);
    });

    it('draws poison overlay when boss fight poison screen effect is active', () => {
      game.player.isUnderwater = false;
      game.player.isInvisible = false;

      const bossState = game.bossManager.state;
      Object.assign(bossState, {
        inFight: true,
        screenEffect: {
          active: true,
          opacity: 0.5,
          rgb: [0, 255, 0],
          fadeInSpeed: 1,
        },
      });

      jest.spyOn(game, 'bossInFight', 'get').mockReturnValue(true);

      game.draw(ctx);

      expect(ctx.fillRect).toHaveBeenCalledTimes(2);
    });

    it('draws invisible overlay when player.isInvisible is true', () => {
      game.player.isUnderwater = false;
      game.player.isInvisible = true;
      game.draw(ctx);
      expect(ctx.fillRect).toHaveBeenCalledTimes(1);
    });
  });

  describe('enterCabin & door sound branches', () => {
    it('sets enterCabin=570 and openDoor="walkingCutsceneSound" for Map7 and plays sound', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.saveGameState = jest.fn();
      game.menu.skins.currentSkin = { id: 'defaultSkin' };
      game.menu.audioSettings.getState = () => ({});
      game.menu.ingameAudioSettings.getState = () => ({});

      jest.spyOn(game.audioHandler.cutsceneSFX, 'playSound');

      game.background = new Map7(game);
      game.currentMap = 'Map7';
      game.cabin = { isFullyVisible: true, x: 100, width: 1000 };
      game.player = { update: () => { }, x: 100 + 570, width: 10 };
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.background.update = () => { };

      game.update(0);

      expect(game.enterCabin).toBe(570);
      expect(game.openDoor).toBe('walkingCutsceneSound');
      expect(game.audioHandler.cutsceneSFX.playSound)
        .toHaveBeenCalledWith('walkingCutsceneSound');
    });

    it('sets enterCabin=290 and openDoor="doorOpening" for non-Map3/Map7 maps and plays sound', () => {
      const game = new Game(canvas, canvas.width, canvas.height);

      game.saveGameState = jest.fn();
      game.menu.skins.currentSkin = { id: 'defaultSkin' };
      game.menu.audioSettings.getState = () => ({});
      game.menu.ingameAudioSettings.getState = () => ({});

      jest.spyOn(game.audioHandler.cutsceneSFX, 'playSound');

      game.background = { constructor: { name: 'Map4' }, update: () => { } };
      game.currentMap = 'Map4';
      game.cabin = { isFullyVisible: true, x: 100, width: 1000 };
      game.player = { update: () => { }, x: 100 + 290, width: 10 };
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;

      game.update(0);

      expect(game.enterCabin).toBe(290);
      expect(game.openDoor).toBe('doorOpening');
      expect(game.audioHandler.cutsceneSFX.playSound)
        .toHaveBeenCalledWith('doorOpening');
    });
  });

  describe('tutorial overlay drawing', () => {
    it('draws tutorial overlay when isTutorialActive && currentMap === "Map1"', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.background = { draw: () => { } };
      game.tutorial = { draw: jest.fn(), update: () => { }, tutorialPause: false };
      game.UI = { draw: () => { } };
      game.player = { draw: () => { }, isUnderwater: false, isInvisible: false };
      game.isTutorialActive = true;
      game.currentMap = 'Map1';

      game.draw(ctx);
      expect(game.tutorial.draw).toHaveBeenCalledWith(ctx);
    });

    it('does not draw tutorial overlay when on other maps or tutorial is inactive', () => {
      const game = new Game(canvas, canvas.width, canvas.height);
      game.background = { draw: () => { } };
      game.tutorial = { draw: jest.fn(), update: () => { }, tutorialPause: false };
      game.UI = { draw: () => { } };
      game.player = { draw: () => { }, isUnderwater: false, isInvisible: false };

      game.isTutorialActive = true;
      game.currentMap = 'Map2';
      game.draw(ctx);
      expect(game.tutorial.draw).not.toHaveBeenCalled();

      game.isTutorialActive = false;
      game.currentMap = 'Map1';
      game.draw(ctx);
      expect(game.tutorial.draw).not.toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------
  // Update loop – pause, gameOver, cabin & particles
  // ------------------------------------------------------------
  describe('update() – pause, gameOver, cabin & particles', () => {
    let game;

    beforeEach(() => {
      game = new Game(canvas, canvas.width, canvas.height);
      game.background = { update: jest.fn(), totalDistanceTraveled: 0 };
      game.player = { update: jest.fn(), isUnderwater: false, x: 0, width: 0 };
      game.cabin = { isFullyVisible: false };
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
    });

    it('does nothing when game is paused', () => {
      game.menu.pause.isPaused = true;
      game.time = 123;
      game.update(50);
      expect(game.background.update).not.toHaveBeenCalled();
      expect(game.player.update).not.toHaveBeenCalled();
      expect(game.time).toBe(123);
    });

    it('sets speed to zero when gameOver is true', () => {
      game.gameOver = true;
      game.speed = 7;
      game.update(16);
      expect(game.speed).toBe(0);
    });

    it('does not increase time when cabin.isFullyVisible is true', () => {
      game.cabin.isFullyVisible = true;
      game.time = 500;
      game.update(20);
      expect(game.time).toBe(500);
    });

    it('trims particles array to maxParticles', () => {
      game.maxParticles = 3;
      game.particles = Array(5).fill().map(() => ({ update: () => { }, markedForDeletion: false }));
      game.update(0);
      expect(game.particles).toHaveLength(3);
    });
  });

  // ------------------------------------------------------------
  // Audio mapping checks
  // ------------------------------------------------------------
  describe('update() – audio mapping behavior', () => {
    let game;

    beforeEach(() => {
      game = new Game(canvas, canvas.width, canvas.height);
      game.background = { update: () => { }, totalDistanceTraveled: 0 };
      game.player = { update: () => { }, isUnderwater: false, x: 0, width: 0 };
      game.cabin = { isFullyVisible: false };
      game.menu.pause.isPaused = false;
      game.tutorial.tutorialPause = false;
      game.enemies = [];
    });

    it('fades out "elyvorg_meteor_falling_sound" when no MeteorAttack is present', () => {
      game.audioHandler.enemySFX.isPlaying = jest.fn(name => name === 'elyvorg_meteor_falling_sound');
      game.audioHandler.enemySFX.fadeOutAndStop = jest.fn();
      game.audioHandler.enemySFX.stopSound = jest.fn();

      game.update(1);

      expect(game.audioHandler.enemySFX.fadeOutAndStop)
        .toHaveBeenCalledWith('elyvorg_meteor_falling_sound', 2000);
    });

    it('stops goblinRunSound when no Goblin is present', () => {
      game.audioHandler.enemySFX.isPlaying = jest.fn(() => true);
      game.audioHandler.enemySFX.stopSound = jest.fn();
      game.audioHandler.enemySFX.fadeOutAndStop = jest.fn();

      game.update(1);

      expect(game.audioHandler.enemySFX.stopSound)
        .toHaveBeenCalledWith('goblinRunSound');
    });
  });
});
