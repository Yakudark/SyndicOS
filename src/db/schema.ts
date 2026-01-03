import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  displayName: text('display_name').default('Agent'),
  monthlyQuotaMinutes: integer('monthly_quota_minutes').default(2100), // 35h
  themeVariant: text('theme_variant').default('cyan'), // 'cyan' | 'pink' | 'purple'
});

export const meetings = sqliteTable('meetings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startAt: integer('start_at', { mode: 'timestamp' }).notNull(),
  endAt: integer('end_at', { mode: 'timestamp' }).notNull(),
});

export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  meetingId: integer('meeting_id').references(() => meetings.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
});

export const timeEntries = sqliteTable('time_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }),
  minutes: integer('minutes').default(0),
  meetingId: integer('meeting_id').references(() => meetings.id),
});

export const documents = sqliteTable('documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'PV', 'CONTRAT', 'FACTURE', 'AUTRE'
  uri: text('uri').notNull(),
  size: integer('size'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
});
