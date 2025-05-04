import React from "react";

function humanFileSize(bytes) {
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) return bytes + " B";
  const units = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + " " + units[u];
}

export default function ScreenshotPreview({
  imagePath,
  fileSizeBytes,
  base64,
}) {
  let src = null;
  if (base64) {
    src = `data:image/png;base64,${base64}`;
  } else if (imagePath) {
    src = `file://${imagePath}`;
  }
  return (
    <div className="screenshot-section">
      <div className="screenshot-info">
        {fileSizeBytes
          ? `Screenshot size: ${fileSizeBytes} bytes (${humanFileSize(
              fileSizeBytes
            )})`
          : "No screenshot taken yet."}
      </div>
      {src && <img id="screenshotPreview" src={src} alt="Screenshot preview" />}
    </div>
  );
}
