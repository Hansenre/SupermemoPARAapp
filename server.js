const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 5050;
const HOST = process.env.HOST || '127.0.0.1';

const BASE_DIR = __dirname;
const APP_HOME = process.env.SMP_APP_HOME || BASE_DIR;
const PUBLIC_DIR = process.env.SMP_PUBLIC_DIR || path.join(APP_HOME, 'public');
const DATA_DIR = process.env.SMP_DATA_DIR || path.join(APP_HOME, 'data');
const DB_PATH = process.env.SMP_DB_PATH || path.join(DATA_DIR, 'app.db');
const BACKUP_DIR = process.env.SMP_BACKUP_DIR || path.join(DATA_DIR, 'backups');
const VAULT_DIR = process.env.SMP_VAULT_DIR || path.join(APP_HOME, 'KnowledgeOSVault');
const PARA_MAP = {
  inbox: 'Inbox',
  projects: 'Projects',
  areas: 'Areas',
  resources: 'Resources',
  archives: 'Archives'
};
const REVIEW_INTERVALS = [3, 10, 30, 60];
const STUDY_FOLDER_NAME = '_StudyScans';
const OPENAI_API_KEY = String(process.env.OPENAI_API_KEY || '').trim();
const OPENAI_MODEL = String(process.env.OPENAI_MODEL || 'gpt-4.1-mini').trim();
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const OCR_SUPPORTED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

ensureDirs();
const db = new Database(DB_PATH);
initDb();

app.use(express.json());
app.use(express.static(PUBLIC_DIR));
app.use('/vault', express.static(VAULT_DIR, {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
}));

app.get('/view', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'viewer.html'));
});

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
const uploadPara = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const { target } = resolveParaTargetFolder(req.body.category, req.body.currentPath);
        cb(null, target);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      try {
        const { target } = resolveParaTargetFolder(req.body.category, req.body.currentPath);
        const originalExt = path.extname(file.originalname) || '';
        const requestedStem = sanitizeFileName(req.body.fileName || '');
        const fallbackStem = sanitizeFileName(path.parse(file.originalname).name || 'arquivo');
        const stem = requestedStem || fallbackStem;
        const desiredName = `${stem}${originalExt}`;
        const overwrite = String(req.body.overwrite || '').toLowerCase() === 'true';
        const finalName = overwrite ? desiredName : createUniqueFileName(target, desiredName);
        cb(null, finalName);
      } catch (err) {
        cb(err);
      }
    }
  })
});
const uploadStudyPages = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const notebookId = Number(req.params.id);
        const notebook = db.prepare(`
          SELECT para_category AS paraCategory, folder_name AS folderName
          FROM study_notebooks
          WHERE id = ?
        `).get(notebookId);
        if (!notebook) {
          throw new Error('Caderno nao encontrado.');
        }
        const target = ensureStudyPagesFolder(notebook.paraCategory, notebook.folderName);
        cb(null, target);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      try {
        const notebookId = Number(req.params.id);
        const notebook = db.prepare(`
          SELECT para_category AS paraCategory, folder_name AS folderName
          FROM study_notebooks
          WHERE id = ?
        `).get(notebookId);
        if (!notebook) {
          throw new Error('Caderno nao encontrado.');
        }
        const target = ensureStudyPagesFolder(notebook.paraCategory, notebook.folderName);
        const originalExt = sanitizeImageExtension(path.extname(file.originalname));
        const ext = originalExt || '.jpg';
        const stem = sanitizeFileName(path.parse(file.originalname).name || 'pagina');
        const desired = `${stem}${ext}`;
        const finalName = createUniqueFileName(target, desired);
        cb(null, finalName);
      } catch (err) {
        cb(err);
      }
    }
  }),
  limits: {
    files: 50,
    fileSize: 25 * 1024 * 1024
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/backup/list', (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json([]);
    }

    const entries = fs.readdirSync(BACKUP_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith('backup_'))
      .map((d) => {
        const dir = path.join(BACKUP_DIR, d.name);
        const exportPath = path.join(dir, 'export.json');
        const dbCopyPath = path.join(dir, 'app.db');
        const stat = fs.statSync(dir);
        return {
          id: d.name,
          createdAt: stat.mtime.toISOString(),
          hasExport: fs.existsSync(exportPath),
          hasDbCopy: fs.existsSync(dbCopyPath)
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao listar backups.' });
  }
});

