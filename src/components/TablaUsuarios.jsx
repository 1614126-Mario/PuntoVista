import React, { useState } from 'react';
import Boton from './Boton';
import ConfirmModal from './ConfirmModal';

export default function TablaUsuarios() {
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: 'Ana Gómez', rol: 'Diseñadora' },
    { id: 2, nombre: 'Carlos Ruiz', rol: 'Desarrollador' },
    { id: 3, nombre: 'Sofía López', rol: 'Gerente' }
  ]);

  const [notificacion, setNotificacion] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  const mostrarNotificacion = (texto, tipo = 'info') => {
    setNotificacion({ texto, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  const confirmarEliminar = () => {
    if (usuarioAEliminar) {
      setUsuarios(prev => prev.filter(u => u.id !== usuarioAEliminar.id));
      mostrarNotificacion(`Usuario "${usuarioAEliminar.nombre}" eliminado`, 'danger');
      setUsuarioAEliminar(null);
    }
  };

  return (
    <div style={{
      maxWidth: '650px',
      margin: '20px auto',
      fontFamily: 'sans-serif',
      background: '#fff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      position: 'relative'
    }}>
      {/* Modal de confirmación estilizado sin confirm nativo */}
      <ConfirmModal
        isOpen={Boolean(usuarioAEliminar)}
        title="¿Eliminar usuario?"
        message={usuarioAEliminar ? `¿Estás seguro de que deseas eliminar a ${usuarioAEliminar.nombre} de la lista de usuarios?` : ''}
        confirmText="Eliminar"
        confirmColor="#b91010"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onClose={() => setUsuarioAEliminar(null)}
      />

      {/* Notificación flotante personalizada sin alert nativo */}
      {notificacion && (
        <div style={{
          backgroundColor: notificacion.tipo === 'danger' ? '#fef2f2' : '#eff6ff',
          color: notificacion.tipo === 'danger' ? '#b91c1c' : '#1d4ed8',
          border: `1px solid ${notificacion.tipo === 'danger' ? '#fca5a5' : '#bfdbfe'}`,
          padding: '10px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '0.9rem',
          fontWeight: '500',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{notificacion.texto}</span>
          <button
            onClick={() => setNotificacion(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              color: 'inherit',
              padding: '0 4px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.3rem' }}>Lista de Usuarios Registrados</h2>
        <Boton
          texto="Eliminar cliente"
          color="#b91010"
          onClick={() => mostrarNotificacion('Selecciona "Eliminar" en el usuario que deseas quitar.', 'info')}
        />
      </div>
     
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: '12px 10px', color: '#4b5563', fontSize: '0.88rem' }}>Nombre</th>
            <th style={{ padding: '12px 10px', color: '#4b5563', fontSize: '0.88rem' }}>Rol</th>
            <th style={{ padding: '12px 10px', textAlign: 'right', color: '#4b5563', fontSize: '0.88rem' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ padding: '24px 10px', textAlign: 'center', color: '#9ca3af' }}>
                No quedan usuarios en la lista.
              </td>
            </tr>
          ) : (
            usuarios.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 10px', fontWeight: '500', color: '#111827' }}>{u.nombre}</td>
                <td style={{ padding: '12px 10px', color: '#4b5563' }}>{u.rol}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                  <Boton
                    texto="Eliminar"
                    color="#b91010"
                    onClick={() => setUsuarioAEliminar(u)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
