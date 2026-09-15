import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Wraps the browser's SpeechRecognition API so chat/ask inputs across the
 * app can offer a mic button without duplicating browser-compat handling.
 *
 * Gracefully reports `supported: false` on browsers without SpeechRecognition
 * (e.g. Firefox) so callers can hide/disable the mic button instead of
 * throwing at runtime.
 */
export function useVoiceInput({ lang = "en-IN", onResult } = {}) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(
    () => typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(() => {
    if (!supported || listening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) onResultRef.current?.(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }, [supported, listening, lang]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { start, stop, toggle, listening, supported };
}