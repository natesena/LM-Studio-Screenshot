# TODO List

## High Priority Tasks

1. **Ensure LM Studio is running**

   - On app startup and before sending any LLM requests, check if LM Studio is active.
   - If not running, display a clear visual error/notice in the UI instructing the user to start LM Studio.

2. **Ensure required Gemma vision models are available and loaded**
   - On app startup or when needed, check if the required Gemma vision models are present and loaded in LM Studio.
   - If not, display a UI notice with instructions to download/load the models (e.g., using `lms get <model-name>`).
   - Prevent chat functionality until the required models are available.

---

## Screen Selection for Screenshot (Feature Plan)

- Allow the user to:
  - See all connected screens/monitors.
  - Select which screen to capture.
  - Capture the selected screen when taking a screenshot (via UI or PageDown).

### Steps

#### 1. Backend (Electron Main Process)

- Use `screenshot-desktop`'s `listDisplays()` to get all screens.
- Add a new IPC handler to return the list of screens to the renderer process.
- Update the screenshot handler to accept a `screenId` and capture that screen.

#### 2. Preload Script

- Expose the new API for listing screens and passing a screen ID to the screenshot function.

#### 3. Frontend (React)

- Add a dropdown/select (likely in the settings modal) to let the user pick a screen.
- Store the selected screen in React state.
- Pass the selected screen ID to the screenshot function.

#### 4. Wiring

- When the user changes the selected screen, update the state.
- When taking a screenshot, send the selected screen ID to the backend.

---

**Next:**

- Implement backend support for listing screens and capturing a specific screen.
- Update preload script.
- Update frontend UI and logic.
