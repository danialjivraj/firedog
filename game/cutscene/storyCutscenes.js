import { Cutscene } from './cutscene.js';

export class StoryCutscene extends Cutscene {
    constructor(game) {
        super(game);
        this.characterLimit = 75;
        this.textBoxWidth = 1050;
    }

    enterOrLeftClick() {
        this.runCurrentDialogueAdvanceActionIfAny();

        this.playSound2OnDotPause = false;
        this.isEnterPressed = true;

        if (this.continueDialogue) {
            this.pause = false;
            this.textIndex++;
            this.continueDialogue = false;

        } else if (this.textIndex < this.dialogue[this.dialogueIndex].dialogue.length) {
            const dlg = this.dialogue[this.dialogueIndex].dialogue;
            const dotIndices = this.getDotIndices(dlg);
            const nextDotIndex = dotIndices.find(index => index > this.textIndex);

            if (nextDotIndex !== undefined) {
                if (this.ellipsisFollowedOnlyByTerminalPunct(dlg, nextDotIndex)) {
                    this.textIndex = dlg.length;
                } else {
                    this.textIndex = nextDotIndex;
                }
            } else {
                this.textIndex = dlg.length;
            }

        } else if (this.dialogueIndex < this.dialogue.length - 1) {
            this.dialogueIndex++;
            this.textIndex = 0;
            this.lastSound2Played = false;

            const currentDialogue = this.dialogue[this.dialogueIndex];
            const prefullWords = this.splitDialogueIntoWords(currentDialogue.dialogue);
            this.fullWordsColor = [];
            this.fullWordsColor = prefullWords;

            this.runCurrentDialogueEnterActionIfAny();

        } else {
            this.removeEventListeners();
            this.cutsceneBackgroundChange(400, 600, 400);
            this.fadeOutAndStopAllAudio();
            setTimeout(() => {
                this.game.endCutscene();
                if (this.game.isEndCutscene) {
                    this.game.isPlayerInGame = false;
                } else {
                    this.game.isPlayerInGame = true;
                }
                this.game.input.keys = [];
            }, 500);
        }

        const checkAnimationStatus = setInterval(() => {
            if (this.textIndex >= this.dialogue[this.dialogueIndex].dialogue.length) {
                this.isEnterPressed = false;
                clearInterval(checkAnimationStatus);
            }
        }, 100);
    }

    displayDialogue() {
        this.handleKeyDown = (event) => {
            if (event.key === 'Tab' && this.game.fadingIn === false && this.game.enterDuringBackgroundTransition && this.game.waitForFadeInOpacity === false) {
                this.removeEventListeners();
                this.cutsceneBackgroundChange(400, 600, 400);
                this.fadeOutAndStopAllAudio();
                setTimeout(() => {
                    this.dialogueIndex = this.dialogue.length - 1;
                    this.game.endCutscene();
                    this.game.stopShake();
                    if (this.game.isEndCutscene) {
                        this.game.isPlayerInGame = false;
                    } else {
                        this.game.isPlayerInGame = true;
                    }
                }, 500);
            }
            if (event.key === 'Enter' && !this.isEnterPressed && !this.game.fadingIn &&
                this.game.enterDuringBackgroundTransition && this.game.waitForFadeInOpacity === false) {
                this.enterOrLeftClick();
            }
        };
        this.handleLeftClick = (event) => {
            if (!this.isEnterPressed && !this.game.fadingIn && this.game.enterDuringBackgroundTransition && this.game.waitForFadeInOpacity === false) {
                this.enterOrLeftClick();
            }
        };
        super.displayDialogue();
    }
}

