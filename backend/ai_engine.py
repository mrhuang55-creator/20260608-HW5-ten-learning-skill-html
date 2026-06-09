import json
import os
import re
import math
from typing import Optional

# Path to the extracted data JSON resolved relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "extracted_data.json")

class LocalSearchEngine:
    def __init__(self):
        self.documents = []
        self.load_documents()

    def load_documents(self):
        if not os.path.exists(DATA_PATH):
            return

        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        # We will split the report into searchable text blocks (documents)
        # 1. Introduction
        self.documents.append({
            "source": "報告導讀與機器學習基本觀念",
            "content": data.get("introduction", "")
        })
        
        # 2. Framework
        self.documents.append({
            "source": "機器學習任務與模型選擇架構",
            "content": data.get("framework", "")
        })

        # 3. Algorithms
        for algo in data.get("algorithms", []):
            algo_name = f"{algo['id']} {algo['name']} ({algo['englishName']})"
            
            # Table summary
            table_summary = "\n".join([f"{k}: {v}" for k, v in algo.get("table", {}).items()])
            self.documents.append({
                "source": f"{algo_name} - 概要特性",
                "content": f"這是 {algo_name} 的概要與前處理重點：\n{table_summary}"
            })

            # Subsections
            details = algo.get("details", {})
            section_mapping = {
                "positioning": "學習定位",
                "concepts": "核心概念",
                "dataRequirements": "資料需求",
                "trainingProcess": "訓練流程",
                "examples": "實務例子",
                "advantages": "優點與特點",
                "limitations": "限制與缺點",
                "evaluation": "評估方式",
                "explainability": "可解釋性",
                "tuning": "調參重點",
                "deployment": "導入建議",
                "misconceptions": "常見誤區",
                "extension": "延伸理解",
                "projectApplication": "專案應用",
                "communication": "溝通方式",
                "qualityControl": "品質控管"
            }
            
            for key, name in section_mapping.items():
                content = details.get(key, "")
                if content:
                    self.documents.append({
                        "source": f"{algo_name} - {name}",
                        "content": content
                    })

            # Supplements
            for supp in algo.get("supplements", []):
                self.documents.append({
                    "source": f"{algo_name} - 研讀補充：{supp['title']}",
                    "content": supp.get("content", "")
                })

        # 4. Comparison
        self.documents.append({
            "source": "演算法比較與選用建議",
            "content": data.get("comparison", "")
        })

        # 5. Cases
        self.documents.append({
            "source": "整合案例：從資料到決策支援",
            "content": data.get("cases", "")
        })

        # 6. Learning Path
        self.documents.append({
            "source": "學習路徑與實作建議",
            "content": data.get("learning_path", "")
        })

        # 7. Conclusion
        self.documents.append({
            "source": "結論",
            "content": data.get("conclusion", "")
        })

        # 8. Glossary
        self.documents.append({
            "source": "附錄一：術語表",
            "content": data.get("glossary", "")
        })

        # 9. Checklist
        self.documents.append({
            "source": "附錄二：專案檢核清單",
            "content": data.get("checklist", "")
        })

        # 10. Evaluation Charts (from evaluation_charts.py)
        try:
            from evaluation_charts import EVALUATION_CHARTS
            chart_name_map = {
                "linear-regression": "線性迴歸",
                "logistic-regression": "邏輯斯迴歸",
                "decision-tree": "決策樹",
                "random-forest": "隨機森林",
                "support-vector-machine": "支援向量機",
                "k-nearest-neighbors": "K-最近鄰",
                "k-means-clustering": "K-Means",
                "naive-bayes": "單純貝氏",
                "deep-learning": "梯度提升樹",
                "principal-component-analysis": "神經網路",
            }
            for algo_id, chart in EVALUATION_CHARTS.items():
                cn = chart_name_map.get(algo_id, algo_id)
                self.documents.append({
                    "source": f"{cn} - 評估圖表：{chart['chart_title']}",
                    "content": (
                        f"圖表類型：{chart['chart_type']}\n"
                        f"說明：{chart['summary']}\n"
                        f"數學原理：{'；'.join(chart['math_principle'])}\n"
                        f"判讀指南：{'；'.join(chart['chart_interpretation'])}\n"
                        f"Python 範例：\n{chart['python_code']}\n"
                        f"思考習題：{chart['exercise']}"
                    )
                })
        except ImportError:
            pass

    def search(self, query: str, top_n: int = 3):
        if not self.documents:
            self.load_documents()

        # Clean query: extract domain keywords and English words
        query_lower = query.lower()
        domain_keywords = [
            "線性迴歸", "邏輯斯迴歸", "決策樹", "隨機森林", "支援向量機", "svm",
            "k近鄰", "knn", "樸素貝氏", "k-means", "分群", "梯度提升", "xgboost",
            "lightgbm", "神經網路", "偏差", "變異", "過度配適", "欠配適", "正則化",
            "資料洩漏", "交叉驗證", "混淆矩陣", "召回率", "精確率", "f1", "特徵重要性",
            "定位", "概念", "前處理", "優點", "缺點", "限制", "流程", "實務", "評估", "調參", "導入",
            # Evaluation charts keywords
            "殘差圖", "殘差", "roc", "auc", "roc曲線", "決策邊界", "特徵重要性", "基尼",
            "間隔", "超平面", "支援向量", "核函數", "kernel", "維度災難",
            "肘部法則", "wcss", "聚類", "質心", "精確度", "召回率", "pr曲線",
            "收斂", "早停", "xgboost", "lightgbm", "boosting", "學習曲線",
            "同方差", "異質變異數", "漏斗狀", "偽陽性", "偽陰性", "真陽性", "真陰性",
            "判讀", "圖表", "評估圖", "手冊"
        ]
        matched_words = []
        for kw in domain_keywords:
            if kw in query_lower:
                matched_words.append(kw)
        
        # Also extract English words/alphanumeric tokens
        eng_words = re.findall(r"[a-zA-Z0-9]+", query_lower)
        matched_words.extend(eng_words)
        
        # Fallback to single character split if no keyword matched (to prevent empty queries)
        if not matched_words:
            matched_words = [char for char in query_lower if re.match(r"[\u4e00-\u9fa5]", char)]
            
        query_words = list(set(matched_words))
        if not query_words:
            return []

        scored_docs = []
        for doc in self.documents:
            score = 0
            content = doc["content"].lower()
            source = doc["source"].lower()
            
            for word in query_words:
                # Give high weight to matches in the title/source
                if word in source:
                    score += 15
                # Match in content
                count = content.count(word)
                if count > 0:
                    score += count * 2
            
            if score > 0:
                scored_docs.append((score, doc))

        # Sort by score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:top_n]]

