const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  takeScreenshot: (windowTitle) =>
    ipcRenderer.invoke("take-screenshot", windowTitle),
  sendToLLM: (params) => ipcRenderer.invoke("send-to-llm", params),
  getFileStats: (filePath) => ipcRenderer.invoke("get-file-stats", filePath),
});
