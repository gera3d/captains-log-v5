import React from "react";

/**
 * GoodIdea Button Component
 * - Supports multiple variants: primary, secondary, tertiary, voice, etc.
 * - Consistent styling with brand colors
 * - Accessible elements with proper aria attributes
 * - Optional icons (left/right)
 * - Loading state support
 */
const Button = ({
  label,
  leftIcon,
  rightIcon,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  variant = "primary", // primary, secondary, tertiary, voice
  size = "md", // sm, md, lg, xl
  ariaLabel,
  className = "",
  ...props
}) => {
  // Use aria-label if provided, otherwise fallback to label
  const ariaLabelValue = ariaLabel || label;

  // Define style variants
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-brand-primary text-brand-onPrimary hover:bg-brand-primary-dark active:bg-brand-primary-darker shadow-md";
      case "secondary":
        return "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 shadow-sm";
      case "tertiary":
        return "bg-transparent text-brand-primary hover:bg-brand-primary/10 active:bg-brand-primary/20";
      case "voice":
        return "bg-gradient-to-r from-[#FFD600] to-[#FF9100] text-[#1A237E] hover:from-[#FFC400] hover:to-[#FF8000] active:from-[#FFB300] active:to-[#FF6D00] shadow-lg border-2 border-[#FFD600]/50";
      case "danger":
        return "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md";
      case "success":
        return "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-md";
      default:
        return "bg-brand-primary text-brand-onPrimary hover:bg-brand-primary-dark active:bg-brand-primary-darker shadow-md";
    }
  };

  // Define size variants
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1 text-xs";
      case "md":
        return "px-5 py-2 text-sm";
      case "lg":
        return "px-6 py-3 text-base";
      case "xl":
        return "px-12 py-5 text-xl";
      default:
        return "px-5 py-2 text-sm";
    }
  };

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center
        ${getSizeClasses()}
        rounded-lg
        font-mono font-bold uppercase
        tracking-wider
        transition-all duration-200
        outline-none
        focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2
        disabled:opacity-60 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${variant === "voice" ? "rounded-3xl tracking-widest transform hover:scale-105 transition-transform" : ""}
        ${loading ? "opacity-80 cursor-wait" : ""}
        ${className}
      `}
      aria-label={ariaLabelValue}
      disabled={disabled || loading}
      tabIndex={0}
      onClick={onClick}
      {...props}
    >
      {leftIcon && !loading && (
        <span className="mr-2 flex items-center" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      <span className="select-none">{label}</span>
      
      {rightIcon && !loading && (
        <span className="ml-2 flex items-center" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;