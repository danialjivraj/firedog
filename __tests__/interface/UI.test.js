import { UI } from '../../game/interface/UI';
import { Elyvorg } from '../../game/entities/enemies/elyvorg';

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

            currentMap: 'Map1',

            background: { totalDistanceTraveled: 200 },
            maxDistance: 400,

            bossInFight: false,
            boss: null,
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

            translate: jest.fn(),
            scale: jest.fn(),
        };
    });

    function createElyvorg(overrides = {}) {
        const enemy = Object.create(Elyvorg.prototype);
        Object.assign(enemy, overrides);
        return enemy;
    }

    function setBossElyvorg(overrides = {}) {
        const enemy = createElyvorg(overrides);
        game.boss = { current: enemy };
        game.enemies = [enemy];
        return enemy;
    }

    describe('constructor', () => {
        test('hooks up UI images via getElementById', () => {
            expect(document.getElementById).toHaveBeenCalledWith('firedogHead');
            expect(document.getElementById).toHaveBeenCalledWith('fireballUI');
            expect(document.getElementById).toHaveBeenCalledWith('divingUI');
            expect(document.getElementById).toHaveBeenCalledWith('poisonUI');
            expect(document.getElementById).toHaveBeenCalledWith('electricWarningUI');
        });
    });

    describe('draw()', () => {
        test('renders coins, bars, timer, energy, lives and ability UIs', () => {
            game.currentMap = 'Map1';
            game.bossInFight = false;
            game.lives = 2;
            game.maxLives = 3;

            const spyDist = jest.spyOn(ui, 'distanceBar');
            const spyBossBar = jest.spyOn(ui, 'bossHealthBar');
            const spyTimer = jest.spyOn(ui, 'timer');
            const spyEnergy = jest.spyOn(ui, 'energy');
            const spyFiredog = jest.spyOn(ui, 'firedogAbilityUI');
            const spyElyvorg = jest.spyOn(ui, 'elyvorgAbilityUI');

            ui.draw(ctx);

            expect(ctx.fillText).toHaveBeenCalledWith('Coins: 5', 20, 50);
            expect(spyDist).toHaveBeenCalledWith(ctx);
            expect(spyBossBar).toHaveBeenCalledWith(ctx);
            expect(spyTimer).toHaveBeenCalledWith(ctx);
            expect(spyEnergy).toHaveBeenCalledWith(ctx);
            expect(spyFiredog).toHaveBeenCalledWith(ctx);
            expect(spyElyvorg).toHaveBeenCalledWith(ctx);

            // 2 hearts + 3 firedog ability icons
            expect(ctx.drawImage).toHaveBeenCalledTimes(5);
        });
    });

    describe('lives rendering & blink behavior', () => {
        test('draws one heart icon per current life when there is no damage blink', () => {
            game.lives = 2;
            game.maxLives = 3;
            ui = new UI(game);

            ctx.drawImage.mockClear();

            ui.draw(ctx);

            const heartCalls = ctx.drawImage.mock.calls.filter(
                ([, , , w, h]) => w === 25 && h === 25
            );
            expect(heartCalls.length).toBe(2);
        });

        test('removes the last heart after the blink animation finishes when final life is lost', () => {
            game.lives = 1;
            game.maxLives = 3;
            ui = new UI(game);

            const timeSequence = [0, 100, 600];
            let index = 0;
            const getUiTimeSpy = jest
                .spyOn(ui, 'getUiTime')
                .mockImplementation(() => {
                    const value = timeSequence[index] ?? timeSequence[timeSequence.length - 1];
                    index += 1;
                    return value;
                });

            ctx.drawImage.mockClear();
            ui.draw(ctx);
            let heartCalls = ctx.drawImage.mock.calls.filter(
                ([, , , w, h]) => w === 25 && h === 25
            );
            expect(heartCalls.length).toBe(1);

            ctx.drawImage.mockClear();
            game.lives = 0;
            ui.draw(ctx);
            heartCalls = ctx.drawImage.mock.calls.filter(
                ([, , , w, h]) => w === 25 && h === 25
            );
            expect(heartCalls.length).toBe(1);

            ctx.drawImage.mockClear();
            ui.draw(ctx);
            heartCalls = ctx.drawImage.mock.calls.filter(
                ([, , , w, h]) => w === 25 && h === 25
            );
            expect(heartCalls.length).toBe(0);

            getUiTimeSpy.mockRestore();
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
        test('calls progressBar for a generic map (e.g. "Map1") when enabled', () => {
            game.currentMap = 'Map1';
            const spy = jest.spyOn(ui, 'progressBar');
            ui.distanceBar(ctx);
            expect(spy).toHaveBeenCalled();
        });

        test('still calls progressBar for "Map6" (no special-case skip)', () => {
            game.currentMap = 'Map6';
            const spy = jest.spyOn(ui, 'progressBar');
            ui.distanceBar(ctx);
            expect(spy).toHaveBeenCalled();
        });

        test('does nothing when a boss fight is active', () => {
            game.bossInFight = true;
            const spy = jest.spyOn(ui, 'progressBar');
            ui.distanceBar(ctx);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('bossHealthBar()', () => {
        test('skips when bossInFight is false', () => {
            game.bossInFight = false;
            game.boss = null;
            const spy = jest.spyOn(ui, 'progressBar');
            ui.bossHealthBar(ctx);
            expect(spy).not.toHaveBeenCalled();
        });

        test('renders health bar when in fight and boss is present', () => {
            game.bossInFight = true;
            game.boss = {
                current: {
                    lives: 4,
                    livesDefeatedAt: 1,
                    maxLives: 5,
                },
            };

            const spy = jest.spyOn(ui, 'progressBar');
            ui.bossHealthBar(ctx);
            expect(spy).toHaveBeenCalledWith(
                ctx,
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                'red'
            );
        });

        test('skips when there is no boss instance', () => {
            game.bossInFight = true;
            game.boss = { current: null };
            const spy = jest.spyOn(ui, 'progressBar');
            ui.bossHealthBar(ctx);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('energy()', () => {
        test('uses black text and white shadow when energy ≥ 20', () => {
            game.player.energy = 50;
            ui.energy(ctx);
            expect(ctx.fillStyle).toBe('black');
            expect(ctx.shadowColor).toBe('white');
            expect(ctx.fillText).toHaveBeenCalled();
        });

        test('uses darkgreen text and black shadow when poisoned', () => {
            game.player.isPoisonedActive = true;
            ui.energy(ctx);
            expect(ctx.fillStyle).toBe('darkgreen');
            expect(ctx.shadowColor).toBe('black');
        });

        test('uses gold shadow when energy is low but not zero', () => {
            game.player.energy = 10;
            ui.energy(ctx);
            expect(ctx.shadowColor).toBe('gold');
        });

        test('uses red text when energy has reached zero', () => {
            game.player.energyReachedZero = true;
            ui.energy(ctx);
            expect(ctx.fillStyle).toBe('red');
        });

        test('renders shaken energy text when blue potion is active', () => {
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

        test('underwater: remaining time below threshold plays ticking sound', () => {
            game.player.isUnderwater = true;
            game.maxTime = 70000;
            game.time = 65000; // remaining = 5000 < 60000
            ui.timer(ctx);
            expect(ui.secondsLeftActivated).toBe(true);
            expect(game.audioHandler.mapSoundtrack.playSound)
                .toHaveBeenCalledWith('timeTickingSound', true);
        });

        test('underwater: remaining time above threshold uses black on white', () => {
            game.player.isUnderwater = true;
            game.maxTime = 70000;
            game.time = 5000; // remaining = 65000 > 60000
            ui.timer(ctx);
            expect(ctx.fillStyle).toBe('black');
            expect(ctx.shadowColor).toBe('white');
        });

        test('underwater: dynamic white flash branch switches fillStyle to white', () => {
            game.player.isUnderwater = true;
            game.maxTime = 70000;
            // remaining = 30000; 30000 % 2000 === 0 < 1000
            game.time = 40000;
            ui.timer(ctx);
            expect(ctx.fillStyle).toBe('white');
        });

        test('pauses ticking sound when menu is paused', () => {
            game.player.isUnderwater = false;
            game.menu.pause.isPaused = true;
            ui.timer(ctx);
            expect(game.audioHandler.mapSoundtrack.pauseSound)
                .toHaveBeenCalledWith('timeTickingSound');
        });

        test('stops ticking sound when cabin is visible or game is over', () => {
            game.player.isUnderwater = true;
            game.cabin.isFullyVisible = true;
            ui.timer(ctx);
            expect(game.audioHandler.mapSoundtrack.stopSound)
                .toHaveBeenCalledWith('timeTickingSound');
        });

        test('shows blue potion center-screen countdown when active', () => {
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
        test('diving icon grayscale with countdown while on cooldown', () => {
            game.player.divingTimer = 500;
            game.player.divingCooldown = 1000;
            ui.firedogAbilityUI(ctx);
            expect(ctx.filter).toBe('grayscale(100%)');
            expect(ctx.drawImage).toHaveBeenCalled();
            expect(ctx.fillText).toHaveBeenCalled();
        });

        test('fireball icon gray-out with countdown while on cooldown', () => {
            game.player.fireballTimer = 500;
            game.player.fireballCooldown = 1000;
            ui.firedogAbilityUI(ctx);
            expect(ctx.filter).toBe('grayscale(100%)');
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.fireballUI, expect.any(Number), expect.any(Number), 50, 50
            );
            expect(ctx.fillText).toHaveBeenCalled();
        });

        test('renders red potion fireball image and countdown when active', () => {
            game.player.isRedPotionActive = true;
            game.player.redPotionTimer = 5000;
            ui.firedogAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.fireballRedPotionUI, expect.any(Number), expect.any(Number), 50, 50
            );
        });

        test('uses white-border variants when darkWhiteBorder flag is set', () => {
            game.player.isDarkWhiteBorder = true;
            ui.firedogAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.divingUIWhiteBorder, expect.any(Number), expect.any(Number), 50, 50
            );
        });

        test('shows invisible cooldown timer when invisible', () => {
            game.player.invisibleTimer = 2000;
            game.player.invisibleActiveCooldownTimer = 3000;
            game.player.isInvisible = true;
            ui.firedogAbilityUI(ctx);
            expect(ctx.fillText).toHaveBeenCalled();
        });
    });

    describe('elyvorgAbilityUI()', () => {
        test('skips drawing when not in Elyvorg fight', () => {
            game.bossInFight = false;
            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).not.toHaveBeenCalled();
        });

        test('poison ability: shows active icon and countdown during cooldown', () => {
            game.bossInFight = true;
            setBossElyvorg({
                isPoisonActive: true,
                poisonCooldown: 5000,
                poisonCooldownTimer: 2000,
            });

            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.poisonUI, expect.any(Number), 20, 65, 65
            );
            expect(ctx.strokeText).toHaveBeenCalled();
        });

        test('poison ability: grayscale icon when not on cooldown', () => {
            game.bossInFight = true;
            setBossElyvorg({
                poisonCooldownTimer: 0,
            });

            ui.elyvorgAbilityUI(ctx);
            expect(ctx.filter).toBe('grayscale(100%)');
        });

        test('gravity ability: shows active icon and countdown during cooldown', () => {
            game.bossInFight = true;
            setBossElyvorg({
                isGravitySpinnerActive: true,
                gravityCooldown: 5000,
                gravityCooldownTimer: 2000,
            });

            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.gravityUI, expect.any(Number), 20, 65, 65
            );
            expect(ctx.strokeText).toHaveBeenCalled();
        });

        test('gravity ability: grayscale icon when not on cooldown', () => {
            game.bossInFight = true;
            setBossElyvorg({
                gravityCooldownTimer: 0,
            });

            ui.elyvorgAbilityUI(ctx);
            expect(ctx.filter).toBe('grayscale(100%)');
        });

        test('slash ability: draws normal icon when first slash attack is ready', () => {
            game.bossInFight = true;
            setBossElyvorg({
                slashAttackOnce: true,
            });

            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.slashUI, expect.any(Number), 20, 65, 65
            );
        });

        test('slash ability: draws warning icon near attack threshold', () => {
            game.bossInFight = true;
            setBossElyvorg({
                slashAttackOnce: false,
                slashAttackStateCounterLimit: 5,
                slashAttackStateCounter: 4,
            });

            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.slashWarningUI, expect.any(Number), 20, 65, 65
            );
        });

        test('slash ability: grayscale icon when far from attack threshold', () => {
            game.bossInFight = true;
            setBossElyvorg({
                slashAttackOnce: false,
                slashAttackStateCounterLimit: 5,
                slashAttackStateCounter: 1,
            });

            ui.elyvorgAbilityUI(ctx);
            expect(ctx.filter).toBe('grayscale(100%)');
        });

        test('electric ability: draws active icon when wheel is active', () => {
            game.bossInFight = true;
            setBossElyvorg({
                isElectricWheelActive: true,
            });

            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.electricUI, expect.any(Number), 20, 65, 65
            );
        });

        test('electric ability: draws warning icon when wheel is charging', () => {
            game.bossInFight = true;
            setBossElyvorg({
                isElectricWheelActive: false,
                electricWheelTimer: 2000,
            });

            ui.elyvorgAbilityUI(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.electricWarningUI, expect.any(Number), 20, 65, 65
            );
        });

        test('electric ability: grayscale icon when wheel is inactive and not charging', () => {
            game.bossInFight = true;
            setBossElyvorg({
                isElectricWheelActive: false,
                electricWheelTimer: 0,
            });

            ui.elyvorgAbilityUI(ctx);
            expect(ctx.filter).toBe('grayscale(100%)');
        });
    });
});
