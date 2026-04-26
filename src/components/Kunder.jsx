import { useState } from 'react';
import { Card, Avatar, Badge, Btn, Input, Select, Textarea, Modal, MetaRow, SectionLabel, Divider } from './UI';

const TYPER = ['Kommune', 'Privat', 'Helseforetak'];
const STATUSER = ['Lead', 'Aktiv', 'Inaktiv'];

function KundeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    navn: '', kontakt: '', epost: '', tlf: '', type: 'Kommune', status: 'Lead', notat: ''
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <Input label="Navn *" value={form.navn} onChange={e => set('navn', e.target.value)} required />
      <Input label="Kontaktperson" value={form.kontakt} onChange={e => set('kontakt', e.target.value)} />
      <Input label="E-post" type="email" value={form.epost} onChange={e => set('epost', e.target.value)} />
      <Input label="Telefon" value={form.tlf} onChange={e => set('tlf', e.target.value)} />
      <Select label="Type" value={form.type} onChange={e => set('type', e.target.value)}>
        {TYPER.map(t => <option key={t}>{t}</option>)}
      </Select>
      <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
        {STATUSER.map(s => <option key={s}>{s}</option>)}
      </Select>
      <Textarea label="Notat" value={form.notat} onChange={e => set('notat', e.target.value)} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn onClick={onCancel}>Avbryt</Btn>
        <Btn variant="primary" type="submit">Lagre</Btn>
      </div>
    </form>
  );
}

function KundeDetail({ kunde, vakter, vikarer, onEdit, onDelete, onClose }) {
  const kundeVakter = vakter.filter(v => v.kundeId === kunde.id)
    .sort((a, b) => b.dato.localeCompare(a.dato));
  const totalTimer = kundeVakter.reduce((s, v) => s + (Number(v.timer) || 0), 0);

  function vikarNavn(id) { return vikarer.find(v => v.id === id)?.navn || id; }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Avatar name={kunde.navn} size={46} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{kunde.navn}</div>
          <Badge status={kunde.status} />
        </div>
      </div>
      <MetaRow label="Kontaktperson" value={kunde.kontakt} />
      <MetaRow label="E-post" value={kunde.epost} />
      <MetaRow label="Telefon" value={kunde.tlf} />
      <MetaRow label="Type" value={kunde.type} />
      <MetaRow label="Totale timer" value={`${totalTimer}t (${kundeVakter.length} vakter)`} />
      {kunde.notat && (
        <>
          <Divider />
          <SectionLabel>Notat</SectionLabel>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{kunde.notat}</p>
        </>
      )}
      {kundeVakter.length > 0 && (
        <>
          <Divider />
          <SectionLabel>Siste vakter</SectionLabel>
          {kundeVakter.slice(0, 4).map(v => (
            <div key={v.id} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', borderBottom: '1px solid #f5f5f8', fontSize: 13,
            }}>
              <span>{v.dato} · {vikarNavn(v.vikarId)}</span>
              <span style={{ color: '#888' }}>{v.timer}t</span>
            </div>
          ))}
        </>
      )}
      <Divider />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="danger" onClick={onDelete}>Slett</Btn>
        <Btn onClick={onClose}>Lukk</Btn>
        <Btn variant="primary" onClick={onEdit}>Rediger</Btn>
      </div>
    </div>
  );
}

export default function Kunder({ data, dispatch }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const filtered = data.kunder.filter(k =>
    (k.navn + k.kontakt + k.epost).toLowerCase().includes(search.toLowerCase())
  );

  function handleSave(form) {
    if (editing) {
      dispatch({ type: 'UPDATE', entity: 'kunder', item: { ...editing, ...form } });
      setEditing(null);
    } else {
      dispatch({ type: 'ADD', entity: 'kunder', item: form });
    }
    setShowForm(false);
  }

  function handleDelete(id) {
    if (window.confirm('Slett kunden?')) {
      dispatch({ type: 'DELETE', entity: 'kunder', id });
      setViewing(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 20 }}>Kunder</h2>
        <Btn variant="primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Ny kunde</Btn>
      </div>

      <input
        placeholder="Søk på navn, kontakt, e-post…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', maxWidth: 340, padding: '8px 12px',
          border: '1px solid #dde', borderRadius: 8, marginBottom: 16,
          background: '#fafbfc',
        }}
      />

      {filtered.length === 0 ? (
        <p style={{ color: '#aaa', marginTop: 16 }}>Ingen kunder funnet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {filtered.map(k => (
            <Card key={k.id} onClick={() => setViewing(k)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Avatar name={k.navn} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {k.navn}
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>{k.type}</div>
                </div>
                <Badge status={k.status} />
              </div>
              {k.kontakt && <div style={{ fontSize: 12, color: '#666' }}>{k.kontakt}</div>}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm || !!editing} onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Rediger kunde' : 'Ny kunde'}>
        <KundeForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>

      <Modal open={!!viewing && !editing} onClose={() => setViewing(null)} title="Kundedetaljer">
        {viewing && (
          <KundeDetail
            kunde={viewing}
            vakter={data.vakter}
            vikarer={data.vikarer}
            onEdit={() => { setEditing(viewing); setViewing(null); setShowForm(false); }}
            onDelete={() => handleDelete(viewing.id)}
            onClose={() => setViewing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
