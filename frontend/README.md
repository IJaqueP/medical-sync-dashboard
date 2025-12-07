# Frontend - Dashboard de Atenciones Médicas

Aplicación web para la gestión y visualización de atenciones médicas sincronizadas desde múltiples plataformas.

## 📋 Descripción

Dashboard web moderno construido con React que permite:
- Visualizar atenciones médicas consolidadas
- Gestionar usuarios del sistema
- Generar reportes en PDF y Excel
- Monitorear sincronizaciones
- Administrar facturación y pagos

## 🚀 Tecnologías

- **React** 18.3.1 - Librería UI
- **Vite** 5.4.21 - Build tool y dev server
- **React Router** v6.28.1 - Navegación
- **Axios** 1.7.9 - Cliente HTTP
- **CSS3** - Estilos personalizados
- **ESLint** - Linting

## 📁 Estructura del Proyecto

```
frontend/
├── index.html              # HTML principal
├── package.json            
├── vite.config.js         # Configuración Vite
├── eslint.config.js       # Configuración ESLint
├── .env                   # Variables de entorno
├── public/                # Assets estáticos
└── src/
    ├── main.jsx           # Punto de entrada
    ├── App.jsx            # Componente principal
    ├── App.css            
    ├── index.css          # Estilos globales
    ├── assets/            # Imágenes, iconos
    ├── components/        # Componentes reutilizables
    │   ├── common/        # Componentes comunes
    │   │   ├── Loading.jsx
    │   │   ├── ErrorMessage.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── forms/         # Formularios
    │   └── layout/        # Layout components
    │       ├── Layout.jsx
    │       ├── Navbar.jsx
    │       └── Sidebar.jsx
    ├── context/           # React Context
    │   └── AuthContext.jsx # Contexto de autenticación
    ├── hooks/             # Custom hooks
    ├── pages/             # Páginas principales
    │   ├── Login.jsx      # Página de login
    │   ├── Dashboard.jsx  # Dashboard principal
    │   ├── Atenciones.jsx # Gestión de atenciones
    │   ├── Reportes.jsx   # Generación de reportes
    │   ├── Sincronizacion.jsx # Sincronización
    │   └── Usuarios.jsx   # Gestión de usuarios
    ├── services/          # Servicios API
    │   ├── api.js         # Cliente Axios configurado
    │   ├── authService.js
    │   ├── atencionesService.js
    │   ├── reportsService.js
    │   ├── syncService.js
    │   └── usersService.js
    └── utils/             # Utilidades
```

## ⚙️ Instalación

### Prerrequisitos

- Node.js v18 o superior
- npm o yarn
- Backend corriendo en puerto 3000

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/IJaqueP/medical-sync-dashboard.git
cd medical-sync-dashboard/frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔧 Scripts Disponibles

```bash
# Iniciar desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🎨 Características

### 🔐 Autenticación

- Login con credenciales (username/email + password)
- JWT almacenado en localStorage
- Rutas protegidas con ProtectedRoute
- Cierre de sesión automático al expirar token

### 📊 Dashboard

Vista general con estadísticas:
- Total de atenciones
- Ingresos totales y pagos pendientes
- Distribución por estado de pago
- Gráfico de atenciones por fuente de datos

### 📋 Gestión de Atenciones

- **Tabla paginada** con búsqueda y filtros
- **Filtros**:
  - Rango de fechas
  - Estado de pago
  - Origen de datos
  - Profesional
  - Especialidad
- **Acciones**:
  - Ver detalle
  - Editar
  - Eliminar
  - Actualizar estado de pago

### 📄 Reportes

Generación de reportes con filtros:
- **PDF**: Reporte detallado para impresión
- **Excel**: Exportación para análisis
- **Filtros disponibles**:
  - Fechas
  - Estado de pago
  - Origen de datos
  - Profesional
  - Especialidad

### 🔄 Sincronización

- Sincronización manual por API individual
- Sincronización de todas las APIs
- Historial de sincronizaciones con métricas
- Estado en tiempo real (éxito/error/parcial)

### 👥 Gestión de Usuarios (Admin)

- Crear nuevos usuarios
- Asignar roles (admin/employee)
- Activar/desactivar usuarios
- Actualizar información

## 🎯 Páginas Principales

### Login (`/login`)
```jsx
// Credenciales por defecto
username: admin
password: admin123
```

### Dashboard (`/dashboard`)
- Resumen general del sistema
- Estadísticas clave
- Últimas atenciones

### Atenciones (`/atenciones`)
- Lista completa de atenciones
- Búsqueda y filtros avanzados
- CRUD completo

### Reportes (`/reportes`)
- Generación de PDF y Excel
- Configuración de filtros
- Descarga directa

### Sincronización (`/sincronizacion`)
- Botones de sincronización por API
- Historial de ejecuciones
- Monitoreo de estado

### Usuarios (`/usuarios`)
- Lista de usuarios (admin only)
- Crear/editar/eliminar
- Gestión de roles

## 🔌 Servicios API

### authService.js
```javascript
// Login
login(credential, password)

