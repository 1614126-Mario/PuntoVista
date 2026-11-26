import urllib.request
import urllib.parse
import json

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'PuntoVentaBot/1.0'})
    with urllib.request.urlopen(req, timeout=8) as r:
        return json.loads(r.read().decode('utf-8'))

def check_url(url):
    try:
        req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as r:
            return r.status == 200
    except:
        return False

queries = {
    'hamburguesa': ['burger', 'cheeseburger', 'hamburger', 'chicken burger', 'bacon burger'],
    'tacos': ['taco', 'tacos', 'al pastor', 'birria', 'carnitas', 'fish tacos'],
    'pupusas': ['pupusa', 'pupusas', 'arepa', 'gordita', 'quesadilla'],
    'papitas': ['french fries', 'potato chips', 'fries', 'patatas fritas'],
    'salchipapas': ['salchipapa', 'loaded fries', 'cheese fries', 'curry fries'],
    'maruchan': ['ramen', 'instant noodles', 'cup noodles', 'noodle soup'],
    'pizza': ['pizza', 'pepperoni pizza', 'margherita pizza'],
    'alitas': ['chicken wings', 'buffalo wings', 'bbq wings'],
    'sushi': ['sushi', 'sushi roll', 'nigiri'],
    'hotdog': ['hot dog', 'chili dog'],
    'burrito': ['burrito', 'quesadilla', 'nachos', 'enchiladas'],
    'bebida_cafe': ['espresso', 'iced coffee', 'frappe', 'latte', 'chocolate milkshake'],
    'bebida_fria': ['lemonade', 'mojito', 'smoothie', 'horchata', 'iced tea', 'orange juice', 'soda', 'beer', 'cocktail'],
}

results = {}
seen = set()

for cat, terms in queries.items():
    results[cat] = []
    # 1. Buscar en TheMealDB (solo comidas)
    if not cat.startswith('bebida'):
        for t in terms:
            try:
                data = fetch_json(f"https://www.themealdb.com/api/json/v1/1/search.php?s={urllib.parse.quote(t)}")
                for m in (data.get('meals') or []):
                    img = m.get('strMealThumb')
                    if img and img not in seen:
                        seen.add(img)
                        results[cat].append((m.get('strMeal', t), img))
            except Exception as e:
                pass
    # 2. Buscar en TheCocktailDB (bebidas)
    else:
        for t in terms:
            try:
                data = fetch_json(f"https://www.thecocktaildb.com/api/json/v1/1/search.php?s={urllib.parse.quote(t)}")
                for d in (data.get('drinks') or []):
                    img = d.get('strDrinkThumb')
                    if img and img not in seen:
                        seen.add(img)
                        results[cat].append((d.get('strDrink', t), img))
            except Exception as e:
                pass

    # 3. Complementar con Wikimedia Commons si faltan
    if len(results[cat]) < 8:
        for t in terms[:3]:
            try:
                url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(t)}&srnamespace=6&srlimit=6&format=json"
                data = fetch_json(url)
                titles = [x['title'] for x in data.get('query', {}).get('search', []) if x['title'].lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
                if titles:
                    t_param = '|'.join(titles[:5])
                    info_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(t_param)}&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json"
                    info = fetch_json(info_url)
                    for p in info.get('query', {}).get('pages', {}).values():
                        ii = (p.get('imageinfo') or [{}])[0]
                        img = ii.get('thumburl') or ii.get('url')
                        if img and img not in seen:
                            seen.add(img)
                            results[cat].append((t, img))
            except Exception as e:
                pass

total = sum(len(v) for v in results.values())
print(f"Total imagenes unicas encontradas: {total}")
for k, v in results.items():
    print(f"  {k}: {len(v)} -> {[x[0] for x in v[:4]]}")

with open(r'c:\introReact\PuntoVenta1\vistas\src\data\fetched_images.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
