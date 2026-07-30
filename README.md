# 🎮 StackOne

**StackOne** es una aplicación web *tracker de videojuegos* que permite buscar, explorar y organizar tu biblioteca de juegos favoritos. La búsqueda y consulta del catálogo está disponible **con o sin registro**, mientras que las funciones de seguimiento personal (listas, progreso, nivel de experiencia) requieren una cuenta de usuario.

El proyecto se apoya íntegramente en **servicios serverless / BaaS**: la base de datos y la autenticación se gestionan con **Supabase**, el backend se despliega como servicio en **Render** y el frontend se sirve de forma estática desde **Netlify**, sin necesidad de gestionar infraestructura propia.

> Trabajo de Fin de Grado (TFG) — Desarrollo Web Full-Stack
> Autor: **Javier Díaz Rayo** ([@xavimagine](https://github.com/xavimagine))

---

## 📌 Índice

- [Descripción general](#-descripción-general)
- [Características principales](#-características-principales)
- [Arquitectura y stack tecnológico](#-arquitectura-y-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Modelo de datos](#-modelo-de-datos)
- [Autenticación y seguridad](#-autenticación-y-seguridad)
- [API REST](#-api-rest)
- [Instalación y puesta en marcha](#-instalación-y-puesta-en-marcha)
- [Variables de entorno](#-variables-de-entorno)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Roadmap / Mejoras futuras](#-roadmap--mejoras-futuras)
- [Licencia](#-licencia)

---

## 📖 Descripción general

StackOne nace como Trabajo de Fin de Grado con el objetivo de construir una plataforma tipo *backlog tracker* (al estilo de Backloggd o HowLongToBeat) donde cualquier visitante pueda:

- Consultar un extenso catálogo de videojuegos (nombre, portada, sinopsis, géneros, plataformas, valoración y compañía desarrolladora) **sin necesidad de registrarse**.
- Crear una cuenta para guardar juegos en listas personales (*jugando*, *acabado*, *deseado*, *abandonado*), llevar un contador de progreso y subir de nivel a medida que completa juegos.
- Consultar un calendario de **próximos lanzamientos y eventos de la industria**, obtenido en tiempo real desde la API de **IGDB / Twitch**.

Toda la información del catálogo se sincroniza previamente desde IGDB y se persiste en una base de datos **PostgreSQL gestionada por Supabase**, lo que permite búsquedas rápidas, filtrado y paginación server-side sin depender de la disponibilidad o límites de la API externa en cada consulta.

---

## ✨ Características principales

- 🔎 **Búsqueda pública de videojuegos** con paginación, ordenación y filtros por texto, género, plataforma y valoración mínima — accesible con o sin sesión iniciada.
- 👤 **Registro e inicio de sesión** de usuarios mediante Supabase Auth, con sesión gestionada por **JWT en cookie `httpOnly`**.
- 📚 **Listas personales de seguimiento** por estado (*jugando*, *acabado*, *deseado*, *abandonado*) con lógica de alternancia (añadir / mover / quitar) en una sola petición.
- 📈 **Sistema de progreso y experiencia (XP)**: cada juego marcado como *acabado* suma experiencia y calcula automáticamente el nivel del usuario.
- 🗓️ **Eventos y lanzamientos** obtenidos en directo desde la API de **IGDB** (autenticada vía OAuth de Twitch).
- 🪵 **Registro de actividad (logs)** de acciones relevantes del usuario (registro, login, logout) persistido en base de datos.
- 🧑‍🎨 **Avatares generados dinámicamente** para cada usuario mediante la API de DiceBear.
- 🌗 **Modo claro / oscuro** persistente en el cliente.
- 🔐 **Eliminación de cuenta** con borrado en cascada de datos de autenticación, logs y perfil.
- 🌐 **CORS configurado explícitamente** para los distintos entornos de frontend (local, Netlify, Vercel).

---

## 🧱 Arquitectura y stack tecnológico

StackOne sigue una arquitectura desacoplada **cliente–API REST–servicios serverless**, pensada para desplegarse íntegramente en servicios gestionados (sin servidores propios que mantener):

```
┌────────────────────┐      HTTPS / REST       ┌──────────────────────┐
│   Frontend (SPA)     │ ───────────────────────▶│   Backend (Express)  │
│  HTML + TailwindCSS  │◀─────────────────────────│   Node.js API REST   │
│  Hosting: Netlify     │        JSON / JWT        │   Hosting: Render     │
└────────────────────┘                          └──────────┬───────────┘
                                                             │
                                     ┌───────────────────────┼────────────────────────┐
                                     ▼                        ▼                        ▼
                          ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
                          │  Supabase (BaaS)     │   │   IGDB API           │   │  Twitch OAuth        │
                          │  PostgreSQL + Auth    │   │  Catálogo de juegos  │   │  Token de acceso     │
                          │  serverless           │   │  y eventos           │   │  a IGDB               │
                          └────────────────────┘   └────────────────────┘   └────────────────────┘
```

### Frontend

| Tecnología | Uso |
|---|---|
| HTML5 / JavaScript (Vanilla) | Estructura y lógica de interfaz, SPA sin framework |
| Tailwind CSS | Sistema de estilos utility-first |
| Fetch API | Comunicación con el backend (`credentials: include` para cookies JWT) |

### Backend

| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor y enrutado de la API REST |
| ES Modules (`type: module`) | Sintaxis moderna `import` / `export` |
| jsonwebtoken | Emisión y verificación de JWT |
| cookie-parser | Lectura de cookies HTTP `httpOnly` |
| dotenv | Gestión de variables de entorno |

### Servicios serverless / BaaS

| Servicio | Uso |
|---|---|
| **Supabase** | Base de datos PostgreSQL gestionada, autenticación de usuarios (Supabase Auth) y almacenamiento de logs |
| **IGDB API (Twitch)** | Origen de datos del catálogo de videojuegos y de los eventos/lanzamientos |
| **Render** | Hosting serverless del backend (API Express) |
| **Netlify** | Hosting estático del frontend |
| **DiceBear API** | Generación de avatares de usuario |

### Testing

| Tecnología | Uso |
|---|---|
| Jest | Framework de tests |
| Supertest | Tests de integración sobre los endpoints Express |

---

## 📂 Estructura del proyecto

```
StackOne-Tfg/
├── app.js                     # Punto de entrada del servidor Express
├── controllers/                # Lógica de negocio por dominio
│   ├── authController.js       # Registro, login, logout, sesión y borrado de cuenta
│   ├── gameController.js       # Búsqueda y paginación de videojuegos
│   ├── listaController.js      # Gestión de listas de seguimiento y progreso/XP
│   └── logController.js        # Registro de logs de actividad
├── dao/                        # Acceso a datos (patrón DAO) sobre Supabase
│   ├── GameDAO.js
│   ├── ListasDAO.js
│   ├── LogDAO.js
│   └── UsuarioDAO.js
├── db/
│   └── database.js             # Cliente de Supabase (conexión serverless)
├── routes/                      # Definición de rutas de la API REST
│   ├── authRoutes.js
│   ├── gameRoutes.js
│   ├── listRaoutes.js
│   ├── logsRoutes.js
│   └── middleware.js           # Middlewares de verificación JWT (obligatoria/opcional)
├── public/                      # Frontend estático servido por Express / Netlify
│   ├── index.html
│   ├── css/                    # Tailwind (input/output) + estilos personalizados
│   ├── js/app.js               # Lógica de cliente (fetch, render, estado, temas)
│   └── assets/                 # Recursos estáticos
├── test/                        # Tests de integración (Jest + Supertest)
│   ├── auth.test.js
│   ├── game.test.js
│   ├── listas.test.js
│   └── logs.test.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🗃️ Modelo de datos

El proyecto trabaja principalmente sobre las siguientes tablas en Supabase (PostgreSQL):

- **`users`** — Perfil de usuario (`id`, `nick`, `email`, `avatar`), vinculado a Supabase Auth.
- **`games`** — Catálogo de videojuegos sincronizado desde IGDB (`id`, `id_game`, `name`, `summary`, `cover`, `genres`, `platforms`, `rating`, `game_modes`, `company`).
- **`listas_games`** — Relación usuario–juego con estado de seguimiento (`jugando`, `acabado`, `deseado`, `abandonado`) y fecha de alta.
- **`logs`** — Registro de eventos de actividad (`tipo`, `mensaje`) generados por el backend.

---

## 🔐 Autenticación y seguridad

- El **registro** valida formato de email y longitud mínima de nick, sanea entradas frente a inyección de HTML básica, crea el usuario en **Supabase Auth** y, en paralelo, un perfil en la tabla `users` con un avatar generado automáticamente.
- El **login** verifica la contraseña contra Supabase Auth y, si es correcta, emite un **JWT propio** firmado con `JWT_SECRET`, enviado en una cookie `httpOnly` (con `secure` y `sameSite` adaptados según entorno de desarrollo o producción).
- Dos niveles de protección de rutas mediante middleware:
  - `verificarJWT`: exige sesión válida (usada en listas, progreso, logout, borrado de cuenta).
  - `verificarJWTOpcional`: permite el acceso público a la búsqueda de juegos, pero si detecta una sesión válida, enriquece la respuesta marcando el estado personal de cada juego (*jugando*, *acabado*...). Esto es lo que permite que **la búsqueda funcione igual con o sin registro**, con valor añadido para usuarios autenticados.
- El **borrado de cuenta** elimina en cascada el usuario de Supabase Auth, sus logs y su perfil.

---

## 📡 API REST

### Autenticación — `/auth`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/registro` | Pública | Crea un nuevo usuario (Supabase Auth + perfil) |
| POST | `/auth/login` | Pública | Autentica al usuario y emite cookie JWT |
| POST | `/auth/logout` | JWT | Cierra sesión y limpia la cookie |
| GET | `/auth/me` | JWT | Devuelve los datos de la sesión actual |
| DELETE | `/auth/delete` | JWT | Elimina la cuenta y todos sus datos asociados |

### Videojuegos — `/games`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/games/buscar` | Opcional | Búsqueda paginada con filtros (`texto`, `genero`, `plataforma`, `rating`, `orden`, `direccion`, `page`, `limit`) |
| POST | `/games/lista` | JWT | Añade, mueve o elimina un juego de una lista de seguimiento |
| GET | `/games/lista/:status` | JWT | Obtiene los juegos del usuario filtrados por estado |
| GET | `/games/progreso` | JWT | Calcula XP y nivel del usuario en base a juegos completados |

### Listas (alias adicionales) — `/`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/games/buscar` | Pública | Alias de búsqueda |
| GET | `/games/lista/:status` | JWT | Alias de consulta por estado |
| POST | `/games/add` | JWT | Alias de alta/toggle en lista |

### Eventos — `/events`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/events` | Pública | Obtiene próximos eventos y lanzamientos desde IGDB (vía OAuth de Twitch) |

### Logs — `/logs`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/logs` | Pública | Inserta un registro de actividad (`tipo`, `mensaje`) |

---

## ⚙️ Instalación y puesta en marcha

### Requisitos previos

- Node.js `>= 18`
- Una cuenta y proyecto en [Supabase](https://supabase.com) con las tablas `users`, `games`, `listas_games` y `logs`
- Credenciales de aplicación de [Twitch Developers](https://dev.twitch.tv/) (para consumir la API de IGDB)

### 1. Clonar el repositorio

```bash
git clone https://github.com/xavimagine/StackOne-Tfg.git
cd StackOne-Tfg
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (ver [Variables de entorno](#-variables-de-entorno)).

### 4. Compilar los estilos (Tailwind)

```bash
npm run build:css      # compilación única
npm run watch:css      # recompilación en caliente durante el desarrollo
```

### 5. Ejecutar la aplicación

```bash
npm run dev     # entorno de desarrollo
npm start       # entorno de producción
```

La aplicación quedará disponible en `http://localhost:3000`, sirviendo tanto la API como el frontend estático desde `public/`.

---

## 🔑 Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto en el que se levanta el servidor Express (por defecto `3000`) |
| `NODE_ENV` | `development` o `production`, afecta a cookies (`secure`, `sameSite`) |
| `SUPABASE_URL` | URL del proyecto de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de Supabase (acceso administrativo desde el backend) |
| `JWT_SECRET` | Secreto utilizado para firmar y verificar los JWT de sesión |
| `TWITCH_CLIENT_ID` | Client ID de la aplicación registrada en Twitch Developers |
| `TWITCH_CLIENT_SECRET` | Client Secret de la aplicación de Twitch (usado para autenticar contra IGDB) |
| `FRONTEND_URL` | Origen adicional permitido por CORS (útil en despliegues personalizados) |

> ⚠️ El archivo `.env` está excluido del control de versiones (`.gitignore`). Nunca subas credenciales reales al repositorio.

---

## 🧪 Testing

El proyecto incluye tests de integración con **Jest** y **Supertest**, que mockean el cliente de Supabase para probar los controladores de forma aislada (autenticación, búsqueda de juegos, listas y logs).

```bash
npm test
```

Cobertura actual:
- `test/auth.test.js` — registro, login, sesión y errores de autenticación
- `test/game.test.js` — búsqueda y paginación de videojuegos
- `test/listas.test.js` — alta, cambio de estado y borrado en listas de seguimiento
- `test/logs.test.js` — validación e inserción de logs

---

## 🚀 Despliegue

El proyecto está diseñado para un despliegue 100% serverless, sin gestión manual de infraestructura:

- **Backend (API Express)** → desplegado como servicio web en **Render**.
- **Frontend (estático)** → desplegado en **Netlify**.
- **Base de datos, autenticación y almacenamiento de logs** → gestionados por **Supabase** (PostgreSQL + Auth as a Service).
- **Datos de videojuegos y eventos** → obtenidos bajo demanda desde la **API de IGDB**, autenticada mediante el flujo OAuth de **Twitch**.

El middleware CORS de `app.js` contempla explícitamente los orígenes de producción (Netlify/Vercel) además de los entornos locales, por lo que basta con configurar `FRONTEND_URL` para añadir nuevos dominios de despliegue sin tocar código.

---

## 🗺️ Roadmap / Mejoras futuras

- Ampliar la cobertura de tests automatizados a rutas de eventos y middleware
- Añadir roles de usuario (administrador / moderador de catálogo)
- Implementar caché para reducir peticiones repetidas a la API de IGDB
- Migrar la sincronización del catálogo a un proceso automatizado (cron / webhook)
- Integrar CI/CD para despliegues automáticos en Render y Netlify

---

## 📜 Licencia

Este proyecto se distribuye bajo licencia **MIT** y ha sido desarrollado con fines académicos como Trabajo de Fin de Grado.

---

## 👨‍💻 Autor

**Javier Díaz Rayo**
GitHub: [@xavimagine](https://github.com/xavimagine)
