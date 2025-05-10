# Feature Plan: Screen Selection for Screenshot

## Goal

Allow the user to:

- See all connected screens/monitors.
- Select which screen to capture.
- Capture the selected screen when taking a screenshot (via UI or PageDown).

## Steps

### 1. Backend (Electron Main Process)

- Use `screenshot-desktop`'s `listDisplays()` to get all screens.
- Add a new IPC handler to return the list of screens to the renderer process.
- Update the screenshot handler to accept a `screenId` and capture that screen.

### 2. Preload Script

- Expose the new API for listing screens and passing a screen ID to the screenshot function.

### 3. Frontend (React)

- Add a dropdown/select (likely in the settings modal) to let the user pick a screen.
- Store the selected screen in React state.
- Pass the selected screen ID to the screenshot function.

### 4. Wiring

- When the user changes the selected screen, update the state.
- When taking a screenshot, send the selected screen ID to the backend.

---

**Next:**

- Implement backend support for listing screens and capturing a specific screen.
- Update preload script.
- Update frontend UI and logic.
