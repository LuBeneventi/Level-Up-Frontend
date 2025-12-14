# 🎮 Level-Up Gaming E-commerce

Este proyecto es una aplicación de comercio electrónico Fullstack para la tienda "Level-Up Gamer", un destino online para entusiastas de los videojuegos en Chile. El proyecto está desarrollado con **React** y **Spring Boot**.

## ✨ Características Principales

- **Arquitectura Moderna**: Frontend en React (Vite) y Backend en Spring Boot (Java).
- **Persistencia de Datos**: Base de datos H2 (en memoria) o MySQL (configurable).
- **Sistema de Usuarios Completo**:
  - **Registro Seguro**: Validación de RUT chileno, formato de email y contraseñas robustas.
  - **Login y Sesión**: Autenticación mediante **JWT**.
  - **Recuperación de Contraseña**: Flujo seguro mediante token (simulado en desarrollo) y cambio directo en perfil.
  - **Perfil de Usuario**: Gestión de dirección de envío, visualización de puntos y cambio de contraseña.
  - **Roles**: `admin` y `user`.
- **E-commerce Avanzado**:
  - **Catálogo de Productos**: Filtrado, búsqueda y control de stock.
  - **Carrito de Compras**: Persistente y dinámico.
  - **Checkout Inteligente**: Cálculo de costos de envío basado en **Regiones de Chile** y validación de direcciones.
  - **Sistema de Puntos y Recompensas**: 
    - Gana puntos por cada compra.
    - Canjea puntos por **Descuentos (%)**, **Montos Fijos ($)** o **Envíos Gratis**.
    - Gestión dinámica de recompensas desde el panel de administración.
- **Panel de Administración (Dashboard)**:
  - Métricas en tiempo real (Ingresos, Órdenes de hoy, Producto top).
  - **Alertas de Stock**: Notificación visual cuando un producto tiene bajo stock.
  - **Gestión CRUD Completa**: Productos, Órdenes, Usuarios, Eventos, Blog, Videos y **Recompensas**.
- **Seguridad**:
  - Rutas protegidas en Frontend y Backend (Spring Security).
  - Interceptor de Axios para inyección automática de tokens.
  - Validación de roles en el servidor.

## ⚙️ Stack Tecnológico

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite | Interfaz de usuario rápida y tipada. |
| **Estilos** | React-Bootstrap, CSS Modules | Diseño responsivo, tema oscuro y estética "Gamer". |
| **Backend** | Java 17, Spring Boot 3 | API RESTful robusta y segura. |
| **Seguridad** | Spring Security, JWT | Autenticación y autorización. |
| **Datos** | JPA / Hibernate, H2/MySQL | Persistencia de datos relacional. |

---

## 🚀 Cómo Ejecutar el Proyecto

El proyecto requiere ejecutar **dos terminales**:

### 1. Backend (Spring Boot)
```bash
cd level-up-gaming-backend-spring
# En Windows (PowerShell)
./mvnw spring-boot:run
# O desde tu IDE favorito (IntelliJ, Eclipse, VS Code) ejecutando LevelUpGamingApplication.java
```
El servidor correrá en `http://localhost:8080`.

### 2. Frontend (React)
```bash
cd level-up-gaming-frontend
npm install
npm run dev
```
La aplicación correrá en `http://localhost:5173`.

---

## 📚 Guía de Uso

### Flujos de Usuario
1.  **Registro**: Crea una cuenta validando tu RUT y correo.
2.  **Compra**: Añade productos al carrito. En el checkout, selecciona tu región (Chile) para calcular el envío.
3.  **Puntos**: Al finalizar la compra, ganarás puntos automáticamente.
4.  **Recompensas**: Ve a la sección de recompensas y canjea tus puntos por cupones de descuento.
5.  **Admin**: Ingresa con una cuenta de rol `admin` para ver el Dashboard y gestionar la tienda (incluyendo la creación de nuevas recompensas).

### Endpoints Clave (API)
-   `POST /api/users/login`: Autenticación.
-   `POST /api/users/register`: Registro de usuarios.
-   `POST /api/users/reset-password`: Recuperación de contraseña.
-   `GET /api/products`: Catálogo público.
-   `POST /api/orders`: Crear orden (requiere token).
-   `GET /api/rewards`: Listar recompensas disponibles.
-   `POST /api/rewards/admin`: Crear nueva recompensa (Admin).

### 📖 Documentación de API (Swagger)
El backend incluye documentación interactiva generada automáticamente con **Swagger / OpenAPI**.
Una vez que el servidor backend esté corriendo, puedes acceder a ella en:
👉 `http://localhost:8080/swagger-ui/index.html`

---

## 🧪 Testing

El proyecto incluye tests unitarios y de integración para el frontend usando **Vitest**.

```bash
cd level-up-gaming-frontend
npm test
```

---

## 📂 Estructura del Proyecto

-   `level-up-gaming-frontend/`: Código fuente de la aplicación React.
-   `level-up-gaming-backend-spring/`: Código fuente de la aplicación Spring Boot.
-   `SECURE_PASSWORD_RESET_GUIDE.md`: Guía técnica para implementar recuperación de contraseña segura en producción.
-   `QUICK_START.md`: Guía rápida de inicio.

