// family.jsx — Contatos da família, botão de emergência, compartilhamento, modo imprimir

const SEED_CONTACTS = [
  { id: 'joao',   name: 'João',    role: 'Filho',    phone: '(11) 9 8765-4321', emoji: '👨', color: 'oklch(0.62 0.13 145)', shared: true },
  { id: 'maria',  name: 'Maria',   role: 'Filha',    phone: '(11) 9 1234-5678', emoji: '👩', color: 'oklch(0.62 0.13 320)', shared: true },
  { id: 'pedro',  name: 'Pedro',   role: 'Neto',     phone: '(11) 9 5555-1111', emoji: '🧑', color: 'oklch(0.62 0.13 195)', shared: false },
  { id: 'samu',   name: 'SAMU',    role: 'Emergência', phone: '192',           emoji: '🚑', color: 'oklch(0.55 0.18 25)',  shared: false, isEmergency: true },
];
window.SEED_CONTACTS = SEED_CONTACTS;

// ── Big red emergency button ────────────────────────────────
function EmergencyButton({ onClick, fontScale = 1 }) {
  return (
    <button onClick={onClick} aria-label="Emergência" className="tap" style={{
      position: 'absolute',
      top: 12, right: 12,
      zIndex: 30,
      width: 64, height: 64,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, oklch(0.62 0.21 25), oklch(0.50 0.20 22))',
      color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 6px 18px oklch(0.55 0.20 25 / 0.45), 0 0 0 4px rgba(255,255,255,0.85)',
      gap: 0,
    }}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M5 4a2 2 0 0 1 2-2h2.5a1 1 0 0 1 1 0.8l1 4a1 1 0 0 1-.5 1.1L9 9c1 2 3 4 5 5l1-2a1 1 0 0 1 1.1-.5l4 1a1 1 0 0 1 .8 1V16a2 2 0 0 1-2 2C10.6 18 4 11.4 4 6V4z"
              fill="currentColor"/>
      </svg>
      <span style={{ fontSize: 9 * fontScale, fontWeight: 900, letterSpacing: 0.5, marginTop: -2 }}>SOS</span>
    </button>
  );
}

window.EmergencyButton = EmergencyButton;

// ── Modal sheet base ────────────────────────────────────────
function ModalSheet({ open, onClose, title, subtitle, children, dark, fontScale = 1, color = 'var(--terracotta)' }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
      }} />
      <div onClick={(e) => e.stopPropagation()} style={{
        position: 'relative',
        width: '100%',
        maxHeight: '88%',
        background: dark ? 'oklch(0.28 0.02 160)' : 'var(--cream)',
        borderRadius: '32px 32px 0 0',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column',
        animation: 'bubbleIn 0.25s ease-out',
        overflow: 'hidden',
      }}>
        {/* drag handle */}
        <div style={{
          width: 48, height: 5, borderRadius: 999,
          background: dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)',
          margin: '10px auto 0',
          flexShrink: 0,
        }} />
        {/* header */}
        <div style={{ padding: '12px 22px 6px', flexShrink: 0 }}>
          <div style={{
            fontSize: 28 * fontScale, fontWeight: 900,
            color: dark ? 'var(--board-chalk)' : 'var(--ink)',
            lineHeight: 1.15,
          }}>{title}</div>
          {subtitle && (
            <div style={{
              fontSize: 17 * fontScale, fontWeight: 600,
              color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)',
              marginTop: 4,
            }}>{subtitle}</div>
          )}
        </div>
        {/* body */}
        <div className="no-scrollbar" style={{
          flex: 1, overflowY: 'auto',
          padding: '14px 18px 12px',
        }}>{children}</div>
        {/* close */}
        <button onClick={onClose} className="tap" style={{
          margin: '4px 18px 20px',
          background: dark ? 'rgba(255,255,255,0.1)' : '#fff',
          border: dark ? '1px solid rgba(255,255,255,0.15)' : '2px solid var(--line)',
          color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          borderRadius: 20,
          padding: '16px',
          fontSize: 20 * fontScale, fontWeight: 800,
          flexShrink: 0,
        }}>Fechar</button>
      </div>
    </div>
  );
}

