import { UI } from '../../game/interface/UI';

describe('UI', () => {
    let game;
    let ui;
    let ctx;

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
                },
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
            fillRect: jest.fn(),
            createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),

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
            quadraticCurveTo: jest.fn(),
        };
    });

    const setBoss = (currentBoss) => {
        game.boss = { current: currentBoss };
    };

    describe('constructor', () => {
        it('loads UI images by id from the DOM', () => {
            expect(document.getElementById).toHaveBeenCalledWith('firedogHead');

            expect(document.getElementById).toHaveBeenCalledWith('fireballUI');
            expect(document.getElementById).toHaveBeenCalledWith('fireballUIWhiteBorder');
            expect(document.getElementById).toHaveBeenCalledWith('fireballRedPotionUI');

            expect(document.getElementById).toHaveBeenCalledWith('divingUI');
            expect(document.getElementById).toHaveBeenCalledWith('divingUIWhiteBorder');

            expect(document.getElementById).toHaveBeenCalledWith('invisibleUI');
            expect(document.getElementById).toHaveBeenCalledWith('invisibleUIWhiteBorder');
        });
    });

    describe('getUiTime()', () => {
        it('on first call, initializes uiLastRealTime and returns uiTime unchanged', () => {
            const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000);

            ui.uiLastRealTime = null;
            ui.uiTime = 123;

            expect(ui.getUiTime()).toBe(123);
            expect(ui.uiLastRealTime).toBe(1000);
            expect(ui.uiTime).toBe(123);

            nowSpy.mockRestore();
        });

        it('advances uiTime when not paused', () => {
            const nowSpy = jest.spyOn(Date, 'now');
            ui.uiLastRealTime = 1000;
            ui.uiTime = 0;
            game.menu.pause.isPaused = false;

            nowSpy.mockReturnValue(1100);

            expect(ui.getUiTime()).toBe(100);
            expect(ui.uiTime).toBe(100);

            nowSpy.mockRestore();
        });

        it('does not advance uiTime while paused', () => {
            const nowSpy = jest.spyOn(Date, 'now');
            ui.uiLastRealTime = 2000;
            ui.uiTime = 50;
            game.menu.pause.isPaused = true;

            nowSpy.mockReturnValue(2200);

            expect(ui.getUiTime()).toBe(50);
            expect(ui.uiTime).toBe(50);

            nowSpy.mockRestore();
        });
    });

    describe('draw()', () => {
        it('renders top-level UI sections (coins, bars, timer, energy, lives, abilities)', () => {
            const spyDist = jest.spyOn(ui, 'distanceBar');
            const spyBossBar = jest.spyOn(ui, 'bossHealthBar');
            const spyTimer = jest.spyOn(ui, 'timer');
            const spyEnergy = jest.spyOn(ui, 'energy');
            const spyFiredog = jest.spyOn(ui, 'firedogAbilityUI');

            ui.draw(ctx);

            expect(ctx.fillText).toHaveBeenCalledWith('Coins: 5', 20, 50);
            expect(spyDist).toHaveBeenCalledWith(ctx);
            expect(spyBossBar).toHaveBeenCalledWith(ctx);
            expect(spyTimer).toHaveBeenCalledWith(ctx);
            expect(spyEnergy).toHaveBeenCalledWith(ctx);
            expect(spyFiredog).toHaveBeenCalledWith(ctx);

            // 2 hearts + 3 firedog ability icons
            expect(ctx.drawImage).toHaveBeenCalledTimes(5);
        });
    });

    describe('lives rendering', () => {
        const heartDrawCalls = () =>
            ctx.drawImage.mock.calls.filter(([, , , w, h]) => w === 25 && h === 25);

        it('draws one heart per life when not blinking', () => {
            game.lives = 2;
            game.maxLives = 3;
            ui = new UI(game);

            ctx.drawImage.mockClear();
            ui.draw(ctx);

            expect(heartDrawCalls()).toHaveLength(2);
        });

        it('keeps drawing the last lost heart during blink, then stops after blink ends', () => {
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
            expect(heartDrawCalls()).toHaveLength(1);

            ctx.drawImage.mockClear();
            game.lives = 0;
            ui.draw(ctx);
            expect(heartDrawCalls()).toHaveLength(1);

            ctx.drawImage.mockClear();
            ui.draw(ctx);
            expect(heartDrawCalls()).toHaveLength(0);

            getUiTimeSpy.mockRestore();
        });
    });

    describe('progressBar()', () => {
        it('renders percentage text and paints the bar', () => {
            ui.progressBar(ctx, 75, 375, 500, 'pink');

            expect(ctx.fillText).toHaveBeenCalledWith('75%', expect.any(Number), expect.any(Number));

            expect(ui.percentage).toBe(75);
            expect(ctx.fill).toHaveBeenCalled();
        });
    });

    describe('distanceBar()', () => {
        it('uses progressBar when not in a boss fight', () => {
            const spy = jest.spyOn(ui, 'progressBar');

            game.bossInFight = false;
            ui.distanceBar(ctx);

            expect(spy).toHaveBeenCalled();
        });

        it('does nothing when in a boss fight', () => {
            const spy = jest.spyOn(ui, 'progressBar');

            game.bossInFight = true;
            ui.distanceBar(ctx);

            expect(spy).not.toHaveBeenCalled();
        });

        it('draws a coins-progress stripe when a gate requires coins and player has some coins', () => {
            game.bossInFight = false;
            game.bossManager = {
                getGateForCurrentMap: jest.fn(() => ({
                    minDistance: 300,
                    minCoins: 1000,
                })),
            };
            game.coins = 1;

            ui.distanceBar(ctx);
            expect(ctx.fillStyle).toBe('orange');
            expect(ctx.fillRect).toHaveBeenCalled();
        });
    });

    describe('bossHealthBar()', () => {
        it('does nothing when bossInFight is false', () => {
            const spy = jest.spyOn(ui, 'progressBar');

            game.bossInFight = false;
            game.boss = null;
            ui.bossHealthBar(ctx);

            expect(spy).not.toHaveBeenCalled();
        });

        it('does nothing when boss state exists but current boss is null', () => {
            const spy = jest.spyOn(ui, 'progressBar');

            game.bossInFight = true;
            setBoss(null);

            ui.bossHealthBar(ctx);

            expect(spy).not.toHaveBeenCalled();
        });

        it('renders boss HP via progressBar when in fight and boss exists', () => {
            const spy = jest.spyOn(ui, 'progressBar');

            game.bossInFight = true;
            setBoss({ lives: 4, maxLives: 5 });

            ui.bossHealthBar(ctx);

            expect(spy).toHaveBeenCalledWith(
                ctx,
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                'red',
                0,
                'rgba(120, 120, 120, 0.9)'
            );
        });

        it('passes 0% and 0 filled width when boss has 0 lives', () => {
            const spy = jest.spyOn(ui, 'progressBar');

            game.bossInFight = true;
            setBoss({ lives: 0, maxLives: 10 });

            ui.bossHealthBar(ctx);

            expect(spy).toHaveBeenCalledWith(
                ctx,
                0,
                0,
                expect.any(Number),
                'red',
                0,
                'rgba(120, 120, 120, 0.9)'
            );
        });

        it('passes a non-zero overheal segment to progressBar when boss has overheal lives', () => {
            const spy = jest.spyOn(ui, 'progressBar');

            game.bossInFight = true;
            setBoss({
                maxLives: 10,
                lives: 12, // 2 lives into overheal
                overhealPercent: 0.5, // overheal cap = 15
            });

            ui.bossHealthBar(ctx);

            const [, , , , , overhealFilledWidth] = spy.mock.calls[0];
            expect(overhealFilledWidth).toBeGreaterThan(0);
        });

        it('clamps boss lives to the overheal cap when computing the overheal segment', () => {
            const spy = jest.spyOn(ui, 'progressBar');

            game.bossInFight = true;
            setBoss({
                maxLives: 10,
                lives: 999,
                overhealPercent: 0.5, // cap = 15 lives
            });

            ui.bossHealthBar(ctx);

            const [, , , , , overhealFilledWidth] = spy.mock.calls[0];
            expect(overhealFilledWidth).toBeLessThanOrEqual(ui.barWidth * 0.5);
        });
    });

    describe('energy()', () => {
        it('uses black text with white shadow when energy is not low/critical', () => {
            game.player.energy = 50;

            ui.energy(ctx);

            expect(ctx.fillStyle).toBe('black');
            expect(ctx.shadowColor).toBe('white');
            expect(ctx.fillText).toHaveBeenCalled();
        });

        it('uses darkgreen text with black shadow when poisoned', () => {
            game.player.isPoisonedActive = true;

            ui.energy(ctx);

            expect(ctx.fillStyle).toBe('darkgreen');
            expect(ctx.shadowColor).toBe('black');
        });

        it('uses gold shadow when energy is low but not zero', () => {
            game.player.energy = 10;

            ui.energy(ctx);

            expect(ctx.shadowColor).toBe('gold');
        });

        it('uses red text when energyReachedZero is true', () => {
            game.player.energyReachedZero = true;

            ui.energy(ctx);

            expect(ctx.fillStyle).toBe('red');
        });

        it('still renders energy text when blue potion is active (shake path)', () => {
            game.player.isBluePotionActive = true;

            ui.energy(ctx);

            expect(ctx.fillText).toHaveBeenCalled();
        });
    });

    describe('timer()', () => {
        it('non-underwater: renders elapsed time and stops ticking sound', () => {
            game.player.isUnderwater = false;
            game.time = 125000; // 2:05

            ui.timer(ctx);

            expect(ctx.fillText).toHaveBeenCalledWith('Time: 2:05', 20, 90);
            expect(game.audioHandler.mapSoundtrack.stopSound).toHaveBeenCalledWith(
                'timeTickingSound'
            );
            expect(game.audioHandler.mapSoundtrack.resumeSound).toHaveBeenCalledWith(
                'timeTickingSound'
            );
        });

        it('underwater: below threshold activates ticking sound', () => {
            game.player.isUnderwater = true;
            game.maxTime = 70000;
            game.time = 65000; // remaining = 5000 < 60000

            ui.timer(ctx);

            expect(ui.secondsLeftActivated).toBe(true);
            expect(game.audioHandler.mapSoundtrack.playSound).toHaveBeenCalledWith(
                'timeTickingSound',
                true
            );
        });

        it('underwater: above threshold uses black text with white shadow', () => {
            game.player.isUnderwater = true;
            game.maxTime = 70000;
            game.time = 5000; // remaining = 65000 > 60000

            ui.timer(ctx);

            expect(ctx.fillStyle).toBe('black');
            expect(ctx.shadowColor).toBe('white');
        });

        it('underwater: flashing branch can set fillStyle to white', () => {
            game.player.isUnderwater = true;
            game.maxTime = 70000;
            game.time = 40000; // remaining=30000, and 30000 % 2000 === 0

            ui.timer(ctx);

            expect(ctx.fillStyle).toBe('white');
        });

        it('underwater: when remaining time is 0 or less, timer styling is red', () => {
            game.player.isUnderwater = true;
            game.maxTime = 1000;
            game.time = 2000;

            ui.timer(ctx);

            expect(ctx.fillStyle).toBe('red');
        });

        it('pauses ticking sound when menu is paused', () => {
            game.player.isUnderwater = false;
            game.menu.pause.isPaused = true;

            ui.timer(ctx);

            expect(game.audioHandler.mapSoundtrack.pauseSound).toHaveBeenCalledWith(
                'timeTickingSound'
            );
        });

        it('stops ticking sound when cabin is visible', () => {
            game.player.isUnderwater = true;
            game.cabin.isFullyVisible = true;

            ui.timer(ctx);

            expect(game.audioHandler.mapSoundtrack.stopSound).toHaveBeenCalledWith(
                'timeTickingSound'
            );
        });

        it('renders blue potion center countdown when blue potion is active', () => {
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
        it('shows diving icon in grayscale and draws cooldown text while on cooldown', () => {
            game.player.divingTimer = 500;
            game.player.divingCooldown = 1000;

            ui.firedogAbilityUI(ctx);

            expect(ctx.filter).toBe('grayscale(100%)');
            expect(ctx.drawImage).toHaveBeenCalled();
            expect(ctx.fillText).toHaveBeenCalled();
        });

        it('shows fireball icon in grayscale and draws cooldown text while on cooldown', () => {
            game.player.fireballTimer = 500;
            game.player.fireballCooldown = 1000;

            ui.firedogAbilityUI(ctx);

            expect(ctx.filter).toBe('grayscale(100%)');
            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.fireballUI,
                expect.any(Number),
                expect.any(Number),
                50,
                50
            );
            expect(ctx.fillText).toHaveBeenCalled();
        });

        it('renders red potion fireball image and countdown when red potion is active', () => {
            game.player.isRedPotionActive = true;
            game.player.redPotionTimer = 5000;

            ui.firedogAbilityUI(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.fireballRedPotionUI,
                expect.any(Number),
                expect.any(Number),
                50,
                50
            );
        });

        it('uses white-border variants when darkWhiteBorder is enabled', () => {
            game.player.isDarkWhiteBorder = true;

            ui.firedogAbilityUI(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(
                ui.divingUIWhiteBorder,
                expect.any(Number),
                expect.any(Number),
                50,
                50
            );
        });

        it('shows invisible active timer text while invisible', () => {
            game.player.invisibleTimer = 2000;
            game.player.invisibleActiveCooldownTimer = 3000;
            game.player.isInvisible = true;

            ui.firedogAbilityUI(ctx);

            expect(ctx.fillText).toHaveBeenCalled();
        });
    });
});
