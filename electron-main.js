const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    icon: path.join(__dirname, 'game', 'assets', 'icons', 'firedogHead.png'),
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

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
