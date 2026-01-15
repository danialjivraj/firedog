export class Layer {
    constructor(game, bgSpeed, imageOrImages, meta = {}) {
        this.game = game;
        this.bgSpeed = bgSpeed;

        this.images = Array.isArray(imageOrImages) ? imageOrImages : [imageOrImages];
        this.sequenceIndex = 0;

        this.x = 0;
        this.y = 0;
        this.groundSpeed = 0;
        this.isRaining = false;

        this.imageIds = Array.isArray(meta.imageIds)
            ? meta.imageIds
            : (meta.imageIds ? [meta.imageIds] : []);

        this.defaultX = this.x;
        this.defaultY = this.y;
        this.defaultSequenceIndex = this.sequenceIndex;
    }

    captureDefaults() {
        this.defaultX = this.x;
        this.defaultY = this.y;
        this.defaultSequenceIndex = this.sequenceIndex;
    }

    resetToDefaults() {
        this.x = this.defaultX ?? 0;
        this.y = this.defaultY ?? 0;
        this.sequenceIndex = this.defaultSequenceIndex ?? 0;
        this.groundSpeed = 0;
    }

    _nextIndex() {
        if (this.images.length <= 1) return;
        this.sequenceIndex = (this.sequenceIndex + 1) % this.images.length;
    }

    update() {
        this.groundSpeed = this.game.speed * this.bgSpeed;
        this.x -= this.groundSpeed;

        while (this.x <= -this.game.width) {
            this.x += this.game.width;
            this._nextIndex();
        }
    }

    draw(context) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);

        const img0 = this.images[this.sequenceIndex % this.images.length];
        const img1 =
            this.images.length > 1
                ? this.images[(this.sequenceIndex + 1) % this.images.length]
                : img0;

        context.drawImage(img0, x, y, this.game.width, this.game.height);
        context.drawImage(img1, x + this.game.width, y, this.game.width, this.game.height);
    }
}

export class MovingLayer extends Layer {
    constructor(
        game,
        bgSpeed,
        imageIdOrIds,
        baseScrollSpeed = 0.3,
        direction = 'left',
        axis = 'x'
    ) {
        const ids = Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds];
        const images = ids.map((id) => document.getElementById(id)).filter(Boolean);

        if (images.length === 0) {
            throw new Error(
                `MovingLayer: no valid images found for imageId(s): ${JSON.stringify(imageIdOrIds)}`
            );
        }

        super(game, bgSpeed, images);
        this.baseScrollSpeed = baseScrollSpeed;
        this.direction = direction;
        this.axis = axis;
    }

    update(deltaTime) {
        this.groundSpeed = this.game.speed * this.bgSpeed;

        const axisSpeed = this.axis === 'x'
            ? this.baseScrollSpeed + this.groundSpeed
            : this.baseScrollSpeed;

        if (this.direction === 'left') {
            this.x -= axisSpeed;
        } else if (this.direction === 'right') {
            this.x += axisSpeed;
        } else if (this.direction === 'up') {
            this.y -= axisSpeed;
        } else if (this.direction === 'down') {
            this.y += axisSpeed;
        }

        if (this.axis === 'x') {
            while (this.x <= -this.game.width) {
                this.x += this.game.width;
                this._nextIndex();
            }
            while (this.x >= this.game.width) {
                this.x -= this.game.width;
                this._nextIndex();
            }
        } else {
            while (this.y <= -this.game.height) {
                this.y += this.game.height;
                this._nextIndex();
            }
            while (this.y >= this.game.height) {
                this.y -= this.game.height;
                this._nextIndex();
            }
        }
    }

    draw(context) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);

        const img0 = this.images[this.sequenceIndex % this.images.length];
        const img1 =
            this.images.length > 1
                ? this.images[(this.sequenceIndex + 1) % this.images.length]
                : img0;

        if (this.axis === 'x') {
            context.drawImage(img0, x, this.y, this.game.width, this.game.height);
            context.drawImage(img1, x + this.game.width, this.y, this.game.width, this.game.height);
        } else {
            context.drawImage(img0, this.x, y, this.game.width, this.game.height);
            context.drawImage(img1, this.x, y + this.game.height, this.game.width, this.game.height);
        }
    }
}

export class Background {
    constructor(game, ...layers) {
        this.game = game;
        this.totalDistanceTraveled = 0;
        this.soundId = undefined;
        this.soundPlayed = false;

        this.backgroundLayers = layers.map((item) => {
            if (
                item instanceof Layer ||
                item instanceof MovingLayer ||
                item instanceof EntityAnimation ||
                item instanceof RaindropAnimation ||
                item instanceof SnowflakeAnimation ||
                item instanceof BubbleAnimation ||
                item instanceof StarField ||
                item instanceof ShootingStar
            ) {
                return item;
            }

            const ids = Array.isArray(item.imageId) ? item.imageId : [item.imageId];
            const images = ids.map((id) => document.getElementById(id)).filter(Boolean);

            if (images.length === 0) {
                throw new Error(
                    `Background: no valid images found for imageId(s): ${JSON.stringify(item.imageId)}`
                );
            }

            return new Layer(this.game, item.bgSpeed, images, { imageIds: ids });
        });
    }

    resetLayersByImageIds(imageIds) {
        if (!Array.isArray(imageIds)) imageIds = [imageIds];
        const target = new Set(imageIds);

        for (const layer of this.backgroundLayers) {
            if (!layer || !Array.isArray(layer.imageIds) || layer.imageIds.length === 0) continue;

            const matches = layer.imageIds.some((id) => target.has(id));
            if (matches && typeof layer.resetToDefaults === "function") {
                layer.resetToDefaults();
            }
        }
    }

