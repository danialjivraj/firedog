import { BaseMenu } from './baseMenu.js';

export class SettingsMenu extends BaseMenu {
  constructor(game) {
    const options = ['Audio', 'Controls', 'Level Difficulty', 'Delete Progress', 'Go Back'];
    super(game, options, 'Settings');
    this.menuInGame = false;
  }

  handleMenuSelection() {
    const selected = this.menuOptions[this.selectedOption];
    this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);

    if (selected === 'Audio') {
      this.game.currentMenu = this.game.menu.audioSettings;
      this.game.menu.audioSettings.activateMenu(0);
    } else if (selected === 'Controls') {
      this.game.currentMenu = this.game.menu.controlsSettings;
      this.game.menu.controlsSettings.activateMenu(0);
    } else if (selected === 'Level Difficulty') {
      this.game.currentMenu = this.game.menu.levelDifficulty;
      this.game.menu.levelDifficulty.activateMenu(this.game.menu.levelDifficulty.selectedDifficultyIndex);
    } else if (selected === 'Delete Progress') {
      this.game.currentMenu = this.game.menu.deleteProgress;
      this.game.menu.deleteProgress.activateMenu(1);
    } else if (selected === 'Go Back') {
      this.game.menu.main.activateMenu(4);
    }
  }
}
