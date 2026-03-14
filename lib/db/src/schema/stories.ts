import { pgTable, text, boolean, integer, bigint, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storiesTable = pgTable("stories", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  coverEmoji: text("cover_emoji").notNull(),
  videoUrl: text("video_url"),
  videoFile: text("video_file"),
  quizEnabled: boolean("quiz_enabled").notNull().default(false),
  audioFile: text("audio_file"),
  images: jsonb("images").notNull().default([]).$type<string[]>(),
  voiceRecordings: jsonb("voice_recordings").notNull().default([]).$type<string[]>(),
  isFavorite: boolean("is_favorite").notNull().default(false),
  readCount: integer("read_count").notNull().default(0),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const videoFilesTable = pgTable("video_files", {
  key: text("key").primaryKey(),
  dataBase64: text("data_base64").notNull(),
});

export const insertStorySchema = createInsertSchema(storiesTable);
export const insertVideoFileSchema = createInsertSchema(videoFilesTable);

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof storiesTable.$inferSelect;
export type InsertVideoFile = z.infer<typeof insertVideoFileSchema>;
export type VideoFile = typeof videoFilesTable.$inferSelect;
