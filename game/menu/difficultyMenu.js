import { BaseMenu } from './baseMenu.js';

const LIVES_OPTIONS = ['1', '3', '5', '7', '10'];
const SPAWN_OPTIONS = ['Off', 'Low', 'Normal', 'High'];
const SPAWN_MULTIPLIERS = { Off: 0, Low: 0.5, Normal: 1, High: 1.5 };

const DEFAULT_LIVES_INDEX = 2;  // 5 lives
const DEFAULT_SPAWN_INDEX = 2;  // Normal

export class DifficultyMenu extends BaseMenu {
    constructor(game) {
        super(game, [], 'Difficulty Settings');

        this.positionOffset = 255;
        this.menuInGame = false;
        this.showStarsSticker = true;

        this.livesIndex = DEFAULT_LIVES_INDEX;
        this.powerUpIndex = DEFAULT_SPAWN_INDEX;
        this.powerDownIndex = DEFAULT_SPAWN_INDEX;

        // 0=Lives, 1=PowerUp, 2=PowerDown, 3=ResetBtn, 4=GoBackBtn
        this.focusedRow = 0;
        this._hoverRow = -1;
        this._hoverOptIdx = -1;
        this._hoverButton = -1;

        // Layout
        this.rowHeight = 76;
        this.optionBoxW = 110;
        this.optionBoxH = 44;
        this.optionGap = 0;
        this.labelWidth = 360;
        this.labelToOptionsGap = 28;
        this.buttonHitWidth = 320;
        this.labelHitPaddingX = 18;
        this.labelHitHeight = 46;

        this.contentOffsetX = -130;

        this._applySettings(false);
    }

    _getRows() {
        return [
            { label: 'Lives', options: LIVES_OPTIONS, index: this.livesIndex },
            { label: 'Power Up Rate', options: SPAWN_OPTIONS, index: this.powerUpIndex },
            { label: 'Power Down Rate', options: SPAWN_OPTIONS, index: this.powerDownIndex },
        ];
    }

    _getLayout() {
        const centerX = this.game.width / 2;
        const titleY = this.game.height / 2 - this.positionOffset;
        const listTop = titleY + 125;
        const footerButtonSpacing = 60;

        const rows = this._getRows();

        const maxOptionCount = Math.max(...rows.map(row => row.options.length));
        const optionsWidth =
            maxOptionCount * this.optionBoxW +
            (maxOptionCount - 1) * this.optionGap;

        const contentWidth = this.labelWidth + this.labelToOptionsGap + optionsWidth;
        const contentLeft = centerX - contentWidth / 2 + this.contentOffsetX;

        const labelRightX = contentLeft + this.labelWidth;
        const optionsStartX = labelRightX + this.labelToOptionsGap;

        const resetY = listTop + rows.length * this.rowHeight + 34;
        const backY = resetY + footerButtonSpacing;

        return {
            centerX,
            titleY,
            listTop,
            rows,
            labelRightX,
            optionsStartX,
            resetY,
            backY,
        };
    }

    _applySettings(triggerUISync = true) {
        this.game.lives = this.getConfiguredLives();
        this.game.powerUpSpawnMultiplier = SPAWN_MULTIPLIERS[SPAWN_OPTIONS[this.powerUpIndex]];
        this.game.powerDownSpawnMultiplier = SPAWN_MULTIPLIERS[SPAWN_OPTIONS[this.powerDownIndex]];

        if (triggerUISync) {
            this.game.UI?.syncLivesState?.();
        }
    }

    applyCurrentSettings(triggerUISync = true) {
        this._applySettings(triggerUISync);
    }

