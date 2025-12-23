-- Script para limpiar datos de prueba en producción
-- Ejecutar SOLO en base de datos de producción de Render

-- Limpiar tabla de atenciones
TRUNCATE TABLE atenciones RESTART IDENTITY CASCADE;

-- Limpiar tabla de sync_logs
TRUNCATE TABLE sync_logs RESTART IDENTITY CASCADE;

-- Verificar que están vacías
SELECT COUNT(*) as atenciones_count FROM atenciones;
SELECT COUNT(*) as sync_logs_count FROM sync_logs;

SELECT 'Base de datos limpia - Lista para datos reales de Snabb' as status;
