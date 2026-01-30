
import { 
  Usuario, Cliente, Categoria, Producto, 
  ProductoVariante, MovimientoStock, Venta, VentaDetalle 
} from './types';

const STORAGE_KEY = 'beautycloth_db_v1';

interface DBState {
  usuarios: Usuario[];
  clientes: Cliente[];
  categorias: Categoria[];
  productos: Producto[];
  variantes: ProductoVariante[];
  movimientos: MovimientoStock[];
  ventas: Venta[];
  detallesVenta: VentaDetalle[];
}

const gid = () => Math.random().toString(36).substr(2, 9);

const CATEGORIES: Categoria[] = [
  { id_categoria: 'cat1', nombre: 'Blusas', descripcion: 'Blusas y tops' },
  { id_categoria: 'cat2', nombre: 'Pantalones', descripcion: 'Jeans y leggings' },
  { id_categoria: 'cat3', nombre: 'Vestidos', descripcion: 'Vestidos de gala y diario' },
  { id_categoria: 'cat4', nombre: 'Casacas', descripcion: 'Abrigos y blazers' },
  { id_categoria: 'cat5', nombre: 'Accesorios', descripcion: 'Bolsos y joyería' },
];

const RAW_PRODUCTS = [
  { n: 'Blusa Seda Rosa', c: 'cat1', p: 45, co: 20 },
  { n: 'Top Encaje Blanco', c: 'cat1', p: 35, co: 15 },
  { n: 'Camisa Lino Azul', c: 'cat1', p: 55, co: 25 },
  { n: 'Blusa Estampada Flores', c: 'cat1', p: 42, co: 18 },
  { n: 'Jean Slim Fit Azul', c: 'cat2', p: 60, co: 30 },
  { n: 'Legging Deportivo Negro', c: 'cat2', p: 30, co: 12 },
  { n: 'Pantalón Palazo Beige', c: 'cat2', p: 65, co: 32 },
  { n: 'Short Denim Vintage', c: 'cat2', p: 40, co: 18 },
  { n: 'Vestido Midi Floral', c: 'cat3', p: 85, co: 40 },
  { n: 'Vestido Noche Negro', c: 'cat3', p: 120, co: 55 },
  { n: 'Vestido Verano Blanco', c: 'cat3', p: 75, co: 35 },
  { n: 'Vestido Cocktail Rojo', c: 'cat3', p: 110, co: 50 },
  { n: 'Casaca Cuero Sintético', c: 'cat4', p: 95, co: 45 },
  { n: 'Blazer Ejecutivo Gris', c: 'cat4', p: 80, co: 38 },
  { n: 'Abrigo Lana Camel', c: 'cat4', p: 150, co: 70 },
  { n: 'Bomber Jacket Rosa', c: 'cat4', p: 70, co: 32 },
  { n: 'Bolso Cuero Marrón', c: 'cat5', p: 55, co: 25 },
  { n: 'Cinturón Hebilla Oro', c: 'cat5', p: 25, co: 10 },
  { n: 'Pañuelo Seda Multicolor', c: 'cat5', p: 18, co: 7 },
  { n: 'Cartera de Mano Negra', c: 'cat5', p: 45, co: 20 },
  { n: 'Blusa Volantes Amarilla', c: 'cat1', p: 48, co: 22 },
  { n: 'Jean Mom Fit Celeste', c: 'cat2', p: 62, co: 31 },
  { n: 'Vestido Boho Chic', c: 'cat3', p: 90, co: 42 },
  { n: 'Trench Coat Clásico', c: 'cat4', p: 130, co: 60 },
  { n: 'Gafas de Sol Cat Eye', c: 'cat5', p: 35, co: 15 },
  { n: 'Top Crop Negro', c: 'cat1', p: 28, co: 12 },
  { n: 'Pantalón Cuero Negro', c: 'cat2', p: 85, co: 42 },
  { n: 'Mini Falda Plisada', c: 'cat2', p: 38, co: 18 },
  { n: 'Vestido Satinado Azul', c: 'cat3', p: 105, co: 48 },
  { n: 'Chaqueta Denim Oversize', c: 'cat4', p: 75, co: 35 },
  { n: 'Blusa Campesina Blanca', c: 'cat1', p: 38, co: 16 },
  { n: 'Top Satinado Perla', c: 'cat1', p: 45, co: 20 },
  { n: 'Body Encaje Rojo', c: 'cat1', p: 52, co: 24 },
  { n: 'Jean Flare Denim', c: 'cat2', p: 68, co: 32 },
  { n: 'Pantalon Cargo Beige', c: 'cat2', p: 55, co: 25 },
  { n: 'Leggings Cuero', c: 'cat2', p: 42, co: 18 },
  { n: 'Vestido Mini Lentejuelas', c: 'cat3', p: 135, co: 60 },
  { n: 'Maxi Vestido Verano', c: 'cat3', p: 88, co: 38 },
  { n: 'Vestido Tubo Clasico', c: 'cat3', p: 72, co: 30 },
  { n: 'Blazer Cuadros Brit', c: 'cat4', p: 98, co: 45 },
  { n: 'Casaca Acolchada Negra', c: 'cat4', p: 115, co: 52 },
  { n: 'Chaleco Piel Sintetica', c: 'cat4', p: 65, co: 28 },
  { n: 'Cartera Sobre Dorada', c: 'cat5', p: 32, co: 14 },
  { n: 'Collar Perlas Modern', c: 'cat5', p: 28, co: 12 },
  { n: 'Sombrero Playa XL', c: 'cat5', p: 45, co: 18 },
  { n: 'Top Rayas Marinero', c: 'cat1', p: 32, co: 14 },
  { n: 'Jean Skinny Gris', c: 'cat2', p: 58, co: 26 },
  { n: 'Vestido Punto Gris', c: 'cat3', p: 65, co: 28 },
  { n: 'Casaca Gamuza Marron', c: 'cat4', p: 140, co: 65 },
  { n: 'Bolso Tote Canvas', c: 'cat5', p: 38, co: 15 }
];

