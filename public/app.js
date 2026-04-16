const PARA_FOLDER_MAP = {
  inbox: 'Inbox',
  projects: 'Projects',
  areas: 'Areas',
  resources: 'Resources',
  archives: 'Archives'
};

const state = {
  queue: [],
  popupItem: null,
  currentEditing: null,
  browsing: { category: 'resources', path: '' },
  reviewFlow: {
    startedAt: null,
    flashcards: [],
    flashcardIndex: 0,
    flashcardAnswerVisible: false
  }
};

const queueEl = document.getElementById('queue');
const libraryEl = document.getElementById('library');
const dueTodayEl = document.getElementById('dueToday');
const activeTotalEl = document.getElementById('activeTotal');
const weeklyGoalStatEl = document.getElementById('weeklyGoalStat');
const weeklyGoalCardEl = document.getElementById('weeklyGoalCard');
const paraBreakdownEl = document.getElementById('paraBreakdown');
const cognitiveLoadTextEl = document.getElementById('cognitiveLoadText');
const alertsCountTextEl = document.getElementById('alertsCountText');
const alertsListEl = document.getElementById('alertsList');
const modalEl = document.getElementById('reviewModal');
const modalTitleEl = document.getElementById('modalTitle');
const modalMetaEl = document.getElementById('modalMeta');
const modalOpenFileEl = document.getElementById('modalOpenFile');
const browserCategoryEl = document.getElementById('browserCategory');
const browserPathEl = document.getElementById('browserPath');
const browserListEl = document.getElementById('browserList');
const savedFoldersSelectEl = document.getElementById('savedFoldersSelect');
const editingFileEl = document.getElementById('editingFile');
const fileEditorEl = document.getElementById('fileEditor');
const newFolderNameEl = document.getElementById('newFolderName');
const uploadCustomNameEl = document.getElementById('uploadCustomName');
const uploadFileInputEl = document.getElementById('uploadFileInput');
const overwriteUploadEl = document.getElementById('overwriteUpload');

const recallStepEl = document.getElementById('recallStep');
const compareStepEl = document.getElementById('compareStep');
const gradeStepEl = document.getElementById('gradeStep');
const recallNoteEl = document.getElementById('recallNote');
const confidenceInputEl = document.getElementById('confidenceInput');
const confidenceValueEl = document.getElementById('confidenceValue');
const revealBtnEl = document.getElementById('revealBtn');
const toGradeBtnEl = document.getElementById('toGradeBtn');
const stepBadge1El = document.getElementById('stepBadge1');
const stepBadge2El = document.getElementById('stepBadge2');
const stepBadge3El = document.getElementById('stepBadge3');
const lociCardEl = document.getElementById('lociCard');
const lociTextEl = document.getElementById('lociText');
const flashcardBoxEl = document.getElementById('flashcardBox');
const flashcardPromptEl = document.getElementById('flashcardPrompt');
const flashcardAnswerEl = document.getElementById('flashcardAnswer');
const showFlashcardAnswerBtnEl = document.getElementById('showFlashcardAnswerBtn');
const nextFlashcardBtnEl = document.getElementById('nextFlashcardBtn');
const weeklyGoalModalEl = document.getElementById('weeklyGoalModal');
const closeWeeklyGoalModalBtnEl = document.getElementById('closeWeeklyGoalModalBtn');
const weeklyGoalSummaryEl = document.getElementById('weeklyGoalSummary');
const weeklyGoalDailyListEl = document.getElementById('weeklyGoalDailyList');
const weeklyDayDetailTitleEl = document.getElementById('weeklyDayDetailTitle');
const weeklyDayItemsListEl = document.getElementById('weeklyDayItemsList');
const weeklyGoalFocusListEl = document.getElementById('weeklyGoalFocusList');
const quickSummaryModalEl = document.getElementById('quickSummaryModal');
const closeQuickSummaryModalBtnEl = document.getElementById('closeQuickSummaryModalBtn');
const quickSummaryTitleEl = document.getElementById('quickSummaryTitle');
const quickSummaryMetaEl = document.getElementById('quickSummaryMeta');
const quickSummaryCardsEl = document.getElementById('quickSummaryCards');
const quickSummaryPreviewEl = document.getElementById('quickSummaryPreview');
const quickSummaryOpenLinkEl = document.getElementById('quickSummaryOpenLink');
const quickNextReviewDateEl = document.getElementById('quickNextReviewDate');
const quickPostponeDaysEl = document.getElementById('quickPostponeDays');
const saveQuickScheduleBtnEl = document.getElementById('saveQuickScheduleBtn');
const quickLociPalaceEl = document.getElementById('quickLociPalace');
const quickLociRoomEl = document.getElementById('quickLociRoom');
const quickLociHookEl = document.getElementById('quickLociHook');
const quickFlashcardsRawEl = document.getElementById('quickFlashcardsRaw');
const saveQuickMemoryBtnEl = document.getElementById('saveQuickMemoryBtn');
const quickSummaryEditorEl = document.getElementById('quickSummaryEditor');
const saveQuickTextBtnEl = document.getElementById('saveQuickTextBtn');
const quickFlashcardsPreviewEl = document.getElementById('quickFlashcardsPreview');
const summaryParaCategoryEl = document.getElementById('summaryParaCategory');
const summaryFolderNameEl = document.getElementById('summaryFolderName');
const summarySavedFoldersSelectEl = document.getElementById('summarySavedFoldersSelect');
const summaryUseSavedFolderBtnEl = document.getElementById('summaryUseSavedFolderBtn');
const createBackupBtnEl = document.getElementById('createBackupBtn');
const refreshBackupsBtnEl = document.getElementById('refreshBackupsBtn');
const restoreBackupBtnEl = document.getElementById('restoreBackupBtn');
const backupSelectEl = document.getElementById('backupSelect');
const backupStatusEl = document.getElementById('backupStatus');
let currentQuickSummary = null;

