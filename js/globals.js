// js/globals.js
console.log("DEBUG: globals.js - Cargado.");

let supabaseClientInstance = null; 
let currentUser = null; 

let contenedorPrincipal = null;
let menuPrincipal = null;

let notificaciones = [];
let notificacionesNuevas = 0;
let notificacionesIntervalId = null;
let popupNotificacionesVisible = false;

// Variables de paginación para la búsqueda de libros
let librosFiltrados = [];
let paginaLibros = 0;
const TAMANO_PAGINA_LIBROS = 10;
