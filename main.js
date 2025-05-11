const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  screen,
} = require("electron");
const path = require("path");
const screenshot = require("screenshot-desktop");
const fs = require("fs");
const os = require("os");
const { LMStudioClient } = require("@lmstudio/sdk");
const sharp = require("sharp");

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

let overlayWindow = null;

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
    win.loadFile(path.join(__dirname, "dist", "index.html"));
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
ipcMain.handle("list-screens", async () => {
  // Returns an array of display objects
  return await screenshot.listDisplays();
});

// Helper to create overlay window for region selection
function createOverlayWindow() {
  if (overlayWindow) {
    overlayWindow.focus();
    return overlayWindow;
  }
  // Get the bounds that cover all displays
  const displays = screen.getAllDisplays();
  const bounds = displays.reduce(
    (acc, d) => ({
      x: Math.min(acc.x, d.bounds.x),
      y: Math.min(acc.y, d.bounds.y),
      width: Math.max(acc.width, d.bounds.x + d.bounds.width - acc.x),
      height: Math.max(acc.height, d.bounds.y + d.bounds.height - acc.y),
    }),
    {
      x: displays[0].bounds.x,
      y: displays[0].bounds.y,
      width: displays[0].bounds.width,
      height: displays[0].bounds.height,
    }
  );
  overlayWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  overlayWindow.setIgnoreMouseEvents(false);
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.loadFile("overlay.html");
  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });
  return overlayWindow;
}

// Helper to trigger region selection overlay and return a Promise for the region
function selectRegion() {
  return new Promise((resolve) => {
    const win = createOverlayWindow();
    // Listen for region selection from overlay
    ipcMain.once("region-selected", (event, region) => {
      if (overlayWindow) {
        overlayWindow.close();
        overlayWindow = null;
      }
      resolve(region);
    });
    // Optionally: handle cancel
    ipcMain.once("region-cancel", () => {
      if (overlayWindow) {
        overlayWindow.close();
        overlayWindow = null;
      }
      resolve(null);
    });
  });
}

ipcMain.handle("select-region", async () => {
  // This handler is only for renderer processes that want to trigger region selection directly
  return await selectRegion();
});

ipcMain.handle("take-screenshot", async (event, windowTitle, screenId) => {
  let opts = {};
  if (windowTitle) {
    const sources = await screenshot.listWindows();
    const win = sources.find((w) => w.name.includes(windowTitle));
    if (!win) throw new Error("Window not found: " + windowTitle);
    opts = { screen: win.id };
  } else if (screenId && screenId !== "region") {
    opts = { screen: screenId };
  }
  // Handle region selection
  if (screenId === "region") {
    // 1. Trigger region selection overlay
    const region = await selectRegion();
    if (!region) throw new Error("Region selection cancelled");
    // 2. Capture full screen
    const img = await screenshot();
    // 3. Crop to region
    const cropped = await sharp(img)
      .extract({
        left: Math.round(region.x),
        top: Math.round(region.y),
        width: Math.round(region.width),
        height: Math.round(region.height),
      })
      .png()
      .toBuffer();
    // 4. Save to temp file
    const tmpPath = path.join(
      os.tmpdir(),
      `screenshot_region_${Date.now()}.png`
    );
    fs.writeFileSync(tmpPath, cropped);
    return { base64: cropped.toString("base64"), tmpPath };
  }
  // Default: capture as before
  const img = await screenshot(opts);
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

ipcMain.handle("check-lmstudio-available", async () => {
  console.log("check-lmstudio-available handler called");
  try {
    const models = await client.system.listDownloadedModels();
    console.log("LM Studio downloaded models:", models);
    return { available: true, modelsAvailable: models.length > 0 };
  } catch (e) {
    return { available: false, modelsAvailable: false, error: e.message };
  }
});
