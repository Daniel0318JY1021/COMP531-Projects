const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// Middleware setup
app.use(cors({
    origin: true, // Allow all origins for development
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: 'doNotGuessTheSecret-comp531-exercise23',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser(function (user, done) {
    console.log('Serializing user:', user);
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    console.log('Deserializing user:', user);
    done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET_HERE',
    callbackURL: "/auth/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        console.log('Google OAuth callback received');
        console.log('Profile:', profile);

        let user = {
            'email': profile.emails ? profile.emails[0].value : 'unknown@example.com',
            'name': profile.name ? profile.name.givenName + ' ' + profile.name.familyName : 'Unknown User',
            'id': profile.id,
            'token': accessToken,
            'provider': 'google'
        };

        console.log('Created user object:', user);

        // In a real application, you would:
        // 1. Check if user exists in your database
        // 2. Create new user if they don't exist
        // 3. Update existing user information if needed

        return done(null, user);
    }));

// Root route with authentication status
app.get('/', (req, res) => {
    const isAuthenticated = req.isAuthenticated();
    console.log('Root route accessed, authenticated:', isAuthenticated);

    res.send(`
        <h1>🔐 OAuth Login Demo - Exercise 23</h1>
        <h2>Authentication Status</h2>
        ${isAuthenticated ?
            `<p>✅ <strong>You are logged in!</strong></p>
             <p><strong>User Info:</strong></p>
             <pre>${JSON.stringify(req.user, null, 2)}</pre>
             <p><a href="/logout">🔓 Logout</a></p>
             <p><a href="/profile">👤 View Profile</a></p>`
            :
            `<p>❌ You are not logged in.</p>
             <p><a href="/auth/google">🔒 Login with Google</a></p>`
        }
        <hr>
        <h3>Available Endpoints:</h3>
        <ul>
            <li><a href="/auth/google">GET /auth/google</a> - Start Google OAuth</li>
            <li><a href="/profile">GET /profile</a> - View user profile (protected)</li>
            <li><a href="/logout">GET /logout</a> - Logout user</li>
            <li><a href="/status">GET /status</a> - Check authentication status</li>
        </ul>
        <hr>
        <p><small>Make sure to set up your Google OAuth credentials in the Google Console!</small></p>
    `);
});

// Start Google OAuth authentication
app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login', 'email', 'profile']
}));

// Google OAuth callback
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/success',
        failureRedirect: '/failure'
    })
);

// Success page after OAuth
app.get('/success', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }

    res.send(`
        <h1>🎉 Login Successful!</h1>
        <p>Welcome, <strong>${req.user.name}</strong>!</p>
        <p>Email: ${req.user.email}</p>
        <p>Provider: ${req.user.provider}</p>
        <p><a href="/">🏠 Go to Home</a></p>
        <p><a href="/profile">👤 View Full Profile</a></p>
        <p><a href="/logout">🔓 Logout</a></p>
        
        <script>
            // In a real app, this might redirect to the main application
            setTimeout(function() {
                window.location.href = '/';
            }, 3000);
        </script>
    `);
});

// Failure page
app.get('/failure', (req, res) => {
    res.send(`
        <h1>❌ Login Failed</h1>
        <p>Authentication with Google failed.</p>
        <p><a href="/">🏠 Go to Home</a></p>
        <p><a href="/auth/google">🔄 Try Again</a></p>
    `);
});

// Protected profile route
app.get('/profile', isAuthenticated, (req, res) => {
    res.send(`
        <h1>👤 User Profile</h1>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <h2>${req.user.name}</h2>
            <p><strong>Email:</strong> ${req.user.email}</p>
            <p><strong>ID:</strong> ${req.user.id}</p>
            <p><strong>Provider:</strong> ${req.user.provider}</p>
            <p><strong>Access Token:</strong> ${req.user.token ? 'Available (hidden for security)' : 'Not available'}</p>
        </div>
        <p><a href="/">🏠 Go to Home</a></p>
        <p><a href="/logout">🔓 Logout</a></p>
        
        <h3>Raw User Data:</h3>
        <pre style="background: #eee; padding: 10px; border-radius: 4px; overflow-x: auto;">
${JSON.stringify(req.user, null, 2)}
        </pre>
    `);
});

// Authentication status endpoint
app.get('/status', (req, res) => {
    res.json({
        authenticated: req.isAuthenticated(),
        user: req.isAuthenticated() ? req.user : null,
        session: req.session.id
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Error during logout');
        }
        req.session.destroy(function (err) {
            if (err) {
                console.error('Session destroy error:', err);
            }
            res.redirect('/');
        });
    });
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send(`
        <h1>🔒 Access Denied</h1>
        <p>You must be logged in to view this page.</p>
        <p><a href="/auth/google">🔑 Login with Google</a></p>
        <p><a href="/">🏠 Go to Home</a></p>
    `);
}

// API endpoints for frontend integration
app.get('/api/user', isAuthenticated, (req, res) => {
    res.json({
        success: true,
        user: {
            name: req.user.name,
            email: req.user.email,
            id: req.user.id,
            provider: req.user.provider
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        oauth: {
            google_configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
            environment: process.env.NODE_ENV || 'development'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    res.status(500).send(`
        <h1>❌ Internal Server Error</h1>
        <p>Something went wrong: ${err.message}</p>
        <p><a href="/">🏠 Go to Home</a></p>
    `);
});

// 404 handler
app.use((req, res) => {
    res.status(404).send(`
        <h1>🔍 Page Not Found</h1>
        <p>The requested page does not exist.</p>
        <p><a href="/">🏠 Go to Home</a></p>
    `);
});

// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    const addr = server.address();
    console.log('🔐 OAuth Login Server Starting...');
    console.log('=====================================');
    console.log(`📡 Server listening at http://${addr.address}:${addr.port}`);
    console.log('🔑 OAuth Endpoints:');
    console.log('   GET  /auth/google           - Start Google OAuth');
    console.log('   GET  /auth/google/callback  - Google OAuth callback');
    console.log('   GET  /profile               - View profile (protected)');
    console.log('   GET  /logout                - Logout user');
    console.log('   GET  /status                - Check auth status');
    console.log('=====================================');

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.log('⚠️  WARNING: Google OAuth credentials not configured!');
        console.log('   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables');
        console.log('   or update the clientID and clientSecret in the GoogleStrategy');
    } else {
        console.log('✅ Google OAuth credentials configured');
    }
    console.log('=====================================');
});

module.exports = server;