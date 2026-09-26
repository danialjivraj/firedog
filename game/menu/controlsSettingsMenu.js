import { ScrollableMenu } from './scrollableMenu.js';
import { getDefaultKeyBindings, normalizeKey, keyLabel } from '../config/keyBindings.js';

const ACTION_NAMES = {
    jump: 'Jump',
    moveBackward: 'Move Backward',
    sit: 'Sit',
    moveForward: 'Move Forward',
    rollAttack: 'Roll Attack',
    diveAttack: 'Dive Attack',
    fireballAttack: 'Fireball Attack',
    invisibleDefense: 'Invisible Defense',
    dashAttack: 'Dash Attack',
};

const FOOTER_BUTTONS = ['Reset to Defaults', 'Go Back'];

const ROW_H = 46;
const MAX_VISIBLE_ROWS = 7;

export class ControlsSettingsMenu extends ScrollableMenu {
    constructor(game) {
        super(game, [...Object.keys(ACTION_NAMES), ...FOOTER_BUTTONS], 'Controls Settings');
        this.cardModifier = 'menu-card--wide menu-card--controls';
        this.menuInGame = false;

        this.waitingForKey = false;
        this.waitingAction = null;

        this.game.keyBindings ??= getDefaultKeyBindings();

        this.onGlobalKeyDown = this.onGlobalKeyDown.bind(this);
        document.addEventListener('keydown', this.onGlobalKeyDown, true);
    }

    get keybindCount() {
        return this.menuOptions.length - FOOTER_BUTTONS.length;
    }

    get listHeight() {
        return Math.min(this.keybindCount, MAX_VISIBLE_ROWS) * ROW_H;
    }

    closeMenu() {
        super.closeMenu();
        this.waitingForKey = false;
        this.waitingAction = null;
    }

    destroy() {
        document.removeEventListener('keydown', this.onGlobalKeyDown, true);
    }

    unboundCount() {
        return this.menuOptions
            .slice(0, this.keybindCount)
            .filter((action) => !this.game.keyBindings[action]).length;
    }

    // dom

    buildBody(body) {
        const warning = document.createElement('div');
        warning.className = 'controls-warning';

        body.append(warning, this.buildScrollArea('controls'));

        this.dom.keyRows = this.menuOptions.slice(0, this.keybindCount).map((action, index) => {
            const row = document.createElement('div');
            row.className = 'controls-row';

            const label = document.createElement('span');
            label.className = 'controls-row__label';
            label.textContent = ACTION_NAMES[action] ?? action;

            const key = document.createElement('span');
            key.className = 'controls-row__key';

            row.append(label, key);
            this.bindHover(row, () => this.setSelected(index));
            this.dom.track.appendChild(row);

            return { row, key };
        });

        this.dom.footer = this.buildFooter(body, FOOTER_BUTTONS, (i) => this.setSelected(this.keybindCount + i));

        this.dom.warning = warning;
        this.panel.appendChild(this._buildRebindOverlay());
    }

    _buildRebindOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'controls-rebind';
        overlay.hidden = true;

        const prompt = document.createElement('div');
        prompt.className = 'controls-rebind__prompt';

        const hint = document.createElement('div');
        hint.className = 'controls-rebind__hint';
        hint.textContent = '(Esc to cancel)';

        const note = document.createElement('div');
        note.className = 'controls-rebind__note';

        overlay.append(prompt, hint, note);

        this.dom.rebind = overlay;
        this.dom.rebindPrompt = prompt;
        this.dom.rebindNote = note;

        return overlay;
    }

    syncContent() {
        const missing = this.unboundCount();
        this.dom.warning.dataset.text = missing === 1
            ? 'Warning: 1 keybind is unbound'
            : `Warning: ${missing} keybindings are unbound`;
        this.dom.warning.hidden = missing === 0;

        this.dom.keyRows.forEach(({ row, key }, i) => {
            const bound = this.game.keyBindings[this.menuOptions[i]];
            key.textContent = keyLabel(bound);
            row.classList.toggle('is-focused', i === this.selectedOption);
            row.classList.toggle('is-unbound', !bound);
        });

        this.dom.footer.forEach((button, i) => {
            button.classList.toggle('is-focused', this.selectedOption === this.keybindCount + i);
        });

        this.syncScroll(this.listHeight, this.keybindCount * ROW_H);

        this.dom.rebind.hidden = !this.waitingForKey;
        if (this.waitingForKey) {
            this.dom.rebindPrompt.textContent = `Press a key for "${ACTION_NAMES[this.waitingAction]}"`;
            const isSit = this.waitingAction === 'sit';
            this.dom.rebindNote.hidden = !isSit;
            this.dom.rebindNote.textContent = isSit
                ? 'Note: Dive Attack will also be set to this key. You can change Dive Attack separately later.'
                : '';
        }
    }

    // behaviour

    update(deltaTime) {
        super.update(deltaTime);
        this.tickScroll(deltaTime);
    }

    activateMenu(arg = 0) {
        const { selectedOption = 0, inGame = false } = this.readActivation(arg);

        this.menuInGame = !!inGame;
        this.scrollY = 0;
        this.targetScrollY = 0;

        super.activateMenu(selectedOption);
        this.scrollSelectedIntoView();
    }

    setSelected(index) {
        if (index === this.selectedOption) return;
        this.selectedOption = index;
        this.playHover();
        this.scrollSelectedIntoView();
    }

    scrollSelectedIntoView() {
        if (this.selectedOption >= this.keybindCount) return;
        this.scrollIntoView(this.selectedOption * ROW_H, ROW_H, this.listHeight);
    }

    handleNavigation(delta) {
        super.handleNavigation(delta);
        this.scrollSelectedIntoView();
    }

    handleKeyDown(event) {
        if (this.waitingForKey) {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                this.waitingForKey = false;
                this.waitingAction = null;
            }
            return;
        }

        if (!this._canInteract()) return;

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            this.handleNavigation(event.key === 'ArrowUp' ? -1 : 1);
            this.playHover();
        } else if (event.key === 'Enter') {
            this.handleMenuSelection();
        }
    }

    handleMouseClick(event) {
        if (this.consumeBarClick(event)) return;
        if (this.waitingForKey || !this._canInteract()) return;
        this.handleMenuSelection();
    }

    handleMenuSelection() {
        const option = this.menuOptions[this.selectedOption];

        if (option === 'Go Back') {
            super.handleMenuSelection();
            this.game.goBackMenu();
            return;
        }

        if (option === 'Reset to Defaults') {
            super.handleMenuSelection();
            this.game.keyBindings = getDefaultKeyBindings();
            this.game.saveGameState();
            return;
        }

        this.waitingForKey = true;
        this.waitingAction = option;
        this.playSelect();
    }

    onGlobalKeyDown(event) {
        if (!this.menuActive || !this.waitingForKey) return;

        event.preventDefault();
        event.stopPropagation();

        const key = normalizeKey(event.key);

        if (key === 'Escape') {
            this.waitingForKey = false;
            this.waitingAction = null;
            return;
        }

        for (const action in this.game.keyBindings) {
            const sharesWithSit =
                (this.waitingAction === 'sit' && action === 'diveAttack') ||
                (this.waitingAction === 'diveAttack' && action === 'sit');

            if (!sharesWithSit && this.game.keyBindings[action] === key) {
                this.game.keyBindings[action] = null;
            }
        }

        this.game.keyBindings[this.waitingAction] = key;
        if (this.waitingAction === 'sit') this.game.keyBindings.diveAttack = key;

        this.waitingForKey = false;
        this.waitingAction = null;
        this.game.saveGameState();
    }
}
