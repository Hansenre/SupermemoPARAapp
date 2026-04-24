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
  library: {
    cache: null,
    cacheAt: 0,
    cacheTtlMs: 30000,
    search: '',
    page: 1,
    pageSize: 20
  },
  activeFeature: 'home',
  ux: {
    simpleMode: false,
    onlyRiskMetacog: false,
    pendingDeletes: {},
    guideStep: 0
  }
};
state.challengeFeedback = {};

const queueEl = document.getElementById('queue');
const reviewParaFilterEl = document.getElementById('reviewParaFilter');
const reviewFolderFilterEl = document.getElementById('reviewFolderFilter');
const libraryEl = document.getElementById('library');
const libraryParaFilterEl = document.getElementById('libraryParaFilter');
const libraryFolderFilterEl = document.getElementById('libraryFolderFilter');
const librarySearchInputEl = document.getElementById('librarySearchInput');
const libraryPageSizeEl = document.getElementById('libraryPageSize');
const libraryPrevPageBtnEl = document.getElementById('libraryPrevPageBtn');
const libraryNextPageBtnEl = document.getElementById('libraryNextPageBtn');
const libraryPageInfoEl = document.getElementById('libraryPageInfo');
const dueTodayEl = document.getElementById('dueToday');
const activeTotalEl = document.getElementById('activeTotal');
const weeklyGoalStatEl = document.getElementById('weeklyGoalStat');
const codarXpStatEl = document.getElementById('codarXpStat');
const weeklyGoalCardEl = document.getElementById('weeklyGoalCard');
const paraBreakdownEl = document.getElementById('paraBreakdown');
const cognitiveLoadTextEl = document.getElementById('cognitiveLoadText');
const metacogParaFilterEl = document.getElementById('metacogParaFilter');
const metacogFolderFilterEl = document.getElementById('metacogFolderFilter');
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
const quickSummaryHistoryBtnEl = document.getElementById('quickSummaryHistoryBtn');
const quickNextReviewDateEl = document.getElementById('quickNextReviewDate');
const quickPostponeDaysEl = document.getElementById('quickPostponeDays');
const saveQuickScheduleBtnEl = document.getElementById('saveQuickScheduleBtn');
const quickLociPalaceEl = document.getElementById('quickLociPalace');
const quickLociRoomEl = document.getElementById('quickLociRoom');
const quickLociHookEl = document.getElementById('quickLociHook');
const quickFlashcardsRawEl = document.getElementById('quickFlashcardsRaw');
const quickFlashcardsEditorEl = document.getElementById('quickFlashcardsEditor');
const quickAddFlashcardBtnEl = document.getElementById('quickAddFlashcardBtn');
const saveQuickMemoryBtnEl = document.getElementById('saveQuickMemoryBtn');
const quickSummaryEditorEl = document.getElementById('quickSummaryEditor');
const saveQuickTextBtnEl = document.getElementById('saveQuickTextBtn');
const quickFlashcardsPreviewEl = document.getElementById('quickFlashcardsPreview');
const quickChallengeSectionEl = document.getElementById('quickChallengeSection');
const quickChallengeMetaEl = document.getElementById('quickChallengeMeta');
const quickChallengeProgressBarEl = document.getElementById('quickChallengeProgressBar');
const quickChallengeProgressTextEl = document.getElementById('quickChallengeProgressText');
const quickChallengesListEl = document.getElementById('quickChallengesList');
const summaryParaCategoryEl = document.getElementById('summaryParaCategory');
const summaryFolderNameEl = document.getElementById('summaryFolderName');
const summarySavedFoldersSelectEl = document.getElementById('summarySavedFoldersSelect');
const summaryUseSavedFolderBtnEl = document.getElementById('summaryUseSavedFolderBtn');
const summaryChallengeCategoryEl = document.getElementById('summaryChallengeCategory');
const summaryCodarBaseCodeBoxEl = document.getElementById('summaryCodarBaseCodeBox');
const summaryCodarBaseCodeEl = document.getElementById('summaryCodarBaseCode');
const summaryFlashcardsRawEl = document.getElementById('summaryFlashcardsRaw');
const summaryFlashcardsEditorEl = document.getElementById('summaryFlashcardsEditor');
const summaryAddFlashcardBtnEl = document.getElementById('summaryAddFlashcardBtn');
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
const toastRegionEl = document.getElementById('toastRegion');
const onboardingCardEl = document.getElementById('onboardingCard');
const dismissOnboardingBtnEl = document.getElementById('dismissOnboardingBtn');
const simpleModeToggleEl = document.getElementById('simpleModeToggle');
const openGuideBtnEl = document.getElementById('openGuideBtn');
const openCommandPaletteBtnEl = document.getElementById('openCommandPaletteBtn');
const metacogOnlyRiskToggleEl = document.getElementById('metacogOnlyRiskToggle');
const commandPaletteModalEl = document.getElementById('commandPaletteModal');
const commandPaletteInputEl = document.getElementById('commandPaletteInput');
const commandPaletteResultsEl = document.getElementById('commandPaletteResults');
const closeCommandPaletteBtnEl = document.getElementById('closeCommandPaletteBtn');
const quickGuideModalEl = document.getElementById('quickGuideModal');
const quickGuideBodyEl = document.getElementById('quickGuideBody');
const quickGuideNextBtnEl = document.getElementById('quickGuideNextBtn');
const quickGuideDoneBtnEl = document.getElementById('quickGuideDoneBtn');
const closeQuickGuideBtnEl = document.getElementById('closeQuickGuideBtn');
const appDialogModalEl = document.getElementById('appDialogModal');
const appDialogTitleEl = document.getElementById('appDialogTitle');
const appDialogMessageEl = document.getElementById('appDialogMessage');
const appDialogInputEl = document.getElementById('appDialogInput');
const appDialogCloseBtnEl = document.getElementById('appDialogCloseBtn');
const appDialogCancelBtnEl = document.getElementById('appDialogCancelBtn');
const appDialogOkBtnEl = document.getElementById('appDialogOkBtn');
const summaryHistoryModalEl = document.getElementById('summaryHistoryModal');
const summaryHistoryTitleEl = document.getElementById('summaryHistoryTitle');
const summaryHistoryListEl = document.getElementById('summaryHistoryList');
const closeSummaryHistoryModalBtnEl = document.getElementById('closeSummaryHistoryModalBtn');
let studyNotebooksRefreshTimer = null;
let currentQuickSummary = null;
let currentDialogResolver = null;

init();

