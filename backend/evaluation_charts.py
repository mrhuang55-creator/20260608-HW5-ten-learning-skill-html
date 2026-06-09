# ─────────────────────────────────────────────────────────────────────────────
# 機器學習十種經典圖表評估手冊 — 結構化資料
# 原始來源：機器學習十種經典圖表評估手冊-gemini.pdf / 10 machine learing.html
# ─────────────────────────────────────────────────────────────────────────────

EVALUATION_CHARTS = {
    "linear-regression": {
        "chapter": 1,
        "chart_title": "殘差分析圖 (Residuals Plot)",
        "chart_type": "散點圖 — 預測值 (X軸) vs 殘差 (Y軸)",
        "summary": (
            "線性迴歸使用最小二乘法（OLS）尋找最佳擬合線。殘差圖是最關鍵的診斷工具，"
            "用來檢驗模型是否符合同方差假設（Homoscedasticity）。評估迴歸模型好壞，不能僅看 R²。"
        ),
        "math_principle": [
            "優化目標（殘差平方和）：L(w) = ½ ‖y − Xw‖² = ½ (yᵀy − 2wᵀXᵀy + wᵀXᵀXw)",
            "解析解（正規方程式）：w* = (XᵀX)⁻¹ Xᵀy",
            "殘差定義：eᵢ = yᵢ − ŷᵢ，理想情況下殘差應隨機且均勻分布在 Y=0 兩側",
        ],
        "chart_interpretation": [
            "✅ 良好：殘差均勻隨機散布在 Y=0 水平線兩側，無明顯形狀",
            "⚠️ 向右開口漏斗狀：代表異質變異數（Heteroscedasticity），需對 y 做對數轉換",
            "⚠️ 拋物線形：殘差有系統性趨勢，說明遺漏了高階非線性特徵，需加入多項式項",
            "⚠️ 殘差絕對值有週期性：可能有時間序列相關性，需使用時序模型",
        ],
        "python_code": """import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

# 建立模型並擬合
model = LinearRegression()
model.fit(X_train, y_train)

# 計算預測值與殘差
y_pred = model.predict(X_test)
residuals = y_test - y_pred

# 繪製殘差圖
plt.scatter(y_pred, residuals, alpha=0.5, color='indigo')
plt.axhline(y=0, color='red', linestyle='--')
plt.xlabel('Predicted Values')
plt.ylabel('Residuals')
plt.title('Residuals Plot')
plt.show()""",
        "exercise": (
            "如果殘差圖呈現明顯的「向右開口漏斗狀」，這在統計學上稱為什麼？"
            "應該使用何種數學轉換（如對數轉換）來修正？"
        ),
    },

    "logistic-regression": {
        "chapter": 2,
        "chart_title": "ROC 曲線 & AUC (ROC Curve & Area Under Curve)",
        "chart_type": "線圖 — 偽陽性率 FPR (X軸) vs 真陽性率 TPR (Y軸)",
        "summary": (
            "邏輯斯迴歸透過 Sigmoid 函數將線性分數轉換為機率。ROC 曲線藉由在 [0,1] 區間平移分類閾值，"
            "記錄對應的 FPR 與 TPR，AUC 越接近 1.0 代表分類能力越強。"
        ),
        "math_principle": [
            "Sigmoid 函數：p = σ(wᵀx) = 1 / (1 + e^(−wᵀx))",
            "損失函數（二元交叉熵）：J(w) = −(1/N) Σ [yᵢ ln(pᵢ) + (1−yᵢ) ln(1−pᵢ)]",
            "TPR（真陽性率）= TP / (TP + FN)，FPR（偽陽性率）= FP / (FP + TN)",
            "AUC（ROC 曲線下面積）：隨機猜測 AUC = 0.5，完美模型 AUC = 1.0",
        ],
        "chart_interpretation": [
            "✅ 曲線越靠近左上角（AUC 越大）代表模型越優秀",
            "⚠️ 對角線（AUC ≈ 0.5）表示模型與隨機猜測相當，毫無分類能力",
            "⚠️ 不平衡數據集（正類佔比 <5%）時 ROC 曲線可能過度樂觀，應改用 PR 曲線",
            "✅ 實務建議：AUC > 0.7 為可接受，> 0.85 為優秀，> 0.95 為極佳",
        ],
        "python_code": """from sklearn.metrics import roc_curve, auc

# 獲取預測正類之機率值
y_scores = model.predict_proba(X_test)[:, 1]
fpr, tpr, thresholds = roc_curve(y_test, y_scores)
roc_auc = auc(fpr, tpr)

# 繪圖展示 (AUC 值越大越佳)
import matplotlib.pyplot as plt
plt.plot(fpr, tpr, label=f'ROC curve (AUC = {roc_auc:.4f})')
plt.plot([0, 1], [0, 1], 'k--', label='Random guess')
plt.xlabel('False Positive Rate (FPR)')
plt.ylabel('True Positive Rate (TPR)')
plt.title('ROC Curve')
plt.legend()
plt.show()
print(f"ROC Area Under Curve (AUC): {roc_auc:.4f}")""",
        "exercise": (
            "為什麼在不平衡數據集中（例如違約案件僅佔 0.1%），ROC 曲線有時無法客觀展現分類器"
            "對正類的預測表現？這時應該改用什麼曲線？"
        ),
    },

    "decision-tree": {
        "chapter": 3,
        "chart_title": "空間劃分邊界圖 (Decision Boundary)",
        "chart_type": "二維色彩填充圖 — 特徵1 (X軸) vs 特徵2 (Y軸)",
        "summary": (
            "決策樹透過遞歸分割特徵空間，使每個子集的純度最高。其決策邊界在二維平面上"
            "必定是正交階梯狀的直線，與曲線或超平面劃分有本質的幾何差異。"
        ),
        "math_principle": [
            "資訊熵：Entropy(D) = −Σ pₖ log₂(pₖ)",
            "基尼不純度：Gini(D) = 1 − Σ pₖ²",
            "分裂條件：每次選擇使資訊增益（Information Gain）最大的特徵與閾值",
            "空間劃分本質：每次分裂等同於對單一維度特徵做 Xⱼ > θ 的二元切割",
        ],
        "chart_interpretation": [
            "✅ 邊界為正交階梯狀直線：這是決策樹的幾何特徵，代表模型正常運作",
            "⚠️ 邊界極度破碎（鋸齒狀密集）：樹深度過大，發生嚴重過擬合，需設定 max_depth",
            "⚠️ 邊界過於簡單粗糙：樹太淺，模型欠擬合，需增加 max_depth 或特徵",
            "✅ 觀察兩類別間的誤分類點：可識別模型難以區分的特徵空間區域",
        ],
        "python_code": """from sklearn.tree import DecisionTreeClassifier
import numpy as np

# 限制樹的最大深度，防止過度擬合與邊界破碎
clf = DecisionTreeClassifier(max_depth=3, random_state=42)
clf.fit(X_train, y_train)

# 使用 meshgrid 計算密集的空間預測矩陣，用以繪製非線性邊界
x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.01),
                     np.arange(y_min, y_max, 0.01))
Z = clf.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)

import matplotlib.pyplot as plt
plt.contourf(xx, yy, Z, alpha=0.4)
plt.scatter(X[:, 0], X[:, 1], c=y, alpha=0.8)
plt.title('Decision Tree Boundary (max_depth=3)')
plt.show()""",
        "exercise": (
            "若訓練集數據在空間中呈同心圓分佈（環形），單個決策樹在不進行任何座標軸轉換的情況下，"
            "其預測邊界會呈現何種狀態？為什麼其泛化能力會極差？"
        ),
    },

    "random-forest": {
        "chapter": 4,
        "chart_title": "特徵重要性圖 (Feature Importance — Gini MDI)",
        "chart_type": "水平條形圖 — 特徵名稱 (Y軸) vs 重要度數值 (X軸)",
        "summary": (
            "隨機森林採用 Bootstrap Bagging 與隨機特徵採樣，集成多棵決策樹。"
            "特徵重要性（MDI）量化每個特徵在所有樹的分裂中平均貢獻的基尼不純度降低量。"
        ),
        "math_principle": [
            "Importance(Xⱼ) = (1/|M|) Σ_{T∈M} Σ_{s∈T, v(s)=Xⱼ} p(s) × ΔGini(s)",
            "p(s)：通過節點 s 的樣本比例，ΔGini(s)：節點 s 分裂帶來的基尼不純度下降",
            "所有特徵的重要度加總必定等於 1.0",
            "Bootstrap 採樣：每棵樹使用約 63.2% 的訓練樣本（有放回抽樣），其餘作為 OOB 驗證",
        ],
        "chart_interpretation": [
            "✅ 特徵重要度呈冪律分布（少數特徵佔大部分重要度）：模型找到了關鍵驅動因素",
            "⚠️ 所有特徵重要度相近：可能輸入特徵對目標預測能力都很弱，或特徵高度相關",
            "⚠️ 高基數特徵（如 ID 欄位）重要度異常高：MDI 對高基數特徵有偏，建議改用排列重要性",
            "✅ 實務建議：可將重要度低於 0.01 的特徵刪除以降低過擬合風險",
        ],
        "python_code": """from sklearn.ensemble import RandomForestClassifier
import matplotlib.pyplot as plt
import numpy as np

# 初始化森林
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# 獲取重要度矩陣（加總必為 1.0）
importances = rf.feature_importances_
sorted_idx = np.argsort(importances)[::-1]

# 繪製特徵重要性條形圖
plt.figure(figsize=(10, 6))
plt.barh(range(len(importances)),
         importances[sorted_idx],
         color='steelblue')
plt.yticks(range(len(importances)),
           [feature_names[i] for i in sorted_idx])
plt.xlabel('Gini Importance')
plt.title('Random Forest Feature Importance')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.show()""",
        "exercise": (
            "基於基尼不純度下降的特徵重要性，對於「高基數（Cardinality）特徵」"
            "（如用戶 ID、身份證號等取值種類極多的變量）會產生什麼偏見？我們該如何解決？"
        ),
    },

    "support-vector-machine": {
        "chapter": 5,
        "chart_title": "最大間隔超平面圖 (SVM Maximum Margin)",
        "chart_type": "散點圖 + 超平面線 + 間隔帶 — 特徵空間二維可視化",
        "summary": (
            "SVM 在特徵空間中尋找幾何間隔最大的超平面。支援向量（Support Vectors）是決定邊界的關鍵樣本點。"
            "核技巧（Kernel Trick）可在不顯式計算高維映射的情況下解決非線性問題。"
        ),
        "math_principle": [
            "線性可分目標：在約束條件 yᵢ(wᵀxᵢ + b) ≥ 1 下，最小化 ½‖w‖²",
            "幾何間隔 Margin = 2 / ‖w‖，最大化 Margin 等價於最小化 ‖w‖²",
            "RBF 核函數：K(xᵢ, xⱼ) = exp(−γ‖xᵢ − xⱼ‖²)",
            "軟間隔 C 參數：C 越大懲罰越重，間隔越窄（低偏差高方差）；C 越小間隔越寬（高偏差低方差）",
        ],
        "chart_interpretation": [
            "✅ 超平面居中且間隔帶對稱：SVM 找到了最優的最大間隔分割",
            "⚠️ 支援向量數量過多（超過 50% 訓練樣本）：C 值設定過小或數據線性不可分",
            "⚠️ 訓練誤差很低但測試誤差高：可能 C 值過大導致過擬合，需調小 C 或增大 gamma",
            "✅ 核函數選擇：線性核適合高維稀疏數據（文本），RBF 核適合低維稠密數據",
        ],
        "python_code": """from sklearn.svm import SVC

# 使用高斯核函數 RBF
svm_clf = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True)
svm_clf.fit(X_train, y_train)

# 獲取哪些樣本點是決定模型邊界的關鍵支援向量
support_vectors = svm_clf.support_vectors_
print(f"支援向量數量：{len(support_vectors)}")
print(f"佔訓練集比例：{len(support_vectors)/len(X_train):.1%}")

# 測試效能
from sklearn.metrics import classification_report
y_pred = svm_clf.predict(X_test)
print(classification_report(y_test, y_pred))""",
        "exercise": (
            "在 SVM 的損失函數中，正則化懲罰參數 C 越小，模型的軟間隔（Soft Margin）"
            "會越寬還是越窄？這會使模型更容易過擬合還是欠擬合？"
        ),
    },

    "k-nearest-neighbors": {
        "chapter": 6,
        "chart_title": "K 值錯誤率曲線 (KNN Bias-Variance Tradeoff)",
        "chart_type": "折線圖 — K 值 (X軸) vs 測試集錯誤率 (Y軸)",
        "summary": (
            "KNN 是惰性學習（Lazy Learning）演算法，預測完全依賴最近的 K 個鄰近樣本。"
            "K 值影響偏差-方差的權衡：K 過小易過擬合（高方差），K 過大易欠擬合（高偏差）。"
        ),
        "math_principle": [
            "歐氏距離（L2）：d(x, y) = √(Σ(xd − yd)²)",
            "曼哈頓距離（L1）：d(x, y) = Σ|xd − yd|",
            "K=1 時：決策邊界破碎，低偏差高方差（極易過擬合）",
            "K→N 時：決策由全體樣本主導，高偏差低方差（欠擬合，預測趨於全局多數類）",
        ],
        "chart_interpretation": [
            "✅ 最優 K 值在曲線最低點（測試錯誤率最小）",
            "⚠️ 曲線左半段急劇下降：K 值從 1 增大可顯著降低過擬合噪聲",
            "⚠️ 曲線右半段緩慢上升：K 過大引入太多不相關鄰居，偏差增加",
            "✅ 實務建議：K 通常選奇數（避免二分類平票），一般在 3~15 之間透過交叉驗證選取",
        ],
        "python_code": """from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score
import matplotlib.pyplot as plt

k_range = range(1, 31)
error_rates = []

for k in k_range:
    # 通常選擇奇數作為 K 值，防止二分類中出現平票情況
    knn = KNeighborsClassifier(n_neighbors=k,
                               metric='minkowski', p=2)
    knn.fit(X_train, y_train)
    y_pred = knn.predict(X_test)
    error_rates.append(1 - accuracy_score(y_test, y_pred))

plt.plot(k_range, error_rates, marker='o', color='steelblue')
plt.xlabel('K 值')
plt.ylabel('測試集錯誤率')
plt.title('KNN Bias-Variance Tradeoff Curve')
plt.show()""",
        "exercise": (
            "什麼是維度災難（Curse of Dimensionality）？"
            "在高維空間中，KNN 的歐氏距離計算為什麼會面臨失效？"
        ),
    },

    "k-means-clustering": {
        "chapter": 7,
        "chart_title": "肘部法則圖 (Elbow Method — WCSS vs K)",
        "chart_type": "折線圖 — 群集數 K (X軸) vs WCSS 群集內誤差平方和 (Y軸)",
        "summary": (
            "K-Means 以最小化群集內誤差平方和（WCSS）為優化目標。肘部法則透過觀察"
            "WCSS 曲線在不同 K 值下的下降斜率，找到邊際效應遞減的折點作為最佳 K。"
        ),
        "math_principle": [
            "WCSS = Σⱼ Σ_{xᵢ∈Cⱼ} ‖xᵢ − μⱼ‖²",
            "演算法：E步（分配每個點到最近的質心）↔ M步（更新每個群集的質心）",
            "K-Means++ 初始化：選擇初始質心時按距離加權概率採樣，避免局部極小值",
            "隨著 K 增加，WCSS 單調遞減，但超過真實群集數後邊際改善快速下降",
        ],
        "chart_interpretation": [
            "✅ 肘部（Elbow）：曲線急劇下降後趨緩的折點即為最佳 K 值",
            "⚠️ 曲線無明顯折點（平滑下降）：數據可能沒有清晰的群集結構，或選用 K-Means 不適合",
            "⚠️ WCSS 在大 K 值時仍快速下降：可能真實群集數比預設範圍更多",
            "✅ 配合 Silhouette Score 驗證：輪廓係數接近 1.0 代表群集緊湊且分離良好",
        ],
        "python_code": """from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

wcss = []
k_range = range(1, 11)

for k in k_range:
    kmeans = KMeans(n_clusters=k,
                    init='k-means++',
                    random_state=42,
                    n_init=10)
    kmeans.fit(X)
    wcss.append(kmeans.inertia_)  # inertia_ 即為 WCSS

plt.plot(k_range, wcss, marker='o', color='coral')
plt.xlabel('群集數量 K')
plt.ylabel('WCSS (群集內誤差平方和)')
plt.title('Elbow Method — 選擇最佳 K 值')
plt.xticks(k_range)
plt.show()""",
        "exercise": (
            "什麼是 K-Means++ 初始化策略？它與傳統的隨機初始化相比，"
            "如何克服陷入局部極小值（Local Minima）的問題？"
        ),
    },

    "naive-bayes": {
        "chapter": 8,
        "chart_title": "Precision-Recall 曲線 (PR Curve)",
        "chart_type": "折線圖 — 召回率 Recall (X軸) vs 精確度 Precision (Y軸)",
        "summary": (
            "單純貝氏基於條件獨立假設，計算速度極快。PR 曲線比 ROC 曲線更適合評估不平衡數據集上的分類器，"
            "聚焦於正類（少數派）的預測表現，AP（平均精準度）越高越好。"
        ),
        "math_principle": [
            "貝氏定理：P(Y|X) = P(Y) × Πd P(Xd|Y) / P(X)（條件獨立假設）",
            "Precision（精確度）= TP / (TP + FP)：預測為正類中真正準確的比例",
            "Recall（召回率）= TP / (TP + FN)：所有真實正類中被成功識別的比例",
            "F1-Score = 2 × (Precision × Recall) / (Precision + Recall)：兩者的調和平均",
        ],
        "chart_interpretation": [
            "✅ 曲線越靠近右上角（AP 越接近 1.0）代表模型越優秀",
            "⚠️ Recall 提高但 Precision 快速下降（曲線陡降）：降低閾值會帶來大量誤報",
            "⚠️ Precision 高但 Recall 低：模型非常保守，只在高確信時才預測正類",
            "✅ 根據業務需求選擇最佳閾值：詐欺偵測寧可多誤報（高 Recall）；醫療診斷需高 Precision",
        ],
        "python_code": """from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import precision_recall_curve, average_precision_score
import matplotlib.pyplot as plt

nb = GaussianNB()
nb.fit(X_train, y_train)

y_scores = nb.predict_proba(X_test)[:, 1]
precision, recall, _ = precision_recall_curve(y_test, y_scores)
ap = average_precision_score(y_test, y_scores)

plt.plot(recall, precision, label=f'PR Curve (AP = {ap:.4f})')
plt.xlabel('Recall（召回率）')
plt.ylabel('Precision（精確度）')
plt.title('Precision-Recall Curve')
plt.legend()
plt.show()""",
        "exercise": (
            "單純貝氏算法中，如果測試集中某個特徵在某類別下的出現概率為 0"
            "（例如某個詞彙未在垃圾郵件中見過），為什麼會導致聯合預測機率直接歸 0？"
            "如何引入拉普拉斯平滑（Laplace Smoothing）來解圍？"
        ),
    },

    "deep-learning": {
        "chapter": 9,
        "chart_title": "訓練收斂線 / 早停圖 (Boosting Loss Reduction Curve)",
        "chart_type": "折線圖 — 迭代次數 (X軸) vs 訓練/驗證集 Loss (Y軸)",
        "summary": (
            "梯度提升樹（XGBoost / LightGBM）採用加法模型，每棵樹擬合前一步的殘差或負梯度。"
            "收斂線圖用於觀察訓練集與驗證集 Loss 的變化趨勢，識別過擬合並決定早停點。"
        ),
        "math_principle": [
            "XGBoost 目標函數：L(t) ≈ Σᵢ [gᵢ ft(xᵢ) + ½ hᵢ ft²(xᵢ)] + γT + ½λΣⱼ wⱼ²",
            "gᵢ 為一階梯度（損失對預測值的偏導），hᵢ 為二階梯度（Hessian）",
            "γT：樹葉節點數 T 的正則化懲罰（控制模型複雜度）",
            "早停機制：若驗證集 Loss 連續 N 次迭代未下降，則停止訓練",
        ],
        "chart_interpretation": [
            "✅ 訓練集與驗證集 Loss 同步下降並趨於穩定：模型正常收斂",
            "⚠️ 驗證集 Loss 先降後升（形成 U 型）：過擬合，早停點在最低點",
            "⚠️ 兩條 Loss 曲線都高且幾乎不下降：模型欠擬合，需增加樹的深度或迭代次數",
            "⚠️ 訓練 Loss 極低但驗證 Loss 高且穩定：嚴重過擬合，需增加正則化（λ, γ, Dropout）",
        ],
        "python_code": """import xgboost as xgb
import matplotlib.pyplot as plt

model = xgb.XGBClassifier(
    n_estimators=1000,
    max_depth=6,
    learning_rate=0.1,
    eval_metric='logloss'
)

# 在驗證集上若 20 次迭代 Loss 未下降則早停
model.fit(X_train, y_train,
          eval_set=[(X_train, y_train), (X_test, y_test)],
          early_stopping_rounds=20,
          verbose=False)

# 繪製收斂曲線
results = model.evals_result()
train_loss = results['validation_0']['logloss']
val_loss = results['validation_1']['logloss']

plt.plot(train_loss, label='Training Loss')
plt.plot(val_loss, label='Validation Loss')
plt.axvline(model.best_iteration, color='r',
            linestyle='--', label='Early Stopping Point')
plt.xlabel('Boosting Iterations')
plt.ylabel('Log Loss')
plt.title('Gradient Boosting Convergence Curve')
plt.legend()
plt.show()""",
        "exercise": (
            "與隨機森林可以同時並行計算每棵樹不同，為什麼標準梯度提升算法（Boosting）"
            "在多節點計算機群上很難直接對樹的訓練進行並行加速？它是如何克服此計算障礙的？"
        ),
    },

    "principal-component-analysis": {
        "chapter": 10,
        "chart_title": "神經網路學習曲線 (Neural Network Learning Curve)",
        "chart_type": "折線圖 — 訓練樣本量 (X軸) vs 訓練/驗證準確度 (Y軸)",
        "summary": (
            "學習曲線比較訓練集與交叉驗證集的表現隨訓練樣本量增加的趨勢，"
            "是診斷模型是否過擬合（高方差）或欠擬合（高偏差）的黃金工具。"
        ),
        "math_principle": [
            "反向傳播（Backpropagation）：利用鏈鎖律（Chain Rule）從輸出層向輸入層遞歸計算梯度",
            "高偏差（欠擬合）：訓練集與驗證集表現都偏低，增加樣本無效，需增加模型複雜度",
            "高方差（過擬合）：訓練集表現高，驗證集表現低，兩曲線間有巨大 Gap",
            "理想狀態：隨樣本增加，兩曲線逐漸趨近並收斂到較高水準",
        ],
        "chart_interpretation": [
            "✅ 兩條曲線趨近且都在高水準：模型適當，泛化能力良好",
            "⚠️ 兩條曲線在低水準趨近（高偏差）：需增加模型層數、神經元數或改善特徵工程",
            "⚠️ 兩條曲線有持續的大 Gap（高方差）：需增加訓練數據、加強正則化（Dropout、L2）或減少模型複雜度",
            "✅ 若 Gap 隨樣本增加而縮小：說明更多數據確實有幫助，值得收集更多訓練樣本",
        ],
        "python_code": """from sklearn.model_selection import learning_curve
from sklearn.neural_network import MLPClassifier
import matplotlib.pyplot as plt
import numpy as np

mlp = MLPClassifier(hidden_layer_sizes=(100, 50),
                    max_iter=500, random_state=42)

# 自動獲取在不同訓練樣本長度下的準確度軌跡
train_sizes, train_scores, test_scores = learning_curve(
    mlp, X, y,
    cv=5,
    train_sizes=np.linspace(0.1, 1.0, 10),
    scoring='accuracy'
)

train_mean = np.mean(train_scores, axis=1)
test_mean = np.mean(test_scores, axis=1)

plt.plot(train_sizes, train_mean, label='Training Score', color='blue')
plt.plot(train_sizes, test_mean, label='CV Score', color='orange')
plt.fill_between(train_sizes,
                 train_mean - np.std(train_scores, axis=1),
                 train_mean + np.std(train_scores, axis=1),
                 alpha=0.1, color='blue')
plt.xlabel('Training Samples')
plt.ylabel('Accuracy')
plt.title('Learning Curve — MLP Classifier')
plt.legend()
plt.show()""",
        "exercise": (
            "如果學習曲線顯示訓練集準確率達 99% 但驗證集只有 72%，且隨著訓練樣本增加，"
            "兩條線之間的 Gap 始終維持在 27%，這代表什麼診斷結論？應該採取哪三種具體措施？"
        ),
    },
}
