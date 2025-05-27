import { db, ApologyLetters, Users, UserLetters, eq, like, and } from 'astro:db';

// User operations
export async function createUser(email: string, name: string) {
  const result = await db.insert(Users).values({
    email,
    name,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();
  
  return result[0];
}

export async function getUserByEmail(email: string) {
  const users = await db.select().from(Users).where(eq(Users.email, email));
  return users[0] || null;
}

export async function getUserById(id: number) {
  const users = await db.select().from(Users).where(eq(Users.id, id));
  return users[0] || null;
}

// Apology letter operations
export async function getAllApologyLetters() {
  return await db.select().from(ApologyLetters);
}

export async function getApologyLettersByRecipient(recipient: string) {
  return await db.select().from(ApologyLetters).where(eq(ApologyLetters.recipient, recipient));
}

export async function getApologyLettersByTone(tone: string) {
  return await db.select().from(ApologyLetters).where(eq(ApologyLetters.tone, tone));
}

export async function searchApologyLetters(searchTerm: string) {
  return await db.select().from(ApologyLetters).where(
    like(ApologyLetters.content, `%${searchTerm}%`)
  );
}

export async function createApologyLetter(data: {
  title: string;
  content: string;
  recipient: string;
  tone: string;
  situation: string;
}) {
  const result = await db.insert(ApologyLetters).values({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();
  
  return result[0];
}

export async function getApologyLetterById(id: number) {
  const letters = await db.select().from(ApologyLetters).where(eq(ApologyLetters.id, id));
  return letters[0] || null;
}

// User letter operations
export async function saveUserLetter(userId: number, letterId: number, customContent?: string) {
  const result = await db.insert(UserLetters).values({
    userId,
    letterId,
    customContent,
    createdAt: new Date()
  }).returning();
  
  return result[0];
}

export async function getUserLetters(userId: number) {
  return await db.select({
    id: UserLetters.id,
    customContent: UserLetters.customContent,
    createdAt: UserLetters.createdAt,
    letter: {
      id: ApologyLetters.id,
      title: ApologyLetters.title,
      content: ApologyLetters.content,
      recipient: ApologyLetters.recipient,
      tone: ApologyLetters.tone,
      situation: ApologyLetters.situation
    }
  })
  .from(UserLetters)
  .innerJoin(ApologyLetters, eq(UserLetters.letterId, ApologyLetters.id))
  .where(eq(UserLetters.userId, userId));
}

// Advanced search with filters
export async function searchLettersWithFilters(filters: {
  recipient?: string;
  tone?: string;
  situation?: string;
  searchTerm?: string;
}) {
  const conditions = [];
  
  if (filters.recipient) {
    conditions.push(eq(ApologyLetters.recipient, filters.recipient));
  }
  
  if (filters.tone) {
    conditions.push(eq(ApologyLetters.tone, filters.tone));
  }
  
  if (filters.situation) {
    conditions.push(eq(ApologyLetters.situation, filters.situation));
  }
  
  if (filters.searchTerm) {
    conditions.push(like(ApologyLetters.content, `%${filters.searchTerm}%`));
  }
  
  if (conditions.length > 0) {
    return await db.select().from(ApologyLetters).where(and(...conditions));
  }
  
  return await db.select().from(ApologyLetters);
} 