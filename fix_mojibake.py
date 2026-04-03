import os

def force_cp932_to_utf8(path):
    try:
        with open(path, 'rb') as f:
            data = f.read()
        
        # Try to decode as CP932 (Windows Shift-JIS)
        content = data.decode('cp932')
        
        # Write as clean UTF-8
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        print(f"FORCED FIXED: {path}")
    except Exception as e:
        print(f"ERROR FIXING {path}: {e}")

targets = [
    'src/app/api/peer-bonus/route.ts',
    'src/app/api/training/route.ts'
]

for t in targets:
    force_cp932_to_utf8(t)
