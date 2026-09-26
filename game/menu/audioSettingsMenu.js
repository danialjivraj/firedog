import { DomMenu } from './dom/domMenu.js';

const HEADER_INDEX = -1;

const RESET_ICON_SVG = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/>
</svg>`;

const SPEAKER_ICON_SVG = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path class="speaker-body" d="M4 9v6h4l5 4V5L8 9H4z"/>
  <g class="speaker-waves">
    <path d="M16.5 8.5a5 5 0 0 1 0 7"/>
    <path d="M19 6a8.5 8.5 0 0 1 0 12"/>
  </g>
  <g class="speaker-cross">
    <path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>
  </g>
</svg>`;

export class AudioSettingsMenu extends DomMenu {
    constructor(game) {
        super(game, ['Go Back'], 'Audio Settings');
        this.panelModifier = 'menu-panel--audio';
        this.cardModifier = 'menu-card--wide menu-card--audio';

        this.tabs = ['MENU', 'CUTSCENE', 'INGAME'];
        this.activeTab = 'MENU';
        this.headerSelectionIndex = HEADER_INDEX;
        this.hoveredHeaderAction = null;

        this.draggingSlider = false;
        this.draggingSliderActive = false;
        this.draggingSliderIndex = -1;
        this.dragOffsetX = 0;

        this.tabData = {
            MENU: {
                options: [
                    'Menu Master Volume',
                    'Menu Music',
                    'Map SFX',
                    'Wardrobe SFX',
                    'Menu Navigation SFX',
                    'Go Back',
                ],
                volumeLevels: [50, 50, 50, 50, 50, null],
                muted: [false, false, false, false, false, null],
                audioMap: null,
            },
            CUTSCENE: {
                options: [
                    'Cutscene Master Volume',
                    'Cutscene Music',
                    'Cutscene Dialogue SFX',
                    'Cutscene Action SFX',
                    'Go Back',
                ],
                volumeLevels: [50, 50, 50, 50, null],
                muted: [false, false, false, false, null],
                audioMap: null,
            },
            INGAME: {
                options: [
                    'In-Game Master Volume',
                    'Map Music',
                    'Firedog SFX',
                    'Enemy SFX',
                    'Collision SFX',
                    'Power Up/Down SFX',
                    'Go Back',
                ],
                volumeLevels: [50, 50, 50, 50, 50, 50, null],
                muted: [false, false, false, false, false, false, null],
                audioMap: null,
            },
        };

        this.volumeLevels = [];
        this.muted = [];
        this.audioMap = {};

        this._buildAudioMaps();
        this.setTab('MENU');

        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseDrag = this.handleMouseDrag.bind(this);
        document.addEventListener('pointerup', this.handleMouseUp);
        document.addEventListener('pointermove', this.handleMouseDrag);
    }

    _getActiveTabData() {
        return this.tabData[this.activeTab];
    }

    _clampPct(n) {
        return Math.max(0, Math.min(100, n));
    }

    _isSlider(i) {
        return this.volumeLevels[i] !== null;
    }

    _displayTabLabel(tabKey) {
        return tabKey === 'INGAME' ? 'IN-GAME' : tabKey;
    }

    // lifecycle
    getNavState() {
        return { ...super.getNavState(), tab: this.activeTab };
    }

    activateMenu(arg = 0) {
        const { selectedOption = 0, inGame, tab } = this.readActivation(arg);

        const isPaused = !!this.game.menu.pause?.isPaused;
        const inCutscene = !!(isPaused && this.game.cutsceneActive && this.game.currentCutscene);
        const inGameplay = !!(isPaused && this.game.isPlayerInGame);

        this.menuInGame = typeof inGame === 'boolean' ? inGame : (inCutscene || inGameplay);
        this.setTab(tab ?? (inCutscene ? 'CUTSCENE' : this.menuInGame ? 'INGAME' : 'MENU'));

        super.activateMenu(selectedOption);
        this.clampSelection();
    }

    setTab(tabName) {
        this.activeTab = this.tabs.includes(tabName) ? tabName : 'MENU';

        const data = this._getActiveTabData();
        this.menuOptions = data.options;
        this.volumeLevels = data.volumeLevels;
        this.muted = data.muted;
        this.audioMap = data.audioMap;

        this.clampSelection();
    }

    _cycleTab(direction) {
        const index = this.tabs.indexOf(this.activeTab);
        this.setTab(this.tabs[(index + direction + this.tabs.length) % this.tabs.length]);
        this.playHover();
    }

    isHeaderSelected() {
        return this.selectedOption === HEADER_INDEX;
    }

