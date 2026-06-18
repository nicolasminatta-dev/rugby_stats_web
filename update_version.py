from pathlib import Path
from datetime import datetime
import re

index_path = Path("index.html")
index = index_path.read_text()

version = datetime.now().strftime("%Y%m%d%H%M%S")

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

print(f"Versión aplicada: {version}")
print("styles.css y app.js actualizados en index.html")
