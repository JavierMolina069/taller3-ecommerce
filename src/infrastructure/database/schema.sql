CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL CHECK (char_length(trim(nombre)) >= 2),
    email VARCHAR(254) NOT NULL,
    password_hash TEXT NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente'
        CHECK (rol IN ('cliente', 'administrador')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_email_lower
    ON usuarios (lower(email));

CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_categorias_nombre_lower
    ON categorias (lower(nombre));

CREATE TABLE IF NOT EXISTS productos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    categoria_id BIGINT NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    nombre VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    sku VARCHAR(80) NOT NULL UNIQUE,
    descripcion TEXT,
    precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_productos_categoria_activo
    ON productos (categoria_id, activo);

CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN (
            'pendiente', 'pagado', 'preparando',
            'enviado', 'entregado', 'cancelado'
        )),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    costo_envio NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (costo_envio >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total = subtotal + costo_envio),
    moneda CHAR(3) NOT NULL DEFAULT 'MXN',
    direccion_envio VARCHAR(250) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20) NOT NULL,
    pais VARCHAR(80) NOT NULL DEFAULT 'México',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_pedidos_usuario_fecha
    ON pedidos (usuario_id, created_at DESC);

CREATE TABLE IF NOT EXISTS detalle_pedido (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    nombre_producto VARCHAR(160) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0),
    total_linea NUMERIC(14, 2)
        GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    UNIQUE (pedido_id, producto_id)
);

CREATE INDEX IF NOT EXISTS ix_detalle_pedido_producto
    ON detalle_pedido (producto_id);

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(30) NOT NULL DEFAULT 'contra_entrega'
  CHECK (metodo_pago IN ('tarjeta_demo', 'transferencia', 'contra_entrega'));

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT;
