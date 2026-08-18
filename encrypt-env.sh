#!/bin/bash
# ==============================================================================
# encrypt-env.sh — Cifrado de Secretos con OpenSSL (AES-256-CBC con PBKDF2)
# ==============================================================================
set -e

SOURCE_ENV=".env.local"
OUTPUT_ENC="env.vault.enc"

if [ ! -f "$SOURCE_ENV" ]; then
    if [ -f ".env" ]; then
        SOURCE_ENV=".env"
    else
        echo "❌ Error: No se encontró .env.local ni .env para cifrar."
        exit 1
    fi
fi

echo "🔒 Cifrando variables de entorno ($SOURCE_ENV -> $OUTPUT_ENC)..."
read -s -p "🔑 Ingresa una contraseña maestra para cifrar: " SECRET_PASS
echo ""
read -s -p "🔑 Confirma la contraseña maestra: " SECRET_PASS_CONFIRM
echo ""

if [ "$SECRET_PASS" != "$SECRET_PASS_CONFIRM" ]; then
    echo "❌ Error: Las contraseñas no coinciden."
    exit 1
fi

if [ -z "$SECRET_PASS" ]; then
    echo "❌ Error: La contraseña no puede estar vacía."
    exit 1
fi

# Cifrado AES-256-CBC con salt y derivación de clave pbkdf2
openssl enc -aes-256-cbc -pbkdf2 -salt -in "$SOURCE_ENV" -out "$OUTPUT_ENC" -pass pass:"$SECRET_PASS"

echo "✅ ¡Archivo cifrado exitosamente en $OUTPUT_ENC!"
echo "🛡️ Ahora puedes subir $OUTPUT_ENC a tu GitHub personal con total seguridad."
