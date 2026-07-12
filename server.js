require('dotenv').config();
const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('abcdefghijkmnopqrstuvwxyz23456789', 6);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Falta la variable de entorno MONGO_URI. Revisa .env.example');
  process.exit(1);
}

let linksCollection;

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function getBaseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

// Endpoint de diagnóstico: prueba cada proveedor de forma aislada y
// devuelve el detalle exacto del fallo (status HTTP, causa de red, cuerpo
// de respuesta). Uso temporal para identificar la causa raíz.
app.get('/api/diag-shorten', async (req, res) => {
  const testUrl = 'https://example.com';
  const encoded = encodeURIComponent(testUrl);
  const targets = [
    { name: 'shrtco.de', endpoint: 'https://api.shrtco.de/v2/shorten?url=' + encoded },
    { name: 'clck.ru', endpoint: 'https://clck.ru/--?url=' + encoded },
    { name: 'is.gd', endpoint: 'https://is.gd/create.php?format=simple&url=' + encoded },
    { name: 'v.gd', endpoint: 'https://v.gd/create.php?format=simple&url=' + encoded }
  ];

  const results = [];
  for (const t of targets) {
    const entry = { provider: t.name, endpoint: t.endpoint };
    try {
      const start = Date.now();
      const response = await fetch(t.endpoint, { signal: AbortSignal.timeout(8000) });
      entry.httpStatus = response.status;
      entry.ms = Date.now() - start;
      entry.body = (await response.text()).slice(0, 300);
    } catch (err) {
      entry.errorName = err.name;
      entry.errorMessage = err.message;
      entry.errorCause = err.cause ? String(err.cause) : null;
    }
    results.push(entry);
  }

  res.json({ testedAt: new Date().toISOString(), results });
});

async function tryShrtcoDe(longUrl) {
  const endpoint = 'https://api.shrtco.de/v2/shorten?url=' + encodeURIComponent(longUrl);
  const res = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
  const data = await res.json();
  if (data.ok && data.result) {
    return data.result.full_short_link2 || data.result.full_short_link;
  }
  throw new Error('Respuesta inválida de shrtco.de');
}

async function tryLegacyShortener(endpoint) {
  const res = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
  const text = (await res.text()).trim();
  if (text.startsWith('http')) return text;
  throw new Error('Respuesta inválida: ' + text);
}

async function createPublicShortUrl(longUrl) {
  try {
    return await tryShrtcoDe(longUrl);
  } catch (err) {
    console.warn('Acortador falló (shrtco.de):', err.message);
  }

  const encoded = encodeURIComponent(longUrl);
  const legacyProviders = [
    'https://clck.ru/--?url=' + encoded,
    'https://is.gd/create.php?format=simple&url=' + encoded,
    'https://v.gd/create.php?format=simple&url=' + encoded
  ];
  for (const endpoint of legacyProviders) {
    try {
      return await tryLegacyShortener(endpoint);
    } catch (err) {
      console.warn('Acortador falló (' + endpoint.split('/')[2] + '):', err.message);
    }
  }
  return null;
}

app.post('/api/shorten', async (req, res) => {
  try {
    const { url } = req.body || {};

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Falta la url en el cuerpo de la petición.' });
    }
    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'La url no es válida. Debe empezar con http:// o https://' });
    }

    let code;
    let tries = 0;
    while (tries < 5) {
      code = nanoid();
      const exists = await linksCollection.findOne({ code });
      if (!exists) break;
      code = null;
      tries++;
    }
    if (!code) {
      return res.status(500).json({ error: 'No se pudo generar un código único, intenta de nuevo.' });
    }

    const baseUrl = getBaseUrl(req);
    const shortUrl = `${baseUrl}/${code}`;
    const publicShortUrl = await createPublicShortUrl(url);

    await linksCollection.insertOne({
      code,
      url,
      createdAt: new Date(),
      clicks: 0,
      publicShortUrl: publicShortUrl || null
    });

    res.json({ code, url, shortUrl, publicShortUrl });
  } catch (err) {
    console.error('Error en /api/shorten:', err);
    res.status(500).json({ error: 'Error interno al crear el enlace.' });
  }
});

app.get('/api/links', async (req, res) => {
  try {
    const links = await linksCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const baseUrl = getBaseUrl(req);
    const formatted = links.map((l) => ({
      code: l.code,
      url: l.url,
      clicks: l.clicks || 0,
      shortUrl: `${baseUrl}/${l.code}`,
      publicShortUrl: l.publicShortUrl || null
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error en /api/links:', err);
    res.status(500).json({ error: 'Error interno al listar enlaces.' });
  }
});

app.delete('/api/links/:code', async (req, res) => {
  try {
    await linksCollection.deleteOne({ code: req.params.code });
    res.json({ ok: true });
  } catch (err) {
    console.error('Error en delete:', err);
    res.status(500).json({ error: 'Error interno al borrar el enlace.' });
  }
});

app.get('/:code', async (req, res, next) => {
  const { code } = req.params;
  if (code.includes('.')) return next();

  try {
    const link = await linksCollection.findOne({ code });
    if (!link) {
      return res.status(404).send('Código no encontrado. Revisa que copiaste el enlace completo.');
    }
    await linksCollection.updateOne({ code }, { $inc: { clicks: 1 } });
    res.redirect(link.url);
  } catch (err) {
    console.error('Error en redirect:', err);
    res.status(500).send('Error interno.');
  }
});

async function start() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('encogelo');
  linksCollection = db.collection('links');
  await linksCollection.createIndex({ code: 1 }, { unique: true });

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

start().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});
