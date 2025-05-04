import React from "react";

export default function SettingsModal({
  open,
  settings,
  onChange,
  onSave,
  onCancel,
}) {
  if (!open) return null;
  return (
    <>
      <div className="modal-bg" onClick={onCancel} />
      <div className="modal" style={{ display: "flex" }}>
        <label>
          Model
          <input name="model" value={settings.model} onChange={onChange} />
        </label>
        <label>
          Max Tokens
          <input
            name="max_tokens"
            type="number"
            value={settings.max_tokens}
            onChange={onChange}
          />
        </label>
        <label>
          Temperature
          <input
            name="temperature"
            type="number"
            step="0.01"
            value={settings.temperature}
            onChange={onChange}
          />
        </label>
        <label>
          Window Title (optional)
          <input
            name="windowTitle"
            value={settings.windowTitle}
            onChange={onChange}
            placeholder="Leave blank for full screen"
          />
        </label>
        <label>
          Prompt (optional)
          <input
            name="prompt"
            value={settings.prompt}
            onChange={onChange}
            placeholder="Describe this image"
          />
        </label>
        <div className="modal-actions">
          <button className="save-btn" onClick={onSave}>
            Save
          </button>
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
