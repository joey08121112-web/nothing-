import React from 'react';

interface DotMatrixProps {
  text: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const DotMatrixText: React.FC<DotMatrixProps> = ({ text, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  };

  return (
    <span id="dot-matrix-text" className={`font-display tracking-tight leading-none ${sizeClasses[size]} ${className}`}>
      {text}
    </span>
  );
};

export const Label: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
  <span id={id || "nothing-label"} className={`font-mono text-[11px] uppercase tracking-[0.1em] text-text-secondary ${className}`}>
    {children}
  </span>
);

export const Button: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'ghost'; 
  className?: string;
  disabled?: boolean;
  id?: string;
}> = ({ children, onClick, variant = 'primary', className = '', disabled, id }) => {
  const base = "font-mono text-[13px] uppercase tracking-[0.06em] px-6 py-3 rounded-nd-pill transition-all duration-200 disabled:opacity-40";
  const variants = {
    primary: "bg-text-display text-black hover:opacity-90",
    secondary: "bg-transparent border border-border-visible text-text-primary hover:border-text-secondary",
    ghost: "bg-transparent text-text-secondary hover:text-text-primary px-2",
  };

  return (
    <button 
      id={id || "nothing-button"}
      onClick={onClick} 
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div id="nothing-card" className={`bg-surface border border-border rounded-nd p-6 ${className}`}>
    {children}
  </div>
);
