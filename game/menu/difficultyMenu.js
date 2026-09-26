import { DomMenu } from './dom/domMenu.js';
import {
    DEFAULT_LIVES_INDEX,
    DEFAULT_SPAWN_INDEX,
    LIVES_OPTIONS,
    SPAWN_MULTIPLIERS,
    SPAWN_OPTIONS,
    getConfiguredLivesFromIndex,
} from '../config/difficultySettings.js';

const FOOTER_BUTTONS = ['Reset to Defaults', 'Go Back'];

const RESET_ROW = 3;
const BACK_ROW = 4;
const ROW_COUNT = 5;

export class DifficultyMenu extends DomMenu {
    constructor(game) {
        super(game, [], 'Difficulty Settings');

        this.menuInGame = false;

        this.livesIndex = DEFAULT_LIVES_INDEX;
        this.powerUpIndex = DEFAULT_SPAWN_INDEX;
        this.powerDownIndex = DEFAULT_SPAWN_INDEX;

        this.focusedRow = 0;
        this._hoverRow = -1;
        this._hoverOptIdx = -1;
        this._hoverButton = -1;

        this._applySettings(false);
    }

    _getRows() {
        return [
            { label: 'Lives', options: LIVES_OPTIONS, index: this.livesIndex },
            { label: 'Power Up Rate', options: SPAWN_OPTIONS, index: this.powerUpIndex },
            { label: 'Power Down Rate', options: SPAWN_OPTIONS, index: this.powerDownIndex },
        ];
    }

    // settings
    _applySettings(triggerUISync = true) {
        this.game.player.lives = this.getConfiguredLives();
        this.game.powerUpSpawnMultiplier = SPAWN_MULTIPLIERS[SPAWN_OPTIONS[this.powerUpIndex]];
        this.game.powerDownSpawnMultiplier = SPAWN_MULTIPLIERS[SPAWN_OPTIONS[this.powerDownIndex]];

        if (this.game.player) {
            this.game.player.previousLives = this.game.player.lives;
        }

        if (triggerUISync) {
            this.game.UI?.syncLivesState?.();
        }
    }

    applyCurrentSettings(triggerUISync = true) {
        this._applySettings(triggerUISync);
    }

    getConfiguredLives() {
        return getConfiguredLivesFromIndex(this.livesIndex);
    }

    getState() {
        return {
            livesIndex: this.livesIndex,
            powerUpIndex: this.powerUpIndex,
            powerDownIndex: this.powerDownIndex,
        };
    }

    setState(state, triggerUISync = true) {
        this.livesIndex = state.livesIndex ?? DEFAULT_LIVES_INDEX;
        this.powerUpIndex = state.powerUpIndex ?? DEFAULT_SPAWN_INDEX;
        this.powerDownIndex = state.powerDownIndex ?? DEFAULT_SPAWN_INDEX;
        this._applySettings(triggerUISync);
    }

    _setRowOption(rowIdx, optIdx) {
        if (rowIdx === 0) this.livesIndex = optIdx;
        else if (rowIdx === 1) this.powerUpIndex = optIdx;
        else if (rowIdx === 2) this.powerDownIndex = optIdx;

        this._applySettings();
        this.game.saveGameState?.();
    }

    _changeRowOption(rowIdx, delta) {
        const { options, index } = this._getRows()[rowIdx];
        this._setRowOption(rowIdx, (index + delta + options.length) % options.length);
    }

    _onReset() {
        this.livesIndex = DEFAULT_LIVES_INDEX;
        this.powerUpIndex = DEFAULT_SPAWN_INDEX;
        this.powerDownIndex = DEFAULT_SPAWN_INDEX;

        this._applySettings();
        this.game.saveGameState?.();
        this.playSelect();
    }

    _onGoBack() {
        this.playSelect();
        this.game.goBackMenu();
    }

    // lifecycle
    activateMenu(arg = 0) {
        const { selectedOption = 0, inGame = false } = this.readActivation(arg);

        this.menuInGame = !!inGame;
        super.activateMenu(selectedOption);
        this.focusedRow = Math.max(0, Math.min(selectedOption, BACK_ROW));
    }

    getNavState() {
        return { selectedOption: this.focusedRow, inGame: this.menuInGame };
    }