    clampSelection() {
        this.selectedOption = Math.max(HEADER_INDEX, Math.min(this.selectedOption, this.menuOptions.length - 1));
    }

    navigateVertical(delta) {
        const max = this.menuOptions.length - 1;

        if (this.isHeaderSelected()) {
            this.selectedOption = delta > 0 ? 0 : max;
        } else if (delta < 0) {
            this.selectedOption = this.selectedOption === 0 ? HEADER_INDEX : this.selectedOption - 1;
        } else {
            this.selectedOption = this.selectedOption === max ? HEADER_INDEX : this.selectedOption + 1;
        }
    }

    // dom
    buildBody(body) {
        const tabStrip = document.createElement('div');
        tabStrip.className = 'audio-tabs';

        this.dom.tabs = this.tabs.map((tabKey) => {
            const tab = document.createElement('div');
            tab.className = 'audio-tab';
            tab.dataset.tab = tabKey;
            tab.textContent = this._displayTabLabel(tabKey);
            tabStrip.appendChild(tab);
            return tab;
        });

        const reset = document.createElement('div');
        reset.className = 'audio-reset';
        reset.innerHTML = RESET_ICON_SVG;
        reset.addEventListener('pointerenter', () => {
            if (this.hoveredHeaderAction === 'reset') return;
            this.hoveredHeaderAction = 'reset';
            this.playHover();
        });
        reset.addEventListener('pointerleave', () => { this.hoveredHeaderAction = null; });
        tabStrip.appendChild(reset);

        const rows = document.createElement('div');
        rows.className = 'audio-rows';

        body.append(tabStrip, rows);

        this.dom.reset = reset;
        this.dom.rowHost = rows;
        this.dom.rows = [];
        this._renderedTab = null;
    }

    _buildRows() {
        this.dom.rowHost.replaceChildren();
        this._syncRowMetrics();

        this.dom.rows = this.menuOptions.map((option, i) => {
            const row = document.createElement('div');
            row.className = 'audio-row';
            row.dataset.index = String(i);
            this.bindHover(row, () => this.focusOption(i));

            const label = document.createElement('div');
            label.className = 'audio-label';
            label.textContent = option;

            if (!this._isSlider(i)) {
                row.classList.add('audio-row--action');
                label.classList.add('audio-label--action');
                row.appendChild(label);
                this.dom.rowHost.appendChild(row);
                return { row, label };
            }

            const track = document.createElement('div');
            track.className = 'audio-track';

            const fill = document.createElement('span');
            fill.className = 'audio-track__fill';

            const handle = document.createElement('span');
            handle.className = 'audio-track__handle';
            handle.addEventListener('pointerdown', (event) => this._startDrag(event, i, handle));

            track.append(fill, handle);

            const mute = document.createElement('div');
            mute.className = 'audio-mute';
            mute.innerHTML = SPEAKER_ICON_SVG;

            const percent = document.createElement('div');
            percent.className = 'audio-percent';

            row.append(label, track, mute, percent);
            this.dom.rowHost.appendChild(row);

            return { row, label, track, fill, handle, percent, mute };
        });
    }

    _syncRowMetrics() {
        const card = this.dom.card;
        if (!card) return;

        const maxRows = Math.max(...this.tabs.map((tab) => this.tabData[tab].options.length));
        card.style.setProperty('--audio-rows', String(this.menuOptions.length));
        card.style.setProperty('--audio-rows-max', String(maxRows));
    }

    syncContent() {
        if (this._renderedTab !== this.activeTab) {
            this._renderedTab = this.activeTab;
            this._buildRows();
        }

        const headerFocused = this.isHeaderSelected();

        this.dom.tabs.forEach((tab, i) => {
            const isActive = this.tabs[i] === this.activeTab;
            tab.classList.toggle('is-active', isActive);
            tab.classList.toggle('is-focused', isActive && headerFocused);
        });

        this.dom.reset.classList.toggle('is-hovered', this.hoveredHeaderAction === 'reset');

        this.dom.rows.forEach((row, i) => {
            const selected = i === this.selectedOption;
            row.label.classList.toggle('is-focused', selected);

            if (!row.track) return;

            const volume = this.volumeLevels[i];
            const muted = !!this.muted[0] || !!this.muted[i];

            row.fill.style.width = `${volume}%`;
            row.handle.style.left = `${volume}%`;
            row.track.classList.toggle('is-muted', muted);
            row.percent.textContent = `${volume}%`;
            row.mute.classList.toggle('is-muted', muted);
            row.mute.classList.toggle('is-focused', selected);
        });
    }

