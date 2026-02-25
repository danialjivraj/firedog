import {
    FIREDOG_FRAME,
    SKINS,
    SKIN_MENU_ORDER,
    COSMETIC_SLOTS,
    COSMETIC_MENU_ORDER,
    COSMETICS,
    COSMETIC_LAYER_ORDER,
    getSkinElement,
    getCosmeticElement,
    getCosmeticChromaConfig,
    resolveCosmeticChromaVariant,
    getCosmeticChromaVariantIdFromState,
    getCosmeticChromaDegFromState,
    drawWithOptionalHue,
} from '../config/skinsAndCosmetics.js';
import { BaseMenu } from './baseMenu.js';

const GIFT_SKIN_FLAGS = Object.freeze({
    iceBreakerSkin: 'glacikalDefeated',
    infernalSkin: 'elyvorgDefeated',
    galaxySkin: 'ntharaxDefeated',
});

const isGiftSkinKey = (key) => !!GIFT_SKIN_FLAGS[key];
const getGiftFlag = (key) => GIFT_SKIN_FLAGS[key] || null;

// color helpers
const clamp01 = (n) => Math.max(0, Math.min(1, n));

function hexToRgb01(hex) {
    const h = String(hex || '').replace('#', '').trim();
    if (h.length !== 6) return { r: 1, g: 1, b: 1 };

    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;

    if (![r, g, b].every(Number.isFinite)) return { r: 1, g: 1, b: 1 };
    return { r, g, b };
}

function rgb01ToHsl({ r, g, b }) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1));

        switch (max) {
            case r:
                h = ((g - b) / d) % 6;
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            default:
                h = (r - g) / d + 4;
                break;
        }

        h *= 60;
        if (h < 0) h += 360;
    }

    return { h, s, l };
}

function hslToRgb01({ h, s, l }) {
    const C = (1 - Math.abs(2 * l - 1)) * s;
    const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - C / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (0 <= h && h < 60) {
        r = C;
        g = X;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = X;
        g = C;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = C;
        b = X;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = X;
        b = C;
    } else if (240 <= h && h < 300) {
        r = X;
        g = 0;
        b = C;
    } else {
        r = C;
        g = 0;
        b = X;
    }

    return { r: r + m, g: g + m, b: b + m };
}

function rgb01ToHex({ r, g, b }) {
    const rr = Math.round(clamp01(r) * 255).toString(16).padStart(2, '0');
    const gg = Math.round(clamp01(g) * 255).toString(16).padStart(2, '0');
    const bb = Math.round(clamp01(b) * 255).toString(16).padStart(2, '0');
    return `#${rr}${gg}${bb}`;
}

function rotateHueHex(baseHex, deg) {
    const rgb = hexToRgb01(baseHex);
    const hsl = rgb01ToHsl(rgb);
    const h = (hsl.h + (Number(deg) || 0)) % 360;
    const outRgb = hslToRgb01({ h: (h + 360) % 360, s: hsl.s, l: hsl.l });
    return rgb01ToHex(outRgb);
}

export class Wardrobe extends BaseMenu {
    constructor(game) {
        super(game, [], 'Wardrobe');

        // UI
        this.UI = {
            sidebar: {
                xPct: 0.07,
                tabOffsetX: 60,
                w: 210,
                tabH: 68,
                gap: 16,
                contentGap: 30,
                bottomReserved: 210,
                titleToContentPad: 60,
            },
            tabs: {
                fontInactive: 24,
                fontActive: 26,
                padLeft: 26,
                activeBar: { xPad: 8, yPad: 10, w: 8, r: 8 },
                bgRadius: 14,
                bgFill: 'rgba(0,0,0,0.45)',
                activeBarFill: 'rgba(255,255,0,0.92)',
            },
            goBack: {
                margin: 28,
                w: 360,
                h: 78,
                fontInactive: '34px Arial',
                fontActive: 'bold 36px Arial',
            },
            title: {
                font: 'bold 46px Love Ya Like A Sister',
                shadowX: 3,
                shadowY: 3,
            },
            card: {
                radius: 14,
                pad: 8,

                labelPadBottom: 8,
                labelToPriceGap: 3,

                labelMaxFont: 12,
                labelMinFont: 7,

                priceMaxFont: 11,
                priceMinFont: 7,

                lockOverlayAlpha: 0.55,

                chroma: {
                    showOnlyWhenSelected: true,

                    padTop: 4,
                    padX: 8,

                    r: 9,
                    gapX: 10,
                    gapY: 6,
                    ringPad: 4,

                    gapToText: 6,
                },
            },

            ccDisplay: {
                rightPad: 28,
                topPad: 18,
                labelFont: '14px Arial',
                valueFont: 'bold 22px Arial',
                labelFill: 'rgba(255,255,255,0.70)',
                valueFill: 'white',
                shadow: true,
            },

            filterDropdown: {
                h: 38,
                radius: 10,
                font: 'bold 16px Arial',
                fg: 'white',

                btnFill: 'rgba(0,0,0,0.00)',
                btnStroke: 'rgba(255,255,255,0.28)',
                btnStrokeHover: 'rgba(255,255,0,0.90)',
                btnFillHover: 'rgba(0,0,0,0.10)',

                menuFill: 'rgba(10,10,12,0.96)',
                menuStroke: 'rgba(255,255,255,0.18)',
                optionH: 34,
                optionPadX: 12,
                optionFillHover: 'rgba(255,255,255,0.10)',
                optionFg: 'rgba(255,255,255,0.92)',
                optionFgActive: 'yellow',
                caretFill: 'rgba(255,255,255,0.85)',

                aboveGridGap: 12,
                minTopY: 14,
                minW: 170,
                padLeft: 12,
                padRightForCaret: 30,
            },

            modal: {
                overlay: 'rgba(0,0,0,0.45)',

                panelFill: 'rgba(10,10,12,0.96)',
                panelStroke: 'rgba(255,255,255,0.18)',
                radius: 18,

                w: 660,
                h: 390,

                pad: 28,
                headerH: 60,
                headerDividerStroke: 'rgba(255,255,255,0.12)',

                titleFont: 'bold 28px Arial',
                bodyFont: '20px Arial',
                smallFont: 'bold 18px Arial',

                close: {
                    size: 34,
                    radius: 10,
                    font: 'bold 20px Arial',
                    fg: 'rgba(255,255,255,0.92)',
                    bg: 'rgba(0,0,0,0.22)',
                    bgHover: 'rgba(255,255,255,0.14)',
                    stroke: 'rgba(255,255,255,0.22)',
                    strokeHover: 'rgba(255,255,0,0.95)',
                },

                nav: {
                    size: 42,
                    radius: 14,
                    gapFromPanel: 14,
                    bg: 'rgba(0,0,0,0.22)',
                    bgHover: 'rgba(255,255,255,0.14)',
                    stroke: 'rgba(255,255,255,0.22)',
                    strokeHover: 'rgba(255,255,0,0.95)',
                    fg: 'rgba(255,255,255,0.92)',
                },

                btnFont: 'bold 22px Arial',
                btnH: 54,
                btnW: 170,
                btnGap: 18,

                preview: {
                    pad: 22,
                    boxFill: 'rgba(32,32,36,0.98)',
                    boxStroke: 'rgba(255,255,255,0.22)',
                    radius: 14,
                    captionFont: '14px Arial',
                    captionFill: 'rgba(255,255,255,0.65)',
                    glowEnabled: true,
                    glowAlpha: 0.20,
                },
            },
        };

        // tabs
        this.tabs = [
            { id: 'skins', title: 'Skins', kind: 'skin', keys: SKIN_MENU_ORDER },
            { id: COSMETIC_SLOTS.HEAD, title: 'Head', kind: 'cosmetic', slot: COSMETIC_SLOTS.HEAD, keys: COSMETIC_MENU_ORDER[COSMETIC_SLOTS.HEAD] },
            { id: COSMETIC_SLOTS.NECK, title: 'Neck', kind: 'cosmetic', slot: COSMETIC_SLOTS.NECK, keys: COSMETIC_MENU_ORDER[COSMETIC_SLOTS.NECK] },
            { id: COSMETIC_SLOTS.EYES, title: 'Eyes', kind: 'cosmetic', slot: COSMETIC_SLOTS.EYES, keys: COSMETIC_MENU_ORDER[COSMETIC_SLOTS.EYES] },
            { id: COSMETIC_SLOTS.NOSE, title: 'Nose', kind: 'cosmetic', slot: COSMETIC_SLOTS.NOSE, keys: COSMETIC_MENU_ORDER[COSMETIC_SLOTS.NOSE] },
        ];

        // state
        this.activeTabIndex = 0;
        this.backgroundImage = document.getElementById('skinStage');

        this.currentSkinKey = 'defaultSkin';
        this.currentCosmetics = {
            [COSMETIC_SLOTS.HEAD]: 'none',
            [COSMETIC_SLOTS.NECK]: 'none',
            [COSMETIC_SLOTS.EYES]: 'none',
            [COSMETIC_SLOTS.NOSE]: 'none',
        };
        this.currentCosmeticsChroma = {
            [COSMETIC_SLOTS.HEAD]: {},
            [COSMETIC_SLOTS.NECK]: {},
            [COSMETIC_SLOTS.EYES]: {},
            [COSMETIC_SLOTS.NOSE]: {},
        };

        this.currentSkin = getSkinElement(this.currentSkinKey);
        this.currentCosmeticEls = {
            [COSMETIC_SLOTS.HEAD]: null,
            [COSMETIC_SLOTS.NECK]: null,
            [COSMETIC_SLOTS.EYES]: null,
            [COSMETIC_SLOTS.NOSE]: null,
        };
        this._refreshCosmeticCache();

        // preview animation
        this.frameX = 0;
        this.maxFrame = 6;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        this.width = FIREDOG_FRAME.width;
        this.height = FIREDOG_FRAME.height;

        this.x = this.game.width / 2;
        this.y = this.game.height - this.height;

        // grid
        this.gridTargetCols = 7;
        this.gridGap = 12;
        this.gridMinCardSize = 92;
        this.gridMaxCardSize = 125;
        this.gridLeftOffset = 110;

        this.selectedOption = 0;

        // filter
        this.filterModes = Object.freeze(['All', 'Owned', 'Unowned']);
        this.filterModeIndex = 0;

        this.filterOpen = false;
        this.filterHoverIndex = -1;
        this.filterHoverBtn = false;

        this._uiCtx = null;
        this.modal = null;

        // chroma hitboxes
        this._chromaHitboxes = [];
        this._modalChromaHitboxes = [];

        // scrolling + scrollbar
        this.scrollEase = 0.18;
        this.scrollYByTab = new Array(this.tabs.length).fill(0);
        this.targetScrollYByTab = new Array(this.tabs.length).fill(0);
        this.scrollMaxByTab = new Array(this.tabs.length).fill(0);

        this.barWidth = 10;
        this.barTrackAlpha = 0.25;
        this.draggingBar = false;
        this.dragStartMouseY = 0;
        this.dragStartScrollY = 0;
        this.barRect = null;
    }

    activateMenu(selectedOption = 0) {
        super.activateMenu(selectedOption);

        this.activeTabIndex = 0;

        this.filterModeIndex = 0;
        this.filterOpen = false;
        this.filterHoverIndex = -1;
        this.filterHoverBtn = false;

        this.modal = null;

        if (Array.isArray(this.scrollYByTab)) this.scrollYByTab[0] = 0;
        if (Array.isArray(this.targetScrollYByTab)) this.targetScrollYByTab[0] = 0;

        this.selectedOption = 0;
        this._syncSelectionToEquipped();
        this._ensureSelectedVisible();
    }

