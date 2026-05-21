// app.jsx — Agenda da Laudi (compositor + navegação + tweaks)

// ⚙️ CONFIG REAL (PRODUÇÃO)
// ⚠️ Atenção: esta chave fica visível pra quem abrir o app no navegador.
//    Em produção séria, mover pra um backend.
const CONFIG = {
  geminiKey: 'AIzaSyAx29HfngDC__y9TdHtlZ1P8tSu8J1TAws',
  geminiModel: 'gemini-2.0-flash',
  callmebot: {
    phone: '5519996522066',
    apikey: '6812772',
  },
};
window.CONFIG = CONFIG;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "fontSize": "normal",
  "startScreen": "kanban"
}/*EDITMODE-END*/;

const OWNERS = {
  laudi: { name: 'Laudi', short: 'L', color: 'var(--laudi)', soft: 'var(--laudi-soft)', emoji: '👵' },
  cido:  { name: 'Cido',  short: 'C', color: 'var(--cido)',  soft: 'var(--cido-soft)',  emoji: '👴' },
};
window.OWNERS = OWNERS;

// Tempo "agora" pra demo — quinta 21/maio 13:00
const NOW_MIN = 13 * 60;
window.NOW_MIN = NOW_MIN;

// '14h30' -> 870 minutos
function timeToMin(t) {
  if (!t || t === '—') return null;
  const m = String(t).match(/(\d{1,2})h(\d{2})?/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2] || 0);
}
window.timeToMin = timeToMin;

function minToFriendly(diff) {
  if (diff < 0) return null;
  if (diff < 60) return `daqui ${diff} min`;
  const h = Math.floor(diff / 60), m = diff % 60;
  if (m === 0) return `daqui ${h}h`;
  return `daqui ${h}h${String(m).padStart(2,'0')}`;
}
window.minToFriendly = minToFriendly;

// ── Simulated AI parser ─────────────────────────────────────
// Detecta tipo, título e horário a partir de linguagem natural simples.
const DIAS = {
  'hoje': 'hoje', 'amanhã': 'amanha', 'amanha': 'amanha',
  'segunda': 'segunda', 'terça': 'terca', 'terca': 'terca',
  'quarta': 'quarta', 'quinta': 'quinta', 'sexta': 'sexta',
  'sábado': 'sabado', 'sabado': 'sabado', 'domingo': 'domingo',
};

function parseEvent(text) {
  const lower = text.toLowerCase();

  // Owner detection — palavras que indicam o Cido
  let owner = 'laudi';
  if (/(cido|aparecido|marido|meu esposo|do esposo|do meu marido|pro cido|do cido)/.test(lower)) {
    owner = 'cido';
  }

  // Recurrence detection
  let recurrence = null;
  if (/(todo dia|todos os dias|diariamente|todas as manh|toda manh|toda noite|todas as noites|toda semana)/.test(lower)) {
    recurrence = 'diario';
  }

  // Type detection
  let type = 'outro';
  if (/(consulta|m[ée]dic|doutor|dr\.|dra\.|exame|dentista|fisio)/.test(lower)) type = 'consulta';
  else if (/(rem[ée]dio|comprimido|pressã|medica|antibi|p[íi]lula|gota|dose|insulina)/.test(lower)) type = 'remedio';

  // Time extraction
  const timeMatch = lower.match(/(\d{1,2})\s*(?:h|:|horas?)\s*(\d{2})?/);
  let time = null;
  if (timeMatch) {
    const h = String(timeMatch[1]).padStart(2, '0');
    const m = timeMatch[2] || '00';
    time = `${h}h${m === '00' ? '' : m}`;
  } else if (/meio[\- ]?dia/.test(lower)) time = '12h';
  else if (/meia[\- ]?noite/.test(lower)) time = '00h';

  // Day extraction
  let day = null, bucket = 'semana';
  for (const k of Object.keys(DIAS)) {
    if (lower.includes(k)) { day = DIAS[k]; break; }
  }
  if (day === 'hoje') bucket = 'hoje';
  else if (!day) bucket = type === 'remedio' ? 'hoje' : 'semana';

  // Make a clean title from the message
  let title = text.trim().replace(/^(tenho|preciso|marcar|agendar|adicionar|criar|colocar)\s+/i, '');
  title = title.charAt(0).toUpperCase() + title.slice(1);
  if (title.length > 60) title = title.slice(0, 58) + '…';

  const dayLabel = {
    hoje: 'Hoje', amanha: 'Amanhã',
    segunda: 'Segunda-feira', terca: 'Terça-feira', quarta: 'Quarta-feira',
    quinta: 'Quinta-feira', sexta: 'Sexta-feira',
    sabado: 'Sábado', domingo: 'Domingo',
  }[day] || 'Esta semana';

  const when = time ? `${dayLabel} • ${time}` : dayLabel;

  return {
    id: 'evt-' + Date.now(),
    type, title, time: time || '—', bucket, when, owner, recurrence, done: false,
  };
}

