
function renderizarVistaBienvenida() {
    console.log("DEBUG: ui_render_views.js - Renderizando vista de bienvenida.");
    if (!contenedorPrincipal) {
        console.error("DEBUG: ui_render_views.js - contenedorPrincipal no encontrado.");
        return;
    }
    const parrafoCargando = document.getElementById('parrafo-carga-inicial');
    if (parrafoCargando) parrafoCargando.remove();
    document.querySelectorAll('.vista').forEach(v => { v.style.display = 'none'; v.classList.remove('activa'); });

    let avataresLoginHTML = '';
    AVATARES_DISPONIBLES.forEach(avatar => {
        avataresLoginHTML += `
            <div class="avatar-seleccionable" data-nombre-avatar="${avatar.nombre}">
                <span class="avatar-emoji">${avatar.emoji}</span>
                <span class="avatar-nombre-display">${avatar.nombre}</span>
            </div>
        `;
    });

    contenedorPrincipal.innerHTML = `
        <div id="vista-bienvenida" class="vista">
            <div class="texto-bienvenida">
                <p>¡ Bienvenido/a a LibroVa ! 👋</p>
                <p>Compartí cuentos y descubrí nuevas aventuras</p>
                <p>Empecemos ;)</p>
            </div>
            <button id="btn-ingresar-crear-usuario" class="boton-accion-base submit boton-grande">INGRESAR</button>
            <button id="btn-acceso-admin" class="boton-accion-base gestionar boton-admin">ADMIN</button>
        </div>
        <div id="vista-login-admin" class="vista">
            <h3>Login Administrador</h3>
            <form id="form-login-admin">
                <label for="admin-alias">Alias de administrador:</label>
                <input type="text" id="admin-alias" required><br><br>
                <label for="admin-pin">PIN:</label>
                <input type="password" id="admin-pin" maxlength="4" pattern="\\d{4}" required inputmode="numeric"><br><br>
                <button type="submit">Ingresar como Admin</button>
                <button type="button" id="btn-volver-bienvenida-admin">Volver</button>
            </form>
        </div>
        <div id="vista-login-alumno" class="vista">
            <h3>Bienvenido/a 😊</h3>
            <div id="seleccion-login-registro-alumno" style="text-align:center;margin-bottom:20px;">
                <button id="btn-mostrar-form-login-avatar" class="boton-grande-secundario">Tengo usuario</button>
                <button id="btn-mostrar-form-registro-alumno" class="boton-grande-secundario">Crear usuario</button>
            </div>
            <div id="contenedor-login-avatar" style="display:none;">
                <h4>Elige tu Avatar para Ingresar</h4>
                <div id="selector-avatares-login" class="contenedor-avatares">${avataresLoginHTML}</div>
                <form id="form-login-alumno-pin" style="display:none;">
                    <h4 id="avatar-seleccionado-nombre"></h4>
                    <label for="alumno-pin-login">Tu PIN (4 dígitos):</label>
                    <input type="password" id="alumno-pin-login" maxlength="4" pattern="\\d{4}" required inputmode="numeric" autocomplete="current-password"><br><br>
                    <button type="submit" class="boton-accion-base submit">Ingresar</button>
                    <button type="button" id="btn-cambiar-avatar">Cambiar Avatar</button>
                </form>
            </div>
            <div style="text-align:center; margin-top: 20px;">
                 <button type="button" id="btn-volver-bienvenida-alumno" class="link-button" style="margin-top:10px;">Volver a Inicio</button>
            </div>
        </div>
        <div id="vista-registro-alumno" class="vista">
            <h3>Nuevo usuario</h3>
            <form id="form-registro-alumno">
                <label for="alumno-nickname-registro">Elige tu Nickname (único, min. 3 caracteres):</label>
                <input type="text" id="alumno-nickname-registro" required minlength="3"><br><br>
                <label for="alumno-avatar-registro">Elige tu Avatar:</label>
                <select id="alumno-avatar-registro" required></select><br><br>
                <label for="alumno-pin-registro">Crea tu PIN (4 dígitos numéricos):</label>
                <input type="password" id="alumno-pin-registro" maxlength="4" pattern="\\d{4}" required inputmode="numeric"><br><br>
                <label for="alumno-pin-confirmar">Confirma tu PIN:</label>
                <input type="password" id="alumno-pin-confirmar" maxlength="4" pattern="\\d{4}" required inputmode="numeric"><br><br>
                <button type="submit" class="boton-accion-base submit">Registrarme</button>
                <button type="button" id="btn-volver-login-alumno-desde-registro" class="link-button">Volver</button>
            </form>
        </div>
        <div id="vista-dashboard" class="vista"></div>
        <div id="vista-buscar-libros" class="vista">
            <h3>Búsqueda de Libros</h3>
            <div id="filtros-busqueda" class="filtros-libros">
                <label for="filtro-orden">Ordenar por:</label>
                <select id="filtro-orden">
                    <option value="nuevos">Más nuevos</option>
                    <option value="antiguos">Más antiguos</option>
                    <option value="fechadev">Fecha de devolución</option>
                    <option value="usuario">Usuario</option>
                </select>
            </div>
            <div id="lista-libros-disponibles">Cargando libros...</div>
            <button id="btn-ver-mas" class="boton-accion-base cargar" style="display:none;">Ver +</button>
        </div>

        <div id="vista-detalle-libro" class="vista">
            <div id="detalle-libro-info">Cargando...</div>
            <button type="button" id="btn-volver-busqueda-desde-detalle" class="boton-accion-base gestionar">Volver</button>
        </div>

        <div id="vista-ranking" class="vista">
            <h3>Ranking de Usuarios</h3>
            <div id="lista-ranking">Cargando...</div>
        </div>
        <div id="vista-admin-panel" class="vista">
            <h3>Panel de Administración</h3>
            <button id="btn-admin-gestionar-libros">Libros</button>
            <button id="btn-admin-gestionar-usuarios">Usuarios</button>
            <button id="btn-admin-gestionar-prestamos">Préstamos</button>
            <button id="btn-admin-gestionar-notificaciones">Notificaciones</button>
            <button type="button" id="btn-volver-dashboard-desde-admin">Volver al Dashboard</button>
        </div>
        <div id="vista-anadir-libro" class="vista"><h3>Añadir Nuevo Libro</h3><form id="form-anadir-libro"><label for="libro-titulo">Título del Libro:</label><input type="text" id="libro-titulo" required><br><br><label for="libro-foto">Foto de la Portada:</label><input type="file" id="libro-foto" accept="image/*" capture="environment" required><br><br><img id="libro-foto-preview" src="#" alt="Vista previa de la portada" style="max-width: 200px; max-height: 200px; display: none; margin-bottom:15px;"><br><button type="submit">Guardar Libro</button><button type="button" id="btn-volver-dashboard-desde-anadir">Cancelar y Volver al Dashboard</button></form></div>
        <div id="vista-gestionar-libro-propio" class="vista"><h3>Gestionar Mi Libro</h3><p>Aquí podrás editar o eliminar tu libro que esté disponible.</p><div id="detalles-libro-gestion"></div><button type="button" id="btn-volver-dashboard-desde-gestion">Volver al Dashboard</button></div>
    `;
    const selectAvatarRegistro = document.getElementById('alumno-avatar-registro');
    if (selectAvatarRegistro) {
        selectAvatarRegistro.innerHTML = '';
        AVATARES_DISPONIBLES.forEach(avatar => {
            const optionValue = avatar.id;
            const optionText = `${avatar.emoji} ${avatar.nombre}`;
            const optionHTML = `<option value="${optionValue}">${optionText}</option>`;
            selectAvatarRegistro.innerHTML += optionHTML;
        });
    }
    asignarEventListenersGlobales();
    cambiarVista(null, 'vista-bienvenida');
}

