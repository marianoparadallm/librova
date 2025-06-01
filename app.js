// 0. DEBUG: Script app.js comenzando a cargar
console.log("DEBUG: app.js - Script iniciado.");

// 1. Configuración e Inicialización de Supabase
const SUPABASE_URL = 'https://srqdgsgxkxfiveynxkwt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWRnc2d4a3hmaXZleW54a3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mjg2MjUsImV4cCI6MjA2NDEwNDYyNX0.xenXPUm17l0LvbvUk0fsbVik3y5uKP3ADwaVN5BcKGY';
let supabaseClientInstance = null;
console.log("DEBUG: app.js - Verificando SDK global 'supabase'. typeof window.supabase:", typeof window.supabase);
if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function' && SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'TU_SUPABASE_URL') {
    try {
        supabaseClientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('DEBUG: app.js - Instancia del cliente Supabase creada exitosamente.');
    } catch (e) { console.error('DEBUG: app.js - Error al inicializar Supabase:', e); alert('Error crítico al conectar con Supabase.'); }
} else { console.error('DEBUG: app.js - Error: Supabase no pudo inicializarse.'); alert('Error crítico de configuración de Supabase.'); }

// 2. Estado Global y Constantes
let currentUser = null;
const AVATARES_DISPONIBLES = [ // TU LISTA ACTUALIZADA
    { id: 'avatar_robot', nombre: 'Robot', emoji: '🤖' }, { id: 'avatar_pelota', nombre: 'Pelota', emoji: '⚽️' },
    { id: 'avatar_perro', nombre: 'Perro', emoji: '🐶' }, { id: 'avatar_gato', nombre: 'Gato', emoji: '🐱' },
    { id: 'avatar_cohete', nombre: 'Cohete', emoji: '🚀' }, { id: 'avatar_mago', nombre: 'Mago', emoji: '🧙' },
    { id: 'avatar_unicornio', nombre: 'Unicornio', emoji: '🦄' }, { id: 'avatar_panda', nombre: 'Panda', emoji: '🐼' }
];

// 3. Selectores del DOM
const contenedorPrincipal = document.getElementById('contenedor-principal');
const menuPrincipal = document.getElementById('menu-principal');

// 4. Navegación
function cambiarVista(idVistaActual, idVistaNueva) {
    console.log(`DEBUG: app.js - Intentando cambiar de vista: ${idVistaActual || 'ninguna'} a ${idVistaNueva}`);
    if (idVistaActual) {
        const vistaActualDOM = document.getElementById(idVistaActual);
        if (vistaActualDOM) { vistaActualDOM.classList.remove('activa'); vistaActualDOM.style.display = 'none'; }
    }
    document.querySelectorAll('.vista').forEach(vista => {
        if (vista.id !== idVistaNueva) { vista.style.display = 'none'; vista.classList.remove('activa');}
    });
    const vistaNuevaDOM = document.getElementById(idVistaNueva);
    if (vistaNuevaDOM) {
        vistaNuevaDOM.style.display = 'block'; vistaNuevaDOM.classList.add('activa');
        console.log(`DEBUG: app.js - Vista activa establecida: ${idVistaNueva}`);
    } else {
        console.error(`DEBUG: app.js - Vista nueva con ID '${idVistaNueva}' no encontrada.`);
        if(contenedorPrincipal) contenedorPrincipal.innerHTML = `<p>Error: Vista ${idVistaNueva} no encontrada.</p>`;
    }
}
function actualizarMenuPrincipal() {
    console.log("DEBUG: app.js - Actualizando menú principal. Usuario actual:", currentUser);
    if (!menuPrincipal) { console.error("DEBUG: app.js - Elemento menuPrincipal no encontrado."); return; }
    menuPrincipal.innerHTML = '';
    if (currentUser) {
        const nombreMostrar = currentUser.rol === 'admin' ? 'Admin' : currentUser.nickname;
        const infoUsuario = document.createElement('span');
        const reputacionMostrar = (currentUser.reputacion !== undefined && currentUser.reputacion !== null) ? currentUser.reputacion : 0;
        infoUsuario.textContent = `Hola, ${nombreMostrar}! (Rep: ${reputacionMostrar}) `;
        menuPrincipal.appendChild(infoUsuario);
        const btnDashboard = document.createElement('button');
        btnDashboard.textContent = 'Dashboard';
        btnDashboard.onclick = () => renderizarDashboard();
        menuPrincipal.appendChild(btnDashboard);
        const btnCerrarSesion = document.createElement('button');
        btnCerrarSesion.textContent = 'Cerrar Sesión';
        btnCerrarSesion.onclick = cerrarSesion;
        menuPrincipal.appendChild(btnCerrarSesion);
    }
}

