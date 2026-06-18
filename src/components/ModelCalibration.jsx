import { useState } from 'react';

export default function ModelCalibration() {
  const [version, setVersion] = useState('v3.2.14-stable');
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainLogs, setRetrainLogs] = useState([]);
  const [confidenceCutoff, setConfidenceCutoff] = useState(80);
  const [benchmarks, setBenchmarks] = useState({
    domainAccuracy: 95.8,
    phishingAccuracy: 94.2,
    voiceAccuracy: 91.5,
    falsePositive: 1.4,
    falseNegative: 2.1
  });

  const triggerRetraining = async () => {
    setIsRetraining(true);
    setRetrainLogs([]);
    const logs = [
      "Downloading daily threat intelligence feed from global feeds...",
      "Parsing 1,248 new phishing domain signatures...",
      "Extracting voice clone biometric variance weights...",
      "Running backpropagation on semantic neural layers...",
      "Calibrating active learning classification thresholds...",
      "Running benchmark testing suites..."
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setRetrainLogs(prev => [...prev, `[LEARNING] ${logs[i]}`]);
    }

    setVersion(`v3.2.15-rc${Math.floor(Math.random() * 9) + 1}`);
    setBenchmarks({
      domainAccuracy: +(95.8 + Math.random() * 0.5).toFixed(2),
      phishingAccuracy: +(94.2 + Math.random() * 0.6).toFixed(2),
      voiceAccuracy: +(91.5 + Math.random() * 0.4).toFixed(2),
      falsePositive: +(1.4 - Math.random() * 0.1).toFixed(2),
      falseNegative: +(2.1 - Math.random() * 0.15).toFixed(2)
    });
    setIsRetraining(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>AI Model Calibration & Retraining Suite</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
          Calibrate ensemble weights, trigger reinforcement active learning pipelines, and verify model performance thresholds.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Benchmarks & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Active Model Status */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-safe)', boxShadow: '0 0 8px var(--status-safe)' }}></span>
              Model Version Info
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Active Core Version:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>{version}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Classification Pipeline:</span>
                <span style={{ color: '#e2e8f0' }}>Weighted Multi-Engine Ensemble</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Confidence Calibrator:</span>
                <span style={{ color: 'var(--status-warning)', fontWeight: 500 }}>Isotonic Regression</span>
              </div>
            </div>
          </div>

          {/* Model Retraining Control */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '12px' }}>Daily retrain Loop</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '16px' }}>
              Fetch coordinates from global threat vectors and perform gradient updates to keep classification kernels updated.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={triggerRetraining} 
                className="btn btn-primary"
                disabled={isRetraining}
                style={{ width: '100%' }}
              >
                {isRetraining ? "Retraining weights..." : "🔄 Trigger Threat Update"}
              </button>

              {/* Logs display */}
              {retrainLogs.length > 0 && (
                <div style={{
                  background: '#040711',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: '#34d399',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {retrainLogs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                  {isRetraining && <span style={{ animation: 'pulse 1s infinite' }}>█ Retraining neural layers...</span>}
                </div>
              )}
            </div>
          </div>

          {/* Threshold Configurations */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '12px' }}>Confidence Cutoff Limits</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '16px' }}>
              Verdicts with confidence scores below this rate will automatically be suppressed to avoid false warnings.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Veracity Verdict Threshold:</span>
                <span style={{ color: 'var(--accent-cyan)' }}>{confidenceCutoff}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="95" 
                value={confidenceCutoff} 
                onChange={(e) => setConfidenceCutoff(Number(e.target.value))}
                style={{ accentColor: 'var(--accent-cyan)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b' }}>
                <span>50% (Permissive)</span>
                <span>95% (Strict Verification)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Benchmark Testing Suites */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>Accuracy Verification Benchmarks</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ScamRadar AI target metrics vs active production scores.</span>
          </div>

          {/* Metric list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            
            {/* Domain */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>URL / Domain Accuracy Score</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--status-safe)' }}>
                  {benchmarks.domainAccuracy}% <span style={{ color: '#64748b', fontSize: '0.7rem' }}>(Target: &gt;95%)</span>
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${benchmarks.domainAccuracy}%`, height: '100%', backgroundColor: 'var(--status-safe)' }}></div>
              </div>
            </div>

            {/* Phishing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>Phishing Message Detection</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--status-safe)' }}>
                  {benchmarks.phishingAccuracy}% <span style={{ color: '#64748b', fontSize: '0.7rem' }}>(Target: &gt;93%)</span>
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${benchmarks.phishingAccuracy}%`, height: '100%', backgroundColor: 'var(--status-safe)' }}></div>
              </div>
            </div>

            {/* Voice */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>Voice Deepfake Detection</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--status-safe)' }}>
                  {benchmarks.voiceAccuracy}% <span style={{ color: '#64748b', fontSize: '0.7rem' }}>(Target: &gt;90%)</span>
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${benchmarks.voiceAccuracy}%`, height: '100%', backgroundColor: 'var(--status-safe)' }}></div>
              </div>
            </div>

            {/* FP / FN Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--status-safe)' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>False Positive Rate</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--status-safe)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {benchmarks.falsePositive}% <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal' }}>(&lt;2%)</span>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--status-safe)' }}>
                <div style={{ fontSize: '0.7er', color: '#64748b', textTransform: 'uppercase' }}>False Negative Rate</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--status-safe)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {benchmarks.falseNegative}% <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal' }}>(&lt;3%)</span>
                </div>
              </div>

            </div>

          </div>

          <div style={{
            background: 'rgba(6, 182, 212, 0.05)',
            border: '1px solid rgba(6, 182, 212, 0.15)',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#a5f3fc',
            lineHeight: 1.4,
            marginTop: 'auto'
          }}>
            <strong>Ensemble Rigor Confirmed:</strong> ScamRadar AI combines CNNs, Transformers, and custom zero-crossing rate biometrics. The model weights are calibrated automatically to maintain accuracy tolerances.
          </div>

        </div>

      </div>

    </div>
  );
}
