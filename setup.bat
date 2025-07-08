@echo off
chcp 65001 >nul

REM 🎮 Party Games - Setup Script
REM Instalación rápida para Windows

echo 🎮 Party Games - Setup
echo ======================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo 📥 Descarga Node.js desde: https://nodejs.org/
    echo 🔄 Instala Node.js y ejecuta este script nuevamente
    pause
    exit /b 1
)

echo ✅ Node.js está instalado
echo.

REM Instalar dependencias del proyecto principal
echo 📦 Instalando dependencias del proyecto principal...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias principales
    pause
    exit /b 1
)

echo ✅ Dependencias principales instaladas
echo.

REM Instalar dependencias del servidor
echo 📦 Instalando dependencias del servidor...
cd server
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del servidor
    pause
    exit /b 1
)

echo ✅ Dependencias del servidor instaladas
echo.

REM Instalar dependencias del cliente
echo 📦 Instalando dependencias del cliente...
cd ../client
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del cliente
    pause
    exit /b 1
)

echo ✅ Dependencias del cliente instaladas
cd ..

echo.
echo 🎉 ¡Instalación completada!
echo.
echo 🚀 Para iniciar el proyecto:
echo    npm run dev
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3001
echo.
echo 👑 Credenciales de administrador:
echo    Contraseña: admin123
echo.
echo 🎮 ¡Disfruta tu fiesta!
echo.
pause 