// 5. Lógica de Autenticación y Operaciones de Libros (Sin cambios en estas funciones internas por ahora)
async function cerrarSesion() { /* ... (código igual que tu última versión funcional) ... */ }
async function loginAdmin(email, password) { /* ... (código igual) ... */ }
async function registrarAlumno(nickname, idAvatarSeleccionado, pin) { /* ... (código igual) ... */ }
async function loginAlumno(nombreAvatarSeleccionado, pin) { /* ... (código igual, usa nombre_avatar) ... */ }
async function pedirLibroPrestado(libroId, propietarioIdLibro) { /* ... (código igual) ... */ }
async function marcarLibroComoDevuelto(libroId) { /* ... (código igual) ... */ }
async function handleAnadirLibroSubmit(event) { /* ... (código igual) ... */ }
// Pegando cuerpos para asegurar:
async function cerrarSesion() {
    console.log("DEBUG: app.js - Cerrando sesión...");
    if (currentUser && currentUser.rol === 'admin' && supabaseClientInstance) {
        const { error } = await supabaseClientInstance.auth.signOut();
        if (error) { console.error('DEBUG: app.js - Error al cerrar sesión de admin:', error); /* No alert */ }
    }
    currentUser = null; localStorage.removeItem('libroVaUser');
    console.log('DEBUG: app.js - Sesión cerrada localmente.');
    renderizarVistaBienvenida();
    actualizarMenuPrincipal();
}
async function loginAdmin(email, password) {
    console.log("DEBUG: app.js - Intentando login admin con email:", email);
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return null; }
    const { data, error } = await supabaseClientInstance.auth.signInWithPassword({ email, password });
    if (error) { console.error('DEBUG: app.js - Error login Admin:', error.message); alert(`Error Admin: ${error.message}`); return null; }
    if (data.user) {
        console.log('DEBUG: app.js - Admin logueado:', data.user);
        currentUser = { id: data.user.id, email: data.user.email, rol: 'admin', reputacion: 'N/A' };
        return currentUser;
    }
    return null;
}
async function registrarAlumno(nickname, idAvatarSeleccionado, pin) {
    console.log("DEBUG: app.js - Intentando registrar alumno con nickname:", nickname, "y avatar ID:", idAvatarSeleccionado);
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return null; }
    const nicknameLimpio = nickname.trim();
    if (!nicknameLimpio || nicknameLimpio.length < 3) { alert('El Nickname debe tener al menos 3 caracteres.'); return null; }
    const avatarElegido = AVATARES_DISPONIBLES.find(a => a.id === idAvatarSeleccionado);
    if (!avatarElegido) { alert('Avatar seleccionado no es válido.'); return null; }
    const nombreAvatarParaGuardar = avatarElegido.nombre;
    let { data: usuariosConEseNickname, error: errorNicknameUnico } = await supabaseClientInstance.from('usuarios').select('id').eq('nickname', nicknameLimpio).limit(1);
    if (errorNicknameUnico) { console.error('DEBUG: app.js - Error al verificar unicidad de nickname:', errorNicknameUnico); alert('Error al registrar. Intenta de nuevo.'); return null; }
    if (usuariosConEseNickname && usuariosConEseNickname.length > 0) { alert('Ese Nickname ya está en uso. Por favor, elige otro.'); return null; }
    const { data, error } = await supabaseClientInstance.from('usuarios').insert([{ nickname: nicknameLimpio, nombre_avatar: nombreAvatarParaGuardar, pin: pin, rol: 'alumno', reputacion: 0 }]).select().single();
    if (error) { console.error('DEBUG: app.js - Error al registrar alumno:', error); alert(`Error al registrar: ${error.message}`); return null; }
    console.log('DEBUG: app.js - Alumno registrado:', data);
    currentUser = data; localStorage.setItem('libroVaUser', JSON.stringify(currentUser)); return currentUser;
}
async function loginAlumno(nombreAvatarSeleccionado, pin) { // Usa nombre_avatar para login
    console.log("DEBUG: app.js - Intentando login alumno con nombre_avatar:", nombreAvatarSeleccionado);
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return null; }
    const { data, error } = await supabaseClientInstance.from('usuarios').select('*').eq('nombre_avatar', nombreAvatarSeleccionado).eq('pin', pin).single();
    if (error) {
        if (error.code === 'PGRST116') { alert('Avatar o PIN incorrecto.'); }
        else { console.error('DEBUG: app.js - Error login Alumno:', error); alert('Error al iniciar sesión. Intenta de nuevo.'); }
        return null;
    }
    console.log('DEBUG: app.js - Alumno logueado:', data);
    currentUser = data; localStorage.setItem('libroVaUser', JSON.stringify(currentUser)); return currentUser;
}
async function pedirLibroPrestado(libroId, propietarioIdLibro) {
    console.log(`DEBUG: app.js - Intentando pedir prestado libro ID: ${libroId}, del propietario ID: ${propietarioIdLibro}`);
    if (!currentUser || !currentUser.id) { /* No alert */ console.error("Error de sesión."); return; }
    if (!supabaseClientInstance) { /* No alert */ console.error("Error de conexión."); return; }
    if (currentUser.reputacion <= -3) { /* No alert */ console.warn("Límite de préstamos alcanzado."); return; }
    const fechaDevolucion = new Date(); fechaDevolucion.setDate(fechaDevolucion.getDate() + 14);
    const botonesLibro = document.querySelectorAll(`.libro-card[data-libro-id="${libroId}"] button`);
    botonesLibro.forEach(b => b.disabled = true);
    let libroFuePrestadoExitosamente = false; let tituloLibroPrestado = `ID ${libroId}`;
    try {
        const { error: updateErr, count } = await supabaseClientInstance.from('libros').update({ estado: 'prestado', esta_con_usuario_id: currentUser.id, fecha_limite_devolucion: fechaDevolucion.toISOString() }).eq('id', libroId).eq('estado', 'disponible');
        if (updateErr) throw updateErr;
        if (count === 0 || count === null) { console.warn(`DEBUG: app.js - No se actualizó el libro ID: ${libroId}.`); /* No alert */ cargarYMostrarLibros(); return; }
        libroFuePrestadoExitosamente = true; console.log(`DEBUG: app.js - Libro ID: ${libroId} actualizado a 'prestado'.`);
        const { data: libroInfo } = await supabaseClientInstance.from('libros').select('titulo').eq('id', libroId).single();
        if (libroInfo) tituloLibroPrestado = libroInfo.titulo;
        const nRS = (currentUser.reputacion || 0) - 1;
        await supabaseClientInstance.from('usuarios').update({ reputacion: nRS }).eq('id', currentUser.id);
        currentUser.reputacion = nRS;
        const { data: dP } = await supabaseClientInstance.from('usuarios').select('reputacion').eq('id', propietarioIdLibro).single();
        if (dP) { const nRP = (dP.reputacion || 0) + 1; await supabaseClientInstance.from('usuarios').update({ reputacion: nRP }).eq('id', propietarioIdLibro); }
        console.log(`Libro "${tituloLibroPrestado}" prestado.`);
    } catch (error) { console.error("DEBUG: app.js - Error al pedir libro:", error);
    } finally { if (libroFuePrestadoExitosamente) actualizarMenuPrincipal(); cargarYMostrarLibros(); botonesLibro.forEach(b => b.disabled = false); }
}
async function marcarLibroComoDevuelto(libroId) {
    console.log(`DEBUG: app.js - Intentando marcar devuelto libro ID: ${libroId}`);
    if (!currentUser || !currentUser.id) { console.error("Error de sesión."); return; }
    if (!supabaseClientInstance) { console.error("Error de conexión."); return; }
    console.log(`DEBUG: app.js - ID del usuario (propietario devolviendo): ${currentUser.id}`);
    try {
        const { error, count } = await supabaseClientInstance.from('libros').update({ estado: 'disponible', esta_con_usuario_id: null, fecha_limite_devolucion: null }).eq('id', libroId).eq('propietario_id', currentUser.id).eq('estado', 'prestado');
        if (error) throw error;
        if (count === 0 || count === null) { console.warn(`DEBUG: app.js - No se actualizó libro ID: ${libroId} a devuelto.`); /* No alert */ }
        else { console.log(`DEBUG: app.js - Libro ID: ${libroId} marcado como 'disponible'.`); /* No alert */ }
    } catch (error) { console.error("DEBUG: app.js - Error al marcar devuelto:", error); /* No alert */ }
    finally { cargarYMostrarLibros(); }
}
async function handleAnadirLibroSubmit(event) {
    event.preventDefault(); console.log("DEBUG: app.js - Guardando nuevo libro...");
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return; }
    const titulo = document.getElementById('libro-titulo').value; const fotoInput = document.getElementById('libro-foto'); const fotoFile = fotoInput.files[0];
    if (!titulo || !fotoFile) { alert("Por favor, completa el título y selecciona una foto."); return; }
    if (!currentUser || !currentUser.id) { alert("Error: No se pudo identificar al usuario."); renderizarVistaBienvenida(); return; }
    const submitButton = event.target.querySelector('button[type="submit"]'); submitButton.disabled = true; submitButton.textContent = 'Guardando...';
    try {
        const nombreArchivoFoto = `${currentUser.id}_${Date.now()}_${fotoFile.name}`;
        const { error: errorSubida } = await supabaseClientInstance.storage.from('portadas-libros').upload(nombreArchivoFoto, fotoFile, { cacheControl: '3600', upsert: false });
        if (errorSubida) { throw errorSubida; }
        const { data: dataUrlPublica } = supabaseClientInstance.storage.from('portadas-libros').getPublicUrl(nombreArchivoFoto);
        const urlFotoPublica = dataUrlPublica.publicUrl; console.log("DEBUG: app.js - Foto subida, URL pública:", urlFotoPublica);
        const { error: errorLibro } = await supabaseClientInstance.from('libros').insert([{ titulo: titulo, foto_url: urlFotoPublica, google_link: `https://www.google.com/search?q=${encodeURIComponent(titulo)}`, propietario_id: currentUser.id, propietario_avatar: currentUser.nombre_avatar, estado: 'disponible' }]).select();
        if (errorLibro) { throw errorLibro; }
        console.log("Libro añadido exitosamente."); document.getElementById('form-anadir-libro').reset();
        const previewFoto = document.getElementById('libro-foto-preview'); if(previewFoto) { previewFoto.src = '#'; previewFoto.style.display = 'none'; }
        renderizarDashboard();
    } catch (error) { console.error("DEBUG: app.js - Error al guardar el libro:", error);
    } finally { submitButton.disabled = false; submitButton.textContent = 'Guardar Libro'; }
}

