from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
import json

from database import get_db_connection, init_db
from algorithms_data import ALGORITHMS
from evaluation_charts import EVALUATION_CHARTS

app = FastAPI(title="ML Algorithms Learning API")

# Setup CORS so Next.js frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to extracted data JSON (relative to this file's parent directory)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "extracted_data.json")

def load_extracted_data():
    """Load the extracted data JSON from the ML manual PDF."""
    if not os.path.exists(DATA_PATH):
        return {}
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# ─────────────────────────────────────────────
# Pydantic Models
# ─────────────────────────────────────────────

class NoteUpdate(BaseModel):
    content: str

class ProgressUpdate(BaseModel):
    study_completed: Optional[bool] = None
    quiz_completed: Optional[bool] = None
    playground_completed: Optional[bool] = None

class QuizSubmission(BaseModel):
    answers: Dict[int, int]  # quiz_id -> selected_option_index

class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    apiKey: Optional[str] = None
    apiType: Optional[str] = "gemini"
    model: Optional[str] = None

# ─────────────────────────────────────────────
# Overview API — from extracted_data.json
# ─────────────────────────────────────────────

@app.get("/api/overview")
def get_overview():
    """Return the overview/introduction data from the ML manual PDF."""
    data = load_extracted_data()
    if not data:
        # Fallback default if JSON not found
        return {
            "title": "Top 10 機器學習演算法研讀報告",
            "subtitle": "原理、案例、圖解、比較與學習路徑",
            "introduction": "",
            "framework": "",
            "comparison": "",
            "cases": "",
            "learning_path": "",
            "conclusion": "",
            "glossary": "",
            "checklist": ""
        }
    return {
        "title": data.get("title", "Top 10 機器學習演算法研讀報告"),
        "subtitle": data.get("subtitle", "原理、案例、圖解、比較與學習路徑"),
        "introduction": data.get("introduction", ""),
        "framework": data.get("framework", ""),
        "comparison": data.get("comparison", ""),
        "cases": data.get("cases", ""),
        "learning_path": data.get("learning_path", ""),
        "conclusion": data.get("conclusion", ""),
        "glossary": data.get("glossary", ""),
        "checklist": data.get("checklist", "")
    }

# ─────────────────────────────────────────────
# Chat API — AI Assistant
# ─────────────────────────────────────────────

@app.post("/api/chat")
def chat(request: ChatRequest):
    """AI assistant chat endpoint backed by ai_engine.ask_ai()."""
    from ai_engine import ask_ai
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    reply = ask_ai(
        messages=messages,
        api_key=request.apiKey,
        api_type=request.apiType or "gemini",
        model=request.model
    )
    return {"reply": reply}

# ─────────────────────────────────────────────
# Algorithms API
# ─────────────────────────────────────────────

# Mapping between extracted_data.json IDs and algorithm slugs
ID_TO_SLUG = {
    "3.1": "linear-regression",
    "3.2": "logistic-regression",
    "3.3": "decision-tree",
    "3.4": "random-forest",
    "3.5": "support-vector-machine",
    "3.6": "k-nearest-neighbors",
    "3.7": "naive-bayes",
    "3.8": "k-means-clustering",
    "3.9": "deep-learning",
    "3.10": "principal-component-analysis",
}
SLUG_TO_ID = {v: k for k, v in ID_TO_SLUG.items()}

def get_extracted_algo(slug: str, extracted: dict) -> dict:
    """Find the extracted algorithm data by slug."""
    extracted_id = SLUG_TO_ID.get(slug, "")
    for ea in extracted.get("algorithms", []):
        if ea.get("id") == extracted_id:
            return ea
    return {}

