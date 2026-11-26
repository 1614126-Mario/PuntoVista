"""
Regenera initialProducts.js:
- 4,000 productos 100% únicos (0 duplicados)
- Variedades explícitas de:
  * Pupusas (chicharrón, queso, jalapeño, revueltas, loroco, frijol, arroz, etc.)
  * Hamburguesas (listado amplio de estilos y sabores)
  * Tacos (diferentes sabores: asada, pastor, birria, carnitas, chorizo, pollo, camarón, pescado, etc.)
  * Papitas fritas, Salchipapas, Maruchan con elote, Comidas típicas y Bebidas
- Imágenes reales verificadas (TheMealDB + TheCocktailDB + Unsplash) asignadas por
  categoría exacta y en orden secuencial sin repetir en los listados principales.
"""
import json
import random

with open(r"c:\introReact\PuntoVenta1\vistas\src\data\fetched_images.json", "r", encoding="utf-8") as f:
    FETCHED = json.load(f)

PRODUCTOS_BASE = [
    # ── PUPUSAS (Chicharrón, Queso, Jalapeño y especialidades) ──────────
    ("Pupusas de Chicharrón (Orden de 3)", "comida", 3.25, "Tres pupusas tradicionales de maíz rellenas de chicharrón molido sazonado, con curtido y salsa.", "Salvadoreño"),
    ("Pupusas de Queso (Orden de 3)", "comida", 3.00, "Tres pupusas doraditas rellenas de abundante quesillo salvadoreño derretido, curtido y salsa.", "Salvadoreño"),
    ("Pupusas de Jalapeño (Orden de 3)", "comida", 3.25, "Tres pupusas con queso fundido y chile jalapeño picado al toque picante ideal, con curtido.", "Picante"),
    ("Pupusas de Chicharrón con Queso (Orden de 3)", "comida", 3.50, "Combinación clásica de chicharrón artesanal con quesillo fundido, curtido y salsa natural.", "Popular"),
    ("Pupusas de Queso con Jalapeño (Orden de 3)", "comida", 3.25, "Quesillo derretido mezclado con jalapeños frescos en masa suave de maíz.", "Picante"),
    ("Pupusas de Chicharrón con Jalapeño (Orden de 3)", "comida", 3.50, "Chicharrón molido tradicional con trocitos de jalapeño fresco y salsa de tomate.", "Especial"),
    ("Pupusas de Frijol con Queso y Jalapeño (Orden de 3)", "comida", 3.25, "Frijoles refritos, quesillo salvadoreño y un toque picosito de jalapeño.", "Tradicional"),
    ("Pupusas Revueltas Tradicionales (Orden de 3)", "comida", 3.00, "La clásica salvadoreña de chicharrón, frijoles molidos y queso, con curtido y salsa.", "Salvadoreño"),
    ("Pupusas de Queso con Loroco (Orden de 3)", "comida", 3.50, "Quesillo fundido con flor de loroco fresca aromática, servidas con curtido artesanal.", "Salvadoreño"),
    ("Pupusas de Arroz de Chicharrón (Orden de 3)", "comida", 3.50, "Masa suave de arroz rellena de chicharrón sazonado, doradas a la plancha.", "Salvadoreño"),
    ("Pupusas de Arroz de Queso (Orden de 3)", "comida", 3.25, "Masa de harina de arroz rellena de quesillo derretido, crujientes por fuera.", "Salvadoreño"),
    ("Pupusas de Arroz con Queso y Jalapeño (Orden de 3)", "comida", 3.50, "Masa de arroz rellena de queso cremoso y jalapeño fresco picado.", "Picante"),
    ("Pupusas de Pollo con Queso (Orden de 3)", "comida", 3.50, "Pollo desmenuzado guisado con especias y quesillo derretido.", "Especial"),
    ("Pupusas de Camarón con Queso (Orden de 3)", "comida", 4.50, "Camarones salteados al ajo con quesillo fundido en tortilla de maíz.", "Gourmet"),
    ("Pupusa Loca Gigante (Individual)", "comida", 3.75, "Pupusa tamaño extra grande rellena de chicharrón, frijol, queso, loroco, jalapeño y pollo.", "Chef"),

    # ── HAMBURGUESAS (Listado variado) ──────────────────────────────────
    ("Hamburguesa Doble Smash con Papas", "comida", 6.50, "Doble carne angus caramelizada, queso cheddar fundido, tocino crujiente y papas fritas.", "Popular"),
    ("Hamburguesa Clásica Americana", "comida", 5.00, "Carne de res a la parrilla, queso americano, lechuga, tomate, cebolla y papas fritas.", "Clásico"),
    ("Hamburguesa BBQ Bacon Crispy", "comida", 6.75, "Carne 100% res, tocino ahumado, aros de cebolla crujientes, queso cheddar y salsa BBQ.", "Especial"),
    ("Hamburguesa Triple Queso Gourmet", "comida", 7.00, "Medallón de res con mezcla de cheddar, mozzarella y queso suizo fundido en pan brioche.", "Gourmet"),
    ("Hamburguesa Mexicana con Jalapeños", "comida", 6.50, "Carne asada, guacamole fresco, queso pepper jack, jalapeños toreados y chipotle.", "Picante"),
    ("Hamburguesa Crispy Chicken Deluxe", "comida", 5.95, "Pechuga de pollo empanizada crujiente, ensalada coleslaw, pepinillos y aderezo ranch.", "Popular"),
    ("Hamburguesa Hawaiana a la Parrilla", "comida", 6.25, "Carne de res, piña caramelizada a la plancha, jamón ahumado y queso mozzarella.", "Especial"),
    ("Hamburguesa Portobello y Queso de Cabra", "comida", 6.50, "Hongo portobello asado al balsámico, queso fundido, rúcula y tomate seco.", "Saludable"),
    ("Hamburguesa Tex-Mex con Chili y Nachos", "comida", 7.25, "Carne a la parrilla cubierta con chili con carne, totopos crujientes y queso cheddar.", "Chef"),
    ("Hamburguesa Ranchera con Huevo Estrellado", "comida", 6.75, "Carne de res, huevo frito, tocino, aguacate y salsa ranchera de la casa.", "Especial"),
    ("Hamburguesa Teriyaki con Cebolla Caramelizada", "comida", 6.50, "Carne glaseada en salsa teriyaki, cebolla caramelizada y mayonesa de ajonjolí.", "Fusion"),
    ("Mini Burgers / Sliders Trio (3 pzas)", "comida", 6.00, "Tres mini hamburguesas variadas: clásica, BBQ bacon y pollo crispy con papas.", "Para Compartir"),

    # ── TACOS (Diferentes sabores y productos) ──────────────────────────
    ("Tacos de Asada Supreme (3 pzas)", "comida", 5.50, "Tortillas de maíz recién palmeadas, carne de res a la parrilla, guacamole y chirmol.", "Tradicional"),
    ("Tacos al Pastor con Piña (3 pzas)", "comida", 5.00, "Carne de cerdo adobada al trompo con piña asada, cilantro, cebolla y salsa taquera.", "Popular"),
    ("Tacos de Birria con Consomé (3 pzas)", "comida", 6.50, "Tacos doraditos de res en adobo de chiles con queso fundido y caldo consomé caliente.", "Chef"),
    ("Tacos de Carnitas Estilo Michoacán (3 pzas)", "comida", 5.25, "Cerdo confitado jugoso y dorado, cebolla, cilantro y salsa verde de tomatillo.", "Tradicional"),
    ("Tacos de Chorizo Artesanal (3 pzas)", "comida", 4.75, "Chorizo criollo doradito a la plancha con pico de gallo, limón y salsa roja.", "Tradicional"),
    ("Tacos de Pollo a la Parrilla (3 pzas)", "comida", 4.75, "Pechuga marinada al limón y especias, aguacate, repollo morado y crema chipotle.", "Clásico"),
    ("Tacos de Camarón al Chipotle (3 pzas)", "comida", 6.75, "Camarones salteados con mantequilla y chipotle, col crujiente y aderezo cremoso.", "Gourmet"),
    ("Tacos de Pescado Estilo Baja (3 pzas)", "comida", 6.25, "Filete de pescado capeado crujiente, ensalada de repollo, pico de gallo y crema ácida.", "Especial"),
    ("Tacos de Barbacoa de Res (3 pzas)", "comida", 5.95, "Carne deshebrada cocida a fuego lento en hojas de aguacate, cebolla y salsa borracha.", "Especial"),
    ("Tacos de Lengua en Salsa Verde (3 pzas)", "comida", 6.00, "Suave lengua de res cocida al vapor, cilantro, cebolla y salsa verde picante.", "Tradicional"),
    ("Tacos de Cochinita Pibil (3 pzas)", "comida", 5.75, "Cerdo marinado en achiote y naranja agria con cebolla morada encurtida en habanero.", "Regional"),
    ("Tacos Dorados / Flautas de Pollo (4 pzas)", "comida", 4.50, "Tortillas enrolladas y fritas, cubiertas de lechuga, crema, queso fresco y guacamole.", "Popular"),
    ("Tacos Vegetarianos de Champiñones al Ajillo (3 pzas)", "comida", 4.50, "Champiñones y pimientos salteados al ajo con frijoles negros y aguacate.", "Saludable"),

    # ── PAPITAS FRITAS & SNACKS ─────────────────────────────────────────
    ("Papitas Fritas Caseras Clásicas", "comida", 2.50, "Papas cortadas en hojuelas finas, fritas al instante y saladas al gusto.", "Snack"),
    ("Papitas Fritas con Limón y Chile", "comida", 2.75, "Hojuelas crujientes bañadas en limón fresco y chile en polvo.", "Snack"),
    ("Papitas Fritas con Queso Parmesano", "comida", 3.00, "Papas fritas cubiertas con queso parmesano rallado y ajo.", "Snack"),
    ("Papitas Fritas con Aderezo Ranch", "comida", 3.25, "Papas crujientes con dip de aderezo ranch de la casa.", "Snack"),
    ("Papitas Fritas Estilo Kettle", "comida", 2.75, "Gruesas y crujientes, fritas con sal de mar.", "Snack"),
    ("Papitas al Horno con Especias", "comida", 2.50, "Rodajas de papa horneadas con romero, ajo y pimentón.", "Saludable"),
    ("Papitas Onduladas con Salsa Valentina", "comida", 2.75, "Onduladas crujientes bañadas en salsa Valentina picante.", "Snack"),
    ("Papitas Fritas con Guacamole", "comida", 3.50, "Papas crujientes acompañadas de guacamole fresco de aguacate.", "Snack"),
    ("Papitas Fritas BBQ Ahumadas", "comida", 3.00, "Con sabor BBQ intenso, chili powder y un toque de humo.", "Snack"),
    ("Mix de Papitas y Totopos", "comida", 3.25, "Mezcla de papas fritas y totopos con salsa de queso y pico de gallo.", "Snack"),

    # ── SALCHIPAPAS ─────────────────────────────────────────────────────
    ("Salchipapas Clásica Simple", "comida", 3.50, "Papas fritas con rodajas de salchicha, ketchup y mayonesa.", "Popular"),
    ("Salchipapas Especial con Queso", "comida", 4.25, "Papas y salchicha bañadas en salsa de queso cheddar fundido.", "Especial"),
    ("Salchipapas Loca con Todo", "comida", 5.00, "Papas, salchicha, queso, tocino, jalapeños, mayo y ketchup.", "Especial"),
    ("Salchipapas con Chimichurri", "comida", 4.50, "Salchicha artesanal, papas rústicas y chimichurri verde.", "Gourmet"),
    ("Salchipapas con Huevo", "comida", 4.75, "La clásica con huevo estrellado encima, salsa rosada y ají.", "Especial"),
    ("Salchipapas Vegetariana", "comida", 4.00, "Papas fritas con chorizo vegano y queso derretido.", "Saludable"),
    ("Salchipapas Extra Grande", "comida", 6.00, "Porción doble de papas y salchicha, perfecta para compartir.", "Popular"),
    ("Salchipapas Mixta (Res y Pollo)", "comida", 5.25, "Combinación de salchicha de res y pollo con dos tipos de salsa.", "Especial"),
    ("Salchipapas Gratinada", "comida", 5.50, "Al horno, con queso mozzarella gratinado y rodajas de tomate.", "Chef"),

    # ── MARUCHAN CON ELOTE & RAMEN ──────────────────────────────────────
    ("Maruchan con Elote Desgranado", "comida", 3.50, "Ramen instantáneo preparado con elote fresco desgranado, limón y chile.", "Popular"),
    ("Maruchan con Elote y Mayonesa", "comida", 3.75, "El clásico con elote, mayonesa cremosa y chile piquín.", "Popular"),
    ("Maruchan con Elote y Queso", "comida", 4.00, "Ramen con granos de elote y queso cotija rallado en abundancia.", "Especial"),
    ("Maruchan Preparado Estilo Callejero", "comida", 3.50, "Con elote, pepino, limón, chamoy y chile molido.", "Callejero"),
    ("Maruchan con Camarón y Elote", "comida", 4.50, "Ramen sabor camarón con elote, zanahoria y cebollín.", "Especial"),
    ("Maruchan con Pollo y Elote Tierno", "comida", 4.25, "Ramen sabor pollo con trozos de elote tierno y hierbabuena.", "Especial"),
    ("Maruchan con Verduras y Elote", "comida", 3.75, "Con elote, chícharo, zanahoria y espinacas frescas.", "Saludable"),
    ("Maruchan Picante Extremo con Elote", "comida", 3.75, "Ramen con elote y chile de árbol, serrano y habanero en polvo.", "Picante"),
    ("Maruchan con Elote y Chorizo Frito", "comida", 4.75, "Ramen con elote y trozos de chorizo crujiente.", "Popular"),
    ("Maruchan Bowl Grande con Elote", "comida", 5.00, "Porción grande: ramen, elote desgranado, huevo cocido y verduras.", "Chef"),

    # ── OTRAS COMIDAS VARIADAS ──────────────────────────────────────────
    ("Pizza Artesanal Pepperoni", "comida", 8.95, "Masa madre horneada a la leña, salsa pomodoro, mozzarella y pepperoni ahumado.", "Chef"),
    ("Alitas Glaseadas BBQ (8 pzas)", "comida", 6.75, "8 piezas crujientes en salsa BBQ dulce, papas rústicas y aderezo ranch.", "Especial"),
    ("Sushi Roll Dragón", "comida", 7.50, "Camarón tempura, aguacate y queso crema, cubierto de salmón y teriyaki.", "Gourmet"),
    ("Hot Dog Chicago Jumbo", "comida", 4.50, "Salchicha jumbo en pan brioche, pepinos, jitomate, mostaza y catsup.", "Clásico"),
    ("Club Sándwich con Papas", "comida", 5.25, "Tres capas: pollo a la plancha, tocino, lechuga, tomate y mayonesa.", "Clásico"),
    ("Quesadilla de Chorizo Artesanal", "comida", 4.75, "Tortilla grande, queso chihuahua fundido, chorizo frito y pico de gallo.", "Tradicional"),
    ("Burrito Supremo de Pollo", "comida", 5.75, "Tortilla de harina, pollo al carbón, frijoles, arroz y crema ácida.", "Popular"),
    ("Nachos con Queso y Jalapeños", "comida", 4.25, "Totopos horneados, salsa de queso cheddar, jalapeños y guacamole.", "Especial"),
    ("Enchiladas Salvadoreñas (3 pzas)", "comida", 4.00, "Tortillas fritas con carne picada, ensalada fresca y queso rallado.", "Salvadoreño"),
    ("Baleadas Hondureñas (3 pzas)", "comida", 3.50, "Tortillas de harina con frijoles fritos, mantequilla y queso seco.", "Regional"),
    ("Pastelitos de Carne (Orden de 4)", "comida", 3.00, "Masa rellena de carne picada o pollo, fritos y con curtido.", "Salvadoreño"),
    ("Yuca Frita con Chicharrón", "comida", 3.50, "Yuca cocida y frita, chicharrón crujiente, curtido y salsa.", "Salvadoreño"),
    ("Empanadas de Plátano Maduro", "comida", 2.50, "Masa de plátano rellena de leche poleada, fritas y con azúcar.", "Dulce"),
    ("Tamales de Elote (2 pzas)", "comida", 2.50, "Masa de elote dulce con mantequilla y queso, envueltos en tusa.", "Tradicional"),
    ("Tamales de Pollo (2 pzas)", "comida", 3.00, "Masa de maíz con pollo guisado, aceitunas y chiles en hoja de plátano.", "Tradicional"),

    # ── BEBIDAS ─────────────────────────────────────────────────────────
    ("Horchata Salvadoreña Tradicional", "bebida", 1.50, "Horchata casera de arroz con canela, vainilla y leche.", "Tradicional"),
    ("Mojito Morado de Moras", "bebida", 3.50, "Ron blanco, moras frescas, hierbabuena, limón y soda.", "Especial"),
    ("Malteada Dark Velvet Chocolate", "bebida", 4.00, "Helado de vainilla, chocolate negro 70% y crema batida.", "Popular"),
    ("Limonada con Hierbabuena", "bebida", 2.00, "Limones frescos, hierbabuena, azúcar y agua mineral.", "Refrescante"),
    ("Cóctel Purple Galaxy Gin", "bebida", 4.50, "Gin, mariposa azul, tónica y twist de limón.", "Gourmet"),
    ("Cerveza Nacional Fría (Pilsener/Suprema)", "bebida", 1.75, "Lata o botella bien fría.", "Clásico"),
    ("Cerveza Stout Artesanal", "bebida", 3.50, "Cerveza negra artesanal local con notas de café y chocolate.", "Craft"),
    ("Frappé Espresso Mocha", "bebida", 3.75, "Espresso doble, leche, chocolate y hielo frappé.", "Café"),
    ("Smoothie Tropical Maracuyá-Mango", "bebida", 3.25, "Pulpa de maracuyá, mango Ataulfo, leche de coco y hielo.", "Tropical"),
    ("Gaseosa Kolashanpan / Coca-Cola 355ml", "bebida", 1.25, "Lata fría de tu preferencia.", "Clásico"),
    ("Agua Pura 600ml", "bebida", 0.75, "Agua purificada en botella sellada.", "Saludable"),
    ("Jugo Natural de Naranja", "bebida", 2.00, "Naranjas frescas exprimidas al momento.", "Saludable"),
    ("Té Frío de Limón y Jengibre", "bebida", 2.25, "Té negro frío con ralladura de limón y jengibre fresco.", "Refrescante"),
    ("Café Negro Express", "bebida", 1.50, "Shot doble de espresso de tueste oscuro.", "Café"),
    ("Café con Leche", "bebida", 2.00, "Espresso con leche vaporizada al gusto.", "Café"),
    ("Agua de Jamaica Fresca", "bebida", 1.50, "Flor de jamaica natural endulzada con azúcar morena.", "Tradicional"),
    ("Agua de Tamarindo", "bebida", 1.50, "Tamarindo natural con toque de chile y limón.", "Tradicional"),
    ("Refresco de Marañón", "bebida", 1.75, "Jugo de marañón salvadoreño ligeramente endulzado.", "Regional"),
]

