// js/globals.js
console.log("DEBUG: globals.js - Cargado.");

let supabaseClientInstance = null; 
let currentUser = null; 

// SOLO DECLARARLAS AQUÍ con let para que estén en el scope del script/módulo
// Si no usas "type=module" en tus scripts, estas serán globales si no hay otro script que las declare con var/let/const
// Para forzar que sean globales accesibles por todos los scripts como window.propiedad:
// window.contenedorPrincipal = null;
// window.menuPrincipal = null;
// Por ahora, dejémoslas como let y las asignaremos y usaremos consistentemente.
let contenedorPrincipal = null;
let menuPrincipal = null;