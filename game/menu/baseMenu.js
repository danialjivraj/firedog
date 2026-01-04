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

        this.greenBandImage = document.getElementById('greenBand');
        this.blankStarLeftImage = document.getElementById('blankStarLeft');
        this.blankStarMiddleImage = document.getElementById('blankStarMiddle');
        this.blankStarRightImage = document.getElementById('blankStarRight');
        this.filledStarLeftImage = document.getElementById('filledStarLeft');
        this.filledStarMiddleImage = document.getElementById('filledStarMiddle');
        this.filledStarRightImage = document.getElementById('filledStarRight');
        this.storyCompleteTextImage = document.getElementById('storyCompleteText');
        this.showStarsSticker = true;

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

            if (this.showStarsSticker && this.menuInGame === false) {
                this.drawStarsSticker(context);
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

    shouldShowStarsSticker() {
        const g = this.game;
        return !!(g.glacikalDefeated || g.elyvorgDefeated || g.ntharaxDefeated);
    }

    drawStarsSticker(
        context,
        {
            x = 10,
            y = 10,
            alpha = 0.9,
            shadowColor = 'rgba(0, 0, 0, 1)',
            shadowBlur = 4,
            shadowOffsetX = 2,
            shadowOffsetY = 2,
            requireAnyProgress = true,
        } = {}
    ) {
        if (requireAnyProgress && !this.shouldShowStarsSticker()) return;
        if (!this.greenBandImage) return;

        context.save();

        context.globalAlpha = alpha;
        context.shadowColor = shadowColor;
        context.shadowBlur = shadowBlur;
        context.shadowOffsetX = shadowOffsetX;
        context.shadowOffsetY = shadowOffsetY;

        context.drawImage(this.greenBandImage, x, y);

        const leftStar = this.game.glacikalDefeated
            ? this.filledStarLeftImage
            : this.blankStarLeftImage;

        const middleStar = this.game.elyvorgDefeated
            ? this.filledStarMiddleImage
            : this.blankStarMiddleImage;

        const rightStar = this.game.ntharaxDefeated
            ? this.filledStarRightImage
            : this.blankStarRightImage;

        context.drawImage(middleStar, x, y);
        context.drawImage(rightStar, x, y);
        context.drawImage(leftStar, x, y);

        if (this.game.elyvorgDefeated && this.storyCompleteTextImage) {
            context.drawImage(this.storyCompleteTextImage, x, y);
        }

        context.restore();
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
        }
    }
}

export class SelectMenu extends BaseMenu {
    constructor(game, menuOptions, title, options = {}) {
        super(game, menuOptions, title);
        this.goBackLabel = options.goBackLabel || 'Go Back';
        this.selectedIndex = options.initialIndex ?? 0;
        this._applySelectedSuffix(this.selectedIndex);
    }

    activateMenu(selectedOption = this.selectedIndex) {
        super.activateMenu(selectedOption);
    }

    stripSelectedSuffix(label) {
        return label.replace(/ - Selected/g, '');
    }

    _clearAllSuffixes() {
        this.menuOptions = this.menuOptions.map(opt => this.stripSelectedSuffix(opt));
    }

    _applySelectedSuffix(index) {
        this._clearAllSuffixes();
        if (index >= 0 && index < this.menuOptions.length) {
            this.menuOptions[index] = this.menuOptions[index] + ' - Selected';
            this.selectedIndex = index;
        }
    }

    setSelectedIndex(index) {
        this._applySelectedSuffix(index);
    }

    getSelectedIndex() {
        return this.selectedIndex;
    }

    handleMenuSelection() {
        const raw = this.menuOptions[this.selectedOption];
        const clean = this.stripSelectedSuffix(raw);

        if (this.selectedOption === this.selectedIndex) {
            const expected = `${this.stripSelectedSuffix(this.menuOptions[this.selectedIndex])} - Selected`;
            if (this.menuOptions[this.selectedIndex] !== expected) {
                this._applySelectedSuffix(this.selectedIndex);
            }
            super.handleMenuSelection();
            return;
        }

        super.handleMenuSelection();

        if (this.goBackLabel && clean === this.goBackLabel && typeof this.onGoBack === 'function') {
            this.onGoBack();
            return;
        }

        this._applySelectedSuffix(this.selectedOption);
        if (typeof this.onSelect === 'function') {
            this.onSelect(this.selectedOption, clean);
        }

        if (this.game && typeof this.game.saveGameState === 'function') {
            this.game.saveGameState();
        }
    }
}
