import { StoryCutscene } from './storyCutsceneBase.js';

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
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `It was a good idea deciding to sleep outside today. Looking at the stars, feeling the breeze.. there's nothing better than this!`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `I... I kinda wish I could go out and explore outside this place. I do love ${this.lunarGlade}, I mean it's my home after all...`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `But I feel like there is so much more to explore outside of this land.`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `But ${this.valdorin} wouldn't allow me to. He thinks there is no point and it's too dangerous... What does he know!?`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Anyways... if I keep training I can prove ${this.valdorin} that I am strong enough to go out by myself!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `Haha! I feel so much more motivated now.`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
        );
        this.addDialogue( //15
            `${this.threeDots}`,
            `Ha! There you are ${this.firedog}! I have been looking for you everywhere!`,
            this.addImage(this.setfiredogHappy(), LEFT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Oh... Is that you ${this.galadon}?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );

        this.addDialogue( //17
            `${this.galadon}`,
            `Indeed it is! I had a feeling I would find you here!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `You know me well, I thought it would be a good idea to just set up a tent here and relax.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('galadonNormal', RIGHT),
        );
        this.addDialogue( //19
            `${this.galadon}`,
            `You've been sleeping outside a lot recently, any particular reason?`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonOh', RIGHT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Not really, it just feels nice to connect with nature once in a while!`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `But anyways... What brings you here ${this.galadon}?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //22
            `${this.galadon}`,
            `Just wanted to see how you were doing. I know that not being able to explore outside our home feels like prison to you sometimes.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.galadon}`,
            `I know you get really excited by the thought of the unknown, but it is quite danger-`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `Dangerous right, haha. Don't worry I've heard this a million times before!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('galadonSad', RIGHT),
        );
        this.addDialogue( //25
            `${this.galadon}`,
            `Haha yeah, I'm sorry for bringing it up again. But I'm sure that in no time you'll be able to go out there too!`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('galadonSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Thanks ${this.galadon}, I hope so too.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('galadonSad', RIGHT),
        );
        this.addDialogue( //27
            `${this.galadon}`,
            `Wow... This is quite a nice view in here ${this.firedog}. I never really noticed how nice this place looked before. No wonder you always come here!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonAmazed', RIGHT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `I know right? It's peaceful.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('galadonAmazed', RIGHT),
        );
        this.addDialogue( //29
            `${this.galadon}`,
            `Speaking of peaceful, did you see the local news around town recently?`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonOh', RIGHT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `No, what happened?`,
            {
                onAdvance: () => this.fadeOutMusic('onTheBeachAtDusk'),
            },
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //31
            `${this.galadon}`,
            `Apparently about 2 weeks ago, during a scout around the borders of ${this.lunarGlade}, some traps were discovered destroyed.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonOh', RIGHT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `Traps? What traps?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //33
            `${this.galadon}`,
            `How come you haven't heard of it! Our land is quite safe from intruders.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //34
            `${this.galadon}`,
            `When ${this.valdorin} took over the throne of our land years ago, he insisted in making our borders as secure as possible.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT, { talking: true }),
        );
        this.addDialogue( //35
            `${this.galadon}`,
            `This is why we have security guards and traps all around!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.galadon}`,
            `And apparently it was thought to be impossible to step on a trap and not be detected...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT, { talking: true }),
        );
        this.addDialogue( //37
            `${this.galadon}`,
            `So it was a surprise when one of the security guards on an early morning shift saw a trap destroyed.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT, { talking: true }),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `What kind of trap was it!?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT, { talking: true }),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //39
            `${this.galadon}`,
            `An explosive wire trap... well... not just one but around 5 within the area.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT, { talking: true }),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `Why would anyone want to invade us?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //41
            `${this.galadon}`,
            `Well, as you know, ${this.lunarGlade} keeps a very important item which resides at the center of the castle.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonAmazed', RIGHT, { talking: true }),
        );
        this.addDialogue( //42
            `${this.galadon}`,
            `So it comes to no surprise that we might get intruders that take interest in it... but the good news is that no one has ever crossed past the traps!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT, { talking: true }),
        );
        this.addDialogue( //43
            `${this.galadon}`,
            `Nonetheless it's still definitely sketchy... but I'm sure it's fine as everyone in here works towards making our land safer, including me!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonOh', RIGHT, { talking: true }),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `(How would anyone go unnoticed? I mean... I have heard about how secure our land is, but to destroy some traps without being spotted?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('galadonOh', RIGHT),
        );
        this.addDialogue( //45
            `${this.galadon}`,
            `Why did you go quiet all of a sudden! Didn't mean to scare ya'!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `Haha, I'm not scared ${this.galadon}, well... not as much as you are at least!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('galadonSurprised', RIGHT),
        );
        this.addDialogue( //47
            `${this.galadon}`,
            `Very funny of you ${this.firedog}.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('galadonNormal', RIGHT, { talking: true }),
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
            this.addImage('galadonScared', RIGHT, { talking: true }),
        );
        this.addDialogue( //50
            `${this.threeDots}`,
            `Intruder? What are you talking about... It's ${this.nysera}.`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('galadonScared', RIGHT),
        );
        this.addDialogue( //51
            `${this.nysera}`,
            `I have been ordered to find you two.`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('galadonScared', RIGHT),
        );
        this.addDialogue( //52
            `${this.galadon}`,
            `Did you miss us that badly ${this.nysera}?`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('galadonAmazed', RIGHT, { talking: true }),
        );
        this.addDialogue( //53
            `${this.nysera}`,
            `This is no time for jokes. While you two were away ${this.valdorin}...`,
            this.addImage('nyseraExplaining', LEFT, { talking: true }),
            this.addImage('galadonAmazed', RIGHT),
        );
        this.addDialogue( //54
            `${this.galadon}`,
            `Uh...? What about ${this.valdorin}?`,
            this.addImage('nyseraExplaining', LEFT),
            this.addImage('galadonSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //55
            `${this.nysera}`,
            `Someone has attacked ${this.valdorin} this afternoon...`,
            this.addImage('nyseraExplaining', LEFT, { talking: true }),
            this.addImage('galadonSurprised', RIGHT),
        );
        this.addDialogue( //56
            `${this.everyone}`,
            `WHAT!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('galadonScared', RIGHT, { talking: true }),
        );
        this.addDialogue( //57
            `${this.galadon}`,
            `What do you mean someone attacked ${this.valdorin}? Who?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('galadonScared', RIGHT, { talking: true }),
        );
        this.addDialogue( //58
            `${this.nysera}`,
            `He's alive... but it's best if you come with me... ${this.valdorin} has ordered me to find and bring you two inside the castle.`,
            this.addImage('nyseraExplaining', LEFT, { talking: true }),
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
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('galadonSad', RIGHT),
        );
        this.addDialogue( //60
            `${this.galadon}`,
            `Seems like we're at the entrance.`,
            this.addImage('galadonNormal', RIGHT, { talking: true }),
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
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonNormal', RIGHT),
        );
        this.addDialogue( //62
            `${this.valdorin}`,
            `I hear footsteps...`,
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //63
            `${this.valdorin}`,
            `${this.firedog}... ${this.galadon}... is that you?`,
            this.addImage('valdorinCrossedArms', RIGHT, { talking: true }),
        );
        this.addDialogue( //64
            `${this.galadon}`,
            `We're here... What happened?`,
            {
                onAdvance: () => setTimeout(() =>
                    this.playMusic('inTheFuture', true), 600),
            },
            this.addImage('galadonSurprised', LEFT, { talking: true }),
            this.addImage('valdorinCrossedArms', RIGHT),
        );
        this.addDialogue( //65
            `${this.valdorin}`,
            `The most precious item of ${this.lunarGlade}... it has been stolen.`,
            this.addImage('galadonSurprised', LEFT),
            this.addImage('valdorinFistUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //66
            `${this.everyone}`,
            `What!?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT, { talking: true }),
            this.addImage('galadonScared', RIGHT, { talking: true }),
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
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //68
            `${this.valdorin}`,
            `I heard a sound coming from the safe room. There's always guards on shift keeping an eye on the safe room, but when I called for them no one answered.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //69
            `${this.valdorin}`,
            `I got curious and went to open the door. Once I got there I heard a noise behind me.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //70
            `${this.valdorin}`,
            `I looked behind and a dark-hooded figure knocked me down with some sort of electric attack before I could use any of my abilities.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1SafeRoomBroken',
                }),
            },
            this.addImage('valdorinSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //71
            `${this.valdorin}`,
            `Before I knew it, it was already too late.`,
            this.addImage('valdorinFistUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //72
            `${this.galadon}`,
            `I can't believe it, this is not good...`,
            this.addImage('galadonScared', LEFT, { talking: true }),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //73
            `${this.firedog}`,
            `What's gonna happen now that the ${this.crypticToken} has been taken away from the safe?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('galadonScared', RIGHT),
        );
        this.addDialogue( //74
            `${this.valdorin}`,
            `Bad things... The ${this.crypticToken} is no ordinary relic. By itself it already holds immense magical power, and anyone who touches it is struck by a dangerous surge of energy.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('valdorinFistUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //75
            `${this.valdorin}`,
            `But the true story of the ${this.crypticToken} began long before any of us were born.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //76
            `${this.valdorin}`,
            `To understand why the relic is so dangerous... you must know how it first appeared in our world.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500,
                    blackDuration: 500,
                    fadeOut: 500,
                    imageId: 'map1crypticTokenWar',
                }),
            },
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //77
            `${this.valdorin}`,
            `Every land was once at war with each other centuries ago...`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //78
            `${this.valdorin}`,
            `Many battles took place... and many soldiers have died...`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //79
            `${this.valdorin}`,
            `It was a never ending battle.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //80
            `${this.valdorin}`,
            `But one day... something happened that changed everything.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //81
            `${this.valdorin}`,
            `A blinding object fell from the night sky straight into the middle of the battlefield.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //82
            `${this.valdorin}`,
            `The moment it struck the ground, a violent tremor spread across the area.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //83
            `${this.valdorin}`,
            `The earth shook, the air felt heavy with magic, and no one understood what had just fallen from above.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //84
            `${this.valdorin}`,
            `Fear took over the battlefield, and soldiers from every side ran from the shining crater.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //85
            `${this.valdorin}`,
            `All of them fled... except my 9th great-grandparent, ${this.valdonotski}, who ruled our land at the time.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //86
            `${this.valdorin}`,
            `While the others escaped, he stepped toward the light.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //87
            `${this.valdorin}`,
            `The closer he walked, the harder it became to keep his eyes open from the brightness.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //88
            `${this.valdorin}`,
            `At the center of the crater, he found the ${this.crypticToken}.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //89
            `${this.valdorin}`,
            `But the token was not alone.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //90
            `${this.valdorin}`,
            `It was attached to an ancient wooden relic known as the ${this.temporalTimber}.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //91
            `${this.valdorin}`,
            `As he approached it, he felt an overwhelming force pouring out from the token.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //92
            `${this.valdorin}`,
            `When he reached out to touch it, a powerful surge of energy rushed through his entire body.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //93
            `${this.valdorin}`,
            `He felt strength unlike anything he had ever known.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //94
            `${this.valdorin}`,
            `But along with that power came something darker.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //95
            `${this.valdorin}`,
            `A corruptive energy flowed with it, as if the ${this.crypticToken} held both immense power and great danger within itself.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //96
            `${this.valdorin}`,
            `My ancestor realized that the ${this.temporalTimber} was not simply attached to the token.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //97
            `${this.valdorin}`,
            `It was channeling the token's full power.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //98
            `${this.valdorin}`,
            `And by doing so, it was also drawing out the full intensity of that evil energy.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //99
            `${this.valdorin}`,
            `So he made a decision.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //100
            `${this.valdorin}`,
            `Before the corruptive energy could consume him any further, he used the last of his willpower to tear the ${this.crypticToken} away from the ${this.temporalTimber}.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //101
            `${this.valdorin}`,
            `The moment the two were pulled apart, the tremors began to fade.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //102
            `${this.valdorin}`,
            `The light dimmed, and the flow of dark energy weakened.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //103
            `${this.valdorin}`,
            `He brought both relics home in secret to study them.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1Lab',
                }),
            },
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //104
            `${this.valdorin}`,
            `After many days of research, he began to understand what he had discovered.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //105
            `${this.valdorin}`,
            `The ${this.crypticToken} by itself already held immense magical power.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //106
            `${this.valdorin}`,
            `Anyone who touched it would be struck by an unbelievable surge of energy.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //107
            `${this.valdorin}`,
            `For some, that power could strengthen their abilities beyond normal limits.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //108
            `${this.valdorin}`,
            `For others, it could overwhelm their body and mind completely.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //109
            `${this.valdorin}`,
            `But when joined with the ${this.temporalTimber}, the token's true power could be fully channeled.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //110
            `${this.valdorin}`,
            `That made it far more powerful... but also far more dangerous.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //111
            `${this.valdorin}`,
            `The more of the token's power the timber drew out, the more intense the corruptive energy became as well.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //112
            `${this.valdorin}`,
            `My ancestors came to believe it was a relic sent from the heavens.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1KingsBedroom',
                }),
            },
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //113
            `${this.valdorin}`,
            `But whatever its origin, one truth became clear.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //114
            `${this.valdorin}`,
            `The two relics could never be allowed to remain together.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //115
            `${this.valdorin}`,
            `So the ${this.crypticToken} was kept hidden and protected within ${this.lunarGlade}.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //116
            `${this.valdorin}`,
            `While the ${this.temporalTimber} was concealed far away from our land.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //117
            `${this.valdorin}`,
            `That way, even if one relic was ever found, its full power could not be awakened so easily.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //118
            `${this.valdorin}`,
            `But now... for the first time in centuries, the ${this.crypticToken} has been stolen.`,
            this.addImage('valdorinFistUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //119
            `${this.valdorin}`,
            `The ${this.crypticToken} without the ${this.temporalTimber} is still incredibly powerful.`,
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //120
            `${this.valdorin}`,
            `But the thief will not be able to channel its full power unless the two relics are joined again.`,
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //121
            `${this.valdorin}`,
            `And if that happens, the corruptive energy within the token will grow far worse.`,
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //122
            `${this.valdorin}`,
            `That is why we still have a chance... but not much time.`,
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //123
            `${this.firedog}`,
            `Where can the ${this.temporalTimber} be found? Is it near our land?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('valdorinTalking', RIGHT),
        );
        this.addDialogue( //124
            `${this.valdorin}`,
            `Unfortunately not... The ${this.temporalTimber} is inside a cave in ${this.infernalCraterPeak}...`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //125
            `${this.valdorin}`,
            `If the culprit gets there before we do, the consequences will be huge. That's assuming they know the location of the ${this.temporalTimber}.`,
            this.addImage('valdorinTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //126
            `${this.valdorin}`,
            `Using the full power of the ${this.crypticToken} evilly would bring disaster to every land.`,
            this.addImage('valdorinFistUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //127
            `${this.valdorin}`,
            `We have sent some guards there already, but due to its urgency I will need you to go there as well ${this.galadon} and ${this.firedog}.`,
            this.addImage('valdorinFistUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //128
            `${this.firedog}`,
            `Me as well? You have always told me it is too dangerous for me to leave this land... Is this a good idea?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('valdorinFistUp', RIGHT),
        );
        this.addDialogue( //129
            `${this.valdorin}`,
            `Yes ${this.firedog}. Your powers could come in handy now, especially in a situation like this...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('valdorinFistUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //130
            `${this.valdorin}`,
            `${this.galadon}, you can go ahead and follow the trail to ${this.infernalCraterPeak}, we can't waste much time.`,
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //131
            `${this.galadon}`,
            `Got it. Catch up to me whenever you can ${this.firedog}, I'll go now.`,
            this.addImage('galadonNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //132
            `${this.firedog}`,
            `Stay safe ${this.galadon}...`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonNormal', RIGHT),
        );
        this.addDialogue( //133
            `${this.firedog}`,
            `Okay... ${this.valdorin}, shall I go too?`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //134
            `${this.valdorin}`,
            `Yes, you will go soon. ${this.nysera}, could you please guide ${this.firedog} outside and show him the path he needs to take?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //135
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
            this.addImage('nyseraHandUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //136
            `${this.nysera}`,
            `Okay... Now that we are outside, you will need to know a few things before you go out on this journey.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraHandUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //137
            `${this.firedog}`,
            `What things?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('nyseraHandUp', RIGHT),
        );
        this.addDialogue( //138
            `${this.nysera}`,
            `The path to ${this.infernalCraterPeak} is towards east for a couple lands, then south.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining', RIGHT, { talking: true }),
        );
        this.addDialogue( //139
            `${this.nysera}`,
            `We cannot travel straight south due to the vast empty desert and dangerously constant tornadoes blocking our path.. you'd be long gone.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining', RIGHT, { talking: true }),
        );
        this.addDialogue( //140
            `${this.nysera}`,
            `The ${this.temporalTimber} will be inside the biggest cave. Be careful in there, there's active volcanoes all the time in ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining', RIGHT, { talking: true }),
        );
        this.addDialogue( //141
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
            this.addImage('nyseraExplaining2', RIGHT, { talking: true }),
        );
        this.addDialogue( //142
            `${this.firedog}`,
            `Seems like we're outside the gates. It's already night. Will it be safe around this time?`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //143
            `${this.nysera}`,
            `Well... probably not... but if you are cautious enough you will be fine!`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('nyseraLaugh', RIGHT, { talking: true }),
        );
        this.addDialogue( //144
            `${this.firedog}`,
            `Well that's not very reassuring of you ${this.nysera}!`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('nyseraLaugh', RIGHT),
        );
        this.addDialogue( //145
            `${this.nysera}`,
            `All you need to know is that there will be different types of enemies ahead.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining2', RIGHT, { talking: true }),
        );
        this.addDialogue( //146
            `${this.nysera}`,
            `You will be fine as your rolling and diving abilities can take most of them out, however be careful as it won't work with every enemy.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining2', RIGHT, { talking: true }),
        );
        this.addDialogue( //147
            `${this.nysera}`,
            `You might need to use your fireball or dash attack against some enemies to avoid taking damage unexpectedly.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining2', RIGHT, { talking: true }),
        );
        this.addDialogue( //148
            `${this.nysera}`,
            `There are cabins scattered around in the land up ahead, so if you find one, I highly suggest you stay there for the night or rest for some time.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraExplaining2', RIGHT, { talking: true }),
        );
        this.addDialogue( //149
            `${this.nysera}`,
            `Also... one more thing... Killing enemies will give you ${this.coinIcon}${this.coinsLabel}. Make sure you gather as many ${this.coinIcon}${this.coinsLabel} as you can.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraHandUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //150
            `${this.nysera}`,
            `When entering a cabin, any leftover ${this.coinIcon}${this.coinsLabel} will be converted into ${this.creditCoinIcon}${this.creditCoinsLabel}, which you can then use to buy wardrobe items.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraHandUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //151
            `${this.firedog}`,
            `I'm good at saving ${this.coinIcon}${this.coinsLabel}! That should be easy!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('nyseraHandUp', RIGHT),
        );
        this.addDialogue( //152
            `${this.firedog}`,
            `Will you come with me as well?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('nyseraHandUp', RIGHT),
        );
        this.addDialogue( //153
            `${this.nysera}`,
            `I will stay here for now, protecting ${this.valdorin} as he recovers. In case anything else happens, we'll be ready.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('nyseraNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //154
            `${this.nysera}`,
            `Now go ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //155
            `${this.firedog}`,
            `(To even think that someone defeated ${this.valdorin} with ease... Can I even do this?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //156
            `${this.firedog}`,
            `(Only the higher-ups know about the situation... Apparently, the citizens are being kept in the dark. Well, it would be chaos if everyone knew...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //157
            `${this.firedog}`,
            `(This is why it's important to get the ${this.temporalTimber} from the cave in ${this.infernalCraterPeak} as soon as possible...)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //158
            `${this.firedog}`,
            `(But how is this happening? Someone really got through the safe unnoticed and got the ${this.crypticToken} that easily?)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //159
            `${this.firedog}`,
            `(Come to think of it... could this also be connected to what happened 2 weeks ago with the traps?)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //160
            `${this.firedog}`,
            `(What exactly is going on...)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //161
            `${this.firedog}`,
            `(To be able to pass through the traps, the guards, get through the castle, and find the safe while being able to escape...)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //162
            `${this.firedog}`,
            `(Let's go now, the future of this land might well depend on it.)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //163
            `${this.firedog}`,
            `I'll be going now then.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //164
            `${this.firedog}`,
            `Let's see if I can catch up to ${this.galadon}...!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //165
            `${this.nysera}`,
            `Good luck out there, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('nyseraNormal', RIGHT, { talking: true }),
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
            `Well... there goes my ${this.coinIcon}${this.coinsLabel}...`, this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `But at least I can rest here for a bit.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.threeDots}`,
            `Do you talk alone this often?`,
            this.addImage(this.setfiredogPhew(), LEFT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `WHO'S THAT!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.threeDots}`,
            `My name is ${this.duskmaw}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.duskmaw}`,
            `I'm an explorer.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `You scared me!`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //7
            `${this.duskmaw}`,
            `Haha, I'm sorry about that, I don't usually see many other explorers going on adventures themselves. What brings you here?`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('duskmawLaugh', RIGHT, { talking: true }),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Well I'm looking for-`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('duskmawLaugh', RIGHT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `(Wait... it wouldn't be wise of me if I told this stranger why I'm here.)`,
            { whisper: true },
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('duskmawLaugh', RIGHT),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `(Perhaps I can get him to give me some information about the land. That would be smart...)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('duskmawLaugh', RIGHT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `I'm looking for huh.. new adventures.. It's always been my sort of dream to be an explorer, just like you are!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('duskmawLaugh', RIGHT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `What about you? What brings you here?`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('duskmawLaugh', RIGHT),
        );
        this.addDialogue( //13
            `${this.duskmaw}`,
            `I'm a full-time traveler! I just visit the lands and explore all kinds of places!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `That's cool! What parts of the land have you explored? It seems you've been doing this for a while!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //15
            `${this.duskmaw}`,
            `For a while it has been indeed... I have been doing this for decades now... I have been practically everywhere.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Decades? That's impressive... You've been everywhere? Have you ever explored caves before...?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //17
            `${this.duskmaw}`,
            `Caves? I've been to many caves!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `I see. Is there any caves that are known for... being dangerous to go in?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //19
            `${this.duskmaw}`,
            `Hm, there sure are... I have been to quite some dangerous ones myself.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.duskmaw}`,
            `However, the most dangerous caves reside in ${this.infernalCraterPeak}... That is one of the few places I have never actually been...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Oh.. how come?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //22
            `${this.duskmaw}`,
            `You haven't heard of it? It's full of active volcanoes that could erupt at any point in time.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.duskmaw}`,
            `There have been some brave souls who dared to explore it, but none of them ever came back. Still to this day, the volcanoes are active.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.duskmaw}`,
            `Not to mention the number of caves that exist there. There are hundreds of caves.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT, { talking: true }),
        );
        this.addDialogue( //25
            `${this.duskmaw}`,
            `But if you are planning to explore that area.. I would suggest you not to, it's not worth the risk.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Oh I see, thanks for letting me know!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `(Well, that seems to be quite a dangerous place...)`,
            { whisper: true },
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //28
            `${this.duskmaw}`,
            `I would suggest you to get your rest. ${this.nightfallPhantomGraves} is known for being sort of... paranormal during the night...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT, { talking: true }),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `Paranormal...? ${this.nightfallPhantomGraves}?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //30
            `${this.duskmaw}`,
            `Yes my friend, we're in ${this.nightfallPhantomGraves} right now. You came just in time.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT, { talking: true }),
        );
        this.addDialogue( //31
            `${this.duskmaw}`,
            `There have been some encounters with explorers that have reported... well... sightings of ghosts...`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `Ghosts? This cannot be real can it...`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //33
            `${this.duskmaw}`,
            `Well... I wouldn't dare to check it out.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('duskmawLiftingHat', RIGHT, { talking: true }),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `You're totally right. I wasn't planning on going out at this hour anyway...`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('duskmawLiftingHat', RIGHT),
        );
        this.addDialogue( //35
            `${this.duskmaw}`,
            `As a fellow explorer, I think it's only right if I give you a backstory of the lands I've been on.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawLiftingHat2', RIGHT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `Oh that sounds great! I'd love to hear more stories.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('duskmawLiftingHat2', RIGHT),
        );
        this.addDialogue( //37
            `${this.duskmaw}`,
            `As you are aware centuries ago, every land was at war. Searching for power and to conquer land.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //38
            `${this.duskmaw}`,
            `Many have died before a peace treaty was proposed. Nowadays the biggest land belongs to ${this.lunarGlade}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `(That's my home...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //40
            `${this.duskmaw}`,
            `Many other lands were frustrated, they were left with almost nothing, but to honor the peace treaty, and to avoid more deaths, everyone has tried to move on past the wars.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //41
            `${this.duskmaw}`,
            `As I had told before, we are currently inside ${this.nightfallPhantomGraves}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //42
            `${this.duskmaw}`,
            `${this.nightfallPhantomGraves} used to be a city with plenty of resources, however, due to the wars, it became a battle zone, and eventually... a ghost town-`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //43
            `${this.duskmaw}`,
            `-and slowly, it became a cemetery. It is believed that the spirits that wander during the night are the soldiers who sacrificed their life during the war.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //44
            `${this.duskmaw}`,
            `Although one particular spirit seems to be the most aggressive to anyone who enters ${this.nightfallPhantomGraves}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //45
            `${this.duskmaw}`,
            `But there are many other lands, such as ${this.coralAbyss}, which is famous for its vast lakes and rivers.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //46
            `${this.duskmaw}`,
            `They are rich in vegetation because of their geographic location, and they have found a way to filter their waters, which are then sold to nearby lands.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //47
            `${this.duskmaw}`,
            `Then we have ${this.verdantVine} which is known for its vast amount of vines that scatter throughout the whole land.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //48
            `${this.duskmaw}`,
            `They sell all types of wood, that's what keeps their economy strong.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //49
            `${this.duskmaw}`,
            `They are able to mass-produce furniture, such as tables, chairs, beds, doors... you name it, they make it!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //50
            `${this.duskmaw}`,
            `Fun fact, the materials of all cabins came from ${this.verdantVine}!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //51
            `${this.duskmaw}`,
            `${this.springlyLemony} is known for its food and plants. It's always spring there, so they are able to collect honey, and their trees yield delicious fruits all year.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //52
            `${this.duskmaw}`,
            `Their weather changes frequently from sunny to rainy, but this attracts animals to the area.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //53
            `${this.duskmaw}`,
            `They have many animals there! In fact, they own farms where they breed all kinds of animals and sell them to nearby lands when they become overpopulated.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //54
            `${this.duskmaw}`,
            `Then there is ${this.venomveilLake}, a deadly poisonous lake. Surprisingly, some creatures learned to adapt and became resistant to the poison, making the lake their home.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //55
            `${this.duskmaw}`,
            `You would be surprised to know how ${this.venomveilLake} was once a lively forest many centuries ago.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //56
            `${this.firedog}`,
            `How did a forest become a deadly poisonous lake?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //57
            `${this.duskmaw}`,
            `That is a good question. The reality is, due to ${this.infernalCraterPeak}'s rich environment, the land would be under constant threat of attacks.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //58
            `${this.duskmaw}`,
            `To protect themselves, they decided use the toxic waste from the minerals and rocks and dump it in the nearest forest.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //59
            `${this.duskmaw}`,
            `This was a lengthy process that slowly made the ground toxic.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //60
            `${this.duskmaw}`,
            `As the ground was slowly getting eaten away by the toxic waste, the lake underneath revealed itself. It is somewhat sad, but the strategy worked.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //61
            `${this.duskmaw}`,
            `Getting into their land was much harder with this protective toxic layer.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //62
            `${this.duskmaw}`,
            `Lastly, you have ${this.infernalCraterPeak}. It used to be a rich land, richer than all of the others lands combined...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //63
            `${this.duskmaw}`,
            `Being near the volcanoes provided them heat, which allowed the land to survive the toughest conditions.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //64
            `${this.duskmaw}`,
            `The active volcanoes constantly reacted with the ground and formed unique rocks, minerals and crystals.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //65
            `${this.duskmaw}`,
            `With these rare materials they managed to create beautiful jewelry, which was then sold to every other land.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //66
            `${this.duskmaw}`,
            `Their economy grew by a lot due to this strategy.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //67
            `${this.duskmaw}`,
            `However, one of the volcanoes one day erupted, and destroyed everything in there. Today it is nothing but dry rocks, lava, and constant volcano eruptions.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //68
            `${this.duskmaw}`,
            `Many believe it was karma for all those years of toxic pollution that eventually formed ${this.venomveilLake}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //69
            `${this.firedog}`,
            `What!? When did the eruption happen?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //70
            `${this.duskmaw}`,
            `Long before any of us were alive, my friend.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //71
            `${this.duskmaw}`,
            `There are many other much smaller lands and villages all around. But these 7 are the biggest ones.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //72
            `${this.firedog}`,
            `I see, I never knew about these lands!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //73
            `${this.firedog}`,
            `You mentioned that this place was haunted, but there was a specific spirit that... attacks?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //74
            `${this.duskmaw}`,
            `Haha! I wouldn't call it haunted during the day, only during the night!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //75
            `${this.duskmaw}`,
            `But rumors say that a young girl was playing with her doll outside near a park...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //76
            `${this.duskmaw}`,
            `When a sudden land conflict resulted in brutal missiles being landed on the land...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //77
            `${this.duskmaw}`,
            `Unfortunately, she was near the explosion impact, and sadly, she did not survive... People found her, still holding her doll, Dolly, in her last moments.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //78
            `${this.duskmaw}`,
            `Villagers were heartbroken, and soon enough they began hearing voices and footsteps during the night. The first occurrence of spirits in this land.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //79
            `${this.duskmaw}`,
            `It is believed that the doll is still protecting the little girl to this day, wandering around the cemetery.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //80
            `${this.firedog}`,
            `Wow.. That's horrible what happened...`,
            this.addImage(this.setfiredogCry(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //81
            `${this.firedog}`,
            `(${this.duskmaw} seems to know so much about the history of every land!)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //82
            `${this.firedog}`,
            `(Maybe I should ask about the ${this.crypticToken}, I wonder what he knows about it!)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //83
            `${this.firedog}`,
            `${this.duskmaw}, have you ever heard about a ${this.crypticToken} before?`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //84
            `${this.duskmaw}`,
            `The ${this.crypticToken}? I indeed have. But it is nothing but a fiction.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //85
            `${this.duskmaw}`,
            `Centuries ago, when all lands were at war, legends say that this token fell from the sky, containing unlimited power.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //86
            `${this.duskmaw}`,
            `But that's all I know about it. It is an old legend story. It's not real!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //87
            `${this.firedog}`,
            `(I see. It seems that people outside home don't know about the true story...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //88
            `${this.firedog}`,
            `(But if only ${this.lunarGlade} knows about the token, then who would know about it and steal it?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //89
            `${this.firedog}`,
            `Thanks for telling me these stories ${this.duskmaw}!`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //90
            `${this.firedog}`,
            `It's getting pretty late. I will go to sleep soon!`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //91
            `${this.duskmaw}`,
            `Me too my friend. Thanks for letting me tell you some stories.`,
            this.addImage(this.setfiredogTired(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //92
            `${this.duskmaw}`,
            `I'll talk to you in the morning if I see you! I'll go to my bed now, goodnight!`,
            this.addImage(this.setfiredogTired(), LEFT),
            this.addImage('duskmawNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //93
            `${this.firedog}`,
            `Goodnight ${this.duskmaw}!`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.addDialogue( //94
            `${this.firedog}`,
            `(I'm super tired. Well, I guess I should rest now. I need all my energy for tomorrow.)`,
            { whisper: true },
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
            this.addImage('duskmawNormal', RIGHT),
        );
        this.game.map2Unlocked = true;
        this.game.saveGameState();
    }
}
