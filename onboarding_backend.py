import os
import re
import shutil
import subprocess
import json
import random
import sys
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load environment variables from .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Map BOB_API_KEY to BOBSHELL_API_KEY if BOBSHELL_API_KEY is not already defined
if "BOB_API_KEY" in os.environ and "BOBSHELL_API_KEY" not in os.environ:
    os.environ["BOBSHELL_API_KEY"] = os.environ["BOB_API_KEY"]

# ── Config ────────────────────────────────────────────────────────────────────
DATA_DIR_REPOSITORIES = "./data/repositories"
DATA_DIR_COMPLIANCE = "./data/repositories"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150

# Locate the BOB CLI (handles Windows .cmd wrapper and Unix paths).
_NPM_BIN_WIN = os.path.join(os.environ.get("APPDATA", ""), "npm")
_NODE_BIN_WIN = r"C:\Program Files\nodejs"
_VS_NODE_BIN_WIN = r"C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs"

def _find_bob() -> str | None:
    """Return the full path to the bob/bob.cmd executable, or None."""
    for name in ("bob.cmd", "bob"):
        found = shutil.which(name)
        if found:
            return found
    if os.name == "nt":
        candidate = os.path.join(_NPM_BIN_WIN, "bob.cmd")
        if os.path.isfile(candidate):
            return candidate
    return None

_BOB_CMD = _find_bob()

def get_bob_command_path() -> str:
    if _BOB_CMD is None:
        raise FileNotFoundError(
            "BOB CLI not found. Install with: npm install -g @ibm/bob  "
            "and make sure the npm global bin directory is on your PATH."
        )
    return _BOB_CMD

def _make_bob_env() -> dict:
    """
    Return an environment dict for the bob subprocess that guarantees
    Node.js and the npm global bin directory are on PATH.
    """
    env = os.environ.copy()
    extra = []
    if os.name == "nt":
        if _NPM_BIN_WIN and os.path.isdir(_NPM_BIN_WIN):
            extra.append(_NPM_BIN_WIN)
        if os.path.isdir(_NODE_BIN_WIN):
            extra.append(_NODE_BIN_WIN)
        elif os.path.isdir(_VS_NODE_BIN_WIN):
            extra.append(_VS_NODE_BIN_WIN)
    if extra:
        current_path = env.get("PATH", "")
        env["PATH"] = os.pathsep.join(extra) + (os.pathsep + current_path if current_path else "")
    return env

# ── Knowledge Repository keyword map ─────────────────────────────────────────
REPO_KEYWORD_MAP = {
    "Programming Knowledge Repository.md": [
        "java", "python", "c#", "c++", "javascript", "typescript", "kotlin", "scala",
        "spring", "spring boot", "django", "flask", "fastapi", ".net", "asp.net",
        "nodejs", "react", "angular", "vue", "rest", "api", "microservice",
        "sql", "postgresql", "mysql", "oracle", "mongodb", "redis", "hibernate",
        "oop", "object oriented", "design pattern", "solid", "tdd", "unit test",
        "backend", "frontend", "fullstack", "full stack", "software engineer",
        "developer", "programming", "algorithm", "data structure",
    ],
    "Testing Knowledge Repository.md": [
        "qa", "quality assurance", "test", "testing", "selenium", "playwright",
        "cypress", "appium", "junit", "pytest", "testng", "cucumber", "bdd",
        "api testing", "postman", "rest assured", "performance testing", "jmeter",
        "load testing", "automation", "manual testing", "regression", "smoke",
        "sanity", "functional testing", "non-functional", "test plan", "test case",
        "defect", "bug", "sdet", "quality engineer", "test automation",
    ],
    "Cloud Technologies Knowledge Repository.md": [
        "aws", "azure", "gcp", "google cloud", "cloud", "ec2", "s3", "lambda",
        "rds", "ecs", "eks", "aks", "azure functions", "cloud functions",
        "terraform", "cloudformation", "arm template", "kubernetes", "docker",
        "serverless", "microservice", "vpc", "iam", "cloud architect",
        "cloud engineer", "devops", "site reliability", "sre",
    ],
    "Data Engineering Knowledge Repository.md": [
        "data engineer", "data pipeline", "etl", "elt", "spark", "pyspark",
        "databricks", "hadoop", "hive", "kafka", "airflow", "dbt", "sql",
        "data warehouse", "data lake", "lakehouse", "snowflake", "redshift",
        "bigquery", "synapse", "data mart", "data modeling", "data quality",
        "data governance", "data lineage", "metadata", "delta lake",
        "streaming", "batch processing", "data architecture",
    ],
    "AI & Generative AI Knowledge Repository.md": [
        "ai", "machine learning", "ml", "deep learning", "nlp", "llm",
        "generative ai", "genai", "langchain", "openai", "gpt", "bert",
        "transformer", "rag", "retrieval augmented", "vector", "embedding",
        "prompt engineering", "fine tuning", "hugging face", "tensorflow",
        "pytorch", "scikit-learn", "neural network", "computer vision",
        "data scientist", "ai engineer", "ml engineer",
    ],
    "DevOps Knowledge Repository.md": [
        "devops", "ci/cd", "jenkins", "github actions", "gitlab ci", "azure devops",
        "docker", "kubernetes", "helm", "terraform", "ansible", "chef", "puppet",
        "prometheus", "grafana", "elk", "splunk", "monitoring", "observability",
        "infrastructure as code", "iac", "containerization", "orchestration",
        "deployment", "pipeline", "git", "version control", "release management",
        "sre", "site reliability", "platform engineer",
    ],
}

