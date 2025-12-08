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
    SnowflakeAnimation,
    BonusMap1,
    BonusMap2,
    BonusMap3,
    EntityAnimation,
    MovingLayer,
    RedBubbleAnimation,
    StarField,
    ShootingStar,
    DragonSilhouette,
    MeteorBackground,
} from '../../game/background/background.js';

beforeAll(() => {
    const ids = [
        'fish', 'fish2', 'fish3', 'fish4', 'fish5', 'fish6', 'fish7', 'fish8', 'fish9', 'fish10', 'fish11', 'jellyfish',
        'shark', 'whale',
        'raindropSplash',
        'A', 'B',
        'map1Background', 'map1Trees7', 'map1Trees1', 'map1Trees2', 'map1Trees5', 'map1Trees3', 'map1Trees4', 'map1Rocks', 'map1Bush', 'map1Trees6', 'map1Ground',
        'map2Background', 'map2CityLights2', 'map2CityLights1', 'map2Trees1', 'map2Ground',
        'map3Background', 'map3BackgroundRocks', 'map3seaPlants3', 'map3seaPlants1', 'map3seaPlants2', 'map3seaPlants4', 'map3seaPlants6', 'map3seaPlants5', 'map3seaPlants7', 'map3Ground',
        'map4Background', 'map4BottomVines', 'map4Trees3', 'map4Trees4', 'map4Trees2', 'map4Trees1', 'map4TopVines', 'map4Ground',
        'map5Background', 'map5Trees5', 'map5Trees2', 'map5Trees4', 'map5Trees3', 'map5Trees1', 'map5Bush2', 'map5Bush1', 'map5Flowers2', 'map5Flowers1', 'map5Ground',
        'map6Background', 'map6rocks2', 'map6rocks1', 'map6cactus', 'map6spikeStones', 'map6Ground',
        'bonusMap1Background', 'bonusMap1Ground',
        'dragonSilhouette',
        'meteorBackground',
    ];
    document.body.innerHTML = ids.map(id => `<img id="${id}" width="64" height="64"/>`).join('');
});

beforeAll(() => {
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
    let layer, mockGame, ctx, img;

    beforeEach(() => {
        img = { width: 100, height: 50 };
        mockGame = { width: 1920, height: 689, speed: 2 };
        layer = new Layer(mockGame, 1.5, img);
        ctx = { drawImage: jest.fn() };
    });

    test('constructor initializes properties', () => {
        expect(layer.x).toBe(0);
        expect(layer.y).toBe(0);
        expect(layer.groundSpeed).toBe(0);
        expect(layer.isRaining).toBe(false);
    });

    test('update moves x by groundSpeed and wraps around', () => {
        layer.update();
        expect(layer.groundSpeed).toBe(3);
        expect(layer.x).toBe(-3);

        layer.x = -1920;
        layer.update();
        expect(layer.x).toBe(0 - layer.groundSpeed);
    });

    test('edge-case: zero width does not throw', () => {
        layer.game.width = 0;
        layer.game.speed = 5;
        layer.bgSpeed = 1;
        expect(() => layer.update()).not.toThrow();
        expect(layer.groundSpeed).toBe(5);
    });

    test('draw draws two images seamlessly', () => {
        layer.x = -50;
        layer.draw(ctx);
        expect(ctx.drawImage).toHaveBeenNthCalledWith(1, img, -50, 0, 1920, 689);
        expect(ctx.drawImage).toHaveBeenNthCalledWith(2, img, 1870, 0, 1920, 689);
    });
});

