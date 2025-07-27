import { useState } from 'react';

interface Task {
    id: number;
    text: string;
}

export function useTodo() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskInput, setTaskInput] = useState('');

    const addTask = () => {
        if (!taskInput.trim()) return;
        const newTask: Task = { id: Date.now(), text: taskInput };
        setTasks([...tasks, newTask]);
        setTaskInput('');
    };

    const removeTask = (id: number) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    return {
        tasks,
        taskInput,
        setTaskInput,
        addTask,
        removeTask,
    };
}
