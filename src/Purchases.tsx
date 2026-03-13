import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Truck, Calendar, ArrowRight, Package } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function Purchases() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const fetchData = async () => {
    const [purchRes, suppRes] = await Promise.all([
      supabase.from('purchases').select('*').order('created_at', { ascending: false }),
      supabase.from('suppliers').select('*').order('name')
    ]);
    if (purchRes.data) setPurchases(purchRes.data);
    if (suppRes.data) setSuppliers(suppRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar compras..."
            className="input-field pl-10"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span>Nueva Compra</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="card p-4 hover:border-indigo-300 transition-colors cursor-pointer group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{purchase.supplier}</h3>
                  <div className="flex items-center text-xs text-slate-500 space-x-3 mt-1">
                    <span className="flex items-center"><Calendar size={12} className="mr-1" /> {purchase.date}</span>
                    <span className="flex items-center"><Package size={12} className="mr-1" /> {purchase.items} productos</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end space-x-8">
                <div className="text-right">
                  <p className="text-sm text-slate-500">Total Compra</p>
                  <p className="text-lg font-bold text-slate-900">${purchase.total.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    purchase.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {purchase.status === 'paid' ? 'Contado' : 'Crédito'}
                  </span>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Registrar Entrada de Mercancía</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
                  <select className="input-field">
                    <option>Seleccionar proveedor...</option>
                    <option>Suplementos México SA</option>
                    <option>Ropa Deportiva Fit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
                  <select className="input-field">
                    <option value="paid">Contado</option>
                    <option value="credit">Crédito (Cuenta por pagar)</option>
                  </select>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                <Package size={48} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500">Escanear productos para agregar a la compra</p>
                <button className="mt-4 btn-secondary text-sm">Buscar Manualmente</button>
              </div>

              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary">Cancelar</button>
                <button type="submit" className="flex-1 btn-primary">Finalizar Compra</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
