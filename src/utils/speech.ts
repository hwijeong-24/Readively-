import { ReadingFeedback } from '../types';

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onBoundary?: (charIndex: number) => void;
  }
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = options?.rate ?? 0.85; // Crystal clear for Grade 5-6 elementary learners
  utterance.pitch = options?.pitch ?? 1.05;

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Daniel'))
  ) || voices.find(v => v.lang.startsWith('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onBoundary) {
    utterance.onboundary = (e) => {
      options.onBoundary?.(e.charIndex);
    };
  }

  utterance.onerror = () => {
    options?.onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export interface AudioRecordingResult {
  blob: Blob | null;
  blobUrl: string | null;
  maxVolume: number;
  durationMs: number;
  hasSound: boolean;
}

export interface AudioRecorderController {
  stop: () => Promise<AudioRecordingResult>;
  getCurrentVolume: () => number;
}

/**
 * Starts audio recording with real-time volume detection (AnalyserNode)
 */
export async function startAudioWithVolumeDetection(): Promise<AudioRecorderController> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('media_devices_unsupported');
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let volumeCheckInterval: number | null = null;

  const startTime = Date.now();
  let maxVolume = 0;
  let currentVolume = 0;
  let voiceSamplesCount = 0;

  try {
    audioCtx = new AudioCtx();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    volumeCheckInterval = window.setInterval(() => {
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength / 255; // 0.0 to 1.0
      currentVolume = avg;
      if (avg > maxVolume) {
        maxVolume = avg;
      }
      if (avg >= 0.042) {
        voiceSamplesCount++;
      }
    }, 50);
  } catch (e) {
    console.warn('AudioContext volume analysis initialization failed:', e);
  }

  let mediaRecorder: MediaRecorder | null = null;
  const audioChunks: Blob[] = [];

  try {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    mediaRecorder.start(100);
  } catch (e) {
    console.warn('MediaRecorder error:', e);
  }

  return {
    getCurrentVolume: () => currentVolume,
    stop: () =>
      new Promise<AudioRecordingResult>((resolve) => {
        if (volumeCheckInterval !== null) {
          clearInterval(volumeCheckInterval);
        }

        const durationMs = Date.now() - startTime;

        const cleanupStream = () => {
          stream.getTracks().forEach((track) => track.stop());
          if (source) {
            try { source.disconnect(); } catch {}
          }
          if (audioCtx && audioCtx.state !== 'closed') {
            try { audioCtx.close(); } catch {}
          }
        };

        const finish = () => {
          cleanupStream();
          let blob: Blob | null = null;
          let blobUrl: string | null = null;
          if (audioChunks.length > 0) {
            blob = new Blob(audioChunks, { type: 'audio/webm' });
            blobUrl = URL.createObjectURL(blob);
          }
          // Voice must have sustained energy and duration at least 750ms
          const hasSound = durationMs >= 750 && (maxVolume >= 0.048 || voiceSamplesCount >= 3);
          resolve({
            blob,
            blobUrl,
            maxVolume,
            durationMs,
            hasSound,
          });
        };

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.onstop = finish;
          try {
            mediaRecorder.stop();
          } catch {
            finish();
          }
        } else {
          finish();
        }
      }),
  };
}

export interface SpeechRecognitionController {
  stop: () => void;
}

export function startSpeechRecognition(callbacks: {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}): SpeechRecognitionController {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    callbacks.onError('not_supported');
    callbacks.onEnd();
    return { stop: () => {} };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let finalTranscript = '';
  let stoppedByUser = false;

  recognition.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += (finalTranscript ? ' ' : '') + transcript;
      } else {
        interim += transcript;
      }
    }
    callbacks.onInterim(interim || finalTranscript);
  };

  recognition.onerror = (event: any) => {
    if (!stoppedByUser) {
      callbacks.onError(event.error || 'recognition_failed');
    }
  };

  recognition.onend = () => {
    callbacks.onFinal(finalTranscript);
    callbacks.onEnd();
  };

  try {
    recognition.start();
  } catch (err) {
    callbacks.onError('start_failed');
    callbacks.onEnd();
  }

  return {
    stop: () => {
      stoppedByUser = true;
      try {
        recognition.stop();
      } catch {}
    },
  };
}

/**
 * Evaluates student transcript against the target sentence
 */
export async function evaluateReading(
  targetSentence: string,
  studentTranscript: string,
  keyWords: string[],
  audioBlobUrl?: string
): Promise<ReadingFeedback> {
  const targetTokens = new Set(targetSentence.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean));
  const validKeyWords = keyWords.filter(w => targetTokens.has(w.toLowerCase().trim()));

  try {
    const res = await fetch('/api/evaluate-reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetSentence,
        studentTranscript,
        keyWords: validKeyWords,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawWords: string[] = Array.isArray(data.practiceWords) ? data.practiceWords : validKeyWords;
      const sanitized = rawWords.filter(w => targetTokens.has(w.toLowerCase().trim()));
      const finalPracticeWords = sanitized.length > 0
        ? sanitized.slice(0, 2)
        : validKeyWords.length > 0
          ? validKeyWords.slice(0, 2)
          : Array.from(targetTokens).filter(w => !['a', 'an', 'the', 'is', 'in', 'on', 'at', 'to', 'he', 'she', 'it'].includes(w)).slice(0, 2);

      return {
        practiceWords: finalPracticeWords,
        feedbackMessage: data.feedbackMessage,
        koreanTip: data.koreanTip,
        rating: data.rating || 5,
        allWordsMatched: data.allWordsMatched ?? true,
        studentTranscript,
        audioBlobUrl,
        timestamp: Date.now(),
      };
    }
  } catch (err) {
    console.warn('Backend evaluation failed, using local heuristic:', err);
  }

  // Client-side heuristic comparison
  const cleanTarget = Array.from(targetTokens);
  const cleanSpoken = (studentTranscript || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  const matched = cleanTarget.filter(w => cleanSpoken.includes(w));
  const missed = cleanTarget.filter(w => !cleanSpoken.includes(w) && !['a', 'an', 'the', 'is', 'in', 'on', 'at', 'to', 'he', 'she', 'it'].includes(w));
  const practiceWords = (validKeyWords.length > 0 ? validKeyWords : missed.length > 0 ? missed : cleanTarget).filter(w => targetTokens.has(w.toLowerCase().trim())).slice(0, 2);
  const matchRatio = cleanTarget.length > 0 ? matched.length / cleanTarget.length : 1;
  const rating = matchRatio >= 0.7 ? 5 : matchRatio >= 0.4 ? 4 : 3;

  return {
    practiceWords,
    feedbackMessage: rating === 5
      ? `Super reading! Practice pronouncing "${practiceWords.join('" and "')}" clearly!`
      : `Good effort! Let's practice saying "${practiceWords.join('" and "')}" with the model voice!`,
    koreanTip: `"${practiceWords.join(', ')}" 단어의 올바른 발음을 듣고 따라 해보세요!`,
    rating,
    allWordsMatched: matchRatio >= 0.7,
    studentTranscript,
    audioBlobUrl,
    timestamp: Date.now(),
  };
}
