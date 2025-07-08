# Arquitectura del Sistema - Pullman Payment System

## Diagrama de Arquitectura (descriptivo)

```
+-------------------+         REST API         +-------------------+         +-------------------+
|                   | <---------------------> |                   | <-----> |                   |
|    Frontend       |                         |     Backend        |         |   Base de Datos   |
|  (React + Tailwind|                         | (Java Spring Boot) |         |   (PostgreSQL)    |
|        CSS)       |                         |                   |         |                   |
+-------------------+                         +-------------------+         +-------------------+
        |                                                                                 
        | (futuro)                                                                       
        v                                                                                 
+-------------------+                                                                   
|                   |                                                                   
| Sistema de Venta  |                                                                   
|   (Integración)   |                                                                   
+-------------------+                                                                   
```

- El **frontend** consume la API REST del backend para todos los módulos (recorridos, producción, validación, pagos, reportes, usuarios).
- El **backend** gestiona la lógica de negocio, seguridad, validaciones y persistencia en la base de datos.
- La **base de datos** almacena usuarios, recorridos, producciones, validaciones, liquidaciones, pagos, logs, etc.
- La **integración con el sistema de venta** se realizará en el futuro mediante endpoints o carga masiva de archivos.

## Flujo General del Sistema

1. **Login:** El usuario se autentica y obtiene un token JWT.
2. **Registro de Recorridos:** Carga manual (y futura carga masiva) de recorridos por empresario y zona.
3. **Cálculo de Producción:** Consolidación automática por decena y empresario, aplicación de porcentajes por zona.
4. **Validación Operacional:** Revisión y aprobación decenal, registro de decisiones y comentarios, bloqueo de edición tras validación.
5. **Liquidación y Pagos:** Registro de pagos, asociación automática, alertas de vencimiento.
6. **Reportes:** Generación y exportación de reportes filtrados y rankings.
7. **Gestión de usuarios y zonas:** Solo para administradores.

## Notas
- El sistema es modular y escalable.
- Todos los módulos están preparados para integración real con backend y futuras extensiones.
- La seguridad se gestiona mediante JWT y control de roles. 