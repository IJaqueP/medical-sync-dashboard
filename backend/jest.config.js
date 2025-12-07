/**
 * ================================================
 * CONFIGURACIÓN DE JEST PARA TESTING
 * ================================================
 * 
 * Jest es el framework que usamos para ejecutar tests.
 * Esta configuración define cómo Jest debe comportarse.
 */

export default {
    // Entorno de ejecución (node para backend)
    testEnvironment: 'node',

    // Transforma archivos ES6 a CommonJS para que Jest los entienda
    transform: {},

    // Extensiones de archivo que Jest debe procesar
    moduleFileExtensions: ['js', 'json'],

    // Patrón para encontrar archivos de test
    testMatch: [
        '**/tests/**/*.test.js',
        '**/__tests__/**/*.js'
    ],

    // Directorios a ignorar
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],

    // Archivos a ignorar en cobertura
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/',
        'src/models/index.js',
        'src/utils/logger.js'
    ],

    // Archivos de los que queremos medir cobertura
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/models/index.js',
        '!src/utils/logger.js'
    ],

    // Umbral mínimo de cobertura (si está debajo, el test falla)
    coverageThreshold: {
        global: {
            branches: 70,     // 70% de ramas cubiertas
            functions: 70,    // 70% de funciones cubiertas
            lines: 70,        // 70% de líneas cubiertas
            statements: 70    // 70% de statements cubiertos
        }
    },

    // Tiempo máximo para un test antes de fallar (10 segundos)
    testTimeout: 10000,

    // Ejecutar este archivo antes de todos los tests
    setupFilesAfterEnv: ['./tests/setup.js'],

    // Verbose: muestra cada test individualmente
    verbose: true,

    // Detecta handles abiertos (conexiones DB, timers)
    detectOpenHandles: true,

    // Forzar salida después de tests
    forceExit: true
};