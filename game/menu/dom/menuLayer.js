import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../config/constants.js';

const HOVER_UNLOCK_PX = 6;

const NAV_KEYS = new Set([
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'Tab', 'Enter', 'Escape', 'PageUp', 'PageDown', 'Home', 'End',
]);

export class MenuLayer {
    constructor() {
        this.root = null;
        this.stage = null;
        this.panels = new Map();
        this.activeMenu = null;

        this.pointer = { x: -1, y: -1 };
        this.anchor = { x: -1, y: -1 };
        this.hoverLocked = false;

        this.fadeOpacity = null;
    }

    ensureRoot() {
        if (this.root || typeof document === 'undefined' || !document.body) return this.root;

        const root = document.createElement('div');
        root.id = 'menu-layer';

        const stage = document.createElement('div');
        stage.className = 'menu-stage';
        stage.style.width = `${CANVAS_WIDTH}px`;
        stage.style.height = `${CANVAS_HEIGHT}px`;

        root.appendChild(stage);
        document.body.appendChild(root);

        this.root = root;
        this.stage = stage;

        this._bindListeners();
        this._observeResize();
        this.updateScale();

        return root;
    }

    _bindListeners() {
        document.addEventListener('pointermove', (event) => {
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;

            if (!this.hoverLocked) return;

            const dx = event.clientX - this.anchor.x;
            const dy = event.clientY - this.anchor.y;
            if (Math.hypot(dx, dy) > HOVER_UNLOCK_PX) this.hoverLocked = false;
        }, true);

        document.addEventListener('keydown', (event) => {
            if (NAV_KEYS.has(event.key)) this.lockHover();
        }, true);
    }

    _observeResize() {
        if (typeof ResizeObserver === 'undefined') {
            if (typeof window !== 'undefined') {
                window.addEventListener('resize', () => this.updateScale());
            }
            return;
        }
        new ResizeObserver(() => this.updateScale()).observe(this.root);
    }

    updateScale() {
        const width = this.root?.clientWidth || 0;
        if (!width) return;
        this.root.style.setProperty('--menu-scale', String(width / CANVAS_WIDTH));
    }

    lockHover() {
        this.hoverLocked = true;
        this.anchor.x = this.pointer.x;
        this.anchor.y = this.pointer.y;
    }

    canHover() {
        return !this.hoverLocked;
    }

    register(menu, panel) {
        if (!menu || !panel) return;
        this.ensureRoot();
        if (!this.stage) return;

        panel.hidden = true;
        this.stage.appendChild(panel);
        this.panels.set(menu, panel);
    }

    has(menu) {
        return this.panels.has(menu);
    }

    setActive(menu) {
        if (this.activeMenu === menu) return;

        const previous = this.panels.get(this.activeMenu);
        if (previous) {
            previous.hidden = true;
            previous.classList.remove('is-entering');
        }

        this.activeMenu = menu;

        const next = this.panels.get(menu);
        if (next) {
            next.hidden = false;
            next.classList.remove('is-entering');
            void next.offsetWidth;
            next.classList.add('is-entering');
        }
    }

    sync(game) {
        if (!game) return;
        this.setActive(this.panels.has(game.currentMenu) ? game.currentMenu : null);
        this.syncFade(game.canvas);
    }

    syncFade(canvas) {
        if (!this.root) return;

        const opacity = canvas?.style?.opacity ?? '';
        if (opacity === this.fadeOpacity) return;

        this.fadeOpacity = opacity;
        this.root.style.opacity = opacity;
    }
}

let sharedLayer = null;

export function getMenuLayer() {
    if (!sharedLayer) sharedLayer = new MenuLayer();
    return sharedLayer;
}

export function resetMenuLayer() {
    sharedLayer?.root?.parentNode?.removeChild(sharedLayer.root);
    sharedLayer = null;
}