// -----------------------------------------------------------------------------
// MovingLayer
// -----------------------------------------------------------------------------
describe('MovingLayer', () => {
    let mockGame, ctx;

    beforeEach(() => {
        mockGame = { width: 100, height: 50, speed: 2 };
        ctx = { drawImage: jest.fn() };
    });

    test('moves horizontally with parallax and wraps around', () => {
        const layer = new MovingLayer(mockGame, 0.5, 'A', 1, 'left', 'x');

        layer.x = -99;
        layer.update(0);
        expect(layer.x).toBeGreaterThan(-mockGame.width);
        expect(layer.x).toBeLessThan(0);

        const rightLayer = new MovingLayer(mockGame, 0.5, 'A', 1, 'right', 'x');
        const x0 = rightLayer.x;
        rightLayer.update(0);
        expect(rightLayer.x).toBeGreaterThan(x0);
    });

    test('moves vertically and wraps on y axis', () => {
        const layer = new MovingLayer(mockGame, 0.5, 'A', 1, 'up', 'y');
        layer.y = -49;
        layer.update(0);
        expect(layer.y).toBeGreaterThanOrEqual(0);
        expect(layer.y).toBeLessThan(mockGame.height);
    });

    test('draw tiles along correct axis', () => {
        const layerX = new MovingLayer(mockGame, 0.5, 'A', 1, 'left', 'x');
        layerX.x = -10;
        layerX.draw(ctx);
        expect(ctx.drawImage).toHaveBeenCalledTimes(2);
        expect(ctx.drawImage).toHaveBeenNthCalledWith(
            1,
            layerX.image,
            expect.any(Number),
            layerX.y,
            mockGame.width,
            mockGame.height
        );

        const layerY = new MovingLayer(mockGame, 0.5, 'A', 1, 'up', 'y');
        ctx.drawImage.mockClear();
        layerY.y = -10;
        layerY.draw(ctx);
        expect(ctx.drawImage).toHaveBeenCalledTimes(2);
        expect(ctx.drawImage).toHaveBeenNthCalledWith(
            1,
            layerY.image,
            layerY.x,
            expect.any(Number),
            mockGame.width,
            mockGame.height
        );
    });
});

// -----------------------------------------------------------------------------
// Background core logic
// -----------------------------------------------------------------------------
describe('Background', () => {
    let bg, mockGame, layerSpy, rainSpy, soundtrack;

    beforeEach(() => {
        soundtrack = { playSound: jest.fn(), fadeOutAndStop: jest.fn() };
        mockGame = {
            width: 1920,
            height: 689,
            speed: 4,
            cabin: { isFullyVisible: false },
            isBossVisible: false,
            isTutorialActive: false,
            currentMap: 'Map1',
            audioHandler: { mapSoundtrack: soundtrack }
        };
        layerSpy = jest.spyOn(Layer.prototype, 'update');
        bg = new Background(
            mockGame,
            { imageId: 'A', bgSpeed: 1 },
            { imageId: 'B', bgSpeed: 0.5 },
            { imageId: 'none', maxBackgroundEntities: 0 }
        );
        bg.backgroundLayers[2] = new RaindropAnimation(mockGame, 1);
        rainSpy = jest.spyOn(RaindropAnimation.prototype, 'update');
    });

    afterEach(() => {
        layerSpy.mockRestore();
        rainSpy.mockRestore();
    });

    test('plays soundtrack first update, then fades out when cabin becomes visible', () => {
        bg.soundId = 'testSound';
        bg.update(16);
        expect(soundtrack.playSound).toHaveBeenCalledWith(bg.soundId, true);
        expect(bg.soundPlayed).toBe(true);

        mockGame.cabin.isFullyVisible = true;
        bg.update(16);
        expect(soundtrack.fadeOutAndStop).toHaveBeenCalledWith(bg.soundId);
        expect(bg.soundPlayed).toBe(false);
    });

    test('when boss is visible, parallax layers freeze but RaindropAnimation continues updating', () => {
        bg.soundId = 'sfx';
        bg.update(0);
        expect(soundtrack.playSound).toHaveBeenCalled();

        mockGame.isBossVisible = true;
        layerSpy.mockClear();
        rainSpy.mockClear();
        bg.update(1);
        expect(soundtrack.fadeOutAndStop).toHaveBeenCalledWith('sfx');
        expect(layerSpy).not.toHaveBeenCalled();
        expect(rainSpy).toHaveBeenCalled();
    });

    test('EntityAnimation & SnowflakeAnimation still update when parallax is frozen', () => {
        const ent = new (class extends EntityAnimation {
            constructor(game) { super(game, 0); this.updated = 0; this.groundSpeed = 999; }
            update(dt) { this.updated += dt; }
            draw() { }
        })(mockGame);
        const snow = new SnowflakeAnimation(mockGame, 1);
        jest.spyOn(ent, 'update');
        jest.spyOn(snow, 'update');

        bg.backgroundLayers = [ent, snow];
        mockGame.cabin.isFullyVisible = true;
        bg.update(10);

        expect(ent.update).toHaveBeenCalledWith(10);
        expect(snow.update).toHaveBeenCalledWith(10);
    });

    test('totalDistanceTraveled respects tutorial and currentMap flags', () => {
        mockGame.speed = 200;

        bg.totalDistanceTraveled = 0;
        mockGame.isTutorialActive = false;
        mockGame.currentMap = 'Map1';
        bg.update(1);
        expect(bg.totalDistanceTraveled).toBeCloseTo(0.20);

        bg.totalDistanceTraveled = 0;
        mockGame.isTutorialActive = true;
        mockGame.currentMap = 'Map1';
        bg.update(1);
        expect(bg.totalDistanceTraveled).toBe(0);

        bg.totalDistanceTraveled = 0;
        mockGame.isTutorialActive = true;
        mockGame.currentMap = 'Map2';
        bg.update(1);
        expect(bg.totalDistanceTraveled).toBeCloseTo(0.20);
    });

    test('draw calls each layer.draw in order without invoking real layer drawing logic', () => {
        const ctx = { drawImage: jest.fn() };
        const spies = bg.backgroundLayers.map(layer =>
            jest.spyOn(layer, 'draw').mockImplementation(() => { })
        );

        bg.draw(ctx);

        spies.forEach(s => expect(s).toHaveBeenCalledWith(ctx));
        spies.forEach(s => s.mockRestore());
    });
});

