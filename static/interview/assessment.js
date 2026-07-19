// ── assessment.js — Candidate Assessment Page ────────────────────────────────
// ASSESSMENT_TOKEN is injected by the HTML page before this script loads.

// ── State ─────────────────────────────────────────────────────────────────────
let sectionAQuestions = [];   // Section A — JD-based
let sectionBQuestions = [];   // Section B — Resume-based
let allQuestions      = [];   // flat merged list (A first, then B)
let selectedAnswers   = {};   // global index → selected option index
let activeQuestionIndex = 0;
let totalQuestions    = 0;
let countA = 0;
let countB = 0;
let currentSection = 'A';     // 'A' or 'B'
let quizDifficulty  = 'medium';
let candidateName   = '';

// ── Anti-Cheat State ──────────────────────────────────────────────────────────
let tabSwitchCount    = 0;    // number of times the candidate left the screen
let quizTerminated    = false; // true once the quiz has been force-ended
let warningCountdown  = null; // interval handle for the warning timer
let lastFocusLostTime = 0;    // timestamp of the last focus lost event to prevent double-firing

// ── Screens ───────────────────────────────────────────────────────────────────
const screens = {
    verify:        document.getElementById('verify-screen'),
    instructions:  document.getElementById('instructions-screen'),
    quiz:          document.getElementById('quiz-screen'),
    sectionBreak:  document.getElementById('section-break-screen'),
    submitting:    document.getElementById('submitting-screen'),
    thankyou:      document.getElementById('thankyou-screen'),
};

function showScreen(id) {
    Object.keys(screens).forEach(k => screens[k].classList.remove('active'));
    screens[id].classList.add('active');
}

