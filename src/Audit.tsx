import React, { useState, useEffect } from 'react';
import { Search, Camera, CheckCircle, AlertCircle, Package, Save, Plus } from 'lucide-react';
import { Product } from '../types';
import { supabase } from './lib/supabase';

export default function Audit() {
  const [products, setProducts] = useState<Product[]>([]);
  const [scannedItems, setScannedItems] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('productos').select('*').order('name');
      if (data) setProducts(data as Product[]);
    }
    fetchProducts();
  }, []);

  const handleScan = (productId: string) => {
    setScannedItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Escanear o buscar producto..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center space-x-2">
            <Camera size={20} />
            <span>Usar Cámara</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Save size={20} />
            <span>Cerrar Verificación</span>
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Producto</th>
              <th className="px-6 py-4 font-semibold">Sistema</th>
              <th className="px-6 py-4 font-semibold">Físico</th>
              <th className="px-6 py-4 font-semibold">Diferencia</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((product) => {
              const physical = scannedItems[product.id] || 0;
              const diff = physical - product.stock;
              
              return (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{product.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{product.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600">{product.stock}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number" 
                        className="w-16 px-2 py-1 border rounded text-sm text-center"
                        value={physical}
                        onChange={(e) => setScannedItems({ ...scannedItems, [product.id]: Number(e.target.value) })}
                      />
                      <button 
                        onClick={() => handleScan(product.id)}
                        className="p-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-bold ${diff === 0 ? 'text-slate-400' : diff > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {diff > 0 ? `+${diff}` : diff}
                  </td>
                  <td className="px-6 py-4">
                    {diff === 0 ? (
                      <span className="flex items-center text-emerald-600 text-xs font-medium">
                        <CheckCircle size={14} className="mr-1" /> Completo
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-600 text-xs font-medium">
                        <AlertCircle size={14} className="mr-1" /> Discrepancia
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-bold text-indigo-600 hover:underline">Ajustar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
