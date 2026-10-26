import { useState, useMemo } from 'react'
import {
  UserPlus,
  Users,
  Search,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  FileText,
  UserCheck
} from 'lucide-react'

export default function ClienteModal({
  isOpen,
  onClose,
  clientes = [],
  selectedCliente = null,
  onSelectCliente,
  onCrearCliente
}) {
  const [tab, setTab] = useState('buscar') // 'buscar' | 'nuevo'
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Formulario nuevo cliente
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    telefono: '',
    email: '',
    direccion: ''
  })

  // Clientes filtrados
  const filteredClientes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return clientes
    return clientes.filter((c) => {
      const full = `${c.nombre || ''} ${c.apellido || ''} ${c.documento || ''} ${c.telefono || ''} ${c.email || ''} ${c.direccion || ''}`.toLowerCase()
      return full.includes(q)
    })
  }, [clientes, searchQuery])

  if (!isOpen) return null

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      alert('Por favor introduce al menos el nombre del cliente.')
      return
    }

    try {
      setIsSubmitting(true)
      const nuevo = await onCrearCliente({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        documento: formData.documento.trim() || '00000000-0',
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        direccion: formData.direccion.trim()
      })
      onSelectCliente(nuevo)
      setFormData({
        nombre: '',
        apellido: '',
        documento: '',
        telefono: '',
        email: '',
        direccion: ''
      })
      setTab('buscar')
      onClose()
    } catch (err) {
      alert('Error al registrar el cliente: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content client-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px' }}
      >
        {/* Header del Modal */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="icon-badge-purple">
              <Users size={20} color="#c084fc" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>
                Gestión de Clientes para la Orden
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Asigna un comensal para consumo en mesa o cliente para pedido en línea
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Pestañas: Buscar vs Nuevo */}
        <div className="client-modal-tabs">
          <button
            type="button"
            className={`tab-btn-pill ${tab === 'buscar' ? 'active' : ''}`}
            onClick={() => setTab('buscar')}
          >
            <Users size={16} />
            <span>Seleccionar Registrado ({clientes.length})</span>
          </button>
          <button
            type="button"
            className={`tab-btn-pill ${tab === 'nuevo' ? 'active' : ''}`}
            onClick={() => setTab('nuevo')}
          >
            <UserPlus size={16} />
            <span>+ Registrar Nuevo Cliente</span>
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {tab === 'buscar' ? (
            <>
              {/* Buscador de Clientes */}
              <div className="search-box" style={{ marginBottom: '1rem' }}>
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar por nombre, RFC/DNI, teléfono o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      color: '#a855f7'
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Lista de Clientes */}
              {filteredClientes.length === 0 ? (
                <div className="empty-state-card">
                  <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    No se encontró ningún cliente con "{searchQuery}"
                  </p>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, nombre: searchQuery }))
                      setTab('nuevo')
                    }}
                  >
                    <UserPlus size={16} /> Registrar "{searchQuery}" como nuevo
                  </button>
                </div>
              ) : (
                <div className="client-list-grid">
                  {filteredClientes.map((c) => {
                    const isSelected = selectedCliente?.id === c.id
                    return (
                      <div
                        key={c.id}
                        className={`client-card-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          onSelectCliente(c)
                          onClose()
                        }}
                      >
                        <div className="client-avatar-badge">
                          {(c.nombre?.[0] || 'C').toUpperCase()}
                        </div>
                        <div className="client-details">
                          <div className="client-card-title">
                            <strong>{c.nombre} {c.apellido || ''}</strong>
                            {isSelected && (
                              <span className="badge-selected-pill">
                                <Check size={12} /> Seleccionado
                              </span>
                            )}
                          </div>

                          <div className="client-info-meta">
                            {c.documento && (
                              <span title="RFC / Documento">
                                <FileText size={12} color="#c084fc" /> {c.documento}
                              </span>
                            )}
                            {c.telefono && (
                              <span title="Teléfono">
                                <Phone size={12} color="#38bdf8" /> {c.telefono}
                              </span>
                            )}
                            {c.email && (
                              <span title="Correo Electrónico">
                                <Mail size={12} color="#4ade80" /> {c.email}
                              </span>
                            )}
                          </div>

                          {c.direccion && (
                            <div className="client-address-line" title={c.direccion}>
                              <MapPin size={12} color="#f472b6" /> {c.direccion}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className={`btn-select-client ${isSelected ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectCliente(c)
                            onClose()
                          }}
                        >
                          {isSelected ? <Check size={16} /> : <UserCheck size={16} />}
                          <span>{isSelected ? 'Actual' : 'Elegir'}</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            /* Formulario para registrar un cliente nuevo */
            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Nombre(s) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Laura Sofía"
                    className="form-control"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Apellido(s)</label>
                  <input
                    type="text"
                    placeholder="Ej: Mendoza Morales"
                    className="form-control"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>DUI / NIT (Documento de Identidad) *</label>
                  <input
                    type="text"
                    placeholder="Ej: 01234567-8 o 0614-..."
                    className="form-control"
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value.toUpperCase() })}
                  />
                  <small style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                    Documento para Factura Electrónica (DTE) de El Salvador
                  </small>
                </div>

                <div className="form-group">
                  <label>Teléfono de Contacto</label>
                  <input
                    type="tel"
                    placeholder="Ej: +503 7123-4567"
                    className="form-control"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Correo Electrónico (para Factura / Pedidos)</label>
                <input
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Dirección (Fiscal o de Entrega a Domicilio)</label>
                <textarea
                  rows="2"
                  placeholder="Calle, número, colonia, código postal, referencias..."
                  className="form-control"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ padding: '0.75rem 0 0 0' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setTab('buscar')}
                >
                  Regresar a la lista
                </button>
                <button
                  type="submit"
                  className="btn-add-product"
                  disabled={isSubmitting}
                >
                  <UserPlus size={16} />
                  <span>{isSubmitting ? 'Guardando...' : 'Guardar y Asignar Cliente'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