// ── Gemini API call ─────────────────────────────────────────
async function parseEventWithAI(text) {
  const key = window.CONFIG?.geminiKey;
  const model = window.CONFIG?.geminiModel || 'gemini-2.0-flash';
  if (!key) return parseEvent(text); // fallback

  const today = new Date();
  const dayNames = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const ctx = `Hoje é ${dayNames[today.getDay()]}, ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}.`;

  const prompt = `Você é um assistente que extrai eventos de agenda em português brasileiro.
${ctx}

Mensagem da usuária: "${text}"

Responda APENAS um JSON válido (sem markdown, sem explicação) com este formato:
{
  "type": "consulta" | "remedio" | "outro",
  "owner": "laudi" | "cido",
  "title": "título curto, no máximo 60 caracteres",
  "time": "HH" ou "HHhMM" (ex: "08h", "14h30") ou null,
  "bucket": "hoje" | "semana" | "proximos",
  "when": "texto amigável tipo 'Hoje • 14h30' ou 'Sexta-feira • 08h'",
  "recurrence": "diario" | null
}

Regras:
- owner=cido se mencionar Cido, marido, esposo. Senão laudi.
- type=remedio se for remédio, comprimido, insulina, pílula.
- type=consulta se for médico, doutor, exame, dentista, fisio.
- recurrence=diario se mencionar "todo dia", "todos os dias", "diariamente".
- bucket=hoje se for hoje. bucket=semana se for esta semana. bucket=proximos depois.
`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      }
    );
    const data = await resp.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('empty response');
    const parsed = JSON.parse(raw);
    return {
      id: 'evt-' + Date.now(),
      type: parsed.type || 'outro',
      owner: parsed.owner || 'laudi',
      title: (parsed.title || text).slice(0, 60),
      time: parsed.time || '—',
      bucket: parsed.bucket || 'semana',
      when: parsed.when || 'Esta semana',
      recurrence: parsed.recurrence || null,
      done: false,
    };
  } catch (e) {
    console.warn('Gemini falhou, usando parser local:', e);
    return parseEvent(text);
  }
}
window.parseEventWithAI = parseEventWithAI;
function aiConfirmText(ev) {
  const word = ev.type === 'consulta' ? 'consulta'
            : ev.type === 'remedio'   ? 'lembrete de remédio'
            : 'compromisso';
  const pra = ev.owner === 'cido' ? ' do Cido' : '';
  return `Entendi! Quer que eu salve esse ${word}${pra}?`;
}

// ── Bottom navigation ───────────────────────────────────────
function NavButton({ icon, label, active, onClick, dark, fontScale }) {
  const activeBg = dark
    ? 'linear-gradient(135deg, var(--terracotta), var(--terracotta-d))'
    : 'linear-gradient(135deg, var(--terracotta), var(--terracotta-d))';
  return (
    <button onClick={onClick} className="tap" style={{
      flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 2,
      padding: '10px 4px',
      borderRadius: 20,
      background: active ? activeBg : 'transparent',
      color: active ? '#fff' : (dark ? 'rgba(255,255,255,0.6)' : 'var(--muted)'),
      minHeight: 80,
      boxShadow: active ? '0 6px 16px oklch(0.68 0.14 40 / 0.35)' : 'none',
      transition: 'all 0.2s ease',
    }}>
      <span style={{ fontSize: 26, lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontSize: 14 * fontScale, fontWeight: 800,
        letterSpacing: 0.1, whiteSpace: 'nowrap',
      }}>{label}</span>
    </button>
  );
}

