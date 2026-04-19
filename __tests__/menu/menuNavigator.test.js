import { MenuNavigator } from '../../game/menu/menuNavigator.js';

const makeMenu = (name) => ({
    name,
    activateMenu: jest.fn(),
    activateFromNav: jest.fn(),
    getNavState: jest.fn(() => ({ savedOption: 0 })),
});

describe('MenuNavigator', () => {
    let game, nav;

    beforeEach(() => {
        game = { currentMenu: null };
        nav = new MenuNavigator(game);
    });

    describe('setRoot', () => {
        test('activates the given menu as root', () => {
            const menu = makeMenu('main');
            nav.setRoot(menu);

            expect(nav.root).toBe(menu);
            expect(menu.activateMenu).toHaveBeenCalledWith(0);
        });

        test('clears stack and transient when setting root', () => {
            const menuA = makeMenu('A');
            const menuB = makeMenu('B');
            nav.setRoot(menuA);
            game.currentMenu = menuA;
            nav.open(menuB);
            game.currentMenu = menuB;

            nav.setRoot(menuA);
            expect(nav.stack).toHaveLength(0);
            expect(nav.transient).toBeNull();
        });

        test('passing null clears everything', () => {
            nav.setRoot(makeMenu('main'));
            nav.setRoot(null);

            expect(nav.root).toBeNull();
            expect(nav.stack).toHaveLength(0);
        });
    });

    describe('resetToRoot', () => {
        test('re-activates root and clears stack', () => {
            const root = makeMenu('root');
            const sub = makeMenu('sub');

            nav.setRoot(root);
            game.currentMenu = root;
            nav.open(sub);
            game.currentMenu = sub;

            nav.resetToRoot();

            expect(root.activateMenu).toHaveBeenCalledTimes(2);
            expect(nav.stack).toHaveLength(0);
        });

        test('does nothing when root is null', () => {
            nav.resetToRoot();
            expect(game.currentMenu).toBeNull();
        });
    });

    describe('open', () => {
        test('pushes current menu onto stack and activates new menu', () => {
            const root = makeMenu('root');
            const sub = makeMenu('sub');

            nav.setRoot(root);
            game.currentMenu = root;

            nav.open(sub);

            expect(nav.stack).toHaveLength(1);
            expect(nav.stack[0].menu).toBe(root);
            expect(sub.activateMenu).toHaveBeenCalledWith(0);
        });

        test('does nothing for null menu', () => {
            nav.open(null);
            expect(nav.stack).toHaveLength(0);
        });

        test('closes transient before opening', () => {
            const root = makeMenu('root');
            const transient = makeMenu('transient');
            const next = makeMenu('next');

            nav.setRoot(root);
            game.currentMenu = root;

            nav.openTransient(transient);
            game.currentMenu = transient;

            nav.open(next);

            expect(nav.transient).toBeNull();
        });
    });

    describe('back', () => {
        test('pops last menu from stack and restores its state', () => {
            const root = makeMenu('root');
            const sub = makeMenu('sub');

            nav.setRoot(root);
            game.currentMenu = root;
            nav.open(sub);
            game.currentMenu = sub;

            nav.back();

            expect(root.activateFromNav).toHaveBeenCalled();
            expect(nav.stack).toHaveLength(0);
        });

        test('does nothing when at root', () => {
            const root = makeMenu('root');
            nav.setRoot(root);
            game.currentMenu = root;

            root.activateMenu.mockClear();
            nav.back();

            expect(root.activateMenu).not.toHaveBeenCalled();
        });

        test('closes transient first on back if transient is open', () => {
            const root = makeMenu('root');
            const transient = makeMenu('transient');

            nav.setRoot(root);
            game.currentMenu = root;
            nav.openTransient(transient);
            game.currentMenu = transient;

            nav.back();

            expect(nav.transient).toBeNull();
            expect(root.activateMenu).toHaveBeenCalled();
        });
    });

    describe('transient menus', () => {
        test('openTransient sets transient and activates menu', () => {
            const root = makeMenu('root');
            const lore = makeMenu('lore');

            nav.setRoot(root);
            game.currentMenu = root;

            nav.openTransient(lore);

            expect(nav.transient).not.toBeNull();
            expect(nav.transient.menu).toBe(lore);
            expect(nav.transient.returnMenu).toBe(root);
            expect(lore.activateMenu).toHaveBeenCalledWith(0);
        });

        test('closeTransient returns to the menu that was active before', () => {
            const root = makeMenu('root');
            const lore = makeMenu('lore');

            nav.setRoot(root);
            game.currentMenu = root;
            nav.openTransient(lore);
            game.currentMenu = lore;

            nav.closeTransient();

            expect(nav.transient).toBeNull();
            expect(root.activateMenu).toHaveBeenCalled();
        });

        test('isTransientOpen returns true only when transient menu is active', () => {
            const root = makeMenu('root');
            const lore = makeMenu('lore');

            nav.setRoot(root);
            game.currentMenu = root;

            expect(nav.isTransientOpen()).toBe(false);

            nav.openTransient(lore);
            game.currentMenu = lore;

            expect(nav.isTransientOpen()).toBe(true);
        });

        test('openTransient does nothing with null menu', () => {
            const root = makeMenu('root');
            nav.setRoot(root);
            game.currentMenu = root;

            nav.openTransient(null);
            expect(nav.transient).toBeNull();
        });

        test('openTransient requires a current menu', () => {
            const lore = makeMenu('lore');
            nav.openTransient(lore);
            expect(nav.transient).toBeNull();
        });
    });

    describe('clear', () => {
        test('resets all navigator state', () => {
            const root = makeMenu('root');
            nav.setRoot(root);
            game.currentMenu = root;
            nav.open(makeMenu('sub'));

            nav.clear();

            expect(nav.root).toBeNull();
            expect(nav.stack).toHaveLength(0);
            expect(nav.transient).toBeNull();
        });
    });
});
