import { useState } from 'react';
import { initialTrendingScams } from '../mockData';

export default function RadarDashboard({ reports = [], onQuickScan }) {
  const [search, setSearch] = useState('');
  const [selectedScam, setSelectedScam] = useState(null);

  const filteredScams = initialTrendingScams.filter(scam => 
    scam.title.toLowerCase().includes(search.toLowerCase()) ||
    scam.category.toLowerCase().includes(search.toLowerCase()) ||
    scam.description.toLowerCase().includes(search.toLowerCase())
  );

  // Dynamic calculations from real threat reports
  const validReports = reports || [];
  
  // Calculate Dominant Scam Vector
  const scamTypeCounts = validReports.reduce((acc, report) => {
    acc[report.scamType] = (acc[report.scamType] || 0) + 1;
    return acc;
  }, {});
  
  let dominantVector = "AI Voice Clone";
  let dominantCount = 0;
  Object.entries(scamTypeCounts).forEach(([type, count]) => {
    if (count > dominantCount) {
      dominantVector = type;
      dominantCount = count;
    }
  });

  const getDominantThreatLevel = (vectorName) => {
    if (vectorName === 'Crypto Fraud' || vectorName === 'AI Voice Clone') {
      return { label: 'Critical', class: 'badge-danger' };
    }
    return { label: 'High', class: 'badge-warning' };
  };
  const dominantThreat = getDominantThreatLevel(dominantVector);

  // Calculate dynamic financial loss stats in Indian Rupees (INR)
  const totalLoss = validReports.reduce((sum, r) => sum + (Number(r.financialLoss) || 0), 0);
  const reportsWithLoss = validReports.filter(r => Number(r.financialLoss) > 0);
  const avgLoss = reportsWithLoss.length > 0 ? Math.round(totalLoss / reportsWithLoss.length) : 0;

  const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Section: Radar Screen and Live Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Radar scope console */}
        <div className="glass-card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Radar title */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            fontFamily: 'var(--font-display)',
            fontSize: '0.8rem',
            color: 'var(--accent-cyan)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            [AI ACTIVE SWEEP RADAR]
          </div>
          
          {/* Animated Scope */}
          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            border: '2px solid rgba(6, 182, 212, 0.15)',
            position: 'relative',
            background: 'radial-gradient(circle, rgba(6,182,212,0.03) 0%, rgba(7,10,19,0.9) 100%)',
            margin: '20px 0 10px 0',
            boxShadow: 'inset 0 0 20px rgba(6, 182, 212, 0.1)'
          }}>
            {/* Concentric rings */}
            <div style={{ position: 'absolute', top: '15%', left: '15%', right: '15%', bottom: '15%', borderRadius: '50%', border: '1px dashed rgba(6, 182, 212, 0.1)' }}></div>
            <div style={{ position: 'absolute', top: '35%', left: '35%', right: '35%', bottom: '35%', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.08)' }}></div>
            
            {/* Crosshairs */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: 'rgba(6, 182, 212, 0.08)' }}></div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: 'rgba(6, 182, 212, 0.08)' }}></div>
            
            {/* Rotating Sweep */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '50%',
              height: '50%',
              background: 'linear-gradient(45deg, var(--accent-cyan-glow), transparent 60%)',
              transformOrigin: 'top left',
              animation: 'sweep 4s infinite linear',
              borderRadius: '0 0 0 100%'
            }}></div>

            {/* Glowing threat dots (Blinking alerts) */}
            <div style={{
              position: 'absolute',
              top: '25%',
              left: '65%',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-danger)',
              boxShadow: '0 0 10px var(--status-danger)',
              animation: 'pulse 1.5s infinite'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '70%',
              left: '30%',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-warning)',
              boxShadow: '0 0 8px var(--status-warning)',
              animation: 'pulse 2s infinite'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '45%',
              left: '80%',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-danger)',
              boxShadow: '0 0 8px var(--status-danger)',
              animation: 'pulse 1.2s infinite'
            }}></div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>Active Scams Live Tracking</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Monitoring social networks & SMS gateways</div>
          </div>
        </div>

        {/* Intelligence stats grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Dominant Scam Vector</div>
              <div style={{ fontSize: '1.2rem', color: 'var(--status-danger)', fontWeight: 'bold', marginTop: '4px' }}>{dominantVector}</div>
            </div>
            <span className={`badge ${dominantThreat.class}`}>{dominantThreat.label}</span>
          </div>

          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Financial Loss</div>
              <div style={{ fontSize: '1.25rem', color: 'var(--status-danger)', fontWeight: 'bold', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {formatRupees(totalLoss)}
              </div>
            </div>
            <span className="badge badge-danger">Live</span>
          </div>

          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Average Financial Loss</div>
              <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {formatRupees(avgLoss)} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>/ incident</span>
              </div>
            </div>
            <span className="badge badge-warning">High</span>
          </div>

          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Live System Diagnosis</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <span>AI Models Response:</span>
              <span style={{ color: 'var(--status-safe)', fontFamily: 'var(--font-mono)' }}>14ms (Optimal)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <span>Database Sync:</span>
              <span style={{ color: 'var(--status-safe)', fontFamily: 'var(--font-mono)' }}>Real-time</span>
            </div>
          </div>

        </div>
      </div>

      {/* Trending Scams Header & Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px',
        marginTop: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Trending Scam Threats</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>Most prevalent active social engineering tactics documented this week.</p>
        </div>
        
        <input
          type="text"
          placeholder="Search scams or categories..."
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
      </div>

      {/* Trending Scams List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {filteredScams.map((scam) => {
          const isSelected = selectedScam?.id === scam.id;
          return (
            <div
              key={scam.id}
              className={`glass-card interactive ${isSelected ? 'cyan-glow' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-color)'
              }}
              onClick={() => setSelectedScam(isSelected ? null : scam)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{scam.category}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--status-danger)', fontWeight: 600 }}>{scam.growthRate}</span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{scam.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', lineHeight: 1.4 }}>
                  {scam.description}
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.04)'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Risk Rating: <strong style={{ color: scam.threatLevel === 'Critical' ? 'var(--status-danger)' : 'var(--status-warning)' }}>{scam.threatLevel}</strong>
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isSelected ? 'Hide details ↑' : 'View details ↓'}
                </span>
              </div>

              {/* Expanded warning details */}
              {isSelected && (
                <div style={{
                  marginTop: '12px',
                  background: 'rgba(0,0,0,0.25)',
                  padding: '12px',
                  borderRadius: '6px',
                  animation: 'fadeIn 0.2s ease-out',
                  fontSize: '0.75rem'
                }}
                onClick={(e) => e.stopPropagation()} // Prevent card toggle on sub-clicking
                >
                  <div style={{ fontWeight: 600, color: 'var(--status-warning)', marginBottom: '6px' }}>Key Indicators & Warning Signs:</div>
                  <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#cbd5e1' }}>
                    {scam.indicators.map((ind, idx) => (
                      <li key={idx}>{ind}</li>
                    ))}
                  </ul>
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#64748b' }}>Need to verify a match?</span>
                    <button
                      onClick={onQuickScan}
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                    >
                      Open Scan Center
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
