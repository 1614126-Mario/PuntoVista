import { useState } from 'react'
import { Banknote, CreditCard, Smartphone, Globe, Copy, Check } from 'lucide-react'
import { PAYMENT_INFO } from '../data/paymentInfo'

const ICONS = {
  cash: Banknote,
  card: CreditCard,
  transfer: Smartphone,
  online: Globe
}

export default function PaymentDetails({ method, total, customer = false }) {
  const [received, setReceived] = useState('')
  const [copiedKey, setCopiedKey] = useState(null)

  const info = PAYMENT_INFO[method]
  if (!info) return null

  const Icon = ICONS[method]
  const receivedNum = parseFloat(received)
  const change = Number.isFinite(receivedNum) ? receivedNum - total : null

  const handleCopy = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    } catch {
      // Sin acceso al portapapeles: se ignora.
    }
  }

  return (
    <div className="payment-details">
      <div className="payment-details-title">
        <Icon size={15} />
        <span>{info.title}</span>
      </div>

      {info.details && (
        <dl className="payment-details-list">
          {info.details.map((d) => {
            const key = `${method}-${d.label}`
            return (
              <div className="payment-details-row" key={key}>
                <dt>{d.label}</dt>
                <dd>
                  <span>{d.value}</span>
                  {d.copy && (
                    <button
                      type="button"
                      className="payment-copy-btn"
                      title="Copiar"
                      onClick={() => handleCopy(key, d.value)}
                    >
                      {copiedKey === key ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                </dd>
              </div>
            )
          })}
        </dl>
      )}

      {customer && <p className="payment-notes" style={{ marginTop: 0 }}>{info.customerNote}</p>}

      {!customer && method === 'cash' && (
        <div className="payment-cash-calc">
          <label htmlFor="cash-received">Efectivo recibido ($)</label>
          <input
            id="cash-received"
            type="number"
            min="0"
            step="0.01"
            className="form-control"
            placeholder={total.toFixed(2)}
            value={received}
            onChange={(e) => setReceived(e.target.value)}
          />
          {change !== null && (
            <div className={`payment-change ${change < 0 ? 'short' : ''}`}>
              {change < 0
                ? `Faltan $${Math.abs(change).toFixed(2)}`
                : `Cambio a entregar: $${change.toFixed(2)}`}
            </div>
          )}
        </div>
      )}

      {!customer && (
        <ol className="payment-steps">
          {info.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}

      <div className="payment-amount-line">
        {customer ? 'Total a pagar:' : 'Monto a cobrar:'} <strong>${total.toFixed(2)}</strong>
      </div>

      {!customer && info.notes && <p className="payment-notes">{info.notes}</p>}
    </div>
  )
}
