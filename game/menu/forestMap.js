import { isLocalNight } from '../config/timeOfDay.js';
import {
    FIREDOG_FRAME,
    getSkinElement,
    COSMETIC_LAYER_ORDER,
    getCosmeticElement,
    getCosmeticChromaDegFromState,
    drawWithOptionalHue,
} from '../config/skinsAndCosmetics.js';
import { BaseMenu } from './baseMenu.js';
import {
    Map1Cutscene, Map2Cutscene, Map3Cutscene, Map4Cutscene, Map5Cutscene, Map6Cutscene, Map7Cutscene,
    BonusMap1Cutscene, BonusMap2Cutscene, BonusMap3Cutscene
} from '../cutscene/storyCutscenes.js';
import { Map1, Map2, Map3, Map4, Map5, Map6, Map7, BonusMap1, BonusMap2, BonusMap3 } from '../background/background.js';
import { SavingAnimation, SavingBookAnimation } from '../animations/savingAnimation.js';
import { Cabin } from '../entities/cabin.js';
import { Penguini } from '../entities/penguini.js';

export class ForestMapMenu extends BaseMenu {
    constructor(game) {
        const circleOptions = [
            { x: 700, y: 200, radius: 20 },  // Map 1 (0)
            { x: 970, y: 195, radius: 20 },  // Map 2 (1)
            { x: 1140, y: 205, radius: 20 }, // Map 3 (2)
            { x: 1300, y: 300, radius: 20 }, // Map 4 (3)
            { x: 1427, y: 396, radius: 20 }, // Map 5 (4)
            { x: 1355, y: 500, radius: 20 }, // Map 6 (5)
            { x: 1210, y: 620, radius: 20 }, // Map 7 (6)

            { x: 883, y: 97, radius: 18 },   // Bonus Map 1 (7)
            { x: 1670, y: 484, radius: 18 }, // Bonus Map 2 (8)
            { x: 1570, y: 205, radius: 18 }, // Bonus Map 3 (9)
        ];
        super(game);

        this.mapNames = {
            map1: 'Lunar Glade',
            map2: 'Nightfall Phantom Graves',
            map3: 'Coral Abyss',
            map4: 'Verdant Vine',
            map5: 'Springly Lemony',
            map6: 'Venomveil Lake',
            map7: 'Infernal Crater Peak',
            bonus1: 'Icebound Cave',
            bonus2: 'Crimson Fissure',
            bonus3: 'Cosmic Rift',
        };

        this.mapColors = {
            map1: { fill: '#57e2d0ff', stroke: '#097e12ff', strokeBlur: 5 },
            map2: { fill: '#a84ffcff', stroke: '#380057ff', strokeBlur: 4 },
            map3: { fill: 'dodgerblue', stroke: 'darkblue', strokeBlur: 4 },
            map4: { fill: '#61c050ff', stroke: '#346b38ff', strokeBlur: 5 },
            map5: { fill: 'yellow', stroke: 'orange', strokeBlur: 5 },
            map6: { fill: '#39ff14', stroke: '#003b00', strokeBlur: 10 },
            map7: { fill: '#ff2100ff', stroke: 'black', strokeBlur: 5 },
            bonus1: { fill: '#8fd7ff', stroke: '#1c4a7f', strokeBlur: 10 },
            bonus2: { fill: '#dc143c', stroke: 'black', strokeBlur: 12 },
            bonus3: { fill: '#ff41ffff', stroke: '#270033', strokeBlur: 10 },
        };

        this.defaultMapColor = {
            fill: 'white',
            stroke: 'black',
            strokeBlur: 3,
        };

        this.circleOptions = circleOptions;
        this.selectedCircleIndex = 0;
        this.showSavingSprite = false;
        this.savingAnimation = new SavingAnimation(this.game);
        this.savingBookAnimation = new SavingBookAnimation(this.game);

        this.backgroundImage = document.getElementById('forestmap');
        this.backgroundImageNight = document.getElementById('forestmapNight');

        this.fixedLeftRibbonWidth = null;

        this.lockedNoticeText = '';
        this.lockedNoticeTimer = 0;

        document.addEventListener('wheel', this.handleMouseWheel.bind(this));
    }