// ── Emergency modal ─────────────────────────────────────────
function EmergencyModal({ open, onClose, contacts, dark, fontScale = 1 }) {
  // SAMU primeiro, depois filhos
  const ordered = [...contacts].sort((a, b) =>
    (b.isEmergency ? 1 : 0) - (a.isEmergency ? 1 : 0)
  );
  return (
    <ModalSheet open={open} onClose={onClose}
      title="Precisa de ajuda?" subtitle="Toque pra ligar agora"
      dark={dark} fontScale={fontScale}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ordered.map(c => (
          <a key={c.id} href={`tel:${c.phone.replace(/\D/g, '')}`} className="tap" style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '18px 20px',
            background: c.isEmergency
              ? 'linear-gradient(135deg, oklch(0.62 0.21 25), oklch(0.50 0.20 22))'
              : (dark ? 'rgba(255,255,255,0.08)' : '#fff'),
            border: c.isEmergency ? 'none' : (dark ? '1px solid rgba(255,255,255,0.12)' : '2px solid var(--line)'),
            borderRadius: 22,
            textDecoration: 'none',
            color: c.isEmergency ? '#fff' : (dark ? 'var(--board-chalk)' : 'var(--ink)'),
            boxShadow: c.isEmergency ? '0 8px 24px oklch(0.55 0.20 25 / 0.4)' : 'none',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: c.isEmergency ? 'rgba(255,255,255,0.25)' : c.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, flexShrink: 0,
              color: '#fff', fontWeight: 900,
            }}>{c.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22 * fontScale, fontWeight: 900, lineHeight: 1.1 }}>
                {c.isEmergency ? 'Ligar pro SAMU' : `Ligar pro ${c.name}`}
              </div>
              <div style={{
                fontSize: 16 * fontScale, fontWeight: 700,
                opacity: 0.8, marginTop: 4,
              }}>{c.role} • {c.phone}</div>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: c.isEmergency ? 'rgba(255,255,255,0.25)' : 'var(--green)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
          </a>
        ))}
      </div>
    </ModalSheet>
  );
}

window.ModalSheet = ModalSheet;
window.EmergencyModal = EmergencyModal;

