import { UI } from '../../game/interface/UI';

describe('UI', () => {
    let game;
    let ui;
    let ctx;

    const makeTrackedCtx = () => {
        const assignments = {
            filter: [],
            fillStyle: [],
            shadowColor: [],
            shadowBlur: [],
            font: [],
            textAlign: [],
            textBaseline: [],
            globalAlpha: [],
            lineWidth: [],
            strokeStyle: [],
        };

        const c = {
            save: jest.fn(),
            restore: jest.fn(),

            fillText: jest.fn(),
            strokeText: jest.fn(),

            fill: jest.fn(),
            stroke: jest.fn(),

            beginPath: jest.fn(),
            closePath: jest.fn(),
            clip: jest.fn(),

            moveTo: jest.fn(),
            lineTo: jest.fn(),
            arcTo: jest.fn(),
            quadraticCurveTo: jest.fn(),

            fillRect: jest.fn(),

            translate: jest.fn(),
            scale: jest.fn(),

            drawImage: jest.fn(),
            measureText: jest.fn(() => ({ width: 10 })),

            createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),

            shadowOffsetX: 0,
            shadowOffsetY: 0,
        };

        const trackProp = (prop, initial) => {
            let _v = initial;
            Object.defineProperty(c, prop, {
                configurable: true,
                enumerable: true,
                get: () => _v,
                set: (v) => {
                    _v = v;
                    assignments[prop].push(v);
                },
            });
        };

        trackProp('filter', '');
        trackProp('fillStyle', '');
        trackProp('shadowColor', '');
        trackProp('shadowBlur', 0);
        trackProp('font', '');
        trackProp('textAlign', '');
        trackProp('textBaseline', '');
        trackProp('globalAlpha', 1);
        trackProp('lineWidth', 1);
        trackProp('strokeStyle', '');

        c.__assignments = assignments;
        return c;
    };

    const setBoss = (currentBoss) => {
        game.boss = { current: currentBoss };
    };

    beforeAll(() => {
        document.getElementById = jest.fn().mockImplementation((id) => ({ __imgId: id }));
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
                isFrozen: false,

                energy: 10.5,
                maxEnergy: 100,
                isBluePotionActive: false,
                isPoisonedActive: false,
                isEnergyExhausted: false,

                divingTimer: 0,
                divingCooldown: 1000,

                fireballTimer: 0,
                fireballCooldown: 1000,

                redPotionTimer: 0,
                isRedPotionActive: false,

                invisibleTimer: 0,
                invisibleActiveCooldownTimer: 0,
                invisibleCooldown: 5000,
                isInvisible: false,

                dashBetweenCooldown: 500,
                dashBetweenTimer: 500,
                dashCooldown: 50000,
                dashTimer: 50000,
                dashCharges: 2,
                dashAwaitingSecond: false,
                dashSecondWindowTimer: 0,

                states: [
                    {}, // 0
                    {}, // 1
                    {}, // 2
                    {}, // 3
                    {}, // 4
                    { __name: 'DIVING' },   // 5
                    { __name: 'STUNNED' },  // 6
                    { __name: 'HIT' },      // 7
                    {}, // 8
                    {}, // 9
                    {}, // 10
                ],
                currentState: null,

                blueFireTimer: 0,
                isDarkWhiteBorder: false,
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
        ctx = makeTrackedCtx();
    });

    const heartDrawCalls = () =>
        ctx.drawImage.mock.calls.filter(([, , , w, h]) => w === 25 && h === 25);

    describe('constructor', () => {
        it('loads UI images by id from the DOM (including dash)', () => {
            expect(document.getElementById).toHaveBeenCalledWith('firedogHead');

            expect(document.getElementById).toHaveBeenCalledWith('fireballUI');
            expect(document.getElementById).toHaveBeenCalledWith('fireballRedPotionUI');
            expect(document.getElementById).toHaveBeenCalledWith('divingUI');
            expect(document.getElementById).toHaveBeenCalledWith('invisibleUI');
            expect(document.getElementById).toHaveBeenCalledWith('dashingUI');
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

    describe('syncLivesState()', () => {
        it('resets blink/gain state and syncs prevLives to game.lives', () => {
            ui.prevLives = 99;
            ui.lifeBlinkIndex = 1;
            ui.lifeBlinkEndTime = 9999;
            ui.lifeGainEndTimes.set(0, 123);
            ui.lifeGainEndTimes.set(1, 456);

            game.lives = 2;

            const getUiTimeSpy = jest.spyOn(ui, 'getUiTime').mockReturnValue(5000);

            ui.syncLivesState();

            expect(ui.prevLives).toBe(2);
            expect(ui.lifeBlinkIndex).toBe(-1);
            expect(ui.lifeBlinkEndTime).toBe(5000);
            expect(ui.lifeGainEndTimes.size).toBe(0);

            getUiTimeSpy.mockRestore();
        });
    });

    describe('draw()', () => {
        it('renders top-level UI sections (coins, bars, timer, energy, lives, abilities)', () => {
            const spyDist = jest.spyOn(ui, 'distanceBar');
            const spyBossBar = jest.spyOn(ui, 'bossHealthBar');
            const spyTimer = jest.spyOn(ui, 'timer');
            const spyEnergy = jest.spyOn(ui, 'energy');
            const spyLives = jest.spyOn(ui, 'drawLives');
            const spyFiredog = jest.spyOn(ui, 'firedogAbilityUI');

            jest.spyOn(ui, 'getUiTime').mockReturnValue(0);

            ui.draw(ctx);

            expect(ctx.fillText).toHaveBeenCalledWith('Coins: 5', 20, 38);
            expect(spyDist).toHaveBeenCalledWith(ctx);
            expect(spyBossBar).toHaveBeenCalledWith(ctx);
            expect(spyTimer).toHaveBeenCalledWith(ctx);
            expect(spyEnergy).toHaveBeenCalledWith(ctx);
            expect(spyLives).toHaveBeenCalledWith(ctx);
            expect(spyFiredog).toHaveBeenCalledWith(ctx);
        });
    });

    describe('drawLives()', () => {
        it('draws one heart per current life in steady state', () => {
            game.lives = 2;
            game.maxLives = 3;
            ui = new UI(game);
            ctx = makeTrackedCtx();

            jest.spyOn(ui, 'getUiTime').mockReturnValue(0);

            ui.drawLives(ctx);

            expect(heartDrawCalls()).toHaveLength(2);
        });

        it('on life loss: blinks the lost heart for lifeBlinkDuration then stops drawing it', () => {
            game.maxLives = 3;
            ui = new UI(game);
            ctx = makeTrackedCtx();

            ui.prevLives = 2;
            game.lives = 1;

            const times = [0, 500];
            let i = 0;
            jest.spyOn(ui, 'getUiTime').mockImplementation(() => times[i++]);

            ui.drawLives(ctx);
            expect(heartDrawCalls()).toHaveLength(2);

            ctx.drawImage.mockClear();
            ui.drawLives(ctx);
            expect(heartDrawCalls()).toHaveLength(1);
        });

        it('on life gain: pops the new heart for lifeGainDuration then normalizes', () => {
            game.maxLives = 3;
            ui = new UI(game);
            ctx = makeTrackedCtx();

            ui.prevLives = 1;
            game.lives = 2;

            const times = [0, 500];
            let i = 0;
            jest.spyOn(ui, 'getUiTime').mockImplementation(() => times[i++]);

            ui.drawLives(ctx);
            expect(heartDrawCalls()).toHaveLength(2);
            expect(ui.lifeGainEndTimes.size).toBeGreaterThan(0);

            ctx.drawImage.mockClear();
            ui.drawLives(ctx);
            expect(heartDrawCalls()).toHaveLength(2);
            expect(ui.lifeGainEndTimes.size).toBe(0);
        });
    });

    describe('progressBar()', () => {
        it('renders percentage text and paints the bar', () => {
            ui.progressBar(ctx, 75, 375, 500, 'pink');

            expect(ctx.fillText).toHaveBeenCalledWith('75%', expect.any(Number), expect.any(Number));
            expect(ui.percentage).toBe(75);
            expect(ctx.fill).toHaveBeenCalled();
        });

        it('renders overheal segment when overhealFilledWidth is significant', () => {
            ui.progressBar(ctx, 100, 500, 500, 'red', 60);
            expect(ctx.fillRect).toHaveBeenCalled();
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

        it('does nothing when background is missing', () => {
            const spy = jest.spyOn(ui, 'progressBar');
            game.background = null;

            ui.distanceBar(ctx);

            expect(spy).not.toHaveBeenCalled();
        });

        it('uses gate.minDistance as target when provided', () => {
            const spy = jest.spyOn(ui, 'progressBar');

            game.background.totalDistanceTraveled = 200;
            game.maxDistance = 999;
            game.bossManager = {
                getGateForCurrentMap: jest.fn(() => ({
                    minDistance: 400,
                    minCoins: 0,
                })),
            };

            ui.distanceBar(ctx);

            const [, percentage] = spy.mock.calls[0];
            expect(percentage).toBeCloseTo(50);
        });

        it('draws a coins-progress stripe when gate requires coins and player has coins', () => {
            game.bossManager = {
                getGateForCurrentMap: jest.fn(() => ({
                    minDistance: 300,
                    minCoins: 10,
                })),
            };
            game.coins = 5;

            ui.distanceBar(ctx);

            expect(ctx.__assignments.fillStyle).toContain('orange');
            expect(ctx.fill.mock.calls.length + ctx.fillRect.mock.calls.length).toBeGreaterThan(0);
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

        it('does nothing when boss exists but current boss is null', () => {
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
                expect.any(Number),
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

        it('computes a non-zero overheal segment when boss has overheal lives', () => {
            const spy = jest.spyOn(ui, 'progressBar');

            game.bossInFight = true;
            setBoss({
                maxLives: 10,
                lives: 12, // 2 lives into overheal
                overhealPercent: 0.5, // cap = 15
            });

            ui.bossHealthBar(ctx);

            const call = spy.mock.calls[0];
            const overhealFilledWidth = call[5];
            expect(overhealFilledWidth).toBeGreaterThan(0);
        });

        it('clamps lives to overheal cap when computing overheal segment', () => {
            const spy = jest.spyOn(ui, 'progressBar');

            game.bossInFight = true;
            setBoss({
                maxLives: 10,
                lives: 999,
                overhealPercent: 0.5, // cap = 15 lives
            });

            ui.bossHealthBar(ctx);

            const call = spy.mock.calls[0];
            const overhealFilledWidth = call[5];
            expect(overhealFilledWidth).toBeLessThanOrEqual(ui.barWidth * 0.5);
        });
    });

    describe('energy()', () => {
        it('calls drawEnergyBar with normal status and renders the numeric value', () => {
            const spy = jest.spyOn(ui, 'drawEnergyBar');
            game.menu.pause.isPaused = true;

            game.player.energy = 50;
            game.player.maxEnergy = 100;
            game.player.isBluePotionActive = false;
            game.player.isPoisonedActive = false;
            game.player.isEnergyExhausted = false;

            ui.energy(ctx);

            expect(spy).toHaveBeenCalled();
            const call = spy.mock.calls[0];
            const status = call[6];
            const exhausted = call[7];

            expect(status).toBe('normal');
            expect(exhausted).toBe(false);

            expect(ctx.fillText.mock.calls.some(c => c[0] === '50.0')).toBe(true);
        });

        it('uses poison status when poisoned', () => {
            const spy = jest.spyOn(ui, 'drawEnergyBar');
            game.menu.pause.isPaused = true;

            game.player.isPoisonedActive = true;
            game.player.isBluePotionActive = false;

            ui.energy(ctx);

            const call = spy.mock.calls[0];
            expect(call[6]).toBe('poison');
        });

        it('uses blue status when blue potion is active', () => {
            const spy = jest.spyOn(ui, 'drawEnergyBar');
            game.menu.pause.isPaused = true;

            game.player.isBluePotionActive = true;
            game.player.isPoisonedActive = false;

            ui.energy(ctx);

            const call = spy.mock.calls[0];
            expect(call[6]).toBe('blue');
        });

        it('when poisoned (not exhausted), draws POISONED label', () => {
            game.menu.pause.isPaused = true;

            game.player.energy = 12.3;
            game.player.maxEnergy = 100;
            game.player.isPoisonedActive = true;
            game.player.isBluePotionActive = false;
            game.player.isEnergyExhausted = false;

            ui.energy(ctx);

            expect(ctx.fillText.mock.calls.some(c => c[0] === 'POISONED')).toBe(true);
            expect(ctx.fillText.mock.calls.some(c => c[0] === 'BOOSTED')).toBe(false);
            expect(ctx.fillText.mock.calls.some(c => c[0] === 'EXHAUSTED')).toBe(false);
        });

        it('when blue potion active (not exhausted), draws BOOSTED label', () => {
            game.menu.pause.isPaused = true;

            game.player.energy = 44.4;
            game.player.maxEnergy = 100;
            game.player.isBluePotionActive = true;
            game.player.isPoisonedActive = false;
            game.player.isEnergyExhausted = false;

            ui.energy(ctx);

            expect(ctx.fillText.mock.calls.some(c => c[0] === 'BOOSTED')).toBe(true);
            expect(ctx.fillText.mock.calls.some(c => c[0] === 'POISONED')).toBe(false);
            expect(ctx.fillText.mock.calls.some(c => c[0] === 'EXHAUSTED')).toBe(false);
        });

        it('when exhausted, EXHAUSTED label overrides poison/blue labels', () => {
            game.menu.pause.isPaused = true;

            game.player.energy = 0;
            game.player.maxEnergy = 100;

            game.player.isEnergyExhausted = true;
            game.player.isBluePotionActive = true;
            game.player.isPoisonedActive = true;

            ui.energy(ctx);

            expect(ctx.fillText.mock.calls.some(c => c[0] === 'EXHAUSTED')).toBe(true);
            expect(ctx.fillText.mock.calls.some(c => c[0] === 'POISONED')).toBe(false);
            expect(ctx.fillText.mock.calls.some(c => c[0] === 'BOOSTED')).toBe(false);
        });
    });

    describe('drawEnergyBar() outline stroke color', () => {
        const getLastStrokeStyle = () => {
            const list = ctx.__assignments.strokeStyle;
            return list[list.length - 1];
        };

        it('uses red outline when exhausted marker is shown', () => {
            ui.drawEnergyBar(ctx, 0, 0, 240, 32, 0.10, 'normal', true, 0.2);
            expect(getLastStrokeStyle()).toBe('rgba(255, 40, 40, 0.95)');
        });

        it('uses yellow outline when below 20 and NOT exhausted and NOT status active', () => {
            ui.drawEnergyBar(ctx, 0, 0, 240, 32, 0.10, 'normal', false, 0.2);
            expect(getLastStrokeStyle()).toBe('rgba(255, 220, 70, 0.95)');
        });

        it('uses blue outline when blue potion status is active (even if low)', () => {
            ui.drawEnergyBar(ctx, 0, 0, 240, 32, 0.10, 'blue', false, 0.2);
            expect(getLastStrokeStyle()).toBe('rgba(80, 180, 255, 0.95)');
        });

        it('uses green outline when poison status is active (even if low)', () => {
            ui.drawEnergyBar(ctx, 0, 0, 240, 32, 0.10, 'poison', false, 0.2);
            expect(getLastStrokeStyle()).toBe('rgba(19, 216, 19, 0.95)');
        });

        it('uses default dark outline when not exhausted, not low, and no status', () => {
            ui.drawEnergyBar(ctx, 0, 0, 240, 32, 0.50, 'normal', false, 0.2);
            expect(getLastStrokeStyle()).toBe('rgba(0, 0, 0, 0.90)');
        });
    });

    describe('timer()', () => {
        it('non-underwater: renders elapsed time and stops ticking sound', () => {
            game.player.isUnderwater = false;
            game.time = 125000; // 2:05

            ui.timer(ctx);

            expect(ctx.fillText).toHaveBeenCalledWith('Time: 2:05', 20, 78);
            expect(game.audioHandler.mapSoundtrack.stopSound).toHaveBeenCalledWith('timeTickingSound');
            expect(game.audioHandler.mapSoundtrack.resumeSound).toHaveBeenCalledWith('timeTickingSound');
        });

        it('underwater: when remaining time is below threshold, activates ticking sound', () => {
            game.player.isUnderwater = true;
            game.maxTime = 70000;
            game.time = 65000; // remaining = 5000 < 60000

            ui.timer(ctx);

            expect(ui.secondsLeftActivated).toBe(true);
            expect(game.audioHandler.mapSoundtrack.playSound).toHaveBeenCalledWith('timeTickingSound', true);
        });

        it('underwater: above threshold uses black text with white shadow', () => {
            game.player.isUnderwater = true;
            game.maxTime = 70000;
            game.time = 5000; // remaining = 65000 > 60000

            ui.timer(ctx);

            expect(ctx.__assignments.fillStyle).toContain('black');
            expect(ctx.__assignments.shadowColor).toContain('white');
        });

        it('underwater: when remaining time is 0 or less, timer styling is red', () => {
            game.player.isUnderwater = true;
            game.maxTime = 1000;
            game.time = 2000;

            ui.timer(ctx);

            expect(ctx.__assignments.fillStyle).toContain('red');
        });

        it('pauses ticking sound when paused', () => {
            game.menu.pause.isPaused = true;

            ui.timer(ctx);

            expect(game.audioHandler.mapSoundtrack.pauseSound).toHaveBeenCalledWith('timeTickingSound');
        });

        it('stops ticking sound when cabin is visible', () => {
            game.player.isUnderwater = true;
            game.cabin.isFullyVisible = true;

            ui.timer(ctx);

            expect(game.audioHandler.mapSoundtrack.stopSound).toHaveBeenCalledWith('timeTickingSound');
        });

        it('renders blue potion center countdown when blue potion is active', () => {
            game.player.isBluePotionActive = true;
            game.player.blueFireTimer = 2500;

            ui.timer(ctx);

            expect(ctx.__assignments.fillStyle).toContain('blue');
            expect(ctx.fillText).toHaveBeenCalledWith(
                expect.stringMatching(/2\.5/),
                expect.any(Number),
                expect.any(Number)
            );
        });
    });

    describe('firedogAbilityUI()', () => {
        beforeEach(() => {
            jest.spyOn(ui, 'getUiTime').mockReturnValue(1000);
        });

        it('diving: sets grayscale while on cooldown and draws a centered cooldown number', () => {
            game.player.divingTimer = 500;
            game.player.divingCooldown = 1000;
            game.player.isFrozen = false;

            ui.firedogAbilityUI(ctx);

            expect(ctx.__assignments.filter).toContain('grayscale(100%)');
            expect(ctx.fillText.mock.calls.some(c => c[0] === '0.5')).toBe(true);
        });

        it('diving: uses animated border when actively diving (state 5) and not frozen', () => {
            const spy = jest.spyOn(ui, 'drawAbilityIcon');

            game.player.isFrozen = false;
            game.player.divingTimer = 1000;
            game.player.currentState = game.player.states[5];

            ui.firedogAbilityUI(ctx);

            const divingCall = spy.mock.calls.find(call => call[1] === ui.divingUI);
            expect(divingCall).toBeTruthy();
            expect(divingCall[5]).toMatchObject({ animatedBorder: true });
        });

        it('fireball: locks (grayscale) if isEnergyExhausted is true', () => {
            game.player.isEnergyExhausted = true;
            game.player.fireballTimer = 1000;
            game.player.fireballCooldown = 1000;

            ui.firedogAbilityUI(ctx);

            expect(ctx.__assignments.filter).toContain('grayscale(100%)');
        });

        it('fireball: renders red potion fireball icon and shows red potion countdown text', () => {
            game.player.isRedPotionActive = true;
            game.player.redPotionTimer = 5000;

            ui.firedogAbilityUI(ctx);

            expect(ctx.drawImage).toHaveBeenCalled();
            expect(ctx.fillText.mock.calls.some(c => c[0] === '5.0')).toBe(true);
        });

        it('invisible: when locked (not invisible, cooldown not ready) draws centered cooldown overlay', () => {
            game.player.isFrozen = false;
            game.player.isInvisible = false;
            game.player.invisibleCooldown = 5000;
            game.player.invisibleTimer = 0;

            ui.firedogAbilityUI(ctx);

            expect(ctx.__assignments.filter).toContain('grayscale(100%)');
            expect(ctx.fillText.mock.calls.some(c => c[0] === '5.0')).toBe(true);
        });

        it('invisible: while invisible, draws active timer text under icon', () => {
            game.player.isFrozen = false;
            game.player.isInvisible = true;
            game.player.invisibleActiveCooldownTimer = 3000;

            ui.firedogAbilityUI(ctx);

            expect(ctx.fillText.mock.calls.some(c => c[0] === '3.0')).toBe(true);
        });

        it('dash: shows charges number when not frozen and dash is not on cooldown', () => {
            game.player.isFrozen = false;
            game.player.dashTimer = game.player.dashCooldown;
            game.player.dashBetweenTimer = game.player.dashBetweenCooldown;
            game.player.dashCharges = 2;
            game.player.isEnergyExhausted = false;

            ui.firedogAbilityUI(ctx);

            expect(ctx.fillText.mock.calls.some(c => c[0] === '2')).toBe(true);
        });

        it('dash: when awaiting second dash, shows window timer text', () => {
            game.player.isFrozen = false;
            game.player.dashTimer = game.player.dashCooldown;
            game.player.dashAwaitingSecond = true;
            game.player.dashSecondWindowTimer = 2400;

            ui.firedogAbilityUI(ctx);

            expect(ctx.fillText.mock.calls.some(c => c[0] === '2.4')).toBe(true);
        });

        it('dash: when on long cooldown, locks (grayscale) and shows remaining cooldown centered', () => {
            game.player.isFrozen = false;
            game.player.dashCooldown = 50000;
            game.player.dashTimer = 0;
            game.player.dashCharges = 0;

            ui.firedogAbilityUI(ctx);

            expect(ctx.__assignments.filter).toContain('grayscale(100%)');
            expect(ctx.fillText.mock.calls.some(c => c[0] === '50.0')).toBe(true);
        });

        it.each([
            ['stunned (state 6)', 6],
            ['hit (state 7)', 7],
        ])('diving: locks (grayscale) when %s even if cooldown is ready', (_label, idx) => {
            game.player.isFrozen = false;
            game.player.currentState = game.player.states[idx];

            game.player.divingTimer = game.player.divingCooldown; // ready
            ui.firedogAbilityUI(ctx);

            expect(ctx.__assignments.filter).toContain('grayscale(100%)');
        });

        it.each([
            ['stunned (state 6)', 6],
            ['hit (state 7)', 7],
        ])('fireball: locks (grayscale) when %s even if cooldown/energy are ready', (_label, idx) => {
            game.player.isFrozen = false;
            game.player.currentState = game.player.states[idx];

            game.player.isEnergyExhausted = false;
            game.player.fireballTimer = game.player.fireballCooldown; // ready

            ui.firedogAbilityUI(ctx);

            expect(ctx.__assignments.filter).toContain('grayscale(100%)');
        });

        it.each([
            ['stunned (state 6)', 6],
            ['hit (state 7)', 7],
        ])('dash: locks (grayscale) when %s even if charges/cooldowns/energy are ready', (_label, idx) => {
            game.player.isFrozen = false;
            game.player.currentState = game.player.states[idx];

            game.player.isEnergyExhausted = false;
            game.player.dashBetweenTimer = game.player.dashBetweenCooldown;
            game.player.dashTimer = game.player.dashCooldown;
            game.player.dashCharges = 2;

            ui.firedogAbilityUI(ctx);

            expect(ctx.__assignments.filter).toContain('grayscale(100%)');
        });
    });
});
