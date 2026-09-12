import React from 'react';
import ArunaLogo from './ArunaLogo';
import PrimaryButton from './PrimaryButton';
import { MentalStateId, mentalStates } from '@/data/mentalStates';

interface ResponseScreenProps {
  selectedId: MentalStateId;
  onNext: () => void;
}

export default function ResponseScreen({ selectedId, onNext }: ResponseScreenProps) {
  const selectedState = mentalStates.find(s => s.id === selectedId);
  
  if (!selectedState) return null;

  // Split response by newline to render separate paragraphs if needed
  const responseLines = selectedState.response.split('\n');

  return (
    <div className="flex flex-col w-full max-w-[700px] mx-auto px-6 min-h-screen animate-fade-in pb-12">
      <ArunaLogo />
      
      <main className="flex-1 flex flex-col justify-center items-center sm:items-start text-center sm:text-left mt-[-10vh]">
        <div className="space-y-6 max-w-xl w-full">
          {responseLines.map((line, index) => (
            <h2 
              key={index} 
              className={`text-3xl sm:text-4xl font-medium tracking-tight leading-tight ${index === 0 ? 'text-foreground' : 'text-foreground/80'}`}
            >
              {line}
            </h2>
          ))}
        </div>

        <div className="flex justify-center sm:justify-start mt-12 w-full">
          <PrimaryButton onClick={onNext}>
            Lanjut
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
}
