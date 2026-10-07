// src/i18n.js

export const getInitialLanguage = () => {
  try {
    const saved = localStorage.getItem('csp_language');
    if (saved === 'te' || saved === 'en') return saved;
  } catch {
    // Fallback if localStorage is restricted
  }
  return 'en';
};

export const saveLanguageChoice = (lang) => {
  try {
    localStorage.setItem('csp_language', lang);
  } catch {
    // Ignore storage errors
  }
};

export const translations = {
  en: {
    // Header & Toggle
    toggleLangLabel: "Language / భాష",
    scanCenterTitle: "AI Scan Center",
    
    // Tabs
    tabUrlTitle: "URL / Domain Check",
    tabUrlDesc: "Credential spoofing checks",
    tabImageTitle: "Image & Forensics",
    tabImageDesc: "OCR & metadata checks",
    tabMessageTitle: "Phishing Message",
    tabMessageDesc: "SMS urgency analysis",
    tabVoiceTitle: "Voice Deepfake",
    tabVoiceDesc: "Voice fingerprinting",
    tabSocialTitle: "Social Media / Fake News",
    tabSocialDesc: "Clickbait & post credibility",
    
    // URL Analyzer UI
    urlHeaderTitle: "AI Domain & Link Analyzer",
    urlHeaderDesc: "Detects credential harvesters, lookalike brand domains, unsecured connections, and high-risk domain registries.",
    urlInputPlaceholder: "Paste URL (e.g. secure-paypal-login.com or wikipedia.org)",
    urlAnalyzeBtn: "Analyze URL",
    urlScanningBtn: "Scanning...",
    
    // URL Verdicts & Headings
    verdictHighRisk: "HIGH RISK - LIKELY PHISHING",
    verdictSuspicious: "SUSPICIOUS",
    verdictLowRisk: "LOW RISK",
    verdictInsufficientData: "INSUFFICIENT DATA",
    
    titleHighRisk: "Malicious Domain Spoof Detected",
    titleSuspicious: "Suspicious Domain Activity Flagged",
    titleLowRisk: "Domain Verified Clean",
    titleInsufficientData: "Insufficient evidence. Manual verification recommended.",
    
    simpleSummaryLabel: "In Simple Words:",
    simpleSummaryHighRisk: "This link looks like a dangerous fake website designed to steal your passwords or money. Do NOT open it.",
    simpleSummarySuspicious: "This website has warning signs. It might be untrustworthy. Avoid entering any personal information.",
    simpleSummaryLowRisk: "This website appears safe and legitimate. However, always verify HTTPS before logging in.",
    simpleSummaryInsufficientData: "We cannot verify this link with certainty. Avoid sharing personal details.",

    networkDetailsSsl: "SSL Certificate Issuer",
    networkDetailsAge: "Domain Registration Status",
    networkDetailsIp: "Server IP & Hosting Geolocation",
    threatBreakdownHeader: "Threat Breakdown Details:",
    multiEngineHeader: "Multi-Engine Verification Matrix (10 Layers)",
    safetyStepsHeader: "Recommended Safety Steps",

    // URL Safety Steps (EN)
    safetyHighRisk: [
      "Do NOT open, click, or interact with links or buttons on this page.",
      "Do NOT enter any credentials, personal information, or financial details.",
      "Report the suspicious URL to your security team or threat registry immediately.",
      "Run an antivirus scan if the site was already opened or downloaded any content."
    ],
    safetySuspicious: [
      "Avoid entering passwords, personal information, or payment details.",
      "Verify domain spelling carefully for homoglyph characters or typosquatting (e.g. paypa1.com vs paypal.com).",
      "Check with the official source or navigate directly via a bookmarked official URL."
    ],
    safetyLowRisk: [
      "Stay cautious and check that the browser connection uses valid HTTPS encryption.",
      "Do not share sensitive personal data unless strictly necessary and verified.",
      "Confirm domain certificate details before submitting confidential details."
    ],
    safetyInsufficient: [
      "Do not enter any personal credentials or financial details.",
      "Verify the domain ownership via official secondary channels.",
      "Proceed with caution as automated check results were inconclusive."
    ],

    // Image Analyzer UI
    imageHeaderTitle: "Image Metadata & OCR Forensics",
    imageHeaderDesc: "Upload screenshots of fake invoices, prize coupons, bank transfer receipts, or QR codes to scan for editing traces, hidden metadata, or phishing links.",
    imageDragText: "Drag & Drop Image Here",
    imageBrowseText: "or click to browse local files",
    imageOcrLabel: "Pasted OCR Text from Image (Optional override)",
    imageOcrPlaceholder: "e.g. You won a cash prize! Claim immediately...",
    demoPrizeBtn: "⚠️ Prize Coupon",
    demoReceiptBtn: "⚠️ Altered Receipt",
    demoCleanBtn: "✅ Clean Sheet",
    
    // Image Verdicts & Headings
    verdictLikelyFake: "Likely FAKE / AI-generated / Manipulated",
    verdictLikelyReal: "Likely REAL",
    verdictImageInconclusive: "Inconclusive",
    
    confidenceLabel: "Confidence:",
    extractedOcrHeader: "Extracted OCR Text & Content Description:",
    keyReasonsHeader: "🔍 Key Reasons Behind Verdict:",
    whatYouShouldDoHeader: "📋 What You Should Do:",

    simpleImageFake: "This image shows strong indicators of being edited, altered, or containing scam text. Be extremely cautious.",
    simpleImageReal: "This image appears authentic with consistent lighting and pixel layout. No threat signatures were detected.",
    simpleImageInconclusive: "Image details are ambiguous or from a screenshot. Verify through official channels before trusting.",

    // Image Analyzer New Keys (Item 2, 3, 4, 5)
    noMetadataFound: "No metadata found (common for images shared via WhatsApp or social media). This is not proof either way.",
    screenshotDetectedDesc: "Screenshot detected, the original photo inside cannot be verified",
    whatImageShowsHeader: "What this image shows:",
    noVisionModelDesc: "OCR engine extracts text from images, but cannot describe visual scenes without an active AI vision model.",
    showOcrBtn: "Show extracted text",
    hideOcrBtn: "Hide extracted text",
    noReadableText: "No readable text extracted from this image.",

    // Image Reasons (EN)
    reasonsFake: [
      "Metadata mismatch & missing standard camera EXIF data headers",
      "Pixel grid alterations detected around primary text segments (splice traces)",
      "Inconsistent lighting & unnatural edge texturing across graphic elements",
      "Suspicious graphic signatures detected in visual layout"
    ],
    reasonsReal: [
      "Regular JPEG compression grids confirmed throughout pixel structure",
      "EXIF markers indicate standard desktop capture software profile (macOS/Windows Snipping)",
      "Natural edge alignment and consistent lighting patterns",
      "No phishing identifiers or malicious embedded QR codes matched"
    ],
    reasonsInconclusive: [
      "Screenshot format detected — inner embedded photo cannot be verified",
      "Metadata missing or unverified, which is common for social media downloads",
      "OCR text extracted is neutral without conclusive authenticity markers"
    ],

    // Image What To Do (EN)
    whatToDoFake: [
      "Verify the image source directly with the official sender or institution.",
      "Perform a reverse image search (e.g., Google Lens or TinEye) to trace the original context.",
      "Do NOT share, forward, or repost this image if it is likely fake or manipulated.",
      "Check for original news coverage or official fact-checking database reports."
    ],
    whatToDoReal: [
      "Always verify sender identity before acting on sensitive invoice or financial requests.",
      "Cross-reference official channels if the image requests payment or personal data updates.",
      "Store authentic receipts or financial documents in secure encrypted storage."
    ],
    whatToDoInconclusive: [
      "Perform a reverse image search (e.g., Google Lens or TinEye) to trace original photo context.",
      "Check the original account history, handle, and initial posting date.",
      "Look for the same image or event coverage from verified news databases.",
      "Avoid taking financial or high-risk actions based solely on unverified media."
    ],
    whatToDoPhoto: [
      "Perform a reverse image search (e.g. Google Lens or TinEye) to trace the original photo source.",
      "Check the original publisher's account history, username, and initial posting date.",
      "Look for the same image or event coverage from verified news databases or trusted media.",
      "Do NOT share or forward this image if the original source cannot be independently verified."
    ],
    whatToDoDocument: [
      "Verify the invoice or receipt directly with the issuing institution or bank before taking any action.",
      "Cross-reference official contact numbers or payment portals instead of text printed on the image.",
      "Do NOT pay release fees or deposit upfront cash for lottery claims or pending transfers.",
      "Store secure digital copies of authentic receipts and financial records."
    ],

    // Voice Deepfake Panel Keys (Item 1-8)
    voiceHeaderTitle: "AI Voice Cloning & Deepfake Detector",
    voiceHeaderDesc: "Analyze audio recordings or live speech for synthetic pitch patterns, pause rhythms, and vocoder artifacts.",
    voiceDisclaimer: "Acoustic feature screening. For critical decisions, verify by calling back on a known number.",
    modelPerformanceLabel: "Model performance:",
    uploadAudioBtn: "📁 Upload Audio (mp3, wav, m4a)",
    recordLiveBtn: "🎙️ Record Live Speech",
    stopMicBtn: "Stop Mic",
    demoPresetsHeader: "Demo samples (simulated):",
    simulatedBadge: "Simulated Example",
    verdictLikelyHuman: "Likely Human",
    verdictPossiblySynthetic: "Possibly Synthetic",
    verdictLikelyAiGenerated: "Likely AI-Generated",
    verdictVoiceInconclusive: "Inconclusive",
    verdictServerOffline: "Detection server offline",
    voiceShortClipError: "Audio clip is too short (under 3 seconds). Minimum 3 seconds required for deepfake detection.",
    voiceLargeFileError: "File is too large. Maximum allowed size is 15MB.",
    voiceInvalidFormatError: "Invalid file format. Please upload a WAV, MP3, M4A, or WEBM audio file.",
    voiceServerOfflineDesc: "Detection server offline. Please start the backend service at http://localhost:8000 and try again.",
    voiceShortOrNoisyNotice: "Audio clip is shorter than 3 seconds or contains excessive background noise, preventing conclusive analysis.",
    voiceSafetyHeader: "Recommended Safety Steps",
    voiceSafetySteps: [
      "Always hang up and call back on the person's saved, known phone number.",
      "Ask a secret personal question or shared memory that only the real person knows.",
      "Never transfer money, purchase gift cards, or share OTPs based solely on a voice call.",
      "Report voice cloning fraud to the national helpline 1930 or cybercrime.gov.in."
    ],
    audioAnalysisMatrix: "Web Audio API Audio Analysis Matrix"
  },

  te: {
    // Header & Toggle
    toggleLangLabel: "భాష / Language",
    scanCenterTitle: "AI స్కాన్ కేంద్రం",

    // Tabs
    tabUrlTitle: "URL / డొమైన్ తనిఖీ",
    tabUrlDesc: "పాస్‌వర్డ్ నకిలీ సైట్ల తనిఖీ",
    tabImageTitle: "ఫోటో & సమాచార తనిఖీ",
    tabImageDesc: "ఫోటో మార్పులు & టెక్స్ట్ విశ్లేషణ",
    tabMessageTitle: "ఫిషింగ్ మెసేజ్",
    tabMessageDesc: "SMS తనిఖీ",
    tabVoiceTitle: "వాయిస్ డీప్‌ఫేక్",
    tabVoiceDesc: "వాయిస్ క్లోనింగ్ తనిఖీ",
    tabSocialTitle: "సోషల్ మీడియా / ఫేక్ న్యూస్",
    tabSocialDesc: "నకిలీ వార్తల తనిఖీ",

    // URL Analyzer UI
    urlHeaderTitle: "AI వెబ్‌సైట్ & లింక్ తనిఖీ కేంద్రం",
    urlHeaderDesc: "నకిలీ వెబ్‌సైట్లు, మీ సమాచారాన్ని దొంగిలించే లింక్‌లు మరియు ప్రమాదకరమైన డొమైన్‌లను గుర్తించండి.",
    urlInputPlaceholder: "లింక్ (URL) పేస్ట్ చేయండి (ఉదా: google.com లేదా netflix.com)...",
    urlAnalyzeBtn: "URL విశ్లేషించండి",
    urlScanningBtn: "తనిఖీ జరుగుతోంది...",

    // URL Verdicts & Headings
    verdictHighRisk: "అత్యంత ప్రమాదకరం - ఫిషింగ్ కావచ్చు (HIGH RISK)",
    verdictSuspicious: "సందేహాస్పదం (SUSPICIOUS)",
    verdictLowRisk: "సురక్షితం (LOW RISK)",
    verdictInsufficientData: "సరిపోలిన సమాచారం లేదు (INSUFFICIENT DATA)",

    titleHighRisk: "నకిలీ & ప్రమాదకరమైన లింక్ గుర్తించబడింది!",
    titleSuspicious: "సందేహాస్పదమైన లింక్ - జాగ్రత్త వహించండి",
    titleLowRisk: "సురక్షితమైన వెబ్‌సైట్‌గా ధృవీకరించబడింది",
    titleInsufficientData: "సరిపోలిన వివరాలు లేవు. సొంతంగా పరిశీలించండి.",

    simpleSummaryLabel: "సులభమైన మాటల్లో చెప్పాలంటే (In simple words):",
    simpleSummaryHighRisk: "ఈ లింక్ మీ పాస్‌వర్డ్‌లు లేదా బ్యాంక్ వివరాలను దొంగిలించడానికి తయారు చేసిన నకిలీ సైట్ కావచ్చు. దీనిపై క్లిక్ చేయకండి.",
    simpleSummarySuspicious: "ఈ లింక్‌లో కొన్ని అనుమానాస్పద చిహ్నాలు ఉన్నాయి. మీ వ్యక్తిగత వివరాలను ఇందులో నమోదు చేయకండి.",
    simpleSummaryLowRisk: "ఈ వెబ్‌సైట్ సురక్షితమైనదిగానే కనిపిస్తోంది. అయితే వివరాలు ఇచ్చే ముందు పైన HTTPS తాళం గుర్తు ఉందో లేదో చూడండి.",
    simpleSummaryInsufficientData: "ఈ లింక్ గురించి పూర్తి వివరాలు దొరకలేదు. జాగ్రత్తగా ఉండండి.",

    networkDetailsSsl: "SSL సెక్యూరిటీ సర్టిఫికేట్ (SSL Certificate)",
    networkDetailsAge: "వెబ్‌సైట్ రిజిస్ట్రేషన్ వివరాలు (Domain Age)",
    networkDetailsIp: "సర్వర్ IP & ప్రాంత వివరాలు (Server IP)",
    threatBreakdownHeader: "గుర్తించిన ప్రమాద వివరాలు (Threat Breakdown):",
    multiEngineHeader: "10-స్థాయిల సాంకేతిక తనిఖీ (Multi-Engine Matrix - English)",
    safetyStepsHeader: "సూచించిన భద్రతా చర్యలు (Recommended Safety Steps)",

    // URL Safety Steps (TE)
    safetyHighRisk: [
      "ఈ వెబ్‌సైట్‌లోని ఏ లింక్‌ను లేదా బటన్‌ను క్లిక్ చేయకండి.",
      "మీ పాస్‌వర్డ్‌లు, పిన్ నంబర్లు లేదా బ్యాంక్ వివరాలను ఇక్కడ నమోదు చేయవద్దు.",
      "ఈ అనుమానాస్పద లింక్‌ను సైబర్ క్రైమ్ లేదా సెక్యూరిటీ టీమ్‌కు నివేదించండి (Report cyber fraud).",
      "ఒకవేళ మీరు ఇప్పటికే లింక్ ఓపెన్ చేసి ఉంటే, వెంటనే మీ ఫోన్ లేదా కంప్యూటర్‌లో యాంటీవైరస్ స్కాన్ (Antivirus scan) చేయండి."
    ],
    safetySuspicious: [
      "మీ ముఖ్యమైన పాస్‌వర్డ్‌లు లేదా పేమెంట్ వివరాలను ఈ సైట్‌లో ఇవ్వకండి.",
      "వెబ్‌సైట్ పేరు అక్షరాలను జాగ్రత్తగా గమనించండి (ఉదా: paypal.com కి బదులు paypa1.com ఉందేమో చూడండి).",
      "అధికారిక యాప్ లేదా అసలైన వెబ్‌సైట్ ద్వారా మాత్రమే లాగిన్ అవ్వండి."
    ],
    safetyLowRisk: [
      "జాగ్రత్తగా ఉంటూ, బ్రౌజర్ అడ్రస్ బార్‌లో secure HTTPS (తాళం గుర్తు) ఉందో లేదో సరిచూసుకోండి.",
      "అవసరమైతే తప్ప మీ వ్యక్తిగత రహస్యాలను షేర్ చేయకండి.",
      "ముఖ్యమైన వివరాలు ఎంటర్ చేసే ముందు వెబ్‌సైట్ అడ్రస్ సరిగ్గా ఉందో లేదో చూడండి."
    ],
    safetyInsufficient: [
      "మీ వ్యక్తిగత వివరాలు లేదా బ్యాంక్ సమాచారాన్ని నమోదు చేయవద్దు.",
      "సంబంధిత సంస్థ అధికారిక సైట్ ద్వారా మాత్రమే సమాచారాన్ని సరిచూసుకోండి.",
      "పూర్తి వివరాలు లభించనందున జాగ్రత్తగా వ్యవహరించండి."
    ],

    // Image Analyzer UI
    imageHeaderTitle: "ఫోటో నకిలీ & ఒరిజినాలిటీ తనిఖీ (Image Forensics)",
    imageHeaderDesc: "నకిలీ రసీదులు, లాటరీ కూపన్లు, బ్యాంక్ స్క్రీన్‌షాట్‌లు లేదా QR కోడ్‌ల ఫోటోలను అప్‌లోడ్ చేసి అందులో మార్పులు లేదా మోసపూరిత లింక్‌లు ఉన్నాయో లేదో తెలుసుకోండి.",
    imageDragText: "ఫోటోను ఇక్కడ డ్రాగ్ & డ్రాప్ చేయండి",
    imageBrowseText: "లేదా మీ ఫోన్/కంప్యూటర్ నుండి ఎంచుకోండి",
    imageOcrLabel: "ఫోటోలో ఉన్న టెక్స్ట్ (Pasted OCR Text)",
    imageOcrPlaceholder: "ఉదా: మీరు బహుమతి గెలుచుకున్నారు! వెంటనే క్లెయిమ్ చేయండి...",
    demoPrizeBtn: "⚠️ లాటరీ కూపన్",
    demoReceiptBtn: "⚠️ మార్చిన రసీదు",
    demoCleanBtn: "✅ అసలైన ఫోటో",

    // Image Verdicts & Headings
    verdictLikelyFake: "నకిలీ / AI సృష్టి / మార్చబడింది (Likely FAKE)",
    verdictLikelyReal: "నిజమైనది కావచ్చు (Likely REAL)",
    verdictImageInconclusive: "ఖచ్చితంగా చెప్పలేము (Inconclusive)",

    confidenceLabel: "నమ్మకమైన శాతం (Confidence):",
    extractedOcrHeader: "ఫోటోలో గుర్తించిన టెక్స్ట్ (Extracted OCR Text):",
    keyReasonsHeader: "🔍 ఈ నిర్ణయానికి ముఖ్య కారణాలు (Key Reasons):",
    whatYouShouldDoHeader: "📋 మీరు ఏమి చేయాలి (What You Should Do):",

    simpleImageFake: "ఈ ఫోటోలో మార్పులు చేసిన ఆనవాళ్లు లేదా మోసపూరిత పదాలు ఉన్నాయి. అత్యంత జాగ్రత్త వహించండి.",
    simpleImageReal: "ఈ ఫోటో మార్చబడలేదు, ఒరిజినల్‌గానే కనిపిస్తోంది. ఎలాంటి ప్రమాదకర సంకేతాలు లభించలేదు.",
    simpleImageInconclusive: "ఈ ఫోటో వివరాలు స్పష్టంగా లేవు లేదా స్క్రీన్‌షాట్‌ కావచ్చు. అధికారిక మార్గాల ద్వారా సరిచూసుకోండి.",

    // Image Analyzer New Keys (TE)
    noMetadataFound: "మెటాడేటా ఏదీ లభించలేదు (WhatsApp లేదా సోషల్ మీడియాలో షేర్ చేసే ఫోటోలలో ఇది సాధారణమే). దీని ఆధారంగా ఖచ్చితమైన తీర్పు చెప్పలేము.",
    screenshotDetectedDesc: "స్క్రీన్‌షాట్ గుర్తించబడింది. ఇందులోని అసలు ఫోటో నిజమైనదో కాదో పరిశీలించలేము.",
    whatImageShowsHeader: "ఈ ఫోటోలో ఏముంది (What this image shows):",
    noVisionModelDesc: "OCR సాంకేతికత ఫోటోలోని అక్షరాలను మాత్రమే చదవగలదు; పూర్తి దృశ్యాన్ని వివరించడానికి AI విజన్ మోడల్ అవసరం.",
    showOcrBtn: "గుర్తించిన టెక్స్ట్ చూడండి",
    hideOcrBtn: "టెక్స్ట్ దాచండి",
    noReadableText: "ఈ ఫోటో నుండి స్పష్టమైన టెక్స్ట్ ఏదీ లభించలేదు.",

    // Image Reasons (TE)
    reasonsFake: [
      "ఫోటో ఒరిజినల్ కెమెరా డేటా (EXIF metadata) లేదు లేదా తీసివేయబడింది.",
      "టెక్స్ట్ ఉన్న ప్రాంతంలో పిక్సెల్స్ మార్చిన గుర్తులు (Pixel splicing) కనిపిస్తున్నాయి.",
      "వెలుగు మరియు అంచుల ఆకృతి (Lighting & Edges) సహజంగా లేవు.",
      "మోసపూరిత పదాలు లేదా అనుమానాస్పద వివరాలు గుర్తించబడ్డాయి."
    ],
    reasonsReal: [
      "ఫోటో పిక్సెల్ అమరిక మరియు కంప్రెషన్ సహజంగా ఉన్నాయి.",
      "స్క్రీన్‌షాట్ లేదా కెమెరా డేటా క్రమపద్ధతిలో ఉన్నాయి.",
      "అంచులు మరియు రంగులు మార్చబడలేదు.",
      "ఎటువంటి మోసపూరిత QR కోడ్‌లు లేదా అనుమానాస్పద లింక్‌లు లేవు."
    ],
    reasonsInconclusive: [
      "స్క్రీన్‌షాట్ గుర్తించబడింది — ఇందులోని అసలు ఫోటోను పరిశీలించలేము.",
      "మెటాడేటా లభించలేదు (సోషల్ మీడియా ఫోటోలలో ఇది సహజం).",
      "ఖచ్చితమైన ఆధారాలు లేనందున నిర్ణయం ఖచ్చితంగా చెప్పలేము."
    ],

    // Image What To Do (TE)
    whatToDoFake: [
      "ఈ ఫోటోను పంపిన వ్యక్తిని లేదా సంస్థను నేరుగా సంప్రదించి నిజమో కాదో నిర్ధారించుకోండి.",
      "గూగుల్ లెన్స్ (Google Lens) లేదా TinEye ద్వారా రివర్స్ ఇమేజ్ సెర్చ్ చేసి అసలు మూలాన్ని కనుగొనండి.",
      "ఇది నకిలీ ఫోటో అయ్యే అవకాశం ఉన్నందున దీనిని ఎవరికీ షేర్ చేయకండి లేదా నమ్మకండి.",
      "అధికారిక వార్తలు లేదా ఫ్యాక్ట్-చెక్ (Fact-check) వెబ్‌సైట్లలో తనిఖీ చేయండి."
    ],
    whatToDoReal: [
      "రసీదులు లేదా పేమెంట్ సమాచారం ఆధారంగా డబ్బులు పంపే ముందు పంపిన వారిని నిర్ధారించుకోండి.",
      "ఏదైనా బిల్లు లేదా ఖాతా వివరాలు అడిగితే అధికారిక ఛానెల్ ద్వారా మాత్రమే సరిచూసుకోండి.",
      "మీ ఒరిజినల్ రసీదులను భద్రంగా దాచుకోండి."
    ],
    whatToDoInconclusive: [
      "గూగుల్ లెన్స్ (Google Lens) లేదా TinEye ద్వారా రివర్స్ ఇమేజ్ సెర్చ్ చేసి ఒరిజినల్ ఆధారాన్ని కనుగొనండి.",
      "ఈ ఫోటోను మొదట పోస్ట్ చేసిన అకౌంట్ మరియు తేదీ వివరాలను సరిచూసుకోండి.",
      "అధికారిక ఫ్యాక్ట్-చెక్ వెబ్‌సైట్లలో తనిఖీ చేయండి.",
      "ఖచ్చితమైన ఆధారాలు లేనందున దీని ఆధారంగా ఆర్థిక నిర్ణయాలు తీసుకోకండి."
    ],
    whatToDoPhoto: [
      "గూగుల్ లెన్స్ (Google Lens) లేదా TinEye ద్వారా రివర్స్ ఇమేజ్ సెర్చ్ చేసి అసలు ఫోటో ఎక్కడ నుండి వచ్చిందో కనుగొనండి.",
      "ఈ ఫోటోను మొదట పోస్ట్ చేసిన అకౌంట్, యూజర్‌నేమ్ మరియు తేదీ వివరాలను పరిశీలించండి.",
      "నమ్మకమైన వార్తా సంస్థలు లేదా అధికారిక ఫ్యాక్ట్-చెక్ వెబ్‌సైట్లలో ఈ ఫోటో గురించి శోధించండి.",
      "ఒరిజినల్ ఆధారం లభించనంత వరకు ఈ ఫోటోను సోషల్ మీడియాలో షేర్ చేయకండి."
    ],
    whatToDoDocument: [
      "ఈ రసీదు లేదా బిల్లు పంపిన సంస్థ/బ్యాంక్‌ను నేరుగా సంప్రదించి పేమెంట్ చేసే ముందు ధృవీకరించుకోండి.",
      "ఫోటోలో ఉన్న ఫోన్ నంబర్లకు బదులుగా అధికారిక వెబ్‌సైట్‌లోని నంబర్లను మాత్రమే ఉపయోగించండి.",
      "బహుమతులు లేదా లాటరీ క్లెయిమ్‌ల పేరుతో అడిగే ప్రాసెసింగ్ ఫీజులు లేదా అడ్వాన్స్ డబ్బులు చెల్లించవద్దు.",
      "మీ ఒరిజినల్ పేమెంట్ రసీదులను భద్రంగా దాచుకోండి."
    ],

    // Voice Deepfake Panel Keys (TE)
    voiceHeaderTitle: "AI వాయిస్ క్లోనింగ్ & డీప్‌ఫేక్ తనిఖీ (Voice Deepfake)",
    voiceHeaderDesc: "ఫోన్ కాల్స్ లేదా ఆడియో రికార్డింగ్‌లలో ఏఐ వాయిస్ క్లోనింగ్ (AI voice cloning) ఉందో లేదో తనిఖీ చేయండి.",
    voiceDisclaimer: "ఆడియో లక్షణాల విశ్లేషణ. ముఖ్యమైన నిర్ణయాల కోసం, తెలిసిన ఫోన్ నంబర్‌కు తిరిగి కాల్ చేసి సరిచూసుకోండి.",
    modelPerformanceLabel: "మోడల్ పనితీరు:",
    uploadAudioBtn: "📁 ఆడియో అప్‌లోడ్ చేయండి (Upload Audio)",
    recordLiveBtn: "🎙️ నేరుగా మాట్లాడండి (Record Speech)",
    stopMicBtn: "మైక్ ఆపండి",
    demoPresetsHeader: "డెమో నమూనాలు (Simulated samples):",
    simulatedBadge: "ఉదాహరణ నమూనా (Simulated)",
    verdictLikelyHuman: "నిజమైన మనుషుల గొంతు కావచ్చు (Likely Human)",
    verdictPossiblySynthetic: "నకిలీ/AI గొంతు కావచ్చు (Possibly Synthetic)",
    verdictLikelyAiGenerated: "AI ద్వారా సృష్టించిన గొంతు కావచ్చు (Likely AI-Generated)",
    verdictVoiceInconclusive: "ఖచ్చితంగా చెప్పలేము (Inconclusive)",
    verdictServerOffline: "డిటెక్షన్ సర్వర్ ఆఫ్‌లైన్‌లో ఉంది (Detection server offline)",
    voiceShortClipError: "ఆడియో క్లిప్ వ్యవధి 3 సెకన్ల కంటే తక్కువగా ఉంది (3 సెకన్ల కంటే తక్కువ). విశ్లేషణ కోసం కనీసం 3 సెకన్ల ఆడియో అవసరం.",
    voiceLargeFileError: "ఫైల్ సైజు చాలా పెద్దదిగా ఉంది. దయచేసి 15MB కంటే తక్కువ ఉన్న ఆడియో ఫైల్‌ను అప్‌లోడ్ చేయండి.",
    voiceInvalidFormatError: "చెల్లని ఫైల్ ఫార్మాట్. దయచేసి WAV, MP3, M4A లేదా WEBM ఆడియో ఫైల్‌ను అప్‌లోడ్ చేయండి.",
    voiceServerOfflineDesc: "డిటెక్షన్ సర్వర్ ప్రస్తుతం ఆఫ్‌లైన్‌లో ఉంది. దయచేసి http://localhost:8000 వద్ద బ్యాకెండ్ సర్వీస్‌ను ప్రారంభించండి.",
    voiceShortOrNoisyNotice: "ఆడియో వ్యవధి 3 సెకన్ల కంటే తక్కువగా ఉంది లేదా శబ్దం ఎక్కువగా ఉంది. అందువల్ల నిర్ణయం ఖచ్చితంగా చెప్పలేము.",
    voiceSafetyHeader: "సూచించిన భద్రతా చర్యలు (Recommended Safety Steps)",
    voiceSafetySteps: [
      "ఫోన్ కట్ చేసి, ఆ వ్యక్తి సేవ్ చేసుకున్న అసలైన ఫోన్ నంబర్‌కు మాత్రమే తిరిగి కాల్ చేయండి.",
      "ఆ వ్యక్తికి మరియు మీకు మాత్రమే తెలిసిన ఒక రహస్య ప్రశ్న అడగండి.",
      "కేవలం ఫోన్ కాల్ సంభాషణ ఆధారంగా ఎవరికీ డబ్బులు, ఓటీపీలు (OTP) లేదా పేమెంట్లు పంపవద్దు.",
      "వాయిస్ క్లోనింగ్ మోసాలను జాతీయ హెల్ప్‌లైన్ 1930 లేదా cybercrime.gov.in లో నివేదించండి."
    ],
    audioAnalysisMatrix: "Web Audio API ఆడియో విశ్లేషణ మ్యాట్రిక్స్ (Audio Analysis Matrix)"
  }
};
