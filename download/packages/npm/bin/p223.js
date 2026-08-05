#!/usr/bin/env node
/*
 * bin principal del paquete npm de P223.
 * Como el CLI vive en un venv instalado por postinstall, este shim
 * redirige al p223 del venv (último recurso si npm bin no lo enlazó).
 */
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');
const os = require('os');

const INSTALL_DIR = path.join(os.homedir(), '.local', 'share', 'p223', '.venv');
const p223 = path.join(
  INSTALL_DIR,
  process.platform === 'win32' ? 'Scripts/p223.exe' : 'bin/p223'
);

const r = spawnSync(p223, process.argv.slice(2), { stdio: 'inherit' });
process.exit(r.status == null ? 1 : r.status);