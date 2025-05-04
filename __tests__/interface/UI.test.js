import { UI } from '../../game/interface/UI';
import { Elyvorg } from '../../game/entities/enemies/elyvorg';

global.timeTickingSound = 'timeTickingSound';

describe('UI', () => {
    let game, ui, ctx;

    beforeAll(() => {
        document.getElementById = jest.fn().mockReturnValue({});
    });

    beforeEach(() => {
        game = {
            width: 1920,
            height: 689,
            coins: 5,
            fontColor: 'white',

            mapSelected: {},
            background: { totalDistanceTraveled: 200 },
            maxDistance: 400,

            elyvorgInFight: false,
            enemies: [],

            player: {
                isUnderwater: false,
                energy: 10.5,
                isBluePotionActive: false,
                isPoisonedActive: false,
                energyReachedZero: false,
                onGround: () => true,

                divingTimer: 0,
                divingCooldown: 1000,

                fireballTimer: 0,
                fireballCooldown: 1000,
                isDarkWhiteBorder: false,
                redPotionTimer: 0,
                isRedPotionActive: false,

                invisibleTimer: 0,
                invisibleActiveCooldownTimer: 0,
                invisibleCooldown: 5000,
                isInvisible: false,

                blueFireTimer: 0,
            },

            time: 125000,
            maxTime: 60000,

            cabin: { isFullyVisible: false },
            gameOver: false,
            menu: { pause: { isPaused: false } },

            audioHandler: {
                mapSoundtrack: {
                    playSound: jest.fn(),
                    stopSound: jest.fn(),
                    pauseSound: jest.fn(),
                    resumeSound: jest.fn(),
                }
            },

            maxLives: 3,
            lives: 2,
        };

        ui = new UI(game);

        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            fill: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            arcTo: jest.fn(),
            closePath: jest.fn(),
            clip: jest.fn(),

            drawImage: jest.fn(),
            measureText: jest.fn(() => ({ width: 10 })),

            fillStyle: '',
            strokeStyle: '',
            font: '',
            textAlign: '',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: '',
            shadowBlur: 0,
            filter: '',
        };
    });

    describe('constructor', () => {
        test('hooks up UI images via getElementById', () => {
            expect(document.getElementById).toHaveBeenCalledWith('firedogHead');
            expect(document.getElementById).toHaveBeenCalledWith('fireballUI');
            expect(document.getElementById).toHaveBeenCalledWith('divingUI');
            expect(document.getElementById).toHaveBeenCalledWith('poisonUI');
            expect(document.getElementById).toHaveBeenCalledWith('electricWarningUI');
        });
    });

    describe('progressBar()', () => {
        test('draws percentage text and updates internal state', () => {
            ui.progressBar(ctx, 75, 375, 500, 'pink');
            expect(ctx.fillText).toHaveBeenCalledWith('75%', expect.any(Number), expect.any(Number));
            expect(ui.percentage).toBe(75);
            expect(ui.filledWidth).toBe(375);
            expect(ctx.fill).toHaveBeenCalled();
        });
    });

    describe('distanceBar()', () => {
        test('calls progressBar if mapSelected[6] is false', () => {
            game.mapSelected[6] = false;
            const spy = jest.spyOn(ui, 'progressBar');
            ui.distanceBar(ctx);
            expect(spy).toHaveBeenCalled();
        });
        test('skips if mapSelected[6] is true', () => {
            game.mapSelected[6] = true;
            const spy = jest.spyOn(ui, 'progressBar');
            ui.distanceBar(ctx);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('elyvorgHealthBar()', () => {
        test('skips when elyvorgInFight is false', () => {
            game.elyvorgInFight = false;
            const spy = jest.spyOn(ui, 'progressBar');
            ui.elyvorgHealthBar(ctx);
            expect(spy).not.toHaveBeenCalled();
        });
        test('renders when elyvorgInFight and enemy present', () => {
            game.elyvorgInFight = true;
            const e = new Elyvorg(game);
            e.lives = 4;
            e.livesDefeatedAt = 1;
            e.maxLives = 5;
            game.enemies = [e];
            const spy = jest.spyOn(ui, 'progressBar');
            ui.elyvorgHealthBar(ctx);
            expect(spy).toHaveBeenCalledWith(
                ctx,
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                'red'
            );
        });
        test('skips if no Elyvorg in enemies', () => {
            game.elyvorgInFight = true;
            game.enemies = [];
            const spy = jest.spyOn(ui, 'progressBar');
            ui.elyvorgHealthBar(ctx);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('energy()', () => {
        test('default branch: black text, white shadow when energy ≥ 20', () => {
            game.player.energy = 50;
            ui.energy(ctx);
            expect(ctx.fillStyle).toBe('black');
            expect(ctx.shadowColor).toBe('white');
            expect(ctx.fillText).toHaveBeenCalled();
        });
        test('poisoned branch', () => {
            game.player.isPoisonedActive = true;
            ui.energy(ctx);
            expect(ctx.fillStyle).toBe('darkgreen');
            expect(ctx.shadowColor).toBe('black');
        });
        test('low energy branch', () => {
            game.player.energy = 10;
            ui.energy(ctx);
            expect(ctx.shadowColor).toBe('gold');
        });
        test('zero energy branch', () => {
            game.player.energyReachedZero = true;
            ui.energy(ctx);
            expect(ctx.fillStyle).toBe('red');
        });
        test('blue potion shake branch', () => {
            game.player.isBluePotionActive = true;
            ui.energy(ctx);
            expect(ctx.fillText).toHaveBeenCalled();
        });
    });

    describe('timer()', () => {
        test('non-underwater: shows normal time and toggles stop/resume', () => {
            game.player.isUnderwater = false;
            game.time = 125000; // 2:05
            ui.timer(ctx);
            expect(ctx.fillText).toHaveBeenCalledWith('Time: 2:05', 20, 90);
            expect(game.audioHandler.mapSoundtrack.stopSound)
                .toHaveBeenCalledWith('timeTickingSound');
            expect(game.audioHandler.mapSoundtrack.resumeSound)
                .toHaveBeenCalledWith('timeTickingSound');
        });
        test('underwater < secondsLeft: plays ticking', () => {
            game.player.isUnderwater = true;
            game.maxTime = 70000;
            game.time = 65000; // remaining=5000 < 60000
            ui.timer(ctx);
            expect(ui.secondsLeftActivated).toBe(true);
            expect(game.audioHandler.mapSoundtrack.playSound)
                .toHaveBeenCalledWith('timeTickingSound', true);
        });
        test('underwater > secondsLeft: black on white', () => {
            game.player.isUnderwater = true;
            game.maxTime = 70000;
            game.time = 5000; // remaining=65000>60000
            ui.timer(ctx);
            expect(ctx.fillStyle).toBe('black');
            expect(ctx.shadowColor).toBe('white');
        });
        test('dynamic white‐flash branch', () => {
            game.player.isUnderwater = true;
            game.maxTime = 70000;
            // remaining = 30000; 30000%2000===0<1000
            game.time = 40000;
            ui.timer(ctx);
            expect(ctx.fillStyle).toBe('white');
        });
        test('pauseSound when menu paused', () => {
            game.player.isUnderwater = false;
            game.menu.pause.isPaused = true;
            ui.timer(ctx);
            expect(game.audioHandler.mapSoundtrack.pauseSound)
                .toHaveBeenCalledWith('timeTickingSound');
        });
        test('stopSound when cabin visible or gameOver', () => {
            game.player.isUnderwater = true;
            game.cabin.isFullyVisible = true;
            ui.timer(ctx);
            expect(game.audioHandler.mapSoundtrack.stopSound)
                .toHaveBeenCalledWith('timeTickingSound');
        });
        test('blue potion center‐screen countdown', () => {
            game.player.isBluePotionActive = true;
            game.player.blueFireTimer = 2500;
            ui.timer(ctx);
            expect(ctx.fillStyle).toBe('blue');
            expect(ctx.fillText).toHaveBeenCalledWith(
                expect.stringMatching(/2\.5/),
                expect.any(Number),
                expect.any(Number)
            );
        });
    });

    describe('firedogAbilityUI()', () => {
        test('diving grayscale + countdown on cooldown', () => {
            game.player.divingTimer = 500;
            game.player.divingCooldown = 1000;
            ui.firedogAbilityUI(ctx);
            expect(ctx.filter).toBe('grayscale(100%)');
            expect(ctx.drawImage).toHaveBeenCalled();
            expect(ctx.fillText).toHaveBeenCalled();
        });
        test('fireball gray‐out when on cooldown', () => {
            game.player.fireballTimer = 500;
            game.player.fireballCooldown = 1000;
            ui.firedogAbilityUI(ctx);
            expect(ctx.filter).toBe('grayscale(100%)');
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.fireballUI, expect.any(Number), expect.any(Number), 50, 50
            );
            expect(ctx.fillText).toHaveBeenCalled();
        });
        test('red‐potion branch', () => {
            game.player.isRedPotionActive = true;
            game.player.redPotionTimer = 5000;
            ui.firedogAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.fireballRedPotionUI, expect.any(Number), expect.any(Number), 50, 50
            );
        });
        test('darkWhiteBorder variant', () => {
            game.player.isDarkWhiteBorder = true;
            ui.firedogAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.divingUIWhiteBorder, expect.any(Number), expect.any(Number), 50, 50
            );
        });
        test('invisible cooldown when invisible', () => {
            game.player.invisibleTimer = 2000;
            game.player.invisibleActiveCooldownTimer = 3000;
            game.player.isInvisible = true;
            ui.firedogAbilityUI(ctx);
            expect(ctx.fillText).toHaveBeenCalled();
        });
    });

    describe('elyvorgAbilityUI()', () => {
        test('skips when not in fight', () => {
            game.elyvorgInFight = false;
            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).not.toHaveBeenCalled();
        });
        test('poison active branch', () => {
            game.elyvorgInFight = true;
            const e = new Elyvorg(game);
            e.isPoisonActive = true;
            e.poisonCooldown = 5000;
            e.poisonCooldownTimer = 2000;
            game.enemies = [e];
            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.poisonUI, expect.any(Number), 20, 65, 65
            );
            expect(ctx.strokeText).toHaveBeenCalled();
        });
        test('poison grayscale when no cooldown', () => {
            game.elyvorgInFight = true;
            const e = new Elyvorg(game);
            e.poisonCooldownTimer = 0;
            game.enemies = [e];
            ui.elyvorgAbilityUI(ctx);
            expect(ctx.filter).toBe('grayscale(100%)');
        });
        test('gravity active & countdown', () => {
            game.elyvorgInFight = true;
            const e = new Elyvorg(game);
            e.isGravitySpinnerActive = true;
            e.gravityCooldown = 5000;
            e.gravityCooldownTimer = 2000;
            game.enemies = [e];
            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.gravityUI, expect.any(Number), 20, 65, 65
            );
            expect(ctx.strokeText).toHaveBeenCalled();
        });
        test('gravity grayscale when no cooldown', () => {
            game.elyvorgInFight = true;
            const e = new Elyvorg(game);
            e.gravityCooldownTimer = 0;
            game.enemies = [e];
            ui.elyvorgAbilityUI(ctx);
            expect(ctx.filter).toBe('grayscale(100%)');
        });
        test('slashAttackOnce branch', () => {
            game.elyvorgInFight = true;
            const e = new Elyvorg(game);
            e.slashAttackOnce = true;
            game.enemies = [e];
            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.slashUI, expect.any(Number), 20, 65, 65
            );
        });
        test('slash warning branch', () => {
            game.elyvorgInFight = true;
            const e = new Elyvorg(game);
            e.slashAttackOnce = false;
            e.slashAttackStateCounterLimit = 5;
            e.slashAttackStateCounter = 4;
            game.enemies = [e];
            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.slashWarningUI, expect.any(Number), 20, 65, 65
            );
        });
        test('slash grayscale branch', () => {
            game.elyvorgInFight = true;
            const e = new Elyvorg(game);
            e.slashAttackOnce = false;
            e.slashAttackStateCounterLimit = 5;
            e.slashAttackStateCounter = 1;
            game.enemies = [e];
            ui.elyvorgAbilityUI(ctx);
            expect(ctx.filter).toBe('grayscale(100%)');
        });
        test('electric active branch', () => {
            game.elyvorgInFight = true;
            const e = new Elyvorg(game);
            e.isElectricWheelActive = true;
            game.enemies = [e];
            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.electricUI, expect.any(Number), 20, 65, 65
            );
        });
        test('electric warning branch', () => {
            game.elyvorgInFight = true;
            const e = new Elyvorg(game);
            e.isElectricWheelActive = false;
            e.electricWheelTimer = 2000;
            game.enemies = [e];
            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.electricWarningUI, expect.any(Number), 20, 65, 65
            );
        });
        test('electric grayscale branch', () => {
            game.elyvorgInFight = true;
            const e = new Elyvorg(game);
            e.isElectricWheelActive = false;
            e.electricWheelTimer = 0;
            game.enemies = [e];
            ui.elyvorgAbilityUI(ctx);
            expect(ctx.filter).toBe('grayscale(100%)');
        });
    });

    describe('draw()', () => {
        test('renders coins, bars, timer, energy, lives and abilities', () => {
            game.mapSelected[6] = false;
            game.elyvorgInFight = false;
            game.lives = 2;
            game.maxLives = 3;

            const spyDist = jest.spyOn(ui, 'distanceBar');
            const spyEBar = jest.spyOn(ui, 'elyvorgHealthBar');
            const spyTimer = jest.spyOn(ui, 'timer');
            const spyEnergy = jest.spyOn(ui, 'energy');

            ui.draw(ctx);

            expect(ctx.fillText).toHaveBeenCalledWith('Coins: 5', 20, 50);
            expect(spyDist).toHaveBeenCalledWith(ctx);
            expect(spyEBar).toHaveBeenCalledWith(ctx);
            expect(spyTimer).toHaveBeenCalledWith(ctx);
            expect(spyEnergy).toHaveBeenCalledWith(ctx);

            expect(ctx.drawImage).toHaveBeenCalledTimes(5);
        });
    });
});
