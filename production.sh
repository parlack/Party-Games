#!/bin/bash

# Script de producción optimizado para GoDaddy y hosting compartido
# Compatible con Node.js 10+

echo "🚀 Iniciando Party Games en modo producción para GoDaddy..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta desde la raíz del proyecto."
    exit 1
fi

# Limpiar procesos anteriores
echo "🧹 Limpiando procesos anteriores..."
pkill -f "node.*party-games" 2>/dev/null || true
pkill -f "node.*server" 2>/dev/null || true

# Construir la aplicación cliente
echo "🏗️  Construyendo aplicación cliente..."
cd client
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error al construir el cliente"
    exit 1
fi
cd ..

# Verificar que se creó la carpeta dist
if [ ! -d "client/dist" ]; then
    echo "❌ Error: No se generó la carpeta dist"
    exit 1
fi

echo "✅ Build completado. Archivos listos en client/dist/"

# Iniciar servidor de producción
echo "🚀 Iniciando servidor de producción..."
cd server
NODE_ENV=production node index.js

echo "🎉 ¡Aplicación iniciada correctamente!" 