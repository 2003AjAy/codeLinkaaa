import { Router } from 'express';
import { db, sessions, sessionParticipants, users } from '../db';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Get all sessions
router.get('/', async (_req, res) => {
  try {
    const allSessions = await db.select().from(sessions);
    res.json({ success: true, data: allSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
});

// Get active sessions
router.get('/active', async (_req, res) => {
  try {
    const activeSessions = await db.select()
      .from(sessions)
      .where(eq(sessions.isActive, true));
    res.json({ success: true, data: activeSessions });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch active sessions' });
  }
});

// Get session by ID with participants
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const session = await db.select().from(sessions).where(eq(sessions.id, id));

    if (session.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const participants = await db.select({
      id: sessionParticipants.id,
      role: sessionParticipants.role,
      joinedAt: sessionParticipants.joinedAt,
      leftAt: sessionParticipants.leftAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
      },
    })
      .from(sessionParticipants)
      .leftJoin(users, eq(sessionParticipants.userId, users.id))
      .where(eq(sessionParticipants.sessionId, id));

    res.json({
      success: true,
      data: {
        ...session[0],
        participants,
      },
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch session' });
  }
});

// Create session
router.post('/', async (req, res) => {
  try {
    const { title, mode, hostId, code, language } = req.body;

    if (!title || !mode || !hostId) {
      return res.status(400).json({
        success: false,
        error: 'Title, mode, and hostId are required',
      });
    }

    if (!['interview', 'teaching'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'Mode must be either "interview" or "teaching"',
      });
    }

    const newSession = await db.insert(sessions).values({
      title,
      mode,
      hostId,
      code: code || '',
      language: language || 'javascript',
    }).returning();

    // Add host as participant
    await db.insert(sessionParticipants).values({
      sessionId: newSession[0].id,
      userId: hostId,
      role: 'host',
    });

    res.status(201).json({ success: true, data: newSession[0] });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ success: false, error: 'Failed to create session' });
  }
});

// Update session (code, language, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, code, language, isActive } = req.body;

    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (code !== undefined) updateData.code = code;
    if (language !== undefined) updateData.language = language;
    if (isActive !== undefined) {
      updateData.isActive = isActive;
      if (!isActive) updateData.endedAt = new Date();
    }

    const updatedSession = await db.update(sessions)
      .set(updateData)
      .where(eq(sessions.id, id))
      .returning();

    if (updatedSession.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data: updatedSession[0] });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ success: false, error: 'Failed to update session' });
  }
});

// Join session
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    // Users joining are always participants (not hosts)
    const role: 'host' | 'participant' = 'participant';

    // Check if session exists and is active
    const session = await db.select().from(sessions).where(eq(sessions.id, id));
    if (session.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    if (!session[0].isActive) {
      return res.status(400).json({ success: false, error: 'Session is not active' });
    }

    // Check if user already in session
    const existing = await db.select()
      .from(sessionParticipants)
      .where(and(
        eq(sessionParticipants.sessionId, id),
        eq(sessionParticipants.userId, userId)
      ));

    if (existing.length > 0 && !existing[0].leftAt) {
      return res.status(400).json({ success: false, error: 'User already in session' });
    }

    const participant = await db.insert(sessionParticipants).values({
      sessionId: id,
      userId,
      role,
    }).returning();

    res.status(201).json({ success: true, data: participant[0] });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({ success: false, error: 'Failed to join session' });
  }
});

// Leave session
router.post('/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const updated = await db.update(sessionParticipants)
      .set({ leftAt: new Date() })
      .where(and(
        eq(sessionParticipants.sessionId, id),
        eq(sessionParticipants.userId, userId)
      ))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error leaving session:', error);
    res.status(500).json({ success: false, error: 'Failed to leave session' });
  }
});

// End session
router.post('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedSession = await db.update(sessions)
      .set({
        isActive: false,
        endedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, id))
      .returning();

    if (updatedSession.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data: updatedSession[0] });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ success: false, error: 'Failed to end session' });
  }
});

// Delete session
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete participants first
    await db.delete(sessionParticipants).where(eq(sessionParticipants.sessionId, id));

    const deletedSession = await db.delete(sessions)
      .where(eq(sessions.id, id))
      .returning();

    if (deletedSession.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data: deletedSession[0] });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ success: false, error: 'Failed to delete session' });
  }
});

export default router;
