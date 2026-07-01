#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Galaxia de Amor - mini servidor local.
Necesario porque los navegadores bloquean las fotos cuando se abre
el index.html con doble clic (file://). Esto lo soluciona sirviendo
la pagina en http://localhost.
"""
import http.server
import socketserver
import socket
import threading
import webbrowser
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))


def puerto_libre(p):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", p))
            return True
        except OSError:
            return False


PORT = 8000
while not puerto_libre(PORT):
    PORT += 1

URL = "http://localhost:{}/".format(PORT)

print("")
print("  =========================================")
print("     GALAXIA DE AMOR  -  abriendo...")
print("  =========================================")
print("")
print("   En tu navegador:  " + URL)
print("   (no cierres esta ventana mientras la usas)")
print("")

threading.Timer(0.9, lambda: webbrowser.open(URL)).start()

Handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Cerrado. Hasta la proxima <3")
