# ARCHITECTURE

## High-Level Overview

```mermaid
flowchart TB
    subgraph Shell["Electron Shell"]
        EM[electron-main.js<br/>BrowserWindow]
        PL[preload.js<br/>electronAPI bridge]
    end

    subgraph Boot["Boot"]
        HTML[index.html<br/>preloads 987 images<br/>+ 288 audio elements]
        MAIN[main.js<br/>entry point + rAF loop]
        LOAD[loading.js<br/>asset loader]
    end

    subgraph Core["Core"]
        GAME[Game<br/>game-main.js]
    end

    EM --> HTML
    PL -.IPC.-> EM
    HTML --> MAIN
    MAIN --> LOAD
    MAIN --> GAME
```

`main.js` calls `startLoadingScreen()` and, once `loading.finish()` resolves on `window.load`, constructs `new Game(...)` itself — `loading.js` never instantiates Game.

---

## Game Class — Top-Level Composition

```mermaid
flowchart TB
    Game[Game<br/>game-main.js]

    subgraph Entities["Entities"]
        Player
        Enemies
        Bosses
        PowerUps[PowerUps /<br/>PowerDowns]
        Penguini
        Cabin
    end

    subgraph UI["Interface / UI"]
        Input[InputHandler]
        UIHud[UI HUD]
        Tutorial
        Toasts[Animated /<br/>CoinConvert Toasts]
    end

    subgraph Menus["Menu System"]
        MN[MenuNavigator]
        Main[MainMenu]
        Forest[ForestMapMenu]
        Wardrobe
        Records[RecordsMenu]
        Lore[EnemyLore]
        HTP[HowToPlayMenu]
        Settings[SettingsMenu]
        Audio[AudioSettingsMenu]
        Controls[ControlsSettingsMenu]
        Interface[InterfaceMenu]
        Difficulty[DifficultyMenu]
        Pause[PauseMenu]
        GameOver[GameOverMenu]
        Delete[DeleteProgress<br/>+ DeleteProgress2]
    end

    subgraph Cutscenes["Cutscenes"]
        Story[Story Cutscenes<br/>Map1–7 + Bonus1–3]
        Ingame[Ingame Cutscenes<br/>Penguini + Boss]
    end

    subgraph Systems["Subsystems"]
        AH[9 AudioHandlers]
        Persist[gamePersistence<br/>localStorage]
        BG[Background<br/>+ Parallax]
        Anims[Animations]
        Reset
    end

    Game --> Entities
    Game --> UI
    Game --> Menus
    Game --> Cutscenes
    Game --> Systems
```

---

## Game Loop

The rAF loop in [main.js](game/main.js) switches on `game.gameState` — three states only, defined in [constants.js](game/config/constants.js):

```mermaid
flowchart LR
    A[requestAnimationFrame] --> B{gameState?}
    B -->|MENU| C[currentMenu.draw<br/>+ update]
    B -->|CUTSCENE| D[currentCutscene.draw<br/>+ pause overlay if paused]
    B -->|GAMEPLAY| E[game.update deltaTime]

    E --> E1[player.update]
    E --> E2[enemies.update]
    E --> E3[powerUps + animations]
    E --> E4[collisions<br/>playerCollision.js]
    E4 --> F[game.draw ctx<br/>+ UI + overlays]
    F --> A
    C --> A
    D --> A
```

Game-over, pause, and distortion effects are drawn as overlays **within** GAMEPLAY — they are not separate top-level states.

---

## Player — State Machine

