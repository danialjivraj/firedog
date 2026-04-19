import { Background } from './background.js';
import { MovingLayer } from './layers.js';
import { Firefly } from './effects/firefly.js';
import { SmallFish, BigFish } from './effects/fish.js';
import { Map3Zabby1FlyBy, BonusMap3Zabby6FlyBy } from './effects/zabbyFlyBy.js';
import { RaindropAnimation, SnowflakeAnimation } from './effects/weather.js';
import { BubbleAnimation } from './effects/bubbles.js';
import { StarField, ShootingStar } from './effects/stars.js';
import { DragonSilhouette } from './effects/dragonSilhouette.js';
import { MeteorBackground } from './effects/meteorBackground.js';

export class Map1 extends Background {
    constructor(game) {
        const fireflyLayer = new Firefly(game, 5);
        const fireflyLayer2 = new Firefly(game, 5);
        const fireflyLayer3 = new Firefly(game, 5);
        const fireflyLayer4 = new Firefly(game, 5);
        const fireflyLayer5 = new Firefly(game, 5);

        super(
            game,
            { imageId: 'map1Background', bgSpeed: 0 },
            { imageId: 'map1Trees7', bgSpeed: 0.1 },
            fireflyLayer,
            { imageId: 'map1Trees1', bgSpeed: 0.2 },
            { imageId: 'map1Trees2', bgSpeed: 0.3 },
            fireflyLayer2,
            { imageId: 'map1Trees5', zabbyId: 'map1Zabby2', bgSpeed: 0.35 },
            fireflyLayer3,
            { imageId: 'map1Trees3', bgSpeed: 0.4 },
            { imageId: 'map1Trees4', zabbyId: 'map1Zabby3', bgSpeed: 0.5 },
            fireflyLayer4,
            { imageId: 'map1Rocks', zabbyId: 'map1Zabby1', bgSpeed: 0.6 },
            { imageId: 'map1Bush', bgSpeed: 0.65 },
            { imageId: 'map1Trees6', bgSpeed: 0.7 },
            fireflyLayer5,
            { imageId: 'map1Ground', bgSpeed: 1 },
        );

        this.soundId = 'map1Soundtrack';
    }
}

export class Map2 extends Background {
    constructor(game) {
        const whiteMist = new MovingLayer(game, 0, 'map2WhiteMist', 1, 'left', 'x');
        const fireflyLayer = new Firefly(game, 4);
        const fireflyLayer2 = new Firefly(game, 3);
        const fireflyLayer3 = new Firefly(game, 3);
        const fireflyLayer4 = new Firefly(game, 3);

        const starField = new StarField(game, {
            top: 0,
            height: game.height * 0.50,
            density: 0.20,
            color: "white",
            sizeScale: 0.5
        });

        super(
            game,
            { imageId: 'map2Background', bgSpeed: 0 },
            starField,
            { imageId: 'map2BackgroundLayer1', bgSpeed: 0 },
            fireflyLayer,
            { imageId: ['map2Bushes3', 'map2Bushes4'], bgSpeed: 0.3 },
            { imageId: ['map2Fence1', 'map2Fence2'], zabbyId: 'map2Zabby4', bgSpeed: 0.4 },
            fireflyLayer2,
            { imageId: ['map2Bushes1', 'map2Bushes2'], bgSpeed: 0.45 },
            { imageId: ['map2Trees1', 'map2Trees2', 'map2Trees3'], zabbyId: 'map2Zabby5', bgSpeed: 0.5 },
            fireflyLayer3,
            { imageId: ['map2Bones1', 'map2Bones2', 'map2Bones3'], zabbyId: 'map2Zabby2', bgSpeed: 0.7 },
            { imageId: ['map2Tombstone1', 'map2Tombstone2', 'map2Tombstone3'], zabbyId: ['map2Zabby1', 'map2Zabby3'], bgSpeed: 0.8 },
            whiteMist,
            fireflyLayer4,
            { imageId: 'map2Ground', bgSpeed: 1 },
        );

        this.soundId = 'map2Soundtrack';
    }
}