// ── Family strip (top of kanban) ────────────────────────────
function FamilyStrip({ contacts, onOpen, dark, fontScale = 1 }) {
  const shared = contacts.filter(c => c.shared && !c.isEmergency);
  return (
    <button onClick={onOpen} className="tap" style={{
      width: '100%',
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      background: dark ? 'rgba(255,255,255,0.05)' : '#fff',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1.5px solid var(--line)',
      borderRadius: 18,
      textAlign: 'left',
      minHeight: 64,
    }}>
      <div style={{
        display: 'flex',
      }}>
        {shared.length === 0 && (
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: dark ? 'rgba(255,255,255,0.1)' : 'var(--cream-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>👨‍👩‍👧</div>
        )}
        {shared.slice(0, 3).map((c, i) => (
          <div key={c.id} style={{
            width: 44, height: 44, borderRadius: '50%',
            background: c.color,
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900,
            marginLeft: i === 0 ? 0 : -12,
            border: `3px solid ${dark ? 'oklch(0.22 0.02 160)' : 'var(--cream)'}`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          }}>{c.emoji}</div>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15 * fontScale, fontWeight: 700,
          color: dark ? 'rgba(255,255,255,0.6)' : 'var(--muted)',
          textTransform: 'uppercase', letterSpacing: 0.6,
        }}>Família vê esta agenda</div>
        <div style={{
          fontSize: 17 * fontScale, fontWeight: 800,
          color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          lineHeight: 1.2, marginTop: 2,
        }}>
          {shared.length === 0
            ? 'Ninguém ainda — toque pra adicionar'
            : shared.map(c => c.name).join(', ')}
        </div>
      </div>
      <svg width="14" height="22" viewBox="0 0 14 22" fill="none" style={{ flexShrink: 0 }}>
        <path d="M2 2l9 9-9 9" stroke={dark ? 'rgba(255,255,255,0.4)' : 'var(--muted)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function FamilyModal({ open, onClose, contacts, onToggleShare, onEditContact, onAddContact, dark, fontScale = 1 }) {
  const family = contacts.filter(c => !c.isEmergency);
  return (
    <ModalSheet open={open} onClose={onClose}
      title="Família"
      subtitle="Quem pode ver e ajudar a cuidar da agenda"
      dark={dark} fontScale={fontScale}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {family.map(c => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 14px',
            background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
            border: dark ? '1px solid rgba(255,255,255,0.1)' : '2px solid var(--line)',
            borderRadius: 20,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: c.color, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 900, flexShrink: 0,
            }}>{c.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 20 * fontScale, fontWeight: 800,
                color: dark ? 'var(--board-chalk)' : 'var(--ink)',
                lineHeight: 1.1,
              }}>{c.name}</div>
              <div style={{
                fontSize: 15 * fontScale, fontWeight: 600,
                color: dark ? 'rgba(255,255,255,0.6)' : 'var(--ink-soft)',
                marginTop: 2,
              }}>{c.role} • {c.phone}</div>
            </div>
            <button onClick={() => onEditContact(c)} aria-label="Editar" className="tap" style={{
              width: 44, height: 44, borderRadius: 12,
              background: dark ? 'rgba(255,255,255,0.08)' : 'var(--cream-2)',
              color: dark ? 'var(--board-chalk)' : 'var(--ink)',
              fontSize: 20, flexShrink: 0,
            }}>✏️</button>
            <button onClick={() => onToggleShare(c.id)} aria-label={c.shared ? 'Compartilhada' : 'Compartilhar'} className="tap" style={{
              width: 44, height: 44, borderRadius: 12,
              background: c.shared ? 'var(--green)' : (dark ? 'rgba(255,255,255,0.08)' : 'var(--cream-2)'),
              color: c.shared ? '#fff' : (dark ? 'rgba(255,255,255,0.5)' : 'var(--muted)'),
              fontSize: 22, fontWeight: 900, flexShrink: 0,
            }}>{c.shared ? '✓' : '○'}</button>
          </div>
        ))}

        <button onClick={onAddContact} className="tap" style={{
          marginTop: 4,
          padding: '16px',
          borderRadius: 20,
          background: 'transparent',
          border: dark ? '2px dashed rgba(255,255,255,0.18)' : '2px dashed var(--line)',
          color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)',
          fontSize: 18 * fontScale, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          minHeight: 64,
        }}>
          <span style={{ fontSize: 24 }}>＋</span>
          <span>Adicionar alguém da família</span>
        </button>
      </div>
    </ModalSheet>
  );
}

window.FamilyStrip = FamilyStrip;
window.FamilyModal = FamilyModal;

// ── Edit / Add contact ─────────────────────────────────────
const EMOJIS = ['👨','👩','🧑','👦','👧','👴','👵','🧓','👶','🐶','💼','❤️'];
const COLORS = [
  'oklch(0.62 0.13 145)', // verde
  'oklch(0.62 0.13 320)', // rosa
  'oklch(0.62 0.13 195)', // teal
  'oklch(0.62 0.13 35)',  // terracota
  'oklch(0.55 0.18 25)',  // vermelho
  'oklch(0.62 0.13 260)', // azul
  'oklch(0.62 0.13 95)',  // amarelo
  'oklch(0.55 0.10 215)', // azul escuro
];

