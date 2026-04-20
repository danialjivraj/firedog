const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

const configPath = path.join(app.getPath('userData'), 'window-config.json');

function readWindowConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    return {};
  }
}

function writeWindowConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config));
  } catch {
    // ignore write errors
  }
}

let mainWindow;

function createWindow() {
  const config = readWindowConfig();
  const startFullscreen = config.windowMode === 'fullscreen';

  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: startFullscreen,
    icon: path.join(__dirname, 'game', 'assets', 'icons', 'firedogHead.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  mainWindow.removeMenu()

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'game', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  if (!startFullscreen) {
    mainWindow.maximize();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

ipcMain.on('quit-app', () => {
  app.quit();
});

ipcMain.on('set-window-mode', (_event, mode) => {
  writeWindowConfig({ windowMode: mode });
  if (!mainWindow) return;
  if (mode === 'fullscreen') {
    mainWindow.setFullScreen(true);
  } else {
    mainWindow.setFullScreen(false);
    mainWindow.maximize();
  }
});

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// to package
// for windows/linux
// electron-packager . Firedog --platform=all --asar --icon=./game/assets/icons/firedogHeadIcon.ico
// for mac
// electron-packager . Firedog --platform=darwin --asar --icon=./game/assets/icons/firedogHeadIconMac.icns
