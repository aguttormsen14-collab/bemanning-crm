import { useState } from 'react';
import { Card, Avatar, Badge, Btn, Input, Select, Textarea, Modal, MetaRow, SectionLabel, Divider } from './UI';
import { ROLLER, TILGJENGELIGHET } from '../data';

const STATUSER = ['Ledig', 'Aktiv', 'Inaktiv'];

function VikarForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    navn: '', rolle: ROLLER[0], tlf: '', epost: '', adresse: '',
    tilgjengelighet: TILGJENGELIGHET[0], status: 'Ledig', kontonummer: '', notat: ''
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <Input label="Navn *" value={form.navn} onChange={e => set('navn', e.target.value)} required />
      <Select label="Rolle" value={form.rolle} onChange={e => set('rolle', e.target.value)}>
        {ROLLER.map(r => <option key={r}>{r}</option>)}
      </Select>
      <Input label="Telefon" value={form.tlf} onChange={e => set('tlf', e.target.value)} />
      <Input label="E-post" type="email" value={form.epost} onChange={e => set('epost', e.target.value)} />
      <Input label="Adresse" value={form.adresse} onChange={e => set('adresse', e.target.value)} />
      <Select label="Tilgjengelighet" value={form.tilgjengelighet} onChange={e => set('tilgjengelighet', e.target.value)}>
        {TILGJENGELIGHET.map(t => <option key={t}>{t}</option>)}
      </Select>
      <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
        {STATUSER.map(s => <option key={s}>{s}</option>)}
      </Select>
      <Input label="Kontonummer" value={form.kontonummer} onChange={e => set('kontonummer', e.target.value)} placeholder="xxxx.xx.xxxxx" />
      <Textarea label="Notat" value={form.notat} onChange={e => set('notat', e.target.value)} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn onClick={onCancel}>Avbryt</Btn>
        <Btn variant="primary" type="submit">Lagre</Btn>
      </div>
    </form>
  );
}

function VikarDetail({ vikar, vakter, kunder, onEdit, onDelete, onClose }) {
  const vikarVakter = vakter.filter(v => v.vikarId === vikar.id)
    .sort((a, b) => b.dato.localeCompare(a.dato));
  const totalTimer = vikarVakter.reduce((s, v) => s + (Number(v.timer) || 0), 0);

  function kundeNavn(id) { return kunder.find(k => k.id === id)?.navn || id; }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Avatar name={vikar.navn} size={46} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{vikar.navn}</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{vikar.rolle}</div>
          <Badge status={vikar.status} />
        </div>
      </div>
      <MetaRow label="Telefon" value={vikar.tlf} />
      <MetaRow label="E-post" value={vikar.epost} />
      <MetaRow label="Adresse" value={vikar.adresse} />
      <MetaRow label="Tilgjengelighet" value={vikar.tilgjengelighet} />
      <MetaRow label="Kontonummer" value={vikar.kontonummer} />
      <MetaRow label="Totale timer" value={`${totalTimer}t (${vikarVakter.length} vakter)`} />
      {vikar.notat && (
        <>
          <Divider />
          <SectionLabel>Notat</SectionLabel>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{vikar.notat}</p>
        </>
      )}
      {vikarVakter.length > 0 && (
        <>
          <Divider />
          <SectionLabel>Siste vakter</SectionLabel>
          {vikarVakter.slice(0, 4).map(v => (
            <div key={v.id} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', borderBottom: '1px solid #f5f5f8', fontSize: 13,
            }}>
              <span>{v.dato} · {kundeNavn(v.kundeId)}</span>
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

export default function Vikarer({ data, dispatch }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const filtered = data.vikarer.filter(v =>
    (v.navn + v.rolle + v.epost).toLowerCase().includes(search.toLowerCase()) &&
    (!statusFilter || v.status === statusFilter)
  );

  function handleSave(form) {
    if (editing) {
      dispatch({ type: 'UPDATE', entity: 'vikarer', item: { ...editing, ...form } });
      setEditing(null);
    } else {
      dispatch({ type: 'ADD', entity: 'vikarer', item: form });
    }
    setShowForm(false);
  }

  function handleDelete(id) {
    if (window.confirm('Slett vikaren?')) {
      dispatch({ type: 'DELETE', entity: 'vikarer', id });
      setViewing(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 20 }}>Vikarer</h2>
        <Btn variant="primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Ny vikar</Btn>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="Søk på navn, rolle, e-post…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, maxWidth: 340, padding: '8px 12px',
            border: '1px solid #dde', borderRadius: 8, background: '#fafbfc',
          }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #dde', borderRadius: 8, background: '#fafbfc', cursor: 'pointer' }}
        >
          <option value="">Alle statuser</option>
          {['Ledig', 'Aktiv', 'Inaktiv'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: '#aaa', marginTop: 16 }}>Ingen vikarer funnet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {filtered.map(v => (
            <Card key={v.id} onClick={() => setViewing(v)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Avatar name={v.navn} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.navn}
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>{v.rolle}</div>
                </div>
                <Badge status={v.status} />
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>{v.tilgjengelighet}</div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm || !!editing} onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Rediger vikar' : 'Ny vikar'}>
        <VikarForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>

      <Modal open={!!viewing && !editing} onClose={() => setViewing(null)} title="Vikardetaljer">
        {viewing && (
          <VikarDetail
            vikar={viewing}
            vakter={data.vakter}
            kunder={data.kunder}
            onEdit={() => { setEditing(viewing); setViewing(null); setShowForm(false); }}
            onDelete={() => handleDelete(viewing.id)}
            onClose={() => setViewing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
