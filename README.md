# Quizzyfy

Quizzyfy is a modern, real-time multiplayer trivia and quiz application inspired by platforms like Kahoot!. It allows hosts to easily create interactive quizzes that players can join instantly using a unique game PIN, keeping track of scores and live leaderboards in real-time.

## ✨ Features & Functionality

- **Live Multiplayer Gameplay**: Real-time connections using WebSockets provide instant updates for answering questions, timer countdowns, and displaying results.
- **Host Dashboard**:
  - Quickly create custom quizzes with varied questions.
  - Launch a lobby and monitor joining players in real-time.
  - Advance the game question-by-question, maintaining the flow of the session.
- **Player Interface**: 
  - Join games simply by entering a Game PIN and a nickname.
  - A fast, reactive UI for selecting answers before the timer runs out.
- **Dynamic Leaderboards**: View real-time score updates and rankings between each round, keeping the competition fierce.
- **Modern, Mobile-First Design**: Fully responsive interface built with smooth, fluid animations for the best user experience on both desktop and mobile devices.

## 🛠️ Tech Stack

**Frontend (Client)**
- **Framework**: [Next.js 14](https://nextjs.org/) (React framework)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for fast, utility-first styling
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for declarative, stunning UI transitions
- **Real-Time Communication**: [Socket.IO Client](https://socket.io/)
- **Icons**: [Lucide React](https://lucide.dev/)

**Backend (Server)**
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/) for HTTP routing
- **WebSocket Server**: [Socket.IO](https://socket.io/) for high-performance bidirectional event-based communication
- **Utilities**: [UUID](https://github.com/uuidjs/uuid) for unique room and player identifiers, and CORS for cross-origin security.

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/quizzyfy.git
cd quizzyfy
```

### 2. Start the Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Start the Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Your app will be running at `http://localhost:3000`.

---

# 🌐 Render Deployment Guide

This guide will walk you through deploying your Quizzyfy application using Render.com and Vercel.

## Prerequisites

- GitHub account
- Render account (sign up at [render.com](https://render.com))
- Your code pushed to GitHub

## Step 1: Prepare Your Repository

### 1.1 Push Your Code to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 1.2 Verify Your Repository Structure

Your repository should look like this:
```
quizzyfy/
├── frontend/          # Next.js app
├── backend/           # Node.js/Express app
├── package.json       # Root package.json
├── vercel.json        # Vercel config (for frontend)
└── README.md
```

## Step 2: Deploy Backend to Render

### 2.1 Create New Web Service

1. Go to [render.com](https://render.com)
2. Sign up/Login with your GitHub account
3. Click **"New +"** → **"Web Service"**
4. Click **"Connect GitHub"** if not already connected
5. Select your repository: `quizzyfy`

### 2.2 Configure Backend Service

Fill in the following details:

**Basic Settings:**
- **Name**: `quizzyfy-backend` (or any name you prefer)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`

**Build & Deploy:**
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Node Version**: `18` (or latest)
- **Auto-Deploy**: `Yes` (deploys automatically on git push)

### 2.3 Environment Variables

Click **"Environment"** tab and add:
- `NODE_ENV` = `production`
- `PORT` = (Render will set this automatically)

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://your-app-name.onrender.com`

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"New Project"**

### 3.2 Import Repository

1. Select your `quizzyfy` repository
2. Click **"Import"**

### 3.3 Configure Frontend

**Project Settings:**
- **Framework Preset**: `Next.js`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

**Environment Variables:**
- `NEXT_PUBLIC_BACKEND_URL` = `https://your-app-name.onrender.com` (your backend URL from Step 2)

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (2-3 minutes)
3. Note your frontend URL: `https://your-app.vercel.app`

## Step 4: Update Backend CORS (Important!)

After getting your Vercel URL, you need to update the backend CORS settings:

### 4.1 Update Backend Code

1. Go to your local repository
2. Edit `backend/server.js`
3. Find the CORS configuration (around line 10)
4. Update it to include your Vercel URL:

```javascript
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://127.0.0.1:3000",
      "https://your-app.vercel.app",  // Add your Vercel URL here
      "https://*.vercel.app",
      "https://*.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### 4.2 Redeploy Backend

```bash
git add .
git commit -m "Update CORS for production"
git push origin main
```

Render will automatically redeploy your backend.

## Step 5: Test Your Deployment

### 5.1 Test Frontend

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should see the Quizzyfy homepage

### 5.2 Test Backend

1. Visit your backend health endpoint: `https://your-app-name.onrender.com/api/health`
2. You should see: `{"status":"OK","games":1}`

### 5.3 Test Full Application

1. Open your Vercel URL in one browser tab
2. Click "Host a Quiz" → "Create New Quiz"
3. Create a simple quiz with 2-3 questions
4. Start the game and note the PIN
5. Open another browser tab/window
6. Go to your Vercel URL again
7. Click "Join a Quiz" and enter the PIN
8. Test the real-time functionality

## Step 6: Troubleshooting

### Common Issues:

**CORS Errors:**
- Make sure your Vercel URL is added to the backend CORS settings
- Check browser console for specific error messages

**Socket Connection Failed:**
- Verify the `NEXT_PUBLIC_BACKEND_URL` environment variable is correct
- Check that your backend is running (visit the health endpoint)

**Build Failures:**
- Check the Render logs for specific error messages
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

**Environment Variables:**
- Double-check that all environment variables are set correctly
- Make sure there are no typos in variable names

### Debugging Steps:

1. **Check Render Logs:**
   - Go to your Render dashboard
   - Click on your backend service
   - Click "Logs" tab
   - Look for any error messages

2. **Check Vercel Logs:**
   - Go to your Vercel dashboard
   - Click on your project
   - Click "Functions" tab
   - Check for any build errors

3. **Test Backend Directly:**
   - Visit `https://your-backend-url.onrender.com/api/health`
   - Should return `{"status":"OK","games":1}`

## Step 7: Production Optimizations

### 7.1 Add Custom Domain (Optional)

**For Frontend (Vercel):**
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Settings" → "Domains"
4. Add your custom domain

**For Backend (Render):**
1. Go to Render dashboard
2. Click on your backend service
3. Go to "Settings" → "Custom Domains"
4. Add your custom domain

### 7.2 Monitor Performance

- Use Render's built-in monitoring
- Add logging to track usage
- Monitor WebSocket connections

### 7.3 Security Considerations

- Add rate limiting to prevent abuse
- Implement input validation
- Consider adding authentication
- Use HTTPS (enabled by default on both platforms)

## Your URLs

After successful deployment, you'll have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app-name.onrender.com`
- **Health Check**: `https://your-app-name.onrender.com/api/health`

## Next Steps

1. Share your quiz app with friends!
2. Consider adding more features
3. Monitor usage and performance
4. Add a custom domain if desired

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Render and Vercel documentation
3. Check browser console for errors
4. Verify all environment variables are set correctly

---

**Congratulations! Your Quizzyfy app is now live on the internet! 🎉**
