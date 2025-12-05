import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Todo types (7 types as per Life Notes app)
export type TodoType = 
  | 'task'      // General tasks
  | 'goal'      // Long-term goals
  | 'habit'     // Daily habits
  | 'reminder'  // Time-based reminders
  | 'shopping'  // Shopping list items
  | 'idea'      // Ideas to explore
  | 'bookmark'; // Links/resources to save

// Priority levels
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Todo interface
interface Todo {
  id: string;
  type: TodoType;
  title: string;
  description: string;
  priority: Priority;
  isCompleted: boolean;
  dueDate: string | null;
  tags: string[];
  // Type-specific fields
  habitFrequency?: 'daily' | 'weekly' | 'monthly'; // For habits
  reminderTime?: string;  // For reminders
  url?: string;           // For bookmarks
  quantity?: number;      // For shopping
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

// Temporary in-memory storage (will be replaced with PostgreSQL in Week 2)
const todos: Todo[] = [];

// GET /api/todos - Get all todos
router.get('/', (req: Request, res: Response): void => {
  const { type, priority, completed, tag, search, dueBefore, dueAfter } = req.query;
  
  let filtered = [...todos];
  
  // Filter by type
  if (type) {
    filtered = filtered.filter(t => t.type === type);
  }
  
  // Filter by priority
  if (priority) {
    filtered = filtered.filter(t => t.priority === priority);
  }
  
  // Filter by completion status
  if (completed !== undefined) {
    filtered = filtered.filter(t => t.isCompleted === (completed === 'true'));
  }
  
  // Filter by tag
  if (tag) {
    filtered = filtered.filter(t => t.tags.includes(tag as string));
  }
  
  // Search in title and description
  if (search) {
    const searchLower = (search as string).toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Filter by due date range
  if (dueBefore) {
    filtered = filtered.filter(t => 
      t.dueDate && new Date(t.dueDate) <= new Date(dueBefore as string)
    );
  }
  if (dueAfter) {
    filtered = filtered.filter(t => 
      t.dueDate && new Date(t.dueDate) >= new Date(dueAfter as string)
    );
  }
  
  // Sort: incomplete first, then by priority, then by dueDate
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  filtered.sort((a, b) => {
    // Completed items last
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    // Then by priority
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // Then by due date (null dates last)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  res.json({
    success: true,
    data: filtered,
    meta: {
      total: filtered.length,
      byType: {
        task: filtered.filter(t => t.type === 'task').length,
        goal: filtered.filter(t => t.type === 'goal').length,
        habit: filtered.filter(t => t.type === 'habit').length,
        reminder: filtered.filter(t => t.type === 'reminder').length,
        shopping: filtered.filter(t => t.type === 'shopping').length,
        idea: filtered.filter(t => t.type === 'idea').length,
        bookmark: filtered.filter(t => t.type === 'bookmark').length,
      },
      completed: filtered.filter(t => t.isCompleted).length,
      pending: filtered.filter(t => !t.isCompleted).length,
    },
  });
});

// GET /api/todos/types - Get available todo types
router.get('/types', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: [
      { type: 'task', label: 'Task', icon: '✅', description: 'General tasks to complete' },
      { type: 'goal', label: 'Goal', icon: '🎯', description: 'Long-term goals to achieve' },
      { type: 'habit', label: 'Habit', icon: '🔄', description: 'Daily/weekly habits to track' },
      { type: 'reminder', label: 'Reminder', icon: '⏰', description: 'Time-based reminders' },
      { type: 'shopping', label: 'Shopping', icon: '🛒', description: 'Shopping list items' },
      { type: 'idea', label: 'Idea', icon: '💡', description: 'Ideas to explore later' },
      { type: 'bookmark', label: 'Bookmark', icon: '🔖', description: 'Links and resources' },
    ],
  });
});

// GET /api/todos/:id - Get single todo
router.get('/:id', (req: Request, res: Response): void => {
  const todo = todos.find((t) => t.id === req.params.id);
  
  if (!todo) {
    res.status(404).json({
      success: false,
      error: { message: 'Todo not found' },
    });
    return;
  }

  res.json({
    success: true,
    data: todo,
  });
});

// POST /api/todos - Create todo
router.post('/', (req: Request, res: Response): void => {
  const { 
    type = 'task',
    title, 
    description = '',
    priority = 'medium',
    dueDate = null,
    tags = [],
    // Type-specific
    habitFrequency,
    reminderTime,
    url,
    quantity,
  } = req.body;

  if (!title) {
    res.status(400).json({
      success: false,
      error: { message: 'Title is required' },
    });
    return;
  }

  // Validate type
  const validTypes: TodoType[] = ['task', 'goal', 'habit', 'reminder', 'shopping', 'idea', 'bookmark'];
  if (!validTypes.includes(type)) {
    res.status(400).json({
      success: false,
      error: { message: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
    });
    return;
  }

  const todo: Todo = {
    id: uuidv4(),
    type,
    title,
    description,
    priority,
    isCompleted: false,
    dueDate,
    tags,
    ...(type === 'habit' && { habitFrequency: habitFrequency || 'daily' }),
    ...(type === 'reminder' && { reminderTime }),
    ...(type === 'bookmark' && { url }),
    ...(type === 'shopping' && { quantity: quantity || 1 }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  };

  todos.push(todo);

  res.status(201).json({
    success: true,
    data: todo,
  });
});

// PUT /api/todos/:id - Update todo
router.put('/:id', (req: Request, res: Response): void => {
  const index = todos.findIndex((t) => t.id === req.params.id);
  
  if (index === -1) {
    res.status(404).json({
      success: false,
      error: { message: 'Todo not found' },
    });
    return;
  }

  const { 
    title, 
    description, 
    priority, 
    isCompleted, 
    dueDate, 
    tags,
    habitFrequency,
    reminderTime,
    url,
    quantity,
  } = req.body;

  // Handle completion status change
  let completedAt = todos[index].completedAt;
  if (isCompleted !== undefined) {
    if (isCompleted && !todos[index].isCompleted) {
      completedAt = new Date().toISOString();
    } else if (!isCompleted) {
      completedAt = null;
    }
  }

  todos[index] = {
    ...todos[index],
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(priority !== undefined && { priority }),
    ...(isCompleted !== undefined && { isCompleted }),
    ...(dueDate !== undefined && { dueDate }),
    ...(tags !== undefined && { tags }),
    ...(habitFrequency !== undefined && { habitFrequency }),
    ...(reminderTime !== undefined && { reminderTime }),
    ...(url !== undefined && { url }),
    ...(quantity !== undefined && { quantity }),
    completedAt,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: todos[index],
  });
});

// PATCH /api/todos/:id/complete - Toggle completion
router.patch('/:id/complete', (req: Request, res: Response): void => {
  const index = todos.findIndex((t) => t.id === req.params.id);
  
  if (index === -1) {
    res.status(404).json({
      success: false,
      error: { message: 'Todo not found' },
    });
    return;
  }

  const newCompleted = !todos[index].isCompleted;
  todos[index] = {
    ...todos[index],
    isCompleted: newCompleted,
    completedAt: newCompleted ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: todos[index],
  });
});

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', (req: Request, res: Response): void => {
  const index = todos.findIndex((t) => t.id === req.params.id);
  
  if (index === -1) {
    res.status(404).json({
      success: false,
      error: { message: 'Todo not found' },
    });
    return;
  }

  const deleted = todos.splice(index, 1)[0];

  res.json({
    success: true,
    data: deleted,
    message: 'Todo deleted successfully',
  });
});

export default router;