// -----------------------------------------------------------------------------
// Map1–Map6
// -----------------------------------------------------------------------------
describe('Map1–Map6 constructors', () => {
    const specs = [
        { Cls: Map1, id: 'map1Soundtrack', baseLayers: 11, extraLayers: 5 },
        { Cls: Map2, id: 'map2Soundtrack', baseLayers: 5, extraLayers: 3 },
        { Cls: Map3, id: 'map3Soundtrack', baseLayers: 10, extraLayers: 6 },
        { Cls: Map4, id: 'map4Soundtrack', baseLayers: 8, extraLayers: 3 },
        { Cls: Map5, id: 'map5Soundtrack', baseLayers: 11, extraLayers: 6, hasRain: true },
        { Cls: Map6, id: 'map6Soundtrack', baseLayers: 6, extraLayers: 0 }
    ];

    specs.forEach(({ Cls, id, baseLayers, extraLayers, hasRain = false }) => {
        test(`${Cls.name} sets soundtrack id and expected background layer count`, () => {
            const game = {
                width: 1920, height: 689, speed: 1,
                cabin: { isFullyVisible: false },
                audioHandler: { mapSoundtrack: { playSound: () => { } } }
            };
            const map = new Cls(game);
            expect(map.soundId).toBe(id);

            const expected = baseLayers + extraLayers + (hasRain ? 1 : 0);
            expect(map.backgroundLayers).toHaveLength(expected);
        });
    });
});

// -----------------------------------------------------------------------------
// Bonus map snow wiring
// -----------------------------------------------------------------------------
describe('BonusMap snow layers & soundtrack', () => {
    test('BonusMap1: three snow layers present and front layer is visually amplified', () => {
        const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.9);

        const game = {
            width: 800, height: 600, speed: 0,
            cabin: { isFullyVisible: false },
            audioHandler: { mapSoundtrack: { playSound: jest.fn() } }
        };
        const b1 = new BonusMap1(game);

        randomSpy.mockRestore();

        expect(b1.soundId).toBe('map3Soundtrack');

        const snowLayers = b1.backgroundLayers.filter(l => l instanceof SnowflakeAnimation);
        expect(snowLayers).toHaveLength(3);

        const [snowBack, snowMid, snowFront] = snowLayers;

        expect(snowFront.flakes.length).toBeGreaterThan(0);
        const i = 0;

        expect(snowFront.flakes[i].r).toBeGreaterThan(snowMid.flakes[i].r);
        expect(snowFront.flakes[i].r).toBeGreaterThan(snowBack.flakes[i].r);

        expect(snowFront.flakes[i].opacity).toBeGreaterThan(snowMid.flakes[i].opacity);
        expect(snowFront.flakes[i].opacity).toBeGreaterThan(snowBack.flakes[i].opacity);
    });

    test('BonusMap2/BonusMap3 soundtrack ids wired to underwater track', () => {
        const game = {
            width: 800, height: 600, speed: 0,
            cabin: { isFullyVisible: false },
            audioHandler: { mapSoundtrack: { playSound: jest.fn() } }
        };
        expect(new BonusMap2(game).soundId).toBe('map3Soundtrack');
        expect(new BonusMap3(game).soundId).toBe('map3Soundtrack');
    });
});

