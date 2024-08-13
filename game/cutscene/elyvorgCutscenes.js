import { Cutscene } from "./cutscene.js";

export class ElyvorgCutscene extends Cutscene {
    constructor(game) {
        super(game);
    }

    enterOrLeftClick(cutscene) {
        this.cutsceneController();
        if (this.game.player.currentState !== this.game.player.states[8]) {
            this.game.player.setState(8, 0);
        }
        this.isEnterPressed = true;
        this.playSound2OnDotPause = false;

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
            if (this.game.elyvorgPreFight) {
                this.removeEventListeners();
                this.cutsceneBackgroundChange(500, 2500, 200);
                this.game.audioHandler.cutsceneSFX.playSound('battleStarting');
                setTimeout(() => {
                    this.game.endCutscene(cutscene);
                    this.game.talkToElyvorg = false;
                    this.game.cutscenes = [];
                    this.game.elyvorgInFight = true;
                    this.game.audioHandler.mapSoundtrack.playSound('elyvorgBattleTheme', true);
                }, 3000);
            } else if (this.game.elyvorgPostFight) {
                this.game.endCutscene(cutscene);
                this.game.talkToElyvorg = false;
                this.game.cutscenes = [];
                this.removeEventListeners();
            }
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
            if (!this.game.menu.pause.isPaused && this.game.currentMenu !== this.game.menu.ingameAudioSettings) {
                if (event.key === 'Tab' && this.game.enterDuringBackgroundTransition) {
                    if (this.game.elyvorgPreFight) {
                        this.removeEventListeners();
                        this.cutsceneBackgroundChange(500, 2500, 200);

                        this.game.audioHandler.cutsceneDialogue.stopAllSounds();
                        this.game.audioHandler.cutsceneSFX.stopAllSounds();
                        this.game.audioHandler.cutsceneMusic.stopAllSounds();
                        this.game.audioHandler.cutsceneDialogue.playSound('bit1', false, true, true);

                        this.game.audioHandler.cutsceneSFX.playSound('battleStarting');
                        setTimeout(() => {
                            this.dialogueIndex = this.dialogue.length - 1;
                            this.game.endCutscene(cutscene);
                            this.game.talkToElyvorg = false;
                            this.game.cutscenes = [];
                            this.game.elyvorgInFight = true;
                            this.game.audioHandler.mapSoundtrack.playSound('elyvorgBattleTheme', true);
                        }, 3000);
                    }
                }

                if (event.key === 'Enter' && !this.isEnterPressed && this.game.enterDuringBackgroundTransition) {
                    this.enterOrLeftClick(cutscene);
                }
            }
        };
        this.handleLeftClick = (event) => {
            if (!this.isEnterPressed && this.game.enterDuringBackgroundTransition && !this.game.menu.pause.isPaused &&
                this.game.currentMenu !== this.game.menu.ingameAudioSettings) {
                this.enterOrLeftClick(cutscene);
            }
        };
        super.displayDialogue(cutscene);
    }

    cutsceneController() {
        if (this.textIndex === this.dialogue[this.dialogueIndex].dialogue.length) {
            if (this.game.elyvorgPreFight === true) {
                if (this.dialogueIndex === 1) {
                    this.game.audioHandler.mapSoundtrack.playSound('crypticTokenDarkAmbienceSoundInGame', true);
                } else if (this.dialogueIndex === 5) {
                    this.game.audioHandler.mapSoundtrack.fadeOutAndStop('crypticTokenDarkAmbienceSoundInGame');
                } else if (this.dialogueIndex === 12) {
                    this.removeEventListeners();
                    this.game.audioHandler.firedogSFX.playSound('dreamSoundInGame');
                    this.cutsceneBackgroundChange(500, 500, 500);
                    setTimeout(() => {
                        this.addEventListeners();
                    }, 1000);
                } else if (this.dialogueIndex === 15) {
                    this.removeEventListeners();
                    this.game.audioHandler.firedogSFX.playSound('dreamSoundInGame');
                    this.cutsceneBackgroundChange(500, 500, 500);
                    setTimeout(() => {
                        this.addEventListeners();
                    }, 1000);
                } else if (this.dialogueIndex === 17) {
                    this.removeEventListeners();
                    this.game.audioHandler.firedogSFX.playSound('dreamSoundInGame');
                    this.cutsceneBackgroundChange(500, 500, 500);
                    setTimeout(() => {
                        this.addEventListeners();
                    }, 1000);
                }
            } else if (this.game.elyvorgPostFight === true) {
                if (this.dialogueIndex === 2) {
                    this.game.audioHandler.cutsceneMusic.playSound('unboundPurpose', true);
                } else if (this.dialogueIndex === 25) {
                    this.game.audioHandler.mapSoundtrack.playSound('crypticTokenDarkAmbienceSoundInGame', true);
                } else if (this.dialogueIndex === 29) {
                    this.game.audioHandler.mapSoundtrack.fadeOutAndStop('crypticTokenDarkAmbienceSoundInGame');
                } else if (this.dialogueIndex === 35) {
                    this.game.audioHandler.cutsceneMusic.fadeOutAndStop('unboundPurpose');
                }
            }
        }
    }
}

