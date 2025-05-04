const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const screenshot = require("screenshot-desktop");
const fs = require("fs");
const os = require("os");
const { LMStudioClient } = require("@lmstudio/sdk");

// Enable hot reload for development
if (process.env.NODE_ENV === "development") {
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "node_modules", ".bin", "electron"),
    hardResetMethod: "exit",
    // Watch these directories for changes
    watched: [
      path.join(__dirname, "main.js"),
      path.join(__dirname, "preload.js"),
      path.join(__dirname, "src"),
    ],
  });
}

const client = new LMStudioClient();

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile("index.html");
  }
}

app.whenReady().then(() => {
  createWindow();

  // Register PageDown as the global shortcut for taking a screenshot
  globalShortcut.register("PageDown", () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      // Try multiple focus strategies
      win.setAlwaysOnTop(true);
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      win.show();
      win.focus();
      // Electron 25+ app.focus({ steal: true })
      if (typeof app.focus === "function") {
        try {
          app.focus({ steal: true });
        } catch (e) {}
      }
      // macOS: Use AppleScript to activate the app
      if (process.platform === "darwin") {
        const { exec } = require("child_process");
        exec(
          "osascript -e 'tell application \"" + app.name + "\" to activate'"
        );
      }
      setTimeout(() => {
        win.setAlwaysOnTop(false);
        win.setVisibleOnAllWorkspaces(false);
      }, 500);
      win.webContents.send("trigger-screenshot");
    }
  });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Clean up the shortcut on quit
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// IPC handlers for screenshot and send
ipcMain.handle("take-screenshot", async (event, windowTitle) => {
  let opts = {};
  if (windowTitle) {
    const sources = await screenshot.listWindows();
    const win = sources.find((w) => w.name.includes(windowTitle));
    if (!win) throw new Error("Window not found: " + windowTitle);
    opts = { screen: win.id };
  }
  const img = await screenshot(opts);
  // Save to a temp PNG file
  const tmpPath = path.join(os.tmpdir(), `screenshot_${Date.now()}.png`);
  fs.writeFileSync(tmpPath, img);
  return { base64: img.toString("base64"), tmpPath };
});

ipcMain.handle(
  "send-to-llm",
  async (event, { model, messages, max_tokens, temperature }) => {
    const llm = await client.llm.model(model);
    // Prepare images for any message that has imagePath
    const preparedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (
          msg.images &&
          msg.images.length > 0 &&
          typeof msg.images[0] === "string"
        ) {
          // Prepare image if it's a path
          const prepared = await client.files.prepareImage(msg.images[0]);
          return { ...msg, images: [prepared] };
        }
        return msg;
      })
    );
    const prediction = await llm.respond(preparedMessages, {
      maxTokens: max_tokens,
      temperature: temperature,
    });
    return prediction;
  }
);

ipcMain.handle("get-file-stats", async (event, filePath) => {
  const stats = fs.statSync(filePath);
  return { size: stats.size };
});
