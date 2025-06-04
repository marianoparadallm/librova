

function renderizarListaDashboard(divId, libros, tipoLista) {
    const div = document.getElementById(divId); if (!div) { console.error(`DEBUG: ui_render_views.js - Div ${divId} no encontrado.`); return; }
    div.innerHTML = '';
    if (!libros || libros.length === 0) { div.innerHTML = `<p>No tienes libros en esta categoría.</p>`; return; }
    libros.forEach(libro => {
        let infoExtra = ''; let botonHTML = '';
        const fechaDev = libro.fecha_limite_devolucion ? new Date(libro.fecha_limite_devolucion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
        if (tipoLista === 'prestadosPorMi') {
            const prestatario = libro.prestado_a ? libro.prestado_a.nickname : 'Alguien';
            infoExtra = `<span>Prestado a: ${prestatario}</span><span>Devolver el: ${fechaDev}</span>`;
            botonHTML = `<button class="btn-marcar-devuelto boton-accion-base" data-libro-id="${libro.id}" style="background-color: #3182CE;">Marcar Devuelto</button>`;
        } else if (tipoLista === 'prestadosAMi') {
            const dueno = libro.propietario ? libro.propietario.nickname : 'Desconocido';
            infoExtra = `<span>Dueño: ${dueno}</span><span>Devolver el: ${fechaDev}</span>`;
        }
        const itemHTML = `<div class="item-lista-libro" data-libro-id="${libro.id}"><img src="${libro.foto_url || './placeholder-portada.png'}" alt="Portada de ${libro.titulo}" class="thumbnail"><div class="detalles"><strong>${libro.titulo}</strong>${infoExtra}</div><div class="acciones">${botonHTML}</div></div>`;
        div.innerHTML += itemHTML;});
}

function renderizarListaSolicitudesRecibidas(divId, solicitudes) {
    const div = document.getElementById(divId);
    if (!div) { console.error(`DEBUG: ui_render_views.js - Div ${divId} no encontrado para lista de solicitudes.`); return; }
    div.innerHTML = '';
    if (!solicitudes || solicitudes.length === 0) {
        div.innerHTML = `<p>No tienes solicitudes de préstamo pendientes.</p>`;
        return;
    }
    solicitudes.forEach(solicitud => {
        const libroTitulo = solicitud.libros ? solicitud.libros.titulo : 'Libro desconocido';
        const solicitanteNickname = solicitud.usuarios ? solicitud.usuarios.nickname : 'Usuario desconocido';
        const fotoUrl = solicitud.libros ? (solicitud.libros.foto_url || './placeholder-portada.png') : './placeholder-portada.png';

        const itemHTML = `
            <div class="item-solicitud" data-solicitud-id="${solicitud.id}" 
                 data-libro-id="${solicitud.libro_id}" 
                 data-solicitante-id="${solicitud.solicitante_id}"
                 data-propietario-id="${solicitud.propietario_id}"> {/* propietario_id es el currentUser aquí */}
                <img src="${fotoUrl}" alt="Portada de ${libroTitulo}" class="thumbnail">
                <div class="detalles">
                    <strong>${libroTitulo}</strong>
                    <span>Solicitado por: ${solicitanteNickname}</span>
                    <span>Fecha solicitud: ${new Date(solicitud.fecha_solicitud).toLocaleDateString('es-AR')}</span>
                </div>
                <div class="acciones">
                    <button class="btn-aceptar-solicitud boton-accion-base" style="background-color: #38A169;">Aceptar</button>
                    <button class="btn-rechazar-solicitud boton-accion-base" style="background-color: #E53E3E; margin-top:5px;">Rechazar</button>
                </div>
            </div>
        `;
        div.innerHTML += itemHTML;
    });
}

async function renderizarDetallesGestionLibro(libroId) {
    console.log(`DEBUG: ui_render_views.js - Renderizando detalles para gestionar libro ID: ${libroId}`);
    const detallesDiv = document.getElementById('detalles-libro-gestion');
    const vistaGestion = document.getElementById('vista-gestionar-libro-propio');
    if (!detallesDiv || !vistaGestion) { console.error("DEBUG: ui_render_views.js - Divs para gestionar libro no encontrados."); return; }
    if (!supabaseClientInstance || !currentUser) { console.error("DEBUG: ui_render_views.js - Supabase o Usuario no inicializado."); return; }
    detallesDiv.innerHTML = "<p>Cargando detalles del libro...</p>";
    const vistaActivaActual = document.querySelector('.vista.activa');
    cambiarVista(vistaActivaActual ? vistaActivaActual.id : null, 'vista-gestionar-libro-propio');
    try {
        const { data: libro, error } = await supabaseClientInstance.from('libros').select('id, titulo, foto_url, propietario_id, estado').eq('id', libroId).eq('propietario_id', currentUser.id).single();
        if (error) { throw error.code === 'PGRST116' ? new Error("Libro no encontrado o no te pertenece.") : error; }
        if (libro) {
            vistaGestion.querySelector('h3').textContent = `Gestionar: ${libro.titulo}`;
            detallesDiv.innerHTML = `
                <div class="gestion-libro-info"><h4>${libro.titulo}</h4><img src="${libro.foto_url}" alt="Portada de ${libro.titulo}" style="max-width: 150px; border-radius: 4px; margin-bottom: 15px;"><p><strong>ID:</strong> ${libro.id}</p><p><strong>Estado:</strong> ${libro.estado}</p></div>
                <div class="gestion-libro-acciones"><button id="btn-editar-libro-info" class="boton-accion-base gestionar">Editar</button><button id="btn-eliminar-libro" class="boton-accion-base eliminar" style="background-color: #E53E3E;" data-libro-id="${libro.id}" ${libro.estado !== 'disponible' ? 'disabled title="No se puede eliminar un libro prestado"' : ''}>Eliminar</button></div>`;
            document.getElementById('btn-editar-libro-info').onclick = () => alert(`Editar Libro ID: ${libro.id} (no implementado).`);
            document.getElementById('btn-eliminar-libro').onclick = async () => alert(`Eliminar Libro ID: ${libro.id} (no implementado).`);
        } else { detallesDiv.innerHTML = "<p>No se encontraron detalles o no tienes permiso.</p>"; }
    } catch (error) { console.error("DEBUG: ui_render_views.js - Error cargando detalles para gestionar:", error); detallesDiv.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`; }
}

function renderizarDashboard() {
    console.log("DEBUG: ui_render_views.js - Renderizando Dashboard Completo. Usuario actual:", currentUser);
    if (!currentUser) { console.log("DEBUG: ui_render_views.js - No hay usuario, volviendo a bienvenida."); renderizarVistaBienvenida(); return; }
    if (!contenedorPrincipal) { console.error("DEBUG: ui_render_views.js - Contenedor principal no encontrado."); return; }
    const dashboardView = document.getElementById('vista-dashboard');
    if (!dashboardView) { console.error("DEBUG: ui_render_views.js - Div 'vista-dashboard' no encontrado."); renderizarVistaBienvenida(); return; }

    const nombreUsuario = currentUser.rol === 'admin' ? currentUser.email : currentUser.nickname;
    const reputacionMostrar = (currentUser.reputacion !== undefined && currentUser.reputacion !== null) ? currentUser.reputacion : 0;
    dashboardView.innerHTML = `
        <h2>Dashboard de ${nombreUsuario}</h2>
        <p>Tu reputación: ${reputacionMostrar}</p>
        <button id="btn-ir-anadir-libro" class="boton-accion-base cargar">Cargar Libro</button>
        <hr>
        <div class="seccion-dashboard">
            <h3>Solicitudes de Préstamo Recibidas</h3>
            <div id="solicitudes-prestamo-recibidas" class="lista-solicitudes">Cargando solicitudes...</div>
        </div>
        <hr>
        <div class="seccion-dashboard">
            <h3>Mis Libros Prestados a Otros</h3>
            <div id="mis-libros-en-prestamo" class="lista-dashboard-libros">Cargando...</div>
        </div>
        <hr>
        <div class="seccion-dashboard">
            <h3>Libros que me Prestaron</h3>
            <div id="libros-que-me-prestaron" class="lista-dashboard-libros">Cargando...</div>
        </div>
        <hr>
        <h3>Todos los Libros Disponibles en la Biblioteca</h3>
        <div id="lista-libros-disponibles">Cargando libros...</div>`;

    const btnIrAnadirLibro = document.getElementById('btn-ir-anadir-libro');
    if (btnIrAnadirLibro) { btnIrAnadirLibro.onclick = () => cambiarVista('vista-dashboard', 'vista-anadir-libro');}
    console.log("DEBUG: ui_render_views.js - HTML de Dashboard completo inyectado.");

    const vistaActivaPrevia = document.querySelector('.vista.activa');
    cambiarVista(vistaActivaPrevia ? vistaActivaPrevia.id : null, 'vista-dashboard');

    cargarSolicitudesRecibidas(currentUser.id).then(solicitudes => {
        renderizarListaSolicitudesRecibidas('solicitudes-prestamo-recibidas', solicitudes);
        asignarEventListenersLibros(); // Reutilizamos esta para los botones de Aceptar/Rechazar y Marcar Devuelto
    });
    cargarMisLibrosEnPrestamo(currentUser.id).then(libros => {
        renderizarListaDashboard('mis-libros-en-prestamo', libros, 'prestadosPorMi');
        asignarEventListenersLibros();
    });
    cargarLibrosQueMePrestaron(currentUser.id).then(libros => {
        renderizarListaDashboard('libros-que-me-prestaron', libros, 'prestadosAMi');
    });
    cargarYMostrarLibros();
}