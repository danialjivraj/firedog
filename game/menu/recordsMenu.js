import { BaseMenu } from "./baseMenu.js";
import { formatTimeMs } from "../config/formatTime.js";

export class RecordsMenu extends BaseMenu {
    constructor(game) {
        super(game, ["Go Back"], "Records");

        this.decimals = 2;

        this.tableMaxWidth = 820;

        this.sectionTopY = 155;
        this.sectionBottomY = 565;

        this.rowH = 68;
        this.rowGap = 0;

        this.positionOffset = 270;
        this.menuOptionsPositionOffset = 0;

        // scroll
        this.scrollY = 0;
        this.targetScrollY = 0;
        this.scrollMax = 0;
        this.scrollEase = 0.18;

        this.barWidth = 8;
        this.barTrackAlpha = 0.14;
        this.draggingBar = false;
        this.barRect = null;

        this._onMouseDown = this.handleMouseDown.bind(this);
        this._onMouseUp = this.handleMouseUp.bind(this);
        document.addEventListener("mousedown", this._onMouseDown);
        document.addEventListener("mouseup", this._onMouseUp);
    }

    closeMenu() {
        super.closeMenu();
        this.draggingBar = false;
    }

    destroy() {
        document.removeEventListener("mousedown", this._onMouseDown);
        document.removeEventListener("mouseup", this._onMouseUp);
    }

    isBossMap(mapKey) {
        return mapKey === "Map7" || mapKey === "BonusMap1" || mapKey === "BonusMap3";
    }

    getUnlockedMaps() {
        const all = [
            { key: "Map1", label: "Map 1", unlocked: !!this.game.map1Unlocked },
            { key: "Map2", label: "Map 2", unlocked: !!this.game.map2Unlocked },
            { key: "Map3", label: "Map 3", unlocked: !!this.game.map3Unlocked },
            { key: "Map4", label: "Map 4", unlocked: !!this.game.map4Unlocked },
            { key: "Map5", label: "Map 5", unlocked: !!this.game.map5Unlocked },
            { key: "Map6", label: "Map 6", unlocked: !!this.game.map6Unlocked },
            { key: "Map7", label: "Map 7", unlocked: !!this.game.map7Unlocked },
            { key: "BonusMap1", label: "Bonus Map 1", unlocked: !!this.game.bonusMap1Unlocked },
            { key: "BonusMap2", label: "Bonus Map 2", unlocked: !!this.game.bonusMap2Unlocked },
            {
                key: "BonusMap3",
                label: "Bonus Map 3",
                unlocked: !!this.game.bonusMap3Unlocked && !!this.game.glacikalDefeated && !!this.game.elyvorgDefeated,
            },
        ];
        return all.filter((m) => m.unlocked);
    }

    drawHLine(ctx, x1, x2, y, alpha = 0.18, w = 2) {
        ctx.save();
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
        ctx.restore();
    }

    drawSoftBackdrop(ctx, left, width) {
        const y = this.sectionTopY - 30;
        const h = this.sectionBottomY - this.sectionTopY + 60;

        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.42)";
        ctx.fillRect(left - 30, y, width + 60, h);

        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(left - 20, y + 10, width + 40, h - 20);

