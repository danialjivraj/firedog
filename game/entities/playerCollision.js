import { PlayerState } from '../config/constants.js';
import {
    CollisionAnimation, ExplosionCollisionAnimation, PoisonSpitSplash, InkSplashCollision, Blood,
    ElectricityCollision, InkBombCollision, PoisonDropCollision,
    MeteorExplosionCollision, IceSlashCollision, IceTrailCollision, IcyStormBallCollision, SpinningIceBallsCollision,
    PointyIcicleShardCollision, UndergroundIcicleCollision, PurpleThunderCollision,
    DarkExplosionCollision, HealingStarBurstCollision, AsteroidExplosionCollision, GalacticSpikeCollision,
    PurpleFireballCollision, PoisonousOrbCollision,
} from '../animations/collisionAnimation/spriteCollisions.js';
import { GhostFadeOut, DisintegrateCollision, BallParticleBurstCollision } from '../animations/collisionAnimation/proceduralCollisions.js';
import { FloatingMessage } from '../animations/floatingMessages.js';
import { CoinLoss } from '../animations/particles.js';
import {
    AngryBee, Bee, Skulnap, PoisonSpit, Goblin, Sluggie, Voltzeel, Gloomlet, EnemyBoss, Barrier,
    Aura, KarateCroco, SpearFish, LilHornet, Cactrix, BerriflyIceBall, Garry, InkBeam, VolcanoWasp, VolcanicBubble,
    CrystalWasp, DrillIce, Frostling, FrozenShard, Magmapod, ScorpionPoison, LavaBall, Sigilfly, Golex,
    CyanOrb, RedOrb, GreenOrb, BlueOrb, YellowOrb, Lancer, PoisonousOrb, Venarach, Venoblitz, Woxin,
    Bloburn, Mycora, IceSilknoir, Frogula, Johnny, Oculith, Vespion, Ben, Vinelash, Mawrune, Blazice,
    Sigilash, BigGreener,
} from './enemies/enemies.js';
import { InkSplash } from '../animations/ink.js';
import {
    Elyvorg, GhostElyvorg, BlueArrow, YellowArrow, GreenArrow, CyanArrow, PurpleBarrier, ElectricWheel, GravitationalAura,
    InkBomb, PurpleFireball, PoisonDrop, MeteorAttack, PurpleSlash, PurpleThunder, PurpleLaserBeam
} from './enemies/bosses/elyvorg/elyvorg.js';
import { IceTrail, IcyStormBall, IceSlash, SpinningIceBalls, PointyIcicleShard, Glacikal, UndergroundIcicle } from './enemies/bosses/glacikal/glacikal.js';
import {
    NTharax, Kamehameha, HealingBarrier, GalacticSpike, PurpleBallOrb, AntennaeTentacle, YellowBeamOrb, BlackBeamOrb,
    PurpleBeamOrb, PurpleAsteroid, BlueAsteroid, GroundShockwaveRing, SlowLaserBall, PoisonLaserBall, RedLaserBall
} from './enemies/bosses/ntharax/ntharax.js';

const coinFloatingMessageOptions = (game, overrides = {}) => ({
    fontSize: 30,
    textColor: 'yellow',
    iconType: 'coin',
    iconWidth: 24,
    iconHeight: 24,
    iconGap: 6,
    iconPosition: 'left',
    iconOffsetY: -1,
    ...(game.UI.anchors?.coins ?? {}),
    ...overrides,
});

// ======================================================================
// CollisionLogic
// ======================================================================
export class CollisionLogic {
    constructor(game) {
        this.game = game;
        this._fireballHandlers = null;
    }

    // ------------------------------------------------------------------
    // Player helpers that are collision-only
    // ------------------------------------------------------------------
    isRollingOrDiving(player = this.game.player) {
        return player.currentState === player.states[PlayerState.ROLLING] || player.currentState === player.states[PlayerState.DIVING];
    }

    hit(enemy, player = this.game.player) {
        if (player.isInvisible) return;
        if (player.isDashing) return;
        if (player.isInvincible) return;

        if (player.isFrozen) {
            if (enemy.dealsDirectHitDamage) {
                this.game.coins -= 1;
                player.lives -= 1;
                player.isInvincible = true;
                player.invincibleTimer = player.invincibleDuration;
            }
            return;
        }

        if (player.currentState === player.states[PlayerState.SITTING]) {
            player.setState(PlayerState.HIT, 0);
        } else {
            player.setState(PlayerState.HIT, 1);
        }

        if (enemy.dealsDirectHitDamage) {
            this.game.coins -= 1;
            player.lives -= 1;
            player.isInvincible = true;
            player.invincibleTimer = player.invincibleDuration;
        }
    }

    stunned(player = this.game.player) {
        if (player.isInvisible) return;
        if (player.isDashing) return;
        if (player.isInvincible) return;

        if (player.isFrozen) {
            this.game.audioHandler.firedogSFX.playSound('stunnedSound', false, true);
            this.game.coins -= 1;
            player.lives -= 1;
            player.isInvincible = true;
            player.invincibleTimer = player.invincibleDuration;
            return;
        }

        this.game.audioHandler.firedogSFX.playSound('stunnedSound', false, true);
        player.setState(PlayerState.STUNNED, 0);

        this.game.coins -= 1;
        player.lives -= 1;
        player.isInvincible = true;
        player.invincibleTimer = player.invincibleDuration;
    }

    bloodOrPoof(enemy, player = this.game.player) {
        // boss enemies
        if (enemy instanceof EnemyBoss) {
            this.game.collisions.push(
                new Blood(
                    this.game,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5,
                    enemy
                )
            );
            this.game.audioHandler.collisionSFX.playSound('bloodSound', false, true);
            return;
        }

        if (enemy instanceof Barrier) return;

        // normal enemies
        if (enemy.lives >= 1) {
            this.game.collisions.push(
                new Blood(
                    this.game,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5,
                    enemy
                )
            );
            this.game.audioHandler.collisionSFX.playSound('bloodSound', false, true);
        } else {
            this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
            this.game.collisions.push(
                new CollisionAnimation(
                    this.game,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5,
                    player.isBluePotionActive
                )
            );

            if (enemy instanceof Goblin) {
                this.game.audioHandler.enemySFX.playSound('goblinDie', false, true);
            }
        }
    }

    handleFloatingMessages(enemy, player = this.game.player) {
        if (enemy instanceof EnemyBoss) enemy.coinValue = 10;
        if (enemy.lives <= 0 && player.lives === player.previousLives) {
            const coins = enemy.coinValue ?? 1;
            this.game.coins += coins;
            player.energy += 2;
            this.game.floatingMessages.push(
                new FloatingMessage(`+${coins}`, enemy.x + enemy.width / 2, enemy.y, { fontSize: 30, ...this.game.UI.anchors.coins })
            );
        }
    }

    triggerInkSplash(player = this.game.player) {
        if (player.isInvisible || player.isInvincible) return;

        const inkSplash = new InkSplash(this.game);
        inkSplash.x = player.x - inkSplash.getWidth() / 2;
        this.game.collisions.push(inkSplash);
    }