// ── Identity verification ─────────────────────────────────────────────────────
async function verifyIdentity() {
    const nameInput  = document.getElementById('verify-name');
    const emailInput = document.getElementById('verify-email');
    const dobInput   = document.getElementById('verify-dob');
    const expInput   = document.getElementById('verify-experience');
    const errEl      = document.getElementById('verify-error');
    const btn        = document.getElementById('btn-verify');

    const name  = nameInput.value.trim();
    const email = emailInput.value.trim();
    const dob   = dobInput.value;
    const exp   = expInput.value.trim();

    errEl.style.display = 'none';

    if (!name)  { showVerifyError('Please enter your full name.'); return; }
    if (!email) { showVerifyError('Please enter your email address.'); return; }
    if (!dob)   { showVerifyError('Please enter your date of birth.'); return; }
    if (!exp)   { showVerifyError('Please enter your years of experience.'); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin btn-icon"></i> Verifying...';

    try {
        const response = await fetch(`/api/assessment/${ASSESSMENT_TOKEN}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, dob, experience: exp }),
        });

        const data = await response.json();

        if (!response.ok) {
            showVerifyError(data.detail || 'Verification failed. Please check your details.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Verify &amp; Proceed to Assessment';
            return;
        }

        // Store section data
        sectionAQuestions = data.section_a || data.questions.slice(0, data.count_a);
        sectionBQuestions = data.section_b || data.questions.slice(data.count_a);
        allQuestions      = data.questions;
        countA            = data.count_a || sectionAQuestions.length;
        countB            = data.count_b || sectionBQuestions.length;
        totalQuestions    = allQuestions.length;
        quizDifficulty    = data.difficulty;
        candidateName     = data.candidate_name;

        showScreen('instructions');

    } catch (err) {
        showVerifyError('Network error. Please try again.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Verify &amp; Proceed to Assessment';
    }
}

function showVerifyError(msg) {
    const errEl = document.getElementById('verify-error');
    const textEl = document.getElementById('verify-error-text');
    if (textEl) {
        textEl.textContent = msg;
    } else {
        errEl.textContent = msg;
    }
    errEl.style.display = 'flex';
}

// ── Quiz player ───────────────────────────────────────────────────────────────
function startAssessment() {
    initializeQuizPlayer();
}

function initializeQuizPlayer() {
    selectedAnswers     = {};
    activeQuestionIndex = 0;
    currentSection      = 'A';
    tabSwitchCount      = 0;
    quizTerminated      = false;
    lastFocusLostTime   = 0;
    updateSectionBanner('A');
    attachAntiCheat();
    showScreen('quiz');
    renderQuestion();
}

function updateSectionBanner(section) {
    const banner    = document.getElementById('section-banner');
    const pill      = document.getElementById('section-pill');
    const title     = document.getElementById('section-banner-title');
    const sub       = document.getElementById('section-banner-sub');
    const card      = document.getElementById('question-card');

    banner.classList.remove('section-a-banner', 'section-b-banner');
    card.classList.remove('section-a-card', 'section-b-card');

    if (section === 'A') {
        banner.classList.add('section-a-banner');
        card.classList.add('section-a-card');
        pill.textContent  = 'Section A';
        title.textContent = 'Job Description Questions';
        sub.textContent   = `Questions based strictly on the Job Description (${countA} questions)`;
    } else {
        banner.classList.add('section-b-banner');
        card.classList.add('section-b-card');
        pill.textContent  = 'Section B';
        title.textContent = 'Resume Questions';
        sub.textContent   = `Questions based strictly on your Resume (${countB} questions)`;
    }
}

function renderQuestion() {
    const q = allQuestions[activeQuestionIndex];

    // Determine section
    const section = activeQuestionIndex < countA ? 'A' : 'B';
    if (section !== currentSection) {
        currentSection = section;
        updateSectionBanner(section);
    }

    // Within-section display index
    const sectionIdx   = section === 'A' ? activeQuestionIndex : activeQuestionIndex - countA;
    const sectionTotal = section === 'A' ? countA : countB;

    // Global progress
    const percent = ((activeQuestionIndex + 1) / totalQuestions) * 100;
    document.getElementById('quiz-progress-fill').style.width = `${percent}%`;
    document.getElementById('quiz-progress-text').textContent =
        `Question ${activeQuestionIndex + 1} of ${totalQuestions}`;
    document.getElementById('quiz-difficulty-label').textContent =
        `Difficulty: ${quizDifficulty.charAt(0).toUpperCase() + quizDifficulty.slice(1)}`;

    // Question number badge
    document.getElementById('display-q-number').textContent = activeQuestionIndex + 1;

    // Source tag
    const skill    = q.skill        || '';
    const domain   = q.domain       || q.source_doc || 'Assessment';
    const qtype    = q.question_type || '';
    let sourceTag  = domain;
    if (skill)  sourceTag = `${skill} · ${domain}`;
    if (qtype)  sourceTag += ` · ${qtype}`;
    document.getElementById('display-q-source').textContent = sourceTag;

    // Question text
    document.getElementById('display-q-text').textContent = q.question;

    // Options
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    q.options.forEach((optText, idx) => {
        const letter     = String.fromCharCode(65 + idx);
        const isSelected = selectedAnswers[activeQuestionIndex] === idx;
        const card       = document.createElement('div');
        card.className   = `option-card${isSelected ? ' selected' : ''}`;
        card.onclick     = () => selectOption(idx);
        card.innerHTML   = `
            <span class="option-letter">${letter}</span>
            <span class="option-text">${optText}</span>
        `;
        container.appendChild(card);
    });

    // Navigation button state
    const prevBtn    = document.getElementById('btn-prev-question');
    const nextBtn    = document.getElementById('btn-next-question');
    prevBtn.disabled = (activeQuestionIndex === 0);

    const hasSelected = selectedAnswers[activeQuestionIndex] !== undefined;
    nextBtn.disabled  = !hasSelected;

    const isLastAll  = (activeQuestionIndex === totalQuestions - 1);

    if (isLastAll) {
        nextBtn.innerHTML = 'Submit Assessment <i class="fa-solid fa-paper-plane" style="margin-left:0.5rem;"></i>';
    } else {
        nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right" style="margin-left:0.5rem;"></i>';
    }

    // Reason hint
    const reasonEl = document.getElementById('question-reason');
    if (reasonEl) {
        if (q.reason) {
            reasonEl.textContent = `\u{1F4A1} ${q.reason}`;
            reasonEl.style.display = 'block';
        } else {
            reasonEl.style.display = 'none';
        }
    }
}

function selectOption(idx) {
    selectedAnswers[activeQuestionIndex] = idx;
    renderQuestion();
}

function prevQuestion() {
    if (activeQuestionIndex > 0) {
        activeQuestionIndex--;
        // If jumping back from section B into section A, update banner
        if (activeQuestionIndex < countA && currentSection === 'B') {
            currentSection = 'A';
            updateSectionBanner('A');
        }
        renderQuestion();
    }
}

function nextQuestion() {
    const isLastAll = (activeQuestionIndex === totalQuestions - 1);

    if (isLastAll) {
        submitAssessment();
    } else if (activeQuestionIndex === countA - 1 && countB > 0) {
        showScreen('sectionBreak');
        const countBEl = document.getElementById('sbc-count-b');
        if (countBEl) countBEl.textContent = `${countB} questions`;
    } else {
        activeQuestionIndex++;
        renderQuestion();
    }
}

function startSectionB() {
    activeQuestionIndex = countA;   // first question of section B
    currentSection      = 'B';
    updateSectionBanner('B');
    showScreen('quiz');
    renderQuestion();
}

// ── Submission ────────────────────────────────────────────────────────────────
async function submitAssessment(terminated = false) {
    detachAntiCheat();

    if (terminated) {
        showScreen('thankyou');
        const thankyouIcon = document.querySelector('.thankyou-icon i');
        if (thankyouIcon) {
            thankyouIcon.className = 'fa-solid fa-ban';
            thankyouIcon.style.color = '#da1e28';
        }
        const thankyouTitle = document.querySelector('.thankyou-container h2');
        if (thankyouTitle) thankyouTitle.textContent = 'Assessment Terminated';
        const thankyouMsg = document.querySelector('.thankyou-message');
        if (thankyouMsg) {
            thankyouMsg.textContent = 'Your assessment has been terminated due to leaving the quiz window. This attempt has been recorded.';
        }
        const thankyouName = document.getElementById('thankyou-name');
        if (thankyouName) thankyouName.style.display = 'none';
    } else {
        showScreen('submitting');
    }

    try {
        const response = await fetch(`/api/assessment/${ASSESSMENT_TOKEN}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: selectedAnswers, terminated: terminated }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Still show thank-you — don't expose errors to candidate
            console.error('Submission error:', data.detail);
        }

        if (!terminated) {
            showThankYou();
        }

    } catch (err) {
        console.error('Submission network error:', err);
        if (!terminated) {
            showThankYou();
        }
    }
}

