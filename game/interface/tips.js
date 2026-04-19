export const TIP_PHRASE_COLORS = {
    // map names
    'Coral Abyss': 'dodgerblue',
    'Venomveil Lake': '#39ff14',
    'Icebound Cave': '#8fd7ff',
    'Cosmic Rift': '#ff41ff',

    // multi-word abilities
    'Rolling attack': 'orange',
    'Diving attack': 'orange',
    'Dive attacks': 'orange',
    'Dive attack': 'orange',
    'Double Jump': 'orange',
    'Move Forward': '#ffc574',

    // single-word abilities
    'Fireball': 'orange',
    'Invisibility': 'orange',
    'Roll': 'orange',
    'Rolling': 'orange',
    'Diving': 'orange',
    'Dash': 'orange',
    'Dive': 'orange',
    'Jump': '#ffc574',
    'Jumping': '#ffc574',
    'Sit': '#ffc574',
    'Sitting': '#ffc574',
    'Energy': 'DodgerBlue',
    'Exhausted': '#ff4d4d',

    // multi-word enemies
    'Mini Oozels': '#ff5555',
    'Volcano Wasps': '#ff5555',
    'Crystal Wasps': '#ff5555',
    'Karate Croco': '#ff5555',
    'Spear Fish': '#ff5555',
    'Angry Bees': '#ff5555',
    'Big Greener': '#ff5555',
    'Dusk Plant': '#ff5555',

    // single-word enemies
    "N'Tharax": '#ff5555',
    "Mode 2": '#ff5555',
    'Skulnaps': '#ff5555',
    'Wardrake': '#ff5555',
    'Sigilfly': '#ff5555',
    'Magmapod': '#ff5555',
    'Drillice': '#ff5555',
    'Voltzeel': '#ff5555',
    'Scorbles': '#ff5555',
    'Glacikal': '#ff5555',
    'Elyvorg': '#ff5555',
    'Skulnap': '#ff5555',
    'Crabula': '#ff5555',
    'Mycora': '#ff5555',
    'Oozels': '#ff5555',
    'Jerry': '#ff5555',
    'Dolly': '#ff5555',
    'Garry': '#ff5555',
    'Golex': '#ff5555',
    'Oozel': '#ff5555',
    'Bees': '#ff5555',
    'Sunflora': '#ff5555',

    // status types
    'poisonous': '#a8ffb0',
    'poisoned': '#a8ffb0',
    'poison': '#a8ffb0',
    'slow': '#c5d8ff',
    'slowed': '#c5d8ff',
    'Frozen': '#00e5ff',
    'Stun': 'yellow',
    'Red': 'red',
    'heal': '#4cd97a',
    'healing': '#4cd97a',

    // N'Tharax hazards
    'ground tentacles': '#9933ff',
    'spirit balls': '#d4aaff',

    // boss attacks / abilities
    'Gravitational Ball': '#d4aaff',
    'Healing Barrier': '#4cd97a',
    'Purple Fireball': '#cc66ff',
    'Electric Wheel': 'yellow',
    'Purple Slash': '#9933ff',

    // objects / hazards
    'icicles': '#7ab8d8',
    'raining': '#7ab8d8',
    'rain': '#7ab8d8',

    // collectibles
    'coins': 'orange',
    'Credit Coins': '#aeaeaf',
};

