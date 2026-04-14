export class AudioHandler {
  constructor(game) {
    this.game = game;
    this.soundsMapping = {};
    this.sounds = {};
    this._state = {};
    this.initializeSounds();
  }

  initializeSounds() {
    for (const soundName in this.soundsMapping) {
      this.sounds[soundName] = this._loadSound(soundName);
    }
  }

  _loadSound(soundName) {
    const soundId = this.soundsMapping[soundName];
    const el = document.getElementById(soundId);
    if (!el) {
      console.error(`Audio element with ID '${soundId}' not found.`);
      return null;
    }
    el.addEventListener('ended', () => {
      if (this._state[soundName]) delete this._state[soundName].pausedAt;
    });
    return el;
  }

  // play
  playSound(soundName, loop = false, currentTimeZero = false, opts = {}) {
    const el = this.sounds[soundName];
    if (!el) return null;

    const { playbackRate = 1.0 } = opts;
    el.playbackRate = playbackRate;
    el.loop = loop;

    if (currentTimeZero) {
      if (!loop) el.pause();
      el.currentTime = 0;
    }

    const p = el.play();
    if (p && typeof p.catch === 'function') p.catch(() => { });

    return el;
  }

  // stop
  stopAllSounds() {
    for (const soundName in this.soundsMapping) this.stopSound(soundName);
  }

  stopSound(soundName) {
    const el = this.sounds[soundName];
    if (!el) return;

    this._clearFade(soundName);

    el.pause();
    el.currentTime = 0;

    const saved = this._state[soundName];
    if (saved && typeof saved.originalVolume === 'number') {
      el.volume = saved.originalVolume;
    }

    delete this._state[soundName];
  }

  // pause / resume
  pauseAllSounds() {
    for (const soundName in this.soundsMapping) this.pauseSound(soundName);
  }

  pauseSound(soundName) {
    const el = this.sounds[soundName];
    if (!el || el.paused) return;

    const wasFading = !!(this._state[soundName]?.fadeIntervalId);
    if (wasFading) this._clearFade(soundName, true);

    el.pause();
    if (!this._state[soundName]) this._state[soundName] = {};
    this._state[soundName].pausedAt = el.currentTime;
  }

  resumeAllSounds() {
    for (const soundName in this.soundsMapping) this.resumeSound(soundName);
  }

  resumeSound(soundName) {
    const el = this.sounds[soundName];
    if (!el || !el.paused) return;

    const saved = this._state[soundName];
    const pausedAt = saved?.pausedAt;
    if (pausedAt === undefined) return;

    delete saved.pausedAt;

    if (isNaN(el.duration) || pausedAt >= el.duration) return;
    if (!el.loop && pausedAt < 0.02) return;

    // pause() cancels any lingering interrupted play() promise before resuming.
    el.pause();
    el.currentTime = pausedAt;
    const p = el.play();
    if (p && typeof p.catch === 'function') p.catch(() => { });

    // if this sound was mid-fade when paused, resume the fade.
    if (saved?.resumeFade) {
      delete saved.resumeFade;
      this.fadeOutAndStop(soundName);
    }
  }

  // fade
  fadeOutAndStop(soundName, duration = 1000) {
    const el = this.sounds[soundName];
    if (!el || el.paused) return;

    this._clearFade(soundName);

    if (!this._state[soundName]) this._state[soundName] = {};
    const saved = this._state[soundName];

    if (typeof saved.originalVolume !== 'number') {
      saved.originalVolume = el.volume;
    }

    const startVolume = el.volume;
    if (startVolume <= 0) {
      this.stopSound(soundName);
      return;
    }

    const stepMs = 50;
    const steps = Math.max(1, Math.ceil(duration / stepMs));
    const stepSize = startVolume / steps;

    saved.fadeIntervalId = setInterval(() => {
      const next = Math.max(0, el.volume - stepSize);
      if (next > 0) {
        el.volume = next;
      } else {
        this.stopSound(soundName);
      }
    }, stepMs);
  }

  fadeOutAndStopAllSounds(duration = 1000) {
    for (const soundName in this.soundsMapping) {
      const el = this.sounds[soundName];
      if (!el) continue;
      if (el.paused) { this.stopSound(soundName); continue; }
      this.fadeOutAndStop(soundName, duration);
    }
  }

  // helpers
  // keepPausedFlag: true when pausing mid-fade, marks it to resume after unpausew
  _clearFade(soundName, keepPausedFlag = false) {
    const saved = this._state[soundName];
    if (!saved?.fadeIntervalId) return;
    clearInterval(saved.fadeIntervalId);
    delete saved.fadeIntervalId;
    if (keepPausedFlag) saved.resumeFade = true;
  }

  isPlaying(soundName) {
    const el = this.sounds[soundName];
    return !!(el && !el.paused);
  }

  getSoundsMapping() {
    return this.soundsMapping;
  }
}

