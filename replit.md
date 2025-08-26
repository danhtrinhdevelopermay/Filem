# File Storage Application

## Overview

This is a full-stack file storage and management application built with React, Express.js, and PostgreSQL. The application allows users to register, authenticate, upload files, and manage their file storage with a modern, responsive interface. It features secure file handling with metadata storage and implements session-based authentication with Passport.js.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**Android App Development (August 26, 2025)**
- Added Capacitor integration to convert React web app to Android APK
- Created comprehensive GitHub Actions workflows for automated APK building
- Set up both debug and signed release build processes
- Added Android-specific configurations and permissions
- Created build scripts and documentation for mobile deployment
- Fixed Java version compatibility issue (GitHub Actions: Java 17 → Java 21)
- **Latest Fix**: Resolved GitHub Actions APK build failures:
  - Increased Gradle memory allocation (1536m → 4096m)
  - Added parallel builds and caching optimization
  - Enhanced CI configuration with timeout protection
  - Fixed repository dependencies and SDK license handling
  - Added stacktrace debugging for better error reporting

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/UI component library with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS for utility-first styling with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Password Security**: Node.js crypto module with scrypt for secure password hashing
- **File Upload**: Multer for handling multipart/form-data file uploads with memory storage
- **Session Storage**: PostgreSQL-backed session storage using connect-pg-simple

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Users Table**: Stores user credentials, profile information, and timestamps
- **Files Table**: Stores file metadata (name, size, MIME type) and binary data with user relationships
- **Session Management**: Automated session table creation for authentication persistence

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless for scalable cloud database
- **File Storage**: Database BLOB storage for file data with metadata indexing
- **Session Storage**: PostgreSQL-backed session store for authentication state
- **Connection Pooling**: Neon serverless connection pooling for efficient database access

### Authentication and Authorization
- **Strategy**: Session-based authentication using Passport.js local strategy
- **Password Security**: Salted password hashing with timing-safe comparison
- **Session Management**: Server-side sessions stored in PostgreSQL with secure cookies
- **Route Protection**: Middleware-based authentication checks on protected routes

### External Dependencies
- **Database**: Neon PostgreSQL serverless database for cloud-native data storage
- **Development Tools**: Replit integration with development banner and error overlay
- **Build System**: Vite for fast development and optimized production builds
- **WebSocket Support**: WebSocket constructor for Neon serverless real-time capabilities