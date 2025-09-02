
#!/usr/bin/env python3
"""
Quick fix for service files with duplicate API_BASE_URL constants
"""

import glob
import re

def fix_service_files():
    """Fix duplicate API_BASE_URL constants in service files"""
    
    service_files = glob.glob("Silk_Road/src/services/*.js")
    
    for file_path in service_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove duplicate API_BASE_URL constants
            content = re.sub(r"const API_BASE_URL = '\$\{API_BASE_URL\}';?\n?", "", content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ Fixed {file_path}")
            
        except Exception as e:
            print(f"❌ Error fixing {file_path}: {e}")
    
    print("🎉 Service files fixed!")

if __name__ == "__main__":
    fix_service_files()
