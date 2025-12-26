jest.useFakeTimers();

const makeAudioMock = () => ({
  playSound: jest.fn(),
  stopSound: jest.fn(),
  fadeOutAndStop: jest.fn(),
});

const makeGame = (overrides = {}) => {
  const enemySFX = makeAudioMock();
  return {
    width: 1200,
    height: 700,
    hiddenTime: 0,
    debug: false,
    bossInFight: true,
    gameOver: false,
    enemies: [],
    collisions: [],
    distortionActive: false,
    distortionEffect: { amount: 0, reset: jest.fn() },
    audioHandler: { enemySFX },
    startShake: jest.fn(),
    stopShake: jest.fn(),
    player: { x: 200, y: 400, width: 60, height: 80, bossCollisionTimer: 0 },
    boss: {
      id: "ntharax",
      current: null,
      talkToBoss: false,
      runAway: false,
      isVisible: true,
    },
    ...overrides,
  };
};

const advance = (game, boss, dt, steps = 1) => {
  for (let i = 0; i < steps; i++) {
    game.hiddenTime += dt;
    boss.update(dt);
  }
};

const runUntil = (stepFn, predicate, { max = 20000 } = {}) => {
  let guard = max;
  while (guard-- > 0) {
    stepFn();
    if (predicate()) return;
  }
  throw new Error("runUntil: guard exhausted before predicate became true");
};

jest.mock("../../../game/entities/enemies/enemies.js", () => {
  class Enemy {
    constructor(game, width = 0, height = 0, maxFrame = 0, imageId = "") {
      this.game = game;
      this.width = width;
      this.height = height;
      this.maxFrame = maxFrame;
      this.imageId = imageId;
      this.x = 0;
      this.y = 0;
      this.frameX = 0;
      this.frameTimer = 0;
      this.fps = 0;
      this.frameInterval = Infinity;
      this.markedForDeletion = false;
      this.lives = 1;
    }
    setFps(fps) {
      this.fps = fps;
      this.frameInterval = fps > 0 ? 1000 / fps : Infinity;
    }
    update(deltaTime) {
      if (!isFinite(this.frameInterval)) return;
      this.frameTimer = (this.frameTimer ?? 0) + deltaTime;
      let guard = 200;
      while (this.frameTimer >= this.frameInterval && guard-- > 0) {
        this.frameTimer -= this.frameInterval;
        if (this.maxFrame != null) this.frameX = Math.min(this.maxFrame, (this.frameX ?? 0) + 1);
        else this.frameX = (this.frameX ?? 0) + 1;
      }
    }
    draw() {}
    backToIdleSetUp() {
      this.state = "idle";
    }
    defeatCommon(opts) {
      this._defeatCommonArgs = opts;
      if (opts?.onBeforeClear) opts.onBeforeClear();
    }
    edgeConstraintLogic() {}
    checksBossIsFullyVisible() {}
    runningAway() {}
  }

  class EnemyBoss extends Enemy {}
  class Projectile extends Enemy {
    constructor(game, x = 0, y = 0, width = 0, height = 0, maxFrame = 0, imageId = "", fps = 0) {
      super(game, width, height, maxFrame, imageId);
      this.x = x;
      this.y = y;
      this.setFps?.(fps);
    }
  }
  class FallingEnemy extends Enemy {
    constructor(game, width = 0, height = 0, maxFrame = 0, imageId = "", fps = 0) {
      super(game, width, height, maxFrame, imageId);
      this.setFps?.(fps);
    }
  }
  class Barrier extends Enemy {
    constructor(game, x = 0, y = 0, width = 0, height = 0, maxFrame = 0, imageId = "", fps = 0) {
      super(game, width, height, maxFrame, imageId);
      this.x = x;
      this.y = y;
      this.setFps?.(fps);
    }
  }
  class BurrowingGroundEnemy extends Enemy {}

  return { Enemy, EnemyBoss, BurrowingGroundEnemy, Barrier, Projectile, FallingEnemy };
});

