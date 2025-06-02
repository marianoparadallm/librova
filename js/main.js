// js/main.js
console.log("DEBUG: main.js - Script principal INICIADO.");

// Variables para Supabase (SUPABASE_URL y SUPABASE_ANON_KEY vienen de config.js)

function initializeSupabaseClient() {
    console.log("DEBUG: main.js - Intentando inicializar Supabase Client...");
    if (typeof window.supabaseJs !== 'undefined' && 
        typeof window.supabaseJs.createClient === 'function' && 
        typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && 
        SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'TU_SUPABASE_URL') {
        try {
            supabaseClientInstance = window.supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('DEBUG: main.js - Instancia del cliente Supabase creada exitosamente desde CDN SDK.');
            return true; // Indicar éxito
        } catch (e) {
            console.error('DEBUG: main.js - Error al inicializar Supabase con createClient (CDN SDK):', e);
            if (document.getElementById('contenedor-principal')) {
                 document.getElementById('contenedor-principal').innerHTML = "<p style='color:red; text-align:center;'>Error crítico: Conexión fallida con el servidor.</p>";
            }
            return false; // Indicar fallo
        }
    } else {
        let errorMsg = 'DEBUG: main.js - Supabase no pudo inicializarse (CDN SDK). ';
        if (typeof window.supabaseJs === 'undefined') errorMsg += 'SDK (window.supabaseJs) no está definido. ';
        else if (typeof window.supabaseJs.createClient !== 'function') errorMsg += 'SDK (window.supabaseJs) está definido pero createClient no es una función. ';
        if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL) errorMsg += 'SUPABASE_URL no definida. ';
        if (typeof SUPABASE_ANON_KEY === 'undefined' || !SUPABASE_ANON_KEY) errorMsg += 'SUPABASE_ANON_KEY no definida. ';
        console.error(errorMsg);
        return false; // Indicar fallo
    }
}

function appInit() {
    // ... (El resto de tu appInit sin cambios, pero se llamará DESPUÉS de que Supabase esté listo)
    console.log("DEBUG: main.js - appInit() iniciada.");
    contenedorPrincipal = document.getElementById('contenedor-principal');
    menuPrincipal = document.getElementById('menu-principal');
    if (!contenedorPrincipal || !menuPrincipal) { 
        console.error("DEBUG: main.js - ERROR FATAL en appInit: Faltan elementos DOM cruciales."); 
        if (document.body) document.body.innerHTML = "<h1 style='color:red;text-align:center;'>Error Crítico: Estructura HTML base no encontrada.</h1>";
        return; 
    }
    if (!supabaseClientInstance) {
        console.error("DEBUG: main.js - Instancia Supabase no inicializada en appInit (esto no debería ocurrir si se llama desde waitForSupabase).");
        contenedorPrincipal.innerHTML = "<p style='color:red; text-align:center;'>Error crítico: Conexión fallida.</p>";
        return;
    }
    renderizarVistaBienvenida(); 
    const storedUser = localStorage.getItem('libroVaUser');
    if (storedUser) { try { currentUser = JSON.parse(storedUser); console.log('DEBUG: main.js - Alumno recuperado de localStorage:', currentUser); } catch (e) { console.error("DEBUG: main.js - Error parseando localStorage:", e); localStorage.removeItem('libroVaUser'); currentUser = null; }}
    supabaseClientInstance.auth.onAuthStateChange(async (event, session) => {
        console.log('DEBUG: main.js - Supabase Auth state change:', event, session);
        let authStateChangedUser = false; const vistaActivaPrevia = document.querySelector('.vista.activa'); const idVistaActivaPrevia = vistaActivaPrevia ? vistaActivaPrevia.id : null;
        if (event === 'INITIAL_SESSION' && session && session.user) { currentUser = { id: session.user.id, email: session.user.email, rol: 'admin', reputacion: 'N/A' }; authStateChangedUser = true; console.log('DEBUG: main.js - Admin session recuperada (INITIAL_SESSION):', currentUser);
        } else if (event === 'SIGNED_IN' && session && session.user) { if (!currentUser || currentUser.id !== session.user.id || currentUser.rol !== 'admin' ) { currentUser = { id: session.user.id, email: session.user.email, rol: 'admin', reputacion: 'N/A' }; authStateChangedUser = true; } console.log('DEBUG: main.js - Admin signed in:', currentUser);
        } else if (event === 'SIGNED_OUT') { if (currentUser && currentUser.rol === 'admin') { console.log('DEBUG: main.js - Admin signed out.'); currentUser = null; authStateChangedUser = true; }}
        if (authStateChangedUser) { if (currentUser) { renderizarDashboard(); } else { cambiarVista(idVistaActivaPrevia || 'vista-dashboard', 'vista-bienvenida'); }} 
        else if (currentUser) { renderizarDashboard(); } 
        else { cambiarVista(idVistaActivaPrevia, 'vista-bienvenida'); }
        actualizarMenuPrincipal();});
    if (currentUser) { console.log("DEBUG: main.js - appInit: Hay currentUser (localStorage), renderizando dashboard."); renderizarDashboard();
    } else { console.log("DEBUG: main.js - appInit: No hay currentUser (localStorage), onAuthStateChange determinará o se quedará en bienvenida."); const vistaActivaActual = document.querySelector('.vista.activa'); if (!vistaActivaActual || vistaActivaActual.id !== 'vista-bienvenida') {cambiarVista(vistaActivaActual ? vistaActivaActual.id : null, 'vista-bienvenida'); }}
    actualizarMenuPrincipal();
}

