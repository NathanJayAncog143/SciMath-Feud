import { useCallback, useEffect, useRef, useState } from 'react';

/*
  Web Serial connection for the Arduino buzzers.

  A port object becomes unusable after a physical USB disconnect. This hook
  releases the old reader/port immediately, resets stuck button state, and
  reconnects to the previously authorised device when it appears again.
  Browsers only allow the initial port chooser from a user action, so the
  Connect button remains the fallback when automatic recovery is unavailable.
*/

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialPortLike {
  connected?: boolean;
  readable: ReadableStream<Uint8Array> | null;
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  getInfo?: () => SerialPortInfo;
}

interface SerialConnectionEvent extends Event {
  target: EventTarget & SerialPortLike;
}

interface SerialApi {
  requestPort: () => Promise<SerialPortLike>;
  getPorts: () => Promise<SerialPortLike[]>;
  addEventListener: (type: 'connect' | 'disconnect', listener: EventListener) => void;
  removeEventListener: (type: 'connect' | 'disconnect', listener: EventListener) => void;
}

export interface ArduinoState {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  error: string | null;
  buttonStates: boolean[];
  lastPressedIndex: number | null;
  port?: SerialPortLike;
  serialLog: { t: number; line: string }[];
}

interface UseArduinoOptions {
  baudRate?: number;
  numButtons?: number;
  autoReconnect?: boolean;
  reconnectIntervalMs?: number;
}

const DEFAULT_BAUD = 9600;
const BUTTON_REGEX = /Button\s+(\d+)\s+(PRESSED|RELEASED)/i;

const getSerialApi = (): SerialApi | null => {
  if (typeof navigator === 'undefined' || !('serial' in navigator)) return null;
  return (navigator as Navigator & { serial: SerialApi }).serial;
};

const describeSerialError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error || 'Failed to connect');
  if (/no port selected|chooser|cancel/i.test(message)) return 'No serial port was selected.';
  if (/open|busy|access|in use|networkerror/i.test(message)) {
    return `Could not open the serial port. Close Arduino Serial Monitor or any other app using it, then try again. (${message})`;
  }
  return message;
};

