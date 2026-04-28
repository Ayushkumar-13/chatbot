import React from "react";

const Card = ({ children, className, style, ...props }) => (
  <div
    style={{
      background: 'var(--bg-primary)',
      borderRadius: 24,
      width: '100%',
      boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      ...style
    }}
    className={className}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className, style, ...props }) => (
  <div
    style={{
      padding: '40px 32px 16px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      ...style
    }}
    className={className}
    {...props}
  >
    {children}
  </div>
);

const CardContent = ({ children, className, style, ...props }) => (
  <div
    style={{
      padding: '16px 32px 40px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      ...style
    }}
    className={className}
    {...props}
  >
    {children}
  </div>
);

const CardFooter = ({ children, className, style, ...props }) => (
  <div
    style={{
      padding: '0 32px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      ...style
    }}
    className={className}
    {...props}
  >
    {children}
  </div>
);

export { Card, CardHeader, CardContent, CardFooter };
