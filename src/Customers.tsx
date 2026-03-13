import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, User, Phone, Tag } from 'lucide-react';
import { Customer } from '../types';
import { supabase } from './lib/supabase';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'retail' as 'retail' | 'wholesale',
    notes: ''
  });

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('*').order('name');
    if (data) setCustomers(data as Customer[]);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('customers').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('customers').insert([formData]);
        if (error) throw error;
      }
      
      fetchCustomers();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      alert('Error al guardar cliente: ' + err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', type: 'retail', notes: '' });
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      type: customer.type,
      notes: customer.notes
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      fetchCustomers();
    } catch (err: any) {
      alert('Error al eliminar cliente: ' + err.message);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Nombre</th>
              <th className="px-6 py-4 font-semibold">Teléfono</th>
              <th className="px-6 py-4 font-semibold">Tipo</th>
              <th className="px-6 py-4 font-semibold">Notas</th>
              <th className="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">
                      {customer.name[0]}
                    </div>
                    <span className="font-medium text-slate-900">{customer.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{customer.phone}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.type === 'wholesale' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {customer.type === 'wholesale' ? 'Mayoreo' : 'Menudeo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate">{customer.notes}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => handleEdit(customer)}
                      className="p-1 text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(customer.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input
                  required
                  type="tel"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cliente</label>
                <select
                  className="input-field"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="retail">Menudeo</option>
                  <option value="wholesale">Mayoreo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <textarea
                  className="input-field h-24 resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }} 
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingId ? 'Guardar Cambios' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
