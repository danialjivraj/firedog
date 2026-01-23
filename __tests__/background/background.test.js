import {
    Layer,
    Background,
    RaindropAnimation,
    RaindropSplashAnimation,
    Firefly,
    SmallFish,
    BigFish,
    Map1,
    Map2,
    Map3,
    Map4,
    Map5,
    Map6,
    Map7,
    SnowflakeAnimation,
    BonusMap1,
    BonusMap2,
    BonusMap3,
    EntityAnimation,
    MovingLayer,
    BubbleAnimation,
    StarField,
    ShootingStar,
    DragonSilhouette,
    MeteorBackground,
    Map3Zabby1FlyBy,
} from '../../game/background/background.js';

function makeSoundtrack() {
    return { playSound: jest.fn(), fadeOutAndStop: jest.fn() };
}

function makeGame(overrides = {}) {
    const base = {
        width: 1920,
        height: 689,
        speed: 1,
        groundMargin: 50,
        cabin: { isFullyVisible: false },
        isBossVisible: false,
        isTutorialActive: false,
        currentMap: 'Map1',
        player: { isUnderwater: false },
        audioHandler: { mapSoundtrack: makeSoundtrack() },
    };

    return {
        ...base,
        ...overrides,
        cabin: { ...base.cabin, ...(overrides.cabin || {}) },
        player: { ...base.player, ...(overrides.player || {}) },
        audioHandler: {
            ...base.audioHandler,
            ...(overrides.audioHandler || {}),
            mapSoundtrack: overrides.audioHandler?.mapSoundtrack || base.audioHandler.mapSoundtrack,
        },
    };
}

function setElSize(id, w, h) {
    const el = document.getElementById(id);
    if (!el) return;
    Object.defineProperty(el, 'width', { value: w, configurable: true });
    Object.defineProperty(el, 'height', { value: h, configurable: true });
}

function seedDomImages() {
    const ids = [
        // fish / water
        'fish',
        'fish2',
        'fish3',
        'fish4',
        'fish5',
        'fish6',
        'fish7',
        'fish8',
        'fish9',
        'fish10',
        'fish11',
        'jellyfish',
        'shark',
        'whale',

        // rain splash sprite
        'raindropSplash',

        // generic test images
        'A',
        'B',

        // map1
        'map1Background',
        'map1Trees7',
        'map1Trees1',
        'map1Trees2',
        'map1Trees5',
        'map1Trees3',
        'map1Trees4',
        'map1Rocks',
        'map1Bush',
        'map1Trees6',
        'map1Ground',
        // zabby
        'map1Zabby1',
        'map1Zabby2',
        'map1Zabby3',

        // map2
        'map2Background',
        'map2BackgroundLayer1',
        'map2Trees',
        'map2Ground',
        'map2Bones1',
        'map2Bones2',
        'map2Bones3',
        'map2Bushes1',
        'map2Bushes2',
        'map2Bushes3',
        'map2Bushes4',
        'map2Trees1',
        'map2Trees2',
        'map2Trees3',
        'map2WhiteMist',
        'map2Fence1',
        'map2Fence2',
        'map2Tombstone1',
        'map2Tombstone2',
        'map2Tombstone3',
        // zabby
        'map2Zabby1',
        'map2Zabby2',
        'map2Zabby3',
        'map2Zabby4',
        'map2Zabby5',

        // map3
        'map3Background',
        'map3BackgroundRocks',
        'map3seaPlants1',
        'map3seaPlants2',
        'map3seaPlants3',
        'map3seaPlants4',
        'map3seaPlants5',
        'map3seaPlants6',
        'map3seaPlants7',
        'map3seaPlants8',
        'map3seaPlants9',
        'map3Ground',
        // zabby
        'map3Zabby1',
        'map3Zabby2',
        'map3Zabby3',
        'map3Zabby4',
        'map3Zabby5',

        // map4
        'map4Background',
        'map4BottomVines',
        'map4Trees3',
        'map4Trees4',
        'map4Trees2',
        'map4Trees1',
        'map4TopVines',
        'map4Ground',
        // zabby
        'map4Zabby1',
        'map4Zabby2',
        'map4Zabby3',
        'map4Zabby4',

        // map5
        'map5Background',
        'map5TallGrass',
        'map5BigSunflowers1',
        'map5BigSunflowers2',
        'map5Trees1',
        'map5Trees2',
        'map5Trees3',
        'map5Trees4',
        'map5Bush1',
        'map5Bush2',
        'map5Flowers1',
        'map5Flowers2',
        'map5Cattails',
        'map5Ground',
        // zabby
        'map5Zabby1',
        'map5Zabby2',
        'map5Zabby3',
        'map5Zabby4',

        // map6
        'map6Background',
        'map6GreenMist',
        'map6Trees1',
        'map6Trees2',
        'map6Trees3',
        'map6Trees4',
        'map6BigMushrooms',
        'map6Rocks1',
        'map6Rocks2',
        'map6DeadBranches1',
        'map6DeadBranches2',
        'map6SmallMushrooms1',
        'map6SmallMushrooms2',
        'map6Grass',
        'map6Ground',
        // zabby
        'map6Zabby1',
        'map6Zabby2',
        'map6Zabby3',

        // map7
        'map7Background',
        'map7rocks1',
        'map7rocks2',
        'map7rocks3',
        'map7rocks4',
        'map7cactus',
        'map7spikeStones',
        'map7Ground',
        'map7VolcanoLayer1',
        'map7VolcanoLayer2',
        'map7VolcanoLayer3',
        'map7VolcanoLayer4',
        'map7VolcanoLayer5',
        // zabby
        'map7Zabby1',
        'map7Zabby2',
        'map7Zabby3',
        'map7Zabby4',
        'map7Zabby5',

        // bonusMap1
        'bonusMap1Background',
        'bonusMap1Ground',
        'bonusMap1IceRings',
        'bonusMap1BigIceCrystal',
        'bonusMap1IceRocks1',
        'bonusMap1IceRocks2',
        'bonusMap1TopIcicles',
        'bonusMap1IceSpikes',
        // zabby
        'bonusMap1Zabby1',
        'bonusMap1Zabby2',
        'bonusMap1Zabby3',
        'bonusMap1Zabby4',

        // bonusMap2
        'bonusMap2Background',
        'bonusMap2RedMist',
        'bonusMap2RockLayer1',
        'bonusMap2RockLayer2',
        'bonusMap2RockLayer3',
        'bonusMap2RockLayer4',
        'bonusMap2RockLayer5',
        'bonusMap2CrypticRocks1',
        'bonusMap2CrypticRocks2',
        'bonusMap2DeadTrees',
        'bonusMap2SpikeRocks',
        'bonusMap2Ground',
        // zabby
        'bonusMap2Zabby1',
        'bonusMap2Zabby2',
        'bonusMap2Zabby3',
        'bonusMap2Zabby4',

        // bonusMap3
        'bonusMap3Background',
        'bonusMap3Stars',
        'bonusMap3Planets1',
        'bonusMap3Planets2',
        'bonusMap3Planets3',
        'bonusMap3Planets4',
        'bonusMap3Planets5',
        'bonusMap3Planets6',
        'bonusMap3Nebula',
        'bonusMap3PurpleSpiral',
        'bonusMap3Ground',
        // zabby
        'bonusMap3Zabby1',
        'bonusMap3Zabby2',
        'bonusMap3Zabby3',
        'bonusMap3Zabby4',
        'bonusMap3Zabby5',

        // sprites
        'dragonSilhouette',
        'meteorBackground',
    ];

    document.body.innerHTML = ids.map((id) => `<img id="${id}" width="64" height="64"/>`).join('');

    // fish sprites
    [
        'fish',
        'fish2',
        'fish3',
        'fish4',
        'fish5',
        'fish6',
        'fish7',
        'fish8',
        'fish9',
        'fish10',
        'fish11',
        'jellyfish',
    ].forEach((id) => setElSize(id, 64, 32));

    setElSize('shark', 120, 60);
    setElSize('whale', 160, 80);

    // rain sprite sheet
    setElSize('raindropSplash', 120, 20);

    // other sprites
    setElSize('dragonSilhouette', 635, 50);
    setElSize('meteorBackground', 47, 47);
}

