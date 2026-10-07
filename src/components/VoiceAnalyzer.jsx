import { useState, useEffect, useRef } from 'react';
import { translations } from '../i18n';

export default function VoiceAnalyzer({ lang = 'en' }) {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [waveHeights, setWaveHeights] = useState(Array(24).fill(8));
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState(null);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    const saved = localStorage.getItem('voice_benchmark_latest');
    if (saved) {
      try {
        setBenchmarkData(JSON.parse(saved));
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const playbackAudioRef = useRef(null);
  const recordingStartTimeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Clean up Web Audio nodes on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (playbackAudioRef.current) playbackAudioRef.current.pause();
    };
  }, []);

  // Visualizer bar heights animation logic for scanning or playback
  useEffect(() => {
    let interval;
    if ((scanning || isPlaying) && !isRecording && !audioUrl) {
      interval = setInterval(() => {
        setWaveHeights(
          Array(24)
            .fill(0)
            .map((_, index) => {
              return 6 + ((index * 7 + (Date.now() / 100)) % 28);
            })
        );
      }, 120);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scanning, isPlaying, isRecording, audioUrl]);

  const addLog = (text, delay) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, `[SPECTRO] ${text}`]);
        resolve();
      }, delay);
    });
  };

  const startRecording = async (startTime) => {
    try {
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause();
        setIsPlaying(false);
      }

      recordingStartTimeRef.current = startTime;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: false,
          echoCancellation: false,
          autoGainControl: false
        }
      });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const chunks = [];
      const mediaRecorder = new MediaRecorder(stream);
      recorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const recordingName = `microphone_capture_${Math.floor(Date.now() / 1000) % 10000}.wav`;
        setFile(recordingName);

        const duration = recordingStartTimeRef.current ? (Date.now() - recordingStartTimeRef.current) / 1000 : 0;
        await runVoiceForensics(blob, duration);
      };

      setIsRecording(true);
      setResult(null);
      setLogs([]);

      mediaRecorder.start();

      const draw = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        const heights = Array(24).fill(0).map((_, idx) => {
          const val = dataArray[idx % dataArray.length] || 0;
          return Math.floor((val / 255) * 44) + 6;
        });
        setWaveHeights(heights);
        animationRef.current = requestAnimationFrame(draw);
      };
      animationRef.current = requestAnimationFrame(draw);

      await addLog("Recording speech... Capturing acoustic waveform metrics.", 100);

    } catch {
      await addLog("Microphone access denied or busy. Please check browser permissions.", 100);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRecording(false);
    setWaveHeights(Array(24).fill(8));
  };

  const analyzeAudioBuffer = (audioBuffer, externalDuration = 0) => {
    const channelData = audioBuffer.getChannelData(0);
    const duration = externalDuration || audioBuffer.duration;

    const frameSize = 1024;
    const numFrames = Math.floor(channelData.length / frameSize);
    const frameEnergies = [];
    let totalEnergy = 0;
    let stepDiffs = 0;

    for (let f = 0; f < numFrames; f++) {
      let sumSq = 0;
      const offset = f * frameSize;
      for (let i = 0; i < frameSize; i++) {
        const sample = channelData[offset + i];
        sumSq += sample * sample;
        if (i > 0) {
          stepDiffs += Math.abs(sample - channelData[offset + i - 1]);
        }
      }
      const rms = Math.sqrt(sumSq / frameSize);
      frameEnergies.push(rms);
      totalEnergy += rms;
    }

    const avgEnergy = frameEnergies.length > 0 ? totalEnergy / frameEnergies.length : 0.01;
    const noiseFloor = frameEnergies.length > 0 ? Math.min(...frameEnergies) : 0.001;
    const isVeryNoisy = noiseFloor > 0.08 || (noiseFloor / (avgEnergy || 1)) > 0.45;
    const isTrulyDigitalSilence = noiseFloor < 0.0001;
    const speechThreshold = Math.max(0.003, noiseFloor * 3);

    let firstSpeechIndex = frameEnergies.findIndex(e => e > speechThreshold);
    let lastSpeechIndex = -1;
    for (let i = frameEnergies.length - 1; i >= 0; i--) {
      if (frameEnergies[i] > speechThreshold) {
        lastSpeechIndex = i;
        break;
      }
    }

    let pauseRatio = 0.18;
    if (firstSpeechIndex !== -1 && lastSpeechIndex > firstSpeechIndex) {
      const activeSpeechFrames = frameEnergies.slice(firstSpeechIndex, lastSpeechIndex + 1);
      const internalSilentFrames = activeSpeechFrames.filter(e => e <= speechThreshold).length;
      pauseRatio = internalSilentFrames / activeSpeechFrames.length;
    }

    const voicedEnergies = frameEnergies.filter(e => e > speechThreshold);
    let energyStdDev = 0.035;
    if (voicedEnergies.length > 5) {
      const avgV = voicedEnergies.reduce((a, b) => a + b, 0) / voicedEnergies.length;
      const varV = voicedEnergies.reduce((a, b) => a + Math.pow(b - avgV, 2), 0) / voicedEnergies.length;
      energyStdDev = Math.sqrt(varV);
    }

    const pitchValues = [];
    for (let f = 0; f < numFrames; f++) {
      if (frameEnergies[f] > speechThreshold) {
        let zeroCrossings = 0;
        const offset = f * frameSize;
        for (let i = 1; i < frameSize; i++) {
          if ((channelData[offset + i] >= 0 && channelData[offset + i - 1] < 0) ||
            (channelData[offset + i] < 0 && channelData[offset + i - 1] >= 0)) {
            zeroCrossings++;
          }
        }
        const framePitch = (zeroCrossings * audioBuffer.sampleRate) / (2 * frameSize);
        if (framePitch >= 75 && framePitch <= 380) {
          pitchValues.push(framePitch);
        }
      }
    }

    let pitchMean = 160;
    let pitchStdDev = 22;
    if (pitchValues.length > 3) {
      const sumP = pitchValues.reduce((a, b) => a + b, 0);
      pitchMean = sumP / pitchValues.length;
      const variance = pitchValues.reduce((a, b) => a + Math.pow(b - pitchMean, 2), 0) / pitchValues.length;
      pitchStdDev = Math.sqrt(variance);
    }

    const spectralSmoothness = totalEnergy > 0 ? Math.min(10, Math.max(1, (stepDiffs / channelData.length) * 100)) : 3.5;

    return {
      duration,
      pitchMean: Math.round(pitchMean),
      pitchStdDev: Math.round(pitchStdDev * 10) / 10,
      pauseRatio: Math.round(pauseRatio * 100),
      isVeryNoisy,
      isTrulyDigitalSilence,
      energyStdDev: Math.round(energyStdDev * 1000) / 1000,
      spectralSmoothness: Math.round(spectralSmoothness * 10) / 10
    };
  };

  const runVoiceForensics = async (blobOrFile, duration = 0) => {
    setScanning(true);
    setResult(null);
    setLogs([]);

    await addLog("Decompressing audio stream & converting to 16 kHz mono...", 100);

    // 1. Client-side File Size Validation (Max 15MB)
    if (blobOrFile.size && blobOrFile.size > 15 * 1024 * 1024) {
      await addLog("ERROR: File size exceeds 15MB limit.", 100);
      setResult({
        safe: false,
        verdictLabel: t.verdictVoiceInconclusive,
        confidencePct: 0,
        score: null,
        verdict: t.voiceLargeFileError,
        isSimulated: false,
        isShortOrNoisy: true,
        engines: [],
        anomalies: [t.voiceLargeFileError]
      });
      setScanning(false);
      return;
    }

    // 2. Client-side Format Validation
    const fileName = blobOrFile.name || "audio.wav";
    const ext = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    const validExts = ['wav', 'mp3', 'm4a', 'webm', 'ogg', 'flac', 'aac'];
    if (ext && !validExts.includes(ext) && blobOrFile.type && !blobOrFile.type.includes('audio')) {
      await addLog(`ERROR: Invalid file format '.${ext}'.`, 100);
      setResult({
        safe: false,
        verdictLabel: t.verdictVoiceInconclusive,
        confidencePct: 0,
        score: null,
        verdict: t.voiceInvalidFormatError,
        isSimulated: false,
        isShortOrNoisy: true,
        engines: [],
        anomalies: [t.voiceInvalidFormatError]
      });
      setScanning(false);
      return;
    }

    // 3. Web Audio API Browser Feature Extraction (Matrix Detail Only)
    let metrics = null;
    let engines = [];
    try {
      const audioCtx = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await blobOrFile.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      metrics = analyzeAudioBuffer(audioBuffer, duration);

      const isPitchWarn = metrics.pitchStdDev < 12 || metrics.pitchStdDev > 45;
      const isPauseWarn = metrics.pauseRatio < 10 || metrics.pauseRatio > 30;
      const isNoiseWarn = metrics.isVeryNoisy || metrics.isTrulyDigitalSilence;
      const isLoudnessWarn = metrics.energyStdDev < 0.015;
      const isSpectralWarn = metrics.spectralSmoothness > 6.5;

      engines = [
        {
          name: "Pitch Deviation (F0 SD)",
          status: isPitchWarn ? "WARN" : "PASS",
          details: `Pitch deviation F0 SD is ${metrics.pitchStdDev} Hz (${metrics.pitchStdDev >= 12 ? 'strong organic human pitch dynamics' : 'monotone / robotic pitch under 12 Hz'}).`
        },
        {
          name: "Pause Rhythms & Silence Gaps",
          status: isPauseWarn ? "WARN" : "PASS",
          details: `Internal pause ratio is ${metrics.pauseRatio}% (${isPauseWarn ? 'unnatural pause spacing outside 10-30% range' : 'within 10-30% organic range'}).`
        },
        {
          name: "Noise Floor Baseline",
          status: isNoiseWarn ? "WARN" : "PASS",
          details: metrics.isVeryNoisy
            ? "High ambient noise floor reduces vocal isolation accuracy."
            : metrics.isTrulyDigitalSilence
              ? "Truly digital zero silence floor (-80 dB) without acoustic room noise."
              : "Natural acoustic room noise floor present."
        },
        {
          name: "Loudness Envelope Dynamics",
          status: isLoudnessWarn ? "WARN" : "PASS",
          details: `Loudness variation energy SD is ${metrics.energyStdDev} (${isLoudnessWarn ? 'unnaturally steady volume typical of TTS' : 'natural human speech loudness dynamics'}).`
        },
        {
          name: "Spectral Frequency Variance",
          status: isSpectralWarn ? "WARN" : "PASS",
          details: `Spectral distribution index is ${metrics.spectralSmoothness} (${isSpectralWarn ? 'excessive vocoder step variance' : 'natural vocal spectral decay'}).`
        }
      ];
    } catch {
      // Browser Web Audio decode failure
    }

    await addLog("Sending 16 kHz audio clip to backend audio deepfake model...", 150);

    // 4. Request FastAPI Backend Inference
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    try {
      const formData = new FormData();
      formData.append("file", blobOrFile, fileName);

      const response = await fetch(`${backendUrl}/analyze-voice`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ detail: response.statusText }));
        const detailStr = errJson.detail || "";

        if (detailStr.includes("under 3 seconds") || detailStr.includes("short")) {
          await addLog("Backend returned error: Audio clip under 3 seconds.", 100);
          setResult({
            safe: false,
            verdictLabel: t.verdictVoiceInconclusive,
            confidencePct: 40,
            score: null,
            verdict: t.voiceShortClipError,
            isSimulated: false,
            isShortOrNoisy: true,
            engines,
            anomalies: [t.voiceShortClipError]
          });
        } else if (detailStr.includes("format")) {
          setResult({
            safe: false,
            verdictLabel: t.verdictVoiceInconclusive,
            confidencePct: 0,
            score: null,
            verdict: t.voiceInvalidFormatError,
            isSimulated: false,
            isShortOrNoisy: true,
            engines,
            anomalies: [t.voiceInvalidFormatError]
          });
        } else {
          setResult({
            safe: false,
            verdictLabel: t.verdictVoiceInconclusive,
            confidencePct: 0,
            score: null,
            verdict: detailStr || "Analysis failed.",
            isSimulated: false,
            isShortOrNoisy: true,
            engines,
            anomalies: [detailStr]
          });
        }
        setScanning(false);
        return;
      }

      const data = await response.json();
      await addLog(`Backend model analysis complete. Synthetic score: ${(data.score * 100).toFixed(1)}%.`, 150);

      const syntheticScorePct = Math.round(data.score * 100);
      let verdictLabel = t.verdictLikelyHuman;
      let confidencePct = 80;
      let safe = true;
      let verdictDescription = "";

      // Strictly enforce verdict bands per requirement 3:
      // under 30%: Likely Human
      // 30-70%: Inconclusive
      // over 70%: Likely AI-Generated
      if (data.score < 0.30) {
        verdictLabel = t.verdictLikelyHuman;
        confidencePct = Math.round((1 - data.score) * 100);
        safe = true;
        verdictDescription = "LIKELY HUMAN VOICE: Trained audio deepfake model classified recording as authentic human speech with organic acoustic harmonics.";
      } else if (data.score <= 0.70) {
        verdictLabel = t.verdictVoiceInconclusive;
        confidencePct = Math.round((1 - Math.abs(data.score - 0.5) * 2) * 100);
        safe = false;
        verdictDescription = "INCONCLUSIVE: Trained model score lies within the 30-70% border region. Additional audio sample required.";
      } else {
        verdictLabel = t.verdictLikelyAiGenerated;
        confidencePct = Math.round(data.score * 100);
        safe = false;
        verdictDescription = "LIKELY AI-GENERATED: Trained audio deepfake model detected synthetic voice clone patterns and neural vocoder artifacts.";
      }

      setResult({
        safe,
        verdictLabel,
        confidencePct,
        score: syntheticScorePct,
        verdict: verdictDescription,
        isSimulated: false,
        isShortOrNoisy: false,
        isOffline: false,
        engines,
        anomalies: [
          `Trained Model Synthetic Score: ${syntheticScorePct}%`,
          `Model Classification Label: ${data.label.toUpperCase()}`,
          `Audio Duration Analyzed: ${data.duration} seconds`,
          `Web Audio API Matrix Checks: ${engines.filter(e => e.status === 'PASS').length}/5 PASSED`
        ]
      });

    } catch (netErr) {
      // Backend offline handling per requirement 3
      await addLog("ERROR: Could not connect to detection backend at http://localhost:8000.", 100);
      setResult({
        safe: false,
        verdictLabel: t.verdictServerOffline || "Offline",
        confidencePct: null,
        score: null,
        verdict: t.voiceServerOfflineDesc,
        isSimulated: false,
        isShortOrNoisy: false,
        isOffline: true,
        engines,
        anomalies: [
          "Detection server offline (http://localhost:8000)",
          "Please start backend: uvicorn backend.main:app --reload --port 8000"
        ]
      });
    }

    setScanning(false);
  };

  const runSimulatedPreset = (presetType) => {
    setScanning(true);
    setResult(null);
    setLogs([]);

    let verdictLabel = t.verdictLikelyHuman;
    let confidencePct = 80;
    let score = 15;
    let safe = true;

    if (presetType === 'synthetic') {
      score = 85;
      verdictLabel = t.verdictLikelyAiGenerated;
      confidencePct = 85;
      safe = false;
    } else if (presetType === 'noisy') {
      score = 45;
      verdictLabel = t.verdictVoiceInconclusive;
      confidencePct = 55;
      safe = false;
    } else {
      score = 12;
      verdictLabel = t.verdictLikelyHuman;
      confidencePct = 88;
      safe = true;
    }

    const sampleText = presetType === 'synthetic'
      ? "Sample: Synthetic voice clone (simulated example)"
      : presetType === 'noisy'
        ? "Sample: Noisy voicemail clip (simulated example)"
        : "Sample: Natural human speaker (simulated example)";

    const engines = [
      {
        name: "Pitch Deviation (F0 SD)",
        status: presetType === 'synthetic' ? "WARN" : "PASS",
        details: presetType === 'synthetic' ? "Pitch deviation F0 SD is 5.2 Hz (monotone / robotic pitch under 12 Hz)." : "Pitch deviation F0 SD is 24.5 Hz (within 12-45 Hz organic range)."
      },
      {
        name: "Pause Rhythms & Silence Gaps",
        status: presetType === 'synthetic' ? "WARN" : presetType === 'noisy' ? "WARN" : "PASS",
        details: presetType === 'synthetic' ? "Pause ratio is 5% (outside 10-30% organic range)." : presetType === 'noisy' ? "Pause ratio is 52% (outside 10-30% organic range)." : "Pause ratio is 18% (within 10-30% organic range)."
      },
      {
        name: "Noise Floor Baseline",
        status: presetType === 'noisy' ? "WARN" : "PASS",
        details: presetType === 'noisy' ? "High ambient noise floor reduces vocal isolation accuracy." : "Noise floor is clean without digital gating artifacts."
      },
      {
        name: "Loudness Envelope Dynamics",
        status: presetType === 'synthetic' ? "WARN" : "PASS",
        details: presetType === 'synthetic' ? "Loudness variation energy SD is 0.008 (steady TTS volume)." : "Loudness variation energy SD is 0.042 (natural vocal dynamics)."
      }
    ];

    setResult({
      safe,
      verdictLabel,
      confidencePct,
      score,
      verdict: presetType === 'noisy' ? t.voiceShortOrNoisyNotice : presetType === 'synthetic' ? "POSSIBLE SYNTHETIC VOICE: Simulated voice clone sample exhibiting pitch flatline and unnatural pause ratio." : "LIKELY HUMAN VOICE: Simulated natural speaker audio with organic pitch variance.",
      isSimulated: true,
      isShortOrNoisy: presetType === 'noisy',
      isOffline: false,
      engines,
      anomalies: [
        sampleText,
        `Trained Model Synthetic Score: ${score}%`,
        `Pause Ratio: ${presetType === 'noisy' ? '52% (WARN: outside 10-30%)' : presetType === 'synthetic' ? '5% (WARN: outside 10-30%)' : '18% (PASS)'}`,
        `Pitch Deviation (F0 SD): ${presetType === 'synthetic' ? '5.2 Hz (WARN: under 12 Hz)' : '24.5 Hz (PASS)'}`
      ]
    });

    setScanning(false);
  };

  const handleAudioFileUpload = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const audioFile = files[0];
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause();
        setIsPlaying(false);
      }
      setFile(audioFile.name);
      setAudioBlob(audioFile);
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      runVoiceForensics(audioFile, 0);
    }
  };

  const loadPreset = (type) => {
    const presets = {
      synthetic: { name: "simulated_voice_clone_sample.mp3", type: 'synthetic' },
      noisy: { name: "simulated_noisy_voicemail_short.wav", type: 'noisy' },
      clean: { name: "simulated_natural_speech_sample.m4a", type: 'clean' }
    };

    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      setIsPlaying(false);
    }
    setAudioUrl(null);
    setAudioBlob(null);

    const sel = presets[type];
    setFile(sel.name);
    setIsPlaying(false);
    setWaveHeights(Array(24).fill(8));
    runSimulatedPreset(sel.type);
  };

  const togglePlayback = () => {
    if (audioUrl) {
      if (isPlaying) {
        if (playbackAudioRef.current) playbackAudioRef.current.pause();
        setIsPlaying(false);
        setWaveHeights(Array(24).fill(8));
      } else {
        const audio = new Audio(audioUrl);
        playbackAudioRef.current = audio;
        audio.onended = () => {
          setIsPlaying(false);
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
          setWaveHeights(Array(24).fill(8));
        };

        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const sourceNode = audioCtx.createMediaElementSource(audio);
          const analyserNode = audioCtx.createAnalyser();
          analyserNode.fftSize = 64;
          sourceNode.connect(analyserNode);
          analyserNode.connect(audioCtx.destination);

          const draw = () => {
            const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
            analyserNode.getByteFrequencyData(dataArray);
            const heights = Array(24).fill(0).map((_, idx) => {
              const val = dataArray[idx % dataArray.length] || 0;
              return Math.floor((val / 255) * 44) + 6;
            });
            setWaveHeights(heights);
            animationRef.current = requestAnimationFrame(draw);
          };
          animationRef.current = requestAnimationFrame(draw);
        } catch {
          // quiet fallback
        }

        audio.play();
        setIsPlaying(true);
      }
    } else {
      if (!file) return;
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-cyan)' }}>//</span> {t.voiceHeaderTitle}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          {t.voiceHeaderDesc}
        </p>
      </div>

      {/* Muted Professional Disclaimer */}
      <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>💡</span>
          <span>{t.voiceDisclaimer}</span>
        </div>
        {benchmarkData && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', borderTop: '1px dashed rgba(255, 255, 255, 0.06)', paddingTop: '4px' }}>
            📊 {t.modelPerformanceLabel || "Model performance:"} Tested on {benchmarkData.clipCount} clips: <strong style={{ color: 'var(--accent-cyan)' }}>{benchmarkData.accuracyPct}% accuracy</strong>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

        {/* Left column: Visualizer & controls */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '24px 16px' }}>

          {/* Animated Waveform */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            height: '64px',
            width: '100%',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            padding: '0 20px',
            position: 'relative'
          }}>
            {waveHeights.map((h, i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: `${h}px`,
                  backgroundColor: isRecording
                    ? 'var(--status-danger)'
                    : isPlaying
                      ? 'var(--accent-cyan)'
                      : scanning
                        ? 'var(--status-danger)'
                        : '#475569',
                  borderRadius: '2px',
                  transition: 'height 0.08s ease'
                }}
              ></div>
            ))}
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Hidden File Input for Audio Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*,.mp3,.wav,.m4a,.webm"
              style={{ display: 'none' }}
              onChange={handleAudioFileUpload}
            />

            {/* Audio Upload Control (Full Width) */}
            <div style={{ display: 'flex', width: '100%' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="btn btn-secondary"
                style={{ flex: 1, width: '100%', fontSize: '0.78rem', padding: '10px 8px' }}
                disabled={scanning}
              >
                {t.uploadAudioBtn}
              </button>
            </div>

            {/* Playback Controls */}
            {file && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                marginTop: '4px'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                  {file}
                </span>

                <button
                  type="button"
                  onClick={togglePlayback}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  disabled={scanning}
                >
                  {isPlaying ? 'Pause' : '▶️ Play'}
                </button>
              </div>
            )}

            {/* Demo samples (simulated) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{t.demoPresetsHeader}</div>
              <button
                className="btn btn-secondary"
                onClick={() => loadPreset('synthetic')}
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem', padding: '6px 10px' }}
                disabled={scanning}
              >
                ⚠️ Simulated Synthetic Voice
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => loadPreset('noisy')}
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem', padding: '6px 10px', color: 'var(--status-warning)' }}
                disabled={scanning}
              >
                ⚠️ Simulated Noisy Voicemail
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => loadPreset('clean')}
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem', padding: '6px 10px' }}
                disabled={scanning}
              >
                ✅ Simulated Natural Voice
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Spectrogram log & findings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {logs.length > 0 && (
            <div style={{
              background: '#040711',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#a855f7',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
              {scanning && <div style={{ color: 'var(--accent-cyan)', animation: 'pulse 0.8s infinite' }}>█ Analyzing audio spectrum...</div>}
            </div>
          )}

          {!file && (
            <div style={{
              border: '1px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: 'rgba(255,255,255,0.01)'
            }}>
              Upload an audio file to analyze voice signatures.
            </div>
          )}

          {result && !scanning && (
            <div className={`glass-card ${result.isOffline ? 'warning-glow' : result.safe ? 'safe-glow' : result.verdictLabel === t.verdictVoiceInconclusive ? 'warning-glow' : 'danger-glow'}`} style={{
              borderLeft: '4px solid',
              borderColor: result.isOffline ? 'var(--status-warning)' : result.safe ? 'var(--status-safe)' : result.verdictLabel === t.verdictVoiceInconclusive ? 'var(--status-warning)' : 'var(--status-danger)',
              padding: '20px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              {/* Disclaimer near Verdict */}
              <div style={{ padding: '8px 12px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '6px', fontSize: '0.78rem', color: '#e2e8f0', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>💡</span>
                <span>{t.voiceDisclaimer}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className={`badge ${result.isOffline ? 'badge-warning' : result.safe ? 'badge-safe' : result.verdictLabel === t.verdictVoiceInconclusive ? 'badge-warning' : 'badge-danger'}`}>
                    {result.verdictLabel}
                  </span>

                  {/* Simulated Example Badge */}
                  {result.isSimulated && (
                    <span className="badge badge-cyan" style={{ border: '1px solid var(--accent-cyan)' }}>
                      {t.simulatedBadge}
                    </span>
                  )}

                  {result.confidencePct !== null && result.confidencePct !== undefined && (
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      {t.confidenceLabel} <strong style={{ color: '#fff' }}>{result.confidencePct}%</strong>
                    </span>
                  )}
                </div>

                {result.score !== null && result.score !== undefined ? (
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: result.safe ? 'var(--status-safe)' : 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>
                    {result.score}% RISK
                  </span>
                ) : (
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--status-warning)', fontFamily: 'var(--font-mono)' }}>
                    OFFLINE
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '16px' }}>
                {result.verdict}
              </p>

              {/* Key Reasons / Anomalies List */}
              {result.anomalies && result.anomalies.length > 0 && (
                <div style={{ marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '6px' }}>{t.keyReasonsHeader}</div>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {result.anomalies.map((item, idx) => (
                      <li key={idx} style={{ listStyleType: 'square' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 5-Layer Audio Analysis Matrix Grid Display */}
              {result.engines && result.engines.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t.audioAnalysisMatrix || "Web Audio API Audio Analysis Matrix"}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {result.engines.map((eng, idx) => {
                      let badgeColor = 'var(--status-safe)';
                      let badgeBg = 'rgba(16, 185, 129, 0.15)';
                      if (eng.status === 'WARN') {
                        badgeColor = 'var(--status-warning)';
                        badgeBg = 'rgba(245, 158, 11, 0.15)';
                      } else if (eng.status === 'FAIL') {
                        badgeColor = 'var(--status-danger)';
                        badgeBg = 'rgba(244, 63, 94, 0.15)';
                      } else if (eng.status === 'INFO' || eng.status === 'NOT MEASURED') {
                        badgeColor = '#94a3b8';
                        badgeBg = 'rgba(148, 163, 184, 0.15)';
                      }

                      return (
                        <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>{eng.name}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', color: badgeColor, backgroundColor: badgeBg }}>
                              {eng.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.3 }}>{eng.details}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommended Safety Steps Section */}
              <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: result.isOffline ? 'var(--status-warning)' : result.safe ? 'var(--status-safe)' : result.verdictLabel === t.verdictVoiceInconclusive ? 'var(--status-warning)' : 'var(--status-danger)',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🛡️ {t.voiceSafetyHeader}
                </div>
                <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#e2e8f0' }}>
                  {t.voiceSafetySteps.filter(step => step && step.trim().length > 0).map((step, idx) => (
                    <li key={idx} style={{ lineHeight: 1.45 }}>{step}</li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
