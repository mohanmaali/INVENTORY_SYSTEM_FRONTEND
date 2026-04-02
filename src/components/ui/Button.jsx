function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