beforeAll(() => {
    seedDomImages();
    jest.spyOn(Firefly.prototype, 'spawnNewFirefly').mockImplementation(() => { });
    jest.spyOn(SmallFish.prototype, 'spawnNewFish').mockImplementation(() => { });
});

afterAll(() => {
    Firefly.prototype.spawnNewFirefly.mockRestore();
    SmallFish.prototype.spawnNewFish.mockRestore();
});

afterEach(() => {
    jest.clearAllMocks();
});

// -----------------------------------------------------------------------------
// Layer
// -----------------------------------------------------------------------------
describe('Layer', () => {
    let game, ctx;

    beforeEach(() => {
        game = { width: 1920, height: 689, speed: 2 };
        ctx = { drawImage: jest.fn() };
    });

    describe('construction', () => {
        test('initializes position, speed, and flags', () => {
            const img = { width: 100, height: 50 };
            const layer = new Layer(game, 1.5, img);

            expect(layer.x).toBe(0);
            expect(layer.y).toBe(0);
            expect(layer.groundSpeed).toBe(0);
            expect(layer.isRaining).toBe(false);
        });
    });

    describe('scrolling and tiling', () => {
        test('update computes groundSpeed and scrolls x; wraps when passing -width', () => {
            const img = { width: 100, height: 50 };
            const layer = new Layer(game, 1.5, img);

            layer.update();
            expect(layer.groundSpeed).toBe(3);
            expect(layer.x).toBe(-3);

            layer.x = -1919;
            layer.update();
            expect(layer.x).toBe(-2);
        });

        test('does not hang on tiny widths and still wraps', () => {
            const img = { width: 100, height: 50 };
            const layer = new Layer({ ...game, width: 1, speed: 5 }, 1, img);

            layer.x = -1;
            layer.update();

            expect(layer.groundSpeed).toBe(5);
            expect(layer.x).toBeGreaterThan(-1);
        });

        test('draw renders current and next segment seamlessly', () => {
            const img = { id: 'base', width: 100, height: 50 };
            const layer = new Layer(game, 1.5, img);

            layer.x = -50;
            layer.draw(ctx);

            expect(ctx.drawImage).toHaveBeenNthCalledWith(1, layer.images[0], -50, 0, 1920, 689);
            expect(ctx.drawImage).toHaveBeenNthCalledWith(2, layer.images[0], 1870, 0, 1920, 689);
        });

        test('advances sequenceIndex on wrap when multiple images are provided', () => {
            const imgA = { id: 'a' };
            const imgB = { id: 'b' };
            const layer = new Layer(game, 1, [imgA, imgB]);

            layer.x = -game.width;
            layer.update();

            expect(layer.sequenceIndex).toBe(1);
        });
    });

    describe('one-shot insertion (Layer)', () => {
        test('setOneShotImages filters falsy values; getOneShotKeys returns ids', () => {
            const base = { id: 'base', width: 10, height: 10 };
            const layer = new Layer(game, 1, base);

            const z1 = document.getElementById('map1Zabby1');
            const z2 = document.getElementById('map1Zabby2');

            layer.setOneShotImages([null, z1, undefined, z2, false]);

            expect(layer.getOneShotKeys()).toEqual(['map1Zabby1', 'map1Zabby2']);
            expect(layer.hasOneShotCandidate()).toBe(true);
        });

        test('forceOneShotKey returns false for unknown key; true for known key; does not mutate candidates', () => {
            const base = { id: 'base', width: 10, height: 10 };
            const layer = new Layer(game, 1, base);

            const z1 = document.getElementById('map1Zabby1');
            const z2 = document.getElementById('map1Zabby2');
            layer.setOneShotImages([z1, z2]);

            expect(layer.forceOneShotKey('NOPE')).toBe(false);
            expect(layer.forceOneShotKey('map1Zabby2')).toBe(true);
            expect(layer.getOneShotKeys()).toEqual(['map1Zabby1', 'map1Zabby2']);
            expect(layer.scheduleOneShotInsert()).toBe(true);
        });

        test('scheduleOneShotInsert only succeeds from idle (second call fails)', () => {
            const base = { id: 'base', width: 10, height: 10 };
            const layer = new Layer(game, 1, base);

            const z1 = document.getElementById('map1Zabby1');
            layer.setOneShotImages([z1]);

            expect(layer.scheduleOneShotInsert()).toBe(true);
            expect(layer.scheduleOneShotInsert()).toBe(false);
        });

        test('one-shot is shown once and then becomes ineligible after queued → active → done', () => {
            const g = { width: 10, height: 10, speed: 10 };
            const baseA = { id: 'baseA' };
            const baseB = { id: 'baseB' };
            const z = document.getElementById('map1Zabby1');

            const layer = new Layer(g, 1, [baseA, baseB]);
            layer.setOneShotImages([z]);

            expect(layer.forceOneShotKey('map1Zabby1')).toBe(true);
            expect(layer.scheduleOneShotInsert()).toBe(true);

            layer.x = -10;
            layer.update(); // pending -> queued
            layer.x = -10;
            layer.update(); // queued -> active
            layer.x = -10;
            layer.update(); // active -> done

            expect(layer.hasOneShotCandidate()).toBe(false);
        });

        test('queued/active affect which images are drawn (one-shot becomes current immediately after first wrap)', () => {
            const g = { width: 10, height: 10, speed: 10 };
            const baseA = { id: 'baseA' };
            const baseB = { id: 'baseB' };
            const z = document.getElementById('map1Zabby1');

            const layer = new Layer(g, 1, [baseA, baseB]);
            layer.setOneShotImages([z]);
            layer.forceOneShotKey('map1Zabby1');
            layer.scheduleOneShotInsert();

            layer.x = -10;
            layer.update();

            let snap = layer._getCurrentAndNextImages();
            expect(snap.currentImg).toBe(z);

            layer.x = -10;
            layer.update();

            snap = layer._getCurrentAndNextImages();
            expect(snap.currentImg).not.toBe(z);
        });

        test('resetToDefaults clears one-shot state so it can be scheduled again', () => {
            const base = { id: 'base', width: 10, height: 10 };
            const layer = new Layer(game, 1, base);

            const z1 = document.getElementById('map1Zabby1');
            layer.setOneShotImages([z1]);

            expect(layer.scheduleOneShotInsert()).toBe(true);
            expect(layer.hasOneShotCandidate()).toBe(true);

            layer.resetToDefaults();

            expect(layer.hasOneShotCandidate()).toBe(true);
            expect(layer.scheduleOneShotInsert()).toBe(true);
        });
    });
});

// -----------------------------------------------------------------------------
// MovingLayer
// -----------------------------------------------------------------------------
describe('MovingLayer', () => {
    let game, ctx;

    beforeEach(() => {
        game = { width: 100, height: 50, speed: 2 };
        ctx = { drawImage: jest.fn() };
    });

    test('throws if no valid DOM images exist for the given id(s)', () => {
        expect(() => new MovingLayer(game, 0.5, 'DOES_NOT_EXIST', 1, 'left', 'x')).toThrow(
            /MovingLayer: no valid images found/
        );
    });

    test('moves left on x axis using baseScrollSpeed + parallax and wraps when x <= -width', () => {
        const layer = new MovingLayer(game, 0.5, 'A', 1, 'left', 'x');

        layer.x = -99;
        layer.update(0);

        expect(layer.x).toBeGreaterThan(-game.width);
        expect(layer.x).toBeLessThan(0);
    });

    test('moves right on x axis and wraps when x >= width', () => {
        const layer = new MovingLayer(game, 0.5, 'A', 1, 'right', 'x');

        layer.x = game.width;
        layer.update(0);

        expect(layer.x).toBeLessThan(game.width);
    });

    test('moves up on y axis and wraps when y <= -height', () => {
        const layer = new MovingLayer(game, 0.5, 'A', 0, 'up', 'y');

        layer.y = -game.height;
        layer.update(0);

        expect(layer.y).toBe(0);
    });

    test('moves down on y axis and wraps when y >= height', () => {
        const layer = new MovingLayer(game, 0.5, 'A', 0, 'down', 'y');

        layer.y = game.height;
        layer.update(0);

        expect(layer.y).toBeLessThan(game.height);
    });

    test('draw tiles along the configured axis', () => {
        const layerX = new MovingLayer(game, 0.5, 'A', 1, 'left', 'x');
        layerX.x = -10;
        layerX.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalledTimes(2);
        expect(ctx.drawImage).toHaveBeenNthCalledWith(
            1,
            layerX.images[0],
            expect.any(Number),
            layerX.y,
            game.width,
            game.height
        );

        const layerY = new MovingLayer(game, 0.5, 'A', 1, 'up', 'y');
        ctx.drawImage.mockClear();
        layerY.y = -10;
        layerY.draw(ctx);

        expect(ctx.drawImage).toHaveBeenCalledTimes(2);
        expect(ctx.drawImage).toHaveBeenNthCalledWith(
            1,
            layerY.images[0],
            layerY.x,
            expect.any(Number),
            game.width,
            game.height
        );
    });

    test('advances sequenceIndex on wrap when multiple images are provided', () => {
        const layer = new MovingLayer(game, 0.5, ['A', 'B'], 0, 'left', 'x');
        layer.x = -game.width;
        layer.update(0);
        expect(layer.sequenceIndex).toBe(1);
    });
});

