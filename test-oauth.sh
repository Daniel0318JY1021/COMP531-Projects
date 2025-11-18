#!/bin/bash

echo "🔐 OAuth Login Server Test"
echo "========================="

# Start server in background
echo "Starting OAuth server..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo "Testing endpoints..."

# Test root endpoint
echo "✅ Testing GET /"
curl -s http://localhost:3000/ > /dev/null && echo "   Root endpoint: OK" || echo "   Root endpoint: FAIL"

# Test health endpoint
echo "✅ Testing GET /health"
HEALTH_RESULT=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_RESULT" | grep -q "OK"; then
  echo "   Health endpoint: OK"
else
  echo "   Health endpoint: FAIL"
fi

# Test OAuth start endpoint
echo "✅ Testing GET /auth/google"
AUTH_RESULT=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/auth/google)
if [ "$AUTH_RESULT" = "302" ]; then
  echo "   OAuth start endpoint: OK (redirects to Google)"
else
  echo "   OAuth start endpoint: FAIL (should redirect)"
fi

# Test status endpoint
echo "✅ Testing GET /status"
STATUS_RESULT=$(curl -s http://localhost:3000/status)
if echo "$STATUS_RESULT" | grep -q "authenticated"; then
  echo "   Status endpoint: OK"
else
  echo "   Status endpoint: FAIL"
fi

# Test protected endpoint (should fail without auth)
echo "✅ Testing GET /profile (should require auth)"
PROFILE_RESULT=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/profile)
if [ "$PROFILE_RESULT" = "401" ]; then
  echo "   Protected endpoint: OK (requires authentication)"
else
  echo "   Protected endpoint: FAIL (should require auth)"
fi

# Cleanup
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null
sleep 1

echo ""
echo "🎉 OAuth server test completed!"
echo ""
echo "Next steps:"
echo "1. Set up Google OAuth credentials"
echo "2. Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
echo "3. Run 'npm start' and test OAuth flow manually"
echo "4. Visit http://localhost:3000 to test"