"use client";

import React, { useState } from 'react';
import CheckInScreen from '@/components/CheckInScreen';
import ResponseScreen from '@/components/ResponseScreen';
import TaskInputScreen from '@/components/TaskInputScreen';
import TaskDetailsScreen from '@/components/TaskDetailsScreen';
import AvailableTimeScreen from '@/components/AvailableTimeScreen';
import ReviewScreen from '@/components/ReviewScreen';
import DailyPlanScreen from '@/components/DailyPlanScreen';
import { MentalStateId } from '@/data/mentalStates';
import { Task, TaskDeadline, TaskWorkload, DailyPlanItem } from '@/types';
import { generateDailyPlan } from '@/lib/priorityEngine';

type Step = 'check-in' | 'response' | 'task-input' | 'task-details' | 'available-time' | 'review' | 'plan';

export default function Home() {
  const [step, setStep] = useState<Step>('check-in');
  
  // State
  const [mentalState, setMentalState] = useState<MentalStateId | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDraftTitle, setCurrentDraftTitle] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  
  // Computed Plan
  const [generatedPlan, setGeneratedPlan] = useState<{ plan: DailyPlanItem[], unassignedTasks: Task[] } | null>(null);

  // Check-in Handlers
  const handleCheckInComplete = (stateId: MentalStateId) => {
    setMentalState(stateId);
    setStep('response');
  };

  const handleResponseNext = () => {
    setStep('task-input');
  };

  // Task Handlers
  const handleAddTitle = (title: string) => {
    setCurrentDraftTitle(title);
    setStep('task-details');
  };

  const handleTaskDetailsComplete = (deadline: TaskDeadline | string, workload: TaskWorkload) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: currentDraftTitle,
      deadline: deadline as TaskDeadline,
      workload,
      completed: false
    };
    
    setTasks([...tasks, newTask]);
    setStep('available-time');
  };

  const handleTaskDetailsAddAnother = (deadline: TaskDeadline | string, workload: TaskWorkload) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: currentDraftTitle,
      deadline: deadline as TaskDeadline,
      workload,
      completed: false
    };
    
    setTasks([...tasks, newTask]);
    setCurrentDraftTitle('');
    setStep('task-input');
  };

  // Time Handlers
  const handleTimeComplete = (timeStr: string) => {
    setAvailableUntil(timeStr);
    setStep('review');
  };

  // Plan Handlers
  const handleGeneratePlan = () => {
    const result = generateDailyPlan(tasks, mentalState, availableUntil);
    setGeneratedPlan(result);
    setStep('plan');
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {step === 'check-in' && (
        <CheckInScreen onComplete={handleCheckInComplete} />
      )}
      
      {step === 'response' && mentalState && (
        <ResponseScreen 
          selectedId={mentalState} 
          onNext={handleResponseNext} 
        />
      )}

      {step === 'task-input' && (
        <TaskInputScreen onAddTitle={handleAddTitle} />
      )}

      {step === 'task-details' && (
        <TaskDetailsScreen 
          taskTitle={currentDraftTitle}
          onComplete={handleTaskDetailsComplete}
          onAddAnother={handleTaskDetailsAddAnother}
        />
      )}

      {step === 'available-time' && (
        <AvailableTimeScreen onComplete={handleTimeComplete} />
      )}

      {step === 'review' && (
        <ReviewScreen 
          tasks={tasks}
          availableUntil={availableUntil}
          onGeneratePlan={handleGeneratePlan}
        />
      )}

      {step === 'plan' && generatedPlan && (
        <DailyPlanScreen 
          plan={generatedPlan.plan} 
          unassignedTasks={generatedPlan.unassignedTasks} 
        />
      )}
    </div>
  );
}
