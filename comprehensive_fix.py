#!/usr/bin/env python3
"""
Comprehensive fix for all broken import patterns and template literals
"""

import glob
import re

def comprehensive_fix():
    """Fix all broken import patterns and template literals"""
    
    jsx_files = glob.glob("src/**/*.jsx", recursive=True)
    js_files = glob.glob("src/**/*.js", recursive=True)
    all_files = jsx_files + js_files
    
    print(f"🔍 Processing {len(all_files)} files...")
    
    files_fixed = 0
    total_fixes = 0
    
    for file_path in all_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            fixes_in_file = 0
            
            # Fix 1: Broken import patterns
            # Pattern: import {\nimport { API_BASE_URL }
            content = re.sub(
                r'import \{\s*\nimport \{ API_BASE_URL \}',
                'import { API_BASE_URL }',
                content
            )
            
            # Fix 2: Missing opening brace in imports
            # Pattern: import {\n  import { API_BASE_URL }
            content = re.sub(
                r'import \{\s*\n\s+import \{ API_BASE_URL \}',
                'import { API_BASE_URL }',
                content
            )
            
            # Fix 3: Template literals with single quotes
            # Pattern: '${API_BASE_URL}'
            content = re.sub(
                r"'\\$\\{API_BASE_URL\\}'",
                '`${API_BASE_URL}`',
                content
            )
            
            # Fix 4: Template literals with single quotes and path
            # Pattern: '${API_BASE_URL}/'
            content = re.sub(
                r"'\\$\\{API_BASE_URL\\}/",
                '`${API_BASE_URL}/',
                content
            )
            
            # Fix 5: Template literals with single quotes and full path
            # Pattern: '${API_BASE_URL}/api/v1'
            content = re.sub(
                r"'\\$\\{API_BASE_URL\\}/api/v1",
                '`${API_BASE_URL}/api/v1',
                content
            )
            
            # Fix 6: Remove duplicate API_BASE_URL constants
            content = re.sub(
                r"const API_BASE_URL = '\$\\{API_BASE_URL\}';?\n?",
                "",
                content
            )
            
            # Fix 7: Fix broken import statements that are missing opening brace
            # Pattern: import {\n  Box,\n  Paper,\n  ...
            lines = content.split('\n')
            new_lines = []
            i = 0
            
            while i < len(lines):
                line = lines[i]
                
                # Check if this is a broken import pattern
                if line.strip() == 'import {' and i + 1 < len(lines):
                    next_line = lines[i + 1]
                    if next_line.strip().startswith('import { API_BASE_URL }'):
                        # Fix the broken import
                        new_lines.append('import { API_BASE_URL }')
                        new_lines.append('import {')
                        i += 2  # Skip the next line since we already added it
                        continue
                
                new_lines.append(line)
                i += 1
            
            content = '\n'.join(new_lines)
            
            # Count fixes
            if content != original_content:
                fixes_in_file = len(re.findall(r'\\$\\{API_BASE_URL\\}', original_content)) - len(re.findall(r'\\$\\{API_BASE_URL\\}', content))
                fixes_in_file += len(re.findall(r'import \\{\\s*\\nimport \\{ API_BASE_URL \\}', original_content))
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                files_fixed += 1
                total_fixes += fixes_in_file
                print(f"✅ Fixed {file_path} ({fixes_in_file} fixes)")
            
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
    
    print(f"\n🎉 Comprehensive fix completed!")
    print(f"📁 Files fixed: {files_fixed}")
    print(f"🔄 Total fixes: {total_fixes}")

if __name__ == "__main__":
    comprehensive_fix()
