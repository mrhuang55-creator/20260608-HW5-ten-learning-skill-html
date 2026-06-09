"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ALGORITHMS = [
  { id: "3.1", name: "線性迴歸", en: "Linear Regression" },
  { id: "3.2", name: "邏輯斯迴歸", en: "Logistic Regression" },
  { id: "3.3", name: "決策樹", en: "Decision Tree" },
  { id: "3.4", name: "隨機森林", en: "Random Forest" },
  { id: "3.5", name: "支援向量機", en: "SVM" },
  { id: "3.6", name: "K 近鄰", en: "KNN" },
  { id: "3.7", name: "樸素貝氏", en: "Naive Bayes" },
  { id: "3.8", name: "K-means 分群", en: "K-means" },
  { id: "3.9", name: "梯度提升樹", en: "Gradient Boosting" },
  { id: "3.10", name: "神經網路", en: "Neural Networks" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={`flex flex-col bg-slate-900/90 border-r border-white/5 transition-all duration-300 ${isOpen ? "w-72" : "w-16"} min-h-screen shrink-0 overflow-y-auto`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        {isOpen ? (
          <Link href="/" className="flex flex-col cursor-pointer">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 text-lg tracking-wide">ML 十大演算法</span>
            <span className="text-xs text-slate-400 font-medium">研讀與動態學習平台</span>
          </Link>
        ) : (
          <Link href="/" className="mx-auto text-xl font-black text-blue-500 cursor-pointer">ML</Link>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title={isOpen ? "收起選單" : "展開選單"}
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link 
          href="/" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            pathname === "/" 
              ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500" 
              : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          {isOpen && <span>學習大綱 & 觀念導讀</span>}
        </Link>

        <Link 
          href="/learning-path" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            pathname === "/learning-path" 
              ? "bg-emerald-600/20 text-emerald-400 border-l-2 border-emerald-500" 
              : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          {isOpen && <span>推薦學習路徑</span>}
        </Link>

        <Link 
          href="/quiz" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            pathname === "/quiz" 
              ? "bg-purple-600/20 text-purple-400 border-l-2 border-purple-500" 
              : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          {isOpen && <span>課後測驗練習</span>}
        </Link>

        {isOpen && (
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            十大演算法清單
          </div>
        )}

        <div className="space-y-0.5">
          {ALGORITHMS.map((algo) => {
            const path = `/algorithm/${algo.id}`;
            const isActive = pathname === path;
            return (
              <Link
                key={algo.id}
                href={path}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm border-l-2 border-purple-400"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-6 shrink-0 text-slate-500 font-bold">{algo.id}</span>
                  <span className="truncate">{algo.name}</span>
                </div>
                {isOpen && <span className="text-[10px] text-slate-600 shrink-0 font-mono font-light ml-1">{algo.en}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer Info */}
      {isOpen && (
        <div className="p-4 border-t border-white/5 bg-slate-950/40 text-[10px] text-slate-500 space-y-1 text-center">
          <p>© 2026 機器學習十大學習平台</p>
          <p className="text-slate-600">後端: FastAPI | 前端: Next.js</p>
        </div>
      )}
    </aside>
  );
}
