#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Incrusta las fotos de img/ dentro de fotos.js (como datos base64).
Asi la pagina muestra las fotos aunque se abra con doble clic (file://),
sin necesidad de servidor, y sin importar la extension (.jpg/.jpeg/.png/.JPG).

Ejecutar cada vez que cambies las fotos:  doble clic en "ACTUALIZAR FOTOS.bat"
"""
import os
import base64
import glob

HERE = os.path.dirname(os.path.abspath(__file__))
IMGDIR = os.path.join(HERE, "img")

MIME = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".jfif": "image/jpeg",
    ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
    ".bmp": "image/bmp",
}

entries = []
encontradas = 0

for i in range(1, 13):
    # busca img/<i>.<cualquier extension>, sin importar mayusculas
    candidatos = []
    for f in glob.glob(os.path.join(IMGDIR, "*")):
        nombre = os.path.basename(f)
        base, ext = os.path.splitext(nombre)
        if base == str(i) and ext.lower() in MIME:
            candidatos.append(f)
    if not candidatos:
        print("   - falta foto {} (ningun {}.* encontrado)".format(i, i))
        continue

    ruta = sorted(candidatos)[0]
    ext = os.path.splitext(ruta)[1].lower()
    with open(ruta, "rb") as fh:
        b64 = base64.b64encode(fh.read()).decode("ascii")
    data_uri = "data:{};base64,{}".format(MIME[ext], b64)
    # la clave es la ruta que usa main.js (siempre img/<i>.jpg)
    entries.append('  "img/{}.jpg": "{}"'.format(i, data_uri))
    encontradas += 1
    print("   + foto {} incrustada ({})".format(i, os.path.basename(ruta)))

js = "/* Generado por embed_fotos.py - NO editar a mano. */\n"
js += "window.FOTOS = {\n" + ",\n".join(entries) + "\n};\n"

with open(os.path.join(HERE, "fotos.js"), "w", encoding="utf-8") as out:
    out.write(js)

print("")
print("   LISTO: {} fotos incrustadas en fotos.js".format(encontradas))
print("   Ahora abre la pagina con ABRIR.bat (o doble clic en index.html).")
