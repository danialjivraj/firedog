import { Game } from '../game/game-main.js';
import { Map6, Map3 } from '../game/background/background.js';
import {
    RedPotion,
    BluePotion,
    HealthLive,
    Coin,
    OxygenTank
} from '../game/entities/powerUp.js';
import {
    Drink,
    Cauldron,
    BlackHole
} from '../game/entities/powerDown.js';
import { Goblin, ImmobileGroundEnemy } from '../game/entities/enemies/enemies.js';
import { Elyvorg } from '../game/entities/enemies/elyvorg.js';
import {
    Map1EndCutscene, Map2EndCutscene, Map3EndCutscene,
    Map4EndCutscene, Map5EndCutscene, Map6EndCutscene
} from '../game/cutscene/storyCutscenes.js';
import {
    Map1PenguinIngameCutscene, Map2PenguinIngameCutscene,
    Map3PenguinIngameCutscene, Map4PenguinIngameCutscene,
    Map5PenguinIngameCutscene, Map6PenguinIngameCutscene
} from '../game/cutscene/penguiniCutscenes.js';
import {
    Map6ElyvorgIngameCutsceneBeforeFight,
    Map6ElyvorgIngameCutsceneAfterFight
} from '../game/cutscene/elyvorgCutscenes.js';

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

