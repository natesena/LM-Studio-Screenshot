import React, { useState } from "react";
import Header from "./Header";
import ScreenshotPreview from "./ScreenshotPreview";
import ActionButtons from "./ActionButtons";
import Chat from "./Chat";
import SettingsModal from "./SettingsModal";

const defaultSettings = {
  model: "gemma-3-4b-it-qat",
  max_tokens: 50,
  temperature: 0.7,
  windowTitle: "",
  prompt: "",
};

export default function App() {
  const [settings, setSettings] = useState(defaultSettings);
  const [modalOpen, setModalOpen] = useState(false);
  const [screenshot, setScreenshot] = useState({
    imagePath: null,
    fileSizeBytes: null,
    base64: null,
  });
  const [chat, setChat] = useState([]);
  const [sending, setSending] = useState(false);

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
      setChat((prev) => [
        ...prev,
        { role: "user", imagePath: result.tmpPath, base64: result.base64 },
      ]);
    } catch (err) {
      alert("Screenshot failed: " + err);
    }
  };

  // Wire up Electron API for LLM
  const handleSendToLLM = async () => {
    if (!screenshot.imagePath) return;
    setSending(true);
    setChat((prev) => [...prev, { role: "assistant", content: "Thinking..." }]);
    try {
      const result = await window.electronAPI.sendToLLM({
        model: settings.model,
        prompt: settings.prompt,
        max_tokens: settings.max_tokens,
        temperature: settings.temperature,
        imagePath: screenshot.imagePath,
      });
      // Remove the 'Thinking...' message and add the real response
      setChat((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            result.content || result.nonReasoningContent || "No response.",
        },
      ]);
    } catch (err) {
      setChat((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Error: " + err },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container">
      <Header onOpenSettings={handleOpenSettings} />
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
      <Chat messages={chat} />
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
