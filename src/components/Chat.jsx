import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import ChatMessage from "./ChatMessage";

const Chat = forwardRef(function Chat(
  { messages, onSend, screenshot, setScreenshot },
  ref
) {
  const [input, setInput] = React.useState("");
  const inputRef = useRef(null);

  // Expose focusInput to parent
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      inputRef.current && inputRef.current.focus();
    },
  }));

  // Focus input when screenshot is added
  useEffect(() => {
    if (screenshot.base64) {
      inputRef.current && inputRef.current.focus();
    }
  }, [screenshot.base64]);

  return (
    <div className="chat-section">
      <div>
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
      </div>
      {screenshot.base64 && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <img
            src={`data:image/png;base64,${screenshot.base64}`}
            alt="Screenshot preview"
            style={{
              maxWidth: 120,
              maxHeight: 80,
              borderRadius: 6,
              border: "1px solid #e0e0e0",
              marginRight: 8,
            }}
          />
          <button
            type="button"
            onClick={() =>
              setScreenshot({
                imagePath: null,
                fileSizeBytes: null,
                base64: null,
              })
            }
            style={{
              background: "#eee",
              border: "none",
              borderRadius: 6,
              padding: "0.3em 0.8em",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Remove
          </button>
        </div>
      )}
      <form
        className="chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() || screenshot.base64) {
            onSend(input);
            setInput("");
          }
        }}
      >
        <div className="chat-input-container">
          {screenshot.base64 && (
            <div className="chat-input-image-preview">
              <img
                src={`data:image/png;base64,${screenshot.base64}`}
                alt="Screenshot preview"
                className="chat-input-image"
              />
              <button
                type="button"
                className="chat-input-remove-btn"
                onClick={() =>
                  setScreenshot({
                    imagePath: null,
                    fileSizeBytes: null,
                    base64: null,
                  })
                }
              >
                ×
              </button>
            </div>
          )}
          <input
            className="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            ref={inputRef}
          />
        </div>
        <button type="submit" className="chat-send-btn">
          Send
        </button>
      </form>
    </div>
  );
});

export default Chat;
