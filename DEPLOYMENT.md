# Quizzyfy Deployment Guide

This guide will help you deploy the Quizzyfy application to production.

## Architecture

- **Frontend**: Next.js app deployed to Vercel
- **Backend**: Node.js/Express with Socket.IO deployed to Railway/Render/Heroku

## Step 1: Deploy Backend

### Option A: Railway (Recommended)

1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect it's a Node.js app
6. Set the following environment variables:
   - `PORT` (Railway will set this automatically)
   - `NODE_ENV=production`
7. Deploy!

### Option B: Render

1. Go to [Render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Set build command: `cd backend && npm install`
6. Set start command: `cd backend && npm start`
7. Deploy!

### Option C: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Deploy: `git subtree push --prefix backend heroku main`

## Step 2: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project" → "Import Git Repository"
4. Select your repository
5. Set the following environment variables:
   - `NEXT_PUBLIC_BACKEND_URL` = `https://your-backend-url.railway.app` (or your backend URL)
6. Deploy!

## Step 3: Update Backend CORS

After deploying the frontend, update the backend CORS settings:

1. Go to your backend deployment dashboard
2. Update the CORS origin to include your Vercel URL:
   ```javascript
   cors: {
     origin: ["https://your-app.vercel.app", "http://localhost:3000"],
     methods: ["GET", "POST"],
     credentials: true
   }
   ```

## Step 4: Test the Deployment

1. Visit your Vercel URL
2. Create a new quiz
3. Join the game from another browser/device
4. Test the real-time functionality

## Environment Variables

### Frontend (Vercel)
- `NEXT_PUBLIC_BACKEND_URL`: Your backend deployment URL

### Backend (Railway/Render/Heroku)
- `PORT`: Server port (usually set automatically)
- `NODE_ENV`: Set to `production`

## Troubleshooting

### CORS Issues
- Make sure your backend CORS settings include your Vercel domain
- Check that the backend URL is correct in frontend environment variables

### Socket.IO Connection Issues
- Verify the backend is running and accessible
- Check browser console for connection errors
- Ensure WebSocket connections are allowed by your hosting provider

### Build Issues
- Make sure all dependencies are in package.json
- Check that the build commands are correct
- Verify Node.js version compatibility

## Production Optimizations

1. **Database**: Consider using Redis for game state persistence
2. **Scaling**: Use Redis adapter for Socket.IO clustering
3. **Monitoring**: Add logging and error tracking
4. **Security**: Implement rate limiting and input validation
5. **Performance**: Add caching and optimize bundle size
