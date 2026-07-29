/* ==========================================================================
   UNLOCK STUDIO // Panel de administración
   Login (Supabase Auth) + subir / editar / borrar modelos.
   Sube archivos a Storage y guarda los datos en la base — sin tocar código.
   ========================================================================== */

import { getSupabase, supabaseConfigurado, CATEGORIAS } from './data.js';

const BUCKET = 'assets';
let supabase = null; // se asigna en iniciar()

/* --- Vistas --- */
const vNoConfig = document.getElementById('admin-no-config');
const vLogin = document.getElementById('admin-login');
const vPanel = document.getElementById('admin-panel');
const mostrar = (el) => {
    [vNoConfig, vLogin, vPanel].forEach((v) => v.classList.add('admin-hidden'));
    el.classList.remove('admin-hidden');
};

/* --- Utilidades --- */
const $ = (id) => document.getElementById(id);
const slugify = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'modelo';
const extDe = (file) => (file.name.split('.').pop() || '').toLowerCase();

function mostrarError(el, msg) { el.textContent = msg; el.classList.remove('admin-hidden'); }
function limpiarError(el) { el.textContent = ''; el.classList.add('admin-hidden'); }

/* Si no hay Supabase configurado, no seguimos. */
if (!supabaseConfigurado) {
    mostrar(vNoConfig);
} else {
    iniciar();
}

async function iniciar() {
    supabase = await getSupabase();

    // Poblar el selector de categorías
    const sel = $('f-tag');
    CATEGORIAS.forEach((c) => {
        const o = document.createElement('option');
        o.value = c.id; o.textContent = c.nombre;
        sel.appendChild(o);
    });

    // ¿Sesión activa?
    const { data: { session } } = await supabase.auth.getSession();
    if (session) entrarAlPanel(session);
    else mostrar(vLogin);

    supabase.auth.onAuthStateChange((_e, s) => {
        if (s) entrarAlPanel(s); else mostrar(vLogin);
    });

    conectarLogin();
    conectarFormulario();
    $('logout-btn').addEventListener('click', () => supabase.auth.signOut());
    $('list-search').addEventListener('input', filtrarLista);
}

/* ==========================================================================
   Login
   ========================================================================== */
function conectarLogin() {
    const form = $('login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        limpiarError($('login-error'));
        const btn = $('login-btn');
        btn.disabled = true;
        const { error } = await supabase.auth.signInWithPassword({
            email: $('login-email').value.trim(),
            password: $('login-pass').value,
        });
        btn.disabled = false;
        if (error) mostrarError($('login-error'), 'No se pudo entrar: ' + error.message);
    });
}

function entrarAlPanel(session) {
    mostrar(vPanel);
    $('admin-user').textContent = session.user?.email || '';
    cargarLista();
}

/* ==========================================================================
   Lista de modelos
   ========================================================================== */
let ASSETS = [];
let editandoId = null;

async function cargarLista() {
    const { data, error } = await supabase.from('assets').select('*')
        .order('orden', { ascending: true }).order('created_at', { ascending: true });
    if (error) { console.error(error); return; }
    ASSETS = data || [];
    renderLista();
}

function renderLista() {
    const cont = $('admin-list');
    $('count').textContent = ASSETS.length;
    if (!ASSETS.length) {
        cont.innerHTML = '<p class="admin-empty">Aún no hay modelos. Agrega el primero con el formulario.</p>';
        return;
    }
    cont.innerHTML = ASSETS.map((a) => `
        <div class="admin-item" data-id="${a.id}" data-nombre="${(a.nombre || '').toLowerCase()}">
            <img src="${a.img_url || ''}" alt="" loading="lazy">
            <div class="admin-item__info">
                <b>${a.nombre || '(sin nombre)'}</b>
                <span>${(a.tag || '').replace(/^\d+_/, '')}</span>
            </div>
            <div class="admin-item__actions">
                <button class="admin-btn-sm" data-accion="editar">Editar</button>
                <button class="admin-btn-sm danger" data-accion="borrar">Borrar</button>
            </div>
        </div>`).join('');

    cont.querySelectorAll('.admin-item').forEach((row) => {
        const id = row.dataset.id;
        row.querySelector('[data-accion="editar"]').addEventListener('click', () => editar(id));
        row.querySelector('[data-accion="borrar"]').addEventListener('click', () => borrar(id));
    });
}

function filtrarLista() {
    const q = $('list-search').value.trim().toLowerCase();
    $('admin-list').querySelectorAll('.admin-item').forEach((row) => {
        row.style.display = !q || row.dataset.nombre.includes(q) ? '' : 'none';
    });
}

/* ==========================================================================
   Alta / edición
   ========================================================================== */
function conectarFormulario() {
    $('asset-form').addEventListener('submit', guardar);
    $('cancel-btn').addEventListener('click', resetForm);
}

