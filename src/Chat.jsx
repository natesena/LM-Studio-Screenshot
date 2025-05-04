import React from "react";
import ChatMessage from "./ChatMessage";

export default function Chat({ messages }) {
  return (
    <div className="chat-section">
      {messages.map((msg, i) => (
        <ChatMessage key={i} {...msg} />
      ))}
    </div>
  );
}