describe('Game class (game-main.js)', () => {
    let canvas, ctx;

    beforeAll(() => {
        document.body.innerHTML = `<canvas id="canvas1"></canvas>`;
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

    test('constructor sets up initial state', () => {
        const game = new Game(canvas, canvas.width, canvas.height);
        expect(game.width).toBe(1920);
        expect(game.height).toBe(689);
        expect(game.coins).toBe(0);
        expect(game.lives).toBe(5);
        expect(game.maxLives).toBe(10);
        expect(game.mapSelected).toEqual([false, false, false, false, false, false]);
        expect(game.selectedDifficulty).toBe('Normal');
        expect(game.menu.main).toBeDefined();
        expect(typeof game.updateMapSelection).toBe('function');
    });

    describe('updateMapSelection()', () => {
        let game;
        beforeEach(() => {
            game = new Game(canvas, canvas.width, canvas.height);
        });

        it('initial mapSelected has length 6 and all false', () => {
            expect(game.mapSelected).toEqual([false, false, false, false, false, false]);
            expect(game.mapSelected.length).toBe(6);
        });

        it('activates exactly the chosen map index (1-based)', () => {
            game.updateMapSelection(3);
            expect(game.mapSelected).toEqual([false, false, false, true, false, false]);
            game.updateMapSelection(1);
            expect(game.mapSelected).toEqual([false, true, false, false, false, false]);
        });

        it('selecting 5 keeps length 6', () => {
            game.updateMapSelection(5);
            expect(game.mapSelected.length).toBe(6);
            expect(game.mapSelected[5]).toBe(true);
        });

        it('boundary at 6 expands array to length 7', () => {
            game.updateMapSelection(6);
            expect(game.mapSelected.length).toBe(7);
            expect(game.mapSelected[6]).toBe(true);
        });

        it('ignores out‑of‑range values', () => {
            game.mapSelected = [true, true, true, true, true, true];
            game.updateMapSelection(0);
            expect(game.mapSelected).toEqual([true, true, true, true, true, true]);
            game.updateMapSelection(7);
            expect(game.mapSelected).toEqual([true, true, true, true, true, true]);
        });
    });

    describe('saveGameState() / loadGameState()', () => {
        let game;
        beforeEach(() => {
            localStorage.clear();
            game = new Game(canvas, canvas.width, canvas.height);
            game.coins = 42;
            game.map3Unlocked = true;
            game.gameCompleted = true;
            game.mapSelected = [true, false, true, false, false, false];
            game.selectedDifficulty = 'Hard';
            game.menu.skins.currentSkin = { id: 'zabka' };
            game.menu.audioSettings.getState = () => ({ foo: 'bar' });
            game.menu.ingameAudioSettings.getState = () => ({ baz: 'qux' });
        });

        it('writes the expected shape into localStorage', () => {
            game.saveGameState();
            const item = localStorage.getItem('gameState');
            expect(item).not.toBeNull();
            const snapshot = JSON.parse(item);
            expect(snapshot.coins).toBe(42);
            expect(snapshot.map3Unlocked).toBe(true);
            expect(snapshot.currentSkin).toBe('zabka');
            expect(snapshot.selectedDifficulty).toBe('Hard');
            expect(snapshot.audioSettingsState).toEqual({ foo: 'bar' });
            expect(snapshot.ingameAudioSettingsState).toEqual({ baz: 'qux' });
            expect(snapshot.mapSelected).toEqual([true, false, true, false, false, false]);
            expect(snapshot.gameCompleted).toBe(true);
        });

        it('restores state from localStorage on loadGameState()', () => {
            const seed = {
                isTutorialActive: false,
                map2Unlocked: true,
                selectedDifficulty: 'Easy',
                gameCompleted: true,
                mapSelected: [false, true, false, false, false, false],
            };
            localStorage.setItem('gameState', JSON.stringify(seed));

            const g2 = new Game(canvas, canvas.width, canvas.height);
            expect(g2.coins).toBe(0);
            expect(g2.isTutorialActive).toBe(false);
            expect(g2.map2Unlocked).toBe(true);
            expect(g2.selectedDifficulty).toBe('Easy');
            expect(g2.gameCompleted).toBe(true);
        });

        it('loadGameState() calls menu.setState and skins.setCurrentSkinById and levelDifficulty.setDifficulty', () => {
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

        it('constructor loadGameState() applies omitted flags immediately', () => {
            const partial = { map5Unlocked: true };
            localStorage.setItem('gameState', JSON.stringify(partial));
            const g4 = new Game(canvas, canvas.width, canvas.height);
            expect(g4.map5Unlocked).toBe(true);
            expect(g4.map4Unlocked).toBe(false);
        });
    });

    describe('clearSavedData()', () => {
        it('clears localStorage and resets all unlocks back to defaults, and calls all menu resets', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            game.menu.forestMap.resetSelectedCircleIndex = jest.fn();
            game.menu.levelDifficulty.setDifficulty = jest.fn();
            game.menu.skins.setCurrentSkinById = jest.fn();
            game.menu.audioSettings.setState = jest.fn();
            game.menu.ingameAudioSettings.setState = jest.fn();

            localStorage.setItem('gameState', '{"foo":123}');
            game.clearSavedData();

            expect(localStorage.getItem('gameState')).toBeNull();
            expect(game.isTutorialActive).toBe(true);
            expect(game.map1Unlocked).toBe(true);
            expect(game.map2Unlocked).toBe(false);
            expect(game.map3Unlocked).toBe(false);
            expect(game.map4Unlocked).toBe(false);
            expect(game.map5Unlocked).toBe(false);
            expect(game.map6Unlocked).toBe(false);
            expect(game.gameCompleted).toBe(false);

            expect(game.menu.forestMap.resetSelectedCircleIndex).toHaveBeenCalled();
            expect(game.menu.enemyLore.currentPage).toBe(0);
            expect(game.menu.levelDifficulty.setDifficulty).toHaveBeenCalledWith('Normal');
            expect(game.menu.skins.currentSkin).toBe(game.menu.skins.defaultSkin);
            expect(game.menu.skins.setCurrentSkinById).toHaveBeenCalledWith('player');
            expect(game.menu.audioSettings.setState)
                .toHaveBeenCalledWith({ volumeLevels: [75, 10, 90, 90, 70, 60, null] });
            expect(game.menu.ingameAudioSettings.setState)
                .toHaveBeenCalledWith({ volumeLevels: [30, 80, 60, 40, 80, 65, null] });
        });
    });

    describe('startCutscene()', () => {
        it('marks it as fadingIn, active, and sets currentCutscene', () => {
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

        it('when player not in cabin, clears cutscene but does not trigger menu', () => {
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

        it('when player in cabin & not Map6, resets and shows forestMap, then re‑enables after 4s', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            game.player.x = 300;
            game.player.width = 50;
            game.cabin = { x: 100, width: 200 };
            game.background = { constructor: { name: 'NotMap6' }, totalDistanceTraveled: game.maxDistance };
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
            expect(game.menu.forestMap.selectedCircleIndex).toBe(1);
        });

        it('when player in cabin & background is Map6, resets and shows main menu, then re‑enables', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            game.player.x = 300;
            game.player.width = 50;
            game.cabin = { x: 100, width: 200 };
            game.background = new Map6(game);
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

    describe('reset()', () => {
        it('delegates to resetInstance.reset()', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            game.resetInstance = { reset: jest.fn() };
            game.reset();
            expect(game.resetInstance.reset).toHaveBeenCalled();
        });
    });

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

        it('addCabin(): pushes cabin and sets flags, only once', () => {
            game.addCabin();
            game.addCabin();
            expect(game.cabins).toHaveLength(1);
            expect(game.cabinAppeared).toBe(true);
            expect(game.fixedCabinX).toBe(game.width - game.cabin.width);
        });

        it('addPenguin(): pushes penguin and sets flags, only once', () => {
            game.addPenguin();
            game.addPenguin();
            expect(game.penguins).toHaveLength(1);
            expect(game.penguinAppeared).toBe(true);
            expect(game.fixedPenguinX).toBe(game.width - game.cabin.width - 100);
            expect(game.talkToPenguin).toBe(true);
        });
    });

    describe('addPowerUp()', () => {
        let game;
        beforeEach(() => {
            jest.spyOn(Math, 'random').mockReturnValue(0);
            game = new Game(canvas, canvas.width, canvas.height);
            game.background = { constructor: { name: 'NotMap6' }, totalDistanceTraveled: 0 };
            game.player.isBluePotionActive = false;
            game.player.isUnderwater = true;
            game.powerUps = [];
        });
        afterEach(() => {
            Math.random.mockRestore();
        });

        it('spawns all types when random < threshold and not Map6', () => {
            game.speed = 10;
            game.addPowerUp();
            expect(game.powerUps.some(p => p instanceof RedPotion)).toBe(true);
            expect(game.powerUps.some(p => p instanceof BluePotion)).toBe(true);
            expect(game.powerUps.some(p => p instanceof HealthLive)).toBe(true);
            expect(game.powerUps.some(p => p instanceof Coin)).toBe(true);
            expect(game.powerUps.some(p => p instanceof OxygenTank)).toBe(true);
        });

        it('does nothing if on Map6', () => {
            game.background = new Map6(game);
            game.powerUps = [];
            game.addPowerUp();
            expect(game.powerUps).toHaveLength(0);
        });

        it('does not spawn when speed is zero', () => {
            game.speed = 0;
            game.addPowerUp();
            expect(game.powerUps).toHaveLength(0);
        });

        it('does not spawn when too close to maxDistance', () => {
            game.speed = 10;
            game.background.totalDistanceTraveled = game.maxDistance - 2;
            game.addPowerUp();
            expect(game.powerUps).toHaveLength(0);
        });
    });

    describe('addPowerDown()', () => {
        let game;
        beforeEach(() => {
            jest.spyOn(Math, 'random').mockReturnValue(0);
            game = new Game(canvas, canvas.width, canvas.height);
            game.background = { constructor: { name: 'NotMap6' }, totalDistanceTraveled: 0 };
            game.speed = 10;
            game.player.isBlackHoleActive = false;
            game.powerDowns = [];
        });
        afterEach(() => {
            Math.random.mockRestore();
        });

        it('spawns all power‑downs when random < threshold and not Map6', () => {
            game.addPowerDown();
            expect(game.powerDowns.some(p => p instanceof Drink)).toBe(true);
            expect(game.powerDowns.some(p => p instanceof Cauldron)).toBe(true);
            expect(game.powerDowns.some(p => p instanceof BlackHole)).toBe(true);
        });

        it('does nothing if on Map6', () => {
            game.background = new Map6(game);
            game.powerDowns = [];
            game.addPowerDown();
            expect(game.powerDowns).toHaveLength(0);
        });

        it('does not spawn when speed is zero', () => {
            game.speed = 0;
            game.addPowerDown();
            expect(game.powerDowns).toHaveLength(0);
        });

        it('does not spawn when too close to maxDistance', () => {
            game.speed = 10;
            game.background.totalDistanceTraveled = game.maxDistance - 2;
            game.addPowerDown();
            expect(game.powerDowns).toHaveLength(0);
        });

        it('does not spawn BlackHole when already active', () => {
            game.player.isBlackHoleActive = true;
            game.powerDowns = [];
            game.addPowerDown();
            expect(game.powerDowns.some(p => p instanceof BlackHole)).toBe(false);
        });
    });

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

        it('does nothing if gameOver is true', () => {
            game.gameOver = true;
            game.background = { totalDistanceTraveled: 0, constructor: { name: 'Map1' } };
            game.addEnemy();
            expect(game.enemies).toHaveLength(0);
        });

        it('does nothing if too close to maxDistance', () => {
            game.gameOver = false;
            game.background = { totalDistanceTraveled: game.maxDistance, constructor: { name: 'Map1' } };
            game.addEnemy();
            expect(game.enemies).toHaveLength(0);
        });

        it('does nothing on Map6 when coins reached', () => {
            game.gameOver = false;
            game.background = new Map6(game);
            game.coins = game.winningCoins;
            game.addEnemy();
            expect(game.enemies).toHaveLength(0);
        });

        it('spawns a Goblin when random < probability on Map1', () => {
            game.gameOver = false;
            game.background = { totalDistanceTraveled: 0, constructor: { name: 'Map1' } };
            game.addEnemy();
            expect(game.enemies.length).toBeGreaterThan(0);
            expect(game.enemies[0]).toBeInstanceOf(Goblin);
        });

        it('spawns Elyvorg on Map6 once you have enough coins', () => {
            Math.random.mockReturnValue(0.6);
            game.enemies = [];
            game.background = new Map6(game);
            game.coins = game.winningCoins;
            game.elyvorgSpawned = false;
            game.addEnemy();
            expect(game.enemies).toHaveLength(1);
            expect(game.enemies[0]).toBeInstanceOf(Elyvorg);
            expect(game.elyvorgSpawned).toBe(true);
            expect(game.talkToElyvorg).toBe(true);
        });

        it('spawns Goblin on Map6 when coins < winningCoins', () => {
            game.background = new Map6(game);
            game.coins = 0;
            game.enemies = [];
            game.addEnemy();
            expect(game.enemies.some(e => e instanceof Goblin)).toBe(true);
        });

        it('does not add a second ImmobileGroundEnemy instance too close', () => {
            const fake = new ImmobileGroundEnemy(game);
            fake.x = 100; fake.y = 100; fake.width = 50; fake.height = 50;
            game.enemies = [fake];
            jest.spyOn(Math, 'random').mockReturnValue(0);
            game.background = { totalDistanceTraveled: 0, constructor: { name: 'Map1' } };
            game.maxEnemies = 2;
            game.addEnemy();
            const igCount = game.enemies.filter(e => e instanceof ImmobileGroundEnemy).length;
            expect(igCount).toBe(1);
        });

        it('does not spawn when maxEnemies reached', () => {
            game.maxEnemies = 0;
            game.background = { totalDistanceTraveled: 0, constructor: { name: 'Map1' } };
            game.addEnemy();
            expect(game.enemies).toHaveLength(0);
        });
    });

    describe('update() tutorial & timeout behavior', () => {
        it('calls tutorial.update when tutorial active & map 1 selected', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            game.isTutorialActive = true;
            game.mapSelected = [false, true, false, false, false, false];
            game.tutorial.update = jest.fn();
            game.menu.pause.isPaused = false;
            game.tutorial.tutorialPause = false;
            game.background = { update: () => { }, totalDistanceTraveled: 0 };
            game.cabin = { isFullyVisible: false };
            game.player = { update: () => { }, isUnderwater: false };
            game.update(16);
            expect(game.tutorial.update).toHaveBeenCalledWith(16);
            expect(game.noDamageDuringTutorial).toBe(true);
        });

        it('does not call tutorial.update when tutorial inactive', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            game.isTutorialActive = false;
            game.mapSelected = [false, true, false, false, false, false];
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

        it('sets gameOver when time > maxTime underwater', () => {
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

        it('filters out markedForDeletion entities after update', () => {
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

    describe('update() cutscene triggering', () => {
        it('triggers in‑game penguin cutscene when flags set for Map1', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            jest.spyOn(game, 'startCutscene');
            game.talkToPenguin = true;
            game.talkToPenguinOneTimeOnly = true;
            game.enterToTalkToPenguin = true;
            game.background = { constructor: { name: 'Map1' }, update: () => { } };
            game.player = { update: () => { } };
            game.menu.pause.isPaused = false;
            game.tutorial.tutorialPause = false;
            game.cabin = { isFullyVisible: false };
            game.update(0);
            expect(game.startCutscene).toHaveBeenCalled();
            expect(game.cutscenes.some(c => c instanceof Map1PenguinIngameCutscene)).toBe(true);
            expect(game.enterToTalkToPenguin).toBe(false);
        });

        it('triggers in‑game penguin cutscene when flags set for Map2', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            jest.spyOn(game, 'startCutscene');
            game.talkToPenguin = true;
            game.talkToPenguinOneTimeOnly = true;
            game.enterToTalkToPenguin = true;
            game.background = { constructor: { name: 'Map2' }, update: () => { } };
            game.player = { update: () => { } };
            game.menu.pause.isPaused = false;
            game.tutorial.tutorialPause = false;
            game.cabin = { isFullyVisible: false };
            game.update(0);
            expect(game.cutscenes.some(c => c instanceof Map2PenguinIngameCutscene)).toBe(true);
        });

        it('triggers in‑game penguin cutscene when flags set for Map3', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            jest.spyOn(game, 'startCutscene');
            game.talkToPenguin = true;
            game.talkToPenguinOneTimeOnly = true;
            game.enterToTalkToPenguin = true;
            game.background = { constructor: { name: 'Map3' }, update: () => { } };
            game.player = { update: () => { } };
            game.menu.pause.isPaused = false;
            game.tutorial.tutorialPause = false;
            game.cabin = { isFullyVisible: false };
            game.update(0);
            expect(game.cutscenes.some(c => c instanceof Map3PenguinIngameCutscene)).toBe(true);
        });

        it('triggers in‑game penguin cutscene when flags set for Map4', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            jest.spyOn(game, 'startCutscene');
            game.talkToPenguin = true;
            game.talkToPenguinOneTimeOnly = true;
            game.enterToTalkToPenguin = true;
            game.background = { constructor: { name: 'Map4' }, update: () => { } };
            game.player = { update: () => { } };
            game.menu.pause.isPaused = false;
            game.tutorial.tutorialPause = false;
            game.cabin = { isFullyVisible: false };
            game.update(0);
            expect(game.cutscenes.some(c => c instanceof Map4PenguinIngameCutscene)).toBe(true);
        });

        it('triggers in‑game penguin cutscene when flags set for Map5', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            jest.spyOn(game, 'startCutscene');
            game.talkToPenguin = true;
            game.talkToPenguinOneTimeOnly = true;
            game.enterToTalkToPenguin = true;
            game.background = { constructor: { name: 'Map5' }, update: () => { } };
            game.player = { update: () => { } };
            game.menu.pause.isPaused = false;
            game.tutorial.tutorialPause = false;
            game.cabin = { isFullyVisible: false };
            game.update(0);
            expect(game.cutscenes.some(c => c instanceof Map5PenguinIngameCutscene)).toBe(true);
        });

        it('triggers in‑game penguin cutscene when flags set for Map6', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            jest.spyOn(game, 'startCutscene');
            game.talkToPenguin = true;
            game.talkToPenguinOneTimeOnly = true;
            game.enterToTalkToPenguin = true;
            game.background = { constructor: { name: 'Map6' }, update: () => { } };
            game.player = { update: () => { } };
            game.menu.pause.isPaused = false;
            game.tutorial.tutorialPause = false;
            game.cabin = { isFullyVisible: false };
            game.update(0);
            expect(game.cutscenes.some(c => c instanceof Map6PenguinIngameCutscene)).toBe(true);
        });

        it('triggers Elyvorg pre‑fight cutscene on Map6', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            jest.spyOn(game, 'startCutscene');
            game.background = new Map6(game);
            game.isElyvorgFullyVisible = true;
            game.elyvorgDialogueBeforeDialoguePlayOnce = true;
            game.player = { update: () => { }, x: 0, width: 0 };
            game.menu.pause.isPaused = false;
            game.tutorial.tutorialPause = false;
            game.cabin = { isFullyVisible: false };
            game.background.update = () => { };
            game.update(0);
            expect(game.startCutscene).toHaveBeenCalled();
            expect(game.cutscenes.some(c => c instanceof Map6ElyvorgIngameCutsceneBeforeFight)).toBe(true);
            expect(game.elyvorgDialogueBeforeDialoguePlayOnce).toBe(false);
        });

        it('triggers Elyvorg post‑fight cutscene on Map6', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            jest.spyOn(game, 'startCutscene');
            game.background = new Map6(game);
            game.isElyvorgFullyVisible = true;
            game.elyvorgDialogueBeforeDialoguePlayOnce = false;
            game.elyvorgDialogueAfterDialoguePlayOnce = true;
            game.elyvorgStartAfterDialogueOnlyWhenAnimationEnds = true;
            game.player = { update: () => { }, x: 0, width: 0 };
            game.menu.pause.isPaused = false;
            game.tutorial.tutorialPause = false;
            game.cabin = { isFullyVisible: false };
            game.background.update = () => { };
            game.update(0);
            expect(game.startCutscene).toHaveBeenCalled();
            expect(game.cutscenes.some(c => c instanceof Map6ElyvorgIngameCutsceneAfterFight)).toBe(true);
            expect(game.elyvorgDialogueAfterDialoguePlayOnce).toBe(false);
        });

        it('sets enterCabin to 500 and openDoor to "submarineDoorOpening" for Map3', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            game.saveGameState = jest.fn();
            jest.spyOn(game.audioHandler.cutsceneSFX, 'playSound');
            game.background = new Map3(game);
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
        ].forEach(({ name, cls }) => {
            it(`triggers end‑of‑map cutscene for ${name}`, () => {
                const game = new Game(canvas, canvas.width, canvas.height);
                game.saveGameState = jest.fn();
                jest.spyOn(game, 'startCutscene');
                game.background = { constructor: { name }, update: () => { } };
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

        it('triggers end‑of‑map cutscene when player enters cabin', () => {
            const game = new Game(canvas, canvas.width, canvas.height);
            game.saveGameState = jest.fn();
            jest.spyOn(game, 'startCutscene');
            game.background = { constructor: { name: 'Map2' }, update: () => { } };
            game.cabin = { isFullyVisible: true, x: 100, width: 1000 };
            game.player = { update: () => { }, x: 500, width: 10 };
            game.menu.pause.isPaused = false;
            game.tutorial.tutorialPause = false;
            game.update(0);
            expect(game.startCutscene).toHaveBeenCalled();
            expect(game.currentCutscene).toBeInstanceOf(Map2EndCutscene);
            expect(game.isEndCutscene).toBe(true);
            expect(game.isPlayerInGame).toBe(false);
        });
    });

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

        it('clears canvas and calls all draw methods', () => {
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
            expect(game.UI.draw).toHaveBeenCalledWith(ctx);
        });

        it('draws underwater overlay when player.isUnderwater', () => {
            game.player.isUnderwater = true;
            game.player.isInvisible = false;
            game.elyvorgInFight = false;
            game.draw(ctx);
            expect(ctx.fillRect).toHaveBeenCalledTimes(2);
        });

        it('draws poison overlay when Elyvorg in fight', () => {
            game.player.isUnderwater = false;
            game.player.isInvisible = false;
            game.elyvorgInFight = true;
            game.poisonScreen = true;
            game.poisonColourOpacity = 0.5;
            game.draw(ctx);
            expect(ctx.fillRect).toHaveBeenCalledTimes(2);
        });

        it('draws invisible overlay when player.isInvisible', () => {
            game.player.isUnderwater = false;
            game.elyvorgInFight = false;
            game.player.isInvisible = true;
            game.invisibleColourOpacity = 0.3;
            game.draw(ctx);
            expect(ctx.fillRect).toHaveBeenCalledTimes(1);
        });
    });

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

        it('does nothing when paused', () => {
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

        it('fades out “elyvorg_meteor_falling_sound” when no MeteorAttack present', () => {
            game.audioHandler.enemySFX.isPlaying = jest.fn(name => name === 'elyvorg_meteor_falling_sound');
            game.audioHandler.enemySFX.fadeOutAndStop = jest.fn();
            game.audioHandler.enemySFX.stopSound = jest.fn();

            game.update(1);

            expect(game.audioHandler.enemySFX.fadeOutAndStop)
                .toHaveBeenCalledWith('elyvorg_meteor_falling_sound', 2000);
        });

        it('stops goblinRunSound when no Goblin in enemies', () => {
            game.audioHandler.enemySFX.isPlaying = jest.fn(() => true);
            game.audioHandler.enemySFX.stopSound = jest.fn();
            game.audioHandler.enemySFX.fadeOutAndStop = jest.fn();

            game.update(1);

            expect(game.audioHandler.enemySFX.stopSound)
                .toHaveBeenCalledWith('goblinRunSound');
        });
    });

    describe('addPowerUp() edge‑cases', () => {
        let game;
        beforeEach(() => {
            jest.spyOn(Math, 'random').mockReturnValue(0);
            game = new Game(canvas, canvas.width, canvas.height);
            game.background = { constructor: { name: 'NotMap6' }, totalDistanceTraveled: 0 };
            game.speed = 10;
        });
        afterEach(() => Math.random.mockRestore());

        it('does not spawn BluePotion if player.isBluePotionActive is true', () => {
            game.player.isBluePotionActive = true;
            game.player.isUnderwater = false;
            game.powerUps = [];
            game.addPowerUp();
            expect(game.powerUps.some(p => p instanceof BluePotion)).toBe(false);
        });

        it('does not spawn OxygenTank when player.isUnderwater is false', () => {
            game.player.isBluePotionActive = false;
            game.player.isUnderwater = false;
            game.powerUps = [];
            game.addPowerUp();
            expect(game.powerUps.some(p => p instanceof OxygenTank)).toBe(false);
        });
    });
});
