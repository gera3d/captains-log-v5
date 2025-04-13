import React from "react";

/**
 * GoodIdea Style Guide Button
 * - Brand colors, font, spacing via Tailwind tokens
 * - Uppercase, monospaced label, expanded letter spacing
 * - Rounded corners, shadow, clear states
 * - Optional left/right icon
 * - Accessible (aria-label, focus ring, disabled, etc.)
 */
const Button = ({
  label,
  leftIcon,
  rightIcon,
  onClick,
  type = "button",
  disabled = false,
  ariaLabel,
  className = "",
  ...props
}) => {
  // Use aria-label if provided, otherwise fallback to label
  const ariaLabelValue = ariaLabel || label;

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center
        px-5 py-2
        rounded-lg shadow-md
        bg-brand-primary text-brand-onPrimary
        font-mono font-bold uppercase
        tracking-wider
        transition
        outline-none
        focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2
        hover:bg-brand-primary-dark
        active:bg-brand-primary-darker
        disabled:bg-brand-muted disabled:text-brand-onMuted disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={ariaLabelValue}
      disabled={disabled}
      tabIndex={0}
      onClick={onClick}
      {...props}
    >
      {leftIcon && (
        <span className="mr-2 flex items-center" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className="select-none">{label}</span>
      {rightIcon && (
        <span className="ml-2 flex items-center" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};


export default Button;