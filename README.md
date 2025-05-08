# firedog
Firedog is a 2D game built from scratch with over 20k lines of code (+14k for tests) and over 663 different assets (509 images and 154 audio files).

This game was created by using HTML Canvas and pure JavaScript without relying on external frameworks except for 
Electron, which was utilized to transform it into a Desktop application.

## Story and Objective
Embark on a thrilling quest as Firedog to recover the stolen Cryptic Token, pilfered by an enigmatic thief! <br>

This is a story-based game which includes 6 different maps, with over 49 different enemies and a final boss. <br>
Your objective on each map is to eliminate as many enemies as you can, gathering sufficient coins to advance to the next stage of your journey! <br>

Your progress/game settings will be automatically saved whenever you complete a map or adjust your settings (such as audio, skin selection, or level difficulty).

## Preview
https://github.com/user-attachments/assets/55bf2c6e-c610-45d1-9e82-eae1e124d480

https://github.com/user-attachments/assets/66ec27af-cf4a-45f2-9727-5ba54c99bb26

![image](https://raw.githubusercontent.com/danialjivraj/firedog/main/githubPreviews/imagePreview1.png)
![image](https://raw.githubusercontent.com/danialjivraj/firedog/main/githubPreviews/imagePreview2.png)
![image](https://raw.githubusercontent.com/danialjivraj/firedog/main/githubPreviews/imagePreview3.png)
![image](https://raw.githubusercontent.com/danialjivraj/firedog/main/githubPreviews/imagePreview4.png)
![image](https://raw.githubusercontent.com/danialjivraj/firedog/main/githubPreviews/imagePreview5.png)
![image](https://raw.githubusercontent.com/danialjivraj/firedog/main/githubPreviews/imagePreview6.png)
![image](https://raw.githubusercontent.com/danialjivraj/firedog/main/githubPreviews/imagePreview7.png)
![image](https://raw.githubusercontent.com/danialjivraj/firedog/main/githubPreviews/imagePreview8.png)
![image](https://raw.githubusercontent.com/danialjivraj/firedog/main/githubPreviews/imagePreview9.png)
![image](https://raw.githubusercontent.com/danialjivraj/firedog/main/githubPreviews/imagePreview10.png)

## Controls
- **Menus**
  - Arrow Up / Scroll Wheel Up: Move Up
  - Arrow Down / Scroll Wheel Down: Move Down
  - Arrow Right: Move Right
  - Arrow Left: Move Left
  - Enter / Left Click: Select Option
  - Tab: Open/Close Enemy Lore
  - Esc / Right Click: Return to Main Menu/Game

- **Cutscenes**
  - Enter / Left Click: Advance to the next dialogue/Skip dialogue animation
  - Tab: Skip entire cutscene

- **Gameplay**
  - **Movement:**
    - W: Jump
    - A: Move Backwards
    - S: Sit
    - D: Move Forward

  - **Special Moves:**
    - Enter / Right Click: Roll Attack
    - S (while in the air): Dive Attack
    - Q / Left Click: Fireball Attack
    - E / Scroll Wheel Click: Invisible Defense

  - Esc: Pause/Unpause Game

## Download

You can download the game by clicking one of the following links:

#### For Windows
- [Download (408.07MB)](https://www.mediafire.com/file/zsvbzrmd68k80pv/Firedog-win32-x64.zip/file)

#### For macOS
- [Download (399.81MB)](https://www.mediafire.com/file/dkdet7y65jtge2y/Firedog-darwin-x64.zip/file)

#### For Linux
- [Download (403.46MB)](https://www.mediafire.com/file/dfmai6enwiesduo/Firedog-linux-x64.zip/file)

## Dependencies
Alternatively to downloading the game, you can clone the project and run it locally. <br>
You'll need to run the following command in the root folder:
- Electron
```
npm install electron
```

Then you can run the game by using the following prompt:
```
npm run start
```

**Note:** Make sure you have [Node.js](https://nodejs.org/en/download) installed to be able to run the game locally.

## Tests

The project is thoroughly tested using Jest, with over **1.1k+ tests** and and average of **80% test coverage** across all files.<br>
You need to install the testing dependencies before being able to run all tests.

1. Install all dependencies by running in the root folder:
```
npm install
```
2. To run all tests use:
```
npm test
```

## Diagrams
[firedog.drawio](https://drive.google.com/file/d/1UzqG0iWC3djNO5h_WFIayjSSvS6cQqbG/view?usp=sharing)

## Credits
[CREDITS.md](https://github.com/danialjivraj/firedog/blob/main/CREDITS.md)

## Disclaimer
[DISCLAIMER.md](https://github.com/danialjivraj/firedog/blob/main/DISCLAIMER.md)

