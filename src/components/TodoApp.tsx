'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  saved: boolean;
}

const TodoApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('savedTasks') || '[]') as Task[];
    setTasks(savedTasks);
  }, []);

  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const newProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    setProgress(newProgress);
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim() !== '') {
      const newTaskItem: Task = { id: Date.now(), text: newTask, completed: false, saved: false };
      setTasks([...tasks, newTaskItem]);
      setNewTask('');
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      addTask();
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const removeTask = (id: number) => {
    const taskToRemove = tasks.find(task => task.id === id);
    if (taskToRemove && taskToRemove.saved) {
      const savedTasks = JSON.parse(localStorage.getItem('savedTasks') || '[]') as Task[];
      const updatedSavedTasks = savedTasks.filter(task => task.id !== id);
      localStorage.setItem('savedTasks', JSON.stringify(updatedSavedTasks));
    }
    setTasks(tasks.filter(task => task.id !== id));
  };

  const saveTask = (id: number) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, saved: true } : task
    );
    setTasks(updatedTasks);
    const savedTasks = updatedTasks.filter(task => task.saved);
    localStorage.setItem('savedTasks', JSON.stringify(savedTasks));
  };

  const unsaveTask = (id: number) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, saved: false } : task
    );
    setTasks(updatedTasks);
    const savedTasks = updatedTasks.filter(task => task.saved);
    localStorage.setItem('savedTasks', JSON.stringify(savedTasks));
  };

  const resetAllTasks = () => {
    setTasks(tasks.map(task => ({ ...task, completed: false })));
  };

  const deleteAllTasks = () => {
    setTasks([]);
    localStorage.removeItem('savedTasks');
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
              <Button variant="ghost" size="icon" onClick={() => task.saved ? unsaveTask(task.id) : saveTask(task.id)}>
                {task.saved ? <X size={20} /> : <Save size={20} />}
              </Button>
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
          <Button
            onClick={deleteAllTasks}
            variant="outline"
          >
            <Trash2 size={20} className="mr-2" />
            Delete all tasks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoApp;
