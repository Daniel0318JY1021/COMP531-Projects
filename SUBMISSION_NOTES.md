/*
 * Social Network Backend Server with CORS Integration
 * Exercise 18 - Frontend and Backend Integration
 * 
 * This file contains the complete backend implementation with:
 * 1. CORS middleware configuration for cross-origin requests
 * 2. Express server setup with all required endpoints
 * 3. User registration and authentication
 * 4. Articles CRUD operations
 * 5. Session management
 * 6. Proper error handling
 * 
 * Key CORS Configuration:
 * - Origin: http://localhost:4200 (Frontend URL)
 * - Credentials: true (Allows cookies/sessions)
 * - Methods: GET, POST, PUT, DELETE, OPTIONS
 * - Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
 * 
 * Installation and Usage:
 * 1. npm install cors express body-parser
 * 2. npm start (or node index.js)
 * 3. Server runs on http://localhost:3000
 * 4. Frontend should be running on http://localhost:4200
 * 
 * Test Endpoints:
 * - GET / - Server information
 * - POST /register - User registration
 * - POST /login - User login
 * - GET /articles - Get all articles
 * - POST /article - Create new article
 * 
 * Author: Daniel Shi
 * Course: COMP 531
 * Date: November 11, 2025
 */