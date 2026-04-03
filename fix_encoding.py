import os

def convert_to_utf8(file_path):
    encodings = ['utf-8', 'shift_jis', 'cp932', 'euc_jp']
    content = None
    
    for enc in encodings:
        try:
            with open(file_path, 'rb') as f:
                raw_data = f.read()
            content = raw_data.decode(enc)
            break
        except Exception:
            continue
            
    if content:
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        print(f"Converted {file_path}")
        return True
    return False

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
            path = os.path.join(root, file)
            convert_to_utf8(path)