export function useArduino(options: UseArduinoOptions = {}) {
  const {
    baudRate = DEFAULT_BAUD,
    numButtons = 5,
    autoReconnect = true,
    reconnectIntervalMs = 1500,
  } = options;

  const emptyButtons = useCallback(() => Array<boolean>(numButtons).fill(false), [numButtons]);
  const [state, setState] = useState<ArduinoState>({
    connected: false,
    connecting: false,
    reconnecting: false,
    error: null,
    buttonStates: Array<boolean>(numButtons).fill(false),
    lastPressedIndex: null,
    serialLog: [],
  });

  const mountedRef = useRef(true);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const portRef = useRef<SerialPortLike | null>(null);
  const preferredPortRef = useRef<SerialPortLike | null>(null);
  const preferredInfoRef = useRef<SerialPortInfo | null>(null);
  const connectingRef = useRef(false);
  const wantsConnectionRef = useRef(false);
  const connectionIdRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectToPortRef = useRef<(port: SerialPortLike, reconnecting: boolean) => Promise<void>>(async () => {});
  const scheduleReconnectRef = useRef<() => void>(() => {});

  const updateState = useCallback((updater: (previous: ArduinoState) => ArduinoState) => {
    if (mountedRef.current) setState(updater);
  }, []);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const releaseConnection = useCallback(async (portToClose?: SerialPortLike | null) => {
    connectionIdRef.current += 1;
    const reader = readerRef.current;
    const port = portToClose ?? portRef.current;

    readerRef.current = null;
    if (!portToClose || portRef.current === portToClose) portRef.current = null;

    if (reader) {
      try { await reader.cancel(); } catch { /* The USB device may already be gone. */ }
      try { reader.releaseLock(); } catch { /* The read loop may have released it. */ }
    }
    if (port) {
      try { await port.close(); } catch { /* Closing a removed device normally fails. */ }
    }
  }, []);

  const parseLine = useCallback((line: string) => {
    if (!line) return;
    updateState(previous => {
      const serialLog = [...previous.serialLog, { t: Date.now(), line }].slice(-200);
      const match = line.match(BUTTON_REGEX);
      if (!match) return { ...previous, serialLog };

      const index = Number.parseInt(match[1], 10) - 1;
      if (index < 0 || index >= numButtons) return { ...previous, serialLog };

      const pressed = match[2].toUpperCase() === 'PRESSED';
      const buttonStates = [...previous.buttonStates];
      buttonStates[index] = pressed;
      return {
        ...previous,
        serialLog,
        buttonStates,
        lastPressedIndex: pressed ? index : previous.lastPressedIndex,
      };
    });
  }, [numButtons, updateState]);

  const portMatchesPreferred = useCallback((port: SerialPortLike) => {
    if (port === preferredPortRef.current) return true;
    const preferred = preferredInfoRef.current;
    const candidate = port.getInfo?.();
    if (!preferred || !candidate) return false;
    if (preferred.usbVendorId === undefined && preferred.usbProductId === undefined) return false;
    return preferred.usbVendorId === candidate.usbVendorId
      && preferred.usbProductId === candidate.usbProductId;
  }, []);

  const tryAuthorizedReconnect = useCallback(async () => {
    if (!mountedRef.current || !autoReconnect || !wantsConnectionRef.current
      || connectingRef.current || portRef.current) return;

    const serial = getSerialApi();
    if (!serial) return;

    try {
      const ports = await serial.getPorts();
      const port = ports.find(candidate => candidate.connected !== false && portMatchesPreferred(candidate));
      if (port) {
        await connectToPortRef.current(port, true);
        return;
      }
    } catch (error) {
      console.warn('Unable to check authorised serial ports:', error);
    }
    scheduleReconnectRef.current();
  }, [autoReconnect, portMatchesPreferred]);

  const scheduleReconnect = useCallback(() => {
    clearReconnectTimer();
    if (!mountedRef.current || !autoReconnect || !wantsConnectionRef.current || portRef.current) return;
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      void tryAuthorizedReconnect();
    }, reconnectIntervalMs);
  }, [autoReconnect, clearReconnectTimer, reconnectIntervalMs, tryAuthorizedReconnect]);
  scheduleReconnectRef.current = scheduleReconnect;

  const handleConnectionLost = useCallback(async (port: SerialPortLike, message: string) => {
    if (portRef.current !== port) return;
    await releaseConnection(port);
    updateState(previous => ({
      ...previous,
      connected: false,
      connecting: false,
      reconnecting: autoReconnect && wantsConnectionRef.current,
      error: autoReconnect && wantsConnectionRef.current
        ? `${message} Waiting for the USB device to reconnect...`
        : message,
      buttonStates: emptyButtons(),
      lastPressedIndex: null,
      port: undefined,
    }));
    scheduleReconnect();
  }, [autoReconnect, emptyButtons, releaseConnection, scheduleReconnect, updateState]);

  const connectToPort = useCallback(async (port: SerialPortLike, reconnecting: boolean) => {
    if (!mountedRef.current || connectingRef.current || portRef.current) return;

    connectingRef.current = true;
    clearReconnectTimer();
    const connectionId = connectionIdRef.current + 1;
    connectionIdRef.current = connectionId;
    portRef.current = port;

    updateState(previous => ({
      ...previous,
      connecting: true,
      reconnecting,
      error: null,
      buttonStates: emptyButtons(),
      lastPressedIndex: null,
    }));

    try {
      await port.open({ baudRate });
      if (!mountedRef.current || connectionIdRef.current !== connectionId || !wantsConnectionRef.current) {
        if (portRef.current === port) portRef.current = null;
        try { await port.close(); } catch { /* The connection was cancelled while opening. */ }
        return;
      }
      if (!port.readable) throw new Error('The serial port opened without a readable stream.');

      const reader = port.readable.getReader();
      readerRef.current = reader;
      preferredPortRef.current = port;
      preferredInfoRef.current = port.getInfo?.() ?? null;

      updateState(previous => ({
        ...previous,
        connected: true,
        connecting: false,
        reconnecting: false,
        error: null,
        port,
      }));

      const decoder = new TextDecoder();
      let buffered = '';
      void (async () => {
        try {
          while (mountedRef.current && connectionIdRef.current === connectionId) {
            const { value, done } = await reader.read();
            if (done) break;
            if (!value) continue;

            buffered += decoder.decode(value, { stream: true });
            const lines = buffered.split(/\r?\n/);
            buffered = lines.pop() ?? '';
            lines.forEach(line => parseLine(line.trim()));
          }
          if (buffered.trim()) parseLine(buffered.trim());
          if (connectionIdRef.current === connectionId && portRef.current === port) {
            await handleConnectionLost(port, 'The buzzer connection ended.');
          }
        } catch (error) {
          if (connectionIdRef.current === connectionId && portRef.current === port) {
            console.warn('Serial read stopped:', error);
            await handleConnectionLost(port, 'The buzzer USB connection was interrupted.');
          }
        } finally {
          if (readerRef.current === reader) readerRef.current = null;
          try { reader.releaseLock(); } catch { /* Already released during cleanup. */ }
        }
      })();
    } catch (error) {
      if (portRef.current === port) portRef.current = null;
      try { await port.close(); } catch { /* Ignore cleanup failure. */ }
      updateState(previous => ({
        ...previous,
        connected: false,
        connecting: false,
        reconnecting: reconnecting && autoReconnect && wantsConnectionRef.current,
        error: reconnecting
          ? 'The buzzer is not ready yet. Automatic reconnection will keep trying.'
          : describeSerialError(error),
        buttonStates: emptyButtons(),
        lastPressedIndex: null,
        port: undefined,
      }));
      if (reconnecting) scheduleReconnect();
    } finally {
      connectingRef.current = false;
    }
  }, [autoReconnect, baudRate, clearReconnectTimer, emptyButtons, handleConnectionLost, parseLine, scheduleReconnect, updateState]);
  connectToPortRef.current = connectToPort;

  const connect = useCallback(async () => {
    const serial = getSerialApi();
    if (!serial) {
      updateState(previous => ({
        ...previous,
        error: 'Web Serial API is not supported. Use Chrome or Edge on desktop.',
      }));
      return;
    }
    if (connectingRef.current || portRef.current) return;

    wantsConnectionRef.current = true;
    clearReconnectTimer();
    try {
      const port = await serial.requestPort();
      preferredPortRef.current = port;
      preferredInfoRef.current = port.getInfo?.() ?? null;
      await connectToPort(port, false);
    } catch (error) {
      wantsConnectionRef.current = false;
      updateState(previous => ({
        ...previous,
        connected: false,
        connecting: false,
        reconnecting: false,
        error: describeSerialError(error),
      }));
    }
  }, [clearReconnectTimer, connectToPort, updateState]);

  const disconnect = useCallback(async () => {
    wantsConnectionRef.current = false;
    connectingRef.current = false;
    clearReconnectTimer();
    await releaseConnection();
    updateState(previous => ({
      ...previous,
      connected: false,
      connecting: false,
      reconnecting: false,
      error: null,
      buttonStates: emptyButtons(),
      lastPressedIndex: null,
      port: undefined,
    }));
  }, [clearReconnectTimer, emptyButtons, releaseConnection, updateState]);

  useEffect(() => {
    mountedRef.current = true;
    const serial = getSerialApi();
    if (!serial) return () => { mountedRef.current = false; };

    const handleUsbConnect = (event: Event) => {
      if (!autoReconnect || !wantsConnectionRef.current || portRef.current || connectingRef.current) return;
      const port = (event as SerialConnectionEvent).target;
      if (portMatchesPreferred(port)) void connectToPortRef.current(port, true);
    };
    const handleUsbDisconnect = (event: Event) => {
      const port = (event as SerialConnectionEvent).target;
      if (portRef.current === port || portMatchesPreferred(port)) {
        const activePort = portRef.current;
        if (activePort) void handleConnectionLost(activePort, 'The buzzer USB device was unplugged.');
      }
    };

    serial.addEventListener('connect', handleUsbConnect);
    serial.addEventListener('disconnect', handleUsbDisconnect);
    return () => {
      mountedRef.current = false;
      wantsConnectionRef.current = false;
      clearReconnectTimer();
      serial.removeEventListener('connect', handleUsbConnect);
      serial.removeEventListener('disconnect', handleUsbDisconnect);
      void releaseConnection();
    };
  }, [autoReconnect, clearReconnectTimer, handleConnectionLost, portMatchesPreferred, releaseConnection]);

  const clearLog = useCallback(() => {
    updateState(previous => ({ ...previous, serialLog: [] }));
  }, [updateState]);

  const resetBuzzer = useCallback(() => {
    updateState(previous => ({
      ...previous,
      buttonStates: emptyButtons(),
      lastPressedIndex: null,
    }));
  }, [emptyButtons, updateState]);

  return {
    ...state,
    connect,
    disconnect,
    clearLog,
    resetBuzzer,
  };
}

export default useArduino;
