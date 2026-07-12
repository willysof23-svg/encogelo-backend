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

  const encoded =
