import React, { useState, useEffect } from 'react';
import { Plus, Receipt, DollarSign, Calendar, Filter, Trash2 } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Otros',
    amount: 0,
    method: 'Efectivo',
    note: ''
  });

  const fetchExpenses = async () => {
    const { data } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (data) setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('expenses').insert([formData]);
      if (error) throw error;
      
      fetchExpenses();
      setIsModalOpen(false);
      setFormData({ category: 'Otros', amount: 0, method: 'Efectivo', note: '' });
    } catch (err: any) {
      alert('Error al registrar gasto: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      fetchExpenses();
    } catch (err: any) {
      alert('Error al eliminar gasto: ' + err.message);
    }
  };

  const totalMonth = expenses.reduce((sum, e) => sum + e.amount, 0);
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;
  const highestCategory = expenses.find(e => e.amount === highestExpense)?.category || 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {/* Filter could be implemented here */}
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span>Registrar Gasto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Gastos</p>
          <h3 className="text-2xl font-bold text-slate-900">${totalMonth.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-500 font-medium mb-1">Gasto más Alto</p>
          <h3 className="text-2xl font-bold text-rose-600">${highestExpense.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3>
          <p className="text-xs text-slate-400 mt-1">Categoría: {highestCategory}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-500 font-medium mb-1">Frecuencia</p>
          <h3 className="text-2xl font-bold text-indigo-600">{expenses.length} Gastos</h3>
          <p className="text-xs text-slate-400 mt-1">Registrados en total</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Fecha</th>
              <th className="px-6 py-4 font-semibold">Categoría</th>
              <th className="px-6 py-4 font-semibold">Monto</th>
              <th className="px-6 py-4 font-semibold">Método</th>
              <th className="px-6 py-4 font-semibold">Nota</th>
              <th className="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500">
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} />
                    <span>{new Date(expense.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-rose-600">${expense.amount.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{expense.method}</td>
                <td className="px-6 py-4 text-sm text-slate-500 italic">{expense.note}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(expense.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Registrar Gasto</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select 
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>Renta</option>
                  <option>Luz</option>
                  <option>Internet</option>
                  <option>Publicidad</option>
                  <option>Mantenimiento</option>
                  <option>Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monto</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="number" 
                    step="0.01" 
                    className="input-field pl-10" 
                    placeholder="0.00" 
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
                <select 
                  className="input-field"
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                >
                  <option>Efectivo</option>
                  <option>Transferencia</option>
                  <option>Tarjeta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nota / Concepto</label>
                <textarea 
                  className="input-field h-24 resize-none" 
                  placeholder="Descripción del gasto..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                ></textarea>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary">Cancelar</button>
                <button type="submit" className="flex-1 btn-primary">Guardar Gasto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
