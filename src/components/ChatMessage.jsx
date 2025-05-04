import React from "react";
import ReactMarkdown from "react-markdown";

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
          <>
            {src && <img src={src} alt="Screenshot" />}
            {content && <div style={{ marginTop: src ? 8 : 0 }}>{content}</div>}
          </>
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
