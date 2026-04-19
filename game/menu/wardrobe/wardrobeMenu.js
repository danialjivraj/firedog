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
} from '../../config/skinsAndCosmetics.js';
import { PurchaseConfetti } from '../../interface/purchaseConfetti.js';
import { drawCoinIcon } from '../../interface/coinIcon.js';
import { BaseMenu } from '../baseMenu.js';
import { buildWardrobeUI } from './wardrobeConfig.js';
import { wardrobeModalMethods } from './wardrobeModal.js';

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
        this.UI = buildWardrobeUI();

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

        this.cosmeticVersion = 0;
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
        this.randomizerHoverBtn = false;
        this.resetHoverBtn = false;
        this.tabHoverIndex = -1;

        this._uiCtx = null;
        this.modal = null;

        // chroma hitboxes
        this._chromaHitboxes = [];
        this._modalChromaHitboxes = [];
        this._detailsHitboxes = [];

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

        // outfit slots
        this.outfitSlots = Array(4).fill(null);
        this.outfitSlotsHoverSlot = -1;
        this.outfitSlotsHoverBtn = null;
        this.outfitSlotFocusedBtn = null;

        this.purchaseConfetti = [];
    }

    activateMenu(selectedOption = 0) {
        super.activateMenu(selectedOption);

        this.activeTabIndex = 0;

        this.filterModeIndex = 0;
        this.filterOpen = false;
        this.filterHoverIndex = -1;
        this.filterHoverBtn = false;
        this.randomizerHoverBtn = false;
        this.resetHoverBtn = false;
        this.tabHoverIndex = -1;

        this.modal = null;
        this.purchaseConfetti = [];

        if (Array.isArray(this.scrollYByTab)) this.scrollYByTab[0] = 0;
        if (Array.isArray(this.targetScrollYByTab)) this.targetScrollYByTab[0] = 0;

        this.selectedOption = 0;
        this.outfitSlotFocusedBtn = null;
        this._syncSelectionToEquipped();
        this._ensureSelectedVisible();
    }

    // chroma swatches
    _clearChromaHitboxes() { this._chromaHitboxes = []; }
    _clearModalChromaHitboxes() { this._modalChromaHitboxes = []; }
    _clearDetailsHitboxes() { this._detailsHitboxes = []; }

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
        if (!this.modal || (this.modal.type !== 'preview' && this.modal.type !== 'confirm')) return false;

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

    _tryClickDetailsIcon(mouseX, mouseY) {
        const hitboxes = this._detailsHitboxes;
        if (!Array.isArray(hitboxes) || hitboxes.length === 0) return false;

        for (const h of hitboxes) {
            if (mouseX < h.x || mouseX > h.x + h.w || mouseY < h.y || mouseY > h.y + h.h) continue;

            const tab = this._getActiveTab();
            const item = this._getItemDef(tab, h.key);
            if (!item) return true;

            this.selectedOption = h.index;
            this._ensureSelectedVisible();
            this._openPreviewModal(item);
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            return true;
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
        this.cosmeticVersion++;
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
        this.cosmeticVersion++;
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
                label: def.label,
                price: gift ? 0 : def.price,
                gift,
            };
        }

        const def = COSMETICS?.[tab.slot]?.[key];
        if (!def) return null;

        return {
            kind: 'cosmetic',
            slot: tab.slot,
            key,
            label: def.label,
            price: def.price,
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
        this._spawnPurchaseConfetti();
        return true;
    }

    _isCurrentlyWearing(item) {
        if (!item || !this._isItemOwned(item)) return false;

        if (item.kind === 'skin') {
            return this.currentSkinKey === item.key;
        }

        const equippedKey = this.currentCosmetics?.[item.slot] ?? 'none';
        if (equippedKey !== item.key) return false;

        const previewVariantId = this.modal?.previewChromaVariantId;
        if (previewVariantId) {
            return this._getCosmeticChromaVariantId(item.slot, item.key) === previewVariantId;
        }

        return true;
    }

    _wearItem(item) {
        if (!item || !this._isItemOwned(item)) return;

        if (item.kind === 'skin') {
            this.setCurrentSkinByKey(item.key, { forceExact: true });
        } else {
            const equippedKey = this.currentCosmetics?.[item.slot] ?? 'none';
            if (equippedKey !== item.key) {
                this.setCurrentCosmeticByKey(item.slot, item.key);
            }
            const previewVariantId = this.modal?.previewChromaVariantId;
            if (previewVariantId) {
                this._setCosmeticChromaVariantId(item.slot, item.key, previewVariantId);
            }
        }

        this._save();
    }

    _spawnPurchaseConfetti() {
        const panel = this._getModalPanelRect();
        const y = panel.y + panel.h * 0.60;
        const bursts = [
            { x: panel.x + panel.w * 0.28, direction: -0.42 },
            { x: panel.x + panel.w * 0.72, direction: 0.42 },
        ];

        for (const burst of bursts) {
            this.purchaseConfetti.push(new PurchaseConfetti(this.game, {
                x: burst.x + (Math.random() - 0.5) * 14,
                y: y + (Math.random() - 0.5) * 10,
                count: 36,
                direction: burst.direction,
            }));
        }

        this.purchaseConfetti = this.purchaseConfetti.slice(-4);
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
        this.cosmeticVersion++;
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

    // outfit slots
    _saveOutfitToSlot(i) {
        this.outfitSlots[i] = {
            skinKey: this.currentSkinKey,
            cosmetics: { ...this.currentCosmetics },
            cosmeticsChroma: JSON.parse(JSON.stringify(this.currentCosmeticsChroma || {})),
        };
        this._save();
    }

    _loadOutfitFromSlot(i) {
        const saved = this.outfitSlots[i];
        if (!saved) return;
        const preservedSelection = this.selectedOption;
        if (saved.skinKey) this.setCurrentSkinByKey(saved.skinKey, { forceExact: true });
        for (const slot of Object.values(COSMETIC_SLOTS)) {
            const key = saved.cosmetics?.[slot] || 'none';
            this.setCurrentCosmeticByKey(slot, key);
        }
        if (saved.cosmeticsChroma) this.setCurrentCosmeticsChromaState(saved.cosmeticsChroma);
        this.selectedOption = preservedSelection;
        this._save();
    }

    _clearOutfitSlot(i) {
        this.outfitSlots[i] = null;
        this._save();
    }

    _getOutfitPanelLayout() {
        const s = this.UI.outfitSlots;
        const sidebar = this._getSidebarLayout();
        const y = sidebar.sidebarTopY + 34;
        const cellW = Math.floor((s.panelW - s.padX * 2 - s.cellGap) / 2);
        const panelH = s.titleH + s.padX + 2 * s.cellH + s.cellGap + s.padX;
        return { x: s.panelX, y, w: s.panelW, h: panelH, titleH: s.titleH, cellW };
    }

    _getOutfitCellRects() {
        const s = this.UI.outfitSlots;
        const layout = this._getOutfitPanelLayout();
        const rects = [];
        for (let i = 0; i < 4; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const cellX = layout.x + s.padX + col * (layout.cellW + s.cellGap);
            const cellY = layout.y + layout.titleH + s.padX + row * (s.cellH + s.cellGap);
            const thumbH = s.cellH - s.stripH;
            const stripY = cellY + thumbH;
            const iconsRight = cellX + layout.cellW - s.iconPadRight;
            const iconY = stripY + Math.floor((s.stripH - s.iconSize) / 2);
            rects.push({
                cellX, cellW: layout.cellW, cellY, cellH: s.cellH,
                thumbH, stripY,
                saveBtn: { x: iconsRight - s.iconSize * 2 - s.iconGap, y: iconY, w: s.iconSize, h: s.iconSize },
                deleteBtn: { x: iconsRight - s.iconSize, y: iconY, w: s.iconSize, h: s.iconSize },
            });
        }
        return rects;
    }

    _hitTestOutfitPanel(mx, my) {
        const rects = this._getOutfitCellRects();
        for (let i = 0; i < rects.length; i++) {
            const r = rects[i];
            if (mx < r.cellX || mx > r.cellX + r.cellW || my < r.cellY || my > r.cellY + r.cellH) continue;
            const inStrip = my >= r.stripY;
            const inSave = inStrip && mx >= r.saveBtn.x - 5 && mx <= r.saveBtn.x + r.saveBtn.w;
            if (inSave) return { slot: i, btn: 'save' };
            const inDelete = inStrip && mx > r.saveBtn.x + r.saveBtn.w && mx <= r.deleteBtn.x + r.deleteBtn.w;
            if (inDelete) return { slot: i, btn: 'delete' };
            return { slot: i, btn: null };
        }
        return null;
    }

    _drawSaveIcon(ctx, cx, cy, color) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx, cy + 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 3.5, cy - 1.5);
        ctx.lineTo(cx, cy + 2.5);
        ctx.lineTo(cx + 3.5, cy - 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 4.5, cy + 4.5);
        ctx.lineTo(cx + 4.5, cy + 4.5);
        ctx.stroke();
        ctx.restore();
    }

    _drawDeleteIcon(ctx, cx, cy, color) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        const d = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx - d, cy - d);
        ctx.lineTo(cx + d, cy + d);
        ctx.moveTo(cx + d, cy - d);
        ctx.lineTo(cx - d, cy + d);
        ctx.stroke();
        ctx.restore();
    }

    _drawOutfitSlots(ctx) {
        const s = this.UI.outfitSlots;
        const layout = this._getOutfitPanelLayout();
        const rects = this._getOutfitCellRects();

        ctx.save();

        // panel background
        ctx.fillStyle = s.panelFill;
        ctx.strokeStyle = s.panelStroke;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(layout.x, layout.y, layout.w, layout.h, s.panelRadius);
        ctx.fill();
        ctx.stroke();

        // title
        ctx.fillStyle = s.titleFill;
        ctx.font = s.titleFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Saved Outfits', layout.x + layout.w / 2, layout.y + layout.titleH / 2 + 3);

        // title divider
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(layout.x + 12, layout.y + layout.titleH);
        ctx.lineTo(layout.x + layout.w - 12, layout.y + layout.titleH);
        ctx.stroke();

        const outfitStart = this._getOutfitSlotsStartIndex();

        for (let i = 0; i < 4; i++) {
            const r = rects[i];
            const saved = this.outfitSlots[i];
            const isMouseOnSlot = this.outfitSlotsHoverSlot === i;
            const isFocused = this.selectedOption >= outfitStart && this.selectedOption < outfitStart + 4 && (this.selectedOption - outfitStart) === i;
            const activeBtn = isMouseOnSlot ? this.outfitSlotsHoverBtn : this.outfitSlotFocusedBtn;

            // cell background fill
            ctx.fillStyle = isFocused ? s.cellFillHover : s.cellFill;
            ctx.beginPath();
            ctx.roundRect(r.cellX, r.cellY, r.cellW, r.cellH, s.cellRadius);
            ctx.fill();

            // thumbnail area
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(r.cellX, r.cellY, r.cellW, r.thumbH, [s.cellRadius, s.cellRadius, 0, 0]);
            ctx.clip();

            ctx.fillStyle = s.thumbFill;
            ctx.fillRect(r.cellX, r.cellY, r.cellW, r.thumbH);

            if (isFocused && saved) {
                ctx.fillStyle = 'rgba(255,255,255,0.07)';
                ctx.fillRect(r.cellX, r.cellY, r.cellW, r.thumbH);
            }

            if (saved) {
                const fw = this.width;
                const fh = this.height;
                const scale = Math.min(r.cellW / fw, r.thumbH / fh);
                const dw = fw * scale;
                const dh = fh * scale;
                const dx = r.cellX + (r.cellW - dw) / 2;
                const dy = r.cellY + (r.thumbH - dh) / 2;

                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;

                const skinImg = getSkinElement(saved.skinKey);
                if (skinImg) ctx.drawImage(skinImg, 0, 0, fw, fh, dx, dy, dw, dh);

                for (const slot of COSMETIC_LAYER_ORDER) {
                    const cosKey = saved.cosmetics?.[slot] || 'none';
                    if (cosKey === 'none') continue;
                    const img = getCosmeticElement(slot, cosKey);
                    if (!img) continue;
                    const hueDeg = getCosmeticChromaDegFromState(slot, cosKey, saved.cosmeticsChroma || {});
                    this._drawImageWithOptionalHue(ctx, img, 0, 0, fw, fh, dx, dy, dw, dh, hueDeg);
                }
            }

            ctx.restore();

            // slot number badge
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.70)';
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${i + 1}`, r.cellX + 12, r.cellY + 12);

            // strip background
            ctx.fillStyle = s.stripFill;
            ctx.beginPath();
            ctx.roundRect(r.cellX, r.stripY, r.cellW, s.stripH, [0, 0, s.cellRadius, s.cellRadius]);
            ctx.fill();

            // strip top separator
            ctx.strokeStyle = s.stripStroke;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(r.cellX, r.stripY);
            ctx.lineTo(r.cellX + r.cellW, r.stripY);
            ctx.stroke();

            // save icon button
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            const saveHover = isFocused && activeBtn === 'save';
            ctx.fillStyle = saveHover ? s.saveFillHover : s.saveFill;
            ctx.strokeStyle = saveHover ? s.saveStrokeHover : s.saveStroke;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(r.saveBtn.x, r.saveBtn.y, r.saveBtn.w, r.saveBtn.h, s.iconRadius);
            ctx.fill();
            ctx.stroke();
            this._drawSaveIcon(ctx, r.saveBtn.x + r.saveBtn.w / 2, r.saveBtn.y + r.saveBtn.h / 2, s.saveIconFill);

            // delete icon button
            const deleteHover = isFocused && activeBtn === 'delete';
            ctx.globalAlpha = saved ? 1 : 0.18;
            ctx.fillStyle = deleteHover && saved ? s.deleteFillHover : s.deleteFill;
            ctx.strokeStyle = deleteHover && saved ? s.deleteStrokeHover : s.deleteStroke;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(r.deleteBtn.x, r.deleteBtn.y, r.deleteBtn.w, r.deleteBtn.h, s.iconRadius);
            ctx.fill();
            ctx.stroke();
            this._drawDeleteIcon(ctx, r.deleteBtn.x + r.deleteBtn.w / 2, r.deleteBtn.y + r.deleteBtn.h / 2, s.deleteIconFill);
            ctx.globalAlpha = 1;

            ctx.strokeStyle = isFocused ? s.cellStrokeThumbHover : s.cellStroke;
            ctx.lineWidth = isFocused ? 2 : 1;
            ctx.beginPath();
            ctx.roundRect(r.cellX, r.cellY, r.cellW, r.cellH, s.cellRadius);
            ctx.stroke();
        }

        ctx.restore();
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

    _getOutfitSlotsStartIndex() {
        const tab = this._getActiveTab();
        return this._getActiveKeysForTab(tab).length;
    }

    _getGoBackIndex() {
        return this._getOutfitSlotsStartIndex() + 4;
    }

    _buildLabelsForTab(tab) {
        if (!tab) return [];
        const keys = this._getActiveKeysForTab(tab);
        if (tab.kind === 'skin') return keys.map((k) => SKINS[k].label);
        return keys.map((k) => COSMETICS[tab.slot][k].label);
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

    _hitTestTab(mx, my) {
        const s = this._getSidebarLayout();
        const tabX = s.sidebarX + this.UI.sidebar.tabOffsetX;

        for (let i = 0; i < this.tabs.length; i++) {
            const y = s.sidebarTopY + i * (s.tabH + s.gap);
            if (mx >= tabX && mx <= tabX + s.tabW && my >= y && my <= y + s.tabH) return i;
        }

        return -1;
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

        if (this.selectedOption >= this._getOutfitSlotsStartIndex()) return;

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

    _getRandomizerButtonRect() {
        const cfg = this.UI.randomizerBtn;
        const filterCfg = this.UI.filterDropdown;
        const grid = this._getGridLayout();
        const y = Math.max(filterCfg.minTopY, grid.gridTopY - cfg.size - filterCfg.aboveGridGap);
        const x = grid.gridLeftX + grid.gridW - cfg.size;
        return { x, y, w: cfg.size, h: cfg.size };
    }

    _hitTestRandomizerButton(mx, my) {
        return this._hitTestRect(mx, my, this._getRandomizerButtonRect());
    }

    _getResetButtonRect() {
        const cfg = this.UI.resetBtn;
        const randRect = this._getRandomizerButtonRect();
        return { x: randRect.x - cfg.size - cfg.gap, y: randRect.y, w: cfg.size, h: cfg.size };
    }

    _hitTestResetButton(mx, my) {
        return this._hitTestRect(mx, my, this._getResetButtonRect());
    }

    _drawResetButton(ctx) {
        const cfg = this.UI.resetBtn;
        const btn = this._getResetButtonRect();
        const hovered = this.resetHoverBtn;
        const iconFill = hovered ? cfg.iconFillHover : cfg.iconFill;

        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = hovered ? cfg.fillHover : cfg.fill;
        ctx.strokeStyle = hovered ? cfg.strokeHover : cfg.stroke;
        ctx.lineWidth = 2;
        this._roundRect(ctx, btn.x, btn.y, btn.w, btn.h, cfg.radius);
        if (hovered) ctx.fill();
        ctx.stroke();

        const cx = btn.x + btn.w / 2;
        const cy = btn.y + btn.h / 2;
        const r = 8.5;

        ctx.strokeStyle = iconFill;
        ctx.fillStyle = iconFill;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI * 0.15, Math.PI * 2.0, false);
        ctx.stroke();

        const arrowAngle = Math.PI * 0.15;
        const ax = cx + r * Math.cos(arrowAngle);
        const ay = cy + r * Math.sin(arrowAngle);
        const tangentAngle = arrowAngle + Math.PI / 2;
        const arrowSize = 4.5;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(
            ax + arrowSize * Math.cos(tangentAngle - 0.5),
            ay + arrowSize * Math.sin(tangentAngle - 0.5)
        );
        ctx.moveTo(ax, ay);
        ctx.lineTo(
            ax + arrowSize * Math.cos(tangentAngle + 0.6),
            ay + arrowSize * Math.sin(tangentAngle + 0.6)
        );
        ctx.stroke();

        ctx.restore();
    }

    _resetToDefault() {
        const preservedSelection = this.selectedOption;
        this.setCurrentSkinByKey('defaultSkin', { forceExact: true });
        for (const slot of Object.values(COSMETIC_SLOTS)) {
            this.setCurrentCosmeticByKey(slot, 'none');
        }
        this.selectedOption = preservedSelection;
        this._save();
    }

    _drawRandomizerButton(ctx) {
        const cfg = this.UI.randomizerBtn;
        const btn = this._getRandomizerButtonRect();
        const hovered = this.randomizerHoverBtn;
        const iconFill = hovered ? cfg.iconFillHover : cfg.iconFill;

        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // button background + border
        ctx.fillStyle = hovered ? cfg.fillHover : cfg.fill;
        ctx.strokeStyle = hovered ? cfg.strokeHover : cfg.stroke;
        ctx.lineWidth = 2;
        this._roundRect(ctx, btn.x, btn.y, btn.w, btn.h, cfg.radius);
        if (hovered) ctx.fill();
        ctx.stroke();

        // dice icon: outer rounded square
        const pad = 8;
        const dx = btn.x + pad;
        const dy = btn.y + pad;
        const dw = btn.w - pad * 2;
        const dh = btn.h - pad * 2;

        ctx.strokeStyle = iconFill;
        ctx.lineWidth = 1.5;
        this._roundRect(ctx, dx, dy, dw, dh, 4);
        ctx.stroke();

        // dice dots
        const dotR = 2.2;
        ctx.fillStyle = iconFill;

        const dots = [
            { x: dx + dw * 0.28, y: dy + dh * 0.28 },
            { x: dx + dw * 0.50, y: dy + dh * 0.50 },
            { x: dx + dw * 0.72, y: dy + dh * 0.72 },
        ];

        for (const p of dots) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    _randomizeOutfit() {
        const preservedSelection = this.selectedOption;

        // random owned skin
        const giftSkins = this._getUnlockedGiftSkinKeys();
        const skinPool = [
            ...SKIN_MENU_ORDER.filter(k => this._isSkinOwned(k)),
            ...giftSkins.filter(k => !SKIN_MENU_ORDER.includes(k)),
        ];
        if (skinPool.length > 0) {
            const skinKey = skinPool[Math.floor(Math.random() * skinPool.length)];
            this.setCurrentSkinByKey(skinKey, { forceExact: skinKey !== 'defaultSkin' });
        }

        // random owned cosmetic per slot
        for (const slot of Object.values(COSMETIC_SLOTS)) {
            const slotKeys = COSMETIC_MENU_ORDER[slot] || [];
            const pool = ['none', ...slotKeys.filter(k => this._isCosmeticOwned(slot, k))];
            const cosKey = pool[Math.floor(Math.random() * pool.length)];
            this.setCurrentCosmeticByKey(slot, cosKey);

            if (cosKey !== 'none') {
                const chromaCfg = getCosmeticChromaConfig(slot, cosKey);
                if (chromaCfg && Array.isArray(chromaCfg.variants) && chromaCfg.variants.length > 1) {
                    const variant = chromaCfg.variants[Math.floor(Math.random() * chromaCfg.variants.length)];
                    this._setCosmeticChromaVariantId(slot, cosKey, variant.id);
                }
            }
        }

        this.selectedOption = preservedSelection;
        this._save();
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


    _handleOutfitSlotEnter(slotIdx) {
        const btn = this.outfitSlotFocusedBtn;
        if (btn === 'save') {
            this._saveOutfitToSlot(slotIdx);
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
        } else if (btn === 'delete') {
            if (this.outfitSlots[slotIdx]) {
                this._clearOutfitSlot(slotIdx);
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            }
        } else {
            if (this.outfitSlots[slotIdx]) {
                this._loadOutfitFromSlot(slotIdx);
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            }
        }
    }

    // selection actions
    _selectCurrent() {
        const tab = this._getActiveTab();
        const keys = this._getActiveKeysForTab(tab);
        const outfitStart = keys.length;
        const goBackIndex = outfitStart + 4;
        const idx = this.selectedOption ?? 0;

        if (idx === goBackIndex) return this.onGoBack();
        if (idx >= outfitStart && idx < goBackIndex) {
            this._handleOutfitSlotEnter(idx - outfitStart);
            return;
        }
        if (!tab || idx < 0 || idx >= keys.length) return;

        const key = keys[idx];
        const item = this._getItemDef(tab, key);
        if (!item) return;

        if (!this._isItemOwned(item)) {
            this._openPreviewModal(item);
            return;
        }

        if (tab.kind === 'skin') this.setCurrentSkinByKey(key);
        else this.setCurrentCosmeticByKey(tab.slot, key);

        this._save();
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
        if (this.modal) {
            this._closeModal();
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            return;
        }

        this.game.goBackMenu();
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
        if (this.menuActive) this._advancePreview(deltaTime);

        if (this.menuActive) {
            const tabIndex = this.activeTabIndex;
            const layout = this._getGridLayout();
            this.scrollMaxByTab[tabIndex] = layout.maxScroll;

            this.targetScrollYByTab[tabIndex] = Math.max(0, Math.min(this.targetScrollYByTab[tabIndex] || 0, layout.maxScroll));

            const cur = this.scrollYByTab[tabIndex] || 0;
            const next = cur + ((this.targetScrollYByTab[tabIndex] || 0) - cur) * this.scrollEase;
            this.scrollYByTab[tabIndex] = (layout.maxScroll < 12) ? 0 : Math.max(0, Math.min(next, layout.maxScroll));

            for (const confetti of this.purchaseConfetti) confetti.update(deltaTime);
            this.purchaseConfetti = this.purchaseConfetti.filter((c) => !c.markedForDeletion);
        }
    }

    // input
    handleKeyDown(event) {
        if (!this._canInteract()) return;

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
        const outfitStart = keys.length;
        const goBackIndex = outfitStart + 4;
        const maxIndex = goBackIndex;

        const isInOutfitSlot = this.selectedOption >= outfitStart && this.selectedOption < outfitStart + 4;

        if (event.key === 'ArrowUp') {
            if (isInOutfitSlot) {
                const slotIdx = this.selectedOption - outfitStart;
                const hasOutfit = !!this.outfitSlots[slotIdx];
                const order = hasOutfit ? [null, 'save', 'delete'] : [null, 'save'];
                const ci = Math.max(0, order.indexOf(this.outfitSlotFocusedBtn));
                this.outfitSlotFocusedBtn = order[(ci - 1 + order.length) % order.length];
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                return;
            }
            this._setActiveTab(this.activeTabIndex - 1);
            return;
        }
        if (event.key === 'ArrowDown') {
            if (isInOutfitSlot) {
                const slotIdx = this.selectedOption - outfitStart;
                const hasOutfit = !!this.outfitSlots[slotIdx];
                const order = hasOutfit ? [null, 'save', 'delete'] : [null, 'save'];
                const ci = Math.max(0, order.indexOf(this.outfitSlotFocusedBtn));
                this.outfitSlotFocusedBtn = order[(ci + 1) % order.length];
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                return;
            }
            this._setActiveTab(this.activeTabIndex + 1);
            return;
        }

        const wrap = (i) => {
            const n = maxIndex + 1;
            return (i + n) % n;
        };

        if (event.key === 'ArrowLeft') {
            this.selectedOption = wrap((this.selectedOption ?? 0) - 1);
            this.outfitSlotFocusedBtn = null;
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            this._ensureSelectedVisible();
            return;
        }

        if (event.key === 'ArrowRight') {
            this.selectedOption = wrap((this.selectedOption ?? 0) + 1);
            this.outfitSlotFocusedBtn = null;
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

        if (event.key === 'i' || event.key === 'I') {
            const tab = this._getActiveTab();
            const keys = this._getActiveKeysForTab(tab);
            const idx = this.selectedOption ?? 0;
            if (idx < 0 || idx >= keys.length) return;

            const item = this._getItemDef(tab, keys[idx]);
            if (!item) return;

            this._openPreviewModal(item);
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            return;
        }

        if (event.key === 'Escape') {
            this.game.input.handleEscapeKey();
            return;
        }
    }

    handleRightClick(event) {
        if (!this._canInteract()) return;
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

        this.game.input.handleEscapeKey();
    }

    handleMouseWheel(event) {
        if (!this._canInteract()) return;
        if (this.modal) return;
        if (this.filterOpen) return;

        const { mouseX, mouseY } = this.canvasMouse(event);

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
        if (!this._canInteract()) return;
        if (this.modal) return;
        if (this.filterOpen) return;

        const { mouseX, mouseY } = this.canvasMouse(event);

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
        if (!this._canInteract()) return;

        const { mouseX, mouseY } = this.canvasMouse(event);

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

            const randHovered = this._hitTestRandomizerButton(mouseX, mouseY);
            if (randHovered !== this.randomizerHoverBtn) {
                this.randomizerHoverBtn = randHovered;
                if (randHovered) this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            }

            const resetHovered = this._hitTestResetButton(mouseX, mouseY);
            if (resetHovered !== this.resetHoverBtn) {
                this.resetHoverBtn = resetHovered;
                if (resetHovered) this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
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

        const hoveredTabIndex = this._hitTestTab(mouseX, mouseY);
        if (hoveredTabIndex !== this.tabHoverIndex) {
            this.tabHoverIndex = hoveredTabIndex;
            if (hoveredTabIndex >= 0 && hoveredTabIndex !== this.activeTabIndex) {
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            }
        }
        if (hoveredTabIndex >= 0) return;

        // outfit slot hover
        const outfitHit = this._hitTestOutfitPanel(mouseX, mouseY);
        const newSlot = outfitHit ? outfitHit.slot : -1;
        const newBtn = outfitHit ? outfitHit.btn : null;
        if (newSlot !== this.outfitSlotsHoverSlot || newBtn !== this.outfitSlotsHoverBtn) {
            if (newSlot >= 0 && newSlot !== this.outfitSlotsHoverSlot) {
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            }
            this.outfitSlotsHoverSlot = newSlot;
            this.outfitSlotsHoverBtn = newBtn;
        }
        if (outfitHit) {
            const outfitStart = this._getOutfitSlotsStartIndex();
            const targetIdx = outfitStart + outfitHit.slot;
            if (this.selectedOption !== targetIdx) {
                this.selectedOption = targetIdx;
                this.outfitSlotFocusedBtn = null;
            }
            return;
        }

        const gb = this._getGoBackLayout();
        const goBackIndex = this._getGoBackIndex();

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

        const tab = this._getActiveTab();
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
        if (!this._canInteract()) return;

        if (this.modal) {
            this._handleModalMouseClick(event);
            return;
        }

        const { mouseX, mouseY } = this.canvasMouse(event);
        const ctx = this._getUiCtx();

        if (this._tryClickChromaSwatch(mouseX, mouseY)) return;
        if (this._tryClickDetailsIcon(mouseX, mouseY)) return;

        // outfit slots click
        const outfitHit = this._hitTestOutfitPanel(mouseX, mouseY);
        if (outfitHit) {
            if (outfitHit.btn === 'save') {
                this._saveOutfitToSlot(outfitHit.slot);
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            } else if (outfitHit.btn === 'delete' && this.outfitSlots[outfitHit.slot]) {
                this._clearOutfitSlot(outfitHit.slot);
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            } else if (outfitHit.btn === null && this.outfitSlots[outfitHit.slot]) {
                this._loadOutfitFromSlot(outfitHit.slot);
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            }
            return;
        }

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

            if (this._hitTestRandomizerButton(mouseX, mouseY)) {
                this._randomizeOutfit();
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
                return;
            }

            if (this._hitTestResetButton(mouseX, mouseY)) {
                this._resetToDefault();
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
                return;
            }
        }

        const clickedTabIndex = this._hitTestTab(mouseX, mouseY);
        if (clickedTabIndex >= 0) {
            this._setActiveTab(clickedTabIndex, { playSound: false });
            this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
            return;
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
        this._clearDetailsHitboxes();

        this.drawBackdrop(context);

        context.save();
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
        this._drawRandomizerButton(context);
        this._drawResetButton(context);
        this._drawOutfitSlots(context);

        if (this.modal) this._drawModal(context);
        this._drawPurchaseConfetti(context);

        context.restore();
    }

    _drawPurchaseConfetti(ctx) {
        if (!Array.isArray(this.purchaseConfetti) || this.purchaseConfetti.length === 0) return;
        for (const confetti of this.purchaseConfetti) confetti.draw(ctx);
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
        this._drawCreditCoinAmount(ctx, cc, x, y + 18, {
            align: 'right',
            textBaseline: 'top',
            font: cfg.valueFont,
            fillStyle: isMaxed ? 'rgba(255,120,120,0.95)' : cfg.valueFill,
            iconRadius: 9,
            gap: 7,
            iconOffsetY: 2,
        });

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
            const isHovered = i === this.tabHoverIndex;

            const x = s.sidebarX + this.UI.sidebar.tabOffsetX;
            const y = s.sidebarTopY + i * (s.tabH + s.gap);

            context.fillStyle = (isActive || isHovered) ? cfg.bgFillHover : cfg.bgFill;
            this._roundRect(context, x, y, s.tabW, s.tabH, cfg.bgRadius);
            context.fill();

            if (isActive || isHovered) {
                context.strokeStyle = cfg.strokeHover;
                context.lineWidth = 2;
                context.stroke();
            }

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
            context.fillStyle = (isActive || isHovered) ? cfg.textFillHover : 'white';
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
                    index: idx,
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

    _drawItemCard(context, { tab, key, index, label, x, y, size, isSelected }) {
        const cfg = this.UI.card;

        context.save();

        const item = this._getItemDef(tab, key);
        const owned = this._isItemOwned(item);

        const isNoneCosmetic = (tab.kind === 'cosmetic' && key === 'none');
        const showPrice = (!owned && !isNoneCosmetic);

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
        const priceText = String(price);

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
            while (
                priceFont > cfg.priceMinFont &&
                context.measureText(priceText).width + (priceFont * 0.95 * 2) > maxTextWidth
            ) {
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

        if (isSelected && owned && !isNoneCosmetic) {
            const d = cfg.details;
            const bx = x + d.margin;
            const by = y + d.margin;
            this._drawDetailsIcon(context, bx, by, d.size, true);
            this._detailsHitboxes.push({ key, index, x: bx - 4, y: by - 4, w: d.size + 8, h: d.size + 8 });
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
            const priceFill = isSelected ? 'rgba(255,255,0,0.92)' : 'rgba(255,255,255,0.75)';
            this._drawCreditCoinAmount(context, price, baseX, priceY, {
                align: 'center',
                textBaseline: 'bottom',
                font: `${isSelected ? 'bold ' : ''}${priceFont}px Arial`,
                fillStyle: priceFill,
                iconRadius: Math.max(4.5, priceFont * 0.42),
                gap: 4,
                iconOffsetY: 1,
            });
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

    _drawDetailsIcon(ctx, x, y, size, emphasized = false) {
        const cfg = this.UI.card.details;
        const r = size / 2;
        const cx = x + r;
        const cy = y + r;

        ctx.save();
        ctx.shadowColor = emphasized ? 'rgba(255,255,0,0.20)' : 'transparent';
        ctx.shadowBlur = emphasized ? 8 : 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = emphasized ? cfg.fillHover : cfg.fill;
        ctx.strokeStyle = emphasized ? cfg.strokeHover : cfg.stroke;
        ctx.lineWidth = emphasized ? 2 : 1.5;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = emphasized ? cfg.iconFillHover : cfg.iconFill;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('i', cx, cy + 1);

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
        const goBackIndex = this._getGoBackIndex();
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

Object.assign(Wardrobe.prototype, wardrobeModalMethods);
