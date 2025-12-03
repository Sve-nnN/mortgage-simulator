# Deploy en Railway

Esta guía describe cómo publicar el backend de `mortgage-simulator` en Railway mientras el frontend sigue alojado en Vercel.

## 1. Crear un proyecto y conectarlo a GitHub
1. Regístrate o inicia sesión en https://railway.app.
2. Desde el dashboard, haz clic en **New Project**, elige **Deploy from GitHub** y conecta el repositorio `Sve-nnN/mortgage-simulator`.
3. Railway detectará los directorios, pero deberás crear dos servicios (backend y frontend) porque tienen flujos de construcción distintos.

## 2. Backend (API)
1. En el proyecto de Railway, selecciona **Add Service → Deploy from GitHub**.
2. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: (Railway ejecuta `npm install` automáticamente, no se requiere cambio)
   - **Start Command**: `npm start`
3. Agrega las variables de entorno necesarias desde el panel **Variables**:
   - `MONGO_URI`: pega la cadena de conexión de MongoDB (puedes crear el plugin oficial de Railway `MongoDB` o usar Atlas).
   - `JWT_SECRET`: valor seguro (por ejemplo, 64 caracteres aleatorios).
   - `NODE_ENV`: `production`
4. Railway define `PORT`, y el backend ya usa `process.env.PORT || 5000`, así que no necesitas definirlo manualmente.
5. Si usas el plugin `MongoDB`, copia el valor `MongoDB URI` del plugin y pégalo en `MONGO_URI` para que el servicio pueda conectarse.
6. La API ahora debe compilarse automáticamente cuando se haga push a `main`.

### Notas adicionales del backend
- Ya se admiten orígenes con dominio `*.railway.app` gracias a la expresión regular añadida en `backend/index.js`.
- Si migras datos o necesitas usuarios, usa routes como `/api/auth/register` con la URL del servicio.

## 3. Frontend (opcional)
1. Si ya tienes el frontend en Vercel u otro host y solo quieres Railway para el backend, ignora esta sección.
2. Si necesitas desplegar el frontend en Railway en el futuro, crea el servicio apuntando a `frontend`, usa `npm run build` y `npm run preview -- --host 0.0.0.0 --port $PORT`, y define `VITE_API_URL` con la URL del backend Railway.

## 4. Base de datos (MongoDB)
- Railway ofrece el plugin oficial `MongoDB`. Desde el panel del proyecto, haz clic en **Add Plugin → MongoDB**.
- Una vez creado, copia la variable `MongoDB URI` y pégala en `MONGO_URI` del backend.
- Si prefieres MongoDB Atlas, crea el cluster y copia la cadena `mongodb+srv://...` como `MONGO_URI`.

## 5. Flujo de despliegue y verificaciones
1. Haz push al repositorio (por ejemplo, `git push origin main`). Railway reconstruirá el servicio del backend.
2. Verifica que el backend responda: `curl https://<backend-service>.up.railway.app/` o `https://<backend-service>.up.railway.app/api/dashboard/stats`.
3. La interfaz en Vercel ya consume esta API; visita esa URL (https://mortgage-simulator-khaki.vercel.app) para verificar la integración si es necesario.
4. Si necesitas ver logs, usa el panel de Railway o ejecuta `railway logs --service <service-name>` desde la CLI.

## 6. Sugerencias opcionales
- Puedes instalar la CLI oficial (`npm install -g railway`) y usar `railway login`, `railway init` y `railway up` para sincronizar deployments locales.
- Para validar cambios rápidamente, usa `railway run npm test` dentro de cada servicio.
- Si quieres unificar dominios, compra un dominio personalizado y apúntalo al servicio de Railway desde la sección **Domain** del servicio.
