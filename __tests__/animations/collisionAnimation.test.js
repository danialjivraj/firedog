import { Skulnap, Abyssaw } from '../../game/entities/enemies/enemies.js';
import { FloatingMessage } from '../../game/animations/floatingMessages.js';
import {
  Collision,
  CollisionAnimation,
  GhostFadeOut,
  ExplosionCollisionAnimation,
  MeteorExplosionCollision,
  AsteroidExplosionCollision,
  ElectricityCollision,
  DarkExplosionCollision,
  RedFireballCollision,
  PurpleFireballCollision,
  PurpleThunderCollision,
  PoisonSpitSplash,
  PoisonDropCollision,
  PoisonDropGroundCollision,
  DisintegrateCollision,
  InkSplashCollision,
  InkBombCollision,
  Blood,
  IcyStormBallCollision,
  IceSlashCollision,
  IceTrailCollision,
  SpinningIceBallsCollision,
  PointyIcicleShardCollision,
  UndergroundIcicleCollision,
  GalacticSpikeCollision,
  HealingStar,
  HealingStarBurstCollision,
  BallParticleBurstCollision,
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
    constructor(text, x, y) {
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
  'asteroidExplosion',
  'electricityCollision',
  'darkExplosion',
  'redFireballCollision',
  'purpleFireballCollision',
  'purpleThunderCollision',
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
  'galacticSpikeCollision',
  'healingStar',
];

beforeAll(() => {
  document.body.innerHTML = allImageIds.map(id => `<img id="${id}">`).join('');
});

function makeBasicCtx() {
  return {
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
    drawImage: jest.fn(),
    strokeRect: jest.fn(),
  };
}

function makeExplosionGame(overrides = {}) {
  return {
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
      enemySFX: { stopSound: jest.fn(), playSound: jest.fn() },
    },
    ...overrides,
  };
}

describe('Collision', () => {
  let game;
  let ctx;

  beforeEach(() => {
    game = { speed: 5, debug: false, width: 999 };
    ctx = makeBasicCtx();
  });

  test('centers draw position and initializes frame timing', () => {
    const c = new Collision(game, 100, 200, 'testImage', 50, 60, 3, 10);

    expect(c.x).toBe(100 - 25);
    expect(c.y).toBe(200 - 30);

    expect(c.frameX).toBe(0);
    expect(c.maxFrame).toBe(3);

    expect(c.fps).toBe(10);
    expect(c.frameInterval).toBe(100);
    expect(c.frameTimer).toBe(0);
  });

  test('draw renders sprite frame and always saves/restores context', () => {
    const c = new Collision(game, 0, 0, 'testImage', 10, 10, 1, 1);
    c.draw(ctx);

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.drawImage).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();

    expect(ctx.strokeRect).not.toHaveBeenCalled();
  });

  test('draw clips when clipRect is provided', () => {
    const clipRect = { x: 10, h: 123 };
    const c = new Collision(game, 0, 0, 'testImage', 10, 10, 1, 1, 10, 10, clipRect);

    c.draw(ctx);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.rect).toHaveBeenCalledWith(0, 0, game.width, clipRect.h);
    expect(ctx.clip).toHaveBeenCalled();
    expect(ctx.drawImage).toHaveBeenCalled();
  });

  test('update scrolls left with game speed and accumulates time until frame interval passes', () => {
    const c = new Collision(game, 100, 100, 'testImage', 10, 10, 1, 10);

    c.update(50);
    expect(c.x).toBe(90);
    expect(c.frameX).toBe(0);
    expect(c.frameTimer).toBe(50);

    c.update(60);
    expect(c.x).toBe(85);
    expect(c.frameX).toBe(0);
    expect(c.frameTimer).toBe(110);

    c.update(1);
    expect(c.x).toBe(80);
    expect(c.frameX).toBe(1);
    expect(c.frameTimer).toBe(0);
    expect(c.markedForDeletion).toBe(false);
  });

  test('update does not advance when frameTimer equals frameInterval (strict > check)', () => {
    const c = new Collision(game, 0, 0, 'testImage', 10, 10, 99, 10);
    c.frameTimer = 100;

    c.update(0);

    expect(c.frameX).toBe(0);
    expect(c.frameTimer).toBe(100);
  });

  test('update scrolls clipRect.x when clipRect is present', () => {
    const clipRect = { x: 50, h: 100 };
    const c = new Collision(game, 0, 0, 'testImage', 10, 10, 10, 10, 10, 10, clipRect);

    c.update(0);
    expect(clipRect.x).toBe(45);
  });

  test('marks for deletion after advancing beyond maxFrame', () => {
    const c = new Collision(game, 0, 0, 'testImage', 10, 10, 1, 10);

    c.frameTimer = 1000;
    c.update(0);
    c.frameTimer = 1000;
    c.update(0);

    expect(c.frameX).toBe(2);
    expect(c.markedForDeletion).toBe(true);
  });
});

