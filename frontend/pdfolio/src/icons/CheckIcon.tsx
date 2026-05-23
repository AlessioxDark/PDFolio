import React from "react";

const CheckIcon = ({
  size,
  className,
  bgColor,
  iconColor = "currentColor",
  onClick,
}: {
  size?: number;
  className?: string;
  bgColor?: string;
  iconColor?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center ${className || ""} p-1.5`}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      onClick={onClick}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 6L9 17L4 12"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default CheckIcon;
