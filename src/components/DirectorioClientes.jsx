import { useState, useMemo } from 'react'
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  Utensils,
  Receipt
} from 'lucide-react'

export default function DirectorioClientes({
  clientes = [],
  onNuevoClienteClick,
  onIniciarPedidoConCliente
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return clientes
    return clientes.filter((c) => {
      const full = `${c.nombre || ''} ${c.apellido || ''} ${c.documento || ''} ${c.telefono || ''} ${c.email || ''} ${c.direccion || ''}`.toLowerCase()
      return full.includes(q)
    })
  }, [clientes, searchQuery])

  return (
    <div className="history-view-container">
      <div className="history-controls-card">
        <div className="history-controls-top">
          <div className="search-box" style={{ flex: 1 }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar cliente por nombre, DUI / NIT, teléfono, correo o dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-add-product"
            onClick={onNuevoClienteClick}
          >
            <UserPlus size={16} /> + Registrar Nuevo Cliente
          </button>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Total de clientes registrados: <strong>{clientes.length}</strong>
        </div>
      </div>

      <div className="clients-directory-grid">
        {filtered.map((c) => (
          <div key={c.id} className="directory-client-card">
            <div className="client-card-top">
              <div className="client-avatar-badge" style={{ width: '46px', height: '46px', fontSize: '1.2rem' }}>
                {(c.nombre?.[0] || 'C').toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem' }}>
                  {c.nombre} {c.apellido || ''}
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#c084fc', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={12} /> {c.documento ? `DUI/NIT: ${c.documento}` : 'Sin documento asignado'}
                </div>
              </div>
            </div>

            <div className="client-contact-details">
              {c.telefono && (
                <div className="contact-item">
                  <Phone size={13} color="#38bdf8" />
                  <span>{c.telefono}</span>
                </div>
              )}
              {c.email && (
                <div className="contact-item">
                  <Mail size={13} color="#4ade80" />
                  <span>{c.email}</span>
                </div>
              )}
              {c.direccion && (
                <div className="contact-item" style={{ alignItems: 'flex-start' }}>
                  <MapPin size={13} color="#f472b6" style={{ marginTop: '2px' }} />
                  <span>{c.direccion}</span>
                </div>
              )}
            </div>

            <div className="client-card-bottom-action">
              <button
                type="button"
                className="btn-add-product"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => onIniciarPedidoConCliente(c)}
              >
                <Utensils size={15} />
                <span>Tomar Pedido para este Cliente</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
