import { defineDb, defineTable, column } from 'astro:db';

// Define tables for the apology letter application
const ApologyLetters = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
    content: column.text(),
    recipient: column.text(),
    tone: column.text(),
    situation: column.text(),
    createdAt: column.date({ default: new Date() }),
    updatedAt: column.date({ default: new Date() }),
  }
});

const Users = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    email: column.text({ unique: true }),
    name: column.text(),
    createdAt: column.date({ default: new Date() }),
    updatedAt: column.date({ default: new Date() }),
  }
});

const UserLetters = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    userId: column.number({ references: () => Users.columns.id }),
    letterId: column.number({ references: () => ApologyLetters.columns.id }),
    customContent: column.text({ optional: true }),
    createdAt: column.date({ default: new Date() }),
  }
});

export default defineDb({
  tables: { 
    ApologyLetters,
    Users,
    UserLetters,
  },
}); 