// chat.jsx — Tela 1: Conversa com IA em linguagem natural

function ChatBubbleAI({ children, fontScale = 1 }) {
  const text = typeof children === 'string' ? children : '';
  return (
    <div className="bubble-in" style={{
      alignSelf: 'flex-start',
      maxWidth: '85%',
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: '22px 22px 22px 6px',
      padding: '18px 22px',
      fontSize: 22 * fontScale,
      lineHeight: 1.4,
      color: 'var(--ink)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      fontWeight: 500,
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      {text && <SpeakButton text={text} size={36} color="var(--terracotta-d)" />}
    </div>
  );
}

function ChatBubbleUser({ children, fontScale = 1 }) {
  return (
    <div className="bubble-in" style={{
      alignSelf: 'flex-end',
      maxWidth: '85%',
      background: 'var(--terracotta)',
      color: '#fff',
      borderRadius: '22px 22px 6px 22px',
      padding: '18px 22px',
      fontSize: 22 * fontScale,
      lineHeight: 1.4,
      fontWeight: 600,
      boxShadow: '0 4px 12px oklch(0.68 0.14 40 / 0.25)',
    }}>
      {children}
    </div>
  );
}

function ConfirmCard({ event, fontScale = 1 }) {
  const tint = event.type === 'consulta' ? 'var(--blue-soft)'
            : event.type === 'remedio'   ? 'var(--green-soft)'
            : 'var(--orange-soft)';
  const ink = event.type === 'consulta' ? 'var(--blue-ink)'
            : event.type === 'remedio'   ? 'var(--green-ink)'
            : 'var(--orange-ink)';
  const icon = event.type === 'consulta' ? '🩺'
            : event.type === 'remedio'   ? '💊'
            : '📅';
  const owner = window.OWNERS[event.owner];
  return (
    <div className="bubble-in" style={{
      alignSelf: 'flex-start',
      maxWidth: '92%',
      background: tint,
      borderRadius: 22,
      padding: '20px 22px',
      border: `2px solid ${ink}`,
      boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12,
      }}>
        <div style={{
          fontSize: 38, lineHeight: 1, width: 56, height: 56,
          borderRadius: 16, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        }}>{icon}</div>
        <div style={{
          fontSize: 14 * fontScale, fontWeight: 800, letterSpacing: 0.6,
          textTransform: 'uppercase', color: ink,
        }}>Vou anotar:</div>
      </div>
      <div style={{
        fontSize: 24 * fontScale, fontWeight: 800,
        color: 'var(--ink)', lineHeight: 1.25, marginBottom: 10,
      }}>{event.title}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        fontSize: 20 * fontScale, color: 'var(--ink-soft)', fontWeight: 600,
      }}>
        <span style={{ fontSize: 22 }}>📖</span>
        <span>{event.when}</span>
        {event.recurrence === 'diario' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#fff',
            border: `2px solid ${ink}`,
            color: ink,
            borderRadius: 999,
            padding: '4px 12px',
            fontSize: 16 * fontScale, fontWeight: 800,
          }}>
            <span style={{ fontSize: 16 }}>🔁</span> todo dia
          </span>
        )}
      </div>
      <div style={{
        marginTop: 12, paddingTop: 12,
        borderTop: `1.5px dashed ${ink}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 16 * fontScale, fontWeight: 700, color: 'var(--ink-soft)' }}>Pra quem?</span>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#fff',
          border: `2px solid ${owner.color}`,
          borderRadius: 999,
          padding: '5px 14px 5px 5px',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: owner.color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 900,
          }}>{owner.short}</div>
          <span style={{
            fontSize: 18 * fontScale, fontWeight: 800, color: owner.color,
          }}>{owner.name}</span>
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="bubble-in" style={{
      alignSelf: 'flex-start',
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: '22px 22px 22px 6px',
      padding: '20px 24px',
      color: 'var(--terracotta)',
    }}>
      <span className="dot"></span><span className="dot"></span><span className="dot"></span>
    </div>
  );
}

function QuickChip({ children, onClick, fontScale = 1 }) {
  return (
    <button onClick={onClick} className="tap" style={{
      background: '#fff',
      border: '2px solid var(--line)',
      borderRadius: 999,
      padding: '14px 22px',
      fontSize: 18 * fontScale,
      fontWeight: 700,
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      minHeight: 56,
    }}>
      {children}
    </button>
  );
}

function ChatScreen({ messages, onSend, onConfirm, onToggleOwner, pendingOwner, fontScale = 1, isTyping }) {
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef(null);
  const lastBubbleType = messages.length ? messages[messages.length - 1].kind : null;

  // Microfone — quando ela termina de falar, envia direto
  const mic = useMicrophone({
    onFinal: (text) => {
      setInput('');
      onSend(text.trim());
    },
  });

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const submit = (text) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setInput('');
    onSend(t);
  };

  const showConfirmActions = lastBubbleType === 'confirm';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--cream)',
    }}>
      {/* Header */}
      <div style={{
        padding: '54px 90px 18px 24px',
        background: 'var(--cream)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--terracotta), var(--terracotta-d))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            fontWeight: 800,
          }}>💬</div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 16 * fontScale, color: 'var(--muted)', fontWeight: 700 }}>
              Conversar com
            </div>
            <div style={{ fontSize: 28 * fontScale, fontWeight: 900, color: 'var(--ink)' }}>
              Sua Assistente
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="no-scrollbar" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 18px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        {messages.map((m, i) => {
          if (m.kind === 'ai')      return <ChatBubbleAI    key={i} fontScale={fontScale}>{m.text}</ChatBubbleAI>;
          if (m.kind === 'user')    return <ChatBubbleUser  key={i} fontScale={fontScale}>{m.text}</ChatBubbleUser>;
          if (m.kind === 'confirm') return <ConfirmCard     key={i} event={m.event} fontScale={fontScale} />;
          return null;
        })}
        {isTyping && <TypingBubble />}
      </div>

      {/* Confirm action row (shows after AI proposes an event) */}
      {showConfirmActions && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 18px 14px' }}>
          <button onClick={onToggleOwner} className="tap" style={{
            background: '#fff',
            border: '2px solid var(--line)',
            borderRadius: 18,
            fontSize: 17 * fontScale,
            fontWeight: 700,
            color: 'var(--ink-soft)',
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            minHeight: 54,
          }}>
            <span style={{ fontSize: 22 }}>🔄</span>
            <span>Trocar para {pendingOwner === 'cido' ? 'mim' : 'o Cido'}</span>
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => onConfirm(false)} className="tap" style={{
              flex: 1,
              background: '#fff',
              border: '2px solid var(--line)',
              borderRadius: 18,
              fontSize: 20 * fontScale,
              fontWeight: 700,
              color: 'var(--ink-soft)',
              padding: '14px',
            }}>
              ✏️ Mudar
            </button>
            <button onClick={() => onConfirm(true)} className="tap" style={{
              flex: 2,
              background: 'var(--green)',
              color: '#fff',
              border: 0,
              borderRadius: 18,
              fontSize: 22 * fontScale,
              fontWeight: 800,
              padding: '14px',
              boxShadow: '0 4px 14px oklch(0.68 0.14 150 / 0.35)',
            }}>
              ✓ Sim, pode salvar
            </button>
          </div>
        </div>
      )}

      {/* Quick suggestions */}
      {!showConfirmActions && messages.length <= 2 && (
        <div className="no-scrollbar" style={{
          display: 'flex', gap: 10, padding: '0 18px 14px',
          overflowX: 'auto',
        }}>
          <QuickChip onClick={() => submit('Tenho consulta com Dr. Carlos sexta às 10h')} fontScale={fontScale}>🩺 Consulta</QuickChip>
          <QuickChip onClick={() => submit('Tomar remédio da pressão todo dia às 8h')} fontScale={fontScale}>💊 Remédio</QuickChip>
          <QuickChip onClick={() => submit('Cido tem consulta com o endocrinologista quarta às 10h')} fontScale={fontScale}>👴 Pro Cido</QuickChip>
          <QuickChip onClick={() => submit('Almoço com a Maria sábado ao meio-dia')} fontScale={fontScale}>📅 Outro</QuickChip>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '14px 18px 20px',
        background: 'var(--cream)',
        borderTop: '1px solid var(--line)',
        display: 'flex', gap: 10, alignItems: 'flex-end',
      }}>
        <div style={{
          flex: 1,
          background: '#fff',
          border: '2px solid var(--line)',
          borderRadius: 24,
          padding: '14px 20px',
          display: 'flex', alignItems: 'center',
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Escreva aqui…"
            style={{
              border: 0, outline: 0, background: 'transparent',
              width: '100%',
              fontSize: 20 * fontScale,
              fontFamily: 'inherit',
              color: 'var(--ink)',
              fontWeight: 500,
            }}
          />
        </div>
        <button onClick={() => submit()} className="tap" aria-label="Enviar" style={{
          width: 64, height: 64,
          borderRadius: '50%',
          background: input.trim()
            ? 'linear-gradient(135deg, var(--terracotta), var(--terracotta-d))'
            : 'var(--line)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: input.trim() ? '0 4px 14px oklch(0.68 0.14 40 / 0.35)' : 'none',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 12l18-9-4 9 4 9-18-9z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round"/>
          </svg>
        </button>
        <button onClick={() => mic.recording ? mic.stop() : mic.start()} className="tap" aria-label="Falar" style={{
          width: 64, height: 64,
          borderRadius: '50%',
          background: mic.recording
            ? 'linear-gradient(135deg, oklch(0.62 0.21 25), oklch(0.50 0.20 22))'
            : '#fff',
          border: mic.recording ? 'none' : '2px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          color: mic.recording ? '#fff' : 'var(--terracotta-d)',
          boxShadow: mic.recording
            ? '0 0 0 4px rgba(232, 80, 60, 0.18), 0 6px 16px oklch(0.55 0.20 25 / 0.35)'
            : 'none',
          animation: mic.recording ? 'pulseRing 1.4s ease-in-out infinite' : 'none',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor"/>
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <MicListeningOverlay
        open={mic.recording}
        interim={mic.interim}
        onCancel={mic.stop}
        fontScale={fontScale}
      />
    </div>
  );
}

window.ChatScreen = ChatScreen;
