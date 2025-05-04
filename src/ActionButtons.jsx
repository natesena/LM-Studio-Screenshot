import React from "react";

export default function ActionButtons({
  onTakeScreenshot,
  onSendToLLM,
  sendDisabled,
}) {
  return (
    <div className="screenshot-actions">
      <button id="screenshotBtn" onClick={onTakeScreenshot}>
        Take Screenshot
      </button>
      <button id="sendBtn" onClick={onSendToLLM} disabled={sendDisabled}>
        Send to LLM
      </button>
    </div>
  );
}
