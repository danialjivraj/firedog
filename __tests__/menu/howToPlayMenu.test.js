jest.mock('../../game/menu/baseMenu.js', () => {
    class BaseMenu {
        constructor(game, menuOptions = [], title = '') {
            this.game = game;
            this.menuOptions = menuOptions;
            this.title = title;

            this.selectedOption = 0;
            this.menuActive = true;
            this.menuInGame = false;
        }

        handleKeyDown(event) {
        }

        handleMenuSelection() {
        }

        activateMenu(selectedOption = 0) {
            this.selectedOption = selectedOption;
            this.menuActive = true;
        }

        draw(ctx) {
        }
    }

    return { BaseMenu };
});

jest.mock('../../game/animations/screenColourFade.js', () => ({
    screenColourFadeIn: jest.fn((a) => Math.min(1, (Number(a) || 0) + 0.1)),
    screenColourFadeOut: jest.fn((a) => Math.max(0, (Number(a) || 0) - 0.1)),
}));

jest.mock('../../game/entities/powerUpAndDown.js', () => {
    const mk = () =>
        class {
            constructor(game) {
                this.game = game;
                this.width = 40;
                this.height = 40;
                this.x = 0;
                this.y = 0;
                this.markedForDeletion = false;
            }
            update() { }
            draw(ctx) {
                ctx.__powerDrawCalls = (ctx.__powerDrawCalls || 0) + 1;
            }
        };

    return {
        BluePotion: mk(),
        RedPotion: mk(),
        HealthLive: mk(),
        Cauldron: mk(),
        BlackHole: mk(),
        IceDrink: mk(),
    };
});

jest.mock('../../game/animations/particles.js', () => {
    class PoisonBubbles {
        constructor(game) {
            this.game = game;
            this.parallax = 1;
            this.markedForDeletion = false;
        }
        update() { }
        draw(ctx) {
            ctx.__poisonParticleDrawCalls = (ctx.__poisonParticleDrawCalls || 0) + 1;
        }
    }

    class IceCrystalBubbles {
        constructor(game) {
            this.game = game;
            this.parallax = 1;
            this.markedForDeletion = false;
        }
        update() { }
        draw(ctx) {
            ctx.__slowParticleDrawCalls = (ctx.__slowParticleDrawCalls || 0) + 1;
        }
    }

    return { PoisonBubbles, IceCrystalBubbles };
});

import { HowToPlayMenu } from '../../game/menu/howToPlayMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';
import { screenColourFadeIn, screenColourFadeOut } from '../../game/animations/screenColourFade.js';

const makeImg = (id) => {
    const img = document.createElement('img');
    img.id = id;
    img.width = 100;
    img.height = 100;
    return img;
};

function installDomAssets() {
    document.body.innerHTML = '';

    const ids = [
        'mainmenubackgroundhowtoplay',
        // ability
        'fireball',

        // keycaps
        'keycap',
        'enterKeycap',
        'shiftKeycap',

        // mouse icons
        'leftClick',
        'rightClick',
        'scrollWheelClick',
        'mouseButton4Click',

        // enemies
        'skulnap',
        'gloomlet',
        'duskPlant',
        'iceSilknoir',
    ];

    for (const id of ids) document.body.appendChild(makeImg(id));

    const realCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag !== 'canvas') return realCreateElement(tag);

        const canvas = {
            width: 0,
            height: 0,
            getContext: () => ({
                clearRect: jest.fn(),
                drawImage: jest.fn(),
                fillRect: jest.fn(),
                createLinearGradient: jest.fn(() => ({
                    addColorStop: jest.fn(),
                })),
                set globalCompositeOperation(_) { },
                set fillStyle(_) { },
            }),
        };
        return canvas;
    });
}

function makeCtx() {
    return {
        __powerDrawCalls: 0,

        save: jest.fn(),
        restore: jest.fn(),
        setTransform: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),

        drawImage: jest.fn(),
        fillRect: jest.fn(),

        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),

        strokeText: jest.fn(),
        fillText: jest.fn(),

        measureText: jest.fn((s) => ({ width: String(s || '').length * 10 })),

        font: '',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        textAlign: 'left',
        textBaseline: 'top',
        globalAlpha: 1,
        shadowColor: '',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        lineCap: '',
        lineJoin: '',
    };
}