// -----------------------------------------------------------------------------
// EntityAnimation
// -----------------------------------------------------------------------------
describe('EntityAnimation', () => {
    test('setOneShotImageIds stores ids and resets picked id', () => {
        const ent = new EntityAnimation({}, 0);
        ent._oneShotPickedId = 'already-picked';

        ent.setOneShotImageIds(['a', null, 'b', undefined]);

        expect(ent.getOneShotKeys()).toEqual(['a', 'b']);
        expect(ent._oneShotPickedId).toBe(null);
    });

    test('setOneShotGroup exposes group key via getOneShotKeys and forces preferred id', () => {
        const ent = new EntityAnimation({}, 0);

        ent.setOneShotGroup('GROUP_KEY', 'preferred_sprite_id');

        expect(ent.getOneShotKeys()).toEqual(['GROUP_KEY']);
        expect(ent.forceOneShotKey('NOPE')).toBe(false);
        expect(ent.forceOneShotKey('GROUP_KEY')).toBe(true);
        expect(ent._oneShotPickedId).toBe('preferred_sprite_id');
    });

    test('hasOneShotCandidate requires keys and not previously shown', () => {
        const ent = new EntityAnimation({}, 0);
        expect(ent.hasOneShotCandidate()).toBe(false);

        ent.setOneShotImageIds(['x']);
        expect(ent.hasOneShotCandidate()).toBe(true);

        ent._oneShotShown = true;
        expect(ent.hasOneShotCandidate()).toBe(false);
    });
});

