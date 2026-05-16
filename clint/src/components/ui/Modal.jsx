import { AnimatePresence, motion as Motion } from "framer-motion";

function Modal({ open, onClose, title, description, children, size = "md" }) {
  const widths = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
          onClick={onClose}
        >
          <Motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(event) => event.stopPropagation()}
            className={`surface w-full ${widths[size]} overflow-hidden`}
          >
            {(title || description) && (
              <div className="border-b border-white/10 px-6 py-5">
                {title && <h3 className="text-xl font-semibold text-white">{title}</h3>}
                {description && <p className="mt-1 text-sm text-slate-300">{description}</p>}
              </div>
            )}
            <div className="px-6 py-5">{children}</div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
