# 🗡️ Munchkin Tracker

Aplicación multiplayer local para llevar el control de tus partidas de Munchkin. Conecta hasta 6 jugadores en la misma red WiFi y ve las estadísticas de todos en tiempo real.

## ✨ Características

- 🏰 **Crear/Unirse a partidas** - Un jugador crea la partida, los demás se unen
- 📊 **Estadísticas en tiempo real** - Nivel, equipo, raza y clase de cada jugador
- ⚔️ **Sistema de combate** - Añade monstruos y ayudantes, calcula fuerza automáticamente
- 👹 **Base de datos de monstruos** - Monstruos del Munchkin 1-9 con bonificaciones y mal rollo
- 📸 **Escáner de cartas** - Escanea una carta para añadir monstruos rápidamente
- 🎭 **Razas y clases** - Selecciona tu raza y clase con sus habilidades
- 🔄 **Actualizaciones** - Descarga nuevas versiones desde GitHub

## 📱 Instalación

1. Descarga el APK desde [Releases](https://github.com/adm-adi/munchkin-tracker/releases)
2. Instala en tu dispositivo Android
3. ¡Juega!

## 🎮 Cómo usar

### Crear partida
1. Abre la app y pulsa **"Crear Partida"**
2. Introduce tu nombre
3. Comparte el código de conexión con tus amigos
4. Espera a que se unan y pulsa **"Iniciar Partida"**

### Unirse a partida
1. Abre la app y pulsa **"Unirse a Partida"**
2. Introduce tu nombre
3. Selecciona la partida o introduce la IP manualmente
4. ¡Listo!

### Durante la partida
- **+/-** para subir/bajar nivel y equipo
- **Raza/Clase** para cambiar tu personaje
- **Iniciar Combate** para empezar un combate
- Añade monstruos buscando en la base de datos o escaneando cartas

## 🛠️ Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/adm-adi/munchkin-tracker.git
cd munchkin-tracker

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run android
```

## 📦 Generar APK

```bash
# Usando EAS Build
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

O espera a que GitHub Actions genere el APK automáticamente al crear un tag.

## 📝 Licencia

Este proyecto es de código abierto. Munchkin® es una marca registrada de Steve Jackson Games.

---

Hecho con ❤️ para los fans de Munchkin
