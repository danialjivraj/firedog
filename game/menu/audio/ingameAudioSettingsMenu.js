import { BaseMenu } from '../baseMenu.js';

export class IngameAudioSettingsMenu extends BaseMenu {
    constructor(game) {
        super(game, ['In-game Master Volume', 'Map Soundtrack', 'Firedog SFX', 'Enemy SFX', 'Collision SFX', 'Power Up/Down SFX', 'Go Back'], '');

        this.canPressNow = true;
        this.delayedEnablePress = this.delayedEnablePress.bind(this);
        this.selectedOption = 0;

        this.audioMap = {
            'In-game Master Volume': {
                ...this.game.audioHandler.mapSoundtrack.getSoundsMapping(),
                ...this.game.audioHandler.enemySFX.getSoundsMapping(),
                ...this.game.audioHandler.firedogSFX.getSoundsMapping(),
                ...this.game.audioHandler.explosionSFX.getSoundsMapping(),
                ...this.game.audioHandler.powerUpAndDownSFX.getSoundsMapping(),
            },
            'Map Soundtrack': { ...this.game.audioHandler.mapSoundtrack.getSoundsMapping(), },
            'Firedog SFX': { ...this.game.audioHandler.firedogSFX.getSoundsMapping(), },
            'Enemy SFX': { ...this.game.audioHandler.enemySFX.getSoundsMapping(), },
            'Collision SFX': { ...this.game.audioHandler.explosionSFX.getSoundsMapping(), },
            'Power Up/Down SFX': { ...this.game.audioHandler.powerUpAndDownSFX.getSoundsMapping(), },
        };

        this.volumeLevels = [100, 50, 50, 90, 90, 90, null];

        for (let i = 0; i < this.menuOptions.length; i++) {
            const audioElementId = this.audioMap[this.menuOptions[i]];
            if (audioElementId) {
                this.updateAudioVolume(audioElementId, i);
            }
        }
    }
    roundRect(context, x, y, width, height, radius, fill, stroke) {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();

        if (fill) {
            context.fill();
        }
        if (stroke) {
            context.stroke();
        }
    }

    draw(context) {
        context.save();
        context.font = 'bold 46px Love Ya Like A Sister';
        context.fillStyle = 'white';
        context.shadowColor = 'black';
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.textAlign = 'center';
        context.fillText(this.title, this.game.width / 2, this.game.height / 2 - 220);
        context.font = '34px Arial';

        context.textAlign = 'right';

        for (let i = 0; i < this.menuOptions.length; i++) {
            if (i === this.selectedOption) {
                context.font = '36px Arial';
                context.fillStyle = 'yellow';
            } else {
                context.font = '34px Arial';
                context.fillStyle = 'white';
            }

            const x = this.game.width / 2;
            const y = this.game.height / 2 + i * 60 - 85;

            // menu option text
            context.fillText(this.menuOptions[i], x - 50, y - 80);

            // volume slider
            if (this.volumeLevels[i] !== null) {
                const sliderX = this.game.width / 2 - 30;
                const sliderY = this.game.height / 2 + i * 60 - 185;
                const sliderWidth = 300;
                const sliderHeight = 25;
                const borderRadius = 14;

                // slider track
                context.fillStyle = '#ccc';
                this.roundRect(context, sliderX, sliderY, sliderWidth, sliderHeight, borderRadius, true, false);

                // slider handle based on the volume level (circle)
                const handleRadius = sliderHeight / 2;
                const handleX = sliderX + (sliderWidth - 2 * handleRadius) * (this.volumeLevels[i] / 100);

                // draws the shadow for the green circle
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
                context.shadowBlur = 0;
                context.shadowColor = '#4CAF50';

                // draws the green circle
                context.fillStyle = '#4CAF50';
                context.beginPath();
                context.arc(handleX + handleRadius, sliderY + sliderHeight / 2, handleRadius, 0, 2 * Math.PI);
                context.fill();

                // resets shadow settings
                context.shadowOffsetX = 3;
                context.shadowOffsetY = 3;
                context.shadowBlur = 3;
                context.shadowColor = 'black';

                // volume percentage indicator
                context.save();
                const volumeText = `${this.volumeLevels[i]}%`;
                context.fillStyle = 'white';
                context.font = '20px Arial';
                context.fillText(volumeText, sliderX + sliderWidth, sliderY + sliderHeight / 2 - 20);
                context.restore();
            }
        }
        context.restore();
    }
    delayedEnablePress() {
        setTimeout(() => {
            this.canPressNow = true;
        }, 10);
    }
    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        super.handleMenuSelection();

