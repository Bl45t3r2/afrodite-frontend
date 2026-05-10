'use client';
import { useState } from 'react';
import { Lock, Trash2, Eye, EyeOff, ShieldAlert, LogOut } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/lib/store';

function PasswordInput({ label, value, onChange, placeholder }: any) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="input pr-10"
        />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function SecurityTab() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const strength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400'];

  const handleChangePassword = async () => {
    if (!current || !next) { toast.error('Remplissez tous les champs'); return; }
    if (next !== confirm) { toast.error('Les mots de passe ne correspondent pas'); return; }
    if (next.length < 8) { toast.error('Minimum 8 caractères'); return; }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: current, newPassword: next });
      toast.success('Mot de passe mis à jour ✅');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletePassword) { toast.error('Entrez votre mot de passe'); return; }
    setDeleting(true);
    try {
      await api.delete('/auth/account', { data: { password: deletePassword } });
      toast.success('Compte supprimé');
      logout();
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Mot de passe incorrect');
    } finally { setDeleting(false); }
  };

  const s = strength(next);

  return (
    <div className="space-y-6">

      {/* Changer le mot de passe */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={18} className="text-brand-400" />
          <h3 className="font-semibold text-gray-900">Changer le mot de passe</h3>
        </div>

        <PasswordInput label="Mot de passe actuel" value={current} onChange={setCurrent} placeholder="••••••••" />
        <PasswordInput label="Nouveau mot de passe" value={next} onChange={setNext} placeholder="Au moins 8 caractères" />

        {next && (
          <div>
            <div className="flex gap-1 mb-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= s ? strengthColor[s] : 'bg-gray-100'}`} />
              ))}
            </div>
            <p className={`text-xs font-medium ${s <= 1 ? 'text-red-500' : s === 2 ? 'text-amber-500' : s === 3 ? 'text-blue-500' : 'text-emerald-500'}`}>
              {strengthLabel[s]}
            </p>
          </div>
        )}

        <PasswordInput label="Confirmer le nouveau mot de passe" value={confirm} onChange={setConfirm} placeholder="••••••••" />

        {confirm && next !== confirm && (
          <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
        )}

        <button onClick={handleChangePassword} disabled={saving || (!!confirm && next !== confirm)}
          className="btn-primary w-full py-3 disabled:opacity-50">
          {saving ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
        </button>
      </div>

      {/* Sessions actives */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={18} className="text-brand-400" />
          <h3 className="font-semibold text-gray-900">Sécurité du compte</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Session actuelle</p>
              <p className="text-xs text-gray-400">Connecté depuis ce navigateur</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-600 font-medium px-2.5 py-1 rounded-full">Active</span>
          </div>
          <button onClick={() => { logout(); router.push('/auth/login'); }}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <LogOut size={15} /> Se déconnecter
          </button>
        </div>
      </div>

      {/* Zone dangereuse */}
      <div className="card p-6 border-red-100">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={18} className="text-red-400" />
          <h3 className="font-semibold text-red-600">Zone dangereuse</h3>
        </div>

        {!deleteConfirm ? (
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium mb-1">Supprimer mon compte</p>
            <p className="text-xs text-red-500 mb-3">
              Cette action est irréversible. Toutes vos données seront définitivement supprimées : profil, photos, messages, avis.
            </p>
            <button onClick={() => setDeleteConfirm(true)}
              className="text-sm text-red-600 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors font-medium">
              Supprimer mon compte
            </button>
          </div>
        ) : (
          <div className="bg-red-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-red-700">⚠️ Confirmation requise</p>
            <p className="text-xs text-red-600">Entrez votre mot de passe pour confirmer la suppression définitive :</p>
            <PasswordInput label="" value={deletePassword} onChange={setDeletePassword} placeholder="Votre mot de passe" />
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(false)}
                className="flex-1 text-sm border border-gray-200 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleting || !deletePassword}
                className="flex-1 text-sm bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-xl transition-colors disabled:opacity-50">
                {deleting ? 'Suppression…' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