app.post('/api/backup/create', (req, res) => {
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup_${stamp}`;
    const dir = path.join(BACKUP_DIR, backupId);
    fs.mkdirSync(dir, { recursive: true });

    const exportData = buildLogicalExport();
    fs.writeFileSync(path.join(dir, 'export.json'), JSON.stringify(exportData, null, 2), 'utf8');
    fs.copyFileSync(DB_PATH, path.join(dir, 'app.db'));

    res.status(201).json({ ok: true, id: backupId });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao criar backup.' });
  }
});

app.post('/api/backup/restore', (req, res) => {
  try {
    const id = String(req.body.id || '').trim();
    if (!id || !id.startsWith('backup_')) {
      return res.status(400).json({ error: 'Backup invalido.' });
    }

    const dir = path.join(BACKUP_DIR, id);
    const exportPath = path.join(dir, 'export.json');
    if (!fs.existsSync(exportPath)) {
      return res.status(404).json({ error: 'Arquivo export.json nao encontrado no backup.' });
    }

    const raw = fs.readFileSync(exportPath, 'utf8');
    const payload = JSON.parse(raw);
    restoreLogicalExport(payload);

    res.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao restaurar backup.' });
  }
});

app.get('/api/vault/read', (req, res) => {
  try {
    const relativePath = String(req.query.path || '').trim();
    if (!relativePath) {
      return res.status(400).json({ error: 'Caminho obrigatorio.' });
    }

    const absolutePath = resolveInsideBase(VAULT_DIR, relativePath);
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      return res.status(404).json({ error: 'Arquivo nao encontrado.' });
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const textLikeExt = new Set(['.md', '.txt', '.json', '.log', '.csv']);
    if (!textLikeExt.has(ext)) {
      return res.status(400).json({ error: 'Visualizador suporta apenas arquivos de texto.' });
    }

    const content = fs.readFileSync(absolutePath, 'utf8');
    res.json({
      name: path.basename(absolutePath),
      ext,
      relativePath: toUnixPath(path.relative(VAULT_DIR, absolutePath)),
      content
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao ler arquivo.' });
  }
});

app.get('/api/dashboard', (req, res) => {
  const now = new Date();
  const tomorrowStart = startOfDayISO(addDays(now, 1));

  const dueToday = db.prepare(`
    SELECT COUNT(*) AS total
    FROM summaries
    WHERE status = 'active' AND next_review_at < ?
  `).get(tomorrowStart).total;

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

  const weeklyGoal = computeWeeklyGoal(now);
  const openIllusions = db.prepare(`
    SELECT COUNT(*) AS total
    FROM metacog_alerts
    WHERE resolved_at IS NULL
  `).get().total;

  res.json({ dueToday, active, byPara, weeklyGoal, openIllusions });
});

app.get('/api/weekly-goal', (req, res) => {
  const weeklyGoal = computeWeeklyGoal(new Date());
  res.json(weeklyGoal);
});

app.get('/api/weekly-goal/details', (req, res) => {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weeklyGoal = computeWeeklyGoal(now);
  const dailyPlan = [];

  for (let i = 0; i < 7; i += 1) {
    const dayStart = addDays(weekStart, i);
    const dayEnd = addDays(dayStart, 1);
    const dueCount = db.prepare(`
      SELECT COUNT(*) AS total
      FROM summaries
      WHERE status = 'active' AND next_review_at >= ? AND next_review_at < ?
    `).get(dayStart.toISOString(), dayEnd.toISOString()).total;

    dailyPlan.push({
      date: dayStart.toISOString(),
      target: weeklyGoal.dailyTarget,
      dueCount
    });
  }

  const focusCategories = db.prepare(`
    SELECT para_category AS paraCategory, COUNT(*) AS total
    FROM summaries
    WHERE status = 'active' AND next_review_at <= ?
    GROUP BY para_category
    ORDER BY total DESC
    LIMIT 3
  `).all(addDays(now, 7).toISOString());

  const todayFocusItems = db.prepare(`
    SELECT id, title, para_category AS paraCategory, next_review_at AS nextReviewAt
    FROM summaries
    WHERE status = 'active' AND next_review_at <= ?
    ORDER BY next_review_at ASC
    LIMIT 12
  `).all(startOfDayISO(now));

  res.json({
    weeklyGoal,
    dailyPlan,
    focusCategories,
    todayFocusItems
  });
});

app.get('/api/weekly-goal/month', (req, res) => {
  try {
    const parsed = parseYearMonth(String(req.query.month || ''));
    const base = parsed
      ? new Date(parsed.year, parsed.monthIndex, 1)
      : new Date();
    base.setDate(1);
    base.setHours(0, 0, 0, 0);

    const year = base.getFullYear();
    const monthIndex = base.getMonth();
    const monthStart = new Date(year, monthIndex, 1);
    const nextMonthStart = new Date(year, monthIndex + 1, 1);
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    const days = [];

    for (let day = 1; day <= totalDays; day += 1) {
      const dayStart = new Date(year, monthIndex, day, 0, 0, 0, 0);
      const dayEnd = addDays(dayStart, 1);
      const goalForDay = computeWeeklyGoal(dayStart);
      const dueCount = db.prepare(`
        SELECT COUNT(*) AS total
        FROM summaries
        WHERE status = 'active' AND next_review_at >= ? AND next_review_at < ?
      `).get(dayStart.toISOString(), dayEnd.toISOString()).total;

      days.push({
        date: toDateOnly(dayStart),
        target: goalForDay.dailyTarget,
        dueCount
      });
    }

    res.json({
      month: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
      monthStart: monthStart.toISOString(),
      monthEnd: nextMonthStart.toISOString(),
      dailyTarget: computeWeeklyGoal(new Date()).dailyTarget,
      days
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao carregar calendario mensal.' });
  }
});

app.get('/api/weekly-goal/day-details', (req, res) => {
  try {
    const dateRaw = String(req.query.date || '').trim();
    if (!dateRaw) {
      return res.status(400).json({ error: 'Data obrigatoria (YYYY-MM-DD).' });
    }

    const dayStart = new Date(`${dateRaw}T00:00:00`);
    if (Number.isNaN(dayStart.getTime())) {
      return res.status(400).json({ error: 'Data invalida.' });
    }
    const dayEnd = addDays(dayStart, 1);

    const rows = db.prepare(`
      SELECT s.id, s.title, s.para_category AS paraCategory, s.next_review_at AS nextReviewAt,
             (SELECT COUNT(*) FROM flashcards f WHERE f.summary_id = s.id) AS flashcardsCount
      FROM summaries s
      WHERE s.status = 'active' AND s.next_review_at >= ? AND s.next_review_at < ?
      ORDER BY s.next_review_at ASC
    `).all(dayStart.toISOString(), dayEnd.toISOString());

    res.json({
      date: dateRaw,
      items: rows
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao carregar detalhes do dia.' });
  }
});

app.get('/api/metacog/alerts', (req, res) => {
  const rows = db.prepare(`
    SELECT id, summary_id AS summaryId, review_id AS reviewId, title, message, created_at AS createdAt
    FROM metacog_alerts
    WHERE resolved_at IS NULL
    ORDER BY created_at DESC
    LIMIT 15
  `).all();
  res.json(rows);
});

app.get('/api/metacog/candidates', (req, res) => {
  const rows = db.prepare(`
    SELECT
      s.id AS summaryId,
      s.title,
      s.para_category AS paraCategory,
      r.reviewed_at AS reviewedAt,
      r.grade,
      r.confidence,
      mo.risk_override AS riskOverride,
      CASE
        WHEN mo.risk_override IS 1 THEN 'manual_risk'
        WHEN mo.risk_override IS 0 THEN 'manual_safe'
        ELSE 'auto'
      END AS riskSource
    FROM reviews r
    JOIN summaries s ON s.id = r.summary_id
    LEFT JOIN metacog_risk_overrides mo ON mo.summary_id = s.id
    JOIN (
      SELECT summary_id, MAX(reviewed_at) AS lastReviewedAt
      FROM reviews
      WHERE confidence IS NOT NULL
      GROUP BY summary_id
    ) lr ON lr.summary_id = r.summary_id AND lr.lastReviewedAt = r.reviewed_at
    WHERE s.status = 'active'
    ORDER BY r.reviewed_at DESC
    LIMIT 20
  `).all();

  const shaped = rows.map((row) => {
    const auto = evaluateMetacogRisk(row.grade, row.confidence);
    const manual = Number.isFinite(Number(row.riskOverride)) ? Number(row.riskOverride) : null;
    const riskFlag = manual === 1 ? 1 : manual === 0 ? 0 : (auto.riskFlag ? 1 : 0);
    const riskReason = manual === 1
      ? 'Ajuste manual: forcar risco'
      : manual === 0
        ? 'Ajuste manual: forcar sem risco'
        : auto.reason;
    const riskScore = manual === 1 ? 1 : manual === 0 ? 0 : auto.riskScore;
    return {
      ...row,
      riskFlag,
      riskScore,
      riskReason
    };
  });

  res.json(shaped);
});

app.put('/api/metacog/risk/:summaryId', (req, res) => {
  try {
    const summaryId = Number(req.params.summaryId);
    const mode = String(req.body.mode || '').trim().toLowerCase();
    const summary = db.prepare('SELECT id FROM summaries WHERE id = ?').get(summaryId);
    if (!summary) {
      return res.status(404).json({ error: 'Resumo nao encontrado.' });
    }

    const now = new Date().toISOString();
    if (mode === 'auto') {
      db.prepare('DELETE FROM metacog_risk_overrides WHERE summary_id = ?').run(summaryId);
      return res.json({ ok: true, mode: 'auto' });
    }

    let riskOverride = null;
    if (mode === 'risk') {
      riskOverride = 1;
    } else if (mode === 'safe') {
      riskOverride = 0;
    } else {
      return res.status(400).json({ error: 'Modo invalido. Use auto, risk ou safe.' });
    }

    db.prepare(`
      INSERT INTO metacog_risk_overrides (summary_id, risk_override, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(summary_id) DO UPDATE SET
        risk_override = excluded.risk_override,
        updated_at = excluded.updated_at
    `).run(summaryId, riskOverride, now);

    res.json({ ok: true, mode, riskOverride });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao atualizar risco manual.' });
  }
});

app.post('/api/metacog/alerts/:id/resolve', (req, res) => {
  const id = Number(req.params.id);
  db.prepare(`
    UPDATE metacog_alerts
    SET resolved_at = ?
    WHERE id = ?
  `).run(new Date().toISOString(), id);
  res.json({ ok: true });
});

app.get('/api/review-queue', (req, res) => {
  const today = startOfDayISO(new Date());
  const rows = db.prepare(`
    SELECT id, title, para_category AS paraCategory, file_path AS filePath, note_path AS notePath, current_step AS currentStep, next_review_at AS nextReviewAt,
           loci_palace AS lociPalace, loci_room AS lociRoom, loci_hook AS lociHook
    FROM summaries
    WHERE status = 'active' AND next_review_at <= ?
    ORDER BY next_review_at ASC
  `).all(today);

  res.json(rows);
});

app.get('/api/summaries', (req, res) => {
  const rows = db.prepare(`
    SELECT id, title, para_category AS paraCategory, file_path AS filePath, note_path AS notePath, created_at AS createdAt, release_at AS releaseAt, current_step AS currentStep, next_review_at AS nextReviewAt, status,
           loci_palace AS lociPalace, loci_room AS lociRoom, loci_hook AS lociHook
    FROM summaries
    ORDER BY created_at DESC
  `).all();
  res.json(rows);
});

app.get('/api/summaries/:id/flashcards', (req, res) => {
  const id = Number(req.params.id);
  const cards = db.prepare(`
    SELECT id, prompt, answer
    FROM flashcards
    WHERE summary_id = ?
    ORDER BY id ASC
  `).all(id);
  res.json(cards);
});

app.get('/api/summaries/:id/quick', (req, res) => {
  const id = Number(req.params.id);
  const summary = db.prepare(`
    SELECT id, title, para_category AS paraCategory, file_path AS filePath, note_path AS notePath, created_at AS createdAt, release_at AS releaseAt, next_review_at AS nextReviewAt, status,
           loci_palace AS lociPalace, loci_room AS lociRoom, loci_hook AS lociHook
    FROM summaries
    WHERE id = ?
  `).get(id);

  if (!summary) {
    return res.status(404).json({ error: 'Resumo nao encontrado.' });
  }

  const flashcards = db.prepare(`
    SELECT id, prompt, answer
    FROM flashcards
    WHERE summary_id = ?
    ORDER BY id ASC
  `).all(id);
  const flashcardsCount = flashcards.length;

  let preview = '';
  let previewType = 'text';
  let fileSize = null;
  let fileUpdatedAt = null;
  let editableText = false;
  let editableFilePath = null;

  const resolvedFilePath = normalizeSummaryFilePath(summary.id, summary.filePath);
  const resolvedNotePath = normalizeSummaryNotePath(summary.id, summary.notePath);
  if (resolvedFilePath) {
    summary.filePath = resolvedFilePath;
  }
  if (resolvedNotePath) {
    summary.notePath = resolvedNotePath;
  }

  if (resolvedNotePath && isTextFilePath(resolvedNotePath)) {
    editableFilePath = resolvedNotePath;
  } else if (resolvedFilePath && isTextFilePath(resolvedFilePath)) {
    editableFilePath = resolvedFilePath;
  }

  if (editableFilePath) {
    const stat = fs.statSync(editableFilePath);
    fileSize = stat.size;
    fileUpdatedAt = stat.mtime.toISOString();
    const content = fs.readFileSync(editableFilePath, 'utf8');
    preview = content.slice(0, 1200);
    previewType = 'text';
    editableText = true;
  } else if (resolvedFilePath) {
    const stat = fs.statSync(resolvedFilePath);
    fileSize = stat.size;
    fileUpdatedAt = stat.mtime.toISOString();

    const ext = path.extname(resolvedFilePath).toLowerCase();
    if (ext === '.pdf') {
      preview = 'Arquivo PDF detectado. Use "Abrir" para visualizar o conteudo completo.';
      previewType = 'pdf';
    } else {
      preview = `Arquivo ${ext || 'sem extensao'} detectado. Use "Abrir" para visualizar o conteudo completo.`;
      previewType = 'binary';
    }
    editableText = true;
  } else {
    preview = 'Arquivo nao localizado no caminho salvo.';
    previewType = 'missing';
  }

  res.json({
    ...summary,
    flashcardsCount,
    flashcards,
    preview,
    previewType,
    editableText,
    editableFilePath,
    fileSize,
    fileUpdatedAt
  });
});

app.put('/api/summaries/:id/memory', (req, res) => {
  try {
    const id = Number(req.params.id);
    const summary = db.prepare('SELECT id FROM summaries WHERE id = ?').get(id);
    if (!summary) {
      return res.status(404).json({ error: 'Resumo nao encontrado.' });
    }

    const lociPalace = String(req.body.lociPalace || '').trim().slice(0, 160);
    const lociRoom = String(req.body.lociRoom || '').trim().slice(0, 160);
    const lociHook = String(req.body.lociHook || '').trim().slice(0, 500);
    const flashcardsRaw = req.body.flashcardsRaw;
    const cards = parseFlashcards(flashcardsRaw);

    const tx = db.transaction(() => {
      db.prepare(`
        UPDATE summaries
        SET loci_palace = ?, loci_room = ?, loci_hook = ?
        WHERE id = ?
      `).run(lociPalace || null, lociRoom || null, lociHook || null, id);

      db.prepare('DELETE FROM flashcards WHERE summary_id = ?').run(id);
      const insert = db.prepare(`
        INSERT INTO flashcards (summary_id, prompt, answer, created_at)
        VALUES (?, ?, ?, ?)
      `);
      const now = new Date().toISOString();
      for (const card of cards) {
        insert.run(id, card.prompt, card.answer, now);
      }
    });
    tx();

    res.json({ ok: true, flashcardsCount: cards.length });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao salvar dados de memoria.' });
  }
});

app.put('/api/summaries/:id/text', (req, res) => {
  try {
    const id = Number(req.params.id);
    const summary = db.prepare('SELECT id, file_path AS filePath, note_path AS notePath FROM summaries WHERE id = ?').get(id);
    if (!summary) {
      return res.status(404).json({ error: 'Resumo nao encontrado.' });
    }

    let filePath = resolveEditableSummaryTextPath(summary);
    if (!filePath) {
      filePath = ensureSummaryNotePath(summary.id, summary.filePath, summary.notePath);
    }
    if (!filePath) {
      return res.status(404).json({ error: 'Arquivo do resumo nao encontrado.' });
    }

    const ext = path.extname(filePath).toLowerCase();
    if (!['.md', '.txt'].includes(ext)) {
      return res.status(400).json({ error: 'Edicao de texto disponivel apenas para arquivos .md/.txt.' });
    }

    const content = String(req.body.content || '');
    fs.writeFileSync(filePath, content, 'utf8');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao salvar texto do resumo.' });
  }
});

app.put('/api/summaries/:id/schedule', (req, res) => {
  try {
    const id = Number(req.params.id);
    const summary = db.prepare('SELECT id FROM summaries WHERE id = ?').get(id);
    if (!summary) {
      return res.status(404).json({ error: 'Resumo nao encontrado.' });
    }

    const postponeDaysRaw = req.body.postponeDays;
    const nextReviewDateRaw = String(req.body.nextReviewDate || '').trim();
    let nextReviewAt = null;

    if (Number.isFinite(Number(postponeDaysRaw))) {
      const days = Math.max(0, Math.min(365, Number(postponeDaysRaw)));
      const current = db.prepare('SELECT next_review_at AS nextReviewAt FROM summaries WHERE id = ?').get(id);
      const base = current?.nextReviewAt ? new Date(current.nextReviewAt) : new Date();
      nextReviewAt = startOfDayISO(addDays(base, days));
    }

    if (nextReviewDateRaw) {
      const parsed = parseDateOnly(nextReviewDateRaw);
      if (!parsed) {
        return res.status(400).json({ error: 'Data de proxima revisao invalida.' });
      }
      nextReviewAt = startOfDayISO(parsed);
    }

    if (!nextReviewAt) {
      return res.status(400).json({ error: 'Informe postponeDays ou nextReviewDate.' });
    }

    db.prepare(`
      UPDATE summaries
      SET next_review_at = ?
      WHERE id = ?
    `).run(nextReviewAt, id);

    res.json({ ok: true, nextReviewAt });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao atualizar agenda.' });
  }
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

app.get('/api/para/folders', (req, res) => {
  try {
    const para = normalizePara(req.query.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const requestedDepth = Number(req.query.maxDepth);
    const maxDepth = Number.isFinite(requestedDepth)
      ? clamp(Math.floor(requestedDepth), 1, 10)
      : 6;

    const folders = listFoldersRecursive(baseDir, maxDepth);
    res.json({ category: para, folders });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao listar pastas salvas.' });
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

app.post('/api/para/folder', (req, res) => {
  try {
    const para = normalizePara(req.body.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const currentPath = String(req.body.currentPath || '');
    const folderName = sanitizeFileName(req.body.folderName || '');

    if (!folderName) {
      return res.status(400).json({ error: 'Nome da pasta obrigatorio.' });
    }

    const parentDir = resolveInsideBase(baseDir, currentPath);
    const targetDir = path.join(parentDir, folderName);

    if (!isInsideBase(baseDir, targetDir)) {
      return res.status(400).json({ error: 'Caminho invalido.' });
    }

    fs.mkdirSync(targetDir, { recursive: true });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao criar pasta.' });
  }
});

app.post('/api/para/upload', uploadPara.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo obrigatorio.' });
    }
    res.status(201).json({ ok: true, filePath: req.file.path });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha no upload do arquivo.' });
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

app.delete('/api/para/file', (req, res) => {
  try {
    const para = normalizePara(req.body.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const filePath = String(req.body.filePath || '');
    const absolutePath = resolveInsideBase(baseDir, filePath);

    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      return res.status(404).json({ error: 'Arquivo nao encontrado.' });
    }

    fs.unlinkSync(absolutePath);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao excluir arquivo.' });
  }
});

app.delete('/api/para/folder', (req, res) => {
  try {
    const para = normalizePara(req.body.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const folderPath = String(req.body.folderPath || '');

    if (!folderPath) {
      return res.status(400).json({ error: 'Pasta invalida.' });
    }

    const absolutePath = resolveInsideBase(baseDir, folderPath);
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isDirectory()) {
      return res.status(404).json({ error: 'Pasta nao encontrada.' });
    }

    const items = fs.readdirSync(absolutePath);
    if (items.length > 0) {
      return res.status(400).json({ error: 'Pasta nao esta vazia.' });
    }

    fs.rmdirSync(absolutePath);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao excluir pasta.' });
  }
});

app.get('/api/study/notebooks', (req, res) => {
  const rows = db.prepare(`
    SELECT id, subject, para_category AS paraCategory, folder_name AS folderName,
           summary_path AS summaryPath, generated_pdf_path AS generatedPdfPath,
           created_at AS createdAt, updated_at AS updatedAt
    FROM study_notebooks
    ORDER BY updated_at DESC
  `).all();
  res.json(rows);
});

app.post('/api/study/notebooks', (req, res) => {
  try {
    const subjectInput = String(req.body.subject || '').trim().slice(0, 120);
    const para = normalizePara(req.body.paraCategory || 'resources');
    const folderNameInput = String(req.body.folderName || '').trim();
    if (!subjectInput) {
      return res.status(400).json({ error: 'Materia obrigatoria.' });
    }

    const normalized = normalizeStudySubject(subjectInput);
    const subject = normalized.subject;
    const effectiveModule = folderNameInput || normalized.inferredModule;
    const folderName = normalizeStudyFolderName(effectiveModule, subject);
    const now = new Date().toISOString();

    const existing = db.prepare(`
      SELECT id FROM study_notebooks
      WHERE para_category = ? AND folder_name = ?
    `).get(para, folderName);

    if (existing) {
      return res.json({ id: existing.id, reused: true, subject, folderName, paraCategory: para });
    }

    ensureStudyNotebookFolders(para, folderName);
    const result = db.prepare(`
      INSERT INTO study_notebooks (subject, para_category, folder_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(subject, para, folderName, now, now);

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      reused: false,
      subject,
      folderName,
      paraCategory: para
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao criar caderno.' });
  }
});

app.get('/api/study/notebooks/:id/pages', (req, res) => {
  const notebookId = Number(req.params.id);
  const notebook = db.prepare(`
    SELECT id, subject, para_category AS paraCategory, folder_name AS folderName,
           generated_summary AS generatedSummary, generated_flashcards AS generatedFlashcards,
           generated_pdf_path AS generatedPdfPath
    FROM study_notebooks
    WHERE id = ?
  `).get(notebookId);
  if (!notebook) {
    return res.status(404).json({ error: 'Caderno nao encontrado.' });
  }
  resequenceStudyPagesByFileName(notebookId, new Date().toISOString());

  const rows = db.prepare(`
    SELECT id, page_order AS pageOrder, image_path AS imagePath, ocr_text AS ocrText, created_at AS createdAt, updated_at AS updatedAt
    FROM study_pages
    WHERE notebook_id = ?
    ORDER BY page_order ASC, id ASC
  `).all(notebookId);

  res.json({
    notebook: {
      ...notebook,
      pdfUrl: notebook.generatedPdfPath && fs.existsSync(notebook.generatedPdfPath)
        ? toOpenFileUrl(notebook.generatedPdfPath)
        : null
    },
    pages: rows.map((row) => ({
      ...row,
      imageUrl: toOpenFileUrl(row.imagePath)
    }))
  });
});

app.post('/api/study/notebooks/:id/pages', uploadStudyPages.array('pages', 50), (req, res) => {
  try {
    const notebookId = Number(req.params.id);
    const notebook = db.prepare(`
      SELECT id, para_category AS paraCategory, folder_name AS folderName
      FROM study_notebooks
      WHERE id = ?
    `).get(notebookId);

    if (!notebook) {
      return res.status(404).json({ error: 'Caderno nao encontrado.' });
    }
    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) {
      return res.status(400).json({ error: 'Envie ao menos 1 foto.' });
    }

    const now = new Date().toISOString();
    const insert = db.prepare(`
      INSERT INTO study_pages (notebook_id, page_order, image_path, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const file of files) {
      insert.run(notebookId, 0, file.path, now, now);
    }

    resequenceStudyPagesByFileName(notebookId, now);
    db.prepare('UPDATE study_notebooks SET updated_at = ? WHERE id = ?').run(now, notebookId);
    res.status(201).json({ ok: true, added: files.length });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao salvar fotos.' });
  }
});

app.delete('/api/study/notebooks/:id/pages/:pageId', (req, res) => {
  try {
    const notebookId = Number(req.params.id);
    const pageId = Number(req.params.pageId);
    const notebook = db.prepare('SELECT generated_pdf_path AS generatedPdfPath FROM study_notebooks WHERE id = ?').get(notebookId);
    if (!notebook) {
      return res.status(404).json({ error: 'Caderno nao encontrado.' });
    }
    const page = db.prepare(`
      SELECT id, image_path AS imagePath
      FROM study_pages
      WHERE id = ? AND notebook_id = ?
    `).get(pageId, notebookId);
    if (!page) {
      return res.status(404).json({ error: 'Pagina nao encontrada.' });
    }

    if (page.imagePath && fs.existsSync(page.imagePath)) {
      fs.unlinkSync(page.imagePath);
    }
    if (notebook.generatedPdfPath && fs.existsSync(notebook.generatedPdfPath)) {
      fs.unlinkSync(notebook.generatedPdfPath);
    }

    const now = new Date().toISOString();
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM study_pages WHERE id = ? AND notebook_id = ?').run(pageId, notebookId);
      resequenceStudyPages(notebookId, now);
      db.prepare(`
        UPDATE study_notebooks
        SET generated_pdf_path = NULL, updated_at = ?
        WHERE id = ?
      `).run(now, notebookId);
    });
    tx();

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao excluir foto.' });
  }
});

app.delete('/api/study/notebooks/:id/pages', (req, res) => {
  try {
    const notebookId = Number(req.params.id);
    const notebook = db.prepare(`
      SELECT id, generated_pdf_path AS generatedPdfPath
      FROM study_notebooks
      WHERE id = ?
    `).get(notebookId);
    if (!notebook) {
      return res.status(404).json({ error: 'Caderno nao encontrado.' });
    }

    const rows = db.prepare(`
      SELECT image_path AS imagePath
      FROM study_pages
      WHERE notebook_id = ?
    `).all(notebookId);
    for (const row of rows) {
      if (row.imagePath && fs.existsSync(row.imagePath)) {
        fs.unlinkSync(row.imagePath);
      }
    }
    if (notebook.generatedPdfPath && fs.existsSync(notebook.generatedPdfPath)) {
      fs.unlinkSync(notebook.generatedPdfPath);
    }

    const now = new Date().toISOString();
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM study_pages WHERE notebook_id = ?').run(notebookId);
      db.prepare(`
        UPDATE study_notebooks
        SET generated_pdf_path = NULL, updated_at = ?
        WHERE id = ?
      `).run(now, notebookId);
    });
    tx();

    res.json({ ok: true, removed: rows.length });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao limpar fotos.' });
  }
});

app.put('/api/study/notebooks/:id/pages/reorder', (req, res) => {
  try {
    const notebookId = Number(req.params.id);
    const notebook = db.prepare('SELECT id FROM study_notebooks WHERE id = ?').get(notebookId);
    if (!notebook) {
      return res.status(404).json({ error: 'Caderno nao encontrado.' });
    }

    const orderedPageIds = Array.isArray(req.body.orderedPageIds)
      ? req.body.orderedPageIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
      : [];
    if (!orderedPageIds.length) {
      return res.status(400).json({ error: 'orderedPageIds obrigatorio.' });
    }

    const rows = db.prepare(`
      SELECT id
      FROM study_pages
      WHERE notebook_id = ?
      ORDER BY page_order ASC, id ASC
    `).all(notebookId);
    if (rows.length !== orderedPageIds.length) {
      return res.status(400).json({ error: 'Lista de paginas incompleta.' });
    }

    const existingIds = new Set(rows.map((row) => Number(row.id)));
    const providedIds = new Set(orderedPageIds);
    if (existingIds.size !== providedIds.size) {
      return res.status(400).json({ error: 'Lista de paginas invalida.' });
    }
    for (const id of providedIds) {
      if (!existingIds.has(id)) {
        return res.status(400).json({ error: 'Lista contem pagina de outro caderno.' });
      }
    }

    const now = new Date().toISOString();
    const update = db.prepare(`
      UPDATE study_pages
      SET page_order = ?, updated_at = ?
      WHERE id = ? AND notebook_id = ?
    `);
    const tx = db.transaction(() => {
      for (let i = 0; i < orderedPageIds.length; i += 1) {
        update.run(i + 1, now, orderedPageIds[i], notebookId);
      }
      db.prepare('UPDATE study_notebooks SET updated_at = ? WHERE id = ?').run(now, notebookId);
    });
    tx();

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao reordenar paginas.' });
  }
});

app.delete('/api/study/notebooks/:id', (req, res) => {
  try {
    const notebookId = Number(req.params.id);
    const removeFiles = String(req.query.removeFiles || 'true').toLowerCase() === 'true';
    const notebook = db.prepare(`
      SELECT id, para_category AS paraCategory, folder_name AS folderName
      FROM study_notebooks
      WHERE id = ?
    `).get(notebookId);
    if (!notebook) {
      return res.status(404).json({ error: 'Caderno nao encontrado.' });
    }

    const now = new Date().toISOString();
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM study_pages WHERE notebook_id = ?').run(notebookId);
      db.prepare('DELETE FROM study_notebooks WHERE id = ?').run(notebookId);
    });
    tx();

    if (removeFiles) {
      const dirs = getStudyNotebookDirs(notebook.paraCategory, notebook.folderName);
      if (fs.existsSync(dirs.studyRoot)) {
        fs.rmSync(dirs.studyRoot, { recursive: true, force: true });
      }
    }

    res.json({ ok: true, deletedAt: now, removeFiles });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao excluir caderno.' });
  }
});

app.post('/api/study/notebooks/:id/pdf', (req, res) => {
  try {
    const notebookId = Number(req.params.id);
    const notebook = db.prepare(`
      SELECT id, subject, para_category AS paraCategory, folder_name AS folderName
      FROM study_notebooks
      WHERE id = ?
    `).get(notebookId);
    if (!notebook) {
      return res.status(404).json({ error: 'Caderno nao encontrado.' });
    }
    resequenceStudyPagesByFileName(notebookId, new Date().toISOString());

    const pages = db.prepare(`
      SELECT image_path AS imagePath
      FROM study_pages
      WHERE notebook_id = ?
      ORDER BY page_order ASC, id ASC
    `).all(notebookId);
    if (!pages.length) {
      return res.status(400).json({ error: 'Sem paginas para gerar PDF.' });
    }

    const notebookDir = ensureStudyNotebookFolders(notebook.paraCategory, notebook.folderName).baseDir;
    const stem = sanitizeFileName(notebook.subject || `caderno_${notebookId}`);
    const outputPath = path.join(notebookDir, `${stem}.pdf`);
    buildPdfFromImages(pages.map((p) => p.imagePath), outputPath);

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE study_notebooks
      SET generated_pdf_path = ?, updated_at = ?
      WHERE id = ?
    `).run(outputPath, now, notebookId);

    res.json({ ok: true, pdfPath: outputPath, pdfUrl: toOpenFileUrl(outputPath) });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Falha ao gerar PDF.' });
  }
});

