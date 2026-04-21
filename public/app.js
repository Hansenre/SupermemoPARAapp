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
  weeklyGoal: {
    currentMonth: '',
    selectedDate: ''
  },
  reviewFlow: {
    startedAt: null,
    flashcards: [],
    flashcardIndex: 0,
    flashcardAnswerVisible: false
  },
  study: {
    currentNotebookId: null,
    pages: [],
    notebooksAll: []
  },
  activeFeature: 'home'
};

const queueEl = document.getElementById('queue');
const libraryEl = document.getElementById('library');
const libraryParaFilterEl = document.getElementById('libraryParaFilter');
const dueTodayEl = document.getElementById('dueToday');
const activeTotalEl = document.getElementById('activeTotal');
const weeklyGoalStatEl = document.getElementById('weeklyGoalStat');
const weeklyGoalCardEl = document.getElementById('weeklyGoalCard');
const paraBreakdownEl = document.getElementById('paraBreakdown');
const cognitiveLoadTextEl = document.getElementById('cognitiveLoadText');
const alertsCountTextEl = document.getElementById('alertsCountText');
const alertsListEl = document.getElementById('alertsList');
const metacogCandidatesListEl = document.getElementById('metacogCandidatesList');
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
const weeklyMonthPrevBtnEl = document.getElementById('weeklyMonthPrevBtn');
const weeklyMonthNextBtnEl = document.getElementById('weeklyMonthNextBtn');
const weeklyMonthLabelEl = document.getElementById('weeklyMonthLabel');
const weeklyMonthCalendarEl = document.getElementById('weeklyMonthCalendar');
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
const studySubjectEl = document.getElementById('studySubject');
const studySubjectSelectEl = document.getElementById('studySubjectSelect');
const studyUseSubjectBtnEl = document.getElementById('studyUseSubjectBtn');
const studyParaCategoryEl = document.getElementById('studyParaCategory');
const studyFolderNameEl = document.getElementById('studyFolderName');
const studyModuleSelectEl = document.getElementById('studyModuleSelect');
const createNotebookBtnEl = document.getElementById('createNotebookBtn');
const studyAutoSelectStatusEl = document.getElementById('studyAutoSelectStatus');
const clearStudyPagesBtnEl = document.getElementById('clearStudyPagesBtn');
const deleteNotebookBtnEl = document.getElementById('deleteNotebookBtn');
const studyPagesInputEl = document.getElementById('studyPagesInput');
const uploadStudyPagesBtnEl = document.getElementById('uploadStudyPagesBtn');
const studyUploadStatusEl = document.getElementById('studyUploadStatus');
const generateStudyPdfBtnEl = document.getElementById('generateStudyPdfBtn');
const studyPdfLinkEl = document.getElementById('studyPdfLink');
const runStudyOcrBtnEl = document.getElementById('runStudyOcrBtn');
const studySearchInputEl = document.getElementById('studySearchInput');
const searchStudyBtnEl = document.getElementById('searchStudyBtn');
const studySearchResultsEl = document.getElementById('studySearchResults');
const summarizeStudyBtnEl = document.getElementById('summarizeStudyBtn');
const sendStudyToMemoryBtnEl = document.getElementById('sendStudyToMemoryBtn');
const studySummaryOutputEl = document.getElementById('studySummaryOutput');
const studyFlashcardsOutputEl = document.getElementById('studyFlashcardsOutput');
const studyPagesListEl = document.getElementById('studyPagesList');
const featureSectionEls = Array.from(document.querySelectorAll('.feature-section'));
const featureTargetEls = Array.from(document.querySelectorAll('[data-feature-target]'));
const featureNavEl = document.getElementById('featureNav');
let studyNotebooksRefreshTimer = null;
let currentQuickSummary = null;

init();

