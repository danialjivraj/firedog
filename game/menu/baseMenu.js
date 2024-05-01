//every menu extends from BaseMenu
export class BaseMenu {
    constructor(game, menuOptions, title, menuActive = false) {
        this.game = game;
        this.menuActive = menuActive;
        this.selectedOption = 0;
        this.menuOptions = menuOptions;
        this.backgroundImage = document.getElementById('mainmenubackground');
        this.title = title;
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.greenCompletedImage = document.getElementById('greenCompleted');
    }

    draw(context) {
        if (this.menuActive) {
            context.save();
            context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
            context.font = 'bold 46px Love Ya Like A Sister';
            context.fillStyle = 'white';
            context.shadowColor = 'black';
            context.shadowOffsetX = 3;
            context.shadowOffsetY = 3;
            context.textAlign = 'center';
            context.fillText(this.title, this.game.width / 2, this.game.height / 2 - 220);
            context.font = '34px Arial';

            for (let i = 0; i < this.menuOptions.length; i++) {
                if (i === this.selectedOption) {
                    context.font = 'bold 36px Arial';
                    context.fillStyle = 'yellow';
                } else {
                    context.font = '34px Arial';
                    context.fillStyle = 'white';
                }
                context.fillText(this.menuOptions[i], this.game.width / 2, this.game.height / 2 + (i * 60) - 125);
            }

            context.restore();

            if (this.game.gameCompleted){
                context.globalAlpha = 0.75;
                context.drawImage(this.greenCompletedImage, 10, 10);
                context.globalAlpha = 1;
            }
        }
    }

    update(deltaTime) {
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }

    }
    handleKeyDown(event) {
        if (this.menuActive) {
            if (this.game.menuInstances.deleteProgress2.canSelect) {
                if (event.key === 'ArrowUp') {
                    this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                } else if (event.key === 'ArrowDown') {
                    this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                } else if (event.key === 'Enter') {
                    this.handleMenuSelection();
                }
            }
        }
    }

    handleMenuSelection() {
        this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
    }
}