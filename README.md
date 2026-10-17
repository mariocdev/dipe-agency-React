# Dipe Agency

Base para una web corporativa con React + Bootstrap como interfaz pública. WordPress gestiona entradas y CPT; Home, Quiénes somos, Contacto, Trabaja con nosotros, navegación y pie se mantienen en código. Los metadatos SEO de todas las URL deberán poder editarse desde WordPress.

## Estructura

- `frontend/`: código React y configuración de Vite. Se compila localmente.
- `wp-content/plugins/dipe-core/`: modelo de contenido y ajustes que no deben depender del tema.
- `wp-content/themes/dipe-react/`: tema ligero que sirve las URL de WordPress y carga el build de React.
- `docs/`: decisiones de contenido y comprobaciones de la prueba vertical.

La propuesta de páginas, CPT, ACF y plugins está en [arquitectura editorial](docs/arquitectura-editorial.md).

## Requisitos locales

- PHP 8.2 o superior y WordPress actualizado para comprobar la integración. WordPress recomienda PHP 8.3+ si el hosting lo permite.
- Node.js 20.19+ o 22.12+ (recomendado Node 24) y pnpm 11 para crear el bundle.
- Una instalación WordPress independiente con enlaces permanentes activados.

## Desarrollo y compilación

```powershell
cd frontend
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

`pnpm dev` abre una vista independiente del front. Para ver datos publicados de
WordPress en desarrollo, copia `.env.example` a `.env.local` y configura
`WP_DEV_URL` con la URL de una instalación local o de pruebas; Vite enviará
`/wp-json/` a ese WordPress. No pongas credenciales en ese archivo.

`pnpm build` escribe los recursos versionados y su manifiesto directamente en
`wp-content/themes/dipe-react/assets/`. Esos recursos se suben por FTP junto con el tema.

## Instalación en WordPress

1. Copia `wp-content/plugins/dipe-core` a `wp-content/plugins/` y actívalo.
2. Copia `wp-content/themes/dipe-react` a `wp-content/themes/` y activa el tema.
3. En **Ajustes > Enlaces permanentes**, guarda una estructura distinta de “Simple”.
4. Ejecuta `pnpm build` antes de copiar el tema por FTP. Sin `assets/.vite/manifest.json`, el tema mostrará un aviso de build pendiente.
5. Sigue [la prueba vertical](docs/prueba-vertical.md) antes de añadir páginas definitivas.

### Entorno no indexable

Mientras este proyecto sea de desarrollo, `dipe-core` fuerza la visibilidad de
WordPress a "disuadir a los motores de búsqueda", añade las directivas
`noindex`/`nofollow` al HTML y a la cabecera `X-Robots-Tag`, y publica un
`robots.txt` con `Disallow: /`. Estas directivas evitan indexación normal, pero
no impiden que un robot visite una URL. Para que el entorno no sea accesible
desde Internet, protege el subdominio desde el panel de hosting con contraseña
HTTP o una lista de IP permitidas. Mantén ambas barreras hasta que se decida una
puesta en producción explícita.

No se versionan el núcleo de WordPress, `wp-config.php`, medios, la base de datos, credenciales ni los assets generados. Hay que ejecutar `pnpm build` antes de cada subida del tema. No se requiere Node.js en el hosting.

## Despliegue por FTP

Sube únicamente las dos carpetas personalizadas y los assets generados:

```text
wp-content/plugins/dipe-core/
wp-content/themes/dipe-react/
```

Antes de publicar: activa HTTPS, realiza una copia de seguridad, comprueba la URL canónica, regenera enlaces permanentes y prueba una publicación/despublicación. Con Varnish activo, configura un TTL corto o una purga al publicar para no servir contenido antiguo.

## Estado actual

WordPress está instalado con el tema y `dipe-core` activos en el entorno de pruebas. La prueba vertical está preparada en código; faltan los diseños y contenidos definitivos. Verificar en el WordPress real los puntos de [la prueba vertical](docs/prueba-vertical.md) antes de darla por cerrada.
