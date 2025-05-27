import { db, ApologyLetters, Users, UserLetters } from 'astro:db';

export default async function() {
  // Seed sample users
  await db.insert(Users).values([
    { 
      id: 1, 
      email: "user@example.com", 
      name: "Sample User",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { 
      id: 2, 
      email: "admin@example.com", 
      name: "Admin User",
      createdAt: new Date(),
      updatedAt: new Date()
    },
  ]);

  // Seed sample apology letters
  await db.insert(ApologyLetters).values([
    {
      id: 1,
      title: "Apology for Being Late",
      content: "I sincerely apologize for being late to our meeting. I understand that your time is valuable and I should have been more punctual.",
      recipient: "boss",
      tone: "formal",
      situation: "late",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      title: "Apology to Friend",
      content: "Hey, I'm really sorry about what happened yesterday. I didn't mean to hurt your feelings and I hope we can work things out.",
      recipient: "friend",
      tone: "casual",
      situation: "misunderstanding",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      title: "Professional Apology",
      content: "I would like to formally apologize for the error in the report. I take full responsibility and will ensure this doesn't happen again.",
      recipient: "client",
      tone: "professional",
      situation: "mistake",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Seed user-letter relationships
  await db.insert(UserLetters).values([
    {
      id: 1,
      userId: 1,
      letterId: 1,
      customContent: "Modified version with personal details added.",
      createdAt: new Date()
    },
    {
      id: 2,
      userId: 1,
      letterId: 2,
      createdAt: new Date()
    }
  ]);
} 