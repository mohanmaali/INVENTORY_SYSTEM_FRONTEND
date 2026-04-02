import { forwardRef } from 'react';

const Input = forwardRef(({ className = '', error, ...props }, ref) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors';
  const errorClasses = error ? 'border-red-500' : 'border-gray-300';

  return (
    <input
      ref={ref}
      className={`${baseClasses} ${errorClasses} ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';
export default Input;
