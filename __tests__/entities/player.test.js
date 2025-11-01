import { Player, CollisionLogic } from '../../game/entities/player';
import { Fireball, CoinLoss, PoisonBubbles, IceCrystalBubbles } from '../../game/animations/particles';
import { Drink, Cauldron, BlackHole } from '../../game/entities/powerDown';
import { OxygenTank, HealthLive, Coin, RedPotion, BluePotion } from '../../game/entities/powerUp';
import { InkSplash } from '../../game/animations/ink';
import { TunnelVision } from '../../game/animations/tunnelVision';
import {
    Goblin, Sluggie, Skulnap, PoisonSpit,
    AngryBee, Bee, IceBall, Garry, Cactus, TheRock, Tauro,
} from '../../game/entities/enemies/enemies';
import {
    ElectricWheel, Elyvorg, Arrow, Barrier,
    InkBomb, PurpleFireball, MeteorAttack, PurpleSlash, PoisonDrop
} from '../../game/entities/enemies/elyvorg';
import {
    ElectricityCollision, PoisonSpitSplash, PoisonDropCollision,
    InkBombCollision, InkSplashCollision, ExplosionCollisionAnimation, PurpleFireballExplosion, CollisionAnimation,
    CollisionAnimation as MeteorExplosionCollision, Blood
} from '../../game/animations/collisionAnimation';
import { FloatingMessage } from '../../game/animations/floatingMessages';

global.document = {
    getElementById: jest.fn().mockReturnValue({ width: 1920, height: 689, id: 'stubImage' })
};

jest.mock('../../game/animations/playerStates', () => ({
    Sitting: jest.fn().mockImplementation(() => ({})),
    Running: jest.fn().mockImplementation(() => ({})),
    Jumping: jest.fn().mockImplementation(() => ({})),
    Falling: jest.fn().mockImplementation(() => ({})),
    Rolling: jest.fn().mockImplementation(() => ({})),
    Diving: jest.fn().mockImplementation(() => ({})),
    Stunned: jest.fn().mockImplementation(() => ({})),
    Hit: jest.fn().mockImplementation(() => ({})),
    Standing: jest.fn().mockImplementation(() => ({})),
    Dying: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../../game/animations/collisionAnimation', () => ({
    CollisionAnimation: jest.fn(),
    ExplosionCollisionAnimation: jest.fn(),
    PoisonSpitSplash: jest.fn(),
    InkSplashCollision: jest.fn(),
    Blood: jest.fn(),
    ElectricityCollision: jest.fn(),
    InkBombCollision: jest.fn(),
    RedFireballExplosion: jest.fn(),
    PurpleFireballExplosion: jest.fn(),
    PoisonDropCollision: jest.fn(),
    MeteorExplosionCollision: jest.fn(),
}));

jest.mock('../../game/entities/powerUp', () => ({
    HealthLive: jest.fn(), RedPotion: jest.fn(), BluePotion: jest.fn(),
    Coin: jest.fn(), OxygenTank: jest.fn(),
}));

jest.mock('../../game/entities/powerDown', () => ({
    BlackHole: jest.fn(), Cauldron: jest.fn(), Drink: jest.fn(),
}));

jest.mock('../../game/animations/floatingMessages', () => ({
    FloatingMessage: jest.fn(),
}));

jest.mock('../../game/animations/particles', () => ({
    Fireball: jest.fn(),
    CoinLoss: jest.fn(),
    PoisonBubbles: jest.fn(),
    IceCrystalBubbles: jest.fn(),
}));

jest.mock('../../game/entities/enemies/enemies', () => ({
    Goblin: jest.fn(),
    PoisonSpit: jest.fn(),
    PoisonDrop: jest.fn(),
    AngryBee: jest.fn(), Bee: jest.fn(), Skulnap: jest.fn(), Sluggie: jest.fn(),
    Voltzeel: jest.fn(), Tauro: jest.fn(), Aura: jest.fn(), KarateCroco: jest.fn(),
    SpearFish: jest.fn(), TheRock: jest.fn(), LilHornet: jest.fn(), Cactus: jest.fn(),
    IceBall: jest.fn(), Garry: jest.fn(), RockProjectile: jest.fn(),
    VolcanoWasp: jest.fn(), Volcanurtle: jest.fn(),
}));

jest.mock('../../game/animations/ink', () => ({ InkSplash: jest.fn() }));
jest.mock('../../game/animations/damageIndicator', () => ({ DamageIndicator: jest.fn() }));
jest.mock('../../game/animations/tunnelVision', () => ({ TunnelVision: jest.fn() }));
jest.mock('../../game/entities/enemies/elyvorg', () => ({
    Elyvorg: jest.fn(), Arrow: jest.fn(), Barrier: jest.fn(),
    ElectricWheel: jest.fn(), GravitationalAura: jest.fn(),
    InkBomb: jest.fn(), PurpleFireball: jest.fn(),
    PoisonDrop: jest.fn(), MeteorAttack: jest.fn(), PurpleSlash: jest.fn(),
}));

