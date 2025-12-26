import {
  Enemy,
  Barrier,
  BurrowingGroundEnemy,
  FlyingEnemy,
  GroundEnemy,
  MovingGroundEnemy,
  ImmobileGroundEnemy,
  ClimbingEnemy,
  VerticalEnemy,
  FallingEnemy,
  UnderwaterEnemy,
  BeeInstances,
  Projectile,
  WindAttack,
  LeafAttack,
  PoisonSpit,
  LaserBeam,
  IceBall,
  DarkLaser,
  YellowBeam,
  InkBeam,
  PurpleLaser,
  RockProjectile,
  Goblin,
  Dotter,
  Vertibat,
  Ghobat,
  Ravengloom,
  MeatSoldier,
  Skulnap,
  Abyssaw,
  GlidoSpike,
  DuskPlant,
  Silknoir,
  WalterTheGhost,
  Ben,
  Aura,
  Gloomlet,
  Dolly,
  Piranha,
  SkeletonFish,
  SpearFish,
  JetFish,
  Piper,
  Voltzeel,
  Garry,
  BigGreener,
  Chiquita,
  Sluggie,
  LilHornet,
  KarateCroco,
  Zabkous,
  SpidoLazer,
  Jerry,
  Snailey,
  RedFlyer,
  PurpleFlyer,
  LazyMosquito,
  LeafSlug,
  Sunflora,
  Eggry,
  Tauro,
  Bee,
  AngryBee,
  HangingSpidoLazer,
  Cactus,
  PetroPlant,
  Plazer,
  Veynoculus,
  Volcanurtle,
  TheRock,
  VolcanoWasp,
  Rollhog,
  Dragon,
} from '../../../game/entities/enemies/enemies';

beforeAll(() => {
  global.document = {
    getElementById: jest.fn(() => ({
      width: 1920,
      height: 689,
    })),
  };
});

const mockRandom = (val = 0.5) => jest.spyOn(Math, 'random').mockReturnValue(val);
const restoreRandom = () => {
  if (Math.random.mockRestore) Math.random.mockRestore();
};

const makeGame = (overrides = {}) => ({
  width: 1920,
  height: 689,
  speed: 0,
  groundMargin: 10,
  cabin: { isFullyVisible: false },
  enemies: [],
  background: { isRaining: false },
  boss: { isVisible: false, current: null, id: null, talkToBoss: false, runAway: false, inFight: false },
  player: { x: 0, y: 0 },
  hiddenTime: 0,
  gameOver: false,
  debug: false,
  audioHandler: {
    enemySFX: { playSound: jest.fn(), stopSound: jest.fn(), stopAllSounds: jest.fn() },
    mapSoundtrack: { fadeOutAndStop: jest.fn() },
  },
  input: { keys: [] },
  collisions: [],
  behindPlayerParticles: [],
  canvas: {},
  ...overrides,
});

const makeCtx = (overrides = {}) => ({
  drawImage: jest.fn(),
  strokeRect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  scale: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  ellipse: jest.fn(),
  fill: jest.fn(),

  shadowColor: null,
  shadowBlur: 0,
  globalAlpha: null,
  fillStyle: null,
  strokeStyle: null,
  lineWidth: null,

  ...overrides,
});

const placeOnScreen = (e, game) => {
  e.x = 1;
  e.y = 1;
  e.width = e.width || 10;
  e.height = e.height || 10;
  e.speedX = 0;
  e.speedY = 0;
  if (game) game.speed = 0;
};