    update(deltaTime) {
        if (!this.soundPlayed) {
            if (!this.game.cabin.isFullyVisible && !this.game.isBossVisible) {
                this.game.audioHandler.mapSoundtrack.playSound(this.soundId, true);
                this.soundPlayed = true;
            }
        } else {
            if (this.game.cabin.isFullyVisible || this.game.isBossVisible) {
                this.game.audioHandler.mapSoundtrack.fadeOutAndStop(this.soundId);
                this.soundPlayed = false;
            }
        }

        let lastGroundLayer = null;

        for (let i = this.backgroundLayers.length - 1; i >= 0; i--) {
            const layer = this.backgroundLayers[i];
            if (!this.game.cabin.isFullyVisible && !this.game.isBossVisible) {
                layer.update(deltaTime);
                if (layer.bgSpeed === 1 && !lastGroundLayer) {
                    lastGroundLayer = layer;
                }
            } else {
                layer.groundSpeed = 0;
                if (
                    layer instanceof EntityAnimation ||
                    layer instanceof RaindropAnimation ||
                    layer instanceof SnowflakeAnimation ||
                    layer instanceof MovingLayer
                ) {
                    layer.update(deltaTime);
                }
            }
        }

        const activeMap =
            this.game.currentMap ||
            (this.game.background && this.game.background.constructor.name) ||
            null;

        const tutorialBlocksScroll = this.game.isTutorialActive && activeMap === 'Map1';

        if (lastGroundLayer && !tutorialBlocksScroll) {
            this.totalDistanceTraveled += this.game.speed / 1000;
            this.totalDistanceTraveled = parseFloat(this.totalDistanceTraveled.toFixed(2));
        }
    }

    draw(context) {
        this.backgroundLayers.forEach((layer) => {
            layer.draw(context);
        });
    }
}

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
            { imageId: 'map1Trees5', bgSpeed: 0.35 },
            fireflyLayer3,
            { imageId: 'map1Trees3', bgSpeed: 0.4 },
            { imageId: 'map1Trees4', bgSpeed: 0.5 },
            fireflyLayer4,
            { imageId: 'map1Rocks', bgSpeed: 0.6 },
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
        const fireflyLayer = new Firefly(game, 5);
        const fireflyLayer2 = new Firefly(game, 5);

        const starField = new StarField(game, {
            top: 0,
            height: game.height * 0.5,
            density: 0.15,
            color: "white",
            sizeScale: 0.5
        });

        super(
            game,
            { imageId: 'map2Background', bgSpeed: 0 },
            starField,
            { imageId: 'map2CityLights2', bgSpeed: 0.1 },
            { imageId: 'map2CityLights1', bgSpeed: 0.2 },
            fireflyLayer,
            { imageId: 'map2Trees1', bgSpeed: 0.4 },
            fireflyLayer2,
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

        super(
            game,
            { imageId: 'map3Background', bgSpeed: 0 },
            bigFish,
            smallFish,
            smallFish2,
            { imageId: 'map3BackgroundRocks', bgSpeed: 0 },
            smallFish3,
            { imageId: 'map3seaPlants3', bgSpeed: 0.15 },
            smallFish4,
            { imageId: 'map3seaPlants1', bgSpeed: 0.2 },
            { imageId: 'map3seaPlants2', bgSpeed: 0.3 },
            { imageId: 'map3seaPlants4', bgSpeed: 0.4 },
            { imageId: 'map3seaPlants6', bgSpeed: 0.45 },
            { imageId: 'map3seaPlants5', bgSpeed: 0.5 },
            smallFish5,
            { imageId: 'map3seaPlants7', bgSpeed: 0.54 },
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
            { imageId: 'map4BottomVines', bgSpeed: 0.3 },
            { imageId: 'map4Trees3', bgSpeed: 0.34 },
            fireflyLayer2,
            { imageId: 'map4Trees4', bgSpeed: 0.38 },
            { imageId: 'map4Trees2', bgSpeed: 0.42 },
            { imageId: 'map4Trees1', bgSpeed: 0.55 },
            fireflyLayer3,
            { imageId: 'map4TopVines', bgSpeed: 0.92 },
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

        const raindropAnimationLayer = new RaindropAnimation(game, 100);

        super(
            game,
            { imageId: 'map5Background', bgSpeed: 0 },
            fireflyLayer,
            { imageId: 'map5TallGrass', bgSpeed: 0.1 },
            fireflyLayer2,
            { imageId: 'map5BigSunflowers', bgSpeed: 0.15 },
            { imageId: ['map5Bush1', 'map5Bush2'], bgSpeed: 0.3 },
            fireflyLayer3,
            { imageId: ['map5Trees1', 'map5Trees2'], bgSpeed: 0.4 },
            fireflyLayer4,
            { imageId: ['map5Trees3', 'map5Trees4'], bgSpeed: 0.5 },
            fireflyLayer5,
            { imageId: 'map5Cattails', bgSpeed: 0.8 },
            fireflyLayer6,
            { imageId: ['map5Flowers1', 'map5Flowers2'], bgSpeed: 0.87 },
            { imageId: 'map5Ground', bgSpeed: 1 },
            raindropAnimationLayer,
        );

        this.soundId = 'map5Soundtrack';
        this.isRaining = false;
    }

    update(deltaTime) {
        super.update(deltaTime);
        let raindropLayer = this.backgroundLayers.find(layer => layer instanceof RaindropAnimation);
        if (this.totalDistanceTraveled > 30 && this.totalDistanceTraveled <= 60 ||
            this.totalDistanceTraveled > 120 && this.totalDistanceTraveled <= 160 ||
            this.totalDistanceTraveled > 220) {
            if (raindropLayer) {
                raindropLayer.isRaining = true;
                this.isRaining = true;
            }
        } else {
            if (raindropLayer) {
                raindropLayer.isRaining = false;
                this.isRaining = false;
            }
        }
        if (this.game.cabin.isFullyVisible) {
            raindropLayer.isRaining = false;
            this.isRaining = false;
        }

        if (this.isRaining) {
            this.game.audioHandler.mapSoundtrack.playSound('rainSound', true);
        } else {
            this.game.audioHandler.mapSoundtrack.playSound('rainSound', false, true, true);
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
            { imageId: ['map6Trees1', 'map6Trees2', 'map6Trees3', 'map6Trees4'], bgSpeed: 0.2 },
            { imageId: 'map6BigMushrooms', bgSpeed: 0.3 },
            { imageId: ['map6Rocks1', 'map6Rocks2'], bgSpeed: 0.4 },
            { imageId: ['map6DeadBranches1', 'map6DeadBranches2'], bgSpeed: 0.5 },
            { imageId: ['map6SmallMushrooms1', 'map6SmallMushrooms2'], bgSpeed: 0.7 },
            greenMist,
            { imageId: 'map6Ground', bgSpeed: 1 },
        );

        this.soundId = 'map6Soundtrack';
    }
}

