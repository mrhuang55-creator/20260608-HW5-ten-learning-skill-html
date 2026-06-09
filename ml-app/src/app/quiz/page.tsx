"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ChatAssistant from "@/components/ChatAssistant";

interface Question {
  id: string;
  algorithmId: string;
  algorithmName: string;
  question: string;
  options: {
    [key: string]: string;
  };
  answer: string;
  explanation: string;
}

interface GradingResult {
  questionId: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  explanation: string;
}

interface GradingResponse {
  score: number;
  totalQuestions: number;
  percentage: number;
  results: GradingResult[];
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlgoFilter, setSelectedAlgoFilter] = useState("all");

  // Quiz active state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  
  // Results state
  const [results, setResults] = useState<GradingResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Load questions
  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const url = selectedAlgoFilter === "all" 
          ? `${apiBaseUrl}/api/quiz`
          : `${apiBaseUrl}/api/quiz?algo_id=${selectedAlgoFilter}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
        }
      } catch (err) {
        console.error("Error loading quiz questions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [selectedAlgoFilter]);

  const activeQuestion = questions[currentIdx];

  const handleSelectOption = (optionKey: string) => {
    if (!activeQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: optionKey,
    }));
  };

  const startQuiz = () => {
    setAnswers({});
    setCurrentIdx(0);
    setResults(null);
    setShowResults(false);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      if (!confirm(`您還有 ${unansweredCount} 題尚未作答，確定要送出評分嗎？`)) {
        return;
      }
    }

    setIsPlaying(false);
    setLoading(true);

    try {
      // Map state answers to API payload format
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        questionId: qId,
        selectedOption: val,
      }));

      // Make sure we include blank answers for unanswered questions so we get complete grading results
      questions.forEach((q) => {
        if (!answers[q.id]) {
          formattedAnswers.push({
            questionId: q.id,
            selectedOption: "",
          });
        }
      });

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiBaseUrl}/api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (res.ok) {
        const resultData = await res.json();
        setResults(resultData);
        setShowResults(true);
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("提交失敗，請檢查後端服務。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#090a0f] text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 space-y-8 max-w-5xl mx-auto">
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
            ✍️ 課後測驗與觀念自我檢測
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            透過觀念選擇題，驗收您對機器學習演算法核心假設、資料需求、優缺點限制的學習成效。
          </p>
        </div>

        {loading ? (
          <div className="flex py-20 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
              <span className="text-sm font-medium tracking-wide">載入中，請稍候...</span>
            </div>
          </div>
        ) : !isPlaying && !showResults ? (
          /* Landing/Setup screen */
          <div className="glass-panel p-8 rounded-2xl max-w-xl mx-auto space-y-6">
            <h3 className="text-base font-bold text-slate-200">🛠️ 設定您的測驗範圍</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold block">選擇主題範圍：</label>
              <select 
                value={selectedAlgoFilter} 
                onChange={(e) => setSelectedAlgoFilter(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">全體綜合測驗 (共 12 題)</option>
                <option value="3.1">線性迴歸 (Linear Regression)</option>
                <option value="3.2">邏輯斯迴歸 (Logistic Regression)</option>
                <option value="3.3">決策樹 (Decision Tree)</option>
                <option value="3.4">隨機森林 (Random Forest)</option>
                <option value="3.5">支援向量機 (SVM)</option>
                <option value="3.6">K 近鄰 (KNN)</option>
                <option value="3.7">樸素貝氏 (Naive Bayes)</option>
                <option value="3.8">K-means 分群 (K-means)</option>
                <option value="3.9">梯度提升樹 (Gradient Boosting)</option>
                <option value="3.10">神經網路 (Neural Networks)</option>
                <option value="general">機器學習基本觀念</option>
              </select>
            </div>

            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 text-xs text-slate-400 leading-relaxed space-y-2">
              <p className="font-bold text-slate-300">💡 測驗說明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>本測驗題庫完全比照《十大演算法研讀報告》的官方核心觀念與導入建議設計。</li>
                <li>送出後，系統會為您評定總分，並提供詳盡的研讀報告對照說明與解析。</li>
                <li>您可以重複進行測驗，以加深記憶。</li>
              </ul>
            </div>

            <button
              onClick={startQuiz}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-purple-500/25 active:scale-98 cursor-pointer text-center block"
            >
              🎯 開始進行自我測驗
            </button>
          </div>
        ) : isPlaying && activeQuestion ? (
          /* Active test wizard screen */
          <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-6">
            {/* Header info / progress */}
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-purple-400 uppercase tracking-wider">
                題目 {currentIdx + 1} / {questions.length}
              </span>
              <span className="text-slate-500 font-mono">
                進度: {Math.round(((currentIdx + 1) / questions.length) * 100)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Question Text */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded font-mono">
                {activeQuestion.algorithmName}
              </span>
              <h2 className="text-base font-black text-slate-100 leading-relaxed">
                {activeQuestion.question}
              </h2>
            </div>

            {/* Option Buttons */}
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(activeQuestion.options).map(([key, text]) => {
                const isSelected = answers[activeQuestion.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectOption(key)}
                    className={`text-left p-4 rounded-xl border text-xs leading-relaxed transition-all flex gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-purple-600/15 border-purple-500 text-purple-200"
                        : "bg-slate-900 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                    }`}
                  >
                    <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center font-black ${
                      isSelected ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400"
                    }`}>
                      {key}
                    </span>
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center border-t border-white/5 pt-5">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-all cursor-pointer"
              >
                ◀ 上一題
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
                >
                  下一題 ▶
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  📊 送出作答並評分
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Results grading screen */
          results && (
            <div className="space-y-8">
              {/* Score summary panel */}
              <div className="glass-panel p-6 md:p-8 rounded-3xl text-center space-y-4 bg-gradient-to-br from-purple-900/20 via-slate-900/60 to-blue-900/10">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">評分完成</span>
                <div className="inline-flex flex-col items-center">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    {results.score} / {results.totalQuestions}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">答對題數</span>
                </div>

                <div className="w-48 mx-auto bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full"
                    style={{ width: `${results.percentage}%` }}
                  ></div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-200">
                    {results.percentage >= 80 ? "🏆 太棒了！您對演算法具備極佳概念" : results.percentage >= 50 ? "👍 還不錯！建議複習答錯的章節" : "💪 再接再厲！細讀報告一定會進步"}
                  </h3>
                  <p className="text-[11px] text-slate-500">總體得分率：{results.percentage}%</p>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={startQuiz}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow cursor-pointer active:scale-95"
                  >
                    🔄 再測驗一次
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-white/5 transition-all cursor-pointer block"
                  >
                    🏠 返回首頁大綱
                  </Link>
                </div>
              </div>

              {/* Question review details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">📝 題目詳解與檢討</h3>
                
                <div className="space-y-4">
                  {questions.map((q, idx) => {
                    const grad = results.results.find(r => r.questionId === q.id);
                    if (!grad) return null;

                    return (
                      <div 
                        key={q.id} 
                        className={`glass-panel p-5 rounded-2xl border ${
                          grad.isCorrect ? "border-emerald-500/25 bg-emerald-950/5" : "border-red-500/25 bg-red-950/5"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded font-mono">
                              {q.algorithmName}
                            </span>
                            <h4 className="text-xs font-black text-slate-200">
                              {idx + 1}. {q.question}
                            </h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            grad.isCorrect ? "bg-emerald-600/20 text-emerald-300" : "bg-red-600/20 text-red-300"
                          }`}>
                            {grad.isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>

                        {/* Options list static representation */}
                        <div className="grid grid-cols-1 gap-1.5 my-3 text-[11px]">
                          {Object.entries(q.options).map(([k, text]) => {
                            const isUserSelected = grad.selectedOption === k;
                            const isCorrectAns = grad.correctOption === k;
                            
                            let optStyle = "bg-slate-900/50 text-slate-400 border-white/5";
                            if (isCorrectAns) {
                              optStyle = "bg-emerald-500/10 text-emerald-300 border-emerald-500/25 font-bold";
                            } else if (isUserSelected && !grad.isCorrect) {
                              optStyle = "bg-red-500/10 text-red-300 border-red-500/25 font-bold";
                            }

                            return (
                              <div key={k} className={`px-3 py-2 border rounded-lg flex gap-2 ${optStyle}`}>
                                <span className="font-bold shrink-0">{k}.</span>
                                <span>{text}</span>
                                {isUserSelected && <span className="ml-auto text-[9px] font-bold text-slate-500">(您的選擇)</span>}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation block */}
                        <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-white/5">
                          <strong className="text-purple-400 block mb-0.5">📚 研讀報告解析說明：</strong>
                          {grad.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Floating AI chat assistant drawer */}
      <ChatAssistant />
    </div>
  );
}
