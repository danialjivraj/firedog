import { BaseMenu } from './baseMenu.js';

export class AudioSettingsMenu extends BaseMenu {
    constructor(game) {
        super(game, ['Go Back'], 'Audio Settings');

        this.positionOffset = 255;
        this.audioContentOffsetY = 45;
        this.optionWidth = 650;

        this.tabs = ['MENU', 'CUTSCENE', 'INGAME'];
        this.activeTab = 'MENU';
        this.headerSelectionIndex = -1;
        this.tabOffsetY = 80;

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
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseDrag = this.handleMouseDrag.bind(this);

        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseDrag);
    }

    _canInteract() {
        return this.menuActive && this.game.canSelect && this.game.canSelectForestMap;
    }

    _getMouse(event) {
        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    }

    _getActiveTabData() {
        return this.tabData[this.activeTab];
    }

    _clampPct(n) {
        return Math.max(0, Math.min(100, n));
    }

    _playHover() {
        this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
    }

    _playSelect() {
        this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
    }

    _displayTabLabel(tabKey) {
        return tabKey === 'INGAME' ? 'IN-GAME' : tabKey;
    }

    activateMenu(arg = 0) {
        let selectedOption = 0;
        let opts = null;

        if (typeof arg === 'number') {
            selectedOption = arg;
        } else if (arg && typeof arg === 'object') {
            opts = arg;
            if (typeof arg.selectedOption === 'number') selectedOption = arg.selectedOption;
        }

        const isPaused = !!(this.game.menu.pause && this.game.menu.pause.isPaused);

        const shouldBeCutscene = !!(isPaused && this.game.cutsceneActive && this.game.currentCutscene);
        const shouldBeInGameGameplay = !!(isPaused && this.game.isPlayerInGame);

        const inferredOverlay = shouldBeCutscene || shouldBeInGameGameplay;
        this.menuInGame = (opts && typeof opts.inGame === 'boolean') ? opts.inGame : inferredOverlay;

        this.showStarsSticker = !this.menuInGame;

        const defaultTab =
            shouldBeCutscene ? 'CUTSCENE'
                : this.menuInGame ? 'INGAME'
                    : 'MENU';

        this.setTab(defaultTab);

        super.activateMenu(this.headerSelectionIndex);
        this.clampSelection();
    }

    setTab(tabName) {
        const tab = this.tabs.includes(tabName) ? tabName : 'MENU';
        this.activeTab = tab;

        const data = this._getActiveTabData();
        this.menuOptions = data.options;
        this.volumeLevels = data.volumeLevels;
        this.muted = data.muted;
        this.audioMap = data.audioMap;

        this.clampSelection();
    }

    _cycleTab(direction) {
        const idx = this.tabs.indexOf(this.activeTab);
        if (idx === -1) return;
        const nextIdx = (idx + direction + this.tabs.length) % this.tabs.length;
        this.setTab(this.tabs[nextIdx]);
        this._playHover();
    }

    // header-row rules
    hasHeaderRow() {
        return typeof this.headerSelectionIndex === 'number';
    }

    isHeaderSelected() {
        return this.hasHeaderRow() && this.selectedOption === this.headerSelectionIndex;
    }

    clampSelection() {
        const max = this.menuOptions.length - 1;
        const min = this.hasHeaderRow() ? this.headerSelectionIndex : 0;
        this.selectedOption = Math.max(min, Math.min(this.selectedOption, max));
    }

    navigateVertical(delta) {
        const max = this.menuOptions.length - 1;

        if (!this.hasHeaderRow()) {
            this.selectedOption =
                (this.selectedOption + (delta > 0 ? 1 : -1) + this.menuOptions.length) %
                this.menuOptions.length;
            return;
        }

        const header = this.headerSelectionIndex;

        if (this.selectedOption === header) {
            this.selectedOption = (delta > 0) ? 0 : max;
            return;
        }

        if (delta < 0) {
            this.selectedOption = (this.selectedOption === 0) ? header : this.selectedOption - 1;
        } else {
            this.selectedOption = (this.selectedOption === max) ? header : this.selectedOption + 1;
        }
    }

    // geometry
    roundRect(context, x, y, width, height, radius, fill, stroke) {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();

        if (fill) context.fill();
        if (stroke) context.stroke();
    }

    getSliderRect(i) {
        const centerY = this.game.height / 2;
        const x = this.game.width / 2 - 30;
        const w = 300;
        const h = 25;

        let y = centerY + this.audioContentOffsetY + i * 60 - 155;

        if (this.menuOptions[i] === 'Go Back' || this.volumeLevels[i] === null) {
            y += 20;
        }

        return { x, y, w, h };
    }

    getMuteIconRect(i) {
        const { x: sliderX, y: sliderY, w: sliderW, h: sliderH } = this.getSliderRect(i);
        const size = 34;
        const x = sliderX + sliderW + 38;
        const y = sliderY + sliderH / 2 - size / 2;
        return { x, y, w: size, h: size };
    }

    getLabelRect(i) {
        const { y: rowY } = this.getSliderRect(i);

        const labelRightX = this.game.width / 2 - 50;
        const labelW = 320;
        const labelH = 46;

        const x = labelRightX - labelW;
        const y = rowY - 10;

        return { x, y, w: labelW, h: labelH };
    }

    getOptionRowRect(i) {
        const centerX = this.game.width / 2;
        const rowHeight = 60;

        const { y } = this.getSliderRect(i);
        return {
            x: centerX - this.optionWidth / 2,
            y,
            w: this.optionWidth,
            h: rowHeight,
        };
    }

    hitTestOptionIndex(mouseX, mouseY) {
        for (let i = 0; i < this.menuOptions.length; i++) {
            const r = this.getOptionRowRect(i);
            if (mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h) {
                return i;
            }
        }
        return null;
    }

    _hitTestTab(mouseX, mouseY) {
        const titleY = this.game.height / 2 - this.positionOffset;
        const tabY = titleY + this.tabOffsetY;

        const tabSpacing = 260;
        const startX = this.game.width / 2 - tabSpacing;

        const boxW = 220;
        const boxH = 45;

        for (let i = 0; i < this.tabs.length; i++) {
            const tabKey = this.tabs[i];
            const x = startX + i * tabSpacing;
            const left = x - boxW / 2;
            const top = tabY - boxH + 8;

            if (mouseX >= left && mouseX <= left + boxW && mouseY >= top && mouseY <= top + boxH) {
                return tabKey;
            }
        }
        return null;
    }

    _isMutedIndex(i) {
        return !!this.muted[i];
    }

    _setMutedIndex(i, v) {
        this.muted[i] = !!v;
    }

    _hitTestMuteIcon(i, mouseX, mouseY) {
        if (this.volumeLevels[i] === null) return false;
        const r = this.getMuteIconRect(i);
        return (mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h);
    }

    _hitTestLabel(i, mouseX, mouseY) {
        if (this.volumeLevels[i] === null) return false;
        if (this.menuOptions[i] === 'Go Back') return false;
        const r = this.getLabelRect(i);
        return (mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h);
    }

    _isMasterMuted() {
        return this._isMutedIndex(0);
    }

    _toggleMute(i) {
        if (this.volumeLevels[i] === null) return false;

        if (i !== 0 && this._isMasterMuted()) return false;

        const next = !this._isMutedIndex(i);
        this._setMutedIndex(i, next);

        const label = this.menuOptions[i];
        this.updateAudioVolume(this.audioMap[label], i);

        if (i === 0) {
            for (let k = 1; k < this.volumeLevels.length; k++) {
                if (this.volumeLevels[k] !== null) {
                    const otherLabel = this.menuOptions[k];
                    this.updateAudioVolume(this.audioMap[otherLabel], k);
                }
            }
        }

        this.game.saveGameState();
        return true;
    }

    // button + icon
    drawMuteButton(ctx, rect, muted, isSelectedRow) {
        ctx.save();

        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = muted ? '#1f2a2a' : '#0d3f3d';
        ctx.strokeStyle = isSelectedRow ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 2;

        this.roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 6, true, true);

        const pad = 8;
        this.drawSpeakerIcon(ctx, rect.x + pad, rect.y + pad, rect.w - pad * 2, muted);

        ctx.restore();
    }

    drawSpeakerIcon(ctx, x, y, size, muted) {
        ctx.save();

        const cy = y + size / 2;

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'butt';

        // base rectangle
        const baseW = size * 0.18;
        const baseH = size * 0.36;
        const baseX = x + size * 0.18;
        const baseY = cy - baseH / 2;

        ctx.beginPath();
        ctx.rect(baseX, baseY, baseW, baseH);
        ctx.fill();

        const gap = size * 0.10;

        // trapezoid cone
        const coneLeftX = baseX + baseW + gap;
        const coneRightX = x + size * 0.82;

        const coneTopLeftY = baseY;
        const coneBotLeftY = baseY + baseH;
        const coneTopRightY = cy - baseH;
        const coneBotRightY = cy + baseH;

        ctx.beginPath();
        ctx.moveTo(coneLeftX, coneTopLeftY);
        ctx.lineTo(coneRightX, coneTopRightY);
        ctx.lineTo(coneRightX, coneBotRightY);
        ctx.lineTo(coneLeftX, coneBotLeftY);
        ctx.closePath();
        ctx.fill();

        // mute slash
        if (muted) {
            ctx.lineWidth = 3;
            const pad = size * 0.15;

            ctx.beginPath();
            ctx.moveTo(x + pad, y + size - pad);
            ctx.lineTo(x + size - pad, y + pad);
            ctx.stroke();
        }

        ctx.restore();
    }

    // draw
    draw(context) {
        if (!this.menuActive) return;

        context.save();

        if (!this.menuInGame) {
            context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
        } else {
            const isPause = !!this.game.menu.pause.isPaused;
            const isGameOver =
                !!this.game.gameOver ||
                !!this.game.notEnoughCoins ||
                !!this.game.menu.gameOver.menuActive;

            if (isPause || isGameOver) {
                const alpha = isPause ? 0.7 : (this.game.notEnoughCoins ? 0.5 : 0.2);
                context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
                context.fillRect(0, 0, this.game.width, this.game.height);
            }
        }

        const centerY = this.game.height / 2;

        // title
        context.font = 'bold 46px Love Ya Like A Sister';
        context.fillStyle = 'white';
        context.shadowColor = 'black';
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.textAlign = 'center';
        context.fillText(this.title, this.game.width / 2, centerY - this.positionOffset);

        // tabs
        const titleY = centerY - this.positionOffset;
        const tabY = titleY + this.tabOffsetY;
        const tabSpacing = 260;
        const startX = this.game.width / 2 - tabSpacing;

        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;

        for (let i = 0; i < this.tabs.length; i++) {
            const tabKey = this.tabs[i];
            const x = startX + i * tabSpacing;

            const isActive = tabKey === this.activeTab;
            const headerFocused = this.selectedOption === this.headerSelectionIndex;

            if (isActive) {
                context.font = headerFocused ? 'bold 34px Arial' : 'bold 32px Arial';
                context.fillStyle = 'yellow';
            } else {
                context.font = 'bold 30px Arial';
                context.fillStyle = 'white';
            }

            context.fillText(this._displayTabLabel(tabKey), x, tabY);
        }

        // options + sliders
        context.textAlign = 'right';

        for (let i = 0; i < this.menuOptions.length; i++) {
            context.font = (i === this.selectedOption) ? 'bold 36px Arial' : '34px Arial';
            context.fillStyle = (i === this.selectedOption) ? 'yellow' : 'white';

            const { y: rowY } = this.getSliderRect(i);
            const labelY = rowY + 20;

            const isGoBack = this.menuOptions[i] === 'Go Back' || this.volumeLevels[i] === null;

            if (isGoBack) {
                context.textAlign = 'center';
                context.fillText(this.menuOptions[i], this.game.width / 2, labelY + 5);
                continue;
            } else {
                context.textAlign = 'right';
                context.fillText(this.menuOptions[i], this.game.width / 2 - 50, labelY);
            }

            const vol = this.volumeLevels[i];
            if (vol === null) continue;

            const muted = this._isMutedIndex(0) || this._isMutedIndex(i);

            const { x: sliderX, y: sliderY, w: sliderW, h: sliderH } = this.getSliderRect(i);

            // slider track
            context.fillStyle = '#ccc';
            this.roundRect(context, sliderX, sliderY, sliderW, sliderH, 14, true, false);

            // handle
            const handleR = sliderH / 2;
            const handleX = sliderX + (sliderW - 2 * handleR) * (vol / 100);

            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 0;

            context.shadowColor = muted ? '#888' : '#4CAF50';
            context.fillStyle = muted ? '#888' : '#4CAF50';

            context.beginPath();
            context.arc(handleX + handleR, sliderY + sliderH / 2, handleR, 0, 2 * Math.PI);
            context.fill();

            context.shadowOffsetX = 3;
            context.shadowOffsetY = 3;
            context.shadowBlur = 3;
            context.shadowColor = 'black';

            context.save();
            context.fillStyle = 'white';
            context.font = '20px Arial';
            context.fillText(`${vol}%`, sliderX + sliderW, sliderY + sliderH / 2 - 20);
            context.restore();

            const iconRect = this.getMuteIconRect(i);
            this.drawMuteButton(context, iconRect, muted, i === this.selectedOption);
        }

        context.restore();

        if (this.showStarsSticker && !this.menuInGame) {
            this.drawStarsSticker(context);
        }
    }

    // audio volume updates
    updateSingleAudioVolume(id, index) {
        if (id == null) return;

        const audioElement = document.getElementById(id);
        if (!audioElement) {
            console.error(`Audio element not found for ID: ${id}`);
            return;
        }

        const masterVolume = this.volumeLevels[0] / 100;
        const currentVolume = this.volumeLevels[index];

        const masterMuted = this._isMutedIndex(0);
        const currentMuted = this._isMutedIndex(index);

        if (masterMuted || currentMuted) {
            audioElement.volume = 0;
            return;
        }

        if (index === 0) {
            audioElement.volume = masterVolume;
        } else {
            audioElement.volume = (currentVolume / 100) * masterVolume;
        }

        if (index === 0) {
            for (let i = 1; i < this.volumeLevels.length; i++) {
                if (this.volumeLevels[i] !== null) {
                    const otherAudioElementId = this.audioMap[this.menuOptions[i]];
                    this.updateAudioVolume(otherAudioElementId, i);
                }
            }
        }
    }

    updateAudioVolume(audioElementId, index) {
        if (audioElementId == null) return;

        if (Array.isArray(audioElementId)) {
            for (const id of audioElementId) this.updateSingleAudioVolume(id, index);
            return;
        }
        if (typeof audioElementId === 'object') {
            for (const key in audioElementId) {
                if (Object.prototype.hasOwnProperty.call(audioElementId, key)) {
                    this.updateSingleAudioVolume(audioElementId[key], index);
                }
            }
            return;
        }
        this.updateSingleAudioVolume(audioElementId, index);
    }

    _buildAudioMaps() {
        this.tabData.MENU.audioMap = {
            'Menu Master Volume': { ...this.game.audioHandler.menu.getSoundsMapping() },
            'Menu Music': this.game.audioHandler.menu.soundsMapping.soundtrack,
            'Map SFX': [
                this.game.audioHandler.menu.soundsMapping.mapOpening,
                this.game.audioHandler.menu.soundsMapping.enemyLoreOpenBookSound,
                this.game.audioHandler.menu.soundsMapping.enemyLoreCloseBookSound,
                this.game.audioHandler.menu.soundsMapping.bookFlipBackwardSound,
                this.game.audioHandler.menu.soundsMapping.bookFlipForwardSound,
                this.game.audioHandler.menu.soundsMapping.enemyLoreSwitchTabSound,
            ],
            'Wardrobe SFX': [
                this.game.audioHandler.menu.soundsMapping.purchaseCompletedSound,
            ],
            'Menu Navigation SFX': [
                this.game.audioHandler.menu.soundsMapping.optionSelectedSound,
                this.game.audioHandler.menu.soundsMapping.optionHoveredSound,
            ],
        };

        this.tabData.CUTSCENE.audioMap = {
            'Cutscene Master Volume': {
                ...this.game.audioHandler.cutsceneMusic.getSoundsMapping(),
                ...this.game.audioHandler.cutsceneSFX.getSoundsMapping(),
                ...this.game.audioHandler.cutsceneDialogue.getSoundsMapping(),
            },
            'Cutscene Music': { ...this.game.audioHandler.cutsceneMusic.getSoundsMapping() },
            'Cutscene Dialogue SFX': { ...this.game.audioHandler.cutsceneDialogue.getSoundsMapping() },
            'Cutscene Action SFX': { ...this.game.audioHandler.cutsceneSFX.getSoundsMapping() },
        };

        this.tabData.INGAME.audioMap = {
            'In-Game Master Volume': {
                ...this.game.audioHandler.mapSoundtrack.getSoundsMapping(),
                ...this.game.audioHandler.enemySFX.getSoundsMapping(),
                ...this.game.audioHandler.firedogSFX.getSoundsMapping(),
                ...this.game.audioHandler.collisionSFX.getSoundsMapping(),
                ...this.game.audioHandler.powerUpAndDownSFX.getSoundsMapping(),
            },
            'Map Music': { ...this.game.audioHandler.mapSoundtrack.getSoundsMapping() },
            'Firedog SFX': { ...this.game.audioHandler.firedogSFX.getSoundsMapping() },
            'Enemy SFX': { ...this.game.audioHandler.enemySFX.getSoundsMapping() },
            'Collision SFX': { ...this.game.audioHandler.collisionSFX.getSoundsMapping() },
            'Power Up/Down SFX': { ...this.game.audioHandler.powerUpAndDownSFX.getSoundsMapping() },
        };
    }

    // input
    handleKeyDown(event) {
        if (!this._canInteract()) return;

        if (event.key === '1') { this.setTab('MENU'); return; }
        if (event.key === '2') { this.setTab('CUTSCENE'); return; }
        if (event.key === '3') { this.setTab('INGAME'); return; }

        if (event.key === 'ArrowUp') {
            this.navigateVertical(-1);
            this._playHover();
            return;
        }

        if (event.key === 'ArrowDown') {
            this.navigateVertical(1);
            this._playHover();
            return;
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            const dir = (event.key === 'ArrowLeft') ? -1 : 1;

            if (this.isHeaderSelected()) {
                this._cycleTab(dir);
                return;
            }

            const i = this.selectedOption;
            const current = this.volumeLevels[i];
            if (current === null) return;

            const step = event.repeat ? 2 : 1;
            this.volumeLevels[i] = this._clampPct(current + (dir < 0 ? -step : step));

            const label = this.menuOptions[i];
            this.updateAudioVolume(this.audioMap[label], i);

            this.game.saveGameState();
            return;
        }

        if (event.key === 'Enter') {
            if (this.isHeaderSelected()) {
                this._playSelect();
                return;
            }

            const i = this.selectedOption;
            const isGoBack = this.menuOptions[i] === 'Go Back' || this.volumeLevels[i] === null;

            if (!isGoBack) {
                const didToggle = this._toggleMute(i);
                if (didToggle) this._playSelect();
                return;
            }

            this.handleMenuSelection();
        }
    }

    handleMouseMove(event) {
        if (!this._canInteract()) return;

        const { x: mouseX, y: mouseY } = this._getMouse(event);

        if (this._hitTestTab(mouseX, mouseY)) return;

        const hitIdx = this.hitTestOptionIndex(mouseX, mouseY);
        if (hitIdx !== null && hitIdx !== this.selectedOption) {
            this.selectedOption = hitIdx;
            this._playHover();
        }
    }

    handleMouseClick(event) {
        if (!this._canInteract()) return;
        if (this.draggingSliderActive) return;

        const { x: mouseX, y: mouseY } = this._getMouse(event);

        const hitTab = this._hitTestTab(mouseX, mouseY);
        if (hitTab) {
            this.setTab(hitTab);
            this._playSelect();
            this.selectedOption = this.headerSelectionIndex;
            this.clampSelection();
            return;
        }

        for (let i = 0; i < this.menuOptions.length; i++) {
            if (this.volumeLevels[i] === null) continue;
            if (this._hitTestLabel(i, mouseX, mouseY)) {
                this.selectedOption = i;
                const didToggle = this._toggleMute(i);
                if (didToggle) this._playSelect();
                return;
            }
        }

        for (let i = 0; i < this.menuOptions.length; i++) {
            if (this.volumeLevels[i] === null) continue;
            if (this._hitTestMuteIcon(i, mouseX, mouseY)) {
                this.selectedOption = i;
                const didToggle = this._toggleMute(i);
                if (didToggle) this._playSelect();
                return;
            }
        }

        if (!this.isHeaderSelected()) {
            const i = this.selectedOption;
            const current = this.volumeLevels[i];

            if (current !== null) {
                const { x: sx, y: sy, w: sw, h: sh } = this.getSliderRect(i);
                if (mouseX >= sx && mouseX <= sx + sw && mouseY >= sy && mouseY <= sy + sh) {
                    this.volumeLevels[i] = this._clampPct(Math.round(((mouseX - sx) / sw) * 100));

                    const label = this.menuOptions[i];
                    this.updateAudioVolume(this.audioMap[label], i);

                    this.game.saveGameState();
                    return;
                }
            }
        }

        this.handleMenuSelection();
    }

    handleMouseDown(event) {
        if (!this.menuActive) return;
        if (this.isHeaderSelected()) return;

        const { x: mouseX, y: mouseY } = this._getMouse(event);

        for (let i = 0; i < this.menuOptions.length; i++) {
            if (this.volumeLevels[i] === null) continue;
            if (this._hitTestMuteIcon(i, mouseX, mouseY)) return;
            if (this._hitTestLabel(i, mouseX, mouseY)) return;
        }

        for (let i = 0; i < this.menuOptions.length; i++) {
            const vol = this.volumeLevels[i];
            if (vol === null) continue;

            const { x: sliderX, y: sliderY, w: sliderW, h: sliderH } = this.getSliderRect(i);
            const handleR = sliderH / 2;
            const handleX = sliderX + (sliderW - 2 * handleR) * (vol / 100);

            if (
                mouseX >= handleX &&
                mouseX <= handleX + 2 * handleR &&
                mouseY >= sliderY &&
                mouseY <= sliderY + sliderH
            ) {
                this.draggingSlider = true;
                this.draggingSliderIndex = i;
                this.dragOffsetX = mouseX - handleX;
                this.selectedOption = i;
                break;
            }
        }
    }

    handleMouseUp() {
        this.draggingSlider = false;
        this.draggingSliderIndex = -1;

        setTimeout(() => {
            this.draggingSliderActive = false;
        }, 10);
    }

    handleMouseDrag(event) {
        if (!this.draggingSlider) return;

        this.draggingSliderActive = true;

        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const mouseX = (event.clientX - rect.left) * scaleX;

        const { x: sliderX, w: sliderW } = this.getSliderRect(this.draggingSliderIndex);

        let relativeX = mouseX - this.dragOffsetX - sliderX;
        relativeX = Math.max(0, Math.min(relativeX, sliderW));

        this.volumeLevels[this.draggingSliderIndex] =
            this._clampPct(Math.round((relativeX / sliderW) * 100));

        const label = this.menuOptions[this.draggingSliderIndex];
        this.updateAudioVolume(this.audioMap[label], this.draggingSliderIndex);

        this.game.saveGameState();
    }

    handleMouseWheel(event) {
        if (!this.menuActive) return;

        if (this.isHeaderSelected()) {
            const dir = event.deltaY > 0 ? 1 : -1;
            this._cycleTab(dir);
            return;
        }

        const i = this.selectedOption;
        if (i === this.menuOptions.length - 1) return;

        const current = this.volumeLevels[i];
        if (current === null) return;

        const step = event.repeat ? 2 : 1;
        const newVolume = event.deltaY > 0 ? current - step : current + step;

        this.volumeLevels[i] = this._clampPct(newVolume);

        const label = this.menuOptions[i];
        this.updateAudioVolume(this.audioMap[label], i);

        this.game.saveGameState();
    }

    // menu action
    delayedEnablePress() {
        setTimeout(() => {
            this.canPressNow = true;
        }, 10);
    }

    handleMenuSelection() {
        const selected = this.menuOptions[this.selectedOption];

        if (selected === 'Go Back') {
            super.handleMenuSelection();

            if (this.menuInGame) {
                this.game.menu.settings.activateMenu({ inGame: true, selectedOption: 0 });
            } else {
                this.game.menu.settings.activateMenu(0);
            }
            return;
        }

        super.handleMenuSelection();
    }

    // persistence
    getState() {
        return {
            tabData: {
                MENU: {
                    volumeLevels: [...this.tabData.MENU.volumeLevels],
                    muted: [...this.tabData.MENU.muted],
                },
                CUTSCENE: {
                    volumeLevels: [...this.tabData.CUTSCENE.volumeLevels],
                    muted: [...this.tabData.CUTSCENE.muted],
                },
                INGAME: {
                    volumeLevels: [...this.tabData.INGAME.volumeLevels],
                    muted: [...this.tabData.INGAME.muted],
                },
            },
        };
    }

    setState(state) {
        for (const t of this.tabs) {
            const s = state.tabData[t];

            this.tabData[t].volumeLevels = [...s.volumeLevels];
            this.tabData[t].muted = [...s.muted];
        }

        for (const t of this.tabs) {
            this.setTab(t);
            for (let i = 0; i < this.menuOptions.length; i++) {
                const audioElementId = this.audioMap[this.menuOptions[i]];
                if (audioElementId) this.updateAudioVolume(audioElementId, i);
            }
        }

        this.setTab('MENU');
        this.clampSelection();
    }
}
