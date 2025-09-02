#!/usr/bin/env python3
"""
Script to automatically fix all localhost URLs in the frontend
Replaces http://localhost:8000/api/v1 with ${API_BASE_URL}
"""

import os
import re
import glob
from pathlib import Path

def fix_localhost_urls():
    """Fix all localhost URLs in JSX files"""
    
    # Get the Silk_Road directory
    silk_road_dir = Path("Silk_Road/src")
    
    if not silk_road_dir.exists():
        print("❌ Silk_Road/src directory not found!")
        return
    
    # Find all JSX files
    jsx_files = []
    for pattern in ["**/*.jsx", "**/*.js"]:
        jsx_files.extend(glob.glob(str(silk_road_dir / pattern), recursive=True))
    
    print(f"🔍 Found {len(jsx_files)} JSX/JS files to process...")
    
    # Patterns to replace
    replacements = [
        (r'http://localhost:8000/api/v1', '${API_BASE_URL}'),
        (r'http://localhost:8000', '${API_BASE_URL}'),
    ]
    
    files_modified = 0
    total_replacements = 0
    
    for file_path in jsx_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            replacements_in_file = 0
            
            # Apply all replacements
            for old_pattern, new_pattern in replacements:
                content, count = re.subn(old_pattern, new_pattern, content)
                replacements_in_file += count
            
            # If content changed, write it back
            if content != original_content:
                # Add import statement if not present
                if '${API_BASE_URL}' in content and 'import.*API_BASE_URL' not in content:
                    # Determine relative path to config.js
                    file_rel_path = Path(file_path).relative_to(silk_road_dir)
                    config_path = Path('config.js')
                    
                    # Calculate relative path
                    if file_rel_path.parent == Path('.'):
                        import_path = './config'
                    else:
                        import_path = '../' * len(file_rel_path.parent.parts) + 'config'
                    
                    # Add import at the top
                    import_statement = f"import {{ API_BASE_URL }} from '{import_path}';\n"
                    
                    # Find the first import statement
                    lines = content.split('\n')
                    import_index = -1
                    for i, line in enumerate(lines):
                        if line.strip().startswith('import '):
                            import_index = i
                            break
                    
                    if import_index >= 0:
                        # Insert after the last import
                        while import_index + 1 < len(lines) and lines[import_index + 1].strip().startswith('import '):
                            import_index += 1
                        lines.insert(import_index + 1, import_statement)
                    else:
                        # No imports found, add at the top
                        lines.insert(0, import_statement)
                    
                    content = '\n'.join(lines)
                
                # Write the updated content
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                files_modified += 1
                total_replacements += replacements_in_file
                print(f"✅ Fixed {file_path} ({replacements_in_file} replacements)")
            
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
    
    print(f"\n🎉 Script completed!")
    print(f"📁 Files modified: {files_modified}")
    print(f"🔄 Total replacements: {total_replacements}")
    
    if files_modified > 0:
        print(f"\n🚀 Next steps:")
        print(f"1. Review the changes in your code editor")
        print(f"2. Run: cd Silk_Road && npm run build")
        print(f"3. Deploy the new build to Netlify")
    else:
        print(f"\nℹ️  No files were modified. All URLs might already be fixed!")

if __name__ == "__main__":
    print("🚀 Starting localhost URL fix script...")
    fix_localhost_urls()
