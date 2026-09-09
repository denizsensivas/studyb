import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerResult {
  timeLeft: number;
  isRunning: boolean;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => void;
  setCustomDuration: (minutes: number) => void;
  customDurations: { pomodoro: number, shortBreak: number, longBreak: number };
  setAllCustomDurations: (d: { pomodoro: number, shortBreak: number, longBreak: number }) => void;
  skip: () => void;
}

const DURATIONS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

function getInitialTimerState(): {
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  timeLeft: number;
  customDurations: { pomodoro: number; shortBreak: number; longBreak: number };
  consumedSeconds: number;
} {
  const fallback = {
    mode: 'pomodoro' as const,
    timeLeft: DURATIONS.pomodoro,
    customDurations: { ...DURATIONS },
    consumedSeconds: 0,
  };

  const saved = localStorage.getItem('studyb_timer');
  if (!saved) return fallback;

  try {
    const parsed = JSON.parse(saved);
    return parsed.timeLeft > 0
      ? {
          mode: parsed.mode,
          timeLeft: parsed.timeLeft,
          customDurations: parsed.customDurations,
          consumedSeconds: parsed.consumedSeconds || 0,
        }
      : fallback;
  } catch {
    return fallback;
  }
}

export function useTimer(onComplete?: (mode: string, durationMinutes: number, consumedMinutes: number) => void): UseTimerResult {
  const [initialState] = useState(getInitialTimerState);
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>(initialState.mode);
  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft);
  const [isRunning, setIsRunning] = useState(false);
  const [customDurations, setCustomDurations] = useState(initialState.customDurations);
  const [consumedSeconds, setConsumedSeconds] = useState(initialState.consumedSeconds);
  
  const timerRef = useRef<number | null>(null);
  const skipRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTickRef = useRef(0);
  const workerRef = useRef<Worker | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Setup Web Worker for unthrottled background tick
    const workerCode = `
      let intervalId = null;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          if (!intervalId) {
            intervalId = setInterval(() => self.postMessage('tick'), 500);
          }
        } else if (e.data === 'stop') {
          clearInterval(intervalId);
          intervalId = null;
        }
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Tick logic independent of state changes to avoid drift and background tab throttling issues
  useEffect(() => {
    if (isRunning && workerRef.current) {
      lastTickRef.current = Date.now();
      
      workerRef.current.onmessage = () => {
        const now = Date.now();
        const deltaSeconds = Math.floor((now - lastTickRef.current) / 1000);

        if (deltaSeconds > 0) {
          lastTickRef.current += deltaSeconds * 1000;
          setTimeLeft((prev) => {
            const next = prev - deltaSeconds;
            return next > 0 ? next : 0;
          });
          setConsumedSeconds((prev) => prev + deltaSeconds);
        }
      };

      workerRef.current.postMessage('start');
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage('stop');
      }
    };
  }, [isRunning]);

  // Persistence and Completion logic
  useEffect(() => {
    // Persist state on change
    localStorage.setItem(
      'studyb_timer',
      JSON.stringify({ mode, timeLeft, customDurations, consumedSeconds })
    );

    if (timeLeft === 0 && isRunning) {
      const completionTimeout = window.setTimeout(() => {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);

        const wasSkipped = skipRef.current;
        skipRef.current = false;

        // Play sound only if not skipped
        if (!wasSkipped) {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
          } else {
            try {
              const audio = new Audio('/api/audio/alarm');
              audio.play().catch(e => console.error("Audio play failed fallback:", e));
            } catch {
              // Audio is optional and may be unavailable in the current browser.
            }
          }
        }

        // Call completion handler
        if (onCompleteRef.current) {
          const durationMinutes = Math.round(customDurations[mode] / 60);
          const consumedMinutes = Math.max(1, Math.round(consumedSeconds / 60)); // Min 1 min if session was active
          const actualConsumed = consumedSeconds > 0 ? consumedMinutes : 0;
          onCompleteRef.current(mode, durationMinutes, actualConsumed);
        }
        setConsumedSeconds(0);
      }, 0);

      return () => clearTimeout(completionTimeout);
    }
  }, [isRunning, timeLeft, mode, customDurations, consumedSeconds]);

  const initAudioUnlock = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/api/audio/alarm');
    }
    // Attempt play/pause sequentially to unlock audio context without making noise
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        audioRef.current?.pause();
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      }).catch(() => {
        // Expected if already playing or no interaction yet
      });
    }
  }, []);

  const start = useCallback(() => {
    initAudioUnlock();
    setIsRunning(true);
  }, [initAudioUnlock]);

  const pause = useCallback(() => setIsRunning(false), []);
  
  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(customDurations[mode]);
    setConsumedSeconds(0);
  }, [customDurations, mode]);

  const changeMode = useCallback((newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(customDurations[newMode]);
    setConsumedSeconds(0);
  }, [customDurations]);

  const setCustomDuration = useCallback((minutes: number) => {
    const seconds = minutes * 60;
    setCustomDurations((durations) => ({ ...durations, [mode]: seconds }));
    if (!isRunning) {
      setTimeLeft(seconds);
    }
  }, [isRunning, mode]);

  const setAllCustomDurations = useCallback((d: { pomodoro: number, shortBreak: number, longBreak: number }) => {
    setCustomDurations(d);
    if (!isRunning) {
      setTimeLeft(d[mode]);
    }
  }, [isRunning, mode]);

  const skip = useCallback(() => {
    skipRef.current = true;
    setTimeLeft(0);
    if (!isRunning) setIsRunning(true); // force trigger completion inside useEffect
  }, [isRunning]);


  return {
    timeLeft,
    isRunning,
    mode,
    start,
    pause,
    reset,
    setMode: changeMode,
    setCustomDuration,
    customDurations,
    setAllCustomDurations,
    skip,
  };
}
