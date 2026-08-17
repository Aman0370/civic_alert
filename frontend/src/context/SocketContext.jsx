import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('civicalert_token');
    const socket = io(SOCKET_URL, {
      auth: token ? { token } : {},
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('notification', (payload) => {
      setLiveNotifications((prev) => [{ ...payload, id: crypto.randomUUID(), at: Date.now() }, ...prev].slice(0, 50));
    });

    socket.on('alert:new', (alert) => {
      setLiveAlerts((prev) => [alert, ...prev].slice(0, 100));
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const dismissNotification = (id) => {
    setLiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, connected, liveNotifications, liveAlerts, dismissNotification }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
}
