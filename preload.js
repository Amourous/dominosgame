const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Future: save/load game state, online multiplayer hooks
  getVersion: () => '1.0.0'
});
