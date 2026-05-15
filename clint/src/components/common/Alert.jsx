import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

function Alert({ type = "info", title, message, onClose, dismissible = true }) {
  const config = {
    success: {
      bg: "bg-green-50 border-green-200",
      icon: CheckCircle,
      iconColor: "text-green-600",
      titleColor: "text-green-900",
      messageColor: "text-green-800",
    },
    error: {
      bg: "bg-red-50 border-red-200",
      icon: AlertCircle,
      iconColor: "text-red-600",
      titleColor: "text-red-900",
      messageColor: "text-red-800",
    },
    warning: {
      bg: "bg-amber-50 border-amber-200",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      titleColor: "text-amber-900",
      messageColor: "text-amber-800",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: Info,
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
      messageColor: "text-blue-800",
    },
  };

  const cfg = config[type] || config.info;
  const Icon = cfg.icon;

  return (
    <div className={`p-4 rounded-lg border-2 ${cfg.bg} flex gap-3`}>
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
      <div className="flex-1">
        {title && <h4 className={`font-semibold ${cfg.titleColor}`}>{title}</h4>}
        {message && <p className={`text-sm ${cfg.messageColor}`}>{message}</p>}
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className={`text-muted-foreground hover:text-foreground transition-colors p-1`}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default Alert;