async function init() {
  initFeatureNavigation();
  document.getElementById('summaryForm').addEventListener('submit', createSummary);
  setupFlashcardEditor(summaryFlashcardsEditorEl, summaryAddFlashcardBtnEl, summaryFlashcardsRawEl);
  setupFlashcardEditor(quickFlashcardsEditorEl, quickAddFlashcardBtnEl, quickFlashcardsRawEl);
  setFlashcardEditorCards(summaryFlashcardsEditorEl, summaryFlashcardsRawEl, summaryFlashcardsRawEl?.value || '');
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
  quickSummaryHistoryBtnEl?.addEventListener('click', () => {
    if (!currentQuickSummary) return;
    openSummaryHistory(currentQuickSummary.id, currentQuickSummary.title || 'Resumo');
  });
  saveQuickMemoryBtnEl.addEventListener('click', saveQuickMemory);
  saveQuickTextBtnEl.addEventListener('click', saveQuickText);
  saveQuickScheduleBtnEl.addEventListener('click', saveQuickSchedule);
  libraryParaFilterEl.addEventListener('change', async () => {
    state.library.page = 1;
    await refreshLibraryFolderSelector();
    await refreshLibrary();
  });
  libraryFolderFilterEl?.addEventListener('change', async () => {
    state.library.page = 1;
    await refreshLibrary();
  });
  librarySearchInputEl?.addEventListener('input', () => {
    state.library.search = String(librarySearchInputEl.value || '').trim().toLowerCase();
    state.library.page = 1;
    refreshLibrary();
  });
  libraryPageSizeEl?.addEventListener('change', () => {
    const size = Number(libraryPageSizeEl.value);
    state.library.pageSize = Number.isFinite(size) && size > 0 ? size : 20;
    state.library.page = 1;
    refreshLibrary();
  });
  libraryPrevPageBtnEl?.addEventListener('click', () => {
    state.library.page = Math.max(1, Number(state.library.page || 1) - 1);
    refreshLibrary();
  });
  libraryNextPageBtnEl?.addEventListener('click', () => {
    state.library.page = Number(state.library.page || 1) + 1;
    refreshLibrary();
  });
  reviewParaFilterEl?.addEventListener('change', async () => {
    await refreshReviewFolderSelector();
    renderQueue();
  });
  reviewFolderFilterEl?.addEventListener('change', renderQueue);
  metacogParaFilterEl?.addEventListener('change', async () => {
    await refreshMetacogFolderSelector();
    await refreshMetacogCandidates();
  });
  metacogFolderFilterEl?.addEventListener('change', refreshMetacogCandidates);
  metacogOnlyRiskToggleEl?.addEventListener('change', () => {
    state.ux.onlyRiskMetacog = Boolean(metacogOnlyRiskToggleEl.checked);
    refreshMetacogCandidates();
  });
  summaryParaCategoryEl?.addEventListener('change', refreshSummarySavedFoldersSelector);
  summarySavedFoldersSelectEl?.addEventListener('change', applySavedSummaryFolder);
  summaryUseSavedFolderBtnEl?.addEventListener('click', applySavedSummaryFolder);
  summaryChallengeCategoryEl?.addEventListener('change', syncSummaryChallengeCategoryState);
  simpleModeToggleEl?.addEventListener('change', () => {
    state.ux.simpleMode = Boolean(simpleModeToggleEl.checked);
    localStorage.setItem('smp_simple_mode', state.ux.simpleMode ? '1' : '0');
    applySimpleMode();
  });
  openGuideBtnEl?.addEventListener('click', openQuickGuide);
  openCommandPaletteBtnEl?.addEventListener('click', openCommandPalette);
  closeCommandPaletteBtnEl?.addEventListener('click', closeCommandPalette);
  commandPaletteInputEl?.addEventListener('input', refreshCommandPaletteResults);
  closeQuickGuideBtnEl?.addEventListener('click', closeQuickGuide);
  quickGuideNextBtnEl?.addEventListener('click', nextGuideStep);
  quickGuideDoneBtnEl?.addEventListener('click', closeQuickGuide);
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
  dismissOnboardingBtnEl?.addEventListener('click', dismissOnboarding);
  appDialogCloseBtnEl?.addEventListener('click', () => resolveDialog(null));
  appDialogCancelBtnEl?.addEventListener('click', () => resolveDialog(null));
  appDialogOkBtnEl?.addEventListener('click', () => {
    if (!appDialogInputEl || appDialogInputEl.classList.contains('hidden')) {
      resolveDialog(true);
      return;
    }
    resolveDialog(String(appDialogInputEl.value || ''));
  });
  closeSummaryHistoryModalBtnEl?.addEventListener('click', () => {
    summaryHistoryModalEl?.classList.add('hidden');
  });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openCommandPalette();
      return;
    }
    if (event.key !== 'Escape') return;
    if (commandPaletteModalEl && !commandPaletteModalEl.classList.contains('hidden')) {
      closeCommandPalette();
      return;
    }
    if (quickGuideModalEl && !quickGuideModalEl.classList.contains('hidden')) {
      closeQuickGuide();
      return;
    }
    if (appDialogModalEl && !appDialogModalEl.classList.contains('hidden')) {
      resolveDialog(null);
      return;
    }
    if (summaryHistoryModalEl && !summaryHistoryModalEl.classList.contains('hidden')) {
      summaryHistoryModalEl.classList.add('hidden');
    }
  });

  const browseBtnEl = document.getElementById('browseBtn');
  browseBtnEl?.addEventListener('click', () => {
    state.browsing.category = browserCategoryEl.value;
    state.browsing.path = browserPathEl?.value.trim() || '';
    loadParaFolder();
  });
  browserPathEl?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    state.browsing.category = browserCategoryEl.value;
    state.browsing.path = browserPathEl?.value.trim() || '';
    loadParaFolder();
  });

  browserCategoryEl.addEventListener('change', () => {
    state.browsing.category = browserCategoryEl.value;
    state.browsing.path = '';
    if (browserPathEl) browserPathEl.value = '';
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

  showOnboardingIfNeeded();
  state.ux.simpleMode = localStorage.getItem('smp_simple_mode') === '1';
  if (simpleModeToggleEl) simpleModeToggleEl.checked = state.ux.simpleMode;
  applySimpleMode();
  if (localStorage.getItem('smp_guide_seen') !== '1') {
    openQuickGuide();
  }
  syncSummaryChallengeCategoryState();
  await refreshAll();
  await refreshSummarySavedFoldersSelector();
  await refreshBackupsList();
  await refreshStudyNotebooks();

  setInterval(async () => {
    await refreshQueue();
    openPopupIfNeeded();
  }, 30000);
}

function showToast(message, type = 'info', durationMs = 2800) {
  if (!toastRegionEl || !message) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = String(message);
  toastRegionEl.appendChild(toast);
  setTimeout(() => toast.remove(), durationMs);
}

window.alert = (message) => {
  showToast(message, 'info');
};

function showError(message) {
  showToast(message || 'Ocorreu um erro.', 'error', 3600);
}

function showSuccess(message) {
  showToast(message, 'success');
}

function showActionToast(message, actionLabel, onAction, type = 'info', durationMs = 9000) {
  if (!toastRegionEl || !message) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type} with-action`;
  const text = document.createElement('span');
  text.textContent = String(message);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'toast-action';
  btn.textContent = String(actionLabel || 'Acao');
  btn.addEventListener('click', () => {
    try {
      if (typeof onAction === 'function') onAction();
    } finally {
      toast.remove();
    }
  });
  toast.appendChild(text);
  toast.appendChild(btn);
  toastRegionEl.appendChild(toast);
  setTimeout(() => toast.remove(), durationMs);
}

function applySimpleMode() {
  document.body.classList.toggle('simple-mode', Boolean(state.ux.simpleMode));
}

function openQuickGuide() {
  state.ux.guideStep = 0;
  renderQuickGuide();
  quickGuideModalEl?.classList.remove('hidden');
}

function closeQuickGuide() {
  quickGuideModalEl?.classList.add('hidden');
  localStorage.setItem('smp_guide_seen', '1');
}

function nextGuideStep() {
  state.ux.guideStep = Math.min(state.ux.guideStep + 1, 2);
  renderQuickGuide();
}

function renderQuickGuide() {
  if (!quickGuideBodyEl) return;
  const steps = [
    {
      title: '1) Criar resumo',
      body: 'Abra "Novo resumo", escolha categoria/subpasta e salve com arquivo ou texto.'
    },
    {
      title: '2) Revisar no tempo certo',
      body: 'Vá para "Fila revisao", clique em "Revisar agora" e classifique com sinceridade.'
    },
    {
      title: '3) Melhorar com metacognicao',
      body: 'Em "Metacognicao", foque itens em risco e ajuste manual apenas quando necessario.'
    }
  ];
  const step = steps[state.ux.guideStep] || steps[0];
  quickGuideBodyEl.innerHTML = `
    <article class="item">
      <strong>${escapeHtml(step.title)}</strong>
      <small class="muted">${escapeHtml(step.body)}</small>
      <small class="muted">Passo ${state.ux.guideStep + 1}/${steps.length}</small>
    </article>
  `;
  if (quickGuideNextBtnEl) {
    quickGuideNextBtnEl.disabled = state.ux.guideStep >= (steps.length - 1);
  }
}

function openCommandPalette() {
  commandPaletteModalEl?.classList.remove('hidden');
  if (commandPaletteInputEl) {
    commandPaletteInputEl.value = '';
    commandPaletteInputEl.focus();
  }
  refreshCommandPaletteResults();
}

function closeCommandPalette() {
  commandPaletteModalEl?.classList.add('hidden');
}

function goFeature(feature) {
  setFeatureView(feature, true);
}

async function refreshCommandPaletteResults() {
  if (!commandPaletteResultsEl) return;
  if (!Array.isArray(state.library.cache)) {
    await refreshLibrary();
  }
  const query = String(commandPaletteInputEl?.value || '').trim().toLowerCase();
  const actions = [
    { title: 'Ir para Novo resumo', run: () => goFeature('summary') },
    { title: 'Ir para Fila revisao', run: () => goFeature('review') },
    { title: 'Ir para Biblioteca', run: () => goFeature('library') },
    { title: 'Ir para Metacognicao', run: () => goFeature('metacog') },
    { title: 'Abrir Explorador PARA', run: () => goFeature('explorer') }
  ];
  const summaries = (state.library.cache || []).slice(0, 120).map((item) => ({
    title: `Resumo: ${item.title}`,
    meta: `${formatParaLabel(item.paraCategory)} | ${getSummaryFolderPath(item) || 'Raiz'}`,
    run: () => {
      goFeature('library');
      openQuickSummary(item.id);
    }
  }));
  const all = [...actions, ...summaries];
  const filtered = query
    ? all.filter((item) => `${item.title} ${item.meta || ''}`.toLowerCase().includes(query))
    : all.slice(0, 12);
  if (!filtered.length) {
    commandPaletteResultsEl.innerHTML = '<p class="muted">Nenhum resultado.</p>';
    return;
  }
  commandPaletteResultsEl.innerHTML = filtered.slice(0, 20).map((item, idx) => `
    <article class="item">
      <div class="item-head">
        <strong>${escapeHtml(item.title)}</strong>
        ${item.meta ? `<small class="muted">${escapeHtml(item.meta)}</small>` : ''}
      </div>
      <div class="item-actions">
        <button onclick="runCommandPaletteItem(${idx})" class="btn-secondary">Abrir</button>
      </div>
    </article>
  `).join('');
  state.ux.commandPaletteResults = filtered.slice(0, 20);
}

function runCommandPaletteItem(idx) {
  const list = Array.isArray(state.ux.commandPaletteResults) ? state.ux.commandPaletteResults : [];
  const item = list[Number(idx)];
  if (!item || typeof item.run !== 'function') return;
  item.run();
  closeCommandPalette();
}

function showOnboardingIfNeeded() {
  if (!onboardingCardEl) return;
  const hidden = localStorage.getItem('smp_onboarding_hidden') === '1';
  onboardingCardEl.classList.toggle('hidden', hidden);
}

function dismissOnboarding() {
  localStorage.setItem('smp_onboarding_hidden', '1');
  showOnboardingIfNeeded();
}

function invalidateLibraryCache() {
  state.library.cache = null;
  state.library.cacheAt = 0;
}

function resolveDialog(value) {
  if (!currentDialogResolver) return;
  const resolver = currentDialogResolver;
  currentDialogResolver = null;
  appDialogModalEl?.classList.add('hidden');
  resolver(value);
}

function showConfirmDialog(message, title = 'Confirmacao') {
  if (!appDialogModalEl) return Promise.resolve(false);
  appDialogTitleEl.textContent = title;
  appDialogMessageEl.textContent = String(message || '');
  appDialogInputEl.classList.add('hidden');
  appDialogInputEl.value = '';
  appDialogOkBtnEl.textContent = 'Confirmar';
  appDialogModalEl.classList.remove('hidden');
  return new Promise((resolve) => {
    currentDialogResolver = (value) => resolve(Boolean(value));
  });
}

function showPromptDialog(message, defaultValue = '', title = 'Entrada') {
  if (!appDialogModalEl) return Promise.resolve(null);
  appDialogTitleEl.textContent = title;
  appDialogMessageEl.textContent = String(message || '');
  appDialogInputEl.classList.remove('hidden');
  appDialogInputEl.value = String(defaultValue || '');
  appDialogInputEl.focus();
  appDialogOkBtnEl.textContent = 'Aplicar';
  appDialogModalEl.classList.remove('hidden');
  return new Promise((resolve) => {
    currentDialogResolver = (value) => {
      if (value === null) return resolve(null);
      resolve(String(value || ''));
    };
  });
}

async function openSummaryHistory(summaryId, title) {
  if (!summaryHistoryModalEl || !summaryHistoryListEl) return;
  summaryHistoryTitleEl.textContent = `Historico: ${title}`;
  summaryHistoryListEl.innerHTML = '<p class="muted">Carregando historico...</p>';
  summaryHistoryModalEl.classList.remove('hidden');
  const res = await fetch(`/api/summaries/${summaryId}/versions`);
  if (!res.ok) {
    summaryHistoryListEl.innerHTML = '<p class="muted">Falha ao carregar historico.</p>';
    return;
  }
  const rows = await res.json();
  if (!rows.length) {
    summaryHistoryListEl.innerHTML = '<p class="muted">Sem eventos de historico.</p>';
    return;
  }
  summaryHistoryListEl.innerHTML = rows.map((row) => `
    <article class="item">
      <div class="item-head">
        <strong>${escapeHtml(String(row.reason || 'update'))}</strong>
        <small>${formatDateTime(row.createdAt)}</small>
      </div>
      <small class="muted">Versao #${Number(row.id)} | Flashcards: ${Number(row.flashcardsCount || 0)}</small>
    </article>
  `).join('');
}

function openSummaryHistoryFromList(summaryId, title) {
  openSummaryHistory(summaryId, title || 'Resumo');
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
  await Promise.all([refreshDashboard(), refreshAlerts()]);
  await refreshReviewFolderSelector();
  await refreshMetacogFolderSelector();
  await Promise.all([refreshQueue(), refreshMetacogCandidates()]);
  await refreshLibraryFolderSelector();
  await refreshLibrary();
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
    showError('Escolha um backup na lista.');
    return;
  }

  if (!(await showConfirmDialog(`Restaurar backup ${id}? Isso substitui os dados atuais do banco.`, 'Restaurar backup'))) {
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
    await refreshStudyModuleSelector();
    resolveCurrentStudyNotebookSelection();
    return;
  }
  const allNotebooks = await res.json();
  state.study.notebooksAll = allNotebooks;
  refreshStudySubjectSelector();
  await refreshStudyModuleSelector();
  resolveCurrentStudyNotebookSelection();
  await loadStudyNotebookPages();
}

async function onStudyParaCategoryChange() {
  await refreshStudyNotebooks();
}

function onStudyFieldsChange() {
  refreshStudySubjectSelector();
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

async function refreshStudyModuleSelector() {
  if (!studyModuleSelectEl) return;
  const para = String(studyParaCategoryEl.value || 'resources').trim().toLowerCase();
  const currentModule = String(studyFolderNameEl.value || '').trim();

  const params = new URLSearchParams({
    category: para,
    maxDepth: '8'
  });
  const res = await fetch(`/api/para/folders?${params.toString()}`);
  const folders = res.ok ? await res.json() : { folders: [] };
  const unique = Array.from(new Set((folders.folders || []).map((f) => String(f.relativePath || '').trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  studyModuleSelectEl.innerHTML = '';

  const rootOpt = document.createElement('option');
  rootOpt.value = '';
  rootOpt.textContent = 'Raiz da categoria';
  studyModuleSelectEl.appendChild(rootOpt);

  for (const modulePath of unique) {
    const opt = document.createElement('option');
    opt.value = modulePath;
    opt.textContent = modulePath;
    studyModuleSelectEl.appendChild(opt);
  }

  if (currentModule && unique.includes(currentModule)) {
    studyModuleSelectEl.value = currentModule;
  } else {
    studyModuleSelectEl.value = '';
  }
  studyFolderNameEl.value = studyModuleSelectEl.value || '';
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
  studyFolderNameEl.value = selected;
  resolveCurrentStudyNotebookSelection();
}

function applySelectedStudySubject() {
  if (!studySubjectSelectEl) return;
  const selected = String(studySubjectSelectEl.value || '').trim();
  if (!selected) return;
  studySubjectEl.value = selected;
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
      studyAutoSelectStatusEl.textContent = 'Sem caderno para a pasta selecionada.';
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
    await refreshStudyModuleSelector();
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
  await refreshStudyModuleSelector();
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
  const ok = await showConfirmDialog('Excluir esta foto da apostila?', 'Excluir foto');
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
  const ok = await showConfirmDialog('Limpar todas as fotos deste caderno?', 'Limpar fotos');
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
  const ok = await showConfirmDialog('Excluir o caderno e a pasta _StudyScans dele?', 'Excluir caderno');
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
    showError(err.error || 'Falha ao enviar para memorizacao.');
    return;
  }
  const data = await res.json();
  invalidateLibraryCache();
  showSuccess(`Enviado para Biblioteca. Flashcards: ${data.flashcardsCount}`);
  await refreshAll();
}

async function refreshDashboard() {
  const res = await fetch('/api/dashboard');
  const data = await res.json();

  dueTodayEl.textContent = data.dueToday;
  activeTotalEl.textContent = data.active;
  weeklyGoalStatEl.textContent = `${data.weeklyGoal.reviewedThisWeek}/${data.weeklyGoal.targetReviews}`;
  codarXpStatEl.textContent = `${Number(data.codar?.xp || 0)} (${Number(data.codar?.streakDays || 0)}d)`;
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
  metacogCandidatesListEl.innerHTML = renderLoadingSkeleton(2);
  const res = await fetch('/api/metacog/candidates');
  if (!res.ok) {
    metacogCandidatesListEl.innerHTML = '<p class="muted">Nao foi possivel carregar itens monitorados.</p>';
    return;
  }

  const items = await res.json();
  const paraFilter = String(metacogParaFilterEl?.value || 'all').toLowerCase();
  const folderFilter = String(metacogFolderFilterEl?.value || '').trim();
  const filtered = items
    .filter((item) => paraFilter === 'all' || String(item.paraCategory || '').toLowerCase() === paraFilter)
    .filter((item) => {
      if (!folderFilter) return true;
      const folderPath = getSummaryFolderPath(item);
      return folderPath === folderFilter || folderPath.startsWith(`${folderFilter}/`);
    })
    .filter((item) => !state.ux.onlyRiskMetacog || Boolean(item.riskFlag))
    .sort((a, b) => Number(b.riskFlag || 0) - Number(a.riskFlag || 0));
  if (!filtered.length) {
    metacogCandidatesListEl.innerHTML = '<p class="muted">Sem resumos para este filtro.</p>';
    return;
  }

  metacogCandidatesListEl.innerHTML = filtered.map((item) => `
    <article class="item">
      <div class="item-head">
        <strong>${escapeHtml(item.title)}</strong>
        <small class="muted">${item.riskFlag ? 'Em risco' : (item.hasReview ? 'Sem risco' : 'Sem dados')}${item.riskSource === 'auto' ? ' (auto)' : ' (manual)'}</small>
      </div>
      <small class="muted">PARA: ${escapeHtml(item.paraCategory)} | Nota: ${escapeHtml(item.grade || '--')} | Confianca: ${Number.isFinite(Number(item.confidence)) ? `${Number(item.confidence)}%` : '--'}</small>
      <small class="muted">Score de risco: ${Math.round(Number(item.riskScore || 0) * 100)}% | Motivo: ${escapeHtml(item.riskReason || '-')}</small>
      <small class="muted">Ultima revisao: ${item.reviewedAt ? formatDateTime(item.reviewedAt) : 'Sem revisao ainda'}</small>
      <div class="item-actions">
        <button onclick="openQuickSummary(${item.summaryId})" class="btn-secondary">Abrir resumo</button>
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
  queueEl.innerHTML = renderLoadingSkeleton(2);
  const res = await fetch('/api/review-queue');
  state.queue = await res.json();
  renderQueue();
}

