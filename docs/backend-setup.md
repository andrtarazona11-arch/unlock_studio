# Guía: publicar Unlock Studio con backend (Supabase + Vercel)

Objetivo: que tu sobrina agregue modelos **solo subiendo el `.glb` y la foto**
desde un panel, sin editar nunca el código.

- **Vercel** → publica la página web.
- **Supabase** → guarda los modelos, las fotos y la lista del catálogo, y el login del panel.

Todo en el **plan gratis**. Sigue los pasos en orden. Toma ~20 minutos la primera vez.

---

## Parte 1 — Crear el proyecto en Supabase

1. Entra a **https://supabase.com** → *Start your project* → crea cuenta (gratis).
2. **New project**. Ponle un nombre (ej. `unlock-studio`), una contraseña de base de
   datos (guárdala) y elige la región más cercana. Espera 1–2 min a que se cree.
3. Ve a **Project Settings → API** y copia estos dos valores:
   - **Project URL** → algo como `https://abcd1234.supabase.co`
   - **anon public** (una clave larga) → es **pública y segura**.

## Parte 2 — Crear la tabla y el almacén

1. En Supabase, abre **SQL Editor → New query**.
2. Abre el archivo [`supabase/schema.sql`](../supabase/schema.sql) de este proyecto,
   copia **todo** su contenido, pégalo y pulsa **Run**.
3. Debe decir *Success*. Esto crea las tablas `assets` y `admins`, la función `is_admin()`,
   la seguridad y el bucket de archivos.

## Parte 3 — Crear los usuarios que podrán subir modelos

Solo pueden administrar el catálogo los correos que estén en la tabla `admins`. Cada
persona necesita **dos cosas** (con el **mismo correo** en ambas):

1. **Su login** → **Authentication → Users → Add user → Create new user**. Escribe el
   correo y una contraseña, marca *Auto Confirm User*. Hazlo para ti y para tu sobrina.
2. **Su permiso** → estar en la tabla `admins`. El `schema.sql` ya siembra
   `jhazieloria@gmail.com` y `andrtarazona11@gmail.com`. Para agregar más admins en el futuro,
   en el **SQL Editor**:
   ```sql
   insert into public.admins (email) values ('otro-correo@ejemplo.com')
   on conflict (email) do nothing;
   ```

> Estar en `admins` da permiso; el usuario de Auth es el login. Los dos deben usar el
> mismo correo. Para quitarle acceso a alguien: `delete from public.admins where email = '…';`

## Parte 4 — Conectar la web con Supabase

1. Abre el archivo [`js/config.js`](../js/config.js).
2. Pega los dos valores de la Parte 1:
   ```js
   export const SUPABASE_URL = "https://abcd1234.supabase.co";
   export const SUPABASE_ANON_KEY = "eyJ...tu-clave-anon...";
   ```
3. Guarda. (Es normal que estas dos claves queden en el código: son públicas.)

## Parte 5 — Subir los modelos que ya existen (una sola vez)

Esto mueve los 33 modelos y fotos actuales del repositorio a Supabase.

1. Abre una terminal en la carpeta del proyecto y ejecuta:
   ```bash
   npm install @supabase/supabase-js
   ```
2. Copia `.env.example` a `.env` y rellena `SUPABASE_URL` y `SUPABASE_SERVICE_KEY`
   (la clave **service_role**, en *Project Settings → API*). El `.env` **no** se sube a git.
3. Carga las variables y corre la migración:
   ```bash
   export $(grep -v '^#' .env | xargs)
   node supabase/migrate.mjs
   ```
4. Deberías ver `✓` por cada modelo y al final `Insertados: 33`.

> Si algún día repites este paso, los que ya existen se **saltan** (no se duplican).

## Parte 6 — Publicar en Vercel

1. Sube el proyecto a GitHub (si aún no está) con los cambios nuevos.
2. Entra a **https://vercel.com** → crea cuenta con GitHub (gratis).
3. **Add New → Project** → elige el repositorio `unlock_studio` → **Deploy**.
   (No hay que configurar nada: es un sitio estático.)
4. Al terminar te da una URL, por ejemplo `https://unlock-studio.vercel.app`.
   - Catálogo: esa URL.
   - Panel: esa URL + `/admin.html`.

---

## Uso diario (lo único que hace tu sobrina)

1. Entra a `…vercel.app/admin.html` e inicia sesión.
2. **Agregar modelo** → sube el `.glb`, sube la foto, escribe nombre + categoría
   (+ polígonos/materiales/peso si quiere) → **Guardar**.
3. El modelo aparece solo en el catálogo. También puede **Editar** o **Borrar**.

## ⚠️ Importante para la exposición en la U

El plan gratis de Supabase **pausa el proyecto tras ~7 días sin actividad**. Para
evitar sorpresas el día de la presentación: **entra a la web (o al panel) el día
antes** — con eso se reactiva.

## Preguntas frecuentes

- **¿Se rompe si no configuro Supabase todavía?** No. Mientras `config.js` tenga los
  valores de ejemplo, la web muestra el catálogo local de respaldo. Todo sigue funcionando.
- **¿Es seguro que la clave anon esté en el código?** Sí. Es su propósito. Los permisos
  (RLS) impiden que alguien sin sesión pueda modificar o borrar nada.
- **¿Cuánto aguanta el plan gratis?** 1 GB de archivos (los modelos pesan ~233 MB) y
  5 GB de descargas al mes. De sobra para un portafolio universitario.
