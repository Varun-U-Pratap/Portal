/**
 * Resurgence Portal – app.js
 * Vanilla JS 4-step wizard state machine.
 * Uses Fetch API for all server communication (no page reloads).
 */

'use strict';

// ══════════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════════
const state = {
    currentStep: 1,
    totalSteps: 4,

    // Identity (step 1)
    name: '',
    usn: '',
    semester: '',
    deptId: '',
    deptName: '',

    // Subject selection (step 2)
    allSubjects: [],   // [{subject_code, subject_name, credits}]
    selectedSubjects: new Set(),  // Set of subject_code strings

    // Result (step 4)
    studentId: null,
};

// ══════════════════════════════════════════════════════════════
// DOM REFERENCES
// ══════════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);

const els = {
    progressBar: $('progress-bar'),
    steps: [1, 2, 3, 4].map(n => $(`step-${n}`)),
    dots: [1, 2, 3, 4].map(n => $(`dot-${n}`)),
    lines: [1, 2, 3].map(n => $(`line-${n}`)),

    // Step 1
    inpName: $('inp-name'),
    inpUsn: $('inp-usn'),
    inpSemester: $('inp-semester'),
    inpDept: $('inp-dept'),
    btnToStep2: $('btn-to-step2'),
    errName: $('err-name'),
    errUsn: $('err-usn'),
    errSemester: $('err-semester'),
    errDept: $('err-dept'),

    // Step 2
    subjectsGrid: $('subjects-grid'),
    selectionBadge: $('selection-badge'),
    deptSubtitle: $('dept-subtitle'),
    errSubjects: $('err-subjects'),
    btnToStep3: $('btn-to-step3'),
    btnBack1: $('btn-back-1'),

    // Step 3
    sumName: $('sum-name'),
    sumUsn: $('sum-usn'),
    sumDept: $('sum-dept'),
    sumSem: $('sum-sem'),
    sumCount: $('sum-count'),
    sumSubjects: $('sum-subjects'),
    regError: $('reg-error'),
    btnConfirm: $('btn-confirm'),
    btnConfirmLabel: $('btn-confirm-label'),
    btnConfirmIcon: $('btn-confirm-icon'),
    btnBack2: $('btn-back-2'),

    // Step 4
    successRegId: $('success-reg-id'),
    successSummary: $('success-summary'),
    btnNewReg: $('btn-new-reg'),

    // Confetti
    successBurst: $('success-burst'),
};

