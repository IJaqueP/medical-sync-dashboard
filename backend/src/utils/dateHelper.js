/* --- UTILIDADES PARA MANEJO DE FECHAS EN FORMATO CHILENO --- */

/* Convertir fecha de DD-MM-YYYY a Date object */
export const parseChileanDate = (dateString) => {
    if (!dateString) return null;
    
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};


/* Convertir Date object a formato DD-MM-YYYY */
export const formatToChileanDate = (date) => {
    if (!date) return null;
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}-${month}-${year}`;
};


/* Convertir fecha ISO (YYYY-MM-DD) a formato chileno (DD-MM-YYYY) */
export const isoToChilean = (isoDate) => {
    if (!isoDate) return null;
    
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
};


/* Convertir fecha chilena (DD-MM-YYYY) a formato ISO (YYYY-MM-DD) */
export const chileanToISO = (chileanDate) => {
    if (!chileanDate) return null;
    
    const [day, month, year] = chileanDate.split('-');
    return `${year}-${month}-${day}`;
};


/* Formatear Date object a formato chileno con hora (DD-MM-YYYY HH:mm) */
export const formatToChileanDateTime = (date) => {
    if (!date) return null;
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
};


export default {
    parseChileanDate,
    formatToChileanDate,
    isoToChilean,
    chileanToISO,
    formatToChileanDateTime
};