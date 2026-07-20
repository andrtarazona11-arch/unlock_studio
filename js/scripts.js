/* ==========================================================================
   UNLOCK STUDIO // Asset Catalog
   Catálogo data-driven · preview 3D en hover · inspector con loader/specs
   ========================================================================== */

/* --------------------------------------------------------------------------
   DATOS — agrega/edita un asset aquí y aparece solo en el catálogo.
   Los campos de "specs" son editables: rellénalos con los datos reales de tu
   export (las dimensiones se calculan solas desde el modelo al abrir el visor).
   -------------------------------------------------------------------------- */
const ASSETS = [
    {
        id: 'barra-auxiliar', nombre: 'Barra Auxiliar', tag: 'BARRA',
        img: 'img/Barra_Auxiliar_screenshot.png',
        glb: 'https://raw.githubusercontent.com/andrtarazona11-arch/unlock_studio/main/modelos_barra_servicio/barra_auxiliar/Barra_Auxiliar.glb',
        specs: { 'Polígonos': '—', 'Materiales': '—', 'Peso': '—' },
    },
    {
        id: 'barra-v1', nombre: 'Barra Principal V1', tag: 'BARRA',
        img: 'img/Barra_V1_screenshot.png',
        glb: 'https://raw.githubusercontent.com/andrtarazona11-arch/unlock_studio/main/modelos_barra_servicio/barras/Barra_V1.glb',
        specs: { 'Polígonos': '—', 'Materiales': '—', 'Peso': '—' },
    },
    {
        id: 'barra-v2', nombre: 'Barra Principal V2', tag: 'BARRA',
        img: 'img/Barra_V2_screenshot.png',
        glb: 'https://raw.githubusercontent.com/andrtarazona11-arch/unlock_studio/main/modelos_barra_servicio/barras/Barra_V2.glb',
        specs: { 'Polígonos': '—', 'Materiales': '—', 'Peso': '—' },
    },
    {
        id: 'vitrina-v1', nombre: 'Vitrina Postres V1', tag: 'VITRINA',
        img: 'img/Vitrina_Postres_V1_screenshot.png',
        glb: 'https://raw.githubusercontent.com/andrtarazona11-arch/unlock_studio/main/modelos_barra_servicio/vitrina_postres/Vitrina_Postres_V1.glb',
        specs: { 'Polígonos': '—', 'Materiales': '—', 'Peso': '—' },
    },
    {
        id: 'vitrina-v2', nombre: 'Vitrina Postres V2', tag: 'VITRINA',
        img: 'img/Vitrina_Postres_V2_screenshot.png',
        glb: 'https://raw.githubusercontent.com/andrtarazona11-arch/unlock_studio/main/modelos_barra_servicio/vitrina_postres/Vitrina_Postres_V2.glb',
        specs: { 'Polígonos': '—', 'Materiales': '—', 'Peso': '—' },
    },
    {
        id: 'vitrina-v3', nombre: 'Vitrina Postres V3', tag: 'VITRINA',
        img: 'img/Vitrina_Postres_V3_screenshot.png',
        glb: 'https://raw.githubusercontent.com/andrtarazona11-arch/unlock_studio/main/modelos_barra_servicio/vitrina_postres/Vitrina_Postres_V3.glb',
        specs: { 'Polígonos': '—', 'Materiales': '—', 'Peso': '—' },
    },
    {
        id: 'cajero', nombre: 'Cajero', tag: 'PUNTO_PAGO',
        img: 'img/Cajero_screenshot.png',
        glb: 'https://raw.githubusercontent.com/andrtarazona11-arch/unlock_studio/main/modelos_barra_servicio/punto_pago/Cajero.glb',
        specs: { 'Polígonos': '—', 'Materiales': '—', 'Peso': '—' },
    },
    {
        id: 'computadora', nombre: 'Computadora', tag: 'PUNTO_PAGO',
        img: 'img/Computadora_screenshot.png',
        glb: 'https://raw.githubusercontent.com/andrtarazona11-arch/unlock_studio/main/modelos_barra_servicio/punto_pago/Computadora.glb',
        specs: { 'Polígonos': '—', 'Materiales': '—', 'Peso': '—' },
    },
];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ==========================================================================
   Render del catálogo
   ========================================================================== */
