import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  DollarSign, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  ArrowRightLeft,
  Receipt,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { supabase } from './lib/supabase';

interface Shift {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  initial_cash: number;
  final_cash: number | null;
  expected_cash: number | null;
  sales_total: number;
  expenses_total: number;
  status: 'open' | 'closed';
  notes: string | null;
}

export default function ShiftManager() {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [initialCash, setInitialCash] = useState(0);
  const [finalCash, setFinalCash] = useState(0);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const fetchCurrentShift = async () => {
    setLoading(true);
    try {
      const { data: shiftData } = await supabase
        .from('shifts')
        .select('*')
        .eq('status', 'open')
        .order('start_time', { ascending: false })
        .limit(1)
        .single();
      
      setCurrentShift(shiftData);
      
      const { data: historyData } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(20);
      setHistory(historyData || []);

      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, role');
      setUsers(usersData || []);
      if (usersData && usersData.length > 0 && !selectedUserId) {
        setSelectedUserId(usersData[0].id);
      }
    } catch (err) {
      console.error('Error fetching shift:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentShift();
  }, []);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('shifts')
        .insert([{ 
          user_id: selectedUserId, 
          initial_cash: initialCash,
          status: 'open',
          start_time: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      fetchCurrentShift();
      setIsOpening(false);
      setInitialCash(0);
    } catch (err: any) {
      alert('Error al abrir turno: ' + err.message);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShift) return;
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ 
          final_cash: finalCash, 
          notes,
          status: 'closed',
          end_time: new Date().toISOString()
        })
        .eq('id', currentShift.id);
      
      if (error) throw error;
      
      fetchCurrentShift();
      setIsClosing(false);
      setFinalCash(0);
      setNotes('');
      alert('Turno cerrado exitosamente');
    } catch (err: any) {
      alert('Error al cerrar turno: ' + err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando información del turno...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Control de Turnos y Caja</h2>
        {!currentShift ? (
          <button 
            onClick={() => setIsOpening(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Play size={20} />
            <span>Abrir Nuevo Turno</span>
          </button>
        ) : (
          <button 
            onClick={() => {
              setFinalCash(currentShift.initial_cash + currentShift.sales_total - currentShift.expenses_total);
              setIsClosing(true);
            }}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-700 flex items-center space-x-2"
          >
            <Square size={20} />
            <span>Cerrar Turno Actual</span>
          </button>
        )}
      </div>

      {currentShift ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500 font-medium">Estado del Turno</p>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">Abierto</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-slate-700">
                <Clock size={16} className="mr-2 text-slate-400" />
                <span className="text-sm">Iniciado: {new Date(currentShift.start_time).toLocaleString()}</span>
              </div>
              <div className="flex items-center text-slate-700">
                <DollarSign size={16} className="mr-2 text-slate-400" />
                <span className="text-sm">Fondo Inicial: ${currentShift.initial_cash.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-emerald-500">
            <p className="text-sm text-slate-500 font-medium mb-1">Ventas del Turno</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">${currentShift.sales_total.toFixed(2)}</h3>
              <TrendingUp className="text-emerald-500" size={24} />
            </div>
            <p className="text-xs text-slate-400 mt-2">Ingresos netos por ventas</p>
          </div>

          <div className="card p-6 border-l-4 border-rose-500">
            <p className="text-sm text-slate-500 font-medium mb-1">Gastos del Turno</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">${currentShift.expenses_total.toFixed(2)}</h3>
              <TrendingDown className="text-rose-500" size={24} />
            </div>
            <p className="text-xs text-slate-400 mt-2">Egresos registrados en este turno</p>
          </div>

          <div className="md:col-span-3 card p-8 bg-indigo-50 border-indigo-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-indigo-900 font-bold text-lg mb-1">Efectivo Esperado en Caja</h4>
                <p className="text-indigo-600 text-sm">Cálculo: Fondo + Ventas - Gastos</p>
              </div>
              <div className="text-center md:text-right">
                <span className="text-4xl font-black text-indigo-700">
                  ${(currentShift.initial_cash + currentShift.sales_total - currentShift.expenses_total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">No hay un turno activo</h3>
            <p className="text-slate-500">Debes abrir un turno para comenzar a registrar ventas y movimientos de caja.</p>
          </div>
          <button 
            onClick={() => setIsOpening(true)}
            className="btn-primary px-8"
          >
            Abrir Turno Ahora
          </button>
        </div>
      )}

      {/* Historial de Turnos */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Historial de Cortes y Turnos</h3>
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Inicio</th>
                <th className="px-6 py-4 font-semibold">Fin</th>
                <th className="px-6 py-4 font-semibold">Fondo</th>
                <th className="px-6 py-4 font-semibold">Ventas</th>
                <th className="px-6 py-4 font-semibold">Gastos</th>
                <th className="px-6 py-4 font-semibold">Esperado</th>
                <th className="px-6 py-4 font-semibold">Real</th>
                <th className="px-6 py-4 font-semibold">Diferencia</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((s) => {
                const expected = s.initial_cash + s.sales_total - s.expenses_total;
                const diff = s.final_cash !== null ? s.final_cash - expected : null;
                
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors text-sm">
                    <td className="px-6 py-4 text-slate-600">{new Date(s.start_time).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600">{s.end_time ? new Date(s.end_time).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 font-medium">${s.initial_cash.toFixed(2)}</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">${s.sales_total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-rose-600 font-medium">${s.expenses_total.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">${expected.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{s.final_cash !== null ? `$${s.final_cash.toFixed(2)}` : '-'}</td>
                    <td className="px-6 py-4">
                      {diff !== null ? (
                        <span className={`font-bold ${diff === 0 ? 'text-slate-400' : diff > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status === 'open' ? 'Abierto' : 'Cerrado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Abrir Turno */}
      {isOpening && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                <Play size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Abrir Nuevo Turno</h3>
            </div>
            <form onSubmit={handleOpenShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Colaborador / Cajero</label>
                <select 
                  className="input-field"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  required
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fondo Inicial (Efectivo en Caja)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="input-field pl-10 text-lg font-bold"
                    placeholder="0.00"
                    value={initialCash}
                    onChange={(e) => setInitialCash(parseFloat(e.target.value))}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Ingresa la cantidad de efectivo con la que inicias el turno.</p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsOpening(false)} className="flex-1 btn-secondary">Cancelar</button>
                <button type="submit" className="flex-1 btn-primary">Iniciar Turno</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cerrar Turno (Corte) */}
      {isClosing && currentShift && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center">
                <Square size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Corte de Caja / Cerrar Turno</h3>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Fondo Inicial:</span>
                <span className="font-medium text-slate-900">${currentShift.initial_cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ventas (+):</span>
                <span className="font-medium text-emerald-600">+${currentShift.sales_total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Gastos (-):</span>
                <span className="font-medium text-rose-600">-${currentShift.expenses_total.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                <span className="text-slate-700">Efectivo Esperado:</span>
                <span className="text-indigo-600">${(currentShift.initial_cash + currentShift.sales_total - currentShift.expenses_total).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Efectivo Real en Caja (Contado)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="input-field pl-10 text-lg font-bold"
                    placeholder="0.00"
                    value={finalCash}
                    onChange={(e) => setFinalCash(parseFloat(e.target.value))}
                  />
                </div>
                {finalCash !== (currentShift.initial_cash + currentShift.sales_total - currentShift.expenses_total) && (
                  <div className={`mt-2 p-2 rounded text-xs font-medium flex items-center ${
                    finalCash > (currentShift.initial_cash + currentShift.sales_total - currentShift.expenses_total) 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'bg-rose-50 text-rose-700'
                  }`}>
                    <AlertCircle size={14} className="mr-1" />
                    {finalCash > (currentShift.initial_cash + currentShift.sales_total - currentShift.expenses_total) 
                      ? `Sobrante: $${(finalCash - (currentShift.initial_cash + currentShift.sales_total - currentShift.expenses_total)).toFixed(2)}`
                      : `Faltante: $${((currentShift.initial_cash + currentShift.sales_total - currentShift.expenses_total) - finalCash).toFixed(2)}`
                    }
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas del Turno</label>
                <textarea
                  className="input-field h-24 resize-none"
                  placeholder="Observaciones sobre el corte, faltantes, sobrantes, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsClosing(false)} className="flex-1 btn-secondary">Cancelar</button>
                <button type="submit" className="flex-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700">Finalizar Turno</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