function renderizarListaDashboard(divId, libros, tipoLista) {
    const div = document.getElementById(divId); if (!div) { console.error(`DEBUG: ui_render_views.js - Div ${divId} no encontrado.`); return; }
    div.innerHTML = '';
    if (!libros || libros.length === 0) { div.innerHTML = `<p>No tienes libros en esta categoría.</p>`; return; }
    const isSmallScreen = window.innerWidth <= 480;
    libros.forEach(libro => {
        const item = document.createElement('div');
        item.className = 'item-lista-libro';
        item.dataset.libroId = libro.id;

        const img = document.createElement('img');
        img.src = libro.foto_url || './placeholder-portada.png';
        img.alt = `Portada de ${libro.titulo}`;
        img.className = 'thumbnail';
        item.appendChild(img);

        const detalles = document.createElement('div');
        detalles.className = 'detalles';
        const strong = document.createElement('strong');
        strong.textContent = libro.titulo;
        detalles.appendChild(strong);

        const fechaDev = libro.fecha_limite_devolucion ? new Date(libro.fecha_limite_devolucion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
        if (tipoLista === 'prestadosPorMi') {
            const prestatario = libro.prestado_a ? libro.prestado_a.nickname : 'Alguien';
            if (isSmallScreen) {
                const span = document.createElement('span');
                span.textContent = `Prestado a: ${prestatario} - Dev: ${fechaDev}`;
                span.style.fontSize = '0.75em';
                detalles.appendChild(span);
            } else {
                const span1 = document.createElement('span');
                span1.textContent = `Prestado a: ${prestatario}`;
                const span2 = document.createElement('span');
                span2.textContent = `Devolver el: ${fechaDev}`;
                detalles.appendChild(span1);
                detalles.appendChild(span2);
            }
        } else if (tipoLista === 'prestadosAMi') {
            const dueno = libro.propietario ? libro.propietario.nickname : 'Desconocido';
            if (isSmallScreen) {
                const span = document.createElement('span');
                span.textContent = `Due\u00f1o: ${dueno} - Dev: ${fechaDev}`;
                span.style.fontSize = '0.75em';
                detalles.appendChild(span);
            } else {
                const span1 = document.createElement('span');
                span1.textContent = `Due\u00f1o: ${dueno}`;
                const span2 = document.createElement('span');
                span2.textContent = `Devolver el: ${fechaDev}`;
                detalles.appendChild(span1);
                detalles.appendChild(span2);
            }
        }
        item.appendChild(detalles);

        const acciones = document.createElement('div');
        acciones.className = 'acciones';
        if (tipoLista === 'prestadosPorMi') {
            const btn = document.createElement('button');
            btn.className = 'btn-solicitar-devolucion boton-accion-base pedir';
            btn.dataset.libroId = libro.id;
            btn.dataset.prestatarioId = libro.prestatario_id || '';
            btn.dataset.prestatarioNick = libro.prestado_a ? libro.prestado_a.nickname : '';
            btn.dataset.fechaDev = fechaDev;
            btn.textContent = 'Solicitar devolución';
            acciones.appendChild(btn);
        }
        item.appendChild(acciones);

        div.appendChild(item);
    });
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

        const item = document.createElement('div');
        item.className = 'item-solicitud';
        item.dataset.solicitudId = solicitud.id;
        item.dataset.libroId = solicitud.libro_id;
        item.dataset.solicitanteId = solicitud.solicitante_id;
        item.dataset.propietarioId = solicitud.propietario_id; // propietario_id es el currentUser aquí

        const img = document.createElement('img');
        img.src = fotoUrl;
        img.alt = `Portada de ${libroTitulo}`;
        img.className = 'thumbnail';
        item.appendChild(img);

        const detalles = document.createElement('div');
        detalles.className = 'detalles';
        const strong = document.createElement('strong');
        strong.textContent = libroTitulo;
        const spanNick = document.createElement('span');
        spanNick.textContent = `Solicitado por: ${solicitanteNickname}`;
        const spanFecha = document.createElement('span');
        spanFecha.textContent = `Fecha solicitud: ${new Date(solicitud.fecha_solicitud).toLocaleDateString('es-AR')}`;
        detalles.appendChild(strong);
        detalles.appendChild(spanNick);
        detalles.appendChild(spanFecha);
        item.appendChild(detalles);

        const acciones = document.createElement('div');
        acciones.className = 'acciones';
        const btnAceptar = document.createElement('button');
        btnAceptar.className = 'btn-aceptar-solicitud boton-accion-base aceptar';
        btnAceptar.textContent = 'Aceptar';
        const btnRechazar = document.createElement('button');
        btnRechazar.className = 'btn-rechazar-solicitud boton-accion-base eliminar';
        btnRechazar.style.marginTop = '5px';
        btnRechazar.textContent = 'Rechazar';
        acciones.appendChild(btnAceptar);
        acciones.appendChild(btnRechazar);
        item.appendChild(acciones);

        div.appendChild(item);
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
            detallesDiv.innerHTML = '';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'gestion-libro-info';
            const h4 = document.createElement('h4');
            h4.textContent = libro.titulo;
            const img = document.createElement('img');
            img.src = libro.foto_url;
            img.alt = `Portada de ${libro.titulo}`;
            img.style.maxWidth = '150px';
            img.style.borderRadius = '4px';
            img.style.marginBottom = '15px';
            const pId = document.createElement('p');
            pId.appendChild(document.createElement('strong')).textContent = 'ID:';
            pId.append(` ${libro.id}`);

            const pEstado = document.createElement('p');
            pEstado.appendChild(document.createElement('strong')).textContent = 'Estado:';
            pEstado.append(` ${libro.estado}`);
            infoDiv.appendChild(h4);
            infoDiv.appendChild(img);
            infoDiv.appendChild(pId);
            infoDiv.appendChild(pEstado);

            const accionesDiv = document.createElement('div');
            accionesDiv.className = 'gestion-libro-acciones';
            const btnEditar = document.createElement('button');
            btnEditar.id = 'btn-editar-libro-info';
            btnEditar.className = 'boton-accion-base gestionar';
            btnEditar.textContent = 'Editar';
            const btnEliminar = document.createElement('button');
            btnEliminar.id = 'btn-eliminar-libro';
            btnEliminar.className = 'boton-accion-base eliminar';
            btnEliminar.dataset.libroId = libro.id;
            if (libro.estado !== 'disponible') {
                btnEliminar.disabled = true;
                btnEliminar.title = 'No se puede eliminar un libro prestado';
            }
            btnEliminar.textContent = 'Eliminar';
            accionesDiv.appendChild(btnEditar);
            accionesDiv.appendChild(btnEliminar);

            detallesDiv.appendChild(infoDiv);
            detallesDiv.appendChild(accionesDiv);

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
    const adminBtn = currentUser.rol === 'admin' ? '<button id="btn-ir-admin-panel" class="boton-accion-base gestionar">Panel Admin</button><hr>' : '';
    dashboardView.innerHTML = `
        <h2 id="titulo-dashboard"></h2>
        <p id="reputacion-dashboard"></p>
        <button id="btn-ir-anadir-libro" class="boton-accion-base cargar">Cargar Libro</button>
        ${adminBtn}
        <hr>
        <div class="seccion-dashboard">
            <h3>Novedades y Decisiones Pendientes</h3>
            <div id="lista-novedades" class="lista-novedades">Cargando...</div>
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
        `;

    const tituloDash = document.getElementById('titulo-dashboard');
    if (tituloDash) tituloDash.textContent = `Hola ${nombreUsuario} 😊`;
    const repDash = document.getElementById('reputacion-dashboard');
    if (repDash) repDash.textContent = `Tu reputación: ${reputacionMostrar}`;

    const btnIrAnadirLibro = document.getElementById('btn-ir-anadir-libro');
    if (btnIrAnadirLibro) { btnIrAnadirLibro.onclick = () => cambiarVista('vista-dashboard', 'vista-anadir-libro');}
    const btnIrAdminPanel = document.getElementById('btn-ir-admin-panel');
    if (btnIrAdminPanel) btnIrAdminPanel.onclick = renderizarPanelAdmin;
    console.log("DEBUG: ui_render_views.js - HTML de Dashboard completo inyectado.");

    const vistaActivaPrevia = document.querySelector('.vista.activa');
    cambiarVista(vistaActivaPrevia ? vistaActivaPrevia.id : null, 'vista-dashboard');

    Promise.all([
        cargarSolicitudesRecibidas(currentUser.id),
        refrescarNotificaciones()
    ]).then(([solicitudes]) => {
        renderizarNovedadesPendientes('lista-novedades', notificaciones, solicitudes);
        const ids = notificaciones.filter(n => !n.leida).map(n => n.id);
        if (ids.length > 0) {
            marcarNotificacionesLeidas(ids).then(refrescarNotificaciones);
        }
        asignarEventListenersLibros();
    });
    cargarMisLibrosEnPrestamo(currentUser.id).then(libros => {
        renderizarListaDashboard('mis-libros-en-prestamo', libros, 'prestadosPorMi');
        asignarEventListenersLibros();
    });
    cargarLibrosQueMePrestaron(currentUser.id).then(libros => {
        renderizarListaDashboard('libros-que-me-prestaron', libros, 'prestadosAMi');
    });
}

function renderizarListaNotificaciones(divId, notas) {
    const div = document.getElementById(divId);
    if (!div) { console.error(`DEBUG: ui_render_views.js - Div ${divId} no encontrado para notificaciones.`); return; }
    div.innerHTML = '';
    if (!notas || notas.length === 0) {
        div.innerHTML = '<div class="item-notificacion">No hay mensajes nuevos.</div>';
        return;
    }
    for (const n of notas) {
        const item = document.createElement('div');
        item.className = n.leida ? 'item-notificacion' : 'item-notificacion nueva';
        item.textContent = n.mensaje;

        const span = document.createElement('span');
        span.style.float = 'right';
        span.style.fontSize = '0.8em';
        span.style.color = '#4A5568';
        span.textContent = new Date(n.created_at).toLocaleDateString('es-AR');

        item.appendChild(span);

        const btnVisto = document.createElement('button');
        btnVisto.className = 'boton-visto-notificacion';
        btnVisto.textContent = 'Visto';
        btnVisto.onclick = async () => {
            await eliminarNotificacion(n.id);
            await refrescarNotificaciones();
            renderizarListaNotificaciones(divId, notificaciones);
        };
        item.appendChild(btnVisto);

        div.appendChild(item);
    }
}

async function renderizarVistaDetalleLibro(libroId) {
    const vistaDetalle = document.getElementById('vista-detalle-libro');
    const cont = document.getElementById('detalle-libro-info');
    if (!vistaDetalle || !cont) return;
    cont.innerHTML = '<p>Cargando detalles...</p>';
    const vistaActiva = document.querySelector('.vista.activa');
    cambiarVista(vistaActiva ? vistaActiva.id : null, 'vista-detalle-libro');
    if (!supabaseClientInstance) { cont.innerHTML = '<p>Error de conexión.</p>'; return; }
    try {
        const { data: libro, error } = await supabaseClientInstance.from('libros')
            .select(`id, titulo, foto_url, estado, google_link, propietario_id, propietario:usuarios!propietario_id ( nickname )`)
            .eq('id', libroId).single();
        if (error) throw error;
        if (!libro) { cont.innerHTML = '<p>Libro no encontrado.</p>'; return; }
        cont.innerHTML = '';
        const h3 = document.createElement('h3');
        h3.textContent = libro.titulo;
        const img = document.createElement('img');
        img.src = libro.foto_url;
        img.alt = `Portada de ${libro.titulo}`;
        img.style.maxWidth = '200px';
        img.style.borderRadius = '4px';
        img.style.marginBottom = '10px';
        cont.appendChild(h3);
        cont.appendChild(img);
        const propietarioNombre = libro.propietario ? libro.propietario.nickname : 'Desconocido';
        const pProp = document.createElement('p');
        pProp.textContent = `Dueño: ${propietarioNombre}`;
        const pEstado = document.createElement('p');
        pEstado.textContent = `Estado: ${libro.estado}`;
        cont.appendChild(pProp);
        cont.appendChild(pEstado);
        let prestamoDetalle = null;
        if (libro.estado === 'prestado') {
            const { data: prestamoInfo } = await supabaseClientInstance
                .from('prestamos')
                .select('fecha_limite_devolucion, prestatario:usuarios!prestatario_id ( nickname ), prestatario_id')
                .eq('libro_id', libroId)
                .eq('estado', 'activo')
                .single();
            prestamoDetalle = prestamoInfo || null;
            const nombrePrestadoA = prestamoDetalle && prestamoDetalle.prestatario ? prestamoDetalle.prestatario.nickname : 'Alguien';
            const fechaDev = prestamoDetalle && prestamoDetalle.fecha_limite_devolucion ? new Date(prestamoDetalle.fecha_limite_devolucion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Fecha no definida';
            const pPrest = document.createElement('p');
            pPrest.textContent = `Prestado a: ${nombrePrestadoA} - Devolver el: ${fechaDev}`;
            cont.appendChild(pPrest);
        }
        const acciones = document.createElement('div');
        if (currentUser && currentUser.id !== libro.propietario_id && (libro.estado === 'disponible' || libro.estado === 'solicitado')) {
            const btn = document.createElement('button');
            btn.className = 'btn-pedir-prestamo boton-accion-base pedir';
            btn.textContent = 'Pedir';
            btn.onclick = () => pedirLibroPrestado(libro.id, libro.propietario_id, libro.titulo);
            acciones.appendChild(btn);
        }
        if (currentUser && currentUser.id === libro.propietario_id && libro.estado === 'prestado' && prestamoDetalle?.prestatario_id) {
            const btn = document.createElement('button');
            btn.className = 'btn-marcar-devuelto boton-accion-base devolver';
            btn.textContent = 'Devolver';
            btn.onclick = () => marcarLibroComoDevuelto(libro.id);
            acciones.appendChild(btn);
        }
        if (currentUser && currentUser.id === libro.propietario_id && (libro.estado === 'disponible' || libro.estado === 'solicitado')) {
            const btn = document.createElement('button');
            btn.className = 'btn-gestionar-libro boton-accion-base gestionar';
            btn.textContent = 'Gestionar (Mío)';
            btn.onclick = () => renderizarDetallesGestionLibro(libro.id);
            acciones.appendChild(btn);
        }
        const btnInfo = document.createElement('button');
        btnInfo.className = 'boton-accion-base info';
        btnInfo.textContent = '+info';
        btnInfo.onclick = () => { if (libro.google_link) window.open(libro.google_link, '_blank'); };
        acciones.appendChild(btnInfo);
        cont.appendChild(acciones);
    } catch (err) {
        console.error('DEBUG: ui_render_views.js - Error cargando libro detalle', err);
        cont.innerHTML = '<p style="color:red;">Error al cargar libro.</p>';
    }
}

function renderizarNovedadesPendientes(divId, notas, solicitudes) {
    const div = document.getElementById(divId);
    if (!div) { console.error(`DEBUG: ui_render_views.js - Div ${divId} no encontrado para novedades.`); return; }
    div.innerHTML = '';
    const tieneNotas = notas && notas.length > 0;
    const tieneSol = solicitudes && solicitudes.length > 0;
    if (!tieneNotas && !tieneSol) { div.innerHTML = '<p>No hay novedades ni decisiones pendientes.</p>'; return; }
    if (tieneNotas) {
        notas.forEach(n => {
            const item = document.createElement('div');
            item.className = (n.leida ? 'item-notificacion' : 'item-notificacion nueva') + ' item-novedad';
            const icon = document.createElement('span');
            icon.className = 'icono-novedad';
            icon.textContent = '🔔';
            item.appendChild(icon);
            const texto = document.createElement('span');
            texto.textContent = n.mensaje;
            item.appendChild(texto);
            const span = document.createElement('span');
            span.style.float = 'right';
            span.style.fontSize = '0.8em';
            span.style.color = '#4A5568';
            span.textContent = new Date(n.created_at).toLocaleDateString('es-AR');
            item.appendChild(span);

            const btnVisto = document.createElement('button');
            btnVisto.className = 'boton-visto-notificacion';
            btnVisto.textContent = 'Visto';
            btnVisto.onclick = async () => {
                await eliminarNotificacion(n.id);
                await refrescarNotificaciones();
                renderizarNovedadesPendientes(divId, notificaciones, solicitudes);
            };
            item.appendChild(btnVisto);

            div.appendChild(item);
        });
    }
    if (tieneSol) {
        solicitudes.forEach(solicitud => {
            const libroTitulo = solicitud.libros ? solicitud.libros.titulo : 'Libro desconocido';
            const solicitanteNickname = solicitud.usuarios ? solicitud.usuarios.nickname : 'Usuario desconocido';
            const fotoUrl = solicitud.libros ? (solicitud.libros.foto_url || './placeholder-portada.png') : './placeholder-portada.png';

            const item = document.createElement('div');
            item.className = 'item-solicitud item-novedad';
            item.dataset.solicitudId = solicitud.id;
            item.dataset.libroId = solicitud.libro_id;
            item.dataset.solicitanteId = solicitud.solicitante_id;
            item.dataset.propietarioId = solicitud.propietario_id;

            const icon = document.createElement('span');
            icon.className = 'icono-novedad';
            icon.textContent = '📚';
            item.appendChild(icon);

            const img = document.createElement('img');
            img.src = fotoUrl;
            img.alt = `Portada de ${libroTitulo}`;
            img.className = 'thumbnail';
            item.appendChild(img);

            const detalles = document.createElement('div');
            detalles.className = 'detalles';
            const strong = document.createElement('strong');
            strong.textContent = libroTitulo;
            const spanNick = document.createElement('span');
            spanNick.textContent = `Solicitado por: ${solicitanteNickname}`;
            const spanFecha = document.createElement('span');
            spanFecha.textContent = `Fecha solicitud: ${new Date(solicitud.fecha_solicitud).toLocaleDateString('es-AR')}`;
            detalles.appendChild(strong);
            detalles.appendChild(spanNick);
            detalles.appendChild(spanFecha);
            item.appendChild(detalles);

            const acciones = document.createElement('div');
            acciones.className = 'acciones';
            const btnAceptar = document.createElement('button');
            btnAceptar.className = 'btn-aceptar-solicitud boton-accion-base aceptar';
            btnAceptar.textContent = 'Aceptar';
            const btnRechazar = document.createElement('button');
            btnRechazar.className = 'btn-rechazar-solicitud boton-accion-base eliminar';
            btnRechazar.style.marginTop = '5px';
            btnRechazar.textContent = 'Rechazar';
            acciones.appendChild(btnAceptar);
            acciones.appendChild(btnRechazar);
            item.appendChild(acciones);

            div.appendChild(item);
        });
    }
}

async function renderizarVistaRanking() {
    const vistaActiva = document.querySelector('.vista.activa');
    const rankingDiv = document.getElementById('lista-ranking');
    if (!rankingDiv) return;
    rankingDiv.innerHTML = 'Cargando ranking...';
    cambiarVista(vistaActiva ? vistaActiva.id : null, 'vista-ranking');
    if (!supabaseClientInstance) { rankingDiv.innerHTML = '<p>Error de conexión.</p>'; return; }
    try {
        const { data, error } = await supabaseClientInstance
            .from('usuarios')
            .select('nickname, reputacion')
            .order('reputacion', { ascending: false })
            .limit(20);
        if (error) throw error;
        if (!data || data.length === 0) { rankingDiv.innerHTML = '<p>No hay usuarios.</p>'; return; }
        rankingDiv.innerHTML = '<ol class="lista-ranking"></ol>';
        const ol = rankingDiv.querySelector('ol');
        data.forEach(u => {
            const li = document.createElement('li');
            li.textContent = `${u.nickname} - ${u.reputacion ?? 0}`;
            ol.appendChild(li);
        });
    } catch (err) {
        console.error('DEBUG: ui_render_views.js - Error cargando ranking', err);
        rankingDiv.innerHTML = '<p style="color:red;">Error al cargar ranking.</p>';
    }
}

async function renderizarPanelAdmin() {
    const vistaActual = document.querySelector('.vista.activa');
    const vista = document.getElementById('vista-admin-panel');
    if (!vista) return;
    vista.innerHTML = `
        <h3>Panel Administrador</h3>
        <div class="seccion-dashboard">
            <h4>Libros</h4>
            <div id="admin-lista-libros">Cargando...</div>
            <form id="form-admin-libro">
                <input type="text" id="admin-libro-titulo" placeholder="Título">
                <button type="submit" class="boton-accion-base submit">Crear Libro</button>
            </form>
        </div>
        <div class="seccion-dashboard">
            <h4>Usuarios</h4>
            <div id="admin-lista-usuarios">Cargando...</div>
            <form id="form-admin-usuario">
                <input type="text" id="admin-usuario-nickname" placeholder="Nickname">
                <button type="submit" class="boton-accion-base submit">Crear Usuario</button>
            </form>
        </div>
        <div class="seccion-dashboard">
            <h4>Solicitudes</h4>
            <div id="admin-lista-solicitudes">Cargando...</div>
        </div>
        <div class="seccion-dashboard">
            <h4>Notificaciones</h4>
            <div id="admin-lista-notificaciones">Cargando...</div>
        </div>
        <button type="button" id="btn-volver-dashboard-desde-admin" class="boton-accion-base gestionar">Volver al Dashboard</button>
    `;
    cambiarVista(vistaActual ? vistaActual.id : null, 'vista-admin-panel');

    await cargarDatosPanelAdmin();

    document.getElementById('form-admin-libro').addEventListener('submit', async (e) => {
        e.preventDefault();
        const t = document.getElementById('admin-libro-titulo').value.trim();
        if (t) {
            await crearLibroAdmin({ titulo: t });
            renderizarPanelAdmin();
        }
    });

    document.getElementById('form-admin-usuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const n = document.getElementById('admin-usuario-nickname').value.trim();
        if (n) {
            await crearUsuarioAdmin({ nickname: n });
            renderizarPanelAdmin();
        }
    });

    document.getElementById('btn-volver-dashboard-desde-admin').onclick = renderizarDashboard;
}

async function cargarDatosPanelAdmin() {
    const divLibros = document.getElementById('admin-lista-libros');
    const libros = await listarLibrosAdmin();
    divLibros.innerHTML = '';
    libros.forEach(l => {
        const item = document.createElement('div');
        item.className = 'item-lista-libro';
        const detalles = document.createElement('div');
        detalles.className = 'detalles';
        detalles.textContent = `[${l.id}] ${l.titulo}`;
        item.appendChild(detalles);
        const acciones = document.createElement('div');
        acciones.className = 'acciones';
        const bE = document.createElement('button');
        bE.className = 'boton-accion-base gestionar';
        bE.textContent = 'Editar';
        bE.onclick = async () => {
            const nuevo = prompt('Nuevo título', l.titulo);
            if (nuevo !== null) {
                await editarLibroAdmin(l.id, { titulo: nuevo });
                renderizarPanelAdmin();
            }
        };
        const bD = document.createElement('button');
        bD.className = 'boton-accion-base eliminar';
        bD.textContent = 'Eliminar';
        bD.onclick = async () => {
            if (confirm('¿Eliminar libro?')) {
                await eliminarLibroAdmin(l.id);
                renderizarPanelAdmin();
            }
        };
        acciones.appendChild(bE);
        acciones.appendChild(bD);
        item.appendChild(acciones);
        divLibros.appendChild(item);
    });

    const divUsuarios = document.getElementById('admin-lista-usuarios');
    const usuarios = await listarUsuariosAdmin();
    divUsuarios.innerHTML = '';
    usuarios.forEach(u => {
        const item = document.createElement('div');
        item.className = 'item-lista-libro';
        const detalles = document.createElement('div');
        detalles.className = 'detalles';
        detalles.textContent = `[${u.id}] ${u.nickname}`;
        item.appendChild(detalles);
        const acciones = document.createElement('div');
        acciones.className = 'acciones';
        const bE = document.createElement('button');
        bE.className = 'boton-accion-base gestionar';
        bE.textContent = 'Editar';
        bE.onclick = async () => {
            const nuevo = prompt('Nuevo nickname', u.nickname);
            if (nuevo !== null) {
                await editarUsuarioAdmin(u.id, { nickname: nuevo });
                renderizarPanelAdmin();
            }
        };
        const bD = document.createElement('button');
        bD.className = 'boton-accion-base eliminar';
        bD.textContent = 'Eliminar';
        bD.onclick = async () => {
            if (confirm('¿Eliminar usuario?')) {
                await eliminarUsuarioAdmin(u.id);
                renderizarPanelAdmin();
            }
        };
        acciones.appendChild(bE);
        acciones.appendChild(bD);
        item.appendChild(acciones);
        divUsuarios.appendChild(item);
    });

    const divSol = document.getElementById('admin-lista-solicitudes');
    const solicitudes = await listarSolicitudesAdmin();
    divSol.innerHTML = '';
    solicitudes.forEach(s => {
        const item = document.createElement('div');
        item.className = 'item-lista-libro';
        const detalles = document.createElement('div');
        detalles.className = 'detalles';
        detalles.textContent = `[${s.id}] libro ${s.libro_id} - ${s.estado_solicitud}`;
        item.appendChild(detalles);
        const acciones = document.createElement('div');
        acciones.className = 'acciones';
        const bE = document.createElement('button');
        bE.className = 'boton-accion-base gestionar';
        bE.textContent = 'Editar';
        bE.onclick = async () => {
            const nuevo = prompt('Nuevo estado', s.estado_solicitud);
            if (nuevo !== null) {
                await editarSolicitudAdmin(s.id, { estado_solicitud: nuevo });
                renderizarPanelAdmin();
            }
        };
        const bD = document.createElement('button');
        bD.className = 'boton-accion-base eliminar';
        bD.textContent = 'Eliminar';
        bD.onclick = async () => {
            if (confirm('¿Eliminar solicitud?')) {
                await eliminarSolicitudAdmin(s.id);
                renderizarPanelAdmin();
            }
        };
        acciones.appendChild(bE);
        acciones.appendChild(bD);
        item.appendChild(acciones);
        divSol.appendChild(item);
    });

    const divNot = document.getElementById('admin-lista-notificaciones');
    const notas = await listarNotificacionesAdmin();
    divNot.innerHTML = '';
    notas.forEach(n => {
        const item = document.createElement('div');
        item.className = 'item-lista-libro';
        const detalles = document.createElement('div');
        detalles.className = 'detalles';
        detalles.textContent = `[${n.id}] ${n.mensaje}`;
        item.appendChild(detalles);
        const acciones = document.createElement('div');
        acciones.className = 'acciones';
        const bE = document.createElement('button');
        bE.className = 'boton-accion-base gestionar';
        bE.textContent = 'Editar';
        bE.onclick = async () => {
            const nuevo = prompt('Nuevo mensaje', n.mensaje);
            if (nuevo !== null) {
                await editarNotificacionAdmin(n.id, { mensaje: nuevo });
                renderizarPanelAdmin();
            }
        };
        const bD = document.createElement('button');
        bD.className = 'boton-accion-base eliminar';
        bD.textContent = 'Eliminar';
        bD.onclick = async () => {
            if (confirm('¿Eliminar notificación?')) {
                await eliminarNotificacionAdmin(n.id);
                renderizarPanelAdmin();
            }
        };
        acciones.appendChild(bE);
        acciones.appendChild(bD);
        item.appendChild(acciones);
        divNot.appendChild(item);
    });
}

window.renderizarVistaRanking = renderizarVistaRanking;
window.renderizarListaNotificaciones = renderizarListaNotificaciones;
window.renderizarNovedadesPendientes = renderizarNovedadesPendientes;
window.renderizarPanelAdmin = renderizarPanelAdmin;
window.renderizarVistaDetalleLibro = renderizarVistaDetalleLibro;
