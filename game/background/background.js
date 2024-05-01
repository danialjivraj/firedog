const SCALE_FACTOR = 1000;
class Layer {
    constructor(game, width, height, speedModifier, image) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.speedModifier = speedModifier;
        this.image = image;
        this.x = 0;
        this.y = 0;
        this.groundSpeed = 0;
        this.isRaining = false;
    }

    update() {
        this.groundSpeed = this.game.speed * this.speedModifier;
        this.x -= this.groundSpeed;

        // check if the first image is completely out of view
        if (this.x <= -this.width) {
            this.x += this.width;
        }
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        // draws the second image seamlessly following the first one
        context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    }
}

export class Background {
    constructor(game, ...layers) {
        this.game = game;
        this.width = this.game.width;
        this.height = this.game.height;
        this.totalDistanceTraveled = 0;
        this.soundId;
        this.backgroundLayers = layers.map(item => {
            const image = document.getElementById(item.imageId);

            if (item.hasOwnProperty('maxBackgroundEntities')) {
                return new EntityAnimation(this.game, this.width, this.height, []);
            } else {
                return new Layer(this.game, this.width, this.height, item.speedModifier, image);
            }
        });
        this.soundPlayed = false;
    }
    update(deltaTime) {
        if (!this.soundPlayed) {
            if (!this.game.cabin.isFullyVisible && !this.game.isElyvorgFullyVisible) {
                this.game.audioHandler.mapSoundtrack.playSound(this.soundId, true);
                this.soundPlayed = true;
            }
        } else {
            if (this.game.cabin.isFullyVisible || this.game.isElyvorgFullyVisible) {
                this.game.audioHandler.mapSoundtrack.fadeOutAndStop(this.soundId);
                this.soundPlayed = false;
            }
        }

        let lastGroundLayer = null;

        for (let i = this.backgroundLayers.length - 1; i >= 0; i--) {
            const layer = this.backgroundLayers[i];
            if (!this.game.cabin.isFullyVisible && !this.game.isElyvorgFullyVisible) {
                // if cabin or elyvorg aren't visible, the layers are updated
                layer.update(deltaTime);
                if (layer.speedModifier === 1 && !lastGroundLayer) {
                    lastGroundLayer = layer;
                }
            } else {
                layer.groundSpeed = 0;
                if (layer instanceof EntityAnimation || layer instanceof RaindropAnimation) {
                    layer.update(deltaTime);
                }
            }
        }

        if (lastGroundLayer) {
            this.totalDistanceTraveled += this.game.speed / SCALE_FACTOR;
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
            { imageId: 'map1Background', speedModifier: 0 },
            { imageId: 'map1Trees7', speedModifier: 0.1 },
            { imageId: 'map1Trees1', speedModifier: 0.2 },
            { imageId: 'map1Trees2', speedModifier: 0.3 },
            { imageId: 'map1Trees5', speedModifier: 0.35 },
            { imageId: 'map1Trees3', speedModifier: 0.4 },
            { imageId: 'map1Trees4', speedModifier: 0.5 },
            { imageId: 'map1Rocks', speedModifier: 0.6 },
            { imageId: 'map1Bush', speedModifier: 0.65 },
            { imageId: 'map1Trees6', speedModifier: 0.7 },
            { imageId: 'map1Ground', speedModifier: 1 }),
            this.soundId = 'map1Soundtrack';

        const entityAnimationLayer = new EntityAnimation(game, this.width, this.height, [], 5);
        const entityAnimationLayer2 = new EntityAnimation(game, this.width, this.height, [], 5);
        const entityAnimationLayer3 = new EntityAnimation(game, this.width, this.height, [], 5);
        const entityAnimationLayer4 = new EntityAnimation(game, this.width, this.height, [], 5);
        const entityAnimationLayer5 = new EntityAnimation(game, this.width, this.height, [], 5);

        this.backgroundLayers.splice(2, 0, entityAnimationLayer);
        this.backgroundLayers.splice(5, 0, entityAnimationLayer2);
        this.backgroundLayers.splice(7, 0, entityAnimationLayer3);
        this.backgroundLayers.splice(10, 0, entityAnimationLayer4);
        this.backgroundLayers.splice(14, 0, entityAnimationLayer5);
    }
}