export class MenuAudioHandler extends AudioHandler {
  constructor(game) {
    super(game);
    this.soundsMapping = {
      criminalitySoundtrack: 'criminalitySoundtrack',
      shinySkinRizzSound: 'shinySkinRizzSound',
      optionSelectedSound: 'optionSelectedSound',
      optionHoveredSound: 'optionHoveredSound',
      mapOpening: 'mapOpening',
      enemyLoreOpenBookSound: 'enemyLoreOpenBookSound',
      enemyLoreCloseBookSound: 'enemyLoreCloseBookSound',
      bookFlipBackwardSound: 'bookFlipBackwardSound',
      bookFlipForwardSound: 'bookFlipForwardSound',
      enemyLoreSwitchTabSound: 'enemyLoreSwitchTabSound',
      purchaseCompletedSound: 'purchaseCompletedSound',
    };
    this.initializeSounds();
  }
}

export class CutsceneDialogueAudioHandler extends AudioHandler {
  constructor(game) {
    super(game);
    this.soundsMapping = {
      bit1: '8bit1',
      bit2: '8bit2',

    };
    this.initializeSounds();
  }
}

export class CutsceneSFXAudioHandler extends AudioHandler {
  constructor(game) {
    super(game);
    this.soundsMapping = {
      cashOut: 'cashOut',
      doorOpening: 'doorOpening',
      battleStarting: 'battleStarting',
      submarineDoorOpening: 'submarineDoorOpening',
      walkingCutsceneSound: 'walkingCutsceneSound',
      slashSound: 'slashSound',
      dreamSound: 'dreamSound',
      flashbackStart: 'flashbackStart',
      flashbackEnd: 'flashbackEnd',
      insertingCrypticToken: 'insertingCrypticToken',
      cutsceneMapOpening: 'cutsceneMapOpening',
      waterSplashSound: 'waterSplashSound',
      sorcererEnteringMindSound: 'sorcererEnteringMindSound',
      sorcererTeleportBackSound: 'sorcererTeleportBackSound',
      sorcererWaterSpellSound: 'sorcererWaterSpellSound',
      sorcererDoubleJumpSpellSound: 'sorcererDoubleJumpSpellSound',
      submarineRevving: 'submarineRevving',
      tremorSound: 'tremorSound',
      insidePortalSound: 'insidePortalSound',
      fallingOutOfPortalSound: 'fallingOutOfPortalSound',
      touchingPortalSound: 'touchingPortalSound',
      ntharaxExplosionSound: 'ntharaxExplosionSound',
      ntharaxGrowl: 'ntharaxGrowl',
    };
    this.initializeSounds();
  }
}

export class CutsceneMusicAudioHandler extends AudioHandler {
  constructor(game) {
    super(game);
    this.soundsMapping = {
      cracklingMountainCampfirewithRelaxingRiver: 'cracklingMountainCampfirewithRelaxingRiver',
      onTheBeachAtDusk: 'onTheBeachAtDusk',
      exaleDeskant: 'exaleDeskant',
      inTheFuture: 'inTheFuture',
      planetsParalysis: 'planetsParalysis',
      iSawSomethingAgain: 'iSawSomethingAgain',
      ohNo: 'ohNo',
      thePowerOfDarkness: 'thePowerOfDarkness',
      downADarkPath: 'downADarkPath',
      blizzardWindFireplace: 'blizzardWindFireplace',
      echoesOfTime: 'echoesOfTime',
      windBreezeSound: 'windBreezeSound',
      birdsChirping: 'birdsChirping',
      submarineSonarUnderwaterSound: 'submarineSonarUnderwaterSound',
      crypticTokenDarkAmbienceSound: 'crypticTokenDarkAmbienceSound',
      unboundPurpose: 'unboundPurpose',
      bubblingVolcanoLavaSound: 'bubblingVolcanoLavaSound',
      groundShakingSound: 'groundShakingSound',
      gta4Theme: 'gta4Theme',
      darkTensionRisingSound: 'darkTensionRisingSound',
      tundraSuite: 'tundraSuite',
      portalTremorSound: 'portalTremorSound',
      hidingInTheDarkSuspense: 'hidingInTheDarkSuspense',
      portalHummingSound: 'portalHummingSound',
      insideGlassChamberBubbleSound: 'insideGlassChamberBubbleSound',
    };
    this.initializeSounds();
  }
}

