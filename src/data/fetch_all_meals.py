import urllib.request
import json

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'PuntoVentaBot/1.0'})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode('utf-8'))

categories = ['Beef', 'Chicken', 'Pork', 'Seafood', 'Pasta', 'Vegetarian', 'Dessert', 'Breakfast', 'Side', 'Starter', 'Lamb', 'Miscellaneous']
all_meals = {}
seen_imgs = set()

for cat in categories:
    try:
        data = fetch_json(f'https://www.themealdb.com/api/json/v1/1/filter.php?c={cat}')
        lst = []
        for m in (data.get('meals') or []):
            img = m.get('strMealThumb')
            name = m.get('strMeal')
            if img and img not in seen_imgs:
                seen_imgs.add(img)
                lst.append((name, img))
        all_meals[cat] = lst
        print(f"{cat}: {len(lst)} platillos con foto unica")
    except Exception as e:
        print(f"{cat}: ERR {e}")

total = sum(len(v) for v in all_meals.values())
print(f"Total platillos reales unicos obtenidos: {total}")

with open(r'c:\introReact\PuntoVenta1\vistas\src\data\fetched_meals_all.json', 'w', encoding='utf-8') as f:
    json.dump(all_meals, f, ensure_ascii=False, indent=2)