// Map 1 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map1StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('chapter1');

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'blackBackground',
                }),
            },
        );
        this.addDialogue( //1
            `${this.valdorin}`,
            `Who are you? Why are you doing this... Please no... don't take that...`,
        );
        this.addDialogue( //2
            `${this.valdorin}`,
            `NO... NOT THE-`,
        );
        this.addDialogue( //3
            `${this.questionMark}`,
            `I will take this.`,
        );
        this.addDialogue( //4
            `${this.valdorin}`,
            `How did you get past everyone without a single scratch... I can't allow you to get out of that door... Not with that in your hands...!`,
        );
        this.addDialogue( //5
            `${this.questionMark}`,
            `You're nothing but a fool. Nothing is going to stop me, including you.`,
        );
        this.addDialogue( //6
            `${this.questionMark}`,
            `Take this.`,
            {
                onAdvance: () => this.playSFX('slashSound'),
            },
        );
        this.addDialogue( //7
            `${this.valdorin}`,
            `GWWAAHHH!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1TentFireplace',
                    onBlack: () => {
                        this.playMusic('cracklingMountainCampfirewithRelaxingRiver', true);
                    },
                }),
            },
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `What time is it... Oh... it's still early. I passed out looking at stars.`,
            {
                onAdvance: () => this.playMusic('onTheBeachAtDusk', true),
            },
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `It was a good idea deciding to sleep outside today. Looking at the stars, feeling the breeze.. there's nothing better than this!`,
            this.addImage(this.setfiredogSmile(), LEFT),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `I... I kinda wish I could go out and explore outside this place. I do love ${this.lunarGlade}, I mean it's my home after all...`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `But I feel like there is so much more to explore outside of this land.`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `But ${this.valdorin} wouldn't allow me to. He thinks there is no point and it's too dangerous... What does he know!?`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Anyways... if I keep training I can prove ${this.valdorin} that I am strong enough to go out by myself!`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `Haha! I feel so much more motivated now.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
        );
        this.addDialogue( //15
            `${this.threeDots}`,
            `Ha! There you are ${this.firedog}! I have been looking for you everywhere!`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Oh... Is that you ${this.galadon}?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );

        this.addDialogue( //17
            `${this.galadon}`,
            `Indeed it is! I had a feeling I would find you here!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonNormal', RIGHT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `You know me well, I thought it would be a good idea to just set up a tent here and relax.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonNormal', RIGHT),
        );
        this.addDialogue( //19
            `${this.galadon}`,
            `You've been sleeping outside a lot recently, any particular reason?`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Not really, it just feels nice to connect with nature once in a while!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `But anyways... What brings you here ${this.galadon}?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //22
            `${this.galadon}`,
            `Just wanted to see how you were doing. I know that not being able to explore outside our home feels like prison to you sometimes.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonSurprised', RIGHT),
        );
        this.addDialogue( //23
            `${this.galadon}`,
            `I know you get really excited by the thought of the unknown, but it is quite danger-`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonSad', RIGHT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `Dangerous right, haha. Don't worry I've heard this a million times before!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('galadonSad', RIGHT),
        );
        this.addDialogue( //25
            `${this.galadon}`,
            `Haha yeah, I'm sorry for bringing it up again. But I'm sure that in no time you'll be able to go out there too!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('galadonSad', RIGHT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Thanks ${this.galadon}, I hope so too.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonSad', RIGHT),
        );
        this.addDialogue( //27
            `${this.galadon}`,
            `Wow... This is quite a nice view in here ${this.firedog}. I never really noticed how nice this place looked before. No wonder you always come here!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonAmazed', RIGHT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `I know right? It's peaceful.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonAmazed', RIGHT),
        );
        this.addDialogue( //29
            `${this.galadon}`,
            `Speaking of peaceful, did you see the local news around town recently?`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `No, what happened?`,
            {
                onAdvance: () => this.fadeOutMusic('onTheBeachAtDusk'),
            },
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //31
            `${this.galadon}`,
            `Apparently about 2 weeks ago, during a scout around the borders of ${this.lunarGlade}, some traps were discovered destroyed.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `Traps? What traps?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //33
            `${this.galadon}`,
            `How come you haven't heard of it! Our land is quite safe from intruders.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonSurprised', RIGHT),
        );
        this.addDialogue( //34
            `${this.galadon}`,
            `When ${this.valdorin} took over the throne of our land years ago, he insisted in making our borders as secure as possible.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //35
            `${this.galadon}`,
            `This is why we have security guards and traps all around!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //36
            `${this.galadon}`,
            `And apparently it was thought to be impossible to step on a trap and not be detected...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //37
            `${this.galadon}`,
            `So it was a surprise when one of the security guards on an early morning shift saw a trap destroyed.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `What kind of trap was it!?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //39
            `${this.galadon}`,
            `An explosive wire trap... well... not just one but around 5 within the area.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `Why would anyone want to invade us?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //41
            `${this.galadon}`,
            `Well, as you know, ${this.lunarGlade} keeps a very important item which resides at the center of the castle.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonAmazed', RIGHT),
        );
        this.addDialogue( //42
            `${this.galadon}`,
            `So it comes to no surprise that we might get intruders that take interest in it... but the good news is that no one has ever crossed past the traps!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //43
            `${this.galadon}`,
            `Nonetheless it's still definitely sketchy... but I'm sure it's fine as everyone in here works towards making our land safer, including me!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `(How would anyone go unnoticed? I mean... I have heard about how secure our land is, but to destroy some traps without being spotted?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //45
            `${this.galadon}`,
            `Why did you go quiet all of a sudden! Didn't mean to scare ya'!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonSurprised', RIGHT),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `Haha, I'm not scared ${this.galadon}, well... not as much as you are at least!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('galadonSurprised', RIGHT),
        );
        this.addDialogue( //47
            `${this.galadon}`,
            `Very funny of you ${this.firedog}.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('galadonNormal', RIGHT),
        );
        this.addDialogue( //48
            `${this.threeDots}`,
            `There you two are.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('galadonNormal', RIGHT),
        );
        this.addDialogue( //49
            `${this.galadon}`,
            `Wha! Is that an intruder!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonScared', RIGHT),
        );
        this.addDialogue( //50
            `${this.threeDots}`,
            `Intruder? What are you talking about... It's ${this.nysera}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('galadonScared', RIGHT),
        );
        this.addDialogue( //51
            `${this.nysera}`,
            `I have been ordered to find you two.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('galadonScared', RIGHT),
        );
        this.addDialogue( //52
            `${this.galadon}`,
            `Did you miss us that badly ${this.nysera}?`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('galadonAmazed', RIGHT),
        );
        this.addDialogue( //53
            `${this.nysera}`,
            `This is no time for jokes. While you two were away ${this.valdorin}...`,
            this.addImage('nyseraExplaining', LEFT),
            this.addImage('galadonAmazed', RIGHT),
        );
        this.addDialogue( //54
            `${this.galadon}`,
            `Uh...? What about ${this.valdorin}?`,
            this.addImage('nyseraExplaining', LEFT),
            this.addImage('galadonSurprised', RIGHT),
        );
        this.addDialogue( //55
            `${this.nysera}`,
            `Someone has attacked ${this.valdorin} this afternoon...`,
            this.addImage('nyseraExplaining', LEFT),
            this.addImage('galadonSurprised', RIGHT),
        );
        this.addDialogue( //56
            `${this.everyone}`,
            `WHAT!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonScared', RIGHT),
        );
        this.addDialogue( //57
            `${this.galadon}`,
            `What do you mean someone attacked ${this.valdorin}? Who?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('galadonScared', RIGHT),
        );
        this.addDialogue( //58
            `${this.nysera}`,
            `He's alive... but it's best if you come with me... ${this.valdorin} has ordered me to find and bring you two inside the castle.`,
            this.addImage('nyseraExplaining', LEFT),
            this.addImage('galadonSad', RIGHT),
        );
        this.addDialogue( //59
            `${this.firedog}`,
            `No time to waste, let's go.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 500,
                    imageId: 'map1outsideCastleDoor',
                    beforeFade: () => {
                        this.fadeOutMusic('cracklingMountainCampfirewithRelaxingRiver');
                    },
                    onBlack: () => {
                        this.playSFX('walkingCutsceneSound');
                    },
                }),
            },
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('galadonSad', RIGHT),
        );
        this.addDialogue( //60
            `${this.galadon}`,
            `Seems like we're at the entrance.`,
            this.addImage('galadonNormal', RIGHT),
        );
        this.addDialogue( //61
            `${this.firedog}`,
            `Let's go see ${this.valdorin}.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 500,
                    imageId: 'map1KingsBedroom',
                    onBlack: () => {
                        this.playSFX('doorOpening');
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonNormal', RIGHT),
        );
        this.addDialogue( //62
            `${this.valdorin}`,
            `I hear footsteps...`,
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //63
            `${this.valdorin}`,
            `${this.firedog}... ${this.galadon}... is that you?`,
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //64
            `${this.galadon}`,
            `We're here... What happened?`,
            {
                onAdvance: () => setTimeout(() =>
                    this.playMusic('inTheFuture', true), 600),
            },
            this.addImage('galadonSurprised', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //65
            `${this.valdorin}`,
            `The most precious item of ${this.lunarGlade}... it has been stolen.`,
            this.addImage('galadonSurprised', LEFT),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //66
            `${this.everyone}`,
            `What!?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('galadonScared', RIGHT),
        );
        this.addDialogue( //67
            `${this.valdorin}`,
            `Yes... the ${this.crypticToken} has been taken away from its secret safe.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1SafeRoom',
                }),
            },
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //68
            `${this.valdorin}`,
            `I heard a sound coming from the safe room. There's always guards on shift keeping an eye on the safe room, but when I called for them no one answered.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //69
            `${this.valdorin}`,
            `I got curious and went to open the door. Once I got there I heard a noise behind me.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //70
            `${this.valdorin}`,
            `I looked behind and a dark-hooded figure knocked me down with some sort of electric attack before I could use any of my abilities.`,
            this.addImage('valdorinSurprised', RIGHT),
        );
        this.addDialogue( //71
            `${this.valdorin}`,
            `Before I knew it, it was already too late.`,
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //72
            `${this.galadon}`,
            `I can't believe it, this is not good...`,
            this.addImage('galadonScared', LEFT),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //73
            `${this.firedog}`,
            `What's gonna happen now that the ${this.crypticToken} has been taken away from the safe?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonScared', RIGHT),
        );
        this.addDialogue( //74
            `${this.valdorin}`,
            `Bad things... As you are aware, this token keeps time-space balanced across every land.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1crypticTokenWar',
                }),
            },
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //75
            `${this.valdorin}`,
            `Every land was once at war with each other decades and even centuries ago...`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //76
            `${this.valdorin}`,
            `Many battles took place... and many soldiers have died...`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //77
            `${this.valdorin}`,
            `It was a never ending battle.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //78
            `${this.valdorin}`,
            `There wasn't a ${this.crypticToken} back then.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //79
            `${this.firedog}`,
            `What do you mean there wasn't a ${this.crypticToken}?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //80
            `${this.valdorin}`,
            `It simply did not exist. It was in fact discovered...`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //81
            `${this.valdorin}`,
            `Legends say centuries ago, as our ancestors were battling against the enemies, things were not looking good.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //82
            `${this.valdorin}`,
            `Many soldiers had died from our side... The enemy was winning the battle.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //83
            `${this.valdorin}`,
            `As the last dozen of our ancestors were about to be killed...`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //84
            `${this.valdorin}`,
            `They noticed an intense bright object falling from the sky. The ${this.crypticToken}.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //85
            `${this.valdorin}`,
            `Its brightness was so intense that legends say that the ${this.crypticToken} was shining 10x more intensively than the sun as it was floating in the air.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //86
            `${this.valdorin}`,
            `The enemies got scared and ran away. They must've thought we had reinforcements coming.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //87
            `${this.valdorin}`,
            `Our ancestors, however, were amazed. They walked close to the ${this.crypticToken}.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //88
            `${this.valdorin}`,
            `They noticed that the ${this.crypticToken} was attached to a wooden piece. They called it the ${this.temporalTimber}.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //89
            `${this.valdorin}`,
            `When they are both connected, the token becomes incredibly powerful.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //90
            `${this.valdorin}`,
            `Curiosity got the better of them and when they touched the token, they were overwhelmed with power.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //91
            `${this.valdorin}`,
            `They decided to take it back home but...`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //92
            `${this.valdorin}`,
            `As they were almost home, the token's power was so intense that some of our ancestors started fighting over it... Its power drove them absolutely crazy.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //93
            `${this.valdorin}`,
            `A civil war almost started, until the king, my 9th great-grandparent, ${this.valdonotski}, ended the altercation by casting a spell to put them all to sleep.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //94
            `${this.valdorin}`,
            `He noticed the bright token on the ground, and he himself could feel its intense power.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1Lab',
                }),
            },
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //95
            `${this.valdorin}`,
            `He brought the ${this.crypticToken} inside the castle and examined it.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //96
            `${this.valdorin}`,
            `After many days of research and examining, ${this.valdonotski} was astonished by the token. It seemed like it could distort space-time reality.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1DestroyedTree',
                }),
            },
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //97 
            `${this.valdorin}`,
            `He decided to bring the token in a remote area and test it. He cast an ability on some trees, breaking them into pieces.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //98
            `${this.valdorin}`,
            `${this.valdonotski} then touched the token, and in his mind, he was envisioning the destroyed trees rebuilding themselves back up again.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1RegeneratedTree',
                }),
            },
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //99
            `${this.valdorin}`,
            `Much to his astonishment, his thoughts manifested into reality. The trees he had just destroyed started to rebuild themselves in front of his eyes.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //100
            `${this.valdorin}`,
            `He also noticed that his spells were twice as powerful when keeping the ${this.crypticToken} close to himself.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //101
            `${this.valdorin}`,
            `He became convinced that the token was a power given from God, sent down to earth.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1KingsBedroom',
                }),
            },
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //102
            `${this.valdorin}`,
            `It seemed that the wooden piece, the ${this.temporalTimber} could come apart, and when it did, the token stopped shining as bright.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //103
            `${this.valdorin}`,
            `And anyone around the token were not going completely crazy for its power when it wasn't connected to that wooden piece.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //104
            `${this.valdorin}`,
            `${this.valdonotski} noticed he was not getting affected as much as his companions were when the ${this.crypticToken} was connected to the ${this.temporalTimber}.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //105
            `${this.valdorin}`,
            `He deduced that a strong-willed soul would be able to control himself when near the ${this.crypticToken}.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //106
            `${this.valdorin}`,
            `They decided to keep it in a safe inside the castle for some time but then the attacks started...`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //107
            `${this.firedog}`,
            `Hm!? What attacks!?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //108
            `${this.valdorin}`,
            `Invaders were trying to get inside our land, but when they got caught and interrogated, they said that they heard our land had a God-like power.`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //109
            `${this.valdorin}`,
            `So it was likely that when the ${this.crypticToken} was being brought back home with our ancestors, some enemies had spotted them with it.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //110
            `${this.valdorin}`,
            `But that's when my 9th great-grandparent had an idea. He knew the risks of it being inside the castle.`,
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //111
            `${this.valdorin}`,
            `So he decided to take the ${this.crypticToken} apart from the ${this.temporalTimber}.`,
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //112
            `${this.valdorin}`,
            `The ${this.temporalTimber} by itself had no power, so they kept the wooden piece hidden outside the land.`,
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //113
            `${this.valdorin}`,
            `While the token itself, was to remain inside the castle's safe room.`,
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //114
            `${this.valdorin}`,
            `But now... for the first time in centuries the ${this.crypticToken} has been stolen.`,
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //115
            `${this.valdorin}`,
            `Whoever did this is up to no good... However, we got time.`,
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //116
            `${this.galadon}`,
            `How so ${this.valdorin}!?`,
            this.addImage('galadonSurprised', LEFT),
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //117
            `${this.valdorin}`,
            `The ${this.crypticToken} without the ${this.temporalTimber} is not even as half powerful as it is when they are both connected.`,
            this.addImage('galadonSurprised', LEFT),
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //118
            `${this.valdorin}`,
            `Now, this is still bad, because the token alone itself is already astonishingly powerful.`,
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //119
            `${this.valdorin}`,
            `But despite our precious token being stolen, the culprit will not be able to fully unlock its space-time powers until they connect that wooden piece to it.`,
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //120
            `${this.valdorin}`,
            `Because the ${this.temporalTimber} is hidden, I don't think the thief knows where it is... but we cannot sit here assuming things. We need to get it.`,
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //121
            `${this.firedog}`,
            `Where can the ${this.temporalTimber} be found? Is it near our land?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //122
            `${this.valdorin}`,
            `Unfortunately not... The ${this.temporalTimber} is inside a cave in ${this.infernalCraterPeak}...`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //123
            `${this.valdorin}`,
            `If the culprit gets there before we do the consequences will be huge. That's assuming they know the location of the ${this.temporalTimber}.`,
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //124
            `${this.valdorin}`,
            `Using the space-time abilities of the ${this.crypticToken} evilly will distort reality completely, to the point where we might cease to exist.`,
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //125
            `${this.valdorin}`,
            `We have sent some guards there already, but due to its urgency I will need you to go there as well ${this.galadon} and ${this.firedog}.`,
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //126
            `${this.firedog}`,
            `Me as well? You have always told me it is too dangerous for me to leave this land... Is this a good idea?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //127
            `${this.valdorin}`,
            `Yes ${this.firedog}. Your powers could come in handy now, especially in a situation like this...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //128
            `${this.valdorin}`,
            `${this.galadon}, you can go ahead and follow the trail to ${this.infernalCraterPeak}, we can't waste much time.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //129
            `${this.galadon}`,
            `Got it. Catch up to me whenever you can ${this.firedog}, I'll go now.`,
            this.addImage('galadonNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //130
            `${this.firedog}`,
            `Stay safe ${this.galadon}...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonNormal', RIGHT),
        );
        this.addDialogue( //131
            `${this.firedog}`,
            `Okay... ${this.valdorin}, shall I go too?`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //132
            `${this.valdorin}`,
            `Yes, you will go soon. ${this.nysera}, could you please guide ${this.firedog} outside and show him the path he needs to take?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //133
            `${this.nysera}`,
            `Yes. I will. ${this.firedog}, please meet me outside.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1outsideCastleDoor',
                    onBlack: () => {
                        this.fadeOutMusic('inTheFuture');
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraHandUp', RIGHT),
        );
        this.addDialogue( //134
            `${this.nysera}`,
            `Okay... Now that we are outside, you will need to know a few things before you go out on this journey.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraHandUp', RIGHT),
        );
        this.addDialogue( //135
            `${this.firedog}`,
            `What things?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('nyseraHandUp', RIGHT),
        );
        this.addDialogue( //136
            `${this.nysera}`,
            `The path to ${this.infernalCraterPeak} is towards east for a couple lands, then south.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining', RIGHT),
        );
        this.addDialogue( //137
            `${this.nysera}`,
            `We cannot travel straight south due to the vast empty desert and dangerously constant tornadoes blocking our path.. you'd be long gone.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining', RIGHT),
        );
        this.addDialogue( //138
            `${this.nysera}`,
            `The ${this.temporalTimber} will be inside the biggest cave. Be careful in there, there's active volcanoes all the time in ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining', RIGHT),
        );
        this.addDialogue( //139
            `${this.nysera}`,
            `Come with me, I'll take you near the exit.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1outsideLakeAndTrees',
                    onBlack: () => {
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining2', RIGHT),
        );
        this.addDialogue( //140
            `${this.firedog}`,
            `Seems like we're outside the gates. It's already night. Will it be safe around this time?`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //141
            `${this.nysera}`,
            `Well... probably not... but if you are cautious enough you will be fine!`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('nyseraLaugh', RIGHT),
        );
        this.addDialogue( //142
            `${this.firedog}`,
            `Well that's not very reassuring of you ${this.nysera}!`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('nyseraLaugh', RIGHT),
        );
        this.addDialogue( //143
            `${this.nysera}`,
            `All you need to know is that there will be different types of enemies ahead.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining2', RIGHT),
        );
        this.addDialogue( //144
            `${this.nysera}`,
            `You will be fine as your rolling and diving abilities can take most of them out, however be careful as it won't work with every enemy.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining2', RIGHT),
        );
        this.addDialogue( //145
            `${this.nysera}`,
            `You might need to use your fireball or dash attack against some enemies to avoid taking damage unexpectedly.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining2', RIGHT),
        );
        this.addDialogue( //146
            `${this.nysera}`,
            `There are cabins scattered around in the land up ahead, so if you find one, I highly suggest you stay there for the night or rest for some time.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining2', RIGHT),
        );
        this.addDialogue( //147
            `${this.nysera}`,
            `Also... one more thing... Killing enemies will give you coins. Make sure you gather as many coins as you can.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraHandUp', RIGHT),
        );
        this.addDialogue( //148
            `${this.firedog}`,
            `I'm good at saving coins! That should be easy!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('nyseraHandUp', RIGHT),
        );
        this.addDialogue( //149
            `${this.firedog}`,
            `Will you come with me as well?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('nyseraHandUp', RIGHT),
        );
        this.addDialogue( //150
            `${this.nysera}`,
            `I will stay here for now, protecting ${this.valdorin} as he recovers. In case anything else happens, we'll be ready.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //151
            `${this.nysera}`,
            `Now go ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //152
            `${this.firedog}`,
            `(To even think that someone defeated ${this.valdorin} with ease... Can I even do this?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //153
            `${this.firedog}`,
            `(Only the higher-ups know about the situation... Apparently, the citizens are being kept in the dark. Well, it would be chaos if everyone knew...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //154
            `${this.firedog}`,
            `(This is why it's important to get the ${this.temporalTimber} from the cave in ${this.infernalCraterPeak} as soon as possible...)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //155
            `${this.firedog}`,
            `(But how is this happening? Someone really got through the safe unnoticed and got the ${this.crypticToken} that easily?)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //156
            `${this.firedog}`,
            `(Come to think of it... could this also be connected to what happened 2 weeks ago with the traps?)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //157
            `${this.firedog}`,
            `(What exactly is going on...)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //158
            `${this.firedog}`,
            `(To be able to pass through the traps, the guards, get through the castle, and find the safe while being able to escape...)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //159
            `${this.firedog}`,
            `(Let's go now, the future of this land might well depend on it.)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //160
            `${this.firedog}`,
            `I'll be going now then.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //161
            `${this.firedog}`,
            `Let's see if I can catch up to ${this.galadon}...!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //162
            `${this.nysera}`,
            `Good luck out there, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
    }
}
export class Map1EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('map1InsideCabin');
        this.game.audioHandler.cutsceneMusic.playSound('blizzardWindFireplace', true);

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Well... there goes my money...`,
            this.addImage(this.setfiredogSigh(), LEFT),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `But at least I can rest here for a bit.`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //2
            `${this.threeDots}`,
            `Do you talk alone this often?`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `WHO'S THAT!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //4
            `${this.threeDots}`,
            `My name is ${this.duskmaw}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //5
            `${this.duskmaw}`,
            `I'm an explorer.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `You scared me!`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //7
            `${this.duskmaw}`,
            `Haha, I'm sorry about that, I don't usually see many other explorers going on adventures themselves. What brings you here?`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('duskmawLaugh', RIGHT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Well I'm looking for-`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLaugh', RIGHT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `(Wait... it wouldn't be wise of me if I told this stranger why I'm here.)`,
            { whisper: true },
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('duskmawLaugh', RIGHT),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `(Perhaps I can get him to give me some information about the land. That would be smart...)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLaugh', RIGHT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `I'm looking for huh.. new adventures.. It's always been my sort of dream to be an explorer, just like you are!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('duskmawLaugh', RIGHT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `What about you? What brings you here?`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('duskmawLaugh', RIGHT),
        );
        this.addDialogue( //13
            `${this.duskmaw}`,
            `I'm a full-time traveler! I just visit the lands and explore all kinds of places!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `That's cool! What parts of the land have you explored? It seems you've been doing this for a while!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //15
            `${this.duskmaw}`,
            `For a while it has been indeed... I have been doing this for decades now... I have been practically everywhere.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Decades? That's impressive... You've been everywhere? Have you ever explored caves before...?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //17
            `${this.duskmaw}`,
            `Caves? I've been to many caves!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `I see. Is there any caves that are known for... being dangerous to go in?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //19
            `${this.duskmaw}`,
            `Hm, there sure are... I have been to quite some dangerous ones myself.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //20
            `${this.duskmaw}`,
            `However, the most dangerous caves reside in ${this.infernalCraterPeak}... That is one of the few places I have never actually been...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Oh.. how come?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //22
            `${this.duskmaw}`,
            `You haven't heard of it? It's full of active volcanoes that could erupt at any point in time.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //23
            `${this.duskmaw}`,
            `There have been some brave souls who dared to explore it, but none of them ever came back. Still to this day, the volcanoes are active.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //24
            `${this.duskmaw}`,
            `Not to mention the number of caves that exist there. There are hundreds of caves.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //25
            `${this.duskmaw}`,
            `But if you are planning to explore that area.. I would suggest you not to, it's not worth the risk.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Oh I see, thanks for letting me know!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `(Well, that seems to be quite a dangerous place...)`,
            { whisper: true },
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //28
            `${this.duskmaw}`,
            `I would suggest you to get your rest. ${this.nightfallPhantomGraves} is known for being sort of... paranormal during the night...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `Paranormal...? ${this.nightfallPhantomGraves}?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //30
            `${this.duskmaw}`,
            `Yes my friend, we're in ${this.nightfallPhantomGraves} right now. You came just in time.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //31
            `${this.duskmaw}`,
            `There have been some encounters with explorers that have reported... well... sightings of ghosts...`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `Ghosts? This cannot be real can it...`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //33
            `${this.duskmaw}`,
            `Well... I wouldn't dare to check it out.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `You're totally right. I wasn't planning on going out at this hour anyway...`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //35
            `${this.duskmaw}`,
            `As a fellow explorer, I think it's only right if I give you a backstory of the lands I've been on.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `Oh that sounds great! I'd love to hear more stories.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //37
            `${this.duskmaw}`,
            `As you are aware centuries ago, every land was at war. Searching for power and to conquer land.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //38
            `${this.duskmaw}`,
            `Many have died before a peace treaty was proposed. Nowadays the biggest land belongs to ${this.lunarGlade}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `(That's my home...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //40
            `${this.duskmaw}`,
            `Many other lands were frustrated, they were left with almost nothing, but to honor the peace treaty, and to avoid more deaths, everyone has tried to move on past the wars.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //41
            `${this.duskmaw}`,
            `As I had told before, we are currently inside ${this.nightfallPhantomGraves}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //42
            `${this.duskmaw}`,
            `${this.nightfallPhantomGraves} used to be a city with plenty of resources, however, due to the wars, it became a battle zone, and eventually... a ghost town-`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //43
            `${this.duskmaw}`,
            `-and slowly, it became a cemetery. It is believed that the spirits that wander during the night are the soldiers who sacrificed their life during the war.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //44
            `${this.duskmaw}`,
            `Although one particular spirit seems to be the most aggressive to anyone who enters ${this.nightfallPhantomGraves}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //45
            `${this.duskmaw}`,
            `But there are many other lands, such as ${this.coralAbyss}, which is famous for its vast lakes and rivers.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //46
            `${this.duskmaw}`,
            `They are rich in vegetation because of their geographic location, and they have found a way to filter their waters, which are then sold to nearby lands.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //47
            `${this.duskmaw}`,
            `Then we have ${this.verdantVine} which is known for its vast amount of vines that scatter throughout the whole land.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //48
            `${this.duskmaw}`,
            `They sell all types of wood, that's what keeps their economy strong.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //49
            `${this.duskmaw}`,
            `They are able to mass-produce furniture, such as tables, chairs, beds, doors... you name it, they make it!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //50
            `${this.duskmaw}`,
            `Fun fact, the materials of all cabins came from ${this.verdantVine}!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //51
            `${this.duskmaw}`,
            `${this.springlyLemony} is known for its food and plants. It's always spring there, so they are able to collect honey, and their trees yield delicious fruits all year.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //52
            `${this.duskmaw}`,
            `Their weather changes frequently from sunny to rainy, but this attracts animals to the area.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //53
            `${this.duskmaw}`,
            `They have many animals there! In fact, they own farms where they breed all kinds of animals and sell them to nearby lands when they become overpopulated.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //54
            `${this.duskmaw}`,
            `Then there is ${this.venomveilLake}, a deadly poisonous lake. Surprisingly, some creatures learned to adapt and became resistant to the poison, making the lake their home.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //55
            `${this.duskmaw}`,
            `You would be surprised to know how ${this.venomveilLake} was once a lively forest many centuries ago.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //56
            `${this.firedog}`,
            `How did a forest become a deadly poisonous lake?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //57
            `${this.duskmaw}`,
            `That is a good question. The reality is, due to ${this.infernalCraterPeak}'s rich environment, the land would be under constant threat of attacks.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //58
            `${this.duskmaw}`,
            `To protect themselves, they decided use the toxic waste from the minerals and rocks and dump it in the nearest forest.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //59
            `${this.duskmaw}`,
            `This was a lengthy process that slowly made the ground toxic.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //60
            `${this.duskmaw}`,
            `As the ground was slowly getting eaten away by the toxic waste, the lake underneath revealed itself. It is somewhat sad, but the strategy worked.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //61
            `${this.duskmaw}`,
            `Getting into their land was much harder with this protective toxic layer.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //62
            `${this.duskmaw}`,
            `Lastly, you have ${this.infernalCraterPeak}. It used to be a rich land, richer than all of the others lands combined...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //63
            `${this.duskmaw}`,
            `Being near the volcanoes provided them heat, which allowed the land to survive the toughest conditions.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //64
            `${this.duskmaw}`,
            `The active volcanoes constantly reacted with the ground and formed unique rocks, minerals and crystals.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //65
            `${this.duskmaw}`,
            `With these rare materials they managed to create beautiful jewelry, which was then sold to every other land.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //66
            `${this.duskmaw}`,
            `Their economy grew by a lot due to this strategy.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //67
            `${this.duskmaw}`,
            `However, one of the volcanoes one day erupted, and destroyed everything in there. Today it is nothing but dry rocks, lava, and constant volcano eruptions.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //68
            `${this.duskmaw}`,
            `Many believe it was karma for all those years of toxic pollution that eventually formed ${this.venomveilLake}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //69
            `${this.firedog}`,
            `What!? When did the eruption happen?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //70
            `${this.duskmaw}`,
            `Long before any of us were alive, my friend.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //71
            `${this.duskmaw}`,
            `There are many other much smaller lands and villages all around. But these 7 are the biggest ones.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //72
            `${this.firedog}`,
            `I see, I never knew about these lands!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //73
            `${this.firedog}`,
            `You mentioned that this place was haunted, but there was a specific spirit that... attacks?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //74
            `${this.duskmaw}`,
            `Haha! I wouldn't call it haunted during the day, only during the night!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //75
            `${this.duskmaw}`,
            `But rumors say that a young girl was playing with her doll outside near a park...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //76
            `${this.duskmaw}`,
            `When a sudden land conflict resulted in brutal missiles being landed on the land...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //77
            `${this.duskmaw}`,
            `Unfortunately, she was near the explosion impact, and sadly, she did not survive... People found her, still holding her doll, Dolly, in her last moments.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //78
            `${this.duskmaw}`,
            `Villagers were heartbroken, and soon enough they began hearing voices and footsteps during the night. The first occurrence of spirits in this land.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //79
            `${this.duskmaw}`,
            `It is believed that the doll is still protecting the little girl to this day, wandering around the cemetery.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //80
            `${this.firedog}`,
            `Wow.. That's horrible what happened...`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //81
            `${this.firedog}`,
            `(${this.duskmaw} seems to know so much about the history of every land!)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //82
            `${this.firedog}`,
            `(Maybe I should ask about the ${this.crypticToken}, I wonder what he knows about it!)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //83
            `${this.firedog}`,
            `${this.duskmaw}, have you ever heard about a ${this.crypticToken} before?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //84
            `${this.duskmaw}`,
            `The ${this.crypticToken}? I indeed have. But it is nothing but a fiction.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //85
            `${this.duskmaw}`,
            `Centuries ago, when all lands were at war, legends say that this token fell from the sky, containing unlimited power.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //86
            `${this.duskmaw}`,
            `But that's all I know about it. It is an old legend story. It's not real!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //87
            `${this.firedog}`,
            `(I see. It seems that people outside home don't know about the true story...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //88
            `${this.firedog}`,
            `(But if only ${this.lunarGlade} knows about the token, then who would know about it and steal it?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //89
            `${this.firedog}`,
            `Thanks for telling me these stories ${this.duskmaw}!`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //90
            `${this.firedog}`,
            `It's getting pretty late. I will go to sleep soon!`,
            this.addImage(this.setfiredogTired(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //91
            `${this.duskmaw}`,
            `Me too my friend. Thanks for letting me tell you some stories.`,
            this.addImage(this.setfiredogTired(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //92
            `${this.duskmaw}`,
            `I'll talk to you in the morning if I see you! I'll go to my bed now, goodnight!`,
            this.addImage(this.setfiredogTired(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //93
            `${this.firedog}`,
            `Goodnight ${this.duskmaw}!`,
            this.addImage(this.setfiredogTired(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //94
            `${this.firedog}`,
            `(I'm super tired. Well, I guess I should rest now. I need all my energy for tomorrow.)`,
            { whisper: true },
            this.addImage(this.setfiredogTired(), LEFT),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.game.map2Unlocked = true;
        this.game.saveGameState();
    }
}

// Map 2 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map2StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('chapter2');
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1InsideCabinNight',
                }),
            },
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `I feel like the moment I close my eyes I'll fall asleep...`,
            this.addImage(this.setfiredogTired(), LEFT),

        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I need to get the ${this.crypticToken} back...`,
            this.addImage(this.setfiredogTired(), LEFT),

        );
        this.addDialogue( //3
            `${this.firedog}`,
            `I will... get it... back... I got... thi-`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1500, fadeOut: 500,
                    imageId: 'dreamLight1',
                    onBlackDelayMs: 2000,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                    onBlack: () => {
                        this.playMusic('echoesOfTime', true);
                    },
                }),
            },
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `... Huh... Where am I?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Am I... dreaming...?`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamDark1',
                    onBlackDelayMs: 1200,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `What...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `I'm... I'm here again...?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `It's much darker now...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `Wha-! What is that in that door... eyes...?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `I am definitely dreaming... But I've never experienced something so lucid before...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //11
            `${this.questionMark}`,
            `Are you sure you're dreaming?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `WHAT!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Who are you!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //14
            `${this.questionMark}`,
            `Why don't you come here and find out?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `(How does this feel so real... Wait... I can't move my body...)`,
            { whisper: true },
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `(My heartbeat is going crazy... am I really dreaming?)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //17
            `${this.questionMark}`,
            `Can't move huh? And your heart is beating faster? What are you going to do about it?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `You... you can read my thoughts!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //19
            `${this.questionMark}`,
            `Are you too blind to see the truth?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //20
            `${this.questionMark}`,
            `That place was blocking me from entering your mind.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `What? What place!? Are you talking about... ${this.lunarGlade}?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
        );
        this.addDialogue( //22
            `${this.questionMark}`,
            `Hahaha. You're foolish ${this.firedog}. Everything you know is a lie.`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `I don't understand... What is going on...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //24
            `${this.questionMark}`,
            `Do not wait until morning. Go now.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `What...? I can't go now, especially during the night... this land is full of paranormal stuff... at least that's what ${this.duskmaw} told me.`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Who are you...? Why does this feel so real.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //27
            `${this.questionMark}`,
            `Who I am does not matter right now. Haha... Now ${this.firedog}, wake up.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //28
            `${this.questionMark}`,
            `Wake up... Wake up... Wake up...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `My head... it hurts... I've never felt pain like this before... I... ... my eyes... no-`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map1InsideCabinNight',
                    onBlackDelayMs: 1700,
                    beforeFade: () => {
                        this.fadeOutMusic('echoesOfTime');
                    },
                    onBlack: () => {
                        this.playMusic('exaleDeskant', true);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Ouch... I'm... I'm not dreaming anymore? It's pitch black outside...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `What was that... that felt so real... Wait... where is ${this.duskmaw}?`,
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `Why isn't he in the cabin...? Should I really keep going east now...?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `It feels so wrong... but for some reason I trust that voice in the dreams...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `Okay... I'll go... The quicker I get to the ${this.temporalTimber} the better anyways.. despite being really tired...`,
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `I wonder if ${this.penguini} is still outside.`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `I should check it out, okay let's go.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map2outsideCabin',
                    onBlackDelayMs: 1700,
                    beforeFade: () => {
                        this.fadeOutMusic('exaleDeskant');
                    },
                    onBlack: () => {
                        this.playSFX('doorOpening');
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `Hey ${this.penguini}, how's patrolling goin'?`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //38
            `${this.penguini}`,
            `Is that you ${this.firedog}? Why are you awake at this hour?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `Well.. I couldn't really sleep.`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `Have you seen huh... ${this.duskmaw} leaving? He's not in the cabin.`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //41
            `${this.penguini}`,
            `Who?`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `${this.duskmaw}...?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //43
            `${this.penguini}`,
            `You're the only one in the cabin right now. I'd know if anyone else was there, ya' fool!`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //44
            `${this.penguini}`,
            `If you're trying to scare me that ain't gonna work! Nothing scares the almighty ${this.penguini} ya' fool!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `(I was alone the whole time?)`,
            { whisper: true },
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `(Well.. ${this.penguini} doesn't seem to be joking as well... nothing here is making sense... shoot.. I'll figure all of this out later, I need to go now.)`,
            { whisper: true },
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `Okay... Anyways I'm leaving now.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //48
            `${this.penguini}`,
            `Leaving now? I think it's best to warn you about the paranormal activities that happen at this hour out there.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //49
            `${this.penguini}`,
            `You might see ghosts on your way there. Well, if you get killed it ain't my problem, many have gone and never came back ya' fool!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //50
            `${this.penguini}`,
            `Thanks for the coins ya' fool! Now go if you want to get killed! Hahaha!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatLaugh', RIGHT),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `That's what ${this.duskmaw} told me...`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinBatLaugh', RIGHT),
        );
        this.addDialogue( //52
            `${this.firedog}`,
            `Alright... off I go. Stay safe ${this.penguini}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //53
            `${this.penguini}`,
            `You too, ya' fool!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
    }
}
export class Map2EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('map2InsideCabinNight');
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Okay, let's rest for a bit in here... That was quite a long journey, ${this.duskmaw} and ${this.penguini} were right, that was really spooky!`,
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `It's so dark I can barely see anything, but well, this time it seems that no one is in the cabin.`,
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I should definitely sleep now, I am way too tired...`,
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Huh? What's this...?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `A letter? To ${this.firedog}!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `What!? This is from ${this.galadon}! He's been here! I should open this!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Let's see...`,
            {
                onAdvance: () => this.playSFX('cutsceneMapOpening'),
            },
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `"To ${this.firedog},"`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `"I hope this letter gets to you well. I am sending you this letter to warn you about what lies ahead."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `"I met an explorer who informed me that internal conflicts within Coral Abyss have led to tightened security."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `"This means that you will need to move at night if it's convenient for you to do so, as they might confuse you with an enemy."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `"If you prefer not to wait until nightfall, you can also traverse beneath the waters of Coral Abyss, which happens to also be a shortcut."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `"There is an exalted sorcerer that can give you temporary powers to stay underwater for a period of time."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `"You should find him if you so decide to take this shortcut."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `"${this.galadon}"`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `I see... so I assume ${this.galadon} chose the underwater route...`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Ugh... I am really tired, I'm definitely sleeping here, so I am not waiting until tomorrow when the sun sets again, I'll be wasting too much time.`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `This leaves me with no other option other than going... underwater...`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Let me scroll this letter back up.`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `I'll find more about this exalted sorcerer tomorrow. Let's go to sleep now.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1500, fadeOut: 500,
                    imageId: 'blackBackground',
                    onBlackDelayMs: 500,
                }),
            },
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Ugh.. my head...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamLight2',
                    onBlackDelayMs: 1700,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                    onBlack: () => {
                        this.playMusic('echoesOfTime', true);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `This looks familiar... wait. I'm... I'm here again...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Ugh... I don't like this...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `I must resist...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `No... my eyes...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamDark2',
                    onBlackDelayMs: 1700,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Not again... my body is paralyzed from fear.. damn it...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //26
            `${this.questionMark}`,
            `Did you miss me ${this.firedog}?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `What the hell do you want from me? Why am I here? What is this place?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //28
            `${this.questionMark}`,
            `Soon enough, I'll get out of your filthy body!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `Filthy body? What does that mean? Enough of this. I need an explanation...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //30
            `${this.questionMark}`,
            `Don't you know? ${this.valdorin} used you! Hahahahaha!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Used me? How? I've known ${this.valdorin} ever since I was born. He took care of me!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //32
            `${this.questionMark}`,
            `They blocked your memories.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `What memories?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `You liar! You're not real.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //35
            `${this.questionMark}`,
            `I am very much real. You will soon see how real I am. Now go.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `No. I'm not going until you tell me what's goin-`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //37
            `${this.questionMark}`,
            `Wake up...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `Damn it... you're doing that thing again... my head hurts...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //39
            `${this.questionMark}`,
            `Wake up... Wake up... Wake up...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'blackBackground',
                    onBlackDelayMs: 500,
                    onBlack: () => {
                        this.fadeOutMusic('echoesOfTime');
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `Damn it... my eyes... are closing again...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.game.map3Unlocked = true;
        this.game.bonusMap1Unlocked = true;
        this.game.saveGameState();
    }
}

// Map 3 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map3StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('chapter3');
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map2InsideCabin',
                    beforeFade: () => {
                        this.playMusic('birdsChirping', true);
                    },
                }),
            },
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `It's morning now...`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I feel so much more energized now.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `But it happened again... that dream... why does it feel so real? And what or who is that voice...`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Why is this happening to me now ever since I left home...`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `I wish there was a way to reach out to ${this.valdorin} and ask him about these dreams...`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `But anyways, let's get back to the mission!`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `So before I went to sleep... right, ${this.galadon} left the scroll letter for me.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `I need to refresh my mind. Let me open the scroll letter again.`,
            {
                onAdvance: () => this.playSFX('cutsceneMapOpening'),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `Let's see...`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `"There is an exalted sorcerer that can give you temporary powers to stay underwater for a period of time."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `Right. I need to find this sorcerer... I think it's best if I ask ${this.penguini} about this sorcerer.`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Alright, let's go outside.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map3OutsideCabin',
                    onBlackDelayMs: 1700,
                    onBlack: () => {
                        this.playSFX('doorOpening');
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Hello ${this.penguini}, did you sleep well?`,
            this.addImage(this.setfiredogSmile(), LEFT),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `I don't sleep ya' fool! Patrol life I chose fool!`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `Oh okay... Anyways, do you know of an exalted sorcerer around that helps explorers to get past the waters of ${this.coralAbyss} by any chance?`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //16
            `${this.penguini}`,
            `Exalted sorcerer? Do you mean ${this.zephyrion}?`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `I think so...?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `I received a letter from my friend ${this.galadon}, and he told me to find this sorcerer that can cast a spell on me to temporarily be underwater.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `Yes, indeed he was talking about ${this.zephyrion} ya' fool!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Oh... so you know this sorcerer!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //21
            `${this.penguini}`,
            `Yes I do, ya' fool! Let's just say that me and ${this.zephyrion} used to do business back in the days!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatLaugh', RIGHT),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Huh? What kind of business?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('penguinBatLaugh', RIGHT),
        );
        this.addDialogue( //23
            `${this.penguini}`,
            `... Highly confidential ya' fool!`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `What... Why even mention it if you're not even gonna say it.. ugh.`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //25
            `${this.penguini}`,
            `If you follow this river path and continue heading east you will meet ${this.zephyrion}. He can help you.`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Okay, great. What does he look like?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //27
            `${this.penguini}`,
            `A sorcerer.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `He looks like a ... sorcerer?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //29
            `${this.penguini}`,
            `Yeah.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `What the hell!? What kind of description is that ${this.penguini}!?`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //31
            `${this.penguini}`,
            `Enough said ya' fool!`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `Whatever, I'll go on my way then. So all I have to do is follow the river path and continue going east.`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `Okay let's go!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 2500, fadeOut: 1000,
                    imageId: 'map3Sorcerer',
                    onBlackDelayMs: 1700,
                    onBlack: () => {
                        this.playSFX('walkingCutsceneSound');
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `Oh.. I see someone.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `Hello there, is this ${this.zephyrion}?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //36
            `${this.zephyrion}`,
            `Who are you? I have never seen you before.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `(Well ${this.penguini} was right, he does look like a sorcerer...)`,
            { whisper: true },
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `I'm ${this.firedog}. I need you to take me underwater.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //39
            `${this.zephyrion}`,
            `Underwater? I'm sorry I don't know what you're talking about.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `Quit playing games! I know you're ${this.zephyrion}. Look, my friend ${this.galadon} wrote me this letter, he told me to find you.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //41
            `${this.zephyrion}`,
            `Hmm I see, I see. How many coins do you have?`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `Coins? I don't have any right now...`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //43
            `${this.zephyrion}`,
            `I'm afraid I won't be able to help you then.`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `What!?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `${this.penguini} told me to go towards this way and I would be able to get your help...`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //46
            `${this.zephyrion}`,
            `Oh, ${this.penguini} directed you to me?`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `Yes, he did.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //48
            `${this.zephyrion}`,
            `Well if he did it's your lucky day, however, you could be lying. Touch my hand.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `Your hand...?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //50
            `${this.zephyrion}`,
            `Yes, that's the only way I can confirm you're telling me the truth.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `Well... okay...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map3OutsideCabin',
                    onBlackDelayMs: 1700,
                    beforeFade: () => {
                        this.playSFX('sorcererEnteringMindSound');
                        this.fadeOutMusic('birdsChirping');
                        this.fadeOutMusic('windBreezeSound');
                    },
                    onBlack: () => {
                        this.isCharacterBlackAndWhite = true;
                        this.isBackgroundBlackAndWhite = true;
                    },
                }),
            },
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //52
            `${this.penguini}`,
            `If you follow this river path and continue to follow up east you will meet ${this.zephyrion}. He can help you.`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //53
            `${this.firedog}`,
            `Okay, great. What does he look like?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //54
            `${this.penguini}`,
            `A sorcerer.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //55
            `${this.firedog}`,
            `He looks like a ... sorcerer?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //56
            `${this.penguini}`,
            `Yeah.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //57
            `${this.firedog}`,
            `What the hell!? What kind of description is that ${this.penguini}!?`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //58
            `${this.penguini}`,
            `Enough said ya' fool!`,
            {
                onAdvance: () => {
                    this.isCharacterBlackAndWhite = false;
                },
            },
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //59
            `${this.zephyrion}`,
            `I see. ${this.firedog} was telling the truth.`,
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //60
            `${this.zephyrion}`,
            `Hold on... I feel something.`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //61
            `${this.zephyrion}`,
            `What is this?`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamLight3',
                    onBlackDelayMs: 1700,
                    onBlack: () => {
                        this.isBackgroundBlackAndWhite = false;
                        this.playMusic('echoesOfTime', true);
                    },
                }),
            },
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //62
            `${this.zephyrion}`,
            `Where am I? Is this inside ${this.firedog}? His heart?`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //63
            `${this.zephyrion}`,
            `I feel a presence.`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //64
            `${this.zephyrion}`,
            `Is that you ${this.firedog}?`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //65
            `${this.questionMark}`,
            `Hahahaha. You filthy sorcerer.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamDark3',
                    onBlackDelayMs: 1700,
                }),
            },
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //66
            `${this.zephyrion}`,
            `Who's that? What? Why did it get so much darker?`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //67
            `${this.questionMark}`,
            `You don't come knock on my door and have the audacity to ask who I am.`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //68
            `${this.questionMark}`,
            `But I do appreciate the visit! Now, come here!`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //69
            `${this.zephyrion}`,
            `This is not good, I need to leave quickly.`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //70
            `${this.questionMark}`,
            `No, you won't.`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //71
            `${this.questionMark}`,
            `I'm going to kill you, filthy sorcerer.`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //72
            `${this.zephyrion}`,
            `This is bad.`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //73
            `${this.zephyrion}`,
            `I have no other choice.`,
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //74
            `${this.zephyrion}`,
            `Somnolence Shroud: Evanescent Dreamweave!`,
            {
                onAdvance: () => {
                    this.cutsceneBackgroundChange(500, 250, 250);
                    this.playSFX('sorcererTeleportBackSound');
                },
            },
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //75
            `${this.questionMark}`,
            `Oh? He's got tricks, lucky you, ${this.zephyrion}, you've gotten away.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map3Sorcerer',
                    onBlackDelayMs: 1700,
                    onBlack: () => {
                        this.fadeOutMusic('echoesOfTime');
                        this.playMusic('birdsChirping', true);
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
        );
        this.addDialogue( //76
            `${this.zephyrion}`,
            `Wha!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSurprised', RIGHT),
        );
        this.addDialogue( //77
            `${this.firedog}`,
            `Huh? Everything okay ${this.zephyrion}?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionSurprised', RIGHT),
        );
        this.addDialogue( //78
            `${this.zephyrion}`,
            `(What was that? It was inside ${this.firedog}? Inside of his thoughts? His heart?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionSurprised', RIGHT),
        );
        this.addDialogue( //79
            `${this.zephyrion}`,
            `Yeah. Everything is fine. You were telling the truth. ${this.penguini} did in fact tell you to come here.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //80
            `${this.zephyrion}`,
            `In this case, I won't charge you!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //81
            `${this.firedog}`,
            `Really!?`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //82
            `${this.zephyrion}`,
            `Yep! I will need to cast a spell on you in order for you to be able to breathe underwater.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //83
            `${this.zephyrion}`,
            `But be wary, you must be quick to reach the other side, the spell only lasts 7 minutes and 30 seconds.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //84
            `${this.zephyrion}`,
            `If you surface back up you will get spotted by the guards of ${this.coralAbyss}, and they won't hesitate to kill you.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //85
            `${this.zephyrion}`,
            `So I recommend you to stay underwater and only come out once it's safe.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //86
            `${this.zephyrion}`,
            `Do you want me to cast the spell on you now?`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //87
            `${this.firedog}`,
            `Wha- Now?`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //88
            `${this.firedog}`,
            `Ugh... I hate water... But I have no choice...`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //89
            `${this.firedog}`,
            `Okay... I'm all set.`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //90
            `${this.zephyrion}`,
            `Okay, get ready.`,
            {
                onAdvance: () => this.playSFX('sorcererWaterSpellSound'),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //91
            `${this.zephyrion}`,
            `Hydroaetherial Breath: Aquatic Veil!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //92
            `${this.zephyrion}`,
            `Okay... The spell has been cast. You can breathe underwater now.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //93
            `${this.zephyrion}`,
            `Don't waste too much time here on land! Every second counts!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //94
            `${this.firedog}`,
            `Awesome. Thank you so much for the help ${this.zephyrion}!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //95
            `${this.firedog}`,
            `I'll go now! Adios!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //96
            `${this.firedog}`,
            `Woohoo!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 500,
                    onBlack: () => {
                        this.playSFX('waterSplashSound');
                    },
                }),
            },
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //97
            `${this.zephyrion}`,
            `I wonder what that was.`,
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //98
            `${this.zephyrion}`,
            `That voice. I have never seen that before in all my years of sorcery.`,
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //99
            `${this.zephyrion}`,
            `Was that really inside of him?`,
            {
                onAdvance: () => {
                    this.fadeOutMusic('birdsChirping');
                    this.fadeOutMusic('windBreezeSound');
                },
            },
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //100
            `${this.zephyrion}`,
            `Haha! You sure are an interesting soul, ${this.firedog}.`,
            this.addImage('zephyrionHappy', RIGHT),
        );
    }
}
export class Map3EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('map3InsideSubmarine');
        this.game.audioHandler.cutsceneMusic.playSound('submarineSonarUnderwaterSound', true);
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };
        this.addDialogue( //0
            `${this.firedog}`,
            `That was a close call. I almost lost my breath there.`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `This space is tight. I'm definitely feeling a little bit claustrophobic in here.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I've never been in a submarine before... What a view!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `But terrifying at the same time!`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `I guess I have to wait for ${this.penguini} to come inside for us to take off.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Which means I probably have some time alone in here.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `I wonder where ${this.galadon} is right now. Hopefully I can catch up to him soon.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'blackBackground',
                    beforeFade: () => {
                        this.fadeOutMusic('submarineSonarUnderwaterSound');
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
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
        this.addDialogue( //10
            `${this.galadon}`,
            `Who was that... ugh... I got no time to think now... I'm almost there...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 1000,
                    imageId: 'map3InsideSubmarine',
                    onBlack: () => {
                        this.playMusic('submarineSonarUnderwaterSound');
                    },
                }),
            },
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `Ready to rock and roll ${this.firedog}?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Oh, we're going now!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `We sure are ya' fool! Buckle up!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `Buckle up!? Do I need to wear a seat belt for this!? Wha-`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 8000, fadeOut: 1000,
                    imageId: 'blackBackground',
                    onBlack: () => {
                        this.playSFX('submarineRevving', true);
                    },
                }),
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `We're on the surface now. We're almost reaching land.`,
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wow, that was quick.`,
            {
                onAdvance: () => {
                    this.cutsceneBackgroundChange(500, 500, 500);
                    this.fadeOutSFX('submarineRevving');
                },
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `We're here, you can leave now ya' fool!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Okay, how do I open this thing u-`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    onBlack: () => {
                        this.playSFX('submarineDoorOpening');
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Okay that works.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 2000, fadeOut: 1000,
                    imageId: 'map3ForestRiver',
                    beforeFade: () => {
                        this.fadeOutMusic('submarineSonarUnderwaterSound');
                    },
                    onBlack: () => {
                        this.playMusic('windBreezeSound');
                    },
                }),
            },
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Back on land we are!`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Wow! It's so much greener here. I guess we're in ${this.verdantVine}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Good thing I took that underwater shortcut. That should get us closer to the thief. I should keep going.`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Let's go!`,
            this.addImage(this.setfiredogSmile(), LEFT),
        );
        this.game.map4Unlocked = true;
        this.game.saveGameState();
    }
}

