"""
Regenera initialProducts.js:
- Sin duplicados
- Incluye: papitas fritas, salchipapas, maruchan con elote, variedad de comidas
- 4,000 productos únicos
"""
import json, random

# =====================================================================
# BANCO DE PRODUCTOS REALES (sin duplicar)
# =====================================================================

PRODUCTOS_BASE = [
    # ── COMIDAS PRINCIPALES ──────────────────────────────────────────
    ("Pupusas Tradicionales (3 pzas)", "comida", 3.00, "Revueltas, queso con loroco o chicharrón, con curtido y salsa de tomate.", "Salvadoreño"),
    ("Hamburguesa Doble Smash con Papas", "comida", 6.50, "Doble carne angus, queso cheddar fundido, tocino crujiente y papas fritas.", "Popular"),
    ("Pizza Artesanal Pepperoni", "comida", 8.95, "Masa madre a la leña, salsa pomodoro, mozzarella y pepperoni ahumado.", "Chef"),
    ("Tacos de Asada (3 pzas)", "comida", 5.50, "Tortillas palmeadas, carne marinada a la parrilla, guacamole y chirmol.", "Tradicional"),
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
    ("Empanadas de Plátano Maduro", "comida", 2.50, "Masa de plátano rellena de leche y azúcar, fritas y con azúcar glass.", "Dulce"),
    ("Tostadas de Frijol y Queso (3 pzas)", "comida", 3.00, "Tostadas crujientes, frijoles, queso fresco y crema.", "Tradicional"),
    ("Atol Shuco con Frijoles", "comida", 2.00, "Atol de maíz negro fermentado con frijoles y limón.", "Salvadoreño"),
    ("Tamales de Elote (2 pzas)", "comida", 2.50, "Masa de elote dulce con mantequilla y queso, envueltos en tusa.", "Tradicional"),
    ("Tamales de Pollo (2 pzas)", "comida", 3.00, "Masa de maíz con pollo guisado, aceitunas y chiles en hoja de plátano.", "Tradicional"),

    # ── PAPITAS & SNACKS ─────────────────────────────────────────────
    ("Papitas Fritas Caseras Clásicas", "comida", 2.50, "Papas cortadas en hojuelas finas, fritas al instante y saladas al gusto.", "Snack"),
    ("Papitas Fritas con Limón y Chile", "comida", 2.75, "Hojuelas crujientes bañadas en limón fresco y chile en polvo.", "Snack"),
    ("Papitas Fritas con Queso Parmesano", "comida", 3.00, "Papas fritas cubiertas con queso parmesano rallado y ajo.", "Snack"),
    ("Papitas Fritas con Aderezo Ranch", "comida", 3.25, "Papas crujientes con dip de aderezo ranch de la casa.", "Snack"),
    ("Papitas Fritas Estilo Kettle", "comida", 2.75, "Gruesas y crujientes, fritas en aceite de oliva con sal de mar.", "Snack"),
    ("Papitas al Horno con Especias", "comida", 2.50, "Rodajas de papa horneadas con romero, ajo y pimentón.", "Saludable"),
    ("Papitas Onduladas con Salsa Valentina", "comida", 2.75, "Onduladas crujientes bañadas en salsa Valentina picante.", "Snack"),
    ("Papitas Fritas con Guacamole", "comida", 3.50, "Papas crujientes acompañadas de guacamole fresco de aguacate.", "Snack"),
    ("Papitas Fritas BBQ Ahumadas", "comida", 3.00, "Con sabor BBQ intenso, chili powder y un toque de humo.", "Snack"),
    ("Mix de Papitas y Totopos", "comida", 3.25, "Mezcla de papas fritas y totopos con salsa de queso y pico de gallo.", "Snack"),

    # ── SALCHIPAPAS ──────────────────────────────────────────────────
    ("Salchipapas Clásica Simple", "comida", 3.50, "Papas fritas con rodajas de salchicha, ketchup y mayonesa.", "Popular"),
    ("Salchipapas Especial con Queso", "comida", 4.25, "Papas y salchicha bañadas en salsa de queso cheddar fundido.", "Especial"),
    ("Salchipapas Loca con Todo", "comida", 5.00, "Papas, salchicha, queso, tocino, jalapeños, mayo y ketchup.", "Especial"),
    ("Salchipapas con Chimichurri", "comida", 4.50, "Versión argentina: salchicha artesanal, papas rústicas y chimichurri verde.", "Gourmet"),
    ("Salchipapas con Huevo", "comida", 4.75, "La clásica con un huevo estrellado encima, salsa rosada y ají.", "Especial"),
    ("Salchipapas Vegetariana", "comida", 4.00, "Papas fritas con chorizo vegano y queso derretido.", "Saludable"),
    ("Salchipapas Extra Grande", "comida", 6.00, "Porción doble de papas y salchicha, perfecta para compartir.", "Popular"),
    ("Salchipapas con Salsa Negra", "comida", 4.25, "Papas y salchicha bañadas en salsa negra estilo peruano.", "Especial"),
    ("Salchipapas Mixta (Res y Pollo)", "comida", 5.25, "Combinación de salchicha de res y pollo con dos tipos de salsa.", "Especial"),
    ("Salchipapas Gratinada", "comida", 5.50, "Al horno, con queso mozzarella gratinado y rodajas de tomate.", "Chef"),

    # ── MARUCHAN & SOPAS RAMEN ───────────────────────────────────────
    ("Maruchan con Elote Desgranado", "comida", 3.50, "Ramen instantáneo preparado con elote fresco desgranado, limón y chile.", "Popular"),
    ("Maruchan con Elote y Mayonesa", "comida", 3.75, "El clásico con elote, mayonesa Hellmann's y chile piquín.", "Popular"),
    ("Maruchan con Elote y Queso", "comida", 4.00, "Ramen con granos de elote y queso cotija rallado en abundancia.", "Especial"),
    ("Maruchan Preparado Estilo Callejero", "comida", 3.50, "Con elote, pepino, limón, chamoy y chile molido.", "Callejero"),
    ("Maruchan con Camarón y Elote", "comida", 4.50, "Ramen sabor camarón con elote, zanahoria y cebollín.", "Especial"),
    ("Maruchan con Pollo y Elote Tierno", "comida", 4.25, "Ramen sabor pollo con trozos de elote tierno y hierbabuena.", "Especial"),
    ("Maruchan con Verduras y Elote", "comida", 3.75, "Con elote, chícharo, zanahoria y espinacas frescas.", "Saludable"),
    ("Maruchan Picante Extremo con Elote", "comida", 3.75, "Ramen con elote y chile de árbol, serrano y habanero en polvo.", "Picante"),
    ("Maruchan con Elote y Chorizo Frito", "comida", 4.75, "Ramen con elote y trozos de chorizo crujiente.", "Popular"),
    ("Maruchan Bowl Grande con Elote", "comida", 5.00, "Porción grande: ramen, elote desgranado, huevo cocido y verduras.", "Chef"),

    # ── BEBIDAS ──────────────────────────────────────────────────────
    ("Horchata Salvadoreña Tradicional", "bebida", 1.50, "Horchata casera de arroz con canela, vainilla y leche.", "Tradicional"),
    ("Mojito Morado de Moras", "bebida", 3.50, "Ron blanco, moras frescas, hierbabuena, limón y soda.", "Especial"),
    ("Malteada Dark Velvet Chocolate", "bebida", 4.00, "Helado de vainilla, chocolate negro 70%, crema batida.", "Popular"),
    ("Limonada con Hierbabuena", "bebida", 2.00, "Limones frescos, hierbabuena, azúcar y agua mineral.", "Refrescante"),
    ("Cóctel Purple Galaxy Gin", "bebida", 4.50, "Gin, mariposa azul (butterfly pea), tónica y twist de limón.", "Gourmet"),
    ("Cerveza Nacional Fría (Pilsener/Suprema)", "bebida", 1.75, "Lata o botella bien fría. Variedad al momento.", "Clásico"),
    ("Cerveza Stout Artesanal", "bebida", 3.50, "Cerveza negra artesanal local, notas de café y chocolate.", "Craft"),
    ("Frappé Espresso Mocha", "bebida", 3.75, "Espresso doble, leche, chocolate y hielo frappé.", "Café"),
    ("Smoothie Tropical Maracuyá-Mango", "bebida", 3.25, "Pulpa de maracuyá, mango Ataulfo, leche de coco y hielo.", "Tropical"),
    ("Gaseosa Kolashanpan / Coca-Cola 355ml", "bebida", 1.25, "Lata fría de tu preferencia.", "Clásico"),
    ("Agua Pura 600ml", "bebida", 0.75, "Agua purificada en botella sellada.", "Saludable"),
    ("Jugo Natural de Naranja", "bebida", 2.00, "Naranjas frescas exprimidas al momento, sin azúcar añadida.", "Saludable"),
    ("Té Frío de Limón y Jengibre", "bebida", 2.25, "Té negro frío con ralladura de limón y jengibre fresco.", "Refrescante"),
    ("Leche Fría con Chocolate", "bebida", 2.50, "Leche entera con Milo o Nesquik y un toque de canela.", "Clásico"),
    ("Café Negro Express", "bebida", 1.50, "Shot doble de espresso de tueste oscuro.", "Café"),
    ("Café con Leche", "bebida", 2.00, "Espresso con leche vaporizada al gusto.", "Café"),
    ("Agua de Jamaica Fresca", "bebida", 1.50, "Flor de jamaica natural endulzada con azúcar morena.", "Tradicional"),
    ("Agua de Tamarindo", "bebida", 1.50, "Tamarindo natural con toque de chile y limón.", "Tradicional"),
    ("Refresco de Marañón", "bebida", 1.75, "Jugo de marañón salvadoreño ligeramente endulzado.", "Regional"),
    ("Ponche de Frutas Caliente", "bebida", 2.00, "Té de frutas con canela, clavo y piloncillo.", "Tradicional"),
]

