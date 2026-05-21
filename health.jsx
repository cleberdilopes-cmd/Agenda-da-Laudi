// health.jsx — Tela 3: Saúde (água, atividade, pressão, dica do dia)
// Componentes principais. Helpers no topo.

const TIPS_OF_DAY = [
  { emoji: '🌅', text: 'Comece o dia com um copo de água. Ajuda a acordar o corpo.' },
  { emoji: '🚶', text: 'Uma caminhada curta depois do almoço melhora a digestão.' },
  { emoji: '💧', text: 'Se a urina estiver bem amarela, é sinal de pouca água.' },
  { emoji: '🥗', text: 'Comida colorida no prato — frutas e verduras todo dia.' },
  { emoji: '🧂', text: 'Sal de menos é remédio. Tempere com alho, cebola e ervas.' },
  { emoji: '😴', text: 'Dormir bem é tão importante quanto remédio. Tente sempre o mesmo horário.' },
  { emoji: '🌞', text: '15 minutos de sol pela manhã fazem bem pros ossos.' },
];

function HealthHeader({ dark, fontScale }) {
  return (
    <div style={{
      padding: '54px 90px 18px 22px',
      borderBottom: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--line)',
    }}>
      <div style={{
        fontSize: 16 * fontScale, fontWeight: 700,
        color: dark ? 'oklch(0.78 0.02 90)' : 'var(--muted)',
        textTransform: 'uppercase', letterSpacing: 1,
        marginBottom: 4,
      }}>
        Quinta-feira, 21 de maio
      </div>
      <div style={{
        fontFamily: dark ? 'Caveat, Nunito, cursive' : 'Nunito, sans-serif',
        fontSize: (dark ? 48 : 36) * fontScale,
        fontWeight: dark ? 700 : 900,
        color: dark ? 'var(--board-chalk)' : 'var(--ink)',
        lineHeight: 1.05,
      }}>
        Cuidando de você
      </div>
    </div>
  );
}

function HealthCard({ children, accent, dark, style = {} }) {
  return (
    <div style={{
      background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
      border: dark ? `2px solid ${accent}` : `1.5px solid var(--line)`,
      borderLeft: `8px solid ${accent}`,
      borderRadius: 22,
      padding: '20px',
      boxShadow: dark ? 'none' : '0 6px 16px rgba(0,0,0,0.05)',
      ...style,
    }}>
      {children}
    </div>
  );
}

window.TIPS_OF_DAY = TIPS_OF_DAY;
window.HealthHeader = HealthHeader;
window.HealthCard = HealthCard;

// ── Water tracker ───────────────────────────────────────────
function WaterCard({ cups, goal, onAdd, onRemove, dark, fontScale }) {
  const remaining = Math.max(0, goal - cups);
  const accent = dark ? 'oklch(0.78 0.13 235)' : 'var(--blue)';
  const ink = dark ? '#fff' : 'var(--blue-ink)';

  return (
    <HealthCard accent={accent} dark={dark}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: dark ? 'oklch(0.45 0.13 235 / 0.3)' : 'var(--blue-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, flexShrink: 0,
        }}>💧</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 22 * fontScale, fontWeight: 900, lineHeight: 1.1,
            color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          }}>Água hoje</div>
          <div style={{
            fontSize: 16 * fontScale, fontWeight: 700,
            color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)',
            marginTop: 2,
          }}>
            {remaining === 0
              ? '🎉 Meta de hoje cumprida!'
              : `Faltam ${remaining} ${remaining === 1 ? 'copo' : 'copos'}`}
          </div>
        </div>
      </div>

      {/* 8 cups */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap',
      }}>
        {Array.from({ length: goal }).map((_, i) => {
          const filled = i < cups;
          return (
            <div key={i} style={{
              flex: '1 1 0',
              minWidth: 28,
              aspectRatio: '1 / 1.3',
              borderRadius: '8px 8px 14px 14px',
              border: `2.5px solid ${accent}`,
              background: filled
                ? `linear-gradient(180deg, transparent 20%, ${accent} 22%)`
                : (dark ? 'rgba(0,0,0,0.25)' : '#fff'),
              boxShadow: filled ? '0 2px 8px oklch(0.70 0.13 235 / 0.3)' : 'none',
              transition: 'background 0.2s',
            }} />
          );
        })}
      </div>

      {/* Big button */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onRemove} disabled={cups === 0} className="tap" style={{
          width: 64, height: 64, borderRadius: 18,
          background: dark ? 'rgba(255,255,255,0.08)' : 'var(--cream-2)',
          color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)',
          fontSize: 32, fontWeight: 900,
          opacity: cups === 0 ? 0.4 : 1,
          flexShrink: 0,
        }}>−</button>
        <button onClick={onAdd} className="tap" style={{
          flex: 1, minHeight: 64,
          borderRadius: 18,
          background: accent,
          color: '#fff',
          fontSize: 20 * fontScale, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 6px 16px oklch(0.70 0.13 235 / 0.35)',
        }}>
          <span style={{ fontSize: 26 }}>💧</span>
          <span>Bebi mais um copo</span>
        </button>
      </div>
    </HealthCard>
  );
}
window.WaterCard = WaterCard;

