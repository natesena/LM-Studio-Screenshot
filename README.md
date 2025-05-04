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

## How it works

- Uses [`screenshot-desktop`](https://www.npmjs.com/package/screenshot-desktop) to capture screenshots
- Sends the screenshot to a local server via HTTP POST

---

Feel free to extend this for your needs!
