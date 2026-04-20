import { BaseMenu } from './baseMenu.js';
import { fadeIn } from '../animations/fading.js';

const PANEL_W = 820;
const BTN_W = 420;
const BTN_H = 50;
const BTN_RADIUS = 12;

function panelY(game, panelH) {
    return (game.height - panelH) / 2;
}

function drawPanel(context, game, panelH) {
    const px = (game.width - PANEL_W) / 2;
    const py = panelY(game, panelH);
    const radius = 20;

    context.save();
    context.shadowColor = 'rgba(0, 0, 0, 0.6)';
    context.shadowBlur = 30;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 8;

    context.fillStyle = 'rgba(150, 30, 30, 0.5)';
    context.beginPath();
    context.roundRect(px, py, PANEL_W, panelH, radius);
    context.fill();

    context.fillStyle = 'rgba(10, 10, 14, 0.82)';
    context.beginPath();
    context.roundRect(px + 4, py + 4, PANEL_W - 8, panelH - 8, radius - 2);
    context.fill();

    context.restore();
    return py;
}

function drawWarningTitle(context, game, py, title) {
    context.save();
    context.font = 'bold 40px Love Ya Like A Sister';
    context.textAlign = 'center';
    context.fillStyle = '#e04040';
    context.shadowColor = 'black';
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowBlur = 4;
    context.fillText(title, game.width / 2, py + 60);
    context.restore();
}

function drawQuestion(context, game, py, question) {
    context.save();
    context.font = '30px Love Ya Like A Sister';
    context.textAlign = 'center';
    context.fillStyle = '#cccccc';
    context.shadowColor = 'black';
    context.shadowOffsetX = 1;
    context.shadowOffsetY = 1;
    context.shadowBlur = 0;
    context.fillText(question, game.width / 2, py + 115);
    context.restore();
}

function btnRect(game, py, yOffset) {
    return {
        x: (game.width - BTN_W) / 2,
        y: py + yOffset,
        w: BTN_W,
        h: BTN_H,
    };
}

function drawOptionButton(context, game, rect, label, isSelected, color) {
    context.save();
    context.shadowColor = 'transparent';
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    if (isSelected) {
        context.fillStyle = color;
        context.beginPath();
        context.roundRect(rect.x, rect.y, rect.w, rect.h, BTN_RADIUS);
        context.fill();

        context.font = 'bold 26px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'white';
        context.shadowColor = 'black';
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.fillText(label, game.width / 2, rect.y + rect.h / 2);
    } else {
        context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        context.lineWidth = 2;
        context.beginPath();
        context.roundRect(rect.x, rect.y, rect.w, rect.h, BTN_RADIUS);
        context.stroke();

        context.font = '24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'rgba(255, 255, 255, 0.6)';
        context.fillText(label, game.width / 2, rect.y + rect.h / 2);
    }

    context.restore();
}

function hitTest(mouseX, mouseY, rect) {
    return mouseX >= rect.x && mouseX <= rect.x + rect.w &&
           mouseY >= rect.y && mouseY <= rect.y + rect.h;
}

const DELETE_COLOR = 'rgba(180, 40, 40, 0.85)';
const CANCEL_COLOR = 'rgba(60, 130, 60, 0.85)';

export class DeleteProgress extends BaseMenu {
    constructor(game) {
        const menuOptions = ['Yes', 'No'];
        super(game, menuOptions, 'Are you sure you want to delete your game progress?');
        this._panelH = 330;
        this._btn0Y = 175;
        this._btn1Y = 245;
    }

    _btnRects() {
        const py = panelY(this.game, this._panelH);
        return [
            btnRect(this.game, py, this._btn0Y),
            btnRect(this.game, py, this._btn1Y),
        ];
    }

    draw(context) {
        if (!this.menuActive) return;
        this.drawBackdrop(context);

        const py = drawPanel(context, this.game, this._panelH);

        drawWarningTitle(context, this.game, py, 'Delete Progress');
        drawQuestion(context, this.game, py, 'Are you sure you want to delete your game progress?');

        const rects = this._btnRects();
        drawOptionButton(context, this.game, rects[0], 'YES, DELETE', this.selectedOption === 0, DELETE_COLOR);
        drawOptionButton(context, this.game, rects[1], 'NO, GO BACK', this.selectedOption === 1, CANCEL_COLOR);

        if (this.showStarsSticker && this.menuInGame === false) {
            this.drawStarsSticker(context);
        }
    }

