import { useState } from 'react';

export default function ReportScamForm({ onSubmitReport }) {
  const [formData, setFormData] = useState({
    title: '',
    platform: 'Instagram',
    scammerHandle: '',
    scamType: 'Impersonation',
    threatLevel: 'High',
    description: '',
    financialLoss: '0'
  });
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    // Generate simulated tracking ID
    const genId = 'SR-' + Math.floor(100000 + Math.random() * 900000);
    setReportId(genId);

    // Call global handler to add to feed
    onSubmitReport({
      id: genId,
      title: formData.title,
      platform: formData.platform,
      scammerHandle: formData.scammerHandle || "Unknown",
      scamType: formData.scamType,
      description: formData.description,
      threatLevel: formData.threatLevel,
      reportedAt: "Just now",
      verifiedVotes: 1,
      status: "analyzing",
      financialLoss: Number(formData.financialLoss) || 0
    });

    setSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      platform: 'Instagram',
      scammerHandle: '',
      scamType: 'Impersonation',
      threatLevel: 'High',
      description: '',
      financialLoss: '0'
    });
    setSubmitted(false);
    setReportId('');
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      
      {!submitted ? (
        <div className="glass-card" style={{ padding: '30px', animation: 'fadeIn 0.3s ease-out' }}>
          
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Report a Scam Campaign
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Submit signatures, screenshots, handles, and URLs to train the ScamRadar AI filter and alert the community.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Title */}
            <div className="form-group">
              <label>Scam Campaign Title *</label>
              <input
                type="text"
                name="title"
                required
                className="form-control"
                placeholder="e.g., Fake Cash App Support DM offering free money"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Platform and Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Platform / Gateway</label>
                <select
                  name="platform"
                  className="form-control"
                  value={formData.platform}
                  onChange={handleChange}
                  style={{ background: 'var(--bg-secondary)', color: '#fff' }}
                >
                  <option value="Instagram">Instagram</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telegram">Telegram</option>
                  <option value="X">X (Twitter)</option>
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Other">Other Gateway</option>
                </select>
              </div>

              <div className="form-group">
                <label>Threat Category</label>
                <select
                  name="scamType"
                  className="form-control"
                  value={formData.scamType}
                  onChange={handleChange}
                  style={{ background: 'var(--bg-secondary)', color: '#fff' }}
                >
                  <option value="Impersonation">Impersonation / Spoofing</option>
                  <option value="Crypto Fraud">Crypto Wallet Drainer</option>
                  <option value="Phishing">Phishing Link</option>
                  <option value="Job Scam">Task / Job Scam</option>
                  <option value="AI Voice Clone">AI Voice Clone / Deepfake</option>
                </select>
              </div>
            </div>

            {/* Handle/Caller and Financial Loss */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Scammer Username / Phone *</label>
                <input
                  type="text"
                  name="scammerHandle"
                  className="form-control"
                  placeholder="e.g., @cash_help_247 or +1 (415) 555-0128"
                  value={formData.scammerHandle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Financial Loss (INR ₹) *</label>
                <input
                  type="number"
                  name="financialLoss"
                  className="form-control"
                  placeholder="e.g., 25000 (Enter 0 if none)"
                  value={formData.financialLoss}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Threat Severity */}
            <div className="form-group">
              <label>Threat Severity</label>
              <select
                name="threatLevel"
                className="form-control"
                value={formData.threatLevel}
                onChange={handleChange}
                style={{ background: 'var(--bg-secondary)', color: '#fff' }}
              >
                <option value="Low">Low (Spam/Harmless)</option>
                <option value="Medium">Medium (Low scale phishing)</option>
                <option value="High">High (Credential harvest/Financial loss)</option>
                <option value="Critical">Critical (AI deepfakes/Asset drainers)</option>
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description of Incident *</label>
              <textarea
                name="description"
                required
                className="form-control"
                rows="4"
                placeholder="Explain the scam script. What links did they send? What was the bait?"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: 'var(--status-warning)',
              lineHeight: 1.4
            }}>
              <strong>Community Alert Requirement:</strong> Reports are distributed across the live social threat feed for analysis. Refrain from publishing sensitive private keys or personal identification cards in the public fields.
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '8px' }}>
              Submit Threat Signature
            </button>
          </form>

        </div>
      ) : (
        /* Success Screen */
        <div className="glass-card safe-glow" style={{
          textAlign: 'center',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid var(--status-safe)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--status-safe)" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>Threat Report Logged</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px', maxWidth: '420px', lineHeight: 1.5 }}>
              Your submission has been appended to the community threat ledger. AI engines have parsed the threat structure to updates indicators.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px 24px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            color: 'var(--accent-cyan)'
          }}>
            SYSTEM ID: {reportId}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button onClick={resetForm} className="btn btn-secondary">
              Report Another Scam
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
