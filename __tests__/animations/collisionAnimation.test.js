import { Skulnap, Abyssaw } from '../../game/entities/enemies/enemies.js';
import { FloatingMessage } from '../../game/animations/floatingMessages.js';
import {
    Collision,
    CollisionAnimation,
    ExplosionCollisionAnimation,
    MeteorExplosionCollision,
    ElectricityCollision,
    DarkExplosion,
    RedFireballExplosion,
    PurpleFireballExplosion,
    PoisonSpitSplash,
    PoisonDropCollision,
    PoisonDropGroundCollision,
    InkSplashCollision,
    InkBombCollision,
    Blood,
    IcyStormBallCollision,
    IceSlashCollision,
    IceTrailCollision,
    SpinningIceBallsCollision,
    PointyIcicleShardCollision,
    UndergroundIcicleCollision,
} from '../../game/animations/collisionAnimation.js';

jest.mock('../../game/entities/enemies/enemies.js', () => ({
    Skulnap: class Skulnap {
        constructor() { this.id = null; this.x = 0; this.y = 0; this.width = 0; this.height = 0; }
    },
    Abyssaw: class Abyssaw {
        constructor() { this.x = 0; this.y = 0; this.width = 0; this.height = 0; }
    }
}));

jest.mock('../../game/animations/floatingMessages.js', () => ({
    FloatingMessage: class FloatingMessage {
        constructor(text, x, y, s1, s2, s3) {
            this.text = text;
            this.x = x;
            this.y = y;
        }
    }
}));

const allImageIds = [
    'testImage',
    'collisionAnimation',
    'blueCollisionAnimation',
    'explosionCollisionAnimation',
    'meteorExplosion',
    'electricityCollision',
    'darkExplosion',
    'redFireballCollision',
    'purpleFireballCollision',
    'poisonSpitSplash',
    'poisonDropCollision',
    'poisonDropGroundCollision',
    'blackInk',
    'inkBombCollision',
    'blood',
    'icyStormBallCollision',
    'iceSlashCollision',
    'iceTrailCollision',
    'spinningIceBallsCollision',
    'pointyIcicleShardCollision',
    'undergroundIcicleCollision',
];

beforeAll(() => {
    document.body.innerHTML = allImageIds.map(id => `<img id="${id}">`).join('');
});

describe('Collision', () => {
    let game, ctx;

    beforeEach(() => {
        game = { speed: 5, debug: false };
        ctx = {
            drawImage: jest.fn(),
            strokeRect: jest.fn()
        };
    });

    test('constructor initializes correctly', () => {
        const c = new Collision(game, 100, 200, 'testImage', 50, 60, 3, 10);
        expect(c.x).toBe(100 - 25);
        expect(c.y).toBe(200 - 30);
        expect(c.frameX).toBe(0);
        expect(c.maxFrame).toBe(3);
        expect(c.frameInterval).toBe(100);
        expect(c.frameTimer).toBe(0);
    });

    test('draw without debug: only drawImage', () => {
        const c = new Collision(game, 0, 0, 'testImage', 10, 10, 1, 1);
        c.draw(ctx);
        expect(ctx.strokeRect).not.toHaveBeenCalled();
        expect(ctx.drawImage).toHaveBeenCalled();
    });

    test('draw with debug: strokeRect and drawImage', () => {
        game.debug = true;
        const c = new Collision(game, 0, 0, 'testImage', 10, 10, 1, 1);
        c.draw(ctx);
        expect(ctx.strokeRect).toHaveBeenCalledWith(c.x, c.y, c.width, c.height);
        expect(ctx.drawImage).toHaveBeenCalled();
    });

    test('update advances frames correctly and eventually marks deletion', () => {
        // initial x = 100 - (10/2) = 95
        const c = new Collision(game, 100, 100, 'testImage', 10, 10, 1, 10);

        c.update(50);
        expect(c.x).toBe(90);    // 95 - 5
        expect(c.frameX).toBe(0);
        expect(c.frameTimer).toBe(50);

        c.update(60);
        expect(c.x).toBe(85);    // 90 - 5
        expect(c.frameX).toBe(0);
        expect(c.frameTimer).toBe(110);

        c.update(1);
        expect(c.x).toBe(80);    // 85 - 5
        expect(c.frameX).toBe(1);
        expect(c.frameTimer).toBe(0);
        expect(c.markedForDeletion).toBe(false);

        c.update(200);
        expect(c.x).toBe(75);    // 80 - 5
        expect(c.frameX).toBe(1);
        expect(c.markedForDeletion).toBe(false);

        c.update(1);
        expect(c.x).toBe(70);    // 75 - 5
        expect(c.frameX).toBe(2);
        expect(c.markedForDeletion).toBe(true);
    });
});

