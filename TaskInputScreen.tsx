import React, { useState } from 'react';
import ArunaLogo from './ArunaLogo';
import PrimaryButton from './PrimaryButton';

interface TaskInputScreenProps {
  onAddTitle: (title: string) => void;
}

export default function TaskInputScreen({ onAddTitle }: TaskInputScreenProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTitle(title.trim());
      setTitle('');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[700px] mx-auto px-6 min-h-screen animate-fade-in pb-12">
      <ArunaLogo />
      
      <main className="flex-1 flex flex-col mt-4 sm:mt-10">
        <div className="space-y-4 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            Apa yang ingin kamu selesaikan hari ini?
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 w-full">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Belajar integral untuk TKA"
            className="w-full px-6 py-4 rounded-2xl border border-stone-200/80 bg-white/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg sm:text-xl transition-all placeholder:text-stone-400"
            autoFocus
          />
          
          <div className="flex justify-center sm:justify-start mt-6">
            <PrimaryButton type="submit" disabled={!title.trim()}>
              + Tambahkan
            </PrimaryButton>
          </div>
        </form>
      </main>
    </div>
  );
}
