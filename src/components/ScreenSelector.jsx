import React from "react";

export default function ScreenSelector({
  screens,
  selectedScreenId,
  onSelect,
}) {
  if (!screens || screens.length === 0) return null;
  return (
    <div
      className="screen-selector"
      style={{ display: "flex", gap: 16, margin: "1em 0" }}
    >
      {screens.map((screen) => (
        <button
          key={screen.id}
          className={
            selectedScreenId === screen.id
              ? "screen-btn selected"
              : "screen-btn"
          }
          onClick={() => onSelect(screen.id)}
          style={{
            border:
              selectedScreenId === screen.id
                ? "2px solid #3b82f6"
                : "1px solid #ccc",
            background: selectedScreenId === screen.id ? "#eaf2ff" : "#fff",
            borderRadius: 8,
            padding: "1em 1.5em",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {screen.name || `Screen ${screen.id}`}
        </button>
      ))}
      <button
        className={
          selectedScreenId === "region" ? "screen-btn selected" : "screen-btn"
        }
        onClick={() => onSelect("region")}
        style={{
          border:
            selectedScreenId === "region"
              ? "2px solid #3b82f6"
              : "1px solid #ccc",
          background: selectedScreenId === "region" ? "#eaf2ff" : "#fff",
          borderRadius: 8,
          padding: "1em 1.5em",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Select Area
      </button>
    </div>
  );
}
