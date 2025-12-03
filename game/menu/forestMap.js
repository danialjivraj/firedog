import { isLocalNight } from '../config/timeOfDay.js';
import { getMapIconElement } from '../config/skins.js';
import { BaseMenu } from './baseMenu.js';
import {
    Map1Cutscene, Map2Cutscene, Map3Cutscene, Map4Cutscene, Map5Cutscene, Map6Cutscene,
    BonusMap1Cutscene, BonusMap2Cutscene, BonusMap3Cutscene
} from '../cutscene/storyCutscenes.js';
import { Map1, Map2, Map3, Map4, Map5, Map6, BonusMap1, BonusMap2, BonusMap3 } from '../background/background.js';
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
            { x: 1210, y: 620, radius: 20 }, // Map 6 (5)

            { x: 883, y: 97, radius: 18 },   // Bonus Map 1 (6)
            { x: 1670, y: 484, radius: 18 }, // Bonus Map 2 (7)
            { x: 1570, y: 210, radius: 18 }, // Bonus Map 3 (8)
        ];
        super(game);

        this.mapNames = {
            map1: 'Lunar Moonlit Glade',
            map2: 'Nightfall City Phantom',
            map3: 'Coral Abyss',
            map4: 'Verdant Vine',
            map5: 'Springly Lemony',
            map6: 'Infernal Crater Peak',
            bonus1: 'Icebound Cave',
            bonus2: 'Crimson Fissure',
            bonus3: 'Cosmic Rift',
        };

        this.mapColors = {
            map1: { fill: 'deepskyblue', stroke: 'limegreen', strokeBlur: 8 },
            map2: { fill: 'purple', stroke: 'black', strokeBlur: 5 },
            map3: { fill: 'dodgerblue', stroke: 'darkblue', strokeBlur: 5 },
            map4: { fill: 'seagreen', stroke: 'black', strokeBlur: 15 },
            map5: { fill: 'yellow', stroke: 'orange', strokeBlur: 5 },
            map6: { fill: 'red', stroke: 'black', strokeBlur: 10 },
            bonus1: { fill: '#8fd7ff', stroke: '#1c4a7f', strokeBlur: 10 },
            bonus2: { fill: '#ff3b1f', stroke: '#5a1408', strokeBlur: 10 },
            bonus3: { fill: '#ff4bff', stroke: '#270033', strokeBlur: 10 },
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

        this.mapIcons = {
            default: getMapIconElement('default'),
            hat: getMapIconElement('hat'),
            cholo: getMapIconElement('cholo'),
            zabka: getMapIconElement('zabka'),
            shiny: getMapIconElement('shiny'),
        };

        this.fixedLeftRibbonWidth = null;

        document.addEventListener('wheel', this.handleMouseWheel.bind(this));
    }

    handleMenuSelection() {
        const selectedCircle = this.circleOptions[this.selectedCircleIndex];
        super.handleMenuSelection();
        const circleIndex = this.circleOptions.indexOf(selectedCircle);

        this.game.player.isUnderwater = false;
        this.game.player.isDarkWhiteBorder = false;
        this.game.player.isIce = false;

        const mapOptions = [
            { index: 1, underwater: false, darkWhiteBorder: false, maxDistance: 200, winningCoins: 230, Cutscene: Map1Cutscene, Map: Map1 },
            { index: 2, underwater: false, darkWhiteBorder: true, maxDistance: 240, winningCoins: 270, Cutscene: Map2Cutscene, Map: Map2 },
            { index: 3, underwater: true, darkWhiteBorder: true, maxDistance: 270, winningCoins: 200, Cutscene: Map3Cutscene, Map: Map3 },
            { index: 4, underwater: false, darkWhiteBorder: false, maxDistance: 240, winningCoins: 280, Cutscene: Map4Cutscene, Map: Map4 },
            { index: 5, underwater: false, darkWhiteBorder: false, maxDistance: 250, winningCoins: 300, Cutscene: Map5Cutscene, Map: Map5 },
            { index: 6, underwater: false, darkWhiteBorder: false, maxDistance: 9999999, winningCoins: 0, Cutscene: Map6Cutscene, Map: Map6 },

            { underwater: false, darkWhiteBorder: false, isIce: true, maxDistance: 9999999, winningCoins: 0, Cutscene: BonusMap1Cutscene, Map: BonusMap1 },
            { underwater: false, darkWhiteBorder: false, maxDistance: 2, winningCoins: 0, Cutscene: BonusMap2Cutscene, Map: BonusMap2 },
            { underwater: false, darkWhiteBorder: false, maxDistance: 2, winningCoins: 0, Cutscene: BonusMap3Cutscene, Map: BonusMap3 },
        ];

        const entry = mapOptions[circleIndex];
        if (!entry) {
            this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
            return;
        }

        const { underwater, darkWhiteBorder, isIce = false, maxDistance, winningCoins, Cutscene, Map } = entry;

        this.game.player.isUnderwater = underwater;
        this.game.player.isDarkWhiteBorder = darkWhiteBorder;
        this.game.player.isIce = isIce;

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
        const skinId = this.game.menu.skins.getCurrentSkinId
            ? this.game.menu.skins.getCurrentSkinId()
            : (this.game.selectedSkinId || 'defaultSkin');

        const baseKey =
            skinId === 'defaultSkin' ? 'default' :
                skinId === 'shinySkin' ? 'shiny' :
                    skinId === 'hatSkin' ? 'hat' :
                        skinId === 'choloSkin' ? 'cholo' :
                            skinId === 'zabkaSkin' ? 'zabka' : 'default';

        return this.mapIcons[baseKey] || this.mapIcons.default;
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
        if (index >= 0 && index <= 5) return `map${index + 1}`;
        if (index === 6) return 'bonus1';
        if (index === 7) return 'bonus2';
        if (index === 8) return 'bonus3';
        return null;
    }

    computeMapNameParts(idx) {
        const nameKey = this.getMapKeyByIndex(idx);
        const rawName = nameKey ? (this.mapNames[nameKey] || '') : '';

        let mapIndexLabel = '';
        let mapNameLabel = rawName ? rawName.toUpperCase() : '';

        if (idx >= 0 && idx <= 5) {
            mapIndexLabel = `MAP ${idx + 1}`;
        } else if (idx >= 6 && idx <= 8) {
            const bonusNumber = idx - 5;
            mapIndexLabel = `BONUS MAP ${bonusNumber}`;
        }

        const colorCfg = (nameKey && this.mapColors[nameKey]) || this.defaultMapColor;

        return { nameKey, mapIndexLabel, mapNameLabel, colorCfg };
    }

    drawRibbonBackgroundsAndLines(context, ribbonY, ribbonHeight, mapFullText, loreText, isNight, showRightRibbon = true) {
        const leftExtra = 120;
        const rightExtra = 120;

        context.font = '40px Love Ya Like A Sister';

        // left ribbon width
        if (!this.fixedLeftRibbonWidth) {
            let longestName = '';
            for (const key in this.mapNames) {
                const value = this.mapNames[key] || '';
                if (value.length > longestName.length) {
                    longestName = value;
                }
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
        if (index >= 0 && index <= 5) {
            return !!this.game[`map${index + 1}Unlocked`];
        } else if (index === 6) {
            return !!this.game.bonusMap1Unlocked;
        } else if (index === 7) {
            return !!this.game.bonusMap2Unlocked;
        } else if (index === 8) {
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
            this.game.cabin = new Cabin(this.game, 'map2cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 105.52380952380952380952380952381, 165, 'penguinBatSprite', 20);
        } else if (map instanceof Map3) {
            this.game.cabin = new Cabin(this.game, 'map3submarine', 903, 329, this.game.height - 411);
            this.game.penguini = new Penguini(this.game, 105.52380952380952380952380952381, 165, 'penguinBatSprite', 20);
        } else if (map instanceof Map4) {
            this.game.cabin = new Cabin(this.game, 'map4cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 139.325, 140, 'penguinPistolSprite', 39);
        } else if (map instanceof Map5) {
            this.game.cabin = new Cabin(this.game, 'map5cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 139.325, 140, 'penguinPistolSprite', 39);
        } else if (map instanceof Map6) {
            this.game.cabin = new Cabin(this.game, 'map6cave', 913, 618, 0);
            this.game.penguini = new Penguini(this.game, 185, 80, 'penguinDead', 0);
            this.game.penguini.y = this.game.height - this.game.penguini.height - this.game.groundMargin;
        } else if (map instanceof BonusMap1) {
            this.game.cabin = new Cabin(this.game, 'bonusmap1cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 105.52380952380952380952380952381, 165, 'penguinBatSprite', 20);
        } else if (map instanceof BonusMap2) {
            this.game.cabin = new Cabin(this.game, 'bonusmap2cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 139.325, 140, 'penguinPistolSprite', 39);
        } else if (map instanceof BonusMap3) {
            this.game.cabin = new Cabin(this.game, 'map5cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 139.325, 140, 'penguinPistolSprite', 39);
        }
    }

    update(deltaTime) {
        this.game.audioHandler.menu.stopSound('soundtrack');

        if (this.menuActive && this.justOpened && this.game.currentMap) {
            const name = this.game.currentMap;
            const mapIndexByName = {
                Map1: 0, Map2: 1, Map3: 2, Map4: 3, Map5: 4, Map6: 5,
                BonusMap1: 6, BonusMap2: 7, BonusMap3: 8
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

                context.save();
                context.beginPath();
                context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                context.fillStyle = 'rgba(0, 0, 0, 0.6)';
                context.shadowColor = isNight ? 'orange' : 'white';
                context.shadowBlur = isNight ? 14 : 30;
                context.fill();
                context.closePath();

                if (index >= 0 && index <= 4) {
                    const nextIndex = index + 1;
                    const nextCircle = this.circleOptions[nextIndex];
                    if (nextCircle && this.isNodeUnlocked(nextIndex)) {
                        this.drawStraightConnection(context, circle, nextCircle);
                    }
                }

                context.restore();

                if (index === this.selectedCircleIndex && this.selectedCircleIndex !== -1) {
                    context.save();
                    context.strokeStyle = 'yellow';
                    context.lineWidth = 3;
                    context.beginPath();
                    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                    context.stroke();
                    context.closePath();
                    context.restore();

                    const icon = this.getCurrentMapIcon();
                    context.save();
                    context.shadowColor = isNight ? 'orange' : 'white';
                    context.shadowBlur = 10;
                    context.drawImage(
                        icon,
                        circle.x - icon.width / 2,
                        circle.y - icon.height / 2 - 10
                    );
                    context.restore();
                }
            });

            // glow bonus connections
            const lineShadowColor = isNight ? 'orange' : 'white';
            const lineShadowBlur = isNight ? 14 : 30;

            if (this.circleOptions[1] && this.circleOptions[6] && this.game.bonusMap1Unlocked) {
                context.save();
                context.shadowColor = lineShadowColor;
                context.shadowBlur = lineShadowBlur;
                this.drawStraightConnection(context, this.circleOptions[1], this.circleOptions[6]);
                context.restore();
            }

            if (this.circleOptions[3] && this.circleOptions[7] && this.game.bonusMap2Unlocked) {
                context.save();
                context.shadowColor = lineShadowColor;
                context.shadowBlur = lineShadowBlur;
                this.drawElbowConnection(context, this.circleOptions[3], this.circleOptions[7]);
                context.restore();
            }

            if (this.circleOptions[7] && this.circleOptions[8] && this.game.bonusMap3Unlocked) {
                context.save();
                context.shadowColor = lineShadowColor;
                context.shadowBlur = lineShadowBlur;
                this.drawStraightConnection(context, this.circleOptions[7], this.circleOptions[8]);
                context.restore();
            }

            // bottom ribbon
            const idx = this.selectedCircleIndex;
            const { mapIndexLabel, mapNameLabel, colorCfg } = this.computeMapNameParts(idx);

            const loreText = 'TAB FOR ENEMY LORE';
            const mapFullText =
                (mapIndexLabel ? mapIndexLabel + ' ' : '') +
                (mapNameLabel || '');

            const ribbonHeight = 60;
            const ribbonY = this.game.height - ribbonHeight;

            context.save();
            context.font = '40px Love Ya Like A Sister';

            this.drawRibbonBackgroundsAndLines(
                context,
                ribbonY,
                ribbonHeight,
                mapFullText,
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
                context.fillStyle = colorCfg.fill;
                context.shadowColor = colorCfg.stroke;
                context.shadowBlur = colorCfg.strokeBlur;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
                context.fillText(mapNameLabel, baseX, centerY);
            }

            // lore text
            if (!this.showSavingSprite) {
                const loreTextX = this.game.width - 40;
                context.textAlign = 'right';
                context.fillStyle = 'white';
                context.shadowColor = 'black';
                context.shadowBlur = 3;
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

        // game completed overlay
        if (this.game.gameCompleted) {
            context.globalAlpha = 0.75;

            context.shadowColor = 'rgba(0, 0, 0, 1)';
            context.shadowBlur = 4;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;

            context.drawImage(this.greenCompletedImage, 10, 10);

            context.shadowColor = 'transparent';
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;

            context.globalAlpha = 1;
        }
    }
}
