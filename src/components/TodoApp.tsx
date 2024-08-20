'use client'

import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]') as Task[];
    setTasks(savedTasks);
  }, []);

  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const newProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    setProgress(newProgress);
  }, [tasks]);

  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (newTask.trim() !== '') {
      const newTaskItem: Task = { id: Date.now(), text: newTask, completed: false };
      const updatedTasks = [...tasks, newTaskItem];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setNewTask('');
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      addTask();
    }
  };

  const toggleTask = (id: number) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const removeTask = (id: number) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const resetAllTasks = () => {
    const updatedTasks = tasks.map(task => ({ ...task, completed: false }));
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteAllTasks = () => {
    setTasks([]);
    localStorage.removeItem('tasks');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Microtasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input
            type="text"
            value={newTask}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add new task"
            className="flex-grow mr-2"
          />
          <Button onClick={addTask}><Plus size={20} /></Button>
        </div>
        <div className="mb-4">
          <Progress value={progress} className="w-full" />
          <p className="text-center mt-2">{`Progress: ${progress.toFixed(0)}%`}</p>
        </div>
        <ul>
          {tasks.map(task => (
            <li key={task.id} className="flex items-center mb-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="mr-2"
              />
              <span className={`flex-grow ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
              <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)}>
                <Trash2 size={20} />
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex flex-col mt-4">
          <Button
            onClick={resetAllTasks}
            className="mb-2"
            variant="outline"
          >
            <RefreshCw size={20} className="mr-2" />
            Reset all tasks
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Trash2 size={20} className="mr-2" />
                Delete all tasks
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your tasks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteAllTasks}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoApp;