describe('CollisionAnimation', () => {
  test('uses normal collision sprite sheet when blue potion is inactive', () => {
    const game = { speed: 0 };
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const ca = new CollisionAnimation(game, 100, 200, false);

    expect(ca.image).toBe(document.getElementById('collisionAnimation'));
    expect(ca.spriteWidth).toBe(100);
    expect(ca.spriteHeight).toBe(90);
    expect(ca.maxFrame).toBe(4);
    expect(ca.fps).toBeCloseTo(5);

    Math.random.mockRestore();
  });

  test('uses blue collision sprite sheet when blue potion is active', () => {
    const game = { speed: 0 };
    const ca = new CollisionAnimation(game, 100, 200, true);

    expect(ca.image).toBe(document.getElementById('blueCollisionAnimation'));
    expect(ca.spriteWidth).toBe(113.857);
    expect(ca.spriteHeight).toBe(110);
    expect(ca.maxFrame).toBe(6);
    expect(ca.fps).toBe(25);
  });
});

describe('Blood', () => {
  test('stores enemy reference and can re-center on enemy', () => {
    const game = { speed: 0 };
    const enemy = { x: 200, y: 150, width: 50, height: 50 };
    const blood = new Blood(game, 0, 0, enemy);

    expect(blood.enemy).toBe(enemy);

    blood.updatePosition(enemy);
    expect(blood.x).toBe(enemy.x + 25 - blood.width * 0.5);
    expect(blood.y).toBe(enemy.y + 25 - blood.height * 0.5);
  });
});

