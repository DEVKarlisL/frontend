/**
 * Premium Input Component
 * Form input with validation states and icon support
 */

import React from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  size?: "sm" | "md" | "lg";
  required?: boolean;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  disabled = false,
  icon,
  iconPosition = "left",
  className = "",
  size = "md",
  required = false,
  helperText,
}) => {
  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-4 py-3 text-lg",
  };

  const baseInputStyles = `w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-neutral-100 disabled:cursor-not-allowed ${sizeStyles[size]}`;

  const borderStyles = error
    ? "border-danger-300 focus:border-danger-500 focus:ring-danger-200"
    : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200";

  const iconStyles = icon ? (iconPosition === "left" ? "pl-10" : "pr-10") : "";

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${baseInputStyles} ${borderStyles} ${iconStyles}`}
        />
        {icon && iconPosition === "right" && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-2 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
