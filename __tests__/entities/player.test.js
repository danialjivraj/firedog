import { Player, CollisionLogic } from '../../game/entities/player';
import { Fireball, CoinLoss, PoisonBubbles, IceCrystalBubbles } from '../../game/animations/particles';
import { IceDrink, IceCube, Cauldron, BlackHole, Confuse, DeadSkull, CarbonDioxideTank, OxygenTank, HealthLive, Coin, RedPotion, BluePotion, RandomPower } from '../../game/entities/powerUpAndDown';
import { InkSplash } from '../../game/animations/ink';
import { TunnelVision } from '../../game/animations/tunnelVision';
import {
    Goblin, Sluggie, Skulnap, PoisonSpit,
    AngryBee, Bee, IceBall, Garry, InkBeam, Cactus, TheRock, Tauro,
} from '../../game/entities/enemies/enemies';
import {
    ElectricWheel, Elyvorg, Arrow, PurpleBarrier, GhostElyvorg, GravitationalAura, PurpleLaserBeam,
    InkBomb, PurpleFireball, MeteorAttack, PurpleSlash, PoisonDrop, PurpleThunder
} from '../../game/entities/enemies/elyvorg';
import {
    ElectricityCollision, PoisonSpitSplash, PoisonDropCollision,
    InkBombCollision, InkSplashCollision, ExplosionCollisionAnimation,
    PurpleFireballCollision, CollisionAnimation, MeteorExplosionCollision,
    RedFireballCollision, Blood, PurpleThunderCollision, GhostFadeOut, DarkExplosionCollision, DisintegrateCollision,
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
    RedFireballCollision: jest.fn(),
    PurpleFireballCollision: jest.fn(),
    PoisonDropCollision: jest.fn(),
    MeteorExplosionCollision: jest.fn(),
    PurpleThunderCollision: jest.fn(),
    GhostFadeOut: jest.fn(),
    DarkExplosionCollision: jest.fn(),
    DisintegrateCollision: jest.fn(),
}));

jest.mock('../../game/entities/powerUpAndDown', () => {
    class HealthLive { }
    class RedPotion { }
    class BluePotion { }
    class Coin { }
    class OxygenTank { }
    class BlackHole { }
    class Cauldron { }
    class IceDrink { }
    class IceCube { }
    class Confuse { }
    class DeadSkull { }
    class CarbonDioxideTank { }
    class RandomPower { }
    return {
        HealthLive,
        RedPotion,
        BluePotion,
        Coin,
        OxygenTank,
        BlackHole,
        Cauldron,
        IceDrink,
        IceCube,
        Confuse,
        DeadSkull,
        CarbonDioxideTank,
        RandomPower,
    };
});

jest.mock('../../game/animations/floatingMessages', () => ({
    FloatingMessage: jest.fn(),
}));

jest.mock('../../game/animations/particles', () => ({
    Fireball: jest.fn(),
    CoinLoss: jest.fn(),
    PoisonBubbles: jest.fn(),
    IceCrystalBubbles: jest.fn(),
    SpinningChicks: jest.fn(),
}));

jest.mock('../../game/entities/enemies/enemies', () => {
    class Goblin { }
    class PoisonSpit { }
    class PoisonDrop { }
    class AngryBee { }
    class Bee { }
    class Skulnap { }
    class Sluggie { }
    class Voltzeel { }
    class Tauro { }
    class Gloomlet { }
    class Aura { }
    class KarateCroco { }
    class SpearFish { }
    class TheRock { }
    class LilHornet { }
    class Cactus { }
    class IceBall { }
    class Garry { }
    class InkBeam { }
    class RockProjectile { }
    class VolcanoWasp { }
    class Volcanurtle { }
    class EnemyBoss { }
    class Barrier { }
    return {
        Goblin, PoisonSpit, PoisonDrop, AngryBee, Bee, Skulnap, Sluggie,
        Voltzeel, Tauro, Gloomlet, Aura, KarateCroco, SpearFish, TheRock,
        LilHornet, Cactus, IceBall, Garry, InkBeam, RockProjectile,
        VolcanoWasp, Volcanurtle, EnemyBoss, Barrier,
    };
});

jest.mock('../../game/animations/ink', () => ({ InkSplash: jest.fn() }));
jest.mock('../../game/animations/damageIndicator', () => ({ DamageIndicator: jest.fn() }));
jest.mock('../../game/animations/tunnelVision', () => {
    const TunnelVision = jest.fn(function (game) {
        this.game = game;
        this.restartFromCurrent = jest.fn();
        this.reset = jest.fn();
    });
    return { TunnelVision };
});

jest.mock('../../game/entities/enemies/elyvorg', () => {
    const { EnemyBoss } = jest.requireMock('../../game/entities/enemies/enemies');

    class Elyvorg extends EnemyBoss {
        constructor() {
            super();
            this.isBarrierActive = false;
        }
    }

    class Arrow { constructor() { this.image = { id: null }; } }
    class PurpleBarrier { }
    class ElectricWheel { }
    class GravitationalAura { }
    class InkBomb { }
    class PurpleFireball { }
    class PoisonDrop { }
    class MeteorAttack { }
    class PurpleSlash { }
    class PurpleThunder { }
    class GhostElyvorg { }
    class PurpleLaserBeam { }

    return {
        Elyvorg, Arrow, PurpleBarrier, ElectricWheel, GravitationalAura, InkBomb,
        PurpleFireball, PoisonDrop, MeteorAttack, PurpleSlash, PurpleThunder,
        GhostElyvorg, PurpleLaserBeam,
    };
});

jest.mock('../../game/entities/enemies/ntharax', () => {
    class NTharax { }
    class Kamehameha { constructor() { this.isKamehameha = true; } }
    class HealingBarrier { }
    class GalacticSpike { }
    class PurpleBallOrb { }
    class AntennaeTentacle { }
    class YellowBeamOrb { }
    class BlackBeamOrb { }
    class PurpleBeamOrb { }
    class PurpleAsteroid { }
    class BlueAsteroid { }
    class GroundShockwaveRing { }
    class LaserBall { }

    return {
        NTharax,
        Kamehameha,
        HealingBarrier,
        GalacticSpike,
        PurpleBallOrb,
        AntennaeTentacle,
        YellowBeamOrb,
        BlackBeamOrb,
        PurpleBeamOrb,
        PurpleAsteroid,
        BlueAsteroid,
        GroundShockwaveRing,
        LaserBall,
    };
});

