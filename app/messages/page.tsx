'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, MessageCircle, Check, CheckCheck, Search, X, Phone, Video } from 'lucide-react';
import { useVideoCall } from '@/lib/useVideoCall';
import VideoCallModal from '@/components/call/VideoCallModal';
import Link from 'next/link';
import api from '@/lib/api';
import { getSocket } from '@/lib/useSocketNotifications';
import useAuthStore from '@/lib/store';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import toast from 'react-hot-toast';

function MessageTime({ date }: { date: string }) {
  const d = new Date(date);
  if (isToday(d)) return <span>{format(d, 'HH:mm')}</span>;
  if (isYesterday(d)) return <span>Hier {format(d, 'HH:mm')}</span>;
  return <span>{format(d, 'dd/MM HH:mm')}</span>;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-1">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.7s' }} />
        ))}
      </div>
    </div>
  );
}

function Avatar({ profile, size = 10, showOnline = false }: { profile: any; size?: number; showOnline?: boolean }) {
  const photo = profile?.photos?.[0]?.url;
  return (
    <div className="relative shrink-0">
      <div className={`w-${size} h-${size} rounded-full overflow-hidden bg-brand-100 flex items-center justify-center`}>
        {photo
          ? <Image src={photo} alt="" width={size * 4} height={size * 4} className="object-cover w-full h-full" />
          : <span className="text-brand-600 font-semibold text-sm">{profile?.displayName?.[0] || '?'}</span>
        }
      </div>
      {showOnline && profile?.isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
      )}
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();

  // ── WebRTC Video Call ──
  const {
    callState, callType, remoteProfile, setRemoteProfile,
    isMuted, isCameraOff, callDuration, formatDuration,
    localVideoRef, remoteVideoRef,
    startCall, acceptCall, rejectCall, endCall, cancelCall,
    toggleMute, toggleCamera,
  } = useVideoCall();
  const withId = searchParams.get('with');

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(withId);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [quota, setQuota] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/messages/conversations').then(res => setConversations(res.data));
    api.get('/messages/quota').then(res => setQuota(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    api.get(`/messages/${activeConv}`).then(res => {
      setMessages(res.data);
      api.patch(`/messages/${activeConv}/read`).catch(() => {});
      setConversations(prev => prev.map(c => c.other.id === activeConv ? { ...c, unread: 0 } : c));
    });

    const socket = getSocket();
    if (!socket) return;

    socket.emit('join:conversation', activeConv);
    socket.emit('messages:read', { senderId: activeConv });

    const onNewMessage = (msg: any) => {
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
      if (msg.senderId === activeConv) {
        socket.emit('messages:read', { senderId: activeConv });
        api.patch(`/messages/${activeConv}/read`).catch(() => {});
        setConversations(prev => prev.map(c =>
          c.other.id === activeConv ? { ...c, unread: 0, lastMessage: msg } : c
        ));
      } else {
        setConversations(prev => prev.map(c =>
          c.other.id === msg.senderId ? { ...c, unread: (c.unread || 0) + 1, lastMessage: msg } : c
        ));
      }
    };

    const onTypingStart = ({ userId }: any) => { if (userId === activeConv) setIsTyping(true); };
    const onTypingStop = ({ userId }: any) => { if (userId === activeConv) setIsTyping(false); };
    const onMessagesRead = ({ readBy }: any) => {
      if (readBy === activeConv) {
        setMessages(prev => prev.map(m => m.senderId === user?.id ? { ...m, isRead: true } : m));
      }
    };

    socket.on('message:new', onNewMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('messages:read', onMessagesRead);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('messages:read', onMessagesRead);
    };
  }, [activeConv, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || !activeConv || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    const socket = getSocket();
    if (socket) {
      socket.emit('message:send', { receiverId: activeConv, content });
      socket.emit('typing:stop', { receiverId: activeConv });

      // Optimistic update
      const tempMsg = {
        id: `temp-${Date.now()}`,
        senderId: user?.id,
        receiverId: activeConv,
        content,
        isRead: false,
        createdAt: new Date().toISOString(),
        _temp: true,
      };
      setMessages(prev => [...prev, tempMsg]);
      setConversations(prev => prev.map(c =>
        c.other.id === activeConv ? { ...c, lastMessage: tempMsg } : c
      ));
      setQuota((q: any) => q && !q.unlimited ? { ...q, used: q.used + 1, remaining: Math.max(0, q.remaining - 1) } : q);
    } else {
      try {
        const res = await api.post('/messages', { receiverId: activeConv, content });
        setMessages(prev => [...prev, res.data]);
        setQuota((q: any) => q && !q.unlimited ? { ...q, used: q.used + 1, remaining: Math.max(0, q.remaining - 1) } : q);
      } catch (err: any) {
        setInput(content);
        if (err.response?.data?.error === 'daily_limit_reached') {
          toast.error('Limite de 5 messages/jour atteinte. Passez Premium !');
        }
      }
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleTyping = (val: string) => {
    setInput(val);
    const socket = getSocket();
    if (socket && activeConv) {
      socket.emit('typing:start', { receiverId: activeConv });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        socket.emit('typing:stop', { receiverId: activeConv });
      }, 1500);
    }
  };

  const selectConversation = (otherId: string) => {
    setActiveConv(otherId);
    setIsTyping(false);
    setMessages([]);
    setShowSidebar(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const activeProfile = conversations.find(c => c.other.id === activeConv)?.other?.profile;
  const filteredConvs = conversations.filter(c =>
    c.other.profile?.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  // Grouper par date
  const groupedMessages = messages.reduce((groups: any[], msg, i) => {
    const prev = messages[i - 1];
    const showDate = !prev || new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
    if (showDate) groups.push({ type: 'date', date: msg.createdAt, id: `date-${i}` });
    groups.push(msg);
    return groups;
  }, []);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-gray-900">Messages</h1>
          {totalUnread > 0 && (
            <span className="bg-brand-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnread}</span>
          )}
        </div>
      </div>

      <div className="card flex overflow-hidden" style={{ height: '75vh' }}>

        {/* ── Sidebar conversations ── */}
        <div className={`${showSidebar ? 'flex' : 'hidden md:flex'} w-full md:w-72 border-r border-gray-100 flex-col shrink-0`}>
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                Aucune conversation
              </div>
            ) : filteredConvs.map(conv => {
              const isActive = activeConv === conv.other.id;
              const isUnread = conv.unread > 0;
              return (
                <button key={conv.other.id} onClick={() => selectConversation(conv.other.id)}
                  className={`w-full flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${isActive ? 'bg-brand-50 border-l-2 border-l-brand-400' : ''}`}>
                  <Avatar profile={conv.other.profile} size={11} showOnline />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {conv.other.profile?.displayName || 'Utilisateur'}
                      </p>
                      <span className="text-xs text-gray-300 shrink-0 ml-1">
                        {format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate flex items-center gap-1 ${isUnread ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                        {conv.lastMessage.senderId === user?.id && (
                          conv.lastMessage.isRead
                            ? <CheckCheck size={11} className="text-brand-400 shrink-0" />
                            : <Check size={11} className="text-gray-300 shrink-0" />
                        )}
                        {conv.lastMessage.content}
                      </p>
                      {isUnread && (
                        <span className="w-5 h-5 bg-brand-400 text-white rounded-full text-xs flex items-center justify-center shrink-0 font-bold">
                          {conv.unread > 9 ? '9+' : conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Zone de chat ── */}
        <div className={`${!showSidebar ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
          {activeConv ? (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
                <button className="md:hidden text-gray-400 hover:text-gray-600 mr-1" onClick={() => setShowSidebar(true)}>
                  <X size={20} />
                </button>
                <Avatar profile={activeProfile} size={10} showOnline />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{activeProfile?.displayName || 'Utilisateur'}</p>
                  <p className="text-xs">
                    {isTyping ? (
                      <span className="text-brand-400 font-medium italic animate-pulse">✍️ en train d'écrire…</span>
                    ) : activeProfile?.isOnline ? (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" /> En ligne
                      </span>
                    ) : (
                      <span className="text-gray-400">Hors ligne</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => { setRemoteProfile(activeProfile); startCall(activeConv!, activeProfile, 'audio'); }}
                    title="Appel audio"
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-brand-50 hover:text-brand-500 text-gray-500 flex items-center justify-center transition-all">
                    <Phone size={15} />
                  </button>
                  <button
                    onClick={() => { setRemoteProfile(activeProfile); startCall(activeConv!, activeProfile, 'video'); }}
                    title="Appel vidéo"
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-brand-50 hover:text-brand-500 text-gray-500 flex items-center justify-center transition-all">
                    <Video size={15} />
                  </button>
                  <Link href={`/profiles/${activeConv}`}
                    className="text-xs text-brand-400 hover:underline font-medium ml-1">
                    Voir le profil →
                  </Link>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 bg-[#f8f6f9]">
                {groupedMessages.map((item: any) => {
                  if (item.type === 'date') {
                    const d = new Date(item.date);
                    const label = isToday(d) ? 'Aujourd\'hui' : isYesterday(d) ? 'Hier' : format(d, 'dd MMMM yyyy', { locale: fr });
                    return (
                      <div key={item.id} className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-gray-200/70" />
                        <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 font-medium">{label}</span>
                        <div className="flex-1 h-px bg-gray-200/70" />
                      </div>
                    );
                  }

                  const isMe = item.senderId === user?.id;
                  const isTemp = item._temp;

                  return (
                    <div key={item.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && <Avatar profile={activeProfile} size={7} />}
                      <div className={`max-w-xs lg:max-w-md ${isTemp ? 'opacity-70' : ''}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe
                          ? 'bg-brand-400 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                          <p className="leading-relaxed break-words">{item.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] text-gray-400"><MessageTime date={item.createdAt} /></span>
                          {isMe && (
                            <span title={item.isRead ? 'Lu' : 'Envoyé'}>
                              {item.isRead
                                ? <CheckCheck size={12} className="text-brand-400" />
                                : <Check size={12} className="text-gray-300" />
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Quota */}
              {quota && !quota.unlimited && (
                <div className={`px-4 py-2 border-t ${quota.remaining === 0 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className={quota.remaining === 0 ? 'text-red-600 font-medium' : 'text-amber-700'}>
                      {quota.remaining === 0
                        ? '🚫 Limite atteinte — revenez demain ou passez Premium'
                        : `💬 ${quota.remaining} message${quota.remaining > 1 ? 's' : ''} restant${quota.remaining > 1 ? 's' : ''} aujourd'hui`
                      }
                    </span>
                    <Link href="/tarifs" className="text-brand-400 font-semibold hover:underline shrink-0">
                      Premium →
                    </Link>
                  </div>
                  {/* Barre de progression */}
                  <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${quota.remaining === 0 ? 'bg-red-400' : 'bg-amber-400'}`}
                      style={{ width: `${Math.round((quota.used / quota.limit) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-amber-600/70 mt-1">{quota.used}/{quota.limit} messages utilisés</p>
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2 items-center">
                <input ref={inputRef} className="input flex-1 bg-gray-50"
                  placeholder={quota?.remaining === 0 ? 'Limite atteinte pour aujourd\'hui…' : 'Écrire un message…'}
                  value={input}
                  onChange={e => handleTyping(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  disabled={quota?.remaining === 0}
                  maxLength={1000}
                />
                <button onClick={sendMessage} disabled={!input.trim() || sending || quota?.remaining === 0}
                  className="w-10 h-10 bg-brand-400 hover:bg-brand-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all hover:scale-105 shrink-0">
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#f8f6f9]">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <MessageCircle size={36} className="text-brand-300" />
              </div>
              <p className="font-semibold text-gray-600 mb-1">Vos messages</p>
              <p className="text-sm text-center max-w-xs">Sélectionnez une conversation ou envoyez un message depuis un profil.</p>
            </div>
          )}
        </div>
      </div>
      {/* ── Modal d'appel vidéo/audio ── */}
      <VideoCallModal
        callState={callState}
        callType={callType}
        remoteProfile={remoteProfile}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        callDuration={callDuration}
        formatDuration={formatDuration}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
        onCancel={cancelCall}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
      />
    </div>
  );
}