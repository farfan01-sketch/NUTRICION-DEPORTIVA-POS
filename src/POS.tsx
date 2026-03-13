import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, User, Barcode, Printer, Package, ShoppingCart, Clock } from 'lucide-react';
import { Product, Customer, SaleItem, Sale, Settings } from '../types';
import { supabase } from './lib/supabase';

export default function POS({ user }: { user: any }) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<Sale['payment_method']>('cash');
  const [isLayaway, setIsLayaway] = useState(false);
  const [deposit, setDeposit] = useState(0);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [loadingShift, setLoadingShift] = useState(true);

  const searchRef = useRef<HTMLInputElement>(null);

  const checkShift = async () => {
    setLoadingShift(true);
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('status', 'open')
        .order('start_time', { ascending: false })
        .limit(1)
        .single();
      
      if (data) setCurrentShift(data);
    } catch (err) {
      console.error('Error checking shift:', err);
    } finally {
      setLoadingShift(false);
    }
  };

  const fetchData = async () => {
    const [prodRes, custRes, settRes] = await Promise.all([
      supabase.from('productos').select('*').order('name'),
      supabase.from('customers').select('*').order('name'),
      supabase.from('settings').select('*')
    ]);

    if (prodRes.data) setProducts(prodRes.data as Product[]);
    if (custRes.data) setCustomers(custRes.data as Customer[]);
    if (settRes.data) {
      const s: any = {};
      settRes.data.forEach(r => s[r.key] = r.value);
      setSettings(s);
    }
  };

  useEffect(() => {
    checkShift();
    fetchData();
    searchRef.current?.focus();
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product_id === product.id);
    const price = selectedCustomer?.type === 'wholesale' ? product.price_wholesale : product.price_retail;
    
    if (existing) {
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        quantity: 1,
        price: price,
        cost: product.cost
      }]);
    }
    setSearch('');
    searchRef.current?.focus();
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (isLayaway && !selectedCustomer) {
      alert('Los apartados requieren seleccionar un cliente.');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('process_sale', {
        p_user_id: user.id,
        p_customer_id: selectedCustomer?.id || null,
        p_total: total,
        p_subtotal: subtotal,
        p_discount: 0,
        p_payment_method: paymentMethod,
        p_type: isLayaway ? 'layaway' : 'sale',
        p_items: cart.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          quantity: item.quantity,
          price: item.price,
          cost: item.cost
        })),
        p_deposit: isLayaway ? deposit : 0
      });

      if (error) throw error;

      setLastSaleId(data);
      setShowTicket(true);
      setCart([]);
      setSelectedCustomer(null);
      setIsLayaway(false);
      setDeposit(0);
      fetchData(); // Refresh stock
    } catch (err: any) {
      alert('Error al procesar la venta: ' + err.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.includes(search)
  );

  if (loadingShift) return <div className="p-8 text-center">Verificando turno...</div>;

  if (!currentShift) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 text-center p-8">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
          <Clock size={40} />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Turno Cerrado</h2>
          <p className="text-slate-500">No puedes realizar ventas sin un turno abierto. Por favor, abre un turno en el módulo de <strong>Corte de Caja</strong> en el menú lateral.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Product Selection */}
      <div className="lg:col-span-2 flex flex-col space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Escanear código o buscar producto..."
            className="input-field pl-10 h-12 text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredProducts.length === 1) {
                addToCart(filteredProducts[0]);
              }
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">
          {filteredProducts.slice(0, 12).map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="card p-4 text-left hover:border-indigo-500 transition-all group"
            >
              <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform">
                <Package size={32} />
              </div>
              <p className="text-sm font-bold text-slate-900 line-clamp-2 mb-1">{product.name}</p>
              <p className="text-xs text-slate-500 mb-2">{product.brand}</p>
              <div className="flex items-center justify-between">
                <span className="text-indigo-600 font-bold">${product.price_retail}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${product.stock > product.stock_min ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  Stock: {product.stock}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="card flex flex-col h-full">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Carrito</h3>
          <button onClick={() => setCart([])} className="text-xs text-rose-500 font-medium hover:underline">Vaciar</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <ShoppingCart size={48} strokeWidth={1} />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">${item.price} c/u</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => updateQuantity(item.product_id, -1)} className="p-1 hover:bg-slate-100 rounded"><Minus size={14} /></button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, 1)} className="p-1 hover:bg-slate-100 rounded"><Plus size={14} /></button>
                  <button onClick={() => removeFromCart(item.product_id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded ml-2"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User size={16} className="text-slate-400" />
              <select 
                className="flex-1 bg-transparent text-sm outline-none"
                value={selectedCustomer?.id || ''}
                onChange={(e) => setSelectedCustomer(customers.find(c => c.id === Number(e.target.value)) || null)}
              >
                <option value="">Cliente General</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-600 flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  checked={isLayaway}
                  onChange={(e) => setIsLayaway(e.target.checked)}
                />
                Apartado
              </label>
              {isLayaway && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Anticipo:</span>
                  <input 
                    type="number" 
                    className="w-20 px-2 py-1 text-sm border rounded"
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setPaymentMethod('cash')}
              className={`py-2 rounded-lg border text-sm font-medium transition-all ${paymentMethod === 'cash' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              Efectivo
            </button>
            <button 
              onClick={() => setPaymentMethod('card')}
              className={`py-2 rounded-lg border text-sm font-medium transition-all ${paymentMethod === 'card' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              Tarjeta
            </button>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center space-x-2"
          >
            <CreditCard size={20} />
            <span>{isLayaway ? 'Registrar Apartado' : 'Cobrar'}</span>
          </button>
        </div>
      </div>

      {/* Ticket Modal (Hidden, used for printing) */}
      {showTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Printer size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Venta Exitosa</h3>
              <p className="text-sm text-slate-500">Venta #{lastSaleId} registrada correctamente.</p>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => {
                  window.print();
                  setShowTicket(false);
                }}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Printer size={18} />
                <span>Imprimir Ticket</span>
              </button>
              <button 
                onClick={() => setShowTicket(false)}
                className="w-full btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Ticket for Printing */}
      <div id="ticket-print" className="hidden">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg">{settings?.business_name}</h2>
          <p className="text-[10px]">{settings?.business_address}</p>
          <p className="text-[10px]">Tel: {settings?.business_phone}</p>
          <p className="text-[10px]">RFC: {settings?.business_rfc}</p>
        </div>
        <div className="border-t border-b border-black py-2 mb-4 text-[10px]">
          <p>Fecha: {new Date().toLocaleString()}</p>
          <p>Ticket: #{lastSaleId}</p>
          <p>Cajero: {currentShift.user_name}</p>
          <p>Cliente: {selectedCustomer?.name || 'General'}</p>
        </div>
        <table className="w-full text-[10px] mb-4">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left">CANT</th>
              <th className="text-left">DESC</th>
              <th className="text-right">P.U.</th>
              <th className="text-right">IMP</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, i) => (
              <tr key={i}>
                <td>{item.quantity}</td>
                <td>{item.name.substring(0, 15)}</td>
                <td className="text-right">${item.price}</td>
                <td className="text-right">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right text-[10px] space-y-1">
          <p>SUBTOTAL: ${subtotal.toFixed(2)}</p>
          <p className="font-bold">TOTAL: ${total.toFixed(2)}</p>
          {isLayaway && (
            <>
              <p>ANTICIPO: ${deposit.toFixed(2)}</p>
              <p>SALDO: ${(total - deposit).toFixed(2)}</p>
            </>
          )}
        </div>
        <div className="text-center mt-6 text-[10px]">
          <p>{settings?.ticket_footer}</p>
        </div>
      </div>
    </div>
  );
}
