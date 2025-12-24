/**
 * Script para importar vouchers extraídos del panel de Snabb
 */

import fs from 'fs';
import axios from 'axios';

const API_URL = process.env.API_URL || 'https://medical-sync-dashboard-1.onrender.com';

async function importVouchers() {
    try {
        console.log('📖 Leyendo archivo vouchers-snabb.json...');
        const vouchers = JSON.parse(fs.readFileSync('./vouchers-snabb.json', 'utf-8'));
        
        console.log(`✅ ${vouchers.length} vouchers cargados`);
        console.log('🚀 Iniciando importación...\n');
        
        const response = await axios.post(
            `${API_URL}/api/snabb/bulk-import-extracted`,
            { vouchers },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 600000, // 10 minutos de timeout
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );
        
        console.log('\n✅ Importación completada!');
        console.log('Resultados:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error en la importación:', error.message);
        if (error.response) {
            console.error('Respuesta del servidor:', error.response.data);
        }
        process.exit(1);
    }
}

importVouchers();
