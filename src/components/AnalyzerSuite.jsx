import { useState } from 'react';
import URLAnalyzer from './URLAnalyzer';
import ImageAnalyzer from './ImageAnalyzer';
import MessageAnalyzer from './MessageAnalyzer';
import VoiceAnalyzer from './VoiceAnalyzer';
import SocialMediaAnalyzer from './SocialMediaAnalyzer';
import { getInitialLanguage, saveLanguageChoice, translations } from '../i18n';

export default function AnalyzerSuite({ prefilledContent, prefilledTab, clearPrefilled }) {
  const [activeSubTab, setActiveSubTab] = useState(prefilledTab || 'url');
  const [prevPrefilledTab, setPrevPrefilledTab] = useState(prefilledTab);
  const [lang, setLang] = useState(getInitialLanguage);

  const t = translations[lang] || translations.en;
  
  if (prefilledTab !== prevPrefilledTab) {
    setActiveSubTab(prefilledTab);
    setPrevPrefilledTab(prefilledTab);
  }

  const handleLangChange = (newLang) => {
    setLang(newLang);
    saveLanguageChoice(newLang);
  };

  const tabs = [
    { id: 'url', name: t.tabUrlTitle, desc: t.tabUrlDesc },
    { id: 'image', name: t.tabImageTitle, desc: t.tabImageDesc },
    { id: 'message', name: t.tabMessageTitle, desc: t.tabMessageDesc },
    { id: 'voice', name: t.tabVoiceTitle, desc: t.tabVoiceDesc },
    { id: 'social', name: t.tabSocialTitle, desc: t.tabSocialDesc }
  ];

  const handleTabChange = (tabId) => {
    setActiveSubTab(tabId);
    if (clearPrefilled) clearPrefilled();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* AI Scan Center Header & Language Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '0 4px' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
          {t.scanCenterTitle}
        </div>

        {/* English | తెలుగు Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(18, 25, 47, 0.8)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginRight: '4px' }}>{t.toggleLangLabel}:</span>
          <button
            type="button"
            onClick={() => handleLangChange('en')}
            style={{
              padding: '3px 8px',
              fontSize: '0.75rem',
              fontWeight: lang === 'en' ? 700 : 500,
              color: lang === 'en' ? '#070a13' : '#cbd5e1',
              backgroundColor: lang === 'en' ? 'var(--accent-cyan)' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            English
          </button>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>|</span>
          <button
            type="button"
            onClick={() => handleLangChange('te')}
            style={{
              padding: '3px 8px',
              fontSize: '0.75rem',
              fontWeight: lang === 'te' ? 700 : 500,
              color: lang === 'te' ? '#070a13' : '#cbd5e1',
              backgroundColor: lang === 'te' ? 'var(--accent-cyan)' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            తెలుగు
          </button>
        </div>
      </div>

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
        {activeSubTab === 'url' && <URLAnalyzer lang={lang} />}
        {activeSubTab === 'image' && <ImageAnalyzer lang={lang} />}
        {activeSubTab === 'message' && <MessageAnalyzer lang={lang} />}
        {activeSubTab === 'voice' && <VoiceAnalyzer lang={lang} />}
        {activeSubTab === 'social' && <SocialMediaAnalyzer lang={lang} prefilledValue={activeSubTab === 'social' ? prefilledContent : ''} />}
      </div>
    </div>
  );
}
