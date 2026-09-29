/**
 * Cabinet Zormati Athar — Backend (pure Node.js, no Express)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const defaultDB = {
  patients: [],
  rdv_requests: [],
  admin: { password: 'zormati2025' }
};

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {}
  return JSON.parse(JSON.stringify(defaultDB));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

if (!fs.existsSync(DB_FILE)) {
  saveDB(defaultDB);
  console.log('Database initialized.');
}

function uuid() {
  return crypto.randomUUID();
}

function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; if (data.length > 1e6) reject(new Error('Too large')); });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/plain'
};

function serveStatic(req, res, pathname) {
  let filePath = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const idx = path.join(filePath, 'index.html');
    if (fs.existsSync(idx)) filePath = idx;
    else {
      res.writeHead(404); return res.end('Not found');
    }
  }
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(res);
}

async function handleAPI(req, res, pathname) {
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    if (pathname === '/api/health' && method === 'GET') {
      return sendJSON(res, 200, { status: 'ok', cabinet: 'Zormati Athar' });
    }

    if (pathname === '/api/rdv' && method === 'POST') {
      const body = await readBody(req);
      const { nom, prenom, email, telephone, service, pack, lieu, message } = body;
      if (!nom || !prenom || !email || !telephone || !service) {
        return sendJSON(res, 400, { error: 'Champs obligatoires manquants' });
      }
      const db = loadDB();
      const request = {
        id: uuid(),
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim().toLowerCase(),
        telephone: telephone.trim(),
        service,
        pack: pack || null,
        lieu: lieu || 'Cabinet',
        message: message || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      db.rdv_requests.unshift(request);

      let patient = db.patients.find(p => p.email === request.email || p.telephone === request.telephone);
      if (!patient) {
        patient = {
          id: uuid(),
          nom: request.nom,
          prenom: request.prenom,
          email: request.email,
          telephone: request.telephone,
          totalSessions: pack ? parseInt(pack, 10) : 0,
          completedSessions: 0,
          remainingSessions: pack ? parseInt(pack, 10) : 0,
          pack: pack || null,
          service,
          sessions: [],
          createdAt: new Date().toISOString()
        };
        db.patients.push(patient);
      } else if (pack) {
        const n = parseInt(pack, 10);
        patient.totalSessions = (patient.totalSessions || 0) + n;
        patient.remainingSessions = (patient.remainingSessions || 0) + n;
        patient.pack = String((parseInt(patient.pack) || 0) + n);
      }
      saveDB(db);

      console.log('\n======================================');
      console.log('NOUVELLE DEMANDE DE RDV');
      console.log('  ' + request.prenom + ' ' + request.nom);
      console.log('  Email: ' + request.email + '  Tel: ' + request.telephone);
      console.log('  Service: ' + request.service + '  Pack: ' + (request.pack || 'unite') + '  Lieu: ' + request.lieu);
      if (request.message) console.log('  Msg: ' + request.message);
      console.log('======================================\n');

      return sendJSON(res, 201, { success: true, message: 'Demande envoyee. Athar vous contactera rapidement.', requestId: request.id });
    }

    if (pathname === '/api/rdv' && method === 'GET') {
      return sendJSON(res, 200, loadDB().rdv_requests);
    }

    if (pathname.startsWith('/api/rdv/') && method === 'PATCH') {
      const id = pathname.split('/')[3];
      const body = await readBody(req);
      const db = loadDB();
      const r = db.rdv_requests.find(x => x.id === id);
      if (!r) return sendJSON(res, 404, { error: 'Demande introuvable' });
      if (body.status) r.status = body.status;
      saveDB(db);
      return sendJSON(res, 200, r);
    }

    if (pathname === '/api/patients' && method === 'GET') {
      return sendJSON(res, 200, loadDB().patients);
    }

    if (pathname === '/api/patients/login' && method === 'POST') {
      const body = await readBody(req);
      const id = (body.identifier || '').trim().toLowerCase().replace(/\s/g, '');
      if (!id) return sendJSON(res, 400, { error: 'Identifiant requis' });
      const db = loadDB();
      const patient = db.patients.find(p =>
        (p.email && p.email.toLowerCase() === id) ||
        (p.telephone && p.telephone.replace(/\s/g, '') === id)
      );
      if (!patient) return sendJSON(res, 404, { error: 'Patient introuvable. Faites d\'abord une demande de RDV.' });
      return sendJSON(res, 200, patient);
    }

    if (pathname.startsWith('/api/patients/') && method === 'GET' && !pathname.includes('login') && !pathname.includes('add-sessions') && !pathname.includes('complete-session')) {
      const id = pathname.split('/')[3];
      const p = loadDB().patients.find(x => x.id === id);
      if (!p) return sendJSON(res, 404, { error: 'Patient introuvable' });
      return sendJSON(res, 200, p);
    }

    if (pathname.match(/^\/api\/patients\/[^/]+\/add-sessions$/) && method === 'POST') {
      const id = pathname.split('/')[3];
      const body = await readBody(req);
      const n = parseInt(body.count, 10);
      if (!n || n < 1) return sendJSON(res, 400, { error: 'Nombre invalide' });
      const db = loadDB();
      const p = db.patients.find(x => x.id === id);
      if (!p) return sendJSON(res, 404, { error: 'Patient introuvable' });
      p.totalSessions = (p.totalSessions || 0) + n;
      p.remainingSessions = (p.remainingSessions || 0) + n;
      p.pack = String((parseInt(p.pack) || 0) + n);
      saveDB(db);
      return sendJSON(res, 200, p);
    }

    if (pathname.match(/^\/api\/patients\/[^/]+\/complete-session$/) && method === 'POST') {
      const id = pathname.split('/')[3];
      const body = await readBody(req);
      const db = loadDB();
      const p = db.patients.find(x => x.id === id);
      if (!p) return sendJSON(res, 404, { error: 'Patient introuvable' });
      p.completedSessions = (p.completedSessions || 0) + 1;
      if ((p.remainingSessions || 0) > 0) p.remainingSessions -= 1;
      else p.totalSessions = (p.totalSessions || 0) + 1;
      if (!p.sessions) p.sessions = [];
      p.sessions.push({
        id: uuid(),
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        note: body.note || 'Seance de kinesitherapie',
        createdAt: new Date().toISOString()
      });
      saveDB(db);
      return sendJSON(res, 200, p);
    }

    if (pathname === '/api/admin/login' && method === 'POST') {
      const body = await readBody(req);
      if (body.password === loadDB().admin.password) {
        return sendJSON(res, 200, { success: true, token: 'admin-' + Date.now() });
      }
      return sendJSON(res, 401, { error: 'Mot de passe incorrect' });
    }

    if (pathname === '/api/payment/create' && method === 'POST') {
      const body = await readBody(req);
      return sendJSON(res, 200, {
        success: true,
        message: 'Integration Flouci a configurer avec vos cles API',
        amount: body.amount
      });
    }

    sendJSON(res, 404, { error: 'Route introuvable' });
  } catch (e) {
    console.error(e);
    sendJSON(res, 500, { error: e.message || 'Erreur serveur' });
  }
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost:' + PORT);
  const pathname = decodeURIComponent(u.pathname);

  if (pathname.startsWith('/api/')) {
    return handleAPI(req, res, pathname);
  }
  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log('');
  console.log('Cabinet Zormati Athar');
  console.log('  -> http://localhost:' + PORT);
  console.log('  Admin password: zormati2025');
  console.log('  Data: ' + DB_FILE);
  console.log('');
});
