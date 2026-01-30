
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db';
import { Producto, ProductoVariante, Cliente, CartItem, PaymentMethod } from '../types';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'EFECTIVO', label: 'Efectivo', icon: '💵' },
  { id: 'YAPE', label: 'Yape', icon: 'https://iili.io/fsmGiQf.png' },
  { id: 'PLIN', label: 'Plin', icon: 'https://iili.io/fsmGZ42.png' },
  { id: 'TARJETA', label: 'Tarjeta', icon: 'https://iili.io/fsmGLB4.png' },
  { id: 'TRANSFERENCIA', label: 'Transferencia', icon: 'https://iili.io/fsmGQEl.png' },
];

const POS: React.FC = () => {
  const [products, setProducts] = useState<Producto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [client, setClient] = useState<Cliente>(db.getClientes()[0]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ nombre: '', telefono: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [lastTicket, setLastTicket] = useState<any>(null);

  useEffect(() => {
    setProducts(db.getProductos());
  }, []);

  // Helper to get remaining stock (DB stock - current cart quantity)
  const getAvailableStock = (idVariante: string) => {
    const initialStock = db.getStock(idVariante);
    const inCart = cart.find(item => item.id_variante === idVariante)?.cantidad || 0;
    return initialStock - inCart;
  };

  const addToCart = (product: Producto, variant: ProductoVariante) => {
    const available = getAvailableStock(variant.id_variante);
    if (available <= 0) {
      alert('Sin stock disponible para esta variante.');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id_variante === variant.id_variante);
      if (existing) {
        return prev.map(item => item.id_variante === variant.id_variante ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { 
        ...product, 
        id_variante: variant.id_variante, 
        talla: variant.talla, 
        color: variant.color, 
        sku: variant.sku,
        cantidad: 1,
        stock_disponible: db.getStock(variant.id_variante) // We store the DB value as reference
      }];
    });
    setSelectedProduct(null);
  };

  const removeFromCart = (idVariante: string) => {
    setCart(prev => prev.filter(item => item.id_variante !== idVariante));
  };

  const updateQuantity = (idVariante: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id_variante === idVariante) {
        const newQty = item.cantidad + delta;
        if (newQty <= 0) return item;
        
        // When increasing, check real stock
        if (delta > 0) {
           const initial = db.getStock(idVariante);
           if (newQty > initial) {
             alert('Límite de stock alcanzado');
             return item;
           }
        }
        return { ...item, cantidad: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);

  const handleFinishVenta = () => {
    try {
      const ticketNum = `T-${Date.now().toString().slice(-6)}`;
      const newVenta = db.createVenta(
        {
          id_cliente: client.id_cliente,
          fecha_venta: new Date().toISOString(),
          total,
          metodo_pago: paymentMethod,
          estado: 'PAGADA',
          ticket_numero: ticketNum
        },
        cart.map(item => ({
          id_variante: item.id_variante,
          cantidad: item.cantidad,
          precio_unitario: item.precio_venta,
          subtotal: item.precio_venta * item.cantidad
        }))
      );

      setLastTicket({ ...newVenta, detalles: [...cart], cliente_nombre: client.nombre });
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveClient = () => {
    if (!newClient.nombre) return alert('El nombre es obligatorio');
    const added = db.addCliente({ 
      nombre: newClient.nombre, 
      telefono: newClient.telefono, 
      documento: '', 
      email: ''
    });
    setClient(added);
    setShowAddClient(false);
    setNewClient({ nombre: '', telefono: '' });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo_barra.includes(search));
  }, [products, search]);

  if (lastTicket) {
    return (
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm mx-auto animate-in fade-in zoom-in duration-300 border border-gray-50 my-10">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto text-4xl mb-3 shadow-inner">👗</div>
          <h2 className="font-extrabold text-2xl text-gray-800 tracking-tighter">BEAUTY CLOTH</h2>
          <p className="text-sm font-medium text-gray-400">Ticket #{lastTicket.ticket_numero}</p>
        </div>
        <div className="border-t border-dashed border-gray-200 py-6 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Fecha</span><span className="font-semibold">{new Date(lastTicket.fecha_venta).toLocaleDateString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Cliente</span><span className="font-semibold">{lastTicket.cliente_nombre}</span></div>
          <div className="border-t border-dashed border-gray-200 my-4 pt-4 space-y-2">
            {lastTicket.detalles.map((d: any) => (
              <div key={d.id_variante} className="flex justify-between items-start">
                <span className="text-gray-700 flex-1">{d.cantidad}x {d.nombre} <span className="text-xs text-gray-400 block">{d.talla} / {d.color}</span></span>
                <span className="font-bold text-gray-800">${(d.cantidad * d.precio_venta).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center">
            <span className="font-bold text-lg text-gray-400 tracking-tight">TOTAL</span>
            <span className="font-black text-2xl text-pink-500">${lastTicket.total.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-4 no-print">
          <button onClick={() => window.print()} className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-4 rounded-2xl font-bold">Imprimir Ticket</button>
          <button onClick={() => setLastTicket(null)} className="w-full bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold">Nueva Venta</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search and Client Fixed Area */}
      <div className="flex-none space-y-4 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <select 
              className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-pink-500/10 outline-none text-sm appearance-none shadow-sm font-bold pr-10"
              value={client.id_cliente}
              onChange={(e) => {
                const selected = db.getClientes().find(c => c.id_cliente === e.target.value);
                if (selected) setClient(selected);
              }}
            >
              {db.getClientes().map(c => <option key={c.id_cliente} value={c.id_cliente}>👤 {c.nombre}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-500 pointer-events-none">▼</div>
          </div>
          <button 
            onClick={() => setShowAddClient(true)}
            className="bg-white border border-gray-100 rounded-2xl px-5 flex items-center justify-center text-pink-500 shadow-sm hover:bg-pink-50 transition-colors"
          >
            <span className="text-2xl font-bold">＋</span>
          </button>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar por nombre o código..."
            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 pl-12 focus:ring-4 focus:ring-pink-500/10 outline-none text-sm shadow-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-500/50 text-xl">🔍</span>
        </div>
      </div>

      {/* Product List Scrollable Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-32">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map(p => (
            <button
              key={p.id_producto}
              onClick={() => setSelectedProduct(p)}
              className="group bg-white p-3 rounded-[2rem] shadow-sm hover:shadow-xl active:scale-95 transition-all border border-transparent hover:border-pink-500/20 flex flex-col items-center text-center h-full"
            >
              <div className="bg-pink-500/5 w-full aspect-square rounded-[1.5rem] mb-2 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                {p.id_categoria === 'cat1' ? '👚' : p.id_categoria === 'cat2' ? '👖' : p.id_categoria === 'cat3' ? '👗' : p.id_categoria === 'cat4' ? '🧥' : '👜'}
              </div>
              <h3 className="font-bold text-gray-700 text-[10px] line-clamp-2 leading-tight h-6 mb-1 px-1">{p.nombre}</h3>
              <p className="text-pink-500 font-black text-base mt-auto">${p.precio_venta.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Summary Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 px-6 z-30 pointer-events-none md:bottom-8 md:left-32 md:right-10">
          <button 
            onClick={() => setShowCart(true)}
            className="max-w-md mx-auto w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-4 rounded-[2.5rem] shadow-2xl shadow-pink-500/30 flex items-center justify-between px-8 pointer-events-auto transform hover:scale-105 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="bg-white text-pink-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-inner">
                {cart.reduce((a, b) => a + b.cantidad, 0)}
              </span>
              <span className="font-black text-lg tracking-tighter">Carrito</span>
            </div>
            <span className="font-black text-xl tracking-tighter">${total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* NEW CLIENT MODAL */}
      {showAddClient && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-black text-2xl mb-8 text-gray-800 tracking-tighter">Nuevo Cliente</h3>
            <div className="space-y-4">
              <input placeholder="Nombre (Obligatorio)" className="w-full bg-gray-50 p-5 rounded-2xl outline-none border border-gray-100 focus:border-pink-300 font-bold" value={newClient.nombre} onChange={e => setNewClient({...newClient, nombre: e.target.value})} />
              <input placeholder="Teléfono" className="w-full bg-gray-50 p-5 rounded-2xl outline-none border border-gray-100 focus:border-pink-300 font-bold" value={newClient.telefono} onChange={e => setNewClient({...newClient, telefono: e.target.value})} />
              <div className="flex gap-4 pt-6">
                <button onClick={() => setShowAddClient(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-xs tracking-widest">Cancelar</button>
                <button onClick={handleSaveClient} className="flex-1 bg-pink-500 text-white py-5 rounded-2xl font-black shadow-lg shadow-pink-500/20">Registrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SELECT VARIANT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-black text-2xl text-gray-800 leading-tight tracking-tighter">{selectedProduct.nombre}</h3>
                <p className="text-pink-500 font-black uppercase text-[10px] tracking-[0.2em] mt-2">Detalles de Prenda</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 text-3xl hover:text-pink-500 transition-colors">×</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {db.getVariantes(selectedProduct.id_producto).map(v => {
                const available = getAvailableStock(v.id_variante);
                return (
                  <button key={v.id_variante} disabled={available <= 0} onClick={() => addToCart(selectedProduct, v)} className={`flex justify-between items-center w-full p-5 rounded-[2rem] border-2 transition-all group ${available > 0 ? 'border-gray-50 hover:border-pink-500/30 bg-white active:bg-pink-50' : 'bg-gray-50 border-transparent opacity-50 cursor-not-allowed'}`}>
                    <div className="text-left">
                      <div className="font-black text-gray-700 text-base">Talla {v.talla}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{v.color}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${available < 5 ? 'text-orange-500' : 'text-pink-500'}`}>Disp.</p>
                        <p className="font-black text-lg text-gray-800">{available}</p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 text-lg font-black group-hover:bg-pink-500 group-hover:text-white transition-all">＋</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* OPTIMIZED CART MODAL */}
      {showCart && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-6 pt-10 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-2xl">🛍️</div>
                <h2 className="font-black text-2xl text-gray-800 tracking-tighter">Tu Carrito</h2>
              </div>
              <button onClick={() => setShowCart(false)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 text-3xl hover:text-red-500 transition-all">×</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 px-2 custom-scrollbar pb-6">
              {cart.map(item => (
                <div key={item.id_variante} className="flex gap-4 bg-gray-50/40 p-3 px-4 rounded-[2rem] border border-gray-100/50">
                  <div className="w-14 h-14 bg-white rounded-2xl flex-none flex items-center justify-center text-2xl shadow-sm">
                    {item.id_categoria === 'cat1' ? '👚' : item.id_categoria === 'cat2' ? '👖' : '👗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-gray-800 tracking-tighter leading-tight text-sm truncate pr-2">{item.nombre}</h4>
                      <button onClick={() => removeFromCart(item.id_variante)} className="text-gray-300 hover:text-red-500 transition-colors p-1 text-sm">🗑️</button>
                    </div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.talla} • {item.color}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-black text-base text-pink-500 tracking-tighter">${(item.precio_venta * item.cantidad).toFixed(2)}</span>
                      <div className="flex items-center gap-3 bg-white shadow-xs border border-gray-100 rounded-xl p-1 px-3">
                        <button onClick={() => updateQuantity(item.id_variante, -1)} className="text-lg font-black text-gray-200 hover:text-pink-500">－</button>
                        <span className="text-sm font-black w-4 text-center text-gray-800">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id_variante, 1)} className="text-lg font-black text-gray-200 hover:text-pink-500">＋</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <div className="text-center py-10 text-gray-300 font-bold uppercase tracking-widest text-xs">Vacio</div>}
            </div>

            {cart.length > 0 && (
              <div className="mt-auto bg-gray-900 p-6 rounded-[3rem] space-y-4 shadow-2xl mx-[-8px]">
                <div className="flex justify-between items-center text-white px-2">
                  <div className="flex flex-col">
                    <span className="text-white/40 font-black uppercase text-[9px] tracking-widest">Total compra</span>
                    <span className="font-black text-3xl tracking-tighter">${total.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => setShowCheckout(true)} 
                    className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-4 px-10 rounded-[1.5rem] font-black text-lg shadow-xl shadow-pink-500/30 active:scale-95 transition-all"
                  >
                    Pagar Ahora
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-lg flex items-center justify-center z-[110] p-6">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-black text-3xl mb-10 text-center text-gray-800 tracking-tighter">Pago</h3>
            <div className="grid grid-cols-1 gap-4 mb-10 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`py-5 rounded-[2rem] border-2 transition-all font-black flex items-center gap-5 px-8 ${paymentMethod === m.id ? 'border-pink-500 bg-pink-500/5 text-pink-500' : 'border-gray-50 text-gray-400 hover:bg-gray-50'}`}>
                  <div className="w-10 h-10 flex items-center justify-center">{m.icon.startsWith('http') ? <img src={m.icon} alt={m.label} className="w-full h-full object-contain" /> : <span className="text-2xl">{m.icon}</span>}</div>
                  <span className="flex-1 text-left text-base tracking-tight">{m.label}</span>
                  {paymentMethod === m.id && <span className="text-xl">✓</span>}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={handleFinishVenta} className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all">Confirmar ${total.toFixed(2)}</button>
              <button onClick={() => setShowCheckout(false)} className="w-full text-gray-400 py-2 font-black uppercase text-[10px] tracking-widest text-center">Volver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