export class Map7 extends Background {
    constructor(game) {
        super(
            game,
            { imageId: 'map7Background', bgSpeed: 0 },
            { imageId: 'map7rocks2', bgSpeed: 0.3 },
            { imageId: 'map7rocks1', bgSpeed: 0.5 },
            { imageId: 'map7cactus', bgSpeed: 0.6 },
            { imageId: 'map7spikeStones', bgSpeed: 0.7 },
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
            { imageId: 'bonusMap1IceRings', bgSpeed: 0.1 },
            { imageId: 'bonusMap1BigIceCrystal', bgSpeed: 0.2 },
            snowMid,
            { imageId: 'bonusMap1IceRocks1', bgSpeed: 0.3 },
            { imageId: 'bonusMap1IceRocks2', bgSpeed: 0.4 },
            { imageId: 'bonusMap1TopIcicles', bgSpeed: 0.95 },
            { imageId: 'bonusMap1IceSpikes', bgSpeed: 1 },
            { imageId: 'bonusMap1Ground', bgSpeed: 1 },
            snowFront,
        );

        this.soundId = 'map3Soundtrack';
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
            { imageId: 'bonusMap2CrypticRocks2', bgSpeed: 0.2 },
            { imageId: 'bonusMap2DeadTrees', bgSpeed: 0.4 },
            { imageId: 'bonusMap2SpikeRocks', bgSpeed: 1 },
            { imageId: 'bonusMap2Ground', bgSpeed: 1 },
        );

        this.soundId = 'map3Soundtrack';
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

        super(
            game,
            { imageId: 'bonusMap3Background', bgSpeed: 0 },
            starField,
            shootingStars,
            meteors,
            { imageId: 'bonusMap3Stars', bgSpeed: 0.1 },
            { imageId: 'bonusMap3Planets', bgSpeed: 0.2 },
            { imageId: 'bonusMap3Nebula', bgSpeed: 0.35 },
            { imageId: 'bonusMap3PurpleSpiral', bgSpeed: 0.4 },
            { imageId: 'bonusMap3Ground', bgSpeed: 1 },
        );

        this.soundId = 'map3Soundtrack';
    }
}

export class EntityAnimation {
    constructor(game, maxBackgroundEntities) {
        this.game = game;
        this.maxBackgroundEntities = maxBackgroundEntities;
    }
}

export class Firefly extends EntityAnimation {
    constructor(game, maxBackgroundEntities) {
        super(game, maxBackgroundEntities);
        this.backgroundEntities = [];
        this.createEntityAnimation();
    }

    createEntityAnimation() {
        for (let i = 0; i < this.maxBackgroundEntities; i++) {
            const angle = Math.random() * (Math.PI / 6);
            const directionX = Math.cos(angle);
            const directionY = Math.sin(angle);

            const firefly = {
                x: Math.random() * this.game.width,
                y: Math.random() * this.game.height,
                radius: 2,
                speed: Math.random() * 0.15 + 0.01,
                opacity: 1,
                directionX: Math.random() > 0.5 ? directionX : -directionX,
                directionY: Math.random() > 0.5 ? directionY : -directionY,
            };
            this.backgroundEntities.push(firefly);
        }
    }

    update(deltaTime) {
        for (let i = 0; i < this.backgroundEntities.length; i++) {
            const entity = this.backgroundEntities[i];

            entity.y += entity.speed * entity.directionY * deltaTime;

            if ((!this.game.cabin.isFullyVisible)) {
                const baseSpeed = entity.speed * entity.directionX * deltaTime;
                const playerSpeed = this.game.speed / 20 * deltaTime;
                entity.x += baseSpeed - playerSpeed;
            } else {
                entity.x += entity.speed * entity.directionX * deltaTime;
            }

            if (entity.x < 0 || entity.x > this.game.width || entity.y < 0 || entity.y > this.game.height - 119) {
                this.backgroundEntities.splice(i, 1);
                this.spawnNewFirefly();
                i--;
            } else {
                entity.opacity = 1 - Math.abs((entity.y - 570 / 2) / (570 / 2));
                entity.opacity = Math.max(0, Math.min(1, entity.opacity));

                const edgeFadeDistance = 20;
                const distanceToLeftEdge = entity.x;
                const distanceToRightEdge = this.game.width - entity.x;
                const edgeOpacity = Math.min(1, Math.min(distanceToLeftEdge, distanceToRightEdge) / edgeFadeDistance);
                entity.opacity *= edgeOpacity;
            }
        }
    }

    spawnNewFirefly() {
        const angle = Math.random() * (Math.PI / 6);
        const directionX = Math.cos(angle);
        const directionY = Math.sin(angle);

        const spawnX = Math.random() > 0.5 ? -Math.random() * this.game.width * 0.5 : this.game.width + Math.random() * this.game.width * 0.5;
        const firefly = {
            x: spawnX,
            y: Math.random() * (this.game.height - 119),
            radius: 2,
            speed: Math.random() * 0.15 + 0.01,
            opacity: 1,
            directionX: Math.random() > 0.5 ? directionX : -directionX,
            directionY: Math.random() > 0.5 ? directionY : -directionY,
        };
        this.backgroundEntities.push(firefly);
    }