function ContactEditModal({ open, contact, onSave, onDelete, onClose, dark, fontScale = 1 }) {
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [emoji, setEmoji] = React.useState('👨');
  const [color, setColor] = React.useState(COLORS[0]);

  React.useEffect(() => {
    if (contact) {
      setName(contact.name || '');
      setRole(contact.role || '');
      setPhone(contact.phone || '');
      setEmoji(contact.emoji || '👨');
      setColor(contact.color || COLORS[0]);
    }
  }, [contact]);

  if (!open || !contact) return null;
  const isNew = !contact.name;

  const Label = ({ children }) => (
    <div style={{
      fontSize: 13 * fontScale, fontWeight: 900, letterSpacing: 0.8,
      color: dark ? 'rgba(255,255,255,0.55)' : 'var(--muted)',
      textTransform: 'uppercase', marginBottom: 6, marginTop: 14,
    }}>{children}</div>
  );

  const Field = ({ value, onChange, placeholder }) => (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
      width: '100%', boxSizing: 'border-box',
      padding: '14px 18px', borderRadius: 14,
      background: dark ? 'rgba(0,0,0,0.3)' : '#fff',
      border: dark ? '1.5px solid rgba(255,255,255,0.15)' : '2px solid var(--line)',
      color: dark ? 'var(--board-chalk)' : 'var(--ink)',
      fontSize: 19 * fontScale, fontWeight: 700, fontFamily: 'inherit',
      outline: 'none',
    }} />
  );

  return (
    <ModalSheet open={open} onClose={onClose}
      title={isNew ? 'Adicionar pessoa' : 'Editar pessoa'}
      dark={dark} fontScale={fontScale}>

      <Label>Nome</Label>
      <Field value={name} onChange={setName} placeholder="Ex: João" />

      <Label>Função / parentesco</Label>
      <Field value={role} onChange={setRole} placeholder="Ex: Filho, Neta, Cuidadora…" />

      <Label>Telefone com DDD</Label>
      <Field value={phone} onChange={setPhone} placeholder="(11) 9 8765-4321" />

      <Label>Foto / símbolo</Label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {EMOJIS.map(em => (
          <button key={em} onClick={() => setEmoji(em)} className="tap" style={{
            width: 50, height: 50, borderRadius: 14, fontSize: 26,
            background: emoji === em ? color : (dark ? 'rgba(255,255,255,0.06)' : '#fff'),
            border: emoji === em ? `2px solid ${color}` : (dark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid var(--line)'),
            color: '#fff',
          }}>{em}</button>
        ))}
      </div>

      <Label>Cor</Label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} aria-label="cor" className="tap" style={{
            width: 44, height: 44, borderRadius: '50%',
            background: c,
            border: color === c ? '4px solid #fff' : 'none',
            boxShadow: color === c ? `0 0 0 2.5px ${c}` : '0 2px 6px rgba(0,0,0,0.15)',
          }} />
        ))}
      </div>

      <button onClick={() => { onSave({ ...contact, name, role, phone, emoji, color }); onClose(); }}
        disabled={!name.trim()} className="tap" style={{
          marginTop: 22, width: '100%', minHeight: 64,
          borderRadius: 20,
          background: name.trim() ? 'var(--green)' : 'var(--line)',
          color: '#fff',
          fontSize: 22 * fontScale, fontWeight: 900,
          opacity: name.trim() ? 1 : 0.5,
          boxShadow: name.trim() ? '0 6px 16px oklch(0.68 0.14 150 / 0.35)' : 'none',
        }}>
        ✓ Salvar
      </button>

      {!isNew && onDelete && (
        <button onClick={() => { onDelete(contact); onClose(); }} className="tap" style={{
          marginTop: 10, width: '100%', minHeight: 56,
          borderRadius: 16, background: 'transparent',
          border: dark ? '1.5px solid rgba(255,80,60,0.4)' : '1.5px solid oklch(0.78 0.15 25)',
          color: 'var(--terracotta-d)',
          fontSize: 17 * fontScale, fontWeight: 800,
        }}>🗑️ Remover pessoa</button>
      )}
    </ModalSheet>
  );
}
window.ContactEditModal = ContactEditModal;

