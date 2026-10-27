const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('deutschStorage', Object.freeze({ load: () => ipcRenderer.invoke('storage:load'), save: state => ipcRenderer.invoke('storage:save', state) }));
