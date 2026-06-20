'use strict';

// ══════════════════════════════════════════════════════════════════
//  API KEYS
// ══════════════════════════════════════════════════════════════════

const USDA_API_KEY = 'vT2o59VqSjaFTJhoVBk9grEhBadSCyNVNG1DXZbN';

// ══════════════════════════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════════════════════════

const SK = {
  onboardingDone: 'nb_onboarding_done',
  profile:        'nb_profile',
  goals:          'nb_goals',
  points:         'nb_points',
  streak:         'nb_streak',
  lastLogDate:    'nb_last_log_date',
  diary:          date => `nb_diary_${date}`,
  goalMet:        date => `nb_goalmet_${date}`,
  awards:         date => `nb_awarded_${date}`,
  // Study tracking
  participantId:  'nb_participant_id',
  appVersion:     'nb_app_version',
  studyStart:     'nb_study_start',
  sessions:       'nb_sessions',
  interactions:   'nb_interactions',
  dailySummary:   'nb_daily_summary',
  streakEod:      date => `nb_streak_eod_${date}`,
  milestoneDay:   day  => `nb_milestone_${day}`,
  studySetupDone: 'nb_study_setup_done',
};

const MEAL_NAMES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

// Activity multipliers for Mifflin-St Jeor TDEE
const ACTIVITY = [1.2, 1.375, 1.55, 1.725];

// Calorie adjustment per goal index
const GOAL_DELTA = [-500, 0, 300, 0];