// -----------------------------------------------------------------------------
// Firefly
// -----------------------------------------------------------------------------
describe('Firefly', () => {
    let firefly, mockGame;

    beforeEach(() => {
        Firefly.prototype.spawnNewFirefly.mockClear();
        mockGame = { width: 1920, height: 689, speed: 5, cabin: { isFullyVisible: false } };
        firefly = new Firefly(mockGame, 3);
    });

    test('constructor creates correct number of entities', () => {
        expect(firefly.backgroundEntities).toHaveLength(3);
    });

    test('update removes only the off-screen entity and calls spawnNewFirefly once', () => {
        firefly.backgroundEntities = [
            { x: -1, y: 50, speed: 0.1, directionX: 1, directionY: 0, opacity: 1 },
            { x: 10, y: 50, speed: 0.1, directionX: 1, directionY: 0, opacity: 1 },
            { x: 20, y: 50, speed: 0.1, directionX: 1, directionY: 0, opacity: 1 }
        ];
        firefly.update(1);

        expect(firefly.backgroundEntities).toHaveLength(2);
        expect(Firefly.prototype.spawnNewFirefly).toHaveBeenCalledTimes(1);
    });

    test('opacity is clamped to [0,1] and edge fade reduces opacity near borders', () => {
        firefly.backgroundEntities = [{
            x: 1, y: 300, speed: 0.1, directionX: 0, directionY: 0, opacity: 1
        }];
        firefly.update(0);
        expect(firefly.backgroundEntities[0].opacity).toBeGreaterThanOrEqual(0);
        expect(firefly.backgroundEntities[0].opacity).toBeLessThanOrEqual(1);
        expect(firefly.backgroundEntities[0].opacity).toBeLessThan(1);
    });

    test('when cabin is visible, player parallax is not subtracted from x movement', () => {
        const e = firefly.backgroundEntities[0];
        e.directionX = 1;
        e.speed = 0.1;
        const prevX = e.x;
        mockGame.cabin.isFullyVisible = true;
        firefly.update(10);
        expect(e.x).toBeGreaterThan(prevX);
    });
});

// -----------------------------------------------------------------------------
// SmallFish
// -----------------------------------------------------------------------------
describe('SmallFish', () => {
    let sf, mockGame;

    beforeEach(() => {
        SmallFish.prototype.spawnNewFish.mockClear();
        mockGame = {
            width: 1920, height: 689, speed: 50,
            cabin: { isFullyVisible: false },
            player: { isUnderwater: false }
        };
        sf = new SmallFish(mockGame, 3);
        sf.backgroundEntities.forEach(f => { f.directionX = 1; f.speed = 0.2; f.directionY = 0; });
    });

    test('update removes off-screen fish and triggers respawn once (mocked)', () => {
        sf.backgroundEntities = [
            { x: -1, y: 10, speed: 0.1, directionX: 1, directionY: 0, opacity: 1 },
            { x: 10, y: 10, speed: 0.1, directionX: 1, directionY: 0, opacity: 1 },
            { x: 20, y: 10, speed: 0.1, directionX: 1, directionY: 0, opacity: 1 }
        ];
        sf.update(1);
        expect(sf.backgroundEntities.length).toBe(2);
        expect(SmallFish.prototype.spawnNewFish).toHaveBeenCalledTimes(1);
    });

    test('underwater + directionX>0 => fish advances forward without player parallax drag', () => {
        mockGame.player.isUnderwater = true;
        const fish = sf.backgroundEntities[0];
        fish.x = 600;
        const x0 = fish.x;
        const dt = 16;
        sf.update(dt);
        expect(fish.x).toBeGreaterThan(x0);
    });

    test('not underwater => player parallax reduces forward gain (exact equation)', () => {
        mockGame.player.isUnderwater = false;
        const fish = sf.backgroundEntities[1];
        fish.x = 600;
        fish.directionX = 1;
        fish.speed = 0.2;
        const x0 = fish.x;
        const dt = 16;

        const expected =
            x0 + (fish.speed * fish.directionX * dt) - ((mockGame.speed / 50) * dt);

        sf.update(dt);

        expect(fish.x).toBeCloseTo(expected, 5);
    });
});

