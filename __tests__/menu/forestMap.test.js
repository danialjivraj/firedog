import { ForestMapMenu } from '../../game/menu/forestMap.js';

jest.useFakeTimers();

describe('ForestMapMenu', () => {
    const W = 1920;
    const H = 689;
    let menu, mockGame, ctx;

    beforeAll(() => {
        document.body.innerHTML = `
      <img id="forestmap" />
      <img id="forestmapNight" />
      <img id="forestmapFiredog" />
      <img id="forestmapHatFiredog" />
      <img id="forestmapCholoFiredog" />
      <img id="forestmapZabkaFiredog" />
      <img id="forestmapFiredogShiny" />
    `;
    });

    beforeEach(() => {
        mockGame = {
            width: W,
            height: H,
            canvas: {
                width: W,
                height: H,
                getBoundingClientRect: () => ({ left: 0, top: 0, width: W, height: H })
            },
            audioHandler: { menu: { playSound: jest.fn(), stopSound: jest.fn() } },
            map1Unlocked: false,
            map2Unlocked: false,
            map3Unlocked: false,
            map4Unlocked: false,
            map5Unlocked: false,
            map6Unlocked: false,
            canSelectForestMap: false,
            menu: { skins: { defaultSkin: 'default', currentSkin: 'default' }, main: { closeAllMenus: jest.fn() } },
            player: { isUnderwater: null, isDarkWhiteBorder: null },
            updateMapSelection: jest.fn(),
            startCutscene: jest.fn(),
            maxCoinsToFightElyvorg: 999,
            groundMargin: 0
        };

        ctx = {
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            closePath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            measureText: jest.fn().mockReturnValue({ width: 20 }),
            shadowColor: '',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            globalAlpha: 1,
            font: '',
        };

        menu = new ForestMapMenu(mockGame);
        menu.activateMenu();
        jest.clearAllMocks();
    });

    describe('initial state', () => {
        it('starts with selectedCircleIndex 0 and showSavingSprite false', () => {
            expect(menu.selectedCircleIndex).toBe(0);
            expect(menu.showSavingSprite).toBe(false);
        });

        it('resetSelectedCircleIndex() sets it back to 0', () => {
            menu.selectedCircleIndex = 3;
            menu.resetSelectedCircleIndex();
            expect(menu.selectedCircleIndex).toBe(0);
        });
    });

    describe('handleMouseWheel()', () => {
        beforeEach(() => {
            mockGame.canSelectForestMap = true;
        });

        it('does nothing if menuActive is false', () => {
            menu.menuActive = false;
            menu.handleMouseWheel({ deltaY: -100 });
            expect(menu.selectedCircleIndex).toBe(0);
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
        });

        it('does nothing if no maps unlocked', () => {
            menu.menuActive = true;
            menu.handleMouseWheel({ deltaY: -100 });
            expect(menu.selectedCircleIndex).toBe(0);
        });

        it('moves selection forward on wheel up when multiple unlocked', () => {
            mockGame.map1Unlocked = true;
            mockGame.map2Unlocked = true;
            menu.menuActive = true;

            menu.handleMouseWheel({ deltaY: -200 });
            expect(menu.selectedCircleIndex).toBe(1);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);

            mockGame.audioHandler.menu.playSound.mockClear();
            menu.handleMouseWheel({ deltaY: -200 });
            expect(menu.selectedCircleIndex).toBe(1);
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();

            jest.advanceTimersByTime(20);

            menu.handleMouseWheel({ deltaY: 100 });
            expect(menu.selectedCircleIndex).toBe(0);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);
        });
    });

    describe('handleMouseMove()', () => {
        beforeEach(() => {
            mockGame.canSelectForestMap = true;
            mockGame.map1Unlocked = true;
            mockGame.map2Unlocked = true;
            menu.menuActive = true;
        });

        it('changes selection when hovering over a new unlocked circle', () => {
            expect(menu.selectedCircleIndex).toBe(0);
            const circle2 = menu.circleOptions[1];
            menu.handleMouseMove({
                clientX: circle2.x,
                clientY: circle2.y
            });
            expect(menu.selectedCircleIndex).toBe(1);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);
        });

        it('does nothing when hovering outside any unlocked circle', () => {
            mockGame.audioHandler.menu.playSound.mockClear();
            menu.handleMouseMove({ clientX: 0, clientY: 0 });
            expect(menu.selectedCircleIndex).toBe(0);
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
        });
    });

    describe('handleKeyDown()', () => {
        beforeEach(() => {
            mockGame.canSelectForestMap = true;
            mockGame.map1Unlocked = true;
            mockGame.map2Unlocked = true;
            menu.menuActive = true;
        });

        it('ArrowRight moves to next unlocked circle', () => {
            menu.handleKeyDown({ key: 'ArrowRight' });
            expect(menu.selectedCircleIndex).toBe(1);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);
        });

        it('ArrowLeft moves to previous unlocked circle', () => {
            menu.selectedCircleIndex = 1;
            menu.handleKeyDown({ key: 'ArrowLeft' });
            expect(menu.selectedCircleIndex).toBe(0);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);
        });

        it('Enter triggers handleMenuSelection()', () => {
            jest.spyOn(menu, 'handleMenuSelection').mockImplementation(() => { });
            menu.handleKeyDown({ key: 'Enter' });
            expect(menu.handleMenuSelection).toHaveBeenCalled();
        });
    });

    describe('update()', () => {
        it('always stops the soundtrack', () => {
            menu.update(16);
            expect(mockGame.audioHandler.menu.stopSound).toHaveBeenCalledWith('soundtrack');
        });

        it('calls savingAnimation.update when showSavingSprite is true', () => {
            jest.spyOn(menu.savingAnimation, 'update');
            jest.spyOn(menu.savingBookAnimation, 'update');
            menu.showSavingSprite = true;
            menu.update(42);
            expect(menu.savingAnimation.update).toHaveBeenCalledWith(42);
            expect(menu.savingBookAnimation.update).toHaveBeenCalledWith(42);
        });
    });

    describe('draw()', () => {
        beforeEach(() => {
            menu.menuActive = true;
        });

        it('draws day background when map2Unlocked=false', () => {
            mockGame.map2Unlocked = false;
            menu.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(menu.backgroundImage, 0, 0, W, H);
        });

        it('draws night background when map2Unlocked=true & map3Unlocked=false', () => {
            mockGame.map2Unlocked = true;
            mockGame.map3Unlocked = false;
            menu.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(menu.backgroundImageNight, 0, 0, W, H);
        });

        it('only draws circles for unlocked maps', () => {
            mockGame.map1Unlocked = true;
            mockGame.map2Unlocked = false;
            menu.draw(ctx);
            expect(ctx.arc).toHaveBeenCalledWith(
                menu.circleOptions[0].x,
                menu.circleOptions[0].y,
                menu.circleOptions[0].radius,
                0, Math.PI * 2
            );
            const coords1 = menu.circleOptions[1];
            const calledWith1 = ctx.arc.mock.calls.some(
                call => call[0] === coords1.x && call[1] === coords1.y
            );
            expect(calledWith1).toBe(false);
        });

        it('renders the selected map text and hint', () => {
            mockGame.map1Unlocked = true;
            menu.draw(ctx);
            const texts = ctx.fillText.mock.calls.map(args => args[0]);
            expect(texts).toContain('Map 1 - Lunar Moonlit Glade');
            expect(texts).toContain('Tab for Enemy Lore');
        });

        it('draws saving sprites when showSavingSprite is true', () => {
            jest.spyOn(menu.savingAnimation, 'draw');
            jest.spyOn(menu.savingBookAnimation, 'draw');
            menu.showSavingSprite = true;
            menu.draw(ctx);
            expect(menu.savingAnimation.draw).toHaveBeenCalledWith(ctx);
            expect(menu.savingBookAnimation.draw).toHaveBeenCalledWith(ctx);
        });
    });
});
