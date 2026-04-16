const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 5050;

const BASE_DIR = __dirname;
const DATA_DIR = path.join(BASE_DIR, 'data');
const DB_PATH = path.join(DATA_DIR, 'app.db');
const VAULT_DIR = path.join(BASE_DIR, 'KnowledgeOSVault');
const PARA_MAP = {
  inbox: 'Inbox',
  projects: 'Projects',
  areas: 'Areas',
  resources: 'Resources',
  archives: 'Archives'
};
const REVIEW_INTERVALS = [3, 10, 30, 60];

ensureDirs();
const db = new Database(DB_PATH);
initDb();

app.use(express.json());
app.use(express.static(path.join(BASE_DIR, 'public')));
app.use('/vault', express.static(VAULT_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const { target } = resolveParaTargetFolder(req.body.paraCategory, req.body.folderName);
      cb(null, target);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    try {
      const { target } = resolveParaTargetFolder(req.body.paraCategory, req.body.folderName);
      const originalExt = path.extname(file.originalname) || '';
      const suggested = sanitizeFileName(req.body.fileName || '');
      const fallbackStem = sanitizeFileName(path.parse(file.originalname).name || 'resumo');
      const finalStem = suggested || fallbackStem;
      const desiredName = `${finalStem}${originalExt}`;
      cb(null, createUniqueFileName(target, desiredName));
    } catch (err) {
      cb(err);
    }
  }
});
const upload = multer({ storage });

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/dashboard', (req, res) => {
  const today = startOfDayISO(new Date());

  const dueToday = db.prepare(`
    SELECT COUNT(*) AS total
    FROM summaries
    WHERE status = 'active' AND next_review_at <= ?
  `).get(today).total;

  const active = db.prepare(`
    SELECT COUNT(*) AS total
    FROM summaries
    WHERE status = 'active'
  `).get().total;

  const byPara = db.prepare(`
    SELECT para_category AS paraCategory, COUNT(*) AS total
    FROM summaries
    WHERE status = 'active'
    GROUP BY para_category
  `).all();

  res.json({ dueToday, active, byPara });
});

app.get('/api/review-queue', (req, res) => {
  const today = startOfDayISO(new Date());
  const rows = db.prepare(`
    SELECT id, title, para_category AS paraCategory, file_path AS filePath, current_step AS currentStep, next_review_at AS nextReviewAt
    FROM summaries
    WHERE status = 'active' AND next_review_at <= ?
    ORDER BY next_review_at ASC
  `).all(today);

  res.json(rows);
});

app.get('/api/summaries', (req, res) => {
  const rows = db.prepare(`
    SELECT id, title, para_category AS paraCategory, file_path AS filePath, created_at AS createdAt, current_step AS currentStep, next_review_at AS nextReviewAt, status
    FROM summaries
    ORDER BY created_at DESC
  `).all();
  res.json(rows);
});

app.get('/api/para/browse', (req, res) => {
  try {
    const para = normalizePara(req.query.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const subpath = String(req.query.subpath || '');
    const targetDir = resolveInsideBase(baseDir, subpath);

    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({ error: 'Pasta nao encontrada.' });
    }

    const entries = fs.readdirSync(targetDir, { withFileTypes: true })
      .map((entry) => {
        const absolutePath = path.join(targetDir, entry.name);
        const relativePath = toUnixPath(path.relative(baseDir, absolutePath));
        const ext = path.extname(entry.name).toLowerCase();
        const editable = entry.isFile() && ['.md', '.txt'].includes(ext);

        return {
          name: entry.name,
          type: entry.isDirectory() ? 'dir' : 'file',
          relativePath,
          editable
        };
      })
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'dir' ? -1 : 1;
        }
        return a.name.localeCompare(b.name, 'pt-BR');
      });

    res.json({
      category: para,
      categoryFolder: PARA_MAP[para],
      currentPath: toUnixPath(path.relative(baseDir, targetDir)),
      entries
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao listar pasta PARA.' });
  }
});