init();

async function init() {
  document.getElementById('summaryForm').addEventListener('submit', createSummary);
  modalEl.addEventListener('click', onModalClick);
  confidenceInputEl.addEventListener('input', () => {
    confidenceValueEl.textContent = `${confidenceInputEl.value}%`;
  });
  revealBtnEl.addEventListener('click', revealCompareStep);
  toGradeBtnEl.addEventListener('click', () => setReviewStep(3));
  showFlashcardAnswerBtnEl.addEventListener('click', showFlashcardAnswer);
  nextFlashcardBtnEl.addEventListener('click', nextFlashcard);
  weeklyGoalCardEl.addEventListener('click', openWeeklyGoalDetails);
  closeWeeklyGoalModalBtnEl.addEventListener('click', closeWeeklyGoalModal);
  closeQuickSummaryModalBtnEl.addEventListener('click', closeQuickSummaryModal);
  saveQuickMemoryBtnEl.addEventListener('click', saveQuickMemory);
  saveQuickTextBtnEl.addEventListener('click', saveQuickText);
  saveQuickScheduleBtnEl.addEventListener('click', saveQuickSchedule);
  summaryParaCategoryEl.addEventListener('change', refreshSummarySavedFoldersSelector);
  summaryUseSavedFolderBtnEl.addEventListener('click', applySavedSummaryFolder);
  createBackupBtnEl.addEventListener('click', createBackup);
  refreshBackupsBtnEl.addEventListener('click', refreshBackupsList);
  restoreBackupBtnEl.addEventListener('click', restoreSelectedBackup);

  document.getElementById('browseBtn').addEventListener('click', () => {
    state.browsing.category = browserCategoryEl.value;
    state.browsing.path = browserPathEl.value.trim();
    loadParaFolder();
  });

  browserCategoryEl.addEventListener('change', () => {
    state.browsing.category = browserCategoryEl.value;
    state.browsing.path = '';
    browserPathEl.value = '';
    refreshSavedFoldersSelector();
    loadParaFolder();
  });

  document.getElementById('createFolderBtn').addEventListener('click', createFolder);
  document.getElementById('deleteFolderBtn').addEventListener('click', deleteCurrentFolder);
  document.getElementById('uploadBtn').addEventListener('click', uploadToCurrentFolder);
  document.getElementById('saveFileBtn').addEventListener('click', saveEditingFile);
  document.getElementById('openSavedFolderBtn').addEventListener('click', openSavedFolder);

  await refreshAll();
  await refreshSummarySavedFoldersSelector();
  await refreshBackupsList();

  setInterval(async () => {
    await refreshQueue();
    openPopupIfNeeded();
  }, 30000);
}

async function refreshAll() {
  await Promise.all([refreshDashboard(), refreshQueue(), refreshLibrary(), refreshAlerts()]);
  await refreshSavedFoldersSelector();
  await loadParaFolder();
  openPopupIfNeeded();
}

async function refreshBackupsList() {
  const res = await fetch('/api/backup/list');
  if (!res.ok) {
    backupStatusEl.textContent = 'Falha ao carregar backups.';
    return;
  }

  const backups = await res.json();
  backupSelectEl.innerHTML = '';
  if (!backups.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Nenhum backup';
    backupSelectEl.appendChild(opt);
    backupStatusEl.textContent = 'Nenhum backup criado ainda.';
    return;
  }

  for (const b of backups) {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = `${b.id} (${formatDateTime(b.createdAt)})`;
    backupSelectEl.appendChild(opt);
  }

  backupStatusEl.textContent = `${backups.length} backup(s) disponivel(is).`;
}

