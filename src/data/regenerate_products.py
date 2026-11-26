"""
Regenera initialProducts.js con CERO mezclas de imágenes:
- Cada platillo recibe ESTRICTAMENTE una imagen que corresponde a ese tipo de comida.
- Pupusas: SOLO pupusasImg (y opción de elegir Masa de Maíz o Masa de Arroz).
- Hamburguesas: Carne de Res, Carne de Cerdo, Carne de Pollo (SOLO fotos de hamburguesas).
- Tacos: Carne de Res, Carne de Cerdo, Carne de Lengua, de Birria y de Pollo (SOLO fotos de tacos).
- Carnes, Pollo, Mariscos, Pizzas, Pastas, Papitas/Salchipapas, Maruchan, Postres, Bebidas:
  cada grupo con sus propias imágenes verificadas HTTP 200 sin mezclarse.
"""
import json
import random

with open(r"c:\introReact\PuntoVenta1\vistas\src\data\fetched_images.json", "r", encoding="utf-8") as f:
    FETCHED = json.load(f)

with open(r"c:\introReact\PuntoVenta1\vistas\src\data\fetched_meals_all.json", "r", encoding="utf-8") as f:
    MEALS_ALL = json.load(f)

def filter_meals(cat, include_words, exclude_words=()):
    out = []
    for name, url in MEALS_ALL.get(cat, []):
        nl = name.lower()
        if any(w in nl for w in include_words) and not any(x in nl for x in exclude_words):
            out.append(url)
    return out