// ── Settings sheet ─────────────────────────────────────────
function SettingsModal({ open, onClose, onOpenFamily, onOpenAlerts, onOpenPrint, dark, fontScale = 1 }) {
  const Item = ({ icon, title, subtitle, onClick }) => (
    <button onClick={onClick} className="tap" style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '16px 16px', textAlign: 'left',
      background: dark ? 'rgba(255,255,255,0.05)' : '#fff',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1.5px solid var(--line)',
      borderRadius: 18, width: '100%', minHeight: 76,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: dark ? 'rgba(255,255,255,0.1)' : 'var(--cream-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 19 * fontScale, fontWeight: 900,
          color: dark ? 'var(--board-chalk)' : 'var(--ink)',
          lineHeight: 1.15,
        }}>{title}</div>
        <div style={{
          fontSize: 14 * fontScale, fontWeight: 700,
          color: dark ? 'rgba(255,255,255,0.6)' : 'var(--ink-soft)',
          marginTop: 2,
        }}>{subtitle}</div>
      </div>
      <span style={{
        fontSize: 22, color: dark ? 'rgba(255,255,255,0.4)' : 'var(--muted)',
      }}>›</span>
    </button>
  );
  return (
    <ModalSheet open={open} onClose={onClose}
      title="Configurações" dark={dark} fontScale={fontScale}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Item icon="👨‍👩‍👧" title="Família" subtitle="Adicionar, editar contatos da família"
          onClick={() => { onClose(); setTimeout(onOpenFamily, 250); }} />
        <Item icon="🔔" title="Avisos" subtitle="Alarme, push e WhatsApp da família"
          onClick={() => { onClose(); setTimeout(onOpenAlerts, 250); }} />
        <Item icon="🖨️" title="Imprimir agenda" subtitle="Vista grande pra colar na geladeira"
          onClick={() => { onClose(); setTimeout(onOpenPrint, 250); }} />
      </div>
      <div style={{
        marginTop: 18, padding: '12px 16px',
        background: dark ? 'rgba(255,255,255,0.04)' : 'var(--cream-2)',
        borderRadius: 14,
        fontSize: 13 * fontScale, fontWeight: 600, lineHeight: 1.4,
        color: dark ? 'rgba(255,255,255,0.6)' : 'var(--ink-soft)',
        textAlign: 'center',
      }}>
        Agenda da Laudi & Cido • feita com carinho 💛
      </div>
    </ModalSheet>
  );
}
window.SettingsModal = SettingsModal;