    // slow methods
    tryApplySlow(player = this.game.player, durationMs = 5000) {
        if (player.isInvisible || player.isInvincible) return false;
        player.isSlowed = true;
        player.slowedTimer = durationMs;
        return true;
    }

    // frozen methods
    startFrozen(player = this.game.player, durationMs = 2000) {
        if (player.isInvisible) return false;
        if (this.game.gameOver) return false;
        if (player.currentState?.deathAnimation) return false;

        const wasFrozen = !!player.isFrozen;

        player.isFrozen = true;
        player.frozenTimer = Math.max(player.frozenTimer, durationMs);

        if (player.currentState !== player.states[PlayerState.HIT]) {
            player.setState(PlayerState.HIT, 1);
        }

        player.frameX = 0;
        player.frameTimer = 0;

        player.frozenFrameX = 0;
        player.frozenFrameY = player.frameY;
        player.frozenFrameTimer = 0;
        player.frozenMaxFrame = player.maxFrame;
        player.frozenFacingRight = player.facingRight;

        player.speed = 0;
        player.vx = 0;
        player.vy = 0;

        player.frozenPulseTimer = 0;
        player.frozenOpacity = 0.5;

        player.game.input.keys = [];

        if (!wasFrozen) {
            this.game.audioHandler.firedogSFX.playSound('startFrozen', false, true);
        }

        this.game.audioHandler.firedogSFX.playSound('frozenSound', false, true);

        return true;
    }

    // poison methods
    setPoison(durationMs, player = this.game.player) {
        if (player.isEnergyExhausted || player.isBluePotionActive) {
            player.isPoisonedActive = false;
            player.poisonTimer = 0;
            return false;
        }

        player.isPoisonedActive = true;
        player.poisonTimer = durationMs;
        return true;
    }

    tryApplyPoison(player = this.game.player, durationMs = 2500) {
        if (player.isInvisible || player.isInvincible) {
            player.isPoisonedActive = false;
            player.poisonTimer = 0;
            return false;
        }
        return this.setPoison(durationMs, player);
    }

    // ------------------------------------------------------------------
    // Geometry helpers
    // ------------------------------------------------------------------
    getPlayerRect() {
        const p = this.game.player;
        return { x: p.x, y: p.y, width: p.width, height: p.height };
    }

    getFireballRect(fireball) {
        const size = typeof fireball.size === "number" ? fireball.size : 0;
        return { x: fireball.x, y: fireball.y, width: size, height: size };
    }

    overlapsAABB(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    overlapsWithPlayer(rect) {
        return this.overlapsAABB(rect, this.getPlayerRect());
    }

    isKamehameha(enemy) {
        return !!enemy && (enemy.isKamehameha || enemy instanceof Kamehameha);
    }

    circleIntersectsAABB(cx, cy, r, rect) {
        const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
        const dx = cx - closestX;
        const dy = cy - closestY;
        return (dx * dx + dy * dy) <= r * r;
    }

    closestPointOnSegment(px, py, ax, ay, bx, by) {
        const abx = bx - ax, aby = by - ay;
        const apx = px - ax, apy = py - ay;

        const abLen2 = abx * abx + aby * aby;
        if (abLen2 <= 1e-6) return { x: ax, y: ay, t: 0 };

        let t = (apx * abx + apy * aby) / abLen2;
        t = Math.max(0, Math.min(1, t));

        return { x: ax + abx * t, y: ay + aby * t, t };
    }

    beamHitsRect(beam, rect) {
        if (beam._phase !== "beam") return false;

        const mx = beam.mouthX, my = beam.mouthY;
        const ex = beam.endX, ey = beam.endY;

        const dx = ex - mx, dy = ey - my;
        const len = Math.hypot(dx, dy);
        if (len < 1) return false;

        const ux = dx / len, uy = dy / len;
        const rx = -uy, ry = ux;

        const half = (beam.thickness ?? 42) * 0.5 * 0.55;

        const pts = [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width, y: rect.y },
            { x: rect.x, y: rect.y + rect.height },
            { x: rect.x + rect.width, y: rect.y + rect.height },
            { x: rect.x + rect.width * 0.5, y: rect.y + rect.height * 0.5 },
        ];

        for (const p of pts) {
            const px = p.x - mx;
            const py = p.y - my;

            const localX = px * ux + py * uy;
            const localY = px * rx + py * ry;

            if (localX >= 0 && localX <= len && Math.abs(localY) <= half) {
                return true;
            }
        }

        return (
            this.circleIntersectsAABB(mx, my, half, rect) ||
            this.circleIntersectsAABB(ex, ey, half, rect)
        );
    }

    enemyHitsRect(enemy, targetRect) {
        if (this.isKamehameha(enemy)) return this.beamHitsRect(enemy, targetRect);
        return this.overlapsAABB(
            { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height },
            targetRect
        );
    }

    // ------------------------------------------------------------------
    // Collision FX
    // ------------------------------------------------------------------
    _enemyCenter(enemy) {
        return { x: enemy.x + enemy.width * 0.5, y: enemy.y + enemy.height * 0.5 };
    }

    _playerCenter(player = this.game.player) {
        return { x: player.x + player.width * 0.5, y: player.y + player.height * 0.5 };
    }

    _fireballCenter(fireball) {
        const size = typeof fireball?.size === "number" ? fireball.size : 0;
        return {
            x: (typeof fireball?.x === "number" ? fireball.x : 0) + size * 0.5,
            y: (typeof fireball?.y === "number" ? fireball.y : 0) + size * 0.5,
        };
    }

