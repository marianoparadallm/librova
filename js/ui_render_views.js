// js/ui_render_views.js
console.log("DEBUG: ui_render_views.js - Cargado.");

function renderizarVistaBienvenida() { 
    console.log("DEBUG: ui_render_views.js - Renderizando HTML de todas las vistas principales.");
    if (!contenedorPrincipal) { 
        console.error("DEBUG: ui_render_views.js - Contenedor principal no encontrado."); 
        return; 
    }
    
    const parrafoCargando = document.getElementById('parrafo-carga-inicial');
    if (parrafoCargando) { 
        parrafoCargando.remove(); 
    }
    document.querySelectorAll('.vista').forEach(v => { 
        v.style.display = 'none'; 
        v.classList.remove('activa'); 
    });

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
                <p>¡Hola, explorador de historias! 👋</p>
                <p>Bienvenido a LibroVa, ¡nuestra biblioteca mágica! Acá vas a poder compartir cuentos y libros que ya leíste y descubrir nuevas aventuras que tus compañeros tienen para vos. Sumate agregando tus libros y pidiendo prestamos e intercambialos en tu clase!</p>
                <p>¿Listo para empezar a compartir y leer?</p>
            </div>
            <button id="btn-ingresar-crear-usuario" class="boton-grande">Ingresar o Crear Usuario</button>
            <button id="btn-acceso-admin" class="boton-admin">ADMIN</button>
        </div>

        <div id="vista-login-admin" class="vista">
            <h3>Login Administrador</h3>
            <form id="form-login-admin">
                <label for="admin-email">Email:</label><input type="email" id="admin-email" required><br><br>
                <label for="admin-password">Contraseña:</label><input type="password" id="admin-password" required><br><br>
                <button type="submit" class="boton-accion-base">Ingresar como Admin</button> {/* Clase base añadida */}
                <button type="button" id="btn-volver-bienvenida-admin">Volver</button> 
            </form>
        </div>

        <div id="vista-login-alumno" class="vista">
            <h3>Acceso Alumnos</h3>
            <div id="seleccion-login-registro-alumno" style="text-align:center; margin-bottom:20px;">
                <button id="btn-mostrar-form-login-avatar" class="boton-grande-secundario">Ya tengo Usuario (Ingresar)</button>
                <button id="btn-mostrar-form-registro-alumno" class="boton-grande-secundario">Soy Nuevo (Registrarme)</button>
            </div>
            <div id="contenedor-login-avatar" style="display:none;">
                <h4>Elige tu Avatar para Ingresar</h4>
                <div id="selector-avatares-login" class="contenedor-avatares">${avataresLoginHTML}</div>
                <form id="form-login-alumno-pin" style="display:none;">
                    <h4 id="avatar-seleccionado-nombre"></h4>
                    <label for="alumno-pin-login">Tu PIN (4 dígitos):</label>
                    <input type="password" id="alumno-pin-login" maxlength="4" pattern="\\d{4}" required inputmode="numeric" autocomplete="current-password"><br><br>
                    <button type="submit" class="boton-accion-base">Ingresar</button> {/* Clase base añadida */}
                    <button type="button" id="btn-cambiar-avatar">Cambiar Avatar</button>
                </form>
            </div>
            <div style="text-align:center; margin-top: 20px;">
                 <button type="button" id="btn-volver-bienvenida-alumno" class="link-button" style="margin-top:10px;">Volver a Inicio</button>
            </div>
        </div>

        <div id="vista-registro-alumno" class="vista">
            <h3>Registro de Alumno Nuevo</h3>
            <form id="form-registro-alumno">
                <label for="alumno-nickname-registro">Elige tu Nickname (único, min. 3 caracteres):</label>
                <input type="text" id="alumno-nickname-registro" required minlength="3"><br><br>
                <label for="alumno-avatar-registro">Elige tu Avatar:</label>
                <select id="alumno-avatar-registro" required></select><br><br>
                <label for="alumno-pin-registro">Crea tu PIN (4 dígitos numéricos):</label>
                <input type="password" id="alumno-pin-registro" maxlength="4" pattern="\\d{4}" required inputmode="numeric"><br><br>
                <label for="alumno-pin-confirmar">Confirma tu PIN:</label>
                <input type="password" id="alumno-pin-confirmar" maxlength="4" pattern="\\d{4}" required inputmode="numeric"><br><br>
                <button type="submit" class="boton-accion-base">Registrarme</button> {/* Clase base añadida */}
                <button type="button" id="btn-volver-a-seleccion-login-registro">Ya tengo cuenta / Volver</button>
            </form>
        </div>

        <div id="vista-dashboard" class="vista">
            {/* Contenido se llena dinámicamente por renderizarDashboard */}
        </div>

        <div id="vista-anadir-libro" class="vista">
            <h3>Añadir Nuevo Libro</h3>
            <form id="form-anadir-libro">
                <label for="libro-titulo">Título del Libro:</label><input type="text" id="libro-titulo" required><br><br>
                <label for="libro-foto">Foto de la Portada:</label>
                <input type="file" id="libro-foto" accept="image/*" capture="environment" required><br><br>
                <img id="libro-foto-preview" src="#" alt="Vista previa de la portada" style="max-width: 200px; max-height: 200px; display: none; margin-bottom:15px;"><br>
                <button type="submit" class="boton-accion-base">Guardar Libro</button> {/* Clase base añadida */}
                <button type="button" id="btn-volver-dashboard-desde-anadir">Cancelar y Volver al Dashboard</button>
            </form>
        </div>
        
        <div id="vista-gestionar-libro-propio" class="vista">
            <h3>Gestionar Mi Libro</h3>
            <div id="detalles-libro-gestion">
                <p>Cargando detalles del libro...</p>
            </div>
            <div class="gestion-libro-acciones" style="margin-top: 20px;">
                {/* Los botones de Editar/Eliminar se añadirán dinámicamente por renderizarDetallesGestionLibro */}
            </div>
            <button type="button" id="btn-volver-dashboard-desde-gestion" style="margin-top: 20px;">Volver al Dashboard</button>
        </div>
    `;
    console.log("DEBUG: ui_render_views.js - HTML de todas las vistas principales inyectado.");

    const selectAvatarRegistro = document.getElementById('alumno-avatar-registro');
    if (selectAvatarRegistro) {
        selectAvatarRegistro.innerHTML = ''; 
        AVATARES_DISPONIBLES.forEach(avatar => { 
            const optionValue = avatar.id; 
            const optionText = `${avatar.emoji} ${avatar.nombre}`;
            const optionHTML = `<option value="${optionValue}">${optionText}</option>`; 
            selectAvatarRegistro.innerHTML += optionHTML;
        });
        console.log("DEBUG: ui_render_views.js - Select de avatares para registro poblado.");
    } else { 
        console.warn("DEBUG: ui_render_views.js - No se encontró el select 'alumno-avatar-registro'."); 
    }
        
    cambiarVista(null, 'vista-bienvenida'); 
}

// Función para renderizar listas en el dashboard (Mis libros prestados, Libros que me prestaron)
function renderizarListaDashboard(divId, libros, tipoLista) {
    const div = document.getElementById(divId); 
    if (!div) { 
        console.error(`DEBUG: ui_render_views.js - Div ${divId} no encontrado para lista dashboard`); 
        return; 
    }
    div.innerHTML = ''; // Limpiar contenido previo
    if (!libros || libros.length === 0) { 
        div.innerHTML = `<p>No tienes libros en esta categoría.</p>`; 
        return; 
    }
    libros.forEach(libro => {
        let infoExtra = ''; 
        let botonHTML = '';
        const fechaDev = libro.fecha_limite_devolucion ? new Date(libro.fecha_limite_devolucion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
        
        if (tipoLista === 'prestadosPorMi') { 
            const prestatario = libro.prestado_a ? libro.prestado_a.nickname : 'Alguien'; 
            infoExtra = `<span>Prestado a: ${prestatario}</span><span>Devolver el: ${fechaDev}</span>`; 
            botonHTML = `<button class="btn-marcar-devuelto boton-accion-base" data-libro-id="${libro.id}">Marcar Devuelto</button>`; // Clase base añadida
        } else if (tipoLista === 'prestadosAMi') { 
            const dueno = libro.propietario ? libro.propietario.nickname : 'Desconocido'; 
            infoExtra = `<span>Dueño: ${dueno}</span><span>Devolver el: ${fechaDev}</span>`; 
        }
        const itemHTML = `
            <div class="item-lista-libro" data-libro-id="${libro.id}">
                <img src="${libro.foto_url || './placeholder-portada.png'}" alt="Portada de ${libro.titulo}" class="thumbnail">
                <div class="detalles">
                    <strong>${libro.titulo}</strong>
                    ${infoExtra}
                </div>
                <div class="acciones">
                    ${botonHTML}
                </div>
            </div>`;
        div.innerHTML += itemHTML;
    });
}

// Función para renderizar los detalles del libro a gestionar
async function renderizarDetallesGestionLibro(libroId) {
    console.log(`DEBUG: ui_render_views.js - Renderizando detalles para gestionar libro ID: ${libroId}`);
    const detallesDiv = document.getElementById('detalles-libro-gestion');
    const vistaGestion = document.getElementById('vista-gestionar-libro-propio');

    if (!detallesDiv || !vistaGestion) {
        console.error("DEBUG: ui_render_views.js - No se encontraron los divs para gestionar el libro.");
        return;
    }

    if (!supabaseClientInstance) { console.error("DEBUG: ui_render_views.js - Supabase no inicializado."); detallesDiv.innerHTML = "<p>Error de conexión.</p>"; return; }
    if (!currentUser) { console.error("DEBUG: ui_render_views.js - Usuario no logueado."); detallesDiv.innerHTML = "<p>Error de sesión.</p>"; return; }

    detallesDiv.innerHTML = "<p>Cargando detalles del libro...</p>";
    // Asegurar que la vista de gestión esté activa
    const vistaActivaActual = document.querySelector('.vista.activa');
    cambiarVista(vistaActivaActual ? vistaActivaActual.id : null, 'vista-gestionar-libro-propio');

    try {
        const { data: libro, error } = await supabaseClientInstance
            .from('libros')
            .select('id, titulo, foto_url, propietario_id, estado') // Añadido estado para verificar si se puede eliminar
            .eq('id', libroId)
            .eq('propietario_id', currentUser.id) 
            .single();

        if (error) {
            if (error.code === 'PGRST116') { throw new Error("Libro no encontrado o no te pertenece."); }
            throw error;
        }

        if (libro) {
            vistaGestion.querySelector('h3').textContent = `Gestionar: ${libro.titulo}`; 
            detallesDiv.innerHTML = `
                <div class="gestion-libro-info">
                    <h4>${libro.titulo}</h4>
                    <img src="${libro.foto_url}" alt="Portada de ${libro.titulo}" style="max-width: 150px; border-radius: 4px; margin-bottom: 15px;">
                    <p><strong>ID del Libro:</strong> ${libro.id}</p>
                    <p><strong>Estado actual:</strong> ${libro.estado}</p>
                </div>
                <div class="gestion-libro-acciones" style="margin-top: 20px;">
                    <button id="btn-editar-libro-info" class="boton-accion-base" data-libro-id="${libro.id}">Editar Información</button>
                    <button id="btn-eliminar-libro" class="boton-accion-base btn-eliminar" data-libro-id="${libro.id}" ${libro.estado !== 'disponible' ? 'disabled title="No se puede eliminar un libro prestado"' : ''}>Eliminar Libro</button>
                </div>
            `;

            document.getElementById('btn-editar-libro-info').onclick = () => {
                alert(`Funcionalidad "Editar Libro ID: ${libro.id}" aún no implementada.`);
            };
            document.getElementById('btn-eliminar-libro').onclick = async () => {
                alert(`Funcionalidad "Eliminar Libro ID: ${libro.id}" aún no implementada.`);
            };

        } else {
            detallesDiv.innerHTML = "<p>No se encontraron detalles para este libro o no tienes permiso para gestionarlo.</p>";
        }
    } catch (error) {
        console.error("DEBUG: ui_render_views.js - Error cargando detalles del libro para gestionar:", error);
        detallesDiv.innerHTML = `<p style="color:red;">Error al cargar detalles: ${error.message}</p>`;
    }
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
        <button id="btn-ir-anadir-libro" class="boton-accion-base">Cargar Libro</button> {/* Clase base añadida */}
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
    
    cargarMisLibrosEnPrestamo(currentUser.id).then(libros => { 
        renderizarListaDashboard('mis-libros-en-prestamo', libros, 'prestadosPorMi'); 
        asignarEventListenersLibros(); 
    });
    cargarLibrosQueMePrestaron(currentUser.id).then(libros => { 
        renderizarListaDashboard('libros-que-me-prestaron', libros, 'prestadosAMi'); 
    });
    cargarYMostrarLibros(); 
}