// Datos de cada forma de pago permitida: Efectivo, Tarjeta y Transferencia.

export const PAYMENT_LABELS = {
  cash: 'Efectivo 💵',
  card: 'Tarjeta 💳',
  transfer: 'Transferencia 📱'
}

export const PAYMENT_INFO = {
  cash: {
    title: 'Pago en Efectivo',
    customerNote: 'Pagas en efectivo al recibir tu pedido. El repartidor lleva tu vuelto exacto preparado.',
    steps: [
      'El cliente entrega el efectivo directamente en caja.',
      'Cuenta el dinero recibido frente al cliente.',
      'Entrega el cambio y la factura electrónica.'
    ],
    notes: 'Se aceptan billetes de $5, $10, $20, $50 y $100 USD.'
  },
  card: {
    title: 'Pago con Tarjeta',
    customerNote: 'El repartidor lleva un terminal (POS) para que pagues con tu tarjeta física o contactless al recibir el pedido.',
    steps: [
      'Inserta, desliza o acerca la tarjeta al terminal (POS).',
      'Digita el monto exacto del total a facturar.',
      'El cliente ingresa su PIN o firma el voucher.',
      'Espera la aprobación y entrega una copia del comprobante.'
    ],
    details: [
      { label: 'Tarjetas aceptadas', value: 'Visa, Mastercard, American Express' },
      { label: 'Tipo', value: 'Crédito y débito' },
      { label: 'Contactless', value: 'Sí, disponible sin PIN hasta $25' }
    ]
  },
  transfer: {
    title: 'Pago por Transferencia',
    customerNote: 'Realiza la transferencia por el total exacto a nuestra cuenta bancaria y adjunta el comprobante.',
    steps: [
      'Comparte con el cliente los datos de la cuenta.',
      'El cliente realiza la transferencia por el total exacto.',
      'Solicita el comprobante y verifica el monto y la referencia.',
      'Confirma el depósito antes de emitir la factura.'
    ],
    details: [
      { label: 'Banco', value: 'Banco Agrícola', copy: true },
      { label: 'Tipo de cuenta', value: 'Corriente' },
      { label: 'N.º de cuenta', value: '000-123456-7', copy: true },
      { label: 'Titular', value: 'La Taberna de los Morenazos, S.A. de C.V.', copy: true },
      { label: 'NIT', value: '0614-251024-102-3', copy: true },
      { label: 'Referencia', value: 'Número de factura u orden', copy: false }
    ]
  }
}