@app.get("/api/algorithms")
def get_algorithms():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM progress")
    rows = cursor.fetchall()
    conn.close()
    
    progress_dict = {row["algorithm_id"]: dict(row) for row in rows}
    extracted = load_extracted_data()

    result = []
    for alg_id, alg in ALGORITHMS.items():
        prog = progress_dict.get(alg_id, {
            "study_completed": 0,
            "quiz_completed": 0,
            "playground_completed": 0
        })
        ex = get_extracted_algo(alg_id, extracted)
        table = ex.get("table", {})
        
        result.append({
            "id": alg["id"],
            "name": alg["name"],
            "englishName": ex.get("englishName", ""),
            "image": ex.get("image", ""),
            "type": alg["type"],
            "usage": alg["usage"],
            "idea": alg["idea"],
            "table": {
                "任務類型": table.get("任務類型", alg.get("type", "")),
                "常見用途": table.get("常見用途", alg.get("usage", "")),
                "主要優點": table.get("主要優點", ""),
                "主要限制": table.get("主要限制", ""),
                "前處理重點": table.get("前處理重點", ""),
            },
            "study_completed": bool(prog.get("study_completed", 0)),
            "quiz_completed": bool(prog.get("quiz_completed", 0)),
            "playground_completed": bool(prog.get("playground_completed", 0))
        })
    return result

@app.get("/api/algorithms/{id}")
def get_algorithm_detail(id: str):
    if id not in ALGORITHMS:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    
    alg = ALGORITHMS[id].copy()
    extracted = load_extracted_data()
    ex_algo = get_extracted_algo(id, extracted)
    
    if ex_algo:
        alg["englishName"] = ex_algo.get("englishName", "")
        alg["image"] = ex_algo.get("image", "")
        ex_table = ex_algo.get("table", {})
        if ex_table:
            alg["table"] = {
                "任務類型": ex_table.get("任務類型", alg.get("type", "")),
                "常見用途": ex_table.get("常見用途", alg.get("usage", "")),
                "主要優點": ex_table.get("主要優點", ""),
                "主要限制": ex_table.get("主要限制", ""),
                "前處理重點": ex_table.get("前處理重點", ""),
            }
        ex_details = ex_algo.get("details", {})
        base_details = alg.get("details", {})
        if ex_details or base_details:
            alg["details"] = {
                "positioning": ex_details.get("positioning", base_details.get("positioning", "")),
                "concepts": ex_details.get("concepts", base_details.get("concepts", "")),
                "dataRequirements": ex_details.get("dataRequirements", base_details.get("dataRequirements", "")),
                "trainingProcess": ex_details.get("trainingProcess", base_details.get("trainingProcess", "")),
                "examples": ex_details.get("examples", base_details.get("examples", "")),
                "advantages": ex_details.get("advantages", base_details.get("advantages", "")),
                "limitations": ex_details.get("limitations", base_details.get("limitations", "")),
                "evaluation": ex_details.get("evaluation", base_details.get("evaluation", "")),
                "explainability": ex_details.get("explainability", base_details.get("explainability", "")),
                "tuning": ex_details.get("tuning", base_details.get("tuning", "")),
                "deployment": ex_details.get("deployment", base_details.get("deployment", "")),
                "misconceptions": ex_details.get("misconceptions", base_details.get("misconceptions", "")),
                "extension": ex_details.get("extension", base_details.get("extension", "")),
                "projectApplication": ex_details.get("projectApplication", base_details.get("projectApplication", "")),
                "communication": ex_details.get("communication", base_details.get("communication", "")),
                "qualityControl": ex_details.get("qualityControl", base_details.get("qualityControl", "")),
            }
        ex_supps = ex_algo.get("supplements", [])
        if ex_supps:
            alg["supplements"] = ex_supps
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT content FROM notes WHERE algorithm_id = ?", (id,))
    note_row = cursor.fetchone()
    notes_content = note_row["content"] if note_row else ""
    cursor.execute("SELECT * FROM progress WHERE algorithm_id = ?", (id,))
    prog_row = cursor.fetchone()
    progress = dict(prog_row) if prog_row else {
        "study_completed": 0, "quiz_completed": 0, "playground_completed": 0
    }
    conn.close()
    
    alg["notes"] = notes_content
    alg["progress"] = {
        "study_completed": bool(progress.get("study_completed", 0)),
        "quiz_completed": bool(progress.get("quiz_completed", 0)),
        "playground_completed": bool(progress.get("playground_completed", 0))
    }
    if "quizzes" in alg:
        del alg["quizzes"]
    if "interactive_params" in alg:
        del alg["interactive_params"]
        
    return alg

