import { BaseMenu } from './baseMenu.js';
import { screenColourFadeIn, screenColourFadeOut } from '../animations/screenColourFade.js';
import { BluePotion, HealthLive, Cauldron, BlackHole, IceDrink, RedPotion } from '../entities/powerUpAndDown.js';
import { PoisonBubbles, IceCrystalBubbles } from '../animations/particles.js';
import { FIREDOG_FRAME } from '../config/skinsAndCosmetics.js';

export class HowToPlayMenu extends BaseMenu {
    constructor(game) {
        const menuOptions = ['Next', 'Previous', 'Go Back'];
        super(game, menuOptions, '');

        this.backgroundImage = document.getElementById('mainmenubackgroundhowtoplay');
        this.showStarsSticker = false;

        this.centerX = this.game.width - 90;
        this.positionOffset = -115;

        this.assets = this._buildAssets();

        this._spriteDemos = new Map();
        this._powerPreview = null;

        this._demoEnergy = this._createEnergyDemoState();
        this._demoDiving = this._createDivingDemoState();
        this._demoFireball = this._createFireballDemoState();
        this._demoInvisible = this._createInvisibleDemoState();
        this._demoDash = this._createDashDemoState();

        this._demoInvisibleColourOpacity = 0;
        this._demoRollingSeq = null;
        this._demoDivingSeq = null;
        this._demoEnergyFireSeq = null;

        this._menuParticles = [];
        this._menuParticleTimers = { poison: 0, slow: 0 };

        this._lastPageIndex = -1;
        this._hitAnimPhaseRef = { phase: 'hit' };
        this._hitAnimResets = [];
        this.pages = this._buildPages();
        this.currentPage = 0;

        this._tintCache = new Map();
    }

    // ---------------- small utilities ----------------
    update(deltaTime) {
        this._lastDt = deltaTime;
        super.update(deltaTime);
    }

    _dt() {
        if (typeof this._lastDt === 'number') return this._lastDt;
        if (typeof this.game.deltaTime === 'number') return this.game.deltaTime;
        return 16;
    }

    _num(v, fallback) {
        return Number.isFinite(Number(v)) ? Number(v) : fallback;
    }

    _clamp(v, a, b) {
        v = Number(v) || 0;
        return Math.max(a, Math.min(b, v));
    }

    _stepFireArcs(arcs, dtScale, gameSpeed = 0) {
        for (const arc of arcs) {
            arc.x -= (arc.speedX + gameSpeed) * dtScale;
            arc.y -= arc.speedY * dtScale;
            arc.size *= Math.pow(0.97, dtScale);
            arc.angle += arc.va * dtScale;
            arc.x += Math.sin(arc.angle * 5) * dtScale;
        }
        return arcs.filter(a => a.size >= 0.5);
    }

    _getTutorialProgressPercentage() {
        const total = Math.max(1, (this.pages?.length ?? 1) - 1);
        const idx = this._clamp(this.currentPage ?? 0, 0, total);
        return (idx / total) * 100;
    }

