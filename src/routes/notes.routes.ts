import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Note interface
interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Temporary in-memory storage (will be replaced with PostgreSQL in Week 2)
const notes: Note[] = [];

// GET /api/notes - Get all notes
router.get('/', (req: Request, res: Response) => {
  const { tag, pinned, search } = req.query;
  
  let filtered = [...notes];
  
  // Filter by tag
  if (tag) {
    filtered = filtered.filter(n => n.tags.includes(tag as string));
  }
  
  // Filter by pinned status
  if (pinned !== undefined) {
    filtered = filtered.filter(n => n.isPinned === (pinned === 'true'));
  }
  
  // Search in title and content
  if (search) {
    const searchLower = (search as string).toLowerCase();
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(searchLower) ||
      n.content.toLowerCase().includes(searchLower)
    );
  }
  
  // Sort: pinned first, then by updatedAt
  filtered.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  res.json({
    success: true,
    data: filtered,
    meta: {
      total: filtered.length,
    },
  });
});

// GET /api/notes/:id - Get single note
router.get('/:id', (req: Request, res: Response) => {
  const note = notes.find((n) => n.id === req.params.id);
  
  if (!note) {
    return res.status(404).json({
      success: false,
      error: { message: 'Note not found' },
    });
  }

  res.json({
    success: true,
    data: note,
  });
});

// POST /api/notes - Create note
router.post('/', (req: Request, res: Response) => {
  const { title, content = '', tags = [], isPinned = false } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      error: { message: 'Title is required' },
    });
  }

  const note: Note = {
    id: uuidv4(),
    title,
    content,
    tags,
    isPinned,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  notes.push(note);

  res.status(201).json({
    success: true,
    data: note,
  });
});

// PUT /api/notes/:id - Update note
router.put('/:id', (req: Request, res: Response) => {
  const index = notes.findIndex((n) => n.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { message: 'Note not found' },
    });
  }

  const { title, content, tags, isPinned } = req.body;

  notes[index] = {
    ...notes[index],
    ...(title !== undefined && { title }),
    ...(content !== undefined && { content }),
    ...(tags !== undefined && { tags }),
    ...(isPinned !== undefined && { isPinned }),
    updatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: notes[index],
  });
});

// DELETE /api/notes/:id - Delete note
router.delete('/:id', (req: Request, res: Response) => {
  const index = notes.findIndex((n) => n.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { message: 'Note not found' },
    });
  }

  const deleted = notes.splice(index, 1)[0];

  res.json({
    success: true,
    data: deleted,
    message: 'Note deleted successfully',
  });
});

export default router;