const catalogo = document.getElementById('catalogo');
const sinResultados = document.getElementById('sin-resultados');

function crearTarjeta(asset, i) {
    const el = document.createElement('article');
    el.className = 'tarjeta-asset';
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    el.dataset.id = asset.id;
    el.dataset.nombre = asset.nombre.toLowerCase();
    el.style.animationDelay = (0.28 + i * 0.06).toFixed(2) + 's';
    el.innerHTML = `
        <span class="asset-index">${String(i + 1).padStart(3, '0')}</span>
        <div class="asset-media">
            <img src="${esc(asset.img)}" alt="${esc(asset.nombre)}" loading="lazy">
        </div>
        <div class="asset-info">
            <span class="asset-tag">${esc(asset.tag)}</span>
            <h3>${esc(asset.nombre)}</h3>
            <span class="asset-cta">VER EN 3D <i>→</i></span>
        </div>`;

    el.addEventListener('click', () => abrirInspector(asset, el));
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirInspector(asset, el); }
    });
    engancharInteracciones(el, asset);
    return el;
}

ASSETS.forEach((asset, i) => catalogo.insertBefore(crearTarjeta(asset, i), sinResultados));
const tarjetas = [...catalogo.querySelectorAll('.tarjeta-asset')];

/* ==========================================================================
   Hero — modelo destacado en vivo
   ========================================================================== */
(() => {
    const destacado = ASSETS[0];
    if (!destacado) return;

    const contador = document.getElementById('stat-count');
    if (contador) contador.textContent = String(ASSETS.length).padStart(2, '0');

    const heroModel = document.getElementById('hero-model');
    const heroName = document.getElementById('hero-featured-name');
    const heroTag = document.getElementById('hero-featured-tag');
    const heroInspect = document.getElementById('hero-inspect');

    if (heroModel) {
        heroModel.setAttribute('poster', destacado.img);
        heroModel.src = destacado.glb;
    }
    if (heroName) heroName.textContent = destacado.nombre;
    if (heroTag) heroTag.textContent = destacado.tag;
    if (heroInspect) {
        heroInspect.addEventListener('click', () => { sfx.click(); abrirInspector(destacado, heroInspect); });
    }
})();

/* ==========================================================================
   Preview 3D en hover + tilt + sonido (por tarjeta)
   ========================================================================== */
