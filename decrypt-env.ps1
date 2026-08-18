# ==============================================================================
# decrypt-env.ps1 — Descifrado de Secretos para Windows PowerShell
# ==============================================================================
$ErrorActionPreference = "Stop"

$encFile = "env.vault.enc"
$targetEnv = ".env.local"

if (-not (Test-Path $encFile)) {
    Write-Error "❌ Error: No se encontró el archivo cifrado $encFile."
}

Write-Host "🔓 Descifrando variables de entorno ($encFile -> $targetEnv)..." -ForegroundColor Cyan

if ($env:VAULT_PASSWORD) {
    $plainPass = $env:VAULT_PASSWORD
} else {
    $pass = Read-Host -Prompt "🔑 Ingresa tu contraseña secreta de descifrado" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass)
    $plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
}

openssl enc -d -aes-256-cbc -pbkdf2 -in $encFile -out $targetEnv -pass pass:$plainPass

Write-Host "✅ ¡Variables de entorno restauradas exitosamente en $targetEnv!" -ForegroundColor Green