// -----------------------------------------------------------------------------
// Background
// -----------------------------------------------------------------------------
describe('Background', () => {
    describe('construction', () => {
        test('throws when no valid images found for a layer config', () => {
            const game = makeGame({ width: 800, height: 600 });
            expect(() => new Background(game, { imageId: 'NOPE', bgSpeed: 1 })).toThrow(
                /Background: no valid images found/
            );
        });

        test('throws when zabbyId is provided but no valid zabby images exist', () => {
            const game = makeGame({ width: 800, height: 600 });
            expect(() => new Background(game, { imageId: 'A', bgSpeed: 1, zabbyId: 'NOPE' })).toThrow(
                /Background: no valid image found for zabbyId\(s\)/
            );
        });

        test('_getOneShotReferenceDistance uses boss gate minDistance when available; otherwise falls back to game.maxDistance', () => {
            const r = jest.spyOn(Math, 'random').mockReturnValue(0); // pct = 0.40

            const gameWithGate = makeGame({
                maxDistance: 10000,
                bossManager: {
                    getGateForMapName: jest.fn(() => ({ minDistance: 5000 })),
                },
            });

            class MapX extends Background { }
            const bgGate = new MapX(gameWithGate, { imageId: 'A', bgSpeed: 1 });
            expect(bgGate._oneShotTriggerDistance).toBeCloseTo(5000 * 0.40, 5);

            const gameFallback = makeGame({
                maxDistance: 10000,
                bossManager: {
                    getGateForMapName: jest.fn(() => ({ minDistance: 'not-a-number' })),
                },
            });

            const bgFallback = new Background(gameFallback, { imageId: 'A', bgSpeed: 1 });
            expect(bgFallback._oneShotTriggerDistance).toBeCloseTo(10000 * 0.40, 5);

            r.mockRestore();
        });
    });

    describe('audio playback', () => {
        test('plays soundtrack on first eligible update; fades out when cabin becomes visible', () => {
            const soundtrack = makeSoundtrack();
            const game = makeGame({ audioHandler: { mapSoundtrack: soundtrack } });

            const bg = new Background(game, { imageId: 'A', bgSpeed: 1 }, { imageId: 'B', bgSpeed: 0.5 });
            bg.soundId = 'testSound';

            bg.update(16);
            expect(soundtrack.playSound).toHaveBeenCalledWith(bg.soundId, true);
            expect(bg.soundPlayed).toBe(true);

            game.cabin.isFullyVisible = true;
            bg.update(16);

            expect(soundtrack.fadeOutAndStop).toHaveBeenCalledWith(bg.soundId);
            expect(bg.soundPlayed).toBe(false);
        });
    });

    describe('layer update rules when parallax is frozen', () => {
        test('when boss is visible, Layer instances do not update but RaindropAnimation continues updating', () => {
            const soundtrack = makeSoundtrack();
            const game = makeGame({ speed: 4, audioHandler: { mapSoundtrack: soundtrack } });

            const layerUpdateSpy = jest.spyOn(Layer.prototype, 'update');

            const bg = new Background(game, { imageId: 'A', bgSpeed: 1 }, { imageId: 'B', bgSpeed: 0.5 });
            bg.soundId = 'sfx';

            // prime audio state -> soundPlayed = true
            bg.update(0);
            expect(soundtrack.playSound).toHaveBeenCalled();

            // add rain layer and spy
            bg.backgroundLayers.push(new RaindropAnimation(game, 1));
            const rainUpdateSpy = jest.spyOn(RaindropAnimation.prototype, 'update');

            game.isBossVisible = true;

            layerUpdateSpy.mockClear();
            rainUpdateSpy.mockClear();

            bg.update(1);

            expect(soundtrack.fadeOutAndStop).toHaveBeenCalledWith('sfx');
            expect(layerUpdateSpy).not.toHaveBeenCalled();
            expect(rainUpdateSpy).toHaveBeenCalled();

            layerUpdateSpy.mockRestore();
            rainUpdateSpy.mockRestore();
        });

        test('EntityAnimation and SnowflakeAnimation still update when cabin is visible', () => {
            const game = makeGame();
            const bg = new Background(game, { imageId: 'A', bgSpeed: 1 });

            const ent = new (class extends EntityAnimation {
                constructor(g) {
                    super(g, 0);
                    this.updated = 0;
                    this.groundSpeed = 999;
                }
                update(dt) {
                    this.updated += dt;
                }
                draw() { }
            })(game);

            const snow = new SnowflakeAnimation(game, 1);

            jest.spyOn(ent, 'update');
            jest.spyOn(snow, 'update');

            bg.backgroundLayers = [ent, snow];
            game.cabin.isFullyVisible = true;

            bg.update(10);

            expect(ent.update).toHaveBeenCalledWith(10);
            expect(snow.update).toHaveBeenCalledWith(10);
        });

        test('MovingLayer still updates when cabin is visible', () => {
            const game = makeGame();
            const bg = new Background(game, { imageId: 'A', bgSpeed: 1 });

            const ml = new MovingLayer(game, 0.5, 'A', 1, 'left', 'x');
            jest.spyOn(ml, 'update');

            bg.backgroundLayers = [ml];
            game.cabin.isFullyVisible = true;

            bg.update(123);

            expect(ml.update).toHaveBeenCalledWith(123);
        });
    });

    describe('distance tracking', () => {
        test('totalDistanceTraveled increments only when ground layer exists and tutorial does not block scroll on Map1', () => {
            const game = makeGame({ speed: 200 });
            const bg = new Background(game, { imageId: 'A', bgSpeed: 1 });

            bg.totalDistanceTraveled = 0;
            game.isTutorialActive = false;
            game.currentMap = 'Map1';
            bg.update(1);
            expect(bg.totalDistanceTraveled).toBeCloseTo(0.2);

            bg.totalDistanceTraveled = 0;
            game.isTutorialActive = true;
            game.currentMap = 'Map1';
            bg.update(1);
            expect(bg.totalDistanceTraveled).toBe(0);

            bg.totalDistanceTraveled = 0;
            game.isTutorialActive = true;
            game.currentMap = 'Map2';
            bg.update(1);
            expect(bg.totalDistanceTraveled).toBeCloseTo(0.2);
        });
    });

    describe('draw', () => {
        test('draw calls draw(context) on each layer in order', () => {
            const game = makeGame();
            const bg = new Background(game, { imageId: 'A', bgSpeed: 1 }, { imageId: 'B', bgSpeed: 0.5 });

            const ctx = { drawImage: jest.fn() };
            const spies = bg.backgroundLayers.map((layer) =>
                jest.spyOn(layer, 'draw').mockImplementation(() => { })
            );

            bg.draw(ctx);

            spies.forEach((s) => expect(s).toHaveBeenCalledWith(ctx));
            spies.forEach((s) => s.mockRestore());
        });
    });

    describe('resetLayersByImageIds', () => {
        test('resets only matching layers when given a single id', () => {
            const game = makeGame();
            const bg = new Background(game, { imageId: 'A', bgSpeed: 1 }, { imageId: 'B', bgSpeed: 0.5 });

            const layerA = bg.backgroundLayers.find((l) => Array.isArray(l.imageIds) && l.imageIds.includes('A'));
            const layerB = bg.backgroundLayers.find((l) => Array.isArray(l.imageIds) && l.imageIds.includes('B'));

            layerA.defaultX = 10; layerA.defaultY = 20; layerA.defaultSequenceIndex = 1;
            layerA.x = 999; layerA.y = 888; layerA.sequenceIndex = 0; layerA.groundSpeed = 123;

            layerB.defaultX = 1; layerB.defaultY = 2; layerB.defaultSequenceIndex = 0;
            layerB.x = 777; layerB.y = 666; layerB.sequenceIndex = 0; layerB.groundSpeed = 321;

            bg.resetLayersByImageIds('A');

            expect(layerA.x).toBe(10);
            expect(layerA.y).toBe(20);
            expect(layerA.sequenceIndex).toBe(1);
            expect(layerA.groundSpeed).toBe(0);

            expect(layerB.x).toBe(777);
            expect(layerB.y).toBe(666);
            expect(layerB.groundSpeed).toBe(321);
        });

        test('accepts an array and resets multiple layers', () => {
            const game = makeGame();
            const bg = new Background(game, { imageId: 'A', bgSpeed: 1 }, { imageId: 'B', bgSpeed: 0.5 });

            const layerA = bg.backgroundLayers.find((l) => l.imageIds?.includes('A'));
            const layerB = bg.backgroundLayers.find((l) => l.imageIds?.includes('B'));

            layerA.x = 100;
            layerB.x = 200;

            bg.resetLayersByImageIds(['A', 'B']);

            expect(layerA.x).toBe(0);
            expect(layerB.x).toBe(0);
        });

        test('ignores layers without imageIds and does not throw', () => {
            const game = makeGame();
            const bg = new Background(game, { imageId: 'A', bgSpeed: 1 });

            bg.backgroundLayers.push({ foo: 'bar' });

            expect(() => bg.resetLayersByImageIds('A')).not.toThrow();
        });
    });

    describe('one-shot trigger selection (Background._maybeTriggerOneShot)', () => {
        test('one-shot trigger distance uses 40% and 80% when Math.random is 0 and 1', () => {
            const game = makeGame({ width: 800, height: 600, maxDistance: 10000 });

            const r = jest.spyOn(Math, 'random');

            // pct = 0.40
            r.mockReturnValueOnce(0);
            const bgMin = new Background(game, { imageId: 'A', bgSpeed: 1, zabbyId: ['map1Zabby1'] });
            expect(bgMin._oneShotTriggerDistance).toBeCloseTo(10000 * 0.40, 5);

            // pct = 0.80
            r.mockReturnValueOnce(1);
            const bgMax = new Background(game, { imageId: 'A', bgSpeed: 1, zabbyId: ['map1Zabby1'] });
            expect(bgMax._oneShotTriggerDistance).toBeCloseTo(10000 * 0.80, 5);

            r.mockRestore();
        });

        test('does nothing before trigger distance is reached', () => {
            const game = makeGame({ width: 800, height: 600 });
            const bg = new Background(game, { imageId: 'A', bgSpeed: 1, zabbyId: ['map1Zabby1'] });

            bg._oneShotTriggerDistance = 999;
            bg.totalDistanceTraveled = 0;

            const layer = bg.backgroundLayers.find((l) => l instanceof Layer);
            const s = jest.spyOn(layer, 'scheduleOneShotInsert');

            bg._maybeTriggerOneShot();

            expect(s).not.toHaveBeenCalled();
            expect(bg._oneShotTriggered).toBe(false);

            s.mockRestore();
        });

        test('is blocked when cabin is fully visible or boss is visible', () => {
            const base = makeGame({ width: 800, height: 600 });

            const bgCabin = new Background(
                { ...base, cabin: { isFullyVisible: true }, isBossVisible: false },
                { imageId: 'A', bgSpeed: 1, zabbyId: ['map1Zabby1'] }
            );
            bgCabin._oneShotTriggerDistance = 0;
            bgCabin.totalDistanceTraveled = 999;
            bgCabin._maybeTriggerOneShot();
            expect(bgCabin._oneShotTriggered).toBe(false);

            const bgBoss = new Background(
                { ...base, cabin: { isFullyVisible: false }, isBossVisible: true },
                { imageId: 'A', bgSpeed: 1, zabbyId: ['map1Zabby1'] }
            );
            bgBoss._oneShotTriggerDistance = 0;
            bgBoss.totalDistanceTraveled = 999;
            bgBoss._maybeTriggerOneShot();
            expect(bgBoss._oneShotTriggered).toBe(false);
        });

        test('triggers exactly once (second call is a no-op)', () => {
            const game = makeGame({ width: 800, height: 600 });
            const bg = new Background(game, { imageId: 'A', bgSpeed: 1, zabbyId: ['map1Zabby1'] });

            bg._oneShotTriggerDistance = 0;
            bg.totalDistanceTraveled = 999;

            const layer = bg.backgroundLayers.find((l) => l instanceof Layer);
            const spySchedule = jest.spyOn(layer, 'scheduleOneShotInsert');

            bg._maybeTriggerOneShot();
            expect(bg._oneShotTriggered).toBe(true);
            expect(spySchedule).toHaveBeenCalledTimes(1);

            bg._maybeTriggerOneShot();
            expect(spySchedule).toHaveBeenCalledTimes(1);

            spySchedule.mockRestore();
        });

        test('groups by key then chooses one carrier among carriers for that key', () => {
            const game = makeGame({ width: 800, height: 600 });

            class Carrier extends Layer {
                constructor(g, keyList) {
                    super(g, 0, { id: 'base' });
                    this.setOneShotImages(keyList.map((id) => document.getElementById(id)));
                    this.calls = { force: [], scheduled: 0 };
                }
                forceOneShotKey(k) {
                    this.calls.force.push(k);
                    return super.forceOneShotKey(k);
                }
                scheduleOneShotInsert() {
                    this.calls.scheduled++;
                    return super.scheduleOneShotInsert();
                }
            }

            const c1 = new Carrier(game, ['map1Zabby1', 'map1Zabby2']);
            const c2 = new Carrier(game, ['map1Zabby2']);

            const bg = new Background(game, c1, c2);

            bg._oneShotTriggerDistance = 0;
            bg.totalDistanceTraveled = 999;

            const r = jest.spyOn(Math, 'random');
            r.mockReturnValueOnce(0.9999); // choose last key
            r.mockReturnValueOnce(0.9999); // choose last carrier for that key

            bg._maybeTriggerOneShot();

            expect(bg._oneShotTriggered).toBe(true);
            const scheduledCount = c1.calls.scheduled + c2.calls.scheduled;
            expect(scheduledCount).toBe(1);

            r.mockRestore();
        });

        test('supports EntityAnimation-style carriers via triggerOneShot()', () => {
            const game = makeGame({ width: 800, height: 600 });

            class TriggerCarrier extends EntityAnimation {
                constructor(g) {
                    super(g, 0);
                    this._keys = ['map1Zabby1'];
                    this._has = true;
                    this.forceOneShotKey = jest.fn(() => true);
                    this.triggerOneShot = jest.fn(() => true);
                }
                getOneShotKeys() {
                    return this._keys;
                }
                hasOneShotCandidate() {
                    return this._has;
                }
                update() { }
                draw() { }
            }

            const carrier = new TriggerCarrier(game);
            const bg = new Background(game, { imageId: 'A', bgSpeed: 1 }, carrier);

            bg._oneShotTriggerDistance = 0;
            bg.totalDistanceTraveled = 999;

            const r = jest.spyOn(Math, 'random').mockReturnValue(0); // pick first key + first carrier

            bg._maybeTriggerOneShot();

            r.mockRestore();

            expect(bg._oneShotTriggered).toBe(true);
            expect(carrier.forceOneShotKey).toHaveBeenCalledWith('map1Zabby1');
            expect(carrier.triggerOneShot).toHaveBeenCalledTimes(1);
        });

        test('does not mark _oneShotTriggered if the chosen carrier fails to trigger', () => {
            const game = makeGame({ width: 800, height: 600 });

            class TriggerCarrier extends EntityAnimation {
                constructor(g) {
                    super(g, 0);
                    this._keys = ['map1Zabby1'];
                    this._has = true;
                    this.forceOneShotKey = jest.fn(() => true);
                    this.triggerOneShot = jest.fn(() => false);
                }
                getOneShotKeys() {
                    return this._keys;
                }
                hasOneShotCandidate() {
                    return this._has;
                }
                update() { }
                draw() { }
            }

            const carrier = new TriggerCarrier(game);
            const bg = new Background(game, { imageId: 'A', bgSpeed: 1 }, carrier);

            bg._oneShotTriggerDistance = 0;
            bg.totalDistanceTraveled = 999;

            const r = jest.spyOn(Math, 'random').mockReturnValue(0);

            bg._maybeTriggerOneShot();

            r.mockRestore();

            expect(bg._oneShotTriggered).toBe(false);
            expect(carrier.forceOneShotKey).toHaveBeenCalledWith('map1Zabby1');
            expect(carrier.triggerOneShot).toHaveBeenCalledTimes(1);
        });

        test('excludes carriers where hasOneShotCandidate() returns false', () => {
            const game = makeGame({ width: 800, height: 600 });

            class TriggerCarrier extends EntityAnimation {
                constructor(g, key, hasCandidate) {
                    super(g, 0);
                    this._keys = [key];
                    this._has = hasCandidate;
                    this.forceOneShotKey = jest.fn(() => true);
                    this.triggerOneShot = jest.fn(() => true);
                }
                getOneShotKeys() {
                    return this._keys;
                }
                hasOneShotCandidate() {
                    return this._has;
                }
                update() { }
                draw() { }
            }

            const good = new TriggerCarrier(game, 'map1Zabby1', true);
            const bad = new TriggerCarrier(game, 'map1Zabby2', false);

            const bg = new Background(game, { imageId: 'A', bgSpeed: 1 }, good, bad);

            bg._oneShotTriggerDistance = 0;
            bg.totalDistanceTraveled = 999;

            const r = jest.spyOn(Math, 'random').mockReturnValue(0);

            bg._maybeTriggerOneShot();

            r.mockRestore();

            expect(bg._oneShotTriggered).toBe(true);
            expect(good.triggerOneShot).toHaveBeenCalledTimes(1);
            expect(bad.triggerOneShot).toHaveBeenCalledTimes(0);
        });
    });
});

