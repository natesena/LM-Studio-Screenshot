import React from "react";

const AVAILABLE_MODELS = ["gemma-3-4b-it-qat", "gemma-3-27b-it-qat"];

export default function SettingsModal({
  open,
  settings,
  onChange,
  onSave,
  onCancel,
  availableScreens = [],
}) {
  if (!open) return null;

  const handleModelChange = (e) => {
    onChange({
      target: {
        name: "model",
        value: e.target.value,
      },
    });
  };

  const handleScreenChange = (e) => {
    onChange({
      target: {
        name: "screenId",
        value: e.target.value,
      },
    });
  };

  return (
    <>
      <div className="modal-bg" onClick={onCancel} />
      <div className="modal" style={{ display: "flex" }}>
        <label>
          Model
          <select
            name="model"
            value={settings.model}
            onChange={handleModelChange}
            style={{
              width: "100%",
              padding: "0.5em",
              borderRadius: "5px",
              border: "1px solid #ddd",
              fontSize: "1em",
            }}
          >
            {AVAILABLE_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
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
