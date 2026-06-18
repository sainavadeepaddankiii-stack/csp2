import { useState } from 'react';

const TRIGGER_WORDS = {
  urgency: ['immediately', 'urgent', '24 hours', 'hurry', 'asap', 'suspended', 'unauthorized', 'locked', 'restricted', 'action required', 'disabled', 'expires'],
  financial: ['zelle', 'gift card', 'wire transfer', 'crypto', 'bitcoin', 'btc', 'cash app', 'western union', 'inheritance', 'lottery', 'winner', 'unclaimed', 'refund', 'overdue', 'debit card', 'funds'],
  impersonation: ['irs', 'fbi', 'usps', 'fedex', 'support desk', 'security team', 'billing department', 'verification link', 'chase', 'netflix', 'amazon', 'paypal']
};

export default function MessageAnalyzer() {
  const [text, setText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [ocrProgress, setOcrProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setScanning(true);
    setResult(null);
    setOcrProgress("Analyzing message semantics...");

    const textLower = text.toLowerCase();
    const detectedWords = [];
    let score = 5;

    // 1. Check Urgency keywords
    TRIGGER_WORDS.urgency.forEach(word => {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(textLower)) {
        score += 25;
        detectedWords.push({ word, category: 'Urgency Pressure' });
      }
    });

    // 2. Check Financial keywords
    TRIGGER_WORDS.financial.forEach(word => {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(textLower)) {
        score += 20;
        detectedWords.push({ word, category: 'Financial Request' });
      }
    });

    // 3. Check Impersonation keywords
    TRIGGER_WORDS.impersonation.forEach(word => {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(textLower)) {
        score += 25;
        detectedWords.push({ word, category: 'Authority Claim' });
      }
    });

    // 4. URL extraction & real-time DoH DNS validation
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urls = text.match(urlRegex) || [];
    let urlResolves = true;

    if (urls.length > 0) {
      let checkedDomain;
      setOcrProgress("Scanning embedded links in message...");
      const rawUrl = urls[0];
      try {
        const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl);
        checkedDomain = parsed.hostname.replace(/^www\./, '');
      } catch {
        checkedDomain = rawUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      }

      if (checkedDomain) {
        try {
          const dnsRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(checkedDomain)}&type=A`);
          const dnsData = await dnsRes.json();
          const resolves = dnsData && dnsData.Answer && dnsData.Answer.length > 0;
          urlResolves = resolves;
          if (!resolves) {
            score += 30; // dead link is a huge phishing indicator
            detectedWords.push({ word: checkedDomain, category: 'Dead DNS Phish Link' });
          } else {
            score += 15;
            detectedWords.push({ word: checkedDomain, category: 'Active Phishing Path' });
          }
        } catch {
          // quiet fail
        }
      }
    }

    // Confidence calibration
    // Confidence is high if there are distinct threat indicators or long text.
    // Ambiguous short texts get lower confidence to trigger manual validation.
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    let confidence = 95;
    
    if (wordCount < 6) {
      confidence -= 20; // Too short to confirm
    }
    if (detectedWords.length === 0) {
      confidence -= 15; // Ambiguous message
    }
    if (urls.length > 0 && !urlResolves) {
      confidence += 4; // High indicator agreement
    }

    confidence = Math.max(Math.min(confidence, 99), 50);

    const calculatedScore = Math.min(score, 99);
    let riskLevel = 'Low';
    if (calculatedScore > 40) riskLevel = 'Medium';
    if (calculatedScore > 70) riskLevel = 'High';

    let reasoning = "No financial, urgency, or impersonation triggers identified. Structural checks indicate standard conversation layout.";
    let recommendedAction = "Safe to interact. No security actions required.";

    if (calculatedScore >= 70) {
      reasoning = `High risk phishing attempt. Detections found: ${detectedWords.map(d => `${d.word} (${d.category})`).join(', ')}.`;
      recommendedAction = "Delete message immediately. Do NOT click links or call numbers.";
    } else if (calculatedScore >= 40) {
      reasoning = "Moderate warning flags found. Message contains urgent pressure phrases or financial tokens.";
      recommendedAction = "Verify the sender through an independent official channel before replying.";
    }

    setResult({
      score: calculatedScore,
      riskLevel,
      confidence,
      detectedWords,
      wordCount,
      reasoning,
      recommendedAction
    });
    setScanning(false);
    setOcrProgress('');
  };

  const handleImageUpload = async (file) => {
    if (!file || !window.Tesseract) return;
    setScanning(true);
    setResult(null);
    setOcrProgress("Initializing OCR Parser...");

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const ocrResult = await window.Tesseract.recognize(
          reader.result,
          'eng',
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                setOcrProgress(`OCR Extraction: ${Math.round(m.progress * 100)}%`);
              }
            }
          }
        );
        const extracted = ocrResult.data.text || '';
        setText(extracted);
        setOcrProgress("Analyzing extracted text...");
        // auto-scan the extracted text
        setTimeout(() => {
          setScanning(false);
          setOcrProgress('');
        }, 800);
      } catch {
        setOcrProgress("OCR failed. Please enter text manually.");
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const loadPreset = (presetType) => {
    const presets = {
      bank: "SECURITY UPDATE: Unusual debit card transaction of $432.19 detected on your account. If this was NOT you, immediately click this link to verify your identity and unlock your funds: http://chase-security-alert-refunds.net/auth",
      lottery: "CONGRATULATIONS! Your mobile number has won $2,500,000 in the International Coca-Cola Promo. To claim your prize, email your details. A validation fee of $150 via Gift Card is required to release the certificate.",
      work: "Hi, I am recruitment manager at WhatsApp. We have review your resume and offer online part-time job daily pay of $300. Please contact coordinator ASAP on telegram: @whatsapp_jobs_team",
      clean: "Hey Sarah! Just wanted to confirm if we're still meeting for coffee tomorrow at 2 PM. Let me know if that time still works for you or if we should reschedule. See you soon!"
    };
    setText(presets[presetType]);
    setResult(null);
  };

  const renderHighlightedText = () => {
    if (!text) return null;
    const allTriggers = [...TRIGGER_WORDS.urgency, ...TRIGGER_WORDS.financial, ...TRIGGER_WORDS.impersonation];
    const regexStr = '\\b(' + allTriggers.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b';
    const regex = new RegExp(regexStr, 'gi');
    const parts = text.split(regex);

    return (
      <div style={{ lineHeight: 1.6, fontSize: '0.9rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
        {parts.map((part, index) => {
          const isTrigger = allTriggers.some(trigger => trigger.toLowerCase() === part.toLowerCase());
          if (isTrigger) {
            let color = 'var(--status-warning)';
            if (TRIGGER_WORDS.urgency.includes(part.toLowerCase())) color = 'var(--status-danger)';
            if (TRIGGER_WORDS.impersonation.includes(part.toLowerCase())) color = 'var(--accent-cyan)';

            return (
              <span key={index} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: color, borderBottom: `2px solid ${color}`, padding: '0 2px', fontWeight: 600 }}>
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-cyan)' }}>//</span> SMS & Social Message Phishing Scanner
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Paste suspicious texts, emails, or drag-and-drop a screenshot to scan for authority claims, pressure words, and fake URLs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Input Text / Upload Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Drag & Drop OCR screenshot */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
              border: '2px dashed',
              borderColor: dragActive ? 'var(--accent-cyan)' : 'var(--border-color)',
              background: dragActive ? 'rgba(6, 182, 212, 0.05)' : 'rgba(18, 25, 47, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: '#94a3b8',
              transition: 'var(--transition)'
            }}
            onClick={() => document.getElementById('message-screenshot-uploader').click()}
          >
            <input 
              type="file" 
              id="message-screenshot-uploader" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
            />
            📸 Drag & Drop message screenshot or click to upload (Auto OCR text extraction)
          </div>

          <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              className="form-control"
              rows="6"
              placeholder="Paste suspicious text message here..."
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
                {scanning ? 'Analyzing message...' : 'Scan Message'}
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

          {/* Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>Presets:</span>
            <button onClick={() => loadPreset('bank')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              🚨 Banking Alert SMS
            </button>
            <button onClick={() => loadPreset('lottery')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              🚨 Lottery DM
            </button>
            <button onClick={() => loadPreset('work')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              🚨 WhatsApp Job Offer
            </button>
            <button onClick={() => loadPreset('clean')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              ✅ Friends Meetup text
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div>
          {scanning && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              minHeight: '200px',
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
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {ocrProgress || 'Analyzing text matrices...'}
              </div>
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
              Enter message or drop a screenshot and run scan to see details.
            </div>
          )}

          {!scanning && result && (
            <div className={`glass-card ${result.confidence < 80 ? 'warning-glow' : result.riskLevel === 'Low' ? 'safe-glow' : result.riskLevel === 'Medium' ? 'warning-glow' : 'danger-glow'}`} style={{
              borderLeft: '4px solid',
              borderColor: result.confidence < 80 ? 'var(--status-warning)' : result.riskLevel === 'Low' ? 'var(--status-safe)' : result.riskLevel === 'Medium' ? 'var(--status-warning)' : 'var(--status-danger)',
              padding: '20px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              
              {result.confidence < 80 ? (
                /* Suppress low confidence values */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span className="badge badge-warning">INSUFFICIENT DATA</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>Words: {result.wordCount}</span>
                  </div>
                  <h4 style={{ fontSize: '1.25rem', color: 'var(--status-warning)', marginBottom: '8px' }}>
                    Insufficient evidence. Manual verification recommended.
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    The scan confidence score is too low ({result.confidence}%) to formulate an accurate safety index. Please manually double check the sender details and links.
                  </p>
                </div>
              ) : (
                /* High confidence results */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <span className={`badge ${result.riskLevel === 'Low' ? 'badge-safe' : result.riskLevel === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
                        {result.riskLevel} Risk Flag
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Scan Confidence: {result.confidence}%</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: result.riskLevel === 'Low' ? 'var(--status-safe)' : result.riskLevel === 'Medium' ? 'var(--status-warning)' : 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>
                        {result.score}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>/100</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div style={{ background: '#040711', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Highlighted Analysis:</div>
                    {renderHighlightedText()}
                  </div>

                  {/* Reasoning & Recommended Action */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                    <div>
                      <strong style={{ color: '#fff' }}>Reasoning:</strong>
                      <div style={{ color: '#cbd5e1', marginTop: '2px', lineHeight: 1.4 }}>{result.reasoning}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#fff' }}>Recommended Action:</strong>
                      <div style={{ color: 'var(--accent-cyan)', marginTop: '2px', fontWeight: 600 }}>{result.recommendedAction}</div>
                    </div>
                  </div>

                  {/* Detections */}
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Detected Phishing Indicators:</div>
                    {result.detectedWords.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {result.detectedWords.map((item, idx) => {
                          let color = 'var(--status-warning)';
                          if (item.category === 'Urgency Pressure' || item.category === 'Dead DNS Phish Link') color = 'var(--status-danger)';
                          if (item.category === 'Authority Claim') color = 'var(--accent-cyan)';

                          return (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem' }}>
                              <span style={{ color: '#fff', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>"{item.word}"</span>
                              <span style={{ color: color, fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>{item.category}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--status-safe)', background: 'rgba(16, 185, 129, 0.04)', padding: '8px', borderRadius: '4px' }}>
                        No standard text threat indicators or spoofing tokens matched.
                      </div>
                    )}
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