// Map 4 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map4StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('chapter4');
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map4beginningForestView',
                    beforeFade: () => {
                        this.playMusic('birdsChirping', true);
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `It still feels unreal that I am out here, outside my home.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I don't understand why ${this.valdorin} wouldn't let me out for pretty much my whole life... I know there is still tension among lands, but...`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `This is quite a sight... I mean, being in that submarine was quite the experience... heck! Who knew breathing underwater was possible!?`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `I really could be an explorer, and see every corner of every land. When I get back home, with the ${this.temporalTimber}, I wonder what life will be like.`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `After all these amazing experiences, there is no way I want to be stuck again inside ${this.lunarGlade}! Haha!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Hm? What's this?`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'map4footsteps',
                }),
            },
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `These... these are footsteps?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `I wonder whose footsteps these are.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `Whoever it is, it's way bigger than my feet, haha!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `These look rather fresh... I'd say only a couple of hours old.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `They seem to disappear up ahead. Hm... who could this be?`,
            {
                onAdvance: () => {
                    this.cutsceneBackgroundChange(500, 500, 500);
                    this.playSFX('dreamSound', false, true);
                },
            },
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `What...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `My head.`,
            {
                onAdvance: () => {
                    this.cutsceneBackgroundChange(500, 500, 500);
                    this.playSFX('dreamSound', false, true);
                },
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `No... it's happening while I'm awake now?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `My vision is fading... away... damn it...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamLight4',
                    onBlackDelayMs: 2100,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                        this.fadeOutMusic('birdsChirping');
                        this.fadeOutMusic('windBreezeSound');
                    },
                    onBlack: () => {
                        this.playMusic('echoesOfTime', true);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );

        this.addDialogue( //16
            `${this.firedog}`,
            `Ugh... I'm not allowing this to happen again...`,
            {
                onAdvance: () => {
                    this.playSFX('dreamSound');
                    this.cutsceneBackgroundChange(500, 1000, 500);
                },
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `Ughh! The pain is unbearable... I can't stop it from coming.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Aaaaaaahh!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamDark4',
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `I'm here again...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `(Okay, remain calm... let's figure out why this is happening.)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `What do you want from me?`,
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //22
            `${this.questionMark}`,
            `I want the same thing you want!`,
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `What...?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //24
            `${this.questionMark}`,
            `You're too naïve.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //25
            `${this.questionMark}`,
            `${this.valdorin} used your body. Because of him, I'm stuck here, inside your filthy body!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `What!? ${this.valdorin}? He didn't do anything. I would know if he did!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //27
            `${this.questionMark}`,
            `No. You wouldn't know. He used your body for his filthy experiments with the ${this.crypticToken}!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `That can't be possible...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //29
            `${this.questionMark}`,
            `You see... we both have the same goal. There is nothing you can do to stop what's coming your way.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //30
            `${this.questionMark}`,
            `Now go.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Wait, no...! I still have more questions to ask... what you're saying about ${this.valdorin} makes no sense. He would never do such a thing!`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `The ${this.crypticToken} was always kept in the safe, it was never used for... any experiment whatsoever!`,
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `Why are you in my mind? Why have these dreams been happening ever since I left ${this.lunarGlade}? Why are you doing this to me?`,
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //34
            `${this.questionMark}`,
            `Have you ever wondered why ${this.valdorin} kept you inside ${this.lunarGlade}, fool? Now, don't waste my time any further.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //35
            `${this.questionMark}`,
            `Go get what I need to come back to.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //36
            `${this.questionMark}`,
            `Now, wake up...`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `Ugh... not again...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //38
            `${this.questionMark}`,
            `Wake up... Wake up... Wake up...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map4beginningForestView',
                    beforeFade: () => {
                        this.fadeOutMusic('echoesOfTime');
                    },
                    onBlack: () => {
                        this.playMusic('birdsChirping', true);
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `Ugh... I'm back in the forest... awake...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `What that voice said... about ${this.valdorin}...`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `I don't trust that voice one bit... But why would it lie to me...?`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `Ugh... is this voice the reason ${this.valdorin} kept me inside ${this.lunarGlade} all this time?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
        );
        this.addDialogue( //43
            `${this.firedog}`,
            `"Go get what I need to come back to." - What did the voice mean by that?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `This is such a weird feeling. But I feel like I'm getting closer to the token.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `I need to keep going. Maybe I can find ${this.galadon} along the way. Perhaps he can give me the answers I seek right now.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `I wonder how everyone is doing back home... ${this.valdorin}... ${this.nysera}... what is happening to me...?`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `Okay... let's get through ${this.verdantVine}, that's what I need to focus on now.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map1KingsBedroom',
                    beforeFade: () => {
                        this.fadeOutMusic('windBreezeSound');
                        this.fadeOutMusic('birdsChirping');
                    },
                }),
            },
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //48
            `${this.nysera}`,
            `How do you feel ${this.valdorin}?`,
            this.addImage('nyseraNormal', LEFT),
        );
        this.addDialogue( //49
            `${this.valdorin}`,
            `I feel better. It seems like I'll make a full recovery.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //50
            `${this.nysera}`,
            `I'm glad to hear that.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //51
            `${this.nysera}`,
            `Do you think ${this.firedog} will be okay outside of our land?`,
            this.addImage('nyseraExplaining', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //52
            `${this.valdorin}`,
            `I hope so. It's not like we had much of a choice but to let him go now...`,
            this.addImage('nyseraExplaining', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //53
            `${this.nysera}`,
            `You didn't tell him, did you ${this.valdorin}?`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //54
            `${this.valdorin}`,
            `No. How would we? I do believe ${this.firedog} is the only one who can stop him.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //55
            `${this.nysera}`,
            `Do you think it was ${this.elyvorg}?`,
            {
                onAdvance: () => setTimeout(() => this.playMusic('inTheFuture', true), 500),
            },
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //56
            `${this.valdorin}`,
            `Yes... I believe it was. He came back for revenge for what we did 10 years ago.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //57
            `${this.nysera}`,
            `The ${this.projectCryptoterraGenesis} experiments...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1crypticTokenWallpaper',
                }),
            },
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //58
            `${this.valdorin}`,
            `Indeed. I was so astonished by the ${this.crypticToken} back then... that I had decided to create the ${this.projectCryptoterraGenesis}.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map4CloningLab',
                }),
            },
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //59
            `${this.valdorin}`,
            `A project involving the implementation of the ${this.crypticToken} inside children's hearts, in order to create... a weapon of mass destruction.`,
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //60
            `${this.valdorin}`,
            `All the children died during the implementation. Their bodies didn't know how to adapt to the power...`,
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //61
            `${this.valdorin}`,
            `After many failed experiments, we finally had a survivor. ${this.elyvorg}.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map4ElyvorgFlames',
                }),
            },
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //62
            `${this.valdorin}`,
            `His body was the first one to adapt to the intense power of the ${this.crypticToken}. I thought I had succeeded but then it all started going downhill.`,
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //63
            `${this.valdorin}`,
            `He was adapting well at first. He seemed to have perfect control of all elements, especially electricity and dark matter.`,
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //64
            `${this.valdorin}`,
            `We had put him through many tests, and he passed with ease. He was what we had hoped for, to be an invincible machine.`,
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //65
            `${this.valdorin}`,
            `A machine that would put fear in every other land. That was the goal. We had ultimate power.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map4EvilElyvorg',
                }),
            },
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //66
            `${this.valdorin}`,
            `We trained him to be strong, but the stronger he became, the more evil he became. It came to a point where he killed a few of our guards out of control.`,
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //67
            `${this.valdorin}`,
            `This is when I knew that he could no longer possess this power. We removed the ${this.crypticToken} out of his heart.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map4hospitalBedEmpty',
                }),
            },
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //68
            `${this.valdorin}`,
            `After the surgery one of the nurses opened the door to check up on ${this.elyvorg}.`,
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //69
            `${this.valdorin}`,
            `Only to find the bed empty with a note.`,
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //70
            `${this.valdorin}`,
            `"I will be back to kill you, ${this.valdorin}."`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1KingsBedroom',
                }),
            },
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //71
            `${this.valdorin}`,
            `He was a failed experiment. And he was gone. He never came back after that.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //72
            `${this.valdorin}`,
            `We continued with the ${this.projectCryptoterraGenesis} for one more year after that incident.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //73
            `${this.valdorin}`,
            `After many failed experiments we had another survivor... ${this.firedog}...`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //74
            `${this.valdorin}`,
            `With more knowledge about the risks we decided to try different methods for ${this.firedog} to control his power.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //75
            `${this.valdorin}`,
            `It started well... He seemed to have perfect control over the earth elements, although he had yet to master the elements ${this.elyvorg} had mastered.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //76
            `${this.valdorin}`,
            `But to no surprise, the same thing had started to happen to ${this.firedog}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //77
            `${this.valdorin}`,
            `He started to become less like himself, and he started having these evil dreams...`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //78
            `${this.valdorin}`,
            `Dreams he would describe as terrifying. Something in those dreams was trying to convince him to run away from ${this.lunarGlade}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //79
            `${this.valdorin}`,
            `No one quite understands why he had those dreams, other than it being a side effect of the ${this.crypticToken}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //80
            `${this.valdorin}`,
            `So we removed the ${this.crypticToken} from his heart. Before it caused any more harm.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //81
            `${this.valdorin}`,
            `Miraculously, ${this.firedog} made a good recovery. I did, however, erase his memories of the experiments we performed on him.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //82
            `${this.valdorin}`,
            `We decided to put an end to the ${this.projectCryptoterraGenesis} for good.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //83
            `${this.valdorin}`,
            `And as we thought everything was finally over, we noticed that ${this.firedog} had kept his fire element powers.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //84
            `${this.valdorin}`,
            `It is possible that ${this.elyvorg} could've also kept some of his powers too but we wouldn't know because he ran away and never came back.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //85
            `${this.valdorin}`,
            `Although, I believe he kept at least his electricity abilities. When I got struck with this electricity attack in the safe room...`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //86
            `${this.valdorin}`,
            `It reminded me of ${this.elyvorg} when he had the token inside his heart. I'm not sure what other powers he must've kept, if that was indeed him...`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //87
            `${this.valdorin}`,
            `To this day no one understands how ${this.firedog} kept his fire powers, as the doctors had completely removed the ${this.crypticToken} out of his heart.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //88
            `${this.valdorin}`,
            `It was a shame that nothing could replace the original ${this.temporalTimber} from the ${this.crypticToken}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //89
            `${this.valdorin}`,
            `But then something extremely odd started to happen.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //90
            `${this.nysera}`,
            `The evil dreams didn't stop.`,
            this.addImage('nyseraSurprised', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //91
            `${this.valdorin}`,
            `Yes. The evil dreams. ${this.firedog} had started to get these dreams again.`,
            this.addImage('nyseraSurprised', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //92
            `${this.valdorin}`,
            `This was weird, because we had successfully removed the ${this.crypticToken} from him.`,
            this.addImage('nyseraSurprised', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //93
            `${this.valdorin}`,
            `No doctor could understand what was going on. But they believed that the intense energy from the ${this.crypticToken} was somehow affecting ${this.firedog}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //94
            `${this.valdorin}`,
            `So our sorcerers worked and came up with a solution. Currently, ${this.lunarGlade} is surrounded by a protective layer built by our sorcerers.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //95
            `${this.valdorin}`,
            `This magical layer is preventing outside hidden entities from entering the land, and it also has the ability to detect unknown souls that trespass it.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //96
            `${this.valdorin}`,
            `This same exact magical layer is used to protect the safe room, where the ${this.crypticToken} was.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //97
            `${this.valdorin}`,
            `So inside the safe room, the ${this.crypticToken}'s energy is completely trapped.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //98
            `${this.valdorin}`,
            `And soon enough, ${this.firedog} started having fewer of these dreams... and then he simply became normal again.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //99
            `${this.valdorin}`,
            `This is why I believe that he is somehow connected to the token's energy, even when it had been completely removed from him.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('ValdorinTalking', RIGHT),
        );
        this.addDialogue( //100
            `${this.valdorin}`,
            `No one truly understands how or why. Even after all these centuries, the ${this.crypticToken} is still a mystery.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //101
            `${this.valdorin}`,
            `This is why I did not want him to leave the land after all these years. He doesn't seem to really remember what had happened.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //102
            `${this.valdorin}`,
            `The longer he remains out there, unprotected, the more he may be consumed by evil.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //103
            `${this.valdorin}`,
            `But I had to let him go. He might be the only one who can stop ${this.elyvorg}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //104
            `${this.valdorin}`,
            `If ${this.elyvorg} was indeed the individual who stole the ${this.crypticToken}, it would explain why he wasn't detected by the magical layer.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //105
            `${this.valdorin}`,
            `I also do believe he was the one who destroyed the traps 2 weeks ago. He was most likely testing our security... and struck at its weaknesses.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //106
            `${this.valdorin}`,
            `But I also wonder why he didn't kill me when he had the chance to. After all, he left that note years ago...`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //107
            `${this.nysera}`,
            `Could it be that whatever he is planning is way worse than having the chance to kill you?`,
            this.addImage('nyseraScared', LEFT),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //108
            `${this.valdorin}`,
            `I believe that is the case.`,
            this.addImage('nyseraScared', LEFT),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //109
            `${this.valdorin}`,
            `I do regret the ${this.projectCryptoterraGenesis}. I do regret putting these children in pain, and many lives have been taken because of me.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //110
            `${this.valdorin}`,
            `That is something I cannot erase now. And it seems karma is coming back to me...`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //111
            `${this.valdorin}`,
            `Wherever ${this.firedog} might be, I hope he manages to get the ${this.crypticToken} back to us.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //112
            `${this.nysera}`,
            `We all hope so...`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //113
            `${this.nysera}`,
            `I wonder where ${this.firedog} is right now.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
    }
}
export class Map4EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('map4InsideCabin');
        this.game.audioHandler.cutsceneMusic.playSound('blizzardWindFireplace', true);
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };
        this.addDialogue( //0
            `${this.threeDots}`,
            `So you've managed to catch up to me I see, ouch... haha...`,
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Is that you ${this.galadon}!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `What happened!? Who... who could've done this to you!?`,
            this.addImage(this.setfiredogCry2(), LEFT),
        );
        this.addDialogue( //3
            `${this.galadon}`,
            `I'm glad to see you here ${this.firedog}...`,
            this.addImage(this.setfiredogCry2(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //4
            `${this.galadon}`,
            `Don't worry, I'm fine...`,
            this.addImage(this.setfiredogCry2(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //5
            `${this.galadon}`,
            `I was trying to get through ${this.verdantVine}...`,
            this.addImage(this.setfiredogCry2(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //6
            `${this.galadon}`,
            `Everything was going fine... I was making progress through the jungle when I spotted someone up ahead.`,
            this.addImage(this.setfiredogCry2(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `What did you see?`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //8
            `${this.galadon}`,
            `I saw a hooded individual up ahead. I thought it could perhaps be an explorer at first, so I called for them.`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //9
            `${this.galadon}`,
            `But... as soon as they heard me they instantly turned around and attacked me with a vicious electric attack that shocked my whole nervous system in an instant.`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //10
            `${this.galadon}`,
            `I never felt pain like that before. That couldn't possibly be an explorer...`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //11
            `${this.galadon}`,
            `Luckily, I was near the cabin, so with all my remaining strength, I somehow managed to get here.`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //12
            `${this.galadon}`,
            `Thankfully, there were some medical kits lying around, so I used some of them to cover my wounds.`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //13
            `${this.galadon}`,
            `I'm feeling better now but it will take me some time to be able to move again properly... my legs still feel numb from the attack.`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `This is horrible... I can't believe this...`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `Why would anyone do this to you?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //16
            `${this.galadon}`,
            `I don't know... But as I was resting in this cabin I had some time to think of some possible theories.`,
            {
                onAdvance: () => this.playMusic('planetsParalysis', true),
            },
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `What theories!?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //18
            `${this.galadon}`,
            `Well... do you remember how ${this.valdorin} was attacked?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Hmm...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Now that you mention it, he did say...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1KingsBedroom',
                    onBlack: () => {
                        this.isCharacterBlackAndWhite = true;
                        this.isBackgroundBlackAndWhite = true;
                    },
                }),
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //21
            `${this.valdorin}`,
            `A dark-hooded figure knocked me down with some sort of electric attack before I could use any of my abilities.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map4InsideCabin',
                    onBlack: () => {
                        this.isCharacterBlackAndWhite = false;
                        this.isBackgroundBlackAndWhite = false;
                    },
                }),
            },
            this.addImage('valdorinSurprised', RIGHT),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `That's right! He was attacked by a dark-hooded figure, who used an electric attack as well...!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `So this means that you were most likely attacked by the same perpetrator...!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //24
            `${this.galadon}`,
            `Exactly. That is what I was thinking...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //25
            `${this.galadon}`,
            `But if indeed that was the thief who stole the ${this.crypticToken}, then this is horrible news ${this.firedog}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Oh, how come ${this.galadon}?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //27
            `${this.galadon}`,
            `This hooded individual is going towards... ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Wha! You're right... does that mean that...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //29
            `${this.galadon}`,
            `Yep... that means that whoever is behind that hood most likely knows about the ${this.temporalTimber}, and even worse, its location.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //30
            `${this.galadon}`,
            `So this situation has gone from bad to worse. We really don't have any more time to waste ${this.firedog}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `How do they know about the location of the ${this.temporalTimber}? How did they even know about the ${this.crypticToken} in the first place...`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //32
            `${this.galadon}`,
            `Trust me ${this.firedog}, I have the same questions too... But when we catch up to them and get the token back, we'll get our answers.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `I see...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `Will you be able to come with me ${this.galadon}?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //35
            `${this.galadon}`,
            `I wish I could, but it's definitely going to take me some time to recover.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //36
            `${this.galadon}`,
            `The cave is not too far off anymore ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `I understand. Is anybody from our homeland ahead of us?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //38
            `${this.galadon}`,
            `I don't think so. I'm pretty sure we're closer to the cave than any other individual from ${this.lunarGlade} on this mission.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //39
            `${this.galadon}`,
            `We both took the shortcut underwater. That saved us at least a full day. I'm glad I sent you that letter back in ${this.coralAbyss}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //40
            `${this.galadon}`,
            `Ouch... my body...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `Are you okay ${this.galadon}!?`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //42
            `${this.galadon}`,
            `Yeah... I just still feel the pain from the attack...`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //43
            `${this.galadon}`,
            `But I'll be fine...`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `(Whoever did this to you, ${this.galadon}, is going to pay for it...)`,
            { whisper: true },
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `${this.galadon}...`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //46
            `${this.galadon}`,
            `It's okay, I'll survive... For now, you should also rest for a couple minutes before you go.`,
            {
                onAdvance: () => this.fadeOutMusic('planetsParalysis'),
            },
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `Sounds like a plan.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.game.map5Unlocked = true;
        this.game.bonusMap2Unlocked = true;
        this.game.saveGameState();
    }
}

// Map 5 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map5StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('chapter5');
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map4InsideCabin',
                    beforeFade: () => {
                        this.playMusic('blizzardWindFireplace', true);
                    },
                }),
            },
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Okay, I think I've rested long enough. I should get going soon, ${this.galadon}.`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `(Oh, I just remembered...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `(I should ask ${this.galadon} about the dreams I've been having before I go.)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `(Maybe he can help me understand what is going on with me.)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `${this.galadon}, before I go, I have a question.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Ever since I left ${this.lunarGlade}, I have been having these dreams... not just dreams, but visions... where I can feel my head burning...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `And as soon as I close my eyes and open them again, I wake up in this dark room I've never seen before.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `And I start hearing this voice coming from the door in this room...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `This is harder to explain than I thought... but have you also been having these dreams or is it just me?`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //10
            `${this.galadon}`,
            `That's definitely weird. I haven't had any dreams or visions since leaving ${this.lunarGlade}.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `(Hm.. I had a feeling it was just me... but why me?)`,
            { whisper: true },
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I see... do you know what could be causing them?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //13
            `${this.galadon}`,
            `I don't think so... I've never heard about this from anyone. I'm sorry I'm not of much help right now.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `It's okay, I figured it was worth asking you either way.`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `Regardless of these weird dreams, the main goal is to get to the ${this.temporalTimber} as soon as possible.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //16
            `${this.galadon}`,
            `You're right. It seems we are the only ones ahead, but right now, due to my injuries, the only one who can stop the thief is you, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //17
            `${this.galadon}`,
            `I'm surprised by how far you've come, considering this is your first time outside ${this.lunarGlade}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `I'm surprised myself, haha! Despite being outside under these circumstances, it's still been a fun adventure.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //19
            `${this.galadon}`,
            `That's right, but we can't let ${this.lunarGlade} down.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //20
            `${this.galadon}`,
            `${this.valdorin} sees the potential in you.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //21
            `${this.galadon}`,
            `Maybe that's why he chose you for this mission.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Yeah... I guess so-`,
            {
                onAdvance: () => {
                    this.cutsceneBackgroundChange(1000, 500, 500);
                    this.playSFX('dreamSound', false, true);
                },
            },
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `(Ugh... what...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `(What is this feeling?)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `(Something feels wrong... Not the same as before... But still that same dizziness...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `(Aaaarghh!)`,
            {
                whisper: true,
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 1000,
                    imageId: 'cutsceneOperatingBed',
                    onBlackDelayMs: 1000,
                    onBlack: () => {
                        this.isCharacterSepia = true;
                        this.isBackgroundSepia = true;

                        setTimeout(() => {
                            this.playSFX('flashbackStart', false, true);
                        }, 200);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //27
            `${this.questionMark}`,
            `Don't move. You will make things more difficult, ${this.firedog}.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('nyseraNormalBlur', RIGHT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Why are you doing this to me... I can't see well...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('nyseraNormalBlur', RIGHT),
        );
        this.addDialogue( //29
            `${this.questionMark}`,
            `${this.valdorin} sees the potential in you.`,
            {
                onAdvance: () => {
                    this.isCharacterSepia = false;
                },
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('nyseraNormalBlur', RIGHT),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `(What is this? Where am I?)`,
            { whisper: true },
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `(This feels different...)`,
            { whisper: true },
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
        );

        this.addDialogue( //32
            `${this.firedog}`,
            `(This doesn't feel like the dreams I've been having... it feels like a... memory?)`,
            { whisper: true },
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `(My vision is unblurring...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `(Wait... that's...)`,
            {
                whisper: true,
                onAdvance: () => {
                    this.isCharacterSepia = true;
                },
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //35
            `${this.questionMark}`,
            `Just breathe and stop resisting so much-`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('nyseraNormalBlur', RIGHT),
        );
        this.addDialogue( //36
            `${this.nysera}`,
            `-after all, you have what it takes, unlike the other failures who didn't make it.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //37
            `${this.nysera}`,
            `Now don't try to move while I insert this syringe in your vein.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `No, please... aaaaaaarghhh!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1500, fadeOut: 500,
                    imageId: 'map4InsideCabin',
                    onBlackDelayMs: 1000,
                    onBlack: () => {
                        this.playSFX('flashbackEnd', false, true);
                        this.isCharacterSepia = false;
                        this.isBackgroundSepia = false;
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `Aaaaargh!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //40
            `${this.galadon}`,
            `Huh!? ${this.firedog}, are you okay?`,
            {
                onAdvance: () => this.playMusic('iSawSomethingAgain', true),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `(What the hell was that... Was that ${this.nysera}? Was I on an operating table?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `(That felt like a memory... Is my mind playing tricks on me, or is this all real?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //43
            `${this.firedog}`,
            `I think I just had a flashback... of a memory I never knew I had.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `What you just said...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 1000,
                    onBlack: () => {
                        this.isCharacterBlackAndWhite = true;
                        this.isBackgroundBlackAndWhite = true;
                    },
                }),
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //45
            `${this.galadon}`,
            `${this.valdorin} sees the potential in you.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    onBlack: () => {
                        this.isCharacterBlackAndWhite = false;
                        this.isBackgroundBlackAndWhite = false;
                    },
                }),
            },
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `I think it triggered a memory in my brain... A memory I never recalled having...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `In that memory, ${this.nysera} said the exact same phrase... About ${this.valdorin} seeing the potential in me...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //48
            `${this.galadon}`,
            `Huh? What does that mean...?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `It's best if I explain what's been happening in my dreams... what the voice has been telling me.. and the strange memory I just had.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //50
            `${this.galadon}`,
            `I'm all ears.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 3000, fadeOut: 500,
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //51
            `${this.galadon}`,
            `Wow... I have no words for this. Did ${this.valdorin} really do all of this?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //52
            `${this.firedog}`,
            `I refuse to believe it, trust me... But I don't know... I just don't know what is real and what is not.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //53
            `${this.galadon}`,
            `Being used as an experiment...? But for what exactly? I mean, there was never a word about this in ${this.lunarGlade}...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //54
            `${this.galadon}`,
            `How would the ${this.crypticToken} be used for these experiments as well? What would ${this.valdorin} gain from it?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //55
            `${this.galadon}`,
            `But what if this is all real? What would we do?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //56
            `${this.galadon}`,
            `It's hard to believe, but... but... I see no reason why you would lie about this, ${this.firedog}... I trust you.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //57
            `${this.firedog}`,
            `I was scared that you would think I was crazy or something. It's a relief that you trust me ${this.galadon}.`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //58
            `${this.firedog}`,
            `I just hope that it's just my mind playing tricks on me.`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //59
            `${this.galadon}`,
            `Yeah.. but isn't it weird how the dreams you've been having and the flashback you just had are kind of... related?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //60
            `${this.galadon}`,
            `But more interestingly, how your flashback was triggered by a phrase I said... the same phrase you saw in your memory?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //61
            `${this.firedog}`,
            `Yeah.. I have no explanation for why this is happening to me... I am left with more questions than answers...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //62
            `${this.firedog}`,
            `I wonder what happened next in my flashback... What happened to me?`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //63
            `${this.firedog}`,
            `Why was ${this.nysera} there...? What did she mean by the other failures who didn't make it? What was in that syringe?`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //64
            `${this.galadon}`,
            `When we come back from our mission, hopefully we can have our questions answered.`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //65
            `${this.galadon}`,
            `But right now we need to focus on the main mission, which is to get to the ${this.temporalTimber} before the thief does.`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //66
            `${this.firedog}`,
            `You're right. It doesn't seem we have much time left, and every second counts.`,
            {
                onAdvance: () => this.fadeOutMusic('iSawSomethingAgain'),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //67
            `${this.galadon}`,
            `We will get the answer to those questions, I'm sure of it, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //68
            `${this.galadon}`,
            `But as you said, every second counts. You should go now ${this.firedog}, and make sure to bring the thief down for me!`,
            {
                onAdvance: () => this.fadeOutMusic('iSawSomethingAgain'),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //69
            `${this.firedog}`,
            `I sure will for what they did to you, ${this.galadon}!`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //70
            `${this.firedog}`,
            `I will get going then. Thank you for trusting in me, I really appreciate it!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //71
            `${this.galadon}`,
            `Of course ${this.firedog}! But before you go, please be careful.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //72
            `${this.galadon}`,
            `${this.springlyLemony} is known for its tropical bipolar weather.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //73
            `${this.firedog}`,
            `I should be fine, a little bit of rain isn't going to hurt me!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //74
            `${this.galadon}`,
            `You might be right about that, the rain won't hurt you, but the enemies you find along the way may get angrier once it starts raining.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //75
            `${this.galadon}`,
            `Just be cautious when it starts raining...`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //76
            `${this.firedog}`,
            `Got it!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //77
            `${this.firedog}`,
            `Alright, I should get moving.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //78
            `${this.firedog}`,
            `Catch up to me when you feel better, ${this.galadon}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //79
            `${this.galadon}`,
            `Sounds good. Good luck out there, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //80
            `${this.firedog}`,
            `Alright, let's go!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT),
        );
    }
}
export class Map5EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('map5InsideCabin');
        this.game.audioHandler.cutsceneMusic.playSound('birdsChirping', true);

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            `${this.firedog}`,
            `I guess ${this.galadon} was right. It gets pretty dangerous when it starts to rain.`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Thankfully I managed to get to the cabin just in time, otherwise I might've been in trouble.`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `According to what ${this.penguini} said, the next obstacle will be ${this.venomveilLake}-`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //3
            `${this.threeDots}`,
            `230... 231... 232... 233...`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Huh? Who's counting? Who's there?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //5
            `${this.threeDots}`,
            `Hey! You're ruining my rock counting!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //6
            `${this.threeDots}`,
            `I'm ${this.craggle}. I'm a local here. And you are?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Oh, hello ${this.craggle}. I'm ${this.firedog}... What do you mean by rock counting...?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //8
            `${this.craggle}`,
            `I'm a rock collector. I like exploring nearby lands and collecting rocks from those places.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //9
            `${this.craggle}`,
            `I was counting how many rocks I've got so far... well, until you interrupted me!`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Oh... sorry for interrupting you...`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //11
            `${this.craggle}`,
            `I guess it's fine!`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('craggleHappy', RIGHT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `A rock collector? I didn't even know that was a thing!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('craggleHappy', RIGHT),
        );
        this.addDialogue( //13
            `${this.craggle}`,
            `It sure is! But anyway, what brings you here?`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `I'm just an explorer, although probably not as cool as being a rock collector, haha!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //15
            `${this.craggle}`,
            `Hm... that sounded sarcastic...`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('craggleSuspicious', RIGHT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Sorry, sorry!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('craggleSuspicious', RIGHT),
        );
        this.addDialogue( //17
            `${this.craggle}`,
            `Not many understand how cool rocks are.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `I guess so, haha!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //19
            `${this.craggle}`,
            `Well, if you're just exploring, you picked a strange place to stop by.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `How so?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //21
            `${this.craggle}`,
            `Not many travelers make it this far. Most of them turn back long before they get here.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //22
            `${this.craggle}`,
            `The farther you go from here, the less friendly the lands become.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Yeah... I've kinda noticed that already.`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //24
            `${this.craggle}`,
            `Still, this cabin is useful.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //25
            `${this.craggle}`,
            `Travelers leave all sorts of things behind sometimes. Coins, tools... and occasionally rocks.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `So that's why you like staying here?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //27
            `${this.craggle}`,
            `Exactly! It's like the world delivers little treasures to me.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('craggleHappy', RIGHT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Haha, I never thought rocks could be called treasures.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('craggleHappy', RIGHT),
        );
        this.addDialogue( //29
            `${this.craggle}`,
            `That's because you don't understand rocks yet.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('craggleHappy', RIGHT),
        );
        this.addDialogue( //30
            `${this.craggle}`,
            `Every rock tells a story. Where it came from, how old it is, what kind of land shaped it...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Huh... I never looked at it that way before.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //32
            `${this.craggle}`,
            `Most don't.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //33
            `${this.craggle}`,
            `But if you spend enough time with rocks, they start making sense.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `I don't know if I'm ready for that level of wisdom yet, ${this.craggle}.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //35
            `${this.craggle}`,
            `Haha! Fair enough.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('craggleHappy', RIGHT),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `Anyway... I think I'll rest here for a little while longer before I head out again.`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //37
            `${this.craggle}`,
            `Good idea. You look like you've had a long journey.`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `You could say that.`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('craggleNormal', RIGHT),
        );

        this.game.map6Unlocked = true;
        this.game.saveGameState();
    }
}

// Map 6 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map6StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('chapter6');

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map5InsideCabin',
                }),
            },
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `(Okay, I need to get going soon... but I can rest for just a little bit longer.)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //2
            `${this.craggle}`,
            `234... 235... 236... 237...`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `(He's still counting those rocks...)`,
            { whisper: true },
            this.addImage(this.setfiredogSigh(), LEFT),
        );
        this.addDialogue( //4
            `${this.craggle}`,
            `238... 239... 240...`,
            this.addImage(this.setfiredogSigh(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `(Why does that sound so familiar all of a sudden?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //7
            `${this.craggle}`,
            `241... 242... 243...`,
            {
                onAdvance: () => {
                    this.cutsceneBackgroundChange(500, 500, 500);
                    this.playSFX('dreamSound', false, true);
                },
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `(Ugh...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `(No... not again...)`,
            {
                whisper: true,
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 1000,
                    imageId: 'cutsceneOperatingBed',
                    onBlackDelayMs: 1000,
                    onBlack: () => {
                        this.isCharacterSepia = true;
                        this.isBackgroundSepia = true;

                        setTimeout(() => {
                            this.playSFX('flashbackStart', false, true);
                        }, 200);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //10
            `${this.nysera}`,
            `Pulse is unstable...`,
            this.addImage('nyseraNormal', LEFT),
        );
        this.addDialogue( //11
            `${this.valdorin}`,
            `Count again.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //12
            `${this.nysera}`,
            `241... 242... 243...`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //13
            `${this.nysera}`,
            `It keeps getting higher. We might lose him! What do we do?`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `It hurts...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //15
            `${this.nysera}`,
            `The ${this.crypticToken} is reacting.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //16
            `${this.nysera}`,
            `If we continue, we may lose him.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //17
            `${this.valdorin}`,
            `Continue.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //18
            `${this.valdorin}`,
            `After many failures, ${this.firedog} is the second one to have gotten this far.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //19
            `${this.valdorin}`,
            `He seemed like a success. He could become the weapon of mass destruction we need to strike fear and conquer the other lands.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //20
            `${this.valdorin}`,
            `Damn it... he's becoming less like himself... But we can't give up. He may be our last chance to create the weapon we need.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //21
            `${this.valdorin}`,
            `Do whatever it takes to bring him back to himself again.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Aaaaaaaargh!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 3500, fadeOut: 500,
                    imageId: 'blackBackground',
                    onBlackDelayMs: 1000,
                    onBlack: () => {
                        this.playSFX('flashbackEnd', false, true);
                        this.isCharacterSepia = false;
                        this.isBackgroundSepia = false;
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `What? Am I inside a lost memory again...?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `Why is everything black now... I can't see a thing...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Wait... I feel something...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `I feel like I'm both awake and asleep... I feel so dizzy...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 1000,
                    imageId: 'cutsceneOperatingBed',
                    onBlackDelayMs: 1000,
                    onBlack: () => {
                        this.isCharacterSepia = true;
                        this.isBackgroundSepia = true;

                        setTimeout(() => {
                            this.playSFX('flashbackStart', false, true);
                        }, 200);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //27
            `${this.nysera}`,
            `His pulse is finally stabilizing.`,
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //28
            `${this.valdorin}`,
            `The removal of the ${this.crypticToken} was successful.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //29
            `${this.nysera}`,
            `But look at him. He can barely breathe.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //30
            `${this.valdorin}`,
            `He survived. That is more than the others did.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //31
            `${this.nysera}`,
            `And if he remembers any of this?`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //32
            `${this.valdorin}`,
            `He must not.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //33
            `${this.nysera}`,
            `Will you erase his memories?`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //34
            `${this.valdorin}`,
            `We have no other choice.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //35
            `${this.nysera}`,
            `And if he starts showing signs again?`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //36
            `${this.valdorin}`,
            `We will have to keep him inside ${this.lunarGlade}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //37
            `${this.nysera}`,
            `For how long?`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //38
            `${this.valdorin}`,
            `For as long as it takes.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //39
            `${this.nysera}`,
            `And if he starts asking questions when he's older?`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //40
            `${this.valdorin}`,
            `Then we lie.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `...Why...?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //42
            `${this.nysera}`,
            `Oh, he's awake.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //43
            `${this.valdorin}`,
            `No. He's only semi-conscious.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //44
            `${this.valdorin}`,
            `What a shame... another failure. I really thought ${this.firedog} was the one who could control its power.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //45
            `${this.valdorin}`,
            `But maybe no one can.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //46
            `${this.valdorin}`,
            `Prepare the memory spell, ${this.nysera}.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1500, fadeOut: 500,
                    imageId: 'map4InsideCabin',
                    onBlackDelayMs: 1000,
                    onBlack: () => {
                        this.playSFX('flashbackEnd', false, true);
                        this.isCharacterSepia = false;
                        this.isBackgroundSepia = false;
                    },
                }),
            },
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `Aaaah!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //48
            `${this.craggle}`,
            `Hey! You are interrupting my counting again!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `(It happened again... I just had another flashback...)`,
            { whisper: true },
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //50
            `${this.firedog}`,
            `(And ${this.valdorin}... he erased all my memories?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `(That would explain why I don't recall any of these memories... was I meant to never remember this?)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //52
            `${this.firedog}`,
            `(He also said that if I ever started showing signs again, they would keep me inside ${this.lunarGlade}...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //53
            `${this.firedog}`,
            `(So all those years... was I really trapped there because of what they did to me?)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //54
            `${this.firedog}`,
            `(${this.valdorin} said I was the second one to get that far... Who was the first?)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //55
            `${this.firedog}`,
            `(I hate this feeling... was I really used as an experiment?)`,
            { whisper: true },
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //56
            `${this.firedog}`,
            `(It all seems to make sense... But ${this.valdorin} always took care of me... I really don't want to believe this until I get a chance to talk to him...)`,
            { whisper: true },
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //57
            `${this.firedog}`,
            `(But at the same time, is it safe for me to come back to ${this.lunarGlade}?)`,
            { whisper: true },
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //58
            `${this.firedog}`,
            `(I don't want to ignore these flashbacks I just had, but I have no time to think now. I need to get going.)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //59
            `${this.firedog}`,
            `(After all, if the ${this.crypticToken} is in the wrong hands, it doesn't matter what is true or not. The whole world could be at stake right now.)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //60
            `${this.firedog}`,
            `Alright...`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //61
            `${this.firedog}`,
            `I think I've rested long enough.`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //62
            `${this.craggle}`,
            `Leaving already?`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //63
            `${this.firedog}`,
            `Yeah. I still have a long way to go.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //64
            `${this.craggle}`,
            `Where are you headed?`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //65
            `${this.firedog}`,
            `I'm trying to reach a cave near ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //66
            `${this.craggle}`,
            `${this.infernalCraterPeak}?`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //67
            `${this.craggle}`,
            `How interesting.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //68
            `${this.craggle}`,
            `A strange traveler passed by near here not too long ago. They looked a bit intimidating, but I saw them from the cabin's window.`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
        );
        this.addDialogue( //69
            `${this.craggle}`,
            `It seemed that they were running toward ${this.venomveilLake}.`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
        );
        this.addDialogue( //70
            `${this.craggle}`,
            `So I can only assume they were heading toward ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
        );
        this.addDialogue( //71
            `${this.firedog}`,
            `Wait... what did they look like?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //72
            `${this.craggle}`,
            `Hard to say exactly as I only saw them from afar.`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //73
            `${this.craggle}`,
            `But they were wearing a dark hood. Well, that's all I could make out.`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //74
            `${this.firedog}`,
            `A dark hood...?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //75
            `${this.craggle}`,
            `Yeah, that's what it looked like to me.`,
            {
                onAdvance: () => this.playMusic('ohNo', true),
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //76
            `${this.firedog}`,
            `(Wait... that's the thief!)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //77
            `${this.firedog}`,
            `Oh no! How long ago did you see this traveler?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //78
            `${this.craggle}`,
            `It must've been a couple of hours ago, I'd say.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //79
            `${this.firedog}`,
            `(Damn it... a couple of hours... I'm still so far behind!)`,
            { whisper: true },
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //80
            `${this.craggle}`,
            `Why do you look so worried? Do you know this traveler?`,
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //81
            `${this.firedog}`,
            `Something like that. But I have no time to waste. I need to leave right now.`,
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //82
            `${this.craggle}`,
            `Are you sure? You still look exhausted.`,
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //83
            `${this.firedog}`,
            `Exhausted or not, if I don't go now, this could be the end for everyone!`,
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //84
            `${this.craggle}`,
            `I... don't understand...`,
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //85
            `${this.firedog}`,
            `Thanks for letting me know, ${this.craggle}. I have to go now!`,
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //86
            `${this.craggle}`,
            `Oh... alright. If you find any precious rocks, please keep some for m-`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 250, blackDuration: 500, fadeOut: 250,
                    onBlackDelayMs: 600,
                    beforeFade: () => {
                        this.fadeOutMusic('ohNo');
                        this.playSFX('doorOpening');
                    },
                }),
            },
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //87
            `${this.craggle}`,
            `Oh... ${this.firedog} just left...`,
        );
        this.addDialogue( //88
            `${this.craggle}`,
            `Now then... where was I?`,
        );
        this.addDialogue( //89
            `${this.craggle}`,
            `247... 248... 249... 250...`,
        );
    }
}
export class Map6EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('map6InsideCabin');

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Phew... I finally made it.`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `That was rough. ${this.venomveilLake} is no joke...`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `At least this cabin is empty. I can rest for a moment.`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `I've come so far in such a short time... farther than I ever imagined I would.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `A few days ago I had never even stepped outside ${this.lunarGlade}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Now I've crossed the haunted graves of ${this.nightfallPhantomGraves}, traveled beneath the waters of ${this.coralAbyss}, passed through ${this.verdantVine}.`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Survived the wild weather of ${this.springlyLemony}, and barely made it through the poisonous lake of ${this.venomveilLake}.`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `It almost feels unreal... like my whole life changed the moment I left home.`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `And maybe that's exactly when all of this started getting worse.`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `The dreams... the voice... the headaches... the flashbacks...`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Back in ${this.nightfallPhantomGraves}, I thought it was just a nightmare. Something strange, but still only a dream.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `But after that, it kept happening. And each time it felt more real than the last.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Then in ${this.verdantVine}, it happened while I was awake.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `That was when I knew this wasn't just my imagination.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `And the voice... it kept saying the same thing. That I have to keep going.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `And that ${this.valdorin} used me. That he did experiments on me with the ${this.crypticToken}.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `At first I refused to believe any of it.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `But then the flashbacks started... first when I was with ${this.galadon} in the cabin at ${this.verdantVine}`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `And then again when I was with ${this.craggle} in ${this.springlyLemony}.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Not dreams. Memories. Triggered by words.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Memories of me on an operating table... in pain...`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `And the worst part is... those memories line up with what the voice has been telling me.`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `So if those flashbacks are real... then ${this.valdorin} and ${this.nysera} know far more than they've ever told me.`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `And maybe that is the real reason I was never allowed to leave ${this.lunarGlade}.`,
            this.addImage(this.setfiredogCry(), LEFT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `Not because the world was too dangerous... but because leaving might lead me to the truth.`,
            this.addImage(this.setfiredogCry(), LEFT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Maybe they were afraid of that. But if that's true... then why let me leave for this mission at all?`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `The farther I get from home, the stronger these visions become.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `Maybe it's because I'm farther from ${this.lunarGlade}... or maybe it's because I'm getting closer to the ${this.crypticToken}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Either way, this can't be a coincidence anymore.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `Then there's the thief...`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `The one who stole the ${this.crypticToken}, attacked ${this.valdorin}, and left ${this.galadon} barely able to move.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Every clue points to the same person. A hooded figure using electric attacks... and moving toward ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `And now I know for certain that this thief is ahead of me.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `If they are heading for the cave, then they must know about the ${this.temporalTimber}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `But only the higher-ups in ${this.lunarGlade} were supposed to know where it was hidden.`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `So either someone from home betrayed us... or the thief is connected to ${this.lunarGlade} in a way I still don't understand.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `And somehow... it feels like all of this connects back to me too.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `The voice. The experiments. The missing memories. The token. The thief.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `It's all tied together somehow. I'm sure of it now.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `But no matter how much I think about it, I'm still missing too many pieces.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `I still don't know who that voice truly is.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `And I still don't know whether I can trust ${this.valdorin} anymore...`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `...but I also can't forget that he raised me.`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //43
            `${this.firedog}`,
            `Damn it... none of this is simple anymore.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `Still... one thing is clear.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `If the thief reaches the cave first and connects the ${this.crypticToken} to the ${this.temporalTimber}... then none of these questions will matter.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `Because if that happens, everything could be over before I ever learn the truth.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `So for now, I can't let myself get lost in all these thoughts.`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //48
            `${this.firedog}`,
            `First I stop the thief. First I protect the world.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `Then... once this is over... I'll get my answers.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //50
            `${this.firedog}`,
            `Hopefully ${this.galadon} can catch up soon... but until then, I have to keep moving.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `Alright... just a little more rest... then I'm leaving.`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );

        this.game.map7Unlocked = true;
        this.game.saveGameState();
    }
}

// Map 7 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map7StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('chapter7');
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };


        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'blackBackground',
                }),
            },
        );
        this.addDialogue( //1
            `${this.questionMark}`,
            `Hahahaha. We're almost there... Soon it'll be all over... And a new world will begin!`,
        );
        this.addDialogue( //2
            `${this.questionMark}`,
            `No one is going to stop you.`,
        );
        this.addDialogue( //3
            `${this.questionMark}`,
            `And everyone will suffer!`,
        );
        this.addDialogue( //4
            `${this.questionMark}`,
            `Space-time will be reshaped into whatever you want!`,
        );
        this.addDialogue( //5
            `${this.questionMark}`,
            `And you'll have full control of the dimensional space!`,
        );
        this.addDialogue( //6
            `${this.questionMark}`,
            `Once we connect the ${this.crypticToken} to the ${this.temporalTimber}, the world will be at your knees!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'dreamLight5',
                    onBlackDelayMs: 1100,
                    onBlack: () => {
                        this.playMusic('echoesOfTime', true);
                    },
                }),
            },
        );
        this.addDialogue( //7
            `${this.questionMark}`,
            `You've done well so far ${this.elyvorg}. I'm impressed.`,
        );
        this.addDialogue( //8
            `${this.elyvorg}`,
            `They'll all pay for what they've done.`,
        );
        this.addDialogue( //9
            `${this.questionMark}`,
            `Indeed, they will!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'dreamDark5',
                    onBlackDelayMs: 1100,
                    onBlack: () => {
                        this.playMusic('crypticTokenDarkAmbienceSound', true);
                    },
                }),
            },
        );
        this.addDialogue( //10
            `${this.elyvorg}`,
            `It's so bright... and so beautiful...`,
        );
        this.addDialogue( //11
            `${this.elyvorg}`,
            `Who would know that something so astonishing could destroy the whole world.`,
        );
        this.addDialogue( //12
            `${this.questionMark}`,
            `It'll be even shinier once you find the ${this.temporalTimber}.`,
        );
        this.addDialogue( //13
            `${this.elyvorg}`,
            `I don't doubt it.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'map6InsideCabin',
                    onBlackDelayMs: 1100,
                    onBlack: () => {
                        this.fadeOutMusic('echoesOfTime');
                        this.fadeOutMusic('crypticTokenDarkAmbienceSound');
                        this.playMusic('birdsChirping', true);
                    },
                }),
            },
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `Okay, I feel a bit more refreshed now!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `I know ${this.galadon} said he would take some time to recover, but I had small hopes to see him opening that door.`,
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `I guess I'll be alone for this last journey. I'll go now then.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 250, blackDuration: 250, fadeOut: 250,
                    onBlackDelayMs: 600,
                    beforeFade: () => {
                        this.playSFX('doorOpening');
                    },
                }),
            },
            this.addImage(this.setfiredogSad(), LEFT),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `Wha- Is that you ${this.galadon}!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Do I look like a ${this.galadon} to you?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinGunUp', RIGHT),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Oh... Hi ${this.penguini}, what's going on?`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('penguinGunUp', RIGHT),
        );
        this.addDialogue( //20
            `${this.penguini}`,
            `Nothing, nothing. Are you leaving now ya' fool?`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //21
            `${this.penguini}`,
            `My brother reached out to me telepathically. He said you were heading to ${this.infernalCraterPeak}. Is that right?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Yes, I was just about to leave actually.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //23
            `${this.penguini}`,
            `I see. Let me take you to the safest path. There's loads of dead ends on the way to ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //24
            `${this.penguini}`,
            `So if you want to save time, I'll show you the path you need to take.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Oh, that's so kind of you ${this.penguini}! Sure thing!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //26
            `${this.penguini}`,
            `Stop saying that ya' fool!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('penguinGunUp', RIGHT),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `Haha, I know you care about me deep inside ${this.penguini}!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('penguinGunUp', RIGHT),
        );
        this.addDialogue( //28
            `${this.penguini}`,
            `Whatever you say, ya' fool.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //29
            `${this.penguini}`,
            `Now, follow me.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 3500, fadeOut: 500,
                    imageId: 'map7EnteringVolcanoZone',
                    onBlackDelayMs: 3600,
                    beforeFade: () => {
                        this.fadeOutMusic('birdsChirping');
                        setTimeout(() => {
                            this.playSFX('walkingCutsceneSound');
                        }, 600);
                    },
                    onBlack: () => {
                        this.playMusic('bubblingVolcanoLavaSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //30
            `${this.penguini}`,
            `Okay, we are now in ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //31
            `${this.penguini}`,
            `Be careful with the enemies in here. And don't get lost ya' fool!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `I see. Thank you for this ${this.penguini}! I would've definitely gotten lost if you didn't lead me here.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `Wait... do I have to pay you for this?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //34
            `${this.penguini}`,
            `No. Free of charge this time. Although you probably won't make it out alive ya' fool! Hahahaha!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinGunLaugh', RIGHT),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `Those are very reassuring words ${this.penguini}..`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinGunLaugh', RIGHT),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `Anyways, I'll be going now. I'll try to keep my distance from the active volcanoes!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinGunLaugh', RIGHT),
        );
        this.addDialogue( //37
            `${this.penguini}`,
            `Good luck out there ${this.firedog}, adios!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    onBlackDelayMs: 1100,
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguinGunTalkNormal', RIGHT),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `This is it. This is ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `Everything has led up to this moment... Let's find the cave.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
    }
}
export class Map7EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('blackBackground');
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };
        this.addDialogue( //0
            `${this.firedog}`,
            `Where did ${this.elyvorg} go...? It's so dark in here. I can't see anything...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map7FiredogEnteringCave',
                    onBlack: () => {
                        this.playMusic('bubblingVolcanoLavaSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `It's scorching hot in here... There's lava inside this cave...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I feel so weird being here... It feels like I've been here before...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `I've got no time to waste. Let's stop ${this.elyvorg} from getting to the ${this.temporalTimber} before it's too late.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                }),
            },
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Ouch... my head...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `No... not now... it feels so much stronger now...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `The pain is unbearable... damn it... no...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `This has to be the worst... timing... eve-`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamLight6',
                    onBlackDelayMs: 1800,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                        this.fadeOutMusic('bubblingVolcanoLavaSound');
                    },
                    onBlack: () => {
                        this.playMusic('echoesOfTime', true);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //8
            `${this.questionMark}`,
            `Hahahaha. We're here.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //9
            `${this.questionMark}`,
            `Finally. I've waited for this moment for a long time.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'dreamDark6',
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //10
            `${this.questionMark}`,
            `You will soon be nothing but a sacrifice, and I will be reunited with the ${this.crypticToken} once again after so long!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `What... Is this why you wanted me here quickly?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Damn it... I see...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `I can't believe this...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `So you want to kill me here... as long as I'm alive the ${this.crypticToken} won't be as powerful...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //15
            `${this.questionMark}`,
            `Kill you? Hahahahaha! You were already dead from the moment the fragments got stuck in your heart years ago!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //16
            `${this.questionMark}`,
            `You'll be nothing but a sacrifice.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `What... but doesn't ${this.elyvorg} also have fragments in his body?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //18
            `${this.questionMark}`,
            `Yes... but the difference between you and ${this.elyvorg} is that ${this.elyvorg} is far more evil. Far stronger than you...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //19
            `${this.questionMark}`,
            `He'll use his body as a vessel for the ${this.crypticToken} with its full power from the ${this.temporalTimber}.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Damn it...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //21
            `${this.questionMark}`,
            `There is nothing you can do to stop me. I can feel the energy of the ${this.temporalTimber} nearby...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //22
            `${this.questionMark}`,
            `Hahahahaha, yes... true power will be once again reignited!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Ugh...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `(This isn't good... I'm feeling less of myself the more time passes by...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `(This can't be the end of me...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `(I need to come back to reality...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //27
            `${this.questionMark}`,
            `You can't! Hahahaha! You're stuck in here with me now. The mere presence of the ${this.temporalTimber} is filling me with immense power.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //28
            `${this.questionMark}`,
            `I can keep you here until your physical body is killed, and all of me is going to be returned to where it belongs.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //29
            `${this.questionMark}`,
            `I do have to thank ${this.valdorin} for allowing you to come here! Such a fool! Hahahahaha!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Damn it...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `(I can't snap out of it... my consciousness is slowly fading away...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `(I'm sorry ${this.galadon}... but this might be it for me... I'm stuck in here...)`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'blackBackground',
                    onBlack: () => {
                        this.fadeOutMusic('echoesOfTime');
                    },
                }),
            },
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //33
            `${this.galadon}`,
            `${this.penguini} are you okay? Your brother from ${this.springlyLemony} told me what happened. I was faster than your brothers but they'll arrive shortly.`,
        );
        this.addDialogue( //34
            `${this.penguini}`,
            `Ugh... yes, ${this.galadon}... ${this.firedog} went inside... you should go follow him... whoever attacked me is truly strong.`,
        );
        this.addDialogue( //35
            `${this.galadon}`,
            `I'll go now, we don't have much time.`,
        );
        this.addDialogue( //36
            `${this.galadon}`,
            `(I hope you managed to stop him, ${this.firedog}. I'll be there soon.)`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'map7ElyvorgInsideCave',
                    onBlack: () => {
                        this.playMusic('bubblingVolcanoLavaSound', true);
                    },
                }),
            },
            { whisper: true },
        );
        this.addDialogue( //37
            `${this.elyvorg}`,
            `They really tried to hide it away from me, as if that would make it harder to find the ${this.temporalTimber}.`,
        );
        this.addDialogue( //38
            `${this.elyvorg}`,
            `But due to your lack of competence ${this.valdorin}, I can feel where it is.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'map7TemporalTimberLocation',
                }),
            },
        );
        this.addDialogue( //39
            `${this.elyvorg}`,
            `I can see now. Let's get closer to it.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'map7TemporalTimber1',
                }),
            },
        );
        this.addDialogue( //40
            `${this.elyvorg}`,
            `So this is it... the ${this.temporalTimber}.`,
        );
        this.addDialogue( //41
            `${this.elyvorg}`,
            `It won't be at 100% power because ${this.firedog} still has fragments of the token inside of him.`,
        );
        this.addDialogue( //42
            `${this.elyvorg}`,
            `But I can activate the ${this.crypticToken} now, and kill him later.`,
        );
        this.addDialogue( //43
            `${this.elyvorg}`,
            `So, let's fit the ${this.crypticToken} here.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    onBlack: () => {
                        this.playSFX('insertingCrypticToken');
                    },
                    imageId: 'map7TemporalTimber2',
                }),
            },
        );
        this.addDialogue( //44
            `${this.elyvorg}`,
            `Now, show me true power.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'map7TemporalTimber3',
                    onBlack: () => {
                        this.playMusic('groundShakingSound', true);
                        this.game.startShake(0);
                    },
                }),
            },
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
        this.addDialogue( //48
            `${this.elyvorg}`,
            `Now the ${this.crypticToken} is activated. The last step is to replace my own heart with it.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'map7TemporalTimberActive',
                }),
            },
        );
        this.addDialogue( //49
            `${this.elyvorg}`,
            `But first, I need to kill you, ${this.firedog}...`,
        );
        this.addDialogue( //50
            `${this.elyvorg}`,
            `Once you're dead the ${this.crypticToken} will become whole again, and I will attain the power of a God!`,
        );
        this.addDialogue( //51
            `${this.elyvorg}`,
            `I've won. You're all going to die now.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'map1KingsBedroom',
                    beforeFade: () => {
                        this.fadeOutMusic('bubblingVolcanoLavaSound');
                    },
                }),
            },
        );
        this.addDialogue( //52
            `${this.nysera}`,
            `The ground... the ground is shaking...`,
            this.addImage('nyseraScared', LEFT),
            this.addImage('valdorinSurprised', RIGHT),
        );
        this.addDialogue( //53
            `${this.nysera}`,
            `Does that mean...`,
            this.addImage('nyseraScared', LEFT),
            this.addImage('valdorinSurprised', RIGHT),
        );
        this.addDialogue( //54
            `${this.valdorin}`,
            `Yes... ${this.elyvorg} managed to find the ${this.temporalTimber}...`,
            this.addImage('nyseraScared', LEFT),
            this.addImage('valdorinSurprised', RIGHT),
        );
        this.addDialogue( //55
            `${this.valdorin}`,
            `We were too late...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'map7FiredogFurtherIntoTheCave',
                    onBlack: () => {
                        this.playMusic('bubblingVolcanoLavaSound', true);
                    },
                }),
            },
            this.addImage('nyseraScared', LEFT),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //56
            `${this.galadon}`,
            `Wow!? The ground is shaking so violently... What is happening? This is not good...`,
            this.addImage('galadonScaredHurt', LEFT),
        );
        this.addDialogue( //57
            `${this.galadon}`,
            `Wait... ${this.firedog}, is that you!?`,
            this.addImage('galadonScaredHurt', LEFT),
        );
        this.addDialogue( //58
            `${this.galadon}`,
            `Hey snap out of it! Wake up ${this.firedog}.`,
            this.addImage('galadonScaredHurt', LEFT),
        );
        this.addDialogue( //59
            `${this.galadon}`,
            `What's happening? Why aren't you waking up?`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'dreamLight7',
                    beforeFade: () => {
                        this.fadeOutMusic('bubblingVolcanoLavaSound');
                    },
                }),
            },
            this.addImage('galadonScaredHurt', LEFT),
        );
        this.addDialogue( //60
            `${this.firedog}`,
            `Wha- The ground... what's going on...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //61
            `${this.questionMark}`,
            `After centuries... finally... this world shall know pain.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //62
            `${this.galadon}`,
            `${this.firedog} wake up! This isn't the time to be asleep! Snap out of it now!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //63
            `${this.firedog}`,
            `I can hear ${this.galadon}!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //64
            `${this.firedog}`,
            `I think this is working... ${this.galadon} is slowly snapping me out of this place...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //65
            `${this.galadon}`,
            `Wake up ${this.firedog}, the whole ground is shaking, we need to stop ${this.elyvorg} now!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //66
            `${this.firedog}`,
            `(That's it... I'm going to snap out of it!)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //67
            `${this.galadon}`,
            `Wake up... Wake up... WAKE UP!`,
            {
                onAdvance: () => {
                    this.removeEventListeners();
                    this.fadeOutMusic('groundShakingSound');
                    this.cutsceneBackgroundChange(2000, 1000, 3500);
                    setTimeout(() => {
                        this.playMusic('gta4Theme', true);
                        this.game.stopShake();
                        this.backgroundImage = document.getElementById('toBeContinued');
                    }, 2000 + 100);
                    setTimeout(() => { this.addEventListeners(); }, 6500);
                },
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //68
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 2000, blackDuration: 1000, fadeOut: 3500,
                    imageId: 'madeByDanial',
                }),
            },
        );
        this.addDialogue( //69
            ``,
            ``,
        );
        this.game.elyvorgDefeated = true;
        this.game.saveGameState();
    }
}

// Bonus Map 1 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class BonusMap1StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('bonusChapter1');
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1InsideCabinNight',
                    beforeFade: () => {
                        this.playMusic('blizzardWindFireplace', true);
                    },
                }),
            },
        );
        this.addDialogue( //1
            `${this.threeDots}`,
            `Please, you have to help me!`,
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `Ugh... what time is it...?`,
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `I'm exhausted...`,
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `No can do. You need to leave ya' fool!`,
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `That's ${this.penguini} talking outside... but I don't recognize the other voice.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //6
            `${this.threeDots}`,
            `Please believe me... There is something unusual going on up in ${this.iceboundCave}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //7
            `${this.penguini}`,
            `Not my problem... unless you have some coins.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `Then maybe I can have one of my brothers up there investigate for you.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //9
            `${this.threeDots}`,
            `I don't have any coins unfortunately...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //10
            `${this.penguini}`,
            `Then I guess you're out of luck!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `Ugh.. Seriously.. I'm trying to sleep...`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I should go outside and see what's going on.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map2outsideCabin',
                    beforeFade: () => {
                        this.fadeOutMusic('exaleDeskant');
                        this.fadeOutMusic('blizzardWindFireplace');
                    },
                    onBlack: () => {
                        this.playSFX('doorOpening');
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Hey, what's going on out here?`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //14
            `${this.threeDots}`,
            `Oh! I'm sorry... I didn't mean to wake anyone.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `It's fine. You sounded desperate. I am ${this.firedog}, and you are?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //16
            `${this.threeDots}`,
            `My name is ${this.aurellia}, and yes... I am desperate...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //17
            `${this.aurellia}`,
            `I came down from the outskirts near ${this.iceboundCave}. Something has changed there.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `${this.iceboundCave}?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //19
            `${this.aurellia}`,
            `Yes. ${this.iceboundCave} is known for its caves and dozens of different entrances. It is a land up north, hard to reach due to how snowy and cold it is.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //20
            `${this.aurellia}`,
            `It was always cold, but never like this.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //21
            `${this.aurellia}`,
            `The wind there now bites through fur and bone. The paths are freezing over faster than they should.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //22
            `${this.aurellia}`,
            `Creatures have been fleeing from the cave... and the few who went inside never returned.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //23
            `${this.aurellia}`,
            `There's been a few avalanches that crashed down just a few miles from our village. If it keeps going like this...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //24
            `${this.aurellia}`,
            `The whole village may eventually be drowned in snow... This is extremely bad... This is why I am asking for help!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `That doesn't sound normal at all...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //26
            `${this.penguini}`,
            `Well, it would definitely affect my brother's business up in ${this.iceboundCave}... That would be no good.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //27
            `${this.penguini}`,
            `Yeah, you should go see what is going on up there, ${this.firedog}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `What the hell!? Why do I have to go? Just because it would benefit your business if I fixed the problem?`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //29
            `${this.penguini}`,
            `Will you really let this disaster happen? Ya' fool!`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Why are you making it seem like this is all my fault if I don't go there!?`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('penguinBatTalkNormal', RIGHT),
        );
        this.addDialogue( //31
            `${this.aurellia}`,
            `Please... I just need to know what is happening there before more people disappear.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //32
            `${this.aurellia}`,
            `And if the rumors are true.. then it would explain it...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `Rumors? What rumors?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //34
            `${this.aurellia}`,
            `Some say an ancient ice beast has awakened deep inside the cave.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //35
            `${this.aurellia}`,
            `Others say it is a guardian... or a king of frost.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //36
            `${this.aurellia}`,
            `They call it ${this.glacikal}.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //37
            `${this.aurellia}`,
            `It is believed that he is the one causing all the problems...`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `${this.glacikal}...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //39
            `${this.penguini}`,
            `I heard ${this.glacikal} was nothing but an old legend. Even my brothers up in ${this.iceboundCave} have never seen such a monster!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaExplaining', RIGHT),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `(Hm... An ice cave... people disappearing...)`,
            { whisper: true },
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `(This has nothing to do with the ${this.crypticToken}... Do I even have time for this?)`,
            { whisper: true },
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `(But I can't just ignore this either...)`,
            { whisper: true },
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //43
            `${this.firedog}`,
            `(Ugh...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('penguinBatUp', RIGHT),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `Okay, fine... I'll go check out ${this.iceboundCave}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //45
            `${this.aurellia}`,
            `Really!?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `Yeah. I can't promise anything, but I can at least investigate.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //47
            `${this.aurellia}`,
            `Thank you... truly.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //48
            `${this.firedog}`,
            `No worries ${this.aurellia}! Lead me to ${this.iceboundCave}!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //49
            `${this.aurellia}`,
            `Yes... Please follow me!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 3000, fadeOut: 500,
                    imageId: 'bonusMap1Village',
                    onBlack: () => {
                        this.playSFX('walkingCutsceneSound');
                        setTimeout(() => {
                            this.playMusic('tundraSuite', true);
                        }, 3000);
                    },
                }),
            },
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //50
            `${this.aurellia}`,
            `We are currently in a small village near ${this.iceboundCave}, this is the village I grew up in!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `Oh wow! It is so cold! I never saw so much snow in my life!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //52
            `${this.firedog}`,
            `I had no idea such a village existed.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //53
            `${this.aurellia}`,
            `It is indeed a beautiful place to live in. However, recently, many of the villagers have been preparing to leave.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //54
            `${this.aurellia}`,
            `We collect water and find treasures inside the cave, but without being able to go inside...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //55
            `${this.aurellia}`,
            `.. there will be no water for us to drink... no treasures for us to find and sell...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //56
            `${this.aurellia}`,
            `All the villagers think it's only a matter of time before an avalanche collapses the whole village.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //57
            `${this.aurellia}`,
            `I can't blame them... I am scared myself...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //58
            `${this.firedog}`,
            `I see... Things are getting really bad here...`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //59
            `${this.firedog}`,
            `Okay... I've made up my mind.. I am stopping whatever is inside that cave and bring back peace to the village!`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //60
            `${this.aurellia}`,
            `Thank you so much ${this.firedog}... It means a lot to us.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //61
            `${this.aurellia}`,
            `Okay, keep following me, I will take you to the main cave entrance.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 500,
                    imageId: 'bonusMap1CaveEntrance',
                    onBlack: () => {
                        this.playSFX('walkingCutsceneSound');
                        this.fadeOutMusic('tundraSuite');
                        this.playMusic('darkTensionRisingSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //62
            `${this.aurellia}`,
            `Okay.. here we are.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //63
            `${this.firedog}`,
            `Phew... It got even colder now. Hopefully I don't freeze to death!`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //64
            `${this.firedog}`,
            `Before I go, ${this.aurellia}, do you know anything else about ${this.glacikal}? You mentioned it was an ice beast, or a guardian?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //65
            `${this.aurellia}`,
            `Yes.. No one has seen ${this.glacikal} with their own eyes in the village. And to be honest, these are rumors passed down from our ancestors.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //66
            `${this.aurellia}`,
            `It is believed ${this.glacikal} rests in the deepest parts of ${this.iceboundCave}, and once he awakens, disaster strikes...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //67
            `${this.aurellia}`,
            `The snow falls harder... avalanches come out of nowhere... the wind blows harder... the temperature drops significantly...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //68
            `${this.aurellia}`,
            `This is exactly what happened centuries ago.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //69
            `${this.aurellia}`,
            `Lost writings were found inside the cave by our ancestors, detailing the dangerous encounter with ${this.glacikal}, with the same exact disasters happening.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //70
            `${this.firedog}`,
            `I see... so ${this.glacikal} is a legend that may or may not even exist?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //71
            `${this.aurellia}`,
            `Yeah.. but I do believe he exists.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //72
            `${this.aurellia}`,
            `It is believed that ${this.glacikal} keeps the icy caves and the surrounding snowy land in balance.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //73
            `${this.aurellia}`,
            `As long as he sleeps, the ice remains calm and the caves stay stable.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //74
            `${this.aurellia}`,
            `But why has ${this.glacikal} awakened? And how? I wish I knew...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //75
            `${this.firedog}`,
            `(It seems I am dealing with either a real ice monster, or just something completely unrelated...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //76
            `${this.firedog}`,
            `(Nonetheless, we are already here, so we might as well get to the bottom of the truth!)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //77
            `${this.firedog}`,
            `Thank you for this information, ${this.aurellia}. I think I'm ready to go inside now!`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //78
            `${this.aurellia}`,
            `Before you go, be careful with the ice ground. It is extremely slippery!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //79
            `${this.firedog}`,
            `Extremely slippery ground? Doesn't sound too fun...`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //80
            `${this.firedog}`,
            `But nothing that won't stop me!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //81
            `${this.firedog}`,
            `I'll go now!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //82
            `${this.aurellia}`,
            `Please make sure to come back.. you are our only hope...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //83
            `${this.firedog}`,
            `I'll come back, and I'll get to the bottom of these disasters!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //84
            `${this.firedog}`,
            `Now, let's go!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
    }
}
export class BonusMap1EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('bonusMap1InsideCabin');

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Phew... I finally made it to the cabin.`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `That fight with ${this.glacikal} was no joke...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I should sit here and rest for a bit before I head back.`,
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `At least things should calm down now that ${this.glacikal} has returned to his deep slumber.`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Still... something about all of this feels strange...`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Someone went all the way into the deepest part of ${this.iceboundCave} and attacked ${this.glacikal} while he was asleep...`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `That couldn't have been an accident...`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Whoever did it knew exactly where they were going... and knew about ${this.glacikal}'s existence... well possibly.. there's no way to confirm that...`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `But why attack him in the first place just to run away? Maybe they realized it was a mistake messing with ${this.glacikal}!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `Anyways, I should head back to the village and let ${this.aurellia} know it's safe now.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 3000, fadeOut: 500,
                    imageId: 'bonusMap1Village',
                    beforeFade: () => {
                        this.fadeOutMusic('blizzardWindFireplace');
                    },
                    onBlack: () => {
                        this.playMusic('windBreezeSound', true);
                        setTimeout(() => {
                            this.playMusic('tundraSuite', true);
                        }, 3000);
                    },
                }),
            },
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //10
            `${this.aurellia}`,
            `${this.firedog}! You came back!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `I did.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //12
            `${this.aurellia}`,
            `What happened? Did you find anything inside ${this.iceboundCave}?`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('aurelliaCurious', RIGHT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Yes... and you were right.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaCurious', RIGHT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `${this.glacikal} does exist.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //15
            `${this.aurellia}`,
            `What!?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `He had been awakened from a deep slumber and was consumed by rage.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `That rage was what caused the freezing winds, the avalanches, and all the chaos around the cave.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //18
            `${this.aurellia}`,
            `So the rumors were true all along...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Yeah... but he's calmed down now.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `He told me he was going back to his deep slumber, so things should return to normal.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //21
            `${this.aurellia}`,
            `Now that you mention it... the wind already feels less violent.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaCurious', RIGHT),
        );
        this.addDialogue( //22
            `${this.aurellia}`,
            `And the air doesn't feel as heavy as before either...`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaCurious', RIGHT),
        );
        this.addDialogue( //23
            `${this.aurellia}`,
            `The land really does feel more stable already!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `Looks like the village should be safe now.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //25
            `${this.aurellia}`,
            `${this.firedog}... thank you. You saved our village.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `I'm just glad I could help.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //27
            `${this.aurellia}`,
            `Please know that everyone here will remember what you did for us.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Thank you, ${this.aurellia}... but I should get going now.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //29
            `${this.aurellia}`,
            `Leaving already?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Yeah. I still have my own journey to continue.`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `But at least now I know this place will be alright.`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //32
            `${this.aurellia}`,
            `Then please travel safely, ${this.firedog}.`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );
        this.addDialogue( //33
            `${this.aurellia}`,
            `And if you ever return, you will always be welcome in our village.`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `I'll remember that.`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `Alright... time for me to head back.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaNormal', RIGHT),
        );

        this.game.glacikalDefeated = true;
        this.game.saveGameState();
    }
}

