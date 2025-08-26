import { users, files, type User, type InsertUser, type File, type InsertFile } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createFile(file: InsertFile & { userId: string }): Promise<File>;
  getUserFiles(userId: string): Promise<File[]>;
  getFileById(fileId: string, userId: string): Promise<File | undefined>;
  deleteFile(fileId: string, userId: string): Promise<boolean>;
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createFile(fileData: InsertFile & { userId: string }): Promise<File> {
    const [file] = await db
      .insert(files)
      .values(fileData)
      .returning();
    return file;
  }

  async getUserFiles(userId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.uploadedAt));
  }

  async getFileById(fileId: string, userId: string): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));
    return file || undefined;
  }

  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
