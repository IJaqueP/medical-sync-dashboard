# GUÍA DE DESPLIEGUE DEL BACKEND

## Opciones de Hosting Gratuito

### 1. **Render (Recomendado)**

**Pasos:**
1. Ve a [render.com](https://render.com) y crea una cuenta
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. **Variables de Entorno** (agregar en Render):
   ```
   PORT=3000
   NODE_ENV=production
   DB_HOST=tu-postgres-host
   DB_PORT=5432
   DB_NAME=servicio_medico_db
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   JWT_SECRET=tu_secret_jwt_seguro
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=https://ijaquep.github.io
   SYNC_INTERVAL_MINUTES=30
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

6. **Base de Datos PostgreSQL en Render:**
   - Click en "New +" → "PostgreSQL"
   - Copia las credenciales y úsalas en las variables de entorno

7. Deploy automático cuando hagas push a GitHub

**URL Final:** `https://tu-app.onrender.com`

---

### 2. **Railway**

**Pasos:**
1. Ve a [railway.app](https://railway.app)
2. "Start a New Project" → "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Railway detectará automáticamente Node.js
5. Agrega las variables de entorno (igual que en Render)
6. "Add PostgreSQL" desde el panel de Railway

**URL Final:** `https://tu-app.railway.app`

---

### 3. **Heroku** (con límites)

**Pasos:**
1. Instala Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Crea app:
   ```bash
   cd backend
   heroku create nombre-de-tu-app
   ```
4. Agrega PostgreSQL:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```
5. Configura variables:
   ```bash
   heroku config:set JWT_SECRET=tu_secret
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://ijaquep.github.io
   ```
6. Deploy:
   ```bash
   git push heroku main
   ```

**URL Final:** `https://nombre-de-tu-app.herokuapp.com`

---

## Después de Desplegar el Backend

### 1. Actualizar Frontend con URL del Backend

Edita `frontend/.env.production`:
```env
VITE_API_URL=https://tu-backend-url.onrender.com
```

### 2. Re-desplegar Frontend
```bash
cd frontend
npm run deploy
```

### 3. Verificar Funcionamiento

**Probar endpoints:**
```bash
# Health check
curl https://tu-backend-url.onrender.com/health

# Login
curl -X POST https://tu-backend-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"credential":"admin","password":"admin123"}'
```

---

## Inicializar Base de Datos en Producción

Una vez desplegado, ejecuta desde Render/Railway console:

```bash
npm run migrate
npm run seed
```

O si tienes acceso SSH:
```bash
node src/models/index.js
node src/utils/seedAdmin.js
node seed-simple.js
```

---

## Troubleshooting

### Error: "Database connection failed"
- Verifica las credenciales de PostgreSQL
- Asegúrate que `DB_HOST` incluye el puerto si es necesario
- Revisa que el firewall permita conexiones

### Error: "CORS blocked"
- Verifica que `CORS_ORIGIN` en backend incluya tu URL de GitHub Pages
- Debe ser: `https://ijaquep.github.io`

### Backend no inicia
- Revisa los logs en tu plataforma de hosting
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate que `PORT` no esté hardcodeado (debe usar `process.env.PORT`)

---

## Monitoreo

**Render:** Ver logs en tiempo real desde el dashboard  
**Railway:** Pestaña "Deployments" → "View Logs"  
**Heroku:** `heroku logs --tail`

---

## Costos

- **Render Free:** 750 horas/mes, suspende después de 15 min de inactividad
- **Railway:** $5 crédito mensual gratuito
- **Heroku:** Eco plan ($5/mes) o Free (con limitaciones)

**Recomendación:** Comienza con Render (más fácil y generoso con plan gratuito)
