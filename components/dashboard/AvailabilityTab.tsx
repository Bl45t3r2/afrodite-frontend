'use client';
import { useEffect, useState } from 'react';
import { Clock, Save, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const DAYS = [
  { id: 1, label: 'Lundi', short: 'Lun' },
  { id: 2, label: 'Mardi', short: 'Mar' },
  { id: 3, label: 'Mercredi', short: 'Mer' },
  { id: 4, label: 'Jeudi', short: 'Jeu' },
  { id: 5, label: 'Vendredi', short: 'Ven' },
  { id: 6, label: 'Samedi', short: 'Sam' },
  { id: 0, label: 'Dimanche', short: 'Dim' },
];

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

interface Slot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DEFAULT_SLOTS: Slot[] = DAYS.map(d => ({
  dayOfWeek: d.id,
  startTime: '09:00',
  endTime: '21:00',
  isActive: d.id >= 1 && d.id <= 5, // lun-ven actifs par défaut
}));

export default function AvailabilityTab() {
  const [slots, setSlots] = useState<Slot[]>(DEFAULT_SLOTS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/availability/me/slots')
      .then(res => {
        if (res.data.length > 0) {
          // Fusionner avec les defaults (au cas où certains jours manquent)
          const merged = DEFAULT_SLOTS.map(def => {
            const found = res.data.find((s: Slot) => s.dayOfWeek === def.dayOfWeek);
            return found ? { ...def, ...found } : def;
          });
          setSlots(merged);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSlot = (dayOfWeek: number, field: keyof Slot, value: any) => {
    setSlots(prev => prev.map(s =>
      s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
    ));
  };

  const toggleAll = (active: boolean) => {
    setSlots(prev => prev.map(s => ({ ...s, isActive: active })));
  };

  const applyToAll = (sourceDay: number) => {
    const source = slots.find(s => s.dayOfWeek === sourceDay);
    if (!source) return;
    setSlots(prev => prev.map(s => ({
      ...s,
      startTime: source.startTime,
      endTime: source.endTime,
    })));
    toast.success('Horaires appliqués à tous les jours');
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/availability/me', { slots });
      toast.success('Agenda sauvegardé !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = slots.filter(s => s.isActive).length;

  if (loading) {
    return (
      <div className="card p-8 space-y-4 animate-pulse">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={18} className="text-brand-400" />
              <h2 className="font-semibold text-gray-900">Mes disponibilités</h2>
            </div>
            <p className="text-sm text-gray-400">
              Définissez vos horaires pour que les visiteurs sachent quand vous contacter.
              <span className="ml-2 text-brand-400 font-medium">{activeCount} jour{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}</span>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => toggleAll(true)} className="text-xs text-gray-500 hover:text-brand-500 border border-gray-200 hover:border-brand-300 px-3 py-1.5 rounded-lg transition-all">
              Tout activer
            </button>
            <button onClick={() => toggleAll(false)} className="text-xs text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all">
              Tout désactiver
            </button>
          </div>
        </div>

        {/* Aperçu hebdo visuel */}
        <div className="flex gap-1.5 mb-2">
          {DAYS.map(d => {
            const slot = slots.find(s => s.dayOfWeek === d.id);
            return (
              <div key={d.id} className="flex-1 text-center">
                <div className={`h-1.5 rounded-full mb-1 transition-colors ${slot?.isActive ? 'bg-brand-400' : 'bg-gray-200'}`} />
                <span className="text-[10px] text-gray-400">{d.short}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Créneaux par jour */}
      <div className="card divide-y divide-gray-50 overflow-hidden">
        {DAYS.map((day, index) => {
          const slot = slots.find(s => s.dayOfWeek === day.id)!;
          const isWeekend = day.id === 0 || day.id === 6;

          return (
            <div key={day.id} className={`p-4 flex items-center gap-4 transition-colors ${slot.isActive ? 'bg-white' : 'bg-gray-50'}`}>
              {/* Toggle + Jour */}
              <div className="w-28 shrink-0">
                <button
                  onClick={() => updateSlot(day.id, 'isActive', !slot.isActive)}
                  className="flex items-center gap-2 group"
                >
                  {slot.isActive
                    ? <ToggleRight size={22} className="text-brand-400 transition-transform group-hover:scale-110" />
                    : <ToggleLeft size={22} className="text-gray-300 transition-transform group-hover:scale-110" />
                  }
                  <span className={`text-sm font-medium transition-colors ${slot.isActive ? 'text-gray-900' : 'text-gray-400'} ${isWeekend ? 'text-brand-500' : ''}`}>
                    {day.label}
                  </span>
                </button>
              </div>

              {/* Horaires */}
              {slot.isActive ? (
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  <Clock size={14} className="text-gray-400 shrink-0" />
                  <select
                    value={slot.startTime}
                    onChange={e => updateSlot(day.id, 'startTime', e.target.value)}
                    className="input py-1.5 text-sm w-24"
                  >
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="text-gray-400 text-sm">→</span>
                  <select
                    value={slot.endTime}
                    onChange={e => updateSlot(day.id, 'endTime', e.target.value)}
                    className="input py-1.5 text-sm w-24"
                  >
                    {TIME_SLOTS.filter(t => t > slot.startTime).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => applyToAll(day.id)}
                    className="text-xs text-gray-400 hover:text-brand-500 ml-1 transition-colors whitespace-nowrap"
                    title="Appliquer ces horaires à tous les jours"
                  >
                    Copier sur tous
                  </button>
                </div>
              ) : (
                <span className="text-sm text-gray-300 italic flex-1">Indisponible</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bouton sauvegarder */}
      <button
        onClick={save}
        disabled={saving}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2"
      >
        <Save size={16} />
        {saving ? 'Sauvegarde…' : 'Sauvegarder mon agenda'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Vos disponibilités sont affichées publiquement sur votre profil.
      </p>
    </div>
  );
}