SOFT_SKILLS_REPO = "Soft Skills Knowledge Repository.md"

# ── 1. File text extraction ───────────────────────────────────────────────────
def extract_text_from_upload(file_bytes: bytes, filename: str) -> str:
    """Extract plain text from an uploaded file (PDF, DOCX, or plain text/markdown)."""
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        try:
            import io
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                pages = [page.extract_text() or "" for page in pdf.pages]
            return "\n".join(pages).strip()
        except ImportError:
            try:
                import io
                import PyPDF2
                reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                text = "\n".join(page.extract_text() or "" for page in reader.pages)
                return text.strip()
            except ImportError:
                raise ImportError(
                    "PDF parsing requires 'pdfplumber' or 'PyPDF2'. "
                    "Install with: pip install pdfplumber"
                )
    elif ext in (".docx",):
        try:
            import io
            from docx import Document
            doc = Document(io.BytesIO(file_bytes))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()
        except ImportError:
            raise ImportError(
                "DOCX parsing requires 'python-docx'. "
                "Install with: pip install python-docx"
            )
    else:
        return file_bytes.decode("utf-8", errors="replace").strip()

# ── 2. Knowledge repository selector ─────────────────────────────────────────
def select_relevant_repositories(resume_text: str, jd_text: str, data_dir: str = DATA_DIR_REPOSITORIES) -> dict[str, str]:
    """
    Identify which knowledge repository files are relevant based on
    keywords found in the resume and JD, then load their full text.
    Soft Skills is always included.
    Returns { filename: full_text }
    """
    combined_lower = (resume_text + " " + jd_text).lower()
    selected: dict[str, str] = {}

    for repo_file, keywords in REPO_KEYWORD_MAP.items():
        if any(kw in combined_lower for kw in keywords):
            filepath = os.path.join(data_dir, repo_file)
            if os.path.exists(filepath):
                with open(filepath, encoding="utf-8") as fh:
                    selected[repo_file] = fh.read()

    # Always include Soft Skills
    soft_path = os.path.join(data_dir, SOFT_SKILLS_REPO)
    if os.path.exists(soft_path) and SOFT_SKILLS_REPO not in selected:
        with open(soft_path, encoding="utf-8") as fh:
            selected[SOFT_SKILLS_REPO] = fh.read()

    return selected

def _ascii_safe(text: str) -> str:
    """
    Replace non-ASCII characters with '?' so the prompt can be safely passed
    via subprocess on Windows where the default pipe encoding is cp1252.
    The meaning of the text is fully preserved for ASCII content.
    """
    return text.encode("ascii", errors="replace").decode("ascii")

def get_repo_excerpt(repo_text: str, max_chars: int = 800) -> str:
    """Return a truncated, ASCII-safe excerpt of a repo file."""
    return _ascii_safe(repo_text[:max_chars].strip())

