import React from "react";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      style={{
        width: '100%',
        background: 'var(--bg-input)',
        border: '1px solid transparent',
        borderRadius: 12,
        padding: '14px 16px',
        fontSize: 15,
        color: 'var(--text-primary)',
        transition: 'all 0.2s ease',
        outline: 'none',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }}
      className={className}
      ref={ref}
      onFocus={(e) => (e.target.style.border = "1px solid var(--app-accent)")}
      onBlur={(e) => (e.target.style.border = "1px solid transparent")}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
