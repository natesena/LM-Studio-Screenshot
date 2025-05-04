import React from "react";

export default function Header({
  onOpenSettings,
  conversations,
  currentConversationId,
  onSwitchConversation,
  onNewConversation,
}) {
  return (
    <div className="header">
      <div className="conversations-list">
        {conversations.map((conv) =>
          conv.name ? (
            <button
              key={conv.id}
              className={
                "conversation-tab" +
                (conv.id === currentConversationId ? " active" : "")
              }
              onClick={() => onSwitchConversation(conv.id)}
            >
              {conv.name}
            </button>
          ) : null
        )}
        <button
          className="new-conversation-btn"
          onClick={onNewConversation}
          title="New Conversation"
        >
          ＋
        </button>
      </div>
      <span className="title">Screenshot Sender</span>
      <button
        className="gear-btn"
        title="Settings"
        onClick={onOpenSettings}
        style={{ marginRight: 16 }}
      >
        &#9881;
      </button>
    </div>
  );
}
