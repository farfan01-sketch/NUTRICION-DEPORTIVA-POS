import React, { useState, useEffect } from 'react';
import { Save, Building2, MapPin, Phone, FileText, Percent } from 'lucide-react';
import { Settings as SettingsType } from '../types';
import { supabase } from './lib/supabase';

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase.from('settings').select('*');
        if (error) throw error;
        
        const s: any = {};
        data.forEach(r => s[r.key] = r.value);
        
        const defaultSettings: SettingsType = {
          business_name: s.business_name || '',
          business_address: s.business_address || '',
          business_phone: s.business_phone || '',
          business_rfc: s.business_rfc || '',
          ticket_footer: s.ticket_footer || '',
          wholesale_min_qty: s.wholesale_min_qty || '3'
        };
        setSettings(defaultSettings);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value)
      }));

      const { error } = await supabase.from('settings').upsert(updates);
      if (error) throw error;
      
      alert('Configuración guardada correctamente');
    } catch (err: any) {
      alert('Error al guardar la configuración: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 animate-pulse">Cargando configuración...</div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="card p-8 text-center space-y-4">
        <div className="text-rose-500 font-medium">{error || 'No se pudo cargar la configuración'}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-secondary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <Building2 size={20} className="text-indigo-600" />
            <span>Datos del Negocio</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Comercial</label>
              <input
                type="text"
                className="input-field"
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RFC</label>
              <input
                type="text"
                className="input-field"
                value={settings.business_rfc}
                onChange={(e) => setSettings({ ...settings, business_rfc: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  className="input-field pl-10"
                  value={settings.business_phone}
                  onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                <textarea
                  className="input-field pl-10 h-20 resize-none"
                  value={settings.business_address}
                  onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <FileText size={20} className="text-indigo-600" />
            <span>Configuración de Ticket</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje al pie del ticket</label>
              <textarea
                className="input-field h-24 resize-none"
                value={settings.ticket_footer}
                onChange={(e) => setSettings({ ...settings, ticket_footer: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <Percent size={20} className="text-indigo-600" />
            <span>Reglas de Venta</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mínimo para Mayoreo (unidades)</label>
              <input
                type="number"
                className="input-field"
                value={settings.wholesale_min_qty}
                onChange={(e) => setSettings({ ...settings, wholesale_min_qty: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="btn-primary flex items-center space-x-2 px-8 py-3"
          >
            <Save size={20} />
            <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