function BottomNav({ current, onChange, dark, fontScale }) {
  return (
    <div style={{
      padding: '10px 12px 14px',
      background: dark ? 'rgba(0,0,0,0.35)' : '#fff',
      borderTop: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--line)',
      display: 'flex', gap: 6,
      flexShrink: 0,
    }}>
      <NavButton
        icon="💬" label="Conversar"
        active={current === 'chat'}
        onClick={() => onChange('chat')}
        dark={dark} fontScale={fontScale}
      />
      <NavButton
        icon="📋" label="Agenda"
        active={current === 'kanban'}
        onClick={() => onChange('kanban')}
        dark={dark} fontScale={fontScale}
      />
      <NavButton
        icon="💚" label="Saúde"
        active={current === 'health'}
        onClick={() => onChange('health')}
        dark={dark} fontScale={fontScale}
      />
    </div>
  );
}

// ── Seed events ─────────────────────────────────────────────
const SEED_EVENTS = [
  // Laudi — manhã já passada (13h agora)
  { id: 'e1', owner: 'laudi', type: 'remedio',  title: 'Tomar Losartana (pressão)',         time: '08h',   bucket: 'hoje',     when: 'Hoje • 08h',     recurrence: 'diario', done: true  },
  { id: 'e2', owner: 'laudi', type: 'consulta', title: 'Dr. Carlos — Cardiologista',          time: '14h30', bucket: 'hoje',     when: 'Hoje • 14h30',   recurrence: null,     done: false },
  { id: 'e3', owner: 'laudi', type: 'remedio',  title: 'Tomar Losartana (noite)',             time: '20h',   bucket: 'hoje',     when: 'Hoje • 20h',     recurrence: 'diario', done: false },
  { id: 'e4', owner: 'laudi', type: 'consulta', title: 'Exame de sangue no laboratório',     time: '07h30', bucket: 'semana',   when: 'Sexta-feira • 07h30', recurrence: null, done: false },
  { id: 'e5', owner: 'laudi', type: 'outro',    title: 'Almoço com a Maria',                  time: '12h',   bucket: 'semana',   when: 'Sábado • 12h',   recurrence: null,     done: false },
  { id: 'e6', owner: 'laudi', type: 'outro',    title: 'Aniversário do João (neto)',          time: '15h',   bucket: 'proximos', when: 'Domingo, 25 de maio • 15h', recurrence: null, done: false },
  { id: 'e7', owner: 'laudi', type: 'consulta', title: 'Dra. Helena — Dentista',              time: '09h',   bucket: 'proximos', when: 'Quarta, 28 de maio • 09h',  recurrence: null, done: false },
  // Cido
  { id: 'c1', owner: 'cido',  type: 'remedio',  title: 'Insulina — antes do café',            time: '07h',   bucket: 'hoje',     when: 'Hoje • 07h',     recurrence: 'diario', done: true  },
  { id: 'c2', owner: 'cido',  type: 'remedio',  title: 'Insulina — antes do jantar',          time: '18h30', bucket: 'hoje',     when: 'Hoje • 18h30',   recurrence: 'diario', done: false },
  { id: 'c3', owner: 'cido',  type: 'consulta', title: 'Dr. Roberto — Endocrinologista',     time: '10h',   bucket: 'semana',   when: 'Quarta-feira • 10h', recurrence: null, done: false },
  { id: 'c4', owner: 'cido',  type: 'outro',    title: 'Pescaria com o compadre Zé',         time: '06h',   bucket: 'proximos', when: 'Sexta, 30 de maio • 06h', recurrence: null, done: false },
];

const SEED_MESSAGES = [
  { kind: 'ai', text: 'Bom dia, Laudi! ☀️ Me diga o que você precisa anotar — pode ser seu ou do Cido, eu organizo aqui.' },
];

