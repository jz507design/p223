#!/usr/bin/env bash
#
# P223 — Policía de IAs · Instalador (curl | bash)
# --------------------------------------------------------------
# Uso:   curl -fsSL https://jz507design.github.io/p223/download/install.sh | bash
# El script descarga el paquete oficial, lo instala en un entorno
# virtual aislado y registra el comando `p223` en tu PATH.
#
# (c) JZ Design Solutions — https://jzds.me
#
set -euo pipefail

P223_BASE="${P223_BASE:-https://jz507design.github.io/p223}"
P223_VERSION="0.1.0"
P223_WHEEL="auditor_ia_local-${P223_VERSION}-py3-none-any.whl"
P223_URL="${P223_BASE}/download/${P223_WHEEL}"

PREFIX="${PREFIX:-$HOME/.local}"
INSTALL_DIR="${P223_DIR:-$PREFIX/share/p223}"
VENV_DIR="$INSTALL_DIR/.venv"

# ---------- colores / helpers ----------
c_reset=$'\033[0m'; c_ok=$'\033[1;32m'; c_hl=$'\033[1;36m'; c_warn=$'\033[1;33m'; c_red=$'\033[1;31m'
say()  { printf '%s\n' "  $*"; }
ok()   { printf '  %s✔%s %s\n' "$c_ok" "$c_reset" "$*"; }
warn() { printf '  %s!%s %s\n' "$c_warn" "$c_reset" "$*"; }
die()  { printf '  %s✘ %s%s\n' "$c_red" "$*" "$c_reset"; exit 1; }

banner() {
cat <<'EOF'
   ___  __   _     _
  / _ \|  \ | |_ _| |_
 | (_) | |_) | |_|  _|
  \__\_\/____/ \____|___   · P223
  El prudente ve el peligro y se protege. — Proverbios 22:3
EOF
}

# ---------- 1. detectar python ----------
PY=""
for c in python3 python; do
  if command -v "$c" >/dev/null 2>&1; then
    PY="$c"; break
  fi
done
if [[ -z "$PY" ]]; then
  die "No se encontró Python. Instala Python 3.11+ (https://python.org) y vuelve a intentar."
fi
pyver=$("$PY" -c 'import sys; print("%d.%d"%sys.version_info[:2])')
if ! "$PY" -c 'import sys; sys.exit(0 if sys.version_info >= (3,11) else 1)' 2>/dev/null; then
  die "Se requiere Python 3.11 o superior. Tienes $pyver. Actualiza desde https://python.org"
fi

# ---------- 2. banners ----------
banner
printf '\n  Instalando %sP223 v%s%s en %s\n\n' "$c_hl" "$P223_VERSION" "$c_reset" "$INSTALL_DIR"

# ---------- 3. crear directorios ----------
mkdir -p "$INSTALL_DIR"

# ---------- 4. crear venv ----------
if [[ ! -x "$VENV_DIR/bin/python" && ! -x "$VENV_DIR/Scripts/python.exe" ]]; then
  ok "Creando entorno virtual..."
  "$PY" -m venv "$VENV_DIR" >/dev/null
fi
# Detectar el intérprete del venv (Linux/macOS usa bin/, Git Bash/Windows usa Scripts/)
if [[ -x "$VENV_DIR/bin/python" ]]; then
  VENV_PY="$VENV_DIR/bin/python"
  VENV_BIN="$VENV_DIR/bin"
else
  VENV_PY="$VENV_DIR/Scripts/python.exe"
  VENV_BIN="$VENV_DIR/Scripts"
fi

# ---------- 5. bajar el wheel ----------
tmp_wheel="${TMPDIR:-/tmp}/p223-$P223_VERSION-py3-none-any.whl"
ok "Descargando paquete..."
curl -fsSL --retry 3 "$P223_URL" -o "$tmp_wheel" || die "Fallo al descargar $P223_URL"

# ---------- 6. instalar ----------
ok "Instalando dependencias (la primera vez puede tardar)..."
"$VENV_PY" -m pip install --quiet --upgrade pip 2>/dev/null || true
"$VENV_PY" -m pip install --quiet "$tmp_wheel" || die "Fallo al instalar el paquete."
rm -f "$tmp_wheel"

# ---------- 7. enlazar p223 en el PATH ----------
# console-script del venv (p223) según plataforma
if [[ -x "$VENV_BIN/p223" ]]; then
  P223_BIN="$VENV_BIN/p223"
elif [[ -x "$VENV_BIN/p223.exe" ]]; then
  P223_BIN="$VENV_BIN/p223.exe"
else
  P223_BIN="$VENV_PY"
fi

BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

# enlace simbólico / wrapper (según lo que soporte la plataforma)
ln -sf "$P223_BIN" "$BIN_DIR/p223" 2>/dev/null || {
  # en entornos que no permiten symlink (Git Bash) usamos un wrapper sh
  printf '#!/usr/bin/env sh\nexec "%s" "$@"\n' "$P223_BIN" > "$BIN_DIR/p223"
  chmod +x "$BIN_DIR/p223"
}

# ---------- 8. PATH ----------
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  warn "Añade $BIN_DIR a tu PATH en ~/.bashrc o ~/.zshrc:"
  printf '\n  export PATH="$HOME/.local/bin:$PATH"\n\n'
fi

# ---------- 9. verificar ----------
if "$BIN_DIR/p223" --help >/dev/null 2>&1 || "$BIN_DIR/p223" scan --help >/dev/null 2>&1; then
  ok "Instalación completada. Prueba:"
else
  warn "Instalación lista, pero no se pudo validar el comando. Comprueba 'p223 --help'."
fi
cat <<"EOF"

     p223 scan      →  auditoría rápida
     p223 tui       →  panel interactivo
     p223 web       →     panel web  (http://127.0.0.1:8000)
     p223 --help

  P223 es completamente local. No envía datos a ningún servidor.

EOF