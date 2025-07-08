# Backend - Pullman Payment System

Este backend está desarrollado en **Java Spring Boot** y expone una API RESTful para la gestión de recorridos, liquidaciones, pagos y usuarios.

## Estructura principal

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/pullman/    # Código fuente (controladores, servicios, entidades, repositorios, seguridad)
│   │   └── resources/           # Configuración, plantillas de reportes, etc.
│   └── test/                    # Tests unitarios y de integración
├── pom.xml                      # Dependencias Maven
└── README.md
```

## Tecnologías
- Java 17+
- Spring Boot
- Spring Security (JWT, roles)
- Spring Data JPA (Hibernate)
- PostgreSQL
- JasperReports (PDF)
- Apache POI (Excel)

## Comandos básicos

- **Compilar:**
  ```
  mvn clean install
  ```
- **Ejecutar en desarrollo:**
  ```
  mvn spring-boot:run
  ```
- **Variables de entorno:**
  Configura tu conexión a base de datos y JWT en `src/main/resources/application.properties`.

## Endpoints principales
- `/auth` - Autenticación y registro
- `/users` - Gestión de usuarios y roles
- `/routes` - Gestión de recorridos
- `/productions` - Consolidación y cálculo de producción
- `/validations` - Validación decenal
- `/liquidations` - Liquidaciones y pagos
- `/reports` - Reportes exportables

---

Para más detalles, revisa la documentación en `/docs`. 