function engancharInteracciones(card, asset) {
    const media = card.querySelector('.asset-media');
    let previewTimer = null;
    let liveViewer = null;

    // --- Preview 3D vivo (solo desktop) ---
    if (finePointer) {
        card.addEventListener('mouseenter', () => {
            if (liveViewer) return; // ya hay uno, evita duplicados
            previewTimer = setTimeout(() => {
                liveViewer = document.createElement('model-viewer');
                liveViewer.className = 'asset-live';
                liveViewer.src = asset.glb;
                liveViewer.setAttribute('auto-rotate', '');
                liveViewer.setAttribute('rotation-per-second', '55deg');
                liveViewer.setAttribute('interaction-prompt', 'none');
                liveViewer.setAttribute('disable-zoom', '');
                liveViewer.setAttribute('loading', 'eager');
                liveViewer.setAttribute('poster', asset.img);
                liveViewer.setAttribute('aria-hidden', 'true');
                media.appendChild(liveViewer);
                requestAnimationFrame(() => {
                    liveViewer.classList.add('visible');
                    media.classList.add('preview-on'); // oculta la imagen de fondo
                });
            }, 170);
        });
        card.addEventListener('mouseleave', () => {
            clearTimeout(previewTimer);
            media.classList.remove('preview-on');
            if (liveViewer) { liveViewer.remove(); liveViewer = null; }
        });
    }

    // --- Tilt 3D ---
    if (finePointer && !reduceMotion) {
        const MAX = 9;
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform =
                `translateY(-6px) rotateX(${(-py * MAX).toFixed(2)}deg) rotateY(${(px * MAX).toFixed(2)}deg)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    }

    // --- Sonido ---
    card.addEventListener('mouseenter', () => sfx.hover());
    card.addEventListener('click', () => sfx.click());
}

/* ==========================================================================
   Inspector de asset (modal)
   ========================================================================== */
const modal = document.getElementById('modal-visor');
const contenedorVisor = document.getElementById('contenedor-visor');
const modalTitle = document.getElementById('modal-title');
const loader = document.getElementById('visor-loader');
const visorPct = document.getElementById('visor-pct');
const metaLista = document.getElementById('meta-lista');
const arBtn = modal.querySelector('[data-tool="ar"]');
const rotateBtn = modal.querySelector('[data-tool="rotate"]');

let ultimoDisparador = null;
let mvActual = null;
let assetActual = null;
let dimsActual = null;
let luzIdx = 0;
const LUCES = [
    { e: 1.05, s: 1.0 },   // estudio
    { e: 1.7, s: 0.5 },    // brillante
    { e: 0.75, s: 1.4 },   // dramático
];

function renderMeta(asset, dims) {
    const filas = [
        ['ID', asset.id],
        ['Categoría', asset.tag],
        ['Formato', 'GLB / glTF'],
        ['Dimensiones', dims || 'Calculando…'],
        ['Polígonos', asset.specs['Polígonos']],
        ['Materiales', asset.specs['Materiales']],
        ['Peso', asset.specs['Peso']],
        ['Render', 'Tiempo real'],
    ];
    metaLista.innerHTML = filas
        .map(([k, v]) => `<div class="meta-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
        .join('');
}

function abrirInspector(asset, disparador) {
    ultimoDisparador = disparador || document.activeElement;
    assetActual = asset;
    dimsActual = null;
    luzIdx = 0;

    modalTitle.textContent = asset.nombre.toUpperCase().replace(/\s+/g, '_');
    renderMeta(asset, null);

    // Loader a cero
    loader.classList.remove('oculto');
    visorPct.textContent = '0%';

    // Construir model-viewer
    const mv = document.createElement('model-viewer');
    mv.src = asset.glb;
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('auto-rotate', '');
    mv.setAttribute('shadow-intensity', String(LUCES[0].s));
    mv.setAttribute('exposure', String(LUCES[0].e));
    mv.setAttribute('ar', '');
    mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
    mv.setAttribute('poster', asset.img);
    mv.setAttribute('aria-label', 'Modelo 3D: ' + asset.nombre);
    mv.style.cssText = 'width:100%;height:100%;background:#000;--poster-color:transparent;';
    mv.addEventListener('progress', onProgress);
    mv.addEventListener('load', onLoad);
    contenedorVisor.appendChild(mv);
    mvActual = mv;

    rotateBtn.setAttribute('aria-pressed', 'true');
    if (arBtn) arBtn.disabled = true; // hasta confirmar soporte en 'load'

    modal.classList.add('abierto');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.cerrar-modal').focus();
}

function onProgress(e) {
    const p = Math.round((e.detail.totalProgress || 0) * 100);
    visorPct.textContent = p + '%';
    if (p >= 100) loader.classList.add('oculto');
}

function onLoad() {
    loader.classList.add('oculto');
    // Dimensiones reales desde el bounding box del modelo
    try {
        const d = mvActual.getDimensions?.();
        if (d) {
            const cm = (n) => Math.round(n * 100);
            dimsActual = `${cm(d.x)} × ${cm(d.y)} × ${cm(d.z)} cm`;
            renderMeta(assetActual, dimsActual);
        }
    } catch { /* getDimensions no disponible: se queda en '—' */ }
    if (arBtn) arBtn.disabled = !mvActual.canActivateAR;
}

function cerrarModal() {
    modal.classList.remove('abierto');
    if (mvActual) {
        mvActual.removeEventListener('progress', onProgress);
        mvActual.removeEventListener('load', onLoad);
    }
    contenedorVisor.querySelectorAll('model-viewer').forEach((n) => n.remove());
    mvActual = null;
    document.body.style.overflow = '';
    if (ultimoDisparador) ultimoDisparador.focus();
}

/* --- Herramientas del inspector --- */
modal.querySelector('.modal__tools').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-tool]');
    if (!btn || !mvActual) return;
    sfx.click();

    switch (btn.dataset.tool) {
        case 'rotate': {
            const on = mvActual.hasAttribute('auto-rotate');
            on ? mvActual.removeAttribute('auto-rotate') : mvActual.setAttribute('auto-rotate', '');
            btn.setAttribute('aria-pressed', String(!on));
            break;
        }
        case 'light': {
            luzIdx = (luzIdx + 1) % LUCES.length;
            mvActual.exposure = LUCES[luzIdx].e;
            mvActual.shadowIntensity = LUCES[luzIdx].s;
            break;
        }
        case 'reset': {
            mvActual.cameraOrbit = '0deg 75deg 105%';
            mvActual.fieldOfView = 'auto';
            mvActual.resetTurntableRotation?.();
            mvActual.jumpCameraToGoal?.();
            break;
        }
        case 'shot': {
            try {
                const blob = await mvActual.toBlob({ mimeType: 'image/png', idealAspect: true });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = (assetActual?.id || 'asset') + '.png';
                a.click();
                URL.revokeObjectURL(url);
            } catch { /* toBlob no disponible */ }
            break;
        }
        case 'ar': {
            try { mvActual.activateAR(); } catch { /* AR no soportado en este dispositivo */ }
            break;
        }
    }
});

