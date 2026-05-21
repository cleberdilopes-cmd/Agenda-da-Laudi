// kanban.jsx — Tela 2: Quadro de compromissos (estilo lousa)

const TYPE_META = {
  consulta: {
    label: 'Consulta',
    icon: '🩺',
    // light mode
    bg: 'var(--blue-soft)',
    ink: 'var(--blue-ink)',
    accent: 'var(--blue)',
    // dark / chalk
    chalkBg: 'oklch(0.45 0.13 235 / 0.28)',
    chalkBorder: 'oklch(0.78 0.13 235)',
  },
  remedio: {
    label: 'Remédio',
    icon: '💊',
    bg: 'var(--green-soft)',
    ink: 'var(--green-ink)',
    accent: 'var(--green)',
    chalkBg: 'oklch(0.45 0.13 150 / 0.28)',
    chalkBorder: 'oklch(0.78 0.14 150)',
  },
  outro: {
    label: 'Outro',
    icon: '📅',
    bg: 'var(--orange-soft)',
    ink: 'var(--orange-ink)',
    accent: 'var(--orange)',
    chalkBg: 'oklch(0.50 0.14 65 / 0.30)',
    chalkBorder: 'oklch(0.82 0.14 70)',
  },
};

function OwnerBadge({ owner, dark, fontScale = 1 }) {
  const o = window.OWNERS[owner];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: dark ? 'rgba(0,0,0,0.4)' : '#fff',
      border: `2px solid ${o.color}`,
      borderRadius: 999,
      padding: '4px 12px 4px 4px',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: o.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 900,
      }}>{o.short}</div>
      <span style={{
        fontSize: 15 * fontScale, fontWeight: 800,
        color: dark ? '#fff' : o.color,
      }}>{o.name}</span>
    </div>
  );
}

function DoneButton({ done, onClick, dark, color }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={done ? 'Desmarcar' : 'Marcar como feito'}
      className="tap"
      style={{
        width: 64, height: 64,
        borderRadius: '50%',
        background: done ? (dark ? 'oklch(0.68 0.14 150)' : 'var(--green)') : (dark ? 'rgba(255,255,255,0.06)' : '#fff'),
        border: done ? 'none' : `2.5px dashed ${color}`,
        color: done ? '#fff' : color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: done ? '0 4px 14px oklch(0.68 0.14 150 / 0.4)' : 'none',
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M4 12.5l5 5L20 6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function RecurrenceChip({ dark, fontScale }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: dark ? 'rgba(255,255,255,0.1)' : 'var(--cream-2)',
      color: dark ? 'rgba(255,255,255,0.85)' : 'var(--ink-soft)',
      borderRadius: 999,
      padding: '3px 10px',
      fontSize: 14 * fontScale, fontWeight: 800,
    }}>
      <span style={{ fontSize: 14 }}>🔁</span> todo dia
    </span>
  );
}

