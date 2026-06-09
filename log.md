# 📝 機器學習十種經典圖表評估手冊 — 專案開發工作日誌 (log.md)

本專案旨在將「機器學習十種經典圖表評估手冊-gemini」與「十種機器學習算法網頁」轉化為高質感、互動式、具備本地資料庫狀態保存功能的 Streamlit 雲端學習平台。

---

## 📅 開發里程碑與時間線

### 🟢 2026/06/08 — 階段一：系統設計與資料結構化
*   **教材研讀與解析**：深度研讀 `機器學習十種經典圖表評估手冊-gemini.pdf` 報告。
*   **資料結構化**：撰寫指令碼將手冊中的 10 大演算法概述、數學原理（LaTeX）、圖表判讀要點、Python 範例代碼、思考習題完整解析並結構化為 `backend/evaluation_charts.py` 與 `backend/quiz_data.py`。
*   **系統架構設計**：確立多頁面學習、隨堂測驗與個人進度紀錄之功能藍圖。

### 🟡 2026/06/09 — 階段二：雙端架構嘗試與 UI/UX 極致優化
*   **雙端架構搭建**：建立 Next.js（前端）與 FastAPI（後端）的開發版架構。
*   **設計系統優化 (UI/UX Pro Max)**：
    *   移除 Next.js 預設字體，導入 Google Fonts 的 **IBM Plex Sans**（主要內文）與 **JetBrains Mono**（數據與代碼）。
    *   重構色彩主題系統，改用 **OLED 深色背景 (`#090b11`)**，搭配半透明毛玻璃面板與 **翡翠綠 (`#22c55e`)** 作為主要互動與強調色。
    *   強制實作平滑過渡（Transition）、聚焦框導航（WCSS AAA 標準）與低動畫模式（尊重系統減噪設定）。

### 🟠 2026/06/09 — 階段三：Streamlit 單端重構與本地 SQLite 整合
*   **輕量化單端重構**：為免去雲端部署多容器的複雜度，決定將 Next.js/FastAPI 架構整合為單一的 Streamlit 應用程式 `streamlit_app.py`。
*   **本地 SQLite 資料庫整合**：
    *   利用內建 `sqlite3` 模組讀寫 `database.db`，擺脫外部資料庫依賴，完美兼容 Streamlit Community Cloud。
    *   實作**進度追蹤器**：讓使用者為每個演算法獨立標記「理論研讀」、「模擬器操作」的完成狀態，並即時渲染側邊欄進度條。
    *   實作**隨堂個人筆記**：提供每個演算法專屬的文字框，自動從 SQLite 讀寫保存個人筆記，切換頁面或重新啟動均能持久化保存。
*   **隨堂測驗模組**：整合 12 題深度觀念選擇題，答題送出後即時給予解析，並自動在 SQLite 資料庫中將所有演算法的「測驗進度」標記為已通過。
*   **AI 助理模組移除**：遵照用戶要求，移除外部 AI API 金鑰呼叫，改為全本地化無代幣（Token）消耗的安全運作模式。

### 🔵 2026/06/09 — 階段四：專案除錯、Git 清除與正式部署
*   **非必要檔案清除**：
    *   刪除無關的 `0608教授實作.py` 暫存檔。
    *   使用 `git rm` 完全清除舊前端 `ml-app/`、舊設計系統 `design-system/`、舊 FastAPI 後端剩餘邏輯以及中間文件（`extracted_data.json`、`extracted_report.txt` 等），使專案容量與結構達到最精簡狀態。
*   **本地編譯與驗證**：在虛擬環境下通過 `py_compile` 語法檢測，並使用自動化瀏覽器測試工具對本地運行的 `http://localhost:8501/` 進行高強度滑桿拉動與筆記讀寫測試，確認 0 報錯、0 警告。
*   **正式推送到 GitHub 與部署**：
    *   程式碼成功推送至 GitHub 倉庫 `mrhuang55-creator/20260608-HW5-ten-learning-skill-html`。
    *   在 Streamlit Community Cloud 正式完成自動建置與部署，網址：[https://20260608-hw5-ten-learning-skill-html-47sq2je52u5unu5bdstetb.streamlit.app/](https://20260608-hw5-ten-learning-skill-html-47sq2je52u5unu5bdstetb.streamlit.app/)。
