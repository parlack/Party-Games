# 🚀 Guía de Despliegue en GoDaddy - SOLUCIONADO ✅

## ✅ **PROBLEMA RESUELTO**

El error se debe a que **GoDaddy usa Node.js 10** pero **Vite requiere Node.js 14+**. 

**La solución es construir localmente y subir solo los archivos compilados.**

## 📋 **PASOS EXACTOS PARA GODADDY**

### **Paso 1: Archivos ya preparados ✅**

En tu computadora local ya tienes:
- ✅ `client/dist/` - Archivos del frontend compilados
- ✅ `server/` - Backend configurado para producción
- ✅ Scripts optimizados para GoDaddy

### **Paso 2: Subir archivos a GoDaddy**

1. **Conecta por FTP o FileManager de GoDaddy**
2. **Ve a tu directorio**: `/home/q8rcln7qjss0/public_html/games.xn--venamifiestitade20aosporfaplis-w4c.space/`
3. **Sube estos archivos y carpetas**:
   ```
   📁 server/          (toda la carpeta)
   📁 client/dist/     (solo la carpeta dist, no toda client/)
   📄 package.json
   📄 GODADDY.md
   ```

### **Paso 3: Instalar dependencias en GoDaddy**

En el **Terminal de GoDaddy** (o SSH):

```bash
# 1. Ir al directorio
cd /home/q8rcln7qjss0/public_html/games.xn--venamifiestitade20aosporfaplis-w4c.space/

# 2. Instalar dependencias del proyecto principal (no usa concurrently en producción)
npm install --only=production

# 3. Instalar dependencias del servidor
cd server && npm install --only=production && cd ..
```

### **Paso 4: Configurar la aplicación Node.js en GoDaddy**

En el **Panel de cPanel > Setup Node.js App**:

1. **Application root**: `public_html/games.xn--venamifiestitade20aosporfaplis-w4c.space`
2. **Application startup file**: `server/index.js` 
3. **Application mode**: `Production`
4. **Environment variables**: 
   - `NODE_ENV` = `production`
5. **Hacer clic en "Create"**

### **Paso 5: Iniciar la aplicación**

**Opción A - Desde cPanel (Recomendado):**
- Hacer clic en "Start App" en la configuración de Node.js

**Opción B - Desde Terminal:**
```bash
cd /home/q8rcln7qjss0/public_html/games.xn--venamifiestitade20aosporfaplis-w4c.space/server
NODE_ENV=production node index.js
```

## 🎯 **VERIFICACIÓN**

1. **Ve a**: `https://games.xn--venamifiestitade20aosporfaplis-w4c.space/`
2. **Deberías ver**: La página principal de Party Games
3. **Si funciona**: ¡Listo! 🎉

## 🔧 **ESTRUCTURA FINAL EN GODADDY**

```
/home/q8rcln7qjss0/public_html/games.xn--venamifiestitade20aosporfaplis-w4c.space/
├── package.json
├── server/
│   ├── index.js          ← Tu aplicación principal
│   ├── package.json
│   └── node_modules/
├── client/
│   └── dist/             ← Frontend compilado (React/Vite)
│       ├── index.html
│       └── assets/
└── node_modules/
```

## 🚫 **LO QUE NO DEBES HACER EN GODADDY**

- ❌ NO subas `client/node_modules/` 
- ❌ NO uses `npm run dev`
- ❌ NO uses `npm run build` en el servidor
- ❌ NO instales dependencias de desarrollo

## ✅ **LO QUE SÍ FUNCIONA EN GODADDY**

- ✅ `node server/index.js`
- ✅ Archivos ya compilados en `client/dist/`
- ✅ Solo dependencias de producción
- ✅ NODE_ENV=production

## 🐛 **TROUBLESHOOTING**

### **Si ves "Not Found":**
```bash
# Verificar que el servidor esté corriendo
ps aux | grep node

# Verificar archivos
ls -la client/dist/    # Debe existir index.html
ls -la server/         # Debe existir index.js
```

### **Si hay errores en logs:**
```bash
# Ver logs (si están configurados)
cat /home/q8rcln7qjss0/logs/passenger.log
```

### **Si el servidor no inicia:**
```bash
# Verificar dependencias
cd server && npm ls
```

## 🎯 **URLs DISPONIBLES**

Una vez funcionando:
- **🏠 Home**: `https://games.xn--venamifiestitade20aosporfaplis-w4c.space/`
- **👨‍💼 Admin**: `https://games.xn--venamifiestitade20aosporfaplis-w4c.space/admin`  
- **🎮 Lobby**: `https://games.xn--venamifiestitade20aosporfaplis-w4c.space/lobby`
- **📺 TV Ranking**: `https://games.xn--venamifiestitade20aosporfaplis-w4c.space/tv-ranking`

## 🔄 **PARA FUTURAS ACTUALIZACIONES**

Cuando hagas cambios al frontend:
1. En tu PC: `cd client && npm run build`
2. Sube solo la carpeta `client/dist/` al servidor
3. Reinicia la app en cPanel

Cuando hagas cambios al backend:
1. Sube los archivos modificados del `server/`
2. Reinicia la app en cPanel

---

**¡Con estos pasos tu aplicación debería funcionar perfectamente en GoDaddy! 🎉** 