/* --- Cerrar: botón, click fuera del marco, Escape --- */
modal.querySelector('.cerrar-modal').addEventListener('click', cerrarModal);
modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('abierto')) cerrarModal();
});

/* ==========================================================================
   Buscador en vivo
   ========================================================================== */
const buscador = document.getElementById('buscador');
if (buscador) {
    buscador.addEventListener('input', () => {
        const q = buscador.value.trim().toLowerCase();
        let visibles = 0;
        tarjetas.forEach((t) => {
            const coincide = t.dataset.nombre.includes(q);
            t.style.display = coincide ? '' : 'none';
            if (coincide) visibles++;
        });
        sinResultados.style.display = visibles === 0 ? 'block' : 'none';
    });
}

/* ==========================================================================
   Sonido — bleeps sintetizados con WebAudio (apagado por defecto)
   ========================================================================== */
const sfx = (() => {
    let ctx = null;
    let activo = false;

    const asegurarCtx = () => {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
    };
    const tono = (freq, dur = 0.06, tipo = 'square', vol = 0.04) => {
        if (!activo) return;
        asegurarCtx();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = tipo;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        osc.connect(g).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
    };

    return {
        set(v) { activo = v; if (v) asegurarCtx(); },
        hover() { tono(880, 0.04, 'square', 0.02); },
        click() { tono(220, 0.05, 'sawtooth', 0.045); setTimeout(() => tono(660, 0.07, 'square', 0.035), 40); },
    };
})();

const soundToggle = document.getElementById('sound-toggle');
if (soundToggle) {
    soundToggle.addEventListener('click', () => {
        const nuevo = soundToggle.getAttribute('aria-pressed') !== 'true';
        soundToggle.setAttribute('aria-pressed', String(nuevo));
        soundToggle.setAttribute('aria-label', nuevo ? 'Desactivar sonido' : 'Activar sonido');
        sfx.set(nuevo);
        if (nuevo) sfx.click();
    });
}

/* ==========================================================================
   Boot screen
   ========================================================================== */
(() => {
    const boot = document.getElementById('boot');
    if (!boot) return;
    const barra = boot.querySelector('.boot__bar i');
    const pct = boot.querySelector('.boot__pct');
    const lineas = [...boot.querySelectorAll('.boot__log span')];

    if (reduceMotion) { boot.classList.add('oculto'); return; }

    lineas.forEach((l, i) => setTimeout(() => l.classList.add('on'), 260 + i * 320));

    let p = 0;
    const dur = 1900;
    const t0 = performance.now();
    const tick = (now) => {
        p = Math.min(100, ((now - t0) / dur) * 100);
        barra.style.width = p + '%';
        pct.textContent = Math.floor(p) + '%';
        if (p < 100) requestAnimationFrame(tick);
        else setTimeout(() => boot.classList.add('oculto'), 350);
    };
    requestAnimationFrame(tick);
})();