# ── 3. Question count distribution helper ─────────────────────────────────────
def _build_distribution(question_count: int) -> dict:
    """Return integer counts per question type that sum to question_count."""
    ratios = [0.30, 0.30, 0.20, 0.10, 0.05, 0.05]
    labels = [
        "Technical Concept",
        "Practical Implementation",
        "Scenario-Based",
        "Debugging & Troubleshooting",
        "Architecture & Design",
        "Leadership / Behavioral",
    ]
    if question_count <= 0:
        return {lbl: 0 for lbl in labels}
    
    # Proportional initial integer counts
    counts = [int(r * question_count) for r in ratios]
    
    # Add remainder step-by-step to prevent negative numbers and sum to question_count
    remainder = question_count - sum(counts)
    for i in range(remainder):
        counts[i % len(counts)] += 1
        
    return dict(zip(labels, counts))

# ── 4. Interview prompt builders (Section A: JD-only, Section B: Resume-only) ─
def _schema_example() -> str:
    return (
        '{"question":"...","options":["A","B","C","D"],"answer_index":0,'
        '"skill":"...","domain":"...","question_type":"Technical Concept|Practical Implementation|Scenario-Based|Debugging & Troubleshooting|Architecture & Design|Leadership / Behavioral",'
        '"experience_level":"0-3 Years|3-6 Years|6-8 Years|8+ Years",'
        '"reason":"why this question matters","discussion_points":"key topics",'
        '"follow_up":"follow-up question","explanation":"why correct (max 20 words)",'
        '"source_doc":"Job Description"}'
    )

def build_section_a_prompt(
    jd_text: str,
    difficulty: str,
    question_count: int,
    candidate_name: str,
    repositories: dict[str, str],
) -> str:
    repo_block = ""
    for repo_name, repo_text in repositories.items():
        excerpt = get_repo_excerpt(repo_text, max_chars=800)
        repo_name_short = repo_name.replace(" Knowledge Repository.md", "").replace(".md", "")
        repo_block += f"[{repo_name_short}]: {excerpt}\n\n"

    distribution = _build_distribution(question_count)
    dist_lines = ", ".join(f"{count} {qtype}" for qtype, count in distribution.items())

    exp_guidance = {
        "easy":   "0-3 yrs: fundamentals, core concepts, basic implementation.",
        "medium": "3-6 yrs: practical implementation, debugging, best practices.",
        "hard":   "6+ yrs: architecture decisions, trade-offs, leadership, enterprise scale.",
    }.get(difficulty, "")

    safe_jd  = _ascii_safe(jd_text[:2500])
    safe_name = _ascii_safe(candidate_name)

    prompt = (
        f"IMPORTANT: Your entire response must be ONLY a valid JSON array. "
        f"Start with [ and end with ]. No prose, no markdown, no explanation.\n\n"
        f"TASK: Generate exactly {question_count} interview MCQs for candidate \"{safe_name}\" "
        f"based STRICTLY on the Job Description below. "
        f"Do NOT reference or use the candidate's resume. "
        f"Every question must test a skill, technology, or responsibility explicitly mentioned in the JD.\n\n"
        f"JOB DESCRIPTION:\n{safe_jd}\n\n"
        f"KNOWLEDGE REPOSITORIES (for technical depth):\n{repo_block}"
        f"EXPERIENCE LEVEL: {exp_guidance}\n\n"
        f"QUESTION TYPE DISTRIBUTION (target): {dist_lines}\n\n"
        f"RULES:\n"
        f"- Every question must map directly to a requirement, skill, or responsibility in the JD.\n"
        f"- Focus on deep, framework-specific practical questions (e.g. testing decorators, components lifecycle, annotations, configuration fields, async handlers, DB transactions) rather than shallow definitions.\n"
        f"- Frequently include realistic, short code snippets or configuration blocks (formatted with double quotes escaped inside the JSON question string, using standard coding notation or markdown blocks) inside the questions or options to evaluate code readability or debugging capability.\n"
        f"- Distribute the correct answers randomly; do not always place the correct answer as the first option (Option 0). Set answer_index to reflect the correct choice (0, 1, 2, or 3).\n"
        f"- Include at least 1 leadership/behavioral question aligned to the JD role.\n"
        f"- All 4 options must be plausible; only 1 is correct. answer_index is 0-based.\n"
        f"- Set source_doc to \"Job Description\" for every question.\n\n"
        f"SCHEMA: {_schema_example()}\n\n"
        f"Output ONLY the JSON array of exactly {question_count} objects. "
        f"Start with [ and end with ]. No other text.\n\n"
        f"JSON OUTPUT:\n["
    )
    return _ascii_safe(prompt)

