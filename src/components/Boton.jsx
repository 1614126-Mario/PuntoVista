import React from 'react';

// Recibe "texto", "color" y opcionalmente "onClick" como propiedades (props)
export default function Boton({ texto, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: color,
        padding: '10px 20px',
        color: '#fff',
        border: '1px dotted black',
        cursor: 'pointer',
        borderRadius: '4px'
      }}
    >
      {texto}
    </button>
  );
}