const INITIAL_DATA: DBState = (() => {
  const productos: Producto[] = RAW_PRODUCTS.map((p, i) => ({
    id_producto: `prod${i + 1}`,
    nombre: p.n,
    codigo_barra: (1000 + i).toString(),
    id_categoria: p.c,
    precio_venta: p.p,
    costo: p.co,
    activo: true,
  }));

  const variantes: ProductoVariante[] = [];
  const movimientos: MovimientoStock[] = [];

  productos.forEach(p => {
    const tallas = p.id_categoria === 'cat5' ? ['Única'] : ['S', 'M', 'L'];
    tallas.forEach(t => {
      const vid = `var_${p.id_producto}_${t}`;
      variantes.push({
        id_variante: vid,
        id_producto: p.id_producto,
        talla: t,
        color: 'Multicolor',
        sku: `${p.codigo_barra}-${t}`,
        activo: true
      });
      movimientos.push({
        id_movimiento: gid(),
        id_variante: vid,
        tipo_movimiento: 'INGRESO',
        cantidad: 30,
        motivo: 'Carga inicial',
        fecha_movimiento: new Date(Date.now() - 86400000 * 10).toISOString()
      });
    });
  });

  const ventas: Venta[] = [];
  const detallesVenta: VentaDetalle[] = [];

  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 10);
    const date = new Date(Date.now() - 86400000 * daysAgo);
    const idVenta = gid();
    ventas.push({
      id_venta: idVenta,
      id_cliente: '0',
      fecha_venta: date.toISOString(),
      total: 0, 
      metodo_pago: i % 2 === 0 ? 'YAPE' : 'EFECTIVO',
      estado: 'PAGADA',
      ticket_numero: `H-${1000 + i}`
    });

    let currentTotal = 0;
    const itemsCount = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < itemsCount; j++) {
      const vIdx = Math.floor(Math.random() * variantes.length);
      const variant = variantes[vIdx];
      const product = productos.find(pr => pr.id_producto === variant.id_producto)!;
      detallesVenta.push({
        id_detalle: gid(),
        id_venta: idVenta,
        id_variante: variant.id_variante,
        cantidad: 1,
        precio_unitario: product.precio_venta,
        subtotal: product.precio_venta
      });
      currentTotal += product.precio_venta;
      movimientos.push({
        id_movimiento: gid(),
        id_variante: variant.id_variante,
        tipo_movimiento: 'SALIDA',
        cantidad: 1,
        motivo: `Venta #${1000 + i}`,
        fecha_movimiento: date.toISOString()
      });
    }
    ventas[i].total = currentTotal;
  }

  return {
    usuarios: [
      { id_usuario: '1', nombre: 'Admin Beauty', email: 'admin', rol: 'ADMIN', activo: true, password: '123456' }
    ],
    clientes: [
      { id_cliente: '0', nombre: 'Consumidor Final', documento: '00000000', telefono: '', email: '', fecha_registro: new Date().toISOString(), activo: true },
      { id_cliente: '1', nombre: 'Maria Garcia', documento: '45678912', telefono: '987654321', email: 'maria@test.com', fecha_registro: new Date().toISOString(), activo: true }
    ],
    categorias: CATEGORIES,
    productos,
    variantes,
    movimientos,
    ventas,
    detallesVenta
  };
})();

