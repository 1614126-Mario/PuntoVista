import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import Boton from './Boton'

export default function ConfirmModal({
  isOpen,
  title = '¿Confirmar acción?',
  message = '¿Estás seguro de realizar esta acción?',
  confirmText = 'Eliminar',
  confirmColor = '#b91010',
  cancelText = 'Cancelar',
  onConfirm,
  onClose
}) {
  if (!isOpen) return null

  return (
    <div
      className="modal-backdrop no-print"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: 440,
          width: '90%',
          backgroundColor: '#1e1b2e',
          color: '#fff',
          borderRadius: 16,
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: 600 }}>
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ margin: '0 0 24px 0', color: '#d1d5db', fontSize: '0.95rem', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#e5e7eb',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}
          >
            {cancelText}
          </button>
          <Boton
            texto={confirmText}
            color={confirmColor}
            onClick={() => {
              if (onConfirm) onConfirm()
              onClose()
            }}
          />
        </div>
      </div>
    </div>
  )
}
