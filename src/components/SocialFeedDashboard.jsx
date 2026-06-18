import { useState } from 'react';
import { platformColors } from '../mockData';

export default function SocialFeedDashboard({ reports, onVerifyReport, onAnalyzeReport }) {
  const [platformFilter, setPlatformFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate Analytics for Charts (Platform Distribution)
  const platformCounts = reports.reduce((acc, report) => {
    acc[report.platform] = (acc[report.platform] || 0) + 1;
    return acc;
  }, {});

  const totalReports = reports.length;
  
  // Filter Reports
  const filteredReports = reports.filter((report) => {
    const matchesPlatform = platformFilter === 'All' || report.platform === platformFilter;
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          report.scamType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Analytics dashboard header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Social Media Scam Intel</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>Real-time telemetry and category distribution of community-reported threat nodes.</p>
      </div>

      {/* Analytics Charts (Pure CSS / High Performance) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Platform Volume Chart */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '4px', height: '12px', backgroundColor: 'var(--accent-cyan)', display: 'inline-block', borderRadius: '1px' }}></span>
            Threat Reports by Platform
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.keys(platformColors).map((platform) => {
              const count = platformCounts[platform] || 0;
              const percentage = totalReports > 0 ? (count / totalReports) * 100 : 0;
              return (
                <div key={platform} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: platformColors[platform] }}></span>
                      {platform}
                    </span>
                    <span style={{ color: '#94a3b8' }}>{count} ({Math.round(percentage)}%)</span>
                  </div>
                  {/* CSS Progress Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: platformColors[platform],
                      boxShadow: `0 0 6px ${platformColors[platform]}`,
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Threat Level Metrics Grid */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '4px', height: '12px', backgroundColor: 'var(--status-danger)', display: 'inline-block', borderRadius: '1px' }}></span>
              Threat Level Analysis
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '16px' }}>
              Real-time analysis indicates critical severity reports represent the largest growth vector, highly driven by WhatsApp and Telegram groups.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--status-danger)' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Critical Threats</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--status-danger)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {reports.filter(r => r.threatLevel === 'Critical').length}
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--status-warning)' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>High/Medium</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--status-warning)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {reports.filter(r => r.threatLevel !== 'Critical').length}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Filters and List */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginTop: '12px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px'
      }}>
        {/* Buttons to filter platforms */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Instagram', 'WhatsApp', 'Telegram', 'X', 'Facebook'].map((plat) => {
            const isActive = platformFilter === plat;
            return (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  background: isActive ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.03)',
                  borderColor: isActive ? 'var(--accent-cyan)' : 'var(--border-color)',
                  color: isActive ? '#070a13' : '#cbd5e1',
                  fontWeight: isActive ? 600 : 400
                }}
              >
                {plat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Filter recent cases..."
          className="form-control"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '260px' }}
        />
      </div>

      {/* Reports Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderTop: `3px solid ${platformColors[report.platform] || 'var(--border-color)'}`
            }}
          >
            {/* Header badges */}
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    backgroundColor: platformColors[report.platform] || '#64748b',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  {report.platform}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  {report.scammerHandle}
                </span>
              </div>
              <span className={`badge ${report.threatLevel === 'Critical' ? 'badge-danger' : report.threatLevel === 'High' ? 'badge-warning' : 'badge-cyan'}`}>
                {report.threatLevel}
              </span>
            </div>

            {/* Content */}
            <div>
              <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '6px' }}>{report.title}</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>{report.description}</p>
            </div>

            {/* Footer row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.04)'
            }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Reported {report.reportedAt}
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                {/* Analyze threat redirect button */}
                <button
                  onClick={() => onAnalyzeReport(`${report.title}: ${report.description}`)}
                  className="btn btn-secondary"
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(6, 182, 212, 0.03)',
                    borderColor: 'rgba(6, 182, 212, 0.2)',
                    color: 'var(--accent-cyan)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.03)';
                  }}
                >
                  Analyze Post
                </button>

                {/* Vote up button */}
                <button
                  onClick={() => onVerifyReport(report.id)}
                  className="btn btn-secondary"
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderColor: 'var(--border-color)',
                    color: '#fff'
                  }}
                >
                  Verify ({report.verifiedVotes})
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px',
            color: '#64748b',
            border: '1px dashed var(--border-color)',
            borderRadius: '8px'
          }}>
            No reports match the current platform and text filter.
          </div>
        )}
      </div>
    </div>
  );
}
