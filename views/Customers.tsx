
import React, { useState } from 'react';
import { db } from '../db';
import { Cliente } from '../types';

const Customers: React.FC = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState({ nombre: '', telefono: '' });

  const clientes = db.getClientes();

  const handleSave = () => {
    if (!newClient.nombre) return alert('El nombre es obligatorio');
    db.addCliente({ 
      nombre: newClient.nombre, 
      telefono: newClient.telefono,
      documento: '', // Mandatory in schema but empty here
      email: ''      // Mandatory in schema but empty here
    });
    setNewClient({ nombre: '', telefono: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-primary-200"
        >
          ＋
        </button>
      </div>

      <div className="space-y-3">
        {clientes.map(c => (
          <div key={c.id_cliente} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">👤</div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">{c.nombre}</h4>
                <p className="text-xs text-gray-400">{c.documento ? `Doc: ${c.documento}` : 'Sin documento'}</p>
              </div>
            </div>
            <div className="text-right">
               <p className="text-xs text-primary font-medium">{c.telefono || 'Sin tel.'}</p>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-lg mb-6">Nuevo Cliente</h3>
            <div className="space-y-4">
              <input 
                placeholder="Nombre Completo (Obligatorio)" 
                className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary-200"
                value={newClient.nombre}
                onChange={e => setNewClient({...newClient, nombre: e.target.value})}
              />
              <input 
                placeholder="Teléfono" 
                className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary-200"
                value={newClient.telefono}
                onChange={e => setNewClient({...newClient, telefono: e.target.value})}
              />
              <div className="flex gap-2 pt-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-4 text-gray-500 font-bold">Cerrar</button>
                <button onClick={handleSave} className="flex-1 bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-200">Registrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
