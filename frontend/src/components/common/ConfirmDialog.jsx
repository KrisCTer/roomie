import { useDialog } from "../../contexts/DialogContext";
import { AlertTriangle, Trash2, Info, HelpCircle } from "lucide-react";

const iconMap = {
  warning: <AlertTriangle className="w-8 h-8 text-amber-500" />,
  danger: <Trash2 className="w-8 h-8 text-rose-500" />,
  info: <Info className="w-8 h-8 text-sky-500" />,
  question: <HelpCircle className="w-8 h-8 text-indigo-500" />,
};

const buttonColorMap = {
  warning: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-300",
  danger: "bg-rose-500 hover:bg-rose-600 focus:ring-rose-300",
  info: "bg-sky-500 hover:bg-sky-600 focus:ring-sky-300",
  question: "bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-300",
};

const ConfirmDialog = () => {
  const { confirmState, handleConfirmResponse } = useDialog();

  if (!confirmState) return null;

  const { title, message, confirmText, cancelText, type } = confirmState;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={() => handleConfirmResponse(false)}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[420px] mx-4 animate-scale-in overflow-hidden">
        {/* Top accent bar */}
        <div
          className={`h-1 w-full ${
            type === "danger"
              ? "bg-gradient-to-r from-rose-400 to-rose-500"
              : type === "warning"
              ? "bg-gradient-to-r from-amber-400 to-amber-500"
              : type === "info"
              ? "bg-gradient-to-r from-sky-400 to-sky-500"
              : "bg-gradient-to-r from-indigo-400 to-indigo-500"
          }`}
        />

        <div className="px-8 pt-8 pb-6">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div
              className={`p-4 rounded-2xl ${
                type === "danger"
                  ? "bg-rose-50"
                  : type === "warning"
                  ? "bg-amber-50"
                  : type === "info"
                  ? "bg-sky-50"
                  : "bg-indigo-50"
              }`}
            >
              {iconMap[type] || iconMap.question}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-500 text-center leading-relaxed mb-8">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleConfirmResponse(false)}
              className="flex-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              {cancelText}
            </button>
            <button
              onClick={() => handleConfirmResponse(true)}
              className={`flex-1 px-5 py-3 rounded-xl text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 ${
                buttonColorMap[type] || buttonColorMap.question
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
