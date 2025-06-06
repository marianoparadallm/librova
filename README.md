# LibroVa


LibroVa es una sencilla aplicación web pensada para que estudiantes compartan y pidan prestados libros entre compañeros. Utiliza **Supabase** como plataforma backend para el manejo de usuarios y del catálogo de libros.

## Ejecución local

Puedes abrir `index.html` directamente en tu navegador para una prueba rápida. Si prefieres servir los archivos mediante un pequeño servidor local (por ejemplo para evitar restricciones de algunos navegadores), desde esta carpeta puedes lanzar:

```bash
python3 -m http.server
```

Luego visita `http://localhost:8000/index.html`.

## Credenciales de Supabase

Los valores `SUPABASE_URL` y `SUPABASE_ANON_KEY` se encuentran definidos en el fichero [`js/config.js`](js/config.js). Estas mismas constantes también se utilizan en `app.js` y en `test_app_test.js` para inicializar el cliente de Supabase. Asegúrate de actualizar estos valores si cambias de proyecto en Supabase.

## Archivos de prueba

Para verificar que la conexión con Supabase está correctamente configurada puedes abrir [`test_index.html`](test_index.html). Este archivo carga `test_app_test.js` y muestra mensajes básicos de éxito o error.