async function refreshLibrary() {
  const now = Date.now();
  let data = state.library.cache;
  if (!Array.isArray(data) || (now - Number(state.library.cacheAt || 0)) > state.library.cacheTtlMs) {
    libraryEl.innerHTML = renderLoadingSkeleton(4);
    const res = await fetch('/api/summaries');
    if (!res.ok) {
      libraryEl.innerHTML = '<p class="muted">Falha ao carregar biblioteca.</p>';
      return;
    }
    data = await res.json();
    state.library.cache = Array.isArray(data) ? data : [];
    state.library.cacheAt = now;
    data = state.library.cache;
  }

  const paraFilter = String(libraryParaFilterEl.value || 'all').toLowerCase();
  const folderFilter = String(libraryFolderFilterEl?.value || '').trim();
  const search = String(state.library.search || '').trim().toLowerCase();
  const filteredByPara = paraFilter === 'all'
    ? data
    : data.filter((item) => String(item.paraCategory || '').toLowerCase() === paraFilter);
  const filteredByFolder = folderFilter
    ? filteredByPara.filter((item) => {
      const folderPath = getSummaryFolderPath(item);
      return folderPath === folderFilter || folderPath.startsWith(`${folderFilter}/`);
    })
    : filteredByPara;
  const filtered = search
    ? filteredByFolder.filter((item) => String(item.title || '').toLowerCase().includes(search))
    : filteredByFolder;

  if (!filtered.length) {
    libraryEl.innerHTML = `
      <article class="empty-state">
        <strong>Nenhum resumo encontrado</strong>
        <small class="muted">Ajuste filtros ou crie um novo resumo.</small>
        <div class="item-actions">
          <button onclick="goFeature('summary')">Criar novo resumo</button>
        </div>
      </article>
    `;
    if (libraryPageInfoEl) libraryPageInfoEl.textContent = 'Pagina 1 de 1';
    if (libraryPrevPageBtnEl) libraryPrevPageBtnEl.disabled = true;
    if (libraryNextPageBtnEl) libraryNextPageBtnEl.disabled = true;
    return;
  }

  const pageSize = Math.max(1, Number(state.library.pageSize || 20));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, Number(state.library.page || 1)), totalPages);
  state.library.page = safePage;
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const order = ['projects', 'areas', 'resources', 'inbox', 'archives'];
  const grouped = new Map();
  for (const key of order) grouped.set(key, []);
  for (const item of pageItems) {
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

  if (libraryPageInfoEl) libraryPageInfoEl.textContent = `Pagina ${safePage} de ${totalPages} (${filtered.length} itens)`;
  if (libraryPrevPageBtnEl) libraryPrevPageBtnEl.disabled = safePage <= 1;
  if (libraryNextPageBtnEl) libraryNextPageBtnEl.disabled = safePage >= totalPages;
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
  const challengeBadge = String(item.challengeCategory || 'none') === 'codar'
    ? `<small class="muted">Desafio: Codar</small>`
    : '';
  return `
    <article class="item">
      <div class="item-head">
        <strong>${escapeHtml(item.title)}</strong>
        <small>${item.status}</small>
      </div>
      <small class="muted">PARA: ${item.paraCategory} | Pasta: ${escapeHtml(getSummaryFolderPath(item) || 'Raiz da categoria')} | Proxima: ${formatDate(item.nextReviewAt)}</small>
      ${renderSummaryProgress(item)}
      ${item.releaseAt ? `<small class="muted">Lancamento: ${formatDate(item.releaseAt)}</small>` : ''}
      ${(item.lociPalace || item.lociRoom || item.lociHook) ? `<small class="muted">Loci: ${escapeHtml([item.lociPalace, item.lociRoom, item.lociHook].filter(Boolean).join(' - '))}</small>` : ''}
      ${challengeBadge}
      <div class="item-actions">
        <a href="${fileHref}" target="_blank" rel="noreferrer">${primaryLabel}</a>
        <button onclick="openSummaryHistoryFromList(${item.id}, '${escapeJs(item.title)}')" class="btn-secondary">Historico</button>
        <button onclick="openQuickSummary(${item.id})" class="btn-secondary">Resumo rapido</button>
        <button onclick="goFeature('review')" class="btn-secondary">Ir para revisao</button>
        <button onclick="postponeSummary(${item.id})" class="btn-secondary">Postergar</button>
        <button onclick="deleteSummary(${item.id})" class="btn-danger">Excluir</button>
        ${item.status === 'active' ? `<button onclick="archiveSummary(${item.id})" class="btn-danger">Arquivar</button>` : ''}
      </div>
    </article>
  `;
}