export class Map3 extends Background {
    constructor(game) {
        const smallFish = new SmallFish(game, 4);
        const bigFish = new BigFish(game, 1);
        const smallFish2 = new SmallFish(game, 4);
        const smallFish3 = new SmallFish(game, 3);
        const smallFish4 = new SmallFish(game, 3);
        const smallFish5 = new SmallFish(game, 3);

        const zabby1FlyBy = new Map3Zabby1FlyBy(game);
        zabby1FlyBy.setOneShotImageIds(['map3Zabby1']);

        super(
            game,
            { imageId: 'map3Background', bgSpeed: 0 },
            bigFish,
            smallFish,
            smallFish2,
            { imageId: 'map3BackgroundRocks', bgSpeed: 0 },
            smallFish3,
            { imageId: ['map3seaPlants3', 'map3seaPlants8', 'map3seaPlants9'], zabbyId: ['map3Zabby2', 'map3Zabby5'], bgSpeed: 0.15 },
            smallFish4,
            zabby1FlyBy,
            { imageId: 'map3seaPlants1', zabbyId: ['map3Zabby3', 'map3Zabby4'], bgSpeed: 0.2 },
            { imageId: 'map3seaPlants2', bgSpeed: 0.3 },
            { imageId: 'map3seaPlants4', bgSpeed: 0.4 },
            { imageId: 'map3seaPlants6', bgSpeed: 0.45 },
            { imageId: 'map3seaPlants5', bgSpeed: 0.5 },
            smallFish5,
            { imageId: ['map3seaPlants7'], bgSpeed: 0.54 },
            { imageId: 'map3Ground', bgSpeed: 1 },
        );

        this.soundId = 'map3Soundtrack';
    }
}

export class Map4 extends Background {
    constructor(game) {
        const fireflyLayer = new Firefly(game, 6);
        const fireflyLayer2 = new Firefly(game, 6);
        const fireflyLayer3 = new Firefly(game, 6);

        super(
            game,
            { imageId: 'map4Background', bgSpeed: 0 },
            fireflyLayer,
            { imageId: ['map4BigVines1', 'map4BigVines2'], zabbyId: 'map4Zabby6', bgSpeed: 0.2 },
            { imageId: 'map4BottomVines', zabbyId: 'map4Zabby3', bgSpeed: 0.3 },
            { imageId: ['map4Trees1', 'map4Trees2'], bgSpeed: 0.4 },
            fireflyLayer2,
            { imageId: 'map4Trees3', zabbyId: 'map4Zabby1', bgSpeed: 0.5 },
            { imageId: 'map4Trees4', bgSpeed: 0.6 },
            fireflyLayer3,
            { imageId: ['map4TopVines1', 'map4TopVines2'], zabbyId: ['map4Zabby2', 'map4Zabby4', 'map4Zabby5'], bgSpeed: 0.92 },
            { imageId: 'map4Ground', bgSpeed: 1 },
        );

        this.soundId = 'map4Soundtrack';
    }
}

