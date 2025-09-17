import { pgTable, uuid, varchar, timestamp, boolean, jsonb, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 6 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  hostGithubId: varchar('host_github_id'),
  active: boolean('active').default(true).notNull(),
})

export const participants = pgTable('participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  userId: varchar('user_id').notNull(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueParticipantSession: uniqueIndex('unique_participant_session').on(table.sessionId, table.userId),
}))

export const responses = pgTable('responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  participantId: uuid('participant_id').references(() => participants.id).notNull(),
  title: varchar('title').notNull(),
  preferredLlm: varchar('preferred_llm').notNull(),
  preferredFramework: varchar('preferred_framework').notNull(),
  location: varchar('location').notNull(),
  jobHunting: boolean('job_hunting').notNull(),
  funAnswers: jsonb('fun_answers'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const activity = pgTable('activity', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  message: varchar('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const sessionsRelations = relations(sessions, ({ many }) => ({
  participants: many(participants),
  responses: many(responses),
  activity: many(activity),
}))

export const participantsRelations = relations(participants, ({ one, many }) => ({
  session: one(sessions, {
    fields: [participants.sessionId],
    references: [sessions.id],
  }),
  responses: many(responses),
}))

export const responsesRelations = relations(responses, ({ one }) => ({
  session: one(sessions, {
    fields: [responses.sessionId],
    references: [sessions.id],
  }),
  participant: one(participants, {
    fields: [responses.participantId],
    references: [participants.id],
  }),
}))

export const activityRelations = relations(activity, ({ one }) => ({
  session: one(sessions, {
    fields: [activity.sessionId],
    references: [sessions.id],
  }),
}))

// Types
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Participant = typeof participants.$inferSelect
export type NewParticipant = typeof participants.$inferInsert
export type Response = typeof responses.$inferSelect
export type NewResponse = typeof responses.$inferInsert
export type Activity = typeof activity.$inferSelect
export type NewActivity = typeof activity.$inferInsert
