"use client";

import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ChatAssistant from "@/components/ChatAssistant";

const STAGES = [
  {
    phase: "第一階段",
    title: "基礎線性模型與評估指標",
    subtitle: "聚焦資料前處理與評估基準",
    color: "border-blue-500 text-blue-400",
    bgColor: "bg-blue-600/10",
    description: "學習重點：掌握資料與評估。使用小型表格資料練習資料切分、極端值、標準化，建立基準模型（Baseline）並解讀指標（Accuracy, Precision, Recall, F1）。了解為何測試集泛化能力比訓練集擬合更為重要。",
    algorithms: [
      { id: "3.1", name: "線性迴歸", en: "Linear Regression", desc: "預測房價、營收等連續數值，建立模型基準。" },
      { id: "3.2", name: "邏輯斯迴歸", en: "Logistic Regression", desc: "二元分類，輸出機率，適合門檻劃分與風險控制。" }
    ]
  },
  {
    phase: "第二階段",
    title: "樹模型與整合式學習",
    subtitle: "理解非線性交互與集成投票",
    color: "border-emerald-500 text-emerald-400",
    bgColor: "bg-emerald-600/10",
    description: "學習重點：理解條件切分、多樹投票與逐步補強錯誤。樹模型在表格資料中非常實用，也能讓學習者體會到「準確率」與「可解釋性」之間的取捨。",
    algorithms: [
      { id: "3.3", name: "決策樹", en: "Decision Tree", desc: "基於規則二分特徵空間，容易視覺化與解釋。" },
      { id: "3.4", name: "隨機森林", en: "Random Forest", desc: "多樹投票（Bagging），有效降低變異度與過擬合。" },
      { id: "3.9", name: "梯度提升樹", en: "Gradient Boosting", desc: "序列式修正殘差（Boosting），追求極高的表格資料準確率。" }
    ]
  },
  {
    phase: "第三階段",
    title: "距離、空間與非結構探索",
    subtitle: "理解距離計算、群體探索與文字特徵",
    color: "border-purple-500 text-purple-400",
    bgColor: "bg-purple-600/10",
    description: "學習重點：理解高維特徵空間與距離度量。掌握非監督探索、樸素的條件獨立假設與高維邊界最大化。這些方法讓您明白機器學習不止處理數值表格，更能處理語言（文字分類）與未知群體（分群）。",
    algorithms: [
      { id: "3.6", name: "K 近鄰", en: "KNN", desc: "基於距離相似性進行預測，高維計算成本高。" },
      { id: "3.8", name: "K-means 分群", en: "K-means", desc: "探索無標籤資料輪廓，需標準化特徵。" },
      { id: "3.7", name: "樸素貝氏", en: "Naive Bayes", desc: "獨立性假設下的條件機率分類器，垃圾郵件與文字分類基準。" },
      { id: "3.5", name: "支援向量機", en: "SVM", desc: "在高維空間尋找最大化邊界，對特徵尺度極敏感。" }
    ]
  },
  {
    phase: "第四階段",
    title: "深度學習與模型治理",
    subtitle: "非結構化表徵與負責任 AI",
    color: "border-pink-500 text-pink-400",
    bgColor: "bg-pink-600/10",
    description: "學習重點：多層非線性網路特徵提取。在掌握強大擬合能力的同時，必須重視特徵量、運算資源成本、過度配適的正則化，以及可解釋性與公平性（治理機制）。",
    algorithms: [
      { id: "3.10", name: "神經網路", en: "Neural Networks", desc: "多層轉換提取複雜特徵，專精於文字、影像、語音等非結構化任務。" }
    ]
  }
];

export default function LearningPathPage() {
  return (
    <div className="flex min-h-screen bg-[#090a0f] text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 space-y-8 max-w-5xl mx-auto">
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
            🗺️ 推薦機器學習學習路徑
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            由簡入繁，從線性模型、評估基準出發，再進入非線性樹、距離分群、文字分類與深度學習。
          </p>
        </div>

        {/* Timeline representation */}
        <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-12 py-4">
          {STAGES.map((stage, idx) => (
            <div key={idx} className="relative space-y-4">
              {/* Timeline marker */}
              <span className={`absolute left-[-41px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-slate-900 border-2 ${stage.color} z-10 shadow-lg`}>
                {idx + 1}
              </span>

              {/* Stage Card */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${stage.bgColor} ${stage.color}`}>
                    {stage.phase}
                  </span>
                  <h2 className="text-base font-black text-slate-100">{stage.title}</h2>
                  <p className="text-[10px] text-slate-500 font-medium">{stage.subtitle}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-white/5">
                  {stage.description}
                </p>

                {/* Sub-Algorithms List */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">階段學習模組：</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stage.algorithms.map((algo) => (
                      <Link 
                        key={algo.id} 
                        href={`/algorithm/${algo.id}`}
                        className="bg-slate-900 border border-white/5 hover:border-blue-500/30 p-3.5 rounded-xl flex flex-col justify-between hover:-translate-y-0.5 transition-all cursor-pointer group"
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{algo.name}</span>
                            <span className="text-[9px] font-mono text-slate-500">{algo.id}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{algo.desc}</p>
                        </div>
                        <span className="text-[8px] text-blue-500 font-bold mt-2 hover:underline block text-right">探索詳情 →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Suggestion */}
        <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-blue-900/10 to-emerald-900/10 text-center space-y-4 border border-white/5">
          <h3 className="text-sm font-bold text-slate-200">📖 學習檢核實作建議</h3>
          <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
            每研讀完一個演算法，建議完成三件事：用自己的話解釋決策邏輯、用一份實例資料做實作評估、列出該演算法在何種場景下不適合。這有助於深化理解。
          </p>
          <Link
            href="/quiz"
            className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow hover:shadow-emerald-500/20 active:scale-95"
          >
            ✏️ 前往進行自我檢測挑戰
          </Link>
        </div>
      </main>

      {/* Floating AI chat assistant drawer */}
      <ChatAssistant />
    </div>
  );
}
