import { DomMenu } from './dom/domMenu.js';
import { SCROLLBAR_MIN_THUMB } from './dom/menuTheme.js';
import { normalizeDelta } from '../config/constants.js';

const WHEEL_STEP = 80;

export class ScrollableMenu extends DomMenu {
    constructor(game, menuOptions, title) {
        super(game, menuOptions, title);

        this.scrollY = 0;
        this.targetScrollY = 0;
        this.scrollMax = 0;
        this.scrollEase = 0.18;

        this.draggingBar = false;
        this.barClickPending = false;
        this.pointerOverList = false;
        this.barRect = null;

        document.addEventListener('pointermove', (event) => this._dragBar(event));
        document.addEventListener('pointerup', () => { this.draggingBar = false; });
    }

    closeMenu() {
        super.closeMenu();
        this.draggingBar = false;
        this.barClickPending = false;
    }

    tickScroll(deltaTime) {
        this.targetScrollY = this.clampScroll(this.targetScrollY);
        const k = 1 - Math.pow(1 - this.scrollEase, normalizeDelta(deltaTime));
        this.scrollY += (this.targetScrollY - this.scrollY) * k;
    }

    clampScroll(value) {
        return Math.max(0, Math.min(value, this.scrollMax));
    }

    scrollIntoView(itemTop, itemHeight, viewportH) {
        if (itemTop < this.targetScrollY) {
            this.targetScrollY = itemTop;
        } else if (itemTop + itemHeight > this.targetScrollY + viewportH) {
            this.targetScrollY = itemTop + itemHeight - viewportH;
        }
        this.targetScrollY = this.clampScroll(this.targetScrollY);
    }

    ratioIn(element, clientY) {
        const { top, height } = element.getBoundingClientRect();
        return height ? Math.max(0, Math.min(1, (clientY - top) / height)) : 0;
    }

    buildScrollArea(modifier) {
        const scroll = document.createElement('div');
        scroll.className = `menu-scroll ${modifier}-scroll`;

        const viewport = document.createElement('div');
        viewport.className = `menu-scroll__viewport ${modifier}-viewport`;
        viewport.addEventListener('pointerenter', () => { this.pointerOverList = true; });
        viewport.addEventListener('pointerleave', () => { this.pointerOverList = false; });

        const track = document.createElement('div');
        track.className = 'menu-scroll__track';
        viewport.appendChild(track);

        const bar = document.createElement('div');
        bar.className = 'menu-scroll__bar';
        bar.addEventListener('pointerdown', (event) => this._grabBar(event));

        const thumb = document.createElement('div');
        thumb.className = 'menu-scroll__thumb';
        bar.appendChild(thumb);

        scroll.append(viewport, bar);
        Object.assign(this.dom, { scroll, viewport, track, bar, thumb });

        return scroll;
    }

    consumeBarClick(event) {
        if (this.barClickPending) {
            this.barClickPending = false;
            return true;
        }
        return !!this.hit(event, '.menu-scroll__bar');
    }

    _grabBar(event) {
        if (!this._canInteract() || !this.barRect) return;

        this.barClickPending = true;
        const y = this.ratioIn(this.dom.bar, event.clientY) * this.barRect.h;
        const { thumbY, thumbH } = this.barRect;

        if (y >= thumbY && y <= thumbY + thumbH) this.draggingBar = true;
        else this.targetScrollY = this.clampScroll(this._scrollForThumbCenter(y));
    }

    _scrollForThumbCenter(y) {
        const { h, thumbH } = this.barRect;
        const travel = h - thumbH;
        return travel > 1 ? ((y - thumbH / 2) / travel) * this.scrollMax : this.targetScrollY;
    }

    _dragBar(event) {
        if (!this.draggingBar || !this.barRect) return;
        const y = this.ratioIn(this.dom.bar, event.clientY) * this.barRect.h;
        this.targetScrollY = this.clampScroll(this._scrollForThumbCenter(y));
    }

    syncScroll(viewportH, contentH) {
        this.scrollMax = Math.max(0, contentH - viewportH);
        this.dom.track.style.transform = `translateY(${-this.scrollY}px)`;

        if (this.scrollMax <= 0.5) {
            this.dom.bar.hidden = true;
            this.barRect = null;
            return;
        }

        const thumbH = Math.max(SCROLLBAR_MIN_THUMB, (viewportH / contentH) * viewportH);
        const thumbY = (viewportH - thumbH) * (this.scrollY / this.scrollMax);

        this.dom.bar.hidden = false;
        this.dom.thumb.style.height = `${thumbH}px`;
        this.dom.thumb.style.transform = `translateY(${thumbY}px)`;

        this.barRect = { h: viewportH, thumbY, thumbH };
    }

    handleMouseWheel(event) {
        if (!this._canInteract()) return;

        if (this.pointerOverList && this.scrollMax > 0) {
            this.targetScrollY = this.clampScroll(this.targetScrollY + Math.sign(event.deltaY) * WHEEL_STEP);
            return;
        }

        this.handleNavigation(Math.sign(event.deltaY));
        this.playHover();
    }
}
