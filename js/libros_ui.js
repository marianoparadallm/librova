// js/libros_ui.js
console.log("DEBUG: libros_ui.js - Cargado.");

async function cargarYMostrarLibros() {
    // ... (Misma función cargarYMostrarLibros que tenías)
    console.log("DEBUG: libros_ui.js - Cargando y mostrando libros...");
    if (!supabaseClientInstance) { console.error("DEBUG: libros_ui.js - Supabase no inicializado."); return; }
    const listaLibrosDiv = document.getElementById('lista-libros-disponibles');
    if (!listaLibrosDiv) { console.error("DEBUG: libros_ui.js - Div 'lista-libros-disponibles' no encontrado."); return; }
    listaLibrosDiv.innerHTML = 'Buscando libros en la biblioteca...';
    try {
        const { data: libros, error } = await supabaseClientInstance.from('libros').select(`id, titulo, foto_url, estado, propietario_id, fecha_limite_devolucion, esta_con_usuario_id, propietario:usuarios!propietario_id ( nickname ), prestado_a:usuarios!esta_con_usuario_id ( nickname )`).order('created_at', { ascending: false });
        if (error) { throw error; }
        if (libros && libros.length > 0) {
            listaLibrosDiv.innerHTML = ''; libros.forEach(libro => {
                const propietarioNombre = libro.propietario ? libro.propietario.nickname : 'Desconocido';
                let infoPrestamoHTML = '';
                if (libro.estado === 'prestado') { const nombrePrestadoA = libro.prestado_a ? libro.prestado_a.nickname : 'Alguien'; const fechaDev = libro.fecha_limite_devolucion ? new Date(libro.fecha_limite_devolucion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Fecha no definida'; infoPrestamoHTML = `<p class="libro-info-prestamo">Prestado a: ${nombrePrestadoA}<br>Devolver el: ${fechaDev}</p>`;}
                const libroCardHTML = `<div class="libro-card" data-libro-id="${libro.id}" data-propietario-id="${libro.propietario_id}"><img src="${libro.foto_url}" alt="Portada de ${libro.titulo}" class="libro-portada"><h4 class="libro-titulo">${libro.titulo}</h4><p class="libro-propietario">Dueño: ${propietarioNombre}</p><p class="libro-estado">Estado: ${libro.estado}</p>${infoPrestamoHTML}${currentUser && currentUser.id !== libro.propietario_id && libro.estado === 'disponible' ? '<button class="btn-pedir-prestado boton-menu-header">Pedir Prestado</button>' : ''}${currentUser && currentUser.id === libro.propietario_id && libro.estado === 'prestado' && libro.esta_con_usuario_id ? '<button class="btn-marcar-devuelto boton-menu-header">Marcar como Devuelto</button>' : ''}${currentUser && currentUser.id === libro.propietario_id && libro.estado === 'disponible' ? '<button class="btn-gestionar-libro boton-menu-header">Gestionar (Mío)</button>' : ''}</div>`; // currentUser es global
                listaLibrosDiv.innerHTML += libroCardHTML;});
            asignarEventListenersLibros(); // Asume que asignarEventListenersLibros es global
        } else { listaLibrosDiv.innerHTML = '<p>Aún no hay libros en la biblioteca. ¡Sé el primero en cargar uno!</p>'; }
    } catch (error) { console.error("DEBUG: libros_ui.js - Error al cargar libros:", error); listaLibrosDiv.innerHTML = '<p style="color:red;">Error al cargar los libros.</p>';}
}

function asignarEventListenersLibros() { 
    // ... (Misma función asignarEventListenersLibros que tenías)
    document.querySelectorAll('.btn-pedir-prestado').forEach(boton => { boton.addEventListener('click', async (event) => { if (!currentUser) { /* No alert */ console.error("Login requerido"); renderizarVistaBienvenida(); return; } const libroCard = event.target.closest('.libro-card'); const libroId = libroCard.dataset.libroId; const propietarioId = libroCard.dataset.propietarioId; if (confirm(`¿Seguro que quieres pedir prestado el libro "${libroCard.querySelector('.libro-titulo').textContent}"?`)) { await pedirLibroPrestado(libroId, propietarioId); }});}); // Asume pedirLibroPrestado global
    document.querySelectorAll('.btn-gestionar-libro').forEach(boton => { boton.addEventListener('click', (event) => { const libroCard = event.target.closest('.libro-card'); const libroId = libroCard.dataset.libroId; console.log(`DEBUG: Gestionar libro ID: ${libroId}`); const vistaActivaActual = document.querySelector('.vista.activa'); cambiarVista(vistaActivaActual ? vistaActivaActual.id : null, 'vista-gestionar-libro-propio');});}); // Asume cambiarVista global
    document.querySelectorAll('.btn-marcar-devuelto').forEach(boton => { boton.addEventListener('click', async (event) => { const libroCard = event.target.closest('.libro-card'); const libroId = libroCard.dataset.libroId; if (confirm(`¿Confirmas que el libro "${libroCard.querySelector('.libro-titulo').textContent}" ha sido devuelto?`)) { await marcarLibroComoDevuelto(libroId); }});}); // Asume marcarLibroComoDevuelto global
}

async function cargarMisLibrosEnPrestamo(userId) {
    // ... (Misma función cargarMisLibrosEnPrestamo que tenías)
    if (!supabaseClientInstance) return [];
    const { data, error } = await supabaseClientInstance.from('libros').select(`id, titulo, foto_url, fecha_limite_devolucion, prestado_a:usuarios!esta_con_usuario_id ( nickname )`).eq('propietario_id', userId).eq('estado', 'prestado');
    if (error) { console.error("Error cargando mis libros prestados:", error); return []; }
    return data || [];
}

async function cargarLibrosQueMePrestaron(userId) {
    // ... (Misma función cargarLibrosQueMePrestaron que tenías)
    if (!supabaseClientInstance) return [];
    const { data, error } = await supabaseClientInstance.from('libros').select(`id, titulo, foto_url, fecha_limite_devolucion, propietario:usuarios!propietario_id ( nickname )`).eq('esta_con_usuario_id', userId).eq('estado', 'prestado');
    if (error) { console.error("Error cargando libros que me prestaron:", error); return []; }
    return data || [];
}