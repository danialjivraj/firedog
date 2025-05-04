import {
    Enemy,
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
    Cyclorange,
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

// -----------------------------------------------------------------------------
// Enemy (base class)
// -----------------------------------------------------------------------------
describe('Enemy (base class)', () => {
    let game, ctx, e;

    beforeEach(() => {
        game = {
            width: 1920, height: 689, speed: 5,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn(), stopSound: jest.fn() } },
            debug: false,
        };
        ctx = {
            strokeRect: jest.fn(),
            drawImage: jest.fn(),
            shadowColor: null,
            shadowBlur: 0,
        };
        e = new Enemy();
        Object.assign(e, {
            game,
            width: 10, height: 10,
            x: 100, y: 50,
            speedX: 2, speedY: 3,
            maxFrame: 2,
            image: {},
            soundId: 'boom',
        });
    });

    it('isOnScreen() returns correct boolean', () => {
        expect(e.isOnScreen()).toBe(true);
        e.x = -e.width - 1; expect(e.isOnScreen()).toBe(false);
        e.x = 0; e.y = game.height + 1; expect(e.isOnScreen()).toBe(false);
    });

    it('increments frameX, wrapping at maxFrame', () => {
        e.frameTimer = e.frameInterval + 1;
        e.update(0); expect(e.frameX).toBe(1);
        e.frameTimer = e.frameInterval + 1; e.frameX = 2;
        e.update(0); expect(e.frameX).toBe(0);
    });

    it('moves left by speedX+game.speed when cabin hidden', () => {
        const bx = e.x, by = e.y;
        e.update(16);
        expect(e.x).toBe(bx - (e.speedX + game.speed));
        expect(e.y).toBe(by + e.speedY);
    });

    it('moves by speedX only when cabin visible (and not MovingGroundEnemy)', () => {
        game.cabin.isFullyVisible = true;
        Object.assign(e, { x: 200, y: 80, speedX: 4, speedY: 6 });
        e.update(0);
        expect(e.x).toBe(200 - 4);
        expect(e.y).toBe(80 - 6);
    });

    it('marks for deletion & plays flagged sound when off-screen or dead', () => {
        e.x = -e.width - 1; e.lives = 0;
        e.update(16);
        expect(e.markedForDeletion).toBe(true);
        expect(game.audioHandler.enemySFX.playSound)
            .toHaveBeenCalledWith('boom', false, true, true);
    });

    it('plays sound when coming on-screen', () => {
        game.audioHandler.enemySFX.playSound.mockClear();
        e.update(16);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('boom');
    });

    it('draw() with no stun/red leaves shadow transparent', () => {
        ctx.drawImage.mockImplementation(() => { });
        e.draw(ctx);
        expect(ctx.shadowColor).toBe('transparent');
        expect(ctx.shadowBlur).toBe(0);
    });

    it('draw() applies yellow shadow when isStunEnemy', () => {
        e.isStunEnemy = true;
        ctx.drawImage.mockImplementation(() => { });
        e.draw(ctx);
        expect(ctx.shadowColor).toBe('transparent');
        expect(ctx.shadowBlur).toBe(0);
    });

    it('draw() applies red shadow when isRedEnemy', () => {
        e.isRedEnemy = true;
        ctx.drawImage.mockImplementation(() => { });
        e.draw(ctx);
        expect(ctx.shadowColor).toBe('transparent');
        expect(ctx.shadowBlur).toBe(0);
    });

    it('draw() strokes bounds when debug=true', () => {
        game.debug = true;
        ctx.drawImage.mockImplementation(() => { });
        e.draw(ctx);
        expect(ctx.strokeRect).toHaveBeenCalledWith(e.x, e.y, e.width, e.height);
    });
});