function waitForSupabaseAndInit() {
    console.log("DEBUG: main.js - Iniciando espera para Supabase SDK...");
    const maxRetries = 50; // Intentar por 5 segundos (50 * 100ms)
    let retries = 0;

    const intervalId = setInterval(() => {
        console.log(`DEBUG: main.js - Intento ${retries + 1} para encontrar window.supabaseJs. typeof:`, typeof window.supabaseJs);
        if (typeof window.supabaseJs !== 'undefined' && typeof window.supabaseJs.createClient === 'function') {
            clearInterval(intervalId);
            console.log("DEBUG: main.js - window.supabaseJs encontrado!");
            if (initializeSupabaseClient()) { // Intenta inicializar y si tiene éxito, llama a appInit
                appInit();
            } else {
                // El error ya se mostró dentro de initializeSupabaseClient
                const parrafoCarga = document.getElementById('parrafo-carga-inicial');
                if (parrafoCarga) parrafoCarga.remove();
                if (document.getElementById('contenedor-principal')) {
                    document.getElementById('contenedor-principal').innerHTML = "<p style='color:red; text-align:center;'>Error crítico: No se pudo inicializar Supabase después de encontrar el SDK.</p>";
                }
            }
        } else {
            retries++;
            if (retries >= maxRetries) {
                clearInterval(intervalId);
                console.error("DEBUG: main.js - Supabase SDK (window.supabaseJs) no disponible después de múltiples intentos.");
                const parrafoCarga = document.getElementById('parrafo-carga-inicial');
                if (parrafoCarga) parrafoCarga.remove();
                 if (document.getElementById('contenedor-principal')) {
                    document.getElementById('contenedor-principal').innerHTML = "<p style='color:red; text-align:center;'>Error crítico: No se pudo cargar el SDK de Supabase desde el CDN. Revisa tu conexión o posibles bloqueadores.</p>";
                }
            }
        }
    }, 100); // Verificar cada 100ms
}

// Listener DOMContentLoaded
if (document.readyState === 'loading') {
    console.log("DEBUG: main.js - DOM está 'loading'. Agregando listener para DOMContentLoaded.");
    document.addEventListener('DOMContentLoaded', waitForSupabaseAndInit);
} else {
    console.log("DEBUG: main.js - DOM ya cargado ('interactive' o 'complete'), ejecutando waitForSupabaseAndInit() directamente.");
    waitForSupabaseAndInit();
}
console.log("DEBUG: main.js - Script finalizado (configuración de espera para Supabase).");