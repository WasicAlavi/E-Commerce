#!/usr/bin/env python3
"""
Fix broken import statements in JSX files
"""

import glob
import re

def fix_imports():
    """Fix broken import statements"""
    
    jsx_files = glob.glob("src/**/*.jsx", recursive=True)
    
    for file_path in jsx_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Fix broken import patterns
            # Pattern 1: import { \nimport { API_BASE_URL }
            content = re.sub(
                r'import \{ \nimport \{ API_BASE_URL \}',
                'import { API_BASE_URL }',
                content
            )
            
            # Pattern 2: import { \n  import { API_BASE_URL }
            content = re.sub(
                r'import \{ \n\s+import \{ API_BASE_URL \}',
                'import { API_BASE_URL }',
                content
            )
            
            # Pattern 3: import { \nimport { API_BASE_URL } from
            content = re.sub(
                r'import \{ \nimport \{ API_BASE_URL \} from',
                'import { API_BASE_URL } from',
                content
            )
            
            # Pattern 4: import { \n  import { API_BASE_URL } from
            content = re.sub(
                r'import \{ \n\s+import \{ API_BASE_URL \} from',
                'import { API_BASE_URL } from',
                content
            )
            
            # Fix template literals that are not properly formatted
            content = re.sub(
                r"'\\$\{API_BASE_URL\}",
                '`${API_BASE_URL}',
                content
            )
            
            content = re.sub(
                r"'\\$\{API_BASE_URL\}/",
                '`${API_BASE_URL}/',
                content
            )
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Fixed {file_path}")
            
        except Exception as e:
            print(f"❌ Error fixing {file_path}: {e}")
    
    print("🎉 Import statements fixed!")

if __name__ == "__main__":
    fix_imports()
