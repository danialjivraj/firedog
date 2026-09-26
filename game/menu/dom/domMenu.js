import { BaseMenu } from '../baseMenu.js';
import { getMenuLayer } from './menuLayer.js';

const WARNING_BADGE_SVG = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path class="menu-badge__tri" d="M12 3.8 2.6 20.4h18.8L12 3.8z"/>
  <path class="menu-badge__mark" d="M11.15 9.6h1.7v5.6h-1.7z"/>
  <circle class="menu-badge__mark" cx="12" cy="17.8" r="1.05"/>
</svg>`;

const CORNERS = ['tl', 'tr', 'bl', 'br'];

export class DomMenu extends BaseMenu {
    constructor(game, menuOptions, title) {
        super(game, menuOptions, title);

        this.layer = getMenuLayer();
        this.panel = null;
        this.dom = null;
        this._optionsSignature = null;
        this._renderedTitle = null;
    }

    getPanelTitle() {
        return this.title;
    }

    hit(event, selector) {
        return event?.target?.closest?.(selector) ?? null;
    }

    readActivation(arg) {
        const opts = (arg && typeof arg === 'object') ? arg : { selectedOption: arg };
        const index = Math.floor(Number(opts.selectedOption));
        return { ...opts, selectedOption: Number.isFinite(index) ? index : undefined };
    }

    // building
    createTitle(text = '', modifier = '') {
        const title = document.createElement('h2');
        title.className = modifier ? `menu-title ${modifier}` : 'menu-title';

        const span = document.createElement('span');
        span.className = 'menu-title__text';
        span.textContent = text ?? '';
        title.appendChild(span);

        return title;
    }

    setTitleText(text) {
        const span = this.dom?.title?.querySelector('.menu-title__text');
        if (span) span.textContent = text ?? '';
    }

    addCorners(host) {
        for (const corner of CORNERS) {
            const bracket = document.createElement('span');
            bracket.className = `menu-card__corner menu-card__corner--${corner}`;
            host.appendChild(bracket);
        }
        return host;
    }

    buildFrame(modifier) {
        const frame = document.createElement('div');
        frame.className = modifier ? `menu-frame ${modifier}` : 'menu-frame';
        return this.addCorners(frame);
    }

    ensurePanel() {
        if (this.panel) return this.panel;
        if (typeof document === 'undefined') return null;

        const panel = document.createElement('div');
        panel.className = 'menu-panel';
        if (this.panelModifier) panel.classList.add(...this.panelModifier.split(' '));

        const body = document.createElement('div');
        body.className = 'menu-body';

        let card = null;
        let title = null;

        if (this.absoluteLayout) {
            panel.classList.add('menu-panel--absolute');
            body.classList.add('menu-body--absolute');
            panel.appendChild(body);
        } else {
            card = document.createElement('div');
            card.className = this.cardModifier ? `menu-card ${this.cardModifier}` : 'menu-card';
            this.addCorners(card);

            title = this.createTitle();
            card.append(title, body);
            panel.appendChild(card);
        }

        this.panel = panel;
        this.dom = { card, title, body, options: null, marker: null, rows: [] };

        this.buildBody(body);
        this.layer.register(this, panel);

        return panel;
    }

    buildBody(body) {
        this.buildOptionList(body);
    }

    buildOptionList(host) {
        const options = document.createElement('div');
        options.className = 'menu-options';

        const marker = document.createElement('span');
        marker.className = 'menu-marker';
        options.appendChild(marker);

        host.appendChild(options);

        this.dom.options = options;
        this.dom.marker = marker;
        this.dom.rows = [];
    }

    buildOption(label, onFocus, modifier = '') {
        const row = document.createElement('div');
        row.className = modifier ? `menu-option ${modifier}` : 'menu-option';

        const text = document.createElement('span');
        text.className = 'menu-option__label';
        text.textContent = label;

        const badge = document.createElement('span');
        badge.className = 'menu-option__badge';
        badge.hidden = true;
        badge.innerHTML = WARNING_BADGE_SVG;
        text.appendChild(badge);

        row.appendChild(text);
        if (onFocus) this.bindHover(row, onFocus);

        return row;
    }

    buildFooter(host, labels, onFocus) {
        const footer = document.createElement('div');
        footer.className = 'menu-options menu-options--footer';

        const buttons = labels.map((label, i) => {
            const button = this.buildOption(label, () => onFocus(i));
            footer.appendChild(button);
            return button;
        });

        host.appendChild(footer);
        return buttons;
    }

    getOptionLabel(index) {
        return this.menuOptions[index];
    }

    getOptionModifier() {
        return '';
    }

    getOptionBadge() {
        return false;
    }

    bindHover(element, handler) {
        const guarded = () => {
            if (this._canInteract() && this.layer.canHover()) handler();
        };
        element.addEventListener('pointerenter', guarded);
        element.addEventListener('pointermove', guarded);
    }

    focusOption(index) {
        if (index === this.selectedOption) return;
        this.selectedOption = index;
        this.playHover();
    }

    // syncing
    syncPanel() {
        if (!this.dom) return;

        const heading = this.getPanelTitle();
        if (heading !== this._renderedTitle) {
            this._renderedTitle = heading;
            this.setTitleText(heading);
            if (this.dom.title) this.dom.title.hidden = !heading;
        }

        this.panel.classList.toggle('is-ingame', !!this.menuInGame);
        this.syncContent();
    }

    syncContent() {
        this.syncOptionRows();
        this.syncSelection();
    }

    syncOptionRows() {
        const { options, rows } = this.dom;
        if (!options) return;

        const labels = this.menuOptions.map((_, index) => this.getOptionLabel(index));
        const signature = labels.join(' ');

        if (signature !== this._optionsSignature) {
            this._optionsSignature = signature;

            for (const row of rows) row.remove();
            this.dom.rows = labels.map((label, index) => {
                const row = this.buildOption(label, () => this.focusOption(index), this.getOptionModifier(index));
                row.dataset.index = String(index);
                options.appendChild(row);
                return row;
            });
        }

        for (const [index, row] of this.dom.rows.entries()) {
            row.querySelector('.menu-option__badge').hidden = !this.getOptionBadge(index);
        }
    }

    syncSelection() {
        const rows = this.dom.rows;
        if (!rows?.length) return;

        rows.forEach((row, index) => {
            row.classList.toggle('is-focused', index === this.selectedOption);
        });

        const focused = rows[this.selectedOption];
        const marker = this.dom.marker;
        if (!focused || !marker) return;

        marker.style.transform = `translateY(${focused.offsetTop}px)`;
        marker.style.height = `${focused.offsetHeight}px`;
        marker.classList.add('is-visible');
    }

    // lifecycle
    activateMenu(arg = 0) {
        super.activateMenu(this.readActivation(arg).selectedOption ?? 0);
        this.ensurePanel();
    }

    getNavState() {
        return { selectedOption: this.selectedOption ?? 0, inGame: this.menuInGame };
    }

    activateFromNav(state = {}) {
        this.activateMenu(state);
    }

    draw(context) {
        if (!this.menuActive) return;

        super.draw(context);

        this.ensurePanel();
        this.syncPanel();
    }
}