// -----------------------------------------------------------------------------
// Enemy (base class)
// -----------------------------------------------------------------------------
describe('Enemy (base class)', () => {
  let game, ctx, e;

  beforeEach(() => {
    game = makeGame({
      speed: 5,
      audioHandler: { enemySFX: { playSound: jest.fn(), stopSound: jest.fn() } },
    });

    ctx = makeCtx();

    e = new Enemy();
    Object.assign(e, {
      game,
      width: 10,
      height: 10,
      x: 100,
      y: 50,
      speedX: 2,
      speedY: 3,
      maxFrame: 2,
      image: {},
      soundId: 'boom',
    });
  });

  it('isOnScreen() returns true only when within screen bounds', () => {
    expect(e.isOnScreen()).toBe(true);

    e.x = -e.width - 1;
    expect(e.isOnScreen()).toBe(false);

    e.x = 0;
    e.y = game.height + 1;
    expect(e.isOnScreen()).toBe(false);
  });

  it('setFps() updates fps and frameInterval', () => {
    e.setFps(40);
    expect(e.fps).toBe(40);
    expect(e.frameInterval).toBe(1000 / 40);
  });

  it('advanceFrame() increments frameX and wraps at maxFrame when frameTimer > frameInterval', () => {
    e.frameTimer = e.frameInterval + 1;
    e.update(0);
    expect(e.frameX).toBe(1);

    e.frameTimer = e.frameInterval + 1;
    e.frameX = 2;
    e.update(0);
    expect(e.frameX).toBe(0);
  });

  it('advanceFrame() does NOT advance when frameTimer equals frameInterval (strict > check)', () => {
    e.frameTimer = e.frameInterval;
    e.frameX = 0;
    e.update(0);
    expect(e.frameX).toBe(0);
    expect(e.frameTimer).toBe(e.frameInterval);
  });

  it('update() moves left by speedX + game.speed when cabin is hidden', () => {
    const bx = e.x;
    const by = e.y;

    e.update(16);

    expect(e.x).toBe(bx - (e.speedX + game.speed));
    expect(e.y).toBe(by + e.speedY);
  });

  it('update() moves by speedX only (and y by -speedY) when cabin is visible and enemy is not a MovingGroundEnemy', () => {
    game.cabin.isFullyVisible = true;
    Object.assign(e, { x: 200, y: 80, speedX: 4, speedY: 6 });

    e.update(0);

    expect(e.x).toBe(200 - 4);
    expect(e.y).toBe(80 - 6);
  });

  it('update() marks for deletion and plays “flagged” sound when off-screen or dead', () => {
    e.x = -e.width - 1;
    e.lives = 0;

    e.update(16);

    expect(e.markedForDeletion).toBe(true);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('boom', false, true, true);
  });

  it('playIfOnScreen() only plays when isOnScreen() is true', () => {
    placeOnScreen(e, game);
    e.playIfOnScreen('testSound');
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('testSound');

    game.audioHandler.enemySFX.playSound.mockClear();
    e.x = -9999;
    e.playIfOnScreen('testSound');
    expect(game.audioHandler.enemySFX.playSound).not.toHaveBeenCalled();
  });

  it('update() plays sound normally when on-screen and not deleted', () => {
    placeOnScreen(e, game);
    game.audioHandler.enemySFX.playSound.mockClear();

    e.update(16);

    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('boom');
  });

  it('draw() resets shadow for non-special enemies', () => {
    e.draw(ctx);
    expect(ctx.shadowColor).toBe('transparent');
    expect(ctx.shadowBlur).toBe(0);
  });

  it('draw() resets shadow after drawing a stun enemy', () => {
    e.isStunEnemy = true;
    e.draw(ctx);
    expect(ctx.shadowColor).toBe('transparent');
    expect(ctx.shadowBlur).toBe(0);
  });

  it('draw() resets shadow after drawing a red enemy', () => {
    e.isRedEnemy = true;
    e.draw(ctx);
    expect(ctx.shadowColor).toBe('transparent');
    expect(ctx.shadowBlur).toBe(0);
  });

  it('draw() strokes bounds when debug=true', () => {
    game.debug = true;
    e.draw(ctx);
    expect(ctx.strokeRect).toHaveBeenCalledWith(e.x, e.y, e.width, e.height);
  });
});

// -----------------------------------------------------------------------------
// Barrier
// -----------------------------------------------------------------------------
describe('Barrier', () => {
  let game, owner;

  beforeEach(() => {
    game = makeGame({
      audioHandler: { enemySFX: { playSound: jest.fn() } },
    });
    owner = {
      game,
      x: 50,
      y: 60,
      width: 40,
      height: 30,
      markedForDeletion: false,
      state: 'idle',
      originalY: 100,
      burrow: { groundY: 120 },
    };
  });

  it('followOwner: deletes itself if owner is missing or markedForDeletion', () => {
    const b = new Barrier(game, 0, 0, 10, 10, ['img1'], 1, { followOwner: true, owner: null });
    b.update(16);
    expect(b.markedForDeletion).toBe(true);

    const b2 = new Barrier(game, 0, 0, 10, 10, ['img1'], 1, { followOwner: true, owner });
    owner.markedForDeletion = true;
    b2.update(16);
    expect(b2.markedForDeletion).toBe(true);
  });

  it('followOwner: centers barrier on owner each update', () => {
    const b = new Barrier(game, 0, 0, 10, 10, ['img1'], 2, { followOwner: true, owner });
    b.update(16);

    expect(b.x).toBe(owner.x + owner.width / 2 - b.width / 2);
    expect(b.y).toBe(owner.y + owner.height / 2 - b.height / 2);
  });

  it('plays spawnSound once on construction when provided', () => {
    const sounds = { spawnSound: 'spawn', breakSound: 'break', crackSoundsByLives: { 1: 'crack1' } };
    new Barrier(game, 0, 0, 10, 10, ['img1'], 2, { sounds });
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('spawn', false, true);
  });

  it('plays crack sound once per lives threshold, and breakSound once when lives hits 0', () => {
    const sounds = {
      crackSoundsByLives: { 2: 'crack2', 1: 'crack1' },
      breakSound: 'break',
    };
    const b = new Barrier(game, 0, 0, 10, 10, ['img1', 'img2'], 3, { sounds });

    game.audioHandler.enemySFX.playSound.mockClear();

    b.lives = 2;
    b.update(16);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('crack2', false, true);

    game.audioHandler.enemySFX.playSound.mockClear();
    b.update(16);
    expect(game.audioHandler.enemySFX.playSound).not.toHaveBeenCalled();

    b.lives = 1;
    b.update(16);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('crack1', false, true);

    game.audioHandler.enemySFX.playSound.mockClear();
    b.lives = 0;
    b.update(16);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('break', false, true);
  });

  it('clipWithOwnerBurrow: draw() uses clip() when owner is in "burrow"', () => {
    const ctx = makeCtx();
    const b = new Barrier(game, 0, 0, 10, 10, ['img1'], 1, { clipWithOwnerBurrow: true, owner });

    owner.state = 'burrow';
    b.draw(ctx);

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.clip).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});

// -----------------------------------------------------------------------------
// BurrowingGroundEnemy
// -----------------------------------------------------------------------------
describe('BurrowingGroundEnemy', () => {
  let game;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      groundMargin: 10,
      audioHandler: { enemySFX: { playSound: jest.fn() } },
      player: { x: 200, y: 100, width: 50, height: 50 },
      enemies: [],
    });
  });

  afterEach(() => restoreRandom());

  it('progresses through phases and eventually marks for deletion when cycles complete', () => {
    const b = new BurrowingGroundEnemy(game, 40, 20, 0, 'img', 200, {
      randomiseDurations: false,
      cyclesMax: 1,
      baseWarningDuration: 10,
      baseRiseDuration: 10,
      baseHoldDuration: 10,
      baseRetractDuration: 10,
    });

    expect(b.phase).toBe('warning');

    b.update(10);
    expect(b.phase).toBe('emerge');

    b.update(10);
    expect(['hold', 'retract']).toContain(b.phase);

    if (b.phase === 'hold') {
      b.update(10);
      expect(b.phase).toBe('retract');
    }

    b.update(10);
    expect(['done', 'warning']).toContain(b.phase);

    if (b.phase === 'done') {
      b.update(1);
      expect(b.markedForDeletion).toBe(true);
    }
  });
});

