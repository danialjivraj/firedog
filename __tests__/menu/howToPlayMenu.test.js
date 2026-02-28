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

        // firedog sprites
        'firedogSitting',
        'firedogStanding',
        'firedogRunning',
        'firedogJumping',
        'firedogRolling',
        'firedogDiving',
        'firedogDashing1',
        'firedogStunned',
        'firedogHit',
        'firedogFrozen',
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
        'skulnapSleep',
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
});