export class Map2 extends Background {
    constructor(game) {
        super(
            game,
            { imageId: 'map2Background', speedModifier: 0 },
            { imageId: 'map2CityLights2', speedModifier: 0.1 },
            { imageId: 'map2CityLights1', speedModifier: 0.2 },
            { imageId: 'map2Trees1', speedModifier: 0.4 },
            { imageId: 'map2Ground', speedModifier: 1 },
        );
        this.soundId = 'map2Soundtrack';

        const entityAnimationLayer = new EntityAnimation(game, this.width, this.height, [], 5);
        const entityAnimationLayer2 = new EntityAnimation(game, this.width, this.height, [], 5);

        this.backgroundLayers.splice(3, 0, entityAnimationLayer);
        this.backgroundLayers.splice(5, 0, entityAnimationLayer2);
    }
}

export class Map3 extends Background {
    constructor(game) {
        super(
            game,
            { imageId: 'map3Background', speedModifier: 0 },
            { imageId: 'map3BackgroundRocks', speedModifier: 0 },
            { imageId: 'map3seaPlants3', speedModifier: 0.15 },
            { imageId: 'map3seaPlants1', speedModifier: 0.2 },
            { imageId: 'map3seaPlants2', speedModifier: 0.3 },
            { imageId: 'map3seaPlants4', speedModifier: 0.4 },
            { imageId: 'map3seaPlants6', speedModifier: 0.45 },
            { imageId: 'map3seaPlants5', speedModifier: 0.5 },
            { imageId: 'map3seaPlants7', speedModifier: 0.54 },
            { imageId: 'map3Ground', speedModifier: 1 }
        );
        this.soundId = 'map3Soundtrack';

        const entityAnimationLayer = new EntityAnimation(game, this.width, this.height, [], 4);
        const entityAnimationLayer2 = new EntityAnimation(game, this.width, this.height, [], 4);
        const entityAnimationLayer3 = new EntityAnimation(game, this.width, this.height, [], 3);
        const entityAnimationLayer4 = new EntityAnimation(game, this.width, this.height, [], 3);
        const entityAnimationLayer5 = new EntityAnimation(game, this.width, this.height, [], 3);

        this.backgroundLayers.splice(1, 0, entityAnimationLayer);
        this.backgroundLayers.splice(3, 0, entityAnimationLayer2);
        this.backgroundLayers.splice(5, 0, entityAnimationLayer3);
        this.backgroundLayers.splice(7, 0, entityAnimationLayer4);
        this.backgroundLayers.splice(9, 0, entityAnimationLayer5);
    }
}

export class Map4 extends Background {
    constructor(game) {
        super(game,
            { imageId: 'map4Background', speedModifier: 0 },
            { imageId: 'map4BottomVines', speedModifier: 0.3 },
            { imageId: 'map4Trees3', speedModifier: 0.34 },
            { imageId: 'map4Trees4', speedModifier: 0.38 },
            { imageId: 'map4Trees2', speedModifier: 0.42 },
            { imageId: 'map4Trees1', speedModifier: 0.55 },
            { imageId: 'map4TopVines', speedModifier: 0.92 },
            { imageId: 'map4Ground', speedModifier: 1 }
        );
        this.soundId = 'map4Soundtrack';

        const entityAnimationLayer = new EntityAnimation(game, this.width, this.height, [], 6);
        const entityAnimationLayer2 = new EntityAnimation(game, this.width, this.height, [], 6);
        const entityAnimationLayer3 = new EntityAnimation(game, this.width, this.height, [], 6);

        this.backgroundLayers.splice(1, 0, entityAnimationLayer);
        this.backgroundLayers.splice(4, 0, entityAnimationLayer2);
        this.backgroundLayers.splice(8, 0, entityAnimationLayer3);
    }
}

