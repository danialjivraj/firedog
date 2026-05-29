import {
    STAR_REVEAL_FALL_MS,
    STAR_REVEAL_IMPACT_MS,
    STAR_REVEAL_BURST_MS,
    STAR_REVEAL_DROP_PX,
    STAR_CENTERS,
} from '../config/constants.js';

// every menu extends from BaseMenu
export class BaseMenu {
    constructor(game, menuOptions, title) {
        this.game = game;
        this.centerX = this.game.width / 2;
        this.positionOffset = 220;
        this.menuOptionsPositionOffset = 65;
        this.menuOptions = menuOptions ?? [];
        this.title = title;
        this.selectedOption = 0;
        this.menuActive = false;
        this.menuInGame = false;
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

        this.frameTimer = 0;
        this.frameX = 0;
        this.frameInterval = Infinity; // never advances unless subclass sets a real interval
        this.maxFrame = 0;

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('click', this.handleMouseClick.bind(this));
        document.addEventListener('contextmenu', this.handleRightClick.bind(this));
        document.addEventListener('wheel', this.handleMouseWheel.bind(this));
    }

    drawBackdrop(context) {
        context.save();
        if (!this.menuInGame) {
            context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
        } else {
            const isPause    = !!this.game.menu.pause?.isPaused;
            const isGameOver = !!this.game.gameOver || !!this.game.notEnoughCoins || !!this.game.menu.gameOver?.menuActive;

            if (isPause || isGameOver) {
                const alpha = isPause ? 0.7 : (this.game.notEnoughCoins ? 0.5 : 0.2);
                context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
                context.fillRect(0, 0, this.game.width, this.game.height);
            }
        }
        context.restore();
    }

    drawTitle(context, y = this.game.height / 2 - this.positionOffset) {
        context.save();
        context.font = 'bold 46px Love Ya Like A Sister';
        context.fillStyle = 'white';
        context.shadowColor = 'black';
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.textAlign = 'center';
        context.fillText(this.title, this.game.width / 2, y);
        context.restore();
    }

