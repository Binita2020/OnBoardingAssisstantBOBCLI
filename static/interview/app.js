// ── app.js — Interviewer Portal ───────────────────────────────────────────────

// ── State ─────────────────────────────────────────────────────────────────────
let activeDifficulty = 'medium';
let activeQuestionCount = 10;
let activeBehaviourCount = 0;
let resumeFile = null;
let jdFile = null;
let generatedToken = null;
let generatedCandidateName = '';
let generatedQuestionCount = 0;

// ── Screens ───────────────────────────────────────────────────────────────────
const screens = {
    setup:   document.getElementById('setup-screen'),
    loading: document.getElementById('loading-screen'),
    link:    document.getElementById('link-screen'),
};

function showScreen(screenId) {
    Object.keys(screens).forEach(key => screens[key].classList.remove('active'));
    screens[screenId].classList.add('active');
}

// ── Difficulty selector ───────────────────────────────────────────────────────
function selectDifficulty(level) {
    activeDifficulty = level;
    document.querySelectorAll('.difficulty-box').forEach(box => box.classList.remove('active'));
    const selected = document.querySelector(`.difficulty-box.${level}`);
    if (selected) selected.classList.add('active');
}

// ── Question count selector ───────────────────────────────────────────────────
function selectQuestionCount(count) {
    activeQuestionCount = count;
    document.querySelectorAll('.q-count-box').forEach(box => box.classList.remove('active'));
    const selected = document.querySelector(`.q-count-box[data-count="${count}"]`);
    if (selected) selected.classList.add('active');
}

function selectBehaviourCount(count) {
    activeBehaviourCount = count;
    document.querySelectorAll('.behaviour-count-box').forEach(box => box.classList.remove('active'));
    const selected = document.querySelector(`.behaviour-count-box[data-count="${count}"]`);
    if (selected) selected.classList.add('active');
}

// ── File upload handler ───────────────────────────────────────────────────────
function handleFileSelect(type) {
    const fileInput = document.getElementById(type === 'resume' ? 'resume-file' : 'jd-file');
    const labelEl = document.getElementById(type === 'resume' ? 'resume-label' : 'jd-label');
    const dropZone = document.getElementById(type === 'resume' ? 'resume-drop' : 'jd-drop');

    const file = fileInput.files[0];
    if (!file) return;

    if (type === 'resume') {
        resumeFile = file;
    } else {
        jdFile = file;
    }

    labelEl.textContent = `✓ ${file.name}`;
    dropZone.classList.add('file-selected');
}

// ── Form validation ───────────────────────────────────────────────────────────
function showFormError(msg) {
    const errEl = document.getElementById('form-error');
    errEl.textContent = msg;
    errEl.style.display = 'block';
    errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideFormError() {
    const errEl = document.getElementById('form-error');
    errEl.style.display = 'none';
}

// ── Create assessment ─────────────────────────────────────────────────────────
async function createAssessment() {
    hideFormError();

    const interviewerName  = document.getElementById('interviewer-name').value.trim();
    const interviewerEmail = document.getElementById('interviewer-email').value.trim();
    const candidateName    = document.getElementById('candidate-name').value.trim();
    const candidateEmail   = document.getElementById('candidate-email').value.trim();

    if (!interviewerName)  return showFormError('Please enter the interviewer full name.');
    if (!interviewerEmail) return showFormError('Please enter the interviewer IBM email ID.');
    if (!candidateName)    return showFormError('Please enter the candidate full name.');
    if (!candidateEmail)   return showFormError('Please enter the candidate email ID.');
    if (!resumeFile)       return showFormError('Please upload the candidate resume.');
    if (!jdFile)           return showFormError('Please upload the job description.');

    // Switch to loading screen
    showScreen('loading');
    const statusText   = document.getElementById('loading-status');
    const commandText  = document.getElementById('terminal-command');
    const outputPre    = document.getElementById('terminal-output');

    statusText.textContent = 'Parsing resume and job description...';
    const totalQs = activeQuestionCount + activeBehaviourCount;
    commandText.textContent = `bob --hide-intermediary-output --output-format json --chat-mode ask < [Resume+JD prompt @ ${activeDifficulty.toUpperCase()}, ${totalQs}Q]`;
    outputPre.textContent = `[system] Reading uploaded resume: ${resumeFile.name}\n[system] Reading uploaded JD: ${jdFile.name}\n[system] Launching IBM BOB CLI...\n[system] Awaiting response...`;

    let dots = 0;
    const waitInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        statusText.textContent = `IBM BOB is generating ${totalQs} personalised questions${'.'.repeat(dots)}`;
    }, 500);

    try {
        const formData = new FormData();
        formData.append('interviewer_name',  interviewerName);
        formData.append('interviewer_email', interviewerEmail);
        formData.append('candidate_name',    candidateName);
        formData.append('candidate_email',   candidateEmail);
        formData.append('difficulty',        activeDifficulty);
        formData.append('question_count',    activeQuestionCount);
        formData.append('behaviour_count',   activeBehaviourCount);
        formData.append('resume',            resumeFile,       resumeFile.name);
        formData.append('job_description',   jdFile,           jdFile.name);

        const response = await fetch('/api/interview/create', {
            method: 'POST',
            body: formData,
        });

        clearInterval(waitInterval);

        const data = await response.json();

        if (!response.ok) {
            // Show error in terminal and add back button
            statusText.textContent = 'Generation Failed!';
            statusText.style.color = 'var(--accent-red)';
            outputPre.textContent += `\n\n[ERROR] ${data.error || 'Unknown error'}\n${data.bob_logs || ''}`;
            addBackButton(statusText.style);
            return;
        }

        generatedToken = data.token;
        generatedCandidateName = data.candidate_name;
        generatedQuestionCount = data.question_count;

        // Typewrite logs then show link screen
        commandText.textContent = data.bob_command;
        typeTerminalOutput(data.bob_logs, () => {
            setTimeout(() => showLinkScreen(data), 800);
        });

    } catch (err) {
        clearInterval(waitInterval);
        statusText.textContent = 'Network Error!';
        statusText.style.color = 'var(--accent-red)';
        outputPre.textContent += `\n\n[FATAL] ${err.message}`;
        addBackButton();
    }
}

