import { BaseMenu } from './baseMenu.js';
import { normalizeDelta } from '../config/constants.js';

export class ScrollableMenu extends BaseMenu {
    constructor(game, menuOptions, title) {
        super(game, menuOptions, title);

        this.scrollY = 0;
        this.targetScrollY = 0;
        this.scrollMax = 0;
        this.scrollEase = 0.18;

        this.barWidth = 8;
        this.barTrackAlpha = 0.2;

        this.draggingBar = false;
        this.dragStartMouseY = 0;
        this.dragStartScrollY = 0;
        this.barRect = null;
    }

    closeMenu() {
        super.closeMenu();
        this.draggingBar = false;
    }

    tickScroll(deltaTime) {
        this.targetScrollY = Math.max(0, Math.min(this.targetScrollY, this.scrollMax));
        const dt = normalizeDelta(deltaTime);
        const k = 1 - Math.pow(1 - this.scrollEase, dt);
        this.scrollY += (this.targetScrollY - this.scrollY) * k;
    }

    updateScrollFromThumb(mouseY) {
        if (!this.barRect) return;
        const { y, h, thumbH } = this.barRect;
        const travel = h - thumbH;
        if (travel <= 1) return;
        let t = (mouseY - y - thumbH / 2) / travel;
        t = Math.max(0, Math.min(1, t));
        this.targetScrollY = t * this.scrollMax;
    }
}
