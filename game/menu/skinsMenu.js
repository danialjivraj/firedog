import {
    SKINS,
    SKIN_MENU_ORDER,
    COSMETIC_SLOTS,
    COSMETIC_MENU_ORDER,
    COSMETICS,
    COSMETIC_LAYER_ORDER,
    getSkinElement,
    getCosmeticElement,
} from '../config/skins.js';
import { SelectMenu } from './baseMenu.js';

export class Skins extends SelectMenu {
    constructor(game) {
        const columns = [
            { id: 'skins', title: 'Skins', keys: SKIN_MENU_ORDER, kind: 'skin' },

            {
                id: COSMETIC_SLOTS.HEAD,
                title: 'Head',
                keys: COSMETIC_MENU_ORDER[COSMETIC_SLOTS.HEAD],
                kind: 'cosmetic',
                slot: COSMETIC_SLOTS.HEAD,
            },
            {
                id: COSMETIC_SLOTS.NECK,
                title: 'Neck',
                keys: COSMETIC_MENU_ORDER[COSMETIC_SLOTS.NECK],
                kind: 'cosmetic',
                slot: COSMETIC_SLOTS.NECK,
            },
            {
                id: COSMETIC_SLOTS.EYES,
                title: 'Eyes',
                keys: COSMETIC_MENU_ORDER[COSMETIC_SLOTS.EYES],
                kind: 'cosmetic',
                slot: COSMETIC_SLOTS.EYES,
            },
            {
                id: COSMETIC_SLOTS.FACE,
                title: 'Face',
                keys: COSMETIC_MENU_ORDER[COSMETIC_SLOTS.FACE],
                kind: 'cosmetic',
                slot: COSMETIC_SLOTS.FACE,
            },
        ];

        const flatOptions = [];
        for (const col of columns) {
            const labels =
                col.kind === 'skin'
                    ? col.keys.map(k => SKINS[k]?.label ?? k)
                    : col.keys.map(k => (COSMETICS[col.slot]?.[k]?.label ?? k));

            flatOptions.push(...labels);
        }
        flatOptions.push('Go Back');

        super(game, flatOptions, 'Skins');
        this.showStarsSticker = false;

        this.columns = columns;

        this.backgroundImage = document.getElementById('skinStage');

        this.currentSkinKey = 'defaultSkin';

        this.currentCosmetics = {
            [COSMETIC_SLOTS.HEAD]: 'none',
            [COSMETIC_SLOTS.NECK]: 'none',
            [COSMETIC_SLOTS.EYES]: 'none',
            [COSMETIC_SLOTS.FACE]: 'none',
        };

        this.currentSkin = getSkinElement(this.currentSkinKey);
        this.currentCosmeticEls = {
            [COSMETIC_SLOTS.HEAD]: null,
            [COSMETIC_SLOTS.NECK]: null,
            [COSMETIC_SLOTS.EYES]: null,
            [COSMETIC_SLOTS.FACE]: null,
        };

        this._refreshCosmeticCache();

        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 6;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        this.width = 100;
        this.height = 91.3;

        this.x = this.game.width / 2;
        this.y = this.game.height - this.height;

        this.optionHeight = 60;
        this.topY = this.game.height / 2 - this.positionOffset + this.menuOptionsPositionOffset;
        this.listTopY = this.topY;

        const left = Math.floor(this.game.width * 0.14);
        const right = Math.floor(this.game.width * 0.86);
        const span = right - left;

        this.colXs = [
            left + span * 0.00,
            left + span * 0.25,
            left + span * 0.50,
            left + span * 0.75,
            right,             
        ].map(v => Math.floor(v));

        this.scrollOffset = 0;
        this.listBottomPadding = 120;
        this.listHeight = Math.max(0, (this.game.height - this.listBottomPadding) - this.listTopY);
        this.visibleRows = Math.max(1, Math.floor(this.listHeight / this.optionHeight));

        this.maxRows = Math.max(...this.columns.map(c => c.keys.length));
        this.maxScroll = Math.max(0, (this.maxRows - this.visibleRows) * this.optionHeight);

        this.handleWheelBound = this.handleWheel.bind(this);
        document.removeEventListener('wheel', this.handleWheelBound);
        document.addEventListener('wheel', this.handleWheelBound, { passive: false });

        document.removeEventListener('mousemove', this.handleMouseMoveBound);
        this.handleMouseMoveBound = this.handleMouseMove.bind(this);
        document.addEventListener('mousemove', this.handleMouseMoveBound);

        this.setSelectedIndex(0);
        this._ensureSelectedVisible();
    }

    _refreshCosmeticCache() {
        for (const slot of Object.values(COSMETIC_SLOTS)) {
            const key = this.currentCosmetics[slot] || 'none';
            if (!(slot in this.currentCosmeticEls)) continue;
            this.currentCosmeticEls[slot] = (key === 'none') ? null : getCosmeticElement(slot, key);
        }
    }

    getCurrentSkinId() {
        return (this.currentSkin && this.currentSkin.id) ? this.currentSkin.id : 'defaultSkin';
    }