export class MapSoundtrackAudioHandler extends AudioHandler {
  constructor(game) {
    super(game);
    this.soundsMapping = {
      newRecordSound: 'newRecordSound',
      map1Soundtrack: 'map1Soundtrack',
      map2Soundtrack: 'map2Soundtrack',
      map3Soundtrack: 'map3Soundtrack',
      map4Soundtrack: 'map4Soundtrack',
      map5Soundtrack: 'map5Soundtrack',
      map6Soundtrack: 'map6Soundtrack',
      map7Soundtrack: 'map7Soundtrack',
      bonusMap1Soundtrack: 'bonusMap1Soundtrack',
      bonusMap2Soundtrack: 'bonusMap2Soundtrack',
      bonusMap3Soundtrack: 'bonusMap3Soundtrack',
      glacikalBattleTheme: 'glacikalBattleTheme',
      elyvorgBattleTheme: 'elyvorgBattleTheme',
      ntharaxBattleTheme: 'ntharaxBattleTheme',
      timeTickingSound: 'timeTickingSound',
      rainSound: 'rainSound',
    };
    this.initializeSounds();
  }
}

export class FiredogAudioHandler extends AudioHandler {
  constructor(game) {
    super(game);
    this.soundsMapping = {
      //player
      bluePotionEnergyGoingUp: 'bluePotionEnergyGoingUp',
      rollingSFX: 'rollingSFX',
      rollingUnderwaterSFX: 'rollingUnderwaterSFX',
      fireballSFX: 'fireballSFX',
      fireballRedPotionActiveSFX: 'fireballRedPotionActiveSFX',
      fireballUnderwaterSFX: 'fireballUnderwaterSFX',
      fireballUnderwaterRedPotionSFX: 'fireballUnderwaterRedPotionSFX',
      divingSFX: 'divingSFX',
      runningSFX1: 'runningSFX1',
      runningSFX2: 'runningSFX2',
      jumpSFX: 'jumpSFX',
      fallingSFX: 'fallingSFX',
      deathFall: 'deathFall',
      gettingHit: 'gettingHit',
      stunnedSound: 'stunnedSound',
      energyExhaustedSound: 'energyExhaustedSound',
      invisibleInSFX: 'invisibleInSFX',
      invisibleOutSFX: 'invisibleOutSFX',
      dash1: 'dash1',
      dash2: 'dash2',
      barkSound: 'barkSound',
      frozenSound: 'frozenSound',
    };
    this.initializeSounds();
  }
}

export class PowerUpAndDownSFXAudioHandler extends AudioHandler {
  constructor(game) {
    super(game);
    this.soundsMapping = {
      //power up
      coinSound: 'coinSound',
      bluePotionSound: 'bluePotionSound',
      bluePotionSound2: 'bluePotionSound2',
      redPotionSound: 'redPotionSound',
      hourglassSound: 'hourglassSound',
      healthLiveSound: 'healthLiveSound',
      oxygenTankSound: 'oxygenTankSound',
      //power down
      drinkSoundEffect: 'drinkSoundEffect',
      cauldronSoundEffect: 'cauldronSoundEffect',
      darkHoleLaughSound: 'darkHoleLaughSound',
      statusConfusedSound: 'statusConfusedSound',
      deadSkullLaugh: 'deadSkullLaugh',
      carbonDioxideTankSound: 'carbonDioxideTankSound',
    };
    this.initializeSounds();
  }
}