// ── Activity card ───────────────────────────────────────────
function ActivityCard({ items, onToggle, dark, fontScale }) {
  const accent = dark ? 'oklch(0.78 0.14 150)' : 'var(--green)';
  const ink = dark ? '#fff' : 'var(--green-ink)';
  const doneCount = items.filter(x => x.done).length;

  return (
    <HealthCard accent={accent} dark={dark}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: dark ? 'oklch(0.45 0.13 150 / 0.3)' : 'var(--green-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, flexShrink: 0,
        }}>🚶</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 22 * fontScale, fontWeight: 900, lineHeight: 1.1,
            color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          }}>Mexer um pouquinho</div>
          <div style={{
            fontSize: 16 * fontScale, fontWeight: 700,
            color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)',
            marginTop: 2,
          }}>
            {doneCount === items.length
              ? '👏 Tudo feito hoje! Parabéns'
              : `${doneCount} de ${items.length} feito${doneCount === 1 ? '' : 's'}`}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <button key={item.id}
            onClick={() => onToggle(item.id)}
            className="tap"
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px',
              borderRadius: 16,
              background: item.done
                ? (dark ? 'oklch(0.45 0.13 150 / 0.2)' : 'var(--green-soft)')
                : (dark ? 'rgba(255,255,255,0.04)' : 'var(--cream)'),
              border: item.done
                ? `2px solid ${accent}`
                : (dark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid var(--line)'),
              textAlign: 'left',
              minHeight: 64,
              transition: 'all 0.2s',
              opacity: item.done ? 0.85 : 1,
            }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: item.done ? accent : (dark ? 'rgba(255,255,255,0.08)' : '#fff'),
              border: item.done ? 'none' : `2.5px dashed ${accent}`,
              color: item.done ? '#fff' : accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {item.done && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12.5l5 5L20 6" stroke="currentColor" strokeWidth="3.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
            <span style={{
              flex: 1, fontSize: 18 * fontScale, fontWeight: 700,
              color: dark ? 'var(--board-chalk)' : 'var(--ink)',
              textDecoration: item.done ? 'line-through' : 'none',
              lineHeight: 1.25,
            }}>{item.title}</span>
          </button>
        ))}
      </div>
    </HealthCard>
  );
}
window.ActivityCard = ActivityCard;