async function init() {
  initFeatureNavigation();
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
  weeklyMonthPrevBtnEl.addEventListener('click', () => loadWeeklyMonthCalendar(shiftYearMonth(state.weeklyGoal.currentMonth, -1)));
  weeklyMonthNextBtnEl.addEventListener('click', () => loadWeeklyMonthCalendar(shiftYearMonth(state.weeklyGoal.currentMonth, 1)));
  closeQuickSummaryModalBtnEl.addEventListener('click', closeQuickSummaryModal);
  saveQuickMemoryBtnEl.addEventListener('click', saveQuickMemory);
  saveQuickTextBtnEl.addEventListener('click', saveQuickText);
  saveQuickScheduleBtnEl.addEventListener('click', saveQuickSchedule);
  libraryParaFilterEl.addEventListener('change', refreshLibrary);
  summaryParaCategoryEl.addEventListener('change', refreshSummarySavedFoldersSelector);
  summaryUseSavedFolderBtnEl.addEventListener('click', applySavedSummaryFolder);
  createBackupBtnEl.addEventListener('click', createBackup);
  refreshBackupsBtnEl.addEventListener('click', refreshBackupsList);
  restoreBackupBtnEl.addEventListener('click', restoreSelectedBackup);
  createNotebookBtnEl.addEventListener('click', createOrSelectStudyNotebook);
  studyParaCategoryEl.addEventListener('change', onStudyParaCategoryChange);
  studySubjectEl.addEventListener('input', onStudyFieldsChange);
  studyFolderNameEl.addEventListener('input', onStudyFieldsChange);
  studySubjectSelectEl.addEventListener('change', applySelectedStudySubject);
  studyUseSubjectBtnEl.addEventListener('click', applySelectedStudySubject);
  studyModuleSelectEl.addEventListener('change', applySelectedStudyModule);
  clearStudyPagesBtnEl.addEventListener('click', clearStudyPages);
  deleteNotebookBtnEl.addEventListener('click', deleteStudyNotebook);
  uploadStudyPagesBtnEl.addEventListener('click', uploadStudyPages);
  generateStudyPdfBtnEl.addEventListener('click', generateStudyPdf);
  studyPdfLinkEl.addEventListener('click', (event) => {
    const href = String(studyPdfLinkEl.getAttribute('href') || '').trim();
    if (!href || href === '#') {
      event.preventDefault();
      alert('Ainda nao existe PDF gerado para este caderno.');
    }
  });
  if (runStudyOcrBtnEl && !runStudyOcrBtnEl.disabled) {
    runStudyOcrBtnEl.addEventListener('click', runStudyOcr);
  }
  if (searchStudyBtnEl && !searchStudyBtnEl.disabled) {
    searchStudyBtnEl.addEventListener('click', searchStudyOcr);
  }
  if (summarizeStudyBtnEl && !summarizeStudyBtnEl.disabled) {
    summarizeStudyBtnEl.addEventListener('click', summarizeStudyNotebook);
  }
  sendStudyToMemoryBtnEl.addEventListener('click', sendStudyToMemory);

  document.getElementById('browseBtn').addEventListener('click', () => {
    state.browsing.category = browserCategoryEl.value;
    state.browsing.path = browserPathEl.value.trim();
    loadParaFolder();
  });
  browserPathEl.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
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
  savedFoldersSelectEl.addEventListener('change', () => {
    const selected = savedFoldersSelectEl.value || '';
    openParaDir(selected);
  });

  await refreshAll();
  await refreshSummarySavedFoldersSelector();
  await refreshBackupsList();
  await refreshStudyNotebooks();

  setInterval(async () => {
    await refreshQueue();
    openPopupIfNeeded();
  }, 30000);
}