app.post('/api/study/notebooks/:id/ocr', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(400).json({ error: 'Configure OPENAI_API_KEY para usar OCR.' });
    }
    const notebookId = Number(req.params.id);
    const pages = db.prepare(`
      SELECT id, image_path AS imagePath
      FROM study_pages
      WHERE notebook_id = ?
      ORDER BY page_order ASC, id ASC
    `).all(notebookId);
    if (!pages.length) {
      return res.status(400).json({ error: 'Sem paginas para OCR.' });
    }

    const updatePage = db.prepare('UPDATE study_pages SET ocr_text = ?, updated_at = ? WHERE id = ?');
    const now = new Date().toISOString();
    let processed = 0;

    for (const page of pages) {
      const ext = path.extname(page.imagePath).toLowerCase();
      if (!OCR_SUPPORTED_EXT.has(ext)) {
        continue;
      }
      const text = await extractTextFromImage(page.imagePath);
      updatePage.run(text, now, page.id);
      processed += 1;
    }

    db.prepare('UPDATE study_notebooks SET updated_at = ? WHERE id = ?').run(now, notebookId);
    res.json({ ok: true, processed });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Falha no OCR.' });
  }
});

app.get('/api/study/search', (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({ error: 'Informe uma palavra para pesquisa.' });
    }
    const term = `%${q}%`;
    const rows = db.prepare(`
      SELECT p.id, p.page_order AS pageOrder, p.ocr_text AS ocrText, p.image_path AS imagePath,
             n.id AS notebookId, n.subject, n.para_category AS paraCategory, n.folder_name AS folderName
      FROM study_pages p
      JOIN study_notebooks n ON n.id = p.notebook_id
      WHERE p.ocr_text LIKE ?
      ORDER BY n.updated_at DESC, p.page_order ASC
      LIMIT 80
    `).all(term);

    res.json(rows.map((row) => ({
      ...row,
      imageUrl: toOpenFileUrl(row.imagePath)
    })));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha na pesquisa OCR.' });
  }
});