class LocalDB {
  private state: DBState;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    this.state = saved ? JSON.parse(saved) : INITIAL_DATA;
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  login(email: string, pass: string): Usuario | null {
    const user = this.state.usuarios.find(u => u.email === email && u.password === pass && u.activo);
    return user || null;
  }

  getUsuarios() { return this.state.usuarios; }
  getClientes() { return this.state.clientes; }
  getCategorias() { return this.state.categorias; }
  getProductos() { return this.state.productos; }
  getVariantes(idProducto?: string) { 
    return idProducto ? this.state.variantes.filter(v => v.id_producto === idProducto) : this.state.variantes; 
  }
  getVentas() { return this.state.ventas; }
  getDetallesVenta(idVenta: string) { return this.state.detallesVenta.filter(d => d.id_venta === idVenta); }

  getStock(idVariante: string): number {
    return this.state.movimientos
      .filter(m => m.id_variante === idVariante)
      .reduce((acc, m) => {
        if (m.tipo_movimiento === 'INGRESO' || m.tipo_movimiento === 'AJUSTE') return acc + m.cantidad;
        if (m.tipo_movimiento === 'SALIDA') return acc - m.cantidad;
        return acc;
      }, 0);
  }

  addMovement(mov: Omit<MovimientoStock, 'id_movimiento'>) {
    const newMov: MovimientoStock = { ...mov, id_movimiento: gid() };
    this.state.movimientos.push(newMov);
    this.save();
  }

  createVenta(venta: Omit<Venta, 'id_venta'>, detalles: Omit<VentaDetalle, 'id_detalle' | 'id_venta'>[]) {
    const id_venta = gid();
    const newVenta: Venta = { ...venta, id_venta };
    
    for (const det of detalles) {
      const currentStock = this.getStock(det.id_variante);
      if (currentStock < det.cantidad) {
        throw new Error(`Stock insuficiente para la variante ID: ${det.id_variante}`);
      }
    }

    this.state.ventas.push(newVenta);

    detalles.forEach(det => {
      const id_detalle = gid();
      this.state.detallesVenta.push({ ...det, id_detalle, id_venta });
      
      this.addMovement({
        id_variante: det.id_variante,
        tipo_movimiento: 'SALIDA',
        cantidad: det.cantidad,
        motivo: `Venta #${newVenta.ticket_numero}`,
        fecha_movimiento: new Date().toISOString()
      });
    });

    this.save();
    return newVenta;
  }

  addCliente(cliente: Omit<Cliente, 'id_cliente' | 'fecha_registro' | 'activo'>) {
    const newCliente: Cliente = {
      ...cliente,
      id_cliente: gid(),
      fecha_registro: new Date().toISOString(),
      activo: true
    };
    this.state.clientes.push(newCliente);
    this.save();
    return newCliente;
  }
}

export const db = new LocalDB();
