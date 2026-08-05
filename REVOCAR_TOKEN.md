# Revocar el token de GitHub expuesto — GUÍA (5 min)

## Por qué urgente
Un token de GitHub (`gho_...`) de la cuenta **jz507design** quedó expuesto en
historial de la conversación. Cualquiera con acceso a eso puede:
- Leer tus repos **privados** (incluye el código de P223 🚨)
- Escribir en tus repos (vandalismo / malware)
- Impostarte ante GitHub

## Paso 1 — Revocar el token expuesto (hazlo PRIMERO)
1. Entra a https://github.com/settings/tokens
   (o: foto de perfil → Settings → Developer settings → Fine-grained tokens)
2. Revisa la lista de tus **Fine-grained personal access tokens**.
   Identifica el que no reconozcas o el que se compartió aquí.
   Pista: en el token listado, la contraseña en el Credential Manager
   comenzaba con `gho_` y terminaba en `...7vRw`.
3. En ese token → botón **Delete** / **Revoke** → confirmar.
   Se revoca al instante; deja de funcionar en cualquier parte.

> No da miedo "romper" nada: git solo fallará al pushear hasta que
> pongas el token nuevo (Paso 2).

## Paso 2 — Crear un token NUEVO (solo tu máquina)
1. https://github.com/settings/personal-access-tokens/new
2. **Token name**: `p223-dev`
3. **Expiration**: 90 días (o lo que prefieras)
4. **Repository access**: "Selected repositories" → `jz507design/auditor-ia-local`
   y `jz507design/p223` (ambos)
5. **Permissions** (solo lo necesario):
   - Contents: **Read and write** (para push)
   - Metadata: Read (automático)
6. **Generate token** → copia el valor (solo se muestra una vez).

## Paso 3 — Guardarlo en Windows (Credential Manager)
Abre PowerShell y ejecuta:

```powershell
cmdkey /generic:git:https://github.com -user:jz507design -pass:"EL_TOKEN_NUEVO"
```

Verifica que git ya no pida nada:

```powershell
cd D:\DEV\p223
git fetch
```

## Nota
- Si prefieres, también funciona revocar y volver a generarlo desde el
  token original si ya lo tenías guardado en otro lugar — pero lo más
  limpio es crear uno nuevo con scopes mínimos.
- **No vuelvas a pegar el token en chats ni commits.** Nunca.
