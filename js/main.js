// js/main.js
console.log("DEBUG: main.js - Script principal INICIADO.");

// Inicialización de Supabase (para SDK LOCAL ./supabase.js)
console.log("DEBUG: main.js - Verificando SDK global 'supabase'. typeof window.supabase:", typeof window.supabase);
if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function' && 
    typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && 
    SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'TU_SUPABASE_URL') {
    try {
        supabaseClientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('DEBUG: main.js - Instancia del cliente Supabase creada exitosamente desde SDK LOCAL.');
    } catch (e) {
        console.error('DEBUG: main.js - Error al inicializar Supabase con createClient (SDK local):', e);
        if (document.getElementById('contenedor-principal')) {
             document.getElementById('contenedor-principal').innerHTML = "<p style='color:red; text-align:center;'>Error crítico: Conexión fallida con el servidor.</p>";
        }
        throw new Error("Fallo inicialización Supabase"); 
    }
} else {
    let errorMsg = 'DEBUG: main.js - Error: Supabase no pudo inicializarse (SDK local). ';
    if (typeof window.supabase === 'undefined') errorMsg += 'SDK (window.supabase) no cargado o no encontrado. ';
    else if (typeof window.supabase.createClient !== 'function') errorMsg += 'SDK (window.supabase) cargado pero createClient no es una función. ';
    if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL) errorMsg += 'SUPABASE_URL no definida. ';
    if (typeof SUPABASE_ANON_KEY === 'undefined' || !SUPABASE_ANON_KEY) errorMsg += 'SUPABASE_ANON_KEY no definida. ';
    console.error(errorMsg);
    if (document.getElementById('contenedor-principal')) {
        document.getElementById('contenedor-principal').innerHTML = `<p style='color:red; text-align:center;'>${errorMsg}</p>`;
    }
    throw new Error(errorMsg);
}