// -----------------------------------------------------------------------------
// FlyingEnemy
// -----------------------------------------------------------------------------
describe('FlyingEnemy', () => {
  let fe, game;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      speed: 3,
      audioHandler: { enemySFX: { playSound: jest.fn() } },
    });
    fe = new FlyingEnemy(game, 20, 10, 3, 'img');
  });

  afterEach(() => restoreRandom());

  it('spawns beyond right edge and with a y in the expected vertical band', () => {
    expect(fe.x).toBeGreaterThan(game.width);
    expect(fe.x).toBeLessThanOrEqual(game.width * 1.5);

    expect(fe.y).toBeGreaterThanOrEqual(game.height * 0.1);
    expect(fe.y).toBeLessThanOrEqual(game.height * 0.4 + 100);
  });

  it('update() calls base update and then adds sinusoidal y drift', () => {
    const oldY = fe.y;
    fe.va = Math.PI / 2;
    fe.angle = 0;

    fe.update(16);

    expect(fe.y).toBeCloseTo(oldY + Math.sin(fe.va));
  });

  it('plays its soundId when on-screen', () => {
    placeOnScreen(fe, game);
    fe.update(16);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(fe.soundId);
  });
});

// -----------------------------------------------------------------------------
// GroundEnemy / MovingGroundEnemy / ImmobileGroundEnemy
// -----------------------------------------------------------------------------
describe('GroundEnemy / MovingGroundEnemy / ImmobileGroundEnemy', () => {
  const classes = [
    ['GroundEnemy', GroundEnemy],
    ['MovingGroundEnemy', MovingGroundEnemy],
    ['ImmobileGroundEnemy', ImmobileGroundEnemy],
  ];

  test.each(classes)('%s spawns at right edge on ground and scrolls with game.speed', (_name, Cls) => {
    const game = makeGame({
      speed: 7,
      audioHandler: { enemySFX: { playSound: jest.fn() } },
    });

    const inst = new Cls(game, 30, 20, 2, 'img');

    expect(inst.x).toBe(game.width);
    expect(inst.y).toBe(game.height - inst.height - game.groundMargin);

    const bx = inst.x;
    inst.speedX = 0;
    inst.update(16);

    expect(inst.x).toBe(bx - game.speed);
  });

  it('MovingGroundEnemy does not move when cabin is fully visible (base update skips it)', () => {
    const game = makeGame({
      speed: 7,
      cabin: { isFullyVisible: true },
      audioHandler: { enemySFX: { playSound: jest.fn() } },
    });

    const mge = new MovingGroundEnemy(game, 30, 20, 2, 'img');
    mge.speedX = 3;

    const [bx, by] = [mge.x, mge.y];
    mge.update(16);

    expect(mge.x).toBe(bx);
    expect(mge.y).toBe(by);
  });
});

// -----------------------------------------------------------------------------
// ClimbingEnemy
// -----------------------------------------------------------------------------
describe('ClimbingEnemy', () => {
  let ce, game, ctx;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      audioHandler: { enemySFX: { playSound: jest.fn() } },
    });

    ce = new ClimbingEnemy(game, 20, 10, 2, 'img');
    ce.y = game.height - ce.height - game.groundMargin + 1;

    ctx = makeCtx();
  });

  afterEach(() => restoreRandom());

  it('reverses vertical direction when hitting ground limit', () => {
    ce.speedY = 1;
    ce.update(16);
    expect(ce.speedY).toBe(-1);
  });

  it('marks for deletion when it climbs above the top', () => {
    ce.y = -ce.height - 1;
    ce.update(16);
    expect(ce.markedForDeletion).toBe(true);
  });

  it('draw() renders a rope line then the sprite', () => {
    ce.draw(ctx);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledWith(ce.x + ce.width / 2, 0);
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.drawImage).toHaveBeenCalled();
  });
});

// -----------------------------------------------------------------------------
// VerticalEnemy
// -----------------------------------------------------------------------------
describe('VerticalEnemy', () => {
  let ve, game;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      speed: 0,
      audioHandler: { enemySFX: { playSound: jest.fn() } },
    });

    ve = new VerticalEnemy(game, 10, 5, 2, 'img');
    ve.y = 0;
  });

  afterEach(() => restoreRandom());

  it('update() increments y by speedY twice (base update + subclass update)', () => {
    ve.speedY = 4;
    ve.update(16);
    expect(ve.y).toBe(8);
  });
});

