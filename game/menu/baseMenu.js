//every menu extends from BaseMenu
export class BaseMenu {
    constructor(game, menuOptions, title) {
        this.game = game;
        this.centerX = this.game.width / 2;
        this.positionOffset = 220;
        this.menuOptionsPositionOffset = 65;
        this.menuOptions = menuOptions;
        this.title = title;
        this.selectedOption = 0;
        this.menuActive = false;
        this.menuInGame = false;
        this.isPaused = false;
        this.backgroundImage = document.getElementById('mainmenubackground');
        this.greenCompletedImage = document.getElementById('greenCompleted');

        this.optionWidth = 300;
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('click', this.handleMouseClick.bind(this));
        document.addEventListener('contextmenu', this.handleRightClick.bind(this));
        document.addEventListener('wheel', this.handleMouseWheel.bind(this));
    }
    draw(context) {
        if (this.menuActive) {
            context.save();
            if (this.menuInGame === false) {
                context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
            } else {
                if (this.game.menu.pause.isPaused) {
                    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    context.fillRect(0, 0, this.game.width, this.game.height);
                }
            }

            context.font = 'bold 46px Love Ya Like A Sister';
            context.fillStyle = 'white';
            context.shadowColor = 'black';
            context.shadowOffsetX = 3;
            context.shadowOffsetY = 3;
            context.textAlign = 'center';
            context.fillText(this.title, this.game.width / 2, this.game.height / 2 - this.positionOffset);
            context.font = '34px Arial';

            const optionHeight = 60;
            const topY = this.game.height / 2 - this.positionOffset + this.menuOptionsPositionOffset;

            for (let i = 0; i < this.menuOptions.length; i++) {
                const y = topY + (i * optionHeight);

                if (i === this.selectedOption) {
                    context.font = 'bold 36px Arial';
                    context.fillStyle = 'yellow';
                } else {
                    context.font = '34px Arial';
                    context.fillStyle = 'white';
                }
                context.fillText(this.menuOptions[i], this.centerX, y + optionHeight / 2);
            }

            context.restore();

            if (this.game.gameCompleted && this.menuInGame === false) {
                context.globalAlpha = 0.75;
                context.drawImage(this.greenCompletedImage, 10, 10);
                context.globalAlpha = 1;
            }
        }
    }
    update(deltaTime) {
        if (this.game.isPlayerInGame === false) {
            this.game.audioHandler.menu.playSound('soundtrack');
        }

        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }
    }

    activateMenu(selectedOption = 0) {
        this.menuActive = true;
        for (const menuName in this.game.menu) {
            if (menuName !== this.constructor.name) {
                this.game.menu[menuName].menuActive = false;
            }
        }
        this.selectedOption = selectedOption;
        this.game.currentMenu = this;
    }
    closeMenu() {
        this.menuActive = false;
        this.game.currentMenu = null;
    }
    closeAllMenus() {
        for (const menuName in this.game.menu) {
            this.game.menu[menuName].menuActive = false;
        }
        this.game.currentMenu = null;
    }

    handleMenuSelection() {
        this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
    }

    handleNavigation(delta) {
        if (delta < 0) {
            this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
        } else {
            this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
        }
    }
    //keyboard
    handleKeyDown(event) {
        if (this.menuActive && this.game.canSelect && this.game.canSelectForestMap) {
            if (event.key === 'ArrowUp') {
                this.handleNavigation(-1);
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            } else if (event.key === 'ArrowDown') {
                this.handleNavigation(1);
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            } else if (event.key === 'Enter') {
                this.handleMenuSelection();
            }
        }
    }
    //mouse
    handleMouseWheel(event) {
        if (this.menuActive && this.game.canSelect && this.game.canSelectForestMap) {
            const delta = Math.sign(event.deltaY);
            this.handleNavigation(delta);
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
        }
    }
    handleRightClick(event) {
        if (this.menuActive && this.game.canSelect && this.game.canSelectForestMap) {
            event.preventDefault();
            this.game.input.handleEscapeKey();
        }
    }
    handleMouseMove(event) {
        if (this.menuActive && this.game.canSelect && this.game.canSelectForestMap) {
            const rect = this.game.canvas.getBoundingClientRect();
            const scaleX = this.game.canvas.width / rect.width;
            const scaleY = this.game.canvas.height / rect.height;

            const mouseX = (event.clientX - rect.left) * scaleX;
            const mouseY = (event.clientY - rect.top) * scaleY;

            const topY = this.game.height / 2 - this.positionOffset + this.menuOptionsPositionOffset;
            const optionHeight = 60;

            let newSelectedOption = this.selectedOption;

            for (let i = 0; i < this.menuOptions.length; i++) {
                const x = this.centerX - this.optionWidth / 2;
                const y = topY + (i * optionHeight);

                if (mouseX >= x && mouseX <= x + this.optionWidth &&
                    mouseY >= y && mouseY <= y + optionHeight) {
                    newSelectedOption = i;
                    break;
                }
            }

            if (newSelectedOption !== this.selectedOption) {
                this.selectedOption = newSelectedOption;
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            }
        }
    }

    handleMouseClick(event) {
        if (this.menuActive && this.game.canSelect && this.game.canSelectForestMap) {
            this.handleMenuSelection();
            this.game.saveGameState();
        }
    }
}