function addBackButton() {
    // Avoid adding duplicate buttons
    if (document.getElementById('err-back-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'err-back-btn';
    btn.className = 'btn btn-secondary';
    btn.style.marginTop = '1.5rem';
    btn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back to Setup';
    btn.onclick = () => {
        showScreen('setup');
        document.getElementById('loading-status').style.color = '';
        btn.remove();
    };
    document.querySelector('.loading-container').appendChild(btn);
}

function typeTerminalOutput(logs, callback) {
    const outputEl = document.getElementById('terminal-output');
    const lines = (logs || '').split('\n');
    outputEl.textContent = '';
    let lineIdx = 0;

    function printNext() {
        if (lineIdx < lines.length) {
            outputEl.textContent += lines[lineIdx] + '\n';
            outputEl.scrollTop = outputEl.scrollHeight;
            lineIdx++;
            setTimeout(printNext, Math.random() * 20 + 5);
        } else {
            if (callback) callback();
        }
    }
    printNext();
}

// ── Link screen ───────────────────────────────────────────────────────────────
function showLinkScreen(data) {
    showScreen('link');

    const assessmentUrl = `${window.location.origin}/assessment/${data.token}`;

    document.getElementById('assessment-link-text').textContent = assessmentUrl;
    document.getElementById('link-candidate-name').textContent = data.candidate_name;
    document.getElementById('lm-candidate').textContent = data.candidate_name;
    document.getElementById('lm-qcount').textContent = `${data.question_count} Questions`;
    document.getElementById('lm-difficulty').textContent = activeDifficulty.charAt(0).toUpperCase() + activeDifficulty.slice(1);

    // Show repositories used
    const repos = data.repositories_used || [];
    if (repos.length > 0) {
        const repoBlock = document.getElementById('repos-used-block');
        const repoList  = document.getElementById('repos-used-list');
        repoBlock.style.display = 'block';
        repoList.innerHTML = repos.map(r => {
            const name = r.replace(' Knowledge Repository.md', '').replace('.md', '');
            return `<span class="repo-tag">${name}</span>`;
        }).join('');
    }

    // Type logs into link screen terminal
    document.getElementById('link-terminal-command').textContent = data.bob_command;
    const linkOutput = document.getElementById('link-terminal-output');
    linkOutput.textContent = data.bob_logs || '';
}

function copyAssessmentLink() {
    const linkText = document.getElementById('assessment-link-text').textContent;
    navigator.clipboard.writeText(linkText).then(() => {
        const confirm = document.getElementById('copy-confirm');
        confirm.style.display = 'flex';
        setTimeout(() => { confirm.style.display = 'none'; }, 2500);
    });
}

function downloadResults() {
    const interviewerEmail = document.getElementById('interviewer-email').value.trim();
    if (!interviewerEmail) {
        alert('Interviewer email not found. Please go back to setup.');
        return;
    }
    window.location.href = `/api/results/download?interviewer_email=${encodeURIComponent(interviewerEmail)}`;
}

function createAnother() {
    // Reset state
    resumeFile = null;
    jdFile = null;
    generatedToken = null;
    activeDifficulty = 'medium';
    activeQuestionCount = 10;
    activeBehaviourCount = 0;

    document.getElementById('resume-label').textContent = 'Click to upload resume (PDF, DOCX, TXT)';
    document.getElementById('jd-label').textContent = 'Click to upload JD (PDF, DOCX, TXT)';
    document.getElementById('resume-drop').classList.remove('file-selected');
    document.getElementById('jd-drop').classList.remove('file-selected');
    document.getElementById('resume-file').value = '';
    document.getElementById('jd-file').value = '';
    document.getElementById('interviewer-name').value = '';
    document.getElementById('candidate-name').value = '';
    document.getElementById('candidate-email').value = '';

    // Reset difficulty and count visuals
    document.querySelectorAll('.difficulty-box').forEach(b => b.classList.remove('active'));
    document.querySelector('.difficulty-box.medium').classList.add('active');
    document.querySelectorAll('.q-count-box').forEach(b => b.classList.remove('active'));
    document.querySelector('.q-count-box[data-count="10"]').classList.add('active');
    document.querySelectorAll('.behaviour-count-box').forEach(b => b.classList.remove('active'));
    document.querySelector('.behaviour-count-box[data-count="0"]').classList.add('active');

    document.getElementById('loading-status').style.color = '';
    const errBtn = document.getElementById('err-back-btn');
    if (errBtn) errBtn.remove();

    showScreen('setup');
}