// -----------------------------------------------------------------------------
// Map constructors
// -----------------------------------------------------------------------------
describe('Map constructors', () => {
    const specs = [
        { Cls: Map1, id: 'map1Soundtrack', expectedLen: 16 },
        { Cls: Map2, id: 'map2Soundtrack', expectedLen: 15 },
        { Cls: Map3, id: 'map3Soundtrack', expectedLen: 17 },
        { Cls: Map4, id: 'map4Soundtrack', expectedLen: 11 },
        { Cls: Map5, id: 'map5Soundtrack', expectedLen: 16 },
        { Cls: Map6, id: 'map6Soundtrack', expectedLen: 12 },
        { Cls: Map7, id: 'map7Soundtrack', expectedLen: 16 },
        { Cls: BonusMap1, id: 'map3Soundtrack', expectedLen: 11 },
        { Cls: BonusMap2, id: 'map3Soundtrack', expectedLen: 23 },
        { Cls: BonusMap3, id: 'map3Soundtrack', expectedLen: 9 },
    ];

    test.each(specs)('%s wires soundtrack id and expected background layer count', ({ Cls, id, expectedLen }) => {
        const game = makeGame({
            width: 1920,
            height: 689,
            speed: 1,
            currentMap: Cls.name,
        });

        const map = new Cls(game);
        expect(map.soundId).toBe(id);
        expect(map.backgroundLayers).toHaveLength(expectedLen);
    });
});

// -----------------------------------------------------------------------------
// Bonus Map Snow
// -----------------------------------------------------------------------------
describe('BonusMap specifics', () => {
    test('BonusMap1 includes three SnowflakeAnimation layers and amplifies front flakes', () => {
        const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.9);

        const game = makeGame({ width: 800, height: 600, speed: 0 });
        const b1 = new BonusMap1(game);

        randomSpy.mockRestore();

        expect(b1.soundId).toBe('map3Soundtrack');

        const snowLayers = b1.backgroundLayers.filter((l) => l instanceof SnowflakeAnimation);
        expect(snowLayers).toHaveLength(3);

        const [snowBack, snowMid, snowFront] = snowLayers;
        expect(snowFront.flakes.length).toBeGreaterThan(0);

        const i = 0;
        expect(snowFront.flakes[i].r).toBeGreaterThan(snowMid.flakes[i].r);
        expect(snowFront.flakes[i].r).toBeGreaterThan(snowBack.flakes[i].r);

        expect(snowFront.flakes[i].opacity).toBeGreaterThan(snowMid.flakes[i].opacity);
        expect(snowFront.flakes[i].opacity).toBeGreaterThan(snowBack.flakes[i].opacity);
    });

    test('BonusMap2 and BonusMap3 use underwater soundtrack id', () => {
        const game = makeGame({ width: 800, height: 600, speed: 0 });
        expect(new BonusMap2(game).soundId).toBe('map3Soundtrack');
        expect(new BonusMap3(game).soundId).toBe('map3Soundtrack');
    });

    test('Map6 includes three BubbleAnimation layers and a vertical MovingLayer mist', () => {
        const game = makeGame({ width: 800, height: 600, speed: 0 });

        const m6 = new Map6(game);

        const bubbles = m6.backgroundLayers.filter((l) => l instanceof BubbleAnimation);
        expect(bubbles.length).toBe(3);

        const mist = m6.backgroundLayers.find((l) => l instanceof MovingLayer);
        expect(mist).toBeTruthy();
        expect(mist.axis).toBe('y');
        expect(mist.direction).toBe('up');
    });
});

