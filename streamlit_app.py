import streamlit as st
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import sqlite3
import os
import sys

# 確保可以載入同級或 backend 子目錄下的模組
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# 載入結構化資料與測驗題庫
try:
    from backend.evaluation_charts import EVALUATION_CHARTS
except ImportError:
    st.error("無法載入 backend/evaluation_charts.py，請確認檔案結構完整。")
    EVALUATION_CHARTS = {}

try:
    from backend.quiz_data import QUIZ_QUESTIONS
except ImportError:
    st.error("無法載入 backend/quiz_data.py，請確認檔案結構完整。")
    QUIZ_QUESTIONS = []

# 機器學習相關庫引入
from sklearn.datasets import make_regression, make_classification, make_moons, make_blobs
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.cluster import KMeans
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import learning_curve
from sklearn.metrics import roc_curve, auc, precision_recall_curve, average_precision_score, accuracy_score

# -----------------------------------------------------------------------------
# SQLite 資料庫初始化與操作函數
# -----------------------------------------------------------------------------
backend_db = os.path.join(os.path.dirname(__file__), "backend", "database.db")
if os.path.exists(os.path.dirname(backend_db)):
    DB_PATH = backend_db
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS progress (
        algorithm_id TEXT PRIMARY KEY,
        study_completed INTEGER DEFAULT 0,
        quiz_completed INTEGER DEFAULT 0,
        playground_completed INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notes (
        algorithm_id TEXT PRIMARY KEY,
        content TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()

# 呼叫資料庫初始化
init_db()

def load_progress(algo_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM progress WHERE algorithm_id = ?", (algo_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {"algorithm_id": algo_id, "study_completed": 0, "quiz_completed": 0, "playground_completed": 0}

def save_progress(algo_id, study, quiz, playground):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO progress (algorithm_id, study_completed, quiz_completed, playground_completed, last_updated)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(algorithm_id) DO UPDATE SET
        study_completed=excluded.study_completed,
        quiz_completed=excluded.quiz_completed,
        playground_completed=excluded.playground_completed,
        last_updated=CURRENT_TIMESTAMP
    """, (algo_id, int(study), int(quiz), int(playground)))
    conn.commit()
    conn.close()

def load_note(algo_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT content FROM notes WHERE algorithm_id = ?", (algo_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row[0]
    return ""

def save_note(algo_id, content):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO notes (algorithm_id, content, last_updated)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(algorithm_id) DO UPDATE SET
        content=excluded.content,
        last_updated=CURRENT_TIMESTAMP
    """, (algo_id, content))
    conn.commit()
    conn.close()

def get_overall_progress():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT study_completed, quiz_completed, playground_completed FROM progress")
    rows = cursor.fetchall()
    conn.close()
    
    total_items = 10 * 3  # 10個演算法，每個有3個進度指標
    completed_items = sum(sum(row) for row in rows)
    if total_items == 0:
        return 0.0
    return min(1.0, completed_items / total_items)

# -----------------------------------------------------------------------------
# Streamlit 版面配置與主題
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="機器學習 10 大經典圖表評估手冊",
    page_icon="📈",
    layout="wide"
)

# 載入極客深色 OLED 風格主題 CSS
st.markdown("""
<style>
    .main {
        background-color: #090b11;
        color: #f1f5f9;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        background-color: #1e293b;
        border-radius: 4px 4px 0px 0px;
        color: #94a3b8;
        padding: 8px 16px;
    }
    .stTabs [aria-selected="true"] {
        background-color: #10b981 !important;
        color: #090b11 !important;
        font-weight: bold;
    }
    div[data-testid="stSidebar"] {
        background-color: #0f172a;
        border-right: 1px solid #1e293b;
    }
    h1, h2, h3 {
        color: #ffffff;
        font-family: 'JetBrains Mono', sans-serif;
    }
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 側邊欄導覽
# -----------------------------------------------------------------------------
st.sidebar.markdown("# 📈 ML 經典圖表評估手冊")
st.sidebar.caption("學術出版級教材互動平台")

# 顯示總體進度
overall_prog = get_overall_progress()
st.sidebar.markdown(f"**📊 個人總體學習進度 ({overall_prog*100:.1f}%)**")
st.sidebar.progress(overall_prog)

menu_options = [
    "📚 1. 線性迴歸與殘差分析",
    "📚 2. 邏輯斯迴歸與 ROC 曲線",
    "📚 3. 決策樹與空間劃分邊界",
    "📚 4. 隨機森林與特徵重要性",
    "📚 5. 支援向量機與最大間隔",
    "📚 6. K-最近鄰與距離度量",
    "📚 7. K-Means 與肘部收斂法",
    "📚 8. 單純貝氏與 PR 曲線",
    "📚 9. 梯度提升樹與訓練收斂",
    "📚 10. 神經網路與學習曲線",
    "📝 隨堂測驗練習"
]

selected_menu = st.sidebar.radio("導覽目錄", menu_options)

ALGO_KEYS = {
    "📚 1. 線性迴歸與殘差分析": "linear-regression",
    "📚 2. 邏輯斯迴歸與 ROC 曲線": "logistic-regression",
    "📚 3. 決策樹與空間劃分邊界": "decision-tree",
    "📚 4. 隨機森林與特徵重要性": "random-forest",
    "📚 5. 支援向量機與最大間隔": "support-vector-machine",
    "📚 6. K-最近鄰與距離度量": "k-nearest-neighbors",
    "📚 7. K-Means 與肘部收斂法": "k-means-clustering",
    "📚 8. 單純貝氏與 PR 曲線": "naive-bayes",
    "📚 9. 梯度提升樹與訓練收斂": "deep-learning",
    "📚 10. 神經網路與學習曲線": "principal-component-analysis"
}

# -----------------------------------------------------------------------------
# 隨堂測驗練習面板
# -----------------------------------------------------------------------------
if selected_menu == "📝 隨堂測驗練習":
    st.title("📝 隨堂測驗與觀念自我驗證")
    st.write("本測驗精選 12 題深度觀念選擇題，涵蓋偏差-方差權衡、資料洩漏及各演算法之評估圖表指標幾何意義。")
    
    if len(QUIZ_QUESTIONS) == 0:
        st.warning("查無測驗題目資料。")
    else:
        # 使用 Session State 保存回答狀態與分數
        if "quiz_answers" not in st.session_state:
            st.session_state.quiz_answers = {}
        if "quiz_submitted" not in st.session_state:
            st.session_state.quiz_submitted = False

        score = 0
        for idx, q in enumerate(QUIZ_QUESTIONS):
            st.markdown(f"### Q{idx+1}. {q['question']}")
            st.caption(f"章節分類: {q['algorithmName']}")
            
            opts = q['options']
            opt_labels = [f"{k}: {v}" for k, v in opts.items()]
            
            # 取得先前回答（若有）
            current_choice = st.session_state.quiz_answers.get(q['id'], None)
            default_idx = 0
            if current_choice in opts.keys():
                default_idx = list(opts.keys()).index(current_choice)
                
            selected_opt = st.radio(
                f"選擇答案 (Q{idx+1})", 
                opt_labels, 
                index=default_idx,
                key=f"radio_{q['id']}",
                label_visibility="collapsed"
            )
            # 存入答案
            chosen_key = selected_opt.split(":")[0]
            st.session_state.quiz_answers[q['id']] = chosen_key
            
            # 如果已經提交，則顯示對錯與解析
            if st.session_state.quiz_submitted:
                correct_key = q['answer']
                if chosen_key == correct_key:
                    st.success("✅ 回答正確")
                    score += 1
                else:
                    st.error(f"❌ 回答錯誤。正確答案是 **{correct_key}**")
                st.info(f"💡 **解析**: {q['explanation']}")
            st.markdown("---")
            
        col1, col2 = st.columns(2)
        with col1:
            if st.button("提交測驗送出評分", use_container_width=True):
                st.session_state.quiz_submitted = True
                st.rerun()
        with col2:
            if st.button("重設測驗", use_container_width=True):
                st.session_state.quiz_answers = {}
                st.session_state.quiz_submitted = False
                st.rerun()
                
        if st.session_state.quiz_submitted:
            st.balloons()
            st.markdown(f"## 🏆 測驗得分: `{score} / {len(QUIZ_QUESTIONS)}` 分 (得分率: {score/len(QUIZ_QUESTIONS)*100:.1f}%)")
            
            # 更新測驗進度至 SQLite (將所有演算法的 quiz_completed 標記為 1)
            for key in ALGO_KEYS.values():
                prog = load_progress(key)
                save_progress(key, prog['study_completed'], 1, prog['playground_completed'])
            st.toast("已為您自動同步更新資料庫中所有章節的『測驗進度』！")

# -----------------------------------------------------------------------------
# 演算法動態學習面板
# -----------------------------------------------------------------------------
else:
    algo_label = selected_menu
    algo_key = ALGO_KEYS[algo_label]
    data = EVALUATION_CHARTS.get(algo_key, None)
    
    if not data:
        st.error(f"找不到演算法 {algo_key} 的核心資料。")
    else:
        st.title(f"{algo_label} — {data['chart_title']}")
        st.caption(f"圖表類型: {data['chart_type']}")
        
        # 讀取當前演算法的 SQLite 進度與筆記
        db_prog = load_progress(algo_key)
        db_note = load_note(algo_key)
        
        # 分頁設計
        tab1, tab2, tab3 = st.tabs(["📚 理論與代碼 (Theory & Code)", "🎛️ 互動模擬器 (Interactive Simulator)", "✍️ 學習筆記與進度 (Notes & Progress)"])
        
        # ---------------------------------------------------------
        # Tab 1: 理論與代碼
        # ---------------------------------------------------------
        with tab1:
            st.subheader("💡 核心概念概述")
            st.write(data['summary'])
            
            st.subheader("📐 幾何與數學原理")
            for math_line in data['math_principle']:
                st.markdown(f"- {math_line}")
                
            st.subheader("📈 圖表判讀要領")
            for interp_line in data['chart_interpretation']:
                st.markdown(interp_line)
                
            st.subheader("💻 Python 實作範例碼")
            st.code(data['python_code'], language="python")
            
            st.subheader("❓ 思考與習題討論")
            st.info(data['exercise'])

        # ---------------------------------------------------------
        # Tab 2: 互動模擬器 (Playground)
        # ---------------------------------------------------------
        with tab2:
            st.subheader("🎛️ 實時參數調整與動態繪圖")
            
            # 建立圖表畫布與隨機狀態
            np.random.seed(42)
            fig, ax = plt.subplots(figsize=(6, 4))
            fig.patch.set_facecolor('#090b11')
            ax.set_facecolor('#0f172a')
            ax.spines['bottom'].set_color('#475569')
            ax.spines['top'].set_color('#475569')
            ax.spines['left'].set_color('#475569')
            ax.spines['right'].set_color('#475569')
            ax.xaxis.label.set_color('#94a3b8')
            ax.yaxis.label.set_color('#94a3b8')
            ax.tick_params(colors='#94a3b8')
            ax.title.set_color('#ffffff')

            # 根據不同演算法實作其互動模擬繪圖邏輯
            if algo_key == "linear-regression":
                col_ctrl, col_plot = st.columns([1, 2])
                with col_ctrl:
                    noise = st.slider("資料噪聲比例 (Noise)", 0.5, 8.0, 2.0, 0.5)
                    trend_type = st.selectbox("資料分佈幾何特徵", ["同方差 (Homoscedastic)", "異質變異 (Heteroscedastic - 漏斗狀)", "非線性 (Quadratic - 拋物線)"])
                
                # 產生資料
                X = np.linspace(-5, 5, 80).reshape(-1, 1)
                if trend_type == "同方差 (Homoscedastic)":
                    y = 2.5 * X.flatten() + 1.2 + np.random.normal(0, noise, 80)
                elif trend_type == "異質變異 (Heteroscedastic - 漏斗狀)":
                    # 隨著 X 的值變大，噪聲也變大
                    std_dev = noise * (X.flatten() + 6) / 5
                    y = 2.5 * X.flatten() + 1.2 + np.random.normal(0, std_dev, 80)
                else:  # 非線性
                    y = 0.6 * (X.flatten() ** 2) + 2.5 * X.flatten() + 1.2 + np.random.normal(0, noise, 80)
                
                # 擬合模型
                lr = LinearRegression()
                lr.fit(X, y)
                y_pred = lr.predict(X)
                residuals = y - y_pred
                
                # 畫出 2 個子圖 (擬合線 + 殘差圖)
                fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
                for a_temp in [ax1, ax2]:
                    a_temp.set_facecolor('#0f172a')
                    a_temp.spines['bottom'].set_color('#475569')
                    a_temp.spines['top'].set_color('#475569')
                    a_temp.spines['left'].set_color('#475569')
                    a_temp.spines['right'].set_color('#475569')
                    a_temp.tick_params(colors='#94a3b8')
                    a_temp.xaxis.label.set_color('#94a3b8')
                    a_temp.yaxis.label.set_color('#94a3b8')
                    a_temp.title.set_color('#ffffff')
                fig.patch.set_facecolor('#090b11')
                
                # 左圖: 線性擬合
                ax1.scatter(X, y, color='#4f46e5', alpha=0.7, edgecolors='none', label="資料點")
                ax1.plot(X, y_pred, color='#10b981', linewidth=2, label="OLS 擬合線")
                ax1.set_xlabel("特徵 X")
                ax1.set_ylabel("目標值 y")
                ax1.set_title("資料線性擬合關係線")
                ax1.legend(facecolor='#1e293b', edgecolor='none', labelcolor='white')
                
                # 右圖: 殘差分佈
                ax2.scatter(y_pred, residuals, color='#a855f7', alpha=0.7, edgecolors='none', label="殘差點")
                ax2.axhline(0, color='#ef4444', linestyle='--', linewidth=1.5)
                ax2.set_xlabel("預測值 ŷ")
                ax2.set_ylabel("殘差 (y - ŷ)")
                ax2.set_title("殘差診斷圖")
                ax2.legend(facecolor='#1e293b', edgecolor='none', labelcolor='white')
                st.pyplot(fig)

            elif algo_key == "logistic-regression":
                col_ctrl, col_plot = st.columns([1, 2])
                with col_ctrl:
                    class_sep = st.slider("類別可分度 (Separation)", 0.2, 3.0, 1.2, 0.1)
                    threshold = st.slider("決策機率閾值 (Threshold)", 0.05, 0.95, 0.5, 0.05)
                
                # 產生二分類資料
                X, y = make_classification(n_samples=150, n_features=2, n_informative=2, n_redundant=0, 
                                           class_sep=class_sep, random_state=42)
                lr = LogisticRegression()
                lr.fit(X, y)
                y_probs = lr.predict_proba(X)[:, 1]
                fpr, tpr, ths = roc_curve(y, y_probs)
                roc_auc = auc(fpr, tpr)
                
                # 計算在當前閾值下的 FPR 與 TPR
                y_pred = (y_probs >= threshold).astype(int)
                tp = np.sum((y == 1) & (y_pred == 1))
                fp = np.sum((y == 0) & (y_pred == 1))
                tn = np.sum((y == 0) & (y_pred == 0))
                fn = np.sum((y == 1) & (y_pred == 0))
                current_tpr = tp / (tp + fn) if (tp + fn) > 0 else 0
                current_fpr = fp / (fp + tn) if (fp + tn) > 0 else 0
                
                # 畫 ROC 曲線
                ax.plot(fpr, tpr, color='#10b981', linewidth=2.5, label=f"ROC (AUC = {roc_auc:.3f})")
                ax.plot([0, 1], [0, 1], color='#64748b', linestyle='--', label="隨機猜測 (0.5)")
                ax.scatter(current_fpr, current_tpr, color='#ef4444', s=100, zorder=5, 
                           label=f"當前閾值 {threshold:.2f} (FPR={current_fpr:.2f}, TPR={current_tpr:.2f})")
                ax.set_xlabel("偽陽性率 False Positive Rate (FPR)")
                ax.set_ylabel("真陽性率 True Positive Rate (TPR)")
                ax.set_title("ROC 曲線與選定閾值對應位置")
                ax.legend(facecolor='#1e293b', edgecolor='none', labelcolor='white')
                st.pyplot(fig)

            elif algo_key == "decision-tree":
                col_ctrl, col_plot = st.columns([1, 2])
                with col_ctrl:
                    max_depth = st.slider("樹的最大深度 (max_depth)", 1, 8, 3, 1)
                    criterion = st.selectbox("評估分裂指標 (criterion)", ["gini", "entropy"])
                
                X, y = make_moons(n_samples=150, noise=0.3, random_state=42)
                clf = DecisionTreeClassifier(max_depth=max_depth, criterion=criterion, random_state=42)
                clf.fit(X, y)
                
                # 畫出決策邊界
                x_min, x_max = X[:, 0].min() - 0.5, X[:, 0].max() + 0.5
                y_min, y_max = X[:, 1].min() - 0.5, X[:, 1].max() + 0.5
                xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.02), np.arange(y_min, y_max, 0.02))
                Z = clf.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
                
                ax.contourf(xx, yy, Z, alpha=0.3, cmap=plt.cm.coolwarm)
                scatter = ax.scatter(X[:, 0], X[:, 1], c=y, cmap=plt.cm.coolwarm, edgecolors='black', alpha=0.8)
                ax.set_xlabel("特徵 X1")
                ax.set_ylabel("特徵 X2")
                ax.set_title(f"決策樹二維空間劃分邊界 (深度={max_depth})")
                st.pyplot(fig)

            elif algo_key == "random-forest":
                col_ctrl, col_plot = st.columns([1, 2])
                with col_ctrl:
                    n_estimators = st.slider("森林中決策樹數量 (n_estimators)", 5, 150, 50, 5)
                    n_features_sel = st.slider("隨機特徵採樣個數 (max_features)", 1, 5, 2, 1)
                
                X, y = make_classification(n_samples=200, n_features=5, n_informative=3, n_redundant=0, random_state=42)
                rf = RandomForestClassifier(n_estimators=n_estimators, max_features=n_features_sel, random_state=42)
                rf.fit(X, y)
                
                importances = rf.feature_importances_
                indices = np.argsort(importances)
                features = [f"特徵 {i+1}" for i in range(5)]
                
                ax.barh(range(5), importances[indices], color='#3b82f6', align='center', height=0.6)
                ax.set_yticks(range(5))
                ax.set_yticklabels([features[i] for i in indices])
                ax.set_xlabel("基尼重要性 (Gini Importance)")
                ax.set_title(f"隨機森林特徵重要性分析 (決策樹總數={n_estimators})")
                st.pyplot(fig)

            elif algo_key == "support-vector-machine":
                col_ctrl, col_plot = st.columns([1, 2])
                with col_ctrl:
                    kernel = st.selectbox("核函數種類 (kernel)", ["linear", "rbf"])
                    C_val = st.slider("懲罰參數 C (軟間隔寬度)", 0.01, 10.0, 1.0, 0.1)
                    gamma_val = st.slider("RBF 核函數帶寬 gamma", 0.01, 5.0, 1.0, 0.1) if kernel == "rbf" else "scale"
                
                X, y = make_moons(n_samples=150, noise=0.25, random_state=42)
                svm = SVC(kernel=kernel, C=C_val, gamma=gamma_val, random_state=42)
                svm.fit(X, y)
                
                x_min, x_max = X[:, 0].min() - 0.5, X[:, 0].max() + 0.5
                y_min, y_max = X[:, 1].min() - 0.5, X[:, 1].max() + 0.5
                xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.02), np.arange(y_min, y_max, 0.02))
                Z = svm.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
                
                ax.contourf(xx, yy, Z, alpha=0.3, cmap=plt.cm.coolwarm)
                ax.scatter(X[:, 0], X[:, 1], c=y, cmap=plt.cm.coolwarm, edgecolors='black', alpha=0.8)
                # 標記支援向量
                ax.scatter(svm.support_vectors_[:, 0], svm.support_vectors_[:, 1], s=120,
                           facecolors='none', edgecolors='#e11d48', linewidths=1.5, label='支援向量')
                ax.set_xlabel("特徵 X1")
                ax.set_ylabel("特徵 X2")
                ax.set_title(f"SVM 決策邊界與支援向量 (核函數={kernel}, C={C_val})")
                ax.legend(facecolor='#1e293b', edgecolor='none', labelcolor='white')
                st.pyplot(fig)

            elif algo_key == "k-nearest-neighbors":
                col_ctrl, col_plot = st.columns([1, 2])
                with col_ctrl:
                    k_val = st.slider("鄰居個數 K (n_neighbors)", 1, 29, 5, 2)
                    metric = st.selectbox("距離度量公式 (metric)", ["euclidean", "manhattan"])
                
                X, y = make_classification(n_samples=120, n_features=2, n_informative=2, n_redundant=0, 
                                           class_sep=0.8, random_state=42)
                
                # 左圖: KNN 空間劃分
                # 右圖: K 值錯誤率曲線
                fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
                for a_temp in [ax1, ax2]:
                    a_temp.set_facecolor('#0f172a')
                    a_temp.spines['bottom'].set_color('#475569')
                    a_temp.spines['top'].set_color('#475569')
                    a_temp.spines['left'].set_color('#475569')
                    a_temp.spines['right'].set_color('#475569')
                    a_temp.tick_params(colors='#94a3b8')
                    a_temp.xaxis.label.set_color('#94a3b8')
                    a_temp.yaxis.label.set_color('#94a3b8')
                    a_temp.title.set_color('#ffffff')
                fig.patch.set_facecolor('#090b11')
                
                # 訓練並畫左圖
                knn = KNeighborsClassifier(n_neighbors=k_val, metric=metric)
                knn.fit(X, y)
                x_min, x_max = X[:, 0].min() - 0.5, X[:, 0].max() + 0.5
                y_min, y_max = X[:, 1].min() - 0.5, X[:, 1].max() + 0.5
                xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.05), np.arange(y_min, y_max, 0.05))
                Z = knn.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
                
                ax1.contourf(xx, yy, Z, alpha=0.3, cmap=plt.cm.coolwarm)
                ax1.scatter(X[:, 0], X[:, 1], c=y, cmap=plt.cm.coolwarm, edgecolors='black', alpha=0.8)
                ax1.set_xlabel("特徵 X1")
                ax1.set_ylabel("特徵 X2")
                ax1.set_title(f"KNN 二維邊界 (K={k_val})")
                
                # 測試錯誤率曲線
                k_list = range(1, 31, 2)
                err_rates = []
                for kv in k_list:
                    k_temp = KNeighborsClassifier(n_neighbors=kv, metric=metric)
                    k_temp.fit(X, y)
                    # 本地自我評估錯誤率
                    err_rates.append(1.0 - accuracy_score(y, k_temp.predict(X)))
                
                ax2.plot(k_list, err_rates, color='#3b82f6', marker='o', linewidth=2)
                ax2.scatter(k_val, 1.0 - accuracy_score(y, knn.predict(X)), color='#ef4444', s=120, zorder=5, label='目前所選 K')
                ax2.set_xlabel("K 鄰居個數")
                ax2.set_ylabel("訓練錯誤率")
                ax2.set_title("K 值與錯誤率變化曲線")
                ax2.legend(facecolor='#1e293b', edgecolor='none', labelcolor='white')
                st.pyplot(fig)

            elif algo_key == "k-means-clustering":
                col_ctrl, col_plot = st.columns([1, 2])
                with col_ctrl:
                    k_clusters = st.slider("分群數量 K (n_clusters)", 1, 8, 3, 1)
                    dataset_shape = st.selectbox("分群資料幾何分佈", ["球狀 (Blobs)", "月牙狀 (Moons)", "同心圓 (Circles)"])
                
                if dataset_shape == "球狀 (Blobs)":
                    X, _ = make_blobs(n_samples=180, centers=4, cluster_std=0.8, random_state=42)
                elif dataset_shape == "月牙狀 (Moons)":
                    X, _ = make_moons(n_samples=180, noise=0.1, random_state=42)
                else:
                    from sklearn.datasets import make_circles
                    X, _ = make_circles(n_samples=180, factor=0.5, noise=0.08, random_state=42)
                
                # 畫左圖: 分群結果; 右圖: 肘部法曲線
                fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
                for a_temp in [ax1, ax2]:
                    a_temp.set_facecolor('#0f172a')
                    a_temp.spines['bottom'].set_color('#475569')
                    a_temp.spines['top'].set_color('#475569')
                    a_temp.spines['left'].set_color('#475569')
                    a_temp.spines['right'].set_color('#475569')
                    a_temp.tick_params(colors='#94a3b8')
                    a_temp.xaxis.label.set_color('#94a3b8')
                    a_temp.yaxis.label.set_color('#94a3b8')
                    a_temp.title.set_color('#ffffff')
                fig.patch.set_facecolor('#090b11')
                
                kmeans = KMeans(n_clusters=k_clusters, init='k-means++', random_state=42, n_init=10)
                y_kmeans = kmeans.fit_predict(X)
                
                ax1.scatter(X[:, 0], X[:, 1], c=y_kmeans, s=30, cmap='rainbow', alpha=0.7)
                if k_clusters > 1:
                    ax1.scatter(kmeans.cluster_centers_[:, 0], kmeans.cluster_centers_[:, 1], s=120,
                                c='black', marker='X', edgecolors='white', linewidths=1.5, label='分群質心')
                ax1.set_xlabel("特徵 X1")
                ax1.set_ylabel("特徵 X2")
                ax1.set_title(f"K-Means 分群結果 (K={k_clusters})")
                ax1.legend(facecolor='#1e293b', edgecolor='none', labelcolor='white')
                
                # WCSS 肘部曲線
                k_list = range(1, 9)
                wcss = []
                for kv in k_list:
                    km_temp = KMeans(n_clusters=kv, init='k-means++', random_state=42, n_init=5)
                    km_temp.fit(X)
                    wcss.append(km_temp.inertia_)
                    
                ax2.plot(k_list, wcss, color='#f97316', marker='o', linewidth=2)
                ax2.scatter(k_clusters, kmeans.inertia_, color='#ef4444', s=120, zorder=5, label='目前所選 K')
                ax2.set_xlabel("群集數量 K")
                ax2.set_ylabel("WCSS (群集內誤差平方和)")
                ax2.set_title("肘部法則檢驗曲線")
                ax2.legend(facecolor='#1e293b', edgecolor='none', labelcolor='white')
                st.pyplot(fig)

            elif algo_key == "naive-bayes":
                col_ctrl, col_plot = st.columns([1, 2])
                with col_ctrl:
                    imbalance_ratio = st.slider("正類別比例 (Imbalance Ratio)", 0.02, 0.5, 0.1, 0.02)
                
                # 產生不平衡分類資料
                n_samples = 300
                n_pos = int(n_samples * imbalance_ratio)
                n_neg = n_samples - n_pos
                
                X_neg, y_neg = make_blobs(n_samples=n_neg, centers=[[0, 0]], cluster_std=1.0, random_state=42)
                X_pos, y_pos = make_blobs(n_samples=n_pos, centers=[[1.8, 1.8]], cluster_std=1.2, random_state=42)
                
                X = np.vstack([X_neg, X_pos])
                y = np.hstack([np.zeros(n_neg), np.ones(n_pos)])
                
                nb = GaussianNB()
                nb.fit(X, y)
                y_probs = nb.predict_proba(X)[:, 1]
                
                # PR 曲線與 ROC 曲線對比
                precision, recall, _ = precision_recall_curve(y, y_probs)
                ap = average_precision_score(y, y_probs)
                fpr, tpr, _ = roc_curve(y, y_probs)
                roc_auc = auc(fpr, tpr)
                
                fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
                for a_temp in [ax1, ax2]:
                    a_temp.set_facecolor('#0f172a')
                    a_temp.spines['bottom'].set_color('#475569')
                    a_temp.spines['top'].set_color('#475569')
                    a_temp.spines['left'].set_color('#475569')
                    a_temp.spines['right'].set_color('#475569')
                    a_temp.tick_params(colors='#94a3b8')
                    a_temp.xaxis.label.set_color('#94a3b8')
                    a_temp.yaxis.label.set_color('#94a3b8')
                    a_temp.title.set_color('#ffffff')
                fig.patch.set_facecolor('#090b11')
                
                # PR 曲線
                ax1.plot(recall, precision, color='#10b981', linewidth=2.5, label=f"PR (AP = {ap:.3f})")
                ax1.axhline(imbalance_ratio, color='#64748b', linestyle='--', label=f"隨機猜測基線 ({imbalance_ratio*100:.0f}%)")
                ax1.set_xlabel("召回率 Recall")
                ax1.set_ylabel("精確度 Precision")
                ax1.set_title("PR 曲線 (關注正類)")
                ax1.legend(facecolor='#1e293b', edgecolor='none', labelcolor='white')
                
                # ROC 曲線
                ax2.plot(fpr, tpr, color='#3b82f6', linewidth=2.5, label=f"ROC (AUC = {roc_auc:.3f})")
                ax2.plot([0, 1], [0, 1], color='#64748b', linestyle='--')
                ax2.set_xlabel("偽陽性率 FPR")
                ax2.set_ylabel("真陽性率 TPR")
                ax2.set_title("ROC 曲線 (不平衡下易顯樂觀)")
                ax2.legend(facecolor='#1e293b', edgecolor='none', labelcolor='white')
                st.pyplot(fig)

            elif algo_key == "deep-learning":
                col_ctrl, col_plot = st.columns([1, 2])
                with col_ctrl:
                    learning_rate = st.slider("學習率 (learning_rate)", 0.01, 0.4, 0.1, 0.02)
                    max_iters = st.slider("極大基學習器個數 (n_estimators)", 10, 150, 80, 10)
                
                X, y = make_classification(n_samples=180, n_features=4, n_informative=3, n_redundant=0, random_state=42)
                gb = GradientBoostingClassifier(learning_rate=learning_rate, n_estimators=max_iters, random_state=42)
                gb.fit(X, y)
                
                # 損失下降
                # GradientBoostingClassifier 在 fit 期間的訓練損失保存在 train_score_ 中
                train_loss = gb.train_score_
                
                ax.plot(range(1, len(train_loss) + 1), train_loss, color='#22c55e', linewidth=2, label="訓練集損失 (Deviance)")
                ax.set_xlabel("迭代決策樹個數")
                ax.set_ylabel("交叉熵損失 (Loss)")
                ax.set_title("提升迭代 (Boosting) 訓練損失收斂圖")
                ax.legend(facecolor='#1e293b', edgecolor='none', labelcolor='white')
                st.pyplot(fig)

            elif algo_key == "principal-component-analysis":  # 即手冊中的 Neural Network 學習曲線
                col_ctrl, col_plot = st.columns([1, 2])
                with col_ctrl:
                    nodes_count = st.selectbox("隱藏層結構 (nodes)", ["(10,)", "(50,)", "(30, 15)"])
                    max_iter_val = st.slider("神經網路疊代上限 (max_iter)", 50, 300, 150, 50)
                
                X, y = make_classification(n_samples=150, n_features=6, n_informative=4, n_redundant=0, random_state=42)
                hidden_layers = eval(nodes_count)
                
                mlp = MLPClassifier(hidden_layer_sizes=hidden_layers, max_iter=max_iter_val, random_state=42)
                
                # 計算學習曲線
                train_sizes, train_scores, test_scores = learning_curve(
                    mlp, X, y, cv=3, train_sizes=np.linspace(0.2, 1.0, 5), random_state=42
                )
                
                train_mean = np.mean(train_scores, axis=1)
                test_mean = np.mean(test_scores, axis=1)
                
                ax.plot(train_sizes, train_mean, color='#3b82f6', marker='o', label="訓練集準確率")
                ax.plot(train_sizes, test_mean, color='#f59e0b', marker='s', label="交叉驗證集準確率")
                ax.set_xlabel("訓練集樣本數量 (Training Samples)")
                ax.set_ylabel("精確度 (Accuracy)")
                ax.set_title("神經網路學習收斂與泛化差異曲線")
                ax.legend(facecolor='#1e293b', edgecolor='none', labelcolor='white')
                st.pyplot(fig)

        # ---------------------------------------------------------
        # Tab 3: 學習筆記與進度
        # ---------------------------------------------------------
        with tab3:
            st.subheader("📝 本章隨堂筆記紀錄")
            
            # 使用 Text Area 允許用戶輸入筆記，預設為資料庫讀取的內容
            user_note_input = st.text_area(
                "在下方輸入您對此章節的理解、重點摘要或待辦思考項目（將自動存入 SQLite 資料庫）：", 
                value=db_note, 
                height=150
            )
            
            st.subheader("✅ 章節學習進度追蹤")
            study_completed = st.checkbox("📖 理論研究已完成", value=bool(db_prog['study_completed']))
            playground_completed = st.checkbox("🎛️ 模擬器調整與圖表理解已完成", value=bool(db_prog['playground_completed']))
            quiz_completed = db_prog['quiz_completed'] # 測驗進度由測驗頁面提交觸發
            
            if quiz_completed:
                st.success("📝 本章測驗已驗證通過！")
            else:
                st.info("💡 您可以至側邊欄的「📝 隨堂測驗練習」完成答題以解鎖本章測驗進度。")
                
            # 提供儲存按鈕
            if st.button("💾 儲存筆記與學習進度", use_container_width=True):
                # 儲存筆記與進度至 SQLite
                save_note(algo_key, user_note_input)
                save_progress(algo_key, int(study_completed), int(quiz_completed), int(playground_completed))
                st.success("🎉 筆記與學習進度已成功同步寫入 SQLite 資料庫！")
                st.rerun()
