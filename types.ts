
export type UserRole = 'ADMIN' | 'VENDEDOR';
export type MovementType = 'INGRESO' | 'SALIDA' | 'AJUSTE';
export type SaleStatus = 'PAGADA' | 'ANULADA';
export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'YAPE' | 'PLIN';

export interface Usuario {
  id_usuario: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  password?: string;
}

export interface Cliente {
  id_cliente: string;
  nombre: string;
  documento: string;
  telefono: string;
  email: string;
  fecha_registro: string;
  activo: boolean;
}

export interface Categoria {
  id_categoria: string;
  nombre: string;
  descripcion: string;
}

export interface Producto {
  id_producto: string;
  nombre: string;
  codigo_barra: string;
  id_categoria: string;
  precio_venta: number;
  costo: number;
  activo: boolean;
}

export interface ProductoVariante {
  id_variante: string;
  id_producto: string;
  talla: string;
  color: string;
  sku: string;
  activo: boolean;
}

export interface MovimientoStock {
  id_movimiento: string;
  id_variante: string;
  tipo_movimiento: MovementType;
  cantidad: number;
  motivo: string;
  fecha_movimiento: string;
}

export interface Venta {
  id_venta: string;
  id_cliente: string;
  fecha_venta: string;
  total: number;
  metodo_pago: PaymentMethod;
  estado: SaleStatus;
  ticket_numero: string;
}

export interface VentaDetalle {
  id_detalle: string;
  id_venta: string;
  id_variante: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// Helper interface for calculations
export interface CartItem extends Producto {
  id_variante: string;
  talla: string;
  color: string;
  sku: string;
  cantidad: number;
  stock_disponible: number;
}