// -----------------------------------------------------------------------------
// FallingEnemy
// -----------------------------------------------------------------------------
describe('FallingEnemy', () => {
  let fe, game;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      player: { x: 50 },
      audioHandler: { enemySFX: { playSound: jest.fn() } },
    });

    fe = new FallingEnemy(game, 12, 6, 2, 'img');
  });

  afterEach(() => restoreRandom());

  it('spawns above the screen and between player.x and game.width', () => {
    expect(fe.y).toBe(-fe.height);
    expect(fe.x).toBeGreaterThanOrEqual(game.player.x);
    expect(fe.x).toBeLessThanOrEqual(game.width);
  });

  it('update() moves downward by speedY (in addition to base update)', () => {
    fe.speedY = 4;
    const oy = fe.y;
    fe.update(16);
    expect(fe.y).toBe(oy + 4);
  });
});

// -----------------------------------------------------------------------------
// UnderwaterEnemy
// -----------------------------------------------------------------------------
describe('UnderwaterEnemy', () => {
  let ue, game;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      speed: 0,
      audioHandler: { enemySFX: { playSound: jest.fn() } },
    });

    ue = new UnderwaterEnemy(game, 12, 6, 3, 'img');
    ue.angle = 0;
    ue.va = Math.PI / 2;
  });

  afterEach(() => restoreRandom());

  it('oscillates y by sin(angle) after base update', () => {
    const baseY = ue.y;
    ue.update(16);
    expect(ue.y).toBeCloseTo(baseY + Math.sin(ue.va));
  });
});

// -----------------------------------------------------------------------------
// BeeInstances
// -----------------------------------------------------------------------------
describe('BeeInstances', () => {
  let bee, game;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      speed: 0,
      audioHandler: { enemySFX: { playSound: jest.fn() } },
      player: { x: 50, y: 30 },
      enemies: [],
    });

    bee = new BeeInstances(game, 20, 10, 3, 'img', 40, 7, 5, 10);
    bee.x = game.width - 10;
    bee.y = 20;
  });

  afterEach(() => restoreRandom());

  it('is marked as a stun enemy', () => {
    expect(bee.isStunEnemy).toBe(true);
  });

  it('initializes currentSpeed to initialSpeed', () => {
    expect(bee.currentSpeed).toBe(7);
  });

  it('when player is outside chaseDistance, drifts left by speedX + currentSpeed (plus base scrolling)', () => {
    const ox = bee.x;
    bee.passedPlayer = false;
    bee.update(16);
    expect(bee.x).toBeCloseTo(ox - (bee.speedX + bee.currentSpeed));
  });

  it('when player is within chaseDistance, moves toward player and does not mark passedPlayer', () => {
    bee.x = game.player.x + bee.chaseDistance - 1;
    bee.passedPlayer = false;

    const ox = bee.x;
    bee.update(16);

    expect(bee.x).toBeLessThan(ox);
    expect(bee.passedPlayer).toBe(false);
  });

  it('after passing player, continues moving along stored angleToPlayer', () => {
    const angle = Math.PI / 4;
    bee.passedPlayer = true;
    bee.angleToPlayer = angle;

    const ox = bee.x;
    const oy = bee.y;

    bee.update(16);

    expect(bee.x).toBeGreaterThan(ox);
    expect(bee.y).toBeGreaterThan(oy);
  });
});

// -----------------------------------------------------------------------------
// Projectile & subclasses
// -----------------------------------------------------------------------------
describe('Projectile & subclasses', () => {
  let game, ctx;

  beforeEach(() => {
    game = makeGame({
      speed: 2,
      player: { x: 0, y: 0 },
      debug: true,
      audioHandler: { enemySFX: { playSound: jest.fn() } },
    });

    ctx = makeCtx();
  });

  it('Projectile.update() advances frames without throwing', () => {
    const p = new Projectile(game, 10, 20, 30, 40, 2, 'img', 5, 10);
    expect(() => p.update(16)).not.toThrow();
  });

  it('WindAttack.update() moves and pushes player', () => {
    const player = { x: 50, y: 50 };
    const w = new WindAttack(game, 10, 20, 30, 40, 2, 'img', 5, player);

    w.update(16);

    expect(player.x).not.toBe(50);
    expect(() => w.update(16)).not.toThrow();
  });

  it('LeafAttack rotates over time and draw() does not throw', () => {
    const l = new LeafAttack(game, 10, 20, 30, 40, 2, 'img', 5, 0.01);

    l.update(16);
    expect(l.rotation).toBeGreaterThan(0);

    expect(() => l.draw(ctx)).not.toThrow();
  });

  it('PoisonSpit instantiates and update/draw do not throw', () => {
    const o = new PoisonSpit(game, 10, 20, 5, 5, 1, 'img', 3);
    expect(() => o.update(16)).not.toThrow();
    expect(() => o.draw(ctx)).not.toThrow();
  });

  it('PurpleLaser instantiates and update/draw do not throw', () => {
    const o = new PurpleLaser(game, 10, 20);
    expect(() => o.update(16)).not.toThrow();
    expect(() => o.draw(ctx)).not.toThrow();
  });

  it('LaserBeam.draw() does not throw', () => {
    const lb = new LaserBeam(game, 10, 20, 30, 40, 1, 'img', -5);
    expect(() => lb.draw(ctx)).not.toThrow();
  });

  it('YellowBeam.update() moves up by 2×speedY (base + subclass)', () => {
    const yb = new YellowBeam(game, 10, 20);
    const oldY = yb.y;

    yb.update(16);

    expect(yb.y).toBe(oldY - 10);
  });

  it('IceBall grows in size over time', () => {
    const ib = new IceBall(game, 10, 20, 3);
    ib.update(16);
    expect(ib.size).toBeGreaterThan(ib.initialSize);
  });

  it('DarkLaser.draw() does not throw', () => {
    const dl = new DarkLaser(game, 10, 20, 3, true);
    expect(() => dl.draw(ctx)).not.toThrow();
  });

  it('RockProjectile rotates over time and draw() does not throw', () => {
    const rp = new RockProjectile(game, 10, 20, 30, 40, 1, 'img', 5, 0.01);
    rp.update(16);
    expect(rp.rotation).toBeGreaterThan(0);
    expect(() => rp.draw(ctx)).not.toThrow();
  });
});

