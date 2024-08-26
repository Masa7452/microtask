'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronDown, ChevronRight, Edit, GripVertical, Plus, RefreshCw, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface MicroTask {
  id: number;
  text: string;
  completed: boolean;
}

interface BigTask {
  id: number;
  title: string;
  microTasks: MicroTask[];
}

const DraggableMicroTask: React.FC<{
  microTask: MicroTask;
  bigTaskId: number;
  index: number;
  moveMicroTask: (dragIndex: number, hoverIndex: number, sourceBigTaskId: number, targetBigTaskId: number) => void;
  toggleMicroTask: (bigTaskId: number, microTaskId: number) => void;
  removeMicroTask: (bigTaskId: number, microTaskId: number) => void;
  editMicroTask: (bigTaskId: number, microTaskId: number, newText: string) => void;
}> = ({ microTask, bigTaskId, index, moveMicroTask, toggleMicroTask, removeMicroTask, editMicroTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(microTask.text);

  const [{ isDragging }, drag] = useDrag({
    type: 'MICROTASK',
    item: { type: 'MICROTASK', microTaskId: microTask.id, bigTaskId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'MICROTASK',
    hover: (item: { microTaskId: number; bigTaskId: number; index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      const sourceBigTaskId = item.bigTaskId;
      const targetBigTaskId = bigTaskId;

      if (dragIndex === hoverIndex && sourceBigTaskId === targetBigTaskId) {
        return;
      }

      moveMicroTask(dragIndex, hoverIndex, sourceBigTaskId, targetBigTaskId);
      item.index = hoverIndex;
      item.bigTaskId = targetBigTaskId;
    },
  });

  const ref = useRef<HTMLLIElement>(null);
  drag(drop(ref));

  return (
    <li ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className="flex items-center mb-2">
      <span className="cursor-move mr-2">
        <GripVertical size={20} />
      </span>
      <Checkbox
        checked={microTask.completed}
        onCheckedChange={() => toggleMicroTask(bigTaskId, microTask.id)}
        className="mr-2"
      />
      {isEditing ? (
        <Input
          type="text"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              editMicroTask(bigTaskId, microTask.id, editedText);
              setIsEditing(false);
            }
          }}
          className="flex-grow mr-2"
          autoFocus
        />
      ) : (
        <span className={`flex-grow ${microTask.completed ? 'line-through' : ''}`}>{microTask.text}</span>
      )}
      {isEditing ? (
        <Button variant="ghost" size="icon" onClick={() => {
          editMicroTask(bigTaskId, microTask.id, editedText);
          setIsEditing(false);
        }}>
          <Check size={20} />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
          <Edit size={20} />
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={() => removeMicroTask(bigTaskId, microTask.id)}>
        <Trash2 size={20} />
      </Button>
    </li>
  );
};

const BigTaskComponent: React.FC<{
  bigTask: BigTask;
  index: number;
  moveBigTask: (dragIndex: number, hoverIndex: number) => void;
  moveMicroTask: (dragIndex: number, hoverIndex: number, sourceBigTaskId: number, targetBigTaskId: number) => void;
  toggleMicroTask: (bigTaskId: number, microTaskId: number) => void;
  removeMicroTask: (bigTaskId: number, microTaskId: number) => void;
  editMicroTask: (bigTaskId: number, microTaskId: number, newText: string) => void;
  removeBigTask: (bigTaskId: number) => void;
  editBigTask: (bigTaskId: number, newTitle: string) => void;
  addMicroTask: (bigTaskId: number, text: string) => void;
}> = ({ bigTask, index, moveBigTask, moveMicroTask, toggleMicroTask, removeMicroTask, editMicroTask, removeBigTask, editBigTask, addMicroTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newMicroTask, setNewMicroTask] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(bigTask.title);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'BIGTASK',
    item: { type: 'BIGTASK', id: bigTask.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'BIGTASK',
    hover: (item: { id: number; index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveBigTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const ref = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    preview(previewRef, { captureDraggingState: true });
  }, [preview]);

  drag(drop(ref));

  const completedMicroTasks = bigTask.microTasks.filter(mt => mt.completed).length;
  const progress = bigTask.microTasks.length > 0 ? (completedMicroTasks / bigTask.microTasks.length) * 100 : 0;

  return (
    <div ref={previewRef} style={{ opacity: isDragging ? 0.5 : 1 }} className="mb-4">
      <div ref={ref} className="flex items-center mb-2 cursor-move">
        <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </Button>
        {isEditing ? (
          <Input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                editBigTask(bigTask.id, editedTitle);
                setIsEditing(false);
              }
            }}
            className="flex-grow mr-2"
            autoFocus
          />
        ) : (
          <span className="flex-grow font-bold">{bigTask.title}</span>
        )}
        <Progress value={progress} className="w-24 mr-2" />
        {isEditing ? (
          <Button variant="ghost" size="icon" onClick={() => {
            editBigTask(bigTask.id, editedTitle);
            setIsEditing(false);
          }}>
            <Check size={20} />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
            <Edit size={20} />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => removeBigTask(bigTask.id)}>
          <Trash2 size={20} />
        </Button>
      </div>
      {isExpanded && (
        <div className="ml-6">
          <ul>
            {bigTask.microTasks.map((microTask, microTaskIndex) => (
              <DraggableMicroTask
                key={microTask.id}
                microTask={microTask}
                bigTaskId={bigTask.id}
                index={microTaskIndex}
                moveMicroTask={moveMicroTask}
                toggleMicroTask={toggleMicroTask}
                removeMicroTask={removeMicroTask}
                editMicroTask={editMicroTask}
              />
            ))}
          </ul>
          <div className="flex mt-2">
            <Input
              type="text"
              value={newMicroTask}
              onChange={(e) => setNewMicroTask(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newMicroTask.trim() !== '') {
                  addMicroTask(bigTask.id, newMicroTask);
                  setNewMicroTask('');
                }
              }}
              placeholder="Add new microtask"
              className="flex-grow mr-2"
            />
            <Button onClick={() => {
              if (newMicroTask.trim() !== '') {
                addMicroTask(bigTask.id, newMicroTask);
                setNewMicroTask('');
              }
            }}>
              <Plus size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const Microtask: React.FC = () => {
  const [bigTasks, setBigTasks] = useState<BigTask[]>([]);
  const [newBigTask, setNewBigTask] = useState('');
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const savedBigTasks = JSON.parse(localStorage.getItem('bigTasks') || '[]') as BigTask[];
    setBigTasks(savedBigTasks);
  }, []);

  useEffect(() => {
    const totalMicroTasks = bigTasks.reduce((sum, bt) => sum + bt.microTasks.length, 0);
    const completedMicroTasks = bigTasks.reduce((sum, bt) => sum + bt.microTasks.filter(mt => mt.completed).length, 0);
    const newProgress = totalMicroTasks > 0 ? (completedMicroTasks / totalMicroTasks) * 100 : 0;
    setProgress(newProgress);

    if (newProgress === 100 && totalMicroTasks > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    localStorage.setItem('bigTasks', JSON.stringify(bigTasks));
  }, [bigTasks]);

  const addBigTask = () => {
    if (newBigTask.trim() !== '') {
      setBigTasks([...bigTasks, { id: Date.now(), title: newBigTask, microTasks: [] }]);
      setNewBigTask('');
    }
  };

  const removeBigTask = (bigTaskId: number) => {
    setBigTasks(bigTasks.filter(bt => bt.id !== bigTaskId));
  };

  const editBigTask = (bigTaskId: number, newTitle: string) => {
    setBigTasks(bigTasks.map(bt => bt.id === bigTaskId ? { ...bt, title: newTitle } : bt));
  };

  const addMicroTask = (bigTaskId: number, text: string) => {
    setBigTasks(bigTasks.map(bt =>
      bt.id === bigTaskId
        ? { ...bt, microTasks: [...bt.microTasks, { id: Date.now(), text, completed: false }] }
        : bt
    ));
  };

  const toggleMicroTask = (bigTaskId: number, microTaskId: number) => {
    setBigTasks(bigTasks.map(bt =>
      bt.id === bigTaskId
        ? { ...bt, microTasks: bt.microTasks.map(mt => mt.id === microTaskId ? { ...mt, completed: !mt.completed } : mt) }
        : bt
    ));
  };

  const removeMicroTask = (bigTaskId: number, microTaskId: number) => {
    setBigTasks(bigTasks.map(bt =>
      bt.id === bigTaskId
        ? { ...bt, microTasks: bt.microTasks.filter(mt => mt.id !== microTaskId) }
        : bt
    ));
  };

  const editMicroTask = (bigTaskId: number, microTaskId: number, newText: string) => {
    setBigTasks(bigTasks.map(bt =>
      bt.id === bigTaskId
        ? { ...bt, microTasks: bt.microTasks.map(mt => mt.id === microTaskId ? { ...mt, text: newText } : mt) }
        : bt
    ));
  };

  const moveBigTask = (dragIndex: number, hoverIndex: number) => {
    const newBigTasks = [...bigTasks];
    const draggedBigTask = newBigTasks[dragIndex];
    newBigTasks.splice(dragIndex, 1);
    newBigTasks.splice(hoverIndex, 0, draggedBigTask);
    setBigTasks(newBigTasks);
  };

  const moveMicroTask = (dragIndex: number, hoverIndex: number, sourceBigTaskId: number, targetBigTaskId: number) => {
    setBigTasks(prevBigTasks => {
      const newBigTasks = [...prevBigTasks];
      const sourceBigTaskIndex = newBigTasks.findIndex(bt => bt.id === sourceBigTaskId);
      const targetBigTaskIndex = newBigTasks.findIndex(bt => bt.id === targetBigTaskId);

      const [movedMicroTask] = newBigTasks[sourceBigTaskIndex].microTasks.splice(dragIndex, 1);
      newBigTasks[targetBigTaskIndex].microTasks.splice(hoverIndex, 0, movedMicroTask);

      return newBigTasks;
    });
  };

  const resetAllTasks = () => {
    setBigTasks(bigTasks.map(bt => ({
      ...bt,
      microTasks: bt.microTasks.map(mt => ({ ...mt, completed: false }))
    })));
  };

  const deleteAllTasks = () => {
    setBigTasks([]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="w-full max-w-md mx-auto">
        {showConfetti && <Confetti />}
        <CardHeader>
          <CardTitle>Microtask</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <Input
              type="text"
              value={newBigTask}
              onChange={(e) => setNewBigTask(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addBigTask();
                }
              }}
              placeholder="Add new big task"
              className="flex-grow mr-2"
            />
            <Button onClick={addBigTask}><Plus size={20} /></Button>
          </div>
          <div className="mb-4">
            <Progress value={progress} className="w-full" />
            <p className="text-center mt-2">{`Overall Progress: ${progress.toFixed(0)}%`}</p>
          </div>
          <div>
            {bigTasks.map((bigTask, index) => (
              <BigTaskComponent
                key={bigTask.id}
                bigTask={bigTask}
                index={index}
                moveBigTask={moveBigTask}
                moveMicroTask={moveMicroTask}
                toggleMicroTask={toggleMicroTask}
                removeMicroTask={removeMicroTask}
                editMicroTask={editMicroTask}
                removeBigTask={removeBigTask}
                editBigTask={editBigTask}
                addMicroTask={addMicroTask}
              />
            ))}
          </div>
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
                    This action cannot be undone. This will permanently delete all your tasks and subtasks.
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
    </DndProvider>
  );
};

export default Microtask;
