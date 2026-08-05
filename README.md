# P223 — Landing page oficial

> **El prudente ve el peligro y se protege.** · Proverbios 22:3

Landing page de **P223 · Policía de IAs** (The AI Police) — auditoría de
entornos de IA local, 100% local y sin fuga de datos.

**Publicada en:** https://jz507design.github.io/p223/

## Stack
- HTML5 + CSS3 + JavaScript vanilla (sin frameworks)
- Trilingüe: ES / EN / 中文 (selector en la barra superior)
- Tipografías: Space Grotesk + JetBrains Mono (Google Fonts)
- Sin backend — formulario de contacto es demo (sustituir por Formspree/WhatsApp al contratar)

## Estructura
```
index.html               Landing (con comentario de dirección de diseño)
assets/css/style.css     Mundo visual: carbón + oro vigilante + semáforos de consola
assets/js/i18n.js        Diccionario ES/EN/中文
assets/js/main.js        Selector de idioma, reveal on scroll, form handler
assets/img/demo/         Capturas reales del panel P223
```

## Desarrollo
Para previsualizar local: abre `index.html` directo o sirve la carpeta:

```powershell
python -m http.server 8000 --directory D:\DEV\p223
```

Producto CLI: repositorio `jz507design/auditor-ia-local` · comando `p223`.

© JZ Design Solutions — https://jzds.me/
