import { BaseMenu } from "./baseMenu.js";

export class SettingsMenu extends BaseMenu {
  constructor(game) {
    const baseFullOptions = ["Audio", "Controls", "Level Difficulty", "Tutorial Activation", "Delete Progress", "Go Back"];
    super(game, baseFullOptions, "Settings");

    this._baseFullOptions = baseFullOptions;
    this.inGameOptions = ["Audio", "Controls", "Go Back"];

    this.menuInGame = false;

    this._basePositionOffset = this.positionOffset;
    this._baseMenuOptionsPositionOffset = this.menuOptionsPositionOffset;

    this.returnMenu = "pause";
    this.returnSelectedOption = 2;
  }

  _tutorialLabel() {
    const on = this.game.isTutorialActive === true;
    return `Tutorial Activation: ${on ? "ON" : "OFF"}`;
  }

  _isTutorialOption(optionText) {
    return typeof optionText === "string" && optionText.startsWith("Tutorial Activation");
  }

  _buildFullMenuOptions() {
    return this._baseFullOptions.map((opt) => {
      if (opt === "Tutorial Activation") return this._tutorialLabel();
      return opt;
    });
  }

  _refreshMenuOptionsInPlace() {
    if (this.menuInGame) return;

    const idx = this.menuOptions.findIndex((opt) => this._isTutorialOption(opt));
    if (idx !== -1) {
      this.menuOptions[idx] = this._tutorialLabel();
    }
  }

  activateMenu(arg = 0) {
    let selectedOption = 0;
    let inGame = false;

    if (typeof arg === "number") {
      selectedOption = arg;
    } else if (arg && typeof arg === "object") {
      if (typeof arg.selectedOption === "number") selectedOption = arg.selectedOption;
      if (typeof arg.inGame === "boolean") inGame = arg.inGame;

      if (typeof arg.returnMenu === "string") this.returnMenu = arg.returnMenu;
      if (typeof arg.returnSelectedOption === "number") this.returnSelectedOption = arg.returnSelectedOption;
    }

    this.menuInGame = inGame;

    this.menuOptions = this.menuInGame ? this.inGameOptions : this._buildFullMenuOptions();

    this._applyInGameLayout();

    super.activateMenu(selectedOption);
    this.selectedOption = Math.max(0, Math.min(this.selectedOption, this.menuOptions.length - 1));
  }

  _applyInGameLayout() {
    this.positionOffset = this._basePositionOffset;
    this.menuOptionsPositionOffset = this._baseMenuOptionsPositionOffset;

    if (!this.menuInGame) return;

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
      this.game.menu.audioSettings.activateMenu({ inGame: this.menuInGame, selectedOption: 0 });
      return;
    }

    if (selected === "Controls") {
      this.game.menu.controlsSettings.activateMenu({ inGame: this.menuInGame, selectedOption: 0 });
      return;
    }

    if (this.menuInGame && selected === "Go Back") {
      const target = this.game.menu[this.returnMenu];
      if (target && typeof target.activateMenu === "function") {
        target.activateMenu(this.returnSelectedOption);
      } else {
        this.game.menu.pause.activateMenu(2);
      }
      return;
    }

    if (!this.menuInGame && selected === "Level Difficulty") {
      this.game.menu.levelDifficulty.activateMenu(this.game.menu.levelDifficulty.selectedDifficultyIndex);
    } else if (!this.menuInGame && selected === "Delete Progress") {
      this.game.menu.deleteProgress.activateMenu(1);
    } else if (!this.menuInGame && selected === "Go Back") {
      this.game.menu.main.activateMenu(4);
    }
  }
}
