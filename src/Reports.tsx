import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from 'lucide-react';

export default function Reports() {
  const [period, setPeriod] = useState('month');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
          {['day', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                period === p ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p === 'day' ? 'Hoy' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <Download size={18} />
          <span>Descargar PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2">
            <TrendingUp size={20} className="text-indigo-600" />
            <span>Ventas vs Utilidad</span>
          </h3>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">Gráfico de barras aquí</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2">
            <PieChart size={20} className="text-indigo-600" />
            <span>Ventas por Categoría</span>
          </h3>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">Gráfico de pastel aquí</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h4 className="text-sm font-medium text-slate-500 mb-2">Ticket Promedio</h4>
          <p className="text-2xl font-bold text-slate-900">$452.30</p>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp size={12} className="mr-1" />
            <span>+4.5% vs periodo anterior</span>
          </div>
        </div>
        <div className="card p-6">
          <h4 className="text-sm font-medium text-slate-500 mb-2">Total Tickets</h4>
          <p className="text-2xl font-bold text-slate-900">142</p>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp size={12} className="mr-1" />
            <span>+12.1% vs periodo anterior</span>
          </div>
        </div>
        <div className="card p-6">
          <h4 className="text-sm font-medium text-slate-500 mb-2">Margen de Utilidad</h4>
          <p className="text-2xl font-bold text-slate-900">32.4%</p>
          <div className="mt-4 flex items-center text-xs text-rose-600 font-medium">
            <TrendingUp size={12} className="mr-1 rotate-180" />
            <span>-1.2% vs periodo anterior</span>
          </div>
        </div>
      </div>
    </div>
  );
}