def build_section_b_prompt(
    resume_text: str,
    difficulty: str,
    question_count: int,
    candidate_name: str,
    repositories: dict[str, str],
) -> str:
    repo_block = ""
    for repo_name, repo_text in repositories.items():
        excerpt = get_repo_excerpt(repo_text, max_chars=800)
        repo_name_short = repo_name.replace(" Knowledge Repository.md", "").replace(".md", "")
        repo_block += f"[{repo_name_short}]: {excerpt}\n\n"

    distribution = _build_distribution(question_count)
    dist_lines = ", ".join(f"{count} {qtype}" for qtype, count in distribution.items())

    exp_guidance = {
        "easy":   "0-3 yrs: fundamentals, core concepts, basic implementation.",
        "medium": "3-6 yrs: practical implementation, debugging, best practices.",
        "hard":   "6+ yrs: architecture decisions, trade-offs, leadership, enterprise scale.",
    }.get(difficulty, "")

    safe_resume = _ascii_safe(resume_text[:3000])
    safe_name   = _ascii_safe(candidate_name)

    prompt = (
        f"IMPORTANT: Your entire response must be ONLY a valid JSON array. "
        f"Start with [ and end with ]. No prose, no markdown, no explanation.\n\n"
        f"TASK: Generate exactly {question_count} interview MCQs for candidate \"{safe_name}\" "
        f"based STRICTLY on their Resume below. "
        f"Do NOT reference the job description. "
        f"Every question must reference a specific technology, project, role or skill explicitly mentioned in the resume. "
        f"Draw inspiration from standard, high-quality technical interview questions commonly asked in top-tier tech companies (similar to resources found on LeetCode, HackerRank, GeeksforGeeks, Glassdoor, and tech blog interview questions) for the relevant technologies.\n\n"
        f"CANDIDATE RESUME:\n{safe_resume}\n\n"
        f"KNOWLEDGE REPOSITORIES (for technical depth):\n{repo_block}"
        f"EXPERIENCE LEVEL: {exp_guidance}\n\n"
        f"QUESTION TYPE DISTRIBUTION (target): {dist_lines}\n\n"
        f"RULES:\n"
        f"- Every question must directly reference something in the candidate's resume "
        f"(e.g. \"Your resume mentions X — how did you...\").\n"
        f"- Probe the depth and authenticity of their claimed experience by designing challenging framework-specific questions (e.g. Spring Boot decorators, React hooks, python structures, SQL patterns, Kubernetes resources) rather than simple vocabulary checks.\n"
        f"- Frequently include realistic, short code snippets, configuration snippets, or query fragments (escaped properly for JSON) to test candidate's analytical skills.\n"
        f"- Distribute the correct answers randomly; do not always place the correct answer as the first option (Option 0). Set answer_index to reflect the correct choice (0, 1, 2, or 3).\n"
        f"- Include at least 1 question on a leadership or team experience from the resume.\n"
        f"- All 4 options must be plausible; only 1 is correct. answer_index is 0-based.\n"
        f"- Set source_doc to \"Resume\" for every question.\n\n"
        f"SCHEMA: {_schema_example().replace('\"Job Description\"', '\"Resume\"')}\n\n"
        f"Output ONLY the JSON array of exactly {question_count} objects. "
        f"Start with [ and end with ]. No other text.\n\n"
        f"JSON OUTPUT:\n["
    )
    return _ascii_safe(prompt)

def build_interview_prompt(
    resume_text: str,
    jd_text: str,
    difficulty: str,
    question_count: int,
    candidate_name: str,
    repositories: dict[str, str],
) -> str:
    """Legacy single-section prompt (kept for compatibility)."""
    return build_section_a_prompt(jd_text, difficulty, question_count, candidate_name, repositories)


