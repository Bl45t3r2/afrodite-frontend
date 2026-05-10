'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '@/lib/useSocketNotifications';

export type CallState =
  | 'idle'
  | 'calling'      // on a initié l'appel, on attend
  | 'incoming'     // on reçoit un appel
  | 'connected'    // appel en cours
  | 'ended';

export type CallType = 'video' | 'audio';

interface UseVideoCallOptions {
  onCallEnded?: () => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useVideoCall({ onCallEnded }: UseVideoCallOptions = {}) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callType, setCallType] = useState<CallType>('video');
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);
  const [remoteProfile, setRemoteProfile] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingOffer = useRef<RTCSessionDescriptionInit | null>(null);
  const callTimerRef = useRef<any>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // ── Utilitaires ──

  const startTimer = useCallback(() => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration(d => d + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  const formatDuration = useCallback((secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    pendingOffer.current = null;
    stopTimer();
    setCallState('idle');
    setRemoteUserId(null);
    setRemoteProfile(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setCallDuration(0);
  }, [stopTimer]);

  const getLocalStream = useCallback(async (type: CallType) => {
    const constraints = type === 'video'
      ? { video: { width: 1280, height: 720, facingMode: 'user' }, audio: true }
      : { video: false, audio: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, []);

  const createPeerConnection = useCallback((targetUserId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Candidats ICE → envoyer via socket
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        const socket = getSocket();
        socket?.emit('call:ice-candidate', {
          receiverId: targetUserId,
          candidate: e.candidate,
        });
      }
    };

    // Stream distant reçu
    pc.ontrack = (e) => {
      remoteStreamRef.current = e.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        cleanup();
        onCallEnded?.();
      }
    };

    return pc;
  }, [cleanup, onCallEnded]);

  // ── Initier un appel ──
  const startCall = useCallback(async (
    targetUserId: string,
    profile: any,
    type: CallType = 'video'
  ) => {
    const socket = getSocket();
    if (!socket) return;

    try {
      setCallType(type);
      setRemoteUserId(targetUserId);
      setRemoteProfile(profile);
      setCallState('calling');

      const stream = await getLocalStream(type);
      const pc = createPeerConnection(targetUserId);

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call:offer', { receiverId: targetUserId, offer, callType: type });
    } catch (err) {
      console.error('startCall error:', err);
      cleanup();
    }
  }, [getLocalStream, createPeerConnection, cleanup]);

  // ── Accepter un appel entrant ──
  const acceptCall = useCallback(async () => {
    const socket = getSocket();
    if (!socket || !remoteUserId || !pendingOffer.current) return;

    try {
      const stream = await getLocalStream(callType);
      const pc = createPeerConnection(remoteUserId);

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer.current));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('call:answer', { callerId: remoteUserId, answer });

      setCallState('connected');
      startTimer();
    } catch (err) {
      console.error('acceptCall error:', err);
      cleanup();
    }
  }, [remoteUserId, callType, getLocalStream, createPeerConnection, startTimer, cleanup]);

  // ── Refuser un appel ──
  const rejectCall = useCallback(() => {
    const socket = getSocket();
    if (remoteUserId) socket?.emit('call:reject', { callerId: remoteUserId });
    cleanup();
  }, [remoteUserId, cleanup]);

  // ── Raccrocher ──
  const endCall = useCallback(() => {
    const socket = getSocket();
    if (remoteUserId) socket?.emit('call:end', { receiverId: remoteUserId });
    cleanup();
    onCallEnded?.();
  }, [remoteUserId, cleanup, onCallEnded]);

  // ── Annuler avant réponse ──
  const cancelCall = useCallback(() => {
    const socket = getSocket();
    if (remoteUserId) socket?.emit('call:cancel', { receiverId: remoteUserId });
    cleanup();
  }, [remoteUserId, cleanup]);

  // ── Mute / Caméra ──
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(m => !m);
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsCameraOff(c => !c);
  }, []);

  // ── Écouter les événements socket WebRTC ──
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onIncoming = ({ callerId, offer, callType: type }: any) => {
      if (callState !== 'idle') {
        socket.emit('call:reject', { callerId });
        return;
      }
      pendingOffer.current = offer;
      setRemoteUserId(callerId);
      setCallType(type || 'video');
      setCallState('incoming');
    };

    const onAnswered = async ({ answer }: any) => {
      try {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
        setCallState('connected');
        startTimer();
      } catch (err) {
        console.error('onAnswered error:', err);
      }
    };

    const onIceCandidate = async ({ candidate }: any) => {
      try {
        if (pcRef.current && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch {}
    };

    const onRejected = () => {
      cleanup();
    };

    const onEnded = () => {
      cleanup();
      onCallEnded?.();
    };

    const onCancelled = () => {
      cleanup();
    };

    socket.on('call:incoming', onIncoming);
    socket.on('call:answered', onAnswered);
    socket.on('call:ice-candidate', onIceCandidate);
    socket.on('call:rejected', onRejected);
    socket.on('call:ended', onEnded);
    socket.on('call:cancelled', onCancelled);

    return () => {
      socket.off('call:incoming', onIncoming);
      socket.off('call:answered', onAnswered);
      socket.off('call:ice-candidate', onIceCandidate);
      socket.off('call:rejected', onRejected);
      socket.off('call:ended', onEnded);
      socket.off('call:cancelled', onCancelled);
    };
  }, [callState, startTimer, cleanup, onCallEnded]);

  return {
    callState,
    callType,
    remoteUserId,
    remoteProfile,
    setRemoteProfile,
    isMuted,
    isCameraOff,
    callDuration,
    formatDuration,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    cancelCall,
    toggleMute,
    toggleCamera,
  };
}
