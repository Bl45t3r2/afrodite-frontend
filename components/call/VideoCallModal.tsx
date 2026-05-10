'use client';
import {
  Phone, PhoneOff, PhoneMissed,
  Video, VideoOff, Mic, MicOff,
} from 'lucide-react';
import type { CallState, CallType } from '@/lib/useVideoCall';

interface Props {
  callState: CallState;
  callType: CallType;
  remoteProfile: any;
  isMuted: boolean;
  isCameraOff: boolean;
  callDuration: number;
  formatDuration: (s: number) => string;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onCancel: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export default function VideoCallModal({
  callState, callType, remoteProfile,
  isMuted, isCameraOff, callDuration, formatDuration,
  localVideoRef, remoteVideoRef,
  onAccept, onReject, onEnd, onCancel,
  onToggleMute, onToggleCamera,
}: Props) {
  if (callState === 'idle' || callState === 'ended') return null;

  const displayName = remoteProfile?.displayName || 'Utilisateur';
  const avatar = remoteProfile?.photos?.[0]?.url;

  // Appel entrant
  if (callState === 'incoming') {
    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-[#1a0f1e] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <div className="relative h-52 flex items-center justify-center bg-gradient-to-br from-brand-900/60 to-purple-900/60 overflow-hidden">
            {[1,2,3].map(i => (
              <div key={i} className="absolute rounded-full border border-brand-400/30 animate-ping"
                style={{ width: `${i*80}px`, height: `${i*80}px`, animationDelay: `${i*0.4}s`, animationDuration: '2s' }} />
            ))}
            {avatar
              ? <img src={avatar} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-white/20 relative z-10" />
              : <div className="w-24 h-24 rounded-full bg-brand-400/30 border-4 border-white/20 flex items-center justify-center relative z-10">
                  <span className="text-4xl font-bold text-white">{displayName[0]}</span>
                </div>
            }
          </div>
          <div className="px-6 py-5 text-center">
            <p className="text-white/60 text-sm mb-1">{callType === 'video' ? '📹 Appel vidéo entrant' : '📞 Appel audio entrant'}</p>
            <h2 className="text-white text-xl font-bold mb-6">{displayName}</h2>
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <button onClick={onReject} className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-red-500/40">
                  <PhoneMissed size={26} className="text-white" />
                </button>
                <span className="text-white/50 text-xs">Refuser</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button onClick={onAccept} className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-emerald-500/40 animate-bounce">
                  <Phone size={26} className="text-white" />
                </button>
                <span className="text-white/50 text-xs">Accepter</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // En train d'appeler
  if (callState === 'calling') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="relative mx-auto mb-6 w-28 h-28">
            {[1,2,3].map(i => (
              <div key={i} className="absolute inset-0 rounded-full border-2 border-brand-400/40 animate-ping"
                style={{ animationDelay: `${i*0.5}s`, animationDuration: '2s' }} />
            ))}
            {avatar
              ? <img src={avatar} alt="" className="w-28 h-28 rounded-full object-cover border-4 border-brand-400/50" />
              : <div className="w-28 h-28 rounded-full bg-brand-400/20 border-4 border-brand-400/50 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">{displayName[0]}</span>
                </div>
            }
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">{displayName}</h2>
          <p className="text-white/50 text-sm mb-10 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            {callType === 'video' ? 'Appel vidéo…' : 'Appel audio…'}
          </p>
          <button onClick={onCancel} className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center mx-auto transition-all hover:scale-110 shadow-lg shadow-red-500/40">
            <PhoneOff size={26} className="text-white" />
          </button>
          <p className="text-white/30 text-xs mt-3">Annuler</p>
        </div>
      </div>
    );
  }

  // Appel connecté
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex-1 relative bg-[#0d0810]">
        {callType === 'video'
          ? <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a0f1e] to-[#0d0810]">
              {[1,2,3].map(i => (
                <div key={i} className="absolute rounded-full border border-brand-400/20 animate-pulse"
                  style={{ width: `${i*120}px`, height: `${i*120}px`, animationDelay: `${i*0.4}s` }} />
              ))}
              {avatar
                ? <img src={avatar} alt="" className="w-36 h-36 rounded-full object-cover border-4 border-white/20 relative z-10 mb-4" />
                : <div className="w-36 h-36 rounded-full bg-brand-400/20 flex items-center justify-center border-4 border-white/20 relative z-10 mb-4">
                    <span className="text-6xl font-bold text-white">{displayName[0]}</span>
                  </div>
              }
              <h2 className="text-white text-2xl font-bold relative z-10">{displayName}</h2>
            </div>
          )
        }

        {/* Header durée */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex items-center gap-3">
          {avatar
            ? <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-white/30" />
            : <div className="w-9 h-9 rounded-full bg-brand-400/40 flex items-center justify-center"><span className="text-white font-bold text-sm">{displayName[0]}</span></div>
          }
          <div>
            <p className="text-white font-semibold text-sm">{displayName}</p>
            <p className="text-emerald-400 text-xs font-mono">{formatDuration(callDuration)}</p>
          </div>
        </div>

        {/* PiP vidéo locale */}
        {callType === 'video' && (
          <div className="absolute bottom-24 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-gray-900">
            <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isCameraOff ? 'opacity-0' : ''}`} />
            {isCameraOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <VideoOff size={20} className="text-white/40" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div className="bg-black/90 px-6 py-5 flex items-center justify-center gap-5">
        <div className="flex flex-col items-center gap-1.5">
          <button onClick={onToggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 ${isMuted ? 'bg-white/20 border border-white/30' : 'bg-white/10 border border-white/10'}`}>
            {isMuted ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
          </button>
          <span className="text-white/40 text-[10px]">{isMuted ? 'Activer' : 'Mute'}</span>
        </div>

        {callType === 'video' && (
          <div className="flex flex-col items-center gap-1.5">
            <button onClick={onToggleCamera}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 ${isCameraOff ? 'bg-white/20 border border-white/30' : 'bg-white/10 border border-white/10'}`}>
              {isCameraOff ? <VideoOff size={22} className="text-white" /> : <Video size={22} className="text-white" />}
            </button>
            <span className="text-white/40 text-[10px]">{isCameraOff ? 'Activer' : 'Caméra'}</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-1.5">
          <button onClick={onEnd}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-red-500/40">
            <PhoneOff size={26} className="text-white" />
          </button>
          <span className="text-white/40 text-[10px]">Raccrocher</span>
        </div>
      </div>
    </div>
  );
}
