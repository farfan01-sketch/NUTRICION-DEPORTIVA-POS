import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Package, Tag, DollarSign, Barcode } from 'lucide-react';
import { Product } from '../types';
import { supabase } from './lib/supabase';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    code: '',
    name: '',
    brand: '',
    category: '',
    cost: 0,
    price_retail: 0,
    price_wholesale: 0,
    stock: 0,
    stock_min: 5,
    type: 'supplement'
  });

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('name');
    if (data) setProducts(data as Product[]);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from('productos')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('productos')
          .insert([formData]);
        if (error) throw error;
      }
      
      fetchProducts();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      alert('Error al guardar producto: ' + err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      code: '', name: '', brand: '', category: '', cost: 0, 
      price_retail: 0, price_wholesale: 0, stock: 0, stock_min: 5, type: 'supplement'
    });
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (err: any) {
      alert('Error al eliminar producto: ' + err.message);
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.includes(search) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, marca o código..."
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
          <span>Nuevo Producto</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Producto</th>
                <th className="px-6 py-4 font-semibold">Código</th>
                <th className="px-6 py-4 font-semibold">Categoría</th>
                <th className="px-6 py-4 font-semibold">Precios (Men/May)</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">{product.code}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-bold text-slate-900">${product.price_retail}</p>
                      <p className="text-xs text-slate-500">${product.price_wholesale}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${product.stock <= product.stock_min ? 'text-rose-600' : 'text-slate-900'}`}>
                        {product.stock}
                      </span>
                      {product.stock <= product.stock_min && (
                        <Tag size={12} className="text-rose-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-1 text-slate-400 hover:text-indigo-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {editingId ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código de Barras</label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    required
                    type="text"
                    className="input-field pl-10"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Proteínas">Proteínas</option>
                  <option value="Creatinas">Creatinas</option>
                  <option value="Pre-entrenos">Pre-entrenos</option>
                  <option value="Ropa">Ropa</option>
                  <option value="Accesorios">Accesorios</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select
                  className="input-field"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="supplement">Suplemento</option>
                  <option value="clothing">Ropa</option>
                  <option value="accessory">Accesorio</option>
                </select>
              </div>
              <div className="border-t border-slate-100 pt-4 md:col-span-2">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Costos y Precios</h4>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Costo</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio Menudeo</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={formData.price_retail}
                  onChange={(e) => setFormData({ ...formData, price_retail: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio Mayoreo</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={formData.price_wholesale}
                  onChange={(e) => setFormData({ ...formData, price_wholesale: Number(e.target.value) })}
                />
              </div>
              <div className="border-t border-slate-100 pt-4 md:col-span-2">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Inventario</h4>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Inicial</label>
                <input
                  required
                  type="number"
                  className="input-field"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
                <input
                  required
                  type="number"
                  className="input-field"
                  value={formData.stock_min}
                  onChange={(e) => setFormData({ ...formData, stock_min: Number(e.target.value) })}
                />
              </div>
              <div className="flex space-x-3 pt-6 md:col-span-2">
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
                  {editingId ? 'Guardar Cambios' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
