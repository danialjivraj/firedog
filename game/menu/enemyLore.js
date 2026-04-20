import { isLocalNight } from '../utils/timeOfDay.js';
import { MAP_DISPLAY_NAMES_UPPER } from '../config/constants.js';
import { BaseMenu } from "./baseMenu.js";
import { buildPageDefs } from '../config/enemyLoreData.js';

const EVERYWHERE = 'EVERYWHERE';

export class EnemyLore extends BaseMenu {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('forestmap');
        this.backgroundImageNight = document.getElementById('forestmapNight');

        this.currentPage = 0;
        this.currentPageMain = 0;
        this.currentPageBonus = 0;

        this.enemyLoreBookBackground = document.getElementById('enemyLoreBookBackground');

        this.pageWidth = this.game.width * 0.43;
        this.pageHeight = this.game.height * 0.8;
        this.bookX = (this.game.width - 2 * this.pageWidth) / 2;
        this.bookY = (this.game.height - this.pageHeight) / 2 + 10;

        this.category = 'main';
        this.mainPages = [];
        this.bonusPages = [];
        this.pages = this.mainPages;

        this.mapColors = {
            [EVERYWHERE]: { fill: 'black', stroke: 'white', strokeBlur: 5 },
            [MAP_DISPLAY_NAMES_UPPER.Map1]: { fill: '#57e2d0ff', stroke: '#06580dff', strokeBlur: 7 },
            [MAP_DISPLAY_NAMES_UPPER.Map2]: { fill: '#a84ffcff', stroke: 'black', strokeBlur: 10 },
            [MAP_DISPLAY_NAMES_UPPER.Map3]: { fill: 'dodgerblue', stroke: 'darkblue', strokeBlur: 5 },
            [MAP_DISPLAY_NAMES_UPPER.Map4]: { fill: '#61c050ff', stroke: 'black', strokeBlur: 15 },
            [MAP_DISPLAY_NAMES_UPPER.Map5]: { fill: 'yellow', stroke: 'orange', strokeBlur: 5 },
            [MAP_DISPLAY_NAMES_UPPER.Map6]: { fill: '#39ff14', stroke: '#003b00', strokeBlur: 10 },
            [MAP_DISPLAY_NAMES_UPPER.Map7]: { fill: '#ff3300ff', stroke: 'black', strokeBlur: 10 },
            [MAP_DISPLAY_NAMES_UPPER.BonusMap1]: { fill: '#8fd7ff', stroke: '#1c4a7f', strokeBlur: 10 },
            [MAP_DISPLAY_NAMES_UPPER.BonusMap3]: { fill: '#ff41ffff', stroke: '#270033', strokeBlur: 10 },
            [MAP_DISPLAY_NAMES_UPPER.BonusMap2]: { fill: '#ff2c56ff', stroke: '#000000ff', strokeBlur: 10 },
        };

        this.typeColors = {
            "RED": { fill: 'red', stroke: 'black', strokeBlur: 1 },
            "STUN": { fill: 'yellow', stroke: 'black', strokeBlur: 1 },
            "POISON": { fill: '#a8ffb0', stroke: '#1a5e20', strokeBlur: 4 },
            "SLOW": { fill: '#c5d8ff', stroke: '#1a2a6e', strokeBlur: 4 },
            "FROZEN": { fill: '#dff4ff', stroke: '#2a7aaa', strokeBlur: 4 },
        };

        this.phraseColors = { ...this.mapColors, ...this.typeColors };
        this.highlightPhrases = this.buildHighlightTokens(this.mapColors);
        this.typeHighlightPhrases = this.buildHighlightTokens(this.typeColors);

        this.mouseX = 0;
        this.mouseY = 0;

        this.projectileDisplayNames = {
            normal: 'Normal',
            red: 'Red',
            stun: 'Stun',
            poison: 'Poison',
            slow: 'Slow',
            frozen: 'Frozen',
            all: 'All',
        };

        this.projectileImages = {
            normal: document.getElementById('normalProjectile'),
            red: document.getElementById('redProjectile'),
            stun: document.getElementById('stunProjectile'),
            poison: document.getElementById('poisonProjectile'),
            slow: document.getElementById('slowProjectile'),
            frozen: document.getElementById('frozenProjectile'),
            all: document.getElementById('allProjectile'),
        };

        this.fontsReady = !document.fonts;
        if (document.fonts) {
            document.fonts.load('bold 21px "Gloria Hallelujah"').then(() => {
                this.fontsReady = true;
            });
        }

