import os
import zipfile

extension_dir = os.path.abspath('public/extension')
output_zip = os.path.abspath('public/cinevault-chrome-extension.zip')

print(f"Creating zip from {extension_dir} -> {output_zip}")
with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(extension_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, extension_dir)
            zipf.write(file_path, arcname)

print(f"Successfully packaged Chrome extension zip ({os.path.getsize(output_zip)} bytes)")