    draw(context) {
        if (this.menuActive) {
            this.drawBackdrop(context);
            this.drawTitle(context);

            context.save();
            context.font = '34px Arial';
            context.fillStyle = 'white';
            context.shadowColor = 'black';
            context.shadowOffsetX = 3;
            context.shadowOffsetY = 3;
            context.textAlign = 'center';

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
        const isRealMenuScreen =
            this.menuInGame === false &&
            !this.game.cutsceneActive &&
            !this.game.menu.pause.isPaused &&
            !this.game.isPlayerInGame;

        if (isRealMenuScreen) {
            this.game.audioHandler.menu.playSound('criminalitySoundtrack');
        } else {
            this.game.audioHandler.menu.stopSound('criminalitySoundtrack');
        }

        this.frameTimer += deltaTime;
        while (this.frameTimer > this.frameInterval) {
            this.frameTimer -= this.frameInterval;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
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

        this.drawRevealableStar(context, rightStar, this.blankStarRightImage, 'ntharax', this.game.ntharaxDefeated, x, y);
        this.drawRevealableStar(context, leftStar, this.blankStarLeftImage, 'glacikal', this.game.glacikalDefeated, x, y);
        this.drawRevealableStar(context, middleStar, this.blankStarMiddleImage, 'elyvorg', this.game.elyvorgDefeated, x, y);

        if (this.game.elyvorgDefeated && this.storyCompleteTextImage) {
            context.drawImage(this.storyCompleteTextImage, x, y);
        }

        context.restore();
    }

    drawRevealableStar(context, image, blankImage, key, defeated, x, y) {
        const isRevealing = defeated && this.game.pendingStarReveal === key;
        if (!isRevealing) {
            context.drawImage(image, x, y);
            return;
        }

        if (blankImage && this.game.starRevealAge < STAR_REVEAL_FALL_MS) {
            context.drawImage(blankImage, x, y);
        }

        const age = this.game.starRevealAge;
        const center = STAR_CENTERS[key];
        const w = image.naturalWidth || image.width || 230;
        const h = image.naturalHeight || image.height || 130;
        const slotX = x + w * center.fx;
        const slotY = y + h * center.fy;

        let dx = 0, dy = 0, rotation = 0;
        let sx = 1, sy = 1, alpha = 1;

        if (age < STAR_REVEAL_FALL_MS) {
            const t = age / STAR_REVEAL_FALL_MS;
            const easeIn = t * t;
            dy = -STAR_REVEAL_DROP_PX * (1 - easeIn);
            dx = Math.sin(t * Math.PI) * 6;
            rotation = t * Math.PI * 4;
            alpha = Math.min(1, t * 8);
        } else if (age < STAR_REVEAL_FALL_MS + STAR_REVEAL_IMPACT_MS) {
            const t = (age - STAR_REVEAL_FALL_MS) / STAR_REVEAL_IMPACT_MS;
            const bell = Math.sin(t * Math.PI);
            sx = 1 + 0.22 * bell;
            sy = 1 - 0.16 * bell;
            rotation = Math.PI * 4;
        } else {
            rotation = Math.PI * 4;
        }

        const prevAlpha = context.globalAlpha;
        context.save();
        context.globalAlpha = prevAlpha * alpha;
        context.translate(slotX + dx, slotY + dy);
        context.rotate(rotation);
        context.scale(sx, sy);
        context.drawImage(image, -w * center.fx, -h * center.fy);
        context.restore();

        if (age >= STAR_REVEAL_FALL_MS) {
            const burstT = Math.min(1, (age - STAR_REVEAL_FALL_MS) / STAR_REVEAL_BURST_MS);
            if (burstT < 1) this.drawStarSparkleBurst(context, slotX, slotY, burstT);
        }
    }

    drawStarSparkleBurst(context, cx, cy, t) {
        const N = 8;
        const maxR = 50;
        const radius = maxR * (1 - Math.pow(1 - t, 2));
        const alpha = (1 - t) * 0.85;
        const size = 3 * (1 - t * 0.5);

        context.save();
        context.globalCompositeOperation = 'lighter';
        context.fillStyle = `rgba(255, 235, 150, ${alpha})`;
        context.shadowColor = 'rgba(255, 220, 100, 0.8)';
        context.shadowBlur = 8;
        for (let i = 0; i < N; i++) {
            const a = (i / N) * Math.PI * 2;
            const px = cx + Math.cos(a) * radius;
            const py = cy + Math.sin(a) * radius;
            context.beginPath();
            context.arc(px, py, size, 0, Math.PI * 2);
            context.fill();
        }
        context.restore();
    }

    getNavState() {
        return { selectedOption: this.selectedOption ?? 0 };
    }

    activateFromNav(state = {}) {
        const sel = state.selectedOption ?? 0;
        this.activateMenu(sel);
    }

    activateMenu(selectedOption = 0) {
        for (const k in this.game.menu) {
            this.game.menu[k].menuActive = false;
        }
        this.menuActive = true;
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

    _canInteract() {
        return this.menuActive && this.game.canSelect && this.game.canSelectForestMap;
    }

    handleKeyDown(event) {
        if (this._canInteract()) {
            if (event.key === 'ArrowUp') {
                this.handleNavigation(-1);
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            } else if (event.key === 'ArrowDown') {
                this.handleNavigation(1);
                this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            } else if (event.key === 'Enter') {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.handleMenuSelection();
            }
        }
    }

    handleMouseWheel(event) {
        if (this._canInteract()) {
            const delta = Math.sign(event.deltaY);
            this.handleNavigation(delta);
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
        }
    }

    handleRightClick(event) {
        if (this._canInteract()) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.game.input.handleEscapeKey();
        }
    }

    canvasMouse(event) {
        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;
        return {
            mouseX: (event.clientX - rect.left) * scaleX,
            mouseY: (event.clientY - rect.top) * scaleY,
        };
    }

    handleMouseMove(event) {
        if (this._canInteract()) {
            const { mouseX, mouseY } = this.canvasMouse(event);

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
        if (this._canInteract()) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.handleMenuSelection();
        }
    }
}
