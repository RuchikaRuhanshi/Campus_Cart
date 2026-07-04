import { useState, useRef, useEffect } from "react";
import api from "../utils/api";
import { FiMessageSquare, FiX, FiSend, FiCpu, FiZap, FiShield, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const AICopilot = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hey! I am your CampusCart AI Copilot 🤖. I can draft listing descriptions, suggest pricing ranges, share negotiation tactics, or guide you on safe handover locations. What's on your mind?"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [thinking, setThinking] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText("");
    
    // Add user message
    setMessages(prev => [...prev, { sender: "user", text }]);
    setThinking(true);

    if (!isAuthenticated) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: "ai",
          text: "I would love to help you draft listings or predict sales, but you need to be logged in first! Please log in or sign up to talk to me. 🔒"
        }]);
        setThinking(false);
      }, 1000);
      return;
    }

    try {
      const res = await api.post("/analytics/chat", { message: text });
      if (res.data.success) {
        setMessages(prev => [...prev, { sender: "ai", text: res.data.data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: "ai",
        text: "Oops! I encountered a connection issue. Please make sure the backend server is running and try again."
      }]);
    } finally {
      setThinking(false);
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#8b6d48] via-[#b8b18b] to-[#e7d4ae] text-white shadow-2xl hover:scale-105 active:scale-95 transition transform duration-200 group relative"
          title="Open AI Copilot"
        >
          <FiZap size={24} className="animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[500px] bg-white dark:bg-[#1c140c] border border-border-color rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#8b6d48] via-[#b8b18b] to-[#e7d4ae] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                <FiCpu size={18} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wide leading-tight flex items-center gap-1">
                  AI Copilot <FiZap size={12} className="fill-current text-yellow-300" />
                </h4>
                <p className="text-[10px] text-white/80 font-medium">Active Campus Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 transition text-white"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fbf9f4] dark:bg-[#120b05]" data-lenis-prevent>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] p-3.5 rounded-[22px] text-sm leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[#3e1a53] text-white rounded-br-none"
                      : "bg-surface border border-border-color text-text-primary dark:text-white rounded-bl-none"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Thinking / Loading indicator */}
            {thinking && (
              <div className="flex justify-start">
                <div className="max-w-[82%] p-3.5 rounded-[22px] rounded-bl-none bg-surface border border-border-color text-text-secondary text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="px-4 py-2 bg-[var(--bg-surface)] border-t border-border-color flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none" data-lenis-prevent>
            <button
              onClick={() => handleSuggestedPrompt("Draft a textbook listing")}
              className="px-3 py-1.5 bg-[var(--bg-primary)] border border-border-color rounded-full text-xs font-semibold text-text-secondary hover:text-text-primary transition"
            >
              ✍️ Draft Listing
            </button>
            <button
              onClick={() => handleSuggestedPrompt("Safety tips for trades")}
              className="px-3 py-1.5 bg-[var(--bg-primary)] border border-border-color rounded-full text-xs font-semibold text-text-secondary hover:text-text-primary transition"
            >
              🔒 Safety Rules
            </button>
            <button
              onClick={() => handleSuggestedPrompt("Negotiation tips")}
              className="px-3 py-1.5 bg-[var(--bg-primary)] border border-border-color rounded-full text-xs font-semibold text-text-secondary hover:text-text-primary transition"
            >
              🤝 Negotiate Tips
            </button>
          </div>

          {/* Chat Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-[#1c140c] border-t border-border-color flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Ask anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[var(--bg-primary)] px-4 py-3 rounded-full border border-border-color focus:ring-1 focus:ring-[#8b6d48] outline-none text-sm text-text-primary font-medium"
            />
            <button
              type="submit"
              className="p-3 bg-[#8b6d48] text-white rounded-full hover:bg-[#7a5d3f] transition active:scale-95 flex items-center justify-center shadow-md"
            >
              <FiSend size={16} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default AICopilot;