// ── Print/show modal ────────────────────────────────────────
function PrintView({ open, onClose, events, fontScale = 1 }) {
  if (!open) return null;

  const sections = [
    { id: 'hoje',     title: 'HOJE — quinta, 21 de maio' },
    { id: 'semana',   title: 'ESTA SEMANA' },
    { id: 'proximos', title: 'PRÓXIMOS' },
  ];

  const handlePrint = () => {
    const html = document.getElementById('print-canvas').innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`<!doctype html><html><head><title>Agenda da Laudi</title>
      <style>
        body { font-family: 'Nunito', system-ui, sans-serif; margin: 32px; color: #222; }
        h1 { font-size: 36px; margin: 0 0 6px; }
        h2 { font-size: 20px; letter-spacing: 1px; color: #777; margin: 28px 0 12px; border-bottom: 2px solid #ddd; padding-bottom: 6px; }
        .ev { display: flex; gap: 16px; padding: 14px 0; border-bottom: 1px dashed #ddd; align-items: baseline; }
        .ev .ic { font-size: 28px; width: 40px; }
        .ev .tm { font-size: 22px; font-weight: 900; min-width: 90px; }
        .ev .ti { font-size: 22px; font-weight: 700; flex: 1; }
        .ev .ow { font-size: 16px; color: #888; font-weight: 700; }
        .done .ti { text-decoration: line-through; opacity: 0.6; }
      </style></head><body>${html}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 110,
      background: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* close + print bar */}
      <div style={{
        padding: '20px 16px 14px',
        display: 'flex', gap: 10,
        flexShrink: 0,
        borderBottom: '1px solid var(--line)',
      }}>
        <button onClick={onClose} className="tap" style={{
          minHeight: 56, padding: '0 18px',
          borderRadius: 16,
          background: 'var(--cream-2)',
          color: 'var(--ink)',
          fontSize: 18 * fontScale, fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 22 }}>←</span> Voltar
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={handlePrint} className="tap" style={{
          minHeight: 56, padding: '0 18px',
          borderRadius: 16,
          background: 'var(--terracotta)',
          color: '#fff',
          fontSize: 18 * fontScale, fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 12px oklch(0.68 0.14 40 / 0.35)',
        }}>
          <span style={{ fontSize: 22 }}>🖨</span> Imprimir
        </button>
      </div>

      <div className="no-scrollbar" style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 22px 32px',
      }}>
        <div id="print-canvas">
          <h1 style={{
            fontFamily: 'Nunito', fontSize: 34 * fontScale, fontWeight: 900,
            margin: '0 0 4px', color: 'var(--ink)',
          }}>Agenda da Laudi & Cido</h1>
          <div style={{
            fontSize: 17 * fontScale, color: 'var(--muted)', fontWeight: 700,
            marginBottom: 8,
          }}>Semana de 21 a 28 de maio de 2026</div>

          {sections.map(sec => {
            const items = events.filter(e => e.bucket === sec.id);
            return (
              <div key={sec.id}>
                <h2 style={{
                  fontFamily: 'Nunito', fontSize: 16 * fontScale, fontWeight: 900,
                  letterSpacing: 1.2, color: 'var(--muted)',
                  margin: '24px 0 10px', borderBottom: '2px solid var(--line)',
                  paddingBottom: 6,
                }}>{sec.title}</h2>
                {items.length === 0 && (
                  <div style={{
                    fontSize: 18 * fontScale, color: 'var(--muted)',
                    fontStyle: 'italic', padding: '10px 0',
                  }}>Nada nesta janela</div>
                )}
                {items.map(ev => {
                  const meta = window.TYPE_META[ev.type];
                  const owner = window.OWNERS[ev.owner];
                  return (
                    <div key={ev.id} className={`ev ${ev.done ? 'done' : ''}`} style={{
                      display: 'flex', gap: 14, padding: '14px 0',
                      borderBottom: '1px dashed var(--line)',
                      alignItems: 'baseline',
                    }}>
                      <span className="ic" style={{ fontSize: 26, width: 36 }}>{meta.icon}</span>
                      <span className="tm" style={{
                        fontSize: 22 * fontScale, fontWeight: 900,
                        minWidth: 80, color: 'var(--ink)',
                      }}>{ev.time}</span>
                      <span className="ti" style={{
                        fontSize: 22 * fontScale, fontWeight: 700,
                        flex: 1, color: 'var(--ink)',
                        textDecoration: ev.done ? 'line-through' : 'none',
                        opacity: ev.done ? 0.55 : 1,
                      }}>{ev.title}</span>
                      <span className="ow" style={{
                        fontSize: 16 * fontScale, fontWeight: 800,
                        color: owner.color,
                      }}>{owner.name}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PrintButton({ onClick, dark, fontScale = 1 }) {
  return (
    <button onClick={onClick} className="tap" style={{
      width: '100%', minHeight: 60,
      borderRadius: 18,
      background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
      border: dark ? '1px solid rgba(255,255,255,0.1)' : '1.5px solid var(--line)',
      color: dark ? 'var(--board-chalk)' : 'var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontSize: 18 * fontScale, fontWeight: 800,
      padding: '12px 16px',
    }}>
      <span style={{ fontSize: 24 }}>🖨</span>
      <span>Imprimir ou mostrar pra alguém</span>
    </button>
  );
}

window.PrintView = PrintView;
window.PrintButton = PrintButton;