async function refreshLibraryFolderSelector() {
  if (!libraryParaFilterEl || !libraryFolderFilterEl) return;
  const para = String(libraryParaFilterEl.value || 'all').toLowerCase();
  if (para === 'all') {
    libraryFolderFilterEl.innerHTML = '<option value="">Selecione uma categoria PARA</option>';
    libraryFolderFilterEl.disabled = true;
    return;
  }

  const params = new URLSearchParams({
    category: para,
    maxDepth: '8'
  });
  const res = await fetch(`/api/para/folders?${params.toString()}`);
  if (!res.ok) {
    libraryFolderFilterEl.innerHTML = '<option value="">Raiz da categoria</option>';
    libraryFolderFilterEl.disabled = false;
    return;
  }

  const data = await res.json();
  const previous = String(libraryFolderFilterEl.value || '');
  libraryFolderFilterEl.innerHTML = '';
  libraryFolderFilterEl.disabled = false;

  const rootOpt = document.createElement('option');
  rootOpt.value = '';
  rootOpt.textContent = 'Raiz da categoria';
  libraryFolderFilterEl.appendChild(rootOpt);

  for (const folder of data.folders || []) {
    const opt = document.createElement('option');
    opt.value = folder.relativePath;
    opt.textContent = folder.relativePath;
    libraryFolderFilterEl.appendChild(opt);
  }

  const hasPrev = Array.from(libraryFolderFilterEl.options).some((opt) => opt.value === previous);
  libraryFolderFilterEl.value = hasPrev ? previous : '';
}

