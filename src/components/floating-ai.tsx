"use client";

import React, { useEffect, useState } from "react";
import { X, Send, Bot } from "lucide-react";
import { Button } from "./ui/button";

export function FloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "ai"|"user", content: string}[]>([
    { role: "ai", content: "Hi! I'm your FLearn AI Assistant. How can I help you study today?" }
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-ai-assistant", handleToggle);
    return () => window.removeEventListener("toggle-ai-assistant", handleToggle);
  }, []);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", content: "I am analyzing your request. Since I am currently a mockup, I will be fully functional soon!" }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm sm:w-96 h-[480px] sm:h-[500px] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
      {/* Header */}
      <div className="hero-gradient p-4 flex items-center justify-between text-white shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-bold text-sm">FLearn AI Assistant</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-accent/10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "ai" ? "bg-card border border-border text-foreground shadow-sm rounded-tl-sm" : "bg-gradient-to-r from-primary to-sky text-white shadow-sm rounded-tr-sm"}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-card border-t border-border flex items-center gap-2 shrink-0">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your courses..." 
          className="flex-1 h-10 bg-accent/50 border border-border rounded-xl px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner"
        />
        <Button type="submit" size="sm" className="h-10 w-10 p-0 rounded-xl bg-primary hover:bg-primary-dark text-white cursor-pointer shadow-sm hover:shadow transition-all hover:scale-105 active:scale-95">
          <Send className="h-4 w-4 ml-0.5" />
        </Button>
      </form>
    </div>
  );
}
