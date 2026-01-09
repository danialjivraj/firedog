import { BaseMenu } from "./baseMenu.js";

export class SettingsMenu extends BaseMenu {
  constructor(game) {
    const fullOptions = ["Audio", "Controls", "Level Difficulty", "Delete Progress", "Go Back"];
    super(game, fullOptions, "Settings");

    this.fullOptions = fullOptions;
    this.inGameOptions = ["Audio", "Controls", "Go Back"];

    this.menuInGame = false;

    this._basePositionOffset = this.positionOffset;
    this._baseMenuOptionsPositionOffset = this.menuOptionsPositionOffset;

    this.returnMenu = "pause";
    this.returnSelectedOption = 2;
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
    this.menuOptions = this.menuInGame ? this.inGameOptions : this.fullOptions;

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

    if (selected === "Audio") {
      this.game.menu.audioSettings.activateMenu({ inGame: this.menuInGame, selectedOption: 0 });
      return;
    }

    if (selected === "Controls") {
      this.game.menu.controlsSettings.activateMenu({ inGame: this.menuInGame, selectedOption: 0 });
      return;
    }

    if (this.menuInGame && selected === "Go Back") {
      const target = this.game.menu?.[this.returnMenu];
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