app.post('/api/study/notebooks/:id/summarize', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(400).json({ error: 'Configure OPENAI_API_KEY para usar resumo com ChatGPT.' });
    }
    const notebookId = Number(req.params.id);
    const notebook = db.prepare(`
      SELECT id, subject, para_category AS paraCategory, folder_name AS folderName
      FROM study_notebooks
      WHERE id = ?
    `).get(notebookId);
    if (!notebook) {
      return res.status(404).json({ error: 'Caderno nao encontrado.' });
    }

    const rows = db.prepare(`
      SELECT page_order AS pageOrder, ocr_text AS ocrText
      FROM study_pages
      WHERE notebook_id = ?
      ORDER BY page_order ASC
    `).all(notebookId);
    const blocks = rows.map((row) => row.ocrText ? `[Pagina ${row.pageOrder}]\n${row.ocrText}` : '').filter(Boolean);
    if (!blocks.length) {
      return res.status(400).json({ error: 'Rode o OCR antes de resumir.' });
    }

    const content = blocks.join('\n\n').slice(0, 120000);
    const ai = await summarizeStudyContent(notebook.subject, content);
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE study_notebooks
      SET generated_summary = ?, generated_flashcards = ?, updated_at = ?
      WHERE id = ?
    `).run(ai.summary, ai.flashcardsRaw, now, notebookId);

    res.json({
      ok: true,
      summary: ai.summary,
      flashcardsRaw: ai.flashcardsRaw
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Falha ao resumir com ChatGPT.' });
  }
});

app.post('/api/study/notebooks/:id/send-to-memory', (req, res) => {
  try {
    const notebookId = Number(req.params.id);
    const notebook = db.prepare(`
      SELECT id, subject, para_category AS paraCategory, folder_name AS folderName,
             generated_summary AS generatedSummary, generated_flashcards AS generatedFlashcards,
             generated_pdf_path AS generatedPdfPath
      FROM study_notebooks
      WHERE id = ?
    `).get(notebookId);
    if (!notebook) {
      return res.status(404).json({ error: 'Caderno nao encontrado.' });
    }
    const summaryInput = String(req.body.summary || '').trim();
    const flashcardsInput = String(req.body.flashcardsRaw || '').trim();
    const finalSummary = summaryInput || String(notebook.generatedSummary || '').trim();
    const finalFlashcards = flashcardsInput || String(notebook.generatedFlashcards || '').trim();
    if (!finalSummary) {
      return res.status(400).json({ error: 'Escreva o resumo manual antes de enviar para memorizacao.' });
    }

    const now = new Date();
    const nextReview = addDays(now, REVIEW_INTERVALS[0]);
    const notePath = writeStudySummaryNote(notebook.paraCategory, notebook.folderName, notebook.subject, finalSummary);
    const filePath = notebook.generatedPdfPath && fs.existsSync(notebook.generatedPdfPath)
      ? notebook.generatedPdfPath
      : notePath;

    const result = db.prepare(`
      INSERT INTO summaries (title, para_category, file_path, note_path, created_at, release_at, current_step, next_review_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(
      notebook.subject,
      notebook.paraCategory,
      filePath,
      notePath,
      now.toISOString(),
      startOfDayISO(now),
      0,
      startOfDayISO(nextReview)
    );
    const summaryId = Number(result.lastInsertRowid);

    const cards = parseFlashcards(finalFlashcards || '');
    const insertCard = db.prepare(`
      INSERT INTO flashcards (summary_id, prompt, answer, created_at)
      VALUES (?, ?, ?, ?)
    `);
    for (const card of cards) {
      insertCard.run(summaryId, card.prompt, card.answer, now.toISOString());
    }

    db.prepare(`
      UPDATE study_notebooks
      SET linked_summary_id = ?, generated_summary = ?, generated_flashcards = ?, updated_at = ?
      WHERE id = ?
    `).run(summaryId, finalSummary, finalFlashcards || null, now.toISOString(), notebookId);

    res.json({ ok: true, summaryId, flashcardsCount: cards.length });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Falha ao enviar para memorizacao.' });
  }
});