jest.mock('../../game/entities/enemies/glacikal', () => {
    class IceTrail { }
    class IcyStormBall { }
    class IceSlash { }
    class SpinningIceBalls { }
    class PointyIcicleShard { }
    class Glacikal { }
    class UndergroundIcicle { }
    return { IceTrail, IcyStormBall, IceSlash, SpinningIceBalls, PointyIcicleShard, Glacikal, UndergroundIcicle };
});

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
                isFireballAttack: jest.fn().mockReturnValue(false),
                isInvisibleDefense: jest.fn().mockReturnValue(false),
                isRollAttack: jest.fn().mockReturnValue(false),
                keys: []
            },
            cabin: { isFullyVisible: false },
            debug: false,

            boss: {
                id: 'elyvorg',
                current: null,
                talkToBoss: false,
            },
            bossInFight: false,
            isBossVisible: false,

            time: 0,
            maxTime: 10000,
            noDamageDuringTutorial: false,
            selectedDifficulty: 'Easy',
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
                collisionSFX: { playSound: jest.fn() },
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
        game.input.isActionActive = (binding, input) => {
            const has = key => {
                if (!input) return false;
                if (Array.isArray(input)) return input.includes(key);
                if (typeof input === 'string') return input === key;
                return !!input[key];
            };

            switch (binding) {
                case 'moveForward':
                    return has('d') || has('D') || has('right') || has('ArrowRight') || has('moveForward');
                case 'moveBackward':
                    return has('a') || has('A') || has('left') || has('ArrowLeft') || has('moveBackward');
                case 'jump':
                    return has('w') || has('W') || has('space') || has(' ') || has('Space') || has('ArrowUp') || has('jump');
                case 'sit':
                    return has('s') || has('S') || has('down') || has('ArrowDown') || has('sit');
                default:
                    return false;
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

    test('bossCollisionTimers triggers only when in fight', () => {
        player.bossCollisionTimer = 100;
        player.bossCollisionCooldown = 300;

        // not in fight
        game.bossInFight = false;
        game.boss.id = 'elyvorg';
        player.bossCollisionTimers(50);
        expect(player.bossCollisionTimer).toBe(100);

        // now in fight
        game.bossInFight = true;
        player.bossCollisionTimers(250);
        expect(player.bossCollisionTimer).toBe(300);
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
        player.collisionLogic.updateCollisionCooldowns(60);
        expect(player.collisionCooldowns.e1).toBe(40);
        expect(player.collisionCooldowns.e2).toBe(0);
    });

    test('setState updates states, calls enter, and sets speed', () => {
        const stub = { enter: jest.fn(), deathAnimation: false };
        player.states[2] = stub;
        game.isBossVisible = false;
        player.isBluePotionActive = false;
        player.setState(2, 3);
        expect(player.previousState).toBeNull();
        expect(player.currentState).toBe(stub);
        expect(stub.enter).toHaveBeenCalled();
        expect(game.speed).toBe(game.normalSpeed * 3);
    });

    test('setState sets speed=0 when boss visible', () => {
        const stub = { enter: jest.fn(), deathAnimation: false };
        player.states[1] = stub;
        game.isBossVisible = true;
        player.setState(1, 5);
        expect(game.speed).toBe(0);
    });

    test('setState uses bluePotionSpeed when active and rolling', () => {
        const stub = { enter: jest.fn(), deathAnimation: false };
        player.states[4] = stub;
        player.isBluePotionActive = true;
        player.bluePotionSpeed = 20;
        game.isBossVisible = false;
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
            game.input.isFireballAttack.mockReturnValue(true);
            const e0 = player.energy;
            player.fireballAbility(game.input, 0);
            expect(Fireball).toHaveBeenCalledTimes(1);
            expect(player.energy).toBe(e0 - 8);
            expect(player.fireballTimer).toBe(0);
        });

        test('spawns 7 fireballs under red potion', () => {
            game.input.isFireballAttack.mockReturnValue(true);
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

        test('underwater spawns a normal fireball, using the fireball sprite id', () => {
            game.input.isFireballAttack.mockReturnValue(true);

            player.fireballAbility(game.input, 0);

            expect(Fireball).toHaveBeenCalledTimes(1);

            const [argGame, argX, argY, argImage, argDir] = Fireball.mock.calls[0];

            expect(argGame).toBe(game);
            expect(typeof argX).toBe('number');
            expect(typeof argY).toBe('number');
            expect(argImage).toBe('fireball');
            expect(typeof argDir).toBe('string');
        });

        test('spawns 7 redPotionFireball when underwater + red potion', () => {
            player.isRedPotionActive = true;
            game.input.isFireballAttack.mockReturnValue(true);

            player.fireballAbility(game.input, 0);

            expect(Fireball).toHaveBeenCalledTimes(7);

            const calls = Fireball.mock.calls.filter(c => c[3] === 'redPotionFireball');
            expect(calls).toHaveLength(7);
        });
    });

    describe('invisibleAbility', () => {
        test('activation with E when timer full', () => {
            player.isInvisible = false;
            player.invisibleTimer = player.invisibleCooldown;
            player.currentState = { deathAnimation: false };
            game.input.isInvisibleDefense.mockReturnValue(true);
            player.invisibleAbility(game.input, 0);
            expect(player.isInvisible).toBe(true);
            expect(game.audioHandler.firedogSFX.playSound)
                .toHaveBeenCalledWith('invisibleInSFX');
        });

        test('deactivation after active cooldown', () => {
            player.isInvisible = true;
            player.invisibleTimer = player.invisibleCooldown;
            player.currentState = { deathAnimation: false };
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
            game.input.isRollAttack.mockReturnValue(true);
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
            player.currentState = player.states[1];
            player.playerHorizontalMovement([]);
            expect(player.x).toBe(0);
            player.x = 1000;
            player.playerHorizontalMovement([]);
            expect(player.x).toBe(1000);
        });
    });

    describe('playerVerticalMovement', () => {
        test('in space: applies low gravity and clamps fall speed', () => {
            player.isSpace = true;
            player.y = 100;
            player.vy = 0;

            player.playerVerticalMovement([]);
            expect(player.y).toBe(100);
            expect(player.vy).toBeCloseTo(0.07);

            player.vy = 3;
            player.playerVerticalMovement([]);
            expect(player.vy).toBe(3);
        });

        test('in space: clamps y within min and max bounds', () => {
            player.isSpace = true;

            player.y = -10;
            player.vy = -1;
            player.playerVerticalMovement([]);
            expect(player.y).toBe(0);
            expect(player.vy).toBe(0);

            player.y = game.height;
            player.vy = 5;
            player.canSpaceDoubleJump = true;
            player.playerVerticalMovement([]);
            expect(player.y).toBe(game.height - player.height - game.groundMargin);
            expect(player.vy).toBe(0);
            expect(player.canSpaceDoubleJump).toBe(false);
        });

        test('in space: early return when frozen', () => {
            player.isSpace = true;
            player.isFrozen = true;
            const initialY = player.y;
            const initialVy = player.vy;

            player.playerVerticalMovement([]);

            expect(player.y).toBe(initialY);
            expect(player.vy).toBe(initialVy);
        });
    });

    describe('collisionWithPowers', () => {
        beforeEach(() => {
            player.x = 0; player.y = 0;
            player.width = 10; player.height = 10;
            game.gameOver = false;
            player.isUnderwater = false;
            player.currentState = { deathAnimation: false };
        });

        test('IceDrink slows player', () => {
            const d = new IceDrink();
            Object.assign(d, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [d];
            player.collisionWithPowers(0);
            expect(player.isSlowed).toBe(true);
            player.checkIfFiredogIsSlowed(1);
            expect(player.normalSpeed).toBe(4);
            expect(player.maxSpeed).toBe(6);
            expect(player.weight).toBe(1.5);
        });

        test('cannot pick up IceDrink when invisible', () => {
            player.isInvisible = true;
            const d = new IceDrink();
            Object.assign(d, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [d];
            player.collisionWithPowers(0);
            expect(player.isSlowed).toBe(false);
            expect(player.weight).toBe(1);
        });

        test('IceCube freezes player using startFrozen(3000)', () => {
            const cube = new IceCube();
            Object.assign(cube, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [cube];
            const spy = jest.spyOn(player, 'startFrozen');
            player.collisionWithPowers(0);
            expect(spy).toHaveBeenCalledWith(3000);
            expect(cube.markedForDeletion).toBe(true);
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

        test('Confuse activates confuse state and deletes item', () => {
            const conf = new Confuse();
            Object.assign(conf, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [conf];
            const spy = jest.spyOn(player, 'activateConfuse').mockImplementation(() => {
                player.isConfused = true;
                player.confuseTimer = 8000;
            });
            player.collisionWithPowers(0);
            expect(spy).toHaveBeenCalled();
            expect(player.isConfused).toBe(true);
            expect(conf.markedForDeletion).toBe(true);
        });

        test('DeadSkull decrements lives', () => {
            game.lives = 2;
            const h = new DeadSkull();
            Object.assign(h, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [h];
            player.collisionWithPowers(0);
            expect(game.lives).toBe(1);
        });

        test('OxygenTank grants +10s remaining', () => {
            game.time = 50000;
            const o = new OxygenTank();
            Object.assign(o, { x: 0, y: 0, width: 10, height: 10 });
            game.powerUps = [o];
            player.collisionWithPowers(0);
            expect(game.time).toBe(40000);
        });

        test('CarbonDioxideTank decreases 10s remaining', () => {
            game.time = 50000;
            const cd = new CarbonDioxideTank();
            Object.assign(cd, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [cd];
            player.collisionWithPowers(0);
            expect(game.time).toBe(60000);
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

        test('RandomPower in powerUps can resolve to OxygenTank when underwater', () => {
            const origRandom = Math.random;
            Math.random = jest.fn(() => 0);

            try {
                game.time = 50000;
                player.isUnderwater = true;

                const rp = new RandomPower();
                Object.assign(rp, { x: 0, y: 0, width: 10, height: 10 });

                game.powerUps = [rp];
                game.powerDowns = [];

                player.collisionWithPowers(0);

                expect(game.time).toBe(40000);
                expect(rp.markedForDeletion).toBe(true);
            } finally {
                Math.random = origRandom;
            }
        });

        test('RandomPower in powerUps does not pick OxygenTank when not underwater', () => {
            const origRandom = Math.random;
            Math.random = jest.fn(() => 0);

            try {
                game.time = 50000;
                game.lives = 1;
                player.isUnderwater = false;

                const rp = new RandomPower();
                Object.assign(rp, { x: 0, y: 0, width: 10, height: 10 });

                game.powerUps = [rp];
                game.powerDowns = [];

                player.collisionWithPowers(0);

                expect(game.time).toBe(50000);
                expect(game.lives).toBe(2);
                expect(rp.markedForDeletion).toBe(true);
            } finally {
                Math.random = origRandom;
            }
        });

        test('RandomPower in powerDowns can resolve to CarbonDioxideTank when underwater', () => {
            const origRandom = Math.random;
            Math.random = jest.fn(() => 0.9);

            try {
                game.time = 50000;
                player.isUnderwater = true;

                const rp = new RandomPower();
                Object.assign(rp, { x: 0, y: 0, width: 10, height: 10 });

                game.powerUps = [];
                game.powerDowns = [rp];

                player.isInvisible = false;

                player.collisionWithPowers(0);

                expect(game.time).toBe(60000);
                expect(rp.markedForDeletion).toBe(true);
            } finally {
                Math.random = origRandom;
            }
        });

        test('RandomPower in powerDowns does not pick CarbonDioxideTank when NOT underwater', () => {
            const origRandom = Math.random;
            Math.random = jest.fn(() => 0.9);

            try {
                game.time = 50000;
                player.isUnderwater = false;

                const rp = new RandomPower();
                Object.assign(rp, { x: 0, y: 0, width: 10, height: 10 });

                game.powerUps = [];
                game.powerDowns = [rp];

                player.isInvisible = false;

                player.collisionWithPowers(0);

                expect(game.time).toBe(50000);
                expect(rp.markedForDeletion).toBe(true);
            } finally {
                Math.random = origRandom;
            }
        });

        test('RandomPower in powerDowns delegates to a down handler (e.g. IceDrink)', () => {
            const origRandom = Math.random;
            Math.random = jest.fn(() => 0);

            try {
                const rp = new RandomPower();
                Object.assign(rp, { x: 0, y: 0, width: 10, height: 10 });

                game.powerUps = [];
                game.powerDowns = [rp];

                player.isInvisible = false;
                player.collisionWithPowers(0);

                expect(player.isSlowed).toBe(true);
                expect(rp.markedForDeletion).toBe(true);
            } finally {
                Math.random = origRandom;
            }
        });

        test('RandomPower powerDown is ignored while invisible', () => {
            const rp = new RandomPower();
            Object.assign(rp, { x: 0, y: 0, width: 10, height: 10 });

            game.powerUps = [];
            game.powerDowns = [rp];

            player.isInvisible = true;

            const origRandom = Math.random;
            Math.random = jest.fn(() => 0);

            try {
                player.collisionWithPowers(0);

                expect(rp.markedForDeletion).toBeUndefined();
                expect(player.isSlowed).toBe(false);
            } finally {
                Math.random = origRandom;
            }
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
            player.hit({ dealsDirectHitDamage: true });
            expect(game.lives).toBe(2);
            expect(game.coins).toBe(4);
            expect(player.currentState).toBe(player.states[7]);
        });

        test('hit does not reduce lives & coins and switches to Hit state', () => {
            game.coins = 5; game.lives = 3;
            player.currentState = player.states[0];
            player.hit({ dealsDirectHitDamage: false });
            expect(game.lives).toBe(3);
            expect(game.coins).toBe(5);
            expect(player.currentState).toBe(player.states[7]);
        });

        test('stunned reduces lives & coins and switches to Stunned state', () => {
            game.coins = 5; game.lives = 3;
            player.currentState = player.states[0];
            player.stunned({});
            expect(game.lives).toBe(2);
            expect(game.coins).toBe(4);
            expect(player.currentState).toBe(player.states[6]);
        });
    });

    test('red potion expires after duration', () => {
        player.isRedPotionActive = true;
        player.redPotionTimer = 1000;
        player.currentState = player.states[0];
        player.fireballAbility(game.input, 1000);
        expect(player.isRedPotionActive).toBe(false);
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
        player.currentState = { deathAnimation: false };

        const pdClasses = [IceDrink, IceCube, Cauldron, BlackHole, Confuse, DeadSkull, CarbonDioxideTank, RandomPower];
        pdClasses.forEach(Ctor => {
            const item = new Ctor();
            Object.assign(item, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [item];
            game.powerUps = [];
            player.isInvisible = false;
            player.collisionWithPowers(0);
            expect(item.markedForDeletion).toBe(true);
        });

        const puClasses = [OxygenTank, HealthLive, Coin, RedPotion, BluePotion, RandomPower];
        puClasses.forEach(Ctor => {
            const item = new Ctor();
            Object.assign(item, { x: 0, y: 0, width: 10, height: 10 });
            game.powerDowns = [];
            game.powerUps = [item];
            player.collisionWithPowers(0);
            expect(item.markedForDeletion).toBe(true);
        });
    });

    test('bossCollisionTimers does not advance when bossInFight is false', () => {
        game.bossInFight = false;
        game.boss.id = 'elyvorg';
        player.bossCollisionTimer = 100;
        player.bossCollisionTimers(500);
        expect(player.bossCollisionTimer).toBe(100);
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
        player.weight = 1.5;

        player.checkIfFiredogIsSlowed(150);
        expect(player.slowedTimer).toBeLessThanOrEqual(0);
        expect(player.isSlowed).toBe(true);
        expect(player.normalSpeed).toBe(4);
        expect(player.maxSpeed).toBe(6);
        expect(player.weight).toBe(1.5);

        player.checkIfFiredogIsSlowed(0);
        expect(player.slowedTimer).toBe(0);
        expect(player.isSlowed).toBe(false);
        expect(player.normalSpeed).toBe(6);
        expect(player.maxSpeed).toBe(10);
        expect(player.weight).toBe(1);
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

            ec.x = player.x;
            ec.y = player.y;
            player.collisionLogic.collisionAnimationFollowsEnemy(enemy);
            expect(ec.updatePositionWhereCollisionHappened).toHaveBeenCalled();

            ec.x = player.x + 999;
            player.collisionLogic.collisionAnimationFollowsEnemy(enemy);
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

        test('draw flips horizontally when boss is to the left (player faces left)', () => {
            game.gameOver = false;
            game.debug = true;

            game.isBossVisible = true;
            game.boss.current = { x: player.x - 200, width: 50 };

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
            const e = new Elyvorg();
            e.x = player.x + 200;
            e.width = 50;
            game.enemies = [e];

            game.isBossVisible = true;
            game.boss.current = e;
        });

        test('rolling toward Elyvorg moves player', () => {
            player.currentState = player.states[4];
            player.facingRight = true;
            player.x = 50;
            player.firedogMeetsElyvorg(['d']);
            expect(player.x).toBe(56);
        });

        test('talkToBoss runs then stands', done => {
            game.boss.talkToBoss = true;
            game.isBossVisible = true;

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

    describe('CollisionLogic.shouldSkipElyvorgTeleportCollision', () => {
        let logic;
        let boss;

        beforeEach(() => {
            logic = new CollisionLogic(game);

            boss = new Elyvorg();
            boss.x = 0;
            boss.y = 0;
            boss.width = 10;
            boss.height = 10;

            game.boss.current = boss;
            game.bossInFight = true;
        });

        test('skips collision only for Elyvorg/PurpleBarrier during teleport safe phase when player not rolling or diving', () => {
            const enemyElyvorg = new Elyvorg();
            const enemyBarrier = new PurpleBarrier();
            const otherEnemy = new Goblin();

            boss.state = 'teleport';
            boss.postTeleportSafeTimer = 500;

            player.currentState = player.states[8];
            expect(player.rollingOrDiving()).toBe(false);

            expect(logic.shouldSkipElyvorgTeleportCollision(enemyElyvorg, player)).toBe(true);
            expect(logic.shouldSkipElyvorgTeleportCollision(enemyBarrier, player)).toBe(true);

            expect(logic.shouldSkipElyvorgTeleportCollision(otherEnemy, player)).toBe(false);

            boss.state = 'attack';
            boss.postTeleportSafeTimer = 0;

            expect(logic.shouldSkipElyvorgTeleportCollision(enemyElyvorg, player)).toBe(false);
            expect(logic.shouldSkipElyvorgTeleportCollision(enemyBarrier, player)).toBe(false);

            boss.state = 'teleport';
            boss.postTeleportSafeTimer = 500;
            player.currentState = player.states[4];
            expect(player.rollingOrDiving()).toBe(true);

            expect(logic.shouldSkipElyvorgTeleportCollision(enemyElyvorg, player)).toBe(false);
        });
    });

    describe('CollisionLogic.handleNormalCollision branches', () => {
        let logic;

        beforeEach(() => {
            logic = new CollisionLogic(game);
            jest.spyOn(player, 'hit');
            jest.spyOn(player, 'bloodOrPoof');
            jest.spyOn(player, 'stunned');
            jest.spyOn(player, 'triggerInkSplash');
            jest.spyOn(player, 'startFrozen');
            jest.spyOn(logic, 'collisionAnimationBasedOnEnemy');
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
            expect(logic.collisionAnimationBasedOnEnemy).toHaveBeenCalledWith(s);
        });

        test('InkBomb triggers ink splash and InkBombCollision', () => {
            const ib = new InkBomb();
            ib.x = 0; ib.y = 0; ib.width = 10; ib.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(ib);
            expect(player.triggerInkSplash).toHaveBeenCalled();
            expect(logic.collisionAnimationBasedOnEnemy).toHaveBeenCalledWith(ib);
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
            expect(player.bossCollisionTimer).toBe(0);
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

        test('IceBall slows and plays iceSlowedSound', () => {
            const ice = new IceBall();
            ice.x = 0; ice.y = 0; ice.width = 10; ice.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(ice);
            expect(player.isSlowed).toBe(true);
            expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('iceSlowedSound', false, true);
        });

        test('Elyvorg only hits after cooldown and barrier inactive', () => {
            const boss = new Elyvorg();
            boss.isBarrierActive = false;
            boss.x = 0; boss.y = 0; boss.width = 10; boss.height = 10;
            player.bossCollisionTimer = player.bossCollisionCooldown;
            logic.handleNormalCollision(boss);
            expect(player.hit).toHaveBeenCalledWith(boss);
        });

        test('PurpleBarrier resets timer and hits when allowed', () => {
            const bar = new PurpleBarrier();
            bar.x = 0; bar.y = 0; bar.width = 10; bar.height = 10;
            player.bossCollisionTimer = 1000;
            player.currentState = player.states[0];
            logic.handleNormalCollision(bar);
            expect(player.bossCollisionTimer).toBe(0);
            expect(player.hit).toHaveBeenCalledWith(bar);
        });

        test('PurpleSlash resets timer and hits', () => {
            const ps = new PurpleSlash();
            ps.x = 0; ps.y = 0; ps.width = 10; ps.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(ps);
            expect(player.bossCollisionTimer).toBe(0);
            expect(player.hit).toHaveBeenCalledWith(ps);
        });

        test('PurpleFireball hits and plays PurpleFireballCollision', () => {
            const pf = new PurpleFireball();
            pf.x = 0; pf.y = 0; pf.width = 10; pf.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(pf);
            expect(player.hit).toHaveBeenCalledWith(pf);
            expect(PurpleFireballCollision).toHaveBeenCalled();
        });

        test('MeteorAttack hits and plays MeteorExplosionCollision', () => {
            const ma = new MeteorAttack();
            ma.x = 0; ma.y = 0; ma.width = 10; ma.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(ma);
            expect(player.hit).toHaveBeenCalledWith(ma);
            expect(MeteorExplosionCollision).toHaveBeenCalled();
        });

        test('Arrow blue slows and plays iceSlowedSound', () => {
            const arr = new Arrow();
            arr.image = { id: 'blueArrow' };
            arr.x = 0; arr.y = 0; arr.width = 10; arr.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(arr);
            expect(player.isSlowed).toBe(true);
            expect(game.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith('iceSlowedSound', false, true);
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
            expect(game.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith('acidSoundEffect', false, true);
        });

        test('Arrow cyan freezes the player', () => {
            const arr = new Arrow();
            arr.image = { id: 'cyanArrow' };
            arr.x = 0; arr.y = 0; arr.width = 10; arr.height = 10;
            player.isInvisible = false;
            logic.handleNormalCollision(arr);
            expect(player.startFrozen).toHaveBeenCalled();
            expect(player.isFrozen).toBe(true);
            expect(player.frozenTimer).toBeGreaterThan(0);
        });
    });

    describe('CollisionLogic.handleRollingOrDivingCollision branches', () => {
        let logic;

        beforeEach(() => {
            logic = new CollisionLogic(game);
            player.currentState = player.states[4]; // rolling
            jest.spyOn(player, 'hit');
            jest.spyOn(player, 'bloodOrPoof');
            jest.spyOn(player, 'stunned');
            jest.spyOn(player, 'triggerInkSplash');
            jest.spyOn(player, 'startFrozen');
            jest.spyOn(logic, 'collisionAnimationBasedOnEnemy');
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
            expect(logic.collisionAnimationBasedOnEnemy).toHaveBeenCalledWith(s);
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
            expect(player.bossCollisionTimer).toBe(0);
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
            expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('iceSlowedSound', false, true);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(ice);
        });

        test('Elyvorg in rolling damages boss and blood/poof', () => {
            const boss = new Elyvorg();
            boss.isBarrierActive = false;
            boss.lives = 3; boss.x = 0; boss.y = 0; boss.width = 10; boss.height = 10;
            player.bossCollisionTimer = player.bossCollisionCooldown;
            logic.handleRollingOrDivingCollision(boss);
            expect(boss.lives).toBe(2);
            expect(player.bloodOrPoof).toHaveBeenCalledWith(boss);
        });

        test('PurpleBarrier in rolling resets timer only', () => {
            const bar = new PurpleBarrier();
            bar.x = 0; bar.y = 0; bar.width = 10; bar.height = 10;
            player.bossCollisionTimer = 123;
            logic.handleRollingOrDivingCollision(bar);
            expect(player.bossCollisionTimer).toBe(0);
        });

        test('PurpleSlash in rolling hits only', () => {
            const ps = new PurpleSlash();
            ps.x = 0; ps.y = 0; ps.width = 10; ps.height = 10;
            player.isInvisible = false;
            logic.handleRollingOrDivingCollision(ps);
            expect(player.hit).toHaveBeenCalledWith(ps);
        });

        test('PurpleFireball in rolling hits and plays PurpleFireballCollision', () => {
            const pf = new PurpleFireball();
            pf.x = 0; pf.y = 0; pf.width = 10; pf.height = 10;
            logic.handleRollingOrDivingCollision(pf);
            expect(player.hit).toHaveBeenCalledWith(pf);
            expect(PurpleFireballCollision).toHaveBeenCalled();
        });

        test('MeteorAttack in rolling only collision animation', () => {
            const ma = new MeteorAttack();
            ma.x = 0; ma.y = 0; ma.width = 10; ma.height = 10;
            logic.handleRollingOrDivingCollision(ma);
            expect(logic.collisionAnimationBasedOnEnemy).toHaveBeenCalledWith(ma);
        });

        test('Arrow yellow in rolling dies arrow when invisible', () => {
            const arr = new Arrow();
            arr.image = { id: 'yellowArrow' };
            arr.lives = 2; arr.x = 0; arr.y = 0; arr.width = 10; arr.height = 10;
            player.isInvisible = true;
            logic.handleRollingOrDivingCollision(arr);
            expect(arr.lives).toBe(1);
        });

        test('Arrow green in rolling poisons and plays acidSoundEffect', () => {
            const arr = new Arrow();
            arr.image = { id: 'greenArrow' };
            arr.x = 0; arr.y = 0; arr.width = 10; arr.height = 10;
            player.isInvisible = false;
            logic.handleRollingOrDivingCollision(arr);
            expect(player.isPoisonedActive).toBe(true);
            expect(game.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith('acidSoundEffect', false, true);
        });

        test('Arrow cyan in rolling freezes the player', () => {
            const arr = new Arrow();
            arr.image = { id: 'cyanArrow' };
            arr.x = 0; arr.y = 0; arr.width = 10; arr.height = 10;
            player.isInvisible = false;
            logic.handleRollingOrDivingCollision(arr);
            expect(player.startFrozen).toHaveBeenCalled();
            expect(player.isFrozen).toBe(true);
            expect(player.frozenTimer).toBeGreaterThan(0);
        });
    });

    describe('collisionAnimationBasedOnEnemy direct', () => {
        test('InkBomb triggers InkBombCollision', () => {
            const ib = new InkBomb();
            ib.x = 0; ib.y = 0; ib.width = 10; ib.height = 10;
            player.collisionLogic.collisionAnimationBasedOnEnemy(ib);
            expect(InkBombCollision).toHaveBeenCalled();
        });

        test('MeteorAttack triggers MeteorExplosionCollision', () => {
            const ma = new MeteorAttack();
            ma.x = 0; ma.y = 0; ma.width = 10; ma.height = 10;
            player.collisionLogic.collisionAnimationBasedOnEnemy(ma);
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

    describe('updateBluePotionTimer', () => {
        test('when timer elapses while rolling, disables potion and sets game speed to 12', () => {
            player.blueFireTimer = 10;
            player.isBluePotionActive = true;
            player.bluePotionSpeed = 20;
            game.speed = player.bluePotionSpeed;
            game.isBossVisible = false;
            player.isFrozen = false;
            player.currentState = player.states[4];

            player.updateBluePotionTimer(20);

            expect(player.blueFireTimer).toBe(0);
            expect(player.isBluePotionActive).toBe(false);
            expect(game.audioHandler.firedogSFX.stopSound).toHaveBeenCalledWith('bluePotionEnergyGoingUp');
            expect(game.speed).toBe(12);
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
            game.input.isFireballAttack.mockReturnValue(true);
            game.cabin.isFullyVisible = true;
            player.fireballAbility(game.input, 0);
            expect(Fireball).not.toHaveBeenCalled();
        });
    });

    describe('handleFireballCollisionWithEnemy special cases', () => {
        beforeEach(() => {
            game.behindPlayerParticles = [];
            game.collisions = [];

            ElectricityCollision.mockImplementation(() => ({
                width: 1,
                height: 1,
                x: 0,
                y: 0,
                updatePositionWhereCollisionHappened: jest.fn(),
                updatePosition: jest.fn(),
            }));
        });

        const cases = [
            { Ctor: PurpleFireball, anim: RedFireballCollision, key: 'PurpleFireball' },
            { Ctor: MeteorAttack, anim: MeteorExplosionCollision, key: 'MeteorAttack' },
            { Ctor: PoisonDrop, anim: PoisonDropCollision, key: 'PoisonDrop' },
            { Ctor: ElectricWheel, anim: ElectricityCollision, key: 'ElectricWheel' },
            { Ctor: Goblin, anim: CollisionAnimation, key: 'Goblin' },
            { Ctor: PoisonSpit, anim: PoisonSpitSplash, key: 'PoisonSpit' },
            { Ctor: PurpleThunder, anim: PurpleThunderCollision, key: 'PurpleThunder' },
            { Ctor: GhostElyvorg, anim: GhostFadeOut, key: 'GhostElyvorg' },
            { Ctor: GravitationalAura, anim: DarkExplosionCollision, key: 'GravitationalAura' },
            { Ctor: PurpleLaserBeam, anim: DisintegrateCollision, key: 'PurpleLaserBeam' },
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

    describe('PurpleThunder collision positioning', () => {
        beforeEach(() => {
            PurpleThunderCollision.mockClear();
        });

        test('collisionAnimationBasedOnEnemy uses enemy center X and player center Y for PurpleThunder', () => {
            const enemy = new PurpleThunder();
            enemy.x = 200;
            enemy.y = 50;
            enemy.width = 40;
            enemy.height = 80;

            player.x = 10;
            player.y = 100;
            player.width = 100;
            player.height = 60;

            player.collisionLogic.collisionAnimationBasedOnEnemy(enemy);

            expect(PurpleThunderCollision).toHaveBeenCalled();

            const [argGame, argX, argY] = PurpleThunderCollision.mock.calls[0];
            const expectedX = enemy.x + enemy.width * 0.5;
            const expectedY = player.y + player.height * 0.5;

            expect(argGame).toBe(game);
            expect(argX).toBeCloseTo(expectedX);
            expect(argY).toBeCloseTo(expectedY);
        });

        test('fireball collision with PurpleThunder uses enemy center X and fireball center Y', () => {
            const enemy = new PurpleThunder();
            enemy.x = 100;
            enemy.y = 200;
            enemy.width = 40;
            enemy.height = 40;
            enemy.lives = 2;

            game.enemies = [enemy];

            const fb = new Fireball();
            Object.assign(fb, {
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                size: 20,
                type: 'normalMode',
                markedForDeletion: false,
            });

            game.behindPlayerParticles = [fb];

            player.x = 50;
            player.y = 300;
            player.width = 100;
            player.height = 60;

            player.collisionWithEnemies(0);

            expect(PurpleThunderCollision).toHaveBeenCalled();

            const [argGame, argX, argY] = PurpleThunderCollision.mock.calls[0];

            const expectedX = enemy.x + enemy.width * 0.5;
            const expectedY = fb.y + fb.size * 0.5;

            expect(argGame).toBe(game);
            expect(argX).toBeCloseTo(expectedX);
            expect(argY).toBeCloseTo(expectedY);
        });
    });

    describe('collisionAnimationBasedOnEnemy all branches', () => {
        it.each([
            [Sluggie, InkSplashCollision],
            [Garry, InkSplashCollision],
            [InkBeam, InkSplashCollision],
            [InkBomb, InkBombCollision],
            [Skulnap, ExplosionCollisionAnimation],
            [ElectricWheel, ElectricityCollision],
            [PoisonSpit, PoisonSpitSplash],
            [PoisonDrop, PoisonDropCollision],
            [PurpleFireball, PurpleFireballCollision],
            [MeteorAttack, MeteorExplosionCollision],
            [PurpleThunder, PurpleThunderCollision],
            [GhostElyvorg, GhostFadeOut],
            [GravitationalAura, DarkExplosionCollision],
            [PurpleLaserBeam, DisintegrateCollision],
        ])('enemy %p pushes %p', (EnemyCtor, anim) => {
            const e = new EnemyCtor();
            e.x = 0; e.y = 0; e.width = 10; e.height = 10;
            player.collisionLogic.collisionAnimationBasedOnEnemy(e);
            expect(anim).toHaveBeenCalled();
        });
    });

    describe('fireballAbility energyReachedZero blocks spawn', () => {
        beforeEach(() => Fireball.mockClear());
        test('does not fire when energyReachedZero', () => {
            player.energyReachedZero = true;
            player.fireballTimer = player.fireballCooldown;
            game.input.isFireballAttack.mockReturnValue(true);
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
            getContext: jest.fn(() => ({})),
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
            player.collisionLogic.collisionAnimationFollowsEnemy(enemy);
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

    describe('ice movement (applyIceMovementExact)', () => {
        beforeEach(() => {
            player.isIce = true;
            player.currentState = player.states[1]; // running
            player.x = 100;
            player.vx = 0;
            player.maxSpeed = 10;
        });

        test('accelerates on ice when holding right and clamps speed', () => {
            for (let i = 0; i < 10; i++) {
                player.playerHorizontalMovement({ d: true }, 16);
            }
            expect(player.vx).toBeGreaterThan(0);
            expect(player.vx).toBeLessThanOrEqual(player.maxSpeed);
            expect(player.x).toBeGreaterThan(100);
        });

        test('slides (decays) when released and respects bounds', () => {
            for (let i = 0; i < 10; i++) player.playerHorizontalMovement({ d: true }, 16);
            const vAfterAccel = player.vx;

            player.playerHorizontalMovement({}, 16);
            expect(player.vx).toBeLessThan(vAfterAccel);
            expect(player.vx).toBeGreaterThanOrEqual(0);

            player.x = -5;
            player.vx = -2;
            player.playerHorizontalMovement({}, 16);
            expect(player.x).toBe(0);
            expect(player.vx).toBe(0);

            player.x = game.width - player.width + 10;
            player.vx = 5;
            player.playerHorizontalMovement({}, 16);
            expect(player.x).toBe(game.width - player.width);
            expect(player.vx).toBe(0);
        });
    });

    describe('fireballAbility y-offset when sitting', () => {
        beforeEach(() => {
            Fireball.mockClear();
            player.fireballTimer = player.fireballCooldown;
            player.currentState = player.states[0]; // sitting
            game.cabin.isFullyVisible = false;
            player.isRedPotionActive = false;
            player.isUnderwater = false;
        });

        test('adds +15px y offset in Sitting state', () => {
            game.input.isFireballAttack.mockReturnValue(true);

            const baseY = player.y + player.height * 0.5;
            player.fireballAbility(game.input, 0);

            expect(Fireball).toHaveBeenCalledTimes(1);
            const call = Fireball.mock.calls[0];
            const yArg = call[2];
            expect(yArg).toBeCloseTo(baseY + 15);
        });
    });

    describe('handleFireballCollisionWithEnemy de-duplicates per enemy', () => {
        test('only first fireball affects enemy; second is ignored', () => {
            const enemy = { id: 'dedup', x: 0, y: 0, width: 20, height: 20, lives: 2 };
            game.enemies = [enemy];

            const fb1 = new Fireball();
            Object.assign(fb1, { x: 5, y: 5, size: 10, type: 'normalMode', markedForDeletion: false });

            const fb2 = new Fireball();
            Object.assign(fb2, { x: 6, y: 6, size: 10, type: 'normalMode', markedForDeletion: false });

            game.behindPlayerParticles = [fb1, fb2];

            player.currentState = player.states[8]; // standing
            player.isInvisible = false;

            player.collisionWithEnemies(0);

            expect(enemy.lives).toBe(1);

            expect(fb1.markedForDeletion).toBe(true);
            expect(fb2.markedForDeletion).not.toBe(true);
        });
    });

    describe('playerSFXAudios underwater rolling variant', () => {
        test('uses rollingUnderwaterSFX when underwater', () => {
            player.currentState = player.states[4]; // rolling
            player.isUnderwater = true;
            player.isRolling = false;

            player.playerSFXAudios();

            expect(game.audioHandler.firedogSFX.playSound)
                .toHaveBeenCalledWith('rollingUnderwaterSFX', true, true);
            expect(player.isRolling).toBe(true);
        });
    });

    describe('firedogMeetsElyvorg facingLeft branch', () => {
        beforeEach(() => {
            const e = new Elyvorg();
            e.x = player.x - 200;
            e.width = 50;
            game.enemies = [e];

            game.isBossVisible = true;
            game.boss.current = e;

            player.facingRight = false;
            player.facingLeft = true;
            player.currentState = player.states[4]; // rolling
        });

        test('when facingLeft, pressing right moves player right (mirrored logic)', () => {
            player.x = 50;
            player.firedogMeetsElyvorg(['d']);
            expect(player.x).toBe(56);
        });

        test('when facingLeft and not pressing, roll+no LR keeps position', () => {
            player.x = 100;
            game.input.isRollAttack.mockReturnValue(true);
            player.firedogMeetsElyvorg([]);
            expect(player.x).toBe(100);
        });
    });


    describe('freezing and startFrozen/updateFrozen/clearFreeze', () => {
        beforeEach(() => {
            player.currentState = { deathAnimation: false };
        });

        test('startFrozen enters frozen state and switches to Hit', () => {
            player.states[7] = { enter: jest.fn(), deathAnimation: false };
            player.currentState = player.states[1]; // running
            player.speed = 5;
            player.vx = 3;
            player.vy = -2;
            game.input.keys = ['a', 'd'];

            player.startFrozen(3000);

            expect(player.isFrozen).toBe(true);
            expect(player.frozenTimer).toBe(3000);
            expect(player.currentState).toBe(player.states[7]);
            expect(player.speed).toBe(0);
            expect(player.vx).toBe(0);
            expect(player.vy).toBe(0);
            expect(game.input.keys).toEqual([]);
        });

        test('updateFrozen keeps game speed at 0 and counts down while frozen', () => {
            player.isFrozen = true;
            player.frozenTimer = 1000;
            game.speed = 6;

            player.updateFrozen(200);

            expect(player.isFrozen).toBe(true);
            expect(player.frozenTimer).toBe(800);
            expect(game.speed).toBe(0);
        });

        test('updateFrozen unfreezes and clears keys when timer expires', () => {
            player.isFrozen = true;
            player.frozenTimer = 10;
            game.input.keys = ['x'];

            player.updateFrozen(15);

            expect(player.isFrozen).toBe(false);
            expect(player.frozenTimer).toBe(0);
            expect(game.input.keys).toEqual([]);
        });

        test('clearFreeze resets freeze flags and input keys', () => {
            player.isFrozen = true;
            player.frozenTimer = 123;
            game.input.keys = ['x'];

            player.clearFreeze();

            expect(player.isFrozen).toBe(false);
            expect(player.frozenTimer).toBe(0);
            expect(game.input.keys).toEqual([]);
        });

        test('checkIfFiredogIsDead clears freeze when gameOver is already true', () => {
            game.gameOver = true;
            player.isFrozen = true;
            player.frozenTimer = 500;
            game.input.keys = ['left'];
            player.currentState = { deathAnimation: false };

            player.checkIfFiredogIsDead();

            expect(player.isFrozen).toBe(false);
            expect(player.frozenTimer).toBe(0);
            expect(game.input.keys).toEqual([]);
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
                isFireballAttack: jest.fn().mockReturnValue(false),
                isInvisibleDefense: jest.fn().mockReturnValue(false),
                isRollAttack: jest.fn().mockReturnValue(false),
                keys: []
            },
            cabin: { isFullyVisible: false },
            debug: false,

            boss: {
                id: 'elyvorg',
                current: null,
                talkToBoss: false,
            },
            bossInFight: false,
            isBossVisible: false,

            time: 0,
            maxTime: 10000,
            noDamageDuringTutorial: false,
            selectedDifficulty: 'Easy',
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
                collisionSFX: { playSound: jest.fn() },
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
        expect(game.particles.length).toBe(2);
    });

    test('when ONLY poisoned: may skip spawn (non-spawn case)', () => {
        player.isPoisonedActive = true;
        player.isSlowed = false;
        Math.random = jest.fn().mockReturnValue(0.9);

        player.emitStatusParticles(player.statusFxInterval);

        expect(PoisonBubbles).not.toHaveBeenCalled();
        expect(IceCrystalBubbles).not.toHaveBeenCalled();
        expect(game.particles.length).toBe(1);
    });

    test('when ONLY slowed: always spawns IceCrystalBubbles', () => {
        player.isPoisonedActive = false;
        player.isSlowed = true;
        Math.random = jest.fn().mockReturnValue(0.123);

        player.emitStatusParticles(player.statusFxInterval);

        expect(IceCrystalBubbles).toHaveBeenCalledTimes(1);
        expect(PoisonBubbles).not.toHaveBeenCalled();
        expect(game.particles.length).toBe(2);
    });

    test('when NEITHER slowed nor poisoned: spawns nothing', () => {
        player.isPoisonedActive = false;
        player.isSlowed = false;

        player.emitStatusParticles(player.statusFxInterval);

        expect(PoisonBubbles).not.toHaveBeenCalled();
        expect(IceCrystalBubbles).not.toHaveBeenCalled();
        expect(game.particles.length).toBe(1);
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

    describe('confuse logic', () => {
        const MOVES = ['jump', 'moveBackward', 'sit', 'moveForward'];
        const diffCount = (before, after) =>
            MOVES.reduce((n, a) => n + ((before[a] ?? null) !== (after[a] ?? null) ? 1 : 0), 0);
        const multiset = obj => MOVES.map(k => obj[k] ?? null).sort();
        const makeWASD = () => ({
            jump: 'w', moveBackward: 'a', sit: 's', moveForward: 'd',
            rollAttack: 'Enter', diveAttack: 's', fireballAttack: 'q', invisibleDefense: 'e',
        });

        test('normal WASD preserves multiset and changes ≥2 positions; non-movement keys untouched', () => {
            game.keyBindings = makeWASD();
            const base = { ...game.keyBindings };

            player.activateConfuse();

            expect(player.isConfused).toBe(true);
            expect(player.confuseTimer).toBe(player.confuseDuration);

            const after = player.confusedKeyBindings;
            expect(multiset(after)).toEqual(multiset(base));
            expect(diffCount(base, after)).toBeGreaterThanOrEqual(2);

            expect(after.rollAttack).toBe(base.rollAttack);
            expect(after.diveAttack).toBe(base.diveAttack);
            expect(after.fireballAttack).toBe(base.fireballAttack);
            expect(after.invisibleDefense).toBe(base.invisibleDefense);
        });

        test('adversarial RNG (identity shuffles) fallback still enforces ≥2 diffs', () => {
            game.keyBindings = makeWASD();
            const base = { ...game.keyBindings };
            const origRandom = Math.random;

            Math.random = jest.fn(() => 0.999999);

            try {
                player.activateConfuse();
            } finally {
                Math.random = origRandom;
            }

            const after = player.confusedKeyBindings;
            expect(multiset(after)).toEqual(multiset(base));
            expect(diffCount(base, after)).toBeGreaterThanOrEqual(2);
        });

        test('only moveForward bound (others null) still ≥2 diffs; multiset preserved', () => {
            game.keyBindings = { jump: null, moveBackward: null, sit: null, moveForward: 'd' };
            const base = { ...game.keyBindings };

            player.activateConfuse();

            const after = player.confusedKeyBindings;
            expect(multiset(after)).toEqual(multiset(base));
            expect(diffCount(base, after)).toBeGreaterThanOrEqual(2);
        });

        test('all null movement keys activates safely; all remain null', () => {
            game.keyBindings = { jump: null, moveBackward: null, sit: null, moveForward: null };

            expect(() => player.activateConfuse()).not.toThrow();

            const after = player.confusedKeyBindings;
            expect(MOVES.every(k => after[k] === null)).toBe(true);
            expect(player.isConfused).toBe(true);
        });

        test('tutorial map uses _defaultKeyBindings as base', () => {
            game.isTutorialActive = true;
            game.currentMap = 'Map1';

            game._defaultKeyBindings = makeWASD();
            game.keyBindings = {
                jump: 'ArrowUp', moveBackward: 'ArrowLeft', sit: 'ArrowDown', moveForward: 'ArrowRight',
                rollAttack: 'Enter', diveAttack: 's', fireballAttack: 'q', invisibleDefense: 'e',
            };

            const baseTutorial = { ...game._defaultKeyBindings };
            player.activateConfuse();

            const after = player.confusedKeyBindings;
            expect(multiset(after)).toEqual(multiset(baseTutorial));
            expect(diffCount(baseTutorial, after)).toBeGreaterThanOrEqual(2);
        });

        test('updateConfuse counts down and clears state when timer elapses', () => {
            game.keyBindings = makeWASD();
            player.activateConfuse();

            expect(player.isConfused).toBe(true);
            expect(player.confusedKeyBindings).toBeTruthy();

            player.updateConfuse(player.confuseDuration - 1);
            expect(player.isConfused).toBe(true);
            expect(player.confusedKeyBindings).toBeTruthy();

            player.updateConfuse(2);
            expect(player.isConfused).toBe(false);
            expect(player.confusedKeyBindings).toBeNull();
        });

        test('repeated activations always ≥2 diffs and multiset preserved', () => {
            game.keyBindings = makeWASD();
            const base = { ...game.keyBindings };

            for (let i = 0; i < 25; i++) {
                player.activateConfuse();
                const after = player.confusedKeyBindings;

                expect(diffCount(base, after)).toBeGreaterThanOrEqual(2);
                expect(multiset(after)).toEqual(multiset(base));

                player.updateConfuse(player.confuseDuration + 1);
            }
        });

        test('does not mutate the original keyBindings object', () => {
            game.keyBindings = makeWASD();
            const snapshot = JSON.parse(JSON.stringify(game.keyBindings));

            player.activateConfuse();

            expect(game.keyBindings).toEqual(snapshot);
        });
    });
});