describe('Player', () => {
    let game, player;

    beforeEach(() => {
        game = {
            width: 1920,
            height: 689,
            groundMargin: 50,
            lives: 3,
            maxLives: 5,
            normalSpeed: 6,
            speed: 6,
            enemyInterval: 1000,
            input: {
                qOrLeftClick: jest.fn().mockReturnValue(false),
                eOrScrollClick: jest.fn().mockReturnValue(false),
                enterOrRightClick: jest.fn().mockReturnValue(false),
                keys: []
            },
            cabin: { isFullyVisible: false },
            debug: false,
            isElyvorgFullyVisible: false,
            elyvorgInFight: false,
            time: 0,
            maxTime: 10000,
            noDamageDuringTutorial: false,
            selectedDifficulty: 'Easy',
            mapSelected: [false, false, false, false],
            UI: { secondsLeftActivated: false },
            collisions: [],
            floatingMessages: [],
            behindPlayerParticles: [],
            enemies: [],
            powerUps: [],
            powerDowns: [],
            coins: 0,
            particles: [],
            audioHandler: {
                firedogSFX: { playSound: jest.fn(), stopSound: jest.fn() },
                explosionSFX: { playSound: jest.fn() },
                enemySFX: { playSound: jest.fn() },
                powerUpAndDownSFX: { playSound: jest.fn() }
            },
            gameOver: false,
            menu: {
                levelDifficulty: { setDifficulty: jest.fn() },
                skins: {
                    currentSkin: null,
                    defaultSkin: null,
                    hatSkin: null,
                    choloSkin: null,
                    zabkaSkin: null,
                    shinySkin: null
                }
            }
        };
        player = new Player(game);
        game.player = player;
        player.states = player.states.map(() => ({
            enter: jest.fn(),
            deathAnimation: false
        }));
        InkSplash.mockImplementation(() => ({
            getWidth: () => 10,
            getHeight: () => 10,
            x: 0, y: 0, width: 10, height: 10
        }));
    });

    test('constructs with expected defaults', () => {
        expect(player.width).toBe(100);
        expect(player.height).toBeCloseTo(91.3);
        expect(player.x).toBe(0);
        expect(player.y).toBe(game.height - player.height - game.groundMargin);
        expect(player.energy).toBe(100);
        expect(player.states).toHaveLength(10);
    });

    test('underwaterOrNot switches particle/splash images', () => {
        player.isUnderwater = true;
        player.underwaterOrNot();
        expect(player.particleImage).toBe('bubble');
        expect(player.splashImage).toBe('bubble');
        player.isUnderwater = false;
        player.underwaterOrNot();
        expect(player.particleImage).toBe('fire');
        expect(player.splashImage).toBe('fire');
    });

    test('firedogLivesLimit caps lives at maxLives', () => {
        game.lives = 99;
        player.firedogLivesLimit();
        expect(game.lives).toBe(game.maxLives);
    });

    test('isPoisonActiveChecker & isPoisonTimerChecker behavior', () => {
        player.energyReachedZero = true;
        player.isBluePotionActive = false;
        expect(player.isPoisonActiveChecker()).toBe(false);
        expect(player.poisonTimer).toBe(0);
        player.energyReachedZero = false;
        expect(player.isPoisonActiveChecker()).toBe(true);
        expect(player.isPoisonTimerChecker(2500)).toBe(2500);
    });

    test('drainEnergy reduces energy and flips energyReachedZero', () => {
        player.energy = 5;
        player.drainEnergy();
        expect(player.energy).toBeCloseTo(4.6);
        player.energy = 0.2;
        player.drainEnergy();
        expect(player.energy).toBe(0);
        expect(player.energyReachedZero).toBe(true);
    });

    test('divingAbility increments and clamps divingTimer', () => {
        player.divingTimer = 400;
        player.divingCooldown = 500;
        player.divingAbility(200);
        expect(player.divingTimer).toBe(500);
    });

    test('elyvorgCollisionTimers triggers only when in fight', () => {
        player.elyvorgCollisionTimer = 100;
        player.elyvorgCollisionCooldown = 300;
        game.elyvorgInFight = false;
        player.elyvorgCollisionTimers(50);
        expect(player.elyvorgCollisionTimer).toBe(100);
        game.elyvorgInFight = true;
        player.elyvorgCollisionTimers(250);
        expect(player.elyvorgCollisionTimer).toBe(300);
    });

    test('rollingOrDiving returns true for rolling/diving states', () => {
        player.currentState = player.states[4];
        expect(player.rollingOrDiving()).toBe(true);
        player.currentState = player.states[5];
        expect(player.rollingOrDiving()).toBe(true);
        player.currentState = player.states[1];
        expect(player.rollingOrDiving()).toBe(false);
    });

    test('spriteAnimation wraps frameX correctly', () => {
        player.maxFrame = 2;
        player.frameX = 1;
        player.frameInterval = 10;
        player.frameTimer = 11;
        player.spriteAnimation(0);
        expect(player.frameX).toBe(2);
        player.frameTimer = 11;
        player.spriteAnimation(0);
        expect(player.frameX).toBe(0);
    });

    test('onGround returns correct boolean', () => {
        player.y = game.height - player.height - game.groundMargin;
        expect(player.onGround()).toBe(true);
        player.y = 0;
        expect(player.onGround()).toBe(false);
    });

    test('updateCollisionCooldowns decrements and floors at zero', () => {
        player.collisionCooldowns = { e1: 100, e2: 50 };
        player.updateCollisionCooldowns(60);
        expect(player.collisionCooldowns.e1).toBe(40);
        expect(player.collisionCooldowns.e2).toBe(0);
    });

    test('setState updates states, calls enter, and sets speed', () => {
        const stub = { enter: jest.fn(), deathAnimation: false };
        player.states[2] = stub;
        game.isElyvorgFullyVisible = false;
        player.isBluePotionActive = false;
        player.setState(2, 3);
        expect(player.previousState).toBeNull();
        expect(player.currentState).toBe(stub);
        expect(stub.enter).toHaveBeenCalled();
        expect(game.speed).toBe(game.normalSpeed * 3);
    });

    test('setState sets speed=0 when elyvorg visible', () => {
        const stub = { enter: jest.fn(), deathAnimation: false };
        player.states[1] = stub;
        game.isElyvorgFullyVisible = true;
        player.setState(1, 5);
        expect(game.speed).toBe(0);
    });

    test('setState uses bluePotionSpeed when active and rolling', () => {
        const stub = { enter: jest.fn(), deathAnimation: false };
        player.states[4] = stub;
        player.isBluePotionActive = true;
        player.bluePotionSpeed = 20;
        game.isElyvorgFullyVisible = false;
        player.setState(4, 1);
        expect(game.speed).toBe(20);
    });

    test('energyLogic regenerates energy and resets energyTimer', () => {
        player.energy = 10;
        player.energyTimer = 100;
        player.energyInterval = 100;
        player.energyLogic(0);
        expect(player.energy).toBeGreaterThan(10);
        expect(player.energyTimer).toBe(0);
    });

    test('energyLogic poison drains and disables', () => {
        player.isPoisonedActive = true;
        player.poisonTimer = 100;
        player.energyReachedZero = false;
        player.energy = 50;
        player.energyInterval = 1000;
        player.energyTimer = 0;
        player.energyLogic(200);
        expect(player.poisonTimer).toBeLessThanOrEqual(0);
        expect(player.isPoisonedActive).toBe(false);
    });

    describe('fireballAbility', () => {
        beforeEach(() => {
            Fireball.mockClear();
            player.fireballTimer = player.fireballCooldown;
            player.currentState = player.states[0];
            game.cabin.isFullyVisible = false;
        });

        test('spawns one normal fireball and drains 8 energy', () => {
            game.input.qOrLeftClick.mockReturnValue(true);
            const e0 = player.energy;
            player.fireballAbility(game.input, 0);
            expect(Fireball).toHaveBeenCalledTimes(1);
            expect(player.energy).toBe(e0 - 8);
            expect(player.fireballTimer).toBe(0);
        });

        test('spawns 7 fireballs under red potion', () => {
            game.input.qOrLeftClick.mockReturnValue(true);
            player.isRedPotionActive = true;
            const e0 = player.energy;
            player.fireballAbility(game.input, 0);
            expect(Fireball).toHaveBeenCalledTimes(7);
            expect(player.energy).toBe(e0 - 8);
        });
    });

    describe('underwater fireball variants', () => {
        beforeEach(() => {
            Fireball.mockClear();
            player.fireballTimer = player.fireballCooldown;
            player.currentState = player.states[0];
            game.cabin.isFullyVisible = false;
            player.isUnderwater = true;
        });

        test('uses bubble_projectile when underwater', () => {
            game.input.qOrLeftClick.mockReturnValue(true);
            player.fireballAbility(game.input, 0);
            const call = Fireball.mock.calls[0];
            expect(call).toEqual(
                expect.arrayContaining([
                    game,
                    expect.any(Number),
                    expect.any(Number),
                    'bubble_projectile',
                    expect.any(String)
                ])
            );

        });

        test('spawns 7 bubble_redPotion when underwater + red potion', () => {
            player.isRedPotionActive = true;
            game.input.qOrLeftClick.mockReturnValue(true);
            player.fireballAbility(game.input, 0);
            const calls = Fireball.mock.calls.filter(c => c[3] === 'bubble_redPotion');
            expect(calls).toHaveLength(7);
        });
    });

    describe('invisibleAbility', () => {
        test('activation with E when timer full', () => {
            player.isInvisible = false;
            player.invisibleTimer = player.invisibleCooldown;
            game.input.eOrScrollClick.mockReturnValue(true);
            player.invisibleAbility(game.input, 0);
            expect(player.isInvisible).toBe(true);
            expect(game.audioHandler.firedogSFX.playSound)
                .toHaveBeenCalledWith('invisibleInSFX');
        });

        test('deactivation after active cooldown', () => {
            player.isInvisible = true;
            player.invisibleTimer = player.invisibleCooldown;
            player.invisibleAbility(game.input, 0);
            expect(player.invisibleActiveCooldownTimer).toBe(5000);
            player.invisibleAbility(game.input, 6000);
            expect(player.isInvisible).toBe(false);
            expect(game.audioHandler.firedogSFX.playSound)
                .toHaveBeenCalledWith('invisibleOutSFX');
        });
    });

    describe('playerVerticalMovement underwater thrust', () => {
        test('reduces buoyancy and moves up when rolling', () => {
            player.isUnderwater = true;
            player.currentState = player.states[4];
            player.buoyancy = 4;
            const initialY = player.y;
            game.input.keys = ['w'];
            game.input.enterOrRightClick.mockReturnValue(true);
            player.playerVerticalMovement(game.input.keys);
            expect(player.buoyancy).toBe(3);
            expect(player.y).toBe(initialY - 4);
        });
    });

    describe('playerSFXAudios', () => {
        test('starts and stops rolling sound appropriately', () => {
            player.currentState = player.states[4];
            player.isUnderwater = false;
            player.playerSFXAudios();
            expect(player.isRolling).toBe(true);
            expect(game.audioHandler.firedogSFX.playSound).toHaveBeenCalled();
            player.currentState = player.states[1];
            player.playerSFXAudios();
            expect(player.isRolling).toBe(false);
            expect(game.audioHandler.firedogSFX.stopSound).toHaveBeenCalledWith('rollingSFX');
        });

        test('plays running SFX at correct frames', () => {
            player.currentState = player.states[1];
            player.frameX = 3;
            player.playerSFXAudios();
            expect(game.audioHandler.firedogSFX.playSound).toHaveBeenCalledWith('runningSFX1');
            player.frameX = 6;
            player.playerSFXAudios();
            expect(game.audioHandler.firedogSFX.playSound).toHaveBeenCalledWith('runningSFX2');
        });

        test('plays gettingHit and triggers indicator once', () => {
            game.lives = 3;
            player.previousLives = 4;
            game.time = 2000;
            player.playerSFXAudios();
            expect(game.audioHandler.firedogSFX.playSound).toHaveBeenCalledWith('gettingHit', false, true);
        });

        test('plays energyReachedZeroSound only once', () => {
            player.energyReachedZero = true;
            player.noEnergyLeftSound = false;
            player.playerSFXAudios();
            expect(game.audioHandler.firedogSFX.playSound).toHaveBeenCalledWith('energyReachedZeroSound');
            player.playerSFXAudios();
            expect(game.audioHandler.firedogSFX.playSound).toHaveBeenCalledTimes(1);
        });
    });

    describe('playerHorizontalMovement', () => {
        test('pressing "d" sets speed to maxSpeed', () => {
            player.currentState = player.states[1];
            player.playerHorizontalMovement(['d']);
            expect(player.speed).toBe(player.maxSpeed);
        });

        test('pressing "a" sets speed negative', () => {
            player.currentState = player.states[1];
            player.playerHorizontalMovement(['a']);
            expect(player.speed).toBeCloseTo(-player.maxSpeed * 1.3);
        });

        test('clamps x within bounds', () => {
            player.x = -5;
            player.playerHorizontalMovement([]);
            expect(player.x).toBe(0);
            player.x = 1000;
            player.playerHorizontalMovement([]);
            expect(player.x).toBe(1000);
        });
    });

    describe('playerVerticalMovement', () => {
        test('applies gravity when airborne', () => {
            player.y = 0;
            player.vy = 0;
            player.playerVerticalMovement([]);
            expect(player.vy).toBe(player.weight);
            expect(player.y).toBe(0);
        });

        test('does not sink below ground', () => {
            player.y = game.height + 100;
            player.playerVerticalMovement([]);
            expect(player.y).toBe(game.height - player.height - game.groundMargin);
        });
    });

    describe('collisionWithPowers', () => {
        beforeEach(() => {
            player.x = 0; player.y = 0;
            player.width = 10; player.height = 10;
            game.gameOver = false;
        });

        test('Drink slows player', () => {
            const d = new Drink();
            Object.assign(d, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [d];
            player.collisionWithPowers(0);
            expect(player.isSlowed).toBe(true);
        });

        test('cannot pick up Drink when invisible', () => {
            player.isInvisible = true;
            const d = new Drink();
            Object.assign(d, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [d];
            player.collisionWithPowers(0);
            expect(player.isSlowed).toBe(false);
        });

        test('Cauldron poisons player', () => {
            const c = new Cauldron();
            Object.assign(c, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [c];
            player.collisionWithPowers(0);
            expect(player.isPoisonedActive).toBe(true);
        });

        test('BlackHole triggers tunnel vision', () => {
            const b = new BlackHole();
            Object.assign(b, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [b];
            jest.spyOn(player, 'triggerTunnelVision');
            player.collisionWithPowers(0);
            expect(player.isBlackHoleActive).toBe(true);
            expect(player.triggerTunnelVision).toHaveBeenCalled();
        });

        test('OxygenTank reduces time', () => {
            game.time = 50000;
            const o = new OxygenTank();
            Object.assign(o, { x: 0, y: 0, width: 10, height: 10 });
            game.powerUps = [o];
            player.collisionWithPowers(0);
            expect(game.time).toBe(40000);
        });

        test('HealthLive increments lives', () => {
            game.lives = 1;
            const h = new HealthLive();
            Object.assign(h, { x: 0, y: 0, width: 10, height: 10 });
            game.powerUps = [h];
            player.collisionWithPowers(0);
            expect(game.lives).toBe(2);
        });

        test('Coin increases coins', () => {
            game.coins = 0;
            const c = new Coin();
            Object.assign(c, { x: 0, y: 0, width: 10, height: 10 });
            game.powerUps = [c];
            player.collisionWithPowers(0);
            expect(game.coins).toBe(10);
        });

        test('RedPotion activates red state', () => {
            const rp = new RedPotion();
            Object.assign(rp, { x: 0, y: 0, width: 10, height: 10 });
            game.powerUps = [rp];
            player.collisionWithPowers(0);
            expect(player.isRedPotionActive).toBe(true);
        });

        test('BluePotion activates blue state', () => {
            const bp = new BluePotion();
            Object.assign(bp, { x: 0, y: 0, width: 10, height: 10 });
            game.powerUps = [bp];
            player.collisionWithPowers(0);
            expect(player.isBluePotionActive).toBe(true);
        });
    });

    describe('hit & stunned', () => {
        beforeEach(() => {
            player.states[7] = { enter: jest.fn(), deathAnimation: false };
            player.states[6] = { enter: jest.fn(), deathAnimation: false };
        });

        test('hit reduces lives & coins and switches to Hit state', () => {
            game.coins = 5; game.lives = 3;
            player.currentState = player.states[0];
            player.hit({});
            expect(game.lives).toBe(2);
            expect(game.coins).toBe(4);
            expect(player.currentState).toBe(player.states[7]);
        });

        test('stunned reduces lives & coins and switches to Stunned state', () => {
            game.coins = 5; game.lives = 3;
            player.stunned({});
            expect(game.lives).toBe(2);
            expect(game.coins).toBe(4);
            expect(player.currentState).toBe(player.states[6]);
        });
    });

    test('red potion expires after duration', () => {
        player.isRedPotionActive = true;
        player.redPotionTimer = 1000;
        player.fireballAbility(game.input, 1000);
        expect(player.isRedPotionActive).toBe(false);
    });

    test('blue‑potion timer expiry resets state and images', () => {
        player.isBluePotionActive = true;
        player.blueFireTimer = 1000;
        player.particleImage = 'bluefire';
        player.splashImage = 'bluebubble';
        player.collisionWithPowers(1000);
        expect(player.isBluePotionActive).toBe(false);
        expect(player.particleImage).toBe('fire');
        expect(player.splashImage).toBe('fire');
    });

    test('energyLogic flips energyReachedZero off once energy ≥ 20', () => {
        player.energyReachedZero = true;
        player.noEnergyLeftSound = true;
        player.energy = 20;
        player.energyTimer = player.energyInterval;
        player.energyLogic(0);
        expect(player.energyReachedZero).toBe(false);
        expect(player.noEnergyLeftSound).toBe(false);
    });

    test('spriteAnimation does not advance when frameTimer < frameInterval', () => {
        player.maxFrame = 5;
        player.frameX = 3;
        player.frameInterval = 100;
        player.frameTimer = 50;
        player.spriteAnimation(50);
        expect(player.frameX).toBe(3);
    });

    test('update skips input-driven subsystems when deathAnimation is true', () => {
        const stubState = { deathAnimation: true, handleInput: jest.fn() };
        player.currentState = stubState;

        const notCalled = [
            jest.spyOn(player, 'playerSFXAudios'),
            jest.spyOn(stubState, 'handleInput'),
            jest.spyOn(player, 'underwaterGravityAndIndicator'),
            jest.spyOn(player, 'spriteAnimation'),
            jest.spyOn(player, 'playerHorizontalMovement'),
            jest.spyOn(player, 'playerVerticalMovement'),
            jest.spyOn(player, 'collisionWithEnemies'),
            jest.spyOn(player, 'collisionWithPowers'),
            jest.spyOn(player, 'firedogMeetsElyvorg'),
        ];

        const slowedSpy = jest.spyOn(player, 'checkIfFiredogIsSlowed');

        player.update([], 16);

        notCalled.forEach(spy => expect(spy).not.toHaveBeenCalled());
        expect(slowedSpy).toHaveBeenCalledWith(16);
    });

    test('collisionWithPowers flags powerUps and powerDowns for deletion', () => {
        player.x = 0;
        player.y = 0;
        player.width = 10;
        player.height = 10;

        // powerDowns
        const pdClasses = [Drink, Cauldron, BlackHole];
        pdClasses.forEach(Ctor => {
            const item = new Ctor();
            Object.assign(item, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [item];
            game.powerUps = [];
            player.isInvisible = false;
            player.collisionWithPowers(0);
            expect(item.markedForDeletion).toBe(true);
        });

        // powerUps
        const puClasses = [OxygenTank, HealthLive, Coin, RedPotion, BluePotion];
        puClasses.forEach(Ctor => {
            const item = new Ctor();
            Object.assign(item, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [];
            game.powerUps = [item];
            player.collisionWithPowers(0);
            expect(item.markedForDeletion).toBe(true);
        });
    });

    test('elyvorgCollisionTimers does not advance when elyvorgInFight is false', () => {
        game.elyvorgInFight = false;
        player.elyvorgCollisionTimer = 100;
        player.elyvorgCollisionTimers(500);
        expect(player.elyvorgCollisionTimer).toBe(100);
    });

    test('underwaterOrNot remains stable when called repeatedly', () => {
        player.isUnderwater = true;
        player.particleImage = player.splashImage = '';
        player.underwaterOrNot();
        expect(player.particleImage).toBe('bubble');
        expect(player.splashImage).toBe('bubble');
        player.underwaterOrNot();
        expect(player.particleImage).toBe('bubble');
        expect(player.splashImage).toBe('bubble');

        player.isUnderwater = false;
        player.underwaterOrNot();
        expect(player.particleImage).toBe('fire');
        expect(player.splashImage).toBe('fire');
        player.underwaterOrNot();
        expect(player.particleImage).toBe('fire');
        expect(player.splashImage).toBe('fire');
    });

    test('checkIfFiredogIsDead sets gameOver when lives ≤ 0', () => {
        game.lives = 0;
        player.currentState = { deathAnimation: false };
        player.checkIfFiredogIsDead();
        expect(game.gameOver).toBe(true);
    });

    test('checkIfFiredogIsDead resets difficulty during tutorial', () => {
        game.lives = 0;
        game.noDamageDuringTutorial = true;
        player.currentState = { deathAnimation: false };
        player.checkIfFiredogIsDead();
        expect(game.menu.levelDifficulty.setDifficulty)
            .toHaveBeenCalledWith(game.selectedDifficulty);
    });

    describe('collisionWithEnemies', () => {
        test('collisionWithEnemies handles normal collision when overlapping vertically', () => {
            const enemy = {
                id: 'e1',
                x: player.x,
                y: player.y,
                width: player.width,
                height: player.height,
                lives: 3
            };
            game.enemies = [enemy];
            player.currentState = player.states[8];
            player.isInvisible = false;
            player.collisionCooldowns = {};

            player.collisionWithEnemies(0);

            expect(player.collisionCooldowns.e1).toBeGreaterThan(0);
            expect(enemy.lives).toBe(2);
        });

        test('collisionWithEnemies handles fireball collision', () => {
            const enemy = { id: 'e2', x: 0, y: 0, width: 10, height: 10, lives: 2 };
            game.enemies = [enemy];
            const fb = new Fireball();
            fb.x = 5; fb.y = 5; fb.size = 10; fb.type = 'normalMode'; fb.markedForDeletion = false;
            game.behindPlayerParticles = [fb];
            player.currentState = player.states[8];
            player.isInvisible = false;

            player.collisionWithEnemies(0);

            expect(fb.markedForDeletion).toBe(true);
            expect(enemy.lives).toBe(1);
            expect(game.collisions.length).toBeGreaterThan(0);
        });
    });

    test('triggerInkSplash adds InkSplash collision when visible', () => {
        player.isInvisible = false;
        player.triggerInkSplash();
        expect(InkSplash).toHaveBeenCalled();
        expect(game.collisions.length).toBe(1);
    });

    test('triggerTunnelVision adds only one TunnelVision', () => {
        player.triggerTunnelVision();
        expect(TunnelVision).toHaveBeenCalled();
        expect(game.collisions.length).toBe(1);
        player.triggerTunnelVision();
        expect(game.collisions.length).toBe(1);
    });

    test('checkIfFiredogIsSlowed drains timer and restores speed after two calls', () => {
        player.isSlowed = true;
        player.slowedTimer = 100;
        player.normalSpeed = 4;
        player.maxSpeed = 6;

        player.checkIfFiredogIsSlowed(150);
        expect(player.slowedTimer).toBeLessThanOrEqual(0);
        expect(player.isSlowed).toBe(true);
        expect(player.normalSpeed).toBe(4);
        expect(player.maxSpeed).toBe(6);

        player.checkIfFiredogIsSlowed(0);
        expect(player.slowedTimer).toBe(0);
        expect(player.isSlowed).toBe(false);
        expect(player.normalSpeed).toBe(6);
        expect(player.maxSpeed).toBe(10);
    });

    describe('collisionAnimationFollowsEnemy', () => {
        test('ElectricityCollision follows or sticks based on overlap', () => {
            const enemy = new ElectricWheel();
            enemy.x = player.x;
            enemy.y = player.y;
            enemy.width = 10;
            enemy.height = 10;
            game.enemies = [enemy];

            const ec = new ElectricityCollision(game, enemy.x, enemy.y);
            ec.width = 1;
            ec.height = 1;
            ec.updatePositionWhereCollisionHappened = jest.fn();
            ec.updatePosition = jest.fn();
            game.collisions = [ec];

            // overlap → sticks
            ec.x = player.x;
            ec.y = player.y;
            player.collisionAnimationFollowsEnemy(enemy);
            expect(ec.updatePositionWhereCollisionHappened).toHaveBeenCalled();

            // no overlap → follows
            ec.x = player.x + 999;
            player.collisionAnimationFollowsEnemy(enemy);
            expect(ec.updatePosition).toHaveBeenCalledWith(enemy);
        });
    });

    describe('draw() and drawPlayerWithCurrentSkin()', () => {
        let ctx;
        beforeEach(() => {
            ctx = {
                save: jest.fn(),
                translate: jest.fn(),
                scale: jest.fn(),
                drawImage: jest.fn(),
                restore: jest.fn(),
                strokeRect: jest.fn(),
            };
        });

        test('draw flips horizontally when facingLeft', () => {
            game.gameOver = false;
            game.debug = true;
            game.isElyvorgFullyVisible = true;
            player.facingRight = false;
            player.facingLeft = true;
            player.states[8].enter = jest.fn();
            player.currentState = player.states[8];
            player.draw(ctx);
            expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
            expect(ctx.strokeRect).toHaveBeenCalledWith(player.x, player.y, player.width, player.height);
        });

        test('draw uses correct skin image', () => {
            game.menu.skins.currentSkin = game.menu.skins.hatSkin;
            player.frameX = 0;
            player.frameY = 0;
            player.maxFrame = 0;
            player.drawPlayerWithCurrentSkin(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                player.hatImage,
                0, 0, player.width, player.height,
                -player.width / 2, -player.height / 2, player.width, player.height
            );
        });
    });

    describe('firedogMeetsElyvorg integration', () => {
        beforeEach(() => {
            game.isElyvorgFullyVisible = true;
            const e = new Elyvorg();
            e.x = player.x + 200;
            e.width = 50;
            game.enemies = [e];
        });

        test('rolling toward Elyvorg moves player', () => {
            player.currentState = player.states[4];
            player.facingRight = true;
            player.x = 50;
            player.firedogMeetsElyvorg(['d']);
            expect(player.x).toBe(56);
        });

        test('talkToElyvorg runs then stands', done => {
            game.talkToElyvorg = true;
            player.x = 10;
            player.setToRunOnce = player.setToStandingOnce = true;
            player.states[1].enter = jest.fn();
            player.states[8].enter = jest.fn();

            player.firedogMeetsElyvorg(['']);
            expect(player.states[1].enter).toHaveBeenCalled();

            player.x = 0;
            player.firedogMeetsElyvorg(['']);

            setTimeout(() => {
                expect(player.states[8].enter).toHaveBeenCalled();
                done();
            }, 20);
        });
    });

    describe('CollisionLogic.handleNormalCollision branches', () => {
        let logic;

        beforeEach(() => {
            logic = new CollisionLogic(game, player);
            jest.spyOn(player, 'hit');
            jest.spyOn(player, 'bloodOrPoof');
            jest.spyOn(player, 'stunned');
            jest.spyOn(player, 'triggerInkSplash');
            jest.spyOn(player, 'collisionAnimationBasedOnEnemy');
        });

        test('default case hits and blood/poof when visible', () => {
            const dummy = { x: 0, y: 0, width: 10, height: 10, lives: 1 };
            player.isInvisible = false;
            logic.handleNormalCollision(dummy);
            expect(player.hit).toHaveBeenCalledWith(dummy);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(dummy);
        });

        test('Goblin steals between 10 and 20 coins and shows particles', () => {
            game.coins = 30;
            const gob = new Goblin();
            gob.lives = 1; gob.x = 0; gob.y = 0; gob.width = 10; gob.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(gob);
            expect(game.coins).toBeLessThan(30);
            expect(game.coins).toBeGreaterThanOrEqual(10);
            expect(CoinLoss).toHaveBeenCalled();
            expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('goblinStealing', false, true);
        });

        test('Sluggie triggers ink splash and collision animation', () => {
            const s = new Sluggie();
            s.x = 0; s.y = 0; s.width = 10; s.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(s);
            expect(player.triggerInkSplash).toHaveBeenCalled();
            expect(player.collisionAnimationBasedOnEnemy).toHaveBeenCalledWith(s);
        });

        test('InkBomb triggers ink splash and InkBombCollision', () => {
            const ib = new InkBomb();
            ib.x = 0; ib.y = 0; ib.width = 10; ib.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(ib);
            expect(player.triggerInkSplash).toHaveBeenCalled();
            expect(player.collisionAnimationBasedOnEnemy).toHaveBeenCalledWith(ib);
            expect(InkBombCollision).toHaveBeenCalled();
        });

        test('Garry triggers ink splash and InkSplashCollision', () => {
            const g = new Garry();
            g.x = 0; g.y = 0; g.width = 10; g.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(g);
            expect(player.triggerInkSplash).toHaveBeenCalled();
            expect(InkSplashCollision).toHaveBeenCalled();
        });

        test('Skulnap stuns and plays ExplosionCollisionAnimation', () => {
            const sk = new Skulnap();
            sk.x = 0; sk.y = 0; sk.width = 10; sk.height = 10;
            logic.handleNormalCollision(sk);
            expect(player.stunned).toHaveBeenCalledWith(sk);
            expect(ExplosionCollisionAnimation).toHaveBeenCalled();
        });

        test('stun enemies only call stunned', () => {
            const b = new Cactus();
            b.x = 0; b.y = 0; b.width = 10; b.height = 10;
            logic.handleNormalCollision(b);
            expect(player.stunned).toHaveBeenCalledWith(b);
        });

        test('ElectricWheel zeroes lives, stuns, and plays ElectricityCollision', () => {
            const ew = new ElectricWheel();
            ew.lives = 2; ew.x = 0; ew.y = 0; ew.width = 10; ew.height = 10; ew.isBarrierActive = false;
            logic.handleNormalCollision(ew);
            expect(player.stunned).toHaveBeenCalledWith(ew);
            expect(ew.lives).toBe(0);
            expect(ElectricityCollision).toHaveBeenCalled();
            expect(player.resetElectricWheelCounters).toBe(true);
            expect(player.elyvorgCollisionTimer).toBe(0);
        });

        test('PoisonSpit activates poison and plays PoisonSpitSplash', () => {
            const ps = new PoisonSpit();
            ps.x = 0; ps.y = 0; ps.width = 10; ps.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(ps);
            expect(player.isPoisonedActive).toBe(true);
            expect(PoisonSpitSplash).toHaveBeenCalled();
        });

        test('PoisonDrop activates poison and plays PoisonDropCollision', () => {
            const pd = new PoisonDrop();
            pd.x = 0; pd.y = 0; pd.width = 10; pd.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(pd);
            expect(player.isPoisonedActive).toBe(true);
            expect(PoisonDropCollision).toHaveBeenCalled();
        });

        test('red enemies hit and blood/poof', () => {
            const red = new TheRock();
            red.x = 0; red.y = 0; red.width = 10; red.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(red);
            expect(player.hit).toHaveBeenCalledWith(red);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(red);
        });

        test('IceBall slows and plays frozenSound', () => {
            const ice = new IceBall();
            ice.x = 0; ice.y = 0; ice.width = 10; ice.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(ice);
            expect(player.isSlowed).toBe(true);
            expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('frozenSound', false, true);
        });

        test('Elyvorg only hits after cooldown and barrier inactive', () => {
            const boss = new Elyvorg();
            boss.isBarrierActive = false;
            boss.x = 0; boss.y = 0; boss.width = 10; boss.height = 10;
            player.elyvorgCollisionTimer = player.elyvorgCollisionCooldown;
            logic.handleNormalCollision(boss);
            expect(player.hit).toHaveBeenCalledWith(boss);
        });

        test('Barrier resets timer and hits when allowed', () => {
            const bar = new Barrier();
            bar.x = 0; bar.y = 0; bar.width = 10; bar.height = 10;
            player.elyvorgCollisionTimer = 1000;
            player.currentState = player.states[0];
            logic.handleNormalCollision(bar);
            expect(player.elyvorgCollisionTimer).toBe(0);
            expect(player.hit).toHaveBeenCalledWith(bar);
        });

        test('PurpleSlash resets timer and hits', () => {
            const ps = new PurpleSlash();
            ps.x = 0; ps.y = 0; ps.width = 10; ps.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(ps);
            expect(player.elyvorgCollisionTimer).toBe(0);
            expect(player.hit).toHaveBeenCalledWith(ps);
        });

        test('PurpleFireball hits and plays PurpleFireballExplosion', () => {
            const pf = new PurpleFireball();
            pf.x = 0; pf.y = 0; pf.width = 10; pf.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(pf);
            expect(player.hit).toHaveBeenCalledWith(pf);
            expect(MeteorExplosionCollision).toHaveBeenCalled();
        });

        test('MeteorAttack hits and plays MeteorExplosionCollision', () => {
            const ma = new MeteorAttack();
            ma.x = 0; ma.y = 0; ma.width = 10; ma.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(ma);
            expect(player.hit).toHaveBeenCalledWith(ma);
            expect(MeteorExplosionCollision).toHaveBeenCalled();
        });

        test('Arrow blue slows and blood/poof', () => {
            const arr = new Arrow();
            arr.image = { id: 'blueArrow' };
            arr.x = 0; arr.y = 0; arr.width = 10; arr.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(arr);
            expect(player.isSlowed).toBe(true);
            expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('frozenSound', false, true);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(arr);
        });

        test('Arrow yellow stuns', () => {
            const arr = new Arrow();
            arr.image = { id: 'yellowArrow' };
            arr.x = 0; arr.y = 0; arr.width = 10; arr.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(arr);
            expect(player.stunned).toHaveBeenCalledWith(arr);
        });

        test('Arrow green poisons and plays acidSoundEffect', () => {
            const arr = new Arrow();
            arr.image = { id: 'greenArrow' };
            arr.x = 0; arr.y = 0; arr.width = 10; arr.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(arr);
            expect(player.isPoisonedActive).toBe(true);
            expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('acidSoundEffect', false, true);
        });
    });

    describe('CollisionLogic.handleRollingOrDivingCollision branches', () => {
        let logic;

        beforeEach(() => {
            logic = new CollisionLogic(game, player);
            player.currentState = player.states[4]; // rolling
            jest.spyOn(player, 'hit');
            jest.spyOn(player, 'bloodOrPoof');
            jest.spyOn(player, 'stunned');
            jest.spyOn(player, 'triggerInkSplash');
            jest.spyOn(player, 'collisionAnimationBasedOnEnemy');
        });

        test('default case only blood/poof', () => {
            const dummy = { x: 0, y: 0, width: 10, height: 10 };
            logic.handleRollingOrDivingCollision(dummy);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(dummy);
        });

        test('Goblin dies immediately and blood/poof', () => {
            const gob = new Goblin();
            gob.lives = 1; gob.x = 0; gob.y = 0; gob.width = 10; gob.height = 10;
            logic.handleRollingOrDivingCollision(gob);
            expect(gob.lives).toBe(0);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(gob);
        });

        test('Sluggie triggers ink splash and collision animation', () => {
            const s = new Sluggie();
            s.x = 0; s.y = 0; s.width = 10; s.height = 10;
            logic.handleRollingOrDivingCollision(s);
            expect(player.triggerInkSplash).toHaveBeenCalled();
            expect(player.collisionAnimationBasedOnEnemy).toHaveBeenCalledWith(s);
        });

        test('Skulnap stuns and plays ExplosionCollisionAnimation', () => {
            const sk = new Skulnap();
            sk.x = 0; sk.y = 0; sk.width = 10; sk.height = 10;
            logic.handleRollingOrDivingCollision(sk);
            expect(player.stunned).toHaveBeenCalledWith(sk);
            expect(ExplosionCollisionAnimation).toHaveBeenCalled();
        });

        test('stun bee when invisible also blood/poof', () => {
            const b = new Bee();
            b.x = 0; b.y = 0; b.width = 10; b.height = 10;
            player.isInvisible = true;
            logic.handleRollingOrDivingCollision(b);
            expect(player.stunned).toHaveBeenCalledWith(b);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(b);
        });

        test('stun angrybee when invisible also blood/poof', () => {
            const b = new AngryBee();
            b.x = 0; b.y = 0; b.width = 10; b.height = 10;
            player.isInvisible = true;
            logic.handleRollingOrDivingCollision(b);
            expect(player.stunned).toHaveBeenCalledWith(b);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(b);
        });

        test('ElectricWheel dies, stuns, and resets counters', () => {
            const ew = new ElectricWheel();
            ew.lives = 2; ew.x = 0; ew.y = 0; ew.width = 10; ew.height = 10;
            logic.handleRollingOrDivingCollision(ew);
            expect(ew.lives).toBe(0);
            expect(player.stunned).toHaveBeenCalledWith(ew);
            expect(player.resetElectricWheelCounters).toBe(true);
            expect(player.elyvorgCollisionTimer).toBe(0);
        });

        test('PoisonDrop poisons and plays PoisonDropCollision', () => {
            const pd = new PoisonDrop();
            pd.x = 0; pd.y = 0; pd.width = 10; pd.height = 10;
            player.isInvisible = false;
            logic.handleRollingOrDivingCollision(pd);
            expect(player.isPoisonedActive).toBe(true);
            expect(PoisonDropCollision).toHaveBeenCalled();
        });

        test('red enemy in rolling hits and blood/poof', () => {
            const red = new Tauro();
            red.x = 0; red.y = 0; red.width = 10; red.height = 10;
            logic.handleRollingOrDivingCollision(red);
            expect(player.hit).toHaveBeenCalledWith(red);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(red);
        });

        test('IceBall slows and blood/poof', () => {
            const ice = new IceBall();
            ice.x = 0; ice.y = 0; ice.width = 10; ice.height = 10;
            player.isInvisible = false;
            logic.handleRollingOrDivingCollision(ice);
            expect(player.isSlowed).toBe(true);
            expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('frozenSound', false, true);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(ice);
        });

        test('Elyvorg in rolling damages boss and blood/poof', () => {
            const boss = new Elyvorg();
            boss.isBarrierActive = false;
            boss.lives = 3; boss.x = 0; boss.y = 0; boss.width = 10; boss.height = 10;
            player.elyvorgCollisionTimer = player.elyvorgCollisionCooldown;
            logic.handleRollingOrDivingCollision(boss);
            expect(boss.lives).toBe(2);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(boss);
        });

        test('Barrier in rolling resets timer only', () => {
            const bar = new Barrier();
            bar.x = 0; bar.y = 0; bar.width = 10; bar.height = 10;
            player.elyvorgCollisionTimer = 123;
            logic.handleRollingOrDivingCollision(bar);
            expect(player.elyvorgCollisionTimer).toBe(0);
        });

        test('PurpleSlash in rolling hits only', () => {
            const ps = new PurpleSlash();
            ps.x = 0; ps.y = 0; ps.width = 10; ps.height = 10;
            player.isInvisible = false;
            logic.handleRollingOrDivingCollision(ps);
            expect(player.hit).toHaveBeenCalledWith(ps);
        });

        test('PurpleFireball in rolling hits and plays PurpleFireballExplosion', () => {
            const pf = new PurpleFireball();
            pf.x = 0; pf.y = 0; pf.width = 10; pf.height = 10;
            logic.handleRollingOrDivingCollision(pf);
            expect(player.hit).toHaveBeenCalledWith(pf);
            expect(MeteorExplosionCollision).toHaveBeenCalled();
        });

        test('MeteorAttack in rolling only collision animation', () => {
            const ma = new MeteorAttack();
            ma.x = 0; ma.y = 0; ma.width = 10; ma.height = 10;
            logic.handleRollingOrDivingCollision(ma);
            expect(player.collisionAnimationBasedOnEnemy).toHaveBeenCalledWith(ma);
        });

        test('Arrow blue in rolling slows and blood/poof', () => {
            const arr = new Arrow();
            arr.image = { id: 'blueArrow' };
            arr.x = 0; arr.y = 0; arr.width = 10; arr.height = 10;
            player.isInvisible = false;
            logic.handleRollingOrDivingCollision(arr);
            expect(player.isSlowed).toBe(true);
            expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('frozenSound', false, true);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(arr);
        });

        test('Arrow yellow in rolling dies arrow when invisible', () => {
            const arr = new Arrow();
            arr.image = { id: 'yellowArrow' };
            arr.lives = 2; arr.x = 0; arr.y = 0; arr.width = 10; arr.height = 10;
            player.isInvisible = true;
            logic.handleRollingOrDivingCollision(arr);
            expect(arr.lives).toBe(1);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(arr);
        });

        test('Arrow green in rolling poisons and blood/poof', () => {
            const arr = new Arrow();
            arr.image = { id: 'greenArrow' };
            arr.x = 0; arr.y = 0; arr.width = 10; arr.height = 10;
            player.isInvisible = false;
            logic.handleRollingOrDivingCollision(arr);
            expect(player.isPoisonedActive).toBe(true);
            expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('acidSoundEffect', false, true);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(arr);
        });
    });

    describe('collisionAnimationBasedOnEnemy direct', () => {
        test('InkBomb triggers InkBombCollision', () => {
            const ib = new InkBomb();
            ib.x = 0; ib.y = 0; ib.width = 10; ib.height = 10;
            player.collisionAnimationBasedOnEnemy(ib);
            expect(InkBombCollision).toHaveBeenCalled();
        });

        test('MeteorAttack triggers MeteorExplosionCollision', () => {
            const ma = new MeteorAttack();
            ma.x = 0; ma.y = 0; ma.width = 10; ma.height = 10;
            player.collisionAnimationBasedOnEnemy(ma);
            expect(MeteorExplosionCollision).toHaveBeenCalled();
        });
    });

    describe('energyLogic blue‐potion branch', () => {
        test('blue potion slows enemy interval & regen', () => {
            player.isBluePotionActive = true;
            player.currentState = player.states[4];
            game.enemyInterval = 1000;
            player.energy = 50; player.energyTimer = 0;
            player.energyLogic(100);
            expect(game.enemyInterval).toBe(100);
            expect(player.energy).toBeGreaterThan(50);
        });
    });

    describe('underwaterGravityAndIndicator', () => {
        test('in water triggers one damage indicator when secondsLeftActivated', () => {
            player.isUnderwater = true;
            game.UI.secondsLeftActivated = true;
            game.time = 2000;
            jest.spyOn(player, 'triggerDamageIndicator');
            player.underwaterGravityAndIndicator();
            expect(player.triggerDamageIndicator).toHaveBeenCalled();
        });
    });

    describe('draw()', () => {
        let ctx;
        beforeEach(() => {
            ctx = { save: jest.fn(), translate: jest.fn(), scale: jest.fn(), drawImage: jest.fn(), restore: jest.fn(), strokeRect: jest.fn() };
        });
        test('uses gameOver branch scaling', () => {
            game.gameOver = true;
            player.facingLeft = true;
            player.facingRight = false;
            player.draw(ctx);
            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.translate).toHaveBeenCalled();
            expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
            expect(ctx.restore).toHaveBeenCalled();
        });
    });

    describe('drawPlayerWithCurrentSkin()', () => {
        let ctx;
        beforeEach(() => {
            ctx = { drawImage: jest.fn(), globalAlpha: 1 };
        });
        it.each([
            ['defaultSkin', 'image'],
            ['choloSkin', 'choloImage'],
            ['zabkaSkin', 'zabkaImage'],
            ['shinySkin', 'shinyImage'],
        ])('draws %s correctly', (key, prop) => {
            game.menu.skins.currentSkin = game.menu.skins[key];
            player.frameX = 1; player.frameY = 2;
            player.drawPlayerWithCurrentSkin(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                player[prop],
                player.frameX * player.width, player.frameY * player.height,
                player.width, player.height,
                -player.width / 2, -player.height / 2, player.width, player.height
            );
        });
    });

    describe('fireballAbility cabin visibility', () => {
        beforeEach(() => {
            Fireball.mockClear();
            player.fireballTimer = player.fireballCooldown;
            player.currentState = player.states[1];
        });
        test('does not spawn when cabin is fully visible', () => {
            game.input.qOrLeftClick.mockReturnValue(true);
            game.cabin.isFullyVisible = true;
            player.fireballAbility(game.input, 0);
            expect(Fireball).not.toHaveBeenCalled();
        });
    });

    describe('handleFireballCollisionWithEnemy special cases', () => {
        beforeEach(() => {
            game.behindPlayerParticles = [];
            game.collisions = [];
        });
        const cases = [
            { Ctor: PurpleFireball, anim: PurpleFireballExplosion, key: 'PurpleFireball' },
            { Ctor: MeteorAttack, anim: MeteorExplosionCollision, key: 'MeteorAttack' },
            { Ctor: PoisonDrop, anim: PoisonDropCollision, key: 'PoisonDrop' },
            { Ctor: ElectricWheel, anim: ElectricityCollision, key: 'ElectricWheel' },
            { Ctor: Goblin, anim: CollisionAnimation, key: 'Goblin' },
            { Ctor: PoisonSpit, anim: PoisonSpitSplash, key: 'PoisonSpit' },
        ];
        cases.forEach(({ Ctor, anim, key }) => {
            test(`${key} fireball collision triggers ${anim.name}`, () => {
                const enemy = new Ctor();
                enemy.x = 0; enemy.y = 0; enemy.width = 10; enemy.height = 10; enemy.lives = 2;
                game.enemies = [enemy];
                const fb = new Fireball();
                fb.x = 5; fb.y = 5; fb.size = 10; fb.type = 'normalMode'; fb.markedForDeletion = false;
                game.behindPlayerParticles = [fb];
                player.currentState = player.states[1];
                player.collisionWithEnemies(0);
                expect(anim).toHaveBeenCalled();
            });
        });
    });

    describe('collisionAnimationBasedOnEnemy all branches', () => {
        it.each([
            [Sluggie, InkSplashCollision],
            [Garry, InkSplashCollision],
            [InkBomb, InkBombCollision],
            [Skulnap, ExplosionCollisionAnimation],
            [ElectricWheel, ElectricityCollision],
            [PoisonSpit, PoisonSpitSplash],
            [PoisonDrop, PoisonDropCollision],
            [PurpleFireball, PurpleFireballExplosion],
            [MeteorAttack, MeteorExplosionCollision],
        ])('enemy %p pushes %p', (EnemyCtor, anim) => {
            const e = new EnemyCtor();
            e.x = 0; e.y = 0; e.width = 10; e.height = 10;
            player.collisionAnimationBasedOnEnemy(e);
            expect(anim).toHaveBeenCalled();
        });
    });

    describe('bluePotion powerUp effects', () => {
        test('collisionWithPowers flips to fire visuals and plays SFX when not underwater', () => {
            const bp = new BluePotion();
            Object.assign(bp, { x: player.x, y: player.y, width: 10, height: 10 });
            game.powerUps = [bp];
            jest.spyOn(game.audioHandler.powerUpAndDownSFX, 'playSound');
            player.isUnderwater = false;
            player.currentState = player.states[4];
            player.collisionWithPowers(0);
            expect(player.particleImage).toBe('bluefire');
            expect(player.splashImage).toBe('bluefire');
            expect(game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith(
                'bluePotionSound', false, true
            );
        });

        test('collisionWithPowers flips to bubble visuals when underwater', () => {
            const bp = new BluePotion();
            Object.assign(bp, { x: player.x, y: player.y, width: 10, height: 10 });
            game.powerUps = [bp];
            jest.spyOn(game.audioHandler.powerUpAndDownSFX, 'playSound');
            player.isUnderwater = true;
            player.currentState = player.states[4];
            player.collisionWithPowers(0);
            expect(player.particleImage).toBe('bluebubble');
            expect(player.splashImage).toBe('bluebubble');
            expect(game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith(
                'bluePotionSound', false, true
            );
        });
    });

    describe('fireballAbility energyReachedZero blocks spawn', () => {
        beforeEach(() => Fireball.mockClear());
        test('does not fire when energyReachedZero', () => {
            player.energyReachedZero = true;
            player.fireballTimer = player.fireballCooldown;
            game.input.qOrLeftClick.mockReturnValue(true);
            player.currentState = player.states[1];
            player.fireballAbility(game.input, 0);
            expect(Fireball).not.toHaveBeenCalled();
        });
    });

    describe('drawPlayerWithCurrentSkin transparency', () => {
        test('sets globalAlpha to 0.5 then back to 1 when invisible', () => {
            const ctx = { drawImage: jest.fn() };
            const alphas = [];
            Object.defineProperty(ctx, 'globalAlpha', {
                configurable: true,
                set(v) { alphas.push(v); },
                get() { return alphas[alphas.length - 1]; },
            });
            player.isInvisible = true;
            game.menu.skins.currentSkin = game.menu.skins.defaultSkin;
            player.frameX = 0; player.frameY = 0;
            player.drawPlayerWithCurrentSkin(ctx);
            expect(alphas).toEqual([0.5, 1]);
            expect(ctx.drawImage).toHaveBeenCalled();
        });
    });

    describe('color tint & glow rendering', () => {
        const fakeCanvas = (w = 10, h = 10) => ({
            width: w,
            height: h,
            getContext: jest.fn(() => ({
            })),
        });

        let ctx;
        beforeEach(() => {
        ctx = {
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
        };
        let _alpha = 1;
        Object.defineProperty(ctx, 'globalAlpha', {
            configurable: true,
            get() { return _alpha; },
            set(v) { _alpha = v; }
        });

        player.frameX = 0;
        player.frameY = 0;
        player.width = 100;
        player.height = 90;
        });

        test('poisoned branch: uses green tint and draws base + oc', () => {
            player.isPoisonedActive = true;
            player.isSlowed = false;

            const oc = fakeCanvas();
            const tintSpy = jest.spyOn(player, 'getTintedFrameCanvas').mockReturnValue(oc);

            player.drawPlayerWithCurrentSkin(ctx);

            expect(tintSpy).toHaveBeenCalledWith(
                player.getCurrentSkinImage(),
                0, 0, player.width, player.height,
                player.width, player.height,
                'rgba(0,100,0,0.40)'
            );

            expect(ctx.drawImage).toHaveBeenNthCalledWith(
                1,
                player.getCurrentSkinImage(),
                0, 0, player.width, player.height,
                -player.width / 2, -player.height / 2, player.width, player.height
            );
            expect(ctx.drawImage).toHaveBeenNthCalledWith(
                2, oc, -player.width / 2, -player.height / 2, player.width, player.height
            );
        });

        test('slowed branch: uses blue tint and draws base + oc', () => {
            player.isPoisonedActive = false;
            player.isSlowed = true;

            const oc = fakeCanvas();
            const tintSpy = jest.spyOn(player, 'getTintedFrameCanvas').mockReturnValue(oc);

            player.drawPlayerWithCurrentSkin(ctx);

            expect(tintSpy).toHaveBeenCalledWith(
                player.getCurrentSkinImage(),
                0, 0, player.width, player.height,
                player.width, player.height,
                'rgba(0,120,255,0.35)'
            );

            expect(ctx.drawImage).toHaveBeenNthCalledWith(
                1,
                player.getCurrentSkinImage(),
                0, 0, player.width, player.height,
                -player.width / 2, -player.height / 2, player.width, player.height
            );
            expect(ctx.drawImage).toHaveBeenNthCalledWith(
                2, oc, -player.width / 2, -player.height / 2, player.width, player.height
            );
        });

        test('slowed + poisoned branch: gradient tint then oc (no masks)', () => {
            player.isPoisonedActive = true;
            player.isSlowed = true;

            const oc = fakeCanvas();
            const tintSpy = jest.spyOn(player, 'getTintedFrameCanvas').mockReturnValue(oc);

            player.drawPlayerWithCurrentSkin(ctx);

            expect(tintSpy).toHaveBeenCalled();
            const tintArgs = tintSpy.mock.calls[0];
            const tintObj = tintArgs[tintArgs.length - 1];
            expect(tintObj).toEqual(
                expect.objectContaining({
                    dir: 'horizontal',
                    stops: expect.any(Array),
                })
            );
            expect(Array.isArray(tintObj.stops)).toBe(true);
            expect(tintObj.stops.length).toBeGreaterThan(0);

            expect(ctx.drawImage).toHaveBeenNthCalledWith(
                1,
                player.getCurrentSkinImage(),
                0, 0, player.width, player.height,
                -player.width / 2, -player.height / 2, player.width, player.height
            );
            expect(ctx.drawImage).toHaveBeenNthCalledWith(
                2, oc, -player.width / 2, -player.height / 2, player.width, player.height
            );
        });

        test('normal branch: draws base image only (no helpers)', () => {
            player.isPoisonedActive = false;
            player.isSlowed = false;

            const tintSpy = jest.spyOn(player, 'getTintedFrameCanvas');

            player.drawPlayerWithCurrentSkin(ctx);

            expect(tintSpy).not.toHaveBeenCalled();
            expect(ctx.drawImage).toHaveBeenCalledWith(
                player.getCurrentSkinImage(),
                0, 0, player.width, player.height,
                -player.width / 2, -player.height / 2, player.width, player.height
            );
        });

        test('respects invisibility alpha (0.5 then restore to 1)', () => {
            player.isInvisible = true;
            const alphas = [];
            Object.defineProperty(ctx, 'globalAlpha', {
                configurable: true,
                set(v) { alphas.push(v); },
                get() { return alphas[alphas.length - 1]; },
            });

            player.drawPlayerWithCurrentSkin(ctx);

            expect(alphas).toEqual([0.5, 1]);
        });
    });

    describe('collisionAnimationFollowsEnemy – Blood branch', () => {
        test('calls updatePosition on a Blood collision matching the enemy', () => {
            const enemy = { id: 'eX' };
            const blood = new Blood(game, 0, 0, enemy);
            blood.enemy = enemy;
            blood.updatePosition = jest.fn();
            game.collisions = [blood];
            player.collisionAnimationFollowsEnemy(enemy);
            expect(blood.updatePosition).toHaveBeenCalledWith(enemy);
        });
    });

    describe('checkIfFiredogIsDead underwater deathAnimation', () => {
        beforeEach(() => {
            player.currentState = { deathAnimation: true };
            player.isUnderwater = true;
        });

        test('when not on ground, y increases by 2', () => {
            const initialY = player.y - 10;
            player.y = initialY;
            player.checkIfFiredogIsDead();
            expect(player.y).toBe(initialY + 2);
        });

        test('when on ground, y stays the same', () => {
            player.y = game.height - player.height - game.groundMargin;
            player.checkIfFiredogIsDead();
            expect(player.y).toBe(game.height - player.height - game.groundMargin);
        });
    });

    describe('handleFloatingMessages direct', () => {
        test('enemy death (lives≤0) adds a FloatingMessage and increments coins & energy', () => {
            game.floatingMessages = [];
            game.coins = 5;
            player.energy = 10;
            player.previousLives = game.lives = 3;
            const enemy = { lives: 0, x: 7, y: 8 };
            player.handleFloatingMessages(enemy);
            expect(game.coins).toBe(6);
            expect(player.energy).toBe(12);
            expect(FloatingMessage).toHaveBeenCalled();
            expect(game.floatingMessages).toHaveLength(1);
        });
    });

    describe('update() smoke test', () => {
        it('calls all major subsystems when alive', () => {
            jest.spyOn(player, 'energyLogic');
            jest.spyOn(player, 'fireballAbility');
            jest.spyOn(player, 'invisibleAbility');
            jest.spyOn(player, 'playerSFXAudios');
            jest.spyOn(player, 'spriteAnimation');
            jest.spyOn(player, 'playerHorizontalMovement');
            jest.spyOn(player, 'playerVerticalMovement');
            jest.spyOn(player, 'collisionWithEnemies');
            jest.spyOn(player, 'collisionWithPowers');
            player.currentState = { deathAnimation: false, handleInput: jest.fn() };
            player.update([], 16);
            expect(player.energyLogic).toHaveBeenCalled();
            expect(player.fireballAbility).toHaveBeenCalled();
            expect(player.invisibleAbility).toHaveBeenCalled();
            expect(player.playerSFXAudios).toHaveBeenCalled();
            expect(player.spriteAnimation).toHaveBeenCalled();
            expect(player.playerHorizontalMovement).toHaveBeenCalled();
            expect(player.playerVerticalMovement).toHaveBeenCalled();
            expect(player.collisionWithEnemies).toHaveBeenCalled();
            expect(player.collisionWithPowers).toHaveBeenCalled();
        });
    });
});

describe('emitStatusParticles (bubble status logic)', () => {
    let game, player;
    const origRandom = Math.random;

    beforeEach(() => {
        game = {
            width: 1920,
            height: 689,
            groundMargin: 50,
            lives: 3,
            maxLives: 5,
            normalSpeed: 6,
            speed: 6,
            enemyInterval: 1000,
            input: {
                qOrLeftClick: jest.fn().mockReturnValue(false),
                eOrScrollClick: jest.fn().mockReturnValue(false),
                enterOrRightClick: jest.fn().mockReturnValue(false),
                keys: []
            },
            cabin: { isFullyVisible: false },
            debug: false,
            isElyvorgFullyVisible: false,
            elyvorgInFight: false,
            time: 0,
            maxTime: 10000,
            noDamageDuringTutorial: false,
            selectedDifficulty: 'Easy',
            mapSelected: [false, false, false, false],
            UI: { secondsLeftActivated: false },
            collisions: [],
            floatingMessages: [],
            behindPlayerParticles: [],
            enemies: [],
            powerUps: [],
            powerDowns: [],
            coins: 0,
            particles: [],
            audioHandler: {
                firedogSFX: { playSound: jest.fn(), stopSound: jest.fn() },
                explosionSFX: { playSound: jest.fn() },
                enemySFX: { playSound: jest.fn() },
                powerUpAndDownSFX: { playSound: jest.fn() }
            },
            gameOver: false,
            menu: {
                levelDifficulty: { setDifficulty: jest.fn() },
                skins: {
                    currentSkin: null,
                    defaultSkin: null,
                    hatSkin: null,
                    choloSkin: null,
                    zabkaSkin: null,
                    shinySkin: null
                }
            }
        };

        player = new Player(game);
        game.player = player;

        player.currentState = { deathAnimation: false };

        player.statusFxTimer = 0;
        player.statusFxInterval = 120;

        PoisonBubbles.mockClear();
        IceCrystalBubbles.mockClear();
        game.particles = [];
    });

    afterEach(() => {
        Math.random = origRandom;
    });

    test('spawns BOTH poison bubbles and ice crystals when poisoned + slowed', () => {
        player.isPoisonedActive = true;
        player.isSlowed = true;

        player.emitStatusParticles(player.statusFxInterval);

        expect(PoisonBubbles).toHaveBeenCalledTimes(1);
        expect(PoisonBubbles).toHaveBeenCalledWith(
            game,
            expect.any(Number),
            expect.any(Number),
            'poison'
        );
        expect(IceCrystalBubbles).toHaveBeenCalledTimes(1);
        expect(IceCrystalBubbles).toHaveBeenCalledWith(
            game,
            expect.any(Number),
            expect.any(Number)
        );
        expect(game.particles.length).toBe(2);
    });

    test('when ONLY poisoned: spawns PoisonBubbles with p≈0.75 (spawn case)', () => {
        player.isPoisonedActive = true;
        player.isSlowed = false;
        Math.random = jest.fn().mockReturnValue(0.5);

        player.emitStatusParticles(player.statusFxInterval);

        expect(PoisonBubbles).toHaveBeenCalledTimes(1);
        expect(IceCrystalBubbles).not.toHaveBeenCalled();
        expect(game.particles.length).toBe(1);
    });

    test('when ONLY poisoned: may skip spawn (non-spawn case)', () => {
        player.isPoisonedActive = true;
        player.isSlowed = false;
        Math.random = jest.fn().mockReturnValue(0.9);

        player.emitStatusParticles(player.statusFxInterval);

        expect(PoisonBubbles).not.toHaveBeenCalled();
        expect(IceCrystalBubbles).not.toHaveBeenCalled();
        expect(game.particles.length).toBe(0);
    });

    test('when ONLY slowed: always spawns IceCrystalBubbles', () => {
        player.isPoisonedActive = false;
        player.isSlowed = true;
        Math.random = jest.fn().mockReturnValue(0.123);

        player.emitStatusParticles(player.statusFxInterval);

        expect(IceCrystalBubbles).toHaveBeenCalledTimes(1);
        expect(PoisonBubbles).not.toHaveBeenCalled();
        expect(game.particles.length).toBe(1);
    });

    test('when NEITHER slowed nor poisoned: spawns nothing', () => {
        player.isPoisonedActive = false;
        player.isSlowed = false;

        player.emitStatusParticles(player.statusFxInterval);

        expect(PoisonBubbles).not.toHaveBeenCalled();
        expect(IceCrystalBubbles).not.toHaveBeenCalled();
        expect(game.particles.length).toBe(0);
    });

    test('does emit when currentState.deathAnimation is true', () => {
        player.currentState = { deathAnimation: true };
        player.isPoisonedActive = true;
        player.isSlowed = true;

        player.emitStatusParticles(player.statusFxInterval);

        expect(PoisonBubbles).toHaveBeenCalled();
        expect(IceCrystalBubbles).toHaveBeenCalled();
        expect(game.particles.length).toBe(2);
    });

    test('timer gate: delta below interval does not emit', () => {
        player.isPoisonedActive = true;
        player.isSlowed = true;

        player.emitStatusParticles(player.statusFxInterval - 1);

        expect(PoisonBubbles).not.toHaveBeenCalled();
        expect(IceCrystalBubbles).not.toHaveBeenCalled();
        expect(game.particles.length).toBe(0);
    });
});