    getConfiguredLives() {
        return parseInt(LIVES_OPTIONS[this.livesIndex], 10);
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

    _changeRowOption(rowIdx, delta) {
        if (rowIdx === 0) {
            this.livesIndex = (this.livesIndex + delta + LIVES_OPTIONS.length) % LIVES_OPTIONS.length;
        } else if (rowIdx === 1) {
            this.powerUpIndex = (this.powerUpIndex + delta + SPAWN_OPTIONS.length) % SPAWN_OPTIONS.length;
        } else if (rowIdx === 2) {
            this.powerDownIndex = (this.powerDownIndex + delta + SPAWN_OPTIONS.length) % SPAWN_OPTIONS.length;
        }

        this._applySettings();
        this.game.saveGameState?.();
    }

    _onReset() {
        this.livesIndex = DEFAULT_LIVES_INDEX;
        this.powerUpIndex = DEFAULT_SPAWN_INDEX;
        this.powerDownIndex = DEFAULT_SPAWN_INDEX;

        this._applySettings();
        this.game.saveGameState?.();
        this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
    }

    _onGoBack() {
        this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
        this.game.goBackMenu();
    }

    _applyFocusedRowSelection() {
        if (this.focusedRow === 0) {
            this._applySettings();
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            this.game.saveGameState?.();
        } else if (this.focusedRow === 1) {
            this._applySettings();
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            this.game.saveGameState?.();
        } else if (this.focusedRow === 2) {
            this._applySettings();
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            this.game.saveGameState?.();
        } else if (this.focusedRow === 3) {
            this._onReset();
        } else if (this.focusedRow === 4) {
            this._onGoBack();
        }
    }

    activateMenu(arg = 0) {
        let selectedOption = 0;
        let inGame = false;

        if (typeof arg === 'number') {
            selectedOption = arg;
        } else if (arg && typeof arg === 'object') {
            selectedOption = arg.selectedOption ?? 0;
            inGame = !!arg.inGame;
        }

        this.menuInGame = inGame;
        this.showStarsSticker = !this.menuInGame;

        super.activateMenu(selectedOption);
        this.focusedRow = Math.max(0, Math.min(selectedOption, 4));
    }

    activateFromNav(state = {}) {
        this.activateMenu({
            selectedOption: state.selectedOption ?? 0,
            inGame: state.menuInGame ?? this.menuInGame,
        });
    }

    getNavState() {
        return {
            selectedOption: this.focusedRow,
            menuInGame: this.menuInGame,
        };
    }

    draw(context) {
        if (!this.menuActive) return;

        context.save();

        if (!this.menuInGame) {
            context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
        } else {
            const isPause = !!this.game.menu.pause?.isPaused;
            const isGameOver =
                !!this.game.gameOver ||
                !!this.game.notEnoughCoins ||
                !!this.game.menu.gameOver?.menuActive;

            if (isPause || isGameOver) {
                const alpha = isPause ? 0.7 : (this.game.notEnoughCoins ? 0.5 : 0.2);
                context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
                context.fillRect(0, 0, this.game.width, this.game.height);
            }
        }

        const {
            centerX,
            titleY,
            listTop,
            rows,
            labelRightX,
            optionsStartX,
            resetY,
            backY,
        } = this._getLayout();

        context.font = 'bold 46px Love Ya Like A Sister';
        context.fillStyle = 'white';
        context.shadowColor = 'black';
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.shadowBlur = 0;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.title, centerX, titleY);

        rows.forEach((row, rowIdx) => {
            const y = listTop + rowIdx * this.rowHeight;
            const isFocused = this.focusedRow === rowIdx;

            const rowWidth =
                row.options.length * this.optionBoxW +
                (row.options.length - 1) * this.optionGap;

            const rowX = optionsStartX;
            const rowY = y - this.optionBoxH / 2 - 2;

            context.textAlign = 'right';
            context.textBaseline = 'middle';
            context.font = isFocused ? 'bold 36px Arial' : '34px Arial';
            context.fillStyle = isFocused ? 'yellow' : 'white';
            context.fillText(row.label, labelRightX, y);

            context.save();
            context.shadowColor = 'transparent';
            context.fillStyle = 'rgba(0, 0, 0, 0.22)';
            context.strokeStyle = isFocused
                ? 'rgba(255,255,255,0.42)'
                : 'rgba(255,255,255,0.24)';
            context.lineWidth = 1.25;
            context.fillRect(rowX, rowY, rowWidth, this.optionBoxH);
            context.strokeRect(rowX, rowY, rowWidth, this.optionBoxH);
            context.restore();

            row.options.forEach((opt, optIdx) => {
                const x = optionsStartX + optIdx * (this.optionBoxW + this.optionGap);

                const isSelected = optIdx === row.index;
                const isHovered = this._hoverRow === rowIdx && this._hoverOptIdx === optIdx;

                if (optIdx > 0) {
                    context.save();
                    context.shadowColor = 'transparent';
                    context.strokeStyle = 'rgba(255,255,255,0.16)';
                    context.lineWidth = 1;
                    context.beginPath();
                    context.moveTo(x, rowY);
                    context.lineTo(x, rowY + this.optionBoxH);
                    context.stroke();
                    context.restore();
                }

                if (isHovered) {
                    context.save();
                    context.shadowColor = 'transparent';
                    context.fillStyle = 'rgba(255, 217, 0, 0.15)';
                    context.fillRect(x, rowY, this.optionBoxW, this.optionBoxH);
                    context.restore();
                }

                if (isSelected) {
                    context.save();
                    context.shadowColor = 'transparent';
                    context.fillStyle = 'rgba(255, 215, 0, 0.08)';
                    context.fillRect(x, rowY, this.optionBoxW, this.optionBoxH);

                    context.strokeStyle = 'rgba(255, 215, 0, 0.95)';
                    context.lineWidth = 2;
                    context.strokeRect(x + 0.5, rowY + 0.5, this.optionBoxW - 1, this.optionBoxH - 1);
                    context.restore();
                }

                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.font = isSelected ? 'bold 26px Arial' : '24px Arial';
                context.fillStyle = isSelected ? '#ffd84d' : 'white';
                context.fillText(opt, x + this.optionBoxW / 2, y);
            });
        });

        context.textAlign = 'center';
        context.textBaseline = 'middle';

        context.font = this.focusedRow === 3 ? 'bold 36px Arial' : '34px Arial';
        context.fillStyle = this.focusedRow === 3 ? 'yellow' : 'white';
        context.fillText('Reset to Defaults', centerX, resetY);

        context.font = this.focusedRow === 4 ? 'bold 36px Arial' : '34px Arial';
        context.fillStyle = this.focusedRow === 4 ? 'yellow' : 'white';
        context.fillText('Go Back', centerX, backY);

        context.restore();

        if (this.showStarsSticker && !this.menuInGame) {
            this.drawStarsSticker(context);
        }
    }

