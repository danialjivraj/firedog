import { StoryCutscene } from './storyCutsceneBase.js';

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
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `I know ${this.galadon} said he would take some time to recover, but I had small hopes to see him opening that door.`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `Wha- Is that you ${this.galadon}!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.penguini}`,
            `Do I look like a ${this.galadon} to you?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguiniGunUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Oh... Hi ${this.penguini}, what's going on?`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
            this.addImage('penguiniGunUp', RIGHT),
        );
        this.addDialogue( //20
            `${this.penguini}`,
            `Nothing, nothing. Are you leaving now ya' fool?`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('penguiniGunTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.penguini}`,
            `My brother reached out to me telepathically. He said you were heading to ${this.infernalCraterPeak}. Is that right?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniGunTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Yes, I was just about to leave actually.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('penguiniGunTalkNormal', RIGHT),
        );
        this.addDialogue( //23
            `${this.penguini}`,
            `I see. Let me take you to the safest path. There's loads of dead ends on the way to ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguiniGunTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.penguini}`,
            `So if you want to save time, I'll show you the path you need to take.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguiniGunTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Oh, that's so kind of you ${this.penguini}! Sure thing!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('penguiniGunTalkNormal', RIGHT),
        );
        this.addDialogue( //26
            `${this.penguini}`,
            `Stop saying that ya' fool!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('penguiniGunUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `Haha, I know you care about me deep inside ${this.penguini}!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('penguiniGunUp', RIGHT),
        );
        this.addDialogue( //28
            `${this.penguini}`,
            `Whatever you say, ya' fool.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('penguiniGunTalkNormal', RIGHT, { talking: true }),
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
            this.addImage('penguiniGunTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.penguini}`,
            `Okay, we are now in ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniGunTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //31
            `${this.penguini}`,
            `Be careful with the enemies in here. And don't get lost ya' fool!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniGunTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `I see. Thank you for this ${this.penguini}! I would've definitely gotten lost if you didn't lead me here.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('penguiniGunTalkNormal', RIGHT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `Wait... do I have to pay you for this?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('penguiniGunTalkNormal', RIGHT),
        );
        this.addDialogue( //34
            `${this.penguini}`,
            `No. Free of charge this time. Although you probably won't make it out alive ya' fool! Hahahaha!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguiniGunLaugh', RIGHT, { talking: true }),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `Those are very reassuring words ${this.penguini}..`,
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('penguiniGunLaugh', RIGHT),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `Anyways, I'll be going now. I'll try to keep my distance from the active volcanoes!`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('penguiniGunLaugh', RIGHT),
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
            this.addImage('penguiniGunTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `This is it. This is ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `Everything has led up to this moment... Let's find the cave.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `It's scorching hot in here... There's lava inside this cave...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I feel so strange being here... It's like this place is somehow familiar...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `I've got no time to waste. I need to stop ${this.elyvorg} from reaching the ${this.temporalTimber} before it's too late.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                }),
            },
            this.addImage(this.setfiredogAngry(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Ouch... my head...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `No... not now... it feels even stronger here...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `The pain is unbearable... damn it... no...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //8
            `${this.questionMark}`,
            `Hahahaha. We're here.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //9
            `${this.questionMark}`,
            `Finally. I've waited a long time for you to reach this place.`,
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
            `Soon, I will return to the ${this.crypticToken}, and its power will be whole again.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `What... is that why you were trying to lead me here so quickly?`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Damn it... I see...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `So the ${this.crypticToken} won't be as powerful while I'm alive... because part of its energy is still inside me.`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.questionMark}`,
            `Exactly. Ever since the ${this.crypticToken}'s energy was forced into you years ago, part of its power has remained trapped in your body.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //15
            `${this.questionMark}`,
            `When you die, I will return to where I belong... to the ${this.crypticToken}.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `What... but doesn't ${this.elyvorg} also have the ${this.crypticToken}'s energy in his body?`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //17
            `${this.questionMark}`,
            `He does. But unlike you, ${this.elyvorg} embraced it. He is far more suited to bear its evil power than you ever were.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //18
            `${this.questionMark}`,
            `Once the ${this.temporalTimber} awakens the ${this.crypticToken}, ${this.elyvorg} will offer his body as its vessel.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Damn it...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.questionMark}`,
            `There is nothing you can do to stop this. I can already feel the energy of the ${this.temporalTimber} nearby...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //21
            `${this.questionMark}`,
            `Hahahahaha... yes... the ${this.crypticToken}'s true power is about to awaken once again!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Ugh...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `(This isn't good... I'm feeling less like myself the more time passes...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `(This can't be the end of me...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `(I need to come back to reality...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.questionMark}`,
            `You can't! Hahahaha! The mere presence of the ${this.temporalTimber} is making the connection stronger.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //27
            `${this.questionMark}`,
            `I can keep you trapped here until your body is killed, and then all of me will return to the ${this.crypticToken}.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //28
            `${this.questionMark}`,
            `I do have to thank ${this.valdorin} for letting you come here. Such a fool! Hahahahaha!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `Damn it...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `(I can't snap out of it... my consciousness is slowly fading away...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //31
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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.galadon}`,
            `${this.penguini} are you okay? Your brother from ${this.springlyLemony} told me what happened. I was faster than your brothers, but they'll arrive shortly.`,
        );
        this.addDialogue( //33
            `${this.penguini}`,
            `Ugh... yes, ${this.galadon}... ${this.firedog} went inside... you should go after him... whoever attacked me is truly strong.`,
        );
        this.addDialogue( //34
            `${this.galadon}`,
            `I'll go now, we don't have much time.`,
        );
        this.addDialogue( //35
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
        this.addDialogue( //36
            `${this.elyvorg}`,
            `They really tried to hide it from me, as if that would make the ${this.temporalTimber} harder to find.`,
        );
        this.addDialogue( //37
            `${this.elyvorg}`,
            `But due to your lack of competence ${this.valdorin}, I can feel where it is.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'map7TemporalTimberLocation',
                }),
            },
        );
        this.addDialogue( //38
            `${this.elyvorg}`,
            `I can see it now. Let's get closer.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'map7TemporalTimber1',
                }),
            },
        );
        this.addDialogue( //39
            `${this.elyvorg}`,
            `So this is it... the ${this.temporalTimber}.`,
        );
        this.addDialogue( //40
            `${this.elyvorg}`,
            `Some of the ${this.crypticToken}'s power still lingers inside ${this.firedog}.`,
        );
        this.addDialogue( //41
            `${this.elyvorg}`,
            `However, it doesn't matter. I can awaken the ${this.crypticToken} now, and once I take ${this.firedog} down, its power will be whole again.`,
        );
        this.addDialogue( //42
            `${this.elyvorg}`,
            `So, let's place the ${this.crypticToken} where it belongs.`,
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
        this.addDialogue( //43
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
        this.addDialogue( //44
            `${this.elyvorg}`,
            `The whole ground is shaking. Astonishing power.`,
        );
        this.addDialogue( //45
            `${this.elyvorg}`,
            `Truly magnificent.`,
        );
        this.addDialogue( //46
            `${this.elyvorg}`,
            `Hahaha... Hahahahahahahaha!`,
        );
        this.addDialogue( //47
            `${this.elyvorg}`,
            `Now that the ${this.crypticToken} is awakened, let all of that power be channeled into my body!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'map7TemporalTimberActive',
                }),
            },
        );
        this.addDialogue( //48
            `${this.elyvorg}`,
            `And now, I need to kill you, ${this.firedog}...`,
        );
        this.addDialogue( //49
            `${this.elyvorg}`,
            `Once you're dead, the last of the ${this.crypticToken}'s power will return, and I will attain the power of a God!`,
        );
        this.addDialogue( //50
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
        this.addDialogue( //51
            `${this.nysera}`,
            `The ground... the ground is shaking...`,
            this.addImage('nyseraScared', LEFT, { talking: true }),
            this.addImage('valdorinSurprised', RIGHT),
        );
        this.addDialogue( //52
            `${this.nysera}`,
            `Does that mean...`,
            this.addImage('nyseraScared', LEFT, { talking: true }),
            this.addImage('valdorinSurprised', RIGHT),
        );
        this.addDialogue( //53
            `${this.valdorin}`,
            `Yes... ${this.elyvorg} managed to find the ${this.temporalTimber}...`,
            this.addImage('nyseraScared', LEFT),
            this.addImage('valdorinSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //54
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
            this.addImage('valdorinFistUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //55
            `${this.galadon}`,
            `Wow!? The ground is shaking so violently... What is happening? This is not good...`,
            this.addImage('galadonScaredHurt', LEFT, { talking: true }),
        );
        this.addDialogue( //56
            `${this.galadon}`,
            `Wait... ${this.firedog}, is that you!?`,
            this.addImage('galadonScaredHurt', LEFT, { talking: true }),
        );
        this.addDialogue( //57
            `${this.galadon}`,
            `Hey, snap out of it! Wake up ${this.firedog}.`,
            this.addImage('galadonScaredHurt', LEFT, { talking: true }),
        );
        this.addDialogue( //58
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
            this.addImage('galadonScaredHurt', LEFT, { talking: true }),
        );
        this.addDialogue( //59
            `${this.firedog}`,
            `Wha- The ground... what's going on...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //60
            `${this.questionMark}`,
            `After centuries... finally... this world shall know pain.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //61
            `${this.galadon}`,
            `${this.firedog}, wake up! This isn't the time to be asleep! Snap out of it now!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //62
            `${this.firedog}`,
            `I can hear ${this.galadon}!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //63
            `${this.firedog}`,
            `I think this is working... ${this.galadon} is slowly pulling me out of this place...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //64
            `${this.galadon}`,
            `Wake up ${this.firedog}, the whole ground is shaking, we need to stop ${this.elyvorg} now!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //65
            `${this.firedog}`,
            `(That's it... I'm going to snap out of it!)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //66
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
                    }, 2100);
                    setTimeout(() => { this.addEventListeners(); }, 6500);
                },
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //67
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 2000, blackDuration: 1000, fadeOut: 3500,
                    imageId: 'madeByDanial',
                }),
            },
        );
        this.addDialogue( //68
            ``,
            ``,
        );

        this.game.elyvorgDefeated = true;
        this.game.saveGameState();
    }
}
