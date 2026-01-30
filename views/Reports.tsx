
import React, { useMemo } from 'react';
import { db } from '../db';

const Reports: React.FC = () => {
  const ventas = db.getVentas();
  const productos = db.getProductos();
  const variantes = db.getVariantes();
  const categorias = db.getCategorias();
  
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const salesToday = ventas.filter(v => v.fecha_venta.startsWith(today));
    const revenueToday = salesToday.reduce((acc, v) => acc + v.total, 0);

    const totalRevenue = ventas.reduce((acc, v) => acc + v.total, 0);
    const totalTransactions = ventas.length;
    const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    // Group sales by date (last 7 days)
    const salesByDate: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - 86400000 * i).toISOString().split('T')[0];
      salesByDate[d] = 0;
    }
    ventas.forEach(v => {
      const d = v.fecha_venta.split('T')[0];
      if (salesByDate[d] !== undefined) {
        salesByDate[d] += v.total;
      }
    });

    // Top Categories & Products & Sizes & Payments
    const catSales: Record<string, number> = {};
    const productSales: Record<string, number> = {};
    const sizeSales: Record<string, number> = {};
    const paymentSales: Record<string, number> = {};

    ventas.forEach(v => {
      paymentSales[v.metodo_pago] = (paymentSales[v.metodo_pago] || 0) + v.total;
      
      db.getDetallesVenta(v.id_venta).forEach(det => {
        const variant = variantes.find(va => va.id_variante === det.id_variante);
        if (variant) {
          const product = productos.find(pr => pr.id_producto === variant.id_producto);
          if (product) {
            catSales[product.id_categoria] = (catSales[product.id_categoria] || 0) + det.cantidad;
            productSales[product.id_producto] = (productSales[product.id_producto] || 0) + det.cantidad;
          }
          sizeSales[variant.talla] = (sizeSales[variant.talla] || 0) + det.cantidad;
        }
      });
    });

    const topCats = Object.entries(catSales)
      .map(([id, qty]) => ({ name: categorias.find(c => c.id_categoria === id)?.nombre || '?', qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const topProducts = Object.entries(productSales)
      .map(([id, qty]) => ({ name: productos.find(p => p.id_producto === id)?.nombre || '?', qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const topSizes = Object.entries(sizeSales)
      .map(([size, qty]) => ({ size, qty }))
      .sort((a, b) => b.qty - a.qty);

    const paymentMethods = Object.entries(paymentSales)
      .map(([method, amount]) => ({ method, amount, percent: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);

    return { 
      totalRevenue, 
      revenueToday, 
      totalTransactions, 
      averageTicket,
      salesByDate, 
      topCats, 
      topProducts,
      topSizes,
      paymentMethods
    };
  }, [ventas, productos, variantes, categorias]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter">Dashboard</h2>
          <p className="text-pink-500 font-bold text-xs uppercase tracking-widest">Estadísticas de Negocio</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hoy</p>
          <p className="text-2xl font-black text-gray-800">${stats.revenueToday.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Main Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 col-span-2 md:col-span-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ventas Totales</p>
          <p className="text-3xl font-black text-pink-500 tracking-tighter">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className="mt-4 flex items-end gap-1.5 h-16">
            {(Object.values(stats.salesByDate) as number[]).reverse().map((val, i) => {
              const max = Math.max(...(Object.values(stats.salesByDate) as number[]));
              const height = max ? (val / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 bg-pink-500/10 rounded-t-md relative h-full">
                  <div className="bg-pink-500 w-full rounded-t-md absolute bottom-0 transition-all duration-700" style={{ height: `${height}%` }}></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Ticket Promedio</p>
          <p className="text-3xl font-black text-gray-800 text-center tracking-tighter">${stats.averageTicket.toFixed(2)}</p>
          <div className="mt-2 text-center text-[10px] text-pink-500 font-bold">Por Venta</div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Transacciones</p>
          <p className="text-4xl font-black text-gray-800 text-center tracking-tighter">{stats.totalTransactions}</p>
          <div className="mt-2 text-center text-[10px] text-orange-400 font-bold">Operaciones</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-9 h-9 bg-pink-500 rounded-xl flex items-center justify-center text-white text-sm shadow-lg shadow-pink-500/20">🔥</span>
            Top 5 Prendas
          </h3>
          <div className="space-y-4">
            {stats.topProducts.map((prod, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-gray-300 font-black italic text-xl">0{i+1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-black uppercase tracking-tight mb-1">
                    <span className="text-gray-600 truncate max-w-[150px]">{prod.name}</span>
                    <span className="text-pink-500">{prod.qty} un.</span>
                  </div>
                  <div className="bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100/50">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(prod.qty / (stats.topProducts[0]?.qty || 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-9 h-9 bg-orange-400 rounded-xl flex items-center justify-center text-white text-sm shadow-lg shadow-orange-400/20">💳</span>
            Métodos de Pago
          </h3>
          <div className="space-y-4">
            {stats.paymentMethods.map((pay, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{pay.method}</span>
                  <span className="text-xs font-black text-gray-800">${pay.amount.toLocaleString()}</span>
                </div>
                <div className="relative h-6 bg-gray-50 rounded-xl overflow-hidden group">
                  <div 
                    className={`absolute inset-0 bg-gradient-to-r ${i % 2 === 0 ? 'from-orange-400 to-orange-300' : 'from-pink-500 to-pink-400'} opacity-20`}
                  ></div>
                  <div 
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${i % 2 === 0 ? 'from-orange-400 to-orange-300' : 'from-pink-500 to-pink-400'} rounded-r-xl transition-all duration-1000 flex items-center px-3`}
                    style={{ width: `${pay.percent}%` }}
                  >
                    <span className="text-[10px] font-black text-white">{pay.percent.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