app.post('/api/summaries', upload.single('summaryFile'), (req, res) => {
  try {
    const title = (req.body.title || '').trim();
    const para = normalizePara(req.body.paraCategory || 'resources');
    const folderName = (req.body.folderName || '').trim();
    const fileNameInput = (req.body.fileName || '').trim();
    const summaryText = (req.body.summaryText || '').trim();
    const lociPalace = String(req.body.lociPalace || '').trim().slice(0, 160);
    const lociRoom = String(req.body.lociRoom || '').trim().slice(0, 160);
    const lociHook = String(req.body.lociHook || '').trim().slice(0, 500);
    const flashcardsRaw = req.body.flashcardsRaw;
    const launchDateRaw = String(req.body.launchDate || '').trim();

    if (!title) {
      return res.status(400).json({ error: 'Titulo obrigatorio.' });
    }

    let filePath = null;
    let notePath = null;

    if (req.file) {
      filePath = req.file.path;
      if (summaryText) {
        const target = path.dirname(req.file.path);
        const sourceStem = fileNameInput || path.parse(req.file.originalname || '').name || title;
        const stem = sanitizeFileName(sourceStem);
        const finalFileName = createUniqueFileName(target, `${stem}_resumo.md`);
        const fullPath = path.join(target, finalFileName);
        const content = buildSummaryTemplate(title, summaryText);
        fs.writeFileSync(fullPath, content, 'utf8');
        notePath = fullPath;
      }
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
    const launchDate = launchDateRaw ? parseDateOnly(launchDateRaw) : null;
    if (launchDateRaw && !launchDate) {
      return res.status(400).json({ error: 'Data de lancamento invalida.' });
    }

    const baseForSchedule = launchDate || created;
    const nextReview = addDays(baseForSchedule, REVIEW_INTERVALS[0]);

    const result = db.prepare(`
      INSERT INTO summaries (title, para_category, file_path, note_path, created_at, release_at, current_step, next_review_at, status, loci_palace, loci_room, loci_hook)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
    `).run(
      title,
      para,
      filePath,
      notePath,
      created.toISOString(),
      launchDate ? startOfDayISO(launchDate) : startOfDayISO(created),
      0,
      startOfDayISO(nextReview),
      lociPalace || null,
      lociRoom || null,
      lociHook || null
    );

    const summaryId = Number(result.lastInsertRowid);
    const flashcards = parseFlashcards(flashcardsRaw);
    const insertCard = db.prepare(`
      INSERT INTO flashcards (summary_id, prompt, answer, created_at)
      VALUES (?, ?, ?, ?)
    `);

    for (const card of flashcards) {
      insertCard.run(summaryId, card.prompt, card.answer, created.toISOString());
    }

    res.status(201).json({ id: result.lastInsertRowid, flashcardsCount: flashcards.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar resumo.' });
  }
});

app.post('/api/summaries/:id/review', (req, res) => {
  const id = Number(req.params.id);
  const grade = (req.body.grade || '').trim();
  const confidence = Number.isFinite(Number(req.body.confidence)) ? Number(req.body.confidence) : null;
  const recallNote = String(req.body.recallNote || '').slice(0, 4000);
  const recallSeconds = Number.isFinite(Number(req.body.recallSeconds)) ? Number(req.body.recallSeconds) : null;

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
  const adaptive = calculateAdaptiveSchedule(item, grade, confidence, now);
  const newStep = adaptive.newStep;
  const nextDate = adaptive.nextDate;
  const adaptiveDays = adaptive.intervalDays;
  const illusionDetected = isIllusionOfCompetence(grade, confidence);

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

  const reviewId = db.prepare('SELECT last_insert_rowid() AS id').get().id;
  db.prepare(`
    UPDATE reviews
    SET confidence = ?, recall_note = ?, recall_seconds = ?, adaptive_days = ?, is_illusion = ?
    WHERE id = ?
  `).run(confidence, recallNote || null, recallSeconds, adaptiveDays, illusionDetected ? 1 : 0, reviewId);

  if (illusionDetected) {
    const message = 'Confianca alta com erro detectada. Faça 1 ciclo extra de recall ativo antes da proxima revisao.';
    db.prepare(`
      INSERT INTO metacog_alerts (summary_id, review_id, title, message, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, reviewId, 'Possivel ilusao de competencia', message, now.toISOString());
  }

  res.json({
    ok: true,
    nextReviewAt,
    currentStep: newStep,
    adaptiveDays,
    illusionDetected
  });
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

  const currentFilePath = normalizeSummaryFilePath(item.id, item.file_path);
  const currentNotePath = normalizeSummaryNotePath(item.id, item.note_path);
  const targetDir = path.join(VAULT_DIR, PARA_MAP.archives);
  const fileName = path.basename(currentFilePath || item.file_path || `resumo_${id}.md`);
  const target = path.join(targetDir, createUniqueFileName(targetDir, fileName));
  let noteTarget = currentNotePath || item.note_path || null;

  if (currentFilePath && currentFilePath !== target) {
    fs.renameSync(currentFilePath, target);
  }
  if (currentNotePath) {
    const noteName = path.basename(currentNotePath);
    noteTarget = path.join(targetDir, createUniqueFileName(targetDir, noteName));
    if (currentNotePath !== noteTarget) {
      fs.renameSync(currentNotePath, noteTarget);
    }
  }

  db.prepare(`
    UPDATE summaries
    SET status = 'archived', para_category = 'archives', file_path = ?, note_path = ?
    WHERE id = ?
  `).run(target, noteTarget, id);

  res.json({ ok: true });
});

app.delete('/api/summaries/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const summary = db.prepare('SELECT * FROM summaries WHERE id = ?').get(id);
    if (!summary) {
      return res.status(404).json({ error: 'Resumo nao encontrado.' });
    }

    const removeFile = String(req.query.removeFile || '').toLowerCase() === 'true';

    const tx = db.transaction(() => {
      db.prepare('DELETE FROM flashcards WHERE summary_id = ?').run(id);
      db.prepare('DELETE FROM metacog_alerts WHERE summary_id = ?').run(id);
      db.prepare('DELETE FROM reviews WHERE summary_id = ?').run(id);
      db.prepare('DELETE FROM summaries WHERE id = ?').run(id);
    });
    tx();

    if (removeFile) {
      const filePath = normalizeSummaryFilePath(summary.id, summary.file_path);
      const notePath = normalizeSummaryNotePath(summary.id, summary.note_path);
      if (filePath) {
        fs.unlinkSync(filePath);
      }
      if (notePath && notePath !== filePath) {
        fs.unlinkSync(notePath);
      }
    }

    res.json({ ok: true, removedFile: removeFile });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao excluir resumo.' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`SuperMemo PARA app rodando em http://${HOST}:${PORT}`);
});

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
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

function ensureStudyNotebookFolders(paraCategory, folderName) {
  const dirs = getStudyNotebookDirs(paraCategory, folderName);
  const baseDir = dirs.studyRoot;
  const pagesDir = dirs.pagesRoot;
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }
  return { baseDir, pagesDir };
}

function ensureStudyPagesFolder(paraCategory, folderName) {
  return ensureStudyNotebookFolders(paraCategory, folderName).pagesDir;
}

function getStudyNotebookDirs(paraCategory, folderName) {
  const para = normalizePara(paraCategory);
  const paraRoot = path.join(VAULT_DIR, PARA_MAP[para]);
  const cleanFolder = normalizeStudyFolderName(folderName, folderName || 'materia');
  const notebookRoot = cleanFolder ? path.join(paraRoot, cleanFolder) : paraRoot;
  const studyRoot = notebookRoot;
  const pagesRoot = notebookRoot;
  if (!isInsideBase(paraRoot, notebookRoot)) {
    throw new Error('Pasta do caderno invalida.');
  }
  return { paraRoot, notebookRoot, studyRoot, pagesRoot };
}

function normalizeStudyFolderName(rawFolderName, fallbackSubject) {
  const subjectRaw = String(fallbackSubject || 'materia').trim() || 'materia';
  const subjectSafe = sanitizeFileName(subjectRaw);
  let moduleInput = String(rawFolderName || '').trim();
  if (!moduleInput) {
    return subjectSafe;
  }

  moduleInput = moduleInput
    .replace(/!materia/gi, '')
    .replace(/^[\\/]+|[\\/]+$/g, '')
    .trim();

  const modulePath = sanitizeFolderPath(moduleInput);
  if (!modulePath) {
    return subjectSafe;
  }

  const parts = modulePath.split(path.sep).filter(Boolean);
  const first = String(parts[0] || '').toLowerCase();
  if (first === subjectSafe.toLowerCase()) {
    return parts.join(path.sep);
  }

  return [subjectSafe, ...parts].join(path.sep);
}

function normalizeStudySubject(rawSubject) {
  const subjectRaw = String(rawSubject || '').trim();
  const match = subjectRaw.match(/^(.*?)[\s_-]+apostila[\s_-]*(\d+)$/i);
  if (!match) {
    return {
      subject: subjectRaw || 'Materia',
      inferredModule: ''
    };
  }

  const baseSubject = String(match[1] || '').trim() || subjectRaw;
  const moduleNum = String(match[2] || '').trim();
  return {
    subject: baseSubject,
    inferredModule: moduleNum ? `Apostila_${moduleNum}` : ''
  };
}

function resequenceStudyPages(notebookId, nowIso) {
  const rows = db.prepare(`
    SELECT id
    FROM study_pages
    WHERE notebook_id = ?
    ORDER BY page_order ASC, id ASC
  `).all(notebookId);
  const update = db.prepare('UPDATE study_pages SET page_order = ?, updated_at = ? WHERE id = ?');
  for (let i = 0; i < rows.length; i += 1) {
    update.run(i + 1, nowIso, rows[i].id);
  }
}

function resequenceStudyPagesByFileName(notebookId, nowIso) {
  const rows = db.prepare(`
    SELECT id, image_path AS imagePath
    FROM study_pages
    WHERE notebook_id = ?
  `).all(notebookId);

  const sorted = rows.slice().sort((a, b) => {
    const aParts = extractOrderFromFileName(a.imagePath);
    const bParts = extractOrderFromFileName(b.imagePath);
    if (aParts.order !== bParts.order) {
      return aParts.order - bParts.order;
    }
    const nameCompare = aParts.base.localeCompare(bParts.base, 'pt-BR', { sensitivity: 'base', numeric: true });
    if (nameCompare !== 0) {
      return nameCompare;
    }
    return a.id - b.id;
  });

  const update = db.prepare('UPDATE study_pages SET page_order = ?, updated_at = ? WHERE id = ?');
  for (let i = 0; i < sorted.length; i += 1) {
    update.run(i + 1, nowIso, sorted[i].id);
  }
}

function extractOrderFromFileName(filePath) {
  const base = path.parse(String(filePath || '')).name || '';
  const match = base.match(/\d+/);
  if (!match) {
    return { order: Number.MAX_SAFE_INTEGER, base: base.toLowerCase() };
  }
  const parsed = Number(match[0]);
  return {
    order: Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER,
    base: base.toLowerCase()
  };
}

function sanitizeImageExtension(ext) {
  const lower = String(ext || '').toLowerCase();
  return OCR_SUPPORTED_EXT.has(lower) ? lower : '.jpg';
}

function toOpenFileUrl(fullPath) {
  const normalized = String(fullPath || '').replace(/\\/g, '/');
  const marker = '/KnowledgeOSVault/';
  const idx = normalized.indexOf(marker);
  if (idx === -1) {
    return '#';
  }
  const relative = normalized.slice(idx + marker.length);
  return `/vault/${relative}`;
}

function writeStudySummaryNote(paraCategory, folderName, subject, summary) {
  const { baseDir } = ensureStudyNotebookFolders(paraCategory, folderName);
  const stem = sanitizeFileName(subject || 'resumo_estudo');
  const notePath = path.join(baseDir, `${stem}_resumo_chatgpt.md`);
  const content = `# ${subject}\n\n## Resumo\n${summary}\n`;
  fs.writeFileSync(notePath, content, 'utf8');
  return notePath;
}

function buildPdfFromImages(imagePaths, outputPath) {
  if (!Array.isArray(imagePaths) || !imagePaths.length) {
    throw new Error('Nenhuma imagem para converter em PDF.');
  }

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const objects = [];
  let missingCount = 0;
  let unsupportedCount = 0;

  function addObject(content) {
    objects.push(content);
    return objects.length;
  }

  const pageRefs = [];
  for (const imagePath of imagePaths) {
    if (!fs.existsSync(imagePath) || !fs.statSync(imagePath).isFile()) {
      missingCount += 1;
      continue;
    }
    const ext = path.extname(imagePath).toLowerCase();
    if (!['.jpg', '.jpeg'].includes(ext)) {
      unsupportedCount += 1;
      continue;
    }
    const buffer = fs.readFileSync(imagePath);
    const dims = getJpegDimensions(buffer);
    if (!dims) {
      continue;
    }

    const imageRef = addObject(makePdfImageObject(buffer, dims.width, dims.height));
    const fit = fitImageInsidePage(dims.width, dims.height, pageWidth, pageHeight, 24);
    const contentStream = `q\n${fit.width.toFixed(2)} 0 0 ${fit.height.toFixed(2)} ${fit.x.toFixed(2)} ${fit.y.toFixed(2)} cm\n/Im0 Do\nQ\n`;
    const contentRef = addObject(makePdfStreamObject(Buffer.from(contentStream, 'utf8')));
    const pageRef = addObject(`<< /Type /Page /Parent PAGES_REF 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /XObject << /Im0 ${imageRef} 0 R >> >> /Contents ${contentRef} 0 R >>`);
    pageRefs.push(pageRef);
  }

  if (unsupportedCount > 0) {
    throw new Error(`Existem ${unsupportedCount} foto(s) fora de JPG/JPEG. Reenvie as paginas para normalizar antes de gerar PDF.`);
  }
  if (missingCount > 0) {
    throw new Error(`Existem ${missingCount} foto(s) ausentes. Atualize o caderno e tente novamente.`);
  }
  if (!pageRefs.length) {
    throw new Error('Nenhuma pagina valida para PDF. Use fotos JPG/JPEG.');
  }

  const pagesRef = addObject(`<< /Type /Pages /Count ${pageRefs.length} /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(' ')}] >>`);
  const catalogRef = addObject(`<< /Type /Catalog /Pages ${pagesRef} 0 R >>`);

  objects.forEach((obj, idx) => {
    if (typeof obj === 'string') {
      objects[idx] = obj.replaceAll('PAGES_REF 0 R', `${pagesRef} 0 R`);
    }
  });

  const header = Buffer.from('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n', 'binary');
  const chunks = [header];
  const offsets = [0];
  let runningLength = header.length;

  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(runningLength);
    const objectBody = typeof objects[i] === 'string' ? Buffer.from(objects[i], 'binary') : objects[i];
    const prefix = Buffer.from(`${i + 1} 0 obj\n`, 'binary');
    const suffix = Buffer.from('\nendobj\n', 'binary');
    chunks.push(prefix, objectBody, suffix);
    runningLength += prefix.length + objectBody.length + suffix.length;
  }

  const xrefOffset = runningLength;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root ${catalogRef} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(Buffer.from(xref, 'binary'), Buffer.from(trailer, 'binary'));
  fs.writeFileSync(outputPath, Buffer.concat(chunks));
}

function makePdfImageObject(imageBuffer, width, height) {
  const header = `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBuffer.length} >>\nstream\n`;
  const footer = '\nendstream';
  return Buffer.concat([Buffer.from(header, 'binary'), imageBuffer, Buffer.from(footer, 'binary')]);
}

function makePdfStreamObject(streamBuffer) {
  const header = `<< /Length ${streamBuffer.length} >>\nstream\n`;
  const footer = '\nendstream';
  return Buffer.concat([Buffer.from(header, 'binary'), streamBuffer, Buffer.from(footer, 'binary')]);
}

function fitImageInsidePage(imgW, imgH, pageW, pageH, margin) {
  const usableW = Math.max(1, pageW - (margin * 2));
  const usableH = Math.max(1, pageH - (margin * 2));
  const scale = Math.min(usableW / imgW, usableH / imgH);
  const width = imgW * scale;
  const height = imgH * scale;
  return {
    width,
    height,
    x: (pageW - width) / 2,
    y: (pageH - height) / 2
  };
}

function getJpegDimensions(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xFF) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if ([0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF].includes(marker)) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }
    const blockLength = buffer.readUInt16BE(offset + 2);
    offset += 2 + blockLength;
  }
  return null;
}

