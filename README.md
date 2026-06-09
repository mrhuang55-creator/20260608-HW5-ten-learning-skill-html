# 🤖 機器學習十大演算法互動式學習平台
### Machine Learning Algorithms Interactive Learning Platform

🔗 **Live Demo 線上網頁連結：[https://hw-5-liart.vercel.app/](https://hw-5-liart.vercel.app/)**

本專案是一個全端互動式學習平台，旨在將《機器學習十大演算法研讀報告》與《資訊圖表》數位化與動態化。使用者可以透過直觀的 SVG 動態圖表、整合式的演算法選用矩陣、多功能測驗練習，以及具備對話記憶功能的 AI 智慧學習助理，全方位掌握機器學習核心知識。

---

## 🎨 系統核心功能與亮點

### 1. 📊 學習控制中心 (Dashboard)
- **機器學習任務分類架構**：以直觀卡片呈現監督式學習（分類、迴歸）與無監督式學習（分群）之核心對應。
- **偏差與變異取捨 (Bias-Variance Tradeoff)**：視覺化折線圖解說模型複雜度與泛化誤差之關係。
- **演算法選用矩陣 (Comparison Matrix)**：提供可互動篩選的比較表格，讓使用者能依據「任務類型」、「資料規模」、「可解釋性」與「前處理要求」進行篩選與橫向對比。

### 2. 📖 十大演算法深度學習 (Learning Tracks)
包含 3.1 線性迴歸至 3.10 神經網路的完整解析，每個演算法提供五大結構化學習分頁：
- **定位與概念**：演算法的目標、實務用途與基本邏輯。
- **流程與前處理**：詳盡的步驟拆解與關鍵特徵工程要求。
- **優缺點與限制**：模型強項、適用邊界與常見限制。
- **部署與治理**：模型可解釋性、調參重點與專案導入建議。
- **補充與思維擴展**：研讀補充、延伸觀念與常見誤區解析。

### 3. 📉 互動式 SVG 動態視覺化 (Interactive Visualizations)
為每個演算法量身打造的 SVG 互動網頁動畫：
- **線性迴歸**：拖動斜率滑桿，即時觀測擬合線與殘差變動。
- **邏輯斯迴歸**：調整參數觀測 Sigmoid 曲線平滑度與分類界線變化。
- **決策樹**：階層式樹狀節點分裂（特徵條件分支）動態導覽。
- **隨機森林**：多棵決策樹集成投票分類流程動態解說。
- **SVM**：調整超參數邊界（Margin）與支援向量點標識。
- **KNN**：動態點擊變更鄰居數 $K$ 觀測預測類別變動。
- **樸素貝氏**：動態計算特徵與類別之條件機率轉換。
- **K-Means**：動態執行分群迭代，觀測群心收斂與族群指派。
- **梯度提升樹**：多階段弱學習器（殘差逼近）相加過程視覺化。
- **神經網路**：輸入層、隱藏層至輸出層的前向傳播權重連結動態光點動畫。

### 4. 📝 智能測驗系統 (Interactive Quiz)
- 包含 12 題深度機器學習觀念題庫，支援全方位測驗或單一演算法章節測驗。
- 即時送出至 FastAPI 後端進行批改評分。
- 顯示正確與錯誤回答分析，並附帶詳盡的解析與評估回饋。

### 5. 💬 AI 智慧學習助理 v2.0 (AI Assistant)
- **多平台大模型支援**：支援 **Google Gemini** (Gemini 2.0 Flash / Pro)、**OpenAI GPT** (GPT-4o / Mini) 以及 **Anthropic Claude** (Claude 3.7 Sonnet / 3.5 Haiku)。
- **對話記憶功能 (Chat History)**：保留最近 12 輪的對話上下文，支援前後連貫的追問（例如：「隨機森林是什麼？」$\rightarrow$「它有什麼限制？」）。
- **免 Key 本地語意檢索 fallback**：無 API Key 時自動啟用本地語意庫（TF-IDF + 領域專屬中文 keyword 匹配），精準檢索 PDF 報告相關章節進行回答。
- **隱私安全**：API Key 僅存儲於用戶本地瀏覽器，不回傳或保存至伺服器數據庫。

---

## 🛠️ 技術棧 (Technology Stack)

### 前端 component (Next.js)
- **框架**：Next.js 15 (TypeScript, React 19, App Router)
- **樣式**：Tailwind CSS + 訂製化 CSS Tokens
- **設計風格**：OLED 極致暗色主題 (Emerald Green 翠綠點綴、高對比、流暢微動畫、無障礙 Focus 設計)

### 後端 component (FastAPI)
- **框架**：FastAPI (Python 3.10+)
- **大模型介面**：Google Generative AI SDK, OpenAI API, Anthropic Messages REST API
- **語意搜尋**：本地 TF-IDF 演算法 + 關鍵詞解析匹配引擎

---

## 🚀 快速啟動與部署

### 1. 克隆專案 (Clone)
```bash
git clone https://github.com/KevinLin13/HW5.git
cd HW5
```

### 2. 啟動後端 FastAPI
確保您擁有 Python 3.10+ 環境：
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- 後端服務網址：[http://127.0.0.1:8000](http://127.0.0.1:8000)
- API 自動化文檔 (Swagger UI)：[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. 啟動前端 Next.js
確保您擁有 Node.js 18+ 或 24+：
```bash
cd frontend
npm install
npm run dev
```
- 前端服務網址：[http://localhost:3000](http://localhost:3000)
