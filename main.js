const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const screenshot = require("screenshot-desktop");
const fs = require("fs");
const os = require("os");
const { LMStudioClient } = require("@lmstudio/sdk");

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
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
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
  async (event, { model, prompt, max_tokens, temperature, imagePath }) => {
    // Use LM Studio SDK for image input
    const llm = await client.llm.model(model);
    const image = await client.files.prepareImage(imagePath);
    const prediction = await llm.respond(
      [
        {
          role: "user",
          content: prompt || "Describe this image",
          images: [image],
        },
      ],
      {
        maxTokens: max_tokens,
        temperature: temperature,
      }
    );
    return prediction;
  }
);

ipcMain.handle("get-file-stats", async (event, filePath) => {
  const stats = fs.statSync(filePath);
  return { size: stats.size };
});
