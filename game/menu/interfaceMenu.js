import { BaseMenu } from "./baseMenu.js";

export class InterfaceMenu extends BaseMenu {
    constructor(game) {
        super(game, ["Compact UI", "Legacy UI", "Go Back"], "Interface Settings");

        this.menuInGame = false;

        this._basePositionOffset = this.positionOffset;
        this._baseMenuOptionsPositionOffset = this.menuOptionsPositionOffset;
    }

    _toIndex(value, fallback = 0) {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        return Math.floor(n);
    }

    _currentStyleIndex() {
        return this.game.uiLayoutStyle === "legacy" ? 1 : 0;
    }

    activateMenu(arg = 0) {
        const isObj = arg && typeof arg === "object";
        const inGame = isObj ? !!arg.inGame : false;
        const selectedOption = isObj
            ? this._toIndex(arg.selectedOption, this._currentStyleIndex())
            : this._toIndex(arg, this._currentStyleIndex());

        this.menuInGame = inGame;
        this.showStarsSticker = !inGame;
        this.positionOffset = this._basePositionOffset;
        this.menuOptionsPositionOffset = this._baseMenuOptionsPositionOffset;

        super.activateMenu(selectedOption);
        this.selectedOption = Math.max(0, Math.min(this.selectedOption, 2));
    }

    activateFromNav(state = {}) {
        this.activateMenu({
            inGame: state.menuInGame ?? this.menuInGame,
            selectedOption: state.selectedOption ?? this._currentStyleIndex(),
        });
    }

    getNavState() {
        return {
            selectedOption: this.selectedOption ?? 0,
            menuInGame: this.menuInGame,
        };
    }

    _cardRects() {
        const cardW = 460;
        const cardH = 350;
        const gap = 40;
        const totalW = cardW * 2 + gap;
        const startX = (this.game.width - totalW) / 2;
        const y = 160;

        return [
            { x: startX, y, w: cardW, h: cardH, style: "compact", label: "Compact UI" },
            { x: startX + cardW + gap, y, w: cardW, h: cardH, style: "legacy", label: "Legacy UI" },
        ];
    }

    _backRect() {
        const w = 300;
        const h = 56;
        return {
            x: this.game.width / 2 - w / 2,
            y: 580,
            w,
            h,
        };
    }

    _hitTestRect(mouseX, mouseY, rect) {
        return (
            mouseX >= rect.x &&
            mouseX <= rect.x + rect.w &&
            mouseY >= rect.y &&
            mouseY <= rect.y + rect.h
        );
    }

    _setHoveredOption(next) {
        if (next === this.selectedOption) return;
        this.selectedOption = next;
        this.game.audioHandler.menu.playSound("optionHoveredSound", false, true);
    }

    _applyStyle(style) {
        const normalized = style === "legacy" ? "legacy" : "compact";
        if (this.game.uiLayoutStyle !== normalized) {
            this.game.uiLayoutStyle = normalized;
            this.game.saveGameState?.();
        }
        this.selectedOption = normalized === "legacy" ? 1 : 0;
        this.game.audioHandler.menu.playSound("optionSelectedSound", false, true);
    }

    handleNavigation(delta) {
        if (delta < 0) {
            if (this.selectedOption === 1) this.selectedOption = 0;
            else if (this.selectedOption === 2) this.selectedOption = 1;
        } else {
            if (this.selectedOption === 0) this.selectedOption = 1;
            else if (this.selectedOption === 1) this.selectedOption = 2;
        }
    }

    handleKeyDown(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;

        if (event.key === "ArrowLeft") {
            if (this.selectedOption === 1) this._setHoveredOption(0);
            else if (this.selectedOption === 2) this._setHoveredOption(0);
        } else if (event.key === "ArrowRight") {
            if (this.selectedOption === 0) this._setHoveredOption(1);
            else if (this.selectedOption === 2) this._setHoveredOption(1);
        } else if (event.key === "ArrowDown") {
            if (this.selectedOption !== 2) this._setHoveredOption(2);
        } else if (event.key === "ArrowUp") {
            if (this.selectedOption === 2) this._setHoveredOption(this._currentStyleIndex());
        } else if (event.key === "Enter") {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.handleMenuSelection();
        }
    }

    handleMouseWheel(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;
        const delta = Math.sign(event.deltaY);
        this.handleNavigation(delta);
        this.game.audioHandler.menu.playSound("optionHoveredSound", false, true);
    }

    handleMouseMove(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;

        const { mouseX, mouseY } = this.canvasMouse(event);
        const cards = this._cardRects();
        const back = this._backRect();

        if (this._hitTestRect(mouseX, mouseY, cards[0])) return this._setHoveredOption(0);
        if (this._hitTestRect(mouseX, mouseY, cards[1])) return this._setHoveredOption(1);
        if (this._hitTestRect(mouseX, mouseY, back)) return this._setHoveredOption(2);
    }