// Definición de asignarEventListenersGlobales
function asignarEventListenersGlobales() {
    console.log("DEBUG: main.js - Asignando event listeners globales...");
    try {
        const btnIngresarCrear = document.getElementById('btn-ingresar-crear-usuario');
        if (btnIngresarCrear) {
            btnIngresarCrear.onclick = () => {
                console.log("DEBUG: main.js - Botón 'btn-ingresar-crear-usuario' CLICKEADO.");
                cambiarVista('vista-bienvenida', 'vista-login-alumno');
            };
        } else { console.error("DEBUG: main.js - Botón 'btn-ingresar-crear-usuario' NO ENCONTRADO."); }
        const btnAccesoAdmin = document.getElementById('btn-acceso-admin');
        if(btnAccesoAdmin) btnAccesoAdmin.onclick = () => cambiarVista('vista-bienvenida', 'vista-login-admin');
        const btnVolverAdmin = document.getElementById('btn-volver-bienvenida-admin');
        if(btnVolverAdmin) btnVolverAdmin.onclick = () => cambiarVista('vista-login-admin', 'vista-bienvenida');
        const btnVolverBienvenidaAlumno = document.getElementById('btn-volver-bienvenida-alumno');
        if (btnVolverBienvenidaAlumno) {
             btnVolverBienvenidaAlumno.onclick = () => { 
                const selectorAvatares = document.getElementById('selector-avatares-login');
                const formPin = document.getElementById('form-login-alumno-pin');
                const seleccionLoginRegistro = document.getElementById('seleccion-login-registro-alumno'); // Este div contiene los botones iniciales de login alumno
                if (selectorAvatares) selectorAvatares.style.display = 'none'; 
                if (formPin) formPin.style.display = 'none';
                if (seleccionLoginRegistro) seleccionLoginRegistro.style.display = 'block'; // O 'flex' según tu CSS
                cambiarVista('vista-login-alumno', 'vista-bienvenida'); 
            };
        }
        const btnMostrarLoginAvatar = document.getElementById('btn-mostrar-form-login-avatar');
        if(btnMostrarLoginAvatar) {
            btnMostrarLoginAvatar.onclick = () => {
                console.log("DEBUG: main.js - Botón 'btn-mostrar-form-login-avatar' CLICKEADO.");
                if(document.getElementById('seleccion-login-registro-alumno')) document.getElementById('seleccion-login-registro-alumno').style.display = 'none';
                if(document.getElementById('contenedor-login-avatar')) document.getElementById('contenedor-login-avatar').style.display = 'block';
                if(document.getElementById('selector-avatares-login')) document.getElementById('selector-avatares-login').style.display = 'flex';
                if(document.getElementById('form-login-alumno-pin')) document.getElementById('form-login-alumno-pin').style.display = 'none';
            };
        }
        const btnMostrarFormRegistro = document.getElementById('btn-mostrar-form-registro-alumno');
        if(btnMostrarFormRegistro) {
            btnMostrarFormRegistro.onclick = () => {
                console.log("DEBUG: main.js - Botón 'btn-mostrar-form-registro-alumno' CLICKEADO.");
                cambiarVista('vista-login-alumno', 'vista-registro-alumno');
            };
        }
        const btnVolverLoginDesdeRegistro = document.getElementById('btn-volver-login-alumno-desde-registro');
        if (btnVolverLoginDesdeRegistro) {
            btnVolverLoginDesdeRegistro.onclick = () => {
                const loginAlumnoView = document.getElementById('vista-login-alumno');
                if (loginAlumnoView) {
                    const seleccionDiv = loginAlumnoView.querySelector('#seleccion-login-registro-alumno');
                    const contenedorAvatar = loginAlumnoView.querySelector('#contenedor-login-avatar');
                    if (seleccionDiv) seleccionDiv.style.display = 'block'; 
                    if (contenedorAvatar) contenedorAvatar.style.display = 'none';
                }
                cambiarVista('vista-registro-alumno', 'vista-login-alumno');
            };
        }
        document.querySelectorAll('.avatar-seleccionable').forEach(avatarDiv => { /* ... (código igual que la última versión refactorizada) ... */ });
        document.getElementById('btn-cambiar-avatar').onclick = () => { /* ... (código igual) ... */ };
        const btnVolverDashboardAnadir = document.getElementById('btn-volver-dashboard-desde-anadir');
        if (btnVolverDashboardAnadir) { btnVolverDashboardAnadir.onclick = () => renderizarDashboard(); }
        const btnVolverDashboardGestion = document.getElementById('btn-volver-dashboard-desde-gestion');
        if (btnVolverDashboardGestion) { btnVolverDashboardGestion.onclick = () => renderizarDashboard(); }
        document.getElementById('form-login-admin').addEventListener('submit', async (e) => { /* ... (código igual) ... */ });
        document.getElementById('form-login-alumno-pin').addEventListener('submit', async (e) => { /* ... (código igual) ... */ });
        document.getElementById('form-registro-alumno').addEventListener('submit', async (e) => { /* ... (código igual) ... */ });
        const formAnadirLibro = document.getElementById('form-anadir-libro');
        if (formAnadirLibro) { formAnadirLibro.addEventListener('submit', handleAnadirLibroSubmit); }
        const inputFoto = document.getElementById('libro-foto');
        const previewFoto = document.getElementById('libro-foto-preview');
        if (inputFoto && previewFoto) { /* ... (código igual con los ; correctos) ... */ }
        //Pegando cuerpos de los listeners que faltaban por si acaso:
        document.querySelectorAll('.avatar-seleccionable').forEach(avatarDiv => { avatarDiv.onclick = () => { const nombreAvatar = avatarDiv.dataset.nombreAvatar; document.querySelectorAll('.avatar-seleccionable').forEach(ad => ad.classList.remove('seleccionado')); avatarDiv.classList.add('seleccionado'); document.getElementById('avatar-seleccionado-nombre').textContent = `Ingresando como: ${nombreAvatar}`; document.getElementById('form-login-alumno-pin').dataset.nombreAvatar = nombreAvatar; document.getElementById('selector-avatares-login').style.display = 'none'; document.getElementById('form-login-alumno-pin').style.display = 'block'; document.getElementById('alumno-pin-login').value = ''; document.getElementById('alumno-pin-login').focus(); const btnSAR = document.getElementById('btn-mostrar-form-registro-alumno'); if(btnSAR) btnSAR.style.display = 'none'; const btnVBA = document.getElementById('btn-volver-bienvenida-alumno'); if(btnVBA) btnVBA.style.display='none';}; });
        document.getElementById('btn-cambiar-avatar').onclick = () => { document.getElementById('selector-avatares-login').style.display = 'flex'; document.getElementById('form-login-alumno-pin').style.display = 'none'; document.getElementById('form-login-alumno-pin').dataset.nombreAvatar = ''; document.getElementById('alumno-pin-login').value = ''; const btnSAR = document.getElementById('btn-mostrar-form-registro-alumno'); if(btnSAR) btnSAR.style.display = 'inline-block'; const btnVBA = document.getElementById('btn-volver-bienvenida-alumno'); if(btnVBA) btnVBA.style.display='inline-block'; document.querySelectorAll('.avatar-seleccionable').forEach(ad => ad.classList.remove('seleccionado')); };
        document.getElementById('form-login-admin').addEventListener('submit', async (e) => { e.preventDefault(); const email = document.getElementById('admin-email').value; const pass = document.getElementById('admin-password').value; const admin = await loginAdmin(email, pass); if (admin) { renderizarDashboard(); actualizarMenuPrincipal(); }});
        document.getElementById('form-login-alumno-pin').addEventListener('submit', async (e) => { e.preventDefault(); const nombreAvatar = e.target.dataset.nombreAvatar; const pin = document.getElementById('alumno-pin-login').value; if (!nombreAvatar) { alert('Por favor, selecciona un avatar primero.'); document.getElementById('btn-cambiar-avatar').click(); return; } const alumno = await loginAlumno(nombreAvatar, pin); if (alumno) { renderizarDashboard(); actualizarMenuPrincipal(); e.target.dataset.nombreAvatar = ''; document.getElementById('alumno-pin-login').value = ''; document.getElementById('selector-avatares-login').style.display = 'flex'; document.getElementById('form-login-alumno-pin').style.display = 'none'; const btnSAR = document.getElementById('btn-mostrar-form-registro-alumno'); if(btnSAR) btnSAR.style.display = 'inline-block'; const btnVBA = document.getElementById('btn-volver-bienvenida-alumno'); if(btnVBA) btnVBA.style.display='inline-block';}});
        document.getElementById('form-registro-alumno').addEventListener('submit', async (e) => { e.preventDefault(); const nickname = document.getElementById('alumno-nickname-registro').value; const idAvatar = document.getElementById('alumno-avatar-registro').value; const pin = document.getElementById('alumno-pin-registro').value; const pinConfirm = document.getElementById('alumno-pin-confirmar').value; if (pin !== pinConfirm) { alert('Los PINs no coinciden.'); return; } let pinEsValido = false; if (pin.length === 4) { if (/^[0-9]+$/.test(pin)) { pinEsValido = true; } } if (!pinEsValido) { alert('El PIN debe ser de exactamente 4 números.'); return; } const alumno = await registrarAlumno(nickname, idAvatar, pin); if (alumno) { renderizarDashboard(); actualizarMenuPrincipal(); }});
        if (inputFoto && previewFoto) { inputFoto.addEventListener('change', function(event) { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = function(eRead) { previewFoto.src = eRead.target.result; previewFoto.style.display = 'block'; }; reader.readAsDataURL(file); } else { previewFoto.src = '#'; previewFoto.style.display = 'none'; }}); }

        console.log("DEBUG: main.js - Event listeners globales asignados.");
    } catch (err) { 
        console.error("DEBUG: main.js - Error al asignar event listeners globales:", err); 
    }
}

