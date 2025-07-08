# Documentación de Endpoints Backend

## Autenticación

- `POST /api/auth/login`
  - Body: `{ "email": "admin@demo.com", "password": "Admin123" }`
  - Response: `{ "token": "...", "user": { ... } }`

## Recorridos

- `GET /api/routes`
  - Listar recorridos.
- `POST /api/routes`
  - Crear uno o varios recorridos.
  - Body: `[ { ...recorrido }, ... ]`
- `GET /api/routes/{id}`
  - Obtener recorrido por ID.
- `PUT /api/routes/{id}`
  - Actualizar recorrido.
- `DELETE /api/routes/{id}`
  - Eliminar recorrido.

## Producción

- `GET /api/productions`
  - Listar producciones.
- `POST /api/productions`
  - Crear producción.
- `PUT /api/productions/{id}`
  - Actualizar producción.

## Validación Operacional

- `GET /api/validations`
  - Listar producciones pendientes de validación.
- `POST /api/validations/{id}/validate`
  - Aprobar/rechazar producción.
  - Body: `{ "aprobado": true, "comentarios": "..." }`

## Liquidación y Pagos

- `GET /api/liquidations`
  - Listar liquidaciones.
- `POST /api/liquidations`
  - Crear liquidación.
- `POST /api/liquidations/{id}/pay`
  - Registrar pago.
  - Body: `{ "fechaPago": "2024-07-15", "medioPago": "Transferencia", "comprobante": "comprobante.pdf" }`

## Reportes

- `GET /api/reports`
  - Listar reportes filtrados (query params: decena, zona, empresario).
- `GET /api/reports/export/pdf`
  - Exportar reporte a PDF (query params).
- `GET /api/reports/export/excel`
  - Exportar reporte a Excel (query params).

## Usuarios y Zonas

- `GET /api/users`, `POST /api/users`, `PUT /api/users/{id}`, `DELETE /api/users/{id}`
- `GET /api/zones`, `POST /api/zones`, `PUT /api/zones/{id}`, `DELETE /api/zones/{id}`

---

> Todos los endpoints requieren autenticación JWT (excepto login). Incluye el token en el header `Authorization: Bearer <token>`.

> Para detalles de los modelos, revisa las interfaces en los hooks de integración del frontend. 