import { motion } from "framer-motion";

function LoadingSpinner({ size = "md", fullScreen = false }) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  const spinner = (
    <motion.div
      className={`rounded-full border-4 border-muted border-t-primary-600 ${sizes[size]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
        <div className="bg-card p-8 rounded-xl shadow-lg">{spinner}</div>
      </div>
    );
  }

  return <div className="flex justify-center items-center">{spinner}</div>;
}

export default LoadingSpinner;