# ── 5. Document Scanning & Chunking (Compliance Quiz) ───────────────────────
def get_documents_info(data_dir: str = DATA_DIR_COMPLIANCE) -> list[dict]:
    """Scan the compliance data directory and return details about documents and their chunk counts."""
    if not os.path.exists(data_dir):
        return []
    files = [f for f in os.listdir(data_dir) if f.endswith((".md", ".txt"))]
    splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    doc_info = []
    for f in files:
        filepath = os.path.join(data_dir, f)
        size = os.path.getsize(filepath)
        with open(filepath, encoding="utf-8") as fh:
            text = fh.read()
        chunks = splitter.split_text(text)
        doc_info.append({"name": f, "size_bytes": size, "chunks_count": len(chunks)})
    return doc_info

def load_and_chunk_all_documents(data_dir: str = DATA_DIR_COMPLIANCE) -> dict[str, list[str]]:
    """Load all markdown/text documents and split them into chunks."""
    if not os.path.exists(data_dir):
        return {}
    files = [f for f in os.listdir(data_dir) if f.endswith((".md", ".txt"))]
    splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    doc_to_chunks = {}
    for f in files:
        filepath = os.path.join(data_dir, f)
        with open(filepath, encoding="utf-8") as fh:
            text = fh.read()
        chunks = splitter.split_text(text)
        chunks = [c.strip() for c in chunks if len(c.strip()) > 50]
        if chunks:
            doc_to_chunks[f] = chunks
    return doc_to_chunks

def sample_diverse_chunks(doc_to_chunks: dict[str, list[str]], target_count: int = 10) -> list[dict]:
    """
    Select target_count chunks across all documents in a round-robin/stratified manner.
    """
    if not doc_to_chunks:
        raise ValueError("No document chunks available to sample from.")
    doc_names = sorted(doc_to_chunks.keys())
    shuffled_docs = {name: doc_to_chunks[name][:] for name in doc_names}
    for name in shuffled_docs:
        random.shuffle(shuffled_docs[name])
    selected_chunks = []
    doc_index = 0
    attempts = 0
    while len(selected_chunks) < target_count and attempts < 1000:
        attempts += 1
        current_doc = doc_names[doc_index % len(doc_names)]
        if shuffled_docs[current_doc]:
            chunk_text = shuffled_docs[current_doc].pop(0)
            selected_chunks.append({"document": current_doc, "text": chunk_text})
        doc_index += 1
        if all(not shuffled_docs[name] for name in doc_names):
            break
    all_chunks_flat = [{"document": n, "text": c} for n in doc_names for c in doc_to_chunks[n]]
    while len(selected_chunks) < target_count and all_chunks_flat:
        selected_chunks.append(random.choice(all_chunks_flat))
    return selected_chunks

def build_prompt(selected_chunks: list[dict], difficulty: str, question_count: int = 10) -> str:
    """Construct prompt for BOB to generate questions in a strict JSON schema from excerpts."""
    excerpts_str = ""
    for idx, item in enumerate(selected_chunks):
        excerpts_str += f"\n[Excerpt {idx + 1}] (From Document: {item['document']})\n{item['text']}\n"
    prompt = (
        f"You are a strict technical training and evaluation API. Generate exactly {question_count} knowledge verification "
        f"multiple-choice questions (MCQs) in JSON format.\n\n"
        f"DIFFICULTY LEVEL: {difficulty.upper()}\n"
        f"- EASY: straightforward fact retrieval from the text.\n"
        f"- MEDIUM: requires understanding and application of the concepts.\n"
        f"- HARD: scenario-based, testing edge cases and interpretation of the principles/guidelines.\n\n"
        f"EXCERPTS:\n{excerpts_str}\n"
        f"INSTRUCTIONS:\n"
        f"1. Generate exactly 1 question for each excerpt above (Question 1 for Excerpt 1, Question 2 for Excerpt 2, etc.).\n"
        f"2. Each question must be multiple-choice with exactly 4 options.\n"
        f"3. Base all questions strictly on the text provided. Do not extrapolate.\n"
        f"4. Provide a very brief explanation (MAXIMUM 15 words) of why that answer is correct.\n"
        f"5. Output ONLY a valid JSON array of {question_count} objects. Do NOT include any markdown blocks (like ```json), do NOT include any introductory or concluding conversational text. Start directly with the character '[' and end with ']'.\n\n"
        f"EXPECTED JSON SCHEMA:\n"
        f"[\n"
        f"  {{\n"
        f"    \"question\": \"[Scenario/Question text]\",\n"
        f"    \"options\": [\"Option 0\", \"Option 1\", \"Option 2\", \"Option 3\"],\n"
        f"    \"answer_index\": 0,\n"
        f"    \"explanation\": \"[Max 15 words explaining correct choice]\",\n"
        f"    \"source_doc\": \"[Filename of the excerpt source]\"\n"
        f"  }},\n"
        f"  ...\n"
        f"]\n\n"
        f"JSON OUTPUT:"
    )
    return prompt


