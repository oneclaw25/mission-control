#!/bin/bash
echo "🚀 Starting Mission Control..."
echo ""
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔧 Starting NextJS development server..."
echo "📱 Open http://localhost:3000 in your browser"
echo ""
npm run dev