    draw(context) {
        context.fillStyle = '#ecc45e';
        for (let i = 0; i < this.backgroundEntities.length; i++) {
            const firefly = this.backgroundEntities[i];
            context.globalAlpha = firefly.opacity;
            context.beginPath();
            context.arc(firefly.x, firefly.y, firefly.radius, 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;
    }
}

export class SmallFish extends EntityAnimation {
    constructor(game, maxBackgroundEntities) {
        super(game, maxBackgroundEntities);
        this.backgroundEntities = [];
        this.fishImages = [
            document.getElementById('fish'),
            document.getElementById('fish2'),
            document.getElementById('fish3'),
            document.getElementById('fish4'),
            document.getElementById('fish5'),
            document.getElementById('fish6'),
            document.getElementById('fish7'),
            document.getElementById('fish8'),
            document.getElementById('fish9'),
            document.getElementById('fish10'),
            document.getElementById('fish11'),
            document.getElementById('jellyfish'),
        ];
        this.createEntityAnimation();
    }

    createEntityAnimation() {
        for (let i = 0; i < this.maxBackgroundEntities; i++) {
            const angle = Math.random() * (Math.PI / 6);
            const directionX = Math.cos(angle);
            const directionY = Math.sin(angle);

            const randomFishIndex = Math.floor(Math.random() * this.fishImages.length);
            const fishImage = this.fishImages[randomFishIndex];

            const fish = {
                fishImage: fishImage,
                x: Math.random() * this.game.width,
                y: Math.random() * this.game.height,
                speed: Math.random() * 0.15 + 0.01,
                opacity: 1,
                directionX: Math.random() > 0.5 ? directionX : -directionX,
                directionY: Math.random() > 0.5 ? directionY : -directionY,
            };
            this.backgroundEntities.push(fish);
        }
    }

    update(deltaTime) {
        for (let i = 0; i < this.backgroundEntities.length; i++) {
            const entity = this.backgroundEntities[i];

            entity.y += entity.speed * entity.directionY * deltaTime;

            if ((!this.game.cabin.isFullyVisible)) {
                if (entity.directionX > 0 && this.game.player.isUnderwater) {
                    entity.x += entity.speed * entity.directionX * deltaTime;
                } else {
                    const baseSpeed = entity.speed * entity.directionX * deltaTime;
                    const playerSpeed = this.game.speed / 50 * deltaTime;
                    entity.x += baseSpeed - playerSpeed;
                }
            } else {
                entity.x += entity.speed * entity.directionX * deltaTime;
            }

            if (entity.x < 0 || entity.x > this.game.width || entity.y < 0 || entity.y > this.game.height - 119) {
                this.backgroundEntities.splice(i, 1);
                this.spawnNewFish();
                i--;
            } else {
                entity.opacity = 1 - Math.abs((entity.y - 570 / 2) / (570 / 2));
                entity.opacity = Math.max(0, Math.min(1, entity.opacity));

                const edgeFadeDistance = 20;
                const distanceToLeftEdge = entity.x;
                const distanceToRightEdge = this.game.width - entity.x;
                const edgeOpacity = Math.min(1, Math.min(distanceToLeftEdge, distanceToRightEdge) / edgeFadeDistance);
                entity.opacity *= edgeOpacity;
            }
        }
    }

    spawnNewFish() {
        const angle = Math.random() * (Math.PI / 6);
        const directionX = Math.random() > 0.5 ? -Math.cos(angle) : Math.cos(angle);
        const directionY = Math.sin(angle);

        const randomFishIndex = Math.floor(Math.random() * this.fishImages.length);
        const fishImage = this.fishImages[randomFishIndex];

        const spawnX = directionX > 0 ? -Math.random() * this.game.width * 0.5 : this.game.width + Math.random() * this.game.width * 0.5;
        const newFish = {
            fishImage: fishImage,
            x: spawnX,
            y: Math.random() * (this.game.height - 119),
            speed: Math.random() * 0.15 + 0.01,
            opacity: 1,
            directionX: directionX,
            directionY: Math.random() > 0.5 ? directionY : -directionY,
        };
        this.backgroundEntities.push(newFish);
    }

    draw(context) {
        for (let i = 0; i < this.backgroundEntities.length; i++) {
            const fish = this.backgroundEntities[i];

            context.globalAlpha = fish.opacity;
            context.save();

            const rotationAngle = Math.atan2(fish.directionY, fish.directionX);

            context.translate(fish.x, fish.y);
            context.rotate(rotationAngle);

            if (fish.directionX < 0) {
                context.scale(1, -1);
            }

            context.drawImage(fish.fishImage, -fish.fishImage.width / 2, -fish.fishImage.height / 2);

            context.restore();
        }
        context.globalAlpha = 1;
    }
}

export class BigFish extends EntityAnimation {
    constructor(game, maxBackgroundEntities) {
        super(game, maxBackgroundEntities);
        this.backgroundEntities = [];
        this.fishImages = [
            document.getElementById('shark'),
            document.getElementById('whale'),
        ];
        this.spawnTimer = 0;
        this.spawnInterval = 120000;
    }

    update(deltaTime) {
        const edgeFadeDistance = 100;

        if (this.backgroundEntities.length === 0) {
            this.spawnTimer += deltaTime;
        }

        if (this.spawnTimer >= this.spawnInterval && this.backgroundEntities.length === 0) {
            this.spawnTimer = 0;

            if (Math.random() < 0.2) {
                this.spawnNewFish();
            }
        }

        for (let i = this.backgroundEntities.length - 1; i >= 0; i--) {
            const entity = this.backgroundEntities[i];

            entity.y += entity.speed * entity.directionY * deltaTime;
            entity.x += entity.speed * entity.directionX * deltaTime;

            const distanceToLeftEdge = entity.x + entity.width / 2;
            const distanceToRightEdge = this.game.width - (entity.x - entity.width / 2);
            const distanceToTopEdge = entity.y + entity.height / 2;
            const distanceToBottomEdge = this.game.height - (entity.y - entity.height / 2);

            const edgeOpacityX = Math.min(1, Math.min(distanceToLeftEdge, distanceToRightEdge) / edgeFadeDistance);
            const edgeOpacityY = Math.min(1, Math.min(distanceToTopEdge, distanceToBottomEdge) / edgeFadeDistance);

            entity.opacity = 0.6 * Math.min(edgeOpacityX, edgeOpacityY);

            if (entity.x < -entity.width / 2 || entity.x > this.game.width + entity.width / 2 || entity.y < -entity.height / 2 || entity.y > this.game.height + entity.height / 2) {
                this.backgroundEntities.splice(i, 1);
                this.spawnTimer = 0;
            }
        }
    }

    spawnNewFish() {
        const angle = Math.random() * (Math.PI / 6);
        const directionX = Math.random() > 0.5 ? -Math.cos(angle) : Math.cos(angle);
        const directionY = Math.sin(angle);

        const randomFishIndex = Math.floor(Math.random() * this.fishImages.length);
        const fishImage = this.fishImages[randomFishIndex];

        const spawnX = directionX > 0 ? -fishImage.width / 2 : this.game.width + fishImage.width / 2;
        const spawnY = Math.random() * (this.game.height - fishImage.height) + fishImage.height / 2;

        const newFish = {
            fishImage: fishImage,
            width: fishImage.width,
            height: fishImage.height,
            x: spawnX,
            y: spawnY,
            speed: Math.random() * 0.15 + 0.02,
            opacity: 0.6,
            directionX: directionX,
            directionY: Math.random() > 0.5 ? directionY : -directionY,
        };
        this.backgroundEntities.push(newFish);
    }

    draw(context) {
        for (let i = 0; i < this.backgroundEntities.length; i++) {
            const fish = this.backgroundEntities[i];

            context.globalAlpha = fish.opacity;
            context.save();

            const rotationAngle = Math.atan2(fish.directionY, fish.directionX);

            context.translate(fish.x, fish.y);
            context.rotate(rotationAngle);

            if (fish.directionX < 0) {
                context.scale(1, -1);
            }

            context.drawImage(fish.fishImage, -fish.fishImage.width / 2, -fish.fishImage.height / 2);

            context.restore();
        }
        context.globalAlpha = 1;
    }
}

export class RaindropAnimation {
    constructor(game, maxRaindrops) {
        this.game = game;
        this.maxRaindrops = maxRaindrops;
        this.raindrops = [];
        this.isRaining = false;
        this.splashes = [];

        this.createRaindrops();
    }

    createRaindrops() {
        for (let i = 0; i < this.maxRaindrops; i++) {
            const x = Math.random() * this.game.width;
            const y = Math.random() * this.game.height;
            const length = Math.random() * 110 + 5;
            const speed = Math.random() * 0.5 + 1;

            this.raindrops.push({ x, y, length, speed });
        }
    }

    update(deltaTime) {
        if (this.isRaining) {
            for (let i = 0; i < this.raindrops.length; i++) {
                const raindrop = this.raindrops[i];

                raindrop.y += raindrop.speed * deltaTime;

                if (raindrop.y > this.game.height) {
                    raindrop.y = 0;
                    raindrop.x = Math.random() * this.game.width;

                    if (Math.random() <= 0.065) {
                        const splashAnimation = new RaindropSplashAnimation(this.game, raindrop.x);
                        this.splashes.push(splashAnimation);
                    }
                }
            }

            this.splashes.forEach(splash => splash.update(deltaTime));

            this.splashes = this.splashes.filter(splash => !splash.markedForDeletion);
        }
    }

    draw(context) {
        context.save();
        if (this.isRaining) {
            context.strokeStyle = '#808080';
            context.lineWidth = 0.5;

            for (let i = 0; i < this.raindrops.length; i++) {
                const raindrop = this.raindrops[i];
                context.beginPath();
                context.moveTo(raindrop.x, raindrop.y);
                context.lineTo(raindrop.x, raindrop.y + raindrop.length);
                context.stroke();
            }
            this.splashes.forEach(splash => splash.draw(context));
        }
        context.restore();
    }
}

export class RaindropSplashAnimation {
    constructor(game, x) {
        this.game = game;
        this.x = x;
        this.y = this.calculateRandomY();
        this.width = 20;
        this.height = 20;
        this.maxFrames = 6;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.fps = Math.random() * 20 + 10;
        this.frameInterval = 1000 / this.fps;
        this.markedForDeletion = false;
        this.groundSpeed = 0;
        this.bgSpeed = 1;
    }
    calculateRandomY() {
        return this.game.height - Math.random() * 25 - 55;
    }
    update(deltaTime) {
        if (this.currentFrame < this.maxFrames) {

            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.currentFrame++;
                this.frameTimer = 0;
            }
        } else {
            this.markedForDeletion = true;
        }
        this.groundSpeed = this.game.speed * this.bgSpeed;
        this.x -= this.groundSpeed;
    }

    draw(context) {
        if (this.currentFrame < this.maxFrames) {
            context.drawImage(
                document.getElementById('raindropSplash'),
                this.currentFrame * this.width,
                0,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
    }
}

export class SnowflakeAnimation {
    constructor(game, maxFlakes = 180) {
        this.game = game;
        this.maxFlakes = maxFlakes;
        this.flakes = [];
        this.spawnAll();
    }

    spawnAll() {
        for (let i = 0; i < this.maxFlakes; i++) {
            this.flakes.push(this.makeFlake(true));
        }
    }

    makeFlake(randomY = false) {
        const r = Math.random() * 2.2 + 0.8;
        const speed = Math.random() * 0.06 + 0.02;
        const drift = (Math.random() * 0.06) - 0.03;
        const stopAbove = Math.random() < 0.8;
        return {
            x: Math.random() * this.game.width,
            y: randomY ? Math.random() * this.game.height : -10,
            r,
            speed,
            drift,
            opacity: Math.random() * 0.35 + 0.35,
            stopAbove,
        };
    }

    update(deltaTime) {
        const dt = deltaTime / 16.67;
        const playerParallax = this.game.cabin.isFullyVisible ? 0 : (this.game.speed / 400) * dt;

        for (let i = 0; i < this.flakes.length; i++) {
            const f = this.flakes[i];

            f.y += f.speed * 120 * dt;
            f.x += f.drift * 50 * dt - playerParallax;

            const stopThreshold = f.stopAbove
                ? this.game.height - 40
                : this.game.height + 10;

            if (f.y > stopThreshold || f.x < -20 || f.x > this.game.width + 20) {
                this.flakes[i] = this.makeFlake(false);
            }
        }
    }

    draw(context) {
        context.save();
        context.fillStyle = 'white';
        for (let i = 0; i < this.flakes.length; i++) {
            const f = this.flakes[i];
            context.globalAlpha = f.opacity;
            context.beginPath();
            context.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;
        context.restore();
    }
}

export class BubbleAnimation extends EntityAnimation {
    constructor(
        game,
        maxBackgroundEntities = 70,
        sizeScale = 1,
        band = { min: 0, max: 1, spawnBelowGround: false },
        colors = {}
    ) {
        super(game, maxBackgroundEntities);

        this.colors = {
            base: colors.base || '#d12932ff',
            highlight: colors.highlight || '#ffb6c4',
            shadow: colors.shadow || '#ff3c5a',
        };

        this.bubbles = [];

        this.waterDepth = Math.min(300, this.game.height * 0.45);
        this.waterTopY = this.game.height - this.waterDepth;

        this.lifeTime = 6000;
        this.fadeFraction = 0.25;
        this.minRadius = 2;
        this.maxRadius = 10;
        this.minRise = 0.02;
        this.maxRise = 0.07;
        this.minOpacity = 0.2;
        this.maxOpacity = 0.8;

        this.sizeScale = sizeScale;
        this.bandMin = Math.max(0, Math.min(1, band.min ?? 0));
        this.bandMax = Math.max(this.bandMin, Math.min(1, band.max ?? 1));
        this.spawnBelowGround = !!band.spawnBelowGround;

        this.spawnAll();
    }

    spawnAll() {
        for (let i = 0; i < this.maxBackgroundEntities; i++) {
            this.bubbles.push(this.makeBubble(true));
        }
    }

    makeBubble(randomAge = false) {
        const x = Math.random() * this.game.width;

        const depthNorm = this.spawnBelowGround
            ? 1
            : this.bandMin + Math.random() * (this.bandMax - this.bandMin);

        const baseRadius =
            this.minRadius + depthNorm * (this.maxRadius - this.minRadius);

        const radius = baseRadius * this.sizeScale * (0.85 + Math.random() * 0.3);

        let y;
        if (this.spawnBelowGround) {
            const groundTop = this.game.height - (this.game.groundMargin || 0);
            y = groundTop + radius + Math.random() * radius * 2;
        } else {
            const bandHeight = this.waterDepth * (this.bandMax - this.bandMin);
            y =
                this.waterTopY +
                this.waterDepth * this.bandMin +
                Math.random() * bandHeight;
        }

        const riseSpeed =
            this.minRise + Math.pow(depthNorm, 2.2) * (this.maxRise - this.minRise);

        const baseOpacity =
            this.minOpacity + depthNorm * (this.maxOpacity - this.minOpacity);

        return {
            x,
            y,
            radius,
            riseSpeed,
            drift: (Math.random() * 0.04 - 0.02) * (0.5 + depthNorm),
            baseOpacity,
            opacity: 0,
            age: randomAge
                ? Math.random() * this.lifeTime * (1 - this.fadeFraction)
                : 0,
        };
    }

    update(deltaTime) {
        for (let i = 0; i < this.bubbles.length; i++) {
            const b = this.bubbles[i];
            b.age += deltaTime;

            if (
                b.age >= this.lifeTime ||
                b.y < -50 ||
                b.x < -40 ||
                b.x > this.game.width + 40
            ) {
                this.bubbles[i] = this.makeBubble(false);
                continue;
            }

            b.y -= b.riseSpeed * deltaTime;
            b.x += b.drift * deltaTime;

            const fadeIn = this.lifeTime * this.fadeFraction;
            const fadeOut = this.lifeTime * (1 - this.fadeFraction);

            let alpha = 1;
            if (b.age < fadeIn) alpha = b.age / fadeIn;
            else if (b.age > fadeOut)
                alpha = 1 - (b.age - fadeOut) / (this.lifeTime - fadeOut);

            b.opacity = b.baseOpacity * Math.max(0, Math.min(1, alpha));
        }
    }

    draw(context) {
        context.save();
        context.globalCompositeOperation = 'lighter';

        for (const b of this.bubbles) {
            if (b.opacity <= 0) continue;

            context.globalAlpha = b.opacity;
            context.shadowBlur = b.radius * 2;
            context.shadowColor = this.colors.shadow;

            context.fillStyle = this.colors.base;
            context.beginPath();
            context.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            context.fill();

            context.shadowBlur = 0;
            context.globalAlpha = b.opacity * 0.8;
            context.fillStyle = this.colors.highlight;
            context.beginPath();
            context.arc(
                b.x - b.radius * 0.35,
                b.y - b.radius * 0.35,
                b.radius * 0.45,
                0,
                Math.PI * 2
            );
            context.fill();
        }

        context.restore();
    }
}

export class StarField extends EntityAnimation {
    constructor(game, options = {}) {
        super(game, 0);
        this.game = game;
        this.stars = [];

        this.layers = [
            { speed: 0.015, scale: 0.2, count: 320 },
            { speed: 0.03, scale: 0.5, count: 50 },
            { speed: 0.05, scale: 0.75, count: 30 },
        ];

        this.starBaseRadius = 2;
        this.starsAngleDeg = 145;
        this.starsAngleRad = this.degreesToRads(this.starsAngleDeg);

        const {
            top = 0,
            height = game.height,
            density = 1,
            color = "rgb(255, 221, 157)",
            sizeScale = 1
        } = options;

        this.top = top;
        this.height = height;
        this.density = density;
        this.color = color;
        this.sizeScale = sizeScale;

        this.initStars();
    }

    degreesToRads(deg) {
        return (deg * Math.PI) / 180;
    }

    initStars() {
        const width = this.game.width;
        const top = this.top;
        const height = this.height;

        for (let j = 0; j < this.layers.length; j++) {
            const layer = this.layers[j];

            const count = Math.floor(layer.count * this.density);

            for (let i = 0; i < count; i++) {
                const x = Math.random() * width;
                const y = top + Math.random() * height;

                const speed = layer.speed;
                const vx = Math.cos(this.starsAngleRad) * speed;
                const vy = Math.sin(this.starsAngleRad) * speed;

                this.stars.push({
                    x,
                    y,
                    vx,
                    vy,
                    radius: this.starBaseRadius * layer.scale * this.sizeScale
                });
            }
        }
    }

    update(deltaTime) {
        const width = this.game.width;
        const dt = deltaTime / 16.67;

        const top = this.top;
        const bottom = this.top + this.height;

        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];

            s.x += s.vx * dt;
            s.y += s.vy * dt;

            s.x = ((s.x % width) + width) % width;

            if (s.y < top) s.y += this.height;
            if (s.y > bottom) s.y -= this.height;
        }
    }

    draw(context) {
        context.save();
        context.fillStyle = this.color;

        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            context.beginPath();
            context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            context.fill();
        }

        context.restore();
    }
}

export class ShootingStar extends EntityAnimation {
    constructor(game, maxBackgroundEntities = 4) {
        super(game, maxBackgroundEntities);

        this.game = game;
        this.shootingStars = [];

        this.starsAngleDeg = 145;
        this.starsAngleRad = this.degreesToRads(this.starsAngleDeg);
        this.starsAngleRadFlipped = this.degreesToRads(180 - this.starsAngleDeg);

        this.shootingStarSpeed = {
            min: 15,
            max: 20,
        };

        this.shootingStarOpacityDelta = 0.01;
        this.trailLengthDelta = 0.01;

        this.shootingStarEmittingInterval = 5000;
        this.shootingStarLifeTime = 500;
        this.maxTrailLength = 300;
        this.shootingStarRadius = 3;

        this.spawnTimer = 0;

        this.createShootingStar();
    }

