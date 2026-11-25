# Noua Construcción

Sitio web de **Noua Construcción**: terrazas, quinchos, piscinas, ampliaciones y remodelaciones. Hecho con **Next.js**, **TypeScript** y **Tailwind CSS**, desplegado en **Vercel**.

![Vista previa del sitio en móvil y escritorio](docs/preview.png)

- Sitio: [www.noua.cl](https://www.noua.cl)
- Instagram: [@noua.contacto](https://www.instagram.com/noua.contacto/)
- Teléfono / WhatsApp: +56 9 7399 4163
- Correo: noua.contacto@gmail.com

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, Cache Components)
- [React 19](https://react.dev/) y [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Vercel](https://vercel.com/) para hosting, con [Vercel Analytics](https://vercel.com/docs/analytics) para medir visitas
- Modo claro y oscuro (sigue al sistema, con botón sol/luna en el header), sin dependencias extra

Requiere **Node.js 24 LTS** (obligatorio). Con `nvm use` se activa la versión de `.nvmrc`. Con otra versión, `npm install` falla (`engine-strict` en `.npmrc`) y `dev`/`build`/`start` se detienen con un aviso.

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción
npm run start      # sirve el build
npm run lint
```

## Tests

```bash
npm test                          # unitarios (Vitest), una pasada
npm run test:watch                # unitarios en modo watch
npx playwright install chromium   # solo la primera vez
npm run test:e2e                  # E2E (Playwright) contra el build de producción
```

- Los tests unitarios viven **junto a cada archivo** (`Rating.tsx` + `Rating.test.tsx`).
- Los E2E viven en `e2e/` y recorren el sitio en móvil y escritorio.
- `src/sites/sites.test.ts` valida el contenido del sitio: slugs, fechas, reseñas, textos `alt`, que existan las fotos y los logos, y el contraste de los colores del tema en modo claro y oscuro.
- Los tests no tienen textos del negocio escritos: leen el contenido activo, así no se rompen al cambiar textos.

### Integración continua

`.github/workflows/ci.yml` corre en GitHub Actions en cada push a `main` y en cada pull request: lint y tests unitarios, build + E2E, y al final el job **CI completo**, que solo pasa si todo lo anterior pasó. Si falla un E2E, el reporte de Playwright queda como artefacto del run.

Vercel no ejecuta los tests: solo hace el build y publica. Para que no llegue nada roto a `main` (y por tanto a producción), la rama se protege con el ruleset versionado en [`.github/rulesets/main.json`](.github/rulesets/main.json): **Settings → Rules → Rulesets → New ruleset → Import a ruleset**. Exige PR, bloquea force push y borrado, pide la rama al día y los checks **`Lint y tests unitarios`** y **`CI completo`** (que cubre el build + E2E).

## Estructura

```text
noua-construccion-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raíz: <html>, fuente, tema y metadatos SEO
│   │   ├── globals.css             # Tokens del tema (claro y oscuro) para Tailwind
│   │   ├── not-found.tsx           # Página 404
│   │   ├── robots.ts               # robots.txt
│   │   ├── sitemap.ts              # sitemap.xml
│   │   └── (site)/                 # Sitio público (grupo de rutas)
│   │       ├── layout.tsx          # Header, footer y botón de WhatsApp
│   │       ├── page.tsx            # Home: hero + secciones activas
│   │       └── trabajos/
│   │           ├── page.tsx        # Listado de trabajos realizados
│   │           └── [slug]/page.tsx # Detalle de un trabajo con sus reseñas
│   ├── components/
│   │   ├── layout/                 # Header, Footer, MobileMenu, Container
│   │   ├── sections/               # Hero, About, Services, Projects, Reviews, Contact
│   │   └── ui/                     # ButtonLink, Media, ThemeToggle, ImageCarousel, ImageGallery, iconos…
│   ├── lib/
│   │   ├── data.ts                 # Capa de acceso a datos (getServices, getProjects…)
│   │   ├── site.ts                 # Configuración del negocio activo
│   │   ├── contact.ts              # Enlaces wa.me, tel: y mailto:
│   │   ├── navigation.ts           # Menú derivado de las secciones activas
│   │   └── theme.ts                # Colores → variables CSS y script del modo oscuro
│   ├── sites/
│   │   ├── index.ts                # Registro del negocio activo
│   │   └── construction/
│   │       ├── config.ts           # Identidad, contacto, colores, SEO y etiquetas
│   │       └── content.ts          # Textos, servicios, trabajos y reseñas de Noua
│   └── types/
│       ├── site.ts                 # Contrato de configuración (SiteConfig)
│       └── content.ts              # Contrato de contenido (Project, Review, Service…)
└── public/
    ├── images/
    │   ├── projects/               # Fotos de trabajos: <año>/<slug>/<foto>.webp
    │   └── about/                  # Imagen de "Sobre nosotros"
    └── logos/                      # Logo (modo claro y oscuro) e imagen para redes
```

### Reglas de la arquitectura

- **Los componentes no conocen al negocio.** Reciben todo por props. Solo `src/app/` importa la configuración (`@/lib/site`) y los datos (`@/lib/data`).
- **El contenido se lee solo a través de `src/lib/data.ts`.** Hoy esas funciones devuelven lo que está en `src/sites/<negocio>/content.ts`. Cuando un proyecto necesite base de datos o CMS, se reescriben esas funciones (misma firma) y el resto del código no cambia.
- **Los colores se definen una sola vez** en `config.ts` y llegan a Tailwind como clases: `bg-primary`, `text-muted`, `border-border`, `bg-surface`, `text-accent`, etc. La paleta oscura (`themeDark`) usa los mismos nombres, así que esas clases cambian solas con el modo; para ajustes puntuales se usa la variante `dark:` con tokens (`dark:bg-surface`), nunca colores fijos.
- **Vocabulario genérico en el código, etiquetas en la config.** En el código se habla de `projects`, `services` y `reviews`; lo que ve el usuario sale de `labels` ("Obras realizadas", "Nuestros cortes"…).

## Editar el contenido

### 1. Configuración: `src/sites/construction/config.ts`

Nombre, descripción, dominio (`url`), idioma, contacto (teléfono, correo, WhatsApp con mensaje precargado, dirección, mapa, horarios), redes sociales, logo, colores, SEO, **secciones activas** y **etiquetas** de cada sección. El tipo `SiteConfig` marca qué es obligatorio.

**Colores y modo oscuro:** `theme` es la paleta clara y `themeDark` la oscura. Si `themeDark` existe, el sitio sigue la preferencia del sistema y muestra el botón sol/luna; la elección se guarda en el navegador y, si coincide con la del sistema, se olvida para volver a seguirlo. Cada par texto/fondo debe tener contraste de al menos 4,5:1 en ambas paletas (lo verifica `sites.test.ts`).

### 2. Contenido: `src/sites/construction/content.ts`

Hero, quiénes somos, servicios, trabajos realizados (con galería) y reseñas. Una reseña se asocia a un trabajo con `projectSlug` y aparece en su página de detalle.

### 3. Imágenes

Las fotos de obras van en una carpeta por año y por obra, con el mismo `slug` del trabajo en `content.ts`:

```text
public/images/projects/
  2026/
    remodelacion-bano-nunoa/
      antes.webp
      despues.webp
    terraza-vitacura/
      terminada.webp
```

```ts
cover: { src: "/images/projects/2026/terraza-vitacura/terminada.webp", alt: "Terraza con porcelanato tipo madera" },
```

- **Año:** el de la obra; si el trabajo tiene `date`, debe coincidir.
- **Nombre de la foto:** minúsculas, sin tildes ni espacios, y que diga qué muestra (`antes`, `despues`, `radier-abierto`).
- **Formato:** `.webp` (o `.jpg`), de unos 1600 px por lado como máximo. Con [`cwebp`](https://developers.google.com/speed/webp/docs/cwebp) (`brew install webp`): `cwebp -q 80 -resize 1600 0 -metadata none foto.jpg -o foto.webp`.
- **Al reemplazar una foto,** usa un nombre nuevo: los navegadores y la CDN guardan la anterior en caché por su URL.

`src/sites/sites.test.ts` verifica que cada foto exista y que respete esta estructura.

Mientras no haya foto, se muestra un marcador con los colores del tema. En modo oscuro las fotos se atenúan levemente para que no brillen sobre el fondo.

**Logo:** va en `public/logos/`, con fondo transparente, y se configura en `branding.logo`. Si en modo oscuro no se ve bien, agrega una versión en `branding.logoDark` (Noua usa la franja en un azul más claro). Reemplaza también `src/app/favicon.ico`.

## Seguridad

- **Cabeceras HTTP** en `next.config.ts`: Content Security Policy, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`; sin `X-Powered-By`. `e2e/security.spec.ts` verifica que estén y que la CSP no bloquee nada del sitio.
- **CSP estática (sin nonces)** para conservar el prerender. Si agregas un recurso externo (mapa embebido, imágenes remotas, otro script), amplía la directiva correspondiente de `contentSecurityPolicy`, o el navegador lo bloqueará.
- **Dependencias:** `.github/dependabot.yml` abre PR trimestrales con actualizaciones y PR inmediatos ante alertas. Activa en GitHub **Settings → Advanced Security → Dependabot alerts** y **Dependabot security updates**. Para revisar a mano: `npm audit`.

## Contribuir

- Flujo: rama (`feat/…`, `fix/…`, `chore/…`) → PR → CI en verde → merge a `main` con **Create a merge commit**.
- Mensajes con [Conventional Commits](https://www.conventionalcommits.org/es/): `<type>(<scope>): <qué se hizo>`, con el tipo en inglés y la descripción en español (ej. `fix(obras): evita repetir el nombre de la obra`).

## Licencia

© 2026 Noua Construcción. Todos los derechos reservados.

> Este repositorio y su contenido (textos, fotografías, logotipos y marca) son propiedad de Noua Construcción. No se permite copiar, modificar, distribuir ni reutilizar total o parcialmente sin autorización escrita.

