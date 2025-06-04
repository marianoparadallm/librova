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
            .select(`id, titulo, foto_url, estado, propietario_id, fecha_limite_devolucion, esta_con_usuario_id, propietario:usuarios!propietario_id ( nickname ), prestado_a:usuarios!esta_con_usuario_id ( nickname )`)
            .order('created_at', { ascending: false });
        if (error) { throw error; }
        if (libros && libros.length > 0) {
            listaLibrosDiv.innerHTML = ''; 
            libros.forEach(libro => {
                const propietarioNombre = libro.propietario ? libro.propietario.nickname : 'Desconocido';
                let infoPrestamoHTML = '';
                if (libro.estado === 'prestado') { 
                    const nombrePrestadoA = libro.prestado_a ? libro.prestado_a.nickname : 'Alguien'; 
                    const fechaDev = libro.fecha_limite_devolucion ? new Date(libro.fecha_limite_devolucion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Fecha no definida';
                    infoPrestamoHTML = `<p class="libro-info-prestamo">Prestado a: ${nombrePrestadoA}<br>Devolver el: ${fechaDev}</p>`;
                }
                const libroCardHTML = `
                <div class="libro-card" data-libro-id="${libro.id}" data-propietario-id="${libro.propietario_id}">
                    {/* ... imagen, titulo, etc. ... */}
                    ${currentUser && currentUser.id !== libro.propietario_id && libro.estado === 'disponible' ? 
                        '<button class="btn-pedir-prestado boton-accion-base pedir">Pedir Prestado</button>' : ''}
                    ${currentUser && currentUser.id === libro.propietario_id && libro.estado === 'prestado' && libro.esta_con_usuario_id ? 
                        '<button class="btn-marcar-devuelto boton-accion-base devolver">Marcar como Devuelto</button>' : ''}
                    ${currentUser && currentUser.id === libro.propietario_id && libro.estado === 'disponible' ? 
                        '<button class="btn-gestionar-libro boton-accion-base gestionar">Gestionar (Mío)</button>' : ''}
                </div>`;
                listaLibrosDiv.innerHTML += libroCardHTML;
            });
            asignarEventListenersLibros(); // Llama a la función para asignar listeners a estos botones
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
    // Listeners para la lista general de libros
    document.querySelectorAll('#lista-libros-disponibles .btn-pedir-prestado').forEach(boton => { 
        boton.addEventListener('click', async (event) => { 
            if (!currentUser) { console.error("Login requerido"); renderizarVistaBienvenida(); return; } 
            const libroCard = event.target.closest('.libro-card'); 
            const libroId = libroCard.dataset.libroId; 
            const propietarioId = libroCard.dataset.propietarioId; 
            if (confirm(`¿Seguro que quieres pedir prestado el libro "${libroCard.querySelector('.libro-titulo').textContent}"?`)) { 
                await pedirLibroPrestamo(libroId, propietarioId); 
            }
        });
    });
    document.querySelectorAll('#lista-libros-disponibles .btn-gestionar-libro').forEach(boton => { 
        boton.addEventListener('click', (event) => { 
            const libroCard = event.target.closest('.libro-card'); 
            const libroId = libroCard.dataset.libroId; 
            console.log(`DEBUG: libros_ui.js - Gestionar libro ID: ${libroId} desde lista general.`); 
            renderizarDetallesGestionLibro(libroId);
        });
    });
    
    // Listeners para la lista de "Mis Libros Prestados a Otros" (botones "Marcar Devuelto")
    document.querySelectorAll('#mis-libros-en-prestamo .btn-marcar-devuelto').forEach(boton => { 
        boton.addEventListener('click', async (event) => { 
            const itemLibro = event.target.closest('.item-lista-libro'); // o '.libro-card' si reutilizas esa clase
            const libroId = itemLibro.dataset.libroId; 
            if (confirm(`¿Confirmas que el libro "${itemLibro.querySelector('strong').textContent}" ha sido devuelto?`)) { 
                await marcarLibroComoDevuelto(libroId); 
            }
        });
    });

    // Listeners para la lista de "Solicitudes de Préstamo Recibidas"
    document.querySelectorAll('#solicitudes-prestamo-recibidas .btn-aceptar-solicitud').forEach(boton => {
        boton.addEventListener('click', async (event) => {
            const itemSolicitud = event.target.closest('.item-solicitud');
            const solicitudId = itemSolicitud.dataset.solicitudId;
            const libroId = itemSolicitud.dataset.libroId;
            const solicitanteId = itemSolicitud.dataset.solicitanteId;
            // propietarioId no es necesario aquí si la lógica de responderSolicitudPrestamo ya la tiene
            // o la puede inferir.
            console.log(`DEBUG: libros_ui.js - Aceptar solicitud ID: ${solicitudId}`);
            await responderSolicitudPrestamo(solicitudId, libroId, solicitanteId, currentUser.id, 'aceptada');
        });
    });
    document.querySelectorAll('#solicitudes-prestamo-recibidas .btn-rechazar-solicitud').forEach(boton => {
        boton.addEventListener('click', async (event) => {
            const itemSolicitud = event.target.closest('.item-solicitud');
            const solicitudId = itemSolicitud.dataset.solicitudId;
            // No necesitamos más datos para rechazar, solo el ID de la solicitud.
            console.log(`DEBUG: libros_ui.js - Rechazar solicitud ID: ${solicitudId}`);
            await responderSolicitudPrestamo(solicitudId, null, null, currentUser.id, 'rechazada');
        });
    });
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

// --- DEFINICIÓN DE cargarSolicitudesRecibidas ---
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
            throw error;
        }
        console.log("DEBUG: libros_ui.js - Solicitudes recibidas cargadas:", data);
        return data || [];
    } catch (error) {
        console.error("DEBUG: libros_ui.js - Error general al cargar solicitudes recibidas:", error);
        return [];
    }
}