describe('CollisionAnimation', () => {
    let game;

    beforeEach(() => {
        game = { speed: 0 };
    });

    test('default (non-blue) uses collisionAnimation settings', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const ca = new CollisionAnimation(game, 100, 200, false);
        expect(ca.image).toBe(document.getElementById('collisionAnimation'));
        expect(ca.spriteWidth).toBe(100);
        expect(ca.spriteHeight).toBe(90);
        expect(ca.maxFrame).toBe(4);
        expect(ca.fps).toBeCloseTo(5);
        Math.random.mockRestore();
    });

    test('blue potion active uses blueCollisionAnimation settings', () => {
        const ca = new CollisionAnimation(game, 100, 200, true);
        expect(ca.image).toBe(document.getElementById('blueCollisionAnimation'));
        expect(ca.spriteWidth).toBe(113.857);
        expect(ca.spriteHeight).toBe(110);
        expect(ca.maxFrame).toBe(6);
        expect(ca.fps).toBe(25);
    });
});

describe('ExplosionCollisionAnimation', () => {
    let game, eca;

    beforeEach(() => {
        game = {
            speed: 0,
            gameOver: false,
            enemies: [],
            powerUps: [],
            powerDowns: [],
            collisions: [],
            floatingMessages: [],
            coins: 0,
            audioHandler: {
                collisionSFX: { playSound: jest.fn() },
                enemySFX: { stopSound: jest.fn() }
            }
        };
    });

    test('non-Skulnap enemy triggers poof, coin, messages, collision', () => {
        const enemy = { x: 50, y: 50, width: 10, height: 10, markedForDeletion: false };
        game.enemies.push(enemy);
        eca = new ExplosionCollisionAnimation(game, 55, 55, 'id');
        eca.update(0);

        expect(enemy.markedForDeletion).toBe(true);
        expect(game.audioHandler.collisionSFX.playSound)
            .toHaveBeenCalledWith('poofSound', false, true);
        expect(game.coins).toBe(1);
        expect(game.collisions[0]).toBeInstanceOf(CollisionAnimation);
        expect(game.floatingMessages[0]).toBeInstanceOf(FloatingMessage);
    });

    test('Skulnap enemy triggers second explosion and skeletonSFX', () => {
        const skul = new Skulnap();
        skul.id = 'abc';
        skul.x = 60; skul.y = 60; skul.width = 10; skul.height = 10; skul.markedForDeletion = false;
        game.enemies.push(skul);
        eca = new ExplosionCollisionAnimation(game, skul.x + skul.width / 2, skul.y + skul.height / 2, 'xxx');
        eca.update(0);

        expect(skul.markedForDeletion).toBe(true);
        expect(game.audioHandler.enemySFX.stopSound)
            .toHaveBeenCalledWith('skeletonRattlingSound');
        expect(game.audioHandler.collisionSFX.playSound)
            .toHaveBeenCalledWith('explosionCollision', false, true);
        expect(game.collisions[0]).toBeInstanceOf(ExplosionCollisionAnimation);
    });

    test('Skulnap enemy with matching id does not chain explode again', () => {
        const skul = new Skulnap();
        skul.id = 'same';
        skul.x = 60; skul.y = 60; skul.width = 10; skul.height = 10; skul.markedForDeletion = false;
        game.enemies.push(skul);
        eca = new ExplosionCollisionAnimation(game, skul.x + skul.width / 2, skul.y + skul.height / 2, 'same');
        eca.update(0);

        expect(skul.markedForDeletion).toBe(true);
        expect(game.collisions).toHaveLength(0);
        expect(game.audioHandler.collisionSFX.playSound).not.toHaveBeenCalled();
    });

    test('Abyssaw enemy also stops spinningChainsaw', () => {
        const ab = new Abyssaw();
        ab.x = 70; ab.y = 70; ab.width = 10; ab.height = 10; ab.markedForDeletion = false;
        game.enemies.push(ab);
        eca = new ExplosionCollisionAnimation(game, ab.x + ab.width / 2, ab.y + ab.height / 2, 'id');
        eca.update(0);

        expect(ab.markedForDeletion).toBe(true);
        expect(game.audioHandler.enemySFX.stopSound)
            .toHaveBeenCalledWith('spinningChainsaw');
    });

    test('powerUps trigger poof and collision', () => {
        const pu = { x: 10, y: 10, width: 5, height: 5, markedForDeletion: false };
        game.powerUps.push(pu);
        eca = new ExplosionCollisionAnimation(game, pu.x + pu.width / 2, pu.y + pu.height / 2, 'id');
        eca.update(0);

        expect(pu.markedForDeletion).toBe(true);
        expect(game.audioHandler.collisionSFX.playSound)
            .toHaveBeenCalledWith('poofSound', false, true);
        expect(game.collisions[0]).toBeInstanceOf(CollisionAnimation);
    });

    test('powerDowns trigger poof and collision', () => {
        const pd = { x: 20, y: 20, width: 5, height: 5, markedForDeletion: false };
        game.powerDowns.push(pd);
        eca = new ExplosionCollisionAnimation(game, pd.x + pd.width / 2, pd.y + pd.height / 2, 'id');
        eca.update(0);

        expect(pd.markedForDeletion).toBe(true);
        expect(game.audioHandler.collisionSFX.playSound)
            .toHaveBeenCalledWith('poofSound', false, true);
        expect(game.collisions[0]).toBeInstanceOf(CollisionAnimation);
    });

    test('does nothing when gameOver is true even on overlapping enemy', () => {
        const enemy = { x: 50, y: 50, width: 10, height: 10, markedForDeletion: false };
        game.enemies.push(enemy);
        game.gameOver = true;

        eca = new ExplosionCollisionAnimation(game, 55, 55, 'id');
        eca.update(0);

        expect(enemy.markedForDeletion).toBe(false);
        expect(game.coins).toBe(0);
        expect(game.collisions).toHaveLength(0);
        expect(game.audioHandler.collisionSFX.playSound).not.toHaveBeenCalled();
        expect(game.audioHandler.enemySFX.stopSound).not.toHaveBeenCalled();
    });
});

