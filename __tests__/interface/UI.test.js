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
            arc: jest.fn(),
            quadraticCurveTo: jest.fn(),

            fillRect: jest.fn(),
            roundRect: jest.fn(),

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
                frozenTimer: 0,
                frozenDuration: 0,

                isPoisonedActive: false,
                poisonTimer: 0,

                isSlowed: false,
                slowedTimer: 0,

                isConfused: false,
                confuseTimer: 0,
                confuseDuration: 0,

                isBlackHoleActive: false,
                blackHoleTimer: 0,
                blackHoleDuration: 0,

                energy: 10.5,
                maxEnergy: 100,
                isBluePotionActive: false,
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

        it('hourglass: when active, draws outer gold border and draws hourglass timer centered below', () => {
            game.player.isHourglassActive = true;
            game.player.hourglassTimer = 12345;

            game.player.isRedPotionActive = false;
            game.player.isInvisible = false;
            game.player.dashAwaitingSecond = false;
            game.player.dashTimer = game.player.dashCooldown;

            ui.firedogAbilityUI(ctx);

            expect(ctx.__assignments.shadowColor).toContain('rgba(255, 215, 0, 1)');
            expect(ctx.__assignments.strokeStyle).toContain('rgba(255, 215, 0, 1)');

            const expectedText = '12.3';
            const expectedCx = 170;
            const expectedCy = 240;

            const hourglassCall = ctx.fillText.mock.calls.find(
                (c) => c[0] === expectedText && c[1] === expectedCx && c[2] === expectedCy
            );
            expect(hourglassCall).toBeTruthy();
        });

        it('hourglass: grows border down when a below-timer is showing (extraDown=25) and positions hourglass timer lower', () => {
            game.player.isHourglassActive = true;
            game.player.hourglassTimer = 9000;

            game.player.isRedPotionActive = true;
            game.player.redPotionTimer = 5000;

            game.player.isInvisible = false;
            game.player.dashAwaitingSecond = false;
            game.player.dashTimer = game.player.dashCooldown;

            ui.firedogAbilityUI(ctx);

            const expectedText = '9.0';
            const expectedCx = 170;
            const expectedCy = 265;

            const hourglassCall = ctx.fillText.mock.calls.find(
                (c) => c[0] === expectedText && c[1] === expectedCx && c[2] === expectedCy
            );
            expect(hourglassCall).toBeTruthy();
        });
    });

    describe('getNegativeStatusSnapshot()', () => {
        it('returns exactly 5 entries with keys in order', () => {
            const snap = ui.getNegativeStatusSnapshot();
            expect(snap).toHaveLength(5);
            expect(snap.map(s => s.key)).toEqual(['freeze', 'poison', 'slow', 'confuse', 'blackHole']);
        });

        it('all entries inactive when no effects are applied', () => {
            const snap = ui.getNegativeStatusSnapshot();
            expect(snap.every(s => !s.active)).toBe(true);
        });

        it('freeze: active=true, correct remaining and total from frozenDuration', () => {
            game.player.isFrozen = true;
            game.player.frozenTimer = 2000;
            game.player.frozenDuration = 5000;

            const snap = ui.getNegativeStatusSnapshot();
            const freeze = snap.find(s => s.key === 'freeze');

            expect(freeze.active).toBe(true);
            expect(freeze.remaining).toBe(2000);
            expect(freeze.total).toBe(5000);
        });

        it('freeze: active=false when isFrozen=false even if timer > 0', () => {
            game.player.isFrozen = false;
            game.player.frozenTimer = 1000;

            expect(ui.getNegativeStatusSnapshot().find(s => s.key === 'freeze').active).toBe(false);
        });

        it('freeze: active=false when frozenTimer=0 even if isFrozen=true', () => {
            game.player.isFrozen = true;
            game.player.frozenTimer = 0;

            expect(ui.getNegativeStatusSnapshot().find(s => s.key === 'freeze').active).toBe(false);
        });

        it('poison: active=true, total falls back to poisonTimer when no duration property', () => {
            game.player.isPoisonedActive = true;
            game.player.poisonTimer = 3000;

            const poison = ui.getNegativeStatusSnapshot().find(s => s.key === 'poison');

            expect(poison.active).toBe(true);
            expect(poison.remaining).toBe(3000);
            expect(poison.total).toBe(3000);
        });

        it('slow: active=true with correct remaining', () => {
            game.player.isSlowed = true;
            game.player.slowedTimer = 1500;

            const slow = ui.getNegativeStatusSnapshot().find(s => s.key === 'slow');

            expect(slow.active).toBe(true);
            expect(slow.remaining).toBe(1500);
        });

        it('confuse: uses confuseDuration for total when provided', () => {
            game.player.isConfused = true;
            game.player.confuseTimer = 1000;
            game.player.confuseDuration = 4000;

            const confuse = ui.getNegativeStatusSnapshot().find(s => s.key === 'confuse');

            expect(confuse.active).toBe(true);
            expect(confuse.remaining).toBe(1000);
            expect(confuse.total).toBe(4000);
        });

        it('blackHole: active=true with correct remaining and total from blackHoleDuration', () => {
            game.player.isBlackHoleActive = true;
            game.player.blackHoleTimer = 8000;
            game.player.blackHoleDuration = 15500;

            const bh = ui.getNegativeStatusSnapshot().find(s => s.key === 'blackHole');

            expect(bh.active).toBe(true);
            expect(bh.remaining).toBe(8000);
            expect(bh.total).toBe(15500);
        });

        it('blackHole: active=false when isBlackHoleActive=false', () => {
            game.player.isBlackHoleActive = false;
            game.player.blackHoleTimer = 5000;

            expect(ui.getNegativeStatusSnapshot().find(s => s.key === 'blackHole').active).toBe(false);
        });
    });

    describe('syncNegativeStatusIndicators()', () => {
        beforeEach(() => {
            ui.negativeStatusUi.activeOrder.clear();
            ui.negativeStatusUi.nextOrder = 0;
        });

        it('returns empty array when no effects are active', () => {
            expect(ui.syncNegativeStatusIndicators()).toEqual([]);
        });

        it('adds a new entry with appliedOrder=0 on first activation', () => {
            game.player.isFrozen = true;
            game.player.frozenTimer = 2000;
            game.player.frozenDuration = 5000;

            const result = ui.syncNegativeStatusIndicators();

            expect(result).toHaveLength(1);
            expect(result[0].key).toBe('freeze');
            expect(result[0].appliedOrder).toBe(0);
            expect(ui.negativeStatusUi.nextOrder).toBe(1);
        });

        it('preserves insertion (queue) order across multiple active effects', () => {
            game.player.isPoisonedActive = true;
            game.player.poisonTimer = 1000;
            ui.syncNegativeStatusIndicators();

            game.player.isFrozen = true;
            game.player.frozenTimer = 2000;
            game.player.frozenDuration = 5000;
            ui.syncNegativeStatusIndicators();

            game.player.isSlowed = true;
            game.player.slowedTimer = 500;
            const result = ui.syncNegativeStatusIndicators();

            expect(result.map(r => r.key)).toEqual(['poison', 'freeze', 'slow']);
            expect(result[0].appliedOrder).toBeLessThan(result[1].appliedOrder);
            expect(result[1].appliedOrder).toBeLessThan(result[2].appliedOrder);
        });

        it('removes an effect from activeOrder when it becomes inactive', () => {
            game.player.isFrozen = true;
            game.player.frozenTimer = 1000;
            game.player.frozenDuration = 3000;
            ui.syncNegativeStatusIndicators();

            game.player.isFrozen = false;
            game.player.frozenTimer = 0;
            const result = ui.syncNegativeStatusIndicators();

            expect(result).toHaveLength(0);
            expect(ui.negativeStatusUi.activeOrder.has('freeze')).toBe(false);
        });

        it('updates remaining without changing appliedOrder for an existing active effect', () => {
            game.player.isFrozen = true;
            game.player.frozenTimer = 3000;
            game.player.frozenDuration = 5000;
            ui.syncNegativeStatusIndicators();

            game.player.frozenTimer = 1500;
            const result = ui.syncNegativeStatusIndicators();

            expect(result).toHaveLength(1);
            expect(result[0].remaining).toBe(1500);
            expect(result[0].appliedOrder).toBe(0);
        });

        it('does not shrink total when remaining decreases below initial total', () => {
            game.player.isFrozen = true;
            game.player.frozenTimer = 5000;
            game.player.frozenDuration = 5000;
            ui.syncNegativeStatusIndicators();

            game.player.frozenTimer = 2000;
            const result = ui.syncNegativeStatusIndicators();

            expect(result[0].total).toBe(5000);
            expect(result[0].remaining).toBe(2000);
        });

        it('expands total if remaining later exceeds it (effect refreshed)', () => {
            game.player.isFrozen = true;
            game.player.frozenTimer = 3000;
            game.player.frozenDuration = 3000;
            ui.syncNegativeStatusIndicators();

            game.player.frozenTimer = 5000;
            game.player.frozenDuration = 5000;
            const result = ui.syncNegativeStatusIndicators();

            expect(result[0].total).toBe(5000);
        });
    });

    describe('drawNegativeStatusEffect()', () => {
        it('draws the arc track, the remaining-time arc, and the label for a freeze effect', () => {
            const effect = { key: 'freeze', color: 'cyan', remaining: 2000, total: 5000 };
            const size = ui.negativeStatusUi.size;

            ui.drawNegativeStatusEffect(ctx, 25, 230, size, effect);

            expect(ctx.arc).toHaveBeenCalledTimes(2);

            const labelCall = ctx.fillText.mock.calls.find(c => c[0] === 'F');
            expect(labelCall).toBeTruthy();

            expect(ctx.__assignments.strokeStyle).toContain('#00d4ff');
        });

        it('uses correct label letter for each theme', () => {
            const size = ui.negativeStatusUi.size;
            const cases = [
                { key: 'freeze',    label: 'F' },
                { key: 'poison',    label: 'P' },
                { key: 'slow',      label: 'S' },
                { key: 'confuse',   label: 'C' },
                { key: 'blackHole', label: 'B' },
            ];

            for (const { key, label } of cases) {
                ctx.fillText.mockClear();
                ui.drawNegativeStatusEffect(ctx, 0, 0, size, { key, color: 'grey', remaining: 1000, total: 2000 });
                expect(ctx.fillText.mock.calls.some(c => c[0] === label)).toBe(true);
            }
        });

        it('skips the remaining-time arc when remainingRatio is 0', () => {
            const size = ui.negativeStatusUi.size;
            // remaining=0 → ratio=0 → arc ring skipped
            ui.drawNegativeStatusEffect(ctx, 0, 0, size, { key: 'freeze', color: 'cyan', remaining: 0, total: 5000 });

            expect(ctx.arc).toHaveBeenCalledTimes(1);
        });

        it('calls ctx.save/restore at least once', () => {
            const size = ui.negativeStatusUi.size;
            ui.drawNegativeStatusEffect(ctx, 25, 230, size, { key: 'poison', color: 'green', remaining: 500, total: 1000 });

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
        });
    });

    describe('drawNegativeStatusUI()', () => {
        beforeEach(() => {
            ui.negativeStatusUi.activeOrder.clear();
            ui.negativeStatusUi.nextOrder = 0;
        });

        it('does nothing when no effects are active', () => {
            const spy = jest.spyOn(ui, 'drawNegativeStatusEffect');
            ui.drawNegativeStatusUI(ctx);
            expect(spy).not.toHaveBeenCalled();
        });

        it('calls drawNegativeStatusEffect once per active effect', () => {
            game.player.isFrozen = true;
            game.player.frozenTimer = 2000;
            game.player.frozenDuration = 5000;

            game.player.isPoisonedActive = true;
            game.player.poisonTimer = 3000;

            const spy = jest.spyOn(ui, 'drawNegativeStatusEffect');
            ui.drawNegativeStatusUI(ctx);

            expect(spy).toHaveBeenCalledTimes(2);
        });

        it('positions each icon (size+gap) apart on the x axis at the same y', () => {
            game.player.isFrozen = true;
            game.player.frozenTimer = 1000;
            game.player.frozenDuration = 3000;

            game.player.isPoisonedActive = true;
            game.player.poisonTimer = 1000;

            const spy = jest.spyOn(ui, 'drawNegativeStatusEffect');
            ui.drawNegativeStatusUI(ctx);

            const size = ui.negativeStatusUi.size;
            const gap = ui.negativeStatusUi.gap;
            const startX = ui._abilityUiLayout.x;
            const startY = ui._abilityUiLayout.bottomY + ui.negativeStatusUi.topSpacing;

            const [, x0, y0] = spy.mock.calls[0];
            const [, x1, y1] = spy.mock.calls[1];

            expect(x0).toBe(startX);
            expect(x1).toBe(startX + size + gap);
            expect(y0).toBe(startY);
            expect(y1).toBe(startY);
        });
    });

    describe('_buildTipColorSpans()', () => {
        it('returns empty array when no phrases match', () => {
            const spans = ui._buildTipColorSpans('Nothing special here.');
            expect(spans).toEqual([]);
        });

        it('colours a known multi-word phrase as a single span', () => {
            const spans = ui._buildTipColorSpans('Use a Dive attack now.');
            const span = spans.find(([s, e]) => e - s > 4);
            expect(span).toBeDefined();
            expect(span[2]).toBe('orange');
        });

        it('longer phrase wins over a shorter sub-phrase (no overlap)', () => {
            const spans = ui._buildTipColorSpans('Use Dive attacks here.');
            const overlapping = spans.filter(([s1, e1]) =>
                spans.some(([s2, e2]) => s2 !== s1 && s2 < e1 && e2 > s1)
            );
            expect(overlapping).toHaveLength(0);
        });

        it('colours a possessive form (Elyvorg\'s)', () => {
            const text = "Elyvorg's attack is fast.";
            const spans = ui._buildTipColorSpans(text);
            const span = spans.find(([s, e]) => text.slice(s, e).startsWith('Elyvorg'));
            expect(span).toBeDefined();
            expect(text.slice(span[0], span[1])).toBe("Elyvorg's");
        });

    });

    describe('_getTipContext()', () => {
        it('returns currentMap when no boss fight is active', () => {
            game.boss = null;
            game.currentMap = 'Map3';
            expect(ui._getTipContext()).toBe('Map3');
        });

        it('returns boss.id when boss is in fight', () => {
            game.boss = { inFight: true, id: 'elyvorg' };
            expect(ui._getTipContext()).toBe('elyvorg');
        });

        it('returns currentMap when boss exists but inFight is false', () => {
            game.boss = { inFight: false, id: 'elyvorg' };
            game.currentMap = 'Map7';
            expect(ui._getTipContext()).toBe('Map7');
        });
    });

    describe('cycleTip()', () => {
        it('does nothing when there are no tips for the current context', () => {
            game.currentMap = 'UnknownMap';
            ui.cycleTip();
            expect(ui.tipState.phase).toBeNull();
        });

        it('starts at index 0 and sets phase to fadeIn on first call', () => {
            game.currentMap = 'Map1';
            ui.cycleTip();
            expect(ui.tipState.index).toBe(0);
            expect(ui.tipState.phase).toBe('fadeIn');
            expect(ui.tipState.opacity).toBe(0);
        });

        it('advances to the next tip on subsequent calls', () => {
            game.currentMap = 'Map3';
            ui.cycleTip();
            expect(ui.tipState.index).toBe(0);
            ui.tipState.phase = 'hold';
            ui.cycleTip();
            expect(ui.tipState.index).toBe(1);
        });

        it('wraps around to index 0 after the last tip', () => {
            game.currentMap = 'Map1';
            ui.tipState._lastTipContext = 'Map1';
            ui.tipState.index = 3;
            ui.tipState.phase = 'hold';
            ui.cycleTip();
            expect(ui.tipState.index).toBe(0);
        });

        it('resets to index 0 when context changes', () => {
            ui.tipState._lastTipContext = 'Map1';
            ui.tipState.index = 1;
            ui.tipState.phase = 'hold';
            game.currentMap = 'Map3';
            ui.cycleTip();
            expect(ui.tipState.index).toBe(0);
            expect(ui.tipState._lastTipContext).toBe('Map3');
        });

        it('re-shows the same tip when called during fadeOut (does not advance index)', () => {
            game.currentMap = 'Map3';
            ui.tipState._lastTipContext = 'Map3';
            ui.tipState.index = 1;
            ui.tipState.phase = 'fadeOut';

            ui.cycleTip();

            expect(ui.tipState.index).toBe(1);
            expect(ui.tipState.phase).toBe('fadeIn');
            expect(ui.tipState.opacity).toBe(0);
        });

        it('resets to index 0 when called after tip has fully faded (phase null)', () => {
            game.currentMap = 'Map3';
            ui.tipState._lastTipContext = 'Map3';
            ui.tipState.index = 2;
            ui.tipState.phase = null;

            ui.cycleTip();

            expect(ui.tipState.index).toBe(0);
            expect(ui.tipState.phase).toBe('fadeIn');
        });

    });

    describe('updateTip()', () => {
        it('does nothing when phase is null', () => {
            ui.tipState.phase = null;
            ui.updateTip();
            expect(ui.tipState.opacity).toBe(0);
        });

        it('increases opacity during fadeIn', () => {
            jest.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(150);
            ui.tipState.phase = 'fadeIn';
            ui.tipState.timer = 0;
            ui.tipState._lastTime = null;

            ui.updateTip();
            ui.updateTip();
            expect(ui.tipState.opacity).toBeCloseTo(0.5, 1);
            expect(ui.tipState.phase).toBe('fadeIn');
            jest.restoreAllMocks();
        });

        it('transitions from fadeIn to hold when fadeInMs elapsed', () => {
            jest.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(400);
            ui.tipState.phase = 'fadeIn';
            ui.tipState._lastTime = null;

            ui.updateTip();
            ui.updateTip();
            expect(ui.tipState.phase).toBe('hold');
            expect(ui.tipState.opacity).toBe(1);
            jest.restoreAllMocks();
        });

        it('transitions from hold to fadeOut when holdMs elapsed', () => {
            jest.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(11000);
            ui.tipState.phase = 'hold';
            ui.tipState._lastTime = null;

            ui.updateTip();
            ui.updateTip();
            expect(ui.tipState.phase).toBe('fadeOut');
            jest.restoreAllMocks();
        });

        it('sets phase to null and opacity to 0 after fadeOut completes', () => {
            jest.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(900);
            ui.tipState.phase = 'fadeOut';
            ui.tipState.opacity = 1;
            ui.tipState._lastTime = null;

            ui.updateTip();
            ui.updateTip();
            expect(ui.tipState.phase).toBeNull();
            expect(ui.tipState.opacity).toBe(0);
            jest.restoreAllMocks();
        });

        it('does not advance timer while paused', () => {
            jest.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(5000);
            game.menu.pause.isPaused = true;
            ui.tipState.phase = 'hold';
            ui.tipState.timer = 0;
            ui.tipState._lastTime = null;

            ui.updateTip();
            ui.updateTip();
            expect(ui.tipState.timer).toBe(0);
            expect(ui.tipState.phase).toBe('hold');
            jest.restoreAllMocks();
        });
    });

    describe('dismissTip()', () => {
        it('switches fadeIn to fadeOut', () => {
            ui.tipState.phase = 'fadeIn';
            ui.dismissTip();
            expect(ui.tipState.phase).toBe('fadeOut');
            expect(ui.tipState.timer).toBe(0);
        });

        it('switches hold to fadeOut', () => {
            ui.tipState.phase = 'hold';
            ui.dismissTip();
            expect(ui.tipState.phase).toBe('fadeOut');
        });

        it('does not change phase when already in fadeOut', () => {
            ui.tipState.phase = 'fadeOut';
            ui.tipState.timer = 200;
            ui.dismissTip();
            expect(ui.tipState.timer).toBe(200);
        });

        it('does nothing when phase is null', () => {
            ui.tipState.phase = null;
            ui.dismissTip();
            expect(ui.tipState.phase).toBeNull();
        });
    });

    describe('resetTip()', () => {
        it('fully resets all tip state fields', () => {
            ui.tipState.index = 3;
            ui.tipState.opacity = 0.8;
            ui.tipState.phase = 'hold';
            ui.tipState.timer = 5000;
            ui.tipState._lastTime = 12345;
            ui.tipState._lastTipContext = 'Map5';

            ui.resetTip();

            expect(ui.tipState.index).toBe(-1);
            expect(ui.tipState.opacity).toBe(0);
            expect(ui.tipState.phase).toBeNull();
            expect(ui.tipState.timer).toBe(0);
            expect(ui.tipState._lastTime).toBeNull();
            expect(ui.tipState._lastTipContext).toBeNull();
        });
    });

    describe('drawTip()', () => {
        it('does not call fillText when phase is null', () => {
            ui.tipState.phase = null;
            ui.drawTip(ctx);
            expect(ctx.fillText).not.toHaveBeenCalled();
        });

        it('renders the background box and tip text when active', () => {
            game.currentMap = 'Map1';
            ui.tipState.phase = 'hold';
            ui.tipState.opacity = 1;
            ui.tipState.index = 0;
            ui.tipState._lastTipContext = 'Map1';

            ui.drawTip(ctx);

            expect(ctx.roundRect).toHaveBeenCalled();
            expect(ctx.fill).toHaveBeenCalled();
        });

        it('counter reflects the current tip index (e.g. 2/3 for the second tip)', () => {
            game.currentMap = 'Map3';
            ui.tipState.phase = 'hold';
            ui.tipState.opacity = 1;
            ui.tipState.index = 1;
            ui.tipState._lastTipContext = 'Map3';

            ui.drawTip(ctx);

            const counterCall = ctx.fillText.mock.calls.find(([text]) => /\d+\/\d+/.test(text));
            expect(counterCall).toBeDefined();
            expect(counterCall[0]).toBe('2/5');
        });

        it('colours matched phrases in tip text (fillStyle is set to a non-white colour)', () => {
            game.currentMap = 'Map7';
            ui.tipState.phase = 'hold';
            ui.tipState.opacity = 1;
            ui.tipState.index = 1;
            ui.tipState._lastTipContext = 'Map7';

            ctx.measureText.mockImplementation((t) => ({ width: t.length * 8 }));

            ui.drawTip(ctx);

            const fillStyles = ctx.__assignments.fillStyle;
            const hasColour = fillStyles.some(s => s !== 'white' && s !== 'rgba(0, 0, 0, 0.65)');
            expect(hasColour).toBe(true);
        });
    });
});
