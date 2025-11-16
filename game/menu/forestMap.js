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
            { x: 700, y: 200, radius: 20 }, // Map 1 (0)
            { x: 950, y: 200, radius: 20 }, // Map 2 (1)
            { x: 1100, y: 200, radius: 20 }, // Map 3 (2)
            { x: 1300, y: 290, radius: 20 }, // Map 4 (3)
            { x: 1450, y: 400, radius: 20 }, // Map 5 (4)
            { x: 1210, y: 620, radius: 20 }, // Map 6 (5)

            { x: 883, y: 97, radius: 18 }, // Bonus Map 1 (6)
            { x: 1570, y: 210, radius: 18 }, // Bonus Map 2 (7)
            { x: 1640, y: 420, radius: 18 }, // Bonus Map 3 (8)
        ];
        super(game);

        this.mapNames = {
            map1: "Lunar Moonlit Glade",
            map2: "Nightfall City Phantom",
            map3: "Coral Abyss",
            map4: "Verdant Vine",
            map5: "Springly Lemony",
            map6: "Infernal Crater Peak",
            bonus1: "Bonus Map 1 - Icebound Cave",
            bonus2: "Bonus Map 2 - Cosmic Rift",
            bonus3: "Bonus Map 3 - Crimson Fissure",
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
            { index: 6, underwater: false, darkWhiteBorder: false, maxDistance: 9999999, winningCoins: this.game.maxCoinsToFightElyvorg, Cutscene: Map6Cutscene, Map: Map6 },

            { underwater: false, darkWhiteBorder: false, isIce: true, maxDistance: 100, winningCoins: 0, Cutscene: BonusMap1Cutscene, Map: BonusMap1 },
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
                if (event.key === 'ArrowLeft') {
                    // move to previous unlocked node
                    const unlockedIndices = unlockedCircles.map(c => this.circleOptions.indexOf(c));
                    const pos = unlockedIndices.indexOf(this.selectedCircleIndex);
                    if (pos > 0) {
                        this.selectedCircleIndex = unlockedIndices[pos - 1];
                        this.game.audioHandler.menu.playSound('optionHoveredSound', false, true);
                    }
                } else if (event.key === 'ArrowRight') {
                    // move to next unlocked node
                    const unlockedIndices = unlockedCircles.map(c => this.circleOptions.indexOf(c));
                    const pos = unlockedIndices.indexOf(this.selectedCircleIndex);
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
            this.game.cabin = new Cabin(this.game, 'map2cabin', 630, 375, cabinY);
            this.game.penguini = new Penguini(this.game, 105.52380952380952380952380952381, 165, 'penguinBatSprite', 20);
        } else if (map instanceof BonusMap2) {
            this.game.cabin = new Cabin(this.game, 'map4cabin', 630, 375, cabinY);
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
        if (this.menuActive) {
            if (this.game.map2Unlocked && this.game.map3Unlocked === false) {
                context.drawImage(this.backgroundImageNight, 0, 0, this.game.width, this.game.height);
            } else {
                context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
            }

            // draw each unlocked circle and sequential bridges Map1->Map6 (bonus handled separately)
            this.circleOptions.forEach((circle, index) => {
                const isNodeUnlocked = this.isNodeUnlocked(index);
                if (isNodeUnlocked) {
                    context.save();
                    context.beginPath();
                    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    if (this.game.map2Unlocked && this.game.map3Unlocked === false) {
                        context.shadowColor = 'orange';
                        context.shadowBlur = 14;
                    } else {
                        context.shadowColor = 'white';
                        context.shadowBlur = 30;
                    }
                    context.fill();
                    context.closePath();

                    // draw linear bridge to next linear map (indices 0..4 connect to 1..5)
                    if (index >= 0 && index <= 4) {
                        const nextIndex = index + 1;
                        const nextCircle = this.circleOptions[nextIndex];
                        const isNextUnlocked = this.isNodeUnlocked(nextIndex);
                        if (isNextUnlocked) {
                            const directionX = nextCircle.x - circle.x;
                            const directionY = nextCircle.y - circle.y;
                            const distance = Math.sqrt(directionX ** 2 + directionY ** 2);

                            const startX = circle.x + (directionX / distance) * circle.radius;
                            const startY = circle.y + (directionY / distance) * circle.radius;

                            const endX = nextCircle.x - (directionX / distance) * nextCircle.radius;
                            const endY = nextCircle.y - (directionY / distance) * nextCircle.radius;

                            context.beginPath();
                            context.moveTo(startX, startY);
                            context.lineTo(endX, endY);
                            context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                            context.lineWidth = 4;
                            context.stroke();
                            context.closePath();
                        }
                    }
                    context.restore();

                    // highlight + firedog icon
                    if (this.selectedCircleIndex !== -1) {
                        const selectedCircle = this.circleOptions[this.selectedCircleIndex];
                        if (index === this.selectedCircleIndex) {
                            context.save();
                            context.strokeStyle = 'yellow';
                            context.lineWidth = 3;
                            context.beginPath();
                            context.arc(selectedCircle.x, selectedCircle.y, selectedCircle.radius, 0, Math.PI * 2);
                            context.stroke();
                            context.closePath();
                            context.restore();

                            context.save();
                            if (this.game.map2Unlocked && this.game.map3Unlocked === false) {
                                context.shadowColor = 'orange';
                            } else {
                                context.shadowColor = 'white';
                            }
                            context.shadowBlur = 10;

                            const skinId = this.game.menu.skins.getCurrentSkinId
                                ? this.game.menu.skins.getCurrentSkinId()
                                : (this.game.selectedSkinId || 'defaultSkin');

                            const baseKey =
                                skinId === 'defaultSkin' ? 'default' :
                                    skinId === 'shinySkin' ? 'shiny' :
                                        skinId === 'hatSkin' ? 'hat' :
                                            skinId === 'choloSkin' ? 'cholo' :
                                                skinId === 'zabkaSkin' ? 'zabka' : 'default';

                            const icon = this.mapIcons[baseKey] || this.mapIcons.default;

                            context.drawImage(icon, circle.x - icon.width / 2, circle.y - icon.height / 2 - 10);
                            context.restore();
                        }
                    }
                }
            });

            if (this.circleOptions[1] && this.circleOptions[6] && this.game.bonusMap1Unlocked) {
                const map2 = this.circleOptions[1];
                const bonus1 = this.circleOptions[6];
                const dx = bonus1.x - map2.x;
                const dy = bonus1.y - map2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const startX = map2.x + (dx / dist) * map2.radius;
                const startY = map2.y + (dy / dist) * map2.radius;
                const endX = bonus1.x - (dx / dist) * bonus1.radius;
                const endY = bonus1.y - (dy / dist) * bonus1.radius;

                context.save();
                context.beginPath();
                context.moveTo(startX, startY);
                context.lineTo(endX, endY);
                context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                context.lineWidth = 4;
                context.stroke();
                context.closePath();
                context.restore();
            }

            if (this.circleOptions[3] && this.circleOptions[7] && this.game.bonusMap2Unlocked) {
                const map4 = this.circleOptions[3];
                const bonus2 = this.circleOptions[7];
                const dx = bonus2.x - map4.x;
                const dy = bonus2.y - map4.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const startX = map4.x + (dx / dist) * map4.radius;
                const startY = map4.y + (dy / dist) * map4.radius;
                const endX = bonus2.x - (dx / dist) * bonus2.radius;
                const endY = bonus2.y - (dy / dist) * bonus2.radius;

                context.save();
                context.beginPath();
                context.moveTo(startX, startY);
                context.lineTo(endX, endY);
                context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                context.lineWidth = 4;
                context.stroke();
                context.closePath();
                context.restore();
            }

            // bonus 2 -> bonus 3
            if (this.circleOptions[7] && this.circleOptions[8] && this.game.bonusMap3Unlocked) {
                const bonus2 = this.circleOptions[7];
                const bonus3 = this.circleOptions[8];
                const dx = bonus3.x - bonus2.x;
                const dy = bonus3.y - bonus2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const startX = bonus2.x + (dx / dist) * bonus2.radius;
                const startY = bonus2.y + (dy / dist) * bonus2.radius;
                const endX = bonus3.x - (dx / dist) * bonus3.radius;
                const endY = bonus3.y - (dy / dist) * bonus3.radius;

                context.save();
                context.beginPath();
                context.moveTo(startX, startY);
                context.lineTo(endX, endY);
                context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                context.lineWidth = 4;
                context.stroke();
                context.closePath();
                context.restore();
            }

            const idx = this.selectedCircleIndex;
            const isBonus1Selected = idx === 6;
            const isBonus2Selected = idx === 7;
            const isBonus3Selected = idx === 8;
            const nameKey = isBonus1Selected
                ? 'bonus1'
                : (isBonus2Selected ? 'bonus2' : (isBonus3Selected ? 'bonus3' : `map${idx + 1}`));
            const selectedMapName = this.mapNames[nameKey];

            context.save();
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;

            if (this.game.map2Unlocked && this.game.map3Unlocked === false) {
                context.shadowColor = 'orange';
                context.shadowBlur = 4;
            } else {
                context.shadowColor = 'white';
                context.shadowBlur = 0;
            }
            context.fillStyle = 'black';
            context.font = '50px Love Ya Like A Sister';

            if (isBonus1Selected || isBonus2Selected || isBonus3Selected) {
                context.fillText(`${selectedMapName}`, 50, this.game.height - 30);
            } else {
                context.fillText(`Map ${idx + 1} - ${selectedMapName}`, 50, this.game.height - 30);
            }

            context.fillText("Tab for Enemy Lore", 50, this.game.height - 90);
            context.restore();
        }

        if (this.showSavingSprite) {
            this.savingAnimation.draw(context);
            this.savingBookAnimation.draw(context);
        }

        if (this.game.gameCompleted) {
            context.globalAlpha = 0.75;

            context.shadowColor = 'rgba(0, 0, 0, 1)';
            context.shadowBlur = 4;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;

            context.drawImage(this.greenCompletedImage, -18, -10);

            context.shadowColor = 'transparent';
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;

            context.globalAlpha = 1;
        }
    }
}