// ── Blood pressure card ─────────────────────────────────────
function PressureCard({ lastReading, onLog, dark, fontScale }) {
  const accent = dark ? 'oklch(0.78 0.14 65)' : 'var(--orange)';
  const ink = dark ? '#fff' : 'var(--orange-ink)';
  const status = lastReading
    ? (lastReading.sys >= 140 || lastReading.dia >= 90
        ? { label: 'Um pouquinho alta', color: 'var(--terracotta)', icon: '⚠️' }
        : { label: 'Tudo certo', color: 'var(--green)', icon: '✓' })
    : null;

  return (
    <HealthCard accent={accent} dark={dark}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: dark ? 'oklch(0.50 0.14 65 / 0.3)' : 'var(--orange-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, flexShrink: 0,
        }}>🫀</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 22 * fontScale, fontWeight: 900, lineHeight: 1.1,
            color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          }}>Sua pressão</div>
          <div style={{
            fontSize: 16 * fontScale, fontWeight: 700,
            color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)',
            marginTop: 2,
          }}>
            {lastReading ? `Última medida: ${lastReading.when}` : 'Ainda não anotou hoje'}
          </div>
        </div>
      </div>

      {lastReading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px', marginBottom: 12,
          borderRadius: 16,
          background: dark ? 'rgba(0,0,0,0.3)' : 'var(--cream)',
          border: dark ? `1.5px solid ${accent}` : '1.5px solid var(--line)',
        }}>
          <div style={{
            fontSize: 38 * fontScale, fontWeight: 900,
            color: dark ? 'var(--board-chalk)' : 'var(--ink)',
            letterSpacing: -1, lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {lastReading.sys}<span style={{
              fontSize: 26 * fontScale, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--muted)',
              margin: '0 4px',
            }}>/</span>{lastReading.dia}
          </div>
          <div style={{
            fontSize: 12 * fontScale, fontWeight: 800, letterSpacing: 0.8,
            color: dark ? 'rgba(255,255,255,0.6)' : 'var(--muted)',
            textTransform: 'uppercase', flex: 1,
          }}>mmHg</div>
          {status && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 999,
              background: status.color, color: '#fff',
              fontSize: 14 * fontScale, fontWeight: 800,
            }}>
              <span>{status.icon}</span><span>{status.label}</span>
            </div>
          )}
        </div>
      )}

      <button onClick={onLog} className="tap" style={{
        width: '100%', minHeight: 60,
        borderRadius: 18,
        background: accent, color: '#fff',
        fontSize: 18 * fontScale, fontWeight: 900,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: '0 4px 12px oklch(0.72 0.14 65 / 0.35)',
      }}>
        <span style={{ fontSize: 24 }}>✏️</span>
        <span>{lastReading ? 'Anotar outra medida' : 'Anotar pressão agora'}</span>
      </button>
    </HealthCard>
  );
}
window.PressureCard = PressureCard;

// ── Tip of the day ──────────────────────────────────────────
function TipCard({ tip, onNext, dark, fontScale }) {
  const accent = 'var(--terracotta)';
  return (
    <HealthCard accent={accent} dark={dark}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, marginBottom: 12,
      }}>
        <span style={{
          fontSize: 13 * fontScale, fontWeight: 900, letterSpacing: 1,
          color: accent, textTransform: 'uppercase',
        }}>💡 Dica do dia</span>
        <SpeakButton text={tip.text} size={40} dark={dark} color={accent} />
      </div>
      <div style={{
        display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 14,
      }}>
        <div style={{
          fontSize: 56, lineHeight: 1, flexShrink: 0,
        }}>{tip.emoji}</div>
        <div style={{
          flex: 1,
          fontSize: 22 * fontScale, fontWeight: 700, lineHeight: 1.3,
          color: dark ? 'var(--board-chalk)' : 'var(--ink)',
        }}>{tip.text}</div>
      </div>
      <button onClick={onNext} className="tap" style={{
        width: '100%', minHeight: 56,
        borderRadius: 16,
        background: dark ? 'rgba(255,255,255,0.06)' : 'var(--cream-2)',
        border: dark ? '1px solid rgba(255,255,255,0.1)' : '1.5px solid var(--line)',
        color: dark ? 'var(--board-chalk)' : 'var(--ink)',
        fontSize: 17 * fontScale, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <span>Próxima dica</span>
        <span style={{ fontSize: 20 }}>→</span>
      </button>
    </HealthCard>
  );
}
window.TipCard = TipCard;

