<<<<<<< HEAD
# Pullman Payment System

## Despliegue Local - Paso a Paso

### 1. Requisitos previos
- **Node.js** y **npm** instalados (https://nodejs.org/)
- **Java 17+** instalado (https://adoptium.net/)
- **PostgreSQL** instalado y corriendo
- **Maven** instalado (ver instrucciones abajo)

### 2. Instalar Maven (Windows)

#### Opción automática (recomendada)
1. Abre **PowerShell como Administrador**
2. Instala Chocolatey (si no lo tienes):
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; `
   [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
   iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```
3. Cierra y abre una nueva terminal PowerShell como Administrador
4. Instala Maven:
   ```powershell
   choco install maven -y
   ```
5. Verifica Maven:
   ```powershell
   mvn -v
   ```

#### Opción manual
- Descarga Maven: https://maven.apache.org/download.cgi
- Descomprime y agrega la carpeta `/bin` al PATH del sistema

### 3. Preparar la base de datos
- Crea una base de datos llamada `pullman_db` (o la que definas en `backend/src/main/resources/application.properties`)
- Configura usuario y contraseña en ese archivo según tu entorno

### 4. Levantar el backend
1. Abre una terminal en la carpeta `backend`
2. Ejecuta:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
3. El backend estará disponible en `http://localhost:8080`

### 5. Levantar el frontend
1. Abre otra terminal en la carpeta `frontend`
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en `frontend/` con:
   ```env
   REACT_APP_API_URL=http://localhost:8080/api
   ```
4. Ejecuta:
   ```bash
   npm start
   ```
5. El frontend estará disponible en `http://localhost:3000`

### 6. Probar el sistema
- Ingresa con los usuarios de prueba (ver tabla en README)
- Prueba cada módulo: recorridos, producción, validación, pagos, reportes
- Verifica mensajes, validaciones y navegación

---

## Estructura del Proyecto

```
pullman-payment-system/
│
├── backend/           # API, lógica de negocio y base de datos (Java Spring Boot)
├── frontend/          # Portal web (React + TailwindCSS)
├── mockups/           # Mockups de interfaz
├── docs/              # Diagramas y documentación técnica
├── README.md          # Documentación principal
└── .env.example       # Variables de entorno ejemplo
```

## Instalación rápida

1. Clona el repositorio
2. Instala dependencias en backend (Java/Maven) y frontend (npm/yarn)
3. Configura las variables de entorno
4. Ejecuta migraciones de base de datos
5. Inicia backend y frontend

## Usuarios de prueba
| Rol                  | Email               | Contraseña   |
|----------------------|--------------------|--------------|
| Administrador        | admin@demo.com     | Admin123     |
| Validador Operacional| validador@demo.com | Valida123    |
| Miembro              | miembro@demo.com   | Miembro123   |
| Invitado             | invitado@demo.com  | Invitado123  |

## Módulos principales

- **Registro de Recorridos:** Carga manual y (próximamente) masiva de recorridos. Permite agregar varios recorridos antes de guardar. Historial editable solo por admin.
- **Cálculo de Producción:** Consolidación por decena y empresario, aplicación automática de porcentajes por zona, edición controlada.
- **Validación Operacional:** Panel de revisión y aprobación decenal, registro de decisiones y comentarios, bloqueo de edición tras validación.
- **Liquidación y Pagos:** Registro de pagos, asociación automática a empresario y período, alertas de vencimiento.
- **Reportes:** Filtros por decena, zona y empresario, exportación simulada a PDF/Excel, ranking de empresarios.
- **Gestión de usuarios:** Solo para admin, gestión de roles y accesos.

## Estructura de carpetas frontend

```
frontend/
├── src/
│   ├── components/    # Navbar, tablas, formularios reutilizables
│   ├── modules/       # Módulos funcionales (Recorridos, Producción, etc.)
│   ├── pages/         # Rutas principales (login, dashboard, reportes)
│   ├── hooks/         # Custom hooks (useAuth, useRecorridosApi, etc.)
│   ├── utils/         # Funciones auxiliares
│   └── styles/        # Estilos globales y Tailwind
├── public/            # Assets estáticos
├── package.json       # Dependencias y scripts
└── README.md
```

## Ejemplo de formato para carga masiva (placeholder)

> Cuando recibas el formato real, reemplaza este ejemplo.

| fecha      | origen | destino | horario | tipologia | zona        | empresario | kilometraje |
|------------|--------|---------|---------|-----------|-------------|------------|-------------|
| 2024-07-01 | A      | B       | 08:00   | Bus A     | JB          | Empresa 1  | 120         |
| 2024-07-01 | C      | D       | 09:00   | Bus B     | Norte Largo | Empresa 2  | 150         |

- Soportado: CSV, XLSX (próximamente)
- El botón de carga masiva está preparado en el módulo de Recorridos.

## Integración frontend-backend

- Los módulos están preparados para consumir endpoints REST del backend.
- Para conectar, implementa los hooks de integración (`useRecorridosApi`, etc.) y apunta a la URL del backend en `.env`.
- El backend expone endpoints REST para recorridos, producción, validación, pagos y reportes.

## Mockups y diagramas

- `/mockups`: Pantallas principales y flujos de usuario (puedes agregar imágenes o enlaces a Figma).
- `/docs`: Diagramas de arquitectura, ERD, y flujos de proceso.

## Notas finales

- El sistema es modular, escalable y documentado.
- Espacios y comentarios en el código para futuras integraciones (carga masiva, alertas automáticas, etc.).
- Para dudas o mejoras, revisa los comentarios en el código y la documentación técnica. 
=======
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
>>>>>>> e8d2b232f2da235d552e9903e567eb6f52903c4f
