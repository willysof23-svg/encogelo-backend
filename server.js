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

// Genera un enlace corto adicional con dominio limpio (is.gd), usando un
// servicio público gratuito. Útil para plataformas como Beacons que rechazan
// dominios con guiones o subdominios largos. Si falla, no rompe el flujo:
// simplemente no se guarda un publicShortUrl y se usa el propio.
async function createPublicShortUrl(longUrl) {
  try {
    const endpoint = 'https://is.gd/create.php?format=simple&url=' + encodeURIComponent(longUrl);
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
    const text = (await res.text()).trim();
    if (text.startsWith('http')) return text;
    console.warn('is.gd no devolvió una url válida:', text);
    return null;
  } catch (err) {
    console.warn('No se pudo generar el enlace público corto:', err.message);
    return null;
  }
}

// Crear un enlace corto
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
    const publicShortUrl = await createPublicShortUrl(shortUrl);

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

// Listar los últimos enlaces creados
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

// Borrar un enlace
app.delete('/api/links/:code', async (req, res) => {
  try {
    await linksCollection.deleteOne({ code: req.params.code });
    res.json({ ok: true });
  } catch (err) {
    console.error('Error en delete:', err);
    res.status(500).json({ error: 'Error interno al borrar el enlace.' });
  }
});

// Redirección del enlace corto (debe ir al final, es la ruta comodín)
app.get('/:code', async (req, res, next) => {
  const { code } = req.params;
  if (code.includes('.')) return next(); // deja pasar archivos estáticos

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