export class Map5 extends Background {
    constructor(game) {
        super(
            game,
            { imageId: 'map5Background', speedModifier: 0 },
            { imageId: 'map5Trees5', speedModifier: 0.3 },
            { imageId: 'map5Trees2', speedModifier: 0.32 },
            { imageId: 'map5Trees4', speedModifier: 0.34 },
            { imageId: 'map5Trees3', speedModifier: 0.4 },
            { imageId: 'map5Trees1', speedModifier: 0.44 },
            { imageId: 'map5Bush2', speedModifier: 0.5 },
            { imageId: 'map5Bush1', speedModifier: 0.54 },
            { imageId: 'map5Flowers2', speedModifier: 0.6 },
            { imageId: 'map5Flowers1', speedModifier: 0.7 },
            { imageId: 'map5Ground', speedModifier: 1 }
        );
        this.soundId = 'map5Soundtrack';

        const entityAnimationLayer = new EntityAnimation(game, this.width, this.height, [], 5);
        const entityAnimationLayer2 = new EntityAnimation(game, this.width, this.height, [], 7);
        const entityAnimationLayer3 = new EntityAnimation(game, this.width, this.height, [], 5);
        const entityAnimationLayer4 = new EntityAnimation(game, this.width, this.height, [], 4);
        const entityAnimationLayer5 = new EntityAnimation(game, this.width, this.height, [], 5);
        const entityAnimationLayer6 = new EntityAnimation(game, this.width, this.height, [], 10);

        this.backgroundLayers.splice(1, 0, entityAnimationLayer);
        this.backgroundLayers.splice(4, 0, entityAnimationLayer2);
        this.backgroundLayers.splice(7, 0, entityAnimationLayer3);
        this.backgroundLayers.splice(9, 0, entityAnimationLayer4);
        this.backgroundLayers.splice(11, 0, entityAnimationLayer5);
        this.backgroundLayers.splice(15, 0, entityAnimationLayer6);

        const raindropAnimationLayer = new RaindropAnimation(game, this.width, this.height, 100);
        this.backgroundLayers.push(raindropAnimationLayer);
    }

    update(deltaTime) {
        super.update(deltaTime);
        let raindropLayer = this.backgroundLayers.find(layer => layer instanceof RaindropAnimation);
        if (this.totalDistanceTraveled > 30 && this.totalDistanceTraveled <= 60 ||
            this.totalDistanceTraveled > 120 && this.totalDistanceTraveled <= 160 ||
            this.totalDistanceTraveled > 250 && this.totalDistanceTraveled <= 290 ||
            this.totalDistanceTraveled > 330) {
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
            { imageId: 'map6Background', speedModifier: 0 },
            { imageId: 'map6rocks2', speedModifier: 0.3 },
            { imageId: 'map6rocks1', speedModifier: 0.5 },
            { imageId: 'map6cactus', speedModifier: 0.6 },
            { imageId: 'map6spikeStones', speedModifier: 0.7 },
            { imageId: 'map6Ground', speedModifier: 1 },
        );
        this.soundId = 'map6Soundtrack';
    }
}

export class EntityAnimation {
    constructor(game, width, height, backgroundEntities, maxBackgroundEntities) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.maxBackgroundEntities = maxBackgroundEntities;
        this.backgroundEntities = backgroundEntities;
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

            // chooses a random fish image
            const randomFishIndex = Math.floor(Math.random() * this.fishImages.length);
            const fishImage = this.fishImages[randomFishIndex];

