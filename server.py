#!/usr/bin/env python3
"""
Simple HTTP server for testing ParkEase locally.
Run: python server.py
Then open: http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
from pathlib import Path

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers to allow ES6 modules
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Customize log format
        print(f"[Server] {args[0]} - {args[1]}")

if __name__ == '__main__':
    print(f"🚀 Starting ParkEase server...")
    print(f"📂 Serving from: {Path.cwd()}")
    print(f"🌐 URL: http://localhost:{PORT}")
    print(f"⚠️  Press Ctrl+C to stop the server\n")
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        try:
            # Open browser automatically
            webbrowser.open(f'http://localhost:{PORT}')
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped")
            httpd.shutdown()