// -----------------------------------------------------------------------------
// Goblin
// -----------------------------------------------------------------------------
describe('Goblin', () => {
  let game, gob;

  beforeEach(() => {
    game = makeGame({
      speed: 3,
      audioHandler: { enemySFX: { playSound: jest.fn() } },
      player: {
        x: 100,
        y: 100,
        states: ['idle', 'walk', 'jump'],
        currentState: 'idle',
        onGround: () => true,
      },
      hiddenTime: 0,
      gameOver: false,
    });

    gob = new Goblin(game);
  });

  it('starts in "walk" state with 3 lives', () => {
    expect(gob.state).toBe('walk');
    expect(gob.lives).toBe(3);
  });

  it('update() does not throw', () => {
    expect(() => gob.update(16)).not.toThrow();
  });

  it('draw() does not throw', () => {
    const ctx = makeCtx();
    expect(() => gob.draw(ctx)).not.toThrow();
  });
});

// -----------------------------------------------------------------------------
// Map 1 Enemies
// -----------------------------------------------------------------------------
describe('Map 1 Enemies', () => {
  let game, ctx;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      speed: 2,
      audioHandler: { enemySFX: { playSound: jest.fn(), stopSound: jest.fn() } },
      player: {
        x: 400,
        y: 300,
        states: ['idle', 'walk', 'jump'],
        currentState: 'idle',
        onGround: () => true,
      },
      enemies: [],
      hiddenTime: 0,
      gameOver: false,
    });

    ctx = makeCtx();
  });

  afterEach(() => restoreRandom());

  it('Dotter buzzes once when it first becomes on-screen', () => {
    const d = new Dotter(game);
    d.x = game.width / 2;
    d.y = game.height / 2;

    d.update(16);

    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('buzzingFly');
  });

  it('Vertibat plays batPitch (once) and wooshBat on frame 3 when on-screen', () => {
    const v = new Vertibat(game);
    v.x = game.width / 2;
    v.y = game.height / 2;
    v.frameX = 3;

    v.update(16);

    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('batPitch');
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('wooshBat');
  });

  it('Ghobat plays batFlapAudio on frame 3 when on-screen', () => {
    const g = new Ghobat(game);
    g.speedX = 0;
    game.speed = 0;

    g.frameX = 3;
    g.x = 100;
    g.y = 100;
    g.width = 1;
    g.height = 1;

    g.update(16);

    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('batFlapAudio');
  });

  it('Ravengloom plays ravenCallAudio once and ravenSingleFlap on frame 2 (on-screen)', () => {
    const r = new Ravengloom(game);
    r.x = game.width / 2;
    r.y = game.height / 2;

    r.playsOnce = true;
    r.update(16);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('ravenCallAudio');

    r.frameX = 2;
    r.playsOnce = false;
    r.update(16);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('ravenSingleFlap');
  });

  it('MeatSoldier plays its sound on first update', () => {
    const m = new MeatSoldier(game);
    m.update(16);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('meatSoldierSound');
  });

  it('Skulnap switches from sleeping to running when player is close', () => {
    const s = new Skulnap(game);

    s.x = game.player.x + 1000;
    s.update(16);
    expect(s.state).toBe('sleeping');

    s.x = game.player.x + 100;
    s.update(16);
    expect(s.state).toBe('running');
  });

  it('Abyssaw stops spinningChainsaw sound when dead/off-screen', () => {
    const a = new Abyssaw(game);
    a.lives = 0;
    a.x = -a.width - 1;

    a.update(16);

    expect(game.audioHandler.enemySFX.stopSound).toHaveBeenCalledWith('spinningChainsaw');
  });

  it('GlidoSpike spawns a WindAttack during attack animation at frame 12', () => {
    const gs = new GlidoSpike(game);
    gs.x = 100;
    gs.state = 'attack';
    gs.canAttack = true;
    gs.attackAnimation.frameX = 12;

    gs.update(16);

    expect(game.enemies.some((e) => e instanceof WindAttack)).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// Map 2 Enemies
// -----------------------------------------------------------------------------
describe('Map 2 Enemies', () => {
  let game;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      speed: 2,
      audioHandler: { enemySFX: { playSound: jest.fn() } },
      player: { x: 400, y: 300 },
      enemies: [],
      gameOver: false,
    });
  });

  afterEach(() => restoreRandom());

  it('DuskPlant throws a LeafAttack when cooldown has elapsed and it is on-screen enough', () => {
    const dp = new DuskPlant(game);
    dp.x = game.width - dp.width - 1;
    dp.lastLeafAttackTime = dp.leafAttackConfig.cooldown;

    dp.update(dp.leafAttackConfig.cooldown);

    expect(game.enemies.some((e) => e instanceof LeafAttack)).toBe(true);
  });

  it('Silknoir update() does not throw', () => {
    const sn = new Silknoir(game);
    expect(() => sn.update(16)).not.toThrow();
  });

  it('WalterTheGhost: when passedPlayer=false it approaches player; when passedPlayer=true it stops changing x', () => {
    const w = new WalterTheGhost(game);
    w.speedX = 0;
    game.speed = 0;

    w.x = game.player.x + 100;
    w.y = game.player.y;
    w.passedPlayer = false;

    w.update(16);
    expect(w.x).toBeLessThan(game.player.x + 100);

    w.passedPlayer = true;
    const ox = w.x;
    w.update(16);
    expect(w.x).toBe(ox);
  });

  it('Ben: approaches player before passing; after passing continues drifting left', () => {
    const b = new Ben(game);
    b.speedX = 0;
    game.speed = 0;

    b.x = game.player.x + 100;
    b.y = game.player.y;
    b.passedPlayer = false;

    b.update(16);
    expect(b.x).toBeLessThan(game.player.x + 100);

    b.passedPlayer = true;
    const ox = b.x;
    b.update(16);
    expect(b.x).toBeLessThan(ox);
  });

  it('Gloomlet plays humming when on-screen', () => {
    const g = new Gloomlet(game);
    g.x = game.width / 2;
    g.y = game.height / 2;

    const playSpy = jest.spyOn(game.audioHandler.enemySFX, 'playSound');
    g.update(16);

    expect(playSpy).toHaveBeenCalledWith('gloomletHumming');
  });

  it('Aura draw() does not throw', () => {
    const a = new Aura(game);
    const ctx = makeCtx();
    expect(() => a.draw(ctx)).not.toThrow();
  });

  it('Dolly spawns an Aura roughly every 1000ms while active and on-screen enough', () => {
    const d = new Dolly(game);
    d.x = game.width - 1;
    d.auraTimer = 1000;

    d.update(1000);

    expect(game.enemies.some((e) => e instanceof Aura)).toBe(true);
  });

  it('Dolly plays dollHumming and auraSoundEffect', () => {
    const d = new Dolly(game);
    const playSpy = jest.spyOn(game.audioHandler.enemySFX, 'playSound');

    d.update(16);

    expect(playSpy).toHaveBeenCalledWith('dollHumming');
    expect(playSpy).toHaveBeenCalledWith('auraSoundEffect', true);
  });
});

