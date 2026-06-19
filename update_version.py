from pathlib import Path
from datetime import datetime
import re

version = datetime.now().strftime("%Y%m%d%H%M%S")

# Actualizar index.html
index_path = Path("index.html")
index = index_path.read_text()

index = re.sub(
    r'href="styles\.css(?:\?v=[^"]*)?"',
    f'href="styles.css?v={version}"',
    index
)

index = re.sub(
    r'src="app\.js(?:\?v=[^"]*)?"',
    f'src="app.js?v={version}"',
    index
)

index_path.write_text(index)

# Actualizar service-worker.js
sw_path = Path("service-worker.js")
sw = sw_path.read_text()

sw = re.sub(
    r'const CACHE_NAME = "rugby-stats-coach-v[^"]+";',
    f'const CACHE_NAME = "rugby-stats-coach-v{version}";',
    sw
)

sw_path.write_text(sw)

print(f"Versión aplicada: {version}")
print("Actualizado: index.html, app.js, styles.css y service-worker.js")
