export class MenuNavigator {
    constructor(game) {
        this.game = game;

        this.stack = [];

        this.root = null;

        this.transient = null;
    }

    setRoot(menu, arg = 0) {
        if (!menu) {
            this.clear();
            return;
        }

        this.root = menu;
        this.stack = [];
        this.transient = null;

        this._activate(menu, arg, { pushCurrent: false });
    }

    resetToRoot(arg = 0) {
        if (!this.root) return;

        this.stack = [];
        this.transient = null;

        this._activate(this.root, arg, { pushCurrent: false });
    }

    open(menu, arg = 0) {
        if (!menu) return;

        if (this.isTransientOpen()) this.closeTransient();

        this._activate(menu, arg, { pushCurrent: true });
    }

    openTransient(menu, arg = 0) {
        if (!menu) return;

        const current = this.game.currentMenu;
        if (!current) return;

        if (this.transient && this.transient.menu === menu && current === menu) return;

        if (this.isTransientOpen()) this.closeTransient();

        this.transient = {
            menu,
            returnMenu: current,
            returnArg: 0,
        };

        this._activate(menu, arg, { pushCurrent: false });
    }

    closeTransient() {
        if (!this.isTransientOpen()) return;

        const { returnMenu, returnArg } = this.transient;
        this.transient = null;

        if (!returnMenu) return;
        this._activate(returnMenu, returnArg ?? 0, { pushCurrent: false });
    }

    isTransientOpen() {
        return !!this.transient && this.game.currentMenu === this.transient.menu;
    }

    back() {
        if (this.isTransientOpen()) {
            this.closeTransient();
            return;
        }

        const current = this.game.currentMenu;
        if (!current) return;

        if (current === this.root || this.stack.length === 0) return;

        const prev = this.stack.pop();

        if (!prev) return;

        this._activate(prev.menu, 0, { pushCurrent: false, restoreState: prev.state });
    }

    clear() {
        this.stack = [];
        this.root = null;
        this.transient = null;
    }

    _activate(menu, arg, { pushCurrent, restoreState = null }) {
        if (!menu) return;

        const current = this.game.currentMenu;

        if (pushCurrent && current && current !== menu) {
            this.stack.push({ menu: current, state: current.getNavState() });
        }

        if (restoreState) {
            menu.activateFromNav(restoreState);
            return;
        }

        menu.activateMenu(arg);
    }
}