export class Map5 extends Background {
    constructor(game) {
        const fireflyLayer = new Firefly(game, 5);
        const fireflyLayer2 = new Firefly(game, 5);
        const fireflyLayer3 = new Firefly(game, 5);
        const fireflyLayer4 = new Firefly(game, 5);
        const fireflyLayer5 = new Firefly(game, 5);
        const fireflyLayer6 = new Firefly(game, 5);

        const raindropBack = new RaindropAnimation(game, 100, 'back');
        const raindropMid = new RaindropAnimation(game, 20, 'mid');
        const raindropFront = new RaindropAnimation(game, 20, 'front');

        super(
            game,
            { imageId: 'map5Background', bgSpeed: 0 },
            fireflyLayer,
            raindropBack,
            { imageId: 'map5TallGrass', bgSpeed: 0.1 },
            fireflyLayer2,
            { imageId: ['map5BigSunflowers1', 'map5BigSunflowers2'], zabbyId: 'map5Zabby1', bgSpeed: 0.15 },
            { imageId: ['map5Bush1', 'map5Bush2'], bgSpeed: 0.3 },
            fireflyLayer3,
            raindropMid,
            { imageId: ['map5Trees1', 'map5Trees2'], bgSpeed: 0.4 },
            fireflyLayer4,
            { imageId: ['map5Trees3', 'map5Trees4'], zabbyId: 'map5Zabby2', bgSpeed: 0.5 },
            fireflyLayer5,
            { imageId: 'map5Cattails', zabbyId: ['map5Zabby3', 'map5Zabby4'], bgSpeed: 0.8 },
            fireflyLayer6,
            { imageId: ['map5Flowers1', 'map5Flowers2'], bgSpeed: 0.87 },
            { imageId: 'map5Ground', bgSpeed: 1 },
            raindropFront,
        );

        this.soundId = 'map5Soundtrack';
        this.isRaining = false;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const raindropLayers = this.backgroundLayers.filter(layer => layer instanceof RaindropAnimation);

        const shouldRain = (
            (this.totalDistanceTraveled > 30 && this.totalDistanceTraveled <= 60) ||
            (this.totalDistanceTraveled > 120 && this.totalDistanceTraveled <= 160) ||
            (this.totalDistanceTraveled > 220)
        ) && !this.game.cabin.isFullyVisible;

        const wasRaining = this.isRaining;
        this.isRaining = shouldRain;
        raindropLayers.forEach(layer => { layer.isRaining = shouldRain; });

        if (shouldRain && !wasRaining) {
            this.game.audioHandler.mapSoundtrack.playSound('rainSound', true);
        } else if (!shouldRain && wasRaining) {
            this.game.audioHandler.mapSoundtrack.fadeOutAndStop('rainSound', 2000);
        }
    }
}

export class Map6 extends Background {
    constructor(game) {
        const greenMist = new MovingLayer(game, 0, 'map6GreenMist', 0.9, 'up', 'y');

        const greenBubbles1 = new BubbleAnimation(game, 15, 0.65, { min: 0.0, max: 0.33 }, {
            base: '#7CFF2B',
            highlight: '#DFFF6A',
            shadow: '#4FBF1A',
        });

        const greenBubbles2 = new BubbleAnimation(game, 15, 0.85, { min: 0.33, max: 0.66 }, {
            base: '#7CFF2B',
            highlight: '#DFFF6A',
            shadow: '#4FBF1A',
        });

        const greenBubbles3 = new BubbleAnimation(game, 10, 1.0, { min: 0.66, max: 1.0, spawnBelowGround: true }, {
            base: '#7CFF2B',
            highlight: '#DFFF6A',
            shadow: '#4FBF1A',
        });

        super(
            game,
            { imageId: 'map6Background', bgSpeed: 0 },
            greenBubbles1,
            greenBubbles2,
            greenBubbles3,
            { imageId: ['map6Trees1', 'map6Trees2', 'map6Trees3', 'map6Trees4'], zabbyId: 'map6Zabby1', bgSpeed: 0.2 },
            { imageId: 'map6BigMushrooms', zabbyId: 'map6Zabby2', bgSpeed: 0.3 },
            { imageId: ['map6Rocks1', 'map6Rocks2'], zabbyId: 'map6Zabby3', bgSpeed: 0.4 },
            { imageId: ['map6DeadBranches1', 'map6DeadBranches2'], bgSpeed: 0.5 },
            { imageId: ['map6SmallMushrooms1', 'map6SmallMushrooms2'], bgSpeed: 0.7 },
            greenMist,
            { imageId: 'map6Grass', bgSpeed: 1 },
            { imageId: 'map6Ground', bgSpeed: 1 },
        );

        this.soundId = 'map6Soundtrack';
    }
}

