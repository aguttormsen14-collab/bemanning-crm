import { Card, Btn } from './UI';

function StatCard({ label, value, color }) {
  return (
    <Card style={{ textAlign: 'center', padding: '18px 12px' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || '#1F4E79' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 4, fontWeight: 500 }}>{label}</div>
    </Card>
  );
}

export default function Dashboard({ data, onNav }) {
  const { kunder, vikarer, salg, vakter } = data;

  const aktiveKunder = kunder.filter(k => k.status === 'Aktiv').length;
  const aktiveLeds = salg.filter(s => !['Vunnet', 'Tapt'].includes(s.status)).length;
  const vunnetSalg = salg.filter(s => s.status === 'Vunnet').length;
  const today = new Date().toISOString().split('T')[0];
  const kommende = vakter
    .filter(v => v.dato >= today)
    .sort((a, b) => a.dato.localeCompare(b.dato))
    .slice(0, 5);
  const activeLeads = salg.filter(s => !['Vunnet', 'Tapt'].includes(s.status)).slice(0, 5);

  function vikarNavn(id) { return vikarer.find(v => v.id === id)?.navn || id; }
  function kundeNavn(id) { return kunder.find(k => k.id === id)?.navn || id; }

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Oversikt</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        <StatCard label="Aktive kunder" value={aktiveKunder} color="#1F4E79" />
        <StatCard label="Vikarer i pool" value={vikarer.length} color="#0F6E56" />
        <StatCard label="Aktive leads" value={aktiveLeds} color="#854F0B" />
        <StatCard label="Vunnet salg" value={vunnetSalg} color="#3B6D11" />
        <StatCard label="Kommende vakter" value={kommende.length} color="#3C3489" />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontWeight: 700 }}>Kommende vakter</span>
            <Btn onClick={() => onNav('vakter')} style={{ fontSize: 12, padding: '4px 10px' }}>Se alle</Btn>
          </div>
          {kommende.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 13 }}>Ingen kommende vakter</p>
          ) : (
            kommende.map(v => (
              <div key={v.id} style={{
                padding: '8px 0', borderBottom: '1px solid #f0f0f5',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{vikarNavn(v.vikarId)}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>{kundeNavn(v.kundeId)} · {v.type}</div>
                </div>
                <div style={{ fontSize: 12, color: '#888', textAlign: 'right' }}>
                  <div>{v.dato}</div>
                  <div>{v.timer}t</div>
                </div>
              </div>
            ))
          )}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontWeight: 700 }}>Aktive leads</span>
            <Btn onClick={() => onNav('salg')} style={{ fontSize: 12, padding: '4px 10px' }}>Se alle</Btn>
          </div>
          {activeLeads.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 13 }}>Ingen aktive leads</p>
          ) : (
            activeLeads.map(s => (
              <div key={s.id} style={{
                padding: '8px 0', borderBottom: '1px solid #f0f0f5',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.navn}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>{s.kontakt}</div>
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>{s.status}</div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
