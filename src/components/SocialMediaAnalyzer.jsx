import { useState } from 'react';

// Phishing / Fake news keywords
const CLICKBAIT_WORDS = ['shocking', 'unbelievable', 'watch before deleted', 'secret they hide', 'insider leak', 'revealed', 'must see', 'omg'];
const ENDORSEMENT_SCAM = ['elon musk', 'mrbeast', 'giveaway', 'airdrop', 'double your', 'send btc', 'free tokens', 'get rich quick', 'investment loop'];

const BRAND_LOOKALIKES = {
  Musk: ['musk', 'musck', 'mussk'],
  Beast: ['mrbeast', 'mr-beast', 'mrbeast-giveaway', 'mrbeast-airdrop'],
  Bitcoin: ['bitcoin', 'btc-giveaway', 'btc-drop', 'ethereum', 'eth-airdrop'],
  Telegram: ['t.me', 'telegram', 'telegra.ph'],
  WhatsApp: ['whatsapp', 'whatapp', 'whats-app']
};

const OFFICIAL_DOMAINS = {
  Musk: ['tesla.com', 'spacex.com', 'x.com', 'twitter.com'],
  Beast: ['mrbeast.com', 'youtube.com'],
  Bitcoin: ['bitcoin.org', 'ethereum.org'],
  Telegram: ['telegram.org', 't.me'],
  WhatsApp: ['whatsapp.com']
};

const isOfficialDomain = (host, brand) => {
  const official = OFFICIAL_DOMAINS[brand];
  if (!official) return false;
  return official.some(domain => host === domain || host.endsWith('.' + domain));
};