    degreesToRads(deg) {
        return (deg / 180) * Math.PI;
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    lineToAngle(x1, y1, length, radians) {
        const x2 = x1 + length * Math.cos(radians);
        const y2 = y1 + length * Math.sin(radians);
        return { x: x2, y: y2 };
    }

    createShootingStar() {
        if (this.shootingStars.length >= this.maxBackgroundEntities) return;

        const width = this.game.width;
        const height = this.game.height;

        const variant = Math.floor(Math.random() * 4);

        let x, y, heading;

        switch (variant) {
            case 0:
                x = this.randomRange(width / 2, width);
                y = this.randomRange(0, height / 2);
                heading = this.starsAngleRad;
                break;

            case 1:
                x = this.randomRange(0, width / 2);
                y = this.randomRange(0, height / 2);
                heading = this.starsAngleRadFlipped;
                break;

            case 2:
                x = this.randomRange(width / 2, width);
                y = this.randomRange(height / 2, height);
                heading = -this.starsAngleRad;
                break;

            case 3:
            default:
                x = this.randomRange(0, width / 2);
                y = this.randomRange(height / 2, height);
                heading = -this.starsAngleRadFlipped;
                break;
        }

        const speed = this.randomRange(
            this.shootingStarSpeed.min,
            this.shootingStarSpeed.max
        );

        const vx = Math.cos(heading) * speed;
        const vy = Math.sin(heading) * speed;

        const shootingStar = {
            x,
            y,
            vx,
            vy,
            radius: this.shootingStarRadius,
            opacity: 0,
            trailLengthDelta: 0,
            isSpawning: true,
            isDying: false,
            isDead: false,
            heading,
            lifeTimer: 0,
        };

        this.shootingStars.push(shootingStar);
    }

    update(deltaTime) {
        const dt = deltaTime / 16.67;

        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.shootingStarEmittingInterval) {
            this.spawnTimer = 0;

            const burstCount = Math.random() < 0.1 ? 2 : 1;
            for (let i = 0; i < burstCount; i++) {
                this.createShootingStar();
            }
        }

        const width = this.game.width;
        const height = this.game.height;

        for (let i = 0; i < this.shootingStars.length; i++) {
            const p = this.shootingStars[i];

            if (p.isSpawning) {
                p.opacity += this.shootingStarOpacityDelta * dt;
                if (p.opacity >= 1.0) {
                    p.opacity = 1.0;
                    p.isSpawning = false;
                    p.lifeTimer = 0;
                }
            } else if (p.isDying) {
                p.opacity -= this.shootingStarOpacityDelta * dt;
                if (p.opacity <= 0.0) {
                    p.opacity = 0.0;
                    p.isDying = false;
                    p.isDead = true;
                }
            } else {
                p.lifeTimer += deltaTime;
                if (p.lifeTimer >= this.shootingStarLifeTime) {
                    p.isDying = true;
                }
            }

            p.trailLengthDelta += this.trailLengthDelta * dt;

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (
                p.x < -this.maxTrailLength ||
                p.x > width + this.maxTrailLength ||
                p.y < -this.maxTrailLength ||
                p.y > height + this.maxTrailLength
            ) {
                p.isDead = true;
            }
        }

        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            if (this.shootingStars[i].isDead) {
                this.shootingStars.splice(i, 1);
            }
        }
    }