// -----------------------------------------------------------------------------
// BigFish
// -----------------------------------------------------------------------------
describe('BigFish', () => {
    let bf, mockGame;

    beforeAll(() => {
        jest.spyOn(BigFish.prototype, 'spawnNewFish').mockImplementation(function () {
            this.backgroundEntities.push({
                fishImage: document.getElementById('shark'),
                width: 100, height: 50,
                x: 10, y: 10,
                speed: 1, directionX: 1, directionY: 0,
                opacity: 0.6
            });
        });
        jest.spyOn(Math, 'random').mockReturnValue(0.1);
    });
    afterAll(() => {
        BigFish.prototype.spawnNewFish.mockRestore();
        Math.random.mockRestore();
    });

    beforeEach(() => {
        mockGame = { width: 1920, height: 689 };
        bf = new BigFish(mockGame, 1);
        bf.spawnInterval = 0;
        bf.spawnTimer = bf.spawnInterval;
    });

    test('update spawns fish when timer ≥ interval and random < 0.2', () => {
        bf.backgroundEntities = [];
        bf.update(1);
        expect(bf.backgroundEntities.length).toBe(1);
    });

    test('removes fish that swim offscreen and resets spawn timer', () => {
        bf.backgroundEntities = [
            { x: -100, y: 0, width: 10, height: 10, speed: 1, directionX: 1, directionY: 0 }
        ];
        bf.update(1);
        expect(bf.backgroundEntities).toHaveLength(0);
        expect(bf.spawnTimer).toBe(0);
    });

    test('edge opacity is capped at 0.6 and reduced near borders', () => {
        bf.backgroundEntities = [{
            width: 100, height: 50, x: 1, y: 1, speed: 0, directionX: 0, directionY: 0, opacity: 1
        }];
        bf.update(16);
        expect(bf.backgroundEntities[0].opacity).toBeLessThanOrEqual(0.6);
        expect(bf.backgroundEntities[0].opacity).toBeGreaterThanOrEqual(0);
    });
});

// -----------------------------------------------------------------------------
// Map5 rain windows & cabin stop
// -----------------------------------------------------------------------------
describe('Map5 rain windows & cabin stop', () => {
    let map5, mockGame, soundtrack;

    beforeEach(() => {
        soundtrack = { playSound: jest.fn() };
        mockGame = {
            width: 1920, height: 689, speed: 1,
            cabin: { isFullyVisible: false },
            audioHandler: { mapSoundtrack: soundtrack }
        };
        map5 = new Map5(mockGame);
    });

    [40, 130, 230].forEach(dist => {
        test(`rain switches ON at totalDistanceTraveled = ${dist}`, () => {
            map5.totalDistanceTraveled = dist;
            map5.update(0);
            const rainLayer = map5.backgroundLayers.find(l => l instanceof RaindropAnimation);
            expect(rainLayer.isRaining).toBe(true);
            expect(soundtrack.playSound).toHaveBeenCalledWith('rainSound', true);
        });
    });

    test('rain and sound stop immediately when cabin becomes visible', () => {
        map5.totalDistanceTraveled = 50;
        mockGame.cabin.isFullyVisible = true;
        map5.update(0);
        const rainLayer = map5.backgroundLayers.find(l => l instanceof RaindropAnimation);
        expect(rainLayer.isRaining).toBe(false);
        expect(soundtrack.playSound).toHaveBeenCalledWith('rainSound', false, true, true);
    });
});

// -----------------------------------------------------------------------------
// RaindropAnimation & RaindropSplashAnimation
// -----------------------------------------------------------------------------
describe('RaindropAnimation & Splash', () => {
    let rain, rainCtx, mockGame;

    beforeEach(() => {
        mockGame = { width: 1920, height: 689 };
        rain = new RaindropAnimation(mockGame, 5);
        rainCtx = {
            save: jest.fn(), restore: jest.fn(),
            beginPath: jest.fn(), moveTo: jest.fn(),
            lineTo: jest.fn(), stroke: jest.fn()
        };
    });

    test('update does nothing when not raining', () => {
        const before = JSON.stringify(rain.raindrops);
        rain.update(1);
        expect(JSON.stringify(rain.raindrops)).toBe(before);
    });

    test('when raining, drops reset at bottom and spawn/cleanup splash animations', () => {
        rain.isRaining = true;
        rain.raindrops[0].y = mockGame.height + 1;
        jest.spyOn(Math, 'random').mockReturnValue(0);
        rain.update(1);
        expect(rain.splashes.length).toBeGreaterThan(0);

        rain.splashes[0].markedForDeletion = true;
        rain.update(1);
        expect(rain.splashes.every(s => !s.markedForDeletion)).toBe(true);
        Math.random.mockRestore();
    });

    test('draw only renders when raining', () => {
        rain.draw(rainCtx);
        expect(rainCtx.beginPath).not.toHaveBeenCalled();
        rain.isRaining = true;
        rain.draw(rainCtx);
        expect(rainCtx.beginPath).toHaveBeenCalled();
    });
});