describe('ExplosionCollisionAnimation', () => {
  test('constructor offsets y upward by 50', () => {
    const game = makeExplosionGame();
    const eca = new ExplosionCollisionAnimation(game, 100, 200, 'id');
    expect(eca.y).toBe(200 - 50 - eca.height * 0.5);
  });

  test('marks non-Skulnap enemy for deletion and grants coin + poof effects', () => {
    const game = makeExplosionGame();
    const enemy = { x: 50, y: 50, width: 10, height: 10, markedForDeletion: false };
    game.enemies.push(enemy);

    const eca = new ExplosionCollisionAnimation(game, 55, 55, 'id');
    eca.update(0);

    expect(enemy.markedForDeletion).toBe(true);
    expect(game.audioHandler.collisionSFX.playSound).toHaveBeenCalledWith('poofSound', false, true);
    expect(game.coins).toBe(1);
    expect(game.collisions[0]).toBeInstanceOf(CollisionAnimation);
    expect(game.floatingMessages[0]).toBeInstanceOf(FloatingMessage);
  });

  test('chains another explosion when Skulnap id differs (and plays associated sounds)', () => {
    const game = makeExplosionGame();
    const skul = new Skulnap();
    skul.id = 'abc';
    skul.x = 60; skul.y = 60; skul.width = 10; skul.height = 10; skul.markedForDeletion = false;
    game.enemies.push(skul);

    const eca = new ExplosionCollisionAnimation(game, skul.x + skul.width / 2, skul.y + skul.height / 2, 'xxx');
    eca.update(0);

    expect(skul.markedForDeletion).toBe(true);
    expect(game.audioHandler.enemySFX.stopSound).toHaveBeenCalledWith('skeletonRattlingSound');
    expect(game.audioHandler.collisionSFX.playSound).toHaveBeenCalledWith('explosionCollision', false, true);
    expect(game.collisions[0]).toBeInstanceOf(ExplosionCollisionAnimation);
  });

  test('does not chain explosion when Skulnap id matches, but still deletes the enemy', () => {
    const game = makeExplosionGame();
    const skul = new Skulnap();
    skul.id = 'same';
    skul.x = 60; skul.y = 60; skul.width = 10; skul.height = 10; skul.markedForDeletion = false;
    game.enemies.push(skul);

    const eca = new ExplosionCollisionAnimation(game, skul.x + skul.width / 2, skul.y + skul.height / 2, 'same');
    eca.update(0);

    expect(skul.markedForDeletion).toBe(true);
    expect(game.collisions).toHaveLength(0);
    expect(game.audioHandler.collisionSFX.playSound).not.toHaveBeenCalled();
  });

  test('stops chainsaw sound when enemy is Abyssaw', () => {
    const game = makeExplosionGame();
    const ab = new Abyssaw();
    ab.x = 70; ab.y = 70; ab.width = 10; ab.height = 10; ab.markedForDeletion = false;
    game.enemies.push(ab);

    const eca = new ExplosionCollisionAnimation(game, ab.x + ab.width / 2, ab.y + ab.height / 2, 'id');
    eca.update(0);

    expect(ab.markedForDeletion).toBe(true);
    expect(game.audioHandler.enemySFX.stopSound).toHaveBeenCalledWith('spinningChainsaw');
  });

  test('removes overlapping powerUps and spawns poof collision', () => {
    const game = makeExplosionGame();
    const pu = { x: 10, y: 10, width: 5, height: 5, markedForDeletion: false };
    game.powerUps.push(pu);

    const eca = new ExplosionCollisionAnimation(game, pu.x + pu.width / 2, pu.y + pu.height / 2, 'id');
    eca.update(0);

    expect(pu.markedForDeletion).toBe(true);
    expect(game.audioHandler.collisionSFX.playSound).toHaveBeenCalledWith('poofSound', false, true);
    expect(game.collisions[0]).toBeInstanceOf(CollisionAnimation);
  });

  test('removes overlapping powerDowns and spawns poof collision', () => {
    const game = makeExplosionGame();
    const pd = { x: 20, y: 20, width: 5, height: 5, markedForDeletion: false };
    game.powerDowns.push(pd);

    const eca = new ExplosionCollisionAnimation(game, pd.x + pd.width / 2, pd.y + pd.height / 2, 'id');
    eca.update(0);

    expect(pd.markedForDeletion).toBe(true);
    expect(game.audioHandler.collisionSFX.playSound).toHaveBeenCalledWith('poofSound', false, true);
    expect(game.collisions[0]).toBeInstanceOf(CollisionAnimation);
  });

  test('does nothing when gameOver is true', () => {
    const game = makeExplosionGame({ gameOver: true });
    const enemy = { x: 50, y: 50, width: 10, height: 10, markedForDeletion: false };
    game.enemies.push(enemy);

    const eca = new ExplosionCollisionAnimation(game, 55, 55, 'id');
    eca.update(0);

    expect(enemy.markedForDeletion).toBe(false);
    expect(game.coins).toBe(0);
    expect(game.collisions).toHaveLength(0);
    expect(game.audioHandler.collisionSFX.playSound).not.toHaveBeenCalled();
    expect(game.audioHandler.enemySFX.stopSound).not.toHaveBeenCalled();
  });
});

