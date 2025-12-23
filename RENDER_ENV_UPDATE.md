# Actualizar Variables de Entorno en Render

## 🔧 Variables a actualizar/agregar:

### 1. Ir a tu dashboard de Render
- URL: https://dashboard.render.com/
- Seleccionar el servicio `api-carmona` (o el nombre que tenga tu backend)

### 2. Ir a Environment → Environment Variables

### 3. Agregar/Actualizar estas variables:

```
SNABB_API_URL=https://api.fonasa.snabb.cl/dev
SNABB_API_KEY=4$NcL837*M5n
SNABB_ORGANIZATION_RUT=77728906-3
```

### 4. Guardar cambios
- Hacer clic en "Save Changes"
- Render redesplegará automáticamente el servicio con las nuevas variables

### 5. Esperar el redespliegue
- Tarda aproximadamente 2-3 minutos
- Verificar que el deployment termine exitosamente

## 🗄️ Limpiar base de datos de producción

Después de que se redespliegue, conectar a la base de datos de Render y ejecutar:

```sql
-- Limpiar datos de prueba
TRUNCATE TABLE atenciones RESTART IDENTITY CASCADE;
TRUNCATE TABLE sync_logs RESTART IDENTITY CASCADE;

-- Verificar que estén vacías
SELECT COUNT(*) as atenciones_count FROM atenciones;
SELECT COUNT(*) as sync_logs_count FROM sync_logs;
```

### Cómo conectarse a la BD de Render:
1. En Render dashboard, ir a tu PostgreSQL database
2. Copiar el "External Database URL"
3. Usar psql o un cliente como DBeaver con esa URL

O usar el endpoint de debug (temporal):
```bash
curl -X POST https://tu-backend.onrender.com/api/atenciones/clear-all
```

## ✅ Verificación

Una vez completado, verificar que:
- [ ] Variables de entorno guardadas en Render
- [ ] Deployment completado exitosamente
- [ ] Base de datos limpia
- [ ] API responde correctamente