            const fish = {
                fishImage: fishImage,
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 2,
                speed: Math.random() * 0.15 + 0.01,
                opacity: 1,
                directionX: Math.random() > 0.5 ? directionX : -directionX,
                directionY: Math.random() > 0.5 ? directionY : -directionY,
            };
            this.backgroundEntities.push(fish);
        }
    }

    update(deltaTime) {
        const accelerationFactor = 3;
        for (let i = 0; i < this.backgroundEntities.length; i++) {
            const backgroundEntity = this.backgroundEntities[i];

            backgroundEntity.y += backgroundEntity.speed * backgroundEntity.directionY * deltaTime;

            if ((!this.game.cabin.isFullyVisible)) {
                if (backgroundEntity.directionX > 0 && this.game.player.isUnderwater) {
                    backgroundEntity.x += backgroundEntity.speed * backgroundEntity.directionX * deltaTime;
                } else {
                    if (this.game.player.currentState === this.game.player.states[7] && this.game.player.speed == 0 &&
                        this.game.player.previousState === this.game.player.states[0]) {
                        backgroundEntity.x += backgroundEntity.speed * backgroundEntity.directionX * deltaTime;
                    } else if ((this.game.player.currentState === this.game.player.states[7] && this.game.player.speed > 0)
                        || (this.game.player.currentState === this.game.player.states[7] && !this.game.input.keys['d'])) {
                        backgroundEntity.x += backgroundEntity.speed * backgroundEntity.directionX * deltaTime - accelerationFactor;
                    } else if (this.game.player.isBluePotionActive && this.game.player.currentState === this.game.player.states[4]) {
                        if (this.game.player.isUnderwater) {
                            backgroundEntity.x += backgroundEntity.speed * backgroundEntity.directionX * deltaTime - accelerationFactor * 1.5;
                        } else {
                            backgroundEntity.x += backgroundEntity.speed * backgroundEntity.directionX * deltaTime - accelerationFactor * 4.5;
                        }
                    } else if (this.game.player.currentState === this.game.player.states[4]) {
                        if (this.game.player.isUnderwater) {
                            backgroundEntity.x += backgroundEntity.speed * backgroundEntity.directionX * deltaTime - accelerationFactor * 1.2;
                        } else {
                            backgroundEntity.x += backgroundEntity.speed * backgroundEntity.directionX * deltaTime - accelerationFactor * 2.5;
                        }
                    } else if (this.game.player.currentState === this.game.player.states[1] ||
                        this.game.player.currentState === this.game.player.states[2] ||
                        this.game.player.currentState === this.game.player.states[3]) {
                        backgroundEntity.x += backgroundEntity.speed * backgroundEntity.directionX * deltaTime - accelerationFactor;
                    } else {
                        backgroundEntity.x += backgroundEntity.speed * backgroundEntity.directionX * deltaTime;
                    }
                }
            } else {
                backgroundEntity.x += backgroundEntity.speed * backgroundEntity.directionX * deltaTime;
            }

            if (backgroundEntity.x < 0 || backgroundEntity.x > this.width || backgroundEntity.y < 0 || backgroundEntity.y > this.height - 119) {
                this.backgroundEntities.splice(i, 1);

                const angle = Math.random() * (Math.PI / 6);
                const directionX = Math.random() > 0.5 ? -Math.cos(angle) : Math.cos(angle);
                const directionY = Math.sin(angle);

                const randomFishIndex = Math.floor(Math.random() * this.fishImages.length);
                const fishImage = this.fishImages[randomFishIndex];

                const spawnX = backgroundEntity.directionX > 0 ? -Math.random() * this.width * 0.5 : this.width + Math.random() * this.width * 0.5;
                const newEntity = {
                    fishImage: fishImage,
                    x: spawnX,
                    y: Math.random() * (this.height - 119),
                    radius: 2,
                    speed: Math.random() * 0.15 + 0.01,
                    opacity: 1,
                    directionX: directionX,
                    directionY: Math.random() > 0.5 ? directionY : -directionY,
                };
                this.backgroundEntities.push(newEntity);
                i--;
            } else {
                backgroundEntity.opacity = 1 - Math.abs((backgroundEntity.y - 570 / 2) / (570 / 2));
                backgroundEntity.opacity = Math.max(0, Math.min(1, backgroundEntity.opacity));

                const edgeFadeDistance = 20;
                const distanceToLeftEdge = backgroundEntity.x;
                const distanceToRightEdge = this.width - backgroundEntity.x;
                const edgeOpacity = Math.min(1, Math.min(distanceToLeftEdge, distanceToRightEdge) / edgeFadeDistance);
                backgroundEntity.opacity *= edgeOpacity;
            }
        }
    }

    draw(context) {
        if (this.game.player.isUnderwater) {
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
        } else {
            context.fillStyle = '#ecc45e';
            for (let i = 0; i < this.backgroundEntities.length; i++) {
                const firefly = this.backgroundEntities[i];
                context.globalAlpha = firefly.opacity;
                context.beginPath();
                context.arc(firefly.x, firefly.y, firefly.radius, 0, Math.PI * 2);
                context.fill();
            }
        }
        context.globalAlpha = 1;
    }
}

export class RaindropAnimation {
    constructor(game, width, height, maxRaindrops) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.maxRaindrops = maxRaindrops;
        this.raindrops = [];
        this.isRaining = false;
        this.splashes = [];

        this.createRaindrops();
    }

    createRaindrops() {
        for (let i = 0; i < this.maxRaindrops; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
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

                if (raindrop.y > this.height) {
                    raindrop.y = 0;
                    raindrop.x = Math.random() * this.width;

                    if (Math.random() <= 0.025) {
                        const splashAnimation = new RaindropSplashAnimation(this.game, raindrop.x, this.height - 70);
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
            // draws raindrops
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
        this.speedModifier = 1;
    }
    calculateRandomY() {
        return this.game.background.height - Math.random() * 25 - 55;
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
        this.groundSpeed = this.game.speed * this.speedModifier;
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