describe('Explosion sprite collisions', () => {
  test('MeteorExplosionCollision uses meteorExplosion sprite sheet', () => {
    const game = { speed: 0 };
    const mec = new MeteorExplosionCollision(game, 100, 200);

    expect(mec.image).toBe(document.getElementById('meteorExplosion'));
    expect(mec.spriteWidth).toBe(382);
    expect(mec.spriteHeight).toBe(332);
    expect(mec.maxFrame).toBe(5);
    expect(mec.fps).toBe(23);
  });

  test('AsteroidExplosionCollision uses asteroidExplosion sprite sheet', () => {
    const game = { speed: 0 };
    const aec = new AsteroidExplosionCollision(game, 100, 200);

    expect(aec.image).toBe(document.getElementById('asteroidExplosion'));
    expect(aec.spriteWidth).toBe(382);
    expect(aec.spriteHeight).toBe(332);
    expect(aec.maxFrame).toBe(5);
    expect(aec.fps).toBe(23);
  });
});

describe('ElectricityCollision', () => {
  test('uses electricity sprite sheet and can be repositioned', () => {
    const game = { speed: 0 };
    const ec = new ElectricityCollision(game, 0, 0);

    expect(ec.spriteWidth).toBe(215.25);
    expect(ec.spriteHeight).toBe(200);
    expect(ec.maxFrame).toBe(7);
    expect(ec.fps).toBe(20);

    const enemy = { x: 100, y: 50, width: 20, height: 30 };
    ec.updatePosition(enemy);
    expect(ec.x).toBe(enemy.x + 10 - ec.width * 0.5);
    expect(ec.y).toBe(enemy.y + 15 - ec.height * 0.5);

    ec.updatePositionWhereCollisionHappened(300, 400);
    expect(ec.x).toBe(300);
    expect(ec.y).toBe(400);
  });
});

describe('Various simple Collision subclasses', () => {
  const cases = [
    { Cls: DarkExplosionCollision, id: 'darkExplosion', w: 300.0952380952381, h: 279, fps: 50, maxFrame: 20 },
    { Cls: RedFireballCollision, id: 'redFireballCollision', w: 300.0952380952381, h: 280, fps: 50, maxFrame: 20 },
    { Cls: PurpleFireballCollision, id: 'purpleFireballCollision', w: 300.0952380952381, h: 280, fps: 50, maxFrame: 20 },
    { Cls: PurpleThunderCollision, id: 'purpleThunderCollision', w: 304, h: 293, fps: 50, maxFrame: 20 },
    { Cls: PoisonSpitSplash, id: 'poisonSpitSplash', w: 43, h: 73, fps: 80, maxFrame: 10 },
    { Cls: PoisonDropCollision, id: 'poisonDropCollision', w: 112, h: 102, fps: 30, maxFrame: 5 },
    { Cls: PoisonDropGroundCollision, id: 'poisonDropGroundCollision', w: 50, h: 50, fps: 30, maxFrame: 6 },
    { Cls: InkSplashCollision, id: 'blackInk', w: 278, h: 394, fps: 20, maxFrame: 6 },
    { Cls: InkBombCollision, id: 'inkBombCollision', w: 212, h: 212, fps: 20, maxFrame: 7 },
    { Cls: IcyStormBallCollision, id: 'icyStormBallCollision', w: 42.44444444444444, h: 50, fps: 50, maxFrame: 8 },
    { Cls: IceTrailCollision, id: 'iceTrailCollision', w: 28.83333333333333, h: 70, fps: 30, maxFrame: 5 },
    { Cls: SpinningIceBallsCollision, id: 'spinningIceBallsCollision', w: 37.2, h: 35, fps: 20, maxFrame: 4 },
    { Cls: PointyIcicleShardCollision, id: 'pointyIcicleShardCollision', w: 81, h: 130, fps: 20, maxFrame: 5 },
    { Cls: UndergroundIcicleCollision, id: 'undergroundIcicleCollision', w: 125.4, h: 200, fps: 20, maxFrame: 4 },
  ];

  cases.forEach(({ Cls, id, w, h, fps, maxFrame }) => {
    test(`${Cls.name} configures expected sprite sheet and timing`, () => {
      const game = { speed: 0 };
      const inst = new Cls(game, 150, 250);
      expect(inst.image).toBe(document.getElementById(id));
      expect(inst.spriteWidth).toBe(w);
      expect(inst.spriteHeight).toBe(h);
      expect(inst.fps).toBe(fps);
      expect(inst.maxFrame).toBe(maxFrame);
    });
  });
});

