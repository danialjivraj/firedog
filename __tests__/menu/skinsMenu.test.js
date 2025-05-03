import { Skins } from '../../game/menu/skinsMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('Skins menu', () => {
    let menu, mockGame, ctx;

    beforeAll(() => {
        document.body.innerHTML = `
      <img id="skinStage" />
      <img id="player" />
      <img id="player2" />
      <img id="player3" />
      <img id="player4" />
      <img id="player5" />
    `;
        jest.spyOn(BaseMenu.prototype, 'draw').mockImplementation(() => { });
        jest.spyOn(BaseMenu.prototype, 'handleMenuSelection').mockImplementation(() => { });
    });

    afterAll(() => {
        BaseMenu.prototype.draw.mockRestore();
        BaseMenu.prototype.handleMenuSelection.mockRestore();
    });

    beforeEach(() => {
        mockGame = {
            width: 1920,
            height: 689,
            audioHandler: { menu: { playSound: jest.fn() } },
            menu: { main: { activateMenu: jest.fn() } },
        };
        menu = new Skins(mockGame);
        menu.activateMenu();
        ctx = {
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            fillText: jest.fn(),
            measureText: jest.fn().mockReturnValue({ width: 10 }),
        };
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('starts with default skin selected', () => {
            expect(menu.currentSkin.id).toBe('player');
            expect(menu.selectedSkinIndex).toBe(0);
            expect(menu.menuOptions).toEqual([
                'Firedog - Selected',
                'Hatboy Firedog',
                'Firedog the Cholo',
                'Zabka Firedog',
                'Go Back'
            ]);
        });
    });

    describe('skin objects', () => {
        it('has the correct IDs on each skin object', () => {
            expect(menu.defaultSkin.id).toBe('player');
            expect(menu.hatSkin.id).toBe('player2');
            expect(menu.choloSkin.id).toBe('player3');
            expect(menu.zabkaSkin.id).toBe('player4');
            expect(menu.shinySkin.id).toBe('player5');
        });
    });

    describe('setCurrentSkinById()', () => {
        it('selects player2 (Hatboy Firedog)', () => {
            menu.setCurrentSkinById('player2');
            expect(menu.currentSkin.id).toBe('player2');
            expect(menu.selectedSkinIndex).toBe(1);
            expect(menu.menuOptions).toEqual([
                'Firedog',
                'Hatboy Firedog - Selected',
                'Firedog the Cholo',
                'Zabka Firedog',
                'Go Back'
            ]);
        });

        it('selects player3 (Cholo Firedog)', () => {
            menu.setCurrentSkinById('player3');
            expect(menu.currentSkin.id).toBe('player3');
            expect(menu.selectedSkinIndex).toBe(2);
            expect(menu.menuOptions).toEqual([
                'Firedog',
                'Hatboy Firedog',
                'Firedog the Cholo - Selected',
                'Zabka Firedog',
                'Go Back'
            ]);
        });

        it('selects player4 (Zabka Firedog)', () => {
            menu.setCurrentSkinById('player4');
            expect(menu.currentSkin.id).toBe('player4');
            expect(menu.selectedSkinIndex).toBe(3);
            expect(menu.menuOptions).toEqual([
                'Firedog',
                'Hatboy Firedog',
                'Firedog the Cholo',
                'Zabka Firedog - Selected',
                'Go Back'
            ]);
        });

        it('ignores unknown id', () => {
            const original = menu.currentSkin;
            const originalOptions = [...menu.menuOptions];
            menu.setCurrentSkinById('no-such-id');
            expect(menu.currentSkin).toBe(original);
            expect(menu.menuOptions).toEqual(originalOptions);
        });

        it('removes the old "- Selected" when picking a new skin', () => {
            menu.setCurrentSkinById('player2');
            menu.setCurrentSkinById('player3');
            expect(menu.menuOptions).toEqual([
                'Firedog',
                'Hatboy Firedog',
                'Firedog the Cholo - Selected',
                'Zabka Firedog',
                'Go Back'
            ]);
        });
    });

    describe('setCurrentSkin()', () => {
        it('keeps default skin 90% of the time', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.5);
            menu.setCurrentSkin('Firedog');
            expect(menu.currentSkin.id).toBe('player');
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
            Math.random.mockRestore();
        });

        it('selects shiny skin 10% of the time and plays sound', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.95);
            menu.setCurrentSkin('Firedog');
            expect(menu.currentSkin.id).toBe('player5');
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('shinySkinRizzSound');
            Math.random.mockRestore();
        });

        it('selects shiny when random() === threshold', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.9);
            menu.setCurrentSkin('Firedog');
            expect(menu.currentSkin.id).toBe('player5');
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('shinySkinRizzSound');
            Math.random.mockRestore();
        });

        it('selects hat skin by name', () => {
            menu.setCurrentSkin('Hatboy Firedog');
            expect(menu.currentSkin.id).toBe('player2');
        });

        it('selects cholo skin by name', () => {
            menu.setCurrentSkin('Firedog the Cholo');
            expect(menu.currentSkin.id).toBe('player3');
        });

        it('selects zabka skin by name', () => {
            menu.setCurrentSkin('Zabka Firedog');
            expect(menu.currentSkin.id).toBe('player4');
        });

        it('falls back to default on unknown name', () => {
            menu.currentSkin = menu.hatSkin;
            menu.setCurrentSkin('No such skin');
            expect(menu.currentSkin.id).toBe('player');
        });
    });

    describe('handleMenuSelection()', () => {
        it('chooses Firedog and marks it selected', () => {
            menu.selectedSkinIndex = 1;
            menu.menuOptions[1] += ' - Selected';
            menu.selectedOption = 0;
            menu.menuOptions[0] = 'Firedog';
            menu.handleMenuSelection();
            expect(menu.selectedSkinIndex).toBe(0);
            expect(menu.menuOptions[0]).toBe('Firedog - Selected');
        });

        it('chooses Hatboy Firedog', () => {
            menu.selectedOption = 1;
            menu.handleMenuSelection();
            expect(menu.selectedSkinIndex).toBe(1);
            expect(menu.menuOptions[1]).toBe('Hatboy Firedog - Selected');
        });

        it('chooses Cholo Firedog', () => {
            menu.selectedOption = 2;
            menu.handleMenuSelection();
            expect(menu.selectedSkinIndex).toBe(2);
            expect(menu.menuOptions[2]).toBe('Firedog the Cholo - Selected');
        });

        it('chooses Zabka Firedog', () => {
            menu.selectedOption = 3;
            menu.handleMenuSelection();
            expect(menu.selectedSkinIndex).toBe(3);
            expect(menu.menuOptions[3]).toBe('Zabka Firedog - Selected');
        });

        it('Go Back calls main.activateMenu(1)', () => {
            menu.selectedOption = 4;
            menu.handleMenuSelection();
            expect(mockGame.menu.main.activateMenu).toHaveBeenCalledWith(1);
        });

        it('never marks "Go Back" with "- Selected"', () => {
            menu.selectedOption = 4;
            menu.menuOptions[4] = 'Go Back';
            menu.handleMenuSelection();
            expect(menu.menuOptions[4]).toBe('Go Back');
        });
    });

    describe('draw()', () => {
        beforeEach(() => {
            menu.frameX = 2;
            menu.width = 50;
            menu.height = 60;
            menu.x = 300;
            menu.y = 200;
        });

        it('skips drawing the sprite when menuActive is false', () => {
            menu.menuActive = false;
            menu.draw(ctx);
            expect(BaseMenu.prototype.draw).toHaveBeenCalledWith(ctx);
            expect(ctx.drawImage).not.toHaveBeenCalled();
        });

        it('draws default skin sprite for Firedog option', () => {
            menu.menuActive = true;
            menu.selectedOption = 0;
            menu.currentSkin = menu.defaultSkin;
            menu.draw(ctx);
            expect(BaseMenu.prototype.draw).toHaveBeenCalledWith(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.defaultSkin,
                2 * 50, 0, 50, 60,
                300 - 50, 200 - 20,
                50, 60
            );
        });

        it('draws shiny skin when currentSkin is shiny and option is Firedog', () => {
            menu.menuActive = true;
            menu.selectedOption = 0;
            menu.currentSkin = menu.shinySkin;
            menu.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.shinySkin,
                2 * 50, 0, 50, 60,
                300 - 50, 200 - 20,
                50, 60
            );
        });

        it('draws hatSkin for Hatboy Firedog option', () => {
            menu.menuActive = true;
            menu.selectedOption = 1;
            menu.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.hatSkin,
                2 * 50, 0, 50, 60,
                300 - 50, 200 - 20,
                50, 60
            );
        });

        it('draws choloSkin for Firedog the Cholo option', () => {
            menu.menuActive = true;
            menu.selectedOption = 2;
            menu.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.choloSkin,
                2 * 50, 0, 50, 60,
                300 - 50, 200 - 20,
                50, 60
            );
        });

        it('draws zabkaSkin for Zabka Firedog option', () => {
            menu.menuActive = true;
            menu.selectedOption = 3;
            menu.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.zabkaSkin,
                2 * 50, 0, 50, 60,
                300 - 50, 200 - 20,
                50, 60
            );
        });

        it('draws currentSkin for Go Back option', () => {
            menu.menuActive = true;
            menu.selectedOption = 4;
            menu.currentSkin = menu.hatSkin;
            menu.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.hatSkin,
                2 * 50, 0, 50, 60,
                300 - 50, 200 - 20,
                50, 60
            );
        });
    });
});
