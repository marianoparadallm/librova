// js/main.js
console.log("DEBUG: main.js - Script principal INICIADO.");

// Inicialización de Supabase (como la tenías, usando window.supabase para SDK local o window.supabaseJs para CDN)
// Este es el bloque para SDK LOCAL (./supabase.js)
console.log("DEBUG: main.js - Verificando SDK global 'supabase' (para SDK local). typeof window.supabase:", typeof window.supabase);
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
    // ... (resto del bloque de error de inicialización como estaba) ...
    if (typeof window.supabase === 'undefined') errorMsg += 'SDK (window.supabase) no cargado o no encontrado. Asegúrate que supabase.js está en la raíz y se carga ANTES que los scripts de js/ en index.html. ';
    else if (typeof window.supabase.createClient !== 'function') errorMsg += 'SDK (window.supabase) está cargado pero createClient no es una función. ';
    if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL) errorMsg += 'SUPABASE_URL no definida (revisa config.js). ';
    if (typeof SUPABASE_ANON_KEY === 'undefined' || !SUPABASE_ANON_KEY) errorMsg += 'SUPABASE_ANON_KEY no definida (revisa config.js). ';
    console.error(errorMsg);
    if (document.getElementById('contenedor-principal')) {
        document.getElementById('contenedor-principal').innerHTML = `<p style='color:red; text-align:center;'>${errorMsg}</p>`;
    }
    throw new Error(errorMsg);
}


