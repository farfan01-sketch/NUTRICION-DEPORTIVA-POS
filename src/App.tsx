import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Clock, 
  Users, 
  Package, 
  History, 
  CheckSquare, 
  Truck, 
  ShoppingBag, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  UserPlus, 
  Settings as SettingsIcon,
  Menu,
  X,
  LogOut,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './Dashboard';
import POS from './POS';
import Customers from './Customers';
import Products from './Products';
import Inventory from './Inventory';
import Layaways from './Layaways';
import Reports from './Reports';
import Settings from './Settings';

import Audit from './Audit';
import Suppliers from './Suppliers';
import Expenses from './Expenses';
import AccountsPayable from './AccountsPayable';
import Purchases from './Purchases';
import Staff from './Staff';
import ShiftManager from './ShiftManager';
import { supabase } from './lib/supabase';

type View = 'dashboard' | 'pos' | 'layaways' | 'customers' | 'products' | 'inventory' | 'audit' | 'suppliers' | 'purchases' | 'payable' | 'expenses' | 'reports' | 'staff' | 'settings' | 'shifts';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState({ id: '1', name: 'Admin', role: 'admin' });

  useEffect(() => {
    async function checkShift() {
      try {
        const { data: shift, error } = await supabase
          .from('shifts')
          .select('user_id, users(name, role)')
          .eq('status', 'open')
          .order('start_time', { ascending: false })
          .limit(1)
          .single();
        
        if (shift && shift.users) {
          setUser({ 
            id: shift.user_id, 
            name: (shift.users as any).name, 
            role: (shift.users as any).role 
          });
        } else {
          // Default to first admin if no shift is open
          const { data: admin } = await supabase
            .from('users')
            .select('id, name, role')
            .eq('role', 'admin')
            .limit(1)
            .single();
          
          if (admin) {
            setUser({ id: admin.id, name: admin.name, role: admin.role });
          }
        }
      } catch (err) {
        console.error('Error checking shift:', err);
      }
    }
    checkShift();
  }, [activeView]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Caja', icon: ShoppingCart },
    { id: 'shifts', label: 'Corte de Caja', icon: Receipt },
    { id: 'layaways', label: 'Apartados', icon: Clock },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'inventory', label: 'Inventario', icon: History },
    { id: 'audit', label: 'Verificar Inventario', icon: CheckSquare },
    { id: 'suppliers', label: 'Proveedores', icon: Truck },
    { id: 'purchases', label: 'Compras', icon: ShoppingBag },
    { id: 'payable', label: 'Cuentas por pagar', icon: CreditCard },
    { id: 'expenses', label: 'Gastos', icon: Receipt },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'staff', label: 'Colaboradores', icon: UserPlus },
    { id: 'settings', label: 'Configuración', icon: SettingsIcon },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS user={user} />;
      case 'shifts': return <ShiftManager />;
      case 'customers': return <Customers />;
      case 'products': return <Products />;
      case 'inventory': return <Inventory />;
      case 'audit': return <Audit />;
      case 'suppliers': return <Suppliers />;
      case 'purchases': return <Purchases />;
      case 'payable': return <AccountsPayable />;
      case 'expenses': return <Expenses />;
      case 'layaways': return <Layaways />;
      case 'reports': return <Reports />;
      case 'staff': return <Staff />;
      case 'settings': return <Settings />;
      default: return <div className="p-8 text-slate-500">Módulo en desarrollo...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col z-20`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {isSidebarOpen && (
            <span className="font-bold text-white truncate">Nutrición Deportiva</span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded-md"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center px-4 py-3 transition-colors ${
                activeView === item.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={isSidebarOpen ? 'mr-3' : 'mx-auto'} />
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center px-2 py-2 text-slate-400 hover:text-white transition-colors">
            <LogOut size={20} className={isSidebarOpen ? 'mr-3' : 'mx-auto'} />
            {isSidebarOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {menuItems.find(m => m.id === activeView)?.label}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
              <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                {user.name[0]}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