    // dom
    buildBody(body) {
        const list = document.createElement('div');
        list.className = 'difficulty-rows';

        this.dom.settingRows = [];
        this.dom.segments = [];

        this._getRows().forEach((row, rowIdx) => {
            const rowEl = document.createElement('div');
            rowEl.className = 'difficulty-row';

            const label = document.createElement('span');
            label.className = 'difficulty-row__label';
            label.textContent = row.label;

            const group = document.createElement('div');
            group.className = 'segmented';

            const segments = row.options.map((opt, optIdx) => {
                const seg = document.createElement('span');
                seg.className = 'segment';
                seg.textContent = opt;
                seg.dataset.index = String(optIdx);
                this.bindHover(seg, () => this._hoverSegment(rowIdx, optIdx));
                group.appendChild(seg);
                return seg;
            });

            this.bindHover(label, () => this._hoverSegment(rowIdx, -1));

            rowEl.append(label, group);
            rowEl.dataset.index = String(rowIdx);
            list.appendChild(rowEl);

            this.dom.settingRows.push(rowEl);
            this.dom.segments.push(segments);
        });

        body.appendChild(list);
        this.dom.footerButtons = this.buildFooter(body, FOOTER_BUTTONS, (i) => this._hoverFooter(i));
    }

    _hoverSegment(rowIdx, optIdx) {
        const changed = this._hoverRow !== rowIdx || this._hoverOptIdx !== optIdx || this._hoverButton !== -1;
        this._hoverRow = rowIdx;
        this._hoverOptIdx = optIdx;
        this._hoverButton = -1;
        this.focusedRow = rowIdx;
        if (changed) this.playHover();
    }

    _hoverFooter(buttonIdx) {
        const changed = this._hoverButton !== buttonIdx || this._hoverRow !== -1;
        this._hoverRow = -1;
        this._hoverOptIdx = -1;
        this._hoverButton = buttonIdx;
        this.focusedRow = RESET_ROW + buttonIdx;
        if (changed) this.playHover();
    }

    syncContent() {
        this._getRows().forEach((row, rowIdx) => {
            this.dom.settingRows[rowIdx].classList.toggle('is-focused', this.focusedRow === rowIdx);

            this.dom.segments[rowIdx].forEach((seg, optIdx) => {
                seg.classList.toggle('is-selected', optIdx === row.index);
                seg.classList.toggle('is-hovered', this._hoverRow === rowIdx && this._hoverOptIdx === optIdx);
            });
        });

        this.dom.footerButtons.forEach((btn, i) => {
            btn.classList.toggle('is-focused', this.focusedRow === RESET_ROW + i);
        });
    }

    // input
    handleKeyDown(event) {
        if (!this._canInteract()) return;

        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown': {
                event.preventDefault();
                const delta = event.key === 'ArrowUp' ? -1 : 1;
                this.focusedRow = (this.focusedRow + delta + ROW_COUNT) % ROW_COUNT;
                this.playHover();
                break;
            }

            case 'ArrowLeft':
            case 'ArrowRight':
                if (this.focusedRow >= RESET_ROW) break;
                event.preventDefault();
                this._changeRowOption(this.focusedRow, event.key === 'ArrowLeft' ? -1 : 1);
                this.playHover();
                break;

            case 'Enter':
                event.preventDefault();
                event.stopImmediatePropagation();

                if (this.focusedRow === RESET_ROW) this._onReset();
                else if (this.focusedRow === BACK_ROW) this._onGoBack();
                else this.playSelect();
                break;
        }
    }

    handleMouseClick(event) {
        if (!this._canInteract()) return;
        event.preventDefault();
        event.stopImmediatePropagation();

        const row = this.hit(event, '.difficulty-row');
        const segment = this.hit(event, '.segment');

        if (row && segment) {
            this.focusedRow = Number(row.dataset.index);
            this._setRowOption(this.focusedRow, Number(segment.dataset.index));
            this.playSelect();
            return;
        }

        const button = this.hit(event, '.menu-options--footer .menu-option');
        if (button) this.focusedRow = RESET_ROW + this.dom.footerButtons.indexOf(button);

        if (this.focusedRow === RESET_ROW) this._onReset();
        else if (this.focusedRow === BACK_ROW) this._onGoBack();
        else {
            this._applySettings();
            this.playSelect();
            this.game.saveGameState?.();
        }
    }

    handleMouseWheel(event) {
        if (!this._canInteract()) return;
        this.focusedRow = (this.focusedRow + Math.sign(event.deltaY) + ROW_COUNT) % ROW_COUNT;
        this.playHover();
    }
}
