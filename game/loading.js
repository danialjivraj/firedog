import { SKIN_MENU_ORDER, COSMETICS, COSMETIC_LAYER_ORDER, getCosmeticChromaConfig } from './config/skinsAndCosmetics.js';

export function startLoadingScreen() {
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
            const chromaCfg = getCosmeticChromaConfig(slot, id);
            let hueDeg = 0;
            if (chromaCfg && Array.isArray(chromaCfg.variants) && chromaCfg.variants.length > 1) {
                const variant = chromaCfg.variants[Math.floor(Math.random() * chromaCfg.variants.length)];
                hueDeg = variant.deg || 0;
            }
            cosmeticLayers.push({ el: document.getElementById(id), hueDeg });
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
            const { el, hueDeg } = cosmeticLayers[i];
            if (el.complete && el.naturalWidth > 0) {
                if (hueDeg) {
                    spriteCtx.save();
                    spriteCtx.filter = `hue-rotate(${hueDeg}deg)`;
                    spriteCtx.drawImage(el, sx, sy, frameW, frameH, 0, 0, 100, 92);
                    spriteCtx.restore();
                } else {
                    spriteCtx.drawImage(el, sx, sy, frameW, frameH, 0, 0, 100, 92);
                }
            }
        }

        loadingSpriteId = requestAnimationFrame(drawLoadingSprite);
    }
    loadingSpriteId = requestAnimationFrame(drawLoadingSprite);

    // warm up chromium's audio pipeline before hiding the loading screen.
    // play a short silent buffer to fully initialize the audio subsystem.
    function warmUpAudio() {
        return new Promise(resolve => {
            const ac = new AudioContext();
            ac.resume().then(() => {
                const buf = ac.createBuffer(1, ac.sampleRate * 0.1, ac.sampleRate);
                const src = ac.createBufferSource();
                src.buffer = buf;
                src.connect(ac.destination);
                src.onended = () => { ac.close().then(resolve).catch(resolve); };
                src.start();
            }).catch(resolve);
        });
    }

    return {
        finish() {
            loadingBar.style.width = '100%';
            loadingPercent.textContent = '100%';
            return warmUpAudio().then(() => {
                cancelAnimationFrame(loadingSpriteId);
                loadingScreen.style.display = 'none';
            });
        },
    };
}