export class Map7 extends Background {
    constructor(game) {
        const starField = new StarField(game, {
            top: 0,
            height: game.height * 0.25,
            density: 0.1,
            color: "white",
            sizeScale: 0.5
        });

        const redMist = new MovingLayer(game, 0, 'bonusMap2RedMist', 0.9, 'up', 'y');

        const orangeBubbles1 = new BubbleAnimation(game, 15, 0.65, { min: 0.0, max: 0.33 }, {
            base: '#ff3c00ff',
            highlight: '#fd8d0cff',
            shadow: '#bf1a1aff',
        });

        const orangeBubbles2 = new BubbleAnimation(game, 15, 0.85, { min: 0.33, max: 0.66 }, {
            base: '#ff3c00ff',
            highlight: '#fd8d0cff',
            shadow: '#bf1a1aff',
        });

        const orangeBubbles3 = new BubbleAnimation(game, 10, 1.0, { min: 0.66, max: 1.0, spawnBelowGround: true }, {
            base: '#ff3c00ff',
            highlight: '#fd8d0cff',
            shadow: '#bf1a1aff',
        });

        super(
            game,
            { imageId: 'map7Background', bgSpeed: 0 },
            starField,
            orangeBubbles1,
            { imageId: 'map7VolcanoLayer1', bgSpeed: 0 },
            { imageId: 'map7VolcanoLayer2', bgSpeed: 0 },
            { imageId: 'map7VolcanoLayer3', bgSpeed: 0 },
            orangeBubbles2,
            { imageId: 'map7VolcanoLayer4', bgSpeed: 0 },
            { imageId: 'map7VolcanoLayer5', bgSpeed: 0 },
            orangeBubbles3,
            redMist,
            { imageId: ['map7rocks3', 'map7rocks4'], zabbyId: ['map7Zabby2', 'map7Zabby3', 'map7Zabby5'], bgSpeed: 0.3 },
            { imageId: ['map7rocks1', 'map7rocks2'], zabbyId: 'map7Zabby4', bgSpeed: 0.5 },
            { imageId: 'map7cactus', bgSpeed: 0.6 },
            { imageId: 'map7spikeStones', zabbyId: 'map7Zabby1', bgSpeed: 0.7 },
            { imageId: 'map7Ground', bgSpeed: 1 },
        );

        this.soundId = 'map7Soundtrack';
    }
}

export class BonusMap1 extends Background {
    constructor(game) {
        const totalFlakes = 220;
        const snowBack = new SnowflakeAnimation(game, Math.floor(totalFlakes * 0.2));
        const snowMid = new SnowflakeAnimation(game, Math.floor(totalFlakes * 0.2));
        const snowFront = new SnowflakeAnimation(game, Math.ceil(totalFlakes * 0.6));

        for (const f of snowFront.flakes) {
            f.r *= 1.2;
            f.opacity = Math.min(1, f.opacity * 1.25);
        }

        super(
            game,
            snowBack,
            { imageId: 'bonusMap1Background', bgSpeed: 0 },
            { imageId: 'bonusMap1IceRings', zabbyId: 'bonusMap1Zabby1', bgSpeed: 0.1 },
            { imageId: 'bonusMap1BigIceCrystal', zabbyId: 'bonusMap1Zabby2', bgSpeed: 0.2 },
            snowMid,
            { imageId: 'bonusMap1IceRocks1', zabbyId: 'bonusMap1Zabby4', bgSpeed: 0.3 },
            { imageId: 'bonusMap1IceRocks2', bgSpeed: 0.4 },
            { imageId: 'bonusMap1TopIcicles', zabbyId: 'bonusMap1Zabby3', bgSpeed: 0.95 },
            { imageId: 'bonusMap1IceSpikes', bgSpeed: 1 },
            { imageId: 'bonusMap1Ground', bgSpeed: 1 },
            snowFront,
        );

        this.soundId = 'bonusMap1Soundtrack';
    }
}

