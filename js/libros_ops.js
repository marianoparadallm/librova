// js/libros_ops.js
console.log("DEBUG: libros_ops.js - Cargado.");

async function pedirLibroPrestado(libroId, propietarioIdLibro) {
    // Registrar solicitud de préstamo en lugar de actualizar el libro directamente
    console.log(`DEBUG: libros_ops.js - Intentando pedir prestado libro ID: ${libroId}, del propietario ID: ${propietarioIdLibro}`);
    if (!currentUser || !currentUser.id) { /* No alert */ console.error("Error de sesión."); return; }
    if (!supabaseClientInstance) { /* No alert */ console.error("Error de conexión."); return; }
    if (currentUser.reputacion <= -3) { /* No alert */ console.warn("Límite de préstamos alcanzado."); return; }

    const botonesLibro = document.querySelectorAll(`.libro-card[data-libro-id="${libroId}"] button`);
    botonesLibro.forEach(b => b.disabled = true);
    let solicitudExitosa = false;
    try {
        const { error } = await supabaseClientInstance
            .from('solicitudes_prestamo')
            .insert([{ libro_id: libroId, propietario_id: propietarioIdLibro, solicitante_id: currentUser.id, fecha_solicitud: new Date().toISOString(), estado_solicitud: 'pendiente' }]);
        if (error) throw error;
        solicitudExitosa = true;
        console.log(`DEBUG: libros_ops.js - Solicitud de préstamo registrada para libro ID: ${libroId}`);
    } catch (error) {
        console.error("DEBUG: libros_ops.js - Error al solicitar préstamo:", error);
    } finally {
        botonesLibro.forEach(b => b.disabled = false);
        if (solicitudExitosa) alert('Solicitud de préstamo enviada.');
    }
}

async function marcarLibroComoDevuelto(libroId) {
    // ... (Misma función marcarLibroComoDevuelto que tenías)
    console.log(`DEBUG: libros_ops.js - Intentando marcar devuelto libro ID: ${libroId}`);
    if (!currentUser || !currentUser.id) { console.error("Error de sesión."); return; }
    if (!supabaseClientInstance) { console.error("Error de conexión."); return; }
    console.log(`DEBUG: libros_ops.js - ID del usuario (propietario devolviendo): ${currentUser.id}`);
    try {
        const { error, count } = await supabaseClientInstance.from('libros').update({ estado: 'disponible', esta_con_usuario_id: null, fecha_limite_devolucion: null }).eq('id', libroId).eq('propietario_id', currentUser.id).eq('estado', 'prestado');
        if (error) throw error;
        if (count === 0 || count === null) { console.warn(`DEBUG: libros_ops.js - No se actualizó libro ID: ${libroId} a devuelto.`); /* No alert */ }
        else { console.log(`DEBUG: libros_ops.js - Libro ID: ${libroId} marcado como 'disponible'.`); /* No alert */ }
    } catch (error) { console.error("DEBUG: libros_ops.js - Error al marcar devuelto:", error); /* No alert */ } 
    finally { cargarYMostrarLibros(); } // Asume cargarYMostrarLibros es global
}

async function responderSolicitudPrestamo(solicitudId, libroId, solicitanteId, propietarioId, nuevoEstado, libroTitulo, solicitanteNickname) {
    console.log(`DEBUG: libros_ops.js - Respondiendo solicitud ${solicitudId} con estado ${nuevoEstado}`);
    if (!supabaseClientInstance || !currentUser) { console.error("DEBUG: libros_ops.js - Supabase o usuario no inicializado."); return; }
    try {
        const { error } = await supabaseClientInstance
            .from("solicitudes_prestamo")
            .update({ estado_solicitud: nuevoEstado })
            .eq("id", solicitudId);
        if (error) throw error;
        if (nuevoEstado === "aceptada" && libroId) {
            const fechaDev = new Date();
            fechaDev.setDate(fechaDev.getDate() + 14);
            await supabaseClientInstance.from("libros")
                .update({ estado: "prestado", esta_con_usuario_id: solicitanteId, fecha_limite_devolucion: fechaDev.toISOString() })
                .eq("id", libroId)
                .eq("propietario_id", propietarioId);
        }
        console.log(`DEBUG: libros_ops.js - Solicitud ${solicitudId} actualizada a ${nuevoEstado}.`);
    } catch (err) {
        console.error("DEBUG: libros_ops.js - Error procesando solicitud:", err);
    } finally {
        cargarSolicitudesRecibidas(currentUser.id).then(s => {
            renderizarListaSolicitudesRecibidas("solicitudes-prestamo-recibidas", s);
            asignarEventListenersLibros();
        });
        cargarYMostrarLibros();
        actualizarMenuPrincipal();
    }
}


async function handleAnadirLibroSubmit(event) {
    // ... (Misma función handleAnadirLibroSubmit que tenías)
    event.preventDefault(); console.log("DEBUG: libros_ops.js - Guardando nuevo libro...");
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return; }
    const titulo = document.getElementById('libro-titulo').value; const fotoInput = document.getElementById('libro-foto'); const fotoFile = fotoInput.files[0];
    if (!titulo || !fotoFile) { alert("Por favor, completa el título y selecciona una foto."); return; }
    if (!currentUser || !currentUser.id) { alert("Error: No se pudo identificar al usuario."); renderizarVistaBienvenida(); return; } // Asume renderizarVistaBienvenida es global
    const submitButton = event.target.querySelector('button[type="submit"]'); submitButton.disabled = true; submitButton.textContent = 'Guardando...';
    try {
        const nombreArchivoFoto = `${currentUser.id}_${Date.now()}_${fotoFile.name}`;
        const { error: errorSubida } = await supabaseClientInstance.storage.from('portadas-libros').upload(nombreArchivoFoto, fotoFile, { cacheControl: '3600', upsert: false });
        if (errorSubida) { throw errorSubida; }
        const { data: dataUrlPublica } = supabaseClientInstance.storage.from('portadas-libros').getPublicUrl(nombreArchivoFoto);
        const urlFotoPublica = dataUrlPublica.publicUrl; console.log("DEBUG: libros_ops.js - Foto subida, URL pública:", urlFotoPublica);
        const { error: errorLibro } = await supabaseClientInstance.from('libros').insert([{ titulo: titulo, foto_url: urlFotoPublica, google_link: `https://www.google.com/search?q=${encodeURIComponent(titulo)}`, propietario_id: currentUser.id, propietario_avatar: currentUser.nombre_avatar, estado: 'disponible' }]).select();
        if (errorLibro) { throw errorLibro; }
        console.log("Libro añadido exitosamente."); document.getElementById('form-anadir-libro').reset();
        const previewFoto = document.getElementById('libro-foto-preview'); if(previewFoto) { previewFoto.src = '#'; previewFoto.style.display = 'none'; }
        renderizarDashboard(); // Asume renderizarDashboard es global
    } catch (error) { console.error("DEBUG: libros_ops.js - Error al guardar el libro:", error); 
    } finally { submitButton.disabled = false; submitButton.textContent = 'Guardar Libro'; }
}