// -----------------------------------------------------------------------------
// Firefly
// -----------------------------------------------------------------------------
describe('Firefly', () => {
    let game, firefly;

    beforeEach(() => {
        Firefly.prototype.spawnNewFirefly.mockClear();
        game = { width: 1920, height: 689, speed: 5, cabin: { isFullyVisible: false } };
        firefly = new Firefly(game, 3);
    });

    test('spawns maxBackgroundEntities fireflies on construction', () => {
        expect(firefly.backgroundEntities).toHaveLength(3);
    });

    test('removes only off-screen entity and calls spawnNewFirefly once', () => {
        firefly.backgroundEntities = [
            { x: -1, y: 50, speed: 0.1, directionX: 1, directionY: 0, opacity: 1 },
            { x: 10, y: 50, speed: 0.1, directionX: 1, directionY: 0, opacity: 1 },
            { x: 20, y: 50, speed: 0.1, directionX: 1, directionY: 0, opacity: 1 },
        ];

        firefly.update(1);

        expect(firefly.backgroundEntities).toHaveLength(2);
        expect(Firefly.prototype.spawnNewFirefly).toHaveBeenCalledTimes(1);
    });

    test('opacity stays within [0,1] and edge fade reduces opacity near borders', () => {
        firefly.backgroundEntities = [{ x: 1, y: 0, speed: 0.1, directionX: 0, directionY: 0, opacity: 1 }];
        firefly.update(0);

        expect(firefly.backgroundEntities[0].opacity).toBeGreaterThanOrEqual(0);
        expect(firefly.backgroundEntities[0].opacity).toBeLessThanOrEqual(1);
        expect(firefly.backgroundEntities[0].opacity).toBeLessThan(1);
    });

    test('when cabin is visible, movement does not subtract player parallax', () => {
        const e = firefly.backgroundEntities[0];
        e.directionX = 1;
        e.speed = 0.1;

        const prevX = e.x;
        game.cabin.isFullyVisible = true;

        firefly.update(10);
        expect(e.x).toBeGreaterThan(prevX);
    });
});

// -----------------------------------------------------------------------------
// SmallFish
// -----------------------------------------------------------------------------
describe('SmallFish', () => {
    let game, sf;

    beforeEach(() => {
        SmallFish.prototype.spawnNewFish.mockClear();
        game = {
            width: 1920,
            height: 689,
            speed: 50,
            cabin: { isFullyVisible: false },
            player: { isUnderwater: false },
        };
        sf = new SmallFish(game, 3);
        sf.backgroundEntities.forEach((f) => {
            f.directionX = 1;
            f.speed = 0.2;
            f.directionY = 0;
        });
    });

    test('removes off-screen fish and triggers respawn once (spawn mocked)', () => {
        sf.backgroundEntities = [
            { x: -1, y: 10, speed: 0.1, directionX: 1, directionY: 0, opacity: 1 },
            { x: 10, y: 10, speed: 0.1, directionX: 1, directionY: 0, opacity: 1 },
            { x: 20, y: 10, speed: 0.1, directionX: 1, directionY: 0, opacity: 1 },
        ];

        sf.update(1);

        expect(sf.backgroundEntities.length).toBe(2);
        expect(SmallFish.prototype.spawnNewFish).toHaveBeenCalledTimes(1);
    });

    test('underwater + directionX>0 => fish advances without player parallax drag', () => {
        game.player.isUnderwater = true;

        const fish = sf.backgroundEntities[0];
        fish.x = 600;

        const x0 = fish.x;
        sf.update(16);

        expect(fish.x).toBeGreaterThan(x0);
    });

    test('not underwater => x includes player parallax drag term', () => {
        game.player.isUnderwater = false;

        const fish = sf.backgroundEntities[1];
        fish.x = 600;
        fish.directionX = 1;
        fish.speed = 0.2;

        const x0 = fish.x;
        const dt = 16;

        const expected = x0 + fish.speed * fish.directionX * dt - (game.speed / 50) * dt;

        sf.update(dt);

        expect(fish.x).toBeCloseTo(expected, 5);
    });

    test('when cabin is visible, x ignores player parallax drag', () => {
        game.cabin.isFullyVisible = true;

        const fish = sf.backgroundEntities[0];
        fish.x = 100;
        fish.directionX = 1;
        fish.speed = 0.2;

        const x0 = fish.x;
        sf.update(10);

        expect(fish.x).toBeCloseTo(x0 + fish.speed * fish.directionX * 10, 5);
    });
});

// -----------------------------------------------------------------------------
// BigFish
// -----------------------------------------------------------------------------
describe('BigFish', () => {
    let game, bf;

    beforeAll(() => {
        jest.spyOn(BigFish.prototype, 'spawnNewFish').mockImplementation(function () {
            const img = document.getElementById('shark');
            this.backgroundEntities.push({
                fishImage: img,
                width: img.width,
                height: img.height,
                x: 10,
                y: 10,
                speed: 1,
                directionX: 1,
                directionY: 0,
                opacity: 0.6,
            });
        });
        jest.spyOn(Math, 'random').mockReturnValue(0.1);
    });

    afterAll(() => {
        BigFish.prototype.spawnNewFish.mockRestore();
        Math.random.mockRestore();
    });

    beforeEach(() => {
        game = { width: 1920, height: 689 };
        bf = new BigFish(game, 1);
        bf.spawnInterval = 0;
        bf.spawnTimer = bf.spawnInterval;
    });

    test('spawns a fish when spawnTimer >= spawnInterval and random < 0.2', () => {
        bf.backgroundEntities = [];
        bf.update(1);
        expect(bf.backgroundEntities.length).toBe(1);
    });

    test('removes fish that swim offscreen and resets spawnTimer to 0', () => {
        bf.backgroundEntities = [
            { x: -1000, y: 0, width: 10, height: 10, speed: 1, directionX: -1, directionY: 0, opacity: 0.6 },
        ];

        bf.update(1);

        expect(bf.backgroundEntities).toHaveLength(0);
        expect(bf.spawnTimer).toBe(0);
    });

    test('edge opacity is capped at 0.6 and never negative', () => {
        bf.backgroundEntities = [
            {
                width: 100,
                height: 50,
                x: 1,
                y: 1,
                speed: 0,
                directionX: 0,
                directionY: 0,
                opacity: 1,
            },
        ];

        bf.update(16);

        expect(bf.backgroundEntities[0].opacity).toBeLessThanOrEqual(0.6);
        expect(bf.backgroundEntities[0].opacity).toBeGreaterThanOrEqual(0);
    });
});

// -----------------------------------------------------------------------------
// Map5 rain windows & cabin stop
// -----------------------------------------------------------------------------
describe('Map5 rain windows & cabin stop', () => {
    let game, map5, soundtrack;

    beforeEach(() => {
        soundtrack = makeSoundtrack();
        game = makeGame({
            speed: 1,
            currentMap: 'Map5',
            audioHandler: { mapSoundtrack: soundtrack },
        });
        map5 = new Map5(game);
    });

    test.each([40, 130, 230])('turns rain ON when totalDistanceTraveled=%d', (dist) => {
        map5.totalDistanceTraveled = dist;
        map5.update(0);

        const rainLayer = map5.backgroundLayers.find((l) => l instanceof RaindropAnimation);
        expect(rainLayer.isRaining).toBe(true);
        expect(soundtrack.playSound).toHaveBeenCalledWith('rainSound', true);
    });

    test.each([10, 80, 200])('turns rain OFF when totalDistanceTraveled=%d', (dist) => {
        map5.totalDistanceTraveled = dist;
        map5.update(0);

        const rainLayer = map5.backgroundLayers.find((l) => l instanceof RaindropAnimation);
        expect(rainLayer.isRaining).toBe(false);
        expect(soundtrack.playSound).toHaveBeenCalledWith('rainSound', false, true, true);
    });

    test('forces rain and rain audio OFF immediately when cabin becomes visible', () => {
        map5.totalDistanceTraveled = 50;
        game.cabin.isFullyVisible = true;

        map5.update(0);

        const rainLayer = map5.backgroundLayers.find((l) => l instanceof RaindropAnimation);
        expect(rainLayer.isRaining).toBe(false);
        expect(soundtrack.playSound).toHaveBeenCalledWith('rainSound', false, true, true);
    });
});

