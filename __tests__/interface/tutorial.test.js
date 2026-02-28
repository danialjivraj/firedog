import { Tutorial } from '../../game/interface/tutorial';
import { fadeInAndOut } from '../../game/animations/fading';

jest.mock('../../game/animations/fading', () => ({
    fadeInAndOut: jest.fn(),
}));

describe('Tutorial', () => {
    let game;
    let tutorial;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();

        game = {
            width: 1920,
            height: 689,
            groundMargin: 80,

            saveGameState: jest.fn(),

            canvas: { style: { opacity: 1 } },

            player: {
                x: 100,
                y: 0,
                vy: 0,
                vx: 0,
                speed: 0,
                height: 91.3,
                isEnergyExhausted: false,
                fireballTimer: 0,
                fireballCooldown: 0,
                invisibleTimer: 0,
                invisibleCooldown: 5,
                energy: 50,
                onGround: jest.fn(() => true),
                clearAllStatusEffects: jest.fn(),
                setState: jest.fn(),
            },

            enemies: [],
            particles: [],
            behindPlayerParticles: [],
            collisions: [],
            floatingMessages: [],

            menu: {
                pause: { isPaused: false },
                levelDifficulty: { setDifficulty: jest.fn() },
            },

            audioHandler: {
                firedogSFX: {
                    pauseAllSounds: jest.fn(),
                    resumeAllSounds: jest.fn(),
                    stopAllSounds: jest.fn(),
                },
                enemySFX: {
                    pauseAllSounds: jest.fn(),
                    resumeAllSounds: jest.fn(),
                    stopAllSounds: jest.fn(),
                },
                collisionSFX: {
                    pauseAllSounds: jest.fn(),
                    resumeAllSounds: jest.fn(),
                    stopAllSounds: jest.fn(),
                },
            },

            input: { keys: [] },

            selectedDifficulty: 'Hard',
            coins: 123,
            time: 12435,

            isTutorialActive: true,
            isPlayerInGame: true,
            currentMap: 'Map1',

            enterDuringBackgroundTransition: true,
        };

        tutorial = new Tutorial(game);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('createSpawnEnemy', () => {
        class DummyEnemy {
            constructor(gameArg) {
                this.game = gameArg;
                this.y = 0;
                this.width = 50;
            }
        }

        test('does not spawn when enemies already exist', () => {
            game.enemies = [new DummyEnemy(game)];
            tutorial.spawnTimer = undefined;
            tutorial.createSpawnEnemy(DummyEnemy, 500);
            expect(game.enemies).toHaveLength(1);
        });

        test('does not spawn before 2000ms accumulated', () => {
            game.enemies = [];
            tutorial.spawnTimer = undefined;
            tutorial.createSpawnEnemy(DummyEnemy, 500);
            tutorial.createSpawnEnemy(DummyEnemy, 1000);
            expect(game.enemies).toHaveLength(0);
        });

        test('spawns after accumulated time >= 2000ms', () => {
            game.enemies = [];
            tutorial.spawnTimer = undefined;
            tutorial.createSpawnEnemy(DummyEnemy, 1200);
            tutorial.createSpawnEnemy(DummyEnemy, 1000);
            expect(game.enemies).toHaveLength(1);
            expect(game.enemies[0]).toBeInstanceOf(DummyEnemy);
            expect(tutorial.spawnTimer).toBeUndefined();
        });

        test('applies initialY and additionalConfig when provided', () => {
            game.enemies = [];
            tutorial.spawnTimer = undefined;
            const config = { lives: 3 };
            tutorial.createSpawnEnemy(DummyEnemy, 2500, 123, config);
            const spawned = game.enemies[0];
            expect(spawned.y).toBe(123);
            expect(spawned.lives).toBe(3);
        });
    });

    describe('skipToLastStepWithFade', () => {
        test('does nothing when not active on Map1', () => {
            game.currentMap = 'Map2';
            tutorial.skipToLastStepWithFade();
            expect(fadeInAndOut).not.toHaveBeenCalled();
        });

        test('does nothing when already skipping', () => {
            tutorial._skipInProgress = true;
            tutorial.skipToLastStepWithFade();
            expect(fadeInAndOut).not.toHaveBeenCalled();
        });

        test('does nothing when already on last step', () => {
            tutorial.currentStepIndex = tutorial.steps.length - 1;
            tutorial.skipToLastStepWithFade();
            expect(fadeInAndOut).not.toHaveBeenCalled();
        });

        test('calls fadeInAndOut, blocks input during transition, and resets state during black', () => {
            const fadeOutMs = 200;
            const blackMs = 300;
            const fadeInMs = 200;

            game.behindPlayerParticles = [{ a: 1 }];
            game.particles = [{ b: 2 }];
            game.collisions = [{ c: 3 }];
            game.enemies = [{ d: 4 }];
            game.floatingMessages = [{ e: 5 }];

            const lastIndex = tutorial.steps.length - 1;
            const lastStep = tutorial.steps[lastIndex];
            const resetSpy = jest.spyOn(lastStep, 'resetGameValues');

            fadeInAndOut.mockImplementation((canvas, outMs, blkMs, inMs, done) => {
                done && done();
            });

            game.enterDuringBackgroundTransition = true;

            tutorial.currentStepIndex = 0;
            tutorial.skipToLastStepWithFade(fadeOutMs, blackMs, fadeInMs);

            expect(tutorial._skipInProgress).toBe(false);
            expect(game.enterDuringBackgroundTransition).toBe(true);
            expect(fadeInAndOut).toHaveBeenCalledWith(
                game.canvas,
                fadeOutMs,
                blackMs,
                fadeInMs,
                expect.any(Function)
            );

            jest.advanceTimersByTime(fadeOutMs);

            expect(game.canvas.style.opacity).toBe(0);

            expect(game.audioHandler.firedogSFX.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.enemySFX.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.collisionSFX.stopAllSounds).toHaveBeenCalled();

            expect(game.behindPlayerParticles).toEqual([]);
            expect(game.particles).toEqual([]);
            expect(game.collisions).toEqual([]);
            expect(game.enemies).toEqual([]);
            expect(game.floatingMessages).toEqual([]);

            expect(game.input.keys).toEqual([]);

            expect(game.player.clearAllStatusEffects).toHaveBeenCalled();
            expect(game.player.speed).toBe(0);
            expect(game.player.vx).toBe(0);
            expect(game.player.vy).toBe(0);

            expect(game.player.x).toBe(0);
            expect(game.player.y).toBe(game.height - game.player.height - game.groundMargin);

            expect(game.player.setState).toHaveBeenCalledWith(0, 0);

            expect(tutorial.currentStepIndex).toBe(lastIndex);
            expect(tutorial.tutorialPause).toBe(true);
            expect(tutorial.elapsedTime).toBe(0);
            expect(tutorial.cooldownTime).toBe(0);

            expect(resetSpy).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        test('returns early if menu paused', () => {
            game.menu.pause.isPaused = true;
            tutorial.tutorialPause = true;
            tutorial.update(1000);
            expect(game.audioHandler.firedogSFX.pauseAllSounds).not.toHaveBeenCalled();
        });

        test('stays paused if cooldown elapsed but no key pressed', () => {
            tutorial.currentStepIndex = 0;
            tutorial.tutorialPause = true;
            tutorial.cooldownTime = 300;
            game.input.keys = [];
            tutorial.update(0);
            expect(tutorial.tutorialPause).toBe(true);
        });

        test('transition from pause to running after cooldown and key press', () => {
            tutorial.currentStepIndex = 0;
            tutorial.tutorialPause = true;
            game.input.keys = ['Enter'];
            tutorial.update(100);
            tutorial.update(200);
            expect(tutorial.tutorialPause).toBe(false);
            expect(game.audioHandler.firedogSFX.pauseAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.enemySFX.pauseAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.collisionSFX.pauseAllSounds).toHaveBeenCalled();
        });

        test('resumes sounds when unpaused', () => {
            tutorial.tutorialPause = false;
            tutorial.update(0);
            expect(game.audioHandler.firedogSFX.resumeAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.enemySFX.resumeAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.collisionSFX.resumeAllSounds).toHaveBeenCalled();
        });

        test('spawnEnemy called for MeatSoldier on step 4 → 5', () => {
            tutorial.currentStepIndex = 4;
            tutorial.tutorialPause = false;
            const spy = jest.spyOn(tutorial, 'createSpawnEnemy');
            tutorial.update(150);
            const [ctor, dt] = spy.mock.calls[0];
            expect(ctor.name).toBe('MeatSoldier');
            expect(dt).toBe(150);
        });

        test('spawnEnemy called for Dotter on step 5 → 6', () => {
            tutorial.currentStepIndex = 5;
            tutorial.tutorialPause = false;
            const spy = jest.spyOn(tutorial, 'createSpawnEnemy');
            tutorial.update(200);
            const [ctor, dt, initialY] = spy.mock.calls[0];
            expect(ctor.name).toBe('Dotter');
            expect(dt).toBe(200);
            expect(initialY).toBe(game.height - 400);
        });

        test('spawnEnemy called for SpearFish on step 18 → 19', () => {
            tutorial.currentStepIndex = 18;
            tutorial.tutorialPause = false;
            const spy = jest.spyOn(tutorial, 'createSpawnEnemy');
            tutorial.update(300);
            const [ctor, dt, initY, cfg] = spy.mock.calls[0];
            expect(ctor.name).toBe('SpearFish');
            expect(dt).toBe(300);
            expect(initY).toBeNull();
            expect(cfg).toEqual({ lives: 1 });
        });

        test('spawnEnemy called for Piper on step 20 → 21', () => {
            tutorial.currentStepIndex = 20;
            tutorial.tutorialPause = false;
            const spy = jest.spyOn(tutorial, 'createSpawnEnemy');
            tutorial.update(400);
            const [ctor, dt] = spy.mock.calls[0];
            expect(ctor.name).toBe('Piper');
            expect(dt).toBe(400);
        });

        test('progresses to next step when time ≥ timer & condition true', () => {
            tutorial.currentStepIndex = 0;
            tutorial.tutorialPause = false;
            tutorial.update(1000);
            expect(tutorial.currentStepIndex).toBe(1);
            expect(tutorial.tutorialPause).toBe(true);
        });

        test('does not advance when elapsedTime < timerDuration', () => {
            tutorial.currentStepIndex = 0;
            tutorial.tutorialPause = false;
            tutorial.update(500);
            expect(tutorial.currentStepIndex).toBe(0);
        });

        test('does not advance when condition false', () => {
            tutorial.currentStepIndex = 2;
            tutorial.tutorialPause = false;
            game.player.onGround = jest.fn(() => false);
            tutorial.update(1000);
            expect(tutorial.currentStepIndex).toBe(2);
        });

        test('invokes resetGameValues and applies side-effects on last step', () => {
            const last = tutorial.steps.length - 1;
            tutorial.currentStepIndex = last - 1;
            tutorial.tutorialPause = false;
            tutorial.update(6000);
            expect(game.player.clearAllStatusEffects).toHaveBeenCalled();
            expect(game.menu.levelDifficulty.setDifficulty).toHaveBeenCalledWith(game.selectedDifficulty);
            expect(game.coins).toBe(0);
            expect(game.time).toBe(0);
            expect(game.player.energy).toBe(100);
            expect(tutorial.tutorialPause).toBe(true);
        });

        test('disables tutorial active after final step', () => {
            const last = tutorial.steps.length - 1;
            tutorial.currentStepIndex = last;
            tutorial.tutorialPause = false;

            game.saveGameState.mockClear();

            tutorial.update(0);

            expect(game.isTutorialActive).toBe(false);
            expect(tutorial.tutorialPause).toBe(true);
            expect(game.saveGameState).toHaveBeenCalled();
        });
    });

    describe('isPlayerNearEnemy', () => {
        test('returns false if no enemy', () => {
            expect(tutorial.isPlayerNearEnemy(null, 100)).toBe(false);
        });

        test('returns true when within distance and on-screen', () => {
            const enemy = { x: 150, width: 50 };
            game.player.x = 100;
            game.width = 300;
            expect(tutorial.isPlayerNearEnemy(enemy, 100)).toBe(true);
        });

        test('returns false when too far or off-screen', () => {
            const enemy = { x: 500, width: 10 };
            game.player.x = 100;
            game.width = 400;
            expect(tutorial.isPlayerNearEnemy(enemy, 100)).toBe(false);
            const off = { x: 350, width: 100 };
            expect(tutorial.isPlayerNearEnemy(off, 100)).toBe(false);
        });
    });

    describe('isPlayerAtApproximateDistanceFromEnemy', () => {
        test('returns false if no enemy', () => {
            expect(tutorial.isPlayerAtApproximateDistanceFromEnemy(null, 100)).toBe(false);
        });

        test('returns true when within [distance-gap, distance+gap] and on-screen', () => {
            const enemy = { x: 200, width: 10 };
            game.player.x = 100;
            game.width = 400;
            expect(tutorial.isPlayerAtApproximateDistanceFromEnemy(enemy, 100)).toBe(true);
        });

        test('returns false when outside approximate range or off-screen', () => {
            const enemy = { x: 300, width: 10 };
            game.player.x = 100;
            game.width = 400;
            expect(tutorial.isPlayerAtApproximateDistanceFromEnemy(enemy, 100)).toBe(false);
            const off = { x: 150, width: 300 };
            expect(tutorial.isPlayerAtApproximateDistanceFromEnemy(off, 50)).toBe(false);
        });

        test('returns true with custom gap', () => {
            const enemy = { x: 900, width: 10 };
            game.player.x = 100;
            game.width = 2000;
            expect(tutorial.isPlayerAtApproximateDistanceFromEnemy(enemy, 800, 20)).toBe(true);
        });
    });

    describe('draw', () => {
        let ctx, fills, strokes;

        beforeEach(() => {
            fills = [];
            strokes = [];
            ctx = {
                save: jest.fn(),
                restore: jest.fn(),
                measureText: jest.fn(() => ({ width: 10 })),
                fillText: (text, x, y) => fills.push({ text, style: ctx.fillStyle }),
                strokeText: (text, x, y) => strokes.push({ text, style: ctx.strokeStyle }),
                fillStyle: '',
                strokeStyle: '',
                font: '',
                textAlign: '',
                textBaseline: '',
                lineWidth: 0,
            };
        });

        test('renders text tokens when paused with correct colors (includes Tab)', () => {
            tutorial.tutorialPause = true;
            tutorial.currentStepIndex = 0;
            tutorial.draw(ctx);

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();

            const tkn = fills.find((c) => c.text === 'Tutorial');
            expect(tkn.style).toBe(tutorial.phraseColors['Tutorial'].fill);

            const en = fills.find((c) => c.text === 'Enter');
            expect(en.style).toBe(tutorial.phraseColors['Enter'].fill);

            const tab = fills.find((c) => c.text === 'Tab');
            expect(tab.style).toBe(tutorial.phraseColors['Tab'].fill);
        });

        test('does not render when not paused', () => {
            tutorial.tutorialPause = false;
            tutorial.draw(ctx);
            expect(ctx.save).not.toHaveBeenCalled();
            expect(fills).toHaveLength(0);
        });
    });
});