        this.loadPages(buildPageDefs(this.pageWidth, this.pageHeight));
    }

    loadPages(defs) {
        const resolveImages = (images) => images.map(d => {
            if (d.kind === 'line') {
                return this.createLine(d.lineX, d.lineY, d.lineLength, d.lineWidth);
            }
            if (d.kind === 'coverImage') {
                return this.createCoverImage(d.imageId, d.x, d.y, d.width, d.height, d.options);
            }
            // kind === 'image'
            return this.createImage(
                d.enemyImage, d.frameWidth, d.frameHeight, d.enemyFrame,
                d.enemyX, d.enemyY, d.type, d.srcY, d.size,
            );
        });

        for (const def of defs) {
            if (def.kind === 'cover') {
                this.createCoverPage({
                    mapKey: def.mapKey,
                    coverTitle: def.coverTitle,
                    category: def.category,
                    coverImages: resolveImages(def.coverImages ?? []),
                });
            } else {
                this.createPage({
                    name: def.name,
                    type: def.type,
                    foundAt: def.foundAt,
                    description: def.description,
                    images: resolveImages(def.images ?? []),
                    mapKey: def.mapKey,
                    category: def.category,
                    projectile: def.projectile,
                });
            }
        }
    }


    update() {
        this.game.audioHandler.menu.stopSound('criminalitySoundtrack');
    }

    isNightMode() {
        const storyNight = this.game.map2Unlocked && this.game.map3Unlocked === false;
        const clockNight = isLocalNight(20, 6);
        return storyNight || clockNight;
    }

    buildHighlightTokens(phraseColors) {
        return Object.entries(phraseColors).map(([phrase, style]) => ({
            words: phrase.trim().split(/\s+/),
            style,
        }));
    }

    createPage({
        name = '',
        type = '',
        foundAt = '',
        description = '',
        images = [],
        mapKey = null,
        category = 'main',
        pageKind = 'enemy',
        projectile = undefined,

        coverTitle = null,
        coverImages = [],
    } = {}) {
        const page = {
            pageKind,
            name,
            type,
            foundAt,
            description,
            images,
            category,
            mapKey,
            projectile,

            coverTitle,
            coverImages,
        };

        (category === 'bonus' ? this.bonusPages : this.mainPages).push(page);
    }

    createCoverImage(imageId, x, y, width, height, options = {}) {
        return {
            img: document.getElementById(imageId),
            x, y, width, height,
            alpha: options.alpha ?? 1,
            rotate: options.rotate ?? 0,
            shadowColor: options.shadowColor ?? null,
            shadowBlur: options.shadowBlur ?? 0,
        };
    }

    ensureNextPageIsLeft(category = 'main') {
        const list = (category === 'bonus') ? this.bonusPages : this.mainPages;

        if (list.length % 2 === 1) {
            this.createPage({ category, pageKind: 'blank' });
        }
    }

    getTitleStyle(title) {
        if (!title) return null;
        return this.mapColors[title] || this.typeColors[title] || null;
    }

    createCoverPage({
        mapKey,
        coverTitle,
        category = 'main',
        coverImages = [],
    } = {}) {
        this.ensureNextPageIsLeft(category);

        this.createPage({
            mapKey,
            category,
            pageKind: 'cover',
            coverTitle,
            coverImages,
        });
    }

    createImage(enemyImage, frameWidth, frameHeight, enemyFrame, enemyX, enemyY, type, srcY = 0, size = 1) {
        const renderedWidth = frameWidth * size;
        const renderedHeight = frameHeight * size;

        let resolvedX = enemyX;
        if (enemyX === 'right') resolvedX = this.pageWidth - 110 - renderedWidth / 2;

        let resolvedY = enemyY;
        if (enemyY === 'top') resolvedY = 90 - renderedHeight / 2;
        else if (enemyY === 'bottom') resolvedY = this.pageHeight - renderedHeight - 30;

        return {
            enemyImage: document.getElementById(enemyImage),
            frameWidth,
            frameHeight,
            enemyFrame,
            enemyX: resolvedX,
            enemyY: resolvedY,
            size,
            type, // 'red' or 'stun' or 'poison' or 'slow' or null
            srcY,
        };
    }

    createLine(x, y, length, lineWidth = 2) {
        return { kind: 'line', lineX: x, lineY: y, lineLength: length, lineWidth };
    }

    getProjectileIconBounds(pageIndex, pageX, pageY) {
        const page = this.pages[pageIndex];
        if (!page || page.pageKind !== 'enemy' || page.projectile == null) return null;
        if (page.mapKey && !this.isMapKeyUnlocked(page.mapKey)) return null;

        const img = this.projectileImages[page.projectile];
        if (!img) return null;

        const maxWidth = this.pageWidth - 230;
        const iconCX = pageX + 20 + maxWidth - 50;
        const iconCY = pageY + 50;

        const scale = 0.9;
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;

        return {
            x: iconCX - w / 2,
            y: iconCY - h / 2,
            width: w,
            height: h,
            projectile: page.projectile,
        };
    }

    drawProjectileTooltip(context, projectileType) {
        const prefix = 'Projectile Type: ';
        const typeName = this.projectileDisplayNames[projectileType] || projectileType;

        context.save();
        context.font = 'bold 16px "Gloria Hallelujah"';
        const prefixWidth = context.measureText(prefix).width;
        const typeWidth = context.measureText(typeName).width;
        const totalWidth = prefixWidth + typeWidth;

        const padX = 14;
        const padY = 10;
        const boxW = totalWidth + padX * 2;
        const boxH = 32 + padY;
        const r = 8;

        let tipX = this.mouseX + 14;
        let tipY = this.mouseY - boxH - 6;

        if (tipX + boxW > this.game.width) tipX = this.mouseX - boxW - 6;
        if (tipY < 0) tipY = this.mouseY + 20;

        const gradient = context.createLinearGradient(tipX, tipY, tipX, tipY + boxH);
        gradient.addColorStop(0, '#f0e6c8');
        gradient.addColorStop(1, '#d2c397');

        context.beginPath();
        context.moveTo(tipX + r, tipY);
        context.lineTo(tipX + boxW - r, tipY);
        context.quadraticCurveTo(tipX + boxW, tipY, tipX + boxW, tipY + r);
        context.lineTo(tipX + boxW, tipY + boxH - r);
        context.quadraticCurveTo(tipX + boxW, tipY + boxH, tipX + boxW - r, tipY + boxH);
        context.lineTo(tipX + r, tipY + boxH);
        context.quadraticCurveTo(tipX, tipY + boxH, tipX, tipY + boxH - r);
        context.lineTo(tipX, tipY + r);
        context.quadraticCurveTo(tipX, tipY, tipX + r, tipY);
        context.closePath();

        context.shadowColor = 'rgba(0, 0, 0, 0.35)';
        context.shadowBlur = 8;
        context.fillStyle = gradient;
        context.fill();

        context.shadowBlur = 0;
        context.shadowColor = 'transparent';

        context.strokeStyle = '#a89870';
        context.lineWidth = 2;
        context.stroke();

        const textY = tipY + boxH / 2 + 1;
        context.textAlign = 'left';
        context.textBaseline = 'middle';

        context.fillStyle = '#2b2414';
        context.fillText(prefix, tipX + padX, textY);

        const typeStyle = this.typeColors[typeName.toUpperCase()];
        if (typeStyle) {
            context.strokeStyle = typeStyle.stroke || 'transparent';
            context.lineWidth = 4;
            context.shadowColor = typeStyle.stroke || 'transparent';
            context.shadowBlur = typeStyle.strokeBlur || 0;
            context.strokeText(typeName, tipX + padX + prefixWidth, textY);

            context.fillStyle = typeStyle.fill;
            context.shadowBlur = typeStyle.strokeBlur || 0;
            context.fillText(typeName, tipX + padX + prefixWidth, textY);

            context.shadowBlur = 0;
            context.shadowColor = 'transparent';
        } else {
            context.fillText(typeName, tipX + padX + prefixWidth, textY);
        }

        context.restore();
    }

    drawProjectileIcon(context, cx, cy, projectileType) {
        const img = this.projectileImages[projectileType];
        if (!img) return;

        context.save();

        const scale = 0.9;
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        context.drawImage(img, cx - w / 2, cy - h / 2, w, h);

        context.restore();
    }

    setCategory(category) {
        if (category !== 'main' && category !== 'bonus') return;
        if (this.category === category) return;

        if (category === 'bonus' && !this.game.bonusMap1Unlocked) return;

        if (this.category === 'main') {
            this.currentPageMain = this.currentPage;
        } else if (this.category === 'bonus') {
            this.currentPageBonus = this.currentPage;
        }

        this.category = category;
        this.pages = (category === 'bonus') ? this.bonusPages : this.mainPages;

        if (this.category === 'main') {
            const maxIndex = Math.max(0, this.mainPages.length - 1);
            this.currentPage = Math.min(this.currentPageMain, maxIndex);
        } else {
            const maxIndex = Math.max(0, this.bonusPages.length - 1);
            this.currentPage = Math.min(this.currentPageBonus, maxIndex);
        }

        this.game.audioHandler.menu.playSound('enemyLoreSwitchTabSound', false, true);
    }

    getMainTabBounds() {
        const tabWidth = 200;
        const tabHeight = 50;
        const x = this.bookX + 40;
        const y = this.bookY - tabHeight - 15;
        return { x, y, width: tabWidth, height: tabHeight };
    }

    getBonusTabBounds() {
        const tabWidth = 200;
        const tabHeight = 50;
        const x = this.bookX + 260;
        const y = this.bookY - tabHeight - 15;
        return { x, y, width: tabWidth, height: tabHeight };
    }

    getMapKeysForCategory(category) {
        if (category === 'bonus') return ['bonusMap1', 'bonusMap2', 'bonusMap3'];
        return ['map1', 'map2', 'map3', 'map4', 'map5', 'map6', 'map7'];
    }

    isMapKeyUnlocked(mapKey) {
        if (mapKey === 'bonusMap3') {
            return (
                !!this.game.bonusMap3Unlocked &&
                !!this.game.elyvorgDefeated &&
                !!this.game.glacikalDefeated
            );
        }

        const flag = `${mapKey}Unlocked`;

        if (Object.prototype.hasOwnProperty.call(this.game, flag)) {
            return !!this.game[flag];
        }

        if (mapKey === 'map1') return true;
        return false;
    }

    getUnlockedMapKeysForCurrentCategory() {
        const keys = this.getMapKeysForCategory(this.category);
        return keys.filter(k => this.isMapKeyUnlocked(k));
    }

    getFirstPageIndexForMapKey(mapKey) {
        const list = this.pages;
        for (let i = 0; i < list.length; i++) {
            if (list[i]?.mapKey === mapKey) return i;
        }
        return -1;
    }

    getActiveMapKeyForSpread() {
        const left = this.pages[this.currentPage]?.mapKey || null;
        const right = (this.currentPage + 1 < this.pages.length)
            ? (this.pages[this.currentPage + 1]?.mapKey || null)
            : null;

        if (right && right !== left) return right;
        return left;
    }

    getMapNumberTabs() {
        const unlocked = this.getUnlockedMapKeysForCurrentCategory();
        const tabs = [];

        const w = 42;
        const h = 34;

        const MAX_SLOTS = 7;
        const stepX = 4;
        const stepY = 55;

        const lastSlotX = (this.game.width - 55) - w;

        const baseX = lastSlotX - ((MAX_SLOTS - 1) * stepX);
        const baseY = this.bookY + 80;

        const getSlotIndex = (mapKey) => {
            const n = parseInt(
                mapKey.replace('bonusMap', '').replace('map', ''),
                10
            );
            return Number.isFinite(n) ? n - 1 : -1;
        };

        for (const mapKey of unlocked) {
            const slotIndex = getSlotIndex(mapKey);
            if (slotIndex < 0 || slotIndex >= MAX_SLOTS) continue;

            const x = baseX + (slotIndex * stepX);
            const y = baseY + (slotIndex * stepY);

            tabs.push({
                mapKey,
                label: String(slotIndex + 1),
                x,
                y,
                width: w,
                height: h,
            });
        }

        tabs.sort((a, b) => a.y - b.y);

        return tabs;
    }

    drawMapNumberTabs(context) {
        const tabs = this.getMapNumberTabs();
        if (!tabs.length) return;

        const activeMapKey = this.getActiveMapKeyForSpread();

        const drawMiniTab = (tab, isActive) => {
            const r = 8;

            context.beginPath();
            context.moveTo(tab.x, tab.y + tab.height);
            context.lineTo(tab.x, tab.y);
            context.lineTo(tab.x + tab.width - r, tab.y);
            context.quadraticCurveTo(tab.x + tab.width, tab.y, tab.x + tab.width, tab.y + r);
            context.lineTo(tab.x + tab.width, tab.y + tab.height - r);
            context.quadraticCurveTo(tab.x + tab.width, tab.y + tab.height, tab.x + tab.width - r, tab.y + tab.height);
            context.lineTo(tab.x, tab.y + tab.height);
            context.closePath();

            const gradient = context.createLinearGradient(tab.x, tab.y, tab.x, tab.y + tab.height);
            if (isActive) {
                gradient.addColorStop(0, '#f0e6c8');
                gradient.addColorStop(1, '#d2c397');
            } else {
                gradient.addColorStop(0, '#cbc8bd');
                gradient.addColorStop(1, '#afa894');
            }

            context.fillStyle = gradient;
            context.shadowColor = isActive ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.25)';
            context.shadowBlur = isActive ? 10 : 4;
            context.fill();

            context.shadowBlur = 0;
            context.shadowColor = 'transparent';

            context.font = 'bold 18px "Gloria Hallelujah"';
            context.textAlign = 'center';
            context.fillStyle = '#2b2414';
            context.shadowColor = isActive ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.2)';
            context.shadowBlur = isActive ? 6 : 3;

            const cx = tab.x + tab.width / 2;
            const cy = tab.y + tab.height / 2 + 5;
            context.fillText(tab.label, cx, cy);

            context.shadowBlur = 0;
            context.shadowColor = 'transparent';

            if (isActive) {
                const textWidth = context.measureText(tab.label).width;
                const underlineY = tab.y + tab.height / 2 + 10;
                const underlineX1 = cx - textWidth / 2;
                const underlineX2 = cx + textWidth / 2;

                context.strokeStyle = '#2b2414';
                context.lineWidth = 2;

                const y1 = underlineY - 1;
                const y2 = underlineY + 0;
                const y3 = underlineY + 1;

                context.beginPath();
                context.moveTo(underlineX1, y1);
                context.lineTo(underlineX1 + textWidth * 0.5, y2);
                context.lineTo(underlineX2, y3);
                context.stroke();
            }
        };

        for (let i = tabs.length - 1; i >= 0; i--) {
            const tab = tabs[i];
            drawMiniTab(tab, tab.mapKey === activeMapKey);
        }
    }

    getMaxValidIndex() {
        return this.pages.length % 2 === 0
            ? this.pages.length - 2
            : this.pages.length - 1;
    }

    drawPageContent(context, pageIndex, x, y) {
        const page = this.pages[pageIndex];
        if (!page) return;

        if (page.pageKind === 'blank') return;

        if (page.pageKind === 'cover') {
            const locked = (typeof page.mapKey === 'string')
                ? !this.isMapKeyUnlocked(page.mapKey)
                : false;

            context.save();
            context.beginPath();
            context.rect(x, y, this.pageWidth, this.pageHeight);
            context.clip();

            const drawCoverImages = (list, blurAmount = 0) => {
                if (!Array.isArray(list) || list.length === 0) return;

                for (const item of list) {
                    if (!item?.img) continue;

                    context.save();

                    context.filter = blurAmount > 0 ? `blur(${blurAmount}px)` : 'none';
                    context.globalAlpha = item.alpha ?? 1;

                    if (item.shadowColor) {
                        context.shadowColor = item.shadowColor;
                        context.shadowBlur = item.shadowBlur ?? 0;
                    } else {
                        context.shadowColor = 'transparent';
                        context.shadowBlur = 0;
                    }

                    const dx = x + (item.x ?? 0);
                    const dy = y + (item.y ?? 0);
                    const dw = item.width ?? this.pageWidth;
                    const dh = item.height ?? this.pageHeight;

                    const rot = item.rotate ?? 0;
                    if (rot) {
                        const cx = dx + dw / 2;
                        const cy = dy + dh / 2;
                        context.translate(cx, cy);
                        context.rotate(rot);
                        context.drawImage(item.img, -dw / 2, -dh / 2, dw, dh);
                    } else {
                        context.drawImage(item.img, dx, dy, dw, dh);
                    }

                    context.restore();
                }
            };

            drawCoverImages(page.coverImages, locked ? 65 : 0);

            context.filter = 'none';

            const displayTitle = locked ? '???' : (page.coverTitle || page.mapKey || '???');
            const style = this.getTitleStyle(displayTitle) || { fill: '#2b2414', stroke: 'white', strokeBlur: 10 };

            const cx = x + this.pageWidth / 2;
            const cy = y + this.pageHeight / 2;

            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.font = 'bold 44px "Gloria Hallelujah"';

            context.fillStyle = style.fill || 'black';
            context.strokeStyle = style.stroke || 'transparent';
            context.lineWidth = 10;

            context.shadowColor = style.stroke || 'transparent';
            context.shadowBlur = style.strokeBlur || 0;

            if (context.strokeStyle !== 'transparent') context.strokeText(displayTitle, cx, cy);
            context.fillText(displayTitle, cx, cy);

            context.shadowBlur = 0;
            context.shadowColor = 'transparent';

            context.restore();
            return;
        }

        context.font = 'bold 21px "Gloria Hallelujah"';
        context.fillStyle = 'black';
        context.textAlign = 'left';

        const locked = page.mapKey ? !this.isMapKeyUnlocked(page.mapKey) : false;

        context.save();
        context.beginPath();
        context.rect(x, y, this.pageWidth, this.pageHeight);
        context.clip();

        if (page.images && page.images.length > 0) {
            page.images.forEach(image => {
                context.filter = locked ? 'blur(15px)' : 'none';

                if (image.kind === 'line') {
                    context.save();
                    context.strokeStyle = 'black';
                    context.lineWidth = image.lineWidth;
                    context.beginPath();
                    context.moveTo(x + image.lineX, y + image.lineY);
                    context.lineTo(x + image.lineX, y + image.lineY + image.lineLength);
                    context.stroke();
                    context.restore();
                    return;
                }

                const scale = image.size || 1;
                const frameWidth = image.frameWidth * scale;
                const frameHeight = image.frameHeight * scale;
                const frameX = image.enemyFrame * image.frameWidth;

                context.shadowColor = 'transparent';
                context.shadowBlur = 0;

                if (!locked) {
                    context.shadowColor = 'transparent';
                    context.shadowBlur = 0;

                    if (image.type === 'red') {
                        context.shadowColor = 'red';
                        context.shadowBlur = 20;
                    } else if (image.type === 'stun') {
                        context.shadowColor = 'yellow';
                        context.shadowBlur = 20;
                    } else if (image.type === 'poison') {
                        context.shadowColor = 'green';
                        context.shadowBlur = 20;
                    } else if (image.type === 'slow') {
                        context.shadowColor = 'blue';
                        context.shadowBlur = 20;
                    } else if (image.type === 'frozen') {
                        context.shadowColor = 'cyan';
                        context.shadowBlur = 20;
                    }
                } else {
                    context.shadowColor = 'transparent';
                    context.shadowBlur = 0;
                }

                context.drawImage(
                    image.enemyImage,
                    frameX, image.srcY ?? 0,
                    image.frameWidth, image.frameHeight,
                    x + image.enemyX, y + image.enemyY,
                    frameWidth, frameHeight
                );

                context.shadowColor = 'transparent';
                context.shadowBlur = 0;
            });
        }

        context.restore();

        const lineHeight = 28;
        const gapHeight = 24;
        const maxWidth = this.pageWidth - 230;

        let offsetY = 50;

        const renderText = (text, startX, startY, extraPhrases = []) => {
            // tokenize text into words/spaces/newlines
            const rawPieces = text.split(' ');
            const tokens = [];

            rawPieces.forEach((piece, idx) => {
                const parts = piece.split('\n');
                for (let i = 0; i < parts.length; i++) {
                    const fragment = parts[i];
                    if (fragment.length > 0) {
                        tokens.push({ type: 'word', text: fragment, style: null });
                    }
                    if (i < parts.length - 1) {
                        tokens.push({ type: 'newline' });
                    }
                }
                if (idx < rawPieces.length - 1) {
                    tokens.push({ type: 'space' });
                }
            });

            // phrase matching across the full word stream
            const normalize = (s) => s.replace(/[^\w]/g, '').toUpperCase();

            const wordIndexes = [];
            tokens.forEach((t, i) => {
                if (t.type === 'word') wordIndexes.push(i);
            });

            [...this.highlightPhrases, ...extraPhrases].forEach(({ words, style }) => {
                const normPhrase = words.map(w => normalize(w));
                if (!normPhrase.length) return;

                for (let wi = 0; wi <= wordIndexes.length - normPhrase.length; wi++) {
                    let match = true;
                    for (let pi = 0; pi < normPhrase.length; pi++) {
                        const token = tokens[wordIndexes[wi + pi]];
                        if (normalize(token.text) !== normPhrase[pi]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        for (let pi = 0; pi < normPhrase.length; pi++) {
                            const token = tokens[wordIndexes[wi + pi]];
                            token.style = style;
                        }
                    }
                }
            });

            // wrap and draw with styles
            let currentY = startY;
            let lineTokens = [];
            let lineWidthAccum = 0;

            const flushLine = () => {
                let offsetX = startX;
                lineTokens.forEach(token => {
                    if (token.type === 'newline') return;
                    const textPart = token.type === 'space' ? ' ' : token.text;

                    const style = token.style || {};
                    const fillStyle = style.fill || 'black';
                    const strokeStyle = style.stroke || 'transparent';
                    const strokeBlur = style.strokeBlur || 0;

                    context.fillStyle = fillStyle;
                    context.strokeStyle = strokeStyle;
                    context.lineWidth = 4;
                    context.shadowBlur = strokeBlur;
                    context.shadowColor = strokeStyle;

                    context.strokeText(textPart, offsetX, currentY);
                    context.fillText(textPart, offsetX, currentY);

                    offsetX += context.measureText(textPart).width;
                });

                currentY += lineHeight;
                lineTokens = [];
                lineWidthAccum = 0;
            };

            tokens.forEach(token => {
                if (token.type === 'newline') {
                    if (lineTokens.length > 0) flushLine();
                    else currentY += lineHeight;
                    return;
                }

                const textPart = token.type === 'space' ? ' ' : token.text;
                const width = context.measureText(textPart).width;

                if (token.type === 'word' && lineTokens.length > 0 && lineWidthAccum + width > maxWidth) {
                    flushLine();
                }

                lineTokens.push(token);
                lineWidthAccum += width;
            });

            if (lineTokens.length > 0) flushLine();

            context.shadowBlur = 0;
            context.shadowColor = 'transparent';
        };

        if (locked) {
            context.fillText(`NAME: ???`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            context.fillText(`TYPE: ??? & ???`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            context.fillText(`FOUND AT: ???`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            context.fillText(`DESCRIPTION: ???`, x + 20, y + offsetY);
        } else {
            renderText(`NAME: ${page.name}`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            renderText(`TYPE: ${page.type}`, x + 20, y + offsetY, this.typeHighlightPhrases);
            offsetY += lineHeight + gapHeight;
            renderText(`FOUND AT: ${page.foundAt}`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            renderText(`DESCRIPTION:`, x + 20, y + offsetY);
            offsetY += lineHeight;
            renderText(page.description, x + 20, y + offsetY);

            if (page.projectile !== undefined && page.projectile !== null) {
                const iconCX = x + 20 + maxWidth - 50;
                const iconCY = y + 50;
                this.drawProjectileIcon(context, iconCX, iconCY, page.projectile);
            }
        }
    }

    draw(context) {
        if (!this.menuActive) return;
        if (!this.fontsReady) return;

        this.game.audioHandler.menu.stopSound('criminalitySoundtrack');

        const isNight = this.isNightMode();
        const bg = isNight ? this.backgroundImageNight : this.backgroundImage;
        context.drawImage(bg, 0, 0, this.game.width, this.game.height);

        context.save();

        const mainTab = this.getMainTabBounds();
        const bonusTab = this.getBonusTabBounds();

        const drawTab = (label, tab, isActive) => {
            context.beginPath();
            const r = 8;
            context.moveTo(tab.x, tab.y + tab.height);
            context.lineTo(tab.x, tab.y + r);
            context.quadraticCurveTo(tab.x, tab.y, tab.x + r, tab.y);
            context.lineTo(tab.x + tab.width - r, tab.y);
            context.quadraticCurveTo(tab.x + tab.width, tab.y, tab.x + tab.width, tab.y + r);
            context.lineTo(tab.x + tab.width, tab.y + tab.height);
            context.closePath();

            const gradient = context.createLinearGradient(
                tab.x,
                tab.y,
                tab.x,
                tab.y + tab.height
            );

            if (isActive) {
                gradient.addColorStop(0, '#f0e6c8');
                gradient.addColorStop(1, '#d2c397');
            } else {
                gradient.addColorStop(0, '#cbc8bd');
                gradient.addColorStop(1, '#afa894');
            }

            context.fillStyle = gradient;
            context.shadowColor = isActive ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.25)';
            context.shadowBlur = isActive ? 10 : 4;
            context.fill();
            context.shadowBlur = 0;
            context.shadowColor = 'transparent';

            context.font = 'bold 20px "Gloria Hallelujah"';
            context.textAlign = 'center';
            context.fillStyle = '#2b2414';
            context.shadowColor = isActive ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.2)';
            context.shadowBlur = isActive ? 6 : 3;
            context.fillText(label, tab.x + tab.width / 2, tab.y + tab.height / 2 + 4);

            if (isActive) {
                const textMetrics = context.measureText(label);
                const textWidth = textMetrics.width;

                const underlineY = tab.y + tab.height / 2 + 8;
                const underlineX1 = tab.x + (tab.width - textWidth) / 2;
                const underlineX2 = underlineX1 + textWidth;

                context.strokeStyle = '#2b2414';
                context.lineWidth = 2;

                const y1 = underlineY - 1;
                const y2 = underlineY + 0;
                const y3 = underlineY + 1;

                context.beginPath();
                context.moveTo(underlineX1, y1);
                context.lineTo(underlineX1 + textWidth * 0.5, y2);
                context.lineTo(underlineX2, y3);
                context.stroke();
            }

            context.shadowBlur = 0;
            context.shadowColor = 'transparent';
        };

        if (!this.game.bonusMap1Unlocked && this.category === 'bonus') {
            this.category = 'main';
            this.pages = this.mainPages;
            this.currentPage = Math.min(this.currentPageMain, Math.max(0, this.mainPages.length - 1));
        }

        drawTab('MAIN STORY', mainTab, this.category === 'main');

        if (this.game.bonusMap1Unlocked) {
            drawTab('BONUS MAPS', bonusTab, this.category === 'bonus');
        }

        const bookBackgroundX = (this.game.width - this.enemyLoreBookBackground.width) / 2;
        const bookBackgroundY = (this.game.height - this.enemyLoreBookBackground.height) / 2 + 10;

        context.drawImage(this.enemyLoreBookBackground, bookBackgroundX, bookBackgroundY);

        this.drawPageContent(context, this.currentPage, this.bookX, this.bookY);
        if (this.currentPage + 1 < this.pages.length) {
            this.drawPageContent(context, this.currentPage + 1, this.bookX + this.pageWidth, this.bookY);
        }

        this.drawMapNumberTabs(context);

        // page numbers
        context.font = '24px "Arial"';
        context.fillStyle = 'black';
        context.textAlign = 'left';
        context.fillText(this.currentPage + 1, this.bookX + 10, this.bookY + this.pageHeight - 10);
        if (this.currentPage + 1 < this.pages.length) {
            context.textAlign = 'right';
            context.fillText(this.currentPage + 2, this.bookX + this.pageWidth * 2 - 10, this.bookY + this.pageHeight - 10);
        }

        // projectile tooltip on hover
        const leftBounds = this.getProjectileIconBounds(this.currentPage, this.bookX, this.bookY);
        const rightBounds = (this.currentPage + 1 < this.pages.length)
            ? this.getProjectileIconBounds(this.currentPage + 1, this.bookX + this.pageWidth, this.bookY)
            : null;

        const hitTest = (b) => b &&
            this.mouseX >= b.x && this.mouseX <= b.x + b.width &&
            this.mouseY >= b.y && this.mouseY <= b.y + b.height;

        if (hitTest(leftBounds)) {
            this.drawProjectileTooltip(context, leftBounds.projectile);
        } else if (hitTest(rightBounds)) {
            this.drawProjectileTooltip(context, rightBounds.projectile);
        }

        context.restore();
    }

    nextPage() {
        const maxValidIndex = this.getMaxValidIndex();
        if (this.currentPage < maxValidIndex) {
            this.currentPage++;
            this.game.audioHandler.menu.playSound('bookFlipForwardSound', false, true);
        }
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.game.audioHandler.menu.playSound('bookFlipBackwardSound', false, true);
        }
    }

    clickNextPage() {
        const maxValidIndex = this.getMaxValidIndex();
        if (this.currentPage < maxValidIndex) {
            this.currentPage += 2;
            this.game.audioHandler.menu.playSound('bookFlipForwardSound', false, true);
        }
    }

    clickPreviousPage() {
        if (this.currentPage > 0) {
            this.currentPage = Math.max(0, this.currentPage - 2);
            this.game.audioHandler.menu.playSound('bookFlipBackwardSound', false, true);
        }
    }

    // keyboard
    handleKeyDown(event) {
        if (!this.menuActive) return;

        if (event.key === 'ArrowUp') {
            this.setCategory('main');
            return;
        }

        if (event.key === 'ArrowDown') {
            if (this.game.bonusMap1Unlocked) {
                this.setCategory('bonus');
            }
            return;
        }

        if (event.key === 'ArrowRight') {
            this.nextPage();
        } else if (event.key === 'ArrowLeft') {
            this.previousPage();
        }
    }

    // mouse wheel for pages
    handleMouseWheel(event) {
        if (!this.menuActive) return;

        const delta = Math.sign(event.deltaY);

        if (delta < 0) {
            this.clickNextPage();
        } else if (delta > 0) {
            this.clickPreviousPage();
        }
    }

    // mouse click for tabs + pages
    handleMouseClick(event) {
        if (!this.menuActive) return;

        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;

        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;

        const mainTab = this.getMainTabBounds();
        const bonusTab = this.getBonusTabBounds();

        const inTab = (tab) =>
            mouseX >= tab.x &&
            mouseX <= tab.x + tab.width &&
            mouseY >= tab.y &&
            mouseY <= tab.y + tab.height;

        if (inTab(mainTab)) {
            this.setCategory('main');
            return;
        }
        if (inTab(bonusTab)) {
            if (this.game.bonusMap1Unlocked) {
                this.setCategory('bonus');
            }
            return;
        }

        const leftPageBounds = {
            x: this.bookX,
            y: this.bookY,
            width: this.pageWidth,
            height: this.pageHeight
        };

        const rightPageBounds = {
            x: this.bookX + this.pageWidth,
            y: this.bookY,
            width: this.pageWidth,
            height: this.pageHeight
        };

        const mapTabs = this.getMapNumberTabs();
        for (const tab of mapTabs) {
            const inMiniTab =
                mouseX >= tab.x &&
                mouseX <= tab.x + tab.width &&
                mouseY >= tab.y &&
                mouseY <= tab.y + tab.height;

            if (inMiniTab) {
                const firstIndex = this.getFirstPageIndexForMapKey(tab.mapKey);
                if (firstIndex !== -1) {
                    let target = firstIndex;
                    if (target % 2 === 1) target = Math.max(0, target - 1);

                    const maxValidIndex = this.getMaxValidIndex();
                    target = Math.min(target, maxValidIndex);

                    if (target !== this.currentPage) {
                        this.currentPage = target;
                        this.game.audioHandler.menu.playSound('enemyLoreSwitchTabSound', false, true);
                    }
                }
                return;
            }
        }

        if (mouseX >= leftPageBounds.x &&
            mouseX <= leftPageBounds.x + leftPageBounds.width &&
            mouseY >= leftPageBounds.y &&
            mouseY <= leftPageBounds.y + leftPageBounds.height) {
            this.clickPreviousPage();
        } else if (mouseX >= rightPageBounds.x &&
            mouseX <= rightPageBounds.x + rightPageBounds.width &&
            mouseY >= rightPageBounds.y &&
            mouseY <= rightPageBounds.y + rightPageBounds.height) {
            this.clickNextPage();
        }
    }

    handleMouseMove(event) {
        if (!this.menuActive) return;

        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;

        this.mouseX = (event.clientX - rect.left) * scaleX;
        this.mouseY = (event.clientY - rect.top) * scaleY;
    }
}
