// js/main.js
console.log("DEBUG: main.js - Script principal INICIADO.");

// Inicialización de Supabase (para SDK LOCAL ./supabase.js)
// Asegúrate que SUPABASE_URL y SUPABASE_ANON_KEY vienen de config.js y están definidos
console.log("DEBUG: main.js - Verificando SDK global 'supabase'. typeof window.supabase:", typeof window.supabase);
if (typeof window.supabase !== 'undefined' &&
    typeof window.supabase.createClient === 'function' &&
    typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' &&
    SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'TU_SUPABASE_URL') {
    try {
        // supabaseClientInstance se declara en globals.js y se asigna aquí
        supabaseClientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('DEBUG: main.js - Instancia del cliente Supabase creada exitosamente desde SDK LOCAL.');
    } catch (e) {
        console.error('DEBUG: main.js - Error al inicializar Supabase con createClient (SDK local):', e);
        // Mostrar error en la página si es posible
        const cpError = document.getElementById('contenedor-principal');
        if (cpError) {
             cpError.innerHTML = "<p style='color:red; text-align:center;'>Error crítico: Conexión fallida con el servidor.</p>";
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
    const cpError = document.getElementById('contenedor-principal');
    if (cpError) {
        cpError.innerHTML = `<p style='color:red; text-align:center;'>${errorMsg}</p>`;
    }
    throw new Error(errorMsg); // Detener ejecución si Supabase no se puede inicializar
}


// Definición de asignarEventListenersGlobales (esta función usa los IDs que crea renderizarVistaBienvenida)
function asignarEventListenersGlobales() {
    console.log("DEBUG: main.js - Asignando event listeners globales...");
    try {
        const btnIngresarCrear = document.getElementById('btn-ingresar-crear-usuario');
        if (btnIngresarCrear) {
            btnIngresarCrear.onclick = () => {
                console.log("DEBUG: main.js - Botón 'btn-ingresar-crear-usuario' CLICKEADO.");
                cambiarVista('vista-bienvenida', 'vista-login-alumno'); // cambiarVista de ui_navigation.js
                const selLoginReg = document.getElementById('seleccion-login-registro-alumno');
                const contLoginAvatar = document.getElementById('contenedor-login-avatar');
                if(selLoginReg) selLoginReg.style.display = 'block';
                if(contLoginAvatar) contLoginAvatar.style.display = 'none';
            };
        } else { console.error("DEBUG: main.js - Botón 'btn-ingresar-crear-usuario' NO ENCONTRADO."); }

        // ... (EL RESTO DE LOS EVENT LISTENERS COMO LOS TENÍAS EN LA ÚLTIMA VERSIÓN FUNCIONAL DE ESTA FUNCIÓN)
        // Asegúrate de que todos los getElementById aquí correspondan a los IDs generados en ui_render_views.js
        const btnAccesoAdmin = document.getElementById('btn-acceso-admin');
        if(btnAccesoAdmin) btnAccesoAdmin.onclick = () => cambiarVista('vista-bienvenida', 'vista-login-admin');
        const btnVolverAdmin = document.getElementById('btn-volver-bienvenida-admin');
        if(btnVolverAdmin) btnVolverAdmin.onclick = () => cambiarVista('vista-login-admin', 'vista-bienvenida');
        const btnMostrarLoginAvatar = document.getElementById('btn-mostrar-form-login-avatar');
        if(btnMostrarLoginAvatar) { btnMostrarLoginAvatar.onclick = () => { if(document.getElementById('seleccion-login-registro-alumno')) document.getElementById('seleccion-login-registro-alumno').style.display = 'none'; if(document.getElementById('contenedor-login-avatar')) document.getElementById('contenedor-login-avatar').style.display = 'block'; if(document.getElementById('selector-avatares-login')) document.getElementById('selector-avatares-login').style.display = 'flex'; if(document.getElementById('form-login-alumno-pin')) document.getElementById('form-login-alumno-pin').style.display = 'none'; };
        } else { console.error("DEBUG: main.js - Botón 'btn-mostrar-form-login-avatar' NO ENCONTRADO."); }
        const btnMostrarFormRegistro = document.getElementById('btn-mostrar-form-registro-alumno');
        if(btnMostrarFormRegistro) { btnMostrarFormRegistro.onclick = () => cambiarVista('vista-login-alumno', 'vista-registro-alumno');
        } else { console.error("DEBUG: main.js - Botón 'btn-mostrar-form-registro-alumno' NO ENCONTRADO."); }
        const btnVolverBienvenidaAlumno = document.getElementById('btn-volver-bienvenida-alumno');
        if (btnVolverBienvenidaAlumno) { btnVolverBienvenidaAlumno.onclick = () => { const sel = document.getElementById('seleccion-login-registro-alumno'); const cla = document.getElementById('contenedor-login-avatar'); if(sel) sel.style.display = 'block'; if(cla) cla.style.display = 'none'; cambiarVista('vista-login-alumno', 'vista-bienvenida'); };
        } else { console.error("DEBUG: main.js - Botón 'btn-volver-bienvenida-alumno' NO ENCONTRADO.");}
        const btnVolverLoginDesdeRegistro = document.getElementById('btn-volver-login-alumno-desde-registro');
        if (btnVolverLoginDesdeRegistro) { btnVolverLoginDesdeRegistro.onclick = () => { const vLA = document.getElementById('vista-login-alumno'); if(vLA){const sD=vLA.querySelector('#seleccion-login-registro-alumno'); const cA=vLA.querySelector('#contenedor-login-avatar'); if(sD)sD.style.display='block'; if(cA)cA.style.display='none';} cambiarVista('vista-registro-alumno', 'vista-login-alumno'); }; }
        document.querySelectorAll('.avatar-seleccionable').forEach(avatarDiv => { avatarDiv.onclick = () => { const nA = avatarDiv.dataset.nombreAvatar; document.querySelectorAll('.avatar-seleccionable').forEach(ad=>ad.classList.remove('seleccionado')); avatarDiv.classList.add('seleccionado'); document.getElementById('avatar-seleccionado-nombre').textContent=`Ingresando como: ${nA}`; document.getElementById('form-login-alumno-pin').dataset.nombreAvatar=nA; document.getElementById('selector-avatares-login').style.display='none'; document.getElementById('form-login-alumno-pin').style.display='block'; document.getElementById('alumno-pin-login').value=''; document.getElementById('alumno-pin-login').focus();}; });
        document.getElementById('btn-cambiar-avatar').onclick = () => { document.getElementById('selector-avatares-login').style.display='flex'; document.getElementById('form-login-alumno-pin').style.display='none'; document.getElementById('form-login-alumno-pin').dataset.nombreAvatar=''; document.getElementById('alumno-pin-login').value=''; document.querySelectorAll('.avatar-seleccionable').forEach(ad=>ad.classList.remove('seleccionado'));};
        const btnVolverDashAnadir = document.getElementById('btn-volver-dashboard-desde-anadir'); if(btnVolverDashAnadir)btnVolverDashAnadir.onclick=()=>renderizarDashboard();
        const btnVolverDashGestion = document.getElementById('btn-volver-dashboard-desde-gestion'); if(btnVolverDashGestion)btnVolverDashGestion.onclick=()=>renderizarDashboard();
        document.getElementById('form-login-admin').addEventListener('submit', async (e)=>{e.preventDefault();const em=document.getElementById('admin-email').value;const ps=document.getElementById('admin-password').value;const ad=await loginAdmin(em,ps);if(ad){renderizarDashboard();await refrescarNotificaciones();actualizarMenuPrincipal();}});
        document.getElementById('form-login-alumno-pin').addEventListener('submit', async (e)=>{e.preventDefault();const nA=e.target.dataset.nombreAvatar;const pn=document.getElementById('alumno-pin-login').value;if(!nA){alert('Selecciona avatar');document.getElementById('btn-cambiar-avatar').click();return;}const al=await loginAlumno(nA,pn);if(al){renderizarDashboard();await refrescarNotificaciones();actualizarMenuPrincipal();e.target.dataset.nombreAvatar='';document.getElementById('alumno-pin-login').value='';document.getElementById('selector-avatares-login').style.display='flex';document.getElementById('form-login-alumno-pin').style.display='none';}});
        document.getElementById('form-registro-alumno').addEventListener('submit', async (e)=>{e.preventDefault();const nick=document.getElementById('alumno-nickname-registro').value;const idAv=document.getElementById('alumno-avatar-registro').value;const pn=document.getElementById('alumno-pin-registro').value;const pnC=document.getElementById('alumno-pin-confirmar').value;if(pn!==pnC){alert('PINs no coinciden');return;}let pV=false;if(pn.length===4){if(/^[0-9]+$/.test(pn)){pV=true;}}if(!pV){alert('PIN debe ser 4 números');return;}const al=await registrarAlumno(nick,idAv,pn);if(al){renderizarDashboard();await refrescarNotificaciones();actualizarMenuPrincipal();}});
        const formAnL=document.getElementById('form-anadir-libro');if(formAnL)formAnL.addEventListener('submit',handleAnadirLibroSubmit);
        const inF=document.getElementById('libro-foto');const prF=document.getElementById('libro-foto-preview');if(inF&&prF){inF.addEventListener('change',function(ev){const fl=ev.target.files[0];if(fl){const r=new FileReader();r.onload=function(eR){prF.src=eR.target.result;prF.style.display='block';};r.readAsDataURL(fl);}else{prF.src='#';prF.style.display='none';}}); }
        console.log("DEBUG: main.js - Todos los event listeners globales asignados.");
    } catch (err) {
        console.error("DEBUG: main.js - Error al asignar algunos event listeners globales:", err);
    }
}

function appInit() {
    console.log("DEBUG: main.js - appInit() iniciada.");

    // Las variables globales se asignan aquí DENTRO de appInit,
    // que es llamada DESPUÉS de DOMContentLoaded
    contenedorPrincipal = document.getElementById('contenedor-principal');
    menuPrincipal = document.getElementById('menu-principal');

    if (!contenedorPrincipal || !menuPrincipal) {
        console.error("DEBUG: main.js - ERROR FATAL en appInit: Faltan 'contenedor-principal' o 'menu-principal' en el DOM.");
        if (document.body) document.body.innerHTML = "<h1 style='color:red;text-align:center;'>Error Crítico: Estructura HTML base no encontrada.</h1>";
        return;
    }
    console.log("DEBUG: main.js - appInit: Elementos DOM cruciales encontrados y asignados.");

    if (!supabaseClientInstance) {
        console.error("DEBUG: main.js - Instancia Supabase no inicializada en appInit(). Esto no debería pasar si el bloque de inicialización al inicio de main.js tuvo éxito.");
        contenedorPrincipal.innerHTML = "<p style='color:red; text-align:center;'>Error crítico: Conexión fallida con Supabase.</p>";
        return;
    }

    // Paso 1: Renderizar la estructura HTML base de todas las vistas.
    renderizarVistaBienvenida(); // Esta función está en js/ui_render_views.js

    // Paso 2: AHORA que el HTML existe, asignar los event listeners globales.
    asignarEventListenersGlobales(); // Esta función está definida en ESTE archivo (main.js)

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
            if (currentUser) { await refrescarNotificaciones(); renderizarDashboard(); }
            else { cambiarVista(idVistaActivaPrevia || 'vista-dashboard', 'vista-bienvenida'); }
        } else if (currentUser) {
            await refrescarNotificaciones();
            renderizarDashboard();
        } else {
            // Si no hubo cambio por auth y no hay currentUser, asegurar que se muestre bienvenida
            // Esto es importante si el localStorage estaba vacío y no hay sesión de admin.
            cambiarVista(idVistaActivaPrevia, 'vista-bienvenida');
        }
        actualizarMenuPrincipal();
    });

    if (currentUser) {
        console.log("DEBUG: main.js - appInit: Hay currentUser (localStorage), renderizando dashboard.");
        await refrescarNotificaciones();
        renderizarDashboard();
    } else {
         console.log("DEBUG: main.js - appInit: No hay currentUser (localStorage), onAuthStateChange o bienvenida inicial determinará.");
         const vistaActivaActual = document.querySelector('.vista.activa');
         // renderizarVistaBienvenida() ya se llamó y estableció la vista de bienvenida.
         // Si por alguna razón no es la activa (ej. onAuthStateChange se disparó antes y no encontró sesión), la forzamos.
         if (!vistaActivaActual || vistaActivaActual.id !== 'vista-bienvenida') {
            cambiarVista(vistaActivaActual ? vistaActivaActual.id : null, 'vista-bienvenida');
         }
    }
    actualizarMenuPrincipal();
}

// Listener DOMContentLoaded
// La función que se pasa a DOMContentLoaded ahora es appInit directamente.
// appInit se encargará de obtener los elementos del DOM y luego llamar a las funciones de renderizado y listeners.
if (document.readyState === 'loading') {
    console.log("DEBUG: main.js - DOM está 'loading'. Agregando listener para DOMContentLoaded que llamará a appInit.");
    document.addEventListener('DOMContentLoaded', appInit);
} else {
    console.log("DEBUG: main.js - DOM ya cargado ('interactive' o 'complete'), ejecutando appInit() directamente.");
    appInit();
}
console.log("DEBUG: main.js - Script finalizado (configuración de inicialización hecha o pendiente).");