const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  takeScreenshot: (windowTitle, screenId) =>
    ipcRenderer.invoke("take-screenshot", windowTitle, screenId),
  listScreens: () => ipcRenderer.invoke("list-screens"),
  sendToLLM: (params) => ipcRenderer.invoke("send-to-llm", params),
  getFileStats: (filePath) => ipcRenderer.invoke("get-file-stats", filePath),
  onTriggerScreenshot: (callback) =>
    ipcRenderer.on("trigger-screenshot", callback),
  checkLMStudioAvailable: () => ipcRenderer.invoke("check-lmstudio-available"),
});
