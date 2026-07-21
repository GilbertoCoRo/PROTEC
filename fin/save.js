// =========================================
// GUARDAR SOLICITUD DE CONTACTO
// =========================================
function guardarSolicitud(servicio, datos) {
    // Obtener solicitudes existentes
    let solicitudes = JSON.parse(localStorage.getItem('protec_solicitudes')) || [];
    
    // Agregar nueva solicitud con fecha
    solicitudes.unshift({
        id: Date.now(),
        servicio: servicio,
        fecha: new Date().toLocaleDateString('es-MX'),
        ...datos
    });
    
    // Guardar en localStorage
    localStorage.setItem('protec_solicitudes', JSON.stringify(solicitudes));
    
    // Mostrar mensaje de éxito
    alert('Solicitud guardada con éxito');
    return true;
}