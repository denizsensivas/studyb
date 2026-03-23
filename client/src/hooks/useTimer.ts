import { useState, useEffect, useRef } from 'react';

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

export function useTimer(onComplete?: (mode: string, durationMinutes: number, consumedMinutes: number) => void): UseTimerResult {
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [customDurations, setCustomDurations] = useState({ ...DURATIONS });
  const [consumedSeconds, setConsumedSeconds] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const skipRef = useRef(false);

  useEffect(() => {
    // Load persisted state if any
    const saved = localStorage.getItem('studyb_timer');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.timeLeft > 0) {
          setMode(parsed.mode);
          setTimeLeft(parsed.timeLeft);
          setCustomDurations(parsed.customDurations);
          setConsumedSeconds(parsed.consumedSeconds || 0);
        }
      } catch (e) {
        // ignore parsing errors
      }
    }
  }, []);

  useEffect(() => {
    // Persist state on change
    localStorage.setItem(
      'studyb_timer',
      JSON.stringify({ mode, timeLeft, customDurations, consumedSeconds })
    );

    if (isRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setConsumedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      const wasSkipped = skipRef.current;
      skipRef.current = false;

      // Play sound only if not skipped
      if (!wasSkipped) {
        try {
          const audio = new Audio('/api/audio/alarm');
          audio.play().catch(() => {});
        } catch (e) {}
      }

      // Call completion handler
      if (onComplete) {
        const durationMinutes = Math.round(customDurations[mode] / 60);
        const consumedMinutes = Math.max(1, Math.round(consumedSeconds / 60)); // Min 1 min if session was active
        const actualConsumed = consumedSeconds > 0 ? consumedMinutes : 0;
        onComplete(mode, durationMinutes, actualConsumed);
      }
      setConsumedSeconds(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, mode, customDurations, onComplete, consumedSeconds]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(customDurations[mode]);
    setConsumedSeconds(0);
  };

  const changeMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(customDurations[newMode]);
    setConsumedSeconds(0);
  };

  const setCustomDuration = (minutes: number) => {
    const seconds = minutes * 60;
    const newDurations = { ...customDurations, [mode]: seconds };
    setCustomDurations(newDurations);
    if (!isRunning) {
      setTimeLeft(seconds);
    }
  };

  const setAllCustomDurations = (d: { pomodoro: number, shortBreak: number, longBreak: number }) => {
    setCustomDurations(d);
    if (!isRunning) {
      setTimeLeft(d[mode]);
    }
  };

  const skip = () => {
    skipRef.current = true;
    setTimeLeft(0);
    if (!isRunning) setIsRunning(true); // force trigger completion inside useEffect
  };


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
