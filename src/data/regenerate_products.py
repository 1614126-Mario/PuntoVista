"""
Regenera initialProducts.js con máxima variedad de comidas:
- 4,000 productos 100% únicos (0 duplicados)
- Más de 850 fotos reales únicas (784 platillos TheMealDB + 73 bebidas + Unsplash)
- Variedades ampliadas: Pupusas (chicharrón, queso, jalapeño...), Hamburguesas,
  Tacos, Papitas, Salchipapas, Maruchan con Elote, Pizzas, Pastas, Carnes,
  Pollo y Alitas, Mariscos, Antojitos Salvadoreños/Mexicanos, Asiática,
  Desayunos, Postres y Bebidas.
- Intercalados al inicio para que se vea gran variedad desde el primer vistazo.
"""
import json
import random

with open(r"c:\introReact\PuntoVenta1\vistas\src\data\fetched_images.json", "r", encoding="utf-8") as f:
    FETCHED = json.load(f)

with open(r"c:\introReact\PuntoVenta1\vistas\src\data\fetched_meals_all.json", "r", encoding="utf-8") as f:
    MEALS_ALL = json.load(f)

# Grupos temáticos para intercalar al inicio del catálogo
GRUPOS_BASE = {
    "pupusas": [
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
    ],
    "hamburguesas": [
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
    ],
    "tacos": [
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
    ],
    "papitas_salchipapas": [
        ("Papitas Fritas Caseras Clásicas", "comida", 2.50, "Papas cortadas en hojuelas finas, fritas al instante y saladas al gusto.", "Snack"),
        ("Papitas Fritas con Limón y Chile", "comida", 2.75, "Hojuelas crujientes bañadas en limón fresco y chile en polvo.", "Snack"),
        ("Papitas Fritas con Queso Parmesano", "comida", 3.00, "Papas fritas cubiertas con queso parmesano rallado y ajo.", "Snack"),
        ("Papitas Fritas con Guacamole", "comida", 3.50, "Papas crujientes acompañadas de guacamole fresco de aguacate.", "Snack"),
        ("Salchipapas Clásica Simple", "comida", 3.50, "Papas fritas con rodajas de salchicha, ketchup y mayonesa.", "Popular"),
        ("Salchipapas Especial con Queso", "comida", 4.25, "Papas y salchicha bañadas en salsa de queso cheddar fundido.", "Especial"),
        ("Salchipapas Loca con Todo", "comida", 5.00, "Papas, salchicha, queso, tocino, jalapeños, mayo y ketchup.", "Especial"),
        ("Salchipapas con Huevo Estrellado", "comida", 4.75, "La clásica con huevo estrellado encima, salsa rosada y ají.", "Especial"),
        ("Salchipapas Mixta (Res y Pollo)", "comida", 5.25, "Combinación de salchicha de res y pollo con dos tipos de salsa.", "Especial"),
        ("Salchipapas Gratinada al Horno", "comida", 5.50, "Al horno, con queso mozzarella gratinado y rodajas de tomate.", "Chef"),
    ],
    "maruchan": [
        ("Maruchan con Elote Desgranado", "comida", 3.50, "Ramen instantáneo preparado con elote fresco desgranado, limón y chile.", "Popular"),
        ("Maruchan con Elote y Mayonesa", "comida", 3.75, "El clásico con elote, mayonesa cremosa y chile piquín.", "Popular"),
        ("Maruchan con Elote y Queso Cotija", "comida", 4.00, "Ramen con granos de elote y queso cotija rallado en abundancia.", "Especial"),
        ("Maruchan Preparado Estilo Callejero", "comida", 3.50, "Con elote, pepino, limón, chamoy y chile molido.", "Callejero"),
        ("Maruchan con Camarón y Elote", "comida", 4.50, "Ramen sabor camarón con elote, zanahoria y cebollín.", "Especial"),
        ("Maruchan Picante Extremo con Elote", "comida", 3.75, "Ramen con elote y chile de árbol, serrano y habanero en polvo.", "Picante"),
        ("Maruchan Bowl Grande con Elote", "comida", 5.00, "Porción grande: ramen, elote desgranado, huevo cocido y verduras.", "Chef"),
    ],
    "pizzas_pastas": [
        ("Pizza Artesanal Pepperoni", "comida", 8.95, "Masa madre horneada a la leña, salsa pomodoro, mozzarella y pepperoni ahumado.", "Chef"),
        ("Pizza Suprema de la Casa", "comida", 10.50, "Pepperoni, jamón, salchicha italiana, pimientos, cebolla y champiñones.", "Popular"),
        ("Pizza Margarita Napolitana", "comida", 8.50, "Salsa San Marzano, mozzarella fresca, albahaca y aceite de oliva extra virgen.", "Clásico"),
        ("Pizza Cuatro Quesos Gourmet", "comida", 9.50, "Mozzarella, parmesano, gorgonzola y queso cheddar fundidos.", "Gourmet"),
        ("Lasaña de Carne a la Boloñesa", "comida", 7.95, "Capas de pasta fresca, salsa boloñesa de res, bechamel y queso gratinado.", "Chef"),
        ("Espagueti Alfredo con Pollo", "comida", 7.50, "Pasta cremosa en salsa Alfredo con parmesano y pechuga de pollo a la plancha.", "Clásico"),
        ("Fettuccine Carbonara Tradicional", "comida", 7.75, "Pasta al dente con salsa cremosa de huevo, queso pecorino y tocino crujiente.", "Gourmet"),
    ],
    "carnes_pollo": [
        ("Alitas Glaseadas BBQ (8 pzas)", "comida", 6.75, "8 piezas crujientes en salsa BBQ dulce, papas rústicas y aderezo ranch.", "Especial"),
        ("Alitas Buffalo Picantes (8 pzas)", "comida", 6.75, "Alitas bañadas en salsa buffalo clásica con apio y aderezo blue cheese.", "Picante"),
        ("Alitas Mango Habanero (8 pzas)", "comida", 7.00, "Balance dulce y picante con glaseado artesanal de mango y chile habanero.", "Especial"),
        ("Pollo Frito Crujiente (3 pzas con Papas)", "comida", 5.95, "Tres piezas de pollo dorado crujiente con papas fritas, ensalada y pan.", "Popular"),
        ("Churrasco Argentino con Chimichurri", "comida", 11.50, "Corte de res a la parrilla acompañado de chimichurri, casamiento y papas.", "Gourmet"),
        ("Costillas de Cerdo en Salsa BBQ", "comida", 10.95, "Medio rack de costillas horneadas a fuego lento con elote asado y papas.", "Chef"),
        ("Fajitas Mixtas de Res y Pollo", "comida", 8.50, "Tiras de res y pollo salteadas con pimientos y cebolla, tortillas y guacamole.", "Popular"),
        ("Pechuga a la Plancha con Ensalada", "comida", 6.50, "Pechuga marinada a las finas hierbas con arroz primavera y ensalada fresca.", "Saludable"),
    ],
    "mariscos": [
        ("Camarones al Ajillo con Arroz", "comida", 9.50, "Camarones salteados en mantequilla de ajo, vino blanco y perejil.", "Gourmet"),
        ("Camarones Empanizados Crujientes", "comida", 9.25, "Camarones jumbo empanizados con salsa tártara y papas fritas.", "Popular"),
        ("Ceviche de Camarón Fresco", "comida", 7.50, "Camarones marinados en limón, tomate, cebolla morada, cilantro y aguacate.", "Refrescante"),
        ("Filete de Pescado a la Plancha", "comida", 8.50, "Filete blanco al limón y hierbas acompañado de vegetales salteados.", "Saludable"),
        ("Mojarra Frita Entera", "comida", 9.95, "Mojarra dorada entera con arroz, ensalada fresca y tortillas.", "Tradicional"),
        ("Arroz con Camarones Estilo Costero", "comida", 8.75, "Arroz salteado con camarones, vegetales y especias de la costa.", "Especial"),
    ],
    "antojitos_mex": [
        ("Yuca Frita con Chicharrón", "comida", 3.50, "Yuca cocida y frita, chicharrón crujiente, curtido y salsa de tomate.", "Salvadoreño"),
        ("Enchiladas Salvadoreñas (3 pzas)", "comida", 4.00, "Tortillas fritas con carne picada, repollo, huevo duro y queso rallado.", "Salvadoreño"),
        ("Pastelitos de Carne (Orden de 4)", "comida", 3.00, "Masa rellena de carne picada o pollo, fritos y con curtido artesanal.", "Salvadoreño"),
        ("Tamales de Elote con Crema (2 pzas)", "comida", 2.50, "Masa de elote dulce con mantequilla y queso, envueltos en tusa.", "Tradicional"),
        ("Tamales de Pollo Salvadoreños (2 pzas)", "comida", 3.00, "Masa de maíz con pollo guisado, papa y aceitunas en hoja de plátano.", "Tradicional"),
        ("Sopa de Pata Salvadoreña", "comida", 6.50, "Tradicional caldo con yuca, güisquil, elote, plátano maduro y limón.", "Salvadoreño"),
        ("Sopa de Gallina India", "comida", 6.95, "Caldo casero con gallina asada a las brasas, arroz, ensalada y tortillas.", "Salvadoreño"),
        ("Burrito Supremo de Pollo", "comida", 5.75, "Tortilla de harina, pollo al carbón, frijoles, arroz y crema ácida.", "Popular"),
        ("Quesadilla de Chorizo Artesanal", "comida", 4.75, "Tortilla grande, queso chihuahua fundido, chorizo frito y pico de gallo.", "Tradicional"),
        ("Nachos Supremos con Carne y Guacamole", "comida", 5.50, "Totopos horneados, queso cheddar, carne molida, jalapeños y guacamole.", "Especial"),
        ("Chilaquiles Verdes con Pollo y Huevo", "comida", 5.25, "Totopos bañados en salsa verde de tomatillo, pollo deshebrado, crema y queso.", "Tradicional"),
        ("Hot Dog Chicago Jumbo", "comida", 4.50, "Salchicha jumbo en pan brioche, pepinos, tomate, mostaza y catsup.", "Clásico"),
        ("Club Sándwich con Papas", "comida", 5.25, "Tres capas: pollo a la plancha, tocino, lechuga, tomate y mayonesa.", "Clásico"),
    ],
    "asiatica": [
        ("Sushi Roll Dragón Especial", "comida", 7.50, "Camarón tempura, aguacate y queso crema, cubierto de salmón y teriyaki.", "Gourmet"),
        ("Sushi California Roll (10 pzas)", "comida", 6.50, "Surimi de cangrejo, pepino, aguacate y ajonjolí tostado.", "Clásico"),
        ("Arroz Frito Tres Delicias", "comida", 5.95, "Arroz salteado al wok con pollo, camarón, cerdo, huevo y cebollín.", "Popular"),
        ("Chow Mein de Pollo y Vegetales", "comida", 6.25, "Fideos salteados al wok con salsa de soya, pollo y vegetales crujientes.", "Especial"),
        ("Ramen Tradicional Tonkotsu", "comida", 8.25, "Caldo cremoso de cerdo, fideos artesanales, huevo marinado y chashu.", "Chef"),
    ],
    "desayunos_postres": [
        ("Desayuno Típico Salvadoreño", "comida", 4.75, "Huevos al gusto, frijoles fritos, plátano maduro, crema, queso fresco y pan.", "Salvadoreño"),
        ("Pancakes con Miel y Frutas Frescas", "comida", 4.50, "Tres esponjosos pancakes con mantequilla, miel de maple, fresas y banano.", "Dulce"),
        ("Empanadas de Plátano con Leche Poleada", "comida", 2.50, "Masa de plátano maduro rellena de leche poleada, fritas y azucaradas.", "Dulce"),
        ("Pastel Tres Leches Artesanal", "comida", 3.50, "Bizcocho húmedo bañado en tres leches con crema batida y canela.", "Dulce"),
        ("Cheesecake de Fresa y Frutos Rojos", "comida", 4.25, "Suave pay de queso sobre base de galleta con coulis de fresas.", "Gourmet"),
        ("Brownie Tibio con Helado de Vainilla", "comida", 3.95, "Brownie de chocolate oscuro servido con bola de helado y sirope.", "Popular"),
    ],
    "bebidas": [
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
}

# Pools amplios sin repeticiones por categoría
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
    "pasta": [u for _, u in MEALS_ALL.get("Pasta", [])] + [
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80",
    ],
    "wings": urls_for("alitas", [
        "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80",
    ]),
    "meat": [u for _, u in MEALS_ALL.get("Beef", [])[:30]] + [u for _, u in MEALS_ALL.get("Chicken", [])[:30]] + [u for _, u in MEALS_ALL.get("Pork", [])[:20]],
    "seafood": [u for _, u in MEALS_ALL.get("Seafood", [])],
    "dessert": [u for _, u in MEALS_ALL.get("Dessert", [])[:40]] + [u for _, u in MEALS_ALL.get("Breakfast", [])],
    "sushi": urls_for("sushi", [
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
    ]),
    "hotdog": [
        "https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&w=600&q=80",
    ],
    "burrito": urls_for("burrito", [
        "https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=600&q=80",
    ]),
    "general": [u for _, u in MEALS_ALL.get("Side", [])[:30]] + [u for _, u in MEALS_ALL.get("Vegetarian", [])[:30]] + [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
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

def pick_image(name, cat, fixed_img=None):
    if fixed_img:
        return f'"{fixed_img}"'
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
    elif "lasaña" in n or "espagueti" in n or "fettuccine" in n or "pasta" in n:
        key = "pasta"
    elif "alita" in n:
        key = "wings"
    elif "camar" in n or "pescado" in n or "mojarra" in n or "ceviche" in n:
        key = "seafood"
    elif "churrasco" in n or "costilla" in n or "fajita" in n or "pollo" in n or "pechuga" in n:
        key = "meat"
    elif "sushi" in n:
        key = "sushi"
    elif "hot dog" in n:
        key = "hotdog"
    elif "burrito" in n or "quesadilla" in n or "nacho" in n or "enchilada" in n or "chilaquil" in n:
        key = "burrito"
    elif any(w in n for w in ["pancake", "pastel", "cheesecake", "brownie", "empanada", "desayuno"]):
        key = "dessert"
    else:
        key = "general"

    pool = POOLS[key]
    idx = POOL_CURSORS[key]
    POOL_CURSORS[key] = idx + 1
    chosen = pool[idx % len(pool)]
    if chosen == "pupusasImg":
        return "pupusasImg"
    return f'"{chosen}"'

TARGET = 4000
used_names = set()
products = []

# 1. Intercalar todos los grupos base para que desde el inicio haya máxima variedad
max_len = max(len(v) for v in GRUPOS_BASE.values())
for idx in range(max_len):
    for g_items in GRUPOS_BASE.values():
        if idx < len(g_items):
            name, cat, price, desc, tag = g_items[idx]
            if name not in used_names:
                used_names.add(name)
                products.append({
                    "name": name,
                    "category": cat,
                    "price": price,
                    "description": desc,
                    "tag": tag,
                    "img": pick_image(name, cat)
                })

# 2. Agregar cientos de platillos reales únicos de TheMealDB con su foto real única
CAT_ES = {
    "Beef": ("Especialidad de Res", "Corte y preparación especial de carne de res al estilo de la casa.", 8.50, "Carnes"),
    "Chicken": ("Especialidad de Pollo", "Platillo gourmet de pollo sazonado con especias seleccionadas.", 6.95, "Pollo"),
    "Pork": ("Especialidad de Cerdo", "Cerdo preparado a fuego lento con guarnición de la casa.", 7.50, "Carnes"),
    "Seafood": ("Especialidad del Mar", "Mariscos frescos preparados al momento con toque cítrico y hierbas.", 9.25, "Mariscos"),
    "Pasta": ("Pasta Artesanal", "Pasta italiana al dente bañada en salsa casera de la casa.", 7.25, "Italiano"),
    "Vegetarian": ("Opción Vegetariana", "Platillo fresco de vegetales salteados y especias naturales.", 5.75, "Saludable"),
    "Dessert": ("Postre Artesanal", "Postre fresco preparado diariamente en nuestra cocina dulce.", 3.75, "Dulce"),
    "Breakfast": ("Desayuno Gourmet", "Desayuno completo recién hecho ideal para empezar el día.", 5.25, "Desayuno"),
    "Side": ("Guarnición / Acompañamiento", "Porción ideal para acompañar cualquier plato fuerte.", 3.25, "Snack"),
    "Starter": ("Entrada de la Casa", "Aperitivo fresco recién preparado para abrir el apetito.", 4.25, "Entrada"),
    "Lamb": ("Corte de Cordero", "Cordero aromático cocinado con hierbas finas.", 10.50, "Gourmet"),
    "Miscellaneous": ("Especialidad del Chef", "Receta internacional preparada al momento en nuestra cocina.", 6.75, "Chef"),
}

random.seed(42)
# Intercalar por categoría de TheMealDB también
max_m = max(len(v) for v in MEALS_ALL.values())
for idx in range(max_m):
    for m_cat, items in MEALS_ALL.items():
        if idx < len(items):
            m_name, m_img = items[idx]
            pref, desc_tpl, base_p, tag = CAT_ES[m_cat]
            full_name = f"{m_name} ({pref})"
            if full_name not in used_names:
                used_names.add(full_name)
                products.append({
                    "name": full_name,
                    "category": "comida",
                    "price": round(base_p + random.uniform(-0.75, 1.50), 2),
                    "description": f"{desc_tpl} Receta: {m_name}.",
                    "tag": tag,
                    "img": f'"{m_img}"'
                })

# 3. Expandir con variantes únicas hasta completar 4,000 productos
ALL_BASE = [item for lst in GRUPOS_BASE.values() for item in lst]
base_comidas = [x for x in ALL_BASE if x[1] == "comida"]
base_bebidas = [x for x in ALL_BASE if x[1] == "bebida"]

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
TAGS_COMIDA = ["Popular", "Chef", "Especial", "Tradicional", "Gourmet", "Salvadoreño", "Nuevo", "Snack", "Picante", "Callejero", "Saludable", "Regional"]
TAGS_BEBIDA = ["Popular", "Refrescante", "Clásico", "Craft", "Gourmet", "Saludable", "Tropical", "Sin Alcohol", "Caliente", "Especial"]

attempt = 0
while len(products) < TARGET and attempt < 500000:
    attempt += 1
    if random.random() < 0.75:
        base_name, cat, base_price, base_desc, _ = random.choice(base_comidas)
        mod = random.choice(ESTILOS_COMIDA + EXTRAS_COMIDA)
        candidate = f"{base_name} {mod}"
        price = max(0.75, round(base_price + random.uniform(-0.50, 1.50), 2))
        tag = random.choice(TAGS_COMIDA)
        desc = f"{base_desc} Preparado {mod.lower()}."
    else:
        base_name, cat, base_price, base_desc, _ = random.choice(base_bebidas)
        mod = random.choice(ESTILOS_BEBIDA + EXTRAS_BEBIDA)
        candidate = f"{base_name} {mod}"
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
            "tag": tag,
            "img": pick_image(candidate, cat)
        })