@app.get("/api/algorithms/{id}/chart")
def get_algorithm_chart(id: str):
    """Return evaluation chart data from the ML evaluation charts manual for a given algorithm."""
    if id not in ALGORITHMS:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    chart = EVALUATION_CHARTS.get(id)
    if not chart:
        raise HTTPException(status_code=404, detail="No evaluation chart data for this algorithm")
    return chart

@app.post("/api/algorithms/{id}/notes")
def update_notes(id: str, note: NoteUpdate):
    if id not in ALGORITHMS:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO notes (algorithm_id, content, last_updated) VALUES (?, ?, CURRENT_TIMESTAMP)",
        (id, note.content)
    )
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Note updated"}

@app.post("/api/algorithms/{id}/progress")
def update_progress(id: str, progress: ProgressUpdate):
    if id not in ALGORITHMS:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM progress WHERE algorithm_id = ?", (id,))
    row = cursor.fetchone()
    study_completed = 1 if progress.study_completed else (row["study_completed"] if row and progress.study_completed is None else 0)
    quiz_completed = 1 if progress.quiz_completed else (row["quiz_completed"] if row and progress.quiz_completed is None else 0)
    playground_completed = 1 if progress.playground_completed else (row["playground_completed"] if row and progress.playground_completed is None else 0)
    cursor.execute(
        "INSERT OR REPLACE INTO progress (algorithm_id, study_completed, quiz_completed, playground_completed, last_updated) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
        (id, study_completed, quiz_completed, playground_completed)
    )
    conn.commit()
    conn.close()
    return {
        "status": "success",
        "progress": {
            "study_completed": bool(study_completed),
            "quiz_completed": bool(quiz_completed),
            "playground_completed": bool(playground_completed)
        }
    }

@app.get("/api/algorithms/{id}/quiz")
def get_algorithm_quiz(id: str):
    if id not in ALGORITHMS:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    quizzes = ALGORITHMS[id].get("quizzes", [])
    return [{"id": q["id"], "question": q["question"], "options": q["options"]} for q in quizzes]

@app.post("/api/algorithms/{id}/quiz/grade")
def grade_algorithm_quiz(id: str, submission: QuizSubmission):
    if id not in ALGORITHMS:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    quizzes = ALGORITHMS[id].get("quizzes", [])
    results = []
    correct_count = 0
    for q in quizzes:
        q_id = q["id"]
        user_answer = submission.answers.get(q_id)
        is_correct = (user_answer == q["answer"])
        if is_correct:
            correct_count += 1
        results.append({
            "id": q_id,
            "question": q["question"],
            "user_answer": user_answer,
            "correct_answer": q["answer"],
            "is_correct": is_correct,
            "explanation": q["explanation"]
        })
    score = int((correct_count / len(quizzes)) * 100) if quizzes else 0
    if score >= 60:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM progress WHERE algorithm_id = ?", (id,))
        row = cursor.fetchone()
        study_completed = row["study_completed"] if row else 0
        playground_completed = row["playground_completed"] if row else 0
        cursor.execute(
            "INSERT OR REPLACE INTO progress (algorithm_id, study_completed, quiz_completed, playground_completed, last_updated) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
            (id, study_completed, 1, playground_completed)
        )
        conn.commit()
        conn.close()
    return {"score": score, "passed": score >= 60, "results": results}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