# ── 6. BOB CLI Subprocess Call ───────────────────────────────────────────────
def call_bob(prompt: str) -> tuple[str, str, str]:
    """
    Send prompt to BOB CLI and return (json_array_str, raw_command, log_text).
    """
    bob_cmd = get_bob_command_path()
    
    # We use -o json for older versions or --output-format json depending on what CLI parameters are expected.
    # In main's code it used: cmd_args = [..., "-o", "json", "--chat-mode", "ask"]
    # In Tanu's code it used: cmd_args = [..., "--output-format", "json", "--chat-mode", "ask"]
    # Since we are on Windows and executing bob CLI, let's use the main version's flags as it is confirmed working.
    cmd_args = [
        str(bob_cmd),
        "--accept-license",
        "--hide-intermediary-output",
        "-o", "json",
        "--chat-mode", "ask",
    ]
    raw_command = (
        f"{bob_cmd} --accept-license --hide-intermediary-output "
        f"-o json --chat-mode ask < [prompt_stdin]"
    )

    result = subprocess.run(
        cmd_args,
        input=prompt,
        capture_output=True,
        text=True,
        encoding="utf-8",
        env=_make_bob_env(),
    )

    stdout = result.stdout or ""
    stderr = result.stderr or ""
    log_header = f"[bob exit code: {result.returncode}]\n"
    stdout_full = log_header + (f"[stderr]\n{stderr}\n\n[stdout]\n{stdout}" if stderr.strip() else stdout)

    stdout_clean = stdout.strip()
    last_brace = stdout_clean.rfind('\n{')
    answer_part = stdout_clean[:last_brace].strip() if last_brace != -1 else stdout_clean

    answer_part = re.sub(r'^```(?:json)?\s*', '', answer_part, flags=re.MULTILINE)
    answer_part = re.sub(r'\s*```\s*$', '', answer_part, flags=re.MULTILINE)
    answer_part = answer_part.strip()

    start_idx = answer_part.find('[')
    end_idx   = answer_part.rfind(']')

    if start_idx == -1:
        first_obj = answer_part.find('{')
        last_obj  = answer_part.rfind('}')
        if first_obj != -1 and last_obj != -1 and last_obj > first_obj:
            answer_part = '[' + answer_part[first_obj:last_obj + 1] + ']'
            start_idx = 0
            end_idx   = len(answer_part) - 1
        else:
            raise ValueError(
                f"No JSON array found in BOB response.\n"
                f"--- stderr (first 400 chars) ---\n{stderr[:400]}\n"
                f"--- answer_part (first 600 chars) ---\n{answer_part[:600]}\n"
                f"--- full stdout (first 800 chars) ---\n{stdout[:800]}"
            )

    if end_idx == -1 or end_idx < start_idx:
        raise ValueError(
            f"Incomplete JSON array in BOB response (no closing ]).\n"
            f"--- stderr ---\n{stderr[:400]}\n"
            f"--- answer_part ---\n{answer_part[:600]}"
        )

    json_str = answer_part[start_idx:end_idx + 1]
    return json_str, raw_command, stdout_full


