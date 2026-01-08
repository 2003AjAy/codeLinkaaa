import { Router } from 'express';
import { db, users } from '../db';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all users
router.get('/', async (_req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json({ success: true, data: allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.select().from(users).where(eq(users.id, id));

    if (user.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { email, name, avatarUrl } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, error: 'Email and name are required' });
    }

    const newUser = await db.insert(users).values({
      email,
      name,
      avatarUrl,
    }).returning();

    res.status(201).json({ success: true, data: newUser[0] });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, avatarUrl } = req.body;

    const updatedUser = await db.update(users)
      .set({
        ...(email && { email }),
        ...(name && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (updatedUser.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: updatedUser[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await db.delete(users)
      .where(eq(users.id, id))
      .returning();

    if (deletedUser.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: deletedUser[0] });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

export default router;