// ── Pressure log modal ─────────────────────────────────────
function PressureLogModal({ open, onClose, onSave, dark, fontScale }) {
  const [sys, setSys] = React.useState(120);
  const [dia, setDia] = React.useState(80);

  const Stepper = ({ label, value, onChange, min, max }) => (
    <div style={{
      flex: 1,
      background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
      border: dark ? '1.5px solid rgba(255,255,255,0.12)' : '2px solid var(--line)',
      borderRadius: 22, padding: '16px 14px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 13 * fontScale, fontWeight: 800, letterSpacing: 0.6,
        color: dark ? 'rgba(255,255,255,0.6)' : 'var(--muted)',
        textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontSize: 48 * fontScale, fontWeight: 900, lineHeight: 1,
        color: dark ? 'var(--board-chalk)' : 'var(--ink)',
        fontVariantNumeric: 'tabular-nums', marginBottom: 12,
      }}>{value}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onChange(Math.max(min, value - 1))} className="tap" style={{
          flex: 1, minHeight: 56, borderRadius: 14,
          background: dark ? 'rgba(255,255,255,0.08)' : 'var(--cream-2)',
          color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          fontSize: 28, fontWeight: 900,
        }}>−</button>
        <button onClick={() => onChange(Math.min(max, value + 1))} className="tap" style={{
          flex: 1, minHeight: 56, borderRadius: 14,
          background: dark ? 'rgba(255,255,255,0.08)' : 'var(--cream-2)',
          color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          fontSize: 28, fontWeight: 900,
        }}>＋</button>
      </div>
    </div>
  );

  return (
    <ModalSheet open={open} onClose={onClose}
      title="Anotar pressão"
      subtitle="Use os botões pra ajustar e toque em salvar"
      dark={dark} fontScale={fontScale}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Stepper label="Máxima" value={sys} onChange={setSys} min={60} max={220} />
        <Stepper label="Mínima" value={dia} onChange={setDia} min={40} max={140} />
      </div>
      <button onClick={() => { onSave(sys, dia); onClose(); }} className="tap" style={{
        width: '100%', minHeight: 64,
        borderRadius: 20,
        background: 'var(--green)', color: '#fff',
        fontSize: 22 * fontScale, fontWeight: 900,
        boxShadow: '0 6px 16px oklch(0.68 0.14 150 / 0.35)',
      }}>
        ✓ Salvar {sys}/{dia}
      </button>
    </ModalSheet>
  );
}
window.PressureLogModal = PressureLogModal;

// ── Main Health screen ─────────────────────────────────────
function HealthScreen({
  water, activities, pressure, tipIndex,
  onWaterAdd, onWaterRemove, onActivityToggle,
  onLogPressure, onNextTip,
  dark, fontScale = 1,
}) {
  const tip = window.TIPS_OF_DAY[tipIndex % window.TIPS_OF_DAY.length];
  return (
    <div className={dark ? 'board-bg' : ''} style={{
      background: dark ? 'var(--board-dark)' : 'var(--cream)',
      minHeight: '100%',
      display: 'flex', flexDirection: 'column',
    }}>
      <HealthHeader dark={dark} fontScale={fontScale} />
      <div className="no-scrollbar" style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 18px 24px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <WaterCard
          cups={water.cups} goal={water.goal}
          onAdd={onWaterAdd} onRemove={onWaterRemove}
          dark={dark} fontScale={fontScale}
        />
        <ActivityCard
          items={activities}
          onToggle={onActivityToggle}
          dark={dark} fontScale={fontScale}
        />
        <PressureCard
          lastReading={pressure}
          onLog={onLogPressure}
          dark={dark} fontScale={fontScale}
        />
        <TipCard
          tip={tip} onNext={onNextTip}
          dark={dark} fontScale={fontScale}
        />
      </div>
    </div>
  );
}
window.HealthScreen = HealthScreen;