// Bonus Map 2 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class BonusMap2StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('bonusChapter2');

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'bonusMap2WoodsForest',
                    beforeFade: () => {
                        this.playMusic('birdsChirping', true);
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Alright... let's keep moving.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `If I keep following this path, I should eventually reach ${this.springlyLemony}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Is this the right path?`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Oh no... don't tell me I got lost...`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //6
            `${this.threeDots}`,
            `Traveler!`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //7
            `${this.threeDots}`,
            `Please wait!`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Hm?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `Someone's calling for me?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //10
            `${this.threeDots}`,
            `Over here!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `Oh, hello there.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Is everything alright?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //13
            `${this.threeDots}`,
            `My name is ${this.orialis}. Sorry for stopping you so suddenly...`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `Oh, hi. I'm ${this.firedog}. Do you happen to know where ${this.springlyLemony} is? I think I'm lost.`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //15
            `${this.orialis}`,
            `We aren't near ${this.springlyLemony} at all...`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Oh great... I had a feeling something wasn't right... Can you tell me how to get back onto the right path?`,
            this.addImage(this.setfiredogSigh(), LEFT),
        );
        this.addDialogue( //17
            `${this.orialis}`,
            `I can... but...`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Uh? You seem nervous. Is everything alright?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //19
            `${this.orialis}`,
            `Yeah... I mean, no... I need... I need help...`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //20
            `${this.orialis}`,
            `I've been looking for days for anyone around this area. The few travelers I encountered didn't want to help me...`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `What happened?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //22
            `${this.orialis}`,
            `It's my brother, ${this.orelian}. He went toward ${this.crimsonFissure} and never came back.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `${this.crimsonFissure}?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `I've never heard of that place before.`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //25
            `${this.orialis}`,
            `Most travelers haven't. It lies far to the southeast.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisExplaining', RIGHT),
        );
        this.addDialogue( //26
            `${this.orialis}`,
            `The land there is scarred by massive fissures and surrounded by mysterious dark crimson waters.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisExplaining', RIGHT),
        );
        this.addDialogue( //27
            `${this.orialis}`,
            `It was always considered dangerous, but recently it has become much worse.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisExplaining', RIGHT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Worse how?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('orialisExplaining', RIGHT),
        );
        this.addDialogue( //29
            `${this.orialis}`,
            `The ground has been shaking almost every day.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('orialisSerious', RIGHT),
        );
        this.addDialogue( //30
            `${this.orialis}`,
            `Old cracks have widened, and new ones keep opening without warning.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSerious', RIGHT),
        );
        this.addDialogue( //31
            `${this.orialis}`,
            `In fact, one enormous crack has torn its way all the way up north from the fissure itself, splitting the land as it spread.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSerious', RIGHT),
        );
        this.addDialogue( //32
            `${this.orialis}`,
            `Even from a distance, you can feel the tremors beneath your feet.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSerious', RIGHT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `That sounds really bad...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orialisSerious', RIGHT),
        );
        this.addDialogue( //34
            `${this.orialis}`,
            `${this.orelian} studies ancient ruins and old writings.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisExplaining', RIGHT),
        );
        this.addDialogue( //35
            `${this.orialis}`,
            `When the tremors started, he became convinced there was more to this than a natural disaster.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisExplaining', RIGHT),
        );
        this.addDialogue( //36
            `${this.orialis}`,
            `He said there were old remains hidden near the deepest fissures, and that whatever caused the shaking might be connected to them.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisExplaining', RIGHT),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `So he went to investigate by himself...?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orialisExplaining', RIGHT),
        );
        this.addDialogue( //38
            `${this.orialis}`,
            `Yes...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //39
            `${this.orialis}`,
            `He told me that if he was right, then waiting any longer could make things worse.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //40
            `${this.orialis}`,
            `I tried to follow him after he didn't return, but I couldn't get very far.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //41
            `${this.orialis}`,
            `The tremors became so violent that the ground started breaking apart beneath me.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //42
            `${this.orialis}`,
            `I barely managed to escape.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //43
            `${this.orialis}`,
            `Please... if there is any chance that he's still alive, I need to know.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `(I'm meant to go toward ${this.infernalCraterPeak}... I don't have time for this...)`,
            { whisper: true },
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `I'm sorry... I really need to be somewhere els-`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //46
            `${this.orialis}`,
            `Please... I have lost all hope... I've tried going there myself, but I wasn't strong enough to endure the tremors and the fissures...`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //47
            `${this.orialis}`,
            `I have no one else to ask for help... I beg you to help me!`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //48
            `${this.firedog}`,
            `(What have I gotten myself into...)`,
            { whisper: true },
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `(I guess I can't ignore this...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //50
            `${this.firedog}`,
            `(Okay... I'll find ${this.orialis}'s brother quickly, then get back to the main mission.)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `Alright, fine... I'll help you.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSurprised', RIGHT),
        );
        this.addDialogue( //52
            `${this.orialis}`,
            `Really!?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSurprised', RIGHT),
        );
        this.addDialogue( //53
            `${this.firedog}`,
            `Yeah. I can't promise what I'll find, but I can at least look for your brother.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisRelieved', RIGHT),
        );
        this.addDialogue( //54
            `${this.orialis}`,
            `Thank you... truly.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisRelieved', RIGHT),
        );
        this.addDialogue( //55
            `${this.orialis}`,
            `Come with me. I'll take you to the edge of ${this.crimsonFissure}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisNormal', RIGHT),
        );
        this.addDialogue( //56
            `${this.firedog}`,
            `Alright. Lead the way.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 500,
                    imageId: 'bonusMap2GroundFissures',
                    onBlack: () => {
                        this.playSFX('walkingCutsceneSound');
                        this.fadeOutMusic('birdsChirping');
                        this.playMusic('darkTensionRisingSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisNormal', RIGHT),
        );
        this.addDialogue( //57
            `${this.orialis}`,
            `We're close now...`,
            {
                onAdvance: () => {
                    this.playSFX('tremorSound', true);
                    this.game.startShake(2000);
                },
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSerious', RIGHT),
        );
        this.addDialogue( //58
            `${this.orialis}`,
            `Can you feel that?`,
            {
                onAdvance: () => {
                    this.fadeOutSFX('tremorSound');
                    this.game.stopShake();
                },
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSerious', RIGHT),
        );
        this.addDialogue( //59
            `${this.firedog}`,
            `Wow, the ground is shaking!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orialisSerious', RIGHT),
        );
        this.addDialogue( //60
            `${this.orialis}`,
            `Yes. The tremors get stronger the closer we get to the fissures.`,
            {
                onAdvance: () => {
                    this.playSFX('tremorSound', true);
                    this.game.startShake(2000);
                },
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orialisSerious', RIGHT),
        );
        this.addDialogue( //61
            `${this.firedog}`,
            `Ugh.. this place feels eerie.. the shaking is so aggressive.. this is not normal at all...!`,
            {
                onAdvance: () => {
                    this.fadeOutSFX('tremorSound');
                    this.game.stopShake();
                },
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('orialisSerious', RIGHT),
        );
        this.addDialogue( //62
            `${this.orialis}`,
            `Yeah.. the tremors keep getting worse each day...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisExplaining', RIGHT),
        );
        this.addDialogue( //63
            `${this.orialis}`,
            `This is the outer boundary of ${this.crimsonFissure}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisExplaining', RIGHT),
        );
        this.addDialogue( //64
            `${this.orialis}`,
            `The farther you go, the worse it becomes.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisExplaining', RIGHT),
        );
        this.addDialogue( //65
            `${this.orialis}`,
            `This is as far as I can take you.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //66
            `${this.firedog}`,
            `Alright... I'll go from here.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //67
            `${this.orialis}`,
            `Please be careful, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //68
            `${this.orialis}`,
            `And please bring ${this.orelian} back.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //69
            `${this.firedog}`,
            `I'll do what I can.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //70
            `${this.firedog}`,
            `(Alright... let's see what kind of place ${this.crimsonFissure} really is.)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT),
        );
    }
}
export class BonusMap2EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('bonusMap2InsideCabin');
        this.game.audioHandler.cutsceneMusic.playSound('blizzardWindFireplace', true);

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Phew... I finally made it to the cabin.`,
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `That was rough...`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `At least I can rest here for a moment.`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Hm?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Someone else is here...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //5
            `${this.threeDots}`,
            `...Ouch...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Hey! Are you alright!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //7
            `${this.threeDots}`,
            `Barely...`,
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Wait... are you... are you ${this.orelian}?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //9
            `${this.orelian}`,
            `How do you know my name?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `I ran into your brother ${this.orialis} when I got lost on my way to ${this.springlyLemony}. He asked me to help find you.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //11
            `${this.orelian}`,
            `I see... then you came here to save me?`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Indeed I did! I'm ${this.firedog}.`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Can you move?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //14
            `${this.orelian}`,
            `A little... but not much.`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //15
            `${this.orelian}`,
            `I was lucky to make it back here at all.`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `What happened?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //17
            `${this.orelian}`,
            `While I was investigating, the fissures grew more violent.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //18
            `${this.orelian}`,
            `I got dangerously close while trying to figure out what was causing the tremors... and I fell into one of the fissures.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2InsideFissures',
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //19
            `${this.orelian}`,
            `The fall left me in immense pain... but when I landed, I discovered ancient ruins hidden deep below.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //20
            `${this.orelian}`,
            `There were old stone pillars, collapsed arches, and inscriptions carved into the rock itself.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `I saw some small inscriptions on the rocks on my way here, but it all just looks like gibberish to me.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //22
            `${this.orelian}`,
            `I can understand them.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Wait, really!? How?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //24
            `${this.orelian}`,
            `That is what I do. I study ancient ruins, dead civilizations, and forgotten languages.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //25
            `${this.orelian}`,
            `Most people just see strange markings on old stone. I try to understand what they were meant to say.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //26
            `${this.orelian}`,
            `The inscriptions above the surface have little to no useful information.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //27
            `${this.orelian}`,
            `However, when I fell into the fissure, the inscriptions were richer, clearer, and far more detailed. I couldn't believe it!`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //28
            `${this.orelian}`,
            `Some of the symbols were damaged, but there was enough left for me to piece the meaning together.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //29
            `${this.orelian}`,
            `And one name appeared again and again.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `What name?`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2FissureRockCloseUp',
                    onBlack: () => {
                        this.playMusic('inTheFuture', true);
                    },
                }),
            },
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //31
            `${this.orelian}`,
            `${this.ntharax}.`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `${this.ntharax}...?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //33
            `${this.orelian}`,
            `Yes. One of the inscriptions read:`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //34
            `${this.orelian}`,
            `"Here lies bound ${this.ntharax}, the Celestial Tyrant, cast from the starless void, unworthy of the living sky."`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //35
            `${this.orelian}`,
            `Another said:`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //36
            `${this.orelian}`,
            `"Let neither stone nor sea forget his name, for should his prison fail, the heavens themselves shall bleed."`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2InsideCabin',
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `So... this ${this.ntharax} is some kind of ancient celestial tyrant?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //38
            `${this.orelian}`,
            `That is what the inscriptions suggest.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //39
            `${this.orelian}`,
            `A being that did not belong to our world.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //40
            `${this.orelian}`,
            `From what I could piece together, ${this.ntharax} was banished to another realm long ago in this very place.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //41
            `${this.orelian}`,
            `The ancient civilizations feared that one day he would try to force his way back into our world.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `So what role does ${this.crimsonFissure} play in here exactly?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //43
            `${this.orelian}`,
            `${this.crimsonFissure} is the location of the ancient seal created to stop ${this.ntharax} from reopening a gateway to our world.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //44
            `${this.orelian}`,
            `All the strange sigils carved into the stones of ${this.crimsonFissure} are part of that seal.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //45
            `${this.orelian}`,
            `Even the red glow of the lake makes sense now. There must be enormous glowing seal markings buried beneath it.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //46
            `${this.orelian}`,
            `The fissures are not just part of the landscape. They are wounds left behind as the seal starts to fail.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `So the shaking means the seal is weakening?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //48
            `${this.orelian}`,
            `Exactly.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //49
            `${this.orelian}`,
            `That is why the tremors keep getting worse, and why the cracks keep widening.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //50
            `${this.firedog}`,
            `That's already bad enough...`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //51
            `${this.orelian}`,
            `It gets worse.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //52
            `${this.orelian}`,
            `The inscriptions also spoke of what happens when the seal begins to fail.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //53
            `${this.orelian}`,
            `One of them read:`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2WritingsEnergyLeak',
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //54
            `${this.orelian}`,
            `"When the red prison cracks, its fire shall flee, and the wound above shall answer."`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //55
            `${this.orelian}`,
            `Another said:`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //56
            `${this.orelian}`,
            `"Follow the escaping energy, for where the seal exhales, the breach shall awaken."`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //57
            `${this.firedog}`,
            `Escaping energy...?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //58
            `${this.orelian}`,
            `Yes.`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //59
            `${this.orelian}`,
            `When the seal cracks, energy escapes from it.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2PortalEnergy',
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //60
            `${this.orelian}`,
            `That escaping energy does not just vanish. It gathers and forms a breach point.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //61
            `${this.orelian}`,
            `A place where a portal can begin to open.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //62
            `${this.orelian}`,
            `And the deeper inscriptions made it even clearer.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //63
            `${this.orelian}`,
            `One of them read:`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //64
            `${this.orelian}`,
            `"When the fleeing fire finds the thinned sky, the gate of the banished realm shall open once more."`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //65
            `${this.firedog}`,
            `A portal... a portal to his dimension?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //66
            `${this.orelian}`,
            `I think so.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2InsideCabin',
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //67
            `${this.orelian}`,
            `If I understood the inscriptions correctly, the escaping energy leads to the place where that portal is beginning to form.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //68
            `${this.orelian}`,
            `And once that breach forms, ${this.ntharax} pushes against it from the other side.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //69
            `${this.orelian}`,
            `${this.crimsonFissure}'s seals are what is stopping him from creating a path back.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //70
            `${this.orelian}`,
            `But if the seal weakens enough, the breach answers him... and he can force that opening wider from his side.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //71
            `${this.firedog}`,
            `That's really bad...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //72
            `${this.orelian}`,
            `There was more.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //73
            `${this.orelian}`,
            `Another inscription said:`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2Tsunami',
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //74
            `${this.orelian}`,
            `"Should the breach stand whole, the sealed red sea shall rise in wrath, and tides without end shall swallow every land beneath the broken heavens."`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //75
            `${this.firedog}`,
            `And if the breach fully opens...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //76
            `${this.orelian}`,
            `Then ${this.ntharax}'s realm will connect completely to ours.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //77
            `${this.orelian}`,
            `And if those ancient warnings are true, massive tides and endless waves will flood every single land.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //78
            `${this.orelian}`,
            `Not just ${this.crimsonFissure}. Everything.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //79
            `${this.firedog}`,
            `So if that breach fully opens, the whole world could be drowned...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //80
            `${this.orelian}`,
            `That is exactly what I fear.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2InsideCabin',
                }),
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //81
            `${this.orelian}`,
            `...Look outside.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2OutsideCabinWindow',
                }),
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //82
            `${this.firedog}`,
            `That light... is that the energy mentioned in the passages? The energy that is fleeing toward the portal?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //83
            `${this.orelian}`,
            `It appears to be.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //84
            `${this.orelian}`,
            `The breach point has started to open.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //85
            `${this.firedog}`,
            `This is bad...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2InsideCabin',
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //86
            `${this.firedog}`,
            `Stay here and rest, ${this.orelian}.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //87
            `${this.firedog}`,
            `I'm going to follow the escaping energy.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //88
            `${this.firedog}`,
            `If that portal is where ${this.ntharax} is trying to break through, then that's where I need to be.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //89
            `${this.orelian}`,
            `Be careful... I do not know what waits beyond that breach.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //90
            `${this.orelian}`,
            `But what I do know for sure is that it is extremely dangerous. You may never come back.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //91
            `${this.orelian}`,
            `Are you sure you want to take that risk?`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //92
            `${this.firedog}`,
            `It seems the situation has become far more serious than simply rescuing you, which is what I first came here for.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //93
            `${this.firedog}`,
            `But if what you're saying is true, and there is a portal... and there is a celestial tyrant trying to force his way back through it...`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //94
            `${this.firedog}`,
            `Then I have to make sure that stops here.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //95
            `${this.firedog}`,
            `Stay here, ${this.orelian}, and rest. I'll investigate this for you.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //96
            `${this.orelian}`,
            `I appreciate your bravery.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //97
            `${this.orelian}`,
            `Thank you for going this far to check on my safety, and thank you for investigating further.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //98
            `${this.firedog}`,
            `Of course!`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //99
            `${this.firedog}`,
            `I'll be leaving now then. There's no time to waste!`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //100
            `${this.orelian}`,
            `Good luck, ${this.firedog}.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //101
            `${this.firedog}`,
            `Alright, let's go!`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );

        this.game.bonusMap3Unlocked = true;
        this.game.saveGameState();
    }
}