async function refreshFolderSelectorByCategory(category, selectEl, disabledLabel = 'Selecione uma categoria PARA') {
  if (!selectEl) return;
  const para = String(category || 'all').toLowerCase();
  if (para === 'all') {
    selectEl.innerHTML = `<option value="">${disabledLabel}</option>`;
    selectEl.disabled = true;
    return;
  }
  const previous = String(selectEl.value || '');
  const params = new URLSearchParams({
    category: para,
    maxDepth: '8'
  });
  const res = await fetch(`/api/para/folders?${params.toString()}`);
  selectEl.innerHTML = '';
  selectEl.disabled = false;

  const rootOpt = document.createElement('option');
  rootOpt.value = '';
  rootOpt.textContent = 'Raiz da categoria';
  selectEl.appendChild(rootOpt);

  if (res.ok) {
    const data = await res.json();
    for (const folder of data.folders || []) {
      const opt = document.createElement('option');
      opt.value = folder.relativePath;
      opt.textContent = folder.relativePath;
      selectEl.appendChild(opt);
    }
  }

  const hasPrev = Array.from(selectEl.options).some((opt) => opt.value === previous);
  selectEl.value = hasPrev ? previous : '';
}

async function refreshReviewFolderSelector() {
  await refreshFolderSelectorByCategory(reviewParaFilterEl?.value || 'all', reviewFolderFilterEl);
}

async function refreshMetacogFolderSelector() {
  await refreshFolderSelectorByCategory(metacogParaFilterEl?.value || 'all', metacogFolderFilterEl);
}

