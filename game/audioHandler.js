export class AudioHandler {
  constructor(game) {
    this.game = game;
    this.checkRealVolumeOnce = true;
    this.pausedSoundPositions = {};
    this.soundsMapping = {};
    this.realInitialVolume;
    this.sounds = {};
    this.initializeSounds();
  }

  initializeSounds() {
    for (const soundName in this.soundsMapping) {
      this.sounds[soundName] = this.loadSound(soundName);
    }
  }

  loadSound(soundName) {
    const soundId = this.soundsMapping[soundName];
    const audioElement = document.getElementById(soundId);
    if (audioElement) {
      // adds event listener for 'ended' event
      audioElement.addEventListener('ended', () => {
        // removes the stored position when the sound ends
        delete this.pausedSoundPositions[soundId];
      });
      return audioElement;
    } else {
      console.error(`Audio element with ID '${soundId}' not found.`);
      return null;
    }
  }

  playSound(soundName, loop = false, currentTimeZero = false, shouldPause = false) {
    const audioElement = this.sounds[soundName];
    if (audioElement) {
      if (shouldPause) {
        this.stopSound(soundName);
      } else {
        this.prePlaySound(audioElement, loop, currentTimeZero);
      }
    }
    return audioElement;
  }

  prePlaySound(audioElement, loop = false, currentTimeZero = false) {
    if (audioElement) {
      if (currentTimeZero) {
        audioElement.currentTime = 0;
      }
      audioElement.loop = loop;
      audioElement.play();
    }
    return audioElement;
  }

  stopAllSounds() {
    for (const soundName in this.soundsMapping) {
      this.stopSound(soundName);
    }
  }

  stopSound(soundName) {
    const audioElement = this.sounds[soundName];
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      // removes the stored position
      delete this.pausedSoundPositions[audioElement.id];
    }
  }

  pauseAllSounds() {
    for (const soundName in this.soundsMapping) {
      this.pauseSound(soundName);
    }
  }

  pauseSound(soundName) {
    const audioElement = this.sounds[soundName];
    if (audioElement && !audioElement.paused) {
      audioElement.pause();
      this.pausedSoundPositions[audioElement.id] = audioElement.currentTime;
    }
  }

  resumeAllSounds() {
    for (const soundName in this.soundsMapping) {
      this.resumeSound(soundName);
    }
  }

  resumeSound(soundName) {
    const audioElement = this.sounds[soundName];
    if (audioElement && audioElement.paused) {
      const storedTime = this.pausedSoundPositions[audioElement.id];
      if (storedTime !== undefined) {
        // clears stored position
        delete this.pausedSoundPositions[audioElement.id];

        // checks if the stored time is within the sound's duration
        if (storedTime < audioElement.duration) {
          audioElement.currentTime = storedTime;
          audioElement.play();
        }
      }
    }
  }

  fadeOutAndStop(soundName, duration = 1000) {
    const audioElement = this.sounds[soundName];
    if (!audioElement) return;

    if (this.checkRealVolumeOnce) {
      this.realInitialVolume = audioElement.volume;
      this.checkRealVolumeOnce = false;
    }

    const initialVolume = audioElement.volume;
    const volumeChangeRate = initialVolume / (duration / 100);
    let currentVolume = initialVolume;

    const fadeOutInterval = setInterval(() => {
      currentVolume -= volumeChangeRate;
      if (currentVolume > 0) {
        audioElement.volume = currentVolume;
      } else {
        audioElement.volume = this.realInitialVolume;
        this.checkRealVolumeOnce = true;
        clearInterval(fadeOutInterval);
        this.stopSound(soundName);
      }
    }, 100);
  }

  isPlaying(soundName) {
    const audioElement = this.sounds[soundName];
    return !!(audioElement && !audioElement.paused);
  }
  getSoundsMapping() {
    return this.soundsMapping;
  }
}

export class MenuAudioHandler extends AudioHandler {
  constructor(game) {
    super(game);
    this.soundsMapping = {
      soundtrack: 'soundtrack',
      optionSelectedSound: 'optionSelectedSound',
      optionHoveredSound: 'optionHoveredSound',
      mapOpening: 'mapOpening',
      bookFlip: 'bookFlip',
      shinySkinRizzSound: 'shinySkinRizzSound',
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
      cutsceneMapOpening: 'cutsceneMapOpening',
      waterSplashSound: 'waterSplashSound',
      sorcererEnteringMindSound: 'sorcererEnteringMindSound',
      sorcererTeleportBackSound: 'sorcererTeleportBackSound',
      sorcererWaterSpellSound: 'sorcererWaterSpellSound',
      submarineRevving: 'submarineRevving',
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
    };
    this.initializeSounds();
  }
}