describe('RaindropSplashAnimation', () => {
    let splash, mockGame, ctx;

    beforeEach(() => {
        mockGame = { width: 1920, height: 689, speed: 5 };
        splash = new RaindropSplashAnimation(mockGame, 10);
        ctx = { drawImage: jest.fn() };
    });

    test('calculateRandomY returns a value within expected vertical band', () => {
        const y = splash.calculateRandomY();
        expect(y).toBeGreaterThanOrEqual(mockGame.height - 25 - 55);
        expect(y).toBeLessThanOrEqual(mockGame.height);
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

    test('x position moves left according to groundSpeed', () => {
        splash.bgSpeed = 2;
        mockGame.speed = 10;
        splash.x = 50;
        splash.update(1);
        expect(splash.x).toBe(30);
    });

    test('draw only when currentFrame is less than maxFrames', () => {
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
        game = {
            width: 1920,
            height: 689,
            speed: 100,
            cabin: { isFullyVisible: false },
        };
    });

    test('constructor spawns maxFlakes and each flake has expected props', () => {
        const snow = new SnowflakeAnimation(game, 5);
        expect(snow.flakes).toHaveLength(5);
        snow.flakes.forEach(f => {
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

    test('update applies parallax when cabin is not visible', () => {
        const snow = new SnowflakeAnimation(game, 1);
        snow.flakes = [{
            x: 100,
            y: 100,
            r: 1.5,
            speed: 0,
            drift: 0,
            opacity: 1,
            stopAbove: true,
        }];

        snow.update(16.67);
        expect(snow.flakes[0].x).toBeCloseTo(99.75, 5);
    });

    test('update does NOT apply parallax when cabin is fully visible', () => {
        const snow = new SnowflakeAnimation(game, 1);
        snow.flakes = [{
            x: 100,
            y: 100,
            r: 1.5,
            speed: 0,
            drift: 0.1,
            opacity: 1,
            stopAbove: true,
        }];
        game.cabin.isFullyVisible = true;

        snow.update(16.67);
        expect(snow.flakes[0].x).toBeCloseTo(105, 5);
    });

    test('flake respawns when passing stop threshold (stopAbove=true)', () => {
        const snow = new SnowflakeAnimation(game, 1);
        snow.flakes = [{
            x: 100,
            y: game.height - 39,
            r: 1.5,
            speed: 0.02,
            drift: 0,
            opacity: 1,
            stopAbove: true,
        }];

        snow.update(16.67);
        expect(snow.flakes[0].y).toBeLessThanOrEqual(0);
    });

    test('flake respawns when x goes offscreen horizontally', () => {
        const snow = new SnowflakeAnimation(game, 1);
        snow.flakes = [{
            x: game.width + 25,
            y: 100,
            r: 1.5,
            speed: 0.02,
            drift: 0,
            opacity: 1,
            stopAbove: false,
        }];

        snow.update(16.67);
        expect(snow.flakes[0].x).toBeGreaterThanOrEqual(0);
        expect(snow.flakes[0].x).toBeLessThanOrEqual(game.width);
    });

    test('draw renders arcs with per-flake alpha and restores global alpha', () => {
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
// RedBubbleAnimation
// -----------------------------------------------------------------------------
describe('RedBubbleAnimation', () => {
    let game;

    beforeEach(() => {
        game = {
            width: 800,
            height: 600,
            groundMargin: 50,
        };
    });

    test('constructor spawns maxBackgroundEntities bubbles with expected properties', () => {
        const bubblesAnim = new RedBubbleAnimation(game, 5, 1, { min: 0.2, max: 0.8 });
        expect(bubblesAnim.bubbles).toHaveLength(5);
        bubblesAnim.bubbles.forEach(b => {
            expect(b).toEqual(expect.objectContaining({
                x: expect.any(Number),
                y: expect.any(Number),
                radius: expect.any(Number),
                riseSpeed: expect.any(Number),
                baseOpacity: expect.any(Number),
                opacity: expect.any(Number),
                drift: expect.any(Number),
                age: expect.any(Number),
            }));
        });
    });

    test('update respawns bubble when life is over or out of bounds', () => {
        const bubblesAnim = new RedBubbleAnimation(game, 1, 1, { min: 0, max: 1 });
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
});

// -----------------------------------------------------------------------------
// StarField
// -----------------------------------------------------------------------------
describe('StarField', () => {
    let game;

    beforeEach(() => {
        game = {
            width: 400,
            height: 300,
        };
    });

    test('constructor populates stars within configured vertical band', () => {
        const options = { top: 50, height: 100, density: 0.5 };
        const sf = new StarField(game, options);

        expect(sf.stars.length).toBeGreaterThan(0);
        sf.stars.forEach(s => {
            expect(s.x).toBeGreaterThanOrEqual(0);
            expect(s.x).toBeLessThanOrEqual(game.width);
            expect(s.y).toBeGreaterThanOrEqual(options.top);
            expect(s.y).toBeLessThanOrEqual(options.top + options.height);
            expect(s.radius).toBeGreaterThan(0);
        });
    });

    test('update wraps stars horizontally and vertically within band', () => {
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
        game = {
            width: 500,
            height: 300,
        };
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

    test('stars transition from alive -> dying -> dead and are removed', () => {
        const ss = new ShootingStar(game, 2);

        ss.shootingStarEmittingInterval = Number.POSITIVE_INFINITY;
        ss.spawnTimer = 0;

        ss.shootingStars = [{
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
        }];

        ss.update(0);
        expect(ss.shootingStars[0].isDying).toBe(true);
        expect(ss.shootingStars[0].isDead).toBe(false);

        ss.update(2000);

        expect(ss.shootingStars.length).toBe(0);
    });
});

// -----------------------------------------------------------------------------
// DragonSilhouette
// -----------------------------------------------------------------------------
describe('DragonSilhouette', () => {
    let game, ctx;

    beforeEach(() => {
        game = {
            width: 800,
            height: 600,
        };
        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            drawImage: jest.fn(),
        };
    });

    test('update resets position when sprite moves offscreen', () => {
        const dragon = new DragonSilhouette(game, 1, 0.5);
        const resetSpy = jest.spyOn(dragon, 'resetPosition');
        dragon.x = -dragon.width - 1;

        dragon.update(16);

        expect(resetSpy).toHaveBeenCalled();
    });

    test('draw uses dragon sprite when image is available', () => {
        const dragon = new DragonSilhouette(game, 1, 0.5);
        dragon.draw(ctx);
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.drawImage).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });
});

// -----------------------------------------------------------------------------
// MeteorBackground
// -----------------------------------------------------------------------------
describe('MeteorBackground', () => {
    let game, ctx;

    beforeEach(() => {
        game = {
            width: 600,
            height: 400,
        };
        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            drawImage: jest.fn(),
        };
    });

    test('constructor spawns maxBackgroundEntities meteors', () => {
        const mb = new MeteorBackground(game, 3);
        expect(mb.meteors).toHaveLength(3);
        mb.meteors.forEach(m => {
            expect(m).toEqual(expect.objectContaining({
                x: expect.any(Number),
                y: expect.any(Number),
                vx: expect.any(Number),
                vy: expect.any(Number),
                angle: expect.any(Number),
                angularSpeed: expect.any(Number),
                rotationDir: expect.any(Number),
                scale: expect.any(Number),
            }));
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

    test('update respawns meteor when it goes offscreen', () => {
        const mb = new MeteorBackground(game, 1);
        const original = mb.meteors[0];
        original.x = -mb.offscreenMargin - 1;

        mb.update(16);

        const replacement = mb.meteors[0];
        expect(replacement).not.toBe(original);
    });

    test('draw renders each meteor sprite when image is available', () => {
        const mb = new MeteorBackground(game, 2);
        mb.draw(ctx);
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.drawImage).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });
});