// Map 6 Elyvorg Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map6ElyvorgIngameCutsceneBeforeFight extends ElyvorgCutscene {
    constructor(game) {
        super(game);
        this.addDialogue( //0
            `${this.firedog}`,
            `A hooded individual- So it's you...`,
            this.addImage(this.setfiredogNormalBorder(), 1, 100, 400, 200, 200),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `You are the one who stole the ${this.cryptic} ${this.token} weren't you?`,
            this.addImage(this.setfiredogAngry2Border(), 1, 100, 400, 200, 200),
        );
        this.addDialogue( //2
            `${this.questionMark}`,
            `Oh, you mean this?`,
            this.addImage(this.setfiredogAngry2Border(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1560, 250, 200, 200),
            this.addImage('crypticTokenShining', 1, 1620, 400, 260, 260),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `That's the... The ${this.cryptic} ${this.token}! You need to give that back!`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 0.7, 1560, 250, 200, 200),
            this.addImage('crypticTokenShining', 1, 1620, 400, 260, 260),
        );
        this.addDialogue( //4
            `${this.questionMark}`,
            `Hm, no.`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1560, 250, 200, 200),
            this.addImage('crypticTokenShining', 1, 1620, 400, 260, 260),
        );
        this.addDialogue( //5
            `${this.questionMark}`,
            `I'll keep this with me. Let me put it back in my pocket.`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1560, 250, 200, 200),
            this.addImage('crypticTokenShining', 1, 1620, 400, 260, 260),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `You-`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `You atacked ${this.valdorin}, and also ${this.galadon} back in ${this.verdant} ${this.vine}.`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.questionMark}`,
            `Indeed, I did.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1560, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `You're going to pay for what you did! Who are you!?`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.questionMark}`,
            `I'm ${this.elyvorg}.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1560, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.elyvorg}`,
            `Nothing you do is going to stop what's coming. All your efforts in trying to stop me will be in vain.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1560, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I'll stop y-`,
            this.addImage(this.setfiredogAngry2Border(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogHeadacheBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `(Ugh... it's happening again... it feels unbelievably strong this time..)`,
            this.addImage(this.setfiredogHeadacheBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `(This is not good... If I pass out here I'm sure to die..)`,
            this.addImage(this.setfiredogHeadacheBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogHeadacheBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `(Ugh... Why did the headache get so intense after seeing the ${this.cryptic} ${this.token}..?)`,
            this.addImage(this.setfiredogHeadacheBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogHeadacheBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `(My heart is beating so fast... just like in the dreams..)`,
            this.addImage(this.setfiredogHeadacheBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `(Relax..)`,
            this.addImage(this.setfiredogHeadacheBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `(I'm not going to lose now, after all the trouble I went through to get here!)`,
            this.addImage(this.setfiredogHeadacheBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `(Okay... I think it went away..)`,
            this.addImage(this.setfiredogTiredBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //23
            `${this.elyvorg}`,
            `Lost your words, huh? Are you regretting coming all the way here, now that death is all that awaits you? Hahaha!`,
            this.addImage(this.setfiredogTiredBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1560, 400, 200, 200),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `I can't let you leave with what you stole. It all ends here.`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //25
            `${this.elyvorg}`,
            `You're right. It all ends here... for you.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1560, 400, 200, 200),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `You're wrong... I will take you down right here, right now!`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1560, 400, 200, 200),
        );
        this.addDialogue( //27
            `${this.elyvorg}`,
            `You're confident, but that only takes you so far.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1560, 400, 200, 200),
        );
        this.addDialogue( //28
            `${this.elyvorg}`,
            `Show me what you've got.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1560, 400, 200, 200),
        );
    }
}
export class Map6ElyvorgIngameCutsceneAfterFight extends ElyvorgCutscene {
    constructor(game) {
        super(game);
        this.game.elyvorgRunAway = true;
        this.addDialogue( //0
            `${this.elyvorg}`,
            `You're strong.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `How do you know my fireball ability? How is this possible?`,
            this.addImage(this.setfiredogNormalBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //2
            `${this.elyvorg}`,
            `You're the other survivor, interesting.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `What are you talking about?`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //4
            `${this.elyvorg}`,
            `Why don't you join me ${this.firedog}?`,
            this.addImage(this.setfiredogNormalExclamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `What... how do you know my name!? And why would I join you!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //6
            `${this.elyvorg}`,
            `We're not different from each other. You get those voices too don't you?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `What!? How do you know about that?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //8
            `${this.elyvorg}`,
            `It's because of ${this.valdorin}. He used you, and he used me.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //9
            `${this.elyvorg}`,
            `You see, ${this.valdorin} inserted the ${this.cryptic} ${this.token} inside of our hearts.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `What!?`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //11
            `${this.elyvorg}`,
            `Yes. His secret. The ${this.project} ${this.cryptoterra} ${this.genesis}.`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `The ${this.project} ${this.cryptoterra} ${this.genesis}? What is that?`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //13
            `${this.elyvorg}`,
            `It's a project dedicated to use children as experiments. Experiments in order to create the ultimate weapon of mass destruction.`,
            this.addImage(this.setfiredogNormalQuestionMarkBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //14
            `${this.elyvorg}`,
            `You and I are nothing but lucky numbers that ended up surviving.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //15
            `${this.elyvorg}`,
            `And this is the reason why we both share the same fireball ability.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //16
            `${this.elyvorg}`,
            `Because we are both connected to the ${this.cryptic} ${this.token}. The token that gave me and you these powers.`,
            this.addImage(this.setfiredogNormalBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `What... I can't believe this...`,
            this.addImage(this.setfiredogSadBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Why do I get these voices?`,
            this.addImage(this.setfiredogSadBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //19
            `${this.elyvorg}`,
            `You get them because... there are still fragments of the ${this.cryptic} ${this.token} inside of you.`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `What!? How can this be possible...`,
            this.addImage(this.setfiredogNormalQuestionAndExlamationMarkBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //21
            `${this.elyvorg}`,
            `The surgeons that removed the token from our hearts thought they had removed it all completely.`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //22
            `${this.elyvorg}`,
            `But they failed to account for some small fragments that got stuck in our hearts.`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //23
            `${this.elyvorg}`,
            `The ${this.cryptic} ${this.token} itself doesn't look like it has any cracks because it molds itself into it's perfect shape.`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //24
            `${this.elyvorg}`,
            `This is why they have never noticed a small part of it was gone.`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //25
            `${this.elyvorg}`,
            `Not even ${this.valdorin} has a clue about this. He doesn't know anything about the ${this.cryptic} ${this.token}.`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //26
            `${this.elyvorg}`,
            `You see, this token isn't just an inanimate object.`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1100, 400, 200, 200),
            this.addImage('crypticTokenShining', 1, 800, 400, 260, 260),
        );
        this.addDialogue( //27
            `${this.elyvorg}`,
            `No... inside here holds the spirits and souls of all that came before the world and what will come after it.`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1100, 400, 200, 200),
            this.addImage('crypticTokenShining', 1, 800, 400, 260, 260),
        );
        this.addDialogue( //28
            `${this.elyvorg}`,
            `And as long as it's separated from the stone, it will soundlessly scream for it.`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1100, 400, 200, 200),
            this.addImage('crypticTokenShining', 1, 800, 400, 260, 260),
        );
        this.addDialogue( //29
            `${this.elyvorg}`,
            `Because a part of the ${this.cryptic} ${this.token} is inside of you... you are able to hear those voices.`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgTokenBorder', 1, 1100, 400, 200, 200),
            this.addImage('crypticTokenShining', 1, 800, 400, 260, 260),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `I can't believe this... So it's true... ${this.valdorin}, why...`,
            this.addImage(this.setfiredogCryBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `${this.quilzorin}... does she know...`,
            this.addImage(this.setfiredogCryBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //32
            `${this.elyvorg}`,
            `${this.quilzorin} is his right arm, of course she knows.`,
            this.addImage(this.setfiredogCryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `How could they do this to me...`,
            this.addImage(this.setfiredogSadBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //34
            `${this.elyvorg}`,
            `So, ${this.firedog}. Will you join me, for world without corruption and suffering. For a world of true peace?`,
            this.addImage(this.setfiredogSadBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `... ... ...`,
            this.addImage(this.setfiredogSadBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `No... What they did to us is wrong, but what you're doing is worse...`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `Innocent lives will die... that's just not right. You need to stop.`,
            this.addImage(this.setfiredogAngryBorder(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
        this.addDialogue( //38
            `${this.elyvorg}`,
            `Very well then. I see you've made up your mind.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //39
            `${this.elyvorg}`,
            `Once I find the ${this.temporal} ${this.timber}, the world shall come to an end, and you ${this.firedog}, will die a sacrifice.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //40
            `${this.elyvorg}`,
            `There is no point in meaningless fights. I'm just delaying the inevitable.`,
            this.addImage(this.setfiredogAngryBorder(), 0.7, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 1, 1100, 400, 200, 200),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `Uh? I'm not letting you run away, no!`,
            this.addImage(this.setfiredogAngry2Border(), 1, 100, 400, 200, 200),
            this.addImage('elyvorgBorder', 0.7, 1100, 400, 200, 200),
        );
    }
}
