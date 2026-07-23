# Sylas — paquete instalable (CLI)

## Qué genera

Tras correr el script de build obtienes:

- `sylas.exe` — API + UI en un solo proceso
- `config.json` — editable **sin** recompilar (puerto, banco, URL API, etc.)
- `words.txt` — listado de palabras restringidas, editable **sin** recompilar (junto al `.exe`)

## Requisitos (solo en la máquina que construye)

- Node.js + npm
- Go (misma major que el proyecto)

El usuario final **no** necesita Node ni Go: solo el `.exe`, el `config.json` y el `words.txt`.

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

1. Edita `install\config.json` (`PORT`, `PUBLIC_BASE_URL`, `VITE_API_BASE_URL`, `SIMULATION`, …).
2. Edita `install\words.txt` si necesitas cambiar palabras restringidas (una por línea).
3. Ejecuta `.\install\sylas.exe`.
4. Abre `http://localhost:<PORT>` (por defecto `8080`).

Si cambias `PORT`, alinea también `PUBLIC_BASE_URL` y **reinicia** el `.exe`.  
Si cambias `words.txt`, **reinicia** el `.exe` para recargar el listado.  
Si solo cambias datos de simulación en `config.json`, guarda y **recarga** el navegador.

## Acceso desde otras PCs (LAN) y Postman

El backend (Gin) sirve **API + UI** en un solo proceso y escucha en **todas las interfaces** (`0.0.0.0:PORT`).

En la máquina servidor (ej. José, IP `192.168.120.103`):

```json
{
  "PORT": "8080",
  "PUBLIC_BASE_URL": "http://192.168.120.103:8080",
  "VITE_API_BASE_URL": "/api/v1"
}
```

- **David / Daniel (navegador):** `http://192.168.120.103:8080`
- **Postman (REST):** `http://192.168.120.103:8080/api/v1/...`
- **Postman (SIMF):** `http://192.168.120.103:8080/simf/bdca/v1/...`

`VITE_API_BASE_URL` puede ser relativa (`/api/v1`): el front usará el mismo host con el que abrieron la página.  
`PUBLIC_BASE_URL` es opcional pero recomendada para documentar la URL de red al arrancar el `.exe`.

Si no conecta desde otra PC, revisa el **firewall de Windows** en el servidor (permitir TCP entrante en el puerto `8080`).

## Notas

- El script **no sobrescribe** un `config.json` ni un `words.txt` que ya existan en `install/`.
- `config.json` no se embebe en el binario: se sirve desde disco en `/config.json`.
- `words.txt` se lee al arrancar desde la misma carpeta que `config.json` (o la ruta de `RESTRICTED_WORDS_FILE`).
