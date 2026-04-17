import { BaseMenu } from "./baseMenu.js";

export class SettingsMenu extends BaseMenu {
    constructor(game) {
        const baseFullOptions = ["Audio", "Controls", "Difficulty", "Interface", "Tutorial", "Delete Progress", "Go Back"];
        super(game, baseFullOptions, "Settings");

        this._baseFullOptions = baseFullOptions;
        this.inGameOptions = ["Audio", "Controls", "Interface", "Go Back"];

        this.menuInGame = false;

        this._basePositionOffset = this.positionOffset;
        this._baseMenuOptionsPositionOffset = this.menuOptionsPositionOffset;
    }

    _tutorialLabel() {
        const on = this.game.isTutorialActive === true;
        return `Tutorial: ${on ? "ON" : "OFF"}`;
    }

    _isTutorialOption(optionText) {
        return typeof optionText === "string" && optionText.startsWith("Tutorial");
    }

    _buildFullMenuOptions() {
        return this._baseFullOptions.map((opt) => {
            if (opt === "Tutorial") return this._tutorialLabel();
            return opt;
        });
    }

    _refreshMenuOptionsInPlace() {
        if (this.menuInGame) return;
        const idx = this.menuOptions.findIndex((opt) => this._isTutorialOption(opt));
        if (idx !== -1) this.menuOptions[idx] = this._tutorialLabel();
    }

    _toIndex(value, fallback = 0) {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        return Math.floor(n);
    }

    activateMenu(arg = 0) {
        const isObj = arg && typeof arg === "object";

        const selectedOption = isObj ? this._toIndex(arg.selectedOption, 0) : this._toIndex(arg, 0);
        const inGame = isObj ? !!arg.inGame : false;

        this.menuInGame = inGame;
        this.menuOptions = this.menuInGame ? this.inGameOptions : this._buildFullMenuOptions();

        this._applyMenuLayout();

        super.activateMenu(selectedOption);
        this.selectedOption = Math.max(0, Math.min(this.selectedOption, this.menuOptions.length - 1));
    }

    activateFromNav(state = {}) {
        const inGame = state.menuInGame ?? this.menuInGame;
        const sel = this._toIndex(state.selectedOption ?? 0, 0);
        this.activateMenu({ inGame: !!inGame, selectedOption: sel });
    }

    _applyMenuLayout() {
        this.positionOffset = this._basePositionOffset;
        this.menuOptionsPositionOffset = this._baseMenuOptionsPositionOffset;

        if (!this.menuInGame) {
            this.positionOffset = this._basePositionOffset + 20;
            return;
        }

        const optionHeight = 60;
        const n = this.menuOptions.length;
        this.positionOffset = this.menuOptionsPositionOffset + (n * optionHeight) / 2;
    }

    handleMenuSelection() {
        const selected = this.menuOptions[this.selectedOption];
        this.game.audioHandler.menu.playSound("optionSelectedSound", false, true);

        if (!this.menuInGame && this._isTutorialOption(selected)) {
            this.game.isTutorialActive = !this.game.isTutorialActive;

            if (this.game.tutorial) {
                this.game.tutorial.tutorialPause = this.game.isTutorialActive === true;
            }

            if (typeof this.game.saveGameState === "function") {
                this.game.saveGameState();
            }

            this._refreshMenuOptionsInPlace();
            return;
        }

        if (selected === "Audio") {
            this.game.openMenu(this.game.menu.audioSettings, { inGame: this.menuInGame, selectedOption: 0 });
            return;
        }

        if (selected === "Controls") {
            this.game.openMenu(this.game.menu.controlsSettings, { inGame: this.menuInGame, selectedOption: 0 });
            return;
        }

        if (!this.menuInGame && selected === "Difficulty") {
            this.game.openMenu(this.game.menu.difficulty, 0);
            return;
        }

        if (selected === "Interface") {
            this.game.openMenu(this.game.menu.interfaceSettings, {
                inGame: this.menuInGame,
                selectedOption: this.game.uiLayoutStyle === "legacy" ? 1 : 0,
            });
            return;
        }

        if (!this.menuInGame && selected === "Delete Progress") {
            this.game.openMenu(this.game.menu.deleteProgress, 1);
            return;
        }

        if (selected === "Go Back") {
            this.game.goBackMenu();
            return;
        }
    }
}
