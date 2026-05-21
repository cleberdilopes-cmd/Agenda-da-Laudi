// alerts-settings.jsx — Tela de configuração de avisos

// ── Setup CallMeBot step-by-step ───────────────────────────
function CallMeBotSetup({ contact, onSaveKey, dark, fontScale = 1 }) {
  const [step, setStep] = React.useState(contact.callmebotKey ? 4 : 1);
  const [key, setKey] = React.useState(contact.callmebotKey || '');

  if (step === 4) {
    return (
      <div style={{
        padding: '14px 16px',
        background: dark ? 'oklch(0.45 0.13 150 / 0.18)' : 'var(--green-soft)',
        border: dark ? '1.5px solid oklch(0.78 0.14 150)' : '2px solid var(--green)',
        borderRadius: 16,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--green)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>✓</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15 * fontScale, fontWeight: 800,
            color: dark ? 'var(--board-chalk)' : 'var(--green-ink)',
          }}>Conectado! Vai receber avisos no WhatsApp</div>
          <div style={{
            fontSize: 13 * fontScale, fontWeight: 700,
            color: dark ? 'rgba(255,255,255,0.6)' : 'var(--ink-soft)',
            opacity: 0.8, marginTop: 1,
          }}>Chave: ••••{(contact.callmebotKey || '').slice(-4)}</div>
        </div>
        <button onClick={() => { setStep(1); onSaveKey(null); }} className="tap" style={{
          padding: '8px 14px', borderRadius: 12,
          background: 'transparent',
          border: dark ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--line)',
          color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)',
          fontSize: 14 * fontScale, fontWeight: 700,
        }}>Refazer</button>
      </div>
    );
  }

  const steps = [
    {
      n: 1, label: 'Salvar contato',
      body: (
        <>
          <div style={{ fontSize: 17 * fontScale, fontWeight: 600, lineHeight: 1.4, marginBottom: 12 }}>
            No celular de <b>{contact.name}</b>, abra o site <b>callmebot.com</b> e copie o número oficial do bot pra adicionar como contato:
          </div>
          <div style={{
            background: dark ? 'rgba(0,0,0,0.3)' : '#fff',
            border: dark ? '1.5px solid rgba(255,255,255,0.15)' : '2px solid var(--line)',
            borderRadius: 14, padding: '14px 18px',
            fontSize: 15 * fontScale, fontWeight: 700,
            textAlign: 'center',
            color: dark ? 'var(--board-chalk)' : 'var(--ink-soft)',
          }}>
            🔗 <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noopener" style={{ color: 'var(--terracotta-d)', textDecoration: 'underline' }}>
              callmebot.com (instruções oficiais)
            </a>
          </div>
          <div style={{
            marginTop: 10, padding: '10px 14px',
            background: dark ? 'oklch(0.50 0.14 65 / 0.18)' : 'oklch(0.96 0.05 70)',
            border: dark ? '1px solid oklch(0.78 0.14 65)' : '1.5px solid oklch(0.82 0.12 70)',
            borderRadius: 12,
            fontSize: 13 * fontScale, fontWeight: 700, lineHeight: 1.4,
            color: dark ? 'oklch(0.92 0.10 70)' : 'var(--orange-ink)',
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <span>
              <b>Atenção:</b> use sempre o número da página oficial em inglês. Tradutor automático pode alterar dígitos.
            </span>
          </div>
        </>
      ),
    },
    {
      n: 2, label: 'Mandar mensagem',
      body: (
        <>
          <div style={{ fontSize: 17 * fontScale, fontWeight: 600, lineHeight: 1.4, marginBottom: 12 }}>
            Pelo WhatsApp, mande esta frase pro CallMeBot:
          </div>
          <div style={{
            background: dark ? 'rgba(0,0,0,0.3)' : '#fff',
            border: dark ? '1.5px solid rgba(255,255,255,0.15)' : '2px solid var(--line)',
            borderRadius: 14, padding: '14px 18px',
            fontSize: 16 * fontScale, fontWeight: 700,
            color: dark ? 'var(--board-chalk)' : 'var(--ink)',
            fontFamily: 'ui-monospace, monospace', lineHeight: 1.4,
          }}>I allow callmebot to send me messages</div>
        </>
      ),
    },
    {
      n: 3, label: 'Copiar a chave',
      body: (
        <>
          <div style={{ fontSize: 17 * fontScale, fontWeight: 600, lineHeight: 1.4, marginBottom: 12 }}>
            O bot vai responder com uma <b>chave (apikey)</b>. Copie e cole aqui:
          </div>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Ex: 1234567"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '14px 18px',
              fontSize: 20 * fontScale, fontWeight: 700,
              fontFamily: 'inherit',
              borderRadius: 14,
              background: dark ? 'rgba(0,0,0,0.3)' : '#fff',
              border: dark ? '1.5px solid rgba(255,255,255,0.15)' : '2px solid var(--line)',
              color: dark ? 'var(--board-chalk)' : 'var(--ink)',
              outline: 'none', letterSpacing: 0.5,
            }} />
        </>
      ),
    },
  ];

  const current = steps[step - 1];
  const canAdvance = step < 3 || (step === 3 && key.trim().length >= 3);

  return (
    <div style={{
      padding: 14,
      background: dark ? 'rgba(255,255,255,0.04)' : 'var(--cream-2)',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1.5px solid var(--line)',
      borderRadius: 18,
    }}>
      {/* Progresso */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        {steps.map((s) => (
          <React.Fragment key={s.n}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: s.n <= step ? 'var(--terracotta)' : (dark ? 'rgba(255,255,255,0.1)' : '#fff'),
              border: s.n <= step ? 'none' : '1.5px solid var(--line)',
              color: s.n <= step ? '#fff' : 'var(--muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 900, flexShrink: 0,
            }}>{s.n}</div>
            {s.n < steps.length && <div style={{
              flex: 1, height: 2,
              background: s.n < step ? 'var(--terracotta)' : (dark ? 'rgba(255,255,255,0.1)' : 'var(--line)'),
            }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{
        fontSize: 13 * fontScale, fontWeight: 900, letterSpacing: 0.8,
        color: 'var(--terracotta)', textTransform: 'uppercase', marginBottom: 4,
      }}>Passo {step} de 3</div>
      <div style={{
        fontSize: 20 * fontScale, fontWeight: 900, lineHeight: 1.15,
        color: dark ? 'var(--board-chalk)' : 'var(--ink)', marginBottom: 12,
      }}>{current.label}</div>

      {current.body}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="tap" style={{
            minHeight: 52, padding: '0 18px', borderRadius: 14,
            background: 'transparent',
            border: dark ? '1.5px solid rgba(255,255,255,0.2)' : '1.5px solid var(--line)',
            color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)',
            fontSize: 16 * fontScale, fontWeight: 700,
          }}>Voltar</button>
        )}
        <button
          onClick={() => {
            if (step < 3) setStep(step + 1);
            else { onSaveKey(key.trim()); setStep(4); }
          }}
          disabled={!canAdvance}
          className="tap"
          style={{
            flex: 1, minHeight: 52, borderRadius: 14,
            background: canAdvance ? 'var(--terracotta)' : 'var(--line)',
            color: '#fff',
            fontSize: 16 * fontScale, fontWeight: 800,
            opacity: canAdvance ? 1 : 0.5,
          }}>
          {step < 3 ? 'Próximo →' : '✓ Salvar chave'}
        </button>
      </div>
    </div>
  );
}
window.CallMeBotSetup = CallMeBotSetup;