// Definición de asignarEventListenersGlobales AHORA ESTÁ EN main.js
function asignarEventListenersGlobales() {
    console.log("DEBUG: main.js - Asignando event listeners globales...");
    try {
        // ESTE CÓDIGO ES EL MISMO que tenías en tu app.js original para esta función
        document.getElementById('btn-ingresar-crear-usuario').onclick = () => cambiarVista('vista-bienvenida', 'vista-login-alumno');
        document.getElementById('btn-acceso-admin').onclick = () => cambiarVista('vista-bienvenida', 'vista-login-admin');
        document.getElementById('btn-volver-bienvenida-admin').onclick = () => cambiarVista('vista-login-admin', 'vista-bienvenida');
        document.getElementById('btn-volver-bienvenida-alumno').onclick = () => { 
            // Al volver a bienvenida desde login alumno, resetear la vista de login alumno
            const selectorAvatares = document.getElementById('selector-avatares-login');
            const formPin = document.getElementById('form-login-alumno-pin');
            const btnIrARegistro = document.getElementById('btn-ir-a-registro'); // Necesitamos el ID correcto
            
            if (selectorAvatares) selectorAvatares.style.display = 'flex'; 
            if (formPin) formPin.style.display = 'none';
            if (btnIrARegistro) btnIrARegistro.style.display = 'inline-block'; 
            // El botón 'btn-volver-bienvenida-alumno' ya está visible.
            cambiarVista('vista-login-alumno', 'vista-bienvenida'); 
        };
        document.getElementById('btn-ir-a-registro').onclick = () => cambiarVista('vista-login-alumno', 'vista-registro-alumno');
        document.getElementById('btn-volver-login-alumno-desde-registro').onclick = () => cambiarVista('vista-registro-alumno', 'vista-login-alumno');
        
        document.querySelectorAll('.avatar-seleccionable').forEach(avatarDiv => { 
            avatarDiv.onclick = () => { 
                const nombreAvatar = avatarDiv.dataset.nombreAvatar; 
                document.querySelectorAll('.avatar-seleccionable').forEach(ad => ad.classList.remove('seleccionado')); 
                avatarDiv.classList.add('seleccionado'); 
                document.getElementById('avatar-seleccionado-nombre').textContent = `Ingresando como: ${nombreAvatar}`; 
                document.getElementById('form-login-alumno-pin').dataset.nombreAvatar = nombreAvatar; 
                document.getElementById('selector-avatares-login').style.display = 'none'; 
                document.getElementById('form-login-alumno-pin').style.display = 'block'; 
                document.getElementById('alumno-pin-login').value = ''; 
                document.getElementById('alumno-pin-login').focus();
                // Ocultar botones que no aplican en este sub-paso
                const btnIrARegistro = document.getElementById('btn-ir-a-registro');
                const btnVolverBienvenida = document.getElementById('btn-volver-bienvenida-alumno');
                if(btnIrARegistro) btnIrARegistro.style.display = 'none';
                if(btnVolverBienvenida) btnVolverBienvenida.style.display = 'none';
            }; 
        });
        document.getElementById('btn-cambiar-avatar').onclick = () => { 
            document.getElementById('selector-avatares-login').style.display = 'flex'; 
            document.getElementById('form-login-alumno-pin').style.display = 'none'; 
            document.getElementById('form-login-alumno-pin').dataset.nombreAvatar = ''; 
            document.getElementById('alumno-pin-login').value = ''; 
            // Mostrar botones de nuevo
            const btnIrARegistro = document.getElementById('btn-ir-a-registro');
            const btnVolverBienvenida = document.getElementById('btn-volver-bienvenida-alumno');
            if(btnIrARegistro) btnIrARegistro.style.display = 'inline-block';
            if(btnVolverBienvenida) btnVolverBienvenida.style.display = 'inline-block';
            document.querySelectorAll('.avatar-seleccionable').forEach(ad => ad.classList.remove('seleccionado')); 
        };
        
        const btnVolverDashboardAnadir = document.getElementById('btn-volver-dashboard-desde-anadir');
        if (btnVolverDashboardAnadir) { btnVolverDashboardAnadir.onclick = () => renderizarDashboard(); }
        const btnVolverDashboardGestion = document.getElementById('btn-volver-dashboard-desde-gestion');
        if (btnVolverDashboardGestion) { btnVolverDashboardGestion.onclick = () => renderizarDashboard(); }
        
        document.getElementById('form-login-admin').addEventListener('submit', async (e) => { e.preventDefault(); const email = document.getElementById('admin-email').value; const pass = document.getElementById('admin-password').value; const admin = await loginAdmin(email, pass); if (admin) { renderizarDashboard(); actualizarMenuPrincipal(); }});
        document.getElementById('form-login-alumno-pin').addEventListener('submit', async (e) => { e.preventDefault(); const nombreAvatar = e.target.dataset.nombreAvatar; const pin = document.getElementById('alumno-pin-login').value; if (!nombreAvatar) { alert('Por favor, selecciona un avatar primero.'); document.getElementById('btn-cambiar-avatar').click(); return; } const alumno = await loginAlumno(nombreAvatar, pin); if (alumno) { renderizarDashboard(); actualizarMenuPrincipal(); e.target.dataset.nombreAvatar = ''; document.getElementById('alumno-pin-login').value = ''; document.getElementById('selector-avatares-login').style.display = 'flex'; document.getElementById('form-login-alumno-pin').style.display = 'none'; const btnIrARegistro = document.getElementById('btn-ir-a-registro'); if(btnIrARegistro) btnIrARegistro.style.display = 'inline-block'; const btnVolverBienvenida = document.getElementById('btn-volver-bienvenida-alumno'); if(btnVolverBienvenida) btnVolverBienvenida.style.display = 'inline-block'; }});
        document.getElementById('form-registro-alumno').addEventListener('submit', async (e) => { e.preventDefault(); const nickname = document.getElementById('alumno-nickname-registro').value; const idAvatar = document.getElementById('alumno-avatar-registro').value; const pin = document.getElementById('alumno-pin-registro').value; const pinConfirm = document.getElementById('alumno-pin-confirmar').value; if (pin !== pinConfirm) { alert('Los PINs no coinciden.'); return; } let pinEsValido = false; if (pin.length === 4) { if (/^[0-9]+$/.test(pin)) { pinEsValido = true; } } if (!pinEsValido) { alert('El PIN debe ser de exactamente 4 números.'); return; } const alumno = await registrarAlumno(nickname, idAvatar, pin); if (alumno) { renderizarDashboard(); actualizarMenuPrincipal(); }});
        
        const formAnadirLibro = document.getElementById('form-anadir-libro');
        if (formAnadirLibro) { formAnadirLibro.addEventListener('submit', handleAnadirLibroSubmit); }
        
        const inputFoto = document.getElementById('libro-foto');
        const previewFoto = document.getElementById('libro-foto-preview');
        if (inputFoto && previewFoto) { 
            inputFoto.addEventListener('change', function(event) { 
                const file = event.target.files[0]; 
                if (file) { 
                    const reader = new FileReader(); 
                    reader.onload = function(eRead) { 
                        previewFoto.src = eRead.target.result; 
                        previewFoto.style.display = 'block'; 
                    }; // Punto y coma aquí es buena práctica
                    reader.readAsDataURL(file); 
                } else { 
                    previewFoto.src = '#'; 
                    previewFoto.style.display = 'none'; 
                }
            }); 
        }
        console.log("DEBUG: main.js - Event listeners globales asignados.");
    } catch (err) { 
        console.error("DEBUG: main.js - Error al asignar event listeners globales:", err); 
    }
}