    handleMouseMove(event) {
        if (!this._canInteract()) return;
        const { mouseX, mouseY } = this.canvasMouse(event);
        const rects = this._btnRects();

        for (let i = 0; i < rects.length; i++) {
            if (hitTest(mouseX, mouseY, rects[i]) && this.selectedOption !== i) {
                this.selectedOption = i;
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                return;
            }
        }
    }

    handleMouseClick(event) {
        if (!this._canInteract()) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const { mouseX, mouseY } = this.canvasMouse(event);
        const rects = this._btnRects();

        for (let i = 0; i < rects.length; i++) {
            if (hitTest(mouseX, mouseY, rects[i])) {
                this.selectedOption = i;
                this.handleMenuSelection();
                return;
            }
        }
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        super.handleMenuSelection();

        if (selectedOption === 'Yes') {
            this.game.openMenu(this.game.menu.deleteProgress2, 1);
            return;
        }

        this.game.goBackMenu();
    }
}

export class DeleteProgress2 extends BaseMenu {
    constructor(game) {
        const menuOptions = [
            "Yes, I want to delete my game progress",
            "No, I do not want to delete my game progress",
        ];
        super(game, menuOptions, 'All your progress will be lost!');
        this.selectedOption = 1;
        this.showSavingSprite = false;
        this._panelH = 330;
        this._btn0Y = 175;
        this._btn1Y = 245;
    }

    _btnRects() {
        const py = panelY(this.game, this._panelH);
        return [
            btnRect(this.game, py, this._btn0Y),
            btnRect(this.game, py, this._btn1Y),
        ];
    }

    draw(context) {
        if (!this.menuActive) return;
        this.drawBackdrop(context);

        const py = drawPanel(context, this.game, this._panelH);

        drawWarningTitle(context, this.game, py, 'Final Warning');
        drawQuestion(context, this.game, py, 'All your progress will be permanently lost!');

        const rects = this._btnRects();
        drawOptionButton(context, this.game, rects[0], 'YES, DELETE EVERYTHING', this.selectedOption === 0, DELETE_COLOR);
        drawOptionButton(context, this.game, rects[1], 'NO, KEEP MY PROGRESS', this.selectedOption === 1, CANCEL_COLOR);

        if (this.showStarsSticker && this.menuInGame === false) {
            this.drawStarsSticker(context);
        }
    }

    handleMouseMove(event) {
        if (!this._canInteract()) return;
        const { mouseX, mouseY } = this.canvasMouse(event);
        const rects = this._btnRects();

        for (let i = 0; i < rects.length; i++) {
            if (hitTest(mouseX, mouseY, rects[i]) && this.selectedOption !== i) {
                this.selectedOption = i;
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                return;
            }
        }
    }

    handleMouseClick(event) {
        if (!this._canInteract()) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const { mouseX, mouseY } = this.canvasMouse(event);
        const rects = this._btnRects();

        for (let i = 0; i < rects.length; i++) {
            if (hitTest(mouseX, mouseY, rects[i])) {
                this.selectedOption = i;
                this.handleMenuSelection();
                return;
            }
        }
    }

    deleteProgessionAnimation() {
        this.game.canSelect = false;
        this.showSavingSprite = true;

        fadeIn(this.game.canvas, 4000, () => {
            this.game.canSelect = true;
            this.showSavingSprite = false;
        });
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        super.handleMenuSelection();

        if (selectedOption === "Yes, I want to delete my game progress") {
            this.game.clearSavedData();
            this.deleteProgessionAnimation();

            this.game.setMenuRoot(this.game.menu.main, 0);

            this.game.audioHandler.menu.stopSound('criminalitySoundtrack');
            this.game.audioHandler.menu.playSound('criminalitySoundtrack');
            return;
        }

        this.game.goBackMenu();
    }
}