// ── Push permission card ────────────────────────────────────
function PushPermissionCard({ dark, fontScale = 1 }) {
  const [perm, setPerm] = React.useState(window.Push.permission);
  const supported = window.Push.supported;

  const request = async () => {
    const result = await window.Push.request();
    setPerm(result);
    if (result === 'granted') {
      window.Push.send('Pronto! 🔔', 'Seus avisos chegam aqui agora', { tag: 'welcome' });
    }
  };

  const config = {
    'unsupported': { icon: '🚫', label: 'Este celular não permite',  color: 'var(--muted)',     btn: null },
    'granted':     { icon: '✓',  label: 'Avisos ativados',            color: 'var(--green-ink)', btn: null,           bg: 'var(--green-soft)' },
    'denied':      { icon: '⚠️', label: 'Avisos bloqueados',          color: 'var(--terracotta-d)', btn: null,        bg: 'oklch(0.94 0.05 50)' },
    'default':     { icon: '🔔', label: 'Quer receber avisos aqui?',  color: 'var(--ink)',       btn: 'Ativar avisos' },
  };
  const state = supported ? config[perm] || config.default : config.unsupported;

  return (
    <div style={{
      padding: 16,
      background: state.bg || (dark ? 'rgba(255,255,255,0.05)' : '#fff'),
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1.5px solid var(--line)',
      borderRadius: 20,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: dark ? 'rgba(255,255,255,0.1)' : 'var(--cream-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, flexShrink: 0,
      }}>{state.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13 * fontScale, fontWeight: 800, letterSpacing: 0.6,
          color: dark ? 'rgba(255,255,255,0.6)' : 'var(--muted)',
          textTransform: 'uppercase', marginBottom: 2,
        }}>Notificação do celular</div>
        <div style={{
          fontSize: 17 * fontScale, fontWeight: 800,
          color: dark ? 'var(--board-chalk)' : state.color, lineHeight: 1.2,
        }}>{state.label}</div>
        {perm === 'denied' && (
          <div style={{
            fontSize: 13 * fontScale, marginTop: 4, fontWeight: 600,
            color: dark ? 'rgba(255,255,255,0.6)' : 'var(--ink-soft)',
          }}>Vá em Ajustes do navegador → Notificações pra liberar</div>
        )}
      </div>
      {state.btn && (
        <button onClick={request} className="tap" style={{
          minHeight: 52, padding: '0 16px', borderRadius: 14,
          background: 'var(--terracotta)', color: '#fff',
          fontSize: 14 * fontScale, fontWeight: 800,
          boxShadow: '0 4px 12px oklch(0.68 0.14 40 / 0.35)',
          flexShrink: 0,
        }}>{state.btn}</button>
      )}
    </div>
  );
}
window.PushPermissionCard = PushPermissionCard;

