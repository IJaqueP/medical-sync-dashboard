# Backend - Sistema de Gestión de Atenciones Médicas

API REST para la gestión y sincronización de atenciones médicas desde múltiples fuentes (Reservo, Snabb, DTE Mite).

## 📋 Descripción

Sistema backend completo que centraliza información de atenciones médicas desde diferentes plataformas, permitiendo:
- Sincronización automática desde APIs externas
- Gestión de usuarios y autenticación
- Generación de reportes en PDF y Excel
- Consolidación de datos de facturación y pagos

## 🚀 Tecnologías

- **Node.js** (v18+)
- **Express.js** v5.1.0 - Framework web
- **PostgreSQL** - Base de datos
- **Sequelize** v6.37.7 - ORM
- **JWT** - Autenticación
- **PDFKit** v0.17.2 - Generación de PDFs
- **ExcelJS** v4.4.0 - Generación de Excel
- **Node-Cron** v4.2.1 - Tareas programadas
- **Winston** v3.18.3 - Logging
- **Jest** - Testing

## 📁 Estructura del Proyecto

```
backend/
├── server.js                 # Punto de entrada
├── .env                      # Variables de entorno
├── package.json             
├── jest.config.js           # Configuración de tests
├── src/
│   ├── config/              # Configuraciones
│   │   ├── config.js        # Variables globales
│   │   ├── database.js      # Conexión PostgreSQL
│   │   └── sync.js          # Config de sincronización
│   ├── controllers/         # Controladores
│   │   ├── atencionControllers.js
│   │   ├── authController.js
│   │   ├── reportController.js
│   │   ├── syncController.js
│   │   └── userController.js
│   ├── middleware/          # Middlewares
│   │   ├── auth.js          # Autenticación JWT
│   │   ├── errorHandle.js   # Manejo de errores
│   │   ├── roleCheck.js     # Control de roles
│   │   └── validate.js      # Validaciones
│   ├── models/              # Modelos Sequelize
│   │   ├── Atencion.js      # Modelo principal
│   │   ├── User.js          
│   │   ├── SyncLog.js       
│   │   └── index.js         
│   ├── routes/              # Rutas API
│   │   ├── atenciones.js    
│   │   ├── auth.js          
│   │   ├── reports.js       
│   │   ├── sync.js          
│   │   └── users.js         
│   ├── services/            # Lógica de negocio
│   │   ├── authService.js   
│   │   ├── dtemiteService.js # Integración DTE Mite
│   │   ├── reservoService.js # Integración Reservo
│   │   ├── snabbService.js   # Integración Snabb
│   │   └── syncService.js    # Orquestador de sync
│   └── utils/               # Utilidades
│       ├── cronJobs.js      # Tareas automáticas
│       ├── dateHelper.js    # Manejo de fechas
│       ├── excelGenerator.js
│       ├── pdfGenerator.js  
│       ├── logger.js        # Winston logger
│       └── seedAdmin.js     # Seed usuario admin
└── tests/                   # Tests
    ├── setup.js
    ├── e2e/                 # Tests end-to-end
    ├── integration/         # Tests de integración
    ├── unit/                # Tests unitarios
    ├── fixtures/            # Datos de prueba
    └── helpers/             # Utilidades de testing
```

## ⚙️ Instalación

### Prerrequisitos

- Node.js v18 o superior
- PostgreSQL v14 o superior
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/IJaqueP/medical-sync-dashboard.git
cd medical-sync-dashboard/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz del backend:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=servicio_medico_db
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# APIs Externas (opcional)
RESERVO_API_URL=https://api.reservo.cl
RESERVO_API_TOKEN=tu_token

SNABB_API_URL=https://api.snabb.cl
SNABB_API_KEY=tu_api_key
SNABB_ORGANIZATION_ID=tu_org_id

DTEMITE_API_URL=https://api.dtemite.cl
DTEMITE_API_KEY=tu_api_key
DTEMITE_COMPANY_ID=tu_company_id

# Sincronización
SYNC_INTERVAL_MINUTES=30
```

4. **Crear base de datos**
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE servicio_medico_db;
\q
```

5. **Iniciar servidor**
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 🔧 Scripts Disponibles