    // chroma swatches
    _clearChromaHitboxes() { this._chromaHitboxes = []; }
    _clearModalChromaHitboxes() { this._modalChromaHitboxes = []; }

    _measureChromaBlockH(slot, key, maxWidth) {
        const item = COSMETICS?.[slot]?.[key];
        const cfg = item?.chroma;
        if (!cfg || !Array.isArray(cfg.variants) || cfg.variants.length <= 1) return 0;

        const ui = this.UI.card.chroma;
        const r = ui.r;
        const outerR = r + ui.ringPad;

        const diameter = r * 2;
        const gapX = ui.gapX;
        const gapY = ui.gapY;

        const cellW = diameter + gapX;
        const usableW = Math.max(1, Math.floor(maxWidth || 1));
        const perRow = Math.max(1, Math.floor((usableW + gapX) / cellW));
        const rows = Math.ceil(cfg.variants.length / perRow);

        const rowH = outerR * 2;
        return rows * rowH + (rows - 1) * gapY;
    }

    _drawChromaSwatchesCore(ctx, { slot, key, x, y, maxWidth, currentId, hitboxes }) {
        const item = COSMETICS?.[slot]?.[key];
        const cfg = item?.chroma;
        if (!cfg || !Array.isArray(cfg.variants) || cfg.variants.length <= 1) return 0;

        const ui = this.UI.card.chroma;
        const baseHex = item?.chromaSwatchBaseHex || '#ffffff';

        const r = ui.r;
        const ringPad = ui.ringPad;
        const outerR = r + ringPad;

        const gapX = ui.gapX;
        const gapY = ui.gapY;

        const diameter = r * 2;
        const cellW = diameter + gapX;

        const usableW = Math.max(1, Math.floor(maxWidth || 1));
        const perRow = Math.max(1, Math.floor((usableW + gapX) / cellW));
        const rows = Math.ceil(cfg.variants.length / perRow);

        const rowH = outerR * 2;
        const totalH = rows * rowH + (rows - 1) * gapY;

        for (let row = 0; row < rows; row++) {
            const startIndex = row * perRow;
            const endIndex = Math.min(cfg.variants.length, startIndex + perRow);
            const count = endIndex - startIndex;

            const rowW = count * diameter + (count - 1) * gapX;
            const startCx = Math.floor(x + (usableW - rowW) / 2 + r);
            const cy = Math.floor(y + row * (rowH + gapY) + outerR);

            let cx = startCx;

            for (let i = startIndex; i < endIndex; i++) {
                const v = cfg.variants[i];
                const fill = rotateHueHex(baseHex, v.deg);

                ctx.save();

                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fillStyle = fill;
                ctx.fill();

                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(0,0,0,0.7)';
                ctx.stroke();

                if (v.id === currentId) {
                    ctx.beginPath();
                    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
                    ctx.stroke();
                }

                ctx.restore();

                hitboxes.push({
                    slot,
                    key,
                    variantId: v.id,
                    cx,
                    cy,
                    r: outerR + 6,
                });

                cx += diameter + gapX;
            }
        }

        return totalH;
    }

    _drawChromaSwatches(ctx, { slot, key, x, y, maxWidth }) {
        const item = COSMETICS?.[slot]?.[key];
        const cfg = item?.chroma;
        if (!cfg || !Array.isArray(cfg.variants) || cfg.variants.length <= 1) return 0;

        const currentId =
            this._getCosmeticChromaVariantId(slot, key) ||
            cfg.default ||
            cfg.variants[0]?.id;

        return this._drawChromaSwatchesCore(ctx, {
            slot,
            key,
            x,
            y,
            maxWidth,
            currentId,
            hitboxes: this._chromaHitboxes,
        });
    }

    _drawModalChromaSwatches(ctx, { slot, key, x, y, maxWidth, currentId }) {
        return this._drawChromaSwatchesCore(ctx, {
            slot,
            key,
            x,
            y,
            maxWidth,
            currentId,
            hitboxes: this._modalChromaHitboxes,
        });
    }

    _tryClickChromaSwatch(mouseX, mouseY) {
        const hitboxes = this._chromaHitboxes;
        if (!Array.isArray(hitboxes) || hitboxes.length === 0) return false;

        for (const h of hitboxes) {
            const dx = mouseX - h.cx;
            const dy = mouseY - h.cy;

            if ((dx * dx + dy * dy) <= (h.r * h.r)) {
                if (!this._isCosmeticOwned(h.slot, h.key)) return true;

                const equippedKey = this.currentCosmetics?.[h.slot] || 'none';
                if (equippedKey !== h.key) {
                    this.setCurrentCosmeticByKey(h.slot, h.key);
                }

                if (this._setCosmeticChromaVariantId(h.slot, h.key, h.variantId)) {
                    this._save();
                    this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
                    return true;
                }

                return true;
            }
        }

        return false;
    }

    _tryClickModalChromaSwatch(mouseX, mouseY) {
        if (!this.modal || this.modal.type !== 'preview') return false;

        const hitboxes = this._modalChromaHitboxes;
        if (!Array.isArray(hitboxes) || hitboxes.length === 0) return false;

        for (const h of hitboxes) {
            const dx = mouseX - h.cx;
            const dy = mouseY - h.cy;
            if ((dx * dx + dy * dy) <= (h.r * h.r)) {
                this.modal.previewChromaVariantId = h.variantId;
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
                return true;
            }
        }

        return false;
    }

    // small helpers
    _getUiCtx() {
        return this._uiCtx || this.game.ctx || this.game.context || null;
    }

    _hitTestRect(mx, my, r) {
        return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
    }

    _isSkinOwned(key) {
        const k = key || 'defaultSkin';
        if (k === 'defaultSkin') return true;
        if (k === 'shinySkin') return true;

        if (isGiftSkinKey(k)) {
            const flag = getGiftFlag(k);
            return flag ? !!this.game[flag] : false;
        }

        return !!this.game.ownedSkins?.[k];
    }

    _isCosmeticOwned(slot, key) {
        const safeSlot = (slot && COSMETICS?.[slot]) ? slot : COSMETIC_SLOTS.HEAD;
        const k = key || 'none';
        if (k === 'none') return true;
        return !!this.game.ownedCosmetics?.[safeSlot]?.[k];
    }

    getCurrentCosmeticsChromaState() {
        return this.currentCosmeticsChroma || {};
    }

    setCurrentCosmeticsChromaState(state) {
        const safe = (state && typeof state === 'object') ? state : {};
        const out = {};
        for (const slot of Object.values(COSMETIC_SLOTS)) {
            const perSlot = safe[slot];
            out[slot] = (perSlot && typeof perSlot === 'object') ? { ...perSlot } : {};
        }
        this.currentCosmeticsChroma = out;
    }

    _getCosmeticChromaVariantId(slot, cosmeticKey) {
        return getCosmeticChromaVariantIdFromState(slot, cosmeticKey, this.currentCosmeticsChroma);
    }

    _getCosmeticChromaDeg(slot, cosmeticKey) {
        return getCosmeticChromaDegFromState(slot, cosmeticKey, this.currentCosmeticsChroma);
    }

    _setCosmeticChromaVariantId(slot, cosmeticKey, variantId) {
        const safeSlot = (slot && COSMETICS?.[slot]) ? slot : COSMETIC_SLOTS.HEAD;
        const key = cosmeticKey || 'none';
        if (key === 'none') return false;

        const cfg = getCosmeticChromaConfig(safeSlot, key);
        if (!cfg) return false;

        const resolved = resolveCosmeticChromaVariant(safeSlot, key, variantId);
        if (!resolved) return false;

        if (!this.currentCosmeticsChroma || typeof this.currentCosmeticsChroma !== 'object') {
            this.currentCosmeticsChroma = {};
        }
        if (!this.currentCosmeticsChroma[safeSlot] || typeof this.currentCosmeticsChroma[safeSlot] !== 'object') {
            this.currentCosmeticsChroma[safeSlot] = {};
        }
        this.currentCosmeticsChroma[safeSlot][key] = resolved.id;
        return true;
    }

    _cycleSelectedCosmeticChroma(dir = 1) {
        const tab = this._getActiveTab();
        if (!tab || tab.kind !== 'cosmetic') return false;

        const keys = this._getActiveKeysForTab(tab);
        const idx = this.selectedOption ?? 0;
        if (idx < 0 || idx >= keys.length) return false;

        const key = keys[idx];
        if (!key || key === 'none') return false;

        const item = this._getItemDef(tab, key);
        if (!item) return false;
        if (!this._isItemOwned(item)) return false;

        const cfg = getCosmeticChromaConfig(tab.slot, key);
        if (!cfg || !Array.isArray(cfg.variants) || cfg.variants.length <= 1) return false;

        const currentId = this._getCosmeticChromaVariantId(tab.slot, key) || cfg.default || cfg.variants[0].id;
        let curIndex = cfg.variants.findIndex((v) => v?.id === currentId);
        if (curIndex < 0) curIndex = 0;

        const nextIndex = (curIndex + dir + cfg.variants.length) % cfg.variants.length;
        const nextId = cfg.variants[nextIndex].id;

        if (!this._setCosmeticChromaVariantId(tab.slot, key, nextId)) return false;

        this._save();
        this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
        return true;
    }

    _drawImageWithOptionalHue(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh, hueDeg) {
        if (!img) return;

        drawWithOptionalHue(ctx, { hueDeg }, () => {
            ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        });
    }

    _getItemDef(tab, key) {
        if (!tab) return null;

        if (tab.kind === 'skin') {
            const def = SKINS?.[key];
            if (!def) return null;

            const gift = isGiftSkinKey(key);

            return {
                kind: 'skin',
                slot: null,
                key,
                label: def.label ?? key,
                price: gift ? 0 : (Number.isFinite(def.price) ? def.price : 0),
                gift,
            };
        }

        const def = COSMETICS?.[tab.slot]?.[key];
        if (!def) return null;

        return {
            kind: 'cosmetic',
            slot: tab.slot,
            key,
            label: def.label ?? key,
            price: Number.isFinite(def.price) ? def.price : 0,
            gift: false,
        };
    }

    _isItemOwned(item) {
        if (!item) return true;
        return (item.kind === 'skin')
            ? this._isSkinOwned(item.key)
            : this._isCosmeticOwned(item.slot, item.key);
    }

    _markOwned(item) {
        if (!item) return;

        if (item.kind === 'skin') {
            if (item.gift) return;
            if (!this.game.ownedSkins || typeof this.game.ownedSkins !== 'object') this.game.ownedSkins = {};
            this.game.ownedSkins[item.key] = true;
            return;
        }

        if (!this.game.ownedCosmetics || typeof this.game.ownedCosmetics !== 'object') this.game.ownedCosmetics = {};
        if (!this.game.ownedCosmetics[item.slot] || typeof this.game.ownedCosmetics[item.slot] !== 'object') {
            this.game.ownedCosmetics[item.slot] = {};
        }
        this.game.ownedCosmetics[item.slot][item.key] = true;
    }

    _safeDeductCC(amount) {
        const price = Math.max(0, Math.floor(amount || 0));
        const current = Number.isFinite(this.game.creditCoins) ? Math.floor(this.game.creditCoins) : 0;
        this.game.creditCoins = Math.max(0, current - price);
    }

