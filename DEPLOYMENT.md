# Instrucciones de Despliegue en Railway

## Variables de Entorno Necesarias

Configura las siguientes variables de entorno en Railway:

```
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
SOCKET_IO_CORS_ORIGIN=*
CLEANUP_INTERVAL=300000
```

## Configuración del Build

Railway debería detectar automáticamente el Dockerfile y usar el script de build definido en package.json.

## Comandos de Build

El proceso de build ejecuta:
1. `npm run build` - Construye tanto el frontend (React Router) como el backend
2. El servidor unificado (`server.js`) maneja tanto las rutas de React Router como Socket.IO

## Solución al Problema

El error `/engine.io` se resolvió integrando Socket.IO directamente con el servidor de React Router, de manera que:

1. Socket.IO maneja las rutas `/socket.io/*` y `/engine.io/*`
2. React Router maneja todas las demás rutas de la aplicación
3. El servidor sirve archivos estáticos del build de React Router
4. Las APIs están disponibles en `/api/*` y `/health`

## Verificación

Una vez desplegado, puedes verificar que funciona correctamente:

1. Visita la URL de tu aplicación - debería cargar la página principal
2. Visita `/health` - debería mostrar el estado del servidor
3. Las conexiones WebSocket deberían funcionar sin errores 404

## Estructura del Servidor

```
server.js
├── Socket.IO Server (maneja /engine.io, /socket.io)
├── API Routes (/api/*, /health)
├── Static Files (build/client)
└── React Router (todas las demás rutas)
``` 