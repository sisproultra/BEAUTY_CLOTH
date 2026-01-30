
import React from 'react';
import { Usuario } from '../types';

interface LayoutProps {
  user: Usuario;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const tabs = [
    { 
      id: 'pos', 
      label: 'Venta', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      id: 'inventory', 
      label: 'Stock', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    { 
      id: 'reports', 
      label: 'Cierre', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'customers', 
      label: 'Clientes', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="h-full flex flex-col md:flex-row-reverse bg-[#fffafa] font-outfit">
      {/* Navigation (Optimized for Mobile & Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center h-20 md:h-screen md:w-28 md:flex-col md:justify-start md:pt-28 md:border-l md:border-t-0 md:relative z-50 shadow-[0_-12px_40px_rgba(0,0,0,0.04)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full md:h-24 transition-all relative group ${
              activeTab === tab.id ? 'text-pink-500' : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <div className={`mb-1 transition-all duration-300 ${activeTab === tab.id ? 'scale-110 drop-shadow-sm' : ''}`}>{tab.icon}</div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 md:left-0 md:right-auto md:w-1.5 md:h-12 h-1.5 w-12 bg-pink-500 rounded-full animate-in fade-in duration-500"></div>
            )}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="flex-none bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-5 flex justify-between items-center z-40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-pink-500/20 transform -rotate-6">
              👗
            </div>
            <div>
              <h1 className="font-black text-xl leading-tight text-gray-800 tracking-tighter">BEAUTY <span className="font-light text-pink-500 tracking-widest text-sm uppercase">Cloth</span></h1>
              <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{user.rol} • {user.nombre.split(' ')[0]}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="bg-gray-50 text-gray-300 hover:text-red-500 transition-all p-3 rounded-2xl active:scale-90 border border-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-hidden p-6 max-w-6xl mx-auto w-full flex flex-col custom-scrollbar overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
