#!/bin/bash

# 🎮 Party Games - Setup Script
# Instalación rápida para Linux/Mac

echo "🎮 Party Games - Setup"
echo "======================"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "📥 Descarga Node.js desde: https://nodejs.org/"
    echo "🔄 Instala Node.js y ejecuta este script nuevamente"
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "⚠️  Versión de Node.js muy antigua: $(node --version)"
    echo "📥 Necesitas Node.js 16 o superior"
    exit 1
fi

echo "✅ Node.js $(node --version) detectado"
echo ""

# Instalar dependencias del proyecto principal
echo "📦 Instalando dependencias del proyecto principal..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias principales"
    exit 1
fi

echo "✅ Dependencias principales instaladas"
echo ""

# Instalar dependencias del servidor
echo "📦 Instalando dependencias del servidor..."
cd server
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del servidor"
    exit 1
fi

echo "✅ Dependencias del servidor instaladas"
echo ""

# Instalar dependencias del cliente
echo "📦 Instalando dependencias del cliente..."
cd ../client
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del cliente"
    exit 1
fi

echo "✅ Dependencias del cliente instaladas"
cd ..

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "🚀 Para iniciar el proyecto:"
echo "   npm run dev"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
echo "👑 Credenciales de administrador:"
echo "   Contraseña: admin123"
echo ""
echo "🎮 ¡Disfruta tu fiesta!" 