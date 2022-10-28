const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    startShare(code) {
      ipcRenderer.invoke("start-share", code);
    },
    stopShare() {
      ipcRenderer.invoke("stop-share");
    },
  },
});
