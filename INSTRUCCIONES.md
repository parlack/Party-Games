# 🎮 Party Games - Instrucciones Rápidas

## ✅ Proyecto Completado

¡Tu aplicación de Party Games está lista para usar! Aquí tienes todo lo que necesitas para empezar tu fiesta.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

**Opción A - Automática:**
```bash
# Windows
./setup.bat

# Linux/Mac
./setup.sh
```

**Opción B - Manual:**
```bash
npm run install-all
```

### 2. Ejecutar la Aplicación

```bash
npm run dev
```

## 🌐 URLs Importantes

- **Jugadores**: `http://localhost:5173`
- **Administrador**: `http://localhost:5173` (contraseña: `admin123`)
- **Ranking para TV**: `http://localhost:5173/tv-ranking`

## 🎯 Flujo de Uso

### Para el Administrador:
1. Entrar como administrador (contraseña: `admin123`)
2. Ir al "Panel de Admin"
3. Crear un juego (Quiz, Reflejos, o Memoria)
4. Iniciar el juego cuando los jugadores se unan
5. Mostrar ranking en TV

### Para los Jugadores:
1. Entrar con solo su nombre
2. Esperar en el lobby
3. Unirse a los juegos cuando estén disponibles
4. ¡Divertirse y competir!

## 🎮 Tipos de Juegos

### Quiz Rápido (100 pts máx)
- Preguntas de cultura general
- Respuesta múltiple
- Puntos por velocidad

### Reflejos (50 pts máx)
- Reaccionar a señales verdes
- 5 rondas
- Puntos por velocidad de reacción

### Memoria (75 pts máx)
- Secuencias de colores
- 5 niveles
- Puntos por nivel completado

## 📺 Configuración para TV

1. Conectar laptop/PC a TV via HDMI
2. Abrir `http://localhost:5173/tv-ranking`
3. ¡El ranking se actualiza en tiempo real!

## 🔧 Solución de Problemas

### Error: "No se puede conectar"
```bash
# Verificar que ambos servicios estén corriendo
npm run dev
```

### Error: "Módulos no encontrados"
```bash
# Reinstalar dependencias
npm run install-all
```

### Los jugadores no se conectan
- Verificar que todos estén en la misma red WiFi
- Usar la IP del servidor: `http://[IP]:5173`

## 📱 Acceso desde Móviles

1. Todos los dispositivos en la misma red WiFi
2. Encontrar IP del servidor:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`
3. Acceder desde móviles: `http://[IP]:5173`

## 🎉 Consejos para la Fiesta

### Antes de Empezar:
- [ ] Probar con 2-3 personas primero
- [ ] Configurar TV/pantalla grande
- [ ] Verificar WiFi funcione bien
- [ ] Tener dispositivos cargados

### Durante la Fiesta:
- [ ] Mantener panel de admin abierto
- [ ] Alternar tipos de juegos
- [ ] Mostrar ranking entre juegos
- [ ] Hacer pausas para celebrar

## 🏆 Funcionalidades Incluidas

✅ **Sistema de Ranking en Tiempo Real**
- Actualización automática via WebSocket
- Top 10 jugadores
- Estadísticas por jugador

✅ **3 Mini-juegos Únicos**
- Quiz de cultura general
- Juego de reflejos
- Juego de memoria

✅ **Panel de Administrador**
- Crear y gestionar juegos
- Control completo de la fiesta
- Estadísticas en tiempo real

✅ **Vista para TV**
- Diseño fullscreen
- Animaciones atractivas
- Actualización automática

✅ **Diseño Responsive**
- Funciona en móviles
- Interfaz moderna
- Animaciones suaves

✅ **Sin Registro Necesario**
- Solo nombre para jugar
- Acceso instantáneo
- Perfecto para fiestas

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía
2. Verifica que Node.js esté instalado
3. Asegúrate de que los puertos 3001 y 5173 estén libres
4. Reinicia la aplicación con `npm run dev`

## 🎊 ¡Disfruta tu Fiesta!

¡Todo está listo para que tengas una fiesta increíble! 🎉

**Recuerda:**
- Contraseña de admin: `admin123`
- URL principal: `http://localhost:5173`
- Ranking TV: `http://localhost:5173/tv-ranking`

¡Que se diviertan! 🎮✨ 