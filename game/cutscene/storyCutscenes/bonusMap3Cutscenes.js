import { StoryCutscene } from './storyCutsceneBase.js';

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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `It has to be the escaping energy ${this.orelian} was talking about.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `If I keep following it, it should lead me straight to the portal.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `The air feels even stranger here...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Like the whole space around me is bending...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Hm?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `I see someone up ahead...`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Wait... is that...?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //11
            `${this.threeDots}`,
            `So you made it here too, ${this.firedog}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionEyesClosed', RIGHT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `${this.zephyrion}!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `What are you doing all the way out here?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //14
            `${this.zephyrion}`,
            `Investigating the same disturbance you are.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //15
            `${this.zephyrion}`,
            `After you left, I felt a disturbance far from ${this.coralAbyss}. I decided to investigate it myself.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //16
            `${this.zephyrion}`,
            `Not long ago, I felt a violent rupture in the surrounding energies.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //17
            `${this.zephyrion}`,
            `It was unnatural. Ancient. The kind of disturbance no sorcerer should ignore.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `So you tracked it all the way here?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //19
            `${this.zephyrion}`,
            `Indeed.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.zephyrion}`,
            `I followed the energy trail from ${this.crimsonFissure}. The farther north it flowed, the more unstable the air became, until it led me here.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Wait... you can read those inscriptions too!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //22
            `${this.zephyrion}`,
            `Of course.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.zephyrion}`,
            `Sorcery is not merely spells and robes, ${this.firedog}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.zephyrion}`,
            `Ancient languages, dead civilizations, and forgotten seals... they all matter.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `I just thought you were a water-breathing spell guy...`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //26
            `${this.zephyrion}`,
            `I am choosing to ignore that description.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionEyesClosed', RIGHT, { talking: true }),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `Fair enough...`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `I also met someone who could read the inscriptions.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `${this.orelian}. He told me about an ancient celestial tyrant named ${this.ntharax}.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //30
            `${this.zephyrion}`,
            `Then our findings match.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //31
            `${this.zephyrion}`,
            `The inscriptions here speak of the same being, and they name his realm as ${this.cosmicRift}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.zephyrion}`,
            `${this.crimsonFissure} was not just a prison. It was the original gateway ${this.ntharax} used to enter our world long ago.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //33
            `${this.zephyrion}`,
            `After he was driven back, the ancients sealed that gateway so he could never force his way through it again.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //34
            `${this.zephyrion}`,
            `That is why ${this.crimsonFissure} matters so much. It was the wound through which he first entered.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `So ${this.orelian} was right...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `The seal is weakening...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //37
            `${this.zephyrion}`,
            `Yes, but the seal did more than weaken.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //38
            `${this.zephyrion}`,
            `Because the original gateway at ${this.crimsonFissure} remains sealed, the escaping power could not fully reopen it there.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //39
            `${this.zephyrion}`,
            `Instead, that energy fled north, searching for a weaker point in the world.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //40
            `${this.zephyrion}`,
            `That is why both of us were led here. We were following the energy that escaped from ${this.crimsonFissure}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `So this isn't the original gateway...?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //42
            `${this.zephyrion}`,
            `No.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //43
            `${this.zephyrion}`,
            `This is a new portal. A second opening.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //44
            `${this.zephyrion}`,
            `Since ${this.crimsonFissure} can no longer serve as his gateway, ${this.ntharax} is trying to force his way back into our world through here instead.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
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
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `What... is that!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //47
            `${this.zephyrion}`,
            `The portal.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //48
            `${this.zephyrion}`,
            `It has already opened far enough for his realm to begin touching ours.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `So if we destroy it from here, that's it, right?`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //50
            `${this.zephyrion}`,
            `No. That is the problem.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //51
            `${this.zephyrion}`,
            `The inscriptions describe this portal as an anchored gate to ${this.cosmicRift}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //52
            `${this.zephyrion}`,
            `It is being forced open from the other side.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //53
            `${this.zephyrion}`,
            `As long as ${this.ntharax} can keep pressing his power against it, the portal will keep forcing itself back open.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //54
            `${this.firedog}`,
            `So even if we try to shut it from here... it won't matter?`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //55
            `${this.zephyrion}`,
            `Exactly.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //56
            `${this.zephyrion}`,
            `And there is more. ${this.ntharax} is not a being that dies as ordinary creatures do.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //57
            `${this.firedog}`,
            `What do you mean...?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //58
            `${this.zephyrion}`,
            `If his form is destroyed, his essence does not perish. It scatters, sleeps, and slowly gathers itself again.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //59
            `${this.zephyrion}`,
            `That rebirth does not happen quickly. It takes millennia for a being like him to become whole again.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //60
            `${this.firedog}`,
            `So even if I defeat him... that still won't truly be the end?`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //61
            `${this.zephyrion}`,
            `No. But it would still save our world, and buy us enough time to come up with a stronger seal to ensure he never breaks through our world.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionEyesClosed', RIGHT, { talking: true }),
        );
        this.addDialogue( //62
            `${this.zephyrion}`,
            `To cast him down now would deny him his return and buy the world ages of peace.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionEyesClosed', RIGHT, { talking: true }),
        );
        this.addDialogue( //63
            `${this.firedog}`,
            `So that's why we have to go inside...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //64
            `${this.zephyrion}`,
            `Yes.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionEyesClosed', RIGHT, { talking: true }),
        );
        this.addDialogue( //65
            `${this.zephyrion}`,
            `If ${this.ntharax} manages to force himself fully back into our world, stopping him here may already be too late.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //66
            `${this.zephyrion}`,
            `However, the portal has a weakness. It is unstable, narrow, and incomplete.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //67
            `${this.zephyrion}`,
            `Beings like us may pass through it while it flickers, but it is not yet strong enough to bear ${this.ntharax}'s full form into our world.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //68
            `${this.zephyrion}`,
            `If you go now, before the portal stabilizes any further, you may be able to strike first and stop him before he can break through.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //69
            `${this.firedog}`,
            `Me? What about you?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //70
            `${this.zephyrion}`,
            `I must remain here.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //71
            `${this.zephyrion}`,
            `If I let the portal gather all the energy without interference, ${this.ntharax} may be able to enter our world before you find him.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //72
            `${this.zephyrion}`,
            `What I can do here is disrupt the energy, which will keep the portal unstable for a little longer.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //73
            `${this.zephyrion}`,
            `But every second counts... I will only be delaying the inevitable. That is why you have to enter alone.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //74
            `${this.firedog}`,
            `So I have to go in alone and defeat this celestial tyrant by myself?`,
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //75
            `${this.zephyrion}`,
            `Yes.`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('zephyrionHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //76
            `${this.firedog}`,
            `Oh... great... what have I gotten myself into...?`,
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //77
            `${this.zephyrion}`,
            `There is no time to dwell on it, ${this.firedog}. This is the best plan I could come up with in the short time we have.`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //78
            `${this.firedog}`,
            `...Yeah.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //79
            `${this.firedog}`,
            `If going inside is the only way to stop this thing, then that's what I'll do.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //80
            `${this.zephyrion}`,
            `Good.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //81
            `${this.zephyrion}`,
            `One last warning, ${this.firedog}.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //82
            `${this.zephyrion}`,
            `A realm shaped by a being like ${this.ntharax} will not obey the rules of our world.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //83
            `${this.zephyrion}`,
            `Do not expect gravity to work the same way as it does in our world.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //84
            `${this.zephyrion}`,
            `You will need every bit of help possible. Let me cast a double jump spell on you.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //85
            `${this.firedog}`,
            `Double jump?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //86
            `${this.zephyrion}`,
            `Yes. You will be able to jump twice while in the air. It may come in handy.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //87
            `${this.zephyrion}`,
            `Now, let me focus while I cast the spell.`,
            {
                onAdvance: () => this.playSFX('sorcererDoubleJumpSpellSound'),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionCastingSpell', RIGHT, { talking: true }),
        );
        this.addDialogue( //88
            `${this.zephyrion}`,
            `Duplicatus Saltus: Aerial Echo!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionCastingSpell', RIGHT, { talking: true }),
        );
        this.addDialogue( //89
            `${this.zephyrion}`,
            `The spell has been cast.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //90
            `${this.firedog}`,
            `Alright, thank you, ${this.zephyrion}. Got it.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //91
            `${this.firedog}`,
            `Alright then... no more wasting time.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //92
            `${this.firedog}`,
            `I'll go inside, stop this celestial tyrant, and hopefully make it back to our world.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //93
            `${this.zephyrion}`,
            `I will keep the portal from fully stabilizing for as long as I can with my dark spells.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionStrugglingSpell', RIGHT, { talking: true }),
        );
        this.addDialogue( //94
            `${this.zephyrion}`,
            `Now go, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionStrugglingSpell', RIGHT, { talking: true }),
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
                    onBlack: () => {
                        this.game.startShake(0);
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('zephyrionStrugglingSpell', RIGHT),
        );
        this.addDialogue( //96
            `${this.firedog}`,
            `Wah!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 7000, fadeOut: 500,
                    imageId: 'blackBackground',
                    beforeFade: () => {
                        this.playSFX('touchingPortalSound', false, true);
                        this.fadeOutSFX('insidePortalSound');

                        setTimeout(() => {
                            this.playSFX('fallingOutOfPortalSound');
                        }, 3000);
                    },
                    onBlack: () => {
                        this.game.stopShake();
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //97
            `${this.questionMark}`,
            `...`,
            {
                onAdvance: () => this.game.audioHandler.cutsceneSFX.playSound('ntharaxGrowl'),
            },
        );
        this.addDialogue( //98
            `${this.questionMark}`,
            `RRRRRRRRRGHHH...`,
        );
        this.addDialogue( //99
            `${this.questionMark}`,
            `I FEEL A PRESENCE... A PRESENCE I HAVEN'T FELT IN AGES...`,
        );
        this.addDialogue( //100
            `${this.questionMark}`,
            `A TRESPASSER... IN MY REALM.`,
        );
        this.addDialogue( //101
            `${this.questionMark}`,
            `YOU DO NOT BELONG HERE.`,
        );
        this.addDialogue( //102
            `${this.questionMark}`,
            `YOU WILL CEASE TO EXIST.`,
            {
                onAdvance: () => {
                    this.fadeOutSFX('ntharaxGrowl');
                    this.transitionWithBg({
                        fadeIn: 500, blackDuration: 3000, fadeOut: 500,
                        imageId: 'bonusMap3AnchoredPortal',
                    });
                },
            },
        );
        this.addDialogue( //103
            `${this.firedog}`,
            `Ouch... That was quite the fall...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //104
            `${this.firedog}`,
            `Where am I?`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //105
            `${this.firedog}`,
            `Right... I jumped through the portal. It appears I'm in ${this.cosmicRift}.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //106
            `${this.firedog}`,
            `Alright, time to find ${this.ntharax} and stop him. Let's go!`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `So that was ${this.ntharax}...`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I actually made it through ${this.cosmicRift}... and I actually defeated him...`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `But even after all that... this place still feels wrong...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Wait... ${this.zephyrion} is still outside trying to contain the portal!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `And if ${this.ntharax} is gone, then the portal could start closing any second now!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Shoot! I need to get back there right now!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `If that portal shuts before I make it through... I'm stuck here forever...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `There it is! The portal!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //10
            `${this.zephyrion}`,
            `${this.firedog}! Quickly! I can't contain the portal for much longer!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionStrugglingSpell', RIGHT, { talking: true }),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `What!? I can hear ${this.zephyrion} from the other side.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
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
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `Am I... am I back in our world?`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //15
            `${this.zephyrion}`,
            `You are, ${this.firedog}. You made it.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('zephyrionExhausted', RIGHT, { talking: true }),
        );
        this.addDialogue( //16
            `${this.zephyrion}`,
            `The portal began weakening not long ago...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExhausted', RIGHT, { talking: true }),
        );
        this.addDialogue( //17
            `${this.zephyrion}`,
            `It started to collapse. I had to do everything in my power to ensure it remained open until you came back.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExhausted', RIGHT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.zephyrion}`,
            `You made it just in time... any longer and I don't think I could have kept the portal open.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionExhausted', RIGHT, { talking: true }),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Wow, ${this.zephyrion}... you saved my life...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('zephyrionExhausted', RIGHT),
        );
        this.addDialogue( //20
            `${this.zephyrion}`,
            `And you saved the world. I assume you defeated ${this.ntharax}, given how unstable the portal became at a certain point.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.zephyrion}`,
            `Tell me. What did you find in ${this.cosmicRift}?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `It was exactly as bad as you warned me.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `The whole realm felt twisted... like it had been shaped entirely by ${this.ntharax}'s presence.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `And he really was there, plotting for his return.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `We fought... He was the most formidable opponent I have ever fought. I couldn't believe anyone could be that strong.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `But I somehow managed to bring him down before he could fully break through into our world.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //27
            `${this.zephyrion}`,
            `You have done more than win a battle.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.zephyrion}`,
            `You have prevented a catastrophe.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `It still didn't feel like the end of him...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `More like I had forced something ancient back into the dark.`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //31
            `${this.zephyrion}`,
            `That is because beings like ${this.ntharax} are not so easily erased.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.zephyrion}`,
            `But what you did here matters greatly.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `...Right.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `What happens now?`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //35
            `${this.zephyrion}`,
            `Everything should go back to normal. The tremors should stop. The cracks should stop spreading. And peace will be restored. All thanks to you, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `Let's call it a team effort! Without you, I would never have made it.`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `Oh right, I should probably get back and let ${this.orialis} and ${this.orelian} know what happened!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `I will be going now, ${this.zephyrion}! Maybe I'll see you around again somewhere!`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //39
            `${this.zephyrion}`,
            `Farewell, ${this.firedog}. I'm sure this won't be the last time we see each other!`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('zephyrionHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `I have a feeling you're right!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('zephyrionHappy', RIGHT),
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
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //42
            `${this.orialis}`,
            `That's... ${this.orelian}! I can't believe it, you're alive!`,
            this.addImage('orialisTear', LEFT, { talking: true }),
        );
        this.addDialogue( //43
            `${this.orelian}`,
            `I am. I got lucky... I'm happy to see you again, ${this.orialis}!`,
            this.addImage('orialisTear', LEFT),
            this.addImage('orelianHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //44
            `${this.orialis}`,
            `Thank you so much for saving my brother, ${this.firedog}! You have my thanks!`,
            this.addImage('orialisHappy', LEFT, { talking: true }),
            this.addImage('orelianHappy', RIGHT),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `No worries! Although, thanks to ${this.orelian}, I managed to find the source of the problems that have been happening around ${this.crimsonFissure}!`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
            this.addImage('orialisHappy', RIGHT),
        );
        this.addDialogue( //46
            `${this.orialis}`,
            `Oh... how so? What happened?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `Let me tell you both everything that has happened.`,
            {
                onAdvance: () => {
                    this.cutsceneBackgroundChange(500, 2000, 500);
                },
            },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('orialisSurprised', RIGHT),
        );
        this.addDialogue( //48
            `${this.orelian}`,
            `Unbelievable. So ${this.ntharax}, the celestial tyrant, does indeed exist? And not only that, you defeated him?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `Yep. The only way to beat him was to enter his realm, ${this.cosmicRift}.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //50
            `${this.orialis}`,
            `So the tremors will stop?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `Indeed they will! Everything is going back to normal!`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('orialisSurprised', RIGHT),
        );
        this.addDialogue( //52
            `${this.orialis}`,
            `Then my brother was right all along... the ruins really were warning of something far worse beneath the fissure...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //53
            `${this.orialis}`,
            `And you put a stop to it...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //54
            `${this.orelian}`,
            `You have my deepest thanks, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //55
            `${this.orelian}`,
            `Without you, none of us would be standing here now.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //56
            `${this.firedog}`,
            `At least everyone is safe now. That's what matters.`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('orelianHappy', RIGHT),
        );
        this.addDialogue( //57
            `${this.orialis}`,
            `We will never forget what you did for us.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //58
            `${this.firedog}`,
            `(Good... that's taken care of.)`,
            { whisper: true },
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('orialisHappy', RIGHT),
        );
        this.addDialogue( //59
            `${this.firedog}`,
            `(I should go back now. What a ride this has been!)`,
            { whisper: true },
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('orialisHappy', RIGHT),
        );
        this.addDialogue( //60
            `${this.firedog}`,
            `Alright... I should get moving again.`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
            this.addImage('orialisHappy', RIGHT),
        );
        this.addDialogue( //61
            `${this.orialis}`,
            `Then please, travel safely, ${this.firedog}.`,
            this.addImage('orialisHappy', RIGHT, { talking: true }),
            this.addImage(this.setfiredogSmile(), LEFT),
        );
        this.addDialogue( //62
            `${this.orialis}`,
            `And thank you once again... for saving my brother, and the world.`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('orialisHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //63
            `${this.orelian}`,
            `Thank you, ${this.firedog}. We will be forever grateful for your bravery.`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('orelianHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //64
            `${this.firedog}`,
            `Of course.`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
            this.addImage('orelianHappy', RIGHT),
        );
        this.addDialogue( //65
            `${this.firedog}`,
            `(What a journey this has been!)`,
            { whisper: true },
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
            this.addImage('orelianHappy', RIGHT),
        );
        this.addDialogue( //66
            `${this.firedog}`,
            `Let's go back now!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('orelianHappy', RIGHT),
        );

        this.game.ntharaxDefeated = true;
        this.game.saveGameState();
    }
}
