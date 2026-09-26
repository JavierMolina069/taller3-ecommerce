# Arquitectura y modelo de datos

## Arquitectura hexagonal

```mermaid
flowchart LR
  Browser[React + Vite SPA] -->|HTTP JSON| Express[Adaptador HTTP / Express]
  Express --> Controllers[Controladores REST]
  Controllers --> UseCases[Casos de uso]
  UseCases --> Domain[Dominio: Usuario, Producto, Pedido]
  UseCases --> Ports[Puertos: repositorios y servicios]
  Ports -. implementados por .-> Repos[Adaptadores PostgreSQL]
  Ports -. implementados por .-> Hash[BcryptPasswordHasher]
  Repos --> DB[(PostgreSQL)]
  Hash --> UseCases
```

El dominio contiene reglas de negocio y no depende de Express ni de PostgreSQL. Los casos de uso coordinan operaciones a través de puertos. Los adaptadores HTTP y PostgreSQL implementan los límites externos. El cliente React consume la API mediante servicios separados.

## Modelo relacional

```mermaid
flowchart LR
  U["USUARIOS<br/>PK id<br/>email UNIQUE<br/>password_hash<br/>rol, activo"]
  C["CATEGORIAS<br/>PK id<br/>nombre UNIQUE<br/>descripcion"]
  P["PRODUCTOS<br/>PK id<br/>FK categoria_id<br/>nombre, SKU, slug<br/>precio, stock"]
  O["PEDIDOS<br/>PK id<br/>FK usuario_id<br/>estado, subtotal, total<br/>metodo_pago"]
  D["DETALLE_PEDIDO<br/>PK id<br/>FK pedido_id<br/>FK producto_id<br/>cantidad, precio_unitario"]

  U -->|"1 a muchos"| O
  C -->|"1 a muchos"| P
  O -->|"1 a muchos"| D
  P -->|"1 a muchos"| D
```

`DETALLE_PEDIDO` es la entidad asociativa que representa la relación muchos a muchos entre pedidos y productos, conserva precio/nombre de compra y permite descontar o restaurar inventario transaccionalmente. Un usuario tiene muchos pedidos; una categoría clasifica muchos productos.