    playCollisionFx(enemy, ctx = null) {
        const player = this.game.player;
        const fireball = ctx?.fireball || null;
        const fallbackToDefault = !!ctx?.fallbackToDefault;

        const { x: ex, y: ey } = this._enemyCenter(enemy);
        const { y: py } = this._playerCenter(player);
        const { y: fy } = fireball ? this._fireballCenter(fireball) : { y: py };

        const attackerY = fireball ? fy : py;

        switch (true) {
            // ink
            case enemy instanceof Sluggie || enemy instanceof InkBomb || enemy instanceof Garry || enemy instanceof InkBeam: {
                this.game.audioHandler.collisionSFX.playSound('slugExplosion', false, true);

                if (enemy instanceof Sluggie || enemy instanceof Garry || enemy instanceof InkBeam) {
                    this.game.collisions.push(new InkSplashCollision(this.game, ex, ey));
                } else {
                    this.game.collisions.push(new InkBombCollision(this.game, ex, ey));
                }
                return true;
            }

            case enemy instanceof Skulnap: {
                this.game.audioHandler.collisionSFX.playSound('explosionCollision', false, true);
                this.game.collisions.push(
                    new ExplosionCollisionAnimation(this.game, ex, ey, enemy.id)
                );
                return true;
            }

            case enemy instanceof ElectricWheel: {
                this.game.audioHandler.collisionSFX.playSound('elyvorg_electricity_wheel_collision_sound', false, true);
                this.game.collisions.push(new ElectricityCollision(this.game, ex, ey));
                return true;
            }

            case enemy instanceof GravitationalAura: {
                this.game.audioHandler.collisionSFX.playSound('darkExplosionCollisionSound', false, true);
                this.game.collisions.push(new DarkExplosionCollision(this.game, ex, ey));
                return true;
            }

            // slow
            case enemy instanceof IceSilknoir:
            case enemy instanceof DrillIce:
            case enemy instanceof Frostling:
            case enemy instanceof BerriflyIceBall:
            case enemy instanceof FrozenShard:
            case enemy instanceof SpinningIceBalls:
            case enemy instanceof PointyIcicleShard:
            case enemy instanceof UndergroundIcicle:
            case enemy instanceof IceTrail:
            case enemy instanceof IcyStormBall:
            case enemy instanceof BlueArrow:
            case enemy instanceof BlueOrb:
            case enemy instanceof Vespion:
            case enemy instanceof SlowLaserBall: {
                if (enemy instanceof UndergroundIcicle) {
                    this.game.collisions.push(new UndergroundIcicleCollision(this.game, ex, attackerY, enemy.id));
                } else if (enemy instanceof SpinningIceBalls) {
                    this.game.collisions.push(new SpinningIceBallsCollision(this.game, ex, ey, enemy.id));
                } else if (enemy instanceof PointyIcicleShard) {
                    this.game.collisions.push(new PointyIcicleShardCollision(this.game, ex, ey, enemy.id));
                } else if (enemy instanceof IceTrail) {
                    this.game.collisions.push(new IceTrailCollision(this.game, ex, ey, enemy.id));
                } else if (enemy instanceof BlueArrow || enemy instanceof FrozenShard || enemy instanceof BlueOrb || enemy instanceof SlowLaserBall) {
                    this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                } else if (enemy instanceof IcyStormBall) {
                    this.game.collisions.push(new IcyStormBallCollision(this.game, ex, ey, enemy.id));
                } else {
                    this.bloodOrPoof(enemy, player);
                }
                this.game.audioHandler.collisionSFX.playSound('breakingIceNoDamageSound', false, true);
                return true;
            }

            // frozen
            case enemy instanceof CrystalWasp:
            case enemy instanceof IceSlash:
            case enemy instanceof Mawrune:
            case enemy instanceof Blazice:
            case enemy instanceof Lancer:
            case enemy instanceof BlueAsteroid:
            case enemy instanceof CyanArrow:
            case enemy instanceof CyanOrb: {
                if (enemy instanceof IceSlash) {
                    const shouldInvert = enemy.speedX > 0;
                    this.game.collisions.push(new IceSlashCollision(this.game, ex, ey, shouldInvert));
                } else if (enemy instanceof BlueAsteroid || enemy instanceof CyanArrow || enemy instanceof CyanOrb) {
                    this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                } else {
                    this.bloodOrPoof(enemy, player);
                }

                this.game.audioHandler.collisionSFX.playSound('breakingIceNoDamageSound', false, true);
                return true;
            }

            // poison
            case enemy instanceof PoisonousOrb:
            case enemy instanceof PoisonSpit:
            case enemy instanceof PoisonDrop:
            case enemy instanceof GreenArrow:
            case enemy instanceof ScorpionPoison:
            case enemy instanceof GreenOrb:
            case enemy instanceof PoisonLaserBall: {
                this.game.audioHandler.collisionSFX.playSound('poisonDropCollisionSound', false, true);

                if (enemy instanceof PoisonousOrb) {
                    this.game.collisions.push(new PoisonousOrbCollision(this.game, ex, ey));
                } else if (enemy instanceof PoisonSpit) {
                    this.game.collisions.push(new PoisonSpitSplash(this.game, ex, ey));
                } else if (enemy instanceof PoisonDrop) {
                    this.game.collisions.push(new PoisonDropCollision(this.game, ex, ey));
                } else {
                    this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                }

                return true;
            }

            case enemy instanceof PurpleFireball: {
                this.game.audioHandler.collisionSFX.playSound('fireballExplosionSound', false, true);
                this.game.collisions.push(new PurpleFireballCollision(this.game, ex, ey));
                return true;
            }

            // ball projectiles
            case enemy instanceof VolcanicBubble:
            case enemy instanceof RedOrb:
            case enemy instanceof YellowOrb:
            case enemy instanceof LavaBall:
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('ntharaxSplitBeamCollisionSound', false, true);
                return true;

            case enemy instanceof RedLaserBall: {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('fireballExplosionSound', false, true);
                return true;
            }

            // special Y = attacker center Y
            case enemy instanceof PurpleThunder: {
                this.game.audioHandler.collisionSFX.playSound('elyvorg_electricity_wheel_collision_sound', false, true);
                this.game.collisions.push(new PurpleThunderCollision(this.game, ex, attackerY));
                return true;
            }

            case enemy instanceof PurpleLaserBeam: {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('elyvorg_purple_laser_destroyed_sound', false, true);
                return true;
            }

            case enemy instanceof MeteorAttack: {
                this.game.collisions.push(new MeteorExplosionCollision(this.game, ex, ey));
                this.game.audioHandler.collisionSFX.playSound('elyvorg_meteor_in_contact_sound', false, true);
                return true;
            }

            case enemy instanceof YellowArrow: {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
                return true;
            }

            case enemy instanceof PurpleAsteroid: {
                this.game.collisions.push(new AsteroidExplosionCollision(this.game, ex, ey - 70));
                this.game.audioHandler.collisionSFX.playSound('elyvorg_meteor_in_contact_sound', false, true);
                return true;
            }

            case enemy instanceof GalacticSpike: {
                const groundBottom = enemy.groundBottom;
                const clipRect = { x: 0, y: 0, w: this.game.width, h: groundBottom };

                this.game.collisions.push(
                    new GalacticSpikeCollision(this.game, ex, ey, enemy.heightScale, 1, clipRect)
                );

                this.game.audioHandler.collisionSFX.playSound('galacticSpikeCollisionSound', false, true);
                return true;
            }



            case enemy instanceof Kamehameha: {
                const pc = fireball ? this._fireballCenter(fireball) : this._playerCenter(player);
                const hit = this.closestPointOnSegment(
                    pc.x, pc.y,
                    enemy.mouthX, enemy.mouthY,
                    enemy.endX, enemy.endY
                );

                this.game.collisions.push(
                    new BallParticleBurstCollision(this.game, hit.x, hit.y, {
                        color: "#098cf7ff",
                        count: 48,
                        minRadius: 2,
                        maxRadius: 6,
                        minSpeed: 3,
                        maxSpeed: 9,
                        gravity: 0.45,
                        spread: Math.PI * 1.1,
                        duration: 600,
                    })
                );

                this.game.audioHandler.collisionSFX.playSound("ntharaxKamehamehaCollisionSound", false, true);
                return true;
            }

            // special Y = attacker center Y
            case enemy instanceof AntennaeTentacle: {
                const mode2 = !!enemy.mode2Active || !!enemy.mode2;

                this.game.collisions.push(
                    new BallParticleBurstCollision(
                        this.game,
                        ex,
                        attackerY,
                        mode2
                            ? {
                                color: "#fa0b7aff",
                                count: 44,
                                minRadius: 2,
                                maxRadius: 7,
                                minSpeed: 4,
                                maxSpeed: 11,
                                gravity: 0.52,
                                spread: Math.PI * 1.2,
                                duration: 720,
                            }
                            : {
                                color: "#cf0fe9ff",
                                count: 28,
                                minRadius: 2,
                                maxRadius: 6,
                                minSpeed: 3,
                                maxSpeed: 9,
                                gravity: 0.45,
                                spread: Math.PI * 1.1,
                                duration: 600,
                            }
                    )
                );

                this.game.audioHandler.collisionSFX.playSound('ntharaxTentacleCollisionSound', false, true);
                return true;
            }

            case enemy instanceof GhostElyvorg: {
                this.game.collisions.push(new GhostFadeOut(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('elyvorg_ghost_hit_sound_effect', false, true);
                return true;
            }

            case enemy instanceof PurpleBeamOrb:
            case enemy instanceof YellowBeamOrb:
            case enemy instanceof BlackBeamOrb: {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('ntharaxSplitBeamCollisionSound', false, true);
                return true;
            }

            // Explicit "handled but no FX"
            case enemy instanceof GroundShockwaveRing:
            case enemy instanceof PurpleBallOrb:
                return true;

            default: {
                if (fallbackToDefault) {
                    this.bloodOrPoof(enemy, player);
                    return true;
                }
                return false;
            }
        }
    }

    shouldSkipElyvorgTeleportCollision(enemy, player) {
        const boss = this.game.boss && this.game.boss.current;
        if (!(boss instanceof Elyvorg)) return false;

        const isTeleporting = boss.state === 'teleport';
        const inPostTeleportSafeWindow =
            boss.postTeleportSafeTimer && boss.postTeleportSafeTimer > 0;
        const safePhase = isTeleporting || inPostTeleportSafeWindow;

        if (!safePhase) return false;

        const isElyvorgFamily = (enemy instanceof Elyvorg || enemy instanceof PurpleBarrier);
        const playerCanHitDuringSafePhase = this.isRollingOrDiving(player) || player.isDashing;

        return isElyvorgFamily && !playerCanHitDuringSafePhase;
    }

    _playerVulnerableToBarrier(player, canReceiveStatus) {
        return canReceiveStatus && (
            player.isFrozen ||
            player.currentState === player.states[PlayerState.SITTING] ||
            player.currentState === player.states[PlayerState.RUNNING] ||
            player.currentState === player.states[PlayerState.JUMPING] ||
            player.currentState === player.states[PlayerState.FALLING] ||
            player.currentState === player.states[PlayerState.STANDING]
        );
    }

    handleHealingBarrierCollision(barrier, healAmount = 2) {
        if (barrier.lives <= 0) {
            this.game.collisions.push(
                new DisintegrateCollision(this.game, barrier, { followTarget: this.game.boss.current })
            );
        }

        const boss = this.game.boss?.current;
        if (boss && boss.isBarrierActive) {
            const burst = new HealingStarBurstCollision(this.game, boss, {
                followTarget: boss,
                soundId: "healingStarSound",
                playSound: true,
            });
            burst.start();

            boss.healingStarBursts ??= [];
            boss.healingStarBursts.push(burst);

            const overhealCap = boss.maxLives * (1 + (boss.overhealPercent ?? 0));
            boss.lives = Math.min(boss.lives + healAmount, overhealCap);
        }
    }

    // Fireball collision handlers
    get fireballCollisionHandlers() {
        if (this._fireballHandlers) return this._fireballHandlers;

        const player = this.game.player;

        this._fireballHandlers = {
            PurpleFireball: (enemy, fireball) => {
                this.playCollisionFx(enemy, { fireball });

                this.game.floatingMessages.push(
                    new FloatingMessage('+20', enemy.x + enemy.width / 2, enemy.y, { fontSize: 30, textColor: 'cyan', ...this.game.UI.anchors.energy })
                );

                player.energy += 20;

                const msg = Math.random() < 0.5 ? 'NICE!' : 'EPIC!';
                this.game.floatingMessages.push(
                    new FloatingMessage(msg, enemy.x + enemy.width / 2, enemy.y - 20, { fontSize: 50, duration: 1800 })
                );
            },

            // no FX
            PurpleBallOrb: () => { },
            GroundShockwaveRing: () => { },

            // special cases that do extra logic besides FX
            Goblin: (enemy) => {
                this.game.audioHandler.enemySFX.playSound('goblinDie', false, true);
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
                this.game.collisions.push(
                    new CollisionAnimation(
                        this.game,
                        enemy.x + enemy.width * 0.5,
                        enemy.y + enemy.height * 0.5,
                        player.isBluePotionActive
                    )
                );
                enemy.lives = 0;
            },

            // bosses
            Glacikal: (enemy) => {
                enemy.lives--;
                this.bloodOrPoof(enemy, player);
            },

            Elyvorg: (enemy) => {
                if (!enemy.isBarrierActive) {
                    enemy.lives--;
                    this.bloodOrPoof(enemy, player);
                }
            },

            NTharax: (enemy) => {
                if (enemy.isTransforming || enemy.state === "transform") return;
                if (!enemy.isBarrierActive) {
                    enemy.lives--;
                    this.bloodOrPoof(enemy, player);
                }
            },

            // barriers
            HealingBarrier: (barrier) => this.handleHealingBarrierCollision(barrier),

            PurpleBarrier: (enemy) => {
                if (enemy.lives <= 0) {
                    this.game.collisions.push(
                        new DisintegrateCollision(this.game, enemy, { followTarget: this.game.boss.current })
                    );
                }
            },

            default: (enemy, fireball) => {
                this.playCollisionFx(enemy, { fireball, fallbackToDefault: true });
            }
        };

        return this._fireballHandlers;
    }

    // ------------------------------------------------------------------
    // Enemies collision (player vs enemy)
    // ------------------------------------------------------------------
    handleFiredogCollisionWithEnemy(enemy) {
        const player = this.game.player;
        if (this.game.gameOver) return;
        if (enemy.grounded === false) return;
        if (player.isInvincible && !player.isDashing && !this.isRollingOrDiving(player)) return;

        const isAttackState = this.isRollingOrDiving(player);

        if (!player.isDashing && player.collisionCooldowns[enemy.id] > 0) return;

        if (!this.enemyHitsRect(enemy, this.getPlayerRect())) return;

        if (this.isKamehameha(enemy)) {
            if (!player.isDashing) {
                player.collisionCooldowns[enemy.id] = 220;
            }

            this.hit(enemy, player);

            if (player.isDashing) {
                const dashId = player.dashInstanceId;
                if (enemy._lastDashKameFxId === dashId) return;
                enemy._lastDashKameFxId = dashId;
            }

            if (!player.isInvisible || this.isRollingOrDiving(player) || player.isDashing) {
                this.playCollisionFx(enemy);
            }
            return;
        }

        if (!player.isDashing && player.postDashGraceTimer > 0 && !isAttackState) {
            return;
        }

        if (enemy instanceof EnemyBoss) {
            const bossInvulnerable =
                !this.game.bossInFight ||
                this.game.cutsceneActive ||
                (this.game.boss && this.game.boss.talkToBoss) ||
                (this.game.boss && this.game.boss.preFight);

            if (bossInvulnerable) return;
        }

        if (this.shouldSkipElyvorgTeleportCollision(enemy, player)) return;

        if (!player.isDashing && (!player.isInvisible || (player.isInvisible && this.isRollingOrDiving(player)))) {
            player.collisionCooldowns[enemy.id] = 500;

            if (!(enemy instanceof EnemyBoss) && !(enemy instanceof Goblin)) {
                enemy.lives -= 1;
            }
        }

        if (this.isRollingOrDiving(player)) {
            if (player.isBluePotionActive) {
                enemy.lives -= 3;
                this.handleFloatingMessages(enemy, player);
                this.bloodOrPoof(enemy, player);
                return;
            }

            this.handleRollingOrDivingCollision(enemy);
            this.handleFloatingMessages(enemy, player);
            return;
        }

        if (player.isDashing) {
            const dashId = player.dashInstanceId;

            if (enemy instanceof Elyvorg && enemy.isBarrierActive) return;
            if (enemy instanceof NTharax && enemy.isBarrierActive) return;
            if (enemy instanceof NTharax && (enemy.isTransforming || enemy.state === "transform")) return;

            if (enemy._lastDashHitId !== dashId) {
                enemy._lastDashHitId = dashId;
                enemy.lives -= 3;
                this.handleFloatingMessages(enemy, player);
            }

            if (enemy._lastDashEffectId !== dashId) {
                enemy._lastDashEffectId = dashId;
                this.handleNormalCollision(enemy, { treatAsDash: true });
            }
            return;
        }

        this.handleNormalCollision(enemy);
    }

    // fireball vs enemy
    handleFireballCollisionWithEnemy(enemy, enemiesHit) {
        if (enemy.grounded === false) return;
        if (enemy.x >= this.game.width) return;

        const particles = this.game.behindPlayerParticles;
        for (let i = 0; i < particles.length; i++) {
            const fireball = particles[i];
            if (!fireball._isFireball) continue;

            const fireballRect = this.getFireballRect(fireball);
            if (!this.enemyHitsRect(enemy, fireballRect)) continue;

            this.handleSpecificFireballCollisions(fireball, enemy, enemiesHit);
        }
    }

    handleSpecificFireballCollisions(fireball, enemy, enemiesHit) {
        const player = this.game.player;

        if (enemiesHit.has(enemy)) return;
        enemiesHit.add(enemy);

        const isBoss = enemy instanceof EnemyBoss;
        const bossInvulnerable =
            isBoss &&
            (
                this.game.gameOver ||
                !this.game.bossInFight ||
                this.game.cutsceneActive ||
                (this.game.boss && this.game.boss.talkToBoss) ||
                (this.game.boss && this.game.boss.preFight)
            );

        if (bossInvulnerable) {
            fireball.markedForDeletion = true;
            return;
        }

        if (!(enemy instanceof EnemyBoss)) enemy.lives--;

        if (fireball.type === 'normalMode') {
            fireball.markedForDeletion = true;
        }

        const handlers = this.fireballCollisionHandlers;
        const type = enemy.constructor.name;
        (handlers[type] || handlers.default)(enemy, fireball);

        this.handleFloatingMessages(enemy, player);
    }

    // follow collision animations
    updateAllCollisionAnimationPositions() {
        const player = this.game.player;
        const collisions = this.game.collisions;
        const enemies = this.game.enemies;

        for (let i = 0; i < collisions.length; i++) {
            const collision = collisions[i];

            if (collision._isElectricityCollision) {
                // find the electric wheel enemy it tracks
                for (let j = 0; j < enemies.length; j++) {
                    const enemy = enemies[j];
                    if (!enemy._isElectricWheel) continue;

                    const overlaps =
                        collision.x < player.x + player.width &&
                        collision.x + collision.width > player.x &&
                        collision.y < player.y + player.height &&
                        collision.y + collision.height > player.y;

                    if (overlaps) collision.updatePositionWhereCollisionHappened(collision.x, collision.y);
                    else collision.updatePosition(enemy);
                    break;
                }
            } else if (collision._isBlood && collision.enemy) {
                collision.updatePosition(collision.enemy);
            }
        }
    }

    // cooldowns
    updateCollisionCooldowns(deltaTime) {
        const cooldowns = this.game.player.collisionCooldowns;
        for (const enemyId in cooldowns) {
            cooldowns[enemyId] = Math.max(0, cooldowns[enemyId] - deltaTime);
        }
    }

    // ------------------------------------------------------------------
    // Normal collision
    // ------------------------------------------------------------------
    handleNormalCollision(enemy, opts = null) {
        const player = this.game.player;
        const treatAsDash = !!opts?.treatAsDash;

        const canReceiveStatus = !player.isInvisible;
        const canPlayCollisionFx = (!player.isInvisible) || treatAsDash || player.isDashing;

        switch (true) {
            default:
                this.hit(enemy, player);
                if (canPlayCollisionFx) this.bloodOrPoof(enemy, player);
                break;

            // normal enemies with special collision animation
            case enemy instanceof GhostElyvorg:
            case enemy instanceof PurpleFireball:
            case enemy instanceof MeteorAttack:
            case enemy instanceof UndergroundIcicle:
            case enemy instanceof GravitationalAura:
            case enemy instanceof PurpleLaserBeam:
            case enemy instanceof PurpleBallOrb:
            case enemy instanceof AntennaeTentacle:
            case enemy instanceof PurpleBeamOrb:
            case enemy instanceof PurpleAsteroid:
            case enemy instanceof GroundShockwaveRing:
            case enemy instanceof LavaBall:
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy);
                }
                if (canReceiveStatus) {
                    this.hit(enemy, player);
                }
                break;

            // goblin
            case enemy instanceof Goblin: {
                if (treatAsDash || player.isDashing) {
                    enemy.lives = 0;
                    if (canPlayCollisionFx) this.bloodOrPoof(enemy, player);
                    return;
                }

                this.hit(enemy, player);

                if (canPlayCollisionFx) {
                    const maxCoinsToSteal = Math.min(20, this.game.coins);
                    const minCoinsToSteal = Math.min(10, maxCoinsToSteal);
                    const coinsToSteal =
                        Math.floor(Math.random() * (maxCoinsToSteal - minCoinsToSteal + 1)) +
                        minCoinsToSteal;

                    for (let i = 0; i < coinsToSteal; i++) {
                        this.game.particles.push(
                            new CoinLoss(this.game, player.x + player.width * -0.1, player.y)
                        );
                    }

                    if (coinsToSteal > 0) {
                        this.game.audioHandler.enemySFX.playSound('goblinStealing', false, true);
                        this.game.coins -= coinsToSteal;
                        this.game.floatingMessages.push(
                            new FloatingMessage(
                                '-' + coinsToSteal,
                                player.x + player.width / 2,
                                player.y,
                                coinFloatingMessageOptions(this.game, {
                                    textColor: 'red',
                                    coinIconLoss: true,
                                })
                            )
                        );
                    }
                }
                break;
            }

            // ink
            case enemy instanceof Sluggie:
            case enemy instanceof InkBomb:
            case enemy instanceof Garry:
            case enemy instanceof InkBeam:
                if (canReceiveStatus && !player.isDashing && !treatAsDash) {
                    this.triggerInkSplash(player);
                }

                this.hit(enemy, player);

                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy);
                }
                break;