function resetForm() {
    editandoId = null;
    $('asset-form').reset();
    $('form-title').innerHTML = '<span class="tick">//</span> Agregar modelo';
    $('glb-hint').textContent = '*';
    $('img-hint').textContent = '*';
    $('cancel-btn').classList.add('admin-hidden');
    limpiarError($('form-error'));
    $('form-progress').classList.add('admin-hidden');
}

function editar(id) {
    const a = ASSETS.find((x) => x.id === id);
    if (!a) return;
    editandoId = id;
    $('f-nombre').value = a.nombre || '';
    $('f-tag').value = a.tag || CATEGORIAS[0].id;
    $('f-poligonos').value = a.poligonos || '';
    $('f-peso').value = a.peso || '';
    $('f-materiales').value = a.materiales || '';
    $('f-glb').value = '';
    $('f-img').value = '';
    // Al editar, los archivos son opcionales (se conservan si no subes otros)
    $('glb-hint').textContent = '(dejar vacío para conservar)';
    $('img-hint').textContent = '(dejar vacío para conservar)';
    $('form-title').innerHTML = '<span class="tick">//</span> Editar: ' + (a.nombre || '');
    $('cancel-btn').classList.remove('admin-hidden');
    limpiarError($('form-error'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function subirArchivo(carpeta, file, base) {
    const path = `${carpeta}/${base}-${Date.now()}.${extDe(file)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw new Error('Subiendo archivo: ' + error.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { path, url: data.publicUrl };
}

async function borrarArchivos(paths) {
    const limpias = paths.filter(Boolean);
    if (limpias.length) await supabase.storage.from(BUCKET).remove(limpias);
}

async function guardar(e) {
    e.preventDefault();
    limpiarError($('form-error'));
    const prog = $('form-progress');
    const btn = $('save-btn');

    const nombre = $('f-nombre').value.trim();
    const tag = $('f-tag').value;
    const glbFile = $('f-glb').files[0];
    const imgFile = $('f-img').files[0];

    if (!nombre) return mostrarError($('form-error'), 'Escribe un nombre.');
    if (!editandoId && !glbFile) return mostrarError($('form-error'), 'Sube el archivo .glb del modelo.');
    if (!editandoId && !imgFile) return mostrarError($('form-error'), 'Sube la foto de portada.');
    if (glbFile && extDe(glbFile) !== 'glb') return mostrarError($('form-error'), 'El modelo debe ser un archivo .glb');

    btn.disabled = true;
    prog.classList.remove('admin-hidden');
    prog.textContent = 'Subiendo…';

    try {
        const base = slugify(nombre);
        const datos = {
            nombre, tag,
            poligonos: $('f-poligonos').value.trim() || null,
            materiales: $('f-materiales').value.trim() || null,
            peso: $('f-peso').value.trim() || null,
        };

        if (glbFile) { const r = await subirArchivo('models', glbFile, base); datos.glb_url = r.url; datos.glb_path = r.path; }
        if (imgFile) { const r = await subirArchivo('images', imgFile, base); datos.img_url = r.url; datos.img_path = r.path; }

        if (editandoId) {
            const anterior = ASSETS.find((x) => x.id === editandoId);
            prog.textContent = 'Guardando cambios…';
            const { error } = await supabase.from('assets').update(datos).eq('id', editandoId);
            if (error) throw new Error(error.message);
            // Borrar archivos viejos si se reemplazaron
            const viejos = [];
            if (glbFile && anterior?.glb_path) viejos.push(anterior.glb_path);
            if (imgFile && anterior?.img_path) viejos.push(anterior.img_path);
            await borrarArchivos(viejos);
        } else {
            datos.slug = slugUnico(base);
            datos.orden = (ASSETS.reduce((m, a) => Math.max(m, a.orden || 0), 0)) + 1;
            prog.textContent = 'Guardando…';
            const { error } = await supabase.from('assets').insert(datos);
            if (error) throw new Error(error.message);
        }

        resetForm();
        await cargarLista();
        prog.classList.remove('admin-hidden');
        prog.textContent = '✓ Listo. El catálogo ya está actualizado.';
        setTimeout(() => prog.classList.add('admin-hidden'), 3500);
    } catch (err) {
        mostrarError($('form-error'), 'Error: ' + err.message);
    } finally {
        btn.disabled = false;
    }
}

function slugUnico(base) {
    const usados = new Set(ASSETS.map((a) => a.slug));
    if (!usados.has(base)) return base;
    let i = 2;
    while (usados.has(`${base}-${i}`)) i++;
    return `${base}-${i}`;
}

/* ==========================================================================
   Borrar
   ========================================================================== */
async function borrar(id) {
    const a = ASSETS.find((x) => x.id === id);
    if (!a) return;
    if (!confirm(`¿Borrar "${a.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
        const { error } = await supabase.from('assets').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await borrarArchivos([a.glb_path, a.img_path]);
        await cargarLista();
    } catch (err) {
        alert('No se pudo borrar: ' + err.message);
    }
}
