import { StoryCutscene } from './storyCutsceneBase.js';

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
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `(Oh, I just remembered...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `(I should ask ${this.galadon} about the dreams I've been having before I go.)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `(Maybe he can help me understand what is going on with me.)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `${this.galadon}, before I go, I have a question.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Ever since I left ${this.lunarGlade}, I have been having these dreams... not just dreams, but visions... where I can feel my head burning...`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `And as soon as I close my eyes and open them again, I wake up in this dark room I've never seen before.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `And I start hearing this voice coming from the door in this room...`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `This is harder to explain than I thought... but have you also been having these dreams or is it just me?`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //10
            `${this.galadon}`,
            `That's definitely weird. I haven't had any dreams or visions since leaving ${this.lunarGlade}.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `(Hm.. I had a feeling it was just me... but why me?)`,
            { whisper: true },
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I see... do you know what could be causing them?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //13
            `${this.galadon}`,
            `I don't think so... I've never heard about this from anyone. I'm sorry I'm not of much help right now.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `It's okay, I figured it was worth asking you either way.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `Regardless of these weird dreams, the main goal is to get to the ${this.temporalTimber} as soon as possible.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //16
            `${this.galadon}`,
            `You're right. It seems we are the only ones ahead, but right now, due to my injuries, the only one who can stop the thief is you, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //17
            `${this.galadon}`,
            `I'm surprised by how far you've come, considering this is your first time outside ${this.lunarGlade}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `I'm surprised myself, haha! Despite being outside under these circumstances, it's still been a fun adventure.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //19
            `${this.galadon}`,
            `That's right, but we can't let ${this.lunarGlade} down.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.galadon}`,
            `${this.valdorin} sees the potential in you.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.galadon}`,
            `Maybe that's why he chose you for this mission.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
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
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `(Ugh... what...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `(What is this feeling?)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `(Something feels wrong... Not the same as before... But still that same dizziness...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `(Aaaarghh!)`,
            {
                whisper: true,
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 1000,
                    imageId: 'map5InsideGlassChamber',
                    onBlackDelayMs: 1000,
                    onBlack: () => {
                        this.isCharacterSepia = true;
                        this.isBackgroundSepia = true;
                        this.fadeOutMusic('blizzardWindFireplace');
                        setTimeout(() => {
                            this.playSFX('flashbackStart', false, true);
                        }, 200);
                        setTimeout(() => {
                            this.playMusic('insideGlassChamberBubbleSound', true);
                        }, 1600);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //27
            `${this.questionMark}`,
            `Don't move. You will make things more difficult, ${this.firedog}.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('nyseraNormalBlur', RIGHT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Why are you doing this to me... I can't see well...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
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
            this.addImage('nyseraNormalBlur', RIGHT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `(What is this? Where am I?)`,
            { whisper: true },
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT, { talking: true }),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `(This feels different...)`,
            { whisper: true },
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT, { talking: true }),
        );

        this.addDialogue( //32
            `${this.firedog}`,
            `(This doesn't feel like the dreams I've been having... it feels like a... memory?)`,
            { whisper: true },
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT, { talking: true }),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `(My vision is unblurring...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //35
            `${this.questionMark}`,
            `Just stop resisting so much-`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('nyseraNormalBlur', RIGHT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.nysera}`,
            `-after all, you have what it takes, unlike the other failures who didn't make it.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('nyseraNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //37
            `${this.nysera}`,
            `Now don't try to move while I inject this liquid inside the glass chamber.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('nyseraNormal', RIGHT, { talking: true }),
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
                        this.playMusic('blizzardWindFireplace', true);
                        this.fadeOutMusic('insideGlassChamberBubbleSound');
                        this.isCharacterSepia = false;
                        this.isBackgroundSepia = false;
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('nyseraNormal', RIGHT),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `Aaaaargh!`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //40
            `${this.galadon}`,
            `Huh!? ${this.firedog}, are you okay?`,
            {
                onAdvance: () => this.playMusic('iSawSomethingAgain', true),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `(What the hell was that... Was that ${this.nysera}? Why was I inside some sort of glass chamber?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `(That felt like a memory... Is my mind playing tricks on me, or is this all real?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //43
            `${this.firedog}`,
            `I think I just had a flashback... of a memory I never knew I had.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
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
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `I think it triggered a memory in my brain... A memory I never recalled having...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `In that memory, ${this.nysera} said the exact same phrase... About ${this.valdorin} seeing the potential in me...`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //48
            `${this.galadon}`,
            `Huh? What does that mean...?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `It's best if I explain what's been happening in my dreams... what the voice has been telling me.. and the strange memory I just had.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
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
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //51
            `${this.galadon}`,
            `Wow... I have no words for this. Did ${this.valdorin} really do all of this?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //52
            `${this.firedog}`,
            `I refuse to believe it, trust me... But I don't know... I just don't know what is real and what is not.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //53
            `${this.galadon}`,
            `Being used as an experiment...? But for what exactly? I mean, there was never a word about this in ${this.lunarGlade}...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //54
            `${this.galadon}`,
            `How would the ${this.crypticToken} be used for these experiments as well? What would ${this.valdorin} gain from it?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //55
            `${this.galadon}`,
            `But what if this is all real? What would we do?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //56
            `${this.galadon}`,
            `It's hard to believe, but... but... I see no reason why you would lie about this, ${this.firedog}... I trust you.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //57
            `${this.firedog}`,
            `I was scared that you would think I was crazy or something. It's a relief that you trust me ${this.galadon}.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //58
            `${this.firedog}`,
            `I just hope that it's just my mind playing tricks on me.`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //59
            `${this.galadon}`,
            `Yeah.. but isn't it weird how the dreams you've been having and the flashback you just had are kind of... related?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //60
            `${this.galadon}`,
            `But more interestingly, how your flashback was triggered by a phrase I said... the same phrase you saw in your memory?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //61
            `${this.firedog}`,
            `Yeah.. I have no explanation for why this is happening to me... I am left with more questions than answers...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //62
            `${this.firedog}`,
            `I wonder what happened next in my flashback... What happened to me?`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //63
            `${this.firedog}`,
            `Why was ${this.nysera} there...? What did she mean by the other failures who didn't make it?`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //64
            `${this.galadon}`,
            `When we come back from our mission, hopefully we can have our questions answered.`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //65
            `${this.galadon}`,
            `But right now we need to focus on the main mission, which is to get to the ${this.temporalTimber} before the thief does.`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //66
            `${this.firedog}`,
            `You're right. It doesn't seem we have much time left, and every second counts.`,
            {
                onAdvance: () => this.fadeOutMusic('iSawSomethingAgain'),
            },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //67
            `${this.galadon}`,
            `We will get the answer to those questions, I'm sure of it, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //68
            `${this.galadon}`,
            `But as you said, every second counts. You should go now ${this.firedog}, and make sure to bring the thief down for me!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //69
            `${this.firedog}`,
            `I sure will for what they did to you, ${this.galadon}!`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //70
            `${this.firedog}`,
            `I will get going then. Thank you for trusting in me, I really appreciate it!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //71
            `${this.galadon}`,
            `Of course ${this.firedog}! But before you go, please be careful.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //72
            `${this.galadon}`,
            `${this.springlyLemony} is known for its tropical bipolar weather.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //73
            `${this.firedog}`,
            `I should be fine, a little bit of rain isn't going to hurt me!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //74
            `${this.galadon}`,
            `You might be right about that, the rain won't hurt you, but the enemies you find along the way may get angrier once it starts raining.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //75
            `${this.galadon}`,
            `Just be cautious when it starts raining...`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //76
            `${this.firedog}`,
            `Got it!`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //77
            `${this.firedog}`,
            `Alright, I should get moving.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //78
            `${this.firedog}`,
            `Catch up to me when you feel better, ${this.galadon}.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('galadonHurt', RIGHT),
        );
        this.addDialogue( //79
            `${this.galadon}`,
            `Sounds good. Good luck out there, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('galadonHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //80
            `${this.firedog}`,
            `Alright, let's go!`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Thankfully I managed to get to the cabin just in time, otherwise I might've been in trouble.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `According to what ${this.penguini} said, the next obstacle will be ${this.venomveilLake}-`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.threeDots}`,
            `230... 231... 232... 233...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleCountingRocks', RIGHT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Huh? Who's counting? Who's there?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //5
            `${this.threeDots}`,
            `Hey! You're ruining my rock counting!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('craggleUpset', RIGHT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.threeDots}`,
            `I'm ${this.craggle}. I'm a local here. And you are?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('craggleNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Oh, hello ${this.craggle}. I'm ${this.firedog}... What do you mean by rock counting...?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //8
            `${this.craggle}`,
            `I'm a rock collector. I like exploring nearby lands and collecting rocks from those places.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('craggleHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.craggle}`,
            `I was counting how many rocks I've got so far... well, until you interrupted me!`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('craggleUpset', RIGHT, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Oh... sorry for interrupting you...`,
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('craggleUpset', RIGHT),
        );
        this.addDialogue( //11
            `${this.craggle}`,
            `I guess it's fine!`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('craggleHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `A rock collector? I didn't even know that was a thing!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('craggleHappy', RIGHT),
        );
        this.addDialogue( //13
            `${this.craggle}`,
            `It sure is! But anyway, what brings you here?`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('craggleHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `I'm just an explorer, although probably not as cool as being a rock collector, haha!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //15
            `${this.craggle}`,
            `Hm... that sounded sarcastic...`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('craggleUpset', RIGHT, { talking: true }),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Sorry, sorry!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('craggleUpset', RIGHT),
        );
        this.addDialogue( //17
            `${this.craggle}`,
            `Not many understand how cool rocks are.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('craggleNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `I guess so, haha!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //19
            `${this.craggle}`,
            `Well, if you're just exploring, you picked a strange place to stop by.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `How so?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('craggleSurprised', RIGHT),
        );
        this.addDialogue( //21
            `${this.craggle}`,
            `Not many travelers make it this far. Most of them turn back long before they get here.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.craggle}`,
            `The farther you go from here, the less friendly the lands become.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Yeah... I've kinda noticed that already.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('craggleSurprised', RIGHT),
        );
        this.addDialogue( //24
            `${this.craggle}`,
            `Still, this cabin is useful.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //25
            `${this.craggle}`,
            `Travelers leave all sorts of things behind sometimes. ${this.coinIcon}${this.coinsLabel}, tools... and occasionally rocks.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `So that's why you like staying here?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('craggleHappy', RIGHT),
        );
        this.addDialogue( //27
            `${this.craggle}`,
            `Exactly! It's like the world delivers little treasures to me.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('craggleHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Haha, I never thought rocks could be called treasures.`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('craggleHappy', RIGHT),
        );
        this.addDialogue( //29
            `${this.craggle}`,
            `That's because you don't understand rocks yet.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('craggleNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.craggle}`,
            `Every rock tells a story. Where it came from, how old it is, what kind of land shaped it...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Huh... I never looked at it that way before.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //32
            `${this.craggle}`,
            `Most don't.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('craggleNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //33
            `${this.craggle}`,
            `But if you spend enough time with rocks, they start making sense.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `I don't know if I'm ready for that level of wisdom yet, ${this.craggle}.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('craggleNormal', RIGHT),
        );
        this.addDialogue( //35
            `${this.craggle}`,
            `Haha! Fair enough.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('craggleHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `Anyway... I think I'll rest here for a little while longer before I head out again.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('craggleHappy', RIGHT),
        );
        this.addDialogue( //37
            `${this.craggle}`,
            `Good idea. You look like you've had a long journey.`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('craggleHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `You could say that.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('craggleHappy', RIGHT),
        );

        this.game.map6Unlocked = true;
        this.game.saveGameState();
    }
}