function getSummaryFolderPath(item) {
  const paraKey = String(item?.paraCategory || '').toLowerCase();
  const paraRoot = String(PARA_FOLDER_MAP[paraKey] || '').toLowerCase();
  if (!paraRoot) return '';

  const pathCandidates = [item?.notePath, item?.filePath];
  for (const raw of pathCandidates) {
    const full = String(raw || '').trim();
    if (!full) continue;
    const normalized = full.replaceAll('\\', '/');
    const lower = normalized.toLowerCase();
    const marker = `/knowledgeosvault/${paraRoot}/`;
    const idx = lower.indexOf(marker);
    if (idx < 0) continue;
    const relative = normalized.slice(idx + marker.length).replace(/^\/+/, '');
    if (!relative) return '';
    const parts = relative.split('/').filter(Boolean);
    if (parts.length <= 1) return '';
    return parts.slice(0, -1).join('/');
  }
  return '';
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

function renderLoadingSkeleton(count = 3) {
  return Array.from({ length: Math.max(1, count) }).map(() => `
    <article class="skeleton-card">
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
    </article>
  `).join('');
}

function renderSummaryProgress(item) {
  const step = Math.max(0, Number(item?.currentStep || 0));
  const pct = Math.round((Math.min(step, 3) / 3) * 100);
  const chips = [
    { label: 'Criado', done: true },
    { label: '1a revisao', done: step >= 1 },
    { label: 'Consolidando', done: step >= 2 },
    { label: 'Consolidado', done: step >= 3 }
  ];
  return `
    <div class="progress-strip"><span style="width:${pct}%"></span></div>
    <div class="status-chips">
      ${chips.map((chip) => `<span class="status-chip ${chip.done ? 'done' : ''}">${chip.label}</span>`).join('')}
    </div>
  `;
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
  state.challengeFeedback = {};
  quickSummaryTitleEl.textContent = data.title || 'Resumo rapido';
  const challengeLabel = String(data.challengeCategory || 'none') === 'codar' ? ' | Desafio: Codar' : '';
  quickSummaryMetaEl.textContent = `PARA: ${data.paraCategory} | Proxima: ${formatDate(data.nextReviewAt)} | Lancamento: ${formatDate(data.releaseAt || data.createdAt)} | Status: ${data.status}${challengeLabel}`;
  quickNextReviewDateEl.value = toDateInput(data.nextReviewAt);
  quickPostponeDaysEl.value = '';
  quickLociPalaceEl.value = data.lociPalace || '';
  quickLociRoomEl.value = data.lociRoom || '';
  quickLociHookEl.value = data.lociHook || '';
  setFlashcardEditorCards(quickFlashcardsEditorEl, quickFlashcardsRawEl, data.flashcards || []);

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
  await loadQuickChallenges(data.id, data.challengeCategory);

  quickSummaryModalEl.classList.remove('hidden');
}

function closeQuickSummaryModal() {
  quickSummaryModalEl.classList.add('hidden');
  quickChallengeSectionEl.classList.add('hidden');
  quickChallengesListEl.innerHTML = '';
  quickChallengeProgressBarEl.style.width = '0%';
  quickChallengeProgressTextEl.textContent = 'Progresso: 0/0';
  state.challengeFeedback = {};
  currentQuickSummary = null;
}

function getComplexityOptionLabel(option) {
  const raw = String(option || '').trim().toLowerCase().replace(/\s+/g, '');
  if (raw === 'o(1)') return 'Quase nao muda com mais dados';
  if (raw === 'o(logn)' || raw === 'o(log(n))') return 'Aumenta um pouco';
  if (raw === 'o(n)') return 'Aumenta na mesma proporcao';
  if (raw === 'o(n²)' || raw === 'o(n^2)' || raw === 'o(n2)' || raw === 'o(n*n)') return 'Aumenta muito';
  return String(option || '').trim();
}

function getChallengePromptText(challenge) {
  if (challenge?.kind !== 'complexity') {
    return String(challenge?.prompt || '');
  }
  return 'Quando a quantidade de dados aumenta, qual comportamento de velocidade faz mais sentido?';
}

function getChallengeOptionViews(challenge) {
  const options = Array.isArray(challenge?.options) ? challenge.options : [];
  if (challenge?.kind !== 'complexity') {
    return options.map((opt) => ({ value: String(opt), label: String(opt) }));
  }
  return options.map((opt) => ({
    value: String(opt),
    label: getComplexityOptionLabel(opt)
  }));
}

async function loadQuickChallenges(summaryId, challengeCategory) {
  const isCodar = String(challengeCategory || 'none') === 'codar';
  if (!isCodar) {
    quickChallengeSectionEl.classList.add('hidden');
    quickChallengesListEl.innerHTML = '';
    quickChallengeProgressBarEl.style.width = '0%';
    quickChallengeProgressTextEl.textContent = 'Progresso: 0/0';
    return;
  }

  quickChallengeSectionEl.classList.remove('hidden');
  quickChallengeMetaEl.textContent = 'Carregando desafios...';
  const res = await fetch(`/api/summaries/${summaryId}/challenges`);
  if (!res.ok) {
    quickChallengeMetaEl.textContent = 'Falha ao carregar desafios.';
    quickChallengesListEl.innerHTML = '';
    return;
  }

  const data = await res.json();
  quickChallengeMetaEl.textContent = `XP: ${Number(data.gamification?.xp || 0)} | Sequencia: ${Number(data.gamification?.streakDays || 0)} dia(s)`;
  const challenges = Array.isArray(data.challenges) ? data.challenges : [];
  const solvedCount = challenges.filter((c) => c.solved).length;
  const progressPct = challenges.length ? Math.round((solvedCount / challenges.length) * 100) : 0;
  quickChallengeProgressBarEl.style.width = `${progressPct}%`;
  quickChallengeProgressTextEl.textContent = `Progresso: ${solvedCount}/${challenges.length}`;
  if (!challenges.length) {
    quickChallengesListEl.innerHTML = '<p class="muted">Sem desafios gerados para este resumo.</p>';
    return;
  }

  quickChallengesListEl.innerHTML = challenges.map((c) => {
    const optionViews = getChallengeOptionViews(c);
    const optionsHtml = optionViews.length
      ? `<div class="challenge-options">${optionViews.map((opt) => `<button type="button" onclick="submitQuickChallenge(${c.id}, '${escapeJs(opt.value)}')">${escapeHtml(opt.label)}</button>`).join('')}</div>`
      : '';
    const answerInputHtml = optionViews.length
      ? ''
      : `
        <div class="item-actions challenge-answer-row">
          <input id="quickChallengeAnswer_${c.id}" placeholder="Digite sua resposta" />
          <button type="button" onclick="submitQuickChallenge(${c.id})">Enviar</button>
        </div>
      `;
    const status = c.solved ? 'Concluido' : 'Pendente';
    const challengeTitle = String(c.title || '');
    const feedback = state.challengeFeedback[String(c.id)] || null;
    const feedbackHtml = feedback
      ? `<div class="challenge-feedback ${feedback.ok ? 'ok' : 'fail'}">${escapeHtml(feedback.message)}</div>`
      : '';
    return `
      <article class="item">
        <div class="item-head">
          <strong>${escapeHtml(challengeTitle)}</strong>
          <small class="muted challenge-meta">${status} | ${Number(c.bestScore || 0)} pts</small>
        </div>
        <p class="challenge-prompt">${escapeHtml(getChallengePromptText(c))}</p>
        ${optionsHtml}
        ${answerInputHtml}
        ${feedbackHtml}
      </article>
    `;
  }).join('');
}

async function submitQuickChallenge(challengeId, quickAnswer) {
  if (!currentQuickSummary) return;
  const input = document.getElementById(`quickChallengeAnswer_${challengeId}`);
  const answer = String(quickAnswer || input?.value || '').trim();
  if (!answer) {
    alert('Digite uma resposta.');
    return;
  }
  if (input && quickAnswer) input.value = answer;

  const res = await fetch(`/api/challenges/${challengeId}/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    state.challengeFeedback[String(challengeId)] = {
      ok: false,
      message: err.error || 'Falha ao enviar resposta.'
    };
    await loadQuickChallenges(currentQuickSummary.id, currentQuickSummary.challengeCategory);
    return;
  }

  const data = await res.json();
  const expectedLabel = getComplexityOptionLabel(data.expectedAnswer || '');
  const message = data.isCorrect
    ? `Acertou! Score: ${data.score}. ${data.feedback || ''}`.trim()
    : `Quase la. Score: ${data.score}. ${data.feedback || ''}${data.expectedAnswer ? ` Gabarito: ${expectedLabel}` : ''}`.trim();
  state.challengeFeedback[String(challengeId)] = {
    ok: Boolean(data.isCorrect),
    message
  };
  await loadQuickChallenges(currentQuickSummary.id, currentQuickSummary.challengeCategory);
  await refreshDashboard();
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
  syncFlashcardEditorRaw(quickFlashcardsEditorEl, quickFlashcardsRawEl);
  const flashcards = getFlashcardEditorCards(quickFlashcardsEditorEl);
  const res = await fetch(`/api/summaries/${currentQuickSummary.id}/memory`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lociPalace: quickLociPalaceEl.value,
      lociRoom: quickLociRoomEl.value,
      lociHook: quickLociHookEl.value,
      flashcards,
      flashcardsRaw: quickFlashcardsRawEl.value
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    showError(err.error || 'Falha ao salvar Loci/Flashcards.');
    return;
  }
  invalidateLibraryCache();
  showSuccess('Loci e flashcards salvos.');
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
    showError(err.error || 'Falha ao salvar texto do resumo.');
    return;
  }
  showSuccess('Texto do resumo salvo.');
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
    showError(err.error || 'Falha ao salvar agenda.');
    return;
  }

  showSuccess('Agenda atualizada.');
  await openQuickSummary(currentQuickSummary.id);
  await refreshAll();
}

async function postponeSummary(id) {
  const raw = await showPromptDialog('Postergar este resumo em quantos dias?', '1', 'Postergar resumo');
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
    showError(err.error || 'Falha ao postergar.');
    return;
  }

  invalidateLibraryCache();
  showSuccess('Resumo postergado com sucesso.');
  await refreshAll();
}

function renderQueue() {
  const paraFilter = String(reviewParaFilterEl?.value || 'all').toLowerCase();
  const folderFilter = String(reviewFolderFilterEl?.value || '').trim();
  const filtered = (state.queue || [])
    .filter((item) => paraFilter === 'all' || String(item.paraCategory || '').toLowerCase() === paraFilter)
    .filter((item) => {
      if (!folderFilter) return true;
      const folderPath = getSummaryFolderPath(item);
      return folderPath === folderFilter || folderPath.startsWith(`${folderFilter}/`);
    });

  if (!filtered.length) {
    queueEl.innerHTML = `
      <article class="empty-state">
        <strong>Nada pendente hoje</strong>
        <small class="muted">Você pode adiantar estudos pela Biblioteca.</small>
        <div class="item-actions">
          <button onclick="goFeature('library')" class="btn-secondary">Abrir biblioteca</button>
        </div>
      </article>
    `;
    return;
  }

  queueEl.innerHTML = filtered.map((item) => `
    <article class="item">
      <strong>${escapeHtml(item.title)}</strong>
      <small class="muted">PARA: ${item.paraCategory} | Etapa: ${item.currentStep + 1}/4 | Venceu em ${formatDate(item.nextReviewAt)}</small>
      ${renderSummaryProgress(item)}
      <div class="item-actions">
        <button onclick="openManualPopup(${item.id})">Revisar agora</button>
        <button onclick="openQuickSummary(${item.id})" class="btn-secondary">Abrir resumo</button>
        <button onclick="archiveSummary(${item.id})" class="btn-danger">Arquivar</button>
      </div>
    </article>
  `).join('');
}

function openPopupIfNeeded() {
  if (state.popupItem) return;
  const paraFilter = String(reviewParaFilterEl?.value || 'all').toLowerCase();
  const folderFilter = String(reviewFolderFilterEl?.value || '').trim();
  const due = (state.queue || []).find((item) => {
    const paraOk = paraFilter === 'all' || String(item.paraCategory || '').toLowerCase() === paraFilter;
    if (!paraOk) return false;
    if (!folderFilter) return true;
    const folderPath = getSummaryFolderPath(item);
    return folderPath === folderFilter || folderPath.startsWith(`${folderFilter}/`);
  });
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

function parseFlashcardsRaw(raw) {
  const lines = String(raw || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const cards = [];
  for (const line of lines) {
    const separators = ['::', '=>', '->', ':'];
    for (const sep of separators) {
      const idx = line.indexOf(sep);
      if (idx <= 0) continue;
      const prompt = line.slice(0, idx).trim();
      const answer = line.slice(idx + sep.length).trim();
      if (!prompt || !answer) continue;
      cards.push({ prompt, answer });
      break;
    }
  }
  return cards;
}

function createFlashcardRowElement(prompt = '', answer = '') {
  const row = document.createElement('div');
  row.className = 'flashcard-row';
  row.innerHTML = `
    <input type="text" data-field="prompt" placeholder="Pergunta" maxlength="500" value="${escapeHtml(prompt)}" />
    <input type="text" data-field="answer" placeholder="Resposta" maxlength="1000" value="${escapeHtml(answer)}" />
    <button type="button" class="btn-danger" data-remove-card="1">Remover</button>
  `;
  return row;
}

function getFlashcardEditorCards(editorEl) {
  if (!editorEl) return [];
  const rows = Array.from(editorEl.querySelectorAll('.flashcard-row'));
  return rows.map((row) => ({
    prompt: String(row.querySelector('[data-field="prompt"]')?.value || '').trim(),
    answer: String(row.querySelector('[data-field="answer"]')?.value || '').trim()
  })).filter((card) => card.prompt && card.answer).slice(0, 50);
}

function syncFlashcardEditorRaw(editorEl, rawEl) {
  if (!rawEl) return;
  const cards = getFlashcardEditorCards(editorEl);
  rawEl.value = cards.map((card) => `${card.prompt}::${card.answer}`).join('\n');
}

function setFlashcardEditorCards(editorEl, rawEl, cards) {
  if (!editorEl) return;
  const sourceCards = Array.isArray(cards) ? cards : parseFlashcardsRaw(cards);
  const normalized = sourceCards
    .map((card) => ({
      prompt: String(card?.prompt || '').trim(),
      answer: String(card?.answer || '').trim()
    }))
    .filter((card) => card.prompt || card.answer);

  editorEl.innerHTML = '';
  const rows = normalized.length ? normalized : [{ prompt: '', answer: '' }];
  rows.forEach((card) => editorEl.appendChild(createFlashcardRowElement(card.prompt, card.answer)));
  syncFlashcardEditorRaw(editorEl, rawEl);
}

function setupFlashcardEditor(editorEl, addBtnEl, rawEl) {
  if (!editorEl || !addBtnEl) return;

  addBtnEl.addEventListener('click', () => {
    editorEl.appendChild(createFlashcardRowElement('', ''));
    syncFlashcardEditorRaw(editorEl, rawEl);
  });

  editorEl.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-remove-card]');
    if (!btn) return;
    const row = btn.closest('.flashcard-row');
    if (!row) return;
    row.remove();
    if (!editorEl.querySelector('.flashcard-row')) {
      editorEl.appendChild(createFlashcardRowElement('', ''));
    }
    syncFlashcardEditorRaw(editorEl, rawEl);
  });

  editorEl.addEventListener('input', () => syncFlashcardEditorRaw(editorEl, rawEl));
}

async function createSummary(event) {
  event.preventDefault();

  syncFlashcardEditorRaw(summaryFlashcardsEditorEl, summaryFlashcardsRawEl);
  const formData = new FormData(event.target);
  const title = String(formData.get('title') || '').trim();
  const summaryText = String(formData.get('summaryText') || '').trim();
  const challengeCategory = String(formData.get('challengeCategory') || 'none').trim().toLowerCase();
  const codarBaseCode = String(formData.get('codarBaseCode') || '').trim();
  const file = formData.get('summaryFile');

  if (!title) {
    alert('Titulo obrigatorio.');
    return;
  }

  if (!summaryText && (!file || !file.size)) {
    alert('Envie um arquivo ou cole o resumo.');
    return;
  }

  if (challengeCategory === 'codar' && !codarBaseCode) {
    alert('Para desafio Codar, informe o codigo base.');
    summaryCodarBaseCodeEl?.focus();
    return;
  }

  const res = await fetch('/api/summaries', { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json();
    showError(err.error || 'Falha ao criar resumo.');
    return;
  }
  const created = await res.json();
  if (Number.isFinite(created.flashcardsCount)) {
    const paraLabel = formatParaLabel(formData.get('paraCategory') || 'resources');
    const folderPath = String(formData.get('folderName') || '').trim() || 'Raiz da categoria';
    const challengeLabel = challengeCategory === 'codar' ? ' | Desafio: Codar' : '';
    showSuccess(`Resumo salvo em ${paraLabel}/${folderPath}. Flashcards: ${created.flashcardsCount}${challengeLabel}.`);
  }

  event.target.reset();
  invalidateLibraryCache();
  setFlashcardEditorCards(summaryFlashcardsEditorEl, summaryFlashcardsRawEl, []);
  syncSummaryChallengeCategoryState();
  await refreshSummarySavedFoldersSelector();
  await refreshAll();
}

function syncSummaryChallengeCategoryState() {
  const category = String(summaryChallengeCategoryEl?.value || 'none').trim().toLowerCase();
  const isCodar = category === 'codar';
  summaryCodarBaseCodeBoxEl?.classList.toggle('hidden', !isCodar);
  if (summaryCodarBaseCodeEl) {
    summaryCodarBaseCodeEl.required = isCodar;
    if (!isCodar) {
      summaryCodarBaseCodeEl.value = '';
    }
  }
}

async function refreshSummarySavedFoldersSelector() {
  if (!summaryParaCategoryEl || !summarySavedFoldersSelectEl || !summaryFolderNameEl) {
    return;
  }

  const category = summaryParaCategoryEl.value || 'resources';
  const params = new URLSearchParams({
    category,
    maxDepth: '1'
  });

  const res = await fetch(`/api/para/folders?${params.toString()}`);
  if (!res.ok) {
    summarySavedFoldersSelectEl.innerHTML = '<option value="">Raiz da categoria</option>';
    summaryFolderNameEl.value = '';
    return;
  }

  const data = await res.json();
  summarySavedFoldersSelectEl.innerHTML = '';

  const emptyOpt = document.createElement('option');
  emptyOpt.value = '';
  emptyOpt.textContent = 'Raiz da categoria';
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
  } else {
    summarySavedFoldersSelectEl.value = '';
    summaryFolderNameEl.value = '';
  }
  applySavedSummaryFolder();
}

function applySavedSummaryFolder() {
  if (!summarySavedFoldersSelectEl || !summaryFolderNameEl) {
    return;
  }
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
    showError('Falha ao arquivar.');
    return;
  }
  invalidateLibraryCache();
  showSuccess('Resumo arquivado.');
  await refreshAll();
}

async function deleteSummary(id) {
  if (state.ux.pendingDeletes[id]) {
    clearTimeout(state.ux.pendingDeletes[id].timer);
    delete state.ux.pendingDeletes[id];
  }
  const confirmed = await showConfirmDialog('Deseja excluir este resumo da Biblioteca?', 'Excluir resumo');
  if (!confirmed) return;

  const removeFile = await showConfirmDialog('Tambem deseja excluir o arquivo fisico da pasta PARA?', 'Excluir arquivo fisico');
  const summary = (state.library.cache || []).find((item) => Number(item.id) === Number(id))
    || (state.queue || []).find((item) => Number(item.id) === Number(id))
    || null;
  const summaryTitle = summary?.title || `Resumo #${id}`;

  state.ux.pendingDeletes[id] = {
    removeFile: Boolean(removeFile),
    title: summaryTitle,
    timer: setTimeout(() => {
      commitPendingDelete(id);
    }, 9000)
  };

  if (Array.isArray(state.library.cache)) {
    state.library.cache = state.library.cache.filter((item) => Number(item.id) !== Number(id));
    state.library.cacheAt = Date.now();
  }
  state.queue = (state.queue || []).filter((item) => Number(item.id) !== Number(id));
  renderQueue();
  refreshLibrary();

  showActionToast(
    `Exclusao agendada para "${summaryTitle}".`,
    'Desfazer',
    () => undoPendingDelete(id),
    'info',
    9000
  );
}

async function commitPendingDelete(id) {
  const pending = state.ux.pendingDeletes[id];
  if (!pending) return;
  clearTimeout(pending.timer);
  delete state.ux.pendingDeletes[id];

  const res = await fetch(`/api/summaries/${id}?removeFile=${pending.removeFile ? 'true' : 'false'}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    showError(err.error || 'Falha ao excluir resumo.');
    await refreshAll();
    return;
  }
  invalidateLibraryCache();
  showSuccess(`Resumo excluido: ${pending.title}.`);
  await refreshAll();
}

function undoPendingDelete(id) {
  const pending = state.ux.pendingDeletes[id];
  if (!pending) return;
  clearTimeout(pending.timer);
  delete state.ux.pendingDeletes[id];
  showSuccess(`Exclusao cancelada: ${pending.title}.`);
  invalidateLibraryCache();
  refreshAll();
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
  if (browserPathEl) browserPathEl.value = data.currentPath || '';
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
  if (!(await showConfirmDialog(`Excluir arquivo ${relativePath}?`, 'Excluir arquivo'))) return;

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
  if (!(await showConfirmDialog(`Excluir pasta vazia ${folderPath}?`, 'Excluir pasta'))) return;

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
  if (browserPathEl) browserPathEl.value = state.browsing.path;
  await loadParaFolder();
  await refreshSavedFoldersSelector();
  await refreshSummarySavedFoldersSelector();
}

function openParaDir(relativePath) {
  state.browsing.path = relativePath;
  if (browserPathEl) browserPathEl.value = relativePath;
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
window.submitQuickChallenge = submitQuickChallenge;
window.openSummaryHistoryFromList = openSummaryHistoryFromList;
window.goFeature = goFeature;
window.runCommandPaletteItem = runCommandPaletteItem;

async function resolveAlert(id) {
  const res = await fetch(`/api/metacog/alerts/${id}/resolve`, { method: 'POST' });
  if (!res.ok) {
    alert('Falha ao resolver alerta.');
    return;
  }
  await refreshAll();
}