    drawShootingStar(context, p) {
        const x = p.x;
        const y = p.y;
        const currentTrailLength = this.maxTrailLength * p.trailLengthDelta;
        const pos = this.lineToAngle(x, y, -currentTrailLength, p.heading);

        context.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;

        const starLength = 5;
        context.beginPath();
        context.moveTo(x - 1, y + 1);

        context.lineTo(x, y + starLength);
        context.lineTo(x + 1, y + 1);

        context.lineTo(x + starLength, y);
        context.lineTo(x + 1, y - 1);
        context.lineTo(x, y + 1);
        context.lineTo(x, y - starLength);

        context.lineTo(x - 1, y - 1);
        context.lineTo(x - starLength, y);

        context.lineTo(x - 1, y + 1);
        context.lineTo(x - starLength, y);

        context.closePath();
        context.fill();

        context.fillStyle = `rgba(255, 221, 157, ${p.opacity})`;
        context.beginPath();
        context.moveTo(x - 1, y - 1);
        context.lineTo(pos.x, pos.y);
        context.lineTo(x + 1, y + 1);
        context.closePath();
        context.fill();
    }

    draw(context) {
        context.save();
        for (let i = 0; i < this.shootingStars.length; i++) {
            const p = this.shootingStars[i];
            if (p.opacity > 0.0) {
                this.drawShootingStar(context, p);
            }
        }
        context.restore();
    }
}

