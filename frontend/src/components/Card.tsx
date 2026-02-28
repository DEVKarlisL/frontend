/**
 * Premium Card Component
 * Stitch-inspired with elevation and shadow effects
 */

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: "none" | "sm" | "md" | "lg" | "xl" | "premium";
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  elevation = "md",
  onClick,
  hoverable = false,
}) => {
  const elevationStyles = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    premium: "shadow-premium",
  };

  const hoverStyles = hoverable
    ? "hover:shadow-hover transition-shadow duration-300 cursor-pointer"
    : "";

  return (
    <div
      className={`bg-white rounded-lg border border-neutral-200 p-6 ${elevationStyles[elevation]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
