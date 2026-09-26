import { DomMenu } from "./dom/domMenu.js";
import { hasUnboundKeybind } from "./dom/menuBadges.js";

const PAUSABLE_CHANNELS = [
    "mapSoundtrack",
    "firedogSFX",
    "enemySFX",
    "collisionSFX",
    "powerUpAndDownSFX",
    "cutsceneMusic",
    "cutsceneSFX",
];

export class PauseMenu extends DomMenu {
    constructor(game) {
        super(game, ["Resume", "Restart", "Settings", "Back to Main Menu"], "Paused");
        this.isPaused = false;
        this.menuInGame = true;
        this.canEscape = false;
    }

    getOptionBadge(index) {
        return this.menuOptions[index] === "Settings" && hasUnboundKeybind(this.game);
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        super.handleMenuSelection();
        this.menuActive = false;

        if (selectedOption === "Resume") {
            this.togglePause();
        } else if (selectedOption === "Restart") {

            if (this.game.pauseContext === "storyCutscene") {
                this.game.restartActiveCutscene();
                if (this.isPaused) this.togglePause();
                return;
            }

            this.togglePause();
            this.game.reset();
        } else if (selectedOption === "Settings") {
            this.game.openMenu(this.game.menu.settings, {
                inGame: true,
                selectedOption: 0,
            });
        } else if (selectedOption === "Back to Main Menu") {

            const isStoryCutscene = this.game.pauseContext === "storyCutscene";
            const leavingEndCutscene = isStoryCutscene && this.game.isEndCutscene;

            if (isStoryCutscene) {
                this.game.exitCutsceneToMainMenu();
            }

            if (this.isPaused) this.togglePause();

            this.game.isPlayerInGame = false;
            this.game.reset();
            this.game.nav.clear();
            this.game.setMenuRoot(this.game.menu.main, 0);
            if (leavingEndCutscene) {
                this.game.announceEndCutsceneRewards({ delayMs: 450 });
                this.game.goToMainMenuWithSavingAnimation(4000);
            } else {
                this.game.menu.main.activateMenu();
            }
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.selectedOption = 0;

        if (this.isPaused === true) {
            if (this.game.cutsceneActive && this.game.currentCutscene) {
                this.game.pauseContext = this.game.isPlayerInGame ? "inGameCutscene" : "storyCutscene";
            } else {
                this.game.pauseContext = "gameplay";
            }

            this.game.setMenuRoot(this.game.menu.pause, 0);
        } else {
            this.game.ignoreCutsceneInputUntil = performance.now() + 200;

            this.game.menu.pause.closeAllMenus();
            this.game.nav.clear();
        }

        const action = this.isPaused ? "pauseAllSounds" : "resumeAllSounds";
        for (const channel of PAUSABLE_CHANNELS) {
            this.game.audioHandler[channel][action]();
        }

        this.canEscape = false;
        setTimeout(() => {
            this.canEscape = true;
        }, 1);
    }
}