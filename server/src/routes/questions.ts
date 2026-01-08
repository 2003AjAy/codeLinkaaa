import { Router } from 'express';
import { db, questions } from '../db';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all questions for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionQuestions = await db.select()
      .from(questions)
      .where(eq(questions.sessionId, sessionId));
    res.json({ success: true, data: sessionQuestions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch questions' });
  }
});

// Get question by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await db.select().from(questions).where(eq(questions.id, id));

    if (question.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    res.json({ success: true, data: question[0] });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch question' });
  }
});

// Create question
router.post('/', async (req, res) => {
  try {
    const { sessionId, title, description, constraints, examples } = req.body;

    if (!sessionId || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'sessionId, title, and description are required',
      });
    }

    const newQuestion = await db.insert(questions).values({
      sessionId,
      title,
      description,
      constraints: constraints || [],
      examples: examples || [],
    }).returning();

    res.status(201).json({ success: true, data: newQuestion[0] });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ success: false, error: 'Failed to create question' });
  }
});

// Update question
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, constraints, examples } = req.body;

    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (constraints !== undefined) updateData.constraints = constraints;
    if (examples !== undefined) updateData.examples = examples;

    const updatedQuestion = await db.update(questions)
      .set(updateData)
      .where(eq(questions.id, id))
      .returning();

    if (updatedQuestion.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    res.json({ success: true, data: updatedQuestion[0] });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ success: false, error: 'Failed to update question' });
  }
});

// Delete question
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedQuestion = await db.delete(questions)
      .where(eq(questions.id, id))
      .returning();

    if (deletedQuestion.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    res.json({ success: true, data: deletedQuestion[0] });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ success: false, error: 'Failed to delete question' });
  }
});

export default router;
