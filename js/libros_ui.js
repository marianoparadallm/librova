// js/libros_ui.js
console.log("DEBUG: libros_ui.js - Cargado.");

async function cargarYMostrarLibros(append = false) {
    console.log("DEBUG: libros_ui.js - Cargando y mostrando libros (lista general)...");
    if (!supabaseClientInstance) { console.error("DEBUG: libros_ui.js - Supabase no inicializado."); return; }
    const listaLibrosDiv = document.getElementById('lista-libros-disponibles');
    if (!listaLibrosDiv) { console.error("DEBUG: libros_ui.js - Div 'lista-libros-disponibles' no encontrado."); return; }
    const btnVerMas = document.getElementById('btn-ver-mas');
    try {
        if (!append) {
            listaLibrosDiv.innerHTML = 'Buscando libros en la biblioteca...';
            paginaLibros = 0;
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
            librosFiltrados = libros || [];
        }

        const filtroOrden = document.getElementById('filtro-orden');
        if (filtroOrden) {
            switch(filtroOrden.value) {
                case 'antiguos':
                    librosFiltrados.sort((a,b)=> new Date(a.created_at) - new Date(b.created_at));
                    break;
                case 'fechadev':
                    librosFiltrados.sort((a,b)=>{
                        const ad = a.fecha_limite_devolucion || '';
                        const bd = b.fecha_limite_devolucion || '';
                        return ad.localeCompare(bd);
                    });
                    break;
                case 'usuario':
                    librosFiltrados.sort((a,b)=>{
                        const an = a.propietario?.nickname?.toLowerCase() || '';
                        const bn = b.propietario?.nickname?.toLowerCase() || '';
                        return an.localeCompare(bn);
                    });
                    break;
                default:
                    librosFiltrados.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
            }
        }

        const inicio = paginaLibros * TAMANO_PAGINA_LIBROS;
        const fin = inicio + TAMANO_PAGINA_LIBROS;
        const aMostrar = librosFiltrados.slice(inicio, fin);

        if (!append) listaLibrosDiv.innerHTML = '';
        aMostrar.forEach(libro => {
            const card = document.createElement('div');
            card.className = 'libro-card';
            if (libro.estado !== 'disponible') card.classList.add('no-disponible');
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

                if (currentUser && currentUser.id !== libro.propietario_id && (libro.estado === 'disponible' || libro.estado === 'solicitado')) {
                    const btn = document.createElement('button');
                    btn.className = 'btn-pedir-prestamo boton-accion-base pedir';
                    btn.textContent = 'Pedir';
                    card.appendChild(btn);
                }
                if (currentUser && currentUser.id === libro.propietario_id && libro.estado === 'prestado' && libro.esta_con_usuario_id) {
                    const btn = document.createElement('button');
                    btn.className = 'btn-marcar-devuelto boton-accion-base devolver';
                    btn.textContent = 'Devolver';
                    card.appendChild(btn);
                }
                if (currentUser && currentUser.id === libro.propietario_id && (libro.estado === 'disponible' || libro.estado === 'solicitado')) {
                    const btn = document.createElement('button');
                    btn.className = 'btn-gestionar-libro boton-accion-base gestionar';
                    btn.textContent = 'Gestionar (Mío)';
                    card.appendChild(btn);
                }

                card.addEventListener('click', (e) => {
                    if (!e.target.closest('button')) {
                        renderizarVistaDetalleLibro(libro.id);
                    }
                });

                listaLibrosDiv.appendChild(card);
        });
        asignarEventListenersLibros();
        paginaLibros++;
        if (btnVerMas) {
            if (fin >= librosFiltrados.length) {
                btnVerMas.style.display = 'none';
            } else {
                btnVerMas.style.display = 'block';
            }
        }

    } catch (error) {
        console.error("DEBUG: libros_ui.js - Error al cargar libros:", error);
        listaLibrosDiv.innerHTML = '<p style="color:red;">Error al cargar los libros.</p>';
        if (btnVerMas) btnVerMas.style.display = 'none';
    }
}

function asignarEventListenersLibros() {
    console.log("DEBUG: libros_ui.js - Asignando event listeners a botones de libros y solicitudes.");
    document.removeEventListener("click", delegarClicksLibros);
    document.addEventListener("click", delegarClicksLibros);
}

async function delegarClicksLibros(event) {
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
    } else if (event.target.closest("#lista-libros-disponibles .libro-card") && !event.target.closest('button')) {
        const libroCard = event.target.closest('.libro-card');
        if (libroCard) {
            const libroId = libroCard.dataset.libroId;
            renderizarVistaDetalleLibro(libroId);
        }
    } else if (event.target.closest("#lista-novedades .btn-aceptar-solicitud")) {
        const itemSolicitud = event.target.closest(".item-solicitud");
        const solicitudId = itemSolicitud.dataset.solicitudId;
        const libroId = itemSolicitud.dataset.libroId;
        const solicitanteId = itemSolicitud.dataset.solicitanteId;
        const propietarioId = itemSolicitud.dataset.propietarioId;
        const libroTitulo = itemSolicitud.querySelector("strong") ? itemSolicitud.querySelector("strong").textContent : "este libro";
        const solicitanteNicknameElement = itemSolicitud.querySelector(".detalles span:nth-child(2)");
        const solicitanteNickname = solicitanteNicknameElement ? solicitanteNicknameElement.textContent.replace("Solicitado por: ", "").trim() : "Alguien";
        console.log(`DEBUG: libros_ui.js - Aceptar solicitud ID: ${solicitudId}`);
        await responderSolicitudPrestamo(
            solicitudId,
            libroId,
            solicitanteId,
            propietarioId,
            "aceptada",
            libroTitulo,
            solicitanteNickname
        );
        if (itemSolicitud) {
            itemSolicitud.remove();
            recargarSeccionesPrestamosDashboard();
        }
    } else if (event.target.closest("#lista-novedades .btn-rechazar-solicitud")) {
        const itemSolicitud = event.target.closest(".item-solicitud");
        const solicitudId = itemSolicitud.dataset.solicitudId;
        const solicitanteId = itemSolicitud.dataset.solicitanteId;
        const propietarioId = itemSolicitud.dataset.propietarioId;
        const libroTitulo = itemSolicitud.querySelector("strong") ? itemSolicitud.querySelector("strong").textContent : "este libro";
        const solicitanteNicknameElement = itemSolicitud.querySelector(".detalles span:nth-child(2)");
        const solicitanteNickname = solicitanteNicknameElement ? solicitanteNicknameElement.textContent.replace("Solicitado por: ", "").trim() : "Alguien";
        console.log(`DEBUG: libros_ui.js - Rechazar solicitud ID: ${solicitudId}`);
        await responderSolicitudPrestamo(
            solicitudId,
            null,
            solicitanteId,
            propietarioId,
            "rechazada",
            libroTitulo,
            solicitanteNickname
        );
        if (itemSolicitud) {
            itemSolicitud.remove();
            recargarSeccionesPrestamosDashboard();
        }

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
