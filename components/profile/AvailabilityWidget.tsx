'use client';
import { useEffect, useState } from 'react';
import { Clock, CalendarCheck } from 'lucide-react';
import api from '@/lib/api';

const DAYS = [
  { id: 1, label: 'Lundi', short: 'L' },
  { id: 2, label: 'Mardi', short: 'M' },
  { id: 3, label: 'Mercredi', short: 'Me' },
  { id: 4, label: 'Jeudi', short: 'J' },
  { id: 5, label: 'Vendredi', short: 'V' },
  { id: 6, label: 'Samedi', short: 'S' },
  { id: 0, label: 'Dimanche', short: 'D' },
];

function isCurrentlyAvailable(slots: any[]): { available: boolean; label: string } {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Dim
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const todaySlot = slots.find(s => s.dayOfWeek === currentDay && s.isActive);
  if (todaySlot && currentTime >= todaySlot.startTime && currentTime <= todaySlot.endTime) {
    return { available: true, label: `Disponible jusqu'à ${todaySlot.endTime}` };
  }

  // Chercher la prochaine dispo
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const nextSlot = slots.find(s => s.dayOfWeek === nextDay && s.isActive);
    if (nextSlot) {
      const dayLabel = DAYS.find(d => d.id === nextDay)?.label || '';
      return { available: false, label: `Disponible ${i === 1 ? 'demain' : dayLabel} à ${nextSlot.startTime}` };
    }
  }

  return { available: false, label: 'Aucune disponibilité prévue' };
}

export default function AvailabilityWidget({ profileId }: { profileId: string }) {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/availability/${profileId}`)
      .then(res => setSlots(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) return (
    <div className="animate-pulse space-y-2">
      <div className="h-10 bg-gray-100 rounded-xl" />
      <div className="h-20 bg-gray-100 rounded-xl" />
    </div>
  );

  if (slots.length === 0) return null;

  const { available, label } = isCurrentlyAvailable(slots);
  const now = new Date();
  const currentDay = now.getDay();

  return (
    <div className="space-y-3">
      {/* Badge dispo en temps réel */}
      <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium ${
        available
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-gray-50 border-gray-200 text-gray-500'
      }`}>
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${available ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
        <Clock size={14} className="shrink-0" />
        {label}
      </div>

      {/* Grille hebdomadaire */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <CalendarCheck size={14} className="text-brand-400" />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Agenda de la semaine</span>
        </div>

        <div className="space-y-1.5">
          {DAYS.map(day => {
            const slot = slots.find(s => s.dayOfWeek === day.id);
            const isToday = day.id === currentDay;
            const isActive = slot?.isActive;

            return (
              <div key={day.id} className={`flex items-center gap-3 py-1.5 px-2 rounded-lg transition-colors ${isToday ? 'bg-brand-50 border border-brand-100' : ''}`}>
                {/* Jour */}
                <span className={`text-xs font-semibold w-8 shrink-0 ${isToday ? 'text-brand-500' : 'text-gray-400'}`}>
                  {day.short}{isToday && <span className="ml-0.5">•</span>}
                </span>

                {/* Barre ou indisponible */}
                {isActive ? (
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 relative overflow-hidden">
                      {(() => {
                        const startPct = (parseInt(slot.startTime.split(':')[0]) * 60 + parseInt(slot.startTime.split(':')[1])) / (24 * 60) * 100;
                        const endPct = (parseInt(slot.endTime.split(':')[0]) * 60 + parseInt(slot.endTime.split(':')[1])) / (24 * 60) * 100;
                        return (
                          <div
                            className={`absolute top-0 h-full rounded-full ${isToday ? 'bg-brand-400' : 'bg-gray-400'}`}
                            style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                          />
                        );
                      })()}
                    </div>
                    <span className={`text-xs font-mono shrink-0 ${isToday ? 'text-brand-600 font-semibold' : 'text-gray-500'}`}>
                      {slot.startTime}–{slot.endTime}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-300 italic flex-1">Indisponible</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