    getCurrentCosmeticKey(slot) {
        if (!slot) return 'none';
        return this.currentCosmetics[slot] || 'none';
    }

    setCurrentSkinById(skinId) {
        const key = Object.keys(SKINS).find(k => SKINS[k].spriteId === skinId) || 'defaultSkin';
        this.setCurrentSkinByKey(key, { forceExact: true });
    }

    setCurrentSkinByKey(skinKey, { forceExact = false } = {}) {
        const key = SKINS[skinKey] ? skinKey : 'defaultSkin';

        if (!forceExact && key === 'defaultSkin') {
            if (Math.random() < 0.9) {
                this.currentSkinKey = 'defaultSkin';
                this.currentSkin = getSkinElement('defaultSkin');
            } else {
                this.currentSkinKey = 'shinySkin';
                this.currentSkin = getSkinElement('shinySkin');
                this.game.audioHandler?.menu?.playSound?.('shinySkinRizzSound');
            }
        } else {
            this.currentSkinKey = key;
            this.currentSkin = getSkinElement(key);
        }

        this._syncSelectedIndexToState();
    }

    setCurrentCosmeticByKey(slot, cosmeticKey) {
        const safeSlot = (slot && COSMETICS[slot]) ? slot : COSMETIC_SLOTS.HEAD;
        const key = (cosmeticKey && COSMETICS[safeSlot]?.[cosmeticKey]) ? cosmeticKey : 'none';

        this.currentCosmetics[safeSlot] = key;
        if (safeSlot in this.currentCosmeticEls) {
            this.currentCosmeticEls[safeSlot] = (key === 'none') ? null : getCosmeticElement(safeSlot, key);
        }

        this._syncSelectedIndexToState();
    }

    _getColumnStartIndex(colIndex) {
        let start = 0;
        for (let i = 0; i < colIndex; i++) start += this.columns[i].keys.length;
        return start;
    }

    _syncSelectedIndexToState() {
        const skinKeyForHighlight = (this.currentSkinKey === 'shinySkin') ? 'defaultSkin' : this.currentSkinKey;

        const skinCol = 0;
        const skinRow = this.columns[skinCol].keys.indexOf(skinKeyForHighlight);
        if (skinRow >= 0) {
            this.setSelectedIndex(this._getColumnStartIndex(skinCol) + skinRow);
            return;
        }

        for (let c = 1; c < this.columns.length; c++) {
            const slot = this.columns[c].slot;
            const key = this.currentCosmetics[slot] || 'none';
            const row = this.columns[c].keys.indexOf(key);
            if (row >= 0) {
                this.setSelectedIndex(this._getColumnStartIndex(c) + row);
                return;
            }
        }
    }

    setSelectedIndex(index) {
        super.setSelectedIndex(index);
        this._ensureSelectedVisible();
    }

