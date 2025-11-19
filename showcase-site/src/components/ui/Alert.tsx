import { HTMLAttributes } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
}

export default function Alert({
  children,
  variant = 'info',
  title,
  closable = false,
  onClose,
  icon,
  className = '',
  ...props
}: AlertProps) {
  const variantClasses = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
  };

  const defaultIcons = {
    info: <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`${variantClasses[variant]} ${className}`}
        {...props}
      >
        {icon || defaultIcons[variant]}
        <div className="flex-1">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
        {closable && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
