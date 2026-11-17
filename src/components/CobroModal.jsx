import { useState } from 'react'
import { Banknote, CreditCard, Smartphone, Globe, MapPin, Receipt, X, Mail } from 'lucide-react'
import PaymentDetails from './PaymentDetails'

const METODOS = [
  { key: 'cash', label: 'Efectivo', icon: Banknote },
  { key: 'card', label: 'Tarjeta', icon: CreditCard },
  { key: 'transfer', label: 'Transferencia', icon: Smartphone },
  { key: 'online', label: 'En línea', icon: Globe }
]

const METODO_POR_TEXTO = [
  ['Efectivo', 'cash'],
  ['Tarjeta', 'card'],
  ['Transferencia', 'transfer'],
  ['Línea', 'online']
]

// Si el cliente ya eligió forma de pago (pedidos en línea), se preselecciona.
function metodoInicial(pedido) {
  const texto = pedido.metodoPago || ''
  const match = METODO_POR_TEXTO.find(([t]) => texto.includes(t))
  return match ? match[1] : 'cash'
}

export default function CobroModal({ pedido, onConfirmar, onCerrar }) {
  const [metodo, setMetodo] = useState(() => metodoInicial(pedido))
  const [emailFactura, setEmailFactura] = useState(() => pedido.cliente?.email || '')
  const [cobrando, setCobrando] = useState(false)

  const total = Number(pedido.total || 0)
  const items = pedido.detalles || pedido.items || []
  const esLinea = pedido.tipoPedido === 'EN_LINEA'
  const esMesa = !pedido.tipoPedido || pedido.tipoPedido === 'LOCAL'
  const destino = esLinea
    ? pedido.direccionEntrega || pedido.cliente?.direccion || 'Dirección no especificada'
    : pedido.numeroMesa || (pedido.tipoPedido === 'LLEVAR' ? 'Para llevar (mostrador)' : 'Salón')

  const confirmar = async () => {
    setCobrando(true)
    try {
      await onConfirmar(pedido, metodo, emailFactura.trim())
    } finally {
      setCobrando(false)
    }
  }

  return (
    <div className="modal-backdrop no-print" onClick={onCerrar}>
      <div className="modal-content" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Receipt size={20} color="#c084fc" />
            <span>Cobrar {pedido.numeroFactura || pedido.folio}</span>
          </h3>
          <button type="button" className="btn-close-modal" onClick={onCerrar}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ fontSize: '0.85rem' }}>
            <div style={{ marginBottom: 4 }}>
              <strong>Cliente:</strong>{' '}
              {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido || ''}` : 'Consumidor Final'}
              {pedido.cliente?.documento && (
                <span style={{ color: '#c084fc', marginLeft: 6 }}>[DUI: {pedido.cliente.documento}]</span>
              )}
              {pedido.cliente?.telefono && (
                <span style={{ color: '#9ca3af' }}> ({pedido.cliente.telefono})</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 6 }}>
              <MapPin size={14} color="#38bdf8" style={{ marginTop: 2, flexShrink: 0 }} />
              <span>
                <strong>{esLinea ? 'Entregar en:' : esMesa ? 'Mesa correspondiente:' : 'Lugar:'}</strong> <span style={{ color: esMesa ? '#34d399' : '#fff', fontWeight: esMesa ? '700' : 'normal' }}>{destino}</span>
              </span>
            </div>
            <ul style={{ margin: '0 0 6px', paddingLeft: '1.1rem', color: '#d1d5db' }}>
              {items.map((it, i) => (
                <li key={i}>
                  {it.cantidad || it.quantity || 1}x {it.nombreProducto || it.name || 'Platillo'}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24', marginBottom: 12 }}>
              {esMesa ? `Cuenta a cobrar (${destino}): ` : 'Total a cobrar: '}${total.toFixed(2)}
            </div>
          </div>

          {/* Campo de Correo Personal para envío de Factura */}
          <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(168, 85, 247, 0.08)', borderRadius: 10, border: '1px solid rgba(168, 85, 247, 0.25)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#c084fc', fontWeight: 600, marginBottom: 4 }}>
              <Mail size={14} /> Correo para enviar Factura Electrónica:
            </label>
            <input
              type="email"
              placeholder="cliente@correo.com"
              value={emailFactura}
              onChange={(e) => setEmailFactura(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 8,
                background: '#110d21',
                border: '1px solid #3b2d66',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <small style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'block', marginTop: 3 }}>
              Se enviará la factura detallada a este correo al procesar el cobro.
            </small>
          </div>

          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>Forma de pago:</p>
            <div className="payment-selector">
              {METODOS.map((m) => {
                const Icon = m.icon
                return (
                  <button
                    type="button"
                    key={m.key}
                    className={`btn-payment-method ${metodo === m.key ? 'active' : ''}`}
                    onClick={() => setMetodo(m.key)}
                  >
                    <Icon size={16} />
                    <span>{m.label}</span>
                  </button>
                )
              })}
            </div>
            <PaymentDetails key={metodo} method={metodo} total={total} />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className="btn-add-product" onClick={confirmar} disabled={cobrando}>
            <Receipt size={16} />
            <span>{cobrando ? 'Procesando y enviando factura...' : `Cobrar y Enviar Factura ($${total.toFixed(2)})`}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