// -----------------------------------------------------------------------------
// Map 3 Enemies
// -----------------------------------------------------------------------------
describe('Map 3 Enemies', () => {
  let game;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      speed: 2,
      audioHandler: { enemySFX: { playSound: jest.fn() } },
      player: { x: 400, y: 300, width: 50, height: 50, speedY: 0 },
      enemies: [],
      gameOver: false,
    });
  });

  afterEach(() => restoreRandom());

  it('Piranha plays crunchSound on frame 1 when on-screen', () => {
    const p = new Piranha(game);
    p.speedX = 0;
    game.speed = 0;

    p.frameX = 1;
    p.x = 100;
    p.y = 100;
    p.width = 1;
    p.height = 1;

    p.update(16);

    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('crunchSound');
  });

  it('SkeletonFish update/draw do not throw (either AI branch)', () => {
    const sf = new SkeletonFish(game);
    expect(() => sf.update(16)).not.toThrow();

    const ctx = makeCtx();
    expect(() => sf.draw(ctx)).not.toThrow();
  });

  it('SpearFish is red and moves left on update', () => {
    const sf = new SpearFish(game);
    expect(sf.isRedEnemy).toBe(true);

    const ox = sf.x;
    sf.update(16);

    expect(sf.x).toBeLessThan(ox);
  });

  it('JetFish plays rocketLauncherSound when on-screen enough', () => {
    const jf = new JetFish(game);
    jf.x = 100;
    jf.y = game.player.y;

    jf.update(16);

    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('rocketLauncherSound');
  });

  it('Piper becomes extended when player is close or when lives <= 1', () => {
    const p = new Piper(game);

    p.lives = 1;
    p.update(16);
    expect(p.state).toBe('extended');

    p.state = 'idle';
    p.lives = 2;
    p.x = game.player.x + 50;
    p.update(16);
    expect(p.state).toBe('extended');
  });

  it('Voltzeel adjusts vertical movement toward player before passing', () => {
    const v = new Voltzeel(game);
    v.y = game.player.y + 100;
    v.passedPlayer = false;

    const beforeY = v.y;
    v.update(16);

    expect(v.y).not.toEqual(beforeY + v.currentSpeed);
  });

  it('Garry fires an InkBeam immediately on first on-screen update', () => {
    const g = new Garry(game);

    game.speed = 0;
    g.x = game.width / 2;
    g.y = game.height - g.height - game.groundMargin;

    expect(game.enemies.some((e) => e instanceof InkBeam)).toBe(false);

    g.update(0);

    expect(game.enemies.some((e) => e instanceof InkBeam)).toBe(true);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('inkSpit', false, true);
  });

  it('Garry fires one InkBeam every 2000ms while remaining on-screen', () => {
    const g = new Garry(game);

    game.speed = 0;
    g.x = game.width / 2;
    g.y = game.height - g.height - game.groundMargin;

    g.update(0);
    const firstCount = game.enemies.filter((e) => e instanceof InkBeam).length;
    expect(firstCount).toBe(1);

    game.audioHandler.enemySFX.playSound.mockClear();

    g.update(1999);
    expect(game.enemies.filter((e) => e instanceof InkBeam).length).toBe(firstCount);
    expect(game.audioHandler.enemySFX.playSound).not.toHaveBeenCalledWith('inkSpit', false, true);

    g.update(1);
    const secondCount = game.enemies.filter((e) => e instanceof InkBeam).length;
    expect(secondCount).toBe(firstCount + 1);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('inkSpit', false, true);

    const newest = game.enemies.filter((e) => e instanceof InkBeam).slice(-1)[0];
    expect(newest.speedY).toBeGreaterThanOrEqual(-20);
    expect(newest.speedY).toBeLessThanOrEqual(20);
  });
});

