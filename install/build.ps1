#Requires -Version 5.1
<#
.SYNOPSIS
  Construye el ejecutable único de Sylas (API + UI embebida).

.DESCRIPTION
  1) npm ci + npm run build en Front
  2) Copia Front/dist → Back/cmd/simulador/web (sin config.json)
  3) go build → install/sylas.exe
  4) Deja config.json junto al .exe (no sobrescribe si ya existe)

.EXAMPLE
  .\install\build.ps1
#>

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Assert-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "No se encontró '$Name' en el PATH. Instálalo y vuelve a intentar."
  }
}

function Assert-LastExitCode([string]$Action) {
  if ($null -eq $LASTEXITCODE -or $LASTEXITCODE -ne 0) {
    throw "$Action falló (código $LASTEXITCODE). Se aborta el build para no embebber un dist viejo."
  }
}

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$FrontDir = Join-Path $RepoRoot "Front"
$WebDir = Join-Path $RepoRoot "Back\cmd\simulador\web"
$DistDir = Join-Path $FrontDir "dist"
$InstallDir = $PSScriptRoot
$ExePath = Join-Path $InstallDir "sylas.exe"
$ConfigOut = Join-Path $InstallDir "config.json"
$ConfigSrcCandidates = @(
  (Join-Path $InstallDir "config.json"),
  (Join-Path $FrontDir "public\config.json"),
  (Join-Path $RepoRoot "Back\cmd\simulador\default_config.json")
)

Set-Location $RepoRoot
Write-Host "Repo: $RepoRoot"

Write-Step "Verificando herramientas"
Assert-Command "node"
Assert-Command "npm"
Assert-Command "go"
Write-Host ("Node: " + (node -v))
Write-Host ("npm:  " + (npm -v))
Write-Host ("Go:   " + (go version))

Write-Step "Instalando dependencias del Front (npm ci)"
Push-Location $FrontDir
try {
  npm ci
  Assert-LastExitCode "npm ci"

  Write-Step "Limpiando Front/dist anterior"
  if (Test-Path $DistDir) {
    Remove-Item -Path $DistDir -Recurse -Force
  }

  Write-Step "Compilando Front (npm run build)"
  npm run build
  Assert-LastExitCode "npm run build"
}
finally {
  Pop-Location
}

if (-not (Test-Path $DistDir)) {
  throw "No existe Front/dist después del build."
}

Write-Step "Preparando carpeta web embebida"
if (Test-Path $WebDir) {
  Get-ChildItem -Path $WebDir -Force | Remove-Item -Recurse -Force
}
else {
  New-Item -ItemType Directory -Path $WebDir | Out-Null
}

Write-Step "Copiando Front/dist → Back/cmd/simulador/web (excluye config.json)"
Get-ChildItem -Path $DistDir -Force | ForEach-Object {
  if ($_.Name -ieq "config.json") {
    Write-Host "  (omitido) $($_.Name)"
    return
  }
  Copy-Item -Path $_.FullName -Destination $WebDir -Recurse -Force
}

$IndexPath = Join-Path $WebDir "index.html"
if (-not (Test-Path $IndexPath)) {
  throw "Falta index.html en web/ tras la copia. Revisa el build de Vite."
}

Write-Step "Compilando backend (go build)"
$env:CGO_ENABLED = "0"
go build -o $ExePath ./Back/cmd/simulador
Assert-LastExitCode "go build"
if (-not (Test-Path $ExePath)) {
  throw "go build terminó pero no se generó $ExePath"
}

Write-Step "Asegurando config.json junto al ejecutable"
if (Test-Path $ConfigOut) {
  Write-Host "Se conserva el config.json existente (no se sobrescribe): $ConfigOut"
}
else {
  $copied = $false
  foreach ($src in $ConfigSrcCandidates) {
    if ((Test-Path $src) -and ($src -ne $ConfigOut)) {
      Copy-Item -Path $src -Destination $ConfigOut -Force
      Write-Host "Copiado desde: $src"
      $copied = $true
      break
    }
  }
  if (-not $copied) {
    throw "No se encontró un config.json de origen para copiar a install/."
  }
}

Write-Host ""
Write-Host "Build listo." -ForegroundColor Green
Write-Host "  Ejecutable: $ExePath"
Write-Host "  Config:     $ConfigOut"
Write-Host ""
Write-Host "Uso:"
Write-Host "  1) Edita install\config.json si lo necesitas (PORT, banco, URL API)."
Write-Host "  2) Ejecuta:  .\install\sylas.exe"
Write-Host "  3) Abre:     http://localhost:<PORT>"
Write-Host ""
