/* ==========================================================================
   UNLOCK STUDIO // Capa de datos
   --------------------------------------------------------------------------
   - Si Supabase está configurado (js/config.js) → lee el catálogo desde la
     base de datos en la nube.
   - Si NO está configurado, o Supabase no responde (proyecto pausado / sin
     internet) → usa el catálogo local de respaldo de abajo, para que la
     página NUNCA se quede en blanco.

   👉 Tu sobrina NO necesita tocar este archivo. Los modelos nuevos se agregan
      desde el panel /admin. El respaldo de abajo es solo una red de seguridad.
   ========================================================================== */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

/* Categorías del catálogo (fijas — son las etiquetas de la interfaz). */
export const CATEGORIAS = [
    { id: '01_BARRA', nombre: 'Barra de Servicio' },
    { id: '02_CONSUMO', nombre: 'Zonas de Consumo' },
    { id: '03_MAQUINARIA', nombre: 'Maquinaria y Preparación' },
    { id: '04_VAJILLA', nombre: 'Vajilla' },
    { id: '05_NARRATIVA', nombre: 'Narrativa Ambiental' },
    { id: '06_FOLLAJE', nombre: 'Follaje y Elementos Locales' }
];

/* ¿Hay claves reales de Supabase puestas en config.js? */
export const supabaseConfigurado =
    !!SUPABASE_URL && !SUPABASE_URL.includes('TU-PROYECTO') &&
    !!SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('TU-CLAVE');

/* Cliente de Supabase — se crea de forma PEREZOSA (lazy): solo la primera vez
   que se usa, y solo en el navegador. Así este archivo también se puede
   importar desde Node (el script de migración) sin intentar cargar la
   librería desde el CDN por https (que Node no permite). */
let _client = null;
export async function getSupabase() {
    if (!supabaseConfigurado) return null;
    if (!_client) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _client;
}

/* Convierte una fila de la base de datos al formato que usa la interfaz. */
export function filaAAsset(r) {
    return {
        id: r.slug,
        nombre: r.nombre,
        tag: r.tag,
        img: r.img_url,
        glb: r.glb_url,
        specs: {
            'Polígonos': r.poligonos || '—',
            'Materiales': r.materiales || '—',
            'Peso': r.peso || '—'
        }
    };
}