function EventActionsMenu({ event, onEdit, onDelete, dark, fontScale }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    setTimeout(() => window.addEventListener('click', close), 0);
    return () => window.removeEventListener('click', close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        aria-label="Mais opções" className="tap" style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'transparent',
        color: dark ? 'rgba(255,255,255,0.6)' : 'var(--muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, fontWeight: 900, lineHeight: 1,
      }}>⋮</button>
      {open && (
        <div style={{
          position: 'absolute', top: 44, right: 0, zIndex: 30,
          background: dark ? 'oklch(0.30 0.02 160)' : '#fff',
          border: dark ? '1px solid rgba(255,255,255,0.12)' : '1.5px solid var(--line)',
          borderRadius: 16, padding: 6,
          minWidth: 180,
          boxShadow: '0 10px 28px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <button onClick={() => { setOpen(false); onEdit(event); }} className="tap" style={{
            padding: '12px 14px', borderRadius: 10, textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 12, minHeight: 52,
            color: dark ? 'var(--board-chalk)' : 'var(--ink)',
            fontSize: 17 * fontScale, fontWeight: 700,
          }}>
            <span style={{ fontSize: 22 }}>✏️</span>
            <span>Editar</span>
          </button>
          <button onClick={() => { setOpen(false); onDelete(event); }} className="tap" style={{
            padding: '12px 14px', borderRadius: 10, textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 12, minHeight: 52,
            color: 'var(--terracotta-d)',
            fontSize: 17 * fontScale, fontWeight: 700,
          }}>
            <span style={{ fontSize: 22 }}>🗑️</span>
            <span>Apagar</span>
          </button>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, urgent, dark, fontScale = 1, onToggleDone, onEdit, onDelete }) {
  const meta = TYPE_META[event.type];

  if (dark) {
    return (
      <div className={(urgent && !event.done) ? 'pulse-chalk' : ''} style={{
        background: meta.chalkBg,
        border: `2.5px solid ${meta.chalkBorder}`,
        borderRadius: 22,
        padding: '20px 20px',
        display: 'flex', gap: 14, alignItems: 'flex-start',
        backdropFilter: 'blur(6px)',
        position: 'relative',
        opacity: event.done ? 0.55 : 1,
        transition: 'opacity 0.2s',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: meta.chalkBorder,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 34, flexShrink: 0,
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
        }}>{meta.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 8, marginBottom: 6,
          }}>
            <div style={{
              fontWeight: 800,
              color: meta.chalkBorder, letterSpacing: 0.8,
              textTransform: 'uppercase',
              fontFamily: 'Caveat, Nunito, cursive',
              fontSize: 18 * fontScale,
            }}>{meta.label}</div>
            <OwnerBadge owner={event.owner} dark={true} fontScale={fontScale} />
            <EventActionsMenu event={event} onEdit={onEdit} onDelete={onDelete} dark={true} fontScale={fontScale} />
          </div>
          <div style={{
            fontSize: 22 * fontScale, fontWeight: 800,
            color: 'var(--board-chalk)', lineHeight: 1.2, marginBottom: 10,
            textDecoration: event.done ? 'line-through' : 'none',
          }}>{event.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(0,0,0,0.35)',
              padding: '8px 14px', borderRadius: 12,
              border: `1.5px solid ${meta.chalkBorder}`,
            }}>
              <span style={{ fontSize: 18 }}>🕐</span>
              <span style={{
                fontSize: 22 * fontScale, fontWeight: 900,
                color: '#fff', letterSpacing: 0.5,
              }}>{event.time}</span>
            </div>
            {event.recurrence === 'diario' && <RecurrenceChip dark={true} fontScale={fontScale} />}
          </div>
        </div>
        {urgent && onToggleDone && (
          <DoneButton done={event.done} dark={true} color={meta.chalkBorder}
                      onClick={() => onToggleDone(event.id)} />
        )}
        {urgent && !event.done && (
          <div style={{
            position: 'absolute', top: -10, right: 16,
            background: 'var(--terracotta)', color: '#fff',
            fontSize: 13 * fontScale, fontWeight: 900,
            padding: '5px 12px', borderRadius: 999,
            letterSpacing: 0.8, textTransform: 'uppercase',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
          }}>Hoje!</div>
        )}
      </div>
    );
  }

  // Light mode
  return (
    <div className={(urgent && !event.done) ? 'pulse-urgent' : ''} style={{
      background: event.done ? 'var(--cream-2)' : '#fff',
      border: (urgent && !event.done) ? `3px solid ${meta.accent}` : `1.5px solid var(--line)`,
      borderRadius: 22,
      padding: '20px',
      display: 'flex', gap: 14, alignItems: 'flex-start',
      boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
      position: 'relative',
      opacity: event.done ? 0.7 : 1,
      transition: 'opacity 0.2s, background 0.2s',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: meta.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 34, flexShrink: 0,
        border: `2px solid ${meta.accent}`,
      }}>{meta.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, marginBottom: 4,
        }}>
          <div style={{
            fontSize: 14 * fontScale, fontWeight: 800,
            color: meta.ink, letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}>{meta.label}</div>
          <OwnerBadge owner={event.owner} dark={false} fontScale={fontScale} />
          <EventActionsMenu event={event} onEdit={onEdit} onDelete={onDelete} dark={false} fontScale={fontScale} />
        </div>
        <div style={{
          fontSize: 22 * fontScale, fontWeight: 800,
          color: 'var(--ink)', lineHeight: 1.2, marginBottom: 10,
          textDecoration: event.done ? 'line-through' : 'none',
        }}>{event.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: meta.bg,
            padding: '8px 14px', borderRadius: 12,
          }}>
            <span style={{ fontSize: 18 }}>🕐</span>
            <span style={{
              fontSize: 22 * fontScale, fontWeight: 900,
              color: meta.ink, letterSpacing: 0.5,
            }}>{event.time}</span>
          </div>
          {event.recurrence === 'diario' && <RecurrenceChip dark={false} fontScale={fontScale} />}
        </div>
      </div>
      {urgent && onToggleDone && (
        <DoneButton done={event.done} dark={false} color={meta.accent}
                    onClick={() => onToggleDone(event.id)} />
      )}
      {urgent && !event.done && (
        <div style={{
          position: 'absolute', top: -10, right: 16,
          background: 'var(--terracotta)', color: '#fff',
          fontSize: 13 * fontScale, fontWeight: 900,
          padding: '5px 12px', borderRadius: 999,
          letterSpacing: 0.8, textTransform: 'uppercase',
          boxShadow: '0 4px 10px oklch(0.68 0.14 40 / 0.4)',
        }}>Hoje!</div>
      )}
    </div>
  );
}