describe('GalacticSpikeCollision', () => {
  test('scales draw size and forwards clipRect', () => {
    const game = { speed: 0, width: 999 };
    const clipRect = { x: 10, h: 50 };
    const inst = new GalacticSpikeCollision(game, 100, 200, 2, 3, clipRect);

    const SPR_W = 211.5454545454545;
    const SPR_H = 180;

    expect(inst.image).toBe(document.getElementById('galacticSpikeCollision'));
    expect(inst.spriteWidth).toBeCloseTo(SPR_W);
    expect(inst.spriteHeight).toBeCloseTo(SPR_H);

    expect(inst.width).toBeCloseTo(SPR_W * 3);
    expect(inst.height).toBeCloseTo(SPR_H * 2);

    expect(inst.maxFrame).toBe(10);
    expect(inst.fps).toBe(30);
    expect(inst.clipRect).toBe(clipRect);
  });
});

describe('DisintegrateCollision', () => {
  let game;

  beforeEach(() => {
    game = { speed: 5, debug: false };
  });

  test('derives size/position/frames and angle from collisionDrawInfo when provided', () => {
    const image = { width: 70, height: 40 };
    const source = {
      image,
      width: 70,
      height: 40,
      x: 10,
      y: 20,
      frameX: 2,
      frameY: 1,
      collisionDrawInfo: { angle: Math.PI / 4 },
      direction: true,
    };

    const d = new DisintegrateCollision(game, source);

    expect(d.image).toBe(image);
    expect(d.spriteWidth).toBe(70);
    expect(d.spriteHeight).toBe(40);

    expect(d.x).toBe(10 + 70 * 0.5);
    expect(d.y).toBe(20 + 40 * 0.5);

    expect(d.frameX).toBe(2);
    expect(d.frameY).toBe(1);

    expect(d.angle).toBeCloseTo(Math.PI / 4);
    expect(d.direction).toBe(true);

    expect(d.shards).toHaveLength(28);
  });

  test('snapshots a drawable source when no image is provided', () => {
    const source = {
      x: 10,
      y: 20,
      width: 40,
      height: 30,
      draw: jest.fn(),
    };

    const fakeCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      drawImage: jest.fn(),
      globalAlpha: 1,
    };
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => fakeCtx),
    };

    const originalCreateElement = document.createElement.bind(document);
    const createSpy = jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') return fakeCanvas;
      return originalCreateElement(tag);
    });

    const d = new DisintegrateCollision(game, source, { snapshotWidth: 50, snapshotHeight: 60 });

    expect(fakeCanvas.width).toBe(50);
    expect(fakeCanvas.height).toBe(60);
    expect(fakeCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(source.draw).toHaveBeenCalled();
    expect(d.image).toBe(fakeCanvas);

    createSpy.mockRestore();
  });

  test('falls back to source.angle when drawInfo angle is missing', () => {
    const source = {
      image: { width: 10, height: 10 },
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      angle: 1.234,
      collisionDrawInfo: {},
    };

    const d = new DisintegrateCollision(game, source);
    expect(d.angle).toBeCloseTo(1.234);
  });

  test('falls back to atan2(vy, vx) when angle is missing but velocity is present', () => {
    const source = {
      image: { width: 10, height: 10 },
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      vx: 3,
      vy: 4,
      collisionDrawInfo: {},
    };

    const d = new DisintegrateCollision(game, source);
    expect(d.angle).toBeCloseTo(Math.atan2(4, 3));
  });

  test('falls back to 0 angle when no angle or velocity exists', () => {
    const source = {
      image: { width: 10, height: 10 },
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      collisionDrawInfo: {},
    };

    const d = new DisintegrateCollision(game, source);
    expect(d.angle).toBe(0);
  });

  test('update scrolls with world when not following a target and fades shards over time', () => {
    const source = {
      image: { width: 70, height: 40 },
      width: 70,
      height: 40,
      x: 0,
      y: 0,
    };

    const d = new DisintegrateCollision(game, source);
    const initialX = d.x;

    d.update(100);

    expect(d.x).toBe(initialX - game.speed);

    const t = Math.min(1, d.timer / d.duration);
    const expectedAlpha = 1 - t * 1.1;
    const expectedScale = 1 - t * 0.85;

    d.shards.forEach(shard => {
      expect(shard.alpha).toBeCloseTo(expectedAlpha);
      expect(shard.scale).toBeCloseTo(expectedScale);
    });
  });

  test('update centers on followTarget when provided', () => {
    const source = { image: { width: 40, height: 40 }, width: 40, height: 40, x: 0, y: 0 };
    const followTarget = { x: 100, y: 200, width: 20, height: 30 };

    const d = new DisintegrateCollision(game, source, { followTarget });

    d.update(16);
    expect(d.x).toBe(followTarget.x + followTarget.width * 0.5);
    expect(d.y).toBe(followTarget.y + followTarget.height * 0.5);
  });

  test('draw exits early when there is no image', () => {
    const d = new DisintegrateCollision(game, {});
    d.image = null;

    const ctx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      strokeRect: jest.fn(),
      drawImage: jest.fn(),
    };

    d.draw(ctx);
    expect(ctx.drawImage).not.toHaveBeenCalled();
    expect(ctx.save).not.toHaveBeenCalled();
  });

  test('draw renders at least one shard when visible', () => {
    const source = { image: { width: 70, height: 40 }, width: 70, height: 40, x: 0, y: 0 };
    const d = new DisintegrateCollision(game, source);

    d.shards[0].alpha = 1;
    d.shards[0].scale = 1;

    const ctx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      strokeRect: jest.fn(),
      drawImage: jest.fn(),
      globalAlpha: 1,
    };

    d.draw(ctx);
    expect(ctx.drawImage).toHaveBeenCalled();
  });
});

