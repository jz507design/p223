#!/usr/bin/env node
/*
 * p223 bootstrap loader (npm)
 * El paquete npm es un "instalador" del CLI oficial P223.
 * En postinstall descarga el wheel oficial y lo instala en un venv aislado,
 * creando el ejecutable `p223` en node_modules/.bin.
 *
 * Uso:
 *   npm install -g p223-ia        # instala p223 en el PATH
 *   npx p223-ia                    # ejecución puntual
 */
'use strict';

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const BASE = process.env.P223_BASE || 'https://jz507design.github.io/p223';
const VERSION = '0.1.0';
const WHEEL = `auditor_ia_local-${VERSION}-py3-none-any.whl`;
const URL = `${BASE}/download/${WHEEL}`;

const HOME = os.homedir();
const INSTALL_DIR = path.join(HOME, '.local', 'share', 'p223');
const VENV_DIR = path.join(INSTALL_DIR, '.venv');

function die(msg) {
  process.stderr.write(`  [X] ${msg}\n`);
  process.exit(1);
}
function ok(msg) {
  process.stdout.write(`  [OK] ${msg}\n`);
}

function findPython() {
  const candidates = ['python3', 'python'];
  for (const c of candidates) {
    try {
      const out = execFileSync(c, ['-c', 'import sys;print("%d.%d"%sys.version_info[:2])'], { encoding: 'utf8' });
      const v = out.trim();
      const [maj, min] = v.split('.').map(Number);
      if (maj > 3 || (maj === 3 && min >= 11)) return c;
      process.stderr.write(`  P223 requiere Python 3.11+. Tienes ${v}\n`);
    } catch (_) { /* probar siguiente */ }
  }
  return null;
}

function download(url, dest) {
  // usar fetch (Node 18+) o https básico
  const https = require('https');
  const fsx = require('fs');
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const file = fsx.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(resolve); });
    }).on('error', reject);
  });
}

async function main() {
  const py = findPython();
  if (!py) die('No se encontró Python 3.11+. Instálalo desde https://python.org');

  fs.mkdirSync(INSTALL_DIR, { recursive: true });
  const venvPy = path.join(VENV_DIR, process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  if (!fs.existsSync(venvPy)) {
    ok('Creando entorno virtual...');
    execFileSync(py, ['-m', 'venv', VENV_DIR], { stdio: 'inherit' });
  }

  const wheelTmp = path.join(os.tmpdir(), WHEEL);
  ok(`Descargando ${WHEEL} ...`);
  await download(URL, wheelTmp);

  ok('Instalando dependencias (primera vez tarda)...');
  execFileSync(venvPy, ['-m', 'pip', 'install', '--quiet', '--upgrade', 'pip'], { stdio: 'inherit' });
  execFileSync(venvPy, ['-m', 'pip', 'install', '--quiet', wheelTmp], { stdio: 'inherit' });
  fs.unlinkSync(wheelTmp);

  // console script p223 dentro del venv
  const binDir = path.join(VENV_DIR, process.platform === 'win32' ? 'Scripts' : 'bin');
  const p223 = path.join(binDir, process.platform === 'win32' ? 'p223.exe' : 'p223');
  if (!fs.existsSync(p223)) die('No se generó el ejecutable p223 en el venv.');

  // enlace en node_modules/.bin (donde npm ya pone el bin de este paquete)
  const npmBin = path.join(__dirname, '..', '.bin');
  fs.mkdirSync(npmBin, { recursive: true });
  const target = path.join(npmBin, process.platform === 'win32' ? 'p223.cmd' : 'p223');

  if (process.platform === 'win32') {
    fs.writeFileSync(target, `@echo off\r\n"${p223}" %*\r\n`);
  } else {
    fs.symlinkSync(p223, target);
    fs.chmodSync(target, 0o755);
  }

  ok(`Instalado: ${p223}`);
  ok('Ejecuta "p223 scan" para una auditoría local.');
}

main().catch((e) => { die(e.message || String(e)); });