        ctx.strokeStyle = "rgba(255,255,255,0.10)";
        ctx.lineWidth = 2;
        ctx.strokeRect(left - 30, y, width + 60, h);
        ctx.restore();
    }

    tableBounds() {
        const tableWidth = Math.min(this.tableMaxWidth, this.game.width - 160);
        const tableLeft = Math.floor((this.game.width - tableWidth) / 2);
        const tableRight = tableLeft + tableWidth;
        return { tableLeft, tableRight, tableWidth };
    }

    geometry() {
        const { tableLeft, tableRight, tableWidth } = this.tableBounds();

        const innerPad = 26;

        const barInset = 6;
        const barX = tableRight - barInset - this.barWidth;

        const gapToBar = 22;

        const innerLeft = tableLeft + innerPad;
        const innerRight = barX - gapToBar;

        const headerTextY = this.sectionTopY + 25;
        const headerRuleY = headerTextY + 26;

        const listTop = headerRuleY + 18;
        const listH = Math.max(80, this.sectionBottomY - listTop);

        return {
            tableLeft,
            tableRight,
            tableWidth,
            innerLeft,
            innerRight,
            barX,
            headerTextY,
            headerRuleY,
            listTop,
            listH,
        };
    }

    update(deltaTime) {
        super.update(deltaTime);

        const geom = this.geometry();
        const unlockedLen = this.getUnlockedMaps().length;
        const contentH = unlockedLen * (this.rowH + this.rowGap);
        this.scrollMax = Math.max(0, contentH - geom.listH);

        this.targetScrollY = Math.max(0, Math.min(this.targetScrollY, this.scrollMax));
        this.scrollY += (this.targetScrollY - this.scrollY) * this.scrollEase;
    }

    scrollSelectedIntoView(listH, unlockedLen) {
        if (this.selectedOption < 0 || this.selectedOption >= unlockedLen) return;

        const itemTop = this.selectedOption * (this.rowH + this.rowGap);
        const itemBottom = itemTop + this.rowH;

        if (itemTop < this.targetScrollY) this.targetScrollY = itemTop;
        else if (itemBottom > this.targetScrollY + listH) this.targetScrollY = itemBottom - listH;

        this.targetScrollY = Math.max(0, Math.min(this.targetScrollY, this.scrollMax));
    }

    updateScrollFromThumb(mouseY) {
        if (!this.barRect) return;
        const { y, h, thumbH } = this.barRect;
        const travel = h - thumbH;
        if (travel <= 1) return;

        let t = (mouseY - y - thumbH / 2) / travel;
        t = Math.max(0, Math.min(1, t));
        this.targetScrollY = t * this.scrollMax;
    }

    // keyboard
    handleKeyDown(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;

        const geom = this.geometry();
        const unlockedLen = this.getUnlockedMaps().length;
        const rowCount = unlockedLen + 1;
        const goBackIndex = unlockedLen;

        if (event.key === "ArrowUp") {
            this.selectedOption = (this.selectedOption - 1 + rowCount) % rowCount;
            this.game.audioHandler.menu.playSound("optionHoveredSound", false, true);
            this.scrollSelectedIntoView(geom.listH, unlockedLen);
        } else if (event.key === "ArrowDown") {
            this.selectedOption = (this.selectedOption + 1) % rowCount;
            this.game.audioHandler.menu.playSound("optionHoveredSound", false, true);
            this.scrollSelectedIntoView(geom.listH, unlockedLen);
        } else if (event.key === "Enter") {
            if (this.selectedOption === goBackIndex) {
                this.handleMenuSelection();
            }
        }
    }

    // mouse
    handleMouseWheel(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;

        const geom = this.geometry();
        const { mouseX, mouseY } = this.canvasMouse(event);

        const unlockedLen = this.getUnlockedMaps().length;
        const rowCount = unlockedLen + 1;

        const listX = geom.innerLeft;
        const listW = geom.innerRight - geom.innerLeft;
        const insideList =
            mouseX >= listX &&
            mouseX <= listX + listW &&
            mouseY >= geom.listTop &&
            mouseY <= geom.listTop + geom.listH;

        if (insideList && this.scrollMax > 0) {
            const step = (event.deltaY > 0 ? 1 : -1) * 80;
            this.targetScrollY = Math.max(0, Math.min(this.targetScrollY + step, this.scrollMax));
            return;
        }

        const dir = event.deltaY > 0 ? 1 : -1;
        this.selectedOption = (this.selectedOption + dir + rowCount) % rowCount;
        this.game.audioHandler.menu.playSound("optionHoveredSound", false, true);

        this.scrollSelectedIntoView(geom.listH, unlockedLen);
    }

    handleMouseMove(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;
        const { mouseX, mouseY } = this.canvasMouse(event);

        if (this.draggingBar) {
            this.updateScrollFromThumb(mouseY);
            return;
        }

        const geom = this.geometry();
        const unlockedLen = this.getUnlockedMaps().length;
        const goBackIndex = unlockedLen;

        const optionHeight = 60;
        const gapBelowTable = 70;

        const bottomMargin = 0;
        const buttonCenterX = this.game.width / 2;

        const buttonTopY = Math.min(this.game.height - bottomMargin - optionHeight, this.sectionBottomY + gapBelowTable);

        const btnX = buttonCenterX - this.optionWidth / 2;
        const btnY = buttonTopY;

        if (mouseX >= btnX && mouseX <= btnX + this.optionWidth && mouseY >= btnY && mouseY <= btnY + optionHeight) {
            this.setSelected(goBackIndex, geom, unlockedLen);
            return;
        }

        const listX = geom.innerLeft;
        const listW = geom.innerRight - geom.innerLeft;

        if (mouseX >= listX && mouseX <= listX + listW && mouseY >= geom.listTop && mouseY <= geom.listTop + geom.listH) {
            const localY = mouseY - geom.listTop + this.scrollY;
            const idx = Math.floor(localY / (this.rowH + this.rowGap));
            if (idx >= 0 && idx < unlockedLen) this.setSelected(idx, geom, unlockedLen);
        }
    }

    handleMouseDown(event) {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;
        const { mouseX, mouseY } = this.canvasMouse(event);

        if (this.barRect) {
            const { x, y, w, h, thumbY, thumbH } = this.barRect;

            if (mouseX >= x && mouseX <= x + w && mouseY >= thumbY && mouseY <= thumbY + thumbH) {
                this.draggingBar = true;
                return;
            }

            if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) {
                const travel = h - thumbH;
                if (travel > 1) {
                    let t = (mouseY - y - thumbH / 2) / travel;
                    t = Math.max(0, Math.min(1, t));
                    this.targetScrollY = t * this.scrollMax;
                }
                return;
            }
        }

        const geom = this.geometry();
        const unlockedLen = this.getUnlockedMaps().length;

        const listX = geom.innerLeft;
        const listW = geom.innerRight - geom.innerLeft;

        if (mouseX >= listX && mouseX <= listX + listW && mouseY >= geom.listTop && mouseY <= geom.listTop + geom.listH) {
            const localY = mouseY - geom.listTop + this.scrollY;
            const idx = Math.floor(localY / (this.rowH + this.rowGap));
            if (idx >= 0 && idx < unlockedLen) this.setSelected(idx, geom, unlockedLen);
        }
    }

    handleMouseUp() {
        this.draggingBar = false;
    }

    handleMouseClick() {
        if (!this.menuActive || !this.game.canSelect || !this.game.canSelectForestMap) return;
        const unlockedLen = this.getUnlockedMaps().length;
        const goBackIndex = unlockedLen;
        if (this.selectedOption === goBackIndex) this.handleMenuSelection();
    }

    setSelected(idx, geom, unlockedLen) {
        if (idx !== this.selectedOption) {
            this.selectedOption = idx;
            this.game.audioHandler.menu.playSound("optionHoveredSound", false, true);
            if (geom) this.scrollSelectedIntoView(geom.listH, unlockedLen);
        }
    }

    activateMenu() {
        this.scrollY = 0;
        this.targetScrollY = 0;
        this.draggingBar = false;
        this.barRect = null;

        super.activateMenu(0);
    }

    handleMenuSelection() {
        if (!this.game.canSelect) return;
        super.handleMenuSelection();
        this.game.goBackMenu();
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

    draw(context) {
        if (!this.menuActive) return;

        // background
        context.save();
        if (this.menuInGame === false) {
            if (this.backgroundImage) {
                context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
            }
        } else if (this.game.menu.pause.isPaused) {
            context.fillStyle = "rgba(0, 0, 0, 0.7)";
            context.fillRect(0, 0, this.game.width, this.game.height);
        }
        context.restore();

        // title
        context.save();
        context.font = "bold 46px Love Ya Like A Sister";
        context.fillStyle = "white";
        context.shadowColor = "black";
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.textAlign = "center";
        context.fillText(this.title, this.game.width / 2, this.game.height / 2 - this.positionOffset);
        context.restore();

        const unlocked = this.getUnlockedMaps();
        const geom = this.geometry();

        // panel
        this.drawSoftBackdrop(context, geom.tableLeft, geom.tableWidth);

        // columns
        const xMap = geom.innerLeft;
        const xClear = geom.innerRight;

        // header
        context.save();
        context.shadowColor = "transparent";
        context.fillStyle = "rgba(255,255,255,0.78)";
        context.font = "bold 22px Arial";
        context.textAlign = "left";
        context.fillText("MAP", xMap, geom.headerTextY);
        context.textAlign = "right";
        context.fillText("BEST CLEAR TIME", xClear, geom.headerTextY);
        this.drawHLine(context, geom.innerLeft, geom.tableRight - 12, geom.headerRuleY, 0.18, 2);
        context.restore();

        if (unlocked.length === 0) {
            context.save();
            context.shadowColor = "transparent";
            context.fillStyle = "rgba(255,255,255,0.85)";
            context.font = "bold 26px Arial";
            context.textAlign = "center";
            context.fillText("No maps unlocked yet.", this.game.width / 2, (this.sectionTopY + this.sectionBottomY) / 2);
            context.restore();

            this.drawGoBackBottomCentered(context);
            if (this.showStarsSticker && this.menuInGame === false) this.drawStarsSticker(context);
            return;
        }

        const contentH = unlocked.length * (this.rowH + this.rowGap);

        // clip rows
        const listX = geom.innerLeft;
        const listW = geom.innerRight - geom.innerLeft;

        context.save();
        context.beginPath();
        context.rect(listX, geom.listTop, listW, geom.listH);
        context.clip();

        for (let i = 0; i < unlocked.length; i++) {
            const rowTop = geom.listTop + i * (this.rowH + this.rowGap) - this.scrollY;
            const yMid = rowTop + this.rowH / 2;

            if (yMid + this.rowH / 2 < geom.listTop || yMid - this.rowH / 2 > geom.listTop + geom.listH) continue;

            const m = unlocked[i];
            const rec = (this.game.records && this.game.records[m.key]) || { clearMs: null, bossMs: null };
            const bossMap = this.isBossMap(m.key);

            const clearText = formatTimeMs(rec.clearMs, this.decimals);

            const hasBossLine = bossMap && rec.bossMs != null;
            const bossText = hasBossLine ? formatTimeMs(rec.bossMs, this.decimals) : null;

            const isSelected = this.selectedOption === i;

            // selection highlight
            if (isSelected) {
                context.save();
                context.shadowColor = "transparent";

                const padY = 4;
                const h = this.rowH - padY * 2;
                const top = yMid - this.rowH / 2 + padY;

                const grad = context.createLinearGradient(listX, 0, listX + listW, 0);
                grad.addColorStop(0.0, "rgba(255,255,255,0.00)");
                grad.addColorStop(0.12, "rgba(255,255,255,0.07)");
                grad.addColorStop(0.50, "rgba(255,255,255,0.10)");
                grad.addColorStop(0.88, "rgba(255,255,255,0.07)");
                grad.addColorStop(1.0, "rgba(255,255,255,0.00)");

                context.fillStyle = grad;
                context.fillRect(listX, top, listW, h);
                context.restore();
            }

            context.save();
            context.shadowColor = "transparent";
            context.textBaseline = "middle";

            const mapY = yMid;
            const clearY = hasBossLine ? yMid - 10 : yMid;
            const bossY = yMid + 16;

            // map
            context.textAlign = "left";
            context.font = isSelected ? "bold 28px Arial" : "bold 26px Arial";
            context.fillStyle = isSelected ? "yellow" : "rgba(255,255,255,0.92)";
            context.fillText(m.label, xMap, mapY);

            // clear
            context.textAlign = "right";
            context.font = isSelected ? "bold 26px Arial" : "bold 24px Arial";
            context.fillStyle =
                rec.clearMs == null ? "rgba(255,255,255,0.45)" : isSelected ? "yellow" : "rgba(255,255,255,0.92)";
            context.fillText(clearText, xClear, clearY);

            if (hasBossLine) {
                context.font = "16px Arial";
                context.fillStyle = "rgba(255,255,255,0.65)";
                context.fillText(`Boss: ${bossText}`, xClear, bossY);
            }

            // divider
            this.drawHLine(context, geom.innerLeft, geom.tableRight - 12, yMid + this.rowH / 2, 0.10, 2);
            context.restore();
        }

        context.restore();

        // scrollbar
        if (this.scrollMax > 0.5) {
            const trackY = geom.listTop;
            const trackH = geom.listH;

            context.save();
            context.shadowColor = "transparent";

            context.fillStyle = `rgba(255,255,255,${this.barTrackAlpha})`;
            context.fillRect(geom.barX, trackY, this.barWidth, trackH);

            const thumbH = Math.max(34, (geom.listH / contentH) * trackH);
            const t = this.scrollY / this.scrollMax;
            const thumbY = trackY + (trackH - thumbH) * t;

            context.fillStyle = "rgba(255,255,255,0.88)";
            context.fillRect(geom.barX, thumbY, this.barWidth, thumbH);

            this.barRect = { x: geom.barX, y: trackY, w: this.barWidth, h: trackH, thumbY, thumbH };
            context.restore();
        } else {
            this.barRect = null;
        }

        this.drawHLine(context, geom.innerLeft, geom.tableRight - 12, this.sectionBottomY + 10, 0.12, 2);

        this.drawGoBackBottomCentered(context);

        if (this.showStarsSticker && this.menuInGame === false) {
            this.drawStarsSticker(context);
        }
    }

    drawGoBackBottomCentered(context) {
        const optionHeight = 60;
        const gapBelowTable = 70;

        const bottomMargin = 10;
        const buttonCenterX = this.game.width / 2;

        const buttonTopY = Math.min(this.game.height - bottomMargin - optionHeight, this.sectionBottomY + gapBelowTable);

        const oldCenterX = this.centerX;
        const oldPositionOffset = this.positionOffset;
        const oldMenuOptionsOffset = this.menuOptionsPositionOffset;

        this.centerX = buttonCenterX;
        this.menuOptionsPositionOffset = 0;
        this.positionOffset = this.game.height / 2 - buttonTopY;

        const topY = this.game.height / 2 - this.positionOffset + this.menuOptionsPositionOffset;

        const unlockedLen = this.getUnlockedMaps().length;
        const goBackIndex = unlockedLen;

        context.save();
        if (this.selectedOption === goBackIndex) {
            context.font = "bold 36px Arial";
            context.fillStyle = "yellow";
        } else {
            context.font = "34px Arial";
            context.fillStyle = "white";
        }
        context.shadowColor = "black";
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.textAlign = "center";
        context.fillText("Go Back", this.centerX, topY + optionHeight / 2);
        context.restore();

        this.centerX = oldCenterX;
        this.positionOffset = oldPositionOffset;
        this.menuOptionsPositionOffset = oldMenuOptionsOffset;
    }
}