describe('GhostFadeOut', () => {
  let game;
  let enemy;
  let ctx;

  beforeEach(() => {
    game = { speed: 3, debug: false };
    enemy = {
      image: { width: 100, height: 120 },
      width: 100,
      height: 120,
      x: 50,
      y: 80,
      frameX: 1,
      frameY: 0,
      incrementMovement: 1,
    };
    ctx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      strokeRect: jest.fn(),
      drawImage: jest.fn(),
      globalAlpha: 1,
    };
  });

  test('splits sprite into 12 bands and starts fully opaque', () => {
    const ghost = new GhostFadeOut(game, enemy);

    expect(ghost.image).toBe(enemy.image);
    expect(ghost.spriteWidth).toBe(enemy.width);
    expect(ghost.spriteHeight).toBe(enemy.height);
    expect(ghost.bands).toHaveLength(12);

    expect(ghost.timer).toBe(0);
    expect(ghost.alpha).toBe(1);
    expect(ghost.markedForDeletion).toBe(false);
  });

  test('update scrolls left, fades out, and deletes after duration', () => {
    const ghost = new GhostFadeOut(game, enemy);
    const initialX = ghost.x;

    ghost.update(100);
    expect(ghost.x).toBe(initialX - game.speed);
    expect(ghost.alpha).toBeLessThan(1);
    expect(ghost.markedForDeletion).toBe(false);

    ghost.update(400);
    expect(ghost.markedForDeletion).toBe(true);
  });

  test('draw optionally renders debug bounds and draws band slices', () => {
    game.debug = true;
    const ghost = new GhostFadeOut(game, enemy);

    ghost.draw(ctx);

    expect(ctx.strokeRect).toHaveBeenCalledWith(ghost.x, ghost.y, ghost.width, ghost.height);
    expect(ctx.drawImage).toHaveBeenCalled();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});

describe('IceSlashCollision', () => {
  test('defaults to non-inverted orientation and can invert rendering horizontally', () => {
    const game = { speed: 0, debug: false };
    const ctx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      drawImage: jest.fn(),
      strokeRect: jest.fn(),
    };

    const normal = new IceSlashCollision(game, 100, 200);
    expect(normal.shouldInvert).toBe(false);
    normal.draw(ctx);
    expect(ctx.scale).toHaveBeenCalledWith(1, 1);

    const inverted = new IceSlashCollision(game, 100, 200, true);
    inverted.draw(ctx);
    expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
  });

  test('draw renders debug bounds when game.debug is true', () => {
    const game = { speed: 0, debug: true };
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

    expect(ctx.strokeRect).toHaveBeenCalledWith(slash.x, slash.y, slash.width, slash.height);
  });
});

