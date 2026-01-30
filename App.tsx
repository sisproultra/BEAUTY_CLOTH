
import React, { useState, useEffect } from 'react';
import { db } from './db';
import { Usuario } from './types';
import Layout from './components/Layout';
import POS from './views/POS';
import Inventory from './views/Inventory';
import Reports from './views/Reports';
import Customers from './views/Customers';

const App: React.FC = () => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Detect installability
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('App instalada correctamente');
    });

    const saved = localStorage.getItem('chicpos_session');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
      } catch (e) {
        localStorage.removeItem('chicpos_session');
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = db.login(email, password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('chicpos_session', JSON.stringify(foundUser));
      setError('');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chicpos_session');
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#fef08a] via-[#fb923c] to-[#f472b6] flex flex-col items-center justify-center p-6 overflow-hidden select-none">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-pink-400/30 rounded-full blur-3xl"></div>
        
        {/* PWA Install Promo Button */}
        {isInstallable && (
          <button 
            onClick={handleInstallClick}
            className="absolute top-6 bg-white/30 backdrop-blur-md border border-white/40 px-6 py-3 rounded-full flex items-center gap-3 animate-bounce shadow-lg z-50 text-white font-bold text-sm"
          >
            <span className="bg-pink-500 rounded-lg p-1 text-xs">📲</span>
            Instalar Beauty Cloth APP
          </button>
        )}

        <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] p-10 pt-12 relative z-10 border border-white/40 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
               <span className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500 italic">
                BEAUTY
              </span>
              <span className="text-4xl font-light tracking-widest text-gray-800 ml-1">
                CLOTH
              </span>
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Punto de Venta Exclusivo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="group">
              <label className="text-[10px] font-black text-orange-500 ml-4 uppercase tracking-widest group-focus-within:text-pink-500 transition-colors">Usuario</label>
              <input 
                type="text" 
                placeholder="Ingresa tu usuario"
                className="w-full bg-white/50 border border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-pink-200 focus:border-pink-300 outline-none transition-all font-bold text-gray-700 shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="group">
              <label className="text-[10px] font-black text-orange-500 ml-4 uppercase tracking-widest group-focus-within:text-pink-500 transition-colors">Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-white/50 border border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-pink-200 focus:border-pink-300 outline-none transition-all font-bold text-gray-700 shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-500 text-[10px] text-center font-black py-2 rounded-xl border border-red-100 animate-shake">
                {error}
              </div>
            )}
            
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-pink-500/30 transform active:scale-95 transition-all text-xl mt-4"
            >
              Iniciar Sesión
            </button>
            
            <div className="pt-8 text-center">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.1em] leading-relaxed">
                power by <span className="text-orange-500">sistemapp</span>
                <br />
                <span className="text-pink-500 font-bold text-xs tracking-normal">931200353</span>
              </p>
            </div>
          </form>
        </div>
        
        <p className="mt-8 text-white/60 text-[10px] font-bold uppercase tracking-widest">v1.0.0 Stable Build</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'pos': return <POS />;
      case 'inventory': return <Inventory />;
      case 'reports': return <Reports />;
      case 'customers': return <Customers />;
      default: return <POS />;
    }
  };

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
