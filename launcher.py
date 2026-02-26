"""ConsiliumAI launcher — entry point for PyInstaller bundle."""

import socket
import sys
import threading
import time
import webbrowser
from pathlib import Path

PORT = 8001
URL = f"http://localhost:{PORT}"


def _port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("localhost", port)) == 0


def _open_browser():
    time.sleep(2)
    webbrowser.open(URL)


if __name__ == "__main__":
    # When frozen by PyInstaller, sys._MEIPASS holds the bundle root.
    # Add it to sys.path so `import backend` works.
    if getattr(sys, "frozen", False):
        bundle_dir = Path(sys._MEIPASS)
        if str(bundle_dir) not in sys.path:
            sys.path.insert(0, str(bundle_dir))

        # console=False sets sys.stdout/stderr to None, which causes uvicorn's
        # logging formatter to crash with "NoneType has no attribute isatty".
        # Redirect both to a log file so the app runs and errors are capturable.
        import os
        log_dir = Path(os.environ.get("APPDATA", Path.home())) / "ConsiliumAI"
        log_dir.mkdir(parents=True, exist_ok=True)
        log_file = open(log_dir / "consilium.log", "w", buffering=1, encoding="utf-8")
        sys.stdout = log_file
        sys.stderr = log_file

    if _port_in_use(PORT):
        # Server already running — just open a new browser tab.
        webbrowser.open(URL)
        sys.exit(0)

    # Open browser in background after uvicorn is ready.
    threading.Thread(target=_open_browser, daemon=True).start()

    import uvicorn
    from backend.main import app
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="warning")
