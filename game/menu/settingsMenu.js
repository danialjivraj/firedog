import { DomMenu } from "./dom/domMenu.js";
import { hasUnboundKeybind } from "./dom/menuBadges.js";

const FULL_OPTIONS = ["Audio", "Controls", "Difficulty", "Interface", "Display", "Tutorial", "Delete Progress", "Go Back"];
const IN_GAME_OPTIONS = ["Audio", "Controls", "Interface", "Display", "Go Back"];

export class SettingsMenu extends DomMenu {
    constructor(game) {
        super(game, FULL_OPTIONS, "Settings");
        this.menuInGame = false;
    }

    getOptionLabel(index) {
        const option = this.menuOptions[index];
        if (option === "Tutorial") return `Tutorial: ${this.game.isTutorialActive === true ? "ON" : "OFF"}`;
        if (option === "Display") return `Display: ${this.game.windowMode === "fullscreen" ? "Fullscreen" : "Windowed"}`;
        return option;
    }

    getOptionBadge(index) {
        return this.menuOptions[index] === "Controls" && hasUnboundKeybind(this.game);
    }

    activateMenu(arg = 0) {
        const { selectedOption = 0, inGame = false } = this.readActivation(arg);

        this.menuInGame = !!inGame;
        this.menuOptions = this.menuInGame ? IN_GAME_OPTIONS : FULL_OPTIONS;

        super.activateMenu(Math.max(0, Math.min(selectedOption, this.menuOptions.length - 1)));
    }

    handleMenuSelection() {
        const selected = this.menuOptions[this.selectedOption];
        this.playSelect();

        const openWithContext = (menu, selectedOption = 0) =>
            this.game.openMenu(menu, { inGame: this.menuInGame, selectedOption });

        switch (selected) {
            case "Audio":
                return openWithContext(this.game.menu.audioSettings);

            case "Controls":
                return openWithContext(this.game.menu.controlsSettings);

            case "Difficulty":
                return this.game.openMenu(this.game.menu.difficulty, 0);

            case "Interface":
                return openWithContext(this.game.menu.interfaceSettings, this.game.uiLayoutStyle === "legacy" ? 1 : 0);

            case "Tutorial":
                this.game.isTutorialActive = !this.game.isTutorialActive;
                if (this.game.tutorial) this.game.tutorial.tutorialPause = this.game.isTutorialActive === true;
                return this.game.saveGameState?.();

            case "Display": {
                const mode = this.game.windowMode === "fullscreen" ? "windowed" : "fullscreen";
                this.game.windowMode = mode;
                window.electronAPI?.setWindowMode?.(mode);
                return this.game.saveGameState?.();
            }

            case "Delete Progress":
                return this.game.openMenu(this.game.menu.deleteProgress, 1);

            case "Go Back":
                return this.game.goBackMenu();
        }
    }
}
