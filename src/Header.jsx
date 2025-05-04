import React from "react";

export default function Header({ onOpenSettings }) {
  return (
    <div className="header">
      <span className="title">Screenshot Sender</span>
      <button className="gear-btn" title="Settings" onClick={onOpenSettings}>
        &#9881;
      </button>
    </div>
  );
}