export class MapSoundtrackAudioHandler extends AudioHandler {
  constructor(game) {
    super(game);
    this.soundsMapping = {
      map1Soundtrack: 'map1Soundtrack',
      map2Soundtrack: 'map2Soundtrack',
      map3Soundtrack: 'map3Soundtrack',
      map4Soundtrack: 'map4Soundtrack',
      map5Soundtrack: 'map5Soundtrack',
      map6Soundtrack: 'map6Soundtrack',
      elyvorgBattleTheme: 'elyvorgBattleTheme',
      crypticTokenDarkAmbienceSoundInGame: 'crypticTokenDarkAmbienceSoundInGame',
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
      energyReachedZeroSound: 'energyReachedZeroSound',
      dreamSoundInGame: 'dreamSoundInGame',
      invisibleInSFX: 'invisibleInSFX',
      invisibleOutSFX: 'invisibleOutSFX',
      barkSound: 'barkSound',
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
      healthLiveSound: 'healthLiveSound',
      oxygenTankSound: 'oxygenTankSound',
      //power down
      drinkSoundEffect: 'drinkSoundEffect',
      cauldronSoundEffect: 'cauldronSoundEffect',
      darkHoleLaughSound: 'darkHoleLaughSound',
      statusConfusedSound: 'statusConfusedSound',
      deadSkullLaugh: 'deadSkullLaugh',
    };
    this.initializeSounds();
  }
}

export class ExplosionSFXAudioHandler extends AudioHandler {
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
      elyvorg_meteor_in_contact_sound: 'elyvorg_meteor_in_contact_sound',
      elyvorg_meteor_in_contact_with_ground_sound: 'elyvorg_meteor_in_contact_with_ground_sound',
      elyvorg_electricity_wheel_collision_sound: 'elyvorg_electricity_wheel_collision_sound',
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
      elyvorg_poison_drop_indicator_sound: 'elyvorg_poison_drop_indicator_sound',
      elyvorg_poison_drop_rain_sound: 'elyvorg_poison_drop_rain_sound',
      elyvorg_slash_attack_sound: 'elyvorg_slash_attack_sound',
      elyvorg_arrow_attack_sound: 'elyvorg_arrow_attack_sound',
      //projectiles
      windAttackAudio: 'windAttackAudio',
      tornadoAudio: 'tornadoAudio',
      leafAttackAudio: 'leafAttackAudio',
      laserAttackAudio: 'laserAttackAudio',
      acidSoundEffect: 'acidSoundEffect',
      spitSound: 'spitSound',
      frozenSound: 'frozenSound',
      staticSound: 'staticSound',
      rockAttackSound: 'rockAttackSound',
      //enemies
      //goblito
      goblinDie: 'goblinDie',
      goblinStealing: 'goblinStealing',
      goblinRunSound: 'goblinRunSound',
      goblinJumpSound: 'goblinJumpSound',
      //dotter, lilHornet, redFlyer, purpleFlyer, lazyMosquito
      buzzingFly: 'buzzingFly',
      //meatSoldier
      meatSoldierSound: 'meatSoldierSound',
      //abyssaw
      spinningChainsaw: 'spinningChainsaw',
      //ravengloom
      ravenCallAudio: 'ravenCallAudio',
      ravenSingleFlap: 'ravenSingleFlap',
      //walterTheGhost
      ghostHmAudio: 'ghostHmAudio',
      //ghobat
      ghobatFlapAudio: 'ghobatFlapAudio',
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
      //duskPlant, bigGreener, petroPlant
      teethChatteringSound: 'teethChatteringSound',
      //skulnap
      fuseSound: 'fuseSound',
      skeletonRattlingSound: 'skeletonRattlingSound',
      //sluggie, snailey
      slimyWalkSound: 'slimyWalkSound',
      //silknoir
      nightSpiderSound: 'nightSpiderSound',
      //zabkous
      frogSound: 'frogSound',
      landingJumpSound: 'landingJumpSound',
      //spidoLazer
      spidoLazerWalking: 'spidoLazerWalking',
      //glidospike, dragon
      flyMonsterFlap: 'flyMonsterFlap',
      //vertibat
      wooshBat: 'wooshBat',
      batPitch: 'batPitch',
      //garry
      inkSpit: 'inkSpit',
      //ben
      verticalGhostSound: 'verticalGhostSound',
      //piranha
      crunchSound: 'crunchSound',
      //skeletonFish
      skeletonCrunshSound: 'skeletonCrunshSound',
      //voltzeel
      electricitySound: 'electricitySound',
      //jetFish
      rocketLauncherSound: 'rocketLauncherSound',
      //spearFish
      stepWaterSound: 'stepWaterSound',
      //tauro
      stomp: 'stomp',
      //karateCroco
      ahhhSound: 'ahhhSound',
      //purpleFlyer
      iceballThrowSound: 'iceballThrowSound',
      //sunflora
      yellowLaserBeamSound: 'yellowLaserBeamSound',
      //piper
      extendingSound: 'extendingSound',
      //theRock
      theRockStomp: 'theRockStomp',
      //rollhog
      rollhogRollSound: 'rollhogRollSound',
    };
    this.initializeSounds();
  }
}
