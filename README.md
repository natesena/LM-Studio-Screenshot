# Screenshot Sender (macOS)

This project lets you quickly take a screenshot of your Mac (entire screen or any window) and send it to a server running on your Mac.

## Features

- Take screenshots using a Node.js script
- Send screenshots to a local server

## Setup

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Start the server:**

   ```sh
   node server.js
   ```

3. **Take a screenshot and send it:**
   ```sh
   node screenshot-send.js
   ```
   By default, this captures the entire screen. See below for options.

> **Note:** Start the app with `node server.js` in one terminal, then run `node screenshot-send.js` in another.

> **Note:** To start the Electron app in development, just run `npm start`.

## Usage

### Take a screenshot of the entire screen

```sh
node screenshot-send.js
```

### Take a screenshot of a specific window

List windows:

```sh
node screenshot-send.js --list
```

Take screenshot of a window by title:

```sh
node screenshot-send.js --window "Window Title"
```

## Requirements

- macOS
- Node.js 16+

## Building and Installing the Electron App

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Build the app:**
   ```sh
   npm run build
   ```
   This will build the React frontend and package the Electron app. The output can be found in the `dist/` folder.
3. **Run the packaged app:**
   - On macOS, open the `.app` or `.dmg` file in the `dist/` folder.
   - On Windows, open the `.exe` file in the `dist/` folder.
   - On Linux, use the `.AppImage` or other output in the `dist/` folder.

**Note:** The app will use the custom icon you placed in `assets/LM_Screenshot.png`. For best results, use platform-specific icon formats (`.icns` for macOS, `.ico` for Windows, `.png` for Linux).

## How it works

- Uses [`screenshot-desktop`](https://www.npmjs.com/package/screenshot-desktop) to capture screenshots
- Sends the screenshot to a local server via HTTP POST

---

Feel free to extend this for your needs!