    showLockedNotice(text = 'UNAVAILABLE!', durationMs = 1400) {
        this.lockedNoticeText = text;
        this.lockedNoticeTimer = durationMs;
    }

    canEnterBonusMap3() {
        return !!this.game.glacikalDefeated && !!this.game.elyvorgDefeated;
    }

    isBonusMap3Sealed() {
        return !!this.game.bonusMap3Unlocked && !this.canEnterBonusMap3();
    }

    handleMenuSelection() {
        super.handleMenuSelection();
        const circleIndex = this.selectedCircleIndex;

        if (circleIndex === 9 && !this.canEnterBonusMap3()) {
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            this.showLockedNotice('UNAVAILABLE!');
            return;
        }

        const mapOptions = [
            { Map: Map1, maxDistance: 200, winningCoins: 230, environment: null, Cutscene: Map1Cutscene },
            { Map: Map2, maxDistance: 240, winningCoins: 270, environment: null, Cutscene: Map2Cutscene },
            { Map: Map3, maxDistance: 270, winningCoins: 200, environment: 'underwater', Cutscene: Map3Cutscene },
            { Map: Map4, maxDistance: 240, winningCoins: 280, environment: null, Cutscene: Map4Cutscene },
            { Map: Map5, maxDistance: 250, winningCoins: 300, environment: null, Cutscene: Map5Cutscene },
            { Map: Map6, maxDistance: 100, winningCoins: 100, environment: null, Cutscene: Map6Cutscene },
            { Map: Map7, maxDistance: 9999999, winningCoins: 0, environment: null, Cutscene: Map7Cutscene },
            { Map: BonusMap1, maxDistance: 9999999, winningCoins: 0, environment: 'ice', Cutscene: BonusMap1Cutscene },
            { Map: BonusMap2, maxDistance: 250, winningCoins: 0, environment: null, Cutscene: BonusMap2Cutscene },
            { Map: BonusMap3, maxDistance: 250, winningCoins: 0, environment: 'space', Cutscene: BonusMap3Cutscene },
        ];

        const entry = mapOptions[circleIndex];
        if (!entry) {
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            return;
        }

        const { Map, maxDistance, winningCoins, environment = null, Cutscene } = entry;

        this.game.player.isUnderwater = false;
        this.game.player.isIce = false;
        this.game.player.isSpace = false;

        switch (environment) {
            case 'underwater':
                this.game.player.isUnderwater = true;
                break;
            case 'ice':
                this.game.player.isIce = true;
                break;
            case 'space':
                this.game.player.isSpace = true;
                break;
        }

        this.game.maxDistance = maxDistance;
        this.game.winningCoins = winningCoins;

        const mapCutscene = new Cutscene(this.game);
        this.game.startCutscene(mapCutscene);
        mapCutscene.displayDialogue();

        const map = new Map(this.game);
        this.setMap(map);

        this.game.menu.main.closeAllMenus();
    }

    isNightMode() {
        const storyNight = this.game.map2Unlocked && this.game.map3Unlocked === false;
        const clockNight = isLocalNight(20, 6);
        return storyNight || clockNight;
    }

    getCurrentMapIcon() {
        const skinKey = this.game.menu.wardrobe?.currentSkinKey || 'defaultSkin';
        return getSkinElement(skinKey) || getSkinElement('defaultSkin') || null;
    }

    getCurrentCosmeticIconsInLayerOrder() {
        const wardrobe = this.game.menu.wardrobe;
        const chromaState = wardrobe.getCurrentCosmeticsChromaState() || {};

        const out = [];

        for (const slot of COSMETIC_LAYER_ORDER) {
            const key = wardrobe.getCurrentCosmeticKey(slot) || 'none';

            if (key === 'none') {
                out.push({ slot, key, img: null, hueDeg: 0 });
                continue;
            }

            const img = getCosmeticElement(slot, key) || null;
            const hueDeg = getCosmeticChromaDegFromState(slot, key, chromaState);

            out.push({ slot, key, img, hueDeg });
        }

        return out;
    }

