# Exercise 20: OAuth Login Implementation

This project implements third-party OAuth authentication using Google OAuth 2.0 with Passport.js.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Set authorized redirect URIs to:
   - `http://localhost:3000/auth/google/callback`
6. Copy your Client ID and Client Secret

### 3. Configure Environment Variables

Create a `.env` file or set environment variables:

```bash
# Method 1: Environment variables
export GOOGLE_CLIENT_ID="your_google_client_id_here"
export GOOGLE_CLIENT_SECRET="your_google_client_secret_here"

# Method 2: Or edit index-passport.js directly (not recommended for production)
```

### 4. Start the Server
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

### 5. Test the Application
Visit `http://localhost:3000` and test the OAuth flow.

## 📡 API Endpoints

### Public Endpoints
- `GET /` - Home page with authentication status
- `GET /auth/google` - Start Google OAuth authentication
- `GET /auth/google/callback` - Google OAuth callback (handled automatically)
- `GET /logout` - Logout user
- `GET /health` - Health check

### Protected Endpoints (require authentication)
- `GET /profile` - View user profile
- `GET /api/user` - Get user data as JSON

### Status Endpoints
- `GET /status` - Check authentication status (JSON)
- `GET /success` - Success page after OAuth
- `GET /failure` - Failure page if OAuth fails

## 🔧 OAuth Flow

1. **User clicks "Login with Google"** → Redirects to `/auth/google`
2. **Passport redirects to Google** → User sees Google OAuth consent screen
3. **User grants permission** → Google redirects to `/auth/google/callback`
4. **Passport processes callback** → Creates user session
5. **User is authenticated** → Redirected to success page

## 🛠️ Technical Implementation

### Key Features
- **Passport.js Integration**: Complete OAuth 2.0 flow
- **Session Management**: Express sessions with cookie storage
- **User Serialization**: Proper user object handling
- **Error Handling**: Comprehensive error pages and logging
- **Security**: CORS configuration and session security
- **Development Friendly**: Detailed logging and status endpoints

### Security Considerations
- Sessions are configured with secure cookies for production
- CORS is enabled for development (configure for production)
- Client secrets should be stored as environment variables
- User tokens are stored securely in session

## 🧪 Testing OAuth Integration

### Manual Testing Steps
1. Visit `http://localhost:3000`
2. Click "Login with Google"
3. Complete Google OAuth flow
4. Verify user information is displayed
5. Test protected routes
6. Test logout functionality

### API Testing with cURL
```bash
# Check health
curl http://localhost:3000/health

# Check authentication status
curl -b cookies.txt http://localhost:3000/status

# Get user data (after authentication)
curl -b cookies.txt http://localhost:3000/api/user
```

## 🔐 Google OAuth Setup Guide

### Step-by-Step Google Console Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Create Project" or select existing project

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3000/auth/google/callback`

4. **Configure OAuth Consent Screen**
   - Go to "OAuth consent screen"
   - Fill in application name and required fields
   - Add your email to test users (for development)

5. **Copy Credentials**
   - Copy Client ID and Client Secret
   - Set as environment variables or update code

## 🚀 Deployment Notes

For production deployment:
- Set `NODE_ENV=production`
- Use HTTPS and set `secure: true` for cookies
- Configure proper CORS origins
- Store credentials securely (environment variables)
- Update callback URLs to production domain

## 📝 Assignment Requirements Met

✅ **Download backend and install packages**: Express, Passport, OAuth packages installed  
✅ **Choose third-party partner**: Google OAuth implemented  
✅ **Register app with partner**: Instructions provided for Google Console setup  
✅ **Create authentication endpoint**: `/auth/google` endpoint created  
✅ **Handle OAuth callback**: `/auth/google/callback` with session management  
✅ **Add third-party link**: Login links provided on landing page  
✅ **Test OAuth flow**: Complete testing interface provided  

Submit `index-passport.js` to Canvas as requested.

## 🐛 Troubleshooting

### Common Issues
- **"Client ID not found"**: Check Google Console configuration
- **"Redirect URI mismatch"**: Verify callback URL in Google Console
- **"Access blocked"**: Add email to test users in OAuth consent screen
- **Sessions not persisting**: Check cookie configuration

### Debug Mode
Set `DEBUG=passport:*` environment variable for detailed Passport.js logs:
```bash
DEBUG=passport:* npm start
```