# =====================================================================
# EXPANSORES — generan variantes únicas de cada base
# =====================================================================

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

# =====================================================================
# GENERACIÓN
# =====================================================================

TARGET = 4000
used_names = set()
products = []

# 1. Agregar todos los productos base primero
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

# 2. Expandir con variantes únicas hasta llegar a 4,000
random.seed(42)
base_comidas = [(n, c, p, d, t) for n, c, p, d, t in PRODUCTOS_BASE if c == "comida"]
base_bebidas = [(n, c, p, d, t) for n, c, p, d, t in PRODUCTOS_BASE if c == "bebida"]

attempt = 0
while len(products) < TARGET and attempt < 500000:
    attempt += 1
    # alterna 55% comida / 45% bebida
    if random.random() < 0.55:
        base_name, cat, base_price, base_desc, base_tag = random.choice(base_comidas)
        # strip sufijo existente si lo tiene
        core = base_name.split(" - ")[0].split(" [")[0]
        mod = random.choice(ESTILOS_COMIDA + EXTRAS_COMIDA)
        candidate = f"{core} {mod}"
        price = round(base_price + random.uniform(-0.50, 1.50), 2)
        price = max(0.75, price)
        tag = random.choice(TAGS_COMIDA)
        desc = f"{base_desc} Preparado {mod.lower()}."
    else:
        base_name, cat, base_price, base_desc, base_tag = random.choice(base_bebidas)
        core = base_name.split(" - ")[0].split(" [")[0]
        mod = random.choice(ESTILOS_BEBIDA + EXTRAS_BEBIDA)
        candidate = f"{core} {mod}"
        price = round(base_price + random.uniform(-0.25, 0.75), 2)
        price = max(0.50, price)
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

