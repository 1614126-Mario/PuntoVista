#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen2.py - Generates initialProducts.js with 4000 unique products for PuntoVenta1
"""

import random

# ── Image URLs ──────────────────────────────────────────────────────────────
IMG = {
    "pupusa":    "https://images.unsplash.com/photo-1619740455153-bb9d47e1a24f?auto=format&fit=crop&w=600&q=80",
    "burger":   [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=600&q=80",
    ],
    "taco":     [
        "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=600&q=80",
    ],
    "papas":    [
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80",
    ],
    "ramen":    [
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80",
    ],
    "pizza":    [
        "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    ],
    "pollo":    [
        "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    ],
    "sushi":    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
    "ensalada": [
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
    ],
    "postre":   [
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=600&q=80",
    ],
    "bebida":   [
        "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1570197571499-166b36435e9f?auto=format&fit=crop&w=600&q=80",
    ],
    "general":  [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=600&q=80",
    ],
}

def pick(key):
    v = IMG[key]
    if isinstance(v, list):
        return random.choice(v)
    return v

# ── Helper ───────────────────────────────────────────────────────────────────
def esc(s):
    return s.replace("'", "\\'")

# ── Product builder ──────────────────────────────────────────────────────────
products = []
seen_names = set()

def add(name, category, price, description, img_key, tag, img_override=None):
    if name in seen_names:
        return False
    seen_names.add(name)
    image = img_override if img_override else pick(img_key)
    products.append({
        "name": name,
        "category": category,
        "price": round(price, 2),
        "description": description,
        "image": image,
        "tag": tag,
    })
    return True

# ════════════════════════════════════════════════════════════════════════════
#  1. PUPUSAS  (base 10 + tamaños + extras → ~200+)
# ════════════════════════════════════════════════════════════════════════════
pupusa_bases = [
    ("Pupusa de Chicharrón",         1.75, "Rellena de chicharrón molido",         "pupusas"),
    ("Pupusa de Queso",              1.50, "Rellena de queso derretido",            "pupusas"),
    ("Pupusa de Jalapeño",           1.75, "Con jalapeño y queso",                  "pupusas"),
    ("Pupusa Revuelta",              2.00, "Chicharrón y queso mezclados",          "pupusas"),
    ("Pupusa de Loroco con Queso",   1.75, "Flor de loroco con queso",              "pupusas"),
    ("Pupusa de Frijoles con Queso", 1.60, "Frijoles refritos con queso",           "pupusas"),
    ("Pupusa de Pollo",              2.00, "Rellena de pollo desmenuzado",          "pupusas"),
    ("Pupusa de Espinaca con Queso", 1.80, "Espinaca fresca y queso",               "pupusas"),
    ("Pupusa de Ayote",              1.60, "Rellena de ayote tierno",               "pupusas"),
    ("Pupusa de Maíz con Frijoles",  1.60, "Masa de maíz con frijoles",             "pupusas"),
    ("Pupusa de Camarón",            2.50, "Rellena de camarón sazonado",           "pupusas"),
    ("Pupusa de Chorizo",            2.00, "Con chorizo especiado",                 "pupusas"),
    ("Pupusa de Hongos",             1.80, "Hongos salteados con queso",            "pupusas"),
    ("Pupusa de Vegetales",          1.75, "Mix de vegetales frescos",              "pupusas"),
    ("Pupusa de Arroz",              1.50, "Masa de arroz con queso",               "pupusas"),
    ("Pupusa de Elote",              1.60, "Con elote dulce y queso",               "pupusas"),
    ("Pupusa de Frijoles Negros",    1.60, "Frijoles negros con queso",             "pupusas"),
    ("Pupusa de Pavo",               2.25, "Pavo asado desmenuzado",                "pupusas"),
    ("Pupusa de Res",                2.00, "Carne de res molida sazonada",          "pupusas"),
    ("Pupusa de Pepescas",           2.00, "Pepescas fritas con queso",             "pupusas"),
]

pupusa_mods = [
    "", " Grande", " Pequeña", " Estilo Comal", " Estilo Plancha",
    " Extra Queso", " Especial", " al Vapor", " Familiar", " con Curtido",
    " con Crema", " con Salsa Roja", " con Loroco Extra", " Artesanal",
    " Tradicional", " Dorada", " con Chile", " con Tomate",
]

for base_name, base_price, base_desc, tag in pupusa_bases:
    for mod in pupusa_mods:
        full_name = base_name + mod
        price = round(base_price + (0.25 if "Grande" in mod else 0.0) + (0.10 if "Extra" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "pupusa", tag)

# ════════════════════════════════════════════════════════════════════════════
#  2. HAMBURGUESAS (base 20 + mods → ~400+)
# ════════════════════════════════════════════════════════════════════════════
burger_bases = [
    ("Hamburguesa Clásica con Papas",    5.50, "Carne de res con papas fritas"),
    ("Hamburguesa BBQ Doble",            7.00, "Doble carne con salsa BBQ"),
    ("Hamburguesa de Pollo Crispy",      6.00, "Pollo crujiente frito"),
    ("Hamburguesa Vegetariana",          5.50, "Medallón vegetal con vegetales frescos"),
    ("Hamburguesa de Res Angus",         8.00, "Carne Angus premium"),
    ("Hamburguesa Smash Burger",         6.50, "Carne aplastada doble con queso americano"),
    ("Hamburguesa Hawaiana",             6.50, "Con piña y jamón asado"),
    ("Hamburguesa con Hongos y Suizo",   7.00, "Champiñones salteados con queso suizo"),
    ("Hamburguesa Picante Jalapeño",     6.50, "Con jalapeños frescos y salsa picante"),
    ("Hamburguesa Triple Queso",         7.50, "Triple porción de queso derretido"),
    ("Hamburguesa de Pescado",           6.00, "Filete de pescado empanizado"),
    ("Hamburguesa Bacon Lover",          7.50, "Con triple tocino crujiente"),
    ("Hamburguesa Truffle Mushroom",     8.50, "Con aceite de trufa y champiñones"),
    ("Hamburguesa de Cordero",           8.00, "Medallón de cordero con menta"),
    ("Hamburguesa Teriyaki",             7.00, "Con salsa teriyaki y piña"),
    ("Hamburguesa Western BBQ",          7.50, "Con aros de cebolla y BBQ"),
    ("Hamburguesa de Pavo",              6.00, "Medallón de pavo magro"),
    ("Hamburguesa Caprese",              7.00, "Con tomate, albahaca y mozzarella"),
    ("Hamburguesa de Chorizo",           6.50, "Mezcla de res y chorizo"),
    ("Hamburguesa Loaded",               8.00, "Con todo: bacon, queso, jalapeño, cebolla"),
    ("Hamburguesa Cubana",               7.00, "Con jamón, mostaza y pepinillos"),
    ("Hamburguesa Ranch",                6.50, "Con salsa ranch casera"),
    ("Hamburguesa de Atún",              6.00, "Medallón de atún a la parrilla"),
    ("Hamburguesa Italiana",             7.00, "Con salsa marinara y mozzarella"),
    ("Hamburguesa Griega",               7.50, "Con queso feta y aceitunas"),
]

burger_mods = [
    "", " Doble", " con Papas Fritas", " con Aros de Cebolla",
    " con Papas Especiales", " Combo", " con Ensalada", " Extra Grande",
    " con Tocino", " Estilo Gourmet", " al Carbón", " con Aguacate",
    " con Huevo", " con Jalapeño Extra", " Familiar",
]

for base_name, base_price, base_desc in burger_bases:
    for mod in burger_mods:
        full_name = base_name + mod
        price = round(base_price + (1.0 if "Doble" in mod else 0.0) + (0.75 if "Extra" in mod or "Gourmet" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "burger", "hamburguesas")

# ════════════════════════════════════════════════════════════════════════════
#  3. TACOS (base 20 + mods → ~300+)
# ════════════════════════════════════════════════════════════════════════════
taco_bases = [
    ("Tacos de Asada",           3.50, "Carne asada al carbón"),
    ("Tacos de Pollo al Carbón", 3.25, "Pollo marinado a las brasas"),
    ("Tacos de Birria",          4.00, "Birria estilo Jalisco con consomé"),
    ("Tacos de Chorizo",         3.50, "Chorizo frito con cebolla"),
    ("Tacos de Camarón",         4.50, "Camarones al ajillo"),
    ("Tacos de Pastor",          3.50, "Al pastor con piña y cilantro"),
    ("Tacos de Carnitas",        3.75, "Carnitas de cerdo jugosas"),
    ("Tacos de Lengua",          4.00, "Lengua de res tierna"),
    ("Tacos de Barbacoa",        4.00, "Barbacoa de res hecha en hoyo"),
    ("Tacos de Suadero",         3.75, "Suadero crujiente de res"),
    ("Tacos Dorados",            3.25, "Tacos fritos y dorados"),
    ("Tacos de Pescado",         4.00, "Pescado empanizado con col"),
    ("Tacos de Vegetales",       3.00, "Mix de vegetales salteados"),
    ("Tacos de Cochinita Pibil", 4.00, "Cochinita pibil yucateca"),
    ("Tacos de Cabeza",          3.75, "Cabeza de res suave"),
    ("Tacos de Tripa",           3.50, "Tripa crujiente"),
    ("Tacos de Nopales",         3.00, "Nopales con queso"),
    ("Tacos de Frijoles",        2.75, "Frijoles refritos con queso"),
    ("Tacos de Rajas",           3.25, "Rajas con crema y queso"),
    ("Tacos de Mixto",           4.00, "Mezcla de carnes variadas"),
    ("Tacos de Canasta",         2.50, "Tacos de canasta tradicionales"),
    ("Tacos de Tinga",           3.50, "Tinga de pollo chipotle"),
    ("Tacos de Rellena",         3.75, "Morcilla y vísceras fritas"),
    ("Tacos de Campechano",      4.00, "Mezcla de asada y chorizo"),
]

taco_mods = [
    "", " Orden de 3", " Orden de 5", " Especial", " con Guacamole",
    " con Queso Extra", " Estilo Tijuana", " Estilo CDMX", " Picantes",
    " con Salsa Verde", " con Salsa Roja", " con Pico de Gallo",
    " Artesanales", " en Tortilla de Maíz", " en Tortilla de Harina",
]

for base_name, base_price, base_desc in taco_bases:
    for mod in taco_mods:
        full_name = base_name + mod
        price = round(base_price + (1.5 if "Orden de 5" in mod else 0.75 if "Orden de 3" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "taco", "tacos")

# ════════════════════════════════════════════════════════════════════════════
#  4. PAPITAS FRITAS (10+ base × mods)
# ════════════════════════════════════════════════════════════════════════════
papas_bases = [
    ("Papitas Fritas Clásicas",        2.50, "Papas fritas crujientes con sal"),
    ("Papitas Fritas con Queso",       3.25, "Papas con queso fundido"),
    ("Papitas Fritas con Jalapeño",    3.00, "Papas con jalapeño y queso"),
    ("Papitas Fritas Seasoned",        2.75, "Papas con sazón especial"),
    ("Papitas Fritas con Bacon",       3.50, "Papas con tocino crujiente"),
    ("Papitas Fritas con Crema",       3.00, "Papas con crema ácida"),
    ("Papitas Fritas Loaded",          4.00, "Papas cargadas con todo"),
    ("Papitas Fritas con Guacamole",   3.50, "Papas con guacamole fresco"),
    ("Papitas Fritas con Salsa BBQ",   3.00, "Papas con salsa BBQ"),
    ("Papitas Fritas con Ranch",       3.00, "Papas con aderezo ranch"),
    ("Papitas Fritas Curly",           2.75, "Papas rizadas sazonadas"),
    ("Papitas Fritas Waffle",          3.00, "Papas con corte waffle"),
    ("Papitas Fritas Sweet Potato",    3.25, "Papas dulces fritas"),
    ("Papitas Fritas Gratinadas",      3.75, "Papas gratinadas con queso"),
    ("Papitas Fritas con Chorizo",     3.75, "Papas con chorizo frito"),
]

papas_mods = [
    "", " Pequeñas", " Medianas", " Grandes", " Extra Grande",
    " Porción Familiar", " con Dip", " Picantes", " Extra Crujientes",
    " al Horno",
]

for base_name, base_price, base_desc in papas_bases:
    for mod in papas_mods:
        full_name = base_name + mod
        price = round(base_price + (0.5 if "Grandes" in mod or "Extra" in mod or "Familiar" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "papas", "papitas")

# ════════════════════════════════════════════════════════════════════════════
#  5. SALCHIPAPAS (10+ base × mods)
# ════════════════════════════════════════════════════════════════════════════
salchi_bases = [
    ("Salchipapa Clásica",             3.50, "Papas fritas con salchicha"),
    ("Salchipapa con Queso",           4.25, "Con queso fundido encima"),
    ("Salchipapa con Jalapeño",        4.00, "Con jalapeños y queso"),
    ("Salchipapa Especial",            4.50, "Con salsas especiales de la casa"),
    ("Salchipapa con Bacon",           4.75, "Con tocino y queso"),
    ("Salchipapa con Pollo",           4.50, "Con pollo a la plancha"),
    ("Salchipapa Mixta",               4.75, "Salchicha + pollo + papas"),
    ("Salchipapa con Chorizo",         4.50, "Con chorizo frito"),
    ("Salchipapa Loaded",              5.50, "Cargada con queso, bacon y jalapeño"),
    ("Salchipapa con Guacamole",       4.50, "Con guacamole fresco"),
    ("Salchipapa con Crema",           3.75, "Con crema ácida y cebollín"),
    ("Salchipapa Familiar",            7.50, "Porción grande para compartir"),
    ("Salchipapa con Salsa Roja",      4.00, "Con salsa roja picante"),
    ("Salchipapa de Hotdog",           4.00, "Con hot dog en trozos"),
    ("Salchipapa Vegetariana",         3.75, "Sin salchicha, con vegetales"),
]

salchi_mods = [
    "", " Pequeña", " Mediana", " Grande", " Extra Grande",
    " con Aderezo", " Picante", " Doble Salchicha",
    " con Huevo", " Estilo Peruano",
]

for base_name, base_price, base_desc in salchi_bases:
    for mod in salchi_mods:
        full_name = base_name + mod
        price = round(base_price + (1.0 if "Extra" in mod or "Doble" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "papas", "salchipapas")

# ════════════════════════════════════════════════════════════════════════════
#  6. MARUCHAN CON ELOTE (10+ base × mods)
# ════════════════════════════════════════════════════════════════════════════
maruchan_bases = [
    ("Maruchan con Elote Clásico",         3.00, "Ramen instantáneo con elote tierno"),
    ("Maruchan con Elote y Queso",         3.50, "Con elote, queso y crema"),
    ("Maruchan con Elote Picante",         3.25, "Con chile y limón"),
    ("Maruchan con Elote y Pollo",         4.00, "Con pollo desmenuzado y elote"),
    ("Maruchan con Elote y Huevo",         3.50, "Con huevo cocido y elote"),
    ("Maruchan con Elote y Chorizo",       4.25, "Con chorizo frito y elote"),
    ("Maruchan con Elote y Camarón",       4.50, "Con camarón y elote"),
    ("Maruchan con Elote y Vegetales",     3.50, "Con vegetales frescos y elote"),
    ("Maruchan con Elote y Tocino",        4.00, "Con tocino crujiente y elote"),
    ("Maruchan con Elote Estilo Ramen",    3.75, "Estilo ramen japonés con elote"),
    ("Maruchan con Elote Extra",           3.50, "Con doble porción de elote"),
    ("Maruchan con Elote y Aguacate",      4.00, "Con aguacate y elote"),
    ("Maruchan con Elote Cremoso",         3.75, "Con crema especial y elote"),
    ("Maruchan con Elote y Frijoles",      3.50, "Con frijoles y elote"),
    ("Maruchan con Elote en Vaso",         2.75, "Servido en vaso con elote"),
]

maruchan_mods = [
    "", " Estilo Especial", " Super Picante", " con Limón Extra",
    " con Mayonesa", " con Chile en Polvo", " Grande",
    " con Salsa Valentina", " con Chamoy", " Artesanal",
]

for base_name, base_price, base_desc in maruchan_bases:
    for mod in maruchan_mods:
        full_name = base_name + mod
        price = round(base_price + (0.5 if "Grande" in mod or "Extra" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "ramen", "maruchan")

# ════════════════════════════════════════════════════════════════════════════
#  7. BEBIDAS (amplia variedad)
# ════════════════════════════════════════════════════════════════════════════
bebida_bases = [
    # Horchatas
    ("Horchata Tradicional",           2.00, "Bebida de arroz con canela"),
    ("Horchata con Leche",             2.25, "Horchata cremosa con leche"),
    ("Horchata de Morro",              2.25, "Horchata salvadoreña de semilla de morro"),
    ("Horchata Especial",              2.50, "Con cacao y especias"),
    # Jugos
    ("Jugo de Naranja Natural",        2.00, "Jugo fresco de naranja"),
    ("Jugo de Mango",                  2.25, "Jugo natural de mango"),
    ("Jugo de Piña",                   2.00, "Jugo de piña fresca"),
    ("Jugo de Sandía",                 2.00, "Jugo de sandía natural"),
    ("Jugo de Zanahoria",              2.00, "Jugo de zanahoria"),
    ("Jugo Verde",                     2.50, "Espinaca, apio, pepino y manzana"),
    ("Jugo de Guayaba",                2.25, "Jugo de guayaba natural"),
    ("Jugo de Tamarindo",              2.00, "Agua de tamarindo"),
    ("Jugo Mixto de Frutas",           2.50, "Mezcla de frutas tropicales"),
    ("Jugo de Maracuyá",               2.50, "Maracuyá con agua"),
    ("Jugo de Tomate",                 2.00, "Jugo de tomate con limón"),
    # Refrescos
    ("Refresco de Jamaica",            1.75, "Flor de Jamaica"),
    ("Refresco de Tamarindo",          1.75, "Tamarindo con azúcar"),
    ("Refresco de Marañón",            2.00, "Marañón fresco"),
    ("Refresco de Chan",               1.75, "Semillas de chan con limón"),
    ("Refresco de Nance",              2.00, "Nance tropical"),
    ("Refresco de Jocote",             2.00, "Jocote en agua fresca"),
    ("Agua de Coco",                   2.50, "Coco natural"),
    ("Limonada Natural",               1.75, "Limón y azúcar"),
    ("Limonada de Fresa",              2.25, "Con fresas frescas"),
    ("Limonada Menta",                 2.25, "Con menta y jengibre"),
    # Cervezas y alcohólicas
    ("Cerveza Pilsener",               2.50, "Cerveza salvadoreña"),
    ("Cerveza Golden",                 2.50, "Cerveza rubia Golden"),
    ("Cerveza Suprema",                3.00, "Cerveza oscura premium"),
    ("Cerveza Artesanal IPA",          4.50, "IPA artesanal local"),
    ("Cerveza Artesanal Stout",        4.50, "Stout oscura artesanal"),
    ("Cerveza Corona",                 3.00, "Corona con limón"),
    ("Michelada",                      3.50, "Cerveza con limón y sal"),
    ("Michelada Especial",             4.00, "Con clamato y especias"),
    ("Chelada Clásica",                3.00, "Cerveza con sal y limón"),
    # Cafés
    ("Café Americano",                 2.00, "Café negro largo"),
    ("Café Espresso",                  2.00, "Espresso concentrado"),
    ("Café Latte",                     3.00, "Espresso con leche vaporizada"),
    ("Cappuccino",                     3.00, "Con espuma de leche"),
    ("Café Mocha",                     3.50, "Con chocolate y leche"),
    ("Café Frío",                      3.25, "Cold brew sobre hielo"),
    ("Café con Leche",                 2.25, "Café salvadoreño con leche"),
    ("Café Dalgona",                   3.50, "Café batido sobre leche"),
    # Té y otros
    ("Té Verde",                       1.75, "Té verde natural"),
    ("Té de Manzanilla",               1.50, "Manzanilla relajante"),
    ("Té de Jengibre",                 1.75, "Jengibre con limón"),
    ("Chocolate Caliente",             2.50, "Chocolate espeso caliente"),
    ("Atol de Elote",                  2.00, "Atol de elote salvadoreño"),
    ("Atol Shuco",                     2.00, "Maíz fermentado tradicional"),
    ("Atol de Maicena",                1.75, "Maicena con canela"),
    ("Semita con Café",                3.00, "Pan semita con café"),
    # Sodas y otros
    ("Coca-Cola",                      1.50, "Refresco de cola"),
    ("Pepsi",                          1.50, "Refresco Pepsi"),
    ("Sprite",                         1.50, "Refresco de lima-limón"),
    ("Fanta Naranja",                  1.50, "Refresco de naranja"),
    ("Agua Pura",                      0.75, "Agua purificada"),
    ("Agua con Gas",                   1.25, "Agua mineral con gas"),
    ("Gatorade",                       2.00, "Bebida deportiva"),
    ("Red Bull",                       3.50, "Bebida energizante"),
    ("Monster",                        3.50, "Bebida energizante Monster"),
    # Batidos/Smoothies
    ("Batido de Fresa",                3.00, "Batido de fresa con leche"),
    ("Batido de Mango",                3.00, "Batido de mango tropical"),
    ("Batido de Plátano",              2.75, "Batido de plátano cremoso"),
    ("Batido de Chocolate",            3.25, "Batido de chocolate"),
    ("Batido Verde",                   3.50, "Espinaca, manzana y limón"),
    ("Batido de Papaya",               3.00, "Papaya con leche"),
    ("Batido de Aguacate",             3.25, "Aguacate cremoso"),
    ("Smoothie Tropical",              3.50, "Mango, piña y maracuyá"),
    ("Frappuccino de Vainilla",        4.00, "Café frío con vainilla"),
    ("Frappuccino de Caramelo",        4.00, "Café frío con caramelo"),
]

bebida_mods = [
    "", " Grande", " Pequeño", " con Hielo Extra", " sin Azúcar",
    " Caliente", " Frío", " con Leche",
]

for base_name, base_price, base_desc in bebida_bases:
    for mod in bebida_mods:
        full_name = base_name + mod
        price = round(base_price + (0.5 if "Grande" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "bebida", price, desc, "bebida", "bebidas")

# ════════════════════════════════════════════════════════════════════════════
#  8. PIZZA (base × mods)
# ════════════════════════════════════════════════════════════════════════════
pizza_bases = [
    ("Pizza Margarita",           8.00, "Salsa de tomate y mozzarella"),
    ("Pizza Pepperoni",           9.50, "Con pepperoni y queso"),
    ("Pizza Hawaiana",            9.50, "Con jamón y piña"),
    ("Pizza Cuatro Quesos",      10.00, "Mozzarella, cheddar, parmesano y gouda"),
    ("Pizza BBQ Chicken",        10.00, "Pollo BBQ con cebolla roja"),
    ("Pizza Vegetariana",         9.00, "Con vegetales frescos variados"),
    ("Pizza Napolitana",          9.50, "Con anchoas y aceitunas"),
    ("Pizza de Mariscos",        12.00, "Camarón, pulpo y mejillones"),
    ("Pizza de Prosciutto",      11.00, "Jamón prosciutto y rúcula"),
    ("Pizza Calzone",            10.00, "Pizza doblada rellena"),
    ("Pizza Funghi",              9.50, "Con champiñones y trufa"),
    ("Pizza Mexicana",           10.00, "Con jalapeños, chorizo y guacamole"),
    ("Pizza de Pollo y Pesto",   10.00, "Con salsa pesto y pollo"),
    ("Pizza Carbonara",          10.50, "Con tocino y huevo"),
    ("Pizza de Espinaca",         9.50, "Espinaca y ricotta"),
]

pizza_mods = [
    "", " Personal", " Mediana", " Grande", " Familiar",
    " Masa Delgada", " Masa Gruesa", " Orilla de Queso",
    " Sin Gluten", " Mitad y Mitad",
]

for base_name, base_price, base_desc in pizza_bases:
    for mod in pizza_mods:
        full_name = base_name + mod
        price = round(base_price + (3.0 if "Familiar" in mod else 1.5 if "Grande" in mod else -1.5 if "Personal" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "pizza", "pizzas")

# ════════════════════════════════════════════════════════════════════════════
#  9. POLLO / ALITAS
# ════════════════════════════════════════════════════════════════════════════
pollo_bases = [
    ("Alitas BBQ",                      5.00, "Alitas bañadas en salsa BBQ"),
    ("Alitas Buffalo",                  5.00, "Alitas picantes buffalo"),
    ("Alitas Honey Garlic",             5.50, "Alitas con miel y ajo"),
    ("Alitas Teriyaki",                 5.50, "Alitas con salsa teriyaki"),
    ("Alitas Lemon Pepper",             5.00, "Alitas con limón y pimienta"),
    ("Alitas Mango Habanero",           5.50, "Picantes y dulces"),
    ("Alitas al Ajillo",                5.25, "Con ajo y mantequilla"),
    ("Pollo a la Plancha",              6.00, "Pechuga a la plancha sazonada"),
    ("Pollo Asado Entero",             15.00, "Pollo entero asado al carbón"),
    ("Medio Pollo Asado",               8.00, "Medio pollo al carbón"),
    ("Cuarto de Pollo",                 5.00, "Cuarto trasero asado"),
    ("Pollo Frito Clásico",             6.50, "Pollo frito crujiente"),
    ("Pollo en Crema",                  7.00, "Pollo en salsa de crema"),
    ("Pechugas Rellenas",               8.00, "Pechuga rellena de queso y jamón"),
    ("Nuggets de Pollo",                4.50, "12 nuggets crujientes"),
    ("Strips de Pollo",                 5.50, "Tiras de pollo empanizadas"),
    ("Pollo con Arroz y Frijoles",      7.00, "Plato completo típico"),
    ("Pollo en Salsa Verde",            7.00, "Con salsa verde tomatillo"),
    ("Pollo Enchilado",                 6.50, "Marinado en chile rojo"),
    ("Anticuchos de Pollo",             5.00, "Brochetas de pollo al carbón"),
]

pollo_mods = [
    "", " Orden de 6", " Orden de 12", " Orden de 24", " con Papas",
    " con Arroz", " Combo", " Estilo Familiar", " Picante", " Extra Salsa",
]

for base_name, base_price, base_desc in pollo_bases:
    for mod in pollo_mods:
        full_name = base_name + mod
        price = round(base_price + (3.0 if "24" in mod else 1.5 if "12" in mod else 0.75 if "6" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "pollo", "pollo")

# ════════════════════════════════════════════════════════════════════════════
#  10. COMIDAS SALVADOREÑAS
# ════════════════════════════════════════════════════════════════════════════
salva_bases = [
    ("Yuca Frita",                 3.00, "Yuca frita con chicharrón"),
    ("Yuca Hervida",               2.50, "Yuca hervida con curtido"),
    ("Tamales de Elote",           1.75, "Tamales de elote dulce"),
    ("Tamales de Pollo",           2.25, "Tamales con pollo y salsa"),
    ("Tamales Pisques",            2.00, "Tamales de frijoles"),
    ("Atol de Elote",              2.00, "Bebida de elote caliente"),
    ("Pan con Pavo",               4.00, "Pan francés con pavo y ensalada"),
    ("Pan con Pollo",              3.50, "Pan francés con pollo"),
    ("Panes con Chumpe",           4.50, "Pan festivo con pavo"),
    ("Sopa de Pata",               5.00, "Sopa de pata de res"),
    ("Sopa de Frijoles",           3.50, "Sopa espesa de frijoles"),
    ("Sopa de Res",                5.50, "Caldo de res con vegetales"),
    ("Sopa de Pollo",              5.00, "Caldo de pollo con fideos"),
    ("Sopa de Mariscos",           8.00, "Mariscada en caldo"),
    ("Caldo de Mariscos",          8.50, "Caldo espeso de mariscos"),
    ("Arroz con Frijoles",         3.00, "Arroz blanco con frijoles"),
    ("Arroz con Leche",            2.00, "Postre de arroz con leche"),
    ("Plato Típico Completo",      7.50, "Arroz, frijoles, carne y ensalada"),
    ("Encurtido de Vegetales",     1.50, "Vegetales encurtidos"),
    ("Curtido Salvadoreño",        1.00, "Col y zanahoria fermentada"),
    ("Loroco Gratinado",           4.00, "Loroco con queso gratinado"),
    ("Quesillo",                   2.50, "Queso suave salvadoreño"),
    ("Elote Loco",                 3.00, "Elote con mayo, queso y chile"),
    ("Elote en Vaso",              2.50, "Elote en grano con aderezos"),
    ("Riguas de Elote",            2.00, "Tortillas de elote asadas"),
    ("Chuco Estilo Comal",         3.50, "Masa de maíz negro fermentado"),
    ("Frijoles con Chicharrón",    4.00, "Frijoles con chicharrón frito"),
    ("Chicharrón Frito",           4.50, "Chicharrón de cerdo crujiente"),
    ("Carnitas Salvadoreñas",      5.00, "Carne de cerdo frita"),
    ("Pollo Encebollado",          6.00, "Pollo con cebolla caramelizada"),
]

salva_mods = [
    "", " con Tortillas", " Especial", " Grande", " Estilo Casero",
    " con Arroz", " con Frijoles", " Familiar",
]

for base_name, base_price, base_desc in salva_bases:
    for mod in salva_mods:
        full_name = base_name + mod
        price = round(base_price + (1.0 if "Grande" in mod or "Familiar" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "general", "salvadoreño")

# ════════════════════════════════════════════════════════════════════════════
#  11. PASTAS
# ════════════════════════════════════════════════════════════════════════════
pasta_bases = [
    ("Espagueti Boloñesa",        7.00, "Pasta con carne molida y tomate"),
    ("Espagueti Carbonara",       7.50, "Con tocino y huevo"),
    ("Espagueti Alfredo",         7.50, "Con salsa de crema y parmesano"),
    ("Espagueti al Pesto",        7.00, "Con albahaca y piñones"),
    ("Fettuccine Alfredo",        8.00, "Fettuccine con crema"),
    ("Lasaña de Carne",           9.00, "Lasaña con carne y bechamel"),
    ("Lasaña Vegetariana",        8.50, "Lasaña con vegetales"),
    ("Penne Arrabbiata",          7.00, "Penne con salsa picante"),
    ("Penne con Pollo",           8.00, "Penne con pollo y crema"),
    ("Ravioli de Espinaca",       8.50, "Rellenos de espinaca y ricotta"),
    ("Tallarines Saltados",       7.50, "Estilo peruano salteado"),
    ("Linguine de Mariscos",      9.50, "Con camarones y almejas"),
    ("Tortellini en Crema",       8.00, "Rellenos con crema"),
    ("Pasta Primavera",           7.00, "Con vegetales frescos"),
    ("Pasta al Horno",            8.50, "Gratinada en horno"),
]

pasta_mods = [
    "", " Mediana", " Grande", " con Queso Extra", " Picante",
    " con Pan de Ajo", " Estilo Gourmet",
]

for base_name, base_price, base_desc in pasta_bases:
    for mod in pasta_mods:
        full_name = base_name + mod
        price = round(base_price + (1.5 if "Gourmet" in mod else 0.5 if "Grande" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "general", "pastas")

# ════════════════════════════════════════════════════════════════════════════
#  12. ENSALADAS
# ════════════════════════════════════════════════════════════════════════════
ensalada_bases = [
    ("Ensalada César",            5.00, "Lechuga, crutones, parmesano"),
    ("Ensalada César con Pollo",  6.50, "César con pollo a la parrilla"),
    ("Ensalada Griega",           5.50, "Con feta, aceitunas y tomate"),
    ("Ensalada Caprese",          5.00, "Tomate, mozzarella y albahaca"),
    ("Ensalada de Espinaca",      5.50, "Con fresas y almendras"),
    ("Ensalada Waldorf",          5.50, "Con manzana, nuez y apio"),
    ("Ensalada de Atún",          6.00, "Atún con vegetales frescos"),
    ("Ensalada de Camarón",       7.00, "Camarones con aguacate"),
    ("Ensalada Tropical",         5.50, "Con frutas tropicales"),
    ("Ensalada de Quinoa",        6.00, "Con quinoa y vegetales"),
    ("Ensalada Mexicana",         5.50, "Con frijoles, maíz y aguacate"),
    ("Ensalada de Pasta",         5.00, "Pasta fría con vegetales"),
    ("Ensalada de Repollo",       3.00, "Repollo con zanahoria y limón"),
    ("Ensalada Verde Mixta",      4.50, "Mix de lechugas frescas"),
    ("Ensalada de Aguacate",      6.00, "Aguacate con tomate y cebolla"),
]

ensalada_mods = ["", " Mediana", " Grande", " con Aderezo Ranch", " con Vinagreta", " sin Aderezo"]

for base_name, base_price, base_desc in ensalada_bases:
    for mod in ensalada_mods:
        full_name = base_name + mod
        price = round(base_price + (0.5 if "Grande" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "ensalada", "ensaladas")

# ════════════════════════════════════════════════════════════════════════════
#  13. POSTRES
# ════════════════════════════════════════════════════════════════════════════
postre_bases = [
    ("Pastel de Chocolate",       4.00, "Húmedo pastel de chocolate"),
    ("Pastel de Vainilla",        3.75, "Suave pastel de vainilla"),
    ("Pastel de Fresa",           4.00, "Con fresas frescas y crema"),
    ("Pastel de Tres Leches",     4.50, "Clásico pastel tres leches"),
    ("Flan de Caramelo",          3.50, "Flan cremoso con caramelo"),
    ("Flan de Coco",              3.75, "Flan con leche de coco"),
    ("Cheesecake New York",       5.00, "Cheesecake clásico"),
    ("Cheesecake de Fresa",       5.25, "Con cobertura de fresa"),
    ("Brownie con Helado",        4.50, "Brownie caliente con vainilla"),
    ("Helado de Vainilla",        2.50, "Dos bolas de vainilla"),
    ("Helado de Chocolate",       2.50, "Dos bolas de chocolate"),
    ("Helado de Fresa",           2.50, "Dos bolas de fresa"),
    ("Sundae de Chocolate",       3.50, "Con salsa de chocolate"),
    ("Sundae de Caramelo",        3.50, "Con salsa de caramelo"),
    ("Crêpe de Nutella",          4.00, "Crêpe con Nutella y fresa"),
    ("Crêpe de Mango",            4.00, "Crêpe con mango tropical"),
    ("Waffles con Fruta",         4.50, "Waffles con frutas frescas"),
    ("Pancakes de Chocolate",     4.50, "Pancakes con chips"),
    ("Tiramisu",                  5.00, "Clásico tiramisu italiano"),
    ("Panna Cotta",               4.00, "Con salsa de frutos rojos"),
    ("Arroz con Leche",           2.50, "Tradicional con canela"),
    ("Semita Salvadoreña",        1.50, "Pan de semita tradicional"),
    ("Quesadilla de Semita",      1.75, "Quesadilla de queso dulce"),
    ("Marquesote",                2.00, "Pan esponjoso salvadoreño"),
    ("Cajeta de Leche",           2.00, "Dulce de leche artesanal"),
    ("Cocadas",                   1.50, "Dulce de coco"),
    ("Nuégados",                  2.00, "Buñuelos con miel"),
    ("Torrejas",                  2.50, "Pan frito con miel"),
    ("Budín de Pan",              2.50, "Budín casero"),
    ("Mazamorra",                 2.00, "Mazamorra de maíz"),
]

postre_mods = [
    "", " Especial", " Extra Grande", " con Crema", " con Helado",
    " sin Azúcar",
]

for base_name, base_price, base_desc in postre_bases:
    for mod in postre_mods:
        full_name = base_name + mod
        price = round(base_price + (0.5 if "Grande" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "postre", "postres")

# ════════════════════════════════════════════════════════════════════════════
#  14. SUSHI / MARISCOS
# ════════════════════════════════════════════════════════════════════════════
sushi_bases = [
    ("Roll California",            7.00, "Cangrejo, pepino y aguacate"),
    ("Roll Philadelphia",          8.00, "Salmón y queso crema"),
    ("Roll Spicy Tuna",            8.50, "Atún picante"),
    ("Roll Dragon",                9.00, "Aguacate encima con camarón"),
    ("Roll Rainbow",               9.50, "Variedad de pescados encima"),
    ("Roll Volcano",              10.00, "Con cobertura horneada"),
    ("Roll Vegetariano",           7.00, "Con vegetales frescos"),
    ("Nigiri de Salmón",           6.00, "Arroz con salmón"),
    ("Nigiri de Atún",             6.50, "Arroz con atún"),
    ("Sashimi de Salmón",          8.00, "Salmón fresco en láminas"),
    ("Sashimi Mixto",             10.00, "Mezcla de sashimis"),
    ("Ceviche de Camarón",         7.00, "Camarón con limón y tomate"),
    ("Ceviche de Pescado",         7.00, "Pescado marinado en limón"),
    ("Ceviche Mixto",              8.00, "Camarón y pescado mezclados"),
    ("Cocktail de Camarón",        8.00, "Camarón en salsa cóctel"),
    ("Camarones al Mojo",          9.00, "Con salsa de ajo y mantequilla"),
    ("Camarones a la Diabla",      9.00, "Muy picantes"),
    ("Pulpo a la Parrilla",       11.00, "Pulpo asado con aceite de oliva"),
    ("Pescado Frito Entero",       9.00, "Pescado entero frito"),
    ("Filete de Pescado",          8.00, "Filete al limón"),
]

sushi_mods = [
    "", " Orden de 8 piezas", " Orden de 12 piezas", " con Soya Extra",
    " con Wasabi", " Especial",
]

for base_name, base_price, base_desc in sushi_bases:
    for mod in sushi_mods:
        full_name = base_name + mod
        price = round(base_price + (2.0 if "12 piezas" in mod else 1.0 if "8 piezas" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "sushi", "mariscos")

# ════════════════════════════════════════════════════════════════════════════
#  15. HOT DOGS / SANDWICHES
# ════════════════════════════════════════════════════════════════════════════
hotdog_bases = [
    ("Hot Dog Clásico",           2.50, "Con mostaza y ketchup"),
    ("Hot Dog con Queso",         3.00, "Con queso fundido"),
    ("Hot Dog Estilo Chicago",    3.50, "Con pepinillos y mostaza"),
    ("Hot Dog con Bacon",         3.50, "Con tocino crujiente"),
    ("Hot Dog Jalapeño",          3.25, "Con jalapeños picantes"),
    ("Hot Dog con Chili",         3.75, "Con chili de carne"),
    ("Hot Dog Hawaiano",          3.25, "Con piña y teriyaki"),
    ("Sandwich Club",             4.50, "Triple decker con pollo"),
    ("Sandwich de Jamón y Queso", 3.50, "Clásico jamón y queso"),
    ("Sandwich BLT",              4.00, "Bacon, lechuga y tomate"),
    ("Sandwich de Atún",          4.00, "Atún con mayonesa"),
    ("Sandwich de Pollo",         4.50, "Pollo a la plancha"),
    ("Sandwich Cubano",           5.00, "Cerdo, jamón y mostaza"),
    ("Panini de Caprese",         4.50, "Con tomate y mozzarella"),
    ("Panini de Pollo",           4.75, "Pollo grillado con pesto"),
]

hotdog_mods = [
    "", " con Papas", " Combo", " Especial", " Extra Grande",
    " con Aderezo",
]

for base_name, base_price, base_desc in hotdog_bases:
    for mod in hotdog_mods:
        full_name = base_name + mod
        price = round(base_price + (1.0 if "Extra" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "general", "sandwiches")

# ════════════════════════════════════════════════════════════════════════════
#  16. DESAYUNOS
# ════════════════════════════════════════════════════════════════════════════
desayuno_bases = [
    ("Desayuno Salvadoreño Completo",  5.00, "Huevos, frijoles, crema y tortillas"),
    ("Huevos Revueltos",               3.00, "Con tomate y cebolla"),
    ("Huevos Fritos",                  2.50, "Dos huevos fritos"),
    ("Huevos Benedictinos",            6.00, "Con jamón y salsa holandesa"),
    ("Omelette de Jamón",              4.50, "Con jamón y queso"),
    ("Omelette Vegetariano",           4.00, "Con vegetales frescos"),
    ("Omelette de Chorizo",            4.75, "Con chorizo y queso"),
    ("Pancakes de Vainilla",           4.00, "Con jarabe de maple"),
    ("Pancakes de Blueberry",          4.50, "Con arándanos frescos"),
    ("French Toast",                   4.00, "Pan francés con canela"),
    ("Granola con Yogurt",             4.00, "Granola artesanal con yogurt"),
    ("Avena con Frutas",               3.50, "Avena cocida con fruta fresca"),
    ("Tostadas con Aguacate",          4.50, "Aguacate sobre tostada crujiente"),
    ("Chilaquiles Rojos",              5.00, "Totopo con salsa roja y queso"),
    ("Chilaquiles Verdes",             5.00, "Con salsa verde y crema"),
    ("Burritos de Desayuno",           4.50, "Con huevo, queso y frijoles"),
    ("Molletes",                       3.50, "Pan con frijoles y queso"),
    ("Tamales de Desayuno",            3.00, "Tamales con huevo"),
    ("Plátanos Fritos",                2.50, "Plátano maduro frito"),
    ("Plátanos con Crema",             3.00, "Plátanos fritos con crema"),
]

desayuno_mods = ["", " con Café", " con Jugo", " Especial", " Grande"]

for base_name, base_price, base_desc in desayuno_bases:
    for mod in desayuno_mods:
        full_name = base_name + mod
        price = round(base_price + (1.0 if "Grande" in mod else 0.0), 2)
        desc = base_desc + (f" {mod.strip()}" if mod.strip() else "")
        add(full_name, "comida", price, desc, "general", "desayunos")

# ════════════════════════════════════════════════════════════════════════════
#  Fill to 4000 with extended variant combos
# ════════════════════════════════════════════════════════════════════════════
print(f"Products so far: {len(products)}")

# Extended modifiers to fill gaps
extra_food_combos = []
extra_styles = ["Estilo Chef", "Estilo Casero", "Edición Especial", "Versión Premium",
                "Estilo Clásico", "Estilo Moderno", "Receta Secreta", "Edición Limitada",
                "Versión Familiar", "Versión Mini", "Versión Jumbo", "Estilo Artesanal",
                "con Toque Especial", "Preparación Lenta", "Estilo Express", "Al Estilo del Chef"]

# More pupusa combos
for base_name, base_price, base_desc, tag in pupusa_bases:
    for style in extra_styles:
        full_name = f"{base_name} {style}"
        add(full_name, "comida", round(base_price + 0.25, 2), f"{base_desc} - {style}", "pupusa", tag)

# More burger combos with extra styles
burger_extra = ["con Salsa Especial", "con Doble Carne", "con Papas Rizadas", "con Aros",
                "con Cebolla Caramelizada", "con Tomate Asado", "con Pimientos",
                "con Rúcula", "con Pepinillos", "con Mostaza Artesanal"]
for base_name, base_price, base_desc in burger_bases:
    for ex in burger_extra:
        full_name = f"{base_name} {ex}"
        add(full_name, "comida", round(base_price + 0.5, 2), f"{base_desc} {ex}", "burger", "hamburguesas")

# More taco combos
taco_extra = ["Estilo Norteño", "Estilo Sureño", "Estilo DF", "Versión Gourmet",
              "con Queso Oaxaca", "con Pico de Gallo Extra", "con Frijoles",
              "Estilo Artesanal", "con Cilantro", "con Cebolla Asada"]
for base_name, base_price, base_desc in taco_bases:
    for ex in taco_extra:
        full_name = f"{base_name} {ex}"
        add(full_name, "comida", round(base_price + 0.25, 2), f"{base_desc} {ex}", "taco", "tacos")

print(f"Products after extra combos: {len(products)}")

# If still under 4000, add numbered variants
def fill_to_4000():
    target = 4000
    base_pool = [
        ("Combo Especial del Día",   6.00, "comida", "general", "combos"),
        ("Plato del Día",            5.50, "comida", "general", "combos"),
        ("Combo Familiar",           12.00, "comida", "general", "combos"),
        ("Promoción Especial",       4.50, "comida", "general", "combos"),
        ("Menú Ejecutivo",           7.00, "comida", "general", "combos"),
        ("Especialidad de la Casa",  8.00, "comida", "general", "combos"),
        ("Plato Sorpresa",           6.50, "comida", "general", "combos"),
        ("Combo Niños",              4.00, "comida", "general", "combos"),
        ("Plato Vegetariano Especial", 5.50, "comida", "ensalada", "vegetariano"),
        ("Combo Saludable",          5.00, "comida", "ensalada", "saludable"),
        ("Bebida Especial del Día",  2.50, "bebida", "bebida", "bebidas"),
        ("Agua Saborizada Natural",  1.50, "bebida", "bebida", "bebidas"),
        ("Infusión del Chef",        2.25, "bebida", "bebida", "bebidas"),
        ("Postre del Chef",          4.00, "comida", "postre", "postres"),
        ("Antojito Especial",        3.50, "comida", "general", "antojitos"),
    ]
    counter = 1
    while len(products) < target:
        for b_name, b_price, b_cat, b_img, b_tag in base_pool:
            if len(products) >= target:
                break
            full_name = f"{b_name} #{counter}"
            if full_name not in seen_names:
                seen_names.add(full_name)
                image = pick(b_img)
                products.append({
                    "name": full_name,
                    "category": b_cat,
                    "price": round(b_price + (counter % 5) * 0.10, 2),
                    "description": f"{b_name} especial variante {counter}",
                    "image": image,
                    "tag": b_tag,
                })
        counter += 1

fill_to_4000()

# Trim to exactly 4000 (deduplicated)
products = products[:4000]

print(f"Final product count: {len(products)}")

# Verify no duplicates
all_names = [p["name"] for p in products]
assert len(all_names) == len(set(all_names)), "DUPLICATES FOUND!"
assert len(products) == 4000, f"Expected 4000, got {len(products)}"

# Count categories
food_count = sum(1 for p in products if p["category"] == "comida")
drink_count = sum(1 for p in products if p["category"] == "bebida")
print(f"comida: {food_count}, bebida: {drink_count}")

# ── Write JS file ─────────────────────────────────────────────────────────────
out_path = r"c:\introReact\PuntoVenta1\vistas\src\data\initialProducts.js"

with open(out_path, "w", encoding="utf-8") as f:
    f.write("import pupusasImg from '../assets/pupusas.jpg';\n\n")
    f.write("export const INITIAL_PRODUCTS = [\n")

    for i, p in enumerate(products):
        if i == 0:
            img_val = "pupusasImg"
        else:
            img_val = f'"{p["image"]}"'

        name_esc = p["name"].replace("'", "\\'").replace('"', '\\"')
        desc_esc = p["description"].replace("'", "\\'").replace('"', '\\"')

        f.write("  {\n")
        f.write(f'    id: "p{i}",\n')
        f.write(f'    name: "{name_esc}",\n')
        f.write(f'    category: "{p["category"]}",\n')
        f.write(f'    price: {p["price"]},\n')
        f.write(f'    description: "{desc_esc}",\n')
        f.write(f'    image: {img_val},\n')
        f.write(f'    tag: "{p["tag"]}",\n')
        f.write("  },\n")

    f.write("];\n")

print("initialProducts.js written successfully!")
print(f"DONE: {food_count} comida + {drink_count} bebida = {len(products)} total")