// 6. Renderizado de Vistas Específicas
function renderizarVistaBienvenida() {
    console.log("DEBUG: app.js - Renderizando HTML de todas las vistas principales.");
    if (!contenedorPrincipal) { console.error("DEBUG: app.js - Elemento contenedorPrincipal no encontrado."); return; }
    const parrafoCargando = document.getElementById('parrafo-carga-inicial');
    if (parrafoCargando) { parrafoCargando.remove(); }
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
                <button type="submit">Ingresar como Admin</button>
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
                    <button type="submit">Ingresar</button>
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
                <button type="submit">Registrarme</button>
                <button type="button" id="btn-volver-a-seleccion-login-registro" class="link-button">Ya tengo cuenta / Volver</button>
            </form>
        </div>

        <div id="vista-dashboard" class="vista"></div>
        <div id="vista-anadir-libro" class="vista"><h3>Añadir Nuevo Libro</h3><form id="form-anadir-libro"><label for="libro-titulo">Título del Libro:</label><input type="text" id="libro-titulo" required><br><br><label for="libro-foto">Foto de la Portada:</label><input type="file" id="libro-foto" accept="image/*" capture="environment" required><br><br><img id="libro-foto-preview" src="#" alt="Vista previa de la portada" style="max-width: 200px; max-height: 200px; display: none; margin-bottom:15px;"><br><button type="submit">Guardar Libro</button><button type="button" id="btn-volver-dashboard-desde-anadir">Cancelar y Volver al Dashboard</button></form></div>
        <div id="vista-gestionar-libro-propio" class="vista"><h3>Gestionar Mi Libro</h3><p>Aquí podrás editar o eliminar tu libro que esté disponible.</p><div id="detalles-libro-gestion"></div><button type="button" id="btn-volver-dashboard-desde-gestion">Volver al Dashboard</button></div>`;
    console.log("DEBUG: app.js - HTML de todas las vistas principales inyectado.");
    const selectAvatarRegistro = document.getElementById('alumno-avatar-registro');
    if (selectAvatarRegistro) {
        selectAvatarRegistro.innerHTML = ''; AVATARES_DISPONIBLES.forEach(avatar => {
            const optionValue = avatar.id; const optionText = `${avatar.emoji} ${avatar.nombre}`;
            const optionHTML = `<option value="${optionValue}">${optionText}</option>`;
            selectAvatarRegistro.innerHTML += optionHTML;});
        console.log("DEBUG: app.js - Select de avatares para registro poblado.");
    } else { console.warn("DEBUG: app.js - No se encontró el select 'alumno-avatar-registro'."); }
    asignarEventListenersGlobales();
    cambiarVista(null, 'vista-bienvenida');
}

function asignarEventListenersGlobales() {
    console.log("DEBUG: app.js - Asignando event listeners globales...");
    try {
        document.getElementById('btn-ingresar-crear-usuario').onclick = () => cambiarVista('vista-bienvenida', 'vista-login-alumno');
        document.getElementById('btn-acceso-admin').onclick = () => cambiarVista('vista-bienvenida', 'vista-login-admin');
        document.getElementById('btn-volver-bienvenida-admin').onclick = () => cambiarVista('vista-login-admin', 'vista-bienvenida');

        // Listeners para el nuevo flujo de login/registro alumno
        document.getElementById('btn-mostrar-form-login-avatar').onclick = () => {
            document.getElementById('seleccion-login-registro-alumno').style.display = 'none';
            document.getElementById('contenedor-login-avatar').style.display = 'block';
            document.getElementById('selector-avatares-login').style.display = 'flex';
            document.getElementById('form-login-alumno-pin').style.display = 'none';
        };
        document.getElementById('btn-mostrar-form-registro-alumno').onclick = () => cambiarVista('vista-login-alumno', 'vista-registro-alumno');
        document.getElementById('btn-volver-bienvenida-alumno').onclick = () => {
            document.getElementById('seleccion-login-registro-alumno').style.display = 'block';
            document.getElementById('contenedor-login-avatar').style.display = 'none';
            document.getElementById('form-login-alumno-pin').style.display = 'none';
            cambiarVista('vista-login-alumno', 'vista-bienvenida');
        };
        document.getElementById('btn-volver-a-seleccion-login-registro').onclick = () => {
            document.getElementById('seleccion-login-registro-alumno').style.display = 'block';
            document.getElementById('contenedor-login-avatar').style.display = 'none';
            cambiarVista('vista-registro-alumno', 'vista-login-alumno');
        };

        document.querySelectorAll('.avatar-seleccionable').forEach(avatarDiv => { avatarDiv.onclick = () => { const nombreAvatar = avatarDiv.dataset.nombreAvatar; document.querySelectorAll('.avatar-seleccionable').forEach(ad => ad.classList.remove('seleccionado')); avatarDiv.classList.add('seleccionado'); document.getElementById('avatar-seleccionado-nombre').textContent = `Ingresando como: ${nombreAvatar}`; document.getElementById('form-login-alumno-pin').dataset.nombreAvatar = nombreAvatar; document.getElementById('selector-avatares-login').style.display = 'none'; document.getElementById('form-login-alumno-pin').style.display = 'block'; document.getElementById('alumno-pin-login').value = ''; document.getElementById('alumno-pin-login').focus();}; });
        document.getElementById('btn-cambiar-avatar').onclick = () => { document.getElementById('selector-avatares-login').style.display = 'flex'; document.getElementById('form-login-alumno-pin').style.display = 'none'; document.getElementById('form-login-alumno-pin').dataset.nombreAvatar = ''; document.getElementById('alumno-pin-login').value = ''; document.querySelectorAll('.avatar-seleccionable').forEach(ad => ad.classList.remove('seleccionado')); };

        const btnVolverDashboardAnadir = document.getElementById('btn-volver-dashboard-desde-anadir');
        if (btnVolverDashboardAnadir) { btnVolverDashboardAnadir.onclick = () => renderizarDashboard(); }
        const btnVolverDashboardGestion = document.getElementById('btn-volver-dashboard-desde-gestion');
        if (btnVolverDashboardGestion) { btnVolverDashboardGestion.onclick = () => renderizarDashboard(); }

        document.getElementById('form-login-admin').addEventListener('submit', async (e) => { e.preventDefault(); const email = document.getElementById('admin-email').value; const pass = document.getElementById('admin-password').value; const admin = await loginAdmin(email, pass); if (admin) { renderizarDashboard(); actualizarMenuPrincipal(); }});
        document.getElementById('form-login-alumno-pin').addEventListener('submit', async (e) => { e.preventDefault(); const nombreAvatar = e.target.dataset.nombreAvatar; const pin = document.getElementById('alumno-pin-login').value; if (!nombreAvatar) { alert('Por favor, selecciona un avatar primero.'); document.getElementById('btn-cambiar-avatar').click(); return; } const alumno = await loginAlumno(nombreAvatar, pin); if (alumno) { renderizarDashboard(); actualizarMenuPrincipal(); e.target.dataset.nombreAvatar = ''; document.getElementById('alumno-pin-login').value = ''; document.getElementById('selector-avatares-login').style.display = 'flex'; document.getElementById('form-login-alumno-pin').style.display = 'none'; document.getElementById('btn-ir-a-registro').style.display = 'inline-block'; document.getElementById('btn-volver-bienvenida-alumno').style.display = 'inline-block'; }});
        document.getElementById('form-registro-alumno').addEventListener('submit', async (e) => { e.preventDefault(); const nickname = document.getElementById('alumno-nickname-registro').value; const idAvatar = document.getElementById('alumno-avatar-registro').value; const pin = document.getElementById('alumno-pin-registro').value; const pinConfirm = document.getElementById('alumno-pin-confirmar').value; if (pin !== pinConfirm) { alert('Los PINs no coinciden.'); return; } let pinEsValido = false; if (pin.length === 4) { if (/^[0-9]+$/.test(pin)) { pinEsValido = true; } } if (!pinEsValido) { alert('El PIN debe ser de exactamente 4 números.'); return; } const alumno = await registrarAlumno(nickname, idAvatar, pin); if (alumno) { renderizarDashboard(); actualizarMenuPrincipal(); }});
        const formAnadirLibro = document.getElementById('form-anadir-libro');
        if (formAnadirLibro) { formAnadirLibro.addEventListener('submit', handleAnadirLibroSubmit); }
        const inputFoto = document.getElementById('libro-foto');
        const previewFoto = document.getElementById('libro-foto-preview');
        if (inputFoto && previewFoto) { inputFoto.addEventListener('change', function(event) { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = function(eRead) { previewFoto.src = eRead.target.result; previewFoto.style.display = 'block'; }; reader.readAsDataURL(file); } else { previewFoto.src = '#'; previewFoto.style.display = 'none'; }}); }
        console.log("DEBUG: app.js - Event listeners globales asignados.");
    } catch (err) { console.error("DEBUG: app.js - Error al asignar event listeners globales:", err); }
}

async function cargarYMostrarLibros() {
    console.log("DEBUG: app.js - Cargando y mostrando libros...");
    if (!supabaseClientInstance) { console.error("DEBUG: app.js - Supabase no inicializado."); return; }
    const listaLibrosDiv = document.getElementById('lista-libros-disponibles');
    if (!listaLibrosDiv) { console.error("DEBUG: app.js - Div 'lista-libros-disponibles' no encontrado."); return; }
    listaLibrosDiv.innerHTML = 'Buscando libros en la biblioteca...';
    try {
        const { data: libros, error } = await supabaseClientInstance.from('libros').select(`id, titulo, foto_url, estado, propietario_id, fecha_limite_devolucion, esta_con_usuario_id, propietario:usuarios!propietario_id ( nickname ), prestado_a:usuarios!esta_con_usuario_id ( nickname )`).order('created_at', { ascending: false });
        if (error) { throw error; }
        if (libros && libros.length > 0) {
            listaLibrosDiv.innerHTML = ''; libros.forEach(libro => {
                const propietarioNombre = libro.propietario ? libro.propietario.nickname : 'Desconocido';
                let infoPrestamoHTML = '';
                if (libro.estado === 'prestado') { const nombrePrestadoA = libro.prestado_a ? libro.prestado_a.nickname : 'Alguien'; const fechaDev = libro.fecha_limite_devolucion ? new Date(libro.fecha_limite_devolucion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Fecha no definida'; infoPrestamoHTML = `<p class="libro-info-prestamo">Prestado a: ${nombrePrestadoA}<br>Devolver el: ${fechaDev}</p>`;}
                const libroCardHTML = `<div class="libro-card" data-libro-id="${libro.id}" data-propietario-id="${libro.propietario_id}"><img src="${libro.foto_url}" alt="Portada de ${libro.titulo}" class="libro-portada"><h4 class="libro-titulo">${libro.titulo}</h4><p class="libro-propietario">Dueño: ${propietarioNombre}</p><p class="libro-estado">Estado: ${libro.estado}</p>${infoPrestamoHTML}${currentUser && currentUser.id !== libro.propietario_id && libro.estado === 'disponible' ? '<button class="btn-pedir-prestado boton-menu-header">Pedir Prestado</button>' : ''}${currentUser && currentUser.id === libro.propietario_id && libro.estado === 'prestado' && libro.esta_con_usuario_id ? '<button class="btn-marcar-devuelto boton-menu-header">Marcar como Devuelto</button>' : ''}${currentUser && currentUser.id === libro.propietario_id && libro.estado === 'disponible' ? '<button class="btn-gestionar-libro boton-menu-header">Gestionar (Mío)</button>' : ''}</div>`;
                listaLibrosDiv.innerHTML += libroCardHTML;});
            asignarEventListenersLibros();
        } else { listaLibrosDiv.innerHTML = '<p>Aún no hay libros en la biblioteca. ¡Sé el primero en cargar uno!</p>'; }
    } catch (error) { console.error("DEBUG: app.js - Error al cargar libros:", error); listaLibrosDiv.innerHTML = '<p style="color:red;">Error al cargar los libros.</p>';}
}
function asignarEventListenersLibros() {
    document.querySelectorAll('.btn-pedir-prestado').forEach(boton => { boton.addEventListener('click', async (event) => { if (!currentUser) { /* No alert */ console.error("Login requerido"); renderizarVistaBienvenida(); return; } const libroCard = event.target.closest('.libro-card'); const libroId = libroCard.dataset.libroId; const propietarioId = libroCard.dataset.propietarioId; if (confirm(`¿Seguro que quieres pedir prestado el libro "${libroCard.querySelector('.libro-titulo').textContent}"?`)) { await pedirLibroPrestado(libroId, propietarioId); }});});
    document.querySelectorAll('.btn-gestionar-libro').forEach(boton => { boton.addEventListener('click', (event) => { const libroCard = event.target.closest('.libro-card'); const libroId = libroCard.dataset.libroId; console.log(`DEBUG: Gestionar libro ID: ${libroId}`); const vistaActivaActual = document.querySelector('.vista.activa'); cambiarVista(vistaActivaActual ? vistaActivaActual.id : null, 'vista-gestionar-libro-propio');});});
    document.querySelectorAll('.btn-marcar-devuelto').forEach(boton => { boton.addEventListener('click', async (event) => { const libroCard = event.target.closest('.libro-card'); const libroId = libroCard.dataset.libroId; if (confirm(`¿Confirmas que el libro "${libroCard.querySelector('.libro-titulo').textContent}" ha sido devuelto?`)) { await marcarLibroComoDevuelto(libroId); }});});
}

async function cargarMisLibrosEnPrestamo(userId) {
    if (!supabaseClientInstance) return [];
    const { data, error } = await supabaseClientInstance.from('libros').select(`id, titulo, foto_url, fecha_limite_devolucion, prestado_a:usuarios!esta_con_usuario_id ( nickname )`).eq('propietario_id', userId).eq('estado', 'prestado');
    if (error) { console.error("Error cargando mis libros prestados:", error); return []; }
    return data || [];
}
async function cargarLibrosQueMePrestaron(userId) {
    if (!supabaseClientInstance) return [];
    const { data, error } = await supabaseClientInstance.from('libros').select(`id, titulo, foto_url, fecha_limite_devolucion, propietario:usuarios!propietario_id ( nickname )`).eq('esta_con_usuario_id', userId).eq('estado', 'prestado');
    if (error) { console.error("Error cargando libros que me prestaron:", error); return []; }
    return data || [];
}
function renderizarListaDashboard(divId, libros, tipoLista) {
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
    console.log("DEBUG: app.js - Renderizando Dashboard Completo. Usuario actual:", currentUser);
    if (!currentUser) { console.log("DEBUG: app.js - No hay usuario, volviendo a bienvenida."); renderizarVistaBienvenida(); return; }
    if (!contenedorPrincipal) { console.error("DEBUG: app.js - Contenedor principal no encontrado."); return; }
    const dashboardView = document.getElementById('vista-dashboard');
    if (!dashboardView) { console.error("DEBUG: app.js - Div 'vista-dashboard' no encontrado."); renderizarVistaBienvenida(); return; }
    const nombreUsuario = currentUser.rol === 'admin' ? currentUser.email : currentUser.nickname;
    const reputacionMostrar = (currentUser.reputacion !== undefined && currentUser.reputacion !== null) ? currentUser.reputacion : 0;
    dashboardView.innerHTML = `<h2>Dashboard de ${nombreUsuario}</h2><p>Tu reputación: ${reputacionMostrar}</p><button id="btn-ir-anadir-libro" class="boton-menu-header">Cargar Libro</button><hr><div class="seccion-dashboard"><h3>Mis Libros Prestados a Otros</h3><div id="mis-libros-en-prestamo" class="lista-dashboard-libros">Cargando...</div></div><hr><div class="seccion-dashboard"><h3>Libros que me Prestaron</h3><div id="libros-que-me-prestaron" class="lista-dashboard-libros">Cargando...</div></div><hr><h3>Todos los Libros Disponibles en la Biblioteca</h3><div id="lista-libros-disponibles">Cargando libros...</div>`;
    const btnIrAnadirLibro = document.getElementById('btn-ir-anadir-libro');
    if (btnIrAnadirLibro) { btnIrAnadirLibro.onclick = () => cambiarVista('vista-dashboard', 'vista-anadir-libro');}
    console.log("DEBUG: app.js - HTML de Dashboard completo inyectado.");
    const vistaActivaPrevia = document.querySelector('.vista.activa');
    cambiarVista(vistaActivaPrevia ? vistaActivaPrevia.id : null, 'vista-dashboard');
    cargarMisLibrosEnPrestamo(currentUser.id).then(libros => { renderizarListaDashboard('mis-libros-en-prestamo', libros, 'prestadosPorMi'); asignarEventListenersLibros(); });
    cargarLibrosQueMePrestaron(currentUser.id).then(libros => { renderizarListaDashboard('libros-que-me-prestaron', libros, 'prestadosAMi'); });
    cargarYMostrarLibros();
}

async function handleAnadirLibroSubmit(event) {
    event.preventDefault(); console.log("DEBUG: app.js - Guardando nuevo libro...");
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return; }
    const titulo = document.getElementById('libro-titulo').value; const fotoInput = document.getElementById('libro-foto'); const fotoFile = fotoInput.files[0];
    if (!titulo || !fotoFile) { alert("Por favor, completa el título y selecciona una foto."); return; }
    if (!currentUser || !currentUser.id) { alert("Error: No se pudo identificar al usuario."); renderizarVistaBienvenida(); return; }
    const submitButton = event.target.querySelector('button[type="submit"]'); submitButton.disabled = true; submitButton.textContent = 'Guardando...';
    try {
        const nombreArchivoFoto = `${currentUser.id}_${Date.now()}_${fotoFile.name}`;
        const { error: errorSubida } = await supabaseClientInstance.storage.from('portadas-libros').upload(nombreArchivoFoto, fotoFile, { cacheControl: '3600', upsert: false });
        if (errorSubida) { throw errorSubida; }
        const { data: dataUrlPublica } = supabaseClientInstance.storage.from('portadas-libros').getPublicUrl(nombreArchivoFoto);
        const urlFotoPublica = dataUrlPublica.publicUrl; console.log("DEBUG: app.js - Foto subida, URL pública:", urlFotoPublica);
        const { error: errorLibro } = await supabaseClientInstance.from('libros').insert([{ titulo: titulo, foto_url: urlFotoPublica, google_link: `https://www.google.com/search?q=${encodeURIComponent(titulo)}`, propietario_id: currentUser.id, propietario_avatar: currentUser.nombre_avatar, estado: 'disponible' }]).select();
        if (errorLibro) { throw errorLibro; }
        console.log("Libro añadido exitosamente."); document.getElementById('form-anadir-libro').reset();
        const previewFoto = document.getElementById('libro-foto-preview'); if(previewFoto) { previewFoto.src = '#'; previewFoto.style.display = 'none'; }
        renderizarDashboard();
    } catch (error) { console.error("DEBUG: app.js - Error al guardar el libro:", error);
    } finally { submitButton.disabled = false; submitButton.textContent = 'Guardar Libro'; }
}

