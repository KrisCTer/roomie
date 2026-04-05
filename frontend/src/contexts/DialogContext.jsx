import { createContext, useContext, useState, useCallback, useRef } from "react";

const DialogContext = createContext(null);

export const DialogProvider = ({ children }) => {
  // ==================== TOAST ====================
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ==================== CONFIRM ====================
  const [confirmState, setConfirmState] = useState(null);
  const confirmResolveRef = useRef(null);

  const showConfirm = useCallback(
    ({
      title = "Xác nhận",
      message,
      confirmText = "Xác nhận",
      cancelText = "Hủy",
      type = "warning",
    }) => {
      return new Promise((resolve) => {
        confirmResolveRef.current = resolve;
        setConfirmState({ title, message, confirmText, cancelText, type });
      });
    },
    []
  );

  const handleConfirmResponse = useCallback((result) => {
    if (confirmResolveRef.current) {
      confirmResolveRef.current(result);
      confirmResolveRef.current = null;
    }
    setConfirmState(null);
  }, []);

  return (
    <DialogContext.Provider
      value={{ toasts, showToast, dismissToast, confirmState, showConfirm, handleConfirmResponse }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useDialog must be used within DialogProvider");
  return context;
};
