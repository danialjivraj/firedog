import { Player } from '../../game/entities/player';
import { Fireball, PoisonBubbles, IceCrystalBubbles } from '../../game/animations/particles';

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
    Dashing: jest.fn().mockImplementation(() => ({})),
}));

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
    class EnemyBoss { }
    return { EnemyBoss };
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

    return { Elyvorg };
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

            boss: { id: 'elyvorg', current: null, talkToBoss: false },
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
    });

    test('constructs with expected defaults', () => {
        expect(player.width).toBe(100);
        expect(player.height).toBeCloseTo(91.3);
        expect(player.x).toBe(0);
        expect(player.y).toBe(game.height - player.height - game.groundMargin);
        expect(player.energy).toBe(100);
        expect(player.states).toHaveLength(11);
    });

    test('firedogLivesLimit caps lives at maxLives', () => {
        game.lives = 99;
        player.firedogLivesLimit();
        expect(game.lives).toBe(game.maxLives);
    });

    test('isPoisonActiveChecker & isPoisonTimerChecker behavior', () => {
        const logic = player.collisionLogic;

        player.energyReachedZero = true;
        player.isBluePotionActive = false;

        expect(logic.isPoisonActiveChecker(player)).toBe(false);
        expect(logic.isPoisonTimerChecker(2500, player)).toBe(0);
        expect(player.poisonTimer).toBe(0);

        player.energyReachedZero = false;

        expect(logic.isPoisonActiveChecker(player)).toBe(true);
        expect(logic.isPoisonTimerChecker(2500, player)).toBe(2500);
        expect(player.poisonTimer).toBe(2500);
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
        test('activation when timer full', () => {
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
            player.invisibleActiveCooldownTimer = player.invisibleDuration;
            player.invisibleTimer = player.invisibleCooldown;
            player.currentState = { deathAnimation: false };

            player.invisibleAbility(game.input, 0);

            expect(player.isInvisible).toBe(true);
            expect(player.invisibleActiveCooldownTimer).toBe(5000);

            player.invisibleAbility(game.input, 6000);

            expect(player.isInvisible).toBe(false);
            expect(player.invisibleActiveCooldownTimer).toBe(0);
            expect(player.invisibleTimer).toBe(0);

            expect(game.audioHandler.firedogSFX.playSound).toHaveBeenCalledWith('invisibleOutSFX');
        });
    });

    describe('dash ability', () => {
        let game, player;

        const makeInput = () => ({
            isDashAttack: jest.fn().mockReturnValue(false),
            keys: [],
            isActionActive: (binding, input) => {
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
                    default:
                        return false;
                }
            },
        });

        beforeEach(() => {
            game = {
                width: 1920,
                height: 689,
                groundMargin: 50,

                normalSpeed: 6,
                speed: 6,

                gameOver: false,
                isBossVisible: false,

                cabin: { isFullyVisible: false },
                boss: { current: null, talkToBoss: false },

                input: makeInput(),

                audioHandler: {
                    firedogSFX: { playSound: jest.fn(), stopSound: jest.fn() },
                },

                menu: { skins: { currentSkin: null } },

                particles: [],
                behindPlayerParticles: [],
                collisions: [],
                enemies: [],
                powerUps: [],
                powerDowns: [],
                coins: 0,
                lives: 3,
                maxLives: 5,
            };

            player = new Player(game);
            game.player = player;

            player.states = player.states.map(() => ({
                enter: jest.fn(),
                deathAnimation: false,
                handleInput: jest.fn(),
            }));
            player.currentState = player.states[8];

            player.dashTimer = player.dashCooldown;
            player.dashBetweenTimer = player.dashBetweenCooldown;
            player.dashCharges = player.dashMaxCharges;

            player.facingRight = true;
            player.facingLeft = false;
        });

        test('tryStartDash: first dash starts, consumes 1 charge, sets awaitingSecond window, applies energy cost, sets dashVelocity', () => {
            game.input.isDashAttack.mockReturnValue(true);

            const e0 = player.energy;
            const ok = player.tryStartDash(['d']);

            expect(ok).toBe(true);
            expect(player.isDashing).toBe(true);
            expect(player.dashTimeLeft).toBe(player.dashDuration);

            expect(player.dashCharges).toBe(1);
            expect(player.dashAwaitingSecond).toBe(true);
            expect(player.dashSecondWindowTimer).toBe(player.dashSecondWindowMs);
            expect(player.dashBetweenTimer).toBe(0);

            expect(player.energy).toBe(e0 - player.dashEnergyCost);

            const baseDash = player.maxSpeed * player.dashSpeedMultiplier;
            expect(player.dashVelocity).toBeCloseTo(baseDash);

            expect(player.currentState).toBe(player.states[10]);
            expect(game.speed).toBe(game.normalSpeed * 3);
        });

        test('tryStartDash: direction defaults to facing when no left/right input held', () => {
            game.input.isDashAttack.mockReturnValue(true);

            player.facingRight = false;
            player.facingLeft = true;

            player.tryStartDash([]);

            const baseDash = player.maxSpeed * player.dashSpeedMultiplier;
            expect(player.dashVelocity).toBeCloseTo(-baseDash);
        });

        test('tryStartDash: second dash uses multiplier and starts long cooldown', () => {
            game.input.isDashAttack.mockReturnValue(true);

            player.tryStartDash(['d']);
            expect(player.dashCharges).toBe(1);

            player.isDashing = false;
            player.currentState = player.states[8];
            player.dashBetweenTimer = player.dashBetweenCooldown;

            player.tryStartDash(['d']);

            expect(player.dashCharges).toBe(0);
            expect(player.dashAwaitingSecond).toBe(false);
            expect(player.dashSecondWindowTimer).toBe(0);
            expect(player.dashTimer).toBe(0);

            const baseDash = player.maxSpeed * player.dashSpeedMultiplier;
            expect(player.dashVelocity).toBeCloseTo(baseDash * player.secondDashDistanceMultiplier);
        });

        test('tryStartDash: blocked by gating conditions', () => {
            game.input.isDashAttack.mockReturnValue(true);

            game.gameOver = true;
            expect(player.tryStartDash(['d'])).toBe(false);
            game.gameOver = false;

            player.isFrozen = true;
            expect(player.tryStartDash(['d'])).toBe(false);
            player.isFrozen = false;

            player.isDashing = true;
            expect(player.tryStartDash(['d'])).toBe(false);
            player.isDashing = false;

            player.energyReachedZero = true;
            expect(player.tryStartDash(['d'])).toBe(false);
            player.energyReachedZero = false;

            player.dashTimer = player.dashCooldown - 1;
            expect(player.tryStartDash(['d'])).toBe(false);
            player.dashTimer = player.dashCooldown;

            player.dashCharges = 0;
            expect(player.tryStartDash(['d'])).toBe(false);
            player.dashCharges = player.dashMaxCharges;

            player.dashBetweenTimer = player.dashBetweenCooldown - 1;
            expect(player.tryStartDash(['d'])).toBe(false);
            player.dashBetweenTimer = player.dashBetweenCooldown;

            player.currentState = player.states[6];
            expect(player.tryStartDash(['d'])).toBe(false);

            player.currentState = player.states[7];
            expect(player.tryStartDash(['d'])).toBe(false);
        });

        test('dashAbility: countdown ends dash and clears velocity', () => {
            player.isDashing = true;
            player.dashTimeLeft = 10;
            player.dashVelocity = 123;

            player.dashAbility(20);

            expect(player.isDashing).toBe(false);
            expect(player.dashTimeLeft).toBe(0);
            expect(player.dashVelocity).toBe(0);
            expect(player.dashGhostTimer).toBe(0);
        });

        test('dashAbility: second-dash window expiry forces long cooldown (charges=0) and cooldown starts counting immediately', () => {
            player.dashAwaitingSecond = true;
            player.dashSecondWindowTimer = 5;
            player.dashCharges = 1;
            player.dashTimer = player.dashCooldown;

            player.dashAbility(10);

            expect(player.dashAwaitingSecond).toBe(false);
            expect(player.dashSecondWindowTimer).toBe(0);
            expect(player.dashCharges).toBe(0);

            expect(player.dashTimer).toBe(10);
        });

        test('dashAbility: long cooldown refills charges when complete', () => {
            player.dashTimer = 0;
            player.dashCharges = 0;
            player.dashAwaitingSecond = true;
            player.dashSecondWindowTimer = 999;

            player.dashAbility(player.dashCooldown);

            expect(player.dashTimer).toBe(player.dashCooldown);
            expect(player.dashCharges).toBe(player.dashMaxCharges);
            expect(player.dashAwaitingSecond).toBe(false);
            expect(player.dashSecondWindowTimer).toBe(0);
        });

        test('playerHorizontalMovement: while dashing, x moves by dashVelocity and clamps to bounds', () => {
            player.isDashing = true;
            player.dashVelocity = 500;

            player.x = 100;
            player.playerHorizontalMovement([], 16);
            expect(player.x).toBe(600);
            expect(player.speed).toBe(500);
            expect(player.vx).toBe(500);

            player.x = game.width - player.width - 10;
            player.playerHorizontalMovement([], 16);
            expect(player.x).toBe(game.width - player.width);

            player.dashVelocity = -9999;
            player.x = 5;
            player.playerHorizontalMovement([], 16);
            expect(player.x).toBe(0);
        });

        test('tryStartDash: if energy drops to 0, energyReachedZero becomes true', () => {
            game.input.isDashAttack.mockReturnValue(true);
            player.energy = player.dashEnergyCost;

            player.tryStartDash(['d']);

            expect(player.energy).toBe(0);
            expect(player.energyReachedZero).toBe(true);
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

        test('underwater rolling uses rollingUnderwaterSFX', () => {
            player.currentState = player.states[4];
            player.isUnderwater = true;
            player.isRolling = false;

            player.playerSFXAudios();

            expect(game.audioHandler.firedogSFX.playSound)
                .toHaveBeenCalledWith('rollingUnderwaterSFX', true, true);
            expect(player.isRolling).toBe(true);
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
        ];

        const slowedSpy = jest.spyOn(player, 'checkIfFiredogIsSlowed');

        player.update([], 16);

        notCalled.forEach(spy => expect(spy).not.toHaveBeenCalled());
        expect(slowedSpy).toHaveBeenCalledWith(16);
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

    describe('update() smoke test', () => {
        it('calls all major subsystems when alive', () => {
            jest.spyOn(player, 'energyLogic');
            jest.spyOn(player, 'fireballAbility');
            jest.spyOn(player, 'invisibleAbility');
            jest.spyOn(player, 'playerSFXAudios');
            jest.spyOn(player, 'spriteAnimation');
            jest.spyOn(player, 'playerHorizontalMovement');
            jest.spyOn(player, 'playerVerticalMovement');

            player.currentState = { deathAnimation: false, handleInput: jest.fn() };
            player.update([], 16);

            expect(player.energyLogic).toHaveBeenCalled();
            expect(player.fireballAbility).toHaveBeenCalled();
            expect(player.invisibleAbility).toHaveBeenCalled();
            expect(player.playerSFXAudios).toHaveBeenCalled();
            expect(player.spriteAnimation).toHaveBeenCalled();
            expect(player.playerHorizontalMovement).toHaveBeenCalled();
            expect(player.playerVerticalMovement).toHaveBeenCalled();
        });
    });

    describe('ice movement (applyIceMovementExact)', () => {
        beforeEach(() => {
            player.isIce = true;
            player.currentState = player.states[1];
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
            player.currentState = player.states[0];
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

    describe('freezing and startFrozen/updateFrozen/clearFreeze', () => {
        beforeEach(() => {
            player.currentState = { deathAnimation: false };
        });

        test('startFrozen enters frozen state and switches to Hit', () => {
            player.states[7] = { enter: jest.fn(), deathAnimation: false };
            player.currentState = player.states[1];
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

    describe('clearAllStatusEffects', () => {
        test('resets all status flags/timers, restores base stats, clears movement + input keys', () => {
            player.isFrozen = true;
            player.frozenTimer = 999;
            player.frozenPulseTimer = 123;
            player.frozenOpacity = 0.5;

            player.isPoisonedActive = true;
            player.poisonTimer = 888;
            player.energyReachedZero = true;

            player.isSlowed = true;
            player.slowedTimer = 777;

            player.isConfused = true;
            player.confuseTimer = 666;
            player.confusedKeyBindings = { jump: 'x' };

            player.isBluePotionActive = true;
            player.blueFireTimer = 555;

            player.isRedPotionActive = true;
            player.redPotionTimer = 444;

            player.isInvisible = true;
            player.invisibleActiveCooldownTimer = 333;
            player.invisibleTimer = 0;

            player.isBlackHoleActive = true;

            player.energy = 150;
            player.energyInterval = 999;
            player.noEnergyLeftSound = true;

            player.normalSpeed = 1;
            player.maxSpeed = 2;
            player.weight = 9;

            player.speed = 12;
            player.vx = 8;
            player.vy = -7;

            game.input.keys = ['a', 'd'];

            player.clearAllStatusEffects();

            expect(player.isFrozen).toBe(false);
            expect(player.frozenTimer).toBe(0);
            expect(player.frozenPulseTimer).toBe(0);
            expect(player.frozenOpacity).toBe(0);

            expect(player.isPoisonedActive).toBe(false);
            expect(player.poisonTimer).toBe(0);
            expect(player.energyReachedZero).toBe(false);

            expect(player.isSlowed).toBe(false);
            expect(player.slowedTimer).toBe(0);

            expect(player.isConfused).toBe(false);
            expect(player.confuseTimer).toBe(0);
            expect(player.confusedKeyBindings).toBeNull();

            expect(player.isBluePotionActive).toBe(false);
            expect(player.blueFireTimer).toBe(0);
            expect(player.isRedPotionActive).toBe(false);
            expect(player.redPotionTimer).toBe(0);

            expect(player.isInvisible).toBe(false);
            expect(player.invisibleActiveCooldownTimer).toBe(0);
            expect(player.invisibleTimer).toBe(player.invisibleCooldown);

            expect(player.isBlackHoleActive).toBe(false);

            expect(player.energy).toBe(100);
            expect(player.energyInterval).toBe(100);
            expect(player.noEnergyLeftSound).toBe(false);

            expect(player.normalSpeed).toBe(player.baseNormalSpeed);
            expect(player.maxSpeed).toBe(player.baseMaxSpeed);
            expect(player.weight).toBe(player.baseWeight);

            expect(player.speed).toBe(0);
            expect(player.vx).toBe(0);
            expect(player.vy).toBe(0);

            expect(game.input.keys).toEqual([]);
        });

        test('when currentState is stunned or hit, it forces Standing via setState(8, 0)', () => {
            const spy = jest.spyOn(player, 'setState');

            player.currentState = player.states[6];
            player.clearAllStatusEffects();
            expect(spy).toHaveBeenCalledWith(8, 0);

            spy.mockClear();

            player.currentState = player.states[7];
            player.clearAllStatusEffects();
            expect(spy).toHaveBeenCalledWith(8, 0);
        });

        test('stops relevant SFX and removes status particles', () => {
            game.particles = [
                { constructor: { name: 'PoisonBubbles' } },
                { constructor: { name: 'IceCrystalBubbles' } },
                { constructor: { name: 'SpinningChicks' } },
                { constructor: { name: 'SomeOtherParticle' } },
            ];

            player.clearAllStatusEffects();

            expect(game.particles.map(p => p.constructor.name)).toEqual(['SomeOtherParticle']);

            const stop = game.audioHandler.firedogSFX.stopSound;
            expect(stop).toHaveBeenCalledWith('bluePotionEnergyGoingUp');
            expect(stop).toHaveBeenCalledWith('invisibleInSFX');
            expect(stop).toHaveBeenCalledWith('rollingSFX');
            expect(stop).toHaveBeenCalledWith('rollingUnderwaterSFX');
            expect(stop).toHaveBeenCalledWith('frozenSound');
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

            boss: { id: 'elyvorg', current: null, talkToBoss: false },
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
