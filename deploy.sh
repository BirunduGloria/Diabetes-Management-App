#!/bin/bash

# Diabetes Management App - Automated Deployment Script
echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd client
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Go back to root
cd ..

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🎉 Your app should be live at your Vercel URL"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
