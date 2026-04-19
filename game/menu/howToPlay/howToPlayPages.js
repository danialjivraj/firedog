import { BluePotion, HealthLive, Cauldron, BlackHole, IceDrink, RedPotion } from '../../entities/powerUpAndDown.js';
import { PoisonBubbles, IceCrystalBubbles } from '../../animations/particles.js';
import { FIREDOG_FRAME } from '../../config/skinsAndCosmetics.js';
import { BASE_FRAME_MS } from '../../config/constants.js';

export const howToPlayPagesMixin = {
    _buildAssets() {
        const id = (x) => document.getElementById(x);
        return {
            fireball: id('fireball'),

            keycap: id('keycap'),
            enterKeycap: id('enterKeycap'),
            shiftKeycap: id('shiftKeycap'),

            leftClick: id('leftClick'),
            rightClick: id('rightClick'),
            scrollWheelClick: id('scrollWheelClick'),
            mouseButton4Click: id('mouseButton4Click'),

            skulnap: id('skulnap'),
            gloomlet: id('gloomlet'),
            bigGreener: id('bigGreener'),
            iceSilknoir: id('iceSilknoir'),
            crystalWasp: id('crystalWasp'),

            defaultSkin: id('defaultSkin'),
            frozenIce: id('frozenIce'),
        };
    },

    _createEnergyExhaustedDisabledUI() {
        return {
            draw: (ctx) => {
                if (!this._demoEnergy?.active || !this._demoEnergy.exhausted) return;

                const fireballIconX = 110;
                const dashIconX = 230;
                const arrowY = 225;
                const textY = 260;

                const drawDownArrow = (x) =>
                    this.drawArrowImpl(ctx, {
                        x,
                        y: arrowY,
                        length: 34,
                        head: 10,
                        rotation: Math.PI / 2,
                        anchor: 'center',
                        lineW: 6,
                        outlineW: 10,
                    });

                drawDownArrow(fireballIconX);
                drawDownArrow(dashIconX);

                this.drawTextBlockImpl(ctx, {
                    text: 'Disabled due to exhaust!',
                    x: (fireballIconX + dashIconX) / 2,
                    y: textY,
                    maxW: 280,
                    lineH: 26,
                    font: 'bold 22px "Gloria Hallelujah"',
                    align: 'center',
                });
            },
        };
    },

    _buildPages() {
        const cx = this.game.width / 2;
        const groundY = this.game.height - this.game.groundMargin;

        const arrowLen = 34;
        const arrowHead = 10;

        const titleBlock = (text, y) =>
            this.createTextBlock({
                text,
                x: cx,
                y,
                maxW: 1000,
                lineH: 36,
                font: 'bold 32px "Gloria Hallelujah"',
                align: 'center',
            });

        const label = (text, x, y) =>
            this.createTextBlock({
                text,
                x,
                y,
                maxW: 320,
                lineH: 26,
                font: 'bold 22px "Gloria Hallelujah"',
                align: 'center',
            });

        const arrow = (x, y, rotation) =>
            this.createArrow({ x, y, length: arrowLen, head: arrowHead, rotation });

        const arrowFromTo = (x1, y1, x2, y2, opts = {}) => {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.max(10, Math.hypot(dx, dy));
            const rotation = Math.atan2(dy, dx);
            return this.createArrow({
                x: x1,
                y: y1,
                length,
                head: opts.head ?? arrowHead,
                rotation,
                anchor: 'start',
                lineW: opts.lineW,
                outlineW: opts.outlineW,
            });
        };

        const bentArrowFromTo = (x1, y1, cx1, cy1, x2, y2, opts = {}) => ({
            draw: (ctx) => {
                const head = opts.head ?? arrowHead;
                const lineW = opts.lineW ?? 6;
                const outlineW = opts.outlineW ?? 10;
                const angle = Math.atan2(y2 - cy1, x2 - cx1);

                const strokeArrow = () => {
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.quadraticCurveTo(cx1, cy1, x2, y2);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(x2, y2);
                    ctx.lineTo(
                        x2 - Math.cos(angle - 0.7) * head,
                        y2 - Math.sin(angle - 0.7) * head
                    );
                    ctx.moveTo(x2, y2);
                    ctx.lineTo(
                        x2 - Math.cos(angle + 0.7) * head,
                        y2 - Math.sin(angle + 0.7) * head
                    );
                    ctx.stroke();
                };

                ctx.save();
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                ctx.strokeStyle = 'white';
                ctx.lineWidth = outlineW;
                strokeArrow();

                ctx.strokeStyle = 'black';
                ctx.lineWidth = lineW;
                strokeArrow();

                ctx.restore();
            },
        });

        const dynamicArrowFromTo = (getPoints, opts = {}) => ({
            draw: (ctx) => {
                const p = getPoints?.();
                if (!p) return;

                const x1 = Number(p.x1) || 0;
                const y1 = Number(p.y1) || 0;
                const x2 = Number(p.x2) || 0;
                const y2 = Number(p.y2) || 0;

                const dx = x2 - x1;
                const dy = y2 - y1;
                const length = Math.max(10, Math.hypot(dx, dy));
                const rotation = Math.atan2(dy, dx);

                this.drawArrowImpl(ctx, {
                    x: x1,
                    y: y1,
                    length,
                    head: opts.head ?? arrowHead,
                    rotation,
                    anchor: 'start',
                    lineW: opts.lineW,
                    outlineW: opts.outlineW,
                });
            },
        });

        const infoArrowText = ({
            startX,
            startY,
            textX,
            textY,
            text,
            maxW = 600,
            align = 'left',
            font = 'bold 24px "Gloria Hallelujah"',
            lineH = 30,
            arrowOpts = { lineW: 6, outlineW: 10 },
            arrowToX = (tx) => tx - 18,
            arrowToY = (ty) => ty + 12,
            textOffsetY = 0,
        }) => ([
            arrowFromTo(startX, startY, arrowToX(textX), arrowToY(textY), arrowOpts),
            this.createTextBlock({ text, x: textX, y: textY + textOffsetY, maxW, lineH, font, align }),
        ]);

        const leftCooldownText = ({
            startX,
            baseArrowY = 230,
            timerShownY = 250,
            getTimerShown,
            textX,
            textY,
            text,
            maxW = 330,
        }) => ([
            dynamicArrowFromTo(() => {
                const shown = getTimerShown?.() === true;
                const y1 = shown ? timerShownY : baseArrowY;
                return { x1: startX, y1, x2: startX, y2: textY - 10 };
            }, { lineW: 6, outlineW: 10 }),
            this.createTextBlock({
                text,
                x: textX,
                y: textY + 10,
                maxW,
                lineH: 30,
                font: 'bold 24px "Gloria Hallelujah"',
                align: 'left',
            }),
        ]);

        const mouthX = cx + 35;
        const mouthY = groundY - 40;

        const baseUI = {
            enabled: true,
            showTopLeft: true,
            showAbilities: true,
            progressBar: { enabled: true, colour: '#2ecc71' },
        };

        const basePlayer = {
            maxEnergy: 100,
            isEnergyExhausted: false,
            isPoisonedActive: false,
            isBluePotionActive: false,
        };

        const threeLineLeftArrowText = ({ startX, textX, textY, text, maxW = 330 }) => ([
            arrowFromTo(startX, 230, startX, textY - 10, { lineW: 6, outlineW: 10 }),
            this.createTextBlock({
                text,
                x: textX,
                y: textY + 10,
                maxW,
                lineH: 30,
                font: 'bold 24px "Gloria Hallelujah"',
                align: 'left',
            }),
        ]);

        return [
            this.createPage('User Interface: Coins (1)', [
                this.createPlayerAnimation({ state: 'STANDING', x: cx, y: groundY }),
                ...infoArrowText({
                    startX: 110, startY: 30,
                    textX: 460, textY: 60,
                    text: 'You get coins by killing enemies or projectiles!',
                    maxW: 290,
                    arrowToY: (ty) => ty + 18,
                }),
            ]),

            this.createPage('User Interface: Time (2)', [
                this.createPlayerAnimation({ state: 'STANDING', x: cx, y: groundY }),
                ...(() => {
                    const textX = 460;
                    const textY = 60;
                    return [
                        bentArrowFromTo(125, 53, 210, 6, textX - 18, textY + 18, { lineW: 6, outlineW: 10 }),
                        this.createTextBlock({
                            text: 'At the start of game, the time starts counting!',
                            x: textX,
                            y: textY,
                            maxW: 350,
                            lineH: 30,
                            font: 'bold 24px "Gloria Hallelujah"',
                            align: 'left',
                        }),
                    ];
                })(),
            ]),

            this.createPage('User Interface: Lives (3)', [
                this.createPlayerAnimation({ state: 'STANDING', x: cx, y: groundY }),
                ...infoArrowText({
                    startX: 228, startY: 70,
                    textX: 460, textY: 100,
                    text: 'These are your lives.\nReaching 0 is Game Over!',
                    maxW: 420,
                    arrowToY: (ty) => ty + 22,
                }),
            ]),

            this.createPage('User Interface: Energy (4)', [
                this.createPlayerAnimation({ state: 'STANDING', x: cx, y: groundY }),
                ...infoArrowText({
                    startX: 275, startY: 109,
                    textX: 460, textY: 140,
                    text: 'This is your Energy. Some abilities will require Energy to be used!',
                    maxW: 490,
                    arrowToY: (ty) => ty + 25,
                }),
            ]),

            this.createPage('User Interface: Abilities (5)', [
                this.createPlayerAnimation({ state: 'STANDING', x: cx, y: groundY }),

                ...(() => {
                    const textX = 30;
                    const textY = 260;

                    const arrows = [50, 110, 170, 230].map((startX, i) =>
                        arrowFromTo(startX, 205, startX, textY - 10, { lineW: 6, outlineW: 10 }),
                    );

                    return [
                        arrows[0],
                        this.createTextBlock({
                            text: 'These are your abilities to kill enemies or to avoid taking damage!',
                            x: textX,
                            y: textY + 10,
                            maxW: 430,
                            lineH: 30,
                            font: 'bold 24px "Gloria Hallelujah"',
                            align: 'left',
                        }),
                        ...arrows.slice(1),
                    ];
                })(),
            ]),

            this.createPage('User Interface: Progress Bar (6)', [
                this.createPlayerAnimation({ state: 'STANDING', x: cx, y: groundY }),

                ...(() => {
                    const startX = cx;
                    const arrowEndY = 110;
                    const textY = 120;
                    const textOffsetY = 20;

                    return [
                        arrowFromTo(startX, 40, startX, arrowEndY, { lineW: 6, outlineW: 10 }),
                        this.createTextBlock({
                            text: 'The progress bar shows how far off you are from completing the Map!',
                            x: startX,
                            y: textY + textOffsetY,
                            maxW: 460,
                            lineH: 30,
                            font: 'bold 24px "Gloria Hallelujah"',
                            align: 'center',
                        }),
                    ];
                })(),
            ]),

            this.createPage('Movement', [
                titleBlock('Movement keys', 80),

                label('Sit down', cx + 10, groundY - 150 - 34),
                arrow(cx + 70, groundY - 20, Math.PI / 2),
                this.createKey({ key: 'S', x: cx + 10, y: groundY - 150, w: 57, h: 55, image: 'keycap' }),
                this.createPlayerAnimation({ state: 'SITTING', x: cx, y: groundY, fps: 20 }),

                label('Jump', cx + 10, groundY - 450 - 34),
                arrow(cx + 70, groundY - 340, -Math.PI / 2),
                this.createKey({ key: 'W', x: cx + 10, y: groundY - 450, w: 57, h: 55, image: 'keycap' }),
                this.createPlayerAnimation({ state: 'JUMPING', x: cx, y: groundY - 300, fps: 20 }),

                label('Move left', cx - 390, groundY - 150 - 34),
                arrow(cx - 470, groundY - 20, Math.PI),
                this.createKey({ key: 'A', x: cx - 390, y: groundY - 150, w: 57, h: 55, image: 'keycap' }),
                this.createPlayerAnimation({ state: 'RUNNING', x: cx - 400, y: groundY, fps: 20 }),

                label('Move right', cx + 410, groundY - 150 - 34),
                arrow(cx + 470, groundY - 20, 0),
                this.createKey({ key: 'D', x: cx + 410, y: groundY - 150, w: 57, h: 55, image: 'keycap' }),
                this.createPlayerAnimation({ state: 'RUNNING', x: cx + 400, y: groundY, fps: 20 }),
            ], { ...baseUI }),

            this.createPage('Abilities: Rolling (1)', [
                titleBlock('Rolling key', 260),

                this.createKeyImage({ image: 'enterKeycap', x: cx - 70, y: 350 }),
                this.createTextBlock({
                    text: 'or',
                    x: cx + 7,
                    y: 388,
                    maxW: 300,
                    lineH: 28,
                    font: 'bold 26px "Gloria Hallelujah"',
                    align: 'center',
                }),
                this.createImage({ image: 'rightClick', x: cx + 83, y: 395, anchor: 'center', scale: 1 }),

                this.createRollingDemo(),

                ...infoArrowText({
                    startX: 275,
                    startY: 106,
                    textX: 460,
                    textY: 120,
                    text: 'While holding the Rolling key, Energy gets drained quickly. When active, it deals 1 damage!',
                    maxW: 600,
                }),
            ], {
                ...baseUI,
                energyDemo: {
                    enabled: true,
                    start: 100,
                    min: 50,
                    max: 100,
                    drainTickMs: 50,
                    drainPerTick: 1.0,
                    alwaysDown: true,
                },
                player: { ...basePlayer },
            }),

            this.createPage('Abilities: Diving (2)', [
                titleBlock('Diving key\n(while in the air)', 70),

                this.createKey({ key: 'S', x: cx, y: 180, w: 57, h: 55, image: 'keycap' }),
                this.createDivingSequenceDemo(),

                ...(() => {
                    const startX = 50;
                    const textX = 30;
                    const textY = 260;
                    return [
                        arrowFromTo(startX, 205, startX, textY - 10, { lineW: 6, outlineW: 10 }),
                        this.createTextBlock({
                            text: '0.3 second cooldown before you can use it again!',
                            x: textX,
                            y: textY + 10,
                            maxW: 330,
                            lineH: 30,
                            font: 'bold 24px "Gloria Hallelujah"',
                            align: 'left',
                        }),
                    ];
                })(),

                ...infoArrowText({
                    startX: 275,
                    startY: 106,
                    textX: 460,
                    textY: 60,
                    text: 'Diving uses 0 Energy and deals 1 damage, however, it will reduce the regeneration of your Energy while active!',
                    maxW: 290,
                    arrowToY: (ty) => ty + 47,
                }),

                ...(() => {
                    const upStartX = cx - 150;
                    const upStartY = groundY - 260;

                    const downX = cx + 120;
                    const downStartY = groundY - 325;

                    return [
                        arrowFromTo(upStartX, upStartY, upStartX + 40, upStartY - 85, { lineW: 6, outlineW: 10 }),
                        arrowFromTo(downX, downStartY, downX, downStartY + 100, { lineW: 6, outlineW: 10 }),
                    ];
                })(),
            ], {
                ...baseUI,
                divingDemo: { enabled: true, waitMs: 2000, activeMs: 500, cooldownMs: 300 },
            }),

            this.createPage('Abilities: Fireball (3)', [
                titleBlock('Fireball key', 260),

                this.createKey({ key: 'Q', x: cx - 55, y: 380, w: 57, h: 55, image: 'keycap' }),
                this.createTextBlock({
                    text: 'or',
                    x: cx + 7,
                    y: 388,
                    maxW: 300,
                    lineH: 28,
                    font: 'bold 26px "Gloria Hallelujah"',
                    align: 'center',
                }),
                this.createImage({ image: 'leftClick', x: cx + 70, y: 395, anchor: 'center' }),
                this.createPlayerAnimation({ state: 'STANDING', x: cx, y: groundY, fps: 20 }),

                ...infoArrowText({
                    startX: 275,
                    startY: 106,
                    textX: 460,
                    textY: 100,
                    text: 'Fireball uses 8 Energy, dealing 1 damage!',
                    maxW: 590,
                }),

                ...(() => {
                    const startX = 110;
                    const textX = 30;
                    const textY = 260;
                    return [
                        arrowFromTo(startX, 205, startX, textY - 10, { lineW: 6, outlineW: 10 }),
                        this.createTextBlock({
                            text: '1.0 second cooldown before you can use it again!',
                            x: textX,
                            y: textY + 10,
                            maxW: 330,
                            lineH: 30,
                            font: 'bold 24px "Gloria Hallelujah"',
                            align: 'left',
                        }),
                    ];
                })(),

                this.createFireballDemo({ image: 'fireball' }),
            ], {
                ...baseUI,
                fireballDemo: {
                    enabled: true,
                    cooldownMs: 1200,
                    maxEnergy: 100,
                    startEnergy: 100,
                    energyCost: 8,
                    regenPerSec: 5.7,
                    shotDelayMs: 220,
                    direction: 'right',
                    startX: mouthX,
                    startY: mouthY,
                    speedPxPerSec: 900,
                    offscreenPad: 160,
                    initialSize: 10,
                    maxSize: 40,
                    growthPerSec: 60,
                    rotationPerSec: 12.0,
                },
                player: { ...basePlayer },
            }),

            this.createPage('Abilities: Invisible (4)', [
                titleBlock('Invisible key', 260),

                this.createKey({ key: 'E', x: cx - 55, y: 380, w: 57, h: 55, image: 'keycap' }),
                this.createTextBlock({
                    text: 'or',
                    x: cx + 7,
                    y: 388,
                    maxW: 300,
                    lineH: 28,
                    font: 'bold 26px "Gloria Hallelujah"',
                    align: 'center',
                }),
                this.createImage({ image: 'scrollWheelClick', x: cx + 76, y: 403, anchor: 'center' }),

                this.createInvisibleDemoPlayerImage({
                    state: 'STANDING',
                    x: cx,
                    y: groundY,
                    anchor: 'bottomCenter',
                    activeAlpha: 0.5,
                }),

                ...infoArrowText({
                    startX: 275,
                    startY: 106,
                    textX: 460,
                    textY: 100,
                    text: 'Invisibility costs 0 Energy. While invisible, you are immune to enemy damage and status effects (such as poison and slow)!',
                    maxW: 590,
                }),

                ...leftCooldownText({
                    startX: 170,
                    baseArrowY: 205,
                    timerShownY: 225,
                    getTimerShown: () => this._demoInvisible?.phase === 'active',
                    textX: 30,
                    textY: 260,
                    text: 'Invisibility is active for 5 seconds, and once it ends, a 35 second cooldown starts.',
                }),
            ], {
                ...baseUI,
                invisibleDemo: { enabled: true, waitMs: 1000, activeMs: 5000, cooldownMs: 35000 },
                player: { ...basePlayer },
            }),

            this.createPage('Abilities: Dashing (5)', [
                titleBlock('Dashing key', 260),

                this.createKeyImage({ image: 'shiftKeycap', x: cx - 80, y: 375 }),
                this.createTextBlock({
                    text: 'or',
                    x: cx + 7,
                    y: 388,
                    maxW: 300,
                    lineH: 28,
                    font: 'bold 26px "Gloria Hallelujah"',
                    align: 'center',
                }),
                this.createImage({ image: 'mouseButton4Click', x: cx + 80, y: 403, anchor: 'center' }),

                this.createDashSequenceDemo(),

                ...infoArrowText({
                    startX: 275,
                    startY: 106,
                    textX: 460,
                    textY: 100,
                    text: 'Dashing costs 10 Energy, dealing 3 damage for each dash. While dashing, you are immune to enemy damage and status effects (such as poison and slow)!',
                    maxW: 670,
                }),

                ...leftCooldownText({
                    startX: 230,
                    baseArrowY: 205,
                    timerShownY: 225,
                    getTimerShown: () => {
                        const d = this._demoDash;
                        return (d?.phase === 'dashing1' || d?.phase === 'afterFirst') && d?.secondWindowRemainingMs > 0;
                    },
                    textX: 90,
                    textY: 260,
                    text: 'You have 2 Dashes and after the first dash, you have 7 seconds to activate the second dash!',
                }),
            ], {
                ...baseUI,
                dashDemo: {
                    enabled: true,
                    waitMs: 1000,
                    betweenMs: 500,
                    secondWindowMs: 7000,
                    simulateSecondAtMs: 5000,
                    cooldownMs: 60000,
                    maxEnergy: 100,
                    startEnergy: 100,
                    energyCost: 10,
                    regenPerSec: 5.7,
                },
                player: { ...basePlayer },
            }),

            this.createPage('Energy Exhausted', [
                ...infoArrowText({
                    startX: 275,
                    startY: 106,
                    textX: 460,
                    textY: 92,
                    text:
                        'If your Energy reaches 0, you become Exhausted.\n' +
                        'While Exhausted, energy-based abilities are disabled until it recovers to 20.',
                    maxW: 600,
                }),

                this._createEnergyExhaustedDisabledUI(),

                this.createEnergyDemoPlayerImage({
                    downState: 'ROLLING',
                    upState: 'STANDING',
                    x: cx,
                    downY: groundY,
                    upY: groundY,
                    anchor: 'bottomCenter',
                }),
            ], {
                ...baseUI,
                energyDemo: {
                    enabled: true,
                    start: 35,
                    min: 0,
                    max: 35,
                    drainTickMs: 33,
                    drainPerTick: 0.4,
                    regenTickMs: 70,
                    regenPerTick: 0.4,
                    recoverAt: 20,
                },
                player: { maxEnergy: 100, isPoisonedActive: false, isBluePotionActive: false },
            }),

            this.createPage('Power Ups & Power Downs', [
                ...(() => {
                    const bluePotion = { x: cx - 300, y: 450 };
                    const redPotion = { x: cx - 400, y: 250 };
                    const healthLive = { x: cx - 200, y: 250 };

                    const cauldron = { x: cx + 570, y: groundY };
                    const blackhole = { x: cx + 660, y: groundY - 370 };
                    const iceDrink = { x: cx + 460, y: groundY - 270 };

                    return [
                        this.createInvisibleDemoPlayerImage({
                            state: 'STANDING',
                            x: cx,
                            y: groundY,
                            anchor: 'bottomCenter',
                        }),

                        this.createPowerEntityPreview({ key: 'blue', x: bluePotion.x, y: bluePotion.y, anchor: 'center' }),
                        this.createPowerEntityPreview({ key: 'red', x: redPotion.x, y: redPotion.y, anchor: 'center' }),
                        this.createPowerEntityPreview({ key: 'live', x: healthLive.x, y: healthLive.y, anchor: 'center' }),

                        this.createTextBlock({
                            text: 'Try to catch some Power Ups...',
                            x: cx - 480,
                            y: 120,
                            maxW: 480,
                            lineH: 30,
                            font: 'bold 28px "Gloria Hallelujah"',
                            align: 'left',
                        }),

                        this.createPowerEntityPreview({ key: 'cauldron', x: cauldron.x, y: cauldron.y, anchor: 'bottomCenter' }),
                        this.createPowerEntityPreview({ key: 'blackhole', x: blackhole.x, y: blackhole.y, anchor: 'center' }),
                        this.createPowerEntityPreview({ key: 'iceDrink', x: iceDrink.x, y: iceDrink.y, anchor: 'center' }),

                        this.createTextBlock({
                            text: '... but avoid the Power Downs!',
                            x: cx + 380,
                            y: 120,
                            maxW: 420,
                            lineH: 30,
                            font: 'bold 28px "Gloria Hallelujah"',
                            align: 'left',
                        }),
                    ];
                })(),
            ], { ...baseUI }),

            this.createPage('Enemy types', [
                this.createPlayerAnimation({ state: 'STANDING', x: cx - 200, y: groundY, fps: 20 }),
                this.createTextBlock({
                    text: 'There are 5 different types of enemies with special interactions!',
                    x: cx,
                    y: 100,
                    maxW: 600,
                    lineH: 30,
                    font: 'bold 28px "Gloria Hallelujah"',
                    align: 'center',
                }),
                ...this.createEnemyTypeShowcase({ focusType: null, dimAlpha: 0.3, cx, groundY }),
            ]),

            this.createPage('Enemy types: Yellow (1)', [
                (() => { const a = this.createHitLoopAnimation({ state: 'STUNNED', x: cx - 200, y: groundY, fps: 20, cooldownMs: 2000, phaseRef: this._hitAnimPhaseRef }); this._hitAnimResets.push(a.reset); return a; })(),
                this.createTextBlock({
                    text: 'Stun enemies have a yellowish glow!',
                    x: cx,
                    y: 100,
                    maxW: 600,
                    lineH: 30,
                    font: 'bold 28px "Gloria Hallelujah"',
                    align: 'center',
                }),

                ...infoArrowText({
                    startX: 720,
                    startY: 570,
                    textX: 460,
                    textY: 390,
                    text: 'You will take damage and be Stunned for a short period of time if you use your Rolling or Diving ability against Stun enemies, however using any other ability will not damage you!',
                    maxW: 600,
                    align: 'center',
                    arrowToX: (tx) => tx + 180,
                    arrowToY: (ty) => ty + 130,
                }),

                ...this.createEnemyTypeShowcase({ focusType: 'yellow', dimAlpha: 0.1, cx, groundY }),
            ], {
                ...baseUI,
                hitAnimPhaseRef: this._hitAnimPhaseRef,
            }),

            this.createPage('Enemy types: Red (2)', [
                (() => { const a = this.createHitLoopAnimation({ x: cx - 200, y: groundY, fps: 20, cooldownMs: 2000, phaseRef: this._hitAnimPhaseRef }); this._hitAnimResets.push(a.reset); return a; })(),
                this.createTextBlock({
                    text: 'Red enemies have a reddish glow!',
                    x: cx,
                    y: 100,
                    maxW: 600,
                    lineH: 30,
                    font: 'bold 28px "Gloria Hallelujah"',
                    align: 'center',
                }),

                ...infoArrowText({
                    startX: 720,
                    startY: 570,
                    textX: 460,
                    textY: 390,
                    text: 'You will take damage if you use your Rolling ability against Red enemies, however using any other ability will not damage you!',
                    maxW: 400,
                    align: 'center',
                    arrowToX: (tx) => tx + 180,
                    arrowToY: (ty) => ty + 110,
                }),

                ...this.createEnemyTypeShowcase({ focusType: 'red', dimAlpha: 0.1, cx, groundY }),
            ], {
                ...baseUI,
                hitAnimPhaseRef: this._hitAnimPhaseRef,
            }),

            this.createPage('Enemy types: Poison (3)', [
                ...infoArrowText({
                    startX: 275,
                    startY: 106,
                    textX: 460,
                    textY: 200,
                    text: 'While poisoned, your Energy will start dropping!',
                    maxW: 400,
                }),

                this.createAnimatedStatusTintedPlayer({
                    state: 'STANDING',
                    x: cx - 200,
                    y: groundY,
                    anchor: 'bottomCenter',
                    poisoned: true,
                    fps: 20,
                }),

                this.createStatusParticlesOverlay({
                    type: 'poison',
                    x: cx - 200,
                    y: groundY,
                    anchor: 'bottomCenter',
                }),

                this.createTextBlock({
                    text: 'Poison enemies have a greenish glow!',
                    x: cx,
                    y: 100,
                    maxW: 600,
                    lineH: 30,
                    font: 'bold 28px "Gloria Hallelujah"',
                    align: 'center',
                }),

                ...infoArrowText({
                    startX: 700,
                    startY: 570,
                    textX: 460,
                    textY: 390,
                    text: 'You will get poisoned if you get in contact with a poison enemy!',
                    maxW: 500,
                    align: 'center',
                    arrowToX: (tx) => tx + 90,
                    arrowToY: (ty) => ty + 70,
                }),

                ...this.createEnemyTypeShowcase({ focusType: 'poison', dimAlpha: 0.1, cx, groundY }),
            ], {
                ...baseUI,
                energyDemo: {
                    enabled: true,
                    start: 100,
                    min: 50,
                    max: 100,
                    drainTickMs: 50,
                    drainPerTick: 1.0,
                    alwaysDown: true,
                },
                player: {
                    ...basePlayer,
                    isPoisonedActive: true,
                    isEnergyExhausted: false,
                },
            }),

            this.createPage('Enemy types: Slow (4)', [
                ...infoArrowText({
                    startX: 700,
                    startY: 580,
                    textX: 460,
                    textY: 390,
                    text: 'While slowed, your movement will be slower!',
                    maxW: 400,
                    align: 'center',
                    arrowToX: (tx) => tx + 80,
                    arrowToY: (ty) => ty + 60,
                }),

                this.createAnimatedStatusTintedPlayer({
                    state: 'STANDING',
                    x: cx - 200,
                    y: groundY,
                    anchor: 'bottomCenter',
                    slowed: true,
                    fps: 20,
                }),

                this.createStatusParticlesOverlay({
                    type: 'slow',
                    x: cx - 200,
                    y: groundY,
                    anchor: 'bottomCenter',
                }),

                this.createTextBlock({
                    text: 'Slow enemies have a bluish glow!',
                    x: cx,
                    y: 100,
                    maxW: 600,
                    lineH: 30,
                    font: 'bold 28px "Gloria Hallelujah"',
                    align: 'center',
                }),

                ...this.createEnemyTypeShowcase({ focusType: 'slow', dimAlpha: 0.1, cx, groundY }),
            ]),

            this.createPage('Enemy types: Freeze (5)', [
                ...infoArrowText({
                    startX: 680,
                    startY: 580,
                    textX: 460,
                    textY: 390,
                    text: 'You will take damage and be Frozen for a short period of time if you use your Rolling or Diving ability against Frozen enemies, however using any other ability will not damage you!',
                    maxW: 500,
                    align: 'center',
                    arrowToX: (tx) => tx + 60,
                    arrowToY: (ty) => ty + 80,
                }),

                this.createFrozenPlayerAnimation({ x: cx - 200, y: groundY }),

                this.createTextBlock({
                    text: 'Frozen enemies have a cyanish glow!',
                    x: cx,
                    y: 100,
                    maxW: 600,
                    lineH: 30,
                    font: 'bold 28px "Gloria Hallelujah"',
                    align: 'center',
                }),

                ...this.createEnemyTypeShowcase({ focusType: 'freeze', dimAlpha: 0.1, cx, groundY }),
            ], {
                ...baseUI,
                player: { ...basePlayer, isFrozen: true },
            }),
        ];
    }
};
