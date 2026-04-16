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
  currentEditing: null
};

const queueEl = document.getElementById('queue');
const libraryEl = document.getElementById('library');
const dueTodayEl = document.getElementById('dueToday');
const activeTotalEl = document.getElementById('activeTotal');
const paraBreakdownEl = document.getElementById('paraBreakdown');
const modalEl = document.getElementById('reviewModal');
const modalTitleEl = document.getElementById('modalTitle');
const modalMetaEl = document.getElementById('modalMeta');
const modalOpenFileEl = document.getElementById('modalOpenFile');
const browserCategoryEl = document.getElementById('browserCategory');
const browserPathEl = document.getElementById('browserPath');
const browserListEl = document.getElementById('browserList');
const editingFileEl = document.getElementById('editingFile');
const fileEditorEl = document.getElementById('fileEditor');

init();

async function init() {
  document.getElementById('summaryForm').addEventListener('submit', createSummary);
  modalEl.addEventListener('click', onModalClick);
  document.getElementById('browseBtn').addEventListener('click', loadParaFolder);
  document.getElementById('saveFileBtn').addEventListener('click', saveEditingFile);

  await refreshAll();

  setInterval(async () => {
    await refreshQueue();
    openPopupIfNeeded();
  }, 30000);
}

async function refreshAll() {
  await Promise.all([refreshDashboard(), refreshQueue(), refreshLibrary()]);
  await loadParaFolder();
  openPopupIfNeeded();
}

async function refreshDashboard() {
  const res = await fetch('/api/dashboard');
  const data = await res.json();

  dueTodayEl.textContent = data.dueToday;
  activeTotalEl.textContent = data.active;

  const line = (data.byPara || [])
    .map((x) => `${x.paraCategory}: ${x.total}`)
    .join(' | ');

  paraBreakdownEl.textContent = line || 'Sem resumos ainda.';
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
    const fileHref = toPublicFileUrl(item.filePath);
    return `
      <article class="item">
        <strong>${escapeHtml(item.title)}</strong>
        <small>PARA: ${item.paraCategory} | Proxima: ${formatDate(item.nextReviewAt)} | Status: ${item.status}</small>
        <a href="${fileHref}" target="_blank" rel="noreferrer">Abrir arquivo</a>
        ${item.status === 'active' ? `<button onclick="archiveSummary(${item.id})">Arquivar</button>` : ''}
      </article>
    `;
  }).join('');
}

function renderQueue() {
  if (!state.queue.length) {
    queueEl.innerHTML = '<p class="muted">Sem revisoes pendentes hoje.</p>';
    return;
  }

  queueEl.innerHTML = state.queue.map((item) => `
    <article class="item">
      <strong>${escapeHtml(item.title)}</strong>
      <small>PARA: ${item.paraCategory} | Etapa: ${item.currentStep + 1}/4 | Venceu em ${formatDate(item.nextReviewAt)}</small>
      <button onclick="openManualPopup(${item.id})">Revisar agora</button>
    </article>
  `).join('');
}

function openPopupIfNeeded() {
  if (state.popupItem) {
    return;
  }

  const due = state.queue[0];
  if (!due) {
    return;
  }

  showPopup(due);
}

function showPopup(item) {
  state.popupItem = item;
  modalTitleEl.textContent = item.title;
  modalMetaEl.textContent = `PARA: ${item.paraCategory} | Etapa: ${item.currentStep + 1}/4`;
  modalOpenFileEl.href = toPublicFileUrl(item.filePath);
  modalEl.classList.remove('hidden');
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

  const res = await fetch('/api/summaries', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Falha ao criar resumo.');
    return;
  }

  event.target.reset();
  await refreshAll();
}