function makeGame({ W = 1920, H = 689 } = {}) {
    const game = {
        width: W,
        height: H,
        groundMargin: 80,
        deltaTime: 16,

        menu: {
            pause: { isPaused: false },
            main: { activateMenu: jest.fn() },
        },

        goBackMenu: jest.fn(() => {
            game.menu.main.activateMenu(3);
        }),

        UI: {
            drawTutorialProgressBar: jest.fn(),
            drawTopLeftOnly: jest.fn(),
            firedogAbilityUI: jest.fn(),
        },

        player: {
            maxEnergy: 100,
            energy: 100,
            isEnergyExhausted: false,
            isPoisonedActive: false,
            isBluePotionActive: false,
            isFrozen: false,

            states: Array.from({ length: 12 }, (_, i) => ({ name: `state${i}` })),
            currentState: { name: 'default' },
        },
    };

    return game;
}

function findPageIndex(menu, titleIncludes) {
    const idx = menu.pages.findIndex((p) => String(p?.title || '').includes(titleIncludes));
    if (idx < 0) throw new Error(`Page not found: ${titleIncludes}`);
    return idx;
}

describe('HowToPlayMenu (new logic)', () => {
    let game, menu, ctx;

    beforeAll(() => {
        installDomAssets();
        Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true });
    });

    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(BaseMenu.prototype, 'handleKeyDown');
        jest.spyOn(BaseMenu.prototype, 'handleMenuSelection');
        jest.spyOn(BaseMenu.prototype, 'activateMenu');
        jest.spyOn(BaseMenu.prototype, 'draw');

        game = makeGame();
        ctx = makeCtx();
        menu = new HowToPlayMenu(game);
    });

    afterAll(() => {
        document.createElement.mockRestore?.();
    });

    describe('construction', () => {
        it('builds pages and starts at page 0', () => {
            expect(menu.menuOptions).toEqual(['Next', 'Previous', 'Go Back']);
            expect(Array.isArray(menu.pages)).toBe(true);
            expect(menu.pages.length).toBeGreaterThan(5);
            expect(menu.currentPage).toBe(0);
        });

        it('loads background image from DOM', () => {
            expect(menu.backgroundImage).toBeTruthy();
            expect(menu.backgroundImage.id).toBe('mainmenubackgroundhowtoplay');
        });
    });

    describe('_getTutorialProgressPercentage()', () => {
        it('returns 0% on first page and 100% on last page', () => {
            menu.currentPage = 0;
            expect(menu._getTutorialProgressPercentage()).toBeCloseTo(0, 6);

            menu.currentPage = menu.pages.length - 1;
            expect(menu._getTutorialProgressPercentage()).toBeCloseTo(100, 6);
        });

        it('clamps out-of-range pages', () => {
            menu.currentPage = -50;
            expect(menu._getTutorialProgressPercentage()).toBeCloseTo(0, 6);

            menu.currentPage = 99999;
            expect(menu._getTutorialProgressPercentage()).toBeCloseTo(100, 6);
        });
    });

    describe('navigation', () => {
        it('nextPage increments within bounds and calls BaseMenu.handleMenuSelection', () => {
            menu.currentPage = 0;
            menu.nextPage();
            expect(menu.currentPage).toBe(1);
            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalledTimes(1);
        });

        it('nextPage does nothing at last page', () => {
            menu.currentPage = menu.pages.length - 1;
            menu.nextPage();
            expect(menu.currentPage).toBe(menu.pages.length - 1);
            expect(BaseMenu.prototype.handleMenuSelection).not.toHaveBeenCalled();
        });

        it('previousPage decrements within bounds and calls BaseMenu.handleMenuSelection', () => {
            menu.currentPage = 2;
            menu.previousPage();
            expect(menu.currentPage).toBe(1);
            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalledTimes(1);
        });

        it('previousPage does nothing at page 0', () => {
            menu.currentPage = 0;
            menu.previousPage();
            expect(menu.currentPage).toBe(0);
            expect(BaseMenu.prototype.handleMenuSelection).not.toHaveBeenCalled();
        });
    });

    describe('handleKeyDown()', () => {
        it('delegates to BaseMenu.handleKeyDown first', () => {
            menu.menuActive = true;
            menu.handleKeyDown({ key: 'ArrowRight' });
            expect(BaseMenu.prototype.handleKeyDown).toHaveBeenCalledTimes(1);
        });

        it('does nothing when menuActive is false', () => {
            menu.menuActive = false;
            menu.currentPage = 0;
            menu.handleKeyDown({ key: 'ArrowRight' });
            expect(menu.currentPage).toBe(0);
        });

        it('ArrowRight goes next and ArrowLeft goes previous when active', () => {
            menu.menuActive = true;
            menu.currentPage = 0;

            menu.handleKeyDown({ key: 'ArrowRight' });
            expect(menu.currentPage).toBe(1);

            menu.handleKeyDown({ key: 'ArrowLeft' });
            expect(menu.currentPage).toBe(0);
        });
    });

    describe('activateMenu()', () => {
        it('resets to page 0 and resets demo state', () => {
            menu.currentPage = 4;
            menu._demoEnergy.active = true;
            menu._demoInvisible.active = true;
            menu._demoDash.active = true;
            menu._demoInvisibleColourOpacity = 0.9;

            menu.activateMenu(0);

            expect(menu.currentPage).toBe(0);
            expect(menu._lastPageIndex).toBe(-1);
            expect(menu._demoEnergy.active).toBe(false);
            expect(menu._demoInvisible.active).toBe(false);
            expect(menu._demoDash.active).toBe(false);
            expect(menu._demoInvisibleColourOpacity).toBe(0);

            expect(BaseMenu.prototype.activateMenu).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleMenuSelection()', () => {
        it('Next triggers nextPage', () => {
            menu.selectedOption = 0; // Next
            const spy = jest.spyOn(menu, 'nextPage');

            menu.handleMenuSelection();

            expect(spy).toHaveBeenCalledTimes(1);
            expect(menu.currentPage).toBe(1);
        });

        it('Previous triggers previousPage', () => {
            menu.currentPage = 2;
            menu.selectedOption = 1; // Previous
            const spy = jest.spyOn(menu, 'previousPage');

            menu.handleMenuSelection();

            expect(spy).toHaveBeenCalledTimes(1);
            expect(menu.currentPage).toBe(1);
        });

        it('Go Back resets page and calls game.goBackMenu (which activates main menu with arg 3)', () => {
            menu.currentPage = 5;
            menu.selectedOption = 2; // Go Back

            menu.handleMenuSelection();

            expect(menu.currentPage).toBe(0);
            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalledTimes(1);

            expect(game.goBackMenu).toHaveBeenCalledTimes(1);
            expect(game.menu.main.activateMenu).toHaveBeenCalledWith(3);
        });
    });

    describe('drawCurrentPage()', () => {
        it('draws the background, page drawables, and page label', () => {
            menu.currentPage = 0;

            const page = menu.getCurrentPage();
            expect(page).toBeTruthy();
            expect(Array.isArray(page.drawables)).toBe(true);

            const firstDrawable = page.drawables.find((d) => d && typeof d.draw === 'function');
            expect(firstDrawable).toBeTruthy();

            const dSpy = jest.spyOn(firstDrawable, 'draw');

            menu.drawCurrentPage(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(menu.backgroundImage, 0, 0, game.width, game.height);
            expect(dSpy).toHaveBeenCalledTimes(1);

            expect(ctx.strokeText).toHaveBeenCalled();
            expect(ctx.fillText).toHaveBeenCalled();
        });
    });

    describe('drawTopLeftUIOverlay()', () => {
        it('calls UI.drawTutorialProgressBar with computed percentage', () => {
            menu.currentPage = 0;
            menu.drawTopLeftUIOverlay(ctx);

            expect(game.UI.drawTutorialProgressBar).toHaveBeenCalledTimes(1);

            const [calledCtx, pct] = game.UI.drawTutorialProgressBar.mock.calls[0];
            expect(calledCtx).toBe(ctx);
            expect(pct).toBeCloseTo(0, 6);
        });

        it('applies demo patch internally on Fireball page (patch is TEMPORARY then restored)', () => {
            const fireballIdx = findPageIndex(menu, 'Fireball (3)');
            menu.currentPage = fireballIdx;

            game.deltaTime = 2000;

            const applySpy = jest.spyOn(menu, 'applyDemoPlayerState');

            menu.drawTopLeftUIOverlay(ctx);

            expect(applySpy).toHaveBeenCalledTimes(1);
            const arg = applySpy.mock.calls[0][0];
            expect(arg).toEqual(expect.objectContaining({
                fireballCooldown: expect.any(Number),
                fireballTimer: expect.any(Number),
                energy: expect.any(Number),
            }));
        });

        it('invisible demo drives fade calls', () => {
            const invIdx = findPageIndex(menu, 'Invisible (4)');
            menu.currentPage = invIdx;

            game.deltaTime = 1200;
            menu.drawTopLeftUIOverlay(ctx);
            expect(screenColourFadeIn).toHaveBeenCalled();

            game.deltaTime = 6000;
            menu.drawTopLeftUIOverlay(ctx);
            menu.drawTopLeftUIOverlay(ctx);

            expect(screenColourFadeOut).toHaveBeenCalled();
        });
    });

    describe('draw()', () => {
        it('draws page + UI overlay and then calls BaseMenu.draw', () => {
            menu.draw(ctx);

            expect(ctx.drawImage).toHaveBeenCalled();

            expect(game.UI.drawTutorialProgressBar).toHaveBeenCalled();

            expect(BaseMenu.prototype.draw).toHaveBeenCalledTimes(1);
        });
    });

    describe('_stepFireArcs()', () => {
        const makeArc = (size, speedX = 0, speedY = 0) => ({
            x: 100, y: 100, size, speedX, speedY, angle: 0, va: 0,
        });

        it('shrinks arc size each step', () => {
            const arcs = [makeArc(10)];
            const result = menu._stepFireArcs(arcs, 1, 0);
            expect(result[0].size).toBeLessThan(10);
        });

        it('filters arcs whose size drops below 0.5', () => {
            const arcs = [makeArc(10), makeArc(0.4)];
            const result = menu._stepFireArcs(arcs, 1, 0);
            expect(result).toHaveLength(1);
        });

        it('returns empty array when all arcs are too small', () => {
            const arcs = [makeArc(0.3), makeArc(0.1)];
            expect(menu._stepFireArcs(arcs, 1, 0)).toHaveLength(0);
        });

        it('moves arc left by gameSpeed (world scroll drift)', () => {
            const arcs = [makeArc(10, 0, 0)];
            const before = arcs[0].x;
            const result = menu._stepFireArcs(arcs, 1, 6);
            expect(result[0].x).toBeLessThan(before);
        });

        it('with gameSpeed=0 arc only moves by its own speedX', () => {
            const arcs = [makeArc(10, 2, 0)];
            const result = menu._stepFireArcs(arcs, 1, 0);
            expect(result[0].x).toBeCloseTo(100 - 2, 5);
        });

        it('does not mutate the original array reference', () => {
            const arcs = [makeArc(10)];
            const result = menu._stepFireArcs(arcs, 1, 0);
            expect(result).not.toBe(arcs);
        });
    });

    describe('_createEnergyExhaustedDisabledUI()', () => {
        it('returns a drawable with a draw function', () => {
            const drawable = menu._createEnergyExhaustedDisabledUI();
            expect(typeof drawable.draw).toBe('function');
        });

        it('does nothing when energy demo is inactive', () => {
            menu._demoEnergy.active = false;
            menu._demoEnergy.exhausted = true;
            const drawable = menu._createEnergyExhaustedDisabledUI();
            drawable.draw(ctx);
            expect(ctx.strokeText).not.toHaveBeenCalled();
        });

        it('does nothing when not exhausted', () => {
            menu._demoEnergy.active = true;
            menu._demoEnergy.exhausted = false;
            const drawable = menu._createEnergyExhaustedDisabledUI();
            drawable.draw(ctx);
            expect(ctx.strokeText).not.toHaveBeenCalled();
        });

        it('draws two arrows and one text block when exhausted', () => {
            menu._demoEnergy.active = true;
            menu._demoEnergy.exhausted = true;

            const arrowSpy = jest.spyOn(menu, 'drawArrowImpl');
            const textSpy = jest.spyOn(menu, 'drawTextBlockImpl');

            const drawable = menu._createEnergyExhaustedDisabledUI();
            drawable.draw(ctx);

            expect(arrowSpy).toHaveBeenCalledTimes(2);
            expect(textSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('dash between-timer starts immediately on dashing1', () => {
        const dashCfg = {
            enabled: true,
            waitMs: 0,
            betweenMs: 500,
            secondWindowMs: 7000,
            simulateSecondAtMs: 99999,
            cooldownMs: 60000,
            maxEnergy: 100,
            startEnergy: 100,
            energyCost: 0,
            regenPerSec: 0,
        };

        beforeEach(() => {
            menu._updateDashDemo(0, dashCfg);
            menu._lastPageIndex = menu.currentPage;
        });

        it('enters dashing1 immediately when waitMs=0', () => {
            expect(menu._demoDash.phase).toBe('dashing1');
        });

        it('betweenElapsedMs is 0 at the start of dashing1', () => {
            expect(menu._demoDash.betweenElapsedMs).toBe(0);
        });

        it('betweenElapsedMs increments during dashing1', () => {
            menu._updateDashDemo(50, dashCfg);
            expect(menu._demoDash.betweenElapsedMs).toBe(50);
        });

        it('betweenElapsedMs carries over when entering afterFirst', () => {
            menu._updateDashDemo(200, dashCfg);
            expect(menu._demoDash.phase).toBe('afterFirst');
            expect(menu._demoDash.betweenElapsedMs).toBeGreaterThanOrEqual(180);
        });

        it('dashBetweenTimer in the return value equals betweenElapsedMs during dashing1', () => {
            menu._updateDashDemo(75, dashCfg);
            const result = menu._updateDashDemo(0, dashCfg);
            expect(result.dashBetweenTimer).toBeCloseTo(menu._demoDash.betweenElapsedMs, 5);
        });
    });

    describe('60s cooldown timer starts immediately when dashing2 begins', () => {
        const dashCfg = {
            enabled: true,
            waitMs: 0,
            betweenMs: 0,
            secondWindowMs: 7000,
            simulateSecondAtMs: 0,
            cooldownMs: 60000,
            maxEnergy: 100,
            startEnergy: 100,
            energyCost: 0,
            regenPerSec: 0,
        };

        function advanceToDashing2(m) {
            m._updateDashDemo(0, dashCfg);
            m._lastPageIndex = m.currentPage;
            m._updateDashDemo(200, dashCfg);
            m._updateDashDemo(1, dashCfg);
        }

        it('enters dashing2 after first dash completes with betweenMs=0', () => {
            advanceToDashing2(menu);
            expect(menu._demoDash.phase).toBe('dashing2');
        });

        it('dashCooldownElapsedMs is 0 at the start of dashing2', () => {
            advanceToDashing2(menu);
            expect(menu._demoDash.dashCooldownElapsedMs).toBe(0);
        });

        it('dashTimer returns 0 at the moment dashing2 begins', () => {
            advanceToDashing2(menu);
            const result = menu._updateDashDemo(0, dashCfg);
            expect(result.dashTimer).toBe(0);
        });

        it('dashCooldownElapsedMs increments during dashing2', () => {
            advanceToDashing2(menu);
            menu._updateDashDemo(100, dashCfg);
            expect(menu._demoDash.dashCooldownElapsedMs).toBe(100);
        });

        it('dashTimer accumulates through dashing2 into stopped', () => {
            advanceToDashing2(menu);
            menu._updateDashDemo(200, dashCfg);
            expect(menu._demoDash.phase).toBe('stopped');
            expect(menu._demoDash.dashCooldownElapsedMs).toBeGreaterThan(0);
        });

        it('dashTimer is not reset to 0 when transitioning from dashing2 to stopped', () => {
            advanceToDashing2(menu);
            menu._updateDashDemo(200, dashCfg);
            const result = menu._updateDashDemo(0, dashCfg);
            expect(result.dashTimer).toBeGreaterThan(0);
        });
    });
});