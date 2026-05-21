// alerts.jsx — Sistema de avisos em camadas: alarme na tela, push, WhatsApp (CallMeBot)

// ── Som de alarme (sintetizado, sem asset) ──────────────────
function playAlarmTone() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const t0 = ctx.currentTime;
    // 3 bipes acolhedores em terça maior
    [0, 0.35, 0.7].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = [659, 784, 988][i]; // E5, G5, B5
      gain.gain.setValueAtTime(0, t0 + delay);
      gain.gain.linearRampToValueAtTime(0.25, t0 + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + delay + 0.28);
      osc.start(t0 + delay);
      osc.stop(t0 + delay + 0.3);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch (e) {}
}
window.playAlarmTone = playAlarmTone;

// ── Big in-app alarm overlay ────────────────────────────────
function AlarmOverlay({ alert, onSnooze, onDone, dark, fontScale = 1 }) {
  React.useEffect(() => {
    if (!alert) return;
    playAlarmTone();
    // Read message aloud
    setTimeout(() => {
      window.VoiceSpeaker?.speak(alert.spoken || alert.title, { rate: 0.88 });
    }, 700);
    return () => window.VoiceSpeaker?.cancel();
  }, [alert]);

  if (!alert) return null;
  const meta = window.TYPE_META[alert.type] || window.TYPE_META.outro;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: `linear-gradient(180deg, ${meta.accent}, ${meta.ink})`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 28, color: '#fff', textAlign: 'center',
      animation: 'bubbleIn 0.25s ease-out',
    }}>
      {/* Pulsing icon */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{
          position: 'absolute', inset: -20, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          animation: 'pulseRing 1.4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'relative',
          width: 156, height: 156, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          border: '4px solid rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 80,
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
        }}>{meta.icon}</div>
      </div>

      <div style={{
        fontSize: 18 * fontScale, fontWeight: 900, letterSpacing: 1.5,
        opacity: 0.85, textTransform: 'uppercase', marginBottom: 12,
      }}>
        🔔 Hora de
      </div>
      <div style={{
        fontSize: 34 * fontScale, fontWeight: 900, lineHeight: 1.15,
        marginBottom: 8, maxWidth: 340,
      }}>{alert.title}</div>
      <div style={{
        fontSize: 22 * fontScale, fontWeight: 700, opacity: 0.85,
        marginBottom: 32,
      }}>{alert.timeLabel}</div>

      <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={onDone} className="tap" style={{
          minHeight: 76,
          borderRadius: 22,
          background: '#fff',
          color: 'var(--ink)',
          fontSize: 22 * fontScale, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
        }}>
          <span style={{ fontSize: 28 }}>✓</span>
          <span>Já fiz</span>
        </button>
        <button onClick={onSnooze} className="tap" style={{
          minHeight: 64,
          borderRadius: 20,
          background: 'rgba(255,255,255,0.18)',
          border: '2px solid rgba(255,255,255,0.4)',
          color: '#fff',
          fontSize: 18 * fontScale, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 22 }}>⏰</span>
          <span>Lembrar de novo em 5 min</span>
        </button>
      </div>
    </div>
  );
}
window.AlarmOverlay = AlarmOverlay;

// ── Camada 2: Push Notifications ────────────────────────────
const Push = {
  supported: 'Notification' in window,
  get permission() {
    return this.supported ? Notification.permission : 'unsupported';
  },
  async request() {
    if (!this.supported) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied')  return 'denied';
    try {
      return await Notification.requestPermission();
    } catch (e) {
      return 'denied';
    }
  },
  send(title, body, opts = {}) {
    if (this.permission !== 'granted') return false;
    try {
      const n = new Notification(title, {
        body, icon: opts.icon, badge: opts.badge,
        tag: opts.tag, requireInteraction: opts.urgent,
        vibrate: opts.urgent ? [300, 150, 300] : [200],
      });
      n.onclick = () => { window.focus(); n.close(); opts.onClick?.(); };
      return true;
    } catch (e) { return false; }
  },
};
window.Push = Push;

// ── Camada 3: CallMeBot (WhatsApp) — simulação no protótipo ─
const CallMeBot = {
  log: [],
  listeners: new Set(),
  // Em produção: fetch real pra CallMeBot
  async send(contact, text) {
    // Usa o telefone padrão configurado se o contato não tiver número próprio do bot
    const phone = (window.CONFIG?.callmebot?.phone) || contact.phone.replace(/\D/g, '');
    const apikey = (contact.callmebotKey) || (window.CONFIG?.callmebot?.apikey) || 'XXXXXX';
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${apikey}`;

    const entry = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      contactId: contact.id,
      contactName: contact.name,
      contactPhone: phone,
      text,
      at: new Date(),
      url,
      sent: false,
    };
    this.log = [entry, ...this.log].slice(0, 50);
    this.listeners.forEach(fn => fn(this.log));

    // Dispara no-cors (browser não consegue ler resposta, mas a requisição vai)
    try {
      await fetch(url, { mode: 'no-cors' });
      entry.sent = true;
      this.listeners.forEach(fn => fn(this.log));
    } catch (e) {
      console.warn('CallMeBot send failed:', e);
    }
    return entry;
  },
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },
};
window.CallMeBot = CallMeBot;

// Hook para consumir log do CallMeBot
function useCallMeBotLog() {
  const [log, setLog] = React.useState(CallMeBot.log);
  React.useEffect(() => CallMeBot.subscribe(setLog), []);
  return log;
}
window.useCallMeBotLog = useCallMeBotLog;

// ── Toast pequeno "Enviado pra família" ────────────────────
function NotificationToast({ entry, onClose }) {
  React.useEffect(() => {
    if (!entry) return;
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [entry, onClose]);

  if (!entry) return null;
  return (
    <div style={{
      position: 'absolute',
      bottom: 110, left: '50%', transform: 'translateX(-50%)',
      zIndex: 150,
      background: 'oklch(0.27 0.018 50)',
      color: '#fff',
      borderRadius: 20,
      padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
      maxWidth: 360, width: 'calc(100% - 36px)',
      animation: 'bubbleIn 0.25s ease-out',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'oklch(0.62 0.18 145)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>💬</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          WhatsApp enviado
        </div>
        <div style={{
          fontSize: 16, fontWeight: 800, lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {entry.contactName}: {entry.text}
        </div>
      </div>
    </div>
  );
}
window.NotificationToast = NotificationToast;
