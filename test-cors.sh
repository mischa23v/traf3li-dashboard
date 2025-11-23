#!/bin/bash

# CORS Testing Script for Traf3li
# Tests the backend API CORS configuration directly (no Cloudflare, no Nginx)

BACKEND="https://api.traf3li.com"
FRONTEND="https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app"

echo "=========================================="
echo "🧪 CORS Configuration Test"
echo "=========================================="
echo ""
echo "Backend:  $BACKEND"
echo "Frontend: $FRONTEND"
echo ""

# Test 1: Health Check Endpoint
echo "=========================================="
echo "Test 1: Health Check Endpoint"
echo "=========================================="
echo "Testing: GET $BACKEND/health"
echo ""
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BACKEND/health" 2>&1)
HTTP_STATUS=$(echo "$HEALTH_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Status: $HTTP_STATUS (OK)"
    echo "Response: $RESPONSE_BODY"
else
    echo "❌ Status: $HTTP_STATUS (FAILED)"
    echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 2: CORS Preflight Request (OPTIONS)
echo "=========================================="
echo "Test 2: CORS Preflight Request (OPTIONS)"
echo "=========================================="
echo "Testing: OPTIONS $BACKEND/api/auth/me"
echo "Origin: $FRONTEND"
echo ""

PREFLIGHT_HEADERS=$(curl -s -I \
    -H "Origin: $FRONTEND" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    "$BACKEND/api/auth/me" 2>&1)

echo "$PREFLIGHT_HEADERS"
echo ""

# Check for CORS headers
if echo "$PREFLIGHT_HEADERS" | grep -i "Access-Control-Allow-Origin" > /dev/null; then
    echo "✅ Access-Control-Allow-Origin header present"
    ALLOW_ORIGIN=$(echo "$PREFLIGHT_HEADERS" | grep -i "Access-Control-Allow-Origin" | cut -d':' -f2- | tr -d '\r')
    echo "   Value:$ALLOW_ORIGIN"
else
    echo "❌ Access-Control-Allow-Origin header MISSING"
fi

if echo "$PREFLIGHT_HEADERS" | grep -i "Access-Control-Allow-Credentials: true" > /dev/null; then
    echo "✅ Access-Control-Allow-Credentials: true"
else
    echo "❌ Access-Control-Allow-Credentials header MISSING or not 'true'"
fi

if echo "$PREFLIGHT_HEADERS" | grep -i "Access-Control-Allow-Methods" > /dev/null; then
    echo "✅ Access-Control-Allow-Methods header present"
    ALLOW_METHODS=$(echo "$PREFLIGHT_HEADERS" | grep -i "Access-Control-Allow-Methods" | cut -d':' -f2- | tr -d '\r')
    echo "   Value:$ALLOW_METHODS"
else
    echo "❌ Access-Control-Allow-Methods header MISSING"
fi
echo ""

# Test 3: Actual GET Request with Origin
echo "=========================================="
echo "Test 3: Actual GET Request with CORS"
echo "=========================================="
echo "Testing: GET $BACKEND/health"
echo "Origin: $FRONTEND"
echo ""

CORS_HEADERS=$(curl -s -I \
    -H "Origin: $FRONTEND" \
    -H "Content-Type: application/json" \
    "$BACKEND/health" 2>&1)

echo "$CORS_HEADERS"
echo ""

if echo "$CORS_HEADERS" | grep -i "Access-Control-Allow-Origin" > /dev/null; then
    echo "✅ CORS headers present on GET request"
else
    echo "❌ CORS headers MISSING on GET request"
fi
echo ""

# Test 4: Check Backend Server Status
echo "=========================================="
echo "Test 4: Backend Server Status"
echo "=========================================="
echo "Checking if server is responding..."
echo ""

SERVER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND/health" 2>&1)

case $SERVER_RESPONSE in
    200)
        echo "✅ Server is running (HTTP $SERVER_RESPONSE)"
        ;;
    000)
        echo "❌ Cannot connect to server (Network error)"
        echo "   - Check if backend is running"
        echo "   - Check if domain resolves correctly"
        ;;
    403)
        echo "⚠️  Server returned 403 Forbidden"
        echo "   - This means the server is running but blocking requests"
        echo "   - Possible causes:"
        echo "     1. CORS middleware not configured"
        echo "     2. Backend code not deployed"
        echo "     3. Firewall/WAF blocking requests"
        ;;
    404)
        echo "⚠️  Server returned 404 Not Found"
        echo "   - Endpoint might not exist"
        echo "   - Check API routes configuration"
        ;;
    500|502|503|504)
        echo "❌ Server error (HTTP $SERVER_RESPONSE)"
        echo "   - Backend is having issues"
        echo "   - Check server logs"
        ;;
    *)
        echo "⚠️  Unexpected response: HTTP $SERVER_RESPONSE"
        ;;
esac
echo ""

# Summary
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo ""

if [ "$HTTP_STATUS" = "200" ] && echo "$PREFLIGHT_HEADERS" | grep -i "Access-Control-Allow-Origin" > /dev/null; then
    echo "✅ CORS is configured correctly!"
    echo ""
    echo "Next steps:"
    echo "  1. Test login from your Vercel app"
    echo "  2. Check browser console for any errors"
    echo "  3. Verify cookies are being set"
elif [ "$HTTP_STATUS" = "403" ]; then
    echo "❌ Backend is blocking requests (403 Forbidden)"
    echo ""
    echo "This means:"
    echo "  • Backend server is running"
    echo "  • But CORS configuration is NOT active"
    echo ""
    echo "Required actions:"
    echo "  1. Deploy the CORS configuration to backend"
    echo "  2. Ensure src/server.js has the CORS middleware"
    echo "  3. Restart the backend server"
    echo "  4. Run this test again"
else
    echo "❌ CORS is NOT configured"
    echo ""
    echo "Required actions:"
    echo "  1. Verify backend server is running"
    echo "  2. Deploy CORS configuration to backend"
    echo "  3. Restart backend server"
    echo "  4. Run this test again"
fi

echo ""
echo "=========================================="
echo "For detailed configuration guide, see:"
echo "  ./BACKEND_CORS_CONFIG.md"
echo "=========================================="