    _canAfford(item) {
        if (item?.kind === 'skin' && item?.gift) return false;
        const price = Math.max(0, Math.floor(item?.price || 0));
        const cc = Number.isFinite(this.game.creditCoins) ? Math.floor(this.game.creditCoins) : 0;
        return cc >= price;
    }

    _purchaseItem(item) {
        if (!item || this._isItemOwned(item)) return false;
        if (item.kind === 'skin' && item.gift) return false;
        if (!this._canAfford(item)) return false;

        const price = Math.max(0, Math.floor(item.price || 0));
        this._safeDeductCC(price);
        this._markOwned(item);
        this._save();

        this.game.audioHandler.menu.playSound('purchaseCompletedSound', false, true);
        return true;
    }

    // asset helpers
    _getCosmeticAsset(slot, key) {
        const img = getCosmeticElement(slot, key);
        if (img) return img;

        const def = COSMETICS?.[slot]?.[key];
        const id = def?.spriteId || def?.id || key;
        if (!id || typeof id !== 'string') return null;
        return document.getElementById(id);
    }

    _getSkinAsset(key) {
        const img = getSkinElement(key);
        if (img) return img;

        const def = SKINS?.[key];
        const id = def?.spriteId || def?.id || key;
        if (!id || typeof id !== 'string') return null;
        return document.getElementById(id);
    }

    _buildModalPreviewPose(item) {
        const safeItem = item || { kind: 'skin', key: 'defaultSkin' };

        if (safeItem.kind === 'skin') {
            const skinImg = this._getSkinAsset(safeItem.key) || this._getSkinAsset('defaultSkin');
            return { skinImg, overlays: [] };
        }

        const skinImg = this.currentSkin || this._getSkinAsset(this.currentSkinKey) || this._getSkinAsset('defaultSkin');
        const overlay = (safeItem.slot && safeItem.key && safeItem.key !== 'none')
            ? this._getCosmeticAsset(safeItem.slot, safeItem.key)
            : null;

        return { skinImg, overlays: overlay ? [overlay] : [] };
    }

    // persistence-facing helpers
    _refreshCosmeticCache() {
        for (const slot of Object.values(COSMETIC_SLOTS)) {
            if (!(slot in this.currentCosmeticEls)) continue;
            const key = this.currentCosmetics[slot] || 'none';
            this.currentCosmeticEls[slot] = (key === 'none') ? null : getCosmeticElement(slot, key);
        }
    }

    getCurrentSkinId() {
        const key = this.currentSkinKey || 'defaultSkin';
        const skinDef = SKINS?.[key];
        return skinDef?.spriteId || this.currentSkin?.id || 'defaultSkin';
    }

    getCurrentCosmeticKey(slot) {
        return (slot && this.currentCosmetics?.[slot]) ? this.currentCosmetics[slot] : 'none';
    }

    setCurrentSkinById(skinId) {
        const key =
            Object.keys(SKINS).find((k) => SKINS[k]?.spriteId === skinId) ||
            Object.keys(SKINS).find((k) => SKINS[k]?.id === skinId) ||
            (SKINS?.[skinId] ? skinId : null) ||
            'defaultSkin';

        this.setCurrentSkinByKey(key, { forceExact: true });
    }

    setCurrentCosmeticById(slot, cosmeticIdOrKey) {
        const safeSlot = (slot && COSMETICS?.[slot]) ? slot : COSMETIC_SLOTS.HEAD;

        let key = 'none';
        if (cosmeticIdOrKey && cosmeticIdOrKey !== 'none') {
            if (COSMETICS[safeSlot]?.[cosmeticIdOrKey]) {
                key = cosmeticIdOrKey;
            } else {
                key =
                    Object.keys(COSMETICS[safeSlot] || {}).find((k) => COSMETICS[safeSlot]?.[k]?.id === cosmeticIdOrKey) ||
                    'none';
            }
        }
        this.setCurrentCosmeticByKey(safeSlot, key);
    }

    setCurrentSkinByKey(skinKey, { forceExact = false } = {}) {
        const key = SKINS[skinKey] ? skinKey : 'defaultSkin';

        if (isGiftSkinKey(key) && !this._isSkinOwned(key)) {
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            return;
        }

        if (!forceExact && key === 'defaultSkin') {
            if (Math.random() < 0.9) {
                this.currentSkinKey = 'defaultSkin';
                this.currentSkin = getSkinElement('defaultSkin');
            } else {
                this.currentSkinKey = 'shinySkin';
                this.currentSkin = getSkinElement('shinySkin');
                this.game.audioHandler.menu.playSound('shinySkinRizzSound');
            }
        } else {
            this.currentSkinKey = key;
            this.currentSkin = getSkinElement(key);
        }

        this._syncSelectionToEquipped();
    }

    setCurrentCosmeticByKey(slot, cosmeticKey) {
        const safeSlot = (slot && COSMETICS?.[slot]) ? slot : COSMETIC_SLOTS.HEAD;
        const key = (cosmeticKey && COSMETICS[safeSlot]?.[cosmeticKey]) ? cosmeticKey : 'none';

        const prevKey = this.currentCosmetics?.[safeSlot] || 'none';

        // equip new
        this.currentCosmetics[safeSlot] = key;
        if (safeSlot in this.currentCosmeticEls) {
            this.currentCosmeticEls[safeSlot] = (key === 'none') ? null : getCosmeticElement(safeSlot, key);
        }

        if (prevKey !== 'none' && prevKey !== key) {
            if (this.currentCosmeticsChroma?.[safeSlot] && typeof this.currentCosmeticsChroma[safeSlot] === 'object') {
                delete this.currentCosmeticsChroma[safeSlot][prevKey];
                if (Object.keys(this.currentCosmeticsChroma[safeSlot]).length === 0) {
                    this.currentCosmeticsChroma[safeSlot] = {};
                }
            }
        }

        if (key !== 'none') {
            const cfg = getCosmeticChromaConfig(safeSlot, key);
            if (cfg) {
                const existing = this.currentCosmeticsChroma?.[safeSlot]?.[key] || null;
                const resolved = resolveCosmeticChromaVariant(safeSlot, key, existing);
                if (resolved) this._setCosmeticChromaVariantId(safeSlot, key, resolved.id);
            }
        }

        this._syncSelectionToEquipped();
    }

    _save() {
        if (this.game && typeof this.game.saveGameState === 'function') {
            this.game.saveGameState();
        }
    }

    // filter + tab / grid model
    _getActiveTab() {
        return this.tabs[this.activeTabIndex] || this.tabs[0];
    }

    _getFilterMode() {
        return this.filterModes[this.filterModeIndex] || 'All';
    }

    _setFilterModeIndex(index) {
        const next = Math.max(0, Math.min(index, this.filterModes.length - 1));
        if (next === this.filterModeIndex) return;

        this.filterModeIndex = next;

        const keys = this._getActiveKeysForTab(this._getActiveTab());
        const goBackIndex = keys.length;
        this.selectedOption = Math.max(0, Math.min(this.selectedOption ?? 0, goBackIndex));
        this._ensureSelectedVisible();

        this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
    }

    _getUnlockedGiftSkinKeys() {
        const out = [];
        for (const k of Object.keys(GIFT_SKIN_FLAGS)) {
            if (this._isSkinOwned(k)) out.push(k);
        }
        return out;
    }

    _getActiveKeysForTab(tab) {
        if (!tab) return [];
        const mode = this._getFilterMode();
        const src = Array.isArray(tab.keys) ? tab.keys.slice() : [];

        if (tab.kind === 'skin') {
            const gifts = this._getUnlockedGiftSkinKeys();
            for (const g of gifts) {
                if (!src.includes(g)) src.push(g);
            }
        }

        if (mode !== 'All') {
            const wantOwned = (mode === 'Owned');
            const out = [];

            for (const key of src) {
                const owned = (tab.kind === 'skin')
                    ? this._isSkinOwned(key)
                    : this._isCosmeticOwned(tab.slot, key);

                if (wantOwned ? owned : !owned) out.push(key);
            }

            return out;
        }

        const ownedKeys = [];
        const unownedKeys = [];

        for (const key of src) {
            const owned = (tab.kind === 'skin')
                ? this._isSkinOwned(key)
                : this._isCosmeticOwned(tab.slot, key);

            if (owned) ownedKeys.push(key);
            else unownedKeys.push(key);
        }

        return ownedKeys.concat(unownedKeys);
    }

    _getGoBackIndex() {
        const tab = this._getActiveTab();
        return this._getActiveKeysForTab(tab).length;
    }

    _buildLabelsForTab(tab) {
        if (!tab) return [];
        const keys = this._getActiveKeysForTab(tab);
        if (tab.kind === 'skin') return keys.map((k) => SKINS[k]?.label ?? k);
        return keys.map((k) => COSMETICS[tab.slot]?.[k]?.label ?? k);
    }

    _setActiveTab(index, { playSound = true } = {}) {
        const clamped = Math.max(0, Math.min(index, this.tabs.length - 1));
        if (clamped === this.activeTabIndex) return;

        this.activeTabIndex = clamped;

        const goBackIndex = this._getGoBackIndex();
        this.selectedOption = Math.max(0, Math.min(this.selectedOption, goBackIndex));

        this._syncSelectionToEquipped();
        this._ensureSelectedVisible();

        if (playSound) this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
    }

    _syncSelectionToEquipped() {
        const tab = this._getActiveTab();
        if (!tab) return;

        const mode = this._getFilterMode();
        if (mode !== 'All') return;

        const keys = this._getActiveKeysForTab(tab);

        if (tab.kind === 'skin') {
            const skinKeyForHighlight = (this.currentSkinKey === 'shinySkin') ? 'defaultSkin' : this.currentSkinKey;
            const idx = keys.indexOf(skinKeyForHighlight);
            if (idx >= 0) {
                this.selectedOption = idx;
                this._ensureSelectedVisible();
            }
            return;
        }

        const key = this.currentCosmetics[tab.slot] || 'none';
        const idx = keys.indexOf(key);
        if (idx >= 0) {
            this.selectedOption = idx;
            this._ensureSelectedVisible();
        }
    }

    // layout
    _getSidebarLayout() {
        const cfg = this.UI.sidebar;

        const sidebarX = Math.floor(this.game.width * cfg.xPct);
        const sidebarW = cfg.w;
        const tabH = cfg.tabH;
        const gap = cfg.gap;

        const bottomReserved = cfg.bottomReserved;
        const titleY = this.game.height / 2 - this.positionOffset;
        const contentTopMin = Math.floor(titleY + cfg.titleToContentPad);
        const contentBottom = this.game.height - bottomReserved;

        const totalTabsH = this.tabs.length * tabH + (this.tabs.length - 1) * gap;
        const idealTop = Math.floor((contentTopMin + contentBottom - totalTabsH) / 2);
        const sidebarTopY = Math.max(contentTopMin, idealTop);

        const contentLeftX = sidebarX + sidebarW + cfg.contentGap;
        const contentRightPad = Math.floor(this.game.width * 0.05);

        return {
            sidebarX,
            sidebarW,
            sidebarTopY,
            tabW: sidebarW,
            tabH,
            gap,
            contentLeftX,
            contentRightPad,
            bottomReserved,
        };
    }