export class DragonSilhouette extends EntityAnimation {
    constructor(
        game,
        scale = 1,
        opacity = 1
    ) {
        super(game, 1);
        this.game = game;

        this.frameWidth = 52.91666666666667;
        this.frameHeight = 50;

        this.scale = scale;
        this.width = this.frameWidth * this.scale;
        this.height = this.frameHeight * this.scale;

        this.opacity = opacity;

        this.maxFrame = 11;
        this.frameX = Math.floor(Math.random() * (this.maxFrame + 1));
        this.frameY = 0;

        this.fps = 14;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        this.imageId = 'dragonSilhouette';
        this.image = document.getElementById(this.imageId);

        this.direction = -1;
        this.flipped = false;

        this.speedX = 0;
        this.speedY = 0;

        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;

        this.spawnInitialInScreen();
    }

    ensureImageLoaded() {
        if (!this.image) {
            this.image = document.getElementById(this.imageId);
        }
    }

    spawnInitialInScreen() {
        this.width = this.frameWidth * this.scale;
        this.height = this.frameHeight * this.scale;

        const randomBase = Math.random() * 0.5 + 0.5;
        this.speedX = randomBase * this.scale;

        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;

        const minY = 0;
        const maxY = this.game.height / 2;
        this.y = minY + Math.random() * (maxY - minY);

        this.x = Math.random() * (this.game.width - this.width);

        if (Math.random() < 0.5) {
            this.direction = 1;
            this.flipped = true;
        } else {
            this.direction = -1;
            this.flipped = false;
        }
    }

