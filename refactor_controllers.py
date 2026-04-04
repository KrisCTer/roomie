import os
import re

import sys

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Handle Javadocs matching exactly /** ... */ before methods, optionally keeping English
    # Actually, the user asked 'Javadoc tiếng Việt Xóa hết'. We can just remove ALL javadocs in controllers.
    content = re.sub(r'/\*\*[\s\S]*?\*/\s*', '', content)
    
    # 2. Remove all // comments
    # Wait, some // comments might be useful, but user said delete them. Let's delete lines starting with //
    content = re.sub(r'^\s*//.*$\n', '', content, flags=re.MULTILINE)

    # 3. Replace ResponseEntity<ApiResponse<T>> with ApiResponse<T>
    content = re.sub(r'ResponseEntity<ApiResponse<(.*?)>>', r'ApiResponse<\1>', content)
    content = re.sub(r'ResponseEntity<ApiResponse>', r'ApiResponse', content)

    # 4. Replace return ResponseEntity.ok(ApiResponse.success(...));
    # with return ApiResponse.success(...);
    # Handling newlines inside ok()
    content = re.sub(r'return\s+ResponseEntity\.ok\(\s*ApiResponse\.success\(([\s\S]*?)\)\s*\);', r'return ApiResponse.success(\1);', content)
    # Some might use ResponseEntity.status(..).body(...)
    content = re.sub(r'return\s+ResponseEntity\.status\([^)]*\)\s*\.body\(\s*ApiResponse\.error\(([\s\S]*?)\)\s*\);', r'return ApiResponse.error(\1);', content)
    
    content = re.sub(r'ResponseEntity\.ok\(\s*ApiResponse\.success\(([\s\S]*?)\)\s*\)', r'ApiResponse.success(\1)', content)
    content = re.sub(r'ResponseEntity\.status\([^)]*\)\s*\.body\(\s*ApiResponse\.error\(([\s\S]*?)\)\s*\)', r'ApiResponse.error(\1)', content)

    # 5. Fix annotation order on class
    # Find the annotations above public class
    class_def_match = re.search(r'((?:@[A-Za-z0-9_()".=, ]+\s*)+)(public class [A-Za-z0-9_]+)', content)
    if class_def_match:
        annotations_raw = class_def_match.group(1)
        class_decl = class_def_match.group(2)
        
        # Extract individual annotations
        annotations = re.findall(r'@[A-Za-z0-9_()".=, ]+', annotations_raw)
        
        # Priority map for ordering
        priority = {
            '@RestController': 1,
            '@RequestMapping': 2,
            '@RequiredArgsConstructor': 3,
            '@Slf4j': 4,
            '@FieldDefaults': 5
        }
        
        def sort_key(ann):
            for k, v in priority.items():
                if ann.startswith(k):
                    return v
            return 99
            
        sorted_ann = sorted(annotations, key=sort_key)
        new_annotations_str = '\n'.join(sorted_ann) + '\n'
        
        content = content[:class_def_match.start()] + new_annotations_str + class_decl + content[class_def_match.end():]

    # 6. Remove unused import org.springframework.http.ResponseEntity; and HttpStatus;
    content = re.sub(r'import org\.springframework\.http\.ResponseEntity;[\r\n]*', '', content)
    content = re.sub(r'import org\.springframework\.http\.HttpStatus;[\r\n]*', '', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    root_dir = 'backend'
    for root, dirs, files in os.walk(root_dir):
        if 'controller' in root:
            for file in files:
                if file.endswith('.java'):
                    process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