# =====================================================================
# POOLS ESTRICTOS POR PLATO (SIN MEZCLAS)
# =====================================================================
POOLS = {
    # Pupusas: SOLO foto real de pupusas salvadoreñas
    "pupusas": ["pupusasImg"],

    # Hamburguesas: SOLO fotos reales de hamburguesas
    "burger": [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80",
    ] + [u for _, u in FETCHED.get("hamburguesa", []) if "arepa" not in _.lower()],

    # Tacos: SOLO fotos reales de tacos
    "tacos": [
        "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=600&q=80",
    ] + [u for n, u in FETCHED.get("tacos", []) if "taco" in n.lower()],

    # Papitas fritas y Salchipapas: SOLO fotos reales de papas fritas
    "fries": [
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=600&q=80",
    ],

    # Maruchan / Ramen: SOLO fotos reales de ramen/fideos
    "ramen": [
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=600&q=80",
    ] + [u for n, u in FETCHED.get("maruchan", []) if "ramen" in n.lower() or "noodle" in n.lower()],

    # Carnes rojas y cerdo (Churrasco, Carne Asada, Costillas, Bistec, Chuletas): SOLO cortes de carne / costillas / asado
    "beef_pork": [
        "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80",
    ] + filter_meals("Beef", ["steak", "asado", "roast", "brisket"], ["pie", "arepa", "sandwich", "stew"])
      + filter_meals("Pork", ["chuleta", "grilled pork", "chops", "rib"], ["pie", "pizza", "bortsch"]),

    # Pollo y Alitas: SOLO fotos reales de pollo asado / frito / alitas
    "chicken": [
        "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80",
    ] + [u for _, u in FETCHED.get("alitas", [])],

    # Mariscos: SOLO fotos reales de camarones / pescado / salmón
    "seafood": [
        "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
    ] + filter_meals("Seafood", ["prawn", "shrimp", "camar", "salmon", "fried fish", "gambas"], ["curry", "pie", "cake", "egg"]),

    # Pizzas: SOLO fotos reales de pizza
    "pizza": [
        "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    ] + [u for n, u in FETCHED.get("pizza", []) if "pizza" in n.lower()],

    # Pastas y Lasañas: SOLO fotos reales de pasta y lasaña
    "pasta": [
        "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80",
    ] + filter_meals("Pasta", ["alfredo", "linguine", "pasta", "lasagna"], ["sandwich"]),

    # Sushi: SOLO foto real de sushi
    "sushi": [
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
    ],

    # Hot Dog: SOLO foto real de hot dog
    "hotdog": [
        "https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&w=600&q=80",
    ],

    # Burritos / Quesadillas / Nachos / Antojitos
    "antojitos": [
        "https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    ],

    # Postres y Desayunos: SOLO fotos reales de postres/pancakes/desayuno
    "dessert": [
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80",
    ],

    # Bebidas
    "drink_cafe": [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
    ] + [u for _, u in FETCHED.get("bebida_cafe", [])],

    "drink_fria": [
        "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1570197571499-166b36435e9f?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=600&q=80",
    ] + [u for _, u in FETCHED.get("bebida_fria", [])],
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
    elif "taco" in n or "flauta" in n or "quesabirria" in n:
        key = "tacos"
    elif "papita" in n or "salchipapa" in n:
        key = "fries"
    elif "maruchan" in n or "ramen" in n:
        key = "ramen"
    elif "pizza" in n:
        key = "pizza"
    elif "lasaña" in n or "espagueti" in n or "fettuccine" in n or "pasta" in n:
        key = "pasta"
    elif "sushi" in n:
        key = "sushi"
    elif "hot dog" in n:
        key = "hotdog"
    elif any(w in n for w in ["camar", "pescado", "mojarra", "ceviche", "salmón", "salmon", "mariscos"]):
        key = "seafood"
    elif any(w in n for w in ["pollo", "alita", "pechuga"]):
        key = "chicken"
    elif any(w in n for w in ["churrasco", "carne", "costilla", "bistec", "lomo", "filete", "chuleta", "arrachera", "milanesa", "brocheta", "fajita", "res", "cerdo"]):
        key = "beef_pork"
    elif any(w in n for w in ["pancake", "pastel", "cheesecake", "brownie", "empanada", "desayuno", "tres leches"]):
        key = "dessert"
    else:
        key = "antojitos"

    pool = POOLS[key]
    idx = POOL_CURSORS[key]
    POOL_CURSORS[key] = idx + 1
    chosen = pool[idx % len(pool)]
    if chosen == "pupusasImg":
        return "pupusasImg"
    return f'"{chosen}"'

# =====================================================================
# GRUPOS DE PLATILLOS (INCLUYENDO TODAS LAS VARIEDADES PEDIDAS)
# =====================================================================
GRUPOS_BASE = {
    "pupusas": [
        ("Pupusas de Chicharrón — Masa de Maíz (Orden de 3)", "comida", 3.25, "Tres pupusas de maíz rellenas de chicharrón molido sazonado, con curtido y salsa.", "Salvadoreño"),
        ("Pupusas de Chicharrón — Masa de Arroz (Orden de 3)", "comida", 3.50, "Tres pupusas suaves de harina de arroz rellenas de chicharrón artesanal.", "Salvadoreño"),
        ("Pupusas de Queso — Masa de Maíz (Orden de 3)", "comida", 3.00, "Tres pupusas de maíz rellenas de abundante quesillo salvadoreño derretido.", "Salvadoreño"),
        ("Pupusas de Queso — Masa de Arroz (Orden de 3)", "comida", 3.25, "Tres pupusas de arroz doraditas rellenas de quesillo salvadoreño.", "Salvadoreño"),
        ("Pupusas de Jalapeño — Masa de Maíz (Orden de 3)", "comida", 3.25, "Queso fundido con chile jalapeño fresco picado en tortilla de maíz.", "Picante"),
        ("Pupusas de Jalapeño — Masa de Arroz (Orden de 3)", "comida", 3.50, "Queso derretido con jalapeño fresco en masa suave de arroz.", "Picante"),
        ("Pupusas de Chicharrón con Queso (Orden de 3)", "comida", 3.50, "Combinación clásica de chicharrón artesanal con quesillo fundido (elige maíz o arroz).", "Popular"),
        ("Pupusas de Queso con Jalapeño (Orden de 3)", "comida", 3.25, "Quesillo derretido mezclado con jalapeños frescos (elige maíz o arroz).", "Picante"),
        ("Pupusas de Chicharrón con Jalapeño (Orden de 3)", "comida", 3.50, "Chicharrón molido tradicional con jalapeño fresco y salsa de tomate.", "Especial"),
        ("Pupusas de Frijol con Queso y Jalapeño (Orden de 3)", "comida", 3.25, "Frijoles refritos, quesillo salvadoreño y toque picosito de jalapeño.", "Tradicional"),
        ("Pupusas Revueltas Tradicionales (Orden de 3)", "comida", 3.00, "Chicharrón, frijoles molidos y queso (elige masa de maíz o arroz).", "Salvadoreño"),
        ("Pupusas de Queso con Loroco (Orden de 3)", "comida", 3.50, "Quesillo fundido con flor de loroco fresca aromática, con curtido y salsa.", "Salvadoreño"),
        ("Pupusas de Pollo con Queso (Orden de 3)", "comida", 3.50, "Pollo desmenuzado guisado con especias y quesillo derretido.", "Especial"),
        ("Pupusas de Camarón con Queso (Orden de 3)", "comida", 4.50, "Camarones salteados al ajo con quesillo fundido en tortilla artesanal.", "Gourmet"),
        ("Pupusa Loca Gigante (Individual)", "comida", 3.75, "Pupusa tamaño extra grande rellena de chicharrón, frijol, queso, loroco y jalapeño.", "Chef"),
    ],
    "hamburguesas": [
        # Carne de Res
        ("Hamburguesa de Carne de Res Doble Smash", "comida", 6.50, "Doble carne 100% de res angus caramelizada, queso cheddar, tocino y papas fritas.", "Carne de Res"),
        ("Hamburguesa de Carne de Res Clásica Americana", "comida", 5.00, "Carne de res a la parrilla, queso americano, lechuga, tomate, cebolla y papas.", "Carne de Res"),
        ("Hamburguesa de Carne de Res BBQ Bacon", "comida", 6.75, "Carne de res, tocino ahumado, aros de cebolla crujientes, cheddar y salsa BBQ.", "Carne de Res"),
        ("Hamburguesa de Carne de Res Mexicana con Jalapeños", "comida", 6.50, "Carne de res asada, guacamole, queso pepper jack y jalapeños toreados.", "Carne de Res"),
        ("Hamburguesa de Carne de Res Triple Queso", "comida", 7.00, "Carne de res con mezcla de cheddar, mozzarella y queso suizo en pan brioche.", "Carne de Res"),
        # Carne de Cerdo
        ("Hamburguesa de Carne de Cerdo BBQ (Pulled Pork)", "comida", 6.25, "Jugosa carne de cerdo deshebrada en salsa BBQ ahumada, coleslaw y papas fritas.", "Carne de Cerdo"),
        ("Hamburguesa de Carne de Cerdo a la Parrilla con Piña", "comida", 6.00, "Medallón de cerdo sazonado a la plancha con piña caramelizada y queso mozzarella.", "Carne de Cerdo"),
        ("Hamburguesa Mixta de Carne de Res y Cerdo", "comida", 6.95, "Combinación jugosa de carne de res con tocino y cerdo deshebrado BBQ.", "Mixta"),
        # Carne de Pollo
        ("Hamburguesa de Carne de Pollo Crispy Deluxe", "comida", 5.95, "Pechuga de pollo empanizada crujiente, lechuga, pepinillos y aderezo ranch.", "Carne de Pollo"),
        ("Hamburguesa de Carne de Pollo a la Parrilla", "comida", 5.75, "Pechuga de pollo marinada a la plancha, aguacate fresco, tomate y mayonesa chipotle.", "Carne de Pollo"),
        ("Hamburguesa de Pollo Buffalo Picante", "comida", 6.25, "Pollo crujiente bañado en salsa buffalo picante con aderezo blue cheese.", "Carne de Pollo"),
    ],
    "tacos": [
        # Carne de Res
        ("Tacos de Carne de Res Asada (3 pzas)", "comida", 5.50, "Tortillas de maíz con carne de res asada al carbón, guacamole y chirmol.", "Carne de Res"),
        ("Tacos de Barbacoa de Carne de Res (3 pzas)", "comida", 5.95, "Carne de res deshebrada cocida a fuego lento, cilantro, cebolla y salsa verde.", "Carne de Res"),
        # Carne de Cerdo
        ("Tacos de Carne de Cerdo al Pastor (3 pzas)", "comida", 5.00, "Carne de cerdo adobada al trompo con piña asada, cilantro y cebolla.", "Carne de Cerdo"),
        ("Tacos de Carne de Cerdo Carnitas (3 pzas)", "comida", 5.25, "Cerdo confitado estilo Michoacán con cebolla, cilantro y salsa taquera.", "Carne de Cerdo"),
        ("Tacos de Cochinita Pibil (Cerdo, 3 pzas)", "comida", 5.75, "Cerdo marinado en achiote y naranja agria con cebolla morada encurtida.", "Carne de Cerdo"),
        # Carne de Lengua
        ("Tacos de Carne de Lengua en Salsa Verde (3 pzas)", "comida", 6.25, "Suave carne de lengua de res al vapor, cilantro, cebolla y salsa verde picante.", "Lengua"),
        ("Tacos de Lengua a la Plancha (3 pzas)", "comida", 6.50, "Lengua doradita a la plancha con limón, pico de gallo y salsa roja.", "Lengua"),
        # Birria
        ("Tacos de Birria con Consomé (3 pzas)", "comida", 6.50, "Tacos doraditos de birria de res con queso fundido y caldo consomé caliente.", "Birria"),
        ("Quesabirrias Doradas Especiales (3 pzas)", "comida", 6.95, "Tortillas crujientes bañadas en adobo de birria con abundante queso y consomé.", "Birria"),
        # Pollo
        ("Tacos de Carne de Pollo a la Parrilla (3 pzas)", "comida", 4.75, "Pechuga de pollo marinada al limón, aguacate, repollo morado y crema chipotle.", "Pollo"),
        ("Tacos Dorados / Flautas de Pollo (4 pzas)", "comida", 4.50, "Tortillas doradas rellenas de pollo, con lechuga, crema, queso y guacamole.", "Pollo"),
        # Mariscos
        ("Tacos de Camarón al Chipotle (3 pzas)", "comida", 6.75, "Camarones salteados con mantequilla y chipotle, col crujiente y aderezo.", "Mariscos"),
    ],
    "carnes_parrilla": [
        ("Churrasco Argentino con Chimichurri", "comida", 11.50, "Corte de res a la parrilla acompañado de chimichurri, casamiento y papas.", "Carnes"),
        ("Carne Asada Salvadoreña con Chirmol", "comida", 8.95, "Carne de res marinada a las brasas con casamiento, queso fresco y tortillas.", "Salvadoreño"),
        ("Costillas de Cerdo en Salsa BBQ", "comida", 10.95, "Medio rack de costillas horneadas a fuego lento con elote asado y papas.", "Carnes"),
        ("Bistec Encebollado Casero", "comida", 7.95, "Suave bistec de res salteado con cebolla caramelizada, arroz y ensalada.", "Carnes"),
        ("Lomo Saltado Estilo Peruano", "comida", 9.50, "Tiras de lomo de res al wok con tomate, cebolla morada y papas fritas.", "Carnes"),
        ("Filete Mignon a la Parrilla", "comida", 13.50, "Medallón tierno de lomito en salsa de champiñones y puré de papas.", "Gourmet"),
        ("Chuletas de Cerdo Ahumadas (2 pzas)", "comida", 8.50, "Chuletas jugosas glaseadas en miel y mostaza con vegetales salteados.", "Carnes"),
        ("Arrachera Norteña a las Brasas", "comida", 10.50, "Corte marinado servido con guacamole, cebollines y tortillas calientes.", "Carnes"),
        ("Milanesa de Res Empanizada", "comida", 7.75, "Crujiente milanesa dorada acompañada de papas fritas y ensalada fresca.", "Carnes"),
        ("Alitas Glaseadas BBQ (8 pzas)", "comida", 6.75, "8 piezas crujientes en salsa BBQ dulce, papas rústicas y aderezo ranch.", "Pollo"),
        ("Pollo Frito Crujiente (3 pzas con Papas)", "comida", 5.95, "Tres piezas de pollo dorado crujiente con papas fritas y ensalada.", "Pollo"),
        ("Pollo Asado al Carbón (1/2 Pollo)", "comida", 7.50, "Medio pollo marinado a las brasas con tortillas, chirmol y ensalada.", "Pollo"),
        ("Pechuga Cordon Bleu Gratinada", "comida", 8.25, "Pechuga rellena de jamón y queso suizo en salsa cremosa de champiñones.", "Pollo"),
    ],
    "papitas_salchipapas": [
        ("Papitas Fritas Caseras Clásicas", "comida", 2.50, "Papas cortadas en hojuelas finas, fritas al instante y saladas al gusto.", "Snack"),
        ("Papitas Fritas con Limón y Chile", "comida", 2.75, "Hojuelas crujientes bañadas en limón fresco y chile en polvo.", "Snack"),
        ("Papitas Fritas con Queso Parmesano", "comida", 3.00, "Papas fritas cubiertas con queso parmesano rallado y ajo.", "Snack"),
        ("Salchipapas Clásica Simple", "comida", 3.50, "Papas fritas con rodajas de salchicha, ketchup y mayonesa.", "Popular"),
        ("Salchipapas Especial con Queso", "comida", 4.25, "Papas y salchicha bañadas en salsa de queso cheddar fundido.", "Especial"),
        ("Salchipapas Loca con Todo", "comida", 5.00, "Papas, salchicha, queso, tocino, jalapeños, mayo y ketchup.", "Especial"),
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
    ],
    "pizzas_pastas": [
        ("Pizza Artesanal Pepperoni", "comida", 8.95, "Masa madre horneada a la leña, salsa pomodoro, mozzarella y pepperoni ahumado.", "Chef"),
        ("Pizza Suprema de la Casa", "comida", 10.50, "Pepperoni, jamón, salchicha italiana, pimientos, cebolla y champiñones.", "Popular"),
        ("Pizza Cuatro Quesos Gourmet", "comida", 9.50, "Mozzarella, parmesano, gorgonzola y queso cheddar fundidos.", "Gourmet"),
        ("Lasaña de Carne a la Boloñesa", "comida", 7.95, "Capas de pasta fresca, salsa boloñesa de res, bechamel y queso gratinado.", "Chef"),
        ("Espagueti Alfredo con Pollo", "comida", 7.50, "Pasta cremosa en salsa Alfredo con parmesano y pechuga a la plancha.", "Clásico"),
        ("Fettuccine Carbonara Tradicional", "comida", 7.75, "Pasta al dente con salsa cremosa de huevo, queso pecorino y tocino.", "Gourmet"),
    ],
    "mariscos": [
        ("Camarones al Ajillo con Arroz", "comida", 9.50, "Camarones salteados en mantequilla de ajo, vino blanco y perejil.", "Gourmet"),
        ("Camarones Empanizados Crujientes", "comida", 9.25, "Camarones jumbo empanizados con salsa tártara y papas fritas.", "Popular"),
        ("Ceviche de Camarón Fresco", "comida", 7.50, "Camarones marinados en limón, tomate, cebolla morada, cilantro y aguacate.", "Refrescante"),
        ("Filete de Pescado a la Plancha", "comida", 8.50, "Filete blanco al limón y hierbas acompañado de vegetales salteados.", "Saludable"),
        ("Mojarra Frita Entera", "comida", 9.95, "Mojarra dorada entera con arroz, ensalada fresca y tortillas.", "Tradicional"),
    ],
    "otros_antojitos": [
        ("Yuca Frita con Chicharrón", "comida", 3.50, "Yuca cocida y frita, chicharrón crujiente, curtido y salsa de tomate.", "Salvadoreño"),
        ("Sushi Roll Dragón Especial", "comida", 7.50, "Camarón tempura, aguacate y queso crema, cubierto de salmón y teriyaki.", "Gourmet"),
        ("Hot Dog Chicago Jumbo", "comida", 4.50, "Salchicha jumbo en pan brioche, pepinos, tomate, mostaza y catsup.", "Clásico"),
        ("Burrito Supremo de Pollo", "comida", 5.75, "Tortilla de harina, pollo al carbón, frijoles, arroz y crema ácida.", "Popular"),
        ("Nachos Supremos con Carne y Guacamole", "comida", 5.50, "Totopos horneados, queso cheddar, carne molida, jalapeños y guacamole.", "Especial"),
        ("Pastel Tres Leches Artesanal", "comida", 3.50, "Bizcocho húmedo bañado en tres leches con crema batida y canela.", "Dulce"),
        ("Cheesecake de Fresa y Frutos Rojos", "comida", 4.25, "Suave pay de queso sobre base de galleta con coulis de fresas.", "Gourmet"),
        ("Pancakes con Miel y Frutas Frescas", "comida", 4.50, "Tres esponjosos pancakes con mantequilla, miel de maple y fresas.", "Desayuno"),
    ],
    "bebidas": [
        ("Horchata Salvadoreña Tradicional", "bebida", 1.50, "Horchata casera de arroz con canela, vainilla y leche.", "Tradicional"),
        ("Mojito Morado de Moras", "bebida", 3.50, "Ron blanco, moras frescas, hierbabuena, limón y soda.", "Especial"),
        ("Malteada Dark Velvet Chocolate", "bebida", 4.00, "Helado de vainilla, chocolate negro 70% y crema batida.", "Popular"),
        ("Limonada con Hierbabuena", "bebida", 2.00, "Limones frescos, hierbabuena, azúcar y agua mineral.", "Refrescante"),
        ("Cóctel Purple Galaxy Gin", "bebida", 4.50, "Gin, mariposa azul, tónica y twist de limón.", "Gourmet"),
        ("Cerveza Nacional Fría (Pilsener/Suprema)", "bebida", 1.75, "Lata o botella bien fría.", "Clásico"),
        ("Frappé Espresso Mocha", "bebida", 3.75, "Espresso doble, leche, chocolate y hielo frappé.", "Café"),
        ("Smoothie Tropical Maracuyá-Mango", "bebida", 3.25, "Pulpa de maracuyá, mango Ataulfo, leche de coco y hielo.", "Tropical"),
        ("Gaseosa Kolashanpan / Coca-Cola 355ml", "bebida", 1.25, "Lata fría de tu preferencia.", "Clásico"),
        ("Agua Pura 600ml", "bebida", 0.75, "Agua purificada en botella sellada.", "Saludable"),
        ("Café con Leche", "bebida", 2.00, "Espresso con leche vaporizada al gusto.", "Café"),
        ("Agua de Jamaica Fresca", "bebida", 1.50, "Flor de jamaica natural endulzada con azúcar morena.", "Tradicional"),
    ]
}

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

# 2. Expandir con variantes únicas manteniendo SIEMPRE la imagen exacta del tipo de platillo
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

random.seed(42)
attempt = 0
while len(products) < TARGET and attempt < 500000:
    attempt += 1
    if random.random() < 0.78:
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
            "img": pick_image(base_name, cat)
        })

out_lines = ["import pupusasImg from '../assets/pupusas.jpg'\n\n"]
out_lines.append("// Catálogo Oficial de Productos - 4,000 Productos Únicos con Imágenes Exactas\n")
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

print(f"Generados: {len(products)} productos | Pools: { {k: len(v) for k, v in POOLS.items()} }")