async function extractTextFromImage(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const mime = mimeTypeFromExtension(path.extname(imagePath).toLowerCase());
  const imageBase64 = imageBuffer.toString('base64');
  const prompt = 'Extraia todo o texto legivel desta pagina de apostila em portugues. Responda somente com o texto corrido, sem comentarios.';
  const payload = {
    model: OPENAI_MODEL,
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: prompt },
          { type: 'input_image', image_url: `data:${mime};base64,${imageBase64}` }
        ]
      }
    ]
  };

  const json = await callOpenAIResponses(payload);
  return extractOutputText(json).trim();
}

async function summarizeStudyContent(subject, rawText) {
  const prompt = [
    'Voce vai resumir apostilas para estudo.',
    'Retorne JSON com o formato: {"summary":"...","flashcards":[{"prompt":"...","answer":"..."}]}',
    'Regras:',
    '- summary em portugues, objetivo, com no maximo 1200 palavras.',
    '- flashcards entre 8 e 20 itens.',
    '- cada flashcard deve ser pergunta e resposta direta.',
    '- nao invente fatos fora do texto.'
  ].join('\n');

  const payload = {
    model: OPENAI_MODEL,
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: `${prompt}\n\nMateria: ${subject}\n\nTexto OCR:\n${rawText}` }
        ]
      }
    ]
  };

  const json = await callOpenAIResponses(payload);
  const text = extractOutputText(json).trim();
  const parsed = safeParseJsonBlock(text);
  if (!parsed || typeof parsed.summary !== 'string') {
    throw new Error('Resposta do ChatGPT em formato invalido.');
  }

  const flashcards = Array.isArray(parsed.flashcards)
    ? parsed.flashcards
      .map((card) => ({
        prompt: String(card?.prompt || '').trim().slice(0, 500),
        answer: String(card?.answer || '').trim().slice(0, 1000)
      }))
      .filter((card) => card.prompt && card.answer)
      .slice(0, 30)
    : [];

  return {
    summary: parsed.summary.trim(),
    flashcardsRaw: flashcards.map((card) => `${card.prompt}::${card.answer}`).join('\n')
  };
}

