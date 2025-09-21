#!/bin/bash

echo "🚀 Quizzyfy Deployment Script"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Deployment Options:"
echo "1. Deploy Frontend to Vercel"
echo "2. Deploy Backend to Railway"
echo "3. Deploy Backend to Render"
echo "4. Deploy Backend to Heroku"
echo "5. Deploy Both (Frontend + Backend)"

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo "🎨 Deploying Frontend to Vercel..."
        echo "1. Go to https://vercel.com"
        echo "2. Import your GitHub repository"
        echo "3. Set environment variable: NEXT_PUBLIC_BACKEND_URL=https://your-backend-url"
        echo "4. Deploy!"
        ;;
    2)
        echo "🚂 Deploying Backend to Railway..."
        echo "1. Go to https://railway.app"
        echo "2. Create new project from GitHub"
        echo "3. Select your repository"
        echo "4. Railway will auto-detect Node.js"
        echo "5. Deploy!"
        ;;
    3)
        echo "🎨 Deploying Backend to Render..."
        echo "1. Go to https://render.com"
        echo "2. Create new Web Service"
        echo "3. Connect GitHub repository"
        echo "4. Set build command: cd backend && npm install"
        echo "5. Set start command: cd backend && npm start"
        echo "6. Deploy!"
        ;;
    4)
        echo "🟣 Deploying Backend to Heroku..."
        echo "1. Install Heroku CLI"
        echo "2. Run: heroku login"
        echo "3. Run: heroku create your-app-name"
        echo "4. Run: heroku buildpacks:set heroku/nodejs"
        echo "5. Run: git subtree push --prefix backend heroku main"
        ;;
    5)
        echo "🚀 Deploying Both Frontend and Backend..."
        echo ""
        echo "Step 1: Deploy Backend first"
        echo "1. Go to https://railway.app"
        echo "2. Create new project from GitHub"
        echo "3. Select your repository"
        echo "4. Deploy!"
        echo ""
        echo "Step 2: Deploy Frontend"
        echo "1. Go to https://vercel.com"
        echo "2. Import your GitHub repository"
        echo "3. Set NEXT_PUBLIC_BACKEND_URL to your Railway URL"
        echo "4. Deploy!"
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-5."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment instructions provided!"
echo "📖 For detailed instructions, see DEPLOYMENT.md"
