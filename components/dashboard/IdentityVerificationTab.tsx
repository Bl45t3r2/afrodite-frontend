'use client';
import { useEffect, useState, useRef } from 'react';
import { ShieldCheck, Upload, Clock, X, CheckCircle, AlertCircle, FileText, Camera, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type VerifStatus = 'none' | 'PENDING' | 'APPROVED' | 'REJECTED';
type DocType = 'CNI' | 'PASSEPORT' | 'PERMIS';

const DOC_TYPES: { value: DocType; label: string; hasBack: boolean }[] = [
  { value: 'CNI', label: "Carte Nationale d'Identité", hasBack: true },
  { value: 'PASSEPORT', label: 'Passeport', hasBack: false },
  { value: 'PERMIS', label: 'Permis de conduire', hasBack: true },
];

function FileDropzone({ label, icon: Icon, file, onChange, accept = 'image/*' }: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      <label
        className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer transition-all p-5 text-center
          ${file ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 bg-gray-50 hover:bg-brand-50/30'}`}
      >
        {file ? (
          <>
            <img src={URL.createObjectURL(file)} alt="" className="w-full h-32 object-cover rounded-xl" />
            <p className="text-xs text-brand-500 font-medium">{file.name}</p>
            <button type="button" onClick={e => { e.preventDefault(); onChange(null); }}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
              <X size={12} />
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Icon size={22} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Cliquez pour sélectionner</p>
            <p className="text-xs text-gray-400">JPG, PNG · Max 10MB</p>
          </>
        )}
        <input ref={inputRef} type="file" accept={accept} className="hidden"
          onChange={e => onChange(e.target.files?.[0] || null)} />
      </label>
    </div>
  );
}

export default function IdentityVerificationTab() {
  const [status, setStatus] = useState<VerifStatus>('none');
  const [verif, setVerif] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [docType, setDocType] = useState<DocType>('CNI');
  const [docFront, setDocFront] = useState<File | null>(null);
  const [docBack, setDocBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  useEffect(() => {
    api.get('/verification/me')
      .then(res => {
        if (res.data) { setVerif(res.data); setStatus(res.data.status); }
        else setStatus('none');
      })
      .catch(() => setStatus('none'))
      .finally(() => setLoading(false));
  }, []);

  const selectedDoc = DOC_TYPES.find(d => d.value === docType)!;
  const canSubmit = docFront && selfie && (!selectedDoc.hasBack || docBack);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('docType', docType);
      form.append('docFront', docFront!);
      if (docBack) form.append('docBack', docBack);
      form.append('selfie', selfie!);

      const res = await api.post('/verification/submit', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setVerif(res.data.verification);
      setStatus('PENDING');
      toast.success('Documents envoyés ! Notre équipe va les examiner.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="card p-8 animate-pulse space-y-4">
      <div className="h-20 bg-gray-100 rounded-2xl" />
      <div className="h-40 bg-gray-100 rounded-2xl" />
    </div>
  );

  // ── Déjà approuvé ──
  if (status === 'APPROVED') return (
    <div className="card p-8 text-center">
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShieldCheck size={36} className="text-emerald-500" />
      </div>
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Identité vérifiée ✅</h2>
      <p className="text-gray-500 mb-4">Votre badge <strong>"Vérifié"</strong> est actif sur votre profil.</p>
      <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-xl text-sm font-medium">
        <CheckCircle size={16} /> Profil certifié — Afrodite
      </div>
    </div>
  );

  // ── En attente ──
  if (status === 'PENDING') return (
    <div className="card p-8 text-center">
      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock size={36} className="text-amber-500" />
      </div>
      <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Documents en cours d'examen</h2>
      <p className="text-gray-500 mb-2">Notre équipe examine vos documents. Délai habituel : <strong>24–48h</strong>.</p>
      <p className="text-sm text-gray-400">Vous recevrez une notification dès que la vérification sera terminée.</p>
      <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-left">
        <p className="text-xs font-semibold text-amber-700 mb-1">Document envoyé</p>
        <p className="text-sm text-amber-600">{DOC_TYPES.find(d => d.value === verif?.docType)?.label || verif?.docType}</p>
        <p className="text-xs text-amber-500 mt-1">Soumis le {new Date(verif?.submittedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-purple-500 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-lg mb-1">Vérification d'identité</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Obtenez le badge <strong className="text-emerald-600">✓ Vérifié</strong> en prouvant votre identité.
              Vos documents sont stockés de façon sécurisée et ne sont jamais partagés publiquement.
            </p>
          </div>
        </div>

        {status === 'REJECTED' && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Vérification refusée</p>
              <p className="text-sm text-red-600 mt-0.5">{verif?.note || 'Vos documents n\'ont pas pu être validés. Veuillez réessayer.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Étapes */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { num: '1', title: 'Pièce d\'identité', desc: 'Recto (+ verso si applicable)', icon: FileText },
          { num: '2', title: 'Selfie', desc: 'Votre visage clairement visible', icon: Camera },
          { num: '3', title: 'Validation', desc: 'Notre équipe vérifie sous 24–48h', icon: ShieldCheck },
        ].map(step => (
          <div key={step.num} className="card p-4 text-center">
            <div className="w-8 h-8 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">
              {step.num}
            </div>
            <p className="text-xs font-semibold text-gray-700">{step.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      <div className="card p-6 space-y-5">
        {/* Type de document */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Type de document</label>
          <div className="relative">
            <select value={docType} onChange={e => setDocType(e.target.value as DocType)} className="input appearance-none pr-8">
              {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Photos du document */}
        <div className={`grid gap-4 ${selectedDoc.hasBack ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <FileDropzone label="Recto du document *" icon={FileText} file={docFront} onChange={setDocFront} />
          {selectedDoc.hasBack && (
            <FileDropzone label="Verso du document *" icon={FileText} file={docBack} onChange={setDocBack} />
          )}
        </div>

        {/* Selfie */}
        <FileDropzone
          label="Selfie — Tenez votre document à côté de votre visage *"
          icon={Camera}
          file={selfie}
          onChange={setSelfie}
        />

        {/* Consignes */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-700 mb-2">📋 Consignes importantes</p>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Le document doit être valide et non expiré</li>
            <li>• Toutes les informations doivent être clairement lisibles</li>
            <li>• Le selfie doit montrer votre visage et le document simultanément</li>
            <li>• Évitez les reflets, flous ou zones coupées</li>
            <li>• Vos documents sont stockés de façon chiffrée et sécurisée</li>
          </ul>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi en cours…</>
            : <><Upload size={16} /> Envoyer pour vérification</>
          }
        </button>
      </div>
    </div>
  );
}