async function createBackup() {
  const res = await fetch('/api/backup/create', { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    backupStatusEl.textContent = err.error || 'Falha ao criar backup.';
    return;
  }
  const data = await res.json();
  backupStatusEl.textContent = `Backup criado: ${data.id}`;
  await refreshBackupsList();
}

async function restoreSelectedBackup() {
  const id = backupSelectEl.value;
  if (!id) {
    alert('Escolha um backup na lista.');
    return;
  }

  if (!confirm(`Restaurar backup ${id}? Isso substitui os dados atuais do banco.`)) {
    return;
  }

  const res = await fetch('/api/backup/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    backupStatusEl.textContent = err.error || 'Falha ao restaurar backup.';
    return;
  }

  backupStatusEl.textContent = `Backup restaurado: ${id}`;
  await refreshAll();
}

async function refreshDashboard() {
  const res = await fetch('/api/dashboard');
  const data = await res.json();

  dueTodayEl.textContent = data.dueToday;
  activeTotalEl.textContent = data.active;
  weeklyGoalStatEl.textContent = `${data.weeklyGoal.reviewedThisWeek}/${data.weeklyGoal.targetReviews}`;
  cognitiveLoadTextEl.textContent = `Carga cognitiva: ${data.weeklyGoal.cognitiveLoad} | alvo diario: ${data.weeklyGoal.dailyTarget}`;
  alertsCountTextEl.textContent = `Alertas de ilusao: ${data.openIllusions}`;
  paraBreakdownEl.textContent = (data.byPara || []).map((x) => `${x.paraCategory}: ${x.total}`).join(' | ') || 'Sem resumos ainda.';
}

async function refreshAlerts() {
  const res = await fetch('/api/metacog/alerts');
  if (!res.ok) {
    alertsListEl.innerHTML = '<p class="muted">Sem alertas no momento.</p>';
    return;
  }

  const alerts = await res.json();
  if (!alerts.length) {
    alertsListEl.innerHTML = '<p class="muted">Sem alertas no momento.</p>';
    return;
  }

  alertsListEl.innerHTML = alerts.map((item) => `
    <article class="item">
      <strong>${escapeHtml(item.title)}</strong>
      <small class="muted">${escapeHtml(item.message)}</small>
      <div class="item-actions">
        <button onclick="resolveAlert(${item.id})" class="btn-secondary">Marcar como resolvido</button>
      </div>
    </article>
  `).join('');
}

async function refreshQueue() {
  const res = await fetch('/api/review-queue');
  state.queue = await res.json();
  renderQueue();
}

async function refreshLibrary() {
  const res = await fetch('/api/summaries');
  const data = await res.json();

  if (!data.length) {
    libraryEl.innerHTML = '<p class="muted">Nenhum resumo cadastrado.</p>';
    return;
  }

  libraryEl.innerHTML = data.map((item) => {
    const fileHref = toOpenFileUrl(item.filePath);
    return `
      <article class="item">
        <div class="item-head">
          <strong>${escapeHtml(item.title)}</strong>
          <small>${item.status}</small>
        </div>
        <small class="muted">PARA: ${item.paraCategory} | Proxima: ${formatDate(item.nextReviewAt)}</small>
        ${item.releaseAt ? `<small class="muted">Lancamento: ${formatDate(item.releaseAt)}</small>` : ''}
        ${(item.lociPalace || item.lociRoom || item.lociHook) ? `<small class="muted">Loci: ${escapeHtml([item.lociPalace, item.lociRoom, item.lociHook].filter(Boolean).join(' - '))}</small>` : ''}
        <div class="item-actions">
          <a href="${fileHref}" target="_blank" rel="noreferrer">Abrir</a>
          <button onclick="openQuickSummary(${item.id})" class="btn-secondary">Resumo rapido</button>
          <button onclick="postponeSummary(${item.id})" class="btn-secondary">Postergar</button>
          <button onclick="deleteSummary(${item.id})" class="btn-danger">Excluir</button>
          ${item.status === 'active' ? `<button onclick="archiveSummary(${item.id})" class="btn-danger">Arquivar</button>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

async function openWeeklyGoalDetails() {
  const res = await fetch('/api/weekly-goal/details');
  if (!res.ok) {
    alert('Falha ao carregar detalhes da meta semanal.');
    return;
  }

  const data = await res.json();
  weeklyGoalSummaryEl.textContent = `Meta: ${data.weeklyGoal.reviewedThisWeek}/${data.weeklyGoal.targetReviews} | Alvo diario: ${data.weeklyGoal.dailyTarget} | Carga: ${data.weeklyGoal.cognitiveLoad}`;

  weeklyGoalDailyListEl.innerHTML = (data.dailyPlan || []).map((day) => `
    <article class="item">
      <div class="item-head">
        <strong>${formatDate(day.date)}</strong>
        <small class="muted">Meta: ${day.target} | Previstas: ${day.dueCount}</small>
      </div>
      <div class="item-actions">
        <button onclick="openWeeklyDayDetails('${toDateInput(day.date)}')" class="btn-secondary">Ver itens do dia</button>
      </div>
    </article>
  `).join('') || '<p class="muted">Sem dados diarios.</p>';

  weeklyGoalFocusListEl.innerHTML = (data.focusCategories || []).map((cat) => `
    <article class="item">
      <strong>${escapeHtml(cat.paraCategory)}</strong>
      <small class="muted">${cat.total} revisoes previstas</small>
    </article>
  `).join('') || '<p class="muted">Sem foco definido.</p>';

  weeklyDayDetailTitleEl.textContent = 'Dia selecionado';
  weeklyDayItemsListEl.innerHTML = '<p class="muted">Clique em \"Ver itens do dia\" para abrir os resumos e flashcards.</p>';
  weeklyGoalModalEl.classList.remove('hidden');
}

function closeWeeklyGoalModal() {
  weeklyGoalModalEl.classList.add('hidden');
}

async function openWeeklyDayDetails(dateStr) {
  const res = await fetch(`/api/weekly-goal/day-details?date=${encodeURIComponent(dateStr)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao carregar o dia.');
    return;
  }

  const data = await res.json();
  weeklyDayDetailTitleEl.textContent = `Dia selecionado: ${formatDate(`${data.date}T00:00:00`)}`;

  if (!data.items || !data.items.length) {
    weeklyDayItemsListEl.innerHTML = '<p class="muted">Nenhum resumo previsto para este dia.</p>';
    return;
  }

  weeklyDayItemsListEl.innerHTML = data.items.map((item) => `
    <article class="item">
      <div class="item-head">
        <strong>${escapeHtml(item.title)}</strong>
        <small class="muted">${escapeHtml(item.paraCategory)} | ${item.flashcardsCount} flashcards</small>
      </div>
      <div class="item-actions">
        <button onclick="openQuickSummary(${item.id})" class="btn-secondary">Ver/editar flashcards</button>
      </div>
    </article>
  `).join('');
}

async function openQuickSummary(id) {
  const res = await fetch(`/api/summaries/${id}/quick`);
  if (!res.ok) {
    alert('Falha ao carregar resumo rapido.');
    return;
  }

  const data = await res.json();
  currentQuickSummary = data;
  quickSummaryTitleEl.textContent = data.title || 'Resumo rapido';
  quickSummaryMetaEl.textContent = `PARA: ${data.paraCategory} | Proxima: ${formatDate(data.nextReviewAt)} | Lancamento: ${formatDate(data.releaseAt || data.createdAt)} | Status: ${data.status}`;
  quickNextReviewDateEl.value = toDateInput(data.nextReviewAt);
  quickPostponeDaysEl.value = '';
  quickLociPalaceEl.value = data.lociPalace || '';
  quickLociRoomEl.value = data.lociRoom || '';
  quickLociHookEl.value = data.lociHook || '';
  quickFlashcardsRawEl.value = (data.flashcards || []).map((c) => `${c.prompt}::${c.answer}`).join('\n');

  quickSummaryCardsEl.textContent = `Flashcards: ${data.flashcardsCount}`;
  renderQuickFlashcardsPreview(data.flashcards || []);
  quickSummaryEditorEl.value = data.editableText ? (data.preview || '') : '';
  quickSummaryEditorEl.disabled = !data.editableText;
  saveQuickTextBtnEl.disabled = !data.editableText;
  quickSummaryPreviewEl.textContent = data.preview || 'Sem preview disponivel.';
  quickSummaryPreviewEl.classList.toggle('hidden', !!data.editableText);
  quickSummaryOpenLinkEl.href = toOpenFileUrl(data.filePath);

  quickSummaryModalEl.classList.remove('hidden');
}

function closeQuickSummaryModal() {
  quickSummaryModalEl.classList.add('hidden');
  currentQuickSummary = null;
}

function renderQuickFlashcardsPreview(cards) {
  if (!cards.length) {
    quickFlashcardsPreviewEl.innerHTML = '<p class="muted">Nenhum flashcard conectado a este resumo.</p>';
    return;
  }
  quickFlashcardsPreviewEl.innerHTML = cards.map((c) => `
    <article class="item">
      <strong>Pergunta:</strong> ${escapeHtml(c.prompt)}
      <small class="muted"><strong>Resposta:</strong> ${escapeHtml(c.answer)}</small>
    </article>
  `).join('');
}

async function saveQuickMemory() {
  if (!currentQuickSummary) return;
  const res = await fetch(`/api/summaries/${currentQuickSummary.id}/memory`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lociPalace: quickLociPalaceEl.value,
      lociRoom: quickLociRoomEl.value,
      lociHook: quickLociHookEl.value,
      flashcardsRaw: quickFlashcardsRawEl.value
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao salvar Loci/Flashcards.');
    return;
  }
  await openQuickSummary(currentQuickSummary.id);
  await refreshAll();
}

async function saveQuickText() {
  if (!currentQuickSummary) return;
  const res = await fetch(`/api/summaries/${currentQuickSummary.id}/text`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: quickSummaryEditorEl.value
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao salvar texto do resumo.');
    return;
  }
  await openQuickSummary(currentQuickSummary.id);
  await refreshAll();
}

async function saveQuickSchedule() {
  if (!currentQuickSummary) return;

  const payload = {};
  const dateValue = String(quickNextReviewDateEl.value || '').trim();
  const postponeRaw = String(quickPostponeDaysEl.value || '').trim();

  if (dateValue) payload.nextReviewDate = dateValue;
  if (postponeRaw !== '') payload.postponeDays = Number(postponeRaw);

  if (!('nextReviewDate' in payload) && !('postponeDays' in payload)) {
    alert('Informe uma data de proxima revisao ou dias para postergar.');
    return;
  }

  const res = await fetch(`/api/summaries/${currentQuickSummary.id}/schedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao salvar agenda.');
    return;
  }

  await openQuickSummary(currentQuickSummary.id);
  await refreshAll();
}

async function postponeSummary(id) {
  const raw = prompt('Postergar este resumo em quantos dias?', '1');
  if (raw === null) return;

  const days = Number(raw);
  if (!Number.isFinite(days) || days < 0) {
    alert('Informe um numero de dias valido.');
    return;
  }

  const res = await fetch(`/api/summaries/${id}/schedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postponeDays: Math.round(days) })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao postergar.');
    return;
  }

  await refreshAll();
}

function renderQueue() {
  if (!state.queue.length) {
    queueEl.innerHTML = '<p class="muted">Sem revisoes pendentes hoje.</p>';
    return;
  }

  queueEl.innerHTML = state.queue.map((item) => `
    <article class="item">
      <strong>${escapeHtml(item.title)}</strong>
      <small class="muted">PARA: ${item.paraCategory} | Etapa: ${item.currentStep + 1}/4 | Venceu em ${formatDate(item.nextReviewAt)}</small>
      <div class="item-actions">
        <button onclick="openManualPopup(${item.id})">Revisar agora</button>
      </div>
    </article>
  `).join('');
}

function openPopupIfNeeded() {
  if (state.popupItem) return;
  const due = state.queue[0];
  if (!due) return;
  showPopup(due);
}

async function showPopup(item) {
  state.popupItem = item;
  state.reviewFlow.startedAt = Date.now();
  state.reviewFlow.flashcards = [];
  state.reviewFlow.flashcardIndex = 0;
  state.reviewFlow.flashcardAnswerVisible = false;

  modalTitleEl.textContent = item.title;
  modalMetaEl.textContent = `PARA: ${item.paraCategory} | Etapa: ${item.currentStep + 1}/4`;
  modalOpenFileEl.href = toOpenFileUrl(item.filePath);
  recallNoteEl.value = '';
  confidenceInputEl.value = 50;
  confidenceValueEl.textContent = '50%';

  const lociChunks = [item.lociPalace, item.lociRoom, item.lociHook].filter(Boolean);
  if (lociChunks.length) {
    lociTextEl.textContent = lociChunks.join(' -> ');
    lociCardEl.classList.remove('hidden');
  } else {
    lociTextEl.textContent = '';
    lociCardEl.classList.add('hidden');
  }

  await loadFlashcards(item.id);
  setReviewStep(1);
  modalEl.classList.remove('hidden');
}

function setReviewStep(step) {
  recallStepEl.classList.toggle('hidden', step !== 1);
  compareStepEl.classList.toggle('hidden', step !== 2);
  gradeStepEl.classList.toggle('hidden', step !== 3);

  stepBadge1El.classList.toggle('active', step === 1);
  stepBadge2El.classList.toggle('active', step === 2);
  stepBadge3El.classList.toggle('active', step === 3);
}

function revealCompareStep() {
  setReviewStep(2);
}

async function createSummary(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const title = String(formData.get('title') || '').trim();
  const summaryText = String(formData.get('summaryText') || '').trim();
  const file = formData.get('summaryFile');

  if (!title) {
    alert('Titulo obrigatorio.');
    return;
  }

  if (!summaryText && (!file || !file.size)) {
    alert('Envie um arquivo ou cole o resumo.');
    return;
  }

  const res = await fetch('/api/summaries', { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Falha ao criar resumo.');
    return;
  }
  const created = await res.json();
  if (Number.isFinite(created.flashcardsCount)) {
    alert(`Resumo salvo. Flashcards reconhecidos: ${created.flashcardsCount}.`);
  }

  event.target.reset();
  await refreshSummarySavedFoldersSelector();
  await refreshAll();
}

async function refreshSummarySavedFoldersSelector() {
  const category = summaryParaCategoryEl.value || 'resources';
  const params = new URLSearchParams({
    category,
    maxDepth: '8'
  });

  const res = await fetch(`/api/para/folders?${params.toString()}`);
  if (!res.ok) {
    summarySavedFoldersSelectEl.innerHTML = '<option value="">(nenhuma subpasta)</option>';
    return;
  }

  const data = await res.json();
  summarySavedFoldersSelectEl.innerHTML = '';

  const emptyOpt = document.createElement('option');
  emptyOpt.value = '';
  emptyOpt.textContent = '(nenhuma subpasta)';
  summarySavedFoldersSelectEl.appendChild(emptyOpt);

  for (const folder of data.folders || []) {
    const opt = document.createElement('option');
    opt.value = folder.relativePath;
    opt.textContent = folder.relativePath;
    summarySavedFoldersSelectEl.appendChild(opt);
  }

  const current = (summaryFolderNameEl.value || '').trim();
  const hasCurrent = Array.from(summarySavedFoldersSelectEl.options).some((opt) => opt.value === current);
  if (hasCurrent) {
    summarySavedFoldersSelectEl.value = current;
  }
}

function applySavedSummaryFolder() {
  const selected = summarySavedFoldersSelectEl.value || '';
  summaryFolderNameEl.value = selected;
}

async function onModalClick(event) {
  const btn = event.target.closest('button[data-grade]');
  if (!btn || !state.popupItem) return;

  const recallSeconds = Math.max(0, Math.round((Date.now() - state.reviewFlow.startedAt) / 1000));
  const res = await fetch(`/api/summaries/${state.popupItem.id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grade: btn.dataset.grade,
      confidence: Number(confidenceInputEl.value),
      recallNote: recallNoteEl.value,
      recallSeconds
    })
  });

  if (!res.ok) {
    alert('Falha ao registrar revisao.');
    return;
  }
  const data = await res.json();

  if (data.illusionDetected) {
    alert('Atencao: confianca alta com erro detectada. Faça 1 rodada extra de recall ativo.');
  } else if (data.adaptiveDays) {
    alert(`Proxima revisao ajustada para ${data.adaptiveDays} dia(s) pelo modo adaptativo.`);
  }

  state.popupItem = null;
  modalEl.classList.add('hidden');
  await refreshAll();
}

async function loadFlashcards(summaryId) {
  const res = await fetch(`/api/summaries/${summaryId}/flashcards`);
  if (!res.ok) {
    flashcardBoxEl.classList.add('hidden');
    return;
  }

  const cards = await res.json();
  state.reviewFlow.flashcards = cards || [];
  state.reviewFlow.flashcardIndex = 0;
  state.reviewFlow.flashcardAnswerVisible = false;

  if (!state.reviewFlow.flashcards.length) {
    flashcardBoxEl.classList.add('hidden');
    return;
  }

  flashcardBoxEl.classList.remove('hidden');
  renderFlashcard();
}

function renderFlashcard() {
  const card = state.reviewFlow.flashcards[state.reviewFlow.flashcardIndex];
  if (!card) {
    flashcardBoxEl.classList.add('hidden');
    return;
  }

  flashcardPromptEl.textContent = card.prompt;
  flashcardAnswerEl.textContent = card.answer;
  flashcardAnswerEl.classList.toggle('hidden', !state.reviewFlow.flashcardAnswerVisible);
}

function showFlashcardAnswer() {
  if (!state.reviewFlow.flashcards.length) return;
  state.reviewFlow.flashcardAnswerVisible = true;
  renderFlashcard();
}

function nextFlashcard() {
  if (!state.reviewFlow.flashcards.length) return;
  state.reviewFlow.flashcardIndex = (state.reviewFlow.flashcardIndex + 1) % state.reviewFlow.flashcards.length;
  state.reviewFlow.flashcardAnswerVisible = false;
  renderFlashcard();
}

async function archiveSummary(id) {
  const res = await fetch(`/api/summaries/${id}/archive`, { method: 'POST' });
  if (!res.ok) {
    alert('Falha ao arquivar.');
    return;
  }
  await refreshAll();
}

async function deleteSummary(id) {
  const confirmed = confirm('Deseja excluir este resumo da Biblioteca?');
  if (!confirmed) return;

  const removeFile = confirm('Tambem deseja excluir o arquivo fisico da pasta PARA?\\nOK = sim, Cancelar = manter arquivo.');

  const res = await fetch(`/api/summaries/${id}?removeFile=${removeFile ? 'true' : 'false'}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao excluir resumo.');
    return;
  }

  await refreshAll();
}

function openManualPopup(id) {
  const item = state.queue.find((x) => x.id === id);
  if (item) showPopup(item);
}

async function loadParaFolder() {
  const params = new URLSearchParams({ category: state.browsing.category, subpath: state.browsing.path });
  const res = await fetch(`/api/para/browse?${params.toString()}`);
  if (!res.ok) {
    browserListEl.innerHTML = '<p class="muted">Nao foi possivel abrir esta pasta.</p>';
    return;
  }

  const data = await res.json();
  state.browsing.category = data.category;
  state.browsing.path = data.currentPath || '';
  browserCategoryEl.value = data.category;
  browserPathEl.value = data.currentPath || '';
  syncSavedFolderSelect(data.currentPath || '');

  const lines = [];
  if (data.currentPath) {
    lines.push(`<article class="item"><div class="item-actions"><button onclick="openParaDir('${escapeJs(getParentPath(data.currentPath))}')" class="btn-secondary">.. Voltar</button></div></article>`);
  }

  for (const entry of data.entries) {
    if (entry.type === 'dir') {
      lines.push(`
        <article class="item">
          <div class="item-head"><strong>[Pasta] ${escapeHtml(entry.name)}</strong></div>
          <div class="item-actions">
            <button onclick="openParaDir('${escapeJs(entry.relativePath)}')" class="btn-secondary">Abrir</button>
            <button onclick="deleteFolder('${escapeJs(entry.relativePath)}')" class="btn-danger">Excluir pasta vazia</button>
          </div>
        </article>
      `);
      continue;
    }

    const fileUrl = entry.editable
      ? toViewerUrl(`${PARA_FOLDER_MAP[data.category]}/${entry.relativePath}`)
      : toVaultUrl(data.category, entry.relativePath);
    lines.push(`
      <article class="item">
        <div class="item-head"><strong>${escapeHtml(entry.name)}</strong><small>${entry.editable ? 'Editavel' : 'Somente leitura'}</small></div>
        <div class="item-actions">
          <a href="${fileUrl}" target="_blank" rel="noreferrer">Abrir</a>
          ${entry.editable ? `<button onclick="openParaFile('${escapeJs(entry.relativePath)}')" class="btn-secondary">Editar</button>` : ''}
          <button onclick="deleteFile('${escapeJs(entry.relativePath)}')" class="btn-danger">Excluir</button>
        </div>
      </article>
    `);
  }

  browserListEl.innerHTML = lines.join('') || '<p class="muted">Pasta vazia.</p>';
}

async function refreshSavedFoldersSelector() {
  const params = new URLSearchParams({
    category: state.browsing.category,
    maxDepth: '8'
  });
  const res = await fetch(`/api/para/folders?${params.toString()}`);
  if (!res.ok) {
    savedFoldersSelectEl.innerHTML = '<option value="">Raiz da categoria</option>';
    return;
  }

  const data = await res.json();
  savedFoldersSelectEl.innerHTML = '';

  const rootOpt = document.createElement('option');
  rootOpt.value = '';
  rootOpt.textContent = 'Raiz da categoria';
  savedFoldersSelectEl.appendChild(rootOpt);

  for (const folder of data.folders || []) {
    const opt = document.createElement('option');
    opt.value = folder.relativePath;
    opt.textContent = folder.relativePath;
    savedFoldersSelectEl.appendChild(opt);
  }

  syncSavedFolderSelect(state.browsing.path || '');
}

function openSavedFolder() {
  const selected = savedFoldersSelectEl.value || '';
  openParaDir(selected);
}

function syncSavedFolderSelect(currentPath) {
  const selected = String(currentPath || '');
  const hasOption = Array.from(savedFoldersSelectEl.options || []).some((opt) => opt.value === selected);
  savedFoldersSelectEl.value = hasOption ? selected : '';
}

async function openParaFile(relativePath) {
  const params = new URLSearchParams({ category: state.browsing.category, filePath: relativePath });
  const res = await fetch(`/api/para/file?${params.toString()}`);
  if (!res.ok) {
    alert('Nao foi possivel abrir arquivo para edicao.');
    return;
  }

  const data = await res.json();
  state.currentEditing = { category: data.category, filePath: data.filePath };
  editingFileEl.textContent = `Editando: ${data.category}/${data.filePath}`;
  fileEditorEl.value = data.content;
}

async function saveEditingFile() {
  if (!state.currentEditing) {
    alert('Abra um arquivo .md/.txt antes de salvar.');
    return;
  }

  const res = await fetch('/api/para/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: state.currentEditing.category, filePath: state.currentEditing.filePath, content: fileEditorEl.value })
  });

  if (!res.ok) {
    alert('Falha ao salvar arquivo.');
    return;
  }

  await loadParaFolder();
  alert('Arquivo salvo com sucesso.');
}

async function createFolder() {
  const folderName = newFolderNameEl.value.trim();
  if (!folderName) {
    alert('Informe um nome para a subpasta.');
    return;
  }

  const res = await fetch('/api/para/folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: state.browsing.category, currentPath: state.browsing.path, folderName })
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Falha ao criar pasta.');
    return;
  }

  newFolderNameEl.value = '';
  await loadParaFolder();
  await refreshSavedFoldersSelector();
  await refreshSummarySavedFoldersSelector();
}

async function uploadToCurrentFolder() {
  const file = uploadFileInputEl.files && uploadFileInputEl.files[0];
  if (!file) {
    alert('Escolha um arquivo para adicionar.');
    return;
  }

  const formData = new FormData();
  formData.append('category', state.browsing.category);
  formData.append('currentPath', state.browsing.path);
  formData.append('fileName', uploadCustomNameEl.value.trim());
  formData.append('overwrite', String(overwriteUploadEl.checked));
  formData.append('file', file);

  const res = await fetch('/api/para/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Falha ao adicionar arquivo.');
    return;
  }

  uploadFileInputEl.value = '';
  uploadCustomNameEl.value = '';
  overwriteUploadEl.checked = false;
  await loadParaFolder();
  await refreshSavedFoldersSelector();
  await refreshSummarySavedFoldersSelector();
}

async function deleteFile(relativePath) {
  if (!confirm(`Excluir arquivo ${relativePath}?`)) return;

  const res = await fetch('/api/para/file', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: state.browsing.category, filePath: relativePath })
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Falha ao excluir arquivo.');
    return;
  }

  if (state.currentEditing && state.currentEditing.filePath === relativePath) {
    state.currentEditing = null;
    editingFileEl.textContent = 'Nenhum arquivo aberto para edicao.';
    fileEditorEl.value = '';
  }

  await loadParaFolder();
}

async function deleteFolder(folderPath) {
  if (!confirm(`Excluir pasta vazia ${folderPath}?`)) return;

  const res = await fetch('/api/para/folder', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: state.browsing.category, folderPath })
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Falha ao excluir pasta.');
    return;
  }

  await loadParaFolder();
  await refreshSavedFoldersSelector();
  await refreshSummarySavedFoldersSelector();
}

async function deleteCurrentFolder() {
  if (!state.browsing.path) {
    alert('Voce esta na raiz da categoria.');
    return;
  }
  const folderPath = state.browsing.path;
  await deleteFolder(folderPath);
  state.browsing.path = getParentPath(folderPath);
  browserPathEl.value = state.browsing.path;
  await loadParaFolder();
  await refreshSavedFoldersSelector();
  await refreshSummarySavedFoldersSelector();
}

function openParaDir(relativePath) {
  state.browsing.path = relativePath;
  browserPathEl.value = relativePath;
  loadParaFolder();
}

function toPublicFileUrl(fullPath) {
  const normalized = fullPath.replaceAll('\\\\', '/').replaceAll('\\', '/');
  const marker = '/KnowledgeOSVault/';
  const idx = normalized.indexOf(marker);
  if (idx === -1) return '#';
  return `/vault/${normalized.slice(idx + marker.length)}`;
}

function toOpenFileUrl(fullPath) {
  const normalized = String(fullPath || '').replaceAll('\\\\', '/').replaceAll('\\', '/');
  const marker = '/KnowledgeOSVault/';
  const idx = normalized.indexOf(marker);
  if (idx === -1) return '#';

  const relative = normalized.slice(idx + marker.length);
  const ext = (relative.split('.').pop() || '').toLowerCase();
  if (ext === 'md' || ext === 'txt') {
    return toViewerUrl(relative);
  }
  return `/vault/${relative}`;
}

function toViewerUrl(relativePath) {
  return `/view?path=${encodeURIComponent(relativePath)}`;
}

function toVaultUrl(category, relativePath) {
  const folder = PARA_FOLDER_MAP[category] || 'Resources';
  return `/vault/${folder}/${relativePath}`;
}

function getParentPath(currentPath) {
  if (!currentPath) return '';
  const idx = currentPath.lastIndexOf('/');
  return idx === -1 ? '' : currentPath.slice(0, idx);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('pt-BR');
}

function toDateInput(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeJs(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

window.archiveSummary = archiveSummary;
window.openManualPopup = openManualPopup;
window.openParaDir = openParaDir;
window.openParaFile = openParaFile;
window.deleteFile = deleteFile;
window.deleteFolder = deleteFolder;
window.resolveAlert = resolveAlert;
window.openQuickSummary = openQuickSummary;
window.deleteSummary = deleteSummary;
window.openWeeklyDayDetails = openWeeklyDayDetails;
window.postponeSummary = postponeSummary;

async function resolveAlert(id) {
  const res = await fetch(`/api/metacog/alerts/${id}/resolve`, { method: 'POST' });
  if (!res.ok) {
    alert('Falha ao resolver alerta.');
    return;
  }
  await refreshAll();
}
