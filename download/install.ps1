<#
P223 — Policia de IAs · Instalador para Windows (curl | pwsh)

Uso (PowerShell 7+):
  irm https://jz507design.github.io/p223/download/install.ps1 | iex

O desde cmd:
  curl -fsSL https://jz507design.github.io/p223/download/install.ps1 | powershell -command -

(c) JZ Design Solutions — https://jzds.me
#>
$ErrorActionPreference = "Stop"

$P223Base    = "https://jz507design.github.io/p223"
$P223Version = "0.1.0"
$Wheel       = "auditor_ia_local-$P223Version-py3-none-any.whl"
$WheelUrl    = "$P223Base/download/$Wheel"

$Prefix    = Join-Path $HOME ".local"
$Install   = Join-Path $Prefix "share\p223"
$VenvDir   = Join-Path $Install ".venv"
$VenvPy    = Join-Path $VenvDir "Scripts\python.exe"

function Say($m)  { Write-Host "  $m" }
function Ok($m)   { Write-Host "  [OK] $m" -ForegroundColor Green }
function Warn($m) { Write-Host "  [!] $m" -ForegroundColor Yellow }
function Die($m)  { Write-Host "  [X] $m" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "  ___  __   _     _"
Write-Host " / _ \|  \ | |_ _| |_    P223 - Policia de IAs"
Write-Host "| (_) | |_) | |_|  _|"
Write-Host " \__\_\/____/ \____|___"
Write-Host "  El prudente ve el peligro y se protege. - Proverbios 22:3"
Write-Host ""

# ---------- 1. detectar python ----------
$Py = Get-Command python -ErrorAction SilentlyContinue
if (-not $Py) { Die "No se encontro Python. Instala Python 3.11+ desde https://python.org" }
$PyExe = $Py.Source
$Ver = & $PyExe -c "import sys; print('%d.%d' % sys.version_info[:2])"
if (-not (& $PyExe -c "import sys; sys.exit(0 if sys.version_info >= (3,11) else 1)")) {
    Die "Se requiere Python 3.11 o superior. Tienes $Ver. Actualiza desde https://python.org"
}
Ok "Python detectado: $Ver"

# ---------- 2. crear venv ----------
New-Item -ItemType Directory -Path $Install -Force | Out-Null
if (-not (Test-Path $VenvPy)) {
    Say "Creando entorno virtual..."
    & $PyExe -m venv $VenvDir
    if (-not (Test-Path $VenvPy)) { Die "No se pudo crear el entorno virtual." }
}
Ok "Entorno virtual listo"

# ---------- 3. descargar wheel ----------
$WheelTmp = Join-Path $env:TEMP $Wheel
Say "Descargando paquete..."
try {
    Invoke-WebRequest -Uri $WheelUrl -OutFile $WheelTmp -UseBasicParsing -TimeoutSec 120
} catch { Die "Fallo al descargar $WheelUrl" }
Ok "Paquete descargado"

# ---------- 4. instalar ----------
Say "Instalando dependencias (la primera vez puede tardar)..."
& $VenvPy -m pip install --quiet --upgrade pip 2>$null
& $VenvPy -m pip install --quiet $WheelTmp
if ($LASTEXITCODE -ne 0) { Die "Fallo al instalar el paquete." }
Remove-Item $WheelTmp -Force -ErrorAction SilentlyContinue
Ok "Paquete instalado"

# ---------- 5. registrar p223 ----------
$P223Exe = Join-Path $VenvDir "Scripts\p223.exe"
if (-not (Test-Path $P223Exe)) { Die "No se encontro el ejecutable p223 en el venv." }

$BinDir = Join-Path $Prefix "bin"
New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
$Wrapper = Join-Path $BinDir "p223.cmd"
@"
@echo off
"$P223Exe" %*
"@ | Set-Content -Path $Wrapper -Encoding ASCII
Ok "Comando p223 disponible: $Wrapper"

# ---------- 6. PATH ----------
$BinDirForPath = $BinDir
$paths = [Environment]::GetEnvironmentVariable("Path", "User")
if ($paths -notlike "*$BinDirForPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$paths;$BinDirForPath", "User")
    Warn "PATH actualizado. Abre una terminal NUEVA para usar 'p223'."
} else {
    Ok "PATH ya incluye $BinDir"
}

# ---------- 7. verificar ----------
Write-Host ""
& $P223Exe --help 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { Ok "Instalacion completada. Prueba: 'p223 scan'" }
else { Warn "Instalacion lista, pero no se pudo validar el comando." }

Write-Host ""
Write-Host "     p223 scan      ->  auditoria rapida"
Write-Host "     p223 tui       ->  panel interactivo"
Write-Host "     p223 web       ->  panel web  (http://127.0.0.1:8000)"
Write-Host "     p223 --help"
Write-Host ""
Write-Host "  P223 es completamente local. No envia datos a ningun servidor." -ForegroundColor Cyan
Write-Host ""
