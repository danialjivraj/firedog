import { Skins } from '../../game/menu/skinsMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('Skins menu', () => {
    let menu, mockGame, ctx;

    beforeAll(() => {
        document.body.innerHTML = `
      <img id="skinStage" />
      <img id="defaultSkin" />
      <img id="hatSkin" />
      <img id="choloSkin" />
      <img id="zabkaSkin" />
      <img id="shinySkin" />
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
            canSelect: true,
            canSelectForestMap: true,
            canvas: {
                width: 1920,
                height: 689,
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 689 })
            },
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
            expect(menu.currentSkin.id).toBe('defaultSkin');
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
            expect(menu.defaultSkin.id).toBe('defaultSkin');
            expect(menu.hatSkin.id).toBe('hatSkin');
            expect(menu.choloSkin.id).toBe('choloSkin');
            expect(menu.zabkaSkin.id).toBe('zabkaSkin');
            expect(menu.shinySkin.id).toBe('shinySkin');
        });
    });

    describe('setCurrentSkinById()', () => {
        it('selects hatSkin (Hatboy Firedog)', () => {
            menu.setCurrentSkinById('hatSkin');
            expect(menu.currentSkin.id).toBe('hatSkin');
            expect(menu.menuOptions).toEqual([
                'Firedog',
                'Hatboy Firedog - Selected',
                'Firedog the Cholo',
                'Zabka Firedog',
                'Go Back'
            ]);
        });

        it('selects choloSkin (Cholo Firedog)', () => {
            menu.setCurrentSkinById('choloSkin');
            expect(menu.currentSkin.id).toBe('choloSkin');
            expect(menu.menuOptions).toEqual([
                'Firedog',
                'Hatboy Firedog',
                'Firedog the Cholo - Selected',
                'Zabka Firedog',
                'Go Back'
            ]);
        });

        it('selects zabkaSkin (Zabka Firedog)', () => {
            menu.setCurrentSkinById('zabkaSkin');
            expect(menu.currentSkin.id).toBe('zabkaSkin');
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
            menu.setCurrentSkinById('hatSkin');
            menu.setCurrentSkinById('choloSkin');
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
            expect(menu.currentSkin.id).toBe('defaultSkin');
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
            Math.random.mockRestore();
        });

        it('selects shiny skin 10% of the time and plays sound', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.95);
            menu.setCurrentSkin('Firedog');
            expect(menu.currentSkin.id).toBe('shinySkin');
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('shinySkinRizzSound');
            Math.random.mockRestore();
        });

        it('selects shiny when random() === threshold', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.9);
            menu.setCurrentSkin('Firedog');
            expect(menu.currentSkin.id).toBe('shinySkin');
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('shinySkinRizzSound');
            Math.random.mockRestore();
        });

        it('selects hat skin by name', () => {
            menu.setCurrentSkin('Hatboy Firedog');
            expect(menu.currentSkin.id).toBe('hatSkin');
        });

        it('selects cholo skin by name', () => {
            menu.setCurrentSkin('Firedog the Cholo');
            expect(menu.currentSkin.id).toBe('choloSkin');
        });

        it('selects zabka skin by name', () => {
            menu.setCurrentSkin('Zabka Firedog');
            expect(menu.currentSkin.id).toBe('zabkaSkin');
        });

        it('falls back to default on unknown name', () => {
            menu.currentSkin = menu.hatSkin;
            menu.setCurrentSkin('No such skin');
            expect(menu.currentSkin.id).toBe('defaultSkin');
        });
    });

    describe('handleMenuSelection()', () => {
        it('chooses Firedog and marks it selected', () => {
            menu.setSelectedIndex(1);
            menu.selectedOption = 0;
            menu.handleMenuSelection();
            expect(menu.menuOptions[0]).toBe('Firedog - Selected');
        });

        it('chooses Hatboy Firedog', () => {
            menu.selectedOption = 1;
            menu.handleMenuSelection();
            expect(menu.menuOptions[1]).toBe('Hatboy Firedog - Selected');
        });

        it('chooses Cholo Firedog', () => {
            menu.selectedOption = 2;
            menu.handleMenuSelection();
            expect(menu.menuOptions[2]).toBe('Firedog the Cholo - Selected');
        });

        it('chooses Zabka Firedog', () => {
            menu.selectedOption = 3;
            menu.handleMenuSelection();
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

    describe('saving behavior (Skins via SelectMenu)', () => {
        beforeEach(() => {
            mockGame.saveGameState = mockGame.saveGameState || jest.fn();
            mockGame.saveGameState.mockClear();
        });

        it('saves once when changing to a different skin (Enter path)', () => {
            menu.selectedOption = 1;
            menu.handleMenuSelection();

            expect(menu.menuOptions).toEqual([
                'Firedog',
                'Hatboy Firedog - Selected',
                'Firedog the Cholo',
                'Zabka Firedog',
                'Go Back'
            ]);
            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
        });

        it('does NOT save when confirming the already-selected skin', () => {
            mockGame.saveGameState.mockClear();
            menu.selectedOption = 0;
            menu.handleMenuSelection();
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });

        it('does NOT save when choosing Go Back', () => {
            mockGame.saveGameState.mockClear();
            menu.selectedOption = 4;
            menu.handleMenuSelection();
            expect(mockGame.menu.main.activateMenu).toHaveBeenCalledWith(1);
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });

        it('mouse click funnels to same save semantics', () => {
            mockGame.saveGameState.mockClear();
            menu.selectedOption = 2;
            menu.handleMouseClick({ clientX: 0, clientY: 0 });
            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);

            mockGame.saveGameState.mockClear();
            menu.selectedOption = 2;
            menu.handleMouseClick({ clientX: 0, clientY: 0 });
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });
    });

});
