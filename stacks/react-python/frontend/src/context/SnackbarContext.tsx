// src/context/SnackbarContext.tsx

import { createContext, useContext, useState, ReactNode } from 'react';

interface SnackbarContextType {
  message: string;
  visible: boolean;
  showSnackbar: (message: string) => void;
  hideSnackbar: () => void;
}

export const SnackbarContext = createContext<SnackbarContextType | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const showSnackbar = (msg: string) => {
    setMessage(msg);
    setVisible(true);
  };

  const hideSnackbar = () => setVisible(false);

  return (
    <SnackbarContext.Provider value={{ message, visible, showSnackbar, hideSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  );
}
export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('useSnackbar must be used within SnackbarProvider');
  return context;
}