// ── Test alarm card ─────────────────────────────────────────
function TestAlarmCard({ onTrigger, dark, fontScale = 1 }) {
  return (
    <div style={{
      padding: 16,
      background: dark ? 'rgba(255,255,255,0.05)' : '#fff',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1.5px solid var(--line)',
      borderRadius: 20,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: dark ? 'rgba(255,255,255,0.1)' : 'var(--cream-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, flexShrink: 0,
      }}>⏰</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13 * fontScale, fontWeight: 800, letterSpacing: 0.6,
          color: dark ? 'rgba(255,255,255,0.6)' : 'var(--muted)',
          textTransform: 'uppercase', marginBottom: 2,
        }}>Alarme na tela</div>
        <div style={{
          fontSize: 17 * fontScale, fontWeight: 800,
          color: dark ? 'var(--board-chalk)' : 'var(--ink)', lineHeight: 1.2,
        }}>Aparece grande quando chega a hora</div>
      </div>
      <button onClick={onTrigger} className="tap" style={{
        minHeight: 52, padding: '0 16px', borderRadius: 14,
        background: dark ? 'rgba(255,255,255,0.1)' : 'var(--cream-2)',
        color: dark ? 'var(--board-chalk)' : 'var(--ink)',
        fontSize: 14 * fontScale, fontWeight: 800,
        flexShrink: 0,
      }}>Testar</button>
    </div>
  );
}
window.TestAlarmCard = TestAlarmCard;

