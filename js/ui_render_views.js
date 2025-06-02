// js/ui_render_views.js
console.log("DEBUG: ui_render_views.js - Cargado.");

function renderizarVistaBienvenida() { 
    // ... (Misma función renderizarVistaBienvenida que tenías, con el HTML de todas las vistas)
    console.log("DEBUG: ui_render_views.js - Renderizando HTML de todas las vistas principales.");
    if (!contenedorPrincipal) { console.error("DEBUG: ui_render_views.js - Contenedor principal no encontrado."); return; } // contenedorPrincipal es global
    const parrafoCargando = document.getElementById('parrafo-carga-inicial');
    if (parrafoCargando) { parrafoCargando.remove(); }
    document.querySelectorAll('.vista').forEach(v => { v.style.display = 'none'; v.classList.remove('activa'); });
    let avataresLoginHTML = '';
    AVATARES_DISPONIBLES.forEach(avatar => { // AVATARES_DISPONIBLES de config.js
        avataresLoginHTML += `<div class="avatar-seleccionable" data-nombre-avatar="${avatar.nombre}"><span class="avatar-emoji">${avatar.emoji}</span><span class="avatar-nombre-display">${avatar.nombre}</span></div>`;
    });
    contenedorPrincipal.innerHTML = `
        <div id="vista-bienvenida" class="vista">
            <div class="texto-bienvenida">
                <p>¡Hola, explorador de historias! 👋</p>
                <p>Bienvenido a LibroVa, ¡nuestra biblioteca mágica ! Acá vas a poder compartir cuentos y libros que ya leíste y descubrir nuevas aventuras que tus compañeros tienen para vos. Sumate agregando tus libros y pidiendo prestamos e intercambialos en tu clase!</p>
                <p>¿Listo para empezar a compartir y leer?</p>
            </div>
            <button id="btn-ingresar-crear-usuario" class="boton-grande">Ingresar o Crear Usuario</button>
            <button id="btn-acceso-admin" class="boton-admin">ADMIN</button>
        </div>
        <div id="vista-login-admin" class="vista"><h3>Login Administrador</h3><form id="form-login-admin"><label for="admin-email">Email:</label><input type="email" id="admin-email" required><br><br><label for="admin-password">Contraseña:</label><input type="password" id="admin-password" required><br><br><button type="submit">Ingresar como Admin</button><button type="button" id="btn-volver-bienvenida-admin">Volver</button></form></div>
        <div id="vista-login-alumno" class="vista"><h3>Elige tu Avatar para Ingresar</h3><div id="selector-avatares-login" class="contenedor-avatares">${avataresLoginHTML}</div><form id="form-login-alumno-pin" style="display:none;"><h4 id="avatar-seleccionado-nombre"></h4><label for="alumno-pin-login">Tu PIN (4 dígitos):</label><input type="password" id="alumno-pin-login" maxlength="4" pattern="\\d{4}" required inputmode="numeric" autocomplete="current-password"><br><br><button type="submit">Ingresar</button><button type="button" id="btn-cambiar-avatar">Cambiar Avatar</button></form><div style="text-align:center; margin-top: 20px;"><button type="button" id="btn-ir-a-registro" class="link-button">No tengo cuenta / Registrarme</button><br><button type="button" id="btn-volver-bienvenida-alumno" class="link-button" style="margin-top:10px;">Volver a Inicio</button></div></div>
        <div id="vista-registro-alumno" class="vista"><h3>Registro de Alumno Nuevo</h3><form id="form-registro-alumno"><label for="alumno-nickname-registro">Elige tu Nickname (único, min. 3 caracteres):</label><input type="text" id="alumno-nickname-registro" required minlength="3"><br><br><label for="alumno-avatar-registro">Elige tu Avatar:</label><select id="alumno-avatar-registro" required></select><br><br><label for="alumno-pin-registro">Crea tu PIN (4 dígitos numéricos):</label><input type="password" id="alumno-pin-registro" maxlength="4" pattern="\\d{4}" required inputmode="numeric"><br><br><label for="alumno-pin-confirmar">Confirma tu PIN:</label><input type="password" id="alumno-pin-confirmar" maxlength="4" pattern="\\d{4}" required inputmode="numeric"><br><br><button type="submit">Registrarme</button><button type="button" id="btn-volver-login-alumno-desde-registro">Ya tengo cuenta / Volver a Login</button></form></div>
        <div id="vista-dashboard" class="vista"></div>
        <div id="vista-anadir-libro" class="vista"><h3>Añadir Nuevo Libro</h3><form id="form-anadir-libro"><label for="libro-titulo">Título del Libro:</label><input type="text" id="libro-titulo" required><br><br><label for="libro-foto">Foto de la Portada:</label><input type="file" id="libro-foto" accept="image/*" capture="environment" required><br><br><img id="libro-foto-preview" src="#" alt="Vista previa de la portada" style="max-width: 200px; max-height: 200px; display: none; margin-bottom:15px;"><br><button type="submit">Guardar Libro</button><button type="button" id="btn-volver-dashboard-desde-anadir">Cancelar y Volver al Dashboard</button></form></div>
        <div id="vista-gestionar-libro-propio" class="vista"><h3>Gestionar Mi Libro</h3><p>Aquí podrás editar o eliminar tu libro.</p><div id="detalles-libro-gestion"></div><button type="button" id="btn-volver-dashboard-desde-gestion">Volver al Dashboard</button></div>`;
    console.log("DEBUG: ui_render_views.js - HTML de todas las vistas principales inyectado.");
    const selectAvatarRegistro = document.getElementById('alumno-avatar-registro');
    if (selectAvatarRegistro) {
        selectAvatarRegistro.innerHTML = ''; AVATARES_DISPONIBLES.forEach(avatar => {
            const optionValue = avatar.id; const optionText = `${avatar.emoji} ${avatar.nombre}`;
            const optionHTML = `<option value="${optionValue}">${optionText}</option>`; 
            selectAvatarRegistro.innerHTML += optionHTML;});
        console.log("DEBUG: ui_render_views.js - Select de avatares para registro poblado.");
    } else { console.warn("DEBUG: ui_render_views.js - No se encontró el select 'alumno-avatar-registro'."); }
    asignarEventListenersGlobales(); // Asume que asignarEventListenersGlobales es global o está en este archivo
    cambiarVista(null, 'vista-bienvenida'); // Asume que cambiarVista es global
}