app.get('/api/para/file', (req, res) => {
  try {
    const para = normalizePara(req.query.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const filePath = String(req.query.filePath || '');
    const absolutePath = resolveInsideBase(baseDir, filePath);

    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      return res.status(404).json({ error: 'Arquivo nao encontrado.' });
    }

    const ext = path.extname(absolutePath).toLowerCase();
    if (!['.md', '.txt'].includes(ext)) {
      return res.status(400).json({ error: 'Edicao disponivel apenas para .md e .txt.' });
    }

    const content = fs.readFileSync(absolutePath, 'utf8');
    res.json({
      category: para,
      filePath: toUnixPath(path.relative(baseDir, absolutePath)),
      content
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao abrir arquivo.' });
  }
});

app.put('/api/para/file', (req, res) => {
  try {
    const para = normalizePara(req.body.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const filePath = String(req.body.filePath || '');
    const content = String(req.body.content || '');
    const absolutePath = resolveInsideBase(baseDir, filePath);

    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      return res.status(404).json({ error: 'Arquivo nao encontrado.' });
    }

    const ext = path.extname(absolutePath).toLowerCase();
    if (!['.md', '.txt'].includes(ext)) {
      return res.status(400).json({ error: 'Edicao disponivel apenas para .md e .txt.' });
    }

    fs.writeFileSync(absolutePath, content, 'utf8');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao salvar arquivo.' });
  }
});

app.post('/api/summaries', upload.single('summaryFile'), (req, res) => {
  try {
    const title = (req.body.title || '').trim();
    const para = normalizePara(req.body.paraCategory || 'resources');
    const folderName = (req.body.folderName || '').trim();
    const fileNameInput = (req.body.fileName || '').trim();
    const summaryText = (req.body.summaryText || '').trim();

    if (!title) {
      return res.status(400).json({ error: 'Titulo obrigatorio.' });
    }

    let filePath = null;

    if (req.file) {
      filePath = req.file.path;
    } else if (summaryText) {
      const { target } = resolveParaTargetFolder(para, folderName);
      const stem = sanitizeFileName(fileNameInput || title);
      const finalFileName = createUniqueFileName(target, `${stem}.md`);
      const fullPath = path.join(target, finalFileName);
      const content = buildSummaryTemplate(title, summaryText);
      fs.writeFileSync(fullPath, content, 'utf8');
      filePath = fullPath;
    } else {
      return res.status(400).json({ error: 'Envie um arquivo ou texto do resumo.' });
    }

    const created = new Date();
    const nextReview = addDays(created, REVIEW_INTERVALS[0]);

    const result = db.prepare(`
      INSERT INTO summaries (title, para_category, file_path, created_at, current_step, next_review_at, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `).run(
      title,
      para,
      filePath,
      created.toISOString(),
      0,
      startOfDayISO(nextReview)
    );

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar resumo.' });
  }
});

app.post('/api/summaries/:id/review', (req, res) => {
  const id = Number(req.params.id);
  const grade = (req.body.grade || '').trim();

  if (!['good', 'partial', 'forgot'].includes(grade)) {
    return res.status(400).json({ error: 'Grade invalida.' });
  }

  const item = db.prepare('SELECT * FROM summaries WHERE id = ?').get(id);
  if (!item) {
    return res.status(404).json({ error: 'Resumo nao encontrado.' });
  }

  if (item.status !== 'active') {
    return res.status(400).json({ error: 'Resumo arquivado.' });
  }

  const now = new Date();
  let newStep = item.current_step;
  let nextDate;

  if (grade === 'good') {
    newStep = Math.min(item.current_step + 1, REVIEW_INTERVALS.length - 1);
    nextDate = addDays(now, REVIEW_INTERVALS[newStep]);
  } else if (grade === 'partial') {
    nextDate = addDays(now, 2);
  } else {
    newStep = 0;
    nextDate = addDays(now, REVIEW_INTERVALS[0]);
  }

  const nextReviewAt = startOfDayISO(nextDate);

  db.prepare(`
    UPDATE summaries
    SET current_step = ?, next_review_at = ?, last_grade = ?
    WHERE id = ?
  `).run(newStep, nextReviewAt, grade, id);

  db.prepare(`
    INSERT INTO reviews (summary_id, reviewed_at, grade, resulting_step, next_review_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, now.toISOString(), grade, newStep, nextReviewAt);

  res.json({ ok: true, nextReviewAt, currentStep: newStep });
});

app.post('/api/summaries/:id/archive', (req, res) => {
  const id = Number(req.params.id);
  const item = db.prepare('SELECT * FROM summaries WHERE id = ?').get(id);

  if (!item) {
    return res.status(404).json({ error: 'Resumo nao encontrado.' });
  }

  if (item.status === 'archived') {
    return res.json({ ok: true });
  }

  const targetDir = path.join(VAULT_DIR, PARA_MAP.archives);
  const fileName = path.basename(item.file_path);
  const target = path.join(targetDir, fileName);

  if (fs.existsSync(item.file_path) && item.file_path !== target) {
    fs.renameSync(item.file_path, target);
  }

  db.prepare(`
    UPDATE summaries
    SET status = 'archived', para_category = 'archives', file_path = ?
    WHERE id = ?
  `).run(target, id);

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`SuperMemo PARA app rodando em http://localhost:${PORT}`);
});

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }

  for (const folder of Object.values(PARA_MAP)) {
    const folderPath = path.join(VAULT_DIR, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }
}

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      para_category TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at TEXT NOT NULL,
      current_step INTEGER NOT NULL DEFAULT 0,
      next_review_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      last_grade TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      summary_id INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      grade TEXT NOT NULL,
      resulting_step INTEGER NOT NULL,
      next_review_at TEXT NOT NULL,
      FOREIGN KEY(summary_id) REFERENCES summaries(id)
    );
  `);
}

function normalizePara(value) {
  const normalized = String(value).trim().toLowerCase();
  return PARA_MAP[normalized] ? normalized : 'resources';
}

function sanitizeFileName(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'resumo';
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDayISO(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function buildSummaryTemplate(title, body) {
  return `# ${title}\n\n## Contexto\n${body}\n\n## 5 bullets-chave\n- \n- \n- \n- \n- \n\n## Exemplo pratico\n- \n\n## 3 perguntas de recall\n1. \n2. \n3. \n\n## Proxima acao\n- `;
}

