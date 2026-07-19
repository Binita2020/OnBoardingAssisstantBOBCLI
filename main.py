import os
import uuid
import json
import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import uvicorn

import onboarding_backend
from results_store import save_candidate_result, get_results_workbook_path

app = FastAPI(
    title="IBM BOB Onboarding & Interview Assistant Hub",
    description="Unified Compliance Quiz System & Experience-Based Interview Assessment Portal powered by IBM BOB CLI",
    version="2.0.0"
)

# Ensure directories exist
os.makedirs("templates", exist_ok=True)
os.makedirs("static", exist_ok=True)
os.makedirs("sessions", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configure templates
templates = Jinja2Templates(directory="templates")

# Prevent caching during development
@app.middleware("http")
async def add_no_cache_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# ── In-memory session store ────────────────────────────────────────────────────
# sessions[token] = {
#   "interviewer_name", "interviewer_email",
#   "candidate_name", "candidate_email",
#   "difficulty", "question_count",
#   "questions": [...],
#   "bob_command", "bob_logs",
#   "submitted": bool,
# }
_sessions: dict[str, dict] = {}

SESSIONS_FILE = Path("./results/sessions_db.json")

def load_sessions():
    global _sessions
    if SESSIONS_FILE.exists():
        try:
            with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
                _sessions.update(json.load(f))
                print(f"[INFO] Loaded {len(_sessions)} sessions from {SESSIONS_FILE}")
        except Exception as e:
            print(f"[WARN] Failed to load sessions from file: {e}")

def save_sessions():
    try:
        SESSIONS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(_sessions, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[WARN] Failed to save sessions to file: {e}")

# Load sessions on startup
load_sessions()

class QuizRequest(BaseModel):
    difficulty: str = "medium"

# ── Page routes ────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def read_hub(request: Request):
    """Serve the main landing hub selection page."""
    return templates.TemplateResponse(request, "hub_index.html", {})

@app.get("/onboarding", response_class=HTMLResponse)
async def read_onboarding(request: Request):
    """Serve the Compliance Onboarding Quiz Assistant screen."""
    return templates.TemplateResponse(request, "onboarding_index.html", {})

@app.get("/interview", response_class=HTMLResponse)
async def read_interview(request: Request):
    """Serve the main interviewer portal UI to create candidate links."""
    return templates.TemplateResponse(request, "interview_index.html", {})

@app.get("/assessment/{token}", response_class=HTMLResponse)
async def candidate_assessment(request: Request, token: str):
    """Serve the candidate assessment page for a specific token."""
    if token not in _sessions:
        return HTMLResponse(
            "<h2 style='font-family:sans-serif;padding:2rem;'>This assessment link is invalid or has expired.</h2>",
            status_code=404,
        )
    session = _sessions[token]
    is_submitted = session.get("submitted", False)
    
    duplicate_date = None
    if is_submitted:
        from results_store import check_duplicate_submission
        duplicate_date = check_duplicate_submission(session["candidate_name"], session["candidate_email"])
        if not duplicate_date:
            duplicate_date = "a previous date"

    return templates.TemplateResponse(
        request, 
        "assessment.html", 
        {
            "request": request, 
            "token": token, 
            "is_submitted": is_submitted, 
            "duplicate_date": duplicate_date,
            "candidate_name": session["candidate_name"],
            "candidate_email": session["candidate_email"],
        }
    )

# ── API: Compliance Quiz ──────────────────────────────────────────────────────

@app.get("/api/documents")
async def get_documents():
    """List available compliance policy documents."""
    try:
        docs = onboarding_backend.get_documents_info()
        return {"documents": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quiz/generate")
async def generate_quiz(req: QuizRequest):
    """Compliance quiz generation endpoint."""
    if req.difficulty not in ["easy", "medium", "hard"]:
        raise HTTPException(status_code=400, detail="Invalid difficulty.")
    try:
        quiz_data = onboarding_backend.generate_quiz_questions(difficulty=req.difficulty)
        return quiz_data
    except Exception as e:
        error_msg = str(e)
        return JSONResponse(
            status_code=500,
            content={
                "error": error_msg,
                "bob_command": f"bob --hide-intermediary-output --output-format json --chat-mode ask ...",
                "bob_logs": f"Execution error:\n{error_msg}"
            }
        )

# ── API: Interview session creation ───────────────────────────────────────────

@app.post("/api/interview/create")
async def create_interview_session(
    interviewer_name: str = Form(...),
    interviewer_email: str = Form(...),
    candidate_name: str = Form(...),
    candidate_email: str = Form(...),
    difficulty: str = Form("medium"),
    question_count: int = Form(10),
    behaviour_count: int = Form(0),
    resume: UploadFile = File(...),
    job_description: UploadFile = File(...),
):
    """
    Interviewer submits details + resume + JD.
    Returns a unique assessment token/link with pre-generated questions.
    """
    if difficulty not in ["easy", "medium", "hard"]:
        raise HTTPException(status_code=400, detail="Invalid difficulty.")
    if question_count not in [5, 10, 15]:
        raise HTTPException(status_code=400, detail="JD question count must be 5, 10, or 15.")
    if behaviour_count not in [0, 5, 10]:
        raise HTTPException(status_code=400, detail="Behaviour question count must be 0, 5, or 10.")

    # Extract text from uploads
    try:
        resume_bytes = await resume.read()
        resume_text = onboarding_backend.extract_text_from_upload(resume_bytes, resume.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse resume: {e}")

    try:
        jd_bytes = await job_description.read()
        jd_text = onboarding_backend.extract_text_from_upload(jd_bytes, job_description.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse job description: {e}")

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume appears to be empty after parsing.")
    if not jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description appears to be empty after parsing.")

    # Generate questions via BOB CLI
    try:
        result = onboarding_backend.generate_interview_questions(
            resume_text=resume_text,
            jd_text=jd_text,
            difficulty=difficulty,
            question_count=question_count + behaviour_count,
            candidate_name=candidate_name,
            data_dir=onboarding_backend.DATA_DIR_REPOSITORIES,
            count_a=question_count,
            count_b=behaviour_count,
        )
    except Exception as e:
        error_msg = str(e)
        return JSONResponse(
            status_code=500,
            content={
                "error": error_msg,
                "bob_command": "bob --hide-intermediary-output --output-format json --chat-mode ask ...",
                "bob_logs": f"Execution error:\n{error_msg}",
            }
        )

    # Store session
    token = str(uuid.uuid4())
    _sessions[token] = {
        "interviewer_name":  interviewer_name,
        "interviewer_email": interviewer_email,
        "candidate_name":    candidate_name,
        "candidate_email":   candidate_email,
        "difficulty":        difficulty,
        "question_count":    question_count,
        "questions":         result["questions"],
        "section_a":         result["section_a"],
        "section_b":         result["section_b"],
        "count_a":           result["count_a"],
        "count_b":           result["count_b"],
        "bob_command":       result["bob_command"],
        "bob_logs":          result["bob_logs"],
        "created_at":        datetime.datetime.utcnow().isoformat(),
        "submitted":         False,
    }
    save_sessions()

    return {
        "token":              token,
        "candidate_name":     candidate_name,
        "candidate_email":    candidate_email,
        "question_count":     len(result["questions"]),
        "count_a":            result["count_a"],
        "count_b":            result["count_b"],
        "repositories_used":  result.get("repositories_used", []),
        "bob_command":        result["bob_command"],
        "bob_logs":           result["bob_logs"],
    }

# ── API: Candidate fetches their session ──────────────────────────────────────

@app.get("/api/assessment/{token}/info")
async def get_assessment_info(token: str):
    """Returns session metadata so the candidate verify screen can show their name."""
    session = _sessions.get(token)
    if not session:
        raise HTTPException(status_code=404, detail="Invalid or expired assessment link.")
    if session.get("submitted"):
        raise HTTPException(status_code=410, detail="This assessment has already been submitted.")
    return {
        "candidate_name":  session["candidate_name"],
        "candidate_email": session["candidate_email"],
        "question_count":  session["question_count"],
        "count_a":         session.get("count_a", session["question_count"]),
        "count_b":         session.get("count_b", 0),
        "difficulty":      session["difficulty"],
    }

@app.post("/api/assessment/{token}/verify")
async def verify_candidate(token: str, request: Request):
    """
    Candidate enters their name + email to unlock the quiz.
    Must match the values the interviewer registered.
    """
    session = _sessions.get(token)
    if not session:
        raise HTTPException(status_code=404, detail="Invalid or expired assessment link.")
    if session.get("submitted"):
        # If this link has already been used, show the duplicate error card with submission date
        from results_store import check_duplicate_submission
        date_str = check_duplicate_submission(session["candidate_name"], session["candidate_email"])
        if not date_str:
            date_str = "a previous date"
        raise HTTPException(
            status_code=403,
            detail=f"A submission was already recorded for \"{session['candidate_name']}\" ({session['candidate_email']}) on {date_str}. Duplicate attempts are not permitted."
        )

    body = await request.json()
    entered_name = (body.get("name") or "").strip().lower()
    entered_email = (body.get("email") or "").strip().lower()
    dob = body.get("dob")
    experience = body.get("experience")

    expected_name = session["candidate_name"].strip().lower()
    expected_email = session["candidate_email"].strip().lower()

    if entered_name != expected_name or entered_email != expected_email:
        raise HTTPException(
            status_code=403,
            detail="Name or email does not match the registered candidate. Please check and try again."
        )

    # Note: We do NOT perform duplicate checks for a brand new, unused assessment token.
    # This allows the interviewer to generate a fresh link for authorized retakes!

    # Store candidate details in session
    session["candidate_dob"] = dob
    session["candidate_experience"] = experience

    return {
        "verified":      True,
        "questions":     session["questions"],
        "section_a":     session.get("section_a", session["questions"]),
        "section_b":     session.get("section_b", []),
        "count_a":       session.get("count_a", session["question_count"]),
        "count_b":       session.get("count_b", 0),
        "question_count": session["question_count"],
        "difficulty":    session["difficulty"],
        "candidate_name": session["candidate_name"],
    }

# ── API: Candidate submits answers ────────────────────────────────────────────

@app.post("/api/assessment/{token}/submit")
async def submit_assessment(token: str, request: Request):
    """
    Candidate submits answers.
    Score is calculated and saved to Excel. Candidate sees only a thank-you message.
    """
    session = _sessions.get(token)
    if not session:
        raise HTTPException(status_code=404, detail="Invalid or expired assessment link.")
    if session.get("submitted"):
        from results_store import check_duplicate_submission
        date_str = check_duplicate_submission(session["candidate_name"], session["candidate_email"])
        if not date_str:
            date_str = "a previous date"
        raise HTTPException(
            status_code=403,
            detail=f"A submission was already recorded for \"{session['candidate_name']}\" ({session['candidate_email']}) on {date_str}. Duplicate attempts are not permitted."
        )

    body = await request.json()
    answers: dict = body.get("answers", {})
    terminated: bool = body.get("terminated", False)
    video_status: str = body.get("video_status", "N/A")

    questions = session["questions"]
    total = len(questions)

    # Per-section boundaries stored in session
    count_a: int = session.get("count_a", total)

    correct = 0
    correct_a = 0
    correct_b = 0
    detailed = []

    for i, q in enumerate(questions):
        selected   = answers.get(str(i))
        is_correct = (selected == q.get("answer_index"))
        section    = q.get("section", "A" if i < count_a else "B")

        if is_correct:
            correct += 1
            if section == "A":
                correct_a += 1
            else:
                correct_b += 1

        detailed.append({
            "question":        q.get("question", ""),
            "section":         section,
            "selected_option": q["options"][selected] if selected is not None and 0 <= selected < len(q["options"]) else "Not answered",
            "correct_option":  q["options"][q["answer_index"]],
            "is_correct":      is_correct,
            "source_doc":      q.get("source_doc", ""),
        })

    count_b   = total - count_a
    score_percent   = round((correct   / total)   * 100, 1) if total   > 0 else 0
    score_a_percent = round((correct_a / count_a) * 100, 1) if count_a > 0 else 0
    score_b_percent = round((correct_b / count_b) * 100, 1) if count_b > 0 else 0
    passed = score_percent >= 60

    status = "Terminated – Tab Switch" if terminated else "Completed"

    # Save to Excel
    try:
        save_candidate_result(
            interviewer_name=session["interviewer_name"],
            interviewer_email=session["interviewer_email"],
            candidate_name=session["candidate_name"],
            candidate_email=session["candidate_email"],
            difficulty=session["difficulty"],
            question_count=total,
            correct_count=correct,
            score_percent=score_percent,
            passed=passed,
            detailed_answers=detailed,
            submitted_at=datetime.datetime.utcnow().isoformat(),
            count_a=count_a,
            count_b=count_b,
            correct_a=correct_a,
            correct_b=correct_b,
            score_a_percent=score_a_percent,
            score_b_percent=score_b_percent,
            candidate_dob=session.get("candidate_dob", ""),
            candidate_experience=session.get("candidate_experience", ""),
            status=status,
            video_status=video_status,
        )
    except Exception as e:
        print(f"[WARN] Failed to save results to Excel: {e}")

    # Mark session as submitted
    _sessions[token]["submitted"] = True
    _sessions[token]["terminated"] = terminated
    save_sessions()

    return {"submitted": True, "message": "Thank you for completing the assessment. We will get back to you soon."}

@app.post("/api/assessment/{token}/upload_video")
async def upload_video(token: str, video: UploadFile = File(...)):
    """
    Upload webcam video recording for candidate assessment.
    """
    session = _sessions.get(token)
    if not session:
        raise HTTPException(status_code=404, detail="Invalid or expired assessment link.")
    
    candidate_name = "".join(c if c.isalnum() or c in "._-" else "_" for c in session.get("candidate_name", "candidate"))
    
    # Ensure results/videos directory exists
    video_dir = Path("./results/videos")
    video_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = video_dir / f"{token}_{candidate_name}.webm"
    try:
        content = await video.read()
        with open(file_path, "wb") as f:
            f.write(content)
        return {"uploaded": True, "filename": file_path.name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video: {e}")

@app.get("/api/assessment/{token}/status")
async def get_assessment_status(token: str):
    """
    Check the current submission status of the assessment.
    """
    session = _sessions.get(token)
    if not session:
        raise HTTPException(status_code=404, detail="Invalid or expired assessment link.")
    
    if session.get("submitted", False):
        if session.get("terminated", False):
            return {"status": "Terminated"}
        else:
            return {"status": "Completed"}
    else:
        return {"status": "Pending"}

# ── API: Interviewer downloads results ────────────────────────────────────────

@app.get("/api/results/download")
async def download_results(interviewer_email: str):
    """
    Interviewer downloads the Excel results workbook.
    """
    wb_path = get_results_workbook_path()
    if not os.path.exists(wb_path):
        raise HTTPException(status_code=404, detail="No results have been recorded yet.")
    return FileResponse(
        path=wb_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="IBM_Interview_Results.xlsx",
    )

# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