    resetPosition() {
        const spawnFromLeft = Math.random() < 0.5;

        this.width = this.frameWidth * this.scale;
        this.height = this.frameHeight * this.scale;

        const randomBase = Math.random() * 0.5 + 0.5;
        this.speedX = randomBase * this.scale;

        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;

        const minY = 0;
        const maxY = this.game.height / 2;
        this.y = minY + Math.random() * (maxY - minY);

        if (spawnFromLeft) {
            this.direction = 1;
            this.flipped = true;
            this.x = -this.width - Math.random() * this.game.width * 0.5;
        } else {
            this.direction = -1;
            this.flipped = false;
            this.x = this.game.width + Math.random() * this.game.width * 0.5;
        }
    }

    advanceFrame(deltaTime) {
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = this.frameX < this.maxFrame ? this.frameX + 1 : 0;
        }
    }

    update(deltaTime) {
        this.x += this.speedX * this.direction;
        this.y += this.speedY;

        this.va = (Math.random() * 0.1 + 0.1) * this.speedX;

        this.angle += this.va;

        this.y += Math.sin(this.angle) * this.speedX * this.scale;

        this.advanceFrame(deltaTime);

        const offLeft = this.x + this.width < 0;
        const offRight = this.x > this.game.width;
        const offBottom = this.y > this.game.height;
        const offTop = this.y + this.height < 0;

        if (offLeft || offRight || offBottom || offTop) {
            this.resetPosition();
        }
    }

    draw(context) {
        this.ensureImageLoaded();
        if (!this.image) return;

        const sx = this.frameX * this.frameWidth;
        const sy = 0;
        const sw = this.frameWidth;
        const sh = this.frameHeight;

        const dw = this.width;
        const dh = this.height;

        context.save();
        context.globalAlpha = this.opacity;

        if (this.flipped) {
            context.translate(this.x + dw, this.y);
            context.scale(-1, 1);
            context.drawImage(
                this.image,
                sx,
                sy,
                sw,
                sh,
                0,
                0,
                dw,
                dh
            );
        } else {
            context.translate(this.x, this.y);
            context.drawImage(
                this.image,
                sx,
                sy,
                sw,
                sh,
                0,
                0,
                dw,
                dh
            );
        }

        context.restore();
    }
}

export class MeteorBackground extends EntityAnimation {
    constructor(
        game,
        maxBackgroundEntities = 5,
        {
            minSpeed = 0.03,
            maxSpeed = 0.07,
            minAngularSpeed = 0.0007,
            maxAngularSpeed = 0.0025,
            verticalBand = { min: 0.2, max: 0.8 },
        } = {}
    ) {
        super(game, maxBackgroundEntities);

        this.game = game;
        this.meteors = [];

        this.imageId = 'meteorBackground';
        this.image = document.getElementById(this.imageId);

        this.spriteWidth = 47;
        this.spriteHeight = 47;

        this.minSpeed = minSpeed;
        this.maxSpeed = maxSpeed;
        this.minAngularSpeed = minAngularSpeed;
        this.maxAngularSpeed = maxAngularSpeed;
        this.verticalBand = verticalBand;

        this.minScale = 0.6;
        this.maxScale = 1.0;

        this.offscreenMargin = 100;

        this.spawnAll();
    }

    ensureImageLoaded() {
        if (!this.image) {
            this.image = document.getElementById(this.imageId);
        }
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    spawnAll() {
        for (let i = 0; i < this.maxBackgroundEntities; i++) {
            this.meteors.push(this.makeMeteor(true));
        }
    }

    makeMeteor(spawnInScreen = false) {
        const width = this.game.width;
        const height = this.game.height;

        const fromLeft = Math.random() < 0.5;

        const bandMin = Math.max(0, Math.min(1, this.verticalBand.min ?? 0));
        const bandMax = Math.max(bandMin, Math.min(1, this.verticalBand.max ?? 1));
        const yMin = height * bandMin;
        const yMax = height * bandMax;
        const y = yMin + Math.random() * (yMax - yMin);

        let x;
        if (spawnInScreen) {
            x = Math.random() * width;
        } else {
            x = fromLeft
                ? -this.offscreenMargin
                : width + this.offscreenMargin;
        }

        const spreadDeg = 40;
        const spread = (spreadDeg * Math.PI) / 180;
        const baseAngle = fromLeft ? 0 : Math.PI;
        const angleHeading = baseAngle + this.randomRange(-spread, spread);

        const speed = this.randomRange(this.minSpeed, this.maxSpeed);
        const vx = Math.cos(angleHeading) * speed;
        const vy = Math.sin(angleHeading) * speed;

        const angularSpeed = this.randomRange(
            this.minAngularSpeed,
            this.maxAngularSpeed
        );
        const rotationDir = Math.random() < 0.5 ? -1 : 1;

        const scale = this.randomRange(this.minScale, this.maxScale);

        return {
            x,
            y,
            vx,
            vy,
            angle: Math.random() * Math.PI * 2,
            angularSpeed,
            rotationDir,
            scale,
        };
    }

    update(deltaTime) {
        this.ensureImageLoaded();
        if (!this.image) return;

        const width = this.game.width;
        const height = this.game.height;

        for (let i = 0; i < this.meteors.length; i++) {
            const m = this.meteors[i];

            m.x += m.vx * deltaTime;
            m.y += m.vy * deltaTime;

            m.angle += m.angularSpeed * m.rotationDir * deltaTime;

            const off =
                m.x < -this.offscreenMargin ||
                m.x > width + this.offscreenMargin ||
                m.y < -this.offscreenMargin ||
                m.y > height + this.offscreenMargin;

            if (off) {
                this.meteors[i] = this.makeMeteor(false);
            }
        }
    }

    draw(context) {
        this.ensureImageLoaded();
        if (!this.image) return;

        for (let i = 0; i < this.meteors.length; i++) {
            const m = this.meteors[i];

            const drawW = this.spriteWidth * m.scale;
            const drawH = this.spriteHeight * m.scale;

            context.save();
            context.translate(m.x, m.y);
            context.rotate(m.angle);

            context.drawImage(
                this.image,
                -drawW / 2,
                -drawH / 2,
                drawW,
                drawH
            );

            context.restore();
        }
    }
}
