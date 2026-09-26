import { DomMenu } from "./dom/domMenu.js";

const CARD_STYLES = [
    { style: "compact", label: "Compact UI" },
    { style: "legacy", label: "Legacy UI" },
];

const BACK_INDEX = 2;

const PREVIEW_W = 320;
const PREVIEW_H = 238;
const PREVIEW_SCALE = 2;

const PREVIEW_PLAYER_PATCH = {
    energy: 100,
    maxEnergy: 100,
    isEnergyExhausted: false,
    isBluePotionActive: false,
    isPoisonedActive: false,
    isRedPotionActive: false,
    redPotionTimer: 0,
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
};

export class InterfaceMenu extends DomMenu {
    constructor(game) {
        super(game, ["Compact UI", "Legacy UI", "Go Back"], "Interface Settings");
        this.menuInGame = false;
    }

    _currentStyleIndex() {
        return this.game.uiLayoutStyle === "legacy" ? 1 : 0;
    }

    activateMenu(arg = 0) {
        const opts = this.readActivation(arg);
        const selected = opts.selectedOption ?? this._currentStyleIndex();

        this.menuInGame = !!opts.inGame;
        super.activateMenu(Math.max(0, Math.min(selected, BACK_INDEX)));
    }

    // dom
    buildBody(body) {
        const grid = document.createElement("div");
        grid.className = "interface-cards";

        this.dom.cards = CARD_STYLES.map((entry, index) => {
            const card = document.createElement("div");
            card.className = "interface-card";

            const label = document.createElement("span");
            label.className = "interface-card__label";
            label.textContent = entry.label;

            const canvas = document.createElement("canvas");
            canvas.className = "interface-card__preview";
            canvas.width = PREVIEW_W * PREVIEW_SCALE;
            canvas.height = PREVIEW_H * PREVIEW_SCALE;
            canvas.style.width = `${PREVIEW_W}px`;
            canvas.style.height = `${PREVIEW_H}px`;

            card.append(label, canvas);
            this.bindHover(card, () => this.focusOption(index));

            grid.appendChild(card);
            return { root: card, canvas, style: entry.style };
        });

        body.appendChild(grid);
        [this.dom.back] = this.buildFooter(body, ["Go Back"], () => this.focusOption(BACK_INDEX));
    }

    _renderPreview(canvas, style) {
        const ui = this.game.UI;
        const ctx = canvas.getContext?.("2d");
        if (!ui || !ctx) return;

        ctx.save();
        ctx.setTransform(PREVIEW_SCALE, 0, 0, PREVIEW_SCALE, 0, 0);
        ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);

        ctx.fillStyle = "rgba(28, 42, 28, 0.95)";
        ctx.fillRect(0, 0, PREVIEW_W, PREVIEW_H);

        ctx.translate(8, 6);
        ctx.scale(PREVIEW_W / 310, PREVIEW_W / 310);

        ui.withHudLayoutStyle(style, () => {
            ui.drawTopLeftOnly(ctx, {
                previewCoins: 217,
                previewLives: 5,
                previewTime: 228000,
                drawAbilitiesWithPreviewState: true,
                previewPlayerPatch: {
                    ...PREVIEW_PLAYER_PATCH,
                    currentState: this.game.player?.states?.[0] ?? this.game.player?.currentState,
                },
            });
        });

        ctx.restore();
    }

    syncContent() {
        const activeStyle = this.game.uiLayoutStyle === "legacy" ? "legacy" : "compact";

        this.dom.cards.forEach((card, index) => {
            const isActive = card.style === activeStyle;
            card.root.classList.toggle("is-focused", this.selectedOption === index);
            card.root.classList.toggle("is-active", isActive);
            this._renderPreview(card.canvas, card.style);
        });

        this.dom.back.classList.toggle("is-focused", this.selectedOption === BACK_INDEX);
    }

    // behaviour
    _applyStyle(style) {
        if (this.game.uiLayoutStyle !== style) {
            this.game.uiLayoutStyle = style;
            this.game.saveGameState?.();
        }
        this.selectedOption = style === "legacy" ? 1 : 0;
        this.playSelect();
    }

    handleNavigation(delta) {
        this.selectedOption = Math.max(0, Math.min(this.selectedOption + Math.sign(delta), BACK_INDEX));
    }

    handleKeyDown(event) {
        if (!this._canInteract()) return;

        switch (event.key) {
            case "ArrowLeft":
                return this.focusOption(0);

            case "ArrowRight":
                return this.focusOption(1);

            case "ArrowDown":
                return this.focusOption(BACK_INDEX);

            case "ArrowUp":
                if (this.selectedOption === BACK_INDEX) this.focusOption(this._currentStyleIndex());
                return;

            case "Enter":
                event.preventDefault();
                event.stopImmediatePropagation();
                return this.handleMenuSelection();
        }
    }

    handleMenuSelection() {
        if (this.selectedOption === BACK_INDEX) {
            this.playSelect();
            this.game.goBackMenu();
            return;
        }
        this._applyStyle(this.selectedOption === 1 ? "legacy" : "compact");
    }
}