// Bonus Map 3 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class BonusMap3StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('bonusChapter3');

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'bonusMap3ForestCloseUp',
                    beforeFade: () => {
                        this.playMusic('hidingInTheDarkSuspense', true);
                    },
                }),
            },
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `That light is getting stronger...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `It has to be the escaping energy ${this.orelian} was talking about.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `If I keep following it, it should lead me straight to the portal.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Alright... let's go.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap3ForestCloseUp2',
                }),
            },
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `The air feels even stranger here...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Like the whole space around me is bending...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Hm?`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `I see someone up ahead...`,
            this.addImage(this.setfiredogCurious(), LEFT),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Wait... is that...?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //11
            `${this.threeDots}`,
            `So you made it here too, ${this.firedog}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `${this.zephyrion}!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `What are you doing all the way out here?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //14
            `${this.zephyrion}`,
            `Investigating the same disturbance you are.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //15
            `${this.zephyrion}`,
            `After you left, I felt a disturbance far from ${this.coralAbyss}. I decided to investigate it myself.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //16
            `${this.zephyrion}`,
            `Not long ago, I felt a violent rupture in the surrounding energies.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //17
            `${this.zephyrion}`,
            `It was unnatural. Ancient. The kind of disturbance no sorcerer should ignore.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `So you tracked it all the way here?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //19
            `${this.zephyrion}`,
            `Indeed.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //20
            `${this.zephyrion}`,
            `I followed the energy trail from ${this.crimsonFissure}. The farther north it flowed, the more unstable the air became, until it led me here.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Wait... you can read those inscriptions too!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //22
            `${this.zephyrion}`,
            `Of course.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //23
            `${this.zephyrion}`,
            `Sorcery is not merely spells and robes, ${this.firedog}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //24
            `${this.zephyrion}`,
            `Ancient languages, dead civilizations, and forgotten seals... they all matter.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `I just thought you were a water-breathing spell guy...`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //26
            `${this.zephyrion}`,
            `I am choosing to ignore that description.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `Fair enough...`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `I also met someone who could read the inscriptions.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `${this.orelian}. He told me about an ancient celestial tyrant named ${this.ntharax}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //30
            `${this.zephyrion}`,
            `Then our findings match.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //31
            `${this.zephyrion}`,
            `The inscriptions here speak of the same being, and they name his realm as ${this.cosmicRift}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //32
            `${this.zephyrion}`,
            `${this.crimsonFissure} was not just a prison. It was the original gateway ${this.ntharax} used to enter our world long ago.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //33
            `${this.zephyrion}`,
            `After he was driven back, the ancients sealed that gateway so he could never force his way through it again.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //34
            `${this.zephyrion}`,
            `That is why ${this.crimsonFissure} matters so much. It was the wound through which he first entered.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `So ${this.orelian} was right...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `The seal is weakening...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //37
            `${this.zephyrion}`,
            `Yes, but the seal did more than weaken.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //38
            `${this.zephyrion}`,
            `Because the original gateway at ${this.crimsonFissure} remains sealed, the escaping power could not fully reopen it there.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //39
            `${this.zephyrion}`,
            `Instead, that energy fled north, searching for a weaker point in the world.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //40
            `${this.zephyrion}`,
            `That is why both of us were led here. We were following the energy that escaped from ${this.crimsonFissure}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `So this isn't the original gateway...?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //42
            `${this.zephyrion}`,
            `No.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //43
            `${this.zephyrion}`,
            `This is a new portal. A second opening.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //44
            `${this.zephyrion}`,
            `Since ${this.crimsonFissure} can no longer serve as his gateway, ${this.ntharax} is trying to force his way back into our world through here instead.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //45
            `${this.zephyrion}`,
            `And look ahead.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap3PortalEnergy',
                    onBlack: () => {
                        setTimeout(() => {
                            this.playMusic('portalHummingSound', true);
                        }, 1000);
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `What... is that!?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //47
            `${this.zephyrion}`,
            `The portal.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //48
            `${this.zephyrion}`,
            `It has already opened far enough for his realm to begin touching ours.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `So if we destroy it from here, that's it, right?`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //50
            `${this.zephyrion}`,
            `No. That is the problem.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //51
            `${this.zephyrion}`,
            `The inscriptions describe this portal as an anchored gate to ${this.cosmicRift}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //52
            `${this.zephyrion}`,
            `It is being forced open from the other side.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //53
            `${this.zephyrion}`,
            `As long as ${this.ntharax} can keep pressing his power against it, the portal will keep forcing itself back open.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //54
            `${this.firedog}`,
            `So even if we try to shut it from here... it won't matter?`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //55
            `${this.zephyrion}`,
            `Exactly.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //56
            `${this.zephyrion}`,
            `And there is more. ${this.ntharax} is not a being that dies as ordinary creatures do.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //57
            `${this.firedog}`,
            `What do you mean...?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //58
            `${this.zephyrion}`,
            `If his form is destroyed, his essence does not perish. It scatters, sleeps, and slowly gathers itself again.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //59
            `${this.zephyrion}`,
            `That rebirth does not happen quickly. It takes millennia for a being like him to become whole again.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //60
            `${this.firedog}`,
            `So even if I defeat him... that still won't truly be the end?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //61
            `${this.zephyrion}`,
            `No. But it would still save our world, and buy us enough time to come up with a stronger seal to ensure he never breaks through our world.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //62
            `${this.zephyrion}`,
            `To cast him down now would deny him his return and buy the world ages of peace.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //63
            `${this.firedog}`,
            `So that's why we have to go inside...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //64
            `${this.zephyrion}`,
            `Yes.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //65
            `${this.zephyrion}`,
            `If ${this.ntharax} manages to force himself fully back into our world, stopping him here may already be too late.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //66
            `${this.zephyrion}`,
            `However, the portal has a weakness. It is unstable, narrow, and incomplete.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //67
            `${this.zephyrion}`,
            `Beings like us may pass through it while it flickers, but it is not yet strong enough to bear ${this.ntharax}'s full form into our world.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //68
            `${this.zephyrion}`,
            `If you go now, before the portal stabilizes any further, you may be able to strike first and stop him before he can break through.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //69
            `${this.firedog}`,
            `Me? What about you?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //70
            `${this.zephyrion}`,
            `I must remain here.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //71
            `${this.zephyrion}`,
            `If I let the portal gather all the energy without interference, ${this.ntharax} may be able to enter our world before you find him.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //72
            `${this.zephyrion}`,
            `What I can do here is disrupt the energy, which will keep the portal unstable for a little longer.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //73
            `${this.zephyrion}`,
            `But every second counts... I will only be delaying the inevitable. That is why you have to enter alone.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //74
            `${this.firedog}`,
            `So I have to go in alone and defeat this celestial tyrant by myself?`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //75
            `${this.zephyrion}`,
            `Yes.`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //76
            `${this.firedog}`,
            `Oh... great... what have I gotten myself into...?`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //77
            `${this.zephyrion}`,
            `There is no time to dwell on it, ${this.firedog}. This is the best plan I could come up with in the short time we have.`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //78
            `${this.firedog}`,
            `...Yeah.`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //79
            `${this.firedog}`,
            `If going inside is the only way to stop this thing, then that's what I'll do.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //80
            `${this.zephyrion}`,
            `Good.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //81
            `${this.zephyrion}`,
            `One last warning, ${this.firedog}.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //82
            `${this.zephyrion}`,
            `A realm shaped by a being like ${this.ntharax} will not obey the rules of our world.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //83
            `${this.zephyrion}`,
            `Do not expect gravity to work the same way as it does in our world.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //84
            `${this.zephyrion}`,
            `You will need every bit of help possible. Let me cast a double jump spell on you.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //85
            `${this.firedog}`,
            `Double jump?`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //86
            `${this.zephyrion}`,
            `Yes. You will be able to jump twice while in the air. It may come in handy.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //87
            `${this.zephyrion}`,
            `Now, let me focus while I cast the spell.`,
            {
                onAdvance: () => this.playSFX('sorcererDoubleJumpSpellSound'),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //88
            `${this.zephyrion}`,
            `Duplicatus Saltus: Aerial Echo!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //89
            `${this.zephyrion}`,
            `The spell has been cast.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //90
            `${this.firedog}`,
            `Alright, thank you, ${this.zephyrion}. Got it.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //91
            `${this.firedog}`,
            `Alright then... no more wasting time.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //92
            `${this.firedog}`,
            `I'll go inside, stop this celestial tyrant, and hopefully make it back to our world.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //93
            `${this.zephyrion}`,
            `I will keep the portal from fully stabilizing for as long as I can with my dark spells.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //94
            `${this.zephyrion}`,
            `Now go, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //95
            `${this.firedog}`,
            `Right... let's go through the portal!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'bonusMap3InsidePortal',
                    onBlackDelayMs: 1700,
                    beforeFade: () => {
                        this.fadeOutMusic('hidingInTheDarkSuspense', true);
                        this.fadeOutMusic('portalHummingSound', true);
                        this.playSFX('touchingPortalSound');
                        this.playSFX('insidePortalSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //96
            `${this.firedog}`,
            `Wah!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 5000, fadeOut: 500,
                    imageId: 'bonusMap3AnchoredPortal',
                    beforeFade: () => {
                        this.playSFX('touchingPortalSound', false, true);
                        this.fadeOutSFX('insidePortalSound');

                        setTimeout(() => {
                            this.playSFX('fallingOutOfPortalSound');
                        }, 3000);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //97
            `${this.firedog}`,
            `Ouch... That was quite the fall...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //98
            `${this.firedog}`,
            `Where am I?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //99
            `${this.firedog}`,
            `Right... I jumped through the portal. It appears I'm in ${this.cosmicRift}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //100
            `${this.firedog}`,
            `Alright, time to find ${this.ntharax} and stop him. Let's go!`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );

        this.game.bonusMap3Unlocked = true;
        this.game.saveGameState();
    }
}
export class BonusMap3EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('bonusMap3InsideCabin');

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            `${this.firedog}`,
            `...Phew...`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `So that was ${this.ntharax}...`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I actually made it through ${this.cosmicRift}... and I actually defeated him...`,
            this.addImage(this.setfiredogSmile(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `But even after all that... this place still feels wrong...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Wait... ${this.zephyrion} is still outside trying to contain the portal!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `And if ${this.ntharax} is gone, then the portal could start closing any second now!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Shoot! I need to get back there right now!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `If that portal shuts before I make it through... I'm stuck here forever...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `No time to rest. Let's move!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 3000, fadeOut: 500,
                    imageId: 'bonusMap3AnchoredPortalDestroyed',
                    onBlack: () => {
                        this.game.startShake(0);
                        setTimeout(() => {
                            this.playMusic('portalTremorSound', true);
                        }, 2700);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `There it is! The portal!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //10
            `${this.zephyrion}`,
            `${this.firedog}! Quickly! I can't contain the portal for much longer!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `What!? I can hear ${this.zephyrion} from the other side.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I'm coming!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'bonusMap3InsidePortal',
                    onBlackDelayMs: 1700,
                    beforeFade: () => {
                        this.playSFX('touchingPortalSound');
                        this.playSFX('insidePortalSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Aaaaaaarghhh!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 6000, fadeOut: 500,
                    imageId: 'bonusMap3PortalDestroyed',
                    beforeFade: () => {
                        this.playSFX('touchingPortalSound', false, true);
                        this.fadeOutSFX('insidePortalSound');
                        this.fadeOutMusic('portalTremorSound');

                        setTimeout(() => {
                            this.playSFX('fallingOutOfPortalSound');
                        }, 3000);
                    },
                    onBlack: () => {
                        this.playMusic('windBreezeSound', true);
                        this.game.stopShake();
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `Am I... am I back in our world?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //15
            `${this.zephyrion}`,
            `You are, ${this.firedog}. You made it.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //16
            `${this.zephyrion}`,
            `The portal began weakening not long ago...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //17
            `${this.zephyrion}`,
            `It started to collapse. I had to do everything in my power to ensure it remained open until you came back.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //18
            `${this.zephyrion}`,
            `You made it just in time... any longer and I don't think I could have kept the portal open.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Wow, ${this.zephyrion}... you saved my life...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //20
            `${this.zephyrion}`,
            `And you saved the world. I assume you defeated ${this.ntharax}, given how unstable the portal became at a certain point.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //21
            `${this.zephyrion}`,
            `Tell me. What did you find in ${this.cosmicRift}?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `It was exactly as bad as you warned me.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `The whole realm felt twisted... like it had been shaped entirely by ${this.ntharax}'s presence.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `And he really was there, plotting for his return.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `We fought... He was the most formidable opponent I have ever fought. I couldn't believe anyone could be that strong.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `But I somehow managed to bring him down before he could fully break through into our world.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //27
            `${this.zephyrion}`,
            `You have done more than win a battle.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //28
            `${this.zephyrion}`,
            `You have prevented a catastrophe.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `It still didn't feel like the end of him...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `More like I had forced something ancient back into the dark.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //31
            `${this.zephyrion}`,
            `That is because beings like ${this.ntharax} are not so easily erased.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionSerious', RIGHT),
        );
        this.addDialogue( //32
            `${this.zephyrion}`,
            `But what you did here matters greatly.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExplaining', RIGHT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `...Right.`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `What happens now?`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //35
            `${this.zephyrion}`,
            `Everything should go back to normal. The tremors should stop. The cracks should stop spreading. And peace will be restored. All thanks to you, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `Let's call it a team effort! Without you, I would never have made it.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `Oh right, I should probably get back and let ${this.orialis} and ${this.orelian} know what happened!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `I will be going now, ${this.zephyrion}! Maybe I'll see you around again somewhere!`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //39
            `${this.zephyrion}`,
            `Farewell, ${this.firedog}. I'm sure this won't be the last time we see each other!`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `I have a feeling you're right!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `Alright, let's go!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 3000, fadeOut: 500,
                    imageId: 'bonusMap2WoodsForest',
                    onBlack: () => {
                        this.playMusic('birdsChirping', true),
                            setTimeout(() => {
                                this.playMusic('onTheBeachAtDusk', true);
                            }, 2000);
                    },
                }),
            },
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //42
            `${this.orialis}`,
            `That's... ${this.orelian}! I can't believe it, you're alive!`,
            this.addImage(this.setfiredogSmile(), LEFT),
        );
        this.addDialogue( //43
            `${this.orelian}`,
            `I am. I got lucky... I'm happy to see you again, ${this.orialis}!`,
            this.addImage(this.setfiredogSmile(), LEFT),
        );
        this.addDialogue( //44
            `${this.orialis}`,
            `Thank you so much for saving my brother, ${this.firedog}! You have my thanks!`,
            this.addImage(this.setfiredogSmile(), LEFT),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `No worries! Although, thanks to ${this.orelian}, I managed to find the source of the problems that have been happening around ${this.crimsonFissure}!`,
            this.addImage(this.setfiredogSmile(), LEFT),
        );
        this.addDialogue( //46
            `${this.orialis}`,
            `Oh... how so? What happened?`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `Let me tell you both everything that has happened.`,
            {
                onAdvance: () => {
                    this.cutsceneBackgroundChange(500, 2000, 500);
                },
            },
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //48
            `${this.orelian}`,
            `Unbelievable. So ${this.ntharax}, the celestial tyrant, does indeed exist? And not only that, you defeated him?`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `Yep. The only way to beat him was to enter his realm, ${this.cosmicRift}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //50
            `${this.orialis}`,
            `So the tremors will stop?`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `Indeed they will! Everything is going back to normal!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
        );
        this.addDialogue( //52
            `${this.orialis}`,
            `Then my brother was right all along... the ruins really were warning of something far worse beneath the fissure...`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //53
            `${this.orialis}`,
            `And you put a stop to it...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisRelieved', RIGHT),
        );
        this.addDialogue( //54
            `${this.orelian}`,
            `You have my deepest thanks, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //55
            `${this.orelian}`,
            `Without you, none of us would be standing here now.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //56
            `${this.firedog}`,
            `At least everyone is safe now. That's what matters.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('orialisRelieved', RIGHT),
        );
        this.addDialogue( //57
            `${this.orialis}`,
            `We will never forget what you did for us.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisRelieved', RIGHT),
        );
        this.addDialogue( //58
            `${this.firedog}`,
            `(Good... that's taken care of.)`,
            { whisper: true },
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('orialisRelieved', RIGHT),
        );
        this.addDialogue( //59
            `${this.firedog}`,
            `(I should go back now. What a ride this has been!)`,
            { whisper: true },
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('orialisRelieved', RIGHT),
        );
        this.addDialogue( //60
            `${this.firedog}`,
            `Alright... I should get moving again.`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('orialisRelieved', RIGHT),
        );
        this.addDialogue( //61
            `${this.orialis}`,
            `Then please, travel safely, ${this.firedog}.`,
            this.addImage(this.setfiredogSmile(), LEFT),
        );
        this.addDialogue( //62
            `${this.orelian}`,
            `And thank you once again... for saving my brother, and the world.`,
            this.addImage(this.setfiredogSmile(), LEFT),
        );
        this.addDialogue( //63
            `${this.firedog}`,
            `Of course.`,
            this.addImage(this.setfiredogSmile(), LEFT),
        );
        this.addDialogue( //64
            `${this.firedog}`,
            `Let's go back now!`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );

        this.game.ntharaxDefeated = true;
        this.game.saveGameState();
    }
}