// ── Pixel art character maps (16×16) ─────────────────────────────
// Index key: 0=transparent 1=body 2=face 3=eye 4=eye-highlight 5=mouth 6=cheek
const CHAR = {
  healthy: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,2,2,2,2,2,2,1,1,1,1,0],
    [0,1,1,1,2,2,2,2,2,2,2,2,1,1,1,0],
    [0,1,1,2,2,3,3,2,2,3,3,2,2,1,1,0],
    [0,1,1,2,2,3,4,2,2,3,4,2,2,1,1,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
    [0,1,6,2,2,2,2,2,2,2,2,2,2,6,1,0],
    [0,1,1,2,5,2,2,2,2,2,2,5,2,1,1,0],
    [0,1,1,2,2,5,5,5,5,5,5,2,2,1,1,0],
    [0,0,1,1,1,2,2,2,2,2,2,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  neutral: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,2,2,2,2,2,2,1,1,1,1,0],
    [0,1,1,1,2,2,2,2,2,2,2,2,1,1,1,0],
    [0,1,1,2,2,3,3,2,2,3,3,2,2,1,1,0],
    [0,1,1,2,2,3,4,2,2,3,4,2,2,1,1,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
    [0,1,1,2,2,5,5,5,5,5,5,2,2,1,1,0],
    [0,0,1,1,1,2,2,2,2,2,2,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  unhealthy: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,2,2,2,2,2,2,1,1,1,1,0],
    [0,1,1,1,2,2,2,2,2,2,2,2,1,1,1,0],
    [0,1,1,2,2,3,3,2,2,3,3,2,2,1,1,0],
    [0,1,1,2,2,3,2,2,2,3,2,2,2,1,1,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
    [0,1,1,2,5,2,2,2,2,2,2,5,2,1,1,0],
    [0,1,1,2,2,5,5,5,5,5,5,2,2,1,1,0],
    [0,0,1,1,1,2,2,2,2,2,2,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
};

// index → css color per state (0 = skip)
const PALETTE = {
  healthy:   [null, '#5cb85c', '#a8e6a3', '#2d2d2d', '#ffffff', '#2d2d2d', '#ff9999'],
  neutral:   [null, '#d4a843', '#f0d080', '#2d2d2d', '#ffffff', '#2d2d2d', '#d4a843'],
  unhealthy: [null, '#888888', '#c0c0c0', '#2d2d2d', '#c0c0c0', '#2d2d2d', '#888888'],
};


// ══════════════════════════════════════════════════════════════════
//  UTILITIES
// ══════════════════════════════════════════════════════════════════

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDateLabel(dateStr) {
  const t = today();
  if (dateStr === t) return 'Today';
  const yesterday = offsetDate(t, -1);
  if (dateStr === yesterday) return 'Yesterday';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function offsetDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function load(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch { return fallback; }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

// Award-state helpers (per-day object)
function getAwards(dateStr) {
  const raw = load(SK.awards(dateStr), null);
  if (!raw || typeof raw !== 'object') {
    return { first: false, foodCount: 0, meals: false, protein: false, calories: false, allGoals: false };
  }
  return raw;
}
function saveAwards(dateStr, a) { save(SK.awards(dateStr), a); }
function anyGoalMet(dateStr) {
  const a = getAwards(dateStr);
  return a.meals || a.protein || a.calories;
}


// ══════════════════════════════════════════════════════════════════
//  CALCULATIONS
// ══════════════════════════════════════════════════════════════════

function calcGoals(sex, weightKg, heightCm, age, activityIdx, goalIdx) {
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr += sex === 'male' ? 5 : -161;
  const tdee = bmr * ACTIVITY[clamp(activityIdx, 0, 3)];
  const calories = Math.round(Math.max(1200, tdee + GOAL_DELTA[clamp(goalIdx, 0, 3)]));
  return {
    calories,
    protein: Math.round(calories * 0.30 / 4),
    carbs:   Math.round(calories * 0.40 / 4),
    fat:     Math.round(calories * 0.30 / 9),
  };
}

function getDiary(dateStr) {
  return load(SK.diary(dateStr), []);
}

function saveDiary(dateStr, entries) {
  save(SK.diary(dateStr), entries);
}

function getTotals(dateStr) {
  const entries = getDiary(dateStr);
  return entries.reduce((acc, e) => {
    const m = e.grams / 100;
    acc.calories += Math.round(e.cal100 * m);
    acc.protein  += e.pro100 * m;
    acc.carbs    += e.carb100 * m;
    acc.fat      += e.fat100 * m;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function getOverallProgressPct(dateStr) {
  const goals  = load(SK.goals, { calories: 2000, protein: 150, carbs: 200, fat: 65 });
  const totals = getTotals(dateStr);
  const pcts = [
    goals.calories > 0 ? Math.min(totals.calories / goals.calories, 1) : 0,
    goals.protein  > 0 ? Math.min(totals.protein  / goals.protein,  1) : 0,
    goals.carbs    > 0 ? Math.min(totals.carbs    / goals.carbs,    1) : 0,
    goals.fat      > 0 ? Math.min(totals.fat      / goals.fat,      1) : 0,
  ];
  return pcts.reduce((a, b) => a + b, 0) / pcts.length;
}

function petStateFromOverallPct(pct) {
  if (pct >= 0.70) return 'healthy';
  if (pct >= 0.40) return 'neutral';
  return 'unhealthy';
}


// ══════════════════════════════════════════════════════════════════
//  POINTS, LEVEL, STREAK
// ══════════════════════════════════════════════════════════════════

function getPoints() { return load(SK.points, 0); }
function getStreak() { return load(SK.streak, 0); }
function getLevel()  { return Math.floor(getPoints() / 100) + 1; }

function addPoints(n) {
  save(SK.points, getPoints() + n);
}

function checkAndAwardDailyPoints(dateStr) {
  if (dateStr !== today()) return;

  const awards  = getAwards(dateStr);
  const entries = getDiary(dateStr);
  const goals   = load(SK.goals, { calories: 2000, protein: 150, carbs: 200, fat: 65 });
  const totals  = getTotals(dateStr);
  let changed   = false;
  let delay     = 0;

  // 5 pts — first food of the day
  if (!awards.first && entries.length >= 1) {
    awards.first     = true;
    awards.foodCount = 1;
    changed = true;
    addPoints(5);
    scheduleFloat(5, delay); delay += 350;
  }

  // 3 pts each — additional foods logged (up to 5 total)
  if (awards.first) {
    const prevCount = awards.foodCount || 1;
    const newCount  = Math.min(entries.length, 5);
    if (newCount > prevCount) {
      const extra = newCount - prevCount;
      addPoints(extra * 3);
      awards.foodCount = newCount;
      changed = true;
      scheduleFloat(extra * 3, delay); delay += 350;
    }
  }

  // 10 pts — all four meal sections logged
  const allMealsDone = new Set(entries.map(e => e.meal)).size >= 4;
  if (!awards.meals && allMealsDone) {
    awards.meals = true;
    changed = true;
    addPoints(10);
    scheduleFloat(10, delay); delay += 350;
    flashGoalReward('meals', 10);
    trackInteraction('goal_oriented', 'goal_completed');
  }

  // 15 pts — protein target reached
  const proteinDone = goals.protein > 0 && totals.protein >= goals.protein;
  if (!awards.protein && proteinDone) {
    awards.protein = true;
    changed = true;
    addPoints(15);
    scheduleFloat(15, delay); delay += 350;
    flashGoalReward('protein', 15);
    trackInteraction('goal_oriented', 'goal_completed');
  }

  // 15 pts — calorie goal within 80%–115%
  const calPct  = goals.calories > 0 ? totals.calories / goals.calories : 0;
  const calDone = calPct >= 0.8 && calPct <= 1.15;
  if (!awards.calories && calDone) {
    awards.calories = true;
    changed = true;
    addPoints(15);
    scheduleFloat(15, delay); delay += 350;
    flashGoalReward('calories', 15);
    trackInteraction('goal_oriented', 'goal_completed');
  }

  // 20 pts bonus — all three daily goals completed
  if (!awards.allGoals && awards.meals && awards.protein && awards.calories) {
    awards.allGoals = true;
    changed = true;
    addPoints(20);
    scheduleFloat(20, delay);
  }

  if (changed) saveAwards(dateStr, awards);
}

function scheduleFloat(pts, delayMs) {
  if (delayMs === 0) showFloatingPoints(pts);
  else setTimeout(() => showFloatingPoints(pts), delayMs);
}

function updateStreak() {
  const t = today();
  if (!anyGoalMet(t)) return;

  const lastDate = load(SK.lastLogDate, null);
  if (lastDate === t) return;

  const yesterday = offsetDate(t, -1);
  if (lastDate === yesterday) {
    save(SK.streak, getStreak() + 1);
  } else {
    save(SK.streak, 1);
  }
  save(SK.lastLogDate, t);
  save(SK.streakEod(t), getStreak());
}


// ══════════════════════════════════════════════════════════════════
//  APP STATE
// ══════════════════════════════════════════════════════════════════

const state = {
  currentDate:       today(),
  pendingMeal:       0,
  selectedFood:      null,
  barStates:         { calories: false, protein: false, carbs: false, fat: false },
  justLoggedFood:    false,
  sessionStart:      null,
  sessionHadLogging: false,
};


// ══════════════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════════════

function showSection(id) {
  ['onboarding', 'study-setup', 'app', 'food-search'].forEach(s => {
    document.getElementById(s).classList.toggle('hidden', s !== id);
  });
}

function switchTab(name) {
  document.querySelectorAll('.tab-pane').forEach(p => {
    p.classList.toggle('active', p.id === `tab-${name}`);
    p.classList.toggle('hidden', p.id !== `tab-${name}`);
  });
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === name);
  });

  if (name === 'progress') {
    renderProgressTab();
    trackInteraction('gamified', 'progress_visited');
  }
  if (name === 'settings')  loadSettingsValues();
  if (name === 'tracking')  renderTrackingTab();
}


// ══════════════════════════════════════════════════════════════════
//  ONBOARDING
// ══════════════════════════════════════════════════════════════════

const ob = { sex: null, weight: null, height: null, age: null, goal: null, activity: null };

function showObStep(id) {
  document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function initOnboarding() {
  // Sex
  document.querySelectorAll('[data-ob-sex]').forEach(btn => {
    btn.addEventListener('click', () => {
      ob.sex = btn.dataset.obSex;
      showObStep('ob-weight');
      document.getElementById('input-weight').focus();
    });
  });

  // Weight
  document.getElementById('btn-weight-next').addEventListener('click', () => {
    const v = parseFloat(document.getElementById('input-weight').value);
    const err = document.getElementById('err-weight');
    if (!v || v < 20 || v > 400) { err.classList.remove('hidden'); return; }
    err.classList.add('hidden');
    ob.weight = v;
    showObStep('ob-height');
    document.getElementById('input-height').focus();
  });
  document.getElementById('input-weight').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-weight-next').click();
  });

  // Height
  document.getElementById('btn-height-next').addEventListener('click', () => {
    const v = parseFloat(document.getElementById('input-height').value);
    const err = document.getElementById('err-height');
    if (!v || v < 50 || v > 280) { err.classList.remove('hidden'); return; }
    err.classList.add('hidden');
    ob.height = v;
    showObStep('ob-age');
    document.getElementById('input-age').focus();
  });
  document.getElementById('input-height').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-height-next').click();
  });

  // Age
  document.getElementById('btn-age-next').addEventListener('click', () => {
    const v = parseInt(document.getElementById('input-age').value);
    const err = document.getElementById('err-age');
    if (!v || v < 10 || v > 120) { err.classList.remove('hidden'); return; }
    err.classList.add('hidden');
    ob.age = v;
    showObStep('ob-goal');
  });
  document.getElementById('input-age').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-age-next').click();
  });

  // Goal
  document.querySelectorAll('[data-ob-goal]').forEach(btn => {
    btn.addEventListener('click', () => {
      ob.goal = parseInt(btn.dataset.obGoal);
      showObStep('ob-activity');
    });
  });

  // Activity
  document.querySelectorAll('[data-ob-activity]').forEach(btn => {
    btn.addEventListener('click', () => {
      ob.activity = parseInt(btn.dataset.obActivity);
      finishOnboarding();
    });
  });
}

