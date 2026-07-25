import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSelector } from "react-redux";
import { useChat } from "./hooks/useChat";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  .ms {
    font-family: "Material Symbols Outlined";
    font-weight: normal; font-style: normal; font-size: 22px; line-height: 1;
    letter-spacing: normal; text-transform: none; display: inline-block;
    white-space: nowrap; direction: ltr; -webkit-font-smoothing: antialiased; user-select: none;
  }
  .ms-fill { font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24; }
  @keyframes blink { 0%,100%{opacity:.25} 50%{opacity:1} }
  .dot1{animation:blink 1.3s 0.0s infinite}
  .dot2{animation:blink 1.3s 0.2s infinite}
  .dot3{animation:blink 1.3s 0.4s infinite}
  @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .msg-in { animation: fadeSlideIn 0.25s ease-out both; }
  @keyframes pulseGlow { 0%,100%{box-shadow:0 0 18px rgba(160,120,255,0.28)} 50%{box-shadow:0 0 32px rgba(160,120,255,0.55)} }
  .logo-glow { animation: pulseGlow 3s ease-in-out infinite; }
  .thin-scroll::-webkit-scrollbar { width: 4px; }
  .thin-scroll::-webkit-scrollbar-track { background: transparent; }
  .thin-scroll::-webkit-scrollbar-thumb { background: rgba(149,142,160,0.3); border-radius: 9999px; }
  .no-scroll::-webkit-scrollbar { display: none; }
  .no-scroll { -ms-overflow-style:none; scrollbar-width:none; }
  .ai-prose { font-family: Inter, sans-serif; font-size: 15px; line-height: 1.7; color: #dae2fd; }
  .ai-prose p { margin: 0 0 0.6rem; }
  .ai-prose p:last-child { margin-bottom: 0; }
  .ai-prose h1,.ai-prose h2,.ai-prose h3 { color: #d0bcff; font-weight: 600; margin: 1rem 0 0.4rem; }
  .ai-prose h1 { font-size: 1.2em; }
  .ai-prose h2 { font-size: 1.08em; }
  .ai-prose h3 { font-size: 1em; }
  .ai-prose ul,.ai-prose ol { padding-left: 1.4rem; margin: 0.4rem 0 0.6rem; }
  .ai-prose ul { list-style: disc; }
  .ai-prose ol { list-style: decimal; }
  .ai-prose li { margin-bottom: 0.25rem; }
  .ai-prose strong { color: #d0bcff; font-weight: 600; }
  .ai-prose em { color: #cbc3d7; font-style: italic; }
  .ai-prose a { color: #a078ff; text-decoration: underline; }
  .ai-prose blockquote { border-left: 3px solid #494454; padding-left: 1rem; color: #958ea0; margin: 0.6rem 0; font-style: italic; }
  .ai-prose hr { border: none; border-top: 1px solid #494454; margin: 1rem 0; }
  .ai-prose code { background: rgba(160,120,255,0.15); color: #d0bcff; padding: 1px 6px; border-radius: 5px; font-family: 'JetBrains Mono', monospace; font-size: 0.84em; border: 1px solid rgba(160,120,255,0.2); }
  .ai-prose pre { background: rgba(6,14,32,0.9); border: 1px solid rgba(73,68,84,0.6); border-radius: 10px; padding: 1rem 1.1rem; overflow-x: auto; margin: 0.7rem 0; }
  .ai-prose pre code { background: none; border: none; padding: 0; font-size: 0.87em; color: #dae2fd; }
  .ai-prose table { border-collapse: collapse; width: 100%; margin: 0.6rem 0; font-size: 0.9em; }
  .ai-prose th { background: rgba(160,120,255,0.12); color: #d0bcff; padding: 0.4rem 0.8rem; border: 1px solid #494454; text-align: left; font-weight: 600; }
  .ai-prose td { padding: 0.35rem 0.8rem; border: 1px solid #494454; color: #cbc3d7; }
  .ai-prose tr:nth-child(even) td { background: rgba(255,255,255,0.03); }
  .chat-nav-item { transition: background 0.15s; }
  .chat-nav-item:hover { background: rgba(19,27,46,0.8) !important; }
  .chat-nav-item:hover .del-btn { opacity: 1 !important; }
  .del-btn { opacity: 0 !important; transition: opacity 0.15s; }
  .send-btn:hover:not(:disabled) { transform: scale(1.07); }
  .send-btn:active:not(:disabled) { transform: scale(0.94); }
  .chip:hover { border-color: rgba(160,120,255,0.6) !important; color: #d0bcff !important; }
`;

export default function Dashboard() {
  const chat = useChat();
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const [messageText, setMessageText] = useState("");
  const [isNewChat, setIsNewChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const chats = useSelector((s) => s.chat.chats);
  const currentChat = useSelector((s) => s.chat.currentChat);
  const user = useSelector((s) => s.auth.user);

  const chatList = Object.entries(chats)
    .map(([id, c]) => ({ id, title: c.title || "Untitled Chat", messages: c.messages || [], lastUpdated: c.lastUpdated || 0 }))
    .sort((a, b) => b.lastUpdated - a.lastUpdated);

  const activeChat = isNewChat
    ? { id: "new", messages: [] }
    : currentChat
    ? chats[currentChat] || chatList.find((x) => x.id === currentChat)
    : chatList[0];

  const messages = activeChat?.messages || [];
  const initial = (user?.username?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();

  // On mount: load all chats then auto-open the most recent one
  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats().then((sortedChats) => {
      if (sortedChats && sortedChats.length > 0) {
        const firstId = sortedChats[0]._id;
        chat.handleSetCurrentChat(firstId);
        chat.handleGetMessages(firstId);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() || sending) return;
    const msg = messageText;
    const wasNewChat = isNewChat;
    setMessageText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSending(true);
    // Optimistically show the user message immediately
    setIsNewChat(false);
    try {
      await chat.handleSendMessage({ chatId: wasNewChat ? null : currentChat, message: msg });
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  const openChat = (id) => {
    setIsNewChat(false);
    chat.handleSetCurrentChat(id);
    chat.handleGetMessages(id);
  };

  const suggestions = ["Explain quantum computing", "Write a Python script", "Summarize a topic", "Help me brainstorm"];

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ fontFamily: "Inter, sans-serif", background: "#0b1326", color: "#dae2fd", height: "100vh", display: "flex", overflow: "hidden" }}>

        {/* SIDEBAR */}
        <aside style={{ width: sidebarOpen ? 272 : 0, minWidth: sidebarOpen ? 272 : 0, overflow: "hidden", background: "#060e20", borderRight: "1px solid #494454", transition: "width 0.3s, min-width 0.3s", flexShrink: 0 }}>
          <div style={{ width: 272, height: "100%", display: "flex", flexDirection: "column", padding: "24px 12px 16px" }}>

            {/* Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 8px 28px" }}>
              <div className="logo-glow" style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#a078ff,#3131c0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="ms ms-fill" style={{ color: "#fff", fontSize: 20 }}>bolt</span>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#d0bcff", letterSpacing: "-0.02em" }}>Perplexity</div>
                <div style={{ fontSize: 10, color: "#958ea0", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>AI Assistant</div>
              </div>
            </div>

            {/* New Chat */}
            <button
              onClick={() => { setIsNewChat(true); chat.handleSetCurrentChat(null); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg,#a078ff,#3131c0)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 16px", fontFamily: "Inter", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 24, boxShadow: "0 0 20px rgba(160,120,255,0.3)", transition: "opacity 0.2s" }}
              onMouseOver={e => e.currentTarget.style.opacity = "0.88"}
              onMouseOut={e => e.currentTarget.style.opacity = "1"}
            >
              <span className="ms" style={{ fontSize: 18 }}>add_comment</span>New Chat
            </button>

            {/* History label */}
            <div style={{ fontSize: 10, color: "#958ea0", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px 10px", fontWeight: 700 }}>Recent Chats</div>

            {/* Chat list */}
            <div className="thin-scroll" style={{ flex: 1, overflowY: "auto" }}>
              {chatList.length === 0 ? (
                <div style={{ padding: "16px 8px", fontSize: 13, color: "#958ea0", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>No chats yet.<br />Start a conversation!</div>
              ) : chatList.map((item) => {
                const isActive = item.id === currentChat && !isNewChat;
                return (
                  <div key={item.id} className="chat-nav-item" onClick={() => openChat(item.id)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2, color: isActive ? "#d0bcff" : "#cbc3d7", borderLeft: isActive ? "2px solid #d0bcff" : "2px solid transparent", background: isActive ? "rgba(49,49,192,0.14)" : "transparent", fontWeight: isActive ? 600 : 400, position: "relative" }}>
                    <span className="ms" style={{ fontSize: 15, opacity: 0.55, flexShrink: 0 }}>chat_bubble</span>
                    <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{item.title}</span>
                    <button className="del-btn" onClick={(e) => { e.stopPropagation(); chat.handleDeleteChat(item.id); }}
                      style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", padding: "2px 7px", borderRadius: 6, fontSize: 11, fontFamily: "Inter", flexShrink: 0 }}>x</button>
                  </div>
                );
              })}
            </div>

            {/* User footer */}
            <div style={{ borderTop: "1px solid #494454", paddingTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#a078ff,#3131c0)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff", flexShrink: 0 }}>{initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#dae2fd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.username || user?.email || "User"}</div>
                <div style={{ fontSize: 11, color: "#958ea0" }}>Logged in</div>
              </div>
              <span className="ms" style={{ color: "#958ea0", fontSize: 18, cursor: "pointer" }}>settings</span>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

          {/* Top bar */}
          <header style={{ height: 58, background: "rgba(11,19,38,0.82)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid #494454", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setSidebarOpen(v => !v)}
                style={{ width: 34, height: 34, background: "none", border: "none", cursor: "pointer", color: "#958ea0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, transition: "background 0.15s" }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                onMouseOut={e => e.currentTarget.style.background = "none"}
              >
                <span className="ms" style={{ fontSize: 20 }}>menu</span>
              </button>
              <span style={{ fontWeight: 600, fontSize: 15, color: "#dae2fd" }}>{isNewChat ? "New Conversation" : (activeChat?.title || "AI Chat")}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#171f33", border: "1px solid #494454", borderRadius: 999, padding: "3px 10px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#958ea0", letterSpacing: "0.1em", textTransform: "uppercase" }}>Gemini Online</span>
              </div>
            </div>
            <button onClick={chat.handleGetChats}
              style={{ background: "none", border: "1px solid #494454", borderRadius: 8, padding: "5px 14px", color: "#958ea0", fontSize: 12, fontFamily: "Inter", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s" }}
              onMouseOver={e => e.currentTarget.style.color = "#d0bcff"}
              onMouseOut={e => e.currentTarget.style.color = "#958ea0"}
            >
              <span className="ms" style={{ fontSize: 15 }}>refresh</span>Refresh
            </button>
          </header>

          {/* Messages */}
          <section className="thin-scroll" style={{ flex: 1, overflowY: "auto", padding: "32px 0 160px" }}>
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 20 }}>

              {messages.length === 0 && !sending && (
                <div className="msg-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80, gap: 20 }}>
                  <div className="logo-glow" style={{ width: 68, height: 68, borderRadius: 20, background: "linear-gradient(135deg,#a078ff,#3131c0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="ms ms-fill" style={{ fontSize: 34, color: "#fff" }}>auto_awesome</span>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 24, color: "#d0bcff", marginBottom: 8 }}>Hello, {user?.username || "there"}!</div>
                    <div style={{ fontSize: 15, color: "#958ea0", lineHeight: 1.6 }}>Ask me anything. Powered by Gemini AI.</div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 8 }}>
                    {suggestions.map((s) => (
                      <button key={s} className="chip" onClick={() => setMessageText(s)}
                        style={{ background: "rgba(160,120,255,0.08)", border: "1px solid rgba(160,120,255,0.25)", borderRadius: 9999, padding: "6px 16px", fontSize: 13, color: "#cbc3d7", cursor: "pointer", fontFamily: "Inter", transition: "all 0.15s" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) =>
                msg.role === "user" ? (
                  <div key={i} className="msg-in" style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ maxWidth: "76%", padding: "12px 18px", borderRadius: "18px 18px 4px 18px", background: "linear-gradient(135deg,#a078ff,#3131c0)", color: "#fff", fontSize: 15, lineHeight: 1.6, boxShadow: "0 0 18px rgba(160,120,255,0.25)" }}>
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="msg-in" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#131b2e", border: "1px solid #494454", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="ms ms-fill" style={{ color: "#d0bcff", fontSize: 18 }}>auto_awesome</span>
                    </div>
                    <div style={{ maxWidth: "calc(100% - 52px)", padding: "14px 18px", borderRadius: "4px 18px 18px 18px", background: "rgba(19,27,46,0.65)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="ai-prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )
              )}

              {sending && (
                <div className="msg-in" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#131b2e", border: "1px solid #494454", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span className="ms ms-fill" style={{ color: "#d0bcff", fontSize: 18 }}>auto_awesome</span>
                  </div>
                  <div style={{ padding: "16px 20px", borderRadius: "4px 18px 18px 18px", background: "rgba(19,27,46,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 6, alignItems: "center" }}>
                    <span className="dot1" style={{ width: 8, height: 8, borderRadius: "50%", background: "#d0bcff", display: "inline-block" }} />
                    <span className="dot2" style={{ width: 8, height: 8, borderRadius: "50%", background: "#d0bcff", display: "inline-block" }} />
                    <span className="dot3" style={{ width: 8, height: 8, borderRadius: "50%", background: "#d0bcff", display: "inline-block" }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </section>

          {/* Glass input bar */}
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 48px)", maxWidth: 740, zIndex: 50 }}>
            <form onSubmit={handleSubmit}>
              <div style={{ borderRadius: 20, padding: "10px 10px 10px 18px", display: "flex", alignItems: "flex-end", gap: 10, background: "rgba(19,27,46,0.78)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 22px rgba(160,120,255,0.18)" }}>
                <textarea ref={textareaRef} value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={handleKeyDown} onInput={autoResize}
                  placeholder="Ask anything..." rows={1} disabled={sending} className="no-scroll"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#dae2fd", fontFamily: "Inter", fontSize: 15, lineHeight: 1.6, resize: "none", maxHeight: 140, padding: "6px 0" }} />
                <button type="submit" disabled={sending || !messageText.trim()} className="send-btn"
                  style={{ width: 44, height: 44, borderRadius: 13, background: sending || !messageText.trim() ? "#222a3d" : "linear-gradient(135deg,#a078ff,#3131c0)", border: "none", cursor: sending || !messageText.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                  <span className="ms ms-fill" style={{ color: "#fff", fontSize: 20 }}>{sending ? "hourglass_empty" : "send"}</span>
                </button>
              </div>
              <p style={{ textAlign: "center", fontSize: 10, color: "#494454", marginTop: 7, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Perplexity AI - Enter to send - Shift+Enter for new line
              </p>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
