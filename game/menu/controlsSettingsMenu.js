import { BaseMenu } from './baseMenu.js';
import { getDefaultKeyBindings, normalizeKey, keyLabel } from '../config/keyBindings.js';

export class ControlsSettingsMenu extends BaseMenu {
    constructor(game) {
        const actionOrder = [
            'jump',
            'moveBackward',
            'sit',
            'moveForward',
            'rollAttack',
            'diveAttack',
            'fireballAttack',
            'invisibleDefense',
            'dashAttack',
            'Reset to Defaults',
            'Go Back',
        ];
        super(game, actionOrder, 'Controls Settings');
        this.positionOffset = 260;
        this.menuInGame = false;

        this.waitingForKey = false;
        this.waitingAction = null;

        this.actionNames = {
            jump: 'Jump',
            moveBackward: 'Move Backwards',
            sit: 'Sit',
            moveForward: 'Move Forward',
            rollAttack: 'Roll Attack',
            diveAttack: 'Dive Attack',
            fireballAttack: 'Fireball Attack',
            invisibleDefense: 'Invisible Defense',
            dashAttack: 'Dash Attack',
        };

        if (!this.game.keyBindings) {
            this.game.keyBindings = getDefaultKeyBindings();
        }

        this.rowHeight = 60;
        this.listPadding = 20;
        this.scrollY = 0;
        this.targetScrollY = 0;
        this.scrollMax = 0;
        this.scrollEase = 0.18;

        this.barWidth = 10;
        this.barTrackAlpha = 0.25;
        this.draggingBar = false;
        this.dragStartMouseY = 0;
        this.dragStartScrollY = 0;

        this.onGlobalKeyDown = this.onGlobalKeyDown.bind(this);
        document.addEventListener('keydown', this.onGlobalKeyDown, true);
    }

    get keybindCount() {
        return this.menuOptions.length - 2;
    }

    closeMenu() {
        super.closeMenu();
        this.waitingForKey = false;
        this.waitingAction = null;
        this.draggingBar = false;
    }
    destroy() {
        document.removeEventListener('keydown', this.onGlobalKeyDown, true);
    }
    unboundCount() {
        let count = 0;
        for (let i = 0; i < this.keybindCount; i++) {
            const option = this.menuOptions[i];
            const key = this.game.keyBindings[option];
            if (!key) count++;
        }
        return count;
    }

