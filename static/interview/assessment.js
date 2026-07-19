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

// ── Webcam & Recording State ──────────────────────────────────────────────────
let cameraStream      = null;   // live stream object
let mediaRecorder     = null;   // MediaRecorder object
let recordedChunks    = [];     // collected video buffer chunks
let isCameraActive    = false;  // validation flag
let videoUploadStatus = "N/A";  // status string to submit in results

// ── Timer State ───────────────────────────────────────────────────────────────
let assessmentTimer   = null;   // interval timer handle
let secondsRemaining  = 0;      // time remaining in seconds

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

        // Dynamic instructions generation sharing section questions and time limits
        const instructionsText = document.getElementById('instructions-text-details');
        if (instructionsText) {
            instructionsText.innerHTML = `
                <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem;">Test Structure</h3>
                <ul style="margin-left: 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    <li><strong>Section A (Job Description):</strong> ${countA} Questions (Time Limit: ${countA} Minutes). Evaluates your technical alignment with core skills.</li>
                    <li><strong>Section B (Resume Questions):</strong> ${countB} Questions (Time Limit: ${countB} Minutes). Custom-generated questions analyzing your CV.</li>
                </ul>

                <h3 style="font-size: 1.1rem; font-weight: 700; color: #da1e28; margin-bottom: 0.75rem;">
                    <i class="fa-solid fa-circle-exclamation" style="margin-right: 0.25rem;"></i> Anti-Cheat &amp; Compliance Policy
                </h3>
                <p style="margin-bottom: 1rem;">
                    This platform monitors tab activity, window focus, and utilizes your webcam to ensure a fair assessment:
                </p>
                <ul style="margin-left: 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    <li><strong style="color: #ea580c;">Webcam Monitoring:</strong> You must enable your camera. The test is recorded in full screen, and the video file is uploaded to our servers upon completion.</li>
                    <li><strong style="color: #ea580c;">Fullscreen &amp; Tab-Switching:</strong> The test runs in forced full-screen mode. Exiting full-screen or switching tabs is strictly prohibited. The first offence triggers a warning, and the second offence terminates the assessment instantly.</li>
                </ul>
            `;
        }

        showScreen('instructions');
        initWebcamAccess();

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
    // Request full screen
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => {
            console.warn("Fullscreen request failed:", err);
        });
    }
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
    
    // Setup Timer for Section A
    secondsRemaining = countA * 60; // 1 minute per question
    updateTimerUI();
    startCountdownTimer();

    // Setup Webcam Feed and MediaRecorder
    setupActiveCameraPreview();
    startRecordingVideo();

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
        if (assessmentTimer) {
            clearInterval(assessmentTimer);
            assessmentTimer = null;
        }
        detachAntiCheat();
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
    
    // Setup Timer for Section B
    secondsRemaining = countB * 60; // 1 minute per question
    updateTimerUI();
    startCountdownTimer();

    attachAntiCheat();
    showScreen('quiz');
    renderQuestion();
}

