"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ChatAssistant from "@/components/ChatAssistant";
import AlgoVisualizer from "@/components/AlgoVisualizer";

// ── Types ──────────────────────────────────────────
interface SupplementPoint {
  number: string;
  title: string;
  content: string;
}

interface AlgorithmDetail {
  id: string;
  name: string;
  englishName: string;
  image: string;
  table: {
    任務類型: string;
    常見用途: string;
    主要優點: string;
    主要限制: string;
    前處理重點: string;
  };
  details: {
    positioning: string;
    concepts: string;
    dataRequirements: string;
    trainingProcess: string;
    examples: string;
    advantages: string;
    limitations: string;
    evaluation: string;
    explainability: string;
    tuning: string;
    deployment: string;
    misconceptions: string;
    extension: string;
    projectApplication: string;
    communication: string;
    qualityControl: string;
  };
  supplements: SupplementPoint[];
}

interface EvaluationChart {
  chapter: number;
  chart_title: string;
  chart_type: string;
  summary: string;
  math_principle: string[];
  chart_interpretation: string[];
  python_code: string;
  exercise: string;
}

// ── EvaluationChartTab Component ───────────────────
function EvaluationChartTab({ algoId }: { algoId: string }) {
  const [chart, setChart] = useState<EvaluationChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiBaseUrl}/api/algorithms/${algoId}/chart`)
      .then((r) => r.json())
      .then((data) => { setChart(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [algoId]);

  const handleCopy = () => {
    if (!chart) return;
    navigator.clipboard.writeText(chart.python_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="text-slate-400 text-sm text-center py-10">
        暫無此演算法的評估圖表資料。
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/5">
        <span className="text-xs font-mono font-black bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
          Ch.{String(chart.chapter).padStart(2, "0")}
        </span>
        <div>
          <h2 className="text-base font-black text-white">{chart.chart_title}</h2>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{chart.chart_type}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-emerald-950/20 border border-emerald-500/15 rounded-xl p-4">
        <p className="text-slate-200 leading-relaxed">{chart.summary}</p>
      </div>

      {/* Math Principles */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
          <span>∑</span> 數學原理
        </h3>
        <ul className="space-y-2">
          {chart.math_principle.map((p, i) => (
            <li key={i} className="flex gap-2 items-start text-slate-300 bg-slate-900/50 rounded-lg px-3 py-2">
              <span className="text-emerald-500 font-mono font-bold text-xs mt-0.5 shrink-0">{i + 1}.</span>
              <span className="font-mono text-xs leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chart Interpretation */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
          <span>📊</span> 圖表判讀指南
        </h3>
        <ul className="space-y-2">
          {chart.chart_interpretation.map((tip, i) => (
            <li key={i} className="flex gap-2 items-start bg-slate-900/50 rounded-lg px-3 py-2.5">
              <span
                className={`text-xs leading-relaxed ${
                  tip.startsWith("✅")
                    ? "text-emerald-300"
                    : tip.startsWith("⚠️")
                    ? "text-amber-300"
                    : "text-slate-300"
                }`}
              >
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Python Code */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-2">
            <span>🐍</span> Python 實作
          </h3>
          <button
            onClick={handleCopy}
            className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-white/5"
          >
            {copied ? "✅ 已複製" : "複製程式碼"}
          </button>
        </div>
        <div className="bg-slate-950 border border-white/5 rounded-xl overflow-hidden">
          <div className="bg-slate-800/80 px-4 py-2 text-[10px] font-mono text-slate-400 flex items-center gap-2 border-b border-white/5">
            <span className="w-2 h-2 rounded-full bg-red-500/70" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
            <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
            <span className="ml-2">Python · scikit-learn</span>
          </div>
          <pre className="p-4 text-xs overflow-x-auto text-emerald-400 font-mono leading-relaxed">
            <code>{chart.python_code}</code>
          </pre>
        </div>
      </div>

      {/* Exercise */}
      <div className="border-l-4 border-purple-500 bg-purple-950/20 p-4 rounded-r-xl">
        <p className="font-bold text-purple-400 mb-2 text-xs uppercase tracking-wider">💡 思考與習題</p>
        <p className="text-slate-200 leading-relaxed">{chart.exercise}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────
export default function AlgorithmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [algo, setAlgo] = useState<AlgorithmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("concepts");
  const [expandedSupp, setExpandedSupp] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlgo() {
      try {
        setLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiBaseUrl}/api/algorithms/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAlgo(data);
        }
      } catch (err) {
        console.error("Error fetching algorithm detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlgo();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#090a0f] text-slate-300 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <span className="text-sm font-medium tracking-wide">載入演算法詳情中...</span>
        </div>
      </div>
    );
  }

  if (!algo) {
    return (
      <div className="flex h-screen bg-[#090a0f] text-slate-300 items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-bold">找不到該演算法的詳細資料。</p>
          <Link href="/" className="text-blue-400 hover:underline text-sm block">返回大綱</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "concepts",     label: "1. 定位與概念",     color: "blue"    },
    { key: "process",      label: "2. 資料與流程",     color: "emerald" },
    { key: "limits",       label: "3. 優缺限制",       color: "red"     },
    { key: "governance",   label: "4. 部署與品質",     color: "amber"   },
    { key: "supplements",  label: "5. 延伸研讀",       color: "purple"  },
    { key: "chart",        label: "6. 評估圖表解析",   color: "emerald" },
  ];

  return (
    <div className="flex min-h-screen bg-[#090a0f] text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 space-y-8 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-400 transition-colors">大綱首頁</Link>
          <span>/</span>
          <span className="text-slate-200">{algo.name}</span>
        </div>

        {/* Algorithm Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-6 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">演算法編號 {algo.id}</span>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              {algo.name}
            </h1>
            <p className="text-xs font-mono text-slate-400">{algo.englishName}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/20">
              {algo.table.任務類型}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-white/5">
              可解釋性：{["3.1", "3.2", "3.3", "3.6", "3.7"].includes(algo.id) ? "高" : "中低"}
            </span>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Dynamic Visualizer */}
          <div className="lg:col-span-5 space-y-6">
            <AlgoVisualizer algorithmId={algo.id} />

            {/* Quick stats table */}
            <div className="glass-panel p-5 rounded-2xl space-y-4 text-xs">
              <h3 className="font-bold text-slate-200 border-b border-white/5 pb-2">📋 核心特性一覽</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">常見用途</span>
                  <p className="text-slate-200 leading-relaxed">{algo.table.常見用途}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">主要優點</span>
                  <p className="text-slate-200 leading-relaxed">{algo.table.主要優點}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">主要限制</span>
                  <p className="text-slate-200 leading-relaxed text-red-300">{algo.table.主要限制}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">前處理重點</span>
                  <p className="text-slate-200 leading-relaxed text-amber-300">{algo.table.前處理重點}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Detailed Tabs Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tab navigation */}
            <div className="flex border-b border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none text-xs font-semibold">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2.5 px-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? tab.key === "chart"
                        ? "border-emerald-500 text-emerald-400 font-bold bg-emerald-950/20"
                        : "border-blue-500 text-blue-400 font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                  {tab.key === "chart" && (
                    <span className="ml-1.5 text-[9px] bg-emerald-800/50 text-emerald-400 px-1 py-0.5 rounded font-mono">NEW</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-[#0e1017] border border-white/5 rounded-2xl p-6 min-h-[300px] leading-relaxed text-sm">
              {activeTab === "concepts" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">📍 學習定位</h3>
                    <p className="text-slate-200">{algo.details.positioning}</p>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">🔍 核心概念</h3>
                    <p className="text-slate-200">{algo.details.concepts}</p>
                  </div>
                </div>
              )}

              {activeTab === "process" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">📦 資料需求</h3>
                    <p className="text-slate-200">{algo.details.dataRequirements}</p>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">⚙️ 訓練流程</h3>
                    <p className="text-slate-200">{algo.details.trainingProcess}</p>
                  </div>
                </div>
              )}

              {activeTab === "limits" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">✅ 主要優點</h3>
                    <p className="text-slate-200">{algo.details.advantages}</p>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">❌ 主要限制</h3>
                    <p className="text-slate-200">{algo.details.limitations}</p>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">⚠️ 常見誤區</h3>
                    <p className="text-slate-200">{algo.details.misconceptions}</p>
                  </div>
                </div>
              )}

              {activeTab === "governance" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">🏢 實務案例</h3>
                    <p className="text-slate-200">{algo.details.examples}</p>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">📈 模型評估與可解釋性</h3>
                    <p className="text-slate-200">{algo.details.evaluation}</p>
                    {algo.details.explainability && (
                      <p className="text-slate-200 mt-2">{algo.details.explainability}</p>
                    )}
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">🛡️ 調參、導入與品質控管</h3>
                    <p className="text-slate-200">{algo.details.tuning}</p>
                    {algo.details.deployment && (
                      <p className="text-slate-200 mt-2">{algo.details.deployment}</p>
                    )}
                    {algo.details.qualityControl && (
                      <p className="text-slate-200 mt-2">{algo.details.qualityControl}</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "supplements" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">📚 演算法專案研讀補充 (12 大關鍵檢核)</h3>
                  <div className="space-y-2">
                    {algo.supplements.map((supp, index) => {
                      const isExpanded = expandedSupp === supp.number;
                      return (
                        <div
                          key={index}
                          className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden"
                        >
                          <button
                            onClick={() => setExpandedSupp(isExpanded ? null : supp.number)}
                            className="w-full text-left px-4 py-3 flex justify-between items-center text-xs font-bold hover:bg-slate-800 transition-colors"
                          >
                            <span>{supp.title}</span>
                            <span className="text-slate-500 font-mono">{isExpanded ? "▲" : "▼"}</span>
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-white/5 bg-slate-950/40">
                              {supp.content}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 評估圖表解析 Tab (NEW) ── */}
              {activeTab === "chart" && (
                <EvaluationChartTab algoId={algo.id} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating AI chat assistant drawer */}
      <ChatAssistant />
    </div>
  );
}
