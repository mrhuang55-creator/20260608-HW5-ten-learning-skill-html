"use client";

import React, { useState, useEffect, useMemo } from "react";

interface VisualizerProps {
  algorithmId: string;
}

export default function AlgoVisualizer({ algorithmId }: VisualizerProps) {
  switch (algorithmId) {
    case "3.1":
      return <LinearRegressionVisualizer />;
    case "3.2":
      return <LogisticRegressionVisualizer />;
    case "3.3":
      return <DecisionTreeVisualizer />;
    case "3.4":
      return <RandomForestVisualizer />;
    case "3.5":
      return <SVMVisualizer />;
    case "3.6":
      return <KNNVisualizer />;
    case "3.7":
      return <NaiveBayesVisualizer />;
    case "3.8":
      return <KMeansVisualizer />;
    case "3.9":
      return <GradientBoostingVisualizer />;
    case "3.10":
      return <NeuralNetworkVisualizer />;
    default:
      return (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-2xl bg-slate-900/40 text-slate-500">
          無可用的視覺化模擬。
        </div>
      );
  }
}

// ----------------------------------------------------
// 3.1 Linear Regression
// ----------------------------------------------------
function LinearRegressionVisualizer() {
  const [slope, setSlope] = useState(1.2);
  const [intercept, setIntercept] = useState(40);

  // Hardcoded scatter points
  const points = useMemo(() => [
    { x: 30, y: 80 },
    { x: 60, y: 120 },
    { x: 90, y: 130 },
    { x: 120, y: 190 },
    { x: 150, y: 210 },
    { x: 180, y: 270 },
    { x: 210, y: 280 },
    { x: 240, y: 340 },
    { x: 270, y: 370 },
  ], []);

  // Compute MSE dynamically
  const mse = useMemo(() => {
    let sumErrSq = 0;
    points.forEach((p) => {
      // Model prediction: y = slope * x + intercept
      const predY = slope * p.x + intercept;
      const error = p.y - predY;
      sumErrSq += error * error;
    });
    return Math.round(sumErrSq / points.length);
  }, [slope, intercept, points]);

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-blue-400">📈 線性迴歸動態模擬</h4>
        <span className="text-xs font-mono bg-blue-950/80 text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/20">
          均方誤差 (MSE): <span className="font-bold">{mse}</span>
        </span>
      </div>

      <div className="relative w-full h-80 bg-slate-950/90 rounded-xl border border-white/5 overflow-hidden flex items-end">
        {/* Draw Plot */}
        <svg className="absolute inset-0 w-full h-full p-4 overflow-visible">
          {/* Axis lines */}
          <line x1="0" y1="100%" x2="100%" y2="100%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <line x1="0" y1="0" x2="0" y2="100%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

          {/* Regression Line */}
          {/* SVG origin is top-left, we map coordinates */}
          {/* x ranges from 0 to 300, y ranges from 0 to 400. In svg, top = 0, bottom = height. We do: svgY = height - val */}
          <line
            x1="0"
            y1={320 - intercept}
            x2="300"
            y2={320 - (slope * 300 + intercept)}
            stroke="#3b82f6"
            strokeWidth="3.5"
            strokeDasharray={mse > 1500 ? "4" : "0"}
            className="transition-all duration-75"
          />

          {/* Scatter points */}
          {points.map((p, idx) => {
            const predY = slope * p.x + intercept;
            const isCloser = Math.abs(p.y - predY) < 30;
            return (
              <g key={idx}>
                {/* Error projection line */}
                <line
                  x1={p.x}
                  y1={320 - p.y}
                  x2={p.x}
                  y2={320 - predY}
                  stroke={isCloser ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}
                  strokeDasharray="2"
                />
                {/* Data point */}
                <circle
                  cx={p.x}
                  cy={320 - p.y}
                  r="6.5"
                  className={`${isCloser ? "fill-emerald-400" : "fill-red-400"} stroke-slate-900 stroke-2`}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">斜率 (Slope - W)</span>
            <span className="text-blue-400 font-mono font-bold">{slope.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2.5"
            step="0.05"
            value={slope}
            onChange={(e) => setSlope(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">截距 (Intercept - B)</span>
            <span className="text-blue-400 font-mono font-bold">{intercept.toFixed(0)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="5"
            value={intercept}
            onChange={(e) => setIntercept(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
      <p className="text-[11px] text-slate-400 italic">
        💡 提示：調整「斜率」與「截距」使藍色模型線儘可能穿過所有綠點。誤差投影線愈短，MSE（均方誤差）愈低，模型擬合效果愈好。
      </p>
    </div>
  );
}

// ----------------------------------------------------
// 3.2 Logistic Regression
// ----------------------------------------------------
function LogisticRegressionVisualizer() {
  const [boundary, setBoundary] = useState(150);

  const points = useMemo(() => [
    { x: 40, y: 0, val: 50 },
    { x: 70, y: 0, val: 80 },
    { x: 100, y: 0, val: 110 },
    { x: 130, y: 0, val: 140 },
    { x: 160, y: 1, val: 170 },
    { x: 190, y: 1, val: 200 },
    { x: 220, y: 1, val: 230 },
    { x: 250, y: 1, val: 260 },
  ], []);

  // Compute accuracy based on current boundary
  const accuracy = useMemo(() => {
    let correct = 0;
    points.forEach((p) => {
      const pred = p.val >= boundary ? 1 : 0;
      if (pred === p.y) correct++;
    });
    return Math.round((correct / points.length) * 100);
  }, [boundary, points]);

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-emerald-400">🔗 邏輯斯迴歸與 Sigmoid 曲線</h4>
        <span className="text-xs font-mono bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/20">
          分類準確率: <span className="font-bold">{accuracy}%</span>
        </span>
      </div>

      <div className="relative w-full h-80 bg-slate-950/90 rounded-xl border border-white/5 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full p-4 overflow-visible">
          {/* Class bounds */}
          <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
          <line x1="0" y1="260" x2="300" y2="260" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
          <text x="5" y="35" className="text-[10px] fill-slate-500">目標機率 = 1.0 (正類)</text>
          <text x="5" y="250" className="text-[10px] fill-slate-500">目標機率 = 0.0 (負類)</text>

          {/* Draw Sigmoid Curve based on boundary slider */}
          {/* Curve equation: y = 1 / (1 + exp(-k * (x - x_0))) */}
          <path
            d={Array.from({ length: 60 }, (_, i) => {
              const x = i * 5;
              // k scale controls steepness
              const k = 0.05;
              const prob = 1 / (1 + Math.exp(-k * (x - boundary)));
              // Map to SVG coordinates: top is probability 1 (y=40), bottom is probability 0 (y=240)
              const y = 240 - prob * 200;
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            }).join(" ")}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            className="transition-all duration-75"
          />

          {/* Decision Boundary vertical line */}
          <line
            x1={boundary}
            y1="20"
            x2={boundary}
            y2="260"
            stroke="rgba(255,255,255,0.3)"
            strokeDasharray="2 2"
          />
          <text x={boundary + 5} y="140" className="text-[9px] fill-slate-400">決策門檻 (0.5)</text>

          {/* Class points */}
          {points.map((p, idx) => {
            // Map p.y (0 or 1) to bottom or top of plot
            const svgY = p.y === 1 ? 40 : 240;
            const predProb = 1 / (1 + Math.exp(-0.05 * (p.val - boundary)));
            const predClass = predProb >= 0.5 ? 1 : 0;
            const isCorrect = predClass === p.y;
            
            return (
              <g key={idx}>
                {/* Probability node projection */}
                <circle
                  cx={p.x}
                  cy={240 - predProb * 200}
                  r="4"
                  fill="rgba(16, 185, 129, 0.4)"
                />
                {/* Original class node */}
                <circle
                  cx={p.x}
                  cy={svgY}
                  r="6.5"
                  className={`${isCorrect ? "fill-emerald-400" : "fill-red-400"} stroke-slate-900 stroke-2`}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">調整決策邊界 (Decision Boundary)</span>
          <span className="text-emerald-400 font-mono font-bold">X = {boundary}</span>
        </div>
        <input
          type="range"
          min="50"
          max="250"
          step="5"
          value={boundary}
          onChange={(e) => setBoundary(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
      <p className="text-[11px] text-slate-400 italic">
        💡 說明：邏輯斯迴歸透過 S 型曲線（Sigmoid）估計樣本發生機率。當點在虛線右側，模型預測其機率大於 0.5（預測為正類）。移動滑桿，找到能完美區分正負樣本（所有點都變綠色）的黃金分界線。
      </p>
    </div>
  );
}

// ----------------------------------------------------
// 3.3 Decision Tree
// ----------------------------------------------------
function DecisionTreeVisualizer() {
  const [splitVal, setSplitVal] = useState(120);

  // Features of items: (X: Age, Y: Usage frequency)
  const items = useMemo(() => [
    { id: 1, age: 40, usage: 80, label: "重度" },
    { id: 2, age: 60, usage: 110, label: "重度" },
    { id: 3, age: 90, usage: 150, label: "重度" },
    { id: 4, age: 110, usage: 40, label: "輕度" },
    { id: 5, age: 140, usage: 90, label: "輕度" },
    { id: 6, age: 170, usage: 60, label: "輕度" },
    { id: 7, age: 200, usage: 20, label: "輕度" },
  ], []);

  // Split calculations
  const leftNode = items.filter(item => item.age < splitVal);
  const rightNode = items.filter(item => item.age >= splitVal);

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <h4 className="text-sm font-bold text-amber-400">🌳 決策樹條件二分特徵空間</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: 2D Feature Space Splitting */}
        <div className="relative h-60 bg-slate-950 rounded-xl border border-white/5 overflow-hidden p-2">
          <div className="absolute top-2 left-2 text-[10px] text-slate-500 font-bold">2D 特徵分割平面 (X=年齡)</div>
          <svg className="w-full h-full p-4 overflow-visible">
            {/* Split boundary line */}
            <line
              x1={splitVal}
              y1="0"
              x2={splitVal}
              y2="100%"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              className="transition-all duration-75"
            />
            {/* Draw nodes */}
            {items.map(item => (
              <g key={item.id}>
                <circle
                  cx={item.age}
                  cy={150 - item.usage}
                  r="6.5"
                  className={`${item.label === "重度" ? "fill-purple-400" : "fill-cyan-400"} stroke-slate-900 stroke-2`}
                />
                <text x={item.age} y={135 - item.usage} className="text-[8px] fill-slate-400 text-center" textAnchor="middle">{item.label}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Right: Hierarchical Tree Graph */}
        <div className="flex flex-col justify-center items-center bg-slate-900/50 rounded-xl p-4 border border-white/5 text-xs text-center space-y-4">
          {/* Root Node */}
          <div className="bg-slate-800 border border-amber-500/40 p-2 rounded shadow-md w-36">
            <p className="font-bold text-amber-400 text-[10px]">根節點 (全部樣本)</p>
            <p className="text-[9px] text-slate-400">年齡 &lt; {splitVal}？</p>
          </div>
          
          <div className="flex w-full justify-around relative">
            {/* Connections */}
            <div className="absolute top-[-15px] left-1/4 right-1/4 h-[15px] border-t-2 border-dashed border-white/10"></div>
            
            {/* Left Child Leaf */}
            <div className="bg-slate-800 border border-purple-500/20 p-2 rounded shadow-md w-28">
              <p className="font-bold text-purple-400 text-[10px]">左子樹 (是)</p>
              <p className="text-[9px] text-slate-300">樣本數: {leftNode.length}</p>
              <p className="text-[9px] text-purple-300">重度比例: {Math.round((leftNode.filter(n => n.label === "重度").length / (leftNode.length || 1)) * 100)}%</p>
            </div>
            
            {/* Right Child Leaf */}
            <div className="bg-slate-800 border border-cyan-500/20 p-2 rounded shadow-md w-28">
              <p className="font-bold text-cyan-400 text-[10px]">右子樹 (否)</p>
              <p className="text-[9px] text-slate-300">樣本數: {rightNode.length}</p>
              <p className="text-[9px] text-cyan-300">輕度比例: {Math.round((rightNode.filter(n => n.label === "輕度").length / (rightNode.length || 1)) * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">切割門檻 (Split Threshold)</span>
          <span className="text-amber-400 font-mono font-bold">X = {splitVal}</span>
        </div>
        <input
          type="range"
          min="50"
          max="180"
          step="5"
          value={splitVal}
          onChange={(e) => setSplitVal(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>
      <p className="text-[11px] text-slate-400 italic">
        💡 觀念：單棵決策樹透過「條件分割（如年齡是否小於門檻）」將特徵空間一分為二。調整滑桿，觀察兩側子樹的純度變化（即重度/輕度標籤是否能被完全分開）。
      </p>
    </div>
  );
}

// ----------------------------------------------------
// 3.4 Random Forest
// ----------------------------------------------------
function RandomForestVisualizer() {
  const [votes, setVotes] = useState<number[]>([1, 1, 0, 1, 0]); // 1: Class A, 0: Class B
  
  const handleVote = () => {
    // Generate new random votes for 5 trees
    const newVotes = Array.from({ length: 5 }, () => (Math.random() > 0.4 ? 1 : 0));
    setVotes(newVotes);
  };

  const voteSum = votes.reduce((a, b) => a + b, 0);
  const finalClass = voteSum >= 3 ? "重度" : "輕度";

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-emerald-400">🌲🌲 隨機森林集成投票模擬</h4>
        <button
          onClick={handleVote}
          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg shadow transition-all active:scale-95 cursor-pointer"
        >
          🎲 隨機產生新預測
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2 text-center">
        {votes.map((v, i) => (
          <div key={i} className="bg-slate-800 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-between h-32">
            <span className="text-[9px] font-mono text-slate-500">決策樹 {i + 1}</span>
            <span className={`text-2xl ${v === 1 ? "animate-bounce" : ""}`}>🌳</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v === 1 ? "bg-purple-600/30 text-purple-300" : "bg-cyan-600/30 text-cyan-300"}`}>
              {v === 1 ? "重度" : "輕度"}
            </span>
          </div>
        ))}
      </div>

      {/* Aggregate result */}
      <div className="bg-slate-950 rounded-xl p-4 border border-white/5 text-center flex flex-col items-center gap-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-wide">多數決投票結果 (Majority Vote)</span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-100">分類預測為：</span>
          <span className={`text-xl font-black px-4 py-1 rounded-lg ${finalClass === "重度" ? "bg-purple-600/20 text-purple-400 border border-purple-500/20" : "bg-cyan-600/20 text-cyan-400 border border-cyan-500/20"}`}>
            {finalClass}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 mt-1">
          (重度: {voteSum} 票 | 輕度: {5 - voteSum} 票)
        </span>
      </div>
      <p className="text-[11px] text-slate-400 italic">
        💡 說明：隨機森林由多棵獨立決策樹組成，因每棵樹選用的樣本與特徵子集不同（袋裝法），預測結果各異。最後透過「多數投票」得出最終答案，使整體預測比單棵決策樹更加穩定與精準。
      </p>
    </div>
  );
}

// ----------------------------------------------------
// 3.5 SVM (Support Vector Machine)
// ----------------------------------------------------
function SVMVisualizer() {
  const [kernel, setKernel] = useState<"linear" | "rbf">("linear");
  const [cParam, setCParam] = useState(1.0);

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-indigo-400">🛡️ 支援向量機 SVM 最大化邊界</h4>
        
        {/* Kernel switch */}
        <div className="flex bg-slate-950 rounded-lg p-0.5 border border-white/5 text-[11px]">
          <button
            onClick={() => setKernel("linear")}
            className={`px-2.5 py-1 rounded ${kernel === "linear" ? "bg-indigo-600 text-white font-bold" : "text-slate-400"}`}
          >
            線性核
          </button>
          <button
            onClick={() => setKernel("rbf")}
            className={`px-2.5 py-1 rounded ${kernel === "rbf" ? "bg-indigo-600 text-white font-bold" : "text-slate-400"}`}
          >
            RBF 核 (非線性)
          </button>
        </div>
      </div>

      <div className="relative w-full h-60 bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
        <svg className="w-full h-full p-4 overflow-visible">
          {kernel === "linear" ? (
            <>
              {/* Decision Boundary */}
              <line x1="20" y1="200" x2="280" y2="40" stroke="#818cf8" strokeWidth="3" />
              {/* Margins */}
              <line x1="0" y1="170" x2="260" y2="10" stroke="#818cf8" strokeWidth="1" strokeDasharray="4 2" />
              <line x1="40" y1="230" x2="300" y2="70" stroke="#818cf8" strokeWidth="1" strokeDasharray="4 2" />
              
              {/* Highlight Support Vectors */}
              <circle cx="100" cy="100" r="10" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2" className="animate-spin" style={{ animationDuration: "6s" }} />
              <circle cx="180" cy="130" r="10" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2" className="animate-spin" style={{ animationDuration: "6s" }} />
              
              <circle cx="100" cy="100" r="6" className="fill-purple-400" />
              <circle cx="180" cy="130" r="6" className="fill-cyan-400" />
              <text x="100" y="85" className="text-[8px] fill-amber-300" textAnchor="middle">支援向量</text>
              <text x="180" y="150" className="text-[8px] fill-amber-300" textAnchor="middle">支援向量</text>
            </>
          ) : (
            <>
              {/* Non-linear border */}
              <path
                d="M 20 220 Q 150 50, 280 220"
                fill="none"
                stroke="#818cf8"
                strokeWidth="3"
              />
              <path
                d="M 20 200 Q 150 30, 280 200"
                fill="none"
                stroke="#818cf8"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <path
                d="M 20 240 Q 150 70, 280 240"
                fill="none"
                stroke="#818cf8"
                strokeWidth="1"
                strokeDasharray="4"
              />
              {/* Support vectors in RBF */}
              <circle cx="150" cy="85" r="10" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2" />
              <circle cx="150" cy="85" r="6" className="fill-purple-400" />
              <text x="150" y="65" className="text-[8px] fill-amber-300" textAnchor="middle">支援向量 (RBF)</text>
            </>
          )}

          {/* Random background points */}
          <circle cx="40" cy="60" r="5" className="fill-purple-400/50" />
          <circle cx="60" cy="80" r="5" className="fill-purple-400/50" />
          <circle cx="240" cy="180" r="5" className="fill-cyan-400/50" />
          <circle cx="220" cy="160" r="5" className="fill-cyan-400/50" />
        </svg>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">正規化參數 (C - Margin Softness)</span>
          <span className="text-indigo-400 font-mono font-bold">C = {cParam.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="3.0"
          step="0.1"
          value={cParam}
          onChange={(e) => setCParam(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>
      <p className="text-[11px] text-slate-400 italic">
        💡 說明：SVM 藉由最大化分界線與最近樣本（稱為「支援向量」）之間的邊界（Margin）來提高模型的穩定性。RBF 核可用於處理原本無法以直線分割的複雜特徵分布。
      </p>
    </div>
  );
}

// ----------------------------------------------------
// 3.6 KNN (K-Nearest Neighbors)
// ----------------------------------------------------
function KNNVisualizer() {
  const [k, setK] = useState(3);
  const [queryPoint, setQueryPoint] = useState<{ x: number; y: number } | null>(null);

  // Neighbor nodes in coordinate space (width: 300, height: 200)
  const neighbors = useMemo(() => [
    { x: 50, y: 40, class: "A" },
    { x: 70, y: 70, class: "A" },
    { x: 90, y: 50, class: "A" },
    { x: 120, y: 80, class: "A" },
    { x: 180, y: 120, class: "B" },
    { x: 210, y: 150, class: "B" },
    { x: 240, y: 130, class: "B" },
    { x: 250, y: 90, class: "B" },
  ], []);

  // Compute nearest neighbors if a query point is placed
  const sortedNeighbors = useMemo(() => {
    if (!queryPoint) return [];
    
    return neighbors
      .map(n => {
        const dist = Math.sqrt((n.x - queryPoint.x) ** 2 + (n.y - queryPoint.y) ** 2);
        return { ...n, dist };
      })
      .sort((a, b) => a.dist - b.dist);
  }, [queryPoint, neighbors]);

  const nearestK = useMemo(() => {
    return sortedNeighbors.slice(0, k);
  }, [sortedNeighbors, k]);

  // Majority class
  const predClass = useMemo(() => {
    if (nearestK.length === 0) return null;
    const countA = nearestK.filter(n => n.class === "A").length;
    const countB = nearestK.length - countA;
    return countA > countB ? "A" : "B";
  }, [nearestK]);

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-purple-400">📍 KNN 鄰近樣本距離分類</h4>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-slate-400">鄰居數 K =</label>
          <select
            value={k}
            onChange={(e) => setK(parseInt(e.target.value))}
            className="text-xs bg-slate-800 border border-white/10 rounded px-2 py-1 focus:outline-none"
          >
            <option value={1}>1</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </div>
      </div>

      {/* SVG Canvas */}
      <div 
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setQueryPoint({ x, y });
        }}
        className="relative w-full h-56 bg-slate-950 rounded-xl border border-white/5 overflow-hidden cursor-crosshair"
      >
        {!queryPoint && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 font-bold bg-slate-950/70 select-none pointer-events-none">
            🎯 點擊畫布任何位置放置測試點
          </div>
        )}
        
        <svg className="w-full h-full p-2 overflow-visible pointer-events-none">
          {/* Nearest K connector lines */}
          {queryPoint && nearestK.map((n, i) => (
            <line
              key={i}
              x1={queryPoint.x}
              y1={queryPoint.y}
              x2={n.x}
              y2={n.y}
              stroke="#a855f7"
              strokeWidth="1.5"
              strokeDasharray="3"
            />
          ))}

          {/* All training points */}
          {neighbors.map((n, idx) => {
            const isNearest = queryPoint && nearestK.some(nk => nk.x === n.x && nk.y === n.y);
            return (
              <circle
                key={idx}
                cx={n.x}
                cy={n.y}
                r="6.5"
                className={`${n.class === "A" ? "fill-purple-400" : "fill-cyan-400"} ${isNearest ? "stroke-white stroke-[2.5px]" : "stroke-slate-900 stroke-2"}`}
              />
            );
          })}

          {/* User's query point */}
          {queryPoint && (
            <g>
              <circle
                cx={queryPoint.x}
                cy={queryPoint.y}
                r="8"
                className={`${predClass === "A" ? "fill-purple-400" : "fill-cyan-400"} stroke-white stroke-[2.5px] animate-pulse`}
              />
              <text x={queryPoint.x} y={queryPoint.y - 12} className="text-[8px] fill-white font-bold" textAnchor="middle">
                分類結果: {predClass === "A" ? "A 類" : "B 類"}
              </text>
            </g>
          )}
        </svg>
      </div>
      <p className="text-[11px] text-slate-400 italic">
        💡 提示：KNN 在推論時計算與鄰近點的距離。點擊畫布在任意區域放置一個亮點，系統會找出最近的 K 個鄰居，並以多數決給出該點的類別（紫色或藍色）。
      </p>
    </div>
  );
}

// ----------------------------------------------------
// 3.7 Naive Bayes
// ----------------------------------------------------
function NaiveBayesVisualizer() {
  const [spamPrior, setSpamPrior] = useState(0.5); // Prior probability of spam P(Spam)
  const [wordGivenSpam, setWordGivenSpam] = useState(0.8); // Likelihood P("免費"|Spam)
  const [wordGivenHam, setWordGivenHam] = useState(0.1); // Likelihood P("免費"|Ham)

  // Compute Posterior Probability of Spam given keyword "免費" via Bayes Theorem
  // P(Spam|免費) = [P("免費"|Spam) * P(Spam)] / [P("免費"|Spam) * P(Spam) + P("免費"|Ham) * P(Ham)]
  const hamPrior = 1 - spamPrior;
  const numerator = wordGivenSpam * spamPrior;
  const denominator = numerator + (wordGivenHam * hamPrior);
  const posteriorSpam = denominator > 0 ? (numerator / denominator) : 0.0;

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-sky-400">📊 樸素貝氏條件機率計算</h4>
        <span className="text-xs font-mono bg-sky-950/80 text-sky-300 px-2.5 py-1 rounded-full border border-sky-500/20">
          貝氏機率 P(垃圾|&quot;免費&quot;): <span className="font-bold">{Math.round(posteriorSpam * 100)}%</span>
        </span>
      </div>

      {/* Visual meter */}
      <div className="h-12 bg-slate-950 rounded-xl relative overflow-hidden flex border border-white/5">
        <div 
          className="bg-red-500/30 text-red-300 flex items-center justify-center text-xs font-bold transition-all duration-300 border-r border-white/10" 
          style={{ width: `${posteriorSpam * 100}%` }}
        >
          {posteriorSpam > 0.1 && `🚨 垃圾郵件 (${Math.round(posteriorSpam * 100)}%)`}
        </div>
        <div 
          className="bg-emerald-500/20 text-emerald-300 flex-1 flex items-center justify-center text-xs font-bold transition-all duration-300"
        >
          {posteriorSpam < 0.9 && `✅ 正常郵件 (${Math.round((1 - posteriorSpam) * 100)}%)`}
        </div>
      </div>

      {/* Probability Sliders */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">垃圾郵件先驗機率 P(Spam)</span>
            <span className="text-sky-400 font-mono font-bold">P = {spamPrior.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.05"
            value={spamPrior}
            onChange={(e) => setSpamPrior(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">P(&quot;免費&quot;|垃圾)</span>
              <span className="text-sky-400 font-mono font-bold">{wordGivenSpam.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.05"
              value={wordGivenSpam}
              onChange={(e) => setWordGivenSpam(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">P(&quot;免費&quot;|正常)</span>
              <span className="text-sky-400 font-mono font-bold">{wordGivenHam.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.05"
              value={wordGivenHam}
              onChange={(e) => setWordGivenHam(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 italic">
        💡 說明：樸素貝氏利用貝氏定理，結合先驗機率與特徵條件機率，計算在出現特定文字（如「免費」）的條件下，該郵件屬於垃圾郵件的機率。調整數值，觀察模型如何做出判斷。
      </p>
    </div>
  );
}

// ----------------------------------------------------
// 3.8 KMeans Clustering
// ----------------------------------------------------
function KMeansVisualizer() {
  const [step, setStep] = useState(0);

  // Hardcoded nodes
  const initialPoints = [
    { id: 1, x: 50, y: 50 },
    { id: 2, x: 60, y: 70 },
    { id: 3, x: 80, y: 40 },
    { id: 4, x: 220, y: 150 },
    { id: 5, x: 240, y: 130 },
    { id: 6, x: 200, y: 160 },
  ];

  // Centroids at step 0 (user-placed or initial)
  const [centroids, setCentroids] = useState([
    { x: 100, y: 100, color: "#a855f7" }, // Purple
    { x: 160, y: 100, color: "#06b6d4" }, // Cyan
  ]);

  const [points, setPoints] = useState(
    initialPoints.map(p => ({ ...p, cluster: -1 }))
  );

  const resetKMeans = () => {
    setCentroids([
      { x: 100, y: 100, color: "#a855f7" },
      { x: 160, y: 100, color: "#06b6d4" },
    ]);
    setPoints(initialPoints.map(p => ({ ...p, cluster: -1 })));
    setStep(0);
  };

  const nextStep = () => {
    if (step % 2 === 0) {
      // Step A: Assign points to nearest centroid
      const updated = points.map(p => {
        let minDist = Infinity;
        let closestIdx = -1;
        
        centroids.forEach((c, idx) => {
          const dist = Math.sqrt((p.x - c.x) ** 2 + (p.y - c.y) ** 2);
          if (dist < minDist) {
            minDist = dist;
            closestIdx = idx;
          }
        });
        return { ...p, cluster: closestIdx };
      });
      setPoints(updated);
      setStep(step + 1);
    } else {
      // Step B: Update centroids based on assigned points
      const newCentroids = centroids.map((c, cIdx) => {
        const assigned = points.filter(p => p.cluster === cIdx);
        if (assigned.length === 0) return c; // No change
        
        const sumX = assigned.reduce((sum, p) => sum + p.x, 0);
        const sumY = assigned.reduce((sum, p) => sum + p.y, 0);
        
        return {
          ...c,
          x: Math.round(sumX / assigned.length),
          y: Math.round(sumY / assigned.length),
        };
      });
      setCentroids(newCentroids);
      setStep(step + 1);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-purple-400">🔮 K-means 分群演算法迭代步驟</h4>
        <div className="flex gap-2">
          <button
            onClick={resetKMeans}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-2.5 rounded border border-white/5 cursor-pointer"
          >
            重置
          </button>
          <button
            onClick={nextStep}
            className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white font-bold py-1.5 px-3 rounded shadow transition-all active:scale-95 cursor-pointer"
          >
            {step % 2 === 0 ? "👉 分配點群 (Assign)" : "👉 更新中心 (Update Centroids)"}
          </button>
        </div>
      </div>

      <div className="relative w-full h-52 bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
        <div className="absolute top-2 left-2 text-[9px] text-slate-500">
          目前狀態：{step === 0 ? "未開始" : step % 2 === 1 ? `第 ${Math.floor(step/2)+1} 輪 - 已指派分類` : `第 ${step/2} 輪 - 中心點已重新計算`}
        </div>

        <svg className="w-full h-full p-2 overflow-visible">
          {/* Connector lines from points to centroids */}
          {step > 0 && points.map(p => {
            if (p.cluster === -1) return null;
            const c = centroids[p.cluster];
            return (
              <line
                key={p.id}
                x1={p.x}
                y1={p.y}
                x2={c.x}
                y2={c.y}
                stroke={c.color}
                strokeWidth="1"
                strokeDasharray="2"
                className="transition-all duration-300"
              />
            );
          })}

          {/* Plot centroids as bigger shapes */}
          {centroids.map((c, idx) => (
            <g key={idx} className="transition-all duration-300">
              <polygon
                points={`${c.x},${c.y - 12} ${c.x - 10},${c.y + 7} ${c.x + 10},${c.y + 7}`}
                fill={c.color}
                stroke="white"
                strokeWidth="2"
                className="drop-shadow-lg"
              />
              <text x={c.x} y={c.y - 15} className="text-[8px] fill-white text-center font-bold" textAnchor="middle">群中心 {idx + 1}</text>
            </g>
          ))}

          {/* Plot nodes */}
          {points.map(p => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r="6.5"
              fill={p.cluster === -1 ? "#94a3b8" : centroids[p.cluster].color}
              className="stroke-slate-900 stroke-2 transition-all duration-300"
            />
          ))}
        </svg>
      </div>
      <p className="text-[11px] text-slate-400 italic">
        💡 說明：K-means 分群主要包含兩個交替步驟：1.將每個點歸屬到距離最近的群中心。2.根據各群分配到的點重新計算平均位置，將群中心移到新的核心。反覆迭代直至中心位置不變。
      </p>
    </div>
  );
}

// ----------------------------------------------------
// 3.9 Gradient Boosting
// ----------------------------------------------------
function GradientBoostingVisualizer() {
  const [treeCount, setTreeCount] = useState(1);

  // Define target curve values (Hardcoded coordinates mapping)
  const targetY = [80, 110, 160, 130, 90, 70];
  const tree1Y = [90, 90, 140, 140, 100, 100]; // Simplistic step function 1
  const tree2Y = [-10, 20, 20, -10, -10, -30]; // Tree 2 residual fit
  
  const finalPrediction = useMemo(() => {
    return targetY.map((target, idx) => {
      if (treeCount === 1) return tree1Y[idx];
      return tree1Y[idx] + tree2Y[idx];
    });
  }, [treeCount]);

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-amber-400">🔥 梯度提升樹擬合殘差 (Residuals)</h4>
        <div className="flex bg-slate-950 rounded-lg p-0.5 border border-white/5 text-[11px]">
          <button
            onClick={() => setTreeCount(1)}
            className={`px-2.5 py-1 rounded ${treeCount === 1 ? "bg-amber-600 text-white font-bold" : "text-slate-400"}`}
          >
            1 棵樹 (基底)
          </button>
          <button
            onClick={() => setTreeCount(2)}
            className={`px-2.5 py-1 rounded ${treeCount === 2 ? "bg-amber-600 text-white font-bold" : "text-slate-400"}`}
          >
            2 棵樹 (糾錯擬合)
          </button>
        </div>
      </div>

      <div className="relative w-full h-44 bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
        <svg className="w-full h-full p-4 overflow-visible">
          {/* Target pattern (Golden dotted line) */}
          <path
            d={`M 10 ${targetY[0]} L 60 ${targetY[1]} L 110 ${targetY[2]} L 160 ${targetY[3]} L 210 ${targetY[4]} L 260 ${targetY[5]}`}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeDasharray="4"
          />
          <text x="10" y="30" className="text-[8px] fill-amber-400">目標曲線</text>

          {/* Model Prediction line (Solid orange line) */}
          <path
            d={`M 10 ${finalPrediction[0]} L 60 ${finalPrediction[1]} L 110 ${finalPrediction[2]} L 160 ${finalPrediction[3]} L 210 ${finalPrediction[4]} L 260 ${finalPrediction[5]}`}
            fill="none"
            stroke="#f97316"
            strokeWidth="3.5"
            className="transition-all duration-300"
          />
          <text x="10" y="15" className="text-[8px] fill-orange-400">模型預測</text>

          {/* Small residuals representations */}
          {targetY.map((y, idx) => {
            const predY = finalPrediction[idx];
            return (
              <line
                key={idx}
                x1={10 + idx * 50}
                y1={y}
                x2={10 + idx * 50}
                y2={predY}
                stroke="#ef4444"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>
      <p className="text-[11px] text-slate-400 italic">
        💡 說明：提升樹（Boosting）與森林不同。第一棵樹建立後，第二棵樹專門用來預測前一棵樹留下的誤差（紅色直線）。兩者相加，模型預測值（橘線）就能更完美地貼合真實目標曲線（黃虛線）。
      </p>
    </div>
  );
}

// ----------------------------------------------------
// 3.10 Neural Network
// ----------------------------------------------------
function NeuralNetworkVisualizer() {
  const [activation, setActivation] = useState(0.5);

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-pink-400">🧠 類神經網絡前向傳播模擬</h4>
        <div className="text-xs font-mono text-pink-300">
          輸入強度: <span className="font-bold">{Math.round(activation * 100)}%</span>
        </div>
      </div>

      <div className="relative w-full h-48 bg-slate-950 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center p-4">
        {/* Simplified network structure (3 input, 4 hidden, 1 output) */}
        <svg className="w-full h-full overflow-visible">
          {/* Connection lines */}
          {/* Input to Hidden */}
          {[40, 80, 120].map((yIn) => (
            [25, 55, 85, 115].map((yHid) => (
              <line
                key={`${yIn}-${yHid}`}
                x1="40"
                y1={yIn + 15}
                x2="140"
                y2={yHid + 15}
                stroke="#ec4899"
                strokeWidth={1.5 * activation}
                strokeOpacity={0.15 + 0.4 * activation}
                className="transition-all duration-300"
              />
            ))
          ))}
          {/* Hidden to Output */}
          {[25, 55, 85, 115].map((yHid) => (
            <line
              key={`out-${yHid}`}
              x1="140"
              y1={yHid + 15}
              x2="240"
              y2="80"
              stroke="#a855f7"
              strokeWidth={2.5 * activation}
              strokeOpacity={0.2 + 0.6 * activation}
              className="transition-all duration-300"
            />
          ))}

          {/* Input Nodes */}
          {[40, 80, 120].map((y, i) => (
            <circle
              key={i}
              cx="40"
              cy={y + 15}
              r="7"
              fill="#ec4899"
              className="stroke-slate-900 stroke-2"
              style={{ opacity: 0.4 + 0.6 * activation }}
            />
          ))}
          <text x="40" y="25" className="text-[7px] fill-slate-500" textAnchor="middle">輸入層</text>

          {/* Hidden Nodes */}
          {[25, 55, 85, 115].map((y, i) => (
            <circle
              key={i}
              cx="140"
              cy={y + 15}
              r="7"
              fill="#8b5cf6"
              className="stroke-slate-900 stroke-2"
              style={{ opacity: 0.3 + 0.7 * activation }}
            />
          ))}
          <text x="140" y="15" className="text-[7px] fill-slate-500" textAnchor="middle">隱藏層</text>

          {/* Output Node */}
          <circle
            cx="240"
            cy="80"
            r="9.5"
            fill="#3b82f6"
            className="stroke-slate-900 stroke-2 animate-pulse"
            style={{ opacity: 0.5 + 0.5 * activation }}
          />
          <text x="240" y="60" className="text-[7px] fill-slate-500" textAnchor="middle">輸出層</text>
        </svg>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">激發輸入強度 (Input Signal)</span>
          <span className="text-pink-400 font-mono font-bold">Value = {activation.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.05"
          value={activation}
          onChange={(e) => setActivation(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
      </div>
      <p className="text-[11px] text-slate-400 italic">
        💡 說明：神經網絡藉由連接多個神經元，將輸入訊號乘以權重（連線粗細）進行前向傳播。隱藏層神經元套用非線性激活函數後傳遞給輸出層，藉此拟合複雜的特徵模式。
      </p>
    </div>
  );
}
