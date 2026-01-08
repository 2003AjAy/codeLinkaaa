import { Router } from 'express';
import { db, sessionNotes } from '../db';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Get all notes for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const notes = await db.select()
      .from(sessionNotes)
      .where(eq(sessionNotes.sessionId, sessionId));
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notes' });
  }
});

// Get notes for a specific user in a session
router.get('/session/:sessionId/user/:userId', async (req, res) => {
  try {
    const { sessionId, userId } = req.params;
    const notes = await db.select()
      .from(sessionNotes)
      .where(and(
        eq(sessionNotes.sessionId, sessionId),
        eq(sessionNotes.userId, userId)
      ));

    if (notes.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: notes[0] });
  } catch (error) {
    console.error('Error fetching user notes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user notes' });
  }
});

// Create or update notes (upsert)
router.post('/', async (req, res) => {
  try {
    const { sessionId, userId, content } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId and userId are required',
      });
    }

    // Check if notes already exist
    const existing = await db.select()
      .from(sessionNotes)
      .where(and(
        eq(sessionNotes.sessionId, sessionId),
        eq(sessionNotes.userId, userId)
      ));

    let result;
    if (existing.length > 0) {
      // Update existing notes
      result = await db.update(sessionNotes)
        .set({
          content: content || '',
          updatedAt: new Date(),
        })
        .where(eq(sessionNotes.id, existing[0].id))
        .returning();
    } else {
      // Create new notes
      result = await db.insert(sessionNotes).values({
        sessionId,
        userId,
        content: content || '',
      }).returning();
    }

    res.status(existing.length > 0 ? 200 : 201).json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('Error saving notes:', error);
    res.status(500).json({ success: false, error: 'Failed to save notes' });
  }
});

// Update notes
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const updatedNotes = await db.update(sessionNotes)
      .set({
        content: content || '',
        updatedAt: new Date(),
      })
      .where(eq(sessionNotes.id, id))
      .returning();

    if (updatedNotes.length === 0) {
      return res.status(404).json({ success: false, error: 'Notes not found' });
    }

    res.json({ success: true, data: updatedNotes[0] });
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({ success: false, error: 'Failed to update notes' });
  }
});

// Delete notes
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNotes = await db.delete(sessionNotes)
      .where(eq(sessionNotes.id, id))
      .returning();

    if (deletedNotes.length === 0) {
      return res.status(404).json({ success: false, error: 'Notes not found' });
    }

    res.json({ success: true, data: deletedNotes[0] });
  } catch (error) {
    console.error('Error deleting notes:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notes' });
  }
});

export default router;