// ── App ─────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = React.useState(t.startScreen || 'kanban');
  const [events, setEvents] = React.useState(SEED_EVENTS);
  const [messages, setMessages] = React.useState(SEED_MESSAGES);
  const [pending, setPending] = React.useState(null);
  const [typing, setTyping] = React.useState(false);
  const [ownerFilter, setOwnerFilter] = React.useState('todos');
  const [contacts, setContacts] = React.useState(window.SEED_CONTACTS);
  const [sosOpen, setSosOpen] = React.useState(false);
  const [familyOpen, setFamilyOpen] = React.useState(false);
  const [printOpen, setPrintOpen] = React.useState(false);

  // Health state
  const [water, setWater] = React.useState({ cups: 4, goal: 8 });
  const [activities, setActivities] = React.useState([
    { id: 'a1', icon: '🚶', title: 'Caminhada de 10 minutos no quintal', done: true  },
    { id: 'a2', icon: '🤸', title: 'Alongar os ombros e o pescoço',     done: false },
    { id: 'a3', icon: '🧘', title: 'Respirar fundo 5 vezes',               done: false },
  ]);
  const [pressure, setPressure] = React.useState({ sys: 132, dia: 84, when: 'hoje, 07h' });
  const [pressureModalOpen, setPressureModalOpen] = React.useState(false);
  const [tipIndex, setTipIndex] = React.useState(0);

  // Alerts state
  const [alertsOpen, setAlertsOpen] = React.useState(false);
  const [activeAlarm, setActiveAlarm] = React.useState(null);
  const [toastEntry, setToastEntry] = React.useState(null);

  // Edit/delete
  const [editingEvent, setEditingEvent] = React.useState(null);
  const [deletingEvent, setDeletingEvent] = React.useState(null);
  const [editingContact, setEditingContact] = React.useState(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleEditEvent = (ev) => setEditingEvent(ev);
  const handleDeleteEvent = (ev) => setDeletingEvent(ev);
  const handleSaveEdit = (updated) => {
    setEvents(list => list.map(e => e.id === updated.id ? updated : e));
  };
  const handleConfirmDelete = (ev) => {
    setEvents(list => list.filter(e => e.id !== ev.id));
  };

  const handleSaveContact = (updated) => {
    setContacts(list => {
      const exists = list.find(c => c.id === updated.id);
      if (exists) return list.map(c => c.id === updated.id ? updated : c);
      return [...list, updated];
    });
  };
  const handleDeleteContact = (c) => {
    setContacts(list => list.filter(x => x.id !== c.id));
  };
  const handleAddContact = () => {
    setEditingContact({
      id: 'p-' + Date.now(), name: '', role: '', phone: '',
      emoji: '👨', color: 'oklch(0.62 0.13 145)', shared: false,
    });
  };

  const triggerDemoAlarm = React.useCallback(() => {
    setActiveAlarm({
      id: 'demo-' + Date.now(),
      type: 'remedio',
      title: 'Tomar Losartana',
      timeLabel: 'agora — 14h30',
      spoken: 'Laudi, está na hora do remédio da pressão. Losartana, um comprimido.',
    });
    if (window.Push.permission === 'granted') {
      window.Push.send('💊 Hora do remédio', 'Tomar Losartana (pressão) — agora', { tag: 'alarm', urgent: true });
    }
  }, []);

  const triggerWhatsAppTest = React.useCallback(() => {
    const family = contacts.filter(c => c.shared && !c.isEmergency);
    const target = family[0];
    if (!target) return;
    const entry = window.CallMeBot.send(target,
      `Olá ${target.name}! 👋 A Agenda da Laudi está conectada. Você vai receber avisos importantes aqui.`);
    setToastEntry(entry);
  }, [contacts]);

  const handleSaveContactKey = React.useCallback((id, key) => {
    setContacts(list => list.map(c =>
      c.id === id ? { ...c, callmebotKey: key, shared: key ? true : c.shared } : c));
  }, []);

  const handleToggleShare = (id) => {
    setContacts(list => list.map(c =>
      c.id === id ? { ...c, shared: !c.shared } : c));
  };

  const fontScale = t.fontSize === 'larger' ? 1.18 : 1;
  const dark = t.theme === 'board';

  const handleSend = async (text) => {
    setMessages(m => [...m, { kind: 'user', text }]);
    setTyping(true);

    const ev = await parseEventWithAI(text);
    setPending(ev);
    setTyping(false);

    // Detecta conflito de horário mesmo dono / mesma janela hoje
    const evMin = timeToMin(ev.time);
    const conflict = ev.bucket === 'hoje' && evMin != null
      ? events.find(x =>
          x.owner === ev.owner && x.bucket === 'hoje' && !x.done &&
          timeToMin(x.time) != null &&
          Math.abs(timeToMin(x.time) - evMin) < 45)
      : null;

    const newMsgs = [
      { kind: 'ai', text: aiConfirmText(ev) },
    ];
    if (conflict) {
      const nome = ev.owner === 'cido' ? 'o Cido' : 'você';
      newMsgs.push({
        kind: 'ai',
        text: `⚠️ Olha só, Laudi — ${nome} já tem "${conflict.title}" às ${conflict.time}. Quer marcar mesmo assim?`,
      });
    }
    newMsgs.push({ kind: 'confirm', event: ev });
    setMessages(m => [...m, ...newMsgs]);
  };

  const handleConfirm = (yes) => {
    if (yes && pending) {
      setEvents(e => [...e, pending]);
      const pra = pending.owner === 'cido' ? ' do Cido' : '';
      setMessages(m => [...m,
        { kind: 'ai', text: `✓ Pronto! Salvei na agenda${pra}. Posso anotar mais alguma coisa?` },
      ]);
    } else {
      setMessages(m => [...m,
        { kind: 'ai', text: 'Sem problemas! Me conte de novo do jeito certo, está bem?' },
      ]);
    }
    setPending(null);
  };

  // Troca de quem é o compromisso pendente (chat)
  const handleToggleOwner = () => {
    if (!pending) return;
    const newOwner = pending.owner === 'cido' ? 'laudi' : 'cido';
    const updated = { ...pending, owner: newOwner };
    setPending(updated);
    setMessages(m => m.map(msg =>
      msg.kind === 'confirm' && msg.event.id === pending.id
        ? { ...msg, event: updated }
        : msg
    ));
  };

  // Marcar como feito / desfazer
  const handleToggleDone = (eventId) => {
    setEvents(list => list.map(e =>
      e.id === eventId ? { ...e, done: !e.done } : e
    ));
  };

  // Frame dims
  const W = 412, H = 892;

  return (
    <>
      <AndroidDevice width={W} height={H} dark={dark}>
        <div style={{
          position: 'relative',
          display: 'flex', flexDirection: 'column',
          height: '100%',
          fontFamily: "'Nunito', sans-serif",
        }}>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {screen === 'chat' && (
              <ChatScreen
                messages={messages}
                onSend={handleSend}
                onConfirm={handleConfirm}
                onToggleOwner={handleToggleOwner}
                pendingOwner={pending?.owner}
                fontScale={fontScale}
                isTyping={typing}
              />
            )}
            {screen === 'kanban' && (
              <KanbanScreen
                events={events}
                ownerFilter={ownerFilter}
                onOwnerFilterChange={setOwnerFilter}
                onToggleDone={handleToggleDone}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                contacts={contacts}
                onOpenFamily={() => setFamilyOpen(true)}
                onOpenPrint={() => setPrintOpen(true)}
                onOpenAlerts={() => setAlertsOpen(true)}
                onOpenSettings={() => setSettingsOpen(true)}
                dark={dark}
                fontScale={fontScale}
              />
            )}
            {screen === 'health' && (
              <HealthScreen
                water={water} activities={activities}
                pressure={pressure} tipIndex={tipIndex}
                onWaterAdd={() => setWater(w => ({ ...w, cups: Math.min(w.goal, w.cups + 1) }))}
                onWaterRemove={() => setWater(w => ({ ...w, cups: Math.max(0, w.cups - 1) }))}
                onActivityToggle={(id) => setActivities(list =>
                  list.map(a => a.id === id ? { ...a, done: !a.done } : a))}
                onLogPressure={() => setPressureModalOpen(true)}
                onNextTip={() => setTipIndex(i => i + 1)}
                dark={dark} fontScale={fontScale}
              />
            )}
          </div>
          <BottomNav
            current={screen}
            onChange={setScreen}
            dark={dark}
            fontScale={fontScale}
          />

          {/* Floating emergency button — always visible on top of content */}
          <EmergencyButton onClick={() => setSosOpen(true)} fontScale={fontScale} />

          {/* Modais — confinados ao frame do celular */}
          <EmergencyModal
            open={sosOpen} onClose={() => setSosOpen(false)}
            contacts={contacts} dark={dark} fontScale={fontScale}
          />
          <FamilyModal
            open={familyOpen} onClose={() => setFamilyOpen(false)}
            contacts={contacts} onToggleShare={handleToggleShare}
            onEditContact={(c) => { setFamilyOpen(false); setTimeout(() => setEditingContact(c), 200); }}
            onAddContact={() => { setFamilyOpen(false); setTimeout(handleAddContact, 200); }}
            dark={dark} fontScale={fontScale}
          />
          <PrintView
            open={printOpen} onClose={() => setPrintOpen(false)}
            events={events} fontScale={fontScale}
          />
          <PressureLogModal
            open={pressureModalOpen} onClose={() => setPressureModalOpen(false)}
            onSave={(sys, dia) => {
              setPressure({ sys, dia, when: 'agora' });
              // Alta = avisa família automaticamente
              if (sys >= 140 || dia >= 90) {
                const family = contacts.filter(c => c.shared && c.callmebotKey);
                family.forEach(c => {
                  const entry = window.CallMeBot.send(c,
                    `⚠️ Mamãe (Laudi) acabou de medir a pressão: ${sys}/${dia}. Está um pouco alta. Última medida foi às ${pressure.when}.`);
                  setToastEntry(entry);
                });
              }
            }}
            dark={dark} fontScale={fontScale}
          />
          <AlertsModal
            open={alertsOpen} onClose={() => setAlertsOpen(false)}
            contacts={contacts}
            onSaveContactKey={handleSaveContactKey}
            onTestAlarm={() => { setAlertsOpen(false); setTimeout(triggerDemoAlarm, 250); }}
            onTestWhatsApp={triggerWhatsAppTest}
            dark={dark} fontScale={fontScale}
          />
          <AlarmOverlay
            alert={activeAlarm}
            dark={dark} fontScale={fontScale}
            onSnooze={() => setActiveAlarm(null)}
            onDone={() => {
              setActiveAlarm(null);
              // Avisa família que tomou o remédio
              const family = contacts.filter(c => c.shared && c.callmebotKey);
              if (family.length > 0) {
                family.forEach(c => {
                  const entry = window.CallMeBot.send(c,
                    `✓ Mamãe (Laudi) tomou "${activeAlarm?.title}" agora. Tudo certo!`);
                  setToastEntry(entry);
                });
              }
            }}
          />
          <NotificationToast entry={toastEntry} onClose={() => setToastEntry(null)} />
          <EditEventModal
            open={!!editingEvent} event={editingEvent}
            onSave={handleSaveEdit}
            onClose={() => setEditingEvent(null)}
            dark={dark} fontScale={fontScale}
          />
          <ConfirmDeleteModal
            open={!!deletingEvent} event={deletingEvent}
            onConfirm={handleConfirmDelete}
            onClose={() => setDeletingEvent(null)}
            dark={dark} fontScale={fontScale}
          />
          <ContactEditModal
            open={!!editingContact} contact={editingContact}
            onSave={handleSaveContact}
            onDelete={handleDeleteContact}
            onClose={() => setEditingContact(null)}
            dark={dark} fontScale={fontScale}
          />
          <SettingsModal
            open={settingsOpen} onClose={() => setSettingsOpen(false)}
            onOpenFamily={() => setFamilyOpen(true)}
            onOpenAlerts={() => setAlertsOpen(true)}
            onOpenPrint={() => setPrintOpen(true)}
            dark={dark} fontScale={fontScale}
          />
        </div>
      </AndroidDevice>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Aparência">
          <TweakRadio
            label="Tema"
            value={t.theme}
            options={[
              { value: 'light', label: 'Claro' },
              { value: 'board', label: 'Lousa' },
            ]}
            onChange={(v) => setTweak('theme', v)}
          />
          <TweakRadio
            label="Tamanho da letra"
            value={t.fontSize}
            options={[
              { value: 'normal', label: 'Grande' },
              { value: 'larger', label: 'Maior' },
            ]}
            onChange={(v) => setTweak('fontSize', v)}
          />
        </TweakSection>
        <TweakSection label="Navegação">
          <TweakRadio
            label="Tela inicial"
            value={screen}
            options={[
              { value: 'chat',   label: 'Chat' },
              { value: 'kanban', label: 'Agenda' },
              { value: 'health', label: 'Saúde' },
            ]}
            onChange={(v) => { setScreen(v); setTweak('startScreen', v); }}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
