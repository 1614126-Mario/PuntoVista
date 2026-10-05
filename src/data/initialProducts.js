export const INITIAL_PRODUCTS = [
  // --- COMIDAS ---
  {
    id: 'f1',
    name: 'Hamburguesa Doble Smash',
    category: 'comida',
    price: 145.0,
    description: 'Doble carne angus caramelizada, queso cheddar fundido, tocino crujiente y aderezo especial de la casa.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    tag: 'Popular'
  },
  {
    id: 'f2',
    name: 'Pizza Artesanal Pepperoni',
    category: 'comida',
    price: 180.0,
    description: 'Masa madre horneada a la leña, salsa pomodoro, mozzarella fresca y abundante pepperoni ahumado.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80',
    tag: 'Chef'
  },
  {
    id: 'f3',
    name: 'Tacos de Asada Supreme (3 pzas)',
    category: 'comida',
    price: 95.0,
    description: 'Tortillas de maíz recién hechas, arrachera marinada, guacamole cremoso y cebollitas asadas.',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
    tag: 'Tradicional'
  },
  {
    id: 'f4',
    name: 'Alitas Glaseadas BBQ Moradas',
    category: 'comida',
    price: 135.0,
    description: '8 piezas crujientes bañadas en reducción de salsa BBQ dulce de frutos del bosque con aderezo ranch.',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
    tag: 'Especial'
  },
  {
    id: 'f5',
    name: 'Sushi Roll Dragón Negro',
    category: 'comida',
    price: 165.0,
    description: 'Camarón tempura, aguacate y queso crema por dentro, cubierto de láminas de salmón y salsa de anguila.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
    tag: 'Gourmet'
  },
  {
    id: 'f6',
    name: 'Hot Dog Chicago Jumbo',
    category: 'comida',
    price: 85.0,
    description: 'Salchicha de res tipo polaca de 22cm, tocino, queso derretido, jalapeños y cebolla crujiente.',
    image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80',
    tag: 'Rápido'
  },
  {
    id: 'f7',
    name: 'Papas Trufadas con Parmesano',
    category: 'comida',
    price: 75.0,
    description: 'Corte rústico con aceite de trufa negra, queso parmesano curado y perejil fresco picado.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    tag: 'Botana'
  },
  {
    id: 'f8',
    name: 'Club Sándwich Tradicional',
    category: 'comida',
    price: 120.0,
    description: 'Triple piso con pechuga de pavo, tocino dorado, queso suizo, lechuga, jitomate y mayonesa dijon.',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    tag: 'Clásico'
  },

  // --- BEBIDAS ---
  {
    id: 'b1',
    name: 'Mojito Púrpura de Moras',
    category: 'bebida',
    price: 75.0,
    description: 'Ron blanco, infusión de moras azules, hojas de menta fresca, limón verde y un toque de soda.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    tag: 'Firma'
  },
  {
    id: 'b2',
    name: 'Malteada Dark Velvet',
    category: 'bebida',
    price: 68.0,
    description: 'Helado cremoso de zarzamora y frutos silvestres, crema chantilly morada y chispas de chocolate oscuro.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    tag: 'Dulce'
  },
  {
    id: 'b3',
    name: 'Limonada de Lavanda y Arándano',
    category: 'bebida',
    price: 50.0,
    description: 'Extracto artesanal de lavanda silvestre, jugo de limón eureka, arándanos macerados y agua con gas.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    tag: 'Refrescante'
  },
  {
    id: 'b4',
    name: 'Cóctel Purple Galaxy Gin',
    category: 'bebida',
    price: 95.0,
    description: 'Ginebra botánica aromatizada con flor de campanilla azul (butterfly pea), tónica premium y escarcha violeta.',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
    tag: 'Exclusivo'
  },
  {
    id: 'b5',
    name: 'Cerveza Stout Negra Artesanal',
    category: 'bebida',
    price: 80.0,
    description: 'Cerveza oscura con cuerpo robusto, notas intensas de café espresso tostado y cacao amargo.',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80',
    tag: 'Artesanal'
  },
  {
    id: 'b6',
    name: 'Frappé Espresso Mocha Violet',
    category: 'bebida',
    price: 60.0,
    description: 'Doble shot de espresso chiapaneco, cacao, leche cremosa, hielo frappé y jarabe suave de mora.',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    tag: 'Café'
  },
  {
    id: 'b7',
    name: 'Smoothie Tropical Maracuyá',
    category: 'bebida',
    price: 55.0,
    description: 'Pulpa 100% natural de maracuyá y mango con toque de miel orgánica y semillas de chía.',
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80',
    tag: 'Saludable'
  },
  {
    id: 'b8',
    name: 'Refresco Botella Helada (355ml)',
    category: 'bebida',
    price: 35.0,
    description: 'Servido con hielo escarchado y rodaja de limón. Opciones: Cola Zero, Regular, Manzana o Toronja.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    tag: 'Clásico'
  }
];