print(f"Generados: {len(products)} productos únicos")
print(f"Intentos: {attempt}")

# =====================================================================
# IMÁGENES
# =====================================================================

FOOD_IMGS = [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1619740455153-bb9d47e1a24f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=600&q=80",
]
DRINK_IMGS = [
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1570197571499-166b36435e9f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
]

# =====================================================================
# ESCRIBIR JS
# =====================================================================

out_lines = ["import pupusasImg from '../assets/pupusas.jpg'\n\n"]
out_lines.append("// Catálogo Oficial de Productos - 4,000 Productos Únicos\n")
out_lines.append("export const INITIAL_PRODUCTS = [\n")

for i, p in enumerate(products):
    if i == 0:
        img = "pupusasImg"
    elif p["category"] == "bebida":
        img = f'"{random.choice(DRINK_IMGS)}"'
    else:
        img = f'"{random.choice(FOOD_IMGS)}"'

    name_js = p["name"].replace("\\", "\\\\").replace('"', '\\"')
    desc_js = p["description"].replace("\\", "\\\\").replace('"', '\\"')

    out_lines.append(f'  {{\n')
    out_lines.append(f'    id: "p{i}",\n')
    out_lines.append(f'    name: "{name_js}",\n')
    out_lines.append(f'    category: "{p["category"]}",\n')
    out_lines.append(f'    price: {p["price"]},\n')
    out_lines.append(f'    description: "{desc_js}",\n')
    out_lines.append(f'    image: {img},\n')
    out_lines.append(f'    tag: "{p["tag"]}"\n')
    out_lines.append(f'  }},\n')

out_lines.append("]\n")

out_path = r"c:\introReact\PuntoVenta1\vistas\src\data\initialProducts.js"
with open(out_path, "w", encoding="utf-8") as f:
    f.writelines(out_lines)

print(f"Archivo escrito: {out_path}")
print(f"Productos únicos: {len(products)}")
