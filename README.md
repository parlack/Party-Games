# 🎮 Party Games

Una aplicación web moderna para juegos de fiesta con ranking en tiempo real, perfecta para reuniones de 15-20 personas.

## 🚀 Características

- **🎯 Mini-juegos**: Quiz, Reflejos y Memoria
- **📊 Ranking en tiempo real**: Actualización automática via WebSocket
- **👑 Panel de administrador**: Control completo de los juegos
- **📺 Vista para TV**: Pantalla fullscreen para mostrar el ranking
- **🎨 Diseño moderno**: Interfaz atractiva con animaciones suaves
- **📱 Responsive**: Funciona en móviles y escritorio

## 🛠️ Tecnologías

### Frontend
- **React 18** - Última versión con hooks
- **Vite** - Build tool rápido
- **Socket.io-client** - Comunicación en tiempo real
- **Framer Motion** - Animaciones fluidas
- **Lucide React** - Iconos modernos
- **React Router** - Navegación SPA

### Backend
- **Node.js** - Servidor JavaScript
- **Express** - Framework web
- **Socket.io** - WebSocket server
- **CORS** - Configuración de seguridad
- **UUID** - Generación de IDs únicos

## 📦 Instalación

### Prerequisitos
- Node.js 16+ instalado
- npm o yarn

### Instalación Rápida

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd party-games

# Instalar todas las dependencias
npm run install-all
```

### Instalación Manual

```bash
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente
cd ../client
npm install
```

## 🚀 Ejecución

### Modo Desarrollo (Recomendado)

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará automáticamente:
- Servidor backend en `http://localhost:3001`
- Cliente frontend en `http://localhost:5173`

### Ejecución Manual

```bash
# Terminal 1: Servidor
npm run server

# Terminal 2: Cliente
npm run client
```

## 🎮 Cómo Usar

### 1. Configuración Inicial

1. **Administrador**:
   - Ir a `http://localhost:5173`
   - Marcar "Soy el administrador"
   - Contraseña: `admin123`
   - Ingresar nombre y registrarse

2. **Jugadores**:
   - Ir a `http://localhost:5173`
   - Ingresar solo su nombre
   - Hacer clic en "Unirse a la fiesta"

### 2. Gestión de Juegos (Admin)

1. **Crear Juego**:
   - Ir al "Panel de Admin"
   - Seleccionar tipo de juego:
     - **Quiz**: Preguntas de cultura general
     - **Reflejos**: Reaccionar rápido a señales
     - **Memoria**: Memorizar secuencias de colores
   - Hacer clic en "Crear Juego"

2. **Iniciar Juego**:
   - Esperar a que se unan jugadores
   - Hacer clic en "Iniciar Juego"

3. **Finalizar Juego**:
   - Hacer clic en "Finalizar Juego" cuando termine

### 3. Mostrar Ranking en TV

1. **Opción 1**: Desde el panel de admin, hacer clic en "Mostrar Ranking"
2. **Opción 2**: Abrir `http://localhost:5173/tv-ranking` en una nueva pestaña/ventana
3. **Conectar a TV**: Usar modo espejo o HDMI para mostrar en pantalla grande

## 🎯 Tipos de Juegos

### Quiz Rápido
- 3 preguntas de cultura general
- Respuestas múltiples
- Puntos por velocidad de respuesta
- Máximo: 100 puntos

### Reflejos
- 5 rondas de reacción
- Hacer clic cuando aparezca la señal verde
- Puntos por velocidad de reacción
- Máximo: 50 puntos

### Memoria
- Memorizar secuencias de colores
- 5 niveles de dificultad
- Repetir la secuencia correctamente
- Máximo: 75 puntos

## 🏆 Sistema de Ranking

- **Tiempo Real**: Actualización automática via WebSocket
- **Top 10**: Muestra los mejores jugadores
- **Persistente**: Los puntos se mantienen durante la sesión
- **Estadísticas**: Juegos jugados por cada participante

## 🔧 Configuración Avanzada

### Cambiar Puerto del Servidor

```bash
# En server/index.js
const PORT = process.env.PORT || 3001;
```

### Cambiar Contraseña de Admin

```bash
# En client/src/pages/Home.jsx
if (isAdmin && adminPassword !== 'admin123') {
```

### Agregar Más Preguntas

```bash
# En server/index.js, función getGameConfig
questions: [
  {
    question: "Tu pregunta aquí",
    options: ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
    correct: 0 // Índice de la respuesta correcta (0-3)
  }
]
```

## 🌐 Despliegue

### Desarrollo Local
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Variables de Entorno
```bash
# .env
PORT=3001
NODE_ENV=production
```

## 📱 Uso en Dispositivos Móviles

1. **Conectar dispositivos a la misma red WiFi**
2. **Encontrar la IP del servidor**:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
3. **Acceder desde móviles**: `http://[IP-DEL-SERVIDOR]:5173`

## 🎉 Consejos para la Fiesta

### Preparación
- **Probar antes**: Hacer una prueba con pocos jugadores
- **Red WiFi**: Asegurar buena conexión para todos
- **Pantalla grande**: TV o proyector para mostrar el ranking
- **Dispositivos**: Cada jugador necesita su móvil/tablet

### Durante la Fiesta
- **Admin siempre visible**: Mantener panel de admin abierto
- **Ranking en TV**: Mostrar constantemente para motivar
- **Juegos variados**: Alternar entre tipos de juegos
- **Pausas**: Permitir tiempo entre juegos

### Problemas Comunes
- **Desconexión**: Recargar página del jugador
- **Lag**: Verificar conexión WiFi
- **Puntos no actualizan**: Refrescar navegador

## 🔧 Solución de Problemas

### Error de Conexión
```bash
# Verificar que el servidor esté corriendo
npm run server

# Verificar puerto disponible
netstat -an | grep 3001
```

### Error de Módulos
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error de CORS
```bash
# Verificar configuración en server/index.js
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
```

## 📝 Changelog

### v1.0.0
- ✅ Sistema de registro sin contraseñas
- ✅ 3 tipos de mini-juegos
- ✅ Ranking en tiempo real
- ✅ Panel de administrador
- ✅ Vista para TV
- ✅ Diseño responsive
- ✅ Animaciones suaves

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Crear Pull Request

## 📄 Licencia

MIT License - Usar libremente para fiestas y eventos.

## 🎊 ¡Disfruta tu Fiesta!

¡Esperamos que tengas una fiesta increíble con Party Games! 🎉

Si tienes problemas o sugerencias, no dudes en crear un issue en el repositorio. 