// js/libros_ui.js
console.log("DEBUG: libros_ui.js - Cargado.");

async function cargarYMostrarLibros() {
    console.log("DEBUG: libros_ui.js - Cargando y mostrando libros (lista general)...");
    if (!supabaseClientInstance) { console.error("DEBUG: libros_ui.js - Supabase no inicializado."); return; }
    const listaLibrosDiv = document.getElementById('lista-libros-disponibles');
    if (!listaLibrosDiv) { console.error("DEBUG: libros_ui.js - Div 'lista-libros-disponibles' no encontrado."); return; }
    listaLibrosDiv.innerHTML = 'Buscando libros en la biblioteca...';
    try {
        const { data: libros, error } = await supabaseClientInstance.from('libros')
            .select(`
                id, 
                titulo, 
                foto_url, 
                estado, 
                propietario_id,
                fecha_limite_devolucion,
                created_at,
                esta_con_usuario_id,
                propietario:usuarios!propietario_id ( nickname ), 
                prestado_a:usuarios!esta_con_usuario_id ( nickname )
            `)
            .order('created_at', { ascending: false });
        if (error) { throw error; }
        let filtrados = libros || [];
        const filtroDueno = document.getElementById('filtro-dueno');
        const filtroFechaDev = document.getElementById('filtro-fecha-dev');
        const filtroOrden = document.getElementById('filtro-orden');
        if (filtroDueno && filtroDueno.value) {
            const d = filtroDueno.value.toLowerCase();
            filtrados = filtrados.filter(l => l.propietario && l.propietario.nickname.toLowerCase().includes(d));
        }
        if (filtroFechaDev && filtroFechaDev.value) {
            const f = filtroFechaDev.value;
            filtrados = filtrados.filter(l => l.fecha_limite_devolucion && l.fecha_limite_devolucion.slice(0,10) <= f);
        }
        if (filtroOrden && filtroOrden.value === 'antiguos') {
            filtrados.sort((a,b)=> new Date(a.created_at) - new Date(b.created_at));
        } else {
            filtrados.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
        }
        if (filtrados.length > 0) {
            listaLibrosDiv.innerHTML = '';
            filtrados.forEach(libro => {
                const propietarioNombre = libro.propietario ? libro.propietario.nickname : 'Desconocido';

                const card = document.createElement('div');
                card.className = 'libro-card';
                card.dataset.libroId = libro.id;
                card.dataset.propietarioId = libro.propietario_id;

                const img = document.createElement('img');
                img.src = libro.foto_url;
                img.alt = `Portada de ${libro.titulo}`;
                img.className = 'libro-portada';
                card.appendChild(img);

                const titulo = document.createElement('h4');
                titulo.className = 'libro-titulo';
                titulo.textContent = libro.titulo;
                card.appendChild(titulo);

                const propietario = document.createElement('p');
                propietario.className = 'libro-propietario';
                propietario.textContent = `Dueño: ${propietarioNombre}`;
                card.appendChild(propietario);

                const estado = document.createElement('p');
                estado.className = 'libro-estado';
                estado.textContent = `Estado: ${libro.estado}`;
                card.appendChild(estado);

                if (libro.estado === 'prestado') {
                    const prestamoInfo = document.createElement('p');
                    prestamoInfo.className = 'libro-info-prestamo';
                    const nombrePrestadoA = libro.prestado_a ? libro.prestado_a.nickname : 'Alguien';
                    const fechaDev = libro.fecha_limite_devolucion ? new Date(libro.fecha_limite_devolucion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Fecha no definida';
                    prestamoInfo.append(`Prestado a: ${nombrePrestadoA}`);
                    prestamoInfo.appendChild(document.createElement('br'));
                    prestamoInfo.append(`Devolver el: ${fechaDev}`);
                    card.appendChild(prestamoInfo);
                }

                if (currentUser && currentUser.id !== libro.propietario_id && (libro.estado === 'disponible' || libro.estado === 'solicitado')) {
                    const btn = document.createElement('button');
                    btn.className = 'btn-pedir-prestamo boton-accion-base pedir';
                    btn.textContent = 'Pedir Prestamo';
                    card.appendChild(btn);
                }
                if (currentUser && currentUser.id === libro.propietario_id && libro.estado === 'prestado' && libro.esta_con_usuario_id) {
                    const btn = document.createElement('button');
                    btn.className = 'btn-marcar-devuelto boton-accion-base devolver';
                    btn.textContent = 'Marcar como Devuelto';
                    card.appendChild(btn);
                }
                if (currentUser && currentUser.id === libro.propietario_id && (libro.estado === 'disponible' || libro.estado === 'solicitado')) {
                    const btn = document.createElement('button');
                    btn.className = 'btn-gestionar-libro boton-accion-base gestionar';
                    btn.textContent = 'Gestionar (Mío)';
                    card.appendChild(btn);
                }

                listaLibrosDiv.appendChild(card);
            });
            asignarEventListenersLibros();
        } else {
            listaLibrosDiv.innerHTML = '<p>Aún no hay libros en la biblioteca. ¡Sé el primero en cargar uno!</p>';
        }

    } catch (error) {
        console.error("DEBUG: libros_ui.js - Error al cargar libros:", error);
        listaLibrosDiv.innerHTML = '<p style="color:red;">Error al cargar los libros.</p>';
    }
}

function asignarEventListenersLibros() {
    console.log("DEBUG: libros_ui.js - Asignando event listeners a botones de libros y solicitudes.");
    document.removeEventListener("click", delegarClicksLibros);
    document.addEventListener("click", delegarClicksLibros);
}

function delegarClicksLibros(event) {
    if (event.target.closest("#lista-libros-disponibles .btn-pedir-prestamo")) {
        const libroCard = event.target.closest(".libro-card");
        if (!currentUser) { console.error("Login requerido"); renderizarVistaBienvenida(); return; }
        const libroId = libroCard.dataset.libroId;
        const propietarioId = libroCard.dataset.propietarioId;
        const tituloLibroElement = libroCard.querySelector(".libro-titulo");
        const tituloLibro = tituloLibroElement ? tituloLibroElement.textContent : "este libro";
        if (confirm(`¿Seguro que quieres pedir prestado el libro "${tituloLibro}"?`)) {
            pedirLibroPrestado(libroId, propietarioId, tituloLibro);
        }
    } else if (event.target.closest("#lista-libros-disponibles .btn-gestionar-libro")) {
        const libroCard = event.target.closest(".libro-card");
        if (!libroCard) return;
        const libroId = libroCard.dataset.libroId;
        console.log(`DEBUG: libros_ui.js - Gestionar libro ID: ${libroId} desde lista general.`);
        renderizarDetallesGestionLibro(libroId);
    } else if (event.target.closest(".btn-marcar-devuelto")) {
        const cardElement = event.target.closest(".libro-card") || event.target.closest(".item-lista-libro");
        if (!cardElement) return;
        const libroId = cardElement.dataset.libroId;
        const tituloElement = cardElement.querySelector("strong, .libro-titulo");
        const tituloConfirm = tituloElement ? tituloElement.textContent : "este libro";
        if (confirm(`¿Confirmas que el libro "${tituloConfirm}" ha sido devuelto?`)) {
            marcarLibroComoDevuelto(libroId);
        }
    } else if (event.target.closest("#solicitudes-prestamo-recibidas .btn-aceptar-solicitud")) {
        const itemSolicitud = event.target.closest(".item-solicitud");
        const solicitudId = itemSolicitud.dataset.solicitudId;
        const libroId = itemSolicitud.dataset.libroId;
        const solicitanteId = itemSolicitud.dataset.solicitanteId;
        const propietarioId = itemSolicitud.dataset.propietarioId;
        const libroTitulo = itemSolicitud.querySelector("strong") ? itemSolicitud.querySelector("strong").textContent : "este libro";
        const solicitanteNicknameElement = itemSolicitud.querySelector(".detalles span:nth-child(2)");
        const solicitanteNickname = solicitanteNicknameElement ? solicitanteNicknameElement.textContent.replace("Solicitado por: ", "").trim() : "Alguien";
        console.log(`DEBUG: libros_ui.js - Aceptar solicitud ID: ${solicitudId}`);
        responderSolicitudPrestamo(solicitudId, libroId, solicitanteId, propietarioId, "aceptada", libroTitulo, solicitanteNickname);
    } else if (event.target.closest("#solicitudes-prestamo-recibidas .btn-rechazar-solicitud")) {
        const itemSolicitud = event.target.closest(".item-solicitud");
        const solicitudId = itemSolicitud.dataset.solicitudId;
        const solicitanteId = itemSolicitud.dataset.solicitanteId;
        const propietarioId = itemSolicitud.dataset.propietarioId;
        const libroTitulo = itemSolicitud.querySelector("strong") ? itemSolicitud.querySelector("strong").textContent : "este libro";
        const solicitanteNicknameElement = itemSolicitud.querySelector(".detalles span:nth-child(2)");
        const solicitanteNickname = solicitanteNicknameElement ? solicitanteNicknameElement.textContent.replace("Solicitado por: ", "").trim() : "Alguien";
        console.log(`DEBUG: libros_ui.js - Rechazar solicitud ID: ${solicitudId}`);
        responderSolicitudPrestamo(solicitudId, null, solicitanteId, propietarioId, "rechazada", libroTitulo, solicitanteNickname);

    }
}

async function cargarMisLibrosEnPrestamo(userId) {
    console.log("DEBUG: libros_ui.js - Cargando Mis Libros Prestados a Otros para usuario:", userId);
    if (!supabaseClientInstance) return [];
    const { data, error } = await supabaseClientInstance.from('libros')
        .select(`id, titulo, foto_url, fecha_limite_devolucion, prestado_a:usuarios!esta_con_usuario_id ( nickname )`)
        .eq('propietario_id', userId)
        .eq('estado', 'prestado');
    if (error) { console.error("Error cargando mis libros prestados:", error); return []; }
    console.log("DEBUG: libros_ui.js - Mis Libros Prestados a Otros:", data);
    return data || [];
}

async function cargarLibrosQueMePrestaron(userId) {
    console.log("DEBUG: libros_ui.js - Cargando Libros que me Prestaron para usuario:", userId);
    if (!supabaseClientInstance) return [];
    const { data, error } = await supabaseClientInstance.from('libros')
        .select(`id, titulo, foto_url, fecha_limite_devolucion, propietario:usuarios!propietario_id ( nickname )`)
        .eq('esta_con_usuario_id', userId)
        .eq('estado', 'prestado');
    if (error) { console.error("Error cargando libros que me prestaron:", error); return []; }
    console.log("DEBUG: libros_ui.js - Libros que me Prestaron:", data);
    return data || [];
}

async function cargarSolicitudesRecibidas(userId) {
    console.log("DEBUG: libros_ui.js - Cargando solicitudes de préstamo recibidas para propietario ID:", userId);
    if (!supabaseClientInstance) {
        console.error("DEBUG: libros_ui.js - Supabase no está inicializado en cargarSolicitudesRecibidas.");
        return [];
    }
    try {
        const { data, error } = await supabaseClientInstance
            .from('solicitudes_prestamo')
            .select(`
                id,
                fecha_solicitud,
                libro_id,
                propietario_id,
                solicitante_id,
                libros ( titulo, foto_url ), 
                usuarios!solicitudes_prestamo_solicitante_id_fkey ( nickname )
            `)
            .eq('propietario_id', userId)
            .eq('estado_solicitud', 'pendiente')
            .order('fecha_solicitud', { ascending: true });

        if (error) {
            console.error("DEBUG: libros_ui.js - Error de Supabase al cargar solicitudes recibidas:", error);
            return [];
        }
        console.log("DEBUG: libros_ui.js - Solicitudes recibidas cargadas:", data);
        return data || [];
    } catch (errorCatch) { // Renombrado para evitar conflicto con la variable 'error' de la desestructuración
        console.error("DEBUG: libros_ui.js - Error general (catch) al cargar solicitudes recibidas:", errorCatch);
        return [];
    }
}

// Exponer helpers a nivel global
window.cargarYMostrarLibros = cargarYMostrarLibros;
window.asignarEventListenersLibros = asignarEventListenersLibros;
window.cargarMisLibrosEnPrestamo = cargarMisLibrosEnPrestamo;
window.cargarLibrosQueMePrestaron = cargarLibrosQueMePrestaron;
window.cargarSolicitudesRecibidas = cargarSolicitudesRecibidas;
