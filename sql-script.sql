
-- Script de Base de Datos para ChicPOS
-- Compatible con PostgreSQL / MySQL

CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) CHECK (rol IN ('ADMIN', 'VENDEDOR')),
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE clientes (
  id_cliente SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  documento VARCHAR(20) UNIQUE,
  telefono VARCHAR(20),
  email VARCHAR(100),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE categorias (
  id_categoria SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT
);

CREATE TABLE productos (
  id_producto SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo_barra VARCHAR(50) UNIQUE,
  id_categoria INT REFERENCES categorias(id_categoria),
  precio_venta DECIMAL(10, 2) NOT NULL,
  costo DECIMAL(10, 2) NOT NULL,
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE producto_variantes (
  id_variante SERIAL PRIMARY KEY,
  id_producto INT REFERENCES productos(id_producto) ON DELETE CASCADE,
  talla VARCHAR(10),
  color VARCHAR(30),
  sku VARCHAR(50) UNIQUE,
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE movimientos_stock (
  id_movimiento SERIAL PRIMARY KEY,
  id_variante INT REFERENCES producto_variantes(id_variante),
  tipo_movimiento VARCHAR(20) CHECK (tipo_movimiento IN ('INGRESO', 'SALIDA', 'AJUSTE')),
  cantidad INT NOT NULL,
  motivo TEXT,
  fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ventas (
  id_venta SERIAL PRIMARY KEY,
  id_cliente INT REFERENCES clientes(id_cliente),
  fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(20) CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
  estado VARCHAR(20) DEFAULT 'PAGADA' CHECK (estado IN ('PAGADA', 'ANULADA')),
  ticket_numero VARCHAR(50) UNIQUE
);

CREATE TABLE venta_detalle (
  id_detalle SERIAL PRIMARY KEY,
  id_venta INT REFERENCES ventas(id_venta) ON DELETE CASCADE,
  id_variante INT REFERENCES producto_variantes(id_variante),
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL
);

-- Indices para optimizar busquedas comunes
CREATE INDEX idx_producto_categoria ON productos(id_categoria);
CREATE INDEX idx_variante_producto ON producto_variantes(id_producto);
CREATE INDEX idx_movimiento_variante ON movimientos_stock(id_variante);
CREATE INDEX idx_venta_fecha ON ventas(fecha_venta);
