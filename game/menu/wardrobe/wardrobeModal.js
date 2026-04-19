import { SKINS, COSMETICS, drawWithOptionalHue, getCosmeticChromaDegFromState, getCosmeticChromaConfig, resolveCosmeticChromaVariant } from '../../config/skinsAndCosmetics.js';
import { drawCoinIcon } from '../../interface/coinIcon.js';

export const wardrobeModalMethods = {
    // modal navigation
    _getModalBrowseList() {
        const tab = this._getActiveTab();
        if (!tab) return { tab: null, keys: [] };

        if (!this.modal || this.modal.type !== 'preview') return { tab, keys: [] };

        const ordered = this._getActiveKeysForTab(tab);
        const keys = [];

        for (const k of ordered) {
            const it = this._getItemDef(tab, k);
            if (!it) continue;
            keys.push(k);
        }

        return { tab, keys };
    },

    _modalCanBrowse() {
        if (!this.modal || this.modal.type !== 'preview') return false;
        const { keys } = this._getModalBrowseList();
        return keys.length > 1;
    },

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
    },

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
    },

    _hitTestModalNav(mx, my) {
        if (!this._modalCanBrowse()) return { left: false, right: false };
        const { left, right } = this._getModalNavRects();
        return {
            left: this._hitTestRect(mx, my, left),
            right: this._hitTestRect(mx, my, right),
        };
    },

    // modal control
    _openPreviewModal(item, { previewChromaVariantId = null } = {}) {
        if (!item) return;

        // If the player is currently wearing the shiny skin, show its details instead of the default skin
        if (item.kind === 'skin' && item.key === 'defaultSkin' && this.currentSkinKey === 'shinySkin') {
            const shinyDef = SKINS?.shinySkin;
            if (shinyDef) {
                item = {
                    kind: 'skin',
                    slot: null,
                    key: 'shinySkin',
                    label: shinyDef.label,
                    price: shinyDef.price ?? 0,
                    gift: false,
                };
            }
        }

        const owned = this._isItemOwned(item);
        if (item.kind === 'skin' && item.gift && !owned) return;

        const afford = this._canAfford(item);

        this.modal = {
            type: 'preview',
            item,
            focusIndex: (!owned && !afford) ? 1 : 0,
            hoverClose: false,
            hoverNavLeft: false,
            hoverNavRight: false,

            previewChromaVariantId: null,
        };

        if (item.kind === 'cosmetic' && item.key !== 'none') {
            const ccfg = getCosmeticChromaConfig(item.slot, item.key);
            if (ccfg && Array.isArray(ccfg.variants) && ccfg.variants.length > 1) {
                let startVariantId = previewChromaVariantId;
                if (!startVariantId) {
                    startVariantId = owned
                        ? (this._getCosmeticChromaVariantId(item.slot, item.key) || ccfg.default)
                        : ccfg.default;
                }
                const resolved = resolveCosmeticChromaVariant(item.slot, item.key, startVariantId);
                this.modal.previewChromaVariantId = resolved?.id || ccfg.variants[0]?.id || null;
            }
        }
    },

    _openConfirmModal(item, { previewChromaVariantId = null } = {}) {
        if (!item) return;
        if (item.kind === 'skin' && item.gift) return;

        this.modal = {
            type: 'confirm',
            item,
            focusIndex: 0,
            hoverClose: false,
            hoverNavLeft: false,
            hoverNavRight: false,
            previewChromaVariantId,
        };
    },

    _closeModal() {
        this.modal = null;
    },

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
                    this._openConfirmModal(item, {
                        previewChromaVariantId: this.modal.previewChromaVariantId,
                    });
                    return true;
                }

                if (focused?.action === 'wear') {
                    this._wearItem(item);
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

                const item = this.modal.item;

                if (this.modal.focusIndex === 1) {
                    this._openPreviewModal(item, {
                        previewChromaVariantId: this.modal.previewChromaVariantId,
                    });
                    return true;
                }

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
    },

    _handleModalMouseMove(event) {
        if (!this.modal) return false;

        const { mouseX, mouseY } = this.canvasMouse(event);

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
    },

    _handleModalMouseClick(event) {
        if (!this.modal) return false;

        const { mouseX, mouseY } = this.canvasMouse(event);

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
                if (b.action === 'buy') {
                    this._openConfirmModal(this.modal.item, {
                        previewChromaVariantId: this.modal.previewChromaVariantId,
                    });
                } else if (b.action === 'wear') {
                    this._wearItem(this.modal.item);
                } else {
                    this._closeModal();
                }
                return true;
            }

            if (this.modal.type === 'confirm') {
                if (b.action === 'no') {
                    this._openPreviewModal(this.modal.item, {
                        previewChromaVariantId: this.modal.previewChromaVariantId,
                    });
                    return true;
                }

                const item = this.modal.item;
                this._purchaseItem(item);
                this._closeModal();
                return true;
            }
        }

        return true;
    },

    _getModalPanelRect() {
        const cfg = this.UI.modal;
        const w = Math.min(cfg.w, Math.floor(this.game.width * 0.86));
        const h = Math.min(cfg.h, Math.floor(this.game.height * 0.72));
        const x = Math.floor((this.game.width - w) / 2);
        const y = Math.floor((this.game.height - h) / 2);
        return { x, y, w, h };
    },

    _getModalCloseRect() {
        const cfg = this.UI.modal;
        const panel = this._getModalPanelRect();
        const s = cfg.close.size;
        const x = Math.floor(panel.x + panel.w - cfg.pad - s);
        const y = Math.floor(panel.y + cfg.pad - 2);
        return { x, y, w: s, h: s };
    },

    _getModalPreviewBoxRect(panel = null) {
        if (panel === null) panel = this._getModalPanelRect();
        const pcfg = this.UI.modal.preview;
        const sw = this.width;
        const sh = this.height;
        const boxPad = pcfg.pad;

        const w = Math.ceil(sw + boxPad * 2);
        const h = Math.ceil(sh + boxPad * 2);
        const x = Math.floor(panel.x + panel.w - this.UI.modal.pad - w);
        const y = Math.floor(panel.y + this.UI.modal.pad + this.UI.modal.headerH + 18);

        return { x, y, w, h, boxPad };
    },

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

            if (owned) {
                const isWearing = this._isCurrentlyWearing(item);
                const x2 = panel.x + panel.w - 26 - btnW;
                const x1 = x2 - gap - btnW;
                return [
                    { x: x1, y, w: btnW, h: btnH, label: 'Wear', action: 'wear', disabled: isWearing },
                    { x: x2, y, w: btnW, h: btnH, label: 'Close', action: 'close', disabled: false },
                ];
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
    },

    _getFontPx(ctx, fallback = 20) {
        const match = String(ctx.font || '').match(/(\d+(?:\.\d+)?)px/);
        const px = match ? Number(match[1]) : fallback;
        return Number.isFinite(px) ? px : fallback;
    },

    _getCoinIconCenterY(ctx, y, textBaseline, fontPx, text = '0') {
        const metrics = ctx.measureText(String(text));
        const ascent = metrics.actualBoundingBoxAscent;
        const descent = metrics.actualBoundingBoxDescent;

        if (Number.isFinite(ascent) && Number.isFinite(descent)) {
            if (textBaseline === 'top') return y + (ascent + descent) / 2;
            if (textBaseline === 'middle') return y + (descent - ascent) / 2;
            return y + (descent - ascent) / 2;
        }

        if (textBaseline === 'top') return y + fontPx * 0.5;
        if (textBaseline === 'middle') return y - fontPx * 0.18;
        return y - fontPx * 0.36;
    },

    _drawCreditCoinAmount(ctx, amount, x, y, {
        align = 'left',
        textBaseline = ctx.textBaseline || 'alphabetic',
        font = ctx.font,
        fillStyle = ctx.fillStyle,
        iconRadius = null,
        gap = 6,
        iconOffsetY = 0,
    } = {}) {
        const text = String(amount);

        ctx.save();
        ctx.font = font;
        ctx.textBaseline = textBaseline;
        ctx.textAlign = 'left';
        ctx.fillStyle = fillStyle;

        const fontPx = this._getFontPx(ctx);
        const radius = iconRadius ?? Math.max(5, fontPx * 0.42);
        const iconD = radius * 2;
        const textW = ctx.measureText(text).width;
        const totalW = iconD + gap + textW;

        let startX = x;
        if (align === 'center') startX = x - totalW / 2;
        else if (align === 'right') startX = x - totalW;

        drawCoinIcon(
            ctx,
            startX + radius,
            this._getCoinIconCenterY(ctx, y, textBaseline, fontPx, text) + iconOffsetY,
            radius,
            { palette: 'silver' }
        );

        ctx.fillText(text, startX + iconD + gap, y);
        ctx.restore();
    },

    _makeLinearGradient(ctx, x0, y0, x1, y1, stops) {
        if (typeof ctx.createLinearGradient !== 'function') return null;
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        for (const [offset, color] of stops) g.addColorStop(offset, color);
        return g;
    },

    _drawModalShell(ctx, panel) {
        const cfg = this.UI.modal;

        ctx.fillStyle = cfg.overlay;
        ctx.fillRect(-2, -2, this.game.width + 4, this.game.height + 4);

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.70)';
        ctx.shadowBlur = 28;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 14;
        this._roundRect(ctx, panel.x, panel.y, panel.w, panel.h, cfg.radius);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fill();
        ctx.restore();

        const panelFill = this._makeLinearGradient(ctx, panel.x, panel.y, panel.x, panel.y + panel.h, [
            [0, cfg.panelFill],
            [0.52, 'rgba(18, 12, 32, 0.98)'],
            [1, cfg.panelFillBottom],
        ]);

        ctx.save();
        this._roundRect(ctx, panel.x, panel.y, panel.w, panel.h, cfg.radius);
        ctx.fillStyle = panelFill || cfg.panelFill;
        ctx.fill();
        ctx.strokeStyle = cfg.panelStroke;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.strokeStyle = cfg.panelInnerStroke;
        ctx.lineWidth = 1;
        this._roundRect(ctx, panel.x + 5, panel.y + 5, panel.w - 10, panel.h - 10, Math.max(8, cfg.radius - 5));
        ctx.stroke();
        ctx.restore();

        const headerFill = this._makeLinearGradient(ctx, panel.x, panel.y, panel.x + panel.w, panel.y, [
            [0, 'rgba(255, 218, 65, 0.00)'],
            [0.24, cfg.accentSoft],
            [0.68, 'rgba(255, 255, 255, 0.06)'],
            [1, 'rgba(255, 218, 65, 0.00)'],
        ]);

        ctx.save();
        this._roundRect(ctx, panel.x + 10, panel.y + 10, panel.w - 20, cfg.headerH + 6, Math.max(10, cfg.radius - 8));
        ctx.fillStyle = headerFill || cfg.accentSoft;
        ctx.fill();
        ctx.restore();

        ctx.save();
        const lineY = panel.y + cfg.pad + cfg.headerH;
        const line = this._makeLinearGradient(ctx, panel.x + cfg.pad, lineY, panel.x + panel.w - cfg.pad, lineY, [
            [0, 'rgba(255, 218, 65, 0.00)'],
            [0.12, cfg.headerDividerStroke],
            [0.50, 'rgba(255, 255, 255, 0.22)'],
            [0.88, cfg.headerDividerStroke],
            [1, 'rgba(255, 218, 65, 0.00)'],
        ]);
        ctx.strokeStyle = line || cfg.headerDividerStroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(panel.x + cfg.pad, lineY);
        ctx.lineTo(panel.x + panel.w - cfg.pad, lineY);
        ctx.stroke();
        ctx.restore();
    },

    _drawModalHeader(ctx, panel, title, kicker) {
        const cfg = this.UI.modal;
        const headerX = panel.x + cfg.pad;
        const headerY = panel.y + cfg.pad;

        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.shadowColor = 'rgba(0,0,0,0.65)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.font = cfg.kickerFont;
        ctx.fillStyle = cfg.accent;
        ctx.fillText(kicker, headerX, headerY + 14);

        ctx.font = cfg.titleFont;
        ctx.fillStyle = 'white';
        ctx.fillText(title, headerX, headerY + 48);
        ctx.restore();
    },

    _drawModalPurchaseSummary(ctx, {
        x,
        y,
        w,
        price,
        balance,
        after,
        heading = 'PURCHASE SUMMARY',
        priceLabel = 'Price',
    }) {
        const cfg = this.UI.modal;
        const rowH = 29;
        const pad = 14;
        const headerH = 22;
        const dividerGap = 12;
        const h = pad + headerH + rowH * 3 + dividerGap + pad;
        const isShort = after < 0;
        const resultLabel = isShort ? 'Short by' : 'Remaining';
        const resultAmount = isShort ? Math.abs(after) : after;
        const resultFill = isShort ? 'rgba(255,80,80,0.95)' : 'rgba(180,255,150,0.95)';

        ctx.save();

        this._roundRect(ctx, x, y, w, h, 16);
        const fill = this._makeLinearGradient(ctx, x, y, x, y + h, [
            [0, 'rgba(255,255,255,0.075)'],
            [1, 'rgba(255,255,255,0.035)'],
        ]);
        ctx.fillStyle = fill || 'rgba(255,255,255,0.055)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.13)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = cfg.kickerFont;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = cfg.accent;
        ctx.fillText(heading, x + pad, y + pad + 12);

        const drawRow = ({ label, amount, yy, valueFill = cfg.infoValueFill, bold = false }) => {
            ctx.font = bold ? cfg.infoFont : '18px Arial';
            ctx.fillStyle = bold ? 'rgba(255,255,255,0.86)' : cfg.infoLabelFill;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x + pad, yy);

            this._drawCreditCoinAmount(ctx, amount, x + w - pad, yy, {
                align: 'right',
                textBaseline: 'middle',
                font: bold ? cfg.infoFont : '18px Arial',
                fillStyle: valueFill,
                iconRadius: bold ? 8.5 : 7.5,
                gap: 7,
            });
        };

        let yy = y + pad + headerH + rowH / 2;
        drawRow({ label: 'Balance', amount: balance, yy });
        yy += rowH;
        drawRow({ label: priceLabel, amount: price, yy });

        const lineY = yy + rowH / 2 + dividerGap / 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.13)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + pad, lineY);
        ctx.lineTo(x + w - pad, lineY);
        ctx.stroke();

        yy += rowH + dividerGap;
        drawRow({ label: resultLabel, amount: resultAmount, yy, valueFill: resultFill, bold: true });

        ctx.restore();
        return h;
    },

    _getItemSourceDef(item) {
        if (!item) return null;
        if (item.kind === 'skin') return SKINS?.[item.key] || null;
        return COSMETICS?.[item.slot]?.[item.key] || null;
    },

    _getItemTypeLabel(item) {
        if (item.kind === 'skin') return 'Skin';

        const tab = this.tabs.find((t) => t.kind === 'cosmetic' && t.slot === item.slot);
        return tab.title;
    },

    _getItemPreviewDescription(item) {
        return this._getItemSourceDef(item).description.trim();
    },

    _drawWrappedModalText(ctx, text, x, y, maxW, lineH, maxLines = 3) {
        const words = String(text || '').split(/\s+/).filter(Boolean);
        if (!words.length || maxLines <= 0) return 0;

        let line = '';
        let drawn = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const test = line ? `${line} ${word}` : word;

            if (ctx.measureText(test).width <= maxW || !line) {
                line = test;
                continue;
            }

            const isLastAllowedLine = drawn === maxLines - 1;
            if (isLastAllowedLine) {
                let clipped = line;
                while (clipped.length > 0 && ctx.measureText(`${clipped}...`).width > maxW) {
                    clipped = clipped.slice(0, -1).trimEnd();
                }
                ctx.fillText(`${clipped || line}...`, x, y + drawn * lineH);
                return maxLines * lineH;
            }

            ctx.fillText(line, x, y + drawn * lineH);
            drawn++;
            line = word;
        }

        if (line && drawn < maxLines) {
            ctx.fillText(line, x, y + drawn * lineH);
            drawn++;
        }

        return drawn * lineH;
    },

    _drawModalPreviewDetails(ctx, {
        item,
        x,
        y,
        w,
        price,
        balance,
        owned = false,
    }) {
        const cfg = this.UI.modal;
        const pad = 14;
        const h = 176;
        ctx.save();

        this._roundRect(ctx, x, y, w, h, 16);
        const fill = this._makeLinearGradient(ctx, x, y, x, y + h, [
            [0, 'rgba(255,255,255,0.070)'],
            [1, 'rgba(255,255,255,0.032)'],
        ]);
        ctx.fillStyle = fill || 'rgba(255,255,255,0.052)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.13)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = cfg.kickerFont;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = cfg.accent;
        ctx.fillText('ITEM DETAILS', x + pad, y + pad + 14);

        ctx.font = 'bold 19px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.84)';
        ctx.fillText(this._getItemTypeLabel(item), x + pad, y + pad + 43);

        ctx.font = '18px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.66)';
        this._drawWrappedModalText(
            ctx,
            this._getItemPreviewDescription(item),
            x + pad,
            y + pad + 70,
            w - pad * 2,
            21,
            2
        );

        const firstRowY = y + h - pad - 41;
        const secondRowY = firstRowY + 29;

        ctx.strokeStyle = 'rgba(255,255,255,0.11)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + pad, firstRowY - 24);
        ctx.lineTo(x + w - pad, firstRowY - 24);
        ctx.stroke();

        if (owned) {
            const rowY = Math.round((firstRowY + secondRowY) / 2);
            const font = 'bold 18px Arial';
            const isFree = price <= 0;
            const rowLabel = isFree ? 'Free' : 'Purchased';

            // checkmark circle on the left
            const ckR = 9;
            const ckX = x + pad + ckR;
            const ckY = rowY - 1;

            ctx.beginPath();
            ctx.arc(ckX, ckY, ckR, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(80,220,100,0.16)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(100,230,120,0.65)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.strokeStyle = 'rgba(150,255,170,0.95)';
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(ckX - 4, ckY + 0.5);
            ctx.lineTo(ckX - 1, ckY + 3.5);
            ctx.lineTo(ckX + 4.5, ckY - 3);
            ctx.stroke();

            ctx.font = font;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = cfg.infoLabelFill;
            ctx.fillText(rowLabel, ckX + ckR + 8, rowY);

            if (!isFree) {
                this._drawCreditCoinAmount(ctx, price, x + w - pad, rowY, {
                    align: 'right',
                    textBaseline: 'middle',
                    font,
                    fillStyle: cfg.infoValueFill,
                    iconRadius: 7.5,
                    gap: 6,
                });
            }
        } else {
            const canAfford = balance >= price;
            const priceFill = canAfford ? 'rgba(180,255,150,0.95)' : 'rgba(255,80,80,0.95)';

            const drawCoinRow = ({ label, amount, rowY, valueFill }) => {
                const font = 'bold 18px Arial';

                ctx.font = font;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = cfg.infoLabelFill;
                ctx.fillText(label, x + pad, rowY);

                this._drawCreditCoinAmount(ctx, amount, x + w - pad, rowY, {
                    align: 'right',
                    textBaseline: 'middle',
                    font,
                    fillStyle: valueFill,
                    iconRadius: 7.5,
                    gap: 6,
                });
            };

            drawCoinRow({ label: 'Balance', amount: balance, rowY: firstRowY,  valueFill: cfg.infoValueFill });
            drawCoinRow({ label: 'Price',   amount: price,   rowY: secondRowY, valueFill: priceFill });
        }

        ctx.restore();
        return h;
    },

    _isChromaPurchaseItem(item) {
        if (!item || item.kind !== 'cosmetic' || !item.slot || item.key === 'none') return false;
        const cfg = getCosmeticChromaConfig(item.slot, item.key);
        return !!(cfg && Array.isArray(cfg.variants) && cfg.variants.length > 1);
    },

    _drawModalChromaIncludedNote(ctx, { item, x, y }) {
        if (!this._isChromaPurchaseItem(item)) return 0;

        const h = 32;

        ctx.save();

        const iconX = x + 22;
        const iconY = y + h / 2 + 1;
        const dots = [
            { x: iconX - 7, y: iconY + 3, fill: '#5de6ff' },
            { x: iconX, y: iconY - 5, fill: '#ffdf5a' },
            { x: iconX + 7, y: iconY + 3, fill: '#ff72d2' },
        ];

        for (const dot of dots) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = dot.fill;
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.55)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.62)';
        ctx.fillText('Includes all chroma variants', x + 48, y + h / 2 + 1);

        ctx.restore();
        return h;
    },

    _drawModalGiftSkinNote(ctx, { item, x, y }) {
        if (!item || item.kind !== 'skin' || !item.gift) return 0;

        const h = 32;

        ctx.save();

        const iconX = x + 22;
        const iconY = y + h / 2;

        // star icon — same center and footprint as the chroma dots
        const starR = 11;
        const points = 5;
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const r = i % 2 === 0 ? starR : starR * 0.42;
            const px = iconX + r * Math.cos(angle);
            const py = iconY + r * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,218,65,0.90)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.62)';
        ctx.fillText('Unlocked by defeating a boss', x + 48, y + h / 2 + 1);

        ctx.restore();
        return h;
    },

    // modal draw
    _drawModal(ctx) {
        const cfg = this.UI.modal;
        const panel = this._getModalPanelRect();

        ctx.save();
        this._drawModalShell(ctx, panel);

        ctx.shadowColor = 'transparent';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        const pad = cfg.pad;

        this._drawModalCloseButton(ctx);

        const contentX = panel.x + pad;
        const contentTop = panel.y + pad + cfg.headerH + 18;
        const contentW = panel.w - (pad * 2) - 190;

        if (this.modal.type === 'preview') {
            const item = this.modal.item;
            const owned = this._isItemOwned(item);

            this._drawModalHeader(
                ctx,
                panel,
                item.label,
                owned ? 'OWNED ITEM' : 'PREVIEW'
            );


            this._drawModalSpritePreview(ctx, panel, item);
            this._drawModalNavButtons(ctx);

            const cc = Math.max(0, Math.floor(this.game.creditCoins || 0));
            const price = Math.max(0, Math.floor(item.price || 0));

            const detailsH = this._drawModalPreviewDetails(ctx, {
                item,
                x: contentX,
                y: contentTop,
                w: contentW,
                price,
                balance: cc,
                owned,
            });

            this._drawModalGiftSkinNote(ctx, { item, x: contentX, y: contentTop + detailsH + 8 });

            this._drawModalButtons(ctx);
            ctx.restore();
            return;
        }

        if (this.modal.type === 'confirm') {
            const item = this.modal.item;

            const price = Math.max(0, Math.floor(item.price || 0));
            const cc = Math.max(0, Math.floor(this.game.creditCoins || 0));
            const after = cc - price;

            this._drawModalHeader(ctx, panel, `Buy ${item.label}?`, 'FINAL CHECK');

            this._drawModalSpritePreview(ctx, panel, item);

            let y = contentTop;

            y += this._drawModalPurchaseSummary(ctx, {
                x: contentX,
                y,
                w: contentW,
                price,
                balance: cc,
                after,
                heading: 'PAYMENT BREAKDOWN',
                priceLabel: 'Price',
            }) + 10;

            this._drawModalChromaIncludedNote(ctx, { item, x: contentX, y });

            this._drawModalButtons(ctx);
            ctx.restore();
            return;
        }

        ctx.restore();
    },

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

        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        const d = 7;

        ctx.strokeStyle = hovered ? 'yellow' : c.fg;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - d, cy - d);
        ctx.lineTo(cx + d, cy + d);
        ctx.moveTo(cx + d, cy - d);
        ctx.lineTo(cx - d, cy + d);
        ctx.stroke();

        ctx.restore();
    },

    _drawModalSpritePreview(ctx, panel, item) {
        const pcfg = this.UI.modal.preview;

        const sw = this.width;
        const sh = this.height;
        const { x: boxX, y: boxY, w: boxW, h: boxH, boxPad } = this._getModalPreviewBoxRect(panel);

        ctx.save();
        const boxFill = this._makeLinearGradient(ctx, boxX, boxY, boxX, boxY + boxH, [
            [0, pcfg.boxFill],
            [0.58, 'rgba(32, 24, 44, 0.98)'],
            [1, pcfg.boxFillBottom],
        ]);
        ctx.fillStyle = boxFill || pcfg.boxFill;
        ctx.strokeStyle = pcfg.boxStroke;
        ctx.lineWidth = 2;
        this._roundRect(ctx, boxX, boxY, boxW, boxH, pcfg.radius);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        this._roundRect(ctx, boxX + 6, boxY + 6, boxW - 12, boxH - 12, Math.max(8, pcfg.radius - 6));
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        if (pcfg.glowEnabled) {
            ctx.save();
            const glowX = boxX + boxW / 2;
            const glowY = boxY + boxH * 0.82;
            const glowR = Math.min(boxW, boxH) * 0.31;

            ctx.translate(glowX, glowY);
            ctx.scale(1.45, 0.34);
            ctx.shadowColor = `rgba(255, 218, 65, ${pcfg.glowAlpha})`;
            ctx.shadowBlur = 18;
            ctx.fillStyle = `rgba(255, 218, 65, ${pcfg.glowAlpha * 0.55})`;
            ctx.beginPath();
            ctx.arc(0, 0, glowR, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        const { skinImg, overlays } = this._buildModalPreviewPose(item);
        const sx = this.frameX * sw;

        const dx = Math.floor(boxX + boxPad);
        const dy = Math.floor(boxY + boxPad);

        if (skinImg) {
            ctx.drawImage(skinImg, sx, 0, sw, sh, dx, dy, sw, sh);

            let previewHueDeg = 0;
            const owned = this._isItemOwned(item);
            if (item?.kind === 'cosmetic' && item.key !== 'none') {
                const ccfg = getCosmeticChromaConfig(item.slot, item.key);
                if (ccfg && Array.isArray(ccfg.variants) && ccfg.variants.length > 1) {
                    const variantId = this.modal?.previewChromaVariantId ||
                        (owned ? this._getCosmeticChromaVariantId(item.slot, item.key) : null) ||
                        ccfg.default;
                    const resolved = resolveCosmeticChromaVariant(item.slot, item.key, variantId);
                    previewHueDeg = Number.isFinite(resolved?.deg) ? resolved.deg : 0;
                }
            }

            for (const img of overlays) {
                this._drawImageWithOptionalHue(ctx, img, sx, 0, sw, sh, dx, dy, sw, sh, previewHueDeg);
            }
        }

        ctx.restore();

        if (item?.kind === 'cosmetic' && item.key !== 'none') {
            const ccfg = getCosmeticChromaConfig(item.slot, item.key);
            if (ccfg && Array.isArray(ccfg.variants) && ccfg.variants.length > 1) {
                const ownedItem = this._isItemOwned(item);
                const currentId =
                    this.modal?.previewChromaVariantId ||
                    (ownedItem ? this._getCosmeticChromaVariantId(item.slot, item.key) : null) ||
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
    },

    _drawModalNavButtons(ctx) {
        if (!this.modal || this.modal.type !== 'preview') return;
        if (!this._modalCanBrowse()) return;

        const ncfg = this.UI.modal.nav;
        const { left, right } = this._getModalNavRects();

        const drawBtn = (rect, dir) => {
            const hovered = (dir === -1) ? !!this.modal.hoverNavLeft : !!this.modal.hoverNavRight;

            ctx.save();
            ctx.shadowColor = hovered ? 'rgba(255, 218, 65, 0.36)' : 'rgba(0,0,0,0.35)';
            ctx.shadowBlur = hovered ? 10 : 5;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 3;

            this._roundRect(ctx, rect.x, rect.y, rect.w, rect.h, ncfg.radius);
            ctx.fillStyle = hovered ? ncfg.bgHover : ncfg.bg;
            ctx.fill();
            ctx.strokeStyle = hovered ? ncfg.strokeHover : ncfg.stroke;
            ctx.lineWidth = hovered ? 3 : 2;
            ctx.stroke();

            const cx = rect.x + rect.w / 2;
            const cy = rect.y + rect.h / 2;
            const tipX = cx + dir * 6;
            const backX = cx - dir * 5;
            const topY = cy - 9;
            const bottomY = cy + 9;

            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = hovered ? 'yellow' : ncfg.fg;
            ctx.lineWidth = 3.2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(backX, topY);
            ctx.lineTo(tipX, cy);
            ctx.lineTo(backX, bottomY);
            ctx.stroke();

            ctx.restore();
        };

        drawBtn(left, -1);
        drawBtn(right, 1);
    },

    _drawModalButtons(ctx) {
        const btns = this._getModalButtons();
        if (!btns.length) return;

        const cfg = this.UI.modal;
        const focus = (this.modal && Number.isFinite(this.modal.focusIndex)) ? this.modal.focusIndex : 0;

        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            const isDisabled = !!b.disabled;
            const isFocused = (!isDisabled && i === focus);
            const isPositive = b.action === 'buy' || b.action === 'yes';

            ctx.save();

            if (isDisabled) {
                ctx.fillStyle = 'rgba(0,0,0,0.18)';
                ctx.strokeStyle = 'rgba(255,255,255,0.10)';
                ctx.lineWidth = 2;
            } else {
                const fill = isFocused && isPositive
                    ? this._makeLinearGradient(ctx, b.x, b.y, b.x, b.y + b.h, [
                        [0, 'rgba(255, 230, 92, 0.34)'],
                        [1, 'rgba(255, 172, 36, 0.24)'],
                    ])
                    : null;

                ctx.fillStyle = fill || (isFocused ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)');
                ctx.strokeStyle = isFocused ? 'rgba(255,255,0,0.95)' : 'rgba(255,255,255,0.20)';
                ctx.lineWidth = isFocused ? 3 : 2;
                ctx.shadowColor = isFocused ? 'rgba(255, 218, 65, 0.28)' : 'rgba(0,0,0,0.22)';
                ctx.shadowBlur = isFocused ? 16 : 7;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 4;
            }

            this._roundRect(ctx, b.x, b.y, b.w, b.h, 14);
            ctx.fill();
            ctx.stroke();

            ctx.font = cfg.btnFont;
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.shadowColor = 'rgba(0,0,0,0.60)';
            ctx.fillStyle = isDisabled ? 'rgba(255,255,255,0.45)' : (isFocused ? 'yellow' : 'white');

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);

            ctx.restore();
        }
    },
};
