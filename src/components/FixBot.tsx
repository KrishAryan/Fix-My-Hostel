"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Sparkles, RefreshCw } from "lucide-react";

interface Message {
  role: "bot" | "user";
  text: string;
}

export default function FixBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "👋 Hi there! I'm FixBot, your AI Hostel Assistant powered by Gemini. Ask me about raising complaints, priority scoring, hostel rules, or tracking your issue.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (e?: React.FormEvent | string) => {
    if (e && typeof e !== "string") {
      e.preventDefault();
    }

    const userMessage = (typeof e === "string" ? e : input).trim();
    if (!userMessage || isStreaming) return;

    // Append user message immediately
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok || !response.body) {
        let errorMsg = "Chat request failed.";
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg = errData.error;
        } catch {
          // ignore json parse error
        }
        throw new Error(errorMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          accumulatedText += chunk;

          if (isFirstChunk) {
            // Disable typing indicator as soon as the first stream chunk arrives
            setIsTyping(false);
            isFirstChunk = false;
            // Append incoming tokens into the new assistant message bubble
            setMessages((prev) => [...prev, { role: "bot", text: accumulatedText }]);
          } else {
            // Stream tokens word-by-word into the active assistant bubble
            setMessages((prev) => {
              const updated = [...prev];
              if (updated.length > 0) {
                updated[updated.length - 1] = { role: "bot", text: accumulatedText };
              }
              return updated;
            });
          }
        }
      }
    } catch (error: any) {
      console.error("FixBot streaming error:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: error?.message
            ? `⚠️ ${error.message}`
            : "⚠️ Sorry, I encountered a temporary connection issue. Please check your network or try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "bot",
        text: "Conversation cleared. How else can I assist you with your hostel issues today?",
      },
    ]);
  };

  const quickActions = [
    { label: "Check Status", query: "How do I check the status of my complaint?" },
    { label: "Priority Formula", query: "How is complaint priority score calculated?" },
    { label: "Hostel Rules", query: "What are the key hostel rules and timings?" },
    { label: "Emergency Contacts", query: "Who do I contact for emergency hostel repairs or safety issues?" },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[520px] max-h-[85vh] bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-blue-600"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm leading-tight text-white">FixBot AI</h4>
                    <span className="flex items-center gap-0.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full text-blue-100 font-medium">
                      <Sparkles className="w-2.5 h-2.5" /> Gemini
                    </span>
                  </div>
                  <p className="text-xs text-blue-100/90 font-medium">
                    {isStreaming ? "Streaming response..." : "Online & ready to help"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  title="Reset conversation"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3.5 hide-scrollbar">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/50 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-xs transition-all ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none font-medium shadow-blue-500/10"
                        : "bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-slate-200/50"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Animated 3-dot typing indicator (shown while awaiting first token) */}
              {isTyping && (
                <div className="flex items-start gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/50">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200/80 text-slate-500 px-4 py-3 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium mr-1">FixBot is thinking</span>
                    <div className="flex items-center gap-1 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestions */}
            <div className="px-3 py-2 bg-slate-50/80 border-t border-slate-100 flex gap-1.5 overflow-x-auto hide-scrollbar">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  disabled={isStreaming || isTyping}
                  onClick={() => handleSend(action.query)}
                  className="whitespace-nowrap px-3 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 rounded-full text-xs font-medium text-slate-600 transition-colors shadow-xs shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isStreaming ? "Generating response..." : "Ask FixBot about complaints, rules..."}
                disabled={isStreaming}
                className="flex-1 bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                aria-label="Send message"
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open FixBot Chat"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-[0_8px_25px_rgba(37,99,235,0.4)] flex items-center justify-center z-50 overflow-hidden border-2 border-white/20 transition-transform"
      >
        <span className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></span>
        {isOpen ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6 relative z-10" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-blue-600"></span>
            </span>
          </div>
        )}
      </motion.button>
    </>
  );
}