// -----------------------------------------------------------------------------
// RaindropAnimation & RaindropSplashAnimation
// -----------------------------------------------------------------------------
describe('RaindropAnimation', () => {
    let game, rain, ctx;

    beforeEach(() => {
        game = { width: 1920, height: 689, speed: 10 };
        rain = new RaindropAnimation(game, 5);
        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
        };
    });

    test('update is a no-op when isRaining is false', () => {
        const before = JSON.stringify(rain.raindrops);
        rain.update(1);
        expect(JSON.stringify(rain.raindrops)).toBe(before);
    });

    test('when raining, drops reset at bottom and splash animations spawn and are cleaned up', () => {
        rain.isRaining = true;
        rain.raindrops[0].y = game.height + 1;

        const r = jest.spyOn(Math, 'random').mockReturnValue(0);
        rain.update(1);

        expect(rain.splashes.length).toBeGreaterThan(0);

        rain.splashes[0].markedForDeletion = true;
        rain.update(1);

        expect(rain.splashes.every((s) => !s.markedForDeletion)).toBe(true);

        r.mockRestore();
    });

    test('draw only renders when isRaining is true', () => {
        rain.draw(ctx);
        expect(ctx.beginPath).not.toHaveBeenCalled();

        rain.isRaining = true;
        rain.draw(ctx);
        expect(ctx.beginPath).toHaveBeenCalled();
    });
});

describe('RaindropSplashAnimation', () => {
    let game, splash, ctx;

    beforeEach(() => {
        game = { width: 1920, height: 689, speed: 5 };
        splash = new RaindropSplashAnimation(game, 10);
        ctx = { drawImage: jest.fn() };
    });

    test('calculateRandomY returns a value within expected vertical band', () => {
        const y = splash.calculateRandomY();
        expect(y).toBeGreaterThanOrEqual(game.height - 25 - 55);
        expect(y).toBeLessThanOrEqual(game.height - 55);
    });

    test('update advances frames and eventually marks splash for deletion', () => {
        splash.frameInterval = 1;
        splash.currentFrame = splash.maxFrames - 1;

        splash.update(2);
        expect(splash.currentFrame).toBe(splash.maxFrames);
        expect(splash.markedForDeletion).toBe(false);

        splash.update(2);
        expect(splash.markedForDeletion).toBe(true);
    });

    test('x moves left according to computed groundSpeed', () => {
        splash.bgSpeed = 2;
        game.speed = 10;
        splash.x = 50;

        splash.update(1);
        expect(splash.x).toBe(30);
    });

    test('draw renders only while currentFrame < maxFrames', () => {
        splash.currentFrame = splash.maxFrames;
        splash.draw(ctx);
        expect(ctx.drawImage).not.toHaveBeenCalled();

        splash.currentFrame = 0;
        splash.draw(ctx);
        expect(ctx.drawImage).toHaveBeenCalled();
    });
});

// -----------------------------------------------------------------------------
// SnowflakeAnimation
// -----------------------------------------------------------------------------
describe('SnowflakeAnimation', () => {
    let game;

    beforeEach(() => {
        game = { width: 1920, height: 689, speed: 100, cabin: { isFullyVisible: false } };
    });

    test('spawns maxFlakes flakes with expected shape', () => {
        const snow = new SnowflakeAnimation(game, 5);
        expect(snow.flakes).toHaveLength(5);

        snow.flakes.forEach((f) => {
            expect(f).toEqual(
                expect.objectContaining({
                    x: expect.any(Number),
                    y: expect.any(Number),
                    r: expect.any(Number),
                    speed: expect.any(Number),
                    drift: expect.any(Number),
                    opacity: expect.any(Number),
                    stopAbove: expect.any(Boolean),
                })
            );
        });
    });

    test('applies player parallax when cabin is not visible', () => {
        const snow = new SnowflakeAnimation(game, 1);
        snow.flakes = [{ x: 100, y: 100, r: 1.5, speed: 0, drift: 0, opacity: 1, stopAbove: true }];

        snow.update(16.67);
        expect(snow.flakes[0].x).toBeCloseTo(99.75, 5);
    });

    test('does not apply player parallax when cabin is fully visible', () => {
        const snow = new SnowflakeAnimation(game, 1);
        snow.flakes = [{ x: 100, y: 100, r: 1.5, speed: 0, drift: 0.1, opacity: 1, stopAbove: true }];

        game.cabin.isFullyVisible = true;

        snow.update(16.67);
        expect(snow.flakes[0].x).toBeCloseTo(105, 5);
    });

    test('respawns a flake when passing stop threshold (stopAbove=true)', () => {
        const snow = new SnowflakeAnimation(game, 1);
        snow.flakes = [{ x: 100, y: game.height - 39, r: 1.5, speed: 0.06, drift: 0, opacity: 1, stopAbove: true }];

        snow.update(16.67);
        expect(snow.flakes[0].y).toBe(-10);
    });

    test('respawns a flake when x goes offscreen horizontally', () => {
        const snow = new SnowflakeAnimation(game, 1);
        snow.flakes = [{ x: game.width + 25, y: 100, r: 1.5, speed: 0.02, drift: 0, opacity: 1, stopAbove: false }];

        snow.update(16.67);
        expect(snow.flakes[0].y).toBe(-10);
    });

    test('draw renders arcs and restores globalAlpha', () => {
        const snow = new SnowflakeAnimation(game, 2);
        snow.flakes = [
            { x: 10, y: 20, r: 2, speed: 0, drift: 0, opacity: 0.4, stopAbove: true },
            { x: 30, y: 40, r: 3, speed: 0, drift: 0, opacity: 0.8, stopAbove: false },
        ];

        const ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            fillStyle: '',
            globalAlpha: 1,
        };

        snow.draw(ctx);

        expect(ctx.beginPath).toHaveBeenCalledTimes(2);
        expect(ctx.arc).toHaveBeenNthCalledWith(1, 10, 20, 2, 0, Math.PI * 2);
        expect(ctx.arc).toHaveBeenNthCalledWith(2, 30, 40, 3, 0, Math.PI * 2);
        expect(ctx.fill).toHaveBeenCalledTimes(2);

        expect(ctx.globalAlpha).toBe(1);
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });
});

// -----------------------------------------------------------------------------
// BubbleAnimation
// -----------------------------------------------------------------------------
describe('BubbleAnimation', () => {
    let game;

    beforeEach(() => {
        game = { width: 800, height: 600, groundMargin: 50 };
    });

    test('spawns maxBackgroundEntities bubbles with expected shape', () => {
        const bubblesAnim = new BubbleAnimation(game, 5, 1, { min: 0.2, max: 0.8 });

        expect(bubblesAnim.bubbles).toHaveLength(5);
        bubblesAnim.bubbles.forEach((b) => {
            expect(b).toEqual(
                expect.objectContaining({
                    x: expect.any(Number),
                    y: expect.any(Number),
                    radius: expect.any(Number),
                    riseSpeed: expect.any(Number),
                    baseOpacity: expect.any(Number),
                    opacity: expect.any(Number),
                    drift: expect.any(Number),
                    age: expect.any(Number),
                })
            );
        });
    });

    test('respawns a bubble when lifetime is exceeded or it is out of bounds', () => {
        const bubblesAnim = new BubbleAnimation(game, 1, 1, { min: 0, max: 1 });

        const original = {
            x: 10,
            y: -100,
            radius: 5,
            riseSpeed: 0,
            baseOpacity: 0.5,
            opacity: 0,
            drift: 0,
            age: bubblesAnim.lifeTime + 1,
        };

        bubblesAnim.bubbles = [original];
        bubblesAnim.update(16);

        const b = bubblesAnim.bubbles[0];
        expect(b).not.toBe(original);
        expect(b.age).toBeLessThanOrEqual(bubblesAnim.lifeTime);
    });

    test('spawnBelowGround places bubbles below ground top', () => {
        const bubblesAnim = new BubbleAnimation(game, 1, 1, { min: 0.66, max: 1.0, spawnBelowGround: true });
        const b = bubblesAnim.bubbles[0];
        const groundTop = game.height - game.groundMargin;

        expect(b.y).toBeGreaterThan(groundTop);
    });
});