export const MAP_TIPS = {
    Map1: [
        "Defeat as many enemies as possible to collect as many \uE001Coins as you can.\nWhen you complete the map, they will be converted into \uE002Credit Coins.",
        "You may run out of Energy quickly.\nYou can always Sit down and wait for it to recharge.",
        "Dive Attack is a very useful ability because it does not consume Energy,\nbut while Diving, Energy regeneration is reduced.",
        "Skulnap is a Stun enemy that wakes up when you get close.\nUse your Fireball ability to take it down.",
    ],
    Map2: [
        "Enemies like Dusk Plant throw projectiles. Destroying projectiles also gives you \uE001Coins.",
        "Dolly is a dangerous enemy that throws Stun projectiles.\nUse your Invisibility or Dash abilities to avoid it, or run away from Dolly entirely.",
    ],
    Map3: [
        "Hold the Jump key to rise higher in the water.",
        "In Coral Abyss, you can cancel your Dive attack by Jumping.",
        "Spear Fish is a Red enemy. Use Fireball followed by Dive attack to quickly defeat it.",
        "Enemies like Voltzeel attack unexpectedly from above.\nIt may be safer to stay on the ground most of the time.",
        "Touching Garry will cover you in ink.\nUsing ranged attacks like Fireball is an effective counter.",
    ],
    Map4: [
        "Big Greener is a Poison enemy that throws 2 quick leaf projectiles.\nTry Sitting down and using Fireball to bypass the leaves and hit it directly.",
        "Karate Croco is a tough Red enemy to defeat.\nTry combining Fireball with a Dive attack to take him down.",
        "Jerry stays high in the air and throws Skulnaps to the ground.\nBut that might be his weakness.",
    ],
    Map5: [
        "When it starts raining, most enemies become more aggressive.\nSave your Invisibility and Dash abilities for when it begins to rain.",
        "Bees and Angry Bees are difficult to dodge.\nTry Jumping as they approach and use Fireball when they line up with you.\nTo juke them, Roll forward quickly, or Jump as they get close, Dive, then Move Forward.",
        "When it is raining, Sunflora throws many projectile beams upward.\nUse this opportunity to Dive attack and earn extra \uE001Coins.",
    ],
    Map6: [
        "When Exhausted, it's best to rely on Dive Attack to take enemies down.\nRemember that you cannot get poisoned while Exhausted.",
        "Venomveil Lake is filled with poisonous enemies.\nAvoid them when in trouble, but sometimes it may be worth getting poisoned for extra \uE001Coins.",
        "Mycora throws three poisonous projectiles.\nIt can be hard to get through without Invisibility or Dash, but not impossible.",
    ],
    Map7: [
        "Watch the ground. Scorbles are fast enemies that blend in easily.",
        "Magmapod is a Red enemy with Red projectiles.\nTry using one Fireball followed by two consecutive Dive attacks.\nThis defeats it and lets you collect extra \uE001Coins from its projectiles.",
        "Volcano Wasps are hard to dodge.\nJump as it approaches and use Fireball when it lines up with you.",
    ],
    BonusMap1: [
        "Icebound Cave has very slippery ground.\nYour movement will feel delayed, so get used to the momentum.",
        "Many enemies slow you down here.\nAvoid them when in trouble, but sometimes it may be worth getting slowed for extra \uE001Coins.",
        "Crystal Wasps are Frozen enemies that move slowly toward you.\nYou can avoid them, but to defeat them you need to Jump and use Fireball at the right moment.",
        "Drillice emerges from the ground.\nWatch the ground ahead for warning signs.",
    ],
    BonusMap2: [
        "Enemies like Sigilfly and Golex are Red enemies and appear often.\nUse Dive attack to defeat them and collect \uE001Coins.",
        "Oozel splits into two when defeated.\nMini Oozels can be easy to miss.",
        "Wardrake is extremely dangerous. If you see one, be ready to use Invisibility or Dash.\nIf those are not available, run.",
    ],
    BonusMap3: [
        "You can Double Jump while falling or during a Dive attack, but only once.\nYou must land on the ground before you can Double Jump again.",
        "Gravity behaves differently in Cosmic Rift.\nJumps are slower but go higher, and Dive attacks also take longer to reach the ground.",
        "Stay on the ground when possible.\nEnemies like Crabula attack unexpectedly from above.\nDefeat airborne enemies quickly and use Dive attack to reach the ground faster.",
    ],
    elyvorg: [
        "When Elyvorg's eyes turn grey, it is your chance to attack.",
        "When Elyvorg throws a Gravitational Ball up in the air, it pulls you toward him.\nDestroy it before it reaches the top where you cannot reach it.",
        "When Elyvorg teleports, he will appear behind you.\nIf that is not possible, he will appear in front of you instead.",
        "Purple particles from Elyvorg's body mean a Purple Slash attack is coming.\nHe uses it while running, so Jump over him to avoid it.",
        "Blue particles from Elyvorg's body mean an Electric Wheel attack is coming.\nKeep your distance to avoid unexpected damage.",
        "Elyvorg's Purple Fireball can damage you through your Rolling or Diving attack.\nDodge it or counter it with your own Fireball.",
        "Dive attacks are the most consistent way to deal damage to Elyvorg.",
    ],
    glacikal: [
        "When Glacikal's eyes turn grey, it is your chance to attack.",
        "While running, Glacikal spawns small icicles on the ground and if ignored, they can quickly fill the whole ground. You may need to clear them even if they slow you down.",
        "Dive attacks are the most consistent way of dealing damage without consuming Energy, but the slippery ground makes them harder to use.",
        "Glacikal can summon large icicles from below.\nTouching them through Rolling or Diving, will damage you, so stay sharp.",
    ],
    ntharax: [
        "Many attacks will damage you during Rolling or Diving, such as ground tentacles and spirit balls. Avoid them completely.",
        "If N'Tharax throws a small bouncing purple, or yellow orb,\ndestroy it quickly before it multiplies.",
        "N'Tharax can create a Healing Barrier that restores his health when damaged.\nAvoid attacking him while the barrier is active.",
        "If the ground fills with warning markers, Jump just before the Stun spikes appear.\nWhile in the air and falling, use your Double Jump just before you touch the Stun spikes.",
        "To deal a quick burst of damage, try Jumping toward N'Tharax and use Dive attack.\nOnce it hits him, Jump again while the Dive is still active and chain another Dive attack.",
        "N'Tharax drains life force from the ground to heal from time to time.\nKeep attacking consistently to outpace his healing.",
        "You may find some attacking chances when N'Tharax goes in the air to use his most powerful attack.",
        "At 50% health, N'Tharax enters Mode 2.\nMode 2 N'Tharax becomes faster and all of his abilities become more dangerous.",
    ],
};