function initFeatureNavigation() {
  for (const el of featureTargetEls) {
    el.addEventListener('click', () => {
      const target = String(el.dataset.featureTarget || '').trim();
      if (!target) return;
      setFeatureView(target, true);
    });
  }

  window.addEventListener('hashchange', () => {
    const hashFeature = String(window.location.hash || '').replace(/^#/, '');
    if (!hashFeature) {
      setFeatureView('home', false);
      return;
    }
    setFeatureView(hashFeature, false);
  });

  const initialFeature = String(window.location.hash || '').replace(/^#/, '') || 'home';
  setFeatureView(initialFeature, false);
}

function setFeatureView(feature, updateHash) {
  const allowed = new Set(['home', 'summary', 'study', 'review', 'library', 'metacog', 'explorer', 'backup']);
  const safeFeature = allowed.has(feature) ? feature : 'home';
  state.activeFeature = safeFeature;

  for (const section of featureSectionEls) {
    const match = section.dataset.feature === safeFeature;
    section.classList.toggle('feature-active', match);
  }

  if (featureNavEl) {
    for (const btn of featureNavEl.querySelectorAll('[data-feature-target]')) {
      const match = btn.dataset.featureTarget === safeFeature;
      btn.classList.toggle('active-feature', match);
    }
  }

  if (updateHash) {
    window.location.hash = safeFeature;
  }
}

async function refreshAll() {
  await Promise.all([refreshDashboard(), refreshQueue(), refreshLibrary(), refreshAlerts(), refreshMetacogCandidates()]);
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

async function refreshStudyNotebooks() {
  const res = await fetch('/api/study/notebooks');
  if (!res.ok) {
    state.study.notebooksAll = [];
    refreshStudySubjectSelector();
    refreshStudyModuleSelector();
    resolveCurrentStudyNotebookSelection();
    return;
  }
  const allNotebooks = await res.json();
  state.study.notebooksAll = allNotebooks;
  refreshStudySubjectSelector();
  refreshStudyModuleSelector();
  resolveCurrentStudyNotebookSelection();
  await loadStudyNotebookPages();
}

async function onStudyParaCategoryChange() {
  await refreshStudyNotebooks();
}

function onStudyFieldsChange() {
  refreshStudySubjectSelector();
  refreshStudyModuleSelector();
  resolveCurrentStudyNotebookSelection();
  scheduleStudyNotebooksRefresh();
}

function scheduleStudyNotebooksRefresh() {
  if (studyNotebooksRefreshTimer) {
    clearTimeout(studyNotebooksRefreshTimer);
  }
  studyNotebooksRefreshTimer = setTimeout(async () => {
    await refreshStudyNotebooks();
  }, 250);
}

function refreshStudyModuleSelector() {
  if (!studyModuleSelectEl) return;

  const para = String(studyParaCategoryEl.value || '').trim().toLowerCase();
  const subject = String(studySubjectEl.value || '').trim();
  const currentModule = String(studyFolderNameEl.value || '').trim();

  const items = (state.study.notebooksAll || [])
    .filter((n) => String(n.paraCategory || '').toLowerCase() === para)
    .filter((n) => areSameStudySubject(n.subject, subject))
    .map((n) => getStudyModuleFromNotebook(n.folderName, n.subject))
    .filter((x) => Boolean(String(x || '').trim()));

  const unique = Array.from(new Set(items)).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  studyModuleSelectEl.innerHTML = '';

  const emptyOpt = document.createElement('option');
  emptyOpt.value = '';
  emptyOpt.textContent = unique.length ? 'Selecione uma subpasta existente' : 'Nenhuma subpasta existente';
  studyModuleSelectEl.appendChild(emptyOpt);

  for (const modulePath of unique) {
    const opt = document.createElement('option');
    opt.value = modulePath;
    opt.textContent = modulePath;
    studyModuleSelectEl.appendChild(opt);
  }

  if (unique.includes(currentModule)) {
    studyModuleSelectEl.value = currentModule;
  } else {
    studyModuleSelectEl.value = '';
  }
}

function refreshStudySubjectSelector() {
  if (!studySubjectSelectEl) return;
  const para = String(studyParaCategoryEl.value || '').trim().toLowerCase();
  const currentSubject = String(studySubjectEl.value || '').trim();

  const subjects = Array.from(new Set(
    (state.study.notebooksAll || [])
      .filter((n) => String(n.paraCategory || '').toLowerCase() === para)
      .map((n) => String(n.subject || '').trim())
      .filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

  studySubjectSelectEl.innerHTML = '';
  const emptyOpt = document.createElement('option');
  emptyOpt.value = '';
  emptyOpt.textContent = subjects.length ? 'Selecione uma materia existente' : 'Nenhuma materia existente';
  studySubjectSelectEl.appendChild(emptyOpt);

  for (const s of subjects) {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    studySubjectSelectEl.appendChild(opt);
  }

  const match = subjects.find((s) => areSameStudySubject(s, currentSubject));
  studySubjectSelectEl.value = match || '';
}

function applySelectedStudyModule() {
  if (!studyModuleSelectEl) return;
  const selected = String(studyModuleSelectEl.value || '').trim();
  if (!selected) return;
  studyFolderNameEl.value = selected;
  resolveCurrentStudyNotebookSelection();
}

function applySelectedStudySubject() {
  if (!studySubjectSelectEl) return;
  const selected = String(studySubjectSelectEl.value || '').trim();
  if (!selected) return;
  studySubjectEl.value = selected;
  refreshStudyModuleSelector();
  resolveCurrentStudyNotebookSelection();
}

function resolveCurrentStudyNotebookSelection() {
  const para = String(studyParaCategoryEl.value || '').trim().toLowerCase();
  const subject = String(studySubjectEl.value || '').trim();
  const module = String(studyFolderNameEl.value || '').trim();

  const match = (state.study.notebooksAll || []).find((n) => {
    if (String(n.paraCategory || '').toLowerCase() !== para) return false;
    if (!areSameStudySubject(n.subject, subject)) return false;
    const notebookModule = getStudyModuleFromNotebook(n.folderName, n.subject);
    return String(notebookModule || '').trim() === module;
  });

  state.study.currentNotebookId = match ? Number(match.id) : null;
  if (studyAutoSelectStatusEl) {
    if (match) {
      studyAutoSelectStatusEl.textContent = `Caderno ativo: ${match.subject} (${match.paraCategory}/${String(match.folderName || '').replaceAll('\\', '/')})`;
    } else {
      studyAutoSelectStatusEl.textContent = 'Nenhum caderno existente para essa combinacao (Materia + Subpasta).';
    }
  }
}

function areSameStudySubject(a, b) {
  const left = normalizeStudySubjectKey(a);
  const right = normalizeStudySubjectKey(b);
  return left && right && left === right;
}

function normalizeStudySubjectKey(value) {
  return String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

async function createOrSelectStudyNotebook() {
  const subject = studySubjectEl.value.trim();
  if (!subject) {
    alert('Informe a materia antes de criar o caderno.');
    return;
  }

  const payload = {
    subject,
    paraCategory: studyParaCategoryEl.value,
    folderName: studyFolderNameEl.value.trim()
  };

  const res = await fetch('/api/study/notebooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao criar caderno.');
    return;
  }

  const data = await res.json();
  state.study.currentNotebookId = Number(data.id);
  await refreshStudyNotebooks();

  if (data.reused) {
    alert(`Ja existia caderno nessa pasta: ${data.paraCategory}/${String(data.folderName || '').replaceAll('\\', '/')}`);
  } else {
    alert(`Caderno criado em: ${data.paraCategory}/${String(data.folderName || '').replaceAll('\\', '/')}`);
  }
}

async function loadStudyNotebookPages() {
  const id = state.study.currentNotebookId;
  if (!id) {
    state.study.pages = [];
    studySummaryOutputEl.value = '';
    studyFlashcardsOutputEl.value = '';
    refreshStudyModuleSelector();
    studyPagesListEl.innerHTML = '<p class="muted">Selecione ou crie um caderno para comecar.</p>';
    setStudyPdfLink(null);
    if (studySearchResultsEl) studySearchResultsEl.innerHTML = '';
    return;
  }

  const res = await fetch(`/api/study/notebooks/${id}/pages`);
  if (!res.ok) {
    state.study.pages = [];
    studyPagesListEl.innerHTML = '<p class="muted">Falha ao carregar paginas.</p>';
    setStudyPdfLink(null);
    return;
  }
  const data = await res.json();
  const pages = data.pages || [];
  state.study.pages = pages;
  studySubjectEl.value = data.notebook?.subject || '';
  studyParaCategoryEl.value = data.notebook?.paraCategory || 'resources';
  studyFolderNameEl.value = getStudyModuleFromNotebook(data.notebook?.folderName, data.notebook?.subject);
  refreshStudyModuleSelector();
  studySummaryOutputEl.value = data.notebook?.generatedSummary || '';
  studyFlashcardsOutputEl.value = data.notebook?.generatedFlashcards || '';
  setStudyPdfLink(data.notebook?.pdfUrl || null);
  if (!pages.length) {
    studyPagesListEl.innerHTML = '<p class="muted">Nenhuma pagina enviada ainda.</p>';
    return;
  }

  studyPagesListEl.innerHTML = pages.map((page) => `
    <article class="item">
      <div class="item-head">
        <strong>Pagina ${page.pageOrder} (ordem automatica)</strong>
        <small class="muted">ID ${page.id}</small>
      </div>
      <small class="muted">Arquivo: ${escapeHtml(getFileNameFromPath(page.imagePath))}</small>
      <div class="item-actions">
        <a href="${page.imageUrl}" target="_blank" rel="noreferrer">Abrir foto</a>
        <button onclick="deleteStudyPage(${page.id})" class="btn-danger">Excluir foto</button>
      </div>
    </article>
  `).join('');
}

async function uploadStudyPages() {
  const id = state.study.currentNotebookId;
  if (!id) {
    alert('Crie/seleciona um caderno primeiro.');
    return;
  }
  const files = studyPagesInputEl.files;
  if (!files || !files.length) {
    alert('Selecione as fotos para enviar.');
    return;
  }

  setStudyUploadBusy(true);
  try {
    const formData = new FormData();
    const total = files.length;
    setStudyUploadStatus(`Preparando ${total} foto(s)...`, true);
    for (let i = 0; i < total; i += 1) {
      setStudyUploadStatus(`Processando foto ${i + 1}/${total}...`, true);
      const normalized = await normalizeStudyImageFile(files[i]);
      formData.append('pages', normalized);
    }

    setStudyUploadStatus('Enviando fotos para o servidor...', true);
    const res = await fetch(`/api/study/notebooks/${id}/pages`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao enviar fotos.');
    }

    studyPagesInputEl.value = '';
    await loadStudyNotebookPages();
    setStudyUploadStatus(`Concluido. ${total} foto(s) enviada(s).`, false);
  } catch (err) {
    setStudyUploadStatus('Falha no envio. Tente novamente.', false);
    alert(err.message || 'Falha ao enviar fotos.');
  } finally {
    setStudyUploadBusy(false);
  }
}

async function normalizeStudyImageFile(file) {
  const mime = String(file.type || '').toLowerCase();
  if (!mime.startsWith('image/')) {
    throw new Error('Arquivo invalido. Envie apenas imagens.');
  }

  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Nao foi possivel processar a imagem.');
  }
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Falha ao converter imagem para JPG.'));
    }, 'image/jpeg', 0.92);
  });

  const name = String(file.name || 'pagina').replace(/\.[^.]+$/, '');
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Imagem invalida para upload.'));
    };
    img.src = url;
  });
}