function finishOnboarding() {
  const goals = calcGoals(ob.sex, ob.weight, ob.height, ob.age, ob.activity, ob.goal);
  save(SK.goals,   goals);
  save(SK.profile, { sex: ob.sex, weight: ob.weight, height: ob.height, age: ob.age, goal: ob.goal, activity: ob.activity });
  save(SK.onboardingDone, true);
  document.getElementById('setup-name').value = '';
  document.getElementById('btn-setup-confirm').disabled = true;
  showSection('study-setup');
}


// ══════════════════════════════════════════════════════════════════
//  STUDY SETUP
// ══════════════════════════════════════════════════════════════════

function initStudySetup() {
  const nameInput  = document.getElementById('setup-name');
  const confirmBtn = document.getElementById('btn-setup-confirm');

  function refreshConfirm() {
    confirmBtn.disabled = !nameInput.value.trim();
  }

  nameInput.addEventListener('input', refreshConfirm);

  confirmBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) return;
    save(SK.participantId,  name);
    save(SK.appVersion,     'gamified');
    save(SK.studySetupDone, true);
    showSection('app');
    renderTrackingTab();
  });
}


// ══════════════════════════════════════════════════════════════════
//  TRACKING TAB
// ══════════════════════════════════════════════════════════════════

function renderTrackingTab() {
  const d = state.currentDate;
  const t = today();

  document.getElementById('date-label').textContent = formatDateLabel(d);
  document.getElementById('btn-next-day').disabled = (d >= t);

  const participantName = load(SK.participantId, '');
  const nameBadge = document.getElementById('participant-name-label');
  nameBadge.textContent = participantName || '';
  nameBadge.classList.toggle('hidden', !participantName);

  const totals = getTotals(d);
  const goals  = load(SK.goals, { calories: 2000, protein: 150, carbs: 200, fat: 65 });
  setBar('calories', totals.calories, goals.calories, 'kcal');
  setBar('protein',  totals.protein,  goals.protein,  'g');
  setBar('carbs',    totals.carbs,    goals.carbs,    'g');
  setBar('fat',      totals.fat,      goals.fat,      'g');

  renderDailyGoals(d);
  for (let m = 0; m < 4; m++) renderMealSection(m, d);
}

const BAR_MSGS = {
  calories: 'Calorie goal reached!',
  protein:  'Protein goal reached!',
  carbs:    'Carbs goal reached!',
  fat:      'Fat goal reached!',
};

function setBar(macro, consumed, goal, unit) {
  const rawPct     = goal > 0 ? consumed / goal * 100 : 0;
  const pct        = clamp(rawPct, 0, 100);
  const reached    = rawPct >= 100;
  const wasReached = state.barStates[macro];

  const fill = document.getElementById(`bar-${macro}`);
  fill.style.width = pct + '%';
  fill.classList.toggle('bar-fill--reached', reached);

  document.getElementById(`bar-check-${macro}`).classList.toggle('hidden', !reached);

  if (reached && !wasReached && state.justLoggedFood && state.currentDate === today()) {
    showBarMessage(macro);
  }
  state.barStates[macro] = reached;

  const rounded = macro === 'calories'
    ? `${Math.round(consumed)} / ${goal} ${unit}`
    : `${consumed.toFixed(1)} / ${goal} ${unit}`;
  document.getElementById(`lbl-${macro}`).textContent = rounded;
}

function showBarMessage(macro) {
  const el = document.getElementById(`bar-msg-${macro}`);
  if (!el) return;
  el.textContent = BAR_MSGS[macro];
  el.classList.remove('hidden', 'bar-msg-fade');
  void el.offsetWidth;
  el.classList.add('bar-msg-fade');
  setTimeout(() => el.classList.add('hidden'), 3200);
}

