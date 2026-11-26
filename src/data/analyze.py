import re
from collections import Counter

content = open('initialProducts.js', 'r', encoding='utf-8').read()
names = re.findall(r'name: "([^"]+)"', content)
print(f'Total productos: {len(names)}')
print('Primeros 20:')
for n in names[:20]:
    print(' -', n)

c = Counter(names)
dupes = [(n, cnt) for n, cnt in c.items() if cnt > 1]
print(f'\nDuplicados encontrados: {len(dupes)}')
for d in dupes[:20]:
    print(' -', d)

# ver categorias unicas
cats = re.findall(r'category: "([^"]+)"', content)
cc = Counter(cats)
print('\nCategorias:', dict(cc))