    handleKeyDown(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.focusedRow = (this.focusedRow - 1 + 5) % 5;
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                break;

            case 'ArrowDown':
                event.preventDefault();
                this.focusedRow = (this.focusedRow + 1) % 5;
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                break;

            case 'ArrowLeft':
                if (this.focusedRow < 3) {
                    event.preventDefault();
                    this._changeRowOption(this.focusedRow, -1);
                    this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                }
                break;

            case 'ArrowRight':
                if (this.focusedRow < 3) {
                    event.preventDefault();
                    this._changeRowOption(this.focusedRow, 1);
                    this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                }
                break;

            case 'Enter':
                event.preventDefault();
                event.stopImmediatePropagation();

                if (this.focusedRow === 3) {
                    this._onReset();
                } else if (this.focusedRow === 4) {
                    this._onGoBack();
                } else {
                    this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
                }
                break;
        }
    }

    handleMouseMove(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;

        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;
        const mx = (event.clientX - rect.left) * scaleX;
        const my = (event.clientY - rect.top) * scaleY;

        const {
            centerX,
            listTop,
            rows,
            labelRightX,
            optionsStartX,
            resetY,
            backY,
        } = this._getLayout();

        let hr = -1;
        let ho = -1;
        let hb = -1;

        rows.forEach((row, rowIdx) => {
            const y = listTop + rowIdx * this.rowHeight;
            const rowWidth =
                row.options.length * this.optionBoxW +
                (row.options.length - 1) * this.optionGap;
            const rowY = y - this.optionBoxH / 2 - 2;

            const labelLeftX = labelRightX - this.labelWidth - this.labelHitPaddingX;
            const labelRightHitX = labelRightX + this.labelHitPaddingX;
            const labelTopY = y - this.labelHitHeight / 2;
            const labelBottomY = y + this.labelHitHeight / 2;

            const overLabel =
                mx >= labelLeftX &&
                mx <= labelRightHitX &&
                my >= labelTopY &&
                my <= labelBottomY;

            const overBar =
                mx >= optionsStartX &&
                mx <= optionsStartX + rowWidth &&
                my >= rowY &&
                my <= rowY + this.optionBoxH;

            if (overLabel || overBar) {
                hr = rowIdx;

                row.options.forEach((_, optIdx) => {
                    const px = optionsStartX + optIdx * (this.optionBoxW + this.optionGap);
                    const py = rowY;

                    if (
                        mx >= px &&
                        mx <= px + this.optionBoxW &&
                        my >= py &&
                        my <= py + this.optionBoxH
                    ) {
                        ho = optIdx;
                    }
                });
            }
        });

        const halfW = this.buttonHitWidth / 2;
        const halfH = 26;

        if (mx >= centerX - halfW && mx <= centerX + halfW) {
            if (Math.abs(my - resetY) <= halfH) hb = 0;
            else if (Math.abs(my - backY) <= halfH) hb = 1;
        }

        const changed = hr !== this._hoverRow || ho !== this._hoverOptIdx || hb !== this._hoverButton;

        this._hoverRow = hr;
        this._hoverOptIdx = ho;
        this._hoverButton = hb;

        if (hr !== -1) {
            if (this.focusedRow !== hr) this.focusedRow = hr;
        } else if (hb !== -1) {
            const nextFocused = hb === 0 ? 3 : 4;
            if (this.focusedRow !== nextFocused) this.focusedRow = nextFocused;
        }

        if (changed && (hr !== -1 || hb !== -1)) {
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
        }
    }

    handleMouseClick(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;
        event.preventDefault();
        event.stopImmediatePropagation();

        if (this._hoverRow !== -1 && this._hoverOptIdx !== -1) {
            if (this._hoverRow === 0) this.livesIndex = this._hoverOptIdx;
            else if (this._hoverRow === 1) this.powerUpIndex = this._hoverOptIdx;
            else if (this._hoverRow === 2) this.powerDownIndex = this._hoverOptIdx;

            this.focusedRow = this._hoverRow;
            this._applySettings();
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            this.game.saveGameState?.();
            return;
        }

        if (this._hoverButton === 0) {
            this.focusedRow = 3;
            this._onReset();
            return;
        }

        if (this._hoverButton === 1) {
            this.focusedRow = 4;
            this._onGoBack();
            return;
        }

        this._applyFocusedRowSelection();
    }

    handleMouseWheel(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;
        const delta = Math.sign(event.deltaY);
        this.focusedRow = (this.focusedRow + delta + 5) % 5;
        this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
    }
}