    // volume + muting
    _setVolume(i, percent) {
        this.volumeLevels[i] = this._clampPct(percent);
        this.updateAudioVolume(this.audioMap[this.menuOptions[i]], i);
        this.game.saveGameState();
    }

    _toggleMute(i) {
        if (!this._isSlider(i) || (i !== 0 && this.muted[0])) return false;

        this.muted[i] = !this.muted[i];

        for (let k = 0; k < this.volumeLevels.length; k++) {
            if (k === i || (i === 0 && this._isSlider(k))) {
                this.updateAudioVolume(this.audioMap[this.menuOptions[k]], k);
            }
        }

        this.game.saveGameState();
        return true;
    }

    _resetActiveTab() {
        const data = this._getActiveTabData();

        data.volumeLevels = data.volumeLevels.map((level) => (level === null ? null : 50));
        data.muted = data.muted.map((value) => (value === null ? null : false));

        this.volumeLevels = data.volumeLevels;
        this.muted = data.muted;

        this.menuOptions.forEach((option, i) => {
            if (this._isSlider(i) && this.audioMap[option]) this.updateAudioVolume(this.audioMap[option], i);
        });

        this.game.saveGameState();
    }

    updateSingleAudioVolume(id, index) {
        if (id == null) return;

        const audioElement = document.getElementById(id);
        if (!audioElement) {
            console.error(`Audio element not found for ID: ${id}`);
            return;
        }

        const masterVolume = this.volumeLevels[0] / 100;

        if (this.muted[0] || this.muted[index]) {
            audioElement.volume = 0;
        } else if (index === 0) {
            audioElement.volume = masterVolume;
        } else {
            audioElement.volume = (this.volumeLevels[index] / 100) * masterVolume;
        }

        if (index === 0) {
            for (let i = 1; i < this.volumeLevels.length; i++) {
                if (this._isSlider(i)) this.updateAudioVolume(this.audioMap[this.menuOptions[i]], i);
            }
        }
    }

    updateAudioVolume(audioElementId, index) {
        if (audioElementId == null) return;

        if (typeof audioElementId === 'object') {
            for (const id of Object.values(audioElementId)) this.updateSingleAudioVolume(id, index);
            return;
        }

        this.updateSingleAudioVolume(audioElementId, index);
    }

    _buildAudioMaps() {
        const { menu, cutsceneMusic, cutsceneSFX, cutsceneDialogue,
            mapSoundtrack, enemySFX, firedogSFX, collisionSFX, powerUpAndDownSFX } = this.game.audioHandler;

        this.tabData.MENU.audioMap = {
            'Menu Master Volume': { ...menu.getSoundsMapping() },
            'Menu Music': menu.soundsMapping.criminalitySoundtrack,
            'Map SFX': [
                menu.soundsMapping.mapOpening,
                menu.soundsMapping.enemyLoreOpenBookSound,
                menu.soundsMapping.enemyLoreCloseBookSound,
                menu.soundsMapping.bookFlipBackwardSound,
                menu.soundsMapping.bookFlipForwardSound,
                menu.soundsMapping.enemyLoreSwitchTabSound,
            ],
            'Wardrobe SFX': [
                menu.soundsMapping.purchaseCompletedSound,
                menu.soundsMapping.shinySkinRizzSound,
            ],
            'Menu Navigation SFX': [
                menu.soundsMapping.optionSelectedSound,
                menu.soundsMapping.optionHoveredSound,
            ],
        };

        this.tabData.CUTSCENE.audioMap = {
            'Cutscene Master Volume': {
                ...cutsceneMusic.getSoundsMapping(),
                ...cutsceneSFX.getSoundsMapping(),
                ...cutsceneDialogue.getSoundsMapping(),
            },
            'Cutscene Music': { ...cutsceneMusic.getSoundsMapping() },
            'Cutscene Dialogue SFX': { ...cutsceneDialogue.getSoundsMapping() },
            'Cutscene Action SFX': { ...cutsceneSFX.getSoundsMapping() },
        };

        this.tabData.INGAME.audioMap = {
            'In-Game Master Volume': {
                ...mapSoundtrack.getSoundsMapping(),
                ...enemySFX.getSoundsMapping(),
                ...firedogSFX.getSoundsMapping(),
                ...collisionSFX.getSoundsMapping(),
                ...powerUpAndDownSFX.getSoundsMapping(),
            },
            'Map Music': { ...mapSoundtrack.getSoundsMapping() },
            'Firedog SFX': { ...firedogSFX.getSoundsMapping() },
            'Enemy SFX': { ...enemySFX.getSoundsMapping() },
            'Collision SFX': { ...collisionSFX.getSoundsMapping() },
            'Power Up/Down SFX': { ...powerUpAndDownSFX.getSoundsMapping() },
        };
    }

