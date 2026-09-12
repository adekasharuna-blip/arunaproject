import React from 'react';
import ArunaLogo from './ArunaLogo';
import PrimaryButton from './PrimaryButton';
import { Task } from '@/types';

interface ReviewScreenProps {
  tasks: Task[];
  availableUntil: string;
  onGeneratePlan: () => void;
}

export default function ReviewScreen({ tasks, availableUntil, onGeneratePlan }: ReviewScreenProps) {
  
  const formatDeadline = (d?: string) => {
    if (d === 'besok') return 'Besok';
    if (d === 'minggu_ini') return 'Minggu ini';
    if (d === 'minggu_depan') return 'Minggu depan';
    if (d === 'tidak_ada') return 'Tidak ada deadline';
    if (!d) return 'Tidak ada deadline';
    return d; // Custom date string
  };

  const formatWorkload = (w?: string) => {
    if (w === 'sedikit') return 'Sedikit';
    if (w === 'sedang') return 'Sedang';
    if (w === 'banyak') return 'Banyak';
    return 'Belum tahu';
  };

  return (
    <div className="flex flex-col w-full max-w-[700px] mx-auto px-6 min-h-screen animate-fade-in pb-12">
      <ArunaLogo />
      
      <main className="flex-1 flex flex-col mt-4 sm:mt-10">
        <div className="space-y-2 text-center sm:text-left mb-8">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            Malam ini
          </h2>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white/60 p-4 rounded-xl border border-stone-200/80 shadow-sm flex items-start space-x-3">
              <span className="text-xl" aria-hidden="true">🎯</span>
              <div>
                <p className="font-medium text-foreground text-lg">{task.title}</p>
                <p className="text-foreground/60 text-sm mt-1">
                  {formatDeadline(task.deadline)} &middot; {formatWorkload(task.workload)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:text-left">
          <p className="text-foreground/70 font-medium">Sampai {availableUntil}</p>
        </div>

        <div className="flex justify-center sm:justify-start mt-8">
          <PrimaryButton onClick={onGeneratePlan}>
            Susun malam ini &rarr;
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
}