// -----------------------------------------------------------------------------
// StarField
// -----------------------------------------------------------------------------
describe('StarField', () => {
    let game;

    beforeEach(() => {
        game = { width: 400, height: 300 };
    });

    test('initializes stars within configured vertical band', () => {
        const options = { top: 50, height: 100, density: 0.5 };
        const sf = new StarField(game, options);

        expect(sf.stars.length).toBeGreaterThan(0);

        sf.stars.forEach((s) => {
            expect(s.x).toBeGreaterThanOrEqual(0);
            expect(s.x).toBeLessThanOrEqual(game.width);
            expect(s.y).toBeGreaterThanOrEqual(options.top);
            expect(s.y).toBeLessThanOrEqual(options.top + options.height);
            expect(s.radius).toBeGreaterThan(0);
        });
    });

    test('wraps stars horizontally and vertically within the band during update', () => {
        const options = { top: 10, height: 50 };
        const sf = new StarField(game, options);
        const star = sf.stars[0];

        star.y = options.top - 1;
        star.x = -1;

        sf.update(16.67);

        expect(star.y).toBeGreaterThanOrEqual(options.top);
        expect(star.y).toBeLessThanOrEqual(options.top + options.height);
        expect(star.x).toBeGreaterThanOrEqual(0);
        expect(star.x).toBeLessThanOrEqual(game.width);
    });
});

// -----------------------------------------------------------------------------
// ShootingStar
// -----------------------------------------------------------------------------
describe('ShootingStar', () => {
    let game;

    beforeEach(() => {
        game = { width: 500, height: 300 };
    });

    test('spawns new shooting stars when emitting interval is reached', () => {
        const ss = new ShootingStar(game, 2);
        ss.shootingStars = [];
        ss.spawnTimer = ss.shootingStarEmittingInterval;

        ss.update(0);

        expect(ss.spawnTimer).toBe(0);
        expect(ss.shootingStars.length).toBeGreaterThanOrEqual(1);
        expect(ss.shootingStars.length).toBeLessThanOrEqual(2);
    });

    test('stars transition alive -> dying -> dead and are removed', () => {
        const ss = new ShootingStar(game, 2);

        ss.shootingStarEmittingInterval = Number.POSITIVE_INFINITY;
        ss.spawnTimer = 0;

        ss.shootingStars = [
            {
                x: 100,
                y: 100,
                vx: 0,
                vy: 0,
                radius: ss.shootingStarRadius,
                opacity: 1,
                trailLengthDelta: 0,
                isSpawning: false,
                isDying: false,
                isDead: false,
                heading: 0,
                lifeTimer: ss.shootingStarLifeTime,
            },
        ];

        ss.update(0);
        expect(ss.shootingStars[0].isDying).toBe(true);
        expect(ss.shootingStars[0].isDead).toBe(false);

        ss.update(2000);
        expect(ss.shootingStars.length).toBe(0);
    });
});

// -----------------------------------------------------------------------------
// Map3Zabby1FlyBy
// -----------------------------------------------------------------------------
describe('Map3Zabby1FlyBy', () => {
    test('triggerOneShot spawns from either side and y is centered (40%-60% height)', () => {
        const game = { width: 600, height: 400 };
        const flyby = new Map3Zabby1FlyBy(game);
        flyby.setOneShotImageIds(['map3Zabby1']);

        const ok = flyby.triggerOneShot();
        expect(ok).toBe(true);

        expect(flyby._spawnedFromLeft === true || flyby._spawnedFromLeft === false).toBe(true);
        if (flyby._spawnedFromLeft) expect(flyby.x).toBeLessThan(0);
        else expect(flyby.x).toBeGreaterThan(game.width);

        expect(flyby.y).toBeGreaterThanOrEqual(game.height * 0.4);
        expect(flyby.y).toBeLessThanOrEqual(game.height * 0.6);
    });

    test('update marks one-shot as shown when it goes offscreen', () => {
        const game = { width: 600, height: 400 };
        const flyby = new Map3Zabby1FlyBy(game);
        flyby.setOneShotImageIds(['map3Zabby1']);
        flyby.triggerOneShot();

        flyby.x = -9999;
        flyby.update(16.67);

        expect(flyby._oneShotShown).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// DragonSilhouette
// -----------------------------------------------------------------------------
describe('DragonSilhouette', () => {
    let game, ctx;

    beforeEach(() => {
        game = { width: 800, height: 600 };
        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            drawImage: jest.fn(),
            rotate: jest.fn(),
        };
    });

    test('update calls resetPosition when sprite moves offscreen', () => {
        const dragon = new DragonSilhouette(game, 1, 0.5);
        const resetSpy = jest.spyOn(dragon, 'resetPosition');

        dragon.x = -dragon.width - 1;
        dragon.update(16);

        expect(resetSpy).toHaveBeenCalled();
    });

    test('draw renders when image is available', () => {
        const dragon = new DragonSilhouette(game, 1, 0.5);
        dragon.draw(ctx);

        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.drawImage).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });

    test('triggerOneShot switches to one-shot image and spawns near edge; update later consumes it and restores default image', () => {
        const dragon = new DragonSilhouette(game, 1, 0.5);

        const spawnSpy = jest.spyOn(dragon, 'spawnNearEdgeNow').mockImplementation(() => {
            dragon.x = -dragon.width - 1;
            dragon.y = 10;
            dragon.direction = 1;
            dragon.flipped = true;
        });

        dragon.setOneShotImageIds(['bonusMap2Zabby4']);
        expect(dragon.triggerOneShot()).toBe(true);
        expect(dragon.imageId).toBe('bonusMap2Zabby4');
        expect(spawnSpy).toHaveBeenCalled();

        dragon.update(16);

        expect(dragon._oneShotShown).toBe(true);
        expect(dragon.imageId).toBe(dragon.defaultImageId);

        spawnSpy.mockRestore();
    });
});

// -----------------------------------------------------------------------------
// MeteorBackground
// -----------------------------------------------------------------------------
describe('MeteorBackground', () => {
    let game, ctx;

    beforeEach(() => {
        game = { width: 600, height: 400 };
        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            drawImage: jest.fn(),
        };
    });

    test('spawns maxBackgroundEntities meteors on construction', () => {
        const mb = new MeteorBackground(game, 3);

        expect(mb.meteors).toHaveLength(3);
        mb.meteors.forEach((m) => {
            expect(m).toEqual(
                expect.objectContaining({
                    x: expect.any(Number),
                    y: expect.any(Number),
                    vx: expect.any(Number),
                    vy: expect.any(Number),
                    angle: expect.any(Number),
                    angularSpeed: expect.any(Number),
                    rotationDir: expect.any(Number),
                    scale: expect.any(Number),
                })
            );
        });
    });

    test('makeMeteor respects verticalBand configuration', () => {
        const verticalBand = { min: 0.25, max: 0.75 };
        const mb = new MeteorBackground(game, 1, { verticalBand });

        const m = mb.makeMeteor(false);

        const yMin = game.height * verticalBand.min;
        const yMax = game.height * verticalBand.max;

        expect(m.y).toBeGreaterThanOrEqual(yMin);
        expect(m.y).toBeLessThanOrEqual(yMax);
    });

    test('update respawns a meteor when it goes offscreen', () => {
        const mb = new MeteorBackground(game, 1);

        const original = mb.meteors[0];
        original.x = -mb.offscreenMargin - 1;

        mb.update(1);

        expect(mb.meteors[0]).not.toBe(original);
    });

    test('triggerOneShot replaces one meteor with a one-shot meteor and marks it shown when it exits', () => {
        const mb = new MeteorBackground(game, 3);
        mb.setOneShotImageIds(['bonusMap3Zabby2']);

        const ok = mb.triggerOneShot();
        expect(ok).toBe(true);
        expect(mb._oneShotActive).toBe(true);

        const idx = mb.meteors.findIndex((m) => m.__oneShot);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(mb.meteors[idx].imageId).toBe('bonusMap3Zabby2');

        mb.meteors[idx].x = -mb.offscreenMargin - 1000;
        mb.update(1);

        expect(mb._oneShotActive).toBe(false);
        expect(mb._oneShotShown).toBe(true);
        expect(mb.meteors.some((m) => m.__oneShot)).toBe(false);
    });

    test('draw renders each meteor sprite when image is available', () => {
        const mb = new MeteorBackground(game, 2);
        mb.draw(ctx);

        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.drawImage).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });
});