    _getGoBackLayout() {
        const cfg = this.UI.goBack;
        const x = this.game.width - cfg.margin;
        const y = this.game.height - cfg.margin;
        return { x, y, w: cfg.w, h: cfg.h };
    }

    _getGridLayout() {
        const tab = this._getActiveTab();
        const itemCount = this._getActiveKeysForTab(tab).length;

        const sidebar = this._getSidebarLayout();

        const gridTopY = sidebar.sidebarTopY + 34;
        const gridBottomY = this.game.height - sidebar.bottomReserved;
        const gridH = Math.max(220, gridBottomY - gridTopY);

        const gap = this.gridGap;
        const usableW = Math.max(220, this.game.width - sidebar.contentLeftX - sidebar.contentRightPad);

        const minCard = this.gridMinCardSize;
        const maxColsByMin = Math.max(1, Math.floor((usableW + gap) / (minCard + gap)));
        const cols = Math.max(1, Math.min(this.gridTargetCols, maxColsByMin));

        const rawCardW = Math.floor((usableW - gap * (cols - 1)) / cols);
        const card = Math.max(this.gridMinCardSize, Math.min(rawCardW, this.gridMaxCardSize));

        const rows = Math.max(1, Math.ceil(itemCount / cols));

        const step = card + gap;
        const contentH = rows * step - gap;

        let maxScroll = Math.max(0, contentH - gridH);
        if (maxScroll < 12) maxScroll = 0;

        const gridW = cols * card + (cols - 1) * gap;
        const gridLeftX = Math.floor(sidebar.contentLeftX + this.gridLeftOffset);

        return { gridTopY, gridH, gridLeftX, card, gap, cols, rows, itemCount, maxScroll, gridW, contentH, step };
    }

    _ensureSelectedVisible() {
        const tabIndex = this.activeTabIndex;
        const layout = this._getGridLayout();
        const goBackIndex = this._getGoBackIndex();

        if (this.selectedOption === goBackIndex) return;

        const step = layout.card + layout.gap;
        const row = Math.floor((this.selectedOption ?? 0) / layout.cols);

        const rowTop = row * step;
        const rowBottom = rowTop + layout.card;

        let scroll = this.targetScrollYByTab[tabIndex] || 0;

        const PAD = 10;
        const viewTop = scroll + PAD;
        const viewBottom = scroll + layout.gridH - PAD;

        let desired = scroll;

        if (rowTop < viewTop) desired = rowTop - PAD;
        else if (rowBottom > viewBottom) desired = rowBottom - layout.gridH + PAD;
        else return;

        desired = Math.max(0, Math.min(desired, layout.maxScroll));
        desired = Math.round(desired / step) * step;
        desired = Math.max(0, Math.min(desired, layout.maxScroll));
        if (layout.maxScroll < 12) desired = 0;

        this.targetScrollYByTab[tabIndex] = desired;
    }

    _gridBounds() {
        const layout = this._getGridLayout();
        const padRightForBar = 18 + this.barWidth;
        const w = Math.min(this.game.width, layout.gridW + padRightForBar);
        return { x: layout.gridLeftX, y: layout.gridTopY, w, h: layout.gridH };
    }

    // filter dropdown layout + hit testing
    _getFilterButtonRect(ctx) {
        const cfg = this.UI.filterDropdown;
        const sidebar = this._getSidebarLayout();
        const grid = this._getGridLayout();

        const label = `Filter: ${this._getFilterMode()}`;

        ctx.save();
        ctx.font = cfg.font;
        const textW = Math.ceil(ctx.measureText(label).width);
        ctx.restore();

        const w = Math.max(cfg.minW, textW + cfg.padLeft + cfg.padRightForCaret);
        const h = cfg.h;

        const x = Math.max(sidebar.contentLeftX, grid.gridLeftX);
        const y = Math.max(cfg.minTopY, grid.gridTopY - h - cfg.aboveGridGap);

        return { x, y, w, h };
    }

    _getFilterMenuRect(ctx) {
        const cfg = this.UI.filterDropdown;
        const btn = this._getFilterButtonRect(ctx);

        const optionCount = this.filterModes.length;
        const w = btn.w;
        const h = optionCount * cfg.optionH + 10;

        const x = btn.x;
        const y = btn.y + btn.h + 8;

        return { x, y, w, h };
    }

    _hitTestFilterButton(ctx, mx, my) {
        return this._hitTestRect(mx, my, this._getFilterButtonRect(ctx));
    }

    _hitTestFilterOption(ctx, mx, my) {
        if (!this.filterOpen) return -1;

        const cfg = this.UI.filterDropdown;
        const menu = this._getFilterMenuRect(ctx);

        if (!this._hitTestRect(mx, my, menu)) return -1;

        const innerX = menu.x + 5;
        const innerY = menu.y + 5;
        const innerW = menu.w - 10;
        const innerH = menu.h - 10;

        if (mx < innerX || mx > innerX + innerW || my < innerY || my > innerY + innerH) return -1;

        const idx = Math.floor((my - innerY) / cfg.optionH);
        if (idx < 0 || idx >= this.filterModes.length) return -1;
        return idx;
    }

    _closeFilterDropdown() {
        this.filterOpen = false;
        this.filterHoverIndex = -1;
        this.filterHoverBtn = false;
    }

    // modal navigation
    _getModalBrowseList() {
        const tab = this._getActiveTab();
        if (!tab) return { tab: null, keys: [] };

        if (!this.modal || this.modal.type !== 'preview') return { tab, keys: [] };

        const currentItem = this.modal.item;
        const currentOwned = this._isItemOwned(currentItem);
        if (currentOwned) return { tab, keys: [] };

        const ordered = this._getActiveKeysForTab(tab);
        const unownedOnly = [];

        for (const k of ordered) {
            const it = this._getItemDef(tab, k);
            if (!it) continue;
            if (!this._isItemOwned(it)) unownedOnly.push(k);
        }

        return { tab, keys: unownedOnly };
    }

    _modalCanBrowse() {
        if (!this.modal || this.modal.type !== 'preview') return false;
        const { keys } = this._getModalBrowseList();
        return keys.length > 1;
    }

    _modalNavigate(dir) {
        if (!this.modal || this.modal.type !== 'preview') return false;

        const { tab, keys } = this._getModalBrowseList();
        if (!tab || keys.length <= 1) return false;

        const curKey = this.modal?.item?.key;
        let idx = keys.indexOf(curKey);
        if (idx < 0) idx = 0;

        const next = (idx + dir + keys.length) % keys.length;
        const nextKey = keys[next];
        const nextItem = this._getItemDef(tab, nextKey);
        if (!nextItem) return false;

        const fullKeys = this._getActiveKeysForTab(tab);
        const fullIdx = fullKeys.indexOf(nextKey);
        if (fullIdx >= 0) {
            this.selectedOption = fullIdx;
            this._ensureSelectedVisible();
        }

        this._openPreviewModal(nextItem);

        this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
        return true;
    }

    _getModalNavRects() {
        const panel = this._getModalPanelRect();
        const ncfg = this.UI.modal.nav;

        const s = ncfg.size;
        const y = Math.floor(panel.y + panel.h / 2 - s / 2);

        const left = {
            x: Math.floor(panel.x - ncfg.gapFromPanel - s),
            y,
            w: s,
            h: s,
        };

        const right = {
            x: Math.floor(panel.x + panel.w + ncfg.gapFromPanel),
            y,
            w: s,
            h: s,
        };

        return { left, right };
    }

    _hitTestModalNav(mx, my) {
        if (!this._modalCanBrowse()) return { left: false, right: false };
        const { left, right } = this._getModalNavRects();
        return {
            left: this._hitTestRect(mx, my, left),
            right: this._hitTestRect(mx, my, right),
        };
    }

    // modal control
    _openPreviewModal(item) {
        if (!item) return;

        const owned = this._isItemOwned(item);
        const isGiftLocked = (item.kind === 'skin' && item.gift && !owned);
        const afford = isGiftLocked ? false : this._canAfford(item);

        this.modal = {
            type: 'preview',
            item,
            focusIndex: (!owned && !afford) ? 1 : 0,
            hoverClose: false,
            hoverNavLeft: false,
            hoverNavRight: false,

            previewChromaVariantId: null,
        };

        if (!owned && item.kind === 'cosmetic' && item.key !== 'none') {
            const ccfg = getCosmeticChromaConfig(item.slot, item.key);
            if (ccfg && Array.isArray(ccfg.variants) && ccfg.variants.length > 1) {
                const resolved = resolveCosmeticChromaVariant(item.slot, item.key, ccfg.default);
                this.modal.previewChromaVariantId = resolved?.id || ccfg.variants[0]?.id || null;
            }
        }
    }

    _openConfirmModal(item) {
        if (!item) return;
        if (item.kind === 'skin' && item.gift) return;

        this.modal = {
            type: 'confirm',
            item,
            focusIndex: 0,
            hoverClose: false,
            hoverNavLeft: false,
            hoverNavRight: false,
        };
    }

    _closeModal() {
        this.modal = null;
    }

    _handleModalKeyDown(event) {
        if (!this.modal) return false;

        if (event.key === 'Escape') {
            this._closeModal();
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            return true;
        }

        if (this.modal.type === 'preview') {
            const item = this.modal.item;

            if (event.key === 'ArrowLeft') {
                if (this._modalNavigate(-1)) return true;
            }
            if (event.key === 'ArrowRight') {
                if (this._modalNavigate(1)) return true;
            }

            const btns = this._getModalButtons();
            const btnCount = btns.length;

            const moveFocus = (dir) => {
                if (btnCount <= 1) return;

                let next = this.modal.focusIndex;
                for (let tries = 0; tries < btnCount; tries++) {
                    next = (next + dir + btnCount) % btnCount;
                    if (!btns[next]?.disabled) {
                        this.modal.focusIndex = next;
                        break;
                    }
                }
            };

            if (event.key === 'ArrowUp') {
                moveFocus(-1);
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                return true;
            }

            if (event.key === 'ArrowDown') {
                moveFocus(1);
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                return true;
            }

            if (event.key === 'Enter') {
                const focused = btns[this.modal.focusIndex];
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);

                if (focused?.disabled) return true;

                if (focused?.action === 'buy') {
                    this._openConfirmModal(item);
                    return true;
                }

                this._closeModal();
                return true;
            }

            return true;
        }

        if (this.modal.type === 'confirm') {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                this.modal.focusIndex = (this.modal.focusIndex === 0) ? 1 : 0;
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                return true;
            }

            if (event.key === 'Enter') {
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);

                if (this.modal.focusIndex === 1) {
                    this._closeModal();
                    return true;
                }

                const item = this.modal.item;

                if (!this._purchaseItem(item)) {
                    this._closeModal();
                    return true;
                }

