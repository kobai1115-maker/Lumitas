from PIL import Image
import os

def resize_for_note(input_path, output_path):
    target_w, target_h = 1920, 1006
    target_aspect = target_w / target_h
    
    img = Image.open(input_path)
    current_w, current_h = img.size
    current_aspect = current_w / current_h
    
    if current_aspect > target_aspect:
        # 現在の方が横長 -> 横を削る
        new_w = int(current_h * target_aspect)
        left = (current_w - new_w) // 2
        img = img.crop((left, 0, left + new_w, current_h))
    else:
        # 現在の方が縦長（正方形含む） -> 縦を削る
        # キャラクターが中央より少し上にいることが多いため、少し上寄りに残す（中央から少し上にオフセット）
        new_h = int(current_w / target_aspect)
        top = int((current_h - new_h) * 0.4) # 40%の位置を起点にする（少し上寄り）
        img = img.crop((0, top, current_w, top + new_h))
    
    # 最終的なリサイズ
    img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    img.save(output_path, quality=95)
    print(f"Resized: {input_path} -> {output_path} ({target_w}x{target_h})")

if __name__ == "__main__":
    src = "docs/note_images/00_header_v2.png"
    dst = "docs/note_images/00_header_note_size.png"
    resize_for_note(src, dst)