export class AudioMenu extends BaseMenu {
    constructor(game, options, title) {
        super(game, options, title);

        this.delayedEnablePress = this.delayedEnablePress.bind(this);

        this.volumeLevels = [];
        this.audioMap = {};

        this.initializeVolumeLevels();
        this.initializeAudioMap();

        this.optionWidth = 650;
        this.draggingSlider = false;
        this.draggingSliderActive = false;
        this.draggingSliderIndex = -1;
        this.dragOffsetX = 0;

        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseDrag = this.handleMouseDrag.bind(this);

        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseDrag);
        document.addEventListener('wheel', this.handleMouseWheel.bind(this));
    }

    initializeVolumeLevels() {
        throw new Error('initializeVolumeLevels method must be implemented in subclasses');
    }

    initializeAudioMap() {
        throw new Error('initializeAudioMap method must be implemented in subclasses');
    }

    updateSingleAudioVolume(id, index) {
        const audioElement = document.getElementById(id);
        const masterVolume = this.volumeLevels[0] / 100;
        const currentVolume = this.volumeLevels[index];

        if (audioElement) {
            audioElement.volume = (currentVolume / 100) * masterVolume;

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
        if (this.menuInGame === false) {
            context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
        } else {
            if (this.game.currentMenu === this.game.menu.ingameAudioSettings) {
                context.fillStyle = 'rgba(0, 0, 0, 0.7)';
                context.fillRect(0, 0, this.game.width, this.game.height);
            }
        }
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
                context.font = 'bold 36px Arial';
                context.fillStyle = 'yellow';
            } else {
                context.font = '34px Arial';
                context.fillStyle = 'white';
            }

            const x = this.game.width / 2;
            const y = this.game.height / 2 + i * 60 - 55;

            context.fillText(this.menuOptions[i], x - 50, y - 80);

            // volume slider
            if (this.volumeLevels[i] !== null) {
                const sliderX = this.game.width / 2 - 30;
                const sliderY = this.game.height / 2 + i * 60 - 155;
                const sliderWidth = 300;
                const sliderHeight = 25;
                const borderRadius = 14;

                context.fillStyle = '#ccc';
                this.roundRect(context, sliderX, sliderY, sliderWidth, sliderHeight, borderRadius, true, false);

                const handleRadius = sliderHeight / 2;
                const handleX = sliderX + (sliderWidth - 2 * handleRadius) * (this.volumeLevels[i] / 100);

                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
                context.shadowBlur = 0;
                context.shadowColor = '#4CAF50';

                context.fillStyle = '#4CAF50';
                context.beginPath();
                context.arc(handleX + handleRadius, sliderY + sliderHeight / 2, handleRadius, 0, 2 * Math.PI);
                context.fill();

                context.shadowOffsetX = 3;
                context.shadowOffsetY = 3;
                context.shadowBlur = 3;
                context.shadowColor = 'black';

                context.save();
                const volumeText = `${this.volumeLevels[i]}%`;
                context.fillStyle = 'white';
                context.font = '20px Arial';
                context.fillText(volumeText, sliderX + sliderWidth, sliderY + sliderHeight / 2 - 20);
                context.restore();
            }
        }
        context.restore();

        if (this.game.gameCompleted && this.menuInGame === false) {
            context.globalAlpha = 0.75;
            context.drawImage(this.greenCompletedImage, 10, 10);
            context.globalAlpha = 1;
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

    delayedEnablePress() {
        setTimeout(() => {
            this.canPressNow = true;
        }, 10);
    }

    //keyboard
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
    //mouse
    handleMouseClick(event) {
        if (this.menuActive && this.draggingSliderActive === false) {
            super.handleMouseClick(event);
            const rect = this.game.canvas.getBoundingClientRect();
            const scaleX = this.game.canvas.width / rect.width;
            const scaleY = this.game.canvas.height / rect.height;

            const mouseX = (event.clientX - rect.left) * scaleX;
            const mouseY = (event.clientY - rect.top) * scaleY;

            const sliderIndex = this.selectedOption;

            if (sliderIndex !== this.menuOptions.length - 1) {
                const sliderX = this.game.width / 2 - 30;
                const sliderY = this.game.height / 2 + sliderIndex * 60 - 155;
                const sliderWidth = 300;
                const sliderHeight = 25;

                if (
                    mouseX >= sliderX &&
                    mouseX <= sliderX + sliderWidth &&
                    mouseY >= sliderY &&
                    mouseY <= sliderY + sliderHeight
                ) {
                    const relativeX = mouseX - sliderX;
                    const percentage = relativeX / sliderWidth;
                    const newVolume = Math.round(percentage * 100);

                    this.volumeLevels[sliderIndex] = newVolume;
                    const selectedOption = this.menuOptions[sliderIndex];
                    const audioElementId = this.audioMap[selectedOption];
                    this.updateAudioVolume(audioElementId, sliderIndex);

                    this.game.saveGameState();
                }
            }
        }
    }
    handleMouseDown(event) {
        if (this.menuActive) {
            const rect = this.game.canvas.getBoundingClientRect();
            const scaleX = this.game.canvas.width / rect.width;
            const scaleY = this.game.canvas.height / rect.height;

            const mouseX = (event.clientX - rect.left) * scaleX;
            const mouseY = (event.clientY - rect.top) * scaleY;

            for (let i = 0; i < this.menuOptions.length; i++) {
                if (this.volumeLevels[i] !== null) {
                    const sliderX = this.game.width / 2 - 30;
                    const sliderY = this.game.height / 2 + i * 60 - 155;
                    const sliderWidth = 300;
                    const sliderHeight = 25;
                    const handleRadius = sliderHeight / 2;
                    const handleX = sliderX + (sliderWidth - 2 * handleRadius) * (this.volumeLevels[i] / 100);

                    if (
                        mouseX >= handleX &&
                        mouseX <= handleX + 2 * handleRadius &&
                        mouseY >= sliderY &&
                        mouseY <= sliderY + sliderHeight
                    ) {
                        this.draggingSlider = true;
                        this.draggingSliderIndex = i;
                        this.dragOffsetX = mouseX - handleX;
                        break;
                    }
                }
            }
        }
    }
    handleMouseUp() {
        this.draggingSlider = false;
        this.draggingSliderIndex = -1;

        setTimeout(() => {
            this.draggingSliderActive = false;
        }, 10);
    }
    handleMouseDrag(event) {
        if (this.draggingSlider) {
            this.draggingSliderActive = true;
            const rect = this.game.canvas.getBoundingClientRect();
            const scaleX = this.game.canvas.width / rect.width;

            const mouseX = (event.clientX - rect.left) * scaleX;
            const sliderX = this.game.width / 2 - 30;
            const sliderWidth = 300;

            let relativeX = mouseX - this.dragOffsetX - sliderX;
            relativeX = Math.max(0, Math.min(relativeX, sliderWidth));
            const percentage = relativeX / sliderWidth;
            const newVolume = Math.round(percentage * 100);

            this.volumeLevels[this.draggingSliderIndex] = newVolume;
            const selectedOption = this.menuOptions[this.draggingSliderIndex];
            const audioElementId = this.audioMap[selectedOption];
            this.updateAudioVolume(audioElementId, this.draggingSliderIndex);

            this.game.saveGameState();
        }
    }
    handleMouseWheel(event) {
        if (this.menuActive) {
            const delta = event.deltaY;
            const currentIndex = this.selectedOption;

            if (currentIndex !== this.menuOptions.length - 1) {
                const currentVolume = this.volumeLevels[currentIndex];
                const isScrollUp = delta > 0;
                const step = event.repeat ? 2 : 1;
                const newVolume = isScrollUp ? Math.max(0, currentVolume - step) : Math.min(100, currentVolume + step);

                this.volumeLevels[currentIndex] = newVolume;
                const selectedOption = this.menuOptions[currentIndex];
                const audioElementId = this.audioMap[selectedOption];
                this.updateAudioVolume(audioElementId, currentIndex);
            }
        }
    }
}