function renderizarListaDashboard(divId, libros, tipoLista) {
    // ... (Misma función renderizarListaDashboard que tenías)
    const div = document.getElementById(divId); if (!div) return; div.innerHTML = '';
    if (libros.length === 0) { div.innerHTML = `<p>No tienes libros en esta categoría.</p>`; return; }
    libros.forEach(libro => {
        let infoExtra = ''; let botonHTML = '';
        const fechaDev = libro.fecha_limite_devolucion ? new Date(libro.fecha_limite_devolucion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
        if (tipoLista === 'prestadosPorMi') { const prestatario = libro.prestado_a ? libro.prestado_a.nickname : 'Alguien'; infoExtra = `<span>Prestado a: ${prestatario}</span><span>Devolver el: ${fechaDev}</span>`; botonHTML = `<button class="btn-marcar-devuelto boton-menu-header" data-libro-id="${libro.id}">Marcar Devuelto</button>`; } 
        else if (tipoLista === 'prestadosAMi') { const dueno = libro.propietario ? libro.propietario.nickname : 'Desconocido'; infoExtra = `<span>Dueño: ${dueno}</span><span>Devolver el: ${fechaDev}</span>`; }
        const itemHTML = `<div class="item-lista-libro" data-libro-id="${libro.id}"><img src="${libro.foto_url || './placeholder-portada.png'}" alt="Portada de ${libro.titulo}" class="thumbnail"><div class="detalles"><strong>${libro.titulo}</strong>${infoExtra}</div><div class="acciones">${botonHTML}</div></div>`;
        div.innerHTML += itemHTML;});
}

function renderizarDashboard() {
    // ... (Misma función renderizarDashboard que tenías, pero las llamadas a funciones ahora son globales o deben ser importadas si usamos módulos ES6)
    console.log("DEBUG: ui_render_views.js - Renderizando Dashboard Completo. Usuario actual:", currentUser); // currentUser es global
    if (!currentUser) { console.log("DEBUG: ui_render_views.js - No hay usuario, volviendo a bienvenida."); renderizarVistaBienvenida(); return; }
    if (!contenedorPrincipal) { console.error("DEBUG: ui_render_views.js - Contenedor principal no encontrado."); return; } // contenedorPrincipal es global
    const dashboardView = document.getElementById('vista-dashboard');
    if (!dashboardView) { console.error("DEBUG: ui_render_views.js - Div 'vista-dashboard' no encontrado."); renderizarVistaBienvenida(); return; }
    const nombreUsuario = currentUser.rol === 'admin' ? currentUser.email : currentUser.nickname; 
    const reputacionMostrar = (currentUser.reputacion !== undefined && currentUser.reputacion !== null) ? currentUser.reputacion : 0;
    dashboardView.innerHTML = `<h2>Dashboard de ${nombreUsuario}</h2><p>Tu reputación: ${reputacionMostrar}</p><button id="btn-ir-anadir-libro" class="boton-menu-header">Cargar Libro</button><hr><div class="seccion-dashboard"><h3>Mis Libros Prestados a Otros</h3><div id="mis-libros-en-prestamo" class="lista-dashboard-libros">Cargando...</div></div><hr><div class="seccion-dashboard"><h3>Libros que me Prestaron</h3><div id="libros-que-me-prestaron" class="lista-dashboard-libros">Cargando...</div></div><hr><h3>Todos los Libros Disponibles en la Biblioteca</h3><div id="lista-libros-disponibles">Cargando libros...</div>`;
    const btnIrAnadirLibro = document.getElementById('btn-ir-anadir-libro');
    if (btnIrAnadirLibro) { btnIrAnadirLibro.onclick = () => cambiarVista('vista-dashboard', 'vista-anadir-libro');} // cambiarVista es global
    console.log("DEBUG: ui_render_views.js - HTML de Dashboard completo inyectado.");
    const vistaActivaPrevia = document.querySelector('.vista.activa');
    cambiarVista(vistaActivaPrevia ? vistaActivaPrevia.id : null, 'vista-dashboard');
    cargarMisLibrosEnPrestamo(currentUser.id).then(libros => { renderizarListaDashboard('mis-libros-en-prestamo', libros, 'prestadosPorMi'); asignarEventListenersLibros(); }); // cargarMisLibrosEnPrestamo, etc. son globales
    cargarLibrosQueMePrestaron(currentUser.id).then(libros => { renderizarListaDashboard('libros-que-me-prestaron', libros, 'prestadosAMi'); });
    cargarYMostrarLibros(); 
}