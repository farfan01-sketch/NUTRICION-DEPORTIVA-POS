import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertCircle, CheckCircle, DollarSign, Filter, Search } from 'lucide-react';

export default function AccountsPayable() {
  const [payables, setPayables] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Mock data for accounts payable
    setPayables([
      { id: 1, supplier: 'Suplementos México SA', total: 15000, balance: 5000, due_date: '2024-03-15', status: 'partial' },
      { id: 2, supplier: 'Ropa Deportiva Fit', total: 8200, balance: 8200, due_date: '2024-03-10', status: 'pending' },
      { id: 3, supplier: 'Accesorios Gym Pro', total: 3400, balance: 0, due_date: '2024-02-28', status: 'paid' },
    ]);
  }, []);

  const filtered = payables.filter(p => 
    p.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const totalDebt = payables.reduce((sum, p) => sum + p.balance, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-rose-50 border-rose-100">
          <p className="text-sm text-rose-600 font-medium mb-1">Deuda Total a Proveedores</p>
          <h3 className="text-2xl font-bold text-rose-900">${totalDebt.toLocaleString()}</h3>
        </div>
        <div className="card p-6 bg-amber-50 border-amber-100">
          <p className="text-sm text-amber-600 font-medium mb-1">Próximos Vencimientos (7 días)</p>
          <h3 className="text-2xl font-bold text-amber-900">2 Facturas</h3>
        </div>
        <div className="card p-6 bg-emerald-50 border-emerald-100">
          <p className="text-sm text-emerald-600 font-medium mb-1">Pagado este Mes</p>
          <h3 className="text-2xl font-bold text-emerald-900">$12,450.00</h3>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por proveedor..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <Filter size={18} />
          <span>Filtrar</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Proveedor</th>
              <th className="px-6 py-4 font-semibold">Vencimiento</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Saldo Pendiente</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
                      <CreditCard size={14} />
                    </div>
                    <span className="font-medium text-slate-900">{p.supplier}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{p.due_date}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">${p.total.toLocaleString()}</td>
                <td className="px-6 py-4 text-rose-600 font-bold">${p.balance.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                    p.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {p.status === 'paid' ? 'Pagado' : p.status === 'partial' ? 'Pago Parcial' : 'Pendiente'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {p.balance > 0 && (
                      <button className="btn-primary py-1 px-3 text-xs">Abonar</button>
                    )}
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      <AlertCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
