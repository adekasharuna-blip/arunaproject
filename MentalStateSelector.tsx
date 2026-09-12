import React from 'react';
import { mentalStates, MentalStateId } from '@/data/mentalStates';
import MentalStateCard from './MentalStateCard';

interface MentalStateSelectorProps {
  selectedId: MentalStateId | null;
  onSelect: (id: MentalStateId) => void;
}

export default function MentalStateSelector({ selectedId, onSelect }: MentalStateSelectorProps) {
  return (
    <div 
      className="flex flex-col space-y-3 w-full my-10" 
      role="radiogroup" 
      aria-label="Pilih keadaan mentalmu hari ini"
    >
      {mentalStates.map((state) => (
        <MentalStateCard
          key={state.id}
          state={state}
          isSelected={selectedId === state.id}
          onClick={() => onSelect(state.id)}
        />
      ))}
    </div>
  );
}