// ── Submission ────────────────────────────────────────────────────────────────
async function submitAssessment(terminated = false, expired = false) {
    detachAntiCheat();

    if (assessmentTimer) {
        clearInterval(assessmentTimer);
        assessmentTimer = null;
    }

    // Exit fullscreen
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.warn(err));
    }

    // Hide floating video stream preview
    const floatCam = document.getElementById('floating-camera-container');
    if (floatCam) floatCam.classList.remove('visible');

    // Stop setup camera stream
    const setupVideo = document.getElementById('setup-camera-stream');
    if (setupVideo) setupVideo.srcObject = null;

    // Stop video recording and get blob
    let videoBlob = null;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        const stopRecordingPromise = new Promise((resolve) => {
            mediaRecorder.onstop = () => {
                videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
                resolve();
            };
        });
        mediaRecorder.stop();
        
        // Show progress
        showScreen('submitting');
        const subTitle = document.querySelector('#submitting-screen h2');
        const subText = document.querySelector('#submitting-screen p');
        if (subTitle) subTitle.textContent = "Processing Recording...";
        if (subText) subText.textContent = "Compiling and optimizing candidate webcam feed. Please wait...";
        
        await stopRecordingPromise;
    }

    // Stop webcam tracks to release camera
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

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
    } else if (expired) {
        showScreen('thankyou');
        const thankyouIcon = document.querySelector('.thankyou-icon i');
        if (thankyouIcon) {
            thankyouIcon.className = 'fa-regular fa-clock';
            thankyouIcon.style.color = '#da1e28';
        }
        const thankyouTitle = document.querySelector('.thankyou-container h2');
        if (thankyouTitle) thankyouTitle.textContent = 'Time Expired';
        const thankyouMsg = document.querySelector('.thankyou-message');
        if (thankyouMsg) {
            thankyouMsg.textContent = 'Your assessment time has run out. Your responses have been automatically saved and submitted.';
        }
        const thankyouName = document.getElementById('thankyou-name');
        if (thankyouName) thankyouName.style.display = 'none';
    } else {
        showScreen('submitting');
        const subTitle = document.querySelector('#submitting-screen h2');
        const subText = document.querySelector('#submitting-screen p');
        if (subTitle) subTitle.textContent = "Submitting Your Assessment";
        if (subText) subText.textContent = "Please wait while we securely record your responses...";
    }

    // Upload video if captured
    if (videoBlob && isCameraActive) {
        const uploadProgressTitle = document.querySelector('#submitting-screen h2');
        if (uploadProgressTitle && !terminated && !expired) {
            uploadProgressTitle.textContent = "Uploading Video Logs...";
        }
        
        const formData = new FormData();
        formData.append('video', videoBlob, 'assessment_video.webm');
        
        try {
            const uploadRes = await fetch(`/api/assessment/${ASSESSMENT_TOKEN}/upload_video`, {
                method: 'POST',
                body: formData
            });
            if (uploadRes.ok) {
                videoUploadStatus = "Recorded & Saved";
            } else {
                videoUploadStatus = "Upload Error";
            }
        } catch (err) {
            console.error("Video upload failed:", err);
            videoUploadStatus = "Upload Network Error";
        }
    }

    try {
        const response = await fetch(`/api/assessment/${ASSESSMENT_TOKEN}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                answers: selectedAnswers, 
                terminated: terminated,
                video_status: videoUploadStatus 
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Submission error:', data.detail);
        }

        if (!terminated && !expired) {
            showThankYou();
        }

    } catch (err) {
        console.error('Submission network error:', err);
        if (!terminated && !expired) {
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
    // Put them back in fullscreen mode!
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => console.warn(err));
    }
}

// Attach / Detach Listeners
function attachAntiCheat() {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
}

function detachAntiCheat() {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    hideWarningOverlay();
}

function handleFullscreenChange() {
    if (!isQuizActive()) return;
    // Exiting fullscreen is treated as a focus lost violation
    if (!document.fullscreenElement) {
        onFocusLost();
    }
}

// ── Webcam & Recording Handlers ────────────────────────────────────────────────
async function initWebcamAccess() {
    const statusMsg = document.getElementById('camera-status-msg');
    const setupVideo = document.getElementById('setup-camera-stream');
    const placeholder = document.getElementById('setup-camera-placeholder');
    const startBtn = document.getElementById('btn-start-test');

    if (statusMsg) statusMsg.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Requesting camera access...';
    
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        isCameraActive = true;
        videoUploadStatus = "Recorded";
        
        if (statusMsg) {
            statusMsg.style.color = 'var(--accent-green)';
            statusMsg.innerHTML = '<i class="fa-solid fa-circle-check"></i> Camera online. Permissions verified.';
        }
        
        if (setupVideo) {
            setupVideo.srcObject = cameraStream;
            setupVideo.style.display = 'block';
        }
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        if (startBtn) {
            startBtn.removeAttribute('disabled');
        }
    } catch (err) {
        isCameraActive = false;
        videoUploadStatus = "Failed / Denied";
        console.error("Camera access failed:", err);
        if (statusMsg) {
            statusMsg.style.color = 'var(--ibm-red)';
            statusMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Camera access denied or not found. You must grant camera access to take the assessment.';
        }
        if (startBtn) {
            startBtn.setAttribute('disabled', 'true');
        }
    }
}

function setupActiveCameraPreview() {
    const activeVideo = document.getElementById('active-camera-stream');
    const container = document.getElementById('floating-camera-container');
    if (cameraStream && activeVideo) {
        activeVideo.srcObject = cameraStream;
        if (container) container.classList.add('visible');
    }
}

function startRecordingVideo() {
    if (!cameraStream || !isCameraActive) return;
    recordedChunks = [];
    try {
        mediaRecorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm' });
        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        mediaRecorder.start(1000); // Collect chunk slices every 1 second
    } catch (err) {
        console.error("MediaRecorder start failed:", err);
        videoUploadStatus = "Recording Error";
    }
}

// ── Timer Handlers ────────────────────────────────────────────────────────────
function startCountdownTimer() {
    if (assessmentTimer) clearInterval(assessmentTimer);
    assessmentTimer = setInterval(() => {
        secondsRemaining--;
        updateTimerUI();
        if (secondsRemaining <= 0) {
            clearInterval(assessmentTimer);
            assessmentTimer = null;
            
            if (currentSection === 'A' && countB > 0) {
                alert("Section A time has expired. Moving to Section B.");
                detachAntiCheat();
                showScreen('sectionBreak');
                const countBEl = document.getElementById('sbc-count-b');
                if (countBEl) countBEl.textContent = `${countB} questions`;
            } else {
                submitAssessment(false, true); // (terminated = false, expired = true)
            }
        }
    }, 1000);
}

function updateTimerUI() {
    const timerText = document.getElementById('quiz-timer-text');
    if (!timerText) return;
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    timerText.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const container = document.getElementById('quiz-timer-container');
    if (container) {
        if (secondsRemaining < 60) {
            container.style.color = 'var(--ibm-red)';
        } else {
            container.style.color = '#da1e28';
        }
    }
}