// ══════════════════════════════════════════════════════════════
// STEP NAVIGATION
// ══════════════════════════════════════════════════════════════
function goToStep(n) {
    state.currentStep = n;

    // Hide all panels, show current
    els.steps.forEach((panel, i) => {
        panel.classList.toggle('active', i + 1 === n);
    });

    // Update dots
    els.dots.forEach((dot, i) => {
        const stepNum = i + 1;
        dot.classList.remove('active', 'done');
        if (stepNum < n) dot.classList.add('done');
        else if (stepNum === n) dot.classList.add('active');
    });

    // Update connector lines
    els.lines.forEach((line, i) => {
        line.classList.toggle('done', i + 1 < n);
    });

    // Update step-label text colours
    document.querySelectorAll('.step-label').forEach((label, i) => {
        const stepNum = i + 1;
        label.className = `step-label text-xs font-semibold ${stepNum <= n ? 'text-blue' : 'text-slate-400'
            }`;
    });

    // Progress bar
    const pct = Math.round(((n - 1) / (state.totalSteps - 1)) * 100);
    els.progressBar.style.width = `${Math.max(pct, 10)}%`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ══════════════════════════════════════════════════════════════
function showErr(el, msgEl, show) {
    if (show) {
        el.classList.add('shake');
        el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
        msgEl.classList.remove('hidden');
    } else {
        msgEl.classList.add('hidden');
    }
}

function validateStep1() {
    let ok = true;

    const name = els.inpName.value.trim();
    const usn = els.inpUsn.value.trim();
    const sem = els.inpSemester.value;
    const dept = els.inpDept.value;

    showErr(els.inpName, els.errName, !name);
    showErr(els.inpUsn, els.errUsn, !usn);
    showErr(els.inpSemester, els.errSemester, !sem);
    showErr(els.inpDept, els.errDept, !dept);

    if (!name || !usn || !sem || !dept) ok = false;

    if (ok) {
        state.name = name;
        state.usn = usn;
        state.semester = sem;
        state.deptId = dept;
        state.deptName = els.inpDept.selectedOptions[0]?.text ?? '';
    }
    return ok;
}

// ══════════════════════════════════════════════════════════════
// FETCH: DEPARTMENTS
// ══════════════════════════════════════════════════════════════
async function loadDepartments() {
    try {
        const res = await fetch('api/departments.php');
        const data = await res.json();

        els.inpDept.innerHTML = '<option value="">— Select Department —</option>';
        data.forEach(dept => {
            const opt = document.createElement('option');
            opt.value = dept.id;
            opt.textContent = dept.dept_name;
            els.inpDept.appendChild(opt);
        });
    } catch {
        els.inpDept.innerHTML = '<option value="">Failed to load departments</option>';
    }
}

// ══════════════════════════════════════════════════════════════
// FETCH: SUBJECTS (called when entering step 2)
// ══════════════════════════════════════════════════════════════
async function loadSubjects(deptId, semester) {
    // Show skeleton loaders
    els.subjectsGrid.innerHTML = Array(4).fill(0).map(() => `
    <div class="skeleton h-24 w-full rounded-xl"></div>
  `).join('');

    els.deptSubtitle.textContent = `Showing Semester ${semester} subjects for ${state.deptName}`;

    try {
        const res = await fetch(`api/subjects.php?dept_id=${encodeURIComponent(deptId)}&semester=${encodeURIComponent(semester)}`);
        const data = await res.json();

        state.allSubjects = data;
        renderSubjectCards();
    } catch {
        els.subjectsGrid.innerHTML = `
      <p class="col-span-2 text-center text-red-500 py-8">
        Failed to load subjects. Please go back and try again.
      </p>`;
    }
}

// ══════════════════════════════════════════════════════════════
// RENDER: SUBJECT CARDS
// ══════════════════════════════════════════════════════════════
function renderSubjectCards() {
    if (!state.allSubjects.length) {
        els.subjectsGrid.innerHTML = `
      <p class="col-span-2 text-center text-slate-400 py-8">
        No subjects found for this department.
      </p>`;
        return;
    }

    els.subjectsGrid.innerHTML = state.allSubjects.map(sub => {
        const selected = state.selectedSubjects.has(sub.subject_code);
        return `
      <div
        class="subject-card ${selected ? 'selected' : ''}"
        data-code="${sub.subject_code}"
        role="checkbox"
        aria-checked="${selected}"
        tabindex="0"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <p class="text-slate-900 font-semibold text-sm leading-snug">${escapeHtml(sub.subject_name)}</p>
            <p class="text-xs text-slate-400 mt-1 font-mono">${escapeHtml(sub.subject_code)}</p>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0">
            <div class="check-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" class="w-3.5 h-3.5 ${selected ? '' : 'opacity-0'}">
                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="credit-badge">${sub.credits} cr</span>
          </div>
        </div>
      </div>
    `;
    }).join('');

    // Attach toggle on cards
    els.subjectsGrid.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', () => toggleSubject(card.dataset.code));
        card.addEventListener('keydown', e => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                toggleSubject(card.dataset.code);
            }
        });
    });
}

function toggleSubject(code) {
    if (state.selectedSubjects.has(code)) {
        state.selectedSubjects.delete(code);
    } else {
        state.selectedSubjects.add(code);
    }
    updateBadge();
    renderSubjectCards();  // re-render to reflect selection
    els.errSubjects.classList.add('hidden');
}

function updateBadge() {
    const count = state.selectedSubjects.size;
    els.selectionBadge.textContent = `Selected: ${count}`;
    els.selectionBadge.classList.toggle('has-items', count > 0);
    // Bump animation
    els.selectionBadge.classList.remove('bump');
    void els.selectionBadge.offsetWidth; // reflow
    els.selectionBadge.classList.add('bump');
}

// ══════════════════════════════════════════════════════════════
// RENDER: SUMMARY (step 3)
// ══════════════════════════════════════════════════════════════
function renderSummary() {
    els.sumName.textContent = state.name;
    els.sumUsn.textContent = state.usn;
    els.sumDept.textContent = state.deptName;
    els.sumSem.textContent = `Semester ${state.semester}`;
    els.sumCount.textContent = state.selectedSubjects.size;
    els.regError.classList.add('hidden');

    els.sumSubjects.innerHTML = '';
    state.allSubjects
        .filter(s => state.selectedSubjects.has(s.subject_code))
        .forEach(sub => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0';
            li.innerHTML = `
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#10B981" class="w-4 h-4 shrink-0">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm font-medium text-slate-800">${escapeHtml(sub.subject_name)}</span>
        </div>
        <span class="summary-pill">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3"><path d="M2.5 3A1.5 1.5 0 001 4.5v.793c.026.009.051.02.076.032L7.674 8.51a1.5 1.5 0 001.652 0l6.598-3.185A.755.755 0 0016 5.293V4.5A1.5 1.5 0 0014.5 3h-12z" /><path d="M15 6.954L8.978 9.86a3 3 0 01-2.956 0L1 6.954V11.5A1.5 1.5 0 002.5 13h11a1.5 1.5 0 001.5-1.5V6.954z" /></svg>
          ${escapeHtml(sub.subject_code)}
        </span>
      `;
            els.sumSubjects.appendChild(li);
        });
}

