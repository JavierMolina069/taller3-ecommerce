# Especificación de endpoints

Base local: `http://localhost:3000`. Los endpoints JSON usan `Content-Type: application/json`. Las rutas marcadas **JWT** requieren `Authorization: Bearer <token>`; **Admin** requiere además rol `administrador`.

## Autenticación

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| POST | `/auth/register` | Público | Registrar cliente; contraseña almacenada con bcrypt. |
| POST | `/auth/login` | Público | Iniciar sesión y recibir token JWT. |

## Usuarios

El router está montado en `/usuarios`; todas las rutas requieren JWT y rol Admin.

| Método | Ruta | Uso |
|---|---|---|
| POST | `/usuarios` | Crear usuario. |
| GET | `/usuarios` | Listar usuarios. |
| PUT | `/usuarios/:id` | Actualizar usuario. |
| DELETE | `/usuarios/:id` | Eliminar usuario. |

## Categorías

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| GET | `/categorias` | Público | Listar categorías. |
| POST | `/categorias` | Admin | Crear categoría. |
| PUT | `/categorias/:id` | Admin | Actualizar categoría. |
| DELETE | `/categorias/:id` | Admin | Eliminar categoría si las reglas de integridad lo permiten. |

## Productos

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| GET | `/productos` | Público | Listar catálogo. |
| GET | `/productos/:id` | Público | Consultar un producto. |
| POST | `/productos` | Admin | Crear producto. |
| PUT | `/productos/:id` | Admin | Actualizar producto e inventario. |
| DELETE | `/productos/:id` | Admin | Eliminar producto si las reglas de integridad lo permiten. |

## Pedidos

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| POST | `/pedidos` | JWT | Crear pedido con artículos, dirección y método de pago. Valida stock y calcula el total en el servidor. |
| GET | `/pedidos/mios` | JWT | Consultar pedidos propios. |
| GET | `/pedidos` | Admin | Listar pedidos de la tienda. |
| GET | `/pedidos/:id` | JWT | Consultar pedido propio o cualquiera como Admin. |
| PUT | `/pedidos/:id/estado` | Admin | Avanzar el estado permitido del pedido. |
| DELETE | `/pedidos/:id` | JWT | Cancelar pedido pendiente; requiere `motivo_cancelacion` de 5 a 500 caracteres y restaura inventario. |

### Ejemplos de cuerpos

Registro: `{"nombre":"Cliente","email":"cliente@example.com","password":"una-clave-segura"}`

Pedido: `{"items":[{"producto_id":1,"cantidad":2}],"direccion_envio":"Calle 1","ciudad":"Ciudad","codigo_postal":"00000","pais":"México","metodo_pago":"contra_entrega"}`

Cancelación: `{"motivo_cancelacion":"Necesito corregir la dirección de entrega"}`

Métodos disponibles: `contra_entrega`, `transferencia`, `tarjeta_demo`. La opción de tarjeta es exclusivamente de demostración.

## Reportes analíticos

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| GET | `/reportes` | JWT + Admin | Consultar resumen de ventas, ingresos agrupados, distribución de estados y productos más vendidos. |

Parámetros opcionales de consulta:

| Parámetro | Valores | Predeterminado | Descripción |
|---|---|---|---|
| `desde` | Fecha `YYYY-MM-DD` | Hace 6 días | Inicio inclusivo del rango. |
| `hasta` | Fecha `YYYY-MM-DD` | Hoy | Fin inclusivo del rango. |
| `granularidad` | `day`, `week`, `month` | `day` | Agrupación de la tendencia de ingresos. |
| `limite` | `5`, `10` | `5` | Número de productos del ranking. |

Ejemplo: `GET /reportes?desde=2026-09-01&hasta=2026-09-30&granularidad=week&limite=10`

Respuesta resumida:

```json
{
  "filtros": { "desde": "2026-09-01", "hasta": "2026-09-30", "granularidad": "week", "limite": 10 },
  "resumen": {
    "ingresos_totales": "12500.00",
    "pedidos_validos": 18,
    "clientes_con_compra": 12,
    "ticket_promedio_pedido": "694.44",
    "gasto_promedio_por_usuario": "1041.67"
  },
  "ingresos_por_periodo": [{ "periodo": "2026-09-01T00:00:00.000Z", "ingresos": "4200.00", "pedidos": 6 }],
  "estados_pedido": [{ "estado": "pendiente", "cantidad": 2, "porcentaje": "11.11" }],
  "productos_mas_vendidos": [{ "producto_id": 1, "nombre": "Producto", "unidades_vendidas": 8, "ingresos": "2400.00" }]
}
```

Los pedidos cancelados no suman a ingresos, ticket promedio ni ranking de ventas. Sí aparecen en el gráfico de estados. El gasto promedio por usuario se calcula entre clientes con al menos un pedido no cancelado en el rango. Las fechas inválidas, el rango invertido, una granularidad distinta y un límite distinto de 5 o 10 responden `400`. Sin sesión responde `401`; sin rol administrador responde `403`.
