import React, { useState } from 'react';
import ArunaLogo from './ArunaLogo';
import PrimaryButton from './PrimaryButton';
import { TaskDeadline, TaskWorkload } from '@/types';

interface TaskDetailsScreenProps {
  taskTitle: string;
  onComplete: (deadline: TaskDeadline | string, workload: TaskWorkload) => void;
  onAddAnother: (deadline: TaskDeadline | string, workload: TaskWorkload) => void;
}

export default function TaskDetailsScreen({ taskTitle, onComplete, onAddAnother }: TaskDetailsScreenProps) {
  const [deadline, setDeadline] = useState<TaskDeadline | string | null>(null);
  const [workload, setWorkload] = useState<TaskWorkload | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDeadlineSelect = (d: TaskDeadline) => {
    setDeadline(d);
    setShowDatePicker(false);
  };

  const handleCustomDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeadline(e.target.value); // YYYY-MM-DD format
  };

  const handleWorkloadSelect = (w: TaskWorkload) => {
    setWorkload(w);
  };

  return (
    <div className="flex flex-col w-full max-w-[700px] mx-auto px-6 min-h-screen animate-fade-in pb-12">
      <ArunaLogo />
      
      <main className="flex-1 flex flex-col mt-4 sm:mt-8 space-y-12">
        {/* Task Title Header */}
        <div className="text-center sm:text-left bg-white/60 p-6 rounded-2xl border border-stone-200/80 shadow-sm">
          <p className="text-sm text-foreground/60 font-medium uppercase tracking-wider mb-2">Tugas</p>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
            {taskTitle}
          </h2>
        </div>

        {/* Deadline Section */}
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-2xl font-medium text-foreground">Deadline?</h3>
          <div className="flex flex-wrap gap-3">
            {(['besok', 'minggu_ini', 'minggu_depan', 'tidak_ada'] as TaskDeadline[]).map((d) => (
              <button
                key={d}
                onClick={() => handleDeadlineSelect(d)}
                className={`px-6 py-3 rounded-full border transition-all ${
                  deadline === d 
                    ? 'bg-foreground text-background border-foreground shadow-md' 
                    : 'bg-white/60 text-foreground/80 border-stone-200/80 hover:border-stone-300 hover:bg-white'
                }`}
              >
                {d === 'besok' && 'Besok'}
                {d === 'minggu_ini' && 'Minggu ini'}
                {d === 'minggu_depan' && 'Minggu depan'}
                {d === 'tidak_ada' && 'Tidak ada'}
              </button>
            ))}
            <button
              onClick={() => {
                setShowDatePicker(true);
                if (deadline && !['besok', 'minggu_ini', 'minggu_depan', 'tidak_ada'].includes(deadline)) {
                  // already custom
                } else {
                  setDeadline(null); // clear until picked
                }
              }}
              className={`px-6 py-3 rounded-full border transition-all ${
                showDatePicker || (deadline && !['besok', 'minggu_ini', 'minggu_depan', 'tidak_ada'].includes(deadline))
                  ? 'bg-foreground text-background border-foreground shadow-md' 
                  : 'bg-white/60 text-foreground/80 border-stone-200/80 hover:border-stone-300 hover:bg-white'
              }`}
            >
              Pilih tanggal
            </button>
          </div>
          {showDatePicker && (
            <div className="mt-4 animate-fade-in">
              <input 
                type="date" 
                onChange={handleCustomDateSelect}
                className="px-6 py-3 rounded-xl border border-stone-200/80 bg-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
          )}
        </div>

        {/* Workload Section (Progressive Disclosure) */}
        {deadline && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-2xl font-medium text-foreground">Seberapa banyak?</h3>
            <div className="flex flex-wrap gap-3">
              {(['sedikit', 'sedang', 'banyak', 'belum_tahu'] as TaskWorkload[]).map((w) => (
                <button
                  key={w}
                  onClick={() => handleWorkloadSelect(w)}
                  className={`px-6 py-3 rounded-full border transition-all ${
                    workload === w 
                      ? 'bg-foreground text-background border-foreground shadow-md' 
                      : 'bg-white/60 text-foreground/80 border-stone-200/80 hover:border-stone-300 hover:bg-white'
                  }`}
                >
                  {w === 'sedikit' && 'Sedikit'}
                  {w === 'sedang' && 'Sedang'}
                  {w === 'banyak' && 'Banyak'}
                  {w === 'belum_tahu' && 'Belum tahu'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Section (Progressive Disclosure) */}
        {deadline && workload && (
          <div className="pt-8 border-t border-stone-200/60 animate-fade-in space-y-6">
            <h3 className="text-2xl font-medium text-foreground">Tambah lagi?</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onAddAnother(deadline, workload)}
                className="px-8 py-4 rounded-full font-medium transition-all duration-300 ease-in-out border border-stone-300 bg-white hover:bg-stone-50 text-foreground shadow-sm"
              >
                + Tambah task
              </button>
              <PrimaryButton onClick={() => onComplete(deadline, workload)}>
                Lanjut &rarr;
              </PrimaryButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
