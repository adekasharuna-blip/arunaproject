import React, { useState } from 'react';
import ArunaLogo from './ArunaLogo';
import PrimaryButton from './PrimaryButton';

interface AvailableTimeScreenProps {
  onComplete: (timeString: string) => void;
}

export default function AvailableTimeScreen({ onComplete }: AvailableTimeScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState<string>('');

  const options = ['21.00', '22.00', '23.00', 'Tidak tentu'];

  const handleSelect = (opt: string) => {
    setSelectedOption(opt);
  };

  const handleContinue = () => {
    if (selectedOption === 'Custom' && customTime) {
      onComplete(customTime);
    } else if (selectedOption) {
      onComplete(selectedOption);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[700px] mx-auto px-6 min-h-screen animate-fade-in pb-12">
      <ArunaLogo />
      
      <main className="flex-1 flex flex-col mt-4 sm:mt-10">
        <div className="space-y-4 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            Kamu punya waktu sampai?
          </h2>
        </div>

        <div className="mt-10 space-y-4">
          <div className="flex flex-wrap gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`px-6 py-4 rounded-2xl border transition-all ${
                  selectedOption === opt 
                    ? 'bg-foreground text-background border-foreground shadow-md' 
                    : 'bg-white/60 text-foreground/80 border-stone-200/80 hover:border-stone-300 hover:bg-white'
                }`}
              >
                {opt}
              </button>
            ))}
            <button
              onClick={() => handleSelect('Custom')}
              className={`px-6 py-4 rounded-2xl border transition-all ${
                selectedOption === 'Custom'
                  ? 'bg-foreground text-background border-foreground shadow-md' 
                  : 'bg-white/60 text-foreground/80 border-stone-200/80 hover:border-stone-300 hover:bg-white'
              }`}
            >
              Custom
            </button>
          </div>

          {selectedOption === 'Custom' && (
            <div className="mt-4 animate-fade-in">
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="px-6 py-4 rounded-xl border border-stone-200/80 bg-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-lg"
              />
            </div>
          )}
        </div>

        <div className="flex justify-center sm:justify-start mt-12">
          <PrimaryButton 
            disabled={!selectedOption || (selectedOption === 'Custom' && !customTime)} 
            onClick={handleContinue}
          >
            Lanjut &rarr;
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
}
