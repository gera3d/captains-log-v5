import React from 'react';

const Button = ({ 
  onClick, 
  className, 
  disabled, 
  label, 
  leftIcon, 
  rightIcon, 
  ariaLabel,
  title,
  type = 'button'
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 transition-all duration-200 ${className}`}
      disabled={disabled}
      aria-label={ariaLabel || label}
      title={title}
      type={type}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span className="whitespace-nowrap text-sm sm:text-base overflow-hidden text-ellipsis">{label}</span>
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;