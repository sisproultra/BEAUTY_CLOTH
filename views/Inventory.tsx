
import React, { useState } from 'react';
import { db } from '../db';
import { Producto, ProductoVariante } from '../types';

const Inventory: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [showMoveModal, setShowMoveModal] = useState<ProductoVariante | null>(null);
  const [moveAmount, setMoveAmount] = useState(0);
  const [moveReason, setMoveReason] = useState('Ingreso de mercadería');

  const products = db.getProductos();

  const handleStockMove = () => {
    if (!showMoveModal || moveAmount <= 0) return;
    
    db.addMovement({
      id_variante: showMoveModal.id_variante,
      tipo_movimiento: 'INGRESO',
      cantidad: moveAmount,
      motivo: moveReason,
      fecha_movimiento: new Date().toISOString()
    });

    setMoveAmount(0);
    setShowMoveModal(null);
    // Force re-render would be needed in a real app or with reactive store
    alert('Stock actualizado correctamente');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventario</h2>
        <div className="bg-primary-100 px-3 py-1 rounded-full text-primary text-xs font-bold">
          {products.length} Productos
        </div>
      </div>

      <div className="space-y-4">
        {products.map(p => (
          <div key={p.id_producto} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <button 
              onClick={() => setSelectedProduct(selectedProduct?.id_producto === p.id_producto ? null : p)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">👕</div>
                <div>
                  <h3 className="font-bold text-gray-800">{p.nombre}</h3>
                  <p className="text-xs text-gray-400">Barcode: {p.codigo_barra}</p>
                </div>
              </div>
              <span className={`transition-transform ${selectedProduct?.id_producto === p.id_producto ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {selectedProduct?.id_producto === p.id_producto && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2 animate-in slide-in-from-top-2">
                {db.getVariantes(p.id_producto).map(v => (
                  <div key={v.id_variante} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-xs">
                    <div>
                      <span className="font-medium text-sm">Talla {v.talla} / {v.color}</span>
                      <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">{v.sku}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block text-xs text-gray-400">En mano</span>
                        <span className={`font-bold ${db.getStock(v.id_variante) < 3 ? 'text-red-500' : 'text-gray-700'}`}>
                          {db.getStock(v.id_variante)}
                        </span>
                      </div>
                      <button 
                        onClick={() => setShowMoveModal(v)}
                        className="bg-primary-50 text-primary w-8 h-8 rounded-lg flex items-center justify-center font-bold hover:bg-primary hover:text-white transition-colors"
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showMoveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-in zoom-in-95">
            <h3 className="font-bold text-lg mb-4">Aumentar Stock</h3>
            <p className="text-sm text-gray-500 mb-4">Variante: {showMoveModal.sku} ({showMoveModal.talla}/{showMoveModal.color})</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">CANTIDAD A INGRESAR</label>
                <input 
                  type="number"
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xl font-bold text-center outline-none focus:ring-2 focus:ring-primary-200"
                  value={moveAmount}
                  onChange={(e) => setMoveAmount(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">MOTIVO / NOTA</label>
                <input 
                  type="text"
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-200"
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => setShowMoveModal(null)}
                  className="flex-1 py-4 text-gray-500 font-bold"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleStockMove}
                  className="flex-1 bg-primary text-white py-4 rounded-xl font-bold"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
