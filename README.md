#  StackOne - TFG Web App

Aplicación web desarrollada como Trabajo de Fin de Grado (TFG), orientada a la gestión y visualización de datos integrados mediante APIs externas.

## 📌 Descripción

Este proyecto consiste en una aplicación web completa (frontend + backend) que permite a los usuarios interactuar con diferentes servicios externos mediante una API unificada, inspirada en plataformas como StackOne.

El objetivo principal es simplificar la integración de múltiples servicios en una única interfaz, facilitando la gestión de datos y operaciones desde un solo punto.

## 🎯 Objetivos

- Desarrollar una aplicación web escalable
- Implementar autenticación y gestión de usuarios
- Integrar APIs externas de forma eficiente
- Crear una interfaz intuitiva y responsive
- Aplicar buenas prácticas de desarrollo full-stack

## 🛠️ Tecnologías utilizadas

### Frontend
- HTML / CSS / JavaScript
- (React / Vue / Angular — ajustar según tu proyecto)
- Tailwind / Bootstrap (si aplica)

### Backend
- Node.js + Express
- API REST

### Base de datos
- MySQL / MongoDB / PostgreSQL (ajustar)

### Otros
- JWT para autenticación
- Fetch / Axios para peticiones HTTP

## 🧱 Arquitectura

El proyecto sigue una arquitectura cliente-servidor:

Frontend  →  Backend (API REST)  →  Base de datos / APIs externas

## 🔐 Autenticación

El sistema incluye:
- Registro de usuarios
- Login con JWT
- Gestión de sesiones mediante cookies o tokens

## 📂 Estructura del proyecto

/client        → Frontend  
/server        → Backend  
/routes        → Rutas API  
/controllers   → Lógica de negocio  
/models        → Modelos de datos  
/middlewares   → Autenticación, logs, etc.  

## ⚙️ Instalación y uso

### 1. Clonar el repositorio

git clone https://github.com/xavimagine/StackOne-Tfg.git  
cd StackOne-Tfg  

### 2. Instalar dependencias

Backend:
cd server  
npm install  

Frontend:
cd client  
npm install  

### 3. Configurar variables de entorno

Crear un archivo `.env` en el backend:

PORT=3000  
DB_URI=tu_base_de_datos  
JWT_SECRET=tu_secreto  
API_URL=http://localhost:3000  

### 4. Ejecutar la aplicación

Backend:
npm run dev  

Frontend:
npm start  

## 📡 Endpoints principales

| Método | Endpoint        | Descripción              |
|--------|----------------|--------------------------|
| POST   | /auth/login    | Iniciar sesión           |
| POST   | /auth/register | Registro de usuario      |
| GET    | /data          | Obtener datos            |
| POST   | /logs          | Registro de actividad    |

## 🧪 Testing

- Tests básicos de endpoints
- Validación de errores
- Pruebas manuales en entorno local

## 📈 Mejoras futuras

- Implementar tests automatizados (Jest)
- Añadir roles de usuario
- Mejorar rendimiento y caching
- Despliegue en producción (Docker / CI-CD)

## 👨‍💻 Autor

- Javier Díaz Rayo

## 📜 Licencia

Este proyecto se ha desarrollado con fines académicos.
