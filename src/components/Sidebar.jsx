
export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Radar Dashboard',
      subtitle: 'Global Threat Intel',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          <path d="M2 12h20"></path>
        </svg>
      )
    },
    {
      id: 'analyzers',
      label: 'AI Scan Center',
      subtitle: 'Multi-Threat Analyzer',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <circle cx="12" cy="11" r="3"></circle>
          <path d="M12 5v3"></path>
        </svg>
      )
    },
    {
      id: 'report',
      label: 'Report Center',
      subtitle: 'Flag New Threats',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )
    },
    {
      id: 'feed',
      label: 'Social Media Radar',
      subtitle: 'Community Scams',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      )
    },
    {
      id: 'calibration',
      label: 'Model Retraining',
      subtitle: 'Active Learning AI',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      )
    }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand area in sidebar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px 24px 12px',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '24px'
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          color: '#fff'
        }}>SCAM<span style={{ color: 'var(--accent-cyan)' }}>RADAR</span></span>
      </div>

      {/* Menu Options */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                background: isActive ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                borderRadius: '8px',
                color: isActive ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'var(--transition)'
              }}
              className={isActive ? 'cyan-glow' : ''}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{
                color: isActive ? 'var(--accent-cyan)' : '#64748b',
                transition: 'var(--transition)'
              }}>
                {item.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.subtitle}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px',
        fontSize: '0.75rem',
        color: '#64748b',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-safe)', boxShadow: '0 0 6px var(--status-safe)' }}></div>
          <span>Secure Connection</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)' }}>AI RADAR ENGINE v2.1</div>
      </div>
    </aside>
    </>
  );
}
