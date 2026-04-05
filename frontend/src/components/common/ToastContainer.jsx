import { useEffect } from "react";
import { useDialog } from "../../contexts/DialogContext";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  X,
} from "lucide-react";

const iconMap = {
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const colorMap = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-500",
    text: "text-emerald-800",
    progress: "bg-emerald-400",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-500",
    text: "text-amber-800",
    progress: "bg-amber-400",
  },
  error: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: "text-rose-500",
    text: "text-rose-800",
    progress: "bg-rose-400",
  },
  info: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    icon: "text-sky-500",
    text: "text-sky-800",
    progress: "bg-sky-400",
  },
};

const ToastItem = ({ toast, onDismiss }) => {
  const colors = colorMap[toast.type] || colorMap.info;

  return (
    <div
      className={`
        ${colors.bg} ${colors.border} border
        rounded-2xl shadow-xl backdrop-blur-sm
        px-5 py-4 min-w-[340px] max-w-[480px]
        flex items-start gap-3
        animate-slide-in-right
        relative overflow-hidden
      `}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
        <div
          className={`h-full ${colors.progress} rounded-full`}
          style={{
            animation: `shrink ${toast.duration}ms linear forwards`,
          }}
        />
      </div>

      <div className={`mt-0.5 flex-shrink-0 ${colors.icon}`}>
        {iconMap[toast.type] || iconMap.info}
      </div>

      <p className={`flex-1 text-sm font-medium ${colors.text} leading-relaxed`}>
        {toast.message}
      </p>

      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
      >
        <X className={`w-4 h-4 ${colors.icon}`} />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, dismissToast } = useDialog();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
