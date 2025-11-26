export class Layer {
    constructor(game, bgSpeed, image) {
        this.game = game;
        this.bgSpeed = bgSpeed;
        this.image = image;
        this.x = 0;
        this.y = 0;
        this.groundSpeed = 0;
        this.isRaining = false;
    }

    update() {
        this.groundSpeed = this.game.speed * this.bgSpeed;
        this.x -= this.groundSpeed;

        // check if the first image is completely out of view
        if (this.x <= -this.game.width) {
            this.x += this.game.width;
        }
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.game.width, this.game.height);
        context.drawImage(this.image, this.x + this.game.width, this.y, this.game.width, this.game.height);
    }
}

export class Background {
    constructor(game, ...layers) {
        this.game = game;
        this.totalDistanceTraveled = 0;
        this.soundId;
        this.backgroundLayers = layers.map(item => {
            const image = document.getElementById(item.imageId);

            if (item.hasOwnProperty('maxBackgroundEntities')) {
                return new EntityAnimation(this.game);
            } else {
                return new Layer(this.game, item.bgSpeed, image);
            }
        });
        this.soundPlayed = false;
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
                if (layer instanceof EntityAnimation || layer instanceof RaindropAnimation || layer instanceof SnowflakeAnimation) {
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
        this.backgroundLayers.forEach(layer => {
            layer.draw(context);
        });

    }
}

export class Map1 extends Background {
    constructor(game) {
        super(
            game,
            { imageId: 'map1Background', bgSpeed: 0 },
            { imageId: 'map1Trees7', bgSpeed: 0.1 },
            { imageId: 'map1Trees1', bgSpeed: 0.2 },
            { imageId: 'map1Trees2', bgSpeed: 0.3 },
            { imageId: 'map1Trees5', bgSpeed: 0.35 },
            { imageId: 'map1Trees3', bgSpeed: 0.4 },
            { imageId: 'map1Trees4', bgSpeed: 0.5 },
            { imageId: 'map1Rocks', bgSpeed: 0.6 },
            { imageId: 'map1Bush', bgSpeed: 0.65 },
            { imageId: 'map1Trees6', bgSpeed: 0.7 },
            { imageId: 'map1Ground', bgSpeed: 1 }),
            this.soundId = 'map1Soundtrack';

        const fireflyLayer = new Firefly(game, 5);
        const fireflyLayer2 = new Firefly(game, 5);
        const fireflyLayer3 = new Firefly(game, 5);
        const fireflyLayer4 = new Firefly(game, 5);
        const fireflyLayer5 = new Firefly(game, 5);

        this.backgroundLayers.splice(2, 0, fireflyLayer);
        this.backgroundLayers.splice(5, 0, fireflyLayer2);
        this.backgroundLayers.splice(7, 0, fireflyLayer3);
        this.backgroundLayers.splice(10, 0, fireflyLayer4);
        this.backgroundLayers.splice(14, 0, fireflyLayer5);
    }
}

export class Map2 extends Background {
    constructor(game) {
        super(
            game,
            { imageId: 'map2Background', bgSpeed: 0 },
            { imageId: 'map2CityLights2', bgSpeed: 0.1 },
            { imageId: 'map2CityLights1', bgSpeed: 0.2 },
            { imageId: 'map2Trees1', bgSpeed: 0.4 },
            { imageId: 'map2Ground', bgSpeed: 1 },
        );
        this.soundId = 'map2Soundtrack';

        const fireflyLayer = new Firefly(game, 5);
        const fireflyLayer2 = new Firefly(game, 5);

        this.backgroundLayers.splice(3, 0, fireflyLayer);
        this.backgroundLayers.splice(5, 0, fireflyLayer2);
    }
}

export class Map3 extends Background {
    constructor(game) {
        super(
            game,
            { imageId: 'map3Background', bgSpeed: 0 },
            { imageId: 'map3BackgroundRocks', bgSpeed: 0 },
            { imageId: 'map3seaPlants3', bgSpeed: 0.15 },
            { imageId: 'map3seaPlants1', bgSpeed: 0.2 },
            { imageId: 'map3seaPlants2', bgSpeed: 0.3 },
            { imageId: 'map3seaPlants4', bgSpeed: 0.4 },
            { imageId: 'map3seaPlants6', bgSpeed: 0.45 },
            { imageId: 'map3seaPlants5', bgSpeed: 0.5 },
            { imageId: 'map3seaPlants7', bgSpeed: 0.54 },
            { imageId: 'map3Ground', bgSpeed: 1 }
        );
        this.soundId = 'map3Soundtrack';

        const smallFish = new SmallFish(game, 4);
        const bigFish = new BigFish(game, 1);
        const smallFish2 = new SmallFish(game, 4);
        const smallFish3 = new SmallFish(game, 3);
        const smallFish4 = new SmallFish(game, 3);
        const smallFish5 = new SmallFish(game, 3);

        this.backgroundLayers.splice(1, 0, smallFish);
        this.backgroundLayers.splice(1, 0, bigFish);
        this.backgroundLayers.splice(3, 0, smallFish2);
        this.backgroundLayers.splice(5, 0, smallFish3);
        this.backgroundLayers.splice(7, 0, smallFish4);
        this.backgroundLayers.splice(13, 0, smallFish5);
    }
}

export class Map4 extends Background {
    constructor(game) {
        super(game,
            { imageId: 'map4Background', bgSpeed: 0 },
            { imageId: 'map4BottomVines', bgSpeed: 0.3 },
            { imageId: 'map4Trees3', bgSpeed: 0.34 },
            { imageId: 'map4Trees4', bgSpeed: 0.38 },
            { imageId: 'map4Trees2', bgSpeed: 0.42 },
            { imageId: 'map4Trees1', bgSpeed: 0.55 },
            { imageId: 'map4TopVines', bgSpeed: 0.92 },
            { imageId: 'map4Ground', bgSpeed: 1 }
        );
        this.soundId = 'map4Soundtrack';

        const fireflyLayer = new Firefly(game, 6);
        const fireflyLayer2 = new Firefly(game, 6);
        const fireflyLayer3 = new Firefly(game, 6);

        this.backgroundLayers.splice(1, 0, fireflyLayer);
        this.backgroundLayers.splice(4, 0, fireflyLayer2);
        this.backgroundLayers.splice(8, 0, fireflyLayer3);
    }
}

export class Map5 extends Background {
    constructor(game) {
        super(
            game,
            { imageId: 'map5Background', bgSpeed: 0 },
            { imageId: 'map5Trees5', bgSpeed: 0.3 },
            { imageId: 'map5Trees2', bgSpeed: 0.32 },
            { imageId: 'map5Trees4', bgSpeed: 0.34 },
            { imageId: 'map5Trees3', bgSpeed: 0.4 },
            { imageId: 'map5Trees1', bgSpeed: 0.44 },
            { imageId: 'map5Bush2', bgSpeed: 0.5 },
            { imageId: 'map5Bush1', bgSpeed: 0.54 },
            { imageId: 'map5Flowers2', bgSpeed: 0.6 },
            { imageId: 'map5Flowers1', bgSpeed: 0.7 },
            { imageId: 'map5Ground', bgSpeed: 1 }
        );
        this.soundId = 'map5Soundtrack';

        const fireflyLayer = new Firefly(game, 5);
        const fireflyLayer2 = new Firefly(game, 7);
        const fireflyLayer3 = new Firefly(game, 5);
        const fireflyLayer4 = new Firefly(game, 4);
        const fireflyLayer5 = new Firefly(game, 5);
        const fireflyLayer6 = new Firefly(game, 10);

        this.backgroundLayers.splice(1, 0, fireflyLayer);
        this.backgroundLayers.splice(4, 0, fireflyLayer2);
        this.backgroundLayers.splice(7, 0, fireflyLayer3);
        this.backgroundLayers.splice(9, 0, fireflyLayer4);
        this.backgroundLayers.splice(11, 0, fireflyLayer5);
        this.backgroundLayers.splice(15, 0, fireflyLayer6);

        const raindropAnimationLayer = new RaindropAnimation(game, 100);
        this.backgroundLayers.push(raindropAnimationLayer);
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
        super(game,
            { imageId: 'map6Background', bgSpeed: 0 },
            { imageId: 'map6rocks2', bgSpeed: 0.3 },
            { imageId: 'map6rocks1', bgSpeed: 0.5 },
            { imageId: 'map6cactus', bgSpeed: 0.6 },
            { imageId: 'map6spikeStones', bgSpeed: 0.7 },
            { imageId: 'map6Ground', bgSpeed: 1 },
        );
        this.soundId = 'map6Soundtrack';
    }
}

export class BonusMap1 extends Background {
    constructor(game) {
        super(game,
            { imageId: 'bonusMap1Background', bgSpeed: 0 },
            { imageId: 'bonusMap1Ground', bgSpeed: 1 },
        );
        this.soundId = 'map3Soundtrack';

        const totalFlakes = 220;
        this.snowMid = new SnowflakeAnimation(game, Math.floor(totalFlakes * 0.8));
        this.snowFront = new SnowflakeAnimation(game, Math.ceil(totalFlakes * 0.2));

        for (const f of this.snowFront.flakes) {
            f.r *= 1.2;
            f.opacity = Math.min(1, f.opacity * 1.25);
        }

        this.backgroundLayers.push(this.snowMid, this.snowFront);
    }
}

export class BonusMap2 extends Background {
    constructor(game) {
        super(game,
            { imageId: 'bonusMap1Background', bgSpeed: 0 },
            { imageId: 'bonusMap1Ground', bgSpeed: 1 },
        );
        this.soundId = 'map3Soundtrack';
    }
}

export class BonusMap3 extends Background {
    constructor(game) {
        super(game,
            { imageId: 'bonusMap1Background', bgSpeed: 0 },
            { imageId: 'bonusMap1Ground', bgSpeed: 1 },
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

                    if (Math.random() <= 0.025) {
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
