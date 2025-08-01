#!/bin/bash

echo "🛡️ InfraMind AI Ops Guardian Angel - Connectivity Test"
echo "======================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test service
test_service() {
    local name=$1
    local url=$2
    local endpoint=$3
    
    echo -n "Testing $name... "
    response=$(curl -s "$url$endpoint" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$response" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        echo "   Response: $response" | head -c 100
        echo "..."
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    echo ""
}

# Function to test API endpoint
test_api() {
    local name=$1
    local url=$2
    local method=$3
    local data=$4
    
    echo -n "Testing $name API... "
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$url" -H "Content-Type: application/json" -d "$data" 2>/dev/null)
    else
        response=$(curl -s "$url" 2>/dev/null)
    fi
    
    if [ $? -eq 0 ] && [ ! -z "$response" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        echo "   Response: $response" | head -c 100
        echo "..."
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    echo ""
}

echo -e "${BLUE}1. Backend Services Test${NC}"
echo "------------------------"
test_service "AI Services" "http://localhost:8001" "/health"
test_service "API Gateway" "http://localhost:3001" "/health"
test_service "Data Services" "http://localhost:8003" "/health"

echo -e "${BLUE}2. Frontend Test${NC}"
echo "----------------"
test_service "Frontend" "http://localhost:5173" ""

echo -e "${BLUE}3. API Integration Test${NC}"
echo "------------------------"
test_api "Chat API" "http://localhost:8001/chat" "POST" '{"message":"Hello, test message","user_id":"test_user"}'
test_api "Agents Status" "http://localhost:8001/agents/status" "GET" ""
test_api "Workflows" "http://localhost:8001/workflows/available" "GET" ""

echo -e "${BLUE}4. Cross-Origin Test${NC}"
echo "----------------------"
echo -n "Testing CORS headers... "
cors_test=$(curl -s -I -H "Origin: http://localhost:5173" http://localhost:8001/health 2>/dev/null | grep -i "access-control" || echo "No CORS headers")
if [[ $cors_test == *"access-control"* ]]; then
    echo -e "${GREEN}✅ CORS Configured${NC}"
else
    echo -e "${YELLOW}⚠️  CORS may need configuration${NC}"
fi
echo ""

echo -e "${BLUE}5. Service Ports Check${NC}"
echo "------------------------"
echo "Checking if services are listening on correct ports:"
netstat -an 2>/dev/null | grep LISTEN | grep -E "(8001|3001|8003|5173)" | while read line; do
    echo "   $line"
done

echo ""
echo -e "${BLUE}6. Browser Test Instructions${NC}"
echo "--------------------------------"
echo "To test the complete application:"
echo "1. Open browser and go to: http://localhost:5173"
echo "2. Try to register/login"
echo "3. Test the AI chat interface"
echo "4. Check the dashboard functionality"
echo ""

echo -e "${GREEN}✅ Connectivity test completed!${NC}"
echo ""
echo "If all services show ✅ OK, your InfraMind platform is ready!"
echo "If you see ❌ FAILED, check the service logs and restart the failed service." 