export class CollisionSFXAudioHandler extends AudioHandler {
  constructor(game) {
    super(game);
    this.soundsMapping = {
      bloodSound: 'bloodSound',
      poofSound: 'poofSound',
      explosionCollision: 'explosionCollision',
      darkExplosionCollisionSound: 'darkExplosionCollisionSound',
      slugExplosion: 'slugExplosion',
      fireballExplosionSound: 'fireballExplosionSound',
      poisonDropCollisionSound: 'poisonDropCollisionSound',
      galacticSpikeCollisionSound: 'galacticSpikeCollisionSound',
      ntharaxTentacleCollisionSound: 'ntharaxTentacleCollisionSound',
      ntharaxKamehamehaCollisionSound: 'ntharaxKamehamehaCollisionSound',
      ntharaxSplitBeamCollisionSound: 'ntharaxSplitBeamCollisionSound',
      elyvorg_meteor_in_contact_sound: 'elyvorg_meteor_in_contact_sound',
      elyvorg_meteor_in_contact_with_ground_sound: 'elyvorg_meteor_in_contact_with_ground_sound',
      elyvorg_electricity_wheel_collision_sound: 'elyvorg_electricity_wheel_collision_sound',
      breakingIceNoDamageSound: 'breakingIceNoDamageSound',
      elyvorg_ghost_hit_sound_effect: 'elyvorg_ghost_hit_sound_effect',
      elyvorg_purple_laser_destroyed_sound: 'elyvorg_purple_laser_destroyed_sound',
    };
    this.initializeSounds();
  }
}