function resolveParaTargetFolder(category, folderName) {
  const para = normalizePara(category);
  const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
  const safeSubFolder = sanitizeFolderPath(folderName);
  const target = safeSubFolder ? path.join(baseDir, safeSubFolder) : baseDir;

  if (!isInsideBase(baseDir, target)) {
    throw new Error('Subpasta invalida.');
  }

  fs.mkdirSync(target, { recursive: true });
  return { para, target, safeSubFolder };
}

function sanitizeFolderPath(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const parts = raw
    .split(/[\\/]+/)
    .map((part) => sanitizeFileName(part))
    .filter(Boolean);

  return parts.join(path.sep);
}

function createUniqueFileName(folderPath, requestedName) {
  const parsed = path.parse(requestedName);
  const baseName = sanitizeFileName(parsed.name || 'resumo');
  const ext = sanitizeExtension(parsed.ext);
  let candidate = `${baseName}${ext}`;
  let count = 1;

  while (fs.existsSync(path.join(folderPath, candidate))) {
    candidate = `${baseName}_${count}${ext}`;
    count += 1;
  }

  return candidate;
}

function sanitizeExtension(ext) {
  const cleaned = String(ext || '').replace(/[^a-zA-Z0-9.]/g, '').toLowerCase();
  if (!cleaned.startsWith('.')) {
    return cleaned ? `.${cleaned}` : '';
  }
  return cleaned;
}

function resolveInsideBase(baseDir, relativePath) {
  const sanitizedRelative = String(relativePath || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const target = path.resolve(baseDir, sanitizedRelative);
  if (!isInsideBase(baseDir, target)) {
    throw new Error('Caminho invalido.');
  }
  return target;
}

function isInsideBase(baseDir, targetPath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  return resolvedTarget === resolvedBase || resolvedTarget.startsWith(`${resolvedBase}${path.sep}`);
}

function toUnixPath(value) {
  return String(value || '').replace(/\\/g, '/');
}
