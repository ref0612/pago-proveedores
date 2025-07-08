# Diagrama Entidad-Relación (ERD) - Pullman Payment System

## Entidades principales

- **User**
  - id (PK)
  - nombre
  - email
  - password
  - rol (ADMIN, VALIDADOR, MIEMBRO, INVITADO)
  - activo

- **Zone**
  - id (PK)
  - nombre
  - porcentaje

- **Entrepreneur**
  - id (PK)
  - nombre
  - rut
  - zona_id (FK -> Zone)

- **Route**
  - id (PK)
  - fecha
  - origen
  - destino
  - horario
  - tipologia
  - zona_id (FK -> Zone)
  - entrepreneur_id (FK -> Entrepreneur)
  - kilometraje (opcional)
  - creado_por (FK -> User)
  - editable (boolean)

- **Production**
  - id (PK)
  - decena (periodo)
  - entrepreneur_id (FK -> Entrepreneur)
  - total
  - validado (boolean)
  - validado_por (FK -> User)
  - comentarios
  - fecha_validacion

- **Liquidation**
  - id (PK)
  - production_id (FK -> Production)
  - monto
  - fecha
  - estado
  - generado_por (FK -> User)

- **Payment**
  - id (PK)
  - liquidation_id (FK -> Liquidation)
  - monto
  - medio
  - fecha
  - comprobante
  - registrado_por (FK -> User)

- **AuditLog**
  - id (PK)
  - user_id (FK -> User)
  - accion
  - entidad
  - entidad_id
  - fecha
  - detalle

## Relaciones
- Un **User** puede crear muchos **Route**, validar **Production**, generar **Liquidation** y registrar **Payment**.
- Un **Zone** tiene muchos **Entrepreneur** y **Route**.
- Un **Entrepreneur** tiene muchos **Route** y **Production**.
- Un **Route** pertenece a un **Entrepreneur** y una **Zone**.
- Un **Production** pertenece a un **Entrepreneur** y puede ser validado por un **User**.
- Un **Liquidation** pertenece a un **Production** y puede ser generado por un **User**.
- Un **Payment** pertenece a una **Liquidation** y puede ser registrado por un **User**.
- **AuditLog** registra acciones de usuarios sobre cualquier entidad.

---

> El diagrama visual (ERD) se encuentra en `/docs/ERD.png` (a generar en Figma/Lucidchart). 