        if ((this.game.isPlayerInGame && (this.game.currentMenu === this.game.menuInstances.ingameAudioSettingsMenu)) && selectedOption === 'Go Back') {
            this.delayedEnablePress();
            this.menuActive = false;
            this.game.currentMenu = false;
            this.game.ingamePauseMenu.menuActive = 'default';
            this.selectedOption = 0;
            this.canPressNow = false;
        } else if (selectedOption === 'Go Back') {
            this.menuActive = false;
            this.game.currentMenu = this.game.menuInstances.mainMenu;
            this.selectedOption = 0;
            this.canPressNow = true;
        }
    }
    getState() {
        return {
            volumeLevels: [...this.volumeLevels],
        };
    }
    setState(state) {
        if (state.volumeLevels) {
            this.volumeLevels = [...state.volumeLevels];
            for (let i = 0; i < this.menuOptions.length; i++) {
                const audioElementId = this.audioMap[this.menuOptions[i]];
                if (audioElementId) {
                    this.updateAudioVolume(audioElementId, i);
                }
            }
        }
    }
    handleKeyDown(event) {
        super.handleKeyDown(event);
        if (this.menuActive) {
            const selectedOption = this.menuOptions[this.selectedOption];
            const audioElementId = this.audioMap[selectedOption];

            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                const isLeft = event.key === 'ArrowLeft';
                const currentIndex = this.selectedOption;
                const currentVolume = this.volumeLevels[currentIndex];

                if (currentVolume !== null) {
                    const step = event.repeat ? 2 : 1; // uses step 2 if the key is held down

                    let newVolume = isLeft ? Math.max(0, currentVolume - step) : Math.min(100, currentVolume + step);

                    newVolume = Math.max(0, Math.min(100, newVolume));

                    this.volumeLevels[currentIndex] = newVolume;

                    // updates the volume of the associated audio element
                    this.updateAudioVolume(audioElementId, currentIndex);
                }
            } else if (event.key === 'Enter') {
                this.handleMenuSelection();
            }
        }
        this.game.saveGameState();
    }

    updateAudioVolume(audioElementId, index) {
        if (Array.isArray(audioElementId)) {
            for (const id of audioElementId) {
                this.updateSingleAudioVolume(id, index);
            }
        } else if (typeof audioElementId === 'object') {
            for (const key in audioElementId) {
                if (audioElementId.hasOwnProperty(key)) {
                    this.updateSingleAudioVolume(audioElementId[key], index);
                }
            }
        } else {
            this.updateSingleAudioVolume(audioElementId, index);
        }
    }

    updateSingleAudioVolume(id, index) {
        const audioElement = document.getElementById(id);
        const masterVolume = this.volumeLevels[0] / 100; // master volume is at index 0
        const currentVolume = this.volumeLevels[index];

        if (audioElement) {
            // sets the volume of the audio element, considering both master volume and individual volume
            audioElement.volume = (currentVolume / 100) * masterVolume;

            // updates other volume levels based on changes to master volume
            if (index === 0) {
                for (let i = 1; i < this.volumeLevels.length; i++) {
                    if (this.volumeLevels[i] !== null) {
                        const otherAudioElementId = this.audioMap[this.menuOptions[i]];
                        this.updateAudioVolume(otherAudioElementId, i);
                    }
                }
            }
        } else {
            console.error(`Audio element not found for ID: ${id}`);
        }
    }
}