export class EnemySFXAudioHandler extends AudioHandler {
  constructor(game) {
    super(game);
    this.soundsMapping = {
      // elyvorg sounds
      elyvorg_laser_attack_sound: 'elyvorg_laser_attack_sound',
      elyvorg_meteor_attack_sound: 'elyvorg_meteor_attack_sound',
      elyvorg_ghost_attack_sound: 'elyvorg_ghost_attack_sound',
      elyvorg_meteor_falling_sound: 'elyvorg_meteor_falling_sound',
      elyvorg_shield_up_sound: 'elyvorg_shield_up_sound',
      elyvorg_shield_crack_1_sound: 'elyvorg_shield_crack_1_sound',
      elyvorg_shield_crack_2_sound: 'elyvorg_shield_crack_2_sound',
      elyvorg_shield_crack_3_sound: 'elyvorg_shield_crack_3_sound',
      elyvorg_electricity_wheel_sound: 'elyvorg_electricity_wheel_sound',
      elyvorg_electricity_wheel_warning_sound: 'elyvorg_electricity_wheel_warning_sound',
      elyvorg_gravitational_aura_release_sound_effect: 'elyvorg_gravitational_aura_release_sound_effect',
      elyvorg_gravitational_aura_sound_effect: 'elyvorg_gravitational_aura_sound_effect',
      elyvorg_ink_bomb_sound: 'elyvorg_ink_bomb_sound',
      elyvorg_ink_bomb_throw_sound: 'elyvorg_ink_bomb_throw_sound',
      elyvorg_purple_fireball_sound_effect: 'elyvorg_purple_fireball_sound_effect',
      elyvorg_purple_thunder_sound_effect: 'elyvorg_purple_thunder_sound_effect',
      elyvorg_purple_thunder_attack_sound_effect_1: 'elyvorg_purple_thunder_attack_sound_effect_1',
      elyvorg_purple_thunder_attack_sound_effect_2: 'elyvorg_purple_thunder_attack_sound_effect_2',
      elyvorg_poison_drop_indicator_sound: 'elyvorg_poison_drop_indicator_sound',
      elyvorg_poison_drop_rain_sound: 'elyvorg_poison_drop_rain_sound',
      elyvorg_slash_attack_sound: 'elyvorg_slash_attack_sound',
      elyvorg_slash_warning_sound: 'elyvorg_slash_warning_sound',
      elyvorg_arrow_attack_sound: 'elyvorg_arrow_attack_sound',
      elyvorg_teleport_sound_effect: 'elyvorg_teleport_sound_effect',
      // glacikal sounds
      iceTrailSound: 'iceTrailSound',
      iceSlashSound: 'iceSlashSound',
      iceSpiderSound: 'iceSpiderSound',
      glacikalJumpSound: 'glacikalJumpSound',
      glacikalRunSound: 'glacikalRunSound',
      spinningIceBallsSound: 'spinningIceBallsSound',
      undergroundIcicleSound: 'undergroundIcicleSound',
      // ntharax sounds
      burrowInSound: 'burrowInSound',
      burrowOutSound: 'burrowOutSound',
      healingStarSound: 'healingStarSound',
      ntharaxWingFlapSound: 'ntharaxWingFlapSound',
      ntharaxWindGustSound: 'ntharaxWindGustSound',
      whileInAirSound: 'whileInAirSound',
      ntharaxWingFlapFly1Sound: 'ntharaxWingFlapFly1Sound',
      ntharaxWingFlapFly2Sound: 'ntharaxWingFlapFly2Sound',
      purpleChargeSound: 'purpleChargeSound',
      purpleReleaseSound: 'purpleReleaseSound',
      yellowChargeSound: 'yellowChargeSound',
      yellowReleaseSound: 'yellowReleaseSound',
      blackChargeSound: 'blackChargeSound',
      blackReleaseSound: 'blackReleaseSound',
      distortionChargeSound: 'distortionChargeSound',
      galacticSpikeEmergingSound: 'galacticSpikeEmergingSound',
      galacticSpikeRetractSound: 'galacticSpikeRetractSound',
      purpleBallOrbStartSound: 'purpleBallOrbStartSound',
      purpleBallOrbLaunchSound: 'purpleBallOrbLaunchSound',
      distortionStartSound: 'distortionStartSound',
      distortionEndSound: 'distortionEndSound',
      diveFallingSound: 'diveFallingSound',
      diveImpactSound: 'diveImpactSound',
      kamehamehaBeamAttackSound: 'kamehamehaBeamAttackSound',
      kamehamehaBeamChargeSound: 'kamehamehaBeamChargeSound',
      laserBallSound: 'laserBallSound',
      slapGroundSound: 'slapGroundSound',
      tentacleEmergeSound: 'tentacleEmergeSound',
      tentacleRetractSound: 'tentacleRetractSound',
      mode2TranformationSound: 'mode2TranformationSound',
      mode2ExplosionSound: 'mode2ExplosionSound',
      bossJumpingSound: 'bossJumpingSound',
      bossLandingSound: 'bossLandingSound',
      bossRunningSound: 'bossRunningSound',
      //projectiles
      windAttackAudio: 'windAttackAudio',
      tornadoAudio: 'tornadoAudio',
      leafAttackAudio: 'leafAttackAudio',
      laserAttackAudio: 'laserAttackAudio',
      acidSoundEffect: 'acidSoundEffect',
      spitSound: 'spitSound',
      staticSound: 'staticSound',
      rockAttackSound: 'rockAttackSound',
      iceSlowedSound: 'iceSlowedSound',
      //enemies
      //ground rumble
      groundRumbleSound: 'groundRumbleSound',
      //goblito
      goblinDie: 'goblinDie',
      goblinStealing: 'goblinStealing',
      goblinRunSound: 'goblinRunSound',
      goblinJumpSound: 'goblinJumpSound',
      //dotter, lilHornet, citrifly, berrifly, lazyMosquito
      buzzingFly: 'buzzingFly',
      //meatSoldier
      meatSoldierSound: 'meatSoldierSound',
      //abyssaw
      spinningChainsaw: 'spinningChainsaw',
      //geargle
      helicopterSound: 'helicopterSound',
      //moonsect
      moonsectFlapAudio: 'moonsectFlapAudio',
      //lunny
      ravenSingleFlap: 'ravenSingleFlap',
      //walterTheGhost
      ghostHmAudio: 'ghostHmAudio',
      //skelly
      skellyJumpSound: 'skellyJumpSound',
      //bee
      beeBuzzing: 'beeBuzzing',
      //angryBee, volcanoWasp
      angryBeeBuzzing: 'angryBeeBuzzing',
      //gloomlet
      gloomletHumming: 'gloomletHumming',
      //dolly
      auraSoundEffect: 'auraSoundEffect',
      dollHumming: 'dollHumming',
      //jerry
      throwingBombSound: 'throwingBombSound',
      kiteSound: 'kiteSound',
      //duskPlant, bigGreener
      teethChatteringSound: 'teethChatteringSound',
      //skulnap
      fuseSound: 'fuseSound',
      skeletonRattlingSound: 'skeletonRattlingSound',
      //sluggie, snailey
      slimyWalkSound: 'slimyWalkSound',
      //silknoir
      nightSpiderSound: 'nightSpiderSound',
      //toxhop
      frogSound: 'frogSound',
      landingJumpSound: 'landingJumpSound',
      //glidospike
      flyMonsterFlap: 'flyMonsterFlap',
      //vertibat
      wooshBat: 'wooshBat',
      batPitch: 'batPitch',
      //garry
      inkSpit: 'inkSpit',
      //ben
      verticalGhostSound: 'verticalGhostSound',
      //razorfin
      crunchSound: 'crunchSound',
      //skeletonFish
      skeletonCrunshSound: 'skeletonCrunshSound',
      //voltzeel
      electricitySound: 'electricitySound',
      //jetFish
      rocketLauncherSound: 'rocketLauncherSound',
      //spearFish
      stepWaterSound: 'stepWaterSound',
      //jellion
      jellionSound: 'jellionSound',
      //karateCroco
      ahhhSound: 'ahhhSound',
      //chiquita
      ravenCallAudio: 'ravenCallAudio',
      //vinelash
      vinelashEmergeSound: 'vinelashEmergeSound',
      vinelashRetractSound: 'vinelashRetractSound',
      //berrifly
      iceballThrowSound: 'iceballThrowSound',
      //sunflora
      yellowLaserBeamSound: 'yellowLaserBeamSound',
      //eggry
      eggrySound: 'eggrySound',
      //leafSlug
      leafSlugSound: 'leafSlugSound',
      //piper
      extendingSound: 'extendingSound',
      //venflora
      venfloraProjectileSound: 'venfloraProjectileSound',
      //venoblitz
      venoblitzRunningSound: 'venoblitzRunningSound',
      //mycora
      mycoraMouthSound: 'mycoraMouthSound',
      mycoraMouthCloseSound: 'mycoraMouthCloseSound',
      //scorble
      scorbleSound: 'scorbleSound',
      //magmapod
      magmapodProjectileSound: 'magmapodProjectileSound',
      //volcanurtle
      volcanurtleSound: 'volcanurtleSound',
      //bloburn
      bloburnSound: 'bloburnSound',
      //scorvex
      scorvexProjectileSound: 'scorvexProjectileSound',
      //lavaryn
      lavarynEmergeSound: 'lavarynEmergeSound',
      lavarynProjectileSound: 'lavarynProjectileSound',
      //cryopede
      cryopedeWalkingSound: 'cryopedeWalkingSound',
      //frostling
      frostlingSound: 'frostlingSound',
      //globby
      globbySound: 'globbySound',
      //drillice
      drilliceEmergeSound: 'drilliceEmergeSound',
      drilliceRetractSound: 'drilliceRetractSound',
      drilliceHoldSound: 'drilliceHoldSound',
      //oozel
      oozelFallingSound: 'oozelFallingSound',
      //mawrune
      mawruneBiteSound: 'mawruneBiteSound',
      //runespider
      runespiderWalkingSound: 'runespiderWalkingSound',
      //voidserp
      voidserpSound: 'voidserpSound',
      //golex
      golexMovingSound: 'golexMovingSound',
      golexAppearingSound: 'golexAppearingSound',
      //wardrake
      wardrakeProjectileSound: 'wardrakeProjectileSound',
      wardrakeGrowlSound: 'wardrakeGrowlSound',
      //nebulure
      nebulureSuctionSound: 'nebulureSuctionSound',
      //veynoculus
      veynoculusSound: 'veynoculusSound',
      //johnny
      johnnyAlienSound: 'johnnyAlienSound',
      //crabula
      crabulaSnippingSound: 'crabulaSnippingSound',
      crabulaEntranceSound: 'crabulaEntranceSound',
      //frogula
      frogulaSound: 'frogulaSound',
      //oculith
      oculithEmergeSound: 'oculithEmergeSound',
      //astraider
      astraiderWalkingSound: 'astraiderWalkingSound',
      //borion
      borionEmergeSound: 'borionEmergeSound',
      borionRetractSound: 'borionRetractSound',
      borionProjectileSound: 'borionProjectileSound',
      borionMouthSound: 'borionMouthSound',
    };
    this.initializeSounds();
  }
}