export default function SocialMediaAnalyzer({ prefilledValue }) {
  const [text, setText] = useState(prefilledValue || '');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [sourceQuality, setSourceQuality] = useState('verified'); // 'verified' or 'anonymous'
  const [prevPrefilledValue, setPrevPrefilledValue] = useState(prefilledValue);

  if (prefilledValue !== prevPrefilledValue) {
    setText(prefilledValue || '');
    setPrevPrefilledValue(prefilledValue);
  }

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setScanning(true);
    setResult(null);

    const textLower = text.toLowerCase();
    const issues = [];
    let veracityScore = 95; // start clean, subtract based on markers

    // Check capital letters ratio (sensationalism)
    const uppercaseCount = (text.match(/[A-Z]/g) || []).length;
    const totalLetterCount = (text.match(/[a-zA-Z]/g) || []).length;
    const capRatio = totalLetterCount > 0 ? uppercaseCount / totalLetterCount : 0;
    
    let sensationalismRating = 'Low';
    if (capRatio > 0.25 || textLower.includes('!!!') || textLower.includes('???')) {
      veracityScore -= 20;
      sensationalismRating = 'High';
      issues.push("High Sensationalism: Excessive capitalization or exclamation markers detected");
    } else if (capRatio > 0.15) {
      veracityScore -= 10;
      sensationalismRating = 'Medium';
      issues.push("Moderate Sensationalism: Frequent capitalization usage");
    }

    // Check clickbait words
    const detectedClickbait = CLICKBAIT_WORDS.filter(word => textLower.includes(word));
    if (detectedClickbait.length > 0) {
      veracityScore -= 15 * detectedClickbait.length;
      issues.push(`Clickbait triggers found: ${detectedClickbait.join(', ')}`);
    }

    // Check endorsement/giveaway loops
    const detectedEndorsements = ENDORSEMENT_SCAM.filter(word => textLower.includes(word));
    if (detectedEndorsements.length > 0) {
      veracityScore -= 30;
      issues.push(`Fake Giveaway/Endorsement hooks: ${detectedEndorsements.join(', ')}`);
    }

    // URL Extraction and background DNS check + Brand Lookalike
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urlsFound = text.match(urlRegex) || [];
    let urlResults = [];

    if (urlsFound.length > 0) {
      for (const rawUrl of urlsFound) {
        let cleanHost;
        try {
          const tempUrl = rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl;
          const parsed = new URL(tempUrl);
          cleanHost = parsed.hostname.replace(/^www\./, '');
        } catch {
          cleanHost = rawUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split('?')[0];
        }

        if (cleanHost) {
          let isBrandLookalike = false;
          let matchedBrand = '';
          for (const [brand, keywords] of Object.entries(BRAND_LOOKALIKES)) {
            const hasKeyword = keywords.some(kw => cleanHost.includes(kw));
            if (hasKeyword && !isOfficialDomain(cleanHost, brand)) {
              isBrandLookalike = true;
              matchedBrand = brand;
              break;
            }
          }

          let resolves;
          try {
            const dnsRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleanHost)}&type=A`);
            const dnsData = await dnsRes.json();
            resolves = dnsData && dnsData.Answer && dnsData.Answer.length > 0;
          } catch {
            resolves = true; // offline fallback
          }

          urlResults.push({
            url: rawUrl,
            domain: cleanHost,
            active: resolves,
            lookalike: isBrandLookalike,
            matchedBrand: matchedBrand
          });

          if (isBrandLookalike) {
            veracityScore -= 25;
            issues.push(`Lookalike Domain Flag: Embedded link '${cleanHost}' mimics brand '${matchedBrand}' but is hosted on an unverified domain.`);
          }

          if (!resolves) {
            veracityScore -= 25;
            issues.push(`Suspicious Link: Embedded link '${cleanHost}' does not resolve to an active DNS host.`);
          } else if (!isBrandLookalike) {
            issues.push(`Active URL verified: Embedded link '${cleanHost}' resolves successfully.`);
          }
        }
      }
    } else {
      const hasSourceLink = textLower.includes('http') || textLower.includes('www.') || textLower.includes('source:');
      if (!hasSourceLink && veracityScore < 85) {
        veracityScore -= 10;
        issues.push("Lack of source citations or external links to reputable news gateways");
      }
    }

    veracityScore = Math.max(Math.min(veracityScore, 100), 1);

    let credibility = 'Credible';
    if (veracityScore < 40) credibility = 'Fake / Scam Post';
    else if (veracityScore < 75) credibility = 'Highly Suspicious';

    // Confidence calibration
    let confidence = 95;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount < 12) {
      confidence -= 15;
    }
    if (urlsFound.length === 0) {
      confidence -= 15;
    }
    if (sourceQuality === 'anonymous') {
      confidence -= 20;
    }
    if (urlsFound.length > 0 && urlResults.some(u => u.lookalike)) {
      confidence += 4;
    }
    confidence = Math.max(Math.min(confidence, 99), 50);

    setResult({
      score: veracityScore,
      credibility,
      confidence,
      sensationalismRating,
      capsPercentage: Math.round(capRatio * 100),
      wordCount,
      issues: issues.length > 0 ? issues : ["No suspicious fake-news structures found"],
      urlsChecked: urlResults
    });
    setScanning(false);
  };

  const loadPreset = (preset) => {
    const presets = {
      elon: { text: "🚨 BREAKING NEWS: Elon Musk announces a massive 5,000 BTC Airdrop for all users! Send 0.1 BTC to the verification address and get 0.2 BTC back immediately! Don't miss out on this lifetime giveaway loop!!!", quality: 'verified' },
      whatsapp: { text: "SHOCKING SECRET revealed! Everyone is making $500/day by joining this secret Telegram channel. Watch before this link gets deleted by the banks: http://secure-wealth-signals.click", quality: 'verified' },
      news: { text: "The central bank has announced an interest rate reduction of 0.25% in the third quarter to support housing markets. Source: Reuters Press Bureau.", quality: 'verified' },
      rumor: { text: "Hearing unconfirmed stories that digital currency transfers will be frozen this weekend. Better move funds out immediately.", quality: 'anonymous' }
    };
    setText(presets[preset].text);
    setSourceQuality(presets[preset].quality);
    setResult(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-cyan)' }}>//</span> Social Media Fake News & Post Analyzer
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Scan headlines, viral tweets, giveaway messages, or articles. Detect clickbait triggers, sensational caps-locking, and artificial celebrity double-giveaway scams.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Form and preset buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              className="form-control"
              rows="6"
              placeholder="Paste social media post, tweet or news headline here to check authenticity..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (result) setResult(null);
              }}
              disabled={scanning}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={scanning || !text.trim()}
              >
                {scanning ? 'Running AI Scan...' : 'Analyze Credibility'}
              </button>
              
              {text && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  onClick={() => {
                    setText('');
                    setResult(null);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Quick presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>Presets:</span>
            <button onClick={() => loadPreset('elon')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} disabled={scanning}>
              🚨 Fake Musk Airdrop
            </button>
            <button onClick={() => loadPreset('whatsapp')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} disabled={scanning}>
              🚨 Clickbait Wealth Loop
            </button>
            <button onClick={() => loadPreset('news')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} disabled={scanning}>
              ✅ Authentic News Post
            </button>
            <button onClick={() => loadPreset('rumor')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--status-warning)' }} disabled={scanning}>
              ⚠️ Anonymous Rumor (Low Confidence)
            </button>
          </div>

          {/* Source Profile Authenticity / Confidence Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Source Profile Level:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSourceQuality('verified')}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  fontSize: '0.75rem',
                  padding: '8px',
                  backgroundColor: sourceQuality === 'verified' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  borderColor: sourceQuality === 'verified' ? 'var(--accent-cyan)' : 'var(--border-color)',
                  color: sourceQuality === 'verified' ? 'var(--accent-cyan)' : '#94a3b8'
                }}
                disabled={scanning}
              >
                Verified Channel (High Confidence)
              </button>
              <button
                type="button"
                onClick={() => setSourceQuality('anonymous')}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  fontSize: '0.75rem',
                  padding: '8px',
                  backgroundColor: sourceQuality === 'anonymous' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  borderColor: sourceQuality === 'anonymous' ? 'var(--status-warning)' : 'var(--border-color)',
                  color: sourceQuality === 'anonymous' ? 'var(--status-warning)' : '#94a3b8'
                }}
                disabled={scanning}
              >
                Anonymous Post (Low Confidence &lt; 80%)
              </button>
            </div>
          </div>
        </div>

        {/* Results layout */}
        <div>
          {scanning && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              minHeight: '220px',
              border: '1px dashed var(--border-color)',
              borderRadius: '12px',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(6, 182, 212, 0.1)',
                borderTopColor: 'var(--accent-cyan)',
                borderRadius: '50%',
                animation: 'sweep 1s infinite linear'
              }}></div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>Verifying source credibility indices...</div>
            </div>
          )}

          {!scanning && !result && (
            <div style={{
              border: '1px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '40px 24px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: 'rgba(255,255,255,0.01)'
            }}>
              Input copy or choose a fake news simulation preset to analyze sensationalism levels and source citations.
            </div>
          )}

          {!scanning && result && (
            <div className={`glass-card ${result.confidence < 80 ? 'warning-glow' : result.score > 75 ? 'safe-glow' : result.score > 40 ? 'warning-glow' : 'danger-glow'}`} style={{
              borderLeft: '4px solid',
              borderColor: result.confidence < 80 ? 'var(--status-warning)' : result.score > 75 ? 'var(--status-safe)' : result.score > 40 ? 'var(--status-warning)' : 'var(--status-danger)',
              padding: '20px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              
              {result.confidence < 80 ? (
                /* Warning Threshold Verdict Bypass */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span className="badge badge-warning">INSUFFICIENT DATA</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>Words: {result.wordCount}</span>
                  </div>
                  <h4 style={{ fontSize: '1.25rem', color: 'var(--status-warning)', marginBottom: '8px' }}>
                    Insufficient evidence. Manual verification recommended.
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '16px' }}>
                    The scan confidence score is too low ({result.confidence}%) to formulate an accurate safety index. This frequently happens with short posts, messages lacking reputable source links, or profiles lacking historical integrity tags.
                  </p>
                </div>
              ) : (
                /* High Confidence Verdict Details */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <span className={`badge ${result.score > 75 ? 'badge-safe' : result.score > 40 ? 'badge-warning' : 'badge-danger'}`}>
                        {result.credibility}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Sensationalism Level: {result.sensationalismRating} | Confidence: {result.confidence}%</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: result.score > 75 ? 'var(--status-safe)' : result.score > 40 ? 'var(--status-warning)' : 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>
                        {result.score}%
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>VERACITY</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Details (Sensationalism + Caps Ratio) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px',
                background: 'rgba(0,0,0,0.15)',
                padding: '12px',
                borderRadius: '6px'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Caps Ratio</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{result.capsPercentage}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Source Verification Integrity</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: result.confidence >= 80 ? 'var(--accent-cyan)' : 'var(--status-warning)', marginTop: '2px' }}>
                    {result.confidence >= 80 ? 'HIGH ACCURACY' : 'UNVERIFIED PROFILE'}
                  </div>
                </div>
              </div>

              {/* Detections / Issues logs */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>AI Detection Logs:</div>
                <ul style={{ paddingLeft: '14px', fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {result.issues.map((issue, idx) => (
                    <li key={idx} style={{ color: issue.includes('verified') || issue.includes('Verified') ? 'var(--status-safe)' : '#e2e8f0' }}>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Link checks with Brand Lookalikes */}
              {result.urlsChecked && result.urlsChecked.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '6px', textTransform: 'uppercase' }}>URL Analysis & Brand Lookalike Telemetry:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.urlsChecked.map((u, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.02)', padding: '6px 10px', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', gap: '10px' }}>
                          <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{u.domain}</span>
                          <span style={{ color: u.active ? 'var(--status-safe)' : 'var(--status-danger)', fontWeight: 600 }}>
                            {u.active ? '● DNS Resolved' : '○ DNS Failed'}
                          </span>
                        </div>
                        {u.lookalike && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--status-danger)', marginTop: '4px', fontWeight: 600 }}>
                            ⚠️ Lookalike spoof warning: Mimics corporate brand '{u.matchedBrand}'
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