// ── Sent log preview ───────────────────────────────────────
function CallMeBotLog({ dark, fontScale = 1 }) {
  const log = window.useCallMeBotLog();

  if (log.length === 0) {
    return (
      <div style={{
        padding: 20, textAlign: 'center',
        background: dark ? 'rgba(255,255,255,0.03)' : 'var(--cream-2)',
        border: dark ? '1px dashed rgba(255,255,255,0.12)' : '1.5px dashed var(--line)',
        borderRadius: 18,
        color: dark ? 'rgba(255,255,255,0.5)' : 'var(--muted)',
        fontSize: 15 * fontScale, fontWeight: 600,
      }}>
        Ainda não foi enviada nenhuma mensagem.<br/>
        Toque em "Testar" lá em cima ↑
      </div>
    );
  }

  const fmt = (d) => `${String(d.getHours()).padStart(2,'0')}h${String(d.getMinutes()).padStart(2,'0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {log.slice(0, 6).map(e => (
        <div key={e.id} style={{
          padding: '12px 14px',
          background: dark ? 'rgba(80, 200, 120, 0.1)' : 'var(--green-soft)',
          border: dark ? '1px solid oklch(0.5 0.13 150 / 0.5)' : '1.5px solid oklch(0.85 0.08 150)',
          borderRadius: 16,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 18, lineHeight: 1.2, flexShrink: 0 }}>💬</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 8,
              fontSize: 13 * fontScale, fontWeight: 800,
              color: dark ? 'oklch(0.85 0.13 150)' : 'var(--green-ink)',
              marginBottom: 2,
            }}>
              <span>{e.contactName}</span>
              <span style={{ opacity: 0.6, fontWeight: 600 }}>• {fmt(e.at)}</span>
            </div>
            <div style={{
              fontSize: 14 * fontScale, fontWeight: 600,
              color: dark ? 'var(--board-chalk)' : 'var(--ink)',
              lineHeight: 1.35,
            }}>{e.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
window.CallMeBotLog = CallMeBotLog;

// ── Avisos / Alerts Modal ──────────────────────────────────
function AlertsModal({ open, onClose, contacts, onSaveContactKey, onTestAlarm, onTestWhatsApp, dark, fontScale = 1 }) {
  const family = contacts.filter(c => !c.isEmergency);
  return (
    <ModalSheet open={open} onClose={onClose}
      title="Avisos"
      subtitle="Como você e a família ficam sabendo das coisas"
      dark={dark} fontScale={fontScale}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* CAMADA 1: Alarme na tela */}
        <div>
          <div style={{
            fontSize: 13 * fontScale, fontWeight: 900, letterSpacing: 1,
            color: dark ? 'rgba(255,255,255,0.5)' : 'var(--muted)',
            textTransform: 'uppercase', marginBottom: 8, padding: '0 4px',
          }}>Pra você, Laudi</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <TestAlarmCard onTrigger={onTestAlarm} dark={dark} fontScale={fontScale} />
            <PushPermissionCard dark={dark} fontScale={fontScale} />
          </div>
        </div>

        {/* CAMADA 3: WhatsApp pra família */}
        <div>
          <div style={{
            fontSize: 13 * fontScale, fontWeight: 900, letterSpacing: 1,
            color: dark ? 'rgba(255,255,255,0.5)' : 'var(--muted)',
            textTransform: 'uppercase', marginBottom: 8, padding: '0 4px',
          }}>Pra família, via WhatsApp</div>
          <div style={{
            fontSize: 15 * fontScale, fontWeight: 600,
            color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)',
            padding: '0 4px', marginBottom: 12, lineHeight: 1.4,
          }}>
            A família é avisada quando algo importante acontece: pressão alta,
            remédio esquecido, ou no botão de emergência.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {family.map(c => (
              <div key={c.id}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '0 4px',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: c.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>{c.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 18 * fontScale, fontWeight: 900, lineHeight: 1.1,
                      color: dark ? 'var(--board-chalk)' : 'var(--ink)',
                    }}>{c.name}</div>
                    <div style={{
                      fontSize: 14 * fontScale, fontWeight: 700,
                      color: dark ? 'rgba(255,255,255,0.5)' : 'var(--muted)', marginTop: 1,
                    }}>{c.role} • {c.phone}</div>
                  </div>
                </div>
                <CallMeBotSetup
                  contact={c}
                  onSaveKey={(key) => onSaveContactKey(c.id, key)}
                  dark={dark} fontScale={fontScale}
                />
              </div>
            ))}
          </div>

          <button onClick={onTestWhatsApp} className="tap" style={{
            width: '100%', minHeight: 60, marginTop: 14,
            borderRadius: 18,
            background: 'oklch(0.62 0.18 145)', color: '#fff',
            fontSize: 17 * fontScale, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 4px 14px oklch(0.62 0.18 145 / 0.35)',
          }}>
            <span style={{ fontSize: 22 }}>💬</span>
            <span>Mandar mensagem de teste</span>
          </button>

          {/* Log */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 13 * fontScale, fontWeight: 900, letterSpacing: 0.8,
              color: dark ? 'rgba(255,255,255,0.5)' : 'var(--muted)',
              textTransform: 'uppercase', marginBottom: 8, padding: '0 4px',
            }}>Últimas mensagens enviadas</div>
            <CallMeBotLog dark={dark} fontScale={fontScale} />
          </div>
        </div>
      </div>
    </ModalSheet>
  );
}
window.AlertsModal = AlertsModal;
