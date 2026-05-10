const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    let validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ['fromMain', 'update-available', 'update-downloaded'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  invoke: (channel, data) => {
    let validChannels = ['get-api-url', 'check-for-updates', 'start-update'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  }
});