    // input
    handleKeyDown(event) {
        if (!this._canInteract()) return;

        const tabByDigit = { 1: 'MENU', 2: 'CUTSCENE', 3: 'INGAME' }[event.key];
        if (tabByDigit) {
            this.setTab(tabByDigit);
            return;
        }

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            this.navigateVertical(event.key === 'ArrowUp' ? -1 : 1);
            this.playHover();
            return;
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            const direction = event.key === 'ArrowLeft' ? -1 : 1;

            if (this.isHeaderSelected()) {
                this._cycleTab(direction);
            } else if (this._isSlider(this.selectedOption)) {
                const step = event.repeat ? 2 : 1;
                this._setVolume(this.selectedOption, this.volumeLevels[this.selectedOption] + direction * step);
            }
            return;
        }

        if (event.key === 'Enter') {
            if (this.isHeaderSelected()) {
                this.playSelect();
            } else if (this._isSlider(this.selectedOption)) {
                if (this._toggleMute(this.selectedOption)) this.playSelect();
            } else {
                this.handleMenuSelection();
            }
        }
    }

    handleMouseClick(event) {
        if (!this._canInteract() || this.draggingSliderActive) return;

        const tab = this.hit(event, '.audio-tab');
        if (tab) {
            this.setTab(tab.dataset.tab);
            this.playSelect();
            this.selectedOption = HEADER_INDEX;
            return;
        }

        if (this.hit(event, '.audio-reset')) {
            this._resetActiveTab();
            this.playSelect();
            return;
        }

        const row = this.hit(event, '.audio-row');
        const index = row ? Number(row.dataset.index) : -1;

        if (row && this._isSlider(index) && (this.hit(event, '.audio-label') || this.hit(event, '.audio-mute'))) {
            this.selectedOption = index;
            if (this._toggleMute(index)) this.playSelect();
            return;
        }

        const track = this.hit(event, '.audio-track');
        if (track) {
            this.selectedOption = index;
            this._setVolume(index, Math.round(this._ratioIn(track, event.clientX) * 100));
            return;
        }

        this.handleMenuSelection();
    }

    _ratioIn(element, clientX) {
        const { left, width } = element.getBoundingClientRect();
        return width ? Math.max(0, Math.min(1, (clientX - left) / width)) : 0;
    }

    _startDrag(event, index, handle) {
        if (!this._canInteract()) return;
        const rect = handle.getBoundingClientRect();

        this.draggingSlider = true;
        this.draggingSliderIndex = index;
        this.dragOffsetX = event.clientX - (rect.left + rect.width / 2);
        this.selectedOption = index;
    }

    handleMouseDrag(event) {
        if (!this.draggingSlider) return;
        this.draggingSliderActive = true;

        const track = this.dom.rows[this.draggingSliderIndex]?.track;
        if (!track) return;

        const ratio = this._ratioIn(track, event.clientX - this.dragOffsetX);
        this._setVolume(this.draggingSliderIndex, Math.round(ratio * 100));
    }

    handleMouseUp() {
        this.draggingSlider = false;
        this.draggingSliderIndex = -1;

        setTimeout(() => { this.draggingSliderActive = false; }, 10);
    }

    handleMouseWheel(event) {
        if (!this.menuActive) return;

        if (this.isHeaderSelected()) {
            this._cycleTab(Math.sign(event.deltaY));
            return;
        }

        const i = this.selectedOption;
        if (i === this.menuOptions.length - 1 || !this._isSlider(i)) return;

        const step = event.repeat ? 2 : 1;
        this._setVolume(i, this.volumeLevels[i] - Math.sign(event.deltaY) * step);
    }

    handleMenuSelection() {
        super.handleMenuSelection();
        if (this.menuOptions[this.selectedOption] === 'Go Back') this.game.goBackMenu();
    }

    // persistence
    getState() {
        const tabData = {};
        for (const tab of this.tabs) {
            tabData[tab] = {
                volumeLevels: [...this.tabData[tab].volumeLevels],
                muted: [...this.tabData[tab].muted],
            };
        }
        return { tabData };
    }

    setState(state) {
        for (const tab of this.tabs) {
            this.tabData[tab].volumeLevels = [...state.tabData[tab].volumeLevels];
            this.tabData[tab].muted = [...state.tabData[tab].muted];
        }

        for (const tab of this.tabs) {
            this.setTab(tab);
            this.menuOptions.forEach((option, i) => {
                if (this.audioMap[option]) this.updateAudioVolume(this.audioMap[option], i);
            });
        }

        this.setTab('MENU');
        this.clampSelection();
    }
}
