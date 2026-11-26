import re
from collections import Counter

content = open(r'c:\introReact\PuntoVenta1\vistas\src\data\initialProducts.js', 'r', encoding='utf-8').read()
names = re.findall(r'name: "([^"]+)"', content)
c = Counter(names)
dupes = [n for n, cnt in c.items() if cnt > 1]
print("Total:", len(names), "| Duplicados:", len(dupes))

keywords = ['papita', 'salchipapa', 'Maruchan', 'elote']
for kw in keywords:
    matches = [n for n in names if kw.lower() in n.lower()]
    print("\n--- " + kw.upper() + " (" + str(len(matches)) + ") ---")
    for m in matches[:6]:
        print(" ", m)
    if len(matches) > 6:
        print("  ...y", len(matches)-6, "mas")
