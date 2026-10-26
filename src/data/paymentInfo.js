// Datos de cada forma de pago. Edita este archivo con los datos reales del negocio.
// NOTA: los valores de cuentas, enlaces y teléfonos son de EJEMPLO.

export const PAYMENT_LABELS = {
  cash: 'Efectivo 💵',
  card: 'Tarjeta 💳',
  transfer: 'Transferencia 📱',
  online: 'Pago en Línea 🌐'
}

export const PAYMENT_INFO = {
  cash: {
    title: 'Pago en Efectivo',
    customerNote: 'Pagas en efectivo al recibir tu pedido. Ten el monto listo, nuestro repartidor lleva cambio de hasta $20.',
    steps: [
      'El cliente entrega el efectivo directamente en caja.',
      'Cuenta el dinero recibido frente al cliente.',
      'Entrega el cambio y la factura impresa.'
    ],
    notes: 'Se aceptan billetes de hasta $100. Solo dólares USD.'
  },
  card: {
    title: 'Pago con Tarjeta',
    customerNote: 'El repartidor lleva un terminal (POS) para que pagues con tu tarjeta al recibir el pedido.',
    steps: [
      'Inserta, desliza o acerca la tarjeta al terminal (POS).',
      'Digita el monto exacto del total a facturar.',
      'El cliente ingresa su PIN o firma el voucher.',
      'Espera la aprobación y entrega una copia del voucher.'
    ],
    details: [
      { label: 'Tarjetas aceptadas', value: 'Visa, Mastercard, American Express' },
      { label: 'Tipo', value: 'Crédito y débito' },
      { label: 'Contactless', value: 'Sí, hasta $25 sin PIN' }
    ]
  },
  transfer: {
    title: 'Pago por Transferencia',
    customerNote: 'Realiza la transferencia por el total exacto y envía el comprobante por WhatsApp indicando tu folio de pedido.',
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
  },
  online: {
    title: 'Pago en Línea',
    customerNote: 'Paga desde tu celular con el enlace de pago. Tu pedido se prepara cuando el pago esté aprobado.',
    steps: [
      'Envía el enlace de pago al cliente por WhatsApp o correo.',
      'El cliente paga con su tarjeta desde el celular.',
      'Verifica que el pago aparezca como aprobado.',
      'Confirma la entrega o el retiro del pedido.'
    ],
    details: [
      { label: 'Enlace de pago', value: 'https://pay.tabernamorenazos.sv/pedido', copy: true },
      { label: 'WhatsApp pedidos', value: '+503 7000-0000', copy: true },
      { label: 'Correo', value: 'pedidos@tabernamorenazos.sv', copy: true },
      { label: 'Horario', value: 'Lunes a domingo, 11:00 a 23:00' }
    ],
    notes: 'El pedido solo se prepara cuando el pago esté aprobado.'
  }
}
