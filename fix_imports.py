import os
import re

for root, dirs, files in os.walk('backend'):
    for file in files:
        if file.endswith('Controller.java'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'ResponseEntity' in content and 'import org.springframework.http.ResponseEntity;' not in content:
                # Add import after other imports
                match = re.search(r'^import .*?;$', content, flags=re.MULTILINE)
                if match:
                    content = content[:match.start()] + 'import org.springframework.http.ResponseEntity;\n' + content[match.start():]
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Added ResponseEntity import to {filepath}")
