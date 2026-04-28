import { StoryCutscene } from './storyCutsceneBase.js';

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
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I don't understand why ${this.valdorin} wouldn't let me out for pretty much my whole life... I know there is still tension among lands, but...`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `This is quite a sight... I mean, being in that submarine was quite the experience... heck! Who knew breathing underwater was possible!?`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `I really could be an explorer, and see every corner of every land. When I get back home, with the ${this.temporalTimber}, I wonder what life will be like.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `After all these amazing experiences, there is no way I want to be stuck again inside ${this.lunarGlade}! Haha!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `These... these are footsteps?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `I wonder whose footsteps these are.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `Whoever it is, it's way bigger than my feet, haha!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `These look rather fresh... I'd say only a couple of hours old.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `What...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `No... it's happening while I'm awake now?`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `Ughh! The pain is unbearable... I can't stop it from coming.`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `I'm here again...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `(Okay, remain calm... let's figure out why this is happening.)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `What do you want from me?`,
            this.addImage(this.setfiredogAngry(), LEFT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.questionMark}`,
            `I want the same thing you want!`,
            this.addImage(this.setfiredogAngry(), LEFT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `What...?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //27
            `${this.questionMark}`,
            `No. You wouldn't know. He used your body for his filthy experiments with the ${this.crypticToken}!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `That can't be possible...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `The ${this.crypticToken} was always kept in the safe, it was never used for... any experiment whatsoever!`,
            this.addImage(this.setfiredogAngry(), LEFT, { talking: true }),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `Why are you in my mind? Why have these dreams been happening ever since I left ${this.lunarGlade}? Why are you doing this to me?`,
            this.addImage(this.setfiredogAngry(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `What that voice said... about ${this.valdorin}...`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `I don't trust that voice one bit... But why would it lie to me...?`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `Ugh... is this voice the reason ${this.valdorin} kept me inside ${this.lunarGlade} all this time?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT, { talking: true }),
        );
        this.addDialogue( //43
            `${this.firedog}`,
            `"Go get what I need to come back to." - What did the voice mean by that?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `This is such a weird feeling. But I feel like I'm getting closer to the token.`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `I need to keep going. Maybe I can find ${this.galadon} along the way. Perhaps he can give me the answers I seek right now.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `I wonder how everyone is doing back home... ${this.valdorin}... ${this.nysera}... what is happening to me...?`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //48
            `${this.nysera}`,
            `How do you feel ${this.valdorin}?`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
        );
        this.addDialogue( //49
            `${this.valdorin}`,
            `I feel better. It seems like I'll make a full recovery.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //50
            `${this.nysera}`,
            `I'm glad to hear that.`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //51
            `${this.nysera}`,
            `Do you think ${this.firedog} will be okay outside of our land?`,
            this.addImage('nyseraExplaining', LEFT, { talking: true }),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //52
            `${this.valdorin}`,
            `I hope so. It's not like we had much of a choice but to let him go now...`,
            this.addImage('nyseraExplaining', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //53
            `${this.nysera}`,
            `You didn't tell him, did you ${this.valdorin}?`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //54
            `${this.valdorin}`,
            `No. How would we? I do believe ${this.firedog} is the only one who can stop him.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //55
            `${this.nysera}`,
            `Do you think it was ${this.elyvorg}?`,
            {
                onAdvance: () => setTimeout(() => this.playMusic('inTheFuture', true), 500),
            },
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //56
            `${this.valdorin}`,
            `Yes... I believe it was. He came back for revenge for what we did 10 years ago.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
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
            this.addImage('nyseraNormal', LEFT, { talking: true }),
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
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //59
            `${this.valdorin}`,
            `The goal was simple. I wanted to find a living being capable of containing the raw energy of the ${this.crypticToken} long enough to become my weapon.`,
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //60
            `${this.valdorin}`,
            `So we exposed subjects to the token's energy in controlled experiments... and one after another, they died.`,
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //61
            `${this.valdorin}`,
            `Their bodies could not endure the surge. The power was simply too violent.`,
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //62
            `${this.valdorin}`,
            `After many failed experiments, we finally had a survivor. ${this.elyvorg}.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map4ElyvorgFlames',
                }),
            },
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //63
            `${this.valdorin}`,
            `His body was the first one strong enough to contain the intense energy of the ${this.crypticToken}. At first, I believed I had succeeded.`,
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //64
            `${this.valdorin}`,
            `He adapted quickly. His control over power was exceptional, especially electricity and dark matter.`,
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //65
            `${this.valdorin}`,
            `We put him through many tests, and he passed them with ease. He was exactly what we had hoped for... an unstoppable weapon.`,
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //66
            `${this.valdorin}`,
            `A weapon that would put fear in every other land. That was the goal. We believed we had obtained an ultimate power that we could control, unlike the ${this.temporalTimber}.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map4EvilElyvorg',
                }),
            },
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //67
            `${this.valdorin}`,
            `But the longer he contained the token's energy, the more corrupted he became. It reached a point where he killed several guards after losing control.`,
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //68
            `${this.valdorin}`,
            `That was when I knew he could no longer be allowed to carry that power. We severed his connection to the ${this.crypticToken}'s energy.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map4BrokenGlassChamber',
                }),
            },
            this.addImage('valdorinFistUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //69
            `${this.valdorin}`,
            `After the procedure, we went to check on ${this.elyvorg}, only to find the glass chamber containing him completely broken. He had escaped.`,
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //70
            `${this.valdorin}`,
            `Near the ground, I found a note that he had left. It said:`,
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //71
            `${this.valdorin}`,
            `"I will be back to kill you, ${this.valdorin}."`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1KingsBedroom',
                }),
            },
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //72
            `${this.valdorin}`,
            `He was a failed experiment. And he was gone. He never came back after that.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //73
            `${this.valdorin}`,
            `We continued with the ${this.projectCryptoterraGenesis} for one more year after that incident.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //74
            `${this.valdorin}`,
            `After many more failures, we found another survivor... ${this.firedog}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //75
            `${this.valdorin}`,
            `With everything we had learned from ${this.elyvorg}, we handled the process more carefully and tried different methods to help ${this.firedog} control the power.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //76
            `${this.valdorin}`,
            `At first, it seemed to work. He was able to contain the token's energy far better than the others had.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //77
            `${this.valdorin}`,
            `He showed a strong control with fire, though he never reached the same mastery over the other forces that ${this.elyvorg} once had.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //78
            `${this.valdorin}`,
            `But eventually, the same darkness began to emerge in him as well.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //79
            `${this.valdorin}`,
            `He became less like himself... and then the dreams began.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //80
            `${this.valdorin}`,
            `Dreams he described as terrifying. Something in them was trying to lure him away from ${this.lunarGlade}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //81
            `${this.valdorin}`,
            `No one fully understood why those dreams came to him, other than them being a side effect of the ${this.crypticToken}'s energy.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //82
            `${this.valdorin}`,
            `So we severed ${this.firedog}'s connection to the ${this.crypticToken} before it could do any more harm.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //83
            `${this.valdorin}`,
            `Miraculously, ${this.firedog} made a good recovery. I did, however, erase his memories of the experiments we performed on him.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //84
            `${this.valdorin}`,
            `We decided to put an end to the ${this.projectCryptoterraGenesis} for good.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //85
            `${this.valdorin}`,
            `And just when we believed everything was finally over, we noticed that ${this.firedog} had kept his fire abilities.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //86
            `${this.valdorin}`,
            `It is possible that ${this.elyvorg} also kept some of his powers, but we would not know. He ran away and never returned.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //87
            `${this.valdorin}`,
            `Still... when I was struck by that electric attack in the safe room, it reminded me of ${this.elyvorg}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //88
            `${this.valdorin}`,
            `If it was truly him, then he must have retained at least that power after all these years.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //89
            `${this.valdorin}`,
            `I do not know how ${this.firedog} and ${this.elyvorg} still had those powers, because we ensured that the ${this.crypticToken}'s energy was completely removed from them.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //90
            `${this.valdorin}`,
            `My guess is that the ${this.crypticToken} awakens something within the body permanently. But I cannot say for certain.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //91
            `${this.valdorin}`,
            `After a couple of days, something started to happen again.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //92
            `${this.nysera}`,
            `The evil dreams... they didn't stop.`,
            this.addImage('nyseraSurprised', LEFT, { talking: true }),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //93
            `${this.valdorin}`,
            `Yes. Even after the connection was severed, ${this.firedog} began having those dreams again.`,
            this.addImage('nyseraSurprised', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //94
            `${this.valdorin}`,
            `No doctor could explain it. They believed that the intense energy of the ${this.crypticToken} had somehow left a mark on him.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //95
            `${this.valdorin}`,
            `So our sorcerers worked and came up with a solution. Currently, ${this.lunarGlade} is surrounded by a protective layer built by our sorcerers.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //96
            `${this.valdorin}`,
            `This magical layer is preventing outside hidden entities from entering the land, and it also has the ability to detect unknown souls that trespass it.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //97
            `${this.valdorin}`,
            `This same exact magical layer is used to protect the safe room, where the ${this.crypticToken} was.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //98
            `${this.valdorin}`,
            `So inside the safe room, the ${this.crypticToken}'s energy is completely trapped.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //99
            `${this.valdorin}`,
            `And soon enough, ${this.firedog} started having fewer of these dreams... and then he simply became normal again.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //100
            `${this.valdorin}`,
            `I believe that because ${this.firedog} survived the token's energy, he somehow remained connected to it.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //101
            `${this.valdorin}`,
            `No one truly understands how or why. Even after all these centuries, the ${this.crypticToken} is still a mystery.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //102
            `${this.valdorin}`,
            `This is why I did not want him to leave the land after all these years. He doesn't seem to really remember what had happened.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //103
            `${this.valdorin}`,
            `The longer he remains out there, unprotected, the more he may be consumed by evil.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //104
            `${this.valdorin}`,
            `But I had to let him go. He might be the only one who can stop ${this.elyvorg}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //105
            `${this.valdorin}`,
            `If ${this.elyvorg} was indeed the individual who stole the ${this.crypticToken}, it would explain why he wasn't detected by the magical layer.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //106
            `${this.valdorin}`,
            `I also do believe he was the one who destroyed the traps 2 weeks ago. He was most likely testing our security... and struck at its weaknesses.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //107
            `${this.valdorin}`,
            `But I also wonder why he didn't kill me when he had the chance to. After all, he left that note years ago...`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinFistUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //108
            `${this.nysera}`,
            `Could it be that whatever he is planning is way worse than having the chance to kill you?`,
            this.addImage('nyseraScared', LEFT, { talking: true }),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //109
            `${this.valdorin}`,
            `I believe that is the case.`,
            this.addImage('nyseraScared', LEFT),
            this.addImage('valdorinFistUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //110
            `${this.valdorin}`,
            `I do regret the ${this.projectCryptoterraGenesis}. Many lives were lost because of my obsession for power, and that is something I cannot erase now.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinFistUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //111
            `${this.valdorin}`,
            `And it seems karma is coming back to me...`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //112
            `${this.valdorin}`,
            `Wherever ${this.firedog} might be, I hope he manages to get the ${this.crypticToken} back to us.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //113
            `${this.nysera}`,
            `We all hope so...`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //114
            `${this.nysera}`,
            `I wonder where ${this.firedog} is right now.`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
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
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Is that you ${this.galadon}!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `What happened!? Who... who could've done this to you!?`,
            this.addImage(this.setfiredogCry2(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.galadon}`,
            `I'm glad to see you here ${this.firedog}...`,
            this.addImage(this.setfiredogCry2(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.galadon}`,
            `Don't worry, I'm fine...`,
            this.addImage(this.setfiredogCry2(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.galadon}`,
            `I was trying to get through ${this.verdantVine}...`,
            this.addImage(this.setfiredogCry2(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.galadon}`,
            `Everything was going fine... I was making progress through the jungle when I spotted someone up ahead.`,
            this.addImage(this.setfiredogCry2(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `What did you see?`,
            this.addImage(this.setfiredogCry(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //8
            `${this.galadon}`,
            `I saw a hooded individual up ahead. I thought it could perhaps be an explorer at first, so I called for them.`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.galadon}`,
            `But... as soon as they heard me they instantly turned around and attacked me with a vicious electric attack that shocked my whole nervous system in an instant.`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //10
            `${this.galadon}`,
            `I never felt pain like that before. That couldn't possibly be an explorer...`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //11
            `${this.galadon}`,
            `Luckily, I was near the cabin, so with all my remaining strength, I somehow managed to get here.`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.galadon}`,
            `Thankfully, there were some medical kits lying around, so I used some of them to cover my wounds.`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //13
            `${this.galadon}`,
            `I'm feeling better now but it will take me some time to be able to move again properly... my legs still feel numb from the attack.`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `This is horrible... I can't believe this...`,
            this.addImage(this.setfiredogCry(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `Why would anyone do this to you?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //16
            `${this.galadon}`,
            `I don't know... But as I was resting in this cabin I had some time to think of some possible theories.`,
            {
                onAdvance: () => this.playMusic('planetsParalysis', true),
            },
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `What theories!?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //18
            `${this.galadon}`,
            `Well... do you remember how ${this.valdorin} was attacked?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Hmm...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
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
            this.addImage('valdorinSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `That's right! He was attacked by a dark-hooded figure, who used an electric attack as well...!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `So this means that you were most likely attacked by the same perpetrator...!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //24
            `${this.galadon}`,
            `Exactly. That is what I was thinking...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //25
            `${this.galadon}`,
            `But if indeed that was the thief who stole the ${this.crypticToken}, then this is horrible news ${this.firedog}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Oh, how come ${this.galadon}?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //27
            `${this.galadon}`,
            `This hooded individual is going towards... ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Wha! You're right... does that mean that...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //29
            `${this.galadon}`,
            `Yep... that means that whoever is behind that hood most likely knows about the ${this.temporalTimber}, and even worse, its location.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.galadon}`,
            `So this situation has gone from bad to worse. We really don't have any more time to waste ${this.firedog}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `How do they know about the location of the ${this.temporalTimber}? How did they even know about the ${this.crypticToken} in the first place...`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //32
            `${this.galadon}`,
            `Trust me ${this.firedog}, I have the same questions too... But when we catch up to them and get the token back, we'll get our answers.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `I see...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `Will you be able to come with me ${this.galadon}?`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //35
            `${this.galadon}`,
            `I wish I could, but it's definitely going to take me some time to recover.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.galadon}`,
            `The cave is not too far off anymore ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `I understand. Is anybody from our homeland ahead of us?`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //38
            `${this.galadon}`,
            `I don't think so. I'm pretty sure we're closer to the cave than any other individual from ${this.lunarGlade} on this mission.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //39
            `${this.galadon}`,
            `We both took the shortcut underwater. That saved us at least a full day. I'm glad I sent you that letter back in ${this.coralAbyss}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //40
            `${this.galadon}`,
            `Ouch... my body...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `Are you okay ${this.galadon}!?`,
            this.addImage(this.setfiredogCry(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //42
            `${this.galadon}`,
            `Yeah... I just still feel the pain from the attack...`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //43
            `${this.galadon}`,
            `But I'll be fine...`,
            this.addImage(this.setfiredogCry(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `(Whoever did this to you, ${this.galadon}, is going to pay for it...)`,
            { whisper: true },
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `${this.galadon}...`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //46
            `${this.galadon}`,
            `It's okay, I'll survive... For now, you should also rest for a couple minutes before you go.`,
            {
                onAdvance: () => this.fadeOutMusic('planetsParalysis'),
            },
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `Sounds like a plan.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.game.map5Unlocked = true;
        this.game.bonusMap2Unlocked = true;
        this.game.saveGameState();
    }
}