function setStudyUploadStatus(message, working) {
  if (!studyUploadStatusEl) return;
  studyUploadStatusEl.textContent = String(message || '');
  studyUploadStatusEl.classList.toggle('working', Boolean(working));
}

function setStudyUploadBusy(busy) {
  const flag = Boolean(busy);
  uploadStudyPagesBtnEl.disabled = flag;
  studyPagesInputEl.disabled = flag;
}

function setStudyPdfLink(pdfUrl) {
  const href = String(pdfUrl || '').trim();
  if (href) {
    studyPdfLinkEl.href = `${href}${href.includes('?') ? '&' : '?'}v=${Date.now()}`;
    studyPdfLinkEl.textContent = 'Abrir PDF gerado';
    studyPdfLinkEl.style.opacity = '1';
    studyPdfLinkEl.style.pointerEvents = 'auto';
    return;
  }
  studyPdfLinkEl.href = '#';
  studyPdfLinkEl.textContent = 'Abrir PDF';
  studyPdfLinkEl.style.opacity = '0.65';
  studyPdfLinkEl.style.pointerEvents = 'auto';
}

async function deleteStudyPage(pageId) {
  const notebookId = state.study.currentNotebookId;
  if (!notebookId) {
    alert('Selecione um caderno.');
    return;
  }
  const ok = confirm('Excluir esta foto da apostila?');
  if (!ok) return;

  const res = await fetch(`/api/study/notebooks/${notebookId}/pages/${pageId}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao excluir foto.');
    return;
  }

  await loadStudyNotebookPages();
}

async function clearStudyPages() {
  const notebookId = state.study.currentNotebookId;
  if (!notebookId) {
    alert('Selecione um caderno.');
    return;
  }
  const ok = confirm('Limpar todas as fotos deste caderno?');
  if (!ok) return;

  const res = await fetch(`/api/study/notebooks/${notebookId}/pages`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao limpar fotos.');
    return;
  }

  setStudyPdfLink(null);
  await loadStudyNotebookPages();
}

async function deleteStudyNotebook() {
  const notebookId = state.study.currentNotebookId;
  if (!notebookId) {
    alert('Selecione um caderno.');
    return;
  }
  const ok = confirm('Excluir o caderno e a pasta _StudyScans dele?');
  if (!ok) return;

  const res = await fetch(`/api/study/notebooks/${notebookId}?removeFiles=true`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao excluir caderno.');
    return;
  }

  state.study.currentNotebookId = null;
  setStudyPdfLink(null);
  studySummaryOutputEl.value = '';
  studyFlashcardsOutputEl.value = '';
  await refreshStudyNotebooks();
}

async function generateStudyPdf() {
  const id = state.study.currentNotebookId;
  if (!id) {
    alert('Selecione um caderno.');
    return;
  }

  const res = await fetch(`/api/study/notebooks/${id}/pdf`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao gerar PDF.');
    return;
  }

  const data = await res.json();
  setStudyPdfLink(data.pdfUrl || null);
}

function getFileNameFromPath(fullPath) {
  const value = String(fullPath || '');
  const normalized = value.replaceAll('\\', '/');
  const idx = normalized.lastIndexOf('/');
  if (idx === -1) return normalized;
  return normalized.slice(idx + 1);
}

function getStudyModuleFromNotebook(folderName, subject) {
  const full = String(folderName || '').replaceAll('\\', '/').trim();
  if (!full) return '';
  const subjectSafe = sanitizeClientFileName(String(subject || '').trim());
  if (!subjectSafe) return full;
  if (full.toLowerCase() === subjectSafe.toLowerCase()) {
    return '';
  }
  const prefix = `${subjectSafe}/`;
  if (full.toLowerCase().startsWith(prefix.toLowerCase())) {
    return full.slice(prefix.length);
  }
  return full;
}

function sanitizeClientFileName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
}

async function runStudyOcr() {
  const id = state.study.currentNotebookId;
  if (!id) {
    alert('Selecione um caderno.');
    return;
  }
  const res = await fetch(`/api/study/notebooks/${id}/ocr`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha no OCR.');
    return;
  }
  await loadStudyNotebookPages();
  alert('OCR concluido.');
}

async function searchStudyOcr() {
  const q = studySearchInputEl.value.trim();
  if (!q) {
    alert('Digite uma palavra para pesquisar.');
    return;
  }
  const res = await fetch(`/api/study/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha na pesquisa.');
    return;
  }
  const items = await res.json();
  if (!items.length) {
    studySearchResultsEl.innerHTML = '<p class="muted">Nenhum resultado encontrado.</p>';
    return;
  }

  studySearchResultsEl.innerHTML = items.map((item) => `
    <article class="item">
      <strong>${escapeHtml(item.subject)} - Pagina ${item.pageOrder}</strong>
      <small class="muted">${escapeHtml((item.ocrText || '').slice(0, 180))}${(item.ocrText || '').length > 180 ? '...' : ''}</small>
      <div class="item-actions">
        <a href="${item.imageUrl}" target="_blank" rel="noreferrer">Abrir foto</a>
      </div>
    </article>
  `).join('');
}