    // ---------------- navigation ----------------
    nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.currentPage++;
            super.handleMenuSelection();
        }
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            super.handleMenuSelection();
        }
    }

    handleKeyDown(event) {
        super.handleKeyDown(event);
        if (!this.menuActive) return;
        if (event.key === 'ArrowLeft') this.previousPage();
        if (event.key === 'ArrowRight') this.nextPage();
    }

    activateMenu(selectedOption = 0) {
        this.currentPage = 0;
        this._lastPageIndex = -1;
        this._resetDemosOnPageChange();
        super.activateMenu(selectedOption);
    }

    handleMenuSelection() {
        const selected = this.menuOptions[this.selectedOption];
        if (selected === 'Next') return this.nextPage();
        if (selected === 'Previous') return this.previousPage();

        if (selected === 'Go Back') {
            this.currentPage = 0;
            this._lastPageIndex = -1;
            this._resetDemosOnPageChange();
            super.handleMenuSelection();
            this.game.goBackMenu();
        }
    }

    // ---------------- assets / pages ----------------
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
    }

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
    }

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

    // ---------------- enemy showcase ----------------
    createClimbThread({ x, yTop = 0, yEnd, lineW = 0.4, alpha = 1 }) {
        return {
            draw: (ctx) => {
                const a = this._num(alpha, 1);
                if (a <= 0) return;

                const dpr = window.devicePixelRatio || 1;

                const x0 = Math.round(Number(x) || 0);
                const y0 = Math.round(Number(yTop) || 0);
                const y1 = Math.round(Number(yEnd) || 0);

                ctx.save();
                ctx.globalAlpha = a;
                ctx.lineWidth = lineW / dpr;
                ctx.strokeStyle = 'black';
                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(x0, y1);
                ctx.stroke();
                ctx.restore();
            },
        };
    }

    _getEnemyPreviewSpecs(cx, groundY) {
        const groundLine = groundY + 15;
        const topLine = 20;

        const xSkulnap = cx + 320;
        const xGloomlet = cx + 500;
        const xDuskPlant = cx + 650;
        const xSlow = cx + 500;
        const xFreeze = cx + 720;

        return [
            {
                type: 'yellow',
                label: 'Yellow',
                image: 'skulnap',
                key: 'enemy_skulnap_sleep',
                fps: 20,
                maxFrame: 10,
                frameY: 0,
                frameW: 57,
                frameH: 57,
                w: 57,
                h: 57,
                x: xSkulnap,
                y: groundLine,
                anchor: 'bottomCenter',
                glowColor: 'yellow',
                shadowBlur: 10,
            },
            {
                type: 'red',
                label: 'Red',
                image: 'gloomlet',
                key: 'enemy_gloomlet',
                fps: 10,
                maxFrame: 4,
                frameY: 0,
                frameW: 78,
                frameH: 75,
                w: 78,
                h: 75,
                x: xGloomlet,
                y: groundLine - 250,
                anchor: 'bottomCenter',
                glowColor: 'red',
                shadowBlur: 10,
            },
            {
                type: 'poison',
                label: 'Poison',
                image: 'bigGreener',
                key: 'enemy_biggreener',
                fps: 15,
                maxFrame: 1,
                frameY: 0,
                frameW: 113,
                frameH: 150,
                w: 113,
                h: 150,
                x: xDuskPlant,
                y: groundLine,
                anchor: 'bottomCenter',
                glowColor: 'green',
                shadowBlur: 10,
            },
            {
                type: 'slow',
                label: 'Slow',
                image: 'iceSilknoir',
                key: 'enemy_icesilknoir_slow',
                fps: 20,
                maxFrame: 5,
                frameY: 0,
                frameW: 120,
                frameH: 144,
                w: 120,
                h: 144,
                x: xSlow,
                y: topLine,
                anchor: 'topLeft',
                glowColor: 'blue',
                shadowBlur: 10,
            },
            {
                type: 'freeze',
                label: 'Freeze',
                image: 'crystalWasp',
                key: 'enemy_crystalwasp_freeze',
                fps: 20,
                maxFrame: 5,
                frameY: 0,
                frameW: 111.8333333333333,
                frameH: 110,
                w: 111.8333333333333,
                h: 110,
                x: xFreeze,
                y: topLine + 200,
                anchor: 'topLeft',
                glowColor: '#00eaff',
                shadowBlur: 18,
            },
        ];
    }

    createEnemyTypeShowcase({ focusType = null, dimAlpha = 0.3, cx = 0, groundY = 0 }) {
        const specs = this._getEnemyPreviewSpecs(cx, groundY);
        const isSpider = (t) => t === 'slow';

        const out = [];
        for (const s of specs) {
            const alpha = !focusType ? 1 : (s.type === focusType ? 1 : dimAlpha);

            if (isSpider(s.type)) {
                const threadX = s.x + s.w / 2;
                const threadEndY = s.y + Math.min(60, s.h * 0.55);
                out.push(this.createClimbThread({ x: threadX, yTop: 0, yEnd: threadEndY, lineW: 1, alpha }));
            }

            out.push(this.createAnimatedGlowSpriteWithAlpha({ ...s, alpha }));
        }
        return out;
    }

    // ---------------- page helpers ----------------
    _flattenDrawables(drawables) {
        const out = [];
        const push = (v) => {
            if (!v) return;
            if (Array.isArray(v)) for (const a of v) push(a);
            else out.push(v);
        };
        push(drawables);
        return out;
    }

    createPage(title, drawables = [], ui = null) {
        return { title, drawables: this._flattenDrawables(drawables), ui };
    }

    getAsset(name) {
        return this.assets[name] || null;
    }

    getCurrentPage() {
        return this.pages?.[this.currentPage] || null;
    }

    getCurrentPageUIConfig() {
        return this.getCurrentPage()?.ui || null;
    }

    // ---------------- demo State Factories ----------------
    _createEnergyDemoState() {
        return { active: false, timer: 0, value: 35, dir: 'down', exhausted: false };
    }

    _createDivingDemoState() {
        return {
            active: false,
            phase: 'wait',
            timer: 0,
            waitMs: 2000,
            activeMs: 500,
            cooldownMs: 300,
            activeRemainingMs: 0,
            cooldownElapsedMs: 0,
        };
    }

    _createFireballDemoState() {
        return {
            active: false,
            state: 'idle',
            x: 0,
            y: 0,
            size: 10,
            angle: 0,
            timer: 0,
            cdTimer: 0,
            cooldownMs: 1200,
            energy: 100,
        };
    }

    _createInvisibleDemoState() {
        return {
            active: false,
            phase: 'wait',
            timer: 0,
            waitMs: 1000,
            activeMs: 5000,
            cooldownMs: 35000,
            activeRemainingMs: 0,
            cooldownElapsedMs: 0,
        };
    }

    _createDashDemoState() {
        return {
            active: false,
            phase: 'wait',   // 'wait' | 'dashing1' | 'afterFirst' | 'dashing2' | 'cooldown'
            timer: 0,
            waitMs: 1000,
            dashDuration: 180,
            betweenMs: 500,
            secondWindowMs: 7000,
            simulateSecondAtMs: 5000,
            cooldownMs: 60000,
            betweenElapsedMs: 0,
            secondWindowRemainingMs: 0,
            energy: 100,
            maxEnergy: 100,
            // visual
            playerX: 120,
            startX: 120,
            spriteFrameX: 0,
            spriteFrameTimer: 0,
            fireArcs: [],
            fireTimer: 0,
            ghosts: [],
            ghostTimer: 0,
        };
    }

    // ---------------- animated glow sprites ----------------
    _createOrGetSpriteDemoState(key, fps = 4, maxFrame = 0) {
        if (!this._spriteDemos) this._spriteDemos = new Map();

        let s = this._spriteDemos.get(key);
        if (!s) {
            s = { frameX: 0, timer: 0, fps: 4, frameInterval: 250, maxFrame: 0 };
            this._spriteDemos.set(key, s);
        }

        s.fps = Math.max(1, this._num(fps, 4));
        s.frameInterval = 1000 / s.fps;
        s.maxFrame = Math.max(0, this._num(maxFrame, 0));
        return s;
    }

    _drawAnimatedGlowSprite(ctx, o) {
        const img = this.getAsset(o.image);
        if (!img) return;

        const key = String(o.key || o.image || 'sprite');
        const s = this._createOrGetSpriteDemoState(key, o.fps, o.maxFrame);

        s.timer += Math.max(0, this._dt());
        while (s.timer >= s.frameInterval) {
            s.timer -= s.frameInterval;
            s.frameX = (s.frameX < s.maxFrame) ? (s.frameX + 1) : 0;
        }

        const frameW = this._num(o.frameW ?? o.frameWidth ?? img.width, img.width);
        const frameH = this._num(o.frameH ?? o.frameHeight ?? img.height, img.height);
        const frameY = this._num(o.frameY ?? 0, 0);

        const w = this._num(o.w ?? frameW, frameW);
        const h = this._num(o.h ?? frameH, frameH);

        const anchor = o.anchor ?? 'center';

        let dx = this._num(o.x ?? 0, 0);
        let dy = this._num(o.y ?? 0, 0);

        if (anchor === 'center') {
            dx -= w / 2;
            dy -= h / 2;
        } else if (anchor === 'bottomCenter') {
            dx -= w / 2;
            dy -= h;
        }

        const rot = this._num(o.rotation ?? 0, 0);

        ctx.save();
        ctx.shadowColor = o.glowColor || 'yellow';
        ctx.shadowBlur = Number.isFinite(Number(o.shadowBlur)) ? Number(o.shadowBlur) : 10;

        if (rot !== 0) {
            const ccx = dx + w / 2;
            const ccy = dy + h / 2;
            ctx.translate(ccx, ccy);
            ctx.rotate(rot);
            ctx.translate(-ccx, -ccy);
        }

        if (o.flip) {
            const midX = Math.round(dx + w / 2);
            ctx.translate(midX, 0);
            ctx.scale(-1, 1);
            ctx.translate(-midX, 0);
        }

        ctx.drawImage(
            img,
            s.frameX * frameW,
            frameY * frameH,
            frameW,
            frameH,
            Math.round(dx),
            Math.round(dy),
            Math.round(w),
            Math.round(h),
        );

        ctx.restore();
    }

    createAnimatedGlowSprite(o) {
        return { draw: (ctx) => this._drawAnimatedGlowSprite(ctx, o) };
    }

    _drawAnimatedGlowSpriteWithAlpha(ctx, o) {
        const alpha = this._clamp(o.alpha, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        this._drawAnimatedGlowSprite(ctx, o);
        ctx.restore();
    }

    createAnimatedGlowSpriteWithAlpha(o) {
        return { draw: (ctx) => this._drawAnimatedGlowSpriteWithAlpha(ctx, o) };
    }

    // ---------------- animated player sprite ----------------
    static get _PLAYER_ANIM() {
        return {
            STANDING: { frameY: 0, maxFrame: 6 },
            JUMPING: { frameY: 1, maxFrame: 6 },
            FALLING: { frameY: 2, maxFrame: 6 },
            RUNNING: { frameY: 3, maxFrame: 8 },
            DASHING: { frameY: 3, maxFrame: 8 },
            SITTING: { frameY: 5, maxFrame: 4 },
            ROLLING: { frameY: 6, maxFrame: 6 },
            DIVING: { frameY: 6, maxFrame: 6 },
            STUNNED: { frameY: 4, maxFrame: 10 },
            HIT: { frameY: 9, maxFrame: 3 },
        };
    }

    createPlayerAnimation({ state = 'STANDING', x, y, anchor = 'bottomCenter', fps = 20, flip = false, scale = 1 } = {}) {
        const cfg = HowToPlayMenu._PLAYER_ANIM[state] ?? HowToPlayMenu._PLAYER_ANIM.STANDING;
        return this.createAnimatedGlowSprite({
            image: 'defaultSkin',
            key: `player_${state}${flip ? '_flip' : ''}_${Math.round(x)}_${Math.round(y)}`,
            frameW: FIREDOG_FRAME.width,
            frameH: FIREDOG_FRAME.height,
            frameY: cfg.frameY,
            maxFrame: cfg.maxFrame,
            fps,
            w: FIREDOG_FRAME.width * scale,
            h: FIREDOG_FRAME.height * scale,
            x,
            y,
            anchor,
            shadowBlur: 0,
            flip,
        });
    }

    createFrozenPlayerAnimation({ x, y, anchor = 'bottomCenter' } = {}) {
        const { width: FW, height: FH } = FIREDOG_FRAME;
        const hitCfg = HowToPlayMenu._PLAYER_ANIM.HIT;
        let pulseTimer = 0;

        return {
            draw: (ctx) => {
                const dt = Math.max(0, this._dt());
                pulseTimer += dt;

                const phase = pulseTimer * 0.009;
                const dip = 0.5 * (1 - Math.cos(phase));
                let opacity = 0.5 - 0.2 * dip;
                if (opacity < 0.05) opacity = 0.05;
                if (opacity > 0.5) opacity = 0.5;

                let dx = this._num(x, 0);
                let dy = this._num(y, 0);
                if (anchor === 'bottomCenter') { dx -= FW / 2; dy -= FH; }

                const sprite = this.getAsset('defaultSkin');
                if (sprite) {
                    ctx.save();
                    ctx.shadowBlur = 0;
                    ctx.drawImage(sprite, 0, hitCfg.frameY * FH, FW, FH, Math.round(dx), Math.round(dy), FW, FH);
                    ctx.restore();
                }

                const iceImg = this.getAsset('frozenIce');
                if (iceImg) {
                    const iceScale = 1.1;
                    const iceW = FW * iceScale;
                    const iceH = FH * iceScale;
                    const iceX = dx + FW / 2 - iceW / 2;
                    const iceY = dy + FH / 2 - iceH / 2 + 10;
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(iceImg, Math.round(iceX), Math.round(iceY), Math.round(iceW), Math.round(iceH));
                    ctx.restore();
                }
            },
        };
    }

    createHitLoopAnimation({ x, y, anchor = 'bottomCenter', fps = 20, cooldownMs = 2000, delayMs = 700, state = 'HIT', phaseRef = null } = {}) {
        const { width: FW, height: FH } = FIREDOG_FRAME;
        const hitCfg = HowToPlayMenu._PLAYER_ANIM[state] ?? HowToPlayMenu._PLAYER_ANIM.HIT;
        const standCfg = HowToPlayMenu._PLAYER_ANIM.STANDING;
        const frameInterval = 1000 / fps;

        let phase = 'delay';
        let delayTimer = 0;
        let frameX = 0;
        let frameTimer = 0;
        let cooldownTimer = 0;

        return {
            draw: (ctx) => {
                const dt = Math.max(0, this._dt());

                if (phase === 'delay') {
                    delayTimer += dt;
                    frameTimer += dt;
                    while (frameTimer >= frameInterval) {
                        frameTimer -= frameInterval;
                        frameX = (frameX < standCfg.maxFrame) ? frameX + 1 : 0;
                    }
                    if (delayTimer >= delayMs) {
                        phase = 'hit';
                        frameX = 0;
                        frameTimer = 0;
                    }
                } else if (phase === 'hit') {
                    frameTimer += dt;
                    while (frameTimer >= frameInterval) {
                        frameTimer -= frameInterval;
                        if (frameX < hitCfg.maxFrame) {
                            frameX++;
                        } else {
                            phase = 'standing';
                            frameX = 0;
                            frameTimer = 0;
                            cooldownTimer = 0;
                            break;
                        }
                    }
                } else {
                    frameTimer += dt;
                    while (frameTimer >= frameInterval) {
                        frameTimer -= frameInterval;
                        frameX = (frameX < standCfg.maxFrame) ? frameX + 1 : 0;
                    }
                    cooldownTimer += dt;
                    if (cooldownTimer >= cooldownMs) {
                        phase = 'hit';
                        frameX = 0;
                        frameTimer = 0;
                    }
                }

                if (phaseRef) phaseRef.phase = phase;

                const cfg = (phase === 'hit') ? hitCfg : standCfg;
                let dx = this._num(x, 0);
                let dy = this._num(y, 0);
                if (anchor === 'bottomCenter') { dx -= FW / 2; dy -= FH; }

                const sprite = this.getAsset('defaultSkin');
                if (!sprite) return;

                ctx.save();
                ctx.shadowBlur = 0;
                ctx.drawImage(sprite, frameX * FW, cfg.frameY * FH, FW, FH, Math.round(dx), Math.round(dy), FW, FH);
                ctx.restore();
            },
            reset: () => {
                phase = 'delay';
                delayTimer = 0;
                frameX = 0;
                frameTimer = 0;
                cooldownTimer = 0;
                if (phaseRef) phaseRef.phase = 'delay';
            },
        };
    }

    _drawAnimatedStatusTintedPlayer(ctx, o) {
        const img = this.assets?.defaultSkin;
        if (!img) return;

        const cfg = HowToPlayMenu._PLAYER_ANIM[o.state ?? 'STANDING'] ?? HowToPlayMenu._PLAYER_ANIM.STANDING;
        const key = `player_tinted_${o.state ?? 'STANDING'}_${Math.round(o.x ?? 0)}_${Math.round(o.y ?? 0)}`;
        const s = this._createOrGetSpriteDemoState(key, o.fps ?? 20, cfg.maxFrame);

        s.timer += Math.max(0, this._dt());
        while (s.timer >= s.frameInterval) {
            s.timer -= s.frameInterval;
            s.frameX = s.frameX < s.maxFrame ? s.frameX + 1 : 0;
        }

        const { width: fw, height: fh } = FIREDOG_FRAME;
        const sx = s.frameX * fw;
        const sy = cfg.frameY * fh;
        const w = o.w ?? fw, h = o.h ?? fh;
        let dx = o.x ?? 0, dy = o.y ?? 0;
        const anchor = o.anchor ?? 'bottomCenter';
        if (anchor === 'center') { dx -= w / 2; dy -= h / 2; }
        else if (anchor === 'bottomCenter') { dx -= w / 2; dy -= h; }
        else if (anchor === 'bottomLeft') { dy -= h; }

        if (!this._playerFrameCanvas) {
            this._playerFrameCanvas = document.createElement('canvas');
            this._playerFrameCanvas.width = FIREDOG_FRAME.width;
            this._playerFrameCanvas.height = 92;
        }
        const fc = this._playerFrameCanvas;
        const fctx = fc.getContext('2d');
        fctx.clearRect(0, 0, fc.width, fc.height);
        fctx.drawImage(img, sx, sy, fw, fh, 0, 0, fc.width, fc.height);

        if (o.poisoned || o.slowed) {
            fctx.globalCompositeOperation = 'source-atop';
            fctx.fillStyle = o.poisoned ? 'rgba(0,100,0,0.40)' : 'rgba(0,120,255,0.35)';
            fctx.fillRect(0, 0, fc.width, fc.height);
            fctx.globalCompositeOperation = 'source-over';
        }

        ctx.save();
        if (o.poisoned) { ctx.shadowColor = 'rgba(0,130,0,1)'; ctx.shadowBlur = 6; }
        else if (o.slowed) { ctx.shadowColor = 'rgba(0,160,255,1)'; ctx.shadowBlur = 6; }
        ctx.drawImage(fc, Math.round(dx), Math.round(dy), Math.round(w), Math.round(h));
        ctx.restore();
    }

    createAnimatedStatusTintedPlayer(o) {
        return { draw: (ctx) => this._drawAnimatedStatusTintedPlayer(ctx, o) };
    }

    // ---------------- sequence demos (rolling / diving / dash) ----------------
    _spawnDemoFireArc(mouthX, mouthY, playerX) {
        const forward = 18 + Math.random() * 50;
        let spawnX = mouthX + forward;
        if (spawnX > this.game.width) spawnX = mouthX - (8 + Math.random() * 24);

        const trail = 1.6 + Math.random() * 2.2;
        const spread = (Math.random() * 24 - 12) * (Math.PI / 180);

        return {
            x: spawnX,
            y: mouthY + (Math.random() * 16 - 8),
            size: 45 + Math.random() * 40,
            speedX: Math.cos(spread) * trail,
            speedY: (1.4 + Math.random() * 2.4) * (Math.random() < 0.5 ? 1 : -1),
            drag: 0.985 + Math.random() * 0.01,
            damp: 0.985 + Math.random() * 0.01,
            angle: Math.random() * Math.PI * 2,
            va: Math.random() * 0.14 - 0.07,
            wobbleAmp: 0.4 + Math.random() * 0.7,
            age: 0,
            followMs: 130 + Math.random() * 90,
            followFactor: 0.95,
            lastPlayerX: playerX,
        };
    }

    createDashSequenceDemo() {
        const { width: FW, height: FH } = FIREDOG_FRAME;
        const ROW_RUNNING = 3, ROW_STANDING = 0;

        return {
            draw: (ctx) => {
                const d = this._demoDash;
                if (!d || !d.active) return;

                const groundY = this.game.height - this.game.groundMargin;
                const img = this.assets?.defaultSkin;
                if (!img) return;

                const isDashing = d.phase === 'dashing1' || d.phase === 'dashing2';
                const spriteRow = isDashing ? ROW_RUNNING : ROW_STANDING;

                for (const g of [...(d.ghosts || [])].reverse()) {
                    ctx.save();
                    ctx.globalAlpha = g.alpha;
                    ctx.drawImage(img, g.frameX * FW, g.frameY * FH, FW, FH,
                        Math.round(g.x - FW / 2), Math.round(groundY - FH), FW, FH);
                    ctx.restore();
                }

                const sx = (d.spriteFrameX || 0) * FW;
                const sy = spriteRow * FH;
                ctx.drawImage(img, sx, sy, FW, FH,
                    Math.round(d.playerX - FW / 2), Math.round(groundY - FH), FW, FH);

                const fireImg = document.getElementById('fire');
                if (fireImg) {
                    for (const arc of (d.fireArcs || [])) {
                        ctx.save();
                        ctx.translate(arc.x, arc.y);
                        ctx.rotate(arc.angle);
                        ctx.drawImage(fireImg, -arc.size * 0.5, -arc.size * 0.5, arc.size, arc.size);
                        ctx.restore();
                    }
                }
            },
        };
    }

    createRollingDemo() {
        const { width: FW, height: FH } = FIREDOG_FRAME;
        const ROW_ROLLING = 6, MAX_FRAME = 6;
        const FRAME_INTERVAL = 1000 / 20;
        const FIRE_INTERVAL_MS = 1000 / 31;

        return {
            draw: (ctx) => {
                if (!this._demoRollingSeq) {
                    this._demoRollingSeq = { fireArcs: [], fireTimer: 0, spriteFrameX: 0, spriteFrameTimer: 0 };
                }
                const s = this._demoRollingSeq;
                const dt = Math.max(0, this._dt());
                const dtScale = dt / 16;
                const groundY = this.game.height - this.game.groundMargin;
                const playerCX = this.game.width / 2 - 10;
                const playerTopY = groundY - FH;
                const fireCX = playerCX;
                const fireCY = playerTopY + FH * 0.5;

                s.spriteFrameTimer += dt;
                while (s.spriteFrameTimer >= FRAME_INTERVAL) {
                    s.spriteFrameTimer -= FRAME_INTERVAL;
                    s.spriteFrameX = (s.spriteFrameX + 1) % (MAX_FRAME + 1);
                }

                const GAME_SPEED = this.game.normalSpeed ?? 6;

                s.fireTimer += dt;
                while (s.fireTimer >= FIRE_INTERVAL_MS) {
                    s.fireTimer -= FIRE_INTERVAL_MS;
                    s.fireArcs.push({
                        x: fireCX,
                        y: fireCY,
                        size: Math.random() * 100 + 50,
                        speedX: 1,
                        speedY: 1,
                        angle: 0,
                        va: Math.random() * 0.2 - 0.1,
                    });
                }

                s.fireArcs = this._stepFireArcs(s.fireArcs, dtScale, GAME_SPEED);

                const img = this.assets?.defaultSkin;
                if (!img) return;

                ctx.drawImage(img,
                    s.spriteFrameX * FW, ROW_ROLLING * FH, FW, FH,
                    Math.round(playerCX - FW / 2), Math.round(playerTopY), FW, FH);

                const fireImg = document.getElementById('fire');
                if (fireImg) {
                    for (const arc of s.fireArcs) {
                        ctx.save();
                        ctx.translate(arc.x, arc.y);
                        ctx.rotate(arc.angle);
                        ctx.drawImage(fireImg, -arc.size * 0.5, -arc.size * 0.5, arc.size, arc.size);
                        ctx.restore();
                    }
                }
            },
        };
    }

    createDivingSequenceDemo() {
        const { width: FW, height: FH } = FIREDOG_FRAME;
        const ROW_STANDING = 0, ROW_JUMPING = 1, ROW_DIVING = 6;
        const MAX_FRAME_STAND = 6, MAX_FRAME_JUMP = 6, MAX_FRAME_DIVE = 6;
        const FRAME_INTERVAL = 1000 / 20;
        const FIRE_INTERVAL_MS = 1000 / 31;
        const STAND_MS = 1200, SETTLE_MS = 900;

        return {
            draw: (ctx) => {
                if (!this._demoDivingSeq) {
                    const groundY = this.game.height - this.game.groundMargin;
                    this._demoDivingSeq = {
                        phase: 'stand',   // 'stand' | 'jump' | 'dive' | 'settle'
                        timer: 0,
                        playerTopY: groundY - FH,
                        vy: 0,
                        fireArcs: [],
                        fireTimer: 0,
                        splashArcs: [],
                        spriteFrameX: 0,
                        spriteFrameTimer: 0,
                    };
                }
                const s = this._demoDivingSeq;
                const dt = Math.max(0, this._dt());
                const dtScale = dt / 16;
                const groundY = this.game.height - this.game.groundMargin;
                const groundTopY = groundY - FH;
                const playerCX = this.game.width / 2;

                s.timer += dt;

                if (s.phase === 'stand') {
                    s.playerTopY = groundTopY;
                    s.vy = 0;
                    if (s.timer >= STAND_MS) {
                        s.phase = 'jump';
                        s.timer = 0;
                        s.vy = -27;
                        s.spriteFrameX = 0;
                        s.fireArcs = [];
                    }
                } else if (s.phase === 'jump') {
                    s.playerTopY += s.vy * dtScale;
                    s.vy += 1 * dtScale;
                    if (s.vy > 1) {
                        s.phase = 'dive';
                        s.vy = 15;
                        s.timer = 0;
                        s.fireTimer = 0;
                        s.spriteFrameX = 0;
                    }
                } else if (s.phase === 'dive') {
                    s.playerTopY += s.vy * dtScale;
                    s.vy += 1 * dtScale;

                    s.fireTimer += dt;
                    while (s.fireTimer >= FIRE_INTERVAL_MS) {
                        s.fireTimer -= FIRE_INTERVAL_MS;
                        s.fireArcs.push({
                            x: playerCX,
                            y: s.playerTopY + FH * 0.5,
                            size: Math.random() * 100 + 50,
                            speedX: 1, speedY: 1, angle: 0,
                            va: Math.random() * 0.2 - 0.1,
                        });
                    }

                    if (s.playerTopY >= groundTopY) {
                        s.playerTopY = groundTopY;
                        s.phase = 'settle';
                        s.timer = 0;
                        s.fireTimer = 0;
                        const spawnX = playerCX - FW / 2 - 10;
                        const spawnY = groundTopY;
                        for (let i = 0; i < 30; i++) {
                            const size = Math.random() * 40 + 60;
                            s.splashArcs.push({
                                x: spawnX + size * 0.4,
                                y: spawnY + size * 0.5,
                                size,
                                speedX: Math.random() * 6 - 4,
                                speedY: Math.random() * 2 + 2,
                                gravity: 0,
                            });
                        }
                    }
                } else if (s.phase === 'settle') {
                    s.playerTopY = groundTopY;
                    if (s.timer >= SETTLE_MS) {
                        s.phase = 'stand';
                        s.timer = 0;
                        s.spriteFrameX = 0;
                    }
                }

                s.fireArcs = this._stepFireArcs(s.fireArcs, dtScale);

                for (const arc of s.splashArcs) {
                    arc.x -= arc.speedX * dtScale;
                    arc.y -= arc.speedY * dtScale;
                    arc.size *= Math.pow(0.97, dtScale);
                    arc.y += arc.gravity * dtScale;
                    arc.gravity += 0.1 * dtScale;
                }
                s.splashArcs = s.splashArcs.filter(a => a.size >= 0.5);

                const spriteRow = s.phase === 'jump' ? ROW_JUMPING :
                    s.phase === 'dive' ? ROW_DIVING : ROW_STANDING;
                const maxFrame = s.phase === 'jump' ? MAX_FRAME_JUMP :
                    s.phase === 'dive' ? MAX_FRAME_DIVE : MAX_FRAME_STAND;
                s.spriteFrameTimer += dt;
                while (s.spriteFrameTimer >= FRAME_INTERVAL) {
                    s.spriteFrameTimer -= FRAME_INTERVAL;
                    s.spriteFrameX = (s.spriteFrameX + 1) % (maxFrame + 1);
                }

                const img = this.assets?.defaultSkin;
                if (!img) return;

                ctx.drawImage(img,
                    s.spriteFrameX * FW, spriteRow * FH, FW, FH,
                    Math.round(playerCX - FW / 2), Math.round(s.playerTopY), FW, FH);

                const fireImg = document.getElementById('fire');
                if (fireImg) {
                    for (const arc of s.splashArcs) {
                        ctx.drawImage(fireImg, arc.x, arc.y, arc.size, arc.size);
                    }
                    for (const arc of s.fireArcs) {
                        ctx.save();
                        ctx.translate(arc.x, arc.y);
                        ctx.rotate(arc.angle);
                        ctx.drawImage(fireImg, -arc.size * 0.5, -arc.size * 0.5, arc.size, arc.size);
                        ctx.restore();
                    }
                }
            },
        };
    }

    // ---------------- real power entities preview ----------------
    _createPowerPreviewIfNeeded() {
        if (this._powerPreview) return;

        const make = (Cls) => {
            const o = new Cls(this.game);
            const isolatedGame = Object.create(this.game);
            isolatedGame.player = { x: 0, y: 0, isSlowed: false };
            o.game = isolatedGame;
            o.markedForDeletion = false;
            o.isMenuPreview = true;
            return o;
        };

        this._powerPreview = {
            blue: make(BluePotion),
            red: make(RedPotion),
            live: make(HealthLive),
            cauldron: make(Cauldron),
            blackhole: make(BlackHole),
            iceDrink: make(IceDrink),
        };
    }

    createPowerEntityPreview({ key, x, y, anchor = 'center' }) {
        return {
            draw: (ctx) => {
                this._createPowerPreviewIfNeeded();
                const p = this._powerPreview?.[key];
                if (!p) return;

                if (anchor === 'center') {
                    p.x = x - p.width / 2;
                    p.y = y - p.height / 2;
                } else if (anchor === 'bottomCenter') {
                    p.x = x - p.width / 2;
                    p.y = y - p.height;
                } else {
                    p.x = x;
                    p.y = y;
                }

                const dt = this._dt();
                if (typeof p.update === 'function') p.update(dt);
                p.markedForDeletion = false;
                if (typeof p.draw === 'function') p.draw(ctx);
            },
        };
    }

    // ---------------- energy demo UI-only ----------------
    _resetEnergyDemo(cfg) {
        const safeStart = Number.isFinite(Number(cfg?.start)) ? Number(cfg.start) : 35;
        const e = this._demoEnergy;
        e.active = true;
        e.timer = 0;
        e.value = safeStart;
        e.dir = 'down';
        e.exhausted = false;
    }

    _updateEnergyDemo(deltaTime, cfg) {
        if (!cfg || cfg.enabled !== true) return null;

        if (this._lastPageIndex !== this.currentPage || !this._demoEnergy.active) {
            this._resetEnergyDemo(cfg);
        }

        const min = this._num(cfg.min, 0);
        const max = this._num(cfg.max, 35);
        const recoverAt = this._num(cfg.recoverAt, 20);

        const drainTickMs = Math.max(1, this._num(cfg.drainTickMs, 100));
        const drainPerTick = this._num(cfg.drainPerTick, 0.4);

        const regenTickMs = Math.max(1, this._num(cfg.regenTickMs, 70));
        const regenPerTick = this._num(cfg.regenPerTick, 0.4);

        const dt = Math.max(0, Number(deltaTime) || 0);
        const e = this._demoEnergy;
        e.timer += dt;

        const alwaysDown = cfg?.alwaysDown === true;

        while (true) {
            const tickMs = alwaysDown ? drainTickMs : (e.dir === 'down' ? drainTickMs : regenTickMs);
            if (e.timer < tickMs) break;
            e.timer -= tickMs;

            if (alwaysDown) {
                e.value -= drainPerTick;
                if (e.value <= min + 1e-9) e.value = max;
            } else if (e.dir === 'down') {
                e.value = Math.max(min, e.value - drainPerTick);
                if (e.value <= min + 1e-9) { e.value = min; e.dir = 'up'; }
            } else {
                e.value = Math.min(max, e.value + regenPerTick);
                if (e.value >= max - 1e-9) { e.value = max; e.dir = 'down'; }
            }
        }

        const value = e.value;

        if (alwaysDown) {
            e.exhausted = false;
        } else {
            if (value <= min + 1e-9) e.exhausted = true;
            if (e.exhausted && value >= recoverAt) e.exhausted = false;
        }

        return { maxEnergy: 100, energy: value, isEnergyExhausted: e.exhausted };
    }

    // ---------------- fireball demo UI-only ----------------
    _resetFireballDemo(cfg) {
        const maxEnergy = Number.isFinite(Number(cfg?.maxEnergy)) ? Number(cfg.maxEnergy) : 100;
        const startEnergy = Number.isFinite(Number(cfg?.startEnergy)) ? Number(cfg.startEnergy) : maxEnergy;

        const initialSize = Number.isFinite(Number(cfg?.initialSize)) ? Number(cfg.initialSize) : 10;
        const cooldownMs = Number.isFinite(Number(cfg?.cooldownMs)) ? Number(cfg.cooldownMs) : 1200;

        const f = this._demoFireball;
        f.active = true;
        f.state = 'idle';
        f.timer = 0;

        f.energy = startEnergy;

        f.cooldownMs = Math.max(0, cooldownMs);
        f.cdTimer = f.cooldownMs;

        f.x = Number(cfg?.startX) || 0;
        f.y = Number(cfg?.startY) || 0;

        f.size = initialSize;
        f.angle = 0;
    }

    _updateFireballDemo(deltaTime, cfg) {
        if (!cfg || cfg.enabled !== true) return null;

        if (this._lastPageIndex !== this.currentPage || !this._demoFireball.active) {
            this._resetFireballDemo(cfg);
        }

        const dt = Math.max(0, Number(deltaTime) || 0);
        const dtSec = dt / 1000;

        const maxEnergy = this._num(cfg.maxEnergy, 100);
        const cost = this._num(cfg.energyCost, 8);
        const regenPerSec = this._num(cfg.regenPerSec, 6);
        const shotDelayMs = Math.max(0, this._num(cfg.shotDelayMs, 200));

        const speedPxPerSec = this._num(cfg.speedPxPerSec, 900);
        const dir = (cfg.direction === 'left') ? -1 : 1;

        const offscreenPad = this._num(cfg.offscreenPad, 120);

        const initialSize = this._num(cfg.initialSize, 10);
        const maxSize = this._num(cfg.maxSize, 40);
        const growthPerSec = this._num(cfg.growthPerSec, 60);
        const rotationPerSec = this._num(cfg.rotationPerSec, 12);

        const cooldownMs = this._num(cfg.cooldownMs, this._demoFireball.cooldownMs ?? 1200);

        const f = this._demoFireball;
        f.cooldownMs = Math.max(0, cooldownMs);

        if (f.cdTimer < f.cooldownMs) f.cdTimer = Math.min(f.cooldownMs, f.cdTimer + dt);
        f.energy = Math.min(maxEnergy, f.energy + Math.max(0, regenPerSec) * dtSec);

        f.timer += dt;

        const atFullEnergy = f.energy >= (maxEnergy - 1e-6);
        const cooldownReady = f.cdTimer >= (f.cooldownMs - 1e-6);

        if (f.state === 'idle') {
            if (atFullEnergy && cooldownReady && f.timer >= shotDelayMs) {
                f.timer = 0;
                f.state = 'flying';

                f.energy = Math.max(0, f.energy - cost);
                f.cdTimer = 0;

                f.size = initialSize;
                f.angle = 0;

                const sx = Number(cfg.startX);
                const sy = Number(cfg.startY);
                if (Number.isFinite(sx)) f.x = sx;
                if (Number.isFinite(sy)) f.y = sy;
            }
            if (!atFullEnergy || !cooldownReady) f.timer = 0;
        } else if (f.state === 'flying') {
            f.x += dir * (speedPxPerSec * dtSec);
            f.angle += rotationPerSec * dtSec;

            if (f.size < maxSize) {
                const sizeChange = Math.min(maxSize - f.size, growthPerSec * dtSec);
                f.size += sizeChange;
                f.y -= sizeChange / 2;
            }

            const outRight = (f.x - f.size) > (this.game.width + offscreenPad);
            const outLeft = (f.x + f.size) < (0 - offscreenPad);

            if ((dir === 1 && outRight) || (dir === -1 && outLeft)) {
                f.state = 'idle';
                f.timer = 0;

                const sx = Number(cfg.startX);
                const sy = Number(cfg.startY);
                if (Number.isFinite(sx)) f.x = sx;
                if (Number.isFinite(sy)) f.y = sy;

                f.size = initialSize;
                f.angle = 0;
            }
        }

        return {
            maxEnergy,
            energy: f.energy,
            isEnergyExhausted: false,
            fireballCooldown: f.cooldownMs,
            fireballTimer: f.cdTimer,
        };
    }

    // ---------------- timed phase helpers (invisible/diving) ----------------
    _resetTimedPhases(state, cfg, defaults) {
        const waitMs = Math.max(0, this._num(cfg?.waitMs, defaults.waitMs));
        const activeMs = Math.max(0, this._num(cfg?.activeMs, defaults.activeMs));
        const cooldownMs = Math.max(0, this._num(cfg?.cooldownMs, defaults.cooldownMs));

        state.active = true;
        state.phase = 'wait';
        state.timer = 0;

        state.waitMs = waitMs;
        state.activeMs = activeMs;
        state.cooldownMs = cooldownMs;

        state.activeRemainingMs = activeMs;
        state.cooldownElapsedMs = 0;
    }

    _updateTimedPhases(state, deltaTime, cfg, defaults) {
        const dt = Math.max(0, Number(deltaTime) || 0);

        state.waitMs = Math.max(0, this._num(cfg?.waitMs, state.waitMs || defaults.waitMs));
        state.activeMs = Math.max(0, this._num(cfg?.activeMs, state.activeMs || defaults.activeMs));
        state.cooldownMs = Math.max(0, this._num(cfg?.cooldownMs, state.cooldownMs || defaults.cooldownMs));

        if (state.phase === 'wait') {
            state.timer += dt;
            if (state.timer >= state.waitMs) {
                state.phase = 'active';
                state.timer = 0;
                state.activeRemainingMs = state.activeMs;
            }
        } else if (state.phase === 'active') {
            state.activeRemainingMs = Math.max(0, state.activeRemainingMs - dt);
            if (state.activeRemainingMs <= 0) {
                state.phase = 'cooldown';
                state.timer = 0;
                state.cooldownElapsedMs = 0;
            }
        } else if (state.phase === 'cooldown') {
            state.cooldownElapsedMs = Math.min(state.cooldownMs, state.cooldownElapsedMs + dt);
            if (state.cooldownElapsedMs >= state.cooldownMs) {
                state.phase = 'wait';
                state.timer = 0;
            }
        }

        return dt;
    }

    // ---------------- invisible demo UI-only ----------------
    _resetInvisibleDemo(cfg) {
        this._resetTimedPhases(this._demoInvisible, cfg, { waitMs: 1000, activeMs: 5000, cooldownMs: 35000 });
        this._demoInvisibleColourOpacity = 0;
    }

    _updateInvisibleDemo(deltaTime, cfg) {
        if (!cfg || cfg.enabled !== true) return null;

        if (this._lastPageIndex !== this.currentPage || !this._demoInvisible.active) {
            this._resetInvisibleDemo(cfg);
        }

        const i = this._demoInvisible;
        this._updateTimedPhases(i, deltaTime, cfg, { waitMs: 1000, activeMs: 5000, cooldownMs: 35000 });

        if (i.phase === 'cooldown' && i.cooldownElapsedMs >= 10000) {
            this._resetInvisibleDemo(cfg);
        }

        const isActive = i.phase === 'active';
        this._drawInvisibleTintInternal(isActive);

        const cooldownMs = i.cooldownMs;

        if (isActive) {
            return {
                isInvisible: true,
                invisibleActiveCooldownTimer: i.activeRemainingMs,
                invisibleCooldown: cooldownMs,
                invisibleTimer: cooldownMs,
            };
        }

        const longCdElapsed = (i.phase === 'cooldown') ? i.cooldownElapsedMs : cooldownMs;

        return {
            isInvisible: false,
            invisibleActiveCooldownTimer: 0,
            invisibleCooldown: cooldownMs,
            invisibleTimer: Math.min(cooldownMs, longCdElapsed),
        };
    }

    _drawInvisibleTintInternal(isInvisible) {
        if (isInvisible) {
            this._demoInvisibleColourOpacity = screenColourFadeIn(this._demoInvisibleColourOpacity, 0.014);
        } else {
            this._demoInvisibleColourOpacity = screenColourFadeOut(this._demoInvisibleColourOpacity);
        }
    }

    _drawInvisibleTint(ctx) {
        const a = this._demoInvisibleColourOpacity;
        if (!a || a <= 0) return;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = `rgba(0, 0, 50, ${a})`;
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        ctx.restore();
    }

    // ---------------- diving demo UI-only ----------------
    _resetDivingDemo(cfg) {
        this._resetTimedPhases(this._demoDiving, cfg, { waitMs: 2000, activeMs: 500, cooldownMs: 300 });
    }

    _updateDivingDemo(_deltaTime, cfg) {
        if (!cfg || cfg.enabled !== true) return null;

        const COOLDOWN_MS = this._num(cfg?.cooldownMs, 300);
        const seq = this._demoDivingSeq;
        const divingState = this.game.player?.states?.[5];

        const isActive = seq?.phase === 'dive';
        const inCooldown = seq?.phase === 'settle';
        const cooldownElapsed = inCooldown ? Math.min(seq.timer, COOLDOWN_MS) : COOLDOWN_MS;

        return {
            currentState: isActive && divingState
                ? divingState
                : (this.game.player?.states?.[8] ?? this.game.player?.currentState),
            divingCooldown: COOLDOWN_MS,
            divingTimer: cooldownElapsed,
        };
    }

    // ---------------- dash demo UI-only ----------------
    _resetDashDemo(cfg) {
        const d = this._demoDash;

        d.active = true;
        d.phase = 'wait';
        d.timer = 0;

        d.waitMs = Math.max(0, this._num(cfg?.waitMs, 1000));
        d.betweenMs = Math.max(0, this._num(cfg?.betweenMs, 500));
        d.secondWindowMs = Math.max(0, this._num(cfg?.secondWindowMs, 7000));
        d.simulateSecondAtMs = Math.max(0, this._num(cfg?.simulateSecondAtMs, 2000));
        d.cooldownMs = Math.max(0, this._num(cfg?.cooldownMs, 60000));

        d.betweenElapsedMs = d.betweenMs;
        d.secondWindowRemainingMs = 0;
        d.dashCooldownElapsedMs = d.cooldownMs;

        d.playerX = d.startX;
        d.spriteFrameX = 0;
        d.spriteFrameTimer = 0;
        d.fireArcs = [];
        d.fireTimer = 0;
        d.ghosts = [];
        d.ghostTimer = 0;

        const maxEnergy = Number.isFinite(Number(cfg?.maxEnergy)) ? Number(cfg.maxEnergy) : 100;
        const startEnergy = Number.isFinite(Number(cfg?.startEnergy)) ? Number(cfg.startEnergy) : maxEnergy;

        d.maxEnergy = maxEnergy;
        d.energy = Math.min(maxEnergy, Math.max(0, startEnergy));
    }

    _updateDashDemo(deltaTime, cfg) {
        if (!cfg || cfg.enabled !== true) return null;

        if (this._lastPageIndex !== this.currentPage || !this._demoDash.active) {
            this._resetDashDemo(cfg);
        }

        const d = this._demoDash;
        const dt = Math.max(0, Number(deltaTime) || 0);
        const dtSec = dt / 1000;
        const dtScale = dt / 16;

        d.waitMs = Math.max(0, this._num(cfg?.waitMs, d.waitMs || 1000));
        d.betweenMs = Math.max(0, this._num(cfg?.betweenMs, d.betweenMs || 500));
        d.secondWindowMs = Math.max(0, this._num(cfg?.secondWindowMs, d.secondWindowMs || 7000));
        d.simulateSecondAtMs = Math.max(0, this._num(cfg?.simulateSecondAtMs, d.simulateSecondAtMs || 5000));
        d.cooldownMs = Math.max(0, this._num(cfg?.cooldownMs, d.cooldownMs || 60000));

        const maxEnergy = this._num(cfg?.maxEnergy, d.maxEnergy ?? 100);
        d.maxEnergy = maxEnergy;
        const energyCost = this._num(cfg?.energyCost, 15);
        const regenPerSec = this._num(cfg?.regenPerSec, 5.7);

        d.energy = Math.min(maxEnergy,
            (Number.isFinite(Number(d.energy)) ? d.energy : maxEnergy) + Math.max(0, regenPerSec) * dtSec);

        const canSpend = () => d.energy >= (energyCost - 1e-6);
        const spend = () => { d.energy = Math.max(0, d.energy - energyCost); };

        const DASH1_VX = 1.8;
        const DASH2_VX = 3.15;
        const DASH_DURATION = 180;
        const FIRE_INTERVAL_MS = 16;
        const GHOST_INTERVAL_MS = 20;
        const MAX_GHOSTS = 4;
        const { height: FH } = FIREDOG_FRAME;
        const ROW_RUNNING = 3;
        const FRAME_INTERVAL_DASH = 1000 / 20;
        const FRAME_INTERVAL_IDLE = 1000 / 20;
        const MAX_FRAME_RUNNING = 8;
        const MAX_FRAME_STANDING = 6;
        const ROW_STANDING = 0;

        const isDashing = d.phase === 'dashing1' || d.phase === 'dashing2';
        const groundY = this.game.height - this.game.groundMargin;
        const mouthX = d.playerX + 48;
        const mouthY = groundY - FH + FH * 0.52;

        // ---- sprite frame ----
        const spriteRow = isDashing ? ROW_RUNNING : ROW_STANDING;
        const maxFrame = isDashing ? MAX_FRAME_RUNNING : MAX_FRAME_STANDING;
        const frameInterval = isDashing ? FRAME_INTERVAL_DASH : FRAME_INTERVAL_IDLE;
        if (!Array.isArray(d.fireArcs)) d.fireArcs = [];
        if (!Array.isArray(d.ghosts)) d.ghosts = [];
        d.spriteFrameTimer = (d.spriteFrameTimer || 0) + dt;
        while (d.spriteFrameTimer >= frameInterval) {
            d.spriteFrameTimer -= frameInterval;
            d.spriteFrameX = ((d.spriteFrameX || 0) + 1) % (maxFrame + 1);
        }

        // ---- fire and ghost spawning during dash phases ----
        if (isDashing) {
            d.fireTimer = (d.fireTimer || 0) + dt;
            while (d.fireTimer >= FIRE_INTERVAL_MS) {
                d.fireTimer -= FIRE_INTERVAL_MS;
                d.fireArcs.push(this._spawnDemoFireArc(mouthX, mouthY, d.playerX));
                d.fireArcs.push(this._spawnDemoFireArc(mouthX, mouthY, d.playerX));
                if (Math.random() < 0.35) {
                    d.fireArcs.push(this._spawnDemoFireArc(mouthX, mouthY, d.playerX));
                    d.fireArcs.push(this._spawnDemoFireArc(mouthX, mouthY, d.playerX));
                }
            }
            d.ghostTimer = (d.ghostTimer || 0) + dt;
            while (d.ghostTimer >= GHOST_INTERVAL_MS) {
                d.ghostTimer -= GHOST_INTERVAL_MS;
                d.ghosts.unshift({ x: d.playerX, frameX: d.spriteFrameX, frameY: spriteRow, alpha: 0.55 });
                if (d.ghosts.length > MAX_GHOSTS) d.ghosts.pop();
            }
        }

        const GAME_SPEED = this.game.normalSpeed ?? 6;

        // ---- update fire arcs ----
        for (const arc of d.fireArcs) {
            arc.age += dt;
            if (arc.age < arc.followMs) {
                arc.x += (d.playerX - arc.lastPlayerX) * arc.followFactor;
                arc.lastPlayerX = d.playerX;
            }
            arc.speedX *= Math.pow(arc.drag, dtScale);
            arc.speedY *= Math.pow(arc.damp, dtScale);
            arc.x -= (arc.speedX + GAME_SPEED) * dtScale;
            arc.y -= arc.speedY * dtScale;
            arc.size *= Math.pow(0.97, dtScale);
            arc.angle += arc.va * dtScale;
            arc.x += Math.sin(arc.angle * 4) * arc.wobbleAmp;
        }
        d.fireArcs = d.fireArcs.filter(a => a.size >= 0.5);

        // ---- update ghosts ----
        for (const g of d.ghosts) g.alpha = Math.max(0, g.alpha - 0.06 * dtScale);
        d.ghosts = d.ghosts.filter(g => g.alpha > 0.02);

        // ---- phase transitions ----
        d.timer += dt;

        if (d.phase === 'wait') {
            if (d.timer >= d.waitMs) {
                if (canSpend()) spend();
                d.phase = 'dashing1';
                d.timer = 0;
                d.fireTimer = 0;
                d.ghostTimer = 0;
                d.spriteFrameX = 0;
                d.playerX = d.startX;
                d.betweenElapsedMs = 0;
                d.secondWindowRemainingMs = d.secondWindowMs;
            }
        } else if (d.phase === 'dashing1') {
            d.playerX += DASH1_VX * dt;
            d.betweenElapsedMs = Math.min(d.betweenMs, d.betweenElapsedMs + dt);
            d.secondWindowRemainingMs = Math.max(0, d.secondWindowRemainingMs - dt);
            if (d.timer >= DASH_DURATION) {
                d.phase = 'afterFirst';
                d.timer = 0;
            }
        } else if (d.phase === 'afterFirst') {
            d.betweenElapsedMs = Math.min(d.betweenMs, d.betweenElapsedMs + dt);
            d.secondWindowRemainingMs = Math.max(0, d.secondWindowRemainingMs - dt);

            if (d.secondWindowRemainingMs <= 0) {
                d.phase = 'cooldown';
                d.timer = 0;
                d.playerX = d.startX;
            } else {
                const betweenReady = d.betweenElapsedMs >= (d.betweenMs - 1e-6);
                if (betweenReady && d.timer >= d.simulateSecondAtMs) {
                    if (canSpend()) spend();
                    d.phase = 'dashing2';
                    d.timer = 0;
                    d.dashCooldownElapsedMs = 0;
                    d.fireTimer = 0;
                    d.ghostTimer = 0;
                    d.spriteFrameX = 0;
                }
            }
        } else if (d.phase === 'dashing2') {
            d.playerX += DASH2_VX * dt;
            d.dashCooldownElapsedMs = Math.min(d.cooldownMs, d.dashCooldownElapsedMs + dt);
            if (d.timer >= DASH_DURATION) {
                d.phase = 'stopped';
                d.timer = 0;
                d.betweenElapsedMs = 0;
                d.secondWindowRemainingMs = 0;
                d.spriteFrameX = 0;
            }
        } else if (d.phase === 'stopped') {
            d.dashCooldownElapsedMs = Math.min(d.cooldownMs, d.dashCooldownElapsedMs + dt);
            if (d.timer >= 10000) {
                d.phase = 'wait';
                d.timer = 0;
                d.betweenElapsedMs = d.betweenMs;
                d.dashCooldownElapsedMs = d.cooldownMs;
                d.secondWindowRemainingMs = 0;
                d.playerX = d.startX;
                d.energy = d.maxEnergy;
                d.fireArcs = [];
                d.ghosts = [];
            }
        } else if (d.phase === 'cooldown') {
            if (d.timer >= d.cooldownMs) {
                d.phase = 'wait';
                d.timer = 0;
                d.betweenElapsedMs = d.betweenMs;
                d.secondWindowRemainingMs = 0;
                d.playerX = d.startX;
                d.fireArcs = [];
                d.ghosts = [];
            }
        }

        const awaitingSecond = d.phase === 'afterFirst' || d.phase === 'dashing1';
        const inCooldown = d.phase === 'cooldown';
        const inDashing1 = d.phase === 'dashing1';
        const inDashing2 = d.phase === 'dashing2';
        const inStopped = d.phase === 'stopped';

        const dashCharges = (inCooldown || inDashing2 || inStopped) ? 0 : (awaitingSecond || inDashing1) ? 1 : 2;
        const dashTimer = inCooldown ? d.timer : (inDashing2 || inStopped) ? d.dashCooldownElapsedMs : d.cooldownMs;
        const dashBetweenTimer = (awaitingSecond || inDashing1) ? d.betweenElapsedMs : d.betweenMs;

        return {
            maxEnergy: d.maxEnergy ?? 100,
            energy: d.energy ?? (d.maxEnergy ?? 100),
            isEnergyExhausted: false,
            dashCharges,
            dashAwaitingSecond: awaitingSecond,
            dashCooldown: d.cooldownMs,
            dashTimer,
            dashBetweenCooldown: d.betweenMs,
            dashBetweenTimer,
            dashSecondWindowTimer: awaitingSecond ? d.secondWindowRemainingMs : 0,
        };
    }

    // ---------------- player patching ----------------
    _applyPatchToPlayer(patch) {
        const player = this.game.player;
        if (!player || !patch || typeof patch !== 'object') return null;

        const touched = new Map();
        for (const [k, v] of Object.entries(patch)) {
            if (!touched.has(k)) touched.set(k, player[k]);
            player[k] = v;
        }

        return () => {
            for (const [k, v] of touched.entries()) player[k] = v;
        };
    }

    applyDemoPlayerState(demo) {
        const allow = new Set([
            'maxEnergy', 'energy', 'isEnergyExhausted',
            'isBluePotionActive', 'isPoisonedActive', 'isRedPotionActive',
            'isFrozen', 'currentState',
            'isInvisible', 'invisibleTimer', 'invisibleCooldown', 'invisibleActiveCooldownTimer',
            'divingTimer', 'divingCooldown',
            'fireballTimer', 'fireballCooldown',
            'redPotionTimer',
            'dashTimer', 'dashCooldown',
            'dashBetweenTimer', 'dashBetweenCooldown',
            'dashCharges', 'dashAwaitingSecond', 'dashSecondWindowTimer',
        ]);

        if (!demo || typeof demo !== 'object') return null;

        const filtered = {};
        for (const k of Object.keys(demo)) if (allow.has(k)) filtered[k] = demo[k];

        return this._applyPatchToPlayer(filtered);
    }

    applyDemoCooldowns(cooldowns) {
        const player = this.game.player;
        if (!player || !cooldowns || typeof cooldowns !== 'object') return null;

        const touched = new Map();
        const set = (key, value) => {
            if (!touched.has(key)) touched.set(key, player[key]);
            player[key] = value;
        };

        const pairs = {
            fireball: ['fireballCooldown', 'fireballTimer'],
            diving: ['divingCooldown', 'divingTimer'],
            invisible: ['invisibleCooldown', 'invisibleTimer'],
            dash: ['dashCooldown', 'dashTimer'],
            dashBetween: ['dashBetweenCooldown', 'dashBetweenTimer'],
        };

        const setPair = (name, cd, timer) => {
            const p = pairs[name];
            if (!p) return;
            set(p[0], cd);
            set(p[1], timer);
        };

        const apply = (name, { cooldownMs, remainingSec, available } = {}) => {
            if (typeof cooldownMs !== 'number') return;

            const cd = Math.max(0, cooldownMs);
            if (available === true) return setPair(name, cd, cd);

            const remMs = Math.max(0, (Number(remainingSec) || 0) * 1000);
            const timer = Math.max(0, cd - remMs);
            setPair(name, cd, timer);
        };

        for (const [name, cfg] of Object.entries(cooldowns)) apply(name, cfg || {});

        return () => {
            for (const [k, v] of touched.entries()) player[k] = v;
        };
    }

    // ---------------- draw primitives + factories ----------------
    drawImage(ctx, img, x, y, opts = {}) {
        if (!img) return;

        const scale = opts.scale ?? 1;
        const baseW = opts.w ?? img.width;
        const baseH = opts.h ?? img.height;

        const w = Math.round(baseW * scale);
        const h = Math.round(baseH * scale);
        if (!w || !h) return;

        const anchor = opts.anchor ?? 'topLeft';
        const offsetX = opts.offsetX ?? 0;
        const offsetY = opts.offsetY ?? 0;

        let drawX = x;
        let drawY = y;

        if (anchor === 'center') {
            drawX = x - w / 2;
            drawY = y - h / 2;
        } else if (anchor === 'bottomCenter') {
            drawX = x - w / 2;
            drawY = y - h;
        }

        drawX = Math.round(drawX + offsetX);
        drawY = Math.round(drawY + offsetY);

        ctx.drawImage(img, drawX, drawY, w, h);
    }

    drawImageRotatedSquare(ctx, img, x, y, size, angle) {
        if (!img) return;
        const s = Math.max(1, Math.round(size));
        const ccx = x + s / 2;
        const ccy = y + s / 2;

        ctx.save();
        ctx.translate(ccx, ccy);
        ctx.rotate(angle);
        ctx.drawImage(img, -s / 2, -s / 2, s, s);
        ctx.restore();
    }

    wrapLines(ctx, text, maxW) {
        const rawLines = String(text || '').split('\n');
        const out = [];

        for (const raw of rawLines) {
            const words = raw.split(' ');
            let line = '';

            for (const word of words) {
                const test = line ? (line + ' ' + word) : word;
                if (ctx.measureText(test).width <= maxW) {
                    line = test;
                } else {
                    if (line) out.push(line);
                    line = word;
                }
            }

            if (line) out.push(line);
            if (raw === '') out.push('');
        }

        return out;
    }

    _cleanTokenForMatch(token) {
        return String(token || '')
            .replace(/^[^\w]+/g, '')
            .replace(/[^\w]+$/g, '');
    }

    _getTokenFillColour(rawToken) {
        const tRaw = this._cleanTokenForMatch(rawToken);
        if (!tRaw) return null;

        const t = tRaw.toLowerCase();

        const abilitySet = new Set([
            'rolling', 'diving', 'fireball', 'invisible', 'invisibility', 'dashing', 'dash',
            'roll', 'dive',
        ]);
        const energySet = new Set(['energy']);
        const damageSet = new Set(['damage']);
        const exhaustedSet = new Set(['exhausted', 'exhaust']);

        if (abilitySet.has(t)) return '#ff6a00';
        if (energySet.has(t)) return '#00bfff';
        if (damageSet.has(t)) return '#ff0000';
        if (exhaustedSet.has(t)) return '#ff0000';

        const enemyColour = {
            stun: 'rgb(201, 188, 12)',
            red: 'red',
            poison: 'green',
            slow: 'blue',
            frozen: '#20cada',
        };

        return enemyColour[t] || null;
    }

    _splitKeepSpaces(line) {
        return String(line || '').split(/(\s+)/g).filter(s => s !== '');
    }

    _measureRichLineWidth(ctx, tokens) {
        let w = 0;
        for (const tok of tokens) w += ctx.measureText(tok).width;
        return w;
    }

    drawTextBlockImpl(ctx, o) {
        const text = o.text ?? '';
        const x = o.x ?? 0;
        const y = o.y ?? 0;
        const maxW = o.maxW ?? 600;
        const lineH = o.lineH ?? 32;
        const font = o.font ?? 'bold 26px "Gloria Hallelujah"';
        const align = o.align ?? 'left';
        const colourize = o.colourize !== false;

        ctx.save();
        ctx.font = font;
        ctx.textBaseline = 'top';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 6;

        const lines = this.wrapLines(ctx, text, maxW);

        const nextNonSpaceToken = (arr, startIndex) => {
            for (let i = startIndex; i < arr.length; i++) {
                if (!/^\s+$/.test(arr[i])) return arr[i];
            }
            return null;
        };

        const isNumberToken = (rawTok) => {
            const t = this._cleanTokenForMatch(rawTok);
            const n = t.replace(/,/g, '');
            return n !== '' && Number.isFinite(Number(n));
        };

        let yy = y;

        for (const line of lines) {
            if (line === '') { yy += lineH; continue; }

            if (!colourize) {
                ctx.textAlign = align;
                ctx.fillStyle = 'black';
                ctx.strokeText(line, x, yy);
                ctx.fillText(line, x, yy);
                yy += lineH;
                continue;
            }

            const tokens = this._splitKeepSpaces(line);
            const lineWpx = this._measureRichLineWidth(ctx, tokens);

            let startX = x;
            if (align === 'center') startX = x - lineWpx / 2;
            if (align === 'right') startX = x - lineWpx;

            ctx.textAlign = 'left';

            let xx = startX;
            for (let i = 0; i < tokens.length; i++) {
                const tok = tokens[i];

                let fill = this._getTokenFillColour(tok);

                if (!fill && isNumberToken(tok)) {
                    const nextTok = nextNonSpaceToken(tokens, i + 1);
                    const nextFill = nextTok ? this._getTokenFillColour(nextTok) : null;
                    if (nextFill) fill = nextFill;
                }

                ctx.fillStyle = fill || 'black';
                ctx.strokeText(tok, xx, yy);
                ctx.fillText(tok, xx, yy);

                xx += ctx.measureText(tok).width;
            }

            yy += lineH;
        }

        ctx.restore();
    }

    drawKeycapImpl(ctx, x, y, letter, w = 57, h = 55, imageName = 'keycap') {
        const img = this.getAsset(imageName);
        if (!img) return;

        const drawX = Math.round(x - w / 2);
        const drawY = Math.round(y);

        ctx.save();
        ctx.drawImage(img, drawX, drawY, w, h);

        if (letter) {
            ctx.font = 'bold 22px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillText(letter, drawX + w / 2 - 2, drawY + h / 2 - 3);
        }

        ctx.restore();
    }

    drawKeyImageImpl(ctx, x, y, imageName = 'enterKeycap', w = null, h = null) {
        const img = this.getAsset(imageName);
        if (!img) return;

        const drawW = w ?? (img.width || 120);
        const drawH = h ?? (img.height || 55);

        const drawX = Math.round(x - drawW / 2);
        const drawY = Math.round(y);

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    drawArrowImpl(ctx, o) {
        const x = o.x ?? 0;
        const y = o.y ?? 0;
        const length = o.length ?? 34;
        const head = o.head ?? 10;
        const rotation = o.rotation ?? 0;

        const lineW = o.lineW ?? 6;
        const outlineW = o.outlineW ?? 10;

        const anchor = o.anchor ?? 'center';

        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        ctx.rotate(rotation);

        let x1, x2;
        if (anchor === 'start') {
            x1 = 0;
            x2 = length;
        } else {
            const half = length / 2;
            x1 = -half;
            x2 = half;
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const strokeArrow = () => {
            ctx.beginPath();
            ctx.moveTo(x1, 0);
            ctx.lineTo(x2, 0);
            ctx.moveTo(x2, 0);
            ctx.lineTo(x2 - head, -head * 0.7);
            ctx.moveTo(x2, 0);
            ctx.lineTo(x2 - head, head * 0.7);
            ctx.stroke();
        };

        ctx.strokeStyle = 'white';
        ctx.lineWidth = outlineW;
        strokeArrow();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = lineW;
        strokeArrow();

        ctx.restore();
    }

    createImage(o) {
        return {
            draw: (ctx) => {
                const img = this.getAsset(o.image);
                this.drawImage(ctx, img, o.x, o.y, o);
            },
        };
    }

    createInvisibleDemoPlayerImage(o) {
        const cfg = HowToPlayMenu._PLAYER_ANIM[o.state ?? 'STANDING'] ?? HowToPlayMenu._PLAYER_ANIM.STANDING;
        const spriteOpts = {
            image: 'defaultSkin',
            key: `player_invisible_${o.state ?? 'STANDING'}_${Math.round(o.x ?? 0)}_${Math.round(o.y ?? 0)}`,
            frameW: FIREDOG_FRAME.width, frameH: FIREDOG_FRAME.height,
            frameY: cfg.frameY, maxFrame: cfg.maxFrame,
            fps: o.fps ?? 20,
            w: FIREDOG_FRAME.width * (o.scale ?? 1), h: FIREDOG_FRAME.height * (o.scale ?? 1),
            x: o.x, y: o.y,
            anchor: o.anchor ?? 'bottomCenter',
            shadowBlur: 0,
        };
        return {
            draw: (ctx) => {
                const active = this._demoInvisible?.phase === 'active';
                const alpha = active ? (Number.isFinite(Number(o.activeAlpha)) ? Number(o.activeAlpha) : 0.5) : 1;
                ctx.save();
                ctx.globalAlpha = alpha;
                this._drawAnimatedGlowSprite(ctx, spriteOpts);
                ctx.restore();
            },
        };
    }

    createEnergyDemoPlayerImage(o) {
        const { width: FW, height: FH } = FIREDOG_FRAME;
        const FIRE_INTERVAL_MS = 1000 / 31;

        return {
            draw: (ctx) => {
                const e = this._demoEnergy;
                if (!e || !e.active) return;

                const goingDown = (e.dir || 'down') === 'down';
                const state = goingDown ? (o.downState ?? 'ROLLING') : (o.upState ?? 'STANDING');
                const cfg = HowToPlayMenu._PLAYER_ANIM[state] ?? HowToPlayMenu._PLAYER_ANIM.STANDING;
                const x = goingDown ? (o.downX ?? o.x ?? 0) : (o.upX ?? o.x ?? 0);
                const y = goingDown ? (o.downY ?? o.y ?? 0) : (o.upY ?? o.y ?? 0);

                const dt = Math.max(0, this._dt());
                const dtScale = dt / 16;
                const GAME_SPEED = this.game.normalSpeed ?? 6;

                const isRolling = state === 'ROLLING';
                if (isRolling) {
                    if (!this._demoEnergyFireSeq) {
                        this._demoEnergyFireSeq = { fireArcs: [], fireTimer: 0 };
                    }
                    const fs = this._demoEnergyFireSeq;

                    const anchor = o.anchor ?? 'bottomCenter';
                    let px = x, py = y;
                    if (anchor === 'bottomCenter') { px -= FW / 2; py -= FH; }
                    else if (anchor === 'center') { px -= FW / 2; py -= FH / 2; }
                    const fireCX = px + FW * 0.5;
                    const fireCY = py + FH * 0.5;

                    fs.fireTimer += dt;
                    while (fs.fireTimer >= FIRE_INTERVAL_MS) {
                        fs.fireTimer -= FIRE_INTERVAL_MS;
                        fs.fireArcs.push({
                            x: fireCX, y: fireCY,
                            size: Math.random() * 100 + 50,
                            speedX: 1, speedY: 1,
                            angle: 0, va: Math.random() * 0.2 - 0.1,
                        });
                    }

                    fs.fireArcs = this._stepFireArcs(fs.fireArcs, dtScale, GAME_SPEED);
                } else if (this._demoEnergyFireSeq?.fireArcs.length) {
                    const fs = this._demoEnergyFireSeq;
                    fs.fireArcs = this._stepFireArcs(fs.fireArcs, dtScale, GAME_SPEED);
                }

                this._drawAnimatedGlowSprite(ctx, {
                    image: 'defaultSkin',
                    key: `player_energy_${state}_${Math.round(x ?? 0)}_${Math.round(y ?? 0)}`,
                    frameW: FW, frameH: FH,
                    frameY: cfg.frameY, maxFrame: cfg.maxFrame,
                    fps: o.fps ?? 20,
                    w: FW, h: FH,
                    x, y,
                    anchor: o.anchor ?? 'bottomCenter',
                    shadowBlur: 0,
                });

                if (this._demoEnergyFireSeq?.fireArcs.length) {
                    const fireImg = document.getElementById('fire');
                    if (fireImg) {
                        for (const arc of this._demoEnergyFireSeq.fireArcs) {
                            ctx.save();
                            ctx.translate(arc.x, arc.y);
                            ctx.rotate(arc.angle);
                            ctx.drawImage(fireImg, -arc.size * 0.5, -arc.size * 0.5, arc.size, arc.size);
                            ctx.restore();
                        }
                    }
                }
            },
        };
    }

    createKey(o) {
        return { draw: (ctx) => this.drawKeycapImpl(ctx, o.x, o.y, o.key, o.w, o.h, o.image || 'keycap') };
    }

    createKeyImage(o) {
        return { draw: (ctx) => this.drawKeyImageImpl(ctx, o.x, o.y, o.image || 'enterKeycap', o.w ?? null, o.h ?? null) };
    }

    createTextBlock(o) {
        return { draw: (ctx) => this.drawTextBlockImpl(ctx, o) };
    }

    createArrow(o) {
        return { draw: (ctx) => this.drawArrowImpl(ctx, o) };
    }

    createFireballDemo(o) {
        return {
            draw: (ctx) => {
                const cfg = this.getCurrentPageUIConfig();
                const fbCfg = cfg?.fireballDemo;
                if (!fbCfg?.enabled) return;

                const img = this.getAsset(o.image || 'fireball');
                if (!img) return;

                const fb = this._demoFireball;
                if (!fb?.active || fb.state !== 'flying') return;

                this.drawImageRotatedSquare(ctx, img, fb.x, fb.y, fb.size, fb.angle);
            },
        };
    }

    // ---------------- particles overlay (menu-only) ----------------
    createStatusParticlesOverlay({
        type,          // 'poison' | 'slow'
        x, y,
        anchor = 'bottomCenter',
        rateMs = null,
        spawn = null,
    } = {}) {
        const rand = (a, b) => a + Math.random() * (b - a);

        const defaults = {
            poison: {
                rateMs: 110,
                dxMin: -35, dxMax: 35,
                dyMin: -130, dyMax: -35,
                kind: 'poison',
            },
            slow: {
                rateMs: 110,
                dxMin: -45, dxMax: 45,
                dyMin: -140, dyMax: -45,
            },
        };

        const cfg = { ...(defaults[type] || {}), ...(spawn || {}) };
        const spawnRate = Math.max(10, Number(rateMs ?? cfg.rateMs ?? 90));

        const getBase = () => ({ bx: x, by: y });

        return {
            draw: (ctx) => {
                const dt = this._dt();
                const paused = this.game.menu.pause?.isPaused === true;

                if (!paused) {
                    const key = type === 'poison' ? 'poison' : 'slow';
                    this._menuParticleTimers[key] = Math.min(
                        (this._menuParticleTimers[key] || 0) + Math.max(0, dt),
                        spawnRate
                    );

                    while (this._menuParticleTimers[key] >= spawnRate) {
                        this._menuParticleTimers[key] -= spawnRate;

                        const { bx, by } = getBase();
                        const sx = bx + rand(cfg.dxMin, cfg.dxMax);
                        const sy = by + rand(cfg.dyMin, cfg.dyMax);

                        let p = null;
                        if (type === 'poison') {
                            p = new PoisonBubbles(this.game, sx, sy, cfg.kind || 'poison');
                            p.parallax = 0;
                        } else if (type === 'slow') {
                            p = new IceCrystalBubbles(this.game, sx, sy);
                            p.parallax = 0;
                        }

                        if (p) this._menuParticles.push(p);
                    }
                }

                for (const p of this._menuParticles) {
                    if (!p) continue;
                    if (!paused && typeof p.update === 'function') p.update();
                    if (typeof p.draw === 'function') p.draw(ctx);
                }

                this._menuParticles = this._menuParticles.filter(p => p && !p.markedForDeletion);
            },
        };
    }

    // ---------------- status tinted image ----------------
    _getTintedCanvas(img, sw, sh, tintKey, paintFn) {
        const key = `${img.id || img.src || 'img'}|${sw}x${sh}|${tintKey}`;
        const cached = this._tintCache.get(key);
        if (cached) return cached;

        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(sw));
        c.height = Math.max(1, Math.round(sh));
        const cctx = c.getContext('2d');

        cctx.clearRect(0, 0, c.width, c.height);
        cctx.globalCompositeOperation = 'source-over';
        cctx.drawImage(img, 0, 0, c.width, c.height);

        cctx.globalCompositeOperation = 'source-atop';
        paintFn(cctx, c.width, c.height);
        cctx.fillRect(0, 0, c.width, c.height);
        cctx.globalCompositeOperation = 'source-over';

        this._tintCache.set(key, c);
        return c;
    }

    createStatusTintedImage({ image, x, y, w, h, anchor = 'topLeft', poisoned = false, slowed = false }) {
        return {
            draw: (ctx) => {
                const img = this.assets?.[image] || document.getElementById(image);
                if (!img) return;

                const dw = w ?? img.width;
                const dh = h ?? img.height;

                let dx = x;
                let dy = y;

                if (anchor === 'center') {
                    dx = x - dw / 2;
                    dy = y - dh / 2;
                } else if (anchor === 'bottomCenter') {
                    dx = x - dw / 2;
                    dy = y - dh;
                } else if (anchor === 'bottomLeft') {
                    dx = x;
                    dy = y - dh;
                }

                this._drawStatusTintedImage(ctx, img, dx, dy, dw, dh, { poisoned, slowed });
            },
        };
    }

    _drawStatusTintedImage(ctx, img, dx, dy, dw, dh, status) {
        const poisoned = !!status?.poisoned;
        const slowed = !!status?.slowed;

        if (!poisoned && !slowed) {
            ctx.drawImage(img, dx, dy, dw, dh);
            return;
        }

        const drawGlow = (color, blur = 6) => {
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = blur;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.drawImage(img, dx, dy, dw, dh);
            ctx.restore();
        };

        if (poisoned && slowed) {
            drawGlow('rgba(0,160,255,1)', 7);

            const oc = this._getTintedCanvas(img, dw, dh, 'poison+slow', (cctx, W, H) => {
                const g = cctx.createLinearGradient(0, 0, W, 0);
                g.addColorStop(0.00, 'rgba(0,100,0,0.40)');
                g.addColorStop(0.50, 'rgba(0,150,120,0.38)');
                g.addColorStop(1.00, 'rgba(0,120,255,0.35)');
                cctx.fillStyle = g;
            });

            ctx.drawImage(oc, dx, dy, dw, dh);
            return;
        }

        if (poisoned) {
            drawGlow('rgba(0,130,0,1)', 6);

            const oc = this._getTintedCanvas(img, dw, dh, 'poison', (cctx) => {
                cctx.fillStyle = 'rgba(0,100,0,0.40)';
            });

            ctx.drawImage(oc, dx, dy, dw, dh);
            return;
        }

        drawGlow('rgba(0,160,255,1)', 6);

        const oc = this._getTintedCanvas(img, dw, dh, 'slow', (cctx) => {
            cctx.fillStyle = 'rgba(0,120,255,0.35)';
        });

        ctx.drawImage(oc, dx, dy, dw, dh);
    }

    // ---------------- drawing ----------------
    drawCurrentPage(ctx) {
        const page = this.pages[this.currentPage];
        if (!page) return;

        if (this.backgroundImage) {
            ctx.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
        }

        this._drawInvisibleTint(ctx);

        for (const d of (page.drawables || [])) {
            if (d && typeof d.draw === 'function') d.draw(ctx);
        }

        const label = `${this.currentPage + 1}/${this.pages.length} - ${page.title ?? ''}`.trim();

        ctx.save();
        ctx.font = 'bold 26px "Gloria Hallelujah"';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'black';

        ctx.strokeText(label, 18, this.game.height - 14);
        ctx.fillText(label, 18, this.game.height - 14);
        ctx.restore();
    }

    _resetDemosOnPageChange() {
        this._hitAnimPhaseRef.phase = 'delay';
        for (const reset of this._hitAnimResets) reset();
        this._demoEnergy = this._createEnergyDemoState();
        this._demoDiving = this._createDivingDemoState();
        this._demoFireball = this._createFireballDemoState();
        this._demoInvisible = this._createInvisibleDemoState();
        this._demoDash = this._createDashDemoState();

        this._demoInvisibleColourOpacity = 0;

        this._spriteDemos?.clear?.();
        this._powerPreview = null;
        this._demoRollingSeq = null;
        this._demoDivingSeq = null;
        this._demoEnergyFireSeq = null;

        this._menuParticles.length = 0;
        this._menuParticleTimers.poison = 0;
        this._menuParticleTimers.slow = 0;
    }

    drawTopLeftUIOverlay(ctx) {
        const ui = this.game.UI;
        if (!ui) return;

        const cfg = this.getCurrentPageUIConfig();
        if ((cfg?.enabled ?? true) !== true) return;

        if (this._lastPageIndex !== this.currentPage) {
            this._resetDemosOnPageChange();
            this._lastPageIndex = this.currentPage;
        }

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        let demoPlayer = cfg?.player ? { ...cfg.player } : null;
        const dt = this._dt();

        const applyDemo = (enabled, fn, demoCfg) => {
            if (enabled === true) {
                const patch = fn.call(this, dt, demoCfg);
                if (patch) demoPlayer = { ...(demoPlayer || {}), ...patch };
            }
        };

        applyDemo(cfg?.energyDemo?.enabled, this._updateEnergyDemo, cfg?.energyDemo);
        applyDemo(cfg?.divingDemo?.enabled, this._updateDivingDemo, cfg?.divingDemo);
        applyDemo(cfg?.fireballDemo?.enabled, this._updateFireballDemo, cfg?.fireballDemo);

        if (cfg?.invisibleDemo?.enabled === true) {
            applyDemo(true, this._updateInvisibleDemo, cfg?.invisibleDemo);
        } else {
            if (this._demoInvisible) {
                this._demoInvisible.active = false;
                this._demoInvisible.phase = 'wait';
                this._demoInvisible.timer = 0;
                this._demoInvisible.activeRemainingMs = 0;
                this._demoInvisible.cooldownElapsedMs = 0;
            }
            this._drawInvisibleTintInternal(false);
        }

        applyDemo(cfg?.dashDemo?.enabled, this._updateDashDemo, cfg?.dashDemo);

        if (cfg?.hitAnimPhaseRef?.phase === 'hit') {
            demoPlayer = { ...(demoPlayer || {}), isFrozen: true };
        }

        const restorePlayer = this.applyDemoPlayerState(demoPlayer);
        const restoreCooldowns = this.applyDemoCooldowns(cfg?.cooldowns);

        const pb = cfg?.progressBar;
        ui.drawTutorialProgressBar(
            ctx,
            this._getTutorialProgressPercentage(),
            pb?.colour ?? '#2ecc71',
        );

        const showTopLeft = cfg?.showTopLeft ?? true;
        const showAbilities = cfg?.showAbilities ?? true;

        if (showTopLeft && typeof ui.drawTopLeftOnly === 'function') {
            let restoreAbilityFn = null;

            if (!showAbilities && typeof ui.firedogAbilityUI === 'function') {
                const old = ui.firedogAbilityUI;
                restoreAbilityFn = () => (ui.firedogAbilityUI = old);
                ui.firedogAbilityUI = () => { };
            }

            if (typeof ui.withHudLayoutStyle === 'function') {
                ui.withHudLayoutStyle('compact', () => ui.drawTopLeftOnly(ctx));
            } else {
                ui.drawTopLeftOnly(ctx);
            }
            if (restoreAbilityFn) restoreAbilityFn();
        } else if (showAbilities && typeof ui.firedogAbilityUI === 'function') {
            if (typeof ui.withHudLayoutStyle === 'function') {
                ui.withHudLayoutStyle('compact', () => ui.firedogAbilityUI(ctx));
            } else {
                ui.firedogAbilityUI(ctx);
            }
        }

        if (restoreCooldowns) restoreCooldowns();
        if (restorePlayer) restorePlayer();

        ctx.restore();
    }

    draw(context) {
        this.drawCurrentPage(context);
        this.drawTopLeftUIOverlay(context);

        const prev = this.menuInGame;
        this.menuInGame = true;
        super.draw(context);
        this.menuInGame = prev;
    }
}
