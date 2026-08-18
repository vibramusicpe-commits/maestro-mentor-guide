#!/bin/bash
# ==============================================================================
# decrypt-env.sh — Descifrado de Secretos con OpenSSL en tu Servidor Personal
# ==============================================================================
set -e

ENC_FILE="env.vault.enc"
TARGET_ENV=".env.local"

if [ ! -f "$ENC_FILE" ]; then
    echo "❌ Error: No se encontró el archivo cifrado $ENC_FILE."
    exit 1
fi

echo "🔓 Descifrando variables de entorno ($ENC_FILE -> $TARGET_ENV)..."
if [ -z "$VAULT_PASSWORD" ]; then
    read -s -p "🔑 Ingresa tu contraseña secreta de descifrado: " SECRET_PASS
    echo ""
else
    SECRET_PASS="$VAULT_PASSWORD"
fi

# Descifrado AES-256-CBC con pbkdf2
openssl enc -d -aes-256-cbc -pbkdf2 -in "$ENC_FILE" -out "$TARGET_ENV" -pass pass:"$SECRET_PASS"

echo "✅ ¡Variables de entorno restauradas exitosamente en $TARGET_ENV!"