function safeParseJsonBlock(value) {
  try {
    return JSON.parse(value);
  } catch (err) {
    const match = String(value).match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function callOpenAIResponses(payload) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Falha OpenAI (${response.status}): ${detail || 'sem detalhes'}`);
  }
  return response.json();
}

function extractOutputText(responseJson) {
  if (typeof responseJson?.output_text === 'string' && responseJson.output_text.trim()) {
    return responseJson.output_text;
  }
  const parts = [];
  const output = Array.isArray(responseJson?.output) ? responseJson.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const chunk of content) {
      if (typeof chunk?.text === 'string') {
        parts.push(chunk.text);
      }
    }
  }
  return parts.join('\n').trim();
}

function mimeTypeFromExtension(ext) {
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      para_category TEXT NOT NULL,
      file_path TEXT NOT NULL,
      note_path TEXT,
      created_at TEXT NOT NULL,
      release_at TEXT,
      current_step INTEGER NOT NULL DEFAULT 0,
      next_review_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      last_grade TEXT,
      loci_palace TEXT,
      loci_room TEXT,
      loci_hook TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      summary_id INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      grade TEXT NOT NULL,
      resulting_step INTEGER NOT NULL,
      next_review_at TEXT NOT NULL,
      confidence INTEGER,
      recall_note TEXT,
      recall_seconds INTEGER,
      adaptive_days INTEGER,
      is_illusion INTEGER DEFAULT 0,
      FOREIGN KEY(summary_id) REFERENCES summaries(id)
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      summary_id INTEGER NOT NULL,
      prompt TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(summary_id) REFERENCES summaries(id)
    );

    CREATE TABLE IF NOT EXISTS metacog_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      summary_id INTEGER NOT NULL,
      review_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS metacog_risk_overrides (
      summary_id INTEGER PRIMARY KEY,
      risk_override INTEGER NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(summary_id) REFERENCES summaries(id)
    );

    CREATE TABLE IF NOT EXISTS study_notebooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      para_category TEXT NOT NULL,
      folder_name TEXT NOT NULL,
      generated_pdf_path TEXT,
      generated_summary TEXT,
      generated_flashcards TEXT,
      linked_summary_id INTEGER,
      summary_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS study_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notebook_id INTEGER NOT NULL,
      page_order INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      ocr_text TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(notebook_id) REFERENCES study_notebooks(id)
    );
  `);

  ensureColumn('reviews', 'confidence', 'INTEGER');
  ensureColumn('reviews', 'recall_note', 'TEXT');
  ensureColumn('reviews', 'recall_seconds', 'INTEGER');
  ensureColumn('reviews', 'adaptive_days', 'INTEGER');
  ensureColumn('reviews', 'is_illusion', 'INTEGER DEFAULT 0');
  ensureColumn('summaries', 'loci_palace', 'TEXT');
  ensureColumn('summaries', 'loci_room', 'TEXT');
  ensureColumn('summaries', 'loci_hook', 'TEXT');
  ensureColumn('summaries', 'release_at', 'TEXT');
  ensureColumn('summaries', 'note_path', 'TEXT');
  ensureColumn('metacog_risk_overrides', 'risk_override', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('metacog_risk_overrides', 'updated_at', 'TEXT');
  ensureColumn('study_notebooks', 'generated_pdf_path', 'TEXT');
  ensureColumn('study_notebooks', 'generated_summary', 'TEXT');
  ensureColumn('study_notebooks', 'generated_flashcards', 'TEXT');
  ensureColumn('study_notebooks', 'linked_summary_id', 'INTEGER');
  ensureColumn('study_notebooks', 'summary_path', 'TEXT');
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

function parseFlashcards(raw) {
  const source = Array.isArray(raw) ? raw.join('\n') : String(raw || '');
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const cards = [];

  for (const line of lines) {
    const parsed = splitFlashcardLine(line);
    if (!parsed) continue;
    const { prompt, answer } = parsed;
    if (!prompt || !answer) {
      continue;
    }
    cards.push({
      prompt: prompt.slice(0, 500),
      answer: answer.slice(0, 1000)
    });
  }

  return cards.slice(0, 50);
}

function splitFlashcardLine(line) {
  const separators = ['::', '=>', '->', ':'];
  for (const sep of separators) {
    const idx = line.indexOf(sep);
    if (idx <= 0) continue;
    const prompt = line.slice(0, idx).trim();
    const answer = line.slice(idx + sep.length).trim();
    if (!prompt || !answer) continue;
    return { prompt, answer };
  }
  return null;
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

function resolveSummaryFilePath(rawPath) {
  const filePath = String(rawPath || '').trim();
  if (!filePath) {
    return null;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }

  const marker = '/knowledgeosvault/';
  const normalized = filePath.replace(/\\/g, '/');
  const idx = normalized.toLowerCase().indexOf(marker);
  if (idx === -1) {
    return null;
  }

  const relative = normalized.slice(idx + marker.length).replace(/^\/+/, '');
  if (!relative) {
    return null;
  }

  try {
    const fallback = resolveInsideBase(VAULT_DIR, relative);
    if (fs.existsSync(fallback) && fs.statSync(fallback).isFile()) {
      return fallback;
    }
  } catch (err) {
    return null;
  }

  return null;
}

function normalizeSummaryPath(summaryId, columnName, rawPath) {
  const resolved = resolveSummaryFilePath(rawPath);
  if (!resolved) {
    return null;
  }

  const current = String(rawPath || '');
  if (summaryId && current !== resolved && ['file_path', 'note_path'].includes(columnName)) {
    db.prepare(`UPDATE summaries SET ${columnName} = ? WHERE id = ?`).run(resolved, summaryId);
  }
  return resolved;
}

function normalizeSummaryFilePath(summaryId, rawPath) {
  return normalizeSummaryPath(summaryId, 'file_path', rawPath);
}

function normalizeSummaryNotePath(summaryId, rawPath) {
  return normalizeSummaryPath(summaryId, 'note_path', rawPath);
}

function isTextFilePath(filePath) {
  const ext = path.extname(String(filePath || '')).toLowerCase();
  return ext === '.md' || ext === '.txt';
}

function resolveEditableSummaryTextPath(summary) {
  const notePath = normalizeSummaryNotePath(summary.id, summary.notePath || summary.note_path);
  if (notePath && isTextFilePath(notePath)) {
    return notePath;
  }

  const mainPath = normalizeSummaryFilePath(summary.id, summary.filePath || summary.file_path);
  if (mainPath && isTextFilePath(mainPath)) {
    return mainPath;
  }

  return null;
}

function ensureSummaryNotePath(summaryId, rawFilePath, rawNotePath) {
  const existingNote = normalizeSummaryNotePath(summaryId, rawNotePath);
  if (existingNote && isTextFilePath(existingNote)) {
    return existingNote;
  }

  const mainPath = normalizeSummaryFilePath(summaryId, rawFilePath);
  if (!mainPath || !fs.existsSync(mainPath) || !fs.statSync(mainPath).isFile()) {
    return null;
  }

  const dir = path.dirname(mainPath);
  const stem = sanitizeFileName(path.parse(mainPath).name || `resumo_${summaryId}`);
  const noteName = createUniqueFileName(dir, `${stem}_resumo.md`);
  const notePath = path.join(dir, noteName);

  db.prepare('UPDATE summaries SET note_path = ? WHERE id = ?').run(notePath, summaryId);
  return notePath;
}

function isInsideBase(baseDir, targetPath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  return resolvedTarget === resolvedBase || resolvedTarget.startsWith(`${resolvedBase}${path.sep}`);
}

function toUnixPath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function parseDateOnly(value) {
  const clean = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return null;
  }
  const d = new Date(`${clean}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseYearMonth(value) {
  const clean = String(value || '').trim();
  const match = clean.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return {
    year,
    monthIndex: month - 1
  };
}

function toDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function listFoldersRecursive(baseDir, maxDepth) {
  const results = [];

  function walk(currentDir, depth) {
    if (depth > maxDepth) {
      return;
    }

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const absolutePath = path.join(currentDir, entry.name);
      const relativePath = toUnixPath(path.relative(baseDir, absolutePath));
      results.push({
        name: entry.name,
        relativePath
      });

      walk(absolutePath, depth + 1);
    }
  }

  walk(baseDir, 1);
  results.sort((a, b) => a.relativePath.localeCompare(b.relativePath, 'pt-BR'));
  return results;
}

function isIllusionOfCompetence(grade, confidence) {
  return evaluateMetacogRisk(grade, confidence).illusionDetected;
}

function calculateAdaptiveSchedule(item, grade, confidence, now) {
  const metrics = getSummaryMemoryMetrics(item.id);
  let newStep = item.current_step;
  let intervalDays = REVIEW_INTERVALS[Math.max(0, Math.min(item.current_step, REVIEW_INTERVALS.length - 1))];

  if (grade === 'good') {
    newStep = Math.min(item.current_step + 1, REVIEW_INTERVALS.length - 1);
    const base = REVIEW_INTERVALS[newStep];
    const performanceFactor = clamp(0.75 + (metrics.avgScore * 0.7), 0.75, 1.45);
    const calibrationPenalty = metrics.overconfidenceRate > 0.34 ? 0.12 : 0;
    const confidenceBoost = (Number.isFinite(confidence) && confidence >= 80 && metrics.overconfidenceRate < 0.25) ? 0.08 : 0;
    intervalDays = Math.round(clamp(base * (performanceFactor - calibrationPenalty + confidenceBoost), 2, 180));
  } else if (grade === 'partial') {
    newStep = Math.max(item.current_step - 1, 0);
    const base = REVIEW_INTERVALS[newStep];
    intervalDays = Math.round(clamp(base * 0.45, 1, 45));
    if (Number.isFinite(confidence) && confidence >= 75) {
      intervalDays = Math.max(1, intervalDays - 1);
    }
  } else {
    newStep = 0;
    intervalDays = (Number.isFinite(confidence) && confidence >= 80) ? 1 : 3;
  }

  return {
    newStep,
    intervalDays,
    nextDate: addDays(now, intervalDays)
  };
}

function getSummaryMemoryMetrics(summaryId) {
  const rows = db.prepare(`
    SELECT grade, confidence
    FROM reviews
    WHERE summary_id = ?
    ORDER BY reviewed_at DESC
    LIMIT 12
  `).all(summaryId);

  if (!rows.length) {
    return { avgScore: 0.65, overconfidenceRate: 0 };
  }

  let scoreSum = 0;
  let overconfidenceCount = 0;

  for (const row of rows) {
    scoreSum += gradeToScore(row.grade);
    if (Number.isFinite(row.confidence) && Number(row.confidence) >= 75 && row.grade !== 'good') {
      overconfidenceCount += 1;
    }
  }

  return {
    avgScore: scoreSum / rows.length,
    overconfidenceRate: overconfidenceCount / rows.length
  };
}

function gradeToScore(grade) {
  if (grade === 'good') return 1;
  if (grade === 'partial') return 0.55;
  return 0;
}

function computeWeeklyGoal(referenceDate) {
  const now = new Date(referenceDate);
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);
  const next7 = addDays(now, 7).toISOString();
  const tomorrowStart = startOfDayISO(addDays(now, 1));

  const active = db.prepare(`SELECT COUNT(*) AS total FROM summaries WHERE status='active'`).get().total;
  const dueToday = db.prepare(`
    SELECT COUNT(*) AS total
    FROM summaries
    WHERE status='active' AND next_review_at < ?
  `).get(tomorrowStart).total;
  const dueNext7 = db.prepare(`
    SELECT COUNT(*) AS total
    FROM summaries
    WHERE status='active' AND next_review_at <= ?
  `).get(next7).total;

  const reviewedThisWeek = db.prepare(`
    SELECT COUNT(*) AS total
    FROM reviews
    WHERE reviewed_at >= ? AND reviewed_at < ?
  `).get(weekStart.toISOString(), weekEnd.toISOString()).total;

  const recentRows = db.prepare(`
    SELECT grade, recall_seconds AS recallSeconds
    FROM reviews
    WHERE reviewed_at >= ?
  `).all(addDays(now, -30).toISOString());

  const totalRecent = recentRows.length;
  const errorCount = recentRows.filter((row) => row.grade !== 'good').length;
  const errorRate = totalRecent > 0 ? errorCount / totalRecent : 0.25;

  const recallValues = recentRows.map((row) => Number(row.recallSeconds)).filter((v) => Number.isFinite(v) && v > 0);
  const avgRecallSeconds = recallValues.length
    ? recallValues.reduce((acc, v) => acc + v, 0) / recallValues.length
    : 45;

  const rawGoal = Math.round((dueNext7 * (1 + errorRate * 0.35)) + (active * 0.15) + (dueToday * 0.4));
  const targetReviews = Math.round(clamp(rawGoal, 12, 320));
  const dailyTarget = Math.max(1, Math.ceil(targetReviews / 7));
  const weekProgress = Math.min(1, reviewedThisWeek / targetReviews);
  const weekdayIndex = ((now.getDay() + 6) % 7) + 1;
  const expectedByToday = Math.ceil((targetReviews / 7) * weekdayIndex);
  const onTrack = reviewedThisWeek >= expectedByToday;

  return {
    targetReviews,
    reviewedThisWeek,
    dailyTarget,
    weekProgress,
    onTrack,
    cognitiveLoad: classifyCognitiveLoad(avgRecallSeconds, errorRate),
    avgRecallSeconds: Math.round(avgRecallSeconds),
    errorRate: Number(errorRate.toFixed(2))
  };
}

function evaluateMetacogRisk(grade, confidenceRaw) {
  const confidence = Number.isFinite(Number(confidenceRaw)) ? Number(confidenceRaw) : null;
  const normalizedConfidence = confidence === null ? 0.5 : clamp(confidence / 100, 0, 1);
  const normalizedGradeRisk = grade === 'forgot' ? 1 : grade === 'partial' ? 0.6 : 0.05;
  const riskScore = clamp((normalizedGradeRisk * 0.75) + (normalizedConfidence * 0.25), 0, 1);

  if (grade === 'forgot') {
    return {
      riskFlag: true,
      illusionDetected: confidence !== null && confidence >= 70,
      reason: 'Esqueceu o conteudo na ultima revisao.',
      riskScore
    };
  }

  if (grade === 'partial' && confidence !== null && confidence >= 60) {
    return {
      riskFlag: true,
      illusionDetected: confidence >= 75,
      reason: 'Recordacao parcial com confianca moderada/alta.',
      riskScore
    };
  }

  if (confidence !== null && confidence >= 75 && grade !== 'good') {
    return {
      riskFlag: true,
      illusionDetected: true,
      reason: 'Confianca alta com erro na revisao.',
      riskScore
    };
  }

  return {
    riskFlag: riskScore >= 0.65,
    illusionDetected: confidence !== null && confidence >= 75 && grade !== 'good',
    reason: riskScore >= 0.65 ? 'Padrao de risco detectado pela pontuacao combinada.' : 'Sem sinais criticos no ultimo ciclo.',
    riskScore
  };
}

function classifyCognitiveLoad(avgRecallSeconds, errorRate) {
  if (avgRecallSeconds >= 80 || errorRate >= 0.45) return 'alta';
  if (avgRecallSeconds >= 50 || errorRate >= 0.25) return 'media';
  return 'baixa';
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function ensureColumn(tableName, columnName, columnType) {
  const cols = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = cols.some((col) => col.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
  }
}

function buildLogicalExport() {
  return {
    exportedAt: new Date().toISOString(),
    summaries: db.prepare('SELECT * FROM summaries ORDER BY id ASC').all(),
    reviews: db.prepare('SELECT * FROM reviews ORDER BY id ASC').all(),
    flashcards: db.prepare('SELECT * FROM flashcards ORDER BY id ASC').all(),
    metacogAlerts: db.prepare('SELECT * FROM metacog_alerts ORDER BY id ASC').all(),
    metacogRiskOverrides: db.prepare('SELECT * FROM metacog_risk_overrides ORDER BY summary_id ASC').all(),
    studyNotebooks: db.prepare('SELECT * FROM study_notebooks ORDER BY id ASC').all(),
    studyPages: db.prepare('SELECT * FROM study_pages ORDER BY id ASC').all()
  };
}

function restoreLogicalExport(payload) {
  const summaries = Array.isArray(payload?.summaries) ? payload.summaries : [];
  const reviews = Array.isArray(payload?.reviews) ? payload.reviews : [];
  const flashcards = Array.isArray(payload?.flashcards) ? payload.flashcards : [];
  const metacogAlerts = Array.isArray(payload?.metacogAlerts) ? payload.metacogAlerts : [];
  const metacogRiskOverrides = Array.isArray(payload?.metacogRiskOverrides) ? payload.metacogRiskOverrides : [];
  const studyNotebooks = Array.isArray(payload?.studyNotebooks) ? payload.studyNotebooks : [];
  const studyPages = Array.isArray(payload?.studyPages) ? payload.studyPages : [];

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM study_pages').run();
    db.prepare('DELETE FROM study_notebooks').run();
    db.prepare('DELETE FROM metacog_risk_overrides').run();
    db.prepare('DELETE FROM metacog_alerts').run();
    db.prepare('DELETE FROM flashcards').run();
    db.prepare('DELETE FROM reviews').run();
    db.prepare('DELETE FROM summaries').run();

    const insertSummary = db.prepare(`
      INSERT INTO summaries (
        id, title, para_category, file_path, note_path, created_at, release_at, current_step,
        next_review_at, status, last_grade, loci_palace, loci_room, loci_hook
      ) VALUES (
        @id, @title, @para_category, @file_path, @note_path, @created_at, @release_at, @current_step,
        @next_review_at, @status, @last_grade, @loci_palace, @loci_room, @loci_hook
      )
    `);
    for (const row of summaries) {
      insertSummary.run({
        ...row,
        note_path: row.note_path ?? null
      });
    }

    const insertReview = db.prepare(`
      INSERT INTO reviews (
        id, summary_id, reviewed_at, grade, resulting_step, next_review_at,
        confidence, recall_note, recall_seconds, adaptive_days, is_illusion
      ) VALUES (
        @id, @summary_id, @reviewed_at, @grade, @resulting_step, @next_review_at,
        @confidence, @recall_note, @recall_seconds, @adaptive_days, @is_illusion
      )
    `);
    for (const row of reviews) {
      insertReview.run(row);
    }

    const insertFlashcard = db.prepare(`
      INSERT INTO flashcards (id, summary_id, prompt, answer, created_at)
      VALUES (@id, @summary_id, @prompt, @answer, @created_at)
    `);
    for (const row of flashcards) {
      insertFlashcard.run(row);
    }

    const insertAlert = db.prepare(`
      INSERT INTO metacog_alerts (id, summary_id, review_id, title, message, created_at, resolved_at)
      VALUES (@id, @summary_id, @review_id, @title, @message, @created_at, @resolved_at)
    `);
    for (const row of metacogAlerts) {
      insertAlert.run(row);
    }

    const insertRiskOverride = db.prepare(`
      INSERT INTO metacog_risk_overrides (summary_id, risk_override, updated_at)
      VALUES (@summary_id, @risk_override, @updated_at)
    `);
    for (const row of metacogRiskOverrides) {
      insertRiskOverride.run(row);
    }

    const insertNotebook = db.prepare(`
      INSERT INTO study_notebooks (
        id, subject, para_category, folder_name, generated_pdf_path, generated_summary,
        generated_flashcards, linked_summary_id, summary_path, created_at, updated_at
      ) VALUES (
        @id, @subject, @para_category, @folder_name, @generated_pdf_path, @generated_summary,
        @generated_flashcards, @linked_summary_id, @summary_path, @created_at, @updated_at
      )
    `);
    for (const row of studyNotebooks) {
      insertNotebook.run(row);
    }

    const insertPage = db.prepare(`
      INSERT INTO study_pages (
        id, notebook_id, page_order, image_path, ocr_text, created_at, updated_at
      ) VALUES (
        @id, @notebook_id, @page_order, @image_path, @ocr_text, @created_at, @updated_at
      )
    `);
    for (const row of studyPages) {
      insertPage.run(row);
    }
  });

  tx();
}
