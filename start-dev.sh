#!/bin/bash

echo "🚀 Starting GlobalVoice Nexus Development Environment"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env and add your API keys before continuing!${NC}"
    echo ""
    echo "Required keys:"
    echo "  - OPENAI_API_KEY (get from https://platform.openai.com/api-keys)"
    echo "  - TWILIO credentials (optional, for phone calls)"
    echo ""
    read -p "Press Enter after you've added your API keys to .env..."
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $1 is already in use${NC}"
        echo "   Run: lsof -i :$1 to see what's using it"
        return 1
    fi
    return 0
}

# Check ports
echo "🔍 Checking if ports are available..."
check_port 3000 || exit 1
check_port 3001 || exit 1
check_port 8001 || exit 1
echo -e "${GREEN}✓ All ports available${NC}"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi
cd ..

# Install NLP engine dependencies
echo "📦 Installing NLP engine dependencies..."
cd nlp-engine
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
deactivate
cd ..

echo ""
echo -e "${GREEN}✅ All dependencies installed!${NC}"
echo ""
echo "=================================================="
echo "🎯 Starting services..."
echo "=================================================="
echo ""
echo "Backend API will run on:    http://localhost:3001"
echo "NLP Engine will run on:     http://localhost:8001"
echo "Frontend will run on:       http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start backend in background
echo "🔧 Starting Backend API..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start NLP engine in background
echo "🧠 Starting NLP Engine..."
cd nlp-engine
source venv/bin/activate
python -m uvicorn main:app --reload --port 8001 > ../logs/nlp.log 2>&1 &
NLP_PID=$!
deactivate
cd ..

# Wait a bit for NLP engine to start
sleep 3

# Start frontend in background
echo "🎨 Starting Frontend..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check if services are running
echo ""
echo "🔍 Checking service health..."

# Check backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is running${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API may still be starting...${NC}"
fi

# Check NLP engine
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ NLP Engine is running${NC}"
else
    echo -e "${YELLOW}⚠️  NLP Engine may still be starting...${NC}"
fi

# Check frontend (just check if process is running)
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend may still be starting...${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 GlobalVoice Nexus is starting up!${NC}"
echo "=================================================="
echo ""
echo "📱 Open your browser and go to:"
echo -e "   ${GREEN}http://localhost:3000${NC}"
echo ""
echo "📋 View logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   NLP:      tail -f logs/nlp.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   Press Ctrl+C or run: ./stop-dev.sh"
echo ""

# Create stop script
cat > stop-dev.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping GlobalVoice Nexus..."
pkill -f "npm run dev"
pkill -f "uvicorn main:app"
pkill -f "vite"
echo "✅ All services stopped"
EOF
chmod +x stop-dev.sh

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID $NLP_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Keep script running and show logs
echo "📊 Showing combined logs (Ctrl+C to stop):"
echo "=================================================="
tail -f logs/*.log 2>/dev/null
