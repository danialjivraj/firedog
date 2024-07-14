import { Cutscene } from './cutscene.js';

export class StoryCutscene extends Cutscene {
    constructor(game) {
        super(game);
        this.characterLimit = 75;
        this.textBoxWidth = 1050;
    }

    enterOrLeftClick(cutscene) {
        this.cutsceneController();

        this.playSound2OnDotPause = false;
        this.isEnterPressed = true;
        if (this.continueDialogue) {
            this.pause = false;
            this.textIndex++;
            this.continueDialogue = false;
        } else if (this.textIndex < this.dialogue[this.dialogueIndex].dialogue.length) {
            const dotIndices = this.getDotIndices(this.dialogue[this.dialogueIndex].dialogue);

            const nextDotIndex = dotIndices.find(index => index > this.textIndex);
            this.textIndex = nextDotIndex !== undefined ? nextDotIndex : this.dialogue[this.dialogueIndex].dialogue.length;
        } else if (this.dialogueIndex < this.dialogue.length - 1) {
            this.dialogueIndex++;
            this.textIndex = 0;
            this.lastSound2Played = false;
            const currentDialogue = this.dialogue[this.dialogueIndex];
            const prefullWords = this.splitDialogueIntoWords(currentDialogue.dialogue);
            this.fullWordsColor = [];
            this.fullWordsColor = prefullWords;
        } else {
            this.removeEventListeners();
            this.cutsceneBackgroundChange(400, 600, 400);
            setTimeout(() => {
                this.game.endCutscene(cutscene);
                if (this.game.isEndCutscene) {
                    this.game.isPlayerInGame = false;
                } else {
                    this.game.isPlayerInGame = true;
                }
                this.game.input.keys = [];
                this.game.audioHandler.cutsceneDialogue.stopAllSounds();
                this.game.audioHandler.cutsceneSFX.stopAllSounds();
                this.game.audioHandler.cutsceneMusic.stopAllSounds();
                this.game.audioHandler.cutsceneDialogue.playSound('bit1', false, true, true);
            }, 500);
        }
        const checkAnimationStatus = setInterval(() => {
            if (this.textIndex >= this.dialogue[this.dialogueIndex].dialogue.length) {
                this.isEnterPressed = false;
                clearInterval(checkAnimationStatus);
            }
        }, 100);
    }

    displayDialogue(cutscene) {
        this.handleKeyDown = (event) => {
            if (event.key === 'Tab' && this.game.fadingIn === false && this.game.enterDuringBackgroundTransition && this.game.waitForFadeInOpacity === false) {
                this.removeEventListeners();
                this.cutsceneBackgroundChange(400, 600, 400);
                setTimeout(() => {
                    this.dialogueIndex = this.dialogue.length - 1;
                    this.game.endCutscene(cutscene);
                    if (this.game.isEndCutscene) {
                        this.game.isPlayerInGame = false;
                    } else {
                        this.game.isPlayerInGame = true;
                    }
                    this.game.audioHandler.cutsceneDialogue.stopAllSounds();
                    this.game.audioHandler.cutsceneSFX.stopAllSounds();
                    this.game.audioHandler.cutsceneMusic.stopAllSounds();
                    this.game.audioHandler.cutsceneDialogue.playSound('bit1', false, true, true);
                }, 500);
            }
            if (event.key === 'Enter' && !this.isEnterPressed && !this.game.fadingIn &&
                this.game.enterDuringBackgroundTransition && this.game.waitForFadeInOpacity === false) {
                this.enterOrLeftClick(cutscene);
            }
        };
        this.handleLeftClick = (event) => {
            if (!this.isEnterPressed && !this.game.fadingIn && this.game.enterDuringBackgroundTransition && this.game.waitForFadeInOpacity === false) {
                this.enterOrLeftClick(cutscene);
            }
        };
        super.displayDialogue(cutscene);
    }

    cutsceneController() {
        if (this.textIndex === this.dialogue[this.dialogueIndex].dialogue.length) {
            if (this.game.mapSelected[1]) {
                if (this.game.isEndCutscene === false) {
                    if (this.dialogueIndex === 5) {
                        this.game.audioHandler.cutsceneSFX.playSound('slashSound');
                    } else if (this.dialogueIndex === 6) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1TentFireplace');
                            this.game.audioHandler.cutsceneMusic.playSound('cracklingMountainCampfirewithRelaxingRiver', true);
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 7) {
                        this.game.audioHandler.cutsceneMusic.playSound('onTheBeachAtDusk', true);
                    } else if (this.dialogueIndex === 29) {
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('onTheBeachAtDusk');
                    } else if (this.dialogueIndex === 58) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('cracklingMountainCampfirewithRelaxingRiver');
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 4, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1outsideCastleDoor');
                            this.game.audioHandler.cutsceneSFX.playSound('walkingCutsceneSound');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 60) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 4, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1KingsBedroom');
                            this.game.audioHandler.cutsceneSFX.playSound('doorOpening');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 63) {
                        setTimeout(() => {
                            this.game.audioHandler.cutsceneMusic.playSound('inTheFuture', true);
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 66) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1SafeRoom');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 73) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1crypticTokenWar');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 93) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1Lab');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 95) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1DestroyedTree');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 97) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1RegeneratedTree');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 100) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1KingsBedroom');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 132) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1outsideCastleDoor');
                            this.game.audioHandler.cutsceneMusic.fadeOutAndStop('inTheFuture');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 138) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.playSound('windBreezeSound', true);
                            this.backgroundImage = document.getElementById('map1outsideLakeAndTrees');
                        }, this.halfASecond + 100);
                    }
                } else {
                    // no cutscene changes here
                }
            } else if (this.game.mapSelected[2]) {
                if (this.game.isEndCutscene === false) {
                    if (this.dialogueIndex === 2) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 3, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('dreamLight1');
                            this.game.audioHandler.cutsceneMusic.playSound('echoesOfTime', true);
                        }, this.halfASecond * 4);
                    } else if (this.dialogueIndex === 4) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('dreamDark1');
                        }, this.halfASecond + 700);
                    } else if (this.dialogueIndex === 28) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('echoesOfTime');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.playSound('exaleDeskant', true);
                            this.backgroundImage = document.getElementById('cabincutscene1_5');
                        }, this.halfASecond * 2 + 700);
                    } else if (this.dialogueIndex === 35) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('exaleDeskant');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneSFX.playSound('doorOpening');
                            this.game.audioHandler.cutsceneMusic.playSound('windBreezeSound', true);
                            this.backgroundImage = document.getElementById('map2outsideCabin');
                        }, this.halfASecond * 2 + 700);
                    }
                } else {
                    if (this.dialogueIndex === 6) {
                        this.game.audioHandler.cutsceneSFX.playSound('cutsceneMapOpening');
                    } else if (this.dialogueIndex === 19) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1blackBackground');
                        }, this.halfASecond);
                    } else if (this.dialogueIndex === 20) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.playSound('echoesOfTime', true);
                            this.backgroundImage = document.getElementById('dreamLight2');
                        }, this.halfASecond * 2 + 700);
                    } else if (this.dialogueIndex === 24) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('dreamDark2');
                        }, this.halfASecond * 2 + 700);
                    } else if (this.dialogueIndex === 39) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1blackBackground');
                            this.game.audioHandler.cutsceneMusic.fadeOutAndStop('echoesOfTime');
                        }, this.halfASecond);
                    }
                }
            } else if (this.game.mapSelected[3]) {
                if (this.game.isEndCutscene === false) {
                    if (this.dialogueIndex === 7) {
                        this.game.audioHandler.cutsceneSFX.playSound('cutsceneMapOpening');
                    } else if (this.dialogueIndex === 11) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneSFX.playSound('doorOpening');
                            this.game.audioHandler.cutsceneMusic.playSound('windBreezeSound', true);
                            this.backgroundImage = document.getElementById('map3OutsideCabin');
                        }, this.halfASecond * 2 + 700);
                    } else if (this.dialogueIndex === 32) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 5, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneSFX.playSound('walkingCutsceneSound');
                            this.backgroundImage = document.getElementById('map3Sorcerer');
                        }, this.halfASecond * 2 + 700);
                    } else if (this.dialogueIndex === 50) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneSFX.playSound('sorcererEnteringMindSound');
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('birdsChirping');
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('windBreezeSound');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.isCharacterBlackAndWhite = true;
                            this.isBackgroundBlackAndWhite = true;
                            this.backgroundImage = document.getElementById('map3OutsideCabin');
                        }, this.halfASecond * 2 + 700);
                    } else if (this.dialogueIndex === 57) {
                        this.isCharacterBlackAndWhite = false;
                    } else if (this.dialogueIndex === 60) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.isBackgroundBlackAndWhite = false;
                            this.game.audioHandler.cutsceneMusic.playSound('echoesOfTime', true);
                            this.backgroundImage = document.getElementById('dreamLight3');
                        }, this.halfASecond * 2 + 700);
                    } else if (this.dialogueIndex === 64) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('dreamDark3');
                        }, this.halfASecond * 2 + 700);
                    } else if (this.dialogueIndex === 73) {
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond / 2, this.halfASecond / 2);
                        this.game.audioHandler.cutsceneSFX.playSound('sorcererTeleportBackSound');
                    } else if (this.dialogueIndex === 74) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.fadeOutAndStop('echoesOfTime');
                            this.game.audioHandler.cutsceneMusic.playSound('birdsChirping', true);
                            this.game.audioHandler.cutsceneMusic.playSound('windBreezeSound', true);
                            this.backgroundImage = document.getElementById('map3Sorcerer');
                        }, this.halfASecond * 2 + 700);
                    } else if (this.dialogueIndex === 89) {
                        this.game.audioHandler.cutsceneSFX.playSound('sorcererWaterSpellSound');
                    } else if (this.dialogueIndex === 95) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 4, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneSFX.playSound('waterSplashSound');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 98) {
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('birdsChirping');
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('windBreezeSound');
                    }
                } else {
                    if (this.dialogueIndex === 6) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('submarineSonarUnderwaterSound');
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1blackBackground');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 10) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 4, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.playSound('submarineSonarUnderwaterSound');
                            this.backgroundImage = document.getElementById('map3InsideSubmarine');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 14) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 16, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneSFX.playSound('submarineRevving', true);
                            this.backgroundImage = document.getElementById('map1blackBackground');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 16) {
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        this.game.audioHandler.cutsceneSFX.fadeOutAndStop('submarineRevving');
                    } else if (this.dialogueIndex === 18) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneSFX.playSound('submarineDoorOpening');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 19) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('submarineSonarUnderwaterSound');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 4, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.playSound('windBreezeSound');
                            this.backgroundImage = document.getElementById('map3ForestRiver');
                        }, this.halfASecond * 2 + 100);
                    }
                }
            } else if (this.game.mapSelected[4]) {
                if (this.game.isEndCutscene === false) {
                    if (this.dialogueIndex === 5) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map4footsteps');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 10) {
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound', false, true);
                    } else if (this.dialogueIndex === 12) {
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound', false, true);
                    } else if (this.dialogueIndex === 14) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound');
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('birdsChirping');
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('windBreezeSound');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('dreamLight4');
                            this.game.audioHandler.cutsceneMusic.playSound('echoesOfTime', true);
                        }, this.halfASecond * 4 + 100);
                    } else if (this.dialogueIndex === 15) {
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound');
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                    } else if (this.dialogueIndex === 17) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('dreamDark4');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 37) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('echoesOfTime');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.playSound('birdsChirping', true);
                            this.game.audioHandler.cutsceneMusic.playSound('windBreezeSound', true);
                            this.backgroundImage = document.getElementById('map4beginningForestView');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 46) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('windBreezeSound');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('birdsChirping');
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('windBreezeSound');
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1KingsBedroom');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 54) {
                        setTimeout(() => {
                            this.game.audioHandler.cutsceneMusic.playSound('inTheFuture', true);
                        }, this.halfASecond);
                    } else if (this.dialogueIndex === 56) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1crypticTokenWallpaper');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 57) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map4CloningLab');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 60) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map4ElyvorgFlames');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 64) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map4EvilElyvorg');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 66) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map4hospitalBedEmpty');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 69) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1KingsBedroom');
                        }, this.halfASecond + 100);
                    }
                } else {
                    if (this.dialogueIndex === 16) {
                        this.game.audioHandler.cutsceneMusic.playSound('planetsParalysis', true);
                    } else if (this.dialogueIndex === 20) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.isCharacterBlackAndWhite = true;
                            this.isBackgroundBlackAndWhite = true;
                            this.backgroundImage = document.getElementById('map1KingsBedroom');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 21) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.isCharacterBlackAndWhite = false;
                            this.isBackgroundBlackAndWhite = false;
                            this.backgroundImage = document.getElementById('map4CabinEndCutscene');
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 46) {
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('planetsParalysis');

                    }
                }
            } else if (this.game.mapSelected[5]) {
                if (this.game.isEndCutscene === false) {
                    if (this.dialogueIndex === 0) {
                        // no cutscene changes here
                    }
                } else {
                    if (this.dialogueIndex === 0) {
                        // no cutscene changes here
                    }
                }
            } else if (this.game.mapSelected[6]) {
                if (this.game.isEndCutscene === false) {
                    if (this.dialogueIndex === 5) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('dreamLight5');
                            this.game.audioHandler.cutsceneMusic.playSound('echoesOfTime', true);
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 8) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.playSound('crypticTokenDarkAmbienceSound', true);
                            this.backgroundImage = document.getElementById('dreamDark5');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 12) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.fadeOutAndStop('echoesOfTime');
                            this.game.audioHandler.cutsceneMusic.fadeOutAndStop('crypticTokenDarkAmbienceSound');
                            this.game.audioHandler.cutsceneMusic.playSound('birdsChirping', true);
                            this.backgroundImage = document.getElementById('map5insideCabin');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 15) {
                        this.game.audioHandler.cutsceneSFX.playSound('doorOpening');
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond / 2, this.halfASecond / 2, this.halfASecond / 2);
                        setTimeout(() => {
                            this.addEventListeners();
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 27) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('birdsChirping');
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.playSound('bubblingVolcanoLavaSound', true);
                            this.backgroundImage = document.getElementById('map6VolcanoWalkUp');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 35) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                        }, this.halfASecond * 2 + 100);
                    }
                } else {
                    if (this.dialogueIndex === 0) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.game.audioHandler.cutsceneMusic.playSound('bubblingVolcanoLavaSound', true);
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map6insideCaveLava');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 3) {
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound');
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 5) {
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound');
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                        }, this.halfASecond + 100);
                    } else if (this.dialogueIndex === 7) {
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound');
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('bubblingVolcanoLavaSound');
                        this.cutsceneBackgroundChange(this.halfASecond * 2, this.halfASecond * 2, this.halfASecond * 2);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('dreamLight6');
                            this.game.audioHandler.cutsceneMusic.playSound('echoesOfTime', true);
                        }, this.halfASecond * 3 + 300);
                    } else if (this.dialogueIndex === 9) {
                        this.game.audioHandler.cutsceneSFX.playSound('dreamSound');
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('dreamDark6');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 32) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.fadeOutAndStop('echoesOfTime');
                            this.backgroundImage = document.getElementById('map1blackBackground');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 36) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.playSound('bubblingVolcanoLavaSound', true);
                            this.backgroundImage = document.getElementById('map6elyvorgTokenPlaceFind');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 38) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map6elyvorgTokenPlace');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 39) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map6stone');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 43) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map6stone2');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 44) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.game.audioHandler.cutsceneMusic.playSound('groundShakingSound', true);
                            this.groundShaking = true;
                            this.backgroundImage = document.getElementById('map6stone3');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 48) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map6elyvorgTokenPlaceActive');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 51) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('bubblingVolcanoLavaSound');
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('map1KingsBedroom');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 55) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneMusic.playSound('bubblingVolcanoLavaSound', true);
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById(this.getmap6insideCaveLavaEarthquake());
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 59) {
                        this.removeEventListeners();
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('bubblingVolcanoLavaSound');
                        this.cutsceneBackgroundChange(this.halfASecond, this.halfASecond * 2, this.halfASecond);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.backgroundImage = document.getElementById('dreamLight7');
                        }, this.halfASecond * 2 + 100);
                    } else if (this.dialogueIndex === 67) {
                        this.removeEventListeners();
                        this.dontShowTextBoxAndSound = true;
                        this.game.audioHandler.cutsceneMusic.fadeOutAndStop('groundShakingSound');
                        this.cutsceneBackgroundChange(this.halfASecond * 4, this.halfASecond * 2, this.halfASecond * 7);
                        setTimeout(() => {
                            this.game.audioHandler.cutsceneMusic.playSound('gta4Theme', true);
                            this.groundShaking = false;
                            this.backgroundImage = document.getElementById('toBeContinued');
                        }, this.halfASecond * 4 + 100);
                        setTimeout(() => {
                            this.addEventListeners();
                        }, this.halfASecond * 13);
                    } else if (this.dialogueIndex === 68) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(this.halfASecond * 4, this.halfASecond * 2, this.halfASecond * 7);
                        setTimeout(() => {
                            this.addEventListeners();
                            this.groundShaking = false;
                            this.backgroundImage = document.getElementById('madeByDanial');
                        }, this.halfASecond * 4 + 100);
                    }
                }
            }
        }
    }
}