    _ensureSelectedVisible() {
        const goBackIndex = this.menuOptions.length - 1;
        if (this.selectedOption === goBackIndex) return;

        let remaining = this.selectedOption;
        let row = -1;

        for (const col of this.columns) {
            if (remaining < col.keys.length) {
                row = remaining;
                break;
            }
            remaining -= col.keys.length;
        }
        if (row < 0) return;

        const visibleHeight = this.visibleRows * this.optionHeight;

        const rowTop = row * this.optionHeight;
        const rowBottom = rowTop + this.optionHeight;

        if (rowTop < this.scrollOffset) {
            this.scrollOffset = rowTop;
        } else if (rowBottom > this.scrollOffset + visibleHeight) {
            this.scrollOffset = rowBottom - visibleHeight;
        }

        this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.maxScroll));
    }

    onSelect(index) {
        const goBackIndex = this.menuOptions.length - 1;
        if (index === goBackIndex) {
            this.onGoBack();
            return;
        }

        let remaining = index;
        for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
            const col = this.columns[colIndex];
            if (remaining < col.keys.length) {
                const row = remaining;

                if (col.kind === 'skin') {
                    const skinKey = col.keys[row];
                    this.setCurrentSkinByKey(skinKey);
                } else {
                    const cosmeticKey = col.keys[row];
                    this.setCurrentCosmeticByKey(col.slot, cosmeticKey);
                }
                return;
            }
            remaining -= col.keys.length;
        }
    }

    onGoBack() {
        this.game.menu.main.activateMenu(1);
    }

    _advancePreview(deltaTime) {
        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX < this.maxFrame) ? (this.frameX + 1) : 0;
        }
    }

    update(deltaTime) {
        const isRealMenuScreen =
            this.menuInGame === false &&
            !this.game.cutsceneActive &&
            !this.game.menu.pause.isPaused &&
            !this.game.isPlayerInGame;

        if (isRealMenuScreen) {
            this.game.audioHandler.menu.playSound('soundtrack');
        } else {
            this.game.audioHandler.menu.stopSound('soundtrack');
        }

        if (this.menuActive) this._advancePreview(deltaTime);
    }

    handleWheel(event) {
        if (!this.menuActive) return;

        const rect = this.game.canvas.getBoundingClientRect();
        const overCanvas =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;

        if (!overCanvas) return;
        if (this.maxScroll <= 0) return;

        event.preventDefault();

        const delta = event.deltaY;
        this.scrollOffset = Math.max(0, Math.min(this.scrollOffset + delta, this.maxScroll));
    }

    handleMouseMove(event) {
        if (!(this.menuActive && this.game.canSelect && this.game.canSelectForestMap)) return;

        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;

        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;

        const goBackIndex = this.menuOptions.length - 1;

        const halfW = this.optionWidth / 2;

        const inBox = (cx, y) =>
            mouseX >= (cx - halfW) &&
            mouseX <= (cx + halfW) &&
            mouseY >= y &&
            mouseY <= (y + this.optionHeight);

        let newSelected = this.selectedOption;

        const goBackY = this.topY + (this.visibleRows * this.optionHeight) + 20;
        if (inBox(this.centerX, goBackY)) {
            newSelected = goBackIndex;
        } else {
            const listTop = this.listTopY;
            const listBottom = this.listTopY + (this.visibleRows * this.optionHeight);
            const withinListY = mouseY >= listTop && mouseY <= listBottom;

            if (withinListY) {
                const row = Math.floor((mouseY - this.topY + this.scrollOffset) / this.optionHeight);
                if (row >= 0) {
                    for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
                        const cx = this.colXs[colIndex];
                        if (mouseX >= (cx - halfW) && mouseX <= (cx + halfW)) {
                            const col = this.columns[colIndex];
                            if (row < col.keys.length) {
                                newSelected = this._getColumnStartIndex(colIndex) + row;
                            }
                            break;
                        }
                    }
                }
            }
        }

        if (newSelected !== this.selectedOption) {
            this.selectedOption = newSelected;
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            this._ensureSelectedVisible();
        }
    }

    draw(context) {
        if (!this.menuActive) return;

        context.save();

        if (this.menuInGame === false) {
            context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
        } else {
            const isPause = !!this.game.menu.pause?.isPaused;
            const isGameOver = !!this.game.gameOver || !!this.game.menu.gameOver?.menuActive || !!this.game.notEnoughCoins;

            if (isPause || isGameOver) {
                const alpha = isPause ? 0.7 : (this.game.notEnoughCoins ? 0.5 : 0.2);
                context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
                context.fillRect(0, 0, this.game.width, this.game.height);
            }
        }

        // title
        context.font = 'bold 46px Love Ya Like A Sister';
        context.fillStyle = 'white';
        context.shadowColor = 'black';
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.textAlign = 'center';
        context.fillText(this.title, this.centerX, this.game.height / 2 - this.positionOffset);

        // column headers
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.font = 'bold 24px Arial';
        context.fillStyle = 'white';
        for (let i = 0; i < this.columns.length; i++) {
            context.fillText(this.columns[i].title, this.colXs[i], this.topY - 18);
        }

        // clip list
        const clipY = this.listTopY;
        const clipH = this.visibleRows * this.optionHeight;

        context.save();
        context.beginPath();
        context.rect(0, clipY, this.game.width, clipH);
        context.clip();

        const firstRow = Math.floor(this.scrollOffset / this.optionHeight);
        const lastRow = Math.min(this.maxRows - 1, firstRow + this.visibleRows);

        for (let row = firstRow; row <= lastRow; row++) {
            const y = this.topY + (row * this.optionHeight) - this.scrollOffset;

            for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
                const col = this.columns[colIndex];
                if (row >= col.keys.length) continue;

                const key = col.keys[row];
                const label = col.kind === 'skin'
                    ? (SKINS[key]?.label ?? key)
                    : (COSMETICS[col.slot]?.[key]?.label ?? key);

                const globalIndex = this._getColumnStartIndex(colIndex) + row;
                this._drawOptionText(context, globalIndex, label, this.colXs[colIndex], y);
            }
        }

        context.restore();

        // go back
        const goBackIndex = this.menuOptions.length - 1;
        const goBackY = this.topY + (this.visibleRows * this.optionHeight) + 20;
        this._drawOptionText(context, goBackIndex, 'Go Back', this.centerX, goBackY);

        context.restore();


        // preview: skin + cosmetics
        const skinImg = this.currentSkin || getSkinElement('defaultSkin');
        const sx = this.frameX * this.width;

        const px = this.x - 50;
        const py = this.y - 20;

        context.drawImage(skinImg, sx, 0, this.width, this.height, px, py, this.width, this.height);

        for (const slot of COSMETIC_LAYER_ORDER) {
            const img = this.currentCosmeticEls[slot];
            if (!img) continue;
            context.drawImage(img, sx, 0, this.width, this.height, px, py, this.width, this.height);
        }
    }

    _drawOptionText(context, optionIndex, text, cx, y) {
        const isHovered = (optionIndex === this.selectedOption);

        if (isHovered) {
            context.font = 'bold 32px Arial';
            context.fillStyle = 'yellow';
        } else {
            context.font = '28px Arial';
            context.fillStyle = 'white';
        }

        context.textAlign = 'center';
        context.fillText(text, cx, y + this.optionHeight / 2);
    }
}
