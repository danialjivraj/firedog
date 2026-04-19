import { Game } from './game-main.js';
import { preShake, postShake } from './animations/shake.js';
import { fadeIn } from './animations/fading.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FADE_IN_DELAY_MS, FADE_IN_COMPLETE_MS, GameState } from './config/constants.js';

window.addEventListener("load", function () {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const game = new Game(canvas, canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

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
                game.deltaTime = deltaTime;
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