11 states in [playerStates.js](game/entities/playerStates.js), enumerated in [PlayerState](game/config/constants.js) (0–10). Initial state is `Sitting` ([game-main.js:97](game/game-main.js#L97), [reset.js:50](game/reset.js#L50)).

The states group into three roles:

| Role | States | Notes |
|---|---|---|
| **Locomotion** | `Sitting`, `Running`, `Jumping`, `Falling`, `Diving`, `Standing` | `Standing` only appears when the world is stopped (cabin fully visible or boss visible); otherwise recovery lands in `Running`. |
| **Modifier** | `Rolling`, `Dashing` | Enterable from most locomotion states and return to them. |
| **Reactive** | `Hit`, `Stunned`, `Dying` | Entered from collisions ([playerCollision.js](game/entities/playerCollision.js)) or `gameOver()`. `Hit`/`Stunned` recover to `Sitting` if `previousState === states[0]`, else to `Running` (grounded) / `Falling` (airborne). |

```mermaid
stateDiagram-v2
    [*] --> Sitting
    Locomotion: Locomotion (6 states)
    Modifier: Modifier (Rolling, Dashing)
    Reactive: Reactive (Hit, Stunned)

    Sitting --> Locomotion: move / jump
    Locomotion --> Modifier: roll / dash
    Modifier --> Locomotion: release / land

    Locomotion --> Reactive: collision
    Modifier --> Reactive: collision
    Reactive --> Locomotion: recover

    Locomotion --> Dying: lives = 0
    Modifier --> Dying: lives = 0
    Reactive --> Dying: lives = 0
    Dying --> [*]
```

Full per-state transitions (jump apex, dive cooldown, space-map double-jump, dash exit branches, etc.) live in each state's `handleInput()` in [playerStates.js](game/entities/playerStates.js). Files: [player.js](game/entities/player.js), [playerStates.js](game/entities/playerStates.js), [playerCollision.js](game/entities/playerCollision.js).

---

## Enemy Class Hierarchy

Base class: `Enemy` in [enemyBase.js](game/entities/enemies/core/enemyBase.js). Mixin subtypes in [enemyTypes.js](game/entities/enemies/core/enemyTypes.js). Bosses extend a shared `EnemyBoss` base.

The regular-enemy hierarchy and the boss hierarchy are shown separately because `EnemyBoss` has very different children from its siblings — keeping them in one diagram forces the layout solver to stretch arrows awkwardly.

**Regular enemies** (extend `Enemy` directly):

```mermaid
classDiagram
    direction TB
    class Enemy {
        +x, y, width, height
        +update()
        +draw()
    }

    Enemy <|-- FlyingEnemy
    Enemy <|-- GroundEnemy
    Enemy <|-- ClimbingEnemy
    Enemy <|-- VerticalEnemy
    Enemy <|-- FallingEnemy
    Enemy <|-- UnderwaterEnemy

    FlyingEnemy <|-- BeeInstances
    GroundEnemy <|-- MovingGroundEnemy
    GroundEnemy <|-- ImmobileGroundEnemy
    ImmobileGroundEnemy <|-- BurrowingGroundEnemy
    BurrowingGroundEnemy <|-- UndergroundEnemy
```

**Bosses** (extend `EnemyBoss`, which itself extends `Enemy`):

```mermaid
classDiagram
    direction TB
    class Enemy
    class EnemyBoss
    Enemy <|-- EnemyBoss
    EnemyBoss <|-- Elyvorg
    EnemyBoss <|-- Glacikal
    EnemyBoss <|-- NTharax
```

```mermaid
classDiagram
    direction TB
    class BossManager {
        +spawnBossIfNeeded()
        +bossIsEngaged()
        +bossGateReached()
        +onBossDefeated()
        +updateBossTimers()
        +updateScreenEffect()
    }
    class Elyvorg
    class Glacikal
    class NTharax

    BossManager --> Elyvorg
    BossManager --> Glacikal
    BossManager --> NTharax
```

Per-map enemies extend one of the mixin subtypes and live in [maps/](game/entities/enemies/maps/) (map1Enemies.js … bonusMap3Enemies.js).

---

## Menu Hierarchy

All menus extend `BaseMenu` in [baseMenu.js](game/menu/baseMenu.js); long/scrollable lists extend `ScrollableMenu`, which itself extends `BaseMenu`.

```mermaid
classDiagram
    class BaseMenu {
        +activateMenu()
        +closeMenu()
        +draw()
        +update()
        +handleKeyDown()
        +handleMouseClick()
        +handleMouseMove()
        +handleMouseWheel()
    }
    class ScrollableMenu
    class MenuNavigator {
        +setRoot()
        +open()
        +openTransient()
        +closeTransient()
        +back()
    }

    BaseMenu <|-- ScrollableMenu

    BaseMenu <|-- MainMenu
    BaseMenu <|-- PauseMenu
    BaseMenu <|-- GameOverMenu
    BaseMenu <|-- ForestMapMenu
    BaseMenu <|-- SettingsMenu
    BaseMenu <|-- AudioSettingsMenu
    BaseMenu <|-- InterfaceMenu
    BaseMenu <|-- DeleteProgress
    BaseMenu <|-- DeleteProgress2
    BaseMenu <|-- DifficultyMenu
    BaseMenu <|-- HowToPlayMenu
    BaseMenu <|-- Wardrobe
    BaseMenu <|-- EnemyLore

    ScrollableMenu <|-- ControlsSettingsMenu
    ScrollableMenu <|-- RecordsMenu

    MenuNavigator --> BaseMenu : navigates
```

---

## Audio System

9 `AudioHandler` subclasses in [audioHandler.js](game/audioHandler.js):

```mermaid
classDiagram
    class AudioHandler {
        +playSound()
        +stopSound()
        +pauseSound()
        +resumeSound()
        +fadeOutAndStop()
        +isPlaying()
    }

    AudioHandler <|-- MenuAudioHandler
    AudioHandler <|-- FiredogAudioHandler
    AudioHandler <|-- EnemySFXAudioHandler
    AudioHandler <|-- CollisionSFXAudioHandler
    AudioHandler <|-- MapSoundtrackAudioHandler
    AudioHandler <|-- PowerUpAndDownSFXAudioHandler
    AudioHandler <|-- CutsceneMusicAudioHandler
    AudioHandler <|-- CutsceneDialogueAudioHandler
    AudioHandler <|-- CutsceneSFXAudioHandler
```

All 288 audio elements live as `<audio>` tags in [index.html](game/index.html) and are each referenced by id.

---

## Cutscene System

Base engine: `Cutscene` in [cutscene.js](game/cutscene/cutscene.js). Boss cutscenes share an intermediate `BossCutscene` base.

```mermaid
flowchart TB
    Cutscene[Cutscene<br/>base engine]

    Cutscene --> Story[StoryCutscene base]
    Cutscene --> Boss[BossCutscene]
    Cutscene --> Peng[PenguiniCutscene<br/>ingame NPC base]

    Story --> M1[Map1..Map7 Cutscenes]
    Story --> B1[BonusMap1..3 Cutscenes]

    Boss --> EC[ElyvorgCutscene<br/>before/after fight]
    Boss --> GC[GlacikalCutscene<br/>before/after fight]
    Boss --> NC[NTharaxCutscene<br/>before/after fight]

    Peng --> Pen1[Map1..Map7 +<br/>BonusMap1..3 ingame]
    Peng --> Pen2[CoinDialogueConditionCutscene]
```

Dialogue, sprites, music, and SFX are orchestrated via `addDialogue()` in [cutscene.js](game/cutscene/cutscene.js).

---

## Persistence

```mermaid
flowchart LR
    Game -->|saveGameState| Persist[gamePersistence.js]
    Persist -->|JSON.stringify| LS[(localStorage<br/>'gameState')]
    LS -->|JSON.parse| Persist
    Persist -->|loadGameState| Game

    subgraph Saved["What's saved"]
        direction TB
        S1[map / boss progress]
        S2[audio / difficulty / UI / window mode]
        S3[skins / cosmetics / outfit slots]
        S4[credit coins / owned items]
        S5[keybindings + records]
    end

    Persist -.- Saved
```

File: [gamePersistence.js](game/persistence/gamePersistence.js) — `clearSavedData()` also exists for full wipes.

---

## Config / Data Layer

```mermaid
flowchart LR
    subgraph Config["game/config/"]
        C1[constants.js<br/>canvas, speed,<br/>GameState, PlayerState]
        C2[keyBindings.js]
        C3[difficultySettings.js]
        C4[enemySpawnConfig.js]
        C5[itemSpawnConfig.js]
        C6[playerConfig.js]
        C7[cutsceneConfig.js]
        C8[skinsAndCosmetics.js]
        C9[enemyLoreData.js]
    end

    C1 --> Game
    C2 --> Input
    C3 --> Difficulty
    C4 --> Enemies
    C5 --> PowerUps
    C6 --> Player
    C7 --> Cutscenes
    C8 --> Wardrobe
    C9 --> Lore[EnemyLore]
```

---

## Testing

```mermaid
flowchart LR
    Tests[__tests__/<br/>53 suites · 3,125 tests]
    Tests -->|jsdom| DOM[Mocked DOM + Canvas]
    Tests -->|babel-jest| ES6[ES6 modules]
    Tests --> GameCode[game/]

    subgraph Cov["Coverage ~62%"]
        X1[Statements 61.88%]
        X2[Branches 56.47%]
        X3[Functions 64.94%]
        X4[Lines 62.86%]
    end
```
