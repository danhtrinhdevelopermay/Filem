import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      console.log("LocalStrategy: Attempting authentication for username:", username);
      
      try {
        const user = await storage.getUserByUsername(username);
        console.log("LocalStrategy: User found:", user ? "Yes" : "No");
        
        if (!user) {
          console.log("LocalStrategy: User not found in database");
          return done(null, false);
        }
        
        const passwordMatch = await comparePasswords(password, user.password);
        console.log("LocalStrategy: Password match:", passwordMatch);
        
        if (!passwordMatch) {
          console.log("LocalStrategy: Password does not match");
          return done(null, false);
        }
        
        console.log("LocalStrategy: Authentication successful for user:", user.username);
        return done(null, user);
      } catch (error) {
        console.error("LocalStrategy: Error during authentication:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", (req, res, next) => {
    // Validate request body
    if (!req.body || !req.body.username || !req.body.password) {
      console.log("Login attempt with missing credentials");
      return res.status(400).json({ error: "Username and password are required" });
    }

    console.log("Login attempt for username:", req.body.username);
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      
      if (!user) {
        console.log("Login failed for username:", req.body.username, "- Invalid credentials");
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      req.login(user, (err: any) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ error: "Login failed" });
        }
        console.log("Login successful for user:", user.username);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