// -----------------------------------------------------------------------------
// Map 4 Enemies
// -----------------------------------------------------------------------------
describe('Map 4 Enemies', () => {
  let game;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      speed: 2,
      audioHandler: { enemySFX: { playSound: jest.fn() } },
      player: { x: 400, y: 300 },
      enemies: [],
      background: { isRaining: false },
      gameOver: false,
    });
  });

  afterEach(() => restoreRandom());

  it('BigGreener throws two LeafAttacks after cooldown', () => {
    const bg = new BigGreener(game);
    bg.x = game.width - bg.width - 1;
    bg.lastLeafAttackTime = bg.leafAttackConfig.cooldown;

    bg.update(bg.leafAttackConfig.cooldown);

    const leafs = game.enemies.filter((e) => e instanceof LeafAttack);
    expect(leafs.length).toBeGreaterThanOrEqual(2);
  });

  it('Chiquita plays ravenCallAudio once and ravenSingleFlap on frame 7 when on-screen', () => {
    const ch = new Chiquita(game);
    ch.x = game.width / 2;
    ch.y = game.height / 2;

    ch.update(16);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('ravenCallAudio');

    ch.frameX = 7;
    ch.frameTimer = 0;
    ch.update(16);
    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('ravenSingleFlap');
  });

  it('Sluggie moves left on update', () => {
    const sl = new Sluggie(game);
    const ox = sl.x;

    sl.update(16);

    expect(sl.x).toBeLessThan(ox);
  });

  it('LilHornet buzzes once when it first becomes on-screen', () => {
    const lh = new LilHornet(game);
    lh.x = game.width / 2;
    lh.y = game.height / 2;

    lh.update(16);

    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('buzzingFly');
  });

  it('KarateCroco enters flykick state when player is close', () => {
    const kc = new KarateCroco(game);
    kc.x = game.player.x + 100;

    kc.update(16);

    expect(kc.state).toBe('flykick');
  });

  it('Zabkous throws PoisonSpit during attack when on the correct frame', () => {
    const zb = new Zabkous(game);
    zb.x = game.player.x + 100;
    zb.state = 'attack';
    zb.frameX = 13;

    zb.update(16);

    expect(game.enemies.some((e) => e instanceof PoisonSpit)).toBe(true);
  });

  it('SpidoLazer throws LaserBeam on attack frame 27', () => {
    const slz = new SpidoLazer(game);
    slz.x = game.player.x + 100;
    slz.state = 'attack';
    slz.canAttack = true;
    slz.frameX = 27;

    slz.update(16);

    expect(game.enemies.some((e) => e instanceof LaserBeam)).toBe(true);
  });

  it('Jerry spawns Skulnap when frame max is reached (and not gameOver)', () => {
    const j = new Jerry(game);
    j.x = game.width / 2;
    j.frameX = j.maxFrame;
    j.maxFrameReached = false;

    j.update(j.frameInterval + 1);

    expect(game.enemies.some((e) => e instanceof Skulnap)).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// Map 5 Enemies
// -----------------------------------------------------------------------------
describe('Map 5 Enemies', () => {
  let game;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      speed: 2,
      audioHandler: { enemySFX: { playSound: jest.fn() } },
      player: { x: 400, y: 300 },
      enemies: [],
      background: { isRaining: true },
      gameOver: false,
      hiddenTime: 0,
    });
  });

  afterEach(() => restoreRandom());

  it('Snailey moves left on update', () => {
    const sn = new Snailey(game);
    const ox = sn.x;
    sn.update(16);
    expect(sn.x).toBeLessThan(ox);
  });

  it('RedFlyer throws DarkLaser when raining and cooldown met', () => {
    const rf = new RedFlyer(game);
    rf.x = game.player.x + 100;
    rf.darkLaserTimer = 3000;

    rf.update(3000);

    expect(game.enemies.some((e) => e instanceof DarkLaser)).toBe(true);
  });

  it('PurpleFlyer throws IceBall when raining and cooldown met', () => {
    const pf = new PurpleFlyer(game);
    pf.x = game.player.x + 100;
    pf.iceballTimer = 2000;

    pf.update(2000);

    expect(game.enemies.some((e) => e instanceof IceBall)).toBe(true);
  });

  it('LazyMosquito buzzes once when it first becomes on-screen', () => {
    const lm = new LazyMosquito(game);
    lm.x = game.width / 2;
    lm.y = game.height / 2;

    lm.update(16);

    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('buzzingFly');
  });

  it('LeafSlug moves left on update', () => {
    const ls = new LeafSlug(game);
    const ox = ls.x;
    ls.update(16);
    expect(ls.x).toBeLessThan(ox);
  });

  it('Sunflora throws YellowBeam when raining and cooldown met', () => {
    const sf = new Sunflora(game);
    sf.x = game.width / 2;
    sf.yellowBeamTimer = 350;

    sf.update(350);

    expect(game.enemies.some((e) => e instanceof YellowBeam)).toBe(true);
  });

  it('Eggry jumps only when raining and frameX hits 9', () => {
    const egDry = new Eggry(game);
    game.background.isRaining = false;
    game.hiddenTime = 0;

    egDry.frameX = 9;
    egDry.frameTimer = 0;
    egDry.update(16);

    expect(egDry.isJumping).toBe(false);

    const egWet = new Eggry(game);
    game.background.isRaining = true;
    game.hiddenTime = 0;

    egWet.frameX = 8;
    egWet.frameTimer = egWet.frameInterval + 1;

    const startX = egWet.x;

    egWet.update(16);
    expect(egWet.isJumping).toBe(true);

    game.hiddenTime += egWet.jumpDuration * 1000 + 1;
    egWet.update(16);

    expect(egWet.isJumping).toBe(false);
    expect(egWet.x).not.toBe(startX);
  });

  it('Eggry keeps jumping in one direction when gameOver=true', () => {
    const eg = new Eggry(game);
    game.background.isRaining = true;
    game.gameOver = true;
    game.hiddenTime = 0;

    eg.frameX = 8;
    eg.frameTimer = eg.frameInterval + 1;

    const startX = eg.x;

    eg.update(16);
    expect(eg.isJumping).toBe(true);

    game.hiddenTime += eg.jumpDuration * 1000 + 1;
    eg.update(16);

    expect(eg.isJumping).toBe(false);
    expect(eg.x).not.toBe(startX);
  });

  it('Tauro is red and moves left on update', () => {
    const t = new Tauro(game);
    expect(t.isRedEnemy).toBe(true);

    const ox = t.x;
    t.update(16);

    expect(t.x).toBeLessThan(ox);
  });

  it('Bee and AngryBee set correct soundIds', () => {
    const b = new Bee(game);
    const ab = new AngryBee(game);

    expect(b.soundId).toBe('beeBuzzing');
    expect(ab.soundId).toBe('angryBeeBuzzing');
  });

  it('HangingSpidoLazer throws LaserBeam on frame 27', () => {
    const hl = new HangingSpidoLazer(game);
    hl.frameX = 27;
    hl.x = game.width / 2;
    hl.canAttack = true;

    hl.update(16);

    expect(game.enemies.some((e) => e instanceof LaserBeam)).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// Map 6 Enemies
// -----------------------------------------------------------------------------
describe('Map 6 Enemies', () => {
  let game;

  beforeEach(() => {
    mockRandom(0.5);
    game = makeGame({
      speed: 2,
      audioHandler: { enemySFX: { playSound: jest.fn(), stopSound: jest.fn() } },
      player: { x: 400, y: 300 },
      enemies: [],
      background: { isRaining: false },
      gameOver: false,
    });
  });

  afterEach(() => restoreRandom());

  it('Cactus is a stun enemy', () => {
    const c = new Cactus(game);
    expect(c.isStunEnemy).toBe(true);
  });

  it('PetroPlant throws two RockProjectiles after cooldown', () => {
    const pp = new PetroPlant(game);
    pp.x = game.width - pp.width - 1;
    pp.lastRockAttackTime = pp.rockAttackConfig.cooldown;

    pp.update(pp.rockAttackConfig.cooldown);

    const rocks = game.enemies.filter((e) => e instanceof RockProjectile);
    expect(rocks.length).toBeGreaterThanOrEqual(2);
  });

  it('Plazer throws PurpleLaser on frame 1 when allowed', () => {
    const pz = new Plazer(game);
    pz.x = game.player.x + 100;
    pz.frameX = 1;
    pz.canAttack = true;

    pz.update(16);

    expect(game.enemies.some((e) => e instanceof PurpleLaser)).toBe(true);
  });

  it('Volcanurtle is red and moves left on update', () => {
    const vt = new Volcanurtle(game);
    expect(vt.isRedEnemy).toBe(true);

    const ox = vt.x;
    vt.update(16);

    expect(vt.x).toBeLessThan(ox);
  });

  it('Rollhog enters roll state when player is close', () => {
    const rh = new Rollhog(game);
    rh.x = game.player.x + 100;

    rh.update(16);

    expect(rh.state).toBe('roll');
  });

  it('TheRock enters smash state when player is very close', () => {
    const tr = new TheRock(game);
    tr.x = game.player.x + 50;
    tr.state = 'idle';
    tr.playSmashOnce = true;

    tr.update(16);

    expect(tr.state).toBe('smash');
  });

  it('Veynoculus update/draw do not throw', () => {
    const v = new Veynoculus(game);
    expect(() => v.update(16)).not.toThrow();

    const ctx = makeCtx();
    expect(() => v.draw(ctx)).not.toThrow();
  });

  it('VolcanoWasp buzzes once when it first becomes on-screen', () => {
    const vw = new VolcanoWasp(game);
    vw.x = game.width / 2;
    vw.y = game.height / 2;

    vw.update(16);

    expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('angryBeeBuzzing');
  });

  it('Dragon throws WindAttack on frame 7 when allowed', () => {
    const dr = new Dragon(game);
    dr.x = game.player.x + 100;
    dr.frameX = 7;
    dr.canAttack = true;

    dr.update(16);

    expect(game.enemies.some((e) => e instanceof WindAttack)).toBe(true);
  });
});
