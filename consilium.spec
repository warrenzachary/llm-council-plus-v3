# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for ConsiliumAI."""

block_cipher = None

hidden_imports = [
    # uvicorn internals
    "uvicorn",
    "uvicorn.logging",
    "uvicorn.loops",
    "uvicorn.loops.auto",
    "uvicorn.loops.asyncio",
    "uvicorn.protocols",
    "uvicorn.protocols.http",
    "uvicorn.protocols.http.auto",
    "uvicorn.protocols.http.h11_impl",
    "uvicorn.protocols.http.httptools_impl",
    "uvicorn.protocols.websockets",
    "uvicorn.protocols.websockets.auto",
    "uvicorn.lifespan",
    "uvicorn.lifespan.on",
    # fastapi / starlette
    "fastapi",
    "fastapi.staticfiles",
    "starlette.staticfiles",
    "starlette.responses",
    # http
    "httpx",
    "httpcore",
    "h11",
    # document parsers
    "pypdf",
    "docx",
    "pptx",
    "openpyxl",
    "multipart",
    # search
    "ddgs",
    "yake",
    # providers
    "backend.providers.openrouter",
    "backend.providers.ollama",
    "backend.providers.groq",
    "backend.providers.openai",
    "backend.providers.anthropic",
    "backend.providers.google",
    "backend.providers.mistral",
    "backend.providers.deepseek",
    "backend.providers.custom_openai",
]

a = Analysis(
    ["launcher.py"],
    pathex=["."],
    binaries=[],
    datas=[
        ("frontend/dist", "frontend/dist"),
    ],
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="ConsiliumAI",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon="consilium.ico",
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name="ConsiliumAI",
)