function ColumnHeader({ title, count, accent, dark, fontScale = 1 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      marginBottom: 14, padding: '0 4px',
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: accent,
        boxShadow: dark ? `0 0 12px ${accent}` : 'none',
      }} />
      <div style={{
        fontFamily: dark ? 'Caveat, Nunito, cursive' : 'Nunito, sans-serif',
        fontSize: (dark ? 38 : 30) * fontScale,
        fontWeight: dark ? 700 : 900,
        color: dark ? 'var(--board-chalk)' : 'var(--ink)',
        lineHeight: 1,
      }}>{title}</div>
      <div style={{
        fontSize: 18 * fontScale, fontWeight: 800,
        color: dark ? 'oklch(0.75 0.02 90)' : 'var(--muted)',
        background: dark ? 'rgba(255,255,255,0.08)' : 'var(--cream-2)',
        padding: '4px 12px', borderRadius: 999,
        minWidth: 30, textAlign: 'center',
      }}>{count}</div>
    </div>
  );
}

function OwnerFilter({ value, onChange, dark, fontScale = 1, counts }) {
  const options = [
    { id: 'todos', label: 'Os dois', emoji: '👫' },
    { id: 'laudi', label: 'Eu',      emoji: '👵' },
    { id: 'cido',  label: 'Cido',    emoji: '👴' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 8,
      padding: 6,
      background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1.5px solid var(--line)',
      borderRadius: 22,
    }}>
      {options.map(opt => {
        const active = value === opt.id;
        const accent = opt.id === 'laudi' ? 'var(--laudi)'
                     : opt.id === 'cido'  ? 'var(--cido)'
                     : 'var(--ink)';
        return (
          <button key={opt.id} onClick={() => onChange(opt.id)} className="tap" style={{
            flex: 1, minHeight: 68,
            borderRadius: 16,
            background: active ? accent : 'transparent',
            color: active ? '#fff' : (dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)'),
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, padding: '6px 4px',
            boxShadow: active ? '0 4px 12px rgba(0,0,0,0.18)' : 'none',
            transition: 'all 0.18s ease',
          }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{opt.emoji}</span>
            <span style={{ fontSize: 16 * fontScale, fontWeight: 800, letterSpacing: 0.2 }}>
              {opt.label} <span style={{ opacity: 0.7, fontWeight: 700 }}>({counts[opt.id]})</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function NextUpBanner({ event, dark, fontScale, onToggleDone }) {
  if (!event) {
    return (
      <div style={{
        background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
        border: dark ? '1.5px dashed rgba(255,255,255,0.18)' : '2px dashed var(--line)',
        borderRadius: 22, padding: '18px 22px',
        textAlign: 'center',
        color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)',
      }}>
        <div style={{ fontSize: 36, marginBottom: 4 }}>🌟</div>
        <div style={{ fontSize: 20 * fontScale, fontWeight: 800 }}>
          Tudo certo por hoje!
        </div>
      </div>
    );
  }
  const meta = window.TYPE_META[event.type];
  const owner = window.OWNERS[event.owner];
  const evMin = window.timeToMin(event.time);
  const diff = evMin != null ? evMin - window.NOW_MIN : null;
  const friendly = diff != null
    ? (diff < 0 ? 'agora' : (diff < 15 ? 'AGORA!' : window.minToFriendly(diff)))
    : null;
  const isNow = diff != null && diff < 30;
  return (
    <div style={{
      background: dark ? 'rgba(0,0,0,0.35)' : '#fff',
      border: `3px solid ${dark ? meta.chalkBorder : meta.accent}`,
      borderRadius: 24, padding: '16px 18px',
      display: 'flex', gap: 14, alignItems: 'center',
      boxShadow: dark ? '0 0 18px rgba(255,200,140,0.18)'
                      : '0 8px 22px oklch(0.68 0.14 40 / 0.18)',
      position: 'relative',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: dark ? meta.chalkBorder : meta.bg,
        border: dark ? 'none' : `2px solid ${meta.accent}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40, flexShrink: 0,
      }}>{meta.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13 * fontScale, fontWeight: 900, letterSpacing: 1,
          color: isNow ? 'var(--terracotta)' : (dark ? 'rgba(255,255,255,0.6)' : 'var(--muted)'),
          textTransform: 'uppercase', marginBottom: 2,
        }}>
          {isNow ? '⏰ Agora' : 'Próximo'} {friendly && !isNow && `• ${friendly}`}
        </div>
        <div style={{
          fontSize: 20 * fontScale, fontWeight: 800, lineHeight: 1.2,
          color: dark ? 'var(--board-chalk)' : 'var(--ink)',
        }}>{event.title}</div>
        <div style={{
          fontSize: 16 * fontScale, fontWeight: 700,
          color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)', marginTop: 2,
        }}>
          {event.time} • {owner.name}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <SpeakButton
          text={`${owner.name === 'Laudi' ? 'Você tem' : 'O Cido tem'} ${event.title}, às ${event.time}.${friendly && !isNow ? ' Daqui ' + friendly.replace('daqui ', '') + '.' : isNow ? ' É agora.' : ''}`}
          size={42} dark={dark}
          color={dark ? meta.chalkBorder : meta.accent}
        />
        <DoneButton done={event.done} dark={dark} color={dark ? meta.chalkBorder : meta.accent}
                    onClick={() => onToggleDone(event.id)} />
      </div>
    </div>
  );
}

function KanbanScreen({ events, ownerFilter = 'todos', onOwnerFilterChange, onToggleDone, onEdit, onDelete, contacts = [], onOpenFamily, onOpenPrint, onOpenAlerts, onOpenSettings, dark, fontScale = 1 }) {
  const filtered = ownerFilter === 'todos'
    ? events
    : events.filter(e => e.owner === ownerFilter);
  const counts = {
    todos: events.length,
    laudi: events.filter(e => e.owner === 'laudi').length,
    cido:  events.filter(e => e.owner === 'cido').length,
  };

  const today    = filtered.filter(e => e.bucket === 'hoje');
  const semana   = filtered.filter(e => e.bucket === 'semana');
  const proximos = filtered.filter(e => e.bucket === 'proximos');

  // Próxima coisa de hoje que ainda não foi feita
  const nextUp = today
    .filter(e => !e.done)
    .map(e => ({ e, m: window.timeToMin(e.time) }))
    .filter(x => x.m != null)
    .sort((a, b) => {
      const aPast = a.m < window.NOW_MIN ? 1 : 0;
      const bPast = b.m < window.NOW_MIN ? 1 : 0;
      if (aPast !== bPast) return aPast - bPast;
      const aDist = a.m < window.NOW_MIN ? (window.NOW_MIN - a.m) : (a.m - window.NOW_MIN);
      const bDist = b.m < window.NOW_MIN ? (window.NOW_MIN - b.m) : (b.m - window.NOW_MIN);
      return aDist - bDist;
    })[0]?.e || null;

  const columns = [
    { id: 'hoje',     title: 'Hoje',         count: today.length,    items: today,    accent: 'var(--terracotta)', urgent: true },
    { id: 'semana',   title: 'Esta semana',  count: semana.length,   items: semana,   accent: 'var(--blue)',       urgent: false },
    { id: 'proximos', title: 'Próximos',     count: proximos.length, items: proximos, accent: 'var(--green)',      urgent: false },
  ];

  const bg = dark ? 'var(--board-dark)' : 'var(--cream)';

  return (
    <div className={dark ? 'board-bg' : ''} style={{
      background: bg,
      minHeight: '100%',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
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

        <OwnerFilter
          value={ownerFilter}
          onChange={onOwnerFilterChange}
          dark={dark}
          fontScale={fontScale}
          counts={counts}
        />
        <div style={{ marginTop: 10 }}>
          <FamilyStrip
            contacts={contacts}
            onOpen={onOpenFamily}
            dark={dark}
            fontScale={fontScale}
          />
        </div>
      </div>

      {/* Columns stacked */}
      <div className="no-scrollbar" style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 18px 24px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        {/* Próxima coisa em destaque */}
        <NextUpBanner event={nextUp} dark={dark} fontScale={fontScale} onToggleDone={onToggleDone} />
        {columns.map(col => (
          <div key={col.id}>
            <ColumnHeader
              title={col.title} count={col.count}
              accent={col.accent} dark={dark} fontScale={fontScale}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {col.items.length === 0 && (
                <div style={{
                  padding: '24px',
                  border: dark ? '2px dashed rgba(255,255,255,0.15)' : '2px dashed var(--line)',
                  borderRadius: 18, textAlign: 'center',
                  fontSize: 18 * fontScale,
                  color: dark ? 'rgba(255,255,255,0.4)' : 'var(--muted)',
                  fontWeight: 600,
                }}>
                  Nada por aqui ainda
                </div>
              )}
              {col.items.map((ev) => (
                <EventCard
                  key={ev.id} event={ev}
                  urgent={col.urgent}
                  dark={dark} fontScale={fontScale}
                  onToggleDone={onToggleDone}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))}
        <button onClick={onOpenAlerts} className="tap" style={{
          width: '100%', minHeight: 60,
          borderRadius: 18,
          background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
          border: dark ? '1px solid rgba(255,255,255,0.1)' : '1.5px solid var(--line)',
          color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontSize: 18 * fontScale, fontWeight: 800,
          padding: '12px 16px',
        }}>
          <span style={{ fontSize: 24 }}>🔔</span>
          <span>Configurar avisos</span>
        </button>
        <PrintButton onClick={onOpenPrint} dark={dark} fontScale={fontScale} />
      </div>
    </div>
  );
}

window.KanbanScreen = KanbanScreen;
window.TYPE_META = TYPE_META;

// ── Edit event modal ───────────────────────────────────────
function EditEventModal({ open, event, onSave, onClose, dark, fontScale = 1 }) {
  const [title, setTitle] = React.useState('');
  const [time, setTime] = React.useState('');
  const [type, setType] = React.useState('outro');
  const [owner, setOwner] = React.useState('laudi');
  const [bucket, setBucket] = React.useState('semana');

  React.useEffect(() => {
    if (event) {
      setTitle(event.title);
      setTime(event.time === '—' ? '' : event.time);
      setType(event.type);
      setOwner(event.owner);
      setBucket(event.bucket);
    }
  }, [event]);

  if (!open || !event) return null;

  const submit = () => {
    onSave({
      ...event,
      title: title.trim() || event.title,
      time: time.trim() || '—',
      type, owner, bucket,
      when: event.when, // mantém legível original
    });
    onClose();
  };

  const SectionLabel = ({ children }) => (
    <div style={{
      fontSize: 13 * fontScale, fontWeight: 900, letterSpacing: 0.8,
      color: dark ? 'rgba(255,255,255,0.55)' : 'var(--muted)',
      textTransform: 'uppercase', marginBottom: 6, marginTop: 12,
    }}>{children}</div>
  );

  const Pill = ({ active, onClick, accent, children }) => (
    <button onClick={onClick} className="tap" style={{
      flex: 1, minHeight: 52, padding: '10px 8px',
      borderRadius: 14,
      background: active ? accent : (dark ? 'rgba(255,255,255,0.06)' : '#fff'),
      border: active ? 'none' : (dark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid var(--line)'),
      color: active ? '#fff' : (dark ? 'var(--board-chalk)' : 'var(--ink)'),
      fontSize: 15 * fontScale, fontWeight: 800,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>{children}</button>
  );

  return (
    <ModalSheet open={open} onClose={onClose}
      title="Editar compromisso"
      dark={dark} fontScale={fontScale}>
      <SectionLabel>O que é</SectionLabel>
      <input value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Escreva aqui…" style={{
          width: '100%', boxSizing: 'border-box',
          padding: '14px 18px', borderRadius: 14,
          background: dark ? 'rgba(0,0,0,0.3)' : '#fff',
          border: dark ? '1.5px solid rgba(255,255,255,0.15)' : '2px solid var(--line)',
          color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          fontSize: 19 * fontScale, fontWeight: 700, fontFamily: 'inherit',
          outline: 'none',
        }} />

      <SectionLabel>Horário</SectionLabel>
      <input value={time} onChange={(e) => setTime(e.target.value)}
        placeholder="Ex: 14h30" style={{
          width: '100%', boxSizing: 'border-box',
          padding: '14px 18px', borderRadius: 14,
          background: dark ? 'rgba(0,0,0,0.3)' : '#fff',
          border: dark ? '1.5px solid rgba(255,255,255,0.15)' : '2px solid var(--line)',
          color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          fontSize: 19 * fontScale, fontWeight: 700, fontFamily: 'inherit',
          outline: 'none',
        }} />

      <SectionLabel>Tipo</SectionLabel>
      <div style={{ display: 'flex', gap: 8 }}>
        <Pill active={type === 'consulta'} onClick={() => setType('consulta')} accent="var(--blue)">🩺 Consulta</Pill>
        <Pill active={type === 'remedio'}  onClick={() => setType('remedio')}  accent="var(--green)">💊 Remédio</Pill>
        <Pill active={type === 'outro'}    onClick={() => setType('outro')}    accent="var(--orange)">📅 Outro</Pill>
      </div>

      <SectionLabel>Pra quem</SectionLabel>
      <div style={{ display: 'flex', gap: 8 }}>
        <Pill active={owner === 'laudi'} onClick={() => setOwner('laudi')} accent="var(--laudi)">👵 Eu</Pill>
        <Pill active={owner === 'cido'}  onClick={() => setOwner('cido')}  accent="var(--cido)">👴 Cido</Pill>
      </div>

      <SectionLabel>Quando</SectionLabel>
      <div style={{ display: 'flex', gap: 8 }}>
        <Pill active={bucket === 'hoje'}     onClick={() => setBucket('hoje')}     accent="var(--terracotta)">Hoje</Pill>
        <Pill active={bucket === 'semana'}   onClick={() => setBucket('semana')}   accent="var(--blue)">Semana</Pill>
        <Pill active={bucket === 'proximos'} onClick={() => setBucket('proximos')} accent="var(--green)">Próximos</Pill>
      </div>

      <button onClick={submit} className="tap" style={{
        marginTop: 22, width: '100%', minHeight: 64,
        borderRadius: 20,
        background: 'var(--green)', color: '#fff',
        fontSize: 22 * fontScale, fontWeight: 900,
        boxShadow: '0 6px 16px oklch(0.68 0.14 150 / 0.35)',
      }}>
        ✓ Salvar mudanças
      </button>
    </ModalSheet>
  );
}
window.EditEventModal = EditEventModal;

// ── Confirm delete modal ───────────────────────────────────
function ConfirmDeleteModal({ open, event, onConfirm, onClose, dark, fontScale = 1 }) {
  if (!open || !event) return null;
  return (
    <ModalSheet open={open} onClose={onClose}
      title="Apagar este compromisso?"
      subtitle="Pode ser apagado pra sempre"
      dark={dark} fontScale={fontScale}>
      <div style={{
        padding: '16px 18px',
        background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
        border: dark ? '1.5px solid rgba(255,255,255,0.12)' : '2px solid var(--line)',
        borderRadius: 18,
        marginBottom: 18,
      }}>
        <div style={{
          fontSize: 22 * fontScale, fontWeight: 800,
          color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          lineHeight: 1.2, marginBottom: 6,
        }}>{event.title}</div>
        <div style={{
          fontSize: 16 * fontScale, fontWeight: 700,
          color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)',
        }}>{event.when}</div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} className="tap" style={{
          flex: 1, minHeight: 64,
          borderRadius: 18,
          background: dark ? 'rgba(255,255,255,0.08)' : 'var(--cream-2)',
          color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          fontSize: 19 * fontScale, fontWeight: 800,
        }}>Não apagar</button>
        <button onClick={() => { onConfirm(event); onClose(); }} className="tap" style={{
          flex: 1, minHeight: 64,
          borderRadius: 18,
          background: 'linear-gradient(135deg, oklch(0.62 0.21 25), oklch(0.50 0.20 22))',
          color: '#fff',
          fontSize: 19 * fontScale, fontWeight: 900,
          boxShadow: '0 6px 16px oklch(0.55 0.20 25 / 0.4)',
        }}>🗑️ Apagar</button>
      </div>
    </ModalSheet>
  );
}
window.ConfirmDeleteModal = ConfirmDeleteModal;