describe('HealingStar', () => {
  test('follows followTarget center when not fixed', () => {
    const game = { speed: 0 };
    const target = { x: 100, y: 200, width: 50, height: 40, markedForDeletion: false };

    const star = new HealingStar(game, target, { dx: 10, dy: -20 }, { followTarget: target });
    star.update(0);

    const cx = target.x + target.width / 2;
    const cy = target.y + target.height / 2;
    expect(star.x).toBe(cx - star.width / 2 + 10);
    expect(star.y).toBe(cy - star.height / 2 - 20);
  });

  test('uses fixed x/y when provided', () => {
    const game = { speed: 0 };
    const target = { x: 100, y: 200, width: 50, height: 40, markedForDeletion: false };

    const star = new HealingStar(game, target, { dx: 0, dy: 0 }, { x: 300, y: 400 });
    star.update(0);

    expect(star.x).toBe(300);
    expect(star.y).toBe(400);

    target.x = 999;
    target.y = 999;
    star.update(0);
    expect(star.x).toBe(300);
    expect(star.y).toBe(400);
  });

  test('advances frames on interval and marks for deletion after maxFrame', () => {
    const game = { speed: 0 };
    const target = { x: 0, y: 0, width: 10, height: 10, markedForDeletion: false };

    const star = new HealingStar(game, target, { dx: 0, dy: 0 }, { fps: 10, maxFrame: 2 });
    star.update(100);
    expect(star.frameX).toBe(1);
    expect(star.markedForDeletion).toBe(false);

    star.update(100);
    expect(star.frameX).toBe(2);
    expect(star.markedForDeletion).toBe(false);

    star.update(100);
    expect(star.markedForDeletion).toBe(true);
  });

  test('draw does nothing if image is missing', () => {
    const game = { speed: 0 };
    const star = new HealingStar(game, null, { dx: 0, dy: 0 });
    star.image = null;

    const ctx = { drawImage: jest.fn() };
    star.draw(ctx);

    expect(ctx.drawImage).not.toHaveBeenCalled();
  });
});