jest.mock("../../../game/animations/collisionAnimation.js", () => {
  class DisintegrateCollision {
    constructor(game, target, opts) {
      this.game = game;
      this.target = target;
      this.opts = opts;
      this.markedForDeletion = false;
    }
    update() {}
    draw() {}
  }

  class HealingStarBurstCollision {
    constructor(game, target, opts) {
      this.game = game;
      this.target = target;
      this.opts = opts;
      this.markedForDeletion = false;
      this._started = false;
    }
    start() {
      this._started = true;
    }
    update() {}
    draw() {}
  }

  class AsteroidExplosionCollision {
    constructor() {}
  }

  return { DisintegrateCollision, HealingStarBurstCollision, AsteroidExplosionCollision };
});

beforeAll(() => {
  global.Kamehameha = jest.fn().mockImplementation(function Kamehameha() {
    this.markedForDeletion = true;
    this.mouthX = 0;
    this.endX = 0;
  });

  global.PurpleBeamOrb = jest.fn().mockImplementation(function PurpleBeamOrb() {
    this.justFired = false;
    this.fireNow = jest.fn(() => (this.justFired = true));
  });
  global.YellowBeamOrb = jest.fn().mockImplementation(function YellowBeamOrb() {
    this.justFired = false;
    this.fireNow = jest.fn(() => (this.justFired = true));
  });
  global.BlackBeamOrb = jest.fn().mockImplementation(function BlackBeamOrb() {
    this.justFired = false;
    this.fireNow = jest.fn(() => (this.justFired = true));
  });

  global.PurpleBallOrbAttack = jest.fn().mockImplementation(function PurpleBallOrbAttack() {
    this.justLaunched = false;
    this.start = jest.fn();
    this.update = jest.fn();
    this.draw = jest.fn();
  });

  global.LaserBall = jest.fn().mockImplementation(function LaserBall(game, x, y, tx, ty, opts) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.targetX = tx;
    this.targetY = ty;
    this.opts = opts;
    this.markedForDeletion = false;
  });

  global.HealingBarrier = jest.fn().mockImplementation(function HealingBarrier(game, x, y, opts) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.opts = opts;
    this.lives = 10;
    this.markedForDeletion = false;
  });

  global.PurpleAsteroid = jest.fn().mockImplementation(function PurpleAsteroid(game) {
    this.game = game;
    this.markedForDeletion = false;
  });
  global.BlueAsteroid = jest.fn().mockImplementation(function BlueAsteroid(game) {
    this.game = game;
    this.markedForDeletion = false;
  });

  global.GroundShockwaveRing = jest.fn().mockImplementation(function GroundShockwaveRing(game, x, y, dir, opts) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.opts = opts;
    this.markedForDeletion = false;
  });

  global.AntennaeTentacle = jest.fn().mockImplementation(function AntennaeTentacle(game, cx, opts) {
    this.game = game;
    this.cx = cx;
    this.opts = opts;
    this.markedForDeletion = false;
  });

  global.GalacticSpike = jest.fn().mockImplementation(function GalacticSpike(game, x, opts) {
    this.game = game;
    this.x = x;
    this.opts = opts;
    this.phase = "extend";
    this.markedForDeletion = false;
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

import { NTharax } from "../../../game/entities/enemies/ntharax.js";

const createBoss = (gameOverrides = {}) => {
  const game = makeGame(gameOverrides);
  const boss = new NTharax(game);
  game.boss.current = boss;
  return { game, boss };
};

describe("NTharax", () => {
  describe("construction", () => {
    test("initializes core invariants", () => {
      const { boss } = createBoss();

      expect(boss.maxLives).toBe(100);
      expect(boss.lives).toBe(100);
      expect(boss.overhealPercent).toBeCloseTo(0.2);

      expect(boss.state).toBe("idle");
      expect(boss.mode2Active).toBe(false);
      expect(boss.mode2Pending).toBe(false);
      expect(boss.isTransforming).toBe(false);

      expect(boss.runAnimation).toBeTruthy();
      expect(boss.jumpAnimation).toBeTruthy();
      expect(boss.flyAnimation).toBeTruthy();

      expect(Number.isFinite(boss.frameInterval)).toBe(true);
    });
  });

  describe("mode2 threshold + transition", () => {
    test("queueMode2IfThresholdCrossed sets mode2Pending when lives are at/below threshold", () => {
      const { boss } = createBoss();

      boss.lives = 100;
      boss.queueMode2IfThresholdCrossed();
      expect(boss.mode2Pending).toBe(false);

      boss.lives = boss.maxLives * boss.mode2Threshold;
      boss.queueMode2IfThresholdCrossed();
      expect(boss.mode2Pending).toBe(true);

      boss.queueMode2IfThresholdCrossed();
      expect(boss.mode2Pending).toBe(true);
    });

    test("startMode2RunToMiddle sets run state and chooses runningDirection toward center target", () => {
      const { game: game1, boss: boss1 } = createBoss();
      const middle1 = boss1.getMiddleTargetX();

      boss1.x = middle1 - 100;
      boss1.startMode2RunToMiddle();
      expect(boss1.mode2RunToMiddle).toBe(true);
      expect(boss1.state).toBe("run");
      expect(boss1.runningDirection).toBeGreaterThan(0);
      expect(game1.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
        "bossRunningSound",
        true,
        true,
        false,
        expect.any(Object)
      );

      const { game: game2, boss: boss2 } = createBoss();
      const middle2 = boss2.getMiddleTargetX();

      boss2.x = middle2 + 100;
      boss2.startMode2RunToMiddle();
      expect(boss2.mode2RunToMiddle).toBe(true);
      expect(boss2.state).toBe("run");
      expect(boss2.runningDirection).toBeLessThan(0);
      expect(game2.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
        "bossRunningSound",
        true,
        true,
        false,
        expect.any(Object)
      );
    });
  });

  describe("mode2 transform", () => {
    test("startMode2Transform enters transform state and triggers transformation SFX + shake", () => {
      const { game, boss } = createBoss();

      boss.transformFX = {
        ...boss.transformFX,
        gatherDuration: 30,
        holdDuration: 20,
        explodeDuration: 20,
        gatherCount: 6,
        explodeCount: 8,
        gatherRingMin: 20,
        gatherRingMax: 30,
        explodeSpeedMin: 100,
        explodeSpeedMax: 120,
        shakeOnStartMs: 5,
        shakeOnExplodeMs: 7,
      };

      boss.mode2Pending = true;
      boss.lives = boss.getMode2ThresholdLives();
      boss.startMode2Transform();

      expect(boss.isTransforming).toBe(true);
      expect(boss.state).toBe("transform");
      expect(boss.transformPhase).toBe("gather");
      expect(boss.transformTimer).toBe(0);
      expect(boss.transformParticles.length).toBe(6);

      expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
        "mode2TranformationSound",
        false,
        true
      );
      expect(game.startShake).toHaveBeenCalledWith(5);
    });

    test("startMode2Transform does nothing when mode2Pending is false", () => {
      const { game, boss } = createBoss();

      boss.mode2Pending = false;
      boss.lives = boss.getMode2ThresholdLives();
      boss.startMode2Transform();

      expect(boss.isTransforming).toBe(false);
      expect(boss.state).not.toBe("transform");
      expect(game.audioHandler.enemySFX.playSound).not.toHaveBeenCalledWith(
        "mode2TranformationSound",
        false,
        true
      );
    });

    test("startMode2Transform clears mode2Pending if lives rose above threshold", () => {
      const { game, boss } = createBoss();

      boss.mode2Pending = true;
      boss.lives = boss.getMode2ThresholdLives() + 1;
      boss.startMode2Transform();

      expect(boss.mode2Pending).toBe(false);
      expect(boss.isTransforming).toBe(false);
      expect(boss.state).not.toBe("transform");
      expect(game.audioHandler.enemySFX.playSound).not.toHaveBeenCalledWith(
        "mode2TranformationSound",
        false,
        true
      );
    });

    test("updateTransformFX progresses through phases and enables mode2 at completion", () => {
      const { game, boss } = createBoss();

      boss.transformFX = {
        ...boss.transformFX,
        gatherDuration: 30,
        holdDuration: 20,
        explodeDuration: 20,
        gatherCount: 4,
        explodeCount: 6,
        gatherRingMin: 10,
        gatherRingMax: 12,
        explodeSpeedMin: 100,
        explodeSpeedMax: 120,
        shakeOnStartMs: 3,
        shakeOnExplodeMs: 4,
      };

      boss.mode2Pending = true;
      boss.lives = boss.getMode2ThresholdLives();
      boss.startMode2Transform();

      boss.updateTransformFX(35);
      boss.updateTransformFX(25);

      if (boss.transformPhase === "explode") {
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
          "mode2ExplosionSound",
          false,
          true
        );
        expect(game.startShake).toHaveBeenCalledWith(4);
      }

      boss.updateTransformFX(100);

      expect(boss.mode2Active).toBe(true);
      expect(boss.mode2Triggered).toBe(true);
      expect(boss.mode2Pending).toBe(false);
      expect(boss.isTransforming).toBe(false);
      expect(boss.state).toBe("idle");
    });

    test("explode push nudges player and clamps at screen edges", () => {
      const { game, boss } = createBoss({
        width: 300,
        player: { x: 250, y: 0, width: 50, height: 50, bossCollisionTimer: 0 },
      });

      boss.shouldInvert = true;
      boss.startExplodePush();
      boss.updateExplodePush(100);

      expect(game.player.x).toBe(250);
      expect(boss.explodePush.active).toBe(false);
    });
  });

  describe("burrow", () => {
    test("burrowLogic runs down → underground → up and relocates X during ascent", () => {
      const { game, boss } = createBoss({ width: 500 });

      boss.x = 100;
      boss.y = 300;
      boss.originalY = 300;
      boss.state = "burrow";
      boss.burrowStarted = false;

      boss.burrow.downMs = 50;
      boss.burrow.undergroundMs = 50;
      boss.burrow.upMs = 50;
      boss.burrow.minX = 40;
      boss.burrow.maxXMargin = 40;

      const rnd = jest.spyOn(Math, "random");
      rnd.mockReturnValue(0.1);

      game.player.x = 10;
      game.player.width = 60;

      boss.burrowLogic(60);
      expect(boss.burrowPhase).toBe("underground");
      expect(boss.burrowPendingX).not.toBeNull();

      boss.burrowLogic(60);
      expect(boss.burrowPhase).toBe("up");

      const prevX = boss.x;
      boss.burrowLogic(20);
      expect(boss.x).not.toBe(prevX);
      expect(boss.burrowPendingX).toBeNull();

      boss.burrowLogic(60);
      expect(boss.burrowPhase).toBe("idle");
      expect(boss.burrowStarted).toBe(false);
      expect(boss.state).toBe("idle");

      expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
        "burrowInSound",
        false,
        true,
        false,
        expect.any(Object)
      );
      expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
        "burrowOutSound",
        false,
        true,
        false,
        expect.any(Object)
      );

      rnd.mockRestore();
    });
  });

  describe("healing burst + overheal", () => {
    test("triggerHealingBurst heals up to overheal cap and clears mode2Pending when healed above threshold", () => {
      const { boss } = createBoss();

      boss.mode2Pending = true;
      boss.mode2Triggered = false;
      boss.mode2 = false;
      boss.isTransforming = false;

      boss.lives = boss.getMode2ThresholdLives() - 1;
      boss.triggerHealingBurst();
      expect(boss.lives).toBe(52);
      expect(boss.mode2Pending).toBe(false);

      boss.lives = 119;
      boss.triggerHealingBurst();
      expect(boss.lives).toBe(120);

      expect(boss.healingStarBursts.length).toBeGreaterThan(0);
      expect(boss.healingStarBursts[0]._started).toBe(true);
    });
  });

  describe("healing barrier lifecycle", () => {
    test("healingBarrierLogic spawns a barrier when cooldown elapses", () => {
      const { game, boss } = createBoss();

      boss.isTransforming = false;
      boss.state = "idle";

      boss.healingBarrierCooldown = 100;
      boss.healingBarrierCooldownTimer = 99;

      boss.healingBarrierLogic(5);

      expect(boss.healingBarrier).toBeTruthy();
      expect(boss.isHealingBarrierActive).toBe(true);
      expect(boss.isBarrierActive).toBe(true);
      expect(game.enemies.length).toBeGreaterThan(0);
    });

    test("healingBarrierLogic does not spawn while transforming or in transform state", () => {
      const { game, boss } = createBoss();

      boss.healingBarrierCooldown = 100;
      boss.healingBarrierCooldownTimer = 99;

      boss.isTransforming = true;
      boss.state = "idle";
      boss.healingBarrierLogic(5);
      expect(boss.healingBarrier).toBeNull();
      expect(game.enemies.length).toBe(0);

      boss.isTransforming = false;
      boss.state = "transform";
      boss.healingBarrierLogic(5);
      expect(boss.healingBarrier).toBeNull();
      expect(game.enemies.length).toBe(0);
    });

    test("active barrier expires after duration: plays crack SFX and spawns DisintegrateCollision", () => {
      const { game, boss } = createBoss();

      boss.healingBarrierCooldown = 1;
      boss.healingBarrierCooldownTimer = 1;
      boss.healingBarrierLogic(1);
      expect(boss.healingBarrier).toBeTruthy();

      boss.healingBarrierActiveTimer = boss.healingBarrierNormalDuration - 1;
      boss.healingBarrierLogic(5);

      expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
        "elyvorg_shield_crack_3_sound",
        false,
        true
      );
      expect(game.collisions.length).toBe(1);
      expect(boss.healingBarrier).toBeNull();
      expect(boss.isBarrierActive).toBe(false);
      expect(boss.isHealingBarrierActive).toBe(false);
    });

    test("if barrier is deleted or has zero lives: clears barrier and sets player bossCollisionTimer", () => {
      const { game, boss } = createBoss();

      boss.healingBarrier = { markedForDeletion: true, lives: 0 };
      boss.isBarrierActive = true;
      boss.isHealingBarrierActive = true;

      boss.healingBarrierLogic(16);

      expect(boss.healingBarrier).toBeNull();
      expect(boss.isBarrierActive).toBe(false);
      expect(boss.isHealingBarrierActive).toBe(false);
      expect(game.player.bossCollisionTimer).toBe(1000);
    });
  });

  describe("distortion effect lifecycle", () => {
    test("updateDistortionEffect turns off distortion after duration and plays end SFX", () => {
      const { game, boss } = createBoss();

      game.distortionActive = true;
      boss.distortionDuration = 10;
      boss.distortionEffectTimer = 9;

      boss.updateDistortionEffect(2);

      expect(game.distortionActive).toBe(false);
      expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
        "distortionEndSound",
        false,
        true
      );
    });

    test("updateDistortionEffect resets timer when inactive and effect is fully faded out", () => {
      const { game, boss } = createBoss();

      game.distortionActive = false;
      game.distortionEffect.amount = 0;
      boss.distortionEffectTimer = 5;

      boss.updateDistortionEffect(1);

      expect(boss.distortionEffectTimer).toBe(0);
    });
  });

  describe("wind gust audio edge", () => {
    test("updateWindParticles fades out gust SFX when leaving wing state", () => {
      const { game, boss } = createBoss();

      boss.state = "idle";
      boss.windEffectAlpha = 1;
      boss.windParticles = [];
      boss._windGustStarted = true;
      boss._windGustFading = false;

      boss.updateWindParticles(16);

      expect(game.audioHandler.enemySFX.fadeOutAndStop).toHaveBeenCalledWith(
        "ntharaxWindGustSound",
        200
      );
      expect(boss._windGustFading).toBe(true);
      expect(boss._windGustStarted).toBe(false);
    });
  });

  describe("laser attack", () => {
    test("laserLogic spawns a LaserBall when reaching max frame (normal and mode2)", () => {
      const { game, boss } = createBoss();

      boss.shouldInvert = true;
      boss.laserFrameInterval = 1;
      boss.state = "laser";
      boss.laserStarted = false;

      boss.mode2 = false;
      game.enemies.length = 0;

      runUntil(
        () => boss.laserLogic(2),
        () => game.enemies.length > 0,
        { max: 5000 }
      );
      expect(game.enemies.length).toBeGreaterThan(0);

      boss.state = "laser";
      boss.laserStarted = false;
      boss.laserDir = 1;
      boss.laserSweepCount = 0;
      boss.laserShotFired = false;

      boss.mode2 = true;
      boss.applyMode2Tuning();
      boss.laserFrameInterval = 1;
      game.enemies.length = 0;

      runUntil(
        () => boss.laserLogic(2),
        () => game.enemies.length > 0,
        { max: 5000 }
      );
      expect(game.enemies.length).toBeGreaterThan(0);
    });

    test("laserLogic completes sweeps and returns to idle (normal mode)", () => {
      const { boss } = createBoss();
      jest.spyOn(boss, "backToIdleSetUp");

      boss.state = "laser";
      boss.laserStarted = false;
      boss.laserFrameInterval = 1;
      boss.mode2 = false;

      runUntil(
        () => boss.laserLogic(2),
        () => !boss.laserStarted && boss.state === "idle",
        { max: 10000 }
      );

      expect(boss.backToIdleSetUp).toHaveBeenCalled();
      expect(boss.laserStarted).toBe(false);
      expect(boss.state).toBe("idle");
    });
  });

  describe("asteroid attack", () => {
    test("asteroidLogic spawns 10 asteroids total in mode1 and mode2", () => {
      const { game, boss } = createBoss();

      boss.state = "asteroid";
      boss.asteroidStarted = false;
      boss.asteroidFrameInterval = 1;

      boss.mode2 = false;
      game.enemies.length = 0;

      runUntil(
        () => boss.asteroidLogic(2),
        () => !boss.asteroidStarted && boss.state === "idle",
        { max: 20000 }
      );
      expect(game.enemies.length).toBe(10);

      boss.state = "asteroid";
      boss.asteroidStarted = false;
      boss.asteroidFrameInterval = 1;

      boss.mode2 = true;
      game.enemies.length = 0;

      runUntil(
        () => boss.asteroidLogic(2),
        () => !boss.asteroidStarted && boss.state === "idle",
        { max: 20000 }
      );
      expect(game.enemies.length).toBe(10);
    });
  });

  describe("slap attack", () => {
    test("slapLogic triggers shockwaves the configured number of times and returns to idle (mode1)", () => {
      const { boss } = createBoss();

      boss.slapHitsTargetNormal = 3;
      boss.slapFrameInterval = 1;

      jest.spyOn(boss, "spawnSlapShockwaves");
      jest.spyOn(boss, "backToIdleSetUp");

      boss.state = "slap";
      boss.slapStarted = false;
      boss.mode2 = false;

      runUntil(
        () => boss.slapLogic(2),
        () => !boss.slapStarted && boss.state === "idle",
        { max: 20000 }
      );

      expect(boss.spawnSlapShockwaves).toHaveBeenCalledTimes(3);
      expect(boss.backToIdleSetUp).toHaveBeenCalled();
      expect(boss.state).toBe("idle");
      expect(boss.slapStarted).toBe(false);
    });

    test("slapLogic uses mode2 hit target when mode2 is active", () => {
      const { boss } = createBoss();

      boss.slapHitsTargetMode2 = 4;
      boss.slapFrameInterval = 1;

      jest.spyOn(boss, "spawnSlapShockwaves");

      boss.state = "slap";
      boss.slapStarted = false;
      boss.mode2 = true;

      runUntil(
        () => boss.slapLogic(2),
        () => !boss.slapStarted && boss.state === "idle",
        { max: 20000 }
      );

      expect(boss.spawnSlapShockwaves).toHaveBeenCalledTimes(4);
    });
  });

  describe("defeat flow", () => {
    test("checkIfDefeated triggers defeatCommon once and performs delayed mode2/transform reset", () => {
      const { boss } = createBoss();

      boss.mode2 = true;
      boss.mode2Triggered = true;
      boss.mode2Pending = true;
      boss.isTransforming = true;
      boss.transformPhase = "explode";
      boss.transformTimer = 999;
      boss.transformParticles = [{ x: 1 }];
      boss.transformExplodeParticles = [{ x: 2 }];
      boss.transformBall = { radius: 10, targetRadius: 10, alpha: 1 };

      boss.lives = 0;
      boss.checkIfDefeated();

      expect(boss._defeatCommonArgs).toBeTruthy();
      expect(boss._defeatCommonArgs.bossId).toBe("ntharax");

      const prevArgs = boss._defeatCommonArgs;
      boss.checkIfDefeated();
      expect(boss._defeatCommonArgs).toBe(prevArgs);

      jest.advanceTimersByTime(200);

      expect(boss.mode2).toBe(false);
      expect(boss.mode2Triggered).toBe(false);
      expect(boss.mode2Pending).toBe(false);
      expect(boss.isTransforming).toBe(false);

      expect(boss.transformPhase).toBe("idle");
      expect(boss.transformTimer).toBe(0);
      expect(boss.transformParticles.length).toBe(0);
      expect(boss.transformExplodeParticles.length).toBe(0);

      expect(boss.transformBall.radius).toBe(0);
      expect(boss.transformBall.targetRadius).toBe(0);
      expect(boss.transformBall.alpha).toBe(0);
    });
  });

  describe("update() routing sanity", () => {
    test("update() does not run fight logic when talkToBoss is true", () => {
      const game = makeGame({
        boss: { id: "ntharax", current: null, talkToBoss: true, runAway: false, isVisible: true },
      });
      const boss = new NTharax(game);
      game.boss.current = boss;

      jest.spyOn(boss, "checkIfDefeated");
      jest.spyOn(boss, "stateRandomiser");

      advance(game, boss, 16, 1);

      expect(boss.checkIfDefeated).not.toHaveBeenCalled();
      expect(boss.stateRandomiser).not.toHaveBeenCalled();
    });

    test("updateRunSFXEdge starts and stops running SFX on run state edges", () => {
      const { game, boss } = createBoss();

      boss.state = "idle";
      boss.updateRunSFXEdge();
      expect(game.audioHandler.enemySFX.playSound).not.toHaveBeenCalled();

      boss.state = "run";
      boss.updateRunSFXEdge();
      expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
        "bossRunningSound",
        true,
        true,
        false,
        expect.any(Object)
      );

      boss.state = "idle";
      boss.updateRunSFXEdge();
      expect(game.audioHandler.enemySFX.stopSound).toHaveBeenCalledWith("bossRunningSound");
    });

    test("update() queues mode2Pending when threshold is crossed", () => {
      const { game, boss } = createBoss();

      boss.lives = boss.getMode2ThresholdLives();
      expect(boss.mode2Pending).toBe(false);

      advance(game, boss, 16, 1);
      expect(boss.mode2Pending).toBe(true);
    });
  });
});
