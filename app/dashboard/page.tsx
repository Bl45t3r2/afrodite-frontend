python3 << 'EOF'
content = open('app/dashboard/page.tsx', encoding='utf-8').read()

old_header = '''      {/* Header v2 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white font-display text-xl font-bold">
              {user?.profile?.displayName?.[0] || '?'}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-bold text-gray-900 truncate">{user?.profile?.displayName || 'Mon espace'}</h1>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <PushNotifToggle />
        </div>
        <div className="flex gap-2">
          <button onClick={toggleOnline} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border-2 font-medium text-sm transition-all ${isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
            {isOnline ? 'Disponible' : 'Indisponible'}
          </button>
          <Link href="/dashboard/boost" className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold py-2 rounded-xl text-sm hover:opacity-90">
            <Zap size={14} /> Booster
          </Link>
        </div>
      </div>'''

new_header = '''      {/* Header v2 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white font-display text-xl font-bold">
              {user?.profile?.displayName?.[0] || '?'}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-bold text-gray-900 truncate">{user?.profile?.displayName || 'Mon espace'}</h1>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <PushNotifToggle />
        </div>
        <div className="flex gap-2">
          <button onClick={toggleOnline} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border-2 font-medium text-sm transition-all ${isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
            {isOnline ? 'Disponible' : 'Indisponible'}
          </button>
          <Link href="/dashboard/boost" className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold py-2 rounded-xl text-sm hover:opacity-90">
            <Zap size={14} /> Booster
          </Link>
        </div>
      </div>'''

if old_header in content:
    content = content.replace(old_header, new_header)
    open('app/dashboard/page.tsx', 'w', encoding='utf-8').write(content)
    print('✅ Header corrigé')
else:
    print('❌ Pattern non trouvé')
EOF
