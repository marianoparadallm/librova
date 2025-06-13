
console.log("app_test.js: Script iniciado.");

const statusDiv = document.getElementById('status');

function updateStatus(message, type = "info") {
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = type;
        console.log(`app_test.js (Status): ${message}`);
    } else {
        console.error("app_test.js: Elemento 'status' del DOM no encontrado al intentar actualizar.");
    }
}

updateStatus("Verificando SDK de Supabase...", "info");


const X_SUPABASE_URL =
    (typeof window !== 'undefined' && window.X_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env.X_SUPABASE_URL) ||
    '';
const X_SUPABASE_ANON_KEY =
    (typeof window !== 'undefined' && window.X_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env.X_SUPABASE_ANON_KEY) ||
    '';

let supabaseClientInstance = null; // Renombrada para evitar confusión con el global del SDK

function checkAndInitializeSupabase() {
    console.log("app_test.js: Ejecutando checkAndInitializeSupabase.");

    // El SDK descargado (supabase.js) expone el objeto como 'supabase' en el scope global (window.supabase)
    // Anteriormente usábamos 'supabaseJs' cuando venía del CDN con un nombre global diferente.
    const sdkGlobalObject = window.supabase; // o simplemente 'supabase'

    console.log("app_test.js: Contenido de window.supabase ANTES de createClient:", sdkGlobalObject);

    if (typeof sdkGlobalObject !== 'undefined' && typeof sdkGlobalObject.createClient === 'function') {
        console.log("app_test.js: SDK de Supabase (window.supabase) y createClient ENCONTRADOS.");
        updateStatus("SDK encontrado. Inicializando Supabase...", "info");
        try {
            // Usamos el objeto global del SDK para crear el cliente
            supabaseClientInstance = sdkGlobalObject.createClient(X_SUPABASE_URL, X_SUPABASE_ANON_KEY);
            
            console.log('app_test.js: Instancia del cliente Supabase creada:', supabaseClientInstance);

            if (supabaseClientInstance) {
                updateStatus("¡Supabase inicializado exitosamente!", "success");

                // Ahora usamos supabaseClientInstance para las operaciones
                supabaseClientInstance.auth.onAuthStateChange((event, session) => {
                    console.log('app_test.js: Supabase Auth state change:', event, session);
                    if (document.getElementById('status')) { // Re-chequear si statusDiv sigue siendo válido
                        updateStatus(statusDiv.textContent + "\nEvento de Auth recibido: " + event, statusDiv.className);
                    }
                });
            } else {
                updateStatus("Error: sdkGlobalObject.createClient() no devolvió un cliente.", "error");
            }
        } catch (e) {
            console.error('app_test.js: Error al inicializar Supabase con createClient:', e);
            updateStatus("Error crítico al conectar con Supabase: " + e.message, "error");
        }
    } else {
        if (typeof sdkGlobalObject === 'undefined') {
            console.error('app_test.js: Error: El SDK de Supabase (window.supabase) sigue siendo undefined.');
            updateStatus("Error: SDK window.supabase es undefined. Asegúrate que supabase.js se carga antes y correctamente.", "error");
        } else {
            console.error('app_test.js: Error: window.supabase está definido, pero window.supabase.createClient NO es una función. Objeto window.supabase:', sdkGlobalObject);
            updateStatus("Error: SDK window.supabase parece cargado pero incompleto (createClient no es función).", "error");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("app_test.js: Evento 'DOMContentLoaded' disparado.");
    updateStatus("DOM Cargado. Verificando SDK de Supabase...", "info");
    checkAndInitializeSupabase();
});

window.addEventListener('load', () => {
    console.log("app_test.js: Evento 'load' de la ventana disparado.");
    if (!supabaseClientInstance) { // Si aún no se inicializó
        console.log("app_test.js: Instancia de Supabase no inicializada en 'load', reintentando.");
        updateStatus("Ventana completamente cargada. Reintentando verificación de SDK...", "info");
        checkAndInitializeSupabase();
    } else {
        console.log("app_test.js: Instancia de Supabase ya estaba inicializada antes del evento 'load'.");
    }
});

// La llave extra al final de tu app_test.js también estaba aquí, la he eliminado.
console.log("app_test.js: Script finalizado (asignación de listeners).");