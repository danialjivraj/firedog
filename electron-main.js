const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    icon: path.join(__dirname, 'game', 'assets', 'icons', 'firedogHead.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  mainWindow.removeMenu()

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'game', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.maximize();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

ipcMain.on('quit-app', () => {
  app.quit();
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