# ── 7. Master Generation Functions ───────────────────────────────────────────
def _parse_questions(json_data: str, section_label: str) -> list[dict]:
    try:
        questions = json.loads(json_data)
        if not isinstance(questions, list):
            raise ValueError("Parsed JSON is not a list")
    except Exception as e:
        raise ValueError(
            f"Failed to parse {section_label} JSON: {str(e)}\nRaw (first 500): {json_data[:500]}"
        )
    for q in questions:
        q["section"] = section_label
        # Programmatically randomize the correct option index to avoid "Always Option A (index 0)" bias
        options = q.get("options", [])
        ans_idx = q.get("answer_index", 0)
        if options and isinstance(options, list) and isinstance(ans_idx, int) and 0 <= ans_idx < len(options):
            new_ans_idx = random.randint(0, len(options) - 1)
            if new_ans_idx != ans_idx:
                # Swap the correct option to the new index
                options[ans_idx], options[new_ans_idx] = options[new_ans_idx], options[ans_idx]
                q["answer_index"] = new_ans_idx
    return questions

def generate_interview_questions(
    resume_text: str,
    jd_text: str,
    difficulty: str,
    question_count: int,
    candidate_name: str,
    data_dir: str = DATA_DIR_REPOSITORIES,
    count_a: int = None,
    count_b: int = None,
) -> dict:
    repositories = select_relevant_repositories(resume_text, jd_text, data_dir)
    repo_names   = list(repositories.keys())
    repo_summary = ", ".join(repo_names) if repo_names else "None"

    if count_a is None or count_b is None:
        count_a = (question_count + 1) // 2
        count_b = question_count - count_a
    else:
        question_count = count_a + count_b

    # Section A: JD-based
    questions_a = []
    logs_a = ""
    cmd_a = ""
    if count_a > 0:
        prompt_a = build_section_a_prompt(
            jd_text=jd_text,
            difficulty=difficulty,
            question_count=count_a,
            candidate_name=candidate_name,
            repositories=repositories,
        )
        json_a, cmd_a, logs_a = call_bob(prompt_a)
        questions_a = _parse_questions(json_a, "A")

    # Section B: Resume-based (Behaviour)
    questions_b = []
    logs_b = ""
    cmd_b = ""
    if count_b > 0:
        prompt_b = build_section_b_prompt(
            resume_text=resume_text,
            difficulty=difficulty,
            question_count=count_b,
            candidate_name=candidate_name,
            repositories=repositories,
        )
        json_b, cmd_b, logs_b = call_bob(prompt_b)
        questions_b = _parse_questions(json_b, "B")

    combined_logs = (
        f"[system] Repositories: {repo_summary}\n\n"
        f"=== SECTION A ({count_a} questions — JD-based) ===\n{logs_a}\n\n"
        f"=== SECTION B ({count_b} questions — Resume-based) ===\n{logs_b}"
    )

    return {
        "questions":        questions_a + questions_b,
        "section_a":        questions_a,
        "section_b":        questions_b,
        "count_a":          count_a,
        "count_b":          count_b,
        "bob_command":      cmd_a or cmd_b or "bob",
        "bob_logs":         combined_logs,
        "repositories_used": repo_names,
    }

def generate_quiz_questions(difficulty: str = "medium", data_dir: str = DATA_DIR_COMPLIANCE) -> dict:
    doc_to_chunks = load_and_chunk_all_documents(data_dir)
    if not doc_to_chunks:
        raise ValueError(f"No documents found in {data_dir}")
    selected_chunks = sample_diverse_chunks(doc_to_chunks, target_count=10)
    prompt = build_prompt(selected_chunks, difficulty, question_count=10)
    json_data, raw_command, stdout_full = call_bob(prompt)
    try:
        questions = json.loads(json_data)
        if not isinstance(questions, list):
            raise ValueError("Parsed JSON is not a list")
    except Exception as e:
        raise ValueError(f"Failed to parse quiz JSON: {str(e)}\nRaw JSON: {json_data}")
        
    # Programmatically randomize the correct option index to avoid "Always Option A (index 0)" bias
    for q in questions:
        options = q.get("options", [])
        ans_idx = q.get("answer_index", 0)
        if options and isinstance(options, list) and isinstance(ans_idx, int) and 0 <= ans_idx < len(options):
            new_ans_idx = random.randint(0, len(options) - 1)
            if new_ans_idx != ans_idx:
                options[ans_idx], options[new_ans_idx] = options[new_ans_idx], options[ans_idx]
                q["answer_index"] = new_ans_idx
                
    return {"questions": questions, "bob_command": raw_command, "bob_logs": stdout_full}
