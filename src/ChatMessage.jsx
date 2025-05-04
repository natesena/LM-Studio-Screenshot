import React from "react";

export default function ChatMessage({ role, imagePath, content, base64 }) {
  let src = null;
  if (base64) {
    src = `data:image/png;base64,${base64}`;
  } else if (imagePath) {
    src = `file://${imagePath}`;
  }
  return (
    <div className={`chat-message ${role}`}>
      <div className="avatar">{role === "user" ? "🖼️" : "🤖"}</div>
      <div className="chat-bubble">
        {role === "user" ? (
          <img src={src} alt="Screenshot" />
        ) : (
          <div>{content}</div>
        )}
      </div>
    </div>
  );
}
