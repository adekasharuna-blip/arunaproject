import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function PrimaryButton({ children, disabled, ...props }: PrimaryButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`
        w-full sm:w-auto px-8 py-4 rounded-full font-medium transition-all duration-300 ease-in-out
        flex items-center justify-center min-w-[200px]
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
        ${disabled 
          ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none' 
          : 'bg-foreground text-background hover:bg-stone-700 shadow-md hover:shadow-lg active:scale-[0.98]'
        }
      `}
      {...props}
    >
      {children}
    </button>
  );
}
