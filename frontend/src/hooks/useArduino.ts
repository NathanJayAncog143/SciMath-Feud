import { useCallback, useEffect, useRef, useState } from 'react';

/*
  useArduino hook
  - Uses Web Serial API to connect to Arduino running provided debounce button sketch
  - Assumes Arduino prints lines like: "Button 1 PRESSED" or "Button 1 RELEASED"
  - Exposes connection state, button states (pressed = true), connect/disconnect functions, last pressed index
*/

// Using `any` for SerialPort to avoid TS lib dependency issues.
export interface ArduinoState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  buttonStates: boolean[]; // length 5, true = pressed
  lastPressedIndex: number | null; // 0-based index of last button transitioned to pressed
  port?: any; // SerialPort
  serialLog: { t: number; line: string }[];
}

interface UseArduinoOptions {
  baudRate?: number;
  numButtons?: number;
}

const DEFAULT_BAUD = 9600;
const BUTTON_REGEX = /Button\s+(\d+)\s+(PRESSED|RELEASED)/i;

export function useArduino(options: UseArduinoOptions = {}) {
  const { baudRate = DEFAULT_BAUD, numButtons = 5 } = options;
  const [state, setState] = useState<ArduinoState>({
    connected: false,
    connecting: false,
    error: null,
    buttonStates: Array(numButtons).fill(false),
    lastPressedIndex: null,
    serialLog: []
  });

  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const portRef = useRef<any | null>(null); // SerialPort
  const abortControllerRef = useRef<AbortController | null>(null);
  const textDecoder = useRef(new TextDecoderStream());

  const disconnect = useCallback(async () => {
    try {
      abortControllerRef.current?.abort();
      if (readerRef.current) {
        try { await readerRef.current.cancel(); } catch {}
        readerRef.current.releaseLock();
      }
      if (portRef.current) {
        try { await portRef.current.close(); } catch {}
      }
    } finally {
      portRef.current = null;
      readerRef.current = null;
      setState(prev => ({
        ...prev,
        connected: false,
        connecting: false
      }));
    }
  }, []);

  const parseLine = useCallback((line: string) => {
    // Always push to log with timestamp (cap at 200 lines)
    setState(prev => {
      const serialLog = [...prev.serialLog, { t: Date.now(), line }];
      if (serialLog.length > 200) serialLog.shift();
      return { ...prev, serialLog };
    });
    const match = line.match(BUTTON_REGEX);
    if (!match) return;
    const idx = parseInt(match[1], 10) - 1; // convert to 0-based
    const action = match[2].toUpperCase();
    if (idx < 0 || idx >= numButtons) return;

    setState(prev => {
      const buttonStates = [...prev.buttonStates];
      const pressed = action === 'PRESSED';
      buttonStates[idx] = pressed;
      return {
        ...prev,
        buttonStates,
        lastPressedIndex: pressed ? idx : prev.lastPressedIndex
      };
    });
  }, [numButtons]);

  const connect = useCallback(async () => {
    if (!('serial' in navigator)) {
      setState(prev => ({ ...prev, error: 'Web Serial API not supported. Use Chrome / Edge.' }));
      return;
    }
    try {
      setState(prev => ({ ...prev, connecting: true, error: null }));
      const port = await (navigator as any).serial.requestPort();
      portRef.current = port;
      await port.open({ baudRate });

      // Set up decoding
      const decoder = textDecoder.current; // TextDecoderStream
      const readable = port.readable?.pipeThrough(decoder);
      if (!readable) throw new Error('No readable stream from serial port');

      const reader = readable.getReader();
      readerRef.current = reader;
      abortControllerRef.current = new AbortController();

      let buffered = '';
      setState(prev => ({ ...prev, connected: true, connecting: false }));

      const readLoop = async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            buffered += value;
            // Split lines by CR/LF
            let lines = buffered.split(/\r?\n/);
            buffered = lines.pop() || '';
            for (const l of lines) {
              parseLine(l.trim());
            }
          }
        }
      };

      readLoop().catch(err => {
        console.error('Serial read error', err);
        setState(prev => ({ ...prev, error: 'Serial read error', connected: false }));
      });
    } catch (e: any) {
      console.error(e);
      setState(prev => ({ ...prev, error: e.message || 'Failed to connect', connecting: false }));
      await disconnect();
    }
  }, [baudRate, disconnect, parseLine]);

  useEffect(() => {
    return () => { disconnect(); };
  }, [disconnect]);

  const clearLog = useCallback(() => {
    setState(prev => ({ ...prev, serialLog: [] }));
  }, []);

  const resetBuzzer = useCallback(() => {
    setState(prev => ({
      ...prev,
      buttonStates: Array(numButtons).fill(false),
      lastPressedIndex: null
    }));
  }, [numButtons]);

  return {
    ...state,
    connect,
    disconnect,
    clearLog,
    resetBuzzer
  };
}

export default useArduino;
