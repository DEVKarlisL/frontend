from pathlib import Path
p = Path(r'c:\Users\Karlis\Desktop\auction_platform_ENTERPRISE_COMPLETE\frontend\src\pages\HomePage.tsx')
b = p.read_bytes()
print('first16 hex:', b[:16].hex())
print('first 16 bytes repr:', b[:16])
encs = ['utf-8','utf-16','utf-16-le','utf-16-be','latin-1','cp1252']
for enc in encs:
    try:
        s = b.decode(enc)
        print('decodes as', enc, '->', repr(s[:40]))
    except Exception as e:
        print('cannot decode with', enc, ':', e)
# Try to detect BOM-like leading bytes and strip non-text bytes
try:
    b.decode('utf-8')
    print('File already valid UTF-8')
except Exception:
    for enc in ['utf-16','utf-16-le','utf-16-be','cp1252','latin-1']:
        try:
            s = b.decode(enc)
            p.write_text(s, encoding='utf-8')
            print('Rewrote file from', enc, 'to utf-8')
            break
        except Exception as e:
            print('failed to decode with', enc, ':', e)
else:
    print('No conversion performed')
