"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ChatAssistant from "@/components/ChatAssistant";

interface Algorithm {
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
}

interface OverviewData {
  title: string;
  subtitle: string;
  introduction: string;
  framework: string;
  comparison: string;
  cases: string;
  learning_path: string;
  conclusion: string;
  glossary: string;
  checklist: string;
}

export default function Dashboard() {
  const [algos, setAlgos] = useState<Algorithm[]>([]);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter selector states
  const [selectedTask, setSelectedTask] = useState<string>("all");
  const [selectedLabel, setSelectedLabel] = useState<string>("all");
  const [selectedExplain, setSelectedExplain] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const [algosRes, overviewRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/algorithms`),
          fetch(`${apiBaseUrl}/api/overview`),
        ]);
        if (algosRes.ok && overviewRes.ok) {
          const algosData = await algosRes.json();
          const overviewData = await overviewRes.json();
          setAlgos(algosData);
          setOverview(overviewData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter logic based on the algorithm characteristics
  const filteredAlgos = algos.filter((algo) => {
    // 1. Task filter (supervised classification/regression vs unsupervised clustering)
    const typeStr = algo.table.任務類型 || "";
    if (selectedTask === "classification" && !typeStr.includes("分類")) return false;
    if (selectedTask === "regression" && !typeStr.includes("迴歸")) return false;
    if (selectedTask === "clustering" && !typeStr.includes("分群")) return false;

    // 2. Label requirement filter
    if (selectedLabel === "yes" && typeStr.includes("分群")) return false;
    if (selectedLabel === "no" && !typeStr.includes("分群")) return false;

    // 3. Explainability (High vs Medium/Low)
    const highExplainIds = ["3.1", "3.2", "3.3", "3.6", "3.7"];
    if (selectedExplain === "high" && !highExplainIds.includes(algo.id)) return false;
    if (selectedExplain === "low" && highExplainIds.includes(algo.id)) return false;

    return true;
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-[#090b11] text-slate-300 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
          <span className="text-sm font-medium tracking-wide">載入中，請稍候...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#090b11] text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 space-y-12 max-w-7xl mx-auto">
        {/* Banner Section */}
        <section className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden flex flex-col justify-center border border-white/5 bg-gradient-to-br from-slate-900/60 via-slate-900/80 to-emerald-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none"></div>
          
          <span className="text-xs font-mono text-emerald-400 font-bold tracking-widest uppercase mb-2 block">
            {overview?.subtitle || "機器學習十大演算法"}
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-emerald-400 leading-tight text-glow-green">
            {overview?.title || "機器學習十大演算法研讀報告"}
          </h1>
          <p className="mt-4 text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
            本平台將十大常見機器學習演算法進行系統化彙整，涵蓋基礎統計模型、樹模型、距離模型、機率模型、整合式學習與深度學習。提供學術研讀、案例實作、動態互動視覺化與 AI 即時解答，助您深入掌握資料科學的核心工具。
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link 
              href="/learning-path" 
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95 duration-200"
            >
              🚀 開始學習路徑
            </Link>
            <Link 
              href="/quiz" 
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/5 transition-all cursor-pointer active:scale-95 duration-200"
            >
              ✏️ 前往自我測驗
            </Link>
          </div>
        </section>

        {/* Section 1: 一、報告導讀與機器學習基本觀念 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-2">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-mono font-extrabold px-2 py-0.5 rounded border border-emerald-500/20">SECTION 01</span>
            <h2 className="text-xl font-bold text-slate-100">報告導讀與基本觀念</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">💡 機器學習與傳統程式之差異</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                傳統程式由人類明確撰寫規則，而機器學習則透過歷史資料讓模型估計規則。當資料中存在可重複的模式（如使用者行為、歷程、影像特徵），機器學習便能協助預測、分類或決策。
              </p>
            </div>
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">⚖️ 偏差（Bias）與變異（Variance）</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                偏差高代表模型太簡單（欠配適，Underfitting），無法描述重要結構；變異高代表模型太敏感且貼合雜訊（過度配適，Overfitting）。理想模型應追求泛化能力在兩者之間取得最佳平衡。
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: 演算法智慧過濾器 */}
        <section className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 bg-slate-900/40 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider">🔍 演算法篩選與任務對照</h3>
            <p className="text-xs text-slate-400 font-medium">根據您的任務情境，篩選出合適的候選機器學習演算法：</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">1. 目標變數類型</label>
              <select 
                value={selectedTask} 
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors"
              >
                <option value="all">顯示全部任務 (Classification / Regression / Clustering)</option>
                <option value="classification">分類問題 (Predicting Classes/Labels)</option>
                <option value="regression">迴歸問題 (Predicting Continuous Values)</option>
                <option value="clustering">分群問題 (Grouping Unlabeled Data)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">2. 是否需要標籤資料 (Labels)</label>
              <select 
                value={selectedLabel} 
                onChange={(e) => setSelectedLabel(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors"
              >
                <option value="all">不限</option>
                <option value="yes">需要 (監督式學習 Supervised)</option>
                <option value="no">不需要 (非監督式學習 Unsupervised)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">3. 解釋性需求 (Explainability)</label>
              <select 
                value={selectedExplain} 
                onChange={(e) => setSelectedExplain(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors"
              >
                <option value="all">不限</option>
                <option value="high">偏好高解釋性 (線性/機率/單棵樹模型)</option>
                <option value="low">可接受中低解釋性 (黑箱/多模型集成/神經網路)</option>
              </select>
            </div>
          </div>

          {/* Filter results count */}
          <div className="text-xs text-slate-400 font-medium flex justify-between items-center border-t border-white/5 pt-4">
            <span>找到 {filteredAlgos.length} 個符合條件的演算法</span>
            {(selectedTask !== "all" || selectedLabel !== "all" || selectedExplain !== "all") && (
              <button 
                onClick={() => {
                  setSelectedTask("all");
                  setSelectedLabel("all");
                  setSelectedExplain("all");
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold text-xs cursor-pointer"
              >
                重置過濾器
              </button>
            )}
          </div>
        </section>

        {/* Section 3: Algorithm Grid */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-2">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-mono font-extrabold px-2 py-0.5 rounded border border-emerald-500/20">SECTION 02</span>
            <h2 className="text-xl font-bold text-slate-100">十大常見演算法卡片</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlgos.map((algo) => {
              // Accent color based on algorithm category
              let accentColor = "from-emerald-600 to-teal-500 shadow-emerald-500/5";
              let badgeColor = "bg-emerald-600/15 text-emerald-300 border border-emerald-500/20";
              
              if (algo.id === "3.1" || algo.id === "3.2" || algo.id === "3.7") {
                accentColor = "from-blue-600 to-cyan-500 shadow-blue-500/5";
                badgeColor = "bg-blue-600/15 text-blue-300 border border-blue-500/20";
              } else if (algo.id === "3.5" || algo.id === "3.6" || algo.id === "3.8") {
                accentColor = "from-purple-600 to-indigo-500 shadow-purple-500/5";
                badgeColor = "bg-purple-600/15 text-purple-300 border border-purple-500/20";
              } else if (algo.id === "3.10") {
                accentColor = "from-pink-600 to-rose-500 shadow-pink-500/5";
                badgeColor = "bg-pink-600/15 text-pink-300 border border-pink-500/20";
              }

              return (
                <Link 
                  key={algo.id}
                  href={`/algorithm/${algo.id}`}
                  className="glass-panel rounded-2xl overflow-hidden glass-card-hover flex flex-col justify-between h-72 border border-white/5 group relative cursor-pointer"
                >
                  <div className="p-6 space-y-3 flex-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-slate-500 font-extrabold">{algo.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badgeColor}`}>
                        {algo.table.任務類型}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                        {algo.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono tracking-wide">{algo.englishName}</p>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      <strong className="text-slate-400 block mb-0.5">常用用途：</strong>
                      {algo.table.常見用途}
                    </p>
                  </div>

                  {/* Gradient strip footer */}
                  <div className={`h-1 w-full bg-gradient-to-r ${accentColor}`}></div>
                </Link>
              );
            })}
          </div>

          {filteredAlgos.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              沒有符合過濾條件的演算法，請重新調整篩選設定。
            </div>
          )}
        </section>

        {/* Section 4: 整合案例庫 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-2">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-mono font-extrabold px-2 py-0.5 rounded border border-emerald-500/20">SECTION 03</span>
            <h2 className="text-xl font-bold text-slate-100">整合案例研究庫</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-indigo-400 font-bold font-mono uppercase tracking-wide">案例一：教育問卷意見分類</span>
                <span className="text-[9px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded font-mono">文字分類</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                對每年數千筆教師意見，先以<strong>樸素貝氏</strong>建立基準，進行初步意見分流（如教材內容、平台操作、客服回覆）。後續可導入<strong>SVM</strong>或<strong>神經網路</strong>提高文字語意理解力。
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-wide">案例二：學生學習風險預警</span>
                <span className="text-[9px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded font-mono">機率預測</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                收集影片觀看、測驗作業繳交數據，以<strong>邏輯斯迴歸</strong>計算學生的補救學習風險分數，協助教師安排提醒。為防偏差，需檢查模型是否對特定學制或地區產生系統性偏差，保留教師專業裁量。
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-blue-400 font-bold font-mono uppercase tracking-wide">案例三：教材使用量預測</span>
                <span className="text-[9px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded font-mono">連續數值</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                預估下季數位教材使用需求。先用<strong>線性迴歸</strong>建立透明的業務基準，再以<strong>隨機森林</strong>或<strong>梯度提升樹</strong>捕捉複雜的非線性干擾。需注意依時間切分，防資料洩漏。
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-purple-400 font-bold font-mono uppercase tracking-wide">案例四：教師使用行為型態分群</span>
                <span className="text-[9px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded font-mono">非監督探索</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                在無標籤時，以 <strong>K-means</strong> 依使用頻率、教材偏好對用戶分群，勾勒出重度使用、穩定運作等客群畫像，做為後續访談、推廣或資源配置策略的指引。
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating AI chat assistant drawer */}
      <ChatAssistant />
    </div>
  );
}
