#!/bin/bash
# Start both the Node.js server and Python agent worker in parallel

# Run the Node.js server
NODE_ENV=development npx tsx server/index.ts &
SERVER_PID=$!

# Wait a moment for the server to start
sleep 2

# Run the Python agent worker
python agent_worker.py dev &
AGENT_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Shutting down..."
    kill $SERVER_PID $AGENT_PID 2>/dev/null
    exit
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Wait for either process to exit
wait -n

# If one exits, cleanup everything
cleanup
