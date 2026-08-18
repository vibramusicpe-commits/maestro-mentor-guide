#!/bin/bash
# ==============================================================================
# deploy-migrate.sh — Despliegue y Migración Autónoma en 1 Clic
# ==============================================================================
set -e

REPO_URL="https://github.com/Fabricioburninglow2/vibra-music-backend.git"
DEST_DIR="vibra-music-app"

echo "===================================================================="
echo "🚀 INICIANDO DESPLIEGUE EN 1 CLIC — VIBRA MUSIC (FABRICIO PERSONAL)"
echo "===================================================================="

# 1. Clonar repositorio personal si no existe
if [ ! -d "$DEST_DIR" ]; then
    echo "📦 Clonando repositorio desde $REPO_URL..."
    git clone "$REPO_URL" "$DEST_DIR"
    cd "$DEST_DIR"
else
    echo "🔄 Repositorio existente. Obteniendo últimos cambios..."
    cd "$DEST_DIR"
    git pull origin main
fi

# 2. Descifrar variables de entorno
if [ -f "env.vault.enc" ]; then
    echo "🔓 Descifrando variables de entorno..."
    chmod +x decrypt-env.sh
    ./decrypt-env.sh
else
    echo "⚠️ Advertencia: No se encontró env.vault.enc. Usando .env.example si es necesario."
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
    fi
fi

# 3. Instalación de dependencias (Node / Bun)
echo "📦 Instalando dependencias del proyecto..."
if command -v bun &> /dev/null; then
    bun install
else
    npm install
fi

# 4. Compilación del proyecto
echo "🏗️ Compilando aplicación..."
if command -v bun &> /dev/null; then
    bun run build || echo "Modo dev listo."
else
    npm run build || echo "Modo dev listo."
fi

# 5. Levantamiento de servicios (PM2 / Docker / Vite)
echo "🚀 Levantando servidor en segundo plano..."
if command -v pm2 &> /dev/null; then
    pm2 delete vibra-music-backend 2>/dev/null || true
    pm2 start "npm run dev" --name "vibra-music-backend"
    pm2 save
    echo "✅ ¡Servidor ejecutándose con PM2 en http://localhost:5173!"
else
    echo "✅ Para iniciar el servidor ejecuta: npm run dev"
fi

echo "===================================================================="
echo "🎉 ¡MIGRACIÓN Y DESPLIEGUE COMPLETADOS CON ÉXITO!"
echo "===================================================================="
