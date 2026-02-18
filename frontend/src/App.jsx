import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import Robot from "./Robot";
import voiceService from "./VoiceService";
import "./style.css";

// ─── Socket singleton ──────────────────────────────────────
const socket = io("http://localhost:3000", { autoConnect: true });

// ─── Inline-markdown renderer (bold + code + line-breaks) ──
function RenderText({ text }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
        return (
          <span key={i}>
            {parts.map((part, j) => {
              if (part.startsWith("`") && part.endsWith("`"))
                return <code key={j} className="inline-code">{part.slice(1, -1)}</code>;
              if (part.startsWith("**") && part.endsWith("**"))
                return <strong key={j}>{part.slice(2, -2)}</strong>;
              return part;
            })}
            {i < lines.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

// ─── Typing dots ───────────────────────────────────────────
function TypingDots() {
  return (
    <div className="typing-indicator">
      <span /><span /><span />
    </div>
  );
}

// ─── Single message bubble ─────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`msg-row ${isUser ? "msg-row--user" : "msg-row--ai"}`}>
      {!isUser && (
        <div className="avatar avatar--ai">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
            <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
            <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </div>
      )}

      <div className={`bubble ${isUser ? "bubble--user" : "bubble--ai"}`}>
        {msg.typing
          ? <TypingDots />
          : <RenderText text={msg.content} />
        }
        {!msg.typing && (
          <span className="bubble__time">
            {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {isUser && <div className="avatar avatar--user">U</div>}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "ai",
      content: "Hey there! I'm Nexus. Ask me anything 👋",
      ts: Date.now(),
    },
  ]);
  const [input, setInput]           = useState("");
  const [connected, setConnected]   = useState(false);
  const [robotState, setRobotState] = useState("wave");
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const bottomRef     = useRef(null);
  const textareaRef   = useRef(null);
  const thinkingIdRef = useRef(null);

  // ── Socket events ────────────────────────────────────────
  useEffect(() => {
    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("ai-message-response", ({ mama }) => {
      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        { id: crypto.randomUUID(), role: "ai", content: mama, ts: Date.now() },
      ]);
      setRobotState("idle");
      thinkingIdRef.current = null;
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("ai-message-response");
    };
  }, []);

  // ── Wave → idle ──────────────────────────────────────────
  useEffect(() => {
    if (robotState === "wave") {
      const t = setTimeout(() => setRobotState("idle"), 4200);
      return () => clearTimeout(t);
    }
  }, [robotState]);

  // ── Voice sync ───────────────────────────────────────────
  useEffect(() => {
    voiceService.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  // ── sent → thinking ──────────────────────────────────────
  useEffect(() => {
    if (robotState === "sent") {
      const t = setTimeout(() => setRobotState("thinking"), 320);
      return () => clearTimeout(t);
    }
  }, [robotState]);

  // ── Auto-scroll ──────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Auto-resize textarea ─────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, [input]);

  // ── 🎙️ LinkedIn Introduction Speech ──────────────────────
  const playIntroduction = useCallback(() => {
    const introText = ` Hare Krishna Hare Krishna, Krishna Krishna Hare Hare. Hare Rama Hare Rama, Rama Rama Hare Hare. Namaste! Aapka swagat hai. I am Nexus AI, an intelligent chatbot with a 3D animated robot interface. Jai Shri Krishna!`;
    
    setRobotState("thinking"); // Mouth moves while speaking
    voiceService.speak(introText, {
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0
    });

    // Return to idle after speech finishes (approximate timing)
    setTimeout(() => {
      setRobotState("idle");
    }, (introText.length / 15) * 1000);
  }, []);

  // Make playIntroduction available globally for console
  useEffect(() => {
    window.playIntroduction = playIntroduction;
    return () => { delete window.playIntroduction; };
  }, [playIntroduction]);

  // ── Send ─────────────────────────────────────────────────
  const send = useCallback(() => {
    const text = input.trim();
    if (!text || robotState === "thinking") return;

    const typingId = crypto.randomUUID();
    thinkingIdRef.current = typingId;

    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text, ts: Date.now() },
      { id: typingId, role: "ai", content: "", typing: true, ts: Date.now() },
    ]);

    setInput("");
    setRobotState("sent");
    
    voiceService.speak(text, {
      rate: 1.1,
      pitch: 1.0,
      volume: 1.0
    });
    
    socket.emit("ai-messages", text);
  }, [input, robotState]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: "clear",
      role: "ai",
      content: "Chat cleared. What's on your mind?",
      ts: Date.now(),
    }]);
    setRobotState("idle");
  };

  const isThinking = robotState === "thinking";

  return (
    <div className="shell">
      <Robot state={robotState} />

      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
      <div className="bg-orb bg-orb--3" />

      <div className="window">
        <header className="header">
          <div className="header__left">
            <div className="logo">
              <svg viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="url(#hg)" strokeWidth="2"/>
                <path d="M10 16c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="url(#hg)" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="16" cy="16" r="2.5" fill="url(#hg)"/>
                <defs>
                  <linearGradient id="hg" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a78bfa"/>
                    <stop offset="1" stopColor="#38bdf8"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div className="header__title">Nexus AI</div>
              <div className="header__sub">
                <span className={`status-dot ${connected ? "status-dot--on" : "status-dot--off"}`} />
                {connected ? "Connected" : "Connecting…"}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {/* 🎬 PLAY INTRO BUTTON FOR LINKEDIN VIDEO */}
            <button 
              className="icon-btn" 
              onClick={playIntroduction}
              title="Play LinkedIn introduction"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>

            <button 
              className="icon-btn" 
              onClick={() => setVoiceEnabled(!voiceEnabled)} 
              title={voiceEnabled ? "Mute voice" : "Enable voice"}
            >
              {voiceEnabled ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>
                </svg>
              )}
            </button>

            <button className="icon-btn" onClick={clearChat} title="Clear chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
              </svg>
            </button>
          </div>
        </header>

        <main className="messages">
          {messages.map(msg => <Message key={msg.id} msg={msg} />)}
          <div ref={bottomRef} />
        </main>

        <footer className="composer">
          <div className="composer__box">
            <textarea
              ref={textareaRef}
              className="composer__input"
              placeholder="Send a message… (Enter ↵ to send)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isThinking}
            />
            <button
              className={`send-btn ${input.trim() && !isThinking ? "send-btn--active" : ""}`}
              onClick={send}
              disabled={!input.trim() || isThinking}
              title="Send"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
          <p className="composer__hint">
            AI can make mistakes — always verify important information.
          </p>
        </footer>
      </div>
    </div>
  );
}