function showThankYou() {
    showScreen('thankyou');
    const nameEl = document.getElementById('thankyou-name');
    if (nameEl) {
        nameEl.style.display = 'block';
        nameEl.textContent = candidateName ? `Great effort, ${candidateName}!` : 'Great effort!';
    }
}

// ── Anti-Cheat Engine ─────────────────────────────────────────────────────────
function isQuizActive() {
    return screens.quiz.classList.contains('active') && !quizTerminated;
}

function showWarningOverlay(secondsLeft) {
    const overlay = document.getElementById('anticheat-overlay');
    const countEl = document.getElementById('anticheat-countdown');
    if (overlay) overlay.classList.add('visible');
    if (countEl) countEl.textContent = secondsLeft;
}

function hideWarningOverlay() {
    const overlay = document.getElementById('anticheat-overlay');
    if (overlay) overlay.classList.remove('visible');
    if (warningCountdown) {
        clearInterval(warningCountdown);
        warningCountdown = null;
    }
}

function terminateQuiz() {
    if (quizTerminated) return;
    quizTerminated = true;
    hideWarningOverlay();
    submitAssessment(true); // true = terminated
}

function handleVisibilityChange() {
    if (!isQuizActive()) return;
    if (document.visibilityState === 'hidden') onFocusLost();
}

function handleWindowBlur() {
    if (!isQuizActive()) return;
    onFocusLost();
}

function onFocusLost() {
    if (quizTerminated) return;

    // Time throttle: ignore multiple events within 1.5 seconds
    const now = Date.now();
    if (now - lastFocusLostTime < 1500) return;
    lastFocusLostTime = now;

    // Overlay check: if warning overlay is already visible, ignore
    const overlay = document.getElementById('anticheat-overlay');
    if (overlay && overlay.classList.contains('visible')) return;

    tabSwitchCount++;

    if (tabSwitchCount === 1) {
        // First offence — show warning with 10-second countdown
        let secs = 10;
        showWarningOverlay(secs);
        warningCountdown = setInterval(() => {
            secs--;
            const countEl = document.getElementById('anticheat-countdown');
            if (countEl) countEl.textContent = secs;
            if (secs <= 0) {
                clearInterval(warningCountdown);
                warningCountdown = null;
                terminateQuiz();
            }
        }, 1000);
    } else {
        // Second offence — terminate immediately
        terminateQuiz();
    }
}

function dismissWarning() {
    // Candidate clicked "I understand" — hide overlay, strike already counted
    hideWarningOverlay();
}

// Attach / Detach Listeners
function attachAntiCheat() {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
}

function detachAntiCheat() {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    hideWarningOverlay();
}