// ══════════════════════════════════════════════════════════════
// POST: REGISTER
// ══════════════════════════════════════════════════════════════
async function submitRegistration() {
    els.btnConfirm.disabled = true;
    els.btnConfirmLabel.textContent = 'Submitting…';
    els.btnConfirmIcon.innerHTML = `
    <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>`;

    try {
        const payload = {
            usn: state.usn,
            name: state.name,
            semester: parseInt(state.semester, 10),
            dept_id: parseInt(state.deptId, 10),
            subjects: [...state.selectedSubjects],
        };

        const res = await fetch('api/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error ?? 'Registration failed.');
        }

        state.studentId = data.student_id;
        showSuccess();

    } catch (err) {
        els.regError.textContent = err.message;
        els.regError.classList.remove('hidden');
    } finally {
        els.btnConfirm.disabled = false;
        els.btnConfirmLabel.textContent = 'Confirm Registration';
        els.btnConfirmIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
      </svg>`;
    }
}

// ══════════════════════════════════════════════════════════════
// SUCCESS SCREEN
// ══════════════════════════════════════════════════════════════
function showSuccess() {
    goToStep(4);

    els.successRegId.textContent = `Registration ID: STU-${String(state.studentId).padStart(5, '0')}`;

    // Subject chips
    els.successSummary.innerHTML = '';
    state.allSubjects
        .filter(s => state.selectedSubjects.has(s.subject_code))
        .forEach(sub => {
            const chip = document.createElement('span');
            chip.className = 'bg-blue-light text-blue rounded-full px-3 py-1 text-sm font-semibold';
            chip.textContent = sub.subject_name;
            els.successSummary.appendChild(chip);
        });

    launchConfetti();
}

// ══════════════════════════════════════════════════════════════
// CONFETTI
// ══════════════════════════════════════════════════════════════
function launchConfetti() {
    const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    els.successBurst.innerHTML = '';

    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.6}s;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
        els.successBurst.appendChild(piece);
    }

    // Clean up after animation
    setTimeout(() => { els.successBurst.innerHTML = ''; }, 4000);
}

// ══════════════════════════════════════════════════════════════
// RESET (new registration)
// ══════════════════════════════════════════════════════════════
function resetWizard() {
    // Reset state
    state.name = '';
    state.usn = '';
    state.semester = '';
    state.deptId = '';
    state.deptName = '';
    state.allSubjects = [];
    state.selectedSubjects = new Set();
    state.studentId = null;

    // Reset form inputs
    els.inpName.value = '';
    els.inpUsn.value = '';
    els.inpSemester.value = '';
    els.inpDept.value = '';

    // Clear errors
    [els.errName, els.errUsn, els.errSemester, els.errDept, els.errSubjects, els.regError]
        .forEach(el => el.classList.add('hidden'));

    els.subjectsGrid.innerHTML = '';
    updateBadge();
    goToStep(1);
}

// ══════════════════════════════════════════════════════════════
// UTILITY
// ══════════════════════════════════════════════════════════════
function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ══════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════════════════════

// Step 1 → Step 2
els.btnToStep2.addEventListener('click', async () => {
    if (!validateStep1()) return;

    goToStep(2);
    // Only fetch subjects if department/semester/usn changed or not yet loaded
    if (!state.allSubjects.length || state._lastDeptId !== state.deptId || state._lastSemester !== state.semester || state._lastUsn !== state.usn) {
        state._lastDeptId = state.deptId;
        state._lastSemester = state.semester;
        state._lastUsn = state.usn;
        state.selectedSubjects.clear();
        
        try {
            const regRes = await fetch(`api/student_registrations.php?usn=${encodeURIComponent(state.usn)}`);
            if (regRes.ok) {
                const regData = await regRes.json();
                if (regData.registered_subjects) {
                    regData.registered_subjects.forEach(code => state.selectedSubjects.add(code));
                }
            }
        } catch (e) {
            console.error('Failed to load previous registrations', e);
        }
        
        updateBadge();
        await loadSubjects(state.deptId, state.semester);
    }
});

// Step 2 → Back to Step 1
els.btnBack1.addEventListener('click', () => goToStep(1));

// Step 2 → Step 3
els.btnToStep3.addEventListener('click', () => {
    if (state.selectedSubjects.size === 0) {
        els.errSubjects.classList.remove('hidden');
        return;
    }
    renderSummary();
    goToStep(3);
});

// Step 3 → Back to Step 2
els.btnBack2.addEventListener('click', () => {
    goToStep(2);
    renderSubjectCards(); // Restore card states
});

// Confirm submission
els.btnConfirm.addEventListener('click', submitRegistration);

// New registration
els.btnNewReg.addEventListener('click', resetWizard);

// Auto-clear field errors on input change
els.inpName.addEventListener('input', () => els.errName.classList.add('hidden'));
els.inpUsn.addEventListener('input', () => els.errUsn.classList.add('hidden'));
els.inpSemester.addEventListener('change', () => els.errSemester.classList.add('hidden'));
els.inpDept.addEventListener('change', () => els.errDept.classList.add('hidden'));

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
(async function init() {
    goToStep(1);
    await loadDepartments();
})();
