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
    Map6
} from '../../game/background/background.js';

beforeAll(() => {
    jest.spyOn(Firefly.prototype, 'spawnNewFirefly')
        .mockImplementation(() => { });
});
afterAll(() => {
    Firefly.prototype.spawnNewFirefly.mockRestore();
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
// Background core logic
// -----------------------------------------------------------------------------
describe('Background', () => {
    let bg, mockGame, layerSpy, rainSpy, soundtrack;

    beforeEach(() => {
        document.body.innerHTML = `<img id="A"/><img id="B"/>`;
        soundtrack = { playSound: jest.fn(), fadeOutAndStop: jest.fn() };
        mockGame = {
            width: 1920,
            height: 689,
            speed: 4,
            cabin: { isFullyVisible: false },
            isElyvorgFullyVisible: false,
            isTutorialActive: false,
            mapSelected: [false, false],
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

    test('plays soundtrack first update, fades out when cabin visible', () => {
        bg.update(16);
        expect(soundtrack.playSound).toHaveBeenCalledWith(bg.soundId, true);
        expect(bg.soundPlayed).toBe(true);

        mockGame.cabin.isFullyVisible = true;
        bg.update(16);
        expect(soundtrack.fadeOutAndStop).toHaveBeenCalledWith(bg.soundId);
        expect(bg.soundPlayed).toBe(false);
    });

    test('when elyvorg visible, no Layer.update but RaindropAnimation.update still called', () => {
        bg.update(0);
        expect(soundtrack.playSound).toHaveBeenCalled();

        mockGame.isElyvorgFullyVisible = true;
        layerSpy.mockClear();
        rainSpy.mockClear();
        bg.update(1);
        expect(soundtrack.fadeOutAndStop).toHaveBeenCalled();
        expect(layerSpy).not.toHaveBeenCalled();
        expect(rainSpy).toHaveBeenCalled();
    });

    test('totalDistanceTraveled respects tutorial and mapSelected flags', () => {
        mockGame.speed = 200;

        bg.totalDistanceTraveled = 0;
        bg.update(1);
        expect(bg.totalDistanceTraveled).toBeCloseTo(0.20);

        bg.totalDistanceTraveled = 0;
        mockGame.isTutorialActive = true;
        mockGame.mapSelected[1] = true;
        bg.update(1);
        expect(bg.totalDistanceTraveled).toBe(0);

        bg.totalDistanceTraveled = 0;
        mockGame.mapSelected[1] = false;
        bg.update(1);
        expect(bg.totalDistanceTraveled).toBeCloseTo(0.20);
    });

    test('draw calls each layer.draw in order without invoking real draws', () => {
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
        { Cls: Map1, id: 'map1Soundtrack', inserts: 5 },
        { Cls: Map2, id: 'map2Soundtrack', inserts: 2 },
        { Cls: Map3, id: 'map3Soundtrack', inserts: 6 },
        { Cls: Map4, id: 'map4Soundtrack', inserts: 3 },
        { Cls: Map5, id: 'map5Soundtrack', inserts: 6, hasRain: true },
        { Cls: Map6, id: 'map6Soundtrack', inserts: 0 }
    ];

    specs.forEach(({ Cls, id, inserts, hasRain = false }) => {
        test(`${Cls.name} sets soundId and layer count`, () => {
            document.body.innerHTML = Array(30).fill(0)
                .map((_, i) => `<img id="img${i}"/>`).join('');
            const game = {
                width: 1920, height: 689, speed: 1,
                cabin: { isFullyVisible: false },
                audioHandler: { mapSoundtrack: { playSound: () => { } } }
            };
            const map = new Cls(game);
            expect(map.soundId).toBe(id);

            const superArgs = Cls.prototype.constructor.toString()
                .match(/super\([^)]*\)/)[0];
            const baseCount = (superArgs.match(/{\s*imageId/g) || []).length;
            let expected = baseCount + inserts;
            if (hasRain) expected++;
            expect(map.backgroundLayers).toHaveLength(expected);
        });
    });
});

// -----------------------------------------------------------------------------
// Firefly
// -----------------------------------------------------------------------------
describe('Firefly', () => {
    let firefly, mockGame;

    beforeEach(() => {
        mockGame = { width: 1920, height: 689, speed: 5, cabin: { isFullyVisible: false } };
        firefly = new Firefly(mockGame, 3);
    });

    test('constructor creates correct number of entities', () => {
        expect(firefly.backgroundEntities).toHaveLength(3);
    });

    test('update removes only the x-out-of-bounds entity', () => {
        firefly.backgroundEntities = [
            { x: -1, y: 50, speed: 0, directionX: 0, directionY: 0 },
            { x: 10, y: 50, speed: 0, directionX: 0, directionY: 0 },
            { x: 20, y: 50, speed: 0, directionX: 0, directionY: 0 }
        ];
        firefly.update(1);
        expect(firefly.backgroundEntities).toHaveLength(2);
    });
});

// -----------------------------------------------------------------------------
// SmallFish
// -----------------------------------------------------------------------------
describe('SmallFish', () => {
    beforeAll(() => {
        jest.spyOn(SmallFish.prototype, 'spawnNewFish')
            .mockImplementation(() => { });
    });
    afterAll(() => {
        SmallFish.prototype.spawnNewFish.mockRestore();
    });

    let sf, mockGame;
    beforeEach(() => {
        document.body.innerHTML = Array(5).fill(0)
            .map((_, i) => `<img id="fish${i}"/>`).join('');
        mockGame = {
            width: 1920, height: 689, speed: 5,
            cabin: { isFullyVisible: false },
            player: { isUnderwater: false }
        };
        sf = new SmallFish(mockGame, 3);
    });

    test('update removes off-screen fish', () => {
        sf.backgroundEntities = [
            { x: -1, y: 10, speed: 0, directionX: 0, directionY: 0 },
            { x: 10, y: 10, speed: 0, directionX: 0, directionY: 0 },
            { x: 20, y: 10, speed: 0, directionX: 0, directionY: 0 }
        ];
        sf.update(1);
        expect(sf.backgroundEntities).toHaveLength(2);
    });
});

// -----------------------------------------------------------------------------
// BigFish
// -----------------------------------------------------------------------------
describe('BigFish', () => {
    let bf, mockGame;
    beforeAll(() => {
        jest.spyOn(BigFish.prototype, 'spawnNewFish')
            .mockImplementation(function () {
                this.backgroundEntities.push({
                    x: 0, y: 0, width: 10, height: 10,
                    speed: 1, directionX: 1, directionY: 0
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

    test('update spawns fish when timer ≥ interval & random < .2', () => {
        bf.backgroundEntities = [];
        bf.update(1);
        expect(bf.backgroundEntities.length).toBe(1);
    });

    test('removes fish that swim offscreen', () => {
        bf.backgroundEntities = [
            { x: -100, y: 0, width: 10, height: 10, speed: 1, directionX: 1, directionY: 0 }
        ];
        bf.update(1);
        expect(bf.backgroundEntities).toHaveLength(0);
        expect(bf.spawnTimer).toBe(0);
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
        test(`rain ON at totalDistanceTraveled = ${dist}`, () => {
            map5.totalDistanceTraveled = dist;
            map5.update(0);
            const rainLayer = map5.backgroundLayers.find(l => l instanceof RaindropAnimation);
            expect(rainLayer.isRaining).toBe(true);
            expect(soundtrack.playSound).toHaveBeenCalledWith('rainSound', true);
        });
    });

    test('rain stops immediately when cabin visible', () => {
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

    test('drops reset and splashes spawn when raining', () => {
        rain.isRaining = true;
        rain.raindrops.push({ x: 10, y: 700, length: 5, speed: 1 });
        rain.update(1);
        expect(rain.raindrops.some(d => d.y === 0)).toBe(true);
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
        document.body.innerHTML = `<img id="raindropSplash" width="20" height="20"/>`;
        splash = new RaindropSplashAnimation(mockGame, 10);
        ctx = { drawImage: jest.fn() };
    });

    test('calculateRandomY is within expected range', () => {
        const y = splash.calculateRandomY();
        expect(y).toBeGreaterThanOrEqual(mockGame.height - 25 - 55);
        expect(y).toBeLessThanOrEqual(mockGame.height);
    });

    test('update advances frames and marks deletion', () => {
        jest.useFakeTimers();
        splash.frameInterval = 1;
        splash.currentFrame = splash.maxFrames - 1;
        splash.update(2);
        expect(splash.currentFrame).toBe(splash.maxFrames);
        expect(splash.markedForDeletion).toBe(false);
        splash.update(2);
        expect(splash.markedForDeletion).toBe(true);
        jest.useRealTimers();
    });

    test('x moves by groundSpeed', () => {
        splash.bgSpeed = 2;
        mockGame.speed = 10;
        splash.x = 50;
        splash.update(1);
        expect(splash.x).toBe(30);
    });

    test('draw only when currentFrame < maxFrames', () => {
        splash.currentFrame = splash.maxFrames;
        splash.draw(ctx);
        expect(ctx.drawImage).not.toHaveBeenCalled();
        splash.currentFrame = 0;
        splash.draw(ctx);
        expect(ctx.drawImage).toHaveBeenCalled();
    });
});