                this._closeModal();
                return true;
            }

            return true;
        }

        return true;
    }

    _handleModalMouseMove(event) {
        if (!this.modal) return false;

        const { mouseX, mouseY } = this._canvasMouse(event);

        const close = this._getModalCloseRect();
        const inClose = mouseX >= close.x && mouseX <= close.x + close.w && mouseY >= close.y && mouseY <= close.y + close.h;

        const prevClose = !!this.modal.hoverClose;
        this.modal.hoverClose = inClose;

        const prevNavL = !!this.modal.hoverNavLeft;
        const prevNavR = !!this.modal.hoverNavRight;
        this.modal.hoverNavLeft = false;
        this.modal.hoverNavRight = false;

        if (this.modal.type === 'preview' && this._modalCanBrowse()) {
            const hit = this._hitTestModalNav(mouseX, mouseY);
            this.modal.hoverNavLeft = hit.left;
            this.modal.hoverNavRight = hit.right;

            if ((hit.left && !prevNavL) || (hit.right && !prevNavR)) {
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                return true;
            }
        }

        const btns = this._getModalButtons();
        let hoveredBtnIndex = -1;

        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            if (b.disabled) continue;

            const inBtn = mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h;
            if (inBtn) {
                hoveredBtnIndex = i;
                break;
            }
        }

        if (hoveredBtnIndex >= 0 && this.modal.focusIndex !== hoveredBtnIndex) {
            this.modal.focusIndex = hoveredBtnIndex;
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            return true;
        }

        if (inClose && !prevClose) {
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            return true;
        }

        return true;
    }

    _handleModalMouseClick(event) {
        if (!this.modal) return false;

        const { mouseX, mouseY } = this._canvasMouse(event);

        if (this._tryClickModalChromaSwatch(mouseX, mouseY)) return true;

        if (this.modal.type === 'preview' && this._modalCanBrowse()) {
            const hit = this._hitTestModalNav(mouseX, mouseY);
            if (hit.left) {
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
                this._modalNavigate(-1);
                return true;
            }
            if (hit.right) {
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
                this._modalNavigate(1);
                return true;
            }
        }

        const panel = this._getModalPanelRect();
        const insidePanel =
            mouseX >= panel.x &&
            mouseX <= panel.x + panel.w &&
            mouseY >= panel.y &&
            mouseY <= panel.y + panel.h;

        const close = this._getModalCloseRect();
        const inClose = mouseX >= close.x && mouseX <= close.x + close.w && mouseY >= close.y && mouseY <= close.y + close.h;

        if (inClose) {
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            this._closeModal();
            return true;
        }

        if (!insidePanel) {
            this._closeModal();
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            return true;
        }

        const btns = this._getModalButtons();
        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            const inBtn = mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h;
            if (!inBtn) continue;

            if (b.disabled) return true;

            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);

            if (this.modal.type === 'preview') {
                if (b.action === 'buy') this._openConfirmModal(this.modal.item);
                else this._closeModal();
                return true;
            }

            if (this.modal.type === 'confirm') {
                if (b.action === 'no') {
                    this._closeModal();
                    return true;
                }

                const item = this.modal.item;
                this._purchaseItem(item);
                this._closeModal();
                return true;
            }
        }

        return true;
    }

    _getModalPanelRect() {
        const cfg = this.UI.modal;
        const w = Math.min(cfg.w, Math.floor(this.game.width * 0.86));
        const h = Math.min(cfg.h, Math.floor(this.game.height * 0.72));
        const x = Math.floor((this.game.width - w) / 2);
        const y = Math.floor((this.game.height - h) / 2);
        return { x, y, w, h };
    }

    _getModalCloseRect() {
        const cfg = this.UI.modal;
        const panel = this._getModalPanelRect();
        const s = cfg.close.size;
        const x = Math.floor(panel.x + panel.w - cfg.pad - s);
        const y = Math.floor(panel.y + cfg.pad - 2);
        return { x, y, w: s, h: s };
    }

    _getModalButtons() {
        if (!this.modal) return [];

        const panel = this._getModalPanelRect();
        const cfg = this.UI.modal;

        const btnW = cfg.btnW;
        const btnH = cfg.btnH;
        const gap = cfg.btnGap;

        const y = panel.y + panel.h - 26 - btnH;

        if (this.modal.type === 'preview') {
            const item = this.modal.item;
            const owned = this._isItemOwned(item);

            if (item.kind === 'skin' && item.gift) {
                const x = panel.x + panel.w - 26 - btnW;
                return [{ x, y, w: btnW, h: btnH, label: 'Close', action: 'close', disabled: false }];
            }

            if (owned) {
                const x = panel.x + panel.w - 26 - btnW;
                return [{ x, y, w: btnW, h: btnH, label: 'Close', action: 'close', disabled: false }];
            }

            const afford = this._canAfford(item);

            const x2 = panel.x + panel.w - 26 - btnW;
            const x1 = x2 - gap - btnW;

            return [
                { x: x1, y, w: btnW, h: btnH, label: 'Buy', action: 'buy', disabled: !afford },
                { x: x2, y, w: btnW, h: btnH, label: 'Close', action: 'close', disabled: false },
            ];
        }

        if (this.modal.type === 'confirm') {
            const x2 = panel.x + panel.w - 26 - btnW;
            const x1 = x2 - gap - btnW;
            return [
                { x: x1, y, w: btnW, h: btnH, label: 'Yes', action: 'yes', disabled: false },
                { x: x2, y, w: btnW, h: btnH, label: 'No', action: 'no', disabled: false },
            ];
        }

        return [];
    }

    // selection actions
    _selectCurrent() {
        const tab = this._getActiveTab();
        const keys = this._getActiveKeysForTab(tab);
        const goBackIndex = keys.length;
        const idx = this.selectedOption ?? 0;

        if (idx === goBackIndex) return this.onGoBack();
        if (!tab || idx < 0 || idx >= keys.length) return;

        const key = keys[idx];
        const item = this._getItemDef(tab, key);
        if (!item) return;

        if (item.kind === 'skin' && item.gift && !this._isSkinOwned(item.key)) {
            this._openPreviewModal(item);
            return;
        }

        if (!this._isItemOwned(item)) {
            this._openPreviewModal(item);
            return;
        }

        if (tab.kind === 'skin') this.setCurrentSkinByKey(key);
        else this.setCurrentCosmeticByKey(tab.slot, key);

        this._save();
    }

    _isHighlightedItemEquipped() {
        const tab = this._getActiveTab();
        if (!tab) return false;

        const keys = this._getActiveKeysForTab(tab);
        const idx = this.selectedOption ?? 0;
        if (idx < 0 || idx >= keys.length) return false;

        const key = keys[idx];

        if (tab.kind === 'skin') {
            const equipped = (this.currentSkinKey === 'shinySkin') ? 'defaultSkin' : (this.currentSkinKey || 'defaultSkin');
            return key === equipped;
        }

        const equippedKey = this.currentCosmetics?.[tab.slot] ?? 'none';
        return key === equippedKey;
    }

    _tryEnterCycleChromaOnEquippedSelection() {
        const tab = this._getActiveTab();
        if (!tab || tab.kind !== 'cosmetic') return false;

        const keys = this._getActiveKeysForTab(tab);
        const idx = this.selectedOption ?? 0;
        if (idx < 0 || idx >= keys.length) return false;

        const key = keys[idx];
        if (!key || key === 'none') return false;

        if (!this._isCosmeticOwned(tab.slot, key)) return false;

        const equippedKey = this.currentCosmetics?.[tab.slot] ?? 'none';
        if (equippedKey !== key) return false;

        const cfg = getCosmeticChromaConfig(tab.slot, key);
        if (!cfg || !Array.isArray(cfg.variants) || cfg.variants.length <= 1) return false;

        return this._cycleSelectedCosmeticChroma(1);
    }

    onGoBack() {
        this.game.menu.main.activateMenu(1);
    }

    // update
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

        if (isRealMenuScreen) this.game.audioHandler.menu.playSound('soundtrack');
        else this.game.audioHandler.menu.stopSound('soundtrack');

        if (this.menuActive) this._advancePreview(deltaTime);

        if (this.menuActive) {
            const tabIndex = this.activeTabIndex;
            const layout = this._getGridLayout();
            this.scrollMaxByTab[tabIndex] = layout.maxScroll;

            this.targetScrollYByTab[tabIndex] = Math.max(0, Math.min(this.targetScrollYByTab[tabIndex] || 0, layout.maxScroll));

            const cur = this.scrollYByTab[tabIndex] || 0;
            const next = cur + ((this.targetScrollYByTab[tabIndex] || 0) - cur) * this.scrollEase;
            this.scrollYByTab[tabIndex] = (layout.maxScroll < 12) ? 0 : Math.max(0, Math.min(next, layout.maxScroll));
        }
    }

    // input
    _isInteractive() {
        return this.menuActive && this.game.canSelect && this.game.canSelectForestMap;
    }

    _canvasMouse(event) {
        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;
        return {
            mouseX: (event.clientX - rect.left) * scaleX,
            mouseY: (event.clientY - rect.top) * scaleY,
        };
    }

    handleKeyDown(event) {
        if (!this._isInteractive()) return;

        if (this.modal) {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
            }

            this._handleModalKeyDown(event);
            return;
        }

        if (this.filterOpen && event.key === 'Escape') {
            this._closeFilterDropdown();
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            return;
        }

        const tab = this._getActiveTab();
        const keys = this._getActiveKeysForTab(tab);
        const goBackIndex = keys.length;
        const maxIndex = goBackIndex;

        if (event.key === 'ArrowUp') {
            this._setActiveTab(this.activeTabIndex - 1);
            return;
        }
        if (event.key === 'ArrowDown') {
            this._setActiveTab(this.activeTabIndex + 1);
            return;
        }

        const wrap = (i) => {
            const n = maxIndex + 1;
            return (i + n) % n;
        };

        if (event.key === 'ArrowLeft') {
            this.selectedOption = wrap((this.selectedOption ?? 0) - 1);
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            this._ensureSelectedVisible();
            return;
        }

        if (event.key === 'ArrowRight') {
            this.selectedOption = wrap((this.selectedOption ?? 0) + 1);
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            this._ensureSelectedVisible();
            return;
        }

        if (event.key === 'Enter') {
            if (this._tryEnterCycleChromaOnEquippedSelection()) return;

            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            this._selectCurrent();
            return;
        }

        if (event.key === 'Escape') {
            this.game.input.handleEscapeKey();
            return;
        }
    }

    handleRightClick(event) {
        if (!this._isInteractive()) return;
        event.preventDefault();

        this.draggingBar = false;

        if (this.modal) {
            this._closeModal();
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            return;
        }

        if (this.filterOpen) {
            this._closeFilterDropdown();
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            return;
        }

        this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
        this.game.input.handleEscapeKey();
    }

    handleMouseWheel(event) {
        if (!this._isInteractive()) return;
        if (this.modal) return;
        if (this.filterOpen) return;

        const { mouseX, mouseY } = this._canvasMouse(event);

        const layout = this._getGridLayout();
        const tabIndex = this.activeTabIndex;

        const gridW = (layout.cols * layout.card + (layout.cols - 1) * layout.gap);
        const overGridY = mouseY >= layout.gridTopY && mouseY <= layout.gridTopY + layout.gridH;
        const overGridX = mouseX >= layout.gridLeftX && mouseX <= layout.gridLeftX + gridW + (this.barWidth + 20);

        if (!overGridX || !overGridY) return;
        if (layout.maxScroll <= 0) return;

        const step = (event.deltaY > 0 ? 1 : -1) * 120;
        const next = (this.targetScrollYByTab[tabIndex] || 0) + step;
        this.targetScrollYByTab[tabIndex] = Math.max(0, Math.min(next, layout.maxScroll));
    }

    handleMouseDown(event) {
        if (!this._isInteractive()) return;
        if (this.modal) return;
        if (this.filterOpen) return;

        const { mouseX, mouseY } = this._canvasMouse(event);

        if (this.barRect) {
            const { x, y, w, h, thumbY, thumbH } = this.barRect;

            if (mouseX >= x && mouseX <= x + w && mouseY >= thumbY && mouseY <= thumbY + thumbH) {
                this.draggingBar = true;
                this.dragStartMouseY = mouseY;
                this.dragStartScrollY = this.scrollYByTab[this.activeTabIndex] || 0;
                return;
            }

            if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) {
                const travel = h - thumbH;
                const t = (mouseY - y - thumbH / 2) / Math.max(1, travel);
                const clamped = Math.max(0, Math.min(1, t));
                this.targetScrollYByTab[this.activeTabIndex] = clamped * (this.scrollMaxByTab[this.activeTabIndex] || 0);
                return;
            }
        }
    }

    handleMouseUp() {
        this.draggingBar = false;
    }

    _updateScrollFromThumb(mouseY) {
        if (!this.barRect) return;

        const tabIndex = this.activeTabIndex;
        const { y, h, thumbH } = this.barRect;

        const travel = h - thumbH;
        let t = (mouseY - y - thumbH / 2) / Math.max(1, travel);
        t = Math.max(0, Math.min(1, t));

        this.targetScrollYByTab[tabIndex] = t * (this.scrollMaxByTab[tabIndex] || 0);
    }

    handleMouseMove(event) {
        if (!this._isInteractive()) return;

        const { mouseX, mouseY } = this._canvasMouse(event);

        if (this.draggingBar) {
            this._updateScrollFromThumb(mouseY);
            return;
        }

        if (this.modal) {
            this._handleModalMouseMove(event);
            return;
        }

        const ctx = this._getUiCtx();

        if (ctx) {
            const btnHovered = this._hitTestFilterButton(ctx, mouseX, mouseY);
            if (btnHovered !== this.filterHoverBtn) {
                this.filterHoverBtn = btnHovered;
                if (btnHovered) this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            }

            if (this.filterOpen) {
                const opt = this._hitTestFilterOption(ctx, mouseX, mouseY);
                if (opt !== this.filterHoverIndex) {
                    this.filterHoverIndex = opt;
                    if (opt >= 0) this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                }

                if (btnHovered || opt >= 0) return;
            }
        }

        const gb = this._getGoBackLayout();
        const tab = this._getActiveTab();
        const keys = this._getActiveKeysForTab(tab);
        const goBackIndex = keys.length;

        const inGoBack =
            mouseX >= (gb.x - gb.w) &&
            mouseX <= gb.x &&
            mouseY >= (gb.y - gb.h) &&
            mouseY <= gb.y;

        if (inGoBack) {
            if (this.selectedOption !== goBackIndex) {
                this.selectedOption = goBackIndex;
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            }
            return;
        }

        const labels = this._buildLabelsForTab(tab);
        const layout = this._getGridLayout();
        const scroll = this.scrollYByTab[this.activeTabIndex] || 0;

        const localX = mouseX - layout.gridLeftX;
        const localY = mouseY - layout.gridTopY + scroll;

        if (localX < 0 || localY < 0) return;

        const step = layout.card + layout.gap;
        const col = Math.floor(localX / step);
        const row = Math.floor(localY / step);

        if (col < 0 || col >= layout.cols || row < 0) return;

        const idx = row * layout.cols + col;
        if (idx < 0 || idx >= labels.length) return;

        if (idx !== this.selectedOption) {
            this.selectedOption = idx;
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            this._ensureSelectedVisible();
        }
    }

    handleMouseClick(event) {
        if (!this._isInteractive()) return;

        if (this.modal) {
            this._handleModalMouseClick(event);
            return;
        }

        const { mouseX, mouseY } = this._canvasMouse(event);
        const ctx = this._getUiCtx();

        if (this._tryClickChromaSwatch(mouseX, mouseY)) return;

        if (ctx) {
            const btnRect = this._getFilterButtonRect(ctx);
            const menuRect = this._getFilterMenuRect(ctx);

            const hitBtn = this._hitTestRect(mouseX, mouseY, btnRect);
            const hitOpt = this.filterOpen ? this._hitTestFilterOption(ctx, mouseX, mouseY) : -1;
            const hitMenu = this.filterOpen ? this._hitTestRect(mouseX, mouseY, menuRect) : false;

            if (hitBtn) {
                this.filterOpen = !this.filterOpen;
                this.filterHoverIndex = -1;
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
                return;
            }

            if (this.filterOpen && hitOpt >= 0) {
                this._setFilterModeIndex(hitOpt);
                this._closeFilterDropdown();
                return;
            }

            if (this.filterOpen && !hitMenu) {
                this._closeFilterDropdown();
            }
        }

        const s = this._getSidebarLayout();
        const tabX = s.sidebarX + this.UI.sidebar.tabOffsetX;
        const tabW = s.tabW;

        for (let i = 0; i < this.tabs.length; i++) {
            const y = s.sidebarTopY + i * (s.tabH + s.gap);
            const inTab = mouseX >= tabX && mouseX <= tabX + tabW && mouseY >= y && mouseY <= y + s.tabH;
            if (inTab) {
                this._setActiveTab(i);
                return;
            }
        }

        const gb = this._getGoBackLayout();
        const inGoBack =
            mouseX >= (gb.x - gb.w) &&
            mouseX <= gb.x &&
            mouseY >= (gb.y - gb.h) &&
            mouseY <= gb.y;

        if (inGoBack) {
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            this.onGoBack();
            return;
        }

        const tab = this._getActiveTab();
        const keys = this._getActiveKeysForTab(tab);
        const labels = this._buildLabelsForTab(tab);
        const layout = this._getGridLayout();
        const scroll = this.scrollYByTab[this.activeTabIndex] || 0;

        const localX = mouseX - layout.gridLeftX;
        const localY = mouseY - layout.gridTopY + scroll;

        if (localX < 0 || localY < 0) return;

        const step = layout.card + layout.gap;
        const col = Math.floor(localX / step);
        const row = Math.floor(localY / step);

        if (col < 0 || col >= layout.cols || row < 0) return;

        const idx = row * layout.cols + col;
        if (idx < 0 || idx >= labels.length) return;
        if (idx < 0 || idx >= keys.length) return;

        this.selectedOption = idx;
        this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
        this._selectCurrent();
    }

    // draw
    draw(context) {
        if (!this.menuActive) return;

        this._uiCtx = context;

        this._clearChromaHitboxes();
        this._clearModalChromaHitboxes();

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

        context.font = this.UI.title.font;
        context.fillStyle = 'white';
        context.shadowColor = 'black';
        context.shadowOffsetX = this.UI.title.shadowX;
        context.shadowOffsetY = this.UI.title.shadowY;
        context.textAlign = 'center';

        const titleY = (this.game.height / 2 - this.positionOffset) - 30;
        context.fillText(this.title, this.centerX, titleY);

        this._drawTabs(context);
        this._drawCreditCoins(context);

        this._drawActiveGrid(context);
        this._drawGoBackText(context);
        this._drawAnimatedPreview(context);

        this._drawFilterDropdown(context);

        if (this.modal) this._drawModal(context);

        context.restore();
    }

    _drawCreditCoins(ctx) {
        const cfg = this.UI.ccDisplay;
        const cc = Math.max(0, Math.floor(this.game.creditCoins || 0));

        const x = this.game.width - cfg.rightPad;
        const y = cfg.topPad;

        ctx.save();
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';

        if (cfg.shadow) {
            ctx.shadowColor = 'rgba(0,0,0,0.65)';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        ctx.font = cfg.labelFont;
        ctx.fillStyle = cfg.labelFill;
        ctx.fillText('Credit Coins', x, y);

        const MAX_CC = 999;
        const isMaxed = cc >= MAX_CC;

        ctx.font = cfg.valueFont;
        ctx.fillStyle = isMaxed ? 'rgba(255,120,120,0.95)' : cfg.valueFill;
        ctx.fillText(`${cc} cc`, x, y + 18);

        ctx.restore();
    }

    _drawFilterDropdown(ctx) {
        const cfg = this.UI.filterDropdown;

        const btn = this._getFilterButtonRect(ctx);
        const label = `Filter: ${this._getFilterMode()}`;

        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        const hovered = !!this.filterHoverBtn;

        ctx.fillStyle = hovered ? cfg.btnFillHover : cfg.btnFill;
        ctx.strokeStyle = hovered ? cfg.btnStrokeHover : cfg.btnStroke;
        ctx.lineWidth = 2;

        this._roundRect(ctx, btn.x, btn.y, btn.w, btn.h, cfg.radius);
        if (cfg.btnFill !== 'rgba(0,0,0,0.00)' || hovered) ctx.fill();
        ctx.stroke();

        ctx.font = cfg.font;
        ctx.fillStyle = cfg.fg;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, btn.x + cfg.padLeft, btn.y + btn.h / 2);

        const cx = btn.x + btn.w - 18;
        const cy = btn.y + btn.h / 2 + 1;
        ctx.fillStyle = cfg.caretFill;
        ctx.beginPath();
        if (this.filterOpen) {
            ctx.moveTo(cx - 6, cy + 3);
            ctx.lineTo(cx + 6, cy + 3);
            ctx.lineTo(cx, cy - 5);
        } else {
            ctx.moveTo(cx - 6, cy - 3);
            ctx.lineTo(cx + 6, cy - 3);
            ctx.lineTo(cx, cy + 5);
        }
        ctx.closePath();
        ctx.fill();

        if (this.filterOpen) {
            const menu = this._getFilterMenuRect(ctx);

            const prevAlpha = ctx.globalAlpha;
            ctx.globalAlpha = 1;

            ctx.fillStyle = cfg.menuFill;
            ctx.strokeStyle = cfg.menuStroke;
            ctx.lineWidth = 2;
            this._roundRect(ctx, menu.x, menu.y, menu.w, menu.h, cfg.radius);
            ctx.fill();
            ctx.stroke();

            const innerX = menu.x + 5;
            let y = menu.y + 5;

            for (let i = 0; i < this.filterModes.length; i++) {
                const isHover = i === this.filterHoverIndex;
                const isActive = i === this.filterModeIndex;

                if (isHover) {
                    ctx.fillStyle = cfg.optionFillHover;
                    this._roundRect(ctx, innerX, y, menu.w - 10, cfg.optionH, 8);
                    ctx.fill();
                }

                ctx.font = '16px Arial';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = isActive ? cfg.optionFgActive : cfg.optionFg;
                ctx.fillText(this.filterModes[i], innerX + cfg.optionPadX, y + cfg.optionH / 2);

                y += cfg.optionH;
            }

            ctx.globalAlpha = prevAlpha;
        }

        ctx.restore();
    }

    _drawTabs(context) {
        const s = this._getSidebarLayout();
        const cfg = this.UI.tabs;

        context.save();
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.textBaseline = 'middle';

        for (let i = 0; i < this.tabs.length; i++) {
            const isActive = i === this.activeTabIndex;

            const x = s.sidebarX + this.UI.sidebar.tabOffsetX;
            const y = s.sidebarTopY + i * (s.tabH + s.gap);

            context.fillStyle = cfg.bgFill;
            this._roundRect(context, x, y, s.tabW, s.tabH, cfg.bgRadius);
            context.fill();

            if (isActive) {
                context.fillStyle = cfg.activeBarFill;
                this._roundRect(
                    context,
                    x + cfg.activeBar.xPad,
                    y + cfg.activeBar.yPad,
                    cfg.activeBar.w,
                    s.tabH - cfg.activeBar.yPad * 2,
                    cfg.activeBar.r
                );
                context.fill();
            }

            context.font = isActive ? `bold ${cfg.fontActive}px Arial` : `${cfg.fontInactive}px Arial`;
            context.fillStyle = isActive ? 'yellow' : 'white';
            context.textAlign = 'left';
            context.fillText(this.tabs[i].title, x + cfg.padLeft, y + Math.floor(s.tabH / 2));
        }

        context.restore();
    }

    _drawActiveGrid(context) {
        const tab = this._getActiveTab();
        const keys = this._getActiveKeysForTab(tab);
        const labels = this._buildLabelsForTab(tab);

        const layout = this._getGridLayout();
        const tabIndex = this.activeTabIndex;

        this.scrollMaxByTab[tabIndex] = layout.maxScroll;

        const scroll = this.scrollYByTab[tabIndex] || 0;

        context.save();
        context.beginPath();

        const bleed = 10;
        context.rect(0, layout.gridTopY - bleed, this.game.width, layout.gridH + bleed * 2);
        context.clip();

        const step = layout.card + layout.gap;
        const firstRow = Math.max(0, Math.floor(scroll / step));
        const lastRow = Math.min(layout.rows - 1, firstRow + Math.ceil(layout.gridH / step) + 1);

        for (let r = firstRow; r <= lastRow; r++) {
            for (let c = 0; c < layout.cols; c++) {
                const idx = r * layout.cols + c;
                if (idx >= labels.length) break;

                const x = layout.gridLeftX + c * step;
                const y = layout.gridTopY + r * step - scroll;

                this._drawItemCard(context, {
                    tab,
                    label: labels[idx],
                    key: keys[idx],
                    x,
                    y,
                    size: layout.card,
                    isSelected: idx === this.selectedOption,
                });
            }
        }

        context.restore();

        this._drawGridScrollbar(context, layout, scroll);
    }

    _drawGridScrollbar(ctx, layout, scrollY) {
        this.barRect = null;

        const maxScroll = layout.maxScroll;
        if (!(maxScroll > 0.5)) return;

        const trackY = layout.gridTopY;
        const trackH = layout.gridH;

        const barX = Math.floor(layout.gridLeftX + layout.gridW + 14);
        const w = this.barWidth;

        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = `rgba(255,255,255,${this.barTrackAlpha})`;
        ctx.fillRect(barX, trackY, w, trackH);

        const contentH = Math.max(1, layout.contentH);
        const thumbH = Math.max(30, (layout.gridH / contentH) * trackH);
        const t = (maxScroll <= 0) ? 0 : (scrollY / maxScroll);
        const thumbY = trackY + (trackH - thumbH) * t;

        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillRect(barX, thumbY, w, thumbH);

        ctx.restore();

        this.barRect = { x: barX, y: trackY, w, h: trackH, thumbY, thumbH };
    }

    _drawItemCard(context, { tab, key, label, x, y, size, isSelected }) {
        const cfg = this.UI.card;

        context.save();

        const item = this._getItemDef(tab, key);
        const owned = this._isItemOwned(item);

        const isNoneCosmetic = (tab.kind === 'cosmetic' && key === 'none');
        const showPrice = (!owned && !isNoneCosmetic && !(item?.kind === 'skin' && item?.gift));

        const isEquipped = (() => {
            if (!item) return false;

            if (item.kind === 'skin') {
                const equippedSkin = (this.currentSkinKey === 'shinySkin')
                    ? 'defaultSkin'
                    : (this.currentSkinKey || 'defaultSkin');
                return item.key === equippedSkin;
            }

            const equippedKey = this.currentCosmetics?.[item.slot] ?? 'none';
            return item.key === equippedKey;
        })();

        const showChroma = (() => {
            if (tab.kind !== 'cosmetic') return false;
            if (!owned) return false;
            if (key === 'none') return false;

            const chromaCfg = getCosmeticChromaConfig(tab.slot, key);
            if (!chromaCfg || !Array.isArray(chromaCfg.variants) || chromaCfg.variants.length <= 1) return false;

            if (cfg.chroma.showOnlyWhenSelected && !isSelected) return false;
            return true;
        })();

        context.fillStyle = isSelected ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.20)';
        context.strokeStyle = isSelected ? 'rgba(255,255,0,0.95)' : 'rgba(255,255,255,0.16)';
        context.lineWidth = isSelected ? 3 : 2;

        this._roundRect(context, x, y, size, size, cfg.radius);
        context.fill();
        context.stroke();

        const maxTextWidth = size - 12;
        const price = Math.max(0, Math.floor(item?.price || 0));
        const priceText = `${price} cc`;

        context.textAlign = 'center';
        context.textBaseline = 'alphabetic';

        let nameFont = cfg.labelMaxFont;
        context.font = `${isSelected ? 'bold ' : ''}${nameFont}px Arial`;
        while (nameFont > cfg.labelMinFont && context.measureText(label).width > maxTextWidth) {
            nameFont--;
            context.font = `${isSelected ? 'bold ' : ''}${nameFont}px Arial`;
        }

        let priceFont = cfg.priceMaxFont;
        if (showPrice) {
            context.font = `${isSelected ? 'bold ' : ''}${priceFont}px Arial`;
            while (priceFont > cfg.priceMinFont && context.measureText(priceText).width > maxTextWidth) {
                priceFont--;
                context.font = `${isSelected ? 'bold ' : ''}${priceFont}px Arial`;
            }
        }

        const chromaMaxW = Math.floor(size - cfg.chroma.padX * 2);
        const chromaBlockH = showChroma ? this._measureChromaBlockH(tab.slot, key, chromaMaxW) : 0;
        const chromaGapToText = showChroma ? cfg.chroma.gapToText : 0;

        const reservedLabelH = showPrice
            ? (chromaBlockH + chromaGapToText + nameFont + cfg.labelToPriceGap + priceFont + cfg.labelPadBottom)
            : (chromaBlockH + chromaGapToText + nameFont + cfg.labelPadBottom);

        const spriteBoxX = x + cfg.pad;
        const spriteBoxY = y + cfg.pad;
        const spriteBoxW = size - cfg.pad * 2;
        const spriteBoxH = Math.max(10, size - cfg.pad * 2 - reservedLabelH);

        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        if (isNoneCosmetic) {
            this._drawNoneIcon(context, spriteBoxX, spriteBoxY, spriteBoxW, spriteBoxH);
        } else {
            const skinImg = (tab.kind === 'skin')
                ? (this._getSkinAsset(key) || this._getSkinAsset('defaultSkin'))
                : (this.currentSkin || this._getSkinAsset('defaultSkin'));

            const sw = this.width;
            const sh = this.height;

            const scale = Math.min(spriteBoxW / sw, spriteBoxH / sh);
            const dw = sw * scale;
            const dh = sh * scale;

            const dx = Math.floor(spriteBoxX + (spriteBoxW - dw) / 2);
            const dy = Math.floor(spriteBoxY + (spriteBoxH - dh) / 2);

            context.drawImage(skinImg, 0, 0, sw, sh, dx, dy, dw, dh);

            if (tab.kind === 'cosmetic') {
                const cosImg = this._getCosmeticAsset(tab.slot, key);
                if (cosImg) {
                    const isEquippedCos = (this.currentCosmetics?.[tab.slot] === key);
                    const ccfg = getCosmeticChromaConfig(tab.slot, key);

                    let hueDeg = 0;
                    if (ccfg && Array.isArray(ccfg.variants) && ccfg.variants.length > 1) {
                        if (isEquippedCos) {
                            hueDeg = getCosmeticChromaDegFromState(tab.slot, key, this.currentCosmeticsChroma);
                        } else {
                            const resolved = resolveCosmeticChromaVariant(tab.slot, key, ccfg.default);
                            hueDeg = Number.isFinite(resolved?.deg) ? resolved.deg : 0;
                        }
                    }

                    this._drawImageWithOptionalHue(context, cosImg, 0, 0, sw, sh, dx, dy, dw, dh, hueDeg);
                }
            }
        }

        if (isEquipped) {
            context.save();

            this._roundRect(context, x, y, size, size, cfg.radius);
            context.clip();

            const inset = 6;
            const corner = Math.max(18, Math.floor(size * 0.22));
            const tipRadius = 5;

            const rx = x + size - inset;
            const ry = y + inset;

            context.beginPath();
            context.moveTo(rx - corner, ry);
            context.lineTo(rx - tipRadius, ry);
            context.quadraticCurveTo(rx, ry, rx, ry + tipRadius);
            context.lineTo(rx, ry + corner);
            context.lineTo(rx - corner, ry);
            context.closePath();

            context.fillStyle = 'rgba(255,255,0,0.95)';
            context.fill();

            context.beginPath();
            context.moveTo(rx - corner, ry);
            context.lineTo(rx, ry + corner);
            context.strokeStyle = 'rgba(0,0,0,0.35)';
            context.lineWidth = 2;
            context.stroke();

            context.restore();
        }

        if (!owned) {
            context.save();
            context.fillStyle = `rgba(0,0,0,${cfg.lockOverlayAlpha})`;
            this._roundRect(context, x, y, size, size, cfg.radius);
            context.fill();
            this._drawLockIcon(context, x + size - 18, y + 12, 16);
            context.restore();
        }

        // chroma circles
        if (showChroma) {
            const stripTopY = Math.floor(y + size - reservedLabelH + cfg.chroma.padTop - 5);
            const stripX = Math.floor(x + cfg.chroma.padX);
            const maxW = Math.floor(size - cfg.chroma.padX * 2);

            this._drawChromaSwatches(context, {
                slot: tab.slot,
                key,
                x: stripX,
                y: stripTopY,
                maxWidth: maxW,
            });
        }

        const baseX = x + size / 2;
        const bottomY = y + size - cfg.labelPadBottom;

        const priceY = bottomY;
        const nameY = showPrice ? (priceY - priceFont - cfg.labelToPriceGap) : bottomY;

        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        context.fillStyle = isSelected ? 'yellow' : 'white';
        context.font = `${isSelected ? 'bold ' : ''}${nameFont}px Arial`;
        context.fillText(label, baseX, nameY);

        if (showPrice) {
            context.font = `${isSelected ? 'bold ' : ''}${priceFont}px Arial`;
            context.fillStyle = isSelected ? 'rgba(255,255,0,0.92)' : 'rgba(255,255,255,0.75)';
            context.fillText(priceText, baseX, priceY);
        }

        context.restore();
    }

    _drawLockIcon(ctx, x, y, s) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(x, y + 2, s * 0.42, Math.PI, 0);
        ctx.stroke();

        const w = s;
        const h = s * 0.72;
        const bx = x - w / 2;
        const by = y + 6;

        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        this._roundRect(ctx, bx, by, w, h, 4);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, by + h * 0.45, 2.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    _drawNoneIcon(ctx, x, y, w, h) {
        const cx = Math.round(x + w / 2);
        const cy = Math.round(y + h / 2);
        const r = Math.round(Math.min(w, h) * 0.30);

        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        const k = 0.72;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx - r * k, cy + r * k);
        ctx.lineTo(cx + r * k, cy - r * k);
        ctx.stroke();

        ctx.restore();
    }

    _drawGoBackText(context) {
        const tab = this._getActiveTab();
        const keys = this._getActiveKeysForTab(tab);
        const goBackIndex = keys.length;
        const isSelected = this.selectedOption === goBackIndex;

        const gb = this._getGoBackLayout();
        const cfg = this.UI.goBack;

        context.save();
        context.shadowColor = 'black';
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;

        context.font = isSelected ? cfg.fontActive : cfg.fontInactive;
        context.fillStyle = isSelected ? 'yellow' : 'white';
        context.textAlign = 'right';
        context.textBaseline = 'alphabetic';
        context.fillText('Go Back', gb.x, gb.y);

        context.restore();
    }

    _drawAnimatedPreview(context) {
        const skinImg = this.currentSkin || this._getSkinAsset('defaultSkin');
        const sx = this.frameX * this.width;

        const px = this.x - 50;
        const py = this.y - 20;

        context.save();
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        context.drawImage(skinImg, sx, 0, this.width, this.height, px, py, this.width, this.height);

        for (const slot of COSMETIC_LAYER_ORDER) {
            const img = this.currentCosmeticEls[slot];
            if (!img) continue;

            const slotKey = this.currentCosmetics?.[slot] || 'none';
            const hueDeg = this._getCosmeticChromaDeg(slot, slotKey);
            this._drawImageWithOptionalHue(context, img, sx, 0, this.width, this.height, px, py, this.width, this.height, hueDeg);
        }

        context.restore();
    }

    // modal draw
    _drawModal(ctx) {
        const cfg = this.UI.modal;
        const panel = this._getModalPanelRect();

        ctx.save();

        ctx.fillStyle = cfg.overlay;
        ctx.fillRect(-2, -2, this.game.width + 4, this.game.height + 4);

        ctx.fillStyle = cfg.panelFill;
        ctx.strokeStyle = cfg.panelStroke;
        ctx.lineWidth = 2;
        this._roundRect(ctx, panel.x, panel.y, panel.w, panel.h, cfg.radius);
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        const pad = cfg.pad;
        const headerY = panel.y + pad;
        const headerX = panel.x + pad;

        ctx.save();
        ctx.strokeStyle = cfg.headerDividerStroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(panel.x + pad, panel.y + pad + cfg.headerH);
        ctx.lineTo(panel.x + panel.w - pad, panel.y + pad + cfg.headerH);
        ctx.stroke();
        ctx.restore();

        this._drawModalCloseButton(ctx);

        const contentX = panel.x + pad;
        const contentTop = panel.y + pad + cfg.headerH + 36;

        if (this.modal.type === 'preview') {
            const item = this.modal.item;
            const owned = this._isItemOwned(item);

            ctx.font = cfg.titleFont;
            ctx.fillStyle = 'white';
            ctx.fillText(item.label, headerX, headerY + 30);

            this._drawModalSpritePreview(ctx, panel, item);
            this._drawModalNavButtons(ctx);

            let y = contentTop;

            if (item.kind === 'skin' && item.gift) {
                const flag = getGiftFlag(item.key);
                ctx.font = cfg.bodyFont;
                ctx.fillStyle = 'rgba(255,255,255,0.88)';
                ctx.fillText(
                    owned ? 'Gift unlocked.' : 'Locked gift skin.',
                    contentX,
                    y
                );
                y += 30;

                if (!owned && flag) {
                    ctx.fillStyle = 'rgba(255,255,255,0.72)';
                    ctx.font = cfg.smallFont;
                    ctx.fillText(`Unlock by defeating the boss (${flag}).`, contentX, y);
                }

                this._drawModalButtons(ctx);
                ctx.restore();
                return;
            }

            const cc = Math.max(0, Math.floor(this.game.creditCoins || 0));
            const price = Math.max(0, Math.floor(item.price || 0));
            const after = cc - price;

            ctx.font = cfg.bodyFont;
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.fillText(`Price: ${price} cc`, contentX, y);
            y += 30;

            ctx.fillStyle = 'rgba(255,255,255,0.88)';
            ctx.fillText(`Your balance: ${cc} cc`, contentX, y);
            y += 30;

            if (!owned) {
                ctx.fillStyle = (after < 0) ? 'rgba(255,80,80,0.95)' : 'rgba(255,255,255,0.80)';
                ctx.fillText(`After purchase: ${after} cc`, contentX, y);
            }

            this._drawModalButtons(ctx);
            ctx.restore();
            return;
        }

        if (this.modal.type === 'confirm') {
            const item = this.modal.item;

            if (item.kind === 'skin' && item.gift) {
                this._closeModal();
                ctx.restore();
                return;
            }

            const price = Math.max(0, Math.floor(item.price || 0));
            const cc = Math.max(0, Math.floor(this.game.creditCoins || 0));
            const after = cc - price;

            ctx.font = cfg.titleFont;
            ctx.fillStyle = 'white';
            ctx.fillText('Confirm purchase', headerX, headerY + 30);

            this._drawModalSpritePreview(ctx, panel, item);

            let y = contentTop;

            ctx.font = cfg.bodyFont;
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.fillText(`Buy ${item.label}?`, contentX, y);
            y += 30;

            ctx.fillStyle = 'rgba(255,255,255,0.88)';
            ctx.fillText(`Cost: ${price} cc`, contentX, y);
            y += 30;

            ctx.fillStyle = 'rgba(255,255,255,0.80)';
            ctx.fillText(`Your balance: ${cc} cc`, contentX, y);
            y += 30;

            ctx.fillStyle = (after < 0) ? 'rgba(255,80,80,0.95)' : 'rgba(255,255,255,0.80)';
            ctx.fillText(`After purchase: ${after} cc`, contentX, y);

            this._drawModalButtons(ctx);
            ctx.restore();
            return;
        }

        ctx.restore();
    }

    _drawModalCloseButton(ctx) {
        const cfg = this.UI.modal;
        const c = cfg.close;
        const r = this._getModalCloseRect();
        const hovered = !!this.modal?.hoverClose;

        ctx.save();

        ctx.fillStyle = hovered ? c.bgHover : c.bg;
        ctx.strokeStyle = hovered ? c.strokeHover : c.stroke;
        ctx.lineWidth = hovered ? 3 : 2;

        this._roundRect(ctx, r.x, r.y, r.w, r.h, c.radius);
        ctx.fill();
        ctx.stroke();

        ctx.font = c.font;
        ctx.fillStyle = c.fg;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('×', r.x + r.w / 2, r.y + r.h / 2 + 1);

        ctx.restore();
    }

    _drawModalSpritePreview(ctx, panel, item) {
        const pcfg = this.UI.modal.preview;

        const sw = this.width;
        const sh = this.height;
        const boxPad = pcfg.pad;

        const boxW = Math.ceil(sw + boxPad * 2);
        const boxH = Math.ceil(sh + boxPad * 2);

        const rightPad = this.UI.modal.pad;
        const topPad = this.UI.modal.pad + this.UI.modal.headerH + 18;
        const boxX = Math.floor(panel.x + panel.w - rightPad - boxW);
        const boxY = Math.floor(panel.y + topPad);

        ctx.save();
        ctx.fillStyle = pcfg.boxFill;
        ctx.strokeStyle = pcfg.boxStroke;
        ctx.lineWidth = 2;
        this._roundRect(ctx, boxX, boxY, boxW, boxH, pcfg.radius);
        ctx.fill();
        ctx.stroke();

        const { skinImg, overlays } = this._buildModalPreviewPose(item);
        const sx = this.frameX * sw;

        const dx = Math.floor(boxX + boxPad);
        const dy = Math.floor(boxY + boxPad);

        if (skinImg) {
            ctx.drawImage(skinImg, sx, 0, sw, sh, dx, dy, sw, sh);

            let previewHueDeg = 0;
            const owned = this._isItemOwned(item);
            if (!owned && item?.kind === 'cosmetic' && item.key !== 'none') {
                const ccfg = getCosmeticChromaConfig(item.slot, item.key);
                if (ccfg && Array.isArray(ccfg.variants) && ccfg.variants.length > 1) {
                    const resolved = resolveCosmeticChromaVariant(
                        item.slot,
                        item.key,
                        this.modal?.previewChromaVariantId || ccfg.default
                    );
                    previewHueDeg = Number.isFinite(resolved?.deg) ? resolved.deg : 0;
                }
            }

            for (const img of overlays) {
                this._drawImageWithOptionalHue(ctx, img, sx, 0, sw, sh, dx, dy, sw, sh, previewHueDeg);
            }
        }

        ctx.restore();

        const owned = this._isItemOwned(item);
        if (!owned && item?.kind === 'cosmetic' && item.key !== 'none') {
            const ccfg = getCosmeticChromaConfig(item.slot, item.key);
            if (ccfg && Array.isArray(ccfg.variants) && ccfg.variants.length > 1) {
                const currentId =
                    this.modal?.previewChromaVariantId ||
                    resolveCosmeticChromaVariant(item.slot, item.key, ccfg.default)?.id ||
                    ccfg.variants[0]?.id;

                const btnY = panel.y + panel.h - 26 - this.UI.modal.btnH;
                const x = boxX;
                const maxW = boxW;
                let y = boxY + boxH + 10;
                const maxY = btnY - 10;
                if (y > maxY) y = maxY;

                this._drawModalChromaSwatches(ctx, {
                    slot: item.slot,
                    key: item.key,
                    x,
                    y,
                    maxWidth: maxW,
                    currentId,
                });
            }
        }
    }

    _drawModalNavButtons(ctx) {
        if (!this.modal || this.modal.type !== 'preview') return;
        if (!this._modalCanBrowse()) return;

        const ncfg = this.UI.modal.nav;
        const { left, right } = this._getModalNavRects();

        const drawBtn = (rect, dir) => {
            const hovered = (dir === -1) ? !!this.modal.hoverNavLeft : !!this.modal.hoverNavRight;

            ctx.save();
            ctx.fillStyle = hovered ? ncfg.bgHover : ncfg.bg;
            ctx.strokeStyle = hovered ? ncfg.strokeHover : ncfg.stroke;
            ctx.lineWidth = hovered ? 3 : 2;

            this._roundRect(ctx, rect.x, rect.y, rect.w, rect.h, ncfg.radius);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = ncfg.fg;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(dir === -1 ? '‹' : '›', rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);

            ctx.restore();
        };

        drawBtn(left, -1);
        drawBtn(right, 1);
    }

    _drawModalButtons(ctx) {
        const btns = this._getModalButtons();
        if (!btns.length) return;

        const cfg = this.UI.modal;
        const focus = (this.modal && Number.isFinite(this.modal.focusIndex)) ? this.modal.focusIndex : 0;

        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            const isDisabled = !!b.disabled;
            const isFocused = (!isDisabled && i === focus);

            ctx.save();

            if (isDisabled) {
                ctx.fillStyle = 'rgba(0,0,0,0.18)';
                ctx.strokeStyle = 'rgba(255,255,255,0.10)';
                ctx.lineWidth = 2;
            } else {
                ctx.fillStyle = isFocused ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)';
                ctx.strokeStyle = isFocused ? 'rgba(255,255,0,0.95)' : 'rgba(255,255,255,0.20)';
                ctx.lineWidth = isFocused ? 3 : 2;
            }

            this._roundRect(ctx, b.x, b.y, b.w, b.h, 14);
            ctx.fill();
            ctx.stroke();

            ctx.font = cfg.btnFont;
            ctx.fillStyle = isDisabled ? 'rgba(255,255,255,0.45)' : (isFocused ? 'yellow' : 'white');

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);

            ctx.restore();
        }
    }

    _roundRect(ctx, x, y, w, h, r) {
        const radius = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
    }
}