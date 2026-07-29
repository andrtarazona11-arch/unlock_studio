/* ==========================================================================
   UNLOCK STUDIO // Migración inicial (se ejecuta UNA sola vez)
   Sube los modelos y fotos que ya existen en el repositorio a Supabase
   Storage e inserta sus filas en la tabla "assets".

   CÓMO USARLO (desde la carpeta del proyecto):
     1) npm install @supabase/supabase-js
     2) export SUPABASE_URL="https://TU-PROYECTO.supabase.co"
        export SUPABASE_SERVICE_KEY="tu-clave-service_role"   # ¡clave SECRETA!
     3) node supabase/migrate.mjs

   La clave service_role está en: Supabase → Project Settings → API →
   "service_role". NO la pongas en el código ni la subas a git.
   ========================================================================== */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { FALLBACK_ASSETS } from '../js/data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = 'https://raw.githubusercontent.com/andrtarazona11-arch/unlock_studio/main/';
const BUCKET = 'assets';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
    console.error('❌ Falta SUPABASE_URL o SUPABASE_SERVICE_KEY en el entorno.');
    console.error('   Revisa las instrucciones al inicio de este archivo.');
    process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const tipoDe = (f) => f.endsWith('.glb') ? 'model/gltf-binary'
    : f.endsWith('.png') ? 'image/png'
    : f.endsWith('.jpg') || f.endsWith('.jpeg') ? 'image/jpeg'
    : 'application/octet-stream';

async function subir(carpeta, rutaLocal) {
    const nombre = path.basename(rutaLocal);
    const destino = `${carpeta}/${nombre}`;
    const bytes = await readFile(path.join(ROOT, rutaLocal));
    const { error } = await supabase.storage.from(BUCKET)
        .upload(destino, bytes, { contentType: tipoDe(nombre), upsert: true });
    if (error) throw new Error(`subiendo ${rutaLocal}: ${error.message}`);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(destino);
    return { path: destino, url: data.publicUrl };
}

async function main() {
    // Slugs que ya existen (para no duplicar si lo corres otra vez)
    const { data: existentes } = await supabase.from('assets').select('slug');
    const yaHay = new Set((existentes || []).map((r) => r.slug));

    let ok = 0, saltados = 0, fallos = 0;

    for (let i = 0; i < FALLBACK_ASSETS.length; i++) {
        const a = FALLBACK_ASSETS[i];
        if (yaHay.has(a.id)) { saltados++; console.log(`↷ ya existe: ${a.nombre}`); continue; }

        const glbLocal = a.glb.replace(RAW, '');   // modelos_xxx/Archivo.glb
        const imgLocal = a.img;                     // img/Archivo.png

        try {
            const glb = await subir('models', glbLocal);
            const img = await subir('images', imgLocal);

            const { error } = await supabase.from('assets').insert({
                slug: a.id,
                nombre: a.nombre,
                tag: a.tag,
                glb_url: glb.url, glb_path: glb.path,
                img_url: img.url, img_path: img.path,
                poligonos: a.specs?.['Polígonos'] ?? null,
                materiales: a.specs?.['Materiales'] ?? null,
                peso: a.specs?.['Peso'] ?? null,
                orden: i,
            });
            if (error) throw new Error(error.message);

            ok++;
            console.log(`✓ ${a.nombre}`);
        } catch (e) {
            fallos++;
            console.error(`✗ ${a.nombre} — ${e.message}`);
        }
    }

    console.log(`\nListo. Insertados: ${ok} · Saltados: ${saltados} · Fallos: ${fallos}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
