import React, { useState, useEffect } from 'react';
import { Plus, Search, Truck, Phone, Mail, Edit2, Trash2 } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    conditions: 'Contado',
    notes: ''
  });

  const fetchSuppliers = async () => {
    const { data } = await supabase.from('suppliers').select('*').order('name');
    if (data) setSuppliers(data);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('suppliers').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('suppliers').insert([formData]);
        if (error) throw error;
      }
      
      fetchSuppliers();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      alert('Error al guardar proveedor: ' + err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', contact: '', conditions: 'Contado', notes: '' });
  };

  const handleEdit = (supplier: any) => {
    setEditingId(supplier.id);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      conditions: supplier.conditions,
      notes: supplier.notes
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
      fetchSuppliers();
    } catch (err: any) {
      alert('Error al eliminar proveedor: ' + err.message);
    }
  };

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar proveedor..."
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
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((supplier) => (
          <div key={supplier.id} className="card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{supplier.name}</h3>
                  <p className="text-xs text-slate-500">Condiciones: {supplier.conditions}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => handleEdit(supplier)}
                  className="p-1 text-slate-400 hover:text-indigo-600"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(supplier.id)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center text-sm text-slate-600">
                <Phone size={14} className="mr-2 text-slate-400" />
                <span>{supplier.contact}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Mail size={14} className="mr-2 text-slate-400" />
                <span>{supplier.email || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 italic line-clamp-2">"{supplier.notes || 'Sin notas adicionales.'}"</p>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <p>No se encontraron proveedores.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Proveedor</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contacto / Teléfono</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condiciones</label>
                <select
                  className="input-field"
                  value={formData.conditions}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                >
                  <option value="Contado">Contado</option>
                  <option value="15 días">15 días</option>
                  <option value="30 días">30 días</option>
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