# Instantiate the local search engine
local_search = LocalSearchEngine()

def merge_consecutive_messages(messages: list, ai_role: str = "assistant") -> list:
    formatted = []
    current_role = None
    current_content = []
    
    for msg in messages:
        role = ai_role if msg.get("role") in ["ai", "assistant"] else "user"
        if role == current_role:
            current_content.append(msg.get("content", ""))
        else:
            if current_role is not None:
                formatted.append({"role": current_role, "content": "\n".join(current_content)})
            current_role = role
            current_content = [msg.get("content", "")]
            
    if current_role is not None:
        formatted.append({"role": current_role, "content": "\n".join(current_content)})
        
    # Ensure it starts with user message
    while formatted and formatted[0]["role"] != "user":
        formatted.pop(0)
        
    return formatted

def ask_ai(messages: list, api_key: Optional[str] = None, api_type: str = "gemini", model: Optional[str] = None) -> str:
    # Resolve API Key from env file or environment variables if not passed by the client
    if not api_key or not api_key.strip():
        # Load local .env files if they exist (both backend/ and root directories)
        import os
        for dotenv_path in [os.path.join(os.path.dirname(__file__), ".env"), os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")]:
            if os.path.exists(dotenv_path):
                with open(dotenv_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ[k.strip()] = v.strip().strip('"').strip("'")
        
        # Read from environment variables based on API type
        if api_type == "gemini":
            api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        elif api_type == "openai":
            api_key = os.environ.get("OPENAI_API_KEY")
        elif api_type == "anthropic":
            api_key = os.environ.get("ANTHROPIC_API_KEY")

    # Extract the last user message as search query for context retrieval
    user_messages = [m for m in messages if m.get("role") == "user"]
    query = user_messages[-1].get("content", "") if user_messages else ""

    # 1. If API key is provided, try to call the real LLM APIs
    if api_key and api_key.strip():
        try:
            # Fetch relevant local context to feed into the LLM as grounding
            hits = local_search.search(query, top_n=4)
            context_str = "\n\n".join([f"【出處：{h['source']}】\n{h['content']}" for h in hits])
            
            system_prompt = (
                "你是一個專門解答機器學習演算法的 AI 學習助理。請根據以下提供的《機器學習十大演算法研讀報告》內容來回答使用者的問題。若提供的內容不足以回答，你可以利用你自身的專業機器學習知識進行補充說明，但請標註哪些是報告內容，哪些是你的補充。\n\n"
                f"--- 報告參考內容 ---\n{context_str}"
            )

            if api_type == "gemini":
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                
                model_name = model if model else "gemini-2.5-flash-lite"
                merged = merge_consecutive_messages(messages, ai_role="model")
                contents = [{"role": m["role"], "parts": [m["content"]]} for m in merged]
                
                model_instance = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_prompt
                )
                
                response = model_instance.generate_content(contents)
                return response.text

            elif api_type == "openai":
                from openai import OpenAI
                client = OpenAI(api_key=api_key)
                
                model_name = model if model else "gpt-4o"
                merged = merge_consecutive_messages(messages, ai_role="assistant")
                openai_messages = [{"role": "system", "content": system_prompt}] + merged
                
                completion = client.chat.completions.create(
                    model=model_name,
                    messages=openai_messages
                )
                return completion.choices[0].message.content

            elif api_type == "anthropic":
                import requests
                
                model_name = model if model else "claude-3-7-sonnet-latest"
                merged = merge_consecutive_messages(messages, ai_role="assistant")
                
                headers = {
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                }
                
                payload = {
                    "model": model_name,
                    "max_tokens": 4096,
                    "system": system_prompt,
                    "messages": merged
                }
                
                response = requests.post("https://api.anthropic.com/v1/messages", json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                res_json = response.json()
                return res_json["content"][0]["text"]
                
        except Exception as e:
            return f"❌ 呼叫 AI API 時發生錯誤：{str(e)}\n系統已自動切換回本地檢索回答。\n\n" + ask_local_fallback(messages)

    # 2. Fallback to Local Search (Rule-based / Keyword search)
    return ask_local_fallback(messages)

def ask_local_fallback(messages: list) -> str:
    user_messages = [m for m in messages if m.get("role") == "user"]
    query = user_messages[-1].get("content", "") if user_messages else ""

    hits = local_search.search(query, top_n=2)
    if not hits:
        return (
            "*(系統提醒：目前使用本地資料檢索庫回答，尚未設定 API 金鑰)*\n\n"
            "很抱歉，在研讀報告中找不到與您的問題直接相關的內容。建議您可以換個問法，例如問：\n"
            "- 「什麼是偏差與變異的取捨？」\n"
            "- 「隨機森林的優點是什麼？」\n"
            "- 「請告訴我神經網路的限制」"
        )
    
    reply = "*(系統提醒：目前使用本地資料檢索庫回答，若想獲得更靈活的AI解析，請在右上角設定中填寫 API 金鑰)*\n\n"
    reply += f"根據研讀報告，為您找到以下相關內容：\n\n"
    
    for hit in hits:
        reply += f"### 📍 來源：{hit['source']}\n"
        # Wrap long lines nicely
        reply += f"{hit['content']}\n\n"
        
    return reply