export class BonusMap2 extends Background {
    constructor(game) {
        const redMist = new MovingLayer(game, 0, 'bonusMap2RedMist', 0.9, 'up', 'y');

        const redBubbles1 = new BubbleAnimation(game, 20, 0.65, { min: 0.0, max: 0.33 });
        const redBubbles2 = new BubbleAnimation(game, 20, 0.85, { min: 0.33, max: 0.66 });
        const redBubbles3 = new BubbleAnimation(game, 10, 1.0, { min: 0.66, max: 1.0, spawnBelowGround: true });

        const dragon1 = new DragonSilhouette(game, 0.45, 0.4);
        const dragon1Extra = new DragonSilhouette(game, 0.45, 0.4);
        const dragon2 = new DragonSilhouette(game, 0.55, 0.5);
        const dragon2Extra = new DragonSilhouette(game, 0.55, 0.5);
        const dragon3 = new DragonSilhouette(game, 0.65, 0.6);
        const dragon4 = new DragonSilhouette(game, 0.75, 0.7);
        const dragon5 = new DragonSilhouette(game, 0.85, 0.8);
        const dragon6 = new DragonSilhouette(game, 1, 0.9);
        dragon4.setOneShotGroup('bonusMap2Zabby4');
        dragon5.setOneShotGroup('bonusMap2Zabby4');
        dragon6.setOneShotGroup('bonusMap2Zabby4');

        super(
            game,
            { imageId: 'bonusMap2Background', bgSpeed: 0 },
            dragon1,
            dragon1Extra,
            { imageId: 'bonusMap2RockLayer1', bgSpeed: 0 },
            dragon2,
            dragon2Extra,
            { imageId: 'bonusMap2RockLayer2', bgSpeed: 0 },
            dragon3,
            { imageId: 'bonusMap2RockLayer3', bgSpeed: 0 },
            dragon4,
            { imageId: 'bonusMap2RockLayer4', bgSpeed: 0 },
            dragon5,
            { imageId: 'bonusMap2RockLayer5', bgSpeed: 0 },
            dragon6,
            redBubbles1,
            redBubbles2,
            redBubbles3,
            redMist,
            { imageId: 'bonusMap2CrypticRocks1', bgSpeed: 0.1 },
            { imageId: 'bonusMap2CrypticRocks2', zabbyId: 'bonusMap2Zabby2', bgSpeed: 0.2 },
            { imageId: 'bonusMap2DeadTrees', zabbyId: ['bonusMap2Zabby1', 'bonusMap2Zabby3'], bgSpeed: 0.4 },
            { imageId: 'bonusMap2SpikeRocks', bgSpeed: 1 },
            { imageId: 'bonusMap2Ground', bgSpeed: 1 },
        );

        this.soundId = 'bonusMap2Soundtrack';
    }
}

export class BonusMap3 extends Background {
    constructor(game) {
        const starField = new StarField(game);
        const shootingStars = new ShootingStar(game, 4);
        const meteors = new MeteorBackground(game, 8, {
            minSpeed: 0.03,
            maxSpeed: 0.06,
        });
        const zabby6FlyBy = new BonusMap3Zabby6FlyBy(game);

        meteors.setOneShotImageIds(['bonusMap3Zabby2']);
        zabby6FlyBy.setOneShotImageIds(['bonusMap3Zabby6']);

        super(
            game,
            { imageId: 'bonusMap3Background', bgSpeed: 0 },
            starField,
            shootingStars,
            meteors,
            zabby6FlyBy,
            { imageId: 'bonusMap3Stars', bgSpeed: 0.1 },
            { imageId: ['bonusMap3Planets6', 'bonusMap3Planets2', 'bonusMap3Planets3', 'bonusMap3Planets4', 'bonusMap3Planets5', 'bonusMap3Planets1'], zabbyId: ['bonusMap3Zabby3', 'bonusMap3Zabby4', 'bonusMap3Zabby5'], bgSpeed: 0.2 },
            { imageId: 'bonusMap3Nebula', zabbyId: 'bonusMap3Zabby1', bgSpeed: 0.35 },
            { imageId: 'bonusMap3PurpleSpiral', bgSpeed: 0.4 },
            { imageId: 'bonusMap3Ground', bgSpeed: 1 },
        );

        this.soundId = 'bonusMap3Soundtrack';
    }
}
