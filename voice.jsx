// voice.jsx — Web Speech (TTS + STT) em português

// ── Text-to-speech ──────────────────────────────────────────
const VoiceSpeaker = {
  speaking: null,
  cancel() {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    this.speaking = null;
  },
  speak(text, opts = {}) {
    if (!('speechSynthesis' in window)) return;
    this.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = opts.rate ?? 0.92;   // um pouquinho mais devagar
    u.pitch = opts.pitch ?? 1.0;
    u.volume = 1;
    // Tenta pegar uma voz brasileira de verdade
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => /pt-?br/i.test(v.lang)) || voices.find(v => /^pt/i.test(v.lang));
    if (ptVoice) u.voice = ptVoice;
    u.onstart = () => { this.speaking = text; opts.onStart?.(); };
    u.onend = () => { this.speaking = null; opts.onEnd?.(); };
    u.onerror = () => { this.speaking = null; opts.onEnd?.(); };
    window.speechSynthesis.speak(u);
  },
  isSpeaking(text) {
    return this.speaking === text;
  },
};
window.VoiceSpeaker = VoiceSpeaker;

// Hook: estado "tocando agora" pra um texto específico
function useSpeaking(text) {
  const [playing, setPlaying] = React.useState(false);
  const toggle = React.useCallback(() => {
    if (playing) {
      VoiceSpeaker.cancel();
      setPlaying(false);
    } else {
      VoiceSpeaker.speak(text, {
        onStart: () => setPlaying(true),
        onEnd: () => setPlaying(false),
      });
    }
  }, [text, playing]);
  // Quando o texto mudar e estava tocando, para
  React.useEffect(() => () => {
    if (playing) VoiceSpeaker.cancel();
  }, []); // eslint-disable-line
  return [playing, toggle];
}
window.useSpeaking = useSpeaking;

// ── Speak button (alto-falante) ─────────────────────────────
function SpeakButton({ text, size = 44, dark, color, label = 'Ler em voz alta' }) {
  const [playing, toggle] = useSpeaking(text);
  const accent = color || (dark ? 'oklch(0.78 0.13 235)' : 'var(--blue-ink)');
  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      aria-label={label}
      title={label}
      className="tap"
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: playing ? accent : (dark ? 'rgba(255,255,255,0.08)' : '#fff'),
        border: playing ? 'none' : `2px solid ${accent}`,
        color: playing ? '#fff' : accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        animation: playing ? 'pulseRing 1.6s ease-in-out infinite' : 'none',
      }}>
      {playing ? (
        <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1"/>
          <rect x="14" y="5" width="4" height="14" rx="1"/>
        </svg>
      ) : (
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/>
          <path d="M16 8c1.5 1 2.5 2.5 2.5 4s-1 3-2.5 4"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
      )}
    </button>
  );
}
window.SpeakButton = SpeakButton;

// ── Speech-to-text (microfone) ──────────────────────────────
const VoiceRecognizer = (() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return { supported: false };
  return {
    supported: true,
    start(onResult, onEnd, onError) {
      const rec = new SR();
      rec.lang = 'pt-BR';
      rec.interimResults = true;
      rec.continuous = false;
      rec.onresult = (e) => {
        let final = '', interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) final += r[0].transcript;
          else interim += r[0].transcript;
        }
        onResult(final, interim);
      };
      rec.onend = () => onEnd?.();
      rec.onerror = (e) => onError?.(e.error);
      try { rec.start(); } catch (e) { onError?.(e.message); }
      return rec;
    },
  };
})();
window.VoiceRecognizer = VoiceRecognizer;

// Hook: estado de gravação + texto reconhecido em tempo real
function useMicrophone({ onFinal }) {
  const [recording, setRecording] = React.useState(false);
  const [interim, setInterim] = React.useState('');
  const [error, setError] = React.useState(null);
  const recRef = React.useRef(null);

  const start = React.useCallback(() => {
    if (!VoiceRecognizer.supported) {
      setError('not-supported');
      return;
    }
    setError(null);
    setInterim('');
    setRecording(true);
    recRef.current = VoiceRecognizer.start(
      (final, partial) => {
        setInterim(partial);
        if (final) {
          onFinal?.(final);
          setInterim('');
        }
      },
      () => { setRecording(false); setInterim(''); },
      (err) => { setError(err); setRecording(false); }
    );
  }, [onFinal]);

  const stop = React.useCallback(() => {
    try { recRef.current?.stop(); } catch (e) {}
    setRecording(false);
  }, []);

  return { recording, interim, error, start, stop, supported: VoiceRecognizer.supported };
}
window.useMicrophone = useMicrophone;

// ── Big mic modal (overlay enquanto fala) ──────────────────
function MicListeningOverlay({ open, interim, onCancel, dark, fontScale = 1 }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 120,
      background: dark ? 'rgba(0,0,0,0.85)' : 'rgba(41,38,27,0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 28,
      animation: 'bubbleIn 0.2s ease-out',
    }}>
      {/* Pulsing mic */}
      <div style={{ position: 'relative', marginBottom: 30 }}>
        <div style={{
          position: 'absolute', inset: -22, borderRadius: '50%',
          background: 'oklch(0.68 0.14 40 / 0.25)',
          animation: 'pulseRing 1.6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: -10, borderRadius: '50%',
          background: 'oklch(0.68 0.14 40 / 0.4)',
          animation: 'pulseRing 1.6s ease-in-out infinite',
          animationDelay: '0.3s',
        }} />
        <div style={{
          position: 'relative',
          width: 140, height: 140, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--terracotta), var(--terracotta-d))',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 30px oklch(0.68 0.14 40 / 0.5)',
        }}>
          <svg width="62" height="62" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor"/>
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor"
                  strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div style={{
        fontSize: 26 * fontScale, fontWeight: 900,
        color: '#fff', textAlign: 'center', marginBottom: 10,
      }}>
        Estou ouvindo…
      </div>
      <div style={{
        fontSize: 18 * fontScale, fontWeight: 700,
        color: 'rgba(255,255,255,0.75)', textAlign: 'center',
        marginBottom: 28,
        maxWidth: 320, lineHeight: 1.3,
      }}>
        Fale agora o que você quer marcar
      </div>

      {/* Interim transcript */}
      <div style={{
        minHeight: 96, width: '100%', maxWidth: 340,
        background: 'rgba(255,255,255,0.12)',
        border: '1.5px solid rgba(255,255,255,0.18)',
        borderRadius: 20, padding: '18px 20px',
        fontSize: 20 * fontScale, fontWeight: 700,
        color: interim ? '#fff' : 'rgba(255,255,255,0.4)',
        lineHeight: 1.35,
        marginBottom: 28,
        fontStyle: interim ? 'normal' : 'italic',
      }}>
        {interim || '…'}
      </div>

      <button onClick={onCancel} className="tap" style={{
        minHeight: 64, padding: '0 36px',
        borderRadius: 999,
        background: '#fff',
        color: 'var(--ink)',
        fontSize: 20 * fontScale, fontWeight: 900,
        boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
      }}>
        Parar
      </button>
    </div>
  );
}
window.MicListeningOverlay = MicListeningOverlay;
