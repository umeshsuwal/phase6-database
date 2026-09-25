import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
});

// For comparison, the same model in Prisma (from prisma/schema.prisma):
//
// model User {
//   id       Int       @id @default(autoincrement())
//   name     String
//   email    String    @unique
//   posts    Post[]
//   comments Comment[]
//
//   @@map("users")
// }