    draw(context) {
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

        context.font = 'bold 46px Love Ya Like A Sister';
        context.fillStyle = 'white';
        context.shadowColor = 'black';
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.textAlign = 'center';
        context.fillText(this.title, this.game.width / 2, this.game.height / 2 - this.positionOffset);

        const listTop = this.game.height / 2 - this.positionOffset + this.menuOptionsPositionOffset;
        const listLeftLabelX = this.centerX - 40;
        const listRightKeyX = this.centerX + 40;

        const missing = this.unboundCount();

        if (missing > 0) {
            const msg = missing === 1
                ? 'Warning: 1 keybind is unbound'
                : `Warning: ${missing} keybindings are unbound`;

            context.save();
            context.textAlign = 'center';
            context.font = 'bold 26px Arial';
            context.fillStyle = '#ff4d4d';
            context.shadowColor = 'black';
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;

            context.fillText(msg, this.game.width / 2, listTop - 16);
            context.restore();
        }


        const reservedForButtons = this.rowHeight * 2 + 40;
        const listBottom = this.game.height - reservedForButtons - 30;
        const listHeight = Math.max(120, listBottom - listTop);

        const contentH = this.keybindCount * this.rowHeight + this.listPadding * 2;
        this.scrollMax = Math.max(0, contentH - listHeight);
        this.scrollY += (this.targetScrollY - this.scrollY) * this.scrollEase;

        context.save();
        context.beginPath();
        context.rect(this.centerX - 420, listTop, 840, listHeight);
        context.clip();

        context.font = '34px Arial';
        for (let i = 0; i < this.keybindCount; i++) {
            const option = this.menuOptions[i];
            const y = listTop + this.listPadding + i * this.rowHeight - this.scrollY;
            const isSelected = (i === this.selectedOption);

            if (y + this.rowHeight < listTop || y > listTop + listHeight) continue;

            const label = this.actionNames[option] || option;
            context.font = isSelected ? 'bold 36px Arial' : '34px Arial';
            context.textAlign = 'right';
            context.fillStyle = isSelected ? 'yellow' : 'white';
            context.fillText(label, listLeftLabelX, y + this.rowHeight / 2);

            const key = this.game.keyBindings[option];
            const rightCol = keyLabel(key);
            const isUnbound = !key;
            const keyColor = isUnbound ? 'red' : (isSelected ? 'yellow' : 'white');

            context.textAlign = 'left';
            context.font = isSelected ? 'bold 36px Arial' : '34px Arial';
            context.fillStyle = keyColor;
            context.fillText(rightCol, listRightKeyX, y + this.rowHeight / 2);
        }

        // scrollbar
        if (this.scrollMax > 0.5) {
            const barX = this.centerX + 420 - this.barWidth - 10;
            const trackY = listTop;
            const trackH = listHeight;

            context.fillStyle = `rgba(255,255,255,${this.barTrackAlpha})`;
            context.fillRect(barX, trackY, this.barWidth, trackH);

            const thumbH = Math.max(30, (listHeight / contentH) * trackH);
            const t = this.scrollY / this.scrollMax;
            const thumbY = trackY + (trackH - thumbH) * t;

            context.fillStyle = 'rgba(255,255,255,0.85)';
            context.fillRect(barX, thumbY, this.barWidth, thumbH);

            this.barRect = { x: barX, y: trackY, w: this.barWidth, h: trackH, thumbY, thumbH };
        } else {
            this.barRect = null;
        }

        context.restore();

        const resetIdx = this.menuOptions.length - 2;
        const backIdx = this.menuOptions.length - 1;

        const resetY = listTop + listHeight + 40 + this.rowHeight / 2;
        const backY = resetY + this.rowHeight;

        context.textAlign = 'right';

        context.font = this.selectedOption === resetIdx ? 'bold 36px Arial' : '34px Arial';
        context.fillStyle = this.selectedOption === resetIdx ? 'yellow' : 'white';
        context.fillText('Reset to Defaults', listLeftLabelX, resetY);

        context.font = this.selectedOption === backIdx ? 'bold 36px Arial' : '34px Arial';
        context.fillStyle = this.selectedOption === backIdx ? 'yellow' : 'white';
        context.fillText('Go Back', listLeftLabelX, backY);

        if (this.waitingForKey) {
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.shadowColor = 'transparent';
            context.globalAlpha = 1;

            context.fillStyle = 'rgba(0,0,0,0.8)';
            context.fillRect(-1, -1, this.game.width + 2, this.game.height + 2);
            context.restore();

            context.textAlign = 'center';
            context.fillStyle = 'white';
            context.font = 'bold 38px Arial';
            const actionName = this.actionNames[this.waitingAction];
            context.fillText(`Press a key for "${actionName}"`, this.game.width / 2, this.game.height / 2 - 10);
            context.font = '24px Arial';
            context.fillText(`(Esc to cancel)`, this.game.width / 2, this.game.height / 2 + 30);

            if (this.waitingAction === 'sit') {
                context.font = '20px Arial';
                context.fillStyle = '#FFD';
                context.fillText('Note: Dive Attack will also be set to this key.',
                    this.game.width / 2, this.game.height / 2 + 65);
                context.fillText('You can change Dive Attack separately later.',
                    this.game.width / 2, this.game.height / 2 + 90);
            }
        }

        context.restore();

        if (this.showStarsSticker && this.menuInGame === false) {
            this.drawStarsSticker(context);
        }
    }

    update(dt) {
        super.update(dt);
        this.targetScrollY = Math.max(0, Math.min(this.targetScrollY, this.scrollMax));
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

        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;

        if (event.key === 'ArrowUp') {
            this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            this.scrollSelectedIntoView();
        } else if (event.key === 'ArrowDown') {
            this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            this.scrollSelectedIntoView();
        } else if (event.key === 'Enter') {
            this.handleMenuSelection();
        }
    }

    listBounds() {
        const listTop = this.game.height / 2 - this.positionOffset + this.menuOptionsPositionOffset;
        const reservedForButtons = this.rowHeight * 2 + 40;
        const listBottom = this.game.height - reservedForButtons - 30;
        const listHeight = Math.max(120, listBottom - listTop);
        const listWidth = 840;
        const listX = this.centerX - 420;
        return { x: listX, y: listTop, w: listWidth, h: listHeight };
    }

    handleMouseWheel(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;

        const { mouseX, mouseY } = this.canvasMouse(event);
        const { x, y, w, h } = this.listBounds();
        const insideList = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;

        if (insideList) {
            const step = (event.deltaY > 0 ? 1 : -1) * 80;
            this.targetScrollY = Math.max(0, Math.min(this.targetScrollY + step, this.scrollMax));
        } else {
            super.handleMouseWheel(event);
            this.scrollSelectedIntoView();
        }
    }

