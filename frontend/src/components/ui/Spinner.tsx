import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-2',
  };

  return (
    <div className="flex flex-row gap-4">
      <div 
        className={`rounded-full animate-spin border-y border-solid border-blue-600 border-t-transparent shadow-low ${sizeClasses[size]} ${className}`}
        role="status"
      >
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  );
};

interface SpinnerWithTextProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  textClassName?: string;
}

export const SpinnerWithText: React.FC<SpinnerWithTextProps> = ({
  text = 'Cargando...',
  size = 'md',
  className = '',
  textClassName = 'text-gray-600'
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Spinner size={size} />
      {text && <span className={textClassName}>{text}</span>}
    </div>
  );
};

export default Spinner;
