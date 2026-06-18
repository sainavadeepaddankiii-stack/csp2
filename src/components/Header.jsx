
export default function Header({ totalReportsCount, threatIndex = 74 }) {
  return (
    <header className="app-header glass-card" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 'var(--header-height)',
      padding: '0 24px',
      borderRadius: '0 0 var(--border-radius) var(--border-radius)',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      backgroundColor: 'rgba(11, 16, 33, 0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          position: 'relative',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px solid var(--status-danger)',
            animation: 'ripple 2s infinite linear'
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-danger)',
            boxShadow: '0 0 10px var(--status-danger)'
          }}></div>
        </div>
        <div>
          <h1 style={{
            fontSize: '1.25rem',
            background: 'linear-gradient(90deg, #fff 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            SCAMRADAR <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan-glow)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>AI HUB</span>
          </h1>
        </div>
      </div>

      {/* Stats and Ticker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="header-stats">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>Active Threats</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-mono)' }}>1,492</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>Verified Reports</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {totalReportsCount}
            </div>
          </div>
        </div>

        {/* Global Threat Level */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.2)',
          padding: '6px 14px',
          borderRadius: '8px'
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--status-danger)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Threat Index</div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>{threatIndex}% HIGH</div>
          </div>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-danger)',
            animation: 'pulse 1s infinite'
          }}></div>
        </div>
      </div>
    </header>
  );
}