    handleMouseMove(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;

        const { mouseX, mouseY } = this.canvasMouse(event);

        if (this.draggingBar) {
            this.updateScrollFromThumb(mouseY);
            return;
        }

        const listTop = this.game.height / 2 - this.positionOffset + this.menuOptionsPositionOffset;
        const reservedForButtons = this.rowHeight * 2 + 40;
        const listBottom = this.game.height - reservedForButtons - 30;

        const resetIdx = this.menuOptions.length - 2;
        const backIdx = this.menuOptions.length - 1;

        const resetY = listTop + (listBottom - listTop) + 40 + this.rowHeight / 2;
        const backY = resetY + this.rowHeight;

        const xEnd = this.centerX - 40;
        const xStart = xEnd - 400;
        const halfH = 28;

        if (mouseX >= xStart && mouseX <= xEnd) {
            if (Math.abs(mouseY - resetY) <= halfH) { this.setSelected(resetIdx); return; }
            if (Math.abs(mouseY - backY) <= halfH) { this.setSelected(backIdx); return; }
        }

        if (mouseY >= listTop && mouseY <= listBottom) {
            const listY = mouseY - listTop + this.scrollY - this.listPadding;
            const idx = Math.floor(listY / this.rowHeight);
            if (idx >= 0 && idx < this.keybindCount) this.setSelected(idx);
        }
    }

    handleMouseDown(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;
        const { mouseX, mouseY } = this.canvasMouse(event);
        if (this.barRect) {
            const { x, y, w, h, thumbY, thumbH } = this.barRect;
            if (mouseX >= x && mouseX <= x + w && mouseY >= thumbY && mouseY <= thumbY + thumbH) {
                this.draggingBar = true;
                this.dragStartMouseY = mouseY;
                this.dragStartScrollY = this.scrollY;
                return;
            }
            if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) {
                const t = (mouseY - y - thumbH / 2) / (h - thumbH);
                this.targetScrollY = Math.max(0, Math.min(this.scrollMax, t * this.scrollMax));
                return;
            }
        }
    }
    handleMouseUp() { this.draggingBar = false; }

    handleMouseClick(event) {
        if (this.waitingForKey) return;
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;
        this.handleMenuSelection();
    }

    activateMenu({ selectedOption = 0, inGame = false } = {}) {
        this.menuInGame = !!inGame;
        this.showStarsSticker = !this.menuInGame;

        this.selectedOption = selectedOption;
        this.scrollY = 0;
        this.targetScrollY = 0;

        super.activateMenu(this.selectedOption);
        this.scrollSelectedIntoView();
    }

    activateFromNav(state = {}) {
        this.activateMenu({
            inGame: state.menuInGame ?? this.menuInGame,
            selectedOption: state.selectedOption ?? 0,
        });
    }

    handleMenuSelection() {
        const option = this.menuOptions[this.selectedOption];

        if (option === "Go Back") {
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
        this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
    }

    onGlobalKeyDown(e) {
        if (!this.menuActive || !this.waitingForKey) return;

        e.preventDefault();
        e.stopPropagation();

        const key = normalizeKey(e.key);

        if (key === 'Escape') {
            this.waitingForKey = false;
            this.waitingAction = null;
            return;
        }

        for (const action in this.game.keyBindings) {
            const isSitDiveCombo =
                (this.waitingAction === 'sit' && action === 'diveAttack') ||
                (this.waitingAction === 'diveAttack' && action === 'sit');

            if (!isSitDiveCombo && this.game.keyBindings[action] === key) {
                this.game.keyBindings[action] = null;
            }
        }

        this.game.keyBindings[this.waitingAction] = key;

        if (this.waitingAction === 'sit') {
            this.game.keyBindings['diveAttack'] = key;
        }

        this.waitingForKey = false;
        this.waitingAction = null;
        this.game.saveGameState();
    }

    // helpers
    canvasMouse(event) {
        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;
        return {
            mouseX: (event.clientX - rect.left) * scaleX,
            mouseY: (event.clientY - rect.top) * scaleY,
        };
    }

    setSelected(idx) {
        if (idx !== this.selectedOption) {
            this.selectedOption = idx;
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            if (idx >= 0 && idx < this.keybindCount) {
                this.scrollSelectedIntoView();
            }
        }
    }

    scrollSelectedIntoView() {
        if (this.selectedOption >= this.keybindCount) return;
        const listTop = this.game.height / 2 - this.positionOffset + this.menuOptionsPositionOffset;
        const reservedForButtons = this.rowHeight * 2 + 40;
        const listBottom = this.game.height - reservedForButtons - 30;
        const listHeight = Math.max(120, listBottom - listTop);

        const itemTop = this.listPadding + this.selectedOption * this.rowHeight;
        const itemBottom = itemTop + this.rowHeight;

        if (itemTop < this.targetScrollY) this.targetScrollY = itemTop;
        else if (itemBottom > this.targetScrollY + listHeight) this.targetScrollY = itemBottom - listHeight;

        this.targetScrollY = Math.max(0, Math.min(this.targetScrollY, this.scrollMax));
    }

    updateScrollFromThumb(mouseY) {
        if (!this.barRect) return;
        const { y, h, thumbH } = this.barRect;
        const travel = h - thumbH;
        let t = (mouseY - y - thumbH / 2) / travel;
        t = Math.max(0, Math.min(1, t));
        this.targetScrollY = t * this.scrollMax;
    }
}
