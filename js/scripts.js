/* ==========================================================================
   UNLOCK STUDIO // Asset Catalog
   Modal del visor 3D + buscador de catálogo
   ========================================================================== */

const modal = document.getElementById('modal-visor');
const contenedorVisor = document.getElementById('contenedor-visor');
const modalTitle = document.getElementById('modal-title');
let ultimoDisparador = null;

function abrirModal(src, disparador) {
    ultimoDisparador = disparador || document.activeElement;

    const nombre = disparador?.querySelector('h3')?.textContent?.trim();
    if (nombre && modalTitle) {
        modalTitle.textContent = nombre.toUpperCase().replace(/\s+/g, '_');
    }

    contenedorVisor.innerHTML =
        `<model-viewer src="${src}" camera-controls auto-rotate
            shadow-intensity="1" exposure="1.05" ar
            style="background:#000;" aria-label="Visor 3D del modelo">
         </model-viewer>`;

    modal.classList.add('abierto');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.cerrar-modal').focus();
}

function cerrarModal() {
    modal.classList.remove('abierto');
    contenedorVisor.innerHTML = '';
    document.body.style.overflow = '';
    if (ultimoDisparador) ultimoDisparador.focus();
}

/* --- Tarjetas: click y teclado (Enter/Espacio) --- */
document.querySelectorAll('.tarjeta-asset').forEach((tarjeta) => {
    const src = tarjeta.dataset.modelo;
    tarjeta.addEventListener('click', () => abrirModal(src, tarjeta));
    tarjeta.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            abrirModal(src, tarjeta);
        }
    });
});

/* --- Cerrar: botón, click fuera del marco, Escape --- */
modal.querySelector('.cerrar-modal').addEventListener('click', cerrarModal);
modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('abierto')) cerrarModal();
});

/* --- Buscador en vivo --- */
const buscador = document.getElementById('buscador');
const tarjetas = [...document.querySelectorAll('.tarjeta-asset')];
const sinResultados = document.getElementById('sin-resultados');

if (buscador) {
    buscador.addEventListener('input', () => {
        const q = buscador.value.trim().toLowerCase();
        let visibles = 0;
        tarjetas.forEach((t) => {
            const nombre = t.querySelector('h3').textContent.toLowerCase();
            const coincide = nombre.includes(q);
            t.style.display = coincide ? '' : 'none';
            if (coincide) visibles++;
        });
        sinResultados.style.display = visibles === 0 ? 'block' : 'none';
    });
}