    drawStraightConnection(context, fromCircle, toCircle) {
        const dx = toCircle.x - fromCircle.x;
        const dy = toCircle.y - fromCircle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!dist) return;

        const startX = fromCircle.x + (dx / dist) * fromCircle.radius;
        const startY = fromCircle.y + (dy / dist) * fromCircle.radius;
        const endX = toCircle.x - (dx / dist) * toCircle.radius;
        const endY = toCircle.y - (dy / dist) * toCircle.radius;

        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        context.lineWidth = 4;
        context.stroke();
        context.closePath();
    }

    drawElbowConnection(context, fromCircle, toCircle, offset = 35, offsetAdjust = { x: -5, y: -15 }) {
        const dx = toCircle.x - fromCircle.x;
        const dy = toCircle.y - fromCircle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!dist) return;

        const startX = fromCircle.x + (dx / dist) * fromCircle.radius;
        const startY = fromCircle.y + (dy / dist) * fromCircle.radius;
        const endX = toCircle.x - (dx / dist) * toCircle.radius;
        const endY = toCircle.y - (dy / dist) * toCircle.radius;

        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        let perpX = -dy / dist;
        let perpY = dx / dist;

        if (perpY > 0) {
            perpX = -perpX;
            perpY = -perpY;
        }

        const elbowX = midX + perpX * offset + offsetAdjust.x;
        const elbowY = midY + perpY * offset + offsetAdjust.y;

        context.save();
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(elbowX, elbowY);
        context.lineTo(endX, endY);
        context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        context.lineWidth = 4;
        context.stroke();
        context.closePath();
        context.restore();
    }

    getMapKeyByIndex(index) {
        if (index >= 0 && index <= 6) return `map${index + 1}`;
        if (index === 7) return 'bonus1';
        if (index === 8) return 'bonus2';
        if (index === 9) return 'bonus3';
        return null;
    }

    computeMapNameParts(idx) {
        const nameKey = this.getMapKeyByIndex(idx);
        const rawName = nameKey ? (this.mapNames[nameKey] || '') : '';

        let mapIndexLabel = '';
        let mapNameLabel = rawName ? rawName.toUpperCase() : '';

        if (idx >= 0 && idx <= 6) {
            mapIndexLabel = `MAP ${idx + 1}`;
        } else if (idx >= 7 && idx <= 9) {
            const bonusNumber = idx - 6;
            mapIndexLabel = `BONUS MAP ${bonusNumber}`;
        }

        const colorCfg = (nameKey && this.mapColors[nameKey]) || this.defaultMapColor;

        return { nameKey, mapIndexLabel, mapNameLabel, colorCfg };
    }

    drawRibbonBackgroundsAndLines(context, ribbonY, ribbonHeight, loreText, isNight, showRightRibbon = true) {
        const leftExtra = 120;
        const rightExtra = 120;

        context.font = '40px Love Ya Like A Sister';

        // left ribbon width
        if (!this.fixedLeftRibbonWidth) {
            let longestName = '';
            for (const key in this.mapNames) {
                const value = this.mapNames[key] || '';
                if (value.length > longestName.length) longestName = value;
            }
            const sampleText = longestName.toUpperCase();
            const sampleWidth = context.measureText(sampleText).width;
            this.fixedLeftRibbonWidth = sampleWidth + leftExtra;
        }

        const leftRibbonWidth = this.fixedLeftRibbonWidth;
        const leftRibbonX = 0;

        // left background
        let leftRibbonGradient = context.createLinearGradient(leftRibbonX, ribbonY, leftRibbonX + leftRibbonWidth, ribbonY);
        if (isNight) {
            leftRibbonGradient.addColorStop(0.00, 'rgba(0, 0, 0, 0.95)');
            leftRibbonGradient.addColorStop(0.60, 'rgba(0, 0, 0, 0.85)');
            leftRibbonGradient.addColorStop(1.00, 'rgba(0, 0, 0, 0.00)');
        } else {
            leftRibbonGradient.addColorStop(0.00, 'rgba(0, 0, 0, 0.75)');
            leftRibbonGradient.addColorStop(0.60, 'rgba(0, 0, 0, 0.60)');
            leftRibbonGradient.addColorStop(1.00, 'rgba(0, 0, 0, 0.00)');
        }
        context.fillStyle = leftRibbonGradient;
        context.fillRect(leftRibbonX, ribbonY, leftRibbonWidth, ribbonHeight);

        // right background
        let rightRibbonX = 0;
        let rightRibbonWidth = 0;
        if (showRightRibbon) {
            const loreTextWidth = context.measureText(loreText).width;
            rightRibbonWidth = loreTextWidth + rightExtra;
            rightRibbonX = this.game.width - rightRibbonWidth;

            let rightRibbonGradient = context.createLinearGradient(rightRibbonX, ribbonY, rightRibbonX + rightRibbonWidth, ribbonY);
            if (isNight) {
                rightRibbonGradient.addColorStop(0.00, 'rgba(0, 0, 0, 0.00)');
                rightRibbonGradient.addColorStop(0.40, 'rgba(0, 0, 0, 0.85)');
                rightRibbonGradient.addColorStop(1.00, 'rgba(0, 0, 0, 0.95)');
            } else {
                rightRibbonGradient.addColorStop(0.00, 'rgba(0, 0, 0, 0.00)');
                rightRibbonGradient.addColorStop(0.40, 'rgba(0, 0, 0, 0.60)');
                rightRibbonGradient.addColorStop(1.00, 'rgba(0, 0, 0, 0.75)');
            }
            context.fillStyle = rightRibbonGradient;
            context.fillRect(rightRibbonX, ribbonY, rightRibbonWidth, ribbonHeight);
        }

        const lineHeight = 2;
        const lineY = ribbonY;

        // left line
        let leftLineGradient = context.createLinearGradient(leftRibbonX, lineY, leftRibbonX + leftRibbonWidth, lineY);
        if (isNight) {
            leftLineGradient.addColorStop(0.00, 'rgba(255, 165, 0, 0.85)');
            leftLineGradient.addColorStop(0.65, 'rgba(255, 165, 0, 0.55)');
            leftLineGradient.addColorStop(1.00, 'rgba(255, 165, 0, 0.00)');
        } else {
            leftLineGradient.addColorStop(0.00, 'rgba(255, 255, 255, 0.50)');
            leftLineGradient.addColorStop(0.65, 'rgba(255, 255, 255, 0.35)');
            leftLineGradient.addColorStop(1.00, 'rgba(255, 255, 255, 0.00)');
        }
        context.fillStyle = leftLineGradient;
        context.fillRect(leftRibbonX, lineY, leftRibbonWidth, lineHeight);

        // right line
        if (showRightRibbon) {
            let rightLineGradient = context.createLinearGradient(rightRibbonX, lineY, rightRibbonX + rightRibbonWidth, lineY);
            if (isNight) {
                rightLineGradient.addColorStop(0.00, 'rgba(255, 165, 0, 0.00)');
                rightLineGradient.addColorStop(0.35, 'rgba(255, 165, 0, 0.55)');
                rightLineGradient.addColorStop(1.00, 'rgba(255, 165, 0, 0.85)');
            } else {
                rightLineGradient.addColorStop(0.00, 'rgba(255, 255, 255, 0.00)');
                rightLineGradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.35)');
                rightLineGradient.addColorStop(1.00, 'rgba(255, 255, 255, 0.50)');
            }
            context.fillStyle = rightLineGradient;
            context.fillRect(rightRibbonX, lineY, rightRibbonWidth, lineHeight);
        }
    }

    isNodeUnlocked(index) {
        if (index >= 0 && index <= 6) {
            return !!this.game[`map${index + 1}Unlocked`];
        } else if (index === 7) {
            return !!this.game.bonusMap1Unlocked;
        } else if (index === 8) {
            return !!this.game.bonusMap2Unlocked;
        } else if (index === 9) {
            return !!this.game.bonusMap3Unlocked;
        }
        return false;
    }

    getUnlockedCircles() {
        return this.circleOptions.filter((_, idx) => this.isNodeUnlocked(idx));
    }

    handleMouseWheel(event) {
        if (this.menuActive && this.game.canSelectForestMap) {
            const delta = Math.sign(event.deltaY);
            const unlockedCircles = this.getUnlockedCircles();

            if (this.game.canSelectForestMap && unlockedCircles.length > 0) {
                const indexChange = delta > 0 ? -1 : 1;

                if (!this.scrollCooldown) {
                    let newIndex = this.selectedCircleIndex + indexChange;

                    const unlockedIndices = unlockedCircles.map(c => this.circleOptions.indexOf(c));
                    const currentUnlockedPos = unlockedIndices.indexOf(this.selectedCircleIndex);
                    let newUnlockedPos = currentUnlockedPos + indexChange;
                    newUnlockedPos = Math.max(0, Math.min(unlockedIndices.length - 1, newUnlockedPos));
                    newIndex = unlockedIndices[newUnlockedPos];

                    if (newIndex !== this.selectedCircleIndex) {
                        this.selectedCircleIndex = newIndex;
                        this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                    }

                    this.scrollCooldown = true;
                    setTimeout(() => { this.scrollCooldown = false; }, 20);
                }
            }
        }
    }

    handleMouseMove(event) {
        if (this.menuActive && this.game.canSelectForestMap) {
            const rect = this.game.canvas.getBoundingClientRect();
            const scaleX = this.game.canvas.width / rect.width;
            const scaleY = this.game.canvas.height / rect.height;

            const mouseX = (event.clientX - rect.left) * scaleX;
            const mouseY = (event.clientY - rect.top) * scaleY;

            const unlockedCircles = this.getUnlockedCircles();

            for (let i = 0; i < unlockedCircles.length; i++) {
                const circle = unlockedCircles[i];
                const distanceSquared = (mouseX - circle.x) ** 2 + (mouseY - circle.y) ** 2;
                const radiusSquared = circle.radius ** 2;

                if (distanceSquared <= radiusSquared) {
                    const newSelectedCircleIndex = this.circleOptions.indexOf(circle);
                    if (newSelectedCircleIndex !== this.selectedCircleIndex) {
                        this.selectedCircleIndex = newSelectedCircleIndex;
                        this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                    }
                    break;
                }
            }
        }
    }

    resetSelectedCircleIndex() {
        this.selectedCircleIndex = 0;
    }

    handleKeyDown(event) {
        if (this.menuActive) {
            const unlockedCircles = this.getUnlockedCircles();
            if (this.game.canSelectForestMap) {
                const unlockedIndices = unlockedCircles.map(c => this.circleOptions.indexOf(c));
                const pos = unlockedIndices.indexOf(this.selectedCircleIndex);

                if (event.key === 'ArrowLeft') {
                    if (pos > 0) {
                        this.selectedCircleIndex = unlockedIndices[pos - 1];
                        this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                    }
                } else if (event.key === 'ArrowRight') {
                    if (pos !== -1 && pos < unlockedIndices.length - 1) {
                        this.selectedCircleIndex = unlockedIndices[pos + 1];
                        this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                    }
                } else if (event.key === 'Enter') {
                    if (unlockedCircles.length > 0) {
                        this.handleMenuSelection();
                    }
                }
            }
        }
    }

    setMap(map) {
        this.game.background = map;
        this.game.currentMap = map.constructor.name;

        const cabinY = this.game.height - 375;

        if (map instanceof Map1) {
            this.game.cabin = new Cabin(this.game, 'map1cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 105.52380952380952380952380952381, 165, 'penguinBatSprite', 20);
        } else if (map instanceof Map2) {
            this.game.cabin = new Cabin(this.game, 'map2cabin', 630, 375, cabinY - 5);
            this.game.penguini = new Penguini(this.game, 105.52380952380952380952380952381, 165, 'penguinBatSprite', 20);
        } else if (map instanceof Map3) {
            this.game.cabin = new Cabin(this.game, 'map3submarine', 752, 474, cabinY - 100);
            this.game.penguini = new Penguini(this.game, 105.52380952380952380952380952381, 165, 'penguinBatSprite', 20);
        } else if (map instanceof Map4) {
            this.game.cabin = new Cabin(this.game, 'map4cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 139.325, 140, 'penguinPistolSprite', 39);
        } else if (map instanceof Map5) {
            this.game.cabin = new Cabin(this.game, 'map5cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 139.325, 140, 'penguinPistolSprite', 39);
        } else if (map instanceof Map6) {
            this.game.cabin = new Cabin(this.game, 'map6cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 139.325, 140, 'penguinPistolSprite', 39);
        } else if (map instanceof Map7) {
            this.game.cabin = new Cabin(this.game, 'map7cave', 913, 618, 0);
            this.game.penguini = new Penguini(this.game, 185, 80, 'penguinDead', 0);
            this.game.penguini.y = this.game.height - this.game.penguini.height - this.game.groundMargin;
        } else if (map instanceof BonusMap1) {
            this.game.cabin = new Cabin(this.game, 'bonusmap1cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 105.52380952380952380952380952381, 165, 'penguinBatSprite', 20);
        } else if (map instanceof BonusMap2) {
            this.game.cabin = new Cabin(this.game, 'bonusmap2cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 139.325, 140, 'penguinPistolSprite', 39);
        } else if (map instanceof BonusMap3) {
            this.game.cabin = new Cabin(this.game, 'bonusmap3cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 139.325, 140, 'penguinPistolSprite', 39);
        }
    }

    update(deltaTime) {
        this.game.audioHandler.menu.stopSound('criminalitySoundtrack');

        if (this.menuActive && this.justOpened && this.game.currentMap) {
            const name = this.game.currentMap;
            const mapIndexByName = {
                Map1: 0, Map2: 1, Map3: 2, Map4: 3, Map5: 4, Map6: 5, Map7: 6,
                BonusMap1: 7, BonusMap2: 8, BonusMap3: 9
            };
            const idx = mapIndexByName[name];
            if (idx !== undefined && this.isNodeUnlocked(idx)) {
                this.selectedCircleIndex = idx;
            }
            this.justOpened = false;
        }

        if (this.showSavingSprite) {
            this.savingAnimation.update(deltaTime);
            this.savingBookAnimation.update(deltaTime);
        }

        if (this.lockedNoticeTimer > 0) {
            this.lockedNoticeTimer -= deltaTime;
            if (this.lockedNoticeTimer <= 0) {
                this.lockedNoticeTimer = 0;
                this.lockedNoticeText = '';
            }
        }
    }

    draw(context) {
        const isNight = this.isNightMode();

        if (this.menuActive) {
            const bg = isNight ? this.backgroundImageNight : this.backgroundImage;
            context.drawImage(bg, 0, 0, this.game.width, this.game.height);

            // map title
            context.save();
            context.font = '60px Love Ya Like A Sister';
            context.fillStyle = 'black';
            context.shadowColor = isNight ? 'orange' : 'white';
            context.shadowBlur = 10;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;

            const mapTextY = isNight ? 102 : 107;
            context.fillText('MAP', 270, mapTextY);
            context.restore();

            // node drawing
            this.circleOptions.forEach((circle, index) => {
                if (!this.isNodeUnlocked(index)) return;

                const sealedBonus3 = (index === 9 && this.isBonusMap3Sealed());

                context.save();
                context.beginPath();
                context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);

                context.fillStyle = sealedBonus3 ? 'rgba(20, 20, 20, 0.85)' : 'rgba(0, 0, 0, 0.6)';
                context.shadowColor = sealedBonus3 ? 'rgba(255, 60, 60, 0.9)' : (isNight ? 'orange' : 'white');
                context.shadowBlur = sealedBonus3 ? 20 : (isNight ? 14 : 30);

                context.fill();
                context.closePath();

                // red ring + X overlay on sealed node
                if (sealedBonus3) {
                    context.save();
                    context.strokeStyle = 'rgba(255, 60, 60, 0.95)';
                    context.lineWidth = 3;
                    context.beginPath();
                    context.arc(circle.x, circle.y, circle.radius + 2, 0, Math.PI * 2);
                    context.stroke();
                    context.closePath();
                    context.restore();

                    context.save();
                    context.strokeStyle = 'rgba(255, 60, 60, 0.95)';
                    context.lineWidth = 3;
                    const r = circle.radius - 4;
                    context.beginPath();
                    context.moveTo(circle.x - r, circle.y - r);
                    context.lineTo(circle.x + r, circle.y + r);
                    context.moveTo(circle.x + r, circle.y - r);
                    context.lineTo(circle.x - r, circle.y + r);
                    context.stroke();
                    context.closePath();
                    context.restore();
                }

                // main map connections
                if (index >= 0 && index <= 5) {
                    const nextIndex = index + 1;
                    const nextCircle = this.circleOptions[nextIndex];
                    if (nextCircle && this.isNodeUnlocked(nextIndex)) {
                        this.drawStraightConnection(context, circle, nextCircle);
                    }
                }

                context.restore();

                // selection ring + icon
                if (index === this.selectedCircleIndex && this.selectedCircleIndex !== -1) {
                    context.save();
                    context.strokeStyle = sealedBonus3 ? '#ff3b3b' : 'yellow';
                    context.lineWidth = 3;
                    context.beginPath();
                    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                    context.stroke();
                    context.closePath();
                    context.restore();

                    const skinIcon = this.getCurrentMapIcon();
                    const cosmeticIcons = this.getCurrentCosmeticIconsInLayerOrder();

                    const FRAME_W = FIREDOG_FRAME.width;
                    const FRAME_H = FIREDOG_FRAME.height;

                    const TARGET_H = 53;
                    const scale = TARGET_H / FRAME_H;

                    const px = circle.x;
                    const py = circle.y - 10;

                    const drawFrame0WithHue = (img, withGlow, hueDeg = 0) => {
                        if (!img) return;

                        const dw = FRAME_W * scale;
                        const dh = FRAME_H * scale;

                        if (withGlow) {
                            context.shadowColor = sealedBonus3
                                ? 'rgba(255, 60, 60, 0.9)'
                                : (isNight ? 'orange' : 'white');
                            context.shadowBlur = 10;
                        } else {
                            context.shadowColor = 'transparent';
                            context.shadowBlur = 0;
                        }

                        drawWithOptionalHue(context, { hueDeg }, () => {
                            context.drawImage(
                                img,
                                0, 0, FRAME_W, FRAME_H,
                                px - dw / 2,
                                py - dh / 2,
                                dw, dh
                            );
                        });
                    };

                    context.save();
                    context.globalAlpha = sealedBonus3 ? 0.45 : 1.0;

                    drawFrame0WithHue(skinIcon, true, 0);

                    for (const c of cosmeticIcons) {
                        drawFrame0WithHue(c.img, false, c.hueDeg);
                    }

                    context.restore();
                }
            });

            // glow bonus connections
            const lineShadowColor = isNight ? 'orange' : 'white';
            const lineShadowBlur = isNight ? 14 : 30;

            if (this.circleOptions[1] && this.circleOptions[7] && this.game.bonusMap1Unlocked) {
                context.save();
                context.shadowColor = lineShadowColor;
                context.shadowBlur = lineShadowBlur;
                this.drawStraightConnection(context, this.circleOptions[1], this.circleOptions[7]);
                context.restore();
            }

            if (this.circleOptions[3] && this.circleOptions[8] && this.game.bonusMap2Unlocked) {
                context.save();
                context.shadowColor = lineShadowColor;
                context.shadowBlur = lineShadowBlur;
                this.drawElbowConnection(context, this.circleOptions[3], this.circleOptions[8]);
                context.restore();
            }

            if (this.circleOptions[8] && this.circleOptions[9] && this.game.bonusMap3Unlocked) {
                const sealedBonus3 = this.isBonusMap3Sealed();

                context.save();

                if (sealedBonus3) {
                    context.setLineDash([10, 10]);
                    context.shadowColor = 'rgba(255, 60, 60, 0.9)';
                    context.shadowBlur = 18;
                } else {
                    context.shadowColor = lineShadowColor;
                    context.shadowBlur = lineShadowBlur;
                }

                this.drawStraightConnection(context, this.circleOptions[8], this.circleOptions[9]);

                context.setLineDash([]);
                context.restore();
            }

            // bottom ribbon
            const idx = this.selectedCircleIndex;
            const { mapIndexLabel, mapNameLabel, colorCfg } = this.computeMapNameParts(idx);

            const loreText = (this.lockedNoticeTimer > 0 && this.lockedNoticeText)
                ? this.lockedNoticeText
                : 'TAB FOR ENEMY LORE';

            const ribbonHeight = 60;
            const ribbonY = this.game.height - ribbonHeight;

            context.save();
            context.font = '40px Love Ya Like A Sister';

            this.drawRibbonBackgroundsAndLines(
                context,
                ribbonY,
                ribbonHeight,
                loreText,
                isNight,
                !this.showSavingSprite
            );

            const baseX = 40;
            const centerY = ribbonY + ribbonHeight / 2 + 14;
            const lineY = ribbonY;
            const mapNumberY = lineY - 12;

            // map number
            context.textAlign = 'left';
            if (mapIndexLabel) {
                const textWidth = context.measureText(mapIndexLabel).width;

                const numberLeftX = 0;
                const numberExtra = 120;
                const numberWidth = textWidth + numberExtra;
                const numberHeight = 52;
                const numberY = lineY - numberHeight;

                let numberGradient = context.createLinearGradient(
                    numberLeftX,
                    numberY,
                    numberLeftX + numberWidth,
                    numberY
                );
                if (isNight) {
                    numberGradient.addColorStop(0.00, 'rgba(0, 0, 0, 0.95)');
                    numberGradient.addColorStop(0.60, 'rgba(0, 0, 0, 0.85)');
                    numberGradient.addColorStop(1.00, 'rgba(0, 0, 0, 0.00)');
                } else {
                    numberGradient.addColorStop(0.00, 'rgba(0, 0, 0, 0.75)');
                    numberGradient.addColorStop(0.60, 'rgba(0, 0, 0, 0.60)');
                    numberGradient.addColorStop(1.00, 'rgba(0, 0, 0, 0.00)');
                }

                context.save();
                context.fillStyle = numberGradient;
                context.fillRect(numberLeftX, numberY, numberWidth, numberHeight);
                context.restore();

                context.fillStyle = 'white';
                context.shadowColor = 'black';
                context.shadowBlur = 3;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
                context.fillText(mapIndexLabel, baseX, mapNumberY);
            }

            // map name
            if (mapNameLabel) {
                const sealedSelected = (idx === 9 && this.isBonusMap3Sealed());

                context.save();

                if (sealedSelected) {
                    context.filter = 'blur(8px)';
                } else {
                    context.filter = 'none';
                    context.globalAlpha = 1.0;
                }

                context.fillStyle = colorCfg.fill;
                context.shadowColor = colorCfg.stroke;
                context.shadowBlur = colorCfg.strokeBlur;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
                context.fillText(mapNameLabel, baseX, centerY);
                context.restore();
            }

            // lore text
            if (!this.showSavingSprite) {
                const loreTextX = this.game.width - 40;
                context.textAlign = 'right';

                const showingLockNotice = (this.lockedNoticeTimer > 0 && this.lockedNoticeText);
                context.fillStyle = showingLockNotice ? '#ff3b3b' : 'white';
                context.shadowColor = 'black';
                context.shadowBlur = showingLockNotice ? 6 : 3;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;

                context.fillText(loreText, loreTextX, centerY);
            }

            context.restore();
        }

        // saving sprite
        if (this.showSavingSprite) {
            this.savingAnimation.draw(context);
            this.savingBookAnimation.draw(context);
        }

        if (this.showStarsSticker && this.menuInGame === false) {
            this.drawStarsSticker(context);
        }
    }
}