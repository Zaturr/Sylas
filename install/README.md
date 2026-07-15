# Sylas — paquete instalable (CLI)

## Qué genera

Tras correr el script de build obtienes:

- `sylas.exe` — API + UI en un solo proceso
- `config.json` — editable **sin** recompilar (puerto, banco, URL API, etc.)

## Requisitos (solo en la máquina que construye)

- Node.js + npm
- Go (misma major que el proyecto)

El usuario final **no** necesita Node ni Go: solo el `.exe` y el `config.json`.

## Construir

Desde la raíz del repo:

**CMD (recomendado si usas Símbolo del sistema):**

```bat
install\build.bat
```

**PowerShell:**

```powershell
.\install\build.ps1
```

Si PowerShell bloquea la ejecución de scripts:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\install\build.ps1
```

Desde CMD también puedes invocar PowerShell a mano:

```bat
powershell -ExecutionPolicy Bypass -File .\install\build.ps1
```
## Usar

1. Edita `install\config.json` (`PORT`, `VITE_API_BASE_URL`, `SIMULATION`, …).
2. Ejecuta `.\install\sylas.exe`.
3. Abre `http://localhost:<PORT>` (por defecto `8080`).

Si cambias `PORT`, alinea también `VITE_API_BASE_URL` y **reinicia** el `.exe`.  
Si solo cambias datos de simulación, guarda y **recarga** el navegador.

## Notas

- El script **no sobrescribe** un `config.json` que ya exista en `install/`.
- `config.json` no se embebe en el binario: se sirve desde disco en `/config.json`.
