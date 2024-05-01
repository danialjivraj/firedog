import { BaseMenu } from './baseMenu.js';
import { Map1Cutscene, Map2Cutscene, Map3Cutscene, Map4Cutscene, Map5Cutscene, Map6Cutscene } from '../cutscene/cutscenes.js';
import { Map1, Map2, Map3, Map4, Map5, Map6 } from '../background/background.js';
import { SavingAnimation, SavingBookAnimation } from '../animations/savingAnimation.js';

export class ForestMapMenu extends BaseMenu {
    constructor(game, preselectedLocationIndex = 0) {
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
        this.selectedCircleIndex = preselectedLocationIndex;
        this.showSavingSprite = false;
        this.savingAnimation = new SavingAnimation(this.game);
        this.savingBookAnimation = new SavingBookAnimation(this.game);

        this.canSelect = true;
        this.backgroundImage = document.getElementById('forestmap');
        this.backgroundImageNight = document.getElementById('forestmapNight');

        this.firedogImage = document.getElementById('forestmapFiredog');
        this.firedogHatImage = document.getElementById('forestmapHatFiredog');
        this.forestmapCholoFiredog = document.getElementById('forestmapCholoFiredog');
        this.forestmapZabkaFiredog = document.getElementById('forestmapZabkaFiredog');
        this.forestmapFiredogShiny = document.getElementById('forestmapFiredogShiny');
    }
    resetSelectedCircleIndex() {
        this.selectedCircleIndex = 0;
    }
    handleKeyDown(event) {
        if (this.menuActive) {
            const unlockedCircles = this.circleOptions
                .filter((circle, index) => this.game[`map${index + 1}Unlocked`]);
            if (this.canSelect) {
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

    handleMenuSelection() {
        const selectedCircle = this.circleOptions[this.selectedCircleIndex];
        super.handleMenuSelection();
        const circleIndex = this.circleOptions.indexOf(selectedCircle);
        this.game.player.isUnderwater = false;
        this.game.player.isDarkWhiteBorder = false;

        const mapOptions = [
            { index: 1, underwater: false, darkWhiteBorder: false, maxDistance: 300, winningCoins: 370, Cutscene: Map1Cutscene, Map: Map1 },
            { index: 2, underwater: false, darkWhiteBorder: true, maxDistance: 340, winningCoins: 430, Cutscene: Map2Cutscene, Map: Map2 },
            { index: 3, underwater: true, darkWhiteBorder: true, maxDistance: 370, winningCoins: 320, Cutscene: Map3Cutscene, Map: Map3 },
            { index: 4, underwater: false, darkWhiteBorder: false, maxDistance: 340, winningCoins: 500, Cutscene: Map4Cutscene, Map: Map4 },
            { index: 5, underwater: false, darkWhiteBorder: false, maxDistance: 350, winningCoins: 550, Cutscene: Map5Cutscene, Map: Map5 },
            { index: 6, underwater: false, darkWhiteBorder: false, maxDistance: 9999999, winningCoins: 150, Cutscene: Map6Cutscene, Map: Map6 }
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
        this.game.setMap(map);

        this.game.player.underwaterOrNot();
        this.menuActive = false;
        this.game.currentMenu = false;
    }

    update(deltaTime) {
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
                            if (this.game.menuInstances.skins.currentSkin === this.game.menuInstances.skins.defaultSkin) {
                                context.drawImage(this.firedogImage, circle.x - this.firedogImage.width / 2, circle.y - this.firedogImage.height / 2 - 10);
                            } else if (this.game.menuInstances.skins.currentSkin === this.game.menuInstances.skins.hatSkin) {
                                context.drawImage(this.firedogHatImage, circle.x - this.firedogHatImage.width / 2, circle.y - this.firedogHatImage.height / 2 - 10);
                            } else if (this.game.menuInstances.skins.currentSkin === this.game.menuInstances.skins.choloSkin) {
                                context.drawImage(this.forestmapCholoFiredog, circle.x - this.forestmapCholoFiredog.width / 2, circle.y - this.forestmapCholoFiredog.height / 2 - 10);
                            } else if (this.game.menuInstances.skins.currentSkin === this.game.menuInstances.skins.zabkaSkin) {
                                context.drawImage(this.forestmapZabkaFiredog, circle.x - this.forestmapZabkaFiredog.width / 2, circle.y - this.forestmapZabkaFiredog.height / 2 - 10);
                            } else if (this.game.menuInstances.skins.currentSkin === this.game.menuInstances.skins.shinySkin) {
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
            context.restore();
        }
        if (this.showSavingSprite) {
            this.savingAnimation.draw(context);
            this.savingBookAnimation.draw(context);
        }
    }
}