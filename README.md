# Encógelo — acortador de URLs (backend real)

Node + Express + MongoDB. Pensado para desplegarse a costo cero en Render (servidor) y MongoDB Atlas (base de datos). Ninguno de los dos pide tarjeta de crédito para el plan gratuito.

## Probarlo en tu computadora

1. Instala las dependencias:
   ```
   npm install
   ```
2. Copia `.env.example` a `.env` y pon tu cadena de conexión de MongoDB (ver paso 1 abajo).
3. Arranca el servidor:
   ```
   npm start
   ```
4. Abre `http://localhost:3000`

## Paso 1: crear la base de datos gratis en MongoDB Atlas

1. Entra a https://www.mongodb.com/cloud/atlas/register y crea una cuenta (no pide tarjeta).
2. Crea un proyecto y luego un cluster con el plan **M0 Free**.
3. En "Database Access", crea un usuario con contraseña.
4. En "Network Access", agrega la IP `0.0.0.0/0` (permite conexión desde cualquier lugar, necesario porque Render usa IPs dinámicas).
5. En el cluster, haz clic en "Connect" → "Drivers" y copia la cadena de conexión. Se ve así:
   ```
   mongodb+srv://usuario:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Reemplaza `<password>` por la contraseña real y agrega `/encogelo` antes del `?` para que use esa base de datos:
   ```
   mongodb+srv://usuario:tupassword@cluster0.xxxxx.mongodb.net/encogelo?retryWrites=true&w=majority
   ```

## Paso 2: subir el código a GitHub

1. Crea un repositorio nuevo en https://github.com/new
2. Desde esta carpeta:
   ```
   git init
   git add .
   git commit -m "Acortador de URLs"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

## Paso 3: desplegar en Render gratis

1. Entra a https://render.com y crea una cuenta con GitHub (no pide tarjeta para el plan free).
2. Clic en "New" → "Web Service".
3. Elige tu repositorio.
4. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. En "Environment Variables" agrega:
   - `MONGO_URI` = la cadena de conexión del paso 1
6. Clic en "Create Web Service". Render te da una URL pública como:
   ```
   https://encogelo.onrender.com
   ```
7. (Opcional pero recomendado) agrega también la variable `BASE_URL` con esa misma URL, para que los enlaces cortos generados siempre usen ese dominio.

Listo: `https://encogelo.onrender.com/abc123` ya es un enlace corto real, accesible desde cualquier navegador o dispositivo.

## Limitación del plan gratis de Render

El plan free "duerme" el servidor después de ~15 minutos sin tráfico. La primera visita después de eso tarda unos 30-50 segundos en despertar; las siguientes son instantáneas. Para un proyecto personal o demo esto normalmente no es problema. Si más adelante necesitas que esté siempre despierto, existen servicios gratuitos de "ping" (como cron-job.org) que lo visitan cada 10 minutos para mantenerlo activo, o puedes pasar a un plan pago cuando lo justifique el uso real.

## Estructura del proyecto

```
encogelo-backend/
├── server.js          → API + redirecciones
├── package.json
├── public/
│   └── index.html      → interfaz web
├── .env.example
└── README.md
```

## Endpoints de la API

- `POST /api/shorten` — body `{ "url": "https://..." }` → devuelve `{ code, url, shortUrl }`
- `GET /api/links` — lista los últimos 50 enlaces creados
- `DELETE /api/links/:code` — borra un enlace
- `GET /:code` — redirige a la url original y suma un clic
