# Diagrama Entidad-Relación (ERD) - Pullman Payment System (actualizado desde PostgreSQL)

## Entidades principales

- **users**
  - id (PK)
  - nombre
  - email
  - password
  - rol
  - activo (boolean)
  - rut
  - telefono
  - eliminado (boolean)
  - can_view_liquidacion (boolean)
  - can_view_produccion (boolean)
  - can_view_recorridos (boolean)
  - can_view_reportes (boolean)
  - can_view_trips (boolean)
  - can_view_usuarios (boolean)
  - can_view_validacion (boolean)

- **zones**
  - id (PK)
  - nombre
  - porcentaje (double precision)

- **entrepreneurs**
  - id (PK)
  - nombre
  - rut
  - zona_id (FK -> zones.id)

- **routes**
  - id (PK)
  - fecha (date)
  - origen
  - destino
  - horario
  - tipologia
  - zona_id (FK -> zones.id)
  - entrepreneur_id (FK -> entrepreneurs.id)
  - kilometraje (double precision)
  - creado_por (FK -> users.id)
  - editable (boolean)

- **productions**
  - id (PK)
  - decena (character varying)
  - entrepreneur_id (FK -> entrepreneurs.id)
  - total (double precision)
  - ganancia (double precision)
  - validado (boolean)
  - validado_por (FK -> users.id)
  - comentarios
  - fecha_validacion (date)

- **liquidations**
  - id (PK)
  - production_id (FK -> productions.id)
  - monto (double precision)
  - fecha (date)
  - estado
  - generado_por (FK -> users.id)
  - comprobante_pago (oid)
  - fecha_aprobacion (date)
  - fecha_pago (date)

- **payments**
  - id (PK)
  - liquidation_id (FK -> liquidations.id)
  - monto (double precision)
  - medio
  - fecha (date)
  - comprobante
  - registrado_por (FK -> users.id)

- **audit_logs**
  - id (PK)
  - user_id (FK -> users.id)
  - accion
  - entidad
  - entidad_id
  - fecha (timestamp)
  - detalle

- **notificacion**
  - id (PK)
  - mensaje
  - tipo
  - fecha (timestamp)
  - referencia_id
  - rol_destino
  - leida (boolean)
  - eliminada (boolean)

- **privileges**
  - id (PK)
  - name
  - description
  - category
  - action
  - enabled (boolean)

- **role_privileges**
  - id (PK)
  - role
  - privilege_id (FK -> privileges.id)
  - granted (boolean)

- **trips**
  - id (PK)
  - origin
  - destination
  - company_name
  - company_rut
  - travel_date (date)
  - branch_revenue (numeric)
  - road_revenue (numeric)
  - manual_income (character varying)
  - ...otros campos de control y operación

## Relaciones
- Un **users** puede crear muchos **routes**, validar **productions**, generar **liquidations** y registrar **payments**.
- Un **zones** tiene muchos **entrepreneurs** y **routes**.
- Un **entrepreneurs** tiene muchos **routes** y **productions**.
- Un **routes** pertenece a un **entrepreneurs** y una **zones**.
- Un **productions** pertenece a un **entrepreneurs** y puede ser validado por un **users**.
- Un **liquidations** pertenece a un **productions** y puede ser generado por un **users**.
- Un **payments** pertenece a una **liquidations** y puede ser registrado por un **users**.
- **audit_logs** registra acciones de usuarios sobre cualquier entidad.
- **role_privileges** vincula roles con privilegios.
- **notificacion** permite mensajes y alertas a roles/usuarios.

---

> El diagrama visual (ERD) se encuentra en `/docs/ERD.png` (a generar en Figma/Lucidchart).