function renderMealSection(mealType, dateStr) {
  const container = document.getElementById(`entries-${mealType}`);
  const entries   = getDiary(dateStr).filter(e => e.meal === mealType);
  container.innerHTML = '';

  entries.forEach(entry => {
    const m    = entry.grams / 100;
    const cal  = Math.round(entry.cal100 * m);
    const pro  = (entry.pro100 * m).toFixed(1);
    const carb = (entry.carb100 * m).toFixed(1);
    const fat  = (entry.fat100 * m).toFixed(1);

    const row = document.createElement('div');
    row.className = 'entry-row';
    row.innerHTML = `
      <div class="entry-info">
        <div class="entry-name">${escHtml(entry.name)}</div>
        <div class="entry-macros">${cal} kcal &nbsp;·&nbsp; P ${pro}g &nbsp;·&nbsp; C ${carb}g &nbsp;·&nbsp; F ${fat}g</div>
      </div>
      <button class="btn-delete-entry" aria-label="Delete">&#215;</button>`;
    row.querySelector('.btn-delete-entry').addEventListener('click', () => {
      deleteEntry(entry.id, dateStr);
    });
    container.appendChild(row);
  });
}

function deleteEntry(id, dateStr) {
  const entries = getDiary(dateStr).filter(e => e.id !== id);
  saveDiary(dateStr, entries);
  renderTrackingTab();
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Daily goals panel ─────────────────────────────────────────────

function renderDailyGoals(dateStr) {
  const panel = document.getElementById('daily-goals-panel');
  if (dateStr !== today()) {
    panel.classList.add('hidden');
    return;
  }
  panel.classList.remove('hidden');

  const entries = getDiary(dateStr);
  const goals   = load(SK.goals, { calories: 2000, protein: 150, carbs: 200, fat: 65 });
  const totals  = getTotals(dateStr);

  const mealsDone   = new Set(entries.map(e => e.meal)).size >= 4;
  const proteinDone = goals.protein > 0 && totals.protein >= goals.protein;
  const calPct      = goals.calories > 0 ? totals.calories / goals.calories : 0;
  const calDone     = calPct >= 0.8 && calPct <= 1.15;

  setGoalRowState('meals',    mealsDone);
  setGoalRowState('protein',  proteinDone);
  setGoalRowState('calories', calDone);
}

function setGoalRowState(key, done) {
  document.getElementById(`dgoal-check-${key}`).classList.toggle('dgoal-check--done', done);
  document.getElementById(`dgoal-text-${key}`).classList.toggle('dgoal-text--done', done);
}

function flashGoalReward(key, pts) {
  const el = document.getElementById(`dgoal-pts-${key}`);
  if (!el) return;
  el.textContent = `+${pts} pts`;
  el.classList.remove('hidden', 'dgoal-pts-animate');
  void el.offsetWidth;
  el.classList.add('dgoal-pts-animate');
  setTimeout(() => el.classList.add('hidden'), 2700);
}

function showFloatingPoints(pts) {
  const el = document.createElement('div');
  el.className = 'floating-pts';
  el.textContent = `+${pts}`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}


// ══════════════════════════════════════════════════════════════════
//  FOOD SEARCH — API LAYER
// ══════════════════════════════════════════════════════════════════

function findNutrient(nutrients, nameRx, unitRx = null) {
  const n = nutrients.find(n => {
    if (!nameRx.test(n.nutrientName)) return false;
    if (unitRx && n.unitName && !unitRx.test(n.unitName)) return false;
    return true;
  });
  return n ? (parseFloat(n.value) || 0) : 0;
}

async function searchUSDA(query) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=20&api_key=${USDA_API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) return [];
  const data = await resp.json();
  const foods = data.foods || [];

  return foods
    .filter(f => f.description && f.foodNutrients && f.foodNutrients.length)
    .map(f => {
      const n = f.foodNutrients;
      return {
        name:    f.description,
        cal100:  Math.round(findNutrient(n, /^energy$/i, /kcal/i) || findNutrient(n, /^energy \(atwater/i)),
        pro100:  findNutrient(n, /^protein$/i),
        carb100: findNutrient(n, /^carbohydrate, by difference$/i),
        fat100:  findNutrient(n, /^total lipid \(fat\)$/i),
      };
    })
    .filter(f => f.cal100 > 0);
}

async function searchOpenFoodFacts(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,nutriments`;
  const resp = await fetch(url, { headers: { 'User-Agent': 'NutureByte/1.0 (educational)' } });
  if (!resp.ok) return [];
  const data = await resp.json();
  return (data.products || [])
    .filter(p => p.product_name && p.nutriments)
    .map(p => {
      const n = p.nutriments;
      return {
        name:    p.product_name.trim(),
        cal100:  Math.round(n['energy-kcal_100g'] || n['energy_kcal_100g'] || 0),
        pro100:  parseFloat(n.proteins_100g)      || 0,
        carb100: parseFloat(n.carbohydrates_100g) || 0,
        fat100:  parseFloat(n.fat_100g)           || 0,
      };
    })
    .filter(f => f.name);
}

function displaySearchResults(foods) {
  const container = document.getElementById('search-results');
  container.innerHTML = '';
  foods.forEach(food => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.innerHTML = `
      <span class="result-name">${escHtml(food.name)}</span>
      <span class="result-kcal">${food.cal100} kcal/100g</span>`;
    item.addEventListener('click', () => {
      state.selectedFood = food;
      showDetailPanel();
    });
    container.appendChild(item);
  });
}


// ══════════════════════════════════════════════════════════════════
//  FOOD SEARCH — UI
// ══════════════════════════════════════════════════════════════════

function openFoodSearch(mealType) {
  state.pendingMeal = mealType;
  state.selectedFood = null;

  document.getElementById('search-input').value = '';
  document.getElementById('search-status').textContent = '';
  document.getElementById('search-results').innerHTML = '';
  document.getElementById('detail-panel').classList.add('hidden');
  document.getElementById('manual-panel').classList.add('hidden');
  document.getElementById('serving-input').value = '100';

  showSection('food-search');
  document.getElementById('search-input').focus();
}

function closeFoodSearch() {
  showSection('app');
}

async function runSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;

  const statusEl  = document.getElementById('search-status');
  const goBtn     = document.getElementById('btn-search-go');
  statusEl.textContent = 'Searching…';
  document.getElementById('search-results').innerHTML = '';
  document.getElementById('detail-panel').classList.add('hidden');
  goBtn.disabled = true;

  try {
    let foods  = await searchUSDA(q);
    let source = 'USDA';

    if (foods.length === 0) {
      foods  = await searchOpenFoodFacts(q);
      source = 'OpenFoodFacts';
    }

    if (foods.length === 0) {
      statusEl.textContent = 'No results found. Try a different search term, or enter the food manually below.';
      return;
    }

    statusEl.textContent = `${foods.length} result${foods.length > 1 ? 's' : ''} from ${source}`;
    displaySearchResults(foods);
  } catch (err) {
    statusEl.textContent = 'Search failed. Check your connection, or enter the food manually below.';
  } finally {
    goBtn.disabled = false;
  }
}

function showDetailPanel() {
  const food = state.selectedFood;
  if (!food) return;

  document.getElementById('detail-name').textContent = food.name;
  document.getElementById('detail-macros').innerHTML = `
    <div class="macro-chip macro-chip--cal">
      <div class="macro-chip-label">Energy</div>
      <div class="macro-chip-value">${food.cal100} kcal</div>
    </div>
    <div class="macro-chip macro-chip--pro">
      <div class="macro-chip-label">Protein</div>
      <div class="macro-chip-value">${food.pro100.toFixed(1)} g</div>
    </div>
    <div class="macro-chip macro-chip--carb">
      <div class="macro-chip-label">Carbs</div>
      <div class="macro-chip-value">${food.carb100.toFixed(1)} g</div>
    </div>
    <div class="macro-chip macro-chip--fat">
      <div class="macro-chip-label">Fat</div>
      <div class="macro-chip-value">${food.fat100.toFixed(1)} g</div>
    </div>`;

  document.getElementById('serving-input').value = '100';
  updateDetailTotals();
  document.getElementById('detail-panel').classList.remove('hidden');
}

function updateDetailTotals() {
  const food = state.selectedFood;
  if (!food) return;
  const g    = parseFloat(document.getElementById('serving-input').value) || 0;
  const m    = g / 100;
  const cal  = Math.round(food.cal100 * m);
  const pro  = (food.pro100  * m).toFixed(1);
  const carb = (food.carb100 * m).toFixed(1);
  const fat  = (food.fat100  * m).toFixed(1);
  document.getElementById('detail-totals').textContent =
    `${g} g serving: ${cal} kcal · P ${pro}g · C ${carb}g · F ${fat}g`;
}

function addFoodToDiary() {
  const food = state.selectedFood;
  if (!food) return;
  const g = parseFloat(document.getElementById('serving-input').value);
  if (!g || g <= 0) return;
  logEntry(food.name, food.cal100, food.pro100, food.carb100, food.fat100, g);
}


// ══════════════════════════════════════════════════════════════════
//  MANUAL FOOD ENTRY
// ══════════════════════════════════════════════════════════════════

function openManualEntry() {
  ['manual-name','manual-cal','manual-pro','manual-carb','manual-fat'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('manual-serving').value = '100';
  document.getElementById('manual-error').classList.add('hidden');
  document.getElementById('manual-panel').classList.remove('hidden');
}

function closeManualEntry() {
  document.getElementById('manual-panel').classList.add('hidden');
}

function addManualFood() {
  const name    = document.getElementById('manual-name').value.trim();
  const cal100  = parseFloat(document.getElementById('manual-cal').value)  || 0;
  const pro100  = parseFloat(document.getElementById('manual-pro').value)  || 0;
  const carb100 = parseFloat(document.getElementById('manual-carb').value) || 0;
  const fat100  = parseFloat(document.getElementById('manual-fat').value)  || 0;
  const grams   = parseFloat(document.getElementById('manual-serving').value);
  const errEl   = document.getElementById('manual-error');

  if (!name) {
    errEl.textContent = 'Please enter a food name.';
    errEl.classList.remove('hidden');
    return;
  }
  if (!grams || grams <= 0) {
    errEl.textContent = 'Please enter a valid serving size.';
    errEl.classList.remove('hidden');
    return;
  }

  errEl.classList.add('hidden');
  logEntry(name, cal100, pro100, carb100, fat100, grams);
}

function logEntry(name, cal100, pro100, carb100, fat100, grams) {
  const entries = getDiary(state.currentDate);
  entries.push({
    id:      uid(),
    meal:    state.pendingMeal,
    name,
    grams,
    cal100,
    pro100,
    carb100,
    fat100,
  });
  saveDiary(state.currentDate, entries);
  state.sessionHadLogging = true;
  trackInteraction('reflective', 'food_logged');
  closeFoodSearch();
  state.justLoggedFood = true;
  renderTrackingTab();
  state.justLoggedFood = false;
  setTimeout(() => {
    checkAndAwardDailyPoints(state.currentDate);
    updateStreak();
  }, 150);
}


// ══════════════════════════════════════════════════════════════════
//  PROGRESS TAB
// ══════════════════════════════════════════════════════════════════

function renderProgressTab() {
  const pState = petStateFromOverallPct(getOverallProgressPct(today()));

  const envWrap = document.getElementById('env-wrap');
  envWrap.classList.remove('env-healthy', 'env-neutral', 'env-unhealthy');
  envWrap.classList.add(`env-${pState}`);

  document.getElementById('env-rain').classList.toggle('hidden', pState !== 'unhealthy');

  const canvas = document.getElementById('pet-canvas');
  drawCharacter(canvas, pState);

  const labels = { healthy: 'Thriving!', neutral: 'Doing okay', unhealthy: 'Needs fuel' };
  document.getElementById('progress-state-label').textContent = labels[pState];

  document.getElementById('stat-points').textContent = `${getPoints()} pts`;
  document.getElementById('stat-level').textContent  = `Lv ${getLevel()}`;
  document.getElementById('stat-streak').textContent = `${getStreak()}\u{1F525}`;

  renderWeekly();
  renderStudyStats();
}

function drawCharacter(canvas, pState) {
  const ctx   = canvas.getContext('2d');
  const scale = canvas.width / 16;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const map     = CHAR[pState];
  const palette = PALETTE[pState];

  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const idx = map[row][col];
      if (idx === 0) continue;
      ctx.fillStyle = palette[idx];
      ctx.fillRect(col * scale, row * scale, scale, scale);
    }
  }
}

function renderWeekly() {
  const container = document.getElementById('weekly-days');
  container.innerHTML = '';

  const t        = today();
  const letters  = ['M','T','W','T','F','S','S'];
  const todayIdx = (new Date(t + 'T00:00:00').getDay() + 6) % 7;

  for (let i = 0; i < 7; i++) {
    const diff     = i - todayIdx;
    const dateStr  = offsetDate(t, diff);
    const isFuture = diff > 0;
    const isToday  = diff === 0;

    const met = !isFuture && (load(SK.goalMet(dateStr), false) ||
      (isToday && anyGoalMet(dateStr)));

    const day = document.createElement('div');
    day.className = 'weekly-day';
    day.innerHTML = `
      <span class="weekly-day-letter">${letters[i]}</span>
      <div class="weekly-day-circle ${met ? 'met' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}"></div>`;
    container.appendChild(day);
  }
}

function renderStudyStats() {
  const studyStart = load(SK.studyStart, today());
  let daysUsed   = 0;
  let bestStreak = getStreak();
  let goalsCount = 0;

  for (let i = 0; i < 14; i++) {
    const d = offsetDate(studyStart, i);
    if (getDiary(d).length > 0) daysUsed++;
    const s = load(SK.streakEod(d), 0);
    if (s > bestStreak) bestStreak = s;
    const awards = getAwards(d);
    if (awards.meals)    goalsCount++;
    if (awards.protein)  goalsCount++;
    if (awards.calories) goalsCount++;
  }

  const ptsToNext = getLevel() * 100 - getPoints();
  document.getElementById('stat-days-used').textContent   = `${daysUsed}/14`;
  document.getElementById('stat-best-streak').textContent = String(bestStreak);
  document.getElementById('stat-goals-count').textContent = String(goalsCount);
  document.getElementById('stat-next-level').textContent  = `${ptsToNext} pts`;
}


// ── Milestone rewards ─────────────────────────────────────────────

function checkMilestones() {
  const studyStart = load(SK.studyStart, null);
  if (!studyStart) return;

  const t = today();
  const milestones = [
    { day: 7,  offset: 6,  pts: 25, week: 1 },
    { day: 14, offset: 13, pts: 50, week: 2 },
  ];

  milestones.forEach(m => {
    // Fire on or after the milestone day so it catches up if participant missed that exact day
    if (t >= offsetDate(studyStart, m.offset) && !load(SK.milestoneDay(m.day), false)) {
      save(SK.milestoneDay(m.day), true);
      addPoints(m.pts);
      trackInteraction('gamified', 'milestone_awarded');
      showMilestoneOverlay(m.week, m.pts);
    }
  });
}

function showMilestoneOverlay(week, pts) {
  document.getElementById('milestone-title').textContent =
    week === 1 ? 'Week 1 complete!' : 'Study complete!';
  document.getElementById('milestone-msg').textContent =
    week === 1 ? 'Keep going!' : 'Thank you for participating.';
  document.getElementById('milestone-pts').textContent = `+${pts} pts`;
  document.getElementById('milestone-overlay').classList.remove('hidden');
}


// ══════════════════════════════════════════════════════════════════
//  SETTINGS TAB
// ══════════════════════════════════════════════════════════════════

function loadSettingsValues() {
  const goals   = load(SK.goals,   { calories: 2000, protein: 150, carbs: 200, fat: 65 });
  const profile = load(SK.profile, { sex: 'male', weight: 70, height: 170, age: 30, goal: 1, activity: 1 });

  document.getElementById('s-cal').value  = goals.calories;
  document.getElementById('s-pro').value  = goals.protein;
  document.getElementById('s-carb').value = goals.carbs;
  document.getElementById('s-fat').value  = goals.fat;

  document.getElementById('s-sex').value  = profile.sex;
  document.getElementById('s-wt').value   = profile.weight;
  document.getElementById('s-ht').value   = profile.height;
  document.getElementById('s-age').value  = profile.age || 30;
  document.getElementById('s-goal').value = profile.goal;
  document.getElementById('s-act').value  = profile.activity;

  hideFeedback('goals-feedback');
  hideFeedback('recalc-feedback');
  loadStudySettings();
}

function showFeedback(id, msg, isError = false) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hidden', 'error');
  if (isError) el.classList.add('error');
}
function hideFeedback(id) {
  document.getElementById(id).classList.add('hidden');
}

function saveGoals() {
  const cal  = parseInt(document.getElementById('s-cal').value);
  const pro  = parseInt(document.getElementById('s-pro').value);
  const carb = parseInt(document.getElementById('s-carb').value);
  const fat  = parseInt(document.getElementById('s-fat').value);

  if (!cal || cal < 500 || [pro, carb, fat].some(n => isNaN(n) || n < 0)) {
    showFeedback('goals-feedback', 'Please enter valid values.', true);
    return;
  }

  save(SK.goals, { calories: cal, protein: pro, carbs: carb, fat: fat });
  showFeedback('goals-feedback', 'Goals saved.');
  renderTrackingTab();
}

function recalcGoals() {
  const sex  = document.getElementById('s-sex').value;
  const wt   = parseFloat(document.getElementById('s-wt').value);
  const ht   = parseFloat(document.getElementById('s-ht').value);
  const age  = parseInt(document.getElementById('s-age').value);
  const goal = parseInt(document.getElementById('s-goal').value);
  const act  = parseInt(document.getElementById('s-act').value);

  if (!wt || wt < 20 || !ht || ht < 50 || !age || age < 10 || age > 120) {
    showFeedback('recalc-feedback', 'Please enter valid weight, height and age.', true);
    return;
  }

  const goals   = calcGoals(sex, wt, ht, age, act, goal);
  const profile = { sex, weight: wt, height: ht, age, goal, activity: act };
  save(SK.goals,   goals);
  save(SK.profile, profile);

  document.getElementById('s-cal').value  = goals.calories;
  document.getElementById('s-pro').value  = goals.protein;
  document.getElementById('s-carb').value = goals.carbs;
  document.getElementById('s-fat').value  = goals.fat;

  showFeedback('recalc-feedback', `Goals recalculated: ${goals.calories} kcal / day.`);
  renderTrackingTab();
}

function resetAllData() {
  localStorage.clear();
  location.reload();
}


// ══════════════════════════════════════════════════════════════════
//  STUDY DATA TRACKING  (FITT framework — Short et al. 2018)
// ══════════════════════════════════════════════════════════════════

function getAppVersion() {
  return 'gamified';
}

// ── Session tracking — TIME ───────────────────────────────────────

function startSession() {
  state.sessionStart      = Date.now();
  state.sessionHadLogging = false;
}

function endSession() {
  if (!state.sessionStart) return;

  const end         = Date.now();
  const startTs     = state.sessionStart;
  state.sessionStart = null;

  const rawMin      = (end - startTs) / 60000;
  const durationMin = Math.min(rawMin, 120);   // cap at 2 h to discard overnight outliers
  if (durationMin < 0.5) return;

  const sessions = load(SK.sessions, []);
  sessions.push({
    date:     today(),
    start:    startTs,
    end:      end,
    duration: Math.round(durationMin * 10) / 10,
  });
  save(SK.sessions, sessions);

  if (!state.sessionHadLogging) {
    trackInteraction('passive', 'session_no_logging');
  }
}

// ── Feature interaction tracking — TYPE ──────────────────────────

function trackInteraction(type, action) {
  const interactions = load(SK.interactions, []);
  interactions.push({
    timestamp: Date.now(),
    date:      today(),
    type,
    action,
  });
  save(SK.interactions, interactions);
}

// ── Daily summary — FREQUENCY + INTENSITY ────────────────────────

function getDailyPointsFromAwards(awards) {
  if (!awards || typeof awards !== 'object') return 0;
  let pts = 0;
  if (awards.first)         pts += 5;
  if (awards.foodCount > 1) pts += Math.min(awards.foodCount - 1, 4) * 3;
  if (awards.meals)         pts += 10;
  if (awards.protein)       pts += 15;
  if (awards.calories)      pts += 15;
  if (awards.allGoals)      pts += 20;
  return pts;
}

function buildDailySummary(dateStr) {
  const sessions     = load(SK.sessions,     []).filter(s => s.date === dateStr);
  const entries      = getDiary(dateStr);
  const awards       = getAwards(dateStr);
  const interactions = load(SK.interactions, []).filter(i => i.date === dateStr);
  const mealsUsed    = new Set(entries.map(e => e.meal));

  const totalMins = parseFloat(
    sessions.reduce((sum, s) => sum + (s.duration || 0), 0).toFixed(1)
  );

  return {
    date:                   dateStr,
    sessions_count:         sessions.length,
    total_time_minutes:     totalMins,
    foods_logged:           entries.length,
    breakfast_logged:       mealsUsed.has(0),
    lunch_logged:           mealsUsed.has(1),
    dinner_logged:          mealsUsed.has(2),
    snacks_logged:          mealsUsed.has(3),
    goal_meals_complete:    awards.meals    || false,
    goal_protein_complete:  awards.protein  || false,
    goal_calories_complete: awards.calories || false,
    points_earned:          getDailyPointsFromAwards(awards),
    progress_visited:       interactions.some(i => i.action === 'progress_visited'),
    streak_eod:             load(SK.streakEod(dateStr), 0),
  };
}

function generateDailySummaries() {
  const t          = today();
  const yesterday  = offsetDate(t, -1);
  const studyStart = load(SK.studyStart, t);
  const summaries  = load(SK.dailySummary, []);

  const lastDate  = summaries.length > 0 ? summaries[summaries.length - 1].date : null;
  let   cursor    = lastDate ? offsetDate(lastDate, 1) : studyStart;

  while (cursor <= yesterday) {
    summaries.push(buildDailySummary(cursor));
    cursor = offsetDate(cursor, 1);
  }

  save(SK.dailySummary, summaries);
}

function initStudyTracking() {
  const t = today();
  if (!load(SK.studyStart, null)) save(SK.studyStart, t);
  generateDailySummaries();
}

// ── CSV export ────────────────────────────────────────────────────

function csvCell(val) {
  const s = String(val);
  return (s.includes(',') || s.includes('"') || s.includes('\n'))
    ? '"' + s.replace(/"/g, '""') + '"'
    : s;
}

function boolCell(val) {
  if (val === 'N/A') return 'N/A';
  return val ? 'TRUE' : 'FALSE';
}

function downloadCSV() {
  generateDailySummaries();

  const participantId = load(SK.participantId, 'unassigned') || 'unassigned';
  const studyStart    = load(SK.studyStart, today());

  const summaries  = load(SK.dailySummary, []);
  const byDate     = {};
  summaries.forEach(s => { byDate[s.date] = s; });

  const emptyRow = date => ({
    date,
    sessions_count:         0,
    total_time_minutes:     0,
    foods_logged:           0,
    breakfast_logged:       false,
    lunch_logged:           false,
    dinner_logged:          false,
    snacks_logged:          false,
    goal_meals_complete:    false,
    goal_protein_complete:  false,
    goal_calories_complete: false,
    points_earned:          0,
    progress_visited:       false,
    streak_eod:             0,
  });

  const t    = today();
  const rows = [];
  for (let i = 0; i < 14; i++) {
    const date = offsetDate(studyStart, i);
    if (date === t) {
      rows.push(buildDailySummary(date));
    } else if (date > t) {
      rows.push(emptyRow(date));
    } else {
      rows.push(byDate[date] || emptyRow(date));
    }
  }

  const headers = [
    'participant_id', 'app_version', 'date',
    'sessions_count', 'total_time_minutes', 'foods_logged',
    'breakfast_logged', 'lunch_logged', 'dinner_logged', 'snacks_logged',
    'goal_meals_complete', 'goal_protein_complete', 'goal_calories_complete',
    'points_earned', 'progress_visited', 'streak_eod',
  ];

  const lines = [headers.join(',')];
  rows.forEach(row => {
    lines.push([
      csvCell(participantId),
      'gamified',
      row.date,
      row.sessions_count,
      row.total_time_minutes,
      row.foods_logged,
      boolCell(row.breakfast_logged),
      boolCell(row.lunch_logged),
      boolCell(row.dinner_logged),
      boolCell(row.snacks_logged),
      boolCell(row.goal_meals_complete),
      boolCell(row.goal_protein_complete),
      boolCell(row.goal_calories_complete),
      row.points_earned,
      boolCell(row.progress_visited),
      row.streak_eod,
    ].join(','));
  });

  triggerCSVDownload(lines.join('\n'), 'nuturebyte-studydata.csv');
}

function triggerCSVDownload(csvText, fileName) {
  // iOS Safari does not support <a download> — use Web Share API instead
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && navigator.share) {
    const file = new File([csvText], fileName, { type: 'text/csv' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: fileName })
        .catch(() => iosCsvFallback(csvText, fileName));
      return;
    }
    iosCsvFallback(csvText, fileName);
    return;
  }
  // Desktop + Android Chrome: standard blob download
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function iosCsvFallback(csvText, fileName) {
  // Opens the CSV in a new Safari tab so the user can share/save via the share sheet
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

// ── Study settings UI helpers ─────────────────────────────────────

function loadStudySettings() {
  const id = load(SK.participantId, '') || '—';
  document.getElementById('display-participant').textContent = id;
  document.getElementById('display-group').textContent      = 'Experimental';
}


// ══════════════════════════════════════════════════════════════════
//  DAILY GOAL-MET PERSISTENCE
// ══════════════════════════════════════════════════════════════════

function persistGoalMet() {
  const t = today();
  if (anyGoalMet(t)) save(SK.goalMet(t), true);
  save(SK.streakEod(t), getStreak());
}


// ══════════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════════

function init() {
  startSession();
  initStudyTracking();
  checkMilestones();

  initOnboarding();
  initStudySetup();

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('btn-prev-day').addEventListener('click', () => {
    state.currentDate = offsetDate(state.currentDate, -1);
    state.barStates = { calories: false, protein: false, carbs: false, fat: false };
    renderTrackingTab();
  });
  document.getElementById('btn-next-day').addEventListener('click', () => {
    const next = offsetDate(state.currentDate, +1);
    if (next <= today()) {
      state.currentDate = next;
      state.barStates = { calories: false, protein: false, carbs: false, fat: false };
      renderTrackingTab();
    }
  });

  document.querySelectorAll('.btn-add-food').forEach(btn => {
    btn.addEventListener('click', () => openFoodSearch(parseInt(btn.dataset.meal)));
  });

  document.getElementById('btn-search-back').addEventListener('click', closeFoodSearch);
  document.getElementById('btn-search-go').addEventListener('click', runSearch);
  document.getElementById('search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') runSearch();
  });

  document.getElementById('btn-detail-back').addEventListener('click', () => {
    document.getElementById('detail-panel').classList.add('hidden');
    state.selectedFood = null;
  });
  document.getElementById('serving-input').addEventListener('input', updateDetailTotals);
  document.getElementById('btn-add-food').addEventListener('click', addFoodToDiary);

  document.getElementById('btn-manual-entry').addEventListener('click', openManualEntry);
  document.getElementById('btn-manual-back').addEventListener('click', closeManualEntry);
  document.getElementById('btn-manual-add').addEventListener('click', addManualFood);

  document.getElementById('btn-save-goals').addEventListener('click', saveGoals);
  document.getElementById('btn-recalc').addEventListener('click', recalcGoals);

  document.getElementById('btn-export-csv').addEventListener('click', downloadCSV);

  document.getElementById('btn-milestone-dismiss').addEventListener('click', () => {
    document.getElementById('milestone-overlay').classList.add('hidden');
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.remove('hidden');
  });
  document.getElementById('btn-reset-cancel').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.add('hidden');
  });
  document.getElementById('btn-reset-confirm').addEventListener('click', resetAllData);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      persistGoalMet();
      endSession();
    } else if (document.visibilityState === 'visible') {
      startSession();
    }
  });
  window.addEventListener('beforeunload', endSession);

  if (load(SK.onboardingDone, false)) {
    if (load(SK.studySetupDone, false)) {
      showSection('app');
      renderTrackingTab();
    } else {
      showSection('study-setup');
    }
  } else {
    showSection('onboarding');
  }
}

document.addEventListener('DOMContentLoaded', init);