function appInit() {
    console.log("DEBUG: main.js - appInit() iniciada.");
    
    // Asignar selectores globales AHORA que el DOM está listo
    contenedorPrincipal = document.getElementById('contenedor-principal'); // Asigna a la variable global
    menuPrincipal = document.getElementById('menu-principal');       // Asigna a la variable global

    if (!contenedorPrincipal || !menuPrincipal) { 
        console.error("DEBUG: main.js - ERROR FATAL en appInit: Faltan 'contenedor-principal' o 'menu-principal' en el DOM."); 
        if (document.body) document.body.innerHTML = "<h1 style='color:red;text-align:center;'>Error Crítico: Estructura HTML base no encontrada.</h1>";
        return; 
    }
    console.log("DEBUG: main.js - appInit: Elementos DOM cruciales encontrados y asignados.");

    if (!supabaseClientInstance) { // supabaseClientInstance es global
        console.error("DEBUG: main.js - Instancia Supabase no inicializada en appInit().");
        contenedorPrincipal.innerHTML = "<p style='color:red; text-align:center;'>Error crítico: Conexión fallida con Supabase.</p>";
        return;
    }
    
    // Paso 1: Renderizar la estructura HTML base de todas las vistas.
    renderizarVistaBienvenida(); // Esta función está en ui_render_views.js
    
    // Paso 2: AHORA que el HTML existe, asignar los event listeners globales.
    // La función asignarEventListenersGlobales() está definida en este mismo archivo (main.js)
    // y los elementos a los que se asignan listeners fueron creados por renderizarVistaBienvenida().
    // No es necesario llamarla aquí si renderizarVistaBienvenida ya la llama al final.
    // Pero, renderizarVistaBienvenida fue modificada para NO llamarla. Así que la llamamos aquí:
    // No, asignarEventListenersGlobales() se llama DENTRO de renderizarVistaBienvenida() según el último código.
    // Lo cual está bien porque renderizarVistaBienvenida es la que crea los elementos a los que se les asignan listeners.

    const storedUser = localStorage.getItem('libroVaUser'); // currentUser de globals.js
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
         // renderizarVistaBienvenida() ya se llamó y estableció la vista de bienvenida.
         // Si por alguna razón no es la activa, la forzamos.
         if (!vistaActivaActual || vistaActivaActual.id !== 'vista-bienvenida') {
            cambiarVista(vistaActivaActual ? vistaActivaActual.id : null, 'vista-bienvenida'); 
         }
    }
    actualizarMenuPrincipal();
}

// Listener DOMContentLoaded
function onDOMLoadedAndSupabaseReady() {
    console.log("DEBUG: main.js - DOMContentLoaded y Supabase SDK listos (o se asume que están listos).");
    
    if (!supabaseClientInstance) {
        console.error("DEBUG: main.js - Supabase no se inicializó ANTES de DOMContentLoaded/onDOMLoadedAndSupabaseReady.");
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
console.log("DEBUG: main.js - Script finalizado (configuración de inicialización hecha o pendiente).");