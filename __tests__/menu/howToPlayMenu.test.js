import { HowToPlayMenu } from '../../game/menu/howToPlayMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('HowToPlayMenu', () => {
    const W = 1920;
    const H = 689;
    let menu, mockGame, ctx;

    beforeAll(() => {
        document.body.innerHTML = `
      <img id="mainmenubackgroundhowtoplay" />
      ${Array.from({ length: 10 }, (_, i) => `<img id="howToPlay${i + 1}" />`).join('\n')}
    `;
        jest.spyOn(BaseMenu.prototype, 'handleKeyDown').mockImplementation(() => { });
    });

    beforeEach(() => {
        mockGame = {
            width: W,
            height: H,
            menu: { main: { activateMenu: jest.fn() } },
            isTutorialActive: false,
        };
        ctx = {
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            fillRect: jest.fn(),
            fillText: jest.fn(),
            font: '',
            fillStyle: '',
            textAlign: '',
        };
        menu = new HowToPlayMenu(mockGame);
        menu.activateMenu();
        jest.clearAllMocks();
    });

    afterAll(() => {
        BaseMenu.prototype.handleKeyDown.mockRestore();
    });

    describe('initialization', () => {
        it('sets up menuOptions and images correctly', () => {
            expect(menu.menuOptions).toEqual(['Next', 'Previous', 'Go Back']);
            expect(menu.currentImageIndex).toBe(0);
            expect(menu.howToPlayImages).toHaveLength(10);
            menu.howToPlayImages.forEach((img, idx) => {
                expect(img.id).toBe(`howToPlay${idx + 1}`);
            });
        });
    });

    describe('handleKeyDown()', () => {
        beforeAll(() => {
            jest.spyOn(BaseMenu.prototype, 'handleMenuSelection').mockImplementation(() => { });
        });
        afterAll(() => {
            BaseMenu.prototype.handleMenuSelection.mockRestore();
        });

        it('does nothing when menuActive is false', () => {
            menu.menuActive = false;
            menu.currentImageIndex = 0;
            menu.handleKeyDown({ key: 'ArrowRight' });
            expect(menu.currentImageIndex).toBe(0);
        });

        it('increments image index on ArrowRight when active', () => {
            menu.menuActive = true;
            menu.handleKeyDown({ key: 'ArrowRight' });
            expect(menu.currentImageIndex).toBe(1);
        });

        it('does not overflow past last image on ArrowRight', () => {
            menu.menuActive = true;
            menu.currentImageIndex = menu.howToPlayImages.length - 1;
            menu.handleKeyDown({ key: 'ArrowRight' });
            expect(menu.currentImageIndex).toBe(menu.howToPlayImages.length - 1);
        });

        it('decrements image index on ArrowLeft when active', () => {
            menu.menuActive = true;
            menu.currentImageIndex = 2;
            menu.handleKeyDown({ key: 'ArrowLeft' });
            expect(menu.currentImageIndex).toBe(1);
        });

        it('does not underflow below zero on ArrowLeft', () => {
            menu.menuActive = true;
            menu.currentImageIndex = 0;
            menu.handleKeyDown({ key: 'ArrowLeft' });
            expect(menu.currentImageIndex).toBe(0);
        });
    });

    describe('handleMenuSelection()', () => {
        beforeAll(() => {
            jest.spyOn(BaseMenu.prototype, 'handleMenuSelection').mockImplementation(() => { });
        });
        afterAll(() => {
            BaseMenu.prototype.handleMenuSelection.mockRestore();
        });

        it('Next option advances the image index', () => {
            menu.selectedOption = 0; // Next
            menu.currentImageIndex = 0;
            menu.handleMenuSelection();
            expect(menu.currentImageIndex).toBe(1);
            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalled();
        });

        it('Next does nothing at last image', () => {
            menu.selectedOption = 0;
            menu.currentImageIndex = menu.howToPlayImages.length - 1;
            BaseMenu.prototype.handleMenuSelection.mockClear();
            menu.handleMenuSelection();
            expect(menu.currentImageIndex).toBe(menu.howToPlayImages.length - 1);
            expect(BaseMenu.prototype.handleMenuSelection).not.toHaveBeenCalled();
        });

        it('Previous option moves back the image index', () => {
            menu.selectedOption = 1; // Previous
            menu.currentImageIndex = 2;
            menu.handleMenuSelection();
            expect(menu.currentImageIndex).toBe(1);
            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalled();
        });

        it('Previous does nothing at first image', () => {
            menu.selectedOption = 1;
            menu.currentImageIndex = 0;
            BaseMenu.prototype.handleMenuSelection.mockClear();
            menu.handleMenuSelection();
            expect(menu.currentImageIndex).toBe(0);
            expect(BaseMenu.prototype.handleMenuSelection).not.toHaveBeenCalled();
        });

        it('Go Back resets index and activates main menu', () => {
            menu.selectedOption = 2; // Go Back
            menu.currentImageIndex = 5;
            menu.handleMenuSelection();
            expect(menu.currentImageIndex).toBe(0);
            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalled();
            expect(mockGame.menu.main.activateMenu).toHaveBeenCalledWith(3);
        });
    });

    describe('draw()', () => {
        it('draws the background and current how-to-play image', () => {
            menu.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.backgroundImage, 0, 0, W, H
            );
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.howToPlayImages[0], 0, 0, W, H
            );
        });

        it('renders the tutorial toggle overlay with correct text when off', () => {
            mockGame.isTutorialActive = false;
            menu.draw(ctx);
            const centerX = W - 80;
            const centerY = 15;
            expect(ctx.fillRect).toHaveBeenCalledWith(
                centerX - 100, centerY - 20, 200, 40
            );
            expect(ctx.fillText)
                .toHaveBeenCalledWith('Tutorial: Off', centerX, centerY + 10);
        });

        it('renders the tutorial toggle overlay with correct text when on', () => {
            mockGame.isTutorialActive = true;
            menu.draw(ctx);
            const centerX = W - 80;
            const centerY = 15;
            expect(ctx.fillText)
                .toHaveBeenCalledWith('Tutorial: On', centerX, centerY + 10);
        });
    });
});