function appInit() {
    console.log("DEBUG: main.js - appInit() iniciada.");
    
    contenedorPrincipal = document.getElementById('contenedor-principal');
    menuPrincipal = document.getElementById('menu-principal');

    if (!contenedorPrincipal || !menuPrincipal) { 
        console.error("DEBUG: main.js - ERROR FATAL en appInit: Faltan 'contenedor-principal' o 'menu-principal' en el DOM."); 
        if (document.body) document.body.innerHTML = "<h1 style='color:red;text-align:center;'>Error Crítico: Estructura HTML base no encontrada.</h1>";
        return; 
    }
    console.log("DEBUG: main.js - appInit: Elementos DOM cruciales encontrados y asignados.");

    if (!supabaseClientInstance) { 
        console.error("DEBUG: main.js - Instancia Supabase no inicializada en appInit().");
        contenedorPrincipal.innerHTML = "<p style='color:red; text-align:center;'>Error crítico: Conexión fallida con Supabase.</p>";
        return;
    }
    
    renderizarVistaBienvenida(); // Llama a la función de ui_render_views.js
    asignarEventListenersGlobales(); // Llama a la función definida en ESTE archivo (main.js)

    const storedUser = localStorage.getItem('libroVaUser'); 
    if (storedUser) { 
        try { currentUser = JSON.parse(storedUser); console.log('DEBUG: main.js - Alumno recuperado de localStorage:', currentUser); } 
        catch (e) { console.error("DEBUG: main.js - Error parseando localStorage:", e); localStorage.removeItem('libroVaUser'); currentUser = null; }
    }
    
    supabaseClientInstance.auth.onAuthStateChange(async (event, session) => {
        console.log('DEBUG: main.js - Supabase Auth state change:', event, session);
        let authStateChangedUser = false; 
        const vistaActivaPrevia = document.querySelector('.vista.activa'); 
        const idVistaActivaPrevia = vistaActivaPrevia ? vistaActivaPrevia.id : null;
        
        if (event === 'INITIAL_SESSION' && session && session.user) { 
            currentUser = { id: session.user.id, email: session.user.email, rol: 'admin', reputacion: 'N/A' }; 
            authStateChangedUser = true; 
            console.log('DEBUG: main.js - Admin session recuperada (INITIAL_SESSION):', currentUser);
        } else if (event === 'SIGNED_IN' && session && session.user) { 
            if (!currentUser || currentUser.id !== session.user.id || currentUser.rol !== 'admin' ) { 
                currentUser = { id: session.user.id, email: session.user.email, rol: 'admin', reputacion: 'N/A' }; 
                authStateChangedUser = true; 
            } 
            console.log('DEBUG: main.js - Admin signed in:', currentUser);
        } else if (event === 'SIGNED_OUT') { 
            if (currentUser && currentUser.rol === 'admin') { 
                console.log('DEBUG: main.js - Admin signed out.'); 
                currentUser = null; 
                authStateChangedUser = true; 
            }
        }
        
        if (authStateChangedUser) { 
            if (currentUser) { renderizarDashboard(); } 
            else { cambiarVista(idVistaActivaPrevia || 'vista-dashboard', 'vista-bienvenida'); }
        } else if (currentUser) { 
            renderizarDashboard(); 
        } else { 
            cambiarVista(idVistaActivaPrevia, 'vista-bienvenida'); 
        }
        actualizarMenuPrincipal();
    });
    
    if (currentUser) { 
        console.log("DEBUG: main.js - appInit: Hay currentUser (localStorage), renderizando dashboard.");
        renderizarDashboard();
    } else {
         console.log("DEBUG: main.js - appInit: No hay currentUser (localStorage), onAuthStateChange o bienvenida inicial determinará.");
         const vistaActivaActual = document.querySelector('.vista.activa');
         if (!vistaActivaActual || vistaActivaActual.id !== 'vista-bienvenida') {
            cambiarVista(vistaActivaActual ? vistaActivaActual.id : null, 'vista-bienvenida'); 
         }
    }
    actualizarMenuPrincipal();
}

function onDOMLoadedAndSupabaseReady() {
    console.log("DEBUG: main.js - DOMContentLoaded y Supabase SDK listos (o se asume que están listos).");
    if (!supabaseClientInstance) {
        console.error("DEBUG: main.js - Supabase no se inicializó ANTES de llamar a appInit.");
        const parrafoCarga = document.getElementById('parrafo-carga-inicial');
        if (parrafoCarga) parrafoCarga.remove();
        if (document.getElementById('contenedor-principal')) {
             document.getElementById('contenedor-principal').innerHTML = "<p style='color:red; text-align:center;'>Error crítico: Fallo la conexión con el servidor (SDK no listo).</p>";
        }
        return; 
    }
    appInit();
}

if (document.readyState === 'loading') {
    console.log("DEBUG: main.js - DOM está 'loading'. Agregando listener para DOMContentLoaded.");
    document.addEventListener('DOMContentLoaded', onDOMLoadedAndSupabaseReady);
} else {
    console.log("DEBUG: main.js - DOM ya cargado ('interactive' o 'complete'), ejecutando onDOMLoadedAndSupabaseReady() directamente.");
    onDOMLoadedAndSupabaseReady();
}
console.log("DEBUG: main.js - Script finalizado.");