import { useState } from 'react';
import { Card, Badge, Btn, Input, Select, Textarea, Modal, MetaRow, SectionLabel, Divider } from './UI';
import { SALG_STAGES, today } from '../data';

function SalgForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    navn: '', kontakt: '', tlf: '', epost: '',
    verdi: '', status: 'Prospekt', dato: today(), notat: ''
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <Input label="Navn / firma *" value={form.navn} onChange={e => set('navn', e.target.value)} required />
      <Input label="Kontaktperson" value={form.kontakt} onChange={e => set('kontakt', e.target.value)} />
      <Input label="Telefon" value={form.tlf} onChange={e => set('tlf', e.target.value)} />
      <Input label="E-post" type="email" value={form.epost} onChange={e => set('epost', e.target.value)} />
      <Input label="Verdi (kr/år)" type="number" value={form.verdi} onChange={e => set('verdi', e.target.value)} placeholder="0" />
      <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
        {SALG_STAGES.map(s => <option key={s}>{s}</option>)}
      </Select>
      <Input label="Dato" type="date" value={form.dato} onChange={e => set('dato', e.target.value)} />
      <Textarea label="Notat" value={form.notat} onChange={e => set('notat', e.target.value)} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn onClick={onCancel}>Avbryt</Btn>
        <Btn variant="primary" type="submit">Lagre</Btn>
      </div>
    </form>
  );
}

function SalgDetail({ salg, onEdit, onDelete, onClose, onStatusChange }) {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{salg.navn}</div>
        <Badge status={salg.status} />
      </div>
      <MetaRow label="Kontaktperson" value={salg.kontakt} />
      <MetaRow label="Telefon" value={salg.tlf} />
      <MetaRow label="E-post" value={salg.epost} />
      <MetaRow label="Verdi" value={salg.verdi ? `${Number(salg.verdi).toLocaleString('nb-NO')} kr/år` : null} />
      <MetaRow label="Dato" value={salg.dato} />
      <Divider />
      <SectionLabel>Oppdater status</SectionLabel>
      <select
        value={salg.status}
        onChange={e => onStatusChange(e.target.value)}
        style={{
          width: '100%', padding: '8px 10px', border: '1px solid #dde',
          borderRadius: 8, marginBottom: 12, background: '#fafbfc', cursor: 'pointer',
        }}
      >
        {SALG_STAGES.map(s => <option key={s}>{s}</option>)}
      </select>
      {salg.notat && (
        <>
          <SectionLabel>Notat</SectionLabel>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 12 }}>{salg.notat}</p>
        </>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="danger" onClick={onDelete}>Slett</Btn>
        <Btn onClick={onClose}>Lukk</Btn>
        <Btn variant="primary" onClick={onEdit}>Rediger</Btn>
      </div>
    </div>
  );
}

export default function Salg({ data, dispatch }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const totalVunnet = data.salg
    .filter(s => s.status === 'Vunnet')
    .reduce((sum, s) => sum + (Number(s.verdi) || 0), 0);

  function handleSave(form) {
    if (editing) {
      dispatch({ type: 'UPDATE', entity: 'salg', item: { ...editing, ...form } });
      setEditing(null);
    } else {
      dispatch({ type: 'ADD', entity: 'salg', item: form });
    }
    setShowForm(false);
  }

  function handleStatusChange(id, status) {
    const item = data.salg.find(s => s.id === id);
    if (item) {
      dispatch({ type: 'UPDATE', entity: 'salg', item: { ...item, status } });
      setViewing(prev => prev?.id === id ? { ...prev, status } : prev);
    }
  }

  function handleDelete(id) {
    if (window.confirm('Slett salgsoppføringen?')) {
      dispatch({ type: 'DELETE', entity: 'salg', id });
      setViewing(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h2 style={{ fontWeight: 700, fontSize: 20 }}>Salg</h2>
        <Btn variant="primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Ny lead</Btn>
      </div>

      {totalVunnet > 0 && (
        <div style={{
          background: '#EAF3DE', color: '#3B6D11', padding: '8px 14px',
          borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600,
        }}>
          Total vunnet verdi: {totalVunnet.toLocaleString('nb-NO')} kr/år
        </div>
      )}

      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: 12, minWidth: SALG_STAGES.length * 220 }}>
          {SALG_STAGES.map(stage => {
            const items = data.salg.filter(s => s.status === stage);
            return (
              <div key={stage} style={{ flex: '0 0 210px', minWidth: 210 }}>
                <div style={{
                  fontWeight: 700, fontSize: 12, color: '#888', textTransform: 'uppercase',
                  letterSpacing: '0.06em', marginBottom: 10,
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>{stage}</span>
                  <span style={{
                    background: '#f0f0f5', borderRadius: 10, padding: '1px 7px', fontSize: 11,
                  }}>{items.length}</span>
                </div>
                {items.map(item => (
                  <Card key={item.id} onClick={() => setViewing(item)} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{item.navn}</div>
                    {item.kontakt && <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{item.kontakt}</div>}
                    {item.verdi && (
                      <div style={{ fontSize: 12, color: '#0F6E56', fontWeight: 600 }}>
                        {Number(item.verdi).toLocaleString('nb-NO')} kr/år
                      </div>
                    )}
                    {item.dato && <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>{item.dato}</div>}
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={showForm || !!editing} onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Rediger lead' : 'Ny lead'}>
        <SalgForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>

      <Modal open={!!viewing && !editing} onClose={() => setViewing(null)} title="Salgsdetaljer">
        {viewing && (
          <SalgDetail
            salg={viewing}
            onEdit={() => { setEditing(viewing); setViewing(null); setShowForm(false); }}
            onDelete={() => handleDelete(viewing.id)}
            onClose={() => setViewing(null)}
            onStatusChange={status => handleStatusChange(viewing.id, status)}
          />
        )}
      </Modal>
    </div>
  );
}