out_lines = ["import pupusasImg from '../assets/pupusas.jpg'\n\n"]
out_lines.append("// Catálogo Oficial de Productos - 4,000 Productos Únicos y Variados\n")
out_lines.append("export const INITIAL_PRODUCTS = [\n")

for i, p in enumerate(products):
    name_js = p["name"].replace("\\", "\\\\").replace('"', '\\"')
    desc_js = p["description"].replace("\\", "\\\\").replace('"', '\\"')

    out_lines.append("  {\n")
    out_lines.append(f'    id: "p{i}",\n')
    out_lines.append(f'    name: "{name_js}",\n')
    out_lines.append(f'    category: "{p["category"]}",\n')
    out_lines.append(f'    price: {p["price"]},\n')
    out_lines.append(f'    description: "{desc_js}",\n')
    out_lines.append(f'    image: {p["img"]},\n')
    out_lines.append(f'    tag: "{p["tag"]}"\n')
    out_lines.append("  },\n")

out_lines.append("]\n")

out_path = r"c:\introReact\PuntoVenta1\vistas\src\data\initialProducts.js"
with open(out_path, "w", encoding="utf-8") as f:
    f.writelines(out_lines)

comidas_cnt = sum(1 for p in products if p["category"] == "comida")
bebidas_cnt = sum(1 for p in products if p["category"] == "bebida")
unique_imgs = len(set(p["img"] for p in products))
print(f"Generados: {len(products)} | Comidas: {comidas_cnt} | Bebidas: {bebidas_cnt} | Fotos unicas: {unique_imgs}")
