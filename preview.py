"""Serve the portfolio over HTTP so embedded players receive a valid referrer."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser

handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent))
with ThreadingHTTPServer(('127.0.0.1', 0), handler) as server:
    url = f'http://127.0.0.1:{server.server_port}/'
    print(f'Portfolio: {url}\nMantén esta ventana abierta. Ctrl+C para cerrar.', flush=True)
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
