// level-up-gaming-frontend/src/utils/regionUtils.ts

// 🚨 IMPORTACIÓN DIRECTA DE LA FUENTE ORIGINAL DE DATOS
import CHILEAN_REGIONS_DATA from '../data/chile_regions.json';

// Interfaces (Asegúrate de que coinciden con la estructura de tu JSON)
interface Provincia { provincia: string; comunas: string[] }
interface ChileanRegion { region: string; provincias: Provincia[]; numero_romano: string; }

// Exportar la data completa para el mapeo en los Selects
export const ALL_REGIONS_DATA: ChileanRegion[] = CHILEAN_REGIONS_DATA as ChileanRegion[];

// Función para obtener las comunas de una región específica
export const getCommunesByRegionName = (regionName: string): string[] => {
    const regionData = ALL_REGIONS_DATA.find(r => r.region === regionName);
    
    if (!regionData) return [];
    
    // Recorre todas las provincias y concatena las comunas
    return regionData.provincias.flatMap(p => p.comunas);
};