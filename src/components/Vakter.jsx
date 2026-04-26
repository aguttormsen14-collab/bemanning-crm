import { useState } from 'react';
import { Badge, Btn, Input, Select, Textarea, Modal, MetaRow, Divider } from './UI';
import { VAKTTYPER, today } from '../data';

function VaktForm({ initial, kunder, vikarer, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    dato: today(), vikarId: '', kundeId: '', type: 'Hverdag', timer: '', notat: ''
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <Input label="Dato *" type="date" value={form.dato} onChange={e => set('dato', e.target.value)} required />
      <Select label="Vikar *" value={form.vikarId} onChange={e => set('vikarId', e.target.value)} required>
        <option value="">Velg vikar…</option>
        {vikarer.map(v => <option key={v.id} value={v.id}>{v.navn} ({v.rolle})</option>)}
      </Select>
      <Select label="Kunde *" value={form.kundeId} onChange={e => set('kundeId', e.target.value)} required>
        <option value="">Velg kunde…</option>
        {kunder.map(k => <option key={k.id} value={k.id}>{k.navn}</option>)}
      </Select>
      <Select label="Vakttype" value={form.type} onChange={e => set('type', e.target.value)}>
        {VAKTTYPER.map(t => <option key={t}>{t}</option>)}
      </Select>
      <Input label="Timer *" type="number" min="0" step="0.5" value={form.timer}
        onChange={e => set('timer', e.target.value)} required placeholder="7.5" />
      <Textarea label="Notat" value={form.notat} onChange={e => set('notat', e.target.value)} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn onClick={onCancel}>Avbryt</Btn>
        <Btn variant="primary" type="submit">Lagre</Btn>
      </div>
    </form>
  );
}

function VaktDetail({ vakt, vikarNavn, kundeNavn, onDelete, onClose }) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Badge status={vakt.type} />
      </div>
      <MetaRow label="Dato" value={vakt.dato} />
      <MetaRow label="Vikar" value={vikarNavn} />
      <MetaRow label="Kunde" value={kundeNavn} />
      <MetaRow label="Timer" value={`${vakt.timer}t`} />
      {vakt.notat && (
        <>
          <Divider />
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{vakt.notat}</p>
        </>
      )}
      <Divider />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="danger" onClick={onDelete}>Slett</Btn>
        <Btn onClick={onClose}>Lukk</Btn>
      </div>
    </div>
  );
}

export default function Vakter({ data, dispatch }) {
  const [monthFilter, setMonthFilter] = useState(today().slice(0, 7));
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState(null);

  const filtered = data.vakter
    .filter(v => !monthFilter || v.dato.startsWith(monthFilter))
    .sort((a, b) => b.dato.localeCompare(a.dato));

  const totalTimer = filtered.reduce((s, v) => s + (Number(v.timer) || 0), 0);

  function vikarNavn(id) { return data.vikarer.find(v => v.id === id)?.navn || id; }
  function kundeNavn(id) { return data.kunder.find(k => k.id === id)?.navn || id; }

  function handleSave(form) {
    dispatch({ type: 'ADD', entity: 'vakter', item: form });
    setShowForm(false);
  }

  function handleDelete(id) {
    if (window.confirm('Slett vakten?')) {
      dispatch({ type: 'DELETE', entity: 'vakter', id });
      setViewing(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 20 }}>Vakter</h2>
        <Btn variant="primary" onClick={() => setShowForm(true)}>+ Ny vakt</Btn>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="month"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          style={{ padding: '8px 10px', border: '1px solid #dde', borderRadius: 8, background: '#fafbfc', cursor: 'pointer' }}
        />
        <Btn onClick={() => setMonthFilter('')} style={{ fontSize: 12, padding: '6px 12px' }}>
          {monthFilter ? 'Vis alle' : 'Alle måneder'}
        </Btn>
        {filtered.length > 0 && (
          <span style={{ fontSize: 13, color: '#888' }}>
            {filtered.length} vakter · {totalTimer}t totalt
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: '#aaa', marginTop: 8 }}>Ingen vakter for valgt periode.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                {['Dato', 'Vikar', 'Kunde', 'Type', 'Timer'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#888', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr
                  key={v.id}
                  onClick={() => setViewing(v)}
                  style={{ borderBottom: '1px solid #f0f0f5', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8f9fb'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{v.dato}</td>
                  <td style={{ padding: '10px 12px' }}>{vikarNavn(v.vikarId)}</td>
                  <td style={{ padding: '10px 12px' }}>{kundeNavn(v.kundeId)}</td>
                  <td style={{ padding: '10px 12px' }}><Badge status={v.type} /></td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{v.timer}t</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Ny vakt">
        <VaktForm
          kunder={data.kunder}
          vikarer={data.vikarer}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Vaktdetaljer">
        {viewing && (
          <VaktDetail
            vakt={viewing}
            vikarNavn={vikarNavn(viewing.vikarId)}
            kundeNavn={kundeNavn(viewing.kundeId)}
            onDelete={() => handleDelete(viewing.id)}
            onClose={() => setViewing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
