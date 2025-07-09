# 🚀 Guía de Producción - Party Games

## Problema Identificado

El error que experimentaste se debe a **límites de recursos del sistema** en el servidor de producción:

```
runtime: failed to create new OS thread (have 8 already; errno=11)
runtime: may need to increase max user processes (ulimit -u)
fatal error: newosproc
```

## Soluciones Implementadas

### 1. **Configuración Optimizada de Vite**
- Reducción del uso de memoria con `NODE_OPTIONS='--max-old-space-size=512'`
- Configuración de esbuild para menor consumo de recursos
- Deshabilitación de sourcemaps en producción

### 2. **Scripts de Producción**
Usa estos comandos optimizados:

```bash
# Para construir en producción
npm run build:prod

# Para ejecutar en producción (recomendado)
npm run dev:prod

# Para ejecutar con el script optimizado
./production.sh
```

### 3. **Comandos de Servidor**

#### Opción 1: Usando el script optimizado (Recomendado)
```bash
chmod +x production.sh
./production.sh
```

#### Opción 2: Comandos manuales
```bash
# 1. Construir el cliente
cd client && NODE_OPTIONS='--max-old-space-size=512' npm run build

# 2. Iniciar solo el servidor (sirve archivos estáticos)
cd ../server && NODE_ENV=production npm start
```

## Verificaciones del Sistema

### Verificar límites actuales:
```bash
ulimit -a
```

### Verificar procesos en uso:
```bash
ps aux | grep node | wc -l
```

### Limpiar procesos previos:
```bash
pkill -f "node.*party-games"
pkill -f "vite"
```

## Configuración del Servidor

El servidor ahora:
- ✅ Sirve archivos estáticos del cliente compilado
- ✅ Maneja CORS para dominios de producción
- ✅ Usa menos recursos al no ejecutar Vite en paralelo
- ✅ Incluye ruta catch-all para React Router

## URLs de Acceso

Una vez ejecutado en producción:
- **Aplicación completa**: `https://tu-dominio.com`
- **API**: `https://tu-dominio.com/api/rankings`
- **WebSocket**: Se conecta automáticamente al mismo puerto

## Monitoreo

Para verificar que todo funciona:

```bash
# Verificar que el servidor esté corriendo
ps aux | grep "node.*server"

# Verificar logs
tail -f server/logs/* # si tienes logs configurados
```

## Troubleshooting

### Si sigues teniendo problemas de recursos:

1. **Aumentar límites del usuario**:
```bash
ulimit -u 64  # Aumentar procesos permitidos
ulimit -n 2048  # Aumentar archivos abiertos
```

2. **Contactar al proveedor de hosting** para aumentar límites del plan

3. **Usar modo de construcción estática**:
```bash
# Solo construir y servir archivos estáticos
npm run build
# Luego usar servidor web como nginx o apache
```

## Notas Importantes

- ⚠️ **No uses `npm run dev`** en producción - consume demasiados recursos
- ✅ **Usa `npm run dev:prod`** o el script `production.sh`
- 🔧 El servidor está configurado para manejar automáticamente producción vs desarrollo
- 📊 Monitorea regularmente el uso de recursos con `htop` o `top` 