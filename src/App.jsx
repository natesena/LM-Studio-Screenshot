import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import ScreenshotPreview from "./components/ScreenshotPreview";
import ActionButtons from "./components/ActionButtons";
import Chat from "./components/Chat";
import SettingsModal from "./components/SettingsModal";

const defaultSettings = {
  model: "gemma-3-4b-it-qat",
  max_tokens: 512,
  temperature: 0.7,
  windowTitle: "",
  prompt: "",
};

const initialConversation = () => ({
  id: Date.now().toString(),
  name: "",
  messages: [],
});

export default function App() {
  const [settings, setSettings] = useState(defaultSettings);
  const [modalOpen, setModalOpen] = useState(false);
  const [screenshot, setScreenshot] = useState({
    imagePath: null,
    fileSizeBytes: null,
    base64: null,
  });
  const [conversations, setConversations] = useState([initialConversation()]);
  const [currentConversationId, setCurrentConversationId] = useState(
    conversations[0].id
  );
  const [sending, setSending] = useState(false);
  const chatInputRef = useRef(null);

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );
  const chat = currentConversation ? currentConversation.messages : [];

  const handleSwitchConversation = (id) => {
    setCurrentConversationId(id);
  };

  const handleNewConversation = () => {
    const newConv = initialConversation();
    setConversations((prev) => [...prev, newConv]);
    setCurrentConversationId(newConv.id);
  };

  const handleOpenSettings = () => setModalOpen(true);
  const handleCancelSettings = () => setModalOpen(false);
  const handleSaveSettings = () => setModalOpen(false);
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Wire up Electron API for screenshot
  const handleTakeScreenshot = async () => {
    try {
      const result = await window.electronAPI.takeScreenshot(
        settings.windowTitle || undefined
      );
      const stats = await window.electronAPI.getFileStats(result.tmpPath);
      setScreenshot({
        imagePath: result.tmpPath,
        fileSizeBytes: stats.size,
        base64: result.base64,
      });
    } catch (err) {
      alert("Screenshot failed: " + err);
    }
  };

  // Wire up Electron API for LLM
  const handleSendToLLM = async () => {
    if (!screenshot.imagePath) return;
    setSending(true);
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [
                ...conv.messages,
                { role: "assistant", content: "Thinking..." },
              ],
            }
          : conv
      )
    );
    try {
      const result = await window.electronAPI.sendToLLM({
        model: settings.model,
        prompt: settings.prompt,
        max_tokens: settings.max_tokens,
        temperature: settings.temperature,
        imagePath: screenshot.imagePath,
      });
      // Remove the 'Thinking...' message and add the real response
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [
                  ...conv.messages.slice(0, -1),
                  {
                    role: "assistant",
                    content:
                      result.content ||
                      result.nonReasoningContent ||
                      "No response.",
                  },
                ],
              }
            : conv
        )
      );
    } catch (err) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [
                  ...conv.messages.slice(0, -1),
                  { role: "assistant", content: "Error: " + err },
                ],
              }
            : conv
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleUserSend = async (text) => {
    // Add user message and 'Thinking...' to current conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [
                ...conv.messages,
                {
                  role: "user",
                  content: text,
                  imagePath: screenshot.imagePath,
                  base64: screenshot.base64,
                },
                { role: "assistant", content: "Thinking..." },
              ],
            }
          : conv
      )
    );
    setScreenshot({ imagePath: null, fileSizeBytes: null, base64: null });
    setSending(true);
    try {
      // Build full conversation history for LLM
      const messagesForLLM = currentConversation.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        ...(msg.imagePath ? { images: [msg.imagePath] } : {}),
      }));
      messagesForLLM.push({
        role: "user",
        content: text,
        ...(screenshot.imagePath ? { images: [screenshot.imagePath] } : {}),
      });
      const llmPayload = {
        model: settings.model,
        messages: messagesForLLM,
        max_tokens: settings.max_tokens,
        temperature: settings.temperature,
      };
      const result = await window.electronAPI.sendToLLM(llmPayload);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [
                  ...conv.messages.slice(0, -1),
                  {
                    role: "assistant",
                    content:
                      result.content ||
                      result.nonReasoningContent ||
                      "No response.",
                  },
                ],
              }
            : conv
        )
      );
    } catch (err) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [
                  ...conv.messages.slice(0, -1),
                  { role: "assistant", content: "Error: " + err },
                ],
              }
            : conv
        )
      );
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (window.electronAPI?.onTriggerScreenshot) {
      window.electronAPI.onTriggerScreenshot(() => {
        handleTakeScreenshot();
      });
    }
  }, [handleTakeScreenshot]);

  return (
    <div className="container">
      <Header
        onOpenSettings={handleOpenSettings}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSwitchConversation={handleSwitchConversation}
        onNewConversation={handleNewConversation}
      />
      <ScreenshotPreview
        imagePath={screenshot.imagePath}
        fileSizeBytes={screenshot.fileSizeBytes}
        base64={screenshot.base64}
      />
      <ActionButtons
        onTakeScreenshot={handleTakeScreenshot}
        onSendToLLM={handleSendToLLM}
        sendDisabled={!screenshot.imagePath || sending}
      />
      <Chat
        ref={chatInputRef}
        messages={chat}
        onSend={handleUserSend}
        screenshot={screenshot}
        setScreenshot={setScreenshot}
      />
      <SettingsModal
        open={modalOpen}
        settings={settings}
        onChange={handleSettingsChange}
        onSave={handleSaveSettings}
        onCancel={handleCancelSettings}
      />
    </div>
  );
}
