import os
import codecs

def remove_bom(filepath):
    with open(filepath, 'rb') as f:
        content = f.read()
    if content.startswith(codecs.BOM_UTF8):
        content = content[3:]
        with open(filepath, 'wb') as f:
            f.write(content)
        print(f"Fixed BOM: {filepath}")

for root, dirs, files in os.walk('backend'):
    for file in files:
        if file.endswith('.java'):
            remove_bom(os.path.join(root, file))
