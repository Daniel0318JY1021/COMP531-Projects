# Frontend Integration with Backend

This project has been updated to integrate with your backend server for the CORS exercise.

## Setup Instructions

### 1. Start the Frontend (Current Directory)
```bash
# Install dependencies if needed
npm install

# Start the Angular development server
npm start
```

The frontend will run on `http://localhost:4200`

### 2. Start Your Backend Server
Navigate to your backend directory and start it:
```bash
# Example commands (adjust based on your backend setup)
cd ../backend  # or wherever your backend is located
npm install
npm start
```

Make sure your backend runs on `http://localhost:3000`

### 3. Expected CORS Error
When you first try to use the frontend to call the backend, you'll see CORS errors in the browser console.

### 4. Backend CORS Configuration
You need to add CORS middleware to your backend. Here's what to add to your backend's `index.js`:

```javascript
// Install cors package first
// npm install cors --save

const cors = require('cors');

// Add CORS middleware
app.use(cors({
    origin: 'http://localhost:4200',  // Frontend URL
    credentials: true,  // Allow cookies/sessions
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

## Testing API Endpoints

Once your backend is running with CORS enabled, you can:

1. **Register a new user**: Use the registration form
2. **Login**: Use the login form  
3. **Test API endpoints**: Click the "Test Backend Connection" button in the main page
4. **Create articles**: Use the article creation form
5. **View articles**: Check if articles load properly

## Expected API Endpoints

Your backend should support:
- `POST /register` - User registration
- `POST /login` - User login
- `GET /articles` - Get all articles
- `POST /article` - Create a new article

## Debugging Tips

1. Open Chrome DevTools (F12)
2. Check the Console tab for any errors
3. Check the Network tab to see if requests are being made
4. Use the "Test Backend Connection" button to verify connectivity

## What's Changed

- Updated `AuthService` to connect to localhost backend instead of JSONPlaceholder
- Added `ArticlesService` for article-related API calls
- Updated main component with API testing functionality
- Added article creation and viewing capabilities
- All HTTP requests include `withCredentials: true` for session management

## Assignment Submission

After successfully integrating frontend and backend:
1. Ensure CORS is properly configured in your backend
2. Test all the endpoints (register, login, articles)
3. Submit your backend `index.js` file with CORS middleware to Canvas