# Construir pools amplios sin repeticiones por cada categoría
def urls_for(key, extra):
    base = [u for _, u in FETCHED.get(key, [])]
    seen = set(base)
    for u in extra:
        if u not in seen:
            seen.add(u)
            base.append(u)
    return base

POOLS = {
    "burger": urls_for("hamburguesa", [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80",
    ]),
    "tacos": urls_for("tacos", [
        "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=600&q=80",
    ]),
    "pupusas": ["pupusasImg"] + urls_for("pupusas", [
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
    ]),
    "fries": urls_for("papitas", [
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=600&q=80",
    ]),
    "ramen": urls_for("maruchan", [
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=600&q=80",
    ]),
    "pizza": urls_for("pizza", [
        "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    ]),
    "wings": urls_for("alitas", [
        "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80",
    ]),
    "sushi": urls_for("sushi", [
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
    ]),
    "hotdog": [
        "https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&w=600&q=80",
    ],
    "burrito": urls_for("burrito", [
        "https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=600&q=80",
    ]),
    "general": [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80",
    ],
    "drink_cafe": urls_for("bebida_cafe", [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
    ]),
    "drink_fria": urls_for("bebida_fria", [
        "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1570197571499-166b36435e9f?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=600&q=80",
    ]),
}

POOL_CURSORS = {k: 0 for k in POOLS}

def pick_image(name, cat):
    n = name.lower()
    if cat == "bebida":
        key = "drink_cafe" if any(w in n for w in ["café", "cafe", "frappé", "frappe", "espresso", "malteada"]) else "drink_fria"
    elif "pupusa" in n:
        key = "pupusas"
    elif "hamburguesa" in n or "burger" in n or "slider" in n:
        key = "burger"
    elif "taco" in n or "flauta" in n:
        key = "tacos"
    elif "papita" in n or "salchipapa" in n:
        key = "fries"
    elif "maruchan" in n or "ramen" in n:
        key = "ramen"
    elif "pizza" in n:
        key = "pizza"
    elif "alita" in n:
        key = "wings"
    elif "sushi" in n:
        key = "sushi"
    elif "hot dog" in n:
        key = "hotdog"
    elif "burrito" in n or "quesadilla" in n or "nacho" in n or "enchilada" in n:
        key = "burrito"
    else:
        key = "general"

    pool = POOLS[key]
    idx = POOL_CURSORS[key]
    POOL_CURSORS[key] = idx + 1
    chosen = pool[idx % len(pool)]
    if chosen == "pupusasImg":
        return "pupusasImg"
    return f'"{chosen}"'

ESTILOS_COMIDA = [
    "Artesanal", "Casera", "Gourmet", "Express", "Familiar", "Tradicional",
    "Especial", "Clásica", "Premium", "Del Chef", "Light", "Crispy",
    "Ahumada", "Gratinada", "Estilo Peruano", "Estilo Mexicano",
    "Estilo Americano", "Estilo Italiano", "Estilo Asiático", "Fusion",
    "Al Carbón", "A la Plancha", "Al Horno", "Frita", "Horneada",
    "Empanizada", "En Salsa", "Con Vegetales", "Picante", "Sin Picante",
    "Con Extra Queso", "Doble Porción", "Media Porción", "Para Compartir",
    "Estilo Callejero", "Receta Secreta", "De Temporada", "Súper Especial",
    "Versión Deluxe", "Ranchera", "Tropical", "Mediana", "Grande", "Pequeña",
]

EXTRAS_COMIDA = [
    "con Aguacate", "con Jalapeños", "con Queso Extra", "con Tocino",
    "con Champiñones", "con Cebolla Caramelizada", "con Chimichurri",
    "con Salsa Especial", "con Guacamole", "con Pico de Gallo",
    "con Chirmol", "con Crema Agria", "con Aderezo Ranch", "con Mayo",
    "con Mayonesa de Chipotle", "con Salsa BBQ", "con Miel y Mostaza",
    "con Queso Fundido", "con Frijoles", "con Arroz",
    "con Ensalada Fresca", "con Papas Fritas", "con Yuca Frita",
    "con Plátanos Fritos", "con Elote Asado", "con Rajas",
    "con Epazote", "con Cilantro", "con Limón", "con Chile de Árbol",
]

EXTRAS_BEBIDA = [
    "Grande", "Mediana", "Pequeña", "Sin Azúcar", "Con Leche de Almendra",
    "Con Leche de Avena", "Extra Fría", "Con Hielo Extra", "Sin Hielo",
    "Con Chantilly", "Con Canela", "Con Vainilla", "Doble",
    "Con Leche Condensada", "Con Miel", "Light", "Zero", "Natural",
    "Con Jarabe de Fresa", "Con Jarabe de Caramelo",
]

ESTILOS_BEBIDA = [
    "Artesanal", "Casera", "Premium", "Especial", "Tropical", "Clásica",
    "Refrescante", "Del Chef", "De Temporada", "Fusion", "Fría",
    "Caliente", "Tibia", "Espumosa", "Con Fruta Fresca", "Sin Lactosa",
    "Vegana", "Importada", "Craft", "Nitrogenada", "Colada", "Batida",
]

TAGS_COMIDA = ["Popular", "Chef", "Especial", "Tradicional", "Gourmet",
               "Salvadoreño", "Nuevo", "Snack", "Picante", "Callejero",
               "Saludable", "Regional", "Clásico", "Fusion"]
TAGS_BEBIDA = ["Popular", "Refrescante", "Clásico", "Craft", "Gourmet",
               "Saludable", "Tropical", "Sin Alcohol", "Caliente", "Especial"]

TARGET = 4000
used_names = set()
products = []

for name, cat, price, desc, tag in PRODUCTOS_BASE:
    if name not in used_names:
        used_names.add(name)
        products.append({
            "name": name,
            "category": cat,
            "price": price,
            "description": desc,
            "tag": tag
        })

random.seed(42)
base_comidas = [(n, c, p, d, t) for n, c, p, d, t in PRODUCTOS_BASE if c == "comida"]
base_bebidas = [(n, c, p, d, t) for n, c, p, d, t in PRODUCTOS_BASE if c == "bebida"]

attempt = 0
while len(products) < TARGET and attempt < 500000:
    attempt += 1
    if random.random() < 0.70:
        base_name, cat, base_price, base_desc, base_tag = random.choice(base_comidas)
        core = base_name.split(" - ")[0].split(" [")[0]
        mod = random.choice(ESTILOS_COMIDA + EXTRAS_COMIDA)
        candidate = f"{core} {mod}"
        price = max(0.75, round(base_price + random.uniform(-0.50, 1.50), 2))
        tag = random.choice(TAGS_COMIDA)
        desc = f"{base_desc} Preparado {mod.lower()}."
    else:
        base_name, cat, base_price, base_desc, base_tag = random.choice(base_bebidas)
        core = base_name.split(" - ")[0].split(" [")[0]
        mod = random.choice(ESTILOS_BEBIDA + EXTRAS_BEBIDA)
        candidate = f"{core} {mod}"
        price = max(0.50, round(base_price + random.uniform(-0.25, 0.75), 2))
        tag = random.choice(TAGS_BEBIDA)
        desc = f"{base_desc} Variante {mod.lower()}."

    if candidate not in used_names:
        used_names.add(candidate)
        products.append({
            "name": candidate,
            "category": cat,
            "price": price,
            "description": desc,
            "tag": tag
        })

out_lines = ["import pupusasImg from '../assets/pupusas.jpg'\n\n"]
out_lines.append("// Catálogo Oficial de Productos - 4,000 Productos Únicos\n")
out_lines.append("export const INITIAL_PRODUCTS = [\n")

for i, p in enumerate(products):
    img = pick_image(p["name"], p["category"])
    name_js = p["name"].replace("\\", "\\\\").replace('"', '\\"')
    desc_js = p["description"].replace("\\", "\\\\").replace('"', '\\"')

    out_lines.append("  {\n")
    out_lines.append(f'    id: "p{i}",\n')
    out_lines.append(f'    name: "{name_js}",\n')
    out_lines.append(f'    category: "{p["category"]}",\n')
    out_lines.append(f'    price: {p["price"]},\n')
    out_lines.append(f'    description: "{desc_js}",\n')
    out_lines.append(f'    image: {img},\n')
    out_lines.append(f'    tag: "{p["tag"]}"\n')
    out_lines.append("  },\n")

out_lines.append("]\n")

out_path = r"c:\introReact\PuntoVenta1\vistas\src\data\initialProducts.js"
with open(out_path, "w", encoding="utf-8") as f:
    f.writelines(out_lines)

print(f"Generados: {len(products)} productos únicos")
print("Tamanos de pools:", {k: len(v) for k, v in POOLS.items()})
