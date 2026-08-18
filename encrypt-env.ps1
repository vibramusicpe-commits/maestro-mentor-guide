# ==============================================================================
# encrypt-env.ps1 — Cifrado de Secretos para Windows PowerShell
# ==============================================================================
$ErrorActionPreference = "Stop"

$sourceEnv = ".env.local"
if (-not (Test-Path $sourceEnv)) {
    if (Test-Path ".env") {
        $sourceEnv = ".env"
    } else {
        Write-Error "❌ Error: No se encontró .env.local ni .env para cifrar."
    }
}

$outputEnc = "env.vault.enc"
Write-Host "🔒 Cifrando variables de entorno ($sourceEnv -> $outputEnc)..." -ForegroundColor Cyan
$pass1 = Read-Host -Prompt "🔑 Ingresa una contraseña maestra para cifrar" -AsSecureString
$pass2 = Read-Host -Prompt "🔑 Confirma la contraseña maestra" -AsSecureString

$bstr1 = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass1)
$plainPass1 = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr1)

$bstr2 = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass2)
$plainPass2 = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr2)

if ($plainPass1 -ne $plainPass2) {
    Write-Error "❌ Error: Las contraseñas no coinciden."
}

if ([string]::IsNullOrWhiteSpace($plainPass1)) {
    Write-Error "❌ Error: La contraseña no puede estar vacía."
}

# Ejecutar openssl
openssl enc -aes-256-cbc -pbkdf2 -salt -in $sourceEnv -out $outputEnc -pass pass:$plainPass1

Write-Host "✅ ¡Archivo cifrado exitosamente en $outputEnc!" -ForegroundColor Green
Write-Host "🛡️ Ahora puedes subir $outputEnc a tu GitHub personal con total seguridad." -ForegroundColor Yellow
