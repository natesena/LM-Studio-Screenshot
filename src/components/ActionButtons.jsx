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
    </div>
  );
}
