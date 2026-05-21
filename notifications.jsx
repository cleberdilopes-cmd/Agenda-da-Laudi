// notifications.jsx — Alarme, push do navegador e CallMeBot

// ── Alarme fullscreen (toca quando chega a hora) ────────────
function AlarmScreen({ open, event, onDone, onSnooze, fontScale = 1 }) {
  // Toca um bip simples a cada 2s enquanto aberto
  React.useEffect(() => {
    if (!open) return undefined;
    let ctx, timer;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
    const beep = () => {
      if (!ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880;
      g.gain.value = 0.0001;
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      o.start();
      o.stop(ctx.currentTime + 0.42);
    };
    beep();
    timer = setInterval(beep, 1600);
    // Vibração se disponível
    if (navigator.vibrate) navigator.vibrate([300, 200, 300, 200, 600]);
    return () => {
      clearInterval(timer);
      try { ctx.close(); } catch (e) {}
    };
  }, [open]);

  if (!open || !event) return null;

  const meta = window.TYPE_META[event.type];
  const owner = window.OWNERS[event.owner];
  const isMed = event.type === 'remedio';
  const headline = isMed ? 'Hora do remédio!' : 'Hora do compromisso!';

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'linear-gradient(165deg, oklch(0.62 0.21 25), oklch(0.50 0.20 22))',
      display: 'flex', flexDirection: 'column',
      animation: 'bubbleIn 0.25s ease-out',
    }}>
      {/* Pulsing background ring */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 65%)',
        animation: 'pulseRing 1.4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '32px 24px', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(8px)',
          border: '4px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 92,
          marginBottom: 28,
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}>{meta.icon}</div>

        <div style={{
          fontSize: 18 * fontScale, fontWeight: 900, letterSpacing: 2,
          color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase',
          marginBottom: 8,
        }}>⏰ {event.time} • {owner.name}</div>

        <div style={{
          fontSize: 40 * fontScale, fontWeight: 900,
          color: '#fff', lineHeight: 1.1, marginBottom: 14,
        }}>{headline}</div>

        <div style={{
          fontSize: 26 * fontScale, fontWeight: 700,
          color: 'rgba(255,255,255,0.92)', lineHeight: 1.25,
          maxWidth: 340,
        }}>{event.title}</div>
      </div>

      {/* Big action buttons */}
      <div style={{
        padding: '0 22px 36px',
        display: 'flex', flexDirection: 'column', gap: 12,
        position: 'relative', zIndex: 1,
      }}>
        <button onClick={onDone} className="tap" style={{
          width: '100%', minHeight: 80,
          borderRadius: 26,
          background: '#fff',
          color: 'oklch(0.45 0.18 25)',
          fontSize: 26 * fontScale, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M4 12.5l5 5L20 6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{isMed ? 'Já tomei' : 'Já vi, obrigada'}</span>
        </button>
        <button onClick={onSnooze} className="tap" style={{
          width: '100%', minHeight: 64,
          borderRadius: 22,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(255,255,255,0.35)',
          color: '#fff',
          fontSize: 20 * fontScale, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 24 }}>⏰</span>
          <span>Lembrar daqui 10 minutos</span>
        </button>
      </div>
    </div>
  );
}
window.AlarmScreen = AlarmScreen;

// ── Push notification setup ─────────────────────────────────
function getPushPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'granted' | 'denied' | 'default'
}

function showTestNotification() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  try {
    new Notification('🔔 Agenda da Laudi', {
      body: 'As notificações estão funcionando! Você vai receber lembretes dos seus compromissos.',
      icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="%23d97757"/><text x="32" y="44" font-size="34" text-anchor="middle">🔔</text></svg>',
    });
    return true;
  } catch (e) { return false; }
}

function PushSection({ status, onRequest, dark, fontScale }) {
  const isOn = status === 'granted';
  const isDenied = status === 'denied';
  const isUnsupported = status === 'unsupported';

  const stateColor = isOn ? 'var(--green)' : isDenied ? 'var(--terracotta)' : 'var(--orange)';
  const stateLabel = isOn ? 'Ativado'
                   : isDenied ? 'Bloqueado'
                   : isUnsupported ? 'Não disponível'
                   : 'Desativado';

  return (
    <div style={{
      background: dark ? 'rgba(255,255,255,0.05)' : '#fff',
      border: dark ? '1px solid rgba(255,255,255,0.1)' : '1.5px solid var(--line)',
      borderRadius: 22, padding: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 18,
          background: 'oklch(0.93 0.04 235)',
          border: '2px solid var(--blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, flexShrink: 0,
        }}>📲</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 21 * fontScale, fontWeight: 900,
            color: dark ? 'var(--board-chalk)' : 'var(--ink)',
            lineHeight: 1.15,
          }}>Notificações no celular</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 4,
            fontSize: 14 * fontScale, fontWeight: 800,
            color: stateColor,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: stateColor,
            }} />
            {stateLabel}
          </div>
        </div>
      </div>

      <div style={{
        fontSize: 17 * fontScale, fontWeight: 600, lineHeight: 1.4,
        color: dark ? 'rgba(255,255,255,0.75)' : 'var(--ink-soft)',
        marginBottom: 14,
      }}>
        {isOn && 'Você vai receber um aviso no celular quando estiver na hora — mesmo com o app fechado.'}
        {!isOn && !isDenied && !isUnsupported && 'Receba lembretes no celular mesmo com o app fechado. Toque para permitir.'}
        {isDenied && 'As notificações foram bloqueadas. Para liberar, abra as configurações do navegador → Site → Notificações.'}
        {isUnsupported && 'Esse navegador não suporta notificações. Tente abrir no Chrome ou no Edge.'}
      </div>

      <button onClick={onRequest} disabled={isUnsupported || isDenied} className="tap" style={{
        width: '100%', minHeight: 60, borderRadius: 18,
        background: isOn ? 'var(--green)' : 'var(--blue)',
        color: '#fff', fontSize: 18 * fontScale, fontWeight: 900,
        opacity: (isUnsupported || isDenied) ? 0.4 : 1,
        boxShadow: '0 4px 12px oklch(0.70 0.13 235 / 0.3)',
      }}>
        {isOn ? '🔔 Mandar uma notificação de teste' : '📲 Ativar notificações agora'}
      </button>
    </div>
  );
}
window.PushSection = PushSection;
window.getPushPermission = getPushPermission;
window.showTestNotification = showTestNotification;
