const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    quitApp: () => ipcRenderer.send('quit-app'),
    setWindowMode: (mode) => ipcRenderer.send('set-window-mode', mode)
});