```bash
# Iniciar servidor (producción)
npm start

# Modo desarrollo con auto-reload
npm run dev

# Ejecutar tests
npm test

# Crear usuario administrador
npm run seed

# Poblar BD con datos de prueba
node seed-simple.js

# Verificar datos en BD
node check-data.js

# Probar generación PDF
node test-pdf.js
```

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "credential": "admin",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@sistema.com",
      "fullName": "Administrador",
      "role": "admin"
    }
  }
}
```

### Uso del Token
Incluir en todas las peticiones autenticadas:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (admin only)
- `GET /api/auth/profile` - Obtener perfil

### Atenciones
- `GET /api/atenciones` - Listar atenciones (paginado, filtros)
- `GET /api/atenciones/:id` - Obtener atención por ID
- `POST /api/atenciones` - Crear atención manual
- `PUT /api/atenciones/:id` - Actualizar atención
- `DELETE /api/atenciones/:id` - Eliminar atención
- `GET /api/atenciones/estadisticas` - Estadísticas generales

### Reportes
- `GET /api/reports/pdf` - Generar reporte PDF
- `GET /api/reports/excel` - Generar reporte Excel
- `GET /api/reports/atenciones/pdf` - PDF de atenciones
- `GET /api/reports/atenciones/excel` - Excel de atenciones
- `GET /api/reports/atenciones/:id/pdf` - Comprobante individual

### Sincronización
- `POST /api/sync/all` - Sincronizar todas las APIs
- `POST /api/sync/reservo` - Sincronizar Reservo
- `POST /api/sync/snabb` - Sincronizar Snabb
- `POST /api/sync/dtemite` - Sincronizar DTE Mite
- `GET /api/sync/logs` - Historial de sincronizaciones
- `GET /api/sync/stats` - Estadísticas de sync

### Usuarios (Admin only)
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

## 🔄 Sincronización Automática

El sistema ejecuta sincronizaciones automáticas cada 30 minutos (configurable).

```javascript
// Configurar intervalo en .env
SYNC_INTERVAL_MINUTES=30
```

La sincronización:
1. Consulta APIs externas
2. Normaliza datos
3. Detecta duplicados (por IDs externos)
4. Crea o actualiza registros
5. Registra logs de sincronización

## 📊 Base de Datos

### Tablas Principales

#### users
- Gestión de usuarios del sistema
- Roles: `admin`, `employee`
- Autenticación con bcrypt

#### atenciones
- Registro consolidado de atenciones
- Campos de paciente, cita, facturación, pagos
- IDs externos para cada API (reservo_id, snabb_id, dtemite_id)
- Timestamps de auditoría

#### sync_logs
- Historial de sincronizaciones
- Métricas: registros procesados, creados, actualizados, errores
- Duración y estado de cada sync

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm test -- atenciones.test.js

# Con coverage
npm test -- --coverage
```

Estructura de tests:
- **Unit**: Modelos y servicios individuales
- **Integration**: Rutas y controladores
- **E2E**: Flujos completos

## 📝 Logging

El sistema usa Winston para logging estructurado:

```javascript
// Niveles: error, warn, info, debug
logger.logError('Error message', error);
logger.logWarn('Warning message');
logger.logInfo('Info message');
logger.logDebug('Debug message');
```

Logs guardados en:
- `logs/combined.log` - Todos los logs
- `logs/error.log` - Solo errores

## 🔒 Seguridad

- **JWT**: Tokens con expiración configurable
- **Bcrypt**: Hash de contraseñas (10 rounds)
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración restrictiva
- **Rate Limiting**: Protección contra fuerza bruta
- **Validaciones**: Sanitización de inputs

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
pg_isready

# Verificar credenciales en .env
# Verificar que la BD existe
psql -U postgres -l
```

### Error "JWT_SECRET is required"
```bash
# Agregar JWT_SECRET al .env
JWT_SECRET=clave_secreta_muy_larga_y_segura
```

### Puerto 3000 en uso
```bash
# Cambiar puerto en .env
PORT=3001

# O matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
```

## 📄 Licencia

MIT

## 👤 Autor

**Iván Jaque Pinto**

- GitHub: [@IJaqueP](https://github.com/IJaqueP)
- Email: admin@sistema.com

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📞 Soporte

Para reportar bugs o solicitar features, abrir un issue en GitHub.
