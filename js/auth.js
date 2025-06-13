// js/auth.js
console.log("DEBUG: auth.js - Cargado.");

async function cerrarSesion() {
    console.log("DEBUG: auth.js - Cerrando sesión...");
    // Admin ya no utiliza Supabase Auth, solo limpiamos estado local
    detenerMonitoreoNotificaciones();
    currentUser = null;
    localStorage.removeItem('libroVaUser');
    console.log('DEBUG: auth.js - Sesión cerrada localmente.');
    renderizarVistaBienvenida();
    actualizarMenuPrincipal();
}

async function loginAdmin(nickname, pin) {
    console.log("DEBUG: auth.js - Intentando login admin con nickname:", nickname);
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return null; }

    if (nickname !== 'admin') { alert('Alias de administrador incorrecto.'); return null; }

    const { data, error } = await supabaseClientInstance
        .from('usuarios')
        .select('*')
        .eq('nickname', 'admin')
        .eq('pin', pin)
        .single();

    if (error) {
        console.error('DEBUG: auth.js - Error login Admin:', error);
        alert('Error al iniciar sesión como admin.');
        return null;
    }

    if (!data || data.rol !== 'admin') {
        alert('Credenciales de administrador inválidas.');
        return null;
    }

    console.log('DEBUG: auth.js - Admin logueado:', data);
    currentUser = data;
    localStorage.setItem('libroVaUser', JSON.stringify(currentUser));
    iniciarMonitoreoNotificaciones();
    return currentUser;
}

async function registrarAlumno(nickname, idAvatarSeleccionado, pin) {
    // ... (Misma función registrarAlumno que tenías)
    console.log("DEBUG: auth.js - Intentando registrar alumno con nickname:", nickname, "y avatar ID:", idAvatarSeleccionado);
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return null; }
    const nicknameLimpio = nickname.trim();
    if (!nicknameLimpio || nicknameLimpio.length < 3) { alert('El Nickname debe tener al menos 3 caracteres.'); return null; }
    const avatarElegido = AVATARES_DISPONIBLES.find(a => a.id === idAvatarSeleccionado); // AVATARES_DISPONIBLES de config.js
    if (!avatarElegido) { alert('Avatar seleccionado no es válido.'); return null; }
    const nombreAvatarParaGuardar = avatarElegido.nombre;
    let { data: usuariosConEseNickname, error: errorNicknameUnico } = await supabaseClientInstance.from('usuarios').select('id').eq('nickname', nicknameLimpio).limit(1); 
    if (errorNicknameUnico) { console.error('DEBUG: auth.js - Error al verificar unicidad de nickname:', errorNicknameUnico); alert('Error al registrar. Intenta de nuevo.'); return null; }
    if (usuariosConEseNickname && usuariosConEseNickname.length > 0) { alert('Ese Nickname ya está en uso. Por favor, elige otro.'); return null; }
    const { data, error } = await supabaseClientInstance.from('usuarios').insert([{ nickname: nicknameLimpio, nombre_avatar: nombreAvatarParaGuardar, pin: pin, rol: 'alumno', reputacion: 0 }]).select().single();
    if (error) { console.error('DEBUG: auth.js - Error al registrar alumno:', error); alert(`Error al registrar: ${error.message}`); return null; }
    console.log('DEBUG: auth.js - Alumno registrado:', data);
    currentUser = data; localStorage.setItem('libroVaUser', JSON.stringify(currentUser));
    iniciarMonitoreoNotificaciones();
    return currentUser; // Actualiza currentUser global
}

async function loginAlumno(nombreAvatarSeleccionado, pin) {
    // ... (Misma función loginAlumno que tenías)
    console.log("DEBUG: auth.js - Intentando login alumno con nombre_avatar:", nombreAvatarSeleccionado);
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return null; }
    const { data, error } = await supabaseClientInstance.from('usuarios').select('*').eq('nombre_avatar', nombreAvatarSeleccionado).eq('pin', pin).single(); 
    if (error) {
        if (error.code === 'PGRST116') { alert('Avatar o PIN incorrecto.'); } 
        else { console.error('DEBUG: auth.js - Error login Alumno:', error); alert('Error al iniciar sesión. Intenta de nuevo.'); }
        return null;
    }
    console.log('DEBUG: auth.js - Alumno logueado:', data);
    currentUser = data; localStorage.setItem('libroVaUser', JSON.stringify(currentUser));
    iniciarMonitoreoNotificaciones();
    return currentUser; // Actualiza currentUser global
}