/* Lee el catálogo. Devuelve siempre algo (nube o respaldo local). */
export async function getAssets() {
    const supabase = await getSupabase();
    if (!supabase) return FALLBACK_ASSETS;
    try {
        const { data, error } = await supabase
            .from('assets')
            .select('*')
            .order('orden', { ascending: true })
            .order('created_at', { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) return FALLBACK_ASSETS;
        return data.map(filaAAsset);
    } catch (e) {
        console.warn('[Unlock] Supabase no disponible, uso catálogo local:', e.message);
        return FALLBACK_ASSETS;
    }
}

/* --------------------------------------------------------------------------
   Catálogo de respaldo (red de seguridad). Refleja los modelos que ya
   existían en el repositorio. No hace falta mantenerlo al día.
   -------------------------------------------------------------------------- */
const RAW = 'https://raw.githubusercontent.com/andrtarazona11-arch/unlock_studio/main';

export const FALLBACK_ASSETS = [
    // --- 01_BARRA ---
    { id: 'barra-auxiliar', nombre: 'Barra Auxiliar', tag: '01_BARRA', img: 'img/Barra_Auxiliar_screenshot.png', glb: `${RAW}/modelos_barra_servicio/Barra_Auxiliar.glb`, specs: { 'Polígonos': '1034', 'Materiales': 'Madera, Metal', 'Peso': '2.9 MB' } },
    { id: 'barras-v1-armada', nombre: 'Barras V1 Armada', tag: '01_BARRA', img: 'img/Barras_V1_Armada_screenshot.png', glb: `${RAW}/modelos_barra_servicio/Barras_V1_Armada.glb`, specs: { 'Polígonos': '—', 'Materiales': 'Madera, Metal', 'Peso': '13.7 MB' } },
    { id: 'barras-v2-armada', nombre: 'Barras V2 Armada', tag: '01_BARRA', img: 'img/Barras_V2_Armada_screenshot.png', glb: `${RAW}/modelos_barra_servicio/Barras_V2_Armada.glb`, specs: { 'Polígonos': '1132', 'Materiales': 'Madera, Metal', 'Peso': '7.1 MB' } },
    { id: 'barra-pedidos-v1', nombre: 'Barra Pedidos V1', tag: '01_BARRA', img: 'img/Barra_Pedidos_V1_screenshot.png', glb: `${RAW}/modelos_barra_servicio/Barra_Pedidos_V1.glb`, specs: { 'Polígonos': '3066', 'Materiales': 'Madera, Metal', 'Peso': '13.7 MB' } },
    { id: 'barra-pedidos-v2', nombre: 'Barra Pedidos V2', tag: '01_BARRA', img: 'img/Barra_Pedidos_V2_screenshot.png', glb: `${RAW}/modelos_barra_servicio/Barra_Pedidos_V2.glb`, specs: { 'Polígonos': '108', 'Materiales': 'Madera, Metal', 'Peso': '2.5 MB' } },
    { id: 'barra-principal-v1', nombre: 'Barra Principal V1', tag: '01_BARRA', img: 'img/Barra_Principal_V1_screenshot.png', glb: `${RAW}/modelos_barra_servicio/Barra_Principal_V1.glb`, specs: { 'Polígonos': '—', 'Materiales': 'Cemento', 'Peso': '8.5 MB' } },
    { id: 'barra-principal-v2', nombre: 'Barra Principal V2', tag: '01_BARRA', img: 'img/Barra_Principal_V2_screenshot.png', glb: `${RAW}/modelos_barra_servicio/Barra_Principal_V2.glb`, specs: { 'Polígonos': '1024', 'Materiales': 'Madera, Cemento', 'Peso': '4.7 MB' } },
    { id: 'vitrina-v3', nombre: 'Vitrina de Postres V3', tag: '01_BARRA', img: 'img/Vitrina_de_PostresV3_screenshot.png', glb: `${RAW}/modelos_barra_servicio/Vitrina_de_PostresV3.glb`, specs: { 'Polígonos': '312', 'Materiales': 'Metal, Vidrio', 'Peso': '10.5 MB' } },
    { id: 'vitrina-v3-destruida', nombre: 'Vitrina de Postres V3 Destruida', tag: '01_BARRA', img: 'img/Vitrina_de_PostresV3_Destruida_screenshot.png', glb: `${RAW}/modelos_barra_servicio/Vitrina_de_PostresV3_Destruida.glb`, specs: { 'Polígonos': '418', 'Materiales': 'Metal', 'Peso': '11.3 MB' } },

    // --- 02_CONSUMO ---
    { id: 'barra-larga', nombre: 'Barra Larga', tag: '02_CONSUMO', img: 'img/Barra_Larga_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/Barra_Larga.glb`, specs: { 'Polígonos': '2860', 'Materiales': 'Madera, Metal', 'Peso': '5.4 MB' } },
    { id: 'barra-larga-destrozada', nombre: 'Barra Larga Destrozada', tag: '02_CONSUMO', img: 'img/BarraLarga_Destrozada_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/BarraLarga_Destrozada.glb`, specs: { 'Polígonos': '2983', 'Materiales': 'Madera, Metal', 'Peso': '8.8 MB' } },
    { id: 'barra-comunal', nombre: 'Mesa Comunal', tag: '02_CONSUMO', img: 'img/Mesa_Comunal_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/Mesa_Comunal.glb`, specs: { 'Polígonos': '568', 'Materiales': 'Madera tratada', 'Peso': '7.2 MB' } },
    { id: 'mesa-comunal-destrozada', nombre: 'Mesa Comunal Destrozada', tag: '02_CONSUMO', img: 'img/MesaComunal_Destrozada_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/MesaComunal_Destrozada.glb`, specs: { 'Polígonos': '—', 'Materiales': 'Madera tratada', 'Peso': '6.7 MB' } },
    { id: 'sofa-exterior', nombre: 'Sofa Exterior', tag: '02_CONSUMO', img: 'img/Ext_Sofa_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/Ext_Sofa.glb`, specs: { 'Polígonos': '2668', 'Materiales': 'Tapizado, Metal', 'Peso': '13.2 MB' } },
    { id: 'sofa-ruin', nombre: 'Sofa Ruin', tag: '02_CONSUMO', img: 'img/Ext_Sofa_Ruin_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/Ext_Sofa_Ruin.glb`, specs: { 'Polígonos': '—', 'Materiales': 'Tapizado, Metal', 'Peso': '14.3 MB' } },
    { id: 'banco-decorativo', nombre: 'Banco Decorativo', tag: '02_CONSUMO', img: 'img/Ext_BancoDecorativo_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/Ext_BancoDecorativo.glb`, specs: { 'Polígonos': '2896', 'Materiales': 'Madera, Acero', 'Peso': '4.0 MB' } },
    { id: 'mesa-centro', nombre: 'Mesa Centro', tag: '02_CONSUMO', img: 'img/Ext_Mesa_Centro_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/Ext_Mesa_Centro.glb`, specs: { 'Polígonos': '568', 'Materiales': 'Vidrio, Metal', 'Peso': '2.2 MB' } },
    { id: 'mesa-v1', nombre: 'Mesa V1', tag: '02_CONSUMO', img: 'img/Ext_Mesa_V1_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/Ext_Mesa_V1.glb`, specs: { 'Polígonos': '712', 'Materiales': 'Metal, Pintura', 'Peso': '1.0 MB' } },
    { id: 'mesa-v2', nombre: 'Mesa V2', tag: '02_CONSUMO', img: 'img/Ext_Mesa_V2_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/Ext_Mesa_V2.glb`, specs: { 'Polígonos': '734', 'Materiales': 'Metal, Pintura', 'Peso': '4.3 MB' } },
    { id: 'mesa-v3', nombre: 'Mesa V3', tag: '02_CONSUMO', img: 'img/Ext_Mesa_V3_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/Ext_Mesa_V3.glb`, specs: { 'Polígonos': '3120', 'Materiales': 'Madera, Metal', 'Peso': '4.5 MB' } },
    { id: 'silla-v1', nombre: 'Silla V1', tag: '02_CONSUMO', img: 'img/Ext_Silla_V1_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/Ext_Silla_V1.glb`, specs: { 'Polígonos': '2976', 'Materiales': 'Polipropileno, Metal', 'Peso': '5.9 MB' } },
    { id: 'silla-v2', nombre: 'Silla V2', tag: '02_CONSUMO', img: 'img/Ext_Silla_V2_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/Ext_Silla_V2.glb`, specs: { 'Polígonos': '2192', 'Materiales': 'Polipropileno, Cojín, Metal', 'Peso': '8.2 MB' } },
    { id: 'silla-v3', nombre: 'Silla V3', tag: '02_CONSUMO', img: 'img/Ext_Silla_V3_screenshot.png', glb: `${RAW}/modelos_zonas_de_consumo/Ext_Silla_V3.glb`, specs: { 'Polígonos': '394', 'Materiales': 'Polipropileno, Metal', 'Peso': '5.5 MB' } },

    // --- 03_MAQUINARIA ---
    { id: 'bascula', nombre: 'Báscula', tag: '03_MAQUINARIA', img: 'img/Bascula_screenshot.png', glb: `${RAW}/modelos_maquinaria_preparacion/Bascula.glb`, specs: { 'Polígonos': '236', 'Materiales': 'Metal, Plástico', 'Peso': '5.5 MB' } },
    { id: 'fregadero-barista', nombre: 'Fregadero Estación Barista', tag: '03_MAQUINARIA', img: 'img/Fregadero_screenshot.png', glb: `${RAW}/modelos_maquinaria_preparacion/Fregadero.glb`, specs: { 'Polígonos': '1190', 'Materiales': 'Acero inoxidable, Metal', 'Peso': '8.6 MB' } },
    { id: 'jarra-leche', nombre: 'Jarra de Leche', tag: '03_MAQUINARIA', img: 'img/Jarra_Leche_screenshot.png', glb: `${RAW}/modelos_maquinaria_preparacion/Jarra_Leche.glb`, specs: { 'Polígonos': '228', 'Materiales': 'Acero inoxidable', 'Peso': '5.6 MB' } },
    { id: 'molino-cafe-cables', nombre: 'Molino de Café con Cables', tag: '03_MAQUINARIA', img: 'img/MolinoCafe_Cables_screenshot.png', glb: `${RAW}/modelos_maquinaria_preparacion/MolinoCafe_Cables.glb`, specs: { 'Polígonos': '5644', 'Materiales': 'Metal, Caucho', 'Peso': '4.9 MB' } },
    { id: 'molino-cafe-limpio', nombre: 'Molino de Café Limpio', tag: '03_MAQUINARIA', img: 'img/MolinoCafe_Limpio_screenshot.png', glb: `${RAW}/modelos_maquinaria_preparacion/MolinoCafe_Limpio.glb`, specs: { 'Polígonos': '684', 'Materiales': 'Metal, Plástico', 'Peso': '3.1 MB' } },
    { id: 'portafiltro', nombre: 'Portafiltro', tag: '03_MAQUINARIA', img: 'img/Porta_Filtro_screenshot.png', glb: `${RAW}/modelos_maquinaria_preparacion/Porta_Filtro.glb`, specs: { 'Polígonos': '544', 'Materiales': 'Metal, Goma', 'Peso': '7.7 MB' } },
    { id: 'tamper', nombre: 'Tamper', tag: '03_MAQUINARIA', img: 'img/Tamper_screenshot.png', glb: `${RAW}/modelos_maquinaria_preparacion/Tamper.glb`, specs: { 'Polígonos': '206', 'Materiales': 'Metal, Madera', 'Peso': '6.8 MB' } },

    // --- 05_NARRATIVA ---
    { id: 'biblioteca-grande', nombre: 'Biblioteca Grande', tag: '05_NARRATIVA', img: 'img/Bibliotecas_Grande_screenshot.png', glb: `${RAW}/modelos_narrativa_ambiental/Bibliotecas_Grande.glb`, specs: { 'Polígonos': '458', 'Materiales': 'Madera', 'Peso': '4.2 MB' } },
    { id: 'biblioteca-mediana', nombre: 'Biblioteca Mediana', tag: '05_NARRATIVA', img: 'img/Bibliotecas_Mediana_screenshot.png', glb: `${RAW}/modelos_narrativa_ambiental/Bibliotecas_Mediana.glb`, specs: { 'Polígonos': '382', 'Materiales': 'Madera', 'Peso': '3.8 MB' } },
    { id: 'biblioteca-mediana-v2', nombre: 'Biblioteca Mediana V2', tag: '05_NARRATIVA', img: 'img/Bibliotecas_Mediana_V2_screenshot.png', glb: `${RAW}/modelos_narrativa_ambiental/Bibliotecas_Mediana_V2.glb`, specs: { 'Polígonos': '2242', 'Materiales': 'Madera, Metal', 'Peso': '5.1 MB' } },
];