    handleMouseClick(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const { mouseX, mouseY } = this.canvasMouse(event);
        const cards = this._cardRects();
        const back = this._backRect();

        if (this._hitTestRect(mouseX, mouseY, cards[0])) {
            this._applyStyle("compact");
            return;
        }

        if (this._hitTestRect(mouseX, mouseY, cards[1])) {
            this._applyStyle("legacy");
            return;
        }

        if (this._hitTestRect(mouseX, mouseY, back)) {
            this.selectedOption = 2;
            this.handleMenuSelection();
            return;
        }

        this.handleMenuSelection();
    }

    handleMenuSelection() {
        if (this.selectedOption === 0) {
            this._applyStyle("compact");
            return;
        }

        if (this.selectedOption === 1) {
            this._applyStyle("legacy");
            return;
        }

        this.game.audioHandler.menu.playSound("optionSelectedSound", false, true);
        this.game.goBackMenu();
    }

    _fillRoundedPanel(context, x, y, w, h, radius, borderWidth, borderColor, fillColor) {
        context.save();
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        context.fillStyle = borderColor;
        context.beginPath();
        context.roundRect(x, y, w, h, radius);
        context.fill();

        const inset = borderWidth;
        context.fillStyle = fillColor;
        context.beginPath();
        context.roundRect(
            x + inset,
            y + inset,
            Math.max(0, w - inset * 2),
            Math.max(0, h - inset * 2),
            Math.max(0, radius - inset)
        );
        context.fill();
        context.restore();
    }

    _drawPreview(context, rect, style, selected, active) {
        const ui = this.game.UI;
        if (!ui) return;

        const radius = 22;
        const previewPadX = 20;
        const previewTop = 72;
        const previewBottomPad = 26;
        const previewX = rect.x + previewPadX;
        const previewY = rect.y + previewTop;
        const previewW = rect.w - previewPadX * 2;
        const previewH = rect.h - previewTop - previewBottomPad;
        const scale = Math.min(previewW / 310, previewH / 245);

        context.save();
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        const borderWidth = active ? 5 : (selected ? 4 : 3);
        const borderColor = active ? "#f0d85a" : (selected ? "rgb(220, 224, 232)" : "rgb(108, 112, 120)");
        const fillColor = selected ? "rgb(18, 22, 28)" : "rgb(12, 16, 20)";
        this._fillRoundedPanel(context, rect.x, rect.y, rect.w, rect.h, radius, borderWidth, borderColor, fillColor);

        context.font = "bold 28px Love Ya Like A Sister";
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillStyle = "white";
        context.shadowColor = "black";
        context.shadowBlur = 4;
        context.fillText(rect.label, rect.x + rect.w / 2, rect.y + 16);

        if (active) {
            context.font = "bold 18px Arial";
            context.fillStyle = "#f0d85a";
            context.fillText("ACTIVE", rect.x + rect.w / 2, rect.y + 52);
        }

        context.save();
        context.beginPath();
        context.roundRect(previewX, previewY, previewW, previewH, 16);
        context.clip();

        context.fillStyle = "rgba(28, 42, 28, 0.95)";
        context.fillRect(previewX, previewY, previewW, previewH);

        context.translate(previewX + 8, previewY + 6);
        context.scale(scale, scale);
        ui.withHudLayoutStyle(style, () => {
            ui.drawTopLeftOnly(context, {
                previewCoins: 217,
                previewLives: 5,
                previewTime: 228000,
                drawAbilitiesWithPreviewState: true,
                previewPlayerPatch: {
                    energy: 100,
                    maxEnergy: 100,
                    isEnergyExhausted: false,
                    isBluePotionActive: false,
                    isPoisonedActive: false,
                    isRedPotionActive: false,
                    redPotionTimer: 0,
                    currentState: this.game.player?.states?.[0] ?? this.game.player?.currentState,
                    isInvisible: false,
                    invisibleTimer: 35000,
                    invisibleCooldown: 35000,
                    invisibleActiveCooldownTimer: 0,
                    divingTimer: 300,
                    divingCooldown: 300,
                    fireballTimer: 1200,
                    fireballCooldown: 1200,
                    dashTimer: 60000,
                    dashCooldown: 60000,
                    dashBetweenTimer: 500,
                    dashBetweenCooldown: 500,
                    dashCharges: 2,
                    dashAwaitingSecond: false,
                    dashSecondWindowTimer: 0,
                    isHourglassActive: false,
                    hourglassTimer: 0,
                    isFrozen: false,
                    isUnderwater: false,
                },
            });
        });

        context.restore();
        context.restore();
    }

    draw(context) {
        if (!this.menuActive) return;

        this.drawBackdrop(context);
        this.drawTitle(context, 96);

        const cards = this._cardRects();
        const activeStyle = this.game.uiLayoutStyle === "legacy" ? "legacy" : "compact";

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            card.label = i === 0 ? "Compact UI" : "Legacy UI";
            this._drawPreview(context, card, card.style, this.selectedOption === i, activeStyle === card.style);
        }

        const back = this._backRect();
        context.save();
        context.font = this.selectedOption === 2 ? 'bold 36px Arial' : '34px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = this.selectedOption === 2 ? 'yellow' : 'white';
        context.shadowColor = 'black';
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.fillText('Go Back', back.x + back.w / 2, back.y + back.h / 2);
        context.restore();

        if (this.showStarsSticker && !this.menuInGame) {
            this.drawStarsSticker(context);
        }
    }
}
