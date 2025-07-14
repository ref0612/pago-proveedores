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

---

## Recursos adicionales

- [Documentación oficial de Create React App (en inglés)](https://facebook.github.io/create-react-app/docs/getting-started)