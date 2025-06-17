# LibroVa


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

Puedes abrir `index.html` directamente en tu navegador para una prueba rápida. Si prefieres servir los archivos mediante un pequeño servidor local (por ejemplo para evitar restricciones de algunos navegadores), desde esta carpeta puedes lanzar:

```bash
python3 -m http.server
```

Luego visita `http://localhost:8000/index.html`.

## Lectura de libros digitales

Los archivos EPUB se muestran directamente en la página gracias a [epub.js](https://github.com/futurepress/epub.js). Si un libro digital es EPUB, al hacer clic en **Leer/Descargar** se abrirá un visor integrado para leer sin salir del sitio. Para otros formatos se abre una nueva pestaña.

## Video de fondo

La página principal muestra el video `fondo.mp4` como fondo animado. Puedes
reemplazar el archivo por otro video o eliminar el elemento
`<video id="background-video">` en `index.html` si prefieres solo la imagen de
fondo estática `fondo.jpg`.

## Credenciales de Supabase


Los valores `X_SUPABASE_URL` y `X_SUPABASE_ANON_KEY` se cargan desde variables de entorno o desde un archivo `js/config.js` que **no** se encuentra en este repositorio. Para comenzar, copia [`js/config.sample.js`](js/config.sample.js) a `js/config.js` en tu copia local y completa tus credenciales. **Nunca subas `js/config.js` al control de versiones.** Como alternativa puedes definir las variables de entorno `X_SUPABASE_URL` y `X_SUPABASE_ANON_KEY` antes de servir la página.


## Archivos de prueba

Para verificar que la conexión con Supabase está correctamente configurada puedes abrir [`test_index.html`](test_index.html). Este archivo carga `test_app_test.js` y muestra mensajes básicos de éxito o error.

## Librerías adicionales

La visualización de PDFs se realiza con [PDF.js](https://mozilla.github.io/pdf.js/), distribuida bajo la [licencia Apache 2.0](https://github.com/mozilla/pdf.js/blob/master/LICENSE).

## License

This project is licensed under the [MIT License](LICENSE).