async function summarizeStudyNotebook() {
  const id = state.study.currentNotebookId;
  if (!id) {
    alert('Selecione um caderno.');
    return;
  }

  const res = await fetch(`/api/study/notebooks/${id}/summarize`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao gerar resumo com ChatGPT.');
    return;
  }
  const data = await res.json();
  studySummaryOutputEl.value = data.summary || '';
  studyFlashcardsOutputEl.value = data.flashcardsRaw || '';
}

async function sendStudyToMemory() {
  const id = state.study.currentNotebookId;
  if (!id) {
    alert('Selecione um caderno.');
    return;
  }
  const res = await fetch(`/api/study/notebooks/${id}/send-to-memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: studySummaryOutputEl.value.trim(),
      flashcardsRaw: studyFlashcardsOutputEl.value.trim()
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao enviar para memorizacao.');
    return;
  }
  const data = await res.json();
  alert(`Enviado para Biblioteca. Summary ID: ${data.summaryId}. Flashcards: ${data.flashcardsCount}`);
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

async function refreshMetacogCandidates() {
  const res = await fetch('/api/metacog/candidates');
  if (!res.ok) {
    metacogCandidatesListEl.innerHTML = '<p class="muted">Nao foi possivel carregar itens monitorados.</p>';
    return;
  }

  const items = await res.json();
  if (!items.length) {
    metacogCandidatesListEl.innerHTML = '<p class="muted">Sem revisoes com confianca registradas ainda.</p>';
    return;
  }

  metacogCandidatesListEl.innerHTML = items.map((item) => `
    <article class="item">
      <div class="item-head">
        <strong>${escapeHtml(item.title)}</strong>
        <small class="muted">${item.riskFlag ? 'Em risco' : 'Sem risco'}${item.riskSource === 'auto' ? ' (auto)' : ' (manual)'}</small>
      </div>
      <small class="muted">PARA: ${escapeHtml(item.paraCategory)} | Nota: ${escapeHtml(item.grade)} | Confianca: ${Number(item.confidence)}%</small>
      <small class="muted">Score de risco: ${Math.round(Number(item.riskScore || 0) * 100)}% | Motivo: ${escapeHtml(item.riskReason || '-')}</small>
      <small class="muted">Ultima revisao: ${formatDateTime(item.reviewedAt)}</small>
      <div class="item-actions">
        <button onclick="setMetacogRiskMode(${item.summaryId}, 'risk')" class="btn-danger">Forcar risco</button>
        <button onclick="setMetacogRiskMode(${item.summaryId}, 'safe')" class="btn-secondary">Forcar sem risco</button>
        <button onclick="setMetacogRiskMode(${item.summaryId}, 'auto')" class="btn-secondary">Voltar auto</button>
      </div>
    </article>
  `).join('');
}

async function setMetacogRiskMode(summaryId, mode) {
  const res = await fetch(`/api/metacog/risk/${summaryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao atualizar risco manual.');
    return;
  }
  await refreshMetacogCandidates();
}

async function refreshQueue() {
  const res = await fetch('/api/review-queue');
  state.queue = await res.json();
  renderQueue();
}

async function refreshLibrary() {
  const res = await fetch('/api/summaries');
  const data = await res.json();
  const filter = String(libraryParaFilterEl.value || 'all').toLowerCase();
  const filtered = filter === 'all'
    ? data
    : data.filter((item) => String(item.paraCategory || '').toLowerCase() === filter);

  if (!filtered.length) {
    libraryEl.innerHTML = '<p class="muted">Nenhum resumo cadastrado.</p>';
    return;
  }

  const order = ['projects', 'areas', 'resources', 'inbox', 'archives'];
  const grouped = new Map();
  for (const key of order) grouped.set(key, []);
  for (const item of filtered) {
    const key = String(item.paraCategory || '').toLowerCase();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  }

  const sections = [];
  for (const key of order) {
    const items = grouped.get(key) || [];
    if (!items.length) continue;
    sections.push(renderLibraryGroup(key, items));
  }

  const extraKeys = Array.from(grouped.keys()).filter((k) => !order.includes(k));
  for (const key of extraKeys) {
    const items = grouped.get(key) || [];
    if (!items.length) continue;
    sections.push(renderLibraryGroup(key, items));
  }

  libraryEl.innerHTML = sections.join('');
}

function renderLibraryGroup(paraKey, items) {
  return `
    <section class="library-group">
      <article class="item">
        <div class="item-head">
          <strong>${formatParaLabel(paraKey)}</strong>
          <small>${items.length} item(ns)</small>
        </div>
      </article>
      <div class="list">
        ${items.map((item) => renderLibraryItem(item)).join('')}
      </div>
    </section>
  `;
}

function renderLibraryItem(item) {
  const fileHref = toOpenFileUrl(item.filePath);
  const primaryLabel = isTextPath(item.filePath) ? 'Abrir resumo' : 'Abrir anexo';
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
        <a href="${fileHref}" target="_blank" rel="noreferrer">${primaryLabel}</a>
        <button onclick="openQuickSummary(${item.id})" class="btn-secondary">Resumo rapido</button>
        <button onclick="postponeSummary(${item.id})" class="btn-secondary">Postergar</button>
        <button onclick="deleteSummary(${item.id})" class="btn-danger">Excluir</button>
        ${item.status === 'active' ? `<button onclick="archiveSummary(${item.id})" class="btn-danger">Arquivar</button>` : ''}
      </div>
    </article>
  `;
}

function formatParaLabel(value) {
  const key = String(value || '').toLowerCase();
  if (key === 'projects') return 'Projects';
  if (key === 'areas') return 'Areas';
  if (key === 'resources') return 'Resources';
  if (key === 'inbox') return 'Inbox';
  if (key === 'archives') return 'Archives';
  return value || 'Outros';
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

  const today = new Date();
  state.weeklyGoal.currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  state.weeklyGoal.selectedDate = toDateInput(today.toISOString());
  await loadWeeklyMonthCalendar(state.weeklyGoal.currentMonth);

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

async function loadWeeklyMonthCalendar(monthKey) {
  const res = await fetch(`/api/weekly-goal/month?month=${encodeURIComponent(monthKey)}`);
  if (!res.ok) {
    weeklyMonthLabelEl.textContent = 'Falha ao carregar mes';
    weeklyMonthCalendarEl.innerHTML = '<p class="muted">Nao foi possivel carregar o calendario mensal.</p>';
    return;
  }

  const data = await res.json();
  state.weeklyGoal.currentMonth = data.month;
  weeklyMonthLabelEl.textContent = formatMonthLabel(data.month);
  renderWeeklyMonthCalendar(data.days || []);
}

function renderWeeklyMonthCalendar(days) {
  if (!days.length) {
    weeklyMonthCalendarEl.innerHTML = '<p class="muted">Sem dados para este mes.</p>';
    return;
  }

  const firstDate = new Date(`${days[0].date}T00:00:00`);
  const startWeekday = (firstDate.getDay() + 6) % 7;
  const blanks = Array.from({ length: startWeekday }).map(() => '<article class="month-day muted-day"></article>');

  const dayCards = days.map((day) => {
    const selected = state.weeklyGoal.selectedDate === day.date ? ' selected' : '';
    return `
      <article class="month-day${selected}" onclick="openWeeklyDayDetails('${day.date}')">
        <div class="day-num">${new Date(`${day.date}T00:00:00`).getDate()}</div>
        <div class="day-meta">Meta: ${day.target}</div>
        <div class="day-meta">Previstas: ${day.dueCount}</div>
      </article>
    `;
  });

  weeklyMonthCalendarEl.innerHTML = `${blanks.join('')}${dayCards.join('')}`;
}

async function openWeeklyDayDetails(dateStr) {
  const res = await fetch(`/api/weekly-goal/day-details?date=${encodeURIComponent(dateStr)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Falha ao carregar o dia.');
    return;
  }

  const data = await res.json();
  state.weeklyGoal.selectedDate = data.date;
  await loadWeeklyMonthCalendar(state.weeklyGoal.currentMonth);
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
  quickSummaryEditorEl.value = data.editableFilePath ? (data.preview || '') : '';
  quickSummaryEditorEl.disabled = !data.editableText;
  saveQuickTextBtnEl.disabled = !data.editableText;
  quickSummaryPreviewEl.textContent = data.preview || 'Sem preview disponivel.';
  quickSummaryPreviewEl.classList.toggle('hidden', !!data.editableText);
  const preferredOpenPath = data.notePath || data.filePath;
  quickSummaryOpenLinkEl.href = toOpenFileUrl(preferredOpenPath);
  quickSummaryOpenLinkEl.textContent = isTextPath(preferredOpenPath) ? 'Abrir resumo' : 'Abrir anexo';

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
    maxDepth: '1'
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

function isTextPath(fullPath) {
  const value = String(fullPath || '').toLowerCase();
  return value.endsWith('.md') || value.endsWith('.txt');
}

function shiftYearMonth(monthKey, delta) {
  const [yearRaw, monthRaw] = String(monthKey || '').split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const base = (Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12)
    ? new Date(year, month - 1, 1)
    : new Date();
  base.setMonth(base.getMonth() + delta);
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey) {
  const [yearRaw, monthRaw] = String(monthKey || '').split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const base = (Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12)
    ? new Date(year, month - 1, 1)
    : new Date();
  return base.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
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
window.deleteStudyPage = deleteStudyPage;
window.setMetacogRiskMode = setMetacogRiskMode;

async function resolveAlert(id) {
  const res = await fetch(`/api/metacog/alerts/${id}/resolve`, { method: 'POST' });
  if (!res.ok) {
    alert('Falha ao resolver alerta.');
    return;
  }
  await refreshAll();
}