// 7. Lógica de Inicialización de la App
function appInit() {
    console.log("DEBUG: app.js - appInit() iniciada.");
    if (!contenedorPrincipal || !menuPrincipal) { console.error("DEBUG: app.js - Faltan elementos DOM cruciales."); return; }
    if (!supabaseClientInstance) {
        console.error("DEBUG: app.js - Instancia Supabase no inicializada en appInit().");
        const parrafoCarga = document.getElementById('parrafo-carga-inicial'); if (parrafoCarga) parrafoCarga.remove();
        contenedorPrincipal.innerHTML = "<p style='color:red; text-align:center;'>Error crítico: Conexión fallida.</p>"; return;
    }
    renderizarVistaBienvenida();
    const storedUser = localStorage.getItem('libroVaUser');
    if (storedUser) { try { currentUser = JSON.parse(storedUser); console.log('DEBUG: app.js - Alumno recuperado de localStorage:', currentUser); } catch (e) { console.error("DEBUG: app.js - Error parseando localStorage:", e); localStorage.removeItem('libroVaUser'); currentUser = null; }}
    supabaseClientInstance.auth.onAuthStateChange(async (event, session) => {
        console.log('DEBUG: app.js - Supabase Auth state change:', event, session);
        let authStateChangedUser = false; const vistaActivaPrevia = document.querySelector('.vista.activa'); const idVistaActivaPrevia = vistaActivaPrevia ? vistaActivaPrevia.id : null;
        if (event === 'INITIAL_SESSION' && session && session.user) { currentUser = { id: session.user.id, email: session.user.email, rol: 'admin', reputacion: 'N/A' }; authStateChangedUser = true; console.log('DEBUG: app.js - Admin session recuperada (INITIAL_SESSION):', currentUser);
        } else if (event === 'SIGNED_IN' && session && session.user) { if (!currentUser || currentUser.id !== session.user.id || currentUser.rol !== 'admin' ) { currentUser = { id: session.user.id, email: session.user.email, rol: 'admin', reputacion: 'N/A' }; authStateChangedUser = true; } console.log('DEBUG: app.js - Admin signed in:', currentUser);
        } else if (event === 'SIGNED_OUT') { if (currentUser && currentUser.rol === 'admin') { console.log('DEBUG: app.js - Admin signed out.'); currentUser = null; authStateChangedUser = true; }}
        if (authStateChangedUser) { if (currentUser) { renderizarDashboard(); } else { cambiarVista(idVistaActivaPrevia || 'vista-dashboard', 'vista-bienvenida'); }}
        else if (currentUser) { renderizarDashboard(); }
        else { cambiarVista(idVistaActivaPrevia, 'vista-bienvenida'); }
        actualizarMenuPrincipal();});
    if (currentUser) { console.log("DEBUG: app.js - appInit: Hay currentUser (localStorage), renderizando dashboard."); renderizarDashboard();
    } else { console.log("DEBUG: app.js - appInit: No hay currentUser (localStorage), onAuthStateChange determinará o se quedará en bienvenida."); const vistaActivaActual = document.querySelector('.vista.activa'); if (!vistaActivaActual || vistaActivaActual.id !== 'vista-bienvenida') {cambiarVista(vistaActivaActual ? vistaActivaActual.id : null, 'vista-bienvenida'); }}
    actualizarMenuPrincipal();
}

console.log("DEBUG: app.js - Agregando event listener para DOMContentLoaded. document.readyState:", document.readyState);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', appInit);
} else {
    console.log("DEBUG: app.js - DOM ya cargado, ejecutando appInit() directamente.");
    appInit();
}
console.log("DEBUG: app.js - Script finalizado.");