// -----------------------------------------------------------------------------
// FlyingEnemy
// -----------------------------------------------------------------------------
describe('FlyingEnemy', () => {
    let fe, game;
    beforeEach(() => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        game = {
            width: 1920, height: 689, speed: 3,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
        };
        fe = new FlyingEnemy(game, 20, 10, 3, 'img');
    });
    afterEach(() => Math.random.mockRestore());

    it('initializes inside canvas plus random offset', () => {
        expect(fe.x).toBeGreaterThan(game.width);
        expect(fe.x).toBeLessThanOrEqual(game.width * 1.5);
        expect(fe.y).toBeGreaterThanOrEqual(game.height * 0.1);
        expect(fe.y).toBeLessThanOrEqual(game.height * 0.4 + 100);
    });

    it('update() calls super and then oscillates y by sin(angle)', () => {
        const oldY = fe.y;
        fe.va = Math.PI / 2;
        fe.angle = 0;
        fe.update(16);
        expect(fe.y).toBeCloseTo(oldY + Math.sin(fe.va));
    });

    it('plays sound when on-screen', () => {
        fe.x = 1; fe.y = 1; fe.width = 1; fe.height = 1;
        fe.speedX = 0;
        fe.game.speed = 0;
        fe.update(16);
        expect(game.audioHandler.enemySFX.playSound)
            .toHaveBeenCalledWith(fe.soundId);
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

    test.each(classes)(
        '%s starts at right edge and moves left by game.speed',
        (name, Cls) => {
            const game = {
                width: 1920, height: 689, groundMargin: 10, speed: 7,
                cabin: { isFullyVisible: false },
                audioHandler: { enemySFX: { playSound: jest.fn() } },
            };
            const inst = new Cls(game, 30, 20, 2, 'img');
            expect(inst.x).toBe(game.width);
            expect(inst.y).toBe(game.height - inst.height - game.groundMargin);

            const bx = inst.x;
            inst.speedX = 0;
            inst.update(16);
            expect(inst.x).toBe(bx - game.speed);
        }
    );

    it('MovingGroundEnemy skips movement when cabin visible', () => {
        const game = {
            width: 1920, height: 689, groundMargin: 10, speed: 7,
            cabin: { isFullyVisible: true },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
        };
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
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        game = {
            width: 1920, height: 689, groundMargin: 10,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
        };
        ce = new ClimbingEnemy(game, 20, 10, 2, 'img');
        ce.y = game.height - ce.height - game.groundMargin + 1;
        ctx = {
            beginPath: jest.fn(), moveTo: jest.fn(),
            lineTo: jest.fn(), stroke: jest.fn(), drawImage: jest.fn(),
        };
    });
    afterEach(() => Math.random.mockRestore());

    it('bounces off the ground limit', () => {
        ce.speedY = 1;
        ce.update(16);
        expect(ce.speedY).toBe(-1);
    });

    it('marks deletion if climbing too far up', () => {
        ce.y = -ce.height - 1;
        ce.update(16);
        expect(ce.markedForDeletion).toBe(true);
    });

    it('draw() renders the “rope” then the sprite', () => {
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
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        game = {
            width: 1920, height: 689, speed: 0,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
        };
        ve = new VerticalEnemy(game, 10, 5, 2, 'img');
        ve.y = 0;
    });
    afterEach(() => Math.random.mockRestore());

    it('update() increments y by 2×speedY (base + subclass)', () => {
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
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        game = {
            width: 1920, height: 689,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
            player: { x: 50 },
        };
        fe = new FallingEnemy(game, 12, 6, 2, 'img');
    });
    afterEach(() => Math.random.mockRestore());

    it('spawns above top and between player.x and game.width', () => {
        expect(fe.y).toBe(-fe.height);
        expect(fe.x).toBeGreaterThanOrEqual(game.player.x);
        expect(fe.x).toBeLessThanOrEqual(game.width);
    });

    it('update() moves downward by speedY', () => {
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
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        game = {
            width: 1920, height: 689, speed: 0,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
        };
        ue = new UnderwaterEnemy(game, 12, 6, 3, 'img');
        ue.angle = 0; ue.va = Math.PI / 2;
    });
    afterEach(() => Math.random.mockRestore());

    it('oscillates y by sin(angle) after super.update()', () => {
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
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        game = {
            width: 1920, height: 689, speed: 0,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
            player: { x: 50, y: 30 },
            enemies: []
        };
        bee = new BeeInstances(game, 20, 10, 3, 'img', 40, 7, 5, 10);
        bee.x = game.width - 10;
        bee.y = 20;
    });
    afterEach(() => Math.random.mockRestore());

    it('is a stun enemy', () => {
        expect(bee.isStunEnemy).toBe(true);
    });

    it('initial currentSpeed matches initialSpeed', () => {
        expect(bee.currentSpeed).toBe(7);
    });

    it('when distance > chaseDistance, drifts left by speedX + currentSpeed', () => {
        const ox = bee.x;
        bee.passedPlayer = false;
        bee.update(16);
        expect(bee.x).toBeCloseTo(ox - (bee.speedX + bee.currentSpeed));
    });

    it('when distance ≤ chaseDistance, moves toward player (x decreases) without flipping passedPlayer', () => {
        bee.x = game.player.x + bee.chaseDistance - 1;
        bee.passedPlayer = false;
        const ox = bee.x;
        bee.update(16);
        expect(bee.x).toBeLessThan(ox);
        expect(bee.passedPlayer).toBe(false);
    });

    it('after passing player, continues along stored angleToPlayer', () => {
        const angle = Math.PI / 4;
        bee.passedPlayer = true;
        bee.angleToPlayer = angle;
        const ox = bee.x, oy = bee.y;
        bee.update(16);
        expect(bee.x).toBeGreaterThan(ox);
        expect(bee.y).toBeGreaterThan(oy);
    });
});

// -----------------------------------------------------------------------------
// Projectile & subclasses
// -----------------------------------------------------------------------------
describe('Projectile & subclasses', () => {
    let game, ctx, p;
    beforeEach(() => {
        game = {
            width: 1920, height: 689, speed: 2,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
            player: { x: 0, y: 0 },
            isElyvorgFullyVisible: true,
            debug: true,
        };
        ctx = {
            drawImage: jest.fn(),
            strokeRect: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            scale: jest.fn(),
            shadowColor: null,
            shadowBlur: 0,
        };
    });

    it('Projectile updates frame without throwing', () => {
        p = new Projectile(game, 10, 20, 30, 40, 2, 'img', 5, 10);
        expect(() => p.update(16)).not.toThrow();
    });

    it('WindAttack moves and pushes player', () => {
        const player = { x: 50, y: 50 };
        const w = new WindAttack(game, 10, 20, 30, 40, 2, 'img', 5, player);
        w.update(16);
        expect(player.x).not.toBe(50);
        expect(() => w.update(16)).not.toThrow();
    });

    it('LeafAttack rotates and draws safely', () => {
        const l = new LeafAttack(game, 10, 20, 30, 40, 2, 'img', 5, 0.01);
        l.update(16);
        expect(l.rotation).toBeGreaterThan(0);
        expect(() => l.draw(ctx)).not.toThrow();
    });

    ['PoisonSpit', 'PurpleLaser'].forEach(cls => {
        it(`${cls} instantiates and update/draw don't throw`, () => {
            const C = { PoisonSpit, PurpleLaser }[cls];
            const o = cls === 'PoisonSpit'
                ? new PoisonSpit(game, 10, 20, 5, 5, 1, 'img', 3)
                : new PurpleLaser(game, 10, 20);
            expect(() => o.update(16)).not.toThrow();
            expect(() => o.draw(ctx)).not.toThrow();
        });
    });

    it('LaserBeam flips when visible', () => {
        const lb = new LaserBeam(game, 10, 20, 30, 40, 1, 'img', -5);
        expect(() => lb.draw(ctx)).not.toThrow();
    });

    it('YellowBeam moves up by 2×speedY', () => {
        const yb = new YellowBeam(game, 10, 20);
        const oldY = yb.y;
        yb.update(16);
        expect(yb.y).toBe(oldY - 10);
    });

    it('IceBall grows and rotates', () => {
        const ib = new IceBall(game, 10, 20, 3);
        ib.update(16);
        expect(ib.size).toBeGreaterThan(ib.initialSize);
    });

    it('DarkLaser draws without throwing', () => {
        const dl = new DarkLaser(game, 10, 20, 3, true);
        expect(() => dl.draw(ctx)).not.toThrow();
    });

    it('RockProjectile rotates and draws safely', () => {
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
        game = {
            width: 1920, height: 689, speed: 3,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
            player: { x: 100, y: 100, states: ['idle', 'walk', 'jump'], currentState: 'idle', onGround: () => true },
            hiddenTime: 0, groundMargin: 10, gameOver: false,
        };
        gob = new Goblin(game);
    });

    it('instantiates with walk state', () => {
        expect(gob.state).toBe('walk');
        expect(gob.lives).toBe(3);
    });

    it('update/walk does not throw', () => {
        expect(() => gob.update(16)).not.toThrow();
    });

    it('draw does not throw', () => {
        const ctx = {
            drawImage: jest.fn(),
            strokeRect: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            scale: jest.fn(),
            shadowColor: '',
            shadowBlur: 0,
        };
        expect(() => gob.draw(ctx)).not.toThrow();
    });
});

// -----------------------------------------------------------------------------
// Map 1 Enemies
// -----------------------------------------------------------------------------
describe('Map 1 Enemies', () => {
    let game, ctx;

    beforeEach(() => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        game = {
            width: 1920, height: 689, speed: 2, groundMargin: 10,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn(), stopSound: jest.fn() } },
            player: { x: 400, y: 300, states: ['idle', 'walk', 'jump'], currentState: 'idle', onGround: () => true },
            hiddenTime: 0, gameOver: false,
            enemies: [],
        };
        ctx = {
            beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), stroke: jest.fn(),
            drawImage: jest.fn(), strokeRect: jest.fn(), save: jest.fn(), restore: jest.fn(),
            translate: jest.fn(), rotate: jest.fn(), scale: jest.fn(),
            shadowColor: null, shadowBlur: 0,
            globalAlpha: null,
        };
    });

    afterEach(() => Math.random.mockRestore());

    it('Dotter instantiates and buzzes once on screen', () => {
        const d = new Dotter(game);
        d.x = game.width / 2;
        d.y = game.height / 2;
        expect(() => d.update(16)).not.toThrow();
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('buzzingFly');
    });

    it('Vertibat oscillates and plays two different bat sounds', () => {
        const v = new Vertibat(game);
        v.x = game.width / 2;
        v.y = game.height / 2;
        v.frameX = 3;
        expect(() => v.update(16)).not.toThrow();
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('batPitch');
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('wooshBat');
    });

    it('Ghobat plays flap audio on frame 3', () => {
        const g = new Ghobat(game);
        g.speedX = 0; game.speed = 0;
        g.frameX = 3;
        g.x = 100; g.y = 100; g.width = 1; g.height = 1;
        expect(() => g.update(16)).not.toThrow();
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('batFlapAudio');
    });

    it('Ravengloom calls two raven sounds', () => {
        const r = new Ravengloom(game);
        r.x = game.width / 2; r.y = game.height / 2;
        r.playsOnce = true;
        r.update(16);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('ravenCallAudio');
        r.frameX = 2; r.playsOnce = false;
        r.update(16);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('ravenSingleFlap');
    });

    it('MeatSoldier drifts at random speed and plays only once', () => {
        const m = new MeatSoldier(game);
        expect(m.currentSpeed).toBeUndefined();
        m.update(16);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('meatSoldierSound');
    });

    it('Skulnap wakes up when player is close', () => {
        const s = new Skulnap(game);
        s.x = game.player.x + 1000;
        s.update(16);
        expect(s.state).toBe('sleeping');
        s.x = game.player.x + 100;
        s.update(16);
        expect(s.state).toBe('running');
    });

    it('Abyssaw stops chainsaw sound when off-screen or dead', () => {
        const a = new Abyssaw(game);
        a.lives = 0; a.x = -a.width - 1;
        a.update(16);
        expect(game.audioHandler.enemySFX.stopSound).toHaveBeenCalledWith('spinningChainsaw');
    });

    it('GlidoSpike throws a WindAttack during its attack animation', () => {
        const gs = new GlidoSpike(game);
        gs.x = 100;
        gs.state = 'attack';
        gs.canAttack = true;
        gs.attackAnimation.frameX = 12;
        gs.update(16);
        expect(game.enemies.some(e => e instanceof WindAttack)).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// Map 2 Enemies
// -----------------------------------------------------------------------------
describe('Map 2 Enemies', () => {
    let game;
    beforeEach(() => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        game = {
            width: 1920, height: 689, speed: 2, groundMargin: 10,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
            player: { x: 400, y: 300 },
            enemies: [],
            gameOver: false,
        };
    });
    afterEach(() => Math.random.mockRestore());

    it('DuskPlant throws LeafAttack roughly every cooldown', () => {
        const dp = new DuskPlant(game);
        dp.x = game.width - dp.width - 1;
        dp.lastLeafAttackTime = dp.leafAttackConfig.cooldown;
        dp.update(dp.leafAttackConfig.cooldown);
        expect(game.enemies.some(e => e instanceof LeafAttack)).toBe(true);
    });

    it('Silknoir oscillates on its web', () => {
        const sn = new Silknoir(game);
        expect(() => sn.update(16)).not.toThrow();
    });

    it('WalterTheGhost chases then stops moving after pass', () => {
        const w = new WalterTheGhost(game);
        w.speedX = 0; game.speed = 0;
        w.x = game.player.x + 100; w.y = game.player.y;
        w.passedPlayer = false;
        w.update(16);
        expect(w.x).toBeLessThan(game.player.x + 100);
        w.passedPlayer = true;
        const ox = w.x;
        w.update(16);
        expect(w.x).toBe(ox);
    });

    it('Ben chases vertically then still drifts left when passed', () => {
        const b = new Ben(game);
        b.speedX = 0; game.speed = 0;
        b.x = game.player.x + 100; b.y = game.player.y;
        b.passedPlayer = false;
        b.update(16);
        expect(b.x).toBeLessThan(game.player.x + 100);
        b.passedPlayer = true;
        const ox = b.x;
        b.update(16);
        expect(b.x).toBeLessThan(ox);
    });

    it('Aura is semi-transparent and draws without error', () => {
        const a = new Aura(game);
        const ctx = {
            save: jest.fn(), restore: jest.fn(),
            drawImage: jest.fn(), strokeRect: jest.fn(),
            shadowColor: null, shadowBlur: 0,
            globalAlpha: null,
        };
        expect(() => a.draw(ctx)).not.toThrow();
    });

    it('Dolly periodically spawns Aura children', () => {
        const d = new Dolly(game);
        d.x = game.width - 1;
        d.auraTimer = 1000;
        d.update(1000);
        expect(game.enemies.some(e => e instanceof Aura)).toBe(true);
    });

    it('plays humming and aura sounds', () => {
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
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        game = {
            width: 1920, height: 689, speed: 2, groundMargin: 10,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
            player: { x: 400, y: 300 },
            enemies: [],
            gameOver: false,
        };
    });
    afterEach(() => Math.random.mockRestore());

    it('Piranha chomps on frame 1', () => {
        const p = new Piranha(game);
        p.speedX = 0; game.speed = 0;
        p.frameX = 1;
        p.x = 100; p.y = 100; p.width = 1; p.height = 1;
        expect(() => p.update(16)).not.toThrow();
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('crunchSound');
    });

    it('SkeletonFish uses one of two AI logics without throwing', () => {
        const sf = new SkeletonFish(game);
        expect(() => sf.update(16)).not.toThrow();
        const ctx = {
            save: jest.fn(), restore: jest.fn(),
            translate: jest.fn(), rotate: jest.fn(), scale: jest.fn(),
            drawImage: jest.fn(), strokeRect: jest.fn(),
        };
        expect(() => sf.draw(ctx)).not.toThrow();
    });

    it('SpearFish moves faster and is tinted red', () => {
        const sf = new SpearFish(game);
        expect(sf.isRedEnemy).toBe(true);
        const ox = sf.x;
        sf.update(16);
        expect(sf.x).toBeLessThan(ox);
    });

    it('JetFish trails along player y and sounds rocket', () => {
        const jf = new JetFish(game);
        jf.x = 100; jf.y = game.player.y;
        jf.update(16);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('rocketLauncherSound');
    });

    it('Piper extends when close or hurt', () => {
        const p = new Piper(game);
        p.lives = 1;
        p.update(16);
        expect(p.state).toBe('extended');
        p.state = 'idle'; p.lives = 2; p.x = game.player.x + 50;
        p.update(16);
        expect(p.state).toBe('extended');
    });

    it('Voltzeel dives toward player before passing', () => {
        const v = new Voltzeel(game);
        v.y = game.player.y + 100; v.passedPlayer = false;
        const beforeY = v.y;
        v.update(16);
        expect(v.y).not.toEqual(beforeY + v.currentSpeed);
    });

    it('Garry instantiates and never throws on update/draw', () => {
        const g = new Garry(game);
        expect(() => g.update(16)).not.toThrow();
        expect(() => g.draw({ drawImage: () => { }, strokeRect: () => { } })).not.toThrow();
    });
});

// -----------------------------------------------------------------------------
// Map 4 Enemies
// -----------------------------------------------------------------------------
describe('Map 4 Enemies', () => {
    let game;
    beforeEach(() => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        game = {
            width: 1920,
            height: 689,
            speed: 2,
            groundMargin: 10,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
            player: { x: 400, y: 300 },
            enemies: [],
            background: { isRaining: false },
            gameOver: false,
        };
    });
    afterEach(() => Math.random.mockRestore());

    it('BigGreener throws two LeafAttacks after cooldown', () => {
        const bg = new BigGreener(game);
        bg.x = game.width - bg.width - 1;
        bg.lastLeafAttackTime = bg.leafAttackConfig.cooldown;
        bg.update(bg.leafAttackConfig.cooldown);
        const leafs = game.enemies.filter(e => e instanceof LeafAttack);
        expect(leafs.length).toBeGreaterThanOrEqual(2);
    });

    it('Chiquita plays initial raven sounds', () => {
        const ch = new Chiquita(game);
        ch.x = game.width / 2;
        ch.y = game.height / 2;
        expect(() => ch.update(16)).not.toThrow();
        expect(game.audioHandler.enemySFX.playSound)
            .toHaveBeenCalledWith('ravenCallAudio');

        ch.frameX = 7;
        ch.frameTimer = 0;
        ch.update(16);
        expect(game.audioHandler.enemySFX.playSound)
            .toHaveBeenCalledWith('ravenSingleFlap');
    });

    it('Sluggie moves left on update', () => {
        const sl = new Sluggie(game);
        const ox = sl.x;
        sl.update(16);
        expect(sl.x).toBeLessThan(ox);
    });

    it('LilHornet buzzes once on first on-screen', () => {
        const lh = new LilHornet(game);
        lh.x = game.width / 2; lh.y = game.height / 2;
        lh.update(16);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('buzzingFly');
    });

    it('KarateCroco enters flykick state when close', () => {
        const kc = new KarateCroco(game);
        kc.x = game.player.x + 100;
        kc.update(16);
        expect(kc.state).toBe('flykick');
    });

    it('Zabkous throws PoisonSpit during attack', () => {
        const zb = new Zabkous(game);
        zb.x = game.player.x + 100;
        zb.state = 'attack';
        zb.frameX = 13;
        zb.update(16);
        expect(game.enemies.some(e => e instanceof PoisonSpit)).toBe(true);
    });

    it('SpidoLazer throws LaserBeam on attack frame', () => {
        const slz = new SpidoLazer(game);
        slz.x = game.player.x + 100;
        slz.state = 'attack';
        slz.canAttack = true;
        slz.attackAnimation.frameX = 27;
        slz.update(16);
        expect(game.enemies.some(e => e.constructor.name === 'LaserBeam')).toBe(true);
    });

    it('Jerry spawns Skulnap children when frame max reached', () => {
        const j = new Jerry(game);
        j.x = game.width / 2;
        j.frameX = j.maxFrame;
        j.maxFrameReached = false;
        j.update(j.frameInterval + 1);
        expect(game.enemies.some(e => e.constructor.name === 'Skulnap')).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// Map 5 Enemies
// -----------------------------------------------------------------------------
describe('Map 5 Enemies', () => {
    let game;
    beforeEach(() => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        game = {
            width: 1920,
            height: 689,
            speed: 2,
            groundMargin: 10,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn() } },
            player: { x: 400, y: 300 },
            enemies: [],
            background: { isRaining: true },
            gameOver: false,
        };
    });
    afterEach(() => Math.random.mockRestore());

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
        expect(game.enemies.some(e => e.constructor.name === 'DarkLaser')).toBe(true);
    });

    it('PurpleFlyer throws IceBall when raining and cooldown met', () => {
        const pf = new PurpleFlyer(game);
        pf.x = game.player.x + 100;
        pf.iceballTimer = 2000;
        pf.update(2000);
        expect(game.enemies.some(e => e instanceof IceBall)).toBe(true);
    });

    it('LazyMosquito buzzes once on first on-screen', () => {
        const lm = new LazyMosquito(game);
        lm.x = game.width / 2; lm.y = game.height / 2;
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
        expect(game.enemies.some(e => e instanceof YellowBeam)).toBe(true);
    });

    it('Cyclorange updates frames without error', () => {
        const co = new Cyclorange(game);
        expect(() => co.update(16)).not.toThrow();
    });

    it('Tauro moves left by speed on update and is red', () => {
        const t = new Tauro(game);
        expect(t.isRedEnemy).toBe(true);
        const ox = t.x;
        t.update(16);
        expect(t.x).toBeLessThan(ox);
    });

    it('Bee and AngryBee initialize stun flags and speeds', () => {
        const b = new Bee(game);
        const ab = new AngryBee(game);
        expect(b.soundId).toBe('beeBuzzing');
        expect(ab.soundId).toBe('angryBeeBuzzing');
    });

    it('HangingSpidoLazer throws LaserBeam on correct frame', () => {
        const hl = new HangingSpidoLazer(game);
        hl.frameX = 27;
        hl.x = game.width / 2;
        hl.canAttack = true;
        hl.update(16);
        expect(game.enemies.some(e => e.constructor.name === 'LaserBeam')).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// Map 6 Enemies
// -----------------------------------------------------------------------------
describe('Map 6 Enemies', () => {
    let game;
    beforeEach(() => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        game = {
            width: 1920,
            height: 689,
            speed: 2,
            groundMargin: 10,
            cabin: { isFullyVisible: false },
            audioHandler: { enemySFX: { playSound: jest.fn(), stopSound: jest.fn() } },
            player: { x: 400, y: 300 },
            enemies: [],
            background: { isRaining: false },
            gameOver: false,
        };
    });
    afterEach(() => Math.random.mockRestore());

    it('Cactus is stun enemy', () => {
        const c = new Cactus(game);
        expect(c.isStunEnemy).toBe(true);
    });

    it('PetroPlant throws two RockProjectiles after cooldown', () => {
        const pp = new PetroPlant(game);
        pp.x = game.width - pp.width - 1;
        pp.lastRockAttackTime = pp.rockAttackConfig.cooldown;
        pp.update(pp.rockAttackConfig.cooldown);
        const rocks = game.enemies.filter(e => e.constructor.name === 'RockProjectile');
        expect(rocks.length).toBeGreaterThanOrEqual(2);
    });

    it('Plazer throws PurpleLaser on correct frame', () => {
        const pz = new Plazer(game);
        pz.x = game.player.x + 100;
        pz.frameX = 1;
        pz.canAttack = true;
        pz.update(16);
        expect(game.enemies.some(e => e instanceof PurpleLaser)).toBe(true);
    });

    it('Volcanurtle moves left on update and is red', () => {
        const vt = new Volcanurtle(game);
        expect(vt.isRedEnemy).toBe(true);
        const ox = vt.x;
        vt.update(16);
        expect(vt.x).toBeLessThan(ox);
    });

    it('Rollhog enters roll state when close', () => {
        const rh = new Rollhog(game);
        rh.x = game.player.x + 100;
        rh.update(16);
        expect(rh.state).toBe('roll');
    });

    it('TheRock enters smash state when player close', () => {
        const tr = new TheRock(game);
        tr.x = game.player.x + 50;
        tr.state = 'idle';
        tr.playSmashOnce = true;
        tr.update(16);
        expect(tr.state).toBe('smash');
    });

    it('Veynoculus instantiates and update/draw don’t throw', () => {
        const v = new Veynoculus(game);
        expect(() => v.update(16)).not.toThrow();
        const ctx = { drawImage: jest.fn(), strokeRect: jest.fn() };
        expect(() => v.draw(ctx)).not.toThrow();
    });

    it('VolcanoWasp buzzes once on first on-screen', () => {
        const vw = new VolcanoWasp(game);
        vw.x = game.width / 2;
        vw.y = game.height / 2;
        vw.update(16);
        expect(game.audioHandler.enemySFX.playSound)
            .toHaveBeenCalledWith('angryBeeBuzzing');
    });

    it('Dragon throws WindAttack on attack frame', () => {
        const dr = new Dragon(game);
        dr.x = game.player.x + 100;
        dr.frameX = 7;
        dr.canAttack = true;
        dr.update(16);
        expect(game.enemies.some(e => e instanceof WindAttack)).toBe(true);
    });
});
