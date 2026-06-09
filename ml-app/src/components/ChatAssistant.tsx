"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "什麼是偏差與變異的取捨？",
  "線性迴歸與邏輯斯迴歸有何主要差異？",
  "隨機森林是如何進行特徵隨機抽樣的？",
  "K-means 分群演算法有哪些主要限制？",
  "什麼是資料洩漏（Data Leakage）？該如何防範？",
];

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "哈囉！我是您的機器學習學習助理。我可以解答您關於這份機器學習十大演算法研讀報告的任何問題。例如：「什麼是過度配適？」或「如何調校決策樹？」\n\n您可以點擊下方的推薦問題，或直接打字發問！",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // API Keys state
  const [apiKey, setApiKey] = useState("");
  const [apiType, setApiType] = useState("gemini"); // gemini or openai
  const [model, setModel] = useState("gemini-2.5-flash-lite");
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load keys and models from localStorage on mount
  useEffect(() => {
    const savedType = localStorage.getItem("ml_assistant_api_type") || "gemini";
    setApiType(savedType);

    const savedKey = localStorage.getItem(`ml_assistant_key_${savedType}`) || "";
    setApiKey(savedKey);

    const savedModel = localStorage.getItem(`ml_assistant_model_${savedType}`);
    if (savedModel) {
      setModel(savedModel);
    } else {
      const defaultModel = savedType === "openai" ? "gpt-4o" : (savedType === "anthropic" ? "claude-3-7-sonnet-latest" : "gemini-2.5-flash-lite");
      setModel(defaultModel);
    }
  }, []);

  // Sync API Key and model state when switching types
  const handleTypeChange = (type: string) => {
    setApiType(type);
    localStorage.setItem("ml_assistant_api_type", type);
    const savedKey = localStorage.getItem(`ml_assistant_key_${type}`) || "";
    setApiKey(savedKey);
    const defaultModel = type === "openai" ? "gpt-4o" : (type === "anthropic" ? "claude-3-7-sonnet-latest" : "gemini-2.5-flash-lite");
    const savedModel = localStorage.getItem(`ml_assistant_model_${type}`) || defaultModel;
    setModel(savedModel);
  };

  const handleSaveSettings = () => {
    localStorage.setItem(`ml_assistant_key_${apiType}`, apiKey);
    localStorage.setItem(`ml_assistant_model_${apiType}`, model);
    setShowSettings(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    const userMsg: Message = { sender: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const defaultModel = apiType === "openai" ? "gpt-4o" : (apiType === "anthropic" ? "claude-3-7-sonnet-latest" : "gemini-2.5-flash-lite");
      const activeKey = localStorage.getItem(`ml_assistant_key_${apiType}`) || "";
      const activeModel = localStorage.getItem(`ml_assistant_model_${apiType}`) || defaultModel;
      
      // Map history messages into standard role schema: 'user' | 'assistant'
      const updatedMessages = [
        ...messages.map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        })),
        { role: "user", content: text },
      ];
      
      // Limit memory context to prevent huge token size (last 12 turns)
      const messagesPayload = updatedMessages.slice(-12);

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesPayload,
          apiKey: activeKey || null,
          apiType: apiType,
          model: activeModel,
        }),
      });

      if (!response.ok) {
        throw new Error("伺服器回應錯誤");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "❌ 無法連接到後端 API。請確認後端伺服器 (FastAPI) 是否正在運行於 port 8000。\n\n您可以使用命令 `uvicorn main:app --reload` 來啟動後端。",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert raw message text with simple markdown parsing (bold, list, newline)
  const formatMessageText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      // Bold **text**
      let elements: React.ReactNode = line;
      
      // Simple bold replacer
      if (line.includes("**")) {
        const parts = line.split("**");
        elements = parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-yellow-400 font-bold">{part}</strong> : part));
      }

      // Check if it's a list item
      if (line.startsWith("- ")) {
        return (
          <li key={idx} className="list-disc list-inside ml-2 text-slate-300 my-0.5">
            {line.substring(2)}
          </li>
        );
      }
      
      // Check if it's a header like ### title
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-blue-300 mt-3 mb-1 border-b border-white/5 pb-1">
            {line.substring(4)}
          </h4>
        );
      }

      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} className="text-base font-black text-purple-300 mt-4 mb-2">
            {line.substring(3)}
          </h3>
        );
      }

      if (line.startsWith("# ")) {
        return (
          <h2 key={idx} className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-4 mb-2">
            {line.substring(2)}
          </h2>
        );
      }

      return <p key={idx} className="min-h-[1rem] my-1 text-slate-200 text-sm leading-relaxed">{elements}</p>;
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 shadow-2xl hover:scale-105 hover:rotate-6 transition-all duration-200 cursor-pointer border border-white/10 active:scale-95 pulse-glow-green"
        title="AI 學習助理"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] bg-slate-900 border-l border-white/10 shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-sm">AI 智慧學習助理</h3>
              <p className="text-[10px] text-slate-400">根據機器學習十大演算法報告回答</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${showSettings ? "bg-slate-800 text-white" : ""}`}
              title="AI 金鑰設定"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Settings view */}
        {showSettings && (
          <div className="p-4 bg-slate-950 border-b border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wide">AI 服務商與金鑰設定</h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              留空代表使用後端「本地語意庫檢索回答」（免API金鑰）。若想獲得完整語意解析，可輸入您自有的 API Key。此金鑰僅會儲存在您本地瀏覽器中。
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleTypeChange("gemini")}
                className={`flex-1 py-1 px-2 text-[11px] font-semibold border rounded transition-all cursor-pointer ${
                  apiType === "gemini" ? "bg-emerald-600/15 text-emerald-400 border-emerald-500/20" : "bg-transparent text-slate-400 border-white/10"
                }`}
              >
                Gemini
              </button>
              <button
                onClick={() => handleTypeChange("openai")}
                className={`flex-1 py-1 px-2 text-[11px] font-semibold border rounded transition-all cursor-pointer ${
                  apiType === "openai" ? "bg-emerald-600/15 text-emerald-400 border-emerald-500/20" : "bg-transparent text-slate-400 border-white/10"
                }`}
              >
                OpenAI
              </button>
              <button
                onClick={() => handleTypeChange("anthropic")}
                className={`flex-1 py-1 px-2 text-[11px] font-semibold border rounded transition-all cursor-pointer ${
                  apiType === "anthropic" ? "bg-emerald-600/15 text-emerald-400 border-emerald-500/20" : "bg-transparent text-slate-400 border-white/10"
                }`}
              >
                Anthropic
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">
                {apiType === "gemini" ? "Gemini" : apiType === "openai" ? "OpenAI" : "Anthropic"} API Key:
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={apiType === "gemini" ? "AIzaSy..." : apiType === "openai" ? "sk-..." : "sk-ant-..."}
                className="w-full text-xs bg-slate-800 border border-white/10 rounded px-2.5 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">模型版本 (Model Version):</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full text-xs bg-slate-800 border border-white/10 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {apiType === "gemini" ? (
                  <>
                    <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite (預設推薦)</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite</option>
                    <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </>
                ) : apiType === "openai" ? (
                  <>
                    <option value="gpt-4o">GPT-4o (預設推薦)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="o1-mini">OpenAI o1 Mini</option>
                    <option value="o3-mini">OpenAI o3 Mini</option>
                    <option value="o1">OpenAI o1</option>
                  </>
                ) : (
                  <>
                    <option value="claude-3-7-sonnet-latest">Claude 3.7 Sonnet (預設推薦)</option>
                    <option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet</option>
                    <option value="claude-3-5-haiku-latest">Claude 3.5 Haiku</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowSettings(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-3 py-1.5 text-xs font-black bg-emerald-600 rounded text-slate-950 hover:bg-emerald-500 transition-all cursor-pointer"
              >
                儲存設定
              </button>
            </div>
          </div>
        )}

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/40">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl shadow-md text-sm ${
                  msg.sender === "user"
                    ? "bg-emerald-600/90 text-slate-950 font-semibold rounded-tr-none"
                    : "bg-slate-800 text-slate-100 rounded-tl-none border border-white/5"
                }`}
              >
                {formatMessageText(msg.text)}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col mr-auto max-w-[85%] items-start">
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-800 border border-white/5 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts list (only shown if history is short or input empty) */}
        {input.trim() === "" && (
          <div className="p-3 border-t border-white/5 bg-slate-950/20 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-white/5 transition-all inline-block shrink-0 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="請輸入關於演算法的問題..."
              className="flex-1 bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 transition-all shadow-md cursor-pointer active:scale-95 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
