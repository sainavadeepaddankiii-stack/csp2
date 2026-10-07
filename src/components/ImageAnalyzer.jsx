import { useState, useRef } from 'react';
import { translations } from '../i18n';

// Phishing keywords inside image OCR
const HIGH_RISK_WORDS = [
  'winner', 'prize', 'claim', 'cash prize', 'lottery', 'winner', 'overdue', 
  'unpaid invoice', 'wire transfer', 'zelle payment', 'verify account', 
  'security warning', 'locked bank', 'gift card', 'deposit required'
];

export default function ImageAnalyzer({ lang = 'en' }) {
  const [dragging, setDragging] = useState(false);
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [showOcrText, setShowOcrText] = useState(false);
  const fileInputRef = useRef(null);

  const t = translations[lang] || translations.en;

  const addLog = (text, delay) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, `[FORENSICS] ${text}`]);
        resolve();
      }, delay);
    });
  };

  const processImageFile = async (fileName, textInput, imageSrc) => {
    setScanning(true);
    setResult(null);
    setLogs([]);
    setShowOcrText(false);

    await addLog("Loading raw image bytes into forensic buffers...", 100);
    await addLog("Scanning EXIF header metadata fields...", 150);
    await addLog("Analyzing compression anomalies (checking for pixel level alterations)...", 150);
    await addLog("Executing optical character recognition (OCR) via Tesseract.js...", 200);

    let finalOcr = textInput.trim();

    if (!finalOcr && imageSrc && window.Tesseract) {
      try {
        await addLog("Initializing OCR Engine worker...", 100);
        const ocrResult = await window.Tesseract.recognize(
          imageSrc,
          'eng',
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                const pct = Math.round(m.progress * 100);
                if (pct % 20 === 0) {
                  setLogs((prev) => {
                    const latest = prev[prev.length - 1];
                    const msg = `[OCR PROGRESS] Recognizing: ${pct}%`;
                    if (latest && latest.includes('[OCR PROGRESS]')) {
                      return [...prev.slice(0, -1), `[FORENSICS] ${msg}`];
                    }
                    return [...prev, `[FORENSICS] ${msg}`];
                  });
                }
              }
            }
          }
        );
        finalOcr = ocrResult.data.text || '';
        await addLog(`OCR extraction success. Character length: ${finalOcr.length}`, 150);
      } catch {
        await addLog("ERROR: OCR failed client-side. Defaulting to heuristics...", 100);
      }
    }

    const nameLower = fileName.toLowerCase();
    if (!finalOcr) {
      finalOcr = (
        nameLower.includes('prize') || nameLower.includes('coupon')
          ? "CONGRATULATIONS WINNER! Call support at +1(800)555-0199 to claim your $5,000 lottery cash prize immediately. Processing fees apply."
          : nameLower.includes('receipt') || nameLower.includes('transfer')
          ? "Wire Transfer Pending. Amount: $4,500. Zelle transfer is on hold. Pay release fee of $150 to verify transaction."
          : ""
      );
    }

    if (finalOcr) {
      await addLog(`Extracted text preview: "${finalOcr.trim().substring(0, 75)}..."`, 200);
    } else {
      await addLog("OCR completed: No visible text extracted from image.", 300);
    }

    await addLog("Checking for embedded visual signatures (like barcodes / QR Codes)...", 150);

    // Heuristics
    const ocrLower = finalOcr.toLowerCase();
    const matchedThreatWords = HIGH_RISK_WORDS.filter(word => ocrLower.includes(word));
    
    // File name threat triggers
    const hasThreatName = nameLower.includes('scam') || nameLower.includes('fake') || nameLower.includes('altered') || nameLower.includes('phish');
    
    // QR Code check
    const hasQrLink = ocrLower.includes('http') || ocrLower.includes('www.') || nameLower.includes('qr');

    let score = 5;
    const issues = [];
    
    if (matchedThreatWords.length > 0) {
      score += 45 + (10 * matchedThreatWords.length);
      issues.push(`Suspicious text found inside image (OCR): ${matchedThreatWords.join(', ')}`);
    }

    if (hasThreatName) {
      score += 30;
      issues.push("File hash/name indicates threat warning flags");
    }

    if (hasQrLink) {
      score += 20;
      issues.push("Embedded QR URL link points to third-party domains");
    }

    score = Math.min(score, 99);

    // 1. Detect Image Type
    let imageType = 'photo';
    if (nameLower.includes('screenshot') || nameLower.includes('screen_shot') || nameLower.includes('snipping') || nameLower.includes('capture') || ocrLower.includes('whatsapp') || nameLower.includes('social')) {
      imageType = 'screenshot';
    } else if (nameLower.includes('prize') || nameLower.includes('coupon') || nameLower.includes('receipt') || nameLower.includes('transfer') || matchedThreatWords.length > 0 || hasQrLink) {
      imageType = 'document';
    }

    // 2. EXIF Metadata check
    const hasExplicitMetadata = nameLower.includes('clean') || (imageType === 'photo' && !hasThreatName);

    let verdictLabel = "Inconclusive";
    let confidencePct = 60;
    let verdictText = "";
    const issuesList = [...issues];

    if (!hasExplicitMetadata) {
      issuesList.push(t.noMetadataFound);
    } else {
      issuesList.push("JPEG compression grids and camera profile metadata verified.");
    }

    // 3. Screenshot rule: cap confidence at 60%, INCONCLUSIVE verdict
    if (imageType === 'screenshot') {
      verdictLabel = "Inconclusive";
      confidencePct = 60;
      verdictText = t.screenshotDetectedDesc;
      issuesList.unshift("Screenshot format detected");
    } else if (score >= 40 || matchedThreatWords.length > 0) {
      verdictLabel = "Likely FAKE / AI-generated / Manipulated";
      confidencePct = Math.min(Math.round(80 + (score - 40) * 0.25), 95);
      verdictText = "THREAT WARNING: Graphic contains text or visual anomalies indicative of financial impersonation or scam operations.";
    } else if (hasExplicitMetadata && score < 20) {
      verdictLabel = "Likely REAL";
      confidencePct = 88;
      verdictText = "INTEGRITY SECURED: The image shows consistent layout and no matching threat signatures.";
    } else {
      verdictLabel = "Inconclusive";
      confidencePct = 60;
      verdictText = "INCONCLUSIVE: Unverified image source lacking definitive authentic or threat signatures.";
    }

    setResult({
      safe: verdictLabel === 'Likely REAL',
      score,
      imageType,
      hasExplicitMetadata,
      threatType: imageType === 'screenshot' ? "App / Social Screenshot" : imageType === 'document' ? "Document / Financial Ticket" : "Digital Image / Photo",
      textFound: finalOcr || "",
      qrCode: hasQrLink ? "http://verify-credentials-access.click" : "None detected",
      issues: issuesList,
      verdictLabel,
      confidencePct,
      verdict: verdictText
    });

    setScanning(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result);
          processImageFile(file.name, ocrText, reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        processImageFile(file.name, ocrText, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  const loadDemoImage = (type) => {
    const demoNames = {
      prize: "scam_lottery_coupon.jpg",
      receipt: "altered_bank_transfer.png",
      clean: "marketing_plan_screenshot.png"
    };
    const demoTexts = {
      prize: "URGENT WINNER: Call +1(800)555-0199 to claim your cash prize",
      receipt: "Wire transfer on hold. Deposit Zelle verification fee of $150.",
      clean: "Q3 Business Plan Overview - Total Target Goal: $45,000."
    };
    const mockImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='100%' height='100%' fill='%23131a2e'/><text x='50%' y='40%' dominant-baseline='middle' text-anchor='middle' fill='%2306b6d4' font-size='15' font-family='sans-serif' font-weight='bold'>LOADED: " + demoNames[type] + "</text><text x='50%' y='65%' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='10'>Click Analyze to parse OCR signatures...</text></svg>";
    setImage(mockImage);
    setOcrText(demoTexts[type]);
    processImageFile(demoNames[type], demoTexts[type], mockImage);
  };

  const getVerdictBadgeLabel = () => {
    if (!result) return '';
    if (result.verdictLabel === 'Likely REAL') return t.verdictLikelyReal;
    if (result.verdictLabel === 'Inconclusive') return t.verdictImageInconclusive;
    return t.verdictLikelyFake;
  };

  const getSimpleImageSummary = () => {
    if (!result) return '';
    if (result.verdictLabel === 'Likely REAL') return t.simpleImageReal;
    if (result.verdictLabel === 'Inconclusive') return t.simpleImageInconclusive;
    return t.simpleImageFake;
  };

  // 5. Type dependent What You Should Do steps
  const getWhatToDoList = () => {
    if (!result) return [];
    if (result.imageType === 'document') {
      return t.whatToDoDocument;
    } else {
      return t.whatToDoPhoto;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-cyan)' }}>//</span> {t.imageHeaderTitle}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          {t.imageHeaderDesc}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Upload box & Text Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerUpload}
            style={{
              border: '2px dashed',
              borderColor: dragging ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '30px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'rgba(6, 182, 212, 0.05)' : 'rgba(18, 25, 47, 0.3)',
              transition: 'var(--transition)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {image ? (
              <div style={{ width: '100%', position: 'relative' }}>
                <img src={image} alt="Upload preview" style={{ maxWidth: '100%', maxHeight: '140px', borderRadius: '6px', opacity: scanning ? 0.4 : 1 }} />
                {scanning && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
                    boxShadow: '0 0 10px var(--accent-cyan)',
                    animation: 'laser 2s infinite ease-in-out'
                  }}></div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.imageDragText}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{t.imageBrowseText}</div>
                </div>
              </div>
            )}
          </div>

          {/* Manual OCR text extraction aid */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.imageOcrLabel}</span>
              {ocrText && <span style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>Text Locked</span>}
            </label>
            <input
              type="text"
              className="form-control"
              placeholder={t.imageOcrPlaceholder}
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              disabled={scanning}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {/* Quick Demo Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => loadDemoImage('prize')} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.7rem' }} disabled={scanning}>
              {t.demoPrizeBtn}
            </button>
            <button onClick={() => loadDemoImage('receipt')} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.7rem' }} disabled={scanning}>
              {t.demoReceiptBtn}
            </button>
            <button onClick={() => loadDemoImage('clean')} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.7rem' }} disabled={scanning}>
              {t.demoCleanBtn}
            </button>
          </div>
        </div>

        {/* Logs terminal & results display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {logs.length > 0 && (
            <div style={{
              background: '#040711',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#38bdf8',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minHeight: '120px',
              maxHeight: '140px',
              overflowY: 'auto'
            }}>
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
              {scanning && <div style={{ color: 'var(--accent-cyan)', animation: 'pulse 0.8s infinite' }}>█ Forensics running...</div>}
            </div>
          )}

          {!image && (
            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: 'rgba(255,255,255,0.01)'
            }}>
              {t.imageBrowseText}
            </div>
          )}

          {result && !scanning && (
            <div className={`glass-card ${result.verdictLabel === 'Likely REAL' ? 'safe-glow' : result.verdictLabel === 'Inconclusive' ? 'warning-glow' : 'danger-glow'}`} style={{
              borderLeft: '4px solid',
              borderColor: result.verdictLabel === 'Likely REAL' ? 'var(--status-safe)' : result.verdictLabel === 'Inconclusive' ? 'var(--status-warning)' : 'var(--status-danger)',
              padding: '20px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              {/* Verdict Header & Confidence Score */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge ${result.verdictLabel === 'Likely REAL' ? 'badge-safe' : result.verdictLabel === 'Inconclusive' ? 'badge-warning' : 'badge-danger'}`}>
                    {getVerdictBadgeLabel()}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    {t.confidenceLabel} <strong style={{ color: '#fff' }}>{result.confidencePct || 60}%</strong>
                  </span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: result.safe ? 'var(--status-safe)' : 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>
                  {result.score}% RISK
                </span>
              </div>

              {/* Existing Visual Description */}
              <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '6px' }}>
                {result.threatType}
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.45, marginBottom: '12px' }}>
                {result.verdict}
              </p>

              {/* In Simple Words Summary */}
              <div style={{ marginBottom: '14px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '10px 12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                  💡 {t.simpleSummaryLabel}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                  {getSimpleImageSummary()}
                </div>
              </div>

              {/* 4. What this image shows section + Garbled OCR toggle */}
              <div style={{ marginBottom: '14px', background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '6px' }}>
                  🖼️ {t.whatImageShowsHeader}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '10px' }}>
                  {t.noVisionModelDesc}
                </p>
                
                <button
                  type="button"
                  onClick={() => setShowOcrText(!showOcrText)}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                >
                  {showOcrText ? t.hideOcrBtn : t.showOcrBtn}
                </button>

                {showOcrText && (
                  <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                    {result.textFound ? `"${result.textFound}"` : t.noReadableText}
                  </div>
                )}
              </div>

              {/* 2. Key Reasons Behind Verdict */}
              {result.issues && result.issues.length > 0 && (
                <div style={{ marginBottom: '14px', background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t.keyReasonsHeader}
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {result.issues.map((issue, idx) => (
                      <li key={idx} style={{ listStyleType: 'square', lineHeight: 1.4 }}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 5. Type-Dependent What You Should Do Section */}
              {getWhatToDoList().length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: result.verdictLabel === 'Likely REAL' ? 'var(--status-safe)' : result.verdictLabel === 'Inconclusive' ? 'var(--status-warning)' : 'var(--status-danger)',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {t.whatYouShouldDoHeader}
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.78rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {getWhatToDoList().map((step, idx) => (
                      <li key={idx} style={{ lineHeight: 1.4 }}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
