import React from 'react';
import { MentalState } from '@/data/mentalStates';

interface MentalStateCardProps {
  state: MentalState;
  isSelected: boolean;
  onClick: () => void;
}

export default function MentalStateCard({ state, isSelected, onClick }: MentalStateCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 ease-in-out border
        flex items-center space-x-4
        focus:outline-none focus:ring-2 focus:ring-primary/50
        ${isSelected 
          ? 'bg-white border-primary/40 shadow-[0_4px_20px_-4px_rgba(217,119,87,0.15)] ring-1 ring-primary/20 transform scale-[1.02]' 
          : 'bg-white/60 border-stone-200/60 shadow-sm hover:bg-white hover:border-stone-300 hover:shadow-md'
        }
      `}
      aria-pressed={isSelected}
    >
      <span className="text-2xl" aria-hidden="true">{state.icon}</span>
      <span className={`text-base sm:text-lg transition-colors duration-300 ${isSelected ? 'text-foreground font-medium' : 'text-foreground/80'}`}>
        {state.label}
      </span>
    </button>
  );
}