async function onModalClick(event) {
  const btn = event.target.closest('button[data-grade]');
  if (!btn || !state.popupItem) {
    return;
  }

  const grade = btn.dataset.grade;

  const res = await fetch(`/api/summaries/${state.popupItem.id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grade })
  });

  if (!res.ok) {
    alert('Falha ao registrar revisao.');
    return;
  }

  closeModal();
  await refreshAll();
}

async function archiveSummary(id) {
  const res = await fetch(`/api/summaries/${id}/archive`, { method: 'POST' });
  if (!res.ok) {
    alert('Falha ao arquivar.');
    return;
  }

  await refreshAll();
}

function closeModal() {
  state.popupItem = null;
  modalEl.classList.add('hidden');
}

function openManualPopup(id) {
  const item = state.queue.find((x) => x.id === id);
  if (item) {
    showPopup(item);
  }
}

async function loadParaFolder() {
  const category = browserCategoryEl.value;
  const subpath = browserPathEl.value.trim();

  const params = new URLSearchParams({ category, subpath });
  const res = await fetch(`/api/para/browse?${params.toString()}`);

  if (!res.ok) {
    browserListEl.innerHTML = '<p class="muted">Nao foi possivel abrir esta pasta.</p>';
    return;
  }

  const data = await res.json();
  browserPathEl.value = data.currentPath || '';

  const parentPath = getParentPath(data.currentPath || '');
  const lines = [];

  if (data.currentPath) {
    lines.push(`<article class="item"><button onclick="openParaDir('${escapeJs(parentPath)}')">.. voltar</button></article>`);
  }

  for (const entry of data.entries) {
    if (entry.type === 'dir') {
      lines.push(`
        <article class="item">
          <strong>[Pasta] ${escapeHtml(entry.name)}</strong>
          <button onclick="openParaDir('${escapeJs(entry.relativePath)}')">Abrir pasta</button>
        </article>
      `);
    } else {
      const fileUrl = toVaultUrl(data.category, entry.relativePath);
      lines.push(`
        <article class="item">
          <strong>${escapeHtml(entry.name)}</strong>
          <small>${entry.editable ? 'Editavel (.md/.txt)' : 'Somente leitura'}</small>
          <a href="${fileUrl}" target="_blank" rel="noreferrer">Abrir arquivo</a>
          ${entry.editable ? `<button onclick="openParaFile('${escapeJs(entry.relativePath)}')">Editar</button>` : ''}
        </article>
      `);
    }
  }

  browserListEl.innerHTML = lines.join('') || '<p class="muted">Pasta vazia.</p>';
}

async function openParaFile(relativePath) {
  const params = new URLSearchParams({
    category: browserCategoryEl.value,
    filePath: relativePath
  });

  const res = await fetch(`/api/para/file?${params.toString()}`);
  if (!res.ok) {
    alert('Nao foi possivel abrir arquivo para edicao.');
    return;
  }

  const data = await res.json();
  state.currentEditing = {
    category: data.category,
    filePath: data.filePath
  };

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
    body: JSON.stringify({
      category: state.currentEditing.category,
      filePath: state.currentEditing.filePath,
      content: fileEditorEl.value
    })
  });

  if (!res.ok) {
    alert('Falha ao salvar arquivo.');
    return;
  }

  await loadParaFolder();
  alert('Arquivo salvo com sucesso.');
}

function openParaDir(relativePath) {
  browserPathEl.value = relativePath;
  loadParaFolder();
}

function toPublicFileUrl(fullPath) {
  const normalized = fullPath.replaceAll('\\\\', '/').replaceAll('\\', '/');
  const marker = '/KnowledgeOSVault/';
  const idx = normalized.indexOf(marker);

  if (idx === -1) {
    return '#';
  }

  const relative = normalized.slice(idx + marker.length);
  return `/vault/${relative}`;
}

function toVaultUrl(category, relativePath) {
  const folder = PARA_FOLDER_MAP[category] || 'Resources';
  return `/vault/${folder}/${relativePath}`;
}

function getParentPath(currentPath) {
  if (!currentPath) {
    return '';
  }

  const idx = currentPath.lastIndexOf('/');
  if (idx === -1) {
    return '';
  }

  return currentPath.slice(0, idx);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR');
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
