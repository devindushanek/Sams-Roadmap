import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const documents = sqliteTable('documents', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    content: text('content').notNull(),
    metadata: text('metadata'), // JSON string: { filename, size, type, ... }
    embedding: text('embedding'), // JSON string of number[]
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const tasks = sqliteTable('tasks', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('pending'), // pending, in_progress, completed, failed
    priority: integer('priority').default(0),
    result: text('result'), // Output of the task
    plan: text('plan'), // JSON string of the execution plan
    error: text('error'), // Error message if failed
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const workflows = sqliteTable('workflows', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    definition: text('definition').notNull(), // JSON string defining the workflow steps
    trigger: text('trigger'), // Event that triggers this workflow
    active: integer('active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

// Social media posts from all platforms
export const socialPosts = sqliteTable('social_posts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    platform: text('platform').notNull(), // 'pinterest', 'youtube', 'linkedin', etc.
    platformPostId: text('platform_post_id').notNull(), // ID from the platform
    authorId: text('author_id'),
    authorName: text('author_name'),
    authorAvatar: text('author_avatar'),
    title: text('title'),
    description: text('description'),
    content: text('content'), // Main text content
    media: text('media'), // JSON array of {type, url}
    url: text('url'), // Link to original post
    postedAt: integer('posted_at', { mode: 'timestamp' }),
    fetchedAt: integer('fetched_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    engagement: text('engagement'), // JSON {likes, comments, shares, saves}
    isSaved: integer('is_saved', { mode: 'boolean' }).default(false),
    savedAt: integer('saved_at', { mode: 'timestamp' }),
    tags: text('tags'), // JSON array of tags
    category: text('category'), // 'connections', 'reference', 'watch_later'
});

// OAuth tokens for social platforms
export const socialTokens = sqliteTable('social_tokens', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    platform: text('platform').notNull().unique(), // 'pinterest', 'youtube', etc.
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token'),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    scope: text('scope'), // Permissions granted
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

// User's curated accounts/boards per platform
export const curatedAccounts = sqliteTable('curated_accounts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    platform: text('platform').notNull(),
    accountId: text('account_id').notNull(), // Board ID, channel ID, etc.
    accountName: text('account_name').notNull(),
    accountAvatar: text('account_avatar'),
    category: text('category'), // 'connections', 'reference', 'watch_later'
    priority: integer('priority').default(3), // 1-5, for algorithm weighting
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});
