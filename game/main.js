import { Game } from './game-main.js';
import { preShake, postShake } from './animations/shake.js';
import { fadeIn } from './animations/fading.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FADE_IN_DELAY_MS, FADE_IN_COMPLETE_MS, GameState } from './config/constants.js';
import { SKIN_MENU_ORDER, COSMETICS, COSMETIC_LAYER_ORDER } from './config/skinsAndCosmetics.js';

const loadingBar = document.getElementById('loading-bar');
const loadingPercent = document.getElementById('loading-percent');
const loadingScreen = document.getElementById('loading-screen');

const images = document.querySelectorAll('img');
const audios = document.querySelectorAll('audio');
const totalAssets = images.length + audios.length;
let loadedAssets = 0;

function updateLoadingProgress() {
    loadedAssets++;
    const percent = Math.round((loadedAssets / totalAssets) * 100);
    loadingBar.style.width = percent + '%';
    loadingPercent.textContent = percent + '%';
}

for (const img of images) {
    if (img.complete) {
        loadedAssets++;
    } else {
        img.addEventListener('load', updateLoadingProgress, { once: true });
        img.addEventListener('error', updateLoadingProgress, { once: true });
    }
}

for (const audio of audios) {
    if (audio.readyState >= 4) {
        loadedAssets++;
    } else {
        audio.addEventListener('canplaythrough', updateLoadingProgress, { once: true });
        audio.addEventListener('error', updateLoadingProgress, { once: true });
    }
}

const initialPercent = Math.round((loadedAssets / totalAssets) * 100);
loadingBar.style.width = initialPercent + '%';
loadingPercent.textContent = initialPercent + '%';

const randomSkinId = SKIN_MENU_ORDER[Math.floor(Math.random() * SKIN_MENU_ORDER.length)];
const skinImg = document.getElementById(randomSkinId);

const cosmeticLayers = [];
for (let i = 0; i < COSMETIC_LAYER_ORDER.length; i++) {
    if (Math.random() < 0.4) {
        const slot = COSMETIC_LAYER_ORDER[i];
        const items = Object.keys(COSMETICS[slot]).filter(k => k !== 'none');
        const id = items[Math.floor(Math.random() * items.length)];
        cosmeticLayers.push(document.getElementById(id));
    }
}

const spriteCanvas = document.getElementById('loading-sprite');
const spriteCtx = spriteCanvas.getContext('2d');
const frameW = 100;
const frameH = 91.6;
const sy = 3 * frameH;
const maxFrame = 8;
let frameX = 0;
let spriteTimer = 0;
let lastSpriteTime = 0;
const spriteInterval = 1000 / 31;
let loadingSpriteId = 0;
const hasSkin = skinImg && skinImg.complete && skinImg.naturalWidth > 0;

function drawLoadingSprite(timeStamp) {
    if (!lastSpriteTime) lastSpriteTime = timeStamp;
    const delta = timeStamp - lastSpriteTime;
    lastSpriteTime = timeStamp;
    spriteTimer += delta > spriteInterval ? spriteInterval : delta;

    if (spriteTimer >= spriteInterval) {
        spriteTimer -= spriteInterval;
        frameX = frameX < maxFrame ? frameX + 1 : 0;
    }

    spriteCtx.clearRect(0, 0, 100, 92);

    const sx = frameX * frameW;

    if (hasSkin) {
        spriteCtx.drawImage(skinImg, sx, sy, frameW, frameH, 0, 0, 100, 92);
    }
    for (let i = 0; i < cosmeticLayers.length; i++) {
        const cos = cosmeticLayers[i];
        if (cos.complete && cos.naturalWidth > 0) {
            spriteCtx.drawImage(cos, sx, sy, frameW, frameH, 0, 0, 100, 92);
        }
    }

    loadingSpriteId = requestAnimationFrame(drawLoadingSprite);
}
loadingSpriteId = requestAnimationFrame(drawLoadingSprite);

window.addEventListener("load", function () {
    loadingBar.style.width = '100%';
    loadingPercent.textContent = '100%';
    cancelAnimationFrame(loadingSpriteId);
    loadingScreen.style.display = 'none';

    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const game = new Game(canvas, canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp) {
        const rawDelta = timeStamp - lastTime;
        lastTime = timeStamp;
        const deltaTime = rawDelta > 100 ? 100 : rawDelta;
        game.deltaTime = deltaTime;

        game.updateGlobalOverlays(deltaTime);

        switch (game.gameState) {
            case GameState.CUTSCENE: {
                if (game.fadingIn) {
                    if (!game.fadingInInitiated) {
                        game.fadingInInitiated = true;
                        game.waitForFadeInOpacity = true;
                        canvas.style.opacity = 0;
                        setTimeout(() => {
                            game.fadingIn = false;
                            game.fadingInInitiated = false;
                            fadeIn(canvas, FADE_IN_DELAY_MS, () => { });
                        }, FADE_IN_DELAY_MS);
                        setTimeout(() => {
                            game.waitForFadeInOpacity = false;
                        }, FADE_IN_COMPLETE_MS);
                    }
                } else {
                    game.currentCutscene.draw(ctx);
                    game.metaToasts.forEach(t => t.draw(ctx));
                    game.coinConvertToasts.forEach(t => t.draw(ctx));

                    if (game.menu.pause.isPaused && game.currentMenu) {
                        game.currentMenu.menuActive = true;
                        game.currentMenu.draw(ctx);
                        game.currentMenu.update(deltaTime);
                        game.metaToasts.forEach(t => t.draw(ctx));
                        game.coinConvertToasts.forEach(t => t.draw(ctx));
                    }
                }
                break;
            }

            case GameState.MENU: {
                game.isPlayerInGame = false;
                game.currentMenu.menuActive = true;
                game.currentMenu.draw(ctx);
                game.currentMenu.update(deltaTime);
                game.metaToasts.forEach(t => t.draw(ctx));
                game.coinConvertToasts.forEach(t => t.draw(ctx));
                break;
            }

            case GameState.GAMEPLAY: {
                game.update(deltaTime);

                const canShake =
                    game.shakeActive &&
                    !game.menu.pause.isPaused &&
                    game.tutorial.tutorialPause === false;

                if (canShake) preShake(ctx);
                game.draw(ctx);
                if (canShake) postShake(ctx);

                if (game.distortionActive || game.distortionEffect.amount > 0.01) {
                    game.distortionEffect.apply(ctx);
                }

                game.UI.draw(ctx);

                if (game.currentMenu) {
                    game.currentMenu.menuActive = true;
                    game.currentMenu.draw(ctx);
                    game.currentMenu.update(deltaTime);
                }

                game.metaToasts.forEach(t => t.draw(ctx));
                game.coinConvertToasts.forEach(t => t.draw(ctx));
                break;
            }
        }

        requestAnimationFrame(animate);
    }
    animate(0);
});
