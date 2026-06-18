import { useState } from 'react';
import URLAnalyzer from './URLAnalyzer';
import ImageAnalyzer from './ImageAnalyzer';
import MessageAnalyzer from './MessageAnalyzer';
import VoiceAnalyzer from './VoiceAnalyzer';
import SocialMediaAnalyzer from './SocialMediaAnalyzer';

export default function AnalyzerSuite({ prefilledContent, prefilledTab, clearPrefilled }) {
  const [activeSubTab, setActiveSubTab] = useState(prefilledTab || 'url');
  const [prevPrefilledTab, setPrevPrefilledTab] = useState(prefilledTab);
  
  if (prefilledTab !== prevPrefilledTab) {
    setActiveSubTab(prefilledTab);
    setPrevPrefilledTab(prefilledTab);
  }

  const tabs = [
    { id: 'url', name: 'URL / Domain Check', desc: 'Credential spoofing checks' },
    { id: 'image', name: 'Image & Forensics', desc: 'OCR & metadata checks' },
    { id: 'message', name: 'Phishing Message', desc: 'SMS urgency analysis' },
    { id: 'voice', name: 'Voice Deepfake', desc: 'Voice fingerprinting' },
    { id: 'social', name: 'Social Media / Fake News', desc: 'Clickbait & post credibility' }
  ];

  const handleTabChange = (tabId) => {
    setActiveSubTab(tabId);
    if (clearPrefilled) clearPrefilled();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Tab Selectors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '10px'
      }}>
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '12px 16px',
                background: isActive ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-card)',
                border: '1px solid',
                borderColor: isActive ? 'var(--accent-cyan)' : 'var(--border-color)',
                borderRadius: '8px',
                color: isActive ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)'
              }}
              className={isActive ? 'cyan-glow' : 'interactive'}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isActive ? 'var(--accent-cyan)' : '#e2e8f0' }}>
                {tab.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Workspace Display */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {activeSubTab === 'url' && <URLAnalyzer />}
        {activeSubTab === 'image' && <ImageAnalyzer />}
        {activeSubTab === 'message' && <MessageAnalyzer />}
        {activeSubTab === 'voice' && <VoiceAnalyzer />}
        {activeSubTab === 'social' && <SocialMediaAnalyzer prefilledValue={activeSubTab === 'social' ? prefilledContent : ''} />}
      </div>
    </div>
  );
}
