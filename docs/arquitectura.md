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
erDiagram
  USUARIOS ||--o{ PEDIDOS : realiza
  CATEGORIAS ||--o{ PRODUCTOS : clasifica
  PEDIDOS ||--|{ DETALLE_PEDIDO : contiene
  PRODUCTOS ||--o{ DETALLE_PEDIDO : aparece_en
  USUARIOS {
    bigint id PK
    varchar nombre
    varchar email UK
    text password_hash
    varchar rol
    boolean activo
  }
  CATEGORIAS {
    bigint id PK
    varchar nombre UK
    text descripcion
    boolean activo
  }
  PRODUCTOS {
    bigint id PK
    bigint categoria_id FK
    varchar nombre
    varchar sku UK
    numeric precio
    integer stock
    boolean activo
  }
  PEDIDOS {
    bigint id PK
    bigint usuario_id FK
    varchar estado
    numeric subtotal
    numeric total
    varchar metodo_pago
    text motivo_cancelacion
  }
  DETALLE_PEDIDO {
    bigint id PK
    bigint pedido_id FK
    bigint producto_id FK
    integer cantidad
    numeric precio_unitario
  }
```

`DETALLE_PEDIDO` es la entidad asociativa que representa la relación muchos a muchos entre pedidos y productos, conserva precio/nombre de compra y permite descontar o restaurar inventario transaccionalmente. Un usuario tiene muchos pedidos; una categoría clasifica muchos productos.