describe('MeteorExplosionCollision', () => {
    let game, mec;

    beforeEach(() => {
        game = { speed: 0 };
        mec = new MeteorExplosionCollision(game, 100, 200);
    });

    test('constructor sets correct properties', () => {
        expect(mec.image).toBe(document.getElementById('meteorExplosion'));
        expect(mec.spriteWidth).toBe(382);
        expect(mec.spriteHeight).toBe(332);
        expect(mec.maxFrame).toBe(5);
        expect(mec.fps).toBe(23);
        expect(mec.x).toBe(100 - 382 * 0.5);
        expect(mec.y).toBe(200 - 332 * 0.5);
    });
});

describe('ElectricityCollision', () => {
    let ec, game;

    beforeEach(() => {
        game = { speed: 0 };
        ec = new ElectricityCollision(game, 0, 0);
    });

    test('constructor sets size and frames', () => {
        expect(ec.spriteWidth).toBe(215.25);
        expect(ec.spriteHeight).toBe(200);
        expect(ec.maxFrame).toBe(7);
        expect(ec.fps).toBe(20);
    });

    test('updatePosition centers on enemy', () => {
        const enemy = { x: 100, y: 50, width: 20, height: 30 };
        ec.updatePosition(enemy);
        expect(ec.x).toBe(enemy.x + 10 - ec.width * 0.5);
        expect(ec.y).toBe(enemy.y + 15 - ec.height * 0.5);
    });

    test('updatePositionWhereCollisionHappened sets absolute coords', () => {
        ec.updatePositionWhereCollisionHappened(300, 400);
        expect(ec.x).toBe(300);
        expect(ec.y).toBe(400);
    });
});