describe('HealingStarBurstCollision', () => {
  test('start() spawns the first star and plays sound only once', () => {
    const game = { speed: 0, audioHandler: { enemySFX: { playSound: jest.fn() } } };
    const target = { x: 0, y: 0, width: 10, height: 10, markedForDeletion: false };

    const burst = new HealingStarBurstCollision(game, target, { soundId: 'healingStarSound', playSound: true });

    expect(burst.started).toBe(false);
    expect(burst.stars).toHaveLength(0);

    burst.start();
    expect(burst.started).toBe(true);
    expect(burst.stars).toHaveLength(1);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('healingStarSound', false, true);

    burst.start();
    expect(burst.stars).toHaveLength(1);
  });

  test('spawns the next star once a star reaches halfway through its frames and finishes when all stars are gone', () => {
    const game = { speed: 0, audioHandler: { enemySFX: { playSound: jest.fn() } } };
    const target = { x: 0, y: 0, width: 10, height: 10, markedForDeletion: false };

    const offsets = [{ dx: 0, dy: 0 }, { dx: 10, dy: 0 }];
    const burst = new HealingStarBurstCollision(game, target, { offsets, playSound: false });

    burst.start();
    expect(burst.spawned).toBe(1);

    burst.stars[0].frameX = 3;
    burst.update(0);

    expect(burst.spawned).toBe(2);
    expect(burst.stars).toHaveLength(2);

    burst.stars.forEach(s => { s.markedForDeletion = true; });
    burst.update(0);

    expect(burst.finished).toBe(true);
    expect(burst.markedForDeletion).toBe(true);
  });

  test('supports fixed-position spawning when x/y are provided', () => {
    const game = { speed: 0, audioHandler: { enemySFX: { playSound: jest.fn() } } };

    const burst = new HealingStarBurstCollision(game, null, {
      x: 300,
      y: 400,
      offsets: [{ dx: 0, dy: 0 }],
      playSound: false,
    });

    burst.start();
    expect(burst.stars).toHaveLength(1);

    burst.update(0);
    expect(burst.stars[0].x).toBe(300);
    expect(burst.stars[0].y).toBe(400);
  });

  test('update does nothing before start() is called', () => {
    const game = { speed: 0, audioHandler: { enemySFX: { playSound: jest.fn() } } };
    const burst = new HealingStarBurstCollision(game, null, { playSound: false });

    burst.update(100);
    expect(burst.started).toBe(false);
    expect(burst.stars).toHaveLength(0);
  });
});

describe('BallParticleBurstCollision', () => {
  test('scrolls with world when no followTarget and scrollsWithWorld=true', () => {
    const game = { speed: 10 };
    const burst = new BallParticleBurstCollision(game, 100, 0, { duration: 999, count: 1, scrollsWithWorld: true });

    burst.update(16.6667);
    expect(burst.x).toBeCloseTo(90, 2);
  });

  test('does not scroll when scrollsWithWorld=false and no followTarget', () => {
    const game = { speed: 10 };
    const burst = new BallParticleBurstCollision(game, 100, 0, { duration: 999, count: 1, scrollsWithWorld: false });

    burst.update(16.6667);
    expect(burst.x).toBeCloseTo(100, 2);
  });

  test('follows followTarget center when provided', () => {
    const game = { speed: 999 };
    const target = { x: 50, y: 60, width: 20, height: 40, markedForDeletion: false };

    const burst = new BallParticleBurstCollision(game, 0, 0, { followTarget: target, duration: 999, count: 1 });

    burst.update(16);
    expect(burst.x).toBe(target.x + target.width * 0.5);
    expect(burst.y).toBe(target.y + target.height * 0.5);

    target.x = 100;
    target.y = 200;
    burst.update(16);
    expect(burst.x).toBe(target.x + target.width * 0.5);
    expect(burst.y).toBe(target.y + target.height * 0.5);
  });

  test('marks for deletion after duration elapses', () => {
    const game = { speed: 0 };
    const burst = new BallParticleBurstCollision(game, 0, 0, { duration: 20, count: 1 });

    burst.update(10);
    expect(burst.markedForDeletion).toBe(false);

    burst.update(15);
    expect(burst.markedForDeletion).toBe(true);
  });

  test('draw does nothing when there are no particles', () => {
    const game = { speed: 0 };
    const burst = new BallParticleBurstCollision(game, 0, 0, { count: 0 });

    const ctx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      set fillStyle(v) { this._fillStyle = v; },
      get fillStyle() { return this._fillStyle; },
      globalAlpha: 1,
    };

    burst.draw(ctx);
    expect(ctx.save).not.toHaveBeenCalled();
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  test('draw renders circles for particles with visible alpha', () => {
    const game = { speed: 0 };
    const burst = new BallParticleBurstCollision(game, 10, 20, { count: 1 });
    burst.particles[0].drawAlpha = 1;

    const ctx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      set fillStyle(v) { this._fillStyle = v; },
      get fillStyle() { return this._fillStyle; },
      globalAlpha: 1,
    };

    burst.draw(ctx);

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.translate).toHaveBeenCalledWith(10, 20);
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});
