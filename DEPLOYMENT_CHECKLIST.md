# 🚀 Quizzyfy Deployment Checklist

## Pre-Deployment ✅

- [ ] Code pushed to GitHub
- [ ] All changes committed
- [ ] Repository is public or connected to Render/Vercel

## Backend Deployment (Render) ✅

- [ ] Created Render account
- [ ] Created new Web Service
- [ ] Connected GitHub repository
- [ ] Set Root Directory: `backend`
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Added environment variable: `NODE_ENV=production`
- [ ] Deployed successfully
- [ ] Noted backend URL: `https://your-app-name.onrender.com`
- [ ] Tested health endpoint: `/api/health`

## Frontend Deployment (Vercel) ✅

- [ ] Created Vercel account
- [ ] Imported GitHub repository
- [ ] Set Root Directory: `frontend`
- [ ] Added environment variable: `NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com`
- [ ] Deployed successfully
- [ ] Noted frontend URL: `https://your-app.vercel.app`

## Post-Deployment Updates ✅

- [ ] Updated backend CORS with Vercel URL
- [ ] Committed and pushed CORS changes
- [ ] Backend redeployed automatically

## Testing ✅

- [ ] Frontend loads correctly
- [ ] Backend health check works
- [ ] Can create a new quiz
- [ ] Can join a quiz with PIN
- [ ] Real-time functionality works
- [ ] Answer validation works correctly
- [ ] Leaderboard updates in real-time

## Production Ready ✅

- [ ] Both services are running
- [ ] No console errors
- [ ] CORS issues resolved
- [ ] Environment variables set correctly
- [ ] Custom domain added (optional)
- [ ] Monitoring set up (optional)

## Your Live URLs

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app-name.onrender.com`
- **Health Check**: `https://your-app-name.onrender.com/api/health`

---

**🎉 Congratulations! Your Quizzyfy app is live!**