// Logout
logout()

// Obtener usuario actual
getCurrentUser()

// Verificar si está autenticado
isAuthenticated()
```

### atencionesService.js
```javascript
// Listar atenciones
getAll(params)

// Obtener por ID
getById(id)

// Crear atención
create(data)

// Actualizar
update(id, data)

// Eliminar
delete(id)

// Estadísticas
getEstadisticas()
```

### reportsService.js
```javascript
// Generar PDF
generatePDF(params)

// Generar Excel
generateExcel(params)

// Vista previa
getPreview(params)
```

### syncService.js
```javascript
// Sincronizar todo
syncAll(startDate, endDate)

// Sincronizar API específica
syncByAPI(apiName, startDate, endDate)

// Obtener logs
getLogs(params)

// Estadísticas de sync
getStats()
```

### usersService.js
```javascript
// Listar usuarios
getAll()

// Obtener por ID
getById(id)

// Crear usuario
create(data)

// Actualizar
update(id, data)

// Eliminar
delete(id)
```

## 🎨 Estilos

El proyecto usa **CSS modules** personalizados para cada componente.

### Paleta de Colores
```css
:root {
  --primary: #2563eb;      /* Azul principal */
  --secondary: #64748b;    /* Gris secundario */
  --success: #10b981;      /* Verde éxito */
  --warning: #f59e0b;      /* Naranja advertencia */
  --danger: #ef4444;       /* Rojo peligro */
  --light: #f8fafc;        /* Fondo claro */
  --dark: #1e293b;         /* Texto oscuro */
}
```

### Responsive Design
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Autenticación y Seguridad

### AuthContext

Maneja el estado global de autenticación:
```jsx
const { user, login, logout, isAuthenticated } = useAuth();
```

### ProtectedRoute

Protege rutas que requieren autenticación:
```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### Interceptores Axios

- **Request**: Agrega token automáticamente
- **Response**: Maneja errores 401 (token expirado)

## 📱 Responsive Design

La aplicación es completamente responsive:
- **Mobile First**: Diseño optimizado para móviles
- **Sidebar colapsable**: En dispositivos pequeños
- **Tablas responsivas**: Scroll horizontal en móvil
- **Formularios adaptables**: Stack vertical en móvil

## 🐛 Manejo de Errores

### ErrorMessage Component
```jsx
<ErrorMessage message="Error al cargar datos" />
```

### Try-Catch Pattern
```javascript
try {
  const data = await atencionesService.getAll();
  setAtenciones(data);
} catch (error) {
  setError(error.message || 'Error al cargar atenciones');
}
```

### Loading States
```jsx
{loading ? (
  <Loading />
) : (
  <DataTable data={atenciones} />
)}
```

## 🚀 Build para Producción

```bash
# Crear build optimizado
npm run build

# Los archivos se generan en /dist
# Subir dist/ a tu servidor web
```

### Configuración del Servidor

**Nginx**:
```nginx
server {
  listen 80;
  server_name tudominio.com;
  root /ruta/a/dist;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass http://localhost:3000;
  }
}
```

**Apache**:
```apache
<VirtualHost *:80>
  DocumentRoot /ruta/a/dist
  
  <Directory /ruta/a/dist>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.html [L]
  </Directory>
</VirtualHost>
```

## 🔧 Configuración Avanzada

### Vite Config
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

### Environment Variables
```env
# .env.development
VITE_API_URL=http://localhost:3000/api

# .env.production
VITE_API_URL=https://api.tudominio.com/api
```

## 🧪 Testing (Próximamente)

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🐛 Troubleshooting

### Error "VITE_API_URL is not defined"
```bash
# Crear archivo .env
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

### CORS Error
```bash
# Verificar que el backend tenga configurado CORS
# En backend/.env:
CORS_ORIGIN=http://localhost:5173
```

### Puerto 5173 en uso
```bash
# Cambiar puerto en vite.config.js
server: {
  port: 5174
}
```

### Build Errors
```bash
# Limpiar cache y reinstalar
rm -rf node_modules dist
npm install
npm run build
```

## 📄 Licencia

MIT

## 👤 Autor

**Iván Jaque Pinto**

- GitHub: [@IJaqueP](https://github.com/IJaqueP)
- Email: ijaquepinto@gmail.com

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📞 Soporte

Para reportar bugs o solicitar features, abrir un issue en GitHub.

---

**Nota**: Este frontend está diseñado para trabajar con el backend del sistema. Asegúrate de tener el backend corriendo antes de iniciar el frontend.
