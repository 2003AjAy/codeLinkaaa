import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions table (for interview/teaching sessions)
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  mode: text('mode').notNull().$type<'interview' | 'teaching'>(),
  hostId: uuid('host_id').references(() => users.id).notNull(),
  code: text('code').default(''),
  language: text('language').default('javascript'),
  isActive: boolean('is_active').default(true),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Session participants
export const sessionParticipants = pgTable('session_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: text('role').notNull().$type<'host' | 'interviewer' | 'candidate' | 'teacher' | 'student'>(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'),
});

// Questions/Problems for sessions
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  constraints: jsonb('constraints').$type<string[]>().default([]),
  examples: jsonb('examples').$type<{ input: string; output: string; explanation: string }[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Session notes
export const sessionNotes = pgTable('session_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Code execution history
export const codeExecutions = pgTable('code_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  code: text('code').notNull(),
  language: text('language').notNull(),
  output: text('output'),
  error: text('error'),
  executionTime: integer('execution_time'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  hostedSessions: many(sessions),
  participations: many(sessionParticipants),
  notes: many(sessionNotes),
  executions: many(codeExecutions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  host: one(users, {
    fields: [sessions.hostId],
    references: [users.id],
  }),
  participants: many(sessionParticipants),
  questions: many(questions),
  notes: many(sessionNotes),
  executions: many(codeExecutions),
}));

export const sessionParticipantsRelations = relations(sessionParticipants, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionParticipants.sessionId],
    references: [sessions.id],
  }),
  user: one(users, {
    fields: [sessionParticipants.userId],
    references: [users.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  session: one(sessions, {
    fields: [questions.sessionId],
    references: [sessions.id],
  }),
}));

export const sessionNotesRelations = relations(sessionNotes, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionNotes.sessionId],
    references: [sessions.id],
  }),
  user: one(users, {
    fields: [sessionNotes.userId],
    references: [users.id],
  }),
}));

export const codeExecutionsRelations = relations(codeExecutions, ({ one }) => ({
  session: one(sessions, {
    fields: [codeExecutions.sessionId],
    references: [sessions.id],
  }),
  user: one(users, {
    fields: [codeExecutions.userId],
    references: [users.id],
  }),
}));
