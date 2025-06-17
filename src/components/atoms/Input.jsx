import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({ 
  label,
  error,
  type = 'text',
  placeholder,
  className = '',
  required = false,
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value && props.value.length > 0;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <motion.label
          initial={false}
          animate={{
            top: focused || hasValue ? '8px' : '16px',
            fontSize: focused || hasValue ? '12px' : '14px',
            color: focused ? '#5B4FE9' : error ? '#FF6B6B' : '#64748b'
          }}
          transition={{ duration: 0.2 }}
          className="absolute left-3 pointer-events-none font-medium z-10"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </motion.label>
      )}
      
      <input
        ref={ref}
        type={type}
        placeholder={!label ? placeholder : ''}
        className={`
          w-full px-3 py-4 border rounded-lg smooth-transition focus-ring
          ${label ? 'pt-6 pb-2' : ''}
          ${error 
            ? 'border-error focus:border-error' 
            : 'border-surface-300 focus:border-primary'
          }
          ${props.disabled ? 'bg-surface-50 cursor-not-allowed' : 'bg-white'}
        `}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;