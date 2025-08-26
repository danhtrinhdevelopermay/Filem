import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import { insertFileSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // File upload endpoint
  app.post("/api/files/upload", upload.array("files"), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files provided" });
      }

      const uploadedFiles = [];

      for (const file of files) {
        // Validate file data
        const fileData = {
          fileName: file.filename || file.originalname,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          fileData: file.buffer.toString('base64'),
        };

        // Validate with schema
        const validatedFile = insertFileSchema.parse(fileData);

        // Save to database
        const savedFile = await storage.createFile({
          ...validatedFile,
          userId: req.user!.id,
        });

        uploadedFiles.push({
          id: savedFile.id,
          fileName: savedFile.fileName,
          originalName: savedFile.originalName,
          mimeType: savedFile.mimeType,
          fileSize: savedFile.fileSize,
          uploadedAt: savedFile.uploadedAt,
        });
      }

      res.status(201).json({ files: uploadedFiles });
    } catch (error) {
      console.error("File upload error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid file data", errors: error.errors });
      }
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // Get user files
  app.get("/api/files", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userFiles = await storage.getUserFiles(req.user!.id);
      
      // Return files without the actual file data for listing
      const fileList = userFiles.map(file => ({
        id: file.id,
        fileName: file.fileName,
        originalName: file.originalName,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        uploadedAt: file.uploadedAt,
      }));

      res.json({ files: fileList });
    } catch (error) {
      console.error("Get files error:", error);
      res.status(500).json({ message: "Failed to retrieve files" });
    }
  });

  // Preview file
  app.get("/api/files/:fileId/preview", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { fileId } = req.params;
      const file = await storage.getFileById(fileId, req.user!.id);

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      res.setHeader("Content-Type", file.mimeType);
      res.setHeader("Content-Length", file.fileSize);
      
      // Convert base64 back to buffer for preview
      const buffer = Buffer.from(file.fileData, 'base64');
      res.send(buffer);
    } catch (error) {
      console.error("File preview error:", error);
      res.status(500).json({ message: "Preview failed" });
    }
  });

  // Download file
  app.get("/api/files/:fileId/download", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { fileId } = req.params;
      const file = await storage.getFileById(fileId, req.user!.id);

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      res.setHeader("Content-Type", file.mimeType);
      res.setHeader("Content-Length", file.fileSize);
      res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
      
      // Convert base64 back to buffer for download
      const buffer = Buffer.from(file.fileData, 'base64');
      res.send(buffer);
    } catch (error) {
      console.error("File download error:", error);
      res.status(500).json({ message: "Download failed" });
    }
  });

  // Delete file
  app.delete("/api/files/:fileId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { fileId } = req.params;
      const deleted = await storage.deleteFile(fileId, req.user!.id);

      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }

      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("File delete error:", error);
      res.status(500).json({ message: "Delete failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
