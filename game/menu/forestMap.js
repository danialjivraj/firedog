import { BaseMenu } from './baseMenu.js';
import { Map1Cutscene, Map2Cutscene, Map3Cutscene, Map4Cutscene, Map5Cutscene, Map6Cutscene } from '../cutscene/storyCutscenes.js';
import { Map1, Map2, Map3, Map4, Map5, Map6 } from '../background/background.js';
import { SavingAnimation, SavingBookAnimation } from '../animations/savingAnimation.js';
import { Cabin } from '../entities/cabin.js';
import { Penguini } from '../entities/penguini.js';

export class ForestMapMenu extends BaseMenu {
    constructor(game) {
        const circleOptions = [
            { x: 700, y: 200, radius: 20 }, // Map 1
            { x: 950, y: 200, radius: 20 }, // Map 2
            { x: 1100, y: 200, radius: 20 }, // Map 3
            { x: 1300, y: 290, radius: 20 }, // Map 4
            { x: 1450, y: 400, radius: 20 }, // Map 5
            { x: 1210, y: 620, radius: 20 }  // Map 6
        ];
        super(game);

        this.mapNames = {
            1: "Lunar Moonlit Glade",
            2: "Nightfall City Phantom",
            3: "Coral Abyss",
            4: "Verdant Vine",
            5: "Springly Lemony",
            6: "Infernal Crater Peak",
        };
        this.circleOptions = circleOptions;
        this.selectedCircleIndex = 0;
        this.showSavingSprite = false;
        this.savingAnimation = new SavingAnimation(this.game);
        this.savingBookAnimation = new SavingBookAnimation(this.game);

        this.backgroundImage = document.getElementById('forestmap');
        this.backgroundImageNight = document.getElementById('forestmapNight');

        this.firedogImage = document.getElementById('forestmapFiredog');
        this.firedogHatImage = document.getElementById('forestmapHatFiredog');
        this.forestmapCholoFiredog = document.getElementById('forestmapCholoFiredog');
        this.forestmapZabkaFiredog = document.getElementById('forestmapZabkaFiredog');
        this.forestmapFiredogShiny = document.getElementById('forestmapFiredogShiny');

        document.addEventListener('wheel', this.handleMouseWheel.bind(this));
    }
    handleMouseWheel(event) {
        if (this.menuActive && this.game.canSelectForestMap) {
            const delta = Math.sign(event.deltaY);

            const unlockedCircles = this.circleOptions
                .filter((circle, index) => this.game[`map${index + 1}Unlocked`]);

            if (this.game.canSelectForestMap && unlockedCircles.length > 0) {
                const indexChange = delta > 0 ? -1 : 1;

                if (!this.scrollCooldown) {
                    let newIndex = this.selectedCircleIndex + indexChange;

                    newIndex = Math.max(0, Math.min(unlockedCircles.length - 1, newIndex));

                    if (newIndex !== 0 && newIndex !== unlockedCircles.length - 1) {
                        this.selectedCircleIndex = newIndex;
                    } else if (newIndex === 0 && this.selectedCircleIndex !== 0) {
                        this.selectedCircleIndex = 0;
                    } else if (newIndex === unlockedCircles.length - 1 && this.selectedCircleIndex !== unlockedCircles.length - 1) {
                        this.selectedCircleIndex = unlockedCircles.length - 1;
                    }

                    this.scrollCooldown = true;
                    setTimeout(() => {
                        this.scrollCooldown = false;
                    }, 20);
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

            const unlockedCircles = this.circleOptions
                .filter((circle, index) => this.game[`map${index + 1}Unlocked`]);

            // checks if the mouse is hovering over any unlocked circle
            for (let i = 0; i < unlockedCircles.length; i++) {
                const circle = unlockedCircles[i];
                const distanceSquared = (mouseX - circle.x) ** 2 + (mouseY - circle.y) ** 2;
                const radiusSquared = circle.radius ** 2;

                if (distanceSquared <= radiusSquared) {
                    // mouse is inside this circle
                    this.selectedCircleIndex = this.circleOptions.indexOf(circle);
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
            const unlockedCircles = this.circleOptions
                .filter((circle, index) => this.game[`map${index + 1}Unlocked`]);
            if (this.game.canSelectForestMap) {
                if (event.key === 'ArrowLeft') {
                    // checks if the current circle is the first one
                    if (this.selectedCircleIndex > 0) {
                        this.selectedCircleIndex = (this.selectedCircleIndex - 1) % unlockedCircles.length;
                    }
                } else if (event.key === 'ArrowRight') {
                    // checks if the current circle is the last one
                    if (this.selectedCircleIndex < unlockedCircles.length - 1) {
                        this.selectedCircleIndex = (this.selectedCircleIndex + 1) % unlockedCircles.length;
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
        }
    }

    handleMenuSelection() {
        const selectedCircle = this.circleOptions[this.selectedCircleIndex];
        super.handleMenuSelection();
        const circleIndex = this.circleOptions.indexOf(selectedCircle);
        this.game.player.isUnderwater = false;
        this.game.player.isDarkWhiteBorder = false;

        const mapOptions = [
            { index: 1, underwater: false, darkWhiteBorder: false, maxDistance: 200, winningCoins: 230, Cutscene: Map1Cutscene, Map: Map1 },
            { index: 2, underwater: false, darkWhiteBorder: true, maxDistance: 240, winningCoins: 270, Cutscene: Map2Cutscene, Map: Map2 },
            { index: 3, underwater: true, darkWhiteBorder: true, maxDistance: 270, winningCoins: 200, Cutscene: Map3Cutscene, Map: Map3 },
            { index: 4, underwater: false, darkWhiteBorder: false, maxDistance: 240, winningCoins: 280, Cutscene: Map4Cutscene, Map: Map4 },
            { index: 5, underwater: false, darkWhiteBorder: false, maxDistance: 250, winningCoins: 300, Cutscene: Map5Cutscene, Map: Map5 },
            { index: 6, underwater: false, darkWhiteBorder: false, maxDistance: 9999999, winningCoins: this.game.maxCoinsToFightElyvorg, Cutscene: Map6Cutscene, Map: Map6 }
        ];

        const { index, underwater, darkWhiteBorder, maxDistance, winningCoins, Cutscene, Map } = mapOptions[circleIndex];

        this.game.updateMapSelection(index);
        this.game.player.isUnderwater = underwater;
        this.game.player.isDarkWhiteBorder = darkWhiteBorder;
        this.game.maxDistance = maxDistance;
        this.game.winningCoins = winningCoins;

        const mapCutscene = new Cutscene(this.game);
        this.game.startCutscene(mapCutscene);
        mapCutscene.displayDialogue(Cutscene);

        const map = new Map(this.game);
        this.setMap(map);

        this.game.player.underwaterOrNot();
        this.game.menu.main.closeAllMenus();
    }

    update(deltaTime) {
        this.game.audioHandler.menu.stopSound('soundtrack');

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

            // draws circles for each location based on mapUnlocked properties
            this.circleOptions.forEach((circle, index) => {
                // checks if the map is unlocked before drawing the circle
                const isMapUnlocked = this.game[`map${index + 1}Unlocked`];
                if (isMapUnlocked) {
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
                    // draws a bridge line connecting circles
                    if (index < this.circleOptions.length - 1) {
                        const nextCircle = this.circleOptions[index + 1];
                        const isNextMapUnlocked = this.game[`map${index + 2}Unlocked`];
                        if (isNextMapUnlocked) {
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
                    // highlights the selected circle
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

                            // draws firedogImage on top of the highlighted circle
                            context.save();
                            if (this.game.map2Unlocked && this.game.map3Unlocked === false) {
                                context.shadowColor = 'orange';
                            } else {
                                context.shadowColor = 'white';
                            }
                            context.shadowBlur = 10;
                            if (this.game.menu.skins.currentSkin === this.game.menu.skins.defaultSkin) {
                                context.drawImage(this.firedogImage, circle.x - this.firedogImage.width / 2, circle.y - this.firedogImage.height / 2 - 10);
                            } else if (this.game.menu.skins.currentSkin === this.game.menu.skins.hatSkin) {
                                context.drawImage(this.firedogHatImage, circle.x - this.firedogHatImage.width / 2, circle.y - this.firedogHatImage.height / 2 - 10);
                            } else if (this.game.menu.skins.currentSkin === this.game.menu.skins.choloSkin) {
                                context.drawImage(this.forestmapCholoFiredog, circle.x - this.forestmapCholoFiredog.width / 2, circle.y - this.forestmapCholoFiredog.height / 2 - 10);
                            } else if (this.game.menu.skins.currentSkin === this.game.menu.skins.zabkaSkin) {
                                context.drawImage(this.forestmapZabkaFiredog, circle.x - this.forestmapZabkaFiredog.width / 2, circle.y - this.forestmapZabkaFiredog.height / 2 - 10);
                            } else if (this.game.menu.skins.currentSkin === this.game.menu.skins.shinySkin) {
                                context.drawImage(this.forestmapFiredogShiny, circle.x - this.forestmapFiredogShiny.width / 2, circle.y - this.forestmapFiredogShiny.height / 2 - 10);
                            }
                            context.restore();
                        }
                    }
                }
            });

            // draws the selected map number and name
            const selectedMapNumber = this.selectedCircleIndex + 1;
            const selectedMapName = this.mapNames[selectedMapNumber];
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
            context.fillText(`Map ${selectedMapNumber} - ${selectedMapName}`, 50, this.game.height - 30);

            context.fillText("Tab for Enemy Lore", 50, this.game.height - 90);
            context.restore();
        }
        if (this.showSavingSprite) {
            this.savingAnimation.draw(context);
            this.savingBookAnimation.draw(context);
        }
    }
}