            // stun
            case enemy instanceof Bee:
            case enemy instanceof AngryBee:
            case enemy instanceof VolcanoWasp:
            case enemy instanceof LilHornet:
            case enemy instanceof Voltzeel:
            case enemy instanceof Aura:
            case enemy instanceof Sigilash:
            case enemy instanceof Cactrix:
            case enemy instanceof Johnny:
            // special stun collision
            case enemy instanceof Skulnap:
            case enemy instanceof YellowArrow:
            case enemy instanceof PurpleThunder:
            case enemy instanceof YellowBeamOrb:
            case enemy instanceof GalacticSpike:
            case enemy instanceof YellowOrb: {
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy, { fallbackToDefault: true });
                }

                if (canReceiveStatus && !player.isDashing && !treatAsDash) {
                    this.stunned(player);
                }

                break;
            }

            case enemy instanceof ElectricWheel: {
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy);
                }

                if (canReceiveStatus && !player.isDashing && !treatAsDash) {
                    this.stunned(player);
                }

                if (canPlayCollisionFx) {
                    enemy.lives = 0;
                    player.bossCollisionTimer = 0;
                    player.resetElectricWheelCounters = true;
                }

                break;
            }

            // poison
            case enemy instanceof Ben:
            case enemy instanceof BigGreener:
            case enemy instanceof Vinelash:
            case enemy instanceof Woxin:
            case enemy instanceof Venarach:
            case enemy instanceof Venoblitz:
            case enemy instanceof Oculith:
            case enemy instanceof PoisonousOrb:
            case enemy instanceof PoisonSpit:
            case enemy instanceof PoisonDrop:
            case enemy instanceof GreenArrow:
            case enemy instanceof ScorpionPoison:
            case enemy instanceof Bloburn:
            case enemy instanceof GreenOrb:
            case enemy instanceof PoisonLaserBall: {
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy, { fallbackToDefault: true });
                }

                if (canReceiveStatus && !player.isDashing && !treatAsDash) {
                    const applied = this.tryApplyPoison(player, 2500);
                    this.hit(enemy, player);

                    if (applied) {
                        this.game.audioHandler.enemySFX.playSound('acidSoundEffect', false, true);
                    }
                }
                break;
            }

            // red
            case enemy instanceof Gloomlet:
            case enemy instanceof KarateCroco:
            case enemy instanceof SpearFish:
            case enemy instanceof Mycora:
            case enemy instanceof Magmapod:
            case enemy instanceof VolcanicBubble:
            case enemy instanceof RedOrb:
            case enemy instanceof Sigilfly:
            case enemy instanceof Golex:
            case enemy instanceof Frogula:
            case enemy instanceof RedLaserBall:
                this.hit(enemy, player);
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy, { fallbackToDefault: true });
                }
                break;

            // slow
            case enemy instanceof IceSilknoir:
            case enemy instanceof DrillIce:
            case enemy instanceof Frostling:
            case enemy instanceof FrozenShard:
            case enemy instanceof BerriflyIceBall:
            case enemy instanceof IceTrail:
            case enemy instanceof IcyStormBall:
            case enemy instanceof SpinningIceBalls:
            case enemy instanceof PointyIcicleShard:
            case enemy instanceof BlueArrow:
            case enemy instanceof BlueOrb:
            case enemy instanceof Vespion:
            case enemy instanceof SlowLaserBall: {
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy, { fallbackToDefault: true });
                }

                if (canReceiveStatus && !player.isDashing && !treatAsDash) {
                    const applied = this.tryApplySlow(player, 5000);
                    this.hit(enemy, player);

                    if (applied) {
                        this.game.audioHandler.enemySFX.playSound('iceSlowedSound', false, true);
                    }
                }
                break;
            }

            // frozen
            case enemy instanceof CrystalWasp:
            case enemy instanceof IceSlash:
            case enemy instanceof Mawrune:
            case enemy instanceof Blazice:
            case enemy instanceof Lancer:
            case enemy instanceof BlueAsteroid:
            case enemy instanceof CyanArrow:
            case enemy instanceof CyanOrb: {
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy, { fallbackToDefault: true });
                }

                if (canReceiveStatus && !player.isDashing && !treatAsDash) {
                    const wasInvincible = player.isInvincible;
                    this.hit(enemy, player);
                    if (!wasInvincible) this.startFrozen(player, 2000);
                }

                break;
            }

            // tunnel vision
            case enemy instanceof BlackBeamOrb:
                if (canReceiveStatus && !player.isDashing && !treatAsDash) {
                    this.hit(enemy, player);

                    if (canPlayCollisionFx) {
                        this.playCollisionFx(enemy);
                    }

                    player.triggerTunnelVision({
                        fadeInMs: 1200,
                        holdMs: 2000,
                        expandMs: 0,
                        expandAmount: 0,
                        fadeOutMs: 1200,
                        fadeCircleAlphaWithFadeOut: true,
                    });
                    this.game.audioHandler.powerUpAndDownSFX.playSound('darkHoleLaughSound', false, true);
                } else {
                    if (canPlayCollisionFx) {
                        this.playCollisionFx(enemy);
                    }
                }
                break;

            // boss enemies
            case enemy instanceof Glacikal:
            case enemy instanceof Elyvorg: {
                const isElyvorg = enemy instanceof Elyvorg;

                if (treatAsDash || player.isDashing) {
                    if (!isElyvorg || !enemy.isBarrierActive) {
                        if (canPlayCollisionFx) this.bloodOrPoof(enemy, player);
                    }
                    break;
                }

                if (
                    player.bossCollisionTimer >= player.bossCollisionCooldown &&
                    (!isElyvorg || !enemy.isBarrierActive)
                ) {
                    this.hit(enemy, player);
                    if (canPlayCollisionFx) this.bloodOrPoof(enemy, player);
                }
                break;
            }

            case enemy instanceof NTharax: {
                if (enemy.isTransforming || enemy.state === "transform") break;

                if (enemy.state === 'dive') {
                    if (canReceiveStatus) this.hit(enemy, player);
                    break;
                }

                if (player.bossCollisionTimer >= player.bossCollisionCooldown) {
                    if (canReceiveStatus) this.hit(enemy, player);
                    if (canPlayCollisionFx && !enemy.isBarrierActive) this.bloodOrPoof(enemy, player);
                }
                break;
            }

            // barriers
            case enemy instanceof HealingBarrier: {
                player.bossCollisionTimer = 0;

                if (this._playerVulnerableToBarrier(player, canReceiveStatus)) {
                    this.hit(enemy, player);
                }

                if (canPlayCollisionFx) {
                    const healAmount = (treatAsDash || player.isDashing) ? (3 * 2) : 2;
                    this.handleHealingBarrierCollision(enemy, healAmount);
                }
                break;
            }

            case enemy instanceof PurpleBarrier:
                player.bossCollisionTimer = 0;

                if (this._playerVulnerableToBarrier(player, canReceiveStatus)) {
                    this.hit(enemy, player);
                }

                if (enemy.lives <= 0) {
                    this.game.collisions.push(
                        new DisintegrateCollision(this.game, enemy, { followTarget: this.game.boss.current })
                    );
                }
                break;

            // purple slash
            case enemy instanceof PurpleSlash:
                player.bossCollisionTimer = 0;
                if (canReceiveStatus) this.hit(enemy, player);
                break;
        }
    }

    // ------------------------------------------------------------------
    // Rolling/Diving collision
    // ------------------------------------------------------------------
    handleRollingOrDivingCollision(enemy) {
        const player = this.game.player;

        switch (true) {
            default:
                this.bloodOrPoof(enemy, player);
                break;

            // normal enemies with special collision
            case enemy instanceof GhostElyvorg:
            case enemy instanceof MeteorAttack:
            case enemy instanceof PurpleLaserBeam:
            case enemy instanceof GravitationalAura:
            case enemy instanceof PurpleBeamOrb:
            case enemy instanceof PurpleAsteroid:
            case enemy instanceof LavaBall:
                this.playCollisionFx(enemy);
                break;

            // normal enemies with special collision but damage through rolling or diving
            case enemy instanceof PurpleFireball:
            case enemy instanceof UndergroundIcicle:
            case enemy instanceof PurpleBallOrb:
            case enemy instanceof AntennaeTentacle:
            case enemy instanceof GroundShockwaveRing:
                this.hit(enemy, player);
                this.playCollisionFx(enemy);
                break;

            // goblin
            case enemy instanceof Goblin:
                enemy.lives = 0;
                this.bloodOrPoof(enemy, player);
                break;

            // ink
            case enemy instanceof Sluggie:
            case enemy instanceof InkBomb:
            case enemy instanceof Garry:
            case enemy instanceof InkBeam:
                this.triggerInkSplash(player);
                this.playCollisionFx(enemy);
                break;

            // stun
            case enemy instanceof Bee:
            case enemy instanceof AngryBee:
            case enemy instanceof VolcanoWasp:
            case enemy instanceof Voltzeel:
            case enemy instanceof Aura:
            case enemy instanceof Sigilash:
            case enemy instanceof LilHornet:
            case enemy instanceof Cactrix:
            case enemy instanceof Johnny:
            // special collision
            case enemy instanceof Skulnap:
            case enemy instanceof PurpleThunder:
            case enemy instanceof YellowArrow:
            case enemy instanceof YellowBeamOrb:
            case enemy instanceof GalacticSpike:
            case enemy instanceof YellowOrb: {
                this.playCollisionFx(enemy, { fallbackToDefault: true });

                if (!player.isInvisible) {
                    this.stunned(player);
                }

                break;
            }

            case enemy instanceof ElectricWheel: {
                enemy.lives = 0;

                this.playCollisionFx(enemy);

                if (!player.isInvisible) {
                    this.stunned(player);
                }

                player.resetElectricWheelCounters = true;
                player.bossCollisionTimer = 0;

                break;
            }

            // poison
            case enemy instanceof Ben:
            case enemy instanceof BigGreener:
            case enemy instanceof Vinelash:
            case enemy instanceof Woxin:
            case enemy instanceof Venarach:
            case enemy instanceof Venoblitz:
            case enemy instanceof Oculith:
            case enemy instanceof PoisonousOrb:
            case enemy instanceof PoisonSpit:
            case enemy instanceof PoisonDrop:
            case enemy instanceof GreenArrow:
            case enemy instanceof ScorpionPoison:
            case enemy instanceof Bloburn:
            case enemy instanceof GreenOrb:
            case enemy instanceof PoisonLaserBall: {
                const applied = this.tryApplyPoison(player, 2500);

                if (!player.isInvisible && applied) {
                    this.game.audioHandler.enemySFX.playSound('acidSoundEffect', false, true);
                }

                this.playCollisionFx(enemy, { fallbackToDefault: true });

                break;
            }

            // red
            case enemy instanceof Gloomlet:
            case enemy instanceof KarateCroco:
            case enemy instanceof SpearFish:
            case enemy instanceof Mycora:
            case enemy instanceof Magmapod:
            case enemy instanceof VolcanicBubble:
            case enemy instanceof RedOrb:
            case enemy instanceof Sigilfly:
            case enemy instanceof Golex:
            case enemy instanceof Frogula:
            case enemy instanceof RedLaserBall:
                if (player.currentState === player.states[PlayerState.ROLLING]) this.hit(enemy, player);
                this.playCollisionFx(enemy, { fallbackToDefault: true });
                break;

            // slow
            case enemy instanceof IceSilknoir:
            case enemy instanceof DrillIce:
            case enemy instanceof Frostling:
            case enemy instanceof FrozenShard:
            case enemy instanceof BerriflyIceBall:
            case enemy instanceof IceTrail:
            case enemy instanceof IcyStormBall:
            case enemy instanceof SpinningIceBalls:
            case enemy instanceof PointyIcicleShard:
            case enemy instanceof BlueArrow:
            case enemy instanceof BlueOrb:
            case enemy instanceof Vespion:
            case enemy instanceof SlowLaserBall: {
                const applied = this.tryApplySlow(player, 5000);
                if (applied) {
                    this.game.audioHandler.enemySFX.playSound('iceSlowedSound', false, true);
                }
                this.playCollisionFx(enemy, { fallbackToDefault: true });
                break;
            }

            // frozen
            case enemy instanceof CrystalWasp:
            case enemy instanceof IceSlash:
            case enemy instanceof Mawrune:
            case enemy instanceof Blazice:
            case enemy instanceof Lancer:
            case enemy instanceof BlueAsteroid:
            case enemy instanceof CyanArrow:
            case enemy instanceof CyanOrb: {
                this.playCollisionFx(enemy, { fallbackToDefault: true });

                if (!player.isInvisible) {
                    const wasInvincible = player.isInvincible;
                    this.hit(enemy, player);
                    if (!wasInvincible) this.startFrozen(player, 2000);
                }

                break;
            }

            // tunnel vision
            case enemy instanceof BlackBeamOrb:
                if (!player.isInvisible && !player.isInvincible) {
                    player.triggerTunnelVision({
                        fadeInMs: 1200,
                        holdMs: 2000,
                        expandMs: 0,
                        expandAmount: 0,
                        fadeOutMs: 1200,
                        fadeCircleAlphaWithFadeOut: true,
                    });
                    this.game.audioHandler.powerUpAndDownSFX.playSound('darkHoleLaughSound', false, true);
                }
                this.playCollisionFx(enemy);
                break;

            // boss enemies
            case enemy instanceof Glacikal:
            case enemy instanceof Elyvorg: {
                const isElyvorg = enemy instanceof Elyvorg;

                if (
                    player.bossCollisionTimer >= player.bossCollisionCooldown &&
                    (!isElyvorg || !enemy.isBarrierActive)
                ) {
                    enemy.lives -= 1;
                    this.bloodOrPoof(enemy, player);
                }

                break;
            }

            case enemy instanceof NTharax: {
                if (enemy.isTransforming || enemy.state === "transform") break;

                if (enemy.state === 'dive') {
                    if (!player.isInvisible) {
                        this.hit(enemy, player);
                    } else {
                        if (player.bossCollisionTimer >= player.bossCollisionCooldown && !enemy.isBarrierActive) {
                            enemy.lives -= 1;
                            this.bloodOrPoof(enemy, player);
                        }
                    }
                    break;
                }

                if (player.bossCollisionTimer >= player.bossCollisionCooldown) {
                    if (!enemy.isBarrierActive) {
                        enemy.lives -= 1;
                        this.bloodOrPoof(enemy, player);
                    }
                }
                break;
            }

            // barriers
            case enemy instanceof HealingBarrier: {
                this.handleHealingBarrierCollision(enemy);
                break;
            }

            case enemy instanceof PurpleBarrier:
                player.bossCollisionTimer = 0;
                if (enemy.lives <= 0) {
                    this.game.collisions.push(
                        new DisintegrateCollision(this.game, enemy, { followTarget: this.game.boss.current })
                    );
                }
                break;

            // purple slash
            case enemy instanceof PurpleSlash:
                if (!player.isInvisible) {
                    player.bossCollisionTimer = 0;
                    this.hit(enemy, player);
                }
                break;
        }
    }

    // ------------------------------------------------------------------
    // Power collisions
    // ------------------------------------------------------------------
    handlePowerCollisions() {
        const game = this.game;
        const player = game.player;
        if (game.gameOver) return;

        const overlaps = (item) => this.overlapsWithPlayer(item);

        // power ups
        const upHandlers = {
            OxygenTank(item) {
                game.time -= 10000;
                game.audioHandler.powerUpAndDownSFX.playSound('oxygenTankSound', false, true);
                game.floatingMessages.push(
                    new FloatingMessage('+10s', item.x + item.width / 2, item.y, { fontSize: 30, smallSuffix: true, ...game.UI.anchors.timer })
                );
                game.UI.triggerTimerFlash('yellow');
            },
            HealthLive(item) {
                const previousLives = game.player.lives;
                const nextLives = Math.min(previousLives + 1, game.player.maxLives);

                game.audioHandler.powerUpAndDownSFX.playSound('healthLiveSound', false, true);

                if (nextLives === previousLives) return;

                game.player.lives = nextLives;
                game.floatingMessages.push(
                    new FloatingMessage('+1', item.x + item.width / 2, item.y, {
                        fontSize: 30,
                        textColor: '#2fe917',
                        iconImage: game.UI?.livesImage ?? document.getElementById('firedogHead'),
                        iconWidth: 28,
                        iconHeight: 28,
                        iconGap: 6,
                        iconPosition: 'left',
                        iconOffsetY: -5,
                        iconStrokeFilter: 'brightness(0) saturate(100%) invert(72%) sepia(94%) saturate(1038%) hue-rotate(61deg) brightness(113%) contrast(124%)',
                    })
                );
            },
            Coin(item) {
                game.coins += 10;
                game.floatingMessages.push(
                    new FloatingMessage(
                        '+10',
                        item.x + item.width / 2,
                        item.y,
                        coinFloatingMessageOptions(game)
                    )
                );
                game.audioHandler.powerUpAndDownSFX.playSound('coinSound', false, true);
            },
            RedPotion() {
                game.audioHandler.powerUpAndDownSFX.playSound('redPotionSound', false, true);
                player.isRedPotionActive = true;
                player.redPotionTimer = 15000;
            },
            BluePotion() {
                if (player.currentState === player.states[PlayerState.ROLLING] || player.currentState === player.states[PlayerState.DIVING]) {
                    game.audioHandler.powerUpAndDownSFX.playSound('bluePotionSound', false, true);
                } else {
                    game.audioHandler.powerUpAndDownSFX.playSound('bluePotionSound2', false, true);
                }

                game.audioHandler.firedogSFX.playSound('bluePotionEnergyGoingUp', false, true);
                player.isEnergyExhausted = false;

                if (player.currentState === player.states[PlayerState.ROLLING]) {
                    game.speed = player.bluePotionSpeed;
                }

                player.blueFireTimer = 5000;
                player.isBluePotionActive = true;
            },
            Hourglass() {
                game.audioHandler.powerUpAndDownSFX.playSound('hourglassSound', false, true);
                player.activateHourglass();
            },
            RandomPower(item) {
                const candidates = Object.keys(upHandlers).filter(name => {
                    if (name === 'RandomPower') return false;
                    if (name === 'OxygenTank' && !player.isUnderwater) return false;
                    return true;
                });

                const pickName = candidates[Math.floor(Math.random() * candidates.length)];
                upHandlers[pickName](item);
            }
        };

        // power downs
        const downHandlers = {
            IceDrink() {
                player.isSlowed = true;
                player.slowedTimer = 7000;
                game.audioHandler.powerUpAndDownSFX.playSound('drinkSoundEffect', false, true);
            },
            IceCube() {
                this.startFrozen(player, 3000);
            },
            Cauldron() {
                game.audioHandler.powerUpAndDownSFX.playSound('cauldronSoundEffect', false, true);
                this.setPoison(3500, player);
            },
            BlackHole() {
                player.triggerTunnelVision();
                game.audioHandler.powerUpAndDownSFX.playSound('darkHoleLaughSound', false, true);
            },
            Confuse() {
                game.audioHandler.powerUpAndDownSFX.playSound('statusConfusedSound', false, true);
                player.activateConfuse();
            },
            DeadSkull(item) {
                game.player.lives--;
                player.setState(PlayerState.HIT, 1);
                game.audioHandler.powerUpAndDownSFX.playSound('deadSkullLaugh', false, true);
                game.floatingMessages.push(
                    new FloatingMessage('-1', item.x + item.width / 2, item.y, {
                        fontSize: 30,
                        textColor: '#ff3b30',
                        iconImage: game.UI?.livesImage ?? document.getElementById('firedogHead'),
                        iconWidth: 28,
                        iconHeight: 28,
                        iconGap: 6,
                        iconPosition: 'left',
                        iconOffsetY: -5,
                        iconStrokeFilter: 'brightness(0) saturate(100%) invert(15%) sepia(97%) saturate(7435%) hue-rotate(1deg) brightness(103%) contrast(118%)',
                    })
                );
            },
            CarbonDioxideTank(item) {
                game.time += 10000;
                game.audioHandler.powerUpAndDownSFX.playSound('carbonDioxideTankSound', false, true);
                game.floatingMessages.push(
                    new FloatingMessage('-10s', item.x + item.width / 2, item.y, { fontSize: 30, textColor: '#ff4d4d', smallSuffix: true, ...game.UI.anchors.timer })
                );
                game.UI.triggerTimerFlash('red');
            },
            RandomPower(item) {
                const candidates = Object.keys(downHandlers).filter(name => {
                    if (name === 'RandomPower') return false;
                    if (name === 'CarbonDioxideTank' && !player.isUnderwater) return false;
                    return true;
                });

                const pickName = candidates[Math.floor(Math.random() * candidates.length)];
                downHandlers[pickName].call(this, item);
            }
        };

        const processList = (list, handlers, isPowerDown) => {
            for (const item of list) {
                if (!overlaps(item)) continue;
                if (isPowerDown && player.isInvisible) continue;

                const name = item.constructor.name;
                const handler = handlers[name];
                if (!handler) continue;

                item.markedForDeletion = true;
                handler.call(this, item);
            }
        };

        processList(game.powerUps, upHandlers, false);
        processList(game.powerDowns, downHandlers, true);
    }
}