describe('Various simple Collision subclasses', () => {
    const cases = [
        { Cls: DarkExplosion, id: 'darkExplosion', w: 300.0952380952381, h: 279, f: 50, m: 20 },
        { Cls: RedFireballExplosion, id: 'redFireballCollision', w: 300.0952380952381, h: 280, f: 50, m: 20 },
        { Cls: PurpleFireballExplosion, id: 'purpleFireballCollision', w: 300.0952380952381, h: 280, f: 50, m: 20 },
        { Cls: PoisonSpitSplash, id: 'poisonSpitSplash', w: 43, h: 73, f: 80, m: 10 },
        { Cls: PoisonDropCollision, id: 'poisonDropCollision', w: 112, h: 102, f: 30, m: 5 },
        { Cls: PoisonDropGroundCollision, id: 'poisonDropGroundCollision', w: 50, h: 50, f: 30, m: 6 },
        { Cls: InkSplashCollision, id: 'blackInk', w: 278, h: 394, f: 20, m: 6 },
        { Cls: InkBombCollision, id: 'inkBombCollision', w: 212, h: 212, f: 20, m: 7 },
        { Cls: IcyStormBallCollision, id: 'icyStormBallCollision', w: 42.44444444444444, h: 50, f: 50, m: 8 },
        { Cls: IceTrailCollision, id: 'iceTrailCollision', w: 28.83333333333333, h: 70, f: 30, m: 5 },
        { Cls: SpinningIceBallsCollision, id: 'spinningIceBallsCollision', w: 37.2, h: 35, f: 20, m: 4 },
        { Cls: PointyIcicleShardCollision, id: 'pointyIcicleShardCollision', w: 81, h: 130, f: 20, m: 5 },
        { Cls: UndergroundIcicleCollision, id: 'undergroundIcicleCollision', w: 125.4, h: 200, f: 20, m: 4 },
    ];

    cases.forEach(({ Cls, id, w, h, f, m }) => {
        test(`${Cls.name} sets correct props`, () => {
            const game = { speed: 0 };
            const inst = new Cls(game, 150, 250);
            expect(inst.image).toBe(document.getElementById(id));
            expect(inst.spriteWidth).toBe(w);
            expect(inst.spriteHeight).toBe(h);
            expect(inst.fps).toBe(f);
            expect(inst.maxFrame).toBe(m);
        });
    });
});

describe('IceSlashCollision', () => {
    test('constructor sets size, frames and default orientation', () => {
        const game = { speed: 0 };
        const slash = new IceSlashCollision(game, 100, 200);
        expect(slash.image).toBe(document.getElementById('iceSlashCollision'));
        expect(slash.spriteWidth).toBe(119);
        expect(slash.spriteHeight).toBe(150);
        expect(slash.maxFrame).toBe(5);
        expect(slash.fps).toBe(30);
        expect(slash.shouldInvert).toBe(false);
    });

    test('constructor respects shouldInvert=true', () => {
        const game = { speed: 0 };
        const slash = new IceSlashCollision(game, 100, 200, true);
        expect(slash.shouldInvert).toBe(true);
    });

    test('draw uses scale(1, 1) when not inverted', () => {
        const game = { speed: 0, debug: false };
        const ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            drawImage: jest.fn(),
            strokeRect: jest.fn(),
        };

        const slash = new IceSlashCollision(game, 100, 200, false);
        slash.draw(ctx);

        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.translate).toHaveBeenCalled();
        expect(ctx.scale).toHaveBeenCalledWith(1, 1);
        expect(ctx.drawImage).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });

    test('draw uses scale(-1, 1) when inverted', () => {
        const game = { speed: 0, debug: false };
        const ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            drawImage: jest.fn(),
            strokeRect: jest.fn(),
        };

        const slash = new IceSlashCollision(game, 100, 200, true);
        slash.draw(ctx);

        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.translate).toHaveBeenCalled();
        expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
        expect(ctx.drawImage).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });
});

describe('Blood', () => {
    let blood, game, enemy;

    beforeEach(() => {
        game = { speed: 0 };
        enemy = { x: 200, y: 150, width: 50, height: 50 };
        blood = new Blood(game, 0, 0, enemy);
    });

    test('constructor stores enemy', () => {
        expect(blood.enemy).toBe(enemy);
    });

    test('updatePosition centers on enemy', () => {
        blood.updatePosition(enemy);
        expect(blood.x).toBe(enemy.x + 25 - blood.width * 0.5);
        expect(blood.y).toBe(enemy.y + 25 - blood.height * 0.5);
    });
});