// Map 1 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map1Cutscene extends StoryCutscene {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('map1blackBackground');
        this.addDialogue( //0
            `${this.valdorin}`,
            `Who are you? Why are you doing this... Please no... don't take that...`,
        );
        this.addDialogue( //1
            `${this.valdorin}`,
            `NO... NOT THE-`,
        );
        this.addDialogue( //2
            `${this.questionMark}`,
            `I will take this.`,
        );
        this.addDialogue( //3
            `${this.valdorin}`,
            `How did you get past everyone without a single scratch... I can't allow you to get out of that door... Not with that in your hands..!`,
        );
        this.addDialogue( //4
            `${this.questionMark}`,
            `You're nothing but a fool. Nothing is going to stop me, including you.`,
        );
        this.addDialogue( //5 slash sound effect
            `${this.questionMark}`,
            `Take this.`,
        );
        this.addDialogue( //6 switch scenary
            `${this.valdorin}`,
            `GWWAAHHH!`,
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `What time is it... Oh... it's still early. I passed out looking at stars.`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `It was a good idea deciding to sleep outside today. Looking at the stars, feeling the breeze.. there's nothing better than this!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `I... I kinda wish I could go out and explore outside this place. I do love ${this.lunar} ${this.moonlit} ${this.glade}, I mean it's my home after all...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `But I feel like there is so much more to explore outside of this land.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `But ${this.valdorin} wouldn't allow me to. He thinks there is no point and it's too dangerous... What does he know!?`,
            this.addImage(this.setfiredogSad(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Anyways... if I keep training I can prove ${this.valdorin} that I am strong enough to go out by myself!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Haha! I feel so much more motivated now.`,
            this.addImage(this.setfiredogHappy(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //14
            `${this.threeDots}`,
            `Ha! There you are ${this.firedog}! I have been looking for you everywhere!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `Oh... Is that you ${this.galadon}?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //16
            `${this.galadon}`,
            `Indeed it is! I had a feeling I would find you here!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `You know me well, I thought it would be a good idea to just set up a tent here and relax.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //18
            `${this.galadon}`,
            `You've been sleeping outside a lot recently, any particular reason?`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonOh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Not really, it just feels nice to connect with nature once in a while!`,
            this.addImage(this.setfiredogHappy(), 1, 0, 79, 590, 610),
            this.addImage('galadonOh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `But anyways... What brings you here ${this.galadon}?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonOh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.galadon}`,
            `Just wanted to see how you were doing. I know that not being able to explore outside our home feels like prison to you sometimes.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonSurprised', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //22
            `${this.galadon}`,
            `I know you get really excited by the thought of the unknown, but it is quite danger-`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonSad', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Dangerous right, haha. Don't worry I've heard this a million times before!`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
            this.addImage('galadonSad', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //24
            `${this.galadon}`,
            `Haha yeah, I'm sorry for bringing it up again. But I'm sure that in no time you'll be able to go out there too!`,
            this.addImage(this.setfiredogLaugh(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonSad', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Thanks ${this.galadon}, I hope so too.`,
            this.addImage(this.setfiredogHappy(), 1, 0, 79, 590, 610),
            this.addImage('galadonSad', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //26
            `${this.galadon}`,
            `Wow... This is quite a nice view in here ${this.firedog}. I never really noticed how nice this place looked before. No wonder you always come here!`,
            this.addImage(this.setfiredogHappy(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonAmazed', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `I know right? It's peaceful.`,
            this.addImage(this.setfiredogHappy(), 1, 0, 79, 590, 610),
            this.addImage('galadonAmazed', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //28
            `${this.galadon}`,
            `Speaking of peaceful, did you see the local news around town recently?`,
            this.addImage(this.setfiredogHappy(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonOh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `No, what happened?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonOh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //30
            `${this.galadon}`,
            `Apparently about 2 weeks ago, during a scout around the borders of ${this.lunar} ${this.moonlit} ${this.glade}, some traps were discovered destroyed.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonOh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Traps? What traps?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonOh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //32
            `${this.galadon}`,
            `How come you haven't heard of it! Our land is quite safe from intruders.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonSurprised', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //33
            `${this.galadon}`,
            `When ${this.valdorin} took over the throne of our land years ago, he insisted in making our borders as secure as possible.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonOh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //34
            `${this.galadon}`,
            `This is why we have security guards and traps all around!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonOh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //35
            `${this.galadon}`,
            `And apparently it was thought to be impossible to step on a trap and not be detected...`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonOh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //36
            `${this.galadon}`,
            `So it was a surprise when one of the security guards on an early morning shift saw a trap destroyed.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonOh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `What kind of trap was it!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonOh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //38
            `${this.galadon}`,
            `An explosive wire trap... well... not just one but around 5 within the area.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonOh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `Why would anyone want to invade us?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonOh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //40
            `${this.galadon}`,
            `Well, as you know, ${this.lunar} ${this.moonlit} ${this.glade} keeps a very important item which resides at the center of the castle.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonAmazed', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //41
            `${this.galadon}`,
            `So it comes to no surprise that we might get intruders that take interest in it... but the good news is that no one has ever crossed past the traps!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonOh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //42
            `${this.galadon}`,
            `Nonetheless it's still definitely sketchy... but I'm sure it's fine as everyone in here works towards making our land safer, including me!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonOh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //43
            `${this.firedog}`,
            `(How would anyone go unnoticed? I mean... I have heard about how secure our land is, but to destroy some traps without being spotted?)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonOh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //44
            `${this.galadon}`,
            `Why did you go quiet all of a sudden! Didn't mean to scare ya'!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonSurprised', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `Haha, I'm not scared ${this.galadon}, well... not as much as you are at least!`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
            this.addImage('galadonSurprised', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //46
            `${this.galadon}`,
            `Very funny of you ${this.firedog}.`,
            this.addImage(this.setfiredogLaugh(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //47
            `${this.threeDots}`,
            `There you two are.`,
            this.addImage(this.setfiredogLaugh(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //48
            `${this.galadon}`,
            `Wha! Is that an intruder!?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonScared', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //49
            `${this.threeDots}`,
            `Intruder? What are you talking about... It's ${this.quilzorin}.`,
            this.addImage('quilzorinNormal', 1, 0, 79, 590, 610),
            this.addImage('galadonScared', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //50
            `${this.quilzorin}`,
            `I have been ordered to find you two.`,
            this.addImage('quilzorinNormal', 1, 0, 79, 590, 610),
            this.addImage('galadonScared', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //51
            `${this.galadon}`,
            `Did you miss us that badly ${this.quilzorin}?`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('galadonAmazed', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //52
            `${this.quilzorin}`,
            `This is no time for jokes. While you two were away ${this.valdorin}...`,
            this.addImage('quilzorinExplaining', 1, 0, 79, 590, 610),
            this.addImage('galadonAmazed', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //53
            `${this.galadon}`,
            `Uh..? What about ${this.valdorin}?`,
            this.addImage('quilzorinExplaining', 0.7, 0, 79, 590, 610),
            this.addImage('galadonSurprised', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //54
            `${this.quilzorin}`,
            `Someone has attacked ${this.valdorin} this afternoon...`,
            this.addImage('quilzorinExplaining', 1, 0, 79, 590, 610),
            this.addImage('galadonSurprised', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //55
            `${this.everyone}`,
            `WHAT!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonScared', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //56
            `${this.galadon}`,
            `What do you mean someone attacked ${this.valdorin}? Who?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonScared', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //57
            `${this.quilzorin}`,
            `He's alive... but it's best if you come with me... ${this.valdorin} has ordered me to find and bring you two inside the castle.`,
            this.addImage('quilzorinExplaining', 1, 0, 79, 590, 610),
            this.addImage('galadonSad', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //58 scenary switch
            `${this.firedog}`,
            `No time to waste, let's go.`,
            this.addImage(this.setfiredogAngry2(), 1, 0, 79, 590, 610),
            this.addImage('galadonSad', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //59
            `${this.galadon}`,
            `Seems like we're at the entrance.`,
            this.addImage('galadonNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //60 scenary switch
            `${this.firedog}`,
            `Let's go see ${this.valdorin}.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //61
            `${this.valdorin}`,
            `I hear footsteps...`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //62
            `${this.valdorin}`,
            `${this.firedog}... ${this.galadon}... is that you?`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //63 add audio
            `${this.galadon}`,
            `We're here... What happened?`,
            this.addImage('galadonSurprised', 1, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //64
            `${this.valdorin}`,
            `The most precious item of ${this.lunar} ${this.moonlit} ${this.glade}... it has been stolen.`,
            this.addImage('galadonSurprised', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinFistUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //65
            `${this.everyone}`,
            `What!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonScared', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //66 scenary switch
            `${this.valdorin}`,
            `Yes... the ${this.cryptic} ${this.token} has been taken away from it's secret safe.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //67
            `${this.valdorin}`,
            `I heard a sound coming from the safe room. There's always guards on shift keeping an eye on the safe room, but when I called for them no one answered.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //68
            `${this.valdorin}`,
            `I got curious and went to open the door. Once I got there I heard a noise behind me.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //69
            `${this.valdorin}`,
            `I looked behind and a dark-hooded figure knocked me down with some sort of electric attack before I could use any of my abilities.`,
            this.addImage('valdorinSurprised', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //70
            `${this.valdorin}`,
            `Before I knew it, it was already too late.`,
            this.addImage('valdorinFistUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //71
            `${this.galadon}`,
            `I can't believe it, this is not good...`,
            this.addImage('galadonScared', 1, 0, 79, 590, 610),
            this.addImage('valdorinFistUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //72
            `${this.firedog}`,
            `What's gonna happen now that the ${this.cryptic} ${this.token} has been taken away from the safe?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonScared', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //73 scenary switch
            `${this.valdorin}`,
            `Bad things... As you are aware, this token keeps time-space balanced across every land.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('valdorinFistUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //74
            `${this.valdorin}`,
            `Every land was once at war with each other decades and even centuries ago...`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //75
            `${this.valdorin}`,
            `Many battles took place... and many soldiers have died...`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //76
            `${this.valdorin}`,
            `It was a never ending battle.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //77
            `${this.valdorin}`,
            `There wasn't a ${this.cryptic} ${this.token} back then.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //78
            `${this.firedog}`,
            `What do you mean there wasn't a ${this.cryptic} ${this.token}?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //79
            `${this.valdorin}`,
            `It simply did not exist. It was in fact discovered...`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //80
            `${this.valdorin}`,
            `Legends say centuries ago, as our ancestors were battling against the enemies, things were not looking good.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //81
            `${this.valdorin}`,
            `Many soldiers had died from our side... The enemy was winning the battle.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //82
            `${this.valdorin}`,
            `As the last dozen of our ancestors were about to be killed...`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //83
            `${this.valdorin}`,
            `They noticed an intense bright object falling from the sky. The ${this.cryptic} ${this.token}.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //84
            `${this.valdorin}`,
            `Its brightness was so intense that legends say that the ${this.cryptic} ${this.token} was shining 10x more intensively than the sun as it was floating in the air.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //85
            `${this.valdorin}`,
            `The enemies got scared and ran away. They must've thought we had reinforcements coming.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //86
            `${this.valdorin}`,
            `Our ancestors, however, were amazed. They walked close to the ${this.cryptic} ${this.token}.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //87
            `${this.valdorin}`,
            `They noticed that the ${this.cryptic} ${this.token} was attached to a wooden piece. They called it the ${this.temporal} ${this.timber}.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //88
            `${this.valdorin}`,
            `When they are both connected, the token becomes incredibly powerful.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //89
            `${this.valdorin}`,
            `Curiosity got the better of them and when they touched the token, they were overwhelmed with power.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //90
            `${this.valdorin}`,
            `They decided to take it back home but...`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //91
            `${this.valdorin}`,
            `As they were almost home, the token's power was so intense that some of our ancestors started fighting over it... Its power drove them absolutely crazy.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //92
            `${this.valdorin}`,
            `A civil war almost started, until the king, my 9th great-grandparent, ${this.valdonotski}, ended the altercation by casting a spell to put them all to sleep.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //93 change scenary
            `${this.valdorin}`,
            `He noticed the bright token on the ground, and he himself could feel its intense power.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //94
            `${this.valdorin}`,
            `He brought the ${this.cryptic} ${this.token} inside the castle and examined it.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //95 change scenary
            `${this.valdorin}`,
            `After many days of research and examining, ${this.valdonotski} was astonished by the token. It seemed like it could distort space-time reality.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //96 
            `${this.valdorin}`,
            `He decided to bring the token in a remote area and test it. He casted an ability on some trees, breaking them into pieces.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //97 change scenary
            `${this.valdorin}`,
            `${this.valdonotski} then touched the token, and in his mind, he was envisioning the destroyed trees rebuilding themselves back up again.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //98 
            `${this.valdorin}`,
            `Much to his astonishment, his thoughts manifested into reality. The trees he had just destroyed started to rebuild themselves in front of his eyes.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //99
            `${this.valdorin}`,
            `He also noticed that his spells were twice as powerful when keeping the ${this.cryptic} ${this.token} close to himself.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //100 scenary switch
            `${this.valdorin}`,
            `He became convinced that the token was a power given from God, sent down to earth.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //101
            `${this.valdorin}`,
            `It seemed that the wooden piece, the ${this.temporal} ${this.timber} could come apart, and when it did, the token stopped shining as bright.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //102
            `${this.valdorin}`,
            `And people around the token were not going completely crazy for its power when it wasn't connected to that wooden piece.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //103
            `${this.valdorin}`,
            `${this.valdonotski} noticed he was not getting affected as much as his companions were when the ${this.cryptic} ${this.token} was connected to the ${this.temporal} ${this.timber}.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //104
            `${this.valdorin}`,
            `He deduced that a strong willed-soul would be able to control himself when near the ${this.cryptic} ${this.token}.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //105
            `${this.valdorin}`,
            `They decided to keep it in a safe inside the castle for some time but then the attacks started...`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //106
            `${this.firedog}`,
            `Hm!? What attacks!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //107
            `${this.valdorin}`,
            `Invaders were trying to get inside our land, but when they got caught and interrogated, they said that they heard our land had a God-like power.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //108
            `${this.valdorin}`,
            `So it was likely that when the ${this.cryptic} ${this.token} was being brought back home with our ancestors, some enemies had spotted them with it.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //109
            `${this.valdorin}`,
            `But that's when my 9th great-grandparent had an idea. He knew the risks of it being inside the castle.`,
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //110
            `${this.valdorin}`,
            `So he decided to take the ${this.cryptic} ${this.token} apart from the ${this.temporal} ${this.timber}.`,
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //111
            `${this.valdorin}`,
            `The ${this.temporal} ${this.timber} by itself had no power, so they kept the wooden piece hidden outside the land.`,
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //112
            `${this.valdorin}`,
            `While the token itself, was to remain inside the castle's safe room.`,
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //113
            `${this.valdorin}`,
            `But now... for the first time in centuries the ${this.cryptic} ${this.token} has been stolen.`,
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //114
            `${this.valdorin}`,
            `Whoever did this is up to no good... However, we got time.`,
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //115
            `${this.galadon}`,
            `How so ${this.valdorin}!?`,
            this.addImage('galadonSurprised', 1, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //116
            `${this.valdorin}`,
            `The ${this.cryptic} ${this.token} without the ${this.temporal} ${this.timber} is not even as half powerful as it is when they are both connected.`,
            this.addImage('galadonSurprised', 0.7, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //117
            `${this.valdorin}`,
            `Now, this is still bad, because the token alone itself is already astonishingly powerful.`,
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //118
            `${this.valdorin}`,
            `But despite our precious token being stolen, the culprit will not be able to fully unlock it's space-time powers until they connect that wooden piece to it.`,
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //119
            `${this.valdorin}`,
            `Because the ${this.temporal} ${this.timber} is hidden, I don't think the thief knows where it is... but we cannot sit here assuming things. We need to get it.`,
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //120
            `${this.firedog}`,
            `Where can the ${this.temporal} ${this.timber} be found? Is it near our land?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //121
            `${this.valdorin}`,
            `Unfortunately not... The ${this.temporal} ${this.timber} is inside a cave in ${this.infernal} ${this.crater} ${this.peak}..`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //122
            `${this.valdorin}`,
            `If the culprit gets there before we do the consequences will be huge. That's assuming they know the location of the ${this.temporal} ${this.timber}.`,
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //123
            `${this.valdorin}`,
            `Using the space-time abilities of the ${this.cryptic} ${this.token} evilly will distort reality completely, to the point where we might cease to exist.`,
            this.addImage('valdorinFistUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //124
            `${this.valdorin}`,
            `We have sent some guards there already, but due to it's urgency I will need you to go there as well ${this.galadon} and ${this.firedog}.`,
            this.addImage('valdorinFistUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //125
            `${this.firedog}`,
            `Me as well? You have always told me it is too dangerous for me to leave this land... Is this a good idea?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('valdorinFistUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //126
            `${this.valdorin}`,
            `Yes ${this.firedog}. Your powers could come in handy now, specially in a situation like this...`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('valdorinFistUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //127
            `${this.valdorin}`,
            `${this.galadon}, you can go ahead and follow the trail to ${this.infernal} ${this.crater} ${this.peak}, we can't waste much time.`,
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //128
            `${this.galadon}`,
            `Got it. Catch up to me whenever you can ${this.firedog}, I'll go now.`,
            this.addImage('galadonNormal', 1, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //129
            `${this.firedog}`,
            `Stay safe ${this.galadon}...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //130
            `${this.firedog}`,
            `Okay... ${this.valdorin}, shall I go too?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //131
            `${this.valdorin}`,
            `Yes, you will go soon. ${this.quilzorin}, could you please guide ${this.firedog} outside and show him the path he needs to take?`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //132 scenary switch
            `${this.quilzorin}`,
            `Yes. I will. ${this.firedog}, please meet me outside.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinHandUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //133 music stops
            `${this.quilzorin}`,
            `Okay... Now that we are outside, you will need to know a few things before you go out on this journey.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinHandUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //134
            `${this.firedog}`,
            `What things?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinHandUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //135
            `${this.quilzorin}`,
            `The path to ${this.infernal} ${this.crater} ${this.peak} is towards east for a couple lands, then south.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinExplaining', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //136
            `${this.quilzorin}`,
            `We cannot travel straight south due to the vast empty desert and dangerously constant tornadoes blocking our path.. you'd be long gone.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinExplaining', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //137
            `${this.quilzorin}`,
            `The ${this.temporal} ${this.timber} will be inside the biggest cave. Be careful in there, there's active volcanos all the time in ${this.infernal} ${this.crater} ${this.peak}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinExplaining', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //138 scenary switch
            `${this.quilzorin}`,
            `Come with me, I'll take you near the exit.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinExplaining2', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //139
            `${this.firedog}`,
            `Seems like we're outside the gates. It's already night. Will it be safe around this time?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //140
            `${this.quilzorin}`,
            `Well... probably not... but if you are cautious enough you will be fine!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinLaugh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //141
            `${this.firedog}`,
            `Well that's not very reassuring of you ${this.quilzorin}!`,
            this.addImage(this.setfiredogAngry2(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinLaugh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //142
            `${this.quilzorin}`,
            `All you need to know is that there will be different types of enemies ahead.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinExplaining2', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //143
            `${this.quilzorin}`,
            `You will be fine as your rolling and diving abilities can take most of them out, however be careful as it won't work with every enemy.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinExplaining2', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //144
            `${this.quilzorin}`,
            `You might need to use your fireball attack against some enemies to avoid taking damage unexpectedly.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinExplaining2', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //145
            `${this.quilzorin}`,
            `There are cabins scattered around in the land up ahead, so if you find one, I highly suggest you stay there for the night or rest for some time.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinExplaining2', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //146
            `${this.quilzorin}`,
            `Also... one more thing... Killing enemies will give you coins. Make sure you gather as many coins as you can.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinHandUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //147
            `${this.firedog}`,
            `I'm good at saving coins! That should be easy!`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinHandUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //148
            `${this.firedog}`,
            `Will you come with me as well?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinHandUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //149
            `${this.quilzorin}`,
            `I will stay here for now, protecting ${this.valdorin} as he recovers. In case anything else happens, we'll be ready.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //150
            `${this.quilzorin}`,
            `Now go ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //151
            `${this.firedog}`,
            `(To even think that someone defeated ${this.valdorin} with ease... Can I even do this?)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //152
            `${this.firedog}`,
            `(Only the higher-ups know about the situation... Apparently, the citizens are being kept in the dark. Well, it would be chaos if everyone knew.)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //153
            `${this.firedog}`,
            `(This is why it's important to get the ${this.temporal} ${this.timber} from the cave in ${this.infernal} ${this.crater} ${this.peak} as soon as possible.)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //154
            `${this.firedog}`,
            `(But how is this happening? Someone really got through the safe unnoticed and got the ${this.cryptic} ${this.token} that easily?)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //155
            `${this.firedog}`,
            `(Come to think of it... could this also be connected to what happened 2 weeks ago with the traps?)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //156
            `${this.firedog}`,
            `(What exactly is going on..)`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //157
            `${this.firedog}`,
            `(To be able to pass through the traps, the guards, get through the castle, and find the safe while being able to escape..)`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //158
            `${this.firedog}`,
            `(Let's go now, the future of this land might well depend on it.)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //159
            `${this.firedog}`,
            `I'll be going now then.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //160
            `${this.firedog}`,
            `Let's see if I can catch up to ${this.galadon}..!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //161
            `${this.quilzorin}`,
            `Goodluck out there, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('quilzorinNormal', 1, 1300, 79, 590, 610),
        );
    }
}
export class Map1EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('cabincutscene1');
        this.game.audioHandler.cutsceneMusic.playSound('blizzardWindFireplace', true);
        this.addDialogue( //0
            `${this.firedog}`,
            `Well... there goes my money...`,
            this.addImage(this.setfiredogPhew(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `But at least I can rest here for a bit.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //2
            `${this.threeDots}`,
            `Do you talk alone this often?`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `WHO'S THAT!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //4
            `${this.threeDots}`,
            `My name is ${this.duskmaw}.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //5
            `${this.duskmaw}`,
            `I'm an explorer.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `You scared me!`,
            this.addImage(this.setfiredogAngry2(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //7
            `${this.duskmaw}`,
            `Haha, I'm sorry about that, I don't usually see many people going on adventures themselves. What brings you here?`,
            this.addImage(this.setfiredogAngry2(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLaugh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Well I'm looking for-`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLaugh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `(Wait... it wouldn't be wise of me if I told this stranger why I'm here.)`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLaugh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `(Perhaps I can get him to give me some information about the land, that would be smart..!)`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLaugh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `I'm looking for huh.. new adventures.. It's always been my sort of dream to be an explorer, just like you are!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLaugh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `What about you? What brings you here?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLaugh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //13
            `${this.duskmaw}`,
            `I'm a full-time traveler! I just revisit the lands and explore all kinds of places!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat2', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `That's cool! What parts of the land have you explored? It seems you've been doing this for a while!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat2', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //15
            `${this.duskmaw}`,
            `For a while it has been indeed... I have been doing this for decades now... I have been practically everywhere.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Decades? That's impressive... You've been everywhere? Have you ever explored caves before..?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //17
            `${this.duskmaw}`,
            `Caves? I've been to many caves!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `I see. Is there any caves that are known for .. being dangerous to go in?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //19
            `${this.duskmaw}`,
            `Hm there sure are... I have been to quite some dangerous ones myself.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //20
            `${this.duskmaw}`,
            `However, the most dangerous caves reside in ${this.infernal} ${this.crater} ${this.peak}... That is one of the few places I have never actually been...`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Oh.. how come?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //22
            `${this.duskmaw}`,
            `You haven't heard of it? It's full of active volcanos that could errupt at any point in time.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //23
            `${this.duskmaw}`,
            `There have been some brave souls who dared to explore it, but none of them ever came back. Still to this day the volcanos are active.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat2', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //24
            `${this.duskmaw}`,
            `Not to mention the number of caves that exist there. There are hundreds of caves.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat2', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //25
            `${this.duskmaw}`,
            `But if you are planning to explore that area.. I would suggest you not to, it's not worth the risk.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat2', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Oh I see, thanks for letting me know!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat2', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `(Well, that seems to be a quite dangerous place..)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat2', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //28
            `${this.duskmaw}`,
            `I would suggest you to get your rest. ${this.nightfall} ${this.city} ${this.phantom} is known for being sort of... paranormal during the night...`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `Paranormal..? ${this.nightfall} ${this.city} ${this.phantom}?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //30
            `${this.duskmaw}`,
            `Yes my friend, we're in ${this.nightfall} ${this.city} ${this.phantom} borders right now. You came just in time.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //31
            `${this.duskmaw}`,
            `There have been some encounters with locals in this city that have reported... well... sightings of ghosts...`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `Ghosts? This cannot be real can it...`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //33
            `${this.duskmaw}`,
            `Well... I wouldn't dare to check it out.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `You're totally right. I wasn't planning on going out at this hour anyway...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //35
            `${this.duskmaw}`,
            `As a fellow explorer, I think it's only right if I give you a backstory of the lands I've been on.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat2', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `Oh that sounds great! I'd love to hear more stories.`,
            this.addImage(this.setfiredogHappy(), 1, 0, 79, 590, 610),
            this.addImage('duskmawLiftingHat2', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //37
            `${this.duskmaw}`,
            `As you are aware centuries ago, every land was at war. Searching for power and to conquer land.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //38
            `${this.duskmaw}`,
            `Many people died before a peace treaty was proposed. Nowadays the biggest land belongs to ${this.lunar} ${this.moonlit} ${this.glade}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `(That's my home..)`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //40
            `${this.duskmaw}`,
            `Many other lands were frustrated, they were left with almost nothing, but to honor the peace treaty, and to avoid more deaths..`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //41
            `${this.duskmaw}`,
            `.. everyone has tried to move on past the wars... As I had told before, we are currently inside the borders of ${this.nightfall} ${this.city} ${this.phantom}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //42
            `${this.duskmaw}`,
            `${this.nightfall} ${this.city} ${this.phantom} villagers managed to produce mass concrete. And thanks to this they managed to build big houses.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //43
            `${this.duskmaw}`,
            `Out of all places, this is the most industrialized place. However, the city is quite small, which restricts them from doing anything else.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //44
            `${this.duskmaw}`,
            `But there are many other lands, such as ${this.coral} ${this.abyss}, which is famous for its vast lakes and rivers.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //45
            `${this.duskmaw}`,
            `They are rich in vegetation because of their geographic location, and they have found a way to filter their waters, which are then sold to nearby lands.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //46
            `${this.duskmaw}`,
            `Then we have ${this.verdant} ${this.vine} which is known for its vast amount of vines that scatter throughout the whole land.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //47
            `${this.duskmaw}`,
            `They sell all types of wood, that's what keeps their economy strong.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //48
            `${this.duskmaw}`,
            `They are able to mass-produce furniture, such as tables, chairs, beds, doors... you name it, they make it!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //49
            `${this.duskmaw}`,
            `Fun fact, the materials of all cabins came from ${this.verdant} ${this.vine}!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //50
            `${this.duskmaw}`,
            `${this.springly} ${this.lemony} is known for its food and plants. It's always spring there, so they are able to collect honey, and their trees yield delicious fruits all year.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //51
            `${this.duskmaw}`,
            `Their weather changes frequently from sunny to rainy, but this attracts animals to the area.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //52
            `${this.duskmaw}`,
            `They have many animals there! In fact, they own farms where they breed all kinds of animals and sell them to nearby lands when they become overpopulated.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //53
            `${this.duskmaw}`,
            `${this.infernal} ${this.crater} ${this.peak} used to be a rich land, richer than all of the others lands combined...`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //54
            `${this.duskmaw}`,
            `Being near the volcanos provided them heat, which allowed the land to survive the toughest conditions.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //55
            `${this.duskmaw}`,
            `The active volcanos constantly reacted with the ground and formed unique rocks, minerals and crystals.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //56
            `${this.duskmaw}`,
            `With these rare materials they managed to create beautiful jewellery, which was then sold to every other land.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //57
            `${this.duskmaw}`,
            `Their economy grew by a lot due to this strategy.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //58
            `${this.duskmaw}`,
            `However, one of the volcanos one day errupted, and destroyed everything in there. Today it is nothing but dry rocks, lava, and constant volcano erruptions.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //59
            `${this.firedog}`,
            `What!? When did this happen?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //60
            `${this.duskmaw}`,
            `Long before any of us were alive, my friend.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //61
            `${this.duskmaw}`,
            `There are many other much smaller lands all around. But these 6 are the biggest ones.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //62
            `${this.firedog}`,
            `I see, I never knew about these lands!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //63
            `${this.firedog}`,
            `You mentioned that this place was haunted... How is that possible?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //64
            `${this.duskmaw}`,
            `Haha! I wouldn't call it haunted during the day, only during the night!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //65
            `${this.duskmaw}`,
            `But rumors say that a young girl was playing with her ball outside near a construction site where the villagers were planning to expand the city.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //66
            `${this.duskmaw}`,
            `As they had the machinery working, the young girl accidently kicked the ball towards the wet concrete.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //67
            `${this.duskmaw}`,
            `She chased the ball and didn't realise the concrete was wet... She started sinking and... You know how it ends...`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //68
            `${this.firedog}`,
            `Wow.. That's horrible...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //69
            `${this.duskmaw}`,
            `Yeah... Ever since that incident, that's when the paranormal stuff started happening. People would hear a girl laughing during the night.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //70
            `${this.duskmaw}`,
            `Or hear steps outside their door. But when they would check if anyone was outside no one was there.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //71
            `${this.duskmaw}`,
            `But it seems that these activities have shifted towards the outskirts of town, around the area where we are.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //72
            `${this.duskmaw}`,
            `The villagers never felt harmed, but they were just terrified. The good news is that it only happens during the night!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //73
            `${this.firedog}`,
            `I see...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //74
            `${this.firedog}`,
            `(${this.duskmaw} seems to know so much about the history of every land.)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //75
            `${this.firedog}`,
            `(Maybe I should ask about the ${this.cryptic} ${this.token}, I wonder what he knows about it.)`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //76
            `${this.firedog}`,
            `${this.duskmaw}, have you ever heard about a ${this.cryptic} ${this.token} before?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //77
            `${this.duskmaw}`,
            `The ${this.cryptic} ${this.token}? I indeed have. But it is nothing but a fiction.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //78
            `${this.duskmaw}`,
            `Centuries ago, when all lands were at war, legends say that this token fell from the sky, containing unlimited power.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //79
            `${this.duskmaw}`,
            `But that's all I know about it. It is an old legend story. It's not real!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //80
            `${this.firedog}`,
            `(I see. It seems that people outside home don't know about the true story.)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //81
            `${this.firedog}`,
            `(But if only ${this.lunar} ${this.moonlit} ${this.glade} knows about the token, then who would know about it and steal it?)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //82
            `${this.firedog}`,
            `Thanks for telling me these stories ${this.duskmaw}!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //83
            `${this.firedog}`,
            `It's getting pretty late. I will go to sleep soon!`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //84
            `${this.duskmaw}`,
            `Me too my friend. Thanks for letting me tell you some stories.`,
            this.addImage(this.setfiredogTired(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //85
            `${this.duskmaw}`,
            `I'll talk to you in the morning if I see you! I'll go to my bed now, goodnight!`,
            this.addImage(this.setfiredogTired(), 0.7, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //86
            `${this.firedog}`,
            `Goodnight ${this.duskmaw}!`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //87
            `${this.firedog}`,
            `(I'm super tired. Well, I guess I should rest now. I need all my energy for tomorrow.)`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
            this.addImage('duskmawNormal', 0.7, 1300, 79, 590, 610),
        );
        this.game.map2Unlocked = true;
        this.game.saveGameState();
    }
}
// Map 2 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map2Cutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('cabincutscene1_5');
        this.addDialogue( //0
            `${this.firedog}`,
            `I feel like the moment I close my eyes I'll fall asleep...`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),

        );
        this.addDialogue( //1
            `${this.firedog}`,
            `I need to get the ${this.cryptic} ${this.token} back...`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),

        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I will... get it... back... I got... thi-`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),

        );
        this.addDialogue( //3
            `${this.firedog}`,
            `... Huh... Where am I?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Am I... dreaming..?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `What...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `I'm... I'm here again..?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `It's much darker now...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Wha-! What is that in that door... eyes..?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `I am definitely dreaming... But I've never experienced something so lucid before...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //10
            `${this.questionMark}`,
            `Are you sure you're dreaming?`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `WHAT!?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Who are you!?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //13
            `${this.questionMark}`,
            `Why don't you come here and find out?`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `(How does this feel so real... Wait... I can't move my body..)`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `(My heartbeat is going crazy... am I really dreaming?)`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //16
            `${this.questionMark}`,
            `Can't move huh? And your heart is beating faster? What are you going to do about it?`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `You... you can read my thoughts!?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //18
            `${this.questionMark}`,
            `Are you too blind to see the truth?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //19
            `${this.questionMark}`,
            `That place was blocking me from entering your mind.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `What? What place!? Are you talking about... ${this.lunar} ${this.moonlit} ${this.glade}?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.questionMark}`,
            `Hahaha. You're foolish ${this.firedog}. Everything you know is a lie.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `I don't understand... What is going on...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //23
            `${this.questionMark}`,
            `Do not wait until morning. Go now.`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `What..? I can't go now, specially during the night... this land is full of paranormal stuff... at least that's what ${this.duskmaw} told me.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Who are you..? Why does this feel so real.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //26
            `${this.questionMark}`,
            `Who I am does not matter right now. Haha... Now ${this.firedog}, wake up.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //27
            `${this.questionMark}`,
            `Wake up... Wake up... Wake up...`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //28 change bc
            `${this.firedog}`,
            `My head... it hurts... I've never felt pain like this before... I... ... my eyes... no-`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `Ouch... I'm... I'm not dreaming anymore? It's pitch black outside...`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `What was that... that felt so real... Wait... where is ${this.duskmaw}?`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Why isn't he in the cabin? ... Should I really keep going east now..?`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `It feels so wrong... but for some reason I trust that voice in the dreams...`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `Okay... I'll go... The quicker I get to the ${this.temporal} ${this.timber} the better anyways.. despite being really tired...`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `I wonder if ${this.penguini} is still outside.`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //35 open door change bc
            `${this.firedog}`,
            `I should check it out, okay let's go.`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `Hey ${this.penguini}, how's patrolling goin'?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //37
            `${this.penguini}`,
            `Is that you ${this.firedog}? Why are you awake at this hour?`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `Well.. I couldn't really sleep.`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `Have you seen huh... ${this.duskmaw} leaving? He's not in the cabin.`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //40
            `${this.penguini}`,
            `Who?`,
            this.addImage(this.setfiredogTired(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `${this.duskmaw}..?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //42
            `${this.penguini}`,
            `You're the only one in the cabin right now. I'd know if anyone else was there, ya' fool!`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //43
            `${this.penguini}`,
            `If you're trying to scare me that ain't gonna work! Nothing scares the almighty ${this.penguini} ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `(I was alone the whole time?)`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `(Well.. ${this.penguini} doesn't seem to be joking as well... nothing here is making sense... shoot.. I'll figure all of this out later, I need to go now.)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `Okay... Anyways I'm leaving now.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //47
            `${this.penguini}`,
            `Leaving now? I think it's best to warn you about the paranormal activities that happen at this hour out there.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //48
            `${this.penguini}`,
            `You might see ghosts on your way there. Well, if you get killed it ain't my problem, many have gone and never came back ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //49
            `${this.penguini}`,
            `Thanks for the coins ya' fool! Now go if you want to get killed! Hahaha!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatLaugh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //50
            `${this.firedog}`,
            `That's what ${this.duskmaw} had told me...`,
            this.addImage(this.setfiredogPhew(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatLaugh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `Alright... off I go. Stay safe ${this.penguini}.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //52
            `${this.penguini}`,
            `You too, ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
    }
}
export class Map2EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('map3CutsceneCabinNight');
        this.addDialogue( //0
            `${this.firedog}`,
            `Okay, let's rest for a bit in here... That was quite a long journey, ${this.duskmaw} and ${this.penguini} were right, that was really spooky!`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `It's so dark I can barely see anything, but well, this time it seems that no one is in the cabin.`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I should definitely sleep now, I am way too tired...`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Huh? What's this..?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `A letter? To ${this.firedog}!?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `What!? This is from ${this.galadon}! He's been here! I should open this!`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //6 open map
            `${this.firedog}`,
            `Let's see...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `"To ${this.firedog},"`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `"I hope this letter gets to you well. I am sending you this letter to warn you about what lies ahead."`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `"I met an explorer who informed me that internal conflicts within Coral Abyss have led to tightened security."`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `"This means that you will need to move at night if it's convenient for you to do so, as they might confuse you with an enemy."`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `"If you prefer not to wait until nightfall, you can also traverse beneath the waters of Coral Abyss, which happens to also be a shortcut."`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `"There is an exalted sorcerer that can give you temporary powers to stay underwater for a period of time."`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `"You should find him if you so decide to take this shortcut."`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `"${this.galadon}"`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `I see... so I assume ${this.galadon} chose the underwater route...`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Ugh... I am really tired, I'm definitely sleeping here, so I am not waiting until tomorrow when the sun sets again, I'll be wasting too much time.`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `This leaves me with no other option other than going... underwater...`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Let me scroll this letter back up.`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //19 bc to black
            `${this.firedog}`,
            `I'll find more about this exalted sorcerer tomorrow. Let's go to sleep now.`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Ugh.. my head...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `This looks familiar... wait. I'm... I'm here again...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Ugh... I don't like this...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `I must resist...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `No... my eyes...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Not again... my body is paralyzed from fear.. damn it...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //26
            `${this.questionMark}`,
            `Did you miss me ${this.firedog}?`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `What the hell do you want from me? Why am I here? What is this place.`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //28
            `${this.questionMark}`,
            `Soon enough, I'll get out of your filthy body!`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `Filthy body? What does that mean? Enough of this. I need an explanation...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //30
            `${this.questionMark}`,
            `Don't you know? ${this.valdorin} used you! Hahahahaha!`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Used me? How? I've known ${this.valdorin} ever since I was born. He took care of me!`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //32
            `${this.questionMark}`,
            `They blocked your memories.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `What memories?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `You liar! You're not real.`,
            this.addImage(this.setfiredogAngry(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //35
            `${this.questionMark}`,
            `I am very much real. You will soon see how real I am. Now go.`,
            this.addImage(this.setfiredogAngry(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `No. I'm not going until you tell me what's goin-`,
            this.addImage(this.setfiredogAngry(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //37
            `${this.questionMark}`,
            `Wake up...`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `Damn it... you're doing that thing again... my head hurts...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //39
            `${this.questionMark}`,
            `Wake up... Wake up... Wake up...`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `Damn it... my eyes... are closing again...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.game.map3Unlocked = true;
        this.game.saveGameState();
    }
}
// Map 3 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map3Cutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('map3CutsceneCabin');
        this.game.audioHandler.cutsceneMusic.playSound('birdsChirping', true);
        this.addDialogue( //0
            `${this.firedog}`,
            `It's morning now...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `I feel so much more energized now.`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `But it happened again... that dream... why does it feel so real? And what or who is that voice...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Why is this happening to me now ever since I left home...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `I wish there was a way to reach out to ${this.valdorin} and ask him about these dreams...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `But anyways, let's get back to the mission!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `So before I went to sleep... right, ${this.galadon} left the scroll letter for me.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //7 scroll
            `${this.firedog}`,
            `I need to refresh my mind. Let me open the scroll letter again.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Let's see...`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `"There is an exalted sorcerer that can give you temporary powers to stay underwater for a period of time."`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Right. I need to find this sorcerer... I think it's best if I ask ${this.penguini} about this sorcerer.`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //11 change scenary
            `${this.firedog}`,
            `Alright, let's go outside.`,
            this.addImage('scrollLetterMessageGaladon', 1, this.game.width / 2 - 310, 0, 529, 677),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Hello ${this.penguini}, did you sleep well?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `I don't sleep ya' fool! Patrol life I chose fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `Oh okay... Anyways, do you know of an exalted sorcerer around that helps explorers to get past the waters of ${this.coral} ${this.abyss} by any chance?`,
            this.addImage(this.setfiredogPhew(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `Exalted sorcerer? Do you mean ${this.zephyrion}?`,
            this.addImage(this.setfiredogPhew(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `I think so..?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `I received a letter from my friend and he told me to find this sorcerer that can cast a spell on me to temporarily be underwater.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Yes, indeed he was talking about ${this.zephyrion} ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 1, 1300, 79, 590, 610),

        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Oh... so you know this sorcerer!?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //20
            `${this.penguini}`,
            `Yes I do, ya' fool! Let's just say that me and ${this.zephyrion} used to do business back in the days!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatLaugh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Huh? What kind of business?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatLaugh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //22
            `${this.penguini}`,
            `... Highly confidential ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `What... Why even mention it if you're not even gonna say it.. ugh.`,
            this.addImage(this.setfiredogPhew(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //24
            `${this.penguini}`,
            `If you follow this river path and continue to follow up east you will meet ${this.zephyrion}. He can help you.`,
            this.addImage(this.setfiredogPhew(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Okay, great. What does he look like?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //26
            `${this.penguini}`,
            `A sorcerer.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `He looks like a ... sorcerer?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //28
            `${this.penguini}`,
            `Yeah.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `What the hell!? What kind of description is that ${this.penguini}!?`,
            this.addImage(this.setfiredogAngry(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //30
            `${this.penguini}`,
            `Enough said ya' fool!`,
            this.addImage(this.setfiredogAngry(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Whatever, I'll go on my way then. So all I have to do is follow the river path and continue going east.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //32 change scenary
            `${this.firedog}`,
            `Okay let's go!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `Oh.. I see someone.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `Hello there, is this ${this.zephyrion}?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //35
            `${this.zephyrion}`,
            `Who are you? I have never seen you before.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `(Well ${this.penguini} was right, he does look like a sorcerer..)`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `I'm ${this.firedog}. I need you to take me underwater.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //38
            `${this.zephyrion}`,
            `Underwater? I'm sorry I don't know what you're talking about.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionEyesClosed', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `Quit playing games! I know you're ${this.zephyrion}. Look, my friend ${this.galadon} wrote me this letter, he told me to find you.`,
            this.addImage(this.setfiredogAngry2(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionEyesClosed', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //40
            `${this.zephyrion}`,
            `Hmm I see, I see. How many coins do you have?`,
            this.addImage(this.setfiredogAngry2(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `Coins? I don't have any right now...`,
            this.addImage(this.setfiredogCry(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //42
            `${this.zephyrion}`,
            `I'm afraid I won't be able to help you then.`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //43
            `${this.firedog}`,
            `What!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `${this.penguini} told me to go towards this way and I would be able to get your help...`,
            this.addImage(this.setfiredogAngry2(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //45
            `${this.zephyrion}`,
            `Oh, ${this.penguini} directed you to me?`,
            this.addImage(this.setfiredogAngry2(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `Yes, he did.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //47
            `${this.zephyrion}`,
            `Well if he did it's your lucky day, however, you could be lying. Touch my hand.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //48
            `${this.firedog}`,
            `Your hand..?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //49
            `${this.zephyrion}`,
            `Yes, that's the only way I can confirm you're telling me the truth.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //50 change scenary
            `${this.firedog}`,
            `Well... okay...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //51
            `${this.penguini}`,
            `If you follow this river path and continue to follow up east you will meet ${this.zephyrion}. He can help you.`,
            this.addImage(this.setfiredogPhew(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //52
            `${this.firedog}`,
            `Okay, great. What does he look like?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //53
            `${this.penguini}`,
            `A sorcerer.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //54
            `${this.firedog}`,
            `He looks like a ... sorcerer?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //55
            `${this.penguini}`,
            `Yeah.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //56
            `${this.firedog}`,
            `What the hell!? What kind of description is that ${this.penguini}!?`,
            this.addImage(this.setfiredogAngry(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //57
            `${this.penguini}`,
            `Enough said ya' fool!`,
            this.addImage(this.setfiredogAngry(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //58
            `${this.zephyrion}`,
            `I see. ${this.firedog} was telling the truth.`,
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //59
            `${this.zephyrion}`,
            `Hold on... I feel something.`,
            this.addImage('zephyrionDistraught', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //60 change scenary
            `${this.zephyrion}`,
            `What is this?`,
            this.addImage('zephyrionDistraught', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //61
            `${this.zephyrion}`,
            `Where am I? Is this inside ${this.firedog}? His heart?`,
            this.addImage('zephyrionDistraught', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //62
            `${this.zephyrion}`,
            `I feel a presence.`,
            this.addImage('zephyrionDistraught', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //63
            `${this.zephyrion}`,
            `Is that you ${this.firedog}?`,
            this.addImage('zephyrionDistraught', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //64 change scenary
            `${this.questionMark}`,
            `Hahahaha. You filthy sorcerer.`,
            this.addImage('zephyrionDistraught', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //65
            `${this.zephyrion}`,
            `Who's that? What? It got so much darker now?`,
            this.addImage('zephyrionDistraught', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //66
            `${this.questionMark}`,
            `You don't come knock on my door and have the audacity to ask who I am.`,
            this.addImage('zephyrionDistraught', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //67
            `${this.questionMark}`,
            `But I do appreciate the visit! Now, come here!`,
            this.addImage('zephyrionDistraught', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //68
            `${this.zephyrion}`,
            `This is not good, I need to leave quickly.`,
            this.addImage('zephyrionDistraught', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //69
            `${this.questionMark}`,
            `No, you won't.`,
            this.addImage('zephyrionDistraught', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //70
            `${this.questionMark}`,
            `I'm going to kill you, filthy sorcerer.`,
            this.addImage('zephyrionDistraught', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //71
            `${this.zephyrion}`,
            `This is bad.`,
            this.addImage('zephyrionDistraught', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //72 
            `${this.zephyrion}`,
            `I have no other choice.`,
            this.addImage('zephyrionEyesClosed', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //73 change scenary
            `${this.zephyrion}`,
            `Somnolence Shroud: Evanescent Dreamweave!`,
            this.addImage('zephyrionEyesClosed', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //74 change scenary
            `${this.questionMark}`,
            `Oh? He's got tricks, lucky you, ${this.zephyrion}, you've gotten away.`,
        );
        this.addDialogue( //75
            `${this.zephyrion}`,
            `Wha!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //76
            `${this.firedog}`,
            `Huh? Everything okay ${this.zephyrion}?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //77
            `${this.zephyrion}`,
            `(What was that? It was inside ${this.firedog}? Inside of his thoughts? His heart?)`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionDistraught', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //78
            `${this.zephyrion}`,
            `Yeah. Everything is fine. You were telling the truth. ${this.penguini} did in fact tell you to come here.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //79
            `${this.zephyrion}`,
            `In this case, I won't charge you!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionHappy', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //80
            `${this.firedog}`,
            `Really!?`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionHappy', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //81
            `${this.zephyrion}`,
            `Yep! I will need to cast a spell on you in order for you to be able to breathe underwater.`,
            this.addImage(this.setfiredogLaugh(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //82
            `${this.zephyrion}`,
            `But be wary, you must be quick to reach the other side, the spell only lasts 7 minutes and 30 seconds.`,
            this.addImage(this.setfiredogLaugh(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //83
            `${this.zephyrion}`,
            `If you surface back up you will get spotted by the guards of ${this.coral} ${this.abyss}, and they won't hesitate to kill you.`,
            this.addImage(this.setfiredogLaugh(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //84
            `${this.zephyrion}`,
            `So I recommend you to stay underwater and only come out once it's safe.`,
            this.addImage(this.setfiredogLaugh(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //85
            `${this.zephyrion}`,
            `Do you want me to cast the spell on you now?`,
            this.addImage(this.setfiredogLaugh(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //86
            `${this.firedog}`,
            `Wha- Now?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //87
            `${this.firedog}`,
            `Ugh... I hate water... But I have no choice...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //88
            `${this.firedog}`,
            `Okay... I'm all set.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //89 change scenary
            `${this.zephyrion}`,
            `Okay, get ready.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionEyesClosed', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //90
            `${this.zephyrion}`,
            `Hydroaetherial Breath: Aquatic Veil!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionEyesClosed', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //91
            `${this.zephyrion}`,
            `Okay... The spell has been casted. You can breathe underwater now.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //92
            `${this.zephyrion}`,
            `Don't waste too much time here on land! Every second counts!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //93
            `${this.firedog}`,
            `Awesome. Thank you so much for the help ${this.zephyrion}!`,
            this.addImage(this.setfiredogHappy(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //94
            `${this.firedog}`,
            `I'll go now! Adios!`,
            this.addImage(this.setfiredogHappy(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //95 change scenary
            `${this.firedog}`,
            `Woohoo!`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
            this.addImage('zephyrionNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //96
            `${this.zephyrion}`,
            `I wonder what that was.`,
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //97
            `${this.zephyrion}`,
            `That voice. I have never seen that before in all my years of sorcery.`,
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //98 stop sounds
            `${this.zephyrion}`,
            `Was that really inside of him?`,
            this.addImage('zephyrionNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //99
            `${this.zephyrion}`,
            `Haha! You sure are an interesting soul, ${this.firedog}.`,
            this.addImage('zephyrionHappy', 1, 1300, 79, 590, 610),
        );
    }
}
export class Map3EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('map3InsideSubmarine');
        this.game.audioHandler.cutsceneMusic.playSound('submarineSonarUnderwaterSound', true);
        this.addDialogue( //0
            `${this.firedog}`,
            `That was a close call. I almost lost my breath there.`,
            this.addImage(this.setfiredogPhew(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `This space is tight. I'm definitely feeling a little bit claustrophobic in here.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I've never been in a submarine before... What a view!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `But terrifying at the same time!`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `I guess I have to wait for ${this.penguini} to come inside for us to take off.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Which means I probably have some time alone in here.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //6 change scenary at the end
            `${this.firedog}`,
            `I wonder where ${this.galadon} is right now. Hopefully I can catch up to him soon.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //7
            `${this.galadon}`,
            `Ugh... I can barely feel my legs...`,
        );
        this.addDialogue( //8
            `${this.galadon}`,
            `I'm so close to the cabin... I need to get there before I pass out...`,
        );
        this.addDialogue( //9
            `${this.galadon}`,
            `If I lose consciousness here I'm certain to be dead...`,
        );
        this.addDialogue( //10 change scenary
            `${this.galadon}`,
            `Who was that... ugh... I got not time to think now... I'm almost there...`,
        );
        this.addDialogue( //11 
            `${this.penguini}`,
            `Ready to rock and roll ${this.firedog}?`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Oh, we're going now!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `We sure are ya' fool! Buckle up!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //14 sub sound
            `${this.firedog}`,
            `Buckle up!? Do I need to wear a seat belt for this!? Wha-`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `We're on the surface now. We're almost reaching land.`,
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wow, that was quick.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `We're here, you can leave now ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //18 sound
            `${this.firedog}`,
            `Okay, how do I open this thing u-`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //19 change scenary
            `${this.firedog}`,
            `Okay that works.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinBatTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Back on land we are!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Wow! It's so much greener here. I guess we're in ${this.verdant} ${this.vine}.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Good thing I took that underwater shortcut. That should get us closer to the thief. I should keep going.`,
            this.addImage(this.setfiredogHappy(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Let's go!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.game.map4Unlocked = true;
        this.game.saveGameState();
    }
}
// Map 4 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map4Cutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('map4beginningForestView');
        this.game.audioHandler.cutsceneMusic.playSound('birdsChirping', true);
        this.game.audioHandler.cutsceneMusic.playSound('windBreezeSound', true);
        this.addDialogue( //0
            `${this.firedog}`,
            `It still feels unreal that I am out here, outside my home.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `I don't understand why ${this.valdorin} wouldn't let me out for pretty much my whole life... I know there is still tension amongst lands, but...`,
            this.addImage(this.setfiredogSad(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `This is quite a sighting to see... I mean, being in that submarine was quite the experience... heck! Who knew breathing underwater was possible!?`,
            this.addImage(this.setfiredogHappy(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `I really could be an explorer, and see every corner of every land. When I get back home, with the ${this.temporal} ${this.timber}, I wonder what life will be like.`,
            this.addImage(this.setfiredogHappy(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `After all these amazing experiences, there is no way I want to be stuck again inside ${this.lunar} ${this.moonlit} ${this.glade}! Haha!`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Hm? What's this?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `These... these are footsteps?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `I wonder whose footsteps this is.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Whoever it is, it's way bigger than my feet, haha!`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `These look rather fresh... I would say about a couple hours old.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `They seem to disappear up ahead. Hm... Who could this be.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `What...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `My head.`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `No... it's happening while I'm awake now?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `My vision is fading... away... damn it...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `Ugh... I'm not allowing this to happen again...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Ughh! The pain is too unbearable to be able to stop it from coming.`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `Aaaaaaahh!`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `I'm here again...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `(Okay, remain calm... let's figure out why this is happening.)`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `What do you want from me?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.questionMark}`,
            `I want the same thing you want!`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `What..?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //23
            `${this.questionMark}`,
            `You're too naïve.`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //24
            `${this.questionMark}`,
            `${this.valdorin} used your body. Because of him, I'm stuck here, inside your filthy body!`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `What!? ${this.valdorin}? He didn't do anything. I would know if he did!`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //26
            `${this.questionMark}`,
            `No. You wouldn't know. He used your body for his filthy experiments, with the ${this.cryptic} ${this.token}!`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `That can't be possible...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //28
            `${this.questionMark}`,
            `You see... we both have the same goal. There is nothing you can do to stop what's coming your way.`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //29
            `${this.questionMark}`,
            `Now go.`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Wait, no..! I still have more questions to ask... what you're saying about ${this.valdorin} makes no sense, he would never do such thing!`,
            this.addImage(this.setfiredogAngry(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `The ${this.cryptic} ${this.token} was always kept in the safe, it was never used for... any experiment whatsoever!`,
            this.addImage(this.setfiredogAngry(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `Why are you in my mind? Why have these dreams been happening ever since I left ${this.lunar} ${this.moonlit} ${this.glade}? Why are you doing this to me?`,
            this.addImage(this.setfiredogAngry(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //33
            `${this.questionMark}`,
            `Have you ever wondered why ${this.valdorin} kept you inside ${this.lunar} ${this.moonlit} ${this.glade}, fool? Now, don't waste my time any further.`,
            this.addImage(this.setfiredogAngry(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //34
            `${this.questionMark}`,
            `Go get what I need to come back to.`,
            this.addImage(this.setfiredogAngry(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //35
            `${this.questionMark}`,
            `Now, wake up...`,
            this.addImage(this.setfiredogAngry(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `Ugh... not again...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //37
            `${this.questionMark}`,
            `Wake up... Wake up... Wake up...`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `Ugh... I'm back in the forest... awake...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `What that voice said... about ${this.valdorin}...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `I don't trust that voice one bit... But why would it lie to me..?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `Ugh... is this voice the reason ${this.valdorin} kept me inside ${this.lunar} ${this.moonlit} ${this.glade} all this time?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `"Go get what I need to come back to." - What did the voice mean by that?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //43
            `${this.firedog}`,
            `This is such a weird feeling. But I feel like I'm getting closer to the token.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `I need to keep going. Maybe I can find ${this.galadon} along the way. Perhaps he can give me the answers I seek right now.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `I wonder how everyone is doing back home... ${this.valdorin}... ${this.quilzorin}... what is happening to me..?`,
            this.addImage(this.setfiredogSad(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //46 switch scenary
            `${this.firedog}`,
            `Okay... let's get through ${this.verdant} ${this.vine}, that's what I need to focus on now.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //47
            `${this.quilzorin}`,
            `How do you feel ${this.valdorin}?`,
            this.addImage('quilzorinNormal', 1, 0, 79, 590, 610),
        );
        this.addDialogue( //48
            `${this.valdorin}`,
            `I feel better, seems like I'll make a full recovery.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //49
            `${this.quilzorin}`,
            `I'm glad to hear that.`,
            this.addImage('quilzorinNormal', 1, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //50
            `${this.quilzorin}`,
            `Do you think ${this.firedog} will be okay outside of our land?`,
            this.addImage('quilzorinExplaining', 1, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //51
            `${this.valdorin}`,
            `I hope so. It's not like we have much of a choice by letting him stay here now...`,
            this.addImage('quilzorinExplaining', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //52
            `${this.quilzorin}`,
            `You didn't tell him, did you ${this.valdorin}?`,
            this.addImage('quilzorinNormal', 1, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //53 play sound
            `${this.valdorin}`,
            `No. How would we? I do believe ${this.firedog} is the only one who can stop him.`,
            this.addImage('quilzorinNormal', 1, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //54
            `${this.quilzorin}`,
            `Do you think it was ${this.elyvorg}?`,
            this.addImage('quilzorinNormal', 1, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //55
            `${this.valdorin}`,
            `Yes... I believe it was. He came back for revenge for what we did 10 years ago.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //56
            `${this.quilzorin}`,
            `The ${this.project} ${this.cryptoterra} ${this.genesis} experiments...`,
            this.addImage('quilzorinNormal', 1, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //57
            `${this.valdorin}`,
            `Indeed. I was so astonished by the ${this.cryptic} ${this.token} back then... that I had decided to create the ${this.project} ${this.cryptoterra} ${this.genesis}.`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //58
            `${this.valdorin}`,
            `A project involving the implementation of the ${this.cryptic} ${this.token} inside children's hearts in order to create... a weapon of mass destruction.`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //59
            `${this.valdorin}`,
            `All the children died during the implementation. Their bodies didn't know how to adapt to the power...`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //60
            `${this.valdorin}`,
            `After many failed experiments, we finally had a survivor. ${this.elyvorg}.`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //61
            `${this.valdorin}`,
            `His body was the first one to adapt to the intense power of the ${this.cryptic} ${this.token}. I thought I had succeeded but then it all started going downhill.`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //62
            `${this.valdorin}`,
            `He was adapting well at first. He seemed to have perfect control of all elements, especially electricity and dark matter.`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //63
            `${this.valdorin}`,
            `We had put him through many tests, and he passed with ease. He was what we had hoped for, to be an invincible machine.`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //64
            `${this.valdorin}`,
            `A machine that would put fear in every other land. That was the goal. We had ultimate power.`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //65
            `${this.valdorin}`,
            `We trained him to be strong, but the stronger he became, the more evil he became. It came to a point where he killed a few of our guards out of control.`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //66
            `${this.valdorin}`,
            `This is when I knew that he could no longer possess this power. We removed the ${this.cryptic} ${this.token} out of his heart.`,
            this.addImage('valdorinFistUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //67
            `${this.valdorin}`,
            `After the surgery one of the nurses opened the door to check up on ${this.elyvorg}.`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //68
            `${this.valdorin}`,
            `Only to find the bed empty with a note.`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //69
            `${this.valdorin}`,
            `"I will be back to kill you, ${this.valdorin}."`,
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //70
            `${this.valdorin}`,
            `He was a failed experiment. And he was gone. He never came back after that.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //71
            `${this.valdorin}`,
            `We continued with the ${this.project} ${this.cryptoterra} ${this.genesis} for one more year after that incident.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //72
            `${this.valdorin}`,
            `After many failed experiments we had another survivor... ${this.firedog}...`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //73
            `${this.valdorin}`,
            `With more knowledge about the risks we decided to try different methods for ${this.firedog} to control his power.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //74
            `${this.valdorin}`,
            `It started well... He seemed to have perfect control over all earth elements, although he was lacking perfecting the elements ${this.elyvorg} had mastered.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //75
            `${this.valdorin}`,
            `But to no surprise, the same thing had started to happen to ${this.firedog}. We spotted the signs early on...`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //76
            `${this.valdorin}`,
            `So we removed the ${this.cryptic} ${this.token} from his heart. Before it caused any more harm.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //77
            `${this.valdorin}`,
            `Miraculously, ${this.firedog} made a good recovery. I did however, erase his memories revolving the experiments we did on him.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //78
            `${this.valdorin}`,
            `We decided to put an end to the ${this.project} ${this.cryptoterra} ${this.genesis} for good.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //79
            `${this.valdorin}`,
            `And as we thought everything was finally over, we noticed that ${this.firedog} had kept his fire element powers.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //80
            `${this.valdorin}`,
            `It is possible that ${this.elyvorg} could've also kept some of his powers too but we wouldn't know because he ran away and never came back.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //81
            `${this.valdorin}`,
            `Although, I believe he kept at least his electricity abilities. When I got striked with this electricity attack in the safe room...`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //82
            `${this.valdorin}`,
            `It reminded me of ${this.elyvorg} when he had the token inside his heart. I'm not sure what other powers he must've kept, if that was indeed him...`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //83
            `${this.valdorin}`,
            `To this day no one understands how ${this.firedog} kept his fire powers, as the doctors had completely removed the ${this.cryptic} ${this.token} out of his heart.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //84
            `${this.valdorin}`,
            `It was a shame that nothing could replace the original ${this.temporal} ${this.timber} from the ${this.cryptic} ${this.token}.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //85
            `${this.valdorin}`,
            `But something extremely odd had started to happen.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //86
            `${this.quilzorin}`,
            `The evil dreams, right.`,
            this.addImage('quilzorinSurprised', 1, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //87
            `${this.valdorin}`,
            `Yes. The evil dreams. ${this.firedog} had started to get these dreams. The more he had them the less he became himself.`,
            this.addImage('quilzorinSurprised', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //88
            `${this.valdorin}`,
            `This was definitely a side effect from having the ${this.cryptic} ${this.token} inside of him.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //89
            `${this.valdorin}`,
            `No doctor could understand why he had these dreams and what was causing them.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //90
            `${this.valdorin}`,
            `One of our sorcerers had came up with a solution. Currently, ${this.lunar} ${this.moonlit} ${this.glade} is surrounded by a protective layer built by our sorcerers.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //91
            `${this.valdorin}`,
            `This magical layer is preventing outside hidden entities from entering the land, and it also has the ability to detect unknown souls that trespass it.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //92
            `${this.valdorin}`,
            `This same exact magical layer is used to protect the safe room, where the ${this.cryptic} ${this.token} was.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //93
            `${this.valdorin}`,
            `${this.firedog} slowly started to have less of these dreams, and then.. he just became normal again.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //94
            `${this.valdorin}`,
            `This is why I believe that he is somehow connected to the token, even when it had been completely removed from him.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //95
            `${this.valdorin}`,
            `The magical layer blocked the energy of the ${this.cryptic} ${this.token} from escaping the safe room.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //96
            `${this.valdorin}`,
            `It's believed that this energy is what caused ${this.firedog} to have the evil dreams.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('ValdorinTalking', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //97
            `${this.valdorin}`,
            `No one truly understands it. Even after all these centuries, the ${this.cryptic} ${this.token} is still a mystery.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //98
            `${this.valdorin}`,
            `This is why I did not want him to leave the land after all these years. He doesn't seem to really remember what had happened.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //99
            `${this.valdorin}`,
            `The longer he remains out there, unprotected, the more he will be consumed by evil.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //100
            `${this.valdorin}`,
            `But I had to let him go. He might be the only one who can stop ${this.elyvorg}.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //101
            `${this.valdorin}`,
            `If ${this.elyvorg} was indeed the individual who stole the ${this.cryptic} ${this.token}, it would explain why he wasn't detected by the magical layer.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //102
            `${this.valdorin}`,
            `I also do believe he was the one who destroyed the traps 2 weeks ago. He was most likely testing our security... and striked at its weaknesses.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinCrossedArms', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //103
            `${this.valdorin}`,
            `But I also wonder why he didn't kill me when he had the chance to. After all, he left that note years ago...`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinFistUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //104
            `${this.quilzorin}`,
            `Could it be that whatever he is planning is way worse than having the chance to kill you?`,
            this.addImage('quilzorinScared', 1, 0, 79, 590, 610),
            this.addImage('valdorinFistUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //105
            `${this.valdorin}`,
            `I believe that is the case.`,
            this.addImage('quilzorinScared', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinFistUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //106
            `${this.valdorin}`,
            `I do regret the ${this.project} ${this.cryptoterra} ${this.genesis}. I do regret putting these children in pain, and many lives have been taken because of me.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinFistUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //107
            `${this.valdorin}`,
            `That is something I cannot erase now. And it seems karma is coming back to me...`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //108
            `${this.valdorin}`,
            `Wherever ${this.firedog} might be. I hope he manages to get the token back to us.`,
            this.addImage('quilzorinNormal', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //109
            `${this.quilzorin}`,
            `We all hope so...`,
            this.addImage('quilzorinNormal', 1, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //110
            `${this.quilzorin}`,
            `I wonder where ${this.firedog} is right now.`,
            this.addImage('quilzorinNormal', 1, 0, 79, 590, 610),
            this.addImage('valdorinNormal', 0.7, 1300, 79, 590, 610),
        );
    }
}
export class Map4EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('map4CabinEndCutscene');
        this.game.audioHandler.cutsceneMusic.playSound('blizzardWindFireplace', true);
        this.addDialogue( //0
            `${this.threeDots}`,
            `So you've managed to catch up to me I see, ouch... haha...`,
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Is that you ${this.galadon}!?`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `WHAT HAPPENED!? Who... who could've done this to you!?`,
            this.addImage(this.setfiredogCry(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //3
            `${this.galadon}`,
            `I'm glad to see you here ${this.firedog}...`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //4
            `${this.galadon}`,
            `Don't worry, I'm fine...`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //5
            `${this.galadon}`,
            `I was trying to get through ${this.verdant} ${this.vine}...`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //6
            `${this.galadon}`,
            `Everything was going fine... I was making progress through the jungle when I spotted someone up ahead.`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `What did you see?`,
            this.addImage(this.setfiredogCry(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //8
            `${this.galadon}`,
            `I saw a hooded individual up ahead. I thought it could perhaps be an explorer at first, so I called for them.`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //9
            `${this.galadon}`,
            `But... as soon as they heard me they instantly turned around and attacked me with a vicious electric attack that shocked my whole nervous system in an instant.`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //10
            `${this.galadon}`,
            `I never felt pain like that before. That couldn't possibly be an explorer...`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //11
            `${this.galadon}`,
            `Luckily, I was near the cabin, so with all my remaining strength, I somehow managed to get here.`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //12
            `${this.galadon}`,
            `Thankfully, there were some medical kits laying around, so I used some of it to cover my wounds.`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //13
            `${this.galadon}`,
            `I'm feeling better now but it will take me some time to be able to move again properly... my legs still feels numb from the attack.`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `This is horrible... I can't believe this...`,
            this.addImage(this.setfiredogCry(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `Why would anyone do this to you?`,
            this.addImage(this.setfiredogCry(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //16
            `${this.galadon}`,
            `I don't know... But as I was resting in this cabin I had some time to think of some possible theories.`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `What theories!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //18
            `${this.galadon}`,
            `Well... do you remember how ${this.valdorin} was attacked?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Hmm...`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //20 change scenary
            `${this.firedog}`,
            `Now that you mention it, he did say...`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //21 change scenary
            `${this.valdorin}`,
            `A dark-hooded figure knocked me down with some sort of electric attack before I could use any of my abilities.`,
            this.addImage('valdorinSurprised', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `That's right! He was attacked by a dark-hooded figure, who used an electric attack as well..!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `So this means that you were most likely attacked by the same perpetrator..!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //24
            `${this.galadon}`,
            `Exactly. That is what I was thinking...`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //25
            `${this.galadon}`,
            `But if indeed it that was the thief who stole the ${this.cryptic} ${this.token}, then this is horrible news ${this.firedog}.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Oh, how come ${this.galadon}?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //27
            `${this.galadon}`,
            `This hooded individual is going towards... ${this.infernal} ${this.crater} ${this.peak}.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Wha! You're right... does that mean that...`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //29
            `${this.galadon}`,
            `Yep... that means that whoever is behind that hood most likely knows about the ${this.temporal} ${this.timber}, and even worse, its location.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //30
            `${this.galadon}`,
            `So this situation has gone from bad to worse. We really don't have any more time to waste ${this.firedog}.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `How do they know about the location of the ${this.temporal} ${this.timber}? How did they even know about the ${this.cryptic} ${this.token} in the first place...`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //32
            `${this.galadon}`,
            `Trust me ${this.firedog}, I have the same questions too... But when we catch up to them and get the token back, we'll get our answers.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `I see...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `Will you be able to come with me ${this.galadon}?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //35
            `${this.galadon}`,
            `I wish I could, but it's definitely going to take me some time to recover.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //36
            `${this.galadon}`,
            `The cave is not too far off anymore ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `I understand. Is anybody from our home land ahead of us?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //38
            `${this.galadon}`,
            `I don't think so. I'm pretty sure we're closer to the cave than any other individual from ${this.lunar} ${this.moonlit} ${this.glade} on this mission.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //39
            `${this.galadon}`,
            `We both took the shortcut underwater. That saved us at least a full day. I'm glad I sent you that letter back in ${this.coral} ${this.abyss}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //40
            `${this.galadon}`,
            `Ouch... my body...`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `Are you okay ${this.galadon}!?`,
            this.addImage(this.setfiredogCry(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //42
            `${this.galadon}`,
            `Yeah... I just still feel the pain from the attack...`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //43
            `${this.galadon}`,
            `But I'll be fine...`,
            this.addImage(this.setfiredogCry(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `(Whoever did this to you, ${this.galadon}, is going to pay for it..)`,
            this.addImage(this.setfiredogAngry(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `${this.galadon}..`,
            this.addImage(this.setfiredogSad(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //46
            `${this.galadon}`,
            `It's okay, I'll survive... For now, you should also rest for a couple minutes before you go.`,
            this.addImage(this.setfiredogSad(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `Sounds like a plan.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.game.map5Unlocked = true;
        this.game.saveGameState();
    }
}
// Map 5 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map5Cutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('map4CabinEndCutscene');
        this.game.audioHandler.cutsceneMusic.playSound('blizzardWindFireplace', true);
        this.addDialogue( //0
            `${this.firedog}`,
            `Okay, I think I've rested long enough. I should get going now, ${this.galadon}.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `(Oh, I just remembered.)`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `(I should ask ${this.galadon} about the dreams I'm having before I go.)`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `(Maybe he can help me understand what is going on with me.)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `${this.galadon}, before I go, I have a question. I have been having these dreams... not just dreams, but visions... where I can feel my head burning...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `And as soon as I close my eyes and open them again I wake up in this dark room I've never seen before.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `And I start hearing this voice coming from the door in this room...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `This is harder to explain than I thought... but have you also been having these dreams or is it just me?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //8
            `${this.galadon}`,
            `That's definitely weird. I haven't had any dreams or visions.`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `(Hm.. I had a feeling it was just me... but why me..)`,
            this.addImage(this.setfiredogSad(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `I see... do you know what could be causing them?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //11
            `${this.galadon}`,
            `I don't think so... I've never heard about this from anyone, I'm sorry I'm not much of help right now.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `It's okay, I figured it was worth asking you regardless.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Okay, I guess it's time for me to go. We've got no time to waste anymore.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //14
            `${this.galadon}`,
            `Be careful ${this.firedog}. ${this.springly} ${this.lemony} is known for it's tropical bipolar weather.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `I should be fine, a little bit of rain isn't going to hurt me!`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //16
            `${this.galadon}`,
            `You might be right about that, the rain won't hurt you, but the enemies you might find along the way might get angrier once it starts raining.`,
            this.addImage(this.setfiredogLaugh(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //17
            `${this.galadon}`,
            `Just be cautious when it starts raining...`,
            this.addImage(this.setfiredogLaugh(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Got it!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `(So after ${this.springly} ${this.lemony} I'll finally reach ${this.infernal} ${this.crater} ${this.peak}.)`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `(We're almost there.)`,
            this.addImage(this.setfiredogAngry2(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Okay... Catch up to me when you feel better, ${this.galadon}.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `I'll go now.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.galadon}`,
            `Sounds good. Be safe ${this.firedog}, be careful out there.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('galadonHurt', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Will do!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('galadonHurt', 0.7, 1300, 79, 590, 610),
        );
    }
}
export class Map5EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('map5insideCabin');
        this.game.audioHandler.cutsceneMusic.playSound('birdsChirping', true);
        this.addDialogue( //0
            `${this.firedog}`,
            `Well, it seems there's no one in the cabin but me. I'll rest in here for a bit...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `These past few days have been exhausting...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `In a way, I've experienced more in these past couple of days than I ever have in my whole life.`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `I need to talk to ${this.valdorin} when I get home. Why was I specifically prohibited from going outside our land?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `I understand it's dangerous, but I've been doing fine so far...`,
            this.addImage(this.setfiredogSad(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `But... I also want to ask him about the dreams I've been having.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Speaking of the dreams, I haven't had any dreams nor visions recently.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `But I don't want to speak too soon. I don't want to jinx it.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Now that I've got some minutes alone, let's think and try to connect the dots about what's happening.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `So, someone steals the ${this.cryptic} ${this.token} from the safe room. The guards and ${this.valdorin} get knocked out.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Then on my way to the cave, near ${this.nightfall} ${this.city} ${this.phantom} is when I start getting these weird vivid dreams.`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `That place was too haunted! Heck! ${this.duskmaw} could've been a ghost. I mean... I never saw him again...`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `But then I had that vision when I left the submarine and was in ${this.verdant} ${this.vine}, when I found the footsteps.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `So now I know that it doesn't only happen during my sleep, but it can happen when I'm awake as well.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `I wonder whose footsteps could've that been from?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `When I caught up to ${this.galadon}, he was badly injured because of a hooded individual that attacked him.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Which could've been the thief that stole the ${this.cryptic} ${this.token}.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `And if it was the thief, it seems they know where the ${this.temporal} ${this.timber} is... well, they are heading towards the direction of the cave. What are the odds?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `But only the higher-ups inside ${this.lunar} ${this.moonlit} ${this.glade} know where the ${this.temporal} ${this.timber} is.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `So perhaps whoever did this, used to, or still does live in ${this.lunar} ${this.moonlit} ${this.glade}?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Maybe it is one of the higher-ups. But that wouldn't make sense... no one went missing. Perhaps someone leaked this information to an enemy?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `There's so much to unfold. Even the voice...`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `The voice mentioned ${this.valdorin} used my body for experiments.`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `I don't fully understand how this could be possible.`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `But could that be true? Or am I going crazy?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Could it be possible that ${this.valdorin} knows about this voice somehow?`,
            this.addImage(this.setfiredogNormalQuestionMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `I'm starting to think that it cannot be a coincidence that the dreams and visions started happening right after I left ${this.lunar} ${this.moonlit} ${this.glade}.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `Now that I think of it, after I touched the footprints, it seemed to trigger the vision.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `What if I tried touching something here...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `It would be really helpful if I could know how the dreams and visions are being triggered so I can prevent it.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Okay... let's touch.. hm... the scroll letter ${this.galadon} wrote for me!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Hmm... Focus...`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
            this.addImage("scrollLetterMessageGaladonClosed", 1, 705, 465, 108, 75),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `... ... ...`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
            this.addImage("scrollLetterMessageGaladonClosed", 1, 705, 465, 108, 75),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `Nothing happened...`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage("scrollLetterMessageGaladonClosed", 1, 705, 465, 108, 75),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `Oh well... at least I tried.`,
            this.addImage(this.setfiredogSad(), 1, 0, 79, 590, 610),
            this.addImage("scrollLetterMessageGaladonClosed", 1, 705, 465, 108, 75),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `Hopefully ${this.galadon} catches up to me soon so we can go inside the cave together.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage("scrollLetterMessageGaladonClosed", 1, 705, 465, 108, 75),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `Alright. Let's rest for a couple minutes in this cabin before I leave.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage("scrollLetterMessageGaladonClosed", 1, 705, 465, 108, 75),
        );
        this.game.map6Unlocked = true;
        this.game.saveGameState();
    }
}
// Map 6 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map6Cutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('map1blackBackground');
        this.addDialogue( //0
            `${this.questionMark}`,
            `Hahahaha. We're almost there... Soon it'll be all over... And a new world will begin!`,
        );
        this.addDialogue( //1
            `${this.questionMark}`,
            `No one is going to stop you.`,
        );
        this.addDialogue( //2
            `${this.questionMark}`,
            `And everyone will suffer!`,
        );
        this.addDialogue( //3
            `${this.questionMark}`,
            `Space-time will be reshaped into whatever you want!`,
        );
        this.addDialogue( //4
            `${this.questionMark}`,
            `And you'll have full control of the dimensional space!`,
        );
        this.addDialogue( //5
            `${this.questionMark}`,
            `Once we connect the ${this.cryptic} ${this.token} to the ${this.temporal} ${this.timber}, the world will be at your knees!`,
        );
        this.addDialogue( //6
            `${this.questionMark}`,
            `You've done well so far ${this.elyvorg}. I'm impressed.`,
        );
        this.addDialogue( //7
            `${this.elyvorg}`,
            `They'll all pay for what they've done.`,
        );
        this.addDialogue( //8 sound
            `${this.questionMark}`,
            `Indeed, they will!`,
        );
        this.addDialogue( //9
            `${this.elyvorg}`,
            `It's so bright... and so beautiful...`,
        );
        this.addDialogue( //10
            `${this.elyvorg}`,
            `Who would know that something so astonishing could destroy the whole world.`,
        );
        this.addDialogue( //11
            `${this.questionMark}`,
            `It'll be even shinier once you find the ${this.temporal} ${this.timber}.`,
        );
        this.addDialogue( //12
            `${this.elyvorg}`,
            `I don't doubt it.`,
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Okay, I feel a bit more refreshed now!`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `I know ${this.galadon} said he would take some time to recover, but I had small hopes to see him opening that door.`,
            this.addImage(this.setfiredogSad(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `I guess I'll be alone for this last journey. I'll go now then.`,
            this.addImage(this.setfiredogSad(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wha- Is that you ${this.galadon}!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `Do I look like a ${this.galadon} to you?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinGunUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Oh... Hi ${this.penguini}, what's going on?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinGunUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `Nothing, nothing. Are you leaving now ya' fool?`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinGunTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Yes, I was just about to leave actually.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinGunTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.penguini}`,
            `I see. Let me take you to the safest path. There's loads of dead ends in ${this.infernal} ${this.crater} ${this.peak}.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinGunTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //22
            `${this.penguini}`,
            `So if you want to save time, I'll show you the path you need to take.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinGunTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Oh, that's so kind of you ${this.penguini}! Sure thing!`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
            this.addImage('penguinGunTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //24
            `${this.penguini}`,
            `Stop saying that ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinGunUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Haha, I know you care about me deep inside ${this.penguini}!`,
            this.addImage(this.setfiredogLaugh(), 1, 0, 79, 590, 610),
            this.addImage('penguinGunUp', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //26
            `${this.penguini}`,
            `Whatever you say, ya' fool.`,
            this.addImage(this.setfiredogLaugh(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinGunTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //27
            `${this.penguini}`,
            `Now, follow me.`,
            this.addImage(this.setfiredogLaugh(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinGunTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //28
            `${this.penguini}`,
            `Okay, now that we've entered ${this.infernal} ${this.crater} ${this.peak}, this is the most optimal path to get to the other side.`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinGunTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //29
            `${this.penguini}`,
            `Be careful with the enemies in here. And don't get lost ya' fool!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinGunTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `I see. Thank you for this ${this.penguini}! I would've definitely gotten lost if you didn't lead me here.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinGunTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Wait... do I have to pay you for this?`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinGunTalkNormal', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //32
            `${this.penguini}`,
            `No. Free of charge this time. Although you probably won't make it out alive ya' fool! Hahahaha!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinGunLaugh', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `Those are very reasurring words ${this.penguini}..`,
            this.addImage(this.setfiredogPhew(), 1, 0, 79, 590, 610),
            this.addImage('penguinGunLaugh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `Anyways, I'll be going now. I'll try to keep my distance from the active volcanos!`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
            this.addImage('penguinGunLaugh', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //35 fade in and out
            `${this.penguini}`,
            `Goodluck out there ${this.firedog}, adios!`,
            this.addImage(this.setfiredogNormal(), 0.7, 0, 79, 590, 610),
            this.addImage('penguinGunTalkNormal', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `This is it. This is ${this.infernal} ${this.crater} ${this.peak}.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `Everything has led up to this moment... Let's find the cave.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
    }
}
export class Map6EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('map1blackBackground');
        this.addDialogue( //0
            `${this.firedog}`,
            `Where did ${this.elyvorg} go..? It's so dark in here. I can't see anything...`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `It's scorching hot in here... There's lava inside this cave...`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I feel so weird being here... It feels like I've been here before...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //3 dream sound
            `${this.firedog}`,
            `I've got no time to waste. Let's stop ${this.elyvorg} from getting to the ${this.temporal} ${this.timber} before it's too late.`,
            this.addImage(this.setfiredogNormal(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Ouch... my head...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //5 dream sound
            `${this.firedog}`,
            `No... not now... it feels so much stronger now...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `The pain is unbearable... damn it... no...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //7 dream sound
            `${this.firedog}`,
            `This has to be the worst... timing... eve-`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //8 dream sound
            `${this.questionMark}`,
            `Hahahaha. We're here.`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //9 dream sound
            `${this.questionMark}`,
            `Finally. I've waited for this moment for a long time.`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //10
            `${this.questionMark}`,
            `You will soon be nothing but a sacrifice, and I will be reunited with the ${this.cryptic} ${this.token} once again after so long!`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `What... Is this why you wanted me here quickly?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Damn it... I see...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `I can't believe this...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `So you want to kill me here... as long as I'm alive the ${this.cryptic} ${this.token} won't be as powerful...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //15
            `${this.questionMark}`,
            `Kill you? Hahahahaha! You were already dead from the moment the fragments got stuck in your heart years ago!`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //16
            `${this.questionMark}`,
            `You'll be nothing but a sacrifice.`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `What... but doesn't ${this.elyvorg} also have fragments in his body?`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //18
            `${this.questionMark}`,
            `Yes... but the difference between you and ${this.elyvorg} is that ${this.elyvorg} is far more evil. Far stronger than you...`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //19
            `${this.questionMark}`,
            `He'll use his body as a vessel for the ${this.cryptic} ${this.token} with its full power from the ${this.temporal} ${this.timber}.`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Damn it...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //21
            `${this.questionMark}`,
            `There is nothing you can do to stop me. I can feel the energy of the ${this.temporal} ${this.timber} nearby...`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //22
            `${this.questionMark}`,
            `Hahahahaha, yes... true power will be once again reignited!`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Ugh...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `(This isn't good... I'm feeling less of myself the more time passes by..)`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `(This can't be the end of me..)`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `(I need to come back to reality..)`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //27
            `${this.questionMark}`,
            `You can't! Hahahaha! You're stuck in here with me now. The sole presence of the ${this.temporal} ${this.timber} is resonating so much power to me.`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //28
            `${this.questionMark}`,
            `I can keep you here until your physical body is killed, and all of me is going to be returned to where it belongs.`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //29
            `${this.questionMark}`,
            `I do have to thank ${this.valdorin} for allowing you to come here! Such a fool! Hahahahaha!`,
            this.addImage(this.setfiredogHeadache(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Damn it...`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `(I can't snap out of it... my conciousness is slowly fading away..)`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //32 change scenary
            `${this.firedog}`,
            `(I'm sorry ${this.galadon}... but this might be it for me... I'm stuck in here..)`,
            this.addImage(this.setfiredogHeadache(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //33
            `${this.galadon}`,
            `${this.penguini} are you okay? Your brother from ${this.springly} ${this.lemony} told me what happened. I was faster than your brothers but they'll arrive shortly.`,
        );
        this.addDialogue( //34
            `${this.penguini}`,
            `Ugh... yes, ${this.galadon}... ${this.firedog} went inside... you should go follow him... whoever attacked me is truly strong.`,
        );
        this.addDialogue( //35
            `${this.galadon}`,
            `I'll go now, we don't have much time.`,
        );
        this.addDialogue( //36 change scenary
            `${this.galadon}`,
            `(I hope you managed to stop him, ${this.firedog}. I'll be there soon.)`,
        );
        this.addDialogue( //37 
            `${this.elyvorg}`,
            `They really tried to hide it away from me, as if that would make it harder to find the ${this.temporal} ${this.timber}.`,
        );
        this.addDialogue( //38 change scenary
            `${this.elyvorg}`,
            `But due to your lack of incompetence ${this.valdorin}, I can feel where it is.`,
        );
        this.addDialogue( //39 change scenary
            `${this.elyvorg}`,
            `I can see now. Let's get closer to it.`,
        );
        this.addDialogue( //40
            `${this.elyvorg}`,
            `So this is it... the ${this.temporal} ${this.timber}.`,
        );
        this.addDialogue( //41
            `${this.elyvorg}`,
            `It won't be at 100% power because ${this.firedog} still has fragments of the token inside of him.`,
        );
        this.addDialogue( //42
            `${this.elyvorg}`,
            `But I can activate the ${this.cryptic} ${this.token} now, and kill him later.`,
        );
        this.addDialogue( //43 change scenary
            `${this.elyvorg}`,
            `So, let's fit the ${this.cryptic} ${this.token} here.`,
        );
        this.addDialogue( //44 change scenary
            `${this.elyvorg}`,
            `Now, show me true power.`,
        );
        this.addDialogue( //45
            `${this.elyvorg}`,
            `The whole ground is shaking. Astonishing power.`,
        );
        this.addDialogue( //46
            `${this.elyvorg}`,
            `Truly magnificent.`,
        );
        this.addDialogue( //47
            `${this.elyvorg}`,
            `Hahaha... Hahahahahahahaha!`,
        );
        this.addDialogue( //48 change scenary
            `${this.elyvorg}`,
            `Now the ${this.cryptic} ${this.token} is activated. The last step is to replace my own heart with it.`,
        );
        this.addDialogue( //49
            `${this.elyvorg}`,
            `But first, I need to kill you, ${this.firedog}...`,
        );
        this.addDialogue( //50
            `${this.elyvorg}`,
            `Once you're dead the ${this.cryptic} ${this.token} will become whole again, and I will attain the power of a God!`,
        );
        this.addDialogue( //51 change scenary
            `${this.elyvorg}`,
            `I've won. You're all going to die now.`,
        );
        this.addDialogue( //52
            `${this.quilzorin}`,
            `The ground... the ground is shaking...`,
            this.addImage('quilzorinScared', 1, 0, 79, 590, 610),
            this.addImage('valdorinSurprised', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //53
            `${this.quilzorin}`,
            `Does that mean...`,
            this.addImage('quilzorinScared', 1, 0, 79, 590, 610),
            this.addImage('valdorinSurprised', 0.7, 1300, 79, 590, 610),
        );
        this.addDialogue( //54
            `${this.valdorin}`,
            `Yes... ${this.elyvorg} managed to find the ${this.temporal} ${this.timber}...`,
            this.addImage('quilzorinScared', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinSurprised', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //55 change scenary
            `${this.valdorin}`,
            `We were too late...`,
            this.addImage('quilzorinScared', 0.7, 0, 79, 590, 610),
            this.addImage('valdorinFistUp', 1, 1300, 79, 590, 610),
        );
        this.addDialogue( //56
            `${this.galadon}`,
            `Wow!? The ground is shaking so aggresively... What is happening? This is not good...`,
            this.addImage('galadonScaredHurt', 1, 0, 79, 590, 610),
        );
        this.addDialogue( //57
            `${this.galadon}`,
            `Wait... ${this.firedog}, is that you!?`,
            this.addImage('galadonScaredHurt', 1, 0, 79, 590, 610),
        );
        this.addDialogue( //58
            `${this.galadon}`,
            `Hey snap out of it! Wake up ${this.firedog}.`,
            this.addImage('galadonScaredHurt', 1, 0, 79, 590, 610),
        );
        this.addDialogue( //59 change scenary
            `${this.galadon}`,
            `What's happening? Why aren't you waking up?`,
            this.addImage('galadonScaredHurt', 1, 0, 79, 590, 610),
        );
        this.addDialogue( //60
            `${this.firedog}`,
            `Wha- The ground... what's going on...`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //61
            `${this.questionMark}`,
            `After centuries... finally... this world shall know pain.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //62
            `${this.galadon}`,
            `${this.firedog} wake up! This isn't the time to be asleep! Snap out of it now!`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMark(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //63
            `${this.firedog}`,
            `I can hear ${this.galadon}!`,
            this.addImage(this.setfiredogNormalExclamationMark(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //64
            `${this.firedog}`,
            `I think this is working... ${this.galadon} is slowly snapping me out of this place...`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //65
            `${this.galadon}`,
            `Wake up ${this.firedog}, the whole ground is shaking, we need to stop ${this.elyvorg} now!`,
            this.addImage(this.setfiredogTired(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //66
            `${this.firedog}`,
            `(That's it... I'm going to snap out of it!)`,
            this.addImage(this.setfiredogTired(), 1, 0, 79, 590, 610),
        );
        this.addDialogue( //67 change scenary
            `${this.galadon}`,
            `Wake up... Wake up... WAKE UP!`,
            this.addImage(this.setfiredogTired(), 0.7, 0, 79, 590, 610),
        );
        this.addDialogue( //68 end credits
            ``,
            ``,
        );
        this.addDialogue( //69 end credits
            ``,
            ``,
        );
        this.game.gameCompleted = true;
        this.game.saveGameState();
    }
}
