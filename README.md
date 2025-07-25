# LibroVa

El inicio del sitio actúa como lanzador de aplicaciones. Selecciona **LibroVa** para entrar en la aplicación principal.


LibroVa es una sencilla aplicación web pensada para que estudiantes compartan y piden prestados libros entre compañeros. Utiliza **Supabase** como plataforma backend para el manejo de usuarios y del catálogo de libros.

## Tabla de préstamos

La aplicación utiliza una tabla `prestamos` para registrar cada vez que un libro es prestado. Su estructura principal es:

```
id               - identificador autoincremental
libro_id         - referencia al libro prestado
propietario_id   - usuario dueño del libro
prestatario_id   - usuario que recibe el préstamo
fecha_prestamo   - fecha en que se aceptó la solicitud
fecha_limite_devolucion - fecha pactada para devolverlo
fecha_devolucion - fecha real de devolución
estado           - "activo" o "devuelto"
```

Antes esta información se guardaba parcialmente en la tabla `libros` mediante los campos `esta_con_usuario_id` y `fecha_limite_devolucion`. Ahora dichos campos se han eliminado de `libros` y sólo se usa la tabla `prestamos`.
El campo `propietario_avatar` también dejó de existir porque el avatar se lee directamente desde la tabla `usuarios`.

## Ejecución local

Puedes abrir `librova.html` directamente en tu navegador para una prueba rápida. Si prefieres servir los archivos mediante un pequeño servidor local (por ejemplo para evitar restricciones de algunos navegadores), desde esta carpeta puedes lanzar:

```bash
python3 -m http.server
```

Luego visita `http://localhost:8000/librova.html`.

## Lectura de libros digitales

Los archivos EPUB se muestran directamente en la página gracias a [epub.js](https://github.com/futurepress/epub.js). Si un libro digital es EPUB, al hacer clic en **Leer/Descargar** se abrirá un visor integrado para leer sin salir del sitio. Para otros formatos se abre una nueva pestaña.

## Video de fondo

La página de inicio (`index.html`) utiliza el video `fondo.mp4` como fondo animado. Las demás páginas muestran la imagen estática `fondo.jpg` con el logo centrado en la cabecera.

## Credenciales de Supabase


Los valores `X_SUPABASE_URL` y `X_SUPABASE_ANON_KEY` se cargan desde variables de entorno o desde un archivo `js/config.js` que **no** se encuentra en este repositorio. Para comenzar, copia [`js/config.sample.js`](js/config.sample.js) a `js/config.js` en tu copia local y completa tus credenciales. **Nunca subas `js/config.js` al control de versiones.** Como alternativa puedes definir las variables de entorno `X_SUPABASE_URL` y `X_SUPABASE_ANON_KEY` antes de servir la página.
## Migraciones de base de datos
Para habilitar el nuevo turno **Mediodía** ejecuta el script [`sql/add_mediodia_franja.sql`](sql/add_mediodia_franja.sql) en tu instancia de Supabase.
Puedes hacerlo desde la interfaz web de SQL o usando la CLI:

```bash
supabase db query < sql/add_mediodia_franja.sql
```

Este archivo actualiza la restricción sobre el campo `franja` para aceptar el nuevo valor.
Si al intentar asignar el turno "Mediodía" ves un error `23514`, significa que la migración aún no fue aplicada.


## Archivos de prueba

Para verificar que la conexión con Supabase está correctamente configurada puedes abrir [`test_index.html`](test_index.html). Este archivo carga `test_app_test.js` y muestra mensajes básicos de éxito o error.

## Librerías adicionales

La visualización de PDFs se realiza con [PDF.js](https://mozilla.github.io/pdf.js/), distribuida bajo la [licencia Apache 2.0](https://github.com/mozilla/pdf.js/blob/master/LICENSE).

## Detector de audios fake

El panel de administración incluye un enlace a `audio_detector.html`. Esta página permite entrenar un pequeño modelo con audios reales y analizar nuevos archivos para clasificarlos como **REAL** o **FAKE**. El procesamiento se realiza en el navegador utilizando [Meyda](https://meyda.js.org/) para extraer características de audio y [Chart.js](https://www.chartjs.org/) para mostrar gráficos comparativos.
Se utilizan descriptores como **rms**, **spectral centroid**, **spectral flux**, **zcr** y el promedio de **mfcc**. Los resultados se muestran en un gráfico radar donde se comparan los promedios del entrenamiento con los del audio analizado.


## License

This